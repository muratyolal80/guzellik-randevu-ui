-- New-15-Test-User.sql
-- Create a known test user for owner panel verification

-- 1. Create user in auth.users
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_challenge
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'f0e1d2c3-b4a5-46d7-8e9f-0a1b2c3d4e5f',
    'authenticated',
    'authenticated',
    'test@owner.com',
    crypt('123456', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"role":"SALON_OWNER","full_name":"Test İşletme Sahibi"}',
    now(),
    now(),
    '',
    ''
) ON CONFLICT (email) DO NOTHING;

-- 2. Ensure profile exists (it might be created by trigger, but let's be safe)
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
    'f0e1d2c3-b4a5-46d7-8e9f-0a1b2c3d4e5f',
    'test@owner.com',
    'Test İşletme Sahibi',
    'SALON_OWNER'
) ON CONFLICT (id) DO NOTHING;

-- 3. Create a demo salon for this user to avoid being stuck in onboarding
INSERT INTO public.salons (id, name, owner_id, city_id, district_id, type_id, status, is_verified)
VALUES (
    '12341234-1234-1234-1234-123412341234',
    'Test Salonu (Admin)',
    'f0e1d2c3-b4a5-46d7-8e9f-0a1b2c3d4e5f',
    'db32470f-626d-4dae-88a6-056690867bc2', -- İstanbul
    'c8bcc880-52f4-4381-9c81-1a1e8f912894', -- Kadıköy
    '5188bddf-7d18-4bcb-a274-6dfa07ad8f17', -- Kuaför
    'APPROVED',
    true
) ON CONFLICT (id) DO NOTHING;
