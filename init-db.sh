#!/bin/bash

# GuzellikRandevu Database Initialization Script
# This script initializes the Supabase database with schema and seed data

echo "🚀 Initializing GuzellikRandevu Database..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Navigate to supabase-project directory
cd "$(dirname "$0")/supabase-project" || exit 1

# Check if Supabase is running
if ! docker ps | grep -q "supabase-db"; then
    echo "📦 Starting Supabase containers..."
    docker compose up -d
    echo "⏳ Waiting for database to be ready (30 seconds)..."
    sleep 30
else
    echo "✅ Supabase is already running"
fi

echo ""
echo "📊 Running database migrations..."

# Run schema migration
docker exec -i supabase-db psql -U postgres -d postgres < volumes/db/init/01-schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Schema created successfully"
else
    echo "❌ Schema creation failed"
    exit 1
fi

echo ""
echo "🌱 Loading seed data..."

# Run seed data
docker exec -i supabase-db psql -U postgres -d postgres < volumes/db/init/02-seed-data.sql

if [ $? -eq 0 ]; then
    echo "✅ Seed data loaded successfully"
else
    echo "❌ Seed data loading failed"
    exit 1
fi

echo ""
echo "📝 Loading sample business data..."

# Run sample business data
docker exec -i supabase-db psql -U postgres -d postgres < volumes/db/init/03-sample-data.sql

if [ $? -eq 0 ]; then
    echo "✅ Sample data loaded successfully"
else
    echo "❌ Sample data loading failed"
    exit 1
fi

echo ""
echo "🎉 Database initialization complete!"
echo ""
echo "📝 Access Supabase Studio at: http://localhost:3000"
echo "🔗 API URL: http://localhost:8000"
echo ""
echo "Next steps:"
echo "1. Ensure your .env.local file has the correct Supabase keys"
echo "2. Run: npm run dev"
echo "3. Visit: http://localhost:3000 (Next.js app)"

