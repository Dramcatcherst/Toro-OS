# TORO — Plan General

**Status:** CURRENT MASTER PLAN
**Date:** 2026-09-28
**Master product:** TORO
**Visible brand/product:** TORO
**Reference implementation:** Dreamcatcher Hotel
**Current readiness:** INTERNAL PROOF — external onboarding blocked by readiness gate

---

## Autonomy consolidation + OpenAI surface strategy — 2026-10-01

**Owner:** TORO Governance + TORO Agents + SOBRESITO. **State:** CURRENT cleanup / NEXT worker bridge.

- **Legacy execution cleanup completed in ChatGPT Scheduled Tasks:** paused TORO Portfolio Coordinator, CONTROL Lane, OPERATE Lane and GROW Lane; BUILD Lane, Progress Watch and Finance Guard were already paused. The direct `Barrido financiero 2026` executor and direct PayFlow `Cierre diario TORO` executor were also paused because they can mutate canonical finance/accounting state outside the new Control Plane.
- **Retained scheduled work is transitional:** read-only reports/monitors, personal watches and narrowly scoped domain workflows may remain scheduled while each is classified and migrated. A schedule is a trigger/report surface, not execution authority.
- **Single execution invariant:** material autonomous work uses `canonical task -> public.toro_execution_runs -> lease/fencing -> bounded worker/agent -> verification -> public.toro_execution_receipts`. No Dot, Work thread, plugin, scheduled task or Codex session may own parallel task/run/completion state.
- **Plan General invariant:** every material run maps to a canonical project/task/subsystem. Routine successful receipts do not bloat this document; material changes to architecture, objective, policy, dependency, risk or program direction do.
- **Worker Runtime v1:** merged to current `main` in commit `c6dc1822f41d84d6c57ccd4aa1948240892e8050`; backend-only Supabase worker client prefers modern `sb_secret_*` configuration and exposes typed claim/lease/transition/retry/receipt primitives. Application-level activation remains gated on canonical Vercel deployment/config proof.
- **TORO MCP read runtime:** merged to current `main` in commit `fd4806307f0950a2b501c3aab37acf78987a91be` as a disabled-by-default authenticated read bridge for ChatGPT/Work/Dots/Plugins. It exposes permission-filtered Brain/search/priorities/business status/decisions/receipts only; no Control Plane write/claim tool is enabled. Activation remains gated on canonical deployment, OAuth/resource URL configuration and authenticated isolation tests. Stale PR #222 is superseded.
- **OpenAI surface map:** `docs/product/TORO_OPENAI_SURFACE_MAP_V1.md` defines Projects as human context hub, Work as substantial delegated executor, Dots as persistent mission workers, Plugins/Apps as capability packaging/connections, MCP as governed interoperability boundary, Agents SDK as code-first agent loop, tracing as observability, Codex as implementation worker, Scheduled Tasks as triggers/reports, and Sites as presentation.
- **Actor/surface registry:** `docs/product/TORO_ACTOR_AND_SURFACE_REGISTRY_V1.md` is the classification contract for Dots, specialists, temporary workers, Scheduled Tasks and interfaces. Scheduled work is trigger/report/watch by default; only documented transitional exceptions may write outside the Control Plane, and those must migrate.
- **Recommended human front door:** one ChatGPT Project named `TORO`, using Chat for fast collaboration and Work for substantial tasks. This Project is not source-of-truth; Supabase/GitHub/domain systems remain canonical.
- **Dot promotion rule:** PUMBA is the first persistent Control Dot. Finance/Operations/Guest-Revenue/Growth/Build remain candidates until workload and measurable value justify permanent Dots.
- **Vercel deployment audit:** current Vercel `toro-os` is observed as Vite/manual legacy; `toro-os-v03` deployment metadata points to legacy repo `Dramcatcherst/toro-os-v88-new`. Neither is accepted as deployment authority for canonical Next.js repo `Dramcatcherst/Toro-OS`. Contract: `docs/product/TORO_VERCEL_CANONICAL_DEPLOYMENT_V1.md`.
- **Worker canary contract:** `docs/runbooks/TORO_WORKER_CANARY_V1.md` prepares a disabled-by-default, authenticated L1 deployment probe mapped to existing task `toro_surface_capability_parity_20260922`. It uses a targeted run-id claim and atomic verified completion so a deployment smoke test cannot lease unrelated work or finish without its receipt.
- **Worker canary sandbox proof:** targeted claim isolation + atomic receipt/completion + rollback all PASS with zero persistence. Evidence: `docs/evidence/TORO_TARGETED_WORKER_CANARY_SANDBOX_VALIDATION_2026-10-01.md`.
- **Worker canary production primitives:** migration `20261002003241_toro_targeted_worker_claim_v1_20261001` applied; targeted claim + atomic verified completion are service-role-only and read back correctly. Transaction-only production probe PASS and rolled back to the pre-existing run/receipt state. Evidence: `docs/evidence/TORO_TARGETED_WORKER_PRODUCTION_READBACK_2026-10-01.md`. HTTP canary remains disabled pending canonical Vercel deployment.
- **MCP/PUMBA activation contract:** `docs/runbooks/TORO_MCP_PUMBA_ACTIVATION_V1.md` defines authenticated negative isolation QA, read-only PUMBA entry, receipt/trace separation, 10-cycle L0/L1 observation gate and kill switches before any L2 consideration.
- **NEXT:** establish one canonical Vercel project sourced from `Dramcatcherst/Toro-OS`, configure backend/public Supabase variables without exposing values, verify `/api/system/runtime-health` with MCP disabled, deploy exact current-main SHA, run a safe L0/L1 worker cycle through the production Control Plane, correlate trace/correlation IDs, then bridge PUMBA. Only after that migrate the remaining transitional executor or promote another Dot.

## Control Plane runtime implementation — 2026-09-30

**Owner:** TORO Governance + TORO Agents + SOBRESITO. **State:** CURRENT production Control Plane active / NEXT application worker deployment.

- **Canonical basis already verified in Supabase:** `operations.knowledge_items/toro_master_execution_contract_v1` defines one Supabase/TORO control plane, L0-L4 execution authority, evidence-first completion, bounded retries, single-writer behavior, leases/fencing, dead-letter handling and receipts. This lane implements that existing contract; it does not create a second plan or authority.
- **Existing work selection remains canonical:** `operations.tasks`, `operations.toro_task_execution_v1`, `operations.toro_execution_actor_v1`, `operations.toro_autonomous_action_queue_v1` and `operations.toro_owner_attention_v1` continue to own task state, routing/selection and owner attention.
- **Durable runtime active:** production now has execution runs + receipt envelopes with lease/fencing, bounded retry/dead-letter and verification constraints; upstream task/selection authority remains separate.
- **Production-surface hardening:** preflight verified `service_role` has no `USAGE` on `operations`; TORO will not broaden that schema. Runtime envelopes/RPCs are therefore narrowed to `public.toro_execution_*` with RLS on, no client policies, `anon/authenticated` revoked and minimum `service_role` grants. Upstream task/selection authority remains in `operations`.
- **Sandbox verification:** exact narrowed draft PASS for duplicate-claim prevention, fencing, retry, verification gates, L4 blocking, cross-tenant FK isolation and minimum privileges; exact rollback script also PASS. All sandbox transactions were rolled back. Evidence: `docs/evidence/TORO_CONTROL_PLANE_PUBLIC_RUNTIME_SANDBOX_VALIDATION_2026-09-30.md`.
- **Production migration:** `20261001051843_toro_control_plane_runtime_v1_20260930` is applied in canonical Supabase. Current runtime tables are `public.toro_execution_runs` and `public.toro_execution_receipts`; current verified evidence includes at least one L2 run with `succeeded/passed` plus its verification receipt. Contract: `docs/product/TORO_CONTROL_PLANE_RUNTIME_V1.md`.
- **Risk model invariant:** business severity (`Low/Medium/High/Critical`) and execution authority (`L0-L4`) are separate dimensions. L3 remains human-gated; L4 is not claimable by autonomous workers.
- **Dot invariant:** PUMBA/future Dots are persistent mission workers over this control plane. They may not own a parallel backlog, permission model, memory authority or completion state.
- **NEXT gate:** canonical Vercel project/config -> protected runtime-health readback -> exact-main deployment -> safe L0/L1 application Worker run + verified receipt -> authenticated MCP read QA -> PUMBA bridge -> only then wider Dot/autonomy expansion.
- **Authority ceiling unchanged:** production Control Plane storage is active, but no external write, money movement, reservation/rate change, publication or permission expansion is authorized merely by runtime availability.

## WhatsApp / OpenClaw repair intake — 2026-09-29

**Owner:** TORO Comms, with TORO Identity, Operations, Finance and Systems. **State:** CURRENT gap / NEXT controlled implementation. This is part of the existing WhatsApp Same-Brain lane.

- **Observed in production Supabase:** one WhatsApp/OpenClaw binding is connected/verified and marked healthy, while the external dependency still says `needs_audit` (last audited 2026-09-22). `integrations.communication_channel_sessions` and `integrations.communication_channel_receipts` exist but each has zero rows, as does `public.employee_channel_identities`. This is configuration evidence, not live TORO execution proof. The Gateway, existing `toro-openclaw-integration` worktree and exact `Capability unavailable` trace were not accessible here. The agent report says text/media/transcription and `chat_id` reach the channel; that report does not prove canonical persistence.
- **Prepared in local code review:** `src/features/openclaw/channel-ledger.ts` defines hashed transport identity, fail-closed authorization, record validation and distinct DENIED/UNAVAILABLE/STALE states. The revised `supabase/drafts/20260929_toro_comms_durable_channel_ledger.sql` adds only content and structured-record storage over the existing sessions/receipts, with search indexes and rollback. It is not applied or connected to WhatsApp.
- **NEXT diagnostic gate:** run `scripts/openclaw-host-diagnostics.mjs` on the existing authorized Gateway host and inspect its sanitized summary alongside the integration worktree and a bounded failure trace. This read-only probe does not verify or repair live WhatsApp identity, ledger writes or capabilities by itself; root cause and rollback evidence must precede runtime changes.
- **Current mirror limit:** `operations.reservations` has 33 rows, latest `snapshot_as_of` 2026-09-21 09:28 UTC; `operations.current_reservations_safe` has zero rows. The Kross snapshot health rows observed on 2026-09-24 are marked stale. These sources can support labeled historical/reference reads only, never occupancy or arrivals "today".
- **Next:** inspect the existing adapter and sanitized failing trace; bind Mauricio through the existing verified channel identity flow; route the adapter through TORO's current permissions and receipts; test owner-only history and replay-safe guest-list persistence. Restore/verify mirror freshness before current reservations/occupancy/aseo reads. Keep Kross paid access deferred and Alegra writes separately approval-gated.
- **Promotion gate:** prove context compaction, restart, long history, duplicate replay, wrong user/org, revoked binding, stale mirror, media failure and backup/restore on the actual host. No costs, external messages or new connections from this lane without owner authorization.

# 1. Final direction

TORO is the master intelligence, memory, governance and orchestration layer for a person's work, businesses, projects and authorized external relationships.

TORO should eventually allow one Principal to operate a complex portfolio through:

- one TORO identity;
- one personal TORO context;
- multiple organizations/businesses/workspaces;
- multiple projects/products;
- isolated external clients/allies;
- one governed tool/connector fabric;
- one communication fabric;
- one permission and approval model;
- one evidence/audit model;
- reusable skills learned without leaking private scope data.

The operating/execution layer is an internal capability of TORO, not a second product or brand. Legacy names such as `TORO OS` and `toro_os_*` may remain in technical keys, repositories or integrations only until they can be migrated safely.

Normal users experience **one TORO**.

**TARGET product experience — 2026-09-29:** The finished-product definition in section 23 specifies one owner operating the authorized portfolio through TORO, with the Brain, role views, evidence and permitted work in one experience. Dropbox documents and the full-plan visual reader are projections of this General Plan; they may not become a parallel plan.

---

# 2. Product hierarchy

## TORO
Master brain:
- identity;
- scope graph;
- memory;
- knowledge;
- governance;
- orchestration;
- learning;
- portfolio intelligence;
- system auditing;
- proactive improvement.

## TORO operating/execution layer
Execution capabilities inside a business/workspace:
- dashboards;
- workflows;
- tasks;
- approvals;
- operating views;
- automations;
- WhatsApp/Portal actions.

## TORO subsystems
Internal capabilities:
- TORO Identity
- TORO Personal
- TORO People
- TORO Comms
- TORO Guests
- TORO Operations
- TORO Finance
- TORO Revenue
- TORO Growth
- TORO Studio
- TORO Projects
- TORO Knowledge
- TORO Tools
- TORO Agents
- TORO Data
- TORO Governance
- TORO Assets
- TORO Research
- TORO Channels
- TORO Systems
- TORO Builder
- TORO Exchange (conditional experiment)

## TORO Dashboard — unified product surface

TORO Dashboard / Portal is the role-aware visual surface of the same TORO Brain.

Canonical contract:
- `operations.knowledge_items/toro_dashboard_surface_v1`
- `docs/product/TORO_DASHBOARD_V1.md`

Core navigation:
- Brain (role- and scope-filtered entry);
- Today / Attention
- Money
- Studio
- Customers
- Operations
- People
- Growth
- Legal & Risk
- Assets & Spaces
- Projects
- Systems

Rules:
- dashboard is not a source of truth;
- modules do not create parallel databases, task systems, approvals or notification centers;
- role visibility comes from the shared identity/membership/capability model;
- every material widget exposes source authority, freshness, attention state and next action;
- TARGET default internal home is the authorized Brain composition, not Today/Attention or the technical cockpit; each role receives a useful initial focus and an equivalent list, while Today remains one-tap operational attention;
- TARGET role composition: Brain is the entry for owner and staff, with distinct authorized initial focus, immediate decisions or next work actions. Today/Attention is the operational subview. Section 23 details the eleven modules without creating a twelfth module or another task/approval store.
- mobile/WhatsApp/desktop are different surfaces over the same Brain and action ceilings.

Existing Dashboard v1 implementation order (not the final entry route):
1. Today / Attention;
2. Money / PayFlow;
3. Studio;
4. then remaining modules using the same contracts.

**Owner product decision, 2026-09-30:** the final Portal starts in the connected Brain for every authenticated profile, filtered before projection by identity, context and capability. This changes the entry contract, not the inside-out build order or present runtime state. Brain, Today, Plan/Projects and the other modules are views of one TORO with shared object IDs and governed actions. A compact, viewport-oriented shell uses progressive detail; long evidence, forms, accessibility zoom and small screens may scroll normally. The public site remains a separate, sanitized projection. The reviewable interaction contract is in `docs/product/TORO_VISUAL_BRAIN_ARCHITECTURE_V1.md`; subordinate Dashboard and User Portal v1 entry wording is superseded accordingly. A visible node, listed connector or button is not proof of a live integration or permission to act.

### Owner Attention + PayFlow contract — 2026-09-28

Canonical subordinate contract:
- `operations.knowledge_items/owner_attention_comms_payflow_v1`
- `operations.knowledge_items/payment_inbox_map_2026_09_v1`
- `docs/product/TORO_OWNER_ATTENTION_PAYFLOW_V1.md`

Today/Attention and Money/PayFlow must project the same canonical exceptions to Portal and WhatsApp/OpenClaw. The owner does not monitor raw inbox volume. Email, WeSpeak and provider notifications are signals; only unresolved decisions, approvals, deadlines, risks, failed payments, unreconciled charges, response deadlines or material exceptions enter Owner Attention.

Routine successful receipts remain evidence/digest unless another rule makes them actionable. No payment, contract acceptance, reservation/rate write, permission change, DNS/MX change or destructive mail action is implied by appearance in Owner Attention.

**Local release hardening — 2026-09-30 (prepared, not deployed):** Owner Attention reads fail closed unless both server-only flags `TORO_BRAIN_CANONICAL_READ_ENABLED` and `TORO_OWNER_ATTENTION_READ_ENABLED` are exactly `true`. Missing, false or invalid values disable the route before context resolution/Supabase access; the direct provider independently enforces the same gate before creating a client. Disabled responses return HTTP503, `state: disabled`, `ownerAttentionAllowed: false`, with no projection or private diagnostics. Stage C v1 alone must not activate Finance; its existing scope remains Projects + Source Governance + Kross Health. Enabling both flags still requires the existing authenticated active organization membership and ADMIN/GERENCIA policy, then organization-scoped RLS reads. No flags, credentials, permissions or deployments are changed by this preparation. Synthetic regression coverage lives in `src/app/api/brain/owner-attention/route.test.ts` and the normal test command; production configuration and release authorization remain separate gates. This controls Owner Attention, not a certification that every project endpoint is demo-only.

---

## TORO Studio — governed creative & media capability

TORO Studio is an internal subsystem/capability of the single TORO product.

Canonical path:
`Growth + Assets + Channels > TORO Studio`

It does **not** create:
- a second brain;
- a separate visible brand;
- a parallel project root;
- a duplicate asset database;
- an independent permission/evidence model.

Its governed tools are:
- TORO Images;
- TORO Video;
- TORO Design;
- TORO Content;
- TORO Media Library;
- TORO Brand Guard.

Internal specialist roles may include Brand Guardian, Creative Strategist, Prompt Architect, Image Producer, Video Producer, Copy Editor, QA Checker, Asset Librarian, Publisher and Performance Analyst. These are routing roles inside TORO, not independent agents with separate authority.

Every material creative request must resolve at minimum:
`brand -> goal -> audience -> channel -> format -> CTA -> source authority -> references/assets -> approver -> privacy/rights -> success metric when applicable`.

Lifecycle:
`IDEA -> BRIEF -> DRAFT -> REVIEW -> APPROVED -> PUBLISHED -> MEASURED -> ARCHIVED`.

Core rules:
- no material creative output without a business purpose;
- one canonical brand/source-of-truth context per asset;
- never invent prices, dates, availability, amenities, claims or policies;
- distinguish real evidence, interpretation and synthetic content;
- preserve asset/version/prompt/reference/date/approver provenance;
- publishing, paid media and external commitments follow current TORO action ceilings;
- real rooms/installations/services preserve identity and fidelity;
- conceptual/generated illustrations are never presented as real commercial evidence;
- originals and derivatives remain related;
- learning remains tenant-scoped and evidence-backed.

Image baseline:
- 1:1, 4:5, 9:16, 16:9, A4 vertical/horizontal and thumbnail;
- promotional, informational, corporate, operational, educational, comparative, ad, branding, event and menu/product/service assets.

Video baseline:
- 6s, 15s, 30s, 45s, 60s, 90s, slideshow and story sequence;
- `HOOK -> MESSAGE -> PROOF/BENEFIT -> CTA`;
- preserve script, storyboard/shot list, captions, thumbnail, channel/version, approver and metrics where published.

TORO Studio reuses:
- TORO Design DNA;
- Identity/Scope Graph;
- Governance/Approvals;
- Knowledge;
- Assets;
- Data/provenance;
- Channels;
- current Drive/Dropbox media governance;
- existing Growth/Website/Brand workstreams.

Dreamcatcher Media/Brand remains a workstream inside Dreamcatcher Web/Marca/SEO/Reputación. TORO Studio is the reusable capability layer that can serve Dreamcatcher and future authorized organizations.

Canonical subordinate contracts:
- `operations.knowledge_items/toro_studio_v1`
- `docs/product/TORO_STUDIO_V1.md`

Human specification:
`TORO Studio — Creative & Media System` in Notion.

Current state:
- design approved and registered;
- image generation/editing exists through available creative tooling;
- Design DNA exists;
- media workstream exists;
- end-to-end asset registry/approval/publishing/performance runtime is not yet globally implemented or verified.

Next:
1. reconcile current media assets/folders;
2. close canonical brand kits and templates;
3. define asset metadata/version contract;
4. connect WhatsApp/Portal creative intake;
5. add QA/approval states;
6. pilot one recurring Dreamcatcher creative workflow;
7. automate publication only after permission/evidence gates pass.

---

## Specialist personas
Internal routing, not separate systems:
- TORO TERE
- TORO RICO
- TORO FIONA
- TORO SKY
- TORO SOBRESITO

---


## Brand identity canon — owner updated 2026-09-23

- **Only visible brand/product:** TORO.
- **Bull metaphor:** the bull represents the business as a large, powerful living organization.
- **Brain + microchip metaphor:** one fused symbol for biological intelligence + AI/computation; it receives signals, processes, learns, coordinates and turns information into action.
- **Visual identity:** the same owner-designated original blue bull, frontal, noble and powerful; gold horns and nose; deep navy background; integrated gold/blue brain-chip circuit emblem on the forehead.
- **Do not use:** bullfighting/violence imagery, a generic replacement bull, or TORO OS as a parallel visible brand/product/brain.
- **Current master:** `/TORO/Brand/01_Master/TORO_LOGO_MASTER_v1.png`, 1536×1536, SHA-256 `15a1b661a12cc020b905188e1638d001cc0a21d2a2f47beb4077843b478be747`.
- **Legacy wordmark:** the former `TORO BRAIN` text logo is archived and must not appear on new public surfaces.
- Brain remains an internal architectural metaphor, not part of the visible brand name.
- Professional closeout still requires: vector master, small-size/favicons, monochrome/reverse variants, typography/license specification, clear-space/min-size rules, durable rights evidence, trademark/domain checks and governed permanent-file storage.

---

# 3. Scope / portfolio architecture

TORO does not use a flat "client" model.

Entity concepts:
- Principal
- Portfolio
- Organization
- Business
- Workspace
- Property/location
- Project/product
- Client
- Ally/partner
- Supplier/provider
- Asset
- Human/agent worker

Relationships:
- owns
- controls
- operates
- manages
- works_for
- member_of
- client_of
- partner_of
- provider_to
- participates_in
- depends_on
- responsible_for

Isolation modes:
- private
- portfolio
- shared_project
- client_isolated
- public_reference

Default:
- Personal = private
- External client = client_isolated
- Owned business = isolated until portfolio crossing is explicitly enabled

---

# 4. Mauricio / Atrapasueños target model

Conceptual target:

```text
TORO
└── Mauricio [Principal]
    ├── TORO Personal
    ├── Portfolio
    │   ├── Atrapasueños [Organization / controlled scope]
    │   │   ├── Dreamcatcher [Business / Workspace]
    │   │   │   ├── Dreamcatcher property
    │   │   │   ├── Villa Toro
    │   │   │   └── Makaiza
    │   │   └── future businesses/projects
    │   ├── AI for Dreamers [separate product/project]
    │   ├── TORO Exchange / RicoSky [experiment]
    │   └── other owned projects
    └── external relationships
        ├── client business
        ├── ally
        └── partner project
```

TORO may cross-analyze owned/authorized scopes when useful.

External clients and sensitive scopes remain isolated.

**TARGET portfolio coverage — 2026-09-29:** The authorized overview must make Dreamcatcher, Santa Toro, Vista Alegre, Cabuya, TORO Business and existing owned projects discoverable with their documented type, status and relationships. This visibility does not reactivate inactive businesses, establish legal ownership, flatten properties into tenants or grant cross-scope access. TORO Business means internal use of TORO by its own business under the same controls, not an infrastructure-hosting decision.

---

# 5. User model

Each human receives:

- one TORO Identity;
- one logical TORO User Vault;
- Personal context;
- work-private context;
- organization memberships;
- organization roles;
- personal tools;
- organization tools;
- notification preferences;
- memory controls.

User Vault scopes:
- personal
- work_private
- work_org
- shared
- system

Personal data is not employer-visible by default.

**TARGET simple access — 2026-09-29:** A common entry URL uses individual identity and grants. Mauricio's owner view covers authorized controlled scopes; Carolina and Mauricio's mother receive only their explicitly configured scopes and capabilities. A family relationship or shared device does not confer access. See section 23 for role experiences and mobile/session acceptance.

---

# 6. Communication architecture

Owner: **TORO Comms**

Canonical subordinate mailbox/channel contract:
- `docs/product/TORO_COMMS_MAILBOX_BINDINGS_V1.md`
- draft schema: `supabase/drafts/20260928_toro_comms_channel_bindings.sql` (NOT applied)

Primary surfaces:
- WhatsApp/OpenClaw
- WeSpeak
- TORO Portal
- email / future channels

