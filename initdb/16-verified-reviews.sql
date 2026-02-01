-- Migration: Verified Reviews System
-- Description: Links reviews to completed appointments and provides a rich view for display

-- 1. Add appointment_id to reviews table
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE;

-- 2. Ensure one review per appointment
-- Safe constraint addition
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_review_per_appointment') THEN
        ALTER TABLE public.reviews
        ADD CONSTRAINT unique_review_per_appointment UNIQUE (appointment_id);
    END IF;
END $$;

-- 3. RLS Policy: Users can only create reviews for their OWN COMPLETED appointments
DROP POLICY IF EXISTS "Users can insert own profile" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews; 
DROP POLICY IF EXISTS "Users can create reviews for own completed appointments" ON public.reviews;

CREATE POLICY "Users can create reviews for own completed appointments"
ON public.reviews
FOR INSERT
WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
        SELECT 1 FROM public.appointments a
        WHERE a.id = appointment_id
        AND a.customer_id = auth.uid()
        AND a.status = 'COMPLETED'
    )
);

-- 4. Create View for Rich Review Display (Includes Service Name & Verification Status)
CREATE OR REPLACE VIEW public.verified_reviews_view WITH (security_invoker = on) AS
SELECT 
    r.id,
    r.salon_id,
    r.user_id,
    r.user_name,
    r.user_avatar,
    r.rating,
    r.comment,
    r.created_at,
    r.appointment_id,
    -- Enhanced Fields
    CASE WHEN r.appointment_id IS NOT NULL THEN true ELSE false END as is_verified,
    gs.name as service_name,
    appt.start_time as service_date
FROM public.reviews r
LEFT JOIN public.appointments appt ON r.appointment_id = appt.id
LEFT JOIN public.salon_services ss ON appt.salon_service_id = ss.id
LEFT JOIN public.global_services gs ON ss.global_service_id = gs.id;
