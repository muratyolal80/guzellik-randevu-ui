-- Migration: Database Schema Enhancements (SAFEST VERSION)
-- Purpose: Add new informational columns without affecting existing data.

-- 1. ADD NEW COLUMNS TO SALONS TABLE
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;

-- 2. ADD NEW COLUMNS TO STAFF TABLE
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS bio TEXT;

-- 3. CREATE SALON WORKING HOURS TABLE
CREATE TABLE IF NOT EXISTS public.salon_working_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday... 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_closed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(salon_id, day_of_week)
);

-- Enable RLS
ALTER TABLE public.salon_working_hours ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policy for safety
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public Read Access" ON public.salon_working_hours;
    DROP POLICY IF EXISTS "Owners update own salon hours" ON public.salon_working_hours;
END $$;

CREATE POLICY "Public Read Access" ON public.salon_working_hours FOR SELECT USING (true);
CREATE POLICY "Owners update own salon hours" ON public.salon_working_hours FOR ALL 
    USING (auth.uid() IN (SELECT owner_id FROM public.salons WHERE id = salon_working_hours.salon_id));

-- 4. UPDATE VIEW (DROP & RECREATE IS REQUIRED BY POSTGRES TO CHANGE COLUMNS)
DROP VIEW IF EXISTS public.salon_details CASCADE;

CREATE OR REPLACE VIEW public.salon_details WITH (security_invoker = on) AS
SELECT
    s.id,
    s.name,
    s.description, -- NEW
    s.features,    -- NEW
    s.address,
    s.phone,
    s.geo_latitude,
    s.geo_longitude,
    s.image,
    s.is_sponsored,
    c.name AS city_name,
    d.name AS district_name,
    st.name AS type_name,
    st.slug AS type_slug,
    sr.review_count,
    sr.average_rating,
    s.created_at
FROM public.salons s
         JOIN public.cities c ON s.city_id = c.id
         JOIN public.districts d ON s.district_id = d.id
         JOIN public.salon_types st ON s.type_id = st.id
         LEFT JOIN public.salon_ratings sr ON s.id = sr.salon_id;
