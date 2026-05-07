# Altyapı: Migration Workflow

## Mevcut Yapı

```
initdb/
├── 00-drop-tables.sql            # Geliştirme reset (DİKKAT)
├── Master-Database-Setup.sql     # Kanonik baz şema
├── New-01-Public-Grants-And-RLS.sql      # Public erişim + RLS hardening
├── New-02-Booking-Flow-Grants.sql        # Booking için grants
├── New-03-Campaign-Rules-And-Gallery.sql # Galeri + kampanya RLS
├── New-04-Sync-Missing-Tables.sql        # 23 eksik tablo + RLS
├── New-05-Backfill-Staff-Hours-And-Services.sql # Veri tamamlama
├── New-06-Final-Sync.sql                 # SMS + IYS + hassas RLS
├── New-07-Staff-Verification-Columns.sql # staff verification kolonları
├── New-08-Demo-Data.sql                  # Demo veri (galeri/yorum/randevu)
├── New-09-Service-Role-Grants.sql        # service_role tüm tablo erişim
├── New-10-OTP-Codes-Table.sql            # otp_codes tablosu
├── 02-seed-data.sql                      # 81 il + ilçe master data
├── 03-sample-data.sql                    # Örnek salon/staff (legacy)
├── 04-advanced-schema.sql                # Storage + finance ek
├── db-health-check.sql                   # Periyodik kontrol scripti
├── README.md                             # initdb klavuzu
├── archive/
│   ├── migration-history/                # New-01..New-45 (eski incrementaller)
│   └── old/                              # Pre-New-XX dönem
└── helpersql/                            # Ad-hoc dump/fix dosyaları
```

## Migration Sırası (Sıfırdan Kurulum)

```bash
# 1. Drop (eğer fresh install)
psql < initdb/00-drop-tables.sql

# 2. Ana şema
psql < initdb/Master-Database-Setup.sql

# 3. Master data
psql < initdb/02-seed-data.sql

# 4. Sırayla New-XX (root)
psql < initdb/New-01-Public-Grants-And-RLS.sql
psql < initdb/New-02-Booking-Flow-Grants.sql
psql < initdb/New-03-Campaign-Rules-And-Gallery.sql
psql < initdb/04-advanced-schema.sql      # transactions + storage
psql < initdb/New-04-Sync-Missing-Tables.sql
psql < initdb/New-05-Backfill-Staff-Hours-And-Services.sql
psql < initdb/New-06-Final-Sync.sql
psql < initdb/New-07-Staff-Verification-Columns.sql
psql < initdb/New-08-Demo-Data.sql        # opsiyonel (test data)
psql < initdb/New-09-Service-Role-Grants.sql
psql < initdb/New-10-OTP-Codes-Table.sql

# 5. Sağlık kontrolü
psql < initdb/db-health-check.sql
```

## Yeni Migration Ekleme Akışı

CLAUDE.md kurallarına göre:

1. **Sıradaki numarayı al:**
   ```bash
   ls initdb/New-*.sql
   # En son numarayı +1 ekle (ör: New-11-Feature-X.sql)
   ```

2. **Idempotent yaz** — her migration tekrar çalıştırıldığında hata vermemeli:
   ```sql
   CREATE TABLE IF NOT EXISTS ...
   ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...
   INSERT ... ON CONFLICT DO NOTHING
   DROP POLICY IF EXISTS ... ; CREATE POLICY ...
   ```

3. **Sonunda PostgREST cache yenile:**
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```

4. **Supabase MCP ile uygula:**
   ```typescript
   // Claude Code'da MCP bağlıysa otomatik
   mcp__supabase__execute_sql veya mcp__postgres__query
   ```

5. **MCP yoksa manuel çalıştırma uyarısı ver:**
   ```
   ⚠️ DB değişikliği gerekiyor:
     Dosya  : initdb/New-XX-Description.sql
     İşlem  : [özet]
     Manuel : docker exec -i supabase-db psql -U postgres -d postgres < initdb/New-XX-...sql
   ```

## Idempotent Şablon

```sql
-- =============================================================================
-- New-XX-Title.sql
-- Açıklama
-- =============================================================================

-- 1. Schema değişiklikleri
ALTER TABLE public.foo ADD COLUMN IF NOT EXISTS new_col text;

CREATE TABLE IF NOT EXISTS public.bar (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ...
);

-- 2. RLS
ALTER TABLE public.bar ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "policy_name" ON public.bar;
CREATE POLICY "policy_name" ON public.bar FOR SELECT USING (...);

-- 3. Grants
GRANT SELECT ON public.bar TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.bar TO authenticated;

-- 4. Seed (opsiyonel)
INSERT INTO public.bar (col) VALUES (...) ON CONFLICT DO NOTHING;

-- 5. Doğrulama
DO $$
DECLARE n int;
BEGIN
  SELECT COUNT(*) INTO n FROM public.bar;
  RAISE NOTICE 'bar tablosunda % satır', n;
END $$;

-- 6. Cache reload
NOTIFY pgrst, 'reload schema';
```

## Yıkıcı Operasyonlar — ZORUNLU Onay

CLAUDE.md kuralı:

**Aşağıdakilerden önce dur, kullanıcıya açıkla, onay bekle:**
- `TRUNCATE`, `DROP TABLE`, `DELETE FROM` (dar `WHERE` olmadan)
- `DROP VIEW`, `DROP POLICY`
- `TRUNCATE ... CASCADE`
- `git reset --hard`, `git clean`, branch silme

**Format:**
```
⚠️ Yıkıcı operasyon planlandı:
  İşlem    : TRUNCATE public.global_services CASCADE
  Etkiler  : global_services → salon_services → appointments
  Kayıp    : Tüm servis verisi + bağımlı satırlar
  Devam edilsin mi? (evet/hayır)
```

## Açık Aksiyon (TODO)
- 🟡 **Master schema güncelleme** — `Master-Database-Setup.sql` mevcut DB ile %100 uyumlu değil; yeni dump ile değiştirilmeli
- 🟡 **Migration tracking tablosu** — `_migrations` tablosu ekle, hangi New-XX uygulandı kaydet
- 🟢 **CI'da migration test** — fresh DB'ye sıralı uygulama test
- 🟢 **Down migration** — geri alma scriptleri (riskli, opsiyonel)
- 🟢 **archive/old temizliği** — kullanılmayan eski dosyalar `_archive/` altına taşı

## Bağlantılar
- Add migration workflow: [.agent/workflows/add-sql-migration.md](../../.agent/workflows/add-sql-migration.md)
- DB sync workflow: [.agent/workflows/db-sync.md](../../.agent/workflows/db-sync.md)
- Data migration safety: [.agent/workflows/data-migration-safety.md](../../.agent/workflows/data-migration-safety.md)
- Init README: [initdb/README.md](../../initdb/README.md)
