-- ============================================================================
-- New-31: appointments — onay izleme alanları (approved_by, approved_at)
-- ----------------------------------------------------------------------------
-- AMAÇ: Randevu onaylandığında KİMİN ve NE ZAMAN onayladığını kalıcı tut.
--       (Salon sahibi/personel randevuyu "Onayla" dediğinde set edilir.)
--       UI bunu "X tarafından onaylandı · <tarih>" olarak gösterir.
-- ============================================================================

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS approved_by  uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS approved_at  timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;

-- PostgREST şema cache'ini yenile (yeni kolonları görsün).
NOTIFY pgrst, 'reload schema';
