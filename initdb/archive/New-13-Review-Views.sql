-- ============================================================
-- New-13-Review-Views.sql
-- Gelişmiş Yorum Görünümleri (Verified Reviews & Staff Ratings)
-- ============================================================

-- 1. SALON YORUMLARI GÖRÜNÜMÜ (verified_reviews_view)
-- db.ts içerisinde 'verified_reviews_view' olarak çağrılıyor.
CREATE OR REPLACE VIEW public.verified_reviews_view AS
SELECT 
    r.id,
    r.salon_id,
    r.user_id,
    r.user_name,
    r.user_avatar,
    r.rating,
    r.comment,
    r.created_at,
    r.appointment_id,
    a.status AS appointment_status,
    a.start_time AS service_date,
    gs.name AS service_name,
    CASE WHEN r.appointment_id IS NOT NULL THEN true ELSE false END AS is_verified
FROM public.reviews r
LEFT JOIN public.appointments a ON r.appointment_id = a.id
LEFT JOIN public.salon_services ss ON a.salon_service_id = ss.id
LEFT JOIN public.global_services gs ON ss.global_service_id = gs.id;

-- 2. ÇALIŞAN YORUMLARI GÖRÜNÜMÜ (staff_reviews_detailed)
CREATE OR REPLACE VIEW public.staff_reviews_detailed AS
SELECT 
    sr.id,
    sr.staff_id,
    sr.salon_id,
    sr.user_id,
    sr.appointment_id,
    sr.user_name,
    sr.user_avatar,
    sr.rating,
    sr.comment,
    sr.is_verified,
    sr.created_at,
    gs.name AS service_name,
    a.start_time AS appointment_date
FROM public.staff_reviews sr
LEFT JOIN public.appointments a ON sr.appointment_id = a.id
LEFT JOIN public.salon_services ss ON a.salon_service_id = ss.id
LEFT JOIN public.global_services gs ON ss.global_service_id = gs.id;

-- 3. SALON PUANLAMA ÖZETİ (salon_ratings)
-- Eğer tablo olarak yoksa view olarak ekleyelim (db.ts salon_ratings tablosuna bakıyor)
-- Not: New-12 zaten staff tablosuna rating/review_count eklemişti.
-- Salonlar için de benzer bir özet tablo/view gerekebilir.
CREATE OR REPLACE VIEW public.salon_ratings AS
SELECT 
    salon_id,
    AVG(rating) as average_rating,
    COUNT(*) as review_count
FROM public.reviews
GROUP BY salon_id;
