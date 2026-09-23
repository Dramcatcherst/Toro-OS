# TORO People — DreamTeam Code Migration Map v1

**Status:** CURRENT MIGRATION CONTRACT  
**Date:** 2026-09-23  
**Legacy repository:** `Dramcatcherst/dream-team`  
**Canonical destination:** `Dramcatcherst/Toro-OS` / TORO People and shared TORO subsystems  
**Master authority:** `docs/product/TORO_BRAIN_GENERAL_PLAN.md`

## 1. Decision

DreamTeam contains a mature HR/security implementation and must be **mined and absorbed**, not rebuilt and not kept as a permanent parallel TORO application.

The migration strategy is:

`preserve domain logic + preserve security intent + converge shared services + rebuild thin role UX inside TORO Portal + verify parity + retire legacy shell`

Do not copy DreamTeam's app shell/login/navigation wholesale into TORO.

## 2. Verified code estate

Current DreamTeam inspection found roughly 171 relevant source paths across:
- module UI;
- APIs;
- HR domain logic;
- authorization/security;
- reports;
- integrations.

Existing module slugs:
- empleados;
- asistencia;
- horarios;
- vacaciones;
- planilla;
- prestamos;
- liquidaciones;
- reportes;
- aprobaciones;
- auditoria;
- equipo;
- configuracion;
- mi-portal.

Existing specialized UI centers:
- EmployeeCenter;
- AttendanceCenter;
- AttendanceEditor;
- ScheduleCenter;
- LeaveCenter;
- PayrollCenter;
- LoanCenter;
- SettlementCenter;
- ReportCenter;
- TeamChat;
- ConfigurationCenter;
- PortalCenter;
- IncidentCenter.

Existing API families:
- access;
- admin/accounts;
- admin/attendance-policies;
- admin/departments;
- admin/health;
- admin/invitations;
- admin/roles;
- admin/sessions;
- attendance;
- auth;
- chat;
- documents;
- employees;
- health;
- integrations;
- leave-requests;
- loans;
- payroll;
- portal;
- reports;
- schedules;
- settlements;
- time-imports.

## 3. Test/maturity evidence

Approximate code/test footprint from current repository tree:

| Domain | Files | Tests | API routes | Components | Domain/lib |
| --- | ---: | ---: | ---: | ---: | ---: |
| Auth | 32 | 11 | 5 | 0 | 23 |
| Security | 17 | 7 | 0 | 0 | 11 |
| Reports | 19 | 9 | 1 | 1 | 13 |
| Payroll | 19 | 4 | 4 | 1 | 8 |
| Attendance | 17 | 3 | 4 | 3 | 5 |
| Schedule | 21 | 3 | 3 | 1 | 7 |
| Chat | 8 | 1 | 4 | 1 | 2 |
| Leave | 7 | 0 | 2 | 1 | 1 |
| Employee | 6 | 0 | 2 | 1 | 1 |
| Loan | 4 | 0 | 1 | 1 | 1 |
| Settlement | 3 | 0 | 1 | 1 | 1 |
| Portal | 4 | 0 | 1 | 1 | 1 |
| Configuration | 2 | 0 | 0 | 1 | 1 |

Interpretation:
- Auth/security/reporting have the strongest direct test evidence.
- Payroll/attendance/schedule have meaningful test coverage.
- Leave/employee/loan/settlement/portal/configuration require additional parity tests before cutover.
- File/test counts are evidence of implementation density, not proof of correctness.

## 4. Module ownership map

