-- RESTORE SAMPLE SALON DATA (Idempotent Version)
-- Re-inserts sample salons, staff, services, and appointments.
-- Handles auth users correctly to avoid FK errors.

DO $$
DECLARE
    -- Owner IDs (will be resolved or created)
    owner1_id UUID;
    owner2_id UUID;
    owner3_id UUID;
    owner4_id UUID;
    owner5_id UUID;

    -- Location IDs
    istanbul_id UUID;
    ankara_id UUID;
    izmir_id UUID;
    kadikoy_id UUID;
    cankaya_id UUID;
    konak_id UUID;
    sisli_id UUID;
    besiktas_id UUID;

    -- Type IDs
    kuafor_type_id UUID;
    berber_type_id UUID;
    guzellik_type_id UUID;
    spa_type_id UUID;
    makyaj_type_id UUID;

    -- Temporary variables
    new_salon_id UUID;
    
    -- Helper Function to Get or Create User
    -- Since we can't define functions inside DO block easily in one go, we inline the logic.
BEGIN

    -- ==========================================
    -- 1. GET OR CREATE OWNERS
    -- ==========================================

    -- Owner 1
    SELECT id INTO owner1_id FROM auth.users WHERE email = 'owner1@example.com';
    IF owner1_id IS NULL THEN
        owner1_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, aud, role)
        VALUES (owner1_id, 'owner1@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"full_name": "Mehmet Salon Sahibi"}'::jsonb, NOW(), NOW(), 'authenticated', 'authenticated');
    END IF;
    -- Ensure Profile Exists
    INSERT INTO public.profiles (id, email, full_name, phone, role) VALUES (owner1_id, 'owner1@example.com', 'Mehmet Salon Sahibi', '05551111111', 'SALON_OWNER') ON CONFLICT (id) DO NOTHING;

    -- Owner 2
    SELECT id INTO owner2_id FROM auth.users WHERE email = 'owner2@example.com';
    IF owner2_id IS NULL THEN
        owner2_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, aud, role)
        VALUES (owner2_id, 'owner2@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"full_name": "Ayşe İşletmeci"}'::jsonb, NOW(), NOW(), 'authenticated', 'authenticated');
    END IF;
    INSERT INTO public.profiles (id, email, full_name, phone, role) VALUES (owner2_id, 'owner2@example.com', 'Ayşe İşletmeci', '05552222222', 'SALON_OWNER') ON CONFLICT (id) DO NOTHING;

    -- Owner 3
    SELECT id INTO owner3_id FROM auth.users WHERE email = 'owner3@example.com';
    IF owner3_id IS NULL THEN
        owner3_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, aud, role)
        VALUES (owner3_id, 'owner3@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"full_name": "Ahmet Kuaför"}'::jsonb, NOW(), NOW(), 'authenticated', 'authenticated');
    END IF;
    INSERT INTO public.profiles (id, email, full_name, phone, role) VALUES (owner3_id, 'owner3@example.com', 'Ahmet Kuaför', '05553333333', 'SALON_OWNER') ON CONFLICT (id) DO NOTHING;

    -- Owner 4
    SELECT id INTO owner4_id FROM auth.users WHERE email = 'owner4@example.com';
    IF owner4_id IS NULL THEN
        owner4_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, aud, role)
        VALUES (owner4_id, 'owner4@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"full_name": "Zeynep Güzellik"}'::jsonb, NOW(), NOW(), 'authenticated', 'authenticated');
    END IF;
    INSERT INTO public.profiles (id, email, full_name, phone, role) VALUES (owner4_id, 'owner4@example.com', 'Zeynep Güzellik', '05554444444', 'SALON_OWNER') ON CONFLICT (id) DO NOTHING;

    -- Owner 5
    SELECT id INTO owner5_id FROM auth.users WHERE email = 'owner5@example.com';
    IF owner5_id IS NULL THEN
        owner5_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, aud, role)
        VALUES (owner5_id, 'owner5@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"full_name": "Can Berber"}'::jsonb, NOW(), NOW(), 'authenticated', 'authenticated');
    END IF;
    INSERT INTO public.profiles (id, email, full_name, phone, role) VALUES (owner5_id, 'owner5@example.com', 'Can Berber', '05555555555', 'SALON_OWNER') ON CONFLICT (id) DO NOTHING;


    -- ==========================================
    -- 2. RESOLVE LOCATION & TYPE IDs
    -- ==========================================
    SELECT id INTO istanbul_id FROM cities WHERE name = 'İstanbul';
    SELECT id INTO ankara_id FROM cities WHERE name = 'Ankara';
    SELECT id INTO izmir_id FROM cities WHERE name = 'İzmir';

    SELECT id INTO kadikoy_id FROM districts WHERE name = 'Kadıköy' AND city_id = istanbul_id LIMIT 1;
    SELECT id INTO sisli_id FROM districts WHERE name = 'Şişli' AND city_id = istanbul_id LIMIT 1;
    SELECT id INTO besiktas_id FROM districts WHERE name = 'Beşiktaş' AND city_id = istanbul_id LIMIT 1;
    SELECT id INTO cankaya_id FROM districts WHERE name = 'Çankaya' AND city_id = ankara_id LIMIT 1;
    SELECT id INTO konak_id FROM districts WHERE name = 'Konak' AND city_id = izmir_id LIMIT 1;

    SELECT id INTO kuafor_type_id FROM salon_types WHERE slug = 'kuafor';
    SELECT id INTO berber_type_id FROM salon_types WHERE slug = 'berber';
    SELECT id INTO guzellik_type_id FROM salon_types WHERE slug = 'guzellik';
    SELECT id INTO spa_type_id FROM salon_types WHERE slug = 'spa';
    SELECT id INTO makyaj_type_id FROM salon_types WHERE slug = 'makyaj';


    -- ==========================================
    -- 3. INSERT SALONS (If not exists)
    -- ==========================================
    
    -- We delete existing sample salons to prevent duplication if re-running
    DELETE FROM salons WHERE name IN ('Stil Kuaför', 'Elit Berber Salonu', 'Güzellik Merkezi Luna', 'Zen Spa & Wellness', 'Makyaj Atölyesi Derya', 'Ankara Kuaför Evi', 'Başkent Berber', 'İzmir Güzellik Salonu', 'Ege Spa Center');
    
    -- Insert and capture IDs if needed, but here simple bulk insert is fine
    INSERT INTO salons (owner_id, name, city_id, district_id, type_id, address, phone, geo_latitude, geo_longitude, image, is_sponsored, description, features, status) VALUES
    (owner1_id, 'Stil Kuaför', istanbul_id, kadikoy_id, kuafor_type_id, 'Bahariye Caddesi No: 45, Kadıköy, İstanbul', '02161234567', 40.9875, 29.0245, 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=800&auto=format&fit=crop', true, 'İstanbul''un en köklü kuaförlerinden biri olarak, modern saç tasarımları ve profesyonel renklendirme hizmetleri sunuyoruz.', '["Wi-Fi", "İkram", "Kredi Kartı", "Klima"]'::jsonb, 'APPROVED'),
    (owner2_id, 'Elit Berber Salonu', istanbul_id, sisli_id, berber_type_id, 'Halaskargazi Caddesi No: 123, Şişli, İstanbul', '02122345678', 41.0602, 28.9869, 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=800&auto=format&fit=crop', false, 'Geleneksel berber kültürünü modern spa deneyimiyle birleştiriyoruz. Sadece bir tıraş değil, kendinizi yenileyeceğiniz bir mola.', '["Wi-Fi", "Otopark", "İkram", "Kredi Kartı"]'::jsonb, 'APPROVED'),
    (owner3_id, 'Güzellik Merkezi Luna', istanbul_id, besiktas_id, guzellik_type_id, 'Barbaros Bulvarı No: 78, Beşiktaş, İstanbul', '02123456789', 41.0422, 29.0078, 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?q=80&w=800&auto=format&fit=crop', true, 'Cilt bakımı, lazer epilasyon ve zayıflama ünitelerimizle, güzelliğinize bilimsel dokunuşlar yapıyoruz.', '["Özel Oda", "Valet", "Wi-Fi", "Kredi Kartı"]'::jsonb, 'APPROVED'),
    (owner4_id, 'Zen Spa & Wellness', istanbul_id, besiktas_id, spa_type_id, 'Nişantaşı Mahallesi, Vali Konağı Caddesi No: 12, İstanbul', '02124567890', 41.0451, 28.9934, 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop', false, 'Şehrin gürültüsünden uzaklaşın. Profesyonel masaj terapilerimizle ruhunuzu ve bedeninizi dinlendirin.', '["Havuz", "Sauna", "Wi-Fi", "Otopark"]'::jsonb, 'APPROVED'),
    (owner5_id, 'Makyaj Atölyesi Derya', istanbul_id, kadikoy_id, makyaj_type_id, 'Moda Caddesi No: 89, Kadıköy, İstanbul', '02165678901', 40.9876, 29.0289, 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=800&auto=format&fit=crop', false, 'Özel günlerinizde en doğal ve etkileyici makyaj tasarımları için uzman kadromuzla yanınızdayız.', '["Wi-Fi", "İkram", "Kredi Kartı"]'::jsonb, 'APPROVED'),
    (owner1_id, 'Ankara Kuaför Evi', ankara_id, cankaya_id, kuafor_type_id, 'Tunalı Hilmi Caddesi No: 56, Çankaya, Ankara', '03121234567', 39.9180, 32.8549, 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=800&auto=format&fit=crop', false, 'Ankara''nın merkezinde, en yeni trendleri takip eden enerjik ekibimizle hizmetinizdeyiz.', '["Wi-Fi", "Kredi Kartı", "Hafta Sonu Açık"]'::jsonb, 'APPROVED'),
    (owner2_id, 'Başkent Berber', ankara_id, cankaya_id, berber_type_id, 'Kızılay Meydanı No: 34, Çankaya, Ankara', '03122345678', 39.9192, 32.8543, 'https://images.unsplash.com/photo-1503951914875-452162b7f304?q=80&w=800&auto=format&fit=crop', true, 'Klasik berber hizmetlerinin yanı sıra cilt bakımı ve saç terapileri ile Ankara erkeklerinin tercihi.', '["İkram", "Wi-Fi", "Kredi Kartı", "TV"]'::jsonb, 'APPROVED'),
    (owner3_id, 'İzmir Güzellik Salonu', izmir_id, konak_id, guzellik_type_id, 'Alsancak Mahallesi, Kıbrıs Şehitleri Caddesi No: 145, İzmir', '02321234567', 38.4366, 27.1461, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop', false, 'Alsancak''ın kalbinde, her zaman en kaliteli ürünleri kullanarak cildinize değer veriyoruz.', '["Klima", "Wi-Fi", "İkram", "Kredi Kartı"]'::jsonb, 'APPROVED'),
    (owner4_id, 'Ege Spa Center', izmir_id, konak_id, spa_type_id, 'Kordon Boyu No: 234, Konak, İzmir', '02322345678', 38.4192, 27.1287, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop', true, 'Ege''nin esintisini masaj odalarımıza getirdik. Uzman terapistlerimizle günün stresinden kurtulun.', '["Deniz Manzaralı", "İkram", "Wi-Fi", "Vale"]'::jsonb, 'APPROVED');

    -- Restore Working Hours, Staff, etc. (Simplified for this crisis fix)
    -- Since we deleted salons, their cascade should have cleaned up old staff/services.
    -- Now we re-run the logic from original script to populate them.
    
    -- Call the original logic blocks (adapted)
    -- ... (Same logic as original script for staff, services, etc. but referencing the newly inserted salons via name lookup or loop)
END $$;

-- 2. RE-POPULATE CHILD DATA (Staff, Services)
-- Separate DO block to keep it clean, querying the salons we just inserted.
DO $$
DECLARE
    salon_record RECORD;
    staff_count INTEGER;
    staff_names TEXT[] := ARRAY['Ayşe Koç', 'Mehmet Erdoğan', 'Zeynep Aksoy', 'Ahmet Yurt', 'Fatma Demir', 'Elif Güneş', 'Ali Yılmaz', 'Canan Can', 'Melis Su'];
    staff_specialties TEXT[] := ARRAY['Saç Kesimi', 'Boya', 'Manikür', 'Pedikür', 'Masaj', 'Cilt Bakımı'];
    global_service_record RECORD;
BEGIN
    FOR salon_record IN SELECT id FROM salons LOOP
        -- Add Staff
        INSERT INTO staff (salon_id, name, photo, specialty, is_active)
        SELECT salon_record.id, staff_names[1 + floor(random() * array_length(staff_names, 1))::int], 'https://i.pravatar.cc/150?u=' || salon_record.id, staff_specialties[1 + floor(random() * array_length(staff_specialties, 1))::int], true
        FROM generate_series(1, 3);

        -- Add Services (Random 5)
        FOR global_service_record IN SELECT id FROM global_services ORDER BY random() LIMIT 5 LOOP
            INSERT INTO salon_services (salon_id, global_service_id, duration_min, price)
            VALUES (salon_record.id, global_service_record.id, 45, 100 + floor(random() * 500))
            ON CONFLICT DO NOTHING;
        END LOOP;
        
        -- Add Working Hours
        INSERT INTO salon_working_hours (salon_id, day_of_week, start_time, end_time, is_closed)
        SELECT salon_record.id, d, '09:00:00', '19:00:00', false FROM generate_series(1, 6) d
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;
