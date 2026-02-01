-- Migration: Seed enhancements with sample data (Safe Version)
-- Run this script ONLY after 06-schema-enhancements.sql has completed successfully

-- ==============================================
-- 1. SEED DESCRIPTIONS AND FEATURES
-- ==============================================
-- Using subqueries to ensure descriptions are only set if they are currently null/default
UPDATE public.salons 
SET 
  description = COALESCE(description, 'İstanbul''un en prestijli lokasyonunda, uzman kadrosu ve modern ekipmanlarıyla hizmetinizde. Kişisel bakımınıza değer veriyor, hijyen ve konforu ön planda tutuyoruz.'),
  features = CASE WHEN features = '[]'::jsonb OR features IS NULL THEN '["Klima", "Wi-Fi", "İkram", "Otopark", "Kredi Kartı"]'::jsonb ELSE features END;

-- More specific updates for Barber/Hair salons
UPDATE public.salons 
SET 
  description = 'Sektördeki 15 yıllık tecrübemizle, geleneksel berber kültürünü modern dokunuşlarla birleştiriyoruz. Size özel saç ve sakal tasarımlarıyla kendinizi yenilenmiş hissedeceksiniz.'
WHERE name LIKE '%Berber%' OR name LIKE '%Cut%';

UPDATE public.salons 
SET 
  features = '["Klima", "Wi-Fi", "Otopark", "Kredi Kartı", "Çocuk Dostu"]'::jsonb
WHERE name LIKE '%Kuaför%' OR name LIKE '%Salon%';

-- ==============================================
-- 2. SEED SALON WORKING HOURS
-- ==============================================
DO $$
DECLARE
    salon_record RECORD;
    day_idx INTEGER;
BEGIN
    FOR salon_record IN SELECT id FROM public.salons LOOP
        -- Weekdays (Mon-Fri)
        FOR day_idx IN 1..5 LOOP
            INSERT INTO public.salon_working_hours (salon_id, day_of_week, start_time, end_time, is_closed)
            VALUES (salon_record.id, day_idx, '09:00:00', '21:00:00', false)
            ON CONFLICT (salon_id, day_of_week) DO NOTHING;
        END LOOP;
        
        -- Saturday
        INSERT INTO public.salon_working_hours (salon_id, day_of_week, start_time, end_time, is_closed)
        VALUES (salon_record.id, 6, '10:00:00', '20:00:00', false)
        ON CONFLICT (salon_id, day_of_week) DO NOTHING;
        
        -- Sunday
        INSERT INTO public.salon_working_hours (salon_id, day_of_week, start_time, end_time, is_closed)
        VALUES (salon_record.id, 0, '09:00:00', '18:00:00', true)
        ON CONFLICT (salon_id, day_of_week) DO NOTHING;
    END LOOP;
END $$;
