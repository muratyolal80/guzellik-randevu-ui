-- =============================================================================
-- New-06-Final-Sync.sql
-- Son eksiklikler: SMS/IYS tabloları, RLS hassas tablolarda, eksik policy'ler, seed
-- Idempotent — IF NOT EXISTS, ON CONFLICT DO NOTHING.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. NOTIFICATION_QUEUE — Cron tabanlı SMS/Email kuyruğu
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_queue (
    id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    salon_id      uuid REFERENCES public.salons(id) ON DELETE SET NULL,
    channel       text NOT NULL CHECK (channel IN ('SMS','EMAIL','PUSH')),
    recipient     text NOT NULL,
    subject       text,
    content       text NOT NULL,
    template      text,
    metadata      jsonb DEFAULT '{}'::jsonb,
    status        text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PROCESSING','SENT','FAILED')),
    scheduled_for timestamptz NOT NULL DEFAULT now(),
    processed_at  timestamptz,
    tries         integer DEFAULT 0,
    last_error    text,
    created_at    timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notif_queue_status_sched ON public.notification_queue(status, scheduled_for);

ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_manage_notif_queue" ON public.notification_queue;
CREATE POLICY "admin_manage_notif_queue" ON public.notification_queue FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN','ADMIN'))
);

-- -----------------------------------------------------------------------------
-- 2. SMS_VERIFICATIONS — Telefon doğrulama logu (İYS uyumluluk)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sms_verifications (
    id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    phone               text NOT NULL,
    verified_at         timestamptz NOT NULL DEFAULT now(),
    iys_registered      boolean DEFAULT false,
    iys_registered_at   timestamptz,
    consent_given       boolean DEFAULT false,
    created_at          timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sms_verif_user ON public.sms_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_verif_phone ON public.sms_verifications(phone);

ALTER TABLE public.sms_verifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_see_own_sms_verifications" ON public.sms_verifications;
CREATE POLICY "users_see_own_sms_verifications" ON public.sms_verifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "admin_manage_sms_verifications" ON public.sms_verifications;
CREATE POLICY "admin_manage_sms_verifications" ON public.sms_verifications FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN','ADMIN'))
);

-- -----------------------------------------------------------------------------
-- 3. IYS_LOGS — SMS gönderim logu
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.iys_logs (
    id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    phone        text NOT NULL,
    message_type text NOT NULL CHECK (message_type IN ('OTP','INFO','CAMPAIGN')),
    content      text NOT NULL,
    status       text NOT NULL CHECK (status IN ('SENT','FAILED','DEMO')),
    created_at   timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_iys_logs_phone   ON public.iys_logs(phone);
CREATE INDEX IF NOT EXISTS idx_iys_logs_created ON public.iys_logs(created_at DESC);

ALTER TABLE public.iys_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_see_iys_logs" ON public.iys_logs;
CREATE POLICY "admin_see_iys_logs" ON public.iys_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN','ADMIN'))
);

-- -----------------------------------------------------------------------------
-- 4. RLS — HASSAS TABLOLAR
-- -----------------------------------------------------------------------------

-- payment_history
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owner_see_own_payments" ON public.payment_history;
CREATE POLICY "owner_see_own_payments" ON public.payment_history FOR SELECT USING (
    salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
);
DROP POLICY IF EXISTS "admin_manage_payments" ON public.payment_history;
CREATE POLICY "admin_manage_payments" ON public.payment_history FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN','ADMIN'))
);

-- subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owner_see_own_subscription" ON public.subscriptions;
CREATE POLICY "owner_see_own_subscription" ON public.subscriptions FOR SELECT USING (
    salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
);
DROP POLICY IF EXISTS "admin_manage_subscriptions" ON public.subscriptions;
CREATE POLICY "admin_manage_subscriptions" ON public.subscriptions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN','ADMIN'))
);

