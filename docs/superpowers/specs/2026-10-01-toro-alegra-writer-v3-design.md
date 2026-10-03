# TORO Alegra Writer v3 — Controlled Accounting Write Design

**Status:** APPROVED CONCEPT / SPEC FOR OWNER REVIEW — implementation not started  
**Date:** 2026-10-01  
**Canonical Brain path:** Money > Accounting & Tax > Alegra Writer  
**Predecessor:** `docs/superpowers/specs/2026-09-23-toro-brain-alegra-connector-v2-design.md`  
**Authority rule:** Alegra remains the accounting/fiscal system of record for Alegra-native objects. TORO governs intent, evidence, approvals, verification and receipts; it does not become a second ledger.

## 1. Goal

Extend the existing read-only Alegra Connector v2 with a safe write capability that can prepare, validate, approve, execute, read back, verify and, when supported, reverse accounting actions without bypassing entity scope, accounting evidence or owner approval.

The Writer must reduce repetitive bookkeeping while preserving accounting control.

It must never:
- infer that a personal charge is a hotel expense solely from mailbox/card location;
- post an invoice twice;
- equate an Alegra payment record with a bank-confirmed settlement;
- alter historical accounting silently;
- delete or void accounting data without an explicit governed reversal path;
- create a second accounting ledger in Supabase;
- write from raw email/chat text without normalized evidence.

## 2. Existing architecture to reuse

Reuse the v2 authority, source identity, reconciliation states and evidence lineage.

Existing local implementation referenced by v2 must be located before new runtime code is written:
- `scripts/whatsapp-internal/alegra-service-write-adapter.mjs`
- `scripts/whatsapp-internal/alegra-write-host.mjs`
- `scripts/whatsapp-internal/document-extract.mjs`
- `openclaw-plugin/index.mjs`
- `tests/alegra-invoice-preparation.test.mjs`
- `tests/alegra-document-intake.test.mjs`
- `tests/alegra-message-receiver.test.mjs`
- `tests/whatsapp-openclaw-plugin.test.mjs`
- `docs/ALEGRA_CONTROLLED_WRITE_CHECKPOINT.md`

Do not recreate these modules elsewhere until that exact worktree has been inspected.

## 3. Write lifecycle

Every write follows one canonical lifecycle:

`INTAKE -> NORMALIZE -> SCOPE -> DEDUPE -> VALIDATE -> PREPARE -> APPROVAL -> EXECUTE -> READ_BACK -> VERIFY -> RECEIPT -> RECONCILE`

Exceptional states:
- `NEEDS_EVIDENCE`
- `SCOPE_CONFLICT`
- `DUPLICATE_CANDIDATE`
- `VALIDATION_FAILED`
- `APPROVAL_REQUIRED`
- `EXECUTION_FAILED`
- `READBACK_MISMATCH`
- `BANK_MATCH_PENDING`
- `REVERSAL_REQUIRED`
- `REVERSED`
- `BLOCKED_PROVIDER`

No write is called **HECHO** until `READ_BACK -> VERIFY -> RECEIPT` passes.

## 4. Phase A — approval-gated writes only

Initial production ceiling:

**All Alegra mutations require explicit owner/authorized-accounting approval.**

TORO may automatically:
- read emails/files/connectors;
- extract invoice metadata;
- identify entity/property/project;
- check duplicates;
- map contacts/accounts/cost centers;
- validate arithmetic and tax structure;
- prepare a proposed Alegra payload;
- compare against historical patterns;
- explain why a record is ready or blocked.

TORO may not initially auto-post without approval.

## 5. Candidate write types

Phase A may support, one capability at a time:

1. Create/import purchase expense or payable from verified fiscal evidence.
2. Create an outgoing payment when an accounting payment should be recorded.
3. Create/import a journal entry.
4. Create a missing contact only when required by the approved write.
5. Create a missing cost center/account mapping only with separate explicit approval.
6. Attach or link supporting evidence when Alegra/API capabilities allow it.
7. Apply a governed correction/reversal using Alegra-native semantics.

Out of initial scope:
- destructive delete;
- mass historical reclassification;
- automatic tax filings;
- automatic bank reconciliation;
- autonomous payroll posting;
- automatic intercompany entries;
- personal-to-business reclassification without evidence;
- changing chart of accounts globally without separate approval.

## 6. Evidence contract

A proposed accounting write must have, when applicable:

