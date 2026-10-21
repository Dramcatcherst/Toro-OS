# TORO People — DreamTeam Integration Map

**Status:** CURRENT MIGRATION MAP  
**Date:** 2026-09-22  
**Last live identity readback:** 2026-10-20
**Legacy application:** `Dramcatcherst/dream-team`  
**Canonical destination:** `TORO People` inside TORO (`TORO OS` is the same project's legacy technical alias)

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

## 4. Historical data-gap snapshot — 2026-09-22

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


## 11. Historical identity onboarding classification — 2026-09-23

Read-only reconciliation of the 8 active employee records without `user_id` found:

- all 8 have confirmed punch/clock identity mapping;
- all 8 have department;
- all 8 have position;
- all 8 have work area;
- 2 already have restricted private HR profiles in Supabase;
- 7 match Airtable `hr_employment_profiles`;
- those 7 are status `ACTIVO`;
- those 7 have `employee_portal_enabled = true`;
- those 7 have historical-data state `PARCIAL`;
- 1 active employee does not match a current Airtable employment-profile record by confirmed clock identity and requires profile reconciliation before invitation.

### Safe disposition

**7 records:** `invite_candidate_after_identity_review`

They are real active employee identities, not incomplete junk records. Before invitation:
1. verify intended personal/work email through approved onboarding;
2. ensure no existing Auth identity belongs to the same person;
3. confirm membership/role;
4. invite through supported Auth flow;
5. link employee ↔ user only after successful identity verification.

**1 record:** `employment_profile_reconciliation_required`

Do not invite or auto-link until the missing/discordant employment profile is resolved.

No account should be created solely because an employee is active or has a clock ID.

## 11.1 Current identity rebaseline — 2026-10-20

Read-only live evidence from canonical Supabase supersedes the counts in sections 4 and 11 for current decisions:

- 13 employees: 12 active and 1 terminated;
- 6 enabled Auth principals in the Dreamcatcher scope;
- 5 active employees linked to Auth and 7 active employees without Auth;
- only 4 active employees have the complete employee + Auth + membership + role chain;
- 5 active Dreamcatcher organization memberships and 19 active role assignments; no inactive/revoked Dreamcatcher row in either set; Toro's separate Personal membership is outside the hotel workforce count;
- 5 active Aseo employees have no Auth, membership or role;
- one Maintenance identity has Auth + `EMPLEADO` but lacks membership;
- 4 existing Auth addresses use the non-deliverable `@dreamteam.internal` legacy alias;
- 0 channel enrollments and 0 employee-onboarding progress rows;
- one terminated employee retains conflicting technical `status=active`;
- the owner account labelled **Toro** and the employee-linked Mauricio Fernandez account represent the same human but remain separate Auth principals pending controlled reconciliation.

Current canonical decision and full gates live in `TORO_BRAIN_GENERAL_PLAN.md`, section **CURRENT — identidad única, censo integral e invitación segura — 20/10/2026**. Do not copy a mutable person-by-person roster into this document.

The old username/temporary-password path and `@dreamteam.internal` aliases are not the target onboarding flow. A real invite requires verified identity, an exact deliverable address or supervised in-person handoff, one-time expiry, user-created credentials, durable/idempotent state, atomic membership + least-privilege role activation after claim, receipt and rollback. No bulk invitation or name-based linking.


## 12. Code migration contract

Detailed implementation ownership, cutover waves and retirement rules are defined in:

- `docs/product/TORO_PEOPLE_CODE_MIGRATION_V1.md`
- `data/toro_people_migration_map.json`

This code migration contract is subordinate to the TORO Brain General Plan and supersedes any approach that would permanently embed DreamTeam as a second app inside TORO.

## Contrato mínimo Portal/Personas — preparación 12/10/2026
**Estado TARGET, migración NOT_STARTED, sin SQL ni acceso a empleados.** Subordinado al Plan; la dirección de simplificación está aprobada. Interfaz local puede empezar manteniendo las autorizaciones actuales y estados pendientes; sesión recíproca o lecturaPeople real requiere aceptación propia.

CURRENT código inspeccionado: Portal SupabaseSSR/browser, auth.getUser(); roles activos/no revocados; organización explícita si varias; empleado por user_id+org_id no borrado. membership.source=legacy_user_roles y allowedTools=[] no conceden herramientas. No se demostró equivalencia con user_sessions/estado laboral del legado ni unicidad del vínculo seleccionado; no se observaron duplicados o explotación. Login actual avisa acceso separado. DreamTeam permanece en su origen hasta paridad; no copiar cookies/tokens entre aplicaciones.

Contrato de contexto: userId, mode, orgId, membership.status/source, roles, employeeId, positionCode, requiresContextChoice, fecha de revalidación y estado de autorización. Campos de contrato, no nuevas columnas. Identidad/contexto/empleado concordantes; nombre/email/teléfono no crean vínculo. Datos laborales privados separados del User Vault personal.

Primer alcance real: Mi horario publicado propio y período acotado. Proyección de inicio/fin/zona_horaria/estado_publicado/área permitida/fuente/corte/cobertura/advertencia. Mapear a consulta/RPC self-read actual antes de implementar; nada de directorio general/nómina/compañeros/marcaciones importadas/escrituras. Borrador/cancelado no cobertura; dato ausente no ausencia o cero. Rutas existentes /login,/portal,/my-toro y /my-toro/herramientas#equipo; Personas conserva ordinal6. Ruta del horario futura, sin anunciarla operativa. safeNextPath conserva rechazo a destinos externos/protocol-relative.

| Prueba de aceptación | Resultado exigido |
|---|---|
| UsuarioA y usuarioB | Cada uno solo su horario; parámetros/petición directa no cruzan identidad |
| Organización/contexto | Roles deA no autorizanB; ambigüedad no consultaPeople |
| Vínculo empleado | Inexistente/duplicado/borrado/inelegible falla cerrado, sin elegir primero silenciosamente |
| Publicación y corte | Solo turnos publicados; advertencia ante fuente vencida y cobertura parcial |
| Sesión | Expiración/logout/reset/revocación/suspensión invalidan según contrato; refresh no revive sesión revocada |
| Caché/cambio de usuario | Datos anteriores se eliminan antes de cargar nuevo contexto |
| Ruta y cliente | RLS/cliente de sesión, sin service role interactivo ni secretos |
| Paridad | Mismo usuario/período coincide con DreamTeam original; evidencia de corte, sin writes |
| Retorno | safeNextPath mantiene destino interno solicitado; no redirección externa |
| Recuperación | Retirar solo vista/adapter propio preserva legado y datos |

Pendientes mínimos: consulta/RPC self-read y mapping; contrato de revocación efectivo; dos identidades elegibles de QA bajo autoridad existente. No crear cuentas/grants para completar documentación. Fuentes: TORO_IDENTITY_USER_VAULT_V1.md, TORO_PEOPLE_CODE_MIGRATION_V1.md, context/resolver.ts, lib/supabase/server.ts/browser.ts, auth/login-form.tsx/safe-next y portal/model.ts. No pruebas autenticadas ejecutadas ni retiradaDreamTeam. Sesión común no se presume por subdominio.
