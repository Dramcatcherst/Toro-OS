# TORO OS Master Plan v2 — Adoption + Operational Independence

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to execute each stage task-by-task. This master coordinates the product program; detailed feature implementation remains in the phase plans and must follow TDD.

**Goal:** Make TORO OS Dreamcatcher's single mobile-first, role-based operating interface while reducing Airtable to governed backup/reference use and preserving Kross, Alegra and other specialist systems as domain authorities.

**Architecture:** TORO OS is the front door. Supabase is canonical for TORO-owned structured data and governance. Kross remains authority for reservations, live availability/rates/assignment/payments; Alegra remains fiscal/accounting authority; WeSpeak and other specialist systems keep their approved scopes. Airtable is not a required runtime or daily operating interface after cutover; it may remain as one or a few justified backup/reference bases.

**Tech Stack:** Next.js App Router; current Phase 1 branch uses Next.js `16.3.5`, React `19.2.4`, TypeScript 5, Tailwind 4, Supabase Postgres/Auth/RLS/RPC, Vitest, Testing Library and Playwright.

**Spec:** `docs/superpowers/specs/2026-09-14-toro-os-role-based-interface-design.md`

## Global Constraints

- One front door: normal users should not need raw Supabase or Airtable tables.
- Supabase is canonical only for TORO-owned truth; do not duplicate specialist transactional ledgers unnecessarily.
- Kross remains authority for reservations, room assignment, live rates, availability and payments.
- Alegra remains authority for fiscal/accounting entries where applicable.
- WeSpeak/WhatsApp remains a specialist guest-communication channel; TORO governs knowledge, templates, permissions and evidence around it.
- Airtable target is **zero critical operational dependency**, not zero Airtable.
- Preferred residual Airtable estate: one governed `DREAMCATCHER VAULT — BACKUP` base; allow more only with documented restore, ownership or permission justification.
- Never treat an Airtable copy alone as disaster recovery. Critical data requires an independent artifact plus restore evidence.
- No service-role secret in browser code. Browser/runtime uses publishable credentials only.
- Private data uses least privilege, RLS and controlled server actions/RPC.
- Sensitive writes must record actor, source, timestamp, action/evidence and a recovery/rollback path where meaningful.
- Historical tasks/decisions remain historical unless explicitly reactivated.
- Existing Supabase domain models must be adapted before creating new tables.
- Do not migrate reloadable Kross/Alegra/OTA history merely to make Airtable smaller.
- Frequent safe mobile actions should be completable in three taps or fewer.
- Finish an open exit gate before opening a broad new workstream unless independent blocked-time work has a clear payoff.

---

## Program KPI Model

The old `54.80%` metric is retained only as **Legacy Airtable Phase-1 delete readiness** for the original Main + WEB + Provider scope. It is not TORO OS completion.

Primary product/program KPIs:

| KPI | Target |
| --- | ---: |
| Daily users who require Airtable to do their job | 0 |
| Critical workflows available only in Airtable | 0 |
| Production/runtime dependencies on Airtable | 0 |
| Unique operational truth not preserved in a governed destination | 0 |
| Routine role actions executable from mobile | >=80% |
| Critical backups with successful restore evidence | 100% |
| Airtable bases still used operationally | 0 |
| Residual Airtable backup/reference bases | 1 preferred; few justified |

Each product stage must pass six gates:

1. **PRODUCT** — mobile-first, role-based, action-over-data, <=3 taps for common safe actions.
2. **DATA** — source of truth, deduplication, provenance, freshness and data-quality checks.
3. **SECURITY** — least privilege, RLS, safe RPC/actions, approvals and audit evidence.
4. **INTEGRATIONS** — authority boundaries, connector health, drift detection and explicit fallback.
5. **RESILIENCE** — backup, restore drill, rollback and disaster-recovery ownership.
6. **ADOPTION** — representative user validation, embedded operating guidance and retirement of the replaced legacy workflow.

---

## Current Estate Baseline

Canonical Airtable registry currently covers **384 registered tables across 8 bases**.

| Base | Registered tables | Unique data remaining |
| --- | ---: | ---: |
| DREAMCATCHER HOTEL | 154 | 0 |
| TORO OS — Sistema Operativo Central | 118 | 97 |
| DREAMCATCHER WEB + CHANNELS | 49 | 0 |
| TORO OS — Master Brain | 28 | 21 |
| Dreamcatcher Hotel — Inventario & Activos | 25 | 25 |
| DreamTeam Knowledge OS | 7 | 1 |
| TORO OS — Command Center | 2 | 0 |
| Proveedores de Tours · Santa Teresa | 1 | 0 |

Interpretation rule for remaining Airtable content:

- **Unique manual truth** -> preserve/migrate with provenance.
- **Current TORO operational state** -> canonical Supabase/TORO model.
- **External authority** -> read-through/import/reference; do not create a duplicate ledger.
- **Regenerable derived data** -> archive or regenerate; do not force canonical persistence.
- **Historical snapshots** -> archive/reference unless a current rule explicitly depends on them.

