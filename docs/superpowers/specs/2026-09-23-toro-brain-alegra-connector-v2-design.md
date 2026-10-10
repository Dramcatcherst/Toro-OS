# TORO Brain Alegra Connector v2 — Design

**Status:** Approved design; read-only tools verified; persistent sync, writer and document-custody runtime not accepted (2026-10-10)  
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

**2026-10-10 refresh:** native read calls are now available. The transport error below is historical evidence. Preserve dated observations and the last good checkpoint; do not retain the historical blocker as current state or equate working reads with a persistent sync/writer. See the document-custody extension for current verified limits.

**Historical observation — 2026-09-23:**

On 2026-09-23 the Alegra capability catalog is visible, but direct runtime calls return `FORBIDDEN: This conversation does not support developer MCPs`. Browser fallback reaches Alegra login and has no authorized session. This is a transport/integration-state problem, not proof that the Alegra account is unavailable.

At that historical cutoff, the source-of-truth state was `BLOCKED_RUNTIME_FORBIDDEN`, preserving the last good checkpoint. Empty/error responses must never overwrite known state.

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
- `scripts/whatsapp-internal/openclaw-plugin/index.mjs`
- `tests/alegra-invoice-preparation.test.mjs`
- `tests/alegra-document-intake.test.mjs`
- `tests/alegra-message-receiver.test.mjs`
- `tests/whatsapp-openclaw-plugin.test.mjs`
- `docs/ALEGRA_CONTROLLED_WRITE_CHECKPOINT.md`
- `CONTINUAR.md`

**2026-10-10 refresh:** the original checkout was partially located and read. Preserve its unrelated changes. Not every listed continuation/test artifact was recovered. The existing controlled-write PR remains the implementation lane; consolidate with it rather than copying a second implementation. Partial source recovery is not runtime acceptance.

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

## Document custody and platform optimization — 2026-10-10

This section extends the existing design; it does not create a new accounting system, schedule, permission grant or production writer.

### Scope, owners and authority

FIONA owns accounting semantics and approval criteria; SOBRESITO owns transport, custody integrity and recovery. TORO Finance, Connector Fabric and Governance & Resilience share the existing finance-control lane. Alegra is the native fiscal/accounting authority, Kross the reservation/operational authority, banks the settlement authority, Supabase the canonical identity/state/control plane and Dropbox the original-file custodian. Airtable remains a review surface; Portal and WhatsApp expose the same governed state.

Only architecture and contracts belong in this public repository. Native invoice/file identifiers, amounts, account identifiers, email addresses, private document URLs and raw snapshots belong in restricted evidence stores. No production secret is copied from a connector or saved in evidence.

### Current evidence and limits

- The connected Alegra catalog exposes 218 read tools. It exposes no accounting mutation or binary-attachment upload tool. Catalog presence does not establish country support, plan entitlement or persistent execution.
- The scoped native Dropbox read found an accounting PDF and historical archive packages. Both connected profiles reached the same account/file; this is one custody location. Metadata existence and filename hashes do not certify original bytes, completeness or restoration.
- The existing `alegra-backup-batch.mjs` prepares JSON snapshots, counts, hashes and a manifest with `externalUpload: false`. It does not download, preserve, upload or restore PDF/XML/photo binaries.
- A native invoice read did not expose attachment/PDF/XML fields. This does not prove that the native invoice has no attachments; attachment discovery requires a supported API or authenticated UI read.
- The existing controlled-write preparation remains a separate acceptance gap. Source recovery, persistent cursors, financial coverage from Kross and exact-head implementation checks are not complete merely because read tools work.

### One document, multiple assets and occurrences

Reuse `integrations.document_manifest` for scope, provider identity/path, filename, SHA-256, size, source timestamp, document type, period, privacy, authority, retention, destination and lifecycle. Reuse `finance.evidence_documents` for verification/backup state and `finance.invoice_sources` for invoice provenance. The following are proposed metadata contracts, not deployed columns or migrations:

| Concept | Required meaning |
| --- | --- |
| document_key | Stable scoped business/fiscal identity, independent of channel or filename |
| occurrence | Source system, native object/message ID, observed timestamp and capture receipt |
| asset_key / role | Original XML, fiscal response, native PDF, original photo, bank support or derived preview |
| asset version | Parent asset, byte SHA-256, MIME/type, size, native revision, capture and integrity evidence |
| linkage | Entity/property, native Alegra object and source Kross transaction when uniquely established |
| attachment state | Not required / pending / blocked by limit / uploaded / readback verified; separate from Dropbox custody |
| coverage | Expected documents/assets, observed/captured/verified counts, unknown gaps and cutoff |

