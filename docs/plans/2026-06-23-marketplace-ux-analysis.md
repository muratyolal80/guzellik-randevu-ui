# Marketplace UX Analizi — 2026-06-23

**Bağlam:** Kapora odağı bırakıldı. Yeni odak — **kolay üyelik · kolay rezervasyon · kolay firma bulma**. Bu üç ayağın derinlemesine keşfi yapıldı (3 paralel Explore agent), bulgular bu raporda toplandı ve önceliklendirildi.

**Yazılım sürümü:** `1.1.0` (PayTR entegrasyonu sonrası)
**Branch:** `feat-admin-panel`

---

## 1. Yürütme Özeti (Executive Summary)

Sistemin temeli sağlam — booking flow çalışıyor, salon detay zengin, harita ve subdomain routing aktif. Ancak **3 kritik launch blocker** ve **5 yüksek-etki ikinci öncelik** maddesi var. Bunların hepsi launch öncesinde çözülmeli.

### En kritik 3 darboğaz (TÜM AYAKLARDAN BİRLEŞTİRİLMİŞ)

| # | Sorun | Ayak | Etki | Efor |
|---|-------|------|------|------|
| **1** | Sayfalama yok — tüm salonlar belleğe yüklüyor | Firma Bulma | 5000+ salonda mobil OOM, slow load | 4-6 saat |
| **2** | Konum-bazlı arama eksik (geolocation API + PostGIS) | Firma Bulma | "Yakındaki salon" killer feature missing | 1-2 gün |
| **3** | İYS API entegrasyonu eksik (`verify-phone:148` TODO) | Üyelik+Bildirim | KVKK/İYS mevzuat ihlali, launch blocker | 2-4 saat |

### En kritik 2 yasal/güvenlik sorunu

| Sorun | Detay | Sayfa |
|-------|-------|-------|
| **KVKK rızası kayıt sayfasında eksik** | Müşteri ve İşletme register formlarında KVKK + Ticari İleti checkbox YOK. Sadece booking aşamasında soruluyor — geç ve geçersiz rıza, 6698 sayılı kanun ihlali. | `app/register/page.tsx`, `app/register/business/page.tsx` |
| **Şifre güvenliği zayıf** | Min 6 karakter, complexity kuralı yok. OWASP min 8+ karakter + büyük/küçük/rakam/özel öneriyor. | `app/register/page.tsx:47-51`, `context/AuthContext.tsx:47` |

---

## 2. AYAK 1 — Kolay Firma Bulma

### 2.1 Durum Özeti

| Kategori | Durum | Not |
|----------|-------|-----|
| Ana sayfa & arama | ✅ İşlevsel | Tab-based, filtre paneli, harita/liste dual view |
| Salon detay sayfası | ✅ Zengin | Galeri slider, hizmetler tab, yorumlar, sticky CTA |
| Harita | ✅ Çalışıyor | Leaflet + custom marker, Türkiye bbox validasyonu |
| Filtreleme | 🟡 Sınırlı | Şehir/ilçe/puan var, fiyat/hizmet yok |
| Konum bazlı arama | ❌ Eksik | Bounding box approx, geolocation yok |
| SEO | 🟡 Temel | Metadata + JsonLd var, dinamik sitemap yok |
| Subdomain routing | ✅ Çalışıyor | Middleware rewrite stabil |
| Servis katmanı | 🟡 Optimizasyon gerekir | N+1 query, casting var |

### 2.2 Bulgular (Öncelik Sırasına Göre)

#### 🔴 K1. Sayfalama Yok (Performance Cliff)
- **Lokasyon:** `app/HomeClient.tsx:212`, `app/search/page.tsx:103`, `services/db/db_salon.ts` (getSalons limit yok)
- **Problem:** Tüm salonlar tek seferde frontend'e iniyor. 5000+ salon → mobil OOM, slow initial load, scroll lag.
- **Çözüm:** `getSalons(limit, offset, count)` parametreleri + frontend "Daha Fazla Yükle" / Intersection Observer
- **Efor:** 4-6 saat
- **Etki:** 10x homepage load, mobile usability

