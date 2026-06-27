-- =============================================================================
-- New-09-Service-Role-Grants.sql
-- KRITIK DÜZELTME: service_role'a tüm public şemada tam yetki verir.
-- Sebep: self-hosted Supabase kurulumunda service_role'a otomatik GRANT
-- gelmemiş. Bu yüzden supabaseAdmin tüm tablolarda 'permission denied' alıyordu.
-- Etki: Booking flow, admin paneli, cron job'lar — hepsi düzgün çalışacak.
-- =============================================================================

-- Şema yetkisi
GRANT USAGE ON SCHEMA public TO service_role;

-- Mevcut tablo + sequence + fonksiyonlara tam yetki
GRANT ALL ON ALL TABLES    IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Bundan sonra oluşturulacak yeni nesnelere de otomatik yetki ver
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;

-- service_role RLS bypass kullanır; explicit policy gerektirmez ama bazı
-- managed Supabase ortamlarıyla uyum için BYPASSRLS attribute'unu garantiye al.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='service_role' AND rolbypassrls=true) THEN
        ALTER ROLE service_role BYPASSRLS;
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';

-- Doğrulama
DO $$
DECLARE cnt int;
BEGIN
    SELECT COUNT(*) INTO cnt FROM information_schema.role_table_grants
    WHERE table_schema='public' AND grantee='service_role';
    RAISE NOTICE 'service_role tablo yetkileri (beklenen ~ tablo sayısı * 7 priv): %', cnt;
END $$;
