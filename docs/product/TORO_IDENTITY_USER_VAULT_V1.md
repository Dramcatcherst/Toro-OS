# TORO Identity + TORO User Vault v1

**Status:** IMPLEMENTATION SPEC — do not apply production DDL from this document directly
**Date:** 2026-09-22
**Canonical runtime:** Supabase project `abtyrbqlqbsastmridzp`
**Depends on:** `TORO_SUBSYSTEMS_AND_USER_VAULT.md`, TORO Product Constitution

## 1. Objective

Create one durable identity per human and a privacy-safe user data domain that can support both work and personal assistance without creating a separate physical database per person.

TORO Identity answers:
- who is this human;
- which organizations/workspaces they belong to;
- which roles they hold;
- which employee/person records represent them in each organization;
- which tools they connected personally or through an organization;
- what TORO is allowed to remember, read, share and execute.

TORO User Vault answers:
- what durable personal/user-specific context TORO may retain;
- who owns it;
- which scope it belongs to;
- why it exists;
- where it came from;
- how long it may remain;
- whether it can be promoted into work/shared knowledge.

## 2. Verified current baseline

Current Supabase already provides a strong foundation:

- `auth.users` + `public.app_users` for individual identity;
- `public.organizations` for organizations;
- `public.roles` and `public.user_roles` for organization-scoped roles;
- `public.employees` for employment relationship;
- `public.departments` and `public.positions`;
- `public.employee_private_profiles` for employer-governed private HR data;
- `public.employment_profiles` for employment terms/history;
- `public.user_sessions`;
- `public.notifications`;
- `public.team_messages` and `public.team_message_read_states`;
- `public.approval_requests`;
- `public.audit_logs`.

Observed counts on 2026-09-22:
- 1 organization;
- 5 app users;
- 13 non-deleted employee records: 12 active, 1 terminated;
- 4 employee records currently linked to a `user_id`;
- 9 employee records currently without a user link;
- 9 active user-role rows;
- 3 users currently hold multiple roles within the same organization;
- 7 employee-private profiles;
- 0 employment-profile rows;
- 86 session rows.

These counts are operational evidence, not a permanent contract.

## 3. Important boundaries

### 3.1 Employee private profile is not the User Vault

`employee_private_profiles` contains employer-governed HR-sensitive data and is readable/writable under ADMIN/RRHH policy. It must not become TORO Personal memory.

### 3.2 Founder profile is not the User Vault

`private.founder_profiles` is organization-governed and visible to privileged business roles. It is not an appropriate generic personal memory store.

### 3.3 One auth identity, many organizations

A person keeps one `auth.users.id` / `app_users.id` and may join multiple organizations. Employment is organization-specific and may exist without a login during pre-onboarding.

### 3.4 Membership is distinct from role

Today `user_roles` partly acts as both membership evidence and authorization. v1 should introduce explicit organization membership state so:
- a user can belong to an organization before a role is assigned;
- suspension/offboarding can disable membership once without rewriting every role;
- multiple roles do not create duplicate membership semantics;
- future non-employee users can belong without forcing an employee record.

## 4. Proposed canonical identity model

### Existing — reuse

- `app_users`
- `organizations`
- `employees`
- `departments`
- `positions`
- `roles`
- `user_roles`
- `user_sessions`

### Add

#### `identity.organization_memberships`

Purpose: one row per human ↔ organization relationship.

Suggested columns:
- id uuid PK;
- org_id uuid FK organizations;
- user_id uuid FK auth.users;
- membership_type text: employee / owner / contractor / advisor / provider / other;
- status text: invited / active / suspended / offboarded;
- primary_employee_id uuid nullable;
- joined_at;
- offboarded_at;
- created_at;
- updated_at.

Unique: `(org_id,user_id)`.

Do not duplicate role fields here. Roles remain in `user_roles`.

#### `identity.user_profile_settings`

User-owned presentation and assistant preferences:
- user_id PK;
- preferred_name;
- locale;
- timezone;
- communication_style;
- default_personal_workspace;
- created_at;
- updated_at.

This supplements `app_users`; it does not copy authentication secrets.

## 5. TORO User Vault schemas

Recommended dedicated schema: `user_vault`.

### `user_vault.memory_items`

Durable memory, not raw chat history.

Fields:
- id uuid;
- user_id uuid;
- org_id uuid nullable;
- scope: personal / work_private / work_org / shared / system;
- domain;
- memory_type;
- title;
- normalized_value jsonb;
- summary text;
- source_type;
- source_ref;
- provenance jsonb;
- confidence numeric;
- verification_state: observed / candidate / confirmed / verified / disputed;
- sensitivity: public / internal / private / restricted;
- retention_class;
- expires_at nullable;
- supersedes_id nullable;
- status: active / superseded / expired / deleted;
- created_at;
- updated_at.

Rules:
- no full raw email/thread/chat dump by default;
- personal rows require `user_id = auth.uid()` for normal reads;
- organization access to personal scope is always false;
- work_org rows should normally graduate to canonical business domains rather than remain user memory forever.

### `user_vault.preferences`

Stable preferences:
- user_id;
- org_id nullable;
- scope;
- preference_key;
- value jsonb;
- source_ref;
- confidence;
- confirmed_at;
- status;
- timestamps.

### `user_vault.goals`

- user_id;
- org_id nullable;
- scope;
- goal_type;
- title;
- target_date;
- status;
- success_criteria;
- source_ref;
- timestamps.

### `user_vault.learning_signals`

