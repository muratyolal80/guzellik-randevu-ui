import { describe, it, expect, vi } from 'vitest';
import crypto from 'crypto';
import {
    buildUserBasket,
    generatePayTRTokenHash,
    buildSubscriptionMerchantOid,
    iframeUrl,
} from '../payment/paytr';
import type { PayTRConfig } from '@/types/paytr';

const fakeCfg: PayTRConfig = {
    merchant_id: 'TEST_MERCHANT',
    merchant_key: 'KEY_FOR_TESTING',
    merchant_salt: 'SALT_FOR_TESTING',
    test_mode: 1,
    debug_on: 1,
    currency: 'TL',
    callback_url: '',
    merchant_ok_url: '',
    merchant_fail_url: '',
};

describe('PayTR helpers', () => {
    it('buildUserBasket → base64 JSON array', () => {
        const items: [string, string, number][] = [
            ['Test Plan', '99.99', 1],
        ];
        const result = buildUserBasket(items);
        const decoded = JSON.parse(Buffer.from(result, 'base64').toString('utf8'));
        expect(decoded).toEqual(items);
    });

    it('generatePayTRTokenHash deterministic — aynı input aynı hash', () => {
        const params = {
            cfg: fakeCfg,
            merchant_oid: 'SUB12345',
            email: 'test@example.com',
            payment_amount: 9999,
            user_ip: '1.2.3.4',
            user_basket_base64: buildUserBasket([['X', '99.99', 1]]),
            no_installment: 0 as const,
            max_installment: 0,
            currency: 'TL',
            test_mode: 1 as const,
        };
        const a = generatePayTRTokenHash(params);
        const b = generatePayTRTokenHash(params);
        expect(a).toEqual(b);
        expect(a.length).toBeGreaterThan(20); // base64 SHA256 = 44 char
    });

    it('generatePayTRTokenHash — PayTR resmi PHP formülü ile uyumlu', () => {
        const merchant_oid = 'TESTORDER1';
        const email = 'a@b.c';
        const payment_amount = 1000;
        const user_ip = '10.0.0.1';
        const user_basket = buildUserBasket([['Item', '10.00', 1]]);
        const no_installment = 0;
        const max_installment = 0;
        const currency = 'TL';
        const test_mode = 1;

        // PayTR PHP formülü:
        // $hash_str = merchant_id+user_ip+merchant_oid+email+payment_amount+user_basket+no_installment+max_installment+currency+test_mode
        // $paytr_token = base64_encode(hash_hmac('sha256', $hash_str.merchant_salt, merchant_key, true))
        const hash_str =
            fakeCfg.merchant_id + user_ip + merchant_oid + email + String(payment_amount) +
            user_basket + String(no_installment) + String(max_installment) + currency + String(test_mode);
        const expected = crypto
            .createHmac('sha256', fakeCfg.merchant_key)
            .update(hash_str + fakeCfg.merchant_salt)
            .digest('base64');

        const got = generatePayTRTokenHash({
            cfg: fakeCfg,
            merchant_oid, email, payment_amount, user_ip,
            user_basket_base64: user_basket,
            no_installment, max_installment, currency, test_mode,
        });

        expect(got).toEqual(expected);
    });

    it('buildSubscriptionMerchantOid → max 64 char alphanumeric', () => {
        // Mock Date.now ile deterministik test
        const original = Date.now;
        Date.now = () => 1733000000000;
        const subId = '550e8400-e29b-41d4-a716-446655440000';
        const oid = buildSubscriptionMerchantOid(subId);
        Date.now = original;

        expect(oid.length).toBeLessThanOrEqual(64);
        expect(oid).toMatch(/^SUB[A-Za-z0-9]+$/);
        expect(oid).toContain('550e8400e29b41d4a716446655440000');
    });

    it('iframeUrl → /odeme/guvenli/{token}', () => {
        expect(iframeUrl('abc123')).toBe('https://www.paytr.com/odeme/guvenli/abc123');
    });
});

describe('PayTR callback hash doğrulama (formül)', () => {
    // verifyCallbackHash PlatformService.getSetting çağırdığı için integration test gerektiriyor.
    // Burada sadece HMAC formülünün doğru olduğunu unit-test ediyoruz.
    it('callback hash = base64(HMAC_SHA256(merchant_key, merchant_oid+merchant_salt+status+total_amount))', () => {
        const merchant_oid = 'SUB12345';
        const status = 'success';
        const total_amount = '9999';

        const expected = crypto
            .createHmac('sha256', fakeCfg.merchant_key)
            .update(merchant_oid + fakeCfg.merchant_salt + status + total_amount)
            .digest('base64');

        expect(expected.length).toBeGreaterThan(20);

        // farklı status → farklı hash
        const failedHash = crypto
            .createHmac('sha256', fakeCfg.merchant_key)
            .update(merchant_oid + fakeCfg.merchant_salt + 'failed' + total_amount)
            .digest('base64');
        expect(failedHash).not.toEqual(expected);
    });
});
