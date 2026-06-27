# Modül: Salon Yönetimi (Owner)

## Amaç
Salon sahibinin işletmesini onboarding'den itibaren CRUD işlemleri ile yönetebildiği panel. Multi-branch (çoklu şube) destekli.

## Roller / Aktör
- SALON_OWNER (ana kullanıcı)
- MANAGER (salon sahibi tarafından atanan yardımcı yönetici)

## Aktif Özellikler
- ✅ **Onboarding wizard** — 5 adımlı yeni salon kaydı (Bilgi → Konum → Saatler → Hizmetler → Personel)
- ✅ **Çoklu salon (şube)** — bir owner birden fazla salon yönetebilir
- ✅ **Aktif şube context** — `ActiveBranchContext` ile panel bağlamı
- ✅ **Salon CRUD** — bilgi, adres, telefon, görsel
- ✅ **Onay akışı** — `DRAFT → SUBMITTED → APPROVED/REJECTED/REVISION_REQUESTED`
- ✅ **Hizmet yönetimi** — global servisler içinden seçim + fiyat/süre özelleştirme
- ✅ **Salon mesai saatleri** — haftalık takvim (`salon_working_hours`)
- ✅ **Galeri yönetimi** — fotoğraf yükleme/silme/sıralama
- ✅ **Branding** — `primary_color`, `logo_url`, `banner_url` (PRO+ plan)
- ✅ **Kapora ayarı** — randevuda kapora alma toggle
- ✅ **Subdomain (slug)** — `salons.slug` (subdomain için kısa ad)
- ✅ **AI insights** — Gemini AI ile dashboard önerileri
- ✅ **Plan-gate** — özellikler `subscription_plans.has_*` flag'lerine göre kilitli
- ✅ **Audit log** — tüm değişiklikler `audit_logs`'a yazılır

## Veri Modeli
| Tablo | Rol |
|-------|-----|
| `salons` | Ana kayıt (40 kolon — adres, branding, plan vs.) |
| `salon_assigned_types` | Çoklu tip eşleme |
| `salon_services` | Sunulan hizmetler |
| `salon_working_hours` | Haftalık mesai (7 satır/salon) |
| `salon_resources` | Ekipman/oda (büyük salonlar için) |
| `salon_gallery` | Fotoğraflar |
| `audit_logs` | Değişiklik logu |
| `subscriptions` | Aktif plan kaydı |

## Sayfa / Route
| Path | Açıklama |
|------|----------|
| `/owner/onboarding` | İlk salon ekleme wizard'ı |
| `/owner/dashboard` | Genel istatistik + AI insights |
| `/owner/salons` | Şube listesi + ekleme |
| `/owner/services` | Hizmet yönetimi |
| `/owner/staff` | Personel yönetimi (bkz [Staff modülü](staff.md)) |
| `/owner/calendar` | Randevu takvimi (FullCalendar v6) |
| `/owner/customers` | CRM — müşteri listesi (bkz [Customer modülü](customer.md)) |
| `/owner/finance` | Abonelik + ödeme geçmişi (bkz [Finance modülü](finance.md)) |
| `/owner/campaigns` | Kupon + kampanya yönetimi |
| `/owner/packages` | Paket hizmet yönetimi |
| `/owner/resources` | Ekipman/oda kayıtları |
| `/owner/reports` | Recharts tabanlı raporlar |

## API
| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/api/owner/ai-insights` | GET | Gemini ile dashboard insight üret |
| `/api/subscription/subscribe` | POST | Plan değişikliği başlat (Iyzico) |

## Test Adımları
1. **Yeni salon kaydı:** SALON_OWNER login → `/owner/onboarding` → 5 adım → `DRAFT` kaydı
2. **Onaya gönder:** `/owner/salons` → "Onaya Gönder" → status `SUBMITTED`
3. **Admin onayı sonrası:** Salon publik aramada görünür
4. **Hizmet ekle:** `/owner/services` → global servisten seç + fiyat → `salon_services` kaydı
5. **Mesai değiştir:** `/owner/salons/[id]` → 7 günlük tablo + kapalı/açık toggle
6. **Branding:** PRO+ planı yoksa color picker disable
7. **Şube ekle:** `/owner/salons` → "Yeni Şube" → ikinci salon
8. **Aktif şube değiştir:** Header'daki dropdown → context değişir, tüm sayfalar yeni salon verisini gösterir

## Açık Aksiyon (TODO)
- 🟡 **Onboarding wizard validation** — bazı adımlarda boş geçiş engeli yok (UI test gerek)
- 🟡 **Galeri sıralama** — drag & drop var ama mobile'da sorunlu
- 🟢 **Salon kapatma (PASSIVE)** — kullanıcı UI'sı yok, sadece status update
- 🟢 **REVISION_REQUESTED akışı** — admin red mesajı kullanıcıya bildirim olarak gitmiyor
- 🟢 **Multi-language description** — şu an sadece Türkçe
- 🟢 **Bulk hizmet ekleme** — kategoriden toplu içe aktarma
- 🔴 **DELETE yasağı** — RLS'de salon DELETE owner'a yasak (status'a düşürme yapılır), UI bunu doğru yansıtıyor mu?

## Bağlantılar
- Onboarding: [app/owner/onboarding/page.tsx](../../app/owner/onboarding/page.tsx)
- Owner layout: [app/owner/layout.tsx](../../app/owner/layout.tsx)
- Plan guard: [components/PlanGuard.tsx](../../components/PlanGuard.tsx)
- Active branch context: [context/ActiveBranchContext.tsx](../../context/ActiveBranchContext.tsx)
- DB queries: [services/db/db_salon.ts](../../services/db/db_salon.ts)
- AI insights API: [app/api/owner/ai-insights/route.ts](../../app/api/owner/ai-insights/route.ts)
