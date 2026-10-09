# TORO Alegra Writer v3 — Implementation Plan

**Date:** 2026-10-01  
**Status:** OWNER-APPROVED IMPLEMENTATION PLAN — no production write activation yet  
**Parent spec:** `docs/superpowers/specs/2026-10-01-toro-alegra-writer-v3-design.md`  
**Canonical scope:** Money > Accounting & Tax > Alegra Writer

## Goal

Implement the approved Alegra Writer v3 inside the existing TORO Brain, reusing the v2 connector and existing controlled-write worktree. The implementation must reach safe Level 2 (approve-and-write) before any recurring auto-write is considered.

## Phase 0 — recover existing write worktree

1. Locate the exact unpublished/local worktree referenced by v2:
   - `scripts/whatsapp-internal/alegra-service-write-adapter.mjs`
   - `scripts/whatsapp-internal/alegra-write-host.mjs`
   - `scripts/whatsapp-internal/document-extract.mjs`
   - `openclaw-plugin/index.mjs`
   - related tests and `docs/ALEGRA_CONTROLLED_WRITE_CHECKPOINT.md`.
2. Diff that worktree against current `main`.
3. Preserve unique logic; do not duplicate adapters in a second path.
4. Record missing pieces against the v3 spec.

**Exit gate:** exact prior work is inventoried, recoverable and reconciled with current main.

## Phase 1 — provider capability verification

Verify current Alegra write behavior with current documentation/runtime:

- create supplier bill / purchase expense;
- create outgoing payment;
- create journal;
- read object by native ID;
- edit/void/reverse semantics;
- supplier bill attachment endpoint;
- payment attachment endpoint;
- file-size limits and one-file-per-request behavior;
- contact/account/cost-center prerequisites;
- provider rate/error behavior.

No production mutation in this phase.

**Exit gate:** capability matrix with endpoint, payload, readback route, reversal route and attachment support.

## Phase 2 — canonical write intent

Add/reuse one governed write-intent object with:

- org/legal entity;
- target Alegra object type;
- normalized payload;
- source evidence refs;
- duplicate key;
- payload hash;
- requested authority level;
- approval state;
- expiration;
- idempotency key;
- expected readback;
- reversal class.

Do not create another approval universe. Reuse current TORO decisions/attention model and `finance.payflow_write_receipts`.

**Exit gate:** one intent has a stable hash, scope and idempotency key before provider execution.

## Phase 3 — preparation engine

Implement pure preparation functions for:

1. verified supplier invoice -> proposed purchase/bill;
2. verified payment evidence -> proposed outgoing payment;
3. approved balanced accounting correction -> proposed journal.

Validation must include:
- legal receiver;
- supplier/contact;
- currency;
- subtotal/tax/total math;
- account/category;
- cost center;
- payment account;
- period;
- fiscal key/document number;
- duplicate search in TORO + Alegra + prior receipts;
- scope conflict detection;
- Dropbox evidence status.

Preparation is side-effect free.

**Exit gate:** fixtures produce deterministic payload + validation result.

## Phase 4 — approval surface

Portal/WhatsApp approval card must show:

- what will be created/changed;
- entity;
- provider/contact;
- date;
- amount + currency;
- tax;
- account/category;
- cost center;
- payment account if applicable;
- source evidence;
- duplicate result;
- validation result;
- reversal method.

Approval binds to exact payload hash. Any material change invalidates approval.

**Exit gate:** altered payload cannot reuse old approval.

## Phase 5 — controlled executor

Implement server-side executor:

`approved intent -> idempotency preflight -> provider call -> native ID -> readback -> verify -> receipt`

Rules:
- no browser/client secrets;
- no blind retry after ambiguous timeout;
- unknown provider state triggers search/readback before retry;
- same idempotency key cannot create second object;
- response alone is not success.

**Exit gate:** simulated timeout/retry still yields at most one logical Alegra object.

## Phase 6 — evidence attachment

For each posted object when supported:

1. preserve original in Dropbox;
2. compute/store SHA-256;
3. attach original PDF/evidence to Alegra native object;
4. read back attachment/object state when available;
5. record:
   - `ALEGRA_ATTACHED`,
   - `ALEGRA_ATTACH_PENDING`, or
   - `ALEGRA_ATTACHMENT_UNSUPPORTED`.

Never claim attachment success from request submission only.

**Exit gate:** at least one safe fixture proves durable Dropbox evidence + provider attachment state.

## Phase 7 — reversal tests

For each enabled write type document and test:

- edit;
- void;
- native reversal;
- compensating journal, if that is the only valid accounting correction.

Destructive delete is not a normal correction path.

**Exit gate:** no write capability can be promoted without a known reversal procedure.

## Phase 8 — Level 2 pilot