Stores corrections/repetition evidence before durable promotion:
- user_id;
- org_id nullable;
- scope;
- signal_type;
- domain;
- normalized_signal;
- occurrence_count;
- first_seen_at;
- last_seen_at;
- proposed_memory_key;
- review_state.

### `user_vault.consents`

- user_id;
- consent_type;
- purpose;
- scope;
- granted;
- granted_at;
- revoked_at;
- policy_version;
- source_channel.

### `user_vault.tool_connections`

Metadata only:
- user_id;
- org_id nullable;
- connection_owner: personal / organization;
- provider;
- external_account_ref_masked;
- status;
- granted_scopes;
- last_health_at;
- secret_ref;
- timestamps.

Never store OAuth/access tokens directly here.

### `user_vault.tool_permissions`

- user_id;
- org_id nullable;
- provider/tool;
- permission: read / search / draft / execute / approve;
- scope;
- granted_by;
- expires_at;
- status.

### `user_vault.notification_preferences`

- user_id;
- org_id nullable;
- channel;
- category;
- enabled;
- digest_mode;
- quiet_hours;
- escalation_allowed.

### `user_vault.context_events`

Minimized normalized events useful for continuity:
- user_id;
- org_id nullable;
- scope;
- event_type;
- subject_ref;
- source_ref;
- occurred_at;
- payload_minimized jsonb;
- retention_class.

Do not use this as an unlimited activity surveillance log.

## 6. RLS invariants

### Personal
- user-only normal access;
- organization roles, including ADMIN, have no personal-content access;
- server operations require explicit purpose and audit.

### Work private
- user reads own;
- organization access only through explicit named policy.

### Work org
- role/org policy governs;
- canonical operational facts should live in domain tables whenever possible.

### Shared
- explicit share grants required.

### System
- least privilege and payload minimization.

## 7. Personal/work context firewall

Every request resolves:

`actor -> active context -> organization (optional) -> scope -> permission -> tools -> response/write target`

Examples:
- "Remind me to call my mother" -> personal.
- "Remind me to inspect room 25" -> work_private or work_org.
- "Save that I prefer reports in bullets" -> personal unless explicitly organization-specific.
- "Our hotel policy is check-out at 11" -> organization knowledge candidate.
- "I have a medical appointment" -> personal.
- "I need leave Friday for an appointment" -> HR request can record leave facts without copying personal appointment detail.

## 8. Memory promotion rules

`transient observation -> learning signal -> candidate memory -> confirmation/verification -> durable memory`

Confirmation required for identity, relationship, employer-facing, financial, health/legal, permission or action-authority-changing facts.

## 9. Existing identity debt

### P0
1. Introduce organization membership without breaking `user_roles`.
2. Reconcile employee ↔ user links before employee-facing rollout.
3. Classify the 9 unlinked employee records.
4. Populate or explicitly retire the empty `employment_profiles` path after source review.
5. Remove legacy role aliases only after compatibility testing.

### P1
6. Add User Vault schema with RLS tests.
7. Add Personal vs Organization context resolver.
8. Bind connectors to user or organization ownership.
9. Add export/delete/retention workflows.
10. Add "What TORO knows about me" controls.

## 10. Required tests

- user A cannot read user B personal vault;
- ADMIN cannot read employee personal vault;
- one user can belong to two organizations without leakage;
- membership suspension blocks org access;
- personal connector data is not employer-readable;
- one message cannot silently become durable memory;
- personal memory cannot become work_org without governed transition;
- offboarding revokes organization scope without deleting personal TORO data.

## 11. Rollout order

1. schema + RLS in isolated validation;
2. identity reconciliation;
3. memberships backfill;
4. empty User Vault foundation;
5. context resolver;
6. Mauricio pilot;
7. one non-owner employee pilot;
8. memory inspection/export;
9. personal connector pilot;
10. wider rollout.

No personal data ingestion starts before steps 1–5 are verified.


## 12. Investigación y plan de integración de usuarios/Personas — 13/10/2026

Estado: INVESTIGATED / TARGET PLAN, no implementación activada. Subordinado al único `docs/product/TORO_BRAIN_GENERAL_PLAN.md`, su sección23 y los carriles Identity, People, Projects, Comms, Governance, Data y Human Experience. Este apartado actualiza prioridades y evidencia; no crea otro plan maestro ni otro motor.

### Dirección del propietario

Mauricio declaró que actualmente es el único usuario real. Su problema prioritario es la falta de alineación, activación e integración entre proyectos. No quiere incorporar personas a un sistema que todavía no funciona de forma suficientemente fiable. La cuenta de administración indicada la usa solo Mauricio; cada persona tendrá cuenta propia.

Por ello se establece OWNER_ONLY_PROOF como dirección de esta entrega: probar recorridos completos del propietario y resolver las diferencias entre proyectos antes de invitar empleados. Es una instrucción de planificación, no un flag aplicado. Las seis cuentas de Auth no significan seis humanos activos. No borrar, suspender ni restablecer cuentas existentes para acomodar esa declaración. Clasificar dueño, propósito y uso mediante evidencia privada. La identidad del propietario puede administrar ámbitos autorizados, pero no se convierte en la identidad de Margot. Alta de cuenta propia de Margot y empleados permanece diferida hasta el gate de readiness; preparar estructura no equivale a activar acceso.

### Alcance y fuentes consultadas

