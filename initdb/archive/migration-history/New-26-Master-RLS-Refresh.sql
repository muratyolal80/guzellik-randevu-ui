-- New-26-Master-RLS-Refresh.sql
-- Güzellik Randevu Platformu - Merkezi RLS Politikaları Yenileme (v1.0)
-- Bu betik, Admin, Owner, Customer ve Staff rolleri için yetki matrisini standartlaştırır.

-- 0. YARDIMCI FONKSİYON: Admin mi?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin profiles access" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Admin full access profiles" ON public.profiles FOR ALL USING (public.is_admin());
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- 2. SALONS
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select salons" ON public.salons;
DROP POLICY IF EXISTS "Owners manage salons" ON public.salons;
DROP POLICY IF EXISTS "Owners can update their own salons" ON public.salons;
DROP POLICY IF EXISTS "Admins manage all salons" ON public.salons;

CREATE POLICY "Public select salons" ON public.salons FOR SELECT USING (true);
CREATE POLICY "Admin full access salons" ON public.salons FOR ALL USING (public.is_admin());
CREATE POLICY "Owners insert own salon" ON public.salons FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners update own salon" ON public.salons FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
-- NOTE: DELETE yetkisi Owner için verilmedi (Kullanıcı talebi).

-- 3. SALON_SERVICES (Packages)
ALTER TABLE public.salon_services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public view services" ON public.salon_services;
DROP POLICY IF EXISTS "Owners manage services" ON public.salon_services;

CREATE POLICY "Public view services" ON public.salon_services FOR SELECT USING (true);
CREATE POLICY "Admin full access services" ON public.salon_services FOR ALL USING (public.is_admin());
CREATE POLICY "Owners manage own services" ON public.salon_services FOR ALL 
USING (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()));

-- Override DELETE for Owner on services if needed, but the user said "cannot delete".
-- We achieve this by only allowing SELECT/INSERT/UPDATE for Owner if we want to be strict.
DROP POLICY IF EXISTS "Owners manage own services" ON public.salon_services;
CREATE POLICY "Owners insert services" ON public.salon_services FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()));
CREATE POLICY "Owners update services" ON public.salon_services FOR UPDATE USING (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()));
CREATE POLICY "Owners select services" ON public.salon_services FOR SELECT USING (true);

-- 4. STAFF
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owners manage staff" ON public.staff;
DROP POLICY IF EXISTS "Public view staff" ON public.staff;

CREATE POLICY "Public view staff" ON public.staff FOR SELECT USING (true);
CREATE POLICY "Admin full access staff" ON public.staff FOR ALL USING (public.is_admin());
CREATE POLICY "Owners manage staff" ON public.staff FOR ALL 
USING (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()));

-- 5. APPOINTMENTS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Customer manage own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Staff view assigned appointments" ON public.appointments;
DROP POLICY IF EXISTS "Owners view salon appointments" ON public.appointments;

CREATE POLICY "Admin full access appointments" ON public.appointments FOR ALL USING (public.is_admin());

CREATE POLICY "Customer manage own appointments" ON public.appointments FOR ALL
USING (customer_id = auth.uid()) 
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Owners view salon appointments" ON public.appointments FOR SELECT
USING (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()));

CREATE POLICY "Owners update salon appointments" ON public.appointments FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()));

CREATE POLICY "Staff view assigned appointments" ON public.appointments FOR SELECT
USING (staff_id IN (SELECT id FROM public.staff WHERE user_id = auth.uid()));

-- 6. REVIEWS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users manage own reviews" ON public.reviews;

CREATE POLICY "Public view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Admin full access reviews" ON public.reviews FOR ALL USING (public.is_admin());
CREATE POLICY "Users manage own reviews" ON public.reviews FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 7. PUBLIC REFERENCE TABLES (Implicitly RLS Enabled in master or New-16)
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read references" ON public.cities;
DROP POLICY IF EXISTS "Public read references" ON public.districts;
DROP POLICY IF EXISTS "Public read references" ON public.salon_types;
DROP POLICY IF EXISTS "Public read references" ON public.service_categories;
DROP POLICY IF EXISTS "Public read references" ON public.global_services;

