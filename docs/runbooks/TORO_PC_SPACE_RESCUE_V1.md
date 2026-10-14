# TORO PC space rescue v1

Scope: owner's Windows PC, C: pressure. Subordinate to the single General Plan and existing pc-health diagnostics. The chat has no connected local Windows executor; no owner disk cleanup has been observed.

## Local use

Run the prepared script in Windows PowerShell. Without arguments it only inspects; -Clean applies bounded deletion. Administrator rights are not required; protected/in-use files are skipped. Save the script on D: when C: is full.

The executable code is scripts/pc-space-rescue.ps1. It selects fixed C: roots: Windows/user Temp and Cache, Code Cache, GPUCache under Default/Profile N for Chrome/Edge. Temporary files must be .tmp/.temp/.dmp/.etl; browser-cache files are disposable cache content. All must be older than seven days. It avoids reparse points and rechecks paths, age/type/protection before deletion. It deletes at most 10,000 files per run.

Documents, Downloads, Desktop, Recycle Bin, Dropbox, profile databases, credentials, installed applications and project build folders are not selected. Do not move installed apps or Windows directories to the exFAT D: drive. No file relocation or cloud sync change occurs.

Result: CandidateGB, DeletedGB, SkippedFiles and FreeBeforeGB/FreeAfterGB. ObservedFreeDeltaGB may differ from DeletedGB because other processes and filesystem allocation change concurrently. These are observations after local execution, not promised recovery. If the recovered space is insufficient, inspect storage sizes and verify a separate copy of an identified large personal file to D: before removing its source.

## Validation and recovery

Synthetic CI in Windows PowerShell 5.1 and PowerShell 7 covers non-mutating discovery, empty inputs, preservation of documents/recent files, repeated roots, junction isolation, changed-file revalidation, outside-root rejection and locked files. No tests run cleanup against the owner computer.

An initial Windows 5.1 failure detected reliance on PowerShell extended metadata for DirectoryInfo ancestors. Fixed to inspect DirectoryInfo directly; later safety and repository CI passed before the final empty-input refinement. Latest-code CI must pass before offering execution.

No deleted-temp-file rollback is provided. Browser caches regenerate from provider data. Existing user documents remain in place. Revert this branch to remove the tool; no registry, permissions, persistence, scheduler or deployment flags were changed.
