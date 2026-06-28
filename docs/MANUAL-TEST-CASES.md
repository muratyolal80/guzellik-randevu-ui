# Güzellik Randevu — Rol Bazlı Manuel Test Senaryoları

> Manuel test (QA) belgesi. Her senaryo: **Özet · Açıklama · Ön Koşul · Adımlar · Beklenen Sonuç · Gerçekleşen · Durum**.
> **Durum kodları:** ✅ Geçti · ❌ Kaldı (hata) · ⚠️ Erişilebilir / kod doğrulandı (tam akış manuel UI) · ⏳ Test edilmedi · ⏭️ Tarayıcı oturumu gerekiyor (bu turda çalıştırılmadı).

| Alan | Değer |
|------|-------|
| Sürüm | 1.0 |
| Tarih | 27.06.2026 |
| Ortam | Lokal (self-hosted Supabase, `localhost:3000`) |
| Test edilen katman | Build/typecheck · Auth login · Public sayfa HTTP · API · RBAC redirect · RLS (anon) |
| Çalıştıran | Otomatik (HTTP/DB/auth katmanı). UI tıklama gerektirenler ⏭️ işaretli. |

## Test Hesapları

| Rol | E-posta | Şifre |
|-----|---------|-------|
| SUPER_ADMIN | `admin@demo.com` | `password123` |
| SALON_OWNER | `owner@demo.com` | `password123` |
| STAFF | `staff@demo.com` | `password123` |
| CUSTOMER | `customer@demo.com` | `password123` |

> OTP testlerinde `OTP_DEMO_MODE=true` → doğrulama kodu daima `111111`.

### Çalıştırma Özeti (27.06.2026)

| Katman | Sonuç |
|--------|-------|
| TypeScript `tsc --noEmit` | ✅ 0 hata |
| ESLint `npm run lint` | ✅ 0 hata, ⚠️ 84 uyarı (bkz. H-03) |
| Auth login (4 rol) | ✅ Hepsi HTTP 200 |
| Yanlış şifre | ✅ HTTP 400 (reddedildi) |
| Public sayfalar (8) | ✅ Hepsi 200 |
| RBAC — girişsiz korumalı route | ✅ 307 → `/login?redirect=...` |
| RLS — anon yasaklı tablolar | ✅ `permission denied` (appointments/profiles/subscriptions) |
| Public salon görünürlüğü | ✅ Anon yalnız `APPROVED` görüyor |
| API `/api/health` | ✅ 200 (db ok; email/sentry/payment yapılandırılmamış — H-02) |

---

## 1. Kimlik Doğrulama (Public / Misafir) — `TC-AUTH`

