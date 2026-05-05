-- New-17-Storage-RLS-Final.sql
-- Comprehensive Storage RLS Fix for Salon Images, Staff Photos and Reviews

-- 1. Ensure RLS is enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. SALON IMAGES POLICY
-- Allow salon owners to manage (Insert, Update, Delete, Select) files within their salon's folder.
-- Folder name must match Salon ID and auth.uid() must be the Salon Owner.
DROP POLICY IF EXISTS "Salon Owners Manage Gallery" ON storage.objects;
DROP POLICY IF EXISTS "salon_images_owner_manage" ON storage.objects;

CREATE POLICY "salon_images_owner_insert" ON storage.objects 
    FOR INSERT TO authenticated 
    WITH CHECK (
        bucket_id = 'salon-images' 
        AND (storage.foldername(name))[1] IN (
            SELECT id::text FROM public.salons WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "salon_images_owner_select" ON storage.objects 
    FOR SELECT TO authenticated 
    USING (
        bucket_id = 'salon-images' 
        AND (storage.foldername(name))[1] IN (
            SELECT id::text FROM public.salons WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "salon_images_owner_update" ON storage.objects 
    FOR UPDATE TO authenticated 
    USING (
        bucket_id = 'salon-images' 
        AND (storage.foldername(name))[1] IN (
            SELECT id::text FROM public.salons WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "salon_images_owner_delete" ON storage.objects 
    FOR DELETE TO authenticated 
    USING (
        bucket_id = 'salon-images' 
        AND (storage.foldername(name))[1] IN (
            SELECT id::text FROM public.salons WHERE owner_id = auth.uid()
        )
    );


-- 3. PUBLIC READ ACCESS
-- Allow anyone to view salon images (needed for customer side)
DROP POLICY IF EXISTS "Public View Salon Images" ON storage.objects;
CREATE POLICY "Public View Salon Images" ON storage.objects 
    FOR SELECT USING (bucket_id = 'salon-images');

-- 4. STAFF & REVIEWS (General Fix for consistency)
DROP POLICY IF EXISTS "Owners Manage Staff Photos" ON storage.objects;
CREATE POLICY "Owners Manage Staff Photos" ON storage.objects FOR ALL TO authenticated
USING (
    bucket_id = 'staff-photos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users Manage Own Review Images" ON storage.objects;
CREATE POLICY "Users Manage Own Review Images" ON storage.objects FOR ALL TO authenticated
USING (
    bucket_id = 'reviews' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);
