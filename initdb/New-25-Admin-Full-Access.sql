-- New-25-Admin-Full-Access.sql
-- Grant full access to SUPER_ADMIN for salons, gallery and storage

-- 1. PUBLIC.SALONS
-- Ensure SUPER_ADMIN can manage all salons
DROP POLICY IF EXISTS "Admins manage all salons" ON public.salons;
CREATE POLICY "Admins manage all salons" ON public.salons
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'SUPER_ADMIN'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'SUPER_ADMIN'
        )
    );

-- 2. PUBLIC.SALON_GALLERY
-- Ensure SUPER_ADMIN can manage all gallery items
DROP POLICY IF EXISTS "Admins manage all salon gallery" ON public.salon_gallery;
CREATE POLICY "Admins manage all salon gallery" ON public.salon_gallery
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'SUPER_ADMIN'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'SUPER_ADMIN'
        )
    );

-- 3. STORAGE.OBJECTS (salon-images bucket)
-- Ensure SUPER_ADMIN can manage all files in salon-images bucket
DROP POLICY IF EXISTS "Admins manage salon images" ON storage.objects;
CREATE POLICY "Admins manage salon images" ON storage.objects
    FOR ALL TO authenticated
    USING (
        bucket_id = 'salon-images' 
        AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'SUPER_ADMIN'
        )
    )
    WITH CHECK (
        bucket_id = 'salon-images' 
        AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'SUPER_ADMIN'
        )
    );

-- 4. GRANT PERMISSIONS (Just in case)
GRANT ALL ON public.salons TO authenticated;
GRANT ALL ON public.salon_gallery TO authenticated;
