# TORO OS Phase 1 — Core Closure Plan v2

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` or `superpowers:subagent-driven-development`. Phase 1 implementation already exists; this plan is now a closure/verification plan, not a greenfield build plan.

**Goal:** Finish and safely cut over the authenticated TORO Core: Mauricio Executive Home, Decisions, governed Search and the shared mobile shell.

**Architecture:** Keep the implemented Next.js App Router shell and Supabase Auth/RLS/RPC boundaries. Founder mutation remains fail-closed: `ADMIN` never implies `FOUNDER`. The Phase 1 branch uses the shared TORO auth/session model that later stages must reuse.

**Tech Stack:** Next.js `16.3.5`, React `19.2.4`, TypeScript 5, Tailwind 4, Supabase Auth/Postgres/RLS/RPC, Vitest, Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-14-toro-os-role-based-interface-design.md`

## Global Constraints

- Supabase canonical; Airtable Command Center remains reference/read-only until real parity.
- Kross/Alegra authority boundaries remain unchanged.
- No service-role key in browser code.
- Mauricio home surfaces exceptions and decisions, not raw tables.
- Maximum five immediate decisions on the home screen.
- Sensitive decision writes must be audited and Founder-gated.
- Founder mutation requires explicit `app_metadata.toro_role=FOUNDER` **and** active ADMIN/GERENCIA organization membership.
- Common safe mobile actions <=3 taps.
- No production business record may be mutated merely for testing.

---

## Completed Implementation Snapshot

Implemented on branch `feat/toro-os-phase-1-executive-shell-20260914`:

- Supabase public/server client boundaries.
- Fail-closed TORO role resolution.
- Authenticated mobile/desktop application shell.
- Mauricio Executive Home with five primary sections.
- Governed decision read model and max-five immediate decision stack.
- Founder-only decision actions with durable audit evidence.
- Governed search across rooms, projects and non-private knowledge only.
- Loading, empty, stale, forbidden and error states.
- Logout.
- Playwright E2E harness.
- Rollout/rollback runbook.
- Isolated PostgreSQL SQL security fixture and assertions.
- Production migrations + post-DDL advisor review.
- Next.js upgraded to patched 16.3.5.

Current PR: **#15 DRAFT**. Keep it draft until the remaining gates pass.

---

### Task 1: Founder and restricted test identities

**Systems:** Supabase Auth + `public.user_roles`.

- [ ] Create or identify Mauricio's real Auth identity through an authorized Auth flow; do not repurpose another account silently.
- [ ] Set explicit TORO Founder metadata using an authorized Auth-management surface; never edit `auth.users` by ad-hoc SQL.
- [ ] Confirm active ADMIN or GERENCIA membership in the Dreamcatcher organization.
- [ ] Create or identify one restricted test identity with no Founder metadata and only the minimum test role.
- [ ] Verify `founder_auth_users = 1` for the intended identity and restricted test user remains non-Founder.

**Expected evidence:** user IDs recorded privately in the rollout evidence; no passwords or secret tokens stored in GitHub/Supabase knowledge.

### Task 2: Preview runtime configuration

**Systems:** Vercel Preview + Supabase publishable configuration.

- [ ] Verify the latest PR #15 deployment is `READY`.
- [ ] Verify Preview has `NEXT_PUBLIC_SUPABASE_URL`.
- [ ] Verify Preview has `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or compatible publishable alias.
- [ ] Never use a service-role key in Preview/browser.
- [ ] Confirm unauthenticated `/toro` redirects to login rather than exposing private data or returning a server error.

### Task 3: Real Preview E2E

**Files:**
- Existing: `tests/e2e/toro-phase-1.spec.ts`
- Existing: `playwright.config.ts`

- [ ] Supply Founder/restricted credentials only through secure CI/runtime environment variables.
- [ ] Run Founder mobile critical path: login -> Executive Home -> Decisions -> Search -> logout.
- [ ] Assert the five home sections render and no more than five immediate decisions appear.
- [ ] Use only a dedicated test decision fixture for mutation testing.
- [ ] Verify Founder action creates durable audit evidence.
- [ ] Verify restricted identity cannot execute Founder decision actions.
- [ ] Verify private knowledge/finance/guest-private content is not returned through global search.

Run:

```bash
npm test
npm run lint
npm run build
npm run test:e2e
```

Expected: unit/integration/lint/build PASS and real Preview E2E PASS without skipped critical scenarios.

### Task 4: Mauricio mobile parity

- [ ] Mauricio opens the protected Preview on a real phone.
- [ ] Validate navigation labels, tap targets, decision readability and progressive disclosure.
- [ ] Validate a common safe action can be reached in <=3 taps.
- [ ] Record any usability blocker as a targeted Phase 1 issue; do not expand into Phase 2 scope.
- [ ] Record explicit parity result: `passed`, `passed_with_followups`, or `failed`.

### Task 5: Final security/dependency check

- [ ] Run fresh `npm audit --omit=dev` and record remaining production findings.
- [ ] Do not use `npm audit fix --force` blindly.
- [ ] Run Supabase security advisor after any DDL change.
- [ ] Confirm no service-role or secret value is present in browser bundle/repo diff.
- [ ] Confirm the SQL authorization assertions remain green.

### Task 6: Merge and Command Center transition

- [ ] Keep PR #15 DRAFT until Tasks 1-5 pass.
- [ ] Re-run CI on final head.
- [ ] Merge PR #15 only after all six master quality gates pass: PRODUCT, DATA, SECURITY, INTEGRATIONS, RESILIENCE, ADOPTION.
- [ ] Mark legacy Command Center operational dependency replaced only after real Mauricio parity.
- [ ] Keep its Airtable data as backup/reference until automation/consumer/archive evidence allows stronger classification.

## Validation Strategy

Supabase Development Branching is unavailable on the current plan. For Phase 1 database changes, the accepted replacement is:

1. failing contract/security test;
2. isolated PostgreSQL CI fixture + positive/negative authorization assertions;
3. production schema preflight;
4. reviewed fail-closed migration + rollback path;
5. post-DDL assertions and Supabase advisor.

Do not repeatedly attempt Supabase branching unless plan capability changes.

## Phase 1 Definition of Done

- Mauricio signs in with a real Founder identity.
- Restricted identity is denied Founder-only actions.
- Real Preview E2E passes.
- Mauricio validates the mobile experience.
- Tests/lint/build/security checks pass on final head.
- PR #15 is merged.
- Legacy Command Center is no longer required for the tested decision workflow.
