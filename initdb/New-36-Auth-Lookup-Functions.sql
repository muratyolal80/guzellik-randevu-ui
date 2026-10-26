-- =============================================================================
-- New-36-Auth-Lookup-Functions.sql  (Roadmap F6)
-- The `auth` schema is NOT exposed through PostgREST (PGRST_DB_SCHEMAS =
-- public,storage,graphql_public — and must stay that way). Server code using
-- supabaseAdmin.schema('auth').from('users') therefore always got an error/empty
-- result → returning phone users could not book or log in (createUser 500), and the
-- "is this email taken?" checks never worked.
-- Narrow lookups instead, callable ONLY by service_role (server API routes).
-- =============================================================================

CREATE OR REPLACE FUNCTION public.auth_user_id_by_phone(p_phone text)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  -- auth.users.phone is stored without '+', e.g. 905551112233
  SELECT id FROM auth.users
  WHERE phone = regexp_replace(p_phone, '[^0-9]', '', 'g')
  ORDER BY created_at
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.auth_user_id_by_email(p_email text)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT id FROM auth.users WHERE lower(email) = lower(trim(p_email)) LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.auth_user_id_by_phone(text) FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.auth_user_id_by_email(text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.auth_user_id_by_phone(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.auth_user_id_by_email(text) TO service_role;

DO $$
BEGIN
    IF has_function_privilege('anon', 'public.auth_user_id_by_email(text)', 'EXECUTE')
       OR has_function_privilege('authenticated', 'public.auth_user_id_by_phone(text)', 'EXECUTE') THEN
        RAISE EXCEPTION 'auth lookup functions must be service_role only (user enumeration)';
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
