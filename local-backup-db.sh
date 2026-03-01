#!/bin/bash

# ==========================================
# LOKAL VERİTABANI YEDEK ALMA SCRİPTİ
# ==========================================
# Bu script, supabase-project klasöründeki .env dosyasından
# şifre ve ayarları çekerek Docker üzerindeki veya lokaldeki 
# veritabanının yedeğini alır.

# .env dosyasının yolu
ENV_FILE="./supabase-project/.env"

# .env dosyasının varlığını kontrol et
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Hata: .env dosyası bulunamadı! ($ENV_FILE)"
    exit 1
fi

# .env dosyasından değişkenleri oku (Sadece POSTGRES_ ile başlayanları alıyoruz)
export $(grep -E '^POSTGRES_' "$ENV_FILE" | xargs)

# Veritabanı Ayarları (Eğer .env'de tanımlı değilse varsayılanları kullan)
DB_USER=${POSTGRES_USER:-postgres}
DB_HOST=${POSTGRES_HOST:-localhost}
DB_PORT=${POSTGRES_PORT:-5432}
DB_NAME=${POSTGRES_DB:-postgres}
DB_PASSWORD=$POSTGRES_PASSWORD

# Lokal Docker konteynerinin adı (docker ps komutundan alınan gerçek ad)
DOCKER_CONTAINER_NAME="ac52b5da61c5_supabase-db"

# Yedek Dosyasının Adı ve Yolu (Yedekler 'db_backups' adlı klasöre kaydedilecek)
BACKUP_DIR="db_backups"
DUMP_FILE="$BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sql"

# Yedek klasörü yoksa oluştur
mkdir -p "$BACKUP_DIR"

echo "🔄 Docker üzerinde çalışan veritabanından ($DB_NAME) yedek alınıyor..."

# Docker içinden pg_dump çalıştırarak yedeği al (Supabase yapısında veritabanı Docker içindedir)
# Sadece kendi oluşturduğumuz public şemasını (ve isterseniz auth/storage yedeklerini) alacak şekilde güncellendi.
# Supabase'in tamamen kendine ait dahili sistem şemaları (-N parametreleri ile) aktarımdan çıkarıldı.
docker exec -i -e PGPASSWORD="$DB_PASSWORD" $DOCKER_CONTAINER_NAME pg_dump -U "$DB_USER" -h "127.0.0.1" -p 5432 -d "$DB_NAME" -F p --clean --if-exists --no-owner --no-privileges \
  -N realtime -N _realtime -N pgbouncer -N vault -N extensions -N graphql -N graphql_public -N net -N _analytics -N supabase_functions -N supabase_migrations \
  > "$DUMP_FILE"

# Komutun başarı durumunu kontrol et
if [ $? -ne 0 ]; then
  echo "❌ Hata: Lokal dump alınamadı! Docker konteynerinin (supabase-db) çalıştığından emin olun."
  rm -f "$DUMP_FILE" # Hatalı dosya oluştuysa sil
  exit 1
fi

# Dosya boyutunu kontrol et (Boş dosya durumunu engellemek için)
FILE_SIZE=$(stat -c%s "$DUMP_FILE")
if [ "$FILE_SIZE" -lt 1000 ]; then
  echo "⚠️ Uyarı: Alınan yedek dosyası çok küçük ($FILE_SIZE bytes). Yedekleme başarısız olmuş olabilir!"
  exit 1
fi

echo "✅ Dump başarıyla alındı ve kaydedildi: $DUMP_FILE"
echo "Bu yedeği VDS'e yüklemek için 'vds-upload-db.sh' scriptini kullanabilirsiniz."
