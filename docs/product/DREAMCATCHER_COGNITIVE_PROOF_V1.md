# Dreamcatcher — TORO Brain Cognitive Proof v1

**Status:** CURRENT PROVING-GROUND SPEC  
**Date:** 2026-09-23  
**Master:** TORO Brain General Plan  
**Method:** TORO Brain Cognitive Operating Model v1  
**Scope:** Dreamcatcher Hotel / first live proving ground  
**Rule:** This is a proof/evaluation specification. It creates no new project, task engine, subsystem, database or public agent.

---

## 1. Purpose

Prove that TORO Brain can do more than collect information, generate plans or automate outputs.

Dreamcatcher must demonstrate that TORO can:

1. understand an end-to-end value stream from real evidence;
2. identify the actual constraint;
3. avoid unnecessary/duplicate work;
4. choose the smallest useful intervention;
5. coordinate human + system execution inside permissions;
6. verify business/operational outcomes;
7. standardize what works;
8. increase autonomy only after evidence;
9. reduce autonomy when evidence or source quality degrades;
10. learn without creating another backlog or parallel system.

Canonical cognitive loop:

```text
Scope
-> Understand
-> Map
-> Baseline
-> Diagnose
-> Choose
-> Design
-> Execute / Experiment
-> Verify
-> Standardize
-> Automate
-> Autonomize
-> Learn
-> Repeat
```

---

## 2. Five proving value streams

### VS1 — Guest-ready physical operation / maintenance

Flow:

```text
signal / maintenance event
-> triage
-> prioritize
-> field packet
-> physical inspection
-> repair / no-repair decision
-> functional test
-> housekeeping QA
-> verified closure
-> recurrence / learning
```

**CURRENT verified 2026-09-23**
- 163 maintenance events in canonical facilities data.
- 106 active events remain `open_or_unknown`.
- 15 inspection rounds / 103 inspection checks exist.
- current round `MNT-DAILY-P0-P1-20260923`: 21 checks, all 21 pending.
- rounds 20260921, 20260922 and 20260923 each contain the same 21-check pattern and all remain 21/21 pending.
- current execution task: `maintenance_daily_p0_p1_round`, ACTIVE / CLEAR / structurally ready.
- human-field queue already includes the maintenance round.
- Kross current-state snapshot is stale; room/guest presence must be checked in the live PMS process before any presence-dependent physical action.

**DIAGNOSIS**
The primary constraint is no longer planning or packet preparation.

TORO is producing repeated daily execution packets faster than the physical loop is generating evidence/outcomes.

Baseline for this proof:

```text
prepared daily rounds observed: 3
prepared checks: 63
PASS results: 0
FAIL results: 0
current verified field outcomes from those rounds: 0
```

This is the first canonical example of:

> **output automation without outcome execution**

**COGNITIVE INTERVENTION R1**
- preserve historical rounds as evidence;
- do not infer completion or mutate physical facts;
- maintain one dispatchable logical current round;
- if the current round remains 100% pending and there is no material change in risk, location, source evidence or required checks, **do not create another equivalent next-day round**;
- update/roll forward the current logical packet instead of multiplying open work;
- a new round is justified only by:
  - material delta;
  - prior round execution/result;
  - changed scope;
  - changed priority/risk;
  - explicit operational reset.
- physical execution remains human;
- TORO may prioritize, prepare, reconcile, validate evidence and close only according to existing closure rules.

**First proof target**
Use `MNT-DAILY-P0-P1-20260923` as the single current execution packet.

Proof completes only when:
- every required check has an explicit result or explicit blocked/not-reviewed reason;
- PASS/FAIL claims have responsible + dated evidence;
- supervisor-required checks have supervisor state;
- linked events are not closed from “reported resolved” alone;
- duplicate round generation is suppressed when no material delta exists;
- the next round, if created, is justified by new evidence or a completed/changed prior cycle.

**Outcome metrics**
- checks completed / required;
- PASS / FAIL / blocked;
- verified closures;
- median/maximum time signal -> verified closure;
- recurrence after verified closure;
- supervisor review backlog;
- duplicate-equivalent rounds created;
- human field minutes / verified closure;
- guest-ready risk items remaining.

**Autonomy state**
- current: A2/A3 for TORO reasoning/preparation;
- physical work: human execution;
- verified state changes may progress toward A4/A5 only after evidence and policy tests.

---

### VS2 — Breakfast / F&B -> settlement

Flow:

```text
reservation / demand
-> breakfast/F&B eligibility or order
-> Kross posting
-> kitchen preparation
-> served / not consumed / house / Mauricio / extras classification
-> daily reconciliation
-> weekly settlement
-> invoice
-> payment
-> accounting reconciliation
```

