-- =============================================================================
-- security-audit.sql — READ-ONLY. Safe on prod. (Roadmap F0)
-- Reports the 2026-10-26 findings that New-33 fixes, so prod state is known
-- BEFORE applying migrations.  Usage:
--   docker exec -i supabase-db psql -U postgres -d postgres < initdb/helpersql/security-audit.sql
-- =============================================================================
\echo '▶ A) Migration tracker (son 15)'
SELECT name, applied_at::date FROM public._migrations ORDER BY applied_at DESC, id DESC LIMIT 15;

\echo '▶ B) signup trigger trusts client role? (t = AÇIK)'
SELECT prosrc ILIKE '%raw_user_meta_data->>''role'')::public.user_role%' AS client_role_trusted
FROM pg_proc WHERE proname = 'handle_new_user';

\echo '▶ C) profiles role/is_active guard trigger var mı? (f = AÇIK)'
SELECT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'guard_profile_privileged_columns') AS guarded;

\echo '▶ D) staff PII okunabilir mi? (t = AÇIK)'
SELECT r AS role, col, has_column_privilege(r, 'public.staff', col, 'SELECT') AS readable
FROM unnest(ARRAY['anon','authenticated']) r, unnest(ARRAY['tc_no','phone','email']) col;

\echo '▶ E) staff tc_no dolu satır sayısı (sızıntının büyüklüğü)'
SELECT count(*) FILTER (WHERE coalesce(tc_no,'') <> '') AS tc_filled,
       count(*) FILTER (WHERE coalesce(phone,'') <> '') AS phone_filled,
       count(*) AS total
FROM public.staff;

\echo '▶ F) USING(true) SELECT politikaları (hassas tablolar)'
SELECT tablename, policyname, roles FROM pg_policies
WHERE schemaname = 'public' AND qual = 'true' AND cmd IN ('SELECT','ALL')
  AND NOT ('service_role' = ANY (roles))
ORDER BY 1;

\echo '▶ G) Rolü SUPER_ADMIN/ADMIN olan kullanıcılar (beklenmeyen var mı?)'
SELECT p.email, p.role, p.created_at::date FROM public.profiles p
WHERE p.role IN ('SUPER_ADMIN','ADMIN') ORDER BY p.created_at;

\echo '▶ H) Demo hesaplar prodda var mı? (olmamalı)'
SELECT email, role FROM public.profiles WHERE email ILIKE '%@demo.com' OR email ILIKE 'demo-%';

\echo '▶ I) Definer fonksiyonlar search_path olmadan'
SELECT p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.prosecdef AND p.proname NOT LIKE 'st\_%'
  AND NOT EXISTS (SELECT 1 FROM unnest(coalesce(p.proconfig,'{}')) c WHERE c LIKE 'search_path=%');

\echo '▶ J) Şema boyutu'
SELECT (SELECT count(*) FROM pg_tables WHERE schemaname='public') AS tables,
       (SELECT count(*) FROM pg_policies WHERE schemaname='public') AS policies,
       (SELECT count(*) FROM public.appointments) AS appointments,
       (SELECT count(*) FROM auth.users) AS users;
