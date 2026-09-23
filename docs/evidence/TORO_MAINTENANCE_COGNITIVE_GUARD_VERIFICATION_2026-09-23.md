# TORO maintenance cognitive guard — verification evidence

**Date:** 2026-09-23  
**Scope:** Dreamcatcher VS1 Guest-ready / maintenance  
**Function:** `facilities.create_daily_maintenance_round(date)`  
**Status:** VERIFIED_APPLIED

## Problem observed

Three equivalent daily maintenance rounds existed for 21, 22 and 23 September 2026.

Each contained 21 required checks and all checks remained `pending`.

Observed baseline:

- rounds: 3;
- checks prepared: 63;
- PASS: 0;
- FAIL: 0;
- current 23/09 round: 21/21 pending;
- uncovered new P0/P1 maintenance tasks at test time: 0;
- linked target events/tasks changed after current round creation at initial test time: 0.

The generator previously created a new dated round whenever the target date did not yet exist, even when the previous execution packet remained completely unexecuted.

## Change applied

Two governed Supabase migrations were applied:

1. `20260923083250 maintenance_daily_round_no_delta_guard_20260923`
2. `20260923083643 maintenance_daily_round_material_delta_guard_20260923`

Final rule:

Reuse the previous logical round when all of the following are true:

- previous round status is `ready`;
- it contains required checks;
- every required check is still `pending`;
- no new active P0/P1 maintenance task is uncovered;
- no linked maintenance event, target task or parent task changed after the previous round was created.

A new dated round remains allowed when execution/results exist or a material target/task delta exists.

## Security / permission invariants

Before change:
- SECURITY DEFINER: true
- owner: `postgres`
- execute ACL: `postgres`, `service_role`
- function definition MD5: `080aca2d53cc87f637ac2ddb9a5e75c9`

After first guard:
- function definition MD5: `41c3b8c4b137f150baab2952e58dfa31`

After material-delta hardening:
- SECURITY DEFINER: true
- owner: `postgres`
- execute ACL: `postgres`, `service_role`
- function definition MD5: `b014163a2ecb65e2a6211ea19164b2fa`
- target-delta guard present: true

No grants, table schemas, reservation data, rates, payments or physical result records were changed.

## Functional verification

### Test A — no delta

A call for `2026-09-24` was executed inside a rollback-only test scope.

Result:
- returned round: `MNT-DAILY-P0-P1-20260923`;
- returned checks: 21;
- generic new checks: 0;
- persisted `MNT-DAILY-P0-P1-20260924`: **false**.

PASS: duplicate packet was suppressed.

### Test B — linked target changes

Inside a rollback-only test scope, one maintenance event already linked to the 23/09 round was given a temporary `updated_at` change, then the generator was called for `2026-09-24`.

Target used:
- `maint-20260826-leaks-room21-room22-progress`

Result:
- returned round: `MNT-DAILY-P0-P1-20260924`;
- returned checks: 21;
- generic new checks: 0;
- persisted `MNT-DAILY-P0-P1-20260924` after rollback: **false**.

PASS: a linked material-state delta bypasses suppression and allows a new packet.

## Rollback

Exact original pre-change function definition is preserved in:

`docs/evidence/maintenance_daily_round_prechange_20260923.sql`

Applying that exact `CREATE OR REPLACE FUNCTION` through the governed migration path restores the original generator behavior.

## Meaning

This proves the first concrete TORO Cognitive Operating Model intervention:

> stop optimizing output generation when the constraint is execution/outcome.

It does **not** prove that any maintenance check was physically executed or that any room/event is closed. Field outcomes remain pending until real evidence arrives.
