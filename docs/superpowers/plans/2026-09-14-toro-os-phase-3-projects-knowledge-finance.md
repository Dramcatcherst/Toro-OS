# TORO OS Stage D — Projects, Knowledge and FIONA Plan v2

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans`. Follow TDD and the Master Plan v2 gates.

**Goal:** Consolidate project and knowledge work first, then add a restricted FIONA finance/admin experience without recreating Alegra or bank ledgers inside TORO.

**Architecture:** Reuse existing `operations.projects`, `operations.tasks`, `operations.knowledge_items`, canonical content/governance and the shared TORO shell. Projects/knowledge are TORO-owned domains. Finance is an exception/workflow/read-model layer over governed imports and external authority, not a second accounting system.

**Tech Stack:** TORO Next.js/Supabase stack after Stage C, Vitest/Testing Library/Playwright.

**Spec:** `docs/superpowers/specs/2026-09-14-toro-os-role-based-interface-design.md`

## Global Constraints

- Stage D starts after Stage C core adoption, unless read-only work is explicitly independent.
- Historical project/task records remain historical unless explicitly reactivated.
- Knowledge exposes provenance, verification and freshness/review state.
- Alegra remains fiscal/accounting authority.
- Kross/payment/bank data is source evidence; do not duplicate entire ledgers merely to populate TORO.
- Finance private data is server-side and role-restricted.
- Existing Supabase tables are preferred over new schemas/tables.
- Database DDL validation uses isolated PostgreSQL CI + production preflight/post-DDL advisor on the current plan.

---

## D1 — Projects + Knowledge First

### Task 1: Governed project portfolio

**Files:**
- Create: `src/features/projects/types.ts`
- Create: `src/features/projects/server.ts`
- Create: `src/features/projects/server.test.ts`
- Create: `src/features/projects/project-portfolio.tsx`
- Create: `src/app/toro/proyectos/page.tsx`
- Add only a minimal read RPC/view if existing RLS queries are insufficient.

**Produces:** `ProjectSummary` with milestone, blocker, nextAction, owner, evidence, confidence/status and source freshness.

- [ ] Write failing tests excluding archived/historical-only tasks from active portfolio.
- [ ] Assert one current milestone/next action per active project rather than a duplicate task dump.
- [ ] Implement adapter over existing projects/tasks.
- [ ] Build exception-first mobile/desktop portfolio.
- [ ] Verify tests/lint/build PASS.

### Task 2: Knowledge workspace + provenance

**Files:**
- Create: `src/features/knowledge/types.ts`
- Create: `src/features/knowledge/server.ts`
- Create: `src/features/knowledge/server.test.ts`
- Create: `src/features/knowledge/knowledge-browser.tsx`
- Create: `src/app/toro/conocimiento/page.tsx`

- [ ] Write failing tests for verified vs needs-review, audience/visibility filtering, provenance and review timestamps.
- [ ] Implement authorized read/search over `operations.knowledge_items`, governance rules, hotel facts, room/villa truth and SOPs.
- [ ] Keep private finance/guest/internal-only knowledge out of broad search.
- [ ] Build filters: `SOP · Habitaciones/Villas · Políticas · Operación · Sistemas · Archivo`.
- [ ] Surface source, verification and freshness badges.
- [ ] Verify tests/lint/build PASS.

### Task 3: DreamTeam Knowledge residual quick win

Current residual estate shows DreamTeam Knowledge OS with one unique table remaining: `Waste & Recycling`, 5 rows.

- [ ] Compare the five rows semantically with current sustainability/knowledge records.
- [ ] Preserve unique valid content with source references; do not duplicate if canonical equivalent exists.
- [ ] Update Airtable registry/migration map so unique remaining becomes zero only with evidence.
- [ ] Keep source base backup/reference until automation/consumer/archive gates pass.

---

## D2 — FIONA Finance After Projects/Knowledge

### Task 4: Finance executive read model

**Files:**
- Create: `src/features/finance/types.ts`
- Create: `src/features/finance/server.ts`
- Create: `src/features/finance/server.test.ts`
- Create: `src/features/finance/finance-home.tsx`
- Create: `src/app/toro/dinero/page.tsx`

**Produces:** `FinanceSnapshot` with close status, reconciliation exceptions, receivable/payable alerts, tax/reporting blockers and source/freshness labels.

- [ ] Write failing authorization tests: Reception/Operations denied; Founder/Gerencia/Finanzas allowed only by policy.
- [ ] Assert source labels distinguish Alegra/bank/Kross evidence from TORO analytical state.
- [ ] Build the smallest restricted read model needed for exceptions/close state.
- [ ] Do not bulk-copy fiscal history into TORO merely because `finance.*` tables exist.
- [ ] Build exception cards; no raw accounting ledger editor.
- [ ] Verify RLS positive/negative cases and tests/lint/build PASS.

### Task 5: Controlled finance/admin workflow actions

**Files:**
- Create: `src/features/finance/actions.ts`
- Create: `src/features/finance/actions.test.ts`
- Add controlled RPC only where an existing action boundary is insufficient.

Allowed initial TORO actions: acknowledge, assign, request document, approve internal workflow.

- [ ] Write failing tests requiring role + confirmation for approvals.
- [ ] Explicitly deny any action that masquerades as an Alegra fiscal entry.
- [ ] Implement audited internal actions with `external_write=false` unless a later connector is explicitly approved.
- [ ] Verify RLS/RPC and app tests PASS.

### Task 6: Management search integration

- [ ] Extend governed search to project/knowledge destinations using existing authorization contracts.
- [ ] Keep Finance-private text excluded from broad global search unless a separate authorized finance search contract is created.
- [ ] Verify role filtering and freshness badges.

### Task 7: Stage D rollout

**Files:**
- Create: `tests/e2e/toro-phase-3.spec.ts`
- Create: `docs/runbooks/TORO_PHASE_3_ROLLOUT.md`

- [ ] E2E project drill-down.
- [ ] E2E knowledge search/provenance.
- [ ] E2E Finance denial and authorized read.
- [ ] E2E stale accounting evidence visible as stale, not current-looking truth.
- [ ] Validate with Mauricio/Gerencia and one Finance/Admin user.
- [ ] Record adoption/parity and residual Airtable project/knowledge dependencies.

## Stage D Definition of Done

- Projects have one governed portfolio rather than duplicate task dumps.
- Knowledge is searchable with provenance/verification state.
- DreamTeam Knowledge residual unique truth is preserved.
- Finance is restricted and clearly separates TORO workflow/analytics from Alegra fiscal truth.
- Real-user validation passes before legacy project/knowledge interfaces become backup-only.