- source mailbox/file/provider;
- original fiscal document or receipt;
- issuer name and tax ID;
- receiver/legal entity and tax ID;
- document number / tax key;
- issue date / due date;
- currency;
- subtotal, tax and total;
- payment evidence if a payment is being recorded;
- benefiting entity/property/project;
- business purpose;
- payment source;
- contact;
- accounting category/account;
- cost center;
- duplicate key;
- Dropbox evidence path or explicit backup exception;
- canonical TORO object ID.

Invoices received through email should be backed up before or immediately after posting:
- **Dropbox:** durable original evidence/archive.
- **Alegra:** attach/upload original when supported by the selected API/runtime; otherwise store a durable reference to the evidence and keep Alegra document identifiers in TORO.

If Alegra cannot natively store a given attachment through the exposed API, the Writer must not pretend it was uploaded.

## 7. Scope firewall

The Writer resolves scope before accounting treatment.

Minimum scope dimensions:
- owner/person;
- legal entity;
- business;
- property;
- project;
- supplier;
- payment instrument.

Rules:
- personal mailbox does not imply personal expense;
- corporate mailbox does not imply business expense;
- personal card does not imply personal expense;
- business card does not prove business purpose;
- mixed evidence remains staged until classified;
- Dreamcatcher/Atrapa Sueños, DIEX, Santa Toro and personal scopes remain distinct.

Any unresolved cross-entity case becomes `SCOPE_CONFLICT`, not an automatic post.

## 8. Duplicate prevention / idempotency

Every proposed write receives a deterministic idempotency key derived from the strongest available identity, for example:

`tenant + legal_entity + document_type + tax_key/document_number + issuer + total + currency`

Before execute:
1. Search canonical TORO invoice/evidence records.
2. Search Alegra native records.
3. Search prior Writer receipts/idempotency keys.
4. Compare document/tax key, amount, date and supplier.
5. Block on ambiguous duplicate candidates.

The same approved request retried after timeout must not create a second Alegra object.

## 9. Accounting validation

Before approval/execution:
- currency must match;
- totals must reconcile;
- debit = credit for journals;
- required Alegra contact exists or is explicitly proposed;
- account/category name/native ID is valid;
- cost center is valid;
- period is open/allowed;
- tax fields are supported by evidence;
- receiver/entity is correct;
- no unsupported automatic account is used;
- existing invoices/payments are not duplicated;
- reversal semantics are known for the specific object type.

Historical lessons from Alegra support are preserved:
- journal imports need consistent asiento number grouping;
- exact account/contact naming/identity matters;
- contacts/accounts may need to exist or be created during import depending on the path;
- errors must be corrected before import completion.

## 10. Approval object

Every approval screen/message must show a compact accounting diff:

- **Qué se va a crear/cambiar**
- legal entity;
- supplier/contact;
- document number;
- date;
- total/currency/tax;
- account/category;
- cost center;
- payment account if relevant;
- evidence link/reference;
- duplicate result;
- validation result;
- reversal method;
- expected resulting Alegra object.

Approval is scoped to this exact normalized payload/hash. Material payload changes invalidate approval.

## 11. Execution and read-after-write

Execution response alone is not success.

After mutation TORO must:
1. capture provider response/native ID;
2. re-fetch the Alegra object by native ID;
3. compare material fields to the approved payload;
4. record discrepancies;
5. store a Writer receipt;
6. update canonical reconciliation state.

If readback differs materially:
- state = `READBACK_MISMATCH`;
- no success claim;
- no blind retry;
- human review.

## 12. Receipt contract

Every mutation receipt stores:
- intent ID;
- approval ID/actor/time;
- idempotency key;
- normalized payload hash;
- source evidence IDs;
- provider method/endpoint class;
- native Alegra ID;
- execution timestamp;
- response status;
- readback timestamp/hash;
- verification result;
- reversal instructions/status;
- reconciliation state;
- error details without secrets.

Secrets/tokens are never stored in receipts.

## 13. Reversal contract

Prefer native, auditable corrections over destructive deletes.

For every enabled write type, implementation must document:
- whether Alegra supports edit, void, reversal or compensating entry;
- which action preserves fiscal/accounting audit history;
- what approvals are required;
- what object relationships are affected.

A write type cannot be promoted to production until its reversal path is tested in a safe environment/account or otherwise verified against current Alegra behavior.

## 14. Attachments and Dropbox

Canonical evidence pattern:
- preserve provider original;
- compute SHA-256;
- back up to governed Dropbox path;
- register in `integrations.document_manifest` / `finance.evidence_documents`;
- link source message/file to accounting object;
- record whether Alegra attachment upload succeeded, was unsupported, or was not attempted.

