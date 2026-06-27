# Modül: Destek (Support)

## Amaç
Kullanıcıların admin'le iletişim kurması (ticket sistemi), salon ve personel yorumlarının moderasyonu.

## Roller / Aktör
- Tüm rolleler (ticket açabilir)
- SUPER_ADMIN (cevaplar, kapatır)
- SALON_OWNER (kendi salonuna gelen yorumları görüntüler)

## Aktif Özellikler
- ✅ **Ticket oluşturma** — kullanıcı destek talebi açar (`/customer/support` veya benzeri)
- ✅ **Kategori sistemi** — PAYMENT / BOOKING / ACCOUNT / SALON / OTHER / GENEL
- ✅ **Status workflow** — OPEN → IN_PROGRESS → RESOLVED → CLOSED
- ✅ **Öncelik** — LOW / NORMAL / HIGH / URGENT
- ✅ **Mesajlaşma thread** — `ticket_messages` (kullanıcı + admin yazışması)
- ✅ **Salon yorumu** — `reviews` tablosu (1-5 yıldız + comment)
- ✅ **Personel yorumu** — `staff_reviews` (ayrı puan)
- ✅ **Verified review** — `appointment_id` bağlı yorumlar `is_verified=true`
- ✅ **Otomatik rating güncelleme** — staff_reviews trigger ile staff.rating güncellenir
- ✅ **Yorum görsel ekleme** — `review_images` (her yoruma birden fazla foto)
- ✅ **Updated_at trigger** — ticket güncelleme zamanı otomatik

## Veri Modeli
| Tablo | Rol |
|-------|-----|
| `support_tickets` | Ticket başlığı + ana mesaj + status |
| `ticket_messages` | Thread mesajları (sender_id, sender_role, content) |
| `reviews` | Salon yorumları |
| `review_images` | Yorum görselleri |
| `staff_reviews` | Personel yorumları |
| `staff_reviews_detailed` (view) | Yorum + salon + personel join |

## Sayfa / Route
| Path | Açıklama |
|------|----------|
| `/customer/support` | Müşteri destek talepleri |
| `/admin/support` | Admin tüm ticketlar |

## API
İç service layer + RLS. Ayrı API endpoint'i yok.

## RLS Politikaları
- Ticket: `users_see_own_tickets`, `users_create_own_tickets`, `admin_manage_tickets`
- Messages: `ticket_owner_or_admin_see_messages`, `auth_users_send_messages`
- Reviews: `staff_reviews_public_read`, `auth_users_create_staff_review`, `users_delete_own_staff_review`

> ⚠️ **GRANT Pattern Notu (2026-05-31):** Bu tablolarda RLS politikası baştan beri vardı ama `authenticated` rolüne `SELECT`/`INSERT`/`UPDATE` GRANT'ları **eksikti** → `/admin/support` sayfası `Biletler çekilemedi: {}` boş hatası veriyordu. [New-14](../../initdb/New-14-Authenticated-Select-Grants-Audit.sql) ile düzeltildi. Detay: [docs/infrastructure/rls.md → PostgREST GRANT vs RLS](../infrastructure/rls.md#postgrest-grant-vs-rls--tekrar-eden-boş--hatası-patterni).

## Test Adımları
1. **Ticket aç:** CUSTOMER → `/customer/support` → "Yeni Talep" → form → `support_tickets` insert
2. **Admin cevap:** SUPER_ADMIN → `/admin/support` → ticket aç → mesaj gönder → `ticket_messages` insert
3. **Thread görüntüleme:** Müşteri ticket detayında admin cevabını görür
4. **Yorum yaz:** Müşteri tamamlanmış randevu → "Yorum Yaz" → `reviews` insert + `is_verified=true`
5. **Personel yorumu:** Salon yorumu sonrası personel için ayrı puan → `staff_reviews` + trigger ile `staff.rating` update
6. **Yorum sil:** Müşteri kendi yorumunu silebilir (RLS policy)

## Açık Aksiyon (TODO)
- ✅ ~~Boş `{}` hatası~~ — `support_tickets`/`ticket_messages` authenticated GRANT'ları eklendi (New-14, 2026-05-31)
- 🟡 **Ticket UI tamamlanması** — admin tarafı `/admin/support` sayfası kapsamlı olmalı (filtreler, atama)
- 🟡 **Yorum moderasyonu** — admin küfür/spam yorumu silme/onaylama akışı
- 🟢 **Ticket atama** — admin'ler arası dağıtım
- 🟢 **Ticket SLA** — yanıt süresi takibi (URGENT < 1 saat vb.)
- 🟢 **Email bildirim** — ticket cevabı geldiğinde email
- 🟢 **Yorum fotoğrafı upload UI** — `review_images` tablosu var ama upload component'i eksik
- 🟢 **Owner yanıtı** — owner'ın salon yorumlarına resmi cevap yazması (`reviews.owner_response`)
- 🟢 **Yorum filtre** — sadece doğrulanmış / yıldız bazlı / tarih sıralama

## Bağlantılar
- DB queries: [services/db/db_support.ts](../../services/db/db_support.ts)
- Customer support: [app/customer/support/](../../app/customer/support)
- Admin support: [app/admin/support/](../../app/admin/support)
- Reviews migration: [initdb/New-04-Sync-Missing-Tables.sql](../../initdb/New-04-Sync-Missing-Tables.sql)
- IYS logs migration: [initdb/New-06-Final-Sync.sql](../../initdb/New-06-Final-Sync.sql)
