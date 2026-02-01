-- GuzellikRandevu Sample Business Data
-- Migration: Sample Salons, Staff, Services, Appointments
-- Created: 2025-12-22
-- This file adds sample business data for testing

-- ==============================================
-- 1. CREATE SAMPLE SALON OWNERS AND SALONS
-- ==============================================

-- Single DO block to create owners and salons together (no temp table needed)
DO $$
DECLARE
    owner1_id UUID := gen_random_uuid();
    owner2_id UUID := gen_random_uuid();
    owner3_id UUID := gen_random_uuid();
    owner4_id UUID := gen_random_uuid();
    owner5_id UUID := gen_random_uuid();
    istanbul_id UUID;
    ankara_id UUID;
    izmir_id UUID;
    kadikoy_id UUID;
    cankaya_id UUID;
    konak_id UUID;
    sisli_id UUID;
    besiktas_id UUID;
    kuafor_type_id UUID;
    berber_type_id UUID;
    guzellik_type_id UUID;
    spa_type_id UUID;
    makyaj_type_id UUID;
BEGIN
    -- Step 1: Create users in auth.users (simulating Supabase Auth signup)
    -- Password is hashed 'password123' (for testing only)
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data,
        created_at,
        updated_at,
        aud,
        role
    ) VALUES
    (owner1_id, 'owner1@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"full_name": "Mehmet Salon Sahibi"}'::jsonb, NOW(), NOW(), 'authenticated', 'authenticated'),
    (owner2_id, 'owner2@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"full_name": "Ayşe İşletmeci"}'::jsonb, NOW(), NOW(), 'authenticated', 'authenticated'),
    (owner3_id, 'owner3@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"full_name": "Ahmet Kuaför"}'::jsonb, NOW(), NOW(), 'authenticated', 'authenticated'),
    (owner4_id, 'owner4@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"full_name": "Zeynep Güzellik"}'::jsonb, NOW(), NOW(), 'authenticated', 'authenticated'),
    (owner5_id, 'owner5@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"full_name": "Can Berber"}'::jsonb, NOW(), NOW(), 'authenticated', 'authenticated');

    -- Step 2: Create owner profiles
    INSERT INTO public.profiles (id, email, full_name, phone, role) VALUES
    (owner1_id, 'owner1@example.com', 'Mehmet Salon Sahibi', '05551111111', 'SALON_OWNER'),
    (owner2_id, 'owner2@example.com', 'Ayşe İşletmeci', '05552222222', 'SALON_OWNER'),
    (owner3_id, 'owner3@example.com', 'Ahmet Kuaför', '05553333333', 'SALON_OWNER'),
    (owner4_id, 'owner4@example.com', 'Zeynep Güzellik', '05554444444', 'SALON_OWNER'),
    (owner5_id, 'owner5@example.com', 'Can Berber', '05555555555', 'SALON_OWNER')
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Created 5 sample salon owners (Password: password123 for testing)';

    -- Step 3: Get city IDs
    SELECT id INTO istanbul_id FROM cities WHERE name = 'İstanbul';
    SELECT id INTO ankara_id FROM cities WHERE name = 'Ankara';
    SELECT id INTO izmir_id FROM cities WHERE name = 'İzmir';

    -- Step 4: Get district IDs
    SELECT id INTO kadikoy_id FROM districts WHERE name = 'Kadıköy' AND city_id = istanbul_id;
    SELECT id INTO sisli_id FROM districts WHERE name = 'Şişli' AND city_id = istanbul_id;
    SELECT id INTO besiktas_id FROM districts WHERE name = 'Beşiktaş' AND city_id = istanbul_id;
    SELECT id INTO cankaya_id FROM districts WHERE name = 'Çankaya' AND city_id = ankara_id;
    SELECT id INTO konak_id FROM districts WHERE name = 'Konak' AND city_id = izmir_id;

    -- Step 5: Get salon type IDs
    SELECT id INTO kuafor_type_id FROM salon_types WHERE slug = 'kuafor';
    SELECT id INTO berber_type_id FROM salon_types WHERE slug = 'berber';
    SELECT id INTO guzellik_type_id FROM salon_types WHERE slug = 'guzellik';
    SELECT id INTO spa_type_id FROM salon_types WHERE slug = 'spa';
    SELECT id INTO makyaj_type_id FROM salon_types WHERE slug = 'makyaj';

    -- Step 6: Create salons with owner_id
    INSERT INTO salons (owner_id, name, city_id, district_id, type_id, address, phone, geo_latitude, geo_longitude, image, is_sponsored, description, features) VALUES
    -- Istanbul Salons
    (owner1_id, 'Stil Kuaför', istanbul_id, kadikoy_id, kuafor_type_id, 'Bahariye Caddesi No: 45, Kadıköy', '02161234567', 40.9875, 29.0245, 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=800&auto=format&fit=crop', true, 'İstanbul''un en köklü kuaförlerinden biri olarak, modern saç tasarımları ve profesyonel renklendirme hizmetleri sunuyoruz.', '["Wi-Fi", "İkram", "Kredi Kartı", "Klima"]'::jsonb),
    (owner2_id, 'Elit Berber Salonu', istanbul_id, sisli_id, berber_type_id, 'Halaskargazi Caddesi No: 123, Şişli', '02122345678', 41.0602, 28.9869, 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=800&auto=format&fit=crop', false, 'Geleneksel berber kültürünü modern spa deneyimiyle birleştiriyoruz. Sadece bir tıraş değil, kendinizi yenileyeceğiniz bir mola.', '["Wi-Fi", "Otopark", "İkram", "Kredi Kartı"]'::jsonb),
    (owner3_id, 'Güzellik Merkezi Luna', istanbul_id, besiktas_id, guzellik_type_id, 'Barbaros Bulvarı No: 78, Beşiktaş', '02123456789', 41.0422, 29.0078, 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?q=80&w=800&auto=format&fit=crop', true, 'Cilt bakımı, lazer epilasyon ve zayıflama ünitelerimizle, güzelliğinize bilimsel dokunuşlar yapıyoruz.', '["Özel Oda", "Valet", "Wi-Fi", "Kredi Kartı"]'::jsonb),
    (owner4_id, 'Zen Spa & Wellness', istanbul_id, besiktas_id, spa_type_id, 'Nişantaşı Mahallesi, Vali Konağı Caddesi No: 12', '02124567890', 41.0451, 28.9934, 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop', false, 'Şehrin gürültüsünden uzaklaşın. Profesyonel masaj terapilerimizle ruhunuzu ve bedeninizi dinlendirin.', '["Havuz", "Sauna", "Wi-Fi", "Otopark"]'::jsonb),
    (owner5_id, 'Makyaj Atölyesi Derya', istanbul_id, kadikoy_id, makyaj_type_id, 'Moda Caddesi No: 89, Kadıköy', '02165678901', 40.9876, 29.0289, 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=800&auto=format&fit=crop', false, 'Özel günlerinizde en doğal ve etkileyici makyaj tasarımları için uzman kadromuzla yanınızdayız.', '["Wi-Fi", "İkram", "Kredi Kartı"]'::jsonb),

    -- Ankara Salons
    (owner1_id, 'Ankara Kuaför Evi', ankara_id, cankaya_id, kuafor_type_id, 'Tunalı Hilmi Caddesi No: 56, Çankaya', '03121234567', 39.9180, 32.8549, 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=800&auto=format&fit=crop', false, 'Ankara''nın merkezinde, en yeni trendleri takip eden enerjik ekibimizle hizmetinizdeyiz.', '["Wi-Fi", "Kredi Kartı", "Hafta Sonu Açık"]'::jsonb),
    (owner2_id, 'Başkent Berber', ankara_id, cankaya_id, berber_type_id, 'Kızılay Meydanı No: 34, Çankaya', '03122345678', 39.9192, 32.8543, 'https://images.unsplash.com/photo-1503951914875-452162b7f304?q=80&w=800&auto=format&fit=crop', true, 'Klasik berber hizmetlerinin yanı sıra cilt bakımı ve saç terapileri ile Ankara erkeklerinin tercihi.', '["İkram", "Wi-Fi", "Kredi Kartı", "TV"]'::jsonb),

    -- İzmir Salons
    (owner3_id, 'İzmir Güzellik Salonu', izmir_id, konak_id, guzellik_type_id, 'Alsancak Mahallesi, Kıbrıs Şehitleri Caddesi No: 145', '02321234567', 38.4366, 27.1461, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop', false, 'Alsancak''ın kalbinde, her zaman en kaliteli ürünleri kullanarak cildinize değer veriyoruz.', '["Klima", "Wi-Fi", "İkram", "Kredi Kartı"]'::jsonb),
    (owner4_id, 'Ege Spa Center', izmir_id, konak_id, spa_type_id, 'Kordon Boyu No: 234, Konak', '02322345678', 38.4192, 27.1287, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop', true, 'Ege''nin esintisini masaj odalarımıza getirdik. Uzman terapistlerimizle günün stresinden kurtulun.', '["Deniz Manzaralı", "İkram", "Wi-Fi", "Vale"]'::jsonb);

    RAISE NOTICE 'Created 9 salons with descriptions and features';

    -- Step 7: Create salon working hours
    INSERT INTO salon_working_hours (salon_id, day_of_week, start_time, end_time, is_closed)
    SELECT s.id, d, '09:00:00', '21:00:00', false FROM salons s, generate_series(1, 5) d; -- Mon-Fri
    
    INSERT INTO salon_working_hours (salon_id, day_of_week, start_time, end_time, is_closed)
    SELECT s.id, 6, '10:00:00', '20:00:00', false FROM salons s; -- Sat
    
    INSERT INTO salon_working_hours (salon_id, day_of_week, start_time, end_time, is_closed)
    SELECT s.id, 0, '09:00:00', '18:00:00', true FROM salons s; -- Sun
END $$;

-- ==============================================
-- 2. SAMPLE STAFF
-- ==============================================

DO $$
DECLARE
    salon_record RECORD;
    staff_count INTEGER;
    staff_names TEXT[] := ARRAY[
        'Ayşe Koç', 'Mehmet Erdoğan', 'Zeynep Aksoy', 'Ahmet Yurt', 'Fatma Demir',
        'Elif Güneş', 'Mustafa Kılıç', 'Selin Yavuz', 'Can Çelik', 'Büşra Arslan',
        'Emre Özkan', 'Merve Şahin', 'Burak Toprak', 'Deniz Acar', 'Ceren Polat',
        'Oğuz Öztürk', 'Gizem Uzun', 'Barış Kaya', 'Nazlı Yılmaz', 'Serkan Şimşek',
        'Pınar Aydın', 'Kerem Aslan', 'Eylül Demirci', 'Mert Yıldız', 'Seda Özdemir',
        'Tolga Çetin', 'İrem Şen', 'Ege Aksoy', 'Damla Kurt', 'Berkay Demir'
    ];
    staff_specialties TEXT[] := ARRAY[
        'Saç Kesimi ve Boyama', 'Sakal Tıraşı ve Şekillendirme', 'Makyaj ve Cilt Bakımı',
        'Masaj Terapisti', 'Tırnak Tasarımı ve Bakımı', 'Kaş ve Kirpik Uygulamaları',
        'Saç Bakımı Uzmanı', 'Epilasyon Uzmanı', 'Kalıcı Makyaj', 'Cilt Analizi ve Bakım',
        'Medikal Estetik', 'Saç Dökülmesi Tedavisi', 'Protez Tırnak Uygulaması',
        'Gelin Saçı ve Makyajı', 'Keratin ve Botoks Uygulaması'
    ];
    random_name TEXT;
    random_specialty TEXT;
BEGIN
    -- Add 3-5 staff members for each salon with random names
    FOR salon_record IN SELECT id, name FROM salons LOOP
        staff_count := 3 + floor(random() * 3)::INTEGER; -- Random 3-5 staff per salon

        FOR i IN 1..staff_count LOOP
            -- Get random name and specialty
            random_name := staff_names[1 + floor(random() * array_length(staff_names, 1))::INTEGER];
            random_specialty := staff_specialties[1 + floor(random() * array_length(staff_specialties, 1))::INTEGER];

            INSERT INTO staff (salon_id, name, photo, specialty, is_active) VALUES
            (
                salon_record.id,
                random_name,
                'https://i.pravatar.cc/300?img=' || (1 + floor(random() * 70)::INTEGER)::TEXT,
                random_specialty,
                CASE WHEN random() > 0.1 THEN true ELSE false END -- 90% active, 10% inactive
            );
        END LOOP;
    END LOOP;
END $$;

-- ==============================================
-- 3. SAMPLE SALON SERVICES
-- ==============================================

DO $$
DECLARE
    salon_record RECORD;
    global_service_record RECORD;
    service_count INTEGER := 0;
BEGIN
    -- For each salon, add 5-8 random services from global services
    FOR salon_record IN SELECT id FROM salons LOOP
        service_count := 0;

        -- Get random global services (limit to 8 per salon)
        FOR global_service_record IN
            SELECT id FROM global_services
            ORDER BY RANDOM()
            LIMIT 5 + floor(random() * 4)::INTEGER
        LOOP
            INSERT INTO salon_services (salon_id, global_service_id, duration_min, price)
            VALUES (
                salon_record.id,
                global_service_record.id,
                30 + (floor(random() * 6) * 15)::INTEGER, -- Random: 30, 45, 60, 75, 90, 105 min
                50 + (floor(random() * 20) * 25)::DECIMAL -- Random: 50-525 TL
            )
            ON CONFLICT (salon_id, global_service_id) DO NOTHING;

            service_count := service_count + 1;
        END LOOP;
    END LOOP;
END $$;

-- ==============================================
-- 4. SAMPLE WORKING HOURS
-- ==============================================

DO $$
DECLARE
    staff_record RECORD;
    day INTEGER;
BEGIN
    -- Set working hours for all staff (Monday-Saturday, 9:00-18:00)
    FOR staff_record IN SELECT id FROM staff LOOP
        FOR day IN 1..6 LOOP -- Monday to Saturday
            INSERT INTO working_hours (staff_id, day_of_week, start_time, end_time, is_day_off)
            VALUES (
                staff_record.id,
                day,
                '09:00:00',
                '18:00:00',
                false
            );
        END LOOP;

        -- Sunday is day off
        INSERT INTO working_hours (staff_id, day_of_week, start_time, end_time, is_day_off)
        VALUES (
            staff_record.id,
            0, -- Sunday
            '09:00:00',
            '18:00:00',
            true
        );
    END LOOP;
END $$;

-- ==============================================
-- 5. SAMPLE APPOINTMENTS (Guest Bookings)
-- ==============================================
-- Note: These appointments use customer_name and customer_phone
-- For logged-in users, customer_id would be used instead

DO $$
DECLARE
    salon_record RECORD;
    staff_id_var UUID;
    service_id_var UUID;
    service_duration_var INTEGER;
    appointment_date TIMESTAMPTZ;
    appointment_count INTEGER;
BEGIN
    -- Create 3-5 appointments per salon for the next 7 days
    FOR salon_record IN SELECT id FROM salons LOOP
        appointment_count := 3 + floor(random() * 3)::INTEGER;

        FOR i IN 1..appointment_count LOOP
            -- Get random staff from this salon
            SELECT id INTO staff_id_var FROM staff
            WHERE salon_id = salon_record.id AND is_active = true
            ORDER BY RANDOM()
            LIMIT 1;

            -- Skip if no staff found
            IF staff_id_var IS NULL THEN
                CONTINUE;
            END IF;

            -- Get random service from this salon
            SELECT id, duration_min INTO service_id_var, service_duration_var FROM salon_services
            WHERE salon_id = salon_record.id
            ORDER BY RANDOM()
            LIMIT 1;

            -- Skip if no service found
            IF service_id_var IS NULL THEN
                CONTINUE;
            END IF;

            -- Random date in next 7 days, between 10:00-16:00
            appointment_date := NOW() +
                (floor(random() * 7)::INTEGER || ' days')::INTERVAL +
                ((10 + floor(random() * 6))::INTEGER || ' hours')::INTERVAL +
                ((floor(random() * 4) * 15)::INTEGER || ' minutes')::INTERVAL; -- 15-minute intervals

            -- Try to insert appointment, skip if there's a conflict
            BEGIN
                INSERT INTO appointments (
                    customer_name,
                    customer_phone,
                    salon_id,
                    staff_id,
                    salon_service_id,
                    start_time,
                    end_time,
                    status,
                    notes
                ) VALUES (
                    CASE (i % 10)
                        WHEN 0 THEN 'Ahmet Yılmaz'
                        WHEN 1 THEN 'Ayşe Kaya'
                        WHEN 2 THEN 'Mehmet Demir'
                        WHEN 3 THEN 'Zeynep Çelik'
                        WHEN 4 THEN 'Fatma Şahin'
                        WHEN 5 THEN 'Ali Yıldız'
                        WHEN 6 THEN 'Elif Öztürk'
                        WHEN 7 THEN 'Can Arslan'
                        WHEN 8 THEN 'Selin Aydın'
                        ELSE 'Burak Özdemir'
                    END,
                    '555' || lpad((1000000 + floor(random() * 9000000))::TEXT, 7, '0'),
                    salon_record.id,
                    staff_id_var,
                    service_id_var,
                    appointment_date,
                    appointment_date + (service_duration_var || ' minutes')::INTERVAL,
                    (CASE (i % 4)
                        WHEN 0 THEN 'PENDING'
                        WHEN 1 THEN 'CONFIRMED'
                        WHEN 2 THEN 'COMPLETED'
                        ELSE 'CONFIRMED'
                    END)::appt_status,
                    CASE (i % 3)
                        WHEN 0 THEN 'İlk randevum'
                        WHEN 1 THEN NULL
                        ELSE 'Lütfen zamanında gelebilir miyim kontrol edin'
                    END
                );
            EXCEPTION
                WHEN exclusion_violation THEN
                    -- Skip this appointment if there's a conflict
                    NULL;
            END;
        END LOOP;
    END LOOP;
END $$;

-- ==============================================
-- 6. SAMPLE REVIEWS
-- ==============================================

DO $$
DECLARE
    salon_record RECORD;
    review_count INTEGER;
BEGIN
    -- Add 5-10 reviews for each salon
    FOR salon_record IN SELECT id FROM salons LOOP
        review_count := 5 + floor(random() * 6)::INTEGER;

        FOR i IN 1..review_count LOOP
            INSERT INTO reviews (
                salon_id,
                user_name,
                user_avatar,
                rating,
                comment,
                created_at
            ) VALUES (
                salon_record.id,
                CASE (i % 15)
                    WHEN 0 THEN 'Ahmet Y.'
                    WHEN 1 THEN 'Ayşe K.'
                    WHEN 2 THEN 'Mehmet D.'
                    WHEN 3 THEN 'Zeynep Ç.'
                    WHEN 4 THEN 'Fatma Ş.'
                    WHEN 5 THEN 'Ali Y.'
                    WHEN 6 THEN 'Elif Ö.'
                    WHEN 7 THEN 'Can A.'
                    WHEN 8 THEN 'Selin A.'
                    WHEN 9 THEN 'Burak Ö.'
                    WHEN 10 THEN 'Deniz T.'
                    WHEN 11 THEN 'Ece M.'
                    WHEN 12 THEN 'Kerem S.'
                    WHEN 13 THEN 'Merve B.'
                    ELSE 'Onur K.'
                END,
                'https://i.pravatar.cc/150?img=' || (i + 40)::TEXT,
                3 + floor(random() * 3)::INTEGER, -- Rating 3-5
                CASE (i % 8)
                    WHEN 0 THEN 'Çok memnun kaldım, kesinlikle tavsiye ederim.'
                    WHEN 1 THEN 'Personel çok ilgili ve profesyonel.'
                    WHEN 2 THEN 'Fiyatlar uygun, hizmet kalitesi çok iyi.'
                    WHEN 3 THEN 'Harika bir deneyimdi, tekrar geleceğim.'
                    WHEN 4 THEN 'Salon temiz ve modern, çalışanlar güler yüzlü.'
                    WHEN 5 THEN 'Randevu sistemi çok pratik, işimi kolaylaştırdı.'
                    WHEN 6 THEN 'Beklentilerimin üzerinde bir hizmet aldım.'
                    ELSE 'Fena değil ama daha iyi olabilir.'
                END,
                NOW() - (floor(random() * 90)::INTEGER || ' days')::INTERVAL
            );
        END LOOP;
    END LOOP;
END $$;

-- ==============================================
-- 7. SAMPLE IYS LOGS
-- ==============================================

INSERT INTO iys_logs (phone, message_type, content, status) VALUES
('5551234567', 'OTP', 'Doğrulama kodunuz: 123456', 'SENT'),
('5552345678', 'INFO', 'Randevunuz yarın saat 14:00''de.', 'SENT'),
('5553456789', 'CAMPAIGN', 'Bu hafta %20 indirim fırsatı!', 'SENT'),
('5554567890', 'OTP', 'Doğrulama kodunuz: 789012', 'SENT'),
('5555678901', 'INFO', 'Randevunuz iptal edilmiştir.', 'FAILED'),
('5556789012', 'INFO', 'Randevunuz onaylandı.', 'SENT'),
('5557890123', 'CAMPAIGN', 'Yeni hizmetlerimizi keşfedin!', 'DEMO');

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Sample business data loaded successfully!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Salons: %', (SELECT COUNT(*) FROM salons);
    RAISE NOTICE 'Staff: %', (SELECT COUNT(*) FROM staff);
    RAISE NOTICE 'Salon Services: %', (SELECT COUNT(*) FROM salon_services);
    RAISE NOTICE 'Working Hours: %', (SELECT COUNT(*) FROM working_hours);
    RAISE NOTICE 'Appointments: %', (SELECT COUNT(*) FROM appointments);
    RAISE NOTICE 'Reviews: %', (SELECT COUNT(*) FROM reviews);
    RAISE NOTICE 'IYS Logs: %', (SELECT COUNT(*) FROM iys_logs);
    RAISE NOTICE '==============================================';

    -- Show sample data summary
    RAISE NOTICE '';
    RAISE NOTICE 'Sample Salons by Type:';

    -- Note: This summary is shown by the counts above
    -- FOR loop removed to fix syntax error
END $$;

