# TORO WhatsApp / OpenClaw Same-Brain Execution Plan

**Date:** 2026-09-23  
**Parent spec:** `docs/product/TORO_WHATSAPP_OPENCLAW_SAME_BRAIN_V1.md`  
**Rule:** extend the canonical TORO project. Do not create another brain, task database, project database, OpenClaw backend or duplicate connector.

## Outcome

Make WhatsApp a governed TORO client with two-way execution and follow-up while preserving one identity, one context model and one canonical state.

## Current verified baseline

- TORO context resolver exists in `main`.
- Authenticated `/my-toro` has role/source-aware reads.
- Canonical projects/tasks exist in Supabase.
- Message-to-task, project portfolio and Builder/Codex capabilities are already cataloged.
- PR #142 is merged and the shared `POST /api/brain/internal-work` execution primitive exists in canonical TORO.
- OpenClaw live consumption remains configured/unverified; direct live host access is still unavailable from this execution environment.
- The historical/local `toro-openclaw-integration` worktree must be reused when recovered. Do not recreate its transport modules in another repository.

## Workstream A — shared execution primitive

- [x] Add a bounded internal-work request contract.
- [x] Add task/project validation and idempotency.
- [x] Add canonical task routing for normal, maintenance, Builder/Codex and project follow-up work.
- [x] Add an authenticated server executor using existing TORO context + Supabase RLS.
- [x] Add `POST /api/brain/internal-work`.
- [x] Add contract tests and register them in the canonical test suite.
- [x] CI green for PR #142.
- [x] PR #142 merged into canonical TORO.
- [ ] Verify one real authenticated test task in a controlled organization context; archive/delete only if test policy permits.

## Workstream B — channel identity and service authentication

- [ ] Define one channel-runtime authentication method for OpenClaw.
- [ ] Add verified hashed channel identity binding -> TORO user/org.
- [ ] Add pairing/revocation UX in TORO Portal.
- [ ] Never authorize from display name alone.
- [ ] Unknown/unpaired senders fail closed or guest-safe.
- [ ] Add tests: owner, employee, unknown, revoked, wrong org, replay.

## Workstream C — OpenClaw adapter

**Must resume in the existing `toro-openclaw-integration` worktree when recovered.**

- [ ] Load/report canonical Human Layer version/hash.
- [ ] Resolve channel sender through TORO identity binding.
- [ ] Call the same TORO read/action contracts used by other surfaces.
- [ ] Map free text + menu/number continuation to canonical capabilities.
- [ ] Preserve external message ID as idempotency key.
- [ ] Persist only transport/session state locally; durable business state stays in TORO.
- [ ] Implement reconnect/replay-safe retry.
- [ ] Add completion/blocker outbound notifications.

## Workstream D — maintenance parity

- [ ] Owner/manager can create maintenance work from WhatsApp.
- [ ] Link room/area/asset when resolvable.
- [ ] Promote from generic task to canonical `maintenance_event` linkage without duplicate work.
- [ ] Assign to authorized person/team.
- [ ] Accept photo/voice evidence.
- [ ] Close only with required evidence/permission.
- [ ] Notify requester when resolved.

## Workstream E — projects

- [ ] Read NOW/BLOCKED project summary.
- [ ] Open project detail.
- [ ] Create canonical follow-up linked to project.
- [ ] Ask for blocker/next action/owner.
- [ ] Update status only through the governed project workflow.
- [ ] “continuar proyecto X” restores safe project focus.

## Workstream F — Builder / Codex

- [ ] “Dale esto a Codex” creates one canonical Builder task.
- [ ] Trusted worker maps Builder task to isolated branch/session.
- [ ] No raw shell exposure from WhatsApp.
- [ ] Builder reports started / blocked / PR / preview / tests / done.
- [ ] Production/deploy/secret/security actions remain approval-gated.
- [ ] Completion evidence returns to the same TORO task and WhatsApp thread.

## Workstream G — continuity and shared mind

- [ ] Same TORO Human Layer/personality version across surfaces.
- [ ] Same business truth/source authority.
- [ ] Same role/capability rules.
- [ ] Same project/task state.
- [ ] Canonical conversation continuation state.
- [ ] No hidden cross-user memory.
- [ ] Personal/work isolation preserved.

## Workstream H — authorized source + mailbox parity

OpenClaw/WhatsApp must consume TORO capabilities through the shared Brain/router. It must not connect directly to raw credentials or create a second connector fabric.