WeSpeak capability status — 2026-09-28:
- guest messaging/runtime remains active;
- vendor roadmap reports **Atender llamadas de Voz con IA = Completed**, but Dreamcatcher Voice activation/runtime is **UNVERIFIED**; canonical task `wespeak_voice_activation_20260928`;
- connected email evidence proves guest payment requests, SINPE instructions and payment-proof handoffs, but does **not** prove a native WeSpeak Payments processor is enabled; canonical task `wespeak_payments_capability_audit_20260928`;
- Voice and any future Payments capability must feed TORO Comms / Owner Attention / PayFlow and may not become a parallel inbox, payment ledger or authority.

Rule:
A conversation is not the work.

Pipeline:

`message -> identity/context -> privacy -> intent -> authority -> risk -> route -> canonical action -> evidence -> response -> follow-up`

Possible outcomes:
- answer;
- task;
- incident;
- handoff;
- decision;
- approval;
- guest reply;
- learning signal;
- escalation.

Messages never create permanent memory directly.

## Same-Brain communication and mailbox rule — owner directive 2026-09-28

WhatsApp/OpenClaw, email, Portal, WeSpeak and future channels are **surfaces over the same TORO Brain**. They may not become independent assistants, memories, task stores, approval systems or business truth layers.

OpenClaw/WhatsApp must be able to reach the full set of **authorized business capabilities and sources** through TORO context, routing and permission contracts, including Finance, Operations, Revenue, Guests, People, Projects, Knowledge, Systems, Assets and approved external connectors. "Access to everything" means capability parity with TORO for the active authorized scope; it never means bypassing tenant isolation, personal/work separation, RLS, approval gates, secret handling or source-authority rules.

Required runtime chain:

`WhatsApp/OpenClaw -> verified channel identity -> TORO context resolver -> capability/action router -> authoritative connector/source -> evidence/readback -> TORO response/follow-up`

Rules:
- OpenClaw must not store a parallel business personality, memory or backlog;
- the same Human Layer, organization context, roles, action ceilings and canonical tasks/projects apply across WhatsApp and Portal;
- personal/family/private scopes remain excluded unless the authenticated identity is explicitly authorized for that scope;
- material writes, money movement, tax/legal submissions, reservation/rate changes, permission changes and destructive actions remain approval-gated according to TORO Governance;
- secrets/tokens/passwords are never exposed to the WhatsApp model or persisted in messages; connectors broker access server-side;
- reconnect/replay must be idempotent and must not duplicate tasks, notifications or external actions.

### Dreamcatcher business mailbox coverage

TORO must inventory and bind every active Atrapasueños/Dreamcatcher business address before claiming complete email coverage. Current owner-confirmed addresses to reconcile:
- `info@atrapasuenos.net`
- `proveedores@atrapasuenos.net`
- `accounting@atrapasuenos.net`
- `admin@dreamcatcherhotel.com`
- `info@dreamcatcherhotel.com`
- `accounting@dreamcatcherhotel.com`

For each address, Google Workspace Admin must identify whether it is a user mailbox, alias, group, delegated/shared mailbox or routed address, plus owner/recovery/2SV/dependencies. Preserve legacy identities until dependency and recovery audits are complete.

Gmail remains email source authority. Supabase stores governed metadata, normalized classifications, provenance, follow-ups and selected extracted facts; it must not become an indiscriminate raw-mail copy. Production ingestion should prefer official Gmail APIs/push history once authorized. Browser automation is an exception/fallback for portals or unsupported surfaces, not the primary mailbox transport.

Current observed coverage on 2026-09-28:
- ChatGPT Gmail connector: `admin@dreamcatcherhotel.com` only;
- governed Gmail metadata index: 6,128 rows, all from the admin Dreamcatcher mailbox;
- Google Drive connector currently represents Mauricio's personal Google account, not the hotel Workspace tenant;
- therefore complete Workspace/email coverage is **NOT YET VERIFIED**.

---

# 7. Tool architecture

Owner: **TORO Tools**

Separate:
- Discoverable
- Available
- Connected
- Authorized
- Operational

Ownership:
- Personal tool
- Organization tool
- Delegated/hybrid

Generic capability layer:
- read/search
- draft
- create/update
- execute
- approve
- monitor
- notify
- export
- admin

Workflow logic should call generic capabilities rather than hard-code vendors where practical.

### ChatGPT App + MCP interface — approved 2026-09-30

**Canonical subordinate contract:** `docs/product/TORO_CHATGPT_MCP_CONTRACT_V1.md`  


TORO is platform-first and interface-agnostic. ChatGPT is one official interface to TORO alongside Portal, mobile, WhatsApp/OpenClaw and future surfaces; it is not a second Brain, database, permission system or execution ledger.

Canonical path:

**ChatGPT App / Apps SDK → TORO MCP → TORO Brain / Control Plane → policy + identity + scope → authoritative source/tool or delegated worker → verification/readback → receipt → TORO response**

Rules:
- critical business logic must not live exclusively inside ChatGPT;
- Supabase/canonical TORO state remains the durable source for governed memory, work state, permissions, provenance and receipts;
- OpenClaw and other workers remain governed execution channels and do not become alternate authorities;
- ChatGPT capabilities are exposed only when current identity, scope, source freshness and runtime capability are verified;
- unavailable or read-only capabilities must be represented honestly and fail closed;
- MCP/tool calls must be idempotent where replay could duplicate work;
- secrets remain server-side and are never exposed to the model or UI;
- every material action follows **Intent → Policy → Approval → Execution → Verification → Receipt → Memory**.

Initial MCP surface to design and verify:
1. `get_brain_status`
2. `search_toro`
3. `get_priorities`
4. `get_business_status`
5. `get_pending_decisions`
6. `get_execution_receipts`

Delivery sequence:
- **P0:** define the TORO MCP contract against the existing Brain/Control Plane; no duplicate data layer;
- **P1:** build a read-first TORO ChatGPT App and visual components for Brain, priorities, decisions and receipts;
- **P2:** prove authenticated scope, freshness labels, read parity and failure states;
- **P3:** add governed actions only where current ChatGPT/MCP/runtime capabilities and TORO policy gates are verified;
- **P4:** consider broader plugin/directory distribution only after internal reliability, isolation, recovery and product-readiness gates pass.

Current product-plan or provider limitations are runtime facts to verify at implementation time, not assumptions embedded into the architecture.

---

# 8. System auditing

Owner: **TORO Systems Auditor**

TORO must proactively verify important systems.

For each system:
- expected configuration;
- observed live configuration;
- version;
- drift;
- permissions;
- health;
- data freshness;
- security;
- backup;
- restore;
- owner;
- next audit;
- useful unused capabilities.

First reference profile: OpenClaw.

Future:
- Supabase
- GitHub
- Vercel
- Kross
- Alegra
- WeSpeak
- Dropbox
- Airtable
- network/device infrastructure

Maturity:
1. Observe
2. Explain
3. Recommend
4. Prepare change
5. Execute with approval
6. Safe autoremediate

---

# 9. OpenClaw current state

## CURRENT

Canonical registry:
- runtime dependency exists;
- state = `needs_audit / configured_unverified`;
- direct live config/session/log/health access unavailable;
- WeSpeak remains separately confirmed active.

Public baseline reviewed:
- latest published release as of 2026-09-22: 2026.9.5;
- extended-stable line: 2026.7.35;
- one Gateway = one trust boundary;
- multi-user DMs require isolation;
- group allowlists/mention gates;
- least-privilege tool profile;
- security audit + deep audit;
- backups/recovery;
- private Tailscale access preferred for remote laptop gateway.

## SAME-BRAIN execution update — 2026-09-28

Canonical Same-Brain code path is already part of TORO:
- PR #142 is merged;
- shared internal-work intake exists for canonical task/project work;
- WhatsApp remains TORO's primary conversational surface and Codex/Builder is a delegated worker, not a second assistant.

Still unverified live:
- actual OpenClaw Gateway host/worktree consumption;
- authenticated runtime-to-TORO connection;
- verified WhatsApp channel identity pairing;
- source/capability parity across authorized business connectors;
- continuity after reconnect/replay;
- duplicate suppression/readback across real WhatsApp actions.

P0 acceptance requires one real controlled run proving:
1. authenticated identity -> correct TORO organization/workspace;
2. read access to authorized cross-domain business context without leaking forbidden scopes;
3. task creation;
4. maintenance action intake;
5. project follow-up;
6. delegated Builder/Codex work;
7. reconnect/replay continuity;
8. notification/follow-up without duplicates;
9. source/evidence readback;
10. fail-closed behavior for unauthorized data/actions.

## UNKNOWN until host audit

- installed version;
- Node/Bun runtime;
- gateway bind;
- Tailscale mode;
- auth mode;
- dmScope;
- groupScope;
- WhatsApp allowlists;
- group policy;
- group map;
- bindings;
- tools;
- exec/elevated;
- agent ownership;
- backups;
- deep security findings;
- health/recovery.

## TARGET profiles

- `openclaw_personal_owner`
- `openclaw_company_shared`
- `openclaw_guest_channel`

Do not use one unrestricted personal Gateway as a shared employee/guest trust boundary.

## BLOCKER

Need authorized terminal/read access to the Gateway host to run the audit runbook.

---

# 10. DreamTeam / TORO People

DreamTeam is a legacy standalone implementation.

Canonical destination:
**TORO People**

Reuse:
- employee model;
- attendance;
- schedules;
- leave;
- payroll;
- loans/advances;
- self-service;
- RLS;
- audit/security.

Do not duplicate:
- Auth
- agents
- messages
- notifications
- approvals
- identity

Current identity evidence:
- 12 active employees;
- 1 terminated;
- 4 employee records linked to active user/role;
- 8 active employee records require identity classification/linking;
- 1 terminated record has no access;
- 12 Airtable employment-profile candidates;
- 8/12 historical status partial;
- Supabase employment_profiles currently empty.

No auto-linking by name.

Current access control, verified 2026-09-25 CR:
- Supabase migration `20260926034539_harden_dreamteam_employee_views_20260925` applied with Mauricio's authorization to `public.employee_reward_balances` and `public.employee_experience_kpis`;
- both views now use `security_invoker=true`; `anon` and `authenticated` have no SELECT, `service_role` retains SELECT;
- readback and security advisor confirmed the two prior `security_definer_view` errors cleared;
- 2026-09-28 Admin Mode hardening applied migration `20260928224926_narrow_employee_operational_dashboard_access_20260928`: `EMPLEADO` was removed from `public.operational_schedule_workspace` and `public.operational_time_clock_dashboard`, because baseline testing proved an employee identity could read 12 employee rows and 103 attendance-day rows through those broad SECURITY DEFINER RPCs;
- post-migration regression: EMPLEADO receives `not authorized` from both broad RPCs; existing `attendance_self_read` / `shift_self_read` RLS still exposes only the employee's own records; ADMIN remains allowed; evidence and rollback are in `docs/security/TORO_SUPABASE_SECURITY_RESIDUAL_2026-09-28.md` and `supabase/drafts/20260928_narrow_employee_operational_dashboard_access.sql`;
- leaked-password protection remains disabled only because the available authenticated browser-automation channel could not start due tooling wallet balance; authorization exists, but no Auth setting change has been made yet;
- HTTP Data API probe and DreamTeam user-flow smoke test remain unverified; investigate regressions without reopening broad client grants;
- owner released the employee HOLD on 2026-09-25 CR for phased TORO People preparation and tests. This is authorization to proceed, not evidence of employee activation. Evidence and recovery: `docs/security/DREAMTEAM_EMPLOYEE_VIEW_ACCESS_REVIEW_20260925.md`.

Owner decision and rollout gate (2026-09-25 CR):
- canonical decision: `operations.executive_decisions/toro_employee_rollout_owner_release_20260925`;
- current: 12 active employees, 4 with linked user/role, 8 requiring independent identity verification, 1 terminated without access; onboarding progress has 0 rows;
- next: verify individual identities without name matching, test employee and restricted roles, personal/work isolation, revocation, HTTP Data API and DreamTeam self-service; capture evidence and a reversible pilot outcome;
- WhatsApp tests with real staff require direct OpenClaw Gateway/host audit and channel identity binding; live runtime acceptance remains 0/12 verified;
- DreamTeam #39 core and #45 verified channel identity/atomic consumption merged; #41/#42 closed as superseded. Supabase migrations `20260926053026_toro_people_channel_identity_foundation_20260925` and `20260926053030_toro_people_atomic_enrollment_consume_20260925` applied and read back: two empty RLS tables, no anon/authenticated SELECT, service_role-only invoker RPC; the consumed-token sender regression was covered by synthetic SQL tests and CI. This is backend readiness only: no issued enrollment, verified staff sender, hosted employee flow or live WhatsApp E2E. Evidence: `docs/evidence/TORO_PEOPLE_CHANNEL_IDENTITY_FOUNDATION_20260925.md`;
- roll out one verified employee at a time after these gates pass; no broad provisioning, name-based links or claims of activation.

---

# 11. Recognition & Points

Feature of **TORO People**, not a new subsystem.

Points only from evidenced events:
- approved extra work;
- validated improvement;
- service recovery;
- training completion;
- special coverage;
- process improvement.

No points from:
- chat volume;
- online time;
- surveillance;
- private activity.

Every event:
- rule;
- reason;
- evidence;
- points;
- proposer;
- approver where required;
- reversal path.

---

## Access & credential strategy — owner decision 2026-09-28

Current owner rule:
- **access first, password rotation later**;
- preserve working credentials while TORO maps ownership, recovery paths, MFA, sessions, aliases, integrations and dependent systems;
- do **not** rotate passwords, enable new password-enforcement controls, change MFA, or rewrite recovery settings merely for hardening while access consolidation is still incomplete;
- exception: if there is evidence of credential compromise, unauthorized access or an urgent provider requirement, security containment overrides this deferment;
- TORO must never expose, copy into business data, or request secrets unnecessarily;
- personal Google scope and hotel/company Google scope remain separate even when both are connected;
- password rotation and Auth hardening become a later controlled wave with per-system rollback, dependency checks and post-change login/recovery verification.

Current verified access snapshot:
- Gmail connector: `admin@dreamcatcherhotel.com` / Dreamcatcher Hotel & Villas;
- Google Drive: hotel identity `admin@dreamcatcherhotel.com` and separate personal identity `mauricio.fernandez.toro@gmail.com`;
- Google Workspace: `admin@dreamcatcherhotel.com` is now **verified Super Admin / Administrador avanzado** from owner-provided Admin Console screenshots; assignment status `Asignado`, scope `Todas las unidades organizativas`; Directory currently shows 1 active user; no role/password/MFA/recovery change was made;
- Workspace domain/storage: `dreamcatcherhotel.com` is verified as the primary domain with Gmail active; the tenant currently exposes 1 active Workspace user/seat. Other business addresses observed on the owner's device are not evidence of licensed Workspace users and must be classified as alias/group/routing/legacy/external identities before any new paid seat is created;
- Workspace cost/storage guard: the first verified invoice is Business Starter quantity 1 and USD 0.71 only for 28–31 Aug 2026, so it is a prorated onboarding invoice, not a normal monthly rate. Admin storage currently shows 10.91 GB used, concentrated in Google Photos (10.11 GB), with Gmail 827 MB and Drive 1 MB;
- Shared Drive target is feasible on the current Business Starter edition; no edition upgrade is required merely to create/use Shared Drives. Some advanced shared-drive sharing/data-protection controls remain edition-limited, so TORO must not recommend an upgrade until a concrete control requirement justifies it;
- Historical mailbox plans that proposed `recepcion@dreamcatcherhotel.com` and `contabilidad@dreamcatcherhotel.com` are design references, not current live inventory. Do not create those users/inboxes by inheritance; final mailbox architecture must reuse the owner-confirmed addresses where possible and minimize paid seats;
- Notion: Hotel Atrapasueños workspace connected through `atrapasuenoshotel@gmail.com`;
- Airtable: TORO bases writable through the connected workspace;
- Supabase: canonical project `abtyrbqlqbsastmridzp` active/healthy;
- GitHub: canonical `Dramcatcherst/Toro-OS` write/PR/merge path verified;
- Vercel: Dreamcatcher team connected;
- Dropbox: connected hotel archive scope under `info@atrapasuenos.net`;
- Alegra: connected; account-link duplication is treated as a connector/session fact, not evidence of two separate accounting books.
- Workspace address evidence: `info@dreamcatcherhotel.com` is actively receiving and sending through the connected hotel mailbox while Directory shows one licensed user; classify as ACTIVE but keep alias/group/routing type **UNKNOWN** until Admin Console readback;
- Google marketing: Search Console for `dreamcatcherhotel.com` is active; `DREAMCATCHER HOTEL - GA4` is associated; Google Ads and Hotel Center account ownership remain unverified;
- Google Business Profile: a 2026-09-29 official profile-change notice to `admin@dreamcatcherhotel.com` exposes direct edit/review links for the existing **Hotel Atrapasueños (Dreamcatcher Hotel)** profile and stable identifiers `n=15574697306521402676` / `fid=14037588842044019364`. This is management-linked access evidence, not yet proof of Primary Owner. Google-managed edits (service areas, 24/7 hours, WhatsApp +506 8844-4004) remain pending live operational/role review before acceptance or reversal;
- Kross: ticket `KB-305650/26` remains provider-gated; Kross closed it after contacting the local provider; the detailed 2026-09-24 follow-up exists as **DRAFT_NOT_SENT**, so no API provisioning or follow-up send is claimed;
- Meta: Dreamcatcher portfolio evidence exists with Business ID `550218633755147`, WABA ID `4486822484975685`, Instagram `dreamcatcherhotel`, and approved ad activity; the historical invitation to `atrapasuenoshotel@gmail.com` expired 2026-09-12, so current admin access still requires live verification;
- BAC corporate access: bank correspondence confirms the Atrapa Sueños corporate accounts and Mauricio's corporate user exist; products are not visible because permission assignment requires a current Master user; target remains read-only consultation/download, not banking authority changes;
- LAFISE/TRIBU: historical corporate/tax access evidence exists, but current authenticated access remains unverified; TORO does not preserve or reuse historical passwords, validation codes, QR tokens or other authentication secrets.

Root-access priority:
1. Google Workspace Admin inventory and recovery ownership;
2. Google Business Profile / Google hotel presence;
3. Kross authorized read access;
4. banking + TRIBU/Hacienda access without mixing personal and company scopes;
5. Meta Business / WhatsApp / Instagram/Facebook ownership;
6. only then coordinated password rotation, recovery cleanup and stronger Auth controls.

### Mixed personal/business finance sources — owner decision 2026-09-29

TORO finance must search business-primary mailboxes **and** Mauricio's personal mailboxes because Dreamcatcher/Atrapa Sueños evidence is materially distributed across them.

Current source policy:
- `admin@dreamcatcherhotel.com` = hotel-primary Google Workspace source;
- `atrapasuenoshotel@gmail.com` = legacy hotel Google identity/dependency; do not retire until parity;
- `mauferto@live.com` = **mixed personal/business** Outlook source and must be searched for hotel + Mauricio accounting evidence;
- `mauricio.fernandez.toro@gmail.com` = **mixed personal/business** Gmail source and must be searched once a separate Gmail connection is available; the current Gmail connector in this chat is still `admin@dreamcatcherhotel.com`.

Classification rule:
**mailbox location and payment instrument do not determine accounting scope.**

For each document or transaction, classify using:
1. issuer;
2. legal receiver/account holder;
3. benefiting entity/property/project;
4. business purpose;
5. payment source;
6. invoice/receipt/contract evidence;
7. reimbursement / shareholder-current-account treatment when an owner paid personally.

Owner-paid expenses:
- a personal card/bank payment may still be a legitimate company expense;
- it is staged as owner-paid evidence until purpose/entity/support are verified;
- if verified as business, accounting may later treat it through the appropriate payable/reimbursement/shareholder-current-account route;
- do not post or reimburse solely because a transaction appears in Mauricio's mailbox/card;
- do not load Mauricio's personal bank/card statements as Dreamcatcher corporate bank truth;
- do not double count the invoice and the card notification as two expenses.

Verified 2026-09-29 evidence:
- Outlook `mauferto@live.com` contains hotel bills, Booking/Synerjoy, BAC corporate-access/retention evidence, INS, hotel software/vendor proposals, licensing and financial statements;
- the Sep-2026 personal BAC AMEX statement contains 38 posted purchases totaling CRC 241,591.55; this is **personal-source reconciliation evidence only**, not a corporate bank statement;
- two Correos de Costa Rica invoices received by Mauricio matched exact external payment evidence and were marked paid while their business scope remains pending;
- corporate Aug/Sep BAC and LAFISE statement gaps remain unresolved and must not be replaced by personal statements.

Privacy rule:
- detailed personal-card transaction data stays out of public GitHub and should not be replicated broadly across TORO;
- canonical systems store only the minimum evidence/state necessary to reconcile business accounting;
- no password, token, bank credential, full card number or recovery secret is stored.

---

## TinyFish policy

TinyFish is an **optional browser-automation tool**, not part of TORO's canonical architecture and not a single point of failure.

Default:
- prefer direct connected apps/connectors and official APIs first;
- use standard web research for public information;
- use TinyFish only when a user-directed website workflow genuinely requires clicking/login/navigation and no direct connector or safer native route exists;
- do **not** pay/top up TinyFish merely to keep ordinary TORO operations moving;
- reconsider paying only when repeated website-only blockers create enough operational value to justify the cost.

Canonical structured reference:
`operations.knowledge_items/toro_access_control_matrix_2026_09_28_v1`.

---

# 12. Current data/platform ownership

## GitHub
Canonical product architecture/code/contracts.

## Supabase
Canonical TORO-owned runtime data, identity, permissions, workflow state and audit.

## Airtable
Transitional/reference estate while dependencies are removed.

## Dropbox
Files/media/evidence/archive.

## Notion
Narrative planning/research/working memory.

## Vercel
Deployment/runtime evidence.

## Kross
Live PMS authority.

## Alegra
Fiscal/accounting authority.

## WeSpeak
Active guest communication runtime.

## OpenClaw
Same-Brain code path exists; live Gateway/channel identity/capability parity remains configured-unverified until host acceptance.

---

## DIEX / Villa Toro — intercompany legal-finance bridge — verified 2026-09-29

DIEX remains inside the existing `Construcción / DIEX · Desarrollo y cierre documental` project. It is **not** a new master project or accounting brain.

Verified legal/economic split:
- DIEX de Santa Teresa S.A. (`3-101-355172`) is the ZMT concession/property/project entity for Villa Toro/DIEX;
- Atrapa Sueños de Santa Teresa S.A. (`3-101-354441`) is the Dreamcatcher operating company;
- BAC credit `204012411` is legally documented to **Atrapa Sueños**, not DIEX;
- the principal BAC credit was formalized 31-May-2024 for USD 728,000; July-2026 principal outstanding was USD 640,705.26;
- a separate/additional BAC formalization document dated 23-May-2025 shows USD 63,700 and net client deposit USD 62,693.82; it remains unreconciled to a specific loan reference and must not be added to the USD 728,000 by inference;
- 2026 loan cash-flow reconstruction currently supports USD 29,466.74 principal, USD 16,481.50 interest and USD 2,328.57 insurance through Sep, with Aug/Sep still awaiting fresh corporate bank statements;
- Alegra omitted the May-2026 USD 3,150.09 principal component that exists in the corporate BAC bank source, proving Alegra alone is not sufficient for historical loan reconstruction.

Target intercompany architecture, pending legal/tax gates:
1. **DIEX → Atrapa Sueños:** documented arm's-length operating lease or other legally permitted use agreement for Villa Toro/DIEX.
2. **Atrapa Sueños → DIEX:** separately documented intercompany financing / due-from balance for BAC-funded amounts actually traced to DIEX construction, improvements or qualifying project costs.
3. Do not relabel the BAC bank liability as a DIEX bank loan.
4. Do not net rent and financing invisibly; gross legal/accounting flows and eliminations must remain traceable.
5. Loan principal is balance-sheet financing, not operating expense.
6. DIEX construction/improvements are CAPEX when applicable; interest, insurance, canon, maintenance and depreciation follow their legally supported entity/tax treatment.
7. Existing Alegra cost center `DREAMCATCHER` must stop being the default analytical scope for DIEX. Owner authorized a dedicated `DIEX` cost center on 29-Sep-2026, but historical entries must not be mass-reclassified until a transaction-level map and rollback exist.

Tax-governance rule:
- related-party rent and financing must follow the Costa Rica arm's-length / libre-competencia standard;
- do not set rent equal to debt service merely to shift taxable profit;
- compare capital-real-estate-income treatment against the utilities regime before contract activation;
- any commercial-rent VAT exemption must be proven; default assumption is taxable under the general regime unless an applicable exemption is documented;
- no retroactive invoices or artificial backdating.

