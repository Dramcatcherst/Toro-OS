# TORO Control Plane Runtime — public server-only surface validation

**Date (Costa Rica):** 2026-09-30  
**Branch:** `toro/control-plane-runtime-production-surface-20260930`  
**Production mutation:** none  
**Validation environment:** Supabase `dreamteam-recovery-sandbox`  
**Persistence:** all validation transactions rolled back

## Why this validation exists

The first Control Plane runtime draft stored execution state inside the `operations` schema.

Production preflight later verified:

- `service_role` has `USAGE` on `public`;
- `service_role` does **not** have `USAGE` on `operations`;
- `authenticated` does have `USAGE` on `operations`.

Granting `service_role` broad schema usage on `operations` merely to run workers would activate a wider existing privilege surface than the Control Plane needs.

The production v1 runtime is therefore narrowed to:

- `public.toro_execution_runs`;
- `public.toro_execution_receipts`;
- `public.toro_execution_run_queue_v1`;
- `public.toro_*execution*_v1` worker RPCs.

The business task/selection authority remains in `operations.tasks` and TORO's existing `operations.toro_*` views.

## Security model

The public schema is used as a Data API/server transport surface, **not** as public user access.

Validated posture:

- RLS enabled on runtime tables;
- no client RLS policies;
- `PUBLIC`, `anon`, `authenticated` table/view privileges revoked;
- `service_role` table privileges reset with `REVOKE ALL` before minimum grants;
- runs: service role = SELECT/INSERT/UPDATE only;
- receipts: service role = SELECT/INSERT only;
- no service-role DELETE/TRUNCATE on either table;
- worker RPCs = `SECURITY INVOKER`, empty `search_path`;
- RPC EXECUTE revoked from clients and granted to `service_role` only.

## Failed validation that improved the design

The first sandbox privilege assertion failed with:

```text
service_role_runtime_privilege_mismatch
```

Cause: Supabase default privileges gave `service_role` broader privileges on new public tables than the draft intended. A narrow `GRANT` does not remove privileges already inherited/defaulted.

Correction applied to the draft:

```text
REVOKE ALL ... FROM service_role;
GRANT only required privileges ... TO service_role;
```

The entire sandbox validation was then rerun from scratch and passed.

## Runtime assertions proven

1. one eligible L1 run is claimed by one worker;
2. a second worker cannot claim the same leased run;
3. first claim obtains fencing token 1;
4. failed attempt resolves to `retry_wait` while below `max_attempts`;
5. retry claim obtains fencing token 2;
6. stale worker/fencing token cannot renew after a new claim;
7. valid transitions complete `claimed -> running -> verifying -> succeeded`;
8. L1 success requires `verification_status=passed`;
9. L0 cannot be inserted as `succeeded/pending`;
10. L4 cannot enter the queueable `queued` state;
11. verified receipt requires passed verification;
12. receipt update/delete path is append-only protected;
13. cross-tenant `(org_id, task_id)` mismatch is rejected by composite FK;
14. runtime tables have RLS enabled;
15. direct `anon/authenticated` table access is absent;
16. `service_role` has exactly the intended table privileges;
17. claim RPC is unavailable to `anon/authenticated` and executable by `service_role`;
18. validation transaction ended with `ROLLBACK`;
19. runtime table was absent after rollback.

Returned result:

```text
control_plane_public_runtime_validation = PASS
persistence_state = transaction_rolled_back
runtime_table_removed_after_rollback = true
```

## Explicit rollback script validation

The exact runtime draft was installed inside a sandbox transaction, then the exact paired rollback file was executed.

Validated removal:

- runtime tables;
- runtime queue view;
- worker RPCs;
- receipt trigger/function;
- upstream composite-FK support indexes.

Returned result:

```text
rollback_script_validation = PASS
persistence_state = outer_transaction_rolled_back
```

## Still not proven

- production migration applied;
- production grants/RLS readback after apply;
- production post-change Security/Performance Advisor delta;
- actual application worker using the service role;
- provider/tool execution;
- domain-receipt linking;
- real Dot invocation;
- real L1/L2 end-to-end task with source readback.

## Next gate

Merge reviewed SQL/doc correction, then apply the additive migration to the canonical Supabase project under a governed migration, read back every object/grant, run advisors, and execute a transaction-only production mechanics probe before any real task or Dot bridge is allowed.
