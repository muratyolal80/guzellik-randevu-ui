# Modül: Personel (Staff)

## Amaç
Salon sahibinin personel ekleme/yönetme, mesai ve hizmet yetkinliği atama, davet linki gönderme. Personelin kendi panelinden randevularını ve performansını görebilme.

## Roller / Aktör
- SALON_OWNER (personel ekler/düzenler)
- MANAGER (sınırlı düzenleme)
- STAFF (kendi profili + randevuları)

## Aktif Özellikler

### Owner tarafı
- ✅ **Personel CRUD** — UI ile ekleme/düzenleme/silme (DELETE owner'a açık)
- ✅ **Mesai editörü** — `working_hours` haftalık 7 günlük tablo
- ✅ **Default mesai otomasyonu** — yeni personelde Pzt-Cmt 09-19, Pzr kapalı otomatik
- ✅ **Hizmet yetkinliği** — `staff_services` (hangi personel hangi hizmeti verebilir)
- ✅ **Davet linki** — token bazlı invite (`invites` tablosu)
- ✅ **Email auto-link** — eklerken email girilirse mevcut profile otomatik bağlanır + rol STAFF olur
- ✅ **Çoklu şube atama** — `staff_branches` (bir personel birden fazla şubede)
- ✅ **Telefon/email doğrulama** — verification flag'leri
- ✅ **KVKK onay** — personel için KVKK metni onayı
- ✅ **Eksik veri rozeti** — UI'da "Mesai eksik" / "Hizmet eksik" badge (clickable)
- ✅ **Profil fotoğrafı** — Storage upload (`staff-photos` bucket)

### Staff tarafı
- ✅ **Staff dashboard** — sadece kendi randevuları
- ✅ **Günlük takvim** — bugünün işleri
- ✅ **Performans istatistik** — tamamlanan/iptal randevu sayıları
- ✅ **Profil düzenleme** — bio, fotoğraf

### Yorum sistemi
- ✅ **Personel yorumları** — `staff_reviews` tablosu (rating + comment)
- ✅ **Otomatik rating güncelleme** — trigger ile `staff.rating`/`review_count` güncellenir
- ✅ **Verified yorum** — `appointment_id` ile bağlı yorumlar `is_verified=true`

## Veri Modeli
| Tablo | Rol |
|-------|-----|
| `staff` | Ana kayıt (name, email, phone, photo, role, salon_id) |
| `working_hours` | Personel mesai (7 satır/personel) |
| `staff_services` | Personel-hizmet matrisi |
| `staff_branches` | Çoklu şube atama |
| `staff_reviews` | Müşteri yorumları |
| `staff_reviews_detailed` (view) | Yorum + salon + personel join |
| `invites` | Davet token kayıtları |

## Sayfa / Route
| Path | Açıklama |
|------|----------|
| `/owner/staff` | Personel yönetimi (BRANCH/COMPANY tabları) |
| `/staff/dashboard` | Personel ana ekran |
| `/staff/appointments` | Kendi randevuları |
| `/staff/profile` | Profil düzenleme |
| `/invite/[token]` | Davet kabul ekranı (anonim) |

## API
İç service layer üzerinden çalışır, ayrı API endpoint'i yok. RLS owner_manage_staff policy'si ile koruma.

RPC fonksiyonu:
- `accept_staff_invite(p_token)` — atomik invite kabul + rol değişimi + staff link

## Test Adımları
1. **Yeni personel:** Owner panel → `/owner/staff` → "Ekle" → form → `working_hours` otomatik 7 satır
2. **Mesai değiştir:** Personel kartında saat ikonu → 7 günlük tablo → kaydet
3. **Hizmet ata:** Personel kartında düzenle → hizmet checkbox listesi → kaydet → `staff_services` güncellenir
4. **Eksik rozet:** Mesaisi olmayan personelde "Mesai eksik" badge görünmeli (tıkla → modal)
5. **Davet:** "Davet Linki" → `invites` kaydı → linki kopyala → yeni sekmede aç → kabul → STAFF rolü
6. **Çoklu şube:** Owner'ın 2+ salonu varsa "Bu Personeli Diğer Şubeye Ata" → `staff_branches` insert
7. **Yorum:** Müşteri randevu sonrası personele 5 yıldız → `staff.rating` trigger ile güncellenir

## Açık Aksiyon (TODO)
- 🟡 **Email davet gönderimi** — invite token üretiliyor ama email gönderme yok (sadece link kopyala)
- 🟡 **İzin/tatil günleri** — `working_hours.is_day_off` var ama tek seferlik izin (örn. yarın izinli) yok
- 🟢 **Vardiya** — sabahçı/akşamcı vardiya tanımı eksik
- 🟢 **Personel performans raporu** — kapsamlı rapor sayfası eksik
- 🟢 **Bulk import** — CSV ile çoklu personel ekleme
- 🟢 **Staff layout** — staff için ayrı panel görsel iyileştirme
- 🟢 **TC No doğrulama** — `tc_no` kolonu var ama gerçek doğrulama API'si entegre değil

## Bağlantılar
- Owner staff sayfası: [app/owner/staff/page.tsx](../../app/owner/staff/page.tsx)
- Staff manager component: [components/shared/salon/SalonStaffManager.tsx](../../components/shared/salon/SalonStaffManager.tsx)
- DB queries: [services/db/db_staff.ts](../../services/db/db_staff.ts)
- Verification migration: [initdb/New-07-Staff-Verification-Columns.sql](../../initdb/New-07-Staff-Verification-Columns.sql)
- Backfill migration: [initdb/New-05-Backfill-Staff-Hours-And-Services.sql](../../initdb/New-05-Backfill-Staff-Hours-And-Services.sql)
- Staff dashboard: [app/staff/](../../app/staff)
