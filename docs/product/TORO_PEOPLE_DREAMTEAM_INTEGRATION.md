# TORO People — DreamTeam Integration Map

**Status:** CURRENT MIGRATION MAP  
**Date:** 2026-09-22  
**Legacy application:** `Dramcatcherst/dream-team`  
**Canonical destination:** `TORO People` inside TORO OS

## 1. Decision

DreamTeam is not deleted and not rebuilt from scratch.

Its proven HR domain model and security work become the foundation of **TORO People**. The standalone app remains a legacy implementation until feature parity, role tests and user validation are complete.

## 2. What DreamTeam already provides

Verified capabilities/documentation include:
- Supabase Auth per person;
- canonical roles;
- RLS;
- invitation-only access;
- session management and revocation;
- attendance import;
- raw punch preservation;
- attendance review/corrections;
- schedules;
- leave requests;
- payroll structures and review exports;
- loans/advances/liquidation models;
- approvals;
- notifications;
- audit;
- `sync_outbox`;
- employee portal foundations;
- controlled Airtable mirror.

These capabilities should be absorbed, not recreated.

## 3. Canonical destination by domain

| DreamTeam capability | TORO destination | Action |
| --- | --- | --- |
| Auth/login | TORO Identity | reuse canonical auth |
| users/roles | TORO Identity | reuse; remove duplicate UI logic over time |
| employees | TORO People | canonical HR entity |
| departments/positions | TORO People | reuse |
| private HR profile | TORO People restricted HR | preserve; do not merge with personal vault |
| employment profile | TORO People | complete/populate or retire after source review |
| attendance | TORO People | preserve |
| schedules | TORO People | preserve |
| leave | TORO People | preserve |
| payroll | TORO People + TORO Finance boundaries | HR payroll workflow; accounting authority remains external where applicable |
| loans/advances | TORO People/TORO Finance governed boundary | preserve with role restrictions |
| approvals | TORO Governance | converge on shared approval engine |
| audit | TORO Governance | converge on shared audit model |
| notifications | TORO Comms | converge |
| team messages | TORO Comms | converge |
| AI agents | TORO Agents | do not build a DreamTeam-only agent universe |
| Airtable mirror | TORO Data | transitional only |
| Slack alerts | TORO Comms/Tools | optional connector, not core |
| employee portal | TORO People role experience | integrate into TORO portal |

## 4. Current data gaps

Observed in canonical Supabase:
- 12 active employees and 1 terminated employee record;
- only 4 employee records are linked to a user account;
- 9 employee records have no `user_id`;
- 5 app users exist;
- 9 active user-role rows;
- 3 user/org combinations have multiple roles;
- 7 employee-private profiles exist;
- `employment_profiles` currently has zero rows.

Before broad TORO People rollout, classify each unlinked employee:
- account not needed;
- invitation pending;
- should be linked to an existing auth identity;
- duplicate/mismatch;
- former/inactive account.

Do not auto-link identities by name alone.

## 4.1 Employment profile source reconciliation

Airtable table `hr_employment_profiles` currently contains 12 profile rows:

- 10 status `ACTIVO`;
- 1 status `INACTIVO`;
- 1 status `POR_VALIDAR`;
- 11 have `employee_portal_enabled = true`;
- 11 have no `effective_to`, indicating a current/open-ended profile candidate;
- historical data status: 8 `PARCIAL`, 2 `PENDIENTE`, 1 `VERIFICADO`, 1 `NO_APLICA`.

This explains why useful employment-profile truth still exists outside the canonical Supabase table.

**Migration rule:** do not bulk-copy these 12 rows. Match each candidate through governed staff/clock identity mapping, verify effective dates/status, preserve source provenance, and queue ambiguous rows for review. Salary/rate fields remain restricted and must not be copied into general TORO Knowledge or User Vault.

## 5. Security debt retained from DreamTeam

DreamTeam documentation records a hosted RLS/RPC gate that remains NO-GO/NOT_APPLIED for parts of the security-hardening plan. Local synthetic tests are useful evidence but do not prove production actor behavior.

Therefore TORO People integration must:
- preserve fail-closed behavior;
- not weaken current RLS;
- not enable broad service-role reads for interactive requests;
- validate hosted identity/RLS in an approved disposable QA environment before claiming completion;
- keep privileged operations server-side;
- keep secrets out of client/logs.

## 6. Role model

Current canonical role codes:
- ADMIN
- RRHH
- GERENCIA
- JEFE_DEPARTAMENTO
- CONTABILIDAD
- AUDITOR
- EMPLEADO

The current `private.has_org_role` helper still contains compatibility aliases for:
- ADMINISTRADOR;
- RECURSOS_HUMANOS;
- JEFATURA;
- COLABORADOR.

Treat these as migration compatibility only. Do not introduce them into new TORO code.

## 7. UI migration

The user should stop perceiving a separate DreamTeam product.

Target TORO navigation by role:

### Employee
- TORO
- Hoy
- Mi trabajo
- Horario
- Solicitudes
- Mensajes
- Mi perfil

### Department lead
Adds:
- Equipo
- Cobertura
- Aprobaciones
- Incidencias

### RRHH/Admin
Adds:
- Personas
- Asistencia
- Horarios
- Permisos
- Planilla
- Configuración
- Auditoría

The TORO assistant remains present across all views. No separate "DreamTeam AI" section is needed.

## 8. Integration order

### Phase P0 — contracts
1. Freeze DreamTeam writes that would create a second identity/agent/message architecture.
2. Document existing DreamTeam routes and workflows.
3. Map each current table/RPC to TORO subsystem ownership.
4. Reconcile identities and memberships.

### Phase P1 — shell integration
5. Mount TORO People views inside TORO role navigation.
6. Reuse existing server-side authorization.
7. Route shared notifications/messages through TORO Comms.
8. Route approvals through TORO Governance where parity is proven.

### Phase P2 — HR parity
9. Attendance.
10. Schedule.
11. Leave.
12. Payroll review/export.
13. Employee portal/self-service.
14. Loans/advances/liquidations as validated.

### Phase P3 — retirement
15. Compare every critical DreamTeam workflow.
16. Run role/security/E2E tests.
17. User pilot.
18. Mark standalone DreamTeam read-only.
19. Preserve rollback window.
20. Retire standalone runtime only after evidence.

## 9. Definition of done

DreamTeam integration is complete only when:
- no staff member needs the standalone DreamTeam interface for a critical daily workflow;
- no HR truth exists only in the old app;
- TORO Identity is the only user identity model;
- TORO People owns HR experiences;
- TORO Comms owns common messaging/notifications;
- TORO Governance owns common approvals/audit contracts;
- RLS remains at least as restrictive as before;
- rollback is documented and tested;
- the old app can be turned off without losing data or function.


## 10. Future workforce horizon

**FUTURE — not a current implementation priority.**

TORO People should eventually support workforce identities beyond human employees while preserving a common role/training/evidence model.

Future worker types:
- human;
- AI agent;
- software agent;
- robotic/physical worker.

Future shared lifecycle:
`role definition -> SOP/knowledge -> training -> simulation -> evaluation -> permission certification -> supervised work -> evidence -> continuous improvement`

Ownership:
- TORO People: workforce identity, role, assignment and performance boundaries;
- TORO Knowledge: training material, SOPs and competencies;
- TORO Agents: AI/software worker configuration;
- TORO Governance: permissions, safety, certification and audit.

Training never grants authority automatically.

DreamTeam/TORO People work today should preserve this future possibility without building robot-specific complexity now.
