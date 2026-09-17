# TORO Today + Decision Action Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the existing Phase 1 executive shell into a trustworthy TORO Today surface whose founder decisions immediately transition into auditable execution state, while preserving the current authorization model and avoiding a second TORO architecture.

**Architecture:** PR #15 remains the trunk for auth, shell, executive home and governed decisions. PR #13 is an implementation source for richer governed search and Room 360, but is not merged wholesale. Airtable remains the governed human-control layer; Supabase remains the authenticated runtime and audit layer. Kross/Alegra retain transactional authority in their domains.

**Tech Stack:** Next.js 16.3.5, React 19.2.4, TypeScript, Supabase Auth/Postgres/RPC/RLS, Vitest, Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-14-toro-os-role-based-interface-design.md`

## Global Constraints

- Do not merge or promote to production from this branch.
- `ADMIN != FOUNDER`; founder actions keep the existing explicit metadata + active ADMIN/GERENCIA membership gate.
- No service-role key in browser code.
- No new TORO app, Human Mode V2, or duplicate truth store.
- No live price, availability, reservation, payment, payroll, accounting or destructive data writes.
- Search must never create actionable links to routes that do not exist.
- All behavior changes follow RED → GREEN → refactor.
- Preserve fail-closed behavior for invalid sessions, malformed RPC payloads and stale/non-actionable decisions.

---

### Task 1: Make governed decision actions visibly close the loop

**Files:**
- Modify: `src/features/decisions/actions.test.ts`
- Modify: `src/features/decisions/actions.ts`
- Modify: `src/features/decisions/decision-list.tsx`
- Test: `src/features/decisions/actions.test.ts`

**Interfaces:**
- Consumes: `resolve_toro_decision(p_decision_id, p_action, p_note, p_delegate_to)`.
- Produces: `resolveDecision(input): Promise<ActionResult>` where `ActionResult` continues to expose `decisionId`, `action`, `status`, `auditedAt`.

- [ ] **Step 1: Write the failing test**

Add a Next cache mock and assert that a successful governed mutation invalidates both the decision queue and Executive Home:

```ts
const revalidatePath = vi.fn();

vi.mock("next/cache", () => ({ revalidatePath }));

