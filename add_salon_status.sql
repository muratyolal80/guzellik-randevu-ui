-- Create the salon_status enum if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'salon_status') THEN
        CREATE TYPE salon_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add status column to salons table with default 'PENDING'
ALTER TABLE public.salons 
ADD COLUMN IF NOT EXISTS status salon_status DEFAULT 'PENDING';

-- Create an index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_salons_status ON public.salons(status);

-- Update existing salons to APPROVED so the current site doesn't break completely
UPDATE public.salons SET status = 'APPROVED' WHERE status IS NULL OR status = 'PENDING';

-- Update the salon_details view to include status
DROP VIEW IF EXISTS public.salon_details;
CREATE OR REPLACE VIEW salon_details WITH (security_invoker = on) AS
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
    s.status, -- NEW COLUMN
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
         LEFT JOIN salon_ratings sr ON s.id = sr.salon_id;
