-- =============================================================================
-- New-33-Security-Hardening.sql
-- 2026-10-26 DB audit findings (docs/plans/00-MASTER-ROADMAP.md → F1):
--   1. handle_new_user trusted client-supplied role → anyone could sign up as SUPER_ADMIN
--   2. profiles.own_profile had no WITH CHECK / no column guard → self-promote role, self re-activate
--   3. staff "Public Read Access" USING(true) exposed tc_no/phone/email to anon (KVKK)
--   4. invites readable by anyone (all tokens) → hijack someone else's invite
--   5. salon_usage_stats (definer view) readable by anon
--   6. SECURITY DEFINER functions without fixed search_path
--   7. profiles had no admin policy → admin activate/deactivate silently did nothing
--   + accept_staff_invite RPC referenced by /invite/accept did not exist
-- Runner: ./scripts/migrate.sh <env>  (runs in a single transaction, self-registers)
-- =============================================================================

-- ─── 0. Helper: is the caller an admin? (definer → no RLS recursion on profiles)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN')
  );
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- ─── 1. Signup trigger: only self-service roles from client metadata
--      STAFF / MANAGER are granted exclusively by accept_staff_invite().
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_requested text := upper(coalesce(NEW.raw_user_meta_data->>'role', ''));
    v_role public.user_role;
BEGIN
    v_role := CASE WHEN v_requested = 'SALON_OWNER' THEN 'SALON_OWNER'::public.user_role
                   ELSE 'CUSTOMER'::public.user_role END;

    INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        v_role,
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        email      = EXCLUDED.email,
        full_name  = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
        role       = COALESCE(public.profiles.role, EXCLUDED.role),
        avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
        updated_at = NOW();

    RETURN NEW;
END;
$$;

-- ─── 2. profiles: role / is_active only changeable by admin or server (service_role, definer fns)
CREATE OR REPLACE FUNCTION public.guard_profile_privileged_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF (NEW.role IS DISTINCT FROM OLD.role OR NEW.is_active IS DISTINCT FROM OLD.is_active)
       AND current_user IN ('authenticated', 'anon')
       AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Not allowed to change role or is_active'
            USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_profile_privileged_columns ON public.profiles;
CREATE TRIGGER guard_profile_privileged_columns
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.guard_profile_privileged_columns();

DROP POLICY IF EXISTS "own_profile" ON public.profiles;
CREATE POLICY "own_profile" ON public.profiles
    FOR ALL TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "admin_manage_profiles" ON public.profiles;
CREATE POLICY "admin_manage_profiles" ON public.profiles
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ─── 3. staff PII: column-level SELECT. Rows stay public (booking needs name/photo),
--      sensitive columns only via get_staff_private() for owner / the staff member / admin.
REVOKE SELECT ON public.staff FROM anon, authenticated;
GRANT SELECT (id, salon_id, user_id, name, photo, specialty, bio, is_active,
              created_at, updated_at, rating, review_count, role)
    ON public.staff TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_staff_private(p_staff_ids uuid[])
RETURNS TABLE (id uuid, email text, phone text, tc_no text,
               is_email_verified boolean, is_phone_verified boolean,
               kvkk_consent boolean, verified_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT s.id, s.email::text, s.phone::text, s.tc_no::text,
         s.is_email_verified, s.is_phone_verified, s.kvkk_consent, s.verified_at
  FROM public.staff s
  WHERE s.id = ANY (p_staff_ids)
    AND (
      s.user_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.salons sa WHERE sa.id = s.salon_id AND sa.owner_id = auth.uid())
      OR public.is_admin()
    );
$$;
REVOKE ALL ON FUNCTION public.get_staff_private(uuid[]) FROM public;
GRANT EXECUTE ON FUNCTION public.get_staff_private(uuid[]) TO authenticated, service_role;

-- ─── 4. invites: no public listing. Token lookup + accept via RPC only.
DROP POLICY IF EXISTS "public_read_invite_by_token" ON public.invites;