Investigación directa de código TORO en main `090bc54227c8f58895920ac5680f878250f12062`; Constitución, Plan General, Identity/User Vault, People/DreamTeam, Scope Graph y mapa de migración. Lectura de código DreamTeam en el árbol resuelto durante este corte: authorize, accounts e invitations. Supabase `abtyrbqlqbsastmridzp`: catálogo, agregados de datos, funciones, políticas e índices. Airtable: esquema hotel, Knowledge y Central, y las doce filas minimizadas de perfiles laborales; sin cursor pendiente y total declarado12. No se leyeron salarios, cuentas bancarias, diagnósticos médicos, contraseñas o tokens.

La revisión no comprende todos los repositorios, cada RPC/trigger, cada tabla/RLS o cada servicio externo. No hubo pruebas autenticadas con dos personas, pruebas de carga, sesión común entre superficies o worker de alta. Es evidencia parcial suficiente para secuenciar trabajo; no certificado integral de seguridad ni rendimiento. Las fechas históricas del documento se conservan como antecedentes.

### CURRENT: realidad observada

| Área | Evidencia del corte | Implicación |
|---|---|---|
| Cuentas | Auth6, app_users6, perfiles activos6 | Separar cuenta registrada, titular confirmado y usuario real; el propietario confirma solo un usuario actual |
| Empleados | 12 activos:5 vinculados a cuenta,7 sin vínculo;1 terminado sin vínculo | Conservar expedientes sin crear cuentas por estar activos |
| Membresías |5 activas, todas en Dreamcatcher | Tabla explícita ya existe; no volver a crearla |
| Roles |18 filas activas;1 EMPLEADO sin membresía activa en Dreamcatcher | Caso de conciliación, no conceder membresía automáticamente |
| Integridad |0 grupos duplicados por org+user entre empleados no borrados;0 desacuerdos de vínculo primary_employee;0 terminado con rol activo en consulta | Estos ceros delimitan la consulta; no prueban ausencia de aliases/duplicados humanos ni offboarding integral |
| RRHH |13 perfiles privados;0 employment_profiles no borrados | Perfil privado de empleador no es memoria personal; falta conciliar términos laborales |
| Airtable laboral |12 perfiles:10 ACTIVO,1 INACTIVO,1 POR_VALIDAR;8 PARCIAL,2 PENDIENTE,1 VERIFICADO,1 NO_APLICA;11 portal_enabled | Flag de Airtable no acredita autorización ni usuario habilitado; migración por evidencia y vigencia |
| People IA |12 perfiles not_started;0 progreso onboarding,0 identidades de canal,0 capability grants en tablas consultadas | Perfil/menu documental no es usuario integrado ni canal activo; otros modelos de permiso pueden existir |
| Tareas |227 active:30 sin owner_name,113 sin assignee_name | Incluye históricos/done; no son 143 tareas abiertas ni desempeño de personas. Clasificar estado y aceptación antes de corregir |
| Ámbitos |Dreamcatcher, Mauricio personal, Margot personal, Carolina personal, cuarentena de titular | Personal/quarantine tienen0 membresías; existencia de org no demuestra ámbito operativo |
| User Vault |Sin tablas visibles en esquema user_vault en este inventario | Contrato TARGET, no servicio de memoria personal verificado; puede existir evidencia en otros destinos |

### Hallazgos de integración a resolver

1. Resolver de Portal aún construye membresía activa desde roles y marca source=legacy_user_roles, aunque organization_memberships ya está desplegada. private.has_org_role evalúa rol activo/no revocado, no membresía. Varias políticas existentes dependen de ese helper. Suspender una membresía no debe declararse revocación universal mientras consumidores y RLS no apliquen el mismo criterio. Investigar y probar antes de cambiar helper global o hacer backfill.
2. Portal selecciona organización explícita si hay varias; DreamTeam authorizeRoles selecciona la primera asignación autorizada tras ordenar por prioridad. Esto puede producir contextos distintos para el mismo humano multiámbito. Es diferencia de código, no filtración observada. Target: selección explícita y revalidación concordante por operación.
3. Portal employee lookup usa limit(1), no comprueba estado laboral y no detecta ambigüedad; el corte no encontró duplicados. DreamTeam usa maybeSingle pero no demuestra estado laboral como condición de elegibilidad. Definir reglas separadas para acceso personal, empleo activo y administración no empleada, sin expulsar al propietario por no ser empleado.
4. Portal-mode aplica enforce_user_session; modos internos tienen otro flujo. DreamTeam reutiliza ese RPC y evalúa MFA condicional. Igual proveedor Auth no prueba sesión común, revocación idéntica en todos los consumidores ni MFA activado. Comparar logout/idle/expiry/reset/suspensión y entradas Portal/API/canales.
5. DreamTeam sí contiene flujos de cuentas e invitaciones: no inventar un segundo sistema. Las rutas inspeccionadas escriben Auth/app_users/user_roles/employee, pero no organización_memberships. Auth es efecto externo a la transacción; manejar éxito parcial, reconciliación, readback y replay antes de reutilizar. No ejecutar invitaciones en esta etapa.
6. Faltan evidencias de uso: role pack, onboarding, canal verificado y permiso de capacidad deben concordar con identidad/ámbito. Contacto/clock-ID/nombre/cuenta conectada no concede autoridad.
7. Planes y PRs conservan trabajos parcialmente implementados. PR207 own-payroll y PR265 mail/environment continúan en carriles propios; este plan no los declara integrados o publicados. El General Plan indica baseline local y QA previa: no relanzar toda auditoría ni reinterpretar código local ajeno como main desplegado.

