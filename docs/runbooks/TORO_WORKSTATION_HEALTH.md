# TORO Workstation Health

**Status:** CURRENT CANONICAL PROBE  
**Owner:** TORO Systems  
**Consumers:** TORO Systems, OpenClaw/Gateway runtime, TORO Tools  
**Mode:** observe/advice only

## Purpose

Give TORO a bounded answer to one operational question:

> Is this authorized Windows workstation healthy enough for controlled local work right now?

The probe is not a remote-administration tool and does not grant host authority.

## Commands

Human-readable:

```powershell
npm run health:pc
```

Machine-readable:

```powershell
pwsh -NoProfile -File scripts/pc-health.ps1 -Json
```

Optional generated-folder scan:

```powershell
pwsh -NoProfile -File scripts/pc-health.ps1 -Json -ScanGeneratedFolders
```

## Bounded metrics

The probe may report:
- free disk GB on the system drive;
- available RAM GB;
- total RAM GB;
- available RAM percentage;
- CPU load percentage;
- count of heavy dev/browser processes;
- largest generated-folder size when explicitly requested;
- generated-folder name from a fixed allowlist when scanning is enabled.

It must not report:
- process command lines;
- file contents;
- browser history;
- credentials/tokens;
- arbitrary directory listings;
- personal document names;
- network traffic payloads.

## Initial health policy

### STOP_HEAVY_WORK
- disk free < 10 GB; or
- available RAM < 1 GB; or
- available RAM < 5%.

### CAUTION
Any of:
- disk free < 20 GB;
- available RAM < 3 GB;
- available RAM < 20%;
- CPU >= 90%;
- heavy dev/browser process count >= 5;
- largest explicitly scanned generated folder >= 2 GB.

### HEALTHY
No critical/warning threshold is met.

### DIAGNOSTIC_ERROR
Required host metrics could not be collected or the classifier failed.

A diagnostic error is not equivalent to an unhealthy machine; it means TORO lacks trustworthy evidence.

## Safety boundary

This capability is advisory.

It must never automatically:
- terminate processes;
- close browsers;
- delete generated folders;
- run disk cleanup;
- uninstall software;
- change Windows settings;
- restart the computer;
- restart OpenClaw;
- modify firewall/network configuration.

Any future remediation capability requires a separate TORO Tools capability, risk classification, policy decision, approval/evidence flow and rollback strategy.

## OpenClaw / Gateway use

TORO Systems may use this probe before heavy local work such as:
- large builds;
- local indexing;
- many concurrent browser/agent sessions;
- media processing;
- other resource-intensive local work.

Recommended interpretation:
- `HEALTHY` -> one controlled heavy task may proceed;
- `CAUTION` -> reduce concurrency and prefer cloud/connector execution where practical;
- `STOP_HEAVY_WORK` -> do not start additional heavy local work; surface the reasons;
- `DIAGNOSTIC_ERROR` -> treat local capacity as unknown until diagnostics are repaired.

The probe is evidence for scheduling/routing. It is not authorization.

## Verification

Canonical tests:
- `npm run test:workstation-health`
- GitHub workflow: **Workstation health tests**
  - `classifier` on Ubuntu;
  - `windows-smoke` on Windows.

The global `npm test` command also runs the classifier regression suite.

## Legacy provenance

This capability was mined from the verified legacy `toro-os-v88-new` implementation and moved into canonical `Dramcatcherst/Toro-OS`.

The legacy runtime is not required to execute this capability after canonical validation/merge.
