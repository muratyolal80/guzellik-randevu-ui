-- Create Demo/Test Users for Platform Testing
-- Run this AFTER running all other migrations

DO $$
DECLARE
    v_admin_id UUID;
    v_owner_id UUID;
    v_staff_id UUID;
    v_customer_id UUID;
    v_salon_id UUID;
    v_staff_profile_id UUID;
BEGIN
    -- ==============================================
    -- 1. SUPER ADMIN
    -- ==============================================
    -- Insert auth user (email: admin@demo.com, password: password123)
    -- Note: You need to create this user through Supabase Auth UI or API
    -- This script only creates the profile
    
    -- Check if admin profile exists
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@demo.com';
    
    IF v_admin_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, full_name, role, created_at)
        VALUES (v_admin_id, 'admin@demo.com', 'Super Admin', 'SUPER_ADMIN', NOW())
        ON CONFLICT (id) DO UPDATE SET role = 'SUPER_ADMIN', full_name = 'Super Admin';
        
        RAISE NOTICE 'Admin profile created: %', v_admin_id;
    END IF;

    -- ==============================================
    -- 2. SALON OWNER + Sample Salon
    -- ==============================================
    SELECT id INTO v_owner_id FROM auth.users WHERE email = 'owner@demo.com';
    
    IF v_owner_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, full_name, role, created_at)
        VALUES (v_owner_id, 'owner@demo.com', 'Demo Salon Owner', 'SALON_OWNER', NOW())
        ON CONFLICT (id) DO UPDATE SET role = 'SALON_OWNER', full_name = 'Demo Salon Owner';
        
        -- Create a demo salon for this owner
        INSERT INTO public.salons (
            owner_id, name, city_id, district_id, type_id,
            address, phone, geo_latitude, geo_longitude, 
            image, description, status, is_sponsored
        )
        SELECT 
            v_owner_id,
            'Demo Luxury Salon',
            (SELECT id FROM public.cities WHERE name = 'İstanbul' LIMIT 1),
            (SELECT id FROM public.districts WHERE name = 'Kadıköy' LIMIT 1),
            (SELECT id FROM public.salon_types WHERE slug = 'kuafor' LIMIT 1),
            'Bağdat Caddesi No: 123, Kadıköy',
            '0216 555 0001',
            40.9888,
            29.0286,
            'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
            'Test ve demo amaçlı oluşturulmuş örnek salon',
            'APPROVED',
            true
        RETURNING id INTO v_salon_id
        ON CONFLICT (owner_id) DO NOTHING;
        
        RAISE NOTICE 'Owner profile and salon created: % / %', v_owner_id, v_salon_id;
    END IF;

    -- ==============================================
    -- 3. STAFF MEMBER
    -- ==============================================
    SELECT id INTO v_staff_id FROM auth.users WHERE email = 'staff@demo.com';
    
    IF v_staff_id IS NOT NULL AND v_salon_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, full_name, role, created_at)
        VALUES (v_staff_id, 'staff@demo.com', 'Demo Staff Member', 'STAFF', NOW())
        ON CONFLICT (id) DO UPDATE SET role = 'STAFF', full_name = 'Demo Staff Member';
        
        -- Create staff entry in the salon
        INSERT INTO public.staff (
            salon_id, user_id, name, specialty, bio, is_active
        )
        VALUES (
            v_salon_id,
            v_staff_id,
            'Demo Staff Member',
            'Saç Kesimi & Boyama',
            'Test kullanıcısı - Örnek personel',
            true
        )
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE NOTICE 'Staff profile created: %', v_staff_id;
    END IF;

    -- ==============================================
    -- 4. CUSTOMER
    -- ==============================================
    SELECT id INTO v_customer_id FROM auth.users WHERE email = 'customer@demo.com';
    
    IF v_customer_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, full_name, role, created_at)
        VALUES (v_customer_id, 'customer@demo.com', 'Demo Customer', 'CUSTOMER', NOW())
        ON CONFLICT (id) DO UPDATE SET role = 'CUSTOMER', full_name = 'Demo Customer';
        
        RAISE NOTICE 'Customer profile created: %', v_customer_id;
    END IF;

END $$;

-- ==============================================
-- Add sample services to demo salon
-- ==============================================
DO $$
DECLARE
    v_salon_id UUID;
    v_service_id UUID;
BEGIN
    SELECT id INTO v_salon_id FROM public.salons WHERE name = 'Demo Luxury Salon' LIMIT 1;
    
    IF v_salon_id IS NOT NULL THEN
        -- Add some services
        INSERT INTO public.salon_services (salon_id, global_service_id, duration_min, price)
        SELECT 
            v_salon_id,
            gs.id,
            60,
            CASE 
                WHEN gs.name ILIKE '%kesim%' THEN 150.00
                WHEN gs.name ILIKE '%boya%' THEN 500.00
                WHEN gs.name ILIKE '%fön%' THEN 100.00
                ELSE 200.00
            END
        FROM public.global_services gs
        WHERE gs.name IN ('Saç Kesimi', 'Saç Boyama', 'Fön', 'Manikür')
        LIMIT 4
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Sample services added to demo salon';
    END IF;
END $$;

-- ==============================================
-- IMPORTANT: Create Auth Users First!
-- ==============================================
-- Before running this script, create these users via Supabase Auth:
-- 
-- 1. admin@demo.com / password123 (SUPER_ADMIN)
-- 2. owner@demo.com / password123 (SALON_OWNER)
-- 3. staff@demo.com / password123 (STAFF)
-- 4. customer@demo.com / password123 (CUSTOMER)
--
-- You can do this via Supabase Dashboard > Authentication > Users > Add User
-- Or via the Auth API programmatically
