$ErrorActionPreference = 'Stop'
$scriptPath = Join-Path $PSScriptRoot '..\scripts\pc-space-rescue.ps1'
. $scriptPath
function Assert-Storage([bool]$Condition, [string]$Message) { if (-not $Condition) { throw $Message } }
$fixture = Join-Path ([IO.Path]::GetTempPath()) ('toro-inventory-test-' + [guid]::NewGuid().ToString('N'))
$root = Join-Path $fixture 'scan'
$outside = Join-Path $fixture 'outside'
$documents = Join-Path $root 'Users\synthetic\Documents'
$app = Join-Path $root 'Users\synthetic\AppData\Local\Vendor'
$junction = Join-Path $root 'linked'
$locked = $null
try {
    [void](New-Item -ItemType Directory -Path $documents, $app, $outside)
    $rootFile = Join-Path $root 'root.bin'
    $document = Join-Path $documents 'keep.txt'
    $appFile = Join-Path $app 'locked.bin'
    [IO.File]::WriteAllBytes($rootFile, (New-Object byte[] 11))
    [IO.File]::WriteAllBytes($document, (New-Object byte[] 7))
    [IO.File]::WriteAllBytes($appFile, (New-Object byte[] 13))
    [IO.File]::WriteAllBytes((Join-Path $outside 'outside.bin'), (New-Object byte[] 1024))
    $offline = Join-Path $root 'offline.bin'
    [IO.File]::WriteAllBytes($offline, (New-Object byte[] 2048))
    [IO.File]::SetAttributes($offline, [IO.FileAttributes]::Offline)
    [void](New-Item -ItemType Junction -Path $junction -Target $outside)
    $beforeWrite = (Get-Item -LiteralPath $document).LastWriteTimeUtc
    # A deny-read/write sharing lock proves the inventory does not open file contents.
    $locked = [IO.File]::Open($appFile, [IO.FileMode]::Open, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
    $result = Get-ToroStorageInventory -Root $root
    Assert-Storage ($result.Mode -eq 'storage_inspect_only') 'Inventory must stay read-only.'
    Assert-Storage ($result.FilesMeasured -eq 3 -and $result.LogicalBytesMeasured -eq 31) 'Known sizes must sum exactly; linked and offline files must be excluded.'
    Assert-Storage ($result.ExcludedLinkedOrOffline -eq 2 -and $result.Partial) 'Excluded items must make incomplete coverage visible.'
    Assert-Storage (-not $result.LimitReached -and $result.AccessErrors -eq 0) 'Small accessible fixture should finish without budget or access failures.'
    Assert-Storage ($result.LargestFiles[0].Path -eq $appFile -and $result.LargestFiles[0].Bytes -eq 13) 'Locked-file metadata should be measurable without opening its contents.'
    Assert-Storage ((@($result.Folders | Where-Object Folder -eq 'Users\synthetic\AppData\Local\Vendor')).Count -eq 1) 'AppData vendor must have a useful bucket.'
    Assert-Storage ((@($result.Folders | Where-Object Folder -eq 'Users\synthetic\Documents')).Count -eq 1) 'User documents must have a separate bucket.'
    Assert-Storage ((Get-Item -LiteralPath $document).LastWriteTimeUtc -eq $beforeWrite) 'Inspection must not change document timestamps.'
    Assert-Storage ((Get-Item -LiteralPath $document).Length -eq 7 -and (Test-Path -LiteralPath $rootFile)) 'Inspection must preserve originals.'
    $limited = Get-ToroStorageInventory -Root $root -MaxEntries 1
    Assert-Storage ($limited.LimitReached -and $limited.Partial -and $limited.EntriesVisited -eq 1) 'Entry budget must stop enumeration and report partial coverage.'
    $rejected = $false
    try { Get-ToroStorageInventory -Root $junction | Out-Null } catch { $rejected = $true }
    Assert-Storage $rejected 'A linked scan root must be rejected.'
    Assert-Storage ((Get-ToroStorageBucket -RelativeDirectory '') -eq '(drive root)') 'Root files must be grouped.'
    Write-Output 'PASS: read-only storage inventory; exact sizes, locked metadata, document preservation, junction/offline isolation, entry budget, partial reporting and useful buckets.'
} finally {
    if ($null -ne $locked) { $locked.Dispose() }
    if (Test-Path -LiteralPath $junction) { [IO.Directory]::Delete($junction) }
    if (Test-Path -LiteralPath $fixture) { Remove-Item -LiteralPath $fixture -Recurse -Force }
}
