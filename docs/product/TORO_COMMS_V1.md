# TORO Comms v1 — Communication & Coordination Contract

**Status:** CURRENT PRODUCT SPEC
**Date:** 2026-09-28
**Subsystem:** TORO Comms
**Primary surfaces:** WhatsApp/OpenClaw, WeSpeak, Instagram, Facebook/Messenger, email, website, review surfaces, TORO Portal
**Canonical runtime truth:** Supabase
**External channel rule:** channels transport conversation; they do not own business truth.

## 1. Purpose

TORO Comms turns conversations into governed coordination.

It must:
- receive or ingest communication from supported channels;
- resolve the human, organization and privacy context;
- classify intent and risk;
- route reasoning to TORO specialists;
- convert actionable communication into canonical tasks/incidents/handoffs/decisions/approvals;
- return concise responses through the right channel;
- preserve evidence and delivery state;
- prevent important work from disappearing inside chat.

TORO Comms is not a replacement for WhatsApp, email or Slack. It is the governed communication layer behind them.

## 2. One visible TORO

Normal users interact with **TORO**.

Specialist routing stays internal:
- TORO TERE — guests, sales, concierge, lifecycle;
- TORO RICO — maintenance, housekeeping, laundry, operations;
- TORO FIONA — finance/admin/HR-sensitive workflows;
- TORO SKY — growth, experiences, providers and commercial opportunities;
- TORO SOBRESITO — systems, integrations and technical incidents.

A user should not need to choose an agent before asking for help.


## 2A. First-contact simplicity

When TORO or TERE speaks with a customer/prospect for the first time, the experience must feel simpler than the machinery behind it.

Default:
- answer the immediate need first;
- use plain language;
- do not explain agents, modules, APIs, data models or orchestration;
- ask only one material question at a time when possible;
- offer one easy next step;
- show no more than 1–3 choices when choices help.

Preferred feeling:
**“Dime qué necesitas; yo te ayudo a resolverlo.”**

TORO/TERE may invite creative requests:
**“Si no ves lo que necesitas, pídemelo igual.”**

If the capability does not exist, TORO must say so simply, offer the nearest safe path and register the request as product signal. It must never fake a capability or completed action.

## 3. Current verified foundation

Reuse existing canonical data:
- `public.team_messages`;
- `public.team_message_read_states`;
- `public.notifications`;
- `operations.tasks`;
- `facilities.maintenance_events`;
- `operations.executive_decisions`;
- `public.approval_requests`;
- `operations.guest_message_templates`;
- `operations.guests` / stays/reservations context;
- `public.audit_logs`.

Current message channels already represented in RLS include:
- `general`;
- `operacion`;
- `rrhh`;
- `dm`.

These are a usable seed, not the final channel model.

## 4. Current runtime status

### WeSpeak

Canonical registry status: **confirmed active**.

Role:
- guest communication/runtime surface;
- TERE configuration and governed hotel truth remain in TORO/Supabase;
- no separate TERE backend should be created.

### OpenClaw

Canonical registry status: **needs audit / configured-unverified**.

Role:
- potential WhatsApp gateway/orchestration runtime;
- may transport guest/internal communication;
- must never become a second TORO brain or source of business truth.

Direct runtime verification is still required before TORO marks it healthy/live.

Required gate:
1. channel/account identity;
2. session isolation;
3. group/direct allow-deny policy;
4. heartbeat and reconnect behavior;
5. replay/idempotency behavior;
6. redacted logs;
7. governed read path into TORO data;
8. Kross live-authority handoff;
9. human escalation;
10. tool/action ceilings.

Historical evidence from older TORO repositories does not prove the current OpenClaw runtime.

## 5. Communication lanes

| TORO lane | Primary use | Specialist route | Canonical output |
| --- | --- | --- | --- |
| Guest Booking | inquiry, direct-sale support | TORO TERE | reply draft, lead/handoff |
| Guest Arrival | arrival/check-in questions | TORO TERE + TORO RICO | reply + operational handoff |
| In-Stay Support | room/cleaning/maintenance request | TORO RICO + TORO TERE | incident/task + acknowledgement |
| Complaint | complaint/reputation escalation | TORO TERE + TORO Core | escalation/decision + reply |
| Team Handoff | shift/department handover | TORO Operations | task/handoff/brief |
| Maintenance | equipment/room/property issue | TORO RICO | maintenance_event |
| HR/Admin | employee/HR/private admin | TORO FIONA / TORO People | private request/task |
| Finance | invoice/payment/admin evidence | TORO FIONA | finance workflow/validation |
| Provider | tours/wellness/service provider | TORO SKY | provider task/validation |
| Social Lead | social inbox/lead | TORO TERE + TORO Growth | lead/handoff |
| Emergency | urgent safety/operational escalation | TORO Core + human | immediate escalation + minimal log |
| Systems | connector/access/deployment issue | TORO SOBRESITO | systems incident/task |


## 5A. Customer communication = one lifecycle, many channels

For the hospitality proving ground, TORO Comms owns the governed omnichannel communication fabric while **TORO TERE** owns guest/customer-facing judgment, sales fit and relationship continuity.

WeSpeak is a runtime/channel surface. It does not become the owner of customer truth, lifecycle state, pricing, permissions or TERE identity.

