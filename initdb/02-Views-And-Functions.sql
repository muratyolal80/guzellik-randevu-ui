-- =============================================
-- 02-Views-And-Functions.sql
-- Bu dosya, VDS (sunucu) temel şeması üzerine "Hemen Müsait", "İyzico"
-- ve "COALESCE(bigint)" özelliklerini destekleyen güncel View'ları ekler.
-- =============================================

-- ---------------------------------------------
-- 1. FUNCTIONS & TRIGGERS
-- ---------------------------------------------

-- Güncelleme tarihini otomatik atan fonksiyon
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Yeni salon açıldığında temel üyelik (FREE) atayan trigger fonksiyonu
CREATE OR REPLACE FUNCTION public.on_salon_created_add_membership()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.salon_memberships (salon_id, plan, status, start_date, end_date)
    VALUES (NEW.id, 'FREE', 'ACTIVE', now(), now() + interval '100 years')
    ON CONFLICT DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Her ihtimale karşı trigger'ları tekrar ekle (zaten 01-Base-Schema'da olabilirler)
DROP TRIGGER IF EXISTS update_salons_updated_at ON public.salons;
CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON public.salons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS tr_salon_created_membership ON public.salons;
CREATE TRIGGER tr_salon_created_membership AFTER INSERT ON public.salons FOR EACH ROW EXECUTE FUNCTION public.on_salon_created_add_membership();

-- ---------------------------------------------
-- 2. VIEWS (GÖRÜNÜMLER)
-- ---------------------------------------------

DROP VIEW IF EXISTS public.salon_details_with_membership;
DROP VIEW IF EXISTS public.salon_details;

-- A. SALON_DETAILS (Merkezi Görüntüleme View'ı)
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
    -- ÇALIŞMA SAATLERİ (Hemen Müsait filtresi için eklendi)
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
    s.created_at,
    s.updated_at
FROM public.salons s
LEFT JOIN public.cities      c  ON c.id  = s.city_id
LEFT JOIN public.districts   d  ON d.id  = s.district_id
LEFT JOIN public.salon_types st ON st.id = s.type_id;

-- B. SALON_DETAILS_WITH_MEMBERSHIP 
CREATE OR REPLACE VIEW public.salon_details_with_membership AS
SELECT
    sd.*,
    'OWNER'::TEXT        AS user_role,
    sd.owner_id::TEXT    AS current_user_id
FROM public.salon_details sd;

-- C. SALON_SERVICE_DETAILS (Servis listesi için kritik, bigint COALESCE korumalı)
CREATE OR REPLACE VIEW public.salon_service_details AS
SELECT 
    ss.id,
    ss.salon_id,
    ss.price,
    COALESCE(ss.duration_min, ss.duration_minutes) as duration_min, 
    COALESCE(ss.is_active, true) as is_active,
    COALESCE(ss.name, gs.name) AS service_name, 
    sc.name AS category_name,
    sc.icon AS category_icon, 
    sc.slug AS category_slug,
    s.name AS salon_name
FROM public.salon_services ss
LEFT JOIN public.global_services gs ON gs.id = ss.global_service_id
LEFT JOIN public.service_categories sc ON sc.id = gs.category_id
JOIN public.salons s ON s.id = ss.salon_id;

-- D. VERIFIED_REVIEWS_VIEW (Yorumlar için)
CREATE OR REPLACE VIEW public.verified_reviews_view AS
SELECT
    r.id, r.salon_id, r.user_id, r.appointment_id, r.rating, r.comment, r.created_at,
    COALESCE(p.full_name, r.user_name) AS user_name,
    COALESCE(p.avatar_url, r.user_avatar) AS user_avatar,
    a.start_time AS service_date,
    gs.service_name AS service_name,
    (r.appointment_id IS NOT NULL) AS is_verified
FROM public.reviews r
LEFT JOIN public.profiles p ON p.id = r.user_id
LEFT JOIN public.appointments a ON a.id = r.appointment_id
LEFT JOIN public.salon_service_details gs ON gs.id = COALESCE(a.salon_service_id, a.service_id);

-- E. STAFF_REVIEWS_DETAILED 
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'staff_reviews' AND table_schema = 'public') THEN
        EXECUTE '
        CREATE OR REPLACE VIEW public.staff_reviews_detailed AS
        SELECT 
            sr.id, sr.staff_id, sr.user_id, sr.appointment_id, sr.rating, sr.comment, sr.created_at,
            s.full_name AS staff_name, s.title AS staff_title, s.avatar_url AS staff_avatar,
            COALESCE(p.full_name, sr.user_name) AS user_name,
            COALESCE(p.avatar_url, sr.user_avatar) AS user_avatar,
            (sr.appointment_id IS NOT NULL) AS is_verified
        FROM public.staff_reviews sr
        JOIN public.staff s ON s.id = sr.staff_id
        LEFT JOIN public.profiles p ON p.id = sr.user_id;';
    END IF;
END $$;
