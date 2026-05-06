-- =============================================================================
-- New-04-Sync-Missing-Tables.sql
-- Tek seferde uygulanır. Idempotent (CREATE TABLE IF NOT EXISTS / ON CONFLICT).
-- Master-Database-Setup.sql + New-01..New-03 sonrası eksik kalan tablo + seed.
-- Tüm FK'ler UUID tipinde (live DB ile uyumlu).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. EXTRA ENUMS
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discount_type') THEN
        CREATE TYPE public.discount_type AS ENUM ('PERCENTAGE', 'FIXED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
        CREATE TYPE public.payment_method AS ENUM ('CASH','CREDIT_CARD','BANK_TRANSFER','WALLET','OTHER','IYZICO');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE public.payment_status AS ENUM ('PENDING','COMPLETED','REFUNDED','FAILED','SUCCESS');
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 1. PROFILES — KVKK / Soft-Delete kolonları
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS is_active           boolean DEFAULT true,
    ADD COLUMN IF NOT EXISTS deleted_at          timestamptz,
    ADD COLUMN IF NOT EXISTS kvkk_accepted_at    timestamptz,
    ADD COLUMN IF NOT EXISTS marketing_opt_in    boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS language_preference text DEFAULT 'tr',
    ADD COLUMN IF NOT EXISTS default_city_id     uuid REFERENCES public.cities(id);

-- -----------------------------------------------------------------------------
-- 2. SALONS — Branding kolonları
-- -----------------------------------------------------------------------------
ALTER TABLE public.salons
    ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#C59F59',
    ADD COLUMN IF NOT EXISTS logo_url      text,
    ADD COLUMN IF NOT EXISTS banner_url    text;

-- -----------------------------------------------------------------------------
-- 3. NOTIFICATIONS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    salon_id   uuid REFERENCES public.salons(id) ON DELETE CASCADE,
    title      text NOT NULL,
    content    text NOT NULL,
    type       text NOT NULL CHECK (type IN ('INFO','SUCCESS','WARNING','ERROR','APPOINTMENT','REVIEW','SYSTEM','REMINDER','PROMOTION','BOOKING')),
    is_read    boolean DEFAULT false,
    link       text,
    created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_view_own_notifications" ON public.notifications;
CREATE POLICY "users_view_own_notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "users_update_own_notifications" ON public.notifications;
CREATE POLICY "users_update_own_notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "system_insert_notifications" ON public.notifications;
CREATE POLICY "system_insert_notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 4. SALON_GALLERY (zaten New-03'te var ise IF NOT EXISTS atlar)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.salon_gallery (
    id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id      uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    image_url     text NOT NULL,
    display_order integer DEFAULT 0,
    is_cover      boolean DEFAULT false,
    caption       text,
    created_at    timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_salon_gallery_salon_id ON public.salon_gallery(salon_id);
ALTER TABLE public.salon_gallery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_gallery" ON public.salon_gallery;
CREATE POLICY "public_read_gallery" ON public.salon_gallery FOR SELECT USING (true);
DROP POLICY IF EXISTS "owner_manage_gallery" ON public.salon_gallery;
CREATE POLICY "owner_manage_gallery" ON public.salon_gallery FOR ALL USING (
    EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid())
);

