#!/usr/bin/env bash
# ============================================================================
# bootstrap-prod.sh — install the schema + reference data on an EMPTY Supabase
# ----------------------------------------------------------------------------
# For a brand-new server (new VDS). Copies from the LOCAL DB, which is the
# verified schema (all New-*.sql applied):
#   - public schema: tables, functions, triggers, RLS policies, GRANTs
#   - auth.users -> handle_new_user trigger, storage buckets + storage policies
#   - reference data: cities, districts, salon types/categories, service
#     categories, global services, subscription plans, safe platform_settings
#   - public._migrations rows (so migrate.sh continues from New-38)
# NOT copied: users, salons, appointments, demo accounts, PayTR/bank settings.
# See docs/infrastructure/deployment-and-alignment.md §11.
#
# Usage:
#   ./scripts/bootstrap-prod.sh <staging|prod> [--dry-run]       # SQL -> stdout only
#   ./scripts/bootstrap-prod.sh <staging|prod> --promote-admin you@domain.com
#   PROD_SSH=root@<new-ip>  PROD_DB_CONTAINER=supabase-db-xxxx (Coolify name)
#   local target (testing): LOCAL_DB_CONTAINER=<scratch-container> ... local
# ============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${SRC_DB_CONTAINER:-supabase-db}"

ENV_NAME="${1:-}"; shift || true
DRY_RUN=false; ADMIN_EMAIL=""
while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) DRY_RUN=true ;;
    --promote-admin) ADMIN_EMAIL="${2:?--promote-admin needs an e-mail}"; shift ;;
    *) echo "Unknown arg: $1"; exit 2 ;;
  esac
  shift
done

case "$ENV_NAME" in
  local)   SSH=""; CONTAINER="${LOCAL_DB_CONTAINER:?set LOCAL_DB_CONTAINER (a scratch DB, not $SRC)}" ;;
  staging) SSH="${STAGING_SSH:?set STAGING_SSH=user@host}"; CONTAINER="${STAGING_DB_CONTAINER:-supabase-db}" ;;
  prod)    SSH="${PROD_SSH:?set PROD_SSH=root@<new-server-ip>}"; CONTAINER="${PROD_DB_CONTAINER:-supabase-db}" ;;
  *) echo "Usage: $0 <staging|prod|local> [--dry-run] [--promote-admin email]"; exit 2 ;;
esac
[ "$ENV_NAME" = local ] && [ "$CONTAINER" = "$SRC" ] && { echo "❌ Target = source."; exit 1; }

tgt() {
  local cmd="docker exec -i -e PGCLIENTENCODING=UTF8 $CONTAINER psql -X -q -v ON_ERROR_STOP=1 -U postgres -d postgres $*"
  if [ -z "$SSH" ]; then eval "$cmd"; else ssh -o BatchMode=yes "$SSH" "$cmd"; fi
}
src_q() { docker exec -i -e PGCLIENTENCODING=UTF8 "$SRC" psql -X -At -v ON_ERROR_STOP=1 -U postgres -d postgres -c "$1"; }
src_dump() { docker exec -i -e PGCLIENTENCODING=UTF8 "$SRC" pg_dump -U postgres -d postgres "$@"; }

# --- promote an already-registered user to SUPER_ADMIN ----------------------
# (handle_new_user only allows CUSTOMER/SALON_OWNER at signup, by design)
if [ -n "$ADMIN_EMAIL" ]; then
  case "$ADMIN_EMAIL" in *\'*) echo "❌ invalid e-mail"; exit 2 ;; esac
  n="$(printf "update public.profiles set role='SUPER_ADMIN' where lower(email)=lower('%s') returning id;\n" "$ADMIN_EMAIL" | tgt -At | grep -c . || true)"
  [ "$n" = 1 ] && echo "✅ $ADMIN_EMAIL → SUPER_ADMIN" || { echo "❌ profile not found — register on the site first"; exit 1; }
  exit 0
