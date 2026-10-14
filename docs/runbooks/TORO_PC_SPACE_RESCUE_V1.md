# TORO PC space rescue v1

Scope: owner's Windows PC, C: pressure. Subordinate to the single General Plan and existing pc-health diagnostics. The chat has no connected local Windows executor. Local execution evidence is supplied by the owner; it is not direct observation through a PC connector.

## Local use

Run the prepared script in Windows PowerShell. Without arguments it only inspects; -Clean applies bounded deletion. Administrator rights are not required; protected/in-use files are skipped. Save the script on D: when C: is full.

The executable code is scripts/pc-space-rescue.ps1. It selects fixed C: roots: Windows/user Temp and Cache, Code Cache, GPUCache under Default/Profile N for Chrome/Edge. Temporary files must be .tmp/.temp/.dmp/.etl; browser-cache files are disposable cache content. All must be older than seven days. It avoids reparse points and rechecks paths, age/type/protection before deletion. It deletes at most 10,000 files per run.

Documents, Downloads, Desktop, Recycle Bin, Dropbox, profile databases, credentials, installed applications and project build folders are not selected. Do not move installed apps or Windows directories to the exFAT D: drive. No file relocation or cloud sync change occurs.

Result: CandidateGB, DeletedGB, SkippedFiles and FreeBeforeGB/FreeAfterGB. ObservedFreeDeltaGB may differ from DeletedGB because other processes and filesystem allocation change concurrently. These are observations after local execution, not promised recovery. If the recovered space is insufficient, inspect storage sizes and verify a separate copy of an identified large personal file to D: before removing its source.

## Validation and recovery

Synthetic CI in Windows PowerShell 5.1 and PowerShell 7 covers non-mutating discovery, empty inputs, preservation of documents/recent files, repeated roots, junction isolation, changed-file revalidation, outside-root rejection and locked files. No tests run cleanup against the owner computer.

An initial Windows 5.1 failure detected reliance on PowerShell extended metadata for DirectoryInfo ancestors. Fixed to inspect DirectoryInfo directly; later safety and repository CI passed before the final empty-input refinement. Latest-code CI must pass before offering execution.

No deleted-temp-file rollback is provided. Browser caches regenerate from provider data. Existing user documents remain in place. Revert this branch to remove the tool; no registry, permissions, persistence, scheduler or deployment flags were changed.

## Owner-reported execution, 13 October 2026

The owner supplied the console result of -Clean using code commit c44cf3b255598a0ec2fde3e1fb56408316506d74: 1,290 candidates (0.28 GB), 1,287 files deleted (0.28 GB), 3 skipped, free space before 1.64 GB and after 1.925 GB, observed delta 0.286 GB. These are the script's rounded GiB-based outputs. The initial 1.64 GB is not recovery attributable to this script. Additional space recovery has not been observed.

The accompanying Disk Cleanup screenshot shows 164 MB selected, at most 169 MB offered. The user may apply the selected disposable categories using the Windows interface. A screenshot of selected items is not proof of execution.

## Next step: storage diagnosis

Run the same script with -StorageReport to collect a read-only inventory. This mode is mutually exclusive with -Clean. It performs lazy metadata enumeration on C:, with a 90-second traversal budget and 200,000-entry cap, groups user directories and AppData by vendor, and prints the largest groups and files. It needs no Node.js installation or repository clone.

The scan does not open file contents, delete or copy files, upload results, change registry or cloud sync, or sign out accounts. Linked/reparse and offline/recall placeholders are excluded; inaccessible directories are counted. Partial and LimitReached must be retained with the output. Time is checked between entries; a blocking filesystem call can exceed the traversal budget.

Sizes are logical file lengths, not allocated disk usage or promised recoverable space. Compression, sparse files, hard links and exclusions make totals unsuitable for reconciliation to the disk's used-space counter. A partial scan gives only observed logical lengths. Do not delete Windows, pagefile, hibernation files, app databases, Dropbox content or credentials based on their presence in this list.

