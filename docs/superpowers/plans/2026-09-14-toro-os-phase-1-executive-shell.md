# TORO OS Phase 1 Executive Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the authenticated role-aware TORO shell, Mauricio Executive Home, governed Decisions workflow and global search foundation.

**Architecture:** Keep the existing Next.js App Router application, introduce a focused `src/features` structure for new TORO modules, and access Supabase only from server code or authenticated browser clients with RLS. Phase 1 replaces the live decision experience, not the whole application.

**Tech Stack:** Next.js 16.2.7, React 19.2.4, TypeScript 5, Tailwind 4, Supabase Auth/Postgres/RLS/RPC, Vitest, Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-14-toro-os-role-based-interface-design.md`

## Global Constraints

- Supabase canonical; Airtable archive/reference only after parity.
- Kross/Alegra authority boundaries remain unchanged.
- No service-role key in browser code.
- Mauricio home must surface exceptions and decisions, not raw tables.
- Maximum five immediate decisions on the home screen.
- Sensitive writes must be auditable and permission-gated.
- Mobile-first; common safe actions <=3 taps.

---

### Task 1: Add test harness and Supabase application client boundaries

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/lib/supabase/env.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/browser.ts`
- Test: `src/lib/supabase/env.test.ts`

**Interfaces:**
- Produces: `getSupabasePublicConfig(): { url: string; publishableKey: string }`
- Produces: `createServerSupabaseClient()` for server-only authenticated calls.
- Produces: `createBrowserSupabaseClient()` using only the public/publishable key.

- [ ] **Step 1: Add test dependencies and script**

Update `package.json` scripts/dependencies so the relevant section is:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run"
  },
  "dependencies": {
    "@supabase/ssr": "^0.7.0",
    "@supabase/supabase-js": "^2.57.4"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.8.0",
    "@testing-library/react": "^16.3.0",
    "jsdom": "^26.1.0",
    "vitest": "^3.2.4"
  }
}
```

Keep all existing dependencies.

- [ ] **Step 2: Write failing env tests**

Create `src/lib/supabase/env.test.ts`:

```ts
import { afterEach, describe, expect, it } from "vitest";
import { getSupabasePublicConfig } from "./env";

const original = { ...process.env };

afterEach(() => {
  process.env = { ...original };
});

describe("getSupabasePublicConfig", () => {
  it("requires a URL and publishable key", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_PUBLISHABLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    expect(() => getSupabasePublicConfig()).toThrow(/Supabase public configuration/i);
  });

  it("accepts the server preferred publishable key", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
    expect(getSupabasePublicConfig()).toEqual({
      url: "https://example.supabase.co",
      publishableKey: "sb_publishable_test",
    });
  });
});
```

- [ ] **Step 3: Run test and verify failure**

Run: `npm test -- src/lib/supabase/env.test.ts`
Expected: FAIL because `./env` does not exist.

- [ ] **Step 4: Implement env boundary**

Create `src/lib/supabase/env.ts`:

```ts
export function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Supabase public configuration is incomplete.");
  }

  return { url, publishableKey } as const;
}
```

Create server/browser client files using `@supabase/ssr`; server client must read/write cookies through Next.js `cookies()` and browser client must use only `getSupabasePublicConfig()`.

- [ ] **Step 5: Run tests**

Run: `npm test -- src/lib/supabase/env.test.ts`
Expected: PASS.

- [ ] **Step 6: Run lint/build**

Run: `npm run lint && npm run build`
Expected: both PASS.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/test src/lib/supabase
git commit -m "test: add Supabase client boundaries and Vitest"
```

### Task 2: Implement role resolution and authenticated app shell

**Files:**
- Create: `src/features/auth/roles.ts`
- Create: `src/features/auth/session.ts`
- Create: `src/features/auth/role-nav.ts`
- Create: `src/features/auth/roles.test.ts`
- Create: `src/components/toro/app-shell.tsx`
- Create: `src/components/toro/mobile-nav.tsx`
- Create: `src/components/toro/desktop-nav.tsx`
- Create: `src/app/toro/layout.tsx`
- Create: `src/app/toro/page.tsx`

**Interfaces:**
- Produces `ToroRole = "FOUNDER" | "GERENCIA" | "RECEPCION" | "OPERACIONES" | "FINANZAS" | "GROWTH" | "SYSTEMS"`.
- Produces `resolveToroRole(profile): ToroRole | null`.
- Produces `getRoleNavigation(role): NavItem[]`.

- [ ] **Step 1: Write role tests**

