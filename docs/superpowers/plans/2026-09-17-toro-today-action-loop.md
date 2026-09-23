# TORO Today + Room 360 Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate PR #15 as TORO's executive shell, close the governed decision feedback loop, make search honest, and selectively port safe governed detail surfaces without creating a parallel architecture.

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
- Search links must be both implemented and authorized for the current TORO role.
- TDD for behavior changes; preserve RED/GREEN evidence.
- Temporary branch-only CI workflows must be removed after evidence is captured.

---

### Task 1: Decision action freshness

- [x] Require `/toro/decisiones` and `/toro` revalidation only after validated audited RPC success.
- [x] Preserve fail-closed behavior for authorization, malformed payload and local validation errors.

### Task 2: Honest search destinations

- [x] Make unavailable destinations visible but non-clickable.
- [x] Preserve strict result projection and unsupported-entity rejection.
- [x] Gate dynamic Projects and Knowledge destinations by TORO management role.

### Task 3: Room 360 safe view model

- [x] Define projection-only Room 360 contract.
- [x] Keep Kross as external authority; omit price/availability/private payload.
- [x] Preserve exact structured links and verified shared-media rules.

### Task 4: Scoped Airtable read contract

- [x] Require projected-field allowlist, safe search-field subset, page-size clamp and formula-string escaping.
- [x] Keep connector strictly read-only and server-side.

### Task 5: Governed Room 360 loader

- [x] Distinguish invalid key, unconfigured connector, missing room, partial secondary-source failure and ready state.
- [x] Require exact `DC-ROOM-N` key before related reads.
- [x] Read only allowlisted fields.

### Task 6: Room 360 shell UI and route

- [x] Add `/toro/habitaciones/[key]` and loading state.
- [x] Keep partial/unconfigured/error states explicit rather than fabricating completeness.

### Task 7: Canonical room mapping evidence

- [x] Verify all 20 active Dreamcatcher room numbers match one-to-one to Airtable `DC-ROOM-N`.
- [x] Reject `source_record_id` as cross-system identity because it is stale.

### Task 8: Search → Room 360

- [x] Allow only canonical `/toro/habitaciones/DC-ROOM-N` room destinations.
- [x] Prepare and isolate-test `20260917190500_toro_room360_search_destination.sql` while preserving authorization guards.
- [x] Persist migration/assertion in permanent Phase 1 SQL workflow.
- [ ] Apply migration to canonical live Supabase only after explicit cutover authorization.

### Task 9: Hosted QA gate

- [x] Confirm Preview is READY and `live=false`.
- [x] Confirm Vercel SSO currently intercepts the protected preview before TORO auth.
- [ ] Complete Founder/restricted hosted auth, revocation, logout/session/cookie and visual QA.

### Task 10: TORO Today real operational signals

- [x] Connect up to 5 active blocked critical/high tasks from canonical `operations.tasks`.
- [x] Connect up to 6 active Blocked/In Progress projects from canonical `operations.projects`.
- [x] Use exact safe projections and preserve RLS.
- [x] Mark operational coverage degraded when latest signal is older than 48 hours.
- [x] Degrade honestly when one source fails while keeping the source that still works.
- [x] Do not fabricate arrivals/departures: canonical `reservations` and `stays` are currently empty.
- [ ] Keep attendance exceptions disconnected until a dedicated privacy/role contract exists.

### Task 11: Governed Projects module

- [x] Add protected read-only `/toro/proyectos` route.
- [x] Restrict application access to FOUNDER/GERENCIA in addition to existing Supabase RLS.
- [x] Read only active projects with exact safe fields and a 50-row bound.
- [x] Deep-link Search via `/toro/proyectos?project=<uuid>` only for management roles.
- [x] Connect TORO Today project cards and navigation to the real route.
- [x] Prioritize implemented modules in mobile navigation before `Próximamente` placeholders.
- [x] Expose no project write/edit controls.

### Task 12: Governed Knowledge metadata module

- [x] Add protected read-only `/toro/conocimiento` route.
- [x] Restrict application access to FOUNDER/GERENCIA in addition to existing Supabase RLS.
- [x] Read only `active=true` and `visibility != private` records.
- [x] Project metadata only: title, class, visibility, verification state, risk, human-verification flag, review dates, source system and freshness.
- [x] Explicitly exclude `content_es`, `content_en`, `structured_content` and private knowledge from the first version.
- [x] Bound read to 200 rows, covering the current 124 active non-private objects.
- [x] Deep-link Search via `/toro/conocimiento?item=<uuid>` only for management roles.
- [x] Expose the real module in FOUNDER/GERENCIA navigation.

## Verified evidence

- Room 360 application validation: GitHub Actions `35262687926` — 107/107 tests, ESLint, TypeScript and Next build PASS.
- Room 360 isolated SQL validation: `35262687895` — existing Phase 1 authorization/audit assertions and new destination assertion PASS.
- Latest full application validation: GitHub Actions `35277715054` at SHA `369bd607af37dbc3a0814bd7c4d5f882dd9f029d`.
- **127/127 tests PASS across 22 files**.
- ESLint PASS.
- TypeScript PASS inside Next build.
- Next.js 16.3.5 build PASS with dynamic routes `/toro`, `/toro/buscar`, `/toro/conocimiento`, `/toro/decisiones`, `/toro/habitaciones/[key]`, `/toro/proyectos`.
- Current branch after evidence differs by CI-workflow cleanup and this documentation only; behavior code is unchanged from the verified SHA.
- Current dependency audit remains 5 vulnerabilities (2 moderate, 3 high); no unsafe forced upgrade performed.
- Temporary Projects and Knowledge validation workflows were removed after evidence capture.
- No live migration, production promotion, real-user permission mutation, price/reservation/payment write, or destructive Airtable write was performed.

## Next highest-impact work

1. Select the next operational surface only from canonical data with explicit authority, freshness and privacy contracts.
2. Prefer a read-only Hotel or Systems surface if its backing data is trustworthy; do not create arrivals/occupancy views from empty reservation/stay tables.
3. Keep Finance, Payroll, attendance and guest-private domains behind separate stricter authorization/source contracts.
4. Verify Preview Airtable read-only runtime configuration without exposing secrets.
5. Complete hosted E2E/security gates before cutover or merge.
