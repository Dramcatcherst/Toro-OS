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

**BACKEND GUARD — VERIFIED_APPLIED 2026-09-23**
- `facilities.create_daily_maintenance_round(date)` now suppresses duplicate no-delta rollover.
- applied migrations:
  - `20260923083250 maintenance_daily_round_no_delta_guard_20260923`;
  - `20260923083643 maintenance_daily_round_material_delta_guard_20260923`.
- no-delta rollback-only test for 24/09 returned the existing `MNT-DAILY-P0-P1-20260923` and persisted no 24/09 round.
- linked-target-delta rollback-only test returned a new logical `MNT-DAILY-P0-P1-20260924`, proving material changes bypass suppression; rollback persisted no 24/09 round.
- final function MD5: `b014163a2ecb65e2a6211ea19164b2fa`.
- original rollback definition is preserved in `docs/evidence/maintenance_daily_round_prechange_20260923.sql`.
- verification evidence: `docs/evidence/TORO_MAINTENANCE_COGNITIVE_GUARD_VERIFICATION_2026-09-23.md`.
- this proves elimination/simplification of duplicate output; it does **not** prove field execution.

**Autonomy state**
- current: A2/A3 for TORO reasoning/preparation;
- backend duplicate-output suppression: verified automatic guard;
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

**COGNITIVE INTERVENTION R1 — PREPARED / SOURCE-GATED**
Verified 2026-09-23:
- main authority contract defines `operations.breakfast_orders` as the canonical operational workflow;
- `operations.breakfast_prefill_candidates` only marks a reservation `READY_FOR_PREFILL` when the reservation source is live, read-only, synchronized within 6 hours and not cancelled/no-show;
- current main runtime has 0 breakfast orders, 0 prefill candidates and 0 live reservation rows;
- the transition backend contains 27 reconstructed dates from 19/08–18/09;
- 26/27 reconstructed dates are arithmetically consistent;
- reconstructed totals are 391 reported vs 389 calculated; the +2 difference is isolated to 06/09 and remains explicit;
- the daily reconciliation contains 389 payable breakfasts across the reconstructed period;
- all 27 dates are `NOT_SETTLEMENT_AUTHORITY`;
- USD 1,120 is an **estimate only for dates with rate coverage**, not an authorized settlement;
- the Kitchen final daily report is the authoritative source for what was actually served;
- Kross live validated report/API/POS is the required authority for entitlement/charges;
- Kross notification emails remain secondary signals only;
- the existing parity audit already classifies daily transition data as `DERIVED_DUPLICATE` and weekly data as duplicate summary.

**ELIMINATE / DO NOT BUILD**
- do not bulk-migrate reconstructed daily rows into the live workflow merely to fill the table;
- do not create a second POS;
- do not create another daily operational truth;
- do not use stale Kross snapshots as today's breakfast list;
- do not treat arithmetic consistency as settlement authority.

**First live F&B proof**
Prove **one service date only**:

```text
fresh authoritative Kross entitlement/charges
+ kitchen final reviewed served report
-> operations.breakfast_orders
-> derived reconciliation
-> human review
-> evidence
```

