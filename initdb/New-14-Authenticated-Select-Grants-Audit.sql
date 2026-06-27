-- =============================================================================
-- New-14-Authenticated-Select-Grants-Audit.sql
--
-- Problem: /admin/support sayfası "Biletler çekilemedi: {}" hatası veriyor.
-- Root cause: support_tickets ve ticket_messages tablolarında RLS POLİTİKASI var
--   ama 'authenticated' rolüne base SELECT/INSERT GRANT'ı VERİLMEMİŞ.
--   PostgREST tabloya hiç bakamadığı için Supabase JS client boş {} döndürüyor.
--   Bu, daha önce 'notifications' için (New-12) çözülen pattern'in tekrarı.
--
-- Self-hosted Supabase'de RLS ve GRANT iki ayrı katmandır:
--   istek → PostgREST → base GRANT kontrol → RLS policy → yanıt
--   GRANT eksikse RLS politikası ne kadar doğru olsa çalışmıyor gibi görünür.
--
-- Bu migration:
--   1) support_tickets / ticket_messages için eksik GRANT'ları ekler
--   2) Tüm RLS-aktif public tabloları tarayıp authenticated SELECT eksikleri tespit eder
--      ve otomatik olarak GRANT verir (idempotent, satır görünürlüğü RLS ile sınırlıdır)
--   3) RLS hâlâ aktif mi safety doğrulaması yapar
--   4) _migrations tracking tablosuna kayıt düşer
--   5) PostgREST cache reload
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Support modülü için kesin gereksinim (support hatasının doğrudan çözümü)
-- -----------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE ON public.support_tickets TO authenticated;
GRANT SELECT, INSERT          ON public.ticket_messages TO authenticated;

-- -----------------------------------------------------------------------------
-- 2. Audit + Otomatik tamir
--    RLS aktif olup 'authenticated'a SELECT yetkisi olmayan tüm public tabloları
--    listele ve otomatik GRANT SELECT ver. Satır seviyesinde koruma RLS'de zaten var.
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    rec record;
    fixed_count int := 0;
    fixed_tables text[] := ARRAY[]::text[];
BEGIN
    FOR rec IN
        SELECT c.relname
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relkind = 'r'                                    -- ordinary table
          AND c.relrowsecurity = true                            -- RLS aktif
          AND NOT has_table_privilege('authenticated', c.oid, 'SELECT')
        ORDER BY c.relname
    LOOP
        EXECUTE format('GRANT SELECT ON public.%I TO authenticated', rec.relname);
        fixed_tables := fixed_tables || rec.relname;
        fixed_count := fixed_count + 1;
    END LOOP;

    IF fixed_count = 0 THEN
        RAISE NOTICE 'New-14: Tüm RLS-aktif tablolarda authenticated SELECT grant tamam (eksik yok).';
    ELSE
        RAISE NOTICE 'New-14: % tabloya authenticated SELECT GRANT verildi: %', fixed_count, fixed_tables;
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 3. Safety: RLS hâlâ aktif mi? (regression koruması)
--    Bu kontrol, hiçbir önceki migration'ın yanlışlıkla RLS'i kapattığını yakalar.
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    rec record;
    disabled_tables text[] := ARRAY[]::text[];
BEGIN
    FOR rec IN
        SELECT c.relname
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relkind = 'r'
          AND c.relrowsecurity = false
          -- _migrations dışındaki, kullanıcı tabloları (master data hariç tutulabilir)
          AND c.relname NOT IN (
              'spatial_ref_sys'  -- PostGIS sistem tablosu
          )
    LOOP
        disabled_tables := disabled_tables || rec.relname;
    END LOOP;

    IF array_length(disabled_tables, 1) > 0 THEN
        RAISE NOTICE 'New-14 UYARI: RLS kapalı public tablolar: %', disabled_tables;
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 4. _migrations tablosuna kayıt
-- -----------------------------------------------------------------------------
INSERT INTO public._migrations (name, notes) VALUES
    ('New-14-Authenticated-Select-Grants-Audit',
     'support_tickets/ticket_messages SELECT/INSERT grants + tüm RLS-aktif tablolarda authenticated SELECT audit')
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 5. PostgREST cache reload
-- -----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
