# TORO OS — Identity + User Vault + TORO People Integration Plan

**Date:** 2026-09-22
**Status:** READY FOR IMPLEMENTATION PLANNING / NOT AUTHORIZED FOR PRODUCTION DDL
**Canonical repository:** `Dramcatcherst/Toro-OS`
**Canonical database:** Supabase `abtyrbqlqbsastmridzp`

## Goal

Unify identity, organization membership, personal/private context and DreamTeam HR capabilities under TORO without breaking existing authentication, RLS or HR workflows.

## Current verified baseline

- 1 organization.
- 5 app users.
- 13 non-deleted employee records: 12 active, 1 terminated.
- 4 employee records linked to user accounts.
- 9 employee records without `user_id`.
- 9 active user-role rows.
- 3 user/org combinations with multiple roles.
- 7 employee-private profiles.
- 0 employment-profile rows.
- 86 session rows.
- `identity` schema does not exist.
- `user_vault` schema does not exist.

## Non-negotiable rules

1. No production identity auto-link by name.
2. No personal User Vault data visible to organization ADMIN/RRHH/GERENCIA by default.
3. No new subsystem-specific identity table if TORO Identity can represent the relation.
4. No raw conversation dump as durable memory.
5. No User Vault ingestion before RLS tests pass.
6. No DreamTeam retirement before parity and rollback evidence.
7. No destructive migration in the first implementation wave.

---

## Phase 0 — Reconciliation and tests first

### Task 0.1 — Identity reconciliation report

Produce a server-side/read-only report with:
- each non-deleted employee;
- whether a user is linked;
- whether that user has organization roles;
- whether private profile exists;
- whether employment profile exists;
- whether employee status and user status are compatible;
- duplicate candidate flags based on deterministic identifiers only where available.

Output must not expose private identifiers in logs.

**Done when:** every employee has one classification:
- linked_valid;
- account_not_required;
- invite_required;
- link_review_required;
- terminated_no_access;
- data_conflict.

### Task 0.2 — Freeze compatibility assumptions

Document and test current role codes and alias behavior in `private.has_org_role`.

New code may use only:
- ADMIN
- RRHH
- GERENCIA
- JEFE_DEPARTAMENTO
- CONTABILIDAD
- AUDITOR
- EMPLEADO

Legacy aliases remain compatibility-only until removed safely.

### Task 0.3 — RLS test harness

Before schema creation, define tests for:
- own personal vault allow;
- other-user vault deny;
- org admin personal-vault deny;
- two-org isolation;
- membership suspended deny;
- shared scope explicit allow;
- work_org role allow/deny.

---

## Phase 1 — TORO Identity foundation

### Task 1.1 — Create schema `identity`

Create schema with no anonymous access.

### Task 1.2 — Create `identity.organization_memberships`

Fields:
- id uuid PK;
- org_id uuid not null;
- user_id uuid not null;
- membership_type text not null;
- status text not null;
- primary_employee_id uuid;
- joined_at timestamptz;
- offboarded_at timestamptz;
- created_at timestamptz;
- updated_at timestamptz.

Constraints:
- unique(org_id,user_id);
- valid membership_type;
- valid status;
- primary_employee_id must belong to same org/user when populated, enforced through controlled server function or validated workflow.

### Task 1.3 — Backfill memberships

Backfill from active/non-revoked `user_roles`.

Do not remove `user_roles`.

For user/org pairs with multiple roles, create exactly one membership row.

### Task 1.4 — Link employee relationship

Where an employee already has a verified `user_id`, set `primary_employee_id`.

For unlinked employees, create no guess. Queue reconciliation item.

### Task 1.5 — Membership authorization helper

Introduce helper:
`private.has_active_membership(target_org uuid)`

Existing role helper should require active membership after compatibility period.

---

## Phase 2 — Empty TORO User Vault foundation

### Task 2.1 — Create schema `user_vault`

