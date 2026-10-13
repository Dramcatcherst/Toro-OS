# TORO Universal Mail Router V1

Status: DRAFT IMPLEMENTATION CONTRACT  
Owner: TORO  
Master plan: `docs/product/TORO_BRAIN_GENERAL_PLAN.md`  
Scope: Mail Ingest V2 + PayFlow + cross-domain routing

## Purpose

Every authorized email is observed once and converted into zero or more verified deltas against TORO's existing canonical objects. The router does not create a second inbox, CRM, finance writer, scheduler, calendar or backlog.

## Decision envelope

For each message TORO produces a decision envelope:

```text
mail identity
-> scope/privacy
-> facts/entities/documents
-> canonical objects
-> action classes
-> authority checks
-> proposed writes
-> verification/readback
-> receipts
```

No external mutation occurs merely because an email asks for it.

## Action classes

| Class | Canonical destination | Typical projection |
|---|---|---|
| NO_ACTION | mail census only | none |
| KNOWLEDGE_UPDATE | operations.knowledge_items | portal/search |
| DOCUMENT_ARCHIVE | integrations.document_manifest + domain evidence | Dropbox/Drive |
| FINANCE_RECONCILE | finance.* + operations.obligations | Alegra / Calendar |
| CALENDAR_CONTROL | operations.obligations | existing Google Calendar |
| TASK_OR_FOLLOWUP | communication_followups or tasks | Today/Owner Attention |
| RESERVATION_SIGNAL | reservations/guests links | Kross/OTA readback |
| GUEST_SERVICE | communication_followups | Reception/TERE |
| MAINTENANCE_SIGNAL | facilities.maintenance_events | Operations |
| PEOPLE_HR | People/employee domain | HR views |
| SALES_OPPORTUNITY | customer/revenue domain | CRM/followup |
| LEGAL_COMPLIANCE | obligations + evidence | Calendar/Legal |
| SYSTEM_INCIDENT | Systems/Projects task | engineering surface |
| SECURITY_ALERT | Systems/Governance | owner attention |
| EVENT_ACTIVITY_SIGNAL | catalog.local_events / catalog.experiences + private fulfillment | existing scoped Calendar / governed guest catalog |
| DIRECTORY_DELTA | revenue.agencies / assets.suppliers / private.fulfillment_partners | filtered lists / existing transitional mirrors |

## Routing principles

1. One message identity; multiple deltas allowed.
2. One canonical object per business fact.
3. Resolve entity/property before any write.
4. Use source authority per field, not per email.
5. Original material documents are preserved; ordinary email text stays in the mailbox and is referenced.
6. Calendar is a projection, not obligation truth.
7. Alegra is accounting authority, not document inbox.
8. Dropbox is archive/custody, not operational database.
9. Personal and business scopes never cross without explicit evidence.
10. All material writes use the TORO Control Plane.

## Document custody

Material attachments and generated originals use `integrations.document_manifest` and, for finance, `finance.evidence_documents`.

Archive verification states:

```text
ARCHIVE_PENDING
ARCHIVE_UPLOADED
ARCHIVE_READBACK_OK
ARCHIVE_HASH_VERIFIED
ARCHIVE_VERIFIED
```

Do not claim `ARCHIVE_VERIFIED` from an upload response alone.

## Alegra handoff

Current connector usage is read-only. TORO may:

- look up providers;
- inspect bills, invoices, payments and accounts;
- resolve cost center;
- compare document/payment state;
- prepare posting/reconciliation candidates.

A future writer must consume a Control Plane task and return readback + receipt before TORO says “recorded in Alegra”.

## Email-to-action examples

**Invoice arrives:** archive PDF/XML -> invoice/evidence -> obligation -> check Alegra -> update same Calendar event if authorized -> receipt.

**Guest asks for early check-in:** link reservation/guest -> followup -> operational task only if work remains -> no Dropbox/Alegra.