### TARGET: contrato común

Persona verificada -> cuenta individual -> membresía de ámbito -> roles/capacidades -> relación laboral opcional -> contexto seleccionado -> fuente autorizada -> acción -> evidencia/readback/receipt.

Una persona puede tener varios ámbitos y roles; no varias identidades por producto. Ser empleado, miembro, administrador, contacto o proveedor son relaciones distintas. Empleado puede existir sin login. Cargo no es permiso. Menú no es capability grant. Acceso a hotel no abre Personal. Acceso del propietario a un proyecto ajeno no cambia titularidad de sus datos.

Mantener modelos fuertes existentes: Auth/app_users, memberships, user_roles, employees, People laboral, operations.projects/tasks y Control Plane. En lugar de copiar tablas por proyecto, aplicar contratos y lectores/acciones comunes con alcance explícito. Memoria personal permanece separada de RRHH y de conocimiento de empresa. No implementar un grafo genérico o base por persona sin necesidad validada.

### Etapas y criterios de terminado

| Etapa | Prioridad y owner | Trabajo acotado y dependencias | Evidencia exigida antes de avanzar |
|---|---|---|---|
|0 Conciliar realidad |P0 Identity/Data/Projects |Clasificar6 cuentas por titular/uso,7 expedientes activos sin login y1 rol sin membresía; relacionar carriles/PRs, deployments y tareas existentes. Respeta decisiones humanas; sin altas |Inventario privado por ID, fuente/corte, estado DOCUMENTADO/IMPLEMENTADO/PROBADO/ACTIVO/USADO y siguiente dependencia; cada caso en objeto existente |
|1 Autoridad común |P0 Identity/Governance |Contrato único membresía+rol+contexto y ciclo de vida; analizar impacto en RLS/RPC/Portal/DreamTeam/workers. Preparar cambios pequeños, tests y recuperación |Pruebas de membresía ausente/suspendida, rol revocado, contexto múltiple, empleo inelegible/duplicado, permiso insuficiente y fallo de transporte; sin leer otro scope |
|2 Prueba integrada de Mauricio |P0 Portal/People/Projects/Comms |Primer recorrido real: login -> contexto -> tarea/proyecto -> herramienta/fuente -> respuesta con evidencia -> retorno/logout. People empieza con horario propio publicado si es elegible; no crear empleado artificial. Conectar lector ya autorizado |Mismo humano y contexto en entrada directa/API; fuente y cobertura explícitas; sin datos demo como reales; vacíos honestos; sesión revocada deniega; cero pasos críticos ambiguos |
|3 Ciclo de vida gobernado |P1 Identity/Governance |Reutilizar flows administrativos: preparar/confirmar alta, vincular cuenta existente, membresía/rol mínimo, suspensión/baja, recuperación. Control Plane run/lease/fencing, idempotencia y compensación Auth |Replay no duplica, efecto parcial se detecta/reconcilia, revocación efectiva en todos los consumidores, receipt y rollback verificados; sin nuevas invitaciones todavía |
|4 RRHH y trabajo alineados |P1 People/Data/Projects |Conciliar12 perfiles Airtable mediante identidades comprobadas y vigencia; conservar histórico/restricción. Resolver tareas por estado, owner aceptante y responsabilidad; no asignar por nombres. Reutilizar aprobaciones/mensajes |Ficha laboral autorizada y fuente vigente; horario/solicitud/asistencia coinciden con legado; tarea y aprobación usan mismo objeto en cada superficie; payroll sigue carril crítico propio |
|5 Canales y experiencia |P1 Comms/People/Human Experience |Alta verificable de canal propio, capacidades por acción, onboarding real y reportes por rol. Evitar segundo login solo después de paridad; no copiar tokens |Contacto no verificado falla cerrado, bajas revocan canal, flujo recibido/ejecutado/verificado distinguido, datos previos se limpian al cambiar contexto |
|6 Gate y piloto individual |P1 propietario + QA/People |Solo tras readiness, una persona voluntaria/confirmada con cuenta propia y ámbito mínimo; Margot o empleado según utilidad, no despliegue masivo |Dos identidades reales con pruebas negativas, recorrido diario aceptado, soporte y recuperación probados, rollback conserva legado. Ampliar uno a uno según resultado |
|7 Optimización medida |P2 Systems/Data |Medir latencia, errores, consultas repetidas, cobertura y recuperación; optimizar consultas/índices con planes y volúmenes reales |Comparación antes/después y regresión; no prometer ahorro ni crear índices por intuición |

Secuencia dirigida por gates, no fechas inventadas. PR por unidad coherente, branch desde main vigente, tests proporcionales, preview cuando aplique, readback de release antes de ACTIVO. Preservar runtime DreamTeam hasta paridad. No convertir etapa0 en nueva auditoría recurrente, backlog o scheduler.

### Readiness para empezar a incorporar personas

No sustituir «casi perfecto» por una promesa de cero errores. Interpretación propuesta: todos los recorridos críticos seleccionados funcionan de principio a fin; sin fallos de aislamiento o permisos abiertos; funciones pendientes quedan visibles e inaccesibles; recuperación y responsables están claros. Mauricio debe poder usar el sistema sin perseguir varios proyectos o distinguir maquetas de operaciones reales.

