# TORO OS Rollout Execution Plan v2 — Adoption + Operational Independence

> **Subordination rule — 2026-09-22:** This is an execution plan under the canonical **TORO Brain General Plan** (`docs/product/TORO_BRAIN_GENERAL_PLAN.md`). It is not a parallel master plan. Where program direction conflicts, the TORO Brain General Plan governs; this file retains execution detail only.


> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to execute each stage task-by-task. This execution plan coordinates the rollout work; detailed implementation remains in stage plans and must follow TDD.

## TORO Brain umbrella — 2026-09-22 override

This plan now executes under **TORO Brain** as the master product architecture.

- TORO Brain = master intelligence, memory, governance, portfolio/scope graph and orchestration.
- TORO OS = operating/execution layer inside a specific business/workspace.
- Dreamcatcher remains the first proving ground.
- A principal may ultimately govern multiple organizations, businesses, projects and external client/ally scopes from one TORO Brain.
- Cross-scope reasoning is policy-controlled; personal and external-client data remain isolated by default.
- New reusable capabilities must be extracted into an existing TORO subsystem/capability catalog rather than trapped in one business implementation.
- Every critical external system is expected to have a configuration profile plus recurring expected-vs-observed audit.
- OpenClaw is a gateway/runtime under TORO Comms/Tools/Systems, never a second brain.
- The future workforce horizon may include humans, AI agents and robots trained from governed TORO knowledge, but this is not a current implementation priority.

Canonical master references:
- `docs/product/TORO_BRAIN_CONSTITUTION.md`
- `docs/product/TORO_BRAIN_MASTER_ARCHITECTURE.md`
- `docs/product/TORO_SUBSYSTEM_ALIGNMENT_AUDIT_2026-09-22.md`
- `docs/product/TORO_IDENTITY_USER_VAULT_V1.md`
- `docs/product/TORO_COMMS_V1.md`
- `docs/product/TORO_TOOLS_V1.md`
- `docs/product/TORO_USER_PORTAL_V1.md`

Current external-business readiness remains blocked by the existing readiness gate. The architecture is portfolio-ready by design; production onboarding must still wait for isolation, reliability and portability proof.


**Goal:** Make TORO OS Dreamcatcher's single mobile-first, role-based operating interface while reducing Airtable to governed backup/reference use and preserving Kross, Alegra, WeSpeak and other specialist systems as domain authorities.

**Architecture:** TORO OS is the front door. Supabase is canonical for TORO-owned structured data and governance. Kross remains authority for reservations/live availability/rates/assignment/payments; Alegra remains fiscal/accounting authority; WeSpeak/WhatsApp remains a specialist communication channel. Airtable must not be required by production runtime or daily operations after cutover, but may remain as one or a few justified backup/reference bases.

**Tech Stack:** Next.js App Router; current Phase 1 uses Next.js `16.3.5`, React `19.2.4`, TypeScript 5, Tailwind 4, Supabase Postgres/Auth/RLS/RPC, Vitest, Testing Library, Playwright and Vercel Preview.

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
- Sensitive writes record actor, source, timestamp, action/evidence and a recovery/rollback path where meaningful.
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

## Current Airtable Estate Baseline

Canonical registry currently covers **384 registered tables across 8 bases**.

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

Interpret remaining content by this rule:

- **Unique manual truth** -> preserve/migrate with provenance.
- **Current TORO operational state** -> canonical Supabase/TORO model.
- **External authority** -> read-through/import/reference; do not create a duplicate ledger.
- **Regenerable derived data** -> archive or regenerate; do not force canonical persistence.
- **Historical snapshots** -> archive/reference unless a current rule explicitly depends on them.

Detailed Airtable plan:
`docs/superpowers/plans/2026-09-14-toro-os-airtable-operational-independence.md`

---

# Delivery Order

## Stage A — Close TORO Core / Phase 1

**Purpose:** get Mauricio into a real, secure and useful TORO experience before expanding the product.

