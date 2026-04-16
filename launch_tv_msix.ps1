# Launch TradingView (MSIX/Store version) with Chrome DevTools Protocol enabled
# Requires Developer Mode to be enabled in Windows Settings

$PackageFamilyName = "TradingView.Desktop_n534cwy3pjxzj"
$AppId = "TradingView.Desktop"
$Port = 9222

Write-Host "Killing any existing TradingView processes..."
Get-Process -Name "TradingView" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 1

Write-Host "Launching TradingView with --remote-debugging-port=$Port ..."
$pkg = Get-AppxPackage -Name "TradingView.Desktop"
$exePath = Join-Path $pkg.InstallLocation "TradingView.exe"
Write-Host "Found exe at: $exePath"

Invoke-CommandInDesktopPackage `
    -PackageFamilyName $PackageFamilyName `
    -AppId $AppId `
    -Command $exePath `
    -Args "--remote-debugging-port=$Port"

Write-Host "Waiting for CDP to become available on port $Port ..."
$maxWait = 90
$elapsed = 0
do {
    Start-Sleep -Seconds 2
    $elapsed += 2
    try {
        Invoke-WebRequest -Uri "http://localhost:$Port/json/version" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop | Out-Null
        Write-Host "CDP ready! TradingView is running with debug port $Port."
        exit 0
    } catch {
        Write-Host "  Still waiting... ($elapsed/$maxWait s)"
    }
} while ($elapsed -lt $maxWait)

Write-Host "ERROR: CDP did not become available after $maxWait seconds."
Write-Host "Make sure TradingView opened and is fully loaded."
exit 1