it("revalidates the decision queue and executive home after a successful audited mutation", async () => {
  rpc.mockResolvedValue({
    data: {
      decision_id: decisionId,
      action: "approve",
      status: "approved",
      audited_at: "2026-09-17T18:30:00Z",
    },
    error: null,
  });

  await resolveDecision({ decisionId, action: "approve" });

  expect(revalidatePath).toHaveBeenCalledWith("/toro/decisiones");
  expect(revalidatePath).toHaveBeenCalledWith("/toro");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/features/decisions/actions.test.ts`
Expected: FAIL because successful mutations do not currently call `revalidatePath`.

- [ ] **Step 3: Implement minimal invalidation**

Import `revalidatePath` from `next/cache` and call it only after `parseActionResult(data)` succeeds. Do not revalidate on authorization errors, malformed RPC responses, or client-side validation failures.

- [ ] **Step 4: Run targeted and full verification**

Run:
- `npm test -- src/features/decisions/actions.test.ts`
- `npm test`
- `npm run lint`
- `npm run build`

Expected: all PASS.

- [ ] **Step 5: Improve post-action evidence copy without changing the RPC contract**

After success, show the audited timestamp returned by the server and a concise status message. Do not claim downstream execution occurred merely because the decision was recorded.

---

### Task 2: Prevent global search from navigating to nonexistent modules

**Files:**
- Modify: `src/features/search/search.test.ts`
- Modify: `src/features/search/server.ts`
- Modify: `src/app/toro/buscar/page.tsx`
- Potentially modify: `supabase/migrations/20260914084000_toro_global_search.sql` only if a new migration is preferable to an application guard.

**Interfaces:**
- Consumes: `search_toro` RPC results.
- Produces: safe `SearchResult[]` where every `href` is currently implemented or explicitly non-actionable.

- [ ] **Step 1: Add failing contract tests**

Assert that the search adapter cannot return clickable destinations for currently absent `/toro/proyectos`, `/toro/conocimiento`, or `/toro/hotel` routes.

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/features/search/search.test.ts`.
Expected: current RPC contract allows absent destinations.

- [ ] **Step 3: Implement the smallest honest-navigation guard**

Until each detail route exists, return the result as non-clickable context or route it to an implemented governed detail page. Do not invent placeholder module pages solely to satisfy navigation.

- [ ] **Step 4: Verify all tests/lint/build**

Run full Vitest, lint and build.

---

### Task 3: Port Room 360 as the first real governed detail route

**Files:**
- Port/adapt from PR #13: `src/lib/search/room-360.mjs`
- Port/adapt from PR #13: `src/lib/search/room-360-airtable.mjs`
- Port/adapt from PR #13: `src/lib/server/room-360.ts`
- Create: `src/app/toro/habitaciones/[key]/page.tsx`
- Create: `src/app/toro/habitaciones/[key]/loading.tsx`
- Port/adapt the corresponding Room 360 tests.

**Interfaces:**
- Consumes: governed Airtable fields only; Kross remains authority for price/availability/reservation/payment.
- Produces: `buildRoom360(input)` with `summary`, `sale`, `kross`, `media`, `operation`, `knowledge` sections.

- [ ] **Step 1: Port tests first and verify RED on the PR #15 trunk**
- [ ] **Step 2: Port pure Room 360 view model**
- [ ] **Step 3: Add server-only governed Airtable adapter with exact-field allowlists**
- [ ] **Step 4: Add the room detail route and loading state**
- [ ] **Step 5: Preserve the proven media identity rule: explicit `Room N` or `#N`; only 21↔22 and 25↔26 are approved shared pairs**
- [ ] **Step 6: Re-point room search results to the real Room 360 route**
- [ ] **Step 7: Run full tests/lint/build and preview QA**

---

### Task 4: Expand TORO Today using only trustworthy, connected signals

**Files:**
- Modify: `src/features/executive/types.ts`
- Modify: `src/features/executive/server.ts`
- Modify: `src/features/executive/executive-home.tsx`
- Modify: `src/features/executive/executive-home.test.tsx`

**Interfaces:**
- Keeps `decisions` as the highest-priority founder attention feed.
- Adds only sources with a defined freshness and authority contract.

- [ ] **Step 1: Add tests for founder attention limits and truth labels**
- [ ] **Step 2: Add concise source/freshness metadata for every non-decision signal**
- [ ] **Step 3: Populate delegated work only from an auditable runtime source; otherwise keep the section explicitly empty**
- [ ] **Step 4: Populate projects from the canonical executive portfolio only after authorization and source adapter tests exist**
- [ ] **Step 5: Never show unknown as zero or stale as current**
- [ ] **Step 6: Verify mobile-first rendering and full build**

---

### Task 5: Close hosted security and E2E gates before integration

**Files:**
- Existing: `tests/e2e/toro-phase-1.spec.ts`
- Existing: `.github/workflows/phase1-preview-e2e.yml`
- Existing runbooks under `docs/runbooks/`

- [ ] Confirm a dedicated synthetic restricted identity exists; never repurpose staff silently.
- [ ] Run actual authenticated Founder + restricted-role preview E2E with protected credentials.
- [ ] Verify hosted session persistence, revoked membership, global logout and cookie behavior.
- [ ] Use only disposable decision fixtures for mutation E2E and retain audit evidence.
- [ ] Perform mobile and desktop visual QA on the exact preview SHA.
- [ ] Keep draft/no-production if any hosted gate remains unknown.

---

## Self-review

- Spec coverage: shell, decisions, search, Room 360, source authority, security and mobile-first behavior are covered.
- No duplicate TORO architecture is introduced.
- No placeholders or production claims are used.
- Task ordering is dependency-safe: action loop first, honest search second, Room 360 third, broader Today signals fourth, hosted gate last.
- Every behavior change has an explicit test-first step.