Actual paths and file names are local/private evidence; do not commit the diagnostic output to this public repository. Select a specific next action after observing sizes: Windows-managed cleanup for system content; ordinary relocation only for identified personal files after verified copy to D:. The exFAT drive is suitable for ordinary supported files, not moving installed apps or creating NTFS junctions. No automatic relocation or source deletion is part of this tool.

## Owner-reported inventory and Windows-managed next action, 13 October 2026

The owner supplied a -StorageReport run from code cd14593c31a72be2ab1c46fab066a8fb8902d1ed. Duration 90 seconds, 68,302 files measured, LimitReached=True, Partial=True, 40 linked/offline exclusions and 52 access errors. Reported free space now 2.133 GiB. Do not attribute the difference from 1.925 GiB to the read-only scan or assume Disk Cleanup was applied.

Reported logical file lengths: pagefile.sys 29.475 GiB, hiberfil.sys 12.453 GiB, Codex thread-history SQLite 4.04 GiB. Preserve the Codex database and its companion files; no deletion, vacuum or relocation of the active history database is authorized by its size alone. Windows Installer and WinSxS figures are not safe deletion candidates; hard links and partial traversal also prevent summing the report to disk-used space. User-specific paths/names are omitted from this public record.

A concrete next action is the Microsoft-documented reduced hibernation-file mode, using powercfg rather than deleting hiberfil.sys. It retains fast-startup support but removes Hibernate and hybrid sleep. Reduced mode normally uses 20% of physical memory versus the default full mode's 40%; recovery for this PC is unverified until readback. No RAM amount or current hibernation configuration is inferred as a confirmed fact from the file length.

Open Windows PowerShell as administrator and run the following block. It checks elevation, resets custom hibernation sizing to OS default, requests reduced mode, checks each native exit code, measures disk free space, and reads RAM/pagefile configuration and available sleep states. It does not change pagefile configuration or restart the PC. Windows can reject an operation; no full-disable fallback runs.

```powershell
& {
    $ErrorActionPreference = 'Stop'
    $toroPrincipal = [Security.Principal.WindowsPrincipal]::new(
        [Security.Principal.WindowsIdentity]::GetCurrent()
    )
    if (-not $toroPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        throw 'Abre PowerShell como administrador y vuelve a ejecutar este bloque.'
    }
    $toroAntes = [long](Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'").FreeSpace

    powercfg.exe /hibernate /size 0
    if ($LASTEXITCODE -ne 0) { throw 'Windows no pudo restablecer el tamano de hibernacion.' }
    powercfg.exe /hibernate /type reduced
    if ($LASTEXITCODE -ne 0) { throw 'Windows no pudo aplicar el modo reducido.' }

    $toroDespues = [long](Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'").FreeSpace
    [pscustomobject]@{
        LibreAntesGiB = [Math]::Round($toroAntes / 1GB, 3)
        LibreAhoraGiB = [Math]::Round($toroDespues / 1GB, 3)
        CambioObservadoGiB = [Math]::Round(($toroDespues - $toroAntes) / 1GB, 3)
    } | Format-List

    $toroEquipo = Get-CimInstance Win32_ComputerSystem
    [pscustomobject]@{
        RAMGiB = [Math]::Round($toroEquipo.TotalPhysicalMemory / 1GB, 2)
        PaginacionAutomatica = $toroEquipo.AutomaticManagedPagefile
    } | Format-List
    Get-CimInstance Win32_PageFileUsage |
        Select-Object Name, AllocatedBaseSize, CurrentUsage, PeakUsage |
        Format-Table -AutoSize
    powercfg.exe /availablesleepstates
}
```

Functional recovery: in elevated PowerShell, run `powercfg.exe /hibernate /type full` to restore full hibernation-file support at Windows-managed default size, provided sufficient space remains. This is not an exact restoration of an unknown earlier custom size. Pagefile decisions require RAM, usage/commit and crash-dump requirements; never delete it or shrink it arbitrarily, and do not relocate it to the external exFAT D: drive.

