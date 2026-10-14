$ErrorActionPreference = 'Stop'
$scriptPath = Join-Path $PSScriptRoot '..\scripts\pc-space-rescue.ps1'
$tokens = $null
$parseErrors = $null
[void][Management.Automation.Language.Parser]::ParseFile($scriptPath, [ref]$tokens, [ref]$parseErrors)
if ($parseErrors.Count -gt 0) { throw ($parseErrors | Out-String) }
. $scriptPath

function Assert-Toro([bool]$Condition, [string]$Message) {
    if (-not $Condition) { throw $Message }
}

$fixture = Join-Path ([IO.Path]::GetTempPath()) ('toro-rescue-test-' + [guid]::NewGuid().ToString('N'))
$temporary = Join-Path $fixture 'temporary'
$cache = Join-Path $fixture 'browser-cache'
$outside = Join-Path $fixture 'outside'
$cutoff = (Get-Date).AddDays(-7)
Assert-Toro ((@(Get-ToroCacheCandidates -Roots @() -Cutoff $cutoff)).Count -eq 0) 'Absent roots must return no candidates.'
Assert-Toro ((Invoke-ToroCacheCleanup -Candidates @() -Cutoff $cutoff).DeletedFiles -eq 0) 'Empty cleanup must delete nothing.'
try {
    [void](New-Item -ItemType Directory -Path $temporary, $cache, $outside)
    foreach ($name in @('old.tmp', 'recent.tmp', 'keep.docx', 'keep.xlsx', 'keep.pdf', 'keep.ps1', 'keep.bak')) {
        [IO.File]::WriteAllText((Join-Path $temporary $name), 'synthetic fixture only')
    }
    [IO.File]::WriteAllText((Join-Path $cache 'old-cache'), 'synthetic cache')
    [IO.File]::WriteAllText((Join-Path $outside 'outside.tmp'), 'synthetic outside fixture')
    Get-ChildItem -LiteralPath $temporary, $cache, $outside -File | ForEach-Object {
        $_.LastWriteTime = (Get-Date).AddDays(-10)
    }
    (Get-Item -LiteralPath (Join-Path $temporary 'recent.tmp')).LastWriteTime = Get-Date
    $junction = Join-Path $temporary 'linked-outside'
    [void](New-Item -ItemType Junction -Path $junction -Target $outside)
    $roots = @(
        [pscustomobject]@{ Path = $temporary; Mode = 'temporary' },
        [pscustomobject]@{ Path = $cache; Mode = 'browser_cache' },
        [pscustomobject]@{ Path = $temporary; Mode = 'temporary' }
    )
    $candidates = @(Get-ToroCacheCandidates -Roots $roots -Cutoff $cutoff)
    Assert-Toro ($candidates.Count -eq 2) 'Only old temp and cache should be candidates; roots must deduplicate.'
    Assert-Toro ((Test-Path -LiteralPath (Join-Path $temporary 'old.tmp'))) 'Discovery must not delete.'
    Assert-Toro (-not (Test-ToroPlainDirectory -Path $junction)) 'Junction root must be rejected.'
    Assert-Toro ((@(Get-ToroCacheCandidates -Roots @([pscustomobject]@{ Path = $junction; Mode = 'temporary' }) -Cutoff $cutoff)).Count -eq 0) 'Discovery must not follow linked directories.'

    # Revalidation: a candidate changed since discovery must remain.
    (Get-Item -LiteralPath (Join-Path $temporary 'old.tmp')).LastWriteTime = Get-Date
    $result = Invoke-ToroCacheCleanup -Candidates $candidates -Cutoff $cutoff
    Assert-Toro ($result.DeletedFiles -eq 1 -and $result.SkippedFiles -eq 1) 'Changed temp is skipped; disposable cache is removed.'
    Assert-Toro (Test-Path -LiteralPath (Join-Path $temporary 'old.tmp')) 'Changed file must remain.'
    foreach ($name in @('recent.tmp', 'keep.docx', 'keep.xlsx', 'keep.pdf', 'keep.ps1', 'keep.bak')) {
        Assert-Toro (Test-Path -LiteralPath (Join-Path $temporary $name)) ('Protected fixture missing: ' + $name)
    }
    Assert-Toro (Test-Path -LiteralPath (Join-Path $outside 'outside.tmp')) 'Junction target must remain.'
    $forged = [pscustomobject]@{ Root = $temporary; Path = (Join-Path $outside 'outside.tmp'); Mode = 'temporary' }
    $denied = Invoke-ToroCacheCleanup -Candidates @($forged) -Cutoff $cutoff
    Assert-Toro ($denied.DeletedFiles -eq 0 -and $denied.SkippedFiles -eq 1) 'Outside-root candidate must be refused.'

    (Get-Item -LiteralPath (Join-Path $temporary 'old.tmp')).LastWriteTime = (Get-Date).AddDays(-10)
    $locked = [IO.File]::Open((Join-Path $temporary 'old.tmp'), [IO.FileMode]::Open, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
    try {
        $lockedCandidate = [pscustomobject]@{ Root = $temporary; Path = (Join-Path $temporary 'old.tmp'); Mode = 'temporary' }
        $denied = Invoke-ToroCacheCleanup -Candidates @($lockedCandidate) -Cutoff $cutoff
        Assert-Toro ($denied.DeletedFiles -eq 0 -and $denied.SkippedFiles -eq 1) 'Locked file must be skipped.'
    } finally { $locked.Dispose() }
    Write-Output 'PASS: parse, discovery-only, age, protected documents, root dedupe, junction isolation, changed-file recheck, outside-root rejection and locked-file handling.'
} finally {
    if (Test-Path -LiteralPath (Join-Path $temporary 'linked-outside')) {
        [IO.Directory]::Delete((Join-Path $temporary 'linked-outside'))
    }
    if (Test-Path -LiteralPath $fixture) { Remove-Item -LiteralPath $fixture -Recurse -Force }
}
