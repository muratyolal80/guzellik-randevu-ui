import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendAppointmentSMS } from '@/lib/messaging/sms';

/**
 * POST /api/appointments/[id]/confirm
 *
 * Mode B salon onay akışı. Salon owner / atanmış staff / admin tarafından
 * PENDING randevu CONFIRMED'a alınır. Audit log + müşteri SMS bildirimi.
 *
 * Yetki:
 *   - SUPER_ADMIN, ADMIN
 *   - Salon owner (salons.owner_id = auth.uid())
 *   - Atanmış staff (staff.user_id = auth.uid() AND appointment.staff_id = staff.id)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: appointmentId } = await params;

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll(); },
                setAll() { /* readonly */ },
            },
        }
    );

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 401 });
        }

        // Randevuyu service_role ile çek (yetki kontrolü için)
        const { data: appointment, error: apptErr } = await supabaseAdmin
            .from('appointments')
            .select('id, status, salon_id, staff_id, customer_id, customer_phone, customer_name, start_time, salon:salons(name, owner_id)')
            .eq('id', appointmentId)
            .maybeSingle();

        if (apptErr || !appointment) {
            return NextResponse.json({ error: 'Randevu bulunamadı.' }, { status: 404 });
        }

        if (appointment.status !== 'PENDING') {
            return NextResponse.json(
                { error: `Bu randevu zaten ${appointment.status}.` },
                { status: 409 }
            );
        }

        // RBAC: profil rolü
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        const role = (profile?.role || '').toUpperCase();

        const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(role);
        const isOwner = (appointment.salon as any)?.owner_id === user.id;

        let isAssignedStaff = false;
        if (!isAdmin && !isOwner && appointment.staff_id) {
            const { data: staffMatch } = await supabaseAdmin
                .from('staff')
                .select('id')
                .eq('id', appointment.staff_id)
                .eq('user_id', user.id)
                .maybeSingle();
            isAssignedStaff = !!staffMatch;
        }

        if (!isAdmin && !isOwner && !isAssignedStaff) {
            return NextResponse.json(
                { error: 'Bu randevuyu onaylama yetkiniz yok.' },
                { status: 403 }
            );
        }

        // UPDATE: PENDING → CONFIRMED + kim/ne zaman onayladı
        const nowIso = new Date().toISOString();
        const { error: updateErr } = await supabaseAdmin
            .from('appointments')
            .update({
                status: 'CONFIRMED',
                confirmed_by: user.id,
                confirmed_at: nowIso,
                updated_at: nowIso,
            })
            .eq('id', appointmentId)
            .eq('status', 'PENDING'); // race-safe

        if (updateErr) {
            return NextResponse.json(
                { error: 'Onaylama başarısız: ' + updateErr.message },
                { status: 500 }
            );
        }

        // Audit log (sessiz fail)
        try {
            await supabaseAdmin.from('audit_logs').insert({
                salon_id: appointment.salon_id,
                user_id: user.id,
                action: 'UPDATE',
                resource_type: 'appointments',
                resource_id: appointmentId,
                changes: {
                    old: { status: 'PENDING' },
                    new: { status: 'CONFIRMED' },
                    confirmed_by_role: isAdmin ? 'ADMIN' : isOwner ? 'OWNER' : 'STAFF',
                },
                user_agent: request.headers.get('user-agent') ?? null,
            });
        } catch (auditErr) {
            console.warn('[appointment/confirm] audit insert failed (silent):', auditErr);
        }

        // SMS bildirim
        let smsDelivered = false;
        if (appointment.customer_phone) {
            try {
                const startStr = new Date(appointment.start_time).toLocaleString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                });
                const salonName = (appointment.salon as any)?.name || 'Salon';
                const msg = `Randevunuz onaylandı: ${salonName} - ${startStr}. İptal/değişiklik için salonu arayın.`;
                smsDelivered = await sendAppointmentSMS(appointment.salon_id, appointment.customer_phone, msg);
            } catch (smsErr) {
                console.warn('[appointment/confirm] SMS failed (silent):', smsErr);
            }
        }

        return NextResponse.json({
            success: true,
            appointmentId,
            status: 'CONFIRMED',
            smsDelivered,
        });
    } catch (err: any) {
        console.error('[appointment/confirm] error:', err);
        return NextResponse.json(
            { error: err?.message || 'Beklenmedik hata' },
            { status: 500 }
        );
    }
}
