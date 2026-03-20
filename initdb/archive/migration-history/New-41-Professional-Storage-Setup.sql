-- ============================================================
-- New-41-Professional-Storage-Setup.sql
-- Tüm Storage Yapısını Sıfırlama ve Profesyonel Yapılandırma
-- ============================================================

-- 1. MEVCUT POLİTİKALARI TEMİZLE (Çakışmaları önlemek için)
DO $$ 
BEGIN
    -- Tüm storage.objects politikalarını sil
    EXECUTE (
        SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON storage.objects;', ' ')
        FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects'
    );
END $$;

-- 2. BUCKET'LARI OLUŞTUR / GÜNCELLE
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('salon-images', 'salon-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('staff-photos', 'staff-photos', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('avatars', 'avatars', true, 1048576, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('reviews', 'reviews', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('system-assets', 'system-assets', true, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. GENEL OKUMA İZNİ (Tüm Public Bucket'lar için)
CREATE POLICY "Public Read Access" ON storage.objects 
FOR SELECT USING (
    bucket_id IN ('salon-images', 'staff-photos', 'avatars', 'reviews', 'system-assets')
);

-- 4. SALON GÖRSELLERİ POLİTİKALARI (salon-images)
-- Kural: Kullanıcı salonun sahibi olmalıdır. (Klasör adı = salon_id)
CREATE POLICY "Salon Owners Manage Gallery" ON storage.objects 
FOR ALL TO authenticated
USING (
    bucket_id = 'salon-images' AND 
    EXISTS (
        SELECT 1 FROM public.salons 
        WHERE id::text = (storage.foldername(storage.objects.name))[1] 
        AND owner_id = auth.uid()
    )
)
WITH CHECK (
    bucket_id = 'salon-images' AND 
    EXISTS (
        SELECT 1 FROM public.salons 
        WHERE id::text = (storage.foldername(storage.objects.name))[1] 
        AND owner_id = auth.uid()
    )
);

-- 5. PERSONEL FOTOĞRAFLARI POLİTİKALARI (staff-photos)
-- Kural: Kullanıcı personelin bağlı olduğu salonun sahibi olmalıdır. (Klasör adı = staff_id)
CREATE POLICY "Salon Owners Manage Staff photos" ON storage.objects 
FOR ALL TO authenticated
USING (
    bucket_id = 'staff-photos' AND 
    EXISTS (
        SELECT 1 FROM public.staff st
        JOIN public.salons s ON st.salon_id = s.id
        WHERE st.id::text = (storage.foldername(storage.objects.name))[1] 
        AND s.owner_id = auth.uid()
    )
)
WITH CHECK (
    bucket_id = 'staff-photos' AND 
    EXISTS (
        SELECT 1 FROM public.staff st
        JOIN public.salons s ON st.salon_id = s.id
        WHERE st.id::text = (storage.foldername(storage.objects.name))[1] 
        AND s.owner_id = auth.uid()
    )
);

-- 6. PROFİL FOTOĞRAFLARI POLİTİKALARI (avatars)
-- Kural: Kullanıcı sadece kendi klasörünü yönetebilir. (Klasör adı = user_id)
CREATE POLICY "Users Manage Own Avatar" ON storage.objects 
FOR ALL TO authenticated
USING (
    bucket_id = 'avatars' AND 
    (storage.foldername(storage.objects.name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'avatars' AND 
    (storage.foldername(storage.objects.name))[1] = auth.uid()::text
);

-- 7. YORUM GÖRSELLERİ POLİTİKALARI (reviews)
-- Kural: Kullanıcı sadece kendi yorumuna resim ekleyebilir. (Klasör adı = user_id)
CREATE POLICY "Users Manage Own Review Images" ON storage.objects 
FOR ALL TO authenticated
USING (
    bucket_id = 'reviews' AND 
    (storage.foldername(storage.objects.name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'reviews' AND 
    (storage.foldername(storage.objects.name))[1] = auth.uid()::text
);

-- 8. SİSTEM VARLIKLARI (Admin Only)
CREATE POLICY "Admins Manage System Assets" ON storage.objects 
FOR ALL TO authenticated
USING (
    bucket_id = 'system-assets' AND 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
);
