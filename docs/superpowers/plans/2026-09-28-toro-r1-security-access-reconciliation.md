# TORO R1-B Security & Access Reconciliation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconcile TORO/DreamTeam authorization policy with the live Supabase catalog, remove unintended client ACL drift, and prove sensitive People/HR actions fail closed before employee access or autonomy expands.

**Architecture:** Keep `Dramcatcherst/dream-team` as the migration owner for current People/HR database objects while TORO remains the product/architecture authority. First freeze a fresh live catalog, then make repository policy describe all live functions, then apply least-privilege ACL migrations in a disposable Supabase branch before any production change. No new identity, task, approval or permission universe is introduced.

**Tech Stack:** PostgreSQL 17 / Supabase, DreamTeam Next.js 16, TypeScript, Vitest, PGlite, GitHub PR workflow, Supabase advisors and development branches.

**Spec:** `Dramcatcherst/Toro-OS:docs/superpowers/specs/2026-09-28-toro-consolidation-r1-design.md`

## Global Constraints

- Visible product/brand remains **TORO**.
- Supabase project `abtyrbqlqbsastmridzp` is the inspected production runtime; do not mutate production until the disposable-branch gate passes and the exact SQL is explicitly approved.
- DreamTeam remains the current migration owner for People/HR schema changes until that ownership is deliberately migrated.
- Do not broaden grants to make a test pass.
- `SECURITY DEFINER` must not be added as a permission shortcut.
- Preserve `search_path = ''` for privileged functions unless an existing reviewed contract requires an explicit schema list.
- Do not contact or activate employees as part of R1-B.
- Do not claim a hosted role/path works from static SQL inspection alone.
- Every production permission change requires fresh advisor output, readback, rollback/recovery evidence, and an owner gate.

## Review Focus

1. **Anonymous caller reaches a mutating HR RPC:** expected result is no direct execute privilege unless the function is explicitly classified pre-auth and safe.
2. **Authenticated user crosses organization or department scope:** expected result is denial with zero cross-scope mutation.
3. **Revoked/inactive membership calls a high-risk RPC:** expected result is denial even if the Postgres role is `authenticated`.
4. **Legitimate server-side login/recovery flow after ACL tightening:** expected result is the server path continues through `service_role`; no browser client depends on direct pre-auth RPC execution.
5. **Later migration recreates/replaces a governed function:** expected result is tests fail unless the final ACL still matches `RPC_ACCESS_POLICY`.

---

### Task 1: Freeze the 2026-09-28 live authorization catalog and reconcile migration ownership

**Files:**
- Create in `Dramcatcherst/dream-team`: `docs/evidence/dreamteam-rpc-catalog-2026-09-28.json`
- Create in `Dramcatcherst/dream-team`: `docs/evidence/toro-r1-security-baseline-2026-09-28.md`
- Modify in `Dramcatcherst/dream-team`: `src/lib/security/rpc-access-policy.ts`
- Modify in `Dramcatcherst/dream-team`: `src/lib/security/rpc-access-policy.test.ts`

**Interfaces:**
- Consumes: live Supabase `pg_proc`, ACLs, RLS/grants; current `RPC_ACCESS_POLICY`; DreamTeam migration inventory.
- Produces: complete policy catalog for every live `public` and `private` function relevant to the app, plus a written classification of which repository owns each future DDL change.

- [ ] **Step 1: Capture the live function catalog read-only**

Run a Supabase read-only query that records for each `public/private` function:
`signature`, owner, `security_definer`, volatility, `proconfig`, and effective EXECUTE for `PUBLIC`, `anon`, `authenticated`, and `service_role`.

Expected: capture reflects the current live count observed in this audit (96 total functions across `public/private`) or explicitly records any newer delta.

- [ ] **Step 2: Write `docs/evidence/dreamteam-rpc-catalog-2026-09-28.json`**

Store only schema/function metadata and ACLs. Do not store secrets, tokens, employee identifiers, arguments values, or row data.

Expected: every live function signature is present exactly once.

- [ ] **Step 3: Extend `RPC_ACCESS_POLICY` to cover the 25 live signatures currently absent**

Add exact signatures for the observed additions, including maintenance, membership, recovery-delivery, TORO decision/search, employee channel enrollment, and related private helpers/triggers.

