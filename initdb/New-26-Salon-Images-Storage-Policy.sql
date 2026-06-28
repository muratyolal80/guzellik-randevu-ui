-- ============================================================================
-- New-26: salon-images storage bucket — owner yükleme (INSERT/UPDATE/DELETE) RLS
-- ----------------------------------------------------------------------------
-- SORUN: storage.objects'te 'salon-images' için yalnızca public SELECT politikası
--        vardı; INSERT/ALL politikası YOKTU. Bu yüzden salon sahibi kapak/galeri
--        fotoğrafı yüklerken "new row violates row-level security policy" alıyordu.
--        (staff-photos, avatars, reviews bucket'larında bu politika vardı, salon-images atlanmış.)
--
-- ÇÖZÜM: authenticated kullanıcı 'salon-images' bucket'ına yalnızca KENDİ alanına yazabilir:
--          - <uid>/...        → ImageUpload.tsx (kapak/temel bilgiler) yolu (klasör = auth.uid())
--          - <salonId>/...    → SalonGalleryManager.tsx (galeri) yolu (klasör = sahibi olduğu salon)
--        Public okuma (mevcut "Public View Salon Images" / "Public Read Access") korunur.
--
-- Not: storage.objects'te authenticated için temel GRANT'lar Supabase varsayılanıyla
--      mevcut (avatars/staff-photos yüklemeleri çalışıyor); eksik olan SADECE bu politikaydı.
-- ============================================================================

DROP POLICY IF EXISTS "Owners Manage Salon Images" ON storage.objects;

CREATE POLICY "Owners Manage Salon Images" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'salon-images'
    AND (
      (storage.foldername(name))[1] = (auth.uid())::text
      OR (storage.foldername(name))[1] IN (
        SELECT id::text FROM public.salons WHERE owner_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    bucket_id = 'salon-images'
    AND (
      (storage.foldername(name))[1] = (auth.uid())::text
      OR (storage.foldername(name))[1] IN (
        SELECT id::text FROM public.salons WHERE owner_id = auth.uid()
      )
    )
  );
