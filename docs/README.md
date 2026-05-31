# Güzellik Randevu — Dokümantasyon

Bu klasör projenin **detaylı modül belgelerini** içerir. Üst düzey gereksinimler için [SPECIFICATIONS.md](SPECIFICATIONS.md) dosyasına bakın.

## Yapı

| Klasör | İçerik |
|--------|--------|
| `modules/` | Her iş modülü için detaylı belge (özellik + test + açık aksiyon) |
| `integrations/` | 3. parti entegrasyonlar (SMS, ödeme, AI, harita) |
| `infrastructure/` | DB, RLS, migration, deployment |
| `OPEN-ACTIONS.md` | Tüm açık görevlerin master listesi |

## Modüller

| Modül | Amaç |
|-------|------|
| [Auth](modules/auth.md) | Login, register, OTP, telefon doğrulama, KVKK |
| [Booking](modules/booking.md) | 4 adımlı randevu akışı + slot motoru |
| [Salon Marketplace](modules/salon-marketplace.md) | Public arama, listeleme, salon detay sayfası |
| [Salon Management](modules/salon-management.md) | Owner onboarding, salon CRUD, branding |
| [Staff](modules/staff.md) | Personel CRUD, mesai, hizmet eşleşme, davet |
| [Appointments](modules/appointments.md) | Randevu CRUD, takvim, hatırlatma |
| [Customer](modules/customer.md) | Müşteri profili, favoriler, geçmiş, yorum |
| [Finance](modules/finance.md) | Abonelik, ödeme geçmişi, kupon, paket, transactions |
| [Notifications](modules/notifications.md) | SMS kuyruğu, IYS uyumluluk, in-app bildirim |
| [Support](modules/support.md) | Destek talepleri, mesajlaşma, personel yorumları |
| [Admin](modules/admin.md) | Süper admin paneli, kullanıcı/salon onayı, platform ayarları |

## Entegrasyonlar

| Entegrasyon | Durum |
|-------------|-------|
| [NetGSM SMS](integrations/sms-netgsm.md) | Kod hazır, env eksik (demo mode) |
| [PayTR Ödeme](integrations/payment-paytr.md) | **AKTİF (1.1.0)** — iFrame API, abonelik için, demo modu test_mode=1 |
| [Iyzico Ödeme](integrations/payment-iyzico.md) | DEPRECATED — arşivde, provider switch ile geri dönüş mümkün |
| [Google Gemini AI](integrations/ai-gemini.md) | Aktif, salon insights ve chatbot |
| [Leaflet Harita](integrations/maps.md) | Aktif, OpenStreetMap |
| [Cloudflare Turnstile](integrations/turnstile.md) | Kod hazır, key eksik |
| [Google OAuth](integrations/oauth.md) | Kod hazır, opsiyonel |

## Altyapı

| Belge | İçerik |
|-------|--------|
| [Database Schema](infrastructure/database.md) | 47 tablo, 8 view, ER ilişkileri |
| [RLS & Güvenlik](infrastructure/rls.md) | 90 policy, rol matrisleri, denetim |
| [Migrations](infrastructure/migrations.md) | initdb akışı, New-XX dosyaları |
| [MCP & Geliştirme](infrastructure/mcp.md) | Supabase MCP, postgres MCP, akış |

## Belge Formatı (Yeni Modül Eklerken)

```markdown
# Modül: [Ad]

## Amaç
1-2 cümle. Bu modül neyi çözer?

## Roller / Aktör
Hangi kullanıcı rolleri kullanır?

## Aktif Özellikler
- ✅ Liste...

## Veri Modeli
| Tablo | Rol |
|-------|-----|

## Sayfa / Route
| Path | Açıklama |
|------|----------|

## API
| Endpoint | Method | Açıklama |
|----------|--------|----------|

## Test Adımları
1. ...

## Açık Aksiyon (TODO)
- 🔴 Kritik / 🟡 Orta / 🟢 Düşük

## Bağlantılar
Kod referansları
```

---

**Son güncelleme:** 2026-05-07 — Murat Yolal
