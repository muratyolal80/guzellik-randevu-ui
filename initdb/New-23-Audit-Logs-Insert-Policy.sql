-- =============================================================================
-- New-23-Audit-Logs-Insert-Policy.sql
-- Faz: Bugfix
-- Amaç: audit_logs INSERT policy yoktu → AuditService.log boş {} hatası
-- =============================================================================
--
-- Hata: '[AuditService] Failed to log audit: {}' (CancelRescheduleButtons.tsx)
-- Tespit:
--   - audit_logs tablosu var, RLS açık
--   - SELECT policy var (owners_see_own_audit_logs)
--   - INSERT policy YOK → authenticated her INSERT denenince RLS reddediyor
--   - log_audit() RPC fonksiyonu da yok (AuditService onu çağırıyor)
-- =============================================================================

-- 1. authenticated kullanıcılar KENDİ user_id'lerinde audit log atabilir
DROP POLICY IF EXISTS "users_insert_own_audit" ON public.audit_logs;
CREATE POLICY "users_insert_own_audit" ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

COMMENT ON POLICY "users_insert_own_audit" ON public.audit_logs IS
  'Kullanıcı sadece kendi user_id''si ile audit log atabilir. Owner/admin SELECT yetkisiyle gözlemler.';

-- 2. service_role her şeyi yapabilir (CLAUDE.md kuralı)
DROP POLICY IF EXISTS "service_role_full_audit" ON public.audit_logs;
CREATE POLICY "service_role_full_audit" ON public.audit_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. admin/super_admin tüm audit'leri okur (mevcut owners_see policy'sini tamamlayan)
DROP POLICY IF EXISTS "admin_read_all_audit" ON public.audit_logs;
CREATE POLICY "admin_read_all_audit" ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- 4. GRANT'lar zaten New-22 ile verildi (audit_logs INSERT/UPDATE GRANT'ı authenticated için var)
-- Idempotent restate:
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

-- 5. Migration log
INSERT INTO public._migrations (name, applied_at)
VALUES ('New-23-Audit-Logs-Insert-Policy.sql', NOW())
ON CONFLICT (name) DO NOTHING;

-- 6. Doğrulama
DO $$
DECLARE
  has_insert_policy boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'audit_logs'
      AND cmd = 'INSERT'
  ) INTO has_insert_policy;

  IF NOT has_insert_policy THEN
    RAISE EXCEPTION 'New-23 FAILED: audit_logs INSERT policy yok';
  END IF;

  RAISE NOTICE 'New-23 OK: audit_logs INSERT policy aktif (own user_id check + service_role bypass + admin read)';
END $$;

NOTIFY pgrst, 'reload schema';