Test founder sees `Inicio`, `Decisiones`, `Hotel`, `Huéspedes`, `Dinero`, `Proyectos`, `Equipo`, `Conocimiento`, `Sistemas`; Reception does not see Finance/Admin; Finance does not see guest-private operational screens unless separately granted.

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- src/features/auth/roles.test.ts`
Expected: FAIL because role modules do not exist.

- [ ] **Step 3: Implement exact role mapping**

Use a pure mapper with explicit accepted canonical role values and fail closed for unknown roles. Do not infer privileges from display names.

- [ ] **Step 4: Build shell**

`src/app/toro/layout.tsx` must call the server session resolver; unauthenticated requests redirect to the existing/authenticated login entry chosen by the app. Authorized users receive `AppShell` with role-specific navigation.

- [ ] **Step 5: Verify tests/build**

Run: `npm test -- src/features/auth/roles.test.ts && npm run lint && npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/auth src/components/toro src/app/toro
git commit -m "feat: add role-aware TORO application shell"
```

### Task 3: Add canonical decision read model and RLS/RPC contract

**Files:**
- Create: `supabase/migrations/20260914_toro_decision_read_model.sql`
- Create: `src/features/decisions/types.ts`
- Create: `src/features/decisions/server.ts`
- Create: `src/features/decisions/server.test.ts`

**Interfaces:**
- Produces `DecisionCard` with `id,title,domain,urgency,recommendation,rationale,evidence,owner,deadline,approvalLevel,status`.
- Produces `listMyDecisions({ limit }): Promise<DecisionCard[]>`.
- Produces RPC `operations.list_my_decisions(p_limit int default 5)` as `security invoker` or an equivalent RLS-respecting view/function.

- [ ] **Step 1: Write server contract tests**

Cover: max 5 default, stable priority ordering, no historical/archive items, source/evidence fields preserved, unauthorized caller returns no private data.

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- src/features/decisions/server.test.ts`
Expected: FAIL because decision server module/RPC contract is absent.

- [ ] **Step 3: Add migration**

Migration must create only the minimal read model/RPC needed from existing canonical operations data, grant execute/select only to `authenticated`, and rely on RLS/org scoping. Do not create a duplicate decisions database if an existing canonical table can back the view.

- [ ] **Step 4: Implement server adapter**

Map RPC results into `DecisionCard` and reject malformed payloads rather than showing partial privileged data.

- [ ] **Step 5: Apply migration on a Supabase development branch first**

Use Supabase branching, execute RLS positive/negative checks, then apply the reviewed migration to production.

- [ ] **Step 6: Verify**

Run: `npm test -- src/features/decisions/server.test.ts && npm run lint && npm run build`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations src/features/decisions
git commit -m "feat: add governed decision read model"
```

### Task 4: Build Mauricio Executive Home

**Files:**
- Create: `src/features/executive/types.ts`
- Create: `src/features/executive/server.ts`
- Create: `src/features/executive/executive-home.tsx`
- Create: `src/features/executive/executive-home.test.tsx`
- Modify: `src/app/toro/page.tsx`

**Interfaces:**
- Produces `ExecutiveHomeData` with `decisions`, `exceptions`, `delegatedActions`, `projects`, `systemHealth`.
- Consumes `listMyDecisions({ limit: 5 })`.

- [ ] **Step 1: Write rendering tests**

Assert exactly these top-level sections render in Spanish: `Necesita mi decisión`, `Qué está mal hoy`, `Qué avanza sin mí`, `Mis proyectos`, `Acciones rápidas`. Assert more than five decisions are collapsed/linked, not rendered inline.

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- src/features/executive/executive-home.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement server loader**

Compose canonical server adapters only. Each card must include source/freshness where applicable and never query Airtable directly.

- [ ] **Step 4: Implement mobile-first component**

Use semantic sections, large touch targets, concise Spanish copy, and progressive disclosure. Do not use raw table grids on home.

- [ ] **Step 5: Verify tests and build**

Run: `npm test -- src/features/executive/executive-home.test.tsx && npm run lint && npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/executive src/app/toro/page.tsx
git commit -m "feat: add Mauricio executive home"
```

### Task 5: Add governed decision actions and audit evidence

**Files:**
- Create: `supabase/migrations/20260914_toro_decision_actions.sql`
- Create: `src/features/decisions/actions.ts`
- Create: `src/features/decisions/actions.test.ts`
- Create: `src/app/toro/decisiones/page.tsx`
- Create: `src/features/decisions/decision-list.tsx`

**Interfaces:**
- Produces `resolveDecision(input: { decisionId: string; action: "approve"|"modify"|"delegate"|"postpone"|"reject"; note?: string; delegateTo?: string }): Promise<ActionResult>`.
- Every action produces durable actor/timestamp/action/evidence metadata and validates approval level.

- [ ] **Step 1: Write failing authorization/action tests**

Cover unauthorized role denial, founder approval, manager approval only where allowed, delegation requiring a target, reject requiring a note for high-risk items, and audit record creation.

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- src/features/decisions/actions.test.ts`
Expected: FAIL.

- [ ] **Step 3: Add controlled RPC/action migration**

Create a server-side decision action function with explicit role checks using existing org-role helpers. Do not grant execute to `anon`. Return a compact result only.

- [ ] **Step 4: Implement server action adapter and UI**

`/toro/decisiones` must expose `Aprobar · Modificar · Delegar · Posponer · Rechazar · Explícame mejor`; sensitive actions require a confirmation step.

- [ ] **Step 5: Verify Supabase negative tests**

