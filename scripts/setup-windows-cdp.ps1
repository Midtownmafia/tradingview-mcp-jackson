# setup-windows-cdp.ps1
# Patches TradingView (Microsoft Store / MSIX version) to enable CDP on port 9222
# so the TradingView MCP server can connect.
#
# Run once on each Windows machine. No developer mode required after completion.
# Requires: Node.js, internet connection, admin rights (for cert trust + MSIX install)
#
# Usage (from PowerShell as Administrator):
#   Set-ExecutionPolicy Bypass -Scope Process -Force
#   .\setup-windows-cdp.ps1
#
# Optional parameters:
#   -McpRepo  "https://github.com/LewisWJackson/tradingview-mcp-jackson.git"
#   -McpPath  "$HOME\tradingview-mcp-jackson"  (where the MCP server lives)
#   -TvDir    "$HOME\TradingView-cdp"          (where patched TV files go)
#   -CdpPort  9222

param(
    [string]$McpRepo = "https://github.com/LewisWJackson/tradingview-mcp-jackson.git",
    [string]$McpPath = "$HOME\tradingview-mcp-jackson",
    [string]$TvDir   = "$HOME\TradingView-cdp",
    [int]   $CdpPort = 9222
)

$ErrorActionPreference = 'Stop'
$WorkDir = "$HOME\.tv-cdp-setup"
New-Item -ItemType Directory -Force -Path $WorkDir | Out-Null

function Write-Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "    OK: $msg" -ForegroundColor Green }
function Write-Fail($msg) { Write-Host "    FAIL: $msg" -ForegroundColor Red; exit 1 }

# ─── 0. Admin check ───────────────────────────────────────────────────────────
Write-Step "Checking admin rights"
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Fail "Please re-run this script from an Administrator PowerShell."
}
Write-OK "Running as administrator"

# ─── 1. Node.js ───────────────────────────────────────────────────────────────
Write-Step "Checking Node.js"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Fail "Node.js not found. Install from https://nodejs.org then re-run."
}
Write-OK "Node $(node --version)"

# ─── 2. MCP server ────────────────────────────────────────────────────────────
Write-Step "Setting up tradingview-mcp server at $McpPath"
if (-not (Test-Path $McpPath)) {
    if (Get-Command git -ErrorAction SilentlyContinue) {
        git clone $McpRepo $McpPath
    } else {
        Write-Fail "Git not found and MCP repo not present at $McpPath. Install git or manually copy the repo there."
    }
}
Push-Location $McpPath
npm install --silent
Pop-Location
Write-OK "MCP server ready"

# ─── 3. Find TradingView ──────────────────────────────────────────────────────
Write-Step "Finding TradingView installation"
$tvPkg = Get-AppxPackage -Name 'TradingView*' -ErrorAction SilentlyContinue
if (-not $tvPkg) {
    Write-Fail "TradingView not found. Install it from the Microsoft Store first, then re-run."
}
$TvSrc = $tvPkg.InstallLocation
Write-OK "Found: $TvSrc (v$($tvPkg.Version))"

# ─── 4. Copy files to writable directory ──────────────────────────────────────
Write-Step "Copying TradingView files to $TvDir"
if (Test-Path $TvDir) { Remove-Item $TvDir -Recurse -Force }
Copy-Item $TvSrc $TvDir -Recurse -Force
Write-OK "Copied $('{0:N0}' -f ((Get-ChildItem $TvDir -Recurse -File | Measure-Object Length -Sum).Sum / 1MB)) MB"

# ─── 5. Download makeappx + signtool via NuGet ───────────────────────────────
Write-Step "Downloading Windows SDK build tools (makeappx, signtool)"
$nugetExe = "$WorkDir\nuget.exe"
if (-not (Test-Path $nugetExe)) {
    Invoke-WebRequest "https://dist.nuget.org/win-x86-commandline/latest/nuget.exe" -OutFile $nugetExe
}
& $nugetExe install Microsoft.Windows.SDK.BuildTools -OutputDirectory $WorkDir -NonInteractive | Out-Null
$sdkBin = Get-ChildItem "$WorkDir\Microsoft.Windows.SDK.BuildTools*\bin" -Recurse -Directory |
          Where-Object Name -eq 'x64' | Select-Object -First 1 -ExpandProperty FullName
