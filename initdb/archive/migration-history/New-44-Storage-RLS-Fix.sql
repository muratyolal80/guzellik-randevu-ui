-- =============================================================================
-- New-44-Storage-RLS-Fix.sql
-- Staff-photos ve Reviews bucket'ları için yönetim yetkileri (RLS)
-- =============================================================================

-- 1. Staff Photos Yönetim Yetkisi
-- ImageUpload bileşeni dosyaları 'USER_ID/filename' formatında kaydettiği için
-- klasör adının kullanıcının kendi ID'si olması durumunda tam yetki veriyoruz.
DROP POLICY IF EXISTS "Owners Manage Staff Photos" ON storage.objects;
CREATE POLICY "Owners Manage Staff Photos" ON storage.objects FOR ALL TO authenticated
USING (
    bucket_id = 'staff-photos' 
    AND (storage.foldername(storage.objects.name))[1] = auth.uid()::text
);

-- 2. Review Images Yönetim Yetkisi
-- Yorum yapan kullanıcıların kendi görsellerini yükleyebilmesi için
DROP POLICY IF EXISTS "Users Manage Own Review Images" ON storage.objects;
CREATE POLICY "Users Manage Own Review Images" ON storage.objects FOR ALL TO authenticated
USING (
    bucket_id = 'reviews' 
    AND (storage.foldername(storage.objects.name))[1] = auth.uid()::text
);

-- 3. Salon Images Düzeltmesi (Garantiye alalım)
-- Klasör adının Salon ID olması durumunda Salon Sahibine yetki veriyoruz.
DROP POLICY IF EXISTS "Salon Owners Manage Gallery" ON storage.objects;
CREATE POLICY "Salon Owners Manage Gallery" ON storage.objects FOR ALL TO authenticated
USING (
    bucket_id = 'salon-images' 
    AND EXISTS (
        SELECT 1 FROM public.salons 
        WHERE id::text = (storage.foldername(storage.objects.name))[1] 
        AND owner_id = auth.uid()
    )
);
