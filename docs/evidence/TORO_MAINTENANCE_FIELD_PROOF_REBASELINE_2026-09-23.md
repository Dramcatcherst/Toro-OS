# TORO — Maintenance / Room Readiness Field Proof Rebaseline — 2026-09-23

**Product Proof workflows:** #4 Maintenance issue -> assignment -> proof of ready; #5 Room/area readiness before guest impact  
**Current state:** RUNNING — field evidence still required  
**Canonical round:** `MNT-DAILY-P0-P1-20260923`

## Current round

Observed:
- inspection rounds with current key: 1;
- current round status: `ready`;
- checks: 21;
- required for round: 21;
- required for target close: 21;
- PASS: 0;
- FAIL: 0;
- pending: 21;
- captured_at present: 0;
- evidence present: 0;
- supervisor-review checks: 3;
- supervisor confirmations: 0.

Conclusion:

> The workflow structure exists, but physical execution has not yet been captured. Neither workflow #4 nor #5 may be called VERIFIED.

## Closure queue

Observed:
- `reported_resolved`: 12;
- `open_or_unknown`: 9;
- reported-resolved rows with closure evidence ref: 5;
- `verified_closed_at` populated: 0.

This is useful Product Proof material:
- TORO already distinguishes “someone says it is fixed” from “verified closed”;
- closure verification, not additional ticket creation, is the next bottleneck.

## First proof candidate

### Room 2 toilet leak

Existing objects:
- inspection check: `p1-room2-toilet`;
- event: `wa-aseo-20260917-r2-toilet`;
- task: `task-maint-room2-toilet-20260915`;
- event closure state: `reported_resolved`;
- closure evidence ref: `WhatsApp Aseo Hotel Atrapasueños · WA-ASEO-20260917-R2`;
- verified_closed_at: null.

Existing resolution context:
- a part from Room 3 was used;
- leak reportedly persisted;
- sealant was applied;
- Oliver later reported that it was working;
- this report is not sufficient for verified closure.

### Required physical verification

PASS requires:
1. dry visual inspection before test;
2. 3 complete flush cycles;
3. inspect base, connections and seals;
4. wait 10–15 minutes after test;
5. no drip or new moisture;
6. toilet remains stable under normal use;
7. dated general photo plus mechanism evidence;
8. explicit PASS/FAIL and verifier;
9. Room 3 borrowed/missing component remains a separate follow-up and is not auto-closed.

No supervisor review is required for this specific check.

## Product behavior

My TORO is being extended so:
- Owner -> Hotel / Operación can open the maintenance verification queue;
- Maintenance -> Prioridades can open the same governed queue;
- `verify_resolution` cases appear before open/unknown incidents;
- linked inspection pass criteria are shown where available;
- no read-only focus can mark PASS or close an event.

This creates a direct path from owner/maintenance awareness to one finite physical proof without introducing a parallel task list.

## Verification rule

Workflow #4 may advance to VERIFIED only after at least one representative maintenance issue proves:

`issue -> assignment -> reported resolution -> physical test -> evidence -> verified closure`

Workflow #5 additionally requires explicit readiness impact:

`room/area issue -> blocking state -> correction -> readiness checks -> verified ready/not-ready outcome -> evidence`

Room 2 is a strong candidate for workflow #4. It contributes to #5 only if readiness state is explicitly linked and verified.

## Prohibitions

Do not:
- convert `reported_resolved` to `verified_closed` from chat/message alone;
- infer PASS from elapsed time;
- close Room 3 because Room 2 passes;
- create duplicate maintenance tickets for the same material issue;
- release a room from this evidence packet alone;
- modify Kross/reservations from this workflow.