**Maintenance photo:** maintenance event -> archive evidence if material -> procurement candidate if needed -> no finance posting until an actual purchase/evidence exists.

**Candidate CV:** People domain + privacy -> archive CV only if policy/consent allows -> no public knowledge.

**Newsletter:** extract durable policy/product change only if material; otherwise NO_ACTION.

**Bank debit email:** reconciliation signal -> match obligation/document/Alegra -> never manufacture an invoice.

## Daily run output

Report only:
- coverage actually inspected;
- new valuable deltas;
- actions proposed/executed and receipts;
- archive status;
- Alegra match/posting-candidate status;
- Calendar diffs;
- unresolved exceptions;
- up to three next steps.

Routine successful routing stays in receipts, not in the master plan.

## Ampliación del Universal Mail Router — eventos, directorios y Margot (2026-10-11)

**DIRECTIVA DEL OWNER / TARGET:** TORO debe extraer oportunidades, eventos, actividades y relaciones útiles de todos los buzones autorizados, incluidos los de Margot y del hotel, y decidir sus acciones dentro de este Plan General único. Owners: TORO Comms + Data (ingesta), Revenue/Growth/Guests (agencias y experiencias), Operations/Assets (proveedores), Personal + Identity/Governance (Margot). Ejecución en las tareas/proyectos existentes; no nuevo CRM, base, scheduler ni plan maestro.

**CURRENT — verificación directa:** Supabase `abtyrbqlqbsastmridzp` contiene `catalog.local_events` (2 eventos, ambos vencidos/archivados), `catalog.experiences` (85), `private.fulfillment_partners` (32), `assets.suppliers` (24), `revenue.agencies` y `revenue.agency_agreements`. Airtable hotel `appuk6zInco941sgc` ya tiene EVENTS_MASTER, EXPERIENCES_MASTER, PROVEEDORES_TOURS_MASTER, CONTACTS_MASTER y AGENCIAS_MASTER; “AGENCIAS DE VIAJES” es tarifario, no directorio. La base `appYRL3P7ugPtQN1h` contiene 20 proveedores y el registro de superficies la clasifica TRANSITION / MIRROR_ONLY hacia catálogo/fulfillment Supabase. Se leyeron esquemas y registros; esto no acredita frescura de tarifas ni operación de sincronizadores.

**Eventos y actividades:** calendario operativo es una vista/proyección de objetos existentes. Eventos locales fechados -> `catalog.local_events`; actividades recurrentes/oferta de tours -> `catalog.experiences` + `private.experience_fulfillment`; reuniones internas/trabajo -> task/followup vigente; plazos legales/financieros -> obligación vigente. Una promoción sin fecha corroborada queda candidata, nunca evento confirmado. Registrar organizador, lugar, fecha/hora/zona, recurrencia, vigencia, fuente, última verificación, cancelación/cambios y público autorizado. Publicación a huéspedes respeta `catalog.local_event_publish_gate` y gates de experiencias; no divulgar contactos, comisiones ni notas privadas. Confirmar con organizador antes de recomendar disponibilidad/precio.

**Calendar:** listado completo observado: único calendario editable `admin@dreamcatcherhotel.com`; demás son suscripciones. Eventos consultados 01/oct–01/ene/2027, sin cursor pendiente. Reutilizar ese calendario para eventos hoteleros verificados, previa búsqueda/readback; identidad idempotente por scope + objeto + ocurrencia + rol, conservando mapping TORO/Calendar y excepción de recurrencia. No copiar todos los tours/feriados al calendario ni crear un calendario físico nuevo por este encargo. Preparación 7/3/1 días dentro de Team Brief/Cierre Diario existentes. Cancelación/cambio actualiza el mismo objeto/evento y conserva evidencia; ningún email cancela reservas o envía invitaciones automáticamente.