#### 🔴 K2. Konum-Bazlı Arama Eksik
- **Lokasyon:** `services/db/db_salon.ts:277-299` (bounding box), `app/HomeClient.tsx` (no geolocation call)
- **Problem:** "Yakındaki salonlar" feature missing. Bounding box matematiksel olarak yanlış sonuç verir (eşit alan değil). Browser geolocation API hiç kullanılmıyor.
- **Çözüm:**
  1. `navigator.geolocation.getCurrentPosition()` + permission UI
  2. PostGIS `ST_DWithin(point, radius)` query (`salons.coordinates` kolonu geometry tipi)
  3. UI: "X km uzaklıkta" göster, radius seçici (1/5/10/25 km)
- **Efor:** 1-2 gün (PostGIS migration dahil)
- **Etki:** Marketplace'in #1 sorgu pattern'i. Killer feature.

#### 🔴 K3. Real-time Availability Filtresi Eksik
- **Lokasyon:** `app/search/page.tsx:113` (TODO comment), `app/HomeClient.tsx:167` (`onlyAvailableToday` state unused)
- **Problem:** "Bugün açık mı?" filtresi var ama SlotService ile bağlı değil. Müşteri açık görür, randevu alır, slot yok → frustration.
- **Çözüm:** `services/slot.ts` ile entegrasyon, saatlik cache (`platform_settings.availability_cache_ttl`)
- **Efor:** 6-8 saat
- **Etki:** Conversion success rate

#### 🟡 K4. Fiyat ve Hizmet Kategorisi Filtreleri Yok
- **Lokasyon:** `app/search/page.tsx` (filter UI eksik)
- **Problem:** Müşteri "saç boya 500₺ altı" gibi spesifik arayamıyor.
- **Çözüm:** Price range slider + service type multi-select pill UI
- **Efor:** 4-6 saat

#### 🟡 K5. Dinamik Sitemap Yok
- **Lokasyon:** `public/sitemap.xml` static
- **Problem:** Salon detay sayfaları (`/salon/[id]`) sitemap'te yok → Google'a görünmez.
- **Çözüm:** `app/sitemap.ts` runtime'de tüm APPROVED salonları listele
- **Efor:** 2-3 saat
- **Etki:** SEO organik trafik

#### 🟡 K6. Harita Marker Cluster Yok
- **Lokasyon:** `components/Map/SalonMap.tsx`
- **Problem:** İstanbul gibi yoğun bölgelerde marker'lar üst üste, harita kullanılmaz.
- **Çözüm:** `leaflet.markercluster` library entegrasyonu
- **Efor:** 3-4 saat

#### 🟡 K7. Sıralama Seçeneği Yok
- **Lokasyon:** `app/search/page.tsx`
- **Problem:** Sadece `is_sponsored + rating` (server-side). Kullanıcı "fiyatı düşük" veya "en yakın" diye sıralayamıyor.
- **Çözüm:** Sort dropdown (Puan/Fiyat/Mesafe/Yeni)
- **Efor:** 3 saat

#### 🟢 K8-12. Diğer (Düşük Öncelik)
- Open Graph dinamik image generation (Vercel OG)
- Salon detay sayfasına `.ics` share button
- Mobile map touch event conflict
- Image lazy loading (`loading="lazy"`)
- N+1 query refactor `getSalonsByMembership()`

---

## 3. AYAK 2 — Kolay Üyelik

### 3.1 Durum Özeti

| Kategori | Durum | Not |
|----------|-------|-----|
| Müşteri register | 🟡 KVKK eksik | Ad, soyad, email, şifre |
| İşletme register | 🟡 KVKK + işletme alanları eksik | Ad, soyad, email, şifre |
| Davet register | ✅ İşlevsel | Token doğrulama, email pre-fill |
| Login | 🟡 Eksiklikler | Email+şifre, OAuth, "şifremi unuttum" route eksik |
| OTP / Telefon | 🟡 Demo mode | İYS API TODO, SMS provider belirsiz |
| KVKK | 🟡 Geç | Sadece booking modal'inde |
| Google OAuth | 🟡 Key eksik | Kod hazır |
| Apple Sign-In | ❌ UI only | İmplementasyon yok |
| AuthContext | ✅ Stabil | 3-retry profile fetch, inactive logout |
| Middleware | ✅ Stabil | Rol bazlı redirect, salon onboarding check |
| Şifre güvenliği | 🟡 Zayıf | Min 6 karakter, complexity yok |
| Şifre sıfırlama | ❌ Eksik | `/forgot-password` route yok |

### 3.2 Bulgular (Öncelik Sırasına Göre)

