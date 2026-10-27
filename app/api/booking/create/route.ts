import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cleanPhone } from '@/lib/auth/otp';
import { SlotService } from '@/services/slot';
import { trDateString, trDayOfWeek, trHHMM } from '@/lib/tz';
import { findAuthUserIdByEmail } from '@/lib/auth/lookup';
import { sendAppointmentSMS } from '@/lib/messaging/sms';
import { IyzicoLinkService } from '@/lib/payment/iyzico-link';
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { sendEmail, renderAppointmentConfirmation } from '@/lib/messaging/email';

const bookingRateLimit = new Map<string, { count: number; resetTime: number }>();

function checkBookingRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = bookingRateLimit.get(userId);
  if (!entry || now > entry.resetTime) {
    bookingRateLimit.set(userId, { count: 1, resetTime: now + 60 * 1000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  // IP tabanlı rate limit (5 istek / 60 sn) — bot/spam koruması, user-id limitiyle birlikte çalışır
  const ip = getClientIp(request);
  const ipLimit = await rateLimit(`booking:${ip}`, 5, 60_000);
  if (!ipLimit.success) return rateLimitResponse(ipLimit.reset);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll() { } // We don't need to set cookies here, just read them
      },
    }
  );

  try {
    // 1. Get Current User
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Oturum bulunamadı. Lütfen tekrar giriş yapın.' }, { status: 401 });
    }

    if (!checkBookingRateLimit(user.id)) {
      return NextResponse.json({ error: 'Çok fazla randevu isteği. Lütfen 1 dakika bekleyin.' }, { status: 429 });
    }

    const body = await request.json();
    const { appointmentId, customerName, email, notes, salonId, serviceId, startTime, couponCode, campaignRuleId } = body;
    // several services may be booked together; serviceId is the legacy single-service field
    const serviceIds: string[] = Array.isArray(body.serviceIds) && body.serviceIds.length > 0
      ? Array.from(new Set<string>(body.serviceIds.filter((x: unknown): x is string => typeof x === 'string')))
      : (serviceId ? [serviceId] : []);
    let staffId: string = body.staffId;
    // price inputs are never trusted from the client (deposit is recomputed below)
    const participantCount = Number.isInteger(body.participantCount) && body.participantCount >= 1 && body.participantCount <= 20
      ? body.participantCount
      : 1;

    if (!customerName || !salonId || !staffId || serviceIds.length === 0 || serviceIds.length > 10 || !startTime) {
      return NextResponse.json({ error: 'Eksik bilgi.' }, { status: 400 });
    }

    // 2. Contact email: only replaces a phone-signup placeholder, and only with an
    //    address no other account owns. Not confirmed here — GoTrue confirmation applies.
    const isPlaceholder = /@(pending|phone)\.user$/.test(user.email || '');
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (isPlaceholder && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      if (!(await findAuthUserIdByEmail(cleanEmail))) {
        const { error: updateEmailError } = await supabaseAdmin.auth.admin.updateUserById(user.id, { email: cleanEmail });
        if (updateEmailError) console.warn('Placeholder email update failed:', updateEmailError.message);
      }
    }

    // Name/phone only — role is never written here (an owner booking stays an owner)
    await supabaseAdmin.from('profiles').update({
      first_name: customerName.split(' ')[0],
      last_name: customerName.split(' ').slice(1).join(' '),
      phone: user.phone,
      updated_at: new Date().toISOString()
    }).eq('id', user.id);

    const startDate = new Date(startTime);
    if (Number.isNaN(startDate.getTime())) {
      return NextResponse.json({ error: 'Geçersiz randevu zamanı.' }, { status: 400 });
    }

    // 3. Services must belong to this salon; duration & price are the sum of all of them
    const [{ data: services }, { data: salonRow }] = await Promise.all([
      supabaseAdmin.from('salon_services').select('id, duration_min, price, global_services(name)').in('id', serviceIds).eq('salon_id', salonId),
      supabaseAdmin.from('salons').select('deposit_rate').eq('id', salonId).maybeSingle(),
    ]);
    if (!services || services.length !== serviceIds.length || !salonRow) {
      return NextResponse.json({ error: 'Hizmet bulunamadı' }, { status: 404 });
    }
    const ordered = serviceIds.map((sid) => services.find((x) => x.id === sid)!);
    const totalDuration = ordered.reduce((acc, x) => acc + (x.duration_min || 0), 0);
    const totalPrice = ordered.reduce((acc, x) => acc + Number(x.price || 0), 0);
    const serviceName = (x: (typeof ordered)[number]) =>
      (Array.isArray(x.global_services) ? x.global_services[0]?.name : (x.global_services as { name?: string } | null)?.name) || 'Hizmet';
    const primaryServiceId = ordered[0].id;
    const extraServicesNote = ordered.length > 1
      ? ` [Ek hizmetler: ${ordered.slice(1).map(serviceName).join(', ')}]`
      : '';

    // "Herhangi bir personel": the server picks a capable staff member free at that time
    if (staffId === 'any') {
      const slots = await SlotService.getAvailableSlots(
        { salonId, serviceIds, durationMin: totalDuration, date: startDate },
        supabaseAdmin,
      );
      const match = slots.find((sl) => sl.startTime.getTime() === startDate.getTime());
      if (!match) return NextResponse.json({ error: 'Bu saat dilimi dolu.' }, { status: 409 });
      staffId = match.staffId;
    }

    const { data: staffRow } = await supabaseAdmin
      .from('staff').select('id').eq('id', staffId).eq('salon_id', salonId).eq('is_active', true).maybeSingle();
    if (!staffRow) return NextResponse.json({ error: 'Personel bulunamadı' }, { status: 404 });

    // 4. Handle Coupon Validation
    const basePrice = totalPrice * participantCount;
    let discountAmount = 0;
    let validCoupon = null;

    if (couponCode) {
      const { data: coupon, error: couponError } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('salon_id', salonId)
        .eq('is_active', true)
        .single();

      if (couponError || !coupon) {
        return NextResponse.json({ error: 'Kupon kodu geçersiz veya bu salon için geçerli değil.' }, { status: 400 });
      }
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        return NextResponse.json({ error: 'Bu kuponun kullanım limiti dolmuştur.' }, { status: 400 });
      }
      if (coupon.end_date && new Date(coupon.end_date) < new Date()) {
        return NextResponse.json({ error: 'Bu kuponun süresi dolmuştur.' }, { status: 400 });
      }
      if (coupon.min_purchase_amount && basePrice < coupon.min_purchase_amount) {
        return NextResponse.json({
          error: `Bu kupon için minimum ${coupon.min_purchase_amount}₺ tutarında hizmet seçimi gereklidir.`
        }, { status: 400 });
      }

      validCoupon = coupon;
      if (coupon.discount_type === 'PERCENTAGE') {
        discountAmount = (basePrice * coupon.discount_value) / 100;
        if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
          discountAmount = coupon.max_discount_amount;
        }
      } else {
        discountAmount = coupon.discount_value;
      }
    }

    // 5. Handle Automatic Campaign Rule Validation
    let campaignDiscount = 0;
    if (campaignRuleId) {
      const { data: rule } = await supabaseAdmin
        .from('campaign_rules')
        .select('*')
        .eq('id', campaignRuleId)
        .eq('salon_id', salonId)
        .eq('is_active', true)
        .single();

      if (rule) {
        // Double check time/day — in Türkiye time (client sends UTC ISO strings)
        const dayOfWeek = trDayOfWeek(trDateString(startDate));
        const dbDay = dayOfWeek === 0 ? 7 : dayOfWeek;
        const appointmentTime = trHHMM(startDate); // "HH:mm"

        const dayMatch = !rule.days_of_week || rule.days_of_week.includes(dbDay);
        const timeMatch = !rule.start_time || (appointmentTime >= rule.start_time && appointmentTime <= rule.end_time);

        if (dayMatch && timeMatch) {
          if (rule.discount_type === 'PERCENTAGE') {
            campaignDiscount = (basePrice * rule.discount_value) / 100;
          } else {
            campaignDiscount = rule.discount_value;
          }
        }
      }
    }

    // Combined Discount (never more than the price)
    const totalDiscount = Math.min(discountAmount + campaignDiscount, basePrice);

    // Deposit = salon's deposit_rate of the discounted price (same formula as the booking UI)
    const depositAmount = Math.round(((basePrice - totalDiscount) * (salonRow.deposit_rate || 0)) / 100);

    const endDate = new Date(startDate.getTime() + totalDuration * 60 * 1000);

    // Validate that the appointment is not in the past
    // Buffer: Allow 1-2 minutes lag, but generally strict
    if (startDate < new Date()) {
      return NextResponse.json({ error: 'Geçmiş bir zamana randevu alınamaz.' }, { status: 400 });
    }

    // 4. Create or Update Appointment
    let appointment;
    let appointmentError;

    if (appointmentId) {
      // UPDATE EXISTING logic
      // First verify ownership and get existing details
      const { data: existingAppt } = await supabaseAdmin
        .from('appointments')
        .select('customer_id, staff_id, notes')
        .eq('id', appointmentId)
        .single();

      if (!existingAppt || existingAppt.customer_id !== user.id) {
        return NextResponse.json({ error: 'Bu randevuyu düzenleme yetkiniz yok.' }, { status: 403 });
      }

      // CASE: Staff Changed or explicit reschedule -> CANCEL old, CREATE new
      if (existingAppt.staff_id !== staffId) {
        // 1. Create the NEW appointment first — if it fails the customer keeps the old one
        const { data: newData, error: createError } = await supabaseAdmin
          .from('appointments')
          .insert({
            customer_id: user.id,
            customer_name: customerName,
            customer_phone: user.phone ? cleanPhone(user.phone) : '',
            salon_id: salonId,
            staff_id: staffId,
            salon_service_id: primaryServiceId,
            start_time: startDate.toISOString(),
            end_time: endDate.toISOString(),
            status: 'PENDING', // Mode B: salon onayı bekler (staff/owner approve eder)
            notes: (notes || '') + extraServicesNote + ` [${appointmentId} nolu randevudan planlandı]`,
            deposit_amount: depositAmount,
          })
          .select()
          .single();

        appointment = newData;
        appointmentError = createError;

        // 2. Only then cancel the old one
        if (!createError) {
          await supabaseAdmin
            .from('appointments')
            .update({
              status: 'CANCELLED',
              notes: (existingAppt.notes ? existingAppt.notes + ' ' : '') + '[Yeniden planlama nedeniyle iptal edildi]',
              updated_at: new Date().toISOString()
            })
            .eq('id', appointmentId);
        }

      } else {
        // CASE: Same Staff -> UPDATE existing
        const { data: updatedData, error: updateError } = await supabaseAdmin
          .from('appointments')
          .update({
            // staff_id: staffId, // Same staff, no need to change (or can update safely)
            salon_service_id: primaryServiceId,
            start_time: startDate.toISOString(),
            end_time: endDate.toISOString(),
            status: 'PENDING', // Mode B: salon onayı bekler (reschedule sonrası yeniden onay)
            notes: (notes || '') + extraServicesNote,
            coupon_code: validCoupon?.code || null,
            campaign_rule_id: campaignRuleId || null,
            discount_amount: totalDiscount,
            participant_count: participantCount,
            deposit_amount: depositAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', appointmentId)
          .select()
          .single();

        appointment = updatedData;
        appointmentError = updateError;
      }

    } else {
      // CREATE NEW
      const { data: newData, error: createError } = await supabaseAdmin
        .from('appointments')
        .insert({
          customer_id: user.id,
          customer_name: customerName,
          customer_phone: user.phone ? cleanPhone(user.phone) : '', // Clean phone for display
          salon_id: salonId,
          staff_id: staffId,
          salon_service_id: primaryServiceId,
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          status: 'PENDING', // Mode B: salon onayı bekler (yeni randevu PENDING başlar)
          notes: (notes || '') + extraServicesNote,
          coupon_code: validCoupon?.code || null,
          campaign_rule_id: campaignRuleId || null,
          discount_amount: totalDiscount,
          participant_count: participantCount,
          deposit_amount: depositAmount,
        })
        .select()
        .single();

      appointment = newData;
      appointmentError = createError;
    }

    if (appointmentError) {
      if (appointmentError.code === '23P01') {
        return NextResponse.json({ error: 'Bu saat dilimi dolu.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Randevu işleminiz gerçekleştirilemedi.' }, { status: 500 });
    }

    // 6. Finalize Coupon Usage
    if (validCoupon) {
      await supabaseAdmin.rpc('increment_coupon_usage', { p_coupon_id: validCoupon.id });
    }

    // 7. Marketplace Payment Link (Link API with Split Payment)
    let paymentUrl = null;
    try {
      // Check if salon has sub-merchant registration
      const { data: subMerchant } = await supabaseAdmin
        .from('salon_sub_merchants')
        .select('iyzico_sub_merchant_key, status')
        .eq('salon_id', salonId)
        .eq('status', 'ACTIVE')
        .maybeSingle();

      if (subMerchant?.iyzico_sub_merchant_key) {
        // Get platform commission rate
        const { data: commissionSetting } = await supabaseAdmin
          .from('platform_settings')
          .select('value')
          .eq('key', 'platform_commission_rate')
          .single();

        const commissionRate = (commissionSetting?.value as any)?.rate || 0;
        const fullPriceTL = basePrice - (totalDiscount || 0);
        // If depositRate > 0, we only charge for the depositAmount sent from client
        // Otherwise, if this logic is active, we might charge full price.
        // We stick to depositAmount if it's > 0, else fullPriceTL.
        const totalPriceTL = depositAmount > 0 ? depositAmount : fullPriceTL; 

        const commission = Math.round((totalPriceTL * commissionRate) / 100);
        const subMerchantPriceTL = totalPriceTL - commission;


        const serviceTitle = ordered.map(serviceName).join(' + ');

        const linkResult = await IyzicoLinkService.createLink({
          name: `${serviceTitle} Randevusu`,
          description: `${customerName} - ${startTime}`,
          price: totalPriceTL, // Link API uses unit (TRY)
          subMerchantKey: subMerchant.iyzico_sub_merchant_key,
          subMerchantPrice: subMerchantPriceTL
        });

        if (linkResult.status === 'success' && linkResult.url) {
          paymentUrl = linkResult.url;

          // Record in payment history
          await supabaseAdmin.from('payment_history').insert({
            salon_id: salonId,
            appointment_id: appointment.id,
            payment_type: 'APPOINTMENT',
            payment_method: 'IYZICO_LINK',
            amount: Math.round(totalPriceTL * 100), // Kuruş
            status: 'PENDING',
            iyzico_link_id: linkResult.token, // Link token
            metadata: {
              payment_url: paymentUrl,
              commission_rate: commissionRate,
              commission_amount_tl: commission,
              salon_share_tl: subMerchantPriceTL
            }
          });
        }
      }
    } catch (payErr) {
      console.error('Failed to generate marketplace payment link:', payErr);
      // Don't fail the whole booking if payment link fail, just log it
    }

    // 8. Send SMS Notification
    let smsDelivered = true;
    let smsError: string | null = null;
    try {
      const smsMessage = paymentUrl
        ? `Sayin ${customerName}, randevunuz olusturuldu. Odemenizi tamamlamak icin: ${paymentUrl}`
        : `Sayin ${customerName}, ${startTime} tarihindeki randevunuz basariyla olusturuldu.`;

      const cleanPhone = user.phone?.replace('+90', '') || '';
      await sendAppointmentSMS(salonId, cleanPhone, smsMessage);
    } catch (smsErr: any) {
      console.error('SMS Notification failed:', smsErr);
      smsDelivered = false;
      smsError = smsErr?.message || 'unknown';
    }

    // 9. Send Email Confirmation (best-effort, hata ana akışı bozmaz)
    try {
      if (user.email) {
        const { data: salonInfo } = await supabaseAdmin
          .from('salons')
          .select('name, neighborhood, district_id, city_id')
          .eq('id', salonId)
          .single();
        const { data: staffInfo } = await supabaseAdmin
          .from('staff')
          .select('name')
          .eq('id', staffId)
          .maybeSingle();

        const tpl = renderAppointmentConfirmation({
          customerName: customerName || (user.email?.split('@')[0] ?? 'Müşterimiz'),
          salonName: salonInfo?.name || 'Salonumuz',
          serviceName: ordered.map(serviceName).join(' + '),
          staffName: staffInfo?.name || 'Uzman',
          startTime,
          appointmentId: appointment.id,
        });
        await sendEmail({ to: user.email, subject: tpl.subject, html: tpl.html, text: tpl.text });
      }
    } catch (emailErr) {
      console.error('Email Notification failed:', emailErr);
    }

    return NextResponse.json({
      success: true,
      appointmentId: appointment.id,
      paymentUrl,
      smsDelivered,
      smsError,
      message: 'Randevu başarıyla oluşturuldu!',
    });

  } catch (err: any) {
    console.error('Booking Create Error:', err.message);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}