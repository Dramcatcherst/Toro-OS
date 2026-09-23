param(
  [switch]$Json,
  [switch]$ScanGeneratedFolders
)

$ErrorActionPreference = 'Stop'

function Round-2([double]$Value) {
  return [Math]::Round($Value, 2)
}

function Get-FolderSizeGB([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) { return 0 }
  $sum = (Get-ChildItem -LiteralPath $Path -File -Recurse -Force -ErrorAction SilentlyContinue |
    Measure-Object -Property Length -Sum).Sum
  if ($null -eq $sum) { return 0 }
  return Round-2 ($sum / 1GB)
}

try {
  $repoRoot = Split-Path -Parent $PSScriptRoot
  $classifier = Join-Path $PSScriptRoot 'pc-health-classifier.mjs'

  $node = Get-Command node -ErrorAction Stop
  if (-not (Test-Path -LiteralPath $classifier)) {
    throw 'pc-health-classifier.mjs is missing.'
  }

  $systemDrive = $env:SystemDrive
  if ([string]::IsNullOrWhiteSpace($systemDrive)) { $systemDrive = 'C:' }

  $disk = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='$systemDrive'"
  $os = Get-CimInstance Win32_OperatingSystem
  $processors = @(Get-CimInstance Win32_Processor)

  if ($null -eq $disk -or $null -eq $os -or $processors.Count -eq 0) {
    throw 'Unable to read required Windows system metrics.'
  }

  $diskFreeGB = Round-2 ($disk.FreeSpace / 1GB)
  $ramAvailableGB = Round-2 ($os.FreePhysicalMemory / 1MB)
  $ramTotalGB = Round-2 ($os.TotalVisibleMemorySize / 1MB)
  $ramAvailablePercent = if ($os.TotalVisibleMemorySize -gt 0) {
    Round-2 (($os.FreePhysicalMemory / $os.TotalVisibleMemorySize) * 100)
  } else { 0 }

  $cpuValues = @($processors | ForEach-Object { [double]$_.LoadPercentage })
  $cpuPercent = if ($cpuValues.Count -gt 0) {
    Round-2 (($cpuValues | Measure-Object -Average).Average)
  } else { 0 }

  $heavyNames = @('node', 'python', 'python3', 'chrome', 'msedge', 'firefox', 'playwright', 'Code')
  $heavyProcessCount = @(
    Get-Process -ErrorAction SilentlyContinue |
      Where-Object {
        $heavyNames -contains $_.ProcessName -and $_.WorkingSet64 -ge 300MB
      }
  ).Count

  $largestGeneratedFolderGB = 0
  $largestGeneratedFolder = $null
  if ($ScanGeneratedFolders) {
    $generatedCandidates = @('node_modules', '.next', 'dist', 'dist-dreamcatcher', 'test-results', 'playwright-report', 'coverage')
    foreach ($candidate in $generatedCandidates) {
      $candidatePath = Join-Path $repoRoot $candidate
      $sizeGB = Get-FolderSizeGB $candidatePath
      if ($sizeGB -gt $largestGeneratedFolderGB) {
        $largestGeneratedFolderGB = $sizeGB
        $largestGeneratedFolder = $candidate
      }
    }
  }

  $metrics = [ordered]@{
    diskFreeGB = $diskFreeGB
    ramAvailableGB = $ramAvailableGB
    ramAvailablePercent = $ramAvailablePercent
    cpuPercent = $cpuPercent
    heavyProcessCount = $heavyProcessCount
    largestGeneratedFolderGB = $largestGeneratedFolderGB
  }

  $metricsJson = $metrics | ConvertTo-Json -Compress
  $classifierOutput = $metricsJson | & $node.Source $classifier --classify-stdin | Out-String
  if ($LASTEXITCODE -ne 0) {
    throw "Health classifier exited with code $LASTEXITCODE."
  }

  $result = $classifierOutput | ConvertFrom-Json
  $output = [ordered]@{
    state = $result.state
    reasons = @($result.reasons)
    recommendation = $result.recommendation
    metrics = [ordered]@{
      diskFreeGB = $diskFreeGB
      ramAvailableGB = $ramAvailableGB
      ramTotalGB = $ramTotalGB
      ramAvailablePercent = $ramAvailablePercent
      cpuPercent = $cpuPercent
      heavyProcessCount = $heavyProcessCount
      largestGeneratedFolderGB = $largestGeneratedFolderGB
      largestGeneratedFolder = $largestGeneratedFolder
      generatedFolderScanEnabled = [bool]$ScanGeneratedFolders
    }
  }

  if ($Json) {
    $output | ConvertTo-Json -Depth 6 -Compress
  } else {
    Write-Host "TORO PC Health: $($output.state)"
    Write-Host "Disk free: $diskFreeGB GB"
    Write-Host "RAM available: $ramAvailableGB / $ramTotalGB GB ($ramAvailablePercent%)"
    Write-Host "CPU: $cpuPercent%"
    Write-Host "Heavy dev/browser processes: $heavyProcessCount"
    if ($ScanGeneratedFolders) {
      Write-Host "Largest generated folder: $largestGeneratedFolder ($largestGeneratedFolderGB GB)"
    }
    foreach ($reason in @($output.reasons)) { Write-Host "- $reason" }
    Write-Host $output.recommendation
  }

  # Health state is advisory. Non-zero is reserved for diagnostic/script failure.
  exit 0
} catch {
  if ($Json) {
    [ordered]@{
      state = 'DIAGNOSTIC_ERROR'
      reasons = @('Unable to collect workstation health metrics safely.')
      recommendation = 'Do not start heavy local work until the diagnostic error is resolved.'
      metrics = $null
    } | ConvertTo-Json -Depth 4 -Compress
  } else {
    Write-Error 'Unable to collect workstation health metrics safely.'
  }
  exit 1
}
