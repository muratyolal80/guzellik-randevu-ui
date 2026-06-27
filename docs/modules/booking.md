# Modül: Randevu Akışı (Booking)

## Amaç
Müşterinin salonu seçtikten sonra hizmet → personel → tarih/saat → onay adımlarıyla randevu oluşturma akışı. Slot motoru çakışma kontrolünü ve uygun saatleri hesaplar.

## Roller / Aktör
- Anonim ziyaretçi (üyelik olmadan başlatabilir, son adımda OTP ile üye olur)
- Mevcut CUSTOMER (üye girişi varsa direkt onay)

## Aktif Özellikler
- ✅ **4 adımlı wizard:** Hizmet → Personel → Zaman → Kullanıcı bilgi/onay
- ✅ **Slot motoru** — `services/slot.ts` — çalışma saati + çakışma + servis süresi
- ✅ **"Herhangi personel"** seçeneği — otomatik atama
- ✅ **Çoklu hizmet seçimi** — toplam süre toplanır
- ✅ **Sabah/Öğleden Sonra grupları** — `< 12:00` ve `>= 12:00`
- ✅ **Müsait/Dolu/Seçili gösterim** — UI'da renk kodlu
- ✅ **Reschedule (Yeniden zamanlama)** — query param ile mevcut randevu üzerine
- ✅ **Personel hizmet eşleşmesi** — sadece o hizmeti veren personeller listelenir (staff_services filter)
- ✅ **Verification filter** — sadece doğrulanmış / KVKK onayı olan personel görünür
- ✅ **OTP ile son adım** — anonim kullanıcı telefon doğrulayıp anında üye olur
- ✅ **Kupon/kampanya** — coupon_code → discount_amount hesaplama
- ✅ **Kapora desteği** — `appointments.deposit_amount`
- ✅ **Çakışma engeli** — DB seviyesinde GIST exclusion constraint

## Veri Modeli
| Tablo | Rol |
|-------|-----|
| `appointments` | Ana randevu kaydı |
| `appointment_coupons` | Kullanılan kuponlar (M-N) |
| `salon_services` | Hizmet süresi/fiyatı (slot süresi hesabı için) |
| `working_hours` | Personel mesai (slot motoru kaynağı 1) |
| `salon_working_hours` | Salon mesai (fallback) |
| `staff_services` | Personel-hizmet yetkinlik matrisi |

## Sayfa / Route
| Path | Açıklama |
|------|----------|
| `/booking/[id]` | Akış başlangıcı (hizmet seçimi) |
| `/booking/[id]/staff` | Uzman seçim sayfası |
| `/booking/[id]/time` | Tarih/saat seçimi |
| `/booking/[id]/user-info` | Kullanıcı bilgisi + OTP + onay |
| `/bookings` | Yapılmış randevu listesi (kullanıcı) |

