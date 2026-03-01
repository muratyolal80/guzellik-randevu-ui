-- Description: Enforces verified staff reviews by linking them to completed appointments
-- Step 1: Add uniqueness constraint to appointment_id in staff_reviews
-- Step 2: Update RLS policies to restrict inserts to owners of completed appointments

-- 1. Ensure appointment_id is unique per staff review
ALTER TABLE public.staff_reviews 
DROP CONSTRAINT IF EXISTS staff_reviews_appointment_id_key;

-- Cleanup: Remove duplicate appointment_id if they exist
WITH duplicates AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY appointment_id ORDER BY created_at DESC) as rn
    FROM public.staff_reviews
    WHERE appointment_id IS NOT NULL
)
DELETE FROM public.staff_reviews
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

ALTER TABLE public.staff_reviews
ADD CONSTRAINT staff_reviews_appointment_id_key UNIQUE (appointment_id);

-- 2. Update RLS Policies
DROP POLICY IF EXISTS "auth_users_create_staff_review" ON public.staff_reviews;
DROP POLICY IF EXISTS "Users can create staff reviews for own completed appointments" ON public.staff_reviews;


CREATE POLICY "Users can create staff reviews for own completed appointments"
ON public.staff_reviews
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.appointments a
        WHERE a.id = staff_reviews.appointment_id
        AND a.customer_id = auth.uid()
        AND a.status = 'COMPLETED'
        AND a.staff_id = staff_reviews.staff_id
    )
);

-- Users can only delete their own reviews (existing policy: users_delete_own_staff_review)
-- No changes needed if already tied to user_id = auth.uid()

-- 3. Ensure is_verified is computed correctly in future views if needed
-- (Current table has is_verified column, we can update it based on appointment_id)
UPDATE public.staff_reviews SET is_verified = true WHERE appointment_id IS NOT NULL;
