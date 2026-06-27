# Güzellik Randevu — Rol Bazlı Manuel Test Senaryoları

> Manuel test (QA) belgesi. Her senaryo: **Özet · Açıklama · Ön Koşul · Adımlar · Beklenen Sonuç · Gerçekleşen · Durum**.
> **Durum kodları:** ✅ Geçti · ❌ Kaldı (hata) · ⚠️ Kısmi / not var · ⏳ Test edilmedi · ⏭️ Atlandı (manuel UI gerekiyor).

| Alan | Değer |
|------|-------|
| Sürüm | 1.0 |
| Tarih | 27.06.2026 |
| Ortam | Lokal (self-hosted Supabase, `localhost:3000`) |
| Test edilebilen katman | Build/typecheck · Auth login · API · RBAC redirect (HTTP) |

## Test Hesapları

| Rol | E-posta | Şifre |
|-----|---------|-------|
| SUPER_ADMIN | `admin@demo.com` | `password123` |
| SALON_OWNER | `owner@demo.com` | `password123` |
| STAFF | `staff@demo.com` | `password123` |
| CUSTOMER | `customer@demo.com` | `password123` |

> OTP testlerinde `OTP_DEMO_MODE=true` → doğrulama kodu daima `111111`.

---

## 1. Kimlik Doğrulama (Public / Misafir) — `TC-AUTH`

| ID | Özet | Açıklama | Ön Koşul | Adımlar | Beklenen Sonuç | Gerçekleşen | Durum |
|----|------|----------|----------|---------|----------------|-------------|-------|
| TC-AUTH-01 | E-posta/şifre ile giriş | Kayıtlı kullanıcı oturum açar | Test hesabı mevcut | 1. `/login` aç 2. `customer@demo.com` / `password123` gir 3. Giriş'e bas | Oturum açılır, role göre panele yönlenir (`/customer/dashboard`) | | ⏳ |
| TC-AUTH-02 | Yanlış şifre | Hatalı kimlikle giriş reddedilir | — | 1. `/login` aç 2. Doğru e-posta + yanlış şifre 3. Giriş | Türkçe hata toast'ı, oturum açılmaz | | ⏳ |
| TC-AUTH-03 | Bireysel kayıt | Yeni müşteri hesabı | — | 1. `/register` aç 2. Ad/e-posta/şifre gir 3. Kaydet | Hesap oluşur, CUSTOMER rolüyle giriş | | ⏳ |
| TC-AUTH-04 | İşletme kaydı | Salon sahibi kaydı | — | 1. `/register/business` aç 2. Formu doldur 3. Kaydet | SALON_OWNER rolü, `/owner/onboarding`'e yönlenir | | ⏳ |
| TC-AUTH-05 | Şifremi unuttum | Sıfırlama e-postası akışı | Kayıtlı e-posta | 1. `/forgot-password` 2. E-posta gir 3. Gönder | "E-posta gönderildi" mesajı, `/reset-password` link akışı | | ⏳ |
| TC-AUTH-06 | Telefon OTP doğrulama | OTP ile telefon doğrulama | `OTP_DEMO_MODE=true` | 1. OTP iste 2. Kod `111111` gir | Doğrulama başarılı | | ⏳ |
| TC-AUTH-07 | Pasif kullanıcı çıkışı | `is_active=false` kullanıcı erişemez | Admin kullanıcıyı pasifleştirir | 1. Pasif kullanıcı ile giriş dene | Middleware otomatik logout + `/login`'e yönlenir | | ⏳ |

---

## 2. Marketplace / Public — `TC-PUB`

| ID | Özet | Açıklama | Ön Koşul | Adımlar | Beklenen Sonuç | Gerçekleşen | Durum |
|----|------|----------|----------|---------|----------------|-------------|-------|
| TC-PUB-01 | Ana sayfa açılır | Anasayfa misafire render olur | — | 1. `/` aç | Sayfa 200, hero + öne çıkan salonlar, skeleton sonrası içerik | | ⏳ |
| TC-PUB-02 | Salon arama | Şehir/hizmete göre filtre | Onaylı salon var | 1. `/search` aç 2. Şehir/hizmet filtrele | Sadece APPROVED salonlar listelenir | | ⏳ |
| TC-PUB-03 | Salon detayı | Salon profili + hizmetler | Onaylı salon ID | 1. `/salon/[id]` aç | Salon bilgisi, hizmetler, personel, yorumlar, "Randevu Al" | | ⏳ |
| TC-PUB-04 | Subdomain/slug erişimi | `salon-slug/[slug]` rewrite | Slug'lı salon | 1. `/salon-slug/[slug]` aç | Salon detayı render olur | | ⏳ |
| TC-PUB-05 | Onaysız salon gizli | DRAFT/SUBMITTED salon public'te yok | Onaysız salon var | 1. Aramada onaysız salonu ara | Listede görünmez, direkt ID ile 404/erişim yok | | ⏳ |
| TC-PUB-06 | SEO metadata | Her sayfada metadata | — | 1. Sayfa kaynağını incele | `<title>`, OG etiketleri, JSON-LD mevcut | | ⏳ |