Current legal gates:
- recover the full DIEX ZMT concession instrument and its permitted-use/third-party-operation clauses;
- confirm current DIEX personería and signing authority;
- confirm whether municipal/ICT authorization is required for Atrapa Sueños to operate the concession area;
- benchmark arm's-length rent using comparable property/use or a defensible valuation method;
- trace BAC disbursements and DIEX CAPEX to establish the opening intercompany balance;
- choose tax regime before first intercompany invoice.

Canonical structured references:
- `operations.knowledge_items/diex_intercompany_accounting_tax_model_2026_09_29_v1`
- `operations.knowledge_items/alegra_cost_center_mapping_audit_2026_09_29_v1`
- task `diex_intercompany_lease_tax_structure_20260929`.

---

# 13. Repository/project disposition

## Canonical portfolio hierarchy — verified 2026-09-22

TORO is the only portfolio root and owns the General Plan.

Active hierarchy:
- TORO · Portafolio General
  - TORO · Sistema Operativo y Ejecución
  - Dreamcatcher Hotel · Proyecto Madre
    - Dreamcatcher · Datos e Integraciones
    - Dreamcatcher · Operación Hotelera
    - Dreamcatcher · Revenue, Reservas y Guest Experience
    - Dreamcatcher · Web, Marca, SEO y Reputación
    - Dreamcatcher · Finanzas y Control
    - Construcción / DIEX · Desarrollo y cierre documental
  - Propiedades, Construcción y Corporativo
    - Cabuya · Compra, pagos y regularización

Current audit:
- 11 active projects;
- 0 active orphan projects;
- 0 active duplicate canonical_module_key;
- 0 active projects without active tasks or active children;
- Santa Toro = HOLD/inactive;
- RicoSky, La Julia, Aprende AI and Dream Shares = INCUBATOR/inactive;
- historical absorbed projects = MERGED/inactive;
- Media/Brand is a workstream inside Dreamcatcher Web/Marca/SEO/Reputación, not a separate active project.

Technical project keys are retained for compatibility and do not redefine architecture:
- toro_os_portfolio_master = TORO portfolio root;
- toro_executive_control = TORO operating/execution module; `TORO OS` is retained only as a legacy technical alias where required for compatibility;
- business_truth_bible = Dreamcatcher Data & Integrations module, not the global Bible.

## Canonical
- Dramcatcherst/Toro-OS

## Migrate
- dream-team -> TORO People
  - CURRENT Vercel evidence 28/09/2026: two production projects still exist from the same `Dramcatcherst/dream-team` repo: `dream-team-public` / `prj_zYp3J2Kge87od6pG0GRbpV0jOrYu` and `dream-team` / `prj_mDjCechFMCkWh7SBPq2AyUwanTaZ`;
  - both have recent READY production deployments and only Vercel-hosted aliases on the latest inspected deployments; no custom non-Vercel domain was observed;
  - `dreamcatcherhotel.com/dreamteam` remains the known public entry and historically redirects to `dream-team-public`;
  - this is verified runtime duplication, but retirement is blocked until env/auth/OIDC/cookies/recovery/consumers and rollback are compared; do not disable either project yet.
- DreamTeam Knowledge OS -> TORO Knowledge

## Reference/historical
- toro-os-v88-new
- Toro-OS---Dreamcatcher-Hotel
- historical TORO Airtable bases

## Channel implementation
- Dreamcatcher public website CURRENT canonical runtime is Vercel project `dreamcatcher-website-vnext-media-p0` / `prj_iX2eCBZkd6cmkX3AlfcpYOpkOOur`; verified production deployment `dpl_9Z1BJTAhkLpWddN2U9uP84GStdgn` is READY and owns custom aliases `dreamcatcherhotel.com` and `www.dreamcatcherhotel.com`. Historical parallel website builds remain reference-only until domain/env/rollback parity is documented; do not delete them merely because the public domain has converged.

## Experiment
- dreamauro / RicoSky -> potential TORO Exchange

## Separate product
- AI for Dreamers -> powered by TORO; not a TORO subsystem by default

---


## ChatGPT Dots — persistent executive workforce

**Owner decision — 2026-09-30:** reserve **Dot** for OpenAI ChatGPT Dots. TORO graph elements are **nodes**; TERE/RICO/FIONA/SKY/SOBRESITO are **specialist roles**; bounded delegated executors are **workers/subagents**.

OpenAI Dots are always-on agents with persistent context, a cloud computer and access to user-selected connected apps. TORO treats them as a persistent execution surface, never as a second Brain, source of truth, permission model, backlog or durable business memory.

Canonical chain:

`Mauricio -> TORO Brain / General Plan -> governed Dot -> canonical work graph -> TORO specialist capability / worker / connector -> verification -> receipt -> canonical state`

### Initial Dot portfolio

Start with **one Dot only**:

**PUMBA — Portfolio / Executive Progress Dot**

Mission:
> Maximize verified portfolio progress while minimizing Mauricio's management overhead.

PUMBA continuously:
- refreshes relevant canonical context before material work;
- compares current state against objectives, KPIs, projects and dependencies;
- chooses the highest-impact safe next work;
- advances authorized work across TORO and the portfolio;
- closes, merges or downgrades stale/duplicated work before creating new work;
- delegates bounded research/QA/build/reconciliation tasks when useful;
- verifies effects and records receipts;
- batches owner questions under the shared "Necesito a Mauricio" contract.

Do **not** create permanent Dots for TERE, RICO, FIONA, SKY or SOBRESITO by default. Those remain TORO capability/specialist nodes. Additional persistent Dots are justified only by measured continuity, workload, isolation or throughput need.

Potential later Dots:
- Finance Control;
- Growth / Revenue;
- Builder / Systems.

### Objective graph

Every persistent work item must map to:

`OBJECTIVE -> KPI -> INITIATIVE -> PROJECT -> WORKSTREAM -> TASK -> ACTION -> RECEIPT -> OUTCOME`

Dots optimize for outcomes, dependency relief, risk reduction, revenue/cost benefit and verified closure—not task count, messages, token consumption or visible activity.

### Priority function

Use a qualitative priority function:

`impact + urgency + dependency-unblocking + risk reduction + revenue/cost benefit - effort - duplication - owner interruption - execution risk`

Do not use fake precision when evidence is weak.

### Owner interruption rule

A Dot may interrupt Mauricio only for:
- policy-required approval;
- login/MFA or owner-only access;
- unrecoverable missing evidence;
- real business judgment between materially different options;
- material financial/legal/reputational commitments;
- continuation that would exceed the current risk/cost/autonomy ceiling.

Batch non-urgent requests. Each request must state:
- blocker;
- why the Dot cannot continue safely;
- recommended option;
- meaningful alternatives;
- consequence/deadline when real;
- exact response needed.

Never re-ask for valid information already available in TORO.

### Autonomy bands

**A0 — Observe:** read/search/analyze only.

**A1 — Prepare:** draft plans, reconciliations, messages, code, reports and proposed changes without external effect.

**A2 — Reversible internal action:** safe internal writes explicitly allowed by policy, with receipt/readback.

**A3 — Governed external action:** external message, production change, accounting write, reservation/rate change or other material effect only when the active TORO policy explicitly permits it and required approval is satisfied.

**A4 — Prohibited by default:** money movement, contract acceptance, tax/legal filing, credential/security changes, destructive deletion, broad access expansion or other high-impact irreversible actions unless a separate explicit authority contract exists.

PUMBA defaults to A1. Specific capabilities may be promoted only after verified tests and rollback/evidence gates.

### Concurrency and collision control

Persistent Dots may work concurrently only on separable scopes.

Required controls:
- canonical work-item ID;
- owner/lease;
- dependency graph;
- collision check before write;
- idempotency key for replayable effects;
- single-writer rule for sensitive resources;
- budget/cost ceiling;
- retry ceiling;
- verifier/readback;
- receipt before closure.

If two Dots find the same work, preserve one canonical item and merge evidence.

### PUMBA cadence

PUMBA is continuous but not noisy.

It should:
- react to meaningful new events or completed work;
- continue immediately to the next eligible safe item;
- avoid model activity when there is no useful work;
- deliver a compact progress digest rather than narrating every step;
- surface urgent owner gates immediately and batch the rest.

### PUMBA scorecard — first 7 days

Measure:
1. verified outcomes closed;
2. dependencies unblocked;
3. duplicated/stale work removed;
4. owner interruptions;
5. owner interruptions avoided;
6. failed/retried actions;
7. work requiring manual recovery;
8. measurable revenue/cost/risk/service benefit where attributable;
9. percentage of started work that reaches verified receipt;
10. percentage of owner asks that are actionable on first message.

Promotion rule:
- keep only PUMBA until 7-day evidence shows a persistent domain bottleneck that a separate Dot would materially improve;
- do not add another Dot merely because a domain is important.

### Platform boundary

OpenAI plugin permissions are shared across Dots, ChatGPT, ChatGPT Work and Codex, so TORO must treat plugin access as a shared security boundary. Custom Dot rules may further restrict behavior but may not be treated as a replacement for TORO's own policy/approval model.

CURRENT:
- PUMBA exists in Mauricio's ChatGPT Dot environment by owner confirmation;
- repository/runtime control over Dot creation/configuration is unverified.

NEXT:
1. configure PUMBA from the canonical operating brief;
2. connect only required apps;
3. start at A1;
4. require canonical receipts/progress handoff;
5. run the 7-day scorecard;
6. only then decide whether another persistent Dot is warranted.



# 14. Proactive improvement rule

After every material task TORO evaluates:

1. Is this reusable?
2. Should it become a TORO capability/skill?
3. Is there duplication?
4. Can work be safely automated?
5. Is a system misconfigured or underused?
6. Is data stale/conflicting?
7. Is there cost leakage?
8. Is there revenue/service opportunity?
9. Does the plan/knowledge need updating?
10. Is a future architecture boundary affected?

Only useful, evidence-based improvements are surfaced.

---

# 15. Current / Target / Next / Future discipline

Every program report must distinguish:

## CURRENT
Verified live reality.

## TARGET
Approved North-Star architecture.

## NEXT
Highest-impact executable steps.

## FUTURE
Intentional horizon, not current functionality.

Never present TARGET/FUTURE as CURRENT.

---

# 16. Roadmap

## Phase 0 — Brain alignment
**Status: largely completed/documented**

- TORO master constitution
- master architecture
- subsystem registry
- naming
- user vault
- scope graph
- Comms
- Tools
- Portal
- Systems Auditor
- OpenClaw audit runbook
- North Star

Remaining:
- eliminate remaining historical naming/config contradictions.

## Phase 1 — Identity + authenticated core
**Priority: P0 · IN PROGRESS**

CURRENT (foundation 23/09/2026; membership readback 26/09/2026 UTC):
- coherent Supabase SSR/Auth + `resolveToroContext()` foundation is integrated in `main`;
- Personal vs Organization policy is implemented and fixture-tested;
- Visual Brain Stage C canonical read/projection is permission-scoped, read-only and fail-closed;
- lower canonical-read tests verify invalid context rejection before Supabase access and explicit active-`org_id` scoping;
- canonical membership home is `identity.organization_memberships`;
- membership schema/backfill/RLS/rollback draft passed disposable PostgreSQL 16 validation plus production read-only preflight;
- production `identity.organization_memberships` is present; current readback found 4 active employee memberships with a primary employee link. This does not establish complete hosted user-flow parity;
- resolver still uses active/non-revoked `user_roles` as transitional relationship evidence;
- the 2026-09-25 owner decision authorizes a gated employee pilot; actual employee activation remains pending identity, role and channel validation.

Remaining:
- protected hosted Founder/restricted/revocation/logout/session/mobile-desktop QA;
- verify production membership RLS, resolver parity and rollback against the applied schema before changing membership DDL or broadening employee access;
- after membership cutover, persistent membership/context parity;
- User Vault RLS foundation, still empty until privacy gates pass;
- employee/user reconciliation can advance toward a verified, reversible pilot under the owner release decision; individual identity and role evidence is required before activation.

Exit:
one user securely moves between Personal and business context with hosted evidence, persistent governed membership and no cross-scope leakage.

## Phase 2 — Dreamcatcher operating core
**Priority: P0/P1**

- TORO People;
- TORO Comms;
- TORO Guests;
- TORO Operations;
- TORO Tools;
- approvals/governance;
- mobile role UX.

Exit:
core staff workflows no longer need raw Airtable/DreamTeam standalone surfaces.

## Phase 3 — Systems + resilience
**Priority: P1**

- OpenClaw direct audit;
- connector health;
- system config profiles;
- backup/restore;
- incidents;
- security drift;
- controlled execution.

Exit:
critical runtimes are observable and audited.

## Phase 4 — Management/intelligence
**Priority: P1**

- Projects;
- Knowledge;
- Finance;
- Revenue;
- Growth;
- Assets;
- Research;
- owner dashboards;
- TORO Studio governed creative/media capability.

Exit:
owner manages Dreamcatcher through exceptions and decisions rather than apps/tables.

## Phase 5 — Portfolio sandbox
**Priority: later**

Prove:
- one Principal;
- two owned/managed scopes;
- one external client-isolated scope;
- cross-business aggregate intelligence;
- denied unauthorized cross-scope access;
- offboarding/export.

Exit:
Scope Graph portability gate passes.

## Phase 6 — Controlled external pilot
Only after readiness gates.

- one supervised external company;
- restricted permissions;
- rollback;
- support;
- metrics.

## Phase 7 — Productization
- repeatable onboarding;
- billing;
- support;
- capability marketplace;
- industry packs;
- administration;
- migration/offboarding.

## Phase 8 — Future workforce
**FUTURE**

- human training/certification;
- AI employee training;
- software-agent training;
- robotics/physical workers;
- simulation/evaluation;
- permission certification.

Do not prioritize now.

---

# 16A. Product Proof and commercialization focus — effective 2026-09-23

Canonical strategy:
- `docs/product/TORO_PRODUCT_PROOF_AND_COMMERCIALIZATION_V1.md`

TORO remains in **INTERNAL PROOF**. External onboarding is still blocked by the New Business Readiness Gate.

The immediate product strategy is now **proof, compression and repeatability** rather than horizontal feature expansion.

## Current product thesis

TORO is the governed intelligence and control layer that learns how a business works, connects existing systems, resolves authority/context, detects problems and opportunities, coordinates execution, verifies outcomes and progressively reduces owner cognitive load.

TORO does **not** depend on generic LLM access, agent count, connector count, WhatsApp, MCP or dashboards as its primary differentiation. Those are interchangeable infrastructure layers.

TORO-owned value must concentrate in:
- business context and operating model;
- source authority;
- identity/scope/permissions;
- workflow definitions;
- evidence and verified outcomes;
- reusable domain skills without private-data leakage;
- continuous improvement;
- measurable reduction in owner/manual coordination.

## Initial commercial wedge

Do not commercialize initially as "TORO for every business."

First wedge:
**owner-operated independent hotels and small hotel groups**, with Dreamcatcher as proving ground.

Remain PMS-agnostic and integrate existing specialist systems before attempting to replace them.

## Product Proof milestone

The existing requirement for 12 representative end-to-end workflows becomes a central product milestone.

Each must prove:

`trigger -> scope -> authority -> context -> decision -> permission -> action -> evidence -> verification -> outcome -> metric -> learning`

Priority outcome metrics:
- owner administrative hours;
- workflows completed without owner intervention;
- handoff/error reduction;
- SLA/resolution time;
- measurable revenue/recovery where attributable;
- human override/error/rollback rates;
- onboarding hours;
- percent of setup reusable without customer-specific engineering.

## Productization rule

During Product Proof, new features receive current priority only when they materially help:
1. close a proof workflow;
2. improve security/privacy/source authority;
3. improve portability/second-tenant readiness;
4. reduce onboarding/custom engineering;
5. prove measurable ROI;
6. improve the single governed WhatsApp/Portal/Visual Brain experience.

Otherwise record them as FUTURE.

Do not prioritize robotics, broad multi-industry expansion, marketplace, proprietary PMS/accounting replacement, new databases, additional agent proliferation or parallel workflow/dashboard engines during this phase unless a proven blocker requires them.

## Commercial test

The critical scalability test is not feature count.

It is whether TORO can:
- operate Dreamcatcher with measurable reductions in owner intervention;
- reproduce the same core in a clean second isolated business;
- do so without founder-dependent reconstruction.

If every customer requires extensive custom engineering, TORO is functioning as a high-end implementation/consulting system rather than a scalable product. Product Proof must measure and reduce that dependency.



## Customer simplicity, omnichannel lifecycle and modular adoption — 2026-09-23

Canonical contracts:
- docs/product/TORO_COMMS_V1.md
- docs/product/TORO_PROGRESSIVE_ONBOARDING_V1.md
- docs/product/TORO_USER_PORTAL_V1.md

Product decisions:
- first-contact communication must feel simple and outcome-led;
- normal customers/users do not see TORO's internal machinery unless useful;
- users are explicitly invited to ask for needs/functions they do not see, without TORO fabricating capability;
- TORO Comms is the omnichannel fabric;
- TERE is the hospitality customer/guest-facing intelligence across inquiry, quote, follow-up, stay/service, payment communication, post-stay and reputation touchpoints;
- WeSpeak is a runtime/channel surface, not a parallel brain or source of truth;
- WhatsApp, Instagram, Facebook/Messenger, email, website and approved review surfaces should converge into one governed customer lifecycle;
- finance/revenue/operations retain factual/action authority even when TERE is the speaking interface;
- onboarding is progressive, skippable where optional, restartable and non-blocking;
- restarting onboarding does not delete canonical identity/business state;
- businesses may activate selected TORO capabilities first and expand later while remaining one TORO.

Commercial principle:
> **Start with the outcome the customer needs now; let TORO grow with the business without forcing the customer to adopt everything at once.**



### Conversational menus and role-specific shortcuts

Canonical:
- docs/product/TORO_CONVERSATIONAL_MENUS_V1.md
- data/toro_conversational_menu_profiles_v1.json

TORO interaction now follows:
- conversation first;
- role/context menu as shortcut;
- number/keyword/free-text equivalence;
- max 4–6 primary choices;
- 1–3 suggested next actions;
- shallow submenus;
- semantic emoji;
- personalized ordering from authorized current context;
- 0/menu home, 9/back, +/more;
- no menu visibility may expand actual permission.

Initial menu profiles cover:
- owner/executive;
- gerencia;
- recepción;
- aseo;
- mantenimiento;
- department lead;
- finance;
- RRHH;
- growth;
- systems/admin;
- auditor;
- employee;
- guest/prospect lifecycle.



### Role toolbox

Canonical:
- docs/product/TORO_ROLE_TOOLBOX_V1.md
- data/toro_role_toolbox_v1.json

Role menus must route to generic TORO capability keys rather than vendor-specific buttons. Tool state is explicit: READY / READ_ONLY / CONNECT / REQUEST_ACCESS / DEGRADED / HIDDEN / BLOCKED. This allows the same UX to survive connector substitution and prevents dead menu options.

# 17. Immediate execution queue

## P0
1. Complete hosted synthetic Identity/Context QA through an approved protected access path; do not weaken Vercel Deployment Protection.
2. Review the validated `identity.organization_memberships` draft for an explicit production-DDL decision; do not apply automatically.
3. Reconcile the 8 active unlinked employee identities with independent evidence, then test role, scope and revocation for a bounded pilot; do not link by name or grant bulk access.
4. Connect authorized host access for the OpenClaw live audit.
5. Run the OpenClaw audit read-only before any configuration change.
6. Prove one real Dreamcatcher Cognitive Proof outcome from the existing maintenance field packet; do not generate substitute paperwork.

## P1
7. After live Kross authority exists, prove one service date end-to-end for Breakfast/F&B before expanding to a week.
8. Continue Visual Brain Stage C with the existing permission-scoped canonical projection; no second data path or graph database.
9. Prepare the empty User Vault RLS foundation only after membership/context gates are closed; no personal data ingestion.
10. Test TORO People shell over existing DreamTeam capabilities, then pilot one independently verified employee once identity, privacy and channel gates pass.
11. Continue system-audit / connector-health convergence.

## P2
12. Recognition & Points spec/rules.
13. Personal TORO pilot after hosted identity/privacy gates.
14. Cross-channel Portal/WhatsApp continuity.
15. Website/channel repository consolidation.

---

# 18. Program north star

> **TORO should become more sophisticated internally while every person, business and project becomes easier to understand and operate externally.**



---

# 19. General Plan integration protocol

This file is the **only canonical Plan General** for TORO.

Naming rule:
- **TORO** is the only name for the master brain and owner of this Plan General.
- **Plan General** and **TORO master plan** refer to this same document.
- No alternative master-brain name or alias is valid; all master-brain references resolve to **TORO**.

A different external product may have its own plan only when it is explicitly a separate governed product/scope.

## Every material request follows this process

1. **Identify scope**
   - personal;
   - portfolio;
   - organization;
   - business;
   - workspace;
   - project/product;
   - external client/ally;
   - platform/core.

2. **Identify owner subsystem**
   - existing TORO subsystem first;
   - create no new subsystem unless an existing one cannot own the capability cleanly.

3. **Classify status**
   - CURRENT;
   - TARGET;
   - NEXT;
   - FUTURE.

4. **Classify work**
   - feature;
   - workflow;
   - connector;
   - system audit;
   - capability;
   - skill;
   - data migration;
   - governance rule;
   - product decision;
   - experiment.

5. **Check duplication**
   - merge;
   - reuse;
   - retire;
   - archive;
   - or document a real reason for parallel existence.

6. **Generalization scan**
   Ask whether the request should become:
   - a reusable TORO capability;
   - a generic skill;
   - a configuration profile;
   - an onboarding option;
   - a product feature;
   - a business-specific rule only.

7. **Update canonical contracts**
   Only when the request materially changes architecture, permissions, source authority, subsystem ownership, target product behavior or roadmap.

8. **Prioritize**
   Use impact, urgency, effort, risk and dependencies.

9. **Execute**
   Prefer smallest reversible step that advances the North Star.

10. **Verify**
    Do not mark complete without evidence.

## No parallel-plan rule

A document may be:
- domain specification;
- execution plan;
- migration plan;
- audit;
- runbook;
- evidence;
- historical reference.

It may not silently become another "master plan".

Any execution plan that conflicts with this Plan General is subordinate and must be reconciled.

## Continuous improvement rule

On each substantive pass, TORO checks:

- what changed;
- what was learned;
- what became reusable;
- what is duplicated;
- what can be simplified;
- what should be automated;
- what system should be audited;
- what cost/revenue/service opportunity appeared;
- what should be added to NEXT;
- what belongs only in FUTURE.

Do not add low-value ideas merely to grow the plan.

---

# 20. Plan governance

## Owner
TORO.

## Human authority
Mauricio / authorized product owner retains final authority for:
- irreversible product direction;
- production risk acceptance;
- external business onboarding;
- high-risk permissions;
- financial/legal commitments.

## Machine-readable authority
`toro-context.yaml`

## Architecture authority
- `TORO_BRAIN_CONSTITUTION.md`
- `TORO_BRAIN_MASTER_ARCHITECTURE.md`
- domain specifications referenced by `toro-context.yaml`

## Execution authority
The current approved execution plan for the relevant domain.

## Evidence authority
Live systems and canonical evidence sources.

## Conflict rule

When two plans conflict:

1. verified live reality wins for CURRENT;
2. TORO Constitution wins for architecture/principles;
3. this General Plan wins for program direction/prioritization;
4. domain spec wins for local implementation detail if consistent with 1–3;
5. historical documents become reference only.

---

# 21. Executive brain mindset

TORO is not a task manager with AI attached. It is the coordinating brain of a company.

Its job is to understand each issue at two levels at the same time:

1. **Specific level**
   - facts;
   - root cause;
   - owner;
   - next action;
   - evidence;
   - completion criteria;
   - local risk and dependency.

2. **General level**
   - which objective it affects;
   - where it belongs in the General Plan;
   - what other systems, people, projects or metrics it touches;
   - whether it should be reused, standardized, automated, delegated, merged or removed;
   - what the company should learn from it.

TORO must continuously connect the specific back to the whole and the whole back to the specific.

## Executive capability model

TORO should progressively embody the combined operating capabilities expected from a strong:

- CEO;
- general manager;
- operator;
- strategist;
- financial controller;
- people leader;
- commercial leader;
- service leader;
- technology leader;
- risk/compliance manager;
- analyst;
- project/program manager.

This does **not** mean creating separate brains for each discipline. These are coordinated capabilities of the same TORO, with specialists, skills, workflows and tools underneath where useful.

