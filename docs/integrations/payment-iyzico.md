# Entegrasyon: Iyzico Ödeme

## Amaç
SaaS abonelik ödemeleri (salon plan satın alma) ve randevu içi kapora/ödemeler. Marketplace modeliyle salon-müşteri arasında doğrudan ödeme + komisyon platformu.

## Durum
🟡 **Sandbox aktif** — kod prod-ready, gerçek hesap onayı bekleniyor.

## Iyzico Modelleri

### 1. Subscription (Abonelik)
Salon sahibinin platforma ödediği plan ücreti.
- `subscription_plans` → STARTER (free), PRO/BUSINESS/ELITE
- Iyzico: tekrarlayan ödeme veya tek seferlik kart işlemi

### 2. Marketplace (Sub-merchant)
Salonların randevu/hizmet ücretini Iyzico üzerinden tahsil etmesi.
- `salon_sub_merchants` — IBAN + Iyzico sub-merchant key
- Komisyon: platform %X kesip kalanı salona yatırır
- Tip: PERSONAL / PRIVATE_COMPANY / LIMITED_OR_JOINT_STOCK

### 3. Banka Havale (Fallback)
Iyzico kullanmak istemeyen salonlar için manuel havale.
- `payment_method='BANK_TRANSFER'`
- Salon havale yapar → admin manuel onaylar → `activate_salon_and_subscription` RPC

## Konfigürasyon

`.env`:
```bash
# Sandbox (default)
IYZICO_API_KEY=sandbox-...
IYZICO_SECRET_KEY=sandbox-...
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com

# Production
# IYZICO_API_KEY=...
# IYZICO_SECRET_KEY=...
# IYZICO_BASE_URL=https://api.iyzipay.com
```

## Akış: Plan Satın Alma

```
Owner → /owner/finance → "PRO Yükselt"
    ↓
POST /api/subscription/subscribe
    ↓
Iyzico CheckoutForm token oluştur
    ↓
Iyzico ödeme sayfasına redirect (3D Secure)
    ↓
Iyzico → /api/iyzico/webhook
    ↓
payment_history.status='SUCCESS'
subscriptions.status='ACTIVE'
salons.status='APPROVED' (eğer ilk plan ise)
```

## Akış: Sub-merchant Oluşturma

```
Owner → /owner/finance/sub-merchant → IBAN gir
    ↓
POST /api/iyzico/sub-merchant/create
    ↓
Iyzico API → salon için sub-merchant kaydı
    ↓
salon_sub_merchants.iyzico_sub_merchant_key kaydı
salon_sub_merchants.status='PENDING' (Iyzico KYC sonrası ACTIVE)
```

## Webhook Events

`/api/iyzico/webhook` → `iyzico_webhooks` tablosuna audit + işle:
- `PAYMENT_SUCCESS`
- `PAYMENT_FAILED`
- `REFUND_SUCCESS`
- `SUB_MERCHANT_APPROVED`
- `SUBSCRIPTION_RENEWED`

## Test Adımları (Sandbox)

1. Iyzico sandbox kart numarası: `5528790000000008` / `12/30` / `123`
2. Plan değiştir: `/owner/finance` → "PRO Yükselt"
3. Iyzico sayfasına yönlen → kart bilgisi → onayla
4. Webhook → `iyzico_webhooks` audit log
5. `subscriptions.status='ACTIVE'` doğrula

## Açık Aksiyon (TODO)
- 🔴 **Iyzico production hesap onayı** — başvuru tamamlanmalı
- 🔴 **PCI-DSS compliance audit** — kart bilgisi storage yok ama prod öncesi denetim önerilir
- 🟡 **Sub-merchant KYC** — Iyzico kimlik doğrulama süreci için UI flow tamamlanmalı
- 🟡 **Refund UI** — admin paneline manuel refund butonu eklenmeli
- 🟡 **3D Secure fallback** — başarısız 3DS için kullanıcıya net hata mesajı
- 🟢 **Recurring webhook** — abonelik yenileme webhook'u handle edilmesi (`SUBSCRIPTION_RENEWED`)
- 🟢 **Pro-rata charge** — ay ortasında plan upgrade'inde gün-bazlı ücret
- 🟢 **Iyzico dashboard senkronizasyonu** — mismatch tespiti için reconciliation cron
- 🟢 **Multi-currency** — şu an sadece TRY, EUR/USD ileride

## Bağlantılar
- Iyzico lib: [lib/payment/](../../lib/payment)
- Subscribe API: [app/api/subscription/subscribe/route.ts](../../app/api/subscription/subscribe/route.ts)
- Webhook: [app/api/iyzico/webhook/route.ts](../../app/api/iyzico/webhook/route.ts)
- Sub-merchant create: [app/api/iyzico/sub-merchant/create/route.ts](../../app/api/iyzico/sub-merchant/create/route.ts)
- Finance DB: [services/db/db_finance.ts](../../services/db/db_finance.ts)
- Iyzico tabloları migration: [initdb/New-04-Sync-Missing-Tables.sql](../../initdb/New-04-Sync-Missing-Tables.sql)
- Iyzico docs: https://docs.iyzico.com/
