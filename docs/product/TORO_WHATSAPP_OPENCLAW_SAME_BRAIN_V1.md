# TORO WhatsApp / OpenClaw Same-Brain V1

**Date:** 2026-09-23  
**Status:** CURRENT SUBORDINATE PRODUCT SPEC / IMPLEMENTATION IN PROGRESS  
**Parent:** `docs/product/TORO_BRAIN_GENERAL_PLAN.md`  
**Product name:** **TORO**. “TORO Brain” remains an acceptable internal architecture label; it is not a second product or runtime.

## 1. Decision

WhatsApp/OpenClaw is a **surface of TORO**, never a separate assistant, memory, persona, task store, project store or source of truth.

A message from WhatsApp must enter the same governed path used by Portal and other TORO surfaces:

```
message
  -> channel identity
  -> TORO identity + organization context
  -> shared personality / Human Layer
  -> intent + capability
  -> permissions + autonomy + risk
  -> canonical read/write/action
  -> evidence/receipt
  -> response
  -> follow-up notification
```

Channel-specific transport state may exist, but durable business state belongs to TORO canonical sources.

## 2. User outcome

An authorized user should be able to use WhatsApp as the simplest TORO client and, within their permission ceiling, do the same useful work they can initiate from the authenticated TORO experience:

- ask questions and search governed company knowledge;
- see “today”, priorities, decisions and exceptions;
- create internal tasks;
- create maintenance work;
- assign/follow up/close work with evidence when the workflow is enabled;
- read project status, blockers and next actions;
- create a project follow-up linked to the canonical project;
- queue work for TORO Builder / Codex;
- receive Builder/Codex progress, preview, failure and completion evidence;
- approve bounded actions when policy requires approval;
- send photos, voice notes and documents as workflow inputs where supported;
- continue the same conversation after reconnect/restart without creating another memory universe;
- receive proactive notifications only when useful and authorized.

The system must also understand normal free text. Menus, numbers and buttons are shortcuts, not the only interface.

## 3. One TORO identity and mind

The following are shared across Portal, ChatGPT-assisted workflows, Codex/Builder and WhatsApp/OpenClaw:

- canonical organization/user identity;
- role and position;
- personal-vs-work isolation policy;
- TORO personality / Human Layer version;
- source-authority rules;
- agent routing;
- capabilities and action ceilings;
- canonical tasks/projects/decisions;
- approved knowledge and learning signals;
- audit/evidence model.

OpenClaw may cache only bounded transport/session state. It may not maintain a competing durable “memory” that can contradict TORO.

## 4. Runtime topology

Use separate trust boundaries where privileges differ:

### Boundary clarification — 2026-10-22

