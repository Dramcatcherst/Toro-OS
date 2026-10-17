# Complete Portal catalogue and navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every permitted registered tool discoverable in a complete Herramientas section and simplify navigation while preserving existing destinations and the working login.

**Architecture:** Extend the existing scoped directory RPC and its server projection together. Render a complete catalogue independently from nine favorites, and reuse the canonical module model for four primary destinations plus Más. The canonical directory remains the only registry; this release has no financial writes.

**Tech Stack:** Next.js 16.3.8, React 19.2.4, TypeScript, Supabase PostgreSQL/RLS, Vitest 4.1.11, existing Playwright and isolated PostgreSQL test harness.

**Spec:** `docs/superpowers/specs/2026-10-12-portal-completeness-and-document-close-design.md`, units A/B/G. Owner explicitly approved the specification on 2026-10-12; PR272 merged as `b378285eddb807bfd49dc441d3715ce86e2483ff`.

## Global Constraints

- Primary destinations: Inicio, Trabajo, Dinero, Herramientas; Más exposes Cerebro, Personas, Clientes, Crecimiento, Studio, Legal/Riesgo, Activos, Proyectos and Sistemas through the existing module model. Preserve canonical ordinals 00–11 and all existing routes.
- One primary navigation per viewport; mobile four entries plus Más. Minimum 320px, targets at least 44px, text at least 12px, keyboard order equal to visual order, reduced-motion and forced-colors.
- The existing `operations.knowledge_items` directory is the source. Preserve native link IDs and entries; do not create another independent registry.
- Do not project account references, raw evidence, internal configuration, secrets or signed access URLs.
- Owner discovery includes permitted historical and other-project references through filters; default hotel view excludes them. Santa Toro remains a separate context.
- Existing per-session selections remain labelled until the canonical preference store and narrow write policy are approved and implemented.
- No second Brain, database, inbox, project backlog, accounting book or scheduler.
- Private source inventory stays outside the public repository. All fixtures below are synthetic.

## Review Focus

- A registered link lacks a reviewed URL: discover its label and status without a fabricated or clickable destination (task 1).
- An owner switches context while a catalogue request is in flight: discard the previous scope's response (task 2).
- One provider has multiple legitimate actions: preserve each native ID and useful label (tasks 1/3).
- A historical link or another project's reference appears: default hotel view excludes it; permitted owner discovery includes it with scope visible (tasks 2/3).
- A direct legacy route or bookmarked tab is used: preserve the destination and make its module reachable under Más (task 4).

---

### Task 1: Safe complete directory projection

**Files:** Modify `src/features/tools/directory.ts`, `src/features/tools/directory.test.ts`; create `src/features/tools/catalogue-types.ts`, `src/features/tools/catalogue-url.ts`, `src/features/tools/catalogue-url.test.ts`.

**Interfaces:**
- Keep `ToolLink` for existing reviewed quick links.
- Produce `CatalogueEntry`: `{ id: string; label: string; purpose: string; category: string; scopeLabel: string; scopeKind: 'hotel' | 'historical' | 'other_project' | 'unknown'; destination: string | null; navigationState: 'reviewed' | 'login_required' | 'unreviewed' | 'unavailable' | 'historical'; integrationState: 'read_verified' | 'write_verified' | 'preparation_only' | 'unavailable' | 'unknown'; reviewedAt: string | null }`.
- Produce `projectCatalogueRows(context: ToroResolvedContext | null, rows: unknown): CatalogueEntry[]` and `safeCatalogueDestination(value: unknown): string | null`.
- Consumes authenticated organization context and only the bounded RPC projection defined in task 2. A role label alone cannot grant foreign-project access.

- [ ] Write failing tests: an unreviewed synthetic entry has `destination === null` and remains discoverable; repeated ID fails closed; two actions with different IDs survive; revoked/employee/foreign-org contexts return `[]`; a signed query, URL userinfo, javascript scheme and malformed URL return `null`; action-bearing nonsecret query survives only for an explicitly reviewed destination.
- [ ] Run `npx vitest run src/features/tools/directory.test.ts src/features/tools/catalogue-url.test.ts`; verify failures correspond to absent new functions, not broken fixtures.
- [ ] Implement these pure functions. Validate scalar sizes and enum values; require exact approved destination plus review provenance for clickable company links. Keep signed/credential management destinations nonclickable. Derive labels from projected metadata, never raw JSON fallback. Preserve native IDs and integration state independent of navigation state.
- [ ] Run the same tests; all pass. Existing six reviewed quick links must remain unchanged.
- [ ] Commit this unit with `feat: validate complete scoped tool catalogue`.

### Task 2: Bounded database read and server loading

