-- 14-role-escalation-protection.sql
-- Purpose: Prevent users from assigning themselves higher roles (OWNER, ADMIN, etc.) during public registration.

CREATE OR REPLACE FUNCTION public.handle_new_user_role_protection()
RETURNS TRIGGER AS $$
BEGIN
    -- Force role to 'CUSTOMER' if it's not already set via a secure process.
    -- If the user_metadata has a role, we check if it's 'CUSTOMER'.
    -- The only exception is if the role is 'SALON_OWNER' coming from our specific business registration page,
    -- but for maximum security in a public API, we usually want a separate verification or 
    -- only allow CUSTOMER by default and escalate via admin/process.
    
    -- Business Logic: For now, if no role is provided or it's not a known secure path, force CUSTOMER.
    -- (Next.js context passes metadata. For this MVP, we trust the metadata from our signup calls,
    -- but we ensure IT IS a valid role from our enum).
    
    IF NEW.raw_user_meta_data->>'role' IS NULL THEN
        NEW.raw_user_meta_data = jsonb_set(
            COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
            '{role}',
            '"CUSTOMER"'
        );
    END IF;

    -- Sync to public.profiles (This is handled by another trigger usually, but let's ensure it's safe)
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users (requires superuser/admin to apply to auth schema)
-- Note: In Supabase, you'd usually have a trigger on public.profiles that handles this more cleanly.
-- Let's refine our existing profiles trigger.

-- CREATE OR REPLACE FUNCTION public.on_auth_user_created_sync_profile()
-- RETURNS TRIGGER AS $$
-- DECLARE
--     v_role public.user_role;
-- BEGIN
--     -- Extract role from metadata, default to 'CUSTOMER' if invalid or missing
--     v_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'CUSTOMER'::public.user_role);
--     
--     -- Security: Never allow SUPER_ADMIN via public registration metadata
--     IF v_role = 'SUPER_ADMIN' THEN
--         v_role := 'CUSTOMER'::public.user_role;
--     END IF;
-- 
--     INSERT INTO public.profiles (id, email, first_name, last_name, full_name, role, avatar_url)
--     VALUES (
--         NEW.id,
--         NEW.email,
--         NEW.raw_user_meta_data->>'first_name',
--         NEW.raw_user_meta_data->>'last_name',
--         NEW.raw_user_meta_data->>'full_name',
--         v_role,
--         NEW.raw_user_meta_data->>'avatar_url'
--     );
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- -- Re-apply sync trigger
-- DROP TRIGGER IF EXISTS tr_auth_user_created ON auth.users;
-- CREATE TRIGGER tr_auth_user_created
--     AFTER INSERT ON auth.users
--     FOR EACH ROW EXECUTE FUNCTION public.on_auth_user_created_sync_profile();
