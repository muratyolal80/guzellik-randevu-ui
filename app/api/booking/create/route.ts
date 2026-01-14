import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendAppointmentSMS } from '@/lib/sms';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { customerName, email, notes, salonId, staffId, serviceId, startTime } = body;

    if (!customerName || !salonId || !staffId || !serviceId || !startTime) {
      return NextResponse.json({ error: 'Eksik bilgi.' }, { status: 400 });
    }

    // 2. Update User Profile & Email
    // If email is provided and different, update it
    if (email && email !== user.email && !user.email?.endsWith('@pending.user')) {
      // Optional: Check if email is already taken? Supabase will throw error if so.
      const { error: updateEmailError } = await supabaseAdmin.auth.admin.updateUserById(user.id, { email });
      if (updateEmailError) console.warn('Email update failed:', updateEmailError.message);
    } else if (email && user.email?.endsWith('@pending.user')) {
      // This is a new user replacing the placeholder email
      const { error: updateEmailError } = await supabaseAdmin.auth.admin.updateUserById(user.id, { email });
      if (updateEmailError) console.warn('Placeholder email update failed:', updateEmailError.message);
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
      .select('duration_min')
      .eq('id', serviceId)
      .single();

    if (!service) return NextResponse.json({ error: 'Hizmet bulunamadı' }, { status: 404 });

    const startDate = new Date(startTime);
    const endDate = new Date(startDate.getTime() + service.duration_min * 60 * 1000);

    // Validate that the appointment is not in the past
    // Buffer: Allow 1-2 minutes lag, but generally strict
    if (startDate < new Date()) {
      return NextResponse.json({ error: 'Geçmiş bir zamana randevu alınamaz.' }, { status: 400 });
    }

    // 4. Create Appointment
    const { data: appointment, error: appointmentError } = await supabaseAdmin
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
      })
      .select()
      .single();

    if (appointmentError) {
      if (appointmentError.code === '23P01') {
        return NextResponse.json({ error: 'Bu saat dilimi dolu.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Randevu oluşturulamadı' }, { status: 500 });
    }

    // 5. Send SMS
    if (user.phone) {
      const cleanPhone = user.phone.replace('+90', '');
      sendAppointmentSMS(cleanPhone, 'Randevunuz alındı!').catch(() => { });
    }

    return NextResponse.json({
      success: true,
      appointmentId: appointment.id,
      message: 'Randevu başarıyla oluşturuldu!',
    });

  } catch (err: any) {
    console.error('Booking Create Error:', err.message);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}