**Directorios/listas útiles:** agencias -> `revenue.agencies`, acuerdos -> `revenue.agency_agreements`; proveedores de compras/mantenimiento -> `assets.suppliers`; operadores turísticos -> `private.fulfillment_partners`. Crear listas como filtros de estos registros, nunca copias maestras. Matching por scope + ID de origen/identidad legal; dominio/email/teléfono normalizados aportan evidencia, coincidencia de nombre sola no fusiona. Conservar rol, zona, servicios, contacto profesional, fuente y fecha, vigencia, estado candidato/por verificar/verificado/inactivo. Acuerdos, comisiones, seguros, disponibilidad y contactos requieren evidencia vigente. “Venta Directa” y registros GENERIC_PRICING_TEMPLATE no prueban agencias comerciales reales aunque digan verified. Reutilizar Best of Costa Rica, Costa Rica Top Tours y Marketing Sueño Azul; este último sigue por verificar. No contactar ni contratar por esta directiva.

**Margot — proyecto propio separado:** ya existe organización personal `margot-personal` (`28cd20ed-6717-4168-87ea-3c9518a6ffa5`); consulta de todos sus proyectos devuelve cero. TARGET: “Margot · Personal”, bajo TORO Personal/Projects y este mismo Plan General; no hija de Dreamcatcher, no nueva organización/base/identidad. El root del portfolio observado pertenece al org del hotel: no reutilizarlo como padre cruzando tenants. NEXT P0: resolver identidad/membresía, módulo y padre válido del mismo ámbito; comprobar bindings de buzones/calendario y lectura negativa desde el hotel; preparar alta idempotente mediante Control Plane. Claves candidatas solo se fijan tras resolver el registro de módulos/parent, no insertar por inferencia. Proyecto runtime = NOT_CREATED; ejecución bloqueada hasta esos bindings y writer/receipt, sin pedir nueva autorización para repetir este encargo ya aprobado.

**Privacidad Margot:** default private; sus emails/documentos/citas/finanzas no pasan al hotel ni a su Calendar. Su buzón y calendario propios no fueron verificados en esta sesión. Dropbox ya contiene originales de Margot en árboles de documentos personales/estados de cuenta y evidencia histórica mixta; reutilizar file-id/manifest con ACL verificadas, no mover/copiar documentos ni asumir carpeta privada por el nombre. Centro de costo Alegra no equivale a tenant ni concede acceso. Mensaje mixto se descompone en deltas por titular y se bloquea si titular/autoridad es incierto.

**NEXT / DONE:** (1) P0 mapping privado Margot y prueba de aislamiento; (2) P1 router y writer idempotente existentes con readback/receipt; (3) P1 actualizar eventos y contactos por deltas reales; (4) P2 backfill gradual con mismos checkpoints. Evaluaciones: replay sin duplicados, evento reprogramado/cancelado, oportunidad sin fecha, agencia genérica excluida, proveedor vencido no recomendado, correo mixto y acceso hotel->Margot denegado. Medir cobertura real por buzón, deltas útiles, duplicados, candidatos sin verificar, desfase de Calendar y excepciones por ámbito. Documentación no equivale a automatización activa.


## Acceptance cases for implementation

These cases are required runtime evidence, not tests executed in this documentation session.

| Input | Required outcome |
|---|---|
| Same message replayed | Same canonical IDs; zero second external effects |
| Agency newsletter with event but no confirmed date | Directory/knowledge candidate; no confirmed Calendar event |
| Organizer changes/cancels an occurrence | Update existing occurrence and source mapping; no new independent event |
| July tour listing says active | Refresh availability/price/insurance before current guest recommendation |
| GENERIC_PRICING_TEMPLATE agency marked verified | Exclude from real agency prospect/contact list without independent identity evidence |
| Margot appointment reaches hotel inbox | Private Margot candidate; no hotel event/publication |
| Hotel role requests Margot documents/project | Denied; no payload leakage |
| Mixed bill identifies uncertain owner | Quarantine disputed delta; retain known scoped references |
| Calendar timeout after possible write | Read existing provider state before retry; ambiguous result remains unverified |