## API
| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/api/booking/available-slots` | GET | Slot motoru — uygun saatler |
| `/api/booking/get-busy-slots` | GET | Sadece dolu slot'ları döndürür (UI'da gri göstermek için) |
| `/api/booking/create` | POST | Direkt randevu oluşturma (auth'lu kullanıcı) |
| `/api/booking/send-otp` | POST | Anonim akışta telefon doğrulama OTP'si |
| `/api/booking/verify-and-book` | POST | OTP doğrula + üye yap + randevu oluştur (atomik) |
| `/api/booking/cancel` | POST | Randevu iptal (kullanıcı) — **Cancellation Policy enforcement** ile (aşağıda) |

## State Persistence (F-030 — commit `pending`)

**Sorun:** Booking flow sırasında sayfa yenileme veya tarayıcı geri tuşu kullanıldığında seçilen hizmet/personel/tarih/saat kayboluyordu.

**Çözüm:** [`context/BookingContext.tsx`](../../context/BookingContext.tsx) içine `sessionStorage` persistence eklendi.

| Özellik | Detay |
|---------|-------|
| Storage key | `booking-state-v1` |
| TTL | 2 saat (eski randevu denemesi karışmasın) |
| Scope | Tab bazlı — tab kapanınca otomatik temizlenir |
| Salon değişimi | `salonId` farklıysa eski state geçersiz sayılır |
| Persist edilen alanlar | selectedServices, selectedStaff, selectedDate, selectedTime, customerName, customerPhone, customerNotes, participantCount, appointmentId |
| Persist EDİLMEYEN | salon objesi (DB'den fetch edilir), campaign/discount (otomatik hesaplanır) |
| Reset | `resetBooking()` çağrısı veya başarılı randevu sonrası storage temizlenir |

**Akış:**
1. İlk render: `loadPersistedState(salonId)` → varsa state initial value olarak kullanılır
2. Her state değişiminde: `savePersistedState()` (debounce yok — state nadiren değişir)
3. Hiçbir seçim yoksa storage temizlenir (kirletme yok)

### Time sayfası özel restore mantığı

[`app/booking/[id]/time/page.tsx`](../../app/booking/[id]/time/page.tsx):
- `selectedDate` (Date) — `persistedDate` string'inden parse edilir, geçmiş tarihler atlanır
- `selectedSlot` (string) — `persistedTime`'dan başlar, fetch sonrası `availableTimeSlots` içinde değilse otomatik temizlenir
- **Guard:** Hizmet seçimi yoksa otomatik `/salon/[id]`'ye redirect (boş URL ile gelinemez)

## Cancellation Policy (F-032 — commit `9fd7b03`)

**Hard lock kuralı:** Randevuya **1 saatten az** kala iptal yasak.
- Eşik: `CANCELLATION_HARD_LOCK_MINUTES` env (default `60`)
- Hata yanıtı: `HTTP 400 + { code: 'CANCELLATION_LOCKED', minutesUntilStart, hardLockMinutes }`
- Net Türkçe mesaj: "Randevunuza X saat Y dakika kalmış. Bu süre içinde iptal yapılamaz, lütfen salonu doğrudan arayın."

**Diğer kontrol katmanları:**
- Status `CANCELLED` olan randevu → 400 "zaten iptal edilmiş"
- Status `COMPLETED` olan randevu → 400 "tamamlanmış randevular iptal edilemez"
- Sahiplik kontrolü: `customer_id !== user.id` → 403

**Refund Policy:**
- `salons.cancellation_deadline_hours` (default 24) — bu süreden önce iptal: full refund
- Iyzico üzerinden otomatik refund (`IyzicoService.refund`)
- Refund fail olursa randevu yine iptal edilir, `notes` alanına hata yazılır

## Slot Motoru Detayı
**Akış:** [services/slot.ts:34-120](../../services/slot.ts#L34)

1. `serviceIds` veya `serviceId` → `salon_services.duration_min` topla
2. Eğer `serviceIds` verildiyse → `staff_services` üzerinden capable staff filtresi
3. `staff` tablosundan aktif personeli çek (capable filter ile)
4. Her personel için:
   - `working_hours` (gün bazlı) → yoksa `salon_working_hours` fallback
   - O günkü mevcut `appointments` (CANCELLED hariç)
   - 30 dk aralıklarla slot üret, çakışmayanları döndür
5. Tüm personelin slot'larını birleştir, zamana göre sırala

**Önemli:** Server-side API `supabaseAdmin` kullanır (service_role) — anon RLS bypass.

## Test Adımları
1. **Anonim akış:** `/salon/[id]` → "Randevu Al" → 4 adım → OTP `111111` → randevu kaydı oluşur
2. **Hizmet filtresi:** Seçilen hizmeti veremeyen personel listede görünmemeli
3. **Slot çakışma:** Aynı tarihe 2 randevu denersen 2.'yi DB exclusion constraint reddeder (toast: "Saat dolu")
4. **Reschedule:** `/booking/[id]?appointmentId=X&staffId=Y&serviceId=Z` → mevcut randevu güncellenir
5. **Kapalı gün:** Pazar günü slot listesi boş gelmelidir
6. **Geçmiş saat filtresi:** Bugünün `now() + 15 dk` öncesi slot'lar dönmemeli (Faz 3 implementi)

## Açık Aksiyon (TODO)
- ✅ ~~Geçmiş saat filtresi~~ — `services/slot.ts` `getStaffAvailableSlots` içinde `now()+15dk` öncesi filtrelenir
- 🟡 **Multi-resource booking** — `salon_resources` (ekipman/kabin) tablosu var ama booking flow'a entegre değil
- 🟢 **Grup hizmeti** — `salon_services.max_participants` kolonu var ama UI'da kapasite kontrolü yok
- 🟢 **Konum bazlı slot blok** — staff'ın o saatte başka şubede olduğunu kontrol (multi-branch)
- 🟢 **Tampon süresi** — randevular arası buffer (örn. 5 dk hazırlık) eklenmeli
- 🟢 **Capacity-aware "Any staff"** — şu an her personeli sırayla deniyor, en az meşgulü seçmiyor

## Bağlantılar
- Slot motoru: [services/slot.ts](../../services/slot.ts)
- Slot motoru testleri: [services/__tests__/slot.test.ts](../../services/__tests__/slot.test.ts) (32 test)
- Booking context: [context/BookingContext.tsx](../../context/BookingContext.tsx)
- Booking sayfaları: [app/booking/[id]/](../../app/booking/[id])
- API: [app/api/booking/](../../app/api/booking)
- Service filter migration: [initdb/New-05-Backfill-Staff-Hours-And-Services.sql](../../initdb/New-05-Backfill-Staff-Hours-And-Services.sql)