Target customer-facing channels:
- WhatsApp;
- Instagram Direct;
- Facebook/Messenger;
- email;
- website chat/forms;
- approved review/reputation surfaces;
- future channels only when a real workflow justifies them.

The customer should experience one continuous relationship even when the transport changes.

Canonical flow:

message/contact -> identity/customer context -> lifecycle stage -> intent -> authority -> action/workflow -> response -> follow-up -> evidence -> next stage

Do not create one lead, task or customer history per channel.

### Customer lifecycle coverage

TORO Comms + TERE should be able to coordinate, according to permissions and authoritative sources:
- first inquiry;
- qualification;
- recommendation;
- quotation;
- reservation/purchase assistance;
- unanswered-lead follow-up;
- pre-arrival/pre-service messages;
- in-stay/in-service assistance;
- complaints/service recovery;
- upsell/cross-sell;
- payment reminders and collections communication;
- post-stay/post-purchase follow-up;
- review request;
- review-response preparation/publication where authorized;
- retention/return/referral;
- reactivation campaigns where consent/policy allows.

### Ownership boundaries

- **TERE:** customer-facing reasoning, tone, fit, conversation and next-step conversion in hospitality.
- **TORO Comms:** channel normalization, routing, continuity, delivery, follow-up state and deduplication.
- **TORO Revenue / live PMS authority:** price, availability, booking truth.
- **TORO FIONA / finance authority:** amount due, payment status, invoices and collection truth.
- **TORO Growth/SKY:** campaigns, reputation strategy, retention and growth experiments.
- **TORO Operations/RICO:** physical/service fulfillment and operational proof.

The speaking agent may be TERE while the underlying fact/action authority belongs to another subsystem.

### Follow-up and automation rule

Automated messages must be triggered from canonical lifecycle/workflow state, not from isolated channel timers when that would create duplicate or contradictory communication.

Before sending a follow-up:
- resolve whether the customer already replied elsewhere;
- resolve whether the underlying need is already closed;
- resolve whether payment/reservation state changed;
- avoid duplicate cross-channel pressure;
- respect consent, quiet periods and escalation rules.

## 6. Internal rooms

Dreamcatcher pilot should begin with a small set of governed rooms:

- **TORO DreamTeam** — general team information;
- **TORO Operación** — live hotel operation and handoffs;
- **TORO Recepción** — guest-facing coordination;
- **TORO Mantenimiento** — maintenance/housekeeping operational work;
- **TORO Gerencia** — decisions/exceptions;
- **TORO RRHH** — restricted private work.

Room names are logical TORO rooms. They may map to WhatsApp groups, Portal rooms or other transports.

Do not create a separate database or workflow engine per room.

## 7. Message-to-action pipeline

Every message follows:

`message -> identity/context -> privacy -> intent -> authority -> risk -> route -> action -> evidence -> response -> follow-up`

Possible outcomes:
- answer only;
- no action needed;
- task;
- maintenance incident;
- handoff;
- approval request;
- executive decision;
- guest reply draft;
- provider validation;
- system incident;
- learning signal;
- human escalation.

### Memory rule

A communication never writes durable memory directly.

Allowed:
`message -> learning signal -> candidate memory -> confirmation/verification -> durable User Vault or governed knowledge`

Blocked:
`message -> permanent memory`


## 7A. Conversational navigation protocol

TORO Comms resolves quick navigation without forcing users into a chatbot tree.

Supported in each active menu context:
- number;
- canonical option word;
- common alias;
- natural-language equivalent.

Universal:
- 0 / menú / inicio -> home;
- 9 / atrás -> previous context;
- + / más -> secondary options;
- ayuda -> contextual help.

Menu numbers are valid only inside the current menu/session state. Consequential actions must never execute from a stale numeric shortcut after material context changes.

After a useful response, suggest 1–3 likely next actions. Do not repeat the entire menu unnecessarily.

Where buttons/quick replies exist, use them. Where they do not, render compact numbered choices.

Canonical role/lifecycle profiles:
- data/toro_conversational_menu_profiles_v1.json

## 8. Personal/work firewall

TORO Comms must consume the canonical `ToroResolvedContext`.

### Personal mode
May use:
- personal User Vault;
- personal tool connections;
- explicitly shared data;
- system metadata needed for safety.

Must not silently inject employer data unless user explicitly switches/requests organization context.

### Organization mode
May use:
- work-private;
- organization data allowed by role;
- shared work context;
- organization tools.

Must **not** automatically include personal User Vault data.

ADMIN/RRHH/GERENCIA roles never unlock personal scope.

## 9. Group behavior

Recommended default for internal WhatsApp/OpenClaw pilot:
- explicit allowlist of approved groups;
- mention/activation required by default;
- group-specific session/context;
- no shared DM session across users;
- only governed tools available;
- no high-risk action from group chat without approval;
- conversation history is context, not authoritative truth.

TORO may observe permitted group context for continuity, but should only persist structured business outcomes and minimal evidence needed for audit.

## 10. DM behavior

Every direct conversation is isolated by human identity and channel/account.

### Personal inbox is narrower than privileged RLS

The current DreamTeam/Supabase policies intentionally allow ADMIN/RRHH/GERENCIA to inspect some DMs for governed HR/management workflows.

That broader authorization must **not** automatically populate a person's normal TORO inbox.