Rollback: revert documentation commits on this PR. Any later worker release needs its own verified rollback for mappings and external writes; this PR supplies no production release or permission expansion.


### Visitas, citas y agenda útil — directiva 2026-10-12

**TARGET autorizado:** incluir visitas comerciales/técnicas, inspecciones, citas, reuniones, capacitaciones, eventos culturales/deportivos/comunitarios y oportunidades regionales útiles. Prioridad geográfica del hotel: Santa Teresa, Malpaís, Cóbano, Montezuma, Cabuya y Península de Nicoya; destinos más lejanos solo por utilidad explícita. Clasificar utilidad para operación, huésped, ingresos, cumplimiento, equipo o persona, sin guardar todo indiscriminadamente.

**Reglas Calendar:** compromiso con fecha/hora acordadas -> evento en calendario del scope correcto; invitación/oportunidad con fecha corroborada -> recordatorio privado, transparente, claramente “oportunidad/por confirmar”, sin afirmar asistencia/inscripción; fecha conocida pero hora desconocida -> recordatorio de fecha, nunca inventar duración; visita solicitada sin fecha -> followup para acordarla, sin bloquear agenda. No confundir recordatorio con evento que dura todo el día. Conservar timezone original y conversión local, lugar/organizador, owner, fuente, estado y siguiente acción. Dedupe por scope + objeto/organizador + ocurrencia + rol, incluyendo eventos automáticos fromGmail e invitaciones ICS/UID existentes. Eventos de participación ocupan tiempo solo cuando están acordados; oportunidades no lo bloquean. No enviar invitaciones, inscribir, aceptar contratos ni reservar por este mandato.

**Descubrimiento y ciclo:** correo autorizado, fuentes públicas/organizadores, catálogos y calendarios existentes -> extraer -> cotejar vigencia y fuente primaria -> relacionar objeto -> actualizar por delta -> revisar cambios/cancelaciones/expiración. Aprovechar Team Brief/Cierre Diario y triggers Mail Ingest existentes; no scheduler paralelo. Ventanas 7/30/90 días según dominio; preparación 7/3/1 días cuando útil. Información no fechada va a directorio/conocimiento con propósito, fuente y próxima revisión. Avisar solo novedades materiales, urgencia/conflicto o decisión; no notificar cada newsletter. Personal/Margot permanece privado y nunca usa el hotel como fallback.

**CURRENT de esta sesión:** búsquedas selectivas desde 25/sept en Gmail hotel, Mauricio y Margot; lectura real de los tres conectores, incluido `toromargot@gmail.com`, ahora verificada para esa consulta. No acredita inventario completo, binding runtime ni escritura Calendar de Margot. Hotel: primera página 30 resultados y cursor restante; cobertura no exhaustiva. Micelio `https://micelio.red` identificado en correo como fuente regional de experiencias/eventos: no se verificaron su catálogo web ni fechas de sus 15 eventos anunciados. Catch A Tour solicita visita sin día/hora: FOLLOWUP_PENDING, no cita confirmada. Oferta/comisión reportada no equivale a acuerdo vigente. Actividades históricas y notificaciones de calendarios personales no se recrean en el hotel.

**Intervención Calendar manual autorizada:** se buscó duplicación y se creó/leyó el recordatorio privado y transparente “Oportunidad · Turismo, Bienestar y Autocuidado · hora por confirmar” para 15/oct/2026 en Calendar hotel, con aviso un día antes. Fuente profesional difundida a empresas turísticas; fecha en invitación, hora/inscripción pendientes. Esta intervención directa del owner no activa worker ni sustituye Control Plane para automatización futura. Readback Calendar verificado; no receipt persistente del Control Plane en esta sesión. El ID del recordatorio se conserva en el contrato subordinado como evidencia de esta intervención, no como nueva autoridad. No se inscribió a nadie ni se enviaron invitaciones. Calendar añadió un Meet al recordatorio; descripción aclara que no es el acceso oficial del organizador.

