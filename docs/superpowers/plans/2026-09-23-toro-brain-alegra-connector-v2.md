# TORO Brain Alegra Connector v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the read-only Alegra connector path inside TORO Brain with idempotent ingestion, canonical reconciliation checkpoints, fail-closed runtime behavior, and verifiable Dropbox backup.

**Architecture:** Extend the existing local `toro-openclaw-integration` worktree rather than creating another connector. Alegra source reads are normalized into TORO Brain canonical identities and checkpoints; Supabase owns reconciliation state, Airtable owns human exceptions, and Dropbox owns immutable source snapshots/evidence.

**Tech Stack:** Node.js ESM, OpenClaw plugin runtime, Supabase/Postgres, Airtable MCP, Dropbox, existing TORO Finance Guard contracts.

**Spec:** `docs/superpowers/specs/2026-09-23-toro-brain-alegra-connector-v2-design.md`

## Global Constraints

- Single TORO Brain; no parallel finance project, ledger, graph, or source of truth.
- v2 is READ ONLY toward Alegra.
- Direct Alegra transport is currently `BLOCKED_RUNTIME_FORBIDDEN`; tests must use injected fakes/fixtures until an authorized runtime exists.
- Existing R13-R15 modules in local `toro-openclaw-integration` must be reused, not recreated.
- No secrets in Airtable, WhatsApp, frontend, Calendar, test fixtures, logs, or Dropbox.
- Do not promote `PAYMENT_RECORDED_ALEGRA` to verified settlement without bank/provider evidence.
- Empty/error source responses never overwrite last known good state.
- Personal/mixed scope never enters Dreamcatcher OPEX without explicit evidence.
- Backup states are PREPARED, EXTERNAL_UPLOADED, INTEGRITY_VERIFIED, RESTORE_TESTED; each transition requires evidence.
- No POST/PUT/PATCH/DELETE to Alegra.

## Review Focus

1. Provider returns HTTP/auth error after a successful checkpoint: connector must preserve checkpoint and mark freshness BLOCKED.
2. Provider returns an empty list unexpectedly: connector must distinguish valid empty page from transport/schema failure and never zero known balances on ambiguity.
3. Same native bill arrives from bootstrap and incremental/event path: one canonical object only.
4. One payment partially settles a bill: residual amount remains open and state becomes PARTIAL.
5. Personal/mixed entity record resembles a hotel vendor: it stays quarantined until scope evidence is explicit.

---

### Task 1: Read-only transport boundary

**Files:**
- Modify: `scripts/whatsapp-internal/alegra-service-write-adapter.mjs`
- Modify: `scripts/whatsapp-internal/alegra-write-host.mjs`
- Create: `tests/alegra-read-transport.test.mjs`

**Interfaces:**
- Consumes: existing trusted host/injection pattern from R13.
- Produces: `createAlegraReadClient({ transport, companyScope, clock })` with methods `getBillsPage`, `getOutgoingPaymentsPage`, `getBanks`, `getReconciliations`, `getCostCenters`, `getPayablesSummary`, `listExportables`.

- [ ] **Step 1: Write failing tests for GET-only behavior**

Tests must assert:
- every method passes company scope;
- no write method exists;
- transport error returns typed `ALEGRA_TRANSPORT_BLOCKED`;
- secrets are absent from returned/logged error objects.

Run: `node --test tests/alegra-read-transport.test.mjs`  
Expected: FAIL because `createAlegraReadClient` does not exist.

- [ ] **Step 2: Implement minimal read client**

Use injected transport only. The adapter must reject any method other than GET-equivalent reads. Return normalized envelopes:

```js
{
  ok: true,
  resource: "bills",
  items: [...],
  sourceCursor: "...",
  sourceCheckedAt: "ISO"
}
```

and on failure:

```js
{
  ok: false,
  code: "ALEGRA_TRANSPORT_BLOCKED",
  retryable: false,
  sourceCheckedAt: "ISO"
}
```

No credentials or raw Authorization headers may appear in envelopes.

- [ ] **Step 3: Run tests**

Run: `node --test tests/alegra-read-transport.test.mjs`  
Expected: PASS.

- [ ] **Step 4: Run existing Alegra adapter/host suites**

