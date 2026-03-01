-- Faz 3: Finans & Kampanya Modülü
-- New-21-Finance-And-Campaigns.sql

-- 1. ENUMS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discount_type') THEN
        CREATE TYPE public.discount_type AS ENUM ('PERCENTAGE', 'FIXED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
        CREATE TYPE public.payment_method AS ENUM ('CASH', 'CREDIT_CARD', 'WALLET', 'OTHER');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE public.payment_status AS ENUM ('PENDING', 'COMPLETED', 'REFUNDED', 'FAILED');
    END IF;
END $$;

-- 2. COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id uuid REFERENCES public.salons(id) ON DELETE CASCADE, -- NULL ise global kupon
    code text NOT NULL,
    description text,
    discount_type public.discount_type NOT NULL,
    discount_value numeric(10,2) NOT NULL,
    min_purchase_amount numeric(10,2) DEFAULT 0,
    max_discount_amount numeric(10,2),
    expires_at timestamp with time zone,
    usage_limit integer DEFAULT 1,
    used_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(salon_id, code)
);

-- 3. PACKAGES
CREATE TABLE IF NOT EXISTS public.packages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    is_active boolean DEFAULT true,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- 4. PACKAGE SERVICES
CREATE TABLE IF NOT EXISTS public.package_services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    package_id uuid NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
    salon_service_id uuid NOT NULL REFERENCES public.salon_services(id) ON DELETE CASCADE,
    quantity integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(package_id, salon_service_id)
);

-- 5. TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    customer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'TRY',
    payment_method public.payment_method DEFAULT 'CASH',
    payment_status public.payment_status DEFAULT 'PENDING',
    provider_transaction_id text, -- Iyzico, Stripe vb.
    commission_amount numeric(10,2) DEFAULT 0,
    notes text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 6. APPOINTMENT COUPONS (Randevuda kullanılan kuponlar)
CREATE TABLE IF NOT EXISTS public.appointment_coupons (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    discount_amount numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(appointment_id, coupon_id)
);

-- RLS POLICIES

-- Coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coupons are viewable by everyone if active" ON public.coupons
    FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));
CREATE POLICY "Salon owners can manage their own coupons" ON public.coupons
    FOR ALL USING (
        salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
    );

-- Packages
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Packages are viewable by everyone if active" ON public.packages
    FOR SELECT USING (is_active = true);
CREATE POLICY "Salon owners can manage their own packages" ON public.packages
    FOR ALL USING (
        salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
    );

-- Transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can see their own transactions" ON public.transactions
    FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Salon owners can see their salon transactions" ON public.transactions
    FOR SELECT USING (
        salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
    );

-- Audit log for transactions (updated_at)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