Antes de un segundo usuario humano:
- contrato de identidad/contexto y revocación aplicado coherentemente a los consumidores del piloto;
- recorrido del propietario probado con fuentes autorizadas y sin pasos críticos fallidos;
- segunda identidad elegible en QA, sin crear cuentas/grants de producción para completar pruebas;
- separación usuarioA/B, hotel/Personal, propiedad y canales demostrada;
- alta/vínculo/suspensión/baja/recuperación con evidencia, replay y resultado parcial resuelto;
- documentación de pendientes, ayuda y retorno al legado probados;
- decisión de continuar basada en evidencia del piloto, no cantidad de tablas, agentes o planes.

Medir: discrepancias de identidad/membresía, recorridos críticos aprobados/total, errores de permisos, integraciones críticas verificadas/total, tiempo para resolver trabajo real, acciones que requieren intervención y uso real. Baselines actuales no acreditan beneficios. Umbrales de rendimiento/soporte se fijan después de medir el primer recorrido.

### Bases de datos y recuperación

Primero contratos, constraints e integridad; después rendimiento. RLS está enabled en nueve tablas clave consultadas; FORCE=false no es por sí solo defecto y el diagnóstico privilegiado no prueba RLS de usuario. Hay índices únicos de membresía y roles, y de employee_code por org, pero no índice único org+user no borrado en employees dentro del inventario. Evaluar si recontratación/histórico permite imponerlo; no añadirlo sin criterio y análisis de colisiones. primary_employee validation existente se reutiliza.

No exponer schemas completos a PostgREST para resolver un lector: usar transporte ya gobernado, columnas mínimas y security invoker cuando corresponda. Nada de service-role interactivo, tablas universales para todos los hechos, copias completas de Airtable, o «activar todos» por SQL. Roles no autorizan memoria personal por sí mismos.

Cada cambio futuro tendrá estado previo, IDs afectados, criterio de rollback y detección de cambios concurrentes. Auth/provider no forma una única transacción con Postgres: reconciliar y compensar sin borrar cuentas preexistentes. Offboarding bloquea ámbito laboral sin borrar memoria personal. Retirar DreamTeam o limpiar duplicados espera paridad y ventana de recuperación.

### Preguntas resueltas y pendientes

Resueltas por Mauricio: prioridad integración/activación coherente antes de usuarios nuevos; único usuario real actual; cuenta administrativa solo del propietario y futuras cuentas individuales. Margot no debe reutilizar esa cuenta como identidad propia.

Pendientes técnicos se investigan sin trasladarlos al propietario: mapa de consumidores/RPC, dataset de prueba con dos identidades elegibles, comportamiento de revocación, deploy activo vs main/local, perfiles laborales discordantes y writer gobernado. Más adelante solicitar únicamente quién valida la ficha laboral y qué persona acepta el primer piloto, después de que el sistema supere el gate; no pedir altas ahora.

NEXT único: completar el mapa de autorización por consumidor y la matriz de aceptación de identidad/contexto, con un recorrido del propietario y recuperación definidos, dentro de los contratos existentes. No empezar por invitaciones, grants, migraciones o User Vault lleno. El plan está preparado para revisión; implementación y optimizaciones de producción no ejecutadas.


## 13. Identidades vinculadas entre sistemas y actores humanos/no humanos — investigación 13/10/2026

**Dirección:** ampliar la misma entrega del PR281 a DreamTeam/TORO, Alegra, Dropbox, Chrome/Windows, reloj, otros registros y agentes. Un lugar para consultar sujetos, relaciones, cuentas y evidencias autorizadas; datos transaccionales y permisos permanecen en sus autoridades. OWNER_ONLY_PROOF sigue vigente: Mauricio único humano usuario actual y cuenta administrativa solo suya. No nuevas cuentas, fusiones, invitaciones, grants, DDL o agentes activos por esta investigación.

### Matriz de fuentes y alcance comprobado

