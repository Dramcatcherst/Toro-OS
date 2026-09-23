$ErrorActionPreference = 'Stop'

$output = & pwsh -NoProfile -File scripts/pc-health.ps1 -Json | Out-String
if ($LASTEXITCODE -ne 0) {
  throw "pc-health.ps1 exited with code $LASTEXITCODE"
}

$result = $output | ConvertFrom-Json
$allowed = @('HEALTHY', 'CAUTION', 'STOP_HEAVY_WORK')
if ($allowed -notcontains $result.state) {
  throw "Unexpected workstation health state: $($result.state)"
}

if ($null -eq $result.metrics.diskFreeGB -or $null -eq $result.metrics.ramAvailableGB) {
  throw 'Required workstation metrics are missing.'
}

Write-Host "Windows workstation health smoke test passed with state $($result.state)."
