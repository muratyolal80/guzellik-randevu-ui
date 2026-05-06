-- =============================================================================
-- New-05-Backfill-Staff-Hours-And-Services.sql
-- Mevcut 36 personel için eksik veriyi tamamlar:
--   1. working_hours    : Pzt-Cmt 09:00-19:00, Pzr kapalı (kod ile aynı default)
--   2. staff_services   : Her personele salonun TÜM hizmetlerini ata (sahip sonra UI'dan kısıtlar)
--   3. salon_assigned_types : salons.type_id'yi taşı (is_primary=true)
-- Idempotent — ON CONFLICT DO NOTHING ile çoklu çalıştırma güvenli.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. WORKING_HOURS BACKFILL (Pzt-Cmt 09-19, Pzr kapalı)
-- -----------------------------------------------------------------------------
-- day_of_week: 0=Pazar, 1=Pzt, 2=Sal, 3=Çar, 4=Per, 5=Cum, 6=Cmt
INSERT INTO public.working_hours (staff_id, day_of_week, start_time, end_time, is_day_off)
SELECT s.id, dow.day, '09:00:00'::time, '19:00:00'::time,
       CASE WHEN dow.day = 0 THEN true ELSE false END
FROM public.staff s
CROSS JOIN (VALUES (0),(1),(2),(3),(4),(5),(6)) AS dow(day)
WHERE NOT EXISTS (
    SELECT 1 FROM public.working_hours wh
    WHERE wh.staff_id = s.id AND wh.day_of_week = dow.day
);

-- -----------------------------------------------------------------------------
-- 2. STAFF_SERVICES BACKFILL (her personele kendi salonunun tüm hizmetleri)
-- -----------------------------------------------------------------------------
INSERT INTO public.staff_services (staff_id, salon_id, salon_service_id)
SELECT s.id, s.salon_id, ss.id
FROM public.staff s
JOIN public.salon_services ss ON ss.salon_id = s.salon_id
WHERE NOT EXISTS (
    SELECT 1 FROM public.staff_services xs
    WHERE xs.staff_id = s.id AND xs.salon_service_id = ss.id
);

-- -----------------------------------------------------------------------------
-- 3. SALON_ASSIGNED_TYPES BACKFILL (salons.type_id → primary type)
-- -----------------------------------------------------------------------------
INSERT INTO public.salon_assigned_types (salon_id, type_id, is_primary)
SELECT s.id, s.type_id, true
FROM public.salons s
WHERE s.type_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.salon_assigned_types sat
    WHERE sat.salon_id = s.id AND sat.type_id = s.type_id
  );

-- -----------------------------------------------------------------------------
-- 4. DOĞRULAMA RAPORU (NOTICE çıktısı, çalıştıktan sonra konsola yazar)
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    wh_count int; ss_count int; sat_count int;
    staff_total int; salons_total int;
BEGIN
    SELECT COUNT(*) INTO staff_total  FROM public.staff;
    SELECT COUNT(*) INTO salons_total FROM public.salons WHERE type_id IS NOT NULL;
    SELECT COUNT(*) INTO wh_count     FROM public.working_hours;
    SELECT COUNT(*) INTO ss_count     FROM public.staff_services;
    SELECT COUNT(*) INTO sat_count    FROM public.salon_assigned_types;

    RAISE NOTICE '═══════════════ BACKFILL RAPORU ═══════════════';
    RAISE NOTICE 'Personel        : %', staff_total;
    RAISE NOTICE 'working_hours   : % satır (beklenen: % = %x7)', wh_count, staff_total*7, staff_total;
    RAISE NOTICE 'staff_services  : % satır', ss_count;
    RAISE NOTICE 'Salon (typed)   : %', salons_total;
    RAISE NOTICE 'salon_assigned_types: % satır', sat_count;
    RAISE NOTICE '═══════════════════════════════════════════════';
END $$;

NOTIFY pgrst, 'reload schema';
