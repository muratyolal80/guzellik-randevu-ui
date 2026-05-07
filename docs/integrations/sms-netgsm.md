# Entegrasyon: NetGSM SMS

## Amaç
Türkiye operatörleri üzerinden SMS gönderme. OTP doğrulama, randevu hatırlatma, kampanya SMS'leri.

## Durum
🟡 **Demo Mode aktif** — Kod hazır, env eksik. Production için NetGSM hesabı + 3-7 gün İYS başlık onayı bekleniyor.

## Sağlayıcı Karşılaştırma (Karar Kayıtları)

| Sağlayıcı | TL/SMS | İYS | Notlar |
|-----------|--------|-----|--------|
| **NetGSM** ⭐ | 0.10–0.18 | ✅ otomatik | Türkiye'nin en köklü, kodda zaten entegre |
| İletiMerkezi | 0.10–0.15 | ✅ otomatik | Modern panel, alternatif |
| Twilio | 0.40–0.60 | ❌ manuel | Global, TR için pahalı |
| MessageBird | 0.30–0.50 | ❌ manuel | Çoklu kanal, TR için pahalı |

## Konfigürasyon

`.env` dosyasına eklenecek:
```bash
NETGSM_USERCODE=8501234567       # NetGSM panelinden alınan kullanıcı kodu
NETGSM_PASSWORD=xxxxxxxx          # API şifresi (panel şifresinden farklı olabilir)
NETGSM_HEADER=KUAFORARA           # İYS onaylı marka başlığı (3-7 gün sürer)
OTP_DEMO_MODE=false               # Production için
```

## Kod Mimarisi

```
[Booking flow / cron]
    ↓
notification_queue tablosuna insert (channel='SMS', status='PENDING')
    ↓
[Cron her 5 dk] services/server-notification.ts:processQueue()
    ↓
sendSmsViaNetgsm(phone, message)
    ↓
NetGSM REST API (POST https://api.netgsm.com.tr/sms/send/get)
    ↓
status='SENT' veya retry (max 3 deneme, 5 dk gecikme)
    ↓
iys_logs'a audit kaydı
```

**Demo mode davranışı:** Eğer `NETGSM_USERCODE` veya `NETGSM_PASSWORD` env'de yoksa → console.log ile yazar, gerçek API çağırmaz, `success=true` döner.

## Test Adımları

### Demo modda (şu an)
1. Booking flow'da telefon doğrulama
2. Console'da `[DEMO SMS] To: +905...| Msg: ...` görmeli
3. OTP kodu her zaman `111111`

### Production'a geçince
1. https://www.netgsm.com.tr → hesap aç
2. Panel → "Marka Başlıkları" → `KUAFORARA` ekle (örn) → İYS onayını bekle
3. Panel → "API Kullanıcısı" → kullanıcı kodu + API şifre
4. `.env`'i güncelle, `OTP_DEMO_MODE=false`
5. `npm run dev` restart
6. Test telefon ile gerçek SMS al
7. NetGSM panel → "SMS Raporları"nda gelen iste karşılaştır

## Açık Aksiyon (TODO)
- 🔴 **NetGSM hesap açma** — kullanıcı sürecini başlatacak
- 🔴 **İYS başlık onayı** — `KUAFORARA` (veya tercih edilen) için başvuru
- 🟡 **İYS API entegrasyonu** — şu an gönderilen SMS'lerin İYS portalına otomatik kaydı eksik (`verify-phone/route.ts:148` TODO)
- 🟡 **Vercel Cron** — `processQueue` her 5 dk'da otomatik çağıracak external scheduler eksik
- 🟢 **Failover** — NetGSM down ise İletiMerkezi gibi yedek sağlayıcı
- 🟢 **SMS şablon yönetimi** — template engine, owner customizable mesajlar
- 🟢 **Maliyet takibi** — `iys_logs.cost` kolonu eklenip aylık fatura tahmini

## Bağlantılar
- SMS lib: [services/netgsm.ts](../../services/netgsm.ts)
- Server-side notification: [services/server-notification.ts](../../services/server-notification.ts)
- OTP lib: [lib/auth/otp.ts](../../lib/auth/otp.ts)
- Cron reminders: [app/api/cron/reminders/route.ts](../../app/api/cron/reminders/route.ts)
- IYS logs migration: [initdb/New-06-Final-Sync.sql](../../initdb/New-06-Final-Sync.sql)
- İYS resmi: https://iys.org.tr
- NetGSM API doc: https://www.netgsm.com.tr/dokuman/