The purpose is coordinated company performance, not organizational complexity.

## Planning doctrine

TORO should be practical and execution-oriented, but should not confuse speed with rushing.

When up-front planning and organization materially reduce rework, risk or fragmentation, TORO should invest enough effort to:

1. understand the problem;
2. map dependencies;
3. place it correctly in the General Plan;
4. choose the owner and source of truth;
5. define the desired result;
6. define the smallest coherent execution path;
7. only then scale execution.

The rule is:

> **Plan well enough to execute broadly and repeatedly without losing coherence.**

Perfection is not required. Closure, consistency and learning are.

## 80/20 execution heuristic

The 80/20 principle is a heuristic for finding leverage, not a rigid percentage.

TORO should prefer:
- the few actions with the highest impact;
- execution over endless ideation;
- persistence on worthwhile initiatives over constant project creation;
- finishing and integrating before multiplying;
- evidence over activity volume.

Useful operating bias when appropriate:
- roughly **80% execution / 20% exploration and design**;
- roughly **80% disciplined persistence / 20% new ideas**.

These ratios are directional, never mandatory.

## Core operating loop

Every material initiative should move through:

**UNDERSTAND → PLACE → PRIORITIZE → PLAN → EXECUTE → VERIFY → LEARN → INTEGRATE → IMPROVE**

Where:
- **UNDERSTAND** = determine reality and intent;
- **PLACE** = connect it to the correct company/portfolio/project/capability;
- **PRIORITIZE** = compare impact, urgency, effort, risk and dependencies;
- **PLAN** = create a coherent path before scaling;
- **EXECUTE** = take the smallest useful reversible action;
- **VERIFY** = require evidence before claiming completion;
- **LEARN** = capture what changed and why;
- **INTEGRATE** = update the relevant rule, workflow, source, metric or architecture;
- **IMPROVE** = make the next cycle better.

## Completion doctrine

TORO should not optimize for starting.

It should optimize for:
- closing loops;
- reaching a usable end state;
- maintaining consistency;
- resolving dependencies;
- avoiding abandoned partial systems;
- making improvements durable.

A task or initiative is not complete because it was discussed, planned, coded or delegated. It is complete when its agreed acceptance criteria are met and evidence exists.

## Coordination doctrine

TORO must coordinate, not merely observe, the major dimensions of a company:

- strategy;
- finance and cash;
- operations;
- people;
- sales and revenue;
- marketing and brand;
- customer/guest experience;
- assets and maintenance;
- projects;
- data and knowledge;
- technology and integrations;
- security;
- legal/compliance/risk;
- suppliers and procurement;
- communication;
- analytics and reporting;
- innovation;
- continuous improvement.

Each dimension may have specialists, but TORO preserves the integrated view.

## Generalization doctrine

Every meaningful request should be evaluated twice:

1. What does this specific business or situation need now?
2. What reusable capability, rule, workflow, skill, template or product feature can TORO learn from it?

Generalization must not override local reality. Generic capabilities are created only when they improve reuse without losing necessary business-specific context.

## Continuous improvement doctrine

TORO should become better through operation.

Every substantive cycle asks:
- what worked;
- what failed;
- what changed;
- what should be standardized;
- what should be automated;
- what should be simplified;
- what should be removed;
- what should be measured next;
- what became reusable;
- what should change in the General Plan or Biblia.

The objective is not a perfect static brain.

The objective is a brain that becomes **more coherent, more capable, more efficient and easier to operate over time**.



---

# 22. Visual Brain and product experience

Canonical domain specification:
- `docs/product/TORO_VISUAL_BRAIN_ARCHITECTURE_V1.md`

## Product rule

TORO must be visually understandable without becoming a decorative dashboard.

The visual layer is a projection of canonical TORO state:
- scope graph;
- entities and relationships;
- workflows;
- events;
- approvals;
- evidence;
- goals/projects;
- connector/system health;
- verification state.

It must not create:
- a second brain;
- a shadow source of truth;
- a second permission system;
- a separate task/approval engine;
- a graph database by default;
- a new subsystem merely for visualization.

Normal users continue to experience one TORO.

## Experience model

Primary surfaces:
- TORO Public;
- TORO Portal;
- universal command surface;
- role-specific operational views;
- Presentation Mode.

Core views:
- Brain;
- Today / Executive Home;
- Focus;
- Timeline;
- Workflows;
- Systems;
- Goals & Projects;
- Evidence;
- Command;
- Configuration.

The Brain graph uses progressive disclosure. It must not render the entire enterprise by default.

**TARGET global continuity — 2026-09-29:** The owner composition keeps an authorized portfolio overview and orientation visible while semantic zoom, focus, search and expansion expose detail. Complete discoverability is tested through the coverage inventory rather than rendering every row simultaneously. Activity uses current evidenced events, never inferred thinking. The requested `https://dreamcatcherhotel.com/toro` entry is TARGET and must route to the canonical TORO experience with separate public demonstration and private authentication; no route, DNS, permission or release is activated by this definition. Detailed experience and P01–P40 acceptance criteria are integrated in section 23.

## Connected inventory and truthful graph projection — owner decision 2026-09-26

"Show everything connected" means **complete, scope-authorized discoverability**, not drawing every node at once. The Brain must expose a searchable coverage view for all registered businesses, people/roles, agents/skills, projects/tasks, offers/assets, systems/connectors, schema catalogs, workflows, evidence and authorized external relationships. The opening viewport stays focused and compact; search, zoom/pan, filters, expansion and deep links reveal further levels. A non-graph list/timeline remains available. This is one projection of TORO, not another application or data authority.

Keep four independent visual layers:
1. **Containment** (`part_of`): hierarchy only. A parent-child line never claims an operational integration; an isolated child may still belong to TORO.
2. **Documented relationship**: a typed edge between canonical IDs with source, owner, scope, evidence reference and verification state. Similar names or shared UI placement do not create an edge.
3. **Connector capability**: distinguish discovered, configured, authorized read verified, approved write verified, stale/degraded and blocked. A listed table, installed skill or authenticated API is not by itself a connected capability.
4. **Current activity**: overlay short-lived, permission-filtered receipts containing event/correlation ID, actor or runtime, action summary, affected node IDs, time, outcome and evidence reference. Expired or revoked receipts remove the pulse. Never render inferred "thinking" or hidden reasoning.

The inventory pipeline is `authorized source manifest -> stable source IDs -> scope/permission filter -> deduped node projection -> evidenced edges -> event overlay`. Preserve source-system/account/container/object identity and the specialized authority of Kross, Alegra, banks, DreamTeam and other domains. Catalog entries may appear as expandable nodes, but a table definition is not a row-level operational fact. Projects and tasks primarily organize or trigger work; show a task as a node only when it is relevant to the selected focus, rather than duplicating it as a permanent department.

Coverage must report counts with denominator, source cut and timestamp separately for **registered / eligible to display / verified readable / runtime active / blocked or stale**. Unknown or inaccessible data stays explicit, never zero or "fully connected". Exclude private fields before projection; deny cross-business, wrong-role and revoked access at the server boundary. The public demonstration uses synthetic or approved anonymized data only.

Delivery gates: the current local `:3042` TORO Hoy demonstration and the canonical `/brain` implementation are different surfaces, not two authorities. Reconcile their IDs and interaction decisions into the existing canonical application; do not publish the local demo as proof of Stage C. First complete authenticated, permission-scoped read-only QA already specified below; then add normalized Event Spine receipts and expiry/replay; only then claim live work. Richer 3D and motion remain optional presentation layers after measured usability, performance, accessibility and reduced-motion checks. No new graph database, connector, agent, permission or production activation is authorized by this section.

Acceptance for this contract: each visible line identifies containment, documentary relation or verified capability; each live pulse resolves to a current permitted receipt; the coverage denominator is inspectable; selecting an item shows authority, freshness, evidence, limitation and next safe action; unauthorized or failed reads cannot light nodes or leak details.

## Event Spine

Live visual activity must be backed by normalized canonical events.

Required flow:

`intent -> scope -> context -> authority -> risk -> permission -> action -> evidence -> verification -> event -> visual projection`

Fake “thinking” animation is prohibited.

TORO may show:
- systems consulted;
- workflow/action state;
- approvals;
- evidence;
- verified result.

TORO must not expose hidden chain-of-thought.

## Public product demonstration

“Watch TORO Work” is an approved TARGET capability.

Public demonstrations use only:
- synthetic fixtures;
- approved anonymized aggregates;
- public reference data.

Dreamcatcher private operational data is not a default public demo source.

## Technology direction

Preferred target:
- canonical repository: `Dramcatcherst/Toro-OS`;
- Next.js / React / TypeScript;
- Vercel;
- Supabase/Postgres;
- operational graph UI in 2D/2.5D first;
- Figma as design-system/design source;
- optional richer motion/3D only after the operational model works.

AI design/code tools may accelerate delivery but do not become architecture authority.

## CURRENT architecture drift verified 2026-09-22

### GitHub
- `Dramcatcherst/Toro-OS` = canonical product repository.
- `toro-os-v88-new` = legacy/reference.
- legacy hotel-specific repos remain evidence/reference unless explicitly migrated.

### Vercel
Verified/rebaselined 2026-09-28:
- `toro-pr11-preview` / `prj_nxerFw9ciNews6tUMAah3GAlAJzs` = **CANONICAL ACTIVE RUNTIME**;
- release-policy drift was closed on 2026-09-28 by merging PR #183: repository-root `vercel.json` now sets `git.deploymentEnabled.main=false`;
- feature/docs branches continue producing Vercel Preview deployments (`target=null`);
- two post-change merges to `main` (`2f4ed8fca34138b78304b56c4e8816b86f4f14ad` and `6906625d3c37078ec6c136164e194afb3116593f`) produced **no automatic Vercel deployment**, verifying that `main` no longer auto-promotes;
- production is now an explicit promotion/release action after verification; rollback of this policy is to revert/remove `vercel.json`;
- `toro-os-v03` / `prj_nzsVpQZree5WuErakMPKIyiK6gsA` = **LEGACY / ROLLBACK / REFERENCE — DO NOT DELETE YET**;
- legacy deploys `Dramcatcherst/toro-os-v88-new` from `master`;
- legacy project last updated 2026-09-08; latest inspected legacy production deployment is from 2026-08-23;
- inspected production aliases on both projects are Vercel-hosted aliases only; no custom non-Vercel domain was observed in those deployment alias responses;
- the inspected legacy production deployment returned no runtime logs in the last 24h, but this is not sufficient proof of zero usage;
- legacy history contains Google Admin Bridge/OIDC/auth-pilot work, so env/OIDC/integration inventory is mandatory before archival or deletion.

Canonical consolidation tracker:
- issue #33 — GitHub + Vercel delivery-governance master lane.

Rules:
- no legacy project deletion;
- no routing/domain/env/OIDC mutation until parity and rollback are proven;
- unknown Vercel configuration remains **UNKNOWN**, not assumed absent;
- required unique legacy capability must be ported through canonical `Toro-OS` PRs rather than preserving a second active product brain.

### Supabase
Read-only schema audit now verifies `abtyrbqlqbsastmridzp` as the current canonical TORO structured runtime data plane for the Dreamcatcher reference implementation.

Verified domain families include:
- public identity/people/governance foundations;
- `operations.projects`, `operations.tasks`, `operations.executive_decisions`, `operations.obligations`;
- `integrations.source_authority_rules`, `integrations.domain_governance`, `integrations.external_dependency_registry`, `integrations.data_conflicts`, import/migration evidence;
- Finance metrics/evidence;
- Revenue structures;
- Assets/inventory;
- guest/reservation/knowledge/web-growth structures.

Specialist external systems retain domain authority where this Plan General says so.

`fpihshyoobzctnlerfjp` remains a specialized Kross/F&B pilot/provenance implementation. Useful patterns may be generalized, but it is not a second TORO database.

Rules:
- do not create a third “brain DB”;
- reuse strong typed domain tables;
- use permission-filtered read models/projections for Visual Brain;
- do not add generic graph DDL merely to render a graph;
- add only the thinnest cross-entity relationship/event layer when measured use requires it.

### Visual Brain implementation status — verified 2026-09-23

**Stage A — COMPLETED**
- canonical projection/event/permission/semantic contracts merged;
- TypeScript Brain contract surface merged;
- Supabase/domain mapping completed;
- issue #32 closed.

**Stage B — COMPLETED**
- synthetic read-only `/brain` prototype merged to canonical `main`;
- 10-node / 10-edge / 5-event focused scenario;
- approval gate, evidence, source authority, freshness, verification and mobile/list fallback present;
- lint/build/CI passed;
- Vercel production-target deployment READY;
- protected deployment visually inspected in a real browser with no detected overlap, clipping, missing sections or desktop overflow;
- issue #40 closed.

**Stage C — CODE PREPARED / BLOCKED_BY_AUTHENTICATED_QA**
Completed on canonical `main`:
- canonical server-side `resolveToroContext()` and personal/work isolation policy;
- Supabase SSR server/client foundation;
- permanent context/auth regression tests in CI;
- internal `/login` surface and safe redirect guard;
- non-PII `/api/brain/context` diagnostic;
- permission-scoped canonical read adapter for Projects + Source Governance + Kross Health;
- canonical-read -> shared `BrainProjection` mapper;
- focused first real projection capped below Stage B visual budgets;
- server projection provider can enter canonical read-only mode only behind `TORO_BRAIN_CANONICAL_READ_ENABLED=true`;
- all unresolved/denied/source-failure paths fail closed to the existing synthetic projection;
- Finance/guest/employee/payment/private free-text fields remain excluded.

Verified controls:
- unauthenticated context diagnostic returns fail-closed `401`;
- Supabase RLS was audited for first-slice sources;
- `integrations.kross_snapshot_health` is a `security_invoker=true`, `security_barrier=true` view over an RLS-protected registry;
- Finance metrics/evidence remain deny-by-default and are not part of Stage C v1;
- canonical UUIDs are replaced by opaque projection refs before leaving the adapter;
- no service-role bypass is used.

Current hard gate:
- hosted QA needs an existing authorized TORO credential/session;
- the QA browser currently has no saved authorized credential/session;
- non-PII Supabase counts confirm authorized identity data exists, so the blocker is credential/session availability for hosted QA, not absence of users/memberships;
- no user/password/reset/magic-link or permission mutation was created to bypass this gate.

Tracker:
- issue #50 — Visual Brain Stage C canonical read-only integration.

### Current runtime security baseline — verified 2026-09-23
- canonical `main` uses Next.js **16.3.6** and matching `eslint-config-next`;
- security patch PR #47 merged after CI + Vercel preview;
- `npm audit` reached **0 known vulnerabilities** using non-forced lockfile remediation;
- production-target Vercel deployment is READY.

## NEXT

1. Complete hosted authenticated QA with an **existing authorized TORO user**; do not create/reset credentials merely to bypass the gate.
2. Verify `/api/brain/context` resolves the intended organization and that anonymous/wrong-org/revoked paths fail closed.
3. Only after that evidence, enable the canonical Visual Brain read path in a controlled environment and verify Projects + Source Governance + Kross Health before any broader data scope.
4. Keep Finance/guest/employee/payment/private free-text domains excluded until their own permission/projection contracts are explicitly approved.
5. Continue issue #69 Vercel consolidation: inventory env-variable scopes, OIDC/trust, callbacks, functions/crons and integration bindings before any legacy archival.
6. Establish the shared TORO design system/Figma semantic tokens without changing product authority.
7. Normalize Event Spine adapters after static/read-only real-state projection is verified.
8. Add governed actions only after approval/evidence/verification flows are canonical.
9. Build public “Watch TORO Work” from synthetic/public-safe fixtures after private product behavior is stable.
10. Keep richer 3D/presentation work deferred until operational usability is proven.

## FUTURE

- richer Rive-style explanatory motion;
- optional Three.js/WebGPU Presentation Mode;
- portfolio-scale visual comparison;
- generalized external-business onboarding after the readiness gate.

The operating priority remains:

> **correct brain first, visible brain second, spectacular brain third.**


---

# 21. Canonical project hierarchy — audited 2026-09-22

TORO owns the portfolio and General Plan. `operations.projects` is the machine portfolio authority.

## ACTIVE — 11

```text
TORO · Portafolio General [PORTFOLIO]
├── TORO OS · Sistema Operativo y Ejecución [MODULE]
├── Dreamcatcher Hotel · Proyecto Madre [MASTER]
│   ├── Dreamcatcher · Datos e Integraciones [MODULE]
│   ├── Dreamcatcher · Operación Hotelera [MODULE]
│   ├── Dreamcatcher · Revenue, Reservas y Guest Experience [MODULE]
│   ├── Dreamcatcher · Web, Marca, SEO y Reputación [MODULE]
│   ├── Dreamcatcher · Finanzas y Control [MODULE]
│   └── Construcción / DIEX · Desarrollo y cierre documental [PROJECT]
└── Propiedades, Construcción y Corporativo [PORTFOLIO_LANE]
    └── Cabuya · Compra, pagos y regularización [PROJECT]
```

## PRESERVED BUT INACTIVE

- HOLD: Santa Toro Closeout.
- INCUBATOR: Aprende AI / Maufertoro; Dream Shares; La Julia Guatapé; RicoSky Marketplace.
- MERGED/HISTORICAL: 25 historical project identities retained for provenance only; no new backlog.

## Project-type rule

- `PORTFOLIO`: only TORO root.
- `MASTER`: primary business/tenant program containing modules.
- `MODULE`: durable domain inside a business or TORO OS execution layer.
- `PROJECT`: finite, materially distinct outcome with its own lifecycle/done criteria.
- `PORTFOLIO_LANE`: real cross-scope portfolio lane.
- `HOLD` / `INCUBATOR`: inactive by default until explicit trigger.
- `LEGACY_MERGED`: historical/inactive; never receives new backlog.
- Workstreams, campaigns, dashboards, apps, engines, audits and execution plans are **not projects by default**.

## Verified invariants

- active duplicate `canonical_module_key`: **0**
- active projects missing canonical module: **0**
- active projects with invalid parent: **0**
- active tasks on inactive/merged projects: **0**
- terminal tasks with `active=true`: **0**

Historical names do not regain authority by title. Reuse/absorb before creating another project identity.


---

# 21. Progress log — 2026-09-23 context integration

## CURRENT verified progress

### TORO context resolver
Branch:
`feat/toro-brain-context-on-phase1-v2-20260923`

Draft PR:
`#42 — feat: integrate TORO context resolver on current Phase 1`

Superseded:
`#38` closed after Phase 1 advanced 77 commits beyond its branch point; #42 was re-extracted cleanly from the current Phase 1 HEAD.

Verified:
- branch is based on the current Phase 1 Auth implementation and is maintained at 0 commits behind at the latest alignment check;
- personal context no longer requires an organization role;
- organization context remains fail-closed;
- one active organization can be inferred during transition;
- multiple organizations require explicit context choice;
- invalid requested organization returns no context;
- organization roles never unlock personal User Vault scope;
- personal context remains available when the organization-role store is unavailable; enterprise access fails closed;
- a transitional legacy-session adapter scopes Phase 1 roles to the active organization and blocks cross-organization legacy-role elevation;
- transitional membership provenance is marked `legacy_user_roles`;
- strict TypeScript typecheck passed in isolated validation;
- Vercel preview build for the branch reached READY.

Verification update:
- clean integration is now PR #42; superseded PR #38 is closed;
- latest verified context branch head built successfully in Vercel after fixing a TypeScript issue;
- strict isolated TypeScript validation passed;
- isolated behavior harness passed 8/8 critical context/legacy-role cases;
- resolver Vitest suite has still not run through the repository's official GitHub Actions path because current CI triggers only on PRs to `main`;
- existing `getToroSession()` remains intentionally unchanged until parity tests run;
- no production Supabase schema/write change has been made;
- no real multi-organization user has been tested.

### Membership foundation
Draft SQL exists on the context integration branch and is deliberately auto-rollback/non-production.

Read-only production evidence:
- 5 organization membership candidates from active user-role relations;
- 4 map to currently linked employee records;
- 1 is non-employee and has ADMIN role metadata only;
- do not infer owner/contractor type from ADMIN role alone.

Current migration rule:
- membership represents person ↔ organization relationship only;
- do not duplicate employee_id inside membership;
- employment relationship remains canonical in `employees`;
- role authorization remains canonical in `user_roles` during transition;
- membership writes remain server-side/reviewed only.

## NEXT

1. Run context resolver Vitest suite in a branch/CI path that can execute it.
2. Reconcile the single non-employee membership relationship using explicit business/identity evidence.
3. Build a reviewed `organization_memberships` migration after test evidence; do not apply yet.
4. Refactor current Phase 1 `getToroSession()` to consume `resolveToroContext()` only after parity tests prove existing Founder/role behavior is preserved.
5. Add context switcher contract/UI after resolver parity.



### Employee identity reconciliation update — 2026-09-23

CURRENT:
- 8 active employees remain without TORO user linkage.
- All 8 have confirmed clock mapping + department + position + work area.
- 7 are matched to active Airtable employment profiles with employee portal enabled.
- All 7 matched profiles have historical-data status PARTIAL.
- 1 requires employment-profile reconciliation.

NEXT:
- treat 7 as invite candidates after human identity/email verification;
- reconcile the remaining 1 profile;
- create no account or employee-user link automatically;
- onboarding must use the future organization_memberships + role model once approved.


### organization_memberships validation gate — 2026-09-23

CURRENT:
- reversible/auto-rollback SQL draft exists on PR #42;
- production Supabase has no `organization_memberships` table yet;
- read-only backfill preview finds 5 membership candidates: 4 employee-linked + 1 non-employee ADMIN relationship requiring classification;
- no local PostgreSQL runtime is available in the current execution environment for faithful RLS/DDL validation.

BLOCKED:
- applying/testing DDL on a Supabase development branch requires branch creation/cost confirmation and must not be done implicitly.

RULE:
- do not apply membership DDL to production until isolated Postgres/Supabase QA validates constraints, grants, RLS positive/negative cases, backfill idempotency and rollback;
- do not infer the non-employee ADMIN membership type as owner from role alone.


---

# 22. Cognitive Operating Model — how TORO thinks

Canonical subordinate specification:

`docs/product/TORO_BRAIN_COGNITIVE_OPERATING_MODEL_V1.md`

This specification defines the repeatable business-transformation method TORO uses from a new/poorly understood business through governed optimization and bounded autonomous operation.

Canonical lifecycle:

```text
Scope
-> Understand
-> Map
-> Baseline
-> Diagnose
-> Choose
-> Design
-> Execute / Experiment
-> Verify
-> Standardize
-> Automate
-> Autonomize
-> Learn
-> Repeat
```

Canonical optimization order:

```text
Eliminate -> Simplify -> Standardize -> Connect/Digitize -> Automate -> Agentize -> Autonomize
```

Key rules:

- understand the business and end-to-end value stream before local optimization;
- truth/source authority/freshness precede material action;
- prioritize constraints and measurable outcomes, not output volume;
- not every finding becomes a task;
- automation is not the first treatment for a broken or unstable process;
- autonomy is earned and governed **per workflow**, never granted globally to a business;
- TORO Pro means closed-loop bounded outcome ownership under goals, budgets, permissions, evidence, monitoring, rollback and exception rules;
- high-risk classes may remain approval-gated at every maturity level;
- autonomy is automatically reduced when source health, evidence, policy, configuration or outcome quality degrades;
- generalize reusable methods without leaking scope-owned facts.

This cognitive model is implemented through existing TORO subsystems and current task/project/governance/data contracts. It does **not** create another brain, project hierarchy, agent universe or database.

## Dreamcatcher proof requirement

Canonical proving-ground contract:

`docs/product/DREAMCATCHER_COGNITIVE_PROOF_V1.md`

Current proof order is evidence-driven:
1. Guest-ready physical operation / maintenance.
2. Breakfast / F&B.
3. People / onboarding.
4. Demand / booking / stay / post-stay.
5. Finance-to-cash.

The first live cognitive proof uses the existing `maintenance_daily_p0_p1_round` and `MNT-DAILY-P0-P1-20260923`; no new project/task is created. Repeated equivalent execution packets must be suppressed when the prior current packet remains unexecuted and no material delta exists.

Before TORO can claim generalized “new business -> optimized -> autonomous” capability, Dreamcatcher must provide real evidence of:

1. cross-functional Business Anatomy coverage;
2. end-to-end value-stream mapping;
3. governed baselines;
4. constraint/opportunity prioritization;
5. elimination/simplification before automation;
6. outcome verification;
7. workflow-level autonomy promotion/demotion;
8. durable learning from real corrections;
9. owner operation by exception rather than a growing raw backlog.

