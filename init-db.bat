@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

REM GuzellikRandevu Database Initialization Script

echo.
echo [*] Initializing GuzellikRandevu Database...
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

REM Navigate to supabase-project directory
cd /d "%~dp0supabase-project"

echo [*] Starting Supabase containers...
docker compose up -d
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to start Supabase containers
    pause
    exit /b 1
)
echo [OK] Supabase is already running

echo.
echo [*] Waiting for database to be ready (30 seconds)...
timeout /t 30 /nobreak >nul

echo.
echo [*] Running database migrations...

REM Run schema migration
type volumes\db\init\01-schema.sql | docker exec -i supabase-db psql -U postgres -d postgres
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Schema creation failed
    pause
    exit /b 1
)
echo [OK] Schema created successfully

echo.
echo [*] Loading seed data...

REM Run seed data
type volumes\db\init\02-seed-data.sql | docker exec -i supabase-db psql -U postgres -d postgres
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Seed data loading failed
    pause
    exit /b 1
)
echo [OK] Seed data loaded successfully

echo.
echo [*] Loading sample business data...

REM Run sample business data
type volumes\db\init\03-sample-data.sql | docker exec -i supabase-db psql -U postgres -d postgres
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Sample data loading failed
    pause
    exit /b 1
)
echo [OK] Sample data loaded successfully

echo.
echo [SUCCESS] Database initialization complete!
echo.
echo Access Supabase Studio at: http://localhost:3000
echo API URL: http://localhost:8000
echo.
echo Next steps:
echo 1. Ensure your .env.local file has the correct Supabase keys
echo 2. Run: npm run dev
echo 3. Visit: http://localhost:3001 (Next.js app)
echo.
pause
