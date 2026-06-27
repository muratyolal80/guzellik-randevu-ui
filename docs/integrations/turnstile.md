# Entegrasyon: Cloudflare Turnstile (Bot Koruması)

> SPECIFICATIONS.md referansı: **[F-091]**

## Amaç
Login, register, OTP gönderme, booking gibi yüksek-değerli formlarda bot/spam koruması. reCAPTCHA alternatifi, kullanıcı dostu (görünmez veya tek tık).

## Durum
🟢 **Kod aktif** — `components/common/Turnstile.tsx` widget bileşeni + `lib/turnstile.ts` server verify hazır. OTP send endpoint'inde entegre edildi (commit `9fd7b03`).
🟡 Cloudflare hesabı/key bekliyor — env yoksa demo mode (verify true döner).

## Konfigürasyon

`.env.local`:
```bash
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=0x4AAA...
CLOUDFLARE_TURNSTILE_SECRET_KEY=0x4AAA...
```

Key alma: https://dash.cloudflare.com/?to=/:account/turnstile

## Bileşenler

| Dosya | Amaç |
|-------|------|
| [`components/common/Turnstile.tsx`](../../components/common/Turnstile.tsx) | Widget wrapper — script lazy-load, demo mode (env yoksa render etmez), `onVerify(token)` callback |
| [`lib/turnstile.ts`](../../lib/turnstile.ts) | Server-side verify — `verifyTurnstile(token, ip)` Cloudflare siteverify endpoint'ini çağırır |

## Kullanım Alanları

| Form | Durum |
|------|-------|
| Booking OTP gönderme (`/api/booking/send-otp`) | ✅ Aktif (commit `9fd7b03`) |
| `/login` | 🟡 Bileşen var, henüz form'a eklenmedi |
| `/register` + `/register/business` | 🟡 Bileşen var, henüz form'a eklenmedi |
| Public review yazma | 🟢 İleride |

## Akış

```
Form yüklenir → <Turnstile sitekey={...} onSuccess={setToken} />
    ↓
Cloudflare → kullanıcı insan olduğunu doğrula (görünmez/tek tık)
    ↓
Token üret → form state'e kaydet
    ↓
Submit → server-side
    ↓
POST https://challenges.cloudflare.com/turnstile/v0/siteverify
    body: { secret, response: token }
    ↓
{ success: true/false }
    ↓
true → işleme devam, false → 403
```

## Test Adımları (Production'da)

1. Cloudflare hesabı → Turnstile widget oluştur (Test domain için "Always Pass")
2. Site key + Secret key `.env`'e
3. Restart server
4. `/login` → Turnstile widget görünmeli
5. Submit → backend'de `siteverify` çağrılmalı

## Açık Aksiyon (TODO)
- 🟡 **Cloudflare hesap + key** — kullanıcı oluşturmalı
- 🟡 **Login/Register formlarına widget ekle** — şu an sadece OTP send'de aktif
- 🟢 **Rate limit ile kombinasyon** — `lib/rate-limit.ts` zaten var, Turnstile ile birlikte iki katmanlı koruma (booking endpoint'inde her ikisi de aktif)
- 🟢 **Suspicious user score** — Turnstile widget output'u logla, `audit_logs`'da takip

## Bağlantılar
- Widget: [components/common/Turnstile.tsx](../../components/common/Turnstile.tsx)
- Server verify: [lib/turnstile.ts](../../lib/turnstile.ts)
- Rate limit lib: [lib/rate-limit.ts](../../lib/rate-limit.ts)
- Turnstile docs: https://developers.cloudflare.com/turnstile/
