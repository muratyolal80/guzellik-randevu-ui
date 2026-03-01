-- ============================================================
-- New-12-Support-And-StaffReviews.sql
-- Destek Ticket Sistemi + Çalışan Yorumları
-- ============================================================

-- ─────────────────────────────────────
-- 1. SUPPORT TICKETS
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    salon_id    uuid REFERENCES public.salons(id) ON DELETE SET NULL,
    subject     text NOT NULL,
    message     text NOT NULL,
    category    text NOT NULL DEFAULT 'OTHER'
                    CHECK (category IN ('PAYMENT','BOOKING','ACCOUNT','SALON','OTHER','GENEL')),
    status      text NOT NULL DEFAULT 'OPEN'
                    CHECK (status IN ('OPEN','IN_PROGRESS','RESOLVED','CLOSED')),
    priority    text NOT NULL DEFAULT 'NORMAL'
                    CHECK (priority IN ('LOW','NORMAL','HIGH','URGENT')),
    created_at  timestamptz DEFAULT now(),
    updated_at  timestamptz DEFAULT now()
);

-- ─────────────────────────────────────
-- 2. TICKET MESSAGES (Thread/Cevaplar)
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id   uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_role text NOT NULL DEFAULT 'CUSTOMER',
    content     text NOT NULL,
    created_at  timestamptz DEFAULT now()
);

-- ─────────────────────────────────────
-- 3. STAFF REVIEWS (Çalışan Yorumları)
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.staff_reviews (
    id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id       uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    salon_id       uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    user_id        uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
    user_name      text NOT NULL,
    user_avatar    text,
    rating         integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment        text,
    is_verified    boolean DEFAULT false,
    created_at     timestamptz DEFAULT now()
);

-- ─────────────────────────────────────
-- 4. STAFF tablosuna rating sütunları
-- ─────────────────────────────────────
ALTER TABLE public.staff
    ADD COLUMN IF NOT EXISTS rating       double precision DEFAULT 0,
    ADD COLUMN IF NOT EXISTS review_count integer          DEFAULT 0;

-- ─────────────────────────────────────
-- 5. UPDATED_AT TRİGGERI — support_tickets
-- ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_support_ticket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER trg_support_tickets_updated_at
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW EXECUTE FUNCTION public.update_support_ticket_updated_at();

-- ─────────────────────────────────────
-- 6. STAFF RATING OTOMATİK GÜNCELLEME
-- ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_staff_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.staff
    SET
        rating       = (SELECT COALESCE(AVG(rating), 0) FROM public.staff_reviews WHERE staff_id = COALESCE(NEW.staff_id, OLD.staff_id)),
        review_count = (SELECT COUNT(*) FROM public.staff_reviews WHERE staff_id = COALESCE(NEW.staff_id, OLD.staff_id))
    WHERE id = COALESCE(NEW.staff_id, OLD.staff_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_staff_rating_update ON public.staff_reviews;
CREATE TRIGGER trg_staff_rating_update
    AFTER INSERT OR UPDATE OR DELETE ON public.staff_reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_staff_rating();

-- ─────────────────────────────────────
-- 7. RLS POLİTİKALARI
-- ─────────────────────────────────────

-- SUPPORT_TICKETS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_see_own_tickets" ON public.support_tickets;
CREATE POLICY "users_see_own_tickets" ON public.support_tickets
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_create_own_tickets" ON public.support_tickets;
CREATE POLICY "users_create_own_tickets" ON public.support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_see_all_tickets" ON public.support_tickets;
CREATE POLICY "admin_see_all_tickets" ON public.support_tickets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
        )
    );

DROP POLICY IF EXISTS "admin_update_tickets" ON public.support_tickets;
CREATE POLICY "admin_update_tickets" ON public.support_tickets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
        )
    );

-- TICKET_MESSAGES
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ticket_owner_or_admin_see_messages" ON public.ticket_messages;
CREATE POLICY "ticket_owner_or_admin_see_messages" ON public.ticket_messages
    FOR SELECT USING (
        auth.uid() = sender_id
        OR EXISTS (
            SELECT 1 FROM public.support_tickets st
            WHERE st.id = ticket_id AND st.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
        )
    );

DROP POLICY IF EXISTS "auth_users_send_messages" ON public.ticket_messages;
CREATE POLICY "auth_users_send_messages" ON public.ticket_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- STAFF_REVIEWS
ALTER TABLE public.staff_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_reviews_public_read" ON public.staff_reviews;
CREATE POLICY "staff_reviews_public_read" ON public.staff_reviews
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "auth_users_create_staff_review" ON public.staff_reviews;
CREATE POLICY "auth_users_create_staff_review" ON public.staff_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_delete_own_staff_review" ON public.staff_reviews;
CREATE POLICY "users_delete_own_staff_review" ON public.staff_reviews
    FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_manage_staff_reviews" ON public.staff_reviews;
CREATE POLICY "admin_manage_staff_reviews" ON public.staff_reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
        )
    );

-- ─────────────────────────────────────
-- 8. İNDEKSLER
-- ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id   ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status    ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_staff_reviews_staff_id    ON public.staff_reviews(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_reviews_user_id     ON public.staff_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_reviews_appointment ON public.staff_reviews(appointment_id);