Normal `Mi inbox` projection shows only:
- DMs sent by the current user;
- DMs addressed to the current user's linked employee identity.

Cross-user privileged message review, if retained, belongs in a separate explicit/audited HR or governance surface with purpose, authorization and evidence.

Database permission is a ceiling, not a reason to expose every permitted record in every UI.

DM must resolve:
- authenticated/linked user when possible;
- personal vs organization context;
- active membership for organization requests;
- role/tool permissions;
- data scope.

Unknown/unlinked sender:
- may receive public-safe assistance;
- cannot inherit employee permissions;
- cannot be linked automatically by name or phone alone;
- must use an approved identity-linking flow.

## 11. Data model evolution

### Reuse now
- `team_messages`;
- `team_message_read_states`;
- `notifications`.

### Add only when implementation requires it

#### `communication_channels`
Logical TORO rooms/direct spaces.

#### `channel_memberships`
Who may see/participate in a logical room.

#### `external_channel_bindings`
Maps TORO logical channel to:
- transport;
- external account;
- external group/thread identifier;
- status;
- health/freshness;
- routing policy.

Never store credentials here.

#### `message_object_links`
Links a source message to canonical output:
- task;
- incident;
- decision;
- approval;
- guest interaction;
- validation;
- learning signal.

#### `message_delivery_events`
Minimal delivery/attempt/acknowledgement evidence.

Do not create these tables until current `team_messages` limitations are proven by implementation needs.

## 12. TORO Comms dashboard

Owner/manager view should prioritize exceptions, not chat volume.

Primary cards:
1. **Necesita respuesta**
2. **Handoffs sin confirmar**
3. **Tareas nacidas de conversación**
4. **Incidentes de huésped**
5. **Pendientes de aprobación**
6. **Mensajes fallidos / canal degradado**
7. **SLA vencido**
8. **Grupos con ruido/repetición automatizable**
9. **Canales y runtimes**
10. **Qué resolvió TORO sin intervención**

Employee view:
- unread/relevant messages;
- mentions;
- own handoffs;
- tasks created from conversations;
- direct TORO entry;
- notification preferences.

## 13. Notification rules

Notifications are exceptions, not a duplicate task list.

Notify when:
- human response required;
- handoff unacknowledged;
- SLA breach;
- guest impact;
- approval needed;
- emergency;
- channel/runtime failure;
- important task state changed.

Do not notify because data merely exists.

### Owner Attention projection

Canonical contract:
- `operations.knowledge_items/owner_attention_comms_payflow_v1`
- `operations.knowledge_items/payment_inbox_map_2026_09_v1`
- `docs/product/TORO_OWNER_ATTENTION_PAYFLOW_V1.md`

Owner Attention is one exception queue shared by Portal Today/Attention, Money/PayFlow and WhatsApp/OpenClaw.

Typical critical/high triggers:
- payment declined or business-critical service at suspension risk;
- legal/tax deadline;
- in-house guest emergency;
- booking/channel response deadline under 24 hours;
- invoice due soon and unreconciled;
- duplicate charge/unreconciled collection claim;
- new contract/material commercial terms;
- payment proof requiring validation;
- provider waiting on owner/manager decision.

Routine successful receipts and informational notices belong to evidence/digest unless another rule makes them actionable.

## 14. OpenClaw integration boundary

OpenClaw is a **channel gateway**.

It may:
- receive supported channel events;
- maintain channel/session transport context;
- forward normalized events to TORO;
- send TORO-approved/allowed outputs;
- perform low-risk allowed actions when the shared TORO policy engine permits them.

It may not independently:
- define employee identity;
- own long-term business memory;
- redefine source authority;
- grant permissions;
- bypass TORO Governance;
- treat conversation as completed work without canonical evidence.

## 15. WeSpeak integration boundary

WeSpeak remains an active specialist guest-communication runtime.

### Voice

Vendor roadmap evidence dated 2026-09-28 reports **Atender llamadas de Voz con IA = Completed**. This proves vendor feature availability only. Dreamcatcher activation remains unverified until account/runtime evidence passes pricing, number, inbound/outbound scope, consent/recording, hours, languages, handoff/emergency, transcript retention/privacy and action-ceiling QA.

Canonical task: `wespeak_voice_activation_20260928`.

Any voice call that becomes actionable must create/resolve the same TORO Comms follow-up. No parallel voice inbox.

### Payments

Current email evidence proves that WeSpeak handles many payment-information requests, SINPE instructions and payment-proof handoffs. It does **not** prove a native payment-processing product is enabled for Dreamcatcher.

Canonical task: `wespeak_payments_capability_audit_20260928`.

If enabled later, WeSpeak is an interaction surface only. Processor/bank/acquirer/Kross/Alegra evidence remains payment authority; money movement/refunds remain governed.

TORO owns:
- governed hotel facts;
- TERE behavior/configuration;
- source authority;
- templates;
- permissions;
- evidence;
- escalation.

Avoid parallel TERE backends.

## 16. Legacy communication plan disposition

Useful legacy concepts retained:
- communication lanes;
- privacy-first routing;
- guest draft/review;
- message-to-task conversion;
- emergency escalation;
- redaction;
- channel owner/purpose mapping.

