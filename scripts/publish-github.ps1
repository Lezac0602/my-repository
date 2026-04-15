param(
  [Parameter(Position = 0)]
  [string]$Message
)

$ErrorActionPreference = "Stop"

function Write-Step {
  param([string]$Text)
  Write-Host ""
  Write-Host "==> $Text" -ForegroundColor Cyan
}

function Resolve-CommitMessage {
  param([string]$ExplicitMessage)

  if ($ExplicitMessage -and $ExplicitMessage.Trim()) {
    return $ExplicitMessage.Trim()
  }

  if ($env:npm_config_message -and $env:npm_config_message.Trim()) {
    return $env:npm_config_message.Trim()
  }

  return "Publish campus site $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

function Require-Command {
  param([string]$Name)

  $command = Get-Command $Name -ErrorAction SilentlyContinue
  if (-not $command) {
    throw "Required command '$Name' was not found in PATH."
  }
}

Require-Command git
Require-Command npm.cmd

$repoCheck = git rev-parse --is-inside-work-tree 2>$null
if ($LASTEXITCODE -ne 0 -or $repoCheck.Trim() -ne "true") {
  throw "This script must be run inside a git repository."
}

$branch = (git branch --show-current).Trim()
if ($branch -ne "main") {
  throw "The current branch is '$branch'. GitHub Pages deploys from pushes to 'main', so switch to main before publishing."
}

$remoteUrl = (git remote get-url origin).Trim()
if (-not $remoteUrl) {
  throw "Remote 'origin' is not configured."
}

if ($remoteUrl -match 'github\.com[:/](?<owner>[^/]+)/(?<repo>[^/.]+)(\.git)?$') {
  $owner = $Matches.owner
  $repo = $Matches.repo
  $siteUrl = "https://$($owner.ToLower()).github.io/$repo/"
} else {
  throw "Could not parse the GitHub repository from remote URL: $remoteUrl"
}

$commitMessage = Resolve-CommitMessage -ExplicitMessage $Message

Write-Step "Building production site"
& npm.cmd run build
if ($LASTEXITCODE -ne 0) {
  throw "Build failed, so nothing was published."
}

Write-Step "Staging local changes"
git add -A

$hasChanges = $true
git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
  $hasChanges = $false
}

if ($hasChanges) {
  Write-Step "Creating commit"
  git commit -m $commitMessage
  if ($LASTEXITCODE -ne 0) {
    throw "Commit failed."
  }
} else {
  Write-Step "No local file changes to commit"
  Write-Host "Working tree is already in sync. The latest commit will remain the deployed version." -ForegroundColor Yellow
}

Write-Step "Pushing to GitHub"
git push origin main
if ($LASTEXITCODE -ne 0) {
  throw "Push failed."
}

Write-Step "Publish request sent"
Write-Host "GitHub Pages will rebuild from the latest commit on 'main'." -ForegroundColor Green
Write-Host "Site URL: $siteUrl" -ForegroundColor Green
Write-Host "Workflow URL: https://github.com/$owner/$repo/actions/workflows/campus-pages.yml" -ForegroundColor Green
