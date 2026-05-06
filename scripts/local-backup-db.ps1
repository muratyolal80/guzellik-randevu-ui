# local-backup-db.ps1 — Postgres yedek alma scripti (PowerShell)
# Önceki .bat script Windows stdout redirect sorunu nedeniyle backup'ı
# truncate ediyordu (749KB → 605KB). Bu PowerShell sürümü docker exec
# çıktısını binary olarak alır, encoding kaybı olmaz.

$ErrorActionPreference = 'Stop'
$ProjectRoot     = Split-Path -Parent $PSScriptRoot
$EnvFile         = Join-Path $ProjectRoot "supabase-project\.env"
$BackupDir       = Join-Path $ProjectRoot "db_backups"
$DockerContainer = "supabase-db"

if (-not (Test-Path $BackupDir)) { New-Item -ItemType Directory -Path $BackupDir | Out-Null }
if (-not (Test-Path $EnvFile))   { throw "[HATA] $EnvFile bulunamadi." }

# .env'den POSTGRES_PASSWORD oku
$DbPassword = (Select-String -Path $EnvFile -Pattern '^POSTGRES_PASSWORD=' | Select-Object -First 1).Line -replace '^POSTGRES_PASSWORD=', ''
if ([string]::IsNullOrWhiteSpace($DbPassword)) { throw "[HATA] POSTGRES_PASSWORD bos." }

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$DumpFile  = Join-Path $BackupDir "db_backup_$Timestamp.sql"

Write-Host "[STATUS] Yedek aliniyor: $DumpFile"

# Docker exec ile pg_dump — stdout'u dogrudan dosyaya bytes olarak yaz
$pgDumpArgs = @(
    'exec','-i',
    '-e', "PGPASSWORD=$DbPassword",
    $DockerContainer,
    'pg_dump','-U','postgres','-d','postgres',
    '--clean','--if-exists','--no-owner','--no-privileges',
    '-N','realtime','-N','_realtime','-N','pgbouncer','-N','vault',
    '-N','extensions','-N','graphql','-N','graphql_public','-N','net',
    '-N','_analytics','-N','supabase_functions','-N','supabase_migrations'
)

# Stop-parsing ile docker'a parametreleri olduğu gibi geçir
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = 'docker'
$pgDumpArgs | ForEach-Object { $psi.ArgumentList.Add($_) }
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError  = $true
$psi.UseShellExecute = $false

$proc = [System.Diagnostics.Process]::Start($psi)
$outFs = [System.IO.File]::OpenWrite($DumpFile)
try {
    $proc.StandardOutput.BaseStream.CopyTo($outFs)
    $proc.WaitForExit()
} finally {
    $outFs.Close()
}

$stderr = $proc.StandardError.ReadToEnd()
$exitCode = $proc.ExitCode

if ($exitCode -ne 0) {
    if (Test-Path $DumpFile) { Remove-Item $DumpFile }
    Write-Host "[HATA] pg_dump exit: $exitCode"
    Write-Host $stderr
    exit 1
}

$size = (Get-Item $DumpFile).Length
$tableCount = (Select-String -Path $DumpFile -Pattern '^CREATE TABLE public\.').Count
Write-Host "[OK] Yedek tamamlandi: $size byte, $tableCount public tablosu"

# Eski yedekleri temizle (30 gun)
Get-ChildItem $BackupDir -Filter "db_backup_*.sql" |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } |
    Remove-Item -Force