fi

# --- safety: target must be empty -------------------------------------------
if ! $DRY_RUN; then
  existing="$(echo "select count(*) from pg_tables where schemaname='public' and tablename in ('salons','profiles','appointments');" | tgt -At)"
  [ "$existing" = 0 ] || { echo "❌ Target already has the app schema — bootstrap is only for an EMPTY DB. Use migrate.sh."; exit 1; }
fi

REF_TABLES=(cities districts salon_type_categories salon_types service_categories global_services subscription_plans _migrations)

build_sql() {
  echo "-- bootstrap from local ($(src_q "select max(name) from public._migrations")) at $(date -u +%FT%TZ)"
  echo "SET client_min_messages = warning;"
  # A fresh Supabase auto-grants ALL on new public objects to anon/authenticated.
  # pg_dump only re-adds GRANTs (no REVOKEs), so without this every column-level
  # restriction (staff PII, slot_reservations, ...) would be silently reopened.
  # The dump's own ALTER DEFAULT PRIVILEGES (end of schema) restores local's defaults.
  for o in TABLES SEQUENCES FUNCTIONS; do
    echo "ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON $o FROM anon, authenticated, service_role;"
  done
  echo "CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;"
  echo "CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;"

  # 1. public schema (extension members are excluded automatically)
  src_dump --schema-only --schema=public --no-comments \
    | grep -v -E '^(CREATE SCHEMA public;|ALTER SCHEMA public OWNER|SET transaction_timeout)'

  # 2. reference data (pg_dump orders by FK dependency)
  local t_args=(); for t in "${REF_TABLES[@]}"; do t_args+=(-t "public.$t"); done
  src_dump --data-only --column-inserts "${t_args[@]}" | grep -v -E '^SET transaction_timeout'
  src_q "select format('INSERT INTO public.platform_settings(key,value) VALUES (%L,%L) ON CONFLICT (key) DO NOTHING;', key, value) from public.platform_settings where key in ('active_payment_provider','kvkk_version')"

  # 3. trigger on auth.users (outside public)
  # pg_dump emptied search_path; the storage policy texts below use unqualified public names
  echo "SET search_path = public, extensions;"
  echo "DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;"
  src_q "select replace(pg_get_triggerdef(t.oid), 'EXECUTE FUNCTION '||p.proname||'(', 'EXECUTE FUNCTION '||p.pronamespace::regnamespace||'.'||p.proname||'(')||';'
         from pg_trigger t join pg_proc p on p.oid=t.tgfoid where t.tgrelid='auth.users'::regclass and t.tgname='on_auth_user_created'"

  # 4. storage buckets + policies
  src_q "select format('INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES (%L,%L,%L,%L,%L) ON CONFLICT (id) DO NOTHING;', id, name, public, file_size_limit, allowed_mime_types) from storage.buckets order by id"
  src_q "select format('DROP POLICY IF EXISTS %I ON storage.%I; CREATE POLICY %I ON storage.%I AS %s FOR %s TO %s%s%s;',
           policyname, tablename, policyname, tablename, permissive, cmd, array_to_string(roles, ', '),
           coalesce(' USING ('||qual||')',''), coalesce(' WITH CHECK ('||with_check||')',''))
         from pg_policies where schemaname='storage' order by tablename, policyname"

  echo "NOTIFY pgrst, 'reload schema';"
}

if $DRY_RUN; then build_sql; exit 0; fi

echo "═══ bootstrap: $ENV_NAME (${SSH:-docker}:$CONTAINER) ← local $SRC"
build_sql | tgt --single-transaction
echo "✅ Schema + reference data installed."
echo "🩺 Health check:"
tgt -P pager=off < "$ROOT/initdb/db-health-check.sql" | grep -A12 -E "▶ (1|2|3|8|8b|10)\)" || true
echo
echo "Next: register your admin account on the site, then:"
echo "  $0 $ENV_NAME --promote-admin <email>"
