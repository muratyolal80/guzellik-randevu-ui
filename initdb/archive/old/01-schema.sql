-- GuzellikRandevu Database Schema
-- Migration: Full Auth & Business Logic Setup
-- Combined Version: New Auth Structure + Existing Views

-- Set Timezone to GMT+3 (Istanbul)
-- Note: targeting kuafor_db in this environment
-- ALTER DATABASE kuafor_db SET timezone TO 'Europe/Istanbul';

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- 1. ENUMS (Custom Types for Better Data Integrity)
-- ==============================================

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('CUSTOMER', 'STAFF', 'SALON_OWNER', 'SUPER_ADMIN');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appt_status') THEN
        CREATE TYPE appt_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'iys_msg_type') THEN
        CREATE TYPE iys_msg_type AS ENUM ('OTP', 'INFO', 'CAMPAIGN');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'iys_status') THEN
        CREATE TYPE iys_status AS ENUM ('SENT', 'FAILED', 'DEMO');
    END IF;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

-- ==============================================
-- 2. AUTH & PROFILES (The New Plan)
-- ==============================================

-- This table syncs with Supabase's hidden auth.users table
CREATE TABLE IF NOT EXISTS public.profiles (
                                 id UUID PRIMARY KEY,
                                 email TEXT UNIQUE NOT NULL,
                                 first_name TEXT,
                                 last_name TEXT,
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
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- 3. GLOBAL MASTER DATA
-- ==============================================

CREATE TABLE IF NOT EXISTS public.cities (
                               id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                               name TEXT UNIQUE NOT NULL,
                               plate_code INTEGER UNIQUE NOT NULL,
                               latitude DECIMAL(10, 8),
                               longitude DECIMAL(11, 8),
                               created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.districts (
                                  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
                                  name TEXT NOT NULL,
                                  created_at TIMESTAMPTZ DEFAULT NOW(),
                                  UNIQUE(city_id, name)
);

CREATE TABLE IF NOT EXISTS public.salon_types (
                                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                    name TEXT UNIQUE NOT NULL,
                                    slug TEXT UNIQUE NOT NULL,
                                    icon TEXT,
                                    image TEXT,
                                    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.service_categories (
                                           id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                           name TEXT UNIQUE NOT NULL,
                                           slug TEXT UNIQUE NOT NULL,
                                           icon TEXT,
                                           created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.global_services (
                                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                        category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
                                        name TEXT NOT NULL,
                                        created_at TIMESTAMPTZ DEFAULT NOW(),
                                        UNIQUE(category_id, name)
);

-- ==============================================
-- 4. TENANT / BUSINESS DATA
-- ==============================================

CREATE TABLE IF NOT EXISTS public.salons (
                               id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                               owner_id UUID NOT NULL REFERENCES public.profiles(id),
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
                               description TEXT,
                               features JSONB DEFAULT '[]'::jsonb,
                               created_at TIMESTAMPTZ DEFAULT NOW(),
                               updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_salons_updated_at ON public.salons;
CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON public.salons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.staff (
                               id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                               salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
                               user_id UUID UNIQUE REFERENCES public.profiles(id),
                               name TEXT NOT NULL,
                               photo TEXT,
                               specialty TEXT,
                               is_active BOOLEAN DEFAULT true,
                               bio TEXT,
                               created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.salon_services (
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

CREATE TABLE IF NOT EXISTS public.working_hours (
                                      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                      staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
                                      day_of_week INTEGER NOT NULL,
                                      start_time TIME NOT NULL,
                                      end_time TIME NOT NULL,
                                      is_day_off BOOLEAN DEFAULT false,
                                      created_at TIMESTAMPTZ DEFAULT NOW(),
                                      UNIQUE(staff_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS public.salon_working_hours (
                                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
                                day_of_week INTEGER NOT NULL,
                                start_time TIME NOT NULL,
                                end_time TIME NOT NULL,
                                is_closed BOOLEAN DEFAULT false,
                                created_at TIMESTAMPTZ DEFAULT NOW(),
                                UNIQUE(salon_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS public.appointments (
                                     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                     customer_id UUID REFERENCES public.profiles(id),
                                     customer_name TEXT,
                                     customer_phone TEXT,
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

DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

CREATE TABLE IF NOT EXISTS public.iys_logs (
                                 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                 phone TEXT NOT NULL,
                                 message_type iys_msg_type NOT NULL,
                                 content TEXT NOT NULL,
                                 status iys_status NOT NULL,
                                 created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.otp_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_active_otp UNIQUE (phone, code)
);

CREATE INDEX IF NOT EXISTS idx_otp_phone_expires ON public.otp_codes(phone, expires_at) WHERE used = false;
CREATE INDEX IF NOT EXISTS idx_otp_cleanup ON public.otp_codes(expires_at) WHERE used = false;

CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM public.otp_codes
    WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- 6. VIEWS (Security Invoker Enabled)
-- ==============================================

CREATE OR REPLACE VIEW salon_ratings WITH (security_invoker = on) AS
SELECT
    s.id AS salon_id,
    s.name AS salon_name,
    COUNT(r.id) AS review_count,
    COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS average_rating
FROM public.salons s
         LEFT JOIN public.reviews r ON s.id = r.salon_id
GROUP BY s.id, s.name;

CREATE OR REPLACE VIEW salon_details WITH (security_invoker = on) AS
SELECT
    s.id,
    s.name,
    s.description,
    s.features,
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

CREATE OR REPLACE VIEW salon_service_details WITH (security_invoker = on) AS
SELECT
    ss.id,
    ss.salon_id,
    ss.duration_min,
    ss.price,
    gs.name AS service_name,
    sc.name AS category_name,
    sc.slug AS category_slug,
    sc.icon AS category_icon,
    s.name AS salon_name
FROM public.salon_services ss
         JOIN public.global_services gs ON ss.global_service_id = gs.id
         JOIN public.service_categories sc ON gs.category_id = sc.id
         JOIN public.salons s ON ss.salon_id = s.id;

-- ==============================================
-- 7. THE AUTH HOOK (Unified & Safe)
-- ==============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    v_role public.user_role;
    v_first_name TEXT;
    v_last_name TEXT;
    v_full_name TEXT;
BEGIN
    v_first_name := NEW.raw_user_meta_data->>'first_name';
    v_last_name := NEW.raw_user_meta_data->>'last_name';
    v_full_name := NEW.raw_user_meta_data->>'full_name';
    
    -- Improved Name Logic
    IF v_first_name IS NULL AND v_full_name IS NOT NULL THEN
        v_first_name := split_part(v_full_name, ' ', 1);
        v_last_name := substr(v_full_name, length(v_first_name) + 2);
    END IF;
    
    -- Role Protection Logic (Unifying from 14-role-protection.sql setup)
    v_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'CUSTOMER'::public.user_role);
    
    IF v_role = 'SUPER_ADMIN' THEN
        v_role := 'CUSTOMER'::public.user_role;
    END IF;

    -- Upsert Profile
    INSERT INTO public.profiles (id, email, first_name, last_name, full_name, role, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        v_first_name,
        v_last_name,
        COALESCE(v_full_name, v_first_name || ' ' || v_last_name),
        v_role,
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = COALESCE(public.profiles.first_name, EXCLUDED.first_name),
        last_name = COALESCE(public.profiles.last_name, EXCLUDED.last_name),
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
        role = COALESCE(public.profiles.role, EXCLUDED.role),
        avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
        updated_at = NOW();

    -- (Optional) Sync metadata back to auth.users if enforcement happened?
    -- For now, we keep it simple to avoid recursion or permission issues.

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- NOTE: trigger creation on auth.users requires elevated permissions and will skip if schema auth doesn't exist
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    END IF;
END $$;

CREATE EXTENSION IF NOT EXISTS btree_gist;

DO $$ BEGIN
    ALTER TABLE public.appointments
        ADD CONSTRAINT prevent_staff_double_booking
        EXCLUDE USING gist (
        staff_id WITH =,
        tstzrange(start_time, end_time, '[)') WITH &&
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==============================================
-- 8. SECURITY (RLS)
-- ==============================================

DO $$ DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;

-- Policies (DROP then CREATE for idempotency)
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
    CREATE POLICY "Public Read Access" ON public.salons FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Public Read Access" ON public.staff;
    CREATE POLICY "Public Read Access" ON public.staff FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Public Read Access" ON public.salon_services;
    CREATE POLICY "Public Read Access" ON public.salon_services FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Public Read Access" ON public.working_hours;
    CREATE POLICY "Public Read Access" ON public.working_hours FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Public Read Access" ON public.reviews;
    CREATE POLICY "Public Read Access" ON public.reviews FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Public Read Access" ON public.salon_working_hours;
    CREATE POLICY "Public Read Access" ON public.salon_working_hours FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Users can see own profile" ON public.profiles;
    CREATE POLICY "Users can see own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
    CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

    DROP POLICY IF EXISTS "Owners update own salon" ON public.salons;
    CREATE POLICY "Owners update own salon" ON public.salons FOR UPDATE USING (auth.uid() = owner_id);

    DROP POLICY IF EXISTS "Users view own appointments" ON public.appointments;
    CREATE POLICY "Users view own appointments" ON public.appointments FOR SELECT
        USING (auth.uid() = customer_id OR auth.uid() IN (SELECT owner_id FROM public.salons WHERE id = appointments.salon_id));
END $$;