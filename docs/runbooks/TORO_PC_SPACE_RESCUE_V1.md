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

CURRENT: diagnostics owner-reported and next procedure prepared; no execution of reduced-mode powercfg observed. NEXT: owner execution with before/after readback, then evaluate pagefile needs and a targeted user/AppData inventory if free space remains insufficient. The cleanup/diagnostic script itself is unchanged; this is a separate Windows-managed recovery procedure under the same General Plan checkpoint.