**CURRENT verified**
Canonical main runtime:
- `operations.breakfast_orders`: 0 rows.
- `operations.breakfast_prefill_candidates`: 0 rows.
- live Kross reservations in canonical mirror: 0.

Specialized transition backend:
- 27 daily breakfast reports;
- 27 Kross daily snapshots;
- 27 service daily logs;
- 54 menu-history rows;
- 52 operating facts;
- 3 source archives;
- 6 Kross aliases;
- breakfast weekly reconciliation view currently exposes 5 rows;
- latest daily record observed: 2026-09-18.

Evidence quality:
- 27/27 daily operational projection parity previously verified against the transitional Airtable source;
- source service logs are historical/manual reconstruction and explicitly non-authoritative until direct Kross comparison;
- main canonical live order/pre-fill pipeline is not operating yet.

**DIAGNOSIS**
This stream has strong historical/process knowledge but a gap between:
- evidence/parity;
- current operational event capture;
- live authoritative reservation/Kross input.

**NEXT proof after VS1**
- map exact current-state daily workflow;
- eliminate duplicate reporting;
- establish one live event/order contract;
- feed daily reconciliation from governed inputs;
- preserve manual review until current Kross source is live/fresh enough;
- verify one full Monday-Sunday cycle through settlement without duplicate counting.

Existing tasks reused:
- `fnb_costing_complete_2026_09`;
- `fnb_settlement_invoicing_sop_2026_09`;
- `fnb_october_kitchen_handoff_2026_09`;
- `ops_ws_fnb_handoff`;
- `kross_readonly_reservation_mirror_2026_09`.

No new F&B project/task is created by this proof.

---

### VS3 — People -> identity -> role -> shift -> attendance -> operational access

Flow:

```text
person / employment relationship
-> canonical identity
-> organization membership
-> role
-> onboarding
-> channel/tool access
-> schedule
-> attendance
-> work / evidence
-> offboarding / learning
```

**CURRENT verified**
- 12 active employees.
- 4 active employees currently linked to a TORO user identity.
- 8 active employees remain unlinked.
- 271 shift assignments.
- 495 attendance-day records.
- 1,374 raw punches.

**DIAGNOSIS**
People/attendance data is materially more mature than identity/onboarding/access.

Constraint:
```text
identity + membership + channel/access verification
```

Existing owner:
- `ops_ws_people_daily_management`;
- existing Phase 1/Tenant/Identity work.

**NEXT proof**
Complete one person end-to-end without duplicating identity, then prove:
- allowed access;
- denied access;
- persistent onboarding state;
- no cross-scope leakage;
- operational closeout/notification.

Do not scale onboarding to the rest of staff until one complete flow passes.

---

### VS4 — Demand / booking -> stay -> post-stay

Flow:

```text
demand
-> discovery
-> availability/rate
-> booking
-> confirmation
-> pre-arrival
-> arrival/check-in
-> stay
-> issue/service recovery
-> checkout
-> review/retention
```

**CURRENT verified**
- 33 guests in canonical runtime.
- 33 reservation snapshots.
- 24 guest-message templates.
- 0 canonical stays.
- 0 live reservation rows.
- latest reservation snapshot observed: 2026-09-21 09:28:30.675+00.

**DIAGNOSIS**
Guest-facing design/content exists, but a current operational journey cannot be certified from the canonical mirror while Kross current-state data is stale/non-live.

**GATE**
Reuse:
- `kross_readonly_reservation_mirror_2026_09`;
- `rev_ws_kross_truth`;
- current TERE/guest contracts.

No second reservation mirror.

---

### VS5 — Reservation/production -> accounting -> settlement -> cash

Flow:

```text
reservation / PMS production
-> invoice/accounting evidence
-> processor/channel settlement
-> bank movement
-> reconciliation
-> period close
-> management result
```

**CURRENT verified**
- 26 bank statements.
- 1,839 bank transactions.
- 2,121 PMS payment records.
- 4 reconciliation records.
- 9 monthly-metric rows.
- latest canonical bank transaction date observed: 2026-07-31.
- existing current finance tasks explicitly report missing/current external evidence and scope-reconciliation work.

**DIAGNOSIS**
The finance model has high data volume but cannot yet be treated as current end-to-end cash truth.

Existing owners:
- `finance_accounting_reset_2026_09_15`;
- `finance_ws_cash_accounting_current`;
- `occ_sep_oct_daily_revenue_dashboard_20260825` / Performance Intelligence.

No separate finance dashboard truth is created.

---

## 3. Proof order

Current proof order is evidence-driven:

