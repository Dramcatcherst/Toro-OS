# TORO OS Stage C — TERE + RICO Daily Operations Plan v2

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans`. Follow TDD and the Master Plan v2 quality gates.

**Goal:** Deliver the daily mobile workflows that remove raw Airtable from reception, maintenance, housekeeping and laundry without replacing Kross transactional authority.

**Architecture:** Reuse the Phase 1 shell, Auth, roles, audit patterns and Supabase clients. Prefer adapters/RPCs over existing `operations.tasks`, `facilities.maintenance_events`, canonical rooms, knowledge and guest-message templates before creating new domain tables. Kross-owned truth remains visible as external authority/freshness, never silently copied into TORO as a second PMS.

**Tech Stack:** TORO Next.js/Supabase stack after Phase 1, Vitest/Testing Library/Playwright.

**Spec:** `docs/superpowers/specs/2026-09-14-toro-os-role-based-interface-design.md`

## Global Constraints

- Do not start Stage C writes until Phase 1 exit gate passes.
- Kross remains authority for reservations, assignment, availability, live price and payments.
- Reception must not invent guest facts, availability, pricing or access codes.
- `[ACCESS_CODE]` comes from the assigned Kross room/unit ZIP Code only after assignment and source population are verified.
- Private guest data remains role-restricted.
- Internal TORO operational state must not mutate PMS truth unless a dedicated approved connector action exists.
- Reuse existing canonical models before creating a new `OperationTicket` table.
- Database DDL uses isolated PostgreSQL CI + production preflight/post-DDL advisor; Supabase Development Branching is not required on the current plan.

---

### Task 1: TERE Reception Hub read model

**Files:**
- Create: `src/features/reception/types.ts`
- Create: `src/features/reception/server.ts`
- Create: `src/features/reception/server.test.ts`
- Create: `src/features/reception/reception-hub.tsx`
- Create: `src/app/toro/recepcion/page.tsx`
- Create only if needed: a minimal Supabase migration/read RPC.

**Produces:** `ReceptionDay` with arrivals, departures, guest issues, message readiness, room/villa facts and freshness/source labels.

- [ ] Write failing tests that Kross-owned fields are visibly external/read-only and stale/unavailable data fails closed.
- [ ] Run the targeted test; confirm RED for missing adapter/UI.
- [ ] Implement the minimal read adapter over canonical TORO data + approved Kross evidence.
- [ ] Build mobile cards: `Llegadas`, `Salidas`, `Pendientes`, `Mensajes`, `Habitaciones/Villas`, `Experiencias`.
- [ ] Run targeted tests, lint and build; expect PASS.
- [ ] Commit the Reception read experience.

### Task 2: Governed guest-message workflow

**Files:**
- Create: `src/features/reception/messages.ts`
- Create: `src/features/reception/messages.test.ts`
- Create: `src/features/reception/message-composer.tsx`
- Add controlled RPC/action only if existing canonical APIs are insufficient.

**Consumes:** `operations.guest_message_templates`, canonical hotel facts/knowledge and Kross dynamic context.

- [ ] Write failing tests for active master templates, superseded-template exclusion, unresolved access-code blocking and neutral review invitation behavior.
- [ ] Verify RED.
- [ ] Implement `prepareGuestMessage()` with source verification and unresolved-token errors.
- [ ] Build preview + warnings + explicit send/handoff; do not auto-send yet.
- [ ] Audit actor/template/source/timestamp for controlled preparation actions.
- [ ] Verify tests/lint/build PASS.

### Task 3: Reuse-first RICO operational adapter

**Files:**
- Create: `src/features/operations/types.ts`
- Create: `src/features/operations/server.ts`
- Create: `src/features/operations/server.test.ts`

**Decision rule:** inspect `operations.tasks` and `facilities.maintenance_events` first. Create a new normalized ticket table only if the existing model cannot represent required lifecycle/evidence without distortion.

- [ ] Write failing tests for role boundaries, room/area linkage, severity, owner, evidence and completion proof.
- [ ] Map existing canonical fields to a shared `OperationWorkItem` contract.
- [ ] Prove in tests which fields are reused and which extension, if any, is genuinely required.
- [ ] Implement create/assign/complete controlled actions only for TORO-owned state.
- [ ] Verify positive/negative RLS/action cases using isolated SQL CI if DDL is introduced.

### Task 4: RICO Maintenance — first operational write module

**Why first:** `facilities.maintenance_events` already contains real operational evidence, giving the shortest path to live value.

**Files:**
- Create: `src/app/toro/operacion/mantenimiento/page.tsx`
- Create: `src/features/operations/maintenance-board.tsx`
- Create: `src/features/operations/maintenance.test.tsx`

- [ ] Write failing tests for severity order, room/area linkage, photo/evidence requirement, estimate vs approved cost and proof-of-fix.
- [ ] Implement mobile exception-first board using the shared RICO adapter.
- [ ] Ensure completion writes only audited TORO/facilities state and does not alter Kross reservations.
- [ ] Run tests/lint/build; expect PASS.
- [ ] Validate with one active Maintenance user before enabling broad writes.

### Task 5: Housekeeping mobile workspace

**Files:**
- Create: `src/app/toro/operacion/aseo/page.tsx`
- Create: `src/features/operations/housekeeping-board.tsx`
- Create: `src/features/operations/housekeeping.test.tsx`

- [ ] Write failing tests for prioritized rooms, start/finish, damage escalation, QA note and stock alert.
- [ ] Implement card workflow; no raw grids on the primary path.
- [ ] Keep PMS reservation/room-assignment truth read-only.
- [ ] Audit TORO-owned status/evidence updates.
- [ ] Verify tests/lint/build PASS.

### Task 6: Laundry workspace

**Files:**
- Create: `src/app/toro/operacion/lavanderia/page.tsx`
- Create: `src/features/operations/laundry-board.tsx`
- Create: `src/features/operations/laundry.test.tsx`

- [ ] Write failing lifecycle tests for `received -> sorted -> washing -> drying -> qa -> stored` plus incident escape path.
- [ ] Reuse canonical inventory/operations models where sufficient; avoid creating duplicate stock ledgers.
- [ ] Implement mobile state transitions and evidence.
- [ ] Verify invalid lifecycle skips are blocked.
- [ ] Run tests/lint/build PASS.

### Task 7: Stage C real-user rollout

**Files:**
- Create: `tests/e2e/toro-phase-2.spec.ts`
- Create: `docs/runbooks/TORO_PHASE_2_ROLLOUT.md`

- [ ] E2E: Reception standard question/message prep.
- [ ] E2E: Maintenance create/assign/complete with proof.
- [ ] E2E: Housekeeping critical room flow.
- [ ] E2E: Laundry lifecycle.
- [ ] E2E: stale/unavailable Kross shows `stale/unavailable`, never fabricated truth.
- [ ] Validate Preview with one Reception user and representative Operations users.
- [ ] Record parity, adoption and residual Airtable dependencies in Supabase.
- [ ] Only after adoption parity classify replaced Airtable operational interfaces as backup/reference.

## Stage C Definition of Done

- Reception resolves common workflows without raw Airtable.
- Maintenance, Housekeeping and Laundry use focused mobile flows.
- Kross authority boundaries are explicit and tested.
- Private guest data is role-restricted.
- Critical writes are auditable.
- Real-user adoption evidence exists before legacy workflow retirement.