The three roles below are product capability ceilings, not proof that three agents or sessions inside one Gateway provide isolation. Official [OpenClaw trust-model documentation](https://docs.openclaw.ai/gateway/security/trust-model) supports one operator/mutually trusting team per Gateway; mutually untrusted users cannot share an agent with delegated owner tools safely. Session partitioning, allowlists and prompts are defense in depth, not independent OS/filesystem/secret boundaries.

Reuse `toro-openclaw-gateway-01` and its original `toro-openclaw-integration` bridge before proposing infrastructure. The owner Gateway must not admit team/guest ingress to owner tools or session history. Team/guest capabilities may consume the same TORO authorization/data contracts through an actually isolated, narrowly scoped ingress once verified; its existence is not established here. If the existing deployment cannot satisfy that boundary, keep the rollout blocked and present a reviewed isolation proposal. Do not create a second Gateway, expose shell, or grant founder credentials as an automatic workaround.

On the installed version, verify account/peer session partition, cross-agent session visibility, agent-to-agent delegation and cross-provider/conversation messaging restrictions. Do not copy defaults or field names from current online docs into an older live version without validation. Disabling broad tools or selecting a messaging profile does not by itself certify a hostile-user boundary.

### Owner / personal
High-trust owner runtime. May expose stronger Builder/Codex and personal capabilities when explicitly enabled.

### Company / internal team
Role-scoped work runtime. No founder host privileges. User identity and organization permissions are resolved per sender.

### Guest
Guest-safe TERE runtime. No internal HR/finance/projects/Builder access.

All three resolve back to the same TORO governance and source-authority system.

## 5. Canonical objects

Do not create channel-specific copies.

| Need | Canonical object |
| --- | --- |
| General internal work | `operations.tasks` |
| Project | `operations.projects` |
| Maintenance incident/history | `facilities.maintenance_events` |
| Executive decision | `operations.executive_decisions` |
| Approval | canonical approval request |
| Team communication | `team_messages` / governed Comms state |
| Notifications | `notifications` |
| Action evidence | action receipt / audit evidence |
| Builder/Codex work | canonical task linked to TORO Builder/project, then execution evidence |
| Conversation state | canonical channel/session state; never a second business database |

## 6. Action model

### Read / explain / recommend
Allowed when identity, scope, source freshness and capability permit.

### Prepare
TORO may prepare task/action/configuration payloads without external impact.

### Internal low-risk writes
Examples: create an internal task, maintenance work item or project follow-up.

These require:
- authenticated/resolved identity;
- correct organization;
- role/capability permission;
- idempotency key;
- explicit user action or an earned bounded-autonomy workflow;
- canonical object + source metadata;
- observable result.

### Builder / Codex
WhatsApp must not expose raw host shell or unrestricted Codex execution.

Reuse the verified native OpenClaw Codex/background-task capabilities when the host audit confirms them. The normal owner/team DM stays routed to TORO. Codex is a governed worker; direct coding conversation requires an explicit temporary mode, and persistent ACP binding belongs only to a dedicated coding conversation. Sender-scoped OpenClaw tool policy and DM isolation add defense in depth; TORO identity, scope and current roles remain the authorization authority. The existing local `toro-openclaw-integration` is the transport implementation to inspect, not a reason to create a parallel adapter.

The authenticated `POST /api/brain/internal-work` path is a backend foundation for task intake. The actual WhatsApp bridge, channel identity and completion receipt still require direct end-to-end proof.

Flow:

```
WhatsApp instruction
 -> TORO Builder task
 -> policy/approval when required
 -> trusted Builder worker / Codex session
 -> branch/PR/preview
 -> tests/verification
 -> evidence + status
 -> WhatsApp update
```

### High-risk
Money movement, reservation mutation, payroll approval/payment, legal commitments, permissions/secrets, destructive actions and material production changes remain gated.

## 7. Channel identity

Do not trust display names or phone text as authorization.

Required channel pairing model:
- OpenClaw authenticates as a known TORO channel runtime;
- sender/account identity is normalized;
- sender is matched only to an explicitly verified TORO identity binding;
- the binding resolves user + organization scope;
- every action re-evaluates current roles/permissions;
- unknown/unpaired senders fail closed or remain guest-safe.

No reusable founder credential is stored in WhatsApp/OpenClaw.

## 8. Conversation continuity

State should preserve:
- logical TORO session;
- active organization;
- current menu/workflow;
- active project/task focus;
- pending approval;
- last useful continuation;
- Human Layer config version/hash;
- replay/idempotency markers.

“continuar”, “1”, “dale”, voice and normal sentences may continue the current workflow only when session/identity/context remain safe.

## 9. Initial controlled-write slice

Implemented in branch `toro-whatsapp-same-brain-intake-20260923`:

`POST /api/brain/internal-work`

Initial actions:
- `task.create`
- `maintenance.task`
- `builder.task`
- `project.followup`

Properties:
- authenticated TORO organization context;
- first slice limited to ADMIN/GERENCIA, matching current `operations.tasks` RLS;
- canonical write to `operations.tasks`;
- project link resolved from canonical `operations.projects`;
- unique `task_key` derived from caller idempotency key;
- replay returns the existing task;
- maintenance routes to RICO / TORO Operations;
- Builder routes to SOBRESITO/CODEX / TORO Builder;
- no reservation, money, secret, permission, deploy or external-channel write.

This slice is a shared execution primitive. It is **not yet proof that the live OpenClaw host consumes it**.

## 10. Required next runtime slice

The steps below are acceptance dependencies, not an instruction to recreate tables or a bridge. The 22/10 readback already finds `integrations.communication_channel_bindings`, `communication_channel_sessions` and `communication_channel_receipts`, all with RLS enabled. Reconcile existing schema/code first. One OpenClaw binding is active with `verification_status=verified` and `send_enabled=true`, but has no sync timestamp; these tables contain zero sessions/receipts. This is registry/runtime drift to investigate, not proof of sending, sender identity or current health. Do not flip flags merely to match the desired story.

The [current official WhatsApp channel](https://docs.openclaw.ai/channels/whatsapp) uses a linked WhatsApp Web/Baileys session. That is not evidence that TORO has WhatsApp Business Cloud API or a Twilio channel. Discover the installed provider/plugin/version and account capabilities before choosing transport, backfill, webhook or retention behavior. Existing authorized account capture and ingestion policy in TORO Comms §19 remains separate from sender admission and send/business-write authority; this clarification does not reduce that capture scope or widen send permissions.

1. Implement channel-runtime authentication.
2. Implement verified channel identity bindings.
3. Reuse canonical context/permission logic for channel actors.
4. Make OpenClaw call the same action/intake contract.
5. Persist bounded cross-restart conversation state in TORO.
6. Add action receipts and outbound completion notifications.
7. Connect Builder queue to a trusted Codex worker with approval and verification gates.
8. Run OpenClaw runtime/security/replay QA.
9. Promote capabilities only after real end-to-end evidence.

## 11. Definition of done

WhatsApp parity is not “done” because messages can be sent.

It is done when a verified owner can, from WhatsApp:

1. ask for current project status and receive canonical current data;
2. say “créame una tarea…” and exactly one canonical task is created;
3. report maintenance and get a canonical work item with later closure evidence;
4. say “dale esto a Codex” and get a governed Builder task, execution status, PR/preview/test evidence and final result;
5. say “continúa” after reconnect and resume the correct safe workflow;
6. receive completion/blocker notifications without duplicate side effects;
7. see the same task/project state immediately in Portal;
8. prove no cross-user or personal/work leakage;
9. pass OpenClaw security, replay, identity and recovery gates.

For each proof, preserve account alias, actor/scope, capability, source freshness, idempotency/correlation, canonical object key, destination receipt and observed time without raw transcripts/phones/credentials in public evidence. Test duplicate/reconnect/timeout/revocation/cross-user/cross-organization cases with authorized synthetic/internal traffic before real guests. Acknowledgement of receipt, provider delivery, canonical write and business completion are distinct outcomes. Existing Control Plane/Comms owns retries, receipts, notifications and recovery; no independent WhatsApp queue/scheduler is added.

Until those pass, status remains **PARTIAL / CHANNEL RUNTIME UNVERIFIED**.


## 12. Explicit roles, onboarding and twenty hotel workflow refinements — 2026-10-24

**Owner decision:** canonical identity must not automatically assign, broaden or substitute a role. An authorized owner/administrator explicitly grants the applicable role and scope through the existing governed process. Channel recognition uses that approved binding. Onboarding explains the system and the person's existing authorized functions; it never grants access, infers a job from a name or upgrades the user for completing steps. Optional personalization does not become authority.

**CURRENT:** the role-aware restartable onboarding surface already exists; persistent cross-channel progress and live WhatsApp consumption remain unverified. The owner accepted the shared-Brain design with the automatic-role proposal removed. This section updates the subordinate design only. It does not activate permissions, messages, integrations, reservations or accounting writes.

**New blockers verified in this investigation:** PR206 (machine identity bridge), PR210 (durable channel continuity) and PR348 (channel-scoped diagnostics) are existing implementation lanes; reconcile them rather than recreating their code. At the 24/10 readback, PR206 and PR210 were open/draft and conflicted with main. PR348 was reconciled separately; its code/CI status is distinct from real host acceptance. Current PMS projection and breakfast gaps still require source/runtime work. A safe current-reservation view with no rows is not evidence of an empty hotel.

The following twenty refinements are **TARGET acceptance requirements**, not twenty live implementations. Reuse issue209 and the existing Identity, Comms, Operations, Revenue, Finance, Tools and Control Plane objects. No independent backlog, schema, gateway, writer or scheduler is created.

| ID | Outcome | Required behavior | Authority/dependency | Acceptance |
|---|---|---|---|---|
| W24-01 | Onboarding del rol autorizado | Explicar en uno o dos turnos qué puede consultar, pedir y ejecutar la persona; máximo tres opciones más texto libre. | Identidad y rol ya autorizados; completar el onboarding nunca crea permisos. | Una persona sin rol no obtiene funciones internas al terminar o reiniciar la explicación. |
| W24-02 | Ayuda al momento de trabajar | Mostrar ejemplos y atajos de la tarea actual; conservar Ayuda, Inicio, Atrás y Saltar cuando sea opcional. | Reutilizar manifiesto y menús actuales; no crear otro bot ni otro registro de roles. | El usuario llega a una lectura permitida sin completar preferencias opcionales. |
| W24-03 | Continuidad de la explicación | Conservar referencia y etapa permitida del onboarding entre WhatsApp y Portal dentro del estado canónico de canal. | Reutilizar PR210/objetos actuales tras reconciliar esquema; no usar progreso de formación como identidad. | Reconexión reanuda el paso correcto sin duplicar persona, tarea o autorización. |
| W24-04 | Causa precisa del bloqueo | Distinguir sin permiso, sin vínculo, sin datos, datos vencidos, herramienta no disponible, comando incompatible y resultado incierto. | Usar estados/evidencia existentes; no convertir una denegación en otra ruta para eludirla. | Cada fallo da una causa comprobada, responsable funcional y siguiente paso seguro. |
| W24-05 | Cero frente a desconocido | Separar consulta completa sin resultados de tabla vacía, lectura fallida y cobertura parcial. | Para afirmar cero exigir lectura exitosa, ámbito y cobertura acreditados. | Hotel sin llegadas no se confunde con PMS inaccesible; desayuno desconocido no se convierte en no incluido. |
| W24-06 | Limpieza confirmada por Kross | Aceptar la marca vigente de limpieza terminada en Kross como evidencia operativa. | Leer habitación/estado/corte correctos; evitar pedir confirmación humana duplicada. | La marca actual de Kross cierra limpieza sin repetir la pregunta al equipo. |
| W24-07 | Preparación completa de habitación | Separar limpieza terminada, inspección, bloqueo de mantenimiento y lista para huésped. | Kross conserva autoridad operativa de limpieza; las demás dimensiones conservan sus fuentes. | Limpia con avería abierta no se anuncia lista; no exigir inspección inexistente por costumbre. |
| W24-08 | Desayuno trazable | Separar derecho incluido, pedido, extras, preparado y entregado por fecha local y habitación. | Kross para condiciones contratadas; flujo operativo de cocina/recepción para el servicio. | Una misma orden se ve desde cocina y recepción sin doble conteo ni pérdida de cambios. |
| W24-09 | Mantenimiento que protege llegadas | Relacionar incidencia, unidad/activo, llegada afectada, prioridad, responsable y evidencia de cierre. | Reutilizar mantenimiento/tareas existentes y estado actual de la unidad; responsable propuesto hasta aceptación. | Un incidente que afecta una llegada se mantiene visible hasta su resolución comprobada. |
| W24-10 | Entrega de turno | Continuar los casos pendientes con el mismo ID, compromiso, evidencia y siguiente responsable. | Reutilizar casos/tareas/Comms; no copiar hilos privados completos ni crear otra lista de turno. | Cambio de turno no pierde promesas ni abre duplicados. |
| W24-11 | Asignación con aceptación | Distinguir asignado, avisado, entregado, aceptado y resuelto. | Receipt de transporte distinto del acuse humano y del trabajo físico. | Silencio del responsable no se presenta como aceptación o reparación. |
| W24-12 | Alertas agrupadas | Un aviso por incidente material, actualización sobre el mismo caso y escalamiento según prioridad. | Reutilizar Owner Attention y reportes/horarios vigentes; no crear scheduler. | Una repetición del mismo fallo no produce avisos nuevos sin cambio de impacto o estado. |
| W24-13 | Recordatorios durables | Relacionar fecha/hora America/Costa_Rica, dueño, caso y destino autorizado; permitir cancelar. | Cola/Control Plane actual, autorización y dedupe; no nueva agenda paralela. | Reinicio no pierde el recordatorio ni dispara dos avisos. |
| W24-14 | Reserva comprobada | Conservar resumen de fechas/unidad/personas/total/condiciones; revalidar y recuperar ID nativo tras crear. | Escritura solo tras habilitación del workflow y autorización aplicable; API Kross pagada sigue pausada. | Timeout se reconcilia antes de repetir; villa y habitaciones no se venden doble. |
| W24-15 | Pagos ligados a reserva | Relacionar movimiento PMS, reserva, huésped/unidad pertinentes y soporte, manteniendo moneda original. | Pago registrado en Kross, liquidación bancaria y asiento Alegra son estados distintos; Writer conserva su gate. | No se declara cobrado/conciliado por un texto o por crear una reserva. |
| W24-16 | Cierre con faltantes concretos | Reutilizar el cierre existente y pedir solo vouchers, conteo físico o soportes todavía faltantes. | Por fecha/cuenta/terminal/moneda; no reabrir diferencias ya decididas sin evidencia nueva. | El equipo recibe una lista breve de faltantes y el cierre solo termina con evidencia. |
| W24-17 | Inventario y compras | Registrar consumo/incidencia, mínimo, existencia comprobada y solicitud de reposición. | Una solicitud no compra ni paga; reutilizar activos/inventario/tareas. | La misma necesidad no genera pedidos duplicados ni stock inventado. |
| W24-18 | Experiencias y proveedores | Conservar una solicitud entre oferta, aceptación, proveedor, reserva y cumplimiento. | Disponibilidad, precio/moneda y condiciones vigentes; no confundir venta hotelera con onboarding de otro negocio. | Pago, confirmación de proveedor y servicio entregado se verifican por separado. |
| W24-19 | Seguimiento al huésped | Vincular consultas, promesas, incidencias y feedback durante la estancia al caso permitido. | Usar canal/consentimiento y ámbito del huésped; sin campañas ni mensajes nuevos por este diseño. | Una queja conserva contexto y responsable sin exponer otros huéspedes o información interna. |
| W24-20 | Capacidad visible con evidencia | Mostrar por función si está preparada, probada, desplegada y verificada, con fuente y próxima acción. | Compartir estados Portal/WhatsApp y reutilizar releases/receipts actuales. | Un PR verde, flag connected o aceptación de plataforma no se presenta como función operativa. |

**Execution order:** prove authorized sender -> current read -> one canonical task -> receipt -> same Portal object; then staff/onboarding and breakfasts; then a separately enabled reservation pilot. Preserve approved roles, channel boundaries, existing Kross/Alegra gates and recovery. Functional owners remain Identity/People for onboarding, RICO for operations, TERE/Revenue for guest/services, FIONA for money evidence and SOBRESITO for integration proof; human assignments require their own acknowledgement.

**Verification state:** adding these requirements proves design coverage only. Mark an individual refinement runtime-verified only after its named acceptance runs on the actual authorized channel, with source/cutoff, actor/scope, object ID and receipt. The improvement count must not be inferred from test counts.


## 13. Informational PMS snapshots — owner decision 2026-10-24

The owner accepts source data up to **60 minutes old** for informational hotel operations while the API is unavailable. This supersedes the earlier live-only wording for such reads; it does not label a snapshot live or redefine `operations.current_reservations_safe`.

- Reuse `operations.reservations`, existing import/source evidence and the same identity/capability router. No second mirror, new scheduler or grant is created.
- Age is measured from the actual source cutoff (`snapshot_as_of`), never the agent reply, import time or latest timestamp elsewhere in a table. The inclusive ceiling is 60 minutes; future/invalid dates do not pass. Refreshing an old copy does not renew its source age.
- Authorized informational reads may use a verified export/browser artifact without `source_is_live=true`. Validate source/tenant/property, identifiers, dates and the fields actually used. A review flag is disclosed, not silently promoted to verified; conflict/invalid rows remain excluded. Unknown status/room/breakfast stays unknown.
- Show “datos actualizados a…” and disclose partial coverage, excluded rows or truncation. Positive observed counts are not a certified full-property total; zero requires proved coverage before “no hay llegadas”. Scheduled reservation dates are not evidence of physical check-in or breakfast delivery.
- Existing permissions still apply. The initial implementation may remain manager-only until staff permissions are verified. A phone binding/onboarding never grants that role.
- Preserve purpose-specific revalidation for prices, availability, reservation creation/modification, payments and other effects. This informational policy never authorizes an external write.
- Target acquisition cadence is hourly through the existing authorized source/worker. It is not installed by this decision, and the paid Kross API remains paused. A copy older than 60 minutes is labelled old; current totals are unknown until refreshed.
- The shared read provider and channel operation belong to existing PR206/#209. Register the tool in the actual OpenClaw runtime only after configuration/version review. Portal session RPC has no reservation contract yet; do not silently downgrade it into privileged/direct access or expose another public route.

Acceptance: non-live at59min and exactly60min admitted;60min+1ms rejected for current use; old source with recent sync stays old; future/malformed cutoff rejected; org/property and role denial preserved; duplicates/conflicts do not count twice; partial/missing/empty sources do not imply hotel-wide zero; source time/coverage preserved across WhatsApp and supported Portal consumption. Code tests and policy adoption do not prove acquisition, deployment or delivery.
