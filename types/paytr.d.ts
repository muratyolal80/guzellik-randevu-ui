/**
 * PayTR iFrame API tipleri
 * Belge: https://dev.paytr.com/iframe-api
 */

export interface PayTRConfig {
    merchant_id: string;
    merchant_key: string;
    merchant_salt: string;
    test_mode: 0 | 1;
    debug_on: 0 | 1;
    currency: 'TL' | 'EUR' | 'USD' | 'GBP' | 'RUB';
    callback_url: string;
    merchant_ok_url: string;
    merchant_fail_url: string;
}

export type PaymentProvider = 'PAYTR' | 'IYZICO' | 'NONE';

export interface ActivePaymentProvider {
    provider: PaymentProvider;
}

/**
 * Tek bir basket item: [Ürün Adı, Birim Fiyat (string, nokta ile), Adet]
 */
export type PayTRBasketItem = [string, string, number];

export interface PayTRTokenRequest {
    merchant_oid: string;          // benzersiz sipariş no (max 64 char)
    email: string;                 // müşteri e-posta (max 100 char)
    payment_amount: number;        // kuruş (9.99 TL = 999)
    user_ip: string;               // IPv4/IPv6
    user_name?: string;            // max 60
    user_address?: string;         // max 400
    user_phone?: string;           // max 20
    basket: PayTRBasketItem[];     // sepet — base64'e biz çeviririz
    no_installment?: 0 | 1;        // taksit gizleme (0 default = açık)
    max_installment?: number;      // 0-12 (0 = sınırsız)
    merchant_ok_url?: string;      // başarılı redirect
    merchant_fail_url?: string;    // başarısız redirect
    timeout_limit?: number;        // dakika (default 30)
    lang?: 'tr' | 'en';
}

export interface PayTRTokenResponse {
    status: 'success' | 'failed';
    token?: string;
    reason?: string;               // failed durumunda hata mesajı
}

/**
 * PayTR'den /api/paytr/callback'e POST gelen body
 */
export interface PayTRCallbackBody {
    merchant_oid: string;
    status: 'success' | 'failed';
    total_amount: string;          // 100 ile çarpılmış (string olarak gelir)
    hash: string;                  // bizim verify edeceğimiz
    payment_type?: 'card' | 'eft';
    currency?: string;
    payment_amount?: string;
    failed_reason_code?: string;
    failed_reason_msg?: string;
    test_mode?: string;            // '1' veya tanımsız
}

export interface PayTRRefundResponse {
    status: 'success' | 'error';
    err_no?: string;
    err_msg?: string;
    return_amount?: string;
    merchant_oid?: string;
    is_test?: 0 | 1;
}

export interface PayTRWebhookRow {
    id: string;
    merchant_oid: string;
    status: string;
    total_amount: number | null;
    payment_amount: number | null;
    payment_type: string | null;
    currency: string | null;
    failed_reason_code: string | null;
    failed_reason_msg: string | null;
    test_mode: boolean | null;
    hash: string;
    hash_verified: boolean;
    processed: boolean;
    processing_note: string | null;
    payload: Record<string, unknown>;
    created_at: string;
}
