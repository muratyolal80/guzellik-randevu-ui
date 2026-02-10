-- ULTIMATE RESET: PROFILES + TRIGGERS
-- If recursion persists, it might be a Trigger or a deeply cached Policy issue.

-- 1. Disable RLS Completely first
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL Policies explicitly by name (accumulated garbage)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_view" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;

-- 3. Drop Triggers that might access profiles (Potential recursion source)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
-- We keep 'on_auth_user_created' as it's on auth.users, not profiles directly, but let's be safe.

-- 4. Re-Define the Helper Function with extreme isolation
CREATE OR REPLACE FUNCTION public.check_is_admin_v2()
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_role public.user_role;
BEGIN
  -- Select specific column into variable to minimize overhead
  SELECT role INTO v_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN v_role IN ('SUPER_ADMIN', 'ADMIN');
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE; -- Fail safe
END;
$$;

-- 5. Re-Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Simple Policies (Start with ONLY Self-Read to verify)

-- A. SELF READ (No recursion possible here, it compares ID)
CREATE POLICY "p_self_read" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- B. SELF UPDATE
CREATE POLICY "p_self_update" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- C. ADMIN (Uses the v2 function)
CREATE POLICY "p_admin_all" ON public.profiles
    FOR ALL
    USING (public.check_is_admin_v2());

-- 7. Grant access
GRANT EXECUTE ON FUNCTION public.check_is_admin_v2() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_is_admin_v2() TO service_role;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- 8. Force role update again
UPDATE public.profiles SET role = 'SUPER_ADMIN' WHERE email = 'admin@demo.com';