Legacy concepts superseded:
- automatic "save as memory";
- localStorage as operational persistence;
- agent-specific communication silos;
- Airtable as primary communication state;
- channel-specific permission models;
- treating historical OpenClaw/WhatsApp evidence as current health proof.

## 17. TORO Comms v1 rollout

### P0
1. Audit real OpenClaw runtime.
2. Confirm WeSpeak current runtime/admin parity.
3. Resolve TORO Identity for pilot staff.
4. Define approved internal WhatsApp groups and owners.
5. Freeze privacy/session policy.

### P1
6. Bind 2–3 internal groups to logical TORO rooms.
7. Implement message -> task/incident/handoff.
8. Add acknowledgement and follow-up.
9. Route employee DMs through TORO context resolver.

### P2
10. Portal inbox/rooms.
11. Channel-health dashboard.
12. Guest/runtime handoff integration.
13. notification preferences/digests.

### P3
14. Add optional Slack/Teams/email transports only when a real customer workflow needs them.

## 18. Definition of done

TORO Comms v1 is complete when:
- internal WhatsApp/group communication can create governed work without losing identity/permissions;
- employee DMs are isolated;
- personal and work scopes never bleed automatically;
- important handoffs have owner/status/acknowledgement;
- actionable messages become canonical objects;
- no durable memory is created directly from chat;
- OpenClaw and WeSpeak health/status are visible;
- channel outage degrades safely;
- users experience one TORO across WhatsApp and Portal.

## 19. Captura integral de WhatsApp de recepción y del propietario — directiva 13/10/2026 CR

**Parent:** Plan General único; Same-Brain; User Vault; issues existentes #122 (identidad), #170 (lector) y #209 (journal, continuidad y entrega). **Decisión de Mauricio:** incorporar lectura y recopilación de los dos números que indicó, integrar lo útil en toda la operación TORO y verificar los respaldos; aquello no comprobado queda planeado con dueño y prueba. Es autorización de alcance para captura/integración gobernada, no prueba de conexión ni permiso para responder a huéspedes, mover dinero o publicar conversaciones.

### 19.1. Dos cuentas, una plataforma, ámbitos explícitos

| Alias del canal | Identificador público permitido | Ámbito/dueño | Uso |
| --- | --- | --- | --- |
| `dreamcatcher_reception_whatsapp` | recepción, terminación 4004 | Dreamcatcher; Gerencia + Recepción | Conversaciones operativas, solicitudes, ventas, incidencias, proveedores, evidencia y pendientes. |
| `mauricio_personal_whatsapp` | propietario, terminación 3792 | Mauricio; TORO Personal / User Vault | Contexto, compromisos, documentos y proyectos personales; acceso privado por defecto. |

Números E.164 completos, provider account IDs, chat/group IDs y bindings personales se resuelven exclusivamente en registro protegido aprobado, nunca en este repo público, fixtures, logs generales o PRs. La declaración del propietario determina el endpoint deseado; la identidad de cada cuenta todavía requiere comprobación de control, proveedor, sesión y canonical actor. Distinguir **cuenta enlazada que se observa**, **remitente de un mensaje** y **destino de una alerta**: permitir mensajes desde el número personal hacia TORO no conecta ni respalda todo su WhatsApp personal.

Reusar los registros y adapters reales. `integrations.communication_channel_bindings` existe con RLS, pero es un registro organizacional (org_id obligatorio); no insertar el archivo personal como contenido de la empresa para eludir esa limitación. Resolver el modelo privado mediante Identity/User Vault vigente, comprobar sus RLS y solo preparar una extensión mínima si la inspección demuestra que falta. Las tablas nominales user_tool_connections/user_consents/user_memory_items/channel_identity_bindings/user_channel_identities no aparecieron en la inspección de este proyecto; esto no acredita que no exista otro modelo de identidad, ni autoriza crear esas cinco tablas.

La cuenta de recepción compartida identifica el canal empresarial, no al empleado que escribió. Conservar operador identificado solo si el proveedor/turno aporta evidencia; de lo contrario actor=operador_no_identificado. Ni un nombre de perfil ni el número de recepción confieren permiso administrativo. Un huésped/proveedor no adquiere capacidad de mandar al sistema por aparecer en ese inbox.

### 19.2. CURRENT: evidencia limitada y contradicción preservada

Lectura 13/10/2026 CR de Supabase canónico Dreamcatcher:
- Existe un binding WhatsApp/openclaw de tipo empresarial `system`, marcado connected/read_enabled/send_enabled/healthy/verified, pero last_sync_at=null. No coincide con ninguno de los dos endpoints solicitados. No activar esos flags en los nuevos canales por copia.
- El dependency registry conserva OpenClaw en needs_audit (auditoría 22/09 UTC), mientras WeSpeak figura confirmed_active (06/10 UTC). Hay drift entre metadata de binding y dependencia; ninguno demuestra ingesta continua o recuperación real.
- No se encontró binding WhatsApp organizacional para recepción ni para el endpoint personal solicitado. El registro empresarial no agota la búsqueda de conexiones personales privadas.
- La revisión contractual/código encontró Same-Brain, TORO Comms, el runbook y `src/features/openclaw/runtime-evidence.ts`: ese evaluator retorna EVIDENCE_PACKET_COMPLETE_UNVERIFIED incluso con paquete completo; no certifica runtime live.
- Este entorno no expone host/sesión OpenClaw ni conector directo WhatsApp; el ejecutable no está disponible aquí. No se leyeron mensajes, no se enrolaron cuentas, no se enviaron pruebas ni se verificaron backups/restauración.

