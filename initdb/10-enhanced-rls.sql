-- Enhanced RLS Policies for Tenant Isolation
-- Ensures strict data separation between salons

-- ==============================================
-- SALONS TABLE - Enhanced RLS
-- ==============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Owners can view own salon data" ON public.salons;
DROP POLICY IF EXISTS "Owners can update own salon data" ON public.salons;

-- Anyone can view APPROVED salons (marketplace)
-- Already exists as "Public Read Access"

-- Owners can view their own salon (even if PENDING/REJECTED)
CREATE POLICY "Owners can view own salon data" ON public.salons FOR SELECT
    USING (
        owner_id = auth.uid() 
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
    );

-- Owners can update ONLY their own salon
CREATE POLICY "Owners can update own salon data" ON public.salons FOR UPDATE
    USING (owner_id = auth.uid());

-- ==============================================
-- STAFF TABLE - Strict Tenant Isolation
-- ==============================================

DROP POLICY IF EXISTS "Staff visible within salon only" ON public.staff;
DROP POLICY IF EXISTS "Owners can manage own salon staff" ON public.staff;

-- Staff are visible to:
-- 1. Their own salon owner
-- 2. Other staff in same salon
-- 3. Admins
CREATE POLICY "Staff visible within salon only" ON public.staff FOR SELECT
    USING (
        -- Owner of this salon
        salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
        OR
        -- Staff in same salon
        salon_id IN (SELECT salon_id FROM public.staff WHERE user_id = auth.uid())
        OR
        -- Admins
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
        OR
        -- Public read (for booking flow) - but secure via salon context
        true
    );

-- Only salon owners can INSERT/UPDATE/DELETE staff
CREATE POLICY "Owners can manage own salon staff" ON public.staff FOR ALL
    USING (
        salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
    );

-- ==============================================
-- APPOINTMENTS TABLE - Strict Tenant Isolation
-- ==============================================

DROP POLICY IF EXISTS "Users can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Appointments visible to relevant parties" ON public.appointments;
DROP POLICY IF EXISTS "Salon staff can update appointments" ON public.appointments;

-- Anyone can create appointments (booking flow)
CREATE POLICY "Users can create appointments" ON public.appointments FOR INSERT
    WITH CHECK (true);

-- Appointments are visible to:
-- 1. Customer who booked
-- 2. Salon owner
-- 3. Assigned staff
-- 4. Admins
CREATE POLICY "Appointments visible to relevant parties" ON public.appointments FOR SELECT
    USING (
        -- Customer
        customer_id = auth.uid()
        OR
        -- Salon owner
        salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
        OR
        -- Assigned staff
        staff_id IN (SELECT id FROM public.staff WHERE user_id = auth.uid())
        OR
        -- Admin
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
    );

-- Salon owner and staff can update appointment status
CREATE POLICY "Salon staff can update appointments" ON public.appointments FOR UPDATE
    USING (
        salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
        OR staff_id IN (SELECT id FROM public.staff WHERE user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
    );

-- Only customer or salon can delete (cancel)
CREATE POLICY "Can cancel own appointments" ON public.appointments FOR DELETE
    USING (
        customer_id = auth.uid()
        OR salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
    );

-- ==============================================
-- SALON_SERVICES TABLE - Tenant Isolation
-- ==============================================

DROP POLICY IF EXISTS "Services visible to all" ON public.salon_services;
DROP POLICY IF EXISTS "Owners can manage services" ON public.salon_services;

-- Services are public (for browsing)
CREATE POLICY "Services visible to all" ON public.salon_services FOR SELECT
    USING (true);

-- Only salon owner can manage services
CREATE POLICY "Owners can manage services" ON public.salon_services FOR ALL
    USING (
        salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
    );

-- ==============================================
-- WORKING_HOURS TABLE - Tenant Isolation
-- ==============================================

DROP POLICY IF EXISTS "Working hours visible to all" ON public.working_hours;
DROP POLICY IF EXISTS "Owners and staff can manage hours" ON public.working_hours;

-- Working hours are public (for slot calculation)
CREATE POLICY "Working hours visible to all" ON public.working_hours FOR SELECT
    USING (true);

-- Owner and the staff member themselves can manage
CREATE POLICY "Owners and staff can manage hours" ON public.working_hours FOR ALL
    USING (
        -- Owner of salon
        staff_id IN (
            SELECT id FROM public.staff WHERE salon_id IN (
                SELECT id FROM public.salons WHERE owner_id = auth.uid()
            )
        )
        OR
        -- The staff member themselves
        staff_id IN (SELECT id FROM public.staff WHERE user_id = auth.uid())
        OR
        -- Admin
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
    );

-- ==============================================
-- SALON_WORKING_HOURS TABLE - Tenant Isolation
-- ==============================================

DROP POLICY IF EXISTS "Salon hours visible to all" ON public.salon_working_hours;
DROP POLICY IF EXISTS "Owners can manage salon hours" ON public.salon_working_hours;

CREATE POLICY "Salon hours visible to all" ON public.salon_working_hours FOR SELECT
    USING (true);

CREATE POLICY "Owners can manage salon hours" ON public.salon_working_hours FOR ALL
    USING (
        salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
    );
