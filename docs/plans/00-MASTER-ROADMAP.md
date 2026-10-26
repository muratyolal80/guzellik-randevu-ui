# 📍 Master Roadmap — Güzellik Randevu

> Bu belge tüm projenin **gün gün** ne yapıldığı, **şu an** nerede olduğumuz, **neyin kaldığı** ve **senden hangi aksiyonların beklendiğinin** tek doğruluk kaynağıdır.
>
> **Son güncelleme:** 2026-10-26
> **Aktif branch:** `salonara` (staging) → `kuaforara` (prod, oluşturulacak)
> **Yazılım sürümü:** `1.1.5`
>
> **Nasıl takip edilir:** Bu belgenin en üstündeki **"🧭 GÜNCEL YOL HARİTASI"** tek takip noktasıdır. Her faz bittikçe ⏳ → ✅ yapılır, commit hash yazılır. Alttaki bölümler (Haziran) geçmiş kaydıdır.

---

## 🧭 GÜNCEL YOL HARİTASI (2026-10-26)

**Durum:** Özellik geliştirme büyük ölçüde tamam. **Prod'da gerçek müşteri verisi olmadan önce** 3 iş şart: kritik güvenlik açıklarını kapatmak, güvenli bir DB release süreci kurmak, deploy zincirini (`salonara` → `kuaforara`) bağlamak.

### ✅ Yapıldı (2026-06-25 → 2026-10-26, 41 commit)

