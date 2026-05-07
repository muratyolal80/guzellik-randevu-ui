# CLAUDE.md

Bu dosya Claude Code asistanına bu repo üzerinde çalışırken rehberlik eder. **Projenin tek anayasasıdır — geliştirme yapmadan önce tümü okunmalıdır.**

---

## Proje Özeti

**Güzellik Randevu** — Güzellik salonları, kuaförler ve berberler için çok kiracılı (multi-tenant) SaaS marketplace.
- **Temel fonksiyon:** Salonlar hizmet ve personellerini listeler, müşteriler online randevu alır.
- **Mimari:** Subdomain tabanlı multi-tenant, RBAC, veritabanı seviyesinde güvenlik (RLS).
- **Dil kuralı:** Kullanıcı ile iletişim **Türkçe**, kod (değişken/fonksiyon/yorum) **İngilizce**, UI mesajları/toast **Türkçe**.

---

## Commands

```bash
npm run dev       # Dev server (localhost:3000)
npm run build     # Production build (next-sitemap postbuild dahil)
npm run start     # Production server
npm run lint      # ESLint
```

Test runner yapılandırılmamış.

---

## Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 16 (App Router), React 19 — Server Actions, `use` hook, Server Components |
| Database/Auth | Supabase (`@supabase/ssr` + `@supabase/supabase-js`) |
| Styling | Tailwind CSS — shadcn/ui stili, component library yok |
| Icons | `lucide-react` |
| Charts | Recharts |
| Maps | `react-leaflet` |
| Calendar | FullCalendar v6 |
| Payment | Iyzico (`iyzipay`) |
| SMS | İletiMerkezi / NetGSM |
| AI | Google Gemini (`@google/genai`) |
| Bot koruması | Cloudflare Turnstile |

### Design Tokens (`tailwind.config.ts`)
- Primary gold: `#C59F59`
- Background: `#FAF8F5`
- Fonts: Plus Jakarta Sans (body), Playfair Display (headings)

---

## Mimari

### Supabase Client — Kritik Kural

| Bağlam | Client | Import |
|--------|--------|--------|
| Client components (`'use client'`) | `createBrowserClient` | `@/lib/supabase` |
| Server Actions, API routes, middleware | `createServerClient` / admin | `@/lib/supabaseAdmin` |

`supabaseAdmin` service role key kullanır — RLS'i bypass eder. **Sadece server-side kodda kullanılır, client component'larda asla.**

### Data Layer

Tüm DB sorguları `@/services/db/` modülleri üzerinden geçer; `@/services/db.ts` barrel ile export edilir. **Sayfa veya component dosyalarına ham Supabase sorgusu yazılmaz.**

| Modül | Sorumluluk |
|-------|-----------|
| `db_core.ts` | Şehirler, ilçeler, salon tipleri, global servisler |
| `db_salon.ts` | Salon CRUD, onay akışı |
| `db_staff.ts` | Personel yönetimi, çalışma saatleri |
| `db_appointments.ts` | Randevular |
| `db_finance.ts` | Abonelikler, ödemeler |
| `db_user.ts` / `db_customer.ts` | Profil, müşteri verisi |
| `db_support.ts` / `db_resource.ts` | Destek, kaynaklar |

### Types

Tüm TypeScript arayüzleri `@/types.ts` içindedir. **`any` kullanımı yasaktır.** Yeni tipler buraya eklenir.

```typescript
type UserRole = 'CUSTOMER' | 'STAFF' | 'MANAGER' | 'SALON_OWNER' | 'ADMIN' | 'SUPER_ADMIN';
type SalonPlan = 'STARTER' | 'PRO' | 'BUSINESS' | 'ELITE';
// Salon.status: 'DRAFT' | 'SUBMITTED' | 'REVISION_REQUESTED' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'DELETED' | 'PASSIVE'
// Subscription.status: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELLED'
```

### Auth & RBAC

`context/AuthContext.tsx` merkezi auth provider'dır. Helper'lar: `isAdmin`, `isOwner`, `isStaff`, `isAuthenticated`.

Rol hiyerarşisi **middleware** (`middleware.ts`) ile uygulanır:
- `/admin` → sadece `SUPER_ADMIN`
- `/owner` → `SALON_OWNER | MANAGER | SUPER_ADMIN`
- `/staff` → `STAFF | SALON_OWNER | SUPER_ADMIN`
- Yanlış panele giren roller kendi paneline yönlendirilir (örn. OWNER → `/customer` → `/owner/dashboard`)
- `is_active = false` kullanıcılar middleware'de otomatik çıkış yaptırılır

