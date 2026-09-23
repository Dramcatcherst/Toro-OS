# TORO People — Attendance Wave 3A

**Status:** IMPLEMENTATION CANDIDATE  
**Date:** 2026-09-23  
**Branch:** `feat/toro-people-attendance-wave3a-20260923`  
**Master:** TORO Brain General Plan

## Goal

Absorb the read/observability side of DreamTeam attendance into TORO People without enabling payroll-affecting corrections or time-clock commits.

## Current aggregate evidence

Read-only production aggregate observed during design:
- attendance days: 495;
- complete: 408;
- incomplete: 46;
- pending identity: 40;
- unknown identity: 1;
- approval approved: 252;
- approval pending: 241;
- approval rejected: 2;
- attendance exceptions open: 94;
- attendance exceptions resolved: 72;
- time imports visible: 5, current status value observed: `analyzed`.

These counts justify review/triage. They do not authorize bulk correction.

## Surface A — Mi asistencia

Route:
`/toro/mi-asistencia`

Audience:
- employee-linked organization users.

Source:
- `attendance_days` self-read RLS.

Shows:
- own date;
- own entry/exit summary;
- actual worked minutes;
- official worked minutes;
- attendance status;
- approval status;
- payroll inclusion flag.

Does not show:
- raw punches;
- clock employee ID;
- import IDs;
- attendance blocks;
- resolution payloads;
- other employees.

Limit:
- 45 most recent own attendance days.

## Surface B — Attendance review

Route:
`/toro/asistencia`

Read-review roles:
- ADMIN;
- RRHH;
- GERENCIA;
- AUDITOR;
- CONTABILIDAD.

Navigation enabled in this wave only for:
- ADMIN;
- RRHH;
- AUDITOR.

Other authorized roles may reach the route through future role UX, but navigation is not authorization.

JEFE_DEPARTAMENTO is intentionally excluded from exception/import review because current RLS does not grant that access. Department-level attendance remains a later projection.

Sources:
- `attendance_days`;
- open `attendance_exceptions`;
- recent `time_imports`.

Explicitly not queried:
- `raw_punches`;
- `attendance_blocks`.

## Data minimization

Attendance review projects:
- preferred employee name;
- work area;
- day summary;
- open exception type/severity/description;
- minimal import counts/period/status.

It does not project:
- employee legal name;
- raw clock ID;
- raw payload;
- time-import file name;
- SHA;
- exception resolution payload;
- raw punch rows;
- official block timestamps.

## Risk split

### Wave 3A — this branch
Read-only observability.

### Future Wave 3B
Incident resolution.

High-risk examples:
- corrected exit;
- confirm identity;
- exclude from payroll.

Must preserve:
- note/evidence;
- HR/Admin authorization;
- DB audit;
- closed-payroll immutability;
- identity consistency.

### Future Wave 3C
Time-clock import.

Split:
1. file inspection/analyze — lower risk/read-only;
2. commit/replace existing — high risk.

Commit may:
- create attendance;
- create incidents;
- replace existing attendance;
- invalidate draft payroll;
- be blocked by closed payroll.

Therefore analysis and commit must remain separate capabilities and approval levels.

### Future Wave 3D
Official attendance edits/payment decisions.

These can modify:
- official blocks;
- approval status;
- payroll eligibility;
- payroll draft recalculation.

They remain blocked until separate tests, approvals and rollback evidence.

## Existing DreamTeam logic preserved for later migration

Useful assets:
- attendance block validation;
- conservative rounding;
- incident resolution rules;
- time-clock analyze/prepare logic;
- duplicate detection;
- closed-payroll guards;
- payroll recalculation behavior;
- audit notes.

Do not port the old AttendanceEditor wholesale into TORO before those higher-risk gates.

## Exit gate

Before merge:
- Vitest PASS;
- lint PASS;
- build PASS;
- Vercel PASS;
- employee self projection tests prove no raw clock data;
- review projection tests prove no raw payload/hash/file data;
- review loader test proves it never queries raw_punches/attendance_blocks;
- no production mutation.

After merge:
- hosted employee/RRHH pilot remains required;
- no bulk attendance correction is authorized by this wave.
