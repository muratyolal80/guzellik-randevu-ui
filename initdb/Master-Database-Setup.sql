-- ============================================================
-- Master-Database-Setup.sql
-- Güzellik Randevu Platformu - Tam Veritabanı Şeması (v1.0)
-- ============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. ENUMS & TYPES
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('CUSTOMER', 'OWNER', 'STAFF', 'SUPER_ADMIN');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'salon_status') THEN
        CREATE TYPE public.salon_status AS ENUM ('DRAFT', 'PENDING', 'ACTIVE', 'REJECTED');
    END IF;
END $$;

-- 3. TABLES (Core Architecture)

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL UNIQUE,
    full_name text,
    first_name text,
    last_name text,
    avatar_url text,
    phone text,
    role public.user_role DEFAULT 'CUSTOMER'::public.user_role,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Cities & Districts
CREATE TABLE IF NOT EXISTS public.cities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    plate_code integer NOT NULL UNIQUE,
    latitude numeric(10,8),
    longitude numeric(11,8),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.districts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    city_id uuid NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
    name text NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(city_id, name)
);

-- Salon Types & Services
CREATE TABLE IF NOT EXISTS public.salon_types (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE,
    icon text,
    image text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.service_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE,
    icon text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.global_services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id uuid NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
    name text NOT NULL,
    avg_duration_min integer DEFAULT 30,
    avg_price numeric(10,2) DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    UNIQUE(category_id, name)
);

