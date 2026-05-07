# Modül: Bildirimler (Notifications)

## Amaç
SMS, in-app, ve email kanalları üzerinden kullanıcılara bildirim gönderme. Cron tabanlı kuyruk işleme + İYS uyumluluk.

## Roller / Aktör
- Sistem (cron job)
- SUPER_ADMIN (manuel bildirim gönderme)
- Tüm kullanıcılar (alıcı)

## Aktif Özellikler
- ✅ **In-app bildirim merkezi** — `/customer/notifications` (her rol için benzer)
- ✅ **SMS gönderim altyapısı** — NetGSM entegrasyonu
- ✅ **OTP SMS** — telefon doğrulama (booking + register flow)
- ✅ **Randevu hatırlatma cron** — `/api/cron/reminders` (24 saat öncesi)
- ✅ **Realtime publication** — `notifications` tablosu Supabase Realtime'a açık
- ✅ **Bildirim tipleri** — INFO, SUCCESS, WARNING, ERROR, APPOINTMENT, REVIEW, SYSTEM, REMINDER, PROMOTION, BOOKING
- ✅ **İYS log** — `iys_logs` (gönderilen tüm SMS'ler)
- ✅ **SMS verification log** — `sms_verifications` (KVKK için telefon onay kaydı)
- ✅ **Notification queue** — `notification_queue` tablosu, retry logic (max 3)
- ✅ **Demo mode** — `OTP_DEMO_MODE=true` SMS'leri DB'ye yazar ama göndermez

## Veri Modeli
| Tablo | Rol |
|-------|-----|
| `notifications` | In-app bildirim (user_id, salon_id, title, content, type, is_read, link) |
| `notification_queue` | Cron tabanlı dış kanal kuyruğu (channel: SMS/EMAIL/PUSH) |
| `sms_verifications` | İYS uyumluluk için telefon onay kaydı |
| `iys_logs` | Gönderilen SMS'lerin audit log'u |
| `otp_codes` | 6 haneli kodlar |

## Sayfa / Route
| Path | Açıklama |
|------|----------|
| `/customer/notifications` | Müşteri bildirim merkezi |
| `/admin/iys-logs` | Admin SMS log paneli |

## API
| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/api/cron/reminders` | GET | 24 saat öncesi randevuları bul, queue'ya at |
| `/api/auth/verify-phone` | POST | OTP üret + SMS gönder + `iys_logs` kayıt |
| `/api/booking/send-otp` | POST | Booking flow OTP'si |

## Akış: Randevu Hatırlatma
```
[Cron her saat] /api/cron/reminders
  → 24 saat sonrası randevuları sorgula
  → Her biri için notification_queue'ya SMS ekle
  → reminder_sent=true olarak işaretle

[Cron her 5 dk] processQueue()
  → status='PENDING' ve scheduled_for<=now()
  → NetGSM API ile SMS gönder
  → Başarılı → status='SENT', iys_logs'a yaz
  → Başarısız → tries++, scheduled_for=now+5dk
  → 3 deneme başarısız → status='FAILED'
```

## Test Adımları
1. **In-app bildirim:** SQL ile manuel insert → Realtime ile UI anında günceller
2. **OTP SMS:** Booking flow → telefon gir → demo mode'da `111111` döner, queue'ya yazılır
3. **Hatırlatma cron:** Yarın 10:00 randevu var → `curl /api/cron/reminders` → `notification_queue` 1 kayıt
4. **Queue processor:** Manuel çağır (cron production'da) → SMS gönderim simüle (demo mode'da log)
5. **İYS log:** Admin → `/admin/iys-logs` → tüm SMS gönderim geçmişi
6. **Retry mantığı:** Demo mode'u kapatıp invalid NetGSM cred ver → 3 başarısız deneme → FAILED status

## Açık Aksiyon (TODO)
- 🔴 **NetGSM production env** — `NETGSM_USERCODE`, `NETGSM_PASSWORD`, `NETGSM_HEADER` env'de yok (demo mode aktif)
- 🔴 **İYS gerçek API çağrısı** — `verify-phone/route.ts:148` TODO; izin verilen telefonların İYS portalına kaydı manuel
- 🟡 **Queue processor cron** — `processQueue` fonksiyonu var ama otomatik çalıştıran cron job yok (production'da Vercel Cron / external scheduler gerekli)
- 🟡 **Email channel** — `notification_queue.channel='EMAIL'` enum'da var ama gönderici yok (Resend/SendGrid)
- 🟡 **Push notification** — `channel='PUSH'` desteklenmiyor (FCM/Expo entegrasyonu)
- 🟢 **Bildirim tercihleri** — kullanıcı per-tip on/off toggle yok
- 🟢 **Bulk bildirim (admin)** — segmente toplu bildirim UI yok
- 🟢 **Template engine** — şu an content text; placeholder ({{customer_name}}) sistemi yok
- 🟢 **Realtime sayaç** — header'da okunmamış bildirim badge realtime güncellemesi tüm sayfalarda test edilmeli

## Bağlantılar
- Server-side notification: [services/server-notification.ts](../../services/server-notification.ts)
- NetGSM lib: [services/netgsm.ts](../../services/netgsm.ts)
- Reminders cron: [app/api/cron/reminders/route.ts](../../app/api/cron/reminders/route.ts)
- Notification queue migration: [initdb/New-06-Final-Sync.sql](../../initdb/New-06-Final-Sync.sql)
- OTP table migration: [initdb/New-10-OTP-Codes-Table.sql](../../initdb/New-10-OTP-Codes-Table.sql)
- SMS NetGSM detay: [SMS NetGSM](../integrations/sms-netgsm.md)
