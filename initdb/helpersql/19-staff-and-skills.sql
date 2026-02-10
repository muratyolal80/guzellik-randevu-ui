-- 19-staff-and-skills.sql
-- Purpose: Migration to add staff management and service assignment for existing DBs.

-- Create Staff Table
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id BIGINT NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT,
    phone TEXT,
    photo TEXT,
    user_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Working Hours Table
CREATE TABLE IF NOT EXISTS public.working_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME WITHOUT TIME ZONE NOT NULL,
    end_time TIME WITHOUT TIME ZONE NOT NULL,
    is_day_off BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Staff Services (Skills) Junction Table
CREATE TABLE IF NOT EXISTS public.staff_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id BIGINT NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    salon_service_id BIGINT NOT NULL REFERENCES public.salon_services(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(staff_id, salon_service_id)
);

-- RLS
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Staff
DROP POLICY IF EXISTS "Public can view staff" ON public.staff;
CREATE POLICY "Public can view staff" ON public.staff FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can manage staff" ON public.staff;
CREATE POLICY "Owners can manage staff" ON public.staff FOR ALL 
    USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));

-- 2. Working Hours
DROP POLICY IF EXISTS "Public can view working hours" ON public.working_hours;
CREATE POLICY "Public can view working hours" ON public.working_hours FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can manage working hours" ON public.working_hours;
CREATE POLICY "Owners can manage working hours" ON public.working_hours FOR ALL
    USING (staff_id IN (SELECT id FROM public.staff WHERE salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())));

-- 3. Staff Services
DROP POLICY IF EXISTS "Public can view staff services" ON public.staff_services;
CREATE POLICY "Public can view staff services" ON public.staff_services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can manage staff services" ON public.staff_services;
CREATE POLICY "Owners can manage staff services" ON public.staff_services FOR ALL
    USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));