Use these policy classes:
- trigger-only/private implementation helpers -> `noDirectAccess`;
- authenticated user self/org operations -> `authenticated`;
- server-only enrollment/recovery delivery/owner-pilot operations -> `server`;
- agency/revenue reads remain non-public unless an existing verified consumer proves a direct authenticated requirement.

Expected: `RPC_ACCESS_POLICY` and the live catalog contain the same governed signature set.

- [ ] **Step 4: Update `rpc-access-policy.test.ts`**

Add assertions:
- exact signature-set parity with the new evidence file;
- no managed function grants `anon` or `public` unless explicitly listed in a dedicated `PREAUTH_RPC_ALLOWLIST`;
- `PREAUTH_RPC_ALLOWLIST` is empty for R1-B target policy because login/recovery rate limiting is server-mediated;
- trigger/private implementation functions have no direct client roles.

- [ ] **Step 5: Run policy tests**

Run:
`pnpm vitest run src/lib/security/rpc-access-policy.test.ts`

Expected: PASS only after the policy covers the current live catalog.

- [ ] **Step 6: Document migration ownership**

In `toro-r1-security-baseline-2026-09-28.md`, record:
- People/HR DDL changes in this plan land first in `Dramcatcherst/dream-team/supabase/migrations`;
- TORO repo stores architecture/evidence and cross-product contracts;
- no duplicate migration for the same People object is added to TORO.

- [ ] **Step 7: Commit**

Commit in the DreamTeam task branch:
`security: reconcile live RPC catalog with TORO policy`

---

### Task 2: Add a regression test for final ACL state after later migrations

**Files:**
- Create: `Dramcatcherst/dream-team/src/lib/security/final-rpc-access-policy.test.ts`
- Modify: `Dramcatcherst/dream-team/package.json` only if the file is not already included by `pnpm test:run` glob behavior.

**Interfaces:**
- Consumes: `RPC_ACCESS_POLICY`, `docs/evidence/dreamteam-rpc-catalog-2026-09-28.json`, ordered files in `supabase/migrations`.
- Produces: a test that fails when a later migration recreates a governed function and leaves broader EXECUTE than policy.

- [ ] **Step 1: Write the failing test**

Test name:
`rejects final migration ACL drift for governed functions`

Assertions:
- scan migrations in filename order;
- whenever a governed function is created/replaced after the current hardening migration, require an explicit final `REVOKE/GRANT` matching policy or require the later global reconciliation migration to cover it;
- fail on any governed function that ends with `anon`/PUBLIC execution contrary to policy.

- [ ] **Step 2: Run the focused test**

Run:
`pnpm vitest run src/lib/security/final-rpc-access-policy.test.ts`

Expected before implementation: FAIL against current migration history because later definitions can reintroduce default EXECUTE.

- [ ] **Step 3: Implement the migration-source scanner**

Keep it static and deterministic; no network, credentials, Supabase client, or hosted mutation.

- [ ] **Step 4: Run focused test**

Expected: PASS once the scanner recognizes the upcoming R1 reconciliation migration as the final ACL authority.

- [ ] **Step 5: Commit**

`test: guard final RPC ACL state across migrations`

---

### Task 3: Reconcile RPC EXECUTE grants to policy

**Files:**
- Create: `Dramcatcherst/dream-team/supabase/migrations/20260928230000_toro_r1_rpc_acl_reconciliation.sql`
- Create: `Dramcatcherst/dream-team/supabase/rollbacks/20260928230000_toro_r1_rpc_acl_reconciliation.sql`
- Create: `Dramcatcherst/dream-team/supabase/tests/20260928230000_toro_r1_rpc_acl_reconciliation.sql`
- Modify: `Dramcatcherst/dream-team/supabase/migration-checksums.json`
- Modify: `Dramcatcherst/dream-team/src/lib/security/rpc-access-migration.test.ts`

**Interfaces:**
- Consumes: complete `RPC_ACCESS_POLICY` from Task 1.
- Produces: one forward ACL reconciliation migration whose post-state matches policy for every governed function.

- [ ] **Step 1: Write SQL test before migration**

The SQL test must assert:
- no governed function has PUBLIC execute;
- no governed function has `anon` execute;
- each function's `authenticated` and `service_role` execute state exactly matches policy;
- server-only functions including `check_login_rate_limit`, `check_recovery_rate_limit`, `record_login_attempt`, `claim_sync_outbox`, channel-enrollment consumption and owner-pilot identity are `service_role` only;
- trigger/private implementation helpers have no direct client execute.

