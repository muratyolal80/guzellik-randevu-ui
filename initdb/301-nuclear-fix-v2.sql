-- NUCLEAR FIX V2: SCHEMA AGNOSTIC
-- This script fixes RLS without assuming 'full_name' column exists.

-- 1. Disable RLS
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Drop Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "p_self_read" ON public.profiles;
DROP POLICY IF EXISTS "p_self_update" ON public.profiles;
DROP POLICY IF EXISTS "p_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_view" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
DROP POLICY IF EXISTS "simple_self_access" ON public.profiles;
DROP POLICY IF EXISTS "admin_super_access" ON public.profiles;

-- 3. Drop Triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- 4. Re-Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Simple Self Access Rule
CREATE POLICY "simple_self_access" ON public.profiles
    FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 6. Super Admin Access Rule (Via Auth Email)
-- Bypass profile table recursion by checking auth.users directly
CREATE POLICY "admin_super_access" ON public.profiles
    FOR ALL
    USING (
       auth.uid() IN (SELECT id FROM auth.users WHERE email = 'admin@demo.com')
    );

-- 7. Ensure Admin Profile Exists (Safe Insert - No Names)
-- Only insert ID, Email, Role. Let other columns be null/default.
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'SUPER_ADMIN'
FROM auth.users 
WHERE email = 'admin@demo.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'SUPER_ADMIN';
