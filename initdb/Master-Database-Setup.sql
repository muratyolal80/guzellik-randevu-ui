-- ============================================================
-- Master-Database-Setup.sql
-- Güzellik Randevu Platformu - Tam Veritabanı Şeması (v2.0 - Consolidated)
-- ============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 2. ENUMS & TYPES
DO $$ BEGIN
    -- User Roles
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('CUSTOMER', 'STAFF', 'SALON_OWNER', 'SUPER_ADMIN');
    END IF;

    -- Salon Status
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'salon_status') THEN
        CREATE TYPE public.salon_status AS ENUM ('DRAFT', 'SUBMITTED', 'REVISION_REQUESTED', 'APPROVED', 'REJECTED', 'SUSPENDED', 'DELETED', 'PASSIVE');
    END IF;

    -- Appointment Status
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appt_status') THEN
        CREATE TYPE public.appt_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
    END IF;

    -- IYS Types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'iys_msg_type') THEN
        CREATE TYPE public.iys_msg_type AS ENUM ('OTP', 'INFO', 'CAMPAIGN');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'iys_status') THEN
        CREATE TYPE public.iys_status AS ENUM ('SENT', 'FAILED', 'DEMO');
    END IF;

    -- Discount Type
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discount_type') THEN
        CREATE TYPE public.discount_type AS ENUM ('PERCENTAGE', 'FIXED');
    END IF;

    -- Refund Status
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'refund_status') THEN
        CREATE TYPE public.refund_status AS ENUM ('NONE', 'PENDING', 'COMPLETED', 'FAILED');
    END IF;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

-- 3. TABLES

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    role public.user_role DEFAULT 'CUSTOMER'::public.user_role,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cities & Districts
CREATE TABLE IF NOT EXISTS public.cities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    plate_code INTEGER NOT NULL UNIQUE,
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.districts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(city_id, name)
);

-- Salon Types & Service Categories
CREATE TABLE IF NOT EXISTS public.salon_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.global_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    avg_duration_min INTEGER DEFAULT 30,
    avg_price NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(category_id, name)
);

-- Salons (Consolidated)
CREATE TABLE IF NOT EXISTS public.salons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES public.profiles(id),
    name CHARACTER VARYING(255) NOT NULL,
    slug CHARACTER VARYING(255),
    description TEXT,
    address CHARACTER VARYING(255),
    neighborhood CHARACTER VARYING(255),
    avenue CHARACTER VARYING(255),
    street CHARACTER VARYING(255),
    building_no CHARACTER VARYING(50),
    apartment_no CHARACTER VARYING(50),
    postal_code CHARACTER VARYING(20),
    phone TEXT,
    image TEXT,
    logo_url TEXT,
    banner_url TEXT,
    primary_color TEXT DEFAULT '#D4A574',
    is_verified BOOLEAN DEFAULT FALSE,
    is_sponsored BOOLEAN DEFAULT FALSE,
    is_closed BOOLEAN DEFAULT FALSE,
    status public.salon_status DEFAULT 'DRAFT'::public.salon_status,
    rejected_reason TEXT,
    city_id UUID REFERENCES public.cities(id),
    district_id UUID REFERENCES public.districts(id),
    type_id UUID REFERENCES public.salon_types(id),
    geo_latitude NUMERIC(10,8),
    geo_longitude NUMERIC(11,8),
    location public.geometry(Point,4326),
    features JSONB DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT '{}'::text[],
    rating DOUBLE PRECISION DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    min_price NUMERIC(10,2) DEFAULT 0,
    plan TEXT DEFAULT 'STARTER' CHECK (plan IN ('STARTER', 'PRO', 'ELITE')),
    deposit_rate NUMERIC DEFAULT 0,
    cancellation_deadline_hours INTEGER DEFAULT 24,
    reminder_enabled BOOLEAN DEFAULT TRUE,
    reminder_hours_before INTEGER DEFAULT 2,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    user_id UUID UNIQUE REFERENCES public.profiles(id),
    name TEXT NOT NULL,
    photo TEXT,
    specialty TEXT,
    bio TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Salon Services
CREATE TABLE IF NOT EXISTS public.salon_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    global_service_id UUID NOT NULL REFERENCES public.global_services(id),
    duration_min INTEGER NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    max_participants INTEGER DEFAULT 1,
    requires_resource BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(salon_id, global_service_id)
);

-- Resources
CREATE TABLE IF NOT EXISTS public.salon_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    capacity INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Working Hours
CREATE TABLE IF NOT EXISTS public.working_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_day_off BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(staff_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS public.salon_working_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(salon_id, day_of_week)
);

-- Appointments (Consolidated)
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id),
    customer_name TEXT,
    customer_phone TEXT,
    salon_id UUID NOT NULL REFERENCES public.salons(id),
    staff_id UUID NOT NULL REFERENCES public.staff(id),
    salon_service_id UUID NOT NULL REFERENCES public.salon_services(id),
    resource_id UUID REFERENCES public.salon_resources(id),
    participant_count INTEGER DEFAULT 1,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status public.appt_status DEFAULT 'PENDING',
    notes TEXT,
    deposit_amount NUMERIC DEFAULT 0,
    iyzico_payment_id TEXT,
    refund_status public.refund_status DEFAULT 'NONE',
    refund_amount NUMERIC DEFAULT 0,
    payment_method TEXT DEFAULT 'CASH',
    payment_status TEXT DEFAULT 'PENDING',
    campaign_rule_id UUID,
    coupon_code TEXT,
    discount_amount NUMERIC DEFAULT 0,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRM & Reviews
