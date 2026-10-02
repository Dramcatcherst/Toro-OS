# TORO targeted Worker runtime — production readback

**Date:** 2026-10-01  
**State:** PRODUCTION DATABASE PRIMITIVES VERIFIED  
**Production migration:** `20261002003241_toro_targeted_worker_claim_v1_20261001`

## Applied runtime changes

Service-role-only, SECURITY INVOKER RPCs are now present:

- `public.toro_claim_execution_run_by_id_v1(uuid,uuid,text,integer)`
- `public.toro_complete_execution_run_v1(uuid,text,bigint,jsonb)`

Effective ACL readback:

| RPC | anon | authenticated | service_role |
|---|---:|---:|---:|
| targeted claim | no | no | yes |
| atomic completion | no | no | yes |

Both report `security_definer=false`.

## Production transaction-only probe

The existing canonical runtime-parity task was used only as the foreign-key home for a transaction that was explicitly rolled back.

The probe proved:
1. targeted claim leased only the requested run;
2. an unrelated run remained queued;
3. fencing token was issued;
4. normal transitions reached `verifying`;
5. atomic completion inserted a verified receipt and changed the targeted run to `succeeded/passed`;
6. no external action occurred;
7. transaction rolled back.

Post-rollback readback:

```text
production_transaction_probe = PASS
persisted_runs_after_rollback = 1
persisted_receipts_after_rollback = 1
probe_rows_removed = true
```

The surviving run and receipt are prior verified TORO evidence, not canary data.

## Advisor delta

No new externally callable SECURITY DEFINER warning was produced for these RPCs.

Existing informational findings remain:
- intentional RLS/no-policy posture on server-only execution tables;
- low-volume foreign-key/index performance INFO findings.

No index was added merely to clear an informational warning at the current volume.

## Current gate

Database/runtime primitives are ready for the first application-originated canary.

Application proof remains gated by a canonical Vercel deployment sourced from the canonical TORO repository with verified backend configuration.

The HTTP canary remains disabled by default and has not been invoked in production.