---

## 3. Randevu Akışı (4 Adım) — `TC-BOOK`

| ID | Özet | Açıklama | Ön Koşul | Adımlar | Beklenen Sonuç | Gerçekleşen | Durum |
|----|------|----------|----------|---------|----------------|-------------|-------|
| TC-BOOK-01 | Hizmet/personel seçimi | Adım 1-2 | Salon detayda "Randevu Al" | 1. Hizmet seç 2. `/booking/[id]/staff` personel seç | Seçimler korunur (sessionStorage) | | ⏳ |
| TC-BOOK-02 | Boş slot listesi | Adım 3 — uygun saatler | Personel mesaisi tanımlı | 1. `/booking/[id]/time` aç 2. Tarih seç | Sadece boş slotlar (mesai − dolu randevu − süre) gösterilir | | ⏳ |
| TC-BOOK-03 | Çakışan slot engeli | Dolu saat seçilemez | O saatte randevu var | 1. Dolu saati seçmeyi dene | Slot pasif/görünmez | | ⏳ |
| TC-BOOK-04 | Misafir bilgi + OTP | Adım 4 — kullanıcı bilgisi | — | 1. `/booking/[id]/user-info` doldur 2. OTP `111111` | Doğrulama geçer | | ⏳ |
| TC-BOOK-05 | Randevu oluşturma | `/booking/[id]/confirm` | Tüm adımlar tamam | 1. Onayla | Randevu DB'ye yazılır, onay ekranı, bildirim | | ⏳ |
| TC-BOOK-06 | Yenileme dayanıklılığı | F5 sonrası seçim kaybı yok | Akış ortasında | 1. Adım 3'te sayfayı yenile | Seçimler korunur (F-030) | | ⏳ |
| TC-BOOK-07 | Randevu iptali | `/api/booking/cancel` | Aktif randevu | 1. Randevuyu iptal et | İptal politikası kontrolü + durum güncellenir | | ⏳ |

---

## 4. CUSTOMER Paneli — `TC-CUS`

| ID | Özet | Açıklama | Ön Koşul | Adımlar | Beklenen Sonuç | Gerçekleşen | Durum |
|----|------|----------|----------|---------|----------------|-------------|-------|
| TC-CUS-01 | Dashboard | Müşteri özet ekranı | CUSTOMER girişli | 1. `/customer/dashboard` | Yaklaşan randevular, hızlı erişim | | ⏳ |
| TC-CUS-02 | Randevularım | Geçmiş/aktif randevular | Randevu var | 1. `/customer/appointments` | Randevu listesi, durum filtreleri | | ⏳ |
| TC-CUS-03 | Favoriler | Salon favorileme | — | 1. `/customer/favorites` 2. Salon ekle/çıkar | Favori listesi güncellenir | | ⏳ |
| TC-CUS-04 | Yorumlarım | Yorum yazma/görme | Tamamlanmış randevu | 1. `/customer/reviews` | Sadece kendi yorumları, ekleme/düzenleme | | ⏳ |
| TC-CUS-05 | Ödemelerim | Ödeme geçmişi | — | 1. `/customer/payments` | Ödeme kayıtları listesi | | ⏳ |
| TC-CUS-06 | Profil & ayar | Profil güncelleme | — | 1. `/customer/profile` 2. Bilgi değiştir 3. Kaydet | Değişiklik kaydedilir | | ⏳ |
| TC-CUS-07 | Bildirimler | Bildirim merkezi | — | 1. `/customer/notifications` | Bildirimler okunur/okunmadı | | ⏳ |
| TC-CUS-08 | Destek talebi | Ticket aç/görüntüle | — | 1. `/customer/support` 2. Talep aç 3. `/customer/support/[id]` | Talep oluşur, mesajlaşma | | ⏳ |
| TC-CUS-09 | İzolasyon | Başka müşteri verisi görünmez | İki müşteri | 1. Diğer müşterinin randevu ID'sine erişmeyi dene | RLS engeli, erişilemez | | ⏳ |

