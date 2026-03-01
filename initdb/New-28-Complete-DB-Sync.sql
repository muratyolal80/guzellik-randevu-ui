-- =============================================
-- New-28-Complete-DB-Sync.sql (SELF-CONTAINED)
-- New-27 + New-28 birleştirildi. Tek başına çalıştırılabilir.
-- Tüm ifadeler idempotent: IF NOT EXISTS, DROP...IF EXISTS
-- =============================================

-- Ensure roles exist for Supabase-like environment
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated;
    END IF;
END $$;

-- ============================================
-- 1. SALONS TABLOSUNA TÜM EKSİK KOLONLAR
-- ============================================
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS slug character varying(255);
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS neighborhood character varying(255);
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS avenue character varying(255);
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS street character varying(255);
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS building_no character varying(50);
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS apartment_no character varying(50);
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS postal_code character varying(20);
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[];
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS is_closed boolean DEFAULT false;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS plan text DEFAULT 'FREE';
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS min_price numeric(10,2) DEFAULT 0;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS rating double precision DEFAULT 0;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS banner_url text;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#D4A574';
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- ============================================
-- 2. SALON_SERVICES TABLOSUNA EKSİK KOLONLAR
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='salon_services' AND column_name='global_service_id') THEN
        ALTER TABLE public.salon_services ADD COLUMN global_service_id uuid REFERENCES public.global_services(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='salon_services' AND column_name='is_active') THEN
        ALTER TABLE public.salon_services ADD COLUMN is_active boolean DEFAULT true;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='salon_services' AND column_name='duration_minutes')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='salon_services' AND column_name='duration_min') THEN
        ALTER TABLE public.salon_services RENAME COLUMN duration_minutes TO duration_min;
    END IF;
END $$;

-- ============================================
-- 3. GLOBAL_SERVICES EKSİK KOLONLAR
-- ============================================
ALTER TABLE public.global_services ADD COLUMN IF NOT EXISTS avg_duration_min integer DEFAULT 30;
ALTER TABLE public.global_services ADD COLUMN IF NOT EXISTS avg_price numeric(10,2) DEFAULT 0;

-- ============================================
-- 4. APPOINTMENTS EKSİK KOLONLAR
-- ============================================
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS staff_id uuid;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS salon_service_id uuid;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS customer_phone text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS email text;

-- ============================================
-- 5. EKSİK TABLOLAR (CREATE IF NOT EXISTS)
-- ============================================

-- salon_working_hours
CREATE TABLE IF NOT EXISTS public.salon_working_hours (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id bigint NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL DEFAULT '09:00:00',
    end_time time without time zone NOT NULL DEFAULT '19:00:00',
    is_closed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(salon_id, day_of_week)
);

-- salon_assigned_types
CREATE TABLE IF NOT EXISTS public.salon_assigned_types (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id bigint NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    type_id uuid NOT NULL REFERENCES public.salon_types(id) ON DELETE CASCADE,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(salon_id, type_id)
);

-- staff
CREATE TABLE IF NOT EXISTS public.staff (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id bigint NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    name text NOT NULL,
    role text,
    phone text,
    photo text,
    user_id uuid REFERENCES public.profiles(id),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- staff_services
CREATE TABLE IF NOT EXISTS public.staff_services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    salon_id bigint NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    salon_service_id bigint NOT NULL REFERENCES public.salon_services(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(staff_id, salon_service_id)
);

-- working_hours (staff)
CREATE TABLE IF NOT EXISTS public.working_hours (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    is_day_off boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(staff_id, day_of_week)
);

-- reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id bigint NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id),
    appointment_id bigint REFERENCES public.appointments(id),
    user_name text NOT NULL,
    user_avatar text,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    is_verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- salon_memberships
CREATE TABLE IF NOT EXISTS public.salon_memberships (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id bigint NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role text DEFAULT 'STAFF',
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(salon_id, user_id)
);

-- salon_favorites (Renamed from favorites for align)
CREATE TABLE IF NOT EXISTS public.salon_favorites (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, salon_id)
);

-- salon_type_categories
CREATE TABLE IF NOT EXISTS public.salon_type_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_type_id uuid NOT NULL REFERENCES public.salon_types(id) ON DELETE CASCADE,
    service_category_id uuid NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(salon_type_id, service_category_id)
);

