import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { IyzicoLinkService } from '@/lib/payment/iyzico-link';
import { getActiveProvider } from '@/lib/payment/paytr';

export async function POST(request: NextRequest) {
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll(); },
                setAll() { }
            },
        }
    );

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 401 });
        }

        const body = await request.json();
        const { salonId, planId, billingCycle } = body;

        if (!salonId || !planId) {
            return NextResponse.json({ error: 'Eksik bilgi.' }, { status: 400 });
        }

        // 1. Get Plan Info
        const { data: plan, error: planError } = await supabaseAdmin
            .from('subscription_plans')
            .select('*')
            .eq('id', planId)
            .single();

        if (planError || !plan) {
            return NextResponse.json({ error: 'Plan bulunamadı.' }, { status: 404 });
        }

        // 2. Calculate Price
        const price = billingCycle === 'YEARLY' ? plan.price_yearly : plan.price_monthly;

        if (price <= 0) {
            // Free plan - Activate immediately
            const days = billingCycle === 'YEARLY' ? 365 : 30;
            const { error: subError } = await supabaseAdmin
                .from('subscriptions')
                .upsert({
                    salon_id: salonId,
                    plan_id: planId,
                    status: 'ACTIVE',
                    payment_method: 'FREE',
                    billing_cycle: billingCycle,
                    current_period_start: new Date().toISOString(),
                    current_period_end: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
                });

            if (subError) throw subError;

            return NextResponse.json({ success: true, message: 'Ücretsiz plan aktif edildi.' });
        }

        // 3. Create Pending Subscription Record
        const days = billingCycle === 'YEARLY' ? 365 : 30;
        const { data: subscription, error: subError } = await supabaseAdmin
            .from('subscriptions')
            .upsert({
                salon_id: salonId,
                plan_id: planId,
                status: 'PENDING',
                payment_method: 'CREDIT_CARD',
                billing_cycle: billingCycle,
                current_period_start: new Date().toISOString(),
                current_period_end: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
            })
            .select()
            .single();

        if (subError) throw subError;

        // 4. Provider'a göre yönlendir
        //    PayTR (default): client tarafına yönlendir; gerçek token üretimi /api/paytr/create-token'da
        //    Iyzico (arşiv): eski link flow'u (onay alınca tekrar aktive edilir)
        //    NONE: kredi kartı yok, sadece havale (yine PENDING kalır)
        const provider = await getActiveProvider();

        if (provider === 'PAYTR') {
            return NextResponse.json({
                success: true,
                provider: 'PAYTR',
                redirectTo: '/api/paytr/create-token',
                subscription_id: subscription.id,
                message: 'PayTR aktif. Frontend /api/paytr/create-token endpoint\'inden iframe token alıp ödemeyi başlatmalı.',
            });
        }

        if (provider === 'IYZICO') {
            const linkResult = await IyzicoLinkService.createLink({
                name: `${plan.display_name} Aboneliği`,
                description: `${billingCycle === 'YEARLY' ? 'Yıllık' : 'Aylık'} Paket Ödemesi`,
                price: price / 100
            });

            if (linkResult.status !== 'success' || !linkResult.url) {
                throw new Error('Ödeme linki oluşturulamadı: ' + JSON.stringify(linkResult));
            }

            await supabaseAdmin.from('payment_history').insert({
                salon_id: salonId,
                subscription_id: subscription.id,
                payment_type: 'SUBSCRIPTION',
                payment_method: 'IYZICO_LINK',
                amount: price,
                status: 'PENDING',
                iyzico_link_id: linkResult.token,
                metadata: {
                    payment_url: linkResult.url,
                    plan_id: planId,
                    billing_cycle: billingCycle
                }
            });

            return NextResponse.json({
                success: true,
                provider: 'IYZICO',
                paymentUrl: linkResult.url
            });
        }

        // NONE — Hiçbir kart sağlayıcısı aktif değil
        return NextResponse.json(
            { error: 'Aktif ödeme sağlayıcısı yok. Admin > Ayarlar > Ödeme Sağlayıcıları üzerinden seçim yapın.' },
            { status: 503 }
        );

    } catch (err: any) {
        console.error('Subscription Error:', err.message);
        return NextResponse.json({ error: 'Sunucu hatası: ' + err.message }, { status: 500 });
    }
}
