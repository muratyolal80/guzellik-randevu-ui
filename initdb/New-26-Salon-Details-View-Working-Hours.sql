-- =============================================
-- New-26-Salon-Details-View-Working-Hours.sql
-- 1. salon_details view'ını çalışma saatlerini içerecek şekilde güncelle
-- 2. salon_details_with_membership view'ını güncelle
-- 3. Tip güvenliği ve performans iyileştirmeleri
-- =============================================

DROP VIEW IF EXISTS public.salon_details_with_membership;
DROP VIEW IF EXISTS public.salon_details;

CREATE OR REPLACE VIEW public.salon_details AS
SELECT
    s.id,
    s.name,
    s.slug,
    s.description,
    s.features,
    s.tags,
    -- Adres alanları
    s.address,
    s.neighborhood,
    s.avenue,
    s.street,
    s.building_no,
    s.apartment_no,
    s.postal_code,
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
    s.min_price,
    -- Sahip
    s.owner_id,
    -- Şehir / İlçe
    s.city_id,
    s.district_id,
    s.type_id,
    COALESCE(c.name, 'Bilinmiyor') AS city_name,
    COALESCE(d.name, 'Bilinmiyor') AS district_name,
    -- Tip (birincil)
    COALESCE(st.name, 'Genel')     AS type_name,
    COALESCE(st.slug, 'genel')     AS type_slug,
    -- Çoklu tip atamaları (JSON dizisi)
    COALESCE(
        (
            SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug, 'is_primary', sat.is_primary))
            FROM public.salon_assigned_types sat
            JOIN public.salon_types t ON t.id = sat.type_id
            WHERE sat.salon_id = s.id
        ),
        '[]'::json
    ) AS assigned_types,
    -- ÇALIŞMA SAATLERİ (JSON dizisi olarak eklendi - "Hemen Müsait" filtresi için)
    COALESCE(
        (
            SELECT json_agg(json_build_object(
                'day_of_week', swh.day_of_week, 
                'start_time', swh.start_time, 
                'end_time', swh.end_time, 
                'is_closed', swh.is_closed
            ) ORDER BY swh.day_of_week)
            FROM public.salon_working_hours swh
            WHERE swh.salon_id = s.id
        ),
        '[]'::json
    ) AS working_hours,
    -- Değerlendirme & İstatistik
    s.review_count,
    s.rating AS average_rating,
    -- Zaman damgaları
    s.created_at,
    s.updated_at
FROM public.salons s
LEFT JOIN public.cities      c  ON c.id  = s.city_id
LEFT JOIN public.districts   d  ON d.id  = s.district_id
LEFT JOIN public.salon_types st ON st.id = s.type_id;

-- 2. SALON_DETAILS_WITH_MEMBERSHIP VIEW'INI YENİLE
CREATE OR REPLACE VIEW public.salon_details_with_membership AS
SELECT
    sd.*,
    'OWNER'::TEXT        AS user_role,
    sd.owner_id::TEXT    AS current_user_id
FROM public.salon_details sd;

-- Yetkileri ver (anon ve authenticated kullanıcılar için)
GRANT SELECT ON public.salon_details TO anon, authenticated;
GRANT SELECT ON public.salon_details_with_membership TO authenticated;