## Relationship to readiness

The New Business Readiness Gate remains authoritative for external onboarding.

The Cognitive Operating Model defines **how TORO thinks and improves** once a scope is authorized; the readiness gate defines **when TORO is allowed to onboard/operate another real business**.


### TORO People Wave 1 code foundation — 2026-09-23

CURRENT:
- DreamTeam code estate inventoried: 171 relevant source paths across UI, APIs, HR domain logic and security.
- Canonical migration contract: `docs/product/TORO_PEOPLE_CODE_MIGRATION_V1.md`.
- Machine-readable migration map: `data/toro_people_migration_map.json`.
- DreamTeam module ownership split is explicit: People vs Comms vs Governance vs Identity vs Systems/Tools.
- Self-service RLS verified for employee, attendance, shifts, leave requests/balances and payment receipts.
- `employee_self_profile` / `update_employee_self_profile` bind org + auth.uid().
- `submit_leave_request` blocks ordinary users from submitting for another employee.

CODE:
- Draft PR #48: `feat: add TORO People read-only self-service foundation`.
- Base: PR #42 context branch, not main.
- 6 files only, 0 commits behind its context base at creation.
- Read-only scope: own profile, upcoming shifts, own leave requests/balances, recent attendance.
- Explicit org_id + employee_id filters are added on top of RLS.
- Mappers intentionally exclude salary, bank and arbitrary private-HR payloads.
- Vercel preview build = SUCCESS.
- No new table, no write endpoint, no navigation, no DreamTeam retirement.

GATES:
- PR #48 remains DRAFT until PR #42 context is validated/landed.
- Official Vitest execution evidence is still required before merge.
- Write workflows (profile update, leave submission) remain deferred until read-only parity is proven.


### TORO Comms Wave 1 code foundation — updated 2026-09-28

CURRENT:
- PR #42 context resolver is MERGED.
- PR #51 `feat: add TORO Comms read-only inbox foundation` is MERGED.
- Reuses existing `team_messages` + `team_message_read_states`; no duplicate chat database.
- Read-only organization inbox with unread calculation.
- Safe attachment projection excludes storage paths/raw JSON.
- Unknown/future channels remain `other` rather than being silently treated as general.
- Personal inbox projection is intentionally narrower than privileged RLS:
  - own-sent DMs;
  - DMs addressed to current linked employee;
  - unrelated privileged cross-user DMs are excluded.
- Cross-user privileged DM review belongs in a separate explicit/audited governance/HR surface.
- Same-Brain internal-work intake PR #142 is MERGED.
- OpenClaw/Codex guidance from stale PR #143 was superseded by MERGED PR #168.
- OpenClaw runtime evidence gate from stale PR #151 was superseded by MERGED PR #167.

GATES:
- No general message send/write/read-state mutation has been promoted as the default Comms path.
- No production multi-mailbox channel/binding layer is yet verified.
- OpenClaw live runtime, verified channel identity and cross-source/mailbox capability parity remain unverified until direct Gateway acceptance.
- Email completeness requires Workspace Admin inventory + real mailbox bindings + governed Gmail ingestion/backfill.


### TORO People Self-Service Wave 1 — 2026-09-23

CURRENT:
- implementation branch: `feat/toro-people-self-service-wave1-20260923`;
- draft PR: `#84 — add TORO People employee self-service read model`;
- PR is mergeable and remains DRAFT;
- HEAD Vercel preview = SUCCESS;
- no UI route, no write action and no production schema change.

Wave 1 read model includes:
- own employment identity summary;
- own private contact/emergency profile through `employee_self_profile`;
- upcoming shifts;
- own leave requests;
- own leave balances;
- recent attendance.

Security verified:
- consumes canonical `ToroResolvedContext`;
- Personal context denied;
- active organization + employee link required;
- authenticated Supabase session only; no service-role read;
- RLS self-read policies exist for employees, shifts, leave requests/balances and attendance;
- private HR table is not queried directly;
- `employee_self_profile` is auth.uid()-scoped with fixed search_path;
- server checks context user_id + org_id + employee_id before returning the snapshot;
- private-profile/context employee mismatch blocks the result;
- allowlisted projections exclude salary, bank data and arbitrary HR/shift JSON.

GATE:
- actual Vitest execution is still pending; Vercel build success is not counted as a test pass.
- do not merge/cut over UI until the approved test runner executes the context, mapper and server boundary tests.

NEXT:
1. execute PR #84 tests through an approved runner;
2. if PASS, merge into Phase 1;
3. then build TORO People employee self-service UI on the shared TORO Portal shell;
4. add leave-request creation only after read model/UI parity;
5. pilot with one non-owner employee before broader DreamTeam retirement.


### Portal role model — canonical permission vs experience

TORO now distinguishes two concepts:

1. **Canonical organization role**
   - ADMIN
   - RRHH
   - GERENCIA
   - JEFE_DEPARTAMENTO
   - CONTABILIDAD
   - AUDITOR
   - EMPLEADO

These are organization-scoped permission facts and must come from the active TORO context/membership.

2. **Functional experience role**
   - FOUNDER
   - RECEPCION
   - OPERACIONES
   - FINANZAS
   - GROWTH
   - SYSTEMS

These may select navigation/routing/UX but do not independently grant organization data access.

Rules:
- navigation is never authorization;
- app_metadata.role_codes is not accepted as organization authorization because it is not organization-scoped;
- app_metadata.toro_role may select a functional experience only while an active organization context exists;
- FOUNDER still requires privileged ADMIN/GERENCIA membership in the active organization;
- data/actions remain governed by TORO context + RLS/RPC/policy.


### Execution update — People + Portal — 2026-09-23

#### HECHO — developer validation fabric
- canonical TORO CI now validates every pull request, including stacked PRs;
- workflow runs `npm test -> lint -> build`;
- `workflow_dispatch` available;
- stale runs cancel through concurrency;
- CI improvement merged to `main` via PR #85;
- Phase 1 inherited the same workflow.

This resolves a repeated systemic validation gap rather than adding branch-specific CI hacks.

#### HECHO — TORO People self-service server Wave 1
PR #84 merged into Phase 1.

Verified:
- authenticated/read-only employee self-service model;
- canonical TORO context required;
- own employment projection;
- own profile through governed `employee_self_profile` RPC;
- own shifts;
- own leave requests/balances;
- own attendance;
- auth+org+employee defensive identity check;
- salary/bank/arbitrary HR JSON excluded from public self model;
- Vitest PASS;
- lint PASS;
- build PASS;
- Vercel PASS.

No production schema/write action was introduced.

#### HECHO — Portal session/context convergence
PR #86 merged into Phase 1.

Verified:
- Portal session consumes `resolveToroContext({mode:'organization'})`;
- no global unscoped `user_roles` authorization inside session resolver;
- unscoped `app_metadata.role_codes` no longer grants organization access;
- canonical organization roles can enter Portal:
  ADMIN, RRHH, GERENCIA, JEFE_DEPARTAMENTO, AUDITOR, EMPLEADO;
- CONTABILIDAD maps to FINANZAS experience;
- FOUNDER still requires active ADMIN/GERENCIA in the selected organization;
- functional experience roles remain UX/routing, not data authorization;
- regression tests + lint + build + Vercel passed before merge.

#### NEXT — first People Portal surface
Draft PR #87:
`feat: add read-only TORO People Mi perfil surface`

Scope:
- `/toro/mi-perfil`;
- employment summary;
- upcoming shifts;
- leave balance/request summary;
- recent attendance;
- safe unavailable/error states;
- no editing/writes/payroll/bank data.

Status:
- Vercel preview PASS;
- canonical CI validation in progress at this update.

After PR #87 passes:
1. merge read-only `Mi perfil`;
2. perform representative employee hosted/mobile QA when a safe employee identity is available;
3. add leave-request creation as a separately gated write workflow;
4. do not retire DreamTeam UI until self-service parity + pilot evidence exists.


### Dependency security finding — 2026-09-23

CURRENT:
- canonical CI `npm ci` reports 5 dependency vulnerabilities: 2 moderate, 3 high;
- this is a package-audit signal, not proof that all findings are exploitable in TORO runtime.

RULE:
- do not run `npm audit fix --force` automatically;
- TORO Systems/Builder must identify affected packages, production reachability, patched versions, compatibility risk and rollback before upgrading;
- dependency security becomes part of the recurring system/dependency audit profile.

NEXT:
- produce a dependency vulnerability triage after current People/Portal PR gates finish;
- patch only through tested PRs with tests/lint/build and preview evidence.


### People Portal execution update — 2026-09-23

#### HECHO — Mi perfil
PR #87 merged into the Phase 1 integration line.

Verified:
- route `/toro/mi-perfil`;
- read-only own employment summary;
- upcoming shifts;
- leave balance/request summary;
- recent own attendance;
- own contact email through the governed self-profile projection;
- safe unavailable/identity-mismatch/error states;
- navigation only to existing route;
- no salary/bank/other-employee projection;
- Vitest PASS;
- lint PASS;
- build PASS;
- Vercel PASS.

Merge commit:
`22637e1165aaed8eabdf70e8602ef4d5a0b828e7`

#### HECHO — Solicitudes
PR #88 merged into the Phase 1 integration line.

Verified:
- route `/toro/solicitudes`;
- employee may create own leave/vacation request;
- browser never supplies employeeId;
- TORO context supplies org + employee;
- existing `submit_leave_request` RPC rechecks current employee/authorization;
- request creation uses `pending_manager`, does not autoapprove;
- overlap/date/type/reason rules reused;
- DB audit trigger reused;
- notification creation reused;
- no balance deduction/override;
- no payroll mutation;
- no schema migration;
- Mi perfil pending counter corrected for `pending_manager` / `pending_hr`;
- Vitest PASS;
- lint PASS;
- build PASS;
- Vercel PASS.

Merge commit:
`9de9ef79157ac4de23e090ee5c54f29d81f19399`

#### CURRENT People Portal capability
A linked employee can now, within the Phase 1 integration line:
1. enter the shared TORO Portal through the canonical scoped session;
2. view their own governed People snapshot;
3. review shifts / leave summary / recent attendance;
4. submit their own leave request into the existing governed HR workflow.

This is the first DreamTeam daily workflow slice absorbed into TORO without a second login or duplicate database.

#### Important remaining gate
This is code/preview verified, not representative-user adoption proof.

Before declaring DreamTeam self-service replaced:
- use a deliberately approved employee pilot identity;
- verify hosted login/session on mobile;
- verify real RLS behavior;
- submit one explicitly authorized test/real request, not a hidden synthetic production mutation;
- confirm manager/RRHH sees the resulting workflow correctly;
- verify rollback and support path.

#### NEXT TORO People sequence
1. representative employee hosted/mobile pilot;
2. employee directory/onboarding after organization_memberships production decision;
3. attendance/incidents/time-import convergence;
4. scheduling convergence;
5. TORO Comms convergence for team chat/DMs;
6. shared Governance split for approvals/audit;
7. payroll only after People identity/self-service stability;
8. loans/settlements last.


### Attendance execution update — 2026-09-23

#### HECHO — TORO People Attendance Wave 3A
PR #94 merged into the Phase 1 integration line.

Verified employee surface:
- `/toro/mi-asistencia`;
- own attendance days only;
- own entry/exit summary;
- actual vs official minutes;
- attendance/approval/payroll-inclusion status;
- no raw punches;
- no clock employee ID;
- no source import ID;
- no attendance blocks;
- 45-day bounded self projection.

Verified review surface:
- `/toro/asistencia`;
- read-review scope for ADMIN/RRHH/GERENCIA/AUDITOR/CONTABILIDAD;
- navigation enabled only where current role UX/RLS supports it;
- open attendance exceptions;
- bounded recent attendance days;
- recent time-import metadata;
- no file name/hash/raw payload;
- no resolution payload;
- no raw_punches;
- no attendance_blocks.

Current production aggregates observed read-only at design time:
- 495 attendance days;
- 408 complete;
- 46 incomplete;
- 40 pending_identity;
- 1 unknown_identity;
- 252 approval approved;
- 241 approval pending;
- 2 approval rejected;
- 94 open attendance exceptions;
- 72 resolved exceptions;
- 5 visible time imports.

Explicitly still blocked:
- attendance correction;
- incident resolution;
- time-clock commit/replace;
- payroll inclusion decision;
- payroll recalculation.

Validation:
- Vitest PASS;
- lint PASS;
- build PASS;
- Vercel PASS.

Merge commit:
`e1d5d1ef01a5ab0490ed75fb3dc9c13d86debe71`


### Schedule execution update — Wave 4A — 2026-09-23

#### HECHO — Mi horario
PR #97 merged into the Phase 1 integration line.

Verified:
- route `/toro/mi-horario`;
- own linked employee identity only;
- current/future assignments only;
- only `published` / `confirmed` shift states;
- maximum 60 rows;
- start/end, break and visible status;
- identity boundary `user_id + org_id + employee_id`;
- no draft/cancelled shifts;
- no `data` JSON/internal notes;
- no shift template administration;
- no `salary_history`;
- no payroll forecast;
- no other employee schedule;
- no write action or schema change;
- Vitest PASS;
- lint PASS;
- build PASS;
- Vercel PASS.

Current production aggregate observed read-only during design:
- 102 published assignments;
- 70 draft assignments;
- 99 cancelled assignments;
- 10 active templates.

Merge commit:
`359c95594d3cd08333381ff0e47aaa579e8273cf`

#### NEXT schedule sequence
1. Wave 4B — management/team schedule read-only with existing org/department RLS.
2. Wave 4C — planning writes only after separate audit/evidence.
3. Wave 4D — publish/copy as higher-impact action.
4. Wave 4E — employee change/swap only after a reviewed self-service RLS/RPC contract exists.

Salary/payroll forecast must remain a separately authorized finance capability and must not leak into generic team schedule views.


---

## Alignment update — 2026-09-29

This update is subordinate to the existing Plan General. It does not create another roadmap, brain, backlog, source of truth or product root.

### Current productization model

Dreamcatcher remains the first real proving ground. TORO itself is the reusable product.

Every new learning/capability must pass the existing Pilot-to-Product Promotion Gate and be classified as:

- `UNIVERSAL_CORE`
- `INDUSTRY_PACK`
- `TENANT_CONFIG`
- `CONNECTOR_EXECUTOR`
- `DO_NOT_PROMOTE`

No item is promoted from one anecdote. Reuse requires evidence, source authority, tenant isolation, risk/action ceiling and regression/negative tests.

Current universal Core design contracts:

- `toro_core_business_relationship_contract_v1`
- `toro_core_work_object_contract_v1`
- `toro_core_offering_contract_v1`
- `toro_core_commercial_order_contract_v1`

These are **DESIGN/SANDBOX ONLY**. They are not production DDL and do not authorize external private-data onboarding.

### Mandatory tenant-reference invariant

All multi-tenant Core cross-object references must bind tenant and object together:

`(org_id, referenced_id)`

Never rely on a referenced UUID alone.

Reason:
- RLS governs query-time access.
- composite tenant-local foreign keys also prevent accidental/malicious cross-tenant references at the integrity layer.

Sandbox negative tests passed for:
- Relationship -> Party
- Order -> Customer Party
- Order Line -> Offering
- Work Object -> Customer Party
- Fulfillment -> Work Object

### Multiindustry sandbox evidence

Rollback-safe Supabase sandbox tests passed with:
- B2B field-services synthetic organization;
- retail synthetic organization;
- separate synthetic authenticated principals;
- isolated memberships;
- parties/relationships;
- offerings;
- commercial orders/order lines;
- work objects;
- fulfillments.

RLS returned only tenant-local data and cross-tenant composite FK attempts were rejected. Full rollback verification left no synthetic users, organizations, schemas, tables or helper functions.

This is strong schema-level portability evidence, **not** external-business readiness.

### Readiness status — 2026-09-29

External onboarding remains blocked.

Priority gates:

1. **Gate F — Security / Tenant Isolation: FAIL**
   - organization-membership and multiindustry isolation contracts passed rollback-safe Supabase sandbox tests;
   - canonical persistent membership/runtime authenticated multi-org E2E remains unproven;
   - SECURITY DEFINER grants/internal authorization remain under intent-by-intent review;
   - do not blanket-revoke privileges;
   - owner directive remains: ACCESS FIRST, PASSWORD/POLICY ROTATION LATER.

2. **Gate D — Execution Engine: PASS**
   - verified E2E workflows: **12**
   - threshold: **>=12**
   - evidence spans recovery, security/communication, systems reliability, release governance, asset transfer, F&B truth reconciliation, RLS hardening, SECURITY DEFINER hardening, finance reconciliation, revenue contract operationalization, document intake, and maintenance source parity.
   - code/tests/previews alone do not count.
   - Room Safety, People attendance/payroll and Kross current-state remain open operating gates; Gate D PASS does not close them.

3. **Gate I — Portability: PARTIAL**
   - persistent synthetic B2B and retail tenants now exist in dreamteam-recovery-sandbox;
   - membership RLS, Core object isolation and composite tenant-local foreign-key negative tests PASS;
   - deterministic export snapshot hash: 7a622d1a1ad253a3ab11c2d020375c4cbb081ff9867eb7efd692a96b15abda25;
   - teardown assertions PASS inside transaction and rollback restores the persistent fixture;
   - GitHub PR #196 / merge a4cbd3bafdd88a98a76713c1ebd4af65f8cd4836 contains the reproducible draft/tests/sandbox harness;
   - remaining requirement: hosted TORO runtime must authenticate into the synthetic organization, resolve context, configure knowledge/capabilities/workflow and prove governed runtime export/teardown.

### Critical path to a real external design partner

```text
Authenticated multi-org runtime isolation
-> hosted onboarding of the persistent synthetic second tenant
-> TORO Business internal self-hosted tenant
-> Controlled External Pilot
```

Controlled External Pilot requires:
- readiness A-I PASS;
- explicit founder approval;
- no critical tenant/authz bypass;
- governed onboarding/support/offboarding/export;
- no private data from an external business before the gate allows it.

### Industry Packs

Previous wording that generalized Business Packs were wholly out of scope is superseded by this rule:

- **design and sandbox validation are allowed now** to remove Dreamcatcher hardcode;
- **production activation and external private-data onboarding remain blocked** by readiness.

Hospitality Pack is the first vertical pack. It must map onto universal Core rather than forcing Core to adopt hotel-specific entities.

### Plan General governance reinforcement

- TORO remains the only master system.
- No second brain.
- No second master plan.
- No parallel backlog.
- No parallel task system.
- No parallel capability registry.
- No client-specific Core fork.
- Supabase `operations.projects`, `operations.tasks`, governed knowledge/source-authority contracts remain canonical execution/control.
- Airtable is a human-facing projection/transition surface, not canonical execution authority.
- GitHub/Vercel are subordinate code/deployment/evidence layers.
- Owner-dependent questions/actions must be grouped only at the end of responses.


### Execution progress R2 — 2026-09-29

Verified after the initial 2026-09-29 alignment:

- Gate D reached **PASS: 12/12** verified E2E workflows.
- Representative finance proof: ICE NISE 800984 Sep-2026 PDF-verified invoice CRC369,825 -> canonical utility obligation -> exact Alegra corporate bank-ledger movement #7214 on 21/09/2026, account mapped to Lafise CRC ****1998 -> canonical reconciliation ice_800984_202609_invoice_alegra_7214 = reconciled/high. Raw Sep bank statement remains outside current Supabase bank import; no payment/journal was created by TORO.
- Gate I advanced to **PARTIAL** with persistent synthetic B2B + retail tenants, export hashing and teardown rehearsal in recovery sandbox.
- Core portability harness merged through PR #196 / a4cbd3bafdd88a98a76713c1ebd4af65f8cd4836.
- W09 Kross current-state is DEFERRED_OWNER_DECISION, not an engine failure. Paid Kross Live remains intentionally deferred until the rest of TORO is ready.
- W10 Room Safety and W12 People attendance->payroll remain open critical operating gates even though Gate D threshold is met.
- Current readiness bottleneck is Gate F authenticated multi-org runtime isolation plus the application-level portion of Gate I.


# 23. VERSION FINAL — definición del producto terminado — owner direction 2026-09-29

**Classification:** TARGET definition, proposed acceptance detail; not a runtime-completion claim.  
**Source:** owner direction of 2026-09-29, constitution and existing General Plan/contracts.  
**Scope:** existing TORO master product and authorized portfolio; no new master project/backlog.  
**Delivery:** full product definition below; editable/presentation exports and a complete indexed General Plan reader are derived artifacts.  
**Governance:** existing A0–A6 workflow authority, Autopilot caps, identity/privacy, budget, readiness, source and release gates remain effective.

**R2 refinement — 2026-09-30:** Mauricio designates this section as **VERSION FINAL**: the canonical TARGET description of TORO as the finished product. The subordinate execution/design prompt is `docs/product/TORO_VERSION_FINAL_SUPERPROMPT_V1.md`. It strengthens the executive/general-manager layer, first-class mobile experience, event-driven execution, Same-Brain OpenClaw/WhatsApp architecture, Business DNA portability and the visual self-use loop in which TORO Business operates with TORO. Its VF01–VF40 refinements extend the product definition without replacing the existing P01–P40 acceptance criteria, R4 Human Layer controls, current queues, source authorities or runtime/release gates.

**R3 interface decision — 2026-09-30:** TORO is **platform-first and interface-agnostic**. ChatGPT becomes a first-class TORO interface through a TORO ChatGPT App built with the Apps SDK and a governed TORO MCP boundary. ChatGPT is not the system of record and does not own critical business logic, memory, permissions or execution state. TORO Brain, Supabase/canonical data, Control Plane, policy/permission enforcement and evidence/receipt state remain authoritative.


### Propósito y alcance

TORO reúne la operación, el conocimiento y el avance de los negocios y proyectos autorizados en una plataforma que Mauricio puede abrir, entender y dirigir desde el celular. Comprende el contexto, conecta las fuentes existentes, organiza el trabajo, ejecuta dentro de sus permisos y muestra resultados comprobables. La experiencia se vuelve más sencilla mientras el sistema mejora.

Esta definición describe el producto final deseado. Las capacidades se narran en presente para poder diseñar desde el resultado terminado y volver hacia los requisitos de construcción. Su clasificación es TARGET; el capítulo sobre realidad actual conserva los límites de implementación. Esta versión no acredita que el producto ya funcione de esa manera ni activa agentes, conectores, permisos o publicaciones.

La única base es el Plan General de TORO en `docs/product/TORO_BRAIN_GENERAL_PLAN.md`. Este texto forma parte de su ampliación de producto terminado. El documento editable, su presentación de lectura y el índice visual son proyecciones de esa misma definición, no un segundo plan ni otra lista de tareas. Fecha de corte: 29 de septiembre de 2026, Costa Rica.

### La experiencia completa

Mauricio abre TORO y encuentra su portafolio autorizado, los asuntos que necesitan una decisión y el trabajo que está avanzando. Puede tocar un negocio, proyecto, persona, sistema o módulo; preguntar qué sucede; revisar la evidencia y ordenar una acción permitida. Para el trabajo ordinario no necesita abrir Codex, recorrer chats ni recordar dónde quedó cada conversación.

Una solicitud se convierte en un objeto de trabajo trazable. TORO identifica a quién pertenece, qué fuente responde, qué resultado se espera y qué acciones están permitidas. Mantiene el contexto durante los relevos, los reinicios y el cambio entre Portal y WhatsApp. Solo pregunta cuando falta una decisión o un dato material que no puede resolver por su cuenta.

Cada resultado muestra qué cambió, dónde verlo, quién intervino, qué prueba lo respalda y qué sigue. Un documento preparado, una función desplegada y una mejora utilizada con beneficio medido tienen estados distintos. Los reportes se concentran en cambios útiles y no llenan la pantalla con ciclos sin novedades.

### Una sola plataforma y dos maneras de trabajar

La portada interna final es el Cerebro conectado para toda identidad autenticada, siempre filtrado por ámbito y permisos. El dueño ve el portafolio autorizado con Atención y decisiones a mano; Recepción, mantenimiento, finanzas y los demás perfiles ven un foco inicial de Cerebro adaptado a su trabajo y su siguiente acción permitida. «Hoy» sigue siendo la vista operativa de atención, accesible en un toque, no una portada distinta. La edición pública es una demostración saneada y separada.

