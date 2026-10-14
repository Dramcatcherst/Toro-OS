$ErrorActionPreference = 'Stop'
$toroOriginalPolicy = Get-ExecutionPolicy -Scope Process
try {
    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Restricted -Force
    if ((Get-ExecutionPolicy -Scope Process) -ne 'Restricted') {
        throw 'Unable to establish restrictive parent policy in the isolated CI runner.'
    }
    powershell.exe -NoProfile -ExecutionPolicy Bypass -Command {
        $ErrorActionPreference = 'Stop'
        # The fixture test dot-sources the diagnostic and only scans synthetic data.
        & .\tests\pc-space-inventory.test.ps1
    }
    if ($LASTEXITCODE -ne 0) { throw 'Read-only inventory failed in the temporary-policy child process.' }
    if ((Get-ExecutionPolicy -Scope Process) -ne 'Restricted') {
        throw 'Child process must not change the parent execution policy.'
    }
    Write-Output 'PASS: restricted parent; temporary-policy child successfully dot-sources read-only inventory; parent policy unchanged.'
} finally {
    Set-ExecutionPolicy -Scope Process -ExecutionPolicy $toroOriginalPolicy -Force
}
