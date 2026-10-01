# TORO Control Plane Runtime v1

**Status:** IMPLEMENTATION CONTRACT — BRANCH/PRE-PRODUCTION  
**Date:** 2026-09-30  
**Authority:** subordinate to `docs/product/TORO_BRAIN_GENERAL_PLAN.md`, `docs/product/TORO_BRAIN_CONSTITUTION.md` and the verified Supabase knowledge item `toro_master_execution_contract_v1`.

## 1. Decision

TORO already has a canonical portfolio/task layer, execution-selection views, owner-attention view, specialist receipts and a verified master execution contract.

This runtime does **not** create another backlog, plan, approval universe, Brain or source of truth.

It adds the missing durable attempt layer between:

`operations.tasks / execution views -> worker -> tool/provider -> verification -> receipt`

Canonical responsibilities:

- `operations.tasks`: business work object / portfolio task.
- `operations.toro_autonomous_action_queue_v1`: selection of safe eligible work.
- `operations.toro_owner_attention_v1`: single owner-attention projection.
- `operations.execution_runs`: one durable logical execution attempt envelope for a task/action.
- `operations.execution_receipts`: append-only canonical receipt envelope that may reference domain-specific receipts.
- domain receipts such as `finance.payflow_write_receipts`, `integrations.communication_channel_receipts` and `public.employee_action_receipts`: retain domain detail and authority.
- Dots: persistent mission workers that consume governed work; they do not own state.
- agents/workers: bounded executors for one run.
- Supabase: canonical runtime state.
- GitHub: implementation contracts/code.
- external systems: retain transactional authority in their domains.

## 2. Why this layer is required

Current TORO can classify and prioritize work, but a selector view is not a durable worker runtime.

A correct runtime must prevent:

- two workers executing the same write;
- blind retries after unknown provider state;
- a Dot claiming completion without readback;
- a task being marked done because a draft/PR/queue item exists;
- receipts becoming narrative claims without evidence;
- worker crashes leaving permanent locks;
- specialist receipts fragmenting the global audit trail.

## 3. Canonical flow

```text
Intent / Trigger
      |
      v
operations.tasks
      |
      v
TORO execution-selection views
      |
      v
Policy + authority level
      |
      +------ L3/L4 ------> owner attention / blocked
      |
      v
operations.execution_runs
      |
      v
atomic lease + fencing token
      |
      v
Dot / Agent / Worker
      |
      v
Tool / MCP / Provider
      |
      v
readback / verification
      |
      v
operations.execution_receipts
      |
      +--> domain receipt reference
      +--> trace/correlation IDs
      +--> evidence references
      |
      v
task/Brain projection
```

## 4. Two different risk concepts

TORO already uses `RiskLevel = Low | Medium | High | Critical` for business/operational severity.

The verified master execution contract uses L0-L4 for **execution authority**.

They are not aliases and must not be collapsed.

- **L0 Observe:** no state change.
- **L1 Read / reconcile / verify:** read-only reasoning and evidence collection.
- **L2 Reversible internal preparation / explicitly delegated low-risk control:** bounded, idempotent and reversible.
- **L3 Human gate:** material external effect, high/critical consequence, money, guest/reservation, publication, access or explicit approval requirement.
- **L4 Prohibited unless specifically authorized:** actions outside current capability contract.

The TypeScript compatibility mapping in `src/lib/control-plane-contracts.ts` converts existing `ActionLevel` + `RiskLevel` + external-impact information into this authority level without replacing the existing domain-risk type.

## 5. Run state machine

```text
queued
  -> claimed
  -> running
  -> verifying
  -> succeeded

queued/claimed/running/verifying
  -> blocked
  -> failed
  -> cancelled

failed
  -> retry_wait
  -> claimed

failed/retry_wait
  -> dead_letter
```

Terminal states:
- succeeded
- blocked
- dead_letter
- cancelled
- superseded

No terminal state may silently return to running.

## 6. Lease and fencing contract

Every worker claim must be atomic.

The draft SQL uses:

- `FOR UPDATE SKIP LOCKED`;
- `lease_owner`;
- `lease_expires_at`;
- monotonically increasing `fencing_token`;
- bounded lease duration;
- compare-and-swap style token checks for renewals/transitions.

A worker that loses its lease must stop writing results for that run.

A lease is execution coordination only. It never grants business authority.

## 7. Idempotency

