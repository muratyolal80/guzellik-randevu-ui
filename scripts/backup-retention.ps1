# backup-retention.ps1
# 30 günden eski backup dosyalarını siler. Task Scheduler'a günlük çalışacak şekilde eklenir.
# Çalıştırma: powershell.exe -File backup-retention.ps1 [-RetentionDays 30] [-DryRun]

param(
    [int]$RetentionDays = 30,
    [switch]$DryRun
)

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$BackupDir   = Join-Path $ProjectRoot "db_backups"
$LogFile     = Join-Path $BackupDir   "retention.log"
$Cutoff      = (Get-Date).AddDays(-$RetentionDays)

if (-not (Test-Path $BackupDir)) {
    Write-Host "Backup dizini bulunamadı: $BackupDir"
    exit 1
}

$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Add-Content $LogFile "[$Timestamp] Retention check baslatildi (cutoff: $($Cutoff.ToString('yyyy-MM-dd')), dry-run: $($DryRun.IsPresent))"

$oldFiles = Get-ChildItem $BackupDir -Filter "db_backup_*.sql" |
    Where-Object { $_.LastWriteTime -lt $Cutoff }

if ($oldFiles.Count -eq 0) {
    Add-Content $LogFile "[$Timestamp] Silinecek dosya yok."
    Write-Host "Silinecek dosya yok."
    exit 0
}

$totalSize = 0
foreach ($f in $oldFiles) {
    $totalSize += $f.Length
    if ($DryRun) {
        Add-Content $LogFile "[$Timestamp] [DRY-RUN] Silinecek: $($f.Name) ($([math]::Round($f.Length/1KB, 1)) KB)"
        Write-Host "[DRY-RUN] $($f.Name)"
    } else {
        Remove-Item $f.FullName -Force
        Add-Content $LogFile "[$Timestamp] Silindi: $($f.Name)"
        Write-Host "Silindi: $($f.Name)"
    }
}

$mode = if ($DryRun) { "[DRY-RUN] Silinecek" } else { "Silinen" }
Add-Content $LogFile "[$Timestamp] Toplam: $($oldFiles.Count) dosya, $([math]::Round($totalSize/1MB, 2)) MB"
Write-Host "$mode toplam: $($oldFiles.Count) dosya, $([math]::Round($totalSize/1MB, 2)) MB"
