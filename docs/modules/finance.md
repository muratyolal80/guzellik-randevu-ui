# Modül: Finans (Finance)

## Amaç
SaaS abonelik yönetimi (salon plan satın alma), randevu içi ödemeler, kupon/paket yönetimi, sub-merchant (havale) işlemleri.

## Roller / Aktör
- SALON_OWNER (kendi planını yönetir, müşteri ödemelerini görür)
- CUSTOMER (kendi ödeme geçmişi)
- SUPER_ADMIN (platform geneli finansal görünüm + manuel onay)

## Aktif Özellikler

### Abonelik (SaaS)
- ✅ **4 plan:** STARTER (0₺), PRO (499₺/ay), BUSINESS (749₺/ay), ELITE (999₺/ay)
- ✅ **Yıllık plan:** 10 ay fiyatı (2 ay bedava)
- ✅ **Plan limit'leri:** max_branches, max_staff, max_gallery_photos, max_sms_monthly
- ✅ **Feature flag'ler:** has_advanced_reports, has_campaigns, has_sponsored
- ✅ **Iyzico subscription** — `subscriptions.iyzico_subscription_ref`
- ✅ **Banka havale** — `payment_method='BANK_TRANSFER'` + admin manual onay
- ✅ **Plan-gate UI** — `<PlanGuard>` component özelliği kilitler
- ✅ **Usage stats view** — `salon_usage_stats` (kullanım vs limit)

### Randevu içi finans
- ✅ **Kapora** — `appointments.deposit_amount`
- ✅ **Iyzico ödeme** — `iyzico_payment_id`, callback handle
- ✅ **Refund** — `refund_status`, `refund_amount`
- ✅ **Transactions log** — tüm finansal hareketler `transactions`

### Kampanya / Pazarlama
- ✅ **Kuponlar** — `coupons` (PERCENTAGE/FIXED, kullanım limiti, son kullanma)
- ✅ **Paketler** — `packages` + `package_services` (n hizmet bir fiyatta)
- ✅ **Kampanya kuralları** — `campaign_rules` (zaman/gün bazlı dinamik indirim)
- ✅ **Appointment-coupon** — `appointment_coupons` (kullanılan kupon kaydı)

### Sub-merchant
- ✅ **IBAN kaydı** — `salon_sub_merchants` (PERSONAL/PRIVATE_COMPANY/LIMITED)
- ✅ **Iyzico sub-merchant API** — `/api/iyzico/sub-merchant/create`
- ✅ **Webhook handle** — `/api/iyzico/webhook` + `iyzico_webhooks` audit log

### Platform ayarları
- ✅ **Banka hesap bilgisi** — `platform_settings` JSON store ('bank_accounts' key)
- ✅ **Komisyon oranı** — `transactions.commission_amount`

## Veri Modeli
| Tablo | Rol |
|-------|-----|
| `subscription_plans` | Plan kataloğu (STARTER/PRO/BUSINESS/ELITE) |
| `subscriptions` | Salonun aktif aboneliği |
| `payment_history` | Tüm ödeme geçmişi (subscription + appointment + refund) |
| `transactions` | Daha esnek finansal hareket logu |
| `salon_sub_merchants` | Iyzico sub-merchant kaydı |
| `iyzico_webhooks` | Webhook olay logu |
| `coupons`, `appointment_coupons` | Kupon yönetimi |
| `packages`, `package_services` | Paket hizmet |
| `campaign_rules` | Dinamik kampanya |
| `platform_settings` | Banka bilgisi vs. |

## Sayfa / Route
| Path | Açıklama |
|------|----------|
| `/owner/finance` | Owner finans paneli (abonelik + gelir + ödemeler) |
| `/admin/finance` | Admin platform geneli finans |
| `/customer/payments` | Müşteri kendi ödemeleri |
| `/owner/campaigns` | Kupon/kampanya yönetimi |
| `/owner/packages` | Paket hizmet yönetimi |
| `/admin/subscription-plans` | Plan kataloğu yönetimi (admin) |

## API
| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/api/subscription/subscribe` | POST | Plan satın alma — Iyzico flow başlat |
| `/api/iyzico/webhook` | POST | Iyzico callback (ödeme sonucu) |
| `/api/iyzico/sub-merchant/create` | POST | Salon için sub-merchant oluştur |

## Test Adımları
1. **Plan değiştir:** Owner → `/owner/finance` → "PRO'ya Yükselt" → Iyzico sandbox kart → callback → `subscriptions.status='ACTIVE'`
2. **Limit kontrol:** STARTER planda 4. personel ekle → hata: "max_staff: 3"
3. **Kupon oluştur:** `/owner/campaigns` → "Yeni Kupon" → `coupons` insert
4. **Kupon kullan:** Booking flow son adımda kod gir → indirim uygulanır
5. **Havale onayı:** SALON_OWNER havale gönderdi diye işaretler → admin `/admin/finance` → "Onayla" → RPC `activate_salon_and_subscription`
6. **Refund:** Müşteri iptal → otomatik refund Iyzico API çağrısı → `refund_status='COMPLETED'`

## Açık Aksiyon (TODO)
- 🔴 **Iyzico production key** — sandbox aktif, prod hesap onayı bekleniyor
- 🟡 **Refund flow** — kapora geri ödeme akışı kodda var ama UI'da test edilmemiş
- 🟡 **Sub-merchant aktivasyon** — IBAN onay süreci manuel admin onayı gerektiriyor
- 🟡 **Plan downgrade** — yüksek planlardan düşüğe geçişte limit aşımı kontrolü yok
- 🟢 **Pro-rata charge** — ay ortasında plan değişikliğinde gün-bazlı ücretlendirme
- 🟢 **Multi-currency** — şu an sadece TRY
- 🟢 **Recurring webhook** — abonelik yenilemede otomatik faturalama
- 🟢 **Komisyon raporu** — admin için platform geliri raporu
- 🟢 **PCI-DSS** — kart bilgisi storage yok (Iyzico tokenization), ancak compliance audit gerekli prod öncesi

## Bağlantılar
- DB queries: [services/db/db_finance.ts](../../services/db/db_finance.ts)
- Owner finance: [app/owner/finance/page.tsx](../../app/owner/finance/page.tsx)
- Admin finance: [app/admin/finance/](../../app/admin/finance)
- Iyzico webhook: [app/api/iyzico/webhook/route.ts](../../app/api/iyzico/webhook/route.ts)
- Subscribe API: [app/api/subscription/subscribe/route.ts](../../app/api/subscription/subscribe/route.ts)
- Iyzico lib: [lib/payment/](../../lib/payment)
- Plan guard: [components/PlanGuard.tsx](../../components/PlanGuard.tsx)
- Iyzico detay: [Payment Iyzico](../integrations/payment-iyzico.md)