- [ ] Enumerate every authoritative business connector currently available to TORO and classify read/write/approval ceiling.
- [ ] Verify WhatsApp owner identity can request governed reads across authorized Dreamcatcher/Atrapasueños domains: Finance, Operations, Revenue, Guests, People, Projects, Knowledge, Systems and Assets.
- [ ] Route source reads through the same source-authority rules used by Portal/Brain.
- [ ] Return source/freshness/provenance with material answers.
- [ ] Fail closed when a connector is unavailable, stale, outside active scope or not authorized.
- [ ] Never expose raw tokens, passwords, API keys, bank credentials or recovery secrets to the channel model.
- [ ] Preserve Personal / work-private / organization / family isolation even when the owner can access several scopes.

### Email coverage gate

Owner-confirmed business addresses to reconcile:
- `info@atrapasuenos.net`
- `proveedores@atrapasuenos.net`
- `accounting@atrapasuenos.net`
- `admin@dreamcatcherhotel.com`
- `info@dreamcatcherhotel.com`
- `accounting@dreamcatcherhotel.com`

Before claiming email parity:
- [ ] Google Workspace Admin classifies each address as user / alias / group / delegated/shared mailbox / route.
- [ ] Each real mailbox has an authorized read transport.
- [ ] Historical backfill is indexed with mailbox provenance and deduplication.
- [ ] New-mail ingestion uses official Gmail API/history/push where authorized.
- [ ] TORO Comms classifies actionable mail and writes governed follow-ups/tasks instead of duplicating raw mail.
- [ ] OpenClaw/WhatsApp can query cross-mailbox status via TORO Comms without direct mailbox passwords.
- [ ] Sending/reply/forward/delete/routing remain disabled until separately approved and tested.

Current 2026-09-28 evidence:
- ChatGPT Gmail connector covers only `admin@dreamcatcherhotel.com`;
- Supabase governed Gmail metadata index contains 6,128 rows from that mailbox only;
- therefore multi-mailbox coverage is incomplete.

## Workstream I — runtime acceptance

Run the existing OpenClaw audit gates:
- channel probe/capabilities;
- DM/group isolation;
- bindings;
- tool permissions;
- security audit;
- logs/privacy;
- replay/idempotency;
- TORO identity/authority;
- human escalation;
- reconnect/recovery;
- backups.

Then run end-to-end scenarios:
1. create internal task;
2. duplicate retry -> no duplicate;
3. create maintenance task;
4. project status + project follow-up;
5. Builder/Codex queue;
6. unauthorized employee action denied;
7. unknown sender denied/guest-safe;
8. reconnect + continue;
9. completed task -> one notification;
10. cross-domain authorized read -> source/evidence returned;
11. query all bound business mailboxes -> aggregated actionable summary without duplicate messages;
12. forbidden/private scope -> denied without leakage.

## Experience-sales pilot — owner directive 2026-10-20

**Priority decision:** experiences are an intended near-term revenue line, not only informational recommendations. Reuse Workstreams B/C/G/I, TORO Services, Comms and Revenue under General Plan controls E11/E15/E17/E29/E36. Selling an experience to a visitor is not onboarding an external business to TORO SaaS; do not misuse the external-business readiness gate to block the hotel's legitimate service line. This section is commercial acceptance design, NOT live sales activation or permission to publish prices, send offers, charge or book.

### Catalogue and economic truth

Reuse `catalog.experiences`, `catalog.dining_services`, `catalog.menu_items`, publication/fulfillment gates and `operations.experience_booking_requests` where their current authorized schemas support the action. The prior `technical_preflight_20261020` query is a read-side selection, not a booking endpoint. Revalidate scope, version, source and all publication gates; archived products remain excluded. A historical label or readiness score never confirms today's supplier availability.

For the first curated launch subset, require product/variant ID, named accountable operator, own-service versus intermediary model, current supplier acceptance route, approved retail currency/price, cost or commission basis, inclusions/exclusions, duration, meeting/transport details, quantities/ages/restrictions, weather/cancellation conditions and validity. No invented prices, percentages, dietary or safety claims. Unknown material fields block a binding quote, but a clearly labeled request for information may remain possible. Owner approval of a launch does not establish missing facts.

Keep approved catalogue/commercial authority and provider availability distinct. Kross remains PMS authority and publisher for approved lodging rates; mapped service charges use exact system IDs and permissions. Never create a second pricing writer in WhatsApp. Do not treat an intermediary's gross customer payment as the hotel's earned contribution. Real contribution requires supplier cost/commission, refunds, payment fees and other attributable costs with evidence; use NO_MEDIDO before that evidence exists. Taxes and liability terms require the appropriate approved source, not inference by the assistant.

### One case, independent status dimensions

Preserve one canonical request/order reference across chat, quotation, supplier confirmation, booking/voucher, fulfillment and reconciliation. Session continuation stores references and resumable stage only, not a duplicate commercial ledger. A channel receipt is transport evidence, not a booking voucher or a financial receipt.

