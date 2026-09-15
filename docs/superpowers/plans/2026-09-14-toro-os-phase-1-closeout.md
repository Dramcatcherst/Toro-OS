# TORO OS Phase 1 Closeout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the final runtime, identity, E2E, mobile-parity and merge gates for TORO OS Phase 1 without widening scope.

**Architecture:** Preserve the already-implemented Phase 1 branch and production Supabase migrations. Close the remaining gates through real Auth identities, Vercel Preview runtime validation, Playwright, mobile parity and final verification. Do not add new product modules during closeout.

**Tech Stack:** Next.js `16.3.5`, React `19.2.4`, TypeScript 5, Tailwind 4, Supabase Auth/Postgres/RLS/RPC, Vitest, Testing Library, Playwright, Vercel Preview.

**Spec:** `docs/superpowers/specs/2026-09-14-toro-os-role-based-interface-design.md`

## Global Constraints

- Branch: `feat/toro-os-phase-1-executive-shell-20260914`.
- PR: `#15`, remain DRAFT until all exit gates pass.
- Supabase project: `abtyrbqlqbsastmridzp`.
- `ADMIN != FOUNDER`.
- Founder decision mutation requires explicit `app_metadata.toro_role=FOUNDER` plus active `ADMIN` or `GERENCIA` membership in the decision organization.
- Search remains limited to rooms, projects and non-private knowledge.
- Never use a service-role key in browser or Vercel Preview runtime.
- Do not retire Airtable Command Center before real parity evidence.
- Do not start broad Phase 2 work until this closeout finishes, except independent documentation or reversible classification work.

---

### Task 1: Verify current branch/runtime baseline

**Files:**
- Read only: `package.json`
- Read only: `.github/workflows/phase1-task1-tdd.yml`
- Read only: `tests/e2e/toro-phase-1.spec.ts`
- Read only: `docs/runbooks/TORO_PHASE_1_ROLLOUT.md`

**Interfaces:**
- Consumes current PR #15 head and latest Vercel Preview deployment.
- Produces a verified baseline before identity/E2E work.

- [ ] **Step 1: Confirm the branch head and PR remain DRAFT/mergeable**

Expected: PR #15 is open, DRAFT and mergeable.

- [ ] **Step 2: Confirm a Vercel deployment from the current head is `READY`**

Expected: latest deployment for the branch is READY; if not, stop and investigate build/runtime first.

- [ ] **Step 3: Verify application CI**

Run in CI/worktree:

```bash
npm test
npm run lint
npm run build
```

Expected: all exit 0.

- [ ] **Step 4: Verify SQL contract harness**

Run the isolated PostgreSQL workflow or equivalent fixture for Phase 1 SQL assertions.

Expected: anonymous denial, restricted decision denial, `ADMIN` without Founder denial, Founder+org membership success, audit insertion and private-knowledge search exclusion all pass.

- [ ] **Step 5: Record baseline evidence**

Record branch head, CI run, SQL validation run and Vercel deployment in the Phase 1 control evidence in Supabase.

---

### Task 2: Establish real Founder and restricted Auth identities

**Files:**
- No source-code change required unless Auth flow reveals a real application defect.
- Read: `src/features/auth/session.ts`
- Read: `src/features/auth/roles.ts`

**Interfaces:**
- Produces one real Founder identity and one restricted test identity suitable for preview E2E.

- [ ] **Step 1: Inspect existing Auth identities without exposing credentials**

Expected: identify whether an appropriate Mauricio identity already exists. Never repurpose an unrelated account silently.

- [ ] **Step 2: Create or authorize Mauricio identity using a supported Supabase Auth flow**

Required metadata:

```text
app_metadata.toro_role = FOUNDER
```

Required organization authorization:

```text
active ADMIN or GERENCIA membership in the relevant organization
```

- [ ] **Step 3: Create or identify a restricted test identity**

The restricted identity must not contain `toro_role=FOUNDER` and must have only the minimum role needed for a negative-access test.

- [ ] **Step 4: Verify database-side authorization without changing a real decision**

Use a non-destructive read/authorization check. Do not execute a production decision mutation merely to prove identity setup.