**NEXT:** confirmar programa de jornada y actualizar mismo recordatorio; coordinar visita Catch A Tour por canal autorizado antes de fecharla; cotejar fuentes regionales con organizadores y gates de catálogo; resolver calendarios personales y writer gobernado. Automatización continua sigue NOT_VERIFIED.

Calendar manual readback reference: `admin@dreamcatcherhotel.com` / `g9eus4mf8pk2jtiivumn553i3o`; source mail `1a117b39065b64e5`; dedupe `Dreamcatcher|mujeres-bac-turismo-bienestar-20261015|opportunity-date-reminder`. Required scenarios: unconfirmed visit creates no meeting, opportunity remains transparent, date-only reminder discloses unknown time, personal calendar unavailable blocks personal projection, fromGmail/ICS match prevents duplicate.


## Reporte diario de entorno y fechas especiales — Portal TORO (2026-10-12)

**DIRECTIVA DEL OWNER / TARGET:** incorporar clima diario, horas de pleamar/bajamar, luna y fechas especiales a recepción, Team Brief/Cierre Diario y Portal TORO, junto a visitas/agenda/actividades. Este módulo de información depende del mismo TORO Comms/Data/Research/Operations/Guests; no nuevo cerebro, calendario maestro, scheduler o backlog. La autorización cubre diseño e integración gobernada, no servicios pagos ni publicación de datos inciertos.

**CURRENT auditado:** Portal User v1 ya contiene Today/Calendar/contextos/privacidad; búsqueda de código encontró señales weather/tides en evidencia histórica de conocimiento, sin demostrar adapter UI/datos vivo. Supabase tiene `public.holidays`, `public.holiday_calendars`, `catalog.local_events`, sus gates y vistas públicas; la búsqueda de nombres no encontró tablas dedicadas weather/tide/moon, sin concluir ausencia de cualquier dato JSON. Calendar ya ofrece feriados/fases lunares: reutilizar sus IDs, no duplicar suscripciones. No se modificó código, despliegue ni esquema por esta directiva.

**Fuentes y ubicación:** IMN para pronóstico/avisos meteorológicos Costa Rica; MIO-CIMAR/UCR para predicciones marinas/mareas/fase lunar; contrastes de mareas universitarias con estación identificada. Fuentes consultadas: https://www.imn.ac.cr/es/web/imn/reporte-pronostico-regional ; https://miocimar.ucr.ac.cr/mareas ; https://miocimar.ucr.ac.cr/sobre-el-mio ; https://unacostasegura.una.ac.cr/webServices/mareas_detalle.php?cod=374&estacion=Puntarenas&id=16 . En esta sesión IMN devolvió 410 al acceso directo, MIO requiere JavaScript y UNA devolvió tabla fechada de Puntarenas. Resultados indexados son descubrimiento, no lectura vigente del reporte. No publicar condiciones de hoy del IMN por snippets ni mareas Puntarenas como Santa Teresa. Resolver coordenadas de propiedad/playa, estación/modelo, cobertura, zona horaria y datum antes de activar.

**Contrato normalizado de lectura, sin DDL por defecto:** scope/ubicación, source/source_url/station/model, issued_at/retrieved_at, valid_from/valid_until, local_date, timezone, provenance, verification_state, freshness, units, uncertainty. Las horas se muestran en America/Costa_Rica, preservando zona original. Guardar solo el snapshot útil con retención acotada mediante almacenamiento canónico existente que soporte permisos/provenance; validar adapter/config y esquema antes de proponer tablas. Una predicción se identifica como tal; nunca como observación.