| Fuente | Observación | Cobertura y siguiente dependencia |
|---|---|---|
| TORO y DreamTeam | Mismo Auth/Supabase y datos laborales existentes; diferencias de resolución/membresía y altas documentadas en sección12 | Código y metadata investigados, no SSO/runtime integral certificado |
| Auth/app_users/People | Reutilizar identidad de cuenta, empleado por organización y membresía/rol; no elevar contacto a login | Agregados actuales; el inventario privado por persona requiere vista autorizada |
| Reloj/Supabase |13 mappings activos marked confirmed;3 con confirmed_at.12 empleados activos:11 con mapping confirmado,1 sin mapping.1642 punches no borrados,12 identificadores por org;6 imports con períodos julio–septiembre2026 y última importación01/oct | Son datos importados, no roster actual del dispositivo.0 punches sin mapping temporal válido,0 con más de uno y0 períodos invertidos en el corte. Falta marca/modelo/software/device export; consulta al propietario enviada |
| Airtable Central |staff_directory, hr_employment_profiles, hr_time_imports y demás HR ya existen | Los12 perfiles fueron leídos con campos minimizados; no nueva tabla espejo |
| Alegra contabilidad |Tres conectores permitidos, muestra1 contacto por conexión; metadata total1029/426/1029. Conectores1y3 devolvieron mismo UUID/ID;2 otro UUID/ID | Muestra no acredita inventario completo ni identidad legal de empresa. No contar conectores como personas o tenants. Resolver empresa/country/account antes de matching; no unir nombres |
| Alegra Nómina/POS |GET employees devolvió404 APC2001 Organization not found en las tres conexiones; una consulta de usuarios de estación sin estación explícita devolviólista vacía | Falta cobertura de nómina/login ACL. No significa ausencia de empleados/contactos o usuarios generales en Alegra. No activar módulo ni contratar servicio para investigar |
| Dropbox |Cuenta conectada y raíz verificadas; navegación acotada encontró rutas EMPLEADOS/RRHH/BASE DE DATOS. Listados de hijos directos y paginaciónRRHH agotada;2 archivos RRHH de metadata | No se leyó contenido sensible ni ACL de colaboración. Nombre de carpeta no acredita titular o privacidad. No mover/copiar archivos. Original+file_id/revisión/hash y manifest existente |
| Dropbox búsquedas |Búsqueda amplia de marcaciones devolvió imágenes irrelevantes; búsqueda por título marcaciones/DREAMTEAM devolvió0 | Resultado de búsqueda no acredita ausencia de originales. Navegar directorios exactos y validar cada archivo |
| Windows del propietario |Capturas muestran perfilMicrosoft del propietario, discoC235GB usados/0bytes libres, Documentos21,3GB,77aplicaciones; tamaños de apps declarados por Windows | Evidencia aportada, no medición local nueva. No identificar usuarioChrome desde iconos. Disco lleno es dependenciaP0 para capturas/export/diagnóstico; no borrar/sincronizar ni desinstalar por esta tarea |
| Chrome |Sin acceso directo a perfiles locales en este entorno | Inventario local de metadata pendiente; descubrir perfiles, cuenta de sync y cuentas de servicios como relaciones distintas. No acceder a cookies, Login Data, contraseñas o tokens |
| Agentes |Registry actor/surface, catálogo54capacidades/6responsables; Control Plane tiene4runs:3agent/1human; recibos3agent verified,1human verified y1prepared | Etiqueta de actor/receipt no prueba identidad de máquina o autonomía general. operations.toro_execution_actor_v1 es proyección de tareas, no registro de cuentas de agentes |
| Plugins invocados |Superpowers instalado según catálogo; guía writing-plans pública consultada. Master Brain no proporcionó capacidad específica mediante búsqueda disponible | No asumir autoridad Airtable por nombre de plugin. Constitución/Plan GitHub y Supabase siguen canónicos; no inventar ejecución del plugin ausente |

Metadata de conectores, conteos y estados son evidencia del corte, no constantes. Las rutas/documentos privados, direcciones personales, números legales y nombres de empleados permanecen fuera del repositorio público.

### Qué significa «una sola parte»

Una vista gobernada de TORO Identity/People/Actors que muestra, según permiso:
- sujeto estable y tipo;
- relaciones laborales/organizacionales y proyectos;
- cuentas externas vinculadas con fuente/estado/vigencia;
- acceso efectivo y origen de permiso;
- referencias documentales;
- conflictos, faltantes y último corte.

No es una fila universal con todos los campos ni un repositorio de credenciales. Payroll sigue People/Finance y autoridad contable; punch original sigue asistencia; archivos siguen Dropbox; perfil de navegador sigue dispositivo; permisos de proveedor siguen proveedor. Mantener contratos y referencias verificadas evita que cada proyecto cree otra lista de usuarios.

### Tipos y claves iniciales del índice de lectura

1. **human con cuenta:** human:auth:<auth.uid> enlaza app_users; empleado por org es una faceta, no otra persona.
2. **human sin cuenta:** human:employee:<org_id>:<employee_id> es clave provisional de expediente. No crea Auth ni declara identidad global para varios empleadores.
3. **external_party:** external:<provider>:<provider_account_key>:<external_id>; puede ser persona o empresa. Un contacto Alegra proveedor no es automáticamente empleado ni usuario.
4. **agent:** agent:<canonical_agent_key>, enlazado al registry/catálogo vigente, responsable humano y autoridad limitada. No salario, planilla, huella ni onboarding laboral por defecto.
5. **machine/service:** machine:<verified_machine_principal_ref>, solo cuando ya exista identidad técnica validada. Si falta, aparece candidato pendiente; actor_ref arbitrario no la crea.
6. **account/profile:** registro de relación a sujeto, no sujeto humano adicional. Una persona puede usar distintos perfilesChrome/cuentasGoogle/Microsoft/Dropbox sin ser duplicada.

Estas claves son contrato del índice read-only, no nuevas columnas/tablas. Revisar dominio/mappings existentes antes de persistir crosswalk. Si falta relación común, justificar capa mínima tipada bajo Identity con migración/tests/recovery propios; no extender external_dependency_registry como identidad personal ni usar employee_code como IDglobal.

### Matching y confianza

Identificadores externos se acotan por proveedor+cuenta/empresa+tipo+scope; reloj añade dispositivo cuando se conozca y período de vigencia. El esquema actual no ofrece device_id en punch_identity_mappings: no cargar un segundo reloj con IDs reciclados sin resolver esa colisión. Evaluar valid_from/to para cada marcación; no aplicar mapping actual a historia.

Evidencia fuerte: enlace Auth existente, empleadoID corroborado, mapping confirmado con fuente/confirmador y vigencia, identificador externo inmutable, o confirmación documentada del titular. Nombre/apodo, correo parecido, teléfono, perfilChrome, carpeta, coincidencia salarial o catálogo IA son candidatos, nunca fusión automática. Correos compartidos y cuentas de servicio requieren propietario/responsable, no «persona inferida».

Estado del vínculo: observed/candidate/verified/disputed/revoked/expired; no elevarlo por similitud. Cada cambio conserva antes/después, decisión, fuente y fecha. Puede deshacerse el enlace sin borrar historial. Evitar export público del inventario de personas; hashes de identificadores no vuelven públicos los datos por sí mismos.

