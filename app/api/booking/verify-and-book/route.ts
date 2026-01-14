import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { verifyOTP, cleanPhone } from '@/lib/otp';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendAppointmentSMS } from '@/lib/sms';

export async function POST(request: NextRequest) {
  // 1. Initialize Cookie Store
  const cookieStore: { name: string, value: string, options: any }[] = [];

  // 2. Initialize Supabase Client with Cookie Management
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          console.log('🍪 Capturing cookies:', cookiesToSet.map(c => c.name));
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
    const { phone, otp, customerName, email, salonId, staffId, serviceId, startTime, notes = '' } = body;

    // --- Validation ---
    if (!phone || !otp || !customerName || !salonId || !staffId || !serviceId || !startTime) {
      return NextResponse.json({ error: 'Eksik bilgi.' }, { status: 400 });
    }

    const cleanedPhone = cleanPhone(phone);
    const e164Phone = `+90${cleanedPhone}`;

    // Use provided email or fallback to generated one
    const userEmail = email && email.trim() !== '' ? email.trim() : `${cleanedPhone}@phone.user`;

    // --- 1. Verify SMS OTP ---
    const isValidOTP = await verifyOTP(cleanedPhone, otp);
    if (!isValidOTP) {
      return NextResponse.json({ error: 'Geçersiz kod' }, { status: 401 });
    }

    // --- 2. Get Service Info ---
    const { data: service } = await supabaseAdmin
      .from('salon_services')
      .select('duration_min')
      .eq('id', serviceId)
      .single();

    if (!service) return NextResponse.json({ error: 'Hizmet bulunamadı' }, { status: 404 });

    const startDate = new Date(startTime);
    const endDate = new Date(startDate.getTime() + service.duration_min * 60 * 1000);

    // --- 3. User Logic ---
    let userId: string;
    let finalEmail: string = userEmail;

    // Check if user exists by phone OR email
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = users.find(u => u.phone === e164Phone || u.email === userEmail);

    if (existingUser) {
      // User exists - use existing ID and Email
      userId = existingUser.id;
      finalEmail = existingUser.email || userEmail;
      console.log('👤 Existing user found:', userId);
    } else {
      // Create new user
      console.log('👤 Creating new user with email:', userEmail);
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
      finalEmail = newUser.user.email || userEmail;

      // Create profile
      await supabaseAdmin.from('profiles').upsert({
        id: userId,
        email: finalEmail,
        first_name: customerName.split(' ')[0],
        last_name: customerName.split(' ').slice(1).join(' '),
        phone: cleanedPhone,
        role: 'CUSTOMER',
      });
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

    // --- 5. AUTO LOGIN (Password Strategy) ---
    try {
      console.log('🔄 Starting Auto-login flow (Password Strategy) for:', finalEmail);

      // Generate a random secure password
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8) + "Aa1!";

      // Update user with temp password using Admin client
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: tempPassword
      });

      if (updateError) {
        console.error('❌ Update User Password Error:', updateError.message);
      } else {
        // Sign in with the temp password using the SSR client (to set cookies)
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: finalEmail,
          password: tempPassword
        });

        if (signInError) {
          console.error('❌ Sign In Error:', signInError.message);
        }

        if (signInData.session) {
          console.log('✅ Session obtained via password login. Cookies captured.');
        }
      }
    } catch (e: any) {
      console.warn('Auto-login exception:', e.message);
    }

    // --- 6. Send SMS ---
    sendAppointmentSMS(cleanedPhone, 'Randevunuz alındı!').catch(() => { });

    // --- 7. Return Success ---
    const finalResponse = NextResponse.json({
      success: true,
      appointmentId: appointment.id,
      message: 'Randevu başarıyla oluşturuldu!',
    }, {
      status: 200,
    });

    // Apply captured cookies to the final response
    console.log('🍪 Final Response Cookies Count:', cookieStore.length);
    cookieStore.forEach((cookie) => {
      finalResponse.cookies.set(cookie.name, cookie.value, cookie.options);
    });

    return finalResponse;

  } catch (err: any) {
    console.error('Fatal API Error:', err.message);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}