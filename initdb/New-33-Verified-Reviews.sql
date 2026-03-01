-- 0. Ensure is_verified column exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reviews' AND column_name='is_verified') THEN
        ALTER TABLE public.reviews ADD COLUMN is_verified boolean DEFAULT false;
    END IF;
END $$;

-- 1. Ensure appointment_id is unique per review
ALTER TABLE public.reviews 
DROP CONSTRAINT IF EXISTS reviews_appointment_id_key;

-- Cleanup: Remove duplicate appointment_id if they exist
WITH duplicates AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY appointment_id ORDER BY created_at DESC) as rn
    FROM public.reviews
    WHERE appointment_id IS NOT NULL
)
DELETE FROM public.reviews
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

ALTER TABLE public.reviews
ADD CONSTRAINT reviews_appointment_id_key UNIQUE (appointment_id);

-- 2. Update RLS Policies
DROP POLICY IF EXISTS "Authenticated users can leave reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews for own completed appointments" ON public.reviews;

-- Cleanup: Remove reviews without appointment_id to enforce verified reviews (Optional - based on business rule)
-- DELETE FROM public.reviews WHERE appointment_id IS NULL;

CREATE POLICY "Users can create reviews for own completed appointments"
ON public.reviews
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.appointments a
        WHERE a.id = reviews.appointment_id
        AND a.customer_id = auth.uid()
        AND a.status = 'COMPLETED'
    )
);

-- Users can only update their own reviews
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
CREATE POLICY "Users can update own reviews"
ON public.reviews
FOR UPDATE
USING (user_id = auth.uid());

-- 3. Update the view
DROP VIEW IF EXISTS public.verified_reviews_view CASCADE;

CREATE OR REPLACE VIEW public.verified_reviews_view AS
SELECT 
    r.id,
    r.salon_id,
    r.user_id,
    r.appointment_id,
    r.user_name,
    r.user_avatar,
    r.rating,
    r.comment,
    (r.is_verified OR r.appointment_id IS NOT NULL) as is_verified,
    r.created_at,
    a.start_time as service_date,
    gs.name as service_name
FROM public.reviews r
LEFT JOIN public.appointments a ON r.appointment_id = a.id
LEFT JOIN public.salon_services ss ON a.salon_service_id = ss.id
LEFT JOIN public.global_services gs ON ss.global_service_id = gs.id;

GRANT SELECT ON public.verified_reviews_view TO anon, authenticated;
