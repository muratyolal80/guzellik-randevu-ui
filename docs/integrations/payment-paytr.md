# Entegrasyon: PayTR iFrame API (Ödeme)

> **Kapsam (2026-06-01):** Bu entegrasyon ŞU AN sadece **salon sahibi abonelik (üyelik paketi) ödemesi** için kullanılır. Müşteri booking kapora ödemesi kapsam dışıdır — salon kendi tahsil eder. Booking kapora için ileride Iyzico onayı alınırsa veya PayTR Pazaryeri modülü çıkarsa aktive edilebilir.

> **Mimari karar:** PayTR'de sub-merchant / marketplace yok → **Platform Tek Hesap** modeli. Tüm abonelik ödemeleri platformun PayTR hesabına gelir. Salonlardan kazançları manuel/otomatik IBAN transferiyle iletirsek o ayrı bir konudur.

## Neden iFrame API (Direkt API değil)?

| Kriter | iFrame API ✅ | Direkt API | Link API |
|--------|--------------|------------|----------|
| PCI-DSS | Gerekmez | Gerekmez | Gerekmez |
| PayTR ek yetki | ❌ (her hesap kullanabilir) | ✅ (yetki gerekiyor) | ❌ |
| UI kontrol | Iframe (PayTR'nin formu) | Tam custom | Yeni sekme |
| Mobile resize | Otomatik (iframeResizer) | Manuel | Native |
| 3D Secure | Otomatik | Manuel | Otomatik |
| Implementation | Orta | Yüksek | Düşük |

Bu yüzden iFrame API tercih edildi.

## Mimari Akış

```
1) Server'da POST https://www.paytr.com/odeme/api/get-token
   Parametreler: merchant_id, user_ip, merchant_oid, email, payment_amount,
                 user_basket (base64 JSON), no_installment, max_installment,
                 currency, test_mode, debug_on, paytr_token,
                 merchant_ok_url, merchant_fail_url, user_name/address/phone, timeout_limit, lang

   paytr_token = base64( HMAC_SHA256( merchant_key,
     merchant_id+user_ip+merchant_oid+email+payment_amount+user_basket+
     no_installment+max_installment+currency+test_mode + merchant_salt
   ))

2) Yanıt: { status: "success", token: "..." }

3) Frontend modal'da:
   <iframe src="https://www.paytr.com/odeme/guvenli/{token}" id="paytriframe">
   + https://www.paytr.com/js/iframeResizer.min.js

4) Müşteri kartı PayTR formuna girer → 3D Secure → tamamlanır
   merchant_ok_url'e redirect (veri YOK)

5) Ayrı kanal — PayTR → /api/paytr/callback POST:
   alanlar: merchant_oid, status, total_amount, hash, payment_type,
            currency, payment_amount, failed_reason_code, failed_reason_msg, test_mode

   hash = base64( HMAC_SHA256( merchant_key,
     merchant_oid + merchant_salt + status + total_amount
   ))

   - hash mismatch → 403 (PayTR retry eder)
   - merchant_oid daha önce işlendiyse → "OK" dön (idempotent)
   - status=success → subscription.status=ACTIVE
   - status=failed  → subscription.status=CANCELLED

   ⚠️ Response body MUTLAKA SADECE "OK". HTML/JSON yok. Aksi halde PayTR
      "Devam Ediyor" durumunda kalır ve sürekli retry eder.
```

## Yapılandırma

### DB üzerinden (admin panel > Ayarlar > Ödeme Sağlayıcıları)
- `platform_settings.paytr_config` (JSON):
  - `merchant_id`, `merchant_key`, `merchant_salt`
  - `test_mode` (0 = canlı, 1 = test/demo)
  - `debug_on` (1 önerilir — hata mesajlarını döndürür)
  - `currency` (default `TL`)
  - `callback_url`, `merchant_ok_url`, `merchant_fail_url`
- `platform_settings.active_payment_provider` = `{ "provider": "PAYTR" | "IYZICO" | "NONE" }`

### Env (opsiyonel — DB boşsa fallback olarak kullanılabilir, default değil)
- `PAYTR_MERCHANT_ID`
- `PAYTR_MERCHANT_KEY`
- `PAYTR_MERCHANT_SALT`
- `PAYTR_TEST_MODE` (1 default — demo)
- `PAYTR_CALLBACK_URL` (üretimde HTTPS olmalı)

## Demo Kartlar (test_mode = 1)

| Kart No | Sahip | Son K. | CVV |
|---------|-------|--------|-----|
| 4355 0843 5508 4358 | PAYTR TEST | 12/30 | 000 |
| 5406 6754 0667 5403 | PAYTR TEST | 12/30 | 000 |
| 9792 0303 9444 0796 | PAYTR TEST | 12/30 | 000 |

Test ortamında kart bilgilerini herhangi bir Ad/Son K. ile gönderebilirsiniz; sadece kart no + CVV önemlidir.

## Veri Modeli

| Tablo / Kolon | Açıklama |
|---------------|----------|
| `platform_settings.paytr_config` | Merchant credentials + config (JSON) |
| `platform_settings.active_payment_provider` | Hangi sağlayıcı runtime'da aktif |
| `subscriptions.paytr_oid` | Provider-agnostic merchant_oid; callback eşleştirmesi için |
| `paytr_webhooks` | Audit log (her POST kaydedilir, idempotency işareti, RLS admin-only) |
| `payment_history.metadata.provider` | 'PAYTR' / 'IYZICO' işareti — geçmişte hangi provider çalışmış |

## Route'lar

| Route | Method | Sorumluluk | Auth |
|-------|--------|-----------|------|
| `/api/paytr/create-token` | POST | Abonelik için iframe token üret (PENDING subscription + paytr_oid) | SALON_OWNER / MANAGER / SUPER_ADMIN / ADMIN |
| `/api/paytr/callback` | POST | PayTR bildirimi — hash verify + idempotent + subscription update | (yok, hash ile koruma) |
| `/api/paytr/refund` | POST | Kısmi veya tam iade | SUPER_ADMIN / ADMIN |
| `/api/subscription/subscribe` | POST | Eski Iyzico-uyumlu route; aktif provider'a göre yönlendirir | SALON_OWNER |

## UI

- `components/payment/PayTRPaymentModal.tsx` — reusable iframe modal (loading + error state + iframeResizer)
- `app/owner/packages/page.tsx` → "Kredi Kartı ile Öde (PayTR)" butonu + modal
- `app/admin/finance/purchase/page.tsx` → admin owner adına PayTR token üretebilir
- `app/admin/settings/page.tsx` → "Aktif Ödeme Sağlayıcısı" toggle + PayTR config formu + demo kart bilgi kartı

## Test

- Unit test: `lib/__tests__/paytr.test.ts` (6 test)
  - basket base64 dönüşümü
  - paytr_token hash deterministic
  - PayTR PHP formülüyle birebir uyum
  - merchant_oid 64 char altı, alfanumerik
  - callback hash formülü
- Manuel test: ngrok ile `localhost` callback URL'ini dış dünyaya açıp PayTR Mağaza Panel > Bildirim URL'ye yazdıktan sonra `test_mode=1` ile demo kartlardan biriyle 3D Secure ekranını geç → callback `subscriptions.status = 'ACTIVE'` yapmalı

## Yaygın Hatalar

| Belirti | Sebep | Çözüm |
|---------|-------|-------|
| `PayTR token alınamadı (HTTP xxx)` | merchant_id/key/salt boş veya hatalı | Admin > Ayarlar > PayTR config kontrol et |
| Iframe açıldı ama PayTR "Geçersiz token" gösteriyor | `user_ip` localhost (`127.0.0.1`) gönderildi | Üretimde gerçek IP, dev'de fake IP (örn. `85.34.78.112`) |
| Ödeme başarılı ama subscription hâlâ PENDING | Callback URL'i PayTR Mağaza Panel'de set edilmemiş, veya HTTPS değil | Bildirim URL'yi PayTR panelinde tanımla, HTTPS şart |
| PayTR sürekli aynı callback'i tekrar gönderiyor | Bizim endpoint `"OK"` yerine HTML/JSON döndürüyor | `/api/paytr/callback` Content-Type: text/plain, body sadece `OK` |
| Hash mismatch | `merchant_key`/`merchant_salt` yanlış kaydedilmiş veya kopya-yapıştır sırasında boşluk girmiş | Strip whitespace, tekrar gir |

## Açık Aksiyon (TODO)

- 🔴 **K3a: PayTR canlı hesap onayı** — Mağaza Panel'i aç + canlı merchant credentials al + DB'de `paytr_config.test_mode=0` yap
- 🟡 **Booking kapora ödemesi açılması** — şu an YOK. (a) PayTR Pazaryeri çıkarsa veya (b) Iyzico onayı + sub-merchant aktive olursa açılabilir
- 🟡 **Recurring abonelik (kart saklama / tokenization)** — şu an her dönem owner elle ödüyor; PayTR tokenization destekliyor, gelecekte
- 🟢 **Manuel IBAN transfer otomasyonu** — şu an manuel; gelir oturduğunda otomatik
- 🟢 **Callback retry sayısı izleme** — `paytr_webhooks.created_at` üzerinden DDoS koruması

## Bağlantılar

- Lib: [lib/payment/paytr.ts](../../lib/payment/paytr.ts)
- Tipler: [types/paytr.d.ts](../../types/paytr.d.ts)
- Modal: [components/payment/PayTRPaymentModal.tsx](../../components/payment/PayTRPaymentModal.tsx)
- API routes: [app/api/paytr/](../../app/api/paytr/)
- Migration: [initdb/New-15-PayTR-Setup.sql](../../initdb/New-15-PayTR-Setup.sql)
- Test: [lib/__tests__/paytr.test.ts](../../lib/__tests__/paytr.test.ts)
- PayTR resmi belge: https://dev.paytr.com/iframe-api
- Iyzico (arşiv): [docs/integrations/payment-iyzico.md](payment-iyzico.md)