Run: `node --test tests/alegra-invoice-preparation.test.mjs tests/alegra-document-intake.test.mjs tests/alegra-message-receiver.test.mjs`  
Expected: all existing tests PASS.

- [ ] **Step 5: Commit**

`git add scripts/whatsapp-internal/alegra-service-write-adapter.mjs scripts/whatsapp-internal/alegra-write-host.mjs tests/alegra-read-transport.test.mjs && git commit -m "feat: add read-only Alegra transport boundary"`

### Task 2: Canonical normalization and idempotency

**Files:**
- Create: `scripts/whatsapp-internal/alegra-read-normalizer.mjs`
- Create: `tests/alegra-read-normalizer.test.mjs`

**Interfaces:**
- Consumes: envelopes from `createAlegraReadClient`.
- Produces: `normalizeAlegraObject({ tenantId, resourceType, nativeObject })` returning `canonicalKey`, `nativeId`, `sourceUpdatedAt`, `sourceHash`, `entityScope`, `payload`.

- [ ] **Step 1: Write failing tests**

Cases:
- same object twice => same `canonicalKey`;
- changed native timestamp/hash => same object identity with new source version;
- missing native ID => fail closed `ALEGRA_NATIVE_ID_REQUIRED`;
- personal/mixed scope => `entityScope.status = "NEEDS_VERIFICATION"`;
- amount/currency remain native and are never FX-converted implicitly.

Run: `node --test tests/alegra-read-normalizer.test.mjs`  
Expected: FAIL because module does not exist.

- [ ] **Step 2: Implement deterministic normalizer**

Canonical identity must be based on `tenantId + resourceType + nativeId`; source version/hash is stored separately and must not create a second economic object.

- [ ] **Step 3: Run tests**

Run: `node --test tests/alegra-read-normalizer.test.mjs`  
Expected: PASS.

- [ ] **Step 4: Commit**

`git add scripts/whatsapp-internal/alegra-read-normalizer.mjs tests/alegra-read-normalizer.test.mjs && git commit -m "feat: normalize Alegra reads into canonical identities"`

### Task 3: Checkpoint and fail-closed ingestion

**Files:**
- Create: `scripts/whatsapp-internal/alegra-read-sync.mjs`
- Create: `tests/alegra-read-sync.test.mjs`

**Interfaces:**
- Consumes: read client + normalizer + injected checkpoint store.
- Produces: `runAlegraReadSync({ tenantId, resources, readClient, checkpointStore, canonicalStore })`.

- [ ] **Step 1: Write failing tests**

Cases:
- successful page advances checkpoint after canonical write succeeds;
- transport failure leaves prior checkpoint unchanged;
- schema failure leaves prior canonical rows unchanged;
- repeated page replay is idempotent;
- ambiguous empty response does not erase existing open balances;
- valid final empty page after explicit provider cursor semantics completes sync.

Run: `node --test tests/alegra-read-sync.test.mjs`  
Expected: FAIL.

- [ ] **Step 2: Implement sync orchestrator**

Order per object:
1. read source page;
2. validate envelope;
3. normalize;
4. upsert canonical object idempotently;
5. record source version/hash;
6. advance checkpoint only after all writes for the page succeed.

On error, persist runtime health `BLOCKED` through injected status writer, never mutate source/accounting truth.

- [ ] **Step 3: Run tests**

Run: `node --test tests/alegra-read-sync.test.mjs`  
Expected: PASS.

- [ ] **Step 4: Commit**

`git add scripts/whatsapp-internal/alegra-read-sync.mjs tests/alegra-read-sync.test.mjs && git commit -m "feat: add fail-closed Alegra read sync"`

### Task 4: Reconciliation state machine

**Files:**
- Create: `scripts/whatsapp-internal/alegra-reconciliation.mjs`
- Create: `tests/alegra-reconciliation.test.mjs`

**Interfaces:**
- Consumes: canonical Alegra bill/payment objects and optional bank/provider evidence.
- Produces: `reconcileAccountingObject(input)` returning state, residual balance, evidence requirements, and reasons.

- [ ] **Step 1: Write failing tests**