-- subscription_plans (public read OK, sadece admin write)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_subscription_plans" ON public.subscription_plans;
CREATE POLICY "public_read_subscription_plans" ON public.subscription_plans FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "admin_manage_subscription_plans" ON public.subscription_plans;
CREATE POLICY "admin_manage_subscription_plans" ON public.subscription_plans FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN','ADMIN'))
);

-- salon_customers
ALTER TABLE public.salon_customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owner_manage_salon_customers" ON public.salon_customers;
CREATE POLICY "owner_manage_salon_customers" ON public.salon_customers FOR ALL USING (
    salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
);
DROP POLICY IF EXISTS "admin_see_salon_customers" ON public.salon_customers;
CREATE POLICY "admin_see_salon_customers" ON public.salon_customers FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN','ADMIN'))
);

-- customer_notes
ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owner_manage_customer_notes" ON public.customer_notes;
CREATE POLICY "owner_manage_customer_notes" ON public.customer_notes FOR ALL USING (
    salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
);
DROP POLICY IF EXISTS "admin_manage_customer_notes" ON public.customer_notes;
CREATE POLICY "admin_manage_customer_notes" ON public.customer_notes FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN','ADMIN'))
);

-- -----------------------------------------------------------------------------
-- 5. EKSİK POLICY'LER
-- -----------------------------------------------------------------------------

-- audit_logs: INSERT policy (kod insert yapabilsin)
DROP POLICY IF EXISTS "system_insert_audit_logs" ON public.audit_logs;
CREATE POLICY "system_insert_audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- staff: owner CRUD policy'si (Owner'ın UI'dan personel yönetebilmesi için)
DROP POLICY IF EXISTS "owner_manage_staff" ON public.staff;
CREATE POLICY "owner_manage_staff" ON public.staff FOR ALL USING (
    salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
);
DROP POLICY IF EXISTS "admin_manage_staff" ON public.staff;
CREATE POLICY "admin_manage_staff" ON public.staff FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN','ADMIN'))
);

-- -----------------------------------------------------------------------------
-- 6. PLATFORM_SETTINGS SEED — Banka havale bilgisi (Iyzico fallback)
-- -----------------------------------------------------------------------------
INSERT INTO public.platform_settings (key, value)
VALUES (
    'bank_accounts',
    '[{"bank":"Ziraat Bankası","owner":"Güzellik Randevu Platformu","iban":"TR00 0000 0000 0000 0000 0000 00","description":"Lütfen ödeme açıklamasında SalonID belirtiniz."}]'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 7. GRANT'lar
-- -----------------------------------------------------------------------------
GRANT SELECT ON public.subscription_plans, public.platform_settings TO anon, authenticated;
GRANT SELECT ON public.payment_history, public.subscriptions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.notification_queue, public.sms_verifications,
                                public.iys_logs, public.payment_history,
                                public.subscriptions, public.salon_customers,
                                public.customer_notes, public.audit_logs
        TO authenticated;

-- -----------------------------------------------------------------------------
-- 8. RAPORU YAZDIR
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    rls_off int; total_policies int; missing_tables int;
BEGIN
    SELECT COUNT(*) INTO rls_off FROM pg_tables
    WHERE schemaname='public' AND rowsecurity=false
      AND tablename NOT IN ('spatial_ref_sys','cities','districts','salon_types','service_categories','global_services');
    SELECT COUNT(*) INTO total_policies FROM pg_policies WHERE schemaname='public';
    SELECT COUNT(*) INTO missing_tables FROM (VALUES ('notification_queue'),('sms_verifications'),('iys_logs')) v(t)
        WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=v.t);

    RAISE NOTICE '═══════════ FINAL SYNC RAPORU ═══════════';
    RAISE NOTICE 'Eksik tablo (notification_queue/sms_verifications/iys_logs): %', missing_tables;
    RAISE NOTICE 'RLS kapalı hassas tablo: %', rls_off;
    RAISE NOTICE 'Toplam policy: %', total_policies;
    RAISE NOTICE '═════════════════════════════════════════';
END $$;

NOTIFY pgrst, 'reload schema';
