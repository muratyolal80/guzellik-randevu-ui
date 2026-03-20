-- =============================================================================
-- New-43-Staff-Schema-Fix.sql
-- Staff tablosundaki eksik 'role' kolonu ve Schema Cache temizliği
-- =============================================================================

-- 1. 'role' kolonunun varlığından emin olalım
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS role text;

-- 2. PostgREST (Supabase API) şema önbelleğini yenileyelim
-- Bu komut, yeni eklenen kolonların API üzerinden görünmesini sağlar.
NOTIFY pgrst, 'reload schema';
