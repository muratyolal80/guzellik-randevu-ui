-- =============================================================================
-- mask-pii.sql — anonymize personal data after a prod → local/staging pull (Roadmap F4)
-- KVKK data minimization + no real customer can receive an SMS/e-mail from dev/staging.
--
-- NEVER on prod. Refuses to run unless target is given explicitly:
--   docker exec -i supabase-db psql -U postgres -d postgres -v target=local < scripts/mask-pii.sql
--
-- Kept as-is: demo/test accounts (@demo.com, @example.com, @test.local), salon public
-- contact data (salons.phone/address are published on the site anyway).
-- Masked users can log in as  u<id8>@masked.local / password123
-- =============================================================================
\set ON_ERROR_STOP on
SELECT (:'target' IN ('local', 'staging')) AS target_ok \gset
\if :target_ok
\else
  \echo '❌ Refusing: pass -v target=local or -v target=staging'
  \quit
\endif

BEGIN;

CREATE OR REPLACE FUNCTION pg_temp.is_kept(p_email text) RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT coalesce(p_email, '') ~* '@(demo\.com|example\.com|test\.local)$'
$$;
CREATE OR REPLACE FUNCTION pg_temp.fake_phone(p_seed text) RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT '+90555' || lpad((abs(hashtext(p_seed)) % 10000000)::text, 7, '0')
$$;
CREATE OR REPLACE FUNCTION pg_temp.fake_email(p_id uuid) RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT 'u' || left(replace(p_id::text, '-', ''), 8) || '@masked.local'
$$;

-- auth: login identity (keep ids → all FKs stay valid)
UPDATE auth.users u SET
    email = pg_temp.fake_email(u.id),
    phone = CASE WHEN u.phone IS NULL THEN NULL ELSE replace(pg_temp.fake_phone(u.id::text), '+', '') END,
    email_change = '', phone_change = '',
    raw_user_meta_data = coalesce(u.raw_user_meta_data, '{}'::jsonb)
        || jsonb_build_object('full_name', 'Kullanıcı ' || left(u.id::text, 6),
                              'first_name', 'Kullanıcı', 'last_name', left(u.id::text, 6)),
    encrypted_password = extensions.crypt('password123', extensions.gen_salt('bf'))
WHERE NOT pg_temp.is_kept(u.email);

UPDATE auth.identities i SET   -- identities.email is generated from identity_data
    identity_data = coalesce(i.identity_data, '{}'::jsonb) || jsonb_build_object('email', u.email)
FROM auth.users u
WHERE u.id = i.user_id AND u.email LIKE '%@masked.local';

DELETE FROM auth.refresh_tokens;   -- prod sessions are meaningless here (different JWT secret)
DELETE FROM auth.sessions;

-- public
UPDATE public.profiles p SET
    email = pg_temp.fake_email(p.id),
    phone = CASE WHEN p.phone IS NULL THEN NULL ELSE pg_temp.fake_phone(p.id::text) END,
    first_name = 'Kullanıcı', last_name = left(p.id::text, 6),
    full_name = 'Kullanıcı ' || left(p.id::text, 6),
    birth_date = NULL
WHERE NOT pg_temp.is_kept(p.email);

UPDATE public.appointments a SET
    customer_name  = CASE WHEN a.customer_name  IS NULL THEN NULL ELSE 'Müşteri ' || left(a.id::text, 6) END,
    customer_phone = CASE WHEN a.customer_phone IS NULL THEN NULL ELSE pg_temp.fake_phone(a.id::text) END;

UPDATE public.staff s SET
    email = CASE WHEN s.email IS NULL OR pg_temp.is_kept(s.email) THEN s.email ELSE 'staff' || left(replace(s.id::text,'-',''), 8) || '@masked.local' END,
    phone = CASE WHEN s.phone IS NULL OR s.phone = '' THEN s.phone ELSE pg_temp.fake_phone(s.id::text) END,
    tc_no = NULL;

UPDATE public.invites SET email = 'invite' || left(replace(id::text,'-',''), 8) || '@masked.local'
WHERE NOT pg_temp.is_kept(email);

UPDATE public.otp_codes        SET phone = pg_temp.fake_phone(phone);
UPDATE public.sms_verifications SET phone = pg_temp.fake_phone(phone);
UPDATE public.iys_logs         SET phone = pg_temp.fake_phone(phone) WHERE phone IS NOT NULL;
UPDATE public.audit_logs       SET ip_address = NULL;
UPDATE public.user_sessions    SET ip_address = NULL;
UPDATE public.salon_sub_merchants SET iban = 'TR000000000000000000000000' WHERE iban IS NOT NULL;

-- outbound queues: nothing queued from prod may be sent from here
UPDATE public.notification_queue SET status = 'FAILED' WHERE status IN ('PENDING', 'PROCESSING');

COMMIT;

\echo '✅ PII masked. Masked users: u<id8>@masked.local / password123'
SELECT count(*) FILTER (WHERE email LIKE '%@masked.local') AS masked_profiles,
       count(*) FILTER (WHERE email ~* '@(demo\.com|example\.com|test\.local)$') AS kept_test_accounts
FROM public.profiles;