The same document received by email and WhatsApp produces one document with two occurrences. A PDF and XML for the same fiscal document are different assets. A changed original creates a new version; an OCR output or optimized photo is a derivative with a parent hash. Never silently replace the original.

Identity resolution must use tenant/legal entity, emitter, document type and stable fiscal/native reference where available. A similar amount, date or filename is a candidate match, not authority. Mixed or ambiguous scope goes to review.

### Native Alegra attachments

Alegra documents a maximum of 2 MB per attached file and a number of attachments that depends on the plan. Verify the actual account's formats, quota, permissions and attachment operations before implementing a uploader. Do not generalize a 15-file rule from another country's journal feature.

Preserve the full-resolution photo, original PDF, XML and fiscal response in Dropbox. A smaller preview may be prepared for Alegra if its format is supported. Record its own size/hash and parent; never alter a signed XML or substitute a reconstructed XML. Keep private custody URLs in protected metadata, outside printed/customer-facing descriptions.

An attachment is complete only after a native readback or download verifies the destination and bytes. A request returning success alone is insufficient. A missing supported attachment operation stays blocked; do not use customer invoice email or payment actions as substitutes.

### Ordered intake and durable state

1. Capture source identity and original bytes with correct company/property scope.
2. Validate MIME, file size, safe name and basic readability; quarantine unknown type, malware suspicion, ambiguous identity or missing source.
3. Hash original bytes. Parse XML and extract PDF text; use OCR for images with confidence and human review for critical fields.
4. Deduplicate business document and byte asset independently; preserve every source occurrence.
5. Custody original and manifest in the approved Dropbox root, then verify native revision and readback/hash.
6. Prepare any permitted Alegra copy. Execute only an approved attachment action, then verify the native target and record its receipt.
7. Persist manifest links, review state and checkpoint only after required artifacts are durable. Retry with the same action/idempotency key after uncertain outcomes.

Provider retries, WhatsApp delivery or email receipt never imply fiscal acceptance, bank settlement or completed custody.

### Versioned layout and integrity

Keep the existing authorized accounting and raw-backup roots. A proposed versioned child layout uses opaque safe document keys, not guest identity, document amounts or public URLs:

- Binary assets: `YYYY/MM/category/document_key/vNN/role__byte_sha256.ext`.
- Raw snapshots: `YYYY/MM/DD/run_key/raw/resource_type/native_id/source_hash.json`.
- Manifests: `YYYY/MM/DD/run_key/manifests/manifest.json`, with scope, cutoff, source completeness, counts, versions, hashes and receipt references.

This supersedes the earlier filename proposal for new controlled batches; existing files remain in place and may be mapped through aliases. No bulk rename, overwrite or deletion is authorized by this design.

The existing snapshot hash describes normalized JSON. It cannot certify a signed XML, PDF or photo. Store full-byte SHA-256 for every binary asset.

Dropbox `content_hash` uses SHA-256 on each 4 MiB block and then on the concatenated binary block digests. It is different from ordinary whole-file SHA-256. Store algorithm names; never compare the two as equivalent. If the connector does not expose native content hash, require authorized binary readback and locally computed hashes before claiming integrity.

### Backup, retention and recovery

Retain the existing lifecycle:
`PREPARED -> EXTERNAL_UPLOADED -> INTEGRITY_VERIFIED -> RESTORE_TESTED`.

Primary Dropbox custody, a versioned evidence/snapshot package and a separately recoverable copy have different purposes. A second folder, another connector to the same account or provider version history is not an independent failure domain. Select an existing authorized independent destination and document encryption, access, key recovery and retention before enabling copying. Supabase database backups contain Storage metadata, not the binary objects themselves.

Proposed targets, subject to approval and measurement:
- original custody before a financial write becomes ready;
- change capture through the existing execution cycle, with verified daily closure;
- recovery of a bounded document package within one business day.

These are design targets, not activated schedules or proven SLAs. Retention follows the scoped approved records policy and legal holds; expiry never authorizes deletion on its own.

Restore a bounded package to an isolated restricted location. Verify archive readability, file inventory, full-byte hashes, XML/PDF/image readability, scope and links back to native records. Preserve originals and log the restore receipt. A restore test must not recreate fiscal invoices, duplicate payment records or restore the production database.