Microsoft authority:
- https://learn.microsoft.com/en-us/windows-hardware/design/device-experiences/powercfg-command-line-options
- https://learn.microsoft.com/en-us/windows/win32/power/system-power-states
- https://learn.microsoft.com/en-us/troubleshoot/windows-client/performance/how-to-determine-the-appropriate-page-file-size-for-64-bit-versions-of-windows

CURRENT: owner supplied successful reduced-mode powercfg output; this is owner-run evidence, not a connected-PC execution claim. NEXT: preserve automatic paging and run the targeted inventory below. The cleanup/diagnostic executable is unchanged; the Windows-managed action and targeted wrapper remain under the same General Plan checkpoint.

## Reduced-mode execution receipt, owner supplied 13 October 2026

Powercfg reported hibernation-file sizes of 13,370,806,272 bytes and 6,685,401,088 bytes: approximately 12.453 and 6.226 GiB, nominal file-length reduction 6.226 GiB. Owner readback: free space before 8.944 GiB, after 15.199 GiB, observed delta 6.255 GiB. The observed delta includes concurrent disk activity; do not equate it exactly to the file-size reduction. The increase between the earlier 2.133 GiB inventory and the 8.944 GiB pre-action measurement has no established cause here.

Reported RAM is 31.13 GiB and AutomaticManagedPagefile=True. Pagefile metrics: 27,625 MiB allocated (26.978 GiB), 5,593 MiB currently used (5.462 GiB), peak 7,556 MiB (7.379 GiB). These are one session's metrics; they do not establish peak committed-memory needs or justify a fixed smaller paging file. Preserve automatic management.

Available-state readback confirms S0 low-power idle with connected networking and fast startup. Hibernate is unavailable because of the file type. S3 is unavailable in firmware; hybrid sleep was also unavailable for hardware/hypervisor reasons, so do not attribute every unavailable sleep state to this action.