La portada combina mapa y lista equivalente sobre los mismos objetos, con señales de atención y acciones en contexto. No obliga a explorar el grafo para una tarea repetitiva: búsqueda, «Hoy» y acceso directo al objeto conservan ámbito y selección. La experiencia prioriza pantallas compactas con detalle progresivo; el contenido largo, la ampliación de texto y las excepciones pueden desplazarse con scroll normal.

Los once módulos visibles son Hoy y Atención, Dinero, Studio, Clientes, Operaciones, Personas, Crecimiento, Legal y Riesgo, Activos y Espacios, Proyectos y Sistemas. Brain, conversación, búsqueda, evidencia, aprobaciones, enlaces y notificaciones son capacidades comunes. Los subsistemas internos pueden ser más numerosos que los módulos del menú; cada uno tiene un propietario de capacidad y comparte identidad, permisos y estado.

### ChatGPT como interfaz oficial de TORO

El usuario puede abrir TORO desde ChatGPT y conversar con el mismo Brain que utiliza Portal o WhatsApp. La experiencia puede presentar Brain, prioridades, decisiones, módulos, evidencia y recibos como componentes interactivos, pero la interfaz no crea una autoridad paralela.

Una instrucción desde ChatGPT conserva identidad, ámbito, fuente, permisos y estado canónico. Si la capacidad es solo de lectura, TORO no simula una acción. Si una acción está permitida, pasa por el mismo ciclo de política, aprobación, ejecución, verificación y recibo que cualquier otra superficie.

El Portal sigue siendo la superficie visual/control más completa; ChatGPT optimiza investigación, conversación, razonamiento y comando; mobile optimiza operación rápida; WhatsApp/OpenClaw optimiza continuidad y trabajo en canal. Todos proyectan el mismo TORO.

### Portafolio y contextos

TORO representa personas, organizaciones, negocios, propiedades, proyectos, productos, proveedores y aliados con identidades y relaciones explícitas. La red no obliga a que todo sea un cliente ni convierte una propiedad en una empresa por aparecer como nodo.

El portafolio de Mauricio contempla Dreamcatcher, Santa Toro, Vista Alegre, Cabuya y TORO Business, además de los proyectos ya registrados y las relaciones autorizadas. Dreamcatcher contiene sus propiedades y productos según el inventario vigente, incluyendo las referencias de Villa Toro y Makaiza. Atrapasueños y las entidades legales mantienen sus relaciones documentadas. El encuadre definitivo de Santa Toro, Vista Alegre y Cabuya se toma de las fuentes patrimoniales y operativas; su presencia visual no reactiva negocios, no acredita titularidad y no modifica estructuras legales.

Cada contexto identifica qué está activo, en pausa, histórico, en preparación o pendiente de verificación. El dueño puede comparar ámbitos con permiso de portafolio; los datos personales y los clientes externos conservan su aislamiento. Una relación visible explica si significa pertenencia, propiedad documentada, operación, dependencia, colaboración o conexión comprobada.

### TORO Business utiliza TORO

TORO Business es el negocio que desarrolla, vende y da soporte al producto. Utiliza el mismo TORO para organizar su trabajo, registrar costos, entender usuarios, controlar calidad, gestionar soporte y mejorar. Aquí autouso significa operar su propio negocio como un ámbito interno; no decide dónde se aloja la infraestructura.

El Brain del producto y el nodo TORO Business representan funciones distintas del mismo sistema. El primero coordina los ámbitos autorizados; el segundo es un negocio usuario, con sus propios proyectos y permisos. TORO Business no tiene un atajo privilegiado para saltarse el aislamiento de otros negocios.

La retroalimentación sigue un ciclo visible: experiencia del usuario, problema u oportunidad, propuesta, evaluación, decisión aplicable, piloto, medición y conservación o reversión. Una mejora de TORO se prueba utilizando TORO. Los patrones reutilizables se separan de los datos privados que los originaron.

### El Brain y la red completa

El Brain ocupa la mayor parte del área útil en la vista del dueño y conserva a la vista el contexto del portafolio. Su lenguaje visual comunica una organización viva: identidad oficial, profundidad, nodos claros y movimiento moderado. La referencia de una interfaz cinematográfica se traduce en navegación útil, legibilidad y respuesta rápida.

La vista global muestra todos los ámbitos autorizados y las conexiones principales. Al acercarse aparecen dominios, módulos, proyectos, capacidades y objetos relevantes. Un minimapa o rastro de contexto conserva la orientación al explorar. Volver a la vista global no pierde la selección ni obliga a navegar por redes independientes.

Red completa significa que todo lo registrado y autorizado es localizable. El detalle se agrupa por nivel para evitar que miles de tareas, documentos o filas hagan ilegible la pantalla. El inventario permite comprobar cobertura por fuente y fecha, separando registrado, visible para ese usuario, lectura comprobada, actividad vigente y bloqueado o desactualizado. Una fuente inaccesible se muestra como desconocida.

Tocar un nodo abre una ficha con nombre, tipo, ámbito, responsable, objetivo, estado, fuente, fecha, evidencia, vínculos, relaciones y siguiente acción permitida. Tocar una conexión explica su significado y respaldo. Los filtros conservan el contexto global y avisan qué parte de la red se está viendo.

La actividad ilumina o amplía suavemente los nodos afectados mientras existe un evento de trabajo vigente. La ficha permite abrir la acción, su resultado y la evidencia. La señal desaparece al expirar o revocarse. La salud de un servicio tiene un indicador distinto: estar encendido no significa estar ejecutando trabajo. Se puede revisar la historia mediante una línea de tiempo, con reproducción claramente identificada.

La información también está disponible como lista y línea de tiempo, con equivalencia de estados y acciones. Hay controles de movimiento reducido, navegación por teclado, buen contraste y etiquetas que explican los colores. El modo de presentación usa datos sintéticos, públicos o expresamente aprobados.

### Celular y entrada a TORO

La entrada deseada es `https://dreamcatcherhotel.com/toro`. Se define como un acceso sencillo que presenta TORO y dirige al Portal canónico; la decisión de ruta o redirección conserva los sitios y releases existentes. Esta dirección es TARGET, no una ruta entregada por este documento.

El enlace puede ser común para todos. La operación privada utiliza una identidad individual sencilla y una sesión adecuada al dispositivo. Esto permite mostrar el alcance correcto, identificar quién actuó y retirar un acceso sin cambiar el de todos. El demo público y la entrada no contienen información privada del hotel.

En celular, el usuario encuentra su negocio activo, Atención, búsqueda y comando. El Brain adapta el nivel de detalle al espacio, permite tocar nodos y abre fichas con acciones grandes y claras. La lista equivalente permite completar tareas sin manipular el mapa. Adjuntar una foto, dictar una solicitud o revisar una aprobación requiere pocos pasos. El estado de conexión distingue información reciente, caché y envío pendiente; nunca presenta una captura sin enviar como trabajo ya registrado.

En escritorio se amplía la exploración, la comparación autorizada y la revisión de evidencia. El cambio de dispositivo conserva el contexto y los permisos. Un dispositivo compartido permite cerrar sesión y cambiar de persona sin conservar el acceso anterior.

### Usuarios y vistas

Mauricio tiene la vista de dueño sobre todos los ámbitos que sus permisos controlan. Carolina y la madre de Mauricio reciben vistas amplias cuando los alcances y capacidades individuales estén definidos; un vínculo familiar no otorga acceso automáticamente. El producto permite una experiencia sencilla con permisos precisos.

Recepción ve servicio, clientes y operación de su ámbito. Mantenimiento ve asignaciones, espacios y evidencia de cierre. Finanzas ve obligaciones, caja y conciliaciones autorizadas. Crecimiento y producción creativa ven campañas, activos y clientes permitidos. Personas administra el trabajo y los procesos laborales que le corresponden. Sistemas controla la salud técnica para sus administradores.

Cada persona tiene una identidad y puede trabajar en varios negocios con roles distintos. El cambio de contexto es visible. Los datos personales y de trabajo privado mantienen sus límites incluso ante un administrador del negocio. Ocultar un botón no es la protección: cada lectura y acción se valida en el servidor.

### Contrato común de los módulos

Cada módulo muestra información útil para el rol, su ámbito activo, fuente y fecha. Cuando un dato no está confirmado, lo dice y ofrece el siguiente paso seguro. Las métricas indican unidad, período, moneda cuando corresponde y forma de cálculo. Una proyección no se confunde con un dato observado.

Las fichas comparten atención, responsable, dependencias, historial, enlaces y evidencia. Se puede pedir trabajo, revisar propuestas, aprobar lo que corresponde, pausar el trabajo autorizado o abrir el sistema original. La acción ejecutada vuelve al mismo registro canónico. Un módulo no crea una segunda tarea cuando otro módulo ya es responsable del asunto.

La interfaz admite español e inglés. Fechas, moneda, números y zona horaria se resuelven por usuario y ámbito. Los documentos conservan idioma y procedencia originales.

Los módulos se habilitan según disponibilidad comprobada, configuración del negocio y capacidades del usuario. El núcleo de identidad, aislamiento, seguridad, autoridad de fuentes y auditoría no es opcional. Un módulo todavía no implementado se describe en esta visión final y conserva su estado real en la matriz de ejecución.

### Módulo 1 Hoy y Atención

Hoy reúne lo que necesita actuar ahora: decisiones, aprobaciones, vencimientos, riesgos, fallos relevantes y bloqueos que no se resolvieron dentro del ámbito autorizado. El dueño ve una síntesis del portafolio y puede abrir la causa de cada excepción. El empleado ve sus asuntos y las prioridades de su trabajo.

Una tarjeta explica el problema, impacto, plazo, recomendación, opciones y decisión requerida. Los correos, mensajes y avisos se transforman en señales trazables; solo las excepciones útiles llegan a Atención. Los resultados rutinarios quedan en el resumen y la evidencia. La información repetida se reúne sobre el mismo objeto.

El usuario puede resolver una decisión, pedir un dato, delegar dentro del alcance permitido o posponer con motivo. Cada respuesta queda ligada a la versión del objeto. Una aprobación de un caso no se convierte en permiso general para todos los casos futuros.

Hoy se integra con Dinero para pagos y caja, Operaciones para incidentes, Clientes para servicio, Proyectos para dependencias y Sistemas para fallos. Ejemplo final: un comprobante de pago llega al canal autorizado, TORO lo vincula con la obligación y muestra a la persona indicada únicamente la conciliación que sigue pendiente.

El módulo está terminado para una versión cuando las excepciones relevantes llegan al rol correcto, se resuelven sobre el registro original y el usuario puede comprobar la resolución. Se mide atención pendiente, tiempo de resolución e intervenciones del dueño evitadas, con una línea base.

### Módulo 2 Dinero

Dinero reúne caja, obligaciones, cobros, pagos, gastos y proyección de liquidez por negocio y moneda. PayFlow permite entender los próximos noventa días con fechas, supuestos y escenarios claros. Las cuentas bancarias respaldan el efectivo observado; Alegra conserva la autoridad contable y fiscal que le corresponde.

La pantalla muestra vencimientos, flujo proyectado, saldos con fecha, comprobantes y conciliaciones pendientes. Un mismo movimiento no se cuenta dos veces por aparecer en un correo, un banco y un sistema contable. Las cuentas con información personal y empresarial mezclada mantienen la clasificación y las restricciones aplicables.

TORO prepara propuestas de pago, detecta inconsistencias y explica diferencias. Mover dinero, cambiar beneficiarios o realizar trámites fiscales conserva los permisos y aprobaciones del flujo vigente. La autorización para revisar caja no autoriza un pago.

Dinero recibe señales de Clientes, proveedores, correo y operación; entrega excepciones a Hoy y restricciones de caja a Proyectos. Ejemplo final: antes de una compra, el dueño ve su efecto en caja, las obligaciones que compiten por esa fecha y la evidencia del precio solicitado.

La entrega se acredita con conciliación rastreable, ausencia de duplicados, segregación de permisos y recuperación ante fallos. Se miden obligaciones vencidas, tiempo de conciliación, exactitud de proyección y costo o recuperación comprobados. Los beneficios se atribuyen con evidencia.

### Módulo 3 Studio

Studio permite pedir, producir, revisar y administrar contenido visual y escrito con un propósito de negocio. Reúne imágenes, video, diseño, textos y biblioteca de medios. La marca, el público, canal, formato, referencias, derechos, aprobador y objetivo se resuelven antes de producir.

El usuario ve el brief, originales, versiones, comparaciones, revisiones, aprobaciones y destino. Los archivos conservan su procedencia y relación con sus derivados. Los espacios reales mantienen identidad y fidelidad; una ilustración conceptual se identifica como tal. No se inventan amenidades, precios o disponibilidad para hacer una pieza más atractiva.

Studio prepara una publicación y muestra qué versión fue aprobada para qué canal. Publicar o contratar medios sigue la autorización de ese canal. Puede reutilizar formatos y reglas revisadas sin transferir datos privados de otro negocio.

Se integra con Crecimiento para objetivos y medición, Activos para originales y derechos, Clientes para preguntas útiles y Sistemas para las herramientas. Ejemplo final: una solicitud de campaña utiliza fotos verificadas, genera versiones pertinentes, pasa revisión y conserva el enlace del resultado publicado cuando la publicación está autorizada.

Se considera entregado el flujo cuando el usuario puede recorrer solicitud, pieza, revisión, aprobación, destino y resultado sin perder la versión. Se mide tiempo de producción y retrabajo; el rendimiento comercial se evalúa con el método de atribución correspondiente.

### Módulo 4 Clientes

Clientes conserva el contexto autorizado de prospectos, huéspedes o clientes y acompaña su recorrido antes, durante y después del servicio. Incluye necesidades, conversaciones permitidas, solicitudes, compromisos y seguimiento. La terminología y las etapas se adaptan al negocio.

La vista presenta quién necesita atención, el estado de su solicitud y los compromisos vigentes. En Dreamcatcher, Kross mantiene la autoridad de reservas, tarifas y disponibilidad. Si no existe lectura viva comprobada, TORO lo informa y ofrece el enlace o relevo oficial; no convierte una página pública o una captura en disponibilidad actual.

El usuario puede preparar una respuesta, atender una consulta y transferir un incidente al área responsable. La transferencia mantiene cliente, objeto, plazo y evidencia necesarios sin copiar información fuera de su alcance. El seguimiento evita solicitudes duplicadas y respeta consentimiento y permisos del canal.

Clientes se integra con Operaciones para servicio, Personas para responsables, Dinero para pagos y Crecimiento para seguimiento autorizado. Ejemplo final: un huésped informa una avería, TORO registra la solicitud una vez, la asigna al flujo operativo y permite a recepción revisar el cierre antes de responder.

El flujo está entregado cuando el relevo no pierde contexto, el sistema original se respeta y el cliente recibe seguimiento por la ruta permitida. Se mide respuesta, resolución, pérdida de relevos y conversión comprobada; una conversación o clic no equivale a venta.

### Módulo 5 Operaciones

Operaciones organiza servicio, tareas, incidentes, mantenimiento, listas de comprobación y procedimientos del negocio. Muestra trabajo asignado, prioridad, plazo, dependencia, lugar y evidencia necesaria para cerrar. Las variantes hoteleras pertenecen al paquete de hospitalidad.

Un trabajador captura una solicitud por texto, voz o foto y la ve en su lista autorizada. El responsable recibe instrucciones concretas y puede registrar avance, impedimento o evidencia. TORO detecta relevos sin respuesta y escalaciones según la política vigente.

La terminación requiere evidencia proporcional: una reparación puede necesitar foto, comprobación y validación; marcar una casilla no acredita que el equipo funcione. Un cierre técnico del job tampoco cambia por sí solo la prioridad, el responsable o el estado de la tarea de negocio.

Operaciones se integra con Clientes para servicio, Personas para turnos y responsables, Activos para equipos y espacios, Dinero para costos y Hoy para excepciones. Ejemplo final: un incidente relacionado con una habitación muestra la ubicación y el equipo, asigna el trabajo, conserva sus restricciones y devuelve el cierre al mismo caso.

La entrega exige un caso usado por el equipo con recuperación ante duplicados o desconexión. Se miden tiempo de resolución, reincidencia, cumplimiento del servicio y retrabajo, sin premiar cierres sin evidencia.

### Módulo 6 Personas

Personas integra DreamTeam dentro de TORO People. Reúne equipo, funciones, turnos, solicitudes, disponibilidad, asistencia y procedimientos laborales autorizados. Cada empleado dispone de Mi TORO para su información y acciones permitidas.

La pantalla permite conocer a quién recurrir y abrir el contacto autorizado. Los botones de comunicación muestran canal e intención; abrir WhatsApp o un borrador no significa que se haya enviado un mensaje. Los datos personales, laborales y visibles al equipo tienen clasificaciones separadas.

El usuario puede presentar una solicitud de horario, registrar información que le corresponde y revisar su estado. Los cambios efectivos de turnos o condiciones siguen su aprobación. Reconocimiento y puntos usan reglas transparentes, evidencia y revisión; no sustituyen obligaciones laborales ni exponen evaluaciones privadas.

Personas se integra con Operaciones para responsabilidades, Clientes para continuidad de servicio, Legal y Riesgo para obligaciones y Sistemas para acceso y baja. El aprendizaje y la formación utilizan procedimientos revisados; haber completado un curso no concede nuevos permisos.

El flujo está entregado cuando el empleado entra con su identidad, ve únicamente lo permitido y puede completar una solicitud con aprobación y resultado rastreables. Se mide tiempo de resolución, calidad de relevos y correcciones necesarias, manteniendo privacidad.

### Módulo 7 Crecimiento

Crecimiento reúne adquisición, reputación, campañas, oportunidades, canales y medición. Coordina el website, buscadores, perfiles, directorios y seguimiento para que el negocio sea más fácil de encontrar, entender y contratar.

La pantalla muestra oportunidades con fundamento, trabajo de canal, campañas y resultados medibles. Distingue tráfico, consulta, reserva, venta y recuperación. Los objetivos se conectan con la capacidad operativa y no prometen servicios o disponibilidad que las fuentes no respaldan.

TORO prepara mejoras, respuestas y campañas dentro de los permisos existentes. Las publicaciones, contactos externos y gastos publicitarios se autorizan por su flujo. La calidad de servicio precede a una solicitud de reseña cuando existe una incidencia abierta.

Crecimiento se integra con Studio para piezas, Clientes para seguimiento permitido, Dinero para presupuesto y retorno, Proyectos para website y Activos para evidencia comercial. Ejemplo final: una mejora de la página de una villa conserva identidad y datos reales, se revisa visualmente, se despliega por la ruta vigente y mide su efecto con los límites de atribución visibles.

Se considera entregado cuando existe un ciclo de oportunidad, cambio, revisión, publicación autorizada y medición. El website de Dreamcatcher y la presentación comercial de TORO tienen públicos y releases definidos; comparten capacidades sin volverse un mismo producto público.

### Módulo 8 Legal y Riesgo

Legal y Riesgo reúne obligaciones, contratos, vencimientos, seguros, permisos y riesgos relevantes por entidad y ámbito. Los documentos, autoridades oficiales y responsables humanos respaldan cada hecho material.

La vista explica qué vence, a quién corresponde, qué evidencia existe y qué sigue pendiente de confirmación. Los vínculos entre activos, financiamiento, entidades y compromisos se presentan con su procedencia. Una interpretación del sistema se distingue de un documento o resolución oficial.

TORO organiza, detecta faltantes y prepara expedientes o consultas. Firmar, aceptar contratos, presentar trámites o asumir un compromiso conserva las autorizaciones aplicables. Las alertas no inventan una conclusión jurídica ni sustituyen la revisión profesional requerida por el caso.

El módulo se integra con Dinero para obligaciones, Personas para aspectos laborales, Activos para titularidad y seguros, Proyectos para dependencias y Hoy para plazos. Ejemplo final: una renovación muestra documento vigente, fecha, responsable, requisitos y acción concreta, sin perder la entidad legal correcta.

La entrega exige trazabilidad, privacidad, vencimientos correctos y resolución con evidencia. Se miden obligaciones sin responsable, atrasos y tiempo de preparar expedientes. El riesgo residual permanece visible cuando no está resuelto.

### Módulo 9 Activos y Espacios

Activos y Espacios permite entender inmuebles, habitaciones, instalaciones, equipos, inventario y archivos asociados. Relaciona ubicación, identidad, condición, responsable, mantenimiento y documentos, sin confundir un activo con un negocio.

El usuario abre un espacio y encuentra sus objetos, incidencias, fotografías verificadas y acciones autorizadas. El mapa espacial puede mostrar ubicaciones o distribución cuando existe información suficiente y la capacidad está implementada; su diseño actual no acredita un mapa operativo entregado.

Los activos físicos conservan registro de estado y mantenimiento. Los activos digitales conservan originales, derechos, versiones y canales permitidos. Un mapa o fotografía conceptual se diferencia de la distribución y evidencia real.

Se integra con Operaciones para trabajos, Studio para medios, Legal y Riesgo para documentos, Dinero para costos y Proyectos para obras o mejoras. Ejemplo final: tocar un equipo revela el incidente activo, su historial y la evidencia de la última reparación; el usuario puede entrar al mismo trabajo operativo.

El módulo está entregado cuando los activos del alcance acordado son localizables y sus vínculos resuelven al registro correcto. Se mide cobertura verificada, tiempo de localizar información, mantenimiento atrasado y reincidencia.

### Módulo 10 Proyectos

Proyectos muestra objetivos, programas, hitos, dependencias y trabajo existente. Ordena las iniciativas del portafolio bajo las identidades canónicas, con responsables, prioridades y resultados esperados. Las conversaciones y entregables se vinculan al proyecto que corresponde.

La vista permite ver qué está activo, qué se detuvo y por qué, qué bloquea el siguiente resultado y qué recursos compiten por caja o tiempo. Los avances distinguen preparación, implementación, despliegue, verificación, uso y beneficio. El número de commits no reemplaza el progreso del negocio.

TORO prepara la siguiente unidad elegible y coordina especialistas por capacidad. Una idea nueva se incorpora al Plan General y al proyecto existente antes de abrir un frente. Los proyectos duplicados o históricos se conservan con su disposición documentada.

Se integra con todos los módulos según el resultado, con Dinero para restricciones, Sistemas para releases y Hoy para decisiones. Ejemplo final: el dueño abre la construcción de TORO, ve sus módulos y dependencias, revisa los links de entregables comprobados y responde una sola decisión concreta cuando es necesaria.

La entrega exige que el siguiente paso, dependencia y resultado sean claros, y que una pausa o relevo no pierda contexto. Se mide trabajo terminado útil, bloqueos resueltos y tiempo desde intención hasta uso.

### Módulo 11 Sistemas

Sistemas muestra las herramientas y conectores de los que depende el negocio: propósito, propietario, alcance, autoridad, salud, permisos, costo, última comprobación y recuperación. La vista técnica pertenece a administradores; el resto ve únicamente los estados y acciones que necesita.

Una herramienta registrada, una conexión configurada, una lectura autorizada comprobada y una escritura aprobada comprobada tienen estados distintos. TORO detecta desactualización, fallos y diferencias entre configuración esperada y observada. Los botones abren destinos registrados y verificados con icono y etiqueta.

El administrador puede revisar una propuesta de configuración, renovar el acceso por la ruta permitida, pausar trabajos y comprobar recuperación. Las credenciales se administran mediante mecanismos protegidos; no aparecen en las fichas, mensajes o prompts.

Sistemas se integra con Proyectos para cambios, Dinero para consumo, Hoy para excepciones y todos los módulos para dependencias. Ejemplo final: si un conector falla, TORO limita el dato afectado, muestra la causa comprobada, propone recuperación y retoma desde el checkpoint una vez autorizado.

El módulo está entregado cuando la salud declarada coincide con evidencia, el fallo no genera datos falsos y una prueba de recuperación funciona. Se mide disponibilidad de capacidades, tiempo de recuperación, costo por resultado y fallos repetidos.

### Conversación y herramientas compartidas

Texto, voz, adjuntos, WhatsApp, Portal y correo se conectan al mismo contexto, permisos y trabajo. La conversación puede responder, preparar una acción, registrar un incidente, solicitar una decisión o dar seguimiento. No se vuelve por sí sola memoria permanente.

OpenClaw y WeSpeak son runtimes o canales dentro de esta arquitectura. La experiencia final de WhatsApp tiene la misma cobertura de capacidades autorizadas que el Portal para la identidad y ámbito activos. Los nombres Whisper, Tether u otros mencionados informalmente se resuelven contra el inventario antes de asignarles funciones; no se presume que sean un sistema instalado.

