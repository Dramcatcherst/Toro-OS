# TORO People — Self-Service Wave 1

**Status:** IMPLEMENTATION CANDIDATE
**Date:** 2026-09-23
**Branch:** `feat/toro-people-self-service-wave1-20260923`
**Parent:** current Phase 1 TORO Brain context/auth line
**Master authority:** `docs/product/TORO_BRAIN_GENERAL_PLAN.md`

## Goal

Provide one canonical server-side employee self-service read model that TORO Portal can consume later without importing the DreamTeam application shell.

This wave is intentionally **read-first**.

## Included

- own employee identity summary;
- own private contact/emergency profile through governed RPC;
- upcoming shifts;
- own leave requests;
- own leave balances;
- recent attendance;
- source/freshness metadata.

## Not included

- UI route/navigation;
- account invitation;
- role mutation;
- leave creation/approval;
- schedule edits;
- payroll;
- loans;
- settlements;
- employee directory;
- team chat;
- service-role reads;
- production schema changes.

## Canonical security boundary

The feature consumes `ToroResolvedContext`.

It requires:
- organization mode;
- active organization context;
- organization-data permission;
- employee link;
- selected organization = membership organization.

Server-side data access uses the authenticated Supabase session.

No service-role client is used.

## Defense in depth

Before returning the snapshot, TORO verifies:

`context user_id + context org_id + context employee_id`

against `public.employees` using the authenticated session and existing RLS.

The private profile is read only through `public.employee_self_profile(org_id)`, which:
- is SECURITY DEFINER;
- fixes search_path;
- resolves the employee from `auth.uid()`;
- returns only the current user's approved self-profile fields.

If the RPC employee ID and TORO context employee ID disagree, the snapshot is blocked.

## Existing RLS reused

Verified self-read policies already exist for:
- `employees`;
- `shift_assignments`;
- `leave_requests`;
- `leave_balances`;
- `attendance_days`.

Wave 1 does not weaken or replace them.

## Data minimization

Employment projection intentionally excludes:
- salary;
- bank data;
- arbitrary HR/private JSON;
- other employee records;
- payroll data.

Private profile projection is limited to:
- preferred name;
- phone;
- personal email;
- address;
- emergency contact fields.

Shift projection excludes arbitrary `data` JSON.

## Code contract

`src/features/people/self-service/`

- `types.ts` — public read model.
- `context.ts` — TORO context gate.
- `mappers.ts` — allowlisted projections.
- `server.ts` — authenticated server read.
- tests — context, minimization and identity-boundary tests.

## Definition of done for this wave

- Vercel build passes on current Phase 1-compatible branch.
- strict TypeScript/lint passes through the branch build.
- context tests exist for personal/organization/employee boundaries.
- mappers prove sensitive fields are not projected.
- server tests prove auth-org-employee constraint and mismatch denial.
- no production write/migration occurs.
- branch remains a clean additive layer over Phase 1.
- Portal UI remains a later wave until session/navigation convergence is ready.

## Next wave

After this server read model is accepted:
1. create role-safe TORO People Portal surface;
2. expose self-service through one TORO navigation;
3. add leave-request creation with existing RLS;
4. add controlled profile edit via the existing self-profile boundary;
5. run representative employee mobile QA;
6. only then begin replacing DreamTeam self-service UI.