Conservar el valor original y registrar la discrepancia; no degradar o promover registros canónicos por inferencia. WeSpeak activo como proveedor/runtime no prueba que tenga conectado recepción; su correo de alertas tampoco equivale a todas las conversaciones.

### 19.3. Camino de conexión y cobertura

1. Inspeccionar primero el puente/worktree `toro-openclaw-integration`, runtime existente, versión/perfil y dependencia real. Para recepción, comprobar si ya existe transporte soportado del proveedor o API/webhook autorizado que entregue el alcance necesario sin interrumpir la app actual.
2. Verificar la elegibilidad y documentación del modelo elegido en la cuenta real. Coexistencia Business App/Cloud API, sincronización histórica, mensajes salientes del teléfono y grupos no se dan por disponibles. La documentación Meta de onboarding no pudo recuperarse en esta pasada: validación pendiente, sin prometer cantidad de meses o cobertura.
3. OpenClaw documenta sesiones WhatsApp Web/Baileys, cuentas múltiples, controles de remitentes/grupos y contexto histórico acotado. No es por ese motivo una API oficial de Meta ni un lector de todo el histórico. Evaluar soporte, términos y seguridad antes de habilitarlo; preferir el transporte existente verificado.
4. Para la cuenta personal, resolver perfil/identidad privados y conexión de **esa cuenta**, sin convertirla a Business, migrar el número, desvincular dispositivos o abrir acceso organizacional automáticamente.
5. Si no hay interfaz segura/completa, usar exportes autorizados por conversación como backfill acotado; guardar fecha, alcance, ausencias y adjuntos. Un export parcial no es réplica del inbox. No crear scraping persistente ni proveedor pagado nuevo para salvar el gate.

Separar estos resultados: mensajes nuevos observados, mensajes históricos disponibles, búsqueda durable y backup restaurable. Cada canal mantiene matriz de cobertura de entrantes/salientes, directos/grupos, texto/audios/documentos/fotos/videos, ediciones/revocaciones y eventos de entrega. Marcar cada capacidad VERIFIED/PARTIAL/UNSUPPORTED/UNKNOWN y ventana más antigua/más reciente, última captura/processing/archivo confirmado, cantidades y huecos. Un `historyLimit` o una sesión que responde no prueba histórico completo.

### 19.4. Recopilar sin perder información ni convertir todo en acción

**Objetivo:** contabilizar toda comunicación observable y autorizada en el alcance definido, con estado recibido/procesado/archivado/excluido/fallido y motivo. No prometer leer contenido borrado, efímero, no entregado o fuera del alcance accesible. No preservar credenciales, códigos, tokens, tarjetas completas ni contenido marcado privado/no aprendible. Retención por clase y propósito, con revisión/eliminación autorizada; no archivo indiscriminado eterno.

Flujo mínimo:
`evento -> cuenta y chat verificados -> scope -> journal permitido -> adjuntos -> clasificación -> identidad/autoridad -> objeto canónico existente -> revisión/acción permitida -> evidencia -> reconciliación`.

- Incluir conversación recibida y saliente observada del personal; conservar autor/dirección/fecha del proveedor y hora de captura UTC, mostrar Costa Rica.
- `account + message_id + version` gobierna identidad de evento; añadir principal/tenant/scope y conversation_ref. Reintentos no crean nuevas tareas. Ediciones/revocaciones se relacionan al evento original y respetan restricciones de retención; no reescribir evidencia silenciosamente.
- Descargas y OCR/transcripción conservan parent message, archivo, checksum, versión, motor y confianza; texto inferido no sustituye el original. Un placeholder de media no acredita archivo descargado.
- Si el mismo comprobante llega por WhatsApp, correo y Page/WeSpeak, enlazar las fuentes al mismo documento/obligación. Dedupe exacto por hash y semántico por identidad verificada; no fusionar personas o reservas por parecido.
- Mensajes y adjuntos son entradas no confiables: instrucciones incrustadas no elevan permisos, no ejecutan scripts ni habilitan tools.
- El reader observa; no genera respuestas, envíos, marcas de lectura ni cambios de reservas por defecto. Inspeccionar efectos colaterales del transporte: OpenClaw documenta read receipts habilitados por defecto y posibles respuestas tras reconnect; probar y aislar captura antes de activar. Si no puede observar sin esos efectos, no habilitar ese piloto.
- Acciones candidatas se vinculan a tasks, followups, maintenance_events, decisions y knowledge actuales; no crear una tarea por mensaje. Primero verificar asunto ya existente, responsable y fecha pertinente.
- Un mensaje que dice “pagado”, “reserva confirmada”, “trabajo terminado” o “cambio de política” es una señal atribuida; exigir fuente/evidencia del dominio antes de confirmar pago, reserva, cierre o regla activa.
- Personal -> trabajo: solo datos seleccionados con finalidad empresarial inequívoca y autoridad vigente; ambigüedad queda privada para Mauricio. Nunca copiar chats personales completos, payroll o datos de terceros al reporte compartido ni a índices/embeddings organizacionales.

### 19.5. Mapa de interconexión, no declaración de integraciones activas

