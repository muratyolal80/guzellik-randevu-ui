# Üretim Launch Checklist — Güzellik Randevu / kuaforara.com.tr

**Amaç:** Üretime alma öncesi tamamlanması gereken manuel adımlar. Her madde için: amaç, hesap açılış URL'i, env değişken adı, doğrulama yöntemi.

**Son güncelleme:** 2026-06-27
**Branch:** `chore/prod-launch-checklist`

---

## Durum Özeti

| # | Görev | Sorumlu | Durum | Aciliyet |
|---|-------|---------|-------|----------|
| 1 | İYS hesabı + API key | Murat (firma) | ⏳ Bekliyor | 🔴 Yasal zorunluluk |
| 2 | NetGSM canlı kredensiyel + `OTP_DEMO_MODE=false` | Murat (firma) | ⏳ Bekliyor | 🔴 |
| 3 | Resend API key | Murat | ⏳ Bekliyor | 🟡 |
| 4 | Google OAuth Client ID/Secret | Murat | ⏳ Bekliyor | 🟡 |
| 5 | `CRON_SECRET` üret + `.env` | Murat | ⏳ Bekliyor | 🟡 |
| 6 | PayTR canlı hesap + `test_mode=0` | Murat (firma) | ⏳ Bekliyor | 🔴 |
| 7 | Sentry projesi + DSN | Murat | ⏳ Bekliyor | 🟢 |
| 8 | UptimeRobot monitör | Murat | ⏳ Bekliyor | 🟢 |
| 9 | Cloudflare Turnstile site + secret key | Murat | ⏳ Bekliyor | 🟡 |
| 10 | Repo cleanup (`claude-skills/`, `.tmp/`) | Otomatik / Claude | ⏳ Bekliyor | 🟢 |

> 🔴 = Launch öncesi şart · 🟡 = Launch günü önerilir · 🟢 = Launch sonrası kabul edilir

---

## 1. İYS (İleti Yönetim Sistemi) — Yasal Zorunluluk

**Neden:** 6563 sayılı kanun gereği ticari elektronik ileti göndermek için **her telefon numarasının izninin İYS'ye kaydedilmesi şarttır**. SMS / e-posta gönderirken sistemimiz İYS'ye otomatik bildirim atar (`lib/messaging/iys.ts → registerIYSConsent`).

### Adımlar

1. **Hesap aç:** https://iys.org.tr/
   - Şirket türü: Mersis No + ticari sicil bilgileri ile başvuru
   - Onay süreci: 1-3 iş günü
2. **Marka kodu al:** İYS panelinden marka oluştur → marka kodu (ör. `KUAFORARA`)
3. **API Key oluştur:** Panel → Entegrasyon → API Key oluştur

### `.env`'e Eklenecekler

```env
IYS_API_BASE_URL=https://api.iys.org.tr/sps/{BRAND_CODE}
IYS_API_KEY=<panelden-alınan-bearer-token>
IYS_BRAND_CODE=<marka-kodu>
```

### Doğrulama

1. Kayıt ekranında bir telefon numarası ile yeni üye ol
2. OTP onayından sonra `sms_verifications.iys_registered_at` dolmuş olmalı:
   ```sql
   SELECT phone, iys_registered_at, iys_consent_id
   FROM sms_verifications
   ORDER BY created_at DESC LIMIT 5;
   ```
3. İYS panelinde "İzinler" altında numara görünmeli

---

## 2. NetGSM (SMS) — Canlı Mod

**Neden:** OTP kodları, randevu hatırlatmaları, iptal bildirimleri SMS ile gönderiliyor. Şu an `OTP_DEMO_MODE=true` → her zaman `111111` kabul ediliyor.

### Adımlar

1. **Hesap aç:** https://www.netgsm.com.tr/
   - Kurumsal başvuru → vergi levhası + imza sirküleri
2. **Header ismi başvuru:** "KUAFORARA" gibi gönderici adı — BTK onayı ~3-7 iş günü
3. **API kullanıcı adı + şifre** alınır

### `.env`'e Eklenecekler

```env
ILETIMERKEZI_USERCODE=<netgsm-kullanıcı-adı>
ILETIMERKEZI_PASSWORD=<netgsm-şifre>
ILETIMERKEZI_HEADER=KUAFORARA
OTP_DEMO_MODE=false
```

### Doğrulama

1. Test telefonuyla kayıt ol → gerçek SMS gelmeli
2. Server log'da: `[NetGSM] SMS sent successfully, code: 00` (00 = başarılı)
3. NetGSM panelinde rapor görünmeli

---

## 3. Resend (Email) — Şifremi Unuttum, Bildirim Email'leri