- [ ] **Step 2: Run migration integrity tests**

Run:
`pnpm verify:migrations`

Expected: FAIL because forward/rollback/test/checksum artifacts are not complete yet.

- [ ] **Step 3: Implement the forward migration**

For each exact governed signature:
1. preflight that the function exists with the expected identity arguments;
2. revoke EXECUTE from PUBLIC, `anon`, `authenticated`, `service_role`;
3. grant only the roles in `RPC_ACCESS_POLICY`.

Do not alter function bodies in this migration.

- [ ] **Step 4: Implement guarded rollback**

Rollback restores the captured **2026-09-28 pre-R1 ACL snapshot only after an explicit rollback guard**, and must refuse if the live catalog has drifted from the captured signature set. Document that rollback reopens known ACL debt and is emergency-only.

- [ ] **Step 5: Update checksum manifest**

Use the repository's canonical CRLF checksum convention from `check-migration-order.test.ts`.

- [ ] **Step 6: Extend `rpc-access-migration.test.ts`**

Add PGlite coverage for:
- anonymous denial on historical mutators such as `create_employee`, `prepare_payroll_draft_v2`, `update_payroll_line_review_v3`;
- server-only availability of pre-auth rate-limit functions;
- exact forward -> rollback ACL restoration;
- later-function replacement regression from Review Focus #5.

- [ ] **Step 7: Run**

`pnpm verify:rpc-grants`
`pnpm verify:migrations`
`pnpm vitest run src/lib/security/final-rpc-access-policy.test.ts`

Expected: all PASS.

- [ ] **Step 8: Commit**

`security: reconcile DreamTeam RPC execution ACLs`

---

### Task 4: Remove ineffective broad client grants from the ten TORO People tables with RLS/no policies

**Files:**
- Create: `Dramcatcherst/dream-team/supabase/migrations/20260928231000_toro_people_direct_table_acl_hardening.sql`
- Create: `Dramcatcherst/dream-team/supabase/rollbacks/20260928231000_toro_people_direct_table_acl_hardening.sql`
- Create: `Dramcatcherst/dream-team/supabase/tests/20260928231000_toro_people_direct_table_acl_hardening.sql`
- Create: `Dramcatcherst/dream-team/src/lib/security/toro-people-direct-table-access.test.ts`
- Modify: `Dramcatcherst/dream-team/supabase/migration-checksums.json`

**Interfaces:**
- Consumes: the ten live RLS/no-policy tables observed with broad client object grants.
- Produces: server-only direct table ACLs while preserving RLS and existing server-side access.

Target tables:
- `employee_action_receipts`
- `employee_ai_profiles`
- `employee_capability_grants`
- `employee_experience_events`
- `employee_experience_runs`
- `employee_feedback`
- `employee_onboarding_progress`
- `employee_reward_events`
- `employee_reward_redemptions`
- `position_capabilities`

- [ ] **Step 1: Write failing PGlite/static test**

Assertions:
- all ten tables have RLS enabled;
- no direct privileges for PUBLIC/`anon`/`authenticated`;
- `service_role` retains the reviewed server privileges;
- no SELECT/INSERT/UPDATE/DELETE client path is silently restored by later migration SQL.

- [ ] **Step 2: Implement forward migration**

For each exact table:
- preflight existence and RLS enabled;
- `revoke all privileges ... from public, anon, authenticated`;
- preserve/grant required `service_role` privileges.

Do not create client RLS policies in this task. Any future employee-direct access gets a separate scoped design.

- [ ] **Step 3: Implement guarded rollback**

The rollback must not silently re-enable broad client access. It may restore the captured ACL only when an explicit emergency guard is set and must include a warning comment that the restored state remains deny-by-RLS rather than an approved client contract.

- [ ] **Step 4: Add same-version SQL test and checksums**

- [ ] **Step 5: Run**