-- -----------------------------------------------------------------------------
-- 5. REVIEW_IMAGES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.review_images (
    id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id  uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    image_url  text NOT NULL,
    created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_review_images_review_id ON public.review_images(review_id);
ALTER TABLE public.review_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_review_images" ON public.review_images;
CREATE POLICY "public_read_review_images" ON public.review_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "users_manage_own_review_images" ON public.review_images;
CREATE POLICY "users_manage_own_review_images" ON public.review_images FOR ALL USING (
    EXISTS (SELECT 1 FROM public.reviews WHERE id = review_id AND user_id = auth.uid())
);

-- -----------------------------------------------------------------------------
-- 6. AUDIT_LOGS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id      uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    user_id       uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    action        text NOT NULL,
    resource_type text NOT NULL,
    resource_id   text,
    changes       jsonb,
    ip_address    text,
    user_agent    text,
    created_at    timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_salon_id   ON public.audit_logs(salon_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_see_all_audit_logs" ON public.audit_logs;
CREATE POLICY "admin_see_all_audit_logs" ON public.audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN','ADMIN'))
);
DROP POLICY IF EXISTS "owners_see_own_audit_logs" ON public.audit_logs;
CREATE POLICY "owners_see_own_audit_logs" ON public.audit_logs FOR SELECT USING (
    salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
);

-- -----------------------------------------------------------------------------
-- 7. USER_SESSIONS (KVKK)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    ip_address     text,
    user_agent     text,
    device_name    text,
    last_active_at timestamptz DEFAULT now(),
    is_revoked     boolean DEFAULT false,
    created_at     timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_view_own_sessions" ON public.user_sessions;
CREATE POLICY "users_view_own_sessions" ON public.user_sessions FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "users_revoke_own_sessions" ON public.user_sessions;
CREATE POLICY "users_revoke_own_sessions" ON public.user_sessions FOR DELETE USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 8. SUPPORT_TICKETS + TICKET_MESSAGES + STAFF_REVIEWS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    salon_id   uuid REFERENCES public.salons(id) ON DELETE SET NULL,
    subject    text NOT NULL,
    message    text NOT NULL,
    category   text NOT NULL DEFAULT 'OTHER' CHECK (category IN ('PAYMENT','BOOKING','ACCOUNT','SALON','OTHER','GENEL')),
    status     text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','IN_PROGRESS','RESOLVED','CLOSED')),
    priority   text NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW','NORMAL','HIGH','URGENT')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status  ON public.support_tickets(status);

CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id   uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_role text NOT NULL DEFAULT 'CUSTOMER',
    content     text NOT NULL,
    created_at  timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);

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
CREATE INDEX IF NOT EXISTS idx_staff_reviews_staff_id ON public.staff_reviews(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_reviews_user_id  ON public.staff_reviews(user_id);

ALTER TABLE public.staff
    ADD COLUMN IF NOT EXISTS rating       double precision DEFAULT 0,
    ADD COLUMN IF NOT EXISTS review_count integer          DEFAULT 0;

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_see_own_tickets" ON public.support_tickets;
CREATE POLICY "users_see_own_tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "users_create_own_tickets" ON public.support_tickets;
CREATE POLICY "users_create_own_tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "admin_manage_tickets" ON public.support_tickets;
CREATE POLICY "admin_manage_tickets" ON public.support_tickets FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN','ADMIN'))
);

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ticket_owner_or_admin_see_messages" ON public.ticket_messages;
CREATE POLICY "ticket_owner_or_admin_see_messages" ON public.ticket_messages FOR SELECT USING (
    auth.uid() = sender_id
    OR EXISTS (SELECT 1 FROM public.support_tickets st WHERE st.id = ticket_id AND st.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN','ADMIN'))
);
DROP POLICY IF EXISTS "auth_users_send_messages" ON public.ticket_messages;
CREATE POLICY "auth_users_send_messages" ON public.ticket_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

ALTER TABLE public.staff_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "staff_reviews_public_read" ON public.staff_reviews;
CREATE POLICY "staff_reviews_public_read" ON public.staff_reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "auth_users_create_staff_review" ON public.staff_reviews;
CREATE POLICY "auth_users_create_staff_review" ON public.staff_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "users_delete_own_staff_review" ON public.staff_reviews;
CREATE POLICY "users_delete_own_staff_review" ON public.staff_reviews FOR DELETE USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 9. FINANS — coupons, packages, package_services, transactions, appointment_coupons
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coupons (
    id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id            uuid REFERENCES public.salons(id) ON DELETE CASCADE,
    code                text NOT NULL,
    description         text,
    discount_type       public.discount_type NOT NULL,
    discount_value      numeric(10,2) NOT NULL,
    min_purchase_amount numeric(10,2) DEFAULT 0,
    max_discount_amount numeric(10,2),
    expires_at          timestamptz,
    usage_limit         integer DEFAULT 1,
    used_count          integer DEFAULT 0,
    is_active           boolean DEFAULT true,
    created_at          timestamptz DEFAULT now(),
    UNIQUE(salon_id, code)
);

CREATE TABLE IF NOT EXISTS public.packages (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id    uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    name        text NOT NULL,
    description text,
    price       numeric(10,2) NOT NULL,
    is_active   boolean DEFAULT true,
    expires_at  timestamptz,
    created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.package_services (
    id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    package_id       uuid NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
    salon_service_id uuid NOT NULL REFERENCES public.salon_services(id) ON DELETE CASCADE,
    quantity         integer DEFAULT 1,
    created_at       timestamptz DEFAULT now(),
    UNIQUE(package_id, salon_service_id)
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id                      uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id                uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    customer_id             uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    appointment_id          uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
    amount                  numeric(10,2) NOT NULL,
    currency                text DEFAULT 'TRY',
    payment_method          public.payment_method DEFAULT 'CASH',
    payment_status          public.payment_status DEFAULT 'PENDING',
    provider_transaction_id text,
    commission_amount       numeric(10,2) DEFAULT 0,
    notes                   text,
    metadata                jsonb DEFAULT '{}'::jsonb,
    created_at              timestamptz DEFAULT now(),
    updated_at              timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.appointment_coupons (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    appointment_id  uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    coupon_id       uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    discount_amount numeric(10,2) NOT NULL,
    created_at      timestamptz DEFAULT now(),
    UNIQUE(appointment_id, coupon_id)
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_transactions_updated_at ON public.transactions;
CREATE TRIGGER set_transactions_updated_at BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "coupons_public_active_read" ON public.coupons;
CREATE POLICY "coupons_public_active_read" ON public.coupons FOR SELECT USING (
    is_active = true AND (expires_at IS NULL OR expires_at > now())
);
DROP POLICY IF EXISTS "owner_manage_coupons" ON public.coupons;
CREATE POLICY "owner_manage_coupons" ON public.coupons FOR ALL USING (
    salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
);

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "packages_public_active_read" ON public.packages;
CREATE POLICY "packages_public_active_read" ON public.packages FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "owner_manage_packages" ON public.packages;
CREATE POLICY "owner_manage_packages" ON public.packages FOR ALL USING (
    salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
);

ALTER TABLE public.package_services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owner_manage_package_services" ON public.package_services;
CREATE POLICY "owner_manage_package_services" ON public.package_services FOR ALL USING (
    package_id IN (SELECT p.id FROM public.packages p JOIN public.salons s ON s.id = p.salon_id WHERE s.owner_id = auth.uid())
);
DROP POLICY IF EXISTS "package_services_public_read" ON public.package_services;
CREATE POLICY "package_services_public_read" ON public.package_services FOR SELECT USING (true);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "customers_see_own_transactions" ON public.transactions;
CREATE POLICY "customers_see_own_transactions" ON public.transactions FOR SELECT USING (customer_id = auth.uid());
DROP POLICY IF EXISTS "owners_see_salon_transactions" ON public.transactions;
CREATE POLICY "owners_see_salon_transactions" ON public.transactions FOR SELECT USING (
    salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
);

ALTER TABLE public.appointment_coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "appt_coupons_owner_read" ON public.appointment_coupons;
CREATE POLICY "appt_coupons_owner_read" ON public.appointment_coupons FOR SELECT USING (
    appointment_id IN (
        SELECT a.id FROM public.appointments a JOIN public.salons s ON s.id = a.salon_id
        WHERE s.owner_id = auth.uid() OR a.customer_id = auth.uid()
    )
);

-- -----------------------------------------------------------------------------
-- 10. STAFF_BRANCHES (Çoklu şube)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff_branches (
    id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id   uuid NOT NULL REFERENCES public.staff(id)  ON DELETE CASCADE,
    salon_id   uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    is_primary boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    UNIQUE(staff_id, salon_id)
);

-- Mevcut staff kayıtlarını kendi salonlarına ata
INSERT INTO public.staff_branches (staff_id, salon_id, is_primary)
SELECT id, salon_id, true FROM public.staff WHERE salon_id IS NOT NULL
ON CONFLICT (staff_id, salon_id) DO NOTHING;

ALTER TABLE public.staff_branches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "staff_branches_public_read" ON public.staff_branches;
CREATE POLICY "staff_branches_public_read" ON public.staff_branches FOR SELECT USING (true);
DROP POLICY IF EXISTS "owner_manage_staff_branches" ON public.staff_branches;
CREATE POLICY "owner_manage_staff_branches" ON public.staff_branches FOR ALL USING (
    salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
);

-- -----------------------------------------------------------------------------
-- 11. SALON_ASSIGNED_TYPES, SALON_TYPE_CATEGORIES, SALON_MEMBERSHIPS, FAVORITES, STAFF_SERVICES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.salon_assigned_types (
    id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id   uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    type_id    uuid NOT NULL REFERENCES public.salon_types(id) ON DELETE CASCADE,
    is_primary boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    UNIQUE(salon_id, type_id)
);
CREATE INDEX IF NOT EXISTS idx_salon_assigned_types_salon ON public.salon_assigned_types(salon_id);

CREATE TABLE IF NOT EXISTS public.salon_type_categories (
    id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_type_id       uuid NOT NULL REFERENCES public.salon_types(id) ON DELETE CASCADE,
    service_category_id uuid NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
    created_at          timestamptz DEFAULT now(),
    UNIQUE(salon_type_id, service_category_id)
);

CREATE TABLE IF NOT EXISTS public.salon_memberships (
    id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id   uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role       text DEFAULT 'STAFF',
    is_active  boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    UNIQUE(salon_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.favorites (
    id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    salon_id   uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, salon_id)
);

CREATE TABLE IF NOT EXISTS public.staff_services (
    id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id         uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    salon_id         uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    salon_service_id uuid NOT NULL REFERENCES public.salon_services(id) ON DELETE CASCADE,
    created_at       timestamptz DEFAULT now(),
    UNIQUE(staff_id, salon_service_id)
);

ALTER TABLE public.salon_assigned_types  ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_salon_assigned_types"  ON public.salon_assigned_types;
CREATE POLICY "public_read_salon_assigned_types" ON public.salon_assigned_types FOR SELECT USING (true);
DROP POLICY IF EXISTS "owner_manage_salon_assigned_types" ON public.salon_assigned_types;
CREATE POLICY "owner_manage_salon_assigned_types" ON public.salon_assigned_types FOR ALL USING (
    salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
);

ALTER TABLE public.salon_type_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_salon_type_categories" ON public.salon_type_categories;
CREATE POLICY "public_read_salon_type_categories" ON public.salon_type_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "admin_manage_salon_type_categories" ON public.salon_type_categories;
CREATE POLICY "admin_manage_salon_type_categories" ON public.salon_type_categories FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN','ADMIN'))
);

ALTER TABLE public.salon_memberships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_salon_memberships" ON public.salon_memberships;
CREATE POLICY "public_read_salon_memberships" ON public.salon_memberships FOR SELECT USING (true);
DROP POLICY IF EXISTS "owner_manage_salon_memberships" ON public.salon_memberships;
CREATE POLICY "owner_manage_salon_memberships" ON public.salon_memberships FOR ALL USING (
    salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_manage_own_favorites" ON public.favorites;
CREATE POLICY "users_manage_own_favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "public_read_favorites" ON public.favorites;
CREATE POLICY "public_read_favorites" ON public.favorites FOR SELECT USING (true);

ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_staff_services" ON public.staff_services;
CREATE POLICY "public_read_staff_services" ON public.staff_services FOR SELECT USING (true);
DROP POLICY IF EXISTS "owner_manage_staff_services" ON public.staff_services;
CREATE POLICY "owner_manage_staff_services" ON public.staff_services FOR ALL USING (
    salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
);

-- -----------------------------------------------------------------------------
-- 12. SALON_SUB_MERCHANTS, PLATFORM_SETTINGS, IYZICO_WEBHOOKS, INVITES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.salon_sub_merchants (
    id                       uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id                 uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE UNIQUE,
    iyzico_sub_merchant_key  text,
    iban                     text NOT NULL,
    bank_name                text,
    account_owner            text,
    sub_merchant_type        text DEFAULT 'PERSONAL' CHECK (sub_merchant_type IN ('PERSONAL','PRIVATE_COMPANY','LIMITED_OR_JOINT_STOCK')),
    status                   text DEFAULT 'PENDING'  CHECK (status            IN ('PENDING','ACTIVE','REJECTED')),
    created_at               timestamptz DEFAULT now(),
    updated_at               timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.platform_settings (
    key        text PRIMARY KEY,
    value      jsonb NOT NULL,
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.iyzico_webhooks (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    iyzi_event_type text,
    payload         jsonb NOT NULL,
    status          text DEFAULT 'RECEIVED',
    error_message   text,
    processed_at    timestamptz,
    created_at      timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_iyzico_webhooks_created_at ON public.iyzico_webhooks(created_at DESC);

CREATE TABLE IF NOT EXISTS public.invites (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id    uuid REFERENCES public.salons(id) ON DELETE CASCADE,
    email       varchar(255) NOT NULL,
    role        varchar(50)  NOT NULL DEFAULT 'STAFF',
    token       varchar(255) NOT NULL UNIQUE,
    status      varchar(50)  NOT NULL DEFAULT 'PENDING',
    inviter_id  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    expires_at  timestamptz NOT NULL,
    created_at  timestamptz DEFAULT timezone('utc', now()) NOT NULL,
    accepted_at timestamptz,
    CONSTRAINT valid_invite_status CHECK (status IN ('PENDING','ACCEPTED','EXPIRED','CANCELLED')),
    CONSTRAINT valid_invite_role   CHECK (role   IN ('STAFF','MANAGER','SALON_OWNER'))
);
CREATE INDEX IF NOT EXISTS idx_invites_email    ON public.invites(email);
CREATE INDEX IF NOT EXISTS idx_invites_salon_id ON public.invites(salon_id);

ALTER TABLE public.salon_sub_merchants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owner_manage_sub_merchant" ON public.salon_sub_merchants;
CREATE POLICY "owner_manage_sub_merchant" ON public.salon_sub_merchants FOR ALL USING (
    salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
);
DROP POLICY IF EXISTS "admin_see_sub_merchants" ON public.salon_sub_merchants;
CREATE POLICY "admin_see_sub_merchants" ON public.salon_sub_merchants FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN','ADMIN'))
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_platform_settings" ON public.platform_settings;
CREATE POLICY "public_read_platform_settings" ON public.platform_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "admin_manage_platform_settings" ON public.platform_settings;
CREATE POLICY "admin_manage_platform_settings" ON public.platform_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN','ADMIN'))
);

ALTER TABLE public.iyzico_webhooks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_see_iyzico_webhooks" ON public.iyzico_webhooks;
CREATE POLICY "admin_see_iyzico_webhooks" ON public.iyzico_webhooks FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN','ADMIN'))
);

ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_manage_invites" ON public.invites;
CREATE POLICY "admin_manage_invites" ON public.invites FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN','ADMIN'))
);
DROP POLICY IF EXISTS "owner_manage_invites" ON public.invites;
CREATE POLICY "owner_manage_invites" ON public.invites FOR ALL USING (
    EXISTS (SELECT 1 FROM public.salons WHERE id = invites.salon_id AND owner_id = auth.uid())
);
DROP POLICY IF EXISTS "public_read_invite_by_token" ON public.invites;
CREATE POLICY "public_read_invite_by_token" ON public.invites FOR SELECT USING (true);

-- -----------------------------------------------------------------------------
-- 13. SUBSCRIPTION_PLANS — Eksik kolonlar + Seed (New-37 final)
-- -----------------------------------------------------------------------------
ALTER TABLE public.subscription_plans
    ADD COLUMN IF NOT EXISTS price_yearly integer;

INSERT INTO public.subscription_plans
    (name, display_name, description, price_monthly, price_yearly, sort_order,
     max_branches, max_staff, max_gallery_photos, max_sms_monthly,
     has_advanced_reports, has_campaigns, has_sponsored, support_level)
VALUES
    ('STARTER',  'Başlangıç', 'Sisteme harika bir başlangıç için temel özellikler', 0,     0,      1,  1,  3,  3, 0,    false, false, false, 'STANDARD'),
    ('PRO',      'Pro',       'Tek şubeli, büyüyen butik salonlar için ideal',       49900, 499000, 2,  1,  5, 30, 250,  true,  false, false, 'STANDARD'),
    ('BUSINESS', 'Business',  'Birden fazla şubesi olan ve ivme yakalayan markalar', 74900, 749000, 3,  5, 15,100, 1000, true,  true,  false, 'PRIORITY'),
    ('ELITE',    'Elite',     'Sınırsız güç ve sponsorlu vitrin özelliği',           99900, 999000, 4, -1, -1, -1, 5000, true,  true,  true,  'VIP')
ON CONFLICT (name) DO UPDATE SET
    display_name        = EXCLUDED.display_name,
    description         = EXCLUDED.description,
    price_monthly       = EXCLUDED.price_monthly,
    price_yearly        = EXCLUDED.price_yearly,
    sort_order          = EXCLUDED.sort_order,
    max_branches        = EXCLUDED.max_branches,
    max_staff           = EXCLUDED.max_staff,
    max_gallery_photos  = EXCLUDED.max_gallery_photos,
    max_sms_monthly     = EXCLUDED.max_sms_monthly,
    has_advanced_reports= EXCLUDED.has_advanced_reports,
    has_campaigns       = EXCLUDED.has_campaigns,
    has_sponsored       = EXCLUDED.has_sponsored,
    support_level       = EXCLUDED.support_level;

-- -----------------------------------------------------------------------------
-- 14. SALON_USAGE_STATS VIEW
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.salon_usage_stats AS
SELECT
    s.id        AS salon_id,
    s.name      AS salon_name,
    sp.name     AS plan_name,
    sp.display_name AS plan_display_name,
    (SELECT count(*) FROM public.staff WHERE salon_id = s.id AND is_active = true) AS current_staff,
    sp.max_staff           AS limit_staff,
    1                      AS current_branches,
    sp.max_branches        AS limit_branches,
    (SELECT count(*) FROM public.salon_gallery WHERE salon_id = s.id) AS current_gallery_photos,
    sp.max_gallery_photos  AS limit_gallery_photos,
    sp.has_advanced_reports,
    sp.has_campaigns,
    sp.has_sponsored,
    sub.status                  AS subscription_status,
    sub.current_period_end      AS subscription_expires_at
FROM public.salons s
LEFT JOIN public.subscriptions       sub ON sub.salon_id = s.id
LEFT JOIN public.subscription_plans  sp  ON sub.plan_id  = sp.id;

-- -----------------------------------------------------------------------------
-- 15. STAFF_REVIEWS_DETAILED VIEW
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.staff_reviews_detailed AS
SELECT
    sr.id, sr.staff_id, sr.salon_id, sr.user_id, sr.appointment_id,
    sr.user_name, sr.user_avatar, sr.rating, sr.comment, sr.is_verified, sr.created_at,
    st.name  AS staff_name,
    s.name   AS salon_name
FROM public.staff_reviews sr
LEFT JOIN public.staff  st ON st.id = sr.staff_id
LEFT JOIN public.salons s  ON s.id  = sr.salon_id;

-- -----------------------------------------------------------------------------
-- 16. GRANT'LAR (anon + authenticated SELECT)
-- -----------------------------------------------------------------------------
GRANT SELECT ON public.salon_gallery, public.review_images, public.staff_reviews,
                public.staff_reviews_detailed, public.salon_usage_stats,
                public.salon_assigned_types, public.salon_type_categories,
                public.salon_memberships, public.favorites, public.staff_services,
                public.staff_branches, public.subscription_plans, public.platform_settings
        TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON public.salon_gallery, public.review_images,
                                public.notifications, public.user_sessions,
                                public.support_tickets, public.ticket_messages,
                                public.staff_reviews, public.coupons, public.packages,
                                public.package_services, public.transactions,
                                public.appointment_coupons, public.staff_branches,
                                public.salon_assigned_types, public.salon_memberships,
                                public.favorites, public.staff_services,
                                public.salon_sub_merchants, public.invites
        TO authenticated;

-- -----------------------------------------------------------------------------
-- 17. PostgREST schema cache yenile
-- -----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
