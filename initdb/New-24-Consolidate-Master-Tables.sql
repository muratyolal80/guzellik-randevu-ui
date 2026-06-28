-- =============================================================================
-- New-24-Consolidate-Master-Tables.sql
-- Faz: Master schema konsolide
-- Amaç: Master-Database-Setup.sql'de eksik 5 tablonun (notifications,
--       notification_queue, audit_logs, support_tickets, ticket_messages)
--       idempotent CREATE + RLS + GRANT. Sıfırdan deploy'da crash önlenir.
-- =============================================================================
--
-- CLAUDE.md "kanonik şema" kuralı: Master-Database-Setup.sql tek doğru kaynak
-- olmalı. Şu an bu 5 tablo sadece eski archive/old veya New-XX'lerde tanımlı.
-- Bu migration onları idempotent şekilde EKLER (varsa dokunmaz) + RLS+GRANT.
-- =============================================================================

-- 1. notifications: in-app bildirim
CREATE TABLE IF NOT EXISTS public.notifications (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    salon_id    uuid REFERENCES public.salons(id) ON DELETE SET NULL,
    title       text NOT NULL,
    content     text NOT NULL,
    type        text NOT NULL,
    is_read     boolean DEFAULT false,
    link        text,
    created_at  timestamptz DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notif_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notif_created ON public.notifications(created_at DESC);

-- 2. notification_queue: dış gönderim (email/SMS/push)
CREATE TABLE IF NOT EXISTS public.notification_queue (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    salon_id      uuid REFERENCES public.salons(id) ON DELETE SET NULL,
    channel       text NOT NULL,
    recipient     text NOT NULL,
    subject       text,
    content       text NOT NULL,
    template      text,
    metadata      jsonb,
    status        text DEFAULT 'PENDING',
    scheduled_for timestamptz DEFAULT NOW(),
    processed_at  timestamptz,
    tries         integer DEFAULT 0,
    last_error    text,
    created_at    timestamptz DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_nq_status_sched ON public.notification_queue(status, scheduled_for);

-- 3. audit_logs: kullanıcı hareketleri
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id      uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    user_id       uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    action        text NOT NULL,
    resource_type text NOT NULL,
    resource_id   text,
    changes       jsonb,
    ip_address    text,
    user_agent    text,
    created_at    timestamptz DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_salon_id ON public.audit_logs(salon_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- audit_logs için platform-level kayıt UUID'i (salon_id zorunlu olduğundan)
-- 00000000-0000-0000-0000-000000000000 placeholder salon olarak kullanılır.

-- 4. support_tickets: destek talepleri
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    salon_id   uuid REFERENCES public.salons(id) ON DELETE CASCADE,
    subject    text NOT NULL,
    message    text NOT NULL,
    category   text,
    status     text DEFAULT 'OPEN',
    priority   text DEFAULT 'NORMAL',
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.support_tickets(status);

-- 5. ticket_messages: ticket cevapları
CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id   uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    sender_role text,
    content     text NOT NULL,
    created_at  timestamptz DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tmsg_ticket ON public.ticket_messages(ticket_id, created_at);

-- =============================================================================
-- 6. RLS Politikaları (idempotent)
-- =============================================================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- notifications: kullanıcı kendi bildirimleri
DROP POLICY IF EXISTS "users_own_notifications" ON public.notifications;
CREATE POLICY "users_own_notifications" ON public.notifications
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "service_role_full_notifications" ON public.notifications;
CREATE POLICY "service_role_full_notifications" ON public.notifications
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- notification_queue: SADECE service_role (backend cron yazar/okur)
DROP POLICY IF EXISTS "service_role_full_nq" ON public.notification_queue;
CREATE POLICY "service_role_full_nq" ON public.notification_queue
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- audit_logs: kullanıcı kendi user_id'sinde INSERT (kendi hareketini logla)
DROP POLICY IF EXISTS "users_insert_own_audit" ON public.audit_logs;
CREATE POLICY "users_insert_own_audit" ON public.audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "owners_see_own_audit_logs" ON public.audit_logs;
CREATE POLICY "owners_see_own_audit_logs" ON public.audit_logs
    FOR SELECT TO authenticated
    USING (
        salon_id IN (
            SELECT id FROM public.salons WHERE owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "admin_read_all_audit" ON public.audit_logs;
CREATE POLICY "admin_read_all_audit" ON public.audit_logs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
              AND role IN ('SUPER_ADMIN', 'ADMIN')
        )
    );

DROP POLICY IF EXISTS "service_role_full_audit" ON public.audit_logs;
CREATE POLICY "service_role_full_audit" ON public.audit_logs
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- support_tickets: kullanıcı kendi
DROP POLICY IF EXISTS "users_own_tickets" ON public.support_tickets;
CREATE POLICY "users_own_tickets" ON public.support_tickets
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "admin_all_tickets" ON public.support_tickets;
CREATE POLICY "admin_all_tickets" ON public.support_tickets
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
              AND role IN ('SUPER_ADMIN', 'ADMIN')
        )
    );

DROP POLICY IF EXISTS "service_role_full_tickets" ON public.support_tickets;
CREATE POLICY "service_role_full_tickets" ON public.support_tickets
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ticket_messages: ticket'in sahibi veya admin
DROP POLICY IF EXISTS "users_own_ticket_messages" ON public.ticket_messages;
CREATE POLICY "users_own_ticket_messages" ON public.ticket_messages
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.support_tickets t
            WHERE t.id = ticket_messages.ticket_id
              AND (t.user_id = auth.uid()
                   OR EXISTS (
                       SELECT 1 FROM public.profiles
                       WHERE id = auth.uid()
                         AND role IN ('SUPER_ADMIN', 'ADMIN')
                   ))
        )
    )
    WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "service_role_full_tmsg" ON public.ticket_messages;
CREATE POLICY "service_role_full_tmsg" ON public.ticket_messages
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================================================
-- 7. GRANT'lar (CLAUDE.md RLS+GRANT ikilisi)
-- =============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

GRANT SELECT ON public.notification_queue TO authenticated; -- görüntüleme (admin için)
GRANT ALL ON public.notification_queue TO service_role;

GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;

GRANT SELECT, INSERT ON public.ticket_messages TO authenticated;
GRANT ALL ON public.ticket_messages TO service_role;

-- =============================================================================
-- 8. _migrations kaydı
-- =============================================================================

INSERT INTO public._migrations (name, applied_at)
VALUES ('New-24-Consolidate-Master-Tables.sql', NOW())
ON CONFLICT (name) DO NOTHING;

DO $$
DECLARE
    tbl_count int;
BEGIN
    SELECT COUNT(*) INTO tbl_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('notifications', 'notification_queue', 'audit_logs',
                         'support_tickets', 'ticket_messages');

    IF tbl_count < 5 THEN
        RAISE EXCEPTION 'New-24 FAILED: % / 5 tablo bulundu', tbl_count;
    END IF;

    RAISE NOTICE 'New-24 OK: 5 destek/bildirim/audit tablosu konsolide edildi';
END $$;

NOTIFY pgrst, 'reload schema';
