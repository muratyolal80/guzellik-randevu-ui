-- COMPLETE ADMIN RLS FIX - Including SELECT permission

-- Drop old admin-only UPDATE policy
DROP POLICY IF EXISTS "Admins can update any salon" ON public.salons;

-- Create comprehensive admin policy for SELECT + UPDATE
CREATE POLICY "Admins can view all salons"
ON public.salons FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'SUPER_ADMIN'
    )
);

CREATE POLICY "Admins can update any salon"
ON public.salons FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'SUPER_ADMIN'
    )
);