Every material run has an organization-scoped `idempotency_key`.

Before an external write, the executor must determine whether a verified successful receipt already exists for the same logical action.

Unknown provider state after a timeout is not a retry signal. It is a reconciliation/verification state.

## 8. Receipt envelope

`operations.execution_receipts` is an append-only global envelope.

It does not replace specialist receipts. It references them.

Minimum receipt content:

- run/task/action identity;
- actor and Dot/agent refs when relevant;
- correlation and trace IDs;
- authority level and business risk;
- desired state;
- before state;
- executed state;
- observed after state;
- verification method/status;
- evidence references;
- provider/external reference;
- domain receipt reference;
- error classification when relevant;
- optional integrity hash;
- optional superseded receipt.

A receipt without verification must not be presented as verified completion.

## 9. Dots contract

A ChatGPT Dot is a persistent mission worker, not a database, queue, approval engine or Brain.

For PUMBA and future Dots:

1. refresh canonical TORO context;
2. select eligible work from governed projections;
3. create/claim a bounded run;
4. invoke bounded agent/worker behavior;
5. verify;
6. write receipt;
7. release/close the run;
8. continue only while another safe eligible item exists.

Dots may never maintain a parallel hidden backlog as authoritative state.

## 10. Agent contract

Each execution worker must declare:

- actor/agent identity;
- accepted action types;
- allowed tools;
- authority ceiling;
- retry policy;
- verification strategy;
- receipt requirements;
- cost/time budget;
- fallback/escalation behavior.

Worker count is capacity, not organizational structure.

## 11. Approvals

The runtime does not make `public.approval_requests` the universal TORO approval authority.

Current canonical human attention is projected through `operations.toro_owner_attention_v1` and current business decisions remain in `operations.executive_decisions`.

A run may reference the applicable decision/gate. A future generic approval migration must consolidate rather than create a second owner-decision queue.

## 12. Security posture

Initial tables are server-mediated:

- RLS enabled;
- no direct `anon`/`authenticated` DML grants;
- worker RPCs executable only by `service_role`;
- no secrets/raw credentials in metadata, errors or receipts;
- errors must be redacted;
- evidence is referenced, not copied indiscriminately.

This follows the existing TORO pattern for sensitive runtime tables.

## 13. Queue strategy

Phase 1 does not replace the existing autonomous selection views with Supabase Queues.

First prove leasing, fencing, idempotency and receipts over current canonical work.

After that, Supabase Queues/pgmq may transport run IDs when asynchronous scale justifies it. The database tables remain canonical run state even if transport changes.

This avoids prematurely creating both a queue state and a run state as competing truth.

## 14. Pilot sequence

### Stage A — contract
- TypeScript state/authority contracts.
- SQL draft + rollback.
- tests.
- no production apply.

### Stage B — schema validation
- validate DDL and security on an approved non-production path or reviewed production migration window;
- run Supabase security/performance advisors;
- verify grants/RLS;
- verify rollback.

### Stage C — dry-run worker
Use a synthetic/internal non-external action:
- enqueue one run;
- claim from worker A;
- prove worker B cannot claim same run;
- expire/renew lease behavior;
- transition through verifying;
- insert receipt;
- prove receipt immutability;
- close run.

### Stage D — first real workflow
Choose a read/reconcile/prepare task from `toro_autonomous_action_queue_v1`, preferably L1/L2 and with no guest/money/provider write.

### Stage E — Dot bridge
Connect PUMBA to read/select/create/claim/receipt operations through a bounded TORO capability.

## 15. Definition of done for runtime v1

Runtime v1 is not complete until:

- schema is reviewed and applied through a governed migration;
- relevant advisors pass or findings are explicitly dispositioned;
- duplicate worker claim is prevented;
- stale worker fencing is proven;
- retry/dead-letter behavior is bounded;
- at least one end-to-end dry run has a verified receipt;
- one real L1/L2 workflow completes with readback;
- Brain/Owner Attention can project run/receipt state without synthetic claims;
- rollback/recovery is documented and tested;
- no existing domain receipt or task authority was broken.

## 16. Explicit non-goals

This change does not:

- enable autonomous money movement;
- change reservations/rates/availability;
- publish externally;
- widen permissions;
- activate production Dots;
- merge or close existing PRs automatically;
- replace Kross/Alegra/domain authority;
- replace the current General Plan;
- create another Brain or task registry.