**Files:** Create `supabase/drafts/20261012_portal_catalogue_read_v1.sql`, its `_rollback.sql`, `tests/portal-catalogue-read-sql.test.mjs`, `tests/fixtures/portal-catalogue-baseline.sql`; modify `src/features/tools/server.ts`; create `src/features/tools/server.test.ts`.

**Interfaces:**
- Produce `public.toro_portal_catalogue_read_v1(p_org_id uuid, p_actor_user_id uuid)` returning only task 1's fields plus validated organization/property identifiers. Security invoker, fully qualified objects, empty search path, authenticated execution only; actor must equal `auth.uid()`.
- Extend `DirectoryView` with `catalogue: CatalogueEntry[]`, preserving `links`, `state`, existing reason and account semantics.
- `loadHotelDirectory()` calls the new read RPC with resolved context; the old six-link RPC remains intact for rollback/legacy callers.
- Consumes existing membership/session policy and RLS; never calls service-role credentials or broadens knowledge-table access.

- [ ] Inspect actual function definitions, policies and directory field shape through read-only preflight. Record field names and explicit existing owner cross-project permission in restricted evidence. If that permission is absent, show resource-needed status; do not invent a grant.
- [ ] Write failing isolated SQL tests using synthetic users: authenticated approved actor gets eligible hotel rows; anonymous/service role/expired/revoked/actor mismatch/foreign tenant are denied; historical and foreign references require existing owner entitlement; result has no secret/account/raw-evidence sentinel; duplicate IDs cannot multiply output. Server tests deny unavailable RPC and stale context response.
- [ ] Run `node --test tests/portal-catalogue-read-sql.test.mjs` with the existing external PGlite module configured and `npx vitest run src/features/tools/server.test.ts`; confirm expected failures.
- [ ] Implement additive SQL projection and rollback plus server loading using task 1 functions. Read only authorized canonical fields; return discoverable nonclickable metadata for eligible unreviewed entries. Do not replace the approved six-link function.
- [ ] Run SQL and server tests; confirm tenant isolation, exact field projection and rollback restores the previous callable surface. Review migration diff and advisor output before any production DDL.
- [ ] Commit with `feat: add bounded portal catalogue read`.

### Task 3: Complete Herramientas section

**Files:** Create `src/features/tools/portal-catalogue.tsx`, `src/features/tools/portal-catalogue.test.tsx`; modify `src/features/tools/portal-tool-links.tsx`, `src/features/portal/portal-workspace.tsx`, `src/features/portal/portal.module.css`, `src/app/portal/page.tsx`, `src/app/portal/page.test.tsx`.

**Interfaces:**
- Produce `PortalCatalogue({ entries, unavailable }: { entries: CatalogueEntry[]; unavailable: boolean })`.
- PortalWorkspace receives `catalogue: CatalogueEntry[]` separately from quick-link `links`. The catalogue never derives its population from favorites or the brand map.
- Search label/purpose/category, derive categories from permitted entries, and offer Hotel / Histórico / Otros proyectos filters. Only authorized entries supplied by the server can be shown.

- [ ] Write failing render/interaction tests: unknown provider renders label and generic icon; search finds a purpose; categories are derived; two actions from one provider remain; default hotel filter excludes history/other projects; enabled filters show allowed references with scope; URL-less rows show review state without anchor; empty/error states differ; favorites remain capped at nine and labelled as session selections.
- [ ] Run `npx vitest run src/features/tools/portal-catalogue.test.tsx src/app/portal/page.test.tsx`; verify expected failures.
- [ ] Implement complete searchable catalogue with compact bordered navy/slate rows and verified existing provider assets. Preserve useful deep links; no provider brand exclusion. Display link review and integration status separately in expandable details. Connect existing guide as a subview rather than a second catalogue.
- [ ] Run `npm run test:hotel-tools`; verify all existing and new tests pass.
- [ ] Commit with `feat: expose complete permitted tools section`.

### Task 4: Simplified navigation and route compatibility

**Files:** Modify `src/features/portal/portal-workspace.tsx`, `src/features/portal/portal-header.tsx`, `src/features/portal/portal.module.css`; create `src/features/portal/portal-navigation-model.ts`, `src/features/portal/portal-navigation-model.test.ts`; preserve `src/features/portal/model.ts` ordinals.

**Interfaces:**
- Produce `resolvePortalDestination(value: string | null): 'home' | 'work' | 'money' | 'tools' | 'more'` with legacy operations→work and people/growth/reports/modules→more compatibility.
- Más presents the existing modules with ordinals 00–11 and original links. Reports remain contextual source views.

