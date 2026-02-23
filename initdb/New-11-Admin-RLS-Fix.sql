-- Add SUPER_ADMIN access to business-related tables

-- 1. SALON SERVICES
DROP POLICY IF EXISTS "Admins manage salon services" ON public.salon_services;
CREATE POLICY "Admins manage salon services" ON public.salon_services FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'SUPER_ADMIN'
        )
    );

-- 2. STAFF
DROP POLICY IF EXISTS "Admins manage staff" ON public.staff;
CREATE POLICY "Admins manage staff" ON public.staff FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'SUPER_ADMIN'
        )
    );

-- 3. STAFF WORKING HOURS
DROP POLICY IF EXISTS "Admins manage staff working hours" ON public.working_hours;
CREATE POLICY "Admins manage staff working hours" ON public.working_hours FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'SUPER_ADMIN'
        )
    );

-- 4. STAFF SERVICES
DROP POLICY IF EXISTS "Admins manage staff services" ON public.staff_services;
CREATE POLICY "Admins manage staff services" ON public.staff_services FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'SUPER_ADMIN'
        )
    );

-- 5. SALON WORKING HOURS
DROP POLICY IF EXISTS "Admins manage salon working hours" ON public.salon_working_hours;
CREATE POLICY "Admins manage salon working hours" ON public.salon_working_hours FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'SUPER_ADMIN'
        )
    );

-- 6. SALON MEMBERSHIPS
DROP POLICY IF EXISTS "Admins manage salon memberships" ON public.salon_memberships;
CREATE POLICY "Admins manage salon memberships" ON public.salon_memberships FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'SUPER_ADMIN'
        )
    );

-- 7. REVIEWS
DROP POLICY IF EXISTS "Admins manage reviews" ON public.reviews;
CREATE POLICY "Admins manage reviews" ON public.reviews FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'SUPER_ADMIN'
        )
    );
-- 8. SALON ASSIGNED TYPES
DROP POLICY IF EXISTS "Admins manage salon assigned types" ON public.salon_assigned_types;
CREATE POLICY "Admins manage salon assigned types" ON public.salon_assigned_types FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'SUPER_ADMIN'
        )
    );
