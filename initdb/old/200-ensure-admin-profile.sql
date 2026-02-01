-- FORCE ADMIN PROFILE SYNC
-- Run this to ensure the profile row exists and is linked to the auth user

-- 1. Insert/Update the profile for admin@demo.com
INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', 'System Admin'), 
    'SUPER_ADMIN', 
    ''
FROM auth.users
WHERE email = 'admin@demo.com'
ON CONFLICT (id) DO UPDATE
SET 
    role = 'SUPER_ADMIN',
    email = EXCLUDED.email; -- Refresh email just in case

-- 2. Verify and Return Result
SELECT * FROM public.profiles WHERE email = 'admin@demo.com';
