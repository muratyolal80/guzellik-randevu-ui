import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { validatePassword } from '@/lib/auth/password';
import { rateLimit } from '@/lib/rate-limit';

/**
 * POST /api/owner/staff/[id]/create-account
 *
 * Salon sahibinin personeli için login hesabı oluşturur (sahip şifreyi belirler).
 *
 * Body: { email: string, password: string }
 *
 * Yetki: Salon owner (kendi staff'ı) veya admin/super_admin
 *
 * İşlem:
 *   1. Yetki kontrol (RBAC)
 *   2. Staff zaten user_id'li ise 409
 *   3. Email zaten kullanılıyor mu kontrol (auth.users)
 *   4. auth.users yeni kayıt oluştur (email_confirm: true)
 *   5. profiles upsert (role: STAFF, first_name/last_name staff'tan)
 *   6. staff.user_id link
 *   7. Audit log
 *
 * Şifre kuralı: validatePassword (min 8, büyük+küçük harf+rakam)
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

        // Rate limit (sahip başına 20/dakika — abuse koruması)
        const rl = await rateLimit(`staff-create-account:${user.id}`, 20, 60_000);
        if (!rl.success) {
            return NextResponse.json({ error: 'Çok fazla istek.' }, { status: 429 });
        }

        const body = await request.json().catch(() => ({}));
        const { email, password } = body as { email?: string; password?: string };

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email ve şifre zorunlu.' },
                { status: 400 }
            );
        }

        const pwCheck = validatePassword(password);
        if (!pwCheck.valid) {
            return NextResponse.json(
                { error: 'Şifre yetersiz: ' + pwCheck.errors.join(', ') },
                { status: 400 }
            );
        }

        // Staff'ı çek + salon owner kontrolü
        const { data: staffRow } = await supabaseAdmin
            .from('staff')
            .select('id, name, user_id, salon_id, salons!inner(owner_id)')
            .eq('id', staffId)
            .maybeSingle();

        if (!staffRow) {
            return NextResponse.json({ error: 'Personel bulunamadı.' }, { status: 404 });
        }

        if (staffRow.user_id) {
            return NextResponse.json(
                { error: 'Bu personelin zaten login hesabı var.' },
                { status: 409 }
            );
        }

        // RBAC: salon owner veya admin
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

        // Email kullanılıyor mu? (direct query, listUsers değil)
        const { data: existing } = await supabaseAdmin
            .schema('auth')
            .from('users')
            .select('id')
            .eq('email', email)
            .limit(1);
        if (existing && existing.length > 0) {
            return NextResponse.json(
                {
                    error: 'Bu email zaten kullanılıyor. Mevcut kullanıcıyı bağlamak için davet sistemini kullanın.',
                },
                { status: 409 }
            );
        }

        // auth user oluştur
        const nameParts = (staffRow.name || '').trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const { data: newAuth, error: createErr } =
            await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: {
                    first_name: firstName,
                    last_name: lastName,
                    role_intent: 'STAFF',
                },
            });

        if (createErr || !newAuth.user) {
            return NextResponse.json(
                { error: 'Hesap oluşturulamadı: ' + (createErr?.message || 'bilinmeyen') },
                { status: 500 }
            );
        }

        const newUserId = newAuth.user.id;

        // profile upsert (trigger normalde oluşturur ama emin olalım)
        await supabaseAdmin.from('profiles').upsert(
            {
                id: newUserId,
                email,
                first_name: firstName,
                last_name: lastName,
                role: 'STAFF',
                is_active: true,
                created_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
        );

        // staff.user_id link
        await supabaseAdmin
            .from('staff')
            .update({
                user_id: newUserId,
                is_email_verified: true, // sahip oluşturduğu için verified say
            })
            .eq('id', staffId);

        // Audit log
        try {
            await supabaseAdmin.from('audit_logs').insert({
                salon_id: staffRow.salon_id,
                user_id: user.id,
                action: 'CREATE',
                resource_type: 'staff_account',
                resource_id: staffId,
                changes: {
                    new_user_id: newUserId,
                    email,
                    created_by_role: isAdmin ? 'ADMIN' : 'OWNER',
                },
                user_agent: request.headers.get('user-agent') ?? null,
            });
        } catch { /* sessiz */ }

        return NextResponse.json({
            success: true,
            staffId,
            userId: newUserId,
            email,
        });
    } catch (err: any) {
        console.error('[staff/create-account] error:', err);
        return NextResponse.json(
            { error: err?.message || 'Beklenmedik hata' },
            { status: 500 }
        );
    }
}