-- salon_gallery
CREATE TABLE IF NOT EXISTS public.salon_gallery (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id bigint NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    caption text,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- review_images
CREATE TABLE IF NOT EXISTS public.review_images (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- 6. VIEWS (DROP CASCADE + RECREATE)
-- ============================================
DROP VIEW IF EXISTS public.salon_details_with_membership CASCADE;
DROP VIEW IF EXISTS public.salon_details CASCADE;
DROP VIEW IF EXISTS public.verified_reviews_view CASCADE;
DROP VIEW IF EXISTS public.staff_reviews_detailed CASCADE;
DROP VIEW IF EXISTS public.salon_service_details CASCADE;

-- A. SALON_DETAILS
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
    s.review_count,
    s.rating AS average_rating,
    s.created_at, s.updated_at
FROM public.salons s
LEFT JOIN public.cities      c  ON c.id  = s.city_id
LEFT JOIN public.districts   d  ON d.id  = s.district_id
LEFT JOIN public.salon_types st ON st.id = s.type_id;

-- B. SALON_DETAILS_WITH_MEMBERSHIP
CREATE OR REPLACE VIEW public.salon_details_with_membership AS
SELECT sd.*, 'OWNER'::TEXT AS user_role, sd.owner_id::TEXT AS current_user_id
FROM public.salon_details sd;

-- C. SALON_SERVICE_DETAILS
CREATE OR REPLACE VIEW public.salon_service_details AS
SELECT
    ss.id, 
    ss.salon_id, 
    ss.price, 
    COALESCE(ss.duration_min, ss.duration_minutes) as duration_min, 
    COALESCE(ss.is_active, true) as is_active,
    COALESCE(ss.name, gs.name) AS service_name, 
    sc.name AS category_name,
    sc.icon AS category_icon, 
    sc.slug AS category_slug,
    s.name AS salon_name
FROM public.salon_services ss
LEFT JOIN public.global_services gs ON gs.id = ss.global_service_id
LEFT JOIN public.service_categories sc ON sc.id = gs.category_id
JOIN public.salons s ON s.id = ss.salon_id;

-- D. VERIFIED_REVIEWS_VIEW
CREATE OR REPLACE VIEW public.verified_reviews_view AS
SELECT
    r.id, r.salon_id, r.user_id, r.appointment_id, r.rating, r.comment, r.created_at,
    COALESCE(p.full_name, r.user_name) AS user_name,
    COALESCE(p.avatar_url, r.user_avatar) AS user_avatar,
    a.start_time AS service_date,
    gs.service_name AS service_name,
    (r.appointment_id IS NOT NULL) AS is_verified
FROM public.reviews r
LEFT JOIN public.profiles p ON p.id = r.user_id
LEFT JOIN public.appointments a ON a.id = r.appointment_id
LEFT JOIN public.salon_service_details gs ON gs.id = a.salon_service_id;

-- E. STAFF_REVIEWS_DETAILED (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='staff_reviews') THEN
        EXECUTE '
            CREATE OR REPLACE VIEW public.staff_reviews_detailed AS
            SELECT sr.id, sr.staff_id, sr.salon_id, sr.user_id, sr.appointment_id,
                   sr.rating, sr.comment, sr.is_verified, sr.created_at,
                   s.name AS staff_name, s.photo AS staff_photo,
                   COALESCE(p.full_name, sr.user_name) AS user_name,
                   COALESCE(p.avatar_url, sr.user_avatar) AS user_avatar
            FROM public.staff_reviews sr
            JOIN public.staff s ON s.id = sr.staff_id
            LEFT JOIN public.profiles p ON p.id = sr.user_id';
    END IF;
END $$;

-- ============================================
-- 7. RLS POLİTİKALARI (idempotent: DROP IF EXISTS + CREATE)
-- ============================================

-- salon_working_hours
ALTER TABLE public.salon_working_hours ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read salon working hours" ON public.salon_working_hours;
CREATE POLICY "Public read salon working hours" ON public.salon_working_hours FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owners manage salon working hours" ON public.salon_working_hours;
CREATE POLICY "Owners manage salon working hours" ON public.salon_working_hours
    FOR ALL USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));
DROP POLICY IF EXISTS "Admins manage all salon working hours" ON public.salon_working_hours;
CREATE POLICY "Admins manage all salon working hours" ON public.salon_working_hours FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN'));

-- salon_assigned_types
ALTER TABLE public.salon_assigned_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON public.salon_assigned_types;
CREATE POLICY "Public Read Access" ON public.salon_assigned_types FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owners manage own salon types" ON public.salon_assigned_types;
CREATE POLICY "Owners manage own salon types" ON public.salon_assigned_types
    FOR ALL USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()))
    WITH CHECK (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));

