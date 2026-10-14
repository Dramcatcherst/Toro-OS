[CmdletBinding()]
param([switch]$Clean, [switch]$StorageReport)

$ErrorActionPreference = 'Stop'

function Test-ToroPlainDirectory {
    param([Parameter(Mandatory)][string]$Path)
    try {
        $current = Get-Item -LiteralPath $Path -Force -ErrorAction Stop
        while ($null -ne $current) {
            if (-not ($current -is [IO.DirectoryInfo])) { return $false }
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
        [Parameter(Mandatory)][AllowEmptyCollection()][object[]]$Roots,
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
        [Parameter(Mandatory)][AllowEmptyCollection()][object[]]$Candidates,
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


function Get-ToroStorageBucket {
    param([string]$RelativeDirectory)
    if ([string]::IsNullOrWhiteSpace($RelativeDirectory)) { return '(drive root)' }
    $parts = @($RelativeDirectory.Trim('\').Split('\'))
    $count = [Math]::Min(2, $parts.Count)
    if ($parts[0] -eq 'Users') {
        $count = [Math]::Min(3, $parts.Count)
        if ($parts.Count -ge 4 -and $parts[2] -eq 'AppData') {
            $count = [Math]::Min(5, $parts.Count)
        }
    }
    return ($parts[0..($count - 1)] -join '\')
}

function Get-ToroStorageInventory {
    param(
        [Parameter(Mandatory)][string]$Root,
        [ValidateRange(1, 600)][int]$MaxSeconds = 90,
        [ValidateRange(1, 1000000)][int]$MaxEntries = 200000
    )
    $rootPath = [IO.Path]::GetFullPath($Root).TrimEnd('\') + '\'
    if (-not (Test-ToroPlainDirectory -Path $rootPath)) { throw 'Storage root must be an accessible plain directory.' }
    $pending = New-Object 'System.Collections.Generic.Queue[string]'
    $pending.Enqueue($rootPath)
    $groups = @{}
    $largest = @()
    $entries = 0
    $files = 0
    $bytes = [long]0
    $excluded = 0
    $accessErrors = 0
    $limited = $false
    $clock = [Diagnostics.Stopwatch]::StartNew()
    # Reparse points, offline files and Windows recall placeholders.
    $excludedMask = [long](0x400 -bor 0x1000 -bor 0x40000 -bor 0x400000)
    while ($pending.Count -gt 0) {
        if ($clock.Elapsed.TotalSeconds -ge $MaxSeconds -or $entries -ge $MaxEntries) {
            $limited = $true
            break
        }
        $directory = $pending.Dequeue()
        if (-not (Test-ToroPlainDirectory -Path $directory)) { $excluded++; continue }
        $relativeDirectory = $directory.Substring($rootPath.Length).Trim('\')
        $bucket = Get-ToroStorageBucket -RelativeDirectory $relativeDirectory
        try {
            # Lazy metadata enumeration. No file contents are opened.
            $info = Get-Item -LiteralPath $directory -Force -ErrorAction Stop
            foreach ($entry in $info.EnumerateFileSystemInfos()) {
                if ($clock.Elapsed.TotalSeconds -ge $MaxSeconds -or $entries -ge $MaxEntries) {
                    $limited = $true
                    break
                }
                $entries++
                try {
                    if (([long]$entry.Attributes -band $excludedMask) -ne 0) { $excluded++; continue }
                    if ($entry -is [IO.DirectoryInfo]) {
                        $pending.Enqueue($entry.FullName)
                        continue
                    }
                    if (-not ($entry -is [IO.FileInfo])) { continue }
                    $length = [long]$entry.Length
                    $files++
                    $bytes += $length
                    if (-not $groups.ContainsKey($bucket)) { $groups[$bucket] = [long]0 }
                    $groups[$bucket] += $length
                    $largest += [pscustomobject]@{ Path = $entry.FullName; Bytes = $length }
                    if ($largest.Count -gt 40) { $largest = @($largest | Sort-Object Bytes -Descending | Select-Object -First 12) }
                } catch { $accessErrors++ }
            }
        } catch { $accessErrors++ }
        if ($limited) { break }
    }
    $clock.Stop()
    $folders = @($groups.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 20 | ForEach-Object {
        [pscustomobject]@{ Folder = $_.Key; LogicalGB = [Math]::Round([long]$_.Value / 1GB, 3); Bytes = [long]$_.Value }
    })
    $topFiles = @($largest | Sort-Object Bytes -Descending | Select-Object -First 12 | ForEach-Object {
        [pscustomobject]@{ Path = $_.Path; LogicalGB = [Math]::Round($_.Bytes / 1GB, 3); Bytes = $_.Bytes }
    })
    return [pscustomobject]@{
        Mode = 'storage_inspect_only'
        Root = $rootPath
        Seconds = [Math]::Round($clock.Elapsed.TotalSeconds, 1)
        EntriesVisited = $entries
        FilesMeasured = $files
        LogicalBytesMeasured = $bytes
        LimitReached = $limited
        ExcludedLinkedOrOffline = $excluded
        AccessErrors = $accessErrors
        Partial = ($limited -or $excluded -gt 0 -or $accessErrors -gt 0)
        Folders = $folders
        LargestFiles = $topFiles
        Notice = 'Logical file lengths, not allocated disk usage or recoverable space. Incomplete scans are lower bounds for observed logical lengths; hard links may be counted more than once. No file contents read or files changed.'
    }
}

function Show-ToroStorageReport {
    if ([Environment]::OSVersion.Platform -ne [PlatformID]::Win32NT) { throw 'Run on the Windows PC being inspected.' }
    Write-Host 'TORO: read-only C: metadata scan (90-second budget).'
    $result = Get-ToroStorageInventory -Root 'C:\'
    $disk = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'"
    $result | Select-Object Mode, Seconds, FilesMeasured, LimitReached, Partial, ExcludedLinkedOrOffline, AccessErrors | Format-List
    Write-Host ('C: free now: {0} GiB' -f ([Math]::Round([long]$disk.FreeSpace / 1GB, 3)))
    Write-Host $result.Notice
    Write-Host 'Largest folder groups seen (GiB):'
    $result.Folders | Select-Object LogicalGB, Folder | Format-Table -AutoSize
    Write-Host 'Largest files seen (GiB):'
    $result.LargestFiles | Select-Object LogicalGB, Path | Format-Table -AutoSize -Wrap
}

if ($MyInvocation.InvocationName -ne '.') {
    if ($StorageReport -and $Clean) { throw 'Choose -StorageReport or -Clean, not both.' }
    if ($StorageReport) { Show-ToroStorageReport } else { Invoke-ToroPcSpaceRescue -Apply:$Clean | Format-List }
}
