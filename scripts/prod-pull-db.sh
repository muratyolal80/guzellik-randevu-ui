#!/bin/bash
# ============================================================================
# PROD -> LOCAL veritabanı çekme (DOWN sync) + hizalama (alignment)
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
#   (otomatik onay: --yes ; maskelemeyi atlamak: --no-mask — önerilmez)
#
# Akış (docs/infrastructure/deployment-and-alignment.md §6):
#   0) local yedek  1) prod dump (salt-okunur)  2) local'e yükle (hata sayımı)
#   3) PII maskeleme (KVKK + yanlışlıkla SMS riski)  4) migrate.sh local (hizalama)
#   5) PostgREST cache + özet
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

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="$ROOT/db_backups"
TS="$(date +%Y%m%d_%H%M%S)"
DUMP_FILE="$BACKUP_DIR/prod_pull_${TS}.sql.gz"
LOAD_LOG="$BACKUP_DIR/prod_pull_${TS}.log"
LOCAL_BK="$BACKUP_DIR/local_before_pull_${TS}.dump"

# Sistem/Supabase-yönetimli şemalar hariç (sadece uygulama verisi taşınır).
EXCLUDE_SCHEMAS="-N realtime -N _realtime -N pgbouncer -N vault -N extensions \
-N graphql -N graphql_public -N net -N _analytics -N supabase_functions \
-N supabase_migrations -N cron -N pgsodium -N pgsodium_masks"

AUTO_YES=false; MASK=true
for a in "$@"; do
  case "$a" in
    --yes) AUTO_YES=true ;;
    --no-mask) MASK=false ;;
    *) echo "Bilinmeyen argüman: $a"; exit 2 ;;
  esac
done

mkdir -p "$BACKUP_DIR"

echo "═══════════════════════════════════════════════════════════════"
echo " PROD -> LOCAL veritabanı çekme + hizalama"
echo "   Kaynak (PROD) : $PROD_SSH_USER@$PROD_SSH_HOST  → $PROD_DB_CONTAINER"
echo "   Hedef (LOCAL) : $LOCAL_DB_CONTAINER  (ÜZERİNE YAZILACAK)"
echo "   Şemalar       : public + auth + storage (sistem şemaları hariç)"
echo "   Maskeleme     : $MASK"
echo "═══════════════════════════════════════════════════════════════"

if [ "$AUTO_YES" != true ]; then
    read -r -p "⚠️  Lokal veritabanı PROD verisiyle EZİLECEK. Devam? (evet/hayir): " ans
    [ "$ans" = "evet" ] || { echo "İptal edildi."; exit 1; }
fi

# --- 0) LOCAL yedek (geri dönüş için) --------------------------------------
echo "💾 0/5  Local yedek → $LOCAL_BK"
docker exec -i "$LOCAL_DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" -Fc > "$LOCAL_BK"

# --- 1) PROD'da dump al (salt-okunur) -------------------------------------
echo "📥 1/5  Prod'dan dump alınıyor (gzip)..."
ssh -p "$PROD_SSH_PORT" "$PROD_SSH_USER@$PROD_SSH_HOST" \
    "docker exec -i $PROD_DB_CONTAINER pg_dump -U $DB_USER -d $DB_NAME \
     -F p --clean --if-exists --no-owner --no-privileges $EXCLUDE_SCHEMAS" \
    | gzip > "$DUMP_FILE"

SIZE=$(stat -c%s "$DUMP_FILE" 2>/dev/null || stat -f%z "$DUMP_FILE")
if [ "$SIZE" -lt 500 ]; then
    echo "❌ Dump çok küçük ($SIZE bytes) — prod bağlantısı/şeması kontrol edilmeli. Local'e dokunulmadı."
    exit 1
fi
echo "✅ Dump alındı: $DUMP_FILE ($SIZE bytes)"

# --- 2) LOKAL'e yükle (UTF-8 ZORUNLU — Türkçe karakter bozulmasın) --------
echo "📤 2/5  Lokal supabase-db'ye yükleniyor (PGCLIENTENCODING=UTF8)..."
gunzip -c "$DUMP_FILE" \
    | docker exec -i -e PGCLIENTENCODING=UTF8 "$LOCAL_DB_CONTAINER" \
      psql -v ON_ERROR_STOP=0 -U "$DB_USER" -d "$DB_NAME" > "$LOAD_LOG" 2>&1 || true
ERRS=$(grep -c "ERROR:" "$LOAD_LOG" || true)
echo "   Yükleme hataları: $ERRS (detay: $LOAD_LOG)"
if [ "$ERRS" -gt 0 ]; then
    # Supabase-yönetimli nesnelerde "already exists"/"must be owner" beklenebilir; diğerlerine bak
    grep "ERROR:" "$LOAD_LOG" | sed -E 's/"[^"]+"/"…"/g' | sort | uniq -c | sort -rn | head -10
fi

# --- 3) PII maskeleme ------------------------------------------------------
if $MASK; then
    echo "🎭 3/5  Kişisel veriler maskeleniyor (scripts/mask-pii.sql)..."
    docker exec -i -e PGCLIENTENCODING=UTF8 "$LOCAL_DB_CONTAINER" \
        psql -U "$DB_USER" -d "$DB_NAME" -v target=local < "$ROOT/scripts/mask-pii.sql"
else
    echo "⚠️  3/5  Maskeleme ATLANDI — local'de gerçek müşteri verisi var. Cron/SMS çalıştırma!"
fi

# --- 4) Hizalama: prod'da olmayan, bu branch'teki migration'lar --------------
echo "🧭 4/5  Bu branch'teki bekleyen migration'lar uygulanıyor..."
"$ROOT/scripts/migrate.sh" local --yes

# --- 5) PostgREST şema cache + özet ----------------------------------------
echo "🔄 5/5  PostgREST şema cache yenileniyor..."
docker exec -i "$LOCAL_DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" \
    -c "NOTIFY pgrst, 'reload schema';" >/dev/null 2>&1 || true
docker exec -i "$LOCAL_DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -P pager=off -c \
  "select (select count(*) from auth.users) users, (select count(*) from public.salons) salons, (select count(*) from public.appointments) appointments, (select count(*) from public._migrations) migrations"

echo ""
echo "🎉 Tamamlandı. Lokal DB prod verisiyle tazelendi + hizalandı."
echo "   Geri dönmek için: docker exec -i $LOCAL_DB_CONTAINER pg_restore -U postgres -d postgres --clean --if-exists < $LOCAL_BK"
echo "   Maskeli kullanıcı girişi: u<id8>@masked.local / password123 (demo hesaplar aynen kalır)"
echo "   Görseller: node scripts/sync-storage.mjs (Storage API ile, backend-agnostik)"
