#!/usr/bin/env bash
# =============================================================================
# restore-test.sh — prove a backup is restorable (Roadmap F5, monthly).
# Restores a pg_dump -Fc file into a THROWAWAY database inside the local
# supabase-db container, checks key tables, then drops it. Live DB untouched.
#
#   ./scripts/restore-test.sh db_backups/prod_pre_migrate_20261026_120000.dump
# =============================================================================
set -euo pipefail
DUMP="${1:?usage: $0 <file.dump>}"
C="${LOCAL_DB_CONTAINER:-supabase-db}"
DB="restore_test_$(date +%s)"
psqlc() { docker exec -i "$C" psql -X -q -U postgres "$@"; }

cleanup() { psqlc -d postgres -c "DROP DATABASE IF EXISTS $DB;" >/dev/null 2>&1 || true; }
trap cleanup EXIT

echo "▶ $DUMP → temporary database $DB"
psqlc -d postgres -c "CREATE DATABASE $DB;"
# Supabase roles/extensions already exist in the cluster; ownership errors are noise
docker exec -i "$C" pg_restore -U postgres -d "$DB" --no-owner --no-privileges < "$DUMP" 2> /tmp/restore-test.err || true
echo "  restore warnings: $(grep -c 'error:' /tmp/restore-test.err || true)"

psqlc -d "$DB" -At -F ' ' -c "
  SELECT 'tables',       count(*) FROM pg_tables WHERE schemaname = 'public'
  UNION ALL SELECT 'salons',       count(*) FROM public.salons
  UNION ALL SELECT 'appointments', count(*) FROM public.appointments
  UNION ALL SELECT 'profiles',     count(*) FROM public.profiles
  UNION ALL SELECT 'migrations',   count(*) FROM public._migrations
  UNION ALL SELECT 'auth_users',   count(*) FROM auth.users;" | while read -r k v; do printf '  %-13s %s\n' "$k" "$v"; done

n=$(psqlc -d "$DB" -At -c "SELECT count(*) FROM public.salons")
[ "$n" -gt 0 ] && echo "✅ Backup is restorable" || { echo "❌ No salons in restored DB"; exit 1; }
