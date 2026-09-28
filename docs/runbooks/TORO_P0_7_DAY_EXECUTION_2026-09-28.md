# TORO — P0 7-Day Execution Runbook — 2026-09-28

**Status:** PREPARED / NOT AN AUTHORIZATION TO MUTATE SENSITIVE SYSTEMS  
**Window:** 2026-09-28 through 2026-10-04  
**Canonical plan:** `docs/product/TORO_BRAIN_GENERAL_PLAN.md`  
**Canonical runtime state:** Supabase `operations.projects` + `operations.tasks`  
**Canonical execution plan:** `operations.knowledge_items/toro_p0_7_day_execution_2026_09_28_v1`

This runbook does not create a new project, master plan, backlog, database or subsystem.

## Objective

Reduce current executive risk by closing or sharply narrowing six existing lanes:

1. governance / release policy;
2. residual Supabase security;
3. finance truth and October accounting readiness;
4. Guest Ready physical blockers;
5. Kross read-only truth;
6. TORO People identity/access.

## Execution rules

- reuse existing canonical tasks;
- no duplicate workstreams;
- evidence before closure;
- material changes require rollback;
- external-evidence waits are not treated like executable P0 work;
- no payment, fiscal filing, permission expansion, production configuration mutation or destructive retirement from this runbook alone.

# Day 1 — 2026-09-28 — Governance + Release Truth

Existing task:
`toro_os_vercel_release_gate_separation_2026_08_23`

Observed fact:
- project: `prj_nxerFw9ciNews6tUMAah3GAlAJzs`
- name: `toro-pr11-preview`
- merge of PR #179 to `main` produced deployment `dpl_3P3rEx4vfHmfp5Gakcwj9qyFxHYi`
- deployment: READY
- target: production
- aliases observed: Vercel aliases
- queried runtime errors: 0

## Target release contract

**Preview by default. Production only by explicit promotion after checks.**

Official Vercel mechanisms reviewed:
- `git.deploymentEnabled=false` can disable automatic Git deployments;
- `git.deploymentEnabled` can use branch patterns;
- preview deployments can be created independently;
- verified preview deployments can be explicitly promoted to production.

## Prechecks before configuration mutation

1. Inventory project domains and aliases.
2. Confirm Git integration and current Production Branch.
3. Capture last known-good production deployment.
4. Confirm rollback candidate and route.
5. Identify workflows that depend on automatic `main` production deploy.
6. Verify the canonical intended project is actually this Vercel project.

## Candidate target design

Preferred:
- feature/docs branches -> Preview;
- `main` merge -> no implicit production promotion;
- production -> explicit promotion after READY + checks + authorized release gate.

Alternative:
- disable automatic Git deploys entirely and use explicit CLI/API promotion workflow.

Do not implement until the exact existing Git settings and domain ownership are confirmed.

## Verification after authorized change

- feature branch still produces expected preview;
- `main` merge does not become production automatically;
- explicit promotion works;
- production aliases move only during intentional promotion;
- runtime errors remain acceptable;
- rollback to last known-good deployment is proven.

## Rollback

Restore prior Git deployment policy and/or promote the recorded last known-good deployment. Do not combine this with domain migration.

# Day 2 — 2026-09-29 — Supabase Security Residual

Existing tasks:
- `supabase_enable_leaked_password_protection`
- `task-dc-timekeeping-validation-20260810`

Observed Advisor state:
- RLS enabled / no policy: 50
- anonymous SECURITY DEFINER executable: 3
- authenticated SECURITY DEFINER executable: 40
- leaked password protection: disabled

## Critical interpretation

The 3 anonymous RPCs have already been documented as pre-login rate-limit/login telemetry controls. They are not permission to ignore the lint, but they must not be revoked blindly.

Official Supabase remediation reviewed:
- revoke EXECUTE when an RPC should not be callable by the role;
- revoke from `PUBLIC` as well when applicable;
- switch to SECURITY INVOKER when privileged execution is unnecessary;
- retain SECURITY DEFINER only when it is an intentional bounded API endpoint;
- enable leaked-password protection from Auth settings.

## Precheck query contract

Before any DDL:
- function name;
- signature;
- schema;
- owner;
- `prosecdef`;
- grants to PUBLIC / anon / authenticated / service_role;
- referenced objects;
- runtime caller evidence.