### Native functions and platform choice

| Platform | Relevant use | Gate before automation |
| --- | --- | --- |
| Alegra Costa Rica | Supplier XML inbox; registration from XML; import of already-issued sales XML; CABYS/catalog; cost centers; bank reconciliation from XLSX; appropriate recurring/export functions | Confirm country/account/plan/role, map native IDs and tax configuration; fiscal acceptance/rejection and issuance need explicit authorization |
| Kross | Authoritative reservations, charges, collections and corrections | Prove current financial endpoints/exports, completeness and stable transaction/payment links; distinguish mirror from live evidence |
| Gmail / Outlook | Supplier evidence intake and corrections | Correct business mailbox, native message/attachment IDs, durable cursor, duplicate handling and restricted original custody |
| Dropbox | Originals, scoped change detection, versioned archives and recovery | Least privilege, native revision/hash/readback and independent recovery evidence |
| Supabase | Existing manifests, identities, queue/control state and receipts | Scope/RLS, single writer, decimal/raw currency semantics, durable transaction/checkpoint and backup of any binary storage |
| Airtable | Human exception review and approved control references | Reuse existing records; do not mirror the ledger or create a second queue |
| Portal / WhatsApp | Submit, inspect, request review and receive scoped status | Verified actor/role and existing action gateway; no direct accounting writer or secret exposure |
| Make / Zapier | Published Alegra integrations, potentially useful for bounded transports | Verify exact resources, attachments, country permissions, failures, idempotency and TORO audit; no adoption or purchase yet |
| n8n | HTTP Request can call a governed API | Native Alegra coverage was not established; no new self-hosted runtime or parallel queue without justification |

Alegra's CR inbox can register supplier XML and perform fiscal acceptance/rejection; this research does not authorize those actions. Importing already-issued sales XML must preserve fiscal identity and must not trigger a second issuance.

Prefer native Alegra functions plus the existing TORO worker. A future external orchestrator submits to the same TORO action/control contract and does not post directly around approval gates.

For Dropbox provider webhooks, verify `X-Dropbox-Signature` (HMAC-SHA256 of the body) before processing, then use the native `files/list_folder/continue` change cursor. Connector snapshot pagination is not proof of a provider change feed. Do not claim Alegra/Kross webhook support until their current contract is verified.

### Next bounded acceptance unit

Use the existing implementation lane with the writer disabled by default. Build one simulated package containing a native-style JSON object, PDF, XML and photo; test duplicate multi-channel intake, new version, corrupt asset, oversize file, unsupported attachment operation, wrong scope, concurrent writer and uncertain timeout.

Required evidence:
- stable document/asset/occurrence relationships;
- deterministic byte hashes and immutable versions;
- persistent custody and action receipts;
- no duplicate on retry and no cursor advance after partial failure;
- isolated restore with byte and link verification;
- Portal/WhatsApp reading the same canonical state;
- default-disabled financial mutations and no real outbound messages.

Simulated acceptance proves the contract locally; real upload, autonomous scheduling, fiscal writing and recovery require separate native runtime receipts. Coverage uses an explicit expected denominator and cutoff; unknown scope remains `PARTIAL`, never “100%”.

### Official references

- [Alegra attachments](https://ayuda.alegra.com/int/adjunta-archivos-en-alegra)
- [Alegra CR XML inbox](https://ayuda.alegra.com/cri/consulta-tu-buzon-de-correo-de-alegra)
- [Alegra CR sales XML import](https://ayuda.alegra.com/cri/importar-facturas-y-tiquetes-desde-xml)
- [Alegra CR cost centers](https://ayuda.alegra.com/cri/crea-centros-de-costos-para-distribuir-los-ingresos-y-gastos-de-tus-proyectos)
- [Alegra CR bank reconciliation from XLSX](https://ayuda.alegra.com/cri/concilie-sus-bancos-a-partir-de-un-archivo-de-excel-en-formato-xlsx)
- [Dropbox content hash](https://docs.dropboxapi.com/dropbox-api/docs/technical-reference/content-hash)
- [Dropbox webhooks](https://docs.dropboxapi.com/dropbox-api/docs/webhooks)
- [Supabase backups and Storage limitation](https://supabase.com/docs/guides/platform/backups)
- [Make Alegra](https://www.make.com/en/integrations/alegra)
- [Zapier Alegra](https://zapier.com/apps/alegra/integrations)
- [n8n HTTP Request](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest)
