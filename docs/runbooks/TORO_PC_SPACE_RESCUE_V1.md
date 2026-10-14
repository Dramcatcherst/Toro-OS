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
