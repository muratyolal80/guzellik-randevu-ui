-- Skill Mapping Feature
-- Allows specific staff members to perform only specific services

-- 1. Create Junction Table: staff_salon_services
-- Links Staff members to the Salon Services they are qualified for.
CREATE TABLE IF NOT EXISTS public.staff_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    salon_service_id UUID NOT NULL REFERENCES public.salon_services(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicates: A staff can only be assigned to the same service once
    UNIQUE(staff_id, salon_service_id)
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_services_staff ON public.staff_services(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_services_service ON public.staff_services(salon_service_id);

-- 3. RLS
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;

-- 3a. Read: Public can read (for booking engine filtering)
CREATE POLICY "Public Read Access" ON public.staff_services FOR SELECT USING (true);

-- 3b. Write: Only Salon Owners and Admins can manage skills
CREATE POLICY "Owners manage skills" ON public.staff_services FOR ALL
    USING (
        salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
    );
