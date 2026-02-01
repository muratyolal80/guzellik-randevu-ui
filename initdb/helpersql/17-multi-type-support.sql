-- Migration: Multi-Category Salon Support
-- Date: 2026-02-01
-- Description: Adds a many-to-many relationship table for salon types

-- 1. Create the relation table
CREATE TABLE IF NOT EXISTS public.salon_assigned_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    type_id UUID NOT NULL REFERENCES public.salon_types(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(salon_id, type_id)
);

-- 2. Enable RLS
ALTER TABLE public.salon_assigned_types ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Public read access
DROP POLICY IF EXISTS "Public Read Access" ON public.salon_assigned_types;
CREATE POLICY "Public Read Access" ON public.salon_assigned_types FOR SELECT USING (true);

-- Owners can manage their own salon types
DROP POLICY IF EXISTS "Owners manage own salon types" ON public.salon_assigned_types;
CREATE POLICY "Owners manage own salon types" ON public.salon_assigned_types 
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.salons 
            WHERE id = salon_assigned_types.salon_id 
            AND owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.salons 
            WHERE id = salon_assigned_types.salon_id 
            AND owner_id = auth.uid()
        )
    );

-- 4. Initial Migration Logic (Optional but recommended)
-- Populate the new table with existing data from salons table
INSERT INTO public.salon_assigned_types (salon_id, type_id, is_primary)
SELECT id, type_id, true
FROM public.salons
ON CONFLICT (salon_id, type_id) DO NOTHING;

-- 5. Update salon_details view to include all types as an array
DROP VIEW IF EXISTS public.salon_details;
CREATE OR REPLACE VIEW public.salon_details WITH (security_invoker = on) AS
SELECT
    s.id,
    s.name,
    s.description,
    s.features,
    s.address,
    s.phone,
    s.geo_latitude,
    s.geo_longitude,
    s.image,
    s.is_sponsored,
    c.name AS city_name,
    d.name AS district_name,
    st.name AS type_name, -- Primary Type Name
    st.slug AS type_slug, -- Primary Type Slug
    -- Aggregate all assigned types
    (
        SELECT array_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug, 'is_primary', sat.is_primary))
        FROM public.salon_assigned_types sat
        JOIN public.salon_types t ON sat.type_id = t.id
        WHERE sat.salon_id = s.id
    ) AS assigned_types,
    sr.review_count,
    sr.average_rating,
    s.created_at,
    s.owner_id,  -- Added owner_id for permission checks
    s.status     -- Added status for filtering
FROM public.salons s
         JOIN public.cities c ON s.city_id = c.id
         JOIN public.districts d ON s.district_id = d.id
         JOIN public.salon_types st ON s.type_id = st.id
         LEFT JOIN salon_ratings sr ON s.id = sr.salon_id;
