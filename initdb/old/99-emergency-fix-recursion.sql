-- EMERGENCY FIX: RLS RECURSION
-- This script completely resets Profiles RLS to prevent "infinite recursion" error.

-- 1. Reset
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL suspect policies (Be exhaustive)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;

-- 3. Create a Safe Admin Check Function (SECURITY DEFINER is Key)
-- This function runs as the database owner (postgres), bypassing RLS enforcement.
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER -- Critical: Runs with owner privileges
SET search_path = public -- Critical: Prevents search_path hijacking
AS $$
BEGIN
  -- Direct check that bypasses RLS because of SECURITY DEFINER
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('SUPER_ADMIN', 'ADMIN')
  );
END;
$$;

-- 4. Re-Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Apply Clean Policies

-- A. SELF: Read/Update/Insert Own Profile
CREATE POLICY "profiles_self_all" ON public.profiles
    FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- B. ADMIN: View All (Uses the safe function)
CREATE POLICY "profiles_admin_view" ON public.profiles
    FOR SELECT
    USING (public.check_is_admin());

-- C. ADMIN: Update All (Uses the safe function)
CREATE POLICY "profiles_admin_update" ON public.profiles
    FOR UPDATE
    USING (public.check_is_admin());

-- 6. Verify Admin User Role
-- Ensure your admin user has the correct role
UPDATE public.profiles
SET role = 'SUPER_ADMIN'
WHERE email = 'admin@demo.com';

-- 7. Grant access to authenticated users to use the function (default is usually public)
GRANT EXECUTE ON FUNCTION public.check_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_is_admin() TO service_role;