No anon privileges.

### Task 2.2 — Create core tables

Initial v1 only:
- `user_vault.memory_items`
- `user_vault.preferences`
- `user_vault.learning_signals`
- `user_vault.consents`
- `user_vault.tool_connections`
- `user_vault.tool_permissions`
- `user_vault.notification_preferences`

Defer goals/context_events until a real product workflow requires them.

### Task 2.3 — RLS

Personal scope:
- user owns normal CRUD;
- organization roles have no access.

Work-private:
- user reads own;
- explicit server-side/org policies for exceptional workflows only.

Work-org:
- should reference canonical domain objects; avoid using memory table as substitute for business truth.

### Task 2.4 — No data yet

Create tables empty.

Do not import WhatsApp/email/calendar/history until:
- policies pass;
- context resolver exists;
- user-visible memory controls exist.

---

## Phase 3 — Context resolver

Implement a shared contract:

`resolveToroContext(actor, requestedContext?)`

Returns:
- user_id;
- active_mode: personal | organization;
- org_id nullable;
- membership status;
- roles;
- employee_id nullable;
- allowed tools;
- allowed memory scopes;
- approval ceiling;
- privacy restrictions.

Every TORO surface uses this contract:
- Portal;
- WhatsApp/OpenClaw;
- email;
- automations;
- agents.

No channel can invent its own context rules.

---

## Phase 4 — TORO People shell

### Task 4.1 — Reuse DreamTeam domain tables

Do not duplicate:
- employees;
- attendance;
- schedules;
- leave;
- payroll;
- loans;
- approvals/audit where canonical equivalents already exist.

### Task 4.2 — Mount role-specific TORO People navigation

Employee:
- Hoy;
- Mi trabajo;
- Horario;
- Solicitudes;
- Mensajes;
- Mi perfil.

Jefatura:
- Equipo;
- Cobertura;
- Aprobaciones;
- Incidencias.

RRHH/Admin:
- Personas;
- Asistencia;
- Horarios;
- Permisos;
- Planilla;
- Configuración;
- Auditoría.

### Task 4.3 — Remove duplicate AI concept

Do not complete a standalone "DreamTeam AI" product.

Employee asks TORO; TORO Agents routes internally.

---

## Phase 5 — TORO Comms linkage

Unify:
- team messages;
- notifications;
- employee handoffs;
- WhatsApp/OpenClaw group bindings;
- message-to-task/incidence conversion.

Communication does not become memory automatically.

A message may produce:
- transient context;
- task;
- incident;
- decision;
- handoff;
- candidate learning signal.

---

## Phase 6 — Pilot

### Pilot A — founder

Validate:
- personal/work context switch;
- two tool ownership types;
- personal memory privacy;
- organization decision/task access.

### Pilot B — non-owner employee

Validate:
- own work context;
- no access to other staff private data;
- no employer access to personal vault;
- schedule/request/TORO assistant continuity.

---

## Phase 7 — DreamTeam retirement gate

Standalone DreamTeam becomes read-only only when:
- TORO People parity exists for critical workflows;
- hosted security gate is resolved;
- role tests pass;
- employee pilot passes;
- data/export parity passes;
- rollback is documented.

Standalone runtime is retired only after a defined rollback window.

---

## Metrics

- % active employees linked to a verified TORO identity;
- % users with exactly one organization membership row per org;
- identity conflicts unresolved;
- cross-tenant/RLS test pass rate;
- personal-vault privacy violations: target 0;
- TORO People critical workflow parity;
- number of standalone DreamTeam-only workflows remaining;
- number of duplicate auth/message/approval implementations remaining.

## Immediate next actions

1. Build reconciliation query/report.
2. Draft SQL migration with tests, but do not execute.
3. Add context-resolver contract/types.
4. Inventory DreamTeam routes/components for reuse.
5. Define OpenClaw identity/channel binding against TORO Identity.
