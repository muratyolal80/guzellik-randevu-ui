-- =============================================
-- New-22-Address-Columns-And-View-Fix.sql
-- 1. Salons tablosuna eksik adres kolonlarını ekle
-- 2. salon_details view'ını tüm kolonlarla yeniden oluştur
-- 3. salon_details_with_membership view'ını güncelle
-- =============================================

-- -----------------------------------------------
-- 1. SALONS TABLOSUNA EKSİK KOLONLAR
-- -----------------------------------------------
ALTER TABLE public.salons
    ADD COLUMN IF NOT EXISTS neighborhood   TEXT,
    ADD COLUMN IF NOT EXISTS avenue         TEXT,
    ADD COLUMN IF NOT EXISTS street         TEXT,
    ADD COLUMN IF NOT EXISTS building_no    TEXT,
    ADD COLUMN IF NOT EXISTS apartment_no   TEXT,
    ADD COLUMN IF NOT EXISTS is_closed      BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS slug           TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS min_price      NUMERIC(10,2),
    ADD COLUMN IF NOT EXISTS plan           TEXT DEFAULT 'FREE';

COMMENT ON COLUMN public.salons.neighborhood  IS 'Mahalle';
COMMENT ON COLUMN public.salons.avenue        IS 'Cadde';
COMMENT ON COLUMN public.salons.street        IS 'Sokak';
COMMENT ON COLUMN public.salons.building_no   IS 'Bina No';
COMMENT ON COLUMN public.salons.apartment_no  IS 'Daire No';
COMMENT ON COLUMN public.salons.is_closed     IS 'Salon geçici olarak kapalı mı';
COMMENT ON COLUMN public.salons.slug          IS 'Subdomain için URL dostu kısa ad';
COMMENT ON COLUMN public.salons.min_price     IS 'Salondaki en düşük hizmet fiyatı (önizleme için)';
COMMENT ON COLUMN public.salons.plan          IS 'SaaS plan: FREE, PRO, ENTERPRISE';

-- -----------------------------------------------
-- 2. SALON TIPLERI ATAMA TABLOSU (Eğer yoksa)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.salon_assigned_types (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id    bigint NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    type_id     uuid NOT NULL REFERENCES public.salon_types(id) ON DELETE CASCADE,
    is_primary  BOOLEAN DEFAULT false,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(salon_id, type_id)
);

-- -----------------------------------------------
-- 3. SALONLARDAKİ MİN FİYATI HESAPLA (İlk yükleme)
-- -----------------------------------------------
UPDATE public.salons s
SET min_price = (
    SELECT MIN(ss.price)
    FROM public.salon_services ss
    WHERE ss.salon_id = s.id
)
WHERE min_price IS NULL;

-- -----------------------------------------------
-- 4. SALON_DETAILS VIEW'INI YENİDEN OLUŞTUR
-- -----------------------------------------------
DROP VIEW IF EXISTS public.salon_details_with_membership;
DROP VIEW IF EXISTS public.salon_details;

CREATE OR REPLACE VIEW public.salon_details AS
SELECT
    s.id,
    s.name,
    s.description,
    s.features,
    -- Adres alanları
    s.address,
    s.neighborhood,
    s.avenue,
    s.street,
    s.building_no,
    s.apartment_no,
    -- İletişim & Medya
    s.phone,
    s.image,
    s.logo_url,
    s.banner_url,
    s.primary_color,
    -- Konum
    s.geo_latitude,
    s.geo_longitude,
    -- İşletme durumu
    s.status,
    s.is_sponsored,
    s.is_closed,
    s.rejected_reason,
    s.plan,
    s.slug,
    s.min_price,
    -- Sahip
    s.owner_id,
    -- Şehir / İlçe
    COALESCE(c.name,  'Bilinmiyor') AS city_name,
    COALESCE(d.name,  'Bilinmiyor') AS district_name,
    c.id   AS city_id,
    d.id   AS district_id,
    -- Tip (birincil)
    COALESCE(st.name, 'Genel')     AS type_name,
    COALESCE(st.slug, 'genel')     AS type_slug,
    -- Çoklu tip atamaları (JSON dizisi)
    COALESCE(
        (
            SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug))
            FROM public.salon_assigned_types sat
            JOIN public.salon_types t ON t.id = sat.type_id
            WHERE sat.salon_id = s.id
        ),
        '[]'::json
    ) AS assigned_types,
    -- Değerlendirme (şimdilik sabit 0, ileride reviews tablosundan hesaplanacak)
    0::NUMERIC(3,2) AS average_rating,
    0                                   AS review_count,
    -- Zaman damgaları
    s.created_at,
    s.updated_at
FROM public.salons s
LEFT JOIN public.cities      c  ON c.id  = s.city_id
LEFT JOIN public.districts   d  ON d.id  = s.district_id
LEFT JOIN public.salon_types st ON st.id = s.type_id;

-- -----------------------------------------------
-- 5. SALON_DETAILS_WITH_MEMBERSHIP VIEW'INI YENİLE
-- -----------------------------------------------
CREATE OR REPLACE VIEW public.salon_details_with_membership AS
SELECT
    sd.*,
    'OWNER'::TEXT        AS user_role,
    sd.owner_id::TEXT    AS current_user_id
FROM public.salon_details sd;

-- -----------------------------------------------
-- 6. İNDEKSLER
-- -----------------------------------------------
CREATE INDEX IF NOT EXISTS idx_salons_status       ON public.salons(status);
CREATE INDEX IF NOT EXISTS idx_salons_city_id      ON public.salons(city_id);
CREATE INDEX IF NOT EXISTS idx_salons_district_id  ON public.salons(district_id);
CREATE INDEX IF NOT EXISTS idx_salons_slug         ON public.salons(slug);
CREATE INDEX IF NOT EXISTS idx_salon_assigned_types_salon ON public.salon_assigned_types(salon_id);
