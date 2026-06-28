import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { rateLimit } from '@/lib/rate-limit';

/**
 * POST /api/audit/log
 *
 * Client-side audit insert RLS'e takılabiliyor (özellikle salon_id resolution
 * race condition'larında). Bu route service_role ile insert eder; UI catch'siz
 * çağırabilir.
 *
 * Body:
 *   {
 *     salon_id?: string,
 *     action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ACCESS' | 'EXPORT',
 *     resource_type: string,
 *     resource_id?: string,
 *     changes?: object,
 *     description?: string
 *   }
 *
 * Yetki: Sadece authenticated kullanıcı. user_id auth context'ten alınır.
 * Rate limit: kullanıcı başına 60/dakika (overcommit koruması).
 */

const PLATFORM_SALON_ID = '00000000-0000-0000-0000-000000000000';

export async function POST(request: NextRequest) {
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

        // Rate limit
        const rl = await rateLimit(`audit-log:${user.id}`, 60, 60_000);
        if (!rl.success) {
            return NextResponse.json(
                { error: 'Too many audit calls.' },
                { status: 429, headers: { 'Retry-After': '30' } }
            );
        }

        const body = await request.json().catch(() => ({}));
        const {
            salon_id,
            action,
            resource_type,
            resource_id,
            changes,
            description,
        } = body || {};

        if (!action || !resource_type) {
            return NextResponse.json(
                { error: 'action ve resource_type zorunlu.' },
                { status: 400 }
            );
        }

        const validActions = ['CREATE', 'UPDATE', 'DELETE', 'ACCESS', 'EXPORT'];
        if (!validActions.includes(String(action).toUpperCase())) {
            return NextResponse.json(
                { error: 'Geçersiz action.' },
                { status: 400 }
            );
        }

        const finalChanges = changes
            ? (description ? { ...changes, description } : changes)
            : description
              ? { description }
              : null;

        const { error: insertErr } = await supabaseAdmin
            .from('audit_logs')
            .insert({
                salon_id: salon_id || PLATFORM_SALON_ID,
                user_id: user.id,
                action: String(action).toUpperCase(),
                resource_type,
                resource_id: resource_id || null,
                changes: finalChanges,
                user_agent: request.headers.get('user-agent') ?? null,
                ip_address:
                    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                    request.headers.get('x-real-ip') ||
                    null,
            });

        if (insertErr) {
            console.warn('[audit/log] insert failed (silent):', insertErr.message);
            return NextResponse.json(
                { success: false, error: insertErr.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('[audit/log] error:', err);
        return NextResponse.json(
            { error: err?.message || 'Beklenmedik hata' },
            { status: 500 }
        );
    }
}
