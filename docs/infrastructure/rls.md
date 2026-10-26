# Altyapı: RLS & Güvenlik

## Genel
**Row Level Security (RLS)** projenin güvenlik omurgasıdır. PostgreSQL seviyesinde her satıra "kim erişebilir?" sorusu yanıtlanır. API hatası, uygulama bug'ı veya yetkili olmayan kullanıcı doğrudan DB'ye bağlansa dahi yetkisi olmayan satırlara erişemez.

## Roller

### Veritabanı Rolleri
| Rol | Davranış |
|-----|----------|
| `anon` | Anonim ziyaretçi (login öncesi) |
| `authenticated` | Login olmuş herhangi bir kullanıcı (`auth.uid()` non-null) |
| `service_role` | Backend (admin) — RLS bypass — `BYPASSRLS` |
| `postgres` | DB owner (sadece migration için) |

### Uygulama Rolleri (`profiles.role`)
`CUSTOMER`, `STAFF`, `MANAGER`, `SALON_OWNER`, `ADMIN`, `SUPER_ADMIN`

## Mevcut Durum (2026-05-31)
- **49 tablo** — 44'ünde RLS açık, 5'i public lookup (cities, districts, salon_types, service_categories, global_services)
- **91 policy** tanımlı
- **service_role** tüm public tablolara `ALL` GRANT'ı var (New-09)
- **authenticated** rolü için RLS-aktif tüm tablolarda SELECT GRANT mevcut (New-14 ile audit + tamamlama)

## Politika Hiyerarşisi (Kural Kitabı)

### SUPER_ADMIN / ADMIN
Tüm tablolarda **FOR ALL** yetkisi.
```sql
EXISTS (SELECT 1 FROM profiles WHERE id=auth.uid() AND role IN ('SUPER_ADMIN','ADMIN'))
```

### OWNER
Kendi `salon_id` / `owner_id` satırlarında **FOR ALL**.
```sql
salon_id IN (SELECT id FROM salons WHERE owner_id=auth.uid())
```
**Kritik:** `salons` ve `salon_services` tablolarında **DELETE yasak** (status update yapılır).

### STAFF
Sadece kendi profili + atanan randevu + kendi `working_hours`.
```sql
auth.uid() = user_id
```

### CUSTOMER
Kendi randevuları/profili/yorumları + APPROVED salon public verisi.
```sql
auth.uid() = customer_id  -- veya benzer
```

### Public (anon)
Sadece APPROVED salonlar + lookup tabloları (cities, districts, services, types, categories).

## Public Lookup Tabloları (RLS Gereksiz)
RLS yerine GRANT SELECT ile açılır:
- `cities` (81 il)
- `districts` (975 ilçe)
- `salon_types` (9 tip)
- `service_categories` (8 kategori)
- `global_services` (63 hizmet)

## Storage Bucket Policy'leri
| Bucket | Public Read | Yazma Yetkisi |
|--------|-------------|---------------|
| `salon-images` | ✅ | Salon owner |
| `staff-photos` | ✅ | Salon owner |
| `avatars` | ✅ | Kendi avatarı |
| `reviews` | ✅ | Yorumun sahibi |
| `system-assets` | ✅ | Sadece admin |

## Periyodik Denetim
**Komut:**
```bash
docker exec -i supabase-db psql -U postgres -d postgres < initdb/db-health-check.sql
```

**Kontrolü:**
1. RLS kapalı hassas tablo: 0
2. RLS açık ama policy'siz tablo: 0
3. salons / salon_services üzerinde admin dışı DELETE policy: 0
4. Master data dolu mu (cities, districts, services, plans)
5. Storage bucket sayısı: ≥5

## Yaygın Hatalar ve Çözümleri

### PostgREST GRANT vs RLS — Tekrar Eden Boş `{}` Hatası Pattern'i

**Belirti:** Client'ta `Console Error: <bir şey> çekilemedi: {}` — boş gövdeli error.

**Sebep:** Tablo RLS açık + policy doğru, **ama** rol için **base GRANT eksik**. Self-hosted Supabase'de:

```
İstek → PostgREST → 1) Base GRANT kontrolü → 2) RLS policy → Yanıt
                       └ FAIL  → ya 42501 ya boş {} (özellikle join'li query'lerde)
```

