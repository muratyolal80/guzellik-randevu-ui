-- =============================================================================
-- New-08-Demo-Data.sql
-- Test/demo verisi: yarına örnek randevular, galeri placeholder, yorumlar.
-- Idempotent — ON CONFLICT DO NOTHING + WHERE NOT EXISTS koruması.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. SALON_GALLERY — Her salon için 3 placeholder görsel
-- -----------------------------------------------------------------------------
INSERT INTO public.salon_gallery (salon_id, image_url, display_order, is_cover, caption)
SELECT s.id,
       'https://images.unsplash.com/photo-' || (
         CASE n WHEN 1 THEN '1560066984-138dadb4c035'
                WHEN 2 THEN '1521590832167-7bcbfaa6381f'
                WHEN 3 THEN '1522337360788-8b13dee7a37e' END
       ) || '?w=800',
       n,
       n = 1,
       CASE n WHEN 1 THEN 'Ana salon' WHEN 2 THEN 'Çalışma alanı' WHEN 3 THEN 'Bekleme alanı' END
FROM public.salons s
CROSS JOIN generate_series(1,3) n
WHERE NOT EXISTS (SELECT 1 FROM public.salon_gallery sg WHERE sg.salon_id = s.id);

-- -----------------------------------------------------------------------------
-- 2. REVIEWS — is_verified kolonu güvenceye al + her aktif salon için 3 örnek yorum
-- -----------------------------------------------------------------------------
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

INSERT INTO public.reviews (salon_id, user_id, user_name, user_avatar, rating, comment, is_verified)
SELECT s.id,
       (SELECT id FROM public.profiles WHERE role='CUSTOMER' LIMIT 1),
       names.user_name,
       'https://i.pravatar.cc/100?u=' || names.user_name,
       names.rating,
       names.comment,
       true
FROM public.salons s
CROSS JOIN (VALUES
    ('Ayşe Demir', 5, 'Çok memnun kaldım, ekip çok ilgili. Kesinlikle tavsiye ederim.'),
    ('Zeynep Aslan', 4, 'Hizmet kaliteli, ortam temiz. Tek eksik park yeri.'),
    ('Mehmet Yıldız', 5, 'Her zamanki gibi mükemmel iş çıkardılar.')
) AS names(user_name, rating, comment)
WHERE s.status = 'APPROVED'
  AND (SELECT COUNT(*) FROM public.reviews WHERE salon_id = s.id) = 0;

-- Salons.average_rating güncelle (varsa)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='salons' AND column_name='average_rating') THEN
        UPDATE public.salons s
        SET average_rating = (SELECT AVG(rating)::numeric(3,2) FROM public.reviews WHERE salon_id=s.id),
            review_count   = (SELECT COUNT(*) FROM public.reviews WHERE salon_id=s.id);
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='salons' AND column_name='review_count') THEN
        UPDATE public.salons s
        SET review_count = (SELECT COUNT(*) FROM public.reviews WHERE salon_id=s.id);
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 3. APPOINTMENTS — Yarın için her aktif staff'a 1 örnek randevu (10:00 — 30dk)
--    Böylece UI'da "10:00 dolu" görünüp test yapılabilir.
-- -----------------------------------------------------------------------------
WITH first_customer AS (
    SELECT id FROM public.profiles WHERE role='CUSTOMER' LIMIT 1
),
staff_with_service AS (
    SELECT DISTINCT ON (s.id) s.id AS staff_id, s.salon_id, ss.id AS salon_service_id, ss.duration_min
    FROM public.staff s
    JOIN public.staff_services xs ON xs.staff_id = s.id
    JOIN public.salon_services  ss ON ss.id = xs.salon_service_id
    WHERE s.is_active = true
    ORDER BY s.id, ss.duration_min NULLS LAST
)
INSERT INTO public.appointments
    (customer_id, customer_name, customer_phone, salon_id, staff_id, salon_service_id,
     start_time, end_time, status, deposit_amount, payment_status)
SELECT
    fc.id,
    'Test Müşteri',
    '+905551112233',
    sws.salon_id,
    sws.staff_id,
    sws.salon_service_id,
    -- Yarın 10:00 (yerel) — UTC'ye çeviriyoruz
    ((NOW() + interval '1 day')::date + time '10:00')::timestamptz,
    ((NOW() + interval '1 day')::date + time '10:00')::timestamptz + (COALESCE(sws.duration_min,30) || ' minutes')::interval,
    'CONFIRMED',
    0,
    'PENDING'
FROM staff_with_service sws
CROSS JOIN first_customer fc
WHERE NOT EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.staff_id = sws.staff_id
      AND a.start_time::date = (NOW() + interval '1 day')::date
);

-- -----------------------------------------------------------------------------
-- 4. SUBSCRIPTIONS — Onaylı her salon için STARTER aboneliği (UI test için)
-- -----------------------------------------------------------------------------
INSERT INTO public.subscriptions (salon_id, plan_id, status, current_period_start, current_period_end)
SELECT s.id,
       (SELECT id FROM public.subscription_plans WHERE name='STARTER' LIMIT 1),
       'ACTIVE',
       NOW(),
       NOW() + interval '30 days'
FROM public.salons s
WHERE s.status = 'APPROVED'
  AND NOT EXISTS (SELECT 1 FROM public.subscriptions WHERE salon_id = s.id);

-- -----------------------------------------------------------------------------
-- 5. RAPOR
-- -----------------------------------------------------------------------------
DO $$
DECLARE g int; r int; a int; sub int;
BEGIN
    SELECT COUNT(*) INTO g   FROM public.salon_gallery;
    SELECT COUNT(*) INTO r   FROM public.reviews;
    SELECT COUNT(*) INTO a   FROM public.appointments WHERE start_time::date = (NOW() + interval '1 day')::date;
    SELECT COUNT(*) INTO sub FROM public.subscriptions;
    RAISE NOTICE '═══════════ DEMO DATA RAPORU ═══════════';
    RAISE NOTICE 'salon_gallery       : % satır', g;
    RAISE NOTICE 'reviews             : % satır', r;
    RAISE NOTICE 'tomorrow appointments: % satır', a;
    RAISE NOTICE 'subscriptions       : % satır', sub;
    RAISE NOTICE '════════════════════════════════════════';
END $$;

NOTIFY pgrst, 'reload schema';