As unauthenticated/unauthorized JWT: action denied. As authorized founder/manager per rule: action succeeds and audit evidence exists.

- [ ] **Step 6: Verify application**

Run: `npm test -- src/features/decisions/actions.test.ts && npm run lint && npm run build`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations src/features/decisions src/app/toro/decisiones
git commit -m "feat: add audited decision actions"
```

### Task 6: Add global governed search foundation

**Files:**
- Create: `supabase/migrations/20260914_toro_global_search.sql`
- Create: `src/features/search/types.ts`
- Create: `src/features/search/server.ts`
- Create: `src/features/search/search-dialog.tsx`
- Create: `src/features/search/search.test.ts`
- Modify: `src/components/toro/app-shell.tsx`

**Interfaces:**
- Produces `searchToro(query: string): Promise<SearchResult[]>`.
- `SearchResult` exposes entity type, title, subtitle, destination path, freshness and authorization-safe metadata only.

- [ ] **Step 1: Write search contract tests**

Assert empty query returns empty list; search results never expose raw private payload; role-restricted finance results are absent for Reception; common room/project/knowledge results route to governed entity pages.

- [ ] **Step 2: Verify failure**

Run: `npm test -- src/features/search/search.test.ts`
Expected: FAIL.

- [ ] **Step 3: Add RLS-respecting search RPC/view**

Search canonical entities only. Avoid indexing guest/financial secret fields into a broadly queryable text column.

- [ ] **Step 4: Implement search UI**

Add search trigger to shell; keyboard access on desktop and one-tap access on mobile.

- [ ] **Step 5: Verify**

Run: `npm test -- src/features/search/search.test.ts && npm run lint && npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations src/features/search src/components/toro/app-shell.tsx
git commit -m "feat: add governed global search"
```

### Task 7: Add explicit loading/error/stale states and Phase 1 E2E

**Files:**
- Create: `src/components/toro/data-state.tsx`
- Create: `src/components/toro/data-state.test.tsx`
- Create: `tests/e2e/toro-phase-1.spec.ts`
- Modify: `src/features/executive/executive-home.tsx`
- Modify: `src/features/decisions/decision-list.tsx`
- Modify: `src/features/search/search-dialog.tsx`

**Interfaces:**
- Produces shared `DataState` variants: `loading`, `empty`, `stale`, `forbidden`, `error`.

- [ ] **Step 1: Write state tests**

Assert each state has human-readable Spanish copy, no raw stack trace, and retry/escalation affordance where relevant.

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- src/components/toro/data-state.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement shared state component and integrate**

Do not silently substitute stale data for current data; stale state must display source/freshness.

- [ ] **Step 4: Add Playwright E2E**

Cover mobile viewport: authenticated founder home, max-five decisions, open decision, safe action within <=3 taps, search, logout; unauthorized role cannot access founder-only action.

- [ ] **Step 5: Run full Phase 1 verification**

```bash
npm test
npm run lint
npm run build
npx playwright test tests/e2e/toro-phase-1.spec.ts
```

Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/toro src/features tests/e2e
git commit -m "test: verify TORO phase 1 critical flows"
```

### Task 8: Phase 1 rollout gate and Airtable Command Center cutover evidence

**Files:**
- Create: `docs/runbooks/TORO_PHASE_1_ROLLOUT.md`
- Modify: `docs/CONNECTORS_AND_ENV.md`
- Supabase evidence: update `operations.knowledge_items` and `operations.tasks`; do not modify code for evidence.

**Interfaces:**
- Produces rollout checklist and rollback path.

- [ ] **Step 1: Document env names only**

Document `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`/compatible public alias and any server-only connector names; never values.

- [ ] **Step 2: Deploy Phase 1 read/limited-write preview**

Require build READY and authenticated access.

- [ ] **Step 3: Execute real-user parity**

Mauricio validates Executive Home and Decisions against the existing live business process. Record mismatches; do not retire Airtable interface until they are resolved.

- [ ] **Step 4: Record cutover evidence**

In Supabase, record deployed commit, deployment ID, tested roles, test timestamp, parity outcome and residual blockers.

- [ ] **Step 5: Change legacy Command Center classification only after parity**

Set the legacy interface dependency to replacement-ready/inactive only after no required workflow depends on it. Keep historical records archived.

- [ ] **Step 6: Final verification**

Run full CI/E2E again and verify no critical Phase 1 flow requires raw Airtable.

- [ ] **Step 7: Commit docs**

```bash
git add docs/runbooks/TORO_PHASE_1_ROLLOUT.md docs/CONNECTORS_AND_ENV.md
git commit -m "docs: add TORO phase 1 rollout and rollback runbook"
```

## Phase 1 Definition of Done

- Founder auth/role resolution works and fails closed.
- Mauricio Executive Home satisfies the five-block spec on mobile.
- Decisions are governed, auditable and role-gated.
- Global search returns only authorized governed entities.
- Loading/empty/stale/error states are explicit.
- CI, unit/integration tests and Playwright pass.
- Real preview deployment is validated.
- Airtable Command Center is no longer required for the validated decision workflow before it is classified for archival.