Pin these transitions:
- open bill => `OPEN_IN_ALEGRA`;
- outgoing payment only => `PAYMENT_RECORDED_ALEGRA`;
- outgoing payment + matching bank => `BANK_MATCHED`;
- partial payment => `PARTIAL` with exact residual;
- reversal after match => `REVERSED`;
- payment/provider mismatch => `DISPUTED`;
- no bank/provider evidence => never `RECONCILED`.

Run: `node --test tests/alegra-reconciliation.test.mjs`  
Expected: FAIL.

- [ ] **Step 2: Implement pure state machine**

No I/O in this module. Currency must match; no implicit FX. Residual balances use source currency precision.

- [ ] **Step 3: Run tests**

Run: `node --test tests/alegra-reconciliation.test.mjs`  
Expected: PASS.

- [ ] **Step 4: Commit**

`git add scripts/whatsapp-internal/alegra-reconciliation.mjs tests/alegra-reconciliation.test.mjs && git commit -m "feat: add Alegra reconciliation state machine"`

### Task 5: Backup manifest and snapshot builder

**Files:**
- Create: `scripts/whatsapp-internal/alegra-backup-batch.mjs`
- Create: `tests/alegra-backup-batch.test.mjs`

**Interfaces:**
- Consumes: canonical read envelopes/source payloads.
- Produces: `prepareAlegraBackupBatch({ tenantId, period, snapshots, clock })` returning files + manifest + hashes; it must not upload itself.

- [ ] **Step 1: Write failing tests**

Cases:
- deterministic raw paths by date/resource/native ID;
- manifest contains tenant, source, period, object count, schema version, checkpoint, hashes;
- secret-looking keys such as authorization/token/password are rejected/redacted before batch creation;
- empty batch is valid only when source read completed successfully;
- state starts at `PREPARED`, never `EXTERNAL_UPLOADED`.

Run: `node --test tests/alegra-backup-batch.test.mjs`  
Expected: FAIL.

- [ ] **Step 2: Implement snapshot/manifest builder**

No Dropbox dependency in the builder. Separate preparation from upload so evidence states remain truthful.

- [ ] **Step 3: Run tests**

Run: `node --test tests/alegra-backup-batch.test.mjs`  
Expected: PASS.

- [ ] **Step 4: Commit**

`git add scripts/whatsapp-internal/alegra-backup-batch.mjs tests/alegra-backup-batch.test.mjs && git commit -m "feat: prepare verifiable Alegra backup batches"`

### Task 6: Runtime integration without enabling writes

**Files:**
- Modify: `openclaw-plugin/index.mjs`
- Modify: `scripts/whatsapp-internal/alegra-write-host.mjs`
- Modify: `tests/whatsapp-openclaw-plugin.test.mjs`
- Create: `tests/alegra-read-runtime.test.mjs`

**Interfaces:**
- Consumes: Tasks 1–5.
- Produces: optional `accountingRead` runtime dependency that runs only when explicitly injected/configured.

- [ ] **Step 1: Write failing plugin/runtime tests**

Cases:
- no `accountingRead` dependency => plugin behavior unchanged;
- enabled read runtime can perform a synthetic GET sync;
- read runtime exposes no write execution;
- source failure returns BLOCKED health without crashing normal message handling;
- no secret appears in user-facing output.

Run: `node --test tests/alegra-read-runtime.test.mjs tests/whatsapp-openclaw-plugin.test.mjs`  
Expected: FAIL for new read runtime cases.

- [ ] **Step 2: Wire optional dependency**

Use the same guarded dependency-injection pattern as R15. Do not register a public WhatsApp command that exposes raw accounting records. The runtime should publish only structured internal status/results for Finance Guard consumers.

- [ ] **Step 3: Run runtime suites**

Run: `node --test tests/alegra-read-runtime.test.mjs tests/whatsapp-openclaw-plugin.test.mjs tests/alegra-read-transport.test.mjs tests/alegra-read-normalizer.test.mjs tests/alegra-read-sync.test.mjs tests/alegra-reconciliation.test.mjs tests/alegra-backup-batch.test.mjs`  
Expected: PASS.

- [ ] **Step 4: Commit**

