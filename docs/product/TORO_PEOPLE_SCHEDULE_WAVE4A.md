# TORO People — My Schedule Wave 4A

**Status:** IMPLEMENTATION CANDIDATE  
**Date:** 2026-09-23  
**Branch:** `feat/toro-people-my-schedule-wave4a-20260923`  
**Master:** TORO Brain General Plan

## Goal

Absorb the employee-facing schedule view from DreamTeam into TORO People without exposing draft planning, salary forecast or schedule-management writes.

## Current aggregate evidence

Read-only production aggregate observed during design:
- published assignments: 102;
- draft assignments: 70;
- cancelled assignments: 99;
- active shift templates: 10.

This proves a real schedule estate exists. It does not authorize bulk edits or publication.

## Surface

Route:
`/toro/mi-horario`

Audience:
- employee-linked organization users.

Source:
- `shift_assignments` under existing self-read RLS.

## Visibility rule

The employee query is constrained to:
- current organization;
- current linked employee;
- non-deleted assignments;
- `assignment_status in ('published','confirmed')`;
- current/future dates in America/Costa_Rica;
- maximum 60 rows.

Draft and cancelled assignments are not part of the query.

## Data minimization

Projected:
- assignment ID;
- shift date;
- start/end;
- break minutes;
- published/confirmed status;
- publication/confirmation timestamps.

Not projected:
- `data` JSON;
- internal note;
- template ID;
- template administrative metadata;
- department planning data;
- creator/updater identity;
- salary history;
- payroll forecast;
- other employees.

## Defense in depth

Before reading shifts, TORO verifies:

`context user_id + org_id + employee_id`

against the employee self-read boundary.

The loader tests explicitly prove it does not query:
- `shift_templates`;
- `salary_history`.

## Navigation

Employee:
- `Horario` -> `/toro/mi-horario`.

Functional worker experiences and People managers may receive:
- `Mi horario` -> same self route.

Team schedule administration remains separate:
- `Horarios` = coming soon where applicable.

Navigation does not grant access. Employee linkage + RLS remain authoritative.

## Explicitly excluded from Wave 4A

- creating/editing shifts;
- cancelling shifts;
- publishing a week;
- copying previous week;
- template management;
- shift swaps;
- schedule-change requests;
- salary/payroll forecast;
- attendance-vs-schedule managerial comparison;
- WhatsApp schedule sharing;
- schema migration.

## Why change/swap is not included

Current RLS for:
- `schedule_change_requests`;
- `shift_swap_requests`

is HR/admin-oriented and does not provide an employee self-service write contract.

TORO will not invent a client-side flow that bypasses the existing authority model.

## Future waves

### Wave 4B — management read
Team/department schedule view with existing management/department RLS.

No salary forecast unless the active role is explicitly authorized.

### Wave 4C — governed planning writes
Create/edit/cancel assignments and template lifecycle.

Requires:
- role-scoped write contract;
- audit/evidence;
- duplicate/conflict checks;
- past-shift immutability;
- tests and rollback.

### Wave 4D — publish/copy
Publishing a schedule is a distinct higher-impact action.

### Wave 4E — employee change/swap
Only after a reviewed self-service RLS/RPC contract exists.

## Exit gate

Before merge:
- Vitest PASS;
- lint PASS;
- build PASS;
- Vercel PASS;
- mapper drops draft/cancelled rows;
- loader queries only published/confirmed own assignments;
- no salary/template/internal-note source is read;
- no production mutation.

After merge:
- representative employee hosted/mobile QA remains required before DreamTeam schedule self-view can be considered replaced.