**Neden:** Sprint E ile şifremi unuttum akışı + EMAIL kanallı bildirimler eklendi. Provider olarak Resend kullanılıyor (`lib/email/resend.ts`).

### Adımlar

1. **Hesap aç:** https://resend.com/
   - Free tier: 100 email/gün, 3000 email/ay → MVP için yeterli
   - Üretim için pricing kontrol et
2. **Domain ekle:** Resend panel → Domains → `kuaforara.com.tr` ekle
3. **DNS TXT/MX kayıtlarını DNS provider'ında ayarla** (Cloudflare / GoDaddy vs.) — Resend talimat verir
4. **Verified** olduktan sonra API Key oluştur

### `.env`'e Eklenecekler

```env
RESEND_API_KEY=re_<senin-api-key>
EMAIL_FROM=noreply@kuaforara.com.tr
EMAIL_FROM_NAME=Kuaforara
```

### Doğrulama

1. `/forgot-password` sayfasından şifre sıfırlama iste
2. Resend panel → Logs'ta email görünmeli, gönderildi olmalı
3. Gelen kutusunda SPF/DKIM imzaları geçerli olmalı

---

## 4. Google OAuth (Login with Google)

**Neden:** Müşteri kayıt akışında "Google ile devam et" butonu hızlı onboarding sağlar.

### Adımlar

1. **Google Cloud Console:** https://console.cloud.google.com/
2. Yeni proje oluştur (örn. `kuaforara-prod`)
3. **OAuth Consent Screen** ayarla:
   - User type: External
   - App name: Kuaforara
   - Authorized domain: `kuaforara.com.tr`
4. **APIs & Services → Credentials → Create OAuth Client ID**:
   - Application type: Web application
   - Authorized JavaScript origins: `https://kuaforara.com.tr`, `http://localhost:3000` (dev için)
   - **Authorized redirect URIs:** `http://localhost:8000/auth/v1/callback` (self-hosted Supabase) ve `https://<prod-supabase-url>/auth/v1/callback`
5. Client ID + Client Secret alın

### Supabase Studio'da Etkinleştir

- Supabase Studio → Authentication → Providers → Google → Enable
- Client ID + Client Secret yapıştır → Save

### Doğrulama

1. Login sayfasında "Google ile devam et" görünür olmalı
2. Tıklayınca Google account chooser açılmalı
3. Onay sonrası `/customer/dashboard`'a yönlendirilmeli

---

## 5. CRON_SECRET — Hatırlatma Cron'u Korunması

**Neden:** Vercel cron `*/5 * * * *` → `/api/cron/notifications` çağırıyor. Authorization header'da `Bearer ${CRON_SECRET}` yoksa 401 dönüyor (rastgele tarayıcı çağrısı engellenir).

### Üretim

```powershell
# 32-byte random hex string oluştur (PowerShell)
[System.BitConverter]::ToString((1..32 | ForEach-Object { Get-Random -Maximum 256 })).Replace('-','').ToLower()
```

### `.env`'e Eklenecek

```env
CRON_SECRET=<az-önce-üretilen-64-karakterlik-hex>
```

### Vercel Üzerinde

Vercel Dashboard → Project → Settings → Environment Variables → `CRON_SECRET` ekle (Production scope)

### Doğrulama

1. Yetkisiz çağrı: `curl https://kuaforara.com.tr/api/cron/notifications` → **401 Unauthorized**
2. Yetkili çağrı: `curl -H "Authorization: Bearer $CRON_SECRET" ...` → **200 OK**
3. Vercel cron logu: 5 dakika içinde otomatik başarılı çağrı

---

## 6. PayTR Canlı Hesap (Abonelik Ödemesi)

**Neden:** Salon sahipleri platforma abonelik öderken kart bilgisi PayTR'ye gider. Şu an `test_mode=1` (gerçek para çekilmiyor).

### Adımlar

1. **Mağaza Panel Başvuru:** https://www.paytr.com/
   - Vergi levhası + ticaret sicil gazetesi + imza sirküleri + ödeme alacak hesap bilgileri
   - Onay süreci: 5-10 iş günü
2. **Mağaza ID, Merchant Key, Merchant Salt** alınır
3. **Bildirim URL (callback)** ayarla: `https://kuaforara.com.tr/api/paytr/callback`

### Admin Panel'de Aktivasyon

`/admin/settings` → PayTR sekmesi:
- Mağaza ID, Merchant Key, Merchant Salt gir
- `test_mode = 0` yap
- Save

### `.env` (Opsiyonel, eğer DB yerine env kullanılıyorsa)

