import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyCallbackHash } from '@/lib/payment/paytr';
import type { PayTRCallbackBody } from '@/types/paytr';

/**
 * POST /api/paytr/callback
 *
 * PayTR'den gelen ödeme bildirimi.
 *
 * KRİTİK KURALLAR:
 *   - Response body MUTLAKA SADECE "OK" olmalı (HTML/JSON yok).
 *   - Aksi halde PayTR tekrar tekrar dener, "Devam Ediyor" durumunda kalır.
 *   - Hash mismatch → 403 (PayTR yine retry eder, sahte istekleri eler).
 *   - Aynı merchant_oid ikinci kez gelirse → tekrar işleme alma, "OK" dön.
 *
 * PayTR POST application/x-www-form-urlencoded gönderir.
 *
 * Belge: https://dev.paytr.com/iframe-api/iframe-api-2-adim
 */
export async function POST(request: NextRequest) {
    const raw = await request.text();
    const params = new URLSearchParams(raw);

    const body: PayTRCallbackBody = {
        merchant_oid:       params.get('merchant_oid') || '',
        status:             (params.get('status') as 'success' | 'failed') || 'failed',
        total_amount:       params.get('total_amount') || '0',
        hash:               params.get('hash') || '',
        payment_type:       (params.get('payment_type') as 'card' | 'eft') || undefined,
        currency:           params.get('currency') || undefined,
        payment_amount:     params.get('payment_amount') || undefined,
        failed_reason_code: params.get('failed_reason_code') || undefined,
        failed_reason_msg:  params.get('failed_reason_msg') || undefined,
        test_mode:          params.get('test_mode') || undefined,
    };

    if (!body.merchant_oid || !body.hash) {
        await logWebhook(body, false, 'Eksik alan (merchant_oid veya hash).');
        return new Response('Bad request', { status: 400 });
    }

    const verified = await verifyCallbackHash(body);
    if (!verified) {
        await logWebhook(body, false, 'Hash doğrulanamadı.');
        return new Response('Bad hash', { status: 403 });
    }

    // Idempotency: aynı merchant_oid daha önce işlendi mi?
    const { data: existing } = await supabaseAdmin
        .from('paytr_webhooks')
        .select('id, processed')
        .eq('merchant_oid', body.merchant_oid)
        .eq('processed', true)
        .maybeSingle();

    if (existing) {
        await logWebhook(body, true, 'Zaten işlenmiş — duplicate callback, sadece OK döndü.');
        return ok();
    }

    // İş kuralı: subscriptions.paytr_oid ile eşleşen kaydı bul
    const { data: sub } = await supabaseAdmin
        .from('subscriptions')
        .select('id, status')
        .eq('paytr_oid', body.merchant_oid)
        .maybeSingle();

    if (!sub) {
        await logWebhook(body, true, 'subscriptions.paytr_oid bulunamadı — yetim callback (yine OK).');
        return ok();
    }

    // Subscription daha önce ACTIVE/CANCELLED ise işleme alma
    if (sub.status === 'ACTIVE' || sub.status === 'CANCELLED') {
        await logWebhook(body, true, `Subscription zaten ${sub.status} durumunda — atlandı.`);
        return ok();
    }

    if (body.status === 'success') {
        await supabaseAdmin
            .from('subscriptions')
            .update({
                status: 'ACTIVE',
                payment_method: body.payment_type === 'eft' ? 'BANK_TRANSFER' : 'CREDIT_CARD',
                updated_at: new Date().toISOString(),
            })
            .eq('id', sub.id);

        // payment_history kaydı — total_amount kuruş cinsinden geliyor
        await supabaseAdmin.from('payment_history').insert({
            subscription_id: sub.id,
            amount: Number(body.total_amount) || 0,
            payment_method: 'CREDIT_CARD',
            payment_type: 'SUBSCRIPTION',
            status: 'SUCCESS',
            metadata: {
                provider: 'PAYTR',
                merchant_oid: body.merchant_oid,
                payment_type: body.payment_type,
                currency: body.currency,
                test_mode: body.test_mode === '1',
            },
        });

        await logWebhook(body, true, `Subscription ${sub.id} → ACTIVE.`);
    } else {
        await supabaseAdmin
            .from('subscriptions')
            .update({
                status: 'CANCELLED',
                updated_at: new Date().toISOString(),
            })
            .eq('id', sub.id);

        await supabaseAdmin.from('payment_history').insert({
            subscription_id: sub.id,
            amount: Number(body.total_amount) || 0,
            payment_method: 'CREDIT_CARD',
            payment_type: 'SUBSCRIPTION',
            status: 'FAILED',
            metadata: {
                provider: 'PAYTR',
                merchant_oid: body.merchant_oid,
                failed_reason_code: body.failed_reason_code,
                failed_reason_msg: body.failed_reason_msg,
            },
        });

        await logWebhook(body, true, `Subscription ${sub.id} → CANCELLED. Reason: ${body.failed_reason_msg}`);
    }

    return ok();
}

async function logWebhook(body: PayTRCallbackBody, processed: boolean, note: string) {
    try {
        await supabaseAdmin.from('paytr_webhooks').insert({
            merchant_oid:       body.merchant_oid,
            status:             body.status,
            total_amount:       Number(body.total_amount) || 0,
            payment_amount:     body.payment_amount ? Number(body.payment_amount) : null,
            payment_type:       body.payment_type ?? null,
            currency:           body.currency ?? null,
            failed_reason_code: body.failed_reason_code ?? null,
            failed_reason_msg:  body.failed_reason_msg ?? null,
            test_mode:          body.test_mode === '1',
            hash:               body.hash,
            hash_verified:      processed || note === 'Hash doğrulanamadı.' ? processed : false,
            processed,
            processing_note:    note,
            payload:            { ...body },
        });
    } catch (err) {
        console.error('paytr_webhooks insert hatası:', err);
    }
}

function ok() {
    return new Response('OK', {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
}