| ID | Özet | Açıklama | Ön Koşul | Adımlar | Beklenen Sonuç | Gerçekleşen | Durum |
|----|------|----------|----------|---------|----------------|-------------|-------|
| TC-AUTH-01 | E-posta/şifre ile giriş | Kayıtlı kullanıcı oturum açar | Test hesabı mevcut | 1. `/login` aç 2. `customer@demo.com` / `password123` 3. Giriş | Oturum açılır, role göre panele yönlenir | 4 rolde de GoTrue `token` grant → **HTTP 200**, access_token döndü | ✅ |
| TC-AUTH-02 | Yanlış şifre | Hatalı kimlik reddedilir | — | 1. Doğru e-posta + yanlış şifre 2. Giriş | Hata, oturum açılmaz | **HTTP 400** `invalid credentials` | ✅ |
| TC-AUTH-03 | Bireysel kayıt | Yeni müşteri hesabı | — | 1. `/register` 2. Doldur 3. Kaydet | CUSTOMER rolüyle hesap | `/register` sayfası **200**; tam kayıt akışı UI gerektirir | ⚠️ |
| TC-AUTH-04 | İşletme kaydı | Salon sahibi kaydı | — | 1. `/register/business` 2. Doldur 3. Kaydet | SALON_OWNER + `/owner/onboarding` | `/register/business` **200**; akış UI | ⚠️ |
| TC-AUTH-05 | Şifremi unuttum | Sıfırlama e-postası | Kayıtlı e-posta | 1. `/forgot-password` 2. E-posta 3. Gönder | "E-posta gönderildi" | Sayfa **200**; e-posta sağlayıcı lokal'de kapalı (H-02) | ⚠️ |
| TC-AUTH-06 | Telefon OTP | OTP doğrulama | `OTP_DEMO_MODE=true` | 1. OTP iste 2. `111111` gir | Doğrulama başarılı | Kod doğrulandı: [lib/auth/otp.ts](../lib/auth/otp.ts) demo modda `111111` döner | ⚠️ |
| TC-AUTH-07 | Pasif kullanıcı çıkışı | `is_active=false` erişemez | Admin pasifleştirir | 1. Pasif kullanıcı ile giriş | Otomatik logout + `/login` | Middleware kodu mevcut: `app_metadata.is_active===false` → logout ([middleware.ts:100](../middleware.ts#L100)) | ⏭️ |

---

## 2. Marketplace / Public — `TC-PUB`

| ID | Özet | Açıklama | Ön Koşul | Adımlar | Beklenen Sonuç | Gerçekleşen | Durum |
|----|------|----------|----------|---------|----------------|-------------|-------|
| TC-PUB-01 | Ana sayfa | Anasayfa render | — | 1. `/` aç | 200, hero + öne çıkanlar | **HTTP 200** | ✅ |
| TC-PUB-02 | Salon arama | Şehir/hizmet filtre | Onaylı salon | 1. `/search` 2. Filtrele | Yalnız APPROVED | `/search` **200**; REST anon yalnız `APPROVED` döndü | ✅ |
| TC-PUB-03 | Salon detayı | Profil + hizmet | Onaylı salon ID | 1. `/salon/[id]` | Bilgi/hizmet/personel/yorum | REST salon verisi erişilebilir; sayfa render UI | ⚠️ |
| TC-PUB-04 | Slug erişimi | `salon-slug/[slug]` rewrite | Slug'lı salon | 1. `/salon-slug/[slug]` | Detay render | Rewrite kuralı middleware'de; runtime UI | ⏭️ |
| TC-PUB-05 | Onaysız salon gizli | DRAFT/SUBMITTED public'te yok | Onaysız salon | 1. Onaysızı ara | Görünmez | Anon REST `salons` → **yalnız 5 APPROVED** kayıt, diğerleri gizli | ✅ |
| TC-PUB-06 | SEO metadata | Her sayfada metadata | — | 1. Sayfa kaynağı | title/OG/JSON-LD | Sayfalar 200 render; metadata derinliği UI denetimi | ⚠️ |

---

## 3. Randevu Akışı (4 Adım) — `TC-BOOK`

| ID | Özet | Açıklama | Ön Koşul | Adımlar | Beklenen Sonuç | Gerçekleşen | Durum |
|----|------|----------|----------|---------|----------------|-------------|-------|
| TC-BOOK-01 | Hizmet/personel seçimi | Adım 1-2 | "Randevu Al" | 1. Hizmet 2. `/booking/[id]/staff` | Seçim korunur (sessionStorage) | UI akışı | ⏭️ |
| TC-BOOK-02 | Boş slot listesi | Adım 3 | Mesai tanımlı | 1. `/booking/[id]/time` 2. Tarih | Yalnız boş slotlar | API parametresiz **400** (girdi doğrulaması çalışıyor); slot mantığı UI | ⚠️ |
| TC-BOOK-03 | Çakışan slot engeli | Dolu saat seçilemez | O saatte randevu | 1. Dolu saati seç | Slot pasif | `services/slot.ts` mantığı; runtime UI | ⏭️ |
| TC-BOOK-04 | Misafir bilgi + OTP | Adım 4 | — | 1. `/user-info` 2. OTP `111111` | Doğrulama geçer | UI + OTP demo | ⏭️ |
| TC-BOOK-05 | Randevu oluşturma | Onay | Adımlar tamam | 1. Onayla | DB'ye yazılır + bildirim | `/api/booking/create` UI akışı | ⏭️ |
| TC-BOOK-06 | Yenileme dayanıklılığı | F5 sonrası kayıp yok | Akış ortası | 1. Yenile | Seçim korunur (F-030) | UI | ⏭️ |
| TC-BOOK-07 | Randevu iptali | İptal | Aktif randevu | 1. İptal et | Politika + durum güncellenir | `/api/booking/cancel` UI | ⏭️ |

---

## 4. CUSTOMER Paneli — `TC-CUS`

| ID | Özet | Açıklama | Ön Koşul | Adımlar | Beklenen Sonuç | Gerçekleşen | Durum |
|----|------|----------|----------|---------|----------------|-------------|-------|
| TC-CUS-01 | Dashboard | Müşteri özeti | CUSTOMER girişli | 1. `/customer/dashboard` | Yaklaşan randevu | Girişsiz **307 → /login** (koruma OK); içerik oturum gerektirir | ⏭️ |
| TC-CUS-02 | Randevularım | Aktif/geçmiş | Randevu var | 1. `/customer/appointments` | Liste + filtre | Oturum gerekli | ⏭️ |
| TC-CUS-03 | Favoriler | Salon favorileme | — | 1. `/customer/favorites` | Favori güncellenir | Oturum gerekli | ⏭️ |
| TC-CUS-04 | Yorumlarım | Yorum yaz/gör | Tamamlanmış randevu | 1. `/customer/reviews` | Yalnız kendi yorumları | Oturum gerekli | ⏭️ |
| TC-CUS-05 | Ödemelerim | Ödeme geçmişi | — | 1. `/customer/payments` | Ödeme kayıtları | Oturum gerekli | ⏭️ |
| TC-CUS-06 | Profil & ayar | Profil güncelleme | — | 1. `/customer/profile` 2. Kaydet | Kaydedilir | Oturum gerekli | ⏭️ |
| TC-CUS-07 | Bildirimler | Bildirim merkezi | — | 1. `/customer/notifications` | Okundu/okunmadı | Oturum gerekli | ⏭️ |
| TC-CUS-08 | Destek talebi | Ticket aç/gör | — | 1. `/customer/support` 2. `[id]` | Talep + mesaj | Oturum gerekli | ⏭️ |
| TC-CUS-09 | İzolasyon | Başka müşteri verisi yok | İki müşteri | 1. Diğer randevu ID'sine eriş | RLS engeli | Anon seviye doğrulandı: `appointments`/`profiles` → **permission denied**; kullanıcı-bazlı izolasyon oturum gerektirir | ⚠️ |

---

## 5. STAFF Paneli — `TC-STF`

| ID | Özet | Açıklama | Ön Koşul | Adımlar | Beklenen Sonuç | Gerçekleşen | Durum |
|----|------|----------|----------|---------|----------------|-------------|-------|
| TC-STF-01 | Dashboard | Personel özeti | STAFF girişli | 1. `/staff/dashboard` | Bugünkü randevular | Girişsiz **307 → /login**; içerik oturum gerektirir | ⏭️ |
| TC-STF-02 | Programım | Takvim | Atanmış randevu | 1. `/staff/schedule` | Yalnız kendi randevuları | Oturum gerekli | ⏭️ |
| TC-STF-03 | Çalışma saatleri | Mesai düzenleme | — | 1. `/staff/hours` 2. Kaydet | Kendi `working_hours` | Oturum gerekli | ⏭️ |
| TC-STF-04 | Profil | Bio/uzmanlık | — | 1. `/staff/profile` | Kaydedilir | Oturum gerekli | ⏭️ |
| TC-STF-05 | İzolasyon | Başka personel verisi yok | İki personel | 1. Diğer personel randevusuna eriş | RLS engeli | Anon `appointments` denied; kullanıcı-bazlı ⏭️ | ⚠️ |
| TC-STF-06 | Owner alanı yasak | Staff `/owner`'a giremez | STAFF girişli | 1. `/owner/dashboard` | `unauthorized_owner` redirect | Middleware kodu mevcut ([middleware.ts:139](../middleware.ts#L139)); runtime oturum ⏭️ | ⚠️ |

---

## 6. SALON_OWNER Paneli — `TC-OWN`

| ID | Özet | Açıklama | Ön Koşul | Adımlar | Beklenen Sonuç | Gerçekleşen | Durum |
|----|------|----------|----------|---------|----------------|-------------|-------|
| TC-OWN-01 | Onboarding zorlaması | Salonsuz owner | Salonsuz owner | 1. `/owner/dashboard` dene | `/owner/onboarding` redirect | Middleware kodu mevcut ([middleware.ts:146](../middleware.ts#L146)); runtime ⏭️ | ⚠️ |
| TC-OWN-02 | Dashboard | İşletme özeti | Salonlu owner | 1. `/owner/dashboard` | KPI + randevu | Girişsiz **307 → /login**; içerik oturum gerektirir | ⏭️ |
| TC-OWN-03 | Salon yönetimi | Salon CRUD | — | 1. `/owner/salons/[id]/edit` | Kaydedilir; **DELETE yasak** | UI + RLS; oturum gerekli | ⏭️ |
| TC-OWN-04 | Hizmet yönetimi | Salon hizmetleri | Salon var | 1. `/owner/services` | Fiyat/süre; DELETE→pasif | Oturum gerekli | ⏭️ |
| TC-OWN-05 | Personel yönetimi | Ekle/davet | — | 1. `/owner/staff` 2. Davet | `/invite/accept` davet | Oturum gerekli | ⏭️ |
| TC-OWN-06 | Takvim | Randevu takvimi | — | 1. `/owner/calendar` | FullCalendar | Oturum gerekli | ⏭️ |
| TC-OWN-07 | Müşteriler | Müşteri listesi | — | 1. `/owner/customers` | Salonun müşterileri | Oturum gerekli | ⏭️ |
| TC-OWN-08 | Kampanyalar | Kampanya CRUD | — | 1. `/owner/campaigns` | CRUD | Oturum gerekli | ⏭️ |
| TC-OWN-09 | Raporlar + AI | Rapor & AI | — | 1. `/owner/reports` | Grafik + AI insight | `/api/owner/ai-insights`; Gemini key gerekli | ⏭️ |
| TC-OWN-10 | Finans/Abonelik | Ödeme | — | 1. `/owner/packages` 2. Paket seç | PayTR iFrame | Oturum + PayTR config | ⏭️ |
| TC-OWN-11 | Kaynaklar | Kaynak/oda | — | 1. `/owner/resources` | CRUD | Oturum gerekli | ⏭️ |
| TC-OWN-12 | İzolasyon | Başka salon verisi yok | İki owner | 1. Diğer salon ID'siyle düzenle | RLS engeli | Kullanıcı-bazlı RLS ⏭️ (anon seviye denied) | ⚠️ |
| TC-OWN-13 | Abonelik kısıtı | EXPIRED'de sınır | Abonelik EXPIRED | 1. Owner panel | Kısıt/uyarı | Oturum gerekli | ⏭️ |

---

## 7. ADMIN / SUPER_ADMIN Paneli — `TC-ADM`

| ID | Özet | Açıklama | Ön Koşul | Adımlar | Beklenen Sonuç | Gerçekleşen | Durum |
|----|------|----------|----------|---------|----------------|-------------|-------|
| TC-ADM-01 | Admin dashboard | Sistem özeti | SUPER_ADMIN girişli | 1. `/admin` | Platform KPI | Girişsiz **307 → /login**; içerik oturum gerektirir | ⏭️ |
| TC-ADM-02 | Salon onayı | Onay akışı | SUBMITTED salon | 1. `/admin/salons/approvals` 2. Onayla | status `APPROVED` | Oturum gerekli | ⏭️ |
| TC-ADM-03 | Salon yönetimi | Tüm salonlar | — | 1. `/admin/salons/[id]/edit` | Tam yetki | Oturum gerekli | ⏭️ |
| TC-ADM-04 | Kullanıcı yönetimi | CRUD + pasifleştir | — | 1. `/admin/users` 2. Pasifleştir | `is_active` güncellenir | Oturum gerekli | ⏭️ |
| TC-ADM-05 | Master data | Şehir/hizmet/tip | — | 1. `/admin/services` `/types` | Global CRUD | Oturum gerekli | ⏭️ |
| TC-ADM-06 | Finans | Abonelik/paket | — | 1. `/admin/finance/*` | Finans yönetimi | Oturum gerekli | ⏭️ |
| TC-ADM-07 | Ödeme sağlayıcı | PayTR/Iyzico switch | — | 1. `/admin/settings` | Provider güncellenir | Oturum gerekli | ⏭️ |
| TC-ADM-08 | Destek | Tüm ticket'lar | — | 1. `/admin/support` | Yanıtlama | Oturum gerekli | ⏭️ |
| TC-ADM-09 | İYS logları | İzin logları | — | 1. `/admin/iys-logs` | Log listesi | Oturum gerekli | ⏭️ |
| TC-ADM-10 | Tam yetki | Tüm panellere erişim | — | 1. `/owner/*` `/staff/*` | SUPER_ADMIN izinli | Middleware'de SUPER_ADMIN istisnası mevcut; runtime ⏭️ | ⚠️ |

---

## 8. Rol Bazlı Erişim Kontrolü (RBAC / Middleware) — `TC-RBAC`

| ID | Özet | Açıklama | Ön Koşul | Adımlar | Beklenen Sonuç | Gerçekleşen | Durum |
|----|------|----------|----------|---------|----------------|-------------|-------|
| TC-RBAC-01 | Misafir korumalı sayfa | Girişsiz route | Çıkış yapılmış | 1. `/customer/dashboard` | `/login?redirect=...` | 4 prefix de (`/customer`,`/owner`,`/staff`,`/admin`) → **307 → /login?redirect=...** ✅ | ✅ |
| TC-RBAC-02 | Customer → admin yasak | Müşteri admin'e giremez | CUSTOMER girişli | 1. `/admin` | `unauthorized_admin` | Kod: `userRole!=='SUPER_ADMIN'` → redirect ([middleware.ts:125](../middleware.ts#L125)); runtime ⏭️ | ⚠️ |
| TC-RBAC-03 | Customer → owner yasak | Müşteri owner'a giremez | CUSTOMER girişli | 1. `/owner/dashboard` | `unauthorized_owner` | Kod mevcut ([middleware.ts:132](../middleware.ts#L132)); runtime ⏭️ | ⚠️ |
| TC-RBAC-04 | Staff → admin yasak | Personel admin'e giremez | STAFF girişli | 1. `/admin` | `unauthorized_admin` | Kod mevcut; runtime ⏭️ | ⚠️ |
| TC-RBAC-05 | Owner → admin yasak | Owner admin'e giremez | SALON_OWNER girişli | 1. `/admin` | `unauthorized_admin` | Kod mevcut; runtime ⏭️ | ⚠️ |
| TC-RBAC-06 | Owner yanlış panel | Owner `/customer`'da yönlenir | SALON_OWNER girişli | 1. `/customer/dashboard` | `/owner/dashboard` | Kod mevcut ([middleware.ts:188](../middleware.ts#L188)); runtime ⏭️ | ⚠️ |
| TC-RBAC-07 | Admin yanlış panel | Admin `/customer`'da yönlenir | SUPER_ADMIN girişli | 1. `/customer/dashboard` | `/admin` | Kod mevcut ([middleware.ts:185](../middleware.ts#L185)); runtime ⏭️ | ⚠️ |
| TC-RBAC-08 | Staff yanlış panel | Staff `/customer`'da yönlenir | STAFF girişli | 1. `/customer/dashboard` | `/staff/dashboard` | Kod mevcut ([middleware.ts:192](../middleware.ts#L192)); runtime ⏭️ | ⚠️ |
| TC-RBAC-09 | API yetki | Korumalı API yetki | Roller | 1. Yetkisiz rolle API | 401/403 | `/api/booking/available-slots` parametresiz **400** (validation); rol-bazlı API yetkisi ⏭️ | ⚠️ |

---

## Tespit Edilen Hatalar / Bulgular

> Otomatik test turunda (HTTP/DB/auth/lint/typecheck) bulunanlar. UI tıklama gerektiren ⏭️ senaryolar bu listenin kapsamı dışındadır.

| # | İlgili | Önem | Bulgu | Beklenen | Gerçekleşen |
|---|--------|------|-------|----------|-------------|
| H-01 | a11y / `StaffSkillsManager.tsx:117` | 🟡 Orta | `<img>` etiketinde `alt` prop yok + `no-img-element` (next/image değil) | CLAUDE.md: `alt` zorunlu, `next/image` tercih | Lint uyarısı: alt eksik. CLAUDE.md erişilebilirlik kuralı ihlali — düzeltilmeli |
| H-02 | `/api/health` entegrasyonlar | 🟢 Bilgi | `email`, `errorTracking` (Sentry), `payment` → `ok:false` | Prod'da yapılandırılmış | Lokal'de yapılandırılmamış — bilinen bekleyen görevler ([PROD-LAUNCH-CHECKLIST.md](PROD-LAUNCH-CHECKLIST.md)). Lokal için beklenen |
| H-03 | ESLint (genel) | 🟢 Bilgi | 84 uyarı (0 hata); çoğu `react-hooks/exhaustive-deps` | 0 uyarı ideali | Çalışmayı engellemez ama stale-closure riski; AuthContext/TenantContext dahil. Zamanla temizlenmeli |
| H-04 | `/api/health` DB latency | 🟢 Bilgi | İlk çağrı `latencyMs=3214` | < birkaç yüz ms | 2. çağrı `36ms` → cold-start; kalıcı sorun değil. İzlenebilir |
| H-05 | Test kapsamı (kısıt) | 🔵 Kısıt | Auth-korumalı panel içerikleri, cross-panel redirect, kullanıcı-bazlı RLS izolasyonu | Runtime doğrulama | Tarayıcı oturumu gerektiriyor; bu turda **kod düzeyinde** doğrulandı, runtime ⏭️. Tam QA için Playwright/manuel tarayıcı turu önerilir |

### Sonuç

Otomatik olarak doğrulanan katmanlarda **bloke edici hata yok**: tip kontrolü temiz, 4 rol de giriş yapabiliyor, RBAC girişsiz koruması ve RLS anon engelleri çalışıyor, public görünürlük doğru (yalnız APPROVED). Tek düzeltilmesi gereken somut bulgu **H-01** (img alt). Geri kalan ⏭️ senaryolar için kimlik-doğrulamalı bir tarayıcı/Playwright turu önerilir.
