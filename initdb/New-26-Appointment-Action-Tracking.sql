-- =============================================================================
-- New-26-Appointment-Action-Tracking.sql
-- Amaç: Randevu durumu değiştiren kişiyi izle (confirmed_by, completed_by,
--       cancelled_by). 'Leyla Çelebi onayladı · 28 Haz 2026 · 22:56' bilgisi
--       için audit_logs'a ek olarak doğrudan kolonlarda da tut.
-- =============================================================================
--
-- Kullanım:
--   confirmed_by   = PENDING → CONFIRMED yapan user_id + confirmed_at
--   completed_by   = CONFIRMED → COMPLETED yapan user_id + completed_at
--   cancelled_by   = X → CANCELLED yapan user_id + cancelled_at
--                    (NULL ise sistem/cron iptal etti veya migrate öncesi kayıt)
--
-- audit_logs zaten changes JSON'da bu bilgiyi tutuyor; bu kolonlar UI'da hızlı
-- gösterim için (JOIN profiles ile isim/email çekilir).
-- =============================================================================

-- Idempotent kolon ekleme
ALTER TABLE public.appointments
    ADD COLUMN IF NOT EXISTS confirmed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
    ADD COLUMN IF NOT EXISTS completed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS completed_at timestamptz,
    ADD COLUMN IF NOT EXISTS cancelled_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
    ADD COLUMN IF NOT EXISTS cancellation_reason text;

CREATE INDEX IF NOT EXISTS idx_appointments_confirmed_by ON public.appointments(confirmed_by) WHERE confirmed_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_completed_by ON public.appointments(completed_by) WHERE completed_by IS NOT NULL;

-- Geriye dönük: audit_logs'tan confirmed_by çıkar
-- (Sadece son CONFIRMED action'ı). Yeni randevular API'den otomatik gelir.
UPDATE public.appointments a
SET
    confirmed_by = al.user_id,
    confirmed_at = al.created_at
FROM (
    SELECT DISTINCT ON (resource_id)
        resource_id, user_id, created_at, changes
    FROM public.audit_logs
    WHERE resource_type = 'appointments'
      AND action = 'UPDATE'
      AND changes->>'new' ILIKE '%CONFIRMED%'
    ORDER BY resource_id, created_at DESC
) al
WHERE a.id = al.resource_id::uuid
  AND a.confirmed_by IS NULL
  AND a.status IN ('CONFIRMED', 'COMPLETED'); -- geçerli geçişler

-- _migrations kaydı
INSERT INTO public._migrations (name, applied_at)
VALUES ('New-26-Appointment-Action-Tracking.sql', NOW())
ON CONFLICT (name) DO NOTHING;

DO $$
DECLARE
    col_count int;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='appointments'
      AND column_name IN ('confirmed_by','completed_by','cancelled_by','confirmed_at','completed_at','cancelled_at','cancellation_reason');
    IF col_count < 7 THEN
        RAISE EXCEPTION 'New-26 FAILED: % / 7 kolon bulundu', col_count;
    END IF;
    RAISE NOTICE 'New-26 OK: appointments action tracking kolonları aktif (7/7)';
END $$;

NOTIFY pgrst, 'reload schema';