Salon sahipleri `/owner/*`'da onboarding (salon yoksa → `/owner/onboarding`) ve abonelik durumu da kontrol edilir.

### Multi-tenancy / Subdomain Routing

`*.kuaforara.com.tr` subdomainleri middleware'de `/salon-slug/[subdomain]`'e rewrite edilir. Ana domainler `middleware.ts` → `mainDomains` dizisinde tanımlıdır. **Yeni domain eklendiğinde bu dizi güncellenir.**

### Slot Booking Engine

`services/slot.ts` — `SlotService.getAvailableSlots(query)`: personel mesaisi + mevcut randevular + servis süresi hesabıyla boş slotları bulur. `/api/booking/available-slots/` tarafından kullanılır.

### OTP Sistemi

`lib/auth/otp.ts` — 6 haneli kod, 5 dk. süre. `.env`'de `OTP_DEMO_MODE=true` ile SMS bypass edilir (her zaman `111111` döner).

---

## Route Map

| Prefix | Auth | Panel |
|--------|------|-------|
| `/` `/search` `/salon/[id]` `/salon-slug/[slug]` | Public | Marketplace |
| `/login` `/register` `/register/business` | Public | Auth |
| `/booking/[id]/*` `/bookings` | — | 4 adımlı randevu akışı |
| `/customer/*` | CUSTOMER | Müşteri paneli |
| `/owner/*` | SALON_OWNER | Salon sahibi paneli |
| `/staff/*` | STAFF | Personel paneli |
| `/admin/*` | SUPER_ADMIN | Admin paneli |

API routes (`app/api/`): booking, auth (OTP), iyzico webhook, subscription, AI insights, cron reminders.

---

## UI/UX Standartları

- **Tasarım:** Minimalist, premium, modern (shadcn/ui stili).
- **Loading state:** Her zaman Skeleton screen — boş, stillenmemiş alan bırakılmaz.
- **Empty state:** Boş listeler için anlamlı mesaj/görsel eklenir.
- **SEO:** Her sayfada `metadata` export'u veya `generateMetadata` fonksiyonu zorunludur.
- **Erişilebilirlik:** `alt` nitelikleri ve semantik HTML (`section`, `article`, `header`) zorunludur.
- **Import:** Her zaman mutlak import — `@/lib/supabase`, `@/components/...`, `@/services/db`.

---

## Güvenlik Kuralları (Zorunlu)

**Her tabloda RLS aktif olmalıdır.** Politika hiyerarşisi:

| Rol | Yetki |
|-----|-------|
| SUPER_ADMIN / ADMIN | Tüm tablolarda tam yetki (SELECT, INSERT, UPDATE, DELETE) |
| OWNER | Kendi `salon_id`/`owner_id` satırlarında tam yetki — **`salons` ve `salon_services`'ta DELETE yasak** (status update yapılır) |
| STAFF | Sadece kendi randevuları + kendi profili + kendi `working_hours` |
| CUSTOMER | Kendi randevuları/profili/yorumları + APPROVED salonların genel verisi |
| Public (anonim) | Sadece aktif/onaylı salonlar ve global servisler için SELECT |

### DB Değişikliği Sonrası Denetim

```sql
-- RLS aktif mi?
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Tüm politikalar
SELECT policyname, tablename, cmd, roles FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;

-- Admin dışında DELETE politikası var mı? (salons/salon_services'ta olmamalı)
SELECT policyname, tablename FROM pg_policies
WHERE schemaname = 'public' AND cmd = 'DELETE' AND policyname NOT LIKE 'admin_%';
```

---

## Belge Güncelleme Kuralı (ZORUNLU)

**Her özellik/değişiklik commit edilmeden önce ilgili belgeler güncellenmelidir.** Belgeler asla "sonra yapılır" listesine bırakılmaz — koddaki değişiklikle aynı commit'e dahildir.

### Tek doğruluk kaynağı
**`docs/SPECIFICATIONS.md`** — Yazılım Gereksinim ve Tasarım Belgesi. Tüm modüller `[F-XXX]` ID'siyle burada listelenir.

### Hangi değişiklikte hangi belge güncellenir?

