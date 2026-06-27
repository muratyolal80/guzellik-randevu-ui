# Açık Aksiyon Listesi (Master Tracker)

Bu belge tüm modül ve entegrasyon belgelerindeki **TODO** maddelerini birleştirir. Tek bakışta projenin "yapılacak iş" listesini gösterir.

**Önem ölçeği:**
- 🔴 **Kritik** — production launch öncesi şart
- 🟡 **Orta** — yakın zamanda (sonraki sprint)
- 🟢 **Düşük** — backlog

**Son güncelleme:** 2026-06-27

---

## 🔴 Kritik (Launch Blocker)

| # | Aksiyon | Modül | Sahip |
|---|---------|-------|-------|
| K1 | NetGSM hesap aç + İYS başlık `KUAFORARA` onayı | [SMS](integrations/sms-netgsm.md) | Kullanıcı |
| K2 | `.env` production NetGSM kredensiyalleri + `OTP_DEMO_MODE=false` | [SMS](integrations/sms-netgsm.md) | Kullanıcı |
| ~~K3~~ | ~~Iyzico production hesap onayı~~ → Ertelendi, **PayTR'ye geçildi** (`1.1.0`) | [Payment-Iyzico](integrations/payment-iyzico.md) (arşiv) | — |
| K3a | **PayTR canlı hesap onayı + `paytr_config.test_mode=0` yap** | [PayTR](integrations/payment-paytr.md) | Kullanıcı |
| K4 | İYS API entegrasyonu — `verify-phone/route.ts:148` TODO | [Auth](modules/auth.md), [Notif](modules/notifications.md) | Dev |
| K5 | RLS — `salons/salon_services` üzerinde DELETE policy yasak (audit) | [RLS](infrastructure/rls.md) | Dev |
| ~~K6~~ | ~~PCI-DSS audit (Iyzico tokenization sonrası)~~ → PayTR iFrame ile gerek yok (kart bize değmiyor) | [Payment-PayTR](integrations/payment-paytr.md) | — |

---

## 🟡 Orta (Sonraki Sprint)

### Auth & Doğrulama
- 🟡 **Email OTP gönderimi** — Resend/SendGrid entegrasyonu yok ([Auth](modules/auth.md))
- 🟡 **Soft-delete cron** — 30 gün sonra hard-delete cron yok ([Customer](modules/customer.md))

### Booking
- ✅ ~~Geçmiş saat filtresi~~ — `slot.ts` artık bugünkü `now()+15dk` altındaki slot'ları filtreler (commit Faz 3)
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
- ✅ ~~No-show işaretleme~~ — `appt_status` enum'a `NO_SHOW` eklendi (Faz 3, New-11). UI butonu eklenmesi kaldı.
- 🟡 **Multi-service randevu** — tek satır yerine `appointment_services` join ([Appointments](modules/appointments.md))

### Müşteri
- 🟡 **Yorum düzenleme UI** — sadece silme var ([Customer](modules/customer.md))

