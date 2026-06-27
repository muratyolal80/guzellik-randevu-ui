import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { refund } from '@/lib/payment/paytr';

/**
 * POST /api/paytr/refund
 *
 * Body: { merchant_oid: string, return_amount: number }  // return_amount TL (nokta ile)
 *
 * Yetki: SUPER_ADMIN / ADMIN.
 * Davranış: PayTR /odeme/iade endpoint'ine çağrı; başarılıysa subscription/payment_history audit.
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
            .select('role')
            .eq('id', user.id)
            .single();

        const role = (profile?.role || '').toUpperCase();
        if (!['SUPER_ADMIN', 'ADMIN'].includes(role)) {
            return NextResponse.json({ error: 'Bu işlem için yetkiniz yok.' }, { status: 403 });
        }

        const body = await request.json();
        const merchant_oid: string = body?.merchant_oid;
        const return_amount: number = Number(body?.return_amount);

        if (!merchant_oid || !Number.isFinite(return_amount) || return_amount <= 0) {
            return NextResponse.json({ error: 'merchant_oid ve pozitif return_amount zorunlu.' }, { status: 400 });
        }

        const result = await refund(merchant_oid, return_amount);

        if (result.status !== 'success') {
            return NextResponse.json(
                { error: result.err_msg || 'PayTR iade reddetti.', err_no: result.err_no },
                { status: 502 }
            );
        }

        // İlgili subscription'ı bul, payment_history'e iade kaydı düş
        const { data: sub } = await supabaseAdmin
            .from('subscriptions')
            .select('id')
            .eq('paytr_oid', merchant_oid)
            .maybeSingle();

        await supabaseAdmin.from('payment_history').insert({
            subscription_id: sub?.id ?? null,
            amount: -Math.round(return_amount * 100), // negatif kuruş (refund)
            payment_method: 'CREDIT_CARD',
            payment_type: 'REFUND',
            status: 'SUCCESS',
            metadata: {
                provider: 'PAYTR',
                merchant_oid,
                return_amount,
                is_test: result.is_test,
                admin_id: user.id,
            },
        });

        return NextResponse.json({ success: true, merchant_oid, return_amount, is_test: result.is_test === 1 });
    } catch (err: any) {
        console.error('PayTR refund error:', err);
        return NextResponse.json({ error: err?.message || 'Beklenmedik hata' }, { status: 500 });
    }
}
