import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * POST /api/appointments/[id]/complete
 *
 * Randevuyu tamamlandı olarak işaretle (CONFIRMED → COMPLETED).
 * Body: { isNoShow?: boolean }  → true ise COMPLETED yerine NO_SHOW
 *
 * Yetki: salon owner, atanmış staff, admin
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
        const isNoShow = !!body?.isNoShow;
        const targetStatus = isNoShow ? 'NO_SHOW' : 'COMPLETED';

        const { data: appointment, error: apptErr } = await supabaseAdmin
            .from('appointments')
            .select('id, status, salon_id, staff_id, salon:salons(owner_id)')
            .eq('id', appointmentId)
            .maybeSingle();

        if (apptErr || !appointment) {
            return NextResponse.json({ error: 'Randevu bulunamadı.' }, { status: 404 });
        }

        if (!['PENDING', 'CONFIRMED'].includes(appointment.status)) {
            return NextResponse.json(
                { error: `Bu randevu zaten ${appointment.status}; tamamlanamaz.` },
                { status: 409 }
            );
        }

        // RBAC
        const ownerId = (appointment.salon as any)?.owner_id;
        const isOwner = ownerId === user.id;
        let isAssignedStaff = false;
        let isAdmin = false;
        if (!isOwner && appointment.staff_id) {
            const { data: staffMatch } = await supabaseAdmin
                .from('staff')
                .select('id')
                .eq('id', appointment.staff_id)
                .eq('user_id', user.id)
                .maybeSingle();
            isAssignedStaff = !!staffMatch;
        }
        if (!isOwner && !isAssignedStaff) {
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
            isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(
                (profile?.role || '').toUpperCase()
            );
        }
        if (!isOwner && !isAssignedStaff && !isAdmin) {
            return NextResponse.json({ error: 'Yetkiniz yok.' }, { status: 403 });
        }

        const nowIso = new Date().toISOString();
        const { error: updateErr } = await supabaseAdmin
            .from('appointments')
            .update({
                status: targetStatus,
                completed_by: user.id,
                completed_at: nowIso,
                updated_at: nowIso,
            })
            .eq('id', appointmentId);

        if (updateErr) {
            return NextResponse.json(
                { error: 'Güncellenemedi: ' + updateErr.message },
                { status: 500 }
            );
        }

        // Audit
        try {
            await supabaseAdmin.from('audit_logs').insert({
                salon_id: appointment.salon_id,
                user_id: user.id,
                action: 'UPDATE',
                resource_type: 'appointments',
                resource_id: appointmentId,
                changes: {
                    old: { status: appointment.status },
                    new: { status: targetStatus },
                    by_role: isAdmin ? 'ADMIN' : isOwner ? 'OWNER' : 'STAFF',
                },
                user_agent: request.headers.get('user-agent') ?? null,
            });
        } catch { }

        return NextResponse.json({
            success: true,
            appointmentId,
            status: targetStatus,
        });
    } catch (err: any) {
        console.error('[appointment/complete] error:', err);
        return NextResponse.json(
            { error: err?.message || 'Beklenmedik hata' },
            { status: 500 }
        );
    }
}
