-- FORCE PUBLIC READ ACCESS ON MENU TABLES

-- 1. Salon Types
ALTER TABLE public.salon_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read salon_types" ON public.salon_types;
CREATE POLICY "Public read salon_types" ON public.salon_types FOR SELECT USING (true);

-- 2. Service Categories
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read service_categories" ON public.service_categories;
CREATE POLICY "Public read service_categories" ON public.service_categories FOR SELECT USING (true);

-- 3. Global Services
ALTER TABLE public.global_services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read global_services" ON public.global_services;
CREATE POLICY "Public read global_services" ON public.global_services FOR SELECT USING (true);

-- 4. Verify Policies
SELECT * FROM pg_policies WHERE tablename IN ('salon_types', 'service_categories', 'global_services');
