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
