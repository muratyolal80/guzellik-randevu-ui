-- ============================================================
-- New-30-Admin-Avatar-Storage-Policy.sql
-- Adminlerin Tüm Avatarları Yönetebilmesi İçin Politika Güncellemesi
-- ============================================================

-- 1. Mevcut kısıtlı politikayı Adminleri kapsayacak şekilde genişlet veya yeni ekle
-- Not: Mevcut "Users Manage Own Avatar" politikası kalsın (kendi resimleri için).
-- Adminler için her şeye izin veren yeni bir politika ekliyoruz.

CREATE POLICY "Admins Manage All Avatars" ON storage.objects 
FOR ALL TO authenticated
USING (
    bucket_id = 'avatars' AND 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (role = 'SUPER_ADMIN' OR role = 'ADMIN')
    )
)
WITH CHECK (
    bucket_id = 'avatars' AND 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (role = 'SUPER_ADMIN' OR role = 'ADMIN')
    )
);

-- Bu politika ile Adminler artık 'avatars' bucket'ındaki tüm alt klasörlere (user-id) 
-- müdahale edebilir hale geldi.
