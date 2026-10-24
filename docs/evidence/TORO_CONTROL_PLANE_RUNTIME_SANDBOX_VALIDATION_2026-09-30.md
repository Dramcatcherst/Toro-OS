# TORO Control Plane Runtime v1 — sandbox validation

**Date (Costa Rica):** 2026-09-30  
**Branch:** `toro/control-plane-runtime-v1-20260930`  
**Production mutation:** none  
**Validation environment:** Supabase `dreamteam-recovery-sandbox`  
**Persistence:** transaction rolled back

## Scope

The exact draft at:

`supabase/drafts/20260930_toro_control_plane_runtime_v1.sql`

was executed inside one explicit database transaction with minimal sandbox-only prerequisite tables. The transaction ended with `ROLLBACK`.

This is syntax/behavior evidence for the runtime draft. It is not production readiness by itself and does not replace review, production migration governance or post-apply advisors.

## Assertions proven

1. A queued L1 run can be claimed by one worker.
2. A second worker cannot claim the same leased run.
3. First claim obtains fencing token 1.
4. A failed attempt can resolve to `retry_wait` while below `max_attempts`.
5. Retry claim obtains fencing token 2.
6. Worker A with stale fencing token 1 cannot renew after worker B claims token 2.
7. Valid state transitions complete:
   `claimed -> running -> verifying -> succeeded`.
8. L1 completion requires `verification_status=passed`.
9. A verified receipt with passed verification can be inserted.
10. Receipt update is rejected by the append-only trigger.
11. A receipt cannot declare `status=verified` with `verification_status=pending`.
12. An L4 run cannot be inserted as `queued`.
13. The validation transaction was rolled back.

## Returned validation result

```text
control_plane_runtime_sandbox_validation = PASS
persistence_state = transaction_rolled_back
```

## Not yet proven

- production schema apply;
- production RLS/advisors after apply;
- application worker integration;
- provider readback;
- domain receipt linking;
- actual Dot/agent invocation;
- performance under concurrency/load;
- crash recovery across separate database sessions;
- end-to-end L1/L2 real workflow.

## Next gate

CI/static checks on PR #226, followed by reviewed migration promotion and a non-external runtime worker dry run before any Dot activation or external action.
