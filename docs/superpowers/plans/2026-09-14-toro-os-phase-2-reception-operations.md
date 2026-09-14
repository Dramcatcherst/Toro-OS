# TORO OS Phase 2 Reception and Operations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Deliver TERE Reception Hub and RICO operational workspaces for reception, housekeeping, laundry and maintenance without replacing Kross transactional authority.

**Architecture:** Reuse the Phase 1 authenticated shell, role model, audit/evidence pattern and Supabase clients. Build read models and controlled actions per domain; external Kross facts remain read-through/freshly imported and are visibly labeled as external authority.

**Tech Stack:** Existing TORO Next.js/Supabase stack plus the Phase 1 Vitest/Playwright harness.

**Spec:** `docs/superpowers/specs/2026-09-14-toro-os-role-based-interface-design.md`

## Global Constraints

- Kross remains authority for reservations, availability, assignment, live price and payment.
- Reception must not invent guest facts, pricing, availability or access codes.
- `[ACCESS_CODE]` comes from assigned Kross room/unit ZIP Code only after assignment and population are verified.
- Private guest data remains role-restricted.
- RICO operational writes are internal TORO state, not PMS writes unless a dedicated approved connector action exists.

---

### Task 1: Reception Hub read model

**Files:**
- Create: `src/features/reception/types.ts`
- Create: `src/features/reception/server.ts`
- Create: `src/features/reception/server.test.ts`
- Create: `src/app/toro/recepcion/page.tsx`
- Create: `src/features/reception/reception-hub.tsx`
- Create: `supabase/migrations/20260914_toro_reception_read_model.sql`

**Interfaces:**
- Produces `ReceptionDay` with arrivals, departures, guest issues, message readiness, room/villa facts and source freshness.

- [ ] Write failing tests asserting Kross-owned fields expose source/freshness and are not writable through the TORO read adapter.
- [ ] Run `npm test -- src/features/reception/server.test.ts`; expect FAIL.
- [ ] Add minimal Supabase read model/RPC for canonical TORO knowledge plus approved imported Kross evidence; authenticated Reception/Manager roles only.
- [ ] Implement `getReceptionDay(date)` and fail closed when live authority is unavailable.
- [ ] Build `/toro/recepcion` mobile cards for `Llegadas`, `Salidas`, `Pendientes`, `Mensajes`, `Habitaciones/Villas`, `Experiencias`.
- [ ] Run `npm test -- src/features/reception/server.test.ts && npm run lint && npm run build`; expect PASS.
- [ ] Commit: `feat: add TERE reception hub`.

### Task 2: Governed guest-message workflow

**Files:**
- Create: `src/features/reception/messages.ts`
- Create: `src/features/reception/messages.test.ts`
- Create: `src/features/reception/message-composer.tsx`
- Create: `supabase/migrations/20260914_toro_guest_message_actions.sql`

**Interfaces:**
- Consumes canonical `operations.guest_message_templates`.
- Produces `prepareGuestMessage({ templateKey, reservationContext })` with source verification and unresolved-token errors.

- [ ] Write failing tests for master templates 01–05, superseded `master_04_one_more_night_checkout` exclusion, unresolved access code blocking and neutral review invitation behavior.
- [ ] Run tests; expect FAIL.
- [ ] Add server/RPC guard that refuses inactive/superseded templates and logs actor/template/source/timestamp.
- [ ] Implement composer with preview, missing-data warnings and explicit send/handoff action; do not auto-send in this phase.
- [ ] Run tests/lint/build; expect PASS.
- [ ] Commit: `feat: add governed TERE message workflow`.

### Task 3: Shared RICO incident/ticket model

**Files:**
- Create: `src/features/operations/types.ts`
- Create: `src/features/operations/server.ts`
- Create: `src/features/operations/server.test.ts`
- Create: `supabase/migrations/20260914_toro_operations_tickets.sql`

**Interfaces:**
- Produces `OperationTicket` with id, domain, room/area, severity, status, owner, evidence, createdAt, dueAt, resolutionProof.
- Produces controlled actions `createTicket`, `assignTicket`, `completeTicket`.

