@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

REM GuzellikRandevu Database Reset Script

echo.
echo [*] Resetting GuzellikRandevu Database...
echo.
echo [WARNING] This will delete all existing data!
echo.
set /p confirm="Type 'yes' to continue: "
if /i not "%confirm%"=="yes" (
    echo [CANCELLED] Database reset cancelled.
    pause
    exit /b 0
)

REM Navigate to supabase-project directory
REM cd /d "%~dp0supabase-project"

REM echo.
REM echo [*] Stopping Supabase containers...
REM docker compose down -v
REM if %ERRORLEVEL% neq 0 (
REM     echo [ERROR] Failed to stop containers
REM     pause
REM     exit /b 1
REM )
REM echo [OK] Containers stopped and volumes removed
REM
REM echo.
REM echo [*] Starting fresh containers...
REM docker compose up -d
REM if %ERRORLEVEL% neq 0 (
REM     echo [ERROR] Failed to start containers
REM     pause
REM     exit /b 1
REM )
REM echo [OK] Containers started
REM
REM echo.
REM echo [*] Waiting for database to be ready (30 seconds)...
REM timeout /t 30 /nobreak >nul

echo.
echo [*] Dropping existing tables in public schema...
type initsql\00-drop-tables.sql | docker exec -i supabase-db psql -U postgres -d postgres
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Failed to drop tables (might be first run)
) else (
    echo [OK] Existing tables dropped
)

echo.
echo [*] Running database migrations...

REM Run schema migration
type initsql\01-schema.sql | docker exec -i supabase-db psql -U postgres -d postgres
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Schema creation failed
    pause
    exit /b 1
)
echo [OK] Schema created successfully

echo.
echo [*] Loading seed data...

REM Run seed data
type initsql\02-seed-data.sql | docker exec -i supabase-db psql -U postgres -d postgres
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Seed data loading failed
    pause
    exit /b 1
)
echo [OK] Seed data loaded successfully

echo.
echo [*] Loading sample business data...

REM Run sample business data
type initsql\03-sample-data.sql | docker exec -i supabase-db psql -U postgres -d postgres
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Sample data loading failed
    pause
    exit /b 1
)
echo [OK] Sample data loaded successfully

echo.
echo [SUCCESS] Database reset complete!
echo.
echo Access Supabase Studio at: http://localhost:3000
echo API URL: http://localhost:8000
echo.
pause

