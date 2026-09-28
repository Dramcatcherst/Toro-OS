# TORO R1-A backlog revalidation baseline — 2026-09-28

**Status:** READ-ONLY SNAPSHOT. No task row has been modified by R1-A.

## Canonical source

- Supabase project: `abtyrbqlqbsastmridzp`
- Canonical task table: `operations.tasks`
- Snapshot filter: `active=true AND needs_revalidation=true AND status NOT IN ('done','completed')`
- Snapshot rows: **65**

## Module distribution

- `critical_hotel_operations`: **17**
- `revenue_booking_stack`: **15**
- `toro_executive_control`: **15**
- `dreamcatcher_website`: **7**
- `business_truth_bible`: **6**
- `finance_controls`: **5**

## Status distribution

- `planned`: **45**
- `blocked`: **18**
- `in_progress`: **2**

## Review contract

Every snapshot entry must end with exactly one disposition:

- `KEEP`
- `MERGE`
- `CLOSE`
- `HOLD`
- `REWRITE`

No row is deleted. Any future apply must require the captured `task_id`, `task_key`, `updated_at`, and `needs_revalidation=true` to still match. A concurrent change returns the row to review instead of being overwritten.

Machine-readable snapshot:
`data/governance/toro-r1-task-revalidation-20260928.json`

Inventory query:
`supabase/drafts/20260928_toro_r1_task_revalidation_inventory.sql`

## First review cohort — 2026-09-28

Cohort rule: P0/P1 migrated review items plus open `in_progress` tasks.

- Reviewed dispositions written to the manifest: **12**
- KEEP: **10**
- REWRITE: **2**
- CLOSE/MERGE/HOLD: **0**
- Concurrently changed task left unresolved: **1** — `google_control_plane_readonly_map_20260826`

### Concurrency gate exercised

The snapshot captured `google_control_plane_readonly_map_20260826.updated_at = 2026-09-22 22:16:30.327057+00`.

A fresh read during review observed `updated_at = 2026-09-28 22:20:22.395014+00`.

R1-A therefore **did not assign a disposition** to the stale snapshot entry. It must be refreshed/re-reviewed instead of overwritten. This is the intended stale-write behavior.

### Material current evidence

- Vercel project `prj_nxerFw9ciNews6tUMAah3GAlAJzs` produced READY production deployment `dpl_5f5KUmjissa1WunB85vEVB37yRHq` from `main` SHA `7bff9c19d5d3150a382693aa26c4265487cd236c` on 2026-09-28. The preview-only/release-separation gate therefore remains current.
- `task-dc-timekeeping-validation-20260810` is marked REWRITE because its security blocker cites the superseded 22/09 advisor snapshot. Current security reconciliation is tracked in DreamTeam PR #46; this does not resolve the separate Costa Rica labor/payroll professional-validation gate.
- `legacy_task_rec8Qj1aPRrhgQEms` is marked REWRITE from planned -> blocked because the current row itself records unresolved Kross/activation/QA gates. No Kross or WeSpeak write was performed.

No Supabase task row was changed by this review.