#### 🔴 U1. KVKK Rızası Register'da Yok (Yasal)
- **Lokasyon:** `app/register/page.tsx`, `app/register/business/page.tsx`
- **Problem:** Müşteri kayıt sırasında KVKK + Ticari İleti onayı verme imkanı yok. İşletme kayıt sayfasında sadece "kayıt olarak kabul etmiş sayılırsınız" disclaimer var → **6698 sayılı kanun açısından geçersiz rıza**.
- **Çözüm:**
  1. Register formuna 2 ayrı checkbox: `KVKK Aydınlatma Metni (zorunlu)` + `Ticari İleti Onayı (opsiyonel)`
  2. Submit button checkbox'lar onaylanana kadar disabled
  3. Booking sayfasındaki KVKK modal'i kaldır (artık register'da alındı)
  4. Mevcut kullanıcılar için: yeni KVKK metni eklenince modal göster (`platform_settings.kvkk_version`)
- **Efor:** 3-4 saat
- **Etki:** **Launch blocker (yasal)**

#### 🔴 U2. İYS API Entegrasyonu Eksik
- **Lokasyon:** `app/api/auth/verify-phone/route.ts:148` (TODO comment)
- **Problem:** SMS gönderiyoruz ama İYS API'sine rıza kaydı yapmıyoruz. Mevzuat ihlali → idari para cezası riski.
- **Çözüm:** NetGSM IYS register endpoint çağrısı + `sms_verifications.iys_registered` flag update + retry queue
- **Efor:** 2-4 saat
- **Etki:** **Launch blocker (yasal)** — OPEN-ACTIONS K4

#### 🟡 U3. Şifre Güvenliği Zayıf
- **Lokasyon:** `app/register/page.tsx:47-51`, `context/AuthContext.tsx:47`
- **Problem:** Min 6 karakter, complexity yok. Brute-force güvenlik açığı.
- **Çözüm:**
  ```typescript
  const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  // Min 8, en az 1 büyük + 1 küçük + 1 rakam
  ```
  + Real-time strength meter UI (zayıf/orta/güçlü)
- **Efor:** 2-3 saat

#### 🟡 U4. "Şifremi Unuttum" Sayfası Yok
- **Lokasyon:** `app/login/page.tsx:232` (broken link)
- **Problem:** Link var, sayfa yok. Şifresini unutan kullanıcı login olamıyor.
- **Çözüm:** `app/forgot-password/page.tsx` — Supabase magic link veya OTP reset
- **Efor:** 4-6 saat

#### 🟡 U5. Telefon Input Type Yanlış
- **Lokasyon:** `app/register/page.tsx:166`, `app/booking/[id]/user-info/page.tsx:409`
- **Problem:** `type="text"` → mobile'da klavye qwerty açılıyor, kullanıcı rakam tuşuna geçmek için ekstra tap atıyor.
- **Çözüm:** `type="tel"` + `inputMode="numeric"`
- **Efor:** 30 dk

#### 🟡 U6. Google OAuth Aktif Değil
- **Lokasyon:** `docs/integrations/oauth.md`, env keys
- **Problem:** Kod hazır, Supabase Auth provider config eksik. Tek tıkla giriş yapılamıyor.
- **Çözüm:** Supabase Dashboard > Auth > Providers > Google → Client ID + Secret
- **Efor:** 30 dk (config)

#### 🟢 U7-10. Diğer
- Apple Sign-In implementasyonu (iOS launch sonrası)
- Form real-time validation (onChange listener)
- Email RFC 5322 regex
- "Hesabınız deaktive edildi" toast/modal UX

---

## 4. AYAK 3 — Kolay Rezervasyon

### 4.1 Durum Özeti

| Kategori | Durum | Not |
|----------|-------|-----|
| Booking 4 adım | ✅ İşlevsel | sessionStorage persistence, restore |
| Slot motoru | ✅ Güçlü | 15dk buffer, multi-service, fallback |
| API routes | 🟡 Eksiklikler | Rate limit yok, IYS TODO |
| SessionStorage | ✅ Çalışıyor | 2 saat TTL |
| Mobile UX | 🟡 İyileştirilebilir | Date picker scroll, slot tap area |
| Misafir randevu | ✅ Destekleniyor | Email placeholder `@pending.user` |
| Empty state | ✅ Mesajlı | Alternatif tarih önerisi yok |
| Hata mesajları | 🟡 SMS fail silent | Toast sistemi yok |
| Confirmation page | ✅ Detaylı | `.ics` export yok |
| Reschedule | ✅ Atomic | Slot lock yok |
| Bildirim entegrasyonu | 🟡 Direct call | Queue cron yok |

