-- STORAGE POLICIES (supabase_storage_admin ile çalıştır)

-- RLS aç
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Eski politikaları sil
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- PUBLIC READ için herkes
CREATE POLICY "Public bucket read access"
ON storage.buckets FOR SELECT
USING (true);

-- AVATARS bucket politikaları
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' 
    AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

CREATE POLICY "Users can update avatars"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' 
    AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

CREATE POLICY "Users can delete avatars"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' 
    AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

-- SALON IMAGES (public)
CREATE POLICY "Salon images publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'salon-images');

CREATE POLICY "Users can upload salon images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'salon-images' AND auth.role() = 'authenticated');

-- STAFF PHOTOS (public)
CREATE POLICY "Staff photos publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'staff-photos');

CREATE POLICY "Users can upload staff photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'staff-photos' AND auth.role() = 'authenticated');
