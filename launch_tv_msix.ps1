# Launch TradingView (MSIX/Store/Desktop variant) with Chrome DevTools Protocol enabled.
# Requires Developer Mode to be enabled in Windows Settings.
#
# Auto-detects package variant (2026-04-29 update — see
# memory/feedback_amgc_bot_lessons.md "TradingView desktop install — multiple variants"):
#   - TradingView.Desktop          (PFN ..._n534cwy3pjxzj) — direct .msixbundle from
#                                    https://www.tradingview.com/desktop/
#   - 31178TradingViewInc.TradingView (PFN ..._q4jpyh43s5mv6) — Microsoft Store install
# Either is fine. The script tries .Desktop first (it's slightly more current), falls
# back to the Store package if .Desktop isn't installed. AppId is read from each
# package's manifest because the two declare different application Ids.

$Port = 9222
$candidateNames = @("TradingView.Desktop", "31178TradingViewInc.TradingView")

Write-Host "Killing any existing TradingView processes..."
Get-Process -Name "TradingView" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 1

# --- detect installed package ---
$pkg = $null
foreach ($name in $candidateNames) {
    $pkg = Get-AppxPackage -Name $name -ErrorAction SilentlyContinue
    if ($pkg) {
        Write-Host "Found TradingView package: $($pkg.Name) ($($pkg.PackageFamilyName))"
        break
    }
}

if (-not $pkg) {
    Write-Host "ERROR: No TradingView package installed."
    Write-Host "Install from https://www.tradingview.com/desktop/"
    Write-Host "(or via Microsoft Store if your account/region serves the desktop app)."
    exit 1
}

# --- resolve AppId from manifest (differs between variants) ---
try {
    $manifest = Get-AppxPackageManifest $pkg
    $appId = $manifest.Package.Applications.Application.Id
    if (-not $appId) {
        throw "AppId not found in manifest"
    }
    Write-Host "Resolved AppId: $appId"
} catch {
    Write-Host "ERROR: Could not read AppId from manifest: $_"
    exit 1
}

$exePath = Join-Path $pkg.InstallLocation "TradingView.exe"
if (-not (Test-Path $exePath)) {
    Write-Host "ERROR: TradingView.exe not found at expected path: $exePath"
    Write-Host "Package InstallLocation contents:"
    Get-ChildItem $pkg.InstallLocation | Format-Table Name, Length -AutoSize
    exit 1
}
Write-Host "Found exe at: $exePath"

Write-Host "Launching with --remote-debugging-port=$Port ..."
Invoke-CommandInDesktopPackage `
    -PackageFamilyName $pkg.PackageFamilyName `
    -AppId $appId `
    -Command $exePath `
    -Args "--remote-debugging-port=$Port"

Write-Host "Waiting for CDP to become available on port $Port ..."
$maxWait = 90
$elapsed = 0
do {
    Start-Sleep -Seconds 2
    $elapsed += 2
    try {
        Invoke-WebRequest -Uri "http://127.0.0.1:$Port/json/version" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop | Out-Null
        Write-Host "CDP ready! TradingView is running with debug port $Port."
        exit 0
    } catch {
        Write-Host "  Still waiting... ($elapsed/$maxWait s)"
    }
} while ($elapsed -lt $maxWait)

Write-Host "ERROR: CDP did not become available after $maxWait seconds."
Write-Host "Make sure TradingView opened and is fully loaded."
Write-Host "Hint: ensure Windows Developer Mode is enabled (Settings > For Developers)."
exit 1