- [ ] Write failing tests for Housekeeping/Laundry/Maintenance role boundaries and mandatory proof on completion for damage/maintenance tickets.
- [ ] Run tests; expect FAIL.
- [ ] Add normalized internal ticket table/RLS only if no existing canonical task structure satisfies the contract; otherwise adapt existing canonical tasks through a view/RPC.
- [ ] Implement server actions with audit evidence and explicit state transitions.
- [ ] Run tests and RLS negative/positive checks on Supabase branch.
- [ ] Commit: `feat: add RICO operational ticket model`.

### Task 4: Housekeeping mobile workspace

**Files:**
- Create: `src/app/toro/operacion/aseo/page.tsx`
- Create: `src/features/operations/housekeeping-board.tsx`
- Create: `src/features/operations/housekeeping.test.tsx`

**Interfaces:**
- Consumes `OperationTicket` and canonical room readiness/housekeeping evidence.

- [ ] Write tests for prioritized room list, start/finish flow, damage escalation, QA note and stock alert.
- [ ] Run tests; expect FAIL.
- [ ] Build mobile-first cards; no raw grids on primary workflow.
- [ ] Ensure completion cannot change Kross reservation truth.
- [ ] Run tests/lint/build; expect PASS.
- [ ] Commit: `feat: add RICO housekeeping workspace`.

### Task 5: Laundry workspace

**Files:**
- Create: `src/app/toro/operacion/lavanderia/page.tsx`
- Create: `src/features/operations/laundry-board.tsx`
- Create: `src/features/operations/laundry.test.tsx`

**Interfaces:**
- Tracks load status, dry weight, machine/program, incidents and handoff; preserves clean/dirty separation conceptually.

- [ ] Write tests for load lifecycle and invalid skip from received directly to stored.
- [ ] Run tests; expect FAIL.
- [ ] Build state machine `received -> sorted -> washing -> drying -> qa -> stored` with incident escape path.
- [ ] Add controlled internal writes and audit evidence.
- [ ] Run tests/lint/build; expect PASS.
- [ ] Commit: `feat: add RICO laundry workspace`.

### Task 6: Maintenance workspace

**Files:**
- Create: `src/app/toro/operacion/mantenimiento/page.tsx`
- Create: `src/features/operations/maintenance-board.tsx`
- Create: `src/features/operations/maintenance.test.tsx`

**Interfaces:**
- Adds asset/equipment context, supplier/cost estimate and proof-of-fix to maintenance tickets.

- [ ] Write tests for severity sorting, room/area linkage, photo/evidence requirement, estimate vs approved cost separation.
- [ ] Run tests; expect FAIL.
- [ ] Implement maintenance board and controlled ticket updates.
- [ ] Run tests/lint/build; expect PASS.
- [ ] Commit: `feat: add RICO maintenance workspace`.

### Task 7: Phase 2 E2E, stale states and rollout

**Files:**
- Create: `tests/e2e/toro-phase-2.spec.ts`
- Create: `docs/runbooks/TORO_PHASE_2_ROLLOUT.md`

- [ ] Add mobile E2E for Reception standard question/message preparation and each RICO role critical workflow.
- [ ] Add stale/unavailable Kross scenario asserting the UI shows unavailable/stale rather than fabricated truth.
- [ ] Run `npm test && npm run lint && npm run build && npx playwright test tests/e2e/toro-phase-2.spec.ts`; expect PASS.
- [ ] Deploy read/limited-write preview and validate with one Reception user and one Operations user per active role.
- [ ] Record deployment, tested users/roles, parity and residual Airtable dependencies in Supabase evidence.
- [ ] Only after usage parity classify replaced Airtable operational interfaces/workflows for archival.
- [ ] Commit rollout docs: `docs: add TORO phase 2 rollout runbook`.

## Phase 2 Definition of Done

- Reception can answer standard questions and prepare governed messages without raw Airtable.
- Kross authority boundaries are explicit and tested.
- Housekeeping/Laundry/Maintenance use focused mobile workflows with audit evidence.
- Private guest data remains role-restricted.
- Phase 2 CI/E2E passes and real-user parity is recorded before Airtable workflow retirement.
