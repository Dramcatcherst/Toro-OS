# TORO — Supabase Security Residual Review — 2026-09-28

**Status:** PREPARED / READ-ONLY REVIEW COMPLETE  
**Project:** `abtyrbqlqbsastmridzp`  
**Canonical task:** `task-dc-timekeeping-validation-20260810`  
**General Plan:** `docs/product/TORO_BRAIN_GENERAL_PLAN.md`

This document records current evidence and a minimal reversible target. It is **not** authorization to apply Auth, RLS, grant or function changes.

## Current Advisor findings

- RLS enabled with no policy: 50
- anon-executable SECURITY DEFINER: 3
- authenticated-executable SECURITY DEFINER: 40
- leaked-password protection: disabled

## Authenticated RPC classification

Current 40 findings classify as:

- 24 — role/admin guarded
- 10 — self/org-scoped user flows
- 3 — deliberate pre-login controls requiring bounded-public review
- 1 — wrapper delegating to a guarded v2 function
- 2 — broad employee-read candidates requiring correction

### Pre-login functions

- `check_login_rate_limit`
- `check_recovery_rate_limit`
- `record_login_attempt`

Observed:
- SECURITY DEFINER
- `search_path=''`
- callable by anon/authenticated
- previously hardened in migrations on 2026-09-19

Interpretation:
intentional pre-login API candidates, not blind-revoke candidates. They still require input/abuse/rate-limit regression review because a public SECURITY DEFINER RPC is an exposed API.

## Wrapper finding resolved

`replace_attendance_blocks_manual_v3` does not contain its own role check, but it calls `replace_attendance_blocks_manual_v2`.

`replace_attendance_blocks_manual_v2`:
- is not executable directly by authenticated;
- checks `private.has_org_role(target.org_id, ['ADMIN','RRHH'])`;
- blocks closed payroll mutation;
- validates date, blocks, chronology and note;
- records correction/audit data.

Conclusion:
no direct privilege bypass observed from the v3 wrapper under the inspected definitions. Keep regression coverage.

## Material residual: broad EMPLEADO visibility

Two SECURITY DEFINER read RPCs currently authorize:

`['ADMIN','RRHH','GERENCIA','JEFE_DEPARTAMENTO','CONTABILIDAD','AUDITOR','EMPLEADO']`

Functions:
- `operational_schedule_workspace(p_org_id, p_week_from)`
- `operational_time_clock_dashboard(p_org_id, p_from, p_to)`

Both return multi-employee data.

### Conflict with canonical employee surface

The TORO General Plan states the verified employee attendance surface is:
- own attendance days only;
- own entry/exit summary;
- own status/minutes.

### Existing RLS already supports self-service

`public.attendance_days`:
- `attendance_self_read`: employee_id = current employee for org.

`public.shift_assignments`:
- `shift_self_read`: employee_id = current employee for org.

Therefore employee self-service does **not** require these broad SECURITY DEFINER dashboards.

## Minimal target patch

Preferred target:
remove `EMPLEADO` from the allowed role array inside:

1. `public.operational_schedule_workspace`
2. `public.operational_time_clock_dashboard`

Keep:
- ADMIN
- RRHH
- GERENCIA
- JEFE_DEPARTAMENTO
- CONTABILIDAD
- AUDITOR

Employee UI should consume self-scoped rows through existing RLS-backed paths or an already-authorized self projection. Do not broaden grants.

### Why this is preferable

- smaller change;
- aligns with General Plan;
- reuses existing RLS;
- does not introduce another RPC;
- keeps administrative dashboards intact;
- reduces data exposure if an ordinary EMPLEADO account invokes either RPC directly.

## Evidence limitation

No callers for these two RPC names were found in the connected:
- `Dramcatcherst/Toro-OS`
- `Dramcatcherst/dream-team`

`pg_stat_user_functions` returned no recorded calls for them in the queried stats snapshot.

This does **not** prove they are unused. It means caller evidence is currently absent.

## Required pre-apply gate

Before changing function bodies:

1. search all current runtime repositories/worktrees;
2. inspect Portal/DreamTeam deployed callers;
3. test with representative roles:
   - EMPLEADO
   - JEFE_DEPARTAMENTO
   - GERENCIA
   - RRHH
   - ADMIN
   - CONTABILIDAD
   - AUDITOR;
4. prove self attendance and self shift views still work for EMPLEADO;
5. capture current function DDL for rollback.

## Expected tests after patch

### EMPLEADO
- broad schedule workspace RPC -> denied
- broad time-clock dashboard RPC -> denied
- own attendance SELECT -> allowed
- own shift assignments SELECT -> allowed
- other employee attendance -> denied
- other employee shift -> denied

### Manager / HR / Admin
- authorized dashboards remain available according to role contract
- department scope remains intact where applicable

### Negative
- wrong org -> denied
- revoked role -> denied
- anonymous -> denied

## Rollback

Restore the previous function definitions captured immediately before change. Do not alter table RLS in the same change.

## Leaked password protection

Separate Auth change:
- current Advisor: disabled;
- official Supabase guidance: enable leaked-password protection in Auth settings;
- Pro+ feature;
- test normal login, password update/recovery and privileged accounts after activation.

Do not combine Auth password-policy change and RPC role change into one irreversible step unless the rollback/testing plan explicitly covers both.

## Current recommendation

Security residual should now be treated as:

1. **P0:** verify and narrow the two broad employee-read RPCs.
2. **P0:** enable leaked-password protection through authorized Auth control.
3. **Review, not panic:** keep inspecting the 3 pre-login functions as intentional public endpoints.
4. **P1:** review remaining authenticated SECURITY DEFINER functions over time; most currently show role/self guards and should not all be rewritten merely to silence the Advisor.

