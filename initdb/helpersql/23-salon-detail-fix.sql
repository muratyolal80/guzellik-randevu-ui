-- 1. SALON SERVİS TABLOSUNU DÜZELT (Gerekirse)
-- Coloniaları ekle/güncelle ki aşağıdaki view'lar hata vermesin
DO $$ 
BEGIN
  -- duration_minutes -> duration_min
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='salon_services' AND column_name='duration_minutes') THEN
    ALTER TABLE public.salon_services RENAME COLUMN duration_minutes TO duration_min;
  END IF;
  
  -- global_service_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='salon_services' AND column_name='global_service_id') THEN
    ALTER TABLE public.salon_services ADD COLUMN global_service_id uuid REFERENCES public.global_services(id);
  END IF;

  -- is_active
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='salon_services' AND column_name='is_active') THEN
    ALTER TABLE public.salon_services ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- 2. APPOINTMENTS TABLOSUNU DÜZELT
DO $$
BEGIN
  -- service_id -> salon_service_id
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='service_id') THEN
    ALTER TABLE public.appointments RENAME COLUMN service_id TO salon_service_id;
  END IF;
END $$;

-- 3. EKSİK GÖRÜNÜMLERİ (VIEWS) GERİ GETİR
DROP VIEW IF EXISTS public.salon_service_details CASCADE;

CREATE OR REPLACE VIEW public.salon_service_details WITH (security_invoker = on) AS
SELECT
    ss.id,
    ss.salon_id,
    ss.duration_min,
    ss.price,
    ss.is_active,
    gs.name AS service_name,
    sc.name AS category_name,
    sc.slug AS category_slug,
    sc.icon AS category_icon,
    s.name AS salon_name
FROM public.salon_services ss
JOIN public.global_services gs ON ss.global_service_id = gs.id
JOIN public.service_categories sc ON gs.category_id = sc.id
JOIN public.salons s ON ss.salon_id = s.id;

DROP VIEW IF EXISTS public.verified_reviews_view CASCADE;

CREATE OR REPLACE VIEW public.verified_reviews_view AS
 SELECT r.id,
    r.salon_id,
    r.user_id,
    r.appointment_id,
    r.user_name,
    r.user_avatar,
    r.rating,
    r.comment,
    r.created_at,
    (r.appointment_id IS NOT NULL) AS is_verified,
    gs.service_name AS service_name,
    a.start_time AS service_date
   FROM public.reviews r
     LEFT JOIN public.appointments a ON r.appointment_id = a.id
     LEFT JOIN public.salon_service_details gs ON a.salon_service_id = gs.id;

-- 4. TEST SALONU İÇİN EKSİK VERİLERİ EKLE (Elite Barber Shop - e374db91...)
-- Not: Global servisler 22-master-data-fix.sql ile eklenmiş olmalı.

-- Hizmetler
INSERT INTO public.salon_services (salon_id, global_service_id, price, duration_min)
SELECT 'e374db91-eed0-4b03-bfd1-d5ddef391c6f', id, 250, 45
FROM public.global_services WHERE name = 'Saç Kesimi'
ON CONFLICT DO NOTHING;

-- Çalışma Saatleri (Eğer yoksa)
INSERT INTO public.salon_working_hours (salon_id, day_of_week, start_time, end_time, is_closed)
SELECT 'e374db91-eed0-4b03-bfd1-d5ddef391c6f', d, '09:00', '20:00', false
FROM generate_series(1, 6) d
WHERE NOT EXISTS (SELECT 1 FROM public.salon_working_hours WHERE salon_id = 'e374db91-eed0-4b03-bfd1-d5ddef391c6f' AND day_of_week = d);

INSERT INTO public.salon_working_hours (salon_id, day_of_week, start_time, end_time, is_closed)
SELECT 'e374db91-eed0-4b03-bfd1-d5ddef391c6f', 0, '00:00', '00:00', true
WHERE NOT EXISTS (SELECT 1 FROM public.salon_working_hours WHERE salon_id = 'e374db91-eed0-4b03-bfd1-d5ddef391c6f' AND day_of_week = 0);

-- Şehir/İlçe Fix (İzmir/Konak)
INSERT INTO public.cities (id, name, plate_code, latitude, longitude)
SELECT '7e8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d', 'İzmir', 35, 38.4237, 27.1428
WHERE NOT EXISTS (SELECT 1 FROM public.cities WHERE name = 'İzmir');

INSERT INTO public.districts (id, city_id, name)
SELECT '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', '7e8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d', 'Konak'
WHERE NOT EXISTS (SELECT 1 FROM public.districts WHERE name = 'Konak');

-- Salonu İzmir/Konak'a bağla
UPDATE public.salons 
SET city_id = '7e8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d', 
    district_id = '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    description = 'İzmir''in kalbinde, modern ve geleneksel tıraşın buluşma noktası.'
WHERE id = 'e374db91-eed0-4b03-bfd1-d5ddef391c6f';

-- Şemayı yenile
NOTIFY pgrst, 'reload schema';
