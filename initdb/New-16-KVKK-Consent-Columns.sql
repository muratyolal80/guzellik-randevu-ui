-- =============================================================================
-- New-16-KVKK-Consent-Columns.sql
-- Faz: Sprint A — Kolay Üyelik (U1)
-- Amaç: Register sayfasında alınan KVKK + Ticari İleti rızasını kalıcı saklamak
-- =============================================================================

-- 1. profiles tablosuna rıza alanları ekle (idempotent)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS kvkk_accepted_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS kvkk_version      TEXT,
  ADD COLUMN IF NOT EXISTS marketing_opt_in  BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS marketing_opt_in_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.kvkk_accepted_at  IS 'KVKK Aydınlatma Metni rıza zamanı (NULL ise rıza yok)';
COMMENT ON COLUMN public.profiles.kvkk_version      IS 'Hangi sürüm KVKK metnine rıza verildi (ör. v1.0)';
COMMENT ON COLUMN public.profiles.marketing_opt_in  IS 'Ticari elektronik ileti onayı (KVKK madde 11 ayrı rıza)';
COMMENT ON COLUMN public.profiles.marketing_opt_in_at IS 'Marketing rızası zamanı';

-- 2. KVKK sürüm ayarı (yeni metin geldiğinde kullanıcılara modal göstermek için)
INSERT INTO public.platform_settings (key, value) VALUES
  ('kvkk_version', '"v1.0"')
ON CONFLICT (key) DO NOTHING;

-- 2b. sms_verifications tablosuna IYS API entegrasyon alanları
ALTER TABLE public.sms_verifications
  ADD COLUMN IF NOT EXISTS iys_registered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS iys_consent_id    TEXT;

COMMENT ON COLUMN public.sms_verifications.iys_registered_at IS 'IYS API''ye başarılı kayıt zamanı';
COMMENT ON COLUMN public.sms_verifications.iys_consent_id    IS 'IYS API''den dönen rıza ID''si';

-- 3. _migrations kaydı
INSERT INTO public._migrations (name, applied_at)
VALUES ('New-16-KVKK-Consent-Columns.sql', NOW())
ON CONFLICT (name) DO NOTHING;

-- 4. Doğrulama
DO $$
DECLARE
  cnt int;
BEGIN
  SELECT COUNT(*) INTO cnt
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name IN ('kvkk_accepted_at','kvkk_version','marketing_opt_in','marketing_opt_in_at');

  IF cnt < 4 THEN
    RAISE EXCEPTION 'New-16 FAIL: profiles tablosunda eksik kolon (% / 4 var)', cnt;
  END IF;
  RAISE NOTICE 'New-16 OK: profiles KVKK kolonları (% / 4)', cnt;
END $$;

-- 5. PostgREST cache yenile
NOTIFY pgrst, 'reload schema';
