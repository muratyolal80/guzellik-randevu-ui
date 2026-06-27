-- =============================================================================
-- New-11-NoShow-And-Migration-Tracker.sql
-- 1) appt_status enum'una NO_SHOW değeri ekler (owner randevuya gelmeyen müşteriyi işaretleyebilsin)
-- 2) _migrations tablosu oluşturur (hangi migration uygulandı kaydı)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. appt_status enum'a NO_SHOW ekle
-- -----------------------------------------------------------------------------
ALTER TYPE public.appt_status ADD VALUE IF NOT EXISTS 'NO_SHOW';

-- -----------------------------------------------------------------------------
-- 2. _migrations tracking tablosu
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public._migrations (
    id          serial PRIMARY KEY,
    name        text NOT NULL UNIQUE,
    applied_at  timestamptz DEFAULT now(),
    notes       text
);

-- Geriye dönük kayıt — bu migration ve önceki tüm root New-XX dosyalarını işaretle
INSERT INTO public._migrations (name, notes) VALUES
    ('New-01-Public-Grants-And-RLS', 'Public read RLS + grants'),
    ('New-02-Booking-Flow-Grants', 'Booking flow için grants'),
    ('New-03-Campaign-Rules-And-Gallery', 'Campaign + gallery RLS'),
    ('04-advanced-schema', 'Storage buckets + transactions table'),
    ('New-04-Sync-Missing-Tables', '23 missing table + RLS hardening'),
    ('New-05-Backfill-Staff-Hours-And-Services', 'Staff hours + services backfill'),
    ('New-06-Final-Sync', 'SMS + IYS tables + sensitive RLS'),
    ('New-07-Staff-Verification-Columns', 'Staff verification kolonları'),
    ('New-08-Demo-Data', 'Galeri + yorum + appointment seed'),
    ('New-09-Service-Role-Grants', 'service_role tüm tablolara GRANT (kritik)'),
    ('New-10-OTP-Codes-Table', 'otp_codes tablosu'),
    ('New-11-NoShow-And-Migration-Tracker', 'NO_SHOW status + _migrations tablosu')
ON CONFLICT (name) DO NOTHING;

-- Sadece admin görsün
ALTER TABLE public._migrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_see_migrations" ON public._migrations;
CREATE POLICY "admin_see_migrations" ON public._migrations FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN','ADMIN'))
);

NOTIFY pgrst, 'reload schema';