`git add openclaw-plugin/index.mjs scripts/whatsapp-internal/alegra-write-host.mjs tests/whatsapp-openclaw-plugin.test.mjs tests/alegra-read-runtime.test.mjs && git commit -m "feat: wire read-only Alegra runtime into TORO Brain"`

### Task 7: Controlled Supabase checkpoint adapter

**Files:**
- Create: `scripts/whatsapp-internal/alegra-supabase-store.mjs`
- Create: `tests/alegra-supabase-store.test.mjs`
- Modify: `docs/ALEGRA_CONTROLLED_WRITE_CHECKPOINT.md`

**Interfaces:**
- Consumes: sync/canonical objects from Tasks 2–3.
- Produces: injected store methods `getCheckpoint`, `upsertSourceObject`, `advanceCheckpoint`, `setConnectorHealth`.

- [ ] **Step 1: Write failing tests using a fake Supabase transport**

Cases:
- org/tenant scope required on every call;
- no service-role token is exposed to message/plugin layer;
- checkpoint only advances after object upsert;
- cross-tenant key rejected;
- health write can record BLOCKED without deleting last data.

Run: `node --test tests/alegra-supabase-store.test.mjs`  
Expected: FAIL.

- [ ] **Step 2: Implement adapter**

Use parameterized API calls or existing trusted backend helper; do not add broad service-role access to WhatsApp/OpenClaw. If required tables/columns are absent, adapter must return `SCHEMA_NOT_READY` and make no schema mutation.

- [ ] **Step 3: Run tests**

Run: `node --test tests/alegra-supabase-store.test.mjs`  
Expected: PASS.

- [ ] **Step 4: Update checkpoint doc**

Document the exact runtime health, schema dependency, rollback boundary, and that v2 remains read-only.

- [ ] **Step 5: Commit**

`git add scripts/whatsapp-internal/alegra-supabase-store.mjs tests/alegra-supabase-store.test.mjs docs/ALEGRA_CONTROLLED_WRITE_CHECKPOINT.md && git commit -m "feat: persist Alegra read checkpoints safely"`

### Task 8: Acceptance suite and rollout gate

**Files:**
- Create: `tests/alegra-connector-v2-acceptance.test.mjs`
- Modify: `CONTINUAR.md`
- Modify: `docs/ALEGRA_CONTROLLED_WRITE_CHECKPOINT.md`

**Interfaces:**
- Consumes: all previous tasks.
- Produces: one executable acceptance suite and updated continuation checkpoint.

- [ ] **Step 1: Add acceptance tests**

The suite must prove:
1. company scope preserved;
2. payables summary and bill rows can be reconciled for a fixture cut-off;
3. replay is idempotent;
4. partial payment residual preserved;
5. Alegra payment alone is not verified settlement;
6. personal/mixed record quarantined;
7. blocked transport preserves checkpoint;
8. backup manifest/hash produced with state PREPARED;
9. no write endpoint/function is reachable.

Run: `node --test tests/alegra-connector-v2-acceptance.test.mjs`  
Expected: FAIL until all interfaces are correctly wired.

- [ ] **Step 2: Run full relevant suite**

Run: `node --test tests/alegra-*.test.mjs tests/whatsapp-openclaw-plugin.test.mjs`  
Expected: all PASS.

- [ ] **Step 3: Update continuation/checkpoint docs**

Record:
- exact commit SHA;
- tests run/count;
- runtime state `READ_ONLY_READY_FOR_AUTHORIZED_TRANSPORT_QA`;
- remaining external gate: authorized Alegra transport;
- backup state;
- no writes/deploy performed.

- [ ] **Step 4: Commit**

`git add tests/alegra-connector-v2-acceptance.test.mjs CONTINUAR.md docs/ALEGRA_CONTROLLED_WRITE_CHECKPOINT.md && git commit -m "test: gate Alegra connector v2 rollout"`

## Execution Gate

Do not deploy, install, connect credentials, enable Alegra writes, create accounting entries, upload backup batches, or change production permissions as part of this plan. After the code/test plan passes, perform an explicitly authorized transport QA using real read-only Alegra access. Only then may TORO Brain update the source object from BLOCKED to ACTIVE/READ_ONLY.
