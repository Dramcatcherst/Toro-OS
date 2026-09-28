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
