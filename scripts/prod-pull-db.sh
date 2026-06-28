#!/bin/bash
# ============================================================================
# PROD -> LOCAL veritabanı çekme (DOWN sync)
# ----------------------------------------------------------------------------
# Production (Coolify @ VDS) self-hosted Supabase'ten public + auth + storage
# şemalarını çeker ve LOKAL supabase-db'ye yükler. Lokali geliştirme için
# gerçek prod verisiyle tazeler.
#
# ⚠️  Bu script LOKAL veritabanını EZER (prod'a DOKUNMAZ, sadece okur).
# ⚠️  Yön: PROD (kaynak, salt-okunur) -> LOCAL (hedef, üzerine yazılır).
#     Şema değişikliğini ASLA bu yolla yukarı taşıma; onun için migration kullan.
#
# Kullanım:
#   PROD_SSH_HOST=45.81.113.82 PROD_SSH_USER=root ./scripts/prod-pull-db.sh
#   (otomatik onay için: --yes)
# ============================================================================
set -euo pipefail

# --- Yapılandırma (env ile override edilebilir) ---------------------------
PROD_SSH_USER="${PROD_SSH_USER:-root}"
PROD_SSH_HOST="${PROD_SSH_HOST:-45.81.113.82}"
PROD_SSH_PORT="${PROD_SSH_PORT:-22}"
PROD_DB_CONTAINER="${PROD_DB_CONTAINER:-supabase-db}"   # recon ile doğrula
LOCAL_DB_CONTAINER="${LOCAL_DB_CONTAINER:-supabase-db}"
DB_NAME="${DB_NAME:-postgres}"
DB_USER="${DB_USER:-postgres}"

BACKUP_DIR="db_backups"
TS="$(date +%Y%m%d_%H%M%S)"
DUMP_FILE="$BACKUP_DIR/prod_pull_${TS}.sql.gz"

# Sistem/Supabase-yönetimli şemalar hariç (sadece uygulama verisi taşınır).
EXCLUDE_SCHEMAS="-N realtime -N _realtime -N pgbouncer -N vault -N extensions \
-N graphql -N graphql_public -N net -N _analytics -N supabase_functions \
-N supabase_migrations -N cron -N pgsodium -N pgsodium_masks"

AUTO_YES=false
[ "${1:-}" = "--yes" ] && AUTO_YES=true

mkdir -p "$BACKUP_DIR"

echo "═══════════════════════════════════════════════════════════════"
echo " PROD -> LOCAL veritabanı çekme"
echo "   Kaynak (PROD) : $PROD_SSH_USER@$PROD_SSH_HOST  → $PROD_DB_CONTAINER"
echo "   Hedef (LOCAL) : $LOCAL_DB_CONTAINER  (ÜZERİNE YAZILACAK)"
echo "   Şemalar       : public + auth + storage (sistem şemaları hariç)"
echo "═══════════════════════════════════════════════════════════════"

if [ "$AUTO_YES" != true ]; then
    read -r -p "⚠️  Lokal veritabanı PROD verisiyle EZİLECEK. Devam? (evet/hayir): " ans
    [ "$ans" = "evet" ] || { echo "İptal edildi."; exit 1; }
fi

# --- 1) PROD'da dump al (salt-okunur) -------------------------------------
echo "📥 1/3  Prod'dan dump alınıyor (gzip)..."
ssh -p "$PROD_SSH_PORT" "$PROD_SSH_USER@$PROD_SSH_HOST" \
    "docker exec -i $PROD_DB_CONTAINER pg_dump -U $DB_USER -d $DB_NAME \
     -F p --clean --if-exists --no-owner --no-privileges $EXCLUDE_SCHEMAS" \
    | gzip > "$DUMP_FILE"

SIZE=$(stat -c%s "$DUMP_FILE" 2>/dev/null || stat -f%z "$DUMP_FILE")
if [ "$SIZE" -lt 500 ]; then
    echo "❌ Dump çok küçük ($SIZE bytes) — prod bağlantısı/şeması kontrol edilmeli."
    exit 1
fi
echo "✅ Dump alındı: $DUMP_FILE ($SIZE bytes)"

# --- 2) LOKAL'e yükle (UTF-8 ZORUNLU — Türkçe karakter bozulmasın) --------
echo "📤 2/3  Lokal supabase-db'ye yükleniyor (PGCLIENTENCODING=UTF8)..."
gunzip -c "$DUMP_FILE" \
    | docker exec -i -e PGCLIENTENCODING=UTF8 "$LOCAL_DB_CONTAINER" \
      psql -v ON_ERROR_STOP=0 -U "$DB_USER" -d "$DB_NAME"

# --- 3) PostgREST şema cache yenile ----------------------------------------
echo "🔄 3/3  PostgREST şema cache yenileniyor..."
docker exec -i "$LOCAL_DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" \
    -c "NOTIFY pgrst, 'reload schema';" >/dev/null 2>&1 || true

echo ""
echo "🎉 Tamamlandı. Lokal DB prod verisiyle tazelendi."
echo "   Not: Görseller (MinIO/storage dosyaları) ayrıca senkronlanır → scripts/sync-storage.sh"
echo "   Not: storage.objects KAYITLARI bu dump'la geldi; asıl DOSYALAR MinIO mirror ister."
