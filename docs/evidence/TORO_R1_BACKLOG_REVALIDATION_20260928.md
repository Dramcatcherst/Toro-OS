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


## Final reviewed manifest — 2026-09-28

All 65 snapshot rows now have an explicit review disposition:

- KEEP: **40**
- HOLD: **20**
- REWRITE: **3**
- MERGE: **1**
- CLOSE: **1**

Three rows were concurrently resolved outside the R1 apply path and are explicit no-ops in generated SQL:

- `google_control_plane_readonly_map_20260826`
- `task-dc-timekeeping-validation-20260810`
- `toro_os_vercel_release_gate_separation_2026_08_23`

The manifest preserves the original `updated_at` snapshot and uses `observed_updated_at` as the effective stale-write guard after any documented concurrent refresh.

### Generated SQL

- Apply: `supabase/drafts/20260928_toro_r1_task_revalidation_apply.sql`
- Recovery: `supabase/drafts/20260928_toro_r1_task_revalidation_recovery.sql`
- Summary: `docs/evidence/TORO_R1_BACKLOG_REVALIDATION_GENERATION_20260928.txt`

Generator result:

- TOTAL: **65**
- ACTIONABLE: **62**
- NO_OP_CONCURRENT: **3**

Every actionable task requires exact `task_id`, `task_key`, `observed_updated_at`, and `needs_revalidation=true`; every mutation writes one `public.audit_logs` receipt with request ID `TORO-R1-A-20260928`. No task DELETE is generated.

## Production transaction dry-run — VERIFIED / ROLLED BACK

The exact generated apply logic was executed inside a transaction and rolled back.

Observed inside the transaction:

- reviewed manifest rows found: **65**
- actionable rows expected: **62**
- actionable rows changed to `needs_revalidation=false`: **62**
- R1 audit receipts created inside transaction: **62**
- orphan project references after projected changes: **0**
- merge target `DC2-022` remained active: **true**
- total task rows: **350 before / 350 after**
- active open tasks: **208 before / 187 projected after**
- HOLD/archive rows in reviewed scope after projected changes: **21**

The projected active-open reduction is **21** because HOLD/MERGE/CLOSE dispositions remove those rows from active work while preserving history.

### Rollback readback

Immediately after `ROLLBACK`:

- total tasks: **350**
- active open tasks: **208**
- actionable rows still `needs_revalidation=true`: **62**
- reviewed rows already false from concurrent external work: **3**
- persisted R1 audit receipts: **0**

Therefore the dry-run produced no persistent task or audit mutation.


## Production apply closeout — VERIFIED

R1-A was applied in six guarded module batches after the rollback-only dry-run passed.

Batch results:

| Module | Actionable rows | Final active-open rows in reviewed scope | Archived |
| --- | ---: | ---: | ---: |
| `toro_executive_control` | 12 | 9 | 5 |
| `business_truth_bible` | 6 | 3 | 3 |
| `critical_hotel_operations` | 17 | 12 | 5 |
| `revenue_booking_stack` | 15 | 11 | 4 |
| `dreamcatcher_website` | 7 | 4 | 3 |
| `finance_controls` | 5 | 4 | 1 |

Final production readback:

- total task rows: **350**
- active open tasks: **187**
- reviewed rows: **65**
- reviewed rows still `needs_revalidation=true`: **0**
- R1 apply audit receipts: **62**
- reviewed archived/inactive: **21**
- reviewed done/inactive: **1**

The three rows already revalidated by concurrent work were not mutated by the R1 apply generator.

No task row was deleted. Recovery SQL remains versioned in:
`supabase/drafts/20260928_toro_r1_task_revalidation_recovery.sql`.

**R1-A result:** stale/historical backlog was reduced without creating another task system or losing source history.
