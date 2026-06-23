import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase-admin';
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
    const { appointmentId, customerName, email, notes, salonId, staffId, serviceId, startTime, couponCode, campaignRuleId, participantCount = 1, depositAmount = 0 } = body;

    if (!customerName || !salonId || !staffId || !serviceId || !startTime) {
      return NextResponse.json({ error: 'Eksik bilgi.' }, { status: 400 });
    }

    // 2. Update User Profile & Email
    // If email is provided and user has a pending.user placeholder, update it
    if (email && user.email?.includes('@pending.user')) {
      const { error: updateEmailError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        email,
        email_confirm: true // Auto-confirm since they're already authenticated
      });
      if (updateEmailError) console.warn('Placeholder email update failed:', updateEmailError.message);
    } else if (email && email !== user.email && !user.email?.includes('@pending.user')) {
      // Update if email is different and not a placeholder
      const { error: updateEmailError } = await supabaseAdmin.auth.admin.updateUserById(user.id, { email });
      if (updateEmailError) console.warn('Email update failed:', updateEmailError.message);
    }

    // Update Profile Data
    await supabaseAdmin.from('profiles').upsert({
      id: user.id,
      first_name: customerName.split(' ')[0],
      last_name: customerName.split(' ').slice(1).join(' '),
      email: email || user.email,
      phone: user.phone, // Phone comes from the auth user
      role: 'CUSTOMER',
      updated_at: new Date().toISOString()
    });

    // 3. Get Service Info
    const { data: service } = await supabaseAdmin
      .from('salon_services')
      .select('duration_min, price, global_services(name)')
      .eq('id', serviceId)
      .single();

    if (!service) return NextResponse.json({ error: 'Hizmet bulunamadı' }, { status: 404 });

    // 4. Handle Coupon Validation
    const basePrice = service.price * participantCount;
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
        // Double check time/day
        const startDate = new Date(startTime);
        const dayOfWeek = startDate.getDay() || 7;
        const dbDay = dayOfWeek === 0 ? 7 : dayOfWeek;
        const appointmentTime = startTime.split('T')[1].substring(0, 5); // "HH:mm"

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

    // Combined Discount
    const totalDiscount = discountAmount + campaignDiscount;

    const startDate = new Date(startTime);
    const endDate = new Date(startDate.getTime() + service.duration_min * 60 * 1000);

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
        console.log(`Rescheduling: Staff changed. Cancelling old appointment ${appointmentId}.`);

        // 1. Cancel old appointment with a note
        await supabaseAdmin
          .from('appointments')
          .update({
            status: 'CANCELLED',
            notes: (existingAppt.notes ? existingAppt.notes + ' ' : '') + '[Yeniden planlama nedeniyle iptal edildi]',
            updated_at: new Date().toISOString()
          })
          .eq('id', appointmentId);

        // 2. Proceed to create NEW
        const { data: newData, error: createError } = await supabaseAdmin
          .from('appointments')
          .insert({
            customer_id: user.id,
            customer_name: customerName,
            customer_phone: user.phone?.replace('+90', '') || '',
            salon_id: salonId,
            staff_id: staffId,
            salon_service_id: serviceId,
            start_time: startDate.toISOString(),
            end_time: endDate.toISOString(),
            status: 'PENDING',
            notes: (notes || '') + ` [${appointmentId} nolu randevudan planlandı]`,
            deposit_amount: depositAmount,
          })
          .select()
          .single();

        appointment = newData;
        appointmentError = createError;

      } else {
        // CASE: Same Staff -> UPDATE existing
        const { data: updatedData, error: updateError } = await supabaseAdmin
          .from('appointments')
          .update({
            // staff_id: staffId, // Same staff, no need to change (or can update safely)
            salon_service_id: serviceId,
            start_time: startDate.toISOString(),
            end_time: endDate.toISOString(),
            status: 'PENDING', // Reset status to pending approval
            notes: notes || '',
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
          customer_phone: user.phone?.replace('+90', '') || '', // Clean phone for display
          salon_id: salonId,
          staff_id: staffId,
          salon_service_id: serviceId,
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          status: 'PENDING',
          notes: notes || '',
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

        console.log(`Generating payment link for appointment ${appointment.id}. Total: ${totalPriceTL}, Salon share: ${subMerchantPriceTL}`);

        const serviceName = (service as any).global_services?.name || 'Hizmet';

        const linkResult = await IyzicoLinkService.createLink({
          name: `${serviceName} Randevusu`,
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
          serviceName: (service as any)?.global_services?.[0]?.name || (service as any)?.service_name || 'Hizmet',
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