```env
PAYTR_MERCHANT_ID=<mağaza-id>
PAYTR_MERCHANT_KEY=<merchant-key>
PAYTR_MERCHANT_SALT=<merchant-salt>
PAYTR_TEST_MODE=0
PAYTR_CALLBACK_URL=https://kuaforara.com.tr/api/paytr/callback
```

### Doğrulama

1. Test salon sahibi ile abonelik satın al
2. PayTR iframe açılır → gerçek kartla 3D Secure
3. Callback gelir → `subscriptions.status = 'ACTIVE'`
4. PayTR panelinde işlem görünür

---

## 7. Sentry — Hata İzleme

**Neden:** Üretimde frontend/backend hataları Sentry'ye gider (`sentry.*.config.ts` mevcut, sadece DSN bekliyor).

### Adımlar

1. **Hesap aç:** https://sentry.io/ (developer tier ücretsiz: 5k event/ay)
2. Project oluştur → Platform: **Next.js**
3. DSN URL al (örn. `https://abc123@o12345.ingest.sentry.io/789`)

### `.env`

```env
NEXT_PUBLIC_SENTRY_DSN=<senin-dsn-url>
SENTRY_ORG=<sentry-org-slug>
SENTRY_PROJECT=<proje-slug>
SENTRY_AUTH_TOKEN=<release-upload-token>
```

### Doğrulama

1. Bilerek bir runtime error tetikle (örn. test endpoint'i `throw new Error('test')`)
2. Sentry dashboard'da issue görünmeli

---

## 8. UptimeRobot — Çalışıyor mu Kontrolü

**Neden:** Site/API/DB her dakika ping atılır, çökerse SMS/email gelir.

### Adımlar

1. **Hesap aç:** https://uptimerobot.com/ (free: 50 monitor, 5 dk interval)
2. **3 monitör ekle:**
   - `https://kuaforara.com.tr` (HTTPS)
   - `https://kuaforara.com.tr/api/health` (varsa health endpoint)
   - `https://supabase.kuaforara.com.tr/rest/v1/` (Supabase Kong)
3. **Alert contacts:** email + SMS

---

## 9. Cloudflare Turnstile — Bot Koruması

**Neden:** Kayıt ve login formlarında bot trafiğini engelliyor (`F-080`).

### Adımlar

1. **Cloudflare Dashboard:** https://dash.cloudflare.com/
2. Turnstile → Add site → Domain: `kuaforara.com.tr`
3. Widget type: **Managed** (otomatik zorluk ayarı)
4. Site key + Secret key alın

### `.env`

```env
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=<site-key>
CLOUDFLARE_TURNSTILE_SECRET_KEY=<secret-key>
```

### Doğrulama

1. Login/register sayfasında Turnstile widget görünür olmalı
2. Form submit'te server-side `siteverify` çağrısı 200 dönmeli

---

## 10. Repo Cleanup — Çöp Klasörleri Sil

**Neden:** Local'de takılı kalmış skill klonları ve geçici dizinler.

### Adımlar (Windows PowerShell)

```powershell
Remove-Item -Recurse -Force claude-skills 2>$null
Remove-Item -Recurse -Force .tmp 2>$null
Remove-Item -Recurse -Force .tmp-claude-skills 2>$null
```

> Bu klasörler `.gitignore`'da, repo'ya etki etmez. Sadece disk'i temizler.

---

## Launch Günü Sırası

1. ✅ Tüm `.env` değişkenleri Vercel Production scope'una eklendi
2. ✅ Supabase prod cluster `.env` değerleri güncel
3. ✅ DNS kayıtları (`kuaforara.com.tr` + subdomain wildcard `*.kuaforara.com.tr`)
4. ✅ SSL sertifika (Cloudflare veya Let's Encrypt)
5. ✅ İlk admin kullanıcı oluşturuldu (SQL ile manuel)
6. ✅ İlk seed verisi (şehirler, ilçeler, servis tipleri)
7. ✅ Smoke test:
   - Anasayfa açılıyor
   - Kayıt + OTP + İYS akışı çalışıyor
   - Salon listesi, arama, randevu alma akışı bitiş ekranına kadar gidiyor
   - PayTR ile gerçek bir test ödemesi
   - Email gönderimi (şifre sıfırlama)
   - Cron 5 dakika sonra başarılı çalıştı

---

## Notlar

- **Murat'ın firma onayı bekleyen kalemler:** 1, 2, 6 — bunlar TR makamlarından onay gerektiriyor (vergi levhası, ticaret sicil, BTK)
- **Diğer kalemler self-service:** Murat tek başına 1-2 saat içinde tamamlayabilir
- **Sentry/UptimeRobot/Turnstile** launch günü öncesi son 24 saatte de yapılabilir, blocker değil
