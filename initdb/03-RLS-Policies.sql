-- =============================================
-- 03-RLS-Policies.sql
-- Bu dosya, tüm tabloların satır seviyesi güvenlik (Row Level Security)
-- politikalarını ve View'lar için GRANTS (yetki) tanımlarını içerir.
-- VDS tabanındaki politikaların üzerine çalışır ve eksikleri tamamlar.
-- =============================================

-- ------------------------------------------------------------------------------------------------
-- 1. YENİ EKLENEN VEYA GÜNCELLENEN TABLOLARIN RLS POLİTİKALARI
-- ------------------------------------------------------------------------------------------------

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

-- ------------------------------------------------------------------------------------------------
-- 2. VIEW YETKİLERİ (GRANTS)
-- ------------------------------------------------------------------------------------------------

GRANT SELECT ON public.salon_details TO anon, authenticated;
GRANT SELECT ON public.salon_details_with_membership TO authenticated;
GRANT SELECT ON public.salon_service_details TO anon, authenticated;
GRANT SELECT ON public.verified_reviews_view TO anon, authenticated;

-- staff_reviews_detailed view'ı varsa yetkilendir
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema='public' AND table_name='staff_reviews_detailed') THEN
        EXECUTE 'GRANT SELECT ON public.staff_reviews_detailed TO anon, authenticated';
    END IF;
END $$;
