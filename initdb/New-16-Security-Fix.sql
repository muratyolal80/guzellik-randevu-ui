-- New-16-Security-Fix.sql
-- Fixes RLS policies for Onboarding flow

-- 1. SUBSCRIPTIONS RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own salon's subscriptions
DROP POLICY IF EXISTS "Users can view their own salon subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view their own salon subscriptions" ON public.subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.salons 
            WHERE salons.id = subscriptions.salon_id 
            AND salons.owner_id = auth.uid()
        )
    );

-- Allow users to insert a subscription for their own salon
DROP POLICY IF EXISTS "Users can insert their own salon subscriptions" ON public.subscriptions;
CREATE POLICY "Users can insert their own salon subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.salons 
            WHERE salons.id = salon_id 
            AND salons.owner_id = auth.uid()
        )
    );

-- 2. SALONS RLS UPDATE
-- Ensure owners can update their draft salons during onboarding
DROP POLICY IF EXISTS "Owners can update their own salons" ON public.salons;
CREATE POLICY "Owners can update their own salons" ON public.salons
    FOR UPDATE USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- 3. ADMIN ACCESS (Cleanup/Safety)
-- Ensure admins have full access to subscriptions
DROP POLICY IF EXISTS "Admins manage all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins manage all subscriptions" ON public.subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'SUPER_ADMIN'
        )
    );

-- 4. SALON TYPES (Fix for onboarding dropdowns)
ALTER TABLE public.salon_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view salon types" ON public.salon_types;
CREATE POLICY "Public can view salon types" ON public.salon_types
    FOR SELECT USING (true);
