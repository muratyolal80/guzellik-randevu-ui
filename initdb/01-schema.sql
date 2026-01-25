-- GuzellikRandevu Database Schema
-- Migration: Full Auth & Business Logic Setup
-- Combined Version: New Auth Structure + Existing Views

-- Set Timezone to GMT+3 (Istanbul)
ALTER DATABASE postgres SET timezone TO 'Europe/Istanbul';

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- 1. ENUMS (Custom Types for Better Data Integrity)
-- ==============================================

DO $$ BEGIN
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'STAFF', 'SALON_OWNER', 'SUPER_ADMIN');
CREATE TYPE appt_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
CREATE TYPE iys_msg_type AS ENUM ('OTP', 'INFO', 'CAMPAIGN');
CREATE TYPE iys_status AS ENUM ('SENT', 'FAILED', 'DEMO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================
-- 2. AUTH & PROFILES (The New Plan)
-- ==============================================

-- This table syncs with Supabase's hidden auth.users table
CREATE TABLE public.profiles (
                                 id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
                                 email TEXT UNIQUE NOT NULL,
                                 full_name TEXT,
                                 avatar_url TEXT,
                                 phone TEXT,
                                 role user_role DEFAULT 'CUSTOMER',
                                 created_at TIMESTAMPTZ DEFAULT NOW(),
                                 updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to update 'updated_at' automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- 3. GLOBAL MASTER DATA
-- ==============================================

CREATE TABLE public.cities (
                               id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                               name TEXT UNIQUE NOT NULL,
                               plate_code INTEGER UNIQUE NOT NULL,
                               latitude DECIMAL(10, 8), -- Added for coordinates
                               longitude DECIMAL(11, 8), -- Added for coordinates
                               created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.districts (
                                  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
                                  name TEXT NOT NULL,
                                  created_at TIMESTAMPTZ DEFAULT NOW(),
                                  UNIQUE(city_id, name)
);

CREATE TABLE public.salon_types (
                                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                    name TEXT UNIQUE NOT NULL,
                                    slug TEXT UNIQUE NOT NULL,
                                    icon TEXT,
                                    image TEXT, -- Added for UI display
                                    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.service_categories (
                                           id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                           name TEXT UNIQUE NOT NULL,
                                           slug TEXT UNIQUE NOT NULL,
                                           icon TEXT,
                                           created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.global_services (
                                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                        category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
                                        name TEXT NOT NULL,
                                        created_at TIMESTAMPTZ DEFAULT NOW(),
                                        UNIQUE(category_id, name)
);

-- ==============================================
-- 4. TENANT / BUSINESS DATA
-- ==============================================

CREATE TABLE public.salons (
                               id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                               owner_id UUID NOT NULL REFERENCES public.profiles(id), -- Link to Salon Owner (REQUIRED)
                               name TEXT NOT NULL,
                               city_id UUID NOT NULL REFERENCES public.cities(id),
                               district_id UUID NOT NULL REFERENCES public.districts(id),
                               type_id UUID NOT NULL REFERENCES public.salon_types(id),
                               address TEXT,
                               phone TEXT,
                               geo_latitude DECIMAL(10, 8),
                               geo_longitude DECIMAL(11, 8),
                               image TEXT,
                               is_sponsored BOOLEAN DEFAULT false,
                               description TEXT, -- Added for informational UI
                               features JSONB DEFAULT '[]'::jsonb, -- Added for amenities
                               created_at TIMESTAMPTZ DEFAULT NOW(),
                               updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON public.salons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE public.staff (
                              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                              salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
                              user_id UUID UNIQUE REFERENCES public.profiles(id), -- NEW: Link to Staff Login
                              name TEXT NOT NULL,
                              photo TEXT,
                              specialty TEXT,
                              is_active BOOLEAN DEFAULT true,
                              bio TEXT, -- Added for staff descriptions
                              created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.salon_services (
                                       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                       salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
                                       global_service_id UUID NOT NULL REFERENCES public.global_services(id),
                                       duration_min INTEGER NOT NULL,
                                       price DECIMAL(10, 2) NOT NULL,
                                       created_at TIMESTAMPTZ DEFAULT NOW(),
                                       UNIQUE(salon_id, global_service_id)
);

-- ==============================================
-- 5. OPERATIONS
-- ==============================================

CREATE TABLE public.working_hours (
                                      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                      staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
                                      day_of_week INTEGER NOT NULL, -- 0=Sunday
                                      start_time TIME NOT NULL,
                                      end_time TIME NOT NULL,
                                      is_day_off BOOLEAN DEFAULT false,
                                      created_at TIMESTAMPTZ DEFAULT NOW(),
                                      UNIQUE(staff_id, day_of_week)
);

CREATE TABLE public.salon_working_hours (
                                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
                                day_of_week INTEGER NOT NULL, -- 0=Sunday
                                start_time TIME NOT NULL,
                                end_time TIME NOT NULL,
                                is_closed BOOLEAN DEFAULT false,
                                created_at TIMESTAMPTZ DEFAULT NOW(),
                                UNIQUE(salon_id, day_of_week)
);

CREATE TABLE public.appointments (
                                     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                     customer_id UUID REFERENCES public.profiles(id), -- NEW: Link to Registered User
                                     customer_name TEXT,  -- Fallback for guest
                                     customer_phone TEXT, -- Fallback for guest
                                     salon_id UUID NOT NULL REFERENCES public.salons(id),
                                     staff_id UUID NOT NULL REFERENCES public.staff(id),
                                     salon_service_id UUID NOT NULL REFERENCES public.salon_services(id),
                                     start_time TIMESTAMPTZ NOT NULL,
                                     end_time TIMESTAMPTZ NOT NULL,
                                     status appt_status DEFAULT 'PENDING',
                                     notes TEXT,
                                     created_at TIMESTAMPTZ DEFAULT NOW(),
                                     updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE public.reviews (
                                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
                                user_id UUID REFERENCES public.profiles(id),
                                user_name TEXT NOT NULL,
                                user_avatar TEXT,
                                rating INTEGER NOT NULL,
                                comment TEXT,
                                created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.iys_logs (
                                 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                 phone TEXT NOT NULL,
                                 message_type iys_msg_type NOT NULL,
                                 content TEXT NOT NULL,
                                 status iys_status NOT NULL,
                                 created_at TIMESTAMPTZ DEFAULT NOW()
);

-- OTP Codes Table (SMS Verification)
CREATE TABLE public.otp_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicate active OTP codes
    CONSTRAINT unique_active_otp UNIQUE (phone, code)
);

-- Index for OTP lookups (performance)
CREATE INDEX idx_otp_phone_expires ON public.otp_codes(phone, expires_at) WHERE used = false;
CREATE INDEX idx_otp_cleanup ON public.otp_codes(expires_at) WHERE used = false;

-- Cleanup function for expired OTP codes
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM public.otp_codes
    WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- 6. VIEWS (Preserved from your Old Plan)
-- ==============================================

-- View: Salon ratings calculated from reviews
CREATE OR REPLACE VIEW salon_ratings WITH (security_invoker = on) AS
SELECT
    s.id AS salon_id,
    s.name AS salon_name,
    COUNT(r.id) AS review_count,
    COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS average_rating
FROM public.salons s
         LEFT JOIN public.reviews r ON s.id = r.salon_id
GROUP BY s.id, s.name;

-- View: Salon details with location and rating
CREATE OR REPLACE VIEW salon_details WITH (security_invoker = on) AS
SELECT
    s.id,
    s.name,
    s.description, -- NEW
    s.features,    -- NEW
    s.address,
    s.phone,
    s.geo_latitude,
    s.geo_longitude,
    s.image,
    s.is_sponsored,
    c.name AS city_name,
    d.name AS district_name,
    st.name AS type_name,
    st.slug AS type_slug,
    sr.review_count,
    sr.average_rating,
    s.created_at
FROM public.salons s
         JOIN public.cities c ON s.city_id = c.id
         JOIN public.districts d ON s.district_id = d.id
         JOIN public.salon_types st ON s.type_id = st.id
         LEFT JOIN salon_ratings sr ON s.id = sr.salon_id;

-- View: Services with category and salon info
CREATE OR REPLACE VIEW salon_service_details WITH (security_invoker = on) AS
SELECT
    ss.id,
    ss.salon_id,
    ss.duration_min,
    ss.price,
    gs.name AS service_name,
    sc.name AS category_name,
    sc.slug AS category_slug,
    sc.icon AS category_icon, -- NEW
    s.name AS salon_name
FROM public.salon_services ss
         JOIN public.global_services gs ON ss.global_service_id = gs.id
         JOIN public.service_categories sc ON gs.category_id = sc.id
         JOIN public.salons s ON ss.salon_id = s.id;

-- ==============================================
-- 7. THE AUTH HOOK (Supabase Integration)
-- ==============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
VALUES (
           new.id,
           new.email,
           new.raw_user_meta_data->>'full_name',
           new.raw_user_meta_data->>'avatar_url',
           COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'CUSTOMER')
       )
    ON CONFLICT (id) DO NOTHING;
RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 1. Range tipleriyle işlem yapabilmek için eklenti (Şart)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2. Çifte Rezervasyon Engelleyici Kural
-- Mantık: Aynı personel (staff_id), zaman aralığı (start_time, end_time) çakışan ikinci bir işi alamaz.
ALTER TABLE public.appointments
    ADD CONSTRAINT prevent_staff_double_booking
    EXCLUDE USING gist (
    staff_id WITH =,
    tstzrange(start_time, end_time, '[)') WITH &&
);

-- ==============================================
-- 8. SECURITY (RLS)
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iys_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_working_hours ENABLE ROW LEVEL SECURITY;

-- Basic Read Policies (Allow Public Read for Storefront)
CREATE POLICY "Public Read Access" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.districts FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.salon_types FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.service_categories FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.global_services FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.salons FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.staff FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.salon_services FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.working_hours FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.salon_working_hours FOR SELECT USING (true);

-- Auth Specific Policies
CREATE POLICY "Users can see own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Owners can update their own salons
CREATE POLICY "Owners update own salon" ON public.salons FOR UPDATE USING (auth.uid() = owner_id);

-- Appointments: Customers see own, Staff/Owners see linked
CREATE POLICY "Users view own appointments" ON public.appointments FOR SELECT
                                                                           USING (auth.uid() = customer_id OR auth.uid() IN (
                                                                           SELECT owner_id FROM public.salons WHERE id = appointments.salon_id
                                                                           ));