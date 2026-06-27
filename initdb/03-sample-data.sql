-- GuzellikRandevu Sample Business Data
-- Simplified and Robust Version

DO $$
DECLARE
    v_owner_id UUID := '00000000-0000-0000-0000-000000000001';
    v_city_id UUID;
    v_district_id UUID;
    v_type_id UUID;
BEGIN
    -- 1. Ensure a profile exists for the owner
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (v_owner_id, 'demo-owner@example.com', 'Demo Salon Sahibi', 'SALON_OWNER')
    ON CONFLICT (id) DO NOTHING;

    -- 2. Get some valid IDs
    SELECT id INTO v_city_id FROM public.cities LIMIT 1;
    SELECT id INTO v_district_id FROM public.districts WHERE city_id = v_city_id LIMIT 1;
    SELECT id INTO v_type_id FROM public.salon_types LIMIT 1;

    -- 3. Create sample salons
    INSERT INTO public.salons (owner_id, name, status, city_id, district_id, type_id, address, image)
    VALUES 
    (v_owner_id, 'Güzellik Salonu 1', 'APPROVED', v_city_id, v_district_id, v_type_id, 'Adres 1', 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=800&auto=format&fit=crop'),
    (v_owner_id, 'Hızlı Berber', 'APPROVED', v_city_id, v_district_id, v_type_id, 'Adres 2', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=800&auto=format&fit=crop'),
    (v_owner_id, 'Lüks Kuaför', 'APPROVED', v_city_id, v_district_id, v_type_id, 'Adres 3', 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?q=80&w=800&auto=format&fit=crop')
    ON CONFLICT DO NOTHING;

    -- 4. Create services for these salons
    INSERT INTO public.salon_services (salon_id, global_service_id, duration_min, price)
    SELECT s.id, gs.id, 45, 200
    FROM public.salons s, public.global_services gs
    LIMIT 10
    ON CONFLICT DO NOTHING;

END $$;