**Çözüm — Birlikte verilmeli:**
```sql
ALTER TABLE public.<tbl> ENABLE ROW LEVEL SECURITY;
CREATE POLICY "..." ON public.<tbl> FOR SELECT USING (...);
GRANT SELECT ON public.<tbl> TO authenticated;  -- ← unutulmamalı
GRANT SELECT ON public.<tbl> TO anon;            -- public okuma gerekliyse
```

**Tarihçe / Olay Listesi:**
| Tarih | Tablo | Belirti | Çözüm |
|-------|-------|---------|-------|
| 2026-05-07 | `notifications` | NotificationCenter `42501 permission denied` | [New-12](../../initdb/New-12-Notifications-Select-Grant.sql) — SELECT grant |
| 2026-05-07 | tüm public tablolar (server-side) | "Sabah saatlerinde slot yok" — slot motoru appointments okuyamıyordu | [New-09](../../initdb/New-09-Service-Role-Grants.sql) — service_role'a ALL grant + BYPASSRLS |
| 2026-05-31 | `support_tickets`, `ticket_messages` + 17 diğer tablo | `/admin/support` → `Biletler çekilemedi: {}` | [New-14](../../initdb/New-14-Authenticated-Select-Grants-Audit.sql) — authenticated SELECT grant + audit |

**Önleyici Audit:** `db-health-check.sql` Section 8, RLS açık olup `authenticated` SELECT GRANT'ı eksik tabloları her çalıştırmada listeler. PR öncesi kontrol edilmelidir.

### "permission denied for table X"
**Sebep:** Tablo RLS açık ama o role policy yok, **veya** GRANT verilmemiş.
**Çözüm:**
- Frontend (anon/authenticated): GRANT + RLS policy
- Backend (service_role): GRANT (BYPASSRLS otomatik bypass eder)

**Örnek olay:** New-09 öncesi `service_role`'a hiç GRANT yoktu → booking API "Sabah saatlerinde slot yok" döndürüyordu (slot motoru appointments okuyamıyordu).

### Sonsuz döngü (infinite recursion in policy)
**Sebep:** Policy kendi tablosunu sorguluyor.
```sql
-- HATALI:
CREATE POLICY ... ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE ...)  -- recursion!
);
```
**Çözüm:** `auth.uid()` veya `auth.jwt()` ile direkt JWT claim kullan.

### "new row violates row-level security policy"
**Sebep:** INSERT policy yok veya `WITH CHECK` koşulu sağlanmamış.
**Çözüm:** Her tablo için INSERT policy + CRUD matrisi tamamla.

## RLS CRUD Matrisi (Kritik Tablolar)

| Tablo | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `profiles` | self + public salon owner/staff + admin | self (trigger) | self + admin — `role`/`is_active` **sadece admin/server** (trigger `guard_profile_privileged_columns`) | admin |
| `salons` | public (APPROVED) + owner + admin | owner | owner + admin | admin |
| `salon_services` | public + owner + admin | owner + admin | owner + admin | admin |
| `appointments` | self + staff + owner + admin | self | staff + owner + admin | admin |
| `staff` | public (**sadece public kolonlar**) + owner + admin | owner + admin | owner + admin | owner + admin |
| `invites` | owner + admin (token ile: `get_invite_by_token` RPC) | owner | owner | owner + admin |
| `staff_services` | public | owner + admin | owner + admin | owner + admin |
| `working_hours` | public | owner + admin | owner + admin | owner + admin |
| `payment_history` | self + owner + admin | system | admin | admin |
| `subscriptions` | owner + admin | system | admin | admin |
| `audit_logs` | owner + admin | system (insert) | - | - |
| `notifications` | self | system | self (mark read) | - |

> ⚠️ **Tablo-seviyesi GRANT, RLS'in önkoşuludur.** RLS politikası tek başına yetmez; ilgili rolde (`authenticated`) tablo GRANT'ı yoksa PostgREST `42501 permission denied for table` döner. `notifications`'ta `authenticated` rolünün `SELECT` GRANT'ı eksikti (INSERT/UPDATE/DELETE vardı) → client SELECT 403 alıyordu. Düzeltme: [initdb/New-12-Notifications-Select-Grant.sql](../../initdb/New-12-Notifications-Select-Grant.sql). Satır görünürlüğü `users_view_own_notifications` (USING `auth.uid() = user_id`) ile sınırlı kaldığından veri ifşası yok.

