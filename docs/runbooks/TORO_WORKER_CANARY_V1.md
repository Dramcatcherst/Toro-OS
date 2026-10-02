# TORO Worker Canary v1

**Status:** READY FOR DEPLOYMENT QA — DISABLED BY DEFAULT  
**Date:** 2026-10-01  
**Canonical task:** `toro_surface_capability_parity_20260922`  
**Execution authority:** L1 read/reconcile/verify only

## Purpose

Prove that the deployed TORO application can use the production Control Plane Worker Runtime end to end without claiming unrelated work or performing an external action.

## Safety design

The canary does not use the generic next-run claimant.

It creates one idempotent run tied to the canonical runtime-parity task and claims that **exact run id** through `toro_claim_execution_run_by_id_v1`.

This prevents a deployment smoke test from accidentally leasing normal business work.

Successful completion is atomic:
- run must already be `verifying`;
- worker id + fencing token + unexpired lease must match;
- a verification receipt is inserted from the canonical run fields;
- the run becomes `succeeded/passed` in the same database transaction.

## Route

`POST /api/system/worker-canary`

Default:
- `TORO_WORKER_CANARY_ENABLED != true` -> 404;
- missing/wrong canary bearer token -> 401;
- missing org/task/commit config -> 503.

Required deployment-only configuration:
- `TORO_WORKER_CANARY_ENABLED=true` during the authorized QA window;
- `TORO_WORKER_CANARY_TOKEN` backend secret;
- `TORO_WORKER_CANARY_ORG_ID`;
- `TORO_WORKER_CANARY_TASK_ID`;
- Vercel-provided `VERCEL_GIT_COMMIT_SHA`;
- valid TORO worker Supabase configuration.

Current canonical target references:
- org: Dreamcatcher canonical organization;
- task key: `toro_surface_capability_parity_20260922`.

Do not store IDs/tokens as client-side variables.

## Canary behavior

1. Build idempotency key from deployed Git commit.
2. If the same commit already has a succeeded/passed canary, return `replayed`; do not create work.
3. Insert one L1/Low run with `externalActions=0`.
4. Claim that exact run id.
5. Transition `claimed -> running`.
6. Read only:
   - `public.toro_execution_runs` count;
   - `public.toro_execution_receipts` count.
7. Transition `running -> verifying`.
8. Atomically insert verification receipt and mark run `succeeded/passed`.
9. Return only run id, receipt id, commit SHA and `externalActions=0`.

On failure, best-effort transition to failed/dead-letter. No external system is contacted.

## Acceptance

PASS requires:
- exact deployed commit identified;
- canary endpoint authenticated;
- targeted claim returns inserted run only;
- fencing token present;
- both Control Plane reads succeed;
- atomic receipt + success completes;
- readback shows one succeeded/passed run and matching verified receipt;
- second call for same commit returns replayed;
- no external action;
- MCP remains disabled during this phase.

Only after PASS:
- begin authenticated MCP read isolation QA;
- then bridge PUMBA to the Control Plane.

## Rollback

Disable `TORO_WORKER_CANARY_ENABLED`. The route returns 404 and no new canary can be created. Existing run/receipt remain audit evidence.