| Değişiklik tipi | Güncellenecek belge(ler) |
|-----------------|--------------------------|
| Yeni özellik (yeni `[F-XXX]`) | `docs/SPECIFICATIONS.md` (yeni F-ID + Sürüm Geçmişi) **+** ilgili `docs/modules/<X>.md` veya `docs/integrations/<X>.md` |
| Mevcut özelliğe değişiklik | `docs/SPECIFICATIONS.md` (ilgili F-ID güncel) **+** alt-belge varsa onu da |
| Yeni entegrasyon (örn. yeni SMS provider) | `docs/integrations/<isim>.md` oluştur **+** SPECIFICATIONS.md'ye F-ID ekle |
| Yeni modül (yeni panel/akış) | `docs/modules/<isim>.md` oluştur **+** SPECIFICATIONS.md'de yeni bölüm |
| DB şema değişikliği | `docs/infrastructure/database.md` **+** SPECIFICATIONS.md veri modeli bölümü |
| RLS politikası değişikliği | `docs/infrastructure/rls.md` **+** SPECIFICATIONS.md F-092 |
| Sadece bug fix / refactor | Belge güncellemesi opsiyonel (davranış değişmiyorsa) |

### Sürüm bumping (`docs/SPECIFICATIONS.md`)
- **Major** (1.0.0 → 2.0.0): RLS hiyerarşisi, auth modeli veya domain rename değişikliği
- **Minor** (1.0.0 → 1.1.0): Yeni `[F-XXX]` modülü
- **Patch** (1.0.0 → 1.0.1): Mevcut özelliğe değişiklik, bug fix

### Workflow
1. Kodu yaz/değiştir
2. `docs/SPECIFICATIONS.md` aç → ilgili `[F-XXX]` bölümünü güncelle veya ekle
3. Sürüm geçmişine satır ekle (tarih + commit hash placeholder + ne değişti)
4. Sürüm numarasını bumpla (yukarıdaki kurala göre)
5. İlgili `docs/modules/` veya `docs/integrations/` veya `docs/infrastructure/` belgesini güncelle
6. Aynı commit'e tüm değişiklikleri ekle:
   ```bash
   git add <kod-dosyaları> docs/
   git commit -m "feat: ..."
   ```

### Belge Eksikse / Güncel Değilse Kontrol
Her commit öncesi hızlı kontrol:
```bash
# SPECIFICATIONS.md'de bugün eklenen F-ID'ler var mı?
grep -E "\[F-[0-9]+\]" docs/SPECIFICATIONS.md | wc -l
# Modüllerde dosya eksiği var mı?
ls docs/modules/ docs/integrations/ docs/infrastructure/
```

---

## Veritabanı Migration Workflow

Her şema değişikliği `initdb/New-XX-Description.sql` olarak kaydedilir. Sıradaki numarayı öğrenmek için:

```bash
ls initdb/New-*.sql
```

Kanonik şema: `initdb/Master-Database-Setup.sql`. `New-*.sql` dosyaları üstüne uygulanan artımlı migration'lardır.

### Supabase MCP ile Uygulama

Kod geliştirirken DB değişikliği gerekirse:
1. `initdb/New-XX-Description.sql` dosyasını yaz.
2. Supabase MCP bağlıysa SQL'i doğrudan çalıştır.
3. **MCP bağlı değilse** aşağıdaki uyarıyı ver ve manuel çalıştırmasını iste:

```
⚠️ DB değişikliği gerekiyor:
  Dosya  : initdb/New-XX-Description.sql
  İşlem  : [ne yapıldığı]
  Manuel : Supabase SQL Editor'da bu dosyayı çalıştırman gerekiyor.
```

---

## Yıkıcı Operasyonlar — Zorunlu Onay Protokolü

**Aşağıdakilerden önce dur, kullanıcıya ne olacağını açıkla, onay bekle:**

- `TRUNCATE`, `DROP TABLE`, `DELETE FROM` (dar `WHERE` olmadan), `DROP VIEW`, `DROP POLICY`
- `TRUNCATE ... CASCADE` — önce etkilenen tüm tabloları listele
- `docker exec ... psql` ile şema veya veri silen SQL
- `git reset --hard`, `git clean`, dosya/branch silme
- Backup olmadan geri alınamayacak her işlem

**Gösterilecek format:**
```
⚠️ Yıkıcı operasyon planlandı:
  İşlem    : TRUNCATE public.global_services CASCADE
  Etkiler  : global_services → salon_services → appointments (cascade)
  Kayıp    : Tüm servis verisi + bağımlı satırlar — backup olmadan kurtarılamaz
  Devam edilsin mi? (evet/hayır)
```

**Tercih edilmesi gereken güvenli alternatifler:**
- Encoding düzeltme: `TRUNCATE` yerine `UPDATE table SET col = doğru_değer`
- Policy kaldırma: Sadece `DROP POLICY IF EXISTS <spesifik_policy>`
- CASCADE kullanmadan önce etkilenen tüm tabloları listele
