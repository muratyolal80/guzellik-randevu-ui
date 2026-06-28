import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { validatePassword } from '@/lib/auth/password';
import { rateLimit } from '@/lib/rate-limit';

/**
 * POST /api/owner/staff/[id]/reset-password
 *
 * Salon sahibi personelin şifresini sıfırlar (yeni şifre belirler).
 * Personel forgot-password yapamadığında pratik çözüm.
 *
 * Body: { newPassword: string }
 *
 * Yetki: salon owner (staff'ın salonu) veya admin
 * Rate limit: sahip başına 10/dakika
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

        const rl = await rateLimit(`staff-reset-pw:${user.id}`, 10, 60_000);
        if (!rl.success) {
            return NextResponse.json({ error: 'Çok fazla istek.' }, { status: 429 });
        }

        const body = await request.json().catch(() => ({}));
        const { newPassword } = body as { newPassword?: string };

        if (!newPassword) {
            return NextResponse.json({ error: 'Yeni şifre zorunlu.' }, { status: 400 });
        }

        const pwCheck = validatePassword(newPassword);
        if (!pwCheck.valid) {
            return NextResponse.json(
                { error: 'Şifre yetersiz: ' + pwCheck.errors.join(', ') },
                { status: 400 }
            );
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
                { error: 'Bu personelin login hesabı yok. Önce hesap oluştur.' },
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

        const { error: updateErr } =
            await supabaseAdmin.auth.admin.updateUserById(staffRow.user_id, {
                password: newPassword,
            });

        if (updateErr) {
            return NextResponse.json(
                { error: 'Şifre güncellenemedi: ' + updateErr.message },
                { status: 500 }
            );
        }

        try {
            await supabaseAdmin.from('audit_logs').insert({
                salon_id: staffRow.salon_id,
                user_id: user.id,
                action: 'UPDATE',
                resource_type: 'staff_account',
                resource_id: staffId,
                changes: {
                    type: 'password_reset',
                    target_user_id: staffRow.user_id,
                    by_role: isAdmin ? 'ADMIN' : 'OWNER',
                },
                user_agent: request.headers.get('user-agent') ?? null,
            });
        } catch { }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('[staff/reset-password] error:', err);
        return NextResponse.json(
            { error: err?.message || 'Beklenmedik hata' },
            { status: 500 }
        );
    }
}