| Tarih | İş | Commit |
|-------|----|--------|
| 06-27 | OTP RLS açığı kapatıldı (New-20), profiles.birth_date (New-21), authenticated CUD GRANT denetimi (New-22) | `c32f3b0` `1718563` `142433a` |
| 06-27 | ESLint 9, test sayısı 38 → 85, Coolify deployment rehberi, prod launch checklist | `e753d09` `f7f1f31` `3004efa` `353e12f` |
| 06-27 | PayTR iade UI, hizmet-kaynak bağlama, yazdırılabilir bilet | `b1221ba` `2d33cb0` |
| 06-28 | Booking: reschedule düzeltmeleri, Mode A otomatik onay, Mode B onay akışı | `499c4c7` `805023d` `c1280f7` `e979226` `aff4d74` |
| 06-28 | audit_logs INSERT policy (New-23), Master şemaya 5 eksik tablo (New-24), owner yazma politikaları (New-25) | `778df3a` `1c684e2` `5a923f9` |
| 06-28 | Auth enumeration fix, SMS tekrar gönder, rol düşürme (downgrade) bug'ı, personel hesap yönetimi | `93a5445` `739111f` `d27710c` |
| 06-28 | Randevu aksiyon izi (kim/ne zaman), salon görselleri storage policy, usage stats fallback (New-26..32) | `9018894` `2c6216b` `7e3d4a3` |
| 06-29 | Tüm panellerde mobil navigasyon, müşteri UX, admin dashboard gerçek KPI, 404/error sayfaları, alert → toast (owner) | `2c026c8` `5515862` `72d6de9` `b8607d3` `8fefe66` |
| 10-26 | Local Supabase ayağa kaldırıldı ("Failed to fetch" çözüldü), DB + RLS + UI tam denetim yapıldı | — |
| 10-26 | Belgeler toparlandı: kök md'ler → `docs/archive/`, deployment & alignment analizi, `docs/critical/` (git dışı) | `81b45b9` |
| 10-26 | **F1+F2:** New-33 güvenlik sertleştirmesi (local'de uygulandı + saldırı senaryolarıyla doğrulandı), `scripts/migrate.sh`, davet kabul akışı (RPC yoktu) + admin aktif/pasif bug'ı + login open redirect | F1-commit |

### ⏳ Yapılacak — Fazlar (sırayla)

| Faz | İş | Neden | Detay | Durum |
|-----|----|-------|-------|-------|
| **F0** | **Prod keşfi (salt okunur):** prod `_migrations`, şema diff, aşağıdaki açıklar prod'da var mı? | Prod'un gerçek durumu bilinmiyor | [deployment-and-alignment §9-10](../infrastructure/deployment-and-alignment.md) | ⏳ |
| **F1** 🔴 | **Kritik güvenlik — `New-33-Security-Hardening.sql`** | Herkes kendini admin yapabiliyor, personel TC/telefon herkese açık | aşağıda "F1 detay" | ✅ local |
| **F2** | **Migration runner** `scripts/migrate.sh` (transaction + otomatik kayıt + prod yedeği) | Elle takip bozuldu (New-26b…32 kayıtsız, New-26 iki kez) | [§5](../infrastructure/deployment-and-alignment.md) | ✅ |
| **F3** | **Deploy zinciri:** `kuaforara` branch, GitHub branch protection, Coolify prod=`kuaforara`, staging=`salonara` | Push → staging, merge → prod | [§2-3](../infrastructure/deployment-and-alignment.md) | ⏳ |
| **F4** | **Alignment:** `prod-pull-db.sh` iyileştirme + PII maskeleme + storage sync script | Prod verisini local'e güvenle indirmek (KVKK + yanlışlıkla SMS) | [§6](../infrastructure/deployment-and-alignment.md) | ⏳ |
| **F5** | **Yedekleme:** prod günlük yedek + sunucu dışı kopya + aylık restore testi | Müşteri verisi kaybı = iş kaybı | [§8](../infrastructure/deployment-and-alignment.md) | ⏳ |
| **F6** 🟡 | **Güvenlik orta seviye:** bildirim/audit üretimini server'a taşı + `INSERT WITH CHECK(true)` daralt, kod tarafı güvenlik taraması (API route yetki, IDOR, webhook imza, OTP rate-limit) | Defense in depth | — | ⏳ |
| **F7** | **Renk & kontrast:** `primary-dark` token (#C59F59 beyazda 2.5:1 → WCAG fail), tanımsız `shadow-card` (82 kullanım, etkisiz), login'deki ikinci altın `#CFA76D`, müşteri panelindeki amber → `primary` | Marka tutarlılığı + erişilebilirlik | UI denetimi | ⏳ |
| **F8** | **İkonlar:** booking akışı + `Layout.tsx` Material Symbols → lucide (139 kullanım), emoji ikonlar, boyut skalası | Tek ikon sistemi, font yükü kalkar | UI denetimi | ⏳ |
| **F9** | **UX:** 134 `alert/confirm/prompt` → toast + ConfirmDialog, spinner → Skeleton, boş durumlar, mobil grid'ler (staff/hours, schedule) | CLAUDE.md UI standartları | UI denetimi | ⏳ |
| **F10** | **SEO/a11y:** 59 sayfada metadata eksik (layout ile), background-image alt, İngilizce UI metinleri | SEO + erişilebilirlik | UI denetimi | ⏳ |
| **F11** | **Kod kalitesi:** `any` temizliği, sayfalardaki ham Supabase sorguları → `services/db`, ele alınmayan fetch hataları | CLAUDE.md mimari kuralları | — | ⏳ |

#### F1 detay — 2026-10-26 local DB denetimi bulguları

> ✅ = local'de kapatıldı ve doğrulandı. **Prod'a uygulanması F0 keşfinden sonra:** `./scripts/migrate.sh prod`. Ek bulunan ve kapatılan: `accept_staff_invite` RPC yoktu (davet kabulü bozuktu), login `?redirect=` open redirect.

| # | Açık | Etki | Durum |
|---|------|------|-------|
| 🔴 1 | `handle_new_user` rolü kayıt metadata'sından filtresiz alıyor | Kayıt olan herkes `SUPER_ADMIN` olabilir | ✅ |
| 🔴 2 | `profiles.own_profile` `FOR ALL`, `WITH CHECK` yok | Kullanıcı kendi `role`/`is_active` alanını değiştirebilir | ✅ |
| 🔴 3 | `staff` `USING(true)` + `tc_no/phone/email` | Anonim kişi personel TC/telefon/e-postasını okuyor (KVKK). **Doğrulandı** | ✅ |
| 🔴 4 | `invites` `USING(true)` | Tüm davet token'ları herkese açık → başkasının davetini kabul | ✅ |
| 🟡 5 | `salon_usage_stats` view anon'a açık | Salonların abonelik/plan bilgisi herkese açık | ✅ |
| 🟡 6 | 3 SECURITY DEFINER fonksiyonda `search_path` yok | search_path hijack | ✅ |
| 🟡 7 | `profiles`'ta admin UPDATE politikası yok | Admin "kullanıcı pasif yap" sessizce çalışmıyor (bug) | ✅ |
| 🟢 8 | `_migrations` kayıt boşluğu (New-26b…32 uygulanmış, kayıtsız) | Ortam takibi | ✅ (`--baseline`) |

### 👤 Senden beklenen manuel adımlar (güncel)

| # | İş | Faz |
|---|----|-----|
| 1 | `docs/critical/credentials.md`'deki prod/staging boşluklarını doldur (Coolify, SSH, Studio, 3. parti paneller) | F0 |
| 2 | Prod'a SSH erişimini doğrula (`ssh root@45.81.113.82`) — F0 keşfini birlikte yaparız | F0 |
| 3 | Prod'da `admin@demo.com / password123` varsa şifresini değiştir veya hesabı sil | F1 |
| 4 | Coolify'da prod Application branch'ini `kuaforara` yap (F3'te birlikte) | F3 |
| 5 | Eski listeden hâlâ açık olanlar: İYS hesabı, NetGSM prod, PayTR canlı + `test_mode=0`, Resend, `CRON_SECRET` — bkz. [PROD-LAUNCH-CHECKLIST](../PROD-LAUNCH-CHECKLIST.md) | Launch |

---

## 📜 GEÇMİŞ — Haziran 2026 Durumu (arşiv, değiştirilmez)

## 🎯 Hızlı Durum

| Metrik | Değer |
|--------|-------|
| Tamamlanmış sprint | **6** (A · B · C · D · E · F) |
| Toplam commit | **6** (son hafta) — `05fa594` → `7460c80` |
| Toplam değişen satır | **~3000+** |
| Çözülmüş madde | **27** |
| Kalan madde (kod) | **~4** (paket-bağımlı, atlanmış) |
| Kalan madde (manuel) | **8** (senin tarafın) |
| Test durumu | 38/38 ✅ |
| Type check | 0 hata ✅ |

---

## 📅 GÜN GÜN TIMELINE

### 🗓️ 2026-03-22 — Başlangıç
- `76dfce8` Kullanıcı sayfa edit özellikleri
- `ddf287b` Kullanıcı paket + salon iyileştirmeleri

### 🗓️ 2026-05-05 — Claude entegrasyonu başlangıç
- `2d8a6c2` Claude 0 — repo onboarding kayıt
- `7e70989` Claude 1 — 21st.dev öncesi snapshot

### 🗓️ 2026-05-06 — Production hardening
- `644e23a` Data eksiklikleri tamamlandı
- `e4d2861` **Production-readiness hardening** — observability altyapı, compliance, SEO, test framework

### 🗓️ 2026-05-07 — Modül belgeleri + booking stabilizasyon
- `9fd7b03` Cancellation policy + Cloudflare Turnstile + spec belgesi
- `6c2a0cb` SPECIFICATIONS update + belge güncelleme kuralı (CLAUDE.md)
- `9d887e5` 11 modül + 6 entegrasyon belgesi + New-06..10 DB sync
- `31eccda` Booking sessionStorage persistence
- `7748ae0` Demo OTP autofill + KVKK/TEİ profesyonel modal
- `1b4654f` Booking time sayfası restore + guard
- `53dc63d` 3 quick-win: geçmiş saat slot filtresi + NO_SHOW enum + `_migrations` tracker

### 🗓️ 2026-05-31 — RLS+GRANT pattern
- `4124d6d` "nurgosterim" hızlı yama
- `c5d0fcd` **support_tickets boş `{}` hatası** — New-14: authenticated SELECT GRANT eksikliği keşfedildi → CLAUDE.md'ye kanon kural eklendi

### 🗓️ 2026-06-01 — PayTR entegrasyonu (sürüm 1.1.0)
- `71b0010` Admin finance reports defensive guard + purchase conditional-hook bug fix
- `c9211fd` **PayTR iFrame API altyapı** — New-15 migration + lib + 3 route + 6 unit test
- `8646759` PayTR iframe modal + admin provider switch (Iyzico/PayTR/None) + owner ödeme butonu
- `597a01c` PayTR belgeleri + Iyzico DEPRECATED + sürüm `1.0.5 → 1.1.0`

### 🗓️ 2026-06-23 — Marketplace UX keşif
- 3 paralel Explore agent (Firma Bulma + Üyelik + Rezervasyon) detaylı keşif
- `docs/plans/2026-06-23-marketplace-ux-analysis.md` raporu — 25+ bulgu, 5 sprint planı, önceliklendirme matrisi
- 345 skill kuruldu (`alirezarezvani/claude-skills` marketplace)
- `docs/learning/claude-skills-rehberi.md` — skill kullanım kitabı

### 🗓️ 2026-06-24 — Sprint A → E (5 sprint, 5 commit, 1 günde tamamlandı)

**Sprint A** — `05fa594` — Launch blocker yasal düzeltmeler
- U1 KVKK + Ticari İleti checkbox (register + business)
- U2 İYS API gerçek entegrasyon (`registerIYSConsent`)
- U5 Telefon `type="tel"` + numpad + SMS one-time-code autofill
- DB: New-16 (KVKK + IYS kolonları)

**Sprint B** — `15631e5` — Performans + SEO
- U3 Şifre complexity (min 8 + büyük/küçük/rakam)
- K5 Dinamik sitemap (`app/sitemap.ts`)
- R1 Vercel cron notifications (her 5 dk)
- K7 Sort dropdown (önerilen/puan/fiyat/yeni/yakın)
- K1 Frontend sayfalama ("Daha Fazla Yükle")

**Sprint C** — `bc66671` — Konum + Availability
- K2 PostGIS + geolocation + radius (5/10/25/50 km) + "Yakındakini Bul"
- K3 `isSalonOpenNow` + "Şu an açık" filter
- DB: New-17 (PostGIS extension + RPC `salons_within_radius`)

**Sprint D** — `4fff139` — Booking robustness
- R7 Slot button mobil tap area (min-48px)
- R3 SMS fail amber banner (confirm page)
- R4 Slot lock (5 dk TTL + acquire RPC + slot motoru entegrasyonu)
- R2 Multi-resource constraint (junction + RPC)
- DB: New-18 (slot_reservations) + New-19 (multi-resource)

**Sprint E** — `7cda538` — Şifre reset + Email
- U4 `/forgot-password` + `/reset-password` (Supabase magic link)
- R5 Resend email queue processor entegrasyonu

### 🗓️ 2026-06-25 — Sprint F (bugün)

**Sprint F** — `7460c80` — Hızlı kazançlar
- K4 Fiyat filter + hizmet tipi pill multi-select
- K11 Image lazy loading
- K12 N+1 query refactor (getSalonsByMembership)
- U9 Email RFC 5322 regex
- U10 Deaktif edildi amber banner + destek email link
- R8 `.ics` Takvime Ekle butonu (RFC 5545)
- R9 "Yeni Randevu Al" button (confirm page)
- R10 API rate limit (available-slots: 30/dk per IP)
- R12 Empty state alternatif tarih hint

---

## ✅ TAMAMLANANLAR (sprint × madde matrisi)

| Sprint | Madde Sayısı | DB Migration | Commit |
|--------|--------------|--------------|--------|
| A — Launch Blocker | 4 (U1, U2, U5, +DB) | New-16 | `05fa594` |
| B — Performans + SEO | 5 (U3, K1, K5, K7, R1) | — | `15631e5` |
| C — Konum + Availability | 2 (K2, K3) | New-17 (PostGIS) | `bc66671` |
| D — Booking Robustness | 4 (R2, R3, R4, R7) | New-18, New-19 | `4fff139` |
| E — Reset + Email | 2 (U4, R5) | — | `7cda538` |
| F — Hızlı Kazançlar | 10 (K4, K11, K12, U9, U10, R8, R9, R10, R12) | — | `7460c80` |
| **TOPLAM** | **27** | **4 migration** | **6 commit** |

---

## ⏳ KALAN İŞLER

### A. KOD TARAFI (devam edebilir, bekleniyor)

| # | Madde | Neden ertelendi | Tahmini efor |
|---|-------|------------------|---------------|
| K6 | Harita marker cluster | `leaflet.markercluster` npm paketi gerekir | 4 sa |
| K8 | OG dinamik image generation | `@vercel/og` paketi gerekir | 3 sa |
| R6 | Date picker swipe carousel | Embla/Keen-Slider paketi gerekir | 4 sa |
| U7 | Apple Sign-In | iOS launch sonrası | 4 sa |

→ Toplam ~15 saat. Yapmak istersen onay verir misin, paket kurarım?

### B. SENDEN AKSİYON BEKLEYEN MANUEL ADIMLAR 🔴

| # | İş | Nasıl yapılır | Aciliyet |
|---|----|---------------|----------|
| **1** | `New-16` migration uygula (KVKK kolonları) | `docker exec -i supabase-db psql -U postgres -d postgres < initdb/New-16-KVKK-Consent-Columns.sql` | 🔴 Launch öncesi |
| **2** | `New-17` migration uygula (PostGIS) | `docker exec -i supabase-db psql -U postgres -d postgres < initdb/New-17-PostGIS-Salon-Coordinates.sql` | 🔴 Launch öncesi |
| **3** | `New-18` migration uygula (slot lock) | `docker exec -i supabase-db psql -U postgres -d postgres < initdb/New-18-Slot-Reservations.sql` | 🔴 Launch öncesi |
| **4** | `New-19` migration uygula (multi-resource) | `docker exec -i supabase-db psql -U postgres -d postgres < initdb/New-19-Multi-Resource-Constraint.sql` | 🟡 Launch öncesi (kullanım az) |
| **5** | PostGIS extension Postgres'te yüklü mü? | Yoksa: `apt install postgresql-15-postgis-3` (Linux host) | 🔴 N17 için şart |
| **6** | Google OAuth keys | Supabase Dashboard > Auth > Providers > Google → Client ID/Secret gir | 🟡 Hızlı login için |
| **7** | İYS hesap + API key | iys.org.tr başvuru → `.env`'e `IYS_API_URL`, `IYS_API_KEY`, `IYS_BRAND_CODE` | 🔴 Yasal launch blocker |
| **8** | NetGSM prod credentials | `.env` doldur + `OTP_DEMO_MODE=false` | 🔴 Launch öncesi |
| **9** | Resend API key | resend.com → `RESEND_API_KEY` `.env` | 🟡 Email çalışsın |
| **10** | `CRON_SECRET` env | `.env`'e güvenli random string | 🟡 Cron auth |
| **11** | PayTR canlı hesap + `test_mode=0` | Admin Panel > Ayarlar > PayTR → merchant_id/key/salt + test_mode=0 | 🔴 Launch öncesi |
| **12** | Repo temizliği | `Remove-Item -Recurse -Force claude-skills, .tmp, .tmp-claude-skills` | 🟢 Cosmetik |

### C. BACKLOG (launch sonrası, opsiyonel)

| # | Madde | Etki |
|---|-------|------|
| R11 | Booking single-page modal (4 sayfa → 1 stepper) | Conversion |
| U8 | Form real-time validation (onChange listener) | UX rötuş |
| Multi-tenant | Saved card (PayTR tokenization) | Owner UX |
| Slot lock | Time → user-info acquire/release UI hooks | Sıfır UX değişimi yapsa da kazanım az |
| Owner UI | Multi-resource hizmet bağlama panel | R2 migration kullanım için |

---

## 🚦 ŞU AN NEREDEYIZ?

**Launch hazırlık:** Backend tarafı %95 bitti. Frontend tarafı %90 bitti. Şu 3 maddeyi tamamlayınca **canlı yayın olabilir**:

1. ✅ Kod: Tamam (Sprint F bitti)
2. ⏳ 4 DB migration uygulanmalı (manuel adım 1-4)
3. ⏳ Yasal launch blocker'lar (İYS hesabı + KVKK metni — manuel adım 7)
4. ⏳ Production env'ler (NetGSM, PayTR, OAuth keys — manuel adım 6, 8-11)

**Sıradaki step:** Sen yukarıdaki manuel adımları sırayla yap, ben her birinde yardımcı olayım:
- Migration komutu çalışmadıysa hatayı bana göster
- PostGIS yüklü değilse kurulum komutunu vereyim
- İYS başvurusunda dolduracağın form alanlarını birlikte hazırlayalım

---

## 📚 BELGE HARİTASI

| Belge | Konu | Durum |
|-------|------|-------|
| [00-MASTER-ROADMAP.md](.) | **Bu belge** — gün gün timeline + durum | 🟢 Güncel |
| [2026-06-23-marketplace-ux-analysis.md](./2026-06-23-marketplace-ux-analysis.md) | 3 ayak detaylı keşif + sprint planı | 🟢 Güncel |
| `docs/SPECIFICATIONS.md` | F-XXX modül anayasası | 🟡 Sürüm 1.1.0 |
| `docs/OPEN-ACTIONS.md` | Master TODO list | 🟡 Bu raporla senkron değil, güncelleme gerek |
| `docs/integrations/payment-paytr.md` | PayTR entegrasyon dokümantasyonu | 🟢 1.1.0 |
| `docs/integrations/payment-iyzico.md` | DEPRECATED (arşiv) | 🟡 |
| `docs/learning/claude-skills-rehberi.md` | 345 skill kullanım rehberi | 🟢 |
| `CLAUDE.md` | Proje anayasası | 🟢 |
| [deployment-and-alignment.md](../infrastructure/deployment-and-alignment.md) | Kod/şema/veri akışı, release süreci, prod→local alignment | 🟢 2026-10-26 |
| `docs/archive/` | Eski analizler (GAP analysis, project overview/architecture) | 📦 Arşiv |
| `docs/critical/` | Kullanıcı/şifre, sunucu erişimleri — **git dışı** | 🔐 |

---

## 🔄 NASIL DEVAM EDELİM (step-by-step)

### Adım 1 — Şu anda yapacağın
```powershell
# Repo temizliği (opsiyonel ama tavsiye)
Remove-Item -Recurse -Force claude-skills, .tmp, .tmp-claude-skills

# DB migrationlarını sırayla uygula
docker exec -i supabase-db psql -U postgres -d postgres < initdb/New-16-KVKK-Consent-Columns.sql
docker exec -i supabase-db psql -U postgres -d postgres < initdb/New-17-PostGIS-Salon-Coordinates.sql
docker exec -i supabase-db psql -U postgres -d postgres < initdb/New-18-Slot-Reservations.sql
docker exec -i supabase-db psql -U postgres -d postgres < initdb/New-19-Multi-Resource-Constraint.sql

# Sağlık kontrolü
docker exec -i supabase-db psql -U postgres -d postgres < initdb/db-health-check.sql
```

### Adım 2 — Manuel test
- Register sayfasında KVKK checkbox'ı dene
- Booking flow'da telefon → OTP → randevu
- Search sayfasında "Yakındakini Bul" + "Şu an açık" filtreleri
- Forgot password e-postası gelsin mi
- Confirmation page'de "Takvime Ekle" .ics indir

### Adım 3 — Production env
1. NetGSM credentials → `.env`
2. PayTR canlı bilgiler → Admin Panel
3. İYS başvurusu (en uzun süren, paralelde başlat)
4. Resend API key → `.env`
5. CRON_SECRET → `.env`

### Adım 4 — Launch öncesi son kontrol
- `npm run build` production build OK mu?
- `db-health-check.sql` 0 eksik mi?
- Vercel cron schedule etkin mi?

### Adım 5 — Yayın!
- Domain DNS yönlendirme
- SSL doğrulama
- Smoke test (kayıt + randevu + ödeme)

---

## 📞 İletişim Notları

- Migration hataları → bana hatayı yapıştır
- Yeni feature gelirse → `/brainstorming` slash command
- Production sorunu → Sentry log + bana ilet

---

**Bu belge `docs/plans/00-MASTER-ROADMAP.md`'dir ve her sprint sonu güncellenir.**