### Agentes como usuarios del sistema

Aceptar actor no humano en la vista común y en auditoría sin convertirlo en cuenta de empleado. Separar quién actúa, para quién actúa y quién aprobó. Un humano autenticado que delega a un agente conserva su identidad; el agente ejecuta con principal técnico propio, ceiling de acción, scope, caducidad, revocación y run/lease/fencing/receipt. No heredar ADMIN por nombre de agente, copiar contraseña del propietario, simular login humano ni dar service_role a UI.

Configurar permisos por capacidad y ámbito; un agente lector no paga, cambia roles o publica. Dots, specialists, workers temporales, schedules y connectors tienen clases distintas en el registry vigente. Entrenamiento y menú no conceden autoridad. Atribución actor_ref debe validarse contra principal/autorización antes de tratar receipt como prueba de identidad.

### Secuencia de esta ampliación

**P0:** completar fuentes privadas faltantes (Chrome local y reloj) sin alterar dispositivo; catalogar conexionesAlegra por empresa y obtener roster/ACL mediante lectura permitida. Resolver estado de disco antes de exportaciones grandes, con recuperación de archivos aparte.

**P0:** índice de lectura y matching candidato sobre modelos existentes, aislamiento probado; incluir contactos/empleados y actores tipados, sin conceder permisos. Reusar diagnóstico SQL existente y corregir métricas: su consulta de cardinalidad actual agrupa por user_id, cuenta users_with_active_org_role incluso sin rol y etiqueta pares por usuario; definir usuario con rol y parorg+usuario como medidas distintas.

**P1:** vista única y contexto común para el propietario; navegar a ficha laboral, proyecto, contacto externo y documento autorizado conservando fuentes. No desplegar User Vault lleno ni reemplazar productos hasta paridad.

**P1 posterior:** flujo de enlace/aprobación/desvinculación y ciclo de vida gobernados después de readiness. Persistencia/DDL solo si se demuestra necesidad y se aprueban gates técnicos.

Plan ejecutable subordinado: `docs/superpowers/plans/2026-09-22-toro-identity-user-vault-people-integration.md`, revisión13/oct. Conserva fases históricas como evidencia, reemplaza recomendaciones obsoletas de crear membresías ya desplegadas y permite implementación por unidad. No se realizó unión, traslado, invitación, activación de agentes o limpieza del PC.


### Aclaración del reloj y evidencia DreamTeam — mismo corte

Mauricio confirma descarga manual por llaveUSB, reloj sinmarca identificada y conexión posible alPC; anuncia unExcel DreamTeam pendiente de recepción. No se conoce protocolo o tipo de puerto. La propuesta prioriza importación asistida del archivo existente y evaluación de conexión directa después del diagnóstico.

Readback de time_imports localiza seis TXT, incluidos AGL_001.TXT y archivos quincenales nombrados por período. Última importación registrada:01/oct/2026, período16–30/sept. El archivo original no fue recuperado por este readback. Los períodos/local_dates consultados explican alcance del lote; no acreditan horas pagadas ni jornada física.

Código DreamTeam: src/lib/hr/time-clock.ts usa TXT/CSV/TSV/XLS/XLSX/ODS, UTF8/fallbackWindows1252, ventanas de duplicado configurables y parser existente. Analyze consulta resolveStaff de src/lib/hr/staff.ts, que usa lista local y alias de respaldo. La persistencia llama commit_time_import_v6; cadena desplegada v6->v5->v4->v3->v2 comprobada. v2 aplica mapping org+clock_id+fecha, active/confirmed/no borrado y un único employee_id. Así la diferencia principal a resolver es concordancia preview/commit, conservando el gate de mapping de base.

Consulta adicional encontró un import con marcas fechadas después de imported_at local. No se infiere la causa: contrastar archivo original, metadata y reloj antes de corregir. No recalcular nómina, cambiar hora del dispositivo, sustituir períodos o cerrar asistencia con esta señal.

Estado de la ampliación: investigación de fuentes disponibles y plan de tareas guardados; roster directo del dispositivo, perfiles localesChrome, ACL de documentos y usuarios generalesAlegra siguen sin verificar. ElExcel pendiente puede cambiar resultados y prioridades; incorporar su delta antes de decisiones de alta/migración.


## 14. Exportación DreamTeam recibida y origen publicado — 13/10/2026

**Adjunto:** dream-team-empleados.xlsx, recibido del propietario; contenido de hojas NO_LEÍDO. download_file devolvió requires a ready execution workspace; tampoco hay sesiónExcel conectada. No bytes, hash o filas analizadas, ni copia del original a servicio externo. Se solicitaron por texto solo las columnas minimizadas Código/Colaborador/Sector/Función/Estado/Ingreso/Salida para completar la comparación. No atribuir al adjunto los conteos de Supabase.

**Sitio proporcionado:** https://dream-team-public.vercel.app/dreamteam devuelve HTTP200 y pantalla de acceso sin sesión; no directorio autenticado. Vercel identifica deployment READY dpl_EZ1wLBsq7z6tf97wCQ7LFtBQCLcK, production, repo Dramcatcherst/dream-team, rama fix/manual-attendance-20261001 y commit b9cf10606f410a0e6a6cdb5162dac1b735230a27. Defaultmain observado4d8374194b59d044bf67e703f5b854ad0105cf05 está2commits detrás del código servido en compare. Códigoinspeccionado/commitpublicado/sesiónaceptada son estados separados; no desplegar main para «alinear» perdiendo esos dos cambios.