| DreamTeam module | Canonical TORO owner | Disposition |
| --- | --- | --- |
| empleados | TORO People | Reuse domain queries/actions; port UI into TORO People |
| asistencia | TORO People | Reuse attendance/time-clock/incidents; role-specific projections |
| horarios | TORO People | Reuse scheduling engine and role visibility |
| vacaciones | TORO People | Reuse leave workflow; add missing tests |
| planilla | TORO People + TORO Finance | HR payroll preparation in People; fiscal/accounting authority stays external |
| prestamos | TORO People + TORO Finance | Restricted employee-finance workflow; add tests before write cutover |
| liquidaciones | TORO People + TORO Governance/Finance | High-risk scenario workflow; keep human/legal gates |
| reportes | Shared Reporting + TORO People | Reuse report contracts; no separate Reporting subsystem |
| aprobaciones | TORO Governance | Converge on shared approval engine |
| auditoria | TORO Governance | Converge on shared audit/evidence |
| equipo | TORO Comms | Converge team chat/messages/attachments/notifications |
| configuracion | split: Identity + People + Governance + Tools/Systems | Do not preserve as one monolithic People screen |
| mi-portal | TORO People employee self-service | Port into TORO Portal role experience |

## 5. API ownership map

### TORO Identity
Move/converge:
- `api/auth/*`
- `api/admin/accounts`
- `api/admin/invitations`
- `api/admin/roles`
- `api/admin/sessions/*`
- access/session/MFA enforcement

Preserve concepts:
- per-user Supabase Auth;
- invitation-only access;
- forced password-change behavior where still needed;
- session enforcement/revocation;
- access-event logging;
- fail-closed role checks;
- MFA policy hooks.

Change:
- current DreamTeam authorization selects the first permitted organization/role;
- future TORO must resolve organization context explicitly through `resolveToroContext()`;
- account creation must create/verify membership state before granting organization capability;
- no subsystem-specific auth shell remains after cutover.

### TORO People
Move/converge:
- `api/employees/*`
- `api/attendance/*`
- `api/schedules/*`
- `api/leave-requests/*`
- `api/time-imports/*`
- People-side payroll preparation
- People-side loans/settlements where authorized
- employee portal profile.

### TORO Comms
Move/converge:
- `api/chat/*`
- attachments/read states;
- chat notifications.

Current `team_messages` becomes shared communication foundation, not DreamTeam-only state.

### TORO Governance
Move/converge:
- approvals;
- audit events;
- high-risk action gates;
- role/permission-change evidence.

### TORO Systems / Tools
Move/converge:
- health endpoints;
- integration health;
- Airtable sync/outbox;
- Slack notification integration;
- configuration health.

## 6. Security behavior to preserve

DreamTeam currently contains important security patterns:

- authenticated user session on interactive requests;
- no public signup;
- session enforcement/revocation;
- access-event telemetry;
- organization-scoped role lookup;
- self-service/role-specific RLS;
- service role reserved for explicit admin/jobs;
- no service-role key in browser;
- fail-closed role lookup;
- sensitive account/role actions separated from normal data client;
- optional MFA assurance hooks;
- password reset revokes sessions;
- self-role escalation blocked.

These are **assets to preserve**, not reasons to retain the legacy app.

## 7. Security behavior to improve during TORO migration

### Multi-organization context
DreamTeam `authorizeRoles()` finds a permitted role across assignments and then uses that organization.

TORO Brain requires:
- active organization selected/resolved first;
- role authorization evaluated **inside that organization**;
- roles from Organization A never elevate Organization B.

### Membership
Current account/invitation flows create Auth + app_user + role and optionally link employee.

Target:
`Auth identity -> organization membership -> roles -> employee relation (when applicable)`

Membership is separate from role and employment.

### Personal/work separation
DreamTeam only models work context.

TORO:
- work identity remains organization-governed;
- personal User Vault remains inaccessible to employer roles;
- employee HR-private profile is not TORO Personal.

## 8. UI migration strategy

Do not embed the old DreamTeam shell permanently.

### Retire eventually
- DreamTeam AppShell;
- DreamTeam module router as product navigation;
- DreamTeam login/recovery entry as a separate product;
- duplicate module navigation;
- separate TeamChat shell once TORO Comms is live.

### Reuse/port
- center components' business interactions and proven interaction patterns;
- domain validation logic;
- server/domain adapters;
- safe export/report contracts;
- attendance editor concepts;
- schedule planning interactions;
- self-service profile flow;
- payroll review workflow.

