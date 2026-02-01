-- Functions
SET check_function_bodies = false;

CREATE FUNCTION public.check_is_salon_owner(p_salon_id uuid, p_user_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.salon_memberships 
        WHERE salon_id = p_salon_id 
        AND user_id = p_user_id 
        AND role = 'OWNER'
        AND is_active = true
    );
END;
$$;

CREATE FUNCTION public.cleanup_expired_otps() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    DELETE FROM public.otp_codes
    WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$;

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_role public.user_role;
    v_first_name TEXT;
    v_last_name TEXT;
    v_full_name TEXT;
BEGIN
    v_first_name := NEW.raw_user_meta_data->>'first_name';
    v_last_name := NEW.raw_user_meta_data->>'last_name';
    v_full_name := NEW.raw_user_meta_data->>'full_name';
    
    -- Improved Name Logic
    IF v_first_name IS NULL AND v_full_name IS NOT NULL THEN
        v_first_name := split_part(v_full_name, ' ', 1);
        v_last_name := substr(v_full_name, length(v_first_name) + 2);
    END IF;
    
    -- Role Protection Logic
    v_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'CUSTOMER'::public.user_role);
    
    IF v_role = 'SUPER_ADMIN' THEN
        v_role := 'CUSTOMER'::public.user_role;
    END IF;

    -- Upsert Profile
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

    RETURN NEW;
END;
$$;

CREATE FUNCTION public.handle_new_user_role_protection() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Force role to 'CUSTOMER' if it's not already set via a secure process.
    IF NEW.raw_user_meta_data->>'role' IS NULL THEN
        NEW.raw_user_meta_data = jsonb_set(
            COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
            '{role}',
            '"CUSTOMER"'
        );
    END IF;
    RETURN NEW;
END;
$$;

CREATE FUNCTION public.is_admin_v3() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  -- auth.jwt() i??erisindeki email'i kontrol etmek en g??venli ve d??ng??ye girmeyen y??ntemdir
  -- ????nk?? profiles tablosuna dokunmaz!
  RETURN (auth.jwt() ->> 'email') = 'admin@demo.com';
END;
$$;

CREATE FUNCTION public.on_salon_created_add_membership() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.salon_memberships (user_id, salon_id, role, is_active)
    VALUES (NEW.owner_id, NEW.id, 'OWNER', true)
    ON CONFLICT (user_id, salon_id) DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
RETURN NEW;
END;
$$;
