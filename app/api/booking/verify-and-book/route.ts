import { toErrorLike } from '@/lib/error-mapping';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { verifyOTP, cleanPhone } from '@/lib/auth/otp';
import { startSessionForUser } from '@/lib/auth/session';
import { findAuthUserIdByPhone, findAuthUserIdByEmail } from '@/lib/auth/lookup';
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendAppointmentSMS } from '@/lib/messaging/sms';

export async function POST(request: NextRequest) {
  // 1. Initialize Cookie Store
  const cookieStore: { name: string, value: string, options: CookieOptions }[] = [];

  // 2. Initialize Supabase Client with Cookie Management
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach((cookie) => {
            cookieStore.push(cookie);
          });
        },
      },
      cookieOptions: {
        secure: process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('localhost'),
        sameSite: 'lax',
        path: '/',
      }
    }
  );

  try {
    const body = await request.json();
    const { phone, otp, customerName, email, salonId, staffId, serviceId, startTime, notes = '', rescheduleId } = body;

    // --- Validation ---
    if (!phone || !otp || !customerName || !salonId || !staffId || !serviceId || !startTime) {
      return NextResponse.json({ error: 'Eksik bilgi.' }, { status: 400 });
    }

    const cleanedPhone = cleanPhone(phone);
    if (!/^5\d{9}$/.test(cleanedPhone)) {
      return NextResponse.json({ error: 'Geçersiz telefon numarası.' }, { status: 400 });
    }
    const e164Phone = `+90${cleanedPhone}`;

    const ip = getClientIp(request);
    const [byIp, byPhone] = await Promise.all([
      rateLimit(`verify-book:ip:${ip}`, 20, 10 * 60_000),
      rateLimit(`verify-book:phone:${cleanedPhone}`, 8, 10 * 60_000),
    ]);
    if (!byIp.success) return rateLimitResponse(byIp.reset);
    if (!byPhone.success) return rateLimitResponse(byPhone.reset);

    // The email field is contact info only — it never selects or unlocks an account
    const requestedEmail = typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ? email.trim().toLowerCase()
      : null;

    // --- 1. Verify SMS OTP ---
    const isValidOTP = await verifyOTP(cleanedPhone, otp);
    if (!isValidOTP) {
      return NextResponse.json({ error: 'Geçersiz kod' }, { status: 401 });
    }

    // --- 2. Service / staff must belong to this salon; time must be valid & future ---
    const [{ data: service }, { data: staff }] = await Promise.all([
      supabaseAdmin.from('salon_services').select('duration_min').eq('id', serviceId).eq('salon_id', salonId).maybeSingle(),
      supabaseAdmin.from('staff').select('id').eq('id', staffId).eq('salon_id', salonId).eq('is_active', true).maybeSingle(),
    ]);

    if (!service) return NextResponse.json({ error: 'Hizmet bulunamadı' }, { status: 404 });
    if (!staff) return NextResponse.json({ error: 'Personel bulunamadı' }, { status: 404 });

    const startDate = new Date(startTime);
    if (Number.isNaN(startDate.getTime()) || startDate.getTime() < Date.now() - 5 * 60_000) {
      return NextResponse.json({ error: 'Geçersiz randevu zamanı.' }, { status: 400 });
    }
    const endDate = new Date(startDate.getTime() + service.duration_min * 60 * 1000);

    // --- 3. User: identified by the VERIFIED phone only ---
    let userId: string;

    const existingUserId = await findAuthUserIdByPhone(cleanedPhone);

    if (existingUserId) {
      userId = existingUserId;
    } else {
      // Use the given email only if no other account owns it; otherwise a phone-based placeholder
      let userEmail = `${cleanedPhone}@phone.user`;
      if (requestedEmail) {
        if (!(await findAuthUserIdByEmail(requestedEmail))) userEmail = requestedEmail;
      }

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: userEmail,
        phone: e164Phone,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: {
          full_name: customerName,
          first_name: customerName.split(' ')[0],
          last_name: customerName.split(' ').slice(1).join(' '),
          phone: cleanedPhone
        },
      });

      if (createError || !newUser.user) {
        console.error("User creation failed:", createError?.message);
        return NextResponse.json({ error: 'Kullanıcı hesabı oluşturulamadı' }, { status: 500 });
      }

      userId = newUser.user.id;

      // Create profile
      await supabaseAdmin.from('profiles').upsert({
        id: userId,
        email: newUser.user.email || userEmail,
        first_name: customerName.split(' ')[0],
        last_name: customerName.split(' ').slice(1).join(' '),
        phone: cleanedPhone,
        role: 'CUSTOMER',
      });
    }

    // --- 3.5 Handle Rescheduling (Cancel Old) ---
    if (rescheduleId) {
      await supabaseAdmin
        .from('appointments')
        .update({
          status: 'CANCELLED',
          notes: '[Yeni randevu alındığı için sistem tarafından iptal edildi]',
          updated_at: new Date().toISOString()
        })
        .eq('id', rescheduleId)
        .eq('customer_id', userId); // Security check
    }

    // --- 4. Create Appointment ---
    const { data: appointment, error: appointmentError } = await supabaseAdmin
      .from('appointments')
      .insert({
        customer_id: userId,
        customer_name: customerName,
        customer_phone: cleanedPhone,
        salon_id: salonId,
        staff_id: staffId,
        salon_service_id: serviceId,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        status: 'PENDING',
        notes,
      })
      .select()
      .single();

    if (appointmentError) {
      if (appointmentError.code === '23P01') {
        return NextResponse.json({ error: 'Bu saat dilimi dolu.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Randevu oluşturulamadı' }, { status: 500 });
    }

    // --- 5. AUTO LOGIN (phone verified → one-time token, password untouched) ---
    const session = await startSessionForUser(supabase, userId);
    if (!session.ok) console.warn('[verify-and-book] auto-login skipped:', session.reason);

    // --- 6. Send SMS ---
    sendAppointmentSMS(salonId, cleanedPhone, 'Randevunuz alındı!').catch(() => { });

    // --- 7. Return Success ---
    const finalResponse = NextResponse.json({
      success: true,
      appointmentId: appointment.id,
      message: 'Randevu başarıyla oluşturuldu!',
    }, {
      status: 200,
    });

    // Apply captured cookies to the final response
    cookieStore.forEach((cookie) => {
      finalResponse.cookies.set(cookie.name, cookie.value, cookie.options);
    });

    return finalResponse;

  } catch (err: unknown) {
    console.error('Fatal API Error:', toErrorLike(err).message);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}