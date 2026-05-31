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

## Mevcut Durum (2026-05-07)
- **47 tablo** — 42'sinde RLS açık, 5'i public lookup (RLS gerekmez)
- **90 policy** tanımlı
- **service_role** tüm public tablolara `ALL` GRANT'ı var (New-09)

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
| `profiles` | self + public salon owner/staff | self | self | admin |
| `salons` | public (APPROVED) + owner + admin | owner | owner + admin | admin |
| `salon_services` | public + owner + admin | owner + admin | owner + admin | admin |
| `appointments` | self + staff + owner + admin | self | staff + owner + admin | admin |
| `staff` | public + owner + admin | owner + admin | owner + admin | owner + admin |
| `staff_services` | public | owner + admin | owner + admin | owner + admin |
| `working_hours` | public | owner + admin | owner + admin | owner + admin |
| `payment_history` | self + owner + admin | system | admin | admin |
| `subscriptions` | owner + admin | system | admin | admin |
| `audit_logs` | owner + admin | system (insert) | - | - |
| `notifications` | self | system | self (mark read) | - |

> ⚠️ **Tablo-seviyesi GRANT, RLS'in önkoşuludur.** RLS politikası tek başına yetmez; ilgili rolde (`authenticated`) tablo GRANT'ı yoksa PostgREST `42501 permission denied for table` döner. `notifications`'ta `authenticated` rolünün `SELECT` GRANT'ı eksikti (INSERT/UPDATE/DELETE vardı) → client SELECT 403 alıyordu. Düzeltme: [initdb/New-12-Notifications-Select-Grant.sql](../../initdb/New-12-Notifications-Select-Grant.sql). Satır görünürlüğü `users_view_own_notifications` (USING `auth.uid() = user_id`) ile sınırlı kaldığından veri ifşası yok.

## Açık Aksiyon (TODO)
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