Implementation baseline:
`docs/superpowers/plans/2026-09-14-toro-os-phase-1-executive-shell.md`

Closeout plan:
`docs/superpowers/plans/2026-09-14-toro-os-phase-1-closeout.md`

Current implementation includes Auth, fail-closed role resolution, mobile shell, Mauricio Executive Home, Decisions, founder-only audited decision actions, governed global search, loading/error/stale states, logout, rollout runbook and Playwright harness.

Remaining sequence:

1. Establish a real Mauricio Founder Auth identity and restricted test identity.
2. Verify Preview public Supabase configuration and current head `READY`.
3. Run real Founder/restricted Playwright E2E with a disposable test decision fixture only.
4. Mauricio validates the flow on a real phone.
5. Re-run tests, lint, build, SQL authorization and production dependency/security checks.
6. Remove DRAFT and merge PR #15 only after evidence is complete.

**Stage A exit gate:** Mauricio can sign in, see only authorized executive data, resolve a test decision with audit evidence, search governed entities and use the experience comfortably from mobile.

---

## Stage B — Revenue Bridge

**Purpose:** eliminate the aging parallel Revenue workstream and retire the active AGENCIAS operational dependency before it drifts further.

Detailed plan:
`docs/superpowers/plans/2026-09-14-toro-os-revenue-bridge.md`

Source branch/workstream: PR #12 `feat/revenue-admin-cutover-20260912`.

Execution rule:

1. Do not merge PR #12 blindly.
2. After Phase 1 lands on `main`, compare/extract Revenue-specific work into a clean branch on the new main.
3. Reuse the shared TORO Auth/session/navigation architecture.
4. Re-run the canonical Revenue parity contract.
5. Deploy READY Preview and verify authorized/unauthorized access.
6. Compare representative live UI values with Airtable AGENCIAS.
7. Mark AGENCIAS migrated/inactive only after runtime parity.
8. Close PR #12 as superseded after the clean bridge lands.

**Stage B exit gate:** Revenue is inside TORO architecture and AGENCIAS is no longer operationally required.

---

## Stage C — Daily Hotel Operations: TERE + RICO

Source plan:
`docs/superpowers/plans/2026-09-14-toro-os-phase-2-reception-operations.md`

**Execution override:** reuse `operations.tasks`, `facilities.maintenance_events`, canonical rooms, knowledge and guest-message templates before creating any new ticket/domain table.

Order:

1. **C1 TERE Reception read experience** — arrivals/departures/issues/room-villa knowledge with visible Kross authority/freshness.
2. **C2 Governed guest messages** — canonical templates, unresolved-token blocking, preview/handoff before send.
3. **C3 RICO Maintenance** — prioritize because `facilities.maintenance_events` already contains operational evidence.
4. **C4 Housekeeping** — readiness, QA, damages and stock alerts; never rewrite Kross reservation truth.
5. **C5 Laundry** — load lifecycle, incidents, handoffs and linen/stock signals.
6. **C6 Controlled writes + rollout** — enable only after role, audit, stale-state and parity tests.

**Stage C exit gate:** reception, maintenance, housekeeping and laundry perform common mobile workflows without raw Airtable; Kross boundaries remain explicit.

---

## Stage D — Management: Projects + Knowledge, then FIONA

Source plan:
`docs/superpowers/plans/2026-09-14-toro-os-phase-3-projects-knowledge-finance.md`

### D1 — Projects + Knowledge first

Existing foundation already includes `operations.projects`, `operations.tasks` and `operations.knowledge_items`.

- Build the portfolio from existing records before creating project/task tables.
- Keep archived/historical work out of the active portfolio unless explicitly reactivated.
- Expose provenance, verification and freshness in knowledge.
- Fold DreamTeam Knowledge OS residual unique content into governed knowledge only after semantic verification.

### D2 — FIONA Finance second