| Información | Reporte y criterio |
|---|---|
| Tiempo diario | Lluvia/probabilidad e intensidad, temperatura, viento/ráfagas, tormenta eléctrica y avisos; mañana/tarde/noche con vigencia y región. Probabilidad de lluvia no equivale a volumen. No inventar detalle horario a partir de boletín regional. |
| Mareas | Todos los extremos del día, cada hora/altura/unidad/datum, pleamar o bajamar, próxima marea y estación/modelo. Permitir 0–N extremos y eventos cerca de medianoche, no fijar siempre dos de cada tipo. Tendencia subiendo/bajando calculada solo con extremos/modelo válidos, sin afirmar nivel observado. |
| Mar | Oleaje/período/dirección y avisos de corrientes cuando fuente cubra lugar/tiempo. Marea baja no acredita baño, piscinas naturales, surf o navegación seguros; condiciones y decisión del operador importan. |
| Luna | Fase e iluminación, próximo cambio de fase con fecha/hora; salida/puesta y visibilidad solo si fuente o cálculo astronómico validado cubre coordenadas/horizonte. Puede faltar salida/puesta dentro del día. No derivar mareas exactas solo de fase lunar. |
| Fechas especiales | Feriado legal con jurisdicción/año y efectos laborales cotejados; celebración, evento local y fecha personal como clases distintas. Cumpleaños/aniversarios solo con propósito/consentimiento y ACL; Margot/personal nunca en hotel por defecto. |

**Portal TARGET — dentro de Hoy/agenda/recepción existentes:** tarjeta compacta “Hoy en Santa Teresa” con fecha, ubicación, estado de actualización, clima y próximo extremo de marea; detalle desplegable muestra lista completa, luna, fuentes y avisos. Agenda única incluye visitas/citas, actividades y fechas especiales autorizadas; filtros hoy/7/30 días y ámbito. Reporte diario usa datos de la misma proyección que chat/Portal, sin copia por canal. Estado visible “Actualizado…”, “Pronóstico”, “Datos vencidos” o “Sin datos verificados”; no spinner infinito ni datos ficticios. Rol recepción ve preparación/huéspedes; operaciones ve riesgo/trabajo exterior; gerencia ve excepciones y oportunidades. Datos personales se limpian al cambiar contexto.

**Regla Calendar:** no crear cuatro eventos de marea cada día ni eventos de lluvia rutinaria. Horas diarias viven en tarjeta/reporte. Calendar reutiliza suscripciones y solo recibe hito/actividad/ventana elegida/recordatorio relevante con fecha corroborada, dedupe por ámbito+objeto+ocurrencia+rol y ejecución gobernada. Oleaje/alerta no cancela reserva/tour automáticamente. Eventos lunares/fechas existentes se leen antes de proyectar nuevos.

**Ciclo diario autorizado, pendiente de implementación:** resolver location/scope -> obtener fuentes vigentes -> validar fecha/unidades/cobertura -> comparar snapshot -> generar reporte conciso hoy y preparación mañana -> proyección Portal -> alertar solo cambios materiales/riesgo/nuevos plazos -> evidencia/readback. Integrar revisión diaria al Team Brief/Cierre Diario y triggers existentes; el correo solo no asegura clima/mareas cada día. Frecuencia de refresh por validez/boletín y cache compartida, límites/reintentos/backoff; no consultar modelo cada minuto. Alerta urgente se procesa cuando fuente la emite dentro del mecanismo existente. Si fuente falla, conservar referencia al último reporte con fecha y advertir caducidad; no recomendar ventana marina con datos vencidos.

**NEXT P1:** definir mapping Santa Teresa y fuentes accesibles sin costo nuevo; censar workers/refresh/reportes actuales; implementar lectura normalizada y freshness; conectar tarjeta y reporte a la misma respuesta canónica; validar preview, luego entrega diaria y readback reales antes de LIVE. No usar migración de mareas para bloquear el lanzamiento web B0–B2 previamente acotado.

