-- 999-NUCLEAR-REPAIR-V3.sql
-- Goal: Fix the broken database state with correct sequence and conflict handling.

-- 1. EXTENSIONS & TYPES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('CUSTOMER', 'STAFF', 'SALON_OWNER', 'SUPER_ADMIN');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'salon_status') THEN
        CREATE TYPE salon_status AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'SUSPENDED');
    END IF;
EXCEPTION WHEN OTHERS THEN null;
END $$;

-- 2. ENSURE TABLES EXIST (Master Data)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    role user_role DEFAULT 'CUSTOMER',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- 3. PATCH SALONS TABLE (MUST HAPPEN BEFORE VIEW)
-- Perform ALTERs individually to ensure each one runs
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS city_id UUID;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS district_id UUID;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS type_id UUID;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS geo_latitude DECIMAL(10, 8);
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS geo_longitude DECIMAL(11, 8);
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN DEFAULT false;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS status salon_status DEFAULT 'APPROVED';
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS rejected_reason TEXT;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]';
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS description TEXT;

-- 4. VIEWS (Dependency check: salons must have all columns above)
DROP VIEW IF EXISTS public.salon_details_with_membership CASCADE;
DROP VIEW IF EXISTS public.salon_details CASCADE;

CREATE OR REPLACE VIEW public.salon_details AS
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
    s.status,
    s.rejected_reason,
    s.owner_id,
    COALESCE(c.name, 'Bilinmiyor') AS city_name,
    COALESCE(d.name, 'Bilinmiyor') AS district_name,
    COALESCE(st.name, 'Genel') AS type_name,
    COALESCE(st.slug, 'genel') AS type_slug,
    0 as review_count,
    0 as average_rating,
    s.created_at
FROM public.salons s
LEFT JOIN public.cities c ON s.city_id = c.id
LEFT JOIN public.districts d ON s.district_id = d.id
LEFT JOIN public.salon_types st ON s.type_id = st.id;

CREATE OR REPLACE VIEW public.salon_details_with_membership AS
SELECT s.*, 'OWNER' as user_role, s.owner_id as current_user_id
FROM public.salon_details s;

-- 5. SEED DATA WITH INDIVIDUAL CONFLICT HANDLING
INSERT INTO public.cities (name, plate_code, latitude, longitude) 
VALUES ('İstanbul', 34, 41.0082, 28.9784) 
ON CONFLICT (name) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;

INSERT INTO public.salon_types (name, slug) VALUES ('Kuaför', 'kuafor') ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.salon_types (name, slug) VALUES ('Berber', 'berber') ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE 
    city_id_val UUID;
BEGIN
    SELECT id INTO city_id_val FROM public.cities WHERE name = 'İstanbul';
    IF city_id_val IS NOT NULL THEN
        INSERT INTO public.districts (city_id, name) VALUES (city_id_val, 'Kadıköy') ON CONFLICT DO NOTHING;
        INSERT INTO public.districts (city_id, name) VALUES (city_id_val, 'Beşiktaş') ON CONFLICT DO NOTHING;
    END IF;
END $$;