if (-not $sdkBin) { Write-Fail "Could not locate SDK tools after NuGet install." }
$makeappx = "$sdkBin\makeappx.exe"
$signtool  = "$sdkBin\signtool.exe"
Write-OK "makeappx: $makeappx"

# ─── 6. Extract and patch app.asar ────────────────────────────────────────────
Write-Step "Patching app.asar to enable CDP on port $CdpPort"
Push-Location $TvDir
$asarFile = "resources\app.asar"
$appDir   = "resources\app"
if (Test-Path $appDir) { Remove-Item $appDir -Recurse -Force }

# Extract asar using npx
& node -e @"
const {execSync} = require('child_process');
execSync('npx --yes asar extract resources/app.asar resources/app', {stdio:'inherit'});
"@

# Prepend CDP switch to index.js
$indexPath = "$appDir\index.js"
$patch = ";(()=>{ try { require('electron').app.commandLine.appendSwitch('remote-debugging-port','$CdpPort'); } catch(e){} })();"
$existing = Get-Content $indexPath -Raw
if (-not $existing.StartsWith($patch)) {
    Set-Content $indexPath ($patch + $existing) -NoNewline -Encoding UTF8
}

# Remove original asar so Electron uses the app directory
Remove-Item $asarFile -Force
Pop-Location
Write-OK "index.js patched, app.asar removed"

# ─── 7. Modify AppxManifest.xml ───────────────────────────────────────────────
Write-Step "Updating AppxManifest.xml"
$manifestPath  = "$TvDir\AppxManifest.xml"
$certSubject   = "CN=TradingView-CDP-Patch"
[xml]$manifest = Get-Content $manifestPath -Raw

# Change publisher to match our self-signed cert
$manifest.Package.Identity.Publisher = $certSubject

# Bump version so this package takes precedence over the Store version
$ver = [version]$manifest.Package.Identity.Version
$manifest.Package.Identity.Version = "$($ver.Major).$($ver.Minor).$($ver.Build + 1).0"
$newVersion = $manifest.Package.Identity.Version
Write-OK "Version bumped to $newVersion, Publisher set to $certSubject"

$manifest.Save($manifestPath)

# ─── 8. Create self-signed certificate ────────────────────────────────────────
Write-Step "Creating self-signed code-signing certificate"
$certPfx = "$WorkDir\tv-cdp.pfx"
$certCer = "$WorkDir\tv-cdp.cer"
$certPwd = ConvertTo-SecureString "tv-cdp-pass" -AsPlainText -Force

# Remove any old cert with same subject
Get-ChildItem Cert:\CurrentUser\My | Where-Object Subject -eq $certSubject | Remove-Item -Force

