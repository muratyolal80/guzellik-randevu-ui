-- fix_triggers.sql
-- Consolidate registration triggers to prevent 500 errors

-- 1. Remove the duplicate/conflicting trigger and function from 14-role-protection.sql
-- We use IF EXISTS to be safe
DROP TRIGGER IF EXISTS tr_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.on_auth_user_created_sync_profile();

-- 2. Update the main handle_new_user function to include logic from both:
--    - Profile creation
--    - First/Last name parsing
--    - Role protection (defaulting to CUSTOMER)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    v_role public.user_role;
    v_first_name TEXT;
    v_last_name TEXT;
    v_full_name TEXT;
BEGIN
    -- Extract metadata
    v_first_name := NEW.raw_user_meta_data->>'first_name';
    v_last_name := NEW.raw_user_meta_data->>'last_name';
    v_full_name := NEW.raw_user_meta_data->>'full_name';
    
    -- Fallback strategy for names
    IF v_first_name IS NULL AND v_full_name IS NOT NULL THEN
        v_first_name := split_part(v_full_name, ' ', 1);
        v_last_name := substr(v_full_name, length(v_first_name) + 2);
    END IF;
    
    -- Role protection logic
    -- Default to CUSTOMER if role is missing or invalid
    v_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'CUSTOMER'::public.user_role);
    
    -- Security: Force SUPER_ADMIN to CUSTOMER if tried via public signup
    IF v_role = 'SUPER_ADMIN' THEN
        v_role := 'CUSTOMER'::public.user_role;
    END IF;

    -- Insert into public.profiles
    INSERT INTO public.profiles (id, email, first_name, last_name, full_name, role, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        v_first_name,
        v_last_name,
        COALESCE(v_full_name, v_first_name || ' ' || v_last_name),
        v_role,
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = COALESCE(public.profiles.first_name, EXCLUDED.first_name),
        last_name = COALESCE(public.profiles.last_name, EXCLUDED.last_name),
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
        role = COALESCE(public.profiles.role, EXCLUDED.role),
        avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
        updated_at = NOW();

    -- Ensure metadata is synced back if we enforced defaults (Optional security step)
    -- This part modifies the user metadata in auth.users itself to reflect the enforced role
    IF NEW.raw_user_meta_data->>'role' IS NULL OR (NEW.raw_user_meta_data->>'role')::public.user_role = 'SUPER_ADMIN' THEN
         UPDATE auth.users
         SET raw_user_meta_data = jsonb_set(
             COALESCE(raw_user_meta_data, '{}'::jsonb),
             '{role}',
             to_jsonb(v_role::text)
         )
         WHERE id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure the main safe trigger is active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verification
SELECT tgname, tgrelid::regclass FROM pg_trigger 
WHERE tgname IN ('tr_auth_user_created', 'on_auth_user_created');
