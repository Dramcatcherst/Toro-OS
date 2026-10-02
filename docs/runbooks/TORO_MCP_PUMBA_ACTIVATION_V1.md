# TORO — MCP + PUMBA Activation Runbook v1

**Status:** PREPARED / NOT ACTIVATED  
**Date:** 2026-10-01  
**Owners:** TORO Governance + TORO Agents + SOBRESITO  
**Prerequisite sequence:** canonical Vercel -> runtime health -> Worker canary -> MCP read QA -> PUMBA bridge

## 1. Purpose

Activate ChatGPT/Work/Dot access to TORO without creating a second Brain, bypassing tenant isolation, or exposing Control Plane writes before read-path isolation is proven.

This runbook begins only after the canonical Vercel project sourced from `Dramcatcherst/Toro-OS` passes:
- exact commit verification;
- protected runtime-health = ready;
- MCP still disabled;
- deployed Worker canary = verified with receipt and externalActions=0.

## 2. Stage A — MCP preview activation

Enable MCP only in an authorized preview first.

Required:
- `TORO_MCP_ENABLED=true`;
- valid HTTPS `TORO_MCP_RESOURCE_URL` ending in `/api/mcp`;
- canonical Brain read gate only if its own authenticated QA prerequisites are satisfied;
- Owner Attention read gate remains independently controlled.

Do not expose Control Plane claim/write tools through MCP in this stage.

Expected core tools remain read-only:
- `get_brain_status`;
- `search_toro`;
- `get_priorities`;
- `get_business_status`;
- `get_pending_decisions`;
- `get_execution_receipts`.

## 3. Stage B — authentication and negative tests

PASS requires all applicable cases:

### No identity
- no bearer token -> denied;
- malformed/expired token -> denied;
- no readable TORO membership -> denied.

### Tenant/scope isolation
- valid identity can read only authorized organization scope;
- wrong `scopeRef` -> denied;
- an identity authorized in org A cannot read org B;
- ambiguous multi-org context must require explicit scope instead of silently picking one;
- personal/client-isolated content remains outside employer/business scope unless policy explicitly permits it.

### Source truth
- stale/unavailable sources are labeled, not invented;
- synthetic fixtures are never returned as business truth;
- read result preserves source authority/freshness where the contract provides it;
- receipts returned by MCP correspond to persisted receipt evidence.

### Capability ceiling
- all MCP v1 tool annotations remain read-only;
- no reservation/rate, accounting, messaging, publication, permission or destructive tool exists;
- no Control Plane claim/transition/receipt-write tool exists in public MCP v1.

## 4. Stage C — receipt and trace correlation

For every MCP QA session capture:
- authenticated TORO scope;
- tool name;
- MCP request correlation id;
- relevant TORO run/receipt refs when the read concerns execution evidence;
- deployment commit SHA;
- observed outcome.

Do not convert a read trace into an execution receipt.

Trace answers:
`how the read/agent flow happened`.

Receipt answers:
`what verified state/action occurred`.

## 5. Stage D — PUMBA read-only bridge

PUMBA begins in **observe/analyze only**.

Allowed:
- read Brain/status;
- read current priorities/Owner Attention where authorized;
- read pending decisions;
- read execution receipts;
- detect stale/failed/missing-verification patterns;
- propose which canonical task should advance next.

Not allowed:
- claim a run;
- create a new authoritative backlog;
- mutate tasks;
- contact external systems;
- write finance/reservation/guest state;
- change permissions;
- publish;
- treat its own conversation as completion evidence.

If MCP or canonical source health is unavailable, PUMBA degrades to read/analyze/prepare and reports the runtime block.

## 6. Stage E — Control Plane bridge

Only after Stage D isolation is clean may PUMBA request governed execution.

Initial ceiling:
- L0 observe;
- L1 read/reconcile/verify.

Execution path:

`PUMBA intent -> canonical task -> targeted/eligible run -> lease/fencing -> bounded worker -> verification -> receipt -> PUMBA reads result`.

PUMBA does not execute material provider actions itself.

### Required controls
- one canonical task home;
- idempotency key;
- run id;
- lease/fencing;
- worker identity;
- verification strategy;
- receipt;
- correlation/trace id;
- cost/time budget;
- failure/dead-letter handling.

## 7. Observation gate

Before any L2 expansion, collect at minimum:
- 10 completed PUMBA-controlled L0/L1 cycles;
- zero duplicate claims;
- zero cross-scope reads;
- zero unreceipted claimed completions;
- zero external actions;
- at least one safe failure/recovery or explicit blocked path;
- stable read/source freshness behavior;
- no need to reactivate legacy Coordinator/Lane architecture.

If any isolation or receipt-integrity failure occurs, stop promotion and return to read-only.

## 8. L2 promotion

L2 may be considered only for reversible internal actions with:
- explicit capability contract;
- readback;
- rollback;
- idempotency;
- bounded scope;
- receipt;
- measured value.

L3 remains human-gated.
L4 remains prohibited unless a new specific authorization changes the contract.

No L2 promotion is implied by completing this runbook.

## 9. Kill switches

Minimum operational kill switches:
- `TORO_MCP_ENABLED=false` disables MCP route;
- worker/canary feature flags remain independently disable-able;
- PUMBA bridge must have its own explicit enabled gate before write-capable integration ships;
- pausing/stopping the Dot does not alter canonical tasks/runs/receipts.

If a kill switch is used, preserve evidence and do not delete runtime history.

## 10. Acceptance

MCP + PUMBA v1 activation is complete only when:
- canonical Vercel deployment is verified;
- Worker canary has a real deployment-originated verified receipt;
- MCP authentication and negative isolation QA pass;
- PUMBA read-only bridge passes;
- PUMBA L0/L1 Control Plane cycles produce valid receipts;
- legacy scheduled execution fan-out remains retired;
- General Plan records only the material promotion result, not every cycle.

## 11. Explicit non-goals

This runbook does not authorize:
- payments or accounting postings;
- reservation/rate/availability writes;
- guest or supplier messages;
- publication/ads;
- legal/fiscal submissions;
- permission/secret changes;
- destructive deletion;
- physical hotel execution;
- permanent additional Dots.