`pnpm verify:migrations`
`pnpm vitest run src/lib/security/toro-people-direct-table-access.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

`security: remove broad direct ACLs from TORO People tables`

---

### Task 5: Prove role, organization, revocation and self-service boundaries in a disposable database

**Files:**
- Modify: `Dramcatcherst/dream-team/src/lib/security/synthetic-rls.test.ts`
- Create: `Dramcatcherst/dream-team/docs/evidence/toro-r1-negative-authorization-matrix-2026-09-28.md`

**Interfaces:**
- Consumes: migrations from Tasks 3–4 plus existing synthetic auth fixtures.
- Produces: negative test coverage for high-risk authenticated functions and an evidence matrix.

- [ ] **Step 1: Add negative tests**

Cover at minimum:
- revoked role -> `void_payroll_period` denied;
- wrong organization -> `archive_employee_loan` denied;
- manager other department -> `upsert_shift_assignment_v2` denied;
- employee calling admin payroll mutation -> denied;
- anonymous caller -> no direct execute on all governed mutators;
- employee self-profile -> only own linked profile;
- reception attendance projection -> no payroll/private columns and wrong-org empty/denied.

- [ ] **Step 2: Run synthetic suites**

`pnpm verify:auth-matrix`
`pnpm verify:rpc-grants`

Expected: PASS.

- [ ] **Step 3: Run full DreamTeam check**

`pnpm check`

Expected: lint, typecheck, tests, and build PASS.

- [ ] **Step 4: Write evidence matrix**

For each test, record actor, scope, attempted capability, expected result, observed result, and whether it is synthetic or hosted.

- [ ] **Step 5: Commit**

`test: prove TORO People negative authorization boundaries`

---

### Task 6: Validate the exact migrations on a Supabase development branch

**Files:**
- Update: `Dramcatcherst/dream-team/docs/evidence/toro-r1-negative-authorization-matrix-2026-09-28.md`
- Update: `Dramcatcherst/dream-team/docs/evidence/toro-r1-security-baseline-2026-09-28.md`

**Interfaces:**
- Consumes: production migration baseline and the reviewed forward migrations.
- Produces: hosted disposable evidence without production mutation.

- [ ] **Step 1: Get Supabase branch cost and explicit cost confirmation**

Use Supabase `get_cost` then `confirm_cost` for a development branch. Do not create a branch before the cost confirmation succeeds.

- [ ] **Step 2: Create branch `toro-r1-security-20260928` from production**

Expected: fresh branch with production migrations and no production data copy.

- [ ] **Step 3: Apply the two R1 migrations to the branch**

Apply only reviewed migration SQL. Do not merge branch.

- [ ] **Step 4: Run same-version SQL verification and fresh advisors**

Expected:
- targeted RPC ACL drift eliminated;
- ten TORO People tables have no client grants;
- no new high/critical advisor finding caused by R1;
- service-role paths remain available.

- [ ] **Step 5: Run negative hosted probes with synthetic identities/data only**

No real employees, no real payroll changes, no real messages.

- [ ] **Step 6: Record evidence and delete the development branch after evidence is preserved**

Deletion occurs only after the branch results are recorded and no further review needs the branch.

- [ ] **Step 7: Commit evidence**

`docs: record disposable R1 security validation`

---

### Task 7: Production change gate and post-apply verification

**Files:**
- Create in TORO repo: `docs/security/TORO_R1_SECURITY_CLOSEOUT_20260928.md`
- Update in TORO repo after verified apply: `docs/product/TORO_BRAIN_GENERAL_PLAN.md`
- Update in DreamTeam repo: `docs/evidence/toro-r1-security-baseline-2026-09-28.md`

**Interfaces:**
- Consumes: reviewed PR, disposable-branch evidence, exact migration SHAs.
- Produces: production readback and a canonical closeout record.

- [ ] **Step 1: Present exact migration diff and branch evidence for owner approval**

This is a hard production gate.

- [ ] **Step 2: Apply approved migrations to production through the canonical migration path**

No direct ad-hoc SQL if it would bypass migration history.

- [ ] **Step 3: Fresh readback**

Verify exact ACLs, RLS state, migration history, advisor output and function signatures.

- [ ] **Step 4: Smoke legitimate server and authenticated flows**

At minimum login/recovery server path, employee self-profile, schedule read, and one synthetic admin/manager flow. No real payroll posting or employee activation.

- [ ] **Step 5: Write closeout**

Separate:
- VERIFIED;
- still UNVERIFIED;
- residual warnings with explicit disposition;
- rollback/recovery path.

- [ ] **Step 6: Commit documentation and merge only after all gates pass**

