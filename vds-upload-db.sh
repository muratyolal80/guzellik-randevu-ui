#!/bin/bash

# ==========================================
# LOKALDEN ALINAN YEDEĞİ VDS'E YÜKLEME SCRİPTİ
# ==========================================
# Bu script, local-backup-db.sh tarafından alınan
# yedeği uzak VDS sunucusuna gönderip ordaki
# PostgreSQL veritabanına yükler.

# VDS (Uzak Sunucu) Ayarları
# BU DEĞERLERİ KENDİ SİSTEMİNİZE GÖRE DÜZENLEYİN
VDS_SSH_USER="root"
# Örnek IP: 192.168.1.10
VDS_SSH_HOST="45.81.113.82"

# VDS Veritabanı Ayarları (VDS'teki PostgreSQL bilgileri)
VDS_DB_NAME="postgres"

# Kullanılacak Yedek Dosyası (Eğer parametre verilmezse varsayılanı kullanır)
if [ -z "$1" ]; then
    DUMP_FILE="db_backups/db_backup_20260301_230606.sql"
    echo "⚠️ Yüklenecek dosya belirtilmediği için varsayılan kullanılıyor: $DUMP_FILE"
else
    DUMP_FILE="$1"
fi
# Gönderilecek dosyanın VDS üzerindeki adı
REMOTE_TEMP_FILE="/tmp/$(basename "$DUMP_FILE")"

# Dosyanın varlığını kontrol et
if [ ! -f "$DUMP_FILE" ]; then
    echo "❌ Hata: Belirtilen yedek dosyası bulunamadı! ($DUMP_FILE)"
    exit 1
fi

echo "📤 1. Yedek VDS'e (Sunucuya) gönderiliyor..."
# Eğer SSH key kullanıyorsanız daha hızlı bağlanır.
scp "$DUMP_FILE" "$VDS_SSH_USER@$VDS_SSH_HOST:$REMOTE_TEMP_FILE"

if [ $? -ne 0 ]; then
  echo "❌ Hata: Dosya sunucuya gönderilemedi! SSH bağlantınızı ve bilgilerinizi kontrol edin."
  exit 1
fi
echo "✅ Yedek sunucuya aktarıldı."

echo "📥 2. VDS üzerindeki PostgreSQL'e aktarım başlatılıyor..."
# VDS'deki veritabanı Docker (Supabase) üzerinde çalıştığı için "docker exec" ile import yapıyoruz.
# NOT: Şifre soruluyorsa VDS_DB_PASSWORD env vb kullanılabilir ancak local postgres bağlantılarında genelde peer auth aktiftir.
ssh "$VDS_SSH_USER@$VDS_SSH_HOST" << EOF
  echo "Sunucuya bağlanıldı. Veriler içeri aktarılıyor..."
  
  # Veritabanını geri yükle (VDS'teki supabase-db konteynerine aktarım yapılıyor)
  # Not: Konteyner adı VDS üzerinde "supabase-db" olarak varsayılmıştır. Eğer ac52b5da61c5_supabase-db gibiyse lütfen aşağıdan güncelleyin.
  docker exec -i supabase-db psql -U postgres -d postgres < "$REMOTE_TEMP_FILE"
  
  # Yükleme bitince tmp içindeki dosyayı temizle
  rm "$REMOTE_TEMP_FILE"
  echo "Geçici dosya /tmp dizininden silindi."
EOF

if [ $? -ne 0 ]; then
  echo "❌ Hata: Veritabanı geri yüklenirken (restore) bir sorun oluştu! VDS üzerinde postgresql çalıştığından emin olun."
  exit 1
fi

echo "🎉 İşlem tamamlandı! Lokal veriler VDS'e başarıyla aktarıldı."
