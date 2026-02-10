-- ADD FEATURED COLUMN AND UPDATE VIEW
-- Ensures 'Featured Salons' section on homepage works correctly.

BEGIN;

-- 1. Add is_featured column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'salons' AND column_name = 'is_featured') THEN
        ALTER TABLE public.salons ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 2. Update salon_details VIEW to include new columns
DROP VIEW IF EXISTS public.salon_details;

CREATE OR REPLACE VIEW public.salon_details AS
SELECT 
    s.id,
    s.name,
    s.image,
    s.rating,
    s.address,
    c.name AS city,
    d.name AS district,
    st.name AS type_name,
    st.slug AS type_slug,
    s.city_id,
    s.district_id,
    s.type_id,
    s.owner_id,
    s.status,
    s.created_at,
    s.is_sponsored,
    s.is_featured, -- Added this
    s.geo_latitude,
    s.geo_longitude,
    -- Calculate starting price from services (min price)
    COALESCE((SELECT MIN(price) FROM salon_services ss WHERE ss.salon_id = s.id), 0) as "startPrice",
    -- Aggregate tags from services
    ARRAY(SELECT DISTINCT name FROM global_services gs JOIN salon_services ss ON gs.id = ss.service_id WHERE ss.salon_id = s.id LIMIT 5) as tags
FROM 
    public.salons s
LEFT JOIN 
    public.cities c ON s.city_id = c.id
LEFT JOIN 
    public.districts d ON s.district_id = d.id
LEFT JOIN 
    public.salon_types st ON s.type_id = st.id;

-- 3. Mark random salons as 'Featured' and 'Sponsored' for demo purposes
UPDATE public.salons SET is_featured = true WHERE id IN (SELECT id FROM public.salons ORDER BY random() LIMIT 4);
UPDATE public.salons SET is_sponsored = true WHERE id IN (SELECT id FROM public.salons ORDER BY random() LIMIT 2);

-- 4. Mark specific 'Cem' salons as featured to be easily found by user
UPDATE public.salons SET is_featured = true, is_sponsored = true WHERE name LIKE '%Cem%';

COMMIT;
