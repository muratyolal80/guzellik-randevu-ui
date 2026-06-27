-- =============================================================================
-- New-21-Profiles-Birth-Date.sql
-- Faz: Bugfix
-- Amaç: profiles.birth_date kolonu types.ts'de tanımlı ve customer profile
--       form'unda kullanılıyor ama DB'de yok → "schema cache" hatası.
-- =============================================================================
--
-- Hata: "Could not find the 'birth_date' column of 'profiles' in the schema cache"
-- Tespit: /customer/profile sayfasında "Değişiklikleri Kaydet" buttonu basıldığında
-- =============================================================================

-- 1. birth_date kolonu (idempotent)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birth_date DATE;

COMMENT ON COLUMN public.profiles.birth_date IS
  'Kullanıcının doğum tarihi. KVKK kapsamında müşteri rıza vererek paylaşır.';

-- 2. Migration log
INSERT INTO public._migrations (name, applied_at)
VALUES ('New-21-Profiles-Birth-Date.sql', NOW())
ON CONFLICT (name) DO NOTHING;

-- 3. Doğrulama
DO $$
DECLARE
  has_col boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'birth_date'
  ) INTO has_col;

  IF NOT has_col THEN
    RAISE EXCEPTION 'New-21 FAILED: profiles.birth_date yok';
  END IF;

  RAISE NOTICE 'New-21 OK: profiles.birth_date eklendi';
END $$;

NOTIFY pgrst, 'reload schema';
