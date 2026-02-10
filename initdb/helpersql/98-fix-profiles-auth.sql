-- CRITICAL FIX: Profiles Table Recovery
-- This script creates missing profile entries from Supabase Auth

-- 1. Check current AUTH users and create missing profiles
-- Note: This query uses auth.users which might not be directly accessible from SQL Editor
-- We'll manually create the test profiles first

-- Delete old test profiles with wrong IDs
DELETE FROM public.profiles WHERE email IN ('owner@example.com', 'admin@example.com');

-- Insert test profiles with ACTUAL Supabase Auth UUIDs
-- IMPORTANT: You need to replace these UUIDs with your ACTUAL Auth user IDs
-- To get them, go to: Authentication > Users in Supabase Dashboard

-- Example structure (REPLACE IDs with real ones):
-- INSERT INTO public.profiles (id, email, full_name, role) VALUES 
-- ('YOUR-REAL-AUTH-UUID-HERE', 'owner@example.com', 'Test Salon Sahibi', 'SALON_OWNER');

-- For now, let's check what UUIDs we have in salons.owner_id
DO $$
DECLARE
    v_owner_ids text[];
    v_owner_id text;
BEGIN
    -- Get all unique owner_ids from salons table
    SELECT ARRAY_AGG(DISTINCT owner_id::text) INTO v_owner_ids 
    FROM public.salons 
    WHERE owner_id IS NOT NULL;
    
    RAISE NOTICE 'Found owner IDs in salons table: %', v_owner_ids;
    
    -- Create profiles for these owners if they don't exist
    FOREACH v_owner_id IN ARRAY v_owner_ids
    LOOP
        -- Try to create a profile, ignoring if it already exists
        BEGIN
            INSERT INTO public.profiles (id, email, full_name, role) 
            VALUES (
                v_owner_id::uuid, 
                'owner_' || substring(v_owner_id from 1 for 8) || '@generated.com',
                'Generated Owner ' || substring(v_owner_id from 1 for 8),
                'SALON_OWNER'
            )
            ON CONFLICT (id) DO UPDATE 
            SET role = 'SALON_OWNER';
            
            RAISE NOTICE 'Created/Updated profile for owner: %', v_owner_id;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not create profile for %: %', v_owner_id, SQLERRM;
        END;
    END LOOP;
END $$;

-- 2. Ensure Public Read Access to Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
CREATE POLICY "Public profiles are viewable" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 3. Show current state
SELECT 'Current Profiles:' as info;
SELECT id, email, full_name, role FROM public.profiles;

SELECT 'Current Salon Owners:' as info;
SELECT s.id, s.name, s.owner_id, p.email, p.role 
FROM public.salons s
LEFT JOIN public.profiles p ON s.owner_id = p.id
LIMIT 10;