### Target TORO People navigation

Employee:
- Hoy
- Mi trabajo
- Horario
- Solicitudes
- Mi perfil
- Reconocimiento

Department lead:
- Equipo
- Cobertura
- Asistencia
- Horarios
- Solicitudes
- Incidencias

RRHH/Admin:
- Personas
- Asistencia
- Horarios
- Permisos
- Planilla
- Préstamos/adelantos
- Liquidaciones
- Configuración laboral

Shared:
- Mensajes -> TORO Comms
- Aprobaciones -> TORO Governance
- Auditoría -> TORO Governance
- Herramientas/integraciones -> TORO Tools/Systems

## 9. Recommended cutover waves

### Wave 0 — Identity/context contract
Dependency: PR #42 / organization membership design.

- resolve active TORO context;
- no cross-org role elevation;
- employee-user reconciliation;
- onboarding/invitation contract;
- shared session model.

No People UI cutover before this contract is stable.

### Wave 1 — Employee self-service, read-first
Lowest operational risk; proves Portal integration.

- Mi perfil;
- own schedule;
- own requests/leave;
- own permitted attendance summary;
- employee knowledge links.

Required:
- new TORO route;
- role/RLS tests;
- mobile parity;
- DreamTeam data source reused directly.

### Wave 2 — People directory + onboarding
- employee directory;
- department/position context;
- access status;
- invite candidate workflow;
- membership/role setup.

No auto-linking by name.

### Wave 3 — Attendance + incidents + time imports
High operational value, mature code.

- import/analyze/commit;
- identity mapping;
- attendance days;
- incident review;
- official-for-pay corrections;
- reception-safe limited view.

Preserve original punches and audit trail.

### Wave 4 — Scheduling management
- templates;
- assignments;
- coverage;
- changes/swaps;
- role-based forecast.

### Wave 5 — TORO Comms convergence
- team channels;
- DMs;
- attachments;
- read states;
- notifications;
- message-to-task/incident/handoff.

After parity, old `TeamChat` becomes obsolete.

### Wave 6 — Governance split
- approvals -> TORO Governance;
- audit -> TORO Governance;
- accounts/roles/sessions -> TORO Identity;
- integration/system config -> TORO Tools/Systems.

### Wave 7 — Payroll
Only after identity/People stability.

- payroll period review;
- lines;
- adjustments;
- holidays;
- controlled exports;
- employee receipt/self-service.

Keep fiscal/accounting truth outside People where applicable.

### Wave 8 — Loans + settlements
Highest HR/financial/legal sensitivity among remaining People flows.

- add explicit positive/negative tests;
- retain legal hold;
- approval/evidence;
- no autonomous final settlement.

## 10. Retirement gates

Standalone DreamTeam is not read-only until:
- critical employee self-service parity;
- attendance parity;
- schedule parity;
- leave parity;
- role/security parity;
- chat path moved to TORO Comms;
- shared approvals/audit path established;
- rollback documented.

Standalone runtime is not retired until:
- payroll/admin parity where required;
- no active consumer requires DreamTeam URL;
- deployment/DNS/rewrite consumers audited;
- final export/backup exists;
- restore/rollback tested;
- representative employee + RRHH + manager pilots pass.

## 11. Current deployment evidence

Vercel currently lists projects:
- `dream-team`;
- `dream-team-public`.

The available Vercel connector returned no recent deployments for either during this audit.

Classification:
`PROJECT_EXISTS · DEPLOYMENT_STATE_UNVERIFIED`

Do not infer active or inactive runtime solely from project existence.

## 12. Definition of done

TORO People migration is done when:
- People domain logic runs under TORO context/identity;
- employees use TORO Portal, not a separate DreamTeam product;
- shared communication uses TORO Comms;
- shared approvals/audit use TORO Governance;
- Identity owns account/membership/session/role contracts;
- HR data keeps at least existing privacy/RLS strength;
- no critical HR workflow depends on DreamTeam AppShell;
- old runtime can be disabled and restored safely if required.