Then classify each finding:
- INTENTIONAL_PUBLIC
- INTENTIONAL_AUTHENTICATED
- SERVICE_ONLY
- SHOULD_REVOKE
- SHOULD_USE_INVOKER
- UNKNOWN_NEEDS_CALLER_SCAN

## Regression gates

Must cover relevant current flows:
- login/rate limiting;
- recovery;
- employee identity;
- attendance;
- shifts;
- leave;
- payroll;
- approvals;
- TORO internal decisions.

## Verification

- rerun Supabase Security Advisor;
- negative calls fail for revoked roles;
- intentional endpoints still work;
- Auth/HR workflows pass;
- no new broad grants;
- rollback SQL retained.

# Day 3 — 2026-09-30 — Finance Truth / Month-End Inputs

Existing tasks:
- `finance_accounting_reset_2026_09_15`
- `finance_ws_cash_accounting_current`

Do not reopen historical reconstruction as a parallel P0.

Required distinction:
- current cash / September close;
- fiscal filing evidence;
- bank evidence;
- Kross operational production;
- processors/withholdings;
- CapEx / non-operating;
- historical audit.

Current Jan–Aug metrics remain analytical only because monthly status is not fully reconciled.

Completion for Day 3 is not "books closed." It is:
- every current-month required source named;
- every missing source has owner/status;
- no historical source volume is mistaken for current cash;
- no apparent profit is presented as distributable.

# Day 4 — 2026-10-01 — Alegra October Operating Start

Existing task:
`finance_accounting_reset_2026_09_15`

Use the already-prepared field mapping and SOP work.

Required controls:
- no duplicate invoice;
- no duplicate payment;
- no invented supplier document;
- no unapproved fiscal mapping;
- no re-import of historical Kross accounting data;
- preserve native IDs/currency/source lineage.

Goal:
a clean current-state operating workflow from October forward while legacy reconstruction remains separate.

# Day 5 — 2026-10-02 — Guest Ready / Physical P0

Existing tasks:
- `task-maint-villa-toro-water-systemic-20260918`
- `task-maint-room22-water-20260918`
- `maintenance_daily_p0_p1_round`

Single physical route:
`#21 -> #22 -> #24/#28`

No duplicate ticket set.

A room may be marked verified closed only with:
- functional test;
- dated evidence;
- responsible person;
- required QA;
- no unresolved material leak/water issue.

No Kross/availability changes from this runbook.

# Day 6 — 2026-10-03 — Kross Read-Only Truth

Existing task:
`kross_readonly_reservation_mirror_2026_09`

The task remains blocked until one of:
- official provider response;
- authorized transport/API;
- authorized verified existing read path.

No second mirror.

First real run acceptance:
- read-only;
- idempotent;
- source timestamp;
- freshness;
- source-is-live evidence;
- least PII;
- correct tenant/property scope;
- stale/future/conflict rejection;
- RLS/safe-view checks.

No PMS writes or price/availability mutations.

# Day 7 — 2026-10-04 — TORO People + Executive Re-triage

Existing tasks:
- `ops_ws_people_daily_management`
- `task-dc-timekeeping-validation-20260810`

Identity rules remain:
- no name-only linking;
- no mass provisioning;
- terminated users remain without access;
- personal/work scopes stay isolated;
- channel identity must be verified.

Then re-triage blocked-critical tasks into:
- EXECUTABLE_P0
- WAITING_EXTERNAL
- NEEDS_OWNER_DECISION
- P1
- HISTORICAL / AUDIT

No bulk priority edit without task-level dependency review.

# Sensitive-change gate

This runbook is preparation only for the following sensitive mutations:
- Vercel production/Git configuration;
- domains/aliases;
- Supabase Auth settings;
- RLS/grants/RPC security mode;
- credential rotation;
- payments/tax filings;
- Kross production writes;
- destructive Airtable retirement.

Those changes require their existing explicit gate and verification path.

# Done definition

A P0 is not done because a document exists.

Done requires:
- correct authority;
- current evidence;
- requested change or verified blocked state;
- tests/checks appropriate to risk;
- recovery/rollback for material changes;
- canonical task/knowledge updated;
- no duplicate project or shadow backlog.
