-- ==========================================
-- SUPABASE STORAGE SETUP SCRIPT (Gelişmiş)
-- ==========================================
-- Bu script, projenizdeki veri tipleri analiz edilerek hazırlanmıştır.
-- Aşağıdaki bucketları ve güvenlik kurallarını oluşturur:
-- 1. avatars: Kullanıcı profil resimleri
-- 2. salon-images: Salon ana resimleri ve bannerları
-- 3. staff-photos: Personel fotoğrafları
-- 4. system-assets: Sistem ikonları ve kategori resimleri (Sadece Super Admin)

-- --------------------------------------------------------
-- 1. BUCKET OLUŞTURMA (Her biri public ve dosya limitli)
-- --------------------------------------------------------

-- Avatars (5MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Salon Images (10MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('salon-images', 'salon-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Staff Photos (5MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('staff-photos', 'staff-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- System Assets (2MB) - Kategori ikonları vb.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('system-assets', 'system-assets', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'])
ON CONFLICT (id) DO NOTHING;


-- --------------------------------------------------------
-- 2. POLICIES (GÜVENLİK KURALLARI)
-- --------------------------------------------------------

-- Temizlik
DROP POLICY IF EXISTS "Avatar Public View" ON storage.objects;
DROP POLICY IF EXISTS "Avatar User Upload" ON storage.objects;
DROP POLICY IF EXISTS "Avatar User Update" ON storage.objects;
DROP POLICY IF EXISTS "Avatar User Delete" ON storage.objects;

DROP POLICY IF EXISTS "Salon Public View" ON storage.objects;
DROP POLICY IF EXISTS "Salon Owner Manage" ON storage.objects;

DROP POLICY IF EXISTS "Staff Public View" ON storage.objects;
DROP POLICY IF EXISTS "Staff Owner Manage" ON storage.objects;

DROP POLICY IF EXISTS "System Public View" ON storage.objects;
DROP POLICY IF EXISTS "System Admin Manage" ON storage.objects;

-- --- AVATARS POLICIES ---
-- Herkes görebilir
CREATE POLICY "Avatar Public View" ON storage.objects FOR SELECT USING ( bucket_id = 'avatars' );

-- Kullanıcı sadece kendi klasörüne (userID/) yükleyebilir
CREATE POLICY "Avatar User Upload" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND auth.uid() = owner
);
-- Güncelleme
CREATE POLICY "Avatar User Update" ON storage.objects FOR UPDATE USING (
    bucket_id = 'avatars' AND auth.uid() = owner
);
-- Silme
CREATE POLICY "Avatar User Delete" ON storage.objects FOR DELETE USING (
    bucket_id = 'avatars' AND auth.uid() = owner
);


-- --- SALON IMAGES POLICIES ---
-- Herkes görebilir
CREATE POLICY "Salon Public View" ON storage.objects FOR SELECT USING ( bucket_id = 'salon-images' );

-- Sadece SALON_OWNER, ADMIN ve SUPER_ADMIN yükleyebilir
-- Not: Daha detaylı kontrol için kullanıcının salon sahibi olup olmadığına bakılabilir 
-- ama şimdilik rol bazlı izin yeterlidir.
CREATE POLICY "Salon Owner Manage" ON storage.objects FOR ALL USING (
    bucket_id = 'salon-images' 
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('SALON_OWNER', 'ADMIN', 'SUPER_ADMIN')
    )
);


-- --- STAFF PHOTOS POLICIES ---
-- Herkes görebilir
CREATE POLICY "Staff Public View" ON storage.objects FOR SELECT USING ( bucket_id = 'staff-photos' );

-- Salon Sahipleri ve Adminler yönetebilir
CREATE POLICY "Staff Owner Manage" ON storage.objects FOR ALL USING (
    bucket_id = 'staff-photos' 
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('SALON_OWNER', 'ADMIN', 'SUPER_ADMIN')
    )
);


-- --- SYSTEM ASSETS POLICIES ---
-- Herkes görebilir (İkonlar vs)
CREATE POLICY "System Public View" ON storage.objects FOR SELECT USING ( bucket_id = 'system-assets' );

-- Sadece SUPER_ADMIN yönetebilir (Sistem ikonlarını kimse bozamaz)
CREATE POLICY "System Admin Manage" ON storage.objects FOR ALL USING (
    bucket_id = 'system-assets' 
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'SUPER_ADMIN'
    )
);