### Finans
- 🟡 **Booking kapora ödemesi (PayTR/Iyzico)** — şu an YOK; aktivasyon için (a) PayTR Pazaryeri modülü veya (b) Iyzico sub-merchant onayı gerekir ([PayTR](integrations/payment-paytr.md))
- 🟡 **Refund flow UI** — admin tarafından abonelik iadesi (`/api/paytr/refund` hazır, UI butonu eksik) ([PayTR](integrations/payment-paytr.md))
- 🟡 **Recurring abonelik (PayTR tokenization)** — şu an her ay owner elle ödüyor; saved card ileri sprint ([PayTR](integrations/payment-paytr.md))
- 🟡 **Plan downgrade kontrolü** — limit aşımı koruması yok ([Finance](modules/finance.md))
- 🟡 **Manuel IBAN transfer otomasyonu** — salon gelirleri için (PayTR sub-merchant yok) ([PayTR](integrations/payment-paytr.md))

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
- 🔴 **Coolify deployment guide** — `docs/infrastructure/coolify-deployment.md` yazılacak (Next.js + self-hosted Supabase + Postgres dump/restore + Storage migration + DNS/SSL + env mapping) — kullanıcı acil ihtiyaç
- 🟡 **React Compiler cleanup** — `useEffect` missing deps × 47, `set-state-in-effect` × 3, `<img>` → next/Image × 30, custom fonts × 3 — `chore/react-compiler-cleanup` branch
- 🟡 **Admin header overflow** — sağ üst düğme grubu sayfayı sağa kaydırıyor (responsive bug) — kullanıcı ekran görüntüsü paylaşacak
- 🟡 **Test coverage 38 → 70+** — PayTR token + callback verify, slot-lock, rate-limit, notification queue, password complexity, KVKK consent
- 🟡 **Multi-resource booking UI** — `New-19` RPC hazır, UI eksik (owner panelde hizmete kaynak atama + booking flow'unda otomatik atama)
- 🟡 **PayTR refund admin UI** — `/api/paytr/refund` hazır, admin butonu eksik
- 🟡 **Master schema güncelleme** — DB ile sync değil ([Database](infrastructure/database.md))
- ✅ ~~Migration tracking tablosu~~ — `_migrations` tablosu eklendi (Faz 3, New-11). Geriye dönük tüm New-XX kaydedildi.
- ✅ ~~RLS aktif olup GRANT eksik tablolar~~ — New-14 ile tüm tablolarda `authenticated` SELECT GRANT tamamlandı, audit query `db-health-check.sql` Section 8'e eklendi.
- ✅ ~~`otp_codes` RLS açık ama policy yok~~ — `New-20` ile `service_role_full_access` policy eklendi (2026-06-27). anon/auth erişimi yok (doğru davranış), niyet açık şekilde belgelendi.
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
| 2026-05-07 | Faz 2 — Demo OTP autofill + KVKK/TEİ modal metinleri |
| 2026-05-07 | Faz 3 — Geçmiş saat slot filtresi + NO_SHOW enum + _migrations tracking (3 TODO çözüldü) |
| 2026-05-31 | New-14 — support_tickets boş `{}` hatası onarımı + 17 tabloda authenticated SELECT GRANT audit + health-check Section 8 + CLAUDE.md RLS+GRANT kuralı |
| 2026-06-01 | **PayTR iFrame entegrasyonu (1.1.0)** — sadece abonelik için. Iyzico arşivde, provider switch ile geri dönüş mümkün. Faz 0 admin finance crash fix + Faz A-F PayTR (New-15, lib/types/routes/modal/admin settings) + payment-paytr.md belge |
| 2026-06-27 | **Production hijyen (1.1.1)** — `otp_codes` RLS policy gap kapatıldı (`New-20`, service_role explicit policy). `docs/PROD-LAUNCH-CHECKLIST.md` eklendi (10 manuel adım rehberi). `.gitignore` 4 güvenlik kuralı + `tmp/` git-untrack. Bozuk merge commit'leri revert (yedek: `backup-broken-merge-20260627` branch). |
| 2026-06-27 | **MCP doc + test hesapları (1.1.2)** — SPECIFICATIONS §2.1 lokal test hesapları, MCP topolojisi gerçek kuruluma göre güncellendi (postgres `54322` doğrudan, supabase-storage özel MCP `scripts/mcp/supabase-storage-mcp.mjs`), `docs/MANUAL-TEST-CASES.md` QA belgesi eklendi |
| 2026-06-27 | **ESLint 9 + rules-of-hooks fix** — `next lint` Next.js 16'da kaldırıldı; `eslint.config.mjs` flat config (`eslint-config-next/core-web-vitals`). `app/admin/users/page.tsx`'te hooks erken return öncesine taşındı (kritik bug). React Compiler kuralları warning'e alındı (84 hijyen warning kalan, ayrı temizlik branch'i için) |
| 2026-06-27 | **Bug fixes (akşam)** — (a) Booking flow: staff→time'da `?serviceId=...` URL params kayboluyordu → guard yanlış yere yönlendiriyordu, fix uygulandı; (b) `/profile` route 404 → confirm sayfasında `/customer/profile`'a yönlendirme; (c) Yazdırma çıktısı tüm sayfayı basıyordu → `PrintTicket` component + `@media print` CSS ile sadece temiz ticket basılır; (d) Profil kayıt "schema cache" hatası → `New-21` ile `profiles.birth_date` kolonu eklendi; (e) PayTR refund admin UI + multi-resource booking UI (service-resource link modal); (f) Test 38→85 (+47); (g) `docs/infrastructure/coolify-deployment.md` |

## Belge Güncelleme Kuralı

CLAUDE.md "Belge Güncelleme Kuralı"na göre:
- Her özellik/değişiklik commit edilmeden önce ilgili belge güncellenir
- Yeni TODO eklenirse veya çözülürse bu dosyaya yansıtılır
- Sürüm geçmişi tutulur