**Aceptación y recuperación:** comprobar fecha local/UTC y cruce medianoche, estación equivocada rechazada, altura sin datum no utilizada para umbrales, predicción caducada/timeout degradados, fase lunar sin evento de salida, aviso actualizado deduplicado, feriado/celebración separados, privacidad negativa hotel->Margot, Portal/chat mismo snapshot y replay sin duplicados Calendar. Rollback de esta etapa: revertir documentación; un release futuro necesita deshabilitar adapter/proyección con bandera vigente, preservar auditoría y recuperar último estado válido sin mostrarlo como actual. Estado al cierre: contrato y Plan ampliados; servicio diario/UI/runtime = NOT_IMPLEMENTED/NOT_VERIFIED.


## Margot — prerequisite audit readback, 2026-10-12

Read-only live SQL verified exact organization ID+slug, zero existing projects, zero active ADMIN/GERENCIA memberships, zero registered same-scope modules and zero readable private email bindings. No binding for Margot's known mailbox was found in a different organization in this query. This does not prove complete isolation or coverage of aliases. Project RLS is enabled; its management policies use private.has_org_role with active, unrevoked org-specific roles. The admin diagnostic connection is not an authenticated hotel/Margot session and cannot certify negative access tests.

Reusable diagnostic: `scripts/audit-margot-project-prerequisites.sql`, executed against the existing database with result BLOCKED_IDENTITY_MEMBERSHIP. It is read-only, reports all missing prerequisites, and treats READY_FOR_REVIEW as review only. No role, permission, module, binding, project, task or run was created. Do not use the diagnostic SQL connection to bypass the authenticated/Control Plane writer.

Concrete next dependency: resolve the accepted private account identity and org membership using existing Identity/Governance; map the private canonical module and same-scope parent; verify the existing personal mailbox/calendar bindings; then prove authenticated hotel denial and authorized Margot read. Only after these gates, execute the previously authorized idempotent project creation with run/lease/fencing/readback/receipt. Hotel-root parenting remains invalid.

Environment implementation status supersedes the historical NOT_IMPLEMENTED statement above: read adapters and protected Portal projections are implemented and preview build-verified (186 tests, scoped lint, TypeScript); existing daily Team Brief prompt is configured and read back without cadence change. See `docs/evidence/TORO_ENVIRONMENT_READ_PREVIEW_2026-10-12.md`. Production deployment, authenticated visual/RLS acceptance, first verified daily environment execution and local tide source remain pending. Documentation/configuration do not certify runtime delivery.

Identity follow-up: exact known-mailbox lookup returned zero Portal auth accounts, including zero confirmed accounts. A connected Gmail mailbox is not a Portal login identity. The owner has been asked which login email Margot will use; no account invite, membership grant or identity creation was attempted.


### Owner-selected Portal login — 2026-10-13

The owner selected the existing hotel administration login as the access identity for Margot's private project. Read-only auth lookup confirmed exactly one account with confirmed email. Current private-scope memberships for that account: zero; Margot projects: zero. This resolves which login to reuse, not the remaining runtime provisioning gates. Do not create a duplicate auth account or treat the hotel organization as the personal-data destination.

Access design: reuse that identity with an explicit scoped membership in margot-personal, using the least role that supports the authorized project workflow after Identity/Governance resolves the existing role model. Organization context, data bindings and private storage remain Margot's. The owner-selected identity may hold access to both contexts; negative tests must target hotel-only identities and explicitly selected hotel-context requests, rather than expecting the chosen dual-scope identity to have no Margot access at all. Org-level RLS alone does not certify context isolation for a dual-scope user: server loaders, workers and projections must enforce the selected scope and prevent fallback.

Remaining work: same-scope module/parent and personal mailbox/calendar mapping; governed membership/project writer and receipts; authenticated selected-context and hotel-only denial tests. No roles, accounts, permissions, projects or provider bindings were changed by this readback.
