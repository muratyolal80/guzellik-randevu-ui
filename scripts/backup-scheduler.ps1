# backup-scheduler.ps1 — Task Scheduler tarafindan calistirilan wrapper
# Ciktiyi log dosyasina yazar (hata ayiklama icin)

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$LogFile     = Join-Path $ProjectRoot "db_backups\backup.log"
$BackupScript = Join-Path $PSScriptRoot "local-backup-db.ps1"

$LogDir = Split-Path $LogFile
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }

$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Add-Content $LogFile "[$Timestamp] Yedek baslatiliyor..."

try {
    $proc = Start-Process -FilePath "powershell.exe" `
        -ArgumentList "-NoProfile","-ExecutionPolicy","Bypass","-File","`"$BackupScript`"" `
        -Wait -PassThru -WindowStyle Hidden `
        -RedirectStandardOutput "$env:TEMP\backup_out.txt" `
        -RedirectStandardError  "$env:TEMP\backup_err.txt"

    $ExitCode = $proc.ExitCode
    $Out = Get-Content "$env:TEMP\backup_out.txt" -ErrorAction SilentlyContinue
    $Err = Get-Content "$env:TEMP\backup_err.txt" -ErrorAction SilentlyContinue

    if ($Out) { Add-Content $LogFile "[$Timestamp] Cikti: $($Out -join ' | ')" }
    if ($Err) { Add-Content $LogFile "[$Timestamp] Hata ciktisi: $($Err -join ' | ')" }

    if ($ExitCode -eq 0) {
        Add-Content $LogFile "[$Timestamp] [OK] Yedek basariyla tamamlandi."
    } else {
        Add-Content $LogFile "[$Timestamp] [HATA] Yedek basarisiz. Cikis kodu: $ExitCode"
    }
} catch {
    Add-Content $LogFile "[$Timestamp] [HATA] Beklenmeyen hata: $_"
}
