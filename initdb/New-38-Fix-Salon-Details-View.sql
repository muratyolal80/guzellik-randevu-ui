-- =============================================
-- New-38-Fix-Salon-Details-View.sql
-- Fixes missing status column in salon_details view
-- =============================================

-- Ensure status column exists in salons table just in case
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS status public.salon_status DEFAULT 'DRAFT'::public.salon_status;

-- Recreate the view to include status and any other missing columns
DROP VIEW IF EXISTS public.salon_details_with_membership CASCADE;
DROP VIEW IF EXISTS public.salon_details CASCADE;

CREATE OR REPLACE VIEW public.salon_details AS
SELECT
    s.id, s.name, s.slug, s.description, s.features, s.tags,
    s.address, s.neighborhood, s.avenue, s.street, s.building_no, s.apartment_no, s.postal_code,
    s.phone, s.image, s.logo_url, s.banner_url, s.primary_color,
    s.geo_latitude, s.geo_longitude,
    s.status, s.is_sponsored, s.is_closed, s.rejected_reason, s.plan, s.min_price,
    s.owner_id, s.city_id, s.district_id, s.type_id,
    COALESCE(c.name, 'Bilinmiyor') AS city_name,
    COALESCE(d.name, 'Bilinmiyor') AS district_name,
    COALESCE(st.name, 'Genel')     AS type_name,
    COALESCE(st.slug, 'genel')     AS type_slug,
    COALESCE(
        (SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug, 'is_primary', sat.is_primary))
         FROM public.salon_assigned_types sat
         JOIN public.salon_types t ON t.id = sat.type_id
         WHERE sat.salon_id = s.id),
        '[]'::json
    ) AS assigned_types,
    COALESCE(
        (SELECT json_agg(json_build_object(
            'day_of_week', swh.day_of_week,
            'start_time', swh.start_time,
            'end_time', swh.end_time,
            'is_closed', swh.is_closed
        ) ORDER BY swh.day_of_week)
         FROM public.salon_working_hours swh
         WHERE swh.salon_id = s.id),
        '[]'::json
    ) AS working_hours,
    s.review_count,
    s.rating AS average_rating,
    s.created_at, s.updated_at
FROM public.salons s
LEFT JOIN public.cities      c  ON c.id  = s.city_id
LEFT JOIN public.districts   d  ON d.id  = s.district_id
LEFT JOIN public.salon_types st ON st.id = s.type_id;

-- Recreate dependent view
CREATE OR REPLACE VIEW public.salon_details_with_membership AS
SELECT sd.*, 'OWNER'::TEXT AS user_role, sd.owner_id::TEXT AS current_user_id
FROM public.salon_details sd;

-- Grant permissions
GRANT SELECT ON public.salon_details TO anon, authenticated;
GRANT SELECT ON public.salon_details_with_membership TO authenticated;