- [ ] Write failing tests: four primary destinations plus Más; every permitted canonical module remains reachable; old query/tab values resolve compatibly; no duplicate primary navigation; current role restrictions and login destination survive unchanged.
- [ ] Run `npx vitest run src/features/portal/portal-navigation-model.test.ts` and existing portal tests; confirm intended failures.
- [ ] Implement the navigation and integrate existing attention, work and money views. Keep the existing login/session resolver. Consolidate repeated quick-response/report cards at their owning destination. Show two relevant Inicio exceptions with critical-state visibility and no fabricated operational data.
- [ ] Run `npm run test:hotel-tools` and `npm run test:portal-auth`; all pass. Check 320/390/412px and desktop with keyboard, forced colors and reduced motion in an available real browser. If no browser is available, record that limitation and do not mark visual acceptance complete.
- [ ] Commit with `feat: simplify portal navigation with preserved routes`.

### Task 5: Release acceptance and canonical convergence

**Files:** Modify `docs/product/TORO_PORTAL_DESIGN_RULES.md`, `docs/product/TORO_BRAIN_GENERAL_PLAN.md`, `docs/evidence/TORO_PORTAL_LOGIN_INCIDENT_2026-10-12.md`; create `docs/evidence/TORO_PORTAL_CATALOGUE_ACCEPTANCE_2026-10-12.md`. Evidence in public docs contains aggregate counts and synthetic scenarios only.

**Interfaces:** Existing branch/PR/CI/Vercel deployment verification; canonical knowledge/task metadata updated only by conditional readback after actual receipts.

- [ ] Run `npm run test:hotel-tools`, `npm run test:portal-auth`, `npx tsc --noEmit`, `npm run lint`, `npm run build`, `git diff --check`; record new failures separately from known warnings.
- [ ] Open PR with exact migration, rollback and tests. Verify CI and a correctly configured authenticated preview; a public-demo 503 does not prove this flow.
- [ ] Apply the reviewed additive read migration, verify actual owner and denied-identity readback, then deploy the exact approved merge SHA. Retain the previous working login deployment.
- [ ] Reconcile all 243 current registered references privately: each permitted entry is discoverable or has an explicit exclusion/status; counts alone cannot prove correct grants. Verify user login and the complete Herramientas walkthrough on the canonical domain. If a reviewed link requires its native session, label that state.
- [ ] Update existing Plan/directory/task checkpoints to receipts-backed status. Keep document intake, native accounting and WhatsApp capabilities pending until their own acceptance. Roll back the new surface on isolation/session regressions.
- [ ] Commit evidence with `docs: verify catalogue release and remaining dependencies`.

## Separate financial implementation plans

Units C/D and E/F affect custody, writes and financial semantics and require separate executable plans against actual table contracts. They are part of the approved scope, not silently removed from this delivery.

| Sequence | Existing authority | Required concrete deliverable and acceptance |
| --- | --- | --- |
| C: custody and extraction | Comms intake, document_manifest, Dropbox originals, execution receipts | Inspect schema and original transport; bounded Portal upload; unchanged-byte storage/hash/readback; PDF/XML/photo candidate extraction; confidence/missing fields; replay and interrupted-custody tests. No new inbox or evidence registry. |
| D: saved draft close | daily_close_runs/items/questions, evidence_documents, invoices/invoice_sources | Exact decimal CRC/USD totals; idempotent scoped draft/reopen; attach originals by reference; missing-source checklist; counted cash versus expected; canonical readback after restart. Keep draft, final close and FinalizeDay separate. |
| E: WhatsApp intake | Existing OpenClaw host, channel identity and COLLECT_THEN_PROCESS SOP | Inspect actual host/account/group/sender binding; verify denied sender; collect until listo; same C/D pipeline and state; late attachments/restart/replay. Host access and identity evidence are currently unresolved. |
| F: native accounting | Existing Alegra Connector v2 / PR228 and current Kross/bank evidence | Rebase selected writer changes, prove company/actor permission, originals, exact approved write, idempotency/correction and independent native readback. No wholesale merge of the old branch; no posting based only on document receipt. |

First action for each plan: read-only schema/source preflight, then freeze exact write boundaries and rollback before implementation. Receiving documents does not approve fiscal emission, payments, payroll or final accounting. No source-dependent unit is declared done from mocks, connector names or READY build status.

## Self-review

Spec mapping: catalogue A→tasks 1–3; navigation B→task 4; metadata G→task 5; custody/close/WhatsApp/native C–F→separate plans above. Five Review Focus cases each have an owning test task. Shared CatalogueEntry and legacy ToolLink remain distinct and consistently named. No private inventory, source credentials or raw financial content appears in this document.

Plan status: ready for implementation-plan review. Specification approval is recorded; no new runtime code, database migration or financial effect has been activated by this plan.
