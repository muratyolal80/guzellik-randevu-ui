-- SALON RLS FIX - Only missing policies

-- Drop ONLY the ones we're recreating
DROP POLICY IF EXISTS "Public can view approved salons" ON public.salons;
DROP POLICY IF EXISTS "Owners can view own salons" ON public.salons;
DROP POLICY IF EXISTS "Owners can create salons" ON public.salons;
DROP POLICY IF EXISTS "Owners can update own salons" ON public.salons;
DROP POLICY IF EXISTS "Owners can delete own salons" ON public.salons;

-- Create all necessary policies fresh
CREATE POLICY "Public can view approved salons"
ON public.salons FOR SELECT
USING (status = 'APPROVED');

CREATE POLICY "Owners can view own salons"
ON public.salons FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can create salons"
ON public.salons FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own salons"
ON public.salons FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete own salons"
ON public.salons FOR DELETE
USING (auth.uid() = owner_id);
