# Modül: Admin Paneli

## Amaç
Süper admin'in platform geneli kontrol paneli. Salon onayları, kullanıcı yönetimi, master data (şehir/kategori), abonelik planları, finans ve İYS log denetimi.

## Roller / Aktör
- SUPER_ADMIN (tek yetkili)
- ADMIN (sınırlı; yardımcı admin için ileride)

## Aktif Özellikler
- ✅ **Genel dashboard** — platform metrikleri (kullanıcı, salon, randevu, ciro)
- ✅ **Salon onay akışı** — `SUBMITTED` salonları onaylama / reddetme / revizyon istek
- ✅ **Kullanıcı yönetimi** — rol değiştirme, soft-delete, şifre sıfırlama tetikleme
- ✅ **Salon tipleri** — `salon_types` CRUD
- ✅ **Hizmet kategorileri** — `service_categories` CRUD
- ✅ **Global servisler** — `global_services` CRUD (platform standardı hizmet listesi)
- ✅ **Tip-kategori eşleme** — `salon_type_categories`
- ✅ **Abonelik planları** — `subscription_plans` CRUD (fiyat, limit, feature flag)
- ✅ **Finans paneli** — tüm `payment_history`, `transactions` görünümü
- ✅ **Manuel havale onay** — `activate_salon_and_subscription` RPC ile atomik aktivasyon
- ✅ **Destek talepleri** — tüm ticket'lar
- ✅ **İYS log paneli** — gönderilen tüm SMS'ler
- ✅ **Platform ayarları** — `platform_settings` (banka bilgisi vs)
- ✅ **Audit log görünümü** — `audit_logs` (kim ne zaman ne yaptı)

## Veri Modeli
Bu modül "tüm tablolara FOR ALL" RLS politikası ile çalışır:
```sql
EXISTS (SELECT 1 FROM profiles WHERE id=auth.uid() AND role IN ('SUPER_ADMIN','ADMIN'))
```

Yönetilen ana tablolar:
| Tablo | İşlem |
|-------|-------|
| `salons` | Onay (status değişikliği), askıya alma |
| `profiles` | Rol değiştirme, soft-delete |
| `salon_types`, `service_categories`, `global_services` | Master data CRUD |
| `subscription_plans` | Plan yönetimi |
| `platform_settings` | Banka bilgisi vs JSON config |
| `payment_history`, `transactions` | Salt okunur (manuel onay hariç) |
| `support_tickets`, `ticket_messages` | Destek yanıtları |
| `iys_logs`, `iyzico_webhooks`, `audit_logs` | Salt okunur log |

## Sayfa / Route
| Path | Açıklama |
|------|----------|
| `/admin` | Genel dashboard |
| `/admin/salons` | Salon onay akışı |
| `/admin/users` | Kullanıcı yönetimi |
| `/admin/types` | Salon tipleri |
| `/admin/service-types` | Hizmet kategorileri |
| `/admin/services` | Global servisler |
| `/admin/subscription-plans` | Abonelik planları |
| `/admin/finance` | Finansal panel |
| `/admin/finance/packages` | Paket yönetimi (admin tarafı) |
| `/admin/finance/purchase` | Havale onayları |
| `/admin/support` | Destek talepleri |
| `/admin/iys-logs` | SMS log paneli |
| `/admin/settings` | Platform ayarları |
| `/admin/[...rest]` | Catch-all (404) |

## API
İç service layer kullanılıyor. Ayrı admin API endpoint'i yok; SUPER_ADMIN rolüne özel route'lar middleware'de korunur.

RPC fonksiyonları:
- `activate_salon_and_subscription(salon_id, subscription_id, admin_note)` — atomik aktivasyon

## Test Adımları
1. **Salon onay:** SALON_OWNER salon kayıt → `SUBMITTED` → SUPER_ADMIN `/admin/salons` → "Onayla" → status `APPROVED` → public aramada görünür
2. **Kullanıcı rolü değiştir:** `/admin/users` → kullanıcı seç → "Rol Değiştir" → STAFF
3. **Yeni hizmet ekle:** `/admin/services` → form → `global_services` insert → tüm salonlar bunu görür
4. **Plan değiştir:** `/admin/subscription-plans` → PRO planın fiyatını güncelle → mevcut aboneler etkilenmez (ileride yenilemede)
5. **Havale onay:** `/admin/finance/purchase` → bekleyen havale → "Onayla" → atomik RPC → salon APPROVED + subscription ACTIVE
6. **Audit:** Salon detayda "Audit Log" tab → tüm değişiklikler

## Açık Aksiyon (TODO)
- 🟡 **Salon onay UI** — manuel revizyon mesajı yazma alanı eksik (`rejected_reason` kolonu var)
- 🟡 **Kullanıcı arama** — `/admin/users` isim/email arama
- 🟡 **Bulk işlem** — toplu salon onay/red
- 🟡 **Audit log filtre** — tarih + tablo + kullanıcı bazlı filtre
- 🟢 **Admin yardımcısı (ADMIN rolü)** — sınırlı yetki politikası test edilmedi
- 🟢 **2FA admin için** — yüksek yetkili hesaba ek güvenlik
- 🟢 **Salon "askıya al"** — ödeme yapmayan salonu otomatik PASSIVE etme (cron)
- 🟢 **Platform metrikleri** — Recharts ile detay raporlar (DAU, MAU, churn)
- 🟢 **Email gönderim aracı** — admin'in toplu kampanya emaili
- 🟢 **Sistem sağlığı** — cron job çalışma durumu, hata loglarını dashboard'da göster

## Bağlantılar
- Admin layout: [app/admin/layout.tsx](../../app/admin/layout.tsx)
- Admin RBAC middleware: [middleware.ts](../../middleware.ts)
- Subscription plans page: [app/admin/subscription-plans/](../../app/admin/subscription-plans)
- Salon approval: [app/admin/salons/](../../app/admin/salons)
- IYS logs: [app/admin/iys-logs/](../../app/admin/iys-logs)
- Activate RPC: [initdb/archive/migration-history/New-36-Marketplace-Best-Practices.sql](../../initdb/archive/migration-history/New-36-Marketplace-Best-Practices.sql)
