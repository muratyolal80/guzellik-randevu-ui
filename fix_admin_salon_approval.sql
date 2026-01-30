-- ADMIN SALON APPROVAL FIX

-- Admin can UPDATE any salon's status (for approval/rejection)
DROP POLICY IF EXISTS "Admins can update any salon" ON public.salons;

CREATE POLICY "Admins can update any salon"
ON public.salons FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'SUPER_ADMIN'
    )
);
