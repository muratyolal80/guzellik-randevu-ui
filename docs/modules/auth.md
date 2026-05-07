# Modül: Kimlik Doğrulama (Auth)

## Amaç
Kullanıcı kayıt, giriş, telefon/email doğrulama ve KVKK onay süreçlerini yönetir. Supabase Auth üzerine kuruludur.

## Roller / Aktör
- Anonim ziyaretçi (kayıt/giriş)
- Tüm kayıtlı kullanıcılar (CUSTOMER, STAFF, MANAGER, SALON_OWNER, ADMIN, SUPER_ADMIN)

## Aktif Özellikler
- ✅ **Email/şifre login** — Supabase Auth standardı
- ✅ **Email kayıt** — `/register` (müşteri), `/register/business` (salon sahibi)
- ✅ **Telefon doğrulama** — 6 haneli OTP (`otp_codes` tablosu, 5 dk geçerli)
- ✅ **Email OTP** — alternatif doğrulama
- ✅ **OTP demo modu** — `OTP_DEMO_MODE=true` → her zaman `111111`
- ✅ **KVKK onay kaydı** — `profiles.kvkk_accepted_at`, `marketing_opt_in`
- ✅ **Soft-delete** — `profiles.deleted_at` (30 gün geri alma penceresi)
- ✅ **Rol hiyerarşisi** — middleware'de panel bazlı yönlendirme
- ✅ **Otomatik çıkış** — `is_active=false` kullanıcılar middleware'de logout
- ✅ **Davet linki** — staff invite (token bazlı)
- ✅ **AuthContext** — global auth state, `isAdmin`, `isOwner`, `isStaff`, `isAuthenticated` helper'ları
- ✅ **SMS verification logging** — İYS uyumluluğu için `sms_verifications` tablosu

## Veri Modeli
| Tablo | Rol |
|-------|-----|
| `auth.users` | Supabase Auth (system) |
| `profiles` | Public profil (rol, ad, telefon, KVKK, soft-delete kolonları) |
| `otp_codes` | 6 haneli kodlar (phone + code + expires_at + used) |
| `sms_verifications` | İYS log (user_id + phone + verified_at + iys_registered) |
| `user_sessions` | Aktif oturum kaydı (KVKK için "cihazlarımı yönet") |
| `iys_logs` | SMS gönderim log (admin paneli için) |

## Sayfa / Route
| Path | Açıklama |
|------|----------|
| `/login` | Giriş formu |
| `/register` | Müşteri kayıt |
| `/register/business` | Salon sahibi kayıt (onboarding'e yönlendirir) |
| `/kvkk` | KVKK aydınlatma metni |
| `/invite/[token]` | Personel davet kabul ekranı |

## API
| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/api/auth/send-email-otp` | POST | Email'e OTP gönderir |
| `/api/auth/verify-email` | POST | Email OTP doğrula |
| `/api/auth/verify-phone` | POST | Telefon OTP doğrula + İYS log + Supabase Auth user oluştur |
| `/api/booking/send-otp` | POST | Booking flow için OTP (auth dışı kullanıcılar için) |

## Test Adımları
1. **Müşteri kayıt:** `/register` → telefon + KVKK onayı → `/booking/.../user-info` testinde OTP `111111` (demo)
2. **Salon sahibi kayıt:** `/register/business` → form → `/owner/onboarding`
3. **Login:** `/login` → email + şifre → rol bazlı yönlendirme
   - CUSTOMER → `/customer/dashboard`
   - SALON_OWNER → `/owner/dashboard` (salon yoksa `/owner/onboarding`)
   - SUPER_ADMIN → `/admin`
4. **OTP demo:** `.env`'de `OTP_DEMO_MODE=true` iken `111111` her zaman geçerli
5. **Soft-delete:** `/customer/settings` → "Hesabımı sil" → 30 gün sonra DB'den çıkar (cron)

## Açık Aksiyon (TODO)
- 🟡 **Email OTP gönderimi** — şu an Resend/SendGrid entegrasyonu yok, sadece DB'ye yazıyor
- 🔴 **Production OTP** — `OTP_DEMO_MODE=false` yapılınca NetGSM env'leri girilmeli (bkz [SMS NetGSM](../integrations/sms-netgsm.md))
- 🟢 **Şifre sıfırlama** — Supabase Auth `resetPasswordForEmail` flow'u, UI eksik
- 🟢 **2FA** — opsiyonel, prod için sonraki faz
- 🟢 **Soft-delete cron** — 30 gün sonra hard-delete eden cron job yok
- 🟡 **İYS API çağrısı** — `verify-phone/route.ts:148` TODO yorumu, gerçek API entegrasyonu eksik

## Bağlantılar
- Auth Context: [context/AuthContext.tsx](../../context/AuthContext.tsx)
- Middleware: [middleware.ts](../../middleware.ts)
- OTP lib: [lib/auth/otp.ts](../../lib/auth/otp.ts)
- Verify phone: [app/api/auth/verify-phone/route.ts](../../app/api/auth/verify-phone/route.ts)
- KVKK columns migration: [initdb/New-04-Sync-Missing-Tables.sql](../../initdb/New-04-Sync-Missing-Tables.sql)
- OTP table migration: [initdb/New-10-OTP-Codes-Table.sql](../../initdb/New-10-OTP-Codes-Table.sql)
