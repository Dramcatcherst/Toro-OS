# TORO Brain — Product Proof Workflow Board V1

**Status:** CURRENT EXECUTION BOARD  
**Date:** 2026-09-23  
**Parent strategy:** docs/product/TORO_PRODUCT_PROOF_AND_COMMERCIALIZATION_V1.md  
**Rule:** reuse existing pilots, tables, connectors and work items; do not create a parallel project/workflow universe.

## 1. Purpose

This board turns Product Proof into a finite execution program.

A workflow moves through:

NOT_STARTED -> STRUCTURAL -> PREPARED -> RUNNING -> VERIFIED -> MEASURED -> REUSABLE

Definitions:
- **STRUCTURAL:** relevant data/contracts/components exist.
- **PREPARED:** workflow path is designed/configured but blocked or not yet run end-to-end.
- **RUNNING:** real/synthetic approved execution is underway.
- **VERIFIED:** defined business outcome has end-to-end evidence.
- **MEASURED:** outcome/value/failure metrics are captured.
- **REUSABLE:** workflow can be instantiated in another isolated business without customer-specific reconstruction.

Documentation/configuration alone never counts as VERIFIED.

## 2. Current 12-workflow proof set

| # | Workflow | Primary owner | Reuse / current evidence | Current state | Main blocker / next proof |
|---|---|---|---|---|---|
| 1 | Executive daily brief / owner exceptions | TORO | Existing executive-brief UI/capability contracts and executive decision objects | STRUCTURAL | Replace mock/assembled posture with canonical live inputs and prove one daily brief against evidence |
| 2 | Employee self-service / identity request | TORO People + Identity | Existing employees, roles, leave/request structures; identity/context core in main | PREPARED | Protected hosted identity/context QA + reviewed membership production decision; no employee rollout yet |
| 3 | Shift / schedule request or change | TORO People | Existing shift templates, assignments, availability/change/swap structures | STRUCTURAL | Prove one real bounded request from user intent through approval/state update/evidence |
| 4 | Maintenance issue -> assignment -> proof of ready | RICO / Operations | Current maintenance cognitive pilot; facilities maintenance objects; no-delta guard verified | RUNNING | Capture real field result(s), owner, completion evidence and verified closure |
| 5 | Room/area readiness before guest impact | RICO / Operations | Current guest-ready maintenance proof and inspection structures | RUNNING | Convert inspection/maintenance evidence into explicit ready/not-ready outcome and measure prevented/recovered issue |
| 6 | Omnichannel guest inquiry -> useful response | TERE + Comms | WeSpeak active runtime, TERE V3 config, Comms omnichannel contract | PREPARED | Verify runtime consumption + real channel identity/continuity; do not infer support for every channel |
| 7 | Quote -> follow-up -> reservation handoff | TERE + Revenue | TERE sales logic, PMS/Kross authority contract, guest journey proof design; Kross live-read gate rebaselined 2026-09-23 | PREPARED / BLOCKED | Import schema exists, but there is still no verified Kross live transport/run. current_reservations_safe=0; quote additionally requires verified live price/availability authority. See docs/evidence/TORO_KROSS_LIVE_READ_GATE_REBASELINE_2026-09-23.md |
| 8 | In-stay request / complaint -> service recovery | TERE + RICO + Comms | Message-to-task/incident contract, maintenance/tasks/guest structures | STRUCTURAL | Prove one message creates governed work, operational evidence and customer follow-up without duplicate shadow task |
| 9 | Payment reminder / collection communication | FIONA + TERE + Comms | Finance authority model + new customer-lifecycle boundary | PREPARED / BLOCKED | Current authoritative amount/payment state and explicit collection policy/approval; customer-facing tone stays with TERE |
| 10 | Finance reconciliation / cash exception | FIONA | Finance-to-cash pilot data, bank transactions/reconciliations/monthly metrics | PREPARED / BLOCKED | Current bank evidence and semantic reconciliation; historical volume is not current cash |
| 11 | System/connector incident -> recovery evidence | SOBRESITO + Systems | Systems Auditor + connector-health contracts + OpenClaw audit runbook | PREPARED / BLOCKED | Direct authorized runtime audit/health evidence, then prove one degraded/recovery path |
| 12 | Post-stay review/retention or revenue opportunity | SKY + TERE + Growth | Growth/reputation/TERE lifecycle contracts and Product Proof metrics | STRUCTURAL | Prove one attributable opportunity or post-stay/reputation workflow with consent, outcome and measurement |

