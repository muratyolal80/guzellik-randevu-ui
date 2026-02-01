-- DEBUG SCRIPT
-- RUN THIS IN SUPABASE EDITOR TO FIX ADMIN ROLE

-- 1. Ensure RLS is fixed properly (Re-run the recursive safe version just in case)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Basic Self-Read (No recursion)
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- 2. Force Update Admin Role
-- Replace 'admin@demo.com' with your exact login email
UPDATE public.profiles
SET role = 'SUPER_ADMIN'
WHERE email = 'admin@demo.com';

-- 3. Verify
SELECT * FROM public.profiles WHERE email = 'admin@demo.com';
