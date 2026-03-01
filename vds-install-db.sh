#!/bin/bash

# VDS (Sunucu) Güzellik Randevu Veritabanı Kurulum Betiği
# Bu betik, sıfırdan "kuafor_db" isimli veritabanını bigint ve güncel şema ile kurar.

echo "🚀 VDS Veritabanı Kurulumu Başlıyor..."
echo ""

# Docker konteyner adı ve DB ayarları (VDS ortamına göre)
CONTAINER_NAME="kuafor-pazaryeri_db"
DB_USER="kuafor_user"
DB_NAME="kuafor_db"

echo "1) 01-VDS-Base-Schema.sql çalıştırılıyor (Temel Tablolar ve Tipler)..."
docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME < initdb/01-VDS-Base-Schema.sql

echo "2) 02-Views-And-Functions.sql çalıştırılıyor (Güncel Görünümler ve Triggerlar)..."
docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME < initdb/02-Views-And-Functions.sql

echo "3) 03-RLS-Policies.sql çalıştırılıyor (Güvenlik Politikaları)..."
docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME < initdb/03-RLS-Policies.sql

echo "4) 04-Seed-Data.sql çalıştırılıyor (Başlangıç Verileri)..."
docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME < initdb/04-Seed-Data.sql

echo ""
echo "✅ VDS Kurulumu Başarıyla Tamamlandı! "