Only after one date passes should TORO expand to a complete Monday–Sunday cycle.

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
identity + membership + context isolation + channel/access verification
```

Verified 2026-09-23:
- production `organization_memberships` does not yet exist;
- 5 users have active/non-revoked organization roles;
- all 5 currently belong to only one real organization;
- 4 membership candidates map to an existing employee relationship;
- 1 candidate is non-employee/`other` and must not be classified as owner/contractor/advisor from role alone;
- 12 employees are active: 4 linked to user identity and 8 unlinked;
- current real data contains 0 multi-organization users, so multi-org isolation cannot be claimed from production evidence.

**CURRENT MAIN IMPLEMENTATION STATE — 2026-09-23**
- `resolveToroContext()`, context policy and Supabase SSR auth foundation are now in current `main`;
- current reviewed main head: `280f8e17e8427718bd82a02a55fe0f96a79df049`;
- login/auth verification surface and non-PII `/api/brain/context` diagnostic are in main;
- current main also includes the permission-scoped Visual Brain canonical read adapter `stage-c-read-v1`;
- GitHub Actions run `35856973260` passed npm install, tests, lint and build;
- Vercel status for current main is success;
- earlier auth/context main deployment `dpl_8dQG9Xh8QEbVrJLmA8rcc5JBwvGt` was READY / target production;
- anonymous runtime verification of `/api/brain/context` is intercepted by Vercel Deployment Protection with `login_required` before application execution;
- `organization_memberships` still does not exist in production;
- production continues to use active/non-revoked `user_roles` as transitional organization relationship evidence;
- 5 production users currently have active org roles, but current real data contains no multi-org user, so multi-org behavior remains synthetic-test-only.

**VISUAL BRAIN READ FOUNDATION**
- the first canonical read slice requires active organization context and filters by `org_id`;
- raw canonical UUIDs are replaced by stable hashed projection refs;
- owner names, notes, next actions, raw source IDs and other free-text/private fields are excluded;
- finance, guests, payments and employees are intentionally outside this first slice;
- this is Stage C read infrastructure, not proof of a finished Visual Brain.

**CURRENT VS3 STATE**
`CODE_IN_MAIN_CI_VERIFIED_HOSTED_QA_BLOCKED_BY_DEPLOYMENT_PROTECTION`

Evidence:
`docs/evidence/TORO_CONTEXT_MAIN_VERIFICATION_2026-09-23.md`

**OWNER HOLD**
Employees are not to be contacted, invited or onboarded for this proof yet.

Do not:
- invite the 8 unlinked employees;
- auto-link by name;
- repurpose staff credentials as QA fixtures;
- apply the membership draft to production before isolated validation;
- claim multi-org isolation proven from current real users;
- create another identity/account system.

Existing owner:
- `ops_ws_people_daily_management`;
- `toro_company_user_portal_contract_20260922`;
- existing Phase 1/Tenant/Identity work.

**NEXT proof**
1. obtain an approved protected hosted QA path without weakening Vercel protection;
2. use synthetic/fictitious identities (or Mauricio where explicitly appropriate), not employees;
3. prove personal vs organization isolation in the hosted runtime;
4. prove allowed + denied organization access;
5. prove explicit multi-org context choice with synthetic organizations;
6. prove revocation/logout/session/cookie behavior;
7. prove mobile + desktop behavior;
8. validate `organization_memberships` + RLS in isolation before any production DDL;
9. prove persistent flow/session context before any real onboarding launch.

Real employee onboarding remains outside this proof until a later explicit launch decision.

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
- existing mirror task explicitly reports `sourceIsLive=false` and automatic first export not verified.

**DIAGNOSIS**
Guest-facing design/content exists, but a current operational journey cannot be certified from the canonical mirror while Kross current-state data is stale/non-live.

This is a source-authority constraint, not a reason to create another reservation pipeline.

**FAIL-CLOSED RULE**
- historical/snapshot reservations may support dated analysis;
- they may not be called current availability, current in-house, current arrival/departure or current booking state;
- 0 live rows does not mean 0 guests/reservations;
- do not create a second mirror;
- do not silently route around the Kross authority gate with email, historical Airtable or a browser snapshot.

**Autonomy state**
- A1/A2 only for current-state Guest Journey decisions until live authority is restored;
- higher autonomy requires live/fresh PMS input and a verified E2E journey.

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
- current finance control explicitly states that current August–September bank evidence is incomplete and current reconciliations remain candidate/ambiguous.

**DIAGNOSIS**
The finance model has high historical data volume but cannot yet be treated as current end-to-end cash truth.

This is the finance equivalent of the maintenance finding:

> **data volume is not the same as outcome/current truth**

**FAIL-CLOSED RULE**
Keep these lanes separate:
- PMS production;
- accounting/fiscal record;
- processor/channel settlement;
- bank cash.

Do not:
- present 1,839 historical bank rows as current cash coverage;
- infer cash from PMS payments;
- infer tax filing/payment from accounting reports;
- force ambiguous reconciliations closed;
- create another finance truth/dashboard.

**Autonomy state**
- A1/A2 for cash/current finance claims until current evidence is reconciled;
- higher autonomy requires current bank/accounting evidence, explicit matching semantics and tested exception/rollback behavior.

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