---

## 5. STAFF Paneli — `TC-STF`

| ID | Özet | Açıklama | Ön Koşul | Adımlar | Beklenen Sonuç | Gerçekleşen | Durum |
|----|------|----------|----------|---------|----------------|-------------|-------|
| TC-STF-01 | Dashboard | Personel özet | STAFF girişli | 1. `/staff/dashboard` | Bugünkü randevular, özet | | ⏳ |
| TC-STF-02 | Programım | Takvim/randevu görünümü | Atanmış randevu | 1. `/staff/schedule` | Sadece kendi randevuları | | ⏳ |
| TC-STF-03 | Çalışma saatleri | Mesai düzenleme | — | 1. `/staff/hours` 2. Saat ekle/değiştir 3. Kaydet | Kendi `working_hours` güncellenir | | ⏳ |
| TC-STF-04 | Profil | Personel profili | — | 1. `/staff/profile` 2. Bio/uzmanlık güncelle | Kaydedilir | | ⏳ |
| TC-STF-05 | İzolasyon | Başka personel verisi yok | İki personel | 1. Diğer personelin randevusuna eriş | RLS engeli | | ⏳ |
| TC-STF-06 | Owner alanı yasak | Staff `/owner`'a giremez | STAFF girişli | 1. `/owner/dashboard` aç | `/?error=unauthorized_owner`'a redirect | | ⏳ |

---

## 6. SALON_OWNER Paneli — `TC-OWN`

| ID | Özet | Açıklama | Ön Koşul | Adımlar | Beklenen Sonuç | Gerçekleşen | Durum |
|----|------|----------|----------|---------|----------------|-------------|-------|
| TC-OWN-01 | Onboarding zorlaması | Salonsuz owner onboarding'e gider | Salonsuz owner | 1. Giriş 2. `/owner/dashboard` dene | `/owner/onboarding`'e redirect | | ⏳ |
| TC-OWN-02 | Dashboard | İşletme özeti | Salonlu owner | 1. `/owner/dashboard` | KPI, yaklaşan randevular | | ⏳ |
| TC-OWN-03 | Salon yönetimi | Salon CRUD | — | 1. `/owner/salons` 2. `/owner/salons/[id]/edit` düzenle | Kaydedilir; **DELETE yasak** (status update) | | ⏳ |
| TC-OWN-04 | Hizmet yönetimi | Salon hizmetleri | Salon var | 1. `/owner/services` ekle/düzenle | Fiyat/süre kaydı; DELETE yerine pasifleştirme | | ⏳ |
| TC-OWN-05 | Personel yönetimi | Personel ekle/davet | — | 1. `/owner/staff` 2. Personel davet et | Davet gönderilir (`/invite/accept`) | | ⏳ |
| TC-OWN-06 | Takvim | Randevu takvimi | — | 1. `/owner/calendar` | FullCalendar, salon randevuları | | ⏳ |
| TC-OWN-07 | Müşteriler | Müşteri listesi | — | 1. `/owner/customers` | Salonun müşterileri | | ⏳ |
| TC-OWN-08 | Kampanyalar | Kampanya yönetimi | — | 1. `/owner/campaigns` | Kampanya CRUD | | ⏳ |
| TC-OWN-09 | Raporlar + AI | Rapor & AI insight | — | 1. `/owner/reports` 2. AI insight | Grafikler, `/api/owner/ai-insights` yanıtı | | ⏳ |
| TC-OWN-10 | Finans/Abonelik | Abonelik & ödeme | — | 1. `/owner/finance` 2. `/owner/packages` paket seç | PayTR iFrame ödeme akışı | | ⏳ |
| TC-OWN-11 | Kaynaklar | Kaynak/oda yönetimi | — | 1. `/owner/resources` | Kaynak CRUD | | ⏳ |
| TC-OWN-12 | İzolasyon | Başka salonun verisi yok | İki owner | 1. Diğer salonun ID'siyle düzenleme dene | RLS engeli | | ⏳ |
| TC-OWN-13 | Abonelik kısıtı | Pasif abonelikte erişim sınırı | Abonelik EXPIRED | 1. Owner panel kullan | Kısıtlama/uyarı gösterilir | | ⏳ |

---

## 7. ADMIN / SUPER_ADMIN Paneli — `TC-ADM`