Attachment states:
`SOURCE_FOUND -> MATERIALIZED -> DROPBOX_BACKED_UP -> ALEGRA_ATTACH_PENDING -> ALEGRA_ATTACHED`

Alternative terminal state:
`ALEGRA_ATTACHMENT_UNSUPPORTED`

Unsupported is truthful completion, not failure of accounting posting, provided Dropbox evidence is durable and the receipt links it.

## 15. Automation ladder

After sufficient verified production history, selected patterns may be promoted:

### Level 0 — READ
No write.

### Level 1 — PREPARE
TORO prepares proposed accounting record.

### Level 2 — APPROVE-AND-WRITE
Human approval required for every write. **Initial v3 target.**

### Level 3 — TRUSTED PATTERN AUTO-WRITE
Only for explicitly approved recurring patterns with:
- same legal entity;
- known supplier;
- known document type;
- stable account/cost center;
- fiscal evidence present;
- duplicate check clear;
- amount/tax within configured rules;
- no cross-entity ambiguity;
- readback verification;
- tested reversal.

### Level 4 — AUTONOMOUS CLOSING
Not approved by this spec. Requires a separate future owner decision.

## 16. Suggested first production patterns

Best initial candidates after Level 2 is proven:
- recurring utilities with verified entity/NISE and exact invoice evidence;
- known software subscriptions with stable business scope;
- standard supplier invoices with stable category/cost center.

Keep approval-required:
- intercompany;
- owner-paid business expenses;
- loans/principal/interest;
- insurance classification changes;
- payroll;
- taxes;
- legal settlements;
- historical corrections;
- unusual currencies/taxes.

## 17. Chat / WhatsApp / Portal behavior

A conversation may create an accounting intent, never a direct unverified mutation.

Example:
`email/PDF/chat -> document intake -> accounting proposal -> approval card -> Alegra write -> readback -> receipt -> reply`

OpenClaw/Tere/Portal can surface status but may not bypass the Writer policy.

## 18. Failure safety

- Provider auth failure: preserve approved intent; do not mark posted.
- Timeout after mutation: read back/search by idempotency evidence before retry.
- Schema/API drift: block writes and preserve last known good contract.
- Duplicate candidate: stop.
- Missing evidence: stop.
- Scope conflict: stop.
- Readback mismatch: stop.
- Dropbox failure: policy decides whether accounting can proceed; if it does, receipt must show evidence backup pending.
- Alegra attachment unsupported: keep original in Dropbox and record unsupported truthfully.

## 19. Security

- secrets server-side only;
- least-privilege Alegra credentials;
- no credential in Supabase business tables, GitHub, WhatsApp or Dropbox;
- explicit tenant/legal-entity scope on every write;
- approval actor authorization checked server-side;
- immutable/auditable receipts;
- sensitive personal finance isolated from hotel users;
- no raw full bank/card data replicated beyond minimum reconciliation need.

## 20. Implementation prerequisites

Before implementation:
1. inspect the exact unpublished/local v2 write-adapter worktree named in the v2 design;
2. verify current Alegra API/write capabilities and account permissions;
3. identify attachment-upload capability or limitation;
4. document native reversal behavior per object type;
5. map existing TORO approval/receipt primitives to avoid parallel systems;
6. define test account/fixture strategy;
7. create implementation plan only after owner reviews this spec.

## 21. Acceptance criteria

1. Duplicate retry creates exactly one Alegra object.
2. No write without valid scope and evidence.
3. Level 2 requires explicit approval.
4. Material payload changes invalidate prior approval.
5. Execute response alone is never success.
6. Read-after-write confirms native object and material fields.
7. Receipt links approval, source evidence, native ID and verification.
8. Personal/mixed-scope evidence cannot silently enter Dreamcatcher accounting.
9. Payment in Alegra remains `BANK_MATCH_PENDING` until external settlement evidence exists.
10. Attachment status is truthful: attached, pending or unsupported.
11. Every enabled write type has a documented/tested reversal path.
12. Provider/runtime failure cannot create a second entry through blind retry.
13. Writer uses the same TORO Brain identity, approvals, evidence and accounting scope model; no parallel ledger or control plane.

## 22. Owner-approved direction

Owner approved the v3 direction on 2026-10-01:
- develop the controlled Alegra Writer;
- keep invoice originals in Dropbox;
- upload/attach invoices in Alegra when supported;
- process 2026 accounting evidence incrementally;
- later evaluate recurring expenses for necessity/cost/value;
- preserve clear separation between hotel/business and personal accounting.
