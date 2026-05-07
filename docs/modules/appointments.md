# Modül: Randevular (Appointments)

## Amaç
Randevu CRUD, takvim görünümü, hatırlatma, iptal/yeniden zamanlama. Hem müşteri hem personel hem owner tarafında ayrı görünümler.

## Roller / Aktör
- CUSTOMER (kendi randevuları)
- STAFF (atandığı randevular)
- SALON_OWNER / MANAGER (tüm salon randevuları)
- SUPER_ADMIN (tüm sistem)

## Aktif Özellikler
- ✅ **Randevu oluşturma** — booking flow ile (bkz [Booking modülü](booking.md))
- ✅ **Randevu durumu** — `PENDING / CONFIRMED / CANCELLED / COMPLETED`
- ✅ **Çakışma engeli (DB)** — `appointments_no_overlap_per_staff` GIST exclusion constraint
- ✅ **Randevu iptal** — `/api/booking/cancel` (auth gerekli)
- ✅ **Randevu yeniden zamanla** — booking flow'a query param ile geri dön
- ✅ **Owner takvim** — FullCalendar v6 (`/owner/calendar`) — günlük/haftalık/aylık
- ✅ **Müşteri takvim listesi** — `/customer/appointments`
- ✅ **Personel kendi takvimi** — `/staff/appointments`
- ✅ **SMS hatırlatma cron** — `/api/cron/reminders` (24 saat öncesi)
- ✅ **Kapora alma** — `appointments.deposit_amount`, `payment_method`, `payment_status`
- ✅ **Kupon kullanımı** — `appointments.coupon_code` + `discount_amount`
- ✅ **Yorum bağlama** — randevu sonrası `reviews.appointment_id` → verified review
- ✅ **Audit log** — randevu değişiklikleri `audit_logs`'a yazılır
- ✅ **Owner manuel randevu oluşturma** — `AddAppointmentModal` ile telefon üzerinden gelen müşteri için

## Veri Modeli
**Ana tablo:** `appointments` (25 kolon)
| Kolon | Açıklama |
|-------|----------|
| `customer_id` | Müşteri profile (anonim ise null) |
| `customer_name`, `customer_phone` | Anonim müşteri için bilgi |
| `salon_id` | Hangi salon |
| `staff_id` | Atanan personel |
| `salon_service_id` | Tek hizmet (multi-service için ayrı satır) |
| `resource_id` | Ekipman/oda |
| `participant_count` | Grup hizmeti için |
| `start_time`, `end_time` | UTC timestamp |
| `status` | enum |
| `notes` | Müşteri notu |
| `deposit_amount`, `payment_method`, `payment_status` | Ödeme |
| `iyzico_payment_id`, `refund_status`, `refund_amount` | Iyzico |
| `campaign_rule_id`, `coupon_code`, `discount_amount` | İndirim |
| `reminder_sent` | Cron işaretler |
| `created_at`, `updated_at` | Zaman damgaları |

**İlişkili tablolar:** `appointment_coupons`, `staff_reviews`, `reviews`, `transactions`

## Sayfa / Route
| Path | Açıklama |
|------|----------|
| `/customer/appointments` | Müşteri randevu listesi |
| `/staff/appointments` | Personelin atanmış randevuları |
| `/owner/calendar` | Owner takvim (FullCalendar) |

## API
| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/api/booking/create` | POST | Direkt randevu oluştur |
| `/api/booking/verify-and-book` | POST | OTP ile anonim randevu |
| `/api/booking/cancel` | POST | İptal (status=CANCELLED) |
| `/api/booking/get-busy-slots` | GET | UI gri slot için |
| `/api/cron/reminders` | GET | Cron endpoint (24 saat öncesi SMS) |

## Test Adımları
1. **Yeni randevu:** Booking flow → DB'ye `PENDING` status
2. **Çakışma testi:** Aynı staff'a aynı saate ikinci randevu → 409 Conflict (GIST constraint)
3. **İptal:** `/customer/appointments` → "İptal Et" → `status=CANCELLED`
4. **Yeniden zamanla:** "Tarihi Değiştir" → booking time sayfası → güncellenir
5. **Owner takvim:** `/owner/calendar` → drag & drop ile randevu zamanı taşı
6. **Owner manuel ekleme:** "+ Randevu Ekle" → telefon yaz → manuel müşteri kaydı
7. **Hatırlatma cron:** Yarın saat 10:00 randevu varsa, bugün saat 10:00'da SMS'e push
8. **Demo data:** New-08 ile 36 staff'a yarın 10:00 test randevu eklendi

## Açık Aksiyon (TODO)
- 🟡 **Multi-service randevu** — şu an her hizmet ayrı `appointment` satırı; ileride `appointment_services` join table tasarımı
- 🟡 **Drag & drop owner takvim** — UI mevcut ama backend `update_appointment` çağrısı kontrol edilmeli
- 🟡 **No-show işaretleme** — müşteri gelmediyse owner'ın işaretleyebileceği status yok (`status='NO_SHOW'` enum'a eklenmeli)
- 🟢 **Otomatik no-show tespiti** — randevu saatinden 30 dk sonra status sorulması
- 🟢 **Tekrar eden randevu** — haftalık/aylık tekrarlayan randevu
- 🟢 **Bekleme listesi (waitlist)** — dolu olan slot için kuyruğa girme
- 🟢 **Calendar export (.ics)** — kullanıcı kendi takvimine ekleme
- 🟢 **Push notification** — SMS yerine veya ek olarak in-app push

## Bağlantılar
- DB queries: [services/db/db_appointments.ts](../../services/db/db_appointments.ts)
- Customer page: [app/customer/appointments/page.tsx](../../app/customer/appointments/page.tsx)
- Owner calendar: [app/owner/calendar/page.tsx](../../app/owner/calendar/page.tsx)
- AddAppointmentModal: [components/owner/AddAppointmentModal.tsx](../../components/owner/AddAppointmentModal.tsx)
- Reminders cron: [app/api/cron/reminders/route.ts](../../app/api/cron/reminders/route.ts)
