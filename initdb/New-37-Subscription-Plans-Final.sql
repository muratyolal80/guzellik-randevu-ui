-- =============================================================================
-- New-37-Subscription-Plans-Final.sql
-- Fixes pricing, ordering, and annual plan values. 
-- Also fixes visibility issues for Home page by granting permissions.
-- =============================================================================

-- 1. Ensure price_yearly column exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscription_plans' AND column_name='price_yearly') THEN
        ALTER TABLE public.subscription_plans ADD COLUMN price_yearly integer;
    END IF;
END $$;

-- 2. Update/Upsert Plans with correct progression and annual prices (10 months rule)
INSERT INTO public.subscription_plans 
(name, display_name, description, price_monthly, price_yearly, sort_order, max_branches, max_staff, max_gallery_photos, max_sms_monthly, has_advanced_reports, has_campaigns, has_sponsored, support_level)
VALUES 
('STARTER', 'Başlangıç', 'Sisteme harika bir başlangıç için temel özellikler', 0, 0, 1, 1, 3, 3, 0, false, false, false, 'STANDARD'),
('PRO', 'Pro', 'Tek şubeli, büyüyen butik salonlar için ideal', 49900, 499000, 2, 1, 5, 30, 250, true, false, false, 'STANDARD'),
('BUSINESS', 'Business', 'Birden fazla şubesi olan ve ivme yakalayan markalar', 74900, 749000, 3, 5, 15, 100, 1000, true, true, false, 'PRIORITY'),
('ELITE', 'Elite', 'Sınırsız güç ve platform üzerinde sponsorlu vitrin özelliği', 99900, 999000, 4, -1, -1, -1, 5000, true, true, true, 'VIP')
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    sort_order = EXCLUDED.sort_order,
    max_branches = EXCLUDED.max_branches,
    max_staff = EXCLUDED.max_staff,
    max_gallery_photos = EXCLUDED.max_gallery_photos,
    max_sms_monthly = EXCLUDED.max_sms_monthly,
    has_advanced_reports = EXCLUDED.has_advanced_reports,
    has_campaigns = EXCLUDED.has_campaigns,
    has_sponsored = EXCLUDED.has_sponsored,
    support_level = EXCLUDED.support_level;

-- 3. Fix Permissions for Anonymous and Authenticated users (Home page visibility)
GRANT SELECT ON public.cities TO anon, authenticated;
GRANT SELECT ON public.districts TO anon, authenticated;
GRANT SELECT ON public.salon_types TO anon, authenticated;
GRANT SELECT ON public.global_services TO anon, authenticated;
GRANT SELECT ON public.subscription_plans TO anon, authenticated;
GRANT SELECT ON public.service_categories TO anon, authenticated;
GRANT SELECT ON public.salons TO anon, authenticated;
GRANT SELECT ON public.salon_assigned_types TO anon, authenticated;

-- 4. Recreate View (Drop first to avoid 42P16)
DROP VIEW IF EXISTS public.salon_details_with_membership CASCADE;
DROP VIEW IF EXISTS public.salon_details CASCADE;

CREATE OR REPLACE VIEW public.salon_details AS
 SELECT s.id,
    s.name,
    s.description,
    s.features,
    s.address,
    s.neighborhood,
    s.street,
    s.building_no,
    s.apartment_no,
    s.phone,
    s.geo_latitude,
    s.geo_longitude,
    s.image,
    s.is_sponsored,
    s.status,
    s.rejected_reason,
    s.owner_id,
    COALESCE(c.name, 'Bilinmiyor'::text) AS city_name,
    COALESCE(d.name, 'Bilinmiyor'::text) AS district_name,
    COALESCE(st.name, 'Genel'::text) AS type_name,
    COALESCE(st.slug, 'genel'::text) AS type_slug,
    ( SELECT array_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug, 'is_primary', sat.is_primary)) AS array_agg
           FROM (public.salon_assigned_types sat
             JOIN public.salon_types t ON ((sat.type_id = t.id)))
          WHERE (sat.salon_id = s.id)) AS assigned_types,
    0 AS review_count,
    0 AS average_rating,
    s.created_at
   FROM (((public.salons s
     LEFT JOIN public.cities c ON ((s.city_id = c.id)))
     LEFT JOIN public.districts d ON ((s.district_id = d.id)))
     LEFT JOIN public.salon_types st ON ((s.type_id = st.id)));

-- Permissions for view
GRANT SELECT ON public.salon_details TO anon, authenticated;
