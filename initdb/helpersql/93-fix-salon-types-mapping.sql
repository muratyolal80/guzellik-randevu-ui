-- FIX SALON TYPE MAPPING
-- Harita üzerindeki salonların tiplerini doğru ID'lerle eşleştirir.

DO $$
DECLARE
    v_kuafor_id UUID;
    v_berber_id UUID;
    v_guzellik_id UUID;
BEGIN
    -- 1. Get correct IDs from salon_types based on slug (which we know match the menu)
    SELECT id INTO v_kuafor_id FROM public.salon_types WHERE slug = 'kuafor';
    SELECT id INTO v_berber_id FROM public.salon_types WHERE slug = 'berber';
    SELECT id INTO v_guzellik_id FROM public.salon_types WHERE slug = 'guzellik';

    RAISE NOTICE 'Kuafor ID: %, Berber ID: %, Guzellik ID: %', v_kuafor_id, v_berber_id, v_guzellik_id;

    -- 2. Update Elite Barber Shop -> Kuafor (or Berber if you prefer)
    UPDATE public.salons 
    SET type_id = v_kuafor_id 
    WHERE name LIKE '%Elite%' OR name LIKE '%Kuaför%';

    -- 3. Update Ahmet -> Berber
    UPDATE public.salons 
    SET type_id = v_berber_id 
    WHERE name LIKE '%Ahmet%' OR name LIKE '%Berber%';

    -- 4. Update Ayşe -> Güzellik Merkezi
    UPDATE public.salons 
    SET type_id = v_guzellik_id 
    WHERE name LIKE '%Ayşe%' OR name LIKE '%Güzellik%';

END $$;

-- 5. Clean up old/broken types if any (safe cleanup)
-- DELETE FROM public.salon_types WHERE slug NOT IN ('kuafor', 'berber', 'guzellik', 'masaj-spa', 'makyaj-studyo', 'tirnak-tasarim', 'terapi', 'solaryum', 'dovme');

-- Verification
SELECT s.name, st.name as type_name, st.slug 
FROM public.salons s 
JOIN public.salon_types st ON s.type_id = st.id;