CREATE TABLE IF NOT EXISTS public.salon_customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    loyalty_points INTEGER DEFAULT 0,
    is_blocked BOOLEAN DEFAULT FALSE,
    total_appointments INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    last_visit TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(salon_id, customer_id)
);

CREATE TABLE IF NOT EXISTS public.customer_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketing
CREATE TABLE IF NOT EXISTS public.campaign_rules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    discount_type public.discount_type NOT NULL,
    discount_value NUMERIC(10,2) NOT NULL,
    start_time TIME,
    end_time TIME,
    days_of_week INTEGER[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    price_monthly INTEGER NOT NULL DEFAULT 0,
    max_branches INTEGER NOT NULL DEFAULT 1,
    max_staff INTEGER NOT NULL DEFAULT 3,
    max_gallery_photos INTEGER NOT NULL DEFAULT 3,
    max_sms_monthly INTEGER NOT NULL DEFAULT 0,
    has_advanced_reports BOOLEAN DEFAULT FALSE,
    has_excel_export BOOLEAN DEFAULT FALSE,
    has_campaigns BOOLEAN DEFAULT FALSE,
    has_sponsored BOOLEAN DEFAULT FALSE,
    support_level TEXT DEFAULT 'NORMAL',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    iyzico_subscription_ref TEXT,
    payment_method TEXT DEFAULT 'IYZICO',
    current_period_start TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(owner_id)
);

CREATE TABLE IF NOT EXISTS public.payment_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    payment_type TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    iyzico_payment_id TEXT,
    iyzico_link_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. VIEWS

CREATE OR REPLACE VIEW public.salon_ratings WITH (security_invoker = ON) AS
SELECT
    s.id AS salon_id,
    s.name AS salon_name,
    COUNT(r.id) AS review_count,
    COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS average_rating
FROM public.salons s
LEFT JOIN public.reviews r ON s.id = r.salon_id
GROUP BY s.id, s.name;

CREATE OR REPLACE VIEW public.salon_details WITH (security_invoker = ON) AS
SELECT
    s.id, s.name, s.slug, s.description, s.features, s.tags,
    s.address, s.neighborhood, s.avenue, s.street, s.building_no, s.apartment_no, s.postal_code,
    s.phone, s.image, s.logo_url, s.banner_url, s.primary_color,
    s.geo_latitude, s.geo_longitude,
    s.status, s.is_sponsored, s.is_closed, s.rejected_reason, s.plan, s.min_price,
    s.owner_id, s.city_id, s.district_id, s.type_id,
    s.deposit_rate,
    COALESCE(c.name, 'Bilinmiyor') AS city_name,
    COALESCE(d.name, 'Bilinmiyor') AS district_name,
    COALESCE(st.name, 'Genel')     AS type_name,
    COALESCE(st.slug, 'genel')     AS type_slug,
    sr.review_count,
    sr.average_rating,
    s.created_at, s.updated_at
FROM public.salons s
LEFT JOIN public.cities      c  ON c.id  = s.city_id
LEFT JOIN public.districts   d  ON d.id  = s.district_id
LEFT JOIN public.salon_types st ON st.id = s.type_id
LEFT JOIN public.salon_ratings sr ON sr.salon_id = s.id;

-- 5. FUNCTIONS & TRIGGERS

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    v_role public.user_role;
BEGIN
    v_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'CUSTOMER'::public.user_role);
    
    INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        v_role,
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
        role = COALESCE(public.profiles.role, EXCLUDED.role),
        avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_salons_updated_at ON public.salons;
CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON public.salons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auth Hook
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    END IF;
END $$;

-- Double Booking Prevention
DO $$ BEGIN
    ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS prevent_staff_double_booking;
    ALTER TABLE public.appointments
        ADD CONSTRAINT prevent_staff_double_booking
        EXCLUDE USING gist (
        staff_id WITH =,
        tstzrange(start_time, end_time, '[)') WITH &&
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 6. SECURITY (RLS) - Basic Public Read
DO $$ DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;

-- Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public Read Access" ON public.cities;
    CREATE POLICY "Public Read Access" ON public.cities FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Public Read Access" ON public.districts;
    CREATE POLICY "Public Read Access" ON public.districts FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Public Read Access" ON public.salon_types;
    CREATE POLICY "Public Read Access" ON public.salon_types FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Public Read Access" ON public.service_categories;
    CREATE POLICY "Public Read Access" ON public.service_categories FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Public Read Access" ON public.global_services;
    CREATE POLICY "Public Read Access" ON public.global_services FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Public Read Access" ON public.salons;
    CREATE POLICY "Public Read Access" ON public.salons FOR SELECT USING (status = 'APPROVED');
    
    DROP POLICY IF EXISTS "Public Read Access" ON public.staff;
    CREATE POLICY "Public Read Access" ON public.staff FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Public Read Access" ON public.salon_services;
    CREATE POLICY "Public Read Access" ON public.salon_services FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Public Read Access" ON public.reviews;
    CREATE POLICY "Public Read Access" ON public.reviews FOR SELECT USING (true);
EXCEPTION WHEN others THEN null; END $$;