- Alegra remains fiscal authority; banks/Kross remain source evidence.
- Populate `finance.*` only where a real analytical/workflow need exists.
- Prefer exception/close/reconciliation views over raw ledger editing.
- Keep finance server-side and role-restricted.

**Stage D exit gate:** projects and knowledge have one governed home; Finance is useful and restricted without impersonating Alegra.

---

## Stage E — Systems, Resilience, Admin, then Growth

Source plan:
`docs/superpowers/plans/2026-09-14-toro-os-phase-4-growth-systems-admin.md`

Execution order override:

1. **E1 SOBRESITO Systems Health** — connector/deployment/sync/freshness exceptions first.
2. **E2 Backup + Restore + DR** — real artifacts, restore drills, ownership and Airtable estate health.
3. **E3 Admin** — permissions, role changes, audit and rollout controls.
4. **E4 SKY Growth** — campaigns, SEO, media approvals, offers and experience/provider readiness.
5. **E5 Privacy-safe telemetry** — adoption/failure signals without guest/bank/secret payload leakage.

**Stage E exit gate:** system/recovery health is visible, permissions are governed, Growth uses verified content, and product-wide critical paths are evidenced.

---

# Validation Strategy Without Supabase Branching

Current Supabase plan does not support Development Branching. Do not repeatedly attempt branch creation unless account capability changes.

Accepted database-change sequence:

1. Write application/contract tests first.
2. Validate SQL in isolated PostgreSQL CI with Supabase-compatible fixtures for RLS/JWT contracts that can be simulated faithfully.
3. Run production schema preflight: required schemas/tables/columns/helpers/privileges must exist.
4. Prepare explicit rollback SQL or a safe forward-fix path.
5. Apply the reviewed minimal migration to production only after isolated validation/preflight pass.
6. Immediately run post-migration authorization checks and Supabase security advisor.
7. Never mutate live business rows merely to prove a migration. Use disposable fixtures only where the environment safely supports them.

---

# Airtable Operational Independence Order

1. **Command Center** — unique remaining 0; retire operational use after Phase 1 parity + automation/consumer audit.
2. **DreamTeam Knowledge OS** — validate/preserve remaining `Waste & Recycling` unique content.
3. **Master Brain** — remove runtime fallback risk first, then domain parity.
4. **Inventory & Assets** — map 25 tables to existing `assets`, `facilities`, `risk`, knowledge/supplier models before creating new structures.
5. **Sistema Operativo Central** — reduce 118 tables by domain; migrate current unique business truth only.
6. **WEB / Provider / Main physical retirement** — keep the original delete-readiness gates only for optional destructive retirement.

Physical deletion remains separately authorized and is never required for TORO product completion.

---

# Progress Reporting

Do not publish one blended percentage that implies precision across unlike workstreams.

Report at least:

- `TORO Core / Stage A`
- `Revenue Bridge / Stage B`
- `Daily Operations / Stage C`
- `Management / Stage D`
- `Systems + Adoption / Stage E`
- `Airtable operational independence`
- `Legacy Airtable delete readiness` only when discussing optional physical retirement.

The current overall program estimate may be used only as a broad planning range, with the component tracks shown beside it.

---

# Program Definition of Done

TORO OS is complete when:

- Mauricio and representative staff operate through one role-based mobile-first interface.
- Supabase owns TORO canonical truth with provenance/freshness/governance.
- Kross, Alegra, WeSpeak and specialist systems retain their domain authority without unnecessary duplication.
- TERE, RICO, FIONA, SKY and SOBRESITO share the same governed architecture.
- No critical runtime or daily workflow depends on Airtable.
- Unique current business truth has a governed destination.
- Critical backups have restore evidence and named recovery ownership.
- Airtable remains only as documented backup/reference, ideally one base or a few justified bases.
- The six gates PRODUCT, DATA, SECURITY, INTEGRATIONS, RESILIENCE and ADOPTION pass for production-critical paths.