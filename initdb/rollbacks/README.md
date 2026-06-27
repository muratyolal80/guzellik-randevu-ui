# Migration Rollbacks

Her `New-XX-Description.sql` migration'ı için **karşılığında** bir rollback dosyası oluşturulur:

```
initdb/rollbacks/Rollback-XX-Description.sql
```

## Kurallar

1. **Rollback dosyası migration'la birlikte yazılır** — migration applied ise rollback hazır olmalı.
2. **DROP TABLE / DROP COLUMN içeren rollback'ler yıkıcıdır** → kullanıcıya onay sormadan çalıştırılmaz.
3. **Sadece `GRANT` veya `CREATE POLICY` ekleyen migration'lar için** rollback genellikle:
   ```sql
   REVOKE SELECT ON TABLE foo FROM anon;
   DROP POLICY IF EXISTS "policy_name" ON foo;
   ```
4. **`CREATE TABLE` içeren migration'lar için** rollback:
   ```sql
   DROP TABLE IF EXISTS public.foo CASCADE;
   ```
   ⚠️ **CASCADE veri kaybına yol açar — manuel çalıştırılır.**

## Mevcut migration → rollback eşleşmeleri

| Migration | Rollback | Tip |
|-----------|----------|-----|
| `New-01-Public-Grants-And-RLS.sql` | `Rollback-01-Public-Grants-And-RLS.sql` | Yıkıcı değil (REVOKE + DROP POLICY) |
| `New-02-Booking-Flow-Grants.sql`   | `Rollback-02-Booking-Flow-Grants.sql`   | Yıkıcı değil |
| `New-03-Campaign-Rules-And-Gallery.sql` | `Rollback-03-Campaign-Rules-And-Gallery.sql` | ⚠️ Yıkıcı (`salon_gallery` DROP) |
| `New-04-IYS-Log.sql` | `Rollback-04-IYS-Log.sql` | ⚠️ Yıkıcı (`iys_log` DROP — log kaybı) |

## Çalıştırma

```bash
docker exec -i supabase-db psql -U postgres -d postgres < initdb/rollbacks/Rollback-XX-Description.sql
```