1. **VS1 Guest-ready physical operation / maintenance**
   - live today;
   - current execution packet exists;
   - no external API write required;
   - exposes a concrete output-vs-outcome failure;
   - can prove eliminate/simplify/verify discipline immediately.

2. **VS2 Breakfast / F&B**
   - strongest historical/parity baseline;
   - recurring weekly economics;
   - missing live canonical event capture is explicit and measurable.

3. **VS3 People / onboarding**
   - rich HR/attendance data;
   - identity/access gap is the limiting constraint;
   - first-person E2E proof before staff-wide rollout.

4. **VS4 Guest journey**
   - commercially critical;
   - blocked for current-state proof by Kross freshness/live authority.

5. **VS5 Finance-to-cash**
   - high value/high risk;
   - large historical data volume;
   - requires current external bank/accounting evidence and reconciliation before closed-loop claims.

This order may change only when evidence changes.

---

## 4. Cognitive proof scoreboard

Each value stream receives state by stage, not one fake overall percentage.

Allowed stage states:
- `NOT_MAPPED`
- `MAPPED`
- `BASELINED`
- `DIAGNOSED`
- `INTERVENTION_DESIGNED`
- `EXECUTING`
- `OUTCOME_VERIFIED`
- `STANDARDIZED`
- `AUTOMATED`
- `AUTONOMY_ELIGIBLE`
- `BOUNDED_AUTONOMY`
- `CLOSED_LOOP_PRO`
- `BLOCKED`

Initial assessment:

| Value stream | Current cognitive state | Main constraint |
|---|---|---|
| VS1 Guest-ready maintenance | EXECUTING, outcome not verified | physical execution/evidence |
| VS2 Breakfast/F&B | BASELINED / DIAGNOSED | live canonical event capture + Kross freshness |
| VS3 People/onboarding | MAPPED / BASELINED | identity/membership/access E2E |
| VS4 Guest journey | MAPPED / BLOCKED | live/fresh PMS reservation authority |
| VS5 Finance-to-cash | MAPPED / PARTIAL BASELINE / BLOCKED | current external evidence + reconciliation |

---

## 5. Anti-output rule

A recurring automation must not be considered healthy merely because it produces its scheduled artifact.

Before creating a repeated output, TORO asks:

1. Did the previous output get consumed/executed?
2. Did any material input change?
3. Does a new artifact change the action?
4. Would another artifact create duplicate work or attention debt?
5. Can the existing state simply roll forward?

If:
- previous packet remains unexecuted;
- scope/checks are materially identical; and
- no new risk/evidence/priority delta exists,

then the default is:

> **do not create another equivalent work packet.**

Retain historical evidence and update the logical current state.

This principle applies beyond maintenance:
- repeated reports;
- repeated payment reminders;
- repeated data audits;
- repeated owner questions;
- repeated backlog creation;
- repeated system-health notices.

---

## 6. Definition of first proof success

Dreamcatcher Cognitive Proof R1 succeeds when:

1. VS1 closes at least one real field cycle with evidence rather than another generated plan;
2. duplicate-equivalent maintenance round creation is suppressed under no-delta conditions;
3. before/after metrics are visible;
4. at least one linked maintenance event moves correctly through evidence-based closure or remains open for a documented reason;
5. the learning is written back into the existing OPERATE control contract;
6. no new project/task/database is introduced for the proof;
7. subsequent value-stream work starts from verified VS1 learning rather than another broad audit.

---

## 7. Existing TORO ownership

- TORO Core / General Plan — proof sequencing and cross-stream reasoning.
- RICO / TORO Operations — VS1 execution and physical operations.
- TERE / TORO Guests + Revenue — VS4.
- FIONA / TORO Finance + People — VS3/VS5 finance/admin boundaries.
- SKY / TORO Growth — demand drivers feeding VS4.
- SOBRESITO / TORO Systems/Data — source health, connectors, evidence, automation.
- TORO Governance — autonomy and permission gates.

Normal users continue to experience one TORO.

---

## 8. NEXT

1. Register this proof contract in the General Plan and `toro-context.yaml`.
2. Update the existing OPERATE control rule with no-delta rollover suppression.
3. Do **not** alter historical inspection results or simulate field work.
4. Use `MNT-DAILY-P0-P1-20260923` as the current maintenance proof packet.
5. Await/collect real field results through the existing human workflow.
6. On evidence arrival:
   - verify PASS/FAIL;
   - update existing event/task states;
   - measure closures/time/recurrence;
   - assess A2/A3 -> A4/A5 promotion eligibility.
7. Then start VS2 F&B current-state map using existing tasks and historical evidence.

