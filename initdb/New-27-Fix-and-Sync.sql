-- =================================================================
-- New-27-Fix-and-Sync.sql
-- Missing migrations and role synchronization (Optimized to avoid deadlocks).
-- =================================================================

-- 1. Profiles Table Updates
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. User Role Enum Sync
-- Note: 'IF NOT EXISTS' for ADD VALUE is only available in Postgres 16+. 
-- For older versions, we use a DO block but keep it isolated.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'user_role' AND e.enumlabel = 'SUPER_ADMIN') THEN
        ALTER TYPE public.user_role ADD VALUE 'SUPER_ADMIN';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 3. Admin Delete Cascade Function
CREATE OR REPLACE FUNCTION public.admin_delete_user_cascade(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Delete subscriptions for salons owned by this user
    DELETE FROM public.subscriptions WHERE salon_id IN (SELECT id FROM public.salons WHERE owner_id = target_user_id);
    -- Delete the salons
    DELETE FROM public.salons WHERE owner_id = target_user_id;
    -- Delete the profile
    DELETE FROM public.profiles WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. User Role Promotion
UPDATE public.profiles 
SET role = 'SUPER_ADMIN' 
WHERE email = 'myolal@gmail.com';

-- 5. Critical RLS Refresh (Ensuring SUPER_ADMIN access)
-- Note: Re-applying only the most critical ones. 
-- In case of deadlock, these can be run separately.

DROP POLICY IF EXISTS "SUPER_ADMIN can manage all profiles" ON public.profiles;
CREATE POLICY "SUPER_ADMIN can manage all profiles" ON public.profiles FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPER_ADMIN'
);

DROP POLICY IF EXISTS "SUPER_ADMIN can manage all salons" ON public.salons;
CREATE POLICY "SUPER_ADMIN can manage all salons" ON public.salons FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPER_ADMIN'
);

DROP POLICY IF EXISTS "SUPER_ADMIN can manage all appointments" ON public.appointments;
CREATE POLICY "SUPER_ADMIN can manage all appointments" ON public.appointments FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPER_ADMIN'
);

-- Audit Comment
COMMENT ON TABLE public.profiles IS 'Last synced by New-27 optimized script.';
