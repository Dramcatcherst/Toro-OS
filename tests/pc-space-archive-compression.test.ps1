$ErrorActionPreference = 'Stop'
$fixture = Join-Path ([IO.Path]::GetTempPath()) ('toro-archive-test-' + [guid]::NewGuid().ToString('N'))
$archive = Join-Path $fixture 'archived sessions'
$active = Join-Path $fixture 'active sessions'
try {
    [void](New-Item -ItemType Directory -Path $archive, $active)
    $first = Join-Path $archive 'synthetic history.jsonl'
    $second = Join-Path $archive 'second.jsonl'
    $sqlite = Join-Path $archive 'keep.sqlite'
    $activeFile = Join-Path $active 'keep-active.jsonl'
    $payload = '{"synthetic":"fixture only","event":"repeatable text"}' + [Environment]::NewLine
    [IO.File]::WriteAllText($first, ($payload * 60000))
    [IO.File]::WriteAllText($second, ($payload * 60000))
    [IO.File]::WriteAllText($sqlite, 'synthetic database sentinel')
    [IO.File]::WriteAllText($activeFile, 'synthetic active-session sentinel')
    $hashes = @{}
    foreach ($file in @($first, $second, $sqlite, $activeFile)) {
        $hashes[$file] = (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash
    }
    $files = @(Get-ChildItem -LiteralPath $archive -File -Filter '*.jsonl' |
        Where-Object { ([long]$_.Attributes -band (0x400 -bor 0x1 -bor 0x800)) -eq 0 } |
        Sort-Object Length -Descending | Select-Object -First 50)
    & compact.exe /C /Q $files.FullName
    if ($LASTEXITCODE -ne 0) { throw 'Native archive compression failed.' }
    foreach ($file in @($first, $second, $sqlite, $activeFile)) {
        if (-not (Test-Path -LiteralPath $file)) { throw 'Compression must preserve every source file.' }
        if ((Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash -ne $hashes[$file]) {
            throw 'Compression must preserve exact logical bytes.'
        }
    }
    foreach ($file in @($first, $second)) {
        if (((Get-Item -LiteralPath $file).Attributes -band [IO.FileAttributes]::Compressed) -eq 0) {
            throw 'Synthetic archives must be compressed.'
        }
    }
    foreach ($file in @($sqlite, $activeFile)) {
        if (((Get-Item -LiteralPath $file).Attributes -band [IO.FileAttributes]::Compressed) -ne 0) {
            throw 'Database and active sessions must remain outside scope.'
        }
    }
    & compact.exe /U /Q $files.FullName
    if ($LASTEXITCODE -ne 0) { throw 'Native decompression failed.' }
    foreach ($file in @($first, $second)) {
        if ((Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash -ne $hashes[$file]) {
            throw 'Decompression must preserve exact bytes.'
        }
    }
    Write-Output 'PASS: NTFS archive compression/decompression preserves exact SHA256 bytes, locations, database and active-session exclusions, including spaced paths.'
} finally {
    if (Test-Path -LiteralPath $fixture) { Remove-Item -LiteralPath $fixture -Recurse -Force }
}
