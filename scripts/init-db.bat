@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

REM GuzellikRandevu Database Initialization Script
REM Updated: 2026-04-16 (Consolidated Master Setup)

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

echo [*] Starting Supabase containers...
REM Note: Assuming containers are managed in the root or a standard way
REM If you use 'supabase start', use that. If you use docker-compose, use that.
REM For now, we assume containers are already running as per reset-db.bat logic.

echo.
echo [*] Running database migrations (Master Setup)...

REM 1. Drop and recreate schema
echo [1/4] Dropping existing tables...
type initdb\00-drop-tables.sql | docker exec -i supabase-db psql -U postgres -d postgres

REM 2. Run master schema
echo [2/5] Running Master Database Setup...
type initdb\Master-Database-Setup.sql | docker exec -i supabase-db psql -U postgres -d postgres

REM 3. Run advanced schema (Storage, Finance)
echo [3/5] Running Advanced Schema...
type initdb\04-advanced-schema.sql | docker exec -i supabase-db psql -U postgres -d postgres

REM 4. Run seed data
echo [4/5] Loading seed data (Cities, Districts, Types)...
type initdb\02-seed-data.sql | docker exec -i supabase-db psql -U postgres -d postgres

REM 5. Run sample data
echo [5/5] Loading sample business data...
type initdb\03-sample-data.sql | docker exec -i supabase-db psql -U postgres -d postgres

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Migration failed
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Database initialization complete!
echo.
echo Access Supabase Studio at: http://localhost:54323 (Default for local supabase)
echo.
pause
