param(
  [switch]$WhatIfOnly
)

$ErrorActionPreference = 'Stop'

$root = (Resolve-Path -Path $PSScriptRoot).Path

$keep = @(
  (Join-Path $root 'README.md'),
  (Join-Path $root 'backend\vastra\requirements.txt')
)

$targets = Get-ChildItem -Path $root -Recurse -Include *.md,*.txt -File |
  Where-Object {
    $_.FullName -notmatch '\\node_modules\\' -and
    $_.FullName -notmatch '\\build\\' -and
    $_.FullName -notmatch '\\.git\\'
  } |
  Where-Object { $keep -notcontains $_.FullName } |
  Sort-Object FullName

Write-Host "Found $($targets.Count) documentation files to remove." -ForegroundColor Yellow

if ($WhatIfOnly) {
  $targets | ForEach-Object { Write-Host $_.FullName }
  exit 0
}

foreach ($file in $targets) {
  Remove-Item -LiteralPath $file.FullName -Force
}

Write-Host "Removed $($targets.Count) files." -ForegroundColor Green
