-- Rollback-03-Campaign-Rules-And-Gallery.sql
-- ⚠️ YIKICI: salon_gallery tablosunu siler (gallery resimleri kaybolur).
-- Manuel onay olmadan çalıştırmayın.

-- 1) salon_gallery — tablo komple silinir
DROP TABLE IF EXISTS public.salon_gallery CASCADE;

-- 2) campaign_rules — tablo silmiyoruz (sadece bu migration'ın eklediği policy/grant'leri geri al)
REVOKE SELECT ON public.campaign_rules FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.campaign_rules FROM authenticated;
ALTER TABLE public.campaign_rules DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_campaigns" ON public.campaign_rules;
DROP POLICY IF EXISTS "owner_manage_campaigns" ON public.campaign_rules;

NOTIFY pgrst, 'reload schema';
