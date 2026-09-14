# TORO OS Phase 4 Growth, Systems and Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Complete SKY Growth, SOBRESITO Systems and administrative governance surfaces, then remove remaining operational Airtable dependencies and reach the designed backup/reference state.

**Architecture:** Extend the proven shared shell and server-side adapters. Growth is a governed workspace over campaigns/content/reputation/products; Systems is an exception-driven health console; Admin manages roles, audit and rollout controls. Airtable retirement is driven by verified dependency replacement, not UI deletion alone.

**Tech Stack:** Existing TORO Next.js/Supabase stack, external read-only/approved connectors, Vitest/Playwright.

**Spec:** `docs/superpowers/specs/2026-09-14-toro-os-role-based-interface-design.md`

## Global Constraints

- Marketing cannot publish unverified provider/pricing/media-rights claims automatically.
- Systems surfaces secret names/status only, never secret values.
- Admin permissions fail closed and require explicit approval for high-risk changes.
- Airtable remains only governed backup/reference at end-state.
- Integration health shows freshness, owner, fallback and recovery owner.

---

### Task 1: SKY Growth workspace

**Files:**
- Create: `src/features/growth/types.ts`
- Create: `src/features/growth/server.ts`
- Create: `src/features/growth/server.test.ts`
- Create: `src/features/growth/growth-home.tsx`
- Create: `src/app/toro/growth/page.tsx`
- Create: `supabase/migrations/20260914_toro_growth_read_model.sql`

**Interfaces:**
- Produces campaigns, content backlog, SEO signals, media approvals, offers, experience/provider readiness and source/verification state.

- [ ] Write failing tests ensuring unverified price/provider/media-rights records are visibly blocked from publish-ready state.
- [ ] Run tests; expect FAIL.
- [ ] Add RLS-respecting growth read model using existing canonical content/provider/media data.
- [ ] Build Growth home focused on readiness/exceptions, not raw campaign tables.
- [ ] Run tests/lint/build; expect PASS.
- [ ] Commit: `feat: add SKY growth workspace`.

### Task 2: SOBRESITO integration/system health model

**Files:**
- Create: `src/features/systems/types.ts`
- Create: `src/features/systems/server.ts`
- Create: `src/features/systems/server.test.ts`
- Create: `src/features/systems/systems-home.tsx`
- Create: `src/app/toro/sistemas/page.tsx`
- Modify: `src/lib/server/connector-health.ts`

**Interfaces:**
- Produces `SystemHealthItem` with system, status, lastSuccessAt, freshness, owner, recoveryOwner, fallback, latestError, deployment/sync identifier.

- [ ] Write failing tests for stale/failed/healthy classification and secret redaction.
- [ ] Run tests; expect FAIL.
- [ ] Extend connector health adapters for Supabase, Vercel/deployments and governed external connectors without enabling unapproved external writes.
- [ ] Build systems dashboard showing only exceptions first plus drill-down evidence.
- [ ] Run tests/lint/build; expect PASS.
- [ ] Commit: `feat: add SOBRESITO systems health console`.

### Task 3: Backup, restore and Airtable residual estate dashboard

**Files:**
- Create: `src/features/systems/backups.ts`
- Create: `src/features/systems/backups.test.ts`
- Create: `src/features/systems/airtable-estate.tsx`
- Create: `supabase/migrations/20260914_toro_backup_health.sql`

**Interfaces:**
- Reads validated backup/restore evidence, Airtable residual classifications and blocker status.
- Never marks a backup valid from a metadata fingerprint alone.

- [ ] Write failing tests distinguishing `planned`, `artifact_created`, `restore_passed`, `approval_complete`; metadata hash alone must not produce `restore_passed`.
- [ ] Run tests; expect FAIL.
- [ ] Add read model over `integrations.decommission_backup_runs`, source/dependency registries and residual estate knowledge.
- [ ] Build Airtable estate view with `OPERATIONAL UNTIL REPLACED`, `MIGRATE`, `ARCHIVE TO VAULT`, `SAFE TO RETIRE` labels and evidence links.
- [ ] Run tests/lint/build; expect PASS.
- [ ] Commit: `feat: add backup and Airtable estate health`.

### Task 4: Admin role/permission management

**Files:**
- Create: `src/features/admin/types.ts`
- Create: `src/features/admin/server.ts`
- Create: `src/features/admin/server.test.ts`
- Create: `src/features/admin/admin-home.tsx`
- Create: `src/app/toro/admin/page.tsx`
- Create: `supabase/migrations/20260914_toro_admin_role_actions.sql`

**Interfaces:**
- Produces role assignments/permissions and controlled role-change actions for authorized administrators only.