CREATE OR REPLACE FUNCTION public.get_invite_by_token(p_token text)
RETURNS TABLE (id uuid, salon_id uuid, email text, role text, status text,
               expires_at timestamptz, salon_name text)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT i.id, i.salon_id, i.email::text, i.role::text,
         CASE WHEN i.status = 'PENDING' AND i.expires_at IS NOT NULL AND i.expires_at < now()
              THEN 'EXPIRED' ELSE i.status::text END,
         i.expires_at, sa.name::text
  FROM public.invites i
  LEFT JOIN public.salons sa ON sa.id = i.salon_id
  WHERE i.token = p_token;
$$;
REVOKE ALL ON FUNCTION public.get_invite_by_token(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_invite_by_token(text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.accept_staff_invite(p_token text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_invite public.invites%ROWTYPE;
    v_uid uuid := auth.uid();
    v_email text;
    v_name text;
    v_role text;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
    END IF;

    SELECT * INTO v_invite FROM public.invites WHERE token = p_token FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invite not found' USING ERRCODE = 'P0002';
    END IF;
    IF v_invite.status <> 'PENDING' OR (v_invite.expires_at IS NOT NULL AND v_invite.expires_at < now()) THEN
        RAISE EXCEPTION 'Invite is not pending' USING ERRCODE = '22023';
    END IF;

    SELECT email, coalesce(full_name, trim(coalesce(first_name,'') || ' ' || coalesce(last_name,'')))
      INTO v_email, v_name
      FROM public.profiles WHERE id = v_uid;
    IF lower(coalesce(v_email, '')) <> lower(v_invite.email) THEN
        RAISE EXCEPTION 'Invite email does not match the signed-in user' USING ERRCODE = '42501';
    END IF;

    v_role := CASE WHEN upper(v_invite.role) = 'MANAGER' THEN 'MANAGER' ELSE 'STAFF' END;

    -- link an existing staff card for this email, otherwise create one
    UPDATE public.staff SET user_id = v_uid, updated_at = now()
     WHERE salon_id = v_invite.salon_id AND user_id IS NULL AND lower(email) = lower(v_invite.email);
    IF NOT FOUND AND NOT EXISTS (SELECT 1 FROM public.staff WHERE salon_id = v_invite.salon_id AND user_id = v_uid) THEN
        INSERT INTO public.staff (salon_id, user_id, name, email, is_active)
        VALUES (v_invite.salon_id, v_uid, coalesce(nullif(v_name, ''), v_invite.email), v_invite.email, true);
    END IF;

    INSERT INTO public.salon_memberships (salon_id, user_id, role, is_active)
    VALUES (v_invite.salon_id, v_uid, v_role, true)
    ON CONFLICT (salon_id, user_id) DO UPDATE SET role = EXCLUDED.role, is_active = true;

    -- upgrade only, never downgrade an owner/admin
    UPDATE public.profiles SET role = v_role::public.user_role, updated_at = now()
     WHERE id = v_uid AND role = 'CUSTOMER';

    UPDATE public.invites SET status = 'ACCEPTED', accepted_at = now() WHERE id = v_invite.id;
    RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.accept_staff_invite(text) FROM public;
GRANT EXECUTE ON FUNCTION public.accept_staff_invite(text) TO authenticated, service_role;

-- ─── 5. Usage stats: not for anonymous visitors
REVOKE SELECT ON public.salon_usage_stats FROM anon;

-- ─── 6. Pin search_path on remaining definer functions
ALTER FUNCTION public.salons_within_radius(double precision, double precision, integer)
    SET search_path = public, pg_temp;
ALTER FUNCTION public.acquire_slot_lock(uuid, uuid, uuid, timestamptz, timestamptz, uuid, text)
    SET search_path = public, pg_temp;

-- ─── 7. Verification (fails the transaction if something is off)
DO $$
BEGIN
    IF has_column_privilege('anon', 'public.staff', 'tc_no', 'SELECT')
       OR has_column_privilege('authenticated', 'public.staff', 'phone', 'SELECT') THEN
        RAISE EXCEPTION 'staff PII still readable';
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invites' AND qual = 'true') THEN
        RAISE EXCEPTION 'invites still publicly readable';
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
