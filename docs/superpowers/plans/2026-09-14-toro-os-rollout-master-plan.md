# TORO OS Rollout Master Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement each phase plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Deliver TORO OS as Dreamcatcher's single mobile-first role-based operational application while reducing Airtable to governed backup/reference use.

**Architecture:** Implement one shared authenticated Next.js shell over Supabase, then add role-focused modules in four independently testable phases. External transactional systems remain authoritative for their domains; TORO OS reads or writes through explicit server-side adapters/actions rather than duplicating ledgers.

**Tech Stack:** Next.js 16.2.7, React 19.2.4, TypeScript 5, Tailwind 4, Supabase Postgres/Auth/RLS/RPC, Playwright 1.60, Vitest + Testing Library to be added in Phase 1.

**Spec:** `docs/superpowers/specs/2026-09-14-toro-os-role-based-interface-design.md`

## Global Constraints

- Supabase is canonical for TORO-owned master and operational data.
- Kross remains authority for live reservations, room assignment, price, availability and payments.
- Alegra remains fiscal/accounting authority where applicable.
- Airtable is backup/reference after cutover, not a hidden runtime dependency.
- No service-role secret in browser code.
- Private data uses RLS and server-side actions/RPC.
- Frequent safe actions should be completable in three taps or fewer on mobile.
- Every sensitive write records actor, source, before/after or equivalent evidence, timestamp and rollback/recovery metadata where applicable.
- Historical tasks/decisions stay historical unless explicitly reactivated.
- Each phase must be deployable and verifiable independently.

---

## Phase Plans

### Phase 1 — Shared shell, Mauricio Executive Home, Decisions, Search

Plan: `docs/superpowers/plans/2026-09-14-toro-os-phase-1-executive-shell.md`

Outcome: authenticated role-aware application shell, Mauricio home, governed decision flow, global search foundation and the first real replacement for the legacy Airtable Command Center.

Exit gate:
- Mauricio can sign in, see only authorized executive data, resolve a decision with audit evidence, search canonical entities and use the app comfortably from mobile.
- Legacy Command Center remains read-only/archive and is not required for the tested flow.

### Phase 2 — Reception / TERE and Operations / RICO

Plan: `docs/superpowers/plans/2026-09-14-toro-os-phase-2-reception-operations.md`

Outcome: Reception Hub, guest knowledge/message workflows, room/issue handoffs, housekeeping, laundry and maintenance operational surfaces.

Exit gate:
- Standard reception and operational workflows no longer require raw Airtable access.
- Kross boundaries are visible and enforced.

### Phase 3 — Projects, Knowledge and FIONA Finance

Plan: `docs/superpowers/plans/2026-09-14-toro-os-phase-3-projects-knowledge-finance.md`

Outcome: governed project portfolio, searchable SOP/knowledge workspace and restricted finance/admin surface.

Exit gate:
- Project/knowledge work has one governed home.
- Finance private data is role-restricted and external fiscal truth remains in Alegra.

### Phase 4 — SKY Growth, SOBRESITO Systems and Admin depth

Plan: `docs/superpowers/plans/2026-09-14-toro-os-phase-4-growth-systems-admin.md`

Outcome: growth workspace, integration health, backup/security/deployment views, permissions/audit administration, final Airtable operational dependency removal.

Exit gate:
- No critical operational workflow depends solely on Airtable.
- Integration health, security, backups and remaining legacy disposition are visible and owned.

## Rollout Order

1. Implement and validate Phase 1 before starting Phase 2 writes.
2. Run Phase 2 in read-only or limited-write rollout first, then enable governed writes after parity tests.
3. Implement Phase 3 with stricter privacy gates for Finance.
4. Implement Phase 4 after shared role/audit patterns are proven.
5. After each phase, update `airtable_decommission_finalization_control_board_v1` and residual Airtable classifications.

## Global Verification at Every Phase Boundary

Run:

```bash
npm test
npm run lint
npm run build
npx playwright test
```

Expected: all commands exit 0.

Additionally verify in Supabase:
- RLS positive and negative cases for new private data;
- no service-role key exposed to browser bundles;
- audit evidence produced for sensitive writes;
- source/freshness metadata present for imported/external data.

## Airtable Consolidation Parallel Track

During every phase, continue reversible classification/migration of residual Airtable bases. Each base must become one of:

- `OPERATIONAL UNTIL REPLACED`
- `MIGRATE`
- `ARCHIVE TO VAULT`
- `SAFE TO RETIRE`

Preferred final estate: one `DREAMCATCHER VAULT — BACKUP` base, with additional bases only if a documented restore, ownership or permission constraint requires them.

Do not physically delete a base as part of these software phase plans. Deletion/retirement requires its separate backup, dependency and human-approval gates.
