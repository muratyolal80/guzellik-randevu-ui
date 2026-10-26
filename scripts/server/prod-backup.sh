#!/usr/bin/env bash
# =============================================================================
# prod-backup.sh — runs ON the prod server (cron). Roadmap F5.
# Daily pg_dump (custom format) + retention + optional off-site copy.
#
# Install (on server, once):
#   scp scripts/server/prod-backup.sh root@<server>:/opt/kuaforara/prod-backup.sh
#   chmod +x /opt/kuaforara/prod-backup.sh
#   crontab -e   →   15 3 * * * /opt/kuaforara/prod-backup.sh >> /var/log/kuaforara-backup.log 2>&1
#
# Env (optional, /opt/kuaforara/backup.env):
#   DB_CONTAINER=supabase-db   BACKUP_ROOT=/var/backups/kuaforara
#   OFFSITE_RSYNC=user@backup-host:/backups/kuaforara   # off-site copy (strongly recommended)
#   STORAGE_DIR=/path/to/minio/data                     # also archive storage files
# Retention: 7 daily, 4 weekly (Sunday), 3 monthly (1st of month)
# =============================================================================
set -euo pipefail
[ -f /opt/kuaforara/backup.env ] && . /opt/kuaforara/backup.env

DB_CONTAINER="${DB_CONTAINER:-supabase-db}"
BACKUP_ROOT="${BACKUP_ROOT:-/var/backups/kuaforara}"
TS="$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_ROOT"/{daily,weekly,monthly}

out="$BACKUP_ROOT/daily/db_${TS}.dump"
docker exec -i "$DB_CONTAINER" pg_dump -U postgres -d postgres -Fc > "$out.part"
# a valid custom-format dump lists its TOC; an empty/broken one fails here
docker exec -i "$DB_CONTAINER" pg_restore -l < "$out.part" > /dev/null
mv "$out.part" "$out"
echo "$(date -Is) ✅ db backup $(du -h "$out" | cut -f1) → $out"

[ "$(date +%u)" = 7 ] && cp "$out" "$BACKUP_ROOT/weekly/"
[ "$(date +%d)" = 01 ] && cp "$out" "$BACKUP_ROOT/monthly/"

if [ -n "${STORAGE_DIR:-}" ] && [ -d "$STORAGE_DIR" ]; then
  tar -czf "$BACKUP_ROOT/daily/storage_${TS}.tar.gz" -C "$STORAGE_DIR" .
  echo "$(date -Is) ✅ storage archive"
fi

# retention
ls -1t "$BACKUP_ROOT"/daily/db_*.dump      2>/dev/null | tail -n +8 | xargs -r rm --
ls -1t "$BACKUP_ROOT"/daily/storage_*.tar.gz 2>/dev/null | tail -n +4 | xargs -r rm --
ls -1t "$BACKUP_ROOT"/weekly/*.dump        2>/dev/null | tail -n +5 | xargs -r rm --
ls -1t "$BACKUP_ROOT"/monthly/*.dump       2>/dev/null | tail -n +4 | xargs -r rm --

if [ -n "${OFFSITE_RSYNC:-}" ]; then
  rsync -a --delete "$BACKUP_ROOT"/ "$OFFSITE_RSYNC"/
  echo "$(date -Is) ✅ off-site → $OFFSITE_RSYNC"
else
  echo "$(date -Is) ⚠️  OFFSITE_RSYNC not set — backups live on the same server as the DB"
fi
