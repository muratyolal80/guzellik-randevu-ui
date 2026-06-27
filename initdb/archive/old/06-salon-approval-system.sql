-- 1. Create enum type for salon status (Expanded)
DO $$ BEGIN
    -- Drop old type and recreate to avoid conflicts if needed, or update. 
    -- Since it's an enum, we just add missing values if it exists, or create fresh.
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'salon_status') THEN
        CREATE TYPE salon_status AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'SUSPENDED');
    ELSE
        -- Helper to add values if type already exists from previous steps
        ALTER TYPE salon_status ADD VALUE IF NOT EXISTS 'DRAFT';
        ALTER TYPE salon_status ADD VALUE IF NOT EXISTS 'SUBMITTED';
        ALTER TYPE salon_status ADD VALUE IF NOT EXISTS 'SUSPENDED';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add columns to salons table
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS status salon_status DEFAULT 'DRAFT';
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS rejected_reason TEXT;

-- Migration fix: Update existing 'PENDING' to 'SUBMITTED' if they exist from previous simplified version
-- (Wait, if old version had PENDING, we map it to SUBMITTED)
-- UPDATE public.salons SET status = 'SUBMITTED' WHERE status::text = 'PENDING';
-- Note: If previous step used PENDING, we should ensure it maps. 
-- In my previous SQL I used PENDING/APPROVED/REJECTED. Let's merge.

-- 3. Update public.salon_details view to include status and rejected_reason
DROP VIEW IF EXISTS public.salon_details CASCADE;

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
    s.status,
    s.rejected_reason, -- NEW
    s.owner_id,
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
