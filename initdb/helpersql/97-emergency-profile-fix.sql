-- EMERGENCY FIX: Profiles RLS Policies + Missing User

-- 1. CREATE MISSING PROFILE FOR CURRENT USER
-- User ID from error: 8feb244e-05c7-48c7-9768-8793a0e56c3a
INSERT INTO public.profiles (id, email, full_name, role) VALUES 
('8feb244e-05c7-48c7-9768-8793a0e56c3a', 'current_user@example.com', 'Current User', 'SALON_OWNER')
ON CONFLICT (id) DO UPDATE 
SET role = 'SALON_OWNER',
    updated_at = NOW();

-- 2. FIX RLS POLICIES (ADD MISSING INSERT POLICY)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public can view all profiles (needed for owner verification)
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
CREATE POLICY "Public profiles are viewable" 
ON public.profiles FOR SELECT 
USING (true);

-- Users can insert their own profile (signup)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 3. VERIFY CURRENT STATE
SELECT 'Current user profile:' as info;
SELECT id, email, full_name, role 
FROM public.profiles 
WHERE id = '8feb244e-05c7-48c7-9768-8793a0e56c3a';

SELECT 'All profiles count:' as info;
SELECT COUNT(*) as total_profiles FROM public.profiles;
