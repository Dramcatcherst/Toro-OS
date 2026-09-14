# TORO OS Phase 3 Projects, Knowledge and Finance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Consolidate project/knowledge work into governed TORO modules and deliver a restricted FIONA finance/admin workspace without replacing Alegra as fiscal authority.

**Architecture:** Reuse shared shell, auth, audit and search from Phases 1–2. Projects and knowledge live canonically in Supabase; Finance uses restricted read models/actions over canonical operational evidence plus imported/read-through accounting evidence, never a duplicate fiscal ledger.

**Tech Stack:** Existing TORO Next.js/Supabase stack, Vitest/Playwright.

**Spec:** `docs/superpowers/specs/2026-09-14-toro-os-role-based-interface-design.md`

## Global Constraints

- Historical project/task records remain historical unless explicitly activated.
- Knowledge items expose provenance, verification and review state.
- Alegra remains accounting/fiscal authority where applicable.
- Finance data is restricted to authorized roles and server-side access.
- No bank/accounting secrets or sensitive payloads enter analytics/logs unnecessarily.

---

### Task 1: Governed project portfolio

**Files:**
- Create: `src/features/projects/types.ts`
- Create: `src/features/projects/server.ts`
- Create: `src/features/projects/server.test.ts`
- Create: `src/features/projects/project-portfolio.tsx`
- Create: `src/app/toro/proyectos/page.tsx`
- Create: `supabase/migrations/20260914_toro_project_portfolio.sql`

**Interfaces:**
- Produces `ProjectSummary` with milestone, blocker, nextAction, owner, evidence, confidence/status and source freshness.

- [ ] Write failing tests excluding archived/historical-only tasks from active portfolio and asserting one current milestone/next action per project.
- [ ] Run tests; expect FAIL.
- [ ] Add minimal RLS-respecting view/RPC over existing canonical project/task data; do not create duplicate project tables if existing data suffices.
- [ ] Build mobile/desktop project portfolio with exceptions first.
- [ ] Run tests/lint/build; expect PASS.
- [ ] Commit: `feat: add governed project portfolio`.

### Task 2: Knowledge workspace and provenance

**Files:**
- Create: `src/features/knowledge/types.ts`
- Create: `src/features/knowledge/server.ts`
- Create: `src/features/knowledge/server.test.ts`
- Create: `src/features/knowledge/knowledge-browser.tsx`
- Create: `src/app/toro/conocimiento/page.tsx`
- Create: `supabase/migrations/20260914_toro_knowledge_search.sql`

**Interfaces:**
- Produces authorized search/filter over `operations.knowledge_items`, governance rules, SOPs and canonical room/villa facts.

- [ ] Write tests for verified vs needs-review state, audience/visibility filtering, source provenance and review timestamps.
- [ ] Run tests; expect FAIL.
- [ ] Add RLS-respecting search/read model; private finance/guest knowledge must not leak through broad search.
- [ ] Build browser with filters `SOP · Habitaciones/Villas · Políticas · Operación · Sistemas · Archivo` and explicit source/review badge.
- [ ] Run tests/lint/build; expect PASS.
- [ ] Commit: `feat: add governed knowledge workspace`.

### Task 3: FIONA finance executive read model

**Files:**
- Create: `src/features/finance/types.ts`
- Create: `src/features/finance/server.ts`
- Create: `src/features/finance/server.test.ts`
- Create: `src/app/toro/dinero/page.tsx`
- Create: `src/features/finance/finance-home.tsx`
- Create: `supabase/migrations/20260914_toro_finance_read_model.sql`

**Interfaces:**
- Produces `FinanceSnapshot` with close status, reconciliation exceptions, receivable/payable alerts, tax/reporting blockers and freshness/source labels.

- [ ] Write failing tests: Reception/Operations denied; FOUNDER/GERENCIA/FINANZAS allowed according to policy; source labels distinguish Alegra/bank/Kross evidence from TORO analytical state.
- [ ] Run tests; expect FAIL.
- [ ] Add restricted read model/RPC with explicit org/role checks and no `anon` execute.
- [ ] Build `/toro/dinero` with exception cards and no raw accounting ledger editing.
- [ ] Run Supabase negative/positive role tests and app tests; expect PASS.
- [ ] Commit: `feat: add FIONA finance snapshot`.

### Task 4: Finance/admin controlled actions

**Files:**
- Create: `src/features/finance/actions.ts`
- Create: `src/features/finance/actions.test.ts`
- Create: `supabase/migrations/20260914_toro_finance_actions.sql`

**Interfaces:**
- Supports internal acknowledge/assign/request-document/approve-TORO-workflow actions only; does not post fiscal entries to Alegra in this phase.

- [ ] Write tests requiring role and confirmation for approvals; deny any action that would masquerade as an Alegra ledger write.
- [ ] Run tests; expect FAIL.
- [ ] Implement audited internal actions with actor/evidence and explicit `external_write=false` unless a later approved connector adds real external action support.
- [ ] Run tests/RLS checks; expect PASS.
- [ ] Commit: `feat: add controlled FIONA workflow actions`.

### Task 5: Cross-module project/knowledge search integration

**Files:**
- Modify: `src/features/search/server.ts`
- Modify: `src/features/search/search.test.ts`
- Modify: `src/components/toro/app-shell.tsx`

- [ ] Extend failing tests for project and knowledge results with authorization filtering.
- [ ] Run tests; expect FAIL.
- [ ] Extend search RPC/adapter without exposing finance-private text to unauthorized roles.
- [ ] Verify search destinations and freshness badges.
- [ ] Run tests/lint/build; expect PASS.
- [ ] Commit: `feat: extend TORO search to projects and knowledge`.

### Task 6: Phase 3 E2E and rollout

**Files:**
- Create: `tests/e2e/toro-phase-3.spec.ts`
- Create: `docs/runbooks/TORO_PHASE_3_ROLLOUT.md`

- [ ] Add E2E for project drill-down, knowledge search, finance role denial and authorized founder/finance read.
- [ ] Add stale accounting-evidence state asserting visible freshness rather than silent current-looking data.
- [ ] Run `npm test && npm run lint && npm run build && npx playwright test tests/e2e/toro-phase-3.spec.ts`; expect PASS.
- [ ] Validate with Mauricio/Gerencia and one Finance/Admin user.
- [ ] Record parity and remaining Airtable knowledge/project dependencies.
- [ ] Classify replaced Airtable project/knowledge interfaces for archival only after real usage validation.
- [ ] Commit rollout docs: `docs: add TORO phase 3 rollout runbook`.

## Phase 3 Definition of Done

- Projects have one governed portfolio rather than duplicate task dumps.
- Knowledge is searchable with provenance/verification state.
- Finance data is restricted and clearly separates TORO analytics from Alegra fiscal truth.
- Internal finance workflow actions are auditable and cannot impersonate fiscal ledger writes.
- Phase 3 CI/E2E and real-user validation pass.