### 4.2 Bulgular (Öncelik Sırasına Göre)

#### 🔴 R1. Notification Queue Cron Yok
- **Lokasyon:** `services/server-notification.ts`, `app/api/cron/` (cron route eksik veya yarım)
- **Problem:** `processQueue()` manuel çağrılmalı, hiçbir scheduler yok. Booking sonrası SMS gitse bile reminder/email queue çalışmıyor.
- **Çözüm:** Vercel Cron `/api/cron/notifications` her 5 dakikada bir → `NotificationService.processQueue()`
- **Efor:** 1-2 saat
- **Etki:** Müşteri "randevumu unuttum" şikayetleri

#### 🔴 R2. Multi-Resource Constraint Yok
- **Lokasyon:** `services/slot.ts`, `salon_resources` tablosu
- **Problem:** Slot motoru sadece personel ve appointment conflict check ediyor. Salon kaynakları (sandalye, ışık masası, makineler) hesaba katılmıyor → overbooking riski.
- **Çözüm:** `salon_resources` join → `service.required_resources` constraint check
- **Efor:** 4-6 saat
- **Etki:** OPEN-ACTIONS S7

#### 🟡 R3. SMS Gönderim Hatası Silent
- **Lokasyon:** `app/api/booking/create/route.ts:362-372`
- **Problem:** `sendAppointmentSMS()` fail → silent catch, müşteri SMS gelmediğini fark etmez.
- **Çözüm:** Toast notification + retry option + admin alert (queue PENDING'e geri at)
- **Efor:** 2-3 saat

#### 🟡 R4. Slot Lock Yok (Reschedule + Concurrent)
- **Lokasyon:** `services/slot.ts`
- **Problem:** Kullanıcı adım 3'te 5 dakika beklerken aynı slot başka müşteriye book edilebilir → adım 4'te 409 hata, frustration.
- **Çözüm:** `slot_reservations` tablosu, 5 dakika TTL, `RESERVED` status
- **Efor:** 4-6 saat

#### 🟡 R5. Email Channel İmplementasyonu Eksik
- **Lokasyon:** `services/server-notification.ts:62`
- **Problem:** `notification_queue.channel='EMAIL'` enum'da var, sender implementasyonu yok.
- **Çözüm:** Resend veya SendGrid entegrasyonu, `lib/email/send.ts`
- **Efor:** 4-6 saat
- **Etki:** OPEN-ACTIONS S5

#### 🟡 R6. Date Picker Mobile UX
- **Lokasyon:** `app/booking/[id]/time/page.tsx:309`
- **Problem:** 5-gün window, sağa kaydırma eksik, prev/next butonları küçük. Touch swipe yok.
- **Çözüm:** Embla/Keen-Slider entegrasyonu, horizontal swipe carousel
- **Efor:** 3-4 saat

#### 🟡 R7. Slot Buton Tap Area Mobile
- **Lokasyon:** `app/booking/[id]/time/page.tsx` (lg:grid-cols-5)
- **Problem:** Mobile 2-col grid, butonlar 36px civarı, WCAG min 44px altında.
- **Çözüm:** `min-h-[48px]` mobile slot button
- **Efor:** 1 saat

#### 🟢 R8-12. Diğer
- `.ics` export confirmation page
- "Tekrar randevu al" quick-book
- API rate limiting (user/IP bazlı)
- Booking single-page modal (4 sayfa → 1 sayfa stepper)
- Empty state alternatif tarih önerisi

---

## 5. Önceliklendirme Matrisi (Cross-Cutting)

```
            ┌──────────────────────────────────────────────────────────────┐
            │              Y Ü K S E K     E T K İ                          │
            ├──────────────────────────────────────────────────────────────┤
            │ DÜŞÜK EFOR (önce yap)         │ YÜKSEK EFOR (planla)        │
            ├───────────────────────────────┼─────────────────────────────┤
            │ U2 İYS API           (~3 sa)  │ K2 Konum + PostGIS  (~1-2g) │
            │ U1 KVKK register     (~4 sa)  │ K1 Sayfalama        (~6 sa) │
            │ R1 Queue cron        (~2 sa)  │ K3 Availability     (~8 sa) │
            │ U5 Telefon tel input (~30 dk) │ R2 Multi-resource   (~6 sa) │
            │ U6 Google OAuth key  (~30 dk) │ R4 Slot lock        (~6 sa) │
            │ K5 Dinamik sitemap   (~3 sa)  │ U4 Şifremi unuttum  (~6 sa) │
            │ R7 Slot tap area     (~1 sa)  │ R5 Email channel    (~6 sa) │
            ├───────────────────────────────┼─────────────────────────────┤
            │              D Ü Ş Ü K     E T K İ                          │
            ├───────────────────────────────┼─────────────────────────────┤
            │ U3 Şifre regex       (~2 sa)  │ R6 Date picker mob  (~4 sa) │
            │ K7 Sort dropdown     (~3 sa)  │ K6 Marker cluster   (~4 sa) │
            │ K4 Fiyat filtresi    (~5 sa)  │ R3 SMS toast        (~3 sa) │
            └───────────────────────────────┴─────────────────────────────┘
```

---

## 6. Sprint Planı

### Sprint A — Launch Blocker Cleanup (1 gün, 8 saat)
Bağımsız, mekanik, brainstorm gerekmez.

| Madde | Efor |
|-------|------|
| U1 KVKK register checkbox (müşteri + işletme) | 4 sa |
| U2 İYS API entegrasyon | 3 sa |
| U5 Telefon input type="tel" | 30 dk |
| U6 Google OAuth env keys | 30 dk |

**Çıktı:** 1 commit, launch blocker yasal sorunlar kapanır.

### Sprint B — Performans & SEO (2 gün, 13 saat)

| Madde | Efor |
|-------|------|
| K1 Sayfalama (server-side limit/offset + frontend) | 6 sa |
| K5 Dinamik sitemap | 3 sa |
| R1 Notification queue cron | 2 sa |
| K7 Sort dropdown | 3 sa |
| U3 Şifre complexity + meter | 2 sa |

**Çıktı:** Marketplace ölçeklenebilir, SEO görünür, bildirimler güvenilir.

### Sprint C — Konum & Availability (3 gün, ~18 saat)

| Madde | Efor |
|-------|------|
| K2 Konum bazlı arama (PostGIS migration + geolocation API + UI) | 10 sa |
| K3 Real-time availability filtresi | 8 sa |

**Çıktı:** "Yakındaki açık salon" sorgusu çalışır — funnel'in başı yeniden açılır.

### Sprint D — Booking Robustness (2 gün, 14 saat)

| Madde | Efor |
|-------|------|
| R2 Multi-resource constraint | 6 sa |
| R4 Slot lock | 6 sa |
| R7 Slot tap area mobile | 1 sa |
| R3 SMS toast + retry | 3 sa |

**Çıktı:** Overbooking + race condition + UX hata mesajları çözülür.

### Sprint E — Şifre & Email (1-2 gün, ~12 saat)

| Madde | Efor |
|-------|------|
| U4 Şifremi unuttum (Supabase magic link) | 6 sa |
| R5 Email channel (Resend) | 6 sa |

### Backlog (launch sonrası)
- K4 Fiyat + hizmet kategorisi filtreleri
- K6 Marker cluster
- R6 Date picker swipe carousel
- Apple Sign-In, real-time form validation, OG image dynamic generation, `.ics` export, vs.

---

## 7. Tahmini Toplam

| Sprint | Süre | Çıktı |
|--------|------|-------|
| A | 1 gün | Yasal launch blocker'lar |
| B | 2 gün | Performans + SEO + notification |
| C | 3 gün | Killer feature (konum + availability) |
| D | 2 gün | Booking sağlamlığı |
| E | 1-2 gün | Şifre reset + email |
| **TOPLAM** | **~9 gün (1.5 hafta)** | **Launch-ready marketplace** |

---

## 8. Bağlantılar

- Detaylı keşif logu: bu raporun §2, §3, §4
- Önceki PayTR planı: `~/.claude/plans/effervescent-riding-candy.md`
- Açık aksiyon master list: `docs/OPEN-ACTIONS.md`
- CLAUDE.md zorunlu kurallar: `CLAUDE.md`

---

**Hazırlayan:** Claude (3 paralel Explore agent + sentez)
**Tarih:** 2026-06-23
**Versiyon:** 1.0
