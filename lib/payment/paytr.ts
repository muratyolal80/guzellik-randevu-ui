import crypto from 'crypto';
import { PlatformService } from '@/services/db';
import type {
    PayTRConfig,
    PayTRTokenRequest,
    PayTRTokenResponse,
    PayTRCallbackBody,
    PayTRRefundResponse,
    PayTRBasketItem,
    ActivePaymentProvider,
    PaymentProvider,
} from '@/types/paytr';

const PAYTR_GET_TOKEN_URL = 'https://www.paytr.com/odeme/api/get-token';
const PAYTR_REFUND_URL    = 'https://www.paytr.com/odeme/iade';
const PAYTR_IFRAME_BASE   = 'https://www.paytr.com/odeme/guvenli';

const EMPTY_CONFIG: PayTRConfig = {
    merchant_id: '',
    merchant_key: '',
    merchant_salt: '',
    test_mode: 1,
    debug_on: 1,
    currency: 'TL',
    callback_url: '',
    merchant_ok_url: '',
    merchant_fail_url: '',
};

export async function getPayTRConfig(): Promise<PayTRConfig> {
    const raw = (await PlatformService.getSetting('paytr_config')) as Partial<PayTRConfig> | null;
    return { ...EMPTY_CONFIG, ...(raw ?? {}) };
}

export async function getActiveProvider(): Promise<PaymentProvider> {
    const raw = (await PlatformService.getSetting('active_payment_provider')) as ActivePaymentProvider | null;
    return (raw?.provider as PaymentProvider) ?? 'PAYTR';
}

export function isPayTRConfigured(cfg: PayTRConfig): boolean {
    return Boolean(cfg.merchant_id && cfg.merchant_key && cfg.merchant_salt);
}

export function iframeUrl(token: string): string {
    return `${PAYTR_IFRAME_BASE}/${token}`;
}

export function buildUserBasket(items: PayTRBasketItem[]): string {
    return Buffer.from(JSON.stringify(items), 'utf8').toString('base64');
}

/**
 * paytr_token üretimi (iFrame API 1. Adım)
 * Formül: base64( HMAC_SHA256( merchant_key,
 *   merchant_id + user_ip + merchant_oid + email + payment_amount +
 *   user_basket + no_installment + max_installment + currency + test_mode + merchant_salt
 * ))
 */
export function generatePayTRTokenHash(params: {
    cfg: PayTRConfig;
    merchant_oid: string;
    email: string;
    payment_amount: number;
    user_ip: string;
    user_basket_base64: string;
    no_installment: 0 | 1;
    max_installment: number;
    currency: string;
    test_mode: 0 | 1;
}): string {
    const { cfg, merchant_oid, email, payment_amount, user_ip, user_basket_base64,
            no_installment, max_installment, currency, test_mode } = params;

    const hashStr =
        cfg.merchant_id +
        user_ip +
        merchant_oid +
        email +
        String(payment_amount) +
        user_basket_base64 +
        String(no_installment) +
        String(max_installment) +
        currency +
        String(test_mode);

    return crypto
        .createHmac('sha256', cfg.merchant_key)
        .update(hashStr + cfg.merchant_salt)
        .digest('base64');
}

/**
 * iFrame token al — PayTR /odeme/api/get-token endpoint'ine POST eder.
 */
export async function generateIframeToken(req: PayTRTokenRequest): Promise<{
    success: boolean;
    token?: string;
    error?: string;
    iframeUrl?: string;
}> {
    const cfg = await getPayTRConfig();
    if (!isPayTRConfigured(cfg)) {
        return { success: false, error: 'PayTR yapılandırması eksik (merchant_id/key/salt).' };
    }

    const user_basket_base64 = buildUserBasket(req.basket);
    const no_installment = req.no_installment ?? 0;
    const max_installment = req.max_installment ?? 0;

    const paytr_token = generatePayTRTokenHash({
        cfg,
        merchant_oid: req.merchant_oid,
        email: req.email,
        payment_amount: req.payment_amount,
        user_ip: req.user_ip,
        user_basket_base64,
        no_installment,
        max_installment,
        currency: cfg.currency,
        test_mode: cfg.test_mode,
    });

    const body = new URLSearchParams({
        merchant_id:        cfg.merchant_id,
        user_ip:            req.user_ip,
        merchant_oid:       req.merchant_oid,
        email:              req.email,
        payment_amount:     String(req.payment_amount),
        currency:           cfg.currency,
        test_mode:          String(cfg.test_mode),
        debug_on:           String(cfg.debug_on),
        no_installment:     String(no_installment),
        max_installment:    String(max_installment),
        user_name:          req.user_name ?? '',
        user_address:       req.user_address ?? '',
        user_phone:         req.user_phone ?? '',
        merchant_ok_url:    req.merchant_ok_url ?? cfg.merchant_ok_url,
        merchant_fail_url:  req.merchant_fail_url ?? cfg.merchant_fail_url,
        user_basket:        user_basket_base64,
        paytr_token,
        timeout_limit:      String(req.timeout_limit ?? 30),
        lang:               req.lang ?? 'tr',
    });

    const res = await fetch(PAYTR_GET_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
    });

    const data = (await res.json()) as PayTRTokenResponse;

    if (data.status === 'success' && data.token) {
        return { success: true, token: data.token, iframeUrl: iframeUrl(data.token) };
    }
    return { success: false, error: data.reason || `PayTR token alınamadı (HTTP ${res.status})` };
}

/**
 * Bildirim URL'sine gelen POST için hash doğrulama (iFrame API 2. Adım)
 * Formül: base64( HMAC_SHA256( merchant_key, merchant_oid + merchant_salt + status + total_amount ) )
 */
export async function verifyCallbackHash(body: PayTRCallbackBody): Promise<boolean> {
    const cfg = await getPayTRConfig();
    if (!cfg.merchant_key || !cfg.merchant_salt) return false;

    const expected = crypto
        .createHmac('sha256', cfg.merchant_key)
        .update(body.merchant_oid + cfg.merchant_salt + body.status + body.total_amount)
        .digest('base64');

    return expected === body.hash;
}

/**
 * İade (refund) — kısmi veya tam.
 * Formül: base64( HMAC_SHA256( merchant_key, merchant_id + merchant_oid + return_amount + merchant_salt ) )
 */
export async function refund(merchant_oid: string, return_amount: number): Promise<PayTRRefundResponse> {
    const cfg = await getPayTRConfig();
    if (!isPayTRConfigured(cfg)) {
        return { status: 'error', err_msg: 'PayTR yapılandırması eksik' };
    }

    const amountStr = return_amount.toFixed(2);

    const paytr_token = crypto
        .createHmac('sha256', cfg.merchant_key)
        .update(cfg.merchant_id + merchant_oid + amountStr + cfg.merchant_salt)
        .digest('base64');

    const body = new URLSearchParams({
        merchant_id:   cfg.merchant_id,
        merchant_oid,
        return_amount: amountStr,
        paytr_token,
    });

    const res = await fetch(PAYTR_REFUND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
    });

    return (await res.json()) as PayTRRefundResponse;
}

/**
 * Subscription için benzersiz merchant_oid üretici.
 * Sadece [A-Za-z0-9] karakter (PayTR alfanumerik kabul ediyor, max 64).
 */
export function buildSubscriptionMerchantOid(subscriptionId: string): string {
    const compact = subscriptionId.replace(/-/g, '');
    const ts = Date.now().toString(36);
    return `SUB${compact}${ts}`.slice(0, 64);
}
