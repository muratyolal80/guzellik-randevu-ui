#!/usr/bin/env bash
# ============================================================================
# migrate.sh — initdb/New-*.sql migration runner (local / staging / prod)
# ----------------------------------------------------------------------------
# Applies pending migrations in order, each inside a single transaction, and
# records them in public._migrations (name + sha256 checksum).
# See docs/infrastructure/deployment-and-alignment.md §5.
#
# Usage:
#   ./scripts/migrate.sh <local|staging|prod> [--dry-run] [--yes]
#   ./scripts/migrate.sh <env> --baseline New-32   # mark files <= 32 as applied WITHOUT running
#
# Remote targets (SSH, DB accessed via `docker exec` on the server):
#   STAGING_SSH=root@host  STAGING_DB_CONTAINER=supabase-db
#   PROD_SSH=root@45.81.113.82  PROD_DB_CONTAINER=supabase-db
#
# Markers (first lines of a migration file):
#   -- @no-transaction   run without --single-transaction (e.g. CREATE INDEX CONCURRENTLY)
# ============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MIG_DIR="$ROOT/initdb"
BACKUP_DIR="$ROOT/db_backups"

ENV_NAME="${1:-}"; shift || true
DRY_RUN=false; AUTO_YES=false; BASELINE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) DRY_RUN=true ;;
    --yes) AUTO_YES=true ;;
    --baseline) BASELINE="${2:?--baseline needs a value like New-32}"; shift ;;
    *) echo "Unknown arg: $1"; exit 2 ;;
  esac
  shift
done

case "$ENV_NAME" in
  local)   SSH=""; CONTAINER="${LOCAL_DB_CONTAINER:-supabase-db}" ;;
  staging) SSH="${STAGING_SSH:?set STAGING_SSH=user@host}"; CONTAINER="${STAGING_DB_CONTAINER:-supabase-db}" ;;
  prod)    SSH="${PROD_SSH:-root@45.81.113.82}"; CONTAINER="${PROD_DB_CONTAINER:-supabase-db}" ;;
  *) echo "Usage: $0 <local|staging|prod> [--dry-run] [--yes] [--baseline New-XX]"; exit 2 ;;
esac

# psql on the target; args must be plain flags (no spaces) — SQL always goes via stdin
psql_t() {
  local cmd="docker exec -i -e PGCLIENTENCODING=UTF8 -e PGOPTIONS=--client-min-messages=warning $CONTAINER psql -X -q -v ON_ERROR_STOP=1 -U postgres -d postgres $*"
  if [ -z "$SSH" ]; then eval "$cmd"; else ssh -o BatchMode=yes "$SSH" "$cmd"; fi
}

# run one SQL string, unaligned output
q() { printf '%s\n' "$1" | psql_t -At; }

num_of() { basename "$1" | sed -E 's/^New-([0-9]+).*/\1/' | sed 's/^0*//'; }
key_of() { basename "$1" .sql; }

# --- bootstrap tracker (fresh DBs) ------------------------------------------
psql_t <<'SQL'
CREATE TABLE IF NOT EXISTS public._migrations (
  id serial PRIMARY KEY, name text NOT NULL UNIQUE,
  applied_at timestamptz DEFAULT now(), notes text);
ALTER TABLE public._migrations ADD COLUMN IF NOT EXISTS checksum text;
SQL

# --- discover files (numeric order, then name) ------------------------------
mapfile -t FILES < <(ls "$MIG_DIR"/New-*.sql | while read -r f; do printf '%05d %s\n' "$(num_of "$f")" "$f"; done | sort | cut -d' ' -f2-)

dups=$(for f in "${FILES[@]}"; do num_of "$f"; done | sort -n | uniq -d | tr '\n' ' ')
[ -n "$dups" ] && echo "⚠️  Duplicate migration numbers (legacy, ordered by name): $dups"

APPLIED="$(q "select regexp_replace(name,'\.sql\$','') from public._migrations")"
is_applied() { grep -qxF "$1" <<<"$APPLIED"; }

PENDING=()
for f in "${FILES[@]}"; do is_applied "$(key_of "$f")" || PENDING+=("$f"); done

echo "═══ migrate: $ENV_NAME (${SSH:-docker}:$CONTAINER) — ${#FILES[@]} files, ${#PENDING[@]} pending"

# --- baseline: register without running -------------------------------------
if [ -n "$BASELINE" ]; then
  limit="$(num_of "$BASELINE.sql")"
  for f in "${PENDING[@]}"; do
    [ "$(num_of "$f")" -le "$limit" ] || continue
    sum="$(sha256sum "$f" | cut -d' ' -f1)"
    echo "  📌 baseline $(key_of "$f")"
    $DRY_RUN || q "insert into public._migrations(name,checksum,notes) values ('$(key_of "$f").sql','$sum','baseline: applied before runner') on conflict (name) do nothing" >/dev/null
  done
  exit 0
fi

# --- checksum drift on already-applied files --------------------------------
SUMS="$(q "select regexp_replace(name,'\.sql\$','')||' '||coalesce(checksum,'') from public._migrations")"
for f in "${FILES[@]}"; do
  k="$(key_of "$f")"; recorded="$(awk -v k="$k" '$1==k{print $2}' <<<"$SUMS")"
  [ -n "$recorded" ] && [ "$recorded" != "$(sha256sum "$f" | cut -d' ' -f1)" ] \
    && echo "⚠️  $k was edited after being applied — write a NEW migration instead of editing it."
done

[ ${#PENDING[@]} -eq 0 ] && { echo "✅ Up to date."; exit 0; }
for f in "${PENDING[@]}"; do echo "  ⏳ $(key_of "$f")"; done
$DRY_RUN && exit 0

# --- prod safety: confirmation + mandatory backup ---------------------------
if [ "$ENV_NAME" = prod ]; then
  if ! $AUTO_YES; then
    read -r -p "⚠️  PROD'a ${#PENDING[@]} migration uygulanacak. Onay için 'prod' yaz: " ans
    [ "$ans" = prod ] || { echo "İptal."; exit 1; }
  fi
  mkdir -p "$BACKUP_DIR"
  bk="$BACKUP_DIR/prod_pre_migrate_$(date +%Y%m%d_%H%M%S).dump"
  echo "💾 Backup → $bk"
  ssh -o BatchMode=yes "$SSH" "docker exec -i $CONTAINER pg_dump -U postgres -d postgres -Fc" > "$bk"
  [ "$(wc -c <"$bk")" -gt 10000 ] || { echo "❌ Backup too small — aborting, nothing applied."; exit 1; }
fi

# --- apply ------------------------------------------------------------------
for f in "${PENDING[@]}"; do
  k="$(key_of "$f")"; sum="$(sha256sum "$f" | cut -d' ' -f1)"
  record="insert into public._migrations(name,checksum) values ('$k.sql','$sum') on conflict (name) do update set checksum=excluded.checksum;"
  echo "▶ $k"
  if head -5 "$f" | grep -q -- '-- @no-transaction'; then
    psql_t < "$f"
    q "$record" >/dev/null
  else
    # file + tracker insert in ONE transaction: both commit or neither does
    { cat "$f"; printf '\n%s\n' "$record"; } | psql_t --single-transaction
  fi
  echo "  ✅ applied"
done

q "NOTIFY pgrst, 'reload schema'" >/dev/null
echo "🩺 Health check:"
psql_t -P pager=off < "$MIG_DIR/db-health-check.sql" | grep -A12 -E "▶ (1|2|3|8|8b|10)\)" || true