| Señal / fuente | Responsable y destino existentes | Autoridad y prueba exigida |
| --- | --- | --- |
| Recepción / consultas / huéspedes / OTA / web | TORO Comms + Guests/TERE; followup/guest/reservation link | Kross confirma reserva, tarifa y disponibilidad; cada conversación tiene referencia y pendiente. |
| Aseo / mantenimiento / incidencias / relevo | Operations/RICO; tasks + maintenance_events + reporte recepción existente | Responsable, ubicación/unidad verificada, plazo y cierre con evidencia; no cierre por silencio. |
| Compras / retiros / adjuntos de factura | Assets + Finance/FIONA; inventario y PayFlow existentes | Recepción/consumo físico y líneas verificadas; mismo comprobante no duplica compra. |
| Pagos / SINPE / banco / acquirer | Finance/FIONA; obligaciones/evidence/reconciliation | Banco/procesador acredita dinero; Alegra conserva asiento fiscal. Captura no significa conciliación. |
| Personal / turnos / nómina | People y su modelo actual | Rol y alcance; nómina/HR restringidos, nunca todo el inbox de RRHH. |
| Experiencias / alimentación / proveedores | Growth/SKY + Operations | Proveedor confirma cupo/precio/servicio; cotización no equivale a compra confirmada. |
| Fotos / documentos / derechos | Assets/Studio; Dropbox, manifest y asignaciones existentes | Nombres humanos, identidad real, hash/linaje/ACL, clasificación y aprobación de canal según Studio 10–12. |
| Correo / Drive / Contacts / Calendar / Tasks / Keep | Comms + Tools/Data; planes Workspace/PayFlow existentes | Ingesta desde checkpoint común, relaciones reales y permisos; Calendar/Tasks son proyecciones, no otra verdad. |
| WhatsApp personal / proyectos privados | Personal/User Vault + Projects autorizados | Mauricio puede consultar; sin acceso empresarial por rol gerente y sin promoción automática. |
| Cambios de SOP / reglas / aprendizaje | Knowledge + Governance | Observed -> Candidate -> Validated -> Approved -> Active; autor/fuente/vigencia y contradicciones. |
| Pendientes/alertas / Portal / Page / WhatsApp | Owner Attention + Control Plane existentes | Una excepción/objeto; entrega solo por autorización de canal vigente, correlación y receipt; sin nueva alarma periódica. |
| GitHub / Codex / Vercel / runtime | Builder + Systems/Tools | Implementación vinculada a tarea/PR, verificaciones y health; documentación no equivale a despliegue. |

Cada integración registra expected/observed/drift, dueño, alcance, dirección, auth/scopes, última prueba, retraso, coverage, costo, backup y fallback en los registros existentes. Sin observar la ruta real, estado=UNVERIFIED o PLANNED con siguiente prueba. No “todo conectado” por listar productos.

### 19.6. Respaldo, restauración y privacidad

- Supabase conserva estado/index/journal permitido, permisos y trazabilidad; Dropbox conserva originales permitidos y exportes versionados con ACL explícitas. Portal/Airtable/Pages muestran proyecciones autorizadas, no backup universal. GitHub contiene solo contratos públicos/redactados.
- Usar carpetas/registries existentes y separar claramente archivo empresarial y archivo personal. Nunca respaldar la cuenta personal en una carpeta compartida del hotel. Verificar herencia de permisos antes de la primera copia; no crear enlaces públicos.
- Cada lote autorizado genera manifest privado: account/conversation refs, período, source/version, nº mensajes/adjuntos, exclusiones/huecos, byte sizes/checksums, objetos relacionados y checkpoint confirmado. Nombres humanos conforme Studio; IDs y teléfonos completos no van en nombres.
- No avanzar checkpoint de archivado por solo recepción. Si se confirman dos destinos, registrar etapa independiente y reconciliar los éxitos parciales; replay idempotente.
- Verificar por separado backup de Postgres y de binarios Storage/Dropbox. La existencia de proyecto, bucket, version history o carpeta no demuestra recuperación ni copia independiente. Exportar solo scope permitido, cifrar backup privado y guardar claves/credenciales en gestión de secretos, fuera de conversaciones/repos; no copiar auth directories al archivo general.
- Propuesta de piloto: incremental tras persistencia, reconciliación diaria y objetivos iniciales RPO <=24h / RTO <=4h para evidencia archivada. Son objetivos por validar con tecnología/costo, no SLA ni configuración vigente; ajustar por riesgo antes de producción. No inventar períodos legales de retención.
- Restaurar una muestra por cuenta en entorno aislado: un hilo/registro, un documento y una foto/audio disponibles; verificar hash, búsqueda, enlaces y ACL. Probar que recepción no lee privado y que restauración no genera envíos/tareas duplicados.
- Si un dato obligatorio no puede respaldarse con permiso/fidelidad, registrar faltante y owner; detener promoción dependiente. Desactivar solo el adapter nuevo ante rollback; conservar chats originales, source evidence y tareas canónicas.

### 19.7. Ejecución y métricas

