-- Seed data for myolal (Specific UUID: f9821af5-3930-4a83-8de9-8d434e7155aa)
-- Fixed script to resolve Service IDs dynamically if provided ones are invalid

DO $$
DECLARE
    target_user_id UUID := 'f9821af5-3930-4a83-8de9-8d434e7155aa';
    
    -- Specific IDs provided
    target_salon_id_1 UUID := '5c4d7c4e-aa02-46a1-82f6-64bf09fc26cf';
    target_staff_id_1 UUID := '048faf66-bd96-4d17-8278-9d9e6ec5c375';
    -- service_id_1 provided was invalid (typo), will fetch dynamically
    
    target_salon_id_2 UUID := '412d5fb0-c9df-45c5-b34a-41fba5c94115';
    target_staff_id_2 UUID := '0c51dac0-ba80-4d63-978d-6ef17b7a9eff';
    target_service_id_2 UUID := '161c6f45-e425-4bf9-bfb4-d871a379c779';
    
    -- Variables to hold valid IDs
    v_service_id_1 UUID;
    v_service_id_2 UUID;
BEGIN
    -- 1. Ensure the profile exists/matches the ID
    UPDATE public.profiles 
    SET 
        full_name = 'Murat Yolal',
        phone = '05332604879',
        role = 'CUSTOMER',
        birth_date = '1990-01-01'
    WHERE id = target_user_id;

    -- 2. Validate/Fetch Service IDs
    
    -- For Salon 1: Try to find a service. 
    -- We ignore the provided faulty ID '140d8506d...' and just grab the first valid service for this salon.
    SELECT id INTO v_service_id_1 
    FROM public.salon_services 
    WHERE salon_id = target_salon_id_1 
    LIMIT 1;

    IF v_service_id_1 IS NULL THEN
        RAISE NOTICE 'No service found for Salon 1, cannot create appointment 1';
    END IF;

    -- For Salon 2: Try to use the provided ID, if not exists, pick one.
    SELECT id INTO v_service_id_2 
    FROM public.salon_services 
    WHERE id = target_service_id_2;

    IF v_service_id_2 IS NULL THEN
         SELECT id INTO v_service_id_2 
         FROM public.salon_services 
         WHERE salon_id = target_salon_id_2 
         LIMIT 1;
    END IF;

    -- 3. Create Appointments
    
    -- Appointment 1
    IF v_service_id_1 IS NOT NULL THEN
        INSERT INTO public.appointments (
            salon_id, staff_id, salon_service_id, start_time, end_time, status, notes, customer_name, customer_phone
        )
        VALUES (
            target_salon_id_1, 
            target_staff_id_1,
            v_service_id_1,
            NOW() + INTERVAL '2 days' + INTERVAL '14 hours',
            NOW() + INTERVAL '2 days' + INTERVAL '15 hours',
            'CONFIRMED',
            'Saç kesimi istiyorum',
            'Murat Yolal',
            '05332604879'
        );
    END IF;

    -- Appointment 2
    IF v_service_id_2 IS NOT NULL THEN
        INSERT INTO public.appointments (
            salon_id, staff_id, salon_service_id, start_time, end_time, status, notes, customer_name, customer_phone
        )
        VALUES (
            target_salon_id_2, 
            target_staff_id_2,
            v_service_id_2,
            NOW() - INTERVAL '10 days',
            NOW() - INTERVAL '10 days' + INTERVAL '1 hour',
            'COMPLETED',
            'Harika hizmet',
            'Murat Yolal',
            '05332604879'
        );
    END IF;

    -- 4. Add Favorites
    INSERT INTO public.favorites (user_id, salon_id) VALUES 
    (target_user_id, target_salon_id_1),
    (target_user_id, target_salon_id_2)
    ON CONFLICT (user_id, salon_id) DO NOTHING;

    -- 5. Add Notifications
    INSERT INTO public.notifications (user_id, title, message, type, is_read) VALUES
    (target_user_id, 'Hoşgeldiniz', 'Güzellik Randevu dünyasına hoşgeldiniz!', 'SYSTEM', TRUE),
    (target_user_id, 'Randevu Hatırlatma', 'Yarınki randevunuzu unutmayın.', 'REMINDER', FALSE),
    (target_user_id, 'Kampanya', 'Hafta sonuna özel %20 indirim.', 'PROMOTION', FALSE);

    -- 6. Add Support Ticket
    INSERT INTO public.support_tickets (user_id, subject, message, status) VALUES
    (target_user_id, 'Mobil Uygulama', 'Mobil uygulamanız ne zaman çıkacak?', 'OPEN');

END $$;
