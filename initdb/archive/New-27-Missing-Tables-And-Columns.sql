-- =============================================
-- New-27-Missing-Tables-And-Columns.sql
-- salons tablosuna eksik kolonlar ekle
-- Eksik tabloları oluştur: salon_working_hours, salon_assigned_types, staff, reviews, salon_memberships
-- salon_service_details view'ını oluştur
-- =============================================

-- ============================================
-- 1. SALONS TABLOSUNA EKSİK KOLONLARI EKLE
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
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS banner_url text;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#D4A574';

-- ============================================
-- 2. SALON_WORKING_HOURS TABLOSU
-- ============================================
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

-- ============================================
-- 3. SALON_ASSIGNED_TYPES TABLOSU
-- ============================================
CREATE TABLE IF NOT EXISTS public.salon_assigned_types (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id bigint NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    type_id uuid NOT NULL REFERENCES public.salon_types(id) ON DELETE CASCADE,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(salon_id, type_id)
);

-- ============================================
-- 4. STAFF TABLOSU
-- ============================================
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

-- ============================================
-- 5. STAFF_SERVICES (SKILLS) TABLOSU
-- ============================================
CREATE TABLE IF NOT EXISTS public.staff_services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    salon_id bigint NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    salon_service_id uuid NOT NULL REFERENCES public.salon_services(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(staff_id, salon_service_id)
);

-- ============================================
-- 6. WORKING_HOURS (STAFF) TABLOSU
-- ============================================
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

-- ============================================
-- 7. REVIEWS TABLOSU
-- ============================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id bigint NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id),
    appointment_id uuid REFERENCES public.appointments(id),
    user_name text NOT NULL,
    user_avatar text,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    is_verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- 8. SALON_MEMBERSHIPS TABLOSU
-- ============================================
CREATE TABLE IF NOT EXISTS public.salon_memberships (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id bigint NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role text DEFAULT 'STAFF',
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(salon_id, user_id)
);

-- ============================================
-- 9. FAVORITES TABLOSU (IF NOT EXISTS)
-- ============================================
CREATE TABLE IF NOT EXISTS public.favorites (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    salon_id bigint NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, salon_id)
);

-- ============================================
-- 10. SALON_TYPE_CATEGORIES (JOIN TABLE)
-- ============================================
CREATE TABLE IF NOT EXISTS public.salon_type_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_type_id uuid NOT NULL REFERENCES public.salon_types(id) ON DELETE CASCADE,
    service_category_id uuid NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(salon_type_id, service_category_id)
);

-- ============================================
-- 11. RLS POLİTİKALARI
-- ============================================

-- salon_working_hours
ALTER TABLE public.salon_working_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for salon_working_hours" ON public.salon_working_hours FOR SELECT USING (true);
CREATE POLICY "Owner/Admin can manage salon_working_hours" ON public.salon_working_hours FOR ALL USING (
    EXISTS (SELECT 1 FROM public.salons s WHERE s.id = salon_id AND s.owner_id::text = auth.uid()::text)
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
);

-- salon_assigned_types
ALTER TABLE public.salon_assigned_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for salon_assigned_types" ON public.salon_assigned_types FOR SELECT USING (true);
CREATE POLICY "Owner/Admin can manage salon_assigned_types" ON public.salon_assigned_types FOR ALL USING (
    EXISTS (SELECT 1 FROM public.salons s WHERE s.id = salon_id AND s.owner_id::text = auth.uid()::text)
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
);

-- staff
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for staff" ON public.staff FOR SELECT USING (true);
CREATE POLICY "Owner/Admin can manage staff" ON public.staff FOR ALL USING (
    EXISTS (SELECT 1 FROM public.salons s WHERE s.id = salon_id AND s.owner_id::text = auth.uid()::text)
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
);

-- reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

-- salon_memberships
ALTER TABLE public.salon_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for salon_memberships" ON public.salon_memberships FOR SELECT USING (true);
CREATE POLICY "Owner/Admin can manage salon_memberships" ON public.salon_memberships FOR ALL USING (
    EXISTS (SELECT 1 FROM public.salons s WHERE s.id = salon_id AND s.owner_id::text = auth.uid()::text)
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
);

-- favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own favorites" ON public.favorites;
CREATE POLICY "Users can manage own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Public read for favorites" ON public.favorites;
CREATE POLICY "Public read for favorites" ON public.favorites FOR SELECT USING (true);

-- salon_type_categories
ALTER TABLE public.salon_type_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for salon_type_categories" ON public.salon_type_categories FOR SELECT USING (true);
CREATE POLICY "Admin can manage salon_type_categories" ON public.salon_type_categories FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
);

-- staff_services
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for staff_services" ON public.staff_services FOR SELECT USING (true);
CREATE POLICY "Owner/Admin can manage staff_services" ON public.staff_services FOR ALL USING (
    EXISTS (SELECT 1 FROM public.salons s WHERE s.id = salon_id AND s.owner_id::text = auth.uid()::text)
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
);

-- working_hours (staff)
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for working_hours" ON public.working_hours FOR SELECT USING (true);
CREATE POLICY "Owner/Admin can manage working_hours" ON public.working_hours FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.staff st
        JOIN public.salons s ON s.id = st.salon_id
        WHERE st.id = staff_id AND s.owner_id::text = auth.uid()::text
    )
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
);
