-- =============================================================================
-- New-20-OTP-Codes-RLS-Policy.sql
-- Faz: Production hijyen
-- Amaç: otp_codes tablosunda RLS açık ama policy yok — health-check uyarısı kapat
-- =============================================================================
--
-- Mevcut durum:
--   - public.otp_codes RLS enabled
--   - 0 policy → anon/authenticated rolleri okuyamaz/yazamaz (doğru davranış,
--     OTP kodları sadece server-side oluşturulmalı/doğrulanmalı)
--   - lib/auth/otp.ts supabaseAdmin (service_role) kullanır → bypass RLS
--
-- Çözüm: service_role için EXPLICIT policy ekle.
--   - Davranışı değiştirmez (service_role zaten bypass eder)
--   - Niyeti açıkça belgeler
--   - Health-check Section 2 uyarısını kapatır
--   - Gelecekte yanlışlıkla anon/auth ile çağrı yapılırsa katmanlı koruma
--
-- DİKKAT: anon ve authenticated rollerine policy VERMİYORUZ — OTP kodları
-- gizli kalmalı, sadece backend bilebilmeli.
-- =============================================================================

-- 1. RLS hâlâ aktif (idempotent guard)
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- 2. service_role için tüm operasyonlara izin (DROP IF EXISTS ile idempotent)
DROP POLICY IF EXISTS "service_role_full_access" ON public.otp_codes;

CREATE POLICY "service_role_full_access" ON public.otp_codes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY "service_role_full_access" ON public.otp_codes IS
  'OTP kodları sadece backend (supabaseAdmin/service_role) tarafından okunur/yazılır. anon ve authenticated için POLICY YOK = erişim yok.';

-- 3. service_role için GRANT'lar (RLS+GRANT ikilisi kuralı, CLAUDE.md)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.otp_codes TO service_role;

-- 4. _migrations kaydı
INSERT INTO public._migrations (name, applied_at)
VALUES ('New-20-OTP-Codes-RLS-Policy.sql', NOW())
ON CONFLICT (name) DO NOTHING;

-- 5. Doğrulama
DO $$
DECLARE
  policy_count int;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname='public' AND tablename='otp_codes';

  IF policy_count = 0 THEN
    RAISE EXCEPTION 'New-20 FAILED: otp_codes hâlâ 0 policy';
  END IF;

  RAISE NOTICE 'New-20 OK: otp_codes % policy aktif (sadece service_role)', policy_count;
END $$;

NOTIFY pgrst, 'reload schema';
