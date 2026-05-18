# Publish to GitHub — run from repo root: .\scripts\publish-github.ps1

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

$RepoName = "solkaz-learnverify"
$Description = "Open-source Devnet skill verification CLI for Solana education in Kazakhstan"

function Resolve-Gh {
  $cmd = Get-Command gh -ErrorAction SilentlyContinue
  if ($cmd) {
    return $cmd.Source
  }
  $candidates = @(
    "${env:ProgramFiles}\GitHub CLI\gh.exe",
    "${env:ProgramFiles(x86)}\GitHub CLI\gh.exe",
    "$env:LOCALAPPDATA\Programs\GitHub CLI\gh.exe"
  )
  foreach ($path in $candidates) {
    if (Test-Path $path) {
      return $path
    }
  }
  return $null
}

$ghExe = Resolve-Gh
if (-not $ghExe) {
  Write-Host "GitHub CLI not found. Install:" -ForegroundColor Yellow
  Write-Host "  winget install GitHub.cli" -ForegroundColor Yellow
  Write-Host "Then close and reopen PowerShell." -ForegroundColor Yellow
  exit 1
}

# Add GitHub CLI to PATH for this session
$ghDir = Split-Path $ghExe -Parent
if ($env:Path -notlike "*$ghDir*") {
  $env:Path = "$ghDir;$env:Path"
}

Write-Host "Using: $ghExe" -ForegroundColor DarkGray

& $ghExe auth status 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Sign in to GitHub (browser will open):" -ForegroundColor Cyan
  & $ghExe auth login -h github.com -p https -w
}

$hasOrigin = $false
$prevEap = $ErrorActionPreference
$ErrorActionPreference = "SilentlyContinue"
$null = git remote get-url origin 2>&1
if ($LASTEXITCODE -eq 0) {
  $hasOrigin = $true
}
$ErrorActionPreference = $prevEap

if ($hasOrigin) {
  Write-Host "Pushing to origin..." -ForegroundColor Green
  git push -u origin main
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
  & $ghExe repo view --web
  exit 0
}

Write-Host "Creating repo $RepoName and pushing..." -ForegroundColor Green
& $ghExe repo create $RepoName --public --source=. --remote=origin --push --description $Description
$login = & $ghExe api user -q .login
Write-Host ""
Write-Host "Done: https://github.com/$login/$RepoName" -ForegroundColor Green