---

# Delivery Order

## Stage A — Close TORO Core / Phase 1

**Purpose:** get Mauricio into a real, secure, useful TORO experience before expanding the surface.

Detailed implementation plan: `docs/superpowers/plans/2026-09-14-toro-os-phase-1-executive-shell.md`.

Current implementation includes Auth, fail-closed role resolution, mobile shell, Mauricio Executive Home, Decisions, founder-only audited decision actions, governed global search, loading/error/stale states, logout, rollout runbook and Playwright harness.

### A1 — Runtime identity gate

- [ ] Identify/create a real Mauricio Founder Auth identity through an authorized Auth flow; do not silently repurpose another user.
- [ ] Ensure Founder identity has explicit `app_metadata.toro_role=FOUNDER` and active `ADMIN` or `GERENCIA` membership for the relevant organization.
- [ ] Identify/create a restricted non-Founder test identity.
- [ ] Verify restricted user cannot see/execute Founder-only decision actions.

### A2 — Preview runtime gate

- [ ] Require latest Phase 1 deployment `READY` in Vercel Preview.
- [ ] Verify Preview has `NEXT_PUBLIC_SUPABASE_URL` and a publishable Supabase key; never use service role in browser/runtime.
- [ ] Verify `/toro` redirects unauthenticated users to login and serves the authenticated shell after login.

### A3 — Real E2E + Mauricio parity

- [ ] Run Playwright critical path against the real preview using test credentials supplied only through secure environment variables.
- [ ] Verify Founder sees the five Executive Home sections and <=5 immediate decisions.
- [ ] Verify a development/test decision can be resolved and durable audit evidence exists.
- [ ] Verify restricted denial and search privacy.
- [ ] Mauricio validates mobile navigation, readability and decision flow on an actual phone.

### A4 — Merge/cutover

- [ ] Keep PR #15 DRAFT until A1-A3 pass.
- [ ] Re-run tests, lint, build, SQL security assertions and dependency audit on final head.
- [ ] Merge only after Product/Data/Security/Integrations/Resilience/Adoption gates are evidenced.
- [ ] Keep legacy Command Center available as read-only/reference until parity evidence is recorded.

**Stage A exit gate:** Mauricio can sign in, see only authorized executive data, resolve a decision with audit evidence, search governed entities and use the experience comfortably from mobile.

---

## Stage B — Revenue Bridge

**Purpose:** eliminate the separate aging Revenue workstream and retire the live AGENCIAS dependency before it drifts further.

Source workstream: PR #12 `feat/revenue-admin-cutover-20260912`.

### B1 — Rebase/extract, do not merge PR #12 blindly

- [ ] After Stage A lands on `main`, compare PR #12 against new `main`.
- [ ] Extract/rebase only the Revenue-specific private Admin/read model work that is not already superseded by Phase 1 auth/shell patterns.
- [ ] Open a clean Revenue Bridge PR on top of post-Phase-1 `main`.
- [ ] Reuse current auth/session/navigation patterns instead of maintaining a parallel login stack.

### B2 — Runtime parity

- [ ] Deploy Revenue Bridge Preview READY.
- [ ] Test authorized ADMIN/GERENCIA/REVENUE access and unauthorized denial.
- [ ] Compare representative agency/room/season/date results with the current Airtable AGENCIAS interface: rack, commission, agency earning, hotel net, conditions and overrides.
- [ ] Record parity evidence in Supabase dependency ledger.

### B3 — Retire AGENCIAS operational dependency

- [ ] Mark the Airtable AGENCIAS dependency migrated/inactive only after runtime parity.
- [ ] Do not promote historical legacy villa/product rates into current `revenue.*` without a separately verified current source.

**Stage B exit gate:** Revenue operates inside the TORO architecture and the active Airtable AGENCIAS interface is no longer operationally required.

---

## Stage C — Daily Hotel Operations: TERE + RICO

Detailed source plan: `docs/superpowers/plans/2026-09-14-toro-os-phase-2-reception-operations.md`.

**Revised rule:** reuse `operations.tasks`, `facilities.maintenance_events`, canonical rooms/knowledge/message templates and existing governance before creating any new ticket/domain table.

Execution order:

1. **C1 TERE Reception read experience** — arrivals/departures/issues/room-villa knowledge with visible Kross authority/freshness.
2. **C2 Governed guest messages** — canonical templates, unresolved-token blocking, preview/handoff before send.
3. **C3 RICO Maintenance** — prioritize first because `facilities.maintenance_events` already contains operational evidence and therefore offers the shortest path to live value.
4. **C4 Housekeeping** — room readiness, QA, damages, stock alerts; internal TORO state must not rewrite Kross reservation truth.
5. **C5 Laundry** — load lifecycle, separation controls, incidents, handoff and stock/linen signals.
6. **C6 Controlled writes + rollout** — enable only after role, audit, stale-state and parity tests.

**Stage C exit gate:** reception, maintenance, housekeeping and laundry can perform their common mobile workflows without raw Airtable; Kross boundaries remain explicit.