Use a low-risk, already-verified Dreamcatcher recurring supplier item with:
- correct company receiver;
- clean fiscal evidence;
- known category/cost center;
- no personal scope;
- no tax ambiguity;
- no duplicate;
- Dropbox backup.

Candidate classes:
- AyA / ICE / known telecom supplier;
- stable business software invoice.

Pilot requires explicit owner approval for the exact payload.

After execution:
- read back Alegra;
- attach evidence;
- compare fields;
- write receipt;
- keep bank settlement state separate.

**Exit gate:** one real approved write is verified end to end and reversible.

## Phase 9 — daily close integration

Only after Level 2 pilot passes:

`Kross daily close -> TORO reconciliation -> READY_FOR_ALEGRA -> prepared intents -> approval -> Writer -> readback -> receipt`

Rules:
- internal transfers excluded from P&L;
- CRC/USD separate;
- personal/business separate;
- missing receipt blocks automated posting;
- no duplicate with existing Alegra movement;
- payroll/taxes/loans/intercompany remain approval-required.

## Phase 10 — trusted pattern promotion

A recurring pattern may move to Level 3 only after:
- explicit owner approval for that pattern;
- multiple clean Level 2 executions;
- stable supplier/entity/account/cost-center mapping;
- evidence always present;
- duplicate detection proven;
- readback always passes;
- reversal proven;
- no material amount/tax drift.

No Level 4 autonomous closing is authorized.

## Test matrix

Minimum tests:

- duplicate same invoice;
- duplicate retry after timeout;
- wrong legal receiver;
- personal card + business invoice;
- business mailbox + personal invoice;
- CRC/USD mismatch;
- altered approval payload;
- missing Dropbox evidence;
- attachment success/failure;
- contact missing;
- account mapping missing;
- unbalanced journal;
- provider 4xx/5xx;
- readback mismatch;
- stale approval;
- reversal path;
- payment in Alegra without bank match;
- invoice + card alert not double counted.

## Release checklist

Before production enablement:

- current Alegra credentials verified and least privilege;
- secrets only server-side;
- v2 reads still pass;
- no regression in PayFlow;
- read-only fallback works if Writer disabled;
- Writer feature flag off by default;
- Level 2 activation separately approved;
- logs/receipts redact secrets;
- Dropbox backup path writable;
- rollback documented;
- one dry run with no provider mutation;
- one owner-approved pilot.

## Current state on 2026-10-01

- design approved by owner;
- PR #228 contains the v3 spec;
- read-only Alegra connector works;
- current connected Alegra tool surface in ChatGPT remains read-only;
- official API attachment support for supplier bills/payments was identified, but runtime/account access still requires verification;
- no Alegra write was enabled by this plan.


## Implementation progress — 2026-10-09

Owner instruction on 2026-10-09 explicitly authorizes continuing creation of the existing Alegra connector aligned to the single General Plan.

### Phase 0 recovery ruling

A bounded GitHub search across the accessible `Dramcatcherst` repositories did not locate the unpublished `toro-openclaw-integration` worktree or the referenced R13-R15 runtime files. The only accessible references are the v2/v3 specs and plans. This is now treated as a lost/unavailable local implementation artifact, not as a reason to create a second project.

Ruling:
- continue in this existing PR/connector lane only;
- rebuild the minimum missing governed logic against the current canonical TORO contracts;
- do not recreate an OpenClaw-specific parallel accounting brain;
- preserve `Context -> Policy -> Approval -> Execution -> Verification -> Receipt`;
- keep provider mutation disabled until transport, duplicate search, approval binding and readback are all proven.

### Code now implemented in this PR

- `src/features/finance/alegra-writer-contract.ts`
  - deterministic normalized write intent;
  - tenant/org/legal-entity scope requirements;
  - scope-conflict fail closed;
  - evidence hash/source requirements;
  - deterministic duplicate and idempotency keys;
  - exact payload hash bound to owner approval;
  - no execution without approval;
  - purchase-bill and outgoing-payment preparation gates;
  - journals explicitly blocked until balanced-line support exists;
  - material read-after-write verification with `READBACK_MISMATCH`.
- `src/features/finance/alegra-writer-contract.test.ts`
  - deterministic replay;
  - scope conflict;
  - altered-payload approval invalidation;
  - approval requirement;
  - readback mismatch;
  - journal phase gate.
- `package.json` includes the new contract suite.

No Alegra API mutation, credential change, accounting entry, Supabase migration or production enablement is part of this progress.

### Next technical gate

Implement the provider-independent preparation + duplicate-search boundary, then bind it to current TORO policy/approval/receipt contracts. Only after those tests pass should a real Alegra write transport adapter be added behind a default-off feature gate.
