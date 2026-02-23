-- =============================================
-- New-23-Final-Service-Layer-Fixes.sql
-- 1. Salon_services tablosunu düzelt (is_active ekle, kolon ismini normalize et)
-- 2. Eksik view'ları oluştur/güncelle
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

-- A. SALON_SERVICE_DETAILS (Servis listesi için kritik)
CREATE OR REPLACE VIEW public.salon_service_details AS
SELECT 
    ss.id,
    ss.salon_id,
    ss.price,
    ss.duration_min,
    ss.is_active,
    gs.name AS service_name,
    sc.name AS category_name,
    sc.icon AS category_icon,
    sc.slug AS category_slug,
    s.name AS salon_name
FROM public.salon_services ss
JOIN public.global_services gs ON gs.id = ss.global_service_id
JOIN public.service_categories sc ON sc.id = gs.category_id
JOIN public.salons s ON s.id = ss.salon_id;

-- B. VERIFIED_REVIEWS_VIEW (Yorumlar için)
CREATE OR REPLACE VIEW public.verified_reviews_view AS
SELECT 
    r.*,
    p.full_name AS user_name,
    p.avatar_url AS user_avatar,
    a.start_time AS service_date,
    gs.service_name AS service_name,
    (r.appointment_id IS NOT NULL) AS is_verified
FROM public.reviews r
LEFT JOIN public.profiles p ON p.id = r.user_id
LEFT JOIN public.appointments a ON a.id = r.appointment_id
LEFT JOIN public.salon_service_details gs ON gs.id = a.salon_service_id;

-- C. STAFF_REVIEWS_DETAILED (Çalışan yorumları için)
CREATE OR REPLACE VIEW public.staff_reviews_detailed AS
SELECT 
    sr.*,
    s.name AS staff_name,
    s.photo AS staff_photo,
    p.full_name AS user_name,
    p.avatar_url AS user_avatar
FROM public.staff_reviews sr
JOIN public.staff s ON s.id = sr.staff_id
LEFT JOIN public.profiles p ON p.id = sr.user_id;

-- 3. PERMISSIONS
GRANT SELECT ON public.salon_service_details TO anon, authenticated;
GRANT SELECT ON public.verified_reviews_view TO anon, authenticated;
GRANT SELECT ON public.staff_reviews_detailed TO anon, authenticated;
