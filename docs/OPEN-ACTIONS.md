# Açık Aksiyon Listesi (Master Tracker)

Bu belge tüm modül ve entegrasyon belgelerindeki **TODO** maddelerini birleştirir. Tek bakışta projenin "yapılacak iş" listesini gösterir.

**Önem ölçeği:**
- 🔴 **Kritik** — production launch öncesi şart
- 🟡 **Orta** — yakın zamanda (sonraki sprint)
- 🟢 **Düşük** — backlog

**Son güncelleme:** 2026-05-07

---

## 🔴 Kritik (Launch Blocker)

| # | Aksiyon | Modül | Sahip |
|---|---------|-------|-------|
| K1 | NetGSM hesap aç + İYS başlık `KUAFORARA` onayı | [SMS](integrations/sms-netgsm.md) | Kullanıcı |
| K2 | `.env` production NetGSM kredensiyalleri + `OTP_DEMO_MODE=false` | [SMS](integrations/sms-netgsm.md) | Kullanıcı |
| K3 | Iyzico production hesap onayı | [Payment](integrations/payment-iyzico.md) | Kullanıcı |
| K4 | İYS API entegrasyonu — `verify-phone/route.ts:148` TODO | [Auth](modules/auth.md), [Notif](modules/notifications.md) | Dev |
| K5 | RLS — `salons/salon_services` üzerinde DELETE policy yasak (audit) | [RLS](infrastructure/rls.md) | Dev |
| K6 | PCI-DSS audit (Iyzico tokenization sonrası) | [Payment](integrations/payment-iyzico.md) | Kullanıcı + Dev |

---

## 🟡 Orta (Sonraki Sprint)

### Auth & Doğrulama
- 🟡 **Email OTP gönderimi** — Resend/SendGrid entegrasyonu yok ([Auth](modules/auth.md))
- 🟡 **Soft-delete cron** — 30 gün sonra hard-delete cron yok ([Customer](modules/customer.md))

### Booking
- 🟡 **Geçmiş saat filtresi** — bugün için geçmiş saatler slot'ta görünüyor ([Booking](modules/booking.md))
- 🟡 **Multi-resource booking** — `salon_resources` flow'a entegre değil ([Booking](modules/booking.md))

### Salon
- 🟡 **Onboarding wizard validation** — boş geçişler engellenmemiş ([Salon Mgmt](modules/salon-management.md))
- 🟡 **Galeri sıralama** — drag&drop mobile bug ([Salon Mgmt](modules/salon-management.md))
- 🟡 **Gerçek galeri görselleri** — placeholder var, owner upload UI tamamlanmalı ([Marketplace](modules/salon-marketplace.md))
- 🟡 **Harita marker cluster** — yoğun şehirde pin üst üste ([Marketplace](modules/salon-marketplace.md), [Maps](integrations/maps.md))

### Personel
- 🟡 **Email davet gönderimi** — token üretiliyor ama email yok ([Staff](modules/staff.md))
- 🟡 **İzin/tatil günleri** — tek seferlik izin (örn. yarın izinli) yok ([Staff](modules/staff.md))

### Randevu
- 🟡 **Drag & drop owner takvim** — backend update_appointment kontrolü ([Appointments](modules/appointments.md))
- 🟡 **No-show işaretleme** — `status='NO_SHOW'` enum'a eklenmeli ([Appointments](modules/appointments.md))
- 🟡 **Multi-service randevu** — tek satır yerine `appointment_services` join ([Appointments](modules/appointments.md))

### Müşteri
- 🟡 **Yorum düzenleme UI** — sadece silme var ([Customer](modules/customer.md))

### Finans
- 🟡 **Refund flow UI** — kapora geri ödeme akışı test edilmemiş ([Finance](modules/finance.md))
- 🟡 **Sub-merchant aktivasyon UI** — IBAN onay süreci ([Finance](modules/finance.md))
- 🟡 **Plan downgrade kontrolü** — limit aşımı koruması yok ([Finance](modules/finance.md))

### Bildirim
- 🟡 **Queue processor cron** — `processQueue` otomatik çağıran scheduler yok (Vercel Cron) ([Notifications](modules/notifications.md))
- 🟡 **Email channel** — `notification_queue.channel='EMAIL'` enum'da var ama gönderici yok ([Notifications](modules/notifications.md))
- 🟡 **Push notification** — FCM/Expo entegrasyonu ([Notifications](modules/notifications.md))

### Destek
- 🟡 **Ticket UI tamamlanması** — admin filtre/atama eksik ([Support](modules/support.md))
- 🟡 **Yorum moderasyonu** — admin spam yorumu silme/onaylama ([Support](modules/support.md))