| Prioridad | Dueño | Próximo paso | Terminado |
| --- | --- | --- | --- |
| P0 | Systems/Sobresito + Tools/Identity | Auditar host/cuentas, resolver drift y mapear permisos de recepción | Identidad/control del endpoint probado, alcance explícito y captura sin envíos ni recibos de lectura. |
| P0 | Comms + Data + Operations | Piloto recepción: hasta 20 eventos permitidos + 1 caso operativo | Conteos/cuadre, cero duplicados, fuente/owner claros y estado igual en TORO/recepción; consulta independiente. |
| P1 | Personal + Identity/Governance | Piloto privado Mauricio: hasta 10 eventos + 1 compromiso | Cero filtración a hotel; consulta privada verificada y denegación a recepción/otros usuarios. |
| P1 | Assets + Systems | Archivo/restauración por los dos scopes | Muestra recuperada, hashes/ACL/linaje correctos y reanudación desde checkpoint sin efectos duplicados. |
| P2 | Comms + dominios afectados | Ampliar histórico y conexiones por lotes, después del piloto | Cobertura fechada, huecos visibles, objetos conciliados y mejoras medidas. |

Reusar issues #122/#170/#209 y el Control Plane; sin segundo scheduler, journal, inbox, memoria, agente permanente ni backlog. Separar reader, procesamiento y responder. Cada lote se limita inicialmente a 12 minutos, 40 llamadas y máximo 2 reintentos transitorios seguros, checkpoint y alerta única ante bloqueo nuevo; detener el worker del lote, no matar la escucha de eventos necesaria para operar. Backpressure/cola durable autorizada y watchdog deben impedir pérdida de eventos; un timeout no mata por sí solo una herramienta remota que ignore cancelación. Lease/fencing y supervisor externo deben probarse.

Medidas: mensajes observables vs capturados/archivados (denominador y ventana definidos), adjuntos íntegros/pendientes, retraso último evento→estado TORO, duplicados, asuntos sin responsable/respuesta, conflictos de identidad/autoridad, incidentes por scope y tiempo/resultado de restore. Propuestas de piloto: 0 duplicados/0 filtraciones y 100% de eventos del lote contabilizados como procesados o excepción; no afirmar cobertura 100% de todo WhatsApp.

### Fuentes y estado del método

- Inspección de contratos/código y metadata Supabase 13/10/2026 CR: solo lectura, scope Dreamcatcher; sin mensajes privados ni secretos.
- Supabase oficial: https://supabase.com/docs/guides/platform/backups — el backup de base de datos no incluye los binarios guardados mediante Storage API; configuración/retención real del proyecto todavía no comprobadas.
- OpenClaw oficial: https://docs.openclaw.ai/channels/whatsapp — leído para cuentas, WhatsApp Web/Baileys, políticas, history y efectos de lectura/reconnect. Versión instalada y capacidad local sin verificar.
- Meta oficial: https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users — recuperación fallida; elegibilidad y límites requieren documentación vigente/soporte autorizado antes de elegir esa ruta.

### 19.8. Cierre desde la cuenta compartida de Recepción — 15/10/2026 CR

**Alcance:** solicitud del propietario reenviando el reporte de OpenClaw. P0 dentro de las lanes #122/#170/#209 y del cierre actual; desarrollo en PR #291. TORO Comms captura, Identity autoriza, Finance acepta la semántica y Systems prueba transporte/custodia; Recepción confirma corte y efectivo. Son roles funcionales, no asignaciones humanas aceptadas. No crear otro journal, cierre, ledger, calculador o plan.

**CURRENT:** reporte recibido = declaración de bloqueo, no diagnóstico independiente del host. En esta revisión el host/CLI y la cuenta compartida no están accesibles. Los helpers `src/features/openclaw/channel-ledger.ts` autorizan un hilo por usuario/organización y validan registros, pero no prueban captura de salientes, custodia, cierre persistido ni consulta multicanal. No ampliar ese guard para compartir hilos privados. Los canales consultan una proyección autorizada del objeto de cierre, no el historial personal de otro actor. Las lecturas de ChatGPT y los exportes privados disponibles no certifican acceso de OpenClaw a Kross o a otro teléfono.

#### Estado y fuentes del mismo cierre
- Reutilizar `finance.daily_close_runs/items/questions`, `finance.evidence_documents`, `finance.reconciliations`, el manifest y los receipts existentes tras inspeccionar su esquema/RLS reales. Clave lógica: organización + propiedad + fecha operativa + identidad de cierre vigente; revisión separada. Si hay varias cajas/turnos, mantener subalcance y consolidación explícitos, sin colisionar cierres legítimos ni sumar dos veces.
- Fecha operativa/corte en America/Costa_Rica, fecha de transacción y de registro, captura UTC, versión y cobertura por fuente. Evidencia tardía pertenece a la fecha comprobada; si fecha/caja/cierre es ambiguo, queda pendiente sin asignarse automáticamente a hoy.
- Persistir etapa, fuentes disponibles/faltantes, líneas, originales, preguntas, responsables/aceptación y auditoría mediante la ruta canónica. Mostrar confirmación de guardado solo con ID, revisión y readback; ni una respuesta del bot ni copiar texto acreditan persistencia. Con fuente ausente, devolver borrador útil CON PENDIENTES y el hueco exacto.
- Separar cobro registrado Kross, soporte recibido, crédito bancario, liquidación del adquirente, arqueo confirmado, cierre operativo y asiento/factura Alegra. Mantener CRC/USD y bruto/comisión/neto separados; un voucher, comprobante o total coincidente no prueba banco. Kross vigente manda en PMS; exporte/snapshot lleva fecha y nunca se presenta como LIVE.

