@echo off
setlocal enabledelayedexpansion

:: ==========================================
:: LOKAL VERİTABANI YEDEK ALMA SCRİPTİ (WINDOWS)
:: ==========================================
:: Bu script, Docker üzerindeki PostgreSQL veritabanının yedeğini alır.
:: .env dosyasından şifreyi otomatik çeker.

:: Scriptin bulunduğu dizinden proje kök dizinine git
cd /d "%~dp0.."

:: Yapılandırma
set ENV_FILE=supabase-project\.env
set BACKUP_DIR=db_backups
set DOCKER_CONTAINER=supabase-db

:: Tarih ve Saat formatı oluştur (YYYYMMDD_HHMMSS)
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,4%%datetime:~4,2%%datetime:~6,2%_%datetime:~8,2%%datetime:~10,2%%datetime:~12,2%
set DUMP_FILE=%BACKUP_DIR%\db_backup_%TIMESTAMP%.sql

:: Yedek klasörü yoksa oluştur
if not exist %BACKUP_DIR% mkdir %BACKUP_DIR%

:: .env dosyasından POSTGRES_PASSWORD oku
set DB_PASSWORD=
if not exist %ENV_FILE% (
    echo [HATA] %ENV_FILE% dosyasi bulunamadi!
    pause
    exit /b 1
)

for /f "usebackq tokens=1,2 delims==" %%a in ("%ENV_FILE%") do (
    set key=%%a
    set val=%%b
    if "!key!"=="POSTGRES_PASSWORD" set DB_PASSWORD=!val!
)

if "%DB_PASSWORD%"=="" (
    echo [HATA] .env dosyasinda POSTGRES_PASSWORD bulunamadi!
    pause
    exit /b 1
)

echo.
echo [STATUS] Veritabani yedegi aliniyor... 
echo [DOSYA] %DUMP_FILE%
echo.

:: Docker üzerinden pg_dump çalıştır
:: Sistem şemaları hariç tutulur, sadece public ve ilişkili veriler alınır
docker exec -i -e PGPASSWORD=%DB_PASSWORD% %DOCKER_CONTAINER% pg_dump -U postgres -d postgres --clean --if-exists --no-owner --no-privileges -N realtime -N _realtime -N pgbouncer -N vault -N extensions -N graphql -N graphql_public -N net -N _analytics -N supabase_functions -N supabase_migrations > %DUMP_FILE%

if %ERRORLEVEL% equ 0 (
    echo.
    echo [OK] Yedek basariyla alindi.
    
    :: Dosya boyutunu kontrol et (isteğe bağlı)
    for %%I in ("%DUMP_FILE%") do set size=%%~zI
    echo [BOYUT] !size! byte
) else (
    echo.
    echo [HATA] Yedek alinirken hata olustu! 
    echo Lutfen Docker'in ve %DOCKER_CONTAINER% konteynerinin calistigindan emin olun.
    if exist %DUMP_FILE% del %DUMP_FILE%
)

:: Sessiz modda değilse (manual çalıştırıldıysa) bekle
if "%1" neq "/silent" (
    echo.
    pause
)
