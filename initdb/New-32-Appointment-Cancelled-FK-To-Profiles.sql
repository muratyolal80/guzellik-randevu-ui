-- ============================================================================
-- New-32: appointments.cancelled_by FK'sını profiles'a hizala (çakışma onarımı)
-- ----------------------------------------------------------------------------
-- SORUN: İki migration aynı kolonu farklı hedefe bağladı:
--   - New-31 (approval-tracking): cancelled_by → auth.users(id)
--   - New-26 (appointment-action-tracking): confirmed_by/completed_by → profiles(id)
-- AppointmentDetailModal, `profiles!appointments_cancelled_by_fkey(...)` ile embed
-- yapıyor; FK auth.users'a baktığı için PostgREST:
--   "Could not find a relationship between 'appointments' and 'profiles'..." hatası.
--
-- ÇÖZÜM: cancelled_by FK'sını profiles'a repoint et (confirmed/completed ile aynı).
--        profiles.id = auth.users.id olduğundan mevcut değerler güvenle taşınır.
-- ============================================================================

-- Güvenlik: profiles'da karşılığı olmayan cancelled_by referanslarını temizle.
UPDATE public.appointments a
SET cancelled_by = NULL
WHERE cancelled_by IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = a.cancelled_by);

ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_cancelled_by_fkey;
ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_cancelled_by_fkey
  FOREIGN KEY (cancelled_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- NOT: approved_by/approved_at (New-31) kanonik akışta kullanılmıyor (confirmed_by
--      kullanılıyor). Şimdilik bırakıldı; ileride temizlenebilir.

NOTIFY pgrst, 'reload schema';
