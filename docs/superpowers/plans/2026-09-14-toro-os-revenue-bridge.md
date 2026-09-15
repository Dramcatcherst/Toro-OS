# TORO OS Revenue Bridge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the already-built private Revenue/Agencies capability into the post-Phase-1 TORO architecture, prove runtime parity and retire Airtable AGENCIAS as an operational dependency.

**Architecture:** Treat PR #12 as a source branch, not as a merge target. After Phase 1 lands, compare and selectively extract Revenue-specific code into a clean branch based on new `main`, reusing the shared TORO Auth/session/navigation patterns instead of maintaining a parallel login stack. Supabase `revenue.*` remains the private rate source; historical legacy Airtable rate snapshots remain non-authoritative.

**Tech Stack:** Post-Phase-1 TORO Next.js/Supabase stack; current Revenue source work is PR #12 `feat/revenue-admin-cutover-20260912`.

**Spec:** `docs/superpowers/specs/2026-09-14-toro-os-role-based-interface-design.md`

## Global Constraints

- Start only after Phase 1 PR #15 is merged or otherwise declared the new integration base.
- Do not merge PR #12 directly without a fresh compare against post-Phase-1 `main`.
- Supabase private Revenue data remains role-restricted.
- Browser/runtime uses only publishable Supabase credentials.
- No legacy Airtable villa/product prices are promoted into current `revenue.*` without a separately verified current source.
- AGENCIAS Airtable stays operational until live preview parity is evidenced.
- Do not duplicate the new TORO Auth/session system with a second login architecture.

---

### Task 1: Compare PR #12 against post-Phase-1 main

**Files from PR #12 to classify:**
- `.github/workflows/ci.yml`
- `docs/CONNECTORS_AND_ENV.md`
- `package.json`
- `scripts/revenue-env-guard.mjs`
- `src/app/api/auth/revenue/login/route.ts`
- `src/app/api/auth/revenue/logout/route.ts`
- `src/app/api/auth/revenue/me/route.ts`
- `src/app/api/revenue/agency-rates/route.ts`
- `src/app/modules/[id]/page.tsx`
- `src/app/revenue/RevenueAdminClient.tsx`
- `src/app/revenue/page.tsx`
- `src/lib/revenue-admin-core.d.ts`
- `src/lib/revenue-admin-core.mjs`
- `src/lib/server/supabase-revenue.ts`
- `tests/revenue-admin-core.test.mjs`
- `tests/revenue-env-guard.test.mjs`

**Interfaces:**
- Produces a keep/rewrite/drop matrix for each PR #12 changed file.

- [ ] **Step 1: Compare `main...feat/revenue-admin-cutover-20260912` after Phase 1 merge**
- [ ] **Step 2: Mark Revenue calculation/data adapters as KEEP if still canonical**
- [ ] **Step 3: Mark duplicate auth/login/session routes as REWRITE/DROP where Phase 1 shared Auth supersedes them**
- [ ] **Step 4: Mark env guards as KEEP only if they still protect against retiring Airtable runtime dependencies without conflicting with current TORO env conventions**
- [ ] **Step 5: Record the extraction matrix in the new Revenue Bridge PR description**

---

### Task 2: Create clean Revenue Bridge branch on post-Phase-1 main

**Files:**
- Create/modify only files selected by Task 1.
- Prefer shared `src/features/auth/*` and `src/lib/supabase/*` from Phase 1.

**Interfaces:**
- Produces `/toro/ingresos` or the agreed TORO Revenue route using shared session/role boundaries.

- [ ] **Step 1: Create a fresh branch from new `main`**

Suggested name:

```text
feat/toro-revenue-bridge
```

- [ ] **Step 2: Write failing tests for shared-role authorization**

Required behaviors:
- unauthorized/reception user denied private agency rates;
- authorized `FOUNDER`, `GERENCIA` and approved Revenue role can read;
- no service-role key is required in browser code.

- [ ] **Step 3: Run tests and confirm the new route/adapter is absent or fails the intended contract**
- [ ] **Step 4: Port the minimal Revenue adapter/calculation code from PR #12**
- [ ] **Step 5: Reuse TORO shared auth/session and role navigation**
- [ ] **Step 6: Run unit tests, lint and build**

```bash
npm test
npm run lint
npm run build
```

Expected: PASS.

---

### Task 3: Preserve Revenue parity contract

**Files:**
- Revenue server adapter/core tests.
- Existing Supabase `revenue.*` structures and RPCs; avoid duplicate tables.

**Interfaces:**
- Required parity: 20 rooms x 4 seasons = 80 canonical room-season rows.

- [ ] **Step 1: Re-run canonical data checks**

Required assertions:
- 80 unique room-season rows;
- USD currency;
- agency commission 15%;
- agency earning = rack x 15%;
- hotel net = rack x 85%;
- season rate derives from canonical Peak rack x multiplier;
- season windows reconcile to current operational season definitions.

- [ ] **Step 2: Verify no historical legacy rate row is being used as current fallback**
- [ ] **Step 3: Add/update tests if post-Phase-1 adapters changed data shape**

---

### Task 4: Runtime Preview authorization

**Files:**
- No source change unless runtime exposes a reproducible defect.

**Interfaces:**
- Consumes Vercel Preview and real Supabase Auth identities.

- [ ] **Step 1: Deploy Revenue Bridge Preview and require `READY`**
- [ ] **Step 2: Verify public Supabase config exists in Preview and no retiring Airtable base ID is required**
- [ ] **Step 3: Verify anonymous denial**
- [ ] **Step 4: Verify authenticated but unauthorized denial**
- [ ] **Step 5: Verify authorized Founder/Gerencia/Revenue access**
- [ ] **Step 6: Verify logout/refresh/session behavior uses the shared TORO session architecture**

---

### Task 5: Representative live AGENCIAS parity

**Files:**
- No database mutation required.

**Interfaces:**
- Compares the new Revenue UI against the currently active Airtable AGENCIAS interface.

- [ ] **Step 1: Select representative cases covering multiple rooms and seasons**
- [ ] **Step 2: Compare agency, room, date/season and rack rate**
- [ ] **Step 3: Compare commission, agency earning and hotel net**
- [ ] **Step 4: Compare conditions/overrides and any special rule surfaced by the old interface**
- [ ] **Step 5: Record exact parity evidence and any intentional differences**

Expected: no unexplained material mismatch.

---

### Task 6: Retire AGENCIAS dependency and close old PR #12

**Files:**
- Supabase dependency ledger/evidence.
- GitHub PR metadata.

**Interfaces:**
- Produces one active Revenue implementation and removes the old parallel workstream.

- [ ] **Step 1: Mark the Main/Airtable AGENCIAS dependency migrated/inactive only after Task 5 passes**
- [ ] **Step 2: Confirm no production runtime/env points at the old Airtable Revenue interface**
- [ ] **Step 3: Merge the clean Revenue Bridge PR after its own tests/security gates pass**
- [ ] **Step 4: Close PR #12 as superseded, linking the clean bridge PR**
- [ ] **Step 5: Keep historical Airtable rate snapshots archived/non-authoritative**

## Definition of Done

- Revenue uses the shared TORO Auth/session/navigation architecture.
- Canonical Revenue parity remains intact.
- Preview authorization and representative live parity pass.
- AGENCIAS is no longer operationally required.
- PR #12 is no longer an active parallel implementation branch.
- No legacy rate snapshot is silently promoted into current Revenue truth.