-- =============================================
-- New-23-Final-Service-Layer-Fixes.sql
-- 1. Salon_services tablosunu düzelt (is_active ekle, kolon ismini normalize et)
-- 2. Eksik view'ları oluştur/güncelle (Mükerrer ve eksik kolon hataları giderildi)
-- =============================================

-- 1. SALON_SERVICES FIXES
DO $$ 
BEGIN
    -- Rename duration_minutes to duration_min if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='salon_services' AND column_name='duration_minutes') THEN
        ALTER TABLE public.salon_services RENAME COLUMN duration_minutes TO duration_min;
    END IF;

    -- Add is_active if it's missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='salon_services' AND column_name='is_active') THEN
        ALTER TABLE public.salon_services ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 2. CREATE MISSING VIEWS
-- Sütun değişikliklerine izin vermek için önce sil
DROP VIEW IF EXISTS public.verified_reviews_view CASCADE;
DROP VIEW IF EXISTS public.salon_service_details CASCADE;
DROP VIEW IF EXISTS public.staff_reviews_detailed CASCADE;

-- A. SALON_SERVICE_DETAILS (Servis listesi için kritik)
CREATE VIEW public.salon_service_details AS
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

-- B. VERIFIED_REVIEWS_VIEW (Yorumlar için)
CREATE VIEW public.verified_reviews_view AS
SELECT 
    r.id,
    r.salon_id,
    r.user_id,
    r.appointment_id,
    r.rating,
    r.comment,
    r.created_at,
    COALESCE(p.full_name, r.user_name) AS user_name,
    COALESCE(p.avatar_url, r.user_avatar) AS user_avatar,
    a.start_time AS service_date,
    gs.service_name AS service_name,
    (r.appointment_id IS NOT NULL) AS is_verified
FROM public.reviews r
LEFT JOIN public.profiles p ON p.id = r.user_id
LEFT JOIN public.appointments a ON a.id = r.appointment_id
LEFT JOIN public.salon_service_details gs ON gs.id = COALESCE(a.salon_service_id, a.service_id);

-- C. STAFF_REVIEWS_DETAILED (Çalışan yorumları için)
CREATE VIEW public.staff_reviews_detailed AS
SELECT 
    sr.id,
    sr.staff_id,
    sr.salon_id,
    sr.user_id,
    sr.appointment_id,
    sr.rating,
    sr.comment,
    sr.is_verified,
    sr.created_at,
    s.name AS staff_name,
    s.photo AS staff_photo,
    COALESCE(p.full_name, sr.user_name) AS user_name,
    COALESCE(p.avatar_url, sr.user_avatar) AS user_avatar
FROM public.staff_reviews sr
JOIN public.staff s ON s.id = sr.staff_id
LEFT JOIN public.profiles p ON p.id = sr.user_id;

-- 3. PERMISSIONS
GRANT SELECT ON public.salon_service_details TO anon, authenticated;
GRANT SELECT ON public.verified_reviews_view TO anon, authenticated;
GRANT SELECT ON public.staff_reviews_detailed TO anon, authenticated;
