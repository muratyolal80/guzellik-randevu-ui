-- =============================================================================
-- New-07-Staff-Verification-Columns.sql
-- staff tablosuna kodda kullanılan ama DB'de eksik olan kolonları ekler.
-- Sebep: "Uzmanını Seç" sayfasında booking filtresi bu alanlara bakıyor;
-- kolonlar yok → tüm değerler undefined → filtre boş döner → personel görünmüyor.
-- =============================================================================

ALTER TABLE public.staff
    ADD COLUMN IF NOT EXISTS email              text,
    ADD COLUMN IF NOT EXISTS phone              text,
    ADD COLUMN IF NOT EXISTS tc_no              text,
    ADD COLUMN IF NOT EXISTS is_email_verified  boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_phone_verified  boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS kvkk_consent       boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS verified_at        timestamptz,
    ADD COLUMN IF NOT EXISTS role               text;

-- Mevcut 36 personeli "görünür" hale getir:
-- Salon sahibi tarafından eklenmişler, varlıkları onaylanmış sayılır.
-- Owner sonra UI'dan tek tek revize edebilir.
UPDATE public.staff
SET kvkk_consent = true
WHERE kvkk_consent IS NOT TRUE;

-- staff.email için unique partial index (boş olmayan değerlerde tekil)
CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_email_unique
    ON public.staff(email)
    WHERE email IS NOT NULL AND email <> '';

-- profile auto-link için email lookup hızlanır
CREATE INDEX IF NOT EXISTS idx_staff_email ON public.staff(email);

NOTIFY pgrst, 'reload schema';
