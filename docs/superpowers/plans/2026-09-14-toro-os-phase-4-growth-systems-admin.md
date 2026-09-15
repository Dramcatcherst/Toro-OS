# TORO OS Stage E — Systems, Resilience, Admin and Growth Plan v2

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans`. Follow TDD and the Master Plan v2 gates.

**Goal:** Make TORO operationally trustworthy before expanding Growth: system health first, then backup/restore, Admin governance, SKY Growth and privacy-safe telemetry.

**Architecture:** Extend the shared shell and server-side adapters. SOBRESITO is an exception-driven health/recovery surface, not a raw log viewer. Backup/DR uses real artifacts and restore evidence. Admin governs roles/audit/rollout. SKY consumes verified canonical content/provider/media state and cannot publish unverified claims automatically.

**Tech Stack:** TORO Next.js/Supabase stack, approved external read/health connectors, Vitest/Testing Library/Playwright.

**Spec:** `docs/superpowers/specs/2026-09-14-toro-os-role-based-interface-design.md`

## Global Constraints

- Systems displays secret names/status only, never secret values.
- Admin permissions fail closed; self-escalation is forbidden.
- Backup metadata/fingerprints do not equal a validated backup.
- A backup is critical-ready only after an independent artifact and successful restore evidence.
- Airtable target is backup/reference only, not full physical deletion.
- Marketing cannot publish unverified provider, pricing or media-rights claims automatically.
- Product telemetry excludes guest message bodies, bank details, access codes and secret values.
- Existing integration/decommission/security models must be reused before creating new tables.

---

## E1 — SOBRESITO Systems Health

### Task 1: Integration and system health model

**Files:**
- Create: `src/features/systems/types.ts`
- Create: `src/features/systems/server.ts`
- Create: `src/features/systems/server.test.ts`
- Create: `src/features/systems/systems-home.tsx`
- Create: `src/app/toro/sistemas/page.tsx`
- Modify as needed: existing connector-health adapter.

**Produces:** `SystemHealthItem` with system, status, lastSuccessAt, freshness, owner, recoveryOwner, fallback, latestError and deployment/sync identifier.

- [ ] Write failing tests for healthy/stale/failed classification and secret redaction.
- [ ] Reuse Vercel/Supabase/integration evidence already available before adding new persistence.
- [ ] Build exceptions-first Systems Home with drill-down evidence.
- [ ] Verify tests/lint/build PASS.

---

## E2 — Backup, Restore and Disaster Recovery

### Task 2: Backup/restore health

**Files:**
- Create: `src/features/systems/backups.ts`
- Create: `src/features/systems/backups.test.ts`
- Create: `src/features/systems/airtable-estate.tsx`
- Add minimal read RPC/view only if existing decommission tables cannot be read safely.

- [ ] Write failing tests distinguishing `planned`, `artifact_created`, `restore_passed`, `approval_complete`.
- [ ] Assert a row-count/fingerprint hash alone never becomes `restore_passed`.
- [ ] Read `integrations.decommission_backup_runs`, source/dependency registries and Airtable audit evidence.
- [ ] Build residual estate view with `OPERATIONAL UNTIL REPLACED`, `MIGRATE`, `ARCHIVE TO VAULT`, `BACKUP/REFERENCE`, `SAFE TO RETIRE`.
- [ ] Surface backup owner, last artifact, last restore and recovery owner.
- [ ] Verify tests/lint/build PASS.

### Task 3: Airtable operational-independence closure

Execution order:

1. Command Center — unique remaining 0; close adoption/automation/consumer/archive evidence first.
2. DreamTeam Knowledge OS — preserve the remaining `Waste & Recycling` unique content.
3. Master Brain — remove runtime fallback risk and resolve 21 unique tables by domain.
4. Inventario & Activos — record-level map 25 tables to existing `assets`, `facilities`, `risk`, knowledge and supplier models before adding schemas.
5. Sistema Operativo Central — process 118 tables by domain; do not run a blind row-copy mega-migration.

- [ ] Prove daily users requiring Airtable = 0 for each transitioned workflow.
- [ ] Prove production runtime dependency = 0 before calling a base backup-only.
- [ ] Preserve unique truth with provenance.
- [ ] Require validated archive/restore before optional destructive retirement.
- [ ] Physical deletion remains a separately approved administrative action.

---

## E3 — Admin Governance

### Task 4: Role/permission management

**Files:**
- Create: `src/features/admin/types.ts`
- Create: `src/features/admin/server.ts`
- Create: `src/features/admin/server.test.ts`
- Create: `src/features/admin/admin-home.tsx`
- Create: `src/app/toro/admin/page.tsx`

- [ ] Write failing tests: non-admin denied, self-escalation denied, unknown role denied, privileged change requires confirmation/audit evidence.
- [ ] Use existing organization-role helpers and fail closed.
- [ ] Build before/after permission summary and confirmation UI.
- [ ] Verify positive/negative authorization and tests/lint/build PASS.

### Task 5: Audit + rollout controls

**Files:**
- Create: `src/features/admin/audit.ts`
- Create: `src/features/admin/audit.test.ts`
- Create: `src/features/admin/audit-log.tsx`
- Create: `src/features/admin/feature-flags.ts`
- Create: `src/features/admin/feature-flags.test.ts`

- [ ] Write failing tests for sensitive-field redaction and role/module rollout evaluation.
- [ ] Reuse `public.audit_logs` where sufficient; avoid a duplicate audit ledger.
- [ ] Add feature-flag persistence only if no existing governed rollout mechanism satisfies the contract.
- [ ] Verify audit remains append-only to ordinary roles.

---

## E4 — SKY Growth

### Task 6: Growth workspace

**Files:**
- Create: `src/features/growth/types.ts`
- Create: `src/features/growth/server.ts`
- Create: `src/features/growth/server.test.ts`
- Create: `src/features/growth/growth-home.tsx`
- Create: `src/app/toro/growth/page.tsx`

- [ ] Write failing tests that unverified price/provider/media-rights records are blocked from publish-ready state.
- [ ] Build over existing canonical content, web growth, experience/provider and media governance data.
- [ ] Focus on readiness/exceptions: campaigns, content backlog, SEO, media approvals, offers, experience/provider readiness.
- [ ] Do not create a second CMS/marketing database.
- [ ] Verify tests/lint/build PASS.

---

## E5 — Privacy-safe Product Telemetry

### Task 7: Typed telemetry boundary

**Files:**
- Create: `src/lib/telemetry.ts`
- Create: `src/lib/telemetry.test.ts`

Allowed event families include `decision_resolved`, `action_delegated`, `issue_resolved`, `search_success`, `stale_data_seen`, `module_opened`.

- [ ] Write failing tests rejecting/redacting keys such as `messageBody`, `bankAccount`, `card`, `secret`, `accessCode`.
- [ ] Implement minimal event-name/entity-id/role/module metadata only.
- [ ] Wire only events that improve adoption/reliability decisions.

---

## E6 — Product-wide Final Verification

**Files:**
- Create: `tests/e2e/toro-phase-4.spec.ts`
- Create: `tests/e2e/toro-product-critical-paths.spec.ts`
- Create: `docs/runbooks/TORO_PRODUCTION_READINESS.md`

- [ ] E2E Systems stale/failed state and recovery ownership.
- [ ] E2E Admin denial/controlled role change.
- [ ] E2E SKY blocked-unverified state.
- [ ] E2E backup evidence classifications.
- [ ] Product-wide mobile critical paths: Mauricio decision, TERE message prep, RICO work item resolution, FIONA restricted access, SOBRESITO health.
- [ ] Run tests/lint/build/Playwright.
- [ ] Run Supabase security advisor and record accepted residual warnings.
- [ ] Verify no service-role/secret value in browser bundles/logs.
- [ ] Validate adoption with representative active roles.
- [ ] Record production readiness and rollback/recovery owner.

## Stage E Definition of Done

- Systems/recovery state is visible and owned.
- Critical backup/restore evidence is complete.
- Admin role changes are controlled and auditable.
- Airtable has zero critical operational/runtime dependency.
- SKY works from verified canonical truth.
- Telemetry is privacy-safe.
- Product-wide critical paths and representative user adoption are evidenced.
