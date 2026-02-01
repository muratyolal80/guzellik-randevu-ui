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

REM Run schema migration (New Structure)
echo Running New-00-Drop-All.sql...
type initdb\New-00-Drop-All.sql | docker exec -i kuafor-pazaryeri_db psql -U postgres -d postgres

echo Running New-01-Extensions.sql...
type initdb\New-01-Extensions.sql | docker exec -i kuafor-pazaryeri_db psql -U postgres -d postgres

echo Running New-02-Types-and-Enums.sql...
type initdb\New-02-Types-and-Enums.sql | docker exec -i kuafor-pazaryeri_db psql -U postgres -d postgres

echo Running New-03-Tables.sql...
type initdb\New-03-Tables.sql | docker exec -i kuafor-pazaryeri_db psql -U postgres -d postgres

echo Running New-04-Functions.sql...
type initdb\New-04-Functions.sql | docker exec -i kuafor-pazaryeri_db psql -U postgres -d postgres

echo Running New-05-Triggers.sql...
type initdb\New-05-Triggers.sql | docker exec -i kuafor-pazaryeri_db psql -U postgres -d postgres

echo Running New-06-RLS-Policies.sql...
type initdb\New-06-RLS-Policies.sql | docker exec -i kuafor-pazaryeri_db psql -U postgres -d postgres

echo Running New-07-Seed-Data.sql...
type initdb\New-07-Seed-Data.sql | docker exec -i kuafor-pazaryeri_db psql -U postgres -d postgres

echo Running New-08-Storage.sql...
type initdb\New-08-Storage.sql | docker exec -i kuafor-pazaryeri_db psql -U postgres -d postgres

echo Running New-09-Auth-Users.sql...
type initdb\New-09-Auth-Users.sql | docker exec -i kuafor-pazaryeri_db psql -U postgres -d postgres

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Migration failed
    pause
    exit /b 1
)
echo [OK] All migrations applied successfully

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