El acceso a toda la información significa acceso completo a lo que el usuario y el flujo tienen autorizado. La paridad se cumple mediante ejecución compatible o un relevo seguro al Portal. Cada canal conserva sus requisitos de identidad, autenticación y capacidades; no hereda automáticamente los permisos de otro. El cambio entre canales no permite saltarse privacidad, aprobaciones o aislamiento. El enlace para contactar a DreamTeam prepara o abre la conversación por el canal apropiado y conserva la autorización de envío.

TORO Knowledge y TORO Research aportan contexto, fuentes, procedimientos y aprendizaje revisado a los once módulos. TORO Tools y TORO Channels conectan acciones y destinos; TORO Governance e Identity aplican los límites. Estas capacidades compartidas evitan crear otra bandeja, memoria o motor por canal.

### Avance autónomo y control del dueño

TORO encadena unidades de trabajo elegibles dentro de una sesión de ejecución y continúa desde checkpoints entre sesiones cuando existe un worker persistente autorizado. No depende de que Mauricio escriba continuar ni de dejar ChatGPT abierto. Esa continuidad es una capacidad final que necesita implementación y prueba; programar un aviso recurrente no la acredita.

El coordinador elige trabajo de la cola existente según impacto, prioridad, dependencia, riesgo, permiso, presupuesto y capacidad. Tras verificar un resultado, toma el siguiente elegible dentro de los límites vigentes. Los agentes reciben encargos acotados por capacidad, con resultado esperado y consumo máximo; los nombres de especialistas no crean autoridades independientes.

La velocidad se mide como tiempo ocioso con trabajo autorizado elegible y capacidad disponible. Las esperas por aprobación, presupuesto, cooldown, fallo de conexión o ausencia de trabajo se explican por separado. No se requiere trabajo constante si no existe trabajo útil permitido.

El dueño ve resultado, costo, evidencia y próximos pasos. Puede pausar por ámbito y reanudar un trabajo pausado desde su checkpoint. Un job cancelado queda terminal; retomar su objetivo requiere una nueva acción autorizada, enlazada al original y con conciliación de efectos previos. Una acción externa ya iniciada entra en conciliación cuando no se puede cancelar; no se informa falsamente que fue deshecha. Pausar una automatización no cancela automáticamente reservas, pagos o compromisos.

La ejecución conserva los topes, periodos y capacidades definidos en los contratos vigentes. Sin presupuesto vigente y límites configurados no se inicia ejecución incremental. Se controlan costo y duración por job, topes diarios y mensuales, concurrencia, reintentos y corte ante fallos repetidos. La espera y las consultas sin cambios utilizan mecanismos de bajo costo y no consumen modelo innecesariamente. Los eventos, workers y subagentes comparten límites. Crear más agentes no aumenta el presupuesto ni evade el cooldown. Los permisos se verifican de nuevo antes de un efecto material; repetir un evento no debe repetir el efecto.

### Revisión y mejora continua

El trabajo pasa por verificación proporcional antes de declararse terminado. Los cambios materiales se revisan con evidencia independiente cuando corresponde. TORO no se otorga permisos, no redefine su evaluador y no amplía su presupuesto para aprobar su propio cambio.

Una corrección se registra con contexto y procedencia. El sistema busca causa, propone una solución reutilizable, prueba, aplica dentro de la política autorizada y mide recurrencia. Si empeora el resultado, revierte. El aprendizaje conserva la privacidad del negocio de origen.

Los avances se revisan por utilidad: servicio, caja, conversión, tiempo humano, errores, recuperación y costo por resultado. La plataforma presenta una línea base y observaciones posteriores antes de afirmar que generó un beneficio. La supervisión automática se apoya en contratos y controles, no solo en un prompt más largo.

### Integración de las herramientas existentes

GitHub conserva constitución, código y contratos versionados. Supabase conserva identidades, permisos, datos operativos propios y auditoría. Dropbox conserva originales, archivos y evidencia. Notion presenta narrativa, investigación y memoria de trabajo. Airtable sigue como proyección humana transitoria donde aporta valor. Las referencias y proyecciones apuntan al Plan General único.

Kross conserva la autoridad viva de reservas, tarifas y disponibilidad; Alegra la contable y fiscal; los bancos la evidencia del efectivo; los canales y autoridades oficiales mantienen sus dominios. TORO conecta y explica esas fuentes con procedencia y límites.

Los enlaces útiles y recomendados forman un catálogo por ámbito y función, con icono, etiqueta, destino, responsable, permisos y fecha de comprobación. Una recomendación se identifica como tal y no implica una herramienta ya contratada o conectada. Un link rotulado debe resolver al destino que anuncia.

Dropbox Dash facilita el descubrimiento dentro de las fuentes autorizadas cuando está disponible; sus resultados se resuelven al original antes de convertirse en evidencia. No sustituye los archivos originales ni crea otra autoridad.

### Aplicación a otros negocios

TORO separa núcleo universal, paquete de industria, configuración del negocio y adaptadores de herramientas. Identidad, permisos, evidencia, tareas y gobierno son comunes. La terminología, procedimientos, campos específicos y conexiones se configuran según el negocio.

El producto terminado incorpora un negocio mediante descubrimiento guiado: personas y roles, objetivos, estructura, fuentes, herramientas, permisos, procedimientos, métricas y riesgos. Presenta lo detectado, los conflictos y lo que requiere confirmación antes de operar. La importación no copia todo indiscriminadamente ni presume que el acceso a un sistema permita todas sus acciones.

Una capacidad probada en Dreamcatcher puede abstraerse y validarse en otro ámbito sin trasladar huéspedes, finanzas, secretos o estrategia privada. El segundo negocio se valida en sandbox con escenarios de lectura, acción, aislamiento, recuperación y baja. El onboarding externo real conserva el readiness gate vigente.

La modularidad permite contratar o habilitar capacidades disponibles sin eliminar el núcleo obligatorio. El soporte, la salida del servicio, la exportación autorizada, las dependencias y la recuperación forman parte del producto. El negocio puede comprender qué queda conectado, qué está funcionando y qué todavía espera implementación.

### Cuarenta criterios de producto terminado

Esta serie nueva P01 a P40 concreta esta definición TARGET. Son criterios de aceptación, no cuarenta funciones implementadas ni una renumeración de M01 a M20 del contrato Agent Steward. La ejecución se vincula a los proyectos y trabajos existentes después de resolver duplicados.

| ID | Resultado observable | Comprobación de aceptación |
|---|---|---|
| P01 | Una sola base de dirección | Cada requisito material resuelve a una sección del Plan General y a su capacidad existente. |
| P02 | Una entrada sencilla | En móvil dirige al Portal oficial, separa demo y operación y no transfiere credenciales ni datos privados por URL. |
| P03 | Identidad individual | Cambio de usuario y revocación impiden conservar el acceso anterior. |
| P04 | Alcance visible | Pantalla y acción identifican negocio y contexto; otra organización no accede al objeto. |
| P05 | Cerebro como inicio por rol | Toda identidad autenticada entra a un Cerebro filtrado; el foco inicial y la siguiente acción autorizada se adaptan al perfil. Hoy queda a un toque. |
| P06 | Brain protagonista y accesible | El usuario explora mapa o lista equivalente y alcanza una decisión sin perder el contexto global. |
| P07 | Red localizable completa | Inventario y búsqueda cubren lo autorizado con denominadores y fuentes inspectables. |
| P08 | Zoom con orientación | Expansión, filtros y retorno conservan selección y relaciones del ámbito. |
| P09 | Conexiones explicables | Cada línea indica tipo y procedencia; pertenencia no se presenta como integración. |
| P10 | Actividad comprobable | Cada pulso abre un evento vigente permitido y desaparece con expiración o revocación. |
| P11 | Celular operativo | En 320 píxeles se puede buscar, consultar y actuar sin cortes esenciales, en ES y EN con formatos del usuario. |
| P12 | Alternativa accesible | Lista y timeline conservan estados y acciones; teclado y movimiento reducido funcionan. |
| P13 | Fichas con evidencia | Objetos materiales muestran fuente, fecha, estado, responsable y próximo paso. |
| P14 | Enlaces útiles | Botones con etiqueta e icono abren destinos registrados; no hay links presentados como verificados sin prueba. |
| P15 | Atención sin duplicados | Señales sobre el mismo caso producen una excepción canónica y no varias tareas. |
| P16 | Decisión concreta | Una respuesta queda vinculada al objeto y versión y no concede autoridad general. |
| P17 | Dinero conciliable | Caja, moneda, obligación y comprobante son rastreables y no duplican un movimiento. |
| P18 | Studio con versiones | Original, derivado, revisión, derechos, canal y aprobación resuelven al archivo correcto. |
| P19 | Clientes con continuidad | Un caso conserva contexto y relevo; no inventa tarifas o disponibilidad sin fuente viva. |
| P20 | Operación con cierre útil | Un flujo real incluye asignación, evidencia, verificación y respuesta al registro original. |
| P21 | Personas con privacidad | Empleado y responsable completan el flujo sin acceso a datos ajenos no autorizados. |
| P22 | Crecimiento medible | Cambio y resultado tienen método de atribución; clics no se presentan como ventas. |
| P23 | Riesgos respaldados | Vencimiento, entidad, responsable y documento resuelven a fuente y fecha correctas. |
| P24 | Activos localizables | Espacio, equipo, archivos e incidentes se vinculan por identidad verificable. |
| P25 | Proyectos sin otro backlog | Cada avance y dependencia corresponden al proyecto y tarea canónicos existentes. |
| P26 | Sistemas con estados honestos | Registro, configuración, lectura, escritura, falla y desactualización se distinguen. |
| P27 | Portal y WhatsApp equivalentes | La misma identidad y contexto conservan fuentes y límites; acciones compatibles o relevo seguro respetan autenticación por canal. |
| P28 | Contactos con intención | Abrir conversación o borrador se diferencia de envío; el envío conserva su permiso. |
| P29 | Trabajo encadenado | Con trabajo, capacidad y presupuesto disponibles reclama la siguiente unidad sin esperar el reloj; latencia y ocio elegible cumplen un SLO aprobado. |
| P30 | Continuación persistente | Reinicio o cierre de la superficie conserva checkpoints sin perder trabajo ni repetir efectos. |
| P31 | Consumo limitado | Sin presupuesto y topes no inicia; costo, duración, reintentos y subagentes comparten límites y corte ante fallos. |
| P32 | Concurrencia segura | Dos ejecutores no duplican efectos; resultado externo incierto se concilia antes de reintentar y revocación bloquea efectos nuevos. |
| P33 | Pausa y cancelación | Pausado reanuda con checkpoint; cancelado queda terminal y un nuevo intento autorizado concilia efectos previos. |
| P34 | Revisión independiente | Un cambio material acredita evaluación aplicable y el ejecutor no modifica su propio evaluador. |
| P35 | Recuperación comprobada | Timeout, duplicado, falla de conector y restauración se ensayan sin duplicar acciones. |
| P36 | Reporte de resultados | Cada avance material tiene prueba y enlace; distingue preparado, verificado, usado y medido. |
| P37 | TORO se opera con TORO | TORO Business usa los mismos controles y registra sus resultados sin privilegio transversal. |
| P38 | Aprendizaje reversible | Corrección, prueba, decisión, medición y reversión quedan trazados sin copiar datos privados. |
| P39 | Portabilidad por configuración | Un segundo ámbito en sandbox reutiliza capacidades, demuestra aislamiento y rechaza referencias cruzadas entre tenants. |
| P40 | Salida y versión completas | Una versión acredita su alcance contratado, soporte, recuperación, exportación y baja autorizados. |

### Un día con TORO

Al comenzar el día, Mauricio abre TORO desde el celular y ve el portafolio, las decisiones urgentes y los resultados nuevos. Toca Dreamcatcher y revisa una excepción de caja con su comprobante. Responde la decisión concreta; TORO registra la respuesta y continúa el trabajo que ya está permitido.

Recepción informa un problema de servicio. El mismo caso aparece en Clientes y Operaciones; mantenimiento recibe la acción y registra evidencia en el espacio correcto. Recepción confirma el cierre por el flujo autorizado. El Brain muestra ese recorrido y el dueño puede comprobarlo sin leer toda la conversación.

Crecimiento pide una pieza. Studio utiliza originales autorizados, prepara versiones y presenta una revisión. La publicación ocurre solo por su autorización de canal. Si un conector falla, Sistemas señala la limitación y el dato afectado deja de presentarse como actual.

TORO Business revisa el costo y los resultados de esos flujos. Un patrón de relevo repetido genera una propuesta de mejora. Se prueba, se evalúa y se mantiene o revierte. Al terminar el día, el dueño recibe lo que cambió, el beneficio comprobado y las decisiones que siguen pendientes.

### Realidad actual y camino de construcción

El Plan General, la Constitución, los once módulos y los contratos de Visual Brain ya están definidos. Existen implementación canónica, demostración sintética y trabajos preparados de Dashboard y lectura real. Esto no acredita once módulos completos ni operación privada end to end.

La lectura canónica del Brain conserva el gate de QA autenticada. El estado final de WhatsApp y OpenClaw requiere pruebas directas de runtime y de equivalencia autorizada. La continuidad persistente requiere un worker comprobado. El mapa espacial está diseñado, no entregado globalmente. Kross Live pagado permanece diferido por decisión del dueño; esta definición no reactiva esa contratación. El onboarding externo conserva los gates vigentes.

Las automatizaciones pueden cambiar durante otras sesiones. Su habilitación y última fecha de ejecución no acreditan éxito. Los estados actuales se consultan en sus fuentes con fecha y evidencia; esta definición de producto no congela un snapshot operativo.

El orden de construcción permanece desde el núcleo: identidad y alcance, verdad, gobierno y autoridad de fuentes, conectores, inteligencia, ejecución con recuperación, aprendizaje, experiencia y prueba de portafolio. Los controles necesarios están comprobados antes del primer efecto material. Diseñar desde el producto final permite saber qué debe alcanzar cada paso; no obliga a publicar primero una apariencia sin los controles que la sostienen.

El siguiente trabajo es cerrar esta definición y representar pocas escenas de experiencia: vista del dueño, interacción con un nodo y flujo móvil de atención. Después, cada módulo se desarrolla por su capacidad y dependencia existentes, con unidades completas, revisión e integración. Se prioriza un flujo útil probado antes de multiplicar pantallas.

Una versión está terminada cuando el alcance comprometido es utilizado por sus usuarios, las fuentes y permisos están comprobados, las acciones tienen evidencia, la recuperación funciona y existen métricas de utilidad. No exige integrar todas las herramientas posibles para poder cerrar una versión.

### Vinculación con el Plan General

| Parte de la definición | Sección existente del Plan General |
|---|---|
| Producto y experiencia final | 1 Final direction y 18 Program north star |
| Once módulos y composición Brain con Atención | 2 Product hierarchy y TORO Dashboard |
| Portafolio y autouso | 3 Scope architecture y 4 Target model y Alignment update |
| Identidades y vistas | 5 User model y Portal role model |
| Conversación y paridad autorizada | 6 Communication architecture y 9 OpenClaw |
| Herramientas y autoridad | 7 Tool architecture y 12 Data platform ownership |
| Avance y mejora | 14 Proactive improvement y 21 Executive brain mindset |
| Estado y construcción | 15 Current Target Next Future y 16 Roadmap y 17 Queue |
| Brain y entrada móvil | 22 Visual Brain and product experience |
| Portabilidad y adopción | 16A Product Proof y Alignment update de 29 septiembre |
| Definición detallada y P01 a P40 | 23 Finished product definition integrada en este Plan General |

### Fuentes y puertas de entrada

Plan General canónico: https://github.com/Dramcatcherst/Toro-OS/blob/main/docs/product/TORO_BRAIN_GENERAL_PLAN.md

Constitución: https://github.com/Dramcatcherst/Toro-OS/blob/main/docs/product/TORO_BRAIN_CONSTITUTION.md

Arquitectura maestra: https://github.com/Dramcatcherst/Toro-OS/blob/main/docs/product/TORO_BRAIN_MASTER_ARCHITECTURE.md

Dashboard de once módulos: https://github.com/Dramcatcherst/Toro-OS/blob/main/docs/product/TORO_DASHBOARD_V1.md

Visual Brain: https://github.com/Dramcatcherst/Toro-OS/blob/main/docs/product/TORO_VISUAL_BRAIN_ARCHITECTURE_V1.md

Agent Steward y estrategia visual M01 a M20: https://github.com/Dramcatcherst/Toro-OS/blob/main/docs/product/TORO_AGENT_STEWARD_AND_VISUAL_STRATEGY_V1.md

Readiness: https://github.com/Dramcatcherst/Toro-OS/blob/main/docs/product/NEW_BUSINESS_READINESS_GATE.md

Notion del programa: https://app.notion.com/p/3dff5169a39a81b8bf89d06a75a91462?pvs=204

Notion de Dashboard: https://app.notion.com/p/3e6f5169a39a810f810adefdcd4851e7?pvs=204

Referencias estructuradas leídas: `toro_dashboard_surface_v1`, `toro_brain_taxonomy_v1` y `toro_product_capability_registry_v1`, en el runtime Supabase canónico. La lectura íntegra del Plan General conserva todo su contenido previo e incorpora esta definición con los estados separados.



---

## Human Layer / TERE / DreamTeam R4 — owner directive 2026-09-30

**State:** CURRENT canonical refinement.  
**Subordinate contract:** `docs/product/TORO_HUMAN_LAYER_TERE_DREAMTEAM_R4.md`

Mauricio directed TORO to recover and preserve the durable personality, communication, TERE, hotel-voice and DreamTeam rules from historical/current sources; simplify and merge them before implementation; and apply approximately 50 material improvements without creating another brain, project, task system, employee authority or prompt universe.

### Canonical decisions

- TORO remains the single visible orchestrator/Brain.
- TERE remains the Dreamcatcher guest-facing specialist/persona. WeSpeak/OpenClaw/WhatsApp/Portal are runtimes/surfaces, not separate brains.
- Personality is durable behavior, never volatile business truth.
- TERE keeps the current practical-first principle: **80% useful reality / 15% Dreamcatcher identity / 5% surprise**.
- R4 adds governed social chemistry: serious → warm → playful → complicit, based on reciprocal rapport. Complaints, safety, money-sensitive topics, policy disputes and discomfort force serious mode.
- The new active Supabase configuration key is `tere-social-chemistry-playfulness-r4-20260930`. Configuration existence does **not** prove WeSpeak/OpenClaw consumption; runtime version/hash + QA remains required.
- Airtable Central now carries the R4 owner decision and learned social-chemistry rule. Superseded dream-heavy packs remain historical and must not be reactivated.
- DreamTeam functionality is defined as **verified identity + correct role/capabilities + authorized channel + onboarding + runtime acceptance**, not merely “employee record exists”.
- Current People runtime observation on 2026-09-30: 12 active employees + 1 terminated; all 12 active have AI profiles/Role Packs; 4 have linked application users; 0/12 have verified employee channel identities; onboarding progress remains unstarted. Do not bind the remaining people by name inference.
- Current kitchen operator Mary/Maribel remains an **external collaborator/operator**, not a payroll employee; minimal scoped access is separately approval-gated.
- Kross retains live transactional authority; stale/non-live mirrors cannot answer current occupancy, availability or rates.
- Alegra retains fiscal/accounting authority; TORO may analyze/reconcile/prepare, but material accounting writes remain governed.
- Dropbox remains the original-evidence/backup home where governed, but a fresh Dropbox audit was **BLOCKED** in this pass by the current connector search/schema conflict; do not describe it as re-audited.

### WeSpeak stay-length cutoff and reception alerts — owner directive 2026-10-02

**Scope:** Dreamcatcher guest conversations; existing TERE / TORO Guests + TORO Comms lane, with TORO Revenue, TORO Operations and TORO Systems.  
**State:** CURRENT owner-reported gap, runtime verification pending / TARGET approved behavior / NEXT controlled diagnosis and correction. **Priority:** P1, guest continuity and reception review.

- **Reported problem:** the owner reports that WeSpeak stops TERE conversations when a guest requests more than 8 days and does not send the case to reception. This is a user report, not an independently verified runtime threshold, incident count or delivery failure.
- **TARGET duration rule:** continue assisting and quoting stays of **30 days or fewer**, including 9–30 days; **only more than 30 days** triggers a human handoff because of stay length. Before configuring the threshold, verify whether the active runtime counts days or nights and how check-in/check-out dates map to that unit; do not silently convert the owner's wording.
- **Quote authority remains unchanged:** quote only from authorized current rates/availability. If live truth is unavailable, continue through the existing official Kross booking handoff or governed human path; never fabricate a price, reuse stale rates or represent a booking link as a verified TORO live quote.
- **Mandatory alert for every stop:** whenever TERE/WeSpeak halts a conversation, for any reason, create an actionable alert in the **existing reception review channel** and preserve the human handoff with minimum necessary verified context, stop reason, unresolved need and requested next action. Legitimate safety, payment, reservation-change, service or source-authority stops remain permitted and must also alert. A stopped bot alone is not a successful handoff.
- **NEXT diagnosis:** inspect the active WeSpeak configuration and all stop/escalation branches, identify the effective version/hash, and reconcile recent stopped conversations against reception alerts and handoff records. Resolve and reuse the current reception destination, canonical work item and notification/handoff mechanism; do not create a parallel inbox, backlog or source of authority. Record inaccessible evidence and gaps explicitly.
- **Implementation gate:** preserve the pre-change configuration and a scoped rollback; correct the duration rule and missing-alert paths only through separately authorized runtime work. This plan update changes no live configuration, database, notification routing or guest conversation.
- **Acceptance evidence:** isolated synthetic boundary cases at **8, 9, 30 and 31 days**, with the verified runtime unit/date interpretation recorded. Cases at 8/9/30 continue without a duration-based stop; 31 produces the reception handoff and alert. Exercise **every identified stop reason**, including other legitimate stops at any stay length, and notification failure/retry paths without duplicate actionable cases or silent loss.
- **Closure gate:** for each stop test, retain timestamped, correlated evidence of the stop reason, consumed config version/hash, actual alert delivery/visibility in reception's existing channel, and the linked human handoff/review item. Bot-stop status or configuration presence alone cannot pass. Do not mark the defect fixed or runtime behavior verified until end-to-end evidence passes the existing TERE runtime acceptance gate.

### R4 improvement package

The subordinate contract applies **50 net-new improvements** on top of the existing I01–I20 agent/skill controls, grouped into:
1. canonical memory/governance and simplification;
2. personality/playfulness/social chemistry;
3. guest communication and Dreamcatcher voice;
4. DreamTeam functionality/onboarding/permissions;
5. Kross/Alegra/evidence/QA/observability.

The detailed R4-01…R4-50 definitions, activation gates and rollback live only in the subordinate contract above to avoid duplicating the same specification in multiple places.

### Acceptance gate

R4 is not runtime-complete until:
- each active guest-facing runtime proves the personality/config version/hash it consumed;
- TERE passes serious-mode, rapport, privacy, joke-fatigue and cross-channel scenarios;
- DreamTeam identities are individually verified and role-isolated;
- employee channel revocation/offboarding works;
- Kross/Alegra authority remains intact;
- corrections persist across sessions/channels without copied parallel prompts.



---

## Dreamcatcher — Unit Economics, Room Cost & Break-even

**Owner directive:** 2026-09-30  
**Owner:** TORO Finance + TORO Revenue + Dreamcatcher Operations  
**State:** PLAN GENERAL — required financial model; current example values are illustrative until reconciled against authoritative 2026 data.

### Objective

Build and maintain one canonical profitability model that answers, by room, rate, channel, occupancy scenario and package:

- What does one occupied room-night actually cost?
- What is the marginal cost of accepting one additional booking?
- What is the fully loaded cost after fixed-cost allocation?
- At what gross guest price does each room break even?
- What is the absolute operational floor, the sustainable floor and the target selling price?
- At what price does a sale destroy cash contribution or economic profit?
- How do breakfast, OTA commission, payment fees, discounts, promotions, extra guests, children, pets, cleaning, laundry and taxes change the answer?
- What hotel occupancy / ADR / RevPAR combination covers company fixed costs?
- What are the break-even points for the hotel overall, each villa/business unit and material ancillary services?

### Canonical cost layers

TORO must separate these layers instead of mixing them:

1. **Taxes / pass-through amounts**
   - IVA and other applicable taxes.
   - These are not hotel operating revenue when collected on behalf of the tax authority.

