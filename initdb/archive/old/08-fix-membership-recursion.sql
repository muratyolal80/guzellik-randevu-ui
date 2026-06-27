-- Migration: Fix RLS Recursion in Membership Model
-- Purpose: Resolve the "infinite recursion detected in policy for relation 'salon_memberships'" error.

-- 1. Create a helper function to check salon ownership without triggering RLS recursively
-- SECURITY DEFINER allows the function to bypass RLS when checking the table
CREATE OR REPLACE FUNCTION public.check_is_salon_owner(p_salon_id UUID, p_user_id UUID) 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.salon_memberships 
        WHERE salon_id = p_salon_id 
        AND user_id = p_user_id 
        AND role = 'OWNER'
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the recursive policy
DROP POLICY IF EXISTS "Owners can manage memberships for their salons" ON public.salon_memberships;

-- 3. Create a clean, non-recursive policy for salon owners
-- This policy allows owners to view and manage all memberships for their salons
CREATE POLICY "Owners can manage memberships" ON public.salon_memberships
    FOR ALL 
    TO authenticated
    USING (
        check_is_salon_owner(salon_id, auth.uid()) 
        OR user_id = auth.uid()
    );

-- 4. Ensure Super Admins can also manage memberships
-- We can add this to the same policy or a separate one
CREATE POLICY "SuperAdmins can manage all memberships" ON public.salon_memberships
    FOR ALL
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
    );

-- 5. Fix Salons INSERT policy (Owner must be able to create a salon)
-- Add a policy that allows owners to insert into salons
DROP POLICY IF EXISTS "Owners can create salons" ON public.salons;
CREATE POLICY "Owners can create salons" ON public.salons
    FOR INSERT
    TO authenticated
    WITH CHECK (true); -- We can refine this later if needed, but unblock for now

-- 6. Important: Update the salons viewing policy to also include the owner check
-- to ensure the person who just created it can see it.
DROP POLICY IF EXISTS "Members can view their salons" ON public.salons;
CREATE POLICY "Members or Owners can view their salons" ON public.salons
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.salon_memberships WHERE salon_id = public.salons.id AND user_id = auth.uid())
        OR owner_id = auth.uid() -- Keep owner_id check for fallback/creation phase
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
    );