- [ ] **Step 5: Store only identity labels/evidence, never passwords or session tokens, in program tracking**

---

### Task 3: Validate Vercel Preview Supabase runtime configuration

**Files:**
- Read: `src/lib/supabase/env.ts`
- Read: `src/lib/supabase/server.ts`
- Read: `src/lib/supabase/browser.ts`

**Interfaces:**
- Requires Preview environment variables by name only.

- [ ] **Step 1: Verify Preview configuration contains**

```text
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
```

or the supported publishable alias already accepted by `getSupabasePublicConfig()`.

- [ ] **Step 2: Confirm no service-role secret is configured for browser use**

- [ ] **Step 3: Redeploy current head if configuration changed**

Expected: deployment reaches `READY`.

- [ ] **Step 4: Check `/toro` unauthenticated behavior**

Expected: redirect to the intended login path; no 500/error caused by missing Supabase config.

- [ ] **Step 5: Check authenticated Founder shell**

Expected: Founder navigation and Executive Home render from the real Supabase project.

---

### Task 4: Run real Playwright critical paths

**Files:**
- Test: `tests/e2e/toro-phase-1.spec.ts`
- Config: `playwright.config.ts`

**Interfaces:**
- Credentials must be injected only through secure test environment variables.
- Mutating E2E may act only on an explicitly created disposable/test decision fixture.

- [ ] **Step 1: Run Founder read/navigation E2E**

```bash
npm run test:e2e -- tests/e2e/toro-phase-1.spec.ts
```

Expected: login, five Executive Home sections, <=5 visible immediate decisions, Decisions, Search and Logout pass.

- [ ] **Step 2: Run restricted-user denial E2E**

Expected: restricted identity cannot enter Founder-only decision execution paths.

- [ ] **Step 3: Create a disposable test decision only through an authorized development/test mechanism**

Do not repurpose a live business decision.

- [ ] **Step 4: Run Founder mutation path**

Expected: approved test action completes within the intended mobile flow and one durable audit record is produced.

- [ ] **Step 5: Clean up/deactivate the disposable fixture and retain audit evidence**

---

### Task 5: Mauricio mobile parity review

**Files:**
- No code change unless the review exposes a reproducible defect.

**Interfaces:**
- Produces explicit human parity evidence for the actual Founder user.

- [ ] **Step 1: Open the current READY preview on Mauricio's phone**
- [ ] **Step 2: Validate Inicio, Decisiones and Buscar**
- [ ] **Step 3: Confirm readable hierarchy, touch targets and <=3 taps for common safe actions**
- [ ] **Step 4: Confirm the dashboard surfaces decisions/exceptions rather than raw tables**
- [ ] **Step 5: Record pass/fail notes and any concrete defects; do not open unrelated redesign work**

---

### Task 6: Final security/dependency verification and merge gate

**Files:**
- `package.json`
- `package-lock.json`
- PR #15 changed files only if a final fix is necessary.

**Interfaces:**
- Produces the final Phase 1 merge decision.

- [ ] **Step 1: Run final verification**

```bash
npm test
npm run lint
npm run build
npm audit --omit=dev
```

Expected: tests/lint/build pass. Dependency audit must have no accepted critical production vulnerability; any remaining lower-severity item must be explicitly documented with remediation/acceptance rationale.

- [ ] **Step 2: Re-run Supabase security advisor after any DDL/security change**

Expected: no new Phase-1-specific public/anonymous privilege leak.

- [ ] **Step 3: Verify PR #15 diff contains no secret values**
- [ ] **Step 4: Mark Phase 1 evidence complete in Supabase**
- [ ] **Step 5: Only then remove DRAFT and merge PR #15**
- [ ] **Step 6: Keep Airtable Command Center as backup/reference until its automation/consumer and archival gates are separately complete**

## Definition of Done

- Real Founder Auth identity works.
- Restricted identity fails closed.
- Latest preview is READY with correct public Supabase configuration.
- Real Playwright Founder/restricted critical paths pass.
- Mauricio validates mobile parity.
- Tests, lint, build, SQL authorization and security review pass.
- PR #15 is merged only after evidence is recorded.
- Legacy Command Center is not prematurely deleted or made unavailable.