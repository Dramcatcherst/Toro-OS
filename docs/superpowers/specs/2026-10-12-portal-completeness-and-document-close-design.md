# TORO Portal: completeness, simple navigation and document-based close

Status: PROPOSED WRITTEN SPECIFICATION — architecture review required before new product implementation.
Date: 2026-10-12. Parent: `docs/product/TORO_BRAIN_GENERAL_PLAN.md`, section 23 Human Experience; TORO Finance / Comms / Tools contracts remain authoritative.

## Outcome and scope

An authorized hotel operator finds the right tool or company information, submits a supported document once, sees what TORO actually processed, and prepares a saved daily close with evidence and unresolved differences. The owner receives decisions and exceptions rather than a collection of disconnected dashboards.

Reuse the existing Portal, identity resolver, organization scope, canonical directory, internal-work intake, execution receipts, finance evidence tables and close records. No second Brain, database, inbox, project backlog, accounting book or scheduler. Dreamcatcher is the reference scope, not a universal hotel assumption.

This is a subordinate design, not a replacement Plan General. Requested visual reference: `1001761343.png` — navy/slate, defined borders, compact natural-height panels, blue TORO typography and original provider assets. The reference image is not runtime data or proof of implemented capabilities.

## Alternatives and decision

1. **Extend the existing governed surfaces (recommended).** Reuse canonical objects and expose progressively verified capabilities. Lowest migration risk and no duplicate truth.
2. **Render the entire mixed directory indiscriminately.** Faster appearance of coverage, but exposes unrelated scopes, historical routes, credential-management paths and unverified destinations. Rejected.
3. **Rebuild Portal, chat and finance as another app.** Adds identity, receipt and synchronization debt. Rejected.

## Navigation and interaction

- Primary destinations: Inicio, Trabajo, Dinero, Herramientas; Más exposes Cerebro, Personas, Clientes, Crecimiento, Studio, Legal/Riesgo, Activos, Proyectos and Sistemas through the existing module model. Preserve canonical ordinals 00–11 and all existing routes.
- Inicio: two most relevant exceptions with a critical-state indicator, up to nine favorites, official Kross handoff and one clear document-intake entry when enabled.
- Trabajo: current tasks/handoffs/people/guest work filtered by role, property and freshness; never fabricate room occupancy or task completion.
- Dinero: close period/property/currency, expected versus counted cash, evidence queue, reconciliation differences and close history. A manual calculator is labelled Conteo, not a persisted close.
- Herramientas: one complete permitted catalogue, search by name/purpose, categories, nine favorites and contextual provider entry. Directory and guide are subviews of this same surface.
- Reportes is a view of existing domain sources, not a second navigation tree or another dashboard.
- One primary navigation per viewport; mobile four entries plus Más. Minimum 320px, targets at least 44px, text at least 12px, keyboard order equal to visual order, reduced-motion and forced-colors.
- Contextual detail opens on demand. Source date, partial coverage, blocking condition and action outcome remain available. No empty panels filled with sample business data.

## Complete link catalogue

The existing `operations.knowledge_items` directory is the source. Preserve native link IDs and entries; do not create another independent registry.

Project only approved fields: link ID, display label, purpose/category, safe destination, current scope, review state and review timestamp. Do not project account references, raw evidence, internal configuration, secrets or signed access URLs.

One governing projection validates identity, organization/property, role, visibility, lifecycle, exact reviewed destination and duplicate IDs. The current narrow RPC and its server projection must be extended together; adding names to a client-side logo map does not establish access.

Separate navigation state from integration state:
- Navigation: reviewed / login required / unreviewed / unavailable / historical.
- Integration: native read verified / native write verified / preparation only / unavailable / unknown.

Owner discovery includes permitted historical and other-project references through filters; default hotel view excludes them. Santa Toro remains a separate context. Sensitive credential-management destinations stay outside ordinary favorites. Unknown links retain a visible resource-needed state and no invented URL.

