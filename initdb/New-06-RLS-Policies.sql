-- RLS Policies - Comprehensive Security configuration

-- 1. ENABLE RLS FOR ALL TABLES
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iys_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_assigned_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_memberships ENABLE ROW LEVEL SECURITY;
 ALTER TABLE public.salon_working_hours ENABLE ROW LEVEL SECURITY;
 ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 2. MASTER DATA (Public Read-Only)
-- Cities
DROP POLICY IF EXISTS "Public read cities" ON public.cities;
CREATE POLICY "Public read cities" ON public.cities FOR SELECT USING (true);

-- Districts
DROP POLICY IF EXISTS "Public read districts" ON public.districts;
CREATE POLICY "Public read districts" ON public.districts FOR SELECT USING (true);

-- Salon Types
DROP POLICY IF EXISTS "Public read salon_types" ON public.salon_types;
CREATE POLICY "Public read salon_types" ON public.salon_types FOR SELECT USING (true);

-- Service Categories
DROP POLICY IF EXISTS "Public read service_categories" ON public.service_categories;
CREATE POLICY "Public read service_categories" ON public.service_categories FOR SELECT USING (true);

-- Global Services
DROP POLICY IF EXISTS "Public read global_services" ON public.global_services;
CREATE POLICY "Public read global_services" ON public.global_services FOR SELECT USING (true);

-- 3. PROFILES
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
CREATE POLICY "Public profiles are viewable" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 4. SALONS & ASSIGNED TYPES
DROP POLICY IF EXISTS "Public read salons" ON public.salons;
CREATE POLICY "Public read salons" ON public.salons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Access" ON public.salon_assigned_types;
CREATE POLICY "Public Read Access" ON public.salon_assigned_types FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners manage own salon types" ON public.salon_assigned_types;
CREATE POLICY "Owners manage own salon types" ON public.salon_assigned_types 
    FOR ALL USING (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()));

-- 5. SALON SERVICES
DROP POLICY IF EXISTS "Public can view salon services" ON public.salon_services;
CREATE POLICY "Public can view salon services" ON public.salon_services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners manage own salon services" ON public.salon_services;
CREATE POLICY "Owners manage own salon services" ON public.salon_services 
    FOR ALL USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));

-- 6. STAFF & WORKING HOURS
DROP POLICY IF EXISTS "Public view staff" ON public.staff;
CREATE POLICY "Public view staff" ON public.staff FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners manage staff" ON public.staff;
CREATE POLICY "Owners manage staff" ON public.staff 
    FOR ALL USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Public view working hours" ON public.working_hours;
CREATE POLICY "Public view working hours" ON public.working_hours FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners manage working hours" ON public.working_hours;
CREATE POLICY "Owners manage working hours" ON public.working_hours 
    FOR ALL USING (staff_id IN (SELECT id FROM public.staff WHERE salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())));

DROP POLICY IF EXISTS "Public view staff services" ON public.staff_services;
CREATE POLICY "Public view staff services" ON public.staff_services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners manage staff services" ON public.staff_services;
CREATE POLICY "Owners manage staff services" ON public.staff_services 
    FOR ALL USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));

-- 7. APPOINTMENTS (Müşteri & Salon Sahibi Erişimi)
DROP POLICY IF EXISTS "Customers view own appointments" ON public.appointments;
CREATE POLICY "Customers view own appointments" ON public.appointments FOR SELECT 
    USING (customer_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Salons view own appointments" ON public.appointments;
CREATE POLICY "Salons view own appointments" ON public.appointments FOR SELECT 
    USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));

-- 8. NOTIFICATIONS
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT 
    USING (auth.uid() = user_id);

-- 9. INVITES
DROP POLICY IF EXISTS "Invite access" ON public.invites;
CREATE POLICY "Invite access" ON public.invites FOR SELECT USING (true);

-- 10. SALON MEMBERSHIPS
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.salon_memberships;
CREATE POLICY "Users can view their own memberships" ON public.salon_memberships
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Owners manage memberships" ON public.salon_memberships;
CREATE POLICY "Owners manage memberships" ON public.salon_memberships
    FOR ALL USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));

-- 11. SALON WORKING HOURS
DROP POLICY IF EXISTS "Public read salon working hours" ON public.salon_working_hours;
CREATE POLICY "Public read salon working hours" ON public.salon_working_hours FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners manage salon working hours" ON public.salon_working_hours;
CREATE POLICY "Owners manage salon working hours" ON public.salon_working_hours 
    FOR ALL USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));

-- 12. REVIEWS
DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can leave reviews" ON public.reviews;
CREATE POLICY "Authenticated users can leave reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