Track request, quote, supplier, customer acceptance, booking, fulfillment and payment separately. A paid request may still be awaiting provider confirmation; an approved pay-on-arrival booking need not be prepaid. The configured approved payment condition, not an assumed universal rule, governs confirmation. Quote amount/currency/date/party/conditions must be versioned and expire explicitly; supplier refusal, expired quote, changed party, cancellation and refund preserve their own states and history. Never switch price or accept changed conditions silently.

Only issue a booking confirmation/voucher when the exact offer is accepted, the supplier/capacity is confirmed, the applicable payment condition is satisfied and the native booking action/readback is evidenced. Do not infer confirmation from a positive-sounding chat or screenshot of payment. Timeouts require reconciliation before retry; late callbacks must reference the same request and quote version. A human assignee is proposed until accepted. Unanswered provider requests need accountable follow-up within the approved service standard; no invented response deadline.

### Identity and release sequence

The employee identity resolver proves the owner/staff control path only. Guests and non-staying experience buyers must use the existing guest/customer boundary and may see only their own verified request; never enroll them as employees or grant organization access. Team groups receive only role-appropriate operational summaries. Provider contact and margin/private finance stay out of public product cards and unrelated chats.

The next pilot is one selected experience, initially synthetic: verified owner/staff reads request -> approved service selected -> request persisted -> provider response pending -> process/database reconnect -> same request resumes without duplicate booking/payment/notification. Reuse the actual recipient and provider routes only after their precise authorization and availability are proven. An isolated test of the pending stage is not an end-to-end sale.

Acceptance cases, to execute in the existing lane rather than create new tasks:
- Requested experience survives interruption, retaining unverified availability and unconfirmed booking/payment.
- Duplicate inbound event and repeated provider callback produce one commercial action and one appropriate response.
- Provider decline, expired quote, changed date/quantity and weather cancellation do not silently confirm or reuse obsolete terms.
- Incorrect owner/employee/customer scope, private data in a group and stale source are denied without disclosure.
- Confirmed booking, delivered service, charge, collection, refund and supplier settlement are traceable but never counted as the same event.
- Funnel counts are unique inquiries -> valid quotes -> accepted/confirmed bookings -> fulfilled services; conversion has a denominator, contribution has costs and currency. No benefit is claimed from test counts alone.

**Current:** supporting code and isolated tests are under PR210 / the existing identity lane. **Next:** finish durable identity/session proof, then compose the existing request handler and exact commercial gates. **Pending:** fresh product/provider data, quote/booking/fulfillment/payment implementation readback, live OpenClaw/WeSpeak delivery, retention review and production approvals. Functional owners proposed: TERE/Revenue for offer and follow-up, RICO for fulfillment, FIONA for reconciliation, SOBRESITO for technical proof; no human assignment or acceptance is inferred.

## Promotion rule

Do not mark WhatsApp/OpenClaw “full TORO” until the real runtime executes the scenarios above with evidence. Code/spec/CI alone = implementation foundation, not live proof.

## Reconciliation against current main — 2026-10-24

PR210 remains a draft implementation under issue209, not a production activation. The branch is reconciled with current main, preserving all existing test commands and the owner clarification that canonical identity never assigns a role automatically. Onboarding only explains explicitly authorized functions.

Read-only schema inspection confirms that communication_channel_sessions and communication_channel_receipts already exist. Their individual foreign keys and replay uniqueness are present; the proposed composite receipt-scope and experience-continuation constraints are not installed. The SQL file remains an unexecuted draft and must not be used to recreate tables or broaden grants. Compare consumers, exact definitions, permissions and a bounded validation plan before proposing any database change.

The previous blanket table-drop rollback recipe is withdrawn. The rollback-named file now performs read-only constraint inventory only; it is explicitly not a reversal script. A future approved additive change requires a selective reversal with recorded prior state and exact ownership. No canonical table, receipt or consumer may be removed as a PR rollback.

Local regression: the same 96 synthetic Node cases passed using Node24 type stripping for the local harness; the committed harness retains TypeScript transpilation and must pass unchanged in repository CI. Four newly reproduced failures rejected timezone-free or impossible session timestamps after the shared zoned-date validator was reused. No live database writes, identity enrollment, messages, bookings, payments or host operations were performed.

Remaining gates: exact repository CI, compatible caller/adapter, explicit sender binding and role, authorized source read, durable state/receipt persistence, replay/restart and cross-user denial, reviewed database delta if needed, and authorized host acceptance. No new queue, gateway, permission engine or scheduler.