#### Cuenta, operador, originales y duplicados
- Verificar cuenta/proveedor y salientes observables del teléfono compartido, además de los entrantes. Cuenta enlazada, remitente, operador y lector son identidades distintas. Si no hay prueba de quién escribió, conservar operador_no_identificado; el canal puede aportar evidencia permitida pero no aprobar/reabrir/contabilizar por ese nombre.
- Resolver actor y capacidades por solicitud en servidor y ámbito canónico; no por nombre visible, texto del mensaje, grupo o posesión del teléfono. Denegar cuenta desconocida, actor revocado/inactivo, propiedad ajena y lectura personal; auditar denegación minimizada. Ninguna concesión RLS o flag se activa por este contrato.
- Antes de pedir soportes, leer inventario y evidencia ya autorizados; recuperar originales existentes. Solicitar solo archivo, lote, moneda, fecha o confirmación que realmente falte. Una alerta de correo que anuncia fotos no acredita los bytes ni todos los mensajes del teléfono; no requerir de nuevo un original íntegro ya accesible.
- Por original, conservar fuente/ocurrencia, archivo/revisión, tamaño/hash, fecha, custodia, ACL y enlace privado al cierre/línea correctos. OCR/transcripción es derivado con confianza; ausencia de descarga = original pendiente. No guardar credenciales, tarjeta completa ni fotos privadas en GitHub, fixtures o Pages compartidas.
- Idempotencia de evento: tenant + cuenta/canal + message_id + adjunto + versión; dedupe de negocio por documento/pago/reserva comprobados. Un mismo original reenviado por correo/WhatsApp enlaza varias ocurrencias a un soporte y un efecto financiero. Hash distinto exige revisión semántica; mismo importe/nombre no autoriza fusionar ni duplicar cobros. Distinguir factura, voucher, cierre de lote y transferencia.

#### Corrección auditable y consulta desde canales autorizados
- La corrección agrega revisión con autor/rol, motivo, fecha, fuentes y relación sustituye_a; conserva valor anterior e histórico sujeto a retención. Aplicación condicionada a revisión vigente/compare-and-set y receipt; ante conflicto concurrente releer/revisar, sin último escritor ciego.
- El reporte actual usa la revisión válida y muestra solo diferencias vigentes; correcciones ya resueltas dejan de ser alertas abiertas. Histórico y puente de cambios siguen consultables por permisos. Una corrección de dato no revierte pago, factura o cierre nativo.
- Un cierre aprobado/cerrado no se sobrescribe por un archivo tardío: crear propuesta de enmienda/reapertura con evidencia y aprobación del rol autorizado. Ausencia de excepción, silencio o auto-respuesta nunca certifica resolución.
- Propietario, Recepción y Contabilidad recuperan el mismo close_id/revisión desde su canal habilitado, con filtrado independiente por campos/originales/acciones. Acceso al reporte completo requiere capacidad de detalle; no equivale a acceso a todo el chat, todas las cuentas o todos los originales. Mostrar fecha/corte, fuentes, cobertura y estado; sin ruta verificada responder indisponible, no otro reporte inventado.
- Entrega, recepción del proveedor y lectura son etapas distintas. Con canal bloqueado conservar informe privado y borrador; sin envío ni supuesto “llegó a WhatsApp”. No activar respuestas, recibos de lectura, cobros, facturas, contabilidad, permisos o Finalize Day en esta unidad.

#### Prueba mínima y recuperación
1. En el host existente, inventario sanitizado y prueba de cuenta/salientes/media; usar versión/ayuda instalada y runbook actual. No instalar otra sesión, cambiar credenciales ni conectar un canal alterno para eludir identidad.
2. Con una fecha/cierre autorizados y originales ya compartidos, vincular un pago, voucher, transferencia y arqueo disponibles; lo ausente permanece explícito. Consulta independiente verifica ID, revisión, bytes/hash/ACL y estado, sin efectos contables.
3. Reinicio entre captura y procesamiento y replay multicanal: mismo cierre, soporte y dinero una vez. Probar archivo ausente/corrupto, dos fechas/cajas, orden invertido, corrección concurrente, pago tardío y timeout ambiguo sin duplicar ni finalizar.
4. Corregir un dato erróneo: versión actual refleja cambio, alerta vieja se retira, historial conserva antes/después y fuente. Denegar corrección sin capacidad y lectura de otra organización, actor revocado o cuenta personal.
5. Consultar desde propietario y Recepción: misma revisión, cobertura y diferencias; cada rol solo ve detalle permitido. Verificar restauración aislada del registro + original + permisos sin mensajes ni movimientos nuevos.

**Terminado:** resultados anteriores con IDs/receipts privados y aceptación Finance/Recepción, incluyendo continuidad tras reinicio y cero filtraciones/efectos duplicados. Código/CI/documentación no promueven runtime a LIVE. Ante fallo, detener solo el adapter nuevo, preservar checkpoint, evidencia y cierre previo y continuar borrador/revisión manual por fuentes vigentes; no apagar webhooks ni crear otra ingesta. El contenido genérico del contrato es reutilizable; datos reales y resultados permanecen aislados por hotel/cuenta.
