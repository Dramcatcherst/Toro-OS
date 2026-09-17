# TORO Today + Room 360 Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate PR #15 as TORO's executive shell, close the governed decision feedback loop, make search honest, and selectively port the safe Room 360 foundation from PR #13 without creating a parallel architecture.

**Architecture:** PR #15 remains the secure shell/auth/decision base. Airtable remains the governed catalog/curation source for Room 360 details; canonical shared Supabase remains the relational runtime/search source. Kross remains transactional authority for price, availability, reservations, and payments. Cross-system room identity is `core.rooms.room_number` ↔ `DC-ROOM-${room_number}` for active Dreamcatcher rooms; stale Airtable provenance record IDs are not used as canonical identity.

**Tech Stack:** Next.js 16.3.5, React 19.2.4, TypeScript, Vitest, Supabase/PostgreSQL, Airtable read-only API, Vercel Preview.

**Spec:** `docs/superpowers/specs/2026-09-14-toro-os-role-based-interface-design.md`

## Global Constraints

- Keep PR #16 DRAFT and based on PR #15; do not merge to `main` or promote to production in this plan.
- No live price, availability, reservation, or payment ownership outside Kross.
- No raw/private Airtable payload propagation.
- No arbitrary Airtable formulas from route/user input.
- Keep active + non-revoked organization membership guards for search.
- No room mapping by stale `source_record_id`; use the verified room-number contract only.
- TDD for behavior changes; preserve RED/GREEN evidence.
- Temporary branch-only CI workflows must be removed after evidence is captured.

---

### Task 1: Decision action freshness

**Files:**
- Modify: `src/features/decisions/actions.test.ts`
- Modify: `src/features/decisions/actions.ts`

- [x] Write failing test requiring `/toro/decisiones` and `/toro` revalidation only after a validated audited RPC success.
- [x] Confirm RED.
- [x] Add minimal `revalidatePath` calls after strict result parsing.
- [x] Verify authorization/malformed/local-validation failures do not revalidate.

### Task 2: Honest search destinations

**Files:**
- Modify: `src/features/search/search.test.ts`
- Modify: `src/features/search/server.ts`
- Modify: `src/features/search/types.ts`
- Modify: `src/app/toro/buscar/page.tsx`

- [x] Prove legacy nonexistent destinations were presented as actionable.
- [x] Make unavailable results visible but non-clickable.
- [x] Preserve strict result projection and unsupported-entity rejection.

### Task 3: Room 360 safe view model

**Files:**
- Create: `src/lib/search/room-360.test.ts`
- Create: `src/lib/search/room-360.ts`
- Create: `src/lib/search/room-360-airtable.test.ts`
- Create: `src/lib/search/room-360-airtable.ts`

- [x] Define projection-only Room 360 contract.
- [x] Keep Kross as external authority; omit price/availability/private payload.
- [x] Use exact structured links for tasks/validations.
- [x] Preserve verified 21↔22 and 25↔26 shared media while rejecting incidental filename-number matches.

### Task 4: Scoped Airtable read contract

**Files:**
- Create: `src/lib/search/airtable-query.test.ts`
- Create: `src/lib/search/airtable-query.ts`
- Modify: `src/lib/server/read-only-connectors.ts`

- [x] RED: require projected-field allowlist, safe search-field subset, page-size clamp, formula-string escaping.
- [x] GREEN: build query only from declared safe fields.
- [x] Keep connector strictly read-only and server-side.

### Task 5: Governed Room 360 loader

**Files:**
- Create: `src/lib/server/room-360.test.ts`
- Create: `src/lib/server/room-360.ts`

- [x] RED: distinguish invalid key, unconfigured connector, missing room, partial secondary-source failure, and ready state.
- [x] Require exact `DC-ROOM-N` key before related reads.
- [x] Read only allowlisted fields.
- [x] Preserve room display on secondary-source failure and expose failed source names.

### Task 6: Room 360 shell UI and route

**Files:**
- Create: `src/features/rooms/room-360-view.test.tsx`
- Create: `src/features/rooms/room-360-view.tsx`
- Create: `src/app/toro/habitaciones/[key]/page.tsx`
- Create: `src/app/toro/habitaciones/[key]/loading.tsx`

- [x] RED/GREEN UI contracts for ready/partial/unconfigured/not-found.
- [x] Add shell-compatible protected route under `/toro`.
- [x] Show sale contexts, Kross authority, governed media, tasks, validations, and knowledge state.
- [x] Keep partial/unconfigured/error states explicit rather than fabricating completeness.

### Task 7: Canonical room mapping evidence

- [x] Read canonical Supabase `core.rooms` and current Airtable `rooms`.
- [x] Verify all 20 active Dreamcatcher room numbers match one-to-one to Airtable keys `DC-ROOM-N`.
- [x] Verify Airtable additionally contains Mini Room staging and retired Santa Toro, neither of which is promoted into active Supabase room search.
- [x] Reject `source_record_id` as cross-system identity because current Airtable record IDs differ from stored provenance IDs.

### Task 8: Search → Room 360

**Files:**
- Modify: `src/features/search/search.test.ts`
- Modify: `src/features/search/server.ts`
- Create: `tests/sql/room360_search_assertions.sql`
- Create: `supabase/migrations/20260917190500_toro_room360_search_destination.sql`
- Modify: `.github/workflows/phase1-sql-validation.yml`

- [x] Application RED: canonical Room 360 destination returned `href: null`.
- [x] SQL RED: fixture room returned legacy `/toro/hotel?room=<uuid>` destination.
- [x] GREEN: allow only `/toro/habitaciones/DC-ROOM-<1..3 digits>` as dynamic room destination.
- [x] GREEN: redefine `search_toro` room destination from `room_number` while preserving revoked-membership/private-knowledge guards.
- [x] Run existing Phase 1 SQL assertions plus Room 360 assertion on isolated PostgreSQL.
- [x] Persist the new migration/assertion in the permanent Phase 1 SQL workflow.
- [ ] Apply the new migration to the canonical live Supabase backend only after explicit cutover authorization.

### Task 9: Hosted QA gate

- [x] Confirm Vercel Preview deployment for current branch is READY and project is `live=false`.
- [x] Attempt protected Room 360 fetch without real application credentials.
- [ ] Complete hosted application-authenticated Founder Room 25 test; current request is intercepted by Vercel SSO before TORO auth.
- [ ] Complete restricted-role, revocation, logout/session, mobile, and desktop hosted QA inherited from PR #15.

## Verified evidence

- Application validation SHA: `e13fb502de99eecb4c6111e1fcac6fcf03aa9c37`.
- GitHub Actions app run: `35262687926` — 107/107 tests, ESLint, TypeScript, Next build PASS; `/toro/habitaciones/[key]` present in route build.
- GitHub Actions isolated SQL run: `35262687895` — migration application, existing Phase 1 authorization/audit assertions, and Room 360 destination assertion PASS.
- Current final branch differs from that verified application SHA only by removal of the two temporary validation workflows and persistence of the already-green Room 360 SQL steps into the existing Phase 1 SQL workflow.
- No live migration, production promotion, real-user permission mutation, price/reservation/payment write, or Airtable write was performed by the application changes.

## Next highest-impact work

1. Verify Preview runtime configuration for read-only Airtable without exposing secrets.
2. Complete a hosted Founder-authenticated Room 25 journey after resolving the Vercel SSO test gate.
3. Apply the Room 360 search migration to the canonical Supabase backend only in an explicitly authorized cutover.
4. Then connect the first real TORO Today signals from canonical Supabase sources with explicit authority/freshness contracts instead of adding more empty modules.