## Güvenlik Sertleştirmesi (New-33, 2026-10-26)

| Konu | Kural |
|------|-------|
| **Rol ataması** | `handle_new_user` client metadata'dan sadece `CUSTOMER` / `SALON_OWNER` kabul eder. `STAFF`/`MANAGER` yalnızca `accept_staff_invite(token)` ile — davet e-postası oturumdaki kullanıcıyla eşleşmeli. `SUPER_ADMIN`/`ADMIN` sadece DB'den (service_role) |
| **profiles.role / is_active** | `BEFORE UPDATE` trigger: `authenticated`/`anon` rolündeyken sadece `is_admin()` değiştirebilir. Definer fonksiyonlar ve service_role etkilenmez |
| **staff PII** | `anon`/`authenticated` için **kolon bazlı** SELECT: `id, salon_id, user_id, name, photo, specialty, bio, is_active, created_at, updated_at, rating, review_count, role`. `email, phone, tc_no, is_*_verified, kvkk_consent, verified_at` → `get_staff_private(uuid[])` RPC (salon sahibi / personelin kendisi / admin). **Kodda `staff` üzerinde `select("*")` veya parametresiz `.select()` kullanılmaz** → `STAFF_PUBLIC_COLUMNS` + `withStaffPrivate()` ([services/db/staff_columns.ts](../../services/db/staff_columns.ts)) |
| **invites** | Public listeleme yok. Token sorgusu `get_invite_by_token(text)`, kabul `accept_staff_invite(text)` (definer RPC) |
| **is_admin()** | `profiles` üzerinde admin politikaları için SECURITY DEFINER helper (policy içinde `profiles`'ı sorgulamak sonsuz döngü yaratır) |
| **SECURITY DEFINER** | Hepsinde `SET search_path = public, pg_temp` zorunlu |

Regresyon kontrolü: `db-health-check.sql` **Section 10** (beklenen 0 bulgu).

## Açık Aksiyon (TODO)
- ✅ ~~notifications / audit_logs `INSERT WITH CHECK (true)`~~ → New-34 `notifications_insert_scoped` (self / admin / salon → o salonda randevusu olan müşteri), `audit_insert_scoped` (`user_id` default `auth.uid()` + `can_act_for_salon`)
- ✅ ~~slot_reservations anon INSERT~~ → New-34: INSERT REVOKE, sadece `acquire_slot_lock` (client `p_user_id` yok sayılır, oturum başına tek kilit, max 8 saat)
- ✅ `staff.user_id` sadece kendi hesabına bağlanabilir, `rating/review_count` client'tan yazılamaz (trigger `guard_staff_privileged_columns`)
- ℹ️ `auth` şeması PostgREST'e **açılmaz**; server kodu kullanıcı aramak için `auth_user_id_by_phone/email` (New-36, sadece service_role) kullanır
- 🟢 **Otomatik denetim** — health-check.sql'i CI'da çalıştır (PR öncesi)
- 🟢 **Penetration test** — anon kullanıcı ile her tablo için 4xx yanıt beklenmesi gereken sorgular test edilebilir
- 🟢 **Policy test suite** — pgTAP ile her policy için test
- 🟢 **Audit log query view** — admin için filtreli "şüpheli aktivite" sayfası

## Bağlantılar
- Health check: [initdb/db-health-check.sql](../../initdb/db-health-check.sql)
- RLS workflow: [.agent/workflows/check-rls.md](../../.agent/workflows/check-rls.md)
- Service role grants: [initdb/New-09-Service-Role-Grants.sql](../../initdb/New-09-Service-Role-Grants.sql)
- Booking flow grants: [initdb/New-02-Booking-Flow-Grants.sql](../../initdb/New-02-Booking-Flow-Grants.sql)
- Public grants: [initdb/New-01-Public-Grants-And-RLS.sql](../../initdb/New-01-Public-Grants-And-RLS.sql)
- Final sync: [initdb/New-06-Final-Sync.sql](../../initdb/New-06-Final-Sync.sql)
