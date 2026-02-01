
-- Create Admin User
-- GuzellikRandevu Database
-- Created: 2025-12-25

-- ============================================================
-- INSTRUCTIONS FOR CREATING ADMIN USER
-- ============================================================
-- This file provides SQL to promote a user to admin role.
-- You must first create the user account through one of these methods:
--
-- METHOD 1: Via Supabase Dashboard (Recommended)
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User"
-- 3. Email: admin@guzellikrandevu.com
-- 4. Password: [your-secure-password]
-- 5. Auto Confirm User: Yes (check this box)
-- 6. Then run the UPDATE query below
--
-- METHOD 2: Via Application Registration
-- 1. Go to your app's /register page
-- 2. Register with email: admin@guzellikrandevu.com
-- 3. Complete email verification if required
-- 4. Then run the UPDATE query below
--
-- METHOD 3: Via Supabase SQL Editor (for existing users)
-- 1. If user already exists in auth.users
-- 2. Run the UPDATE query below
-- ============================================================

-- Update user to admin role
-- Replace 'admin@guzellikrandevu.com' with your desired admin email
UPDATE public.profiles
SET
    role = 'SALON_OWNER'::user_role,
    updated_at = NOW()
WHERE email = 'furkanyolal0@gmail.com';

-- Verify the admin user was created/updated
SELECT
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at
FROM public.profiles
WHERE role = 'SALON_OWNER'::user_role;

-- ============================================================
-- CREATING ADDITIONAL ADMIN USERS
-- ============================================================
-- To create more admin users, repeat the process:
-- 1. Create the user account (via Dashboard or Registration)
-- 2. Run the UPDATE query with their email
--
-- Example:
-- UPDATE public.profiles
-- SET role = 'admin'::user_role, updated_at = NOW()
-- WHERE email = 'another-admin@example.com';
-- ============================================================

-- ============================================================
-- SECURITY NOTES
-- ============================================================
-- 1. Keep admin credentials secure
-- 2. Use strong passwords (minimum 12 characters recommended)
-- 3. Enable 2FA in Supabase Dashboard for admin accounts
-- 4. Regularly audit admin users:
--    SELECT email, role, created_at FROM public.profiles WHERE role = 'admin';
-- 5. The database trigger automatically creates profiles with 'user' role
-- 6. Only manually promote trusted users to 'admin' role
-- ============================================================

-- ============================================================
-- TROUBLESHOOTING
-- ============================================================
-- If user is not showing as admin:
--
-- 1. Check if profile exists:
--    SELECT * FROM public.profiles WHERE email = 'admin@guzellikrandevu.com';
--
-- 2. Check if user exists in auth:
--    SELECT id, email, confirmed_at FROM auth.users WHERE email = 'admin@guzellikrandevu.com';
--
-- 3. If profile doesn't exist but user does, manually create it:
--    INSERT INTO public.profiles (id, email, full_name, role)
--    SELECT id, email, raw_user_meta_data->>'full_name', 'admin'::user_role
--    FROM auth.users WHERE email = 'admin@guzellikrandevu.com';
--
-- 4. Clear browser cache and cookies, then login again
-- 5. Check middleware/proxy logs for errors
-- ============================================================