-- staff
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public view staff" ON public.staff;
CREATE POLICY "Public view staff" ON public.staff FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owners manage staff" ON public.staff;
CREATE POLICY "Owners manage staff" ON public.staff
    FOR ALL USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));
DROP POLICY IF EXISTS "Admins manage all staff" ON public.staff;
CREATE POLICY "Admins manage all staff" ON public.staff FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN'));

-- staff_services
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public view staff services" ON public.staff_services;
CREATE POLICY "Public view staff services" ON public.staff_services FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owners manage staff services" ON public.staff_services;
CREATE POLICY "Owners manage staff services" ON public.staff_services
    FOR ALL USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));
DROP POLICY IF EXISTS "Admins manage all staff services" ON public.staff_services;
CREATE POLICY "Admins manage all staff services" ON public.staff_services FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN'));

-- working_hours (staff)
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public view working hours" ON public.working_hours;
CREATE POLICY "Public view working hours" ON public.working_hours FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owners manage working hours" ON public.working_hours;
CREATE POLICY "Owners manage working hours" ON public.working_hours
    FOR ALL USING (staff_id IN (SELECT id FROM public.staff WHERE salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())));
DROP POLICY IF EXISTS "Admins manage all working hours" ON public.working_hours;
CREATE POLICY "Admins manage all working hours" ON public.working_hours FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN'));

-- reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can leave reviews" ON public.reviews;
CREATE POLICY "Authenticated users can leave reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- salon_memberships
ALTER TABLE public.salon_memberships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.salon_memberships;
CREATE POLICY "Users can view their own memberships" ON public.salon_memberships FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Owners manage memberships" ON public.salon_memberships;
CREATE POLICY "Owners manage memberships" ON public.salon_memberships
    FOR ALL USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));
DROP POLICY IF EXISTS "Admins manage all memberships" ON public.salon_memberships;
CREATE POLICY "Admins manage all memberships" ON public.salon_memberships FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN'));

-- salon_favorites
ALTER TABLE public.salon_favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own favorites" ON public.salon_favorites;
CREATE POLICY "Users manage own favorites" ON public.salon_favorites FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Public read favorites" ON public.salon_favorites;
CREATE POLICY "Public read favorites" ON public.salon_favorites FOR SELECT USING (true);

-- salon_type_categories
ALTER TABLE public.salon_type_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read salon_type_categories" ON public.salon_type_categories;
CREATE POLICY "Public read salon_type_categories" ON public.salon_type_categories FOR SELECT USING (true);

-- salon_gallery
ALTER TABLE public.salon_gallery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read salon_gallery" ON public.salon_gallery;
CREATE POLICY "Public read salon_gallery" ON public.salon_gallery FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owners manage salon_gallery" ON public.salon_gallery;
CREATE POLICY "Owners manage salon_gallery" ON public.salon_gallery
    FOR ALL USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));

-- review_images
ALTER TABLE public.review_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read review_images" ON public.review_images;
CREATE POLICY "Public read review_images" ON public.review_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated insert review_images" ON public.review_images;
CREATE POLICY "Authenticated insert review_images" ON public.review_images FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- appointments (write policies)
DROP POLICY IF EXISTS "Customers can create appointments" ON public.appointments;
CREATE POLICY "Customers can create appointments" ON public.appointments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Salon owners manage appointments" ON public.appointments;
CREATE POLICY "Salon owners manage appointments" ON public.appointments
    FOR UPDATE USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));
DROP POLICY IF EXISTS "Admins manage all appointments" ON public.appointments;
CREATE POLICY "Admins manage all appointments" ON public.appointments FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN'));

-- ============================================
-- 8. VIEW YETKILERI
-- ============================================
GRANT SELECT ON public.salon_details TO anon, authenticated;
GRANT SELECT ON public.salon_details_with_membership TO authenticated;
GRANT SELECT ON public.salon_service_details TO anon, authenticated;
GRANT SELECT ON public.verified_reviews_view TO anon, authenticated;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema='public' AND table_name='staff_reviews_detailed') THEN
        EXECUTE 'GRANT SELECT ON public.staff_reviews_detailed TO anon, authenticated';
    END IF;
END $$;

-- =============================================
-- TAMAMLANDI: New-28-Complete-DB-Sync.sql
-- =============================================