CREATE POLICY "Public view cities" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Public view districts" ON public.districts FOR SELECT USING (true);
CREATE POLICY "Public view salon_types" ON public.salon_types FOR SELECT USING (true);
CREATE POLICY "Public view service_categories" ON public.service_categories FOR SELECT USING (true);
CREATE POLICY "Public view global_services" ON public.global_services FOR SELECT USING (true);

-- Admin manage references
CREATE POLICY "Admin manage cities" ON public.cities FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage districts" ON public.districts FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage salon_types" ON public.salon_types FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage service_categories" ON public.service_categories FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage global_services" ON public.global_services FOR ALL USING (public.is_admin());

-- 8. SUBSCRIPTIONS (Owner can insert/update, not delete)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own salon subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert their own salon subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins manage all subscriptions" ON public.subscriptions;

CREATE POLICY "Admin full access subscriptions" ON public.subscriptions FOR ALL USING (public.is_admin());
CREATE POLICY "Owners view own subscriptions" ON public.subscriptions FOR SELECT
USING (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()));
CREATE POLICY "Owners insert own subscriptions" ON public.subscriptions FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()));
CREATE POLICY "Owners update own subscriptions" ON public.subscriptions FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()));

-- 9. GALLERY
ALTER TABLE public.salon_gallery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public view gallery" ON public.salon_gallery;
DROP POLICY IF EXISTS "Owners manage gallery" ON public.salon_gallery;
DROP POLICY IF EXISTS "Admins manage all salon gallery" ON public.salon_gallery;

CREATE POLICY "Public view gallery" ON public.salon_gallery FOR SELECT USING (true);
CREATE POLICY "Admin full access gallery" ON public.salon_gallery FOR ALL USING (public.is_admin());
CREATE POLICY "Owners manage gallery" ON public.salon_gallery FOR ALL
USING (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()));

-- 10. WORKING HOURS
ALTER TABLE public.salon_working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public view salon hours" ON public.salon_working_hours;
DROP POLICY IF EXISTS "Owners manage salon hours" ON public.salon_working_hours;
DROP POLICY IF EXISTS "Public view staff hours" ON public.working_hours;
DROP POLICY IF EXISTS "Owners manage staff hours" ON public.working_hours;

CREATE POLICY "Public view salon hours" ON public.salon_working_hours FOR SELECT USING (true);
CREATE POLICY "Admin full access salon hours" ON public.salon_working_hours FOR ALL USING (public.is_admin());
CREATE POLICY "Owners manage salon hours" ON public.salon_working_hours FOR ALL 
USING (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()));

CREATE POLICY "Public view staff hours" ON public.working_hours FOR SELECT USING (true);
CREATE POLICY "Admin full access staff hours" ON public.working_hours FOR ALL USING (public.is_admin());
CREATE POLICY "Owners manage staff hours" ON public.working_hours FOR ALL 
USING (EXISTS (SELECT 1 FROM public.staff s JOIN public.salons sl ON s.salon_id = sl.id WHERE s.id = staff_id AND sl.owner_id = auth.uid()));

-- 11. REVIEW IMAGES
ALTER TABLE public.review_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public view review images" ON public.review_images;
DROP POLICY IF EXISTS "Users manage review images" ON public.review_images;

CREATE POLICY "Public view review images" ON public.review_images FOR SELECT USING (true);
CREATE POLICY "Admin full access review images" ON public.review_images FOR ALL USING (public.is_admin());
CREATE POLICY "Users manage review images" ON public.review_images FOR ALL
USING (EXISTS (SELECT 1 FROM public.reviews WHERE id = review_id AND user_id = auth.uid()));

-- 12. SALON ASSIGNED TYPES
ALTER TABLE public.salon_assigned_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public view salon assigned types" ON public.salon_assigned_types;
DROP POLICY IF EXISTS "Owners manage salon assigned types" ON public.salon_assigned_types;

CREATE POLICY "Public view salon assigned types" ON public.salon_assigned_types FOR SELECT USING (true);
CREATE POLICY "Admin full access salon assigned types" ON public.salon_assigned_types FOR ALL USING (public.is_admin());
CREATE POLICY "Owners manage salon assigned types" ON public.salon_assigned_types FOR ALL
USING (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()));
