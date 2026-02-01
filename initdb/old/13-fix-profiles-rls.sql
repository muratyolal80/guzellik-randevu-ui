-- FIX: Profiles RLS Policy Check Infinite Recursion
-- We use a Security Definer function to safely check for admin role without triggering infinite recursion loop

-- 1. Helper Function: Is Admin?
-- Runs with privileges of the creator (postgres), bypassing RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('SUPER_ADMIN', 'ADMIN')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Clean up old policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;


-- 3. New Policies using the safe function

-- A. Users can read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- B. Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- C. Admins can read all profiles (Using the function prevents recursion)
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.is_admin());

-- D. Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (public.is_admin());