Group by provider and useful action without deleting distinct deep links. Exact URL equality is evidence for duplicate review, not permission to erase. Preserve query parameters that change the intended action; never retain credential parameters. Generic approved public provider landing pages can offer safe fallback, clearly distinct from the exact company destination.

Favorites must be scoped by user and organization. Existing per-session selections remain labelled until the canonical preference store and narrow write policy are approved and implemented. No local success message pretending database persistence.

## Same document flow across chat, email and Portal

Owners: TORO Comms for intake/binding, TORO Finance/FIONA for semantics, TORO Systems for custody/transport, existing TORO execution layer for retries/receipts.

1. Resolve channel account, sender, chat/group, user, organization, property and capability. A group name alone is not authorization. Guest, team, personal and finance scopes remain separate.
2. Receive a bounded batch through the existing Comms intake. Preserve native message and attachment identifiers and timestamps; ack receipt separately from processing.
3. Apply the existing COLLECT_THEN_PROCESS SOP. An explicit “listo” closes collection. A configured idle window can prepare a candidate, but does not finalize accounting. Separate days/accounts/topics. Late files attach as a new batch version.
4. Store unchanged original bytes in authorized custody before financial processing; verify native revision, size and SHA-256. Link PDF, XML, photo and OCR derivative without overwriting originals. Do not publish private references in this repository.
5. Extract only supported content; record field confidence, missing fields and document authority. OCR output is a candidate, not proof of payment, tax validity or accounting acceptance.
6. Deduplicate source replay by tenant + channel account + chat/message + attachment index/version. Review cross-channel matching by original hash and business document identity. Invoice and payment proof are different objects; do not count the same expense twice.
7. Validate entity/property, issuer, document number, date, original amount/currency, tax, payment source and purpose. Mixed personal/business or unresolved evidence goes to review.
8. Reuse `integrations.document_manifest`, `finance.evidence_documents`, `finance.invoice_sources` and `finance.invoices`; link occurrences instead of creating a second evidence table. Small metadata additions require a reviewed migration if existing fields cannot express the invariant.
9. Prepare the existing `finance.daily_close_runs/items/questions` for the authorized period/property. Create or reopen a draft idempotently; attach evidence by reference.
10. Record stage-specific receipts using the existing execution envelope. Portal and WhatsApp read this same state; no separate conversation-only “done”.

States shown to the operator: Recibido, Original guardado, En revisión, Listo para cierre, Conciliación pendiente, Listo para aprobar, Cerrado; Bloqueado/Desconocido when evidence or a source fails. Each transition requires evidence and the authorized actor.

## Financial close semantics

The close has a cutoff and explicit expected-source checklist: Kross source/export, cash count, card/processor settlement, transfers/bank, expenses, refunds, supplier documents and prior exceptions. Missing sources are not zero. An expense document does not establish actual settlement.

Preserve original totals, CRC and USD separately, gross/net/taxes/fees/refunds/timing differences and any unreconciled residual. Use exact decimal amounts; no silent conversion or invented tax treatment. Invoice, payment notification and bank settlement may support one event without becoming three expenses.

Draft completion and final closure are separate actions. A saved draft can exist with incomplete sources; it must display missing coverage. Final close requires reconciled evidence or explicitly approved exception disposition, accountable closer and readback. Kross Finalize Day remains a separate gated final action.

Alegra retains fiscal/accounting authority. Reuse the existing Connector v2 and controlled native writer candidate in PR228; do not merge/activate a stale branch wholesale. The available connector catalogue is not proof of posting or attachment upload. Native writer company/actor binding, permissions, originals, idempotency, correction and readback must pass first. Receiving a document authorizes intake under the approved policy, not payments, fiscal emission, payroll or definitive posting.

Operational close, financial close, breakfasts and management brief remain separate outputs linked to the same day; one does not certify the others.

## Delivery units and dependencies

