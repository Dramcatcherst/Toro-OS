# TORO Maintenance Field Capture Rebaseline — 2026-09-23

**Scope:** Dreamcatcher guest-ready maintenance Product Proof  
**Round:** `MNT-DAILY-P0-P1-20260923`  
**Mode:** read-only UI preparation; no field results written

## Observed round state

Canonical view:
- `facilities.inspection_round_progress_v`

Observed:
- total checks: 21;
- required checks: 21;
- pass: 0;
- fail: 0;
- pending: 21;
- closure-ready passes: 0;
- round status: ready.

The field-capture source contains 21 explicit checks with area, check text, result status and supervisor-review flags.

## Interpretation

The backend/work packet exists.

The current blocker is **field capture**, not task generation.

Do not:
- create another equivalent daily packet while the no-delta rule applies;
- infer room/area readiness from a round with no captured result;
- treat a read-only UI as evidence of operational adoption.

## My TORO read preparation

The authenticated menu is being extended so the Maintenance profile may read:
- the current daily round;
- ordered pending checks;
- area;
- pending/result state;
- supervisor-review requirement.

Capability:
- `maintenance.priorities`

Source-aware rule:
- current `facilities.inspection_field_capture_v` may promote the capability to READ_ONLY;
- maintenance events remain a fallback read source;
- pass/fail capture remains disabled.

## Next proof

A real maintenance user must:
1. authenticate under the correct employee/position context;
2. read the current round;
3. capture one bounded real check through an explicitly reviewed write path;
4. attach/record required evidence;
5. verify resulting state and any closure/handoff;
6. measure field usability.

Until then workflows 4 and 5 remain RUNNING, not VERIFIED.
