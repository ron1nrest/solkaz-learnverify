# Publish to GitHub — run from repo root: .\scripts\publish-github.ps1

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

$RepoName = "solkaz-learnverify"
$Description = "Open-source Devnet skill verification CLI for Solana education in Kazakhstan"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Host "Install GitHub CLI: winget install GitHub.cli" -ForegroundColor Yellow
  exit 1
}

gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Sign in to GitHub (browser):" -ForegroundColor Cyan
  gh auth login -h github.com -p https -w
}

if (git remote get-url origin 2>$null) {
  git push -u origin main
  gh repo view --web
  exit $LASTEXITCODE
}

gh repo create $RepoName --public --source=. --remote=origin --push --description $Description
Write-Host "https://github.com/$(gh api user -q .login)/$RepoName"