| Unit | Owner | Dependency | Completion evidence |
| --- | --- | --- | --- |
| A. Directory projection and taxonomy | TORO Tools + Identity | Written spec and scoped RPC review | Every permitted registry entry discoverable or has an explicit exclusion; role and mixed-scope tests |
| B. Navigation simplification | TORO Human Experience | A and existing destinations | 320/390/412/desktop, keyboard and real owner walkthrough; no hidden permitted destinations |
| C. Original custody and extraction pilot | Systems + Comms + Finance | Verified authorized upload source and custody | One original stored/hash/readback; duplicate replay creates no extra business event; corrupt file fails safely |
| D. Saved close draft | TORO Finance | C plus current source checklist | Existing close record, original totals, missing sources and repeatable reopen; no accounting effect |
| E. WhatsApp finance intake | Comms + Identity | Verified existing host/account/group/sender binding | One authorized batch through restart/replay, original custody and same Portal status; denied sender proves isolation |
| F. Native posting and final close | Finance + qualified approver | Existing Alegra writer acceptance and current Kross/bank evidence | Exact approved native action, separate readback, correction path and final-close receipt |
| G. Portfolio and metadata convergence | TORO Core | Actual receipts from A–F | Existing tasks/registry/Plan aligned without duplicate backlog or false DONE |

C/D may start with an authorized Portal upload or export when the existing WhatsApp host is unavailable. This is an explicit alternate input to the same pipeline, not an alternate identity or bypass.

Do not add a scheduler; reuse the existing worker once its policy and credentials are verified. Do not create billable accounts or dependencies without an explicit budget decision. Do not replace DreamTeam or retire historical surfaces before dependency and recovery proof.

## Acceptance scenarios

Catalogue: same provider with different actions; historical link; unknown URL; signed secret URL; foreign scope; repeated ID; malicious redirect; allowed owner versus employee; stale reviewed destination.

Documents: valid PDF/XML/photo; malformed/oversized file; OCR uncertainty; multiple pages; duplicate forwards across chat/email; invoice plus transfer proof; refund/reversal; personal expense; owner-paid business expense; wrong property/date; mixed CRC/USD; late attachment; restart mid-custody; interrupted native response.

Close: missing Kross source, unknown expected cash, card amount versus settlement net, duplicate proof, unmatched expense, manual exception, revised draft and repeat final-close request. Each test checks final canonical readback, not only a successful response.

Identity: unauthorized group/member, revoked/expired session, second real identity, guest versus finance separation and source payload attempting instructions. Document content is data, never executable authority.

## Verification and rollback

Use branch/PR/CI/preview and exact deployed source verification. Preview capability configuration must be known; a public-demo preview is not authenticated runtime acceptance. Retain the last working owner-login deployment.

Additive data changes require a reviewed migration and rollback. Do not delete original files or committed financial records; corrections create versioned or reversal evidence. Feature-disable the new intake/action boundary on partial failure, preserve the last good checkpoint, quarantine ambiguous outcomes and reconcile before resuming.

Restore test uses one scoped synthetic or explicitly authorized original and verifies bytes plus lineage. Account/channel and financial identifiers belong only in restricted evidence storage.

## Metrics and honest completion

Measure permitted catalogue coverage, number of steps to the top tasks, persistent-state survival, original custody/hash coverage, duplicate rate, unresolved-source coverage, end-to-end processing time and actual verified close count. Establish the baseline before claiming savings. Target 100% of permitted entries classified/discoverable; 100% of processed originals with integrity evidence; zero duplicate financial effects in replay tests.

Done means the operator can repeat the workflow with the intended identity, observe the canonical result and recover after failure. A render, connector name, table, passing mocked test, READY build or stored SOP alone is insufficient.

## Approval boundary

This written specification is ready for review. Architectural implementation and its detailed execution plan require the user's review under the invoked Superpowers workflow. The audit and reversible metadata corrections do not activate chat ingestion, posting, new permissions or new automation. Existing approvals remain valid within their original scope.