$cert = New-SelfSignedCertificate `
    -Subject $certSubject `
    -CertStoreLocation "Cert:\CurrentUser\My" `
    -Type CodeSigningCert `
    -KeyUsage DigitalSignature `
    -HashAlgorithm SHA256 `
    -NotAfter (Get-Date).AddYears(10) `
    -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3")

Export-PfxCertificate -Cert $cert -FilePath $certPfx -Password $certPwd | Out-Null
Export-Certificate    -Cert $cert -FilePath $certCer | Out-Null
Write-OK "Certificate created: $certSubject (expires $(($cert.NotAfter).ToString('yyyy-MM-dd')))"

# ─── 9. Trust the certificate ─────────────────────────────────────────────────
Write-Step "Trusting certificate in LocalMachine stores"
Import-Certificate -FilePath $certCer -CertStoreLocation "Cert:\LocalMachine\Root"         | Out-Null
Import-Certificate -FilePath $certCer -CertStoreLocation "Cert:\LocalMachine\TrustedPeople" | Out-Null
Write-OK "Certificate trusted"

# ─── 10. Pack MSIX ────────────────────────────────────────────────────────────
Write-Step "Packing MSIX"
$msixOut = "$WorkDir\TradingView-cdp.msix"
if (Test-Path $msixOut) { Remove-Item $msixOut -Force }
& $makeappx pack /d $TvDir /p $msixOut /nv /o | Out-Null
Write-OK "Packed: $msixOut"

# ─── 11. Sign MSIX ────────────────────────────────────────────────────────────
Write-Step "Signing MSIX"
& $signtool sign /fd SHA256 /a /f $certPfx /p "tv-cdp-pass" $msixOut | Out-Null
Write-OK "Signed"

# ─── 12. Uninstall Store version, install patched MSIX ────────────────────────
Write-Step "Installing patched TradingView"
$existing = Get-AppxPackage -Name 'TradingView.Desktop' -ErrorAction SilentlyContinue
if ($existing) {
    Stop-Process -Name TradingView -Force -ErrorAction SilentlyContinue
    Start-Sleep 2
    Remove-AppxPackage -Package $existing.PackageFullName -ErrorAction SilentlyContinue
    Start-Sleep 2
}
Add-AppxPackage -Path $msixOut
Write-OK "Installed TradingView v$newVersion with CDP on port $CdpPort"

# ─── 13. Configure MCP server ─────────────────────────────────────────────────
Write-Step "Configuring MCP server in ~/.claude/.mcp.json"
$mcpConfig = "$HOME\.claude\.mcp.json"
New-Item -ItemType Directory -Force -Path "$HOME\.claude" | Out-Null

$serverEntry = @{
    command = "node"
    args    = @("$McpPath\src\server.js")
}

if (Test-Path $mcpConfig) {
    $cfg = Get-Content $mcpConfig -Raw | ConvertFrom-Json
    if (-not $cfg.mcpServers) { $cfg | Add-Member -NotePropertyName mcpServers -NotePropertyValue @{} }
    $cfg.mcpServers | Add-Member -NotePropertyName tradingview -NotePropertyValue $serverEntry -Force
    $cfg | ConvertTo-Json -Depth 10 | Set-Content $mcpConfig
} else {
    @{ mcpServers = @{ tradingview = $serverEntry } } | ConvertTo-Json -Depth 10 | Set-Content $mcpConfig
}
Write-OK "MCP config written to $mcpConfig"

# ─── 14. Launch and verify ────────────────────────────────────────────────────
Write-Step "Launching TradingView and verifying CDP"
$pkg = Get-AppxPackage -Name 'TradingView.Desktop' -ErrorAction SilentlyContinue
if ($pkg) {
    $aumid = "$($pkg.PackageFamilyName)!TradingView.Desktop"
    Start-Process "shell:AppsFolder\$aumid"
    Write-Host "    Waiting for TradingView to start..." -ForegroundColor Gray
    $ready = $false
    for ($i = 0; $i -lt 20; $i++) {
        Start-Sleep 1
        try {
            $resp = Invoke-WebRequest "http://localhost:$CdpPort/json/version" -UseBasicParsing -ErrorAction SilentlyContinue
            if ($resp.StatusCode -eq 200) { $ready = $true; break }
        } catch {}
    }
    if ($ready) {
        Write-OK "CDP connected on port $CdpPort"
    } else {
        Write-Host "    TradingView launched but CDP not yet responding. Open a chart and run tv_health_check." -ForegroundColor Yellow
    }
}

# ─── Done ─────────────────────────────────────────────────────────────────────
Write-Host @"

============================================================
  Setup complete!

  TradingView now auto-enables CDP on port $CdpPort at startup.
  Developer mode is NOT required.

  To launch TradingView in the future:
    node "$McpPath\src\cli\index.js" launch

  To verify the connection:
    node "$McpPath\src\cli\index.js" status

  Restart Claude Code to activate the MCP server.
============================================================
"@ -ForegroundColor Green