-- Salons (Final State)
CREATE TABLE IF NOT EXISTS public.salons (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying(255) NOT NULL,
    slug character varying(255),
    description text,
    address character varying(255),
    neighborhood character varying(255),
    avenue character varying(255),
    street character varying(255),
    building_no character varying(50),
    apartment_no character varying(50),
    postal_code character varying(20),
    phone text,
    image text,
    logo_url text,
    banner_url text,
    primary_color text DEFAULT '#D4A574',
    is_verified boolean DEFAULT false,
    is_sponsored boolean DEFAULT false,
    is_closed boolean DEFAULT false,
    status public.salon_status DEFAULT 'DRAFT'::public.salon_status,
    rejected_reason text,
    owner_id uuid NOT NULL REFERENCES public.profiles(id),
    city_id uuid REFERENCES public.cities(id),
    district_id uuid REFERENCES public.districts(id),
    type_id uuid REFERENCES public.salon_types(id),
    geo_latitude numeric(10,8),
    geo_longitude numeric(11,8),
    location public.geometry(Point,4326),
    features jsonb DEFAULT '[]'::jsonb,
    tags text[] DEFAULT '{}'::text[],
    rating double precision DEFAULT 0,
    review_count integer DEFAULT 0,
    min_price numeric(10,2) DEFAULT 0,
    plan text DEFAULT 'STARTER' CHECK (plan IN ('STARTER', 'PRO', 'BUSINESS', 'ELITE')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Staff & Working Hours
CREATE TABLE IF NOT EXISTS public.staff (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    name text NOT NULL,
    role text,
    phone text,
    photo text,
    user_id uuid REFERENCES public.profiles(id),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.salon_working_hours (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    day_of_week integer NOT NULL,
    start_time time NOT NULL DEFAULT '09:00:00',
    end_time time NOT NULL DEFAULT '19:00:00',
    is_closed boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    UNIQUE(salon_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS public.working_hours (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    day_of_week integer NOT NULL,
    start_time time NOT NULL,
    end_time time NOT NULL,
    is_day_off boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    UNIQUE(staff_id, day_of_week)
);

-- Services
CREATE TABLE IF NOT EXISTS public.salon_services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    global_service_id uuid NOT NULL REFERENCES public.global_services(id),
    price numeric(10,2) NOT NULL,
    duration_min integer NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    UNIQUE(salon_id, global_service_id)
);

CREATE TABLE IF NOT EXISTS public.staff_services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    salon_service_id uuid NOT NULL REFERENCES public.salon_services(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(staff_id, salon_service_id)
);

-- Appointments
CREATE TABLE IF NOT EXISTS public.appointments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id uuid REFERENCES public.profiles(id),
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    salon_service_id uuid NOT NULL REFERENCES public.salon_services(id),
    staff_id uuid REFERENCES public.staff(id),
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
    first_name text,
    last_name text,
    email text,
    customer_phone text,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Reviews & Gallery
CREATE TABLE IF NOT EXISTS public.reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id),
    appointment_id uuid REFERENCES public.appointments(id),
    user_name text NOT NULL,
    user_avatar text,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    is_verified boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.salon_gallery (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    display_order integer DEFAULT 0,
    is_cover boolean DEFAULT false,
    caption text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.review_images (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Subscription System
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    display_name text NOT NULL,
    description text,
    price_monthly integer NOT NULL DEFAULT 0,
    price_yearly integer DEFAULT 0,
    max_branches integer DEFAULT 1,
    max_staff integer DEFAULT 3,
    max_gallery_photos integer DEFAULT 3,
    max_sms_monthly integer DEFAULT 0,
    has_advanced_reports boolean DEFAULT false,
    has_campaigns boolean DEFAULT false,
    has_sponsored boolean DEFAULT false,
    support_level text DEFAULT 'STANDARD',
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

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

-- 4. VIEWS (Latest Standard)

CREATE OR REPLACE VIEW public.salon_details AS
SELECT
    s.id, s.name, s.slug, s.description, s.features, s.tags,
    s.address, s.neighborhood, s.avenue, s.street, s.building_no, s.apartment_no, s.postal_code,
    s.phone, s.image, s.logo_url, s.banner_url, s.primary_color,
    s.geo_latitude, s.geo_longitude,
    s.status, s.is_sponsored, s.is_closed, s.rejected_reason, s.plan, s.min_price,
    s.owner_id, s.city_id, s.district_id, s.type_id,
    COALESCE(c.name, 'Bilinmiyor') AS city_name,
    COALESCE(d.name, 'Bilinmiyor') AS district_name,
    COALESCE(st.name, 'Genel')     AS type_name,
    COALESCE(st.slug, 'genel')     AS type_slug,
    COALESCE(
        (SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug, 'is_primary', sat.is_primary))
         FROM public.salon_assigned_types sat
         JOIN public.salon_types t ON t.id = sat.type_id
         WHERE sat.salon_id = s.id),
        '[]'::json
    ) AS assigned_types,
    COALESCE(
        (SELECT json_agg(json_build_object(
            'day_of_week', swh.day_of_week,
            'start_time', swh.start_time,
            'end_time', swh.end_time,
            'is_closed', swh.is_closed
        ) ORDER BY swh.day_of_week)
         FROM public.salon_working_hours swh
         WHERE swh.salon_id = s.id),
        '[]'::json
    ) AS working_hours,
    count(r.id) as review_count,
    avg(r.rating) as average_rating,
    s.created_at, s.updated_at
FROM public.salons s
LEFT JOIN public.cities      c  ON c.id  = s.city_id
LEFT JOIN public.districts   d  ON d.id  = s.district_id
LEFT JOIN public.salon_types st ON st.id = s.type_id
LEFT JOIN public.reviews     r  ON r.salon_id = s.id
GROUP BY s.id, c.name, d.name, st.name, st.slug;

-- 5. STORAGE CONFIG (Professional Reset)

-- Reset
DO $$ BEGIN
    EXECUTE (SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON storage.objects;', ' ')
             FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects');
END $$;

-- Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('salon-images', 'salon-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
    ('staff-photos', 'staff-photos', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
    ('avatars', 'avatars', true, 1048576, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
    ('reviews', 'reviews', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
    ('system-assets', 'system-assets', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml', 'image/gif', 'application/json'])
ON CONFLICT (id) DO UPDATE SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Policies
CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (bucket_id IN ('salon-images', 'staff-photos', 'avatars', 'reviews', 'system-assets'));

CREATE POLICY "Owners Manage Staff Photos" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'staff-photos' AND (storage.foldername(storage.objects.name))[1] = auth.uid()::text);

CREATE POLICY "Users Manage Own Avatar" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(storage.objects.name))[1] = auth.uid()::text);

CREATE POLICY "Users Manage Own Review Images" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'reviews' AND (storage.foldername(storage.objects.name))[1] = auth.uid()::text);

-- 6. RLS & PERMISSIONS

ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public select salons" ON public.salons FOR SELECT USING (true);
CREATE POLICY "Owners manage salons" ON public.salons FOR ALL USING (owner_id = auth.uid());

-- Permissions
GRANT SELECT ON public.salons TO anon, authenticated;
GRANT SELECT ON public.salon_details TO anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;

-- ============================================================
-- SETUP COMPLETE
-- ============================================================