Remaining recovery: free space is materially improved, but the general C: scan was partial. Reuse Get-ToroStorageInventory for the current user's profile and LocalApplicationData, each with a 45-second traversal budget. The two inventories overlap: do not sum their sizes. Output remains private/local; files are not deleted, moved or uploaded. Metadata lengths are not recoverable-space promises. The wrapper downloads exact previously CI-tested executable commit cd14593c31a72be2ab1c46fab066a8fb8902d1ed and dot-sources it without invoking its main cleanup entrypoint.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command {
    $ErrorActionPreference = 'Stop'
    $toroLectura = "D:\TORO-carpetas-$([guid]::NewGuid().ToString('N')).ps1"
    $toroDescarga = @{
        Uri = 'https://raw.githubusercontent.com/Dramcatcherst/Toro-OS/cd14593c31a72be2ab1c46fab066a8fb8902d1ed/scripts/pc-space-rescue.ps1'
        OutFile = $toroLectura
        UseBasicParsing = $true
        ErrorAction = 'Stop'
    }
    Invoke-WebRequest @toroDescarga
    . $toroLectura

    $toroZonas = @(
        [Environment]::GetFolderPath('UserProfile'),
        [Environment]::GetFolderPath('LocalApplicationData')
    )
    foreach ($toroZona in $toroZonas) {
        if (-not $toroZona.StartsWith('C:\', [StringComparison]::OrdinalIgnoreCase)) { continue }
        if (-not (Test-ToroPlainDirectory -Path $toroZona)) {
            Write-Warning ('Carpeta enlazada o inaccesible: ' + $toroZona)
            continue
        }
        Write-Host ('Revisando: ' + $toroZona)
        $toroResultado = Get-ToroStorageInventory -Root $toroZona -MaxSeconds 45
        $toroResultado |
            Select-Object Seconds, FilesMeasured, Partial, LimitReached, ExcludedLinkedOrOffline, AccessErrors |
            Format-List
        Write-Host $toroResultado.Notice
        $toroResultado.Folders |
            Select-Object LogicalGB, Folder | Format-Table -AutoSize -Wrap
        $toroResultado.LargestFiles |
            Select-Object LogicalGB, Path | Format-Table -AutoSize -Wrap
    }
}
```

Preserve the active Codex history database, Windows component and Installer files, provider credentials, application databases and Dropbox originals. Select any subsequent cleanup or personal-file copy after targeted sizes and identity are known. No further deletion, paging change, automatic reboot, application relocation, cloud-sync adjustment or production deployment has been performed from this session.

## Execution-policy correction, 13 October 2026

The owner reported PSSecurityException/UnauthorizedAccess when the targeted wrapper attempted dot-sourcing in the existing Windows PowerShell session. The download completed, but the inventory did not start; no folder measurements or additional recovery are established by that attempt. The wrapper omitted the per-process execution setting used successfully in the earlier -File launchers.

The corrected wrapper starts a separate powershell.exe process with -NoProfile -ExecutionPolicy Bypass -Command and performs dot-sourcing inside that child. It does not modify registry-backed execution policy, current-user/local-machine policy, or the parent session. No permanent Set-ExecutionPolicy change or Unblock-File is required by the procedure. The diagnostic executable still uses the exact previously tested cd14593c source.

Regression: tests/pc-space-policy.test.ps1 in Windows CI establishes Restricted in the isolated runner's parent process, runs the existing synthetic read-only inventory fixture in a child using the corrected launch form, verifies its native exit code and verifies that the parent's policy stays Restricted, then restores the runner's original process policy. This is fixture validation, not owner-PC evidence.

Authority: https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_powershell_exe?view=powershell-5.1
CURRENT: owner supplied targeted inventory output; execution-policy launch issue is resolved for this attempt. Latest supplied free-space measurement remains 15.199 GiB from the prior action; the new folder output contains no disk-free readback.


## Targeted inventory receipt and next package/WSL step, 13 October 2026

Owner supplied readable excerpts after the full pasted-text attachment could not be downloaded in this chat (execution workspace unavailable). Do not claim the attachment was opened or that its unshown content was analyzed. The LocalApplicationData scan measured 56,214 files in 45 seconds; Partial=True, LimitReached=True, 5,908 linked/offline exclusions, AccessErrors=0. Only a tail of the UserProfile largest-file list is available; its scan-wide coverage metrics and full folder totals are unknown.

Observed logical sizes: WSL ext4.vhdx 30.932 GiB; pnpm store 1.586 GiB; OneDrive group 1.238 GiB; Codex executable group 0.409 GiB. UserProfile excerpt includes a project video asset 1.233 GiB, substantial session/archive JSONL history, and a Codex runtime installation archive 0.414 GiB. Preserve project assets, active/history databases, sessions and installed executables. File lengths are not allocated or recoverable disk usage; no 30.932 GiB recovery promise.

The next bounded cleanup uses the installed native pnpm.cmd/pnpm.exe launcher and pnpm store prune, which removes unreferenced store packages using the package manager's own accounting. It prints the version/active store, checks its exit status, observes C: disk-free delta and never falls back to raw recursive deletion or installing a missing manager. It acts on the active configured store; its path may differ from the partial inventory. Referenced projects remain; future installs may re-download pruned packages. A running store server or other manager refusal is preserved as a failure/skip, not overridden.

The same block reads WSL version/list state and the registry binding for the observed VHD directory. It calls df only if the matched distribution is listed as running; it does not intentionally start a stopped distribution, terminate any distribution, unregister it, compact or move its disk. A concurrently changing WSL state can change between listing and invoking df. An absent registry binding is a mismatch to resolve, not evidence that the VHD is disposable.

```powershell
& {
    $ErrorActionPreference = 'Stop'
    $toroAntes = [long](Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'").FreeSpace
    $toroPnpm = Get-Command pnpm.cmd, pnpm.exe -CommandType Application -ErrorAction SilentlyContinue |
        Select-Object -First 1
    if ($null -ne $toroPnpm) {
        try {
            & $toroPnpm.Source --version
            & $toroPnpm.Source store path
            & $toroPnpm.Source store prune
            if ($LASTEXITCODE -ne 0) { Write-Warning 'pnpm no completo la limpieza; no se forzara borrado.' }
        } catch { Write-Warning $_.Exception.Message }
    } else {
        Write-Host 'pnpm no encontrado; limpieza de paquetes omitida.'
    }
    $toroDespues = [long](Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'").FreeSpace
    [pscustomobject]@{
        LibreAhoraGiB = [Math]::Round($toroDespues / 1GB, 3)
        CambioObservadoGiB = [Math]::Round(($toroDespues - $toroAntes) / 1GB, 3)
    } | Format-List

    wsl.exe --version
    wsl.exe --list --verbose
    $toroClave = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Lxss\{201db596-c13c-4b4c-943a-44d8698b3ab2}'
    $toroDistro = Get-ItemProperty -LiteralPath $toroClave -ErrorAction SilentlyContinue
    if ($null -ne $toroDistro) {
        $toroDistro | Select-Object DistributionName, Version, BasePath | Format-List
        $toroActivas = @(wsl.exe --list --running --quiet)
        if ($LASTEXITCODE -eq 0) {
            $toroActivas = @($toroActivas | ForEach-Object {
                ([string]$_).Replace([string][char]0, '').Trim()
            })
            if ($toroActivas -contains $toroDistro.DistributionName) {
                wsl.exe --distribution $toroDistro.DistributionName --exec df -h /
            } else {
                Write-Host 'Disco Linux no consultado: distribucion detenida.'
            }
        }
    } else {
        Write-Host 'El registro no identifica ese disco; conservarlo hasta verificar su distribucion.'
    }
}
```

WSL compaction remains NEXT only after confirming distribution identity, version, actual allocated file usage, Linux filesystem usage, backup/recovery and an appropriate quiescent state. Do not run wsl --shutdown on unidentified active projects/services, remove the VHD, or migrate the live distro to external exFAT D: based on folder size alone. The external drive can hold an identified ordinary backup archive; runtime relocation requires separate filesystem, availability and recovery validation. No WSL mutation has been executed from this session.

Primary sources:
- https://pnpm.io/cli/store
- https://learn.microsoft.com/en-us/windows/wsl/disk-space
- https://learn.microsoft.com/en-us/windows/wsl/basic-commands

CURRENT: owner executed the package/WSL block. pnpm native launcher was not found, so cleanup was skipped. Observed free-space delta was 0 GiB, free space 12.328 GiB. WSL identity and Linux root usage are now owner-reported below. A read-only scan frees no bytes.


## Identified Ubuntu and lossless archive recovery, 13 October 2026

Owner supplied WSL 2.7.12.0, kernel 6.18.33.2-2, Windows 10.0.26300.9550. Registry maps the observed VHD to Ubuntu (WSL 2), currently Running. Linux df reports /dev/sdd at root, virtual capacity 1007G, Used 28G, Avail 929G, Use 3%. The large virtual free value is the VHD's Linux maximum capacity, not free space on C:. Approximately 28 GiB used versus 30.932 GiB logical VHD file length does not justify expecting tens of GiB from compaction alone; actual allocated usage and sparse/trim state remain unmeasured.

Native pnpm was absent from the command lookup; no packages were pruned. Free space now 12.328 GiB, observed block delta 0. The difference from the older 15.199 GiB measurement has no established cause. Preserve the store; do not manually delete it or install a manager just to force cleanup.

Next concrete Windows action: NTFS compression of at most 50 largest plain, writable, uncompressed direct JSONL files in the current user's .codex/archived_sessions directory on C:. Existing Test-ToroPlainDirectory rejects linked ancestors. SQLite, active sessions, subdirectories, read-only/linked/already-compressed files, installed apps and project assets are outside the selection. No directory compression inheritance or whole-volume compression is applied. Native compact /C /Q keeps file content and paths; no /EXE, /S, /F or raw deletion fallback. Recovery must be measured, not inferred from logical lengths. Native errors leave remaining files untouched.

The same block uses apt-get clean in confirmed Ubuntu to clear APT's retrieved package archive cache without uninstalling packages, and then reads Linux filesystem usage plus at most 15 largest directory totals. du uses one filesystem, MiB units and depth-two output across explicit Linux roots, with a 60-second timeout; nonzero status must be retained as incomplete/error. Parent/child directory totals overlap and must not be summed. apt cache cleanup may free internal Linux blocks without shrinking the Windows VHD immediately; no C: recovery is claimed from that operation without later host readback. Ubuntu remains running; no shutdown, unregister, compact-vdisk, fstrim, disk move or project/history deletion is requested by the block.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command {
    $ErrorActionPreference = 'Stop'
    . 'D:\TORO-carpetas-06aa58718103435ab9bece1e7888654f.ps1'
    $toroAntes = [long](Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'").FreeSpace
    $toroArchivo = Join-Path ([Environment]::GetFolderPath('UserProfile')) '.codex\archived_sessions'
    $toroDisco = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'"

    if ($toroDisco.FileSystem -eq 'NTFS' -and $toroArchivo.StartsWith('C:\') -and
        (Test-ToroPlainDirectory -Path $toroArchivo)) {
        $toroLogs = @(Get-ChildItem -LiteralPath $toroArchivo -File -Filter '*.jsonl' |
            Where-Object { ([long]$_.Attributes -band (0x400 -bor 0x1 -bor 0x800)) -eq 0 } |
            Sort-Object Length -Descending | Select-Object -First 50)
        if ($toroLogs.Count -gt 0) {
            & compact.exe /C /Q $toroLogs.FullName
            if ($LASTEXITCODE -ne 0) { Write-Warning 'Compresion incompleta; conservar los archivos.' }
        }
    }
    $toroDespues = [long](Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'").FreeSpace
    [pscustomobject]@{
        LibreAhoraGiB = [Math]::Round($toroDespues / 1GB, 3)
        CambioObservadoGiB = [Math]::Round(($toroDespues - $toroAntes) / 1GB, 3)
    } | Format-List

    wsl.exe --distribution Ubuntu --user root --exec apt-get clean
    Write-Host ('Resultado limpieza APT: ' + $LASTEXITCODE)
    wsl.exe --distribution Ubuntu --exec df -h /
    $toroDu = @(wsl.exe --distribution Ubuntu --user root --exec timeout 60s du -x -m --max-depth=2 /home /root /var /usr /opt /tmp)
    $toroDuEstado = $LASTEXITCODE
    $toroDu | ForEach-Object {
        if ([string]$_ -match '^(\d+)\s+(.+)$') {
            [pscustomobject]@{ MiB = [long]$Matches[1]; Carpeta = $Matches[2] }
        }
    } | Sort-Object MiB -Descending | Select-Object -First 15 | Format-Table -AutoSize
    Write-Host ('Estado lectura Linux: ' + $toroDuEstado + ' (0=completa; otro=parcial o error)')
}
```

Functional reversal: use compact.exe /U /Q with the same explicit file paths to undo NTFS compression, provided sufficient free space remains; avoid broad directory wildcards for reversal. Tests/pc-space-archive-compression.test.ps1 uses synthetic JSONL archives, a SQLite sentinel and an active-session sentinel to verify SHA256 byte preservation, unchanged locations/scope exclusions and decompression, including spaced paths, in Windows PowerShell 5.1 and 7. A passing fixture does not constitute execution against owner archives. APT cache has no deleted-download rollback; repository-provided packages can be downloaded again if needed, while installed software remains.

Primary sources:
- https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/compact
- https://manpages.ubuntu.com/manpages/noble/man8/apt-get.8.html
- https://www.gnu.org/software/coreutils/manual/html_node/du-invocation.html
- https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/compact-vdisk

CURRENT: Ubuntu identity/usage and zero-recovery pnpm skip owner-reported. NEXT: CI-validated archive compression and bounded Ubuntu cache/size step with actual readback. No owner archive or Ubuntu mutation has been executed by this chat connector.