- [ ] Write failing tests: non-admin denied, self-escalation denied, unknown role denied, privileged change requires confirmation/audit evidence.
- [ ] Run tests; expect FAIL.
- [ ] Add server-side role action RPC using existing org-role authorization helpers; no `anon` execute and no browser service-role.
- [ ] Build admin UI with before/after permission summary and confirmation.
- [ ] Run RLS/RPC positive-negative tests and app tests; expect PASS.
- [ ] Commit: `feat: add governed TORO admin permissions`.

### Task 5: Audit log and feature-flag rollout controls

**Files:**
- Create: `src/features/admin/audit.ts`
- Create: `src/features/admin/audit.test.ts`
- Create: `src/features/admin/audit-log.tsx`
- Create: `src/features/admin/feature-flags.ts`
- Create: `src/features/admin/feature-flags.test.ts`
- Create: `supabase/migrations/20260914_toro_feature_flags.sql`

**Interfaces:**
- Provides filtered audit history and role/module rollout flags.

- [ ] Write failing tests for sensitive-field redaction and role/module flag evaluation.
- [ ] Run tests; expect FAIL.
- [ ] Add least-privilege audit read model and feature flag table/RLS; audit entries remain append-only to ordinary roles.
- [ ] Build Admin audit/rollout UI.
- [ ] Run tests/lint/build; expect PASS.
- [ ] Commit: `feat: add audit and rollout controls`.

### Task 6: Product telemetry without sensitive payload leakage

**Files:**
- Create: `src/lib/telemetry.ts`
- Create: `src/lib/telemetry.test.ts`
- Modify: role-module actions to emit event names/IDs only where appropriate.

**Interfaces:**
- Events include decision_resolved, action_delegated, issue_resolved, search_success, stale_data_seen, module_opened; exclude guest message bodies, bank details and financial payloads.

- [ ] Write failing tests asserting forbidden keys such as `messageBody`, `bankAccount`, `card`, `secret`, `accessCode` are rejected/redacted.
- [ ] Run tests; expect FAIL.
- [ ] Implement minimal typed telemetry event boundary.
- [ ] Wire only approved event metadata into modules.
- [ ] Run tests/lint/build; expect PASS.
- [ ] Commit: `feat: add privacy-safe TORO telemetry`.

### Task 7: Final Airtable operational dependency closure

**Files:**
- Create: `docs/runbooks/TORO_AIRTABLE_BACKUP_ONLY_CUTOVER.md`
- Supabase evidence updates in source/dependency/backups/tasks/knowledge; no destructive code action.

- [ ] Re-audit only residual Airtable dependencies that remain `OPERATIONAL UNTIL REPLACED`.
- [ ] Require replacement parity for every critical workflow.
- [ ] Require valid backup/restore evidence for bases being archived/retired.
- [ ] Require explicit human approval for destructive retirement actions.
- [ ] Consolidate eligible archival data toward `DREAMCATCHER VAULT — BACKUP`; document any reason more than one backup base remains.
- [ ] Verify no production runtime/env points at retired operational bases.
- [ ] Record final residual Airtable estate and owners.
- [ ] Do not physically delete bases in this software task; deletion is a separately authorized administrative action.

### Task 8: Phase 4 and product-wide final verification

**Files:**
- Create: `tests/e2e/toro-phase-4.spec.ts`
- Create: `tests/e2e/toro-product-critical-paths.spec.ts`
- Create: `docs/runbooks/TORO_PRODUCTION_READINESS.md`

- [ ] Add E2E for SKY blocked-unverified publication, Systems stale/failed connector states, Admin denial/role change, backup evidence state and audit log.
- [ ] Add product-wide mobile tests for Mauricio decision, Reception message prep, RICO ticket resolution, FIONA restricted access and Systems health.
- [ ] Run `npm test && npm run lint && npm run build && npx playwright test`; expect PASS.
- [ ] Verify Supabase security advisor and Auth leaked-password protection status; document any accepted residual warning.
- [ ] Verify no service-role/secret value is present in browser bundles/logs.
- [ ] Validate adoption with representative users for each active role.
- [ ] Record production readiness evidence and rollback owner.
- [ ] Commit: `docs: add TORO production readiness runbook`.

## Phase 4 Definition of Done

- Growth and Systems modules expose governed action/readiness rather than raw data dumps.
- Admin role changes are controlled and auditable.
- Product telemetry avoids sensitive payloads.
- Backup/restore and residual Airtable estate are visible and owned.
- No critical operational workflow depends solely on Airtable.
- All unit/integration/E2E/security checks pass and production readiness is documented.
