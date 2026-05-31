import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
    generateIframeToken,
    buildSubscriptionMerchantOid,
    getActiveProvider,
} from '@/lib/payment/paytr';

/**
 * POST /api/paytr/create-token
 *
 * Body: { planId: string, billingCycle: 'MONTHLY' | 'YEARLY', salonId?: string }
 *
 * Akış:
 *   1) Auth — SALON_OWNER veya SUPER_ADMIN olmalı
 *   2) Aktif provider PAYTR mi kontrol et (değilse 400)
 *   3) Planı al, tutarı hesapla
 *   4) PENDING subscription oluştur (idempotent — varsa update)
 *   5) merchant_oid üret + subscription.paytr_oid'e yaz
 *   6) PayTR'den iframe token al
 *   7) { iframeUrl, merchant_oid } döndür
 */
export async function POST(request: NextRequest) {
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

        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role, full_name, email, phone')
            .eq('id', user.id)
            .single();

        const role = (profile?.role || '').toUpperCase();
        if (!['SALON_OWNER', 'MANAGER', 'SUPER_ADMIN', 'ADMIN'].includes(role)) {
            return NextResponse.json({ error: 'Bu işlem için yetkiniz yok.' }, { status: 403 });
        }

        const provider = await getActiveProvider();
        if (provider !== 'PAYTR') {
            return NextResponse.json(
                { error: `Aktif ödeme sağlayıcısı PAYTR değil (${provider}). Admin > Ayarlar üzerinden değiştirin.` },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { planId, billingCycle = 'MONTHLY', salonId } = body || {};
        if (!planId) {
            return NextResponse.json({ error: 'planId zorunlu.' }, { status: 400 });
        }

        const { data: plan, error: planError } = await supabaseAdmin
            .from('subscription_plans')
            .select('*')
            .eq('id', planId)
            .single();

        if (planError || !plan) {
            return NextResponse.json({ error: 'Plan bulunamadı.' }, { status: 404 });
        }

        const price = billingCycle === 'YEARLY' ? plan.price_yearly : plan.price_monthly;
        if (!price || price <= 0) {
            return NextResponse.json({ error: 'Bu plan ücretsiz — ödeme akışı gerekmez.' }, { status: 400 });
        }

        const days = billingCycle === 'YEARLY' ? 365 : 30;
        const owner_id = role === 'SALON_OWNER' || role === 'MANAGER' ? user.id : (body.ownerId || user.id);

        const subPayload = {
            owner_id,
            salon_id: salonId || null,
            plan_id: planId,
            status: 'PENDING' as const,
            payment_method: 'CREDIT_CARD',
            billing_cycle: billingCycle,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
        };

        // Idempotent: aynı owner+plan PENDING varsa güncelle
        const { data: existing } = await supabaseAdmin
            .from('subscriptions')
            .select('id')
            .eq('owner_id', owner_id)
            .eq('plan_id', planId)
            .eq('status', 'PENDING')
            .maybeSingle();

        let subscription;
        if (existing) {
            const { data, error } = await supabaseAdmin
                .from('subscriptions')
                .update(subPayload)
                .eq('id', existing.id)
                .select()
                .single();
            if (error) throw error;
            subscription = data;
        } else {
            const { data, error } = await supabaseAdmin
                .from('subscriptions')
                .insert(subPayload)
                .select()
                .single();
            if (error) throw error;
            subscription = data;
        }

        const merchant_oid = buildSubscriptionMerchantOid(subscription.id);

        await supabaseAdmin
            .from('subscriptions')
            .update({ paytr_oid: merchant_oid })
            .eq('id', subscription.id);

        const fwd = request.headers.get('x-forwarded-for') || '';
        const user_ip = fwd.split(',')[0].trim() || '85.34.78.112';

        const origin = new URL(request.url).origin;
        const planLabel = `${plan.display_name || plan.name} (${billingCycle === 'YEARLY' ? 'Yıllık' : 'Aylık'})`;

        const tokenRes = await generateIframeToken({
            merchant_oid,
            email: profile?.email || user.email || 'no-email@kuaforara.com.tr',
            payment_amount: Math.round(Number(price)),
            user_ip,
            user_name: profile?.full_name || 'Müşteri',
            user_phone: profile?.phone || '',
            user_address: 'Türkiye',
            basket: [[planLabel, (Number(price) / 100).toFixed(2), 1]],
            merchant_ok_url: `${origin}/owner/subscription?payment=ok&oid=${merchant_oid}`,
            merchant_fail_url: `${origin}/owner/subscription?payment=fail&oid=${merchant_oid}`,
        });

        if (!tokenRes.success || !tokenRes.token) {
            return NextResponse.json(
                { error: tokenRes.error || 'PayTR token alınamadı.' },
                { status: 502 }
            );
        }

        return NextResponse.json({
            success: true,
            iframeUrl: tokenRes.iframeUrl,
            token: tokenRes.token,
            merchant_oid,
            subscription_id: subscription.id,
        });
    } catch (err: any) {
        console.error('PayTR create-token error:', err);
        return NextResponse.json(
            { error: err?.message || 'Beklenmedik hata' },
            { status: 500 }
        );
    }
}
