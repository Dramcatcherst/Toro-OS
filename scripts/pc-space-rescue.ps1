[CmdletBinding()]
param([switch]$Clean)

$ErrorActionPreference = 'Stop'

function Test-ToroPlainDirectory {
    param([Parameter(Mandatory)][string]$Path)
    try {
        $current = Get-Item -LiteralPath $Path -Force -ErrorAction Stop
        while ($null -ne $current) {
            if (-not $current.PSIsContainer) { return $false }
            if (($current.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { return $false }
            $current = $current.Parent
        }
        return $true
    } catch { return $false }
}

function Get-ToroCleanupRoots {
    $roots = @()
    $taskLocalAppData = [Environment]::GetFolderPath('LocalApplicationData')
    $roots += [pscustomobject]@{ Path = (Join-Path $taskLocalAppData 'Temp'); Mode = 'temporary' }
    $roots += [pscustomobject]@{ Path = 'C:\Windows\Temp'; Mode = 'temporary' }
    foreach ($browserBase in @(
        (Join-Path $taskLocalAppData 'Google\Chrome\User Data'),
        (Join-Path $taskLocalAppData 'Microsoft\Edge\User Data')
    )) {
        if (-not (Test-ToroPlainDirectory -Path $browserBase)) { continue }
        foreach ($profile in @(Get-ChildItem -LiteralPath $browserBase -Directory -Force -ErrorAction SilentlyContinue)) {
            if ($profile.Name -notmatch '^(Default|Profile \d+)$') { continue }
            foreach ($cacheName in @('Cache', 'Code Cache', 'GPUCache')) {
                $roots += [pscustomobject]@{ Path = (Join-Path $profile.FullName $cacheName); Mode = 'browser_cache' }
            }
        }
    }
    return @($roots | Where-Object {
        $_.Path.StartsWith('C:\', [StringComparison]::OrdinalIgnoreCase) -and
        (Test-ToroPlainDirectory -Path $_.Path)
    })
}

function Get-ToroCacheCandidates {
    param(
        [Parameter(Mandatory)][object[]]$Roots,
        [Parameter(Mandatory)][datetime]$Cutoff
    )
    $candidates = New-Object 'System.Collections.Generic.List[object]'
    $seen = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
    foreach ($root in $Roots) {
        if (@('temporary', 'browser_cache') -notcontains $root.Mode) { continue }
        if (-not (Test-ToroPlainDirectory -Path $root.Path)) { continue }
        $pending = New-Object 'System.Collections.Generic.Stack[string]'
        $pending.Push($root.Path)
        while ($pending.Count -gt 0 -and $candidates.Count -lt 10000) {
            $directory = $pending.Pop()
            foreach ($entry in @(Get-ChildItem -LiteralPath $directory -Force -ErrorAction SilentlyContinue)) {
                if (($entry.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { continue }
                if ($entry.PSIsContainer) { $pending.Push($entry.FullName); continue }
                if ($entry.LastWriteTime -ge $Cutoff) { continue }
                if (($entry.Attributes -band [IO.FileAttributes]::ReadOnly) -ne 0) { continue }
                if ($root.Mode -eq 'temporary' -and @('.tmp', '.temp', '.dmp', '.etl') -notcontains $entry.Extension.ToLowerInvariant()) { continue }
                if ($seen.Add($entry.FullName)) {
                    $candidates.Add([pscustomobject]@{
                        Path = $entry.FullName
                        Root = $root.Path
                        Mode = $root.Mode
                        Length = [long]$entry.Length
                    })
                }
                if ($candidates.Count -ge 10000) { break }
            }
        }
        if ($candidates.Count -ge 10000) { break }
    }
    return $candidates.ToArray()
}

function Invoke-ToroCacheCleanup {
    param(
        [Parameter(Mandatory)][object[]]$Candidates,
        [Parameter(Mandatory)][datetime]$Cutoff
    )
    $deletedFiles = 0
    $deletedBytes = [long]0
    $skippedFiles = 0
    foreach ($candidate in $Candidates) {
        try {
            $rootPath = [IO.Path]::GetFullPath($candidate.Root).TrimEnd('\') + '\'
            $filePath = [IO.Path]::GetFullPath($candidate.Path)
            if (-not $filePath.StartsWith($rootPath, [StringComparison]::OrdinalIgnoreCase)) { throw 'Outside approved root.' }
            if (@('temporary', 'browser_cache') -notcontains $candidate.Mode) { throw 'Unapproved mode.' }
            if (-not (Test-ToroPlainDirectory -Path ([IO.Path]::GetDirectoryName($filePath)))) { throw 'Linked or inaccessible directory.' }
            $file = Get-Item -LiteralPath $filePath -Force -ErrorAction Stop
            if ($file.PSIsContainer -or (($file.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0)) { throw 'Not a plain file.' }
            if (($file.Attributes -band [IO.FileAttributes]::ReadOnly) -ne 0 -or $file.LastWriteTime -ge $Cutoff) { throw 'File changed or protected.' }
            if ($candidate.Mode -eq 'temporary' -and @('.tmp', '.temp', '.dmp', '.etl') -notcontains $file.Extension.ToLowerInvariant()) { throw 'Not approved temporary type.' }
            $length = [long]$file.Length
            Remove-Item -LiteralPath $filePath -Force -ErrorAction Stop
            $deletedFiles++
            $deletedBytes += $length
        } catch { $skippedFiles++ }
    }
    return [pscustomobject]@{ DeletedFiles = $deletedFiles; DeletedBytes = $deletedBytes; SkippedFiles = $skippedFiles }
}

function Invoke-ToroPcSpaceRescue {
    param([switch]$Apply)
    if ([Environment]::OSVersion.Platform -ne [PlatformID]::Win32NT) { throw 'This tool must run on the Windows PC whose C: drive needs cleaning.' }
    $before = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'"
    if ($null -eq $before) { throw 'C: drive is unavailable.' }
    $cutoff = (Get-Date).AddDays(-7)
    $candidates = @(Get-ToroCacheCandidates -Roots @(Get-ToroCleanupRoots) -Cutoff $cutoff)
    $candidateBytes = [long]0
    foreach ($candidate in $candidates) { $candidateBytes += $candidate.Length }
    $action = [pscustomobject]@{ DeletedFiles = 0; DeletedBytes = [long]0; SkippedFiles = 0 }
    if ($Apply -and $candidates.Count -gt 0) { $action = Invoke-ToroCacheCleanup -Candidates $candidates -Cutoff $cutoff }
    $after = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'"
    return [pscustomobject]@{
        Mode = $(if ($Apply) { 'clean' } else { 'inspect_only' })
        CandidateFiles = $candidates.Count
        CandidateGB = [Math]::Round($candidateBytes / 1GB, 3)
        DeletedFiles = $action.DeletedFiles
        DeletedGB = [Math]::Round($action.DeletedBytes / 1GB, 3)
        SkippedFiles = $action.SkippedFiles
        FreeBeforeGB = [Math]::Round([long]$before.FreeSpace / 1GB, 3)
        FreeAfterGB = [Math]::Round([long]$after.FreeSpace / 1GB, 3)
        ObservedFreeDeltaGB = [Math]::Round(([long]$after.FreeSpace - [long]$before.FreeSpace) / 1GB, 3)
        Limit = 'At most 10000 files, older than 7 days; rerun inspect mode to assess remaining candidates.'
    }
}

if ($MyInvocation.InvocationName -ne '.') {
    Invoke-ToroPcSpaceRescue -Apply:$Clean | Format-List
}