### Admin
- 🟡 **Salon onay UI** — manuel revizyon mesajı yazma alanı eksik ([Admin](modules/admin.md))
- 🟡 **Kullanıcı arama** — isim/email arama eksik ([Admin](modules/admin.md))
- 🟡 **Bulk işlem** — toplu onay/red ([Admin](modules/admin.md))
- 🟡 **Audit log filtre** — tarih + tablo + kullanıcı bazlı ([Admin](modules/admin.md))

### Entegrasyon
- 🟡 **Cloudflare Turnstile keys** — env'e eklenmeli ([Turnstile](integrations/turnstile.md))
- 🟡 **Gemini rate limit** — paid tier ([AI](integrations/ai-gemini.md))
- 🟡 **Token maliyet izleme** — AI kullanım audit ([AI](integrations/ai-gemini.md))
- 🟡 **Geo-distance arama** — PostGIS ST_DWithin ([Maps](integrations/maps.md))

### Altyapı
- 🟡 **Master schema güncelleme** — DB ile sync değil ([Database](infrastructure/database.md))
- 🟡 **Migration tracking tablosu** — `_migrations` ([Migrations](infrastructure/migrations.md))
- 🟡 **MCP doc onboarding** — yeni geliştirici test ([MCP](infrastructure/mcp.md))

---

## 🟢 Düşük (Backlog)

### Auth
- 🟢 Şifre sıfırlama UI
- 🟢 2FA admin için
- 🟢 Apple Sign-In (iOS launch için)

### Booking
- 🟢 Grup hizmeti kapasite kontrolü
- 🟢 Çoklu şubede konum bazlı slot blok
- 🟢 Tampon süresi (buffer)
- 🟢 Capacity-aware "Any staff" (en az meşgul)

### Salon
- 🟢 Salon kapatma (PASSIVE) UI
- 🟢 REVISION_REQUESTED bildirim
- 🟢 Multi-language description
- 🟢 Bulk hizmet ekleme
- 🟢 Filtre persist URL bug
- 🟢 Yakındaki salonlar (geo)
- 🟢 Yorum filtreleme (verified only)
- 🟢 Salon karşılaştırma
- 🟢 Open Graph card

### Personel
- 🟢 Vardiya sistemi (sabahçı/akşamcı)
- 🟢 Personel performans raporu
- 🟢 Bulk import (CSV)
- 🟢 Staff layout iyileştirme
- 🟢 TC No doğrulama API

### Randevu
- 🟢 Otomatik no-show tespiti
- 🟢 Tekrar eden randevu (haftalık/aylık)
- 🟢 Bekleme listesi (waitlist)
- 🟢 Calendar export (.ics)

### Müşteri
- 🟢 Çoklu adres
- 🟢 Saved card (Iyzico tokenization)
- 🟢 Tercih edilen personel
- 🟢 Randevu öncesi anket

### Finans
- 🟢 Pro-rata charge
- 🟢 Multi-currency (EUR/USD)
- 🟢 Recurring webhook
- 🟢 Komisyon raporu

### Bildirim
- 🟢 Bildirim tercihleri (per-tip on/off)
- 🟢 Bulk bildirim (admin)
- 🟢 Template engine (placeholder)
- 🟢 Realtime sayaç tüm sayfalar test

### Destek
- 🟢 Ticket atama
- 🟢 Ticket SLA
- 🟢 Email bildirim
- 🟢 Owner yanıtı (yorumlara)
- 🟢 Yorum filtre

### Admin
- 🟢 Admin yardımcısı (ADMIN rolü test)
- 🟢 2FA admin için
- 🟢 Otomatik pasifleştirme
- 🟢 Detay metrik raporları
- 🟢 Email kampanya aracı
- 🟢 Sistem sağlığı dashboard

### Entegrasyon
- 🟢 NetGSM failover (İletiMerkezi yedek)
- 🟢 Mapbox geçişi (yüksek trafik)
- 🟢 Google OAuth (sosyal login)
- 🟢 Salon-spesifik chatbot (RAG)
- 🟢 Yorum AI özeti

### Altyapı
- 🟢 DB index audit
- 🟢 Vacuum/analyze cron
- 🟢 Backup stratejisi
- 🟢 CI'da migration test
- 🟢 archive/old temizliği
- 🟢 pgTAP policy testleri

---

## Belge Sürüm Geçmişi

| Tarih | İşlem |
|-------|-------|
| 2026-05-07 | İlk oluşturma — 11 modül + 6 entegrasyon + 4 altyapı belgesi |

## Belge Güncelleme Kuralı

CLAUDE.md "Belge Güncelleme Kuralı"na göre:
- Her özellik/değişiklik commit edilmeden önce ilgili belge güncellenir
- Yeni TODO eklenirse veya çözülürse bu dosyaya yansıtılır
- Sürüm geçmişi tutulur