## 3. Existing proof streams retained

Do not create replacements for these existing streams:

### Guest-ready maintenance
- current strongest live cognitive proof;
- current logical round: MNT-DAILY-P0-P1-20260923;
- reuse for workflows 4 and 5;
- physical evidence remains required.

### Breakfast / F&B
- existing prepared pilot remains valuable;
- do not force it into the 12 merely to satisfy a count;
- use it as an additional operating proof once fresh PMS/Kross entitlement/charges exist;
- first proof remains one service date, not a bulk historical migration.

### People identity/access
- reuse for workflows 2 and 3;
- no employee contact/invites until the current launch/identity gates allow it.

### Guest journey
- reuse for workflows 6, 7 and 8;
- live PMS authority remains a hard gate for current reservation truth;
- do not create a second Kross mirror;
- arrivals/departures may promote only from operations.current_reservations_safe plus governed Kross health;
- quote/availability remains separately blocked until verified live price/availability authority exists.

### Finance-to-cash
- reuse for workflows 9 and 10;
- current/historical evidence must remain semantically separated.

### Systems audit
- reuse existing TORO Systems Auditor and OpenClaw audit runbook for workflow 11;
- do not create a second monitoring/audit system.

## 4. Omnichannel proof rule

For workflows 6–9 and 12, channel count is not success.

Success means one canonical customer relationship/work item continues correctly across permitted channels without:
- duplicate follow-up;
- conflicting price/payment state;
- duplicate tasks;
- lost consent/privacy state;
- shadow customer truth.

Initial proof may use a single verified channel. Multi-channel expansion occurs only after the canonical lifecycle works.

## 5. Measurement contract

Every VERIFIED workflow must add at least:
- business outcome;
- start/end timestamps;
- human interventions;
- owner intervention yes/no;
- source-authority failures;
- retries/duplicates;
- approval count;
- error/rollback state;
- evidence reference;
- time saved or cycle-time delta where measurable;
- revenue/cost/service effect where attributable.

A workflow is MEASURED only after the baseline and actual outcome can be compared.

## 6. Reusability contract

A workflow is REUSABLE only when:
- no Dreamcatcher private identifiers are hard-coded in universal logic;
- tenant/scope isolation is tested;
- business-specific values are configuration, not code;
- source authority is configurable;
- permissions are policy-driven;
- connector substitution is possible at the capability boundary where practical;
- setup steps are documented;
- teardown/offboarding is defined;
- customer-specific engineering is measured.

## 7. Priority order

Current execution order should follow dependency and proof value, not the table number.

### P0
1. maintenance issue / room readiness real closure;
2. hosted identity/context proof;
3. live PMS/Kross read authority for guest journey;
4. current finance/bank authority gap;
5. OpenClaw/runtime audit.

### P1 after P0 gates
6. employee self-service + schedule;
7. guest inquiry + quote/follow-up;
8. in-stay/service recovery;
9. payment communication;
10. finance reconciliation.

### P2
11. executive brief using verified live projections;
12. post-stay/reputation/growth outcome;
13. cross-channel continuity expansion;
14. second-business sandbox portability.

## 8. Product Proof exit signal

The important count is not "12 documented workflows."

The exit signal is:
- at least 12 representative workflows VERIFIED end-to-end;
- material subset MEASURED;
- critical workflows reusable/configurable;
- owner intervention visibly reduced;
- second isolated business can instantiate the core without rebuilding TORO.
