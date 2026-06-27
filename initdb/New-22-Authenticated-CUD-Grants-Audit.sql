-- =============================================================================
-- New-22-Authenticated-CUD-Grants-Audit.sql
-- Faz: RLS+GRANT ikilisi denetimi (CLAUDE.md zorunlu kuralı)
-- Amaç: RLS açık ama authenticated rolüne INSERT/UPDATE/DELETE GRANT eksik
--       tabloları topluca düzelt. RLS satır seviyesinde koruma korunur.
-- =============================================================================
--
-- ARKA PLAN:
--   New-14 (2026-05-31) audit'i SADECE SELECT GRANT'larını tamamladı.
--   UPDATE/INSERT/DELETE atlandı → /customer/profile "Değişiklikleri Kaydet"
--   "permission denied for table profiles" hatası verdi.
--
-- STRATEJİ:
--   - Kullanıcı CRUD tabloları: authenticated I/U/D GRANT (RLS zaten satır kısıtlıyor)
--   - Backend-only tablolar: dokunma — sadece service_role yazar
--     (_migrations, *_webhooks, otp_codes, iys_log, platform_settings,
--      subscription_plans, salon_type_categories)
-- =============================================================================

-- 1. Kullanıcı kendi satırı / sahibi olduğu satırı CRUD yapabilen tablolar
DO $$
DECLARE
  t text;
  user_writable_tables text[] := ARRAY[
    'profiles',           -- kendi profili (RLS: id = auth.uid())
    'appointments',       -- müşteri/salon owner kendi randevuları
    'reviews',            -- kullanıcı kendi yorumu
    'salons',             -- owner kendi salonu (DELETE policy YOK — status update)
    'salon_resources',    -- owner kendi salonunun kaynakları
    'salon_services',     -- owner kendi salonunun hizmetleri (DELETE policy YOK)
    'salon_working_hours',-- owner kendi salonunun saatleri
    'staff',              -- owner kendi salonunun personeli
    'working_hours',      -- staff/owner mesai saatleri
    'slot_reservations'   -- müşteri slot kilidi (5 dk TTL)
  ];
BEGIN
  FOREACH t IN ARRAY user_writable_tables LOOP
    IF EXISTS (
      SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND c.relname=t
    ) THEN
      EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
      RAISE NOTICE 'New-22: % → authenticated SELECT,INSERT,UPDATE,DELETE GRANT', t;
    ELSE
      RAISE WARNING 'New-22: skipping % (tablo yok)', t;
    END IF;
  END LOOP;
END $$;

-- 2. salons + salon_services'ta authenticated DELETE'i geri al
-- (CLAUDE.md kuralı: OWNER kendi salonunu fiziksel silmez, status update yapar)
REVOKE DELETE ON public.salons FROM authenticated;
REVOKE DELETE ON public.salon_services FROM authenticated;

-- 3. Backend-only tablolar — sadece service_role yazsın (idempotent restate)
-- Bunlara explicit REVOKE yok; zaten default'ta authenticated I/U/D yoktu.
COMMENT ON TABLE public._migrations IS
  'Migration log. Sadece service_role yazar (admin SQL ile).';
COMMENT ON TABLE public.otp_codes IS
  'OTP kodları. Sadece service_role (lib/auth/otp.ts supabaseAdmin) yazar.';
COMMENT ON TABLE public.iys_log IS
  'İYS API çağrı logu. Sadece backend yazar.';

-- 4. _migrations kaydı
INSERT INTO public._migrations (name, applied_at)
VALUES ('New-22-Authenticated-CUD-Grants-Audit.sql', NOW())
ON CONFLICT (name) DO NOTHING;

-- 5. Audit doğrulama: salons + salon_services DELETE policy yasak (CLAUDE.md)
DO $$
DECLARE
  bad_count int;
BEGIN
  SELECT COUNT(*) INTO bad_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND cmd = 'DELETE'
    AND tablename IN ('salons', 'salon_services')
    AND policyname NOT LIKE 'admin_%';

  IF bad_count > 0 THEN
    RAISE WARNING 'New-22 UYARI: salons/salon_services için admin dışı DELETE policy bulundu (%)', bad_count;
  END IF;
END $$;

-- 6. Authenticated CUD GRANT eksik kalan tabloları listele (gelecekteki audit için)
DO $$
DECLARE
  missing_cnt int;
BEGIN
  SELECT COUNT(*) INTO missing_cnt
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND c.relkind='r' AND c.relrowsecurity
    AND c.relname IN ('profiles','appointments','reviews','salons','salon_resources',
                      'salon_services','salon_working_hours','staff','working_hours',
                      'slot_reservations')
    AND NOT has_table_privilege('authenticated', c.oid, 'UPDATE');

  IF missing_cnt > 0 THEN
    RAISE EXCEPTION 'New-22 FAILED: % kullanıcı tablosunda UPDATE GRANT hâlâ eksik', missing_cnt;
  END IF;

  RAISE NOTICE 'New-22 OK: 10 kullanıcı tablosu authenticated CUD GRANT tamam';
END $$;

NOTIFY pgrst, 'reload schema';