| ID | Özet | Açıklama | Ön Koşul | Adımlar | Beklenen Sonuç | Gerçekleşen | Durum |
|----|------|----------|----------|---------|----------------|-------------|-------|
| TC-ADM-01 | Admin dashboard | Sistem özeti | SUPER_ADMIN girişli | 1. `/admin` | Platform KPI'ları | | ⏳ |
| TC-ADM-02 | Salon onayı | Onay akışı | SUBMITTED salon | 1. `/admin/salons/approvals` 2. Onayla/revizyon iste | Salon status `APPROVED`/`REVISION_REQUESTED` | | ⏳ |
| TC-ADM-03 | Salon yönetimi | Tüm salonlar | — | 1. `/admin/salons` 2. `/admin/salons/[id]/edit` | Tam yetki düzenleme | | ⏳ |
| TC-ADM-04 | Kullanıcı yönetimi | Kullanıcı CRUD + pasifleştirme | — | 1. `/admin/users` 2. Kullanıcı pasifleştir | `is_active` güncellenir | | ⏳ |
| TC-ADM-05 | Master data | Şehir/hizmet/tip yönetimi | — | 1. `/admin/services` `/admin/types` `/admin/service-types` | Global veriler CRUD | | ⏳ |
| TC-ADM-06 | Finans | Abonelik/paket/satın alma | — | 1. `/admin/finance` `/admin/finance/packages` `/admin/finance/purchase` | Finans yönetimi | | ⏳ |
| TC-ADM-07 | Ödeme sağlayıcı | PayTR/Iyzico switch | — | 1. `/admin/settings` 2. Sağlayıcı değiştir | Aktif provider güncellenir | | ⏳ |
| TC-ADM-08 | Destek | Tüm destek talepleri | — | 1. `/admin/support` | Tüm ticket'lar, yanıtlama | | ⏳ |
| TC-ADM-09 | İYS logları | İzinli ileti logları | — | 1. `/admin/iys-logs` | Log listesi | | ⏳ |
| TC-ADM-10 | Tam yetki | Admin tüm panellere erişir | — | 1. `/owner/*` ve `/staff/*` aç | SUPER_ADMIN için izinli | | ⏳ |

---

## 8. Rol Bazlı Erişim Kontrolü (RBAC / Middleware) — `TC-RBAC`

| ID | Özet | Açıklama | Ön Koşul | Adımlar | Beklenen Sonuç | Gerçekleşen | Durum |
|----|------|----------|----------|---------|----------------|-------------|-------|
| TC-RBAC-01 | Misafir korumalı sayfa | Girişsiz korumalı route | Çıkış yapılmış | 1. `/customer/dashboard` aç | `/login?redirect=...`'e yönlenir | | ⏳ |
| TC-RBAC-02 | Customer → admin yasak | Müşteri admin'e giremez | CUSTOMER girişli | 1. `/admin` aç | `/?error=unauthorized_admin` | | ⏳ |
| TC-RBAC-03 | Customer → owner yasak | Müşteri owner'a giremez | CUSTOMER girişli | 1. `/owner/dashboard` | `/?error=unauthorized_owner` | | ⏳ |
| TC-RBAC-04 | Staff → admin yasak | Personel admin'e giremez | STAFF girişli | 1. `/admin` | `/?error=unauthorized_admin` | | ⏳ |
| TC-RBAC-05 | Owner → admin yasak | Owner admin'e giremez | SALON_OWNER girişli | 1. `/admin` | `/?error=unauthorized_admin` | | ⏳ |
| TC-RBAC-06 | Owner yanlış panel | Owner `/customer`'a girince yönlenir | SALON_OWNER girişli | 1. `/customer/dashboard` | `/owner/dashboard`'a redirect | | ⏳ |
| TC-RBAC-07 | Admin yanlış panel | Admin `/customer`'a girince yönlenir | SUPER_ADMIN girişli | 1. `/customer/dashboard` | `/admin`'e redirect | | ⏳ |
| TC-RBAC-08 | Staff yanlış panel | Staff `/customer`'a girince yönlenir | STAFF girişli | 1. `/customer/dashboard` | `/staff/dashboard`'a redirect | | ⏳ |
| TC-RBAC-09 | API yetki | Korumalı API'de yetki kontrolü | Roller | 1. Yetkisiz rolle API çağır | 401/403 | | ⏳ |

---

## Tespit Edilen Hatalar / Bulgular

> Test çalıştırması sonrası doldurulur.

| # | Test ID | Önem | Bulgu | Beklenen | Gerçekleşen |
|---|---------|------|-------|----------|-------------|
| — | — | — | _(test sonrası)_ | | |
