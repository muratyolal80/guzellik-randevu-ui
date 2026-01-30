-- Complete RLS Policy Fix for Salons

-- 1. Drop ALL existing policies on salons
DROP POLICY IF EXISTS "Public Read Access" ON public.salons;
DROP POLICY IF EXISTS "Owners update own salon" ON public.salons;
DROP POLICY IF EXISTS "public_read_salons" ON public.salons;

-- 2. CREATE comprehensive policies

-- Public can view APPROVED salons
CREATE POLICY "Public can view approved salons"
ON public.salons FOR SELECT
USING (status = 'APPROVED');

-- Owners can view their OWN salons (any status)
CREATE POLICY "Owners can view own salons"
ON public.salons FOR SELECT
USING (auth.uid() = owner_id);

-- Owners can INSERT new salons
CREATE POLICY "Owners can create salons"
ON public.salons FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Owners can UPDATE their own salons
CREATE POLICY "Owners can update own salons"
ON public.salons FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Owners can DELETE their own salons
CREATE POLICY "Owners can delete own salons"
ON public.salons FOR DELETE
USING (auth.uid() = owner_id);

-- 3. Ensure RLS is enabled
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
