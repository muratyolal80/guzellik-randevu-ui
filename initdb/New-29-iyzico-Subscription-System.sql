-- =============================================================================
-- New-29-iyzico-Subscription-System.sql
-- iyzico (Subscription + Marketplace + Link API) & IBAN System
-- =============================================================================

-- 1. UPDATE PLAN ENUM VALUES
DO $$
BEGIN
    ALTER TABLE public.salons DROP CONSTRAINT IF EXISTS salons_plan_check;
    UPDATE public.salons SET plan = 'STARTER' WHERE plan IN ('FREE', NULL);
    UPDATE public.salons SET plan = 'ELITE' WHERE plan = 'ENTERPRISE';
    ALTER TABLE public.salons ALTER COLUMN plan SET DEFAULT 'STARTER';
    ALTER TABLE public.salons ADD CONSTRAINT salons_plan_check CHECK (plan IN ('STARTER', 'PRO', 'ELITE'));
END $$;

-- 2. SUBSCRIPTION PLANS
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,         -- STARTER, PRO, ELITE
    display_name text NOT NULL,
    description text,
    price_monthly integer NOT NULL DEFAULT 0, -- Kuruş
    max_branches integer NOT NULL DEFAULT 1,
    max_staff integer NOT NULL DEFAULT 3,
    max_gallery_photos integer NOT NULL DEFAULT 3,
    max_sms_monthly integer NOT NULL DEFAULT 0,
    has_advanced_reports boolean DEFAULT false,
    has_excel_export boolean DEFAULT false,
    has_campaigns boolean DEFAULT false,
    has_sponsored boolean DEFAULT false,
    support_level text DEFAULT 'NORMAL', -- NORMAL, PRIORITY, DEDICATED
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- 3. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE UNIQUE,
    plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
    status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING_APPROVAL', 'CANCELLED', 'PAST_DUE', 'EXPIRED')),
    iyzico_subscription_ref text,
    payment_method text DEFAULT 'IYZICO' CHECK (payment_method IN ('IYZICO', 'BANK_TRANSFER')),
    current_period_start timestamptz DEFAULT now(),
    current_period_end timestamptz NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 4. SALON SUB-MERCHANTS & BANK INFO
CREATE TABLE IF NOT EXISTS public.salon_sub_merchants (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE UNIQUE,
    iyzico_sub_merchant_key text,
    iban text NOT NULL,
    bank_name text,
    account_owner text,
    sub_merchant_type text DEFAULT 'PERSONAL' CHECK (sub_merchant_type IN ('PERSONAL', 'PRIVATE_COMPANY', 'LIMITED_OR_JOINT_STOCK')),
    status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'REJECTED')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 5. PAYMENT HISTORY
CREATE TABLE IF NOT EXISTS public.payment_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
    payment_type text NOT NULL CHECK (payment_type IN ('SUBSCRIPTION', 'APPOINTMENT', 'REFUND')),
    payment_method text NOT NULL CHECK (payment_method IN ('IYZICO_CC', 'IYZICO_LINK', 'BANK_TRANSFER')),
    amount integer NOT NULL, -- Kuruş
    status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('SUCCESS', 'FAILED', 'PENDING', 'REFUNDED')),
    iyzico_payment_id text,
    iyzico_link_id text,
    bank_transfer_notified_at timestamptz, -- Havale bildirimi zamanı
    bank_transfer_proof_url text,           -- Opsiyonel dekont
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- 6. PLATFORM SETTINGS
CREATE TABLE IF NOT EXISTS public.platform_settings (
    key text PRIMARY KEY,
    value jsonb NOT NULL,
    updated_at timestamptz DEFAULT now()
);

-- index, RLS ve Seed verileri Implementation Plan'a paralel eklenecektir.
-- Faz 1 kapsamında şu an sadece tabloları oluşturuyoruz.

-- SEED PLANS
INSERT INTO public.subscription_plans (name, display_name, description, price_monthly, max_branches, max_staff, max_gallery_photos, max_sms_monthly, has_advanced_reports, has_campaigns, has_sponsored, support_level, sort_order)
VALUES 
    ('STARTER', 'Başlangıç', 'Ücretsiz temel plan', 0, 1, 3, 3, 0, false, false, false, 'NORMAL', 1),
    ('PRO', 'Pro', 'Küçük ve orta ölçekli salonlar', 49900, 3, 10, 20, 500, true, true, true, 'PRIORITY', 2),
    ('ELITE', 'Elite', 'Sınırsız özellikler', 99900, -1, -1, -1, -1, true, true, true, 'DEDICATED', 3)
ON CONFLICT (name) DO NOTHING;

-- SEED BANK INFO
INSERT INTO public.platform_settings (key, value)
VALUES ('bank_accounts', '[{"bank": "Ziraat Bankası", "owner": "Güzellik Randevu Platformu", "iban": "TR00...", "description": "Lütfen ödeme açıklamasında SalonID belirtiniz."}]')
ON CONFLICT (key) DO NOTHING;