---

## Stage D — Management: Projects + Knowledge, then FIONA

Detailed source plan: `docs/superpowers/plans/2026-09-14-toro-os-phase-3-projects-knowledge-finance.md`.

### D1 — Projects + Knowledge first

Existing foundation already includes `operations.projects`, `operations.tasks` and `operations.knowledge_items`.

- [ ] Build a project portfolio from existing canonical records before inventing new project/task tables.
- [ ] Keep archived/historical tasks out of the active portfolio unless explicitly reactivated.
- [ ] Build knowledge browsing/search with provenance, verification state and review/freshness badges.
- [ ] Fold DreamTeam Knowledge OS residual unique content into the governed knowledge model when verified.

### D2 — FIONA Finance after Projects/Knowledge

- [ ] Treat Alegra as fiscal authority and banks/Kross as source evidence, not as ledgers to reproduce blindly.
- [ ] Populate `finance.*` through governed imports/read models only where an analytical or workflow need exists.
- [ ] Build exception/close/reconciliation views before raw transaction editing.
- [ ] Keep Finance role-restricted and server-side.

**Stage D exit gate:** projects and knowledge have one governed home; Finance provides useful restricted analysis/workflow without impersonating Alegra.

---

## Stage E — Systems, Resilience, Admin, then Growth

Detailed source plan: `docs/superpowers/plans/2026-09-14-toro-os-phase-4-growth-systems-admin.md`.

Revised execution order:

1. **E1 SOBRESITO Systems Health** — connector/deployment/sync/freshness exceptions first.
2. **E2 Backup + Restore + DR** — real artifacts, restore drills, ownership, Airtable estate health.
3. **E3 Admin** — permissions, role changes, audit and rollout controls.
4. **E4 SKY Growth** — campaigns, SEO, media approvals, offers, experience/provider readiness.
5. **E5 Privacy-safe telemetry** — adoption and failure signals without guest/bank/secret payload leakage.

**Stage E exit gate:** operators can see system health and recovery state, permissions are governed, Growth uses verified content, and the full product has product-wide critical-path evidence.

---

# Airtable Consolidation Track

Airtable work is now driven by operational dependency and unique truth, not by raw table count.

Recommended order:

1. **Command Center** — 2 tables, 18 historical rows preserved, unique remaining 0. Move to backup/reference after Phase 1 parity + automation/consumer audit.
2. **DreamTeam Knowledge OS** — only one unique table remains (`Waste & Recycling`, 5 rows); validate and preserve it early.
3. **Master Brain** — prioritize runtime fallback removal, guest-communication semantic diff, external mappings redaction and the 21 unique tables.
4. **Inventory & Assets** — inventory its 25 tables record-level and map to existing `assets`, `facilities`, `risk`, knowledge and supplier models before creating anything new.
5. **Sistema Operativo Central** — process by domain, not by 118-table mega-migration. Archive/regenerate external history and derived data; migrate only current unique business truth.
6. **WEB / Provider / Main physical retirement** — keep legacy delete-readiness gates for optional destructive retirement, but do not let deletion distract from operational independence.

Physical Airtable deletion remains separately authorized. No software phase may delete bases automatically.

---

# Validation Strategy Without Supabase Branching

The current Supabase plan does not provide Development Branching. Do not repeatedly attempt to create a branch unless plan capability changes.

Accepted validation sequence for database changes:

1. TDD at application/contract layer.
2. Apply migration to an **isolated PostgreSQL CI fixture** that reproduces required schemas/roles/helpers; run positive and negative authorization assertions.
3. Run production **schema preflight** for required tables, columns, helper functions and RLS state.
4. Prepare rollback/reversal path for the exact change.
5. Apply reviewed migration to production only when the change is fail-closed and preflight-compatible.
6. Immediately run post-DDL assertions and Supabase security advisor.
7. Do not perform test mutations against real business records; use a dedicated test fixture only where explicitly safe.

This replaces the obsolete requirement that every Phase 1 migration first use Supabase Development Branching.

---

# Current Program State at v2 Adoption

- Phase 1 application work: approximately 90%; PR #15 remains DRAFT/mergeable pending real identity/E2E/mobile gates.
- Phase 1 database migrations and Founder organization-membership hardening have been applied and SQL authorization assertions passed.
- Phase 1 Preview deployments are reaching READY.
- Current Phase 1 branch uses patched Next.js `16.3.5`.
- Revenue PR #12 remains a separate DRAFT and must be converged through Stage B instead of allowed to drift indefinitely.
- Airtable canonical registry: 384 tables / 8 bases; operational independence is incomplete.
- `Legacy Airtable Phase-1 delete readiness` remains a separate legacy metric; do not use it as TORO OS overall progress.

# Next Single Highest-Impact Action

Close **A1 Founder Auth**: safely create/identify Mauricio's real TORO Auth identity with explicit Founder metadata and organization membership, then create/identify one restricted test identity. That unlocks real Preview E2E and mobile parity without opening another major workstream.