**Exportador verificado por código, no por lectura del adjunto:** src/app/api/reports/[report]/route.ts employeesReport genera dream-team-empleados.xlsx, hojaEMPLEADOS y portadaLEER PRIMERO mediante report-workbook.ts. Columnas: Colaborador,Nombre legal,Código,Sector,Función,Estado,Ingreso,Antigüedad años,Salida,Teléfono,Correo,Vacaciones disponibles,Saldo al,Salario actual,Tipo salario,Cuenta depósito. Contenido esperado es expediente laboral restringido; no inventario de usuarios/login ni roster de reloj. No incluye IDsAuth, employeeUUID, orgUUID, membresía, rol o clockID en esa proyección.

**Semántica a corregir:** resumen «Con cuenta registrada» cuenta filas employee_bank_accounts, no usuarioAuth. Debe decir cuenta bancaria y mantener por separado cuenta vinculada, membresía activa, rol vigente y acceso efectivo. module-data.ts loadEmployees calcula hasAccess=Boolean(user_id); eso prueba vínculo, no elegibilidad completa. También usa primer mapping markedconfirmed sin incluir filtros de vigencia/estado en esa proyección. Conservar mappingtemporal delcommit, analizar expediente actual/histórico antes de modificar presentación.

**Baseline independiente actualizado:**13 empleados no borrados,12 activos,5 vinculados,7 activos sin user_id;1 empleado vinculado sin membresía activa. Valores consultados en SupabaseDreamcatcher, no extraídos delExcel. Reconciliar pororg+employee_code corroborado oemployeeUUID fuerte cuando exista; nombre/correo no fusionan. Normalizar fechas y blancos sin transformarfaltantes en cero. Archivoexportado genera fecha de corte propia; cotejar contra fuente del mismo corte, no sobrescribir base con snapshot.

**NEXT:** recuperar lectura real/minimizada de la hoja y fecha de generación; matrizporfila privado con match/diferencias/fuente/acciónpropuesta. Preservar información laboral restringida; índiceIdentity proyecta solo datos necesarios y references. Añadir a Task1 conteoscorrectos, Task2 estados de vínculo/acceso y Task3 mappingtemporal en directorio. Revisiónprivacy de export porcampo/rol separada: código permite rolesprivilegiados, pero no se probaron sus lecturas/RLS; no afirmar filtración.

**No realizado:** lectura deladjunto, comparaciónporfila, sesiónautenticada, alta, cambio deperfil/rol, modificación deasistencia/planilla o release. La exportación queda recibida y pendientelectura, no validada por similitud de filename.


### Conciliación directa por conectores — solicitud del propietario

Mauricio pide resolver la investigación mediante conectores y evitar transcripciones/preguntas rutinarias. La petición de pegar filas queda retirada como dependencia: se consultaron directamente las13 fichas canónicas no borradas en Supabase, que alimentan el exportador DreamTeam. Lectura privada minimizada: código, nombre/estado, departamento/área, ingreso/salida, vínculoAuth, membresía, roles y mappings de reloj; sin salarios, bancos o contactos. GitHub conserva solo agregados, no inventario identificable.

Resultados:12activos;5con cuenta vinculada y1de esos sin membresía activa;9activos sin fecha de ingreso;5activos sin nombre legal;1retirado con mappingreloj activo sinvalid_to;1ficha con dosIDsreloj;1activo sinmapping;0identidades de canal verificadas. No todos son errores: dosIDs pueden corresponder a migración/reasignación y gerencia puede no usarreloj. «Retirado conmapping abierto» no demuestra loginactivo ni autoriza borrar historia. Examinar vigencia, jornadasposteriores y fuente antes de proponer cambio.

Disposición de casos en vista protegida:
- Cuenta vinculada sinmembresía: data_conflict/authorization_review_required; no crear membresía automáticamente por rolEMPLEADO.
- Faltaingreso/nombrelegal: source_reconciliation_required; buscardocumental autorizado, no inferir fecha desde primera marcación o valid_from.
- Retiro+mappingabierto: offboarding_mapping_review_required; preservar histórico y verificar cierre según política; no cambiar payroll/clock.
- DosIDsreloj: multiple_external_bindings_review; no duplicar persona ni elegirprimerIDen directorio.
- Sinmapping: clock_requirement_review; decidir si el tipo de relación necesita marcación antes de proponer enlace.
- Sincanal: not_onboarded; no declarar mensajeríaactiva ni invitarpersonas duranteOWNER_ONLY_PROOF.

Autonomía de investigación: comprobar primero código desplegado, basecanónica, referencias/manifests y documentos autorizados; formular candidatos con evidenciacorte y fuente. Preguntaralpropietario únicamente una decisión humana no deducible de fuentes, después de presentar opcionesconcretas. Fallo de lectura/local o auth no se resuelve creando sesión, reseteandoclave, ampliandopermisos o copiandocookies.

Accesos intentados: conector de navegadorlocal devolvió Browser not connected; perfilremoto disponible no tiene signinDreamTeam verificado; no se ejecutó loginautomatizado/credenciales. El adjunto sigue recibido/no leído debido al workspace, pero la revisión de fichascanónicas sí se completó dentro delquery. No sustituir la afirmación«Excelcomparado» por datosdebase; tampoco mantener «falta información del personal» como bloqueo cuando el conector ya la devolvió.
