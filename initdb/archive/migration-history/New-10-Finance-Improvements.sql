
-- Faz 7: Finans ve Ödeme Entegrasyonu Geliştirmeleri

-- 1. Salona kapora oranı ekleme (0-100 arası yüzde)
ALTER TABLE public.salons 
ADD COLUMN IF NOT EXISTS deposit_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS cancellation_deadline_hours INTEGER DEFAULT 24;

-- 2. Randevuya ödeme ve iade detayları ekleme
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS iyzico_payment_id TEXT,
ADD COLUMN IF NOT EXISTS refund_status TEXT DEFAULT 'NONE' CHECK (refund_status IN ('NONE', 'PENDING', 'COMPLETED', 'FAILED')),
ADD COLUMN IF NOT EXISTS refund_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'CASH',
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'PENDING';

-- 3. Salon hakedişlerini takip etmek için basit bir bakiye tablosu (Opsiyonel ama raporlar için iyi)
-- Not: transaction tablosu zaten var olabilir, kontrol edilmeli. 
-- Şimdilik randevu tablosu üzerinden hakediş raporu üretilebilir.

-- 4. Görünümü (View) güncelleme (deposit_rate dahil edilsin)
CREATE OR REPLACE VIEW public.salon_details AS
SELECT
    s.id, s.name, s.slug, s.description, s.features, s.tags,
    s.address, s.neighborhood, s.avenue, s.street, s.building_no, s.apartment_no, s.postal_code,
    s.phone, s.image, s.logo_url, s.banner_url, s.primary_color,
    s.geo_latitude, s.geo_longitude,
    s.status, s.is_sponsored, s.is_closed, s.rejected_reason, s.plan, s.min_price,
    s.owner_id, s.city_id, s.district_id, s.type_id,
    s.deposit_rate, -- Yeni alan
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
    count(r.id) as review_count,
    avg(r.rating) as average_rating,
    s.created_at, s.updated_at
FROM public.salons s
LEFT JOIN public.cities      c  ON c.id  = s.city_id
LEFT JOIN public.districts   d  ON d.id  = s.district_id
LEFT JOIN public.salon_types st ON st.id = s.type_id
LEFT JOIN public.reviews     r  ON r.salon_id = s.id
GROUP BY s.id, c.name, d.name, st.name, st.slug;
