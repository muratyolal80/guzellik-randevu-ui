-- New-07-Staff-Verification.sql
-- Description: Personel için TC No, Doğrulama ve KVKK alanları ekler.

ALTER TABLE staff 
ADD COLUMN IF NOT EXISTS tc_no TEXT,
ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS kvkk_consent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Yorumlar
COMMENT ON COLUMN staff.tc_no IS 'Personel TC Kimlik Numarası';
COMMENT ON COLUMN staff.kvkk_consent IS 'Personel bilgilerinin doğrulanmadan görünmesi için verdiği KVKK onayı';
COMMENT ON COLUMN staff.is_email_verified IS 'E-posta adresi doğrulandı mı?';
COMMENT ON COLUMN staff.is_phone_verified IS 'Telefon numarası doğrulandı mı?';
