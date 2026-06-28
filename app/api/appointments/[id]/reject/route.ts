import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendAppointmentSMS } from '@/lib/messaging/sms';

/**
 * POST /api/appointments/[id]/reject
 *
 * Salon onayı reddi (Mode B). PENDING → CANCELLED + reason kaydı.
 *
 * Body: { reason?: string }
 *
 * Yetki: SUPER_ADMIN, ADMIN, salon owner, atanmış staff
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
                setAll() { },
            },
        }
    );

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const reason: string = (body?.reason || 'Salon tarafından reddedildi.').toString().slice(0, 280);

        const { data: appointment, error: apptErr } = await supabaseAdmin
            .from('appointments')
            .select('id, status, salon_id, staff_id, customer_phone, notes, start_time, salon:salons(name, owner_id)')
            .eq('id', appointmentId)
            .maybeSingle();

        if (apptErr || !appointment) {
            return NextResponse.json({ error: 'Randevu bulunamadı.' }, { status: 404 });
        }

        if (appointment.status === 'CANCELLED') {
            return NextResponse.json(
                { error: 'Bu randevu zaten iptal.' },
                { status: 409 }
            );
        }

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
                { error: 'Bu randevuyu reddetme yetkiniz yok.' },
                { status: 403 }
            );
        }

        const noteWithReason = (appointment.notes ? appointment.notes + ' ' : '') +
            `[Salon tarafından reddedildi: ${reason}]`;

        const { error: updateErr } = await supabaseAdmin
            .from('appointments')
            .update({
                status: 'CANCELLED',
                notes: noteWithReason,
                updated_at: new Date().toISOString(),
            })
            .eq('id', appointmentId);

        if (updateErr) {
            return NextResponse.json(
                { error: 'Reddetme başarısız: ' + updateErr.message },
                { status: 500 }
            );
        }

        try {
            await supabaseAdmin.from('audit_logs').insert({
                salon_id: appointment.salon_id,
                user_id: user.id,
                action: 'UPDATE',
                resource_type: 'appointments',
                resource_id: appointmentId,
                changes: {
                    old: { status: appointment.status },
                    new: { status: 'CANCELLED' },
                    reason,
                    rejected_by_role: isAdmin ? 'ADMIN' : isOwner ? 'OWNER' : 'STAFF',
                },
                user_agent: request.headers.get('user-agent') ?? null,
            });
        } catch (auditErr) {
            console.warn('[appointment/reject] audit insert failed (silent):', auditErr);
        }

        let smsDelivered = false;
        if (appointment.customer_phone) {
            try {
                const salonName = (appointment.salon as any)?.name || 'Salon';
                const msg = `Üzgünüz, ${salonName} randevunuz reddedildi. Sebep: ${reason}. Lütfen başka bir saat deneyin.`;
                smsDelivered = await sendAppointmentSMS(appointment.salon_id, appointment.customer_phone, msg);
            } catch (smsErr) {
                console.warn('[appointment/reject] SMS failed (silent):', smsErr);
            }
        }

        return NextResponse.json({
            success: true,
            appointmentId,
            status: 'CANCELLED',
            reason,
            smsDelivered,
        });
    } catch (err: any) {
        console.error('[appointment/reject] error:', err);
        return NextResponse.json(
            { error: err?.message || 'Beklenmedik hata' },
            { status: 500 }
        );
    }
}
