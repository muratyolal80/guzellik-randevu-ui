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
    const { appointmentId, customerName, email, notes, salonId, staffId, serviceId, startTime } = body;

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