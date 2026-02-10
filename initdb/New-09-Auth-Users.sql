-- Create Sync Auth Users
-- This script creates users in auth.users ensuring they can login with a default password.
-- Default Password for all users: "123456"

INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
)
VALUES
    (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'admin@kuafor.com',
        crypt('123456', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"role":"SUPER_ADMIN","full_name":"Sistem Admin"}',
        now(),
        now(),
        '',
        '',
        '',
        ''
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'ahmet@berber.com',
        crypt('123456', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"role":"SALON_OWNER","full_name":"Ahmet Makasçı"}',
        now(),
        now(),
        '',
        '',
        '',
        ''
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'ayse@kuafor.com',
        crypt('123456', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"role":"SALON_OWNER","full_name":"Ayşe Tarak"}',
        now(),
        now(),
        '',
        '',
        '',
        ''
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'mehmet@musteri.com',
        crypt('123456', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"role":"CUSTOMER","full_name":"Mehmet Yılmaz"}',
        now(),
        now(),
        '',
        '',
        '',
        ''
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'zeynep@musteri.com',
        crypt('123456', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"role":"CUSTOMER","full_name":"Zeynep Demir"}',
        now(),
        now(),
        '',
        '',
        '',
        ''
    )
ON CONFLICT (email) DO NOTHING;

-- Note: The trigger 'handle_new_user' on auth.users (if exists) might create profiles automatically.
-- If conflict occurs with New-07-Seed-Data.sql id, the UUIDs here are random and won't match old integer IDs from public.users.
-- This is a point of friction: public.users uses BIGINT, auth.users uses UUID.
-- The app logic seems to have moved to UUID (profiles) but legacy data remains in public.users.
-- This script enables LOGIN. Data linking might require manual update if app uses integer IDs for FKs.
