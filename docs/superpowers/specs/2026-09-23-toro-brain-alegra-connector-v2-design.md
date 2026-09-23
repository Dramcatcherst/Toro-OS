# TORO Brain Alegra Connector v2 — Design

**Status:** Approved design; runtime not implemented  
**Canonical Brain path:** Money > Accounting & Tax > Alegra Connector  
**Canonical knowledge:** `operations.knowledge_items/toro_alegra_connector_v2`

## Goal

Make Alegra a governed accounting synapse of the single TORO Brain, with read-only ingestion, canonical identity, reconciliation, failure-safe checkpoints, and verifiable backup. Do not create a second ledger, second finance brain, or autonomous accounting writer.

## Authority contract

- **Alegra:** authority over Alegra-native bills, outgoing payments, journals, contacts, cost centers, account catalog, inventory/accounting report state.
- **Banks:** authority over actual money movement and settlement.
- **TRIBU/Hacienda:** authority over filed/accepted fiscal state, credits and liabilities.
- **Kross:** authority over live hotel reservation and transaction context.
- **Supabase:** canonical TORO Brain identities, links, reconciliation state, evidence lineage, checkpoints and controls.
- **Airtable:** human review, exceptions and task surface; never a full ledger mirror.
- **Dropbox:** original evidence and snapshot archive.
- **Calendar / WhatsApp:** user interfaces only; never accounting authority.

## Current runtime state

On 2026-09-23 the Alegra capability catalog is visible, but direct runtime calls return `FORBIDDEN: This conversation does not support developer MCPs`. Browser fallback reaches Alegra login and has no authorized session. This is a transport/integration-state problem, not proof that the Alegra account is unavailable.

The source-of-truth state must therefore be `BLOCKED_RUNTIME_FORBIDDEN`, preserving the last good checkpoint. Empty/error responses must never overwrite known state.

## Phase 1 scope — READ ONLY

Resources:
- purchase bills
- outgoing payments
- bank/cash accounts
- reconciliations
- contacts
- cost centers
- journals
- ledger
- payables
- cash-flow reports
- exportables

No POST/PUT/PATCH/DELETE to Alegra in v2.

## Canonical identity

Every source object is keyed by:

`tenant_id + source_system + resource_type + native_id + source_updated_at_or_hash`

The canonical object stores the source-native ID, source timestamp, source hash/version, company scope, property/entity scope, reconciliation state, and evidence lineage.

## Payment state model

`SOURCE_SEEN -> DOCUMENT_CAPTURED -> OPEN_IN_ALEGRA -> PAYMENT_RECORDED_ALEGRA -> BANK_MATCH_PENDING -> BANK_MATCHED -> PROVIDER_CONFIRMED -> RECONCILED`

Exceptional states:
- `PARTIAL`
- `DISPUTED`
- `REVERSED`

A payment recorded in Alegra is never promoted to `PAID_VERIFIED` without bank/provider evidence.

## Sync contract

1. Bootstrap with a bounded full read.
2. Incremental pull by native timestamp/ID when supported.
3. Event/webhook trigger when a supported provider/runtime is available.
4. Periodic reconciliation even when events are working.
5. Idempotent upsert keyed by canonical source identity.
6. Fail closed on transport/auth/schema errors.
7. Preserve last good checkpoint on failure.
8. Never interpret empty/error response as zero balance or no obligations.

## Existing implementation to reuse

The Plan General records an existing local worktree named `toro-openclaw-integration`, branch `codex/whatsapp-internal-guard`, with these files:

- `scripts/whatsapp-internal/alegra-service-write-adapter.mjs`
- `scripts/whatsapp-internal/alegra-write-host.mjs`
- `scripts/whatsapp-internal/document-extract.mjs`
- `openclaw-plugin/index.mjs`
- `tests/alegra-invoice-preparation.test.mjs`
- `tests/alegra-document-intake.test.mjs`
- `tests/alegra-message-receiver.test.mjs`
- `tests/whatsapp-openclaw-plugin.test.mjs`
- `docs/ALEGRA_CONTROLLED_WRITE_CHECKPOINT.md`
- `CONTINUAR.md`

This worktree is not currently published in the connected GitHub repositories. Execution must locate that exact working tree and preserve unrelated work. Do not recreate these modules elsewhere.

## Security

- Secrets only in server-side secret/vault storage.
- Never store Alegra token in Airtable, WhatsApp, frontend, Calendar, or plain Dropbox.
- Scope every request to the correct tenant/company.
- No personal/mixed-scope record enters Dreamcatcher OPEX without explicit entity/business evidence.
- Future writes require a separate approved spec, action ceiling, explicit approval, idempotency key, and read-after-write verification.

## Backup contract

Dropbox roots:
- Accounting evidence: `/Dreamcatcher Hotel/Administracion/Contabilidad/2026/Alegra`
- Raw/backup root: `/Dreamcatcher Hotel/Administracion/Backups/TORO OS Sources`

Backup states:
`PREPARED -> EXTERNAL_UPLOADED -> INTEGRITY_VERIFIED -> RESTORE_TESTED`

Existing `FINSAFE-20260923-01.zip` is a verified partial batch, not a full financial backup.

Raw snapshots use:
`YYYY/MM/DD/raw/<resource_type>/<native_id>.json`

Manifests use:
`YYYY/MM/DD/manifests/manifest.json`

Binary evidence uses:
`YYYY/MM/<document_category>/YYYY-MM-DD__PROVIDER__DOCNUMBER__AMOUNT-CURRENCY__TYPE.ext`

## Acceptance criteria

1. Connector reads correct company scope without browser login.
2. Payables summary reconciles to invoice-level open items at the same cut-off within documented provider semantics.
3. Fetching the same native object twice produces one canonical object.
4. Partial payment preserves residual balance.
5. Alegra payment state alone never becomes `PAID_VERIFIED`.
6. Personal/mixed-scope records stay outside Dreamcatcher OPEX without explicit scope evidence.
7. Transport failure produces `BLOCKED` and preserves last good checkpoint.
8. Backup batch has source, period, count, manifest, hash and scope.
9. Backup is not called restore-tested until an actual restore/readback test is performed.
10. No Alegra write endpoint is reachable from the v2 runtime.