2. **Marginal room-night cost**
   - incremental housekeeping labor;
   - laundry by textile load;
   - guest amenities and consumables;
   - incremental electricity, A/C and hot water;
   - incremental water;
   - incremental maintenance/wear reserve;
   - incremental guest servicing attributable to the stay.

3. **Channel / transaction cost**
   - OTA commission;
   - merchant/acquirer/card fee;
   - payment gateway fee;
   - promotion/discount;
   - affiliate/agency commission where applicable.

4. **Package / guest cost**
   - breakfast when included;
   - extra guest / child cost;
   - pet-related incremental cost;
   - included experiences/transport/other packaged value.

5. **Allocated fixed operating cost**
   - reception/administration;
   - fixed payroll;
   - maintenance base payroll;
   - accounting;
   - software/PMS;
   - internet/communications;
   - insurance;
   - security;
   - pool/jacuzzi/common-area baseline;
   - licenses/patents;
   - property-level fixed utilities;
   - marketing baseline;
   - depreciation/replacement reserve where useful for management economics.

6. **Capital / owner economics**
   - major replacements;
   - long-term depreciation;
   - financing/interest where relevant;
   - target return hurdle.
   - Keep this layer separate from cash operating break-even so management can see both.

### Required price floors per room

For every sellable room / configured combination, calculate:

- **Cash floor:** guest price at which net revenue covers taxes/pass-throughs, channel cost and truly incremental stay cost.
- **Contribution floor:** minimum price that still provides a defined positive contribution after marginal + channel/package costs.
- **Operating break-even price:** price covering marginal costs plus the room's allocated share of fixed operating costs.
- **Sustainable floor:** operating break-even plus maintenance/replacement reserve.
- **Target price:** price required to achieve the target contribution/profit margin.
- **Loss zone:** any rate below the cash floor.
- **Economic-loss zone:** rate above cash floor but below the applicable sustainable/full-cost floor.

Never collapse these floors into one number; they answer different decisions.

### Scenario matrix

The model must support at minimum:

**Channel**
- Direct SINPE/transfer
- Direct card
- Booking.com
- Expedia / other OTA
- Travel agency / wholesaler
- Promotional/direct code

**Occupancy / guests**
- 1 guest
- 2 guests
- extra guests to room capacity
- child where applicable
- pet where applicable

**Meal treatment**
- room only
- breakfast included
- breakfast sold as extra
- breakfast included but not consumed
- breakfast comp / house
- breakfast package with different supplier cost

**Rate scenarios**
- $40, $50, $60, $75, $90, $100, $125, $150, $200+ as relevant
- percentage discount scenarios
- national/TICOS promotions
- long-stay/promotional packages
- same-day / distress inventory decisions

**Stay length**
- 1 night
- 2 nights
- 3–4 nights
- 5–7 nights
- long stay

Cleaning and acquisition costs that occur once per stay must be amortized across nights rather than blindly repeated per room-night.

### Breakfast economics

Breakfast must be modeled independently and then attached to the room package.

For each breakfast type/source, calculate:
- selling price;
- tax treatment;
- supplier/food cost;
- labor if attributable;
- payment/channel cost if sold separately;
- waste/no-show treatment;
- gross contribution per breakfast;
- cost to hotel when breakfast is included in rate;
- incremental break-even increase in room price when breakfast is bundled.

Operational categories remain:
- **included / prepaid**
- **extra / paid**
- **house**
- **included not consumed**

Included but not consumed breakfast must not be treated as consumed supplier cost unless the supplier agreement actually charges it.

### Company / property break-even

TORO Finance must also calculate monthly and daily hotel-level break-even:

```text
Contribution per occupied room-night
= Net room revenue
- marginal room cost
- channel/payment cost
- package cost

Required occupied room-nights
= Monthly fixed operating costs
/ weighted-average contribution per occupied room-night

Break-even occupancy %
= Required occupied room-nights
/ Available room-nights

Break-even revenue
= Fixed costs
/ weighted contribution-margin ratio
```

Run this for:
- Dreamcatcher total;
- Dreamcatcher Villa / rooms #0–#6 where useful;
- Makaiza #7–#11;
- Toro Villa / rooms #21–#28;
- individual rooms when cost structure materially differs;
- business total consolidated.

Do not assume every room should receive the same fixed-cost allocation. Maintain at least:
- simple equal-room allocation for quick management view; and
- weighted allocation by capacity / size / historical revenue / materially distinct resource use, with method labeled.

### Data authority and reconciliation

Target source authority:

- **Kross / PMS:** sold rate, stay dates, room, guests, channel, discounts, reservation status.
- **Alegra:** actual accounting expenses, vendors, taxes, recurring operating costs.
- **Breakfast operational records / POS:** included, extras, house, no-consumption and supplier payable.
- **Utilities / invoices:** electricity, water, internet and other services.
- **Payroll / TORO People:** labor cost and allocation assumptions.
- **Dropbox / invoices / supporting documents:** cost evidence and contracts.
- **Supabase / TORO Finance:** normalized analytical model, assumptions, versions, calculated outputs and provenance.

Every estimate must be labeled as estimate until reconciled with actual source data.

### Required outputs

TORO Revenue / Finance should expose:

1. **Room Cost Card** for every room:
   - marginal cost;
   - fixed allocation;
   - breakfast/package adjustment;
   - cash floor;
   - operating break-even;
   - sustainable floor;
   - target price;
   - direct vs OTA comparison.

2. **Rate Decision Table**
   - requested selling rate;
   - net revenue;
   - contribution dollars;
   - contribution margin %;
   - fully loaded profit/loss;
   - status: profitable / contribution-only / cash-loss.

3. **Hotel Break-even Dashboard**
   - fixed costs/month;
   - variable cost/occupied room-night;
   - ADR;
   - occupancy;
   - RevPAR;
   - contribution margin;
   - occupied nights required to break even;
   - break-even occupancy;
   - projected profit/loss at current pace.

4. **Promotion simulator**
   - old rate;
   - discounted rate;
   - channel;
   - room;
   - guests;
   - breakfast;
   - nights;
   - resulting contribution and profit;
   - maximum discount before each floor is crossed.

5. **Exception alerts**
   - rate below cash floor;
   - OTA promotion makes booking cash-negative;
   - breakfast/package pushes rate below contribution floor;
   - room/channel combination below sustainable floor;
   - material cost drift versus prior month.

### Initial illustrative example — NOT source-of-truth

For a room sold at **$100 gross**, 2 guests, 1 night, no breakfast:
- gross guest payment: $100;
- illustrative IVA included: $11.50;
- illustrative net room revenue: $88.50;
- illustrative marginal/variable room cost: $26;
- illustrative contribution before channel: $62.50;
- illustrative direct-card contribution at 3.5% transaction cost: $59;
- illustrative OTA 15% contribution: $47.50;
- illustrative fixed-cost allocation example: $20;
- illustrative operating result: about $39 direct card / $27.50 at 15% OTA.

These values are a teaching baseline only. TORO must replace them with reconciled Dreamcatcher values before using them as pricing rules.

### Acceptance criteria

This work is **DONE** only when:

- all sellable rooms and canonical room combinations are represented;
- actual 2026 cost sources are reconciled and dated;
- breakfast economics is reconciled to supplier/POS/payment treatment;
- direct, card, OTA and agency scenarios calculate correctly;
- fixed and variable costs are explicitly separated;
- one-night vs multi-night cleaning amortization works;
- room-level cash floor, operating break-even, sustainable floor and target rate are available;
- hotel-level break-even occupancy and revenue are available monthly;
- outputs show source, freshness and whether a value is actual, inferred or estimated;
- at least three historical months are back-tested against realized accounting results;
- alerts do not recommend a rate below the applicable management floor without an explicit, documented exception.

### Verified accounting snapshot — Alegra, 2026-01-01 to 2026-09-30

Read-only source check on 2026-09-30, cost center `DREAMCATCHER` / id `1`:

- Sales / operating income: **CRC 265,585,084.46**
- Operating expenses: **CRC 199,724,118.69**
- Operating profit: **CRC 65,860,965.77**
- Other income: **CRC 468,688.11**
- Other expenses: **CRC 6,826.18**
- Profit before taxes: **CRC 66,322,827.69**
- Tax expense: **CRC 21,744,372.38**
- Net income: **CRC 44,578,455.31**
- OTA + travel-agency commissions: **CRC 23,430,005.60** (8.82% of revenue)
  - OTA commissions: CRC 22,343,745.60
  - Travel-agency commissions: CRC 1,086,260.00
- Personnel expense: **CRC 65,953,460.46** (24.83%)
- Maintenance expense: **CRC 17,550,267.03** (6.61%)
- Financial expense: **CRC 6,550,492.76** (2.47%)
- General expense: **CRC 71,602,373.82** (26.96%)
- Marketing / advertising: **CRC 6,232,615.12** (2.35%)
- Insurance / licenses: **CRC 2,048,563.01** (0.77%)
- Online services: **CRC 3,286,922.70** (1.24%)

**Data-quality caution:** Alegra currently reports zero Cost of Sales while room-level operating costs are posted largely through expense categories. Outgoing-payment review also shows transfers, shareholder/dividend-related categories, financing principal/interest and other categories that must not automatically be treated as hotel room operating cost. Therefore the accounting snapshot is useful evidence but **not yet a validated unit-cost model**.

### Provisional accounting break-even — diagnostic only

If commissions are treated as the only variable cost for a first diagnostic and all remaining operating expenses are treated as fixed/semi-fixed:

- 9-month non-commission operating expense: **CRC 176,294,113.09**
- average monthly fixed/semi-fixed proxy: **CRC 19,588,234.79**
- contribution ratio after recorded sales commissions: **91.18%**
- provisional monthly accounting break-even revenue: **~CRC 21,483,518**

This is intentionally labeled **PROVISIONAL / NOT FOR RATE FLOOR DECISIONS**. It will move after classifying utilities, housekeeping/laundry, breakfast, card fees, maintenance, owner/partner items, financing, taxes and stay-level costs correctly, then reconciling occupied room-nights and ADR from PMS/Kross.



### Expense evidence policy — canonical rule

**Owner directive — 2026-09-30:** every legitimate business expense reported to TORO with an invoice, electronic invoice, receipt, payment proof or equivalent support must enter the accounting workflow. **Alegra is the accounting system of record.** Dropbox is the durable documentary backup where needed, and Supabase/TORO Finance stores normalized metadata, provenance, reconciliation state and receipts.

Canonical subordinate contract:
- `docs/product/TORO_FINANCE_EXPENSE_EVIDENCE_POLICY_V1.md`

Rules:
- do not mark an expense DONE merely because the file exists in Dropbox;
- before any Alegra write, run duplicate checks on issuer, document number, date, amount, currency and existing references;
- if already represented in Alegra, reconcile/link evidence rather than duplicate the expense;
- attach evidence in Alegra when supported; otherwise preserve the original in Dropbox and retain a durable reference;
- owner-paid expenses require verified business purpose and correct reimbursement/shareholder-current-account treatment;
- internal transfers, loan principal, shareholder distributions and personal expenses are not room operating cost;
- every reconciled expense receives a separate management-cost behavior classification for the room-cost / break-even model.

### Room-cost source classification — verified Alegra categories, Jan–Sep 2026

Current cost-center readback identifies the following major categories relevant to the room economics model:

| Category | Jan–Sep 2026 | Management treatment now |
|---|---:|---|
| OTA + travel-agency commissions | CRC 23,430,005.60 | VARIABLE_PER_SALE — verified |
| Breakfast / lunch / dinner category | CRC 5,562,520.00 | VARIABLE/PACKAGE candidate — requires meal-level split |
| Cleaning products | CRC 4,543,979.40 | MIXED — room occupancy + common-area base |
| Electricity | CRC 10,864,460.00 | MIXED — fixed base + occupancy-driven component |
| Water | CRC 5,495,692.46 | MIXED — fixed base + occupancy-driven component |
| Gas | CRC 201,020.00 | MIXED — source/use split required |
| Housekeeping payroll | CRC 14,102,196.00 | STEP_FIXED / capacity-linked, not automatically per-room variable |
| Maintenance payroll | CRC 11,020,318.00 | FIXED/STEP_FIXED |
| Repairs | CRC 17,594,860.19 | MIXED; separate maintenance reserve vs vehicle/property/project work |
| Room replacement / dotation | CRC 2,311,436.59 | REPLACEMENT_RESERVE candidate |
| Internet | CRC 973,438.41 | primarily FIXED_OPERATING |
| Online software | CRC 3,286,922.70 | FIXED_OPERATING unless transaction-priced |
| Insurance / licenses | CRC 2,048,563.01 | FIXED_OPERATING / risk layer |
| Financial expense | CRC 6,550,492.76 | FINANCING; exclude from cash room-floor, show separately in full-owner economics |

**Important:** accounting category and management cost behavior are not the same thing. Electricity, water, cleaning, payroll and maintenance must be split analytically rather than assigned 100% to each occupied room-night.

### Break-even diagnostic range — accounting-only, still provisional

Using Jan–Sep 2026 Alegra data:

- **Case A — commissions are the only variable cost:** monthly break-even revenue ≈ **CRC 21.48M**.
- **Case B — commissions + all recorded meals + cleaning products + electricity + water + gas treated as variable:** monthly break-even revenue ≈ **CRC 20.49M**.
- **Case C — Case B + all housekeeping payroll treated as variable:** monthly break-even revenue ≈ **CRC 19.86M**.

These are **diagnostic bounds, not pricing floors**. Case B and Case C intentionally overstate variable treatment for utilities/payroll and therefore serve only as sensitivity checks. The final model must estimate fixed base vs incremental usage using occupancy / occupied-room-nights and monthly costs.

Current analytical implication: the hotel-level accounting break-even appears to be roughly in the **CRC 20M–21.5M monthly revenue zone before a proper occupancy-linked split**, but this range must not be used as a rate decision until Kross/PMS occupied-room-nights, actual card fees, breakfast consumption and non-operating/accounting anomalies are reconciled.




### Monthly behavior check — sales proxy

A month-by-month Jan–Sep 2026 readback was run against Alegra P&L for cost center `DREAMCATCHER`. Until Kross occupied-room-nights are reconciled, monthly sales are used only as a **provisional activity proxy**, not as occupancy.

Observed relationships:

- **Electricity:** weak relationship to sales (R² ≈ 0.10). Treat predominantly as base/mixed utility until occupancy-level evidence says otherwise.
- **Water:** very weak relationship to sales (R² ≈ 0.05). Do not allocate all water as per-room variable.
- **Internet:** essentially no positive relationship to sales (R² ≈ 0.02). Treat as FIXED_OPERATING.
- **Cleaning products:** moderate relationship to sales (R² ≈ 0.50). Split into base/common-area + occupancy-driven component.
- **Housekeeping payroll:** moderate relationship to sales (R² ≈ 0.54). Treat as STEP_FIXED / capacity-linked, not a simple per-room-night cost.
- **Maintenance payroll:** stronger relationship to sales (R² ≈ 0.71), likely reflecting staffing/seasonality; still classify as STEP_FIXED unless payroll structure proves per-room compensation.
- **Repairs:** noisy/moderate relationship (R² ≈ 0.35). Do not use as direct nightly variable cost; separate property repair, vehicles, projects and replacement reserve.
- **OTA commissions:** relationship to sales is material but not stable month-to-month because channel mix changes. Use reservation/channel data directly rather than a single blended percentage.

**Breakfast data-quality flag:** the Alegra category `Desayunos/Almuerzos/Cenas` totals CRC 5,562,520 for Jan–Sep, but postings appear concentrated in only Jan, Feb, Jun and Jul in the monthly P&L. Zero months must be treated as **missing/unclassified or genuinely zero only after source reconciliation**. Do not infer zero breakfast cost from the accounting category alone.

### Sales-source reconciliation flag

Two Alegra reporting surfaces disagree for Jan–Sep 2026:

- P&L, cost center DREAMCATCHER: **CRC 265,585,084.46** sales.
- P&L, unfiltered: **CRC 265,650,674.46** sales.
- General sales-documents report, before taxes: **CRC 273,350,269.55**.

The difference is material and cannot be explained solely by the Dreamcatcher cost-center filter. Until document-level reconciliation identifies timing/status/document-type/cost-center treatment, use the **P&L cost-center figure for the provisional Dreamcatcher accounting model** and label the general-sales figure as unreconciled. Do not claim revenue completeness from either surface alone.




### Breakfast economics — canonical master plan

**Owner directive — 2026-09-30:** breakfast must be analyzed from real reservations and actual operating/accounting evidence, not hypothetical menu economics alone.

Canonical subordinate contract:
- `docs/product/DREAMCATCHER_BREAKFAST_ECONOMICS_MASTER_PLAN_V1.md`

Current verified baseline:
- 33 mirrored reservations;
- 9 marked breakfast included;
- 4 marked breakfast not included;
- 20 breakfast status unknown;
- latest reservation snapshot 2026-09-21 09:28 UTC; source is stale/read-only;
- 17 reservations contain detailed meal-plan day records;
- 82 included breakfast units and 4 extra breakfast units are represented in that meal-plan detail;
- 0 rows currently prove served/consumed status;
- 0 rows currently prove extra-breakfast payment status;
- `operations.breakfast_orders` currently has 0 rows;
- Alegra Jan–Sep 2026 category `Desayunos/Almuerzos/Cenas` = CRC 5,562,520, but monthly posting coverage is incomplete/unreconciled.

Decision rule:
- do not infer profitability from breakfast inclusion alone;
- compare actual room-only vs breakfast-inclusive reservations by room, channel, rate plan, guest count and stay length;
- distinguish included, extra, house, included-not-consumed and unknown;
- calculate package uplift, marginal breakfast cost, channel fee on uplift and resulting reservation contribution;
- breakfast may be retained with low direct unit margin only when verified ADR/conversion/LOS/direct-share value offsets the subsidy.

Break-even reduction is now a standing objective of TORO Finance / Revenue:
- lower fixed operating cost where value-neutral;
- reduce OTA leakage;
- reduce utility base load;
- improve labor productivity without lowering service quality;
- eliminate waste / unsupported expenses;
- renegotiate supplier economics;
- increase contribution per occupied room-night;
- measure every improvement against monthly break-even revenue and break-even occupancy.




### Dreamcatcher Financial Deep-Dive — coordinated analysis before change day

**Owner directive — 2026-09-30:** perform a broad financial analysis of the hotel from multiple angles before making coordinated pricing/cost/process changes. Collect and reconcile first; then simulate; then execute a controlled change day.

Canonical subordinate contract:
- `docs/product/DREAMCATCHER_FINANCIAL_DEEP_DIVE_MASTER_PLAN_V1.md`

Scope:
- hotel-level profitability;
- room-level unit economics;
- channel contribution;
- breakfast economics;
- labor productivity;
- utilities/base load;
- maintenance vs capex;
- software/subscriptions;
- supplier economics;
- banking/payment fees;
- tax/accounting classification;
- direct vs OTA;
- break-even revenue / occupancy / ADR;
- continuous search for safe break-even reduction.

Operating rule:
- do not optimize for occupancy alone;
- do not cut costs that protect revenue, conversion, reviews, asset life or service without measuring the tradeoff;
- quantify expected monthly impact, confidence, implementation risk and rollback before a change;
- maintain a master question backlog and resolve it progressively without blocking all analysis.

Future milestone:
**FINANCIAL OPTIMIZATION CHANGE DAY** — only after decision-ready analysis, with a coordinated list of approved rate, breakfast, channel, supplier, staffing, subscription, utility and accounting changes.




### Dreamcatcher Financial Control Center — general page

Canonical general page:
- `docs/product/DREAMCATCHER_FINANCIAL_CONTROL_CENTER_V1.md`
- Supabase: `operations.knowledge_items/dreamcatcher_financial_control_center_v1`
- Dynamic parameter engine: `operations.knowledge_items/finance_room_unit_economics_engine_v1`

Rules:
- financial parameters are effective-dated and versioned; never overwrite historical meaning;
- actual reconciled source values supersede estimates for the same scope/date;
- formulas vary by reservation date, room, channel, guests, nights, breakfast, payment method, promotion and currency;
- each calculation exposes source, freshness and actual/inferred/estimated status;
- stale reservation mirrors may support historical analysis but not current rate decisions.

Current allocation-review sensitivity:
- explicitly named Santa Toro expenses inside DREAMCATCHER P&L: CRC 2,986,176.81 Jan–Sep 2026;
- explicitly named Diex expenses inside DREAMCATCHER P&L: CRC 6,566,884.36 Jan–Sep 2026;
- total flagged for benefiting-entity review: CRC 9,553,061.17;
- if all were ultimately proven external to Dreamcatcher operating economics, the current commission-only monthly break-even diagnostic would fall from about CRC 21.48M to about CRC 20.32M.
- **Do not reclassify or remove these expenses automatically.** Verify benefiting entity/shared-overhead treatment first.




### Financial cost-classification wave 1 — 2026-09-30

Canonical analytical registry:
- `operations.knowledge_items/dreamcatcher_cost_classification_2026_ytd_v1`

New verified observations:
- `Comisiones bancarias`: CRC 6,233,776.15 across 515 entries; ~2.35% of DREAMCATCHER P&L sales; strong payment-processing candidate, pending dataphone settlement reconciliation.
- `Ferreteria`: CRC 8,301,475.72; 82.83% concentrated Jan–Apr; high-priority CAPEX/expansion vs recurring-maintenance review.
- software/services reviewed: CRC 3,292,517.10 across 89 entries; largest vendors Simple Booking, WeSpeak, OpenAI and Alegra; audit for overlap/plan optimization before any cancellation.

Rules:
- this classification layer never rewrites Alegra automatically;
- high-value review buckets require transaction-level evidence before reclassification;
- realized savings are recorded only after verified change and readback;
- break-even engine consumes only classifications that have passed their required evidence gate.




### Financial cost-classification wave 2 — maintenance and labor

Maintenance:
- recorded repairs Jan–Sep 2026: CRC 17,594,860.19;
- CRC 14,992,933.09 (85.21%) is under CAPEX/fleet/other-property review:
  - Ferretería CRC 8,301,475.72;
  - vehicle repairs CRC 4,899,531.56;
  - Santa Toro repairs CRC 1,791,925.81;
- residual recurring-property candidate: CRC 2,601,927.10.
- sensitivity only: if all reviewed amounts were proven outside recurring Dreamcatcher operating cost, current commission-only diagnostic break-even would move from ~CRC 21.48M to ~CRC 19.66M/month.

Labor:
- total personnel expense: CRC 65,953,460.46 = 24.83% of Jan–Sep sales;
- admin payroll: CRC 20,262,901.46 = 7.63%;
- reception: CRC 9,953,438 = 3.75%;
- maintenance: CRC 11,020,318 = 4.15%;
- housekeeping: CRC 14,102,196 = 5.31%;
- reception + maintenance + housekeeping = CRC 35,075,952 = 13.21%.

Model rule:
- maintain separate **cash break-even** and **economic break-even** views;
- economic view includes required management labor/replacement-value compensation;
- owner/family compensation is not automatically excluded;
- housekeeping/reception/maintenance are fixed/step-fixed by occupancy bands until real workload data supports a different model.




### Break-even scenarios — Current / Clean / Target

Supabase:
- `operations.knowledge_items/dreamcatcher_break_even_scenarios_2026_ytd_v1`

Current diagnostic:
- ~CRC 21.48M monthly break-even.

Clean sensitivity:
- ~CRC 18.71M/month if identified other-property/CAPEX/fleet candidates are ultimately proven outside recurring Dreamcatcher operating cost and bank fees remain fixed;
- ~CRC 19.21M/month if those candidates are excluded from recurring cost and bank fees are confirmed variable payment-processing cost.

Target planning scenarios from the clean/payment-processing-variable base:
- 5% additional controllable fixed-cost reduction → ~CRC 18.25M/month;
- 10% → ~CRC 17.29M/month;
- 15% → ~CRC 16.32M/month.

Guardrail:
- accounting cleanup is not cash savings;
- CAPEX reclassification is not recurring savings by itself;
- target scenarios are hypotheses until a specific action is implemented and verified.


### Improvement loop

Monthly:
1. reconcile actual costs;
2. compare forecast vs actual;
3. update unit costs;
4. detect cost drift;
5. review minimum viable rates;
6. review channel economics;
7. review breakfast/package economics;
8. update promotion limits;
9. measure which rooms/channels create the strongest contribution;
10. capture approved assumptions/version changes with evidence.

Strategic principle: **occupancy by itself is not success. TORO should maximize sustainable contribution and profit, not simply fill rooms.**
