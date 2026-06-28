import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * POST /api/owner/staff/[id]/disable-login
 *
 * Personelin login hesabını devre dışı bırakır:
 *   - staff.user_id NULL (link kaldırılır)
 *   - profiles.is_active = false (oturum açamaz)
 *   - auth.users dokunulmaz (veri korunur, geri açılabilir)
 *
 * Staff kaydı SİLİNMEZ — sadece login devre dışı kalır.
 *
 * Yetki: salon owner veya admin
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: staffId } = await params;

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

        const { data: staffRow } = await supabaseAdmin
            .from('staff')
            .select('id, user_id, salon_id, salons!inner(owner_id)')
            .eq('id', staffId)
            .maybeSingle();

        if (!staffRow) {
            return NextResponse.json({ error: 'Personel bulunamadı.' }, { status: 404 });
        }

        if (!staffRow.user_id) {
            return NextResponse.json(
                { error: 'Bu personelin zaten login hesabı yok.' },
                { status: 409 }
            );
        }

        const ownerId = (staffRow.salons as any)?.owner_id;
        const isOwner = ownerId === user.id;
        let isAdmin = false;
        if (!isOwner) {
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
            isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(
                (profile?.role || '').toUpperCase()
            );
        }
        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: 'Yetkiniz yok.' }, { status: 403 });
        }

        const targetUserId = staffRow.user_id;

        await supabaseAdmin
            .from('profiles')
            .update({ is_active: false })
            .eq('id', targetUserId);

        await supabaseAdmin
            .from('staff')
            .update({ user_id: null })
            .eq('id', staffId);

        try {
            await supabaseAdmin.from('audit_logs').insert({
                salon_id: staffRow.salon_id,
                user_id: user.id,
                action: 'UPDATE',
                resource_type: 'staff_account',
                resource_id: staffId,
                changes: {
                    type: 'login_disabled',
                    target_user_id: targetUserId,
                    by_role: isAdmin ? 'ADMIN' : 'OWNER',
                },
                user_agent: request.headers.get('user-agent') ?? null,
            });
        } catch { }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('[staff/disable-login] error:', err);
        return NextResponse.json(
            { error: err?.message || 'Beklenmedik hata' },
            { status: 500 }
        );
    }
}
