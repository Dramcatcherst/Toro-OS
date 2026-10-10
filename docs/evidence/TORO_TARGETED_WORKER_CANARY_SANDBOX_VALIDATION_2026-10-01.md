# TORO targeted Worker canary — sandbox validation

**Date:** 2026-10-01  
**Branch:** `toro/worker-canary-v1-20261001`  
**Environment:** `dreamteam-recovery-sandbox`  
**Production mutation:** none  
**Persistence:** validation transactions rolled back

## Scope

Validated the exact drafts:

- `supabase/drafts/20260930_toro_control_plane_runtime_v1.sql`
- `supabase/drafts/20261001_toro_targeted_worker_claim_v1.sql`
- paired targeted-worker rollback

## Proven

1. Two separate queued L1 runs can coexist.
2. `toro_claim_execution_run_by_id_v1` claims only the requested run id.
3. The unrelated run remains `queued`.
4. Targeted claim issues fencing token 1.
5. Existing state machine transitions `claimed -> running -> verifying`.
6. `toro_complete_execution_run_v1` atomically:
   - inserts one verified receipt derived from canonical run fields;
   - marks the run `succeeded`;
   - sets verification `passed`;
   - releases the lease.
7. Receipt action/actor/idempotency match the run.
8. Repeating completion after success returns null and creates no duplicate receipt.
9. Targeted claim RPC is unavailable to anon/authenticated and executable by service_role.
10. Atomic completion RPC is unavailable to anon/authenticated and executable by service_role.
11. Outer transaction rollback removes all test state.

Returned result:

```text
targeted_worker_canary_validation = PASS
persistence_state = transaction_rolled_back
targeted_claim_removed_after_rollback = true
```

## Rollback proof

The exact targeted-worker rollback was executed after installing the base + targeted runtime inside a sandbox transaction.

Proven:
- both new targeted-worker RPCs removed;
- base Control Plane RPC remains;
- outer transaction rolled back.

Returned result:

```text
targeted_worker_rollback_validation = PASS
persistence_state = outer_transaction_rolled_back
```

## Not yet proven

- production apply of the two new RPCs;
- Vercel canonical deployment;
- backend secret configuration in canonical Vercel target;
- deployed canary route;
- actual Vercel-originated L1 run;
- runtime-health + canary correlation;
- MCP authenticated QA;
- PUMBA bridge.

## Next gate

CI -> merge -> governed production migration/readback -> canonical Vercel project/config -> runtime-health -> deployed canary -> MCP QA -> PUMBA.
