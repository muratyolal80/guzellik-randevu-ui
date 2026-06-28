-- =============================================================================
-- New-25-Owner-Write-Policies.sql
-- Faz: RLS düzeltme
-- Amaç: salon_working_hours, salon_services, working_hours tablolarında
--       owner INSERT/UPDATE/DELETE policy'si yok → "new row violates RLS"
--       hatası. CLAUDE.md SELECT-only policy uyarısı geçerli.
-- =============================================================================
--
-- HATA: 'new row violates row-level security policy for table "salon_working_hours"'
-- Tespit: /owner/salons/[id]/edit > Standart Saatleri Yükle butonu
--
-- ROOT CAUSE: 3 tabloda authenticated INSERT/UPDATE/DELETE GRANT var ama
--             0 yazma policy'si → RLS otomatik red. GRANT ≠ policy.
-- =============================================================================

-- 1. salon_working_hours — owner kendi salonu için CRUD
DROP POLICY IF EXISTS "owner_manage_salon_working_hours" ON public.salon_working_hours;
CREATE POLICY "owner_manage_salon_working_hours" ON public.salon_working_hours
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.salons
            WHERE salons.id = salon_working_hours.salon_id
              AND salons.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.salons
            WHERE salons.id = salon_working_hours.salon_id
              AND salons.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "admin_manage_salon_working_hours" ON public.salon_working_hours;
CREATE POLICY "admin_manage_salon_working_hours" ON public.salon_working_hours
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
              AND role IN ('SUPER_ADMIN', 'ADMIN')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
              AND role IN ('SUPER_ADMIN', 'ADMIN')
        )
    );

DROP POLICY IF EXISTS "service_role_full_salon_working_hours" ON public.salon_working_hours;
CREATE POLICY "service_role_full_salon_working_hours" ON public.salon_working_hours
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2. salon_services — owner kendi salonu (CLAUDE.md: DELETE yasak, status update)
DROP POLICY IF EXISTS "owner_manage_salon_services" ON public.salon_services;
CREATE POLICY "owner_manage_salon_services" ON public.salon_services
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.salons
            WHERE salons.id = salon_services.salon_id
              AND salons.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "owner_update_salon_services" ON public.salon_services;
CREATE POLICY "owner_update_salon_services" ON public.salon_services
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.salons
            WHERE salons.id = salon_services.salon_id
              AND salons.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.salons
            WHERE salons.id = salon_services.salon_id
              AND salons.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "owner_select_salon_services" ON public.salon_services;
CREATE POLICY "owner_select_salon_services" ON public.salon_services
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.salons
            WHERE salons.id = salon_services.salon_id
              AND salons.owner_id = auth.uid()
        )
    );

-- Admin tam kontrol
DROP POLICY IF EXISTS "admin_manage_salon_services_all" ON public.salon_services;
CREATE POLICY "admin_manage_salon_services_all" ON public.salon_services
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
              AND role IN ('SUPER_ADMIN', 'ADMIN')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
              AND role IN ('SUPER_ADMIN', 'ADMIN')
        )
    );

DROP POLICY IF EXISTS "service_role_full_salon_services" ON public.salon_services;
CREATE POLICY "service_role_full_salon_services" ON public.salon_services
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3. working_hours (staff mesai) — staff kendisi VEYA salon owner
DROP POLICY IF EXISTS "staff_manage_own_hours" ON public.working_hours;
CREATE POLICY "staff_manage_own_hours" ON public.working_hours
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.staff
            WHERE staff.id = working_hours.staff_id
              AND staff.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.staff
            WHERE staff.id = working_hours.staff_id
              AND staff.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "owner_manage_staff_hours" ON public.working_hours;
CREATE POLICY "owner_manage_staff_hours" ON public.working_hours
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.staff s
            JOIN public.salons sa ON sa.id = s.salon_id
            WHERE s.id = working_hours.staff_id
              AND sa.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.staff s
            JOIN public.salons sa ON sa.id = s.salon_id
            WHERE s.id = working_hours.staff_id
              AND sa.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "admin_manage_working_hours" ON public.working_hours;
CREATE POLICY "admin_manage_working_hours" ON public.working_hours
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
              AND role IN ('SUPER_ADMIN', 'ADMIN')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
              AND role IN ('SUPER_ADMIN', 'ADMIN')
        )
    );

DROP POLICY IF EXISTS "service_role_full_wh" ON public.working_hours;
CREATE POLICY "service_role_full_wh" ON public.working_hours
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- _migrations kaydı
INSERT INTO public._migrations (name, applied_at)
VALUES ('New-25-Owner-Write-Policies.sql', NOW())
ON CONFLICT (name) DO NOTHING;

-- Doğrulama
DO $$
DECLARE
    swh_write int;
    ss_write int;
    wh_write int;
BEGIN
    SELECT COUNT(*) INTO swh_write FROM pg_policies
    WHERE schemaname='public' AND tablename='salon_working_hours' AND cmd IN ('INSERT','UPDATE','DELETE','ALL');

    SELECT COUNT(*) INTO ss_write FROM pg_policies
    WHERE schemaname='public' AND tablename='salon_services' AND cmd IN ('INSERT','UPDATE','DELETE','ALL');

    SELECT COUNT(*) INTO wh_write FROM pg_policies
    WHERE schemaname='public' AND tablename='working_hours' AND cmd IN ('INSERT','UPDATE','DELETE','ALL');

    IF swh_write < 1 OR ss_write < 1 OR wh_write < 1 THEN
        RAISE EXCEPTION 'New-25 FAILED: swh=%, ss=%, wh=%', swh_write, ss_write, wh_write;
    END IF;

    RAISE NOTICE 'New-25 OK: write policies — salon_working_hours=%, salon_services=%, working_hours=%',
        swh_write, ss_write, wh_write;
END $$;

NOTIFY pgrst, 'reload schema';
