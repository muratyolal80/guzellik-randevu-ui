#!/bin/bash

# Güzellik Randevu - Full Database Sync Script
# This script resets the VDS database and imports the latest local dump.

PROJECT_DIR="/var/www/guzellik-randevu"
INIT_DB_DIR="$PROJECT_DIR/initdb"
DB_CONTAINER="kuafor-pazaryeri_db"

echo "🚀 Starting Full Database Sync..."

# 1. Pull latest dumps from Git
echo "📥 Pulling latest dumps from GitHub..."
cd $PROJECT_DIR
git pull origin main

# 2. Nuclear Reset (Drop and Recreate Public Schema)
echo "☢️ Resetting public schema..."
docker exec -i $DB_CONTAINER psql -U postgres -d postgres < "$INIT_DB_DIR/New-00-Drop-All.sql"

# 3. Import Full Schema
if [ -f "$INIT_DB_DIR/full-schema-sync.sql" ]; then
    echo "🏗️ Importing full schema..."
    docker exec -i $DB_CONTAINER psql -U postgres -d postgres < "$INIT_DB_DIR/full-schema-sync.sql"
else
    echo "❌ Error: full-schema-sync.sql not found!"
    exit 1
fi

# 4. Import Full Data
if [ -f "$INIT_DB_DIR/full-data-sync.sql" ]; then
    echo "📊 Importing full data..."
    docker exec -i $DB_CONTAINER psql -U kuafor_user -d kuafor_db < "$INIT_DB_DIR/full-data-sync.sql"
else
    echo "⚠️ Warning: full-data-sync.sql not found, skipping data import."
fi

# 5. Fix Schema and Permissions (Critical Fixes)
# New-28 consolidated fixes + updates 29-37
echo "🛠️ Applying latest schema fixes and permissions (New-28...New-37)..."

# Apply New-28 (Consolidated Sync Fix)
if [ -f "$INIT_DB_DIR/New-28-Complete-DB-Sync.sql" ]; then
    echo "📜 Running New-28-Complete-DB-Sync.sql..."
    docker exec -i $DB_CONTAINER psql -U kuafor_user -d kuafor_db < "$INIT_DB_DIR/New-28-Complete-DB-Sync.sql"
fi

# Loop for remaining migrations
for i in {29..37}
do
    MATCH=$(find $INIT_DB_DIR -maxdepth 1 -name "New-$i-*.sql")
    if [ ! -z "$MATCH" ]; then
        echo "📜 Running $(basename $MATCH)..."
        docker exec -i $DB_CONTAINER psql -U kuafor_user -d kuafor_db < "$MATCH"
    fi
done

# 6. Final Polish
echo "✨ Running final service layer fixes (New-23)..."
if [ -f "$INIT_DB_DIR/New-23-Final-Service-Layer-Fixes.sql" ]; then
    docker exec -i $DB_CONTAINER psql -U kuafor_user -d kuafor_db < "$INIT_DB_DIR/New-23-Final-Service-Layer-Fixes.sql"
fi

echo "✅ Database Sync/Align Completed Successfully!"
