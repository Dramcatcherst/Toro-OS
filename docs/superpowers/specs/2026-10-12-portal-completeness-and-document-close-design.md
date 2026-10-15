# TORO product experience: single shell, work, information and governed execution

Status: PROPOSED WRITTEN SPECIFICATION — architecture review required before new product implementation.
Date: 2026-10-12. Parent: `docs/product/TORO_BRAIN_GENERAL_PLAN.md`, section 23 Human Experience; TORO Finance / Comms / Tools contracts remain authoritative.

Review: 2026-10-15 — database/product alignment and bounded E1a correction candidate; no runtime activation.

Latest authority within this subordinate specification: [alignment15/10](#alineamiento-producto-datos-20261015). The13/10 counts12/16/243 describe their historical cutoff; catalogue244 in current main supersedes them. E1–E7 remain the single delivery sequence; a UI grouping is not a new product/domain.

## Outcome and scope

An authorized hotel operator finds the right tool or company information, submits a supported document once, sees what TORO actually processed, and prepares a saved daily close with evidence and unresolved differences. The owner receives decisions and exceptions rather than a collection of disconnected dashboards.

Reuse the existing Portal, identity resolver, organization scope, canonical directory, internal-work intake, execution receipts, finance evidence tables and close records. No second Brain, database, inbox, project backlog, accounting book or scheduler. Dreamcatcher is the reference scope, not a universal hotel assumption.

This is a subordinate design, not a replacement Plan General. Requested visual reference: `1001761343.png` — navy/slate, defined borders, compact natural-height panels, blue TORO typography and original provider assets. The reference image is not runtime data or proof of implemented capabilities.

## Alternatives and decision

1. **Extend the existing governed surfaces (recommended).** Reuse canonical objects and expose progressively verified capabilities. Lowest migration risk and no duplicate truth.
2. **Render the entire mixed directory indiscriminately.** Faster appearance of coverage, but exposes unrelated scopes, historical routes, credential-management paths and unverified destinations. Rejected.
3. **Rebuild Portal, chat and finance as another app.** Adds identity, receipt and synchronization debt. Rejected.

## Navigation and interaction

- Primary destinations: Inicio, Trabajo, Dinero, Herramientas; Más exposes Cerebro, Personas, Clientes, Crecimiento, Studio, Legal/Riesgo, Activos, Proyectos and Sistemas through the existing module model. Preserve canonical ordinals 00–11 and all existing routes.
- Inicio: two most relevant exceptions with a critical-state indicator, up to nine favorites, official Kross handoff and one clear document-intake entry when enabled.
- Trabajo: current tasks/handoffs/people/guest work filtered by role, property and freshness; never fabricate room occupancy or task completion.
- Dinero: close period/property/currency, expected versus counted cash, evidence queue, reconciliation differences and close history. A manual calculator is labelled Conteo, not a persisted close.
- Herramientas: one complete permitted catalogue, search by name/purpose, categories, nine favorites and contextual provider entry. Directory and guide are subviews of this same surface.
- Reportes is a view of existing domain sources, not a second navigation tree or another dashboard.
- One primary navigation per viewport; mobile four entries plus Más. Minimum 320px, targets at least 44px, text at least 12px, keyboard order equal to visual order, reduced-motion and forced-colors.
- Contextual detail opens on demand. Source date, partial coverage, blocking condition and action outcome remain available. No empty panels filled with sample business data.

## Complete link catalogue

The existing `operations.knowledge_items` directory is the source. Preserve native link IDs and entries; do not create another independent registry.

Project only approved fields: link ID, display label, purpose/category, safe destination, current scope, review state and review timestamp. Do not project account references, raw evidence, internal configuration, secrets or signed access URLs.

One governing projection validates identity, organization/property, role, visibility, lifecycle, exact reviewed destination and duplicate IDs. The current narrow RPC and its server projection must be extended together; adding names to a client-side logo map does not establish access.

Separate navigation state from integration state:
- Navigation: reviewed / login required / unreviewed / unavailable / historical.
- Integration: native read verified / native write verified / preparation only / unavailable / unknown.

Owner discovery includes permitted historical and other-project references through filters; default hotel view excludes them. Santa Toro remains a separate context. Sensitive credential-management destinations stay outside ordinary favorites. Unknown links retain a visible resource-needed state and no invented URL.

Group by provider and useful action without deleting distinct deep links. Exact URL equality is evidence for duplicate review, not permission to erase. Preserve query parameters that change the intended action; never retain credential parameters. Generic approved public provider landing pages can offer safe fallback, clearly distinct from the exact company destination.

Favorites must be scoped by user and organization. Existing per-session selections remain labelled until the canonical preference store and narrow write policy are approved and implemented. No local success message pretending database persistence.

## Same document flow across chat, email and Portal

Owners: TORO Comms for intake/binding, TORO Finance/FIONA for semantics, TORO Systems for custody/transport, existing TORO execution layer for retries/receipts.

1. Resolve channel account, sender, chat/group, user, organization, property and capability. A group name alone is not authorization. Guest, team, personal and finance scopes remain separate.
2. Receive a bounded batch through the existing Comms intake. Preserve native message and attachment identifiers and timestamps; ack receipt separately from processing.
3. Apply the existing COLLECT_THEN_PROCESS SOP. An explicit “listo” closes collection. A configured idle window can prepare a candidate, but does not finalize accounting. Separate days/accounts/topics. Late files attach as a new batch version.
4. Store unchanged original bytes in authorized custody before financial processing; verify native revision, size and SHA-256. Link PDF, XML, photo and OCR derivative without overwriting originals. Do not publish private references in this repository.
5. Extract only supported content; record field confidence, missing fields and document authority. OCR output is a candidate, not proof of payment, tax validity or accounting acceptance.
6. Deduplicate source replay by tenant + channel account + chat/message + attachment index/version. Review cross-channel matching by original hash and business document identity. Invoice and payment proof are different objects; do not count the same expense twice.
7. Validate entity/property, issuer, document number, date, original amount/currency, tax, payment source and purpose. Mixed personal/business or unresolved evidence goes to review.
8. Reuse `integrations.document_manifest`, `finance.evidence_documents`, `finance.invoice_sources` and `finance.invoices`; link occurrences instead of creating a second evidence table. Small metadata additions require a reviewed migration if existing fields cannot express the invariant.
9. Prepare the existing `finance.daily_close_runs/items/questions` for the authorized period/property. Create or reopen a draft idempotently; attach evidence by reference.
10. Record stage-specific receipts using the existing execution envelope. Portal and WhatsApp read this same state; no separate conversation-only “done”.

States shown to the operator: Recibido, Original guardado, En revisión, Listo para cierre, Conciliación pendiente, Listo para aprobar, Cerrado; Bloqueado/Desconocido when evidence or a source fails. Each transition requires evidence and the authorized actor.

## Financial close semantics

The close has a cutoff and explicit expected-source checklist: Kross source/export, cash count, card/processor settlement, transfers/bank, expenses, refunds, supplier documents and prior exceptions. Missing sources are not zero. An expense document does not establish actual settlement.

Preserve original totals, CRC and USD separately, gross/net/taxes/fees/refunds/timing differences and any unreconciled residual. Use exact decimal amounts; no silent conversion or invented tax treatment. Invoice, payment notification and bank settlement may support one event without becoming three expenses.

Draft completion and final closure are separate actions. A saved draft can exist with incomplete sources; it must display missing coverage. Final close requires reconciled evidence or explicitly approved exception disposition, accountable closer and readback. Kross Finalize Day remains a separate gated final action.

Alegra retains fiscal/accounting authority. Reuse the existing Connector v2 and controlled native writer candidate in PR228; do not merge/activate a stale branch wholesale. The available connector catalogue is not proof of posting or attachment upload. Native writer company/actor binding, permissions, originals, idempotency, correction and readback must pass first. Receiving a document authorizes intake under the approved policy, not payments, fiscal emission, payroll or definitive posting.

Operational close, financial close, breakfasts and management brief remain separate outputs linked to the same day; one does not certify the others.

## Delivery units and dependencies

| Unit | Owner | Dependency | Completion evidence |
| --- | --- | --- | --- |
| A. Directory projection and taxonomy | TORO Tools + Identity | Written spec and scoped RPC review | Every permitted registry entry discoverable or has an explicit exclusion; role and mixed-scope tests |
| B. Navigation simplification | TORO Human Experience | A and existing destinations | 320/390/412/desktop, keyboard and real owner walkthrough; no hidden permitted destinations |
| C. Original custody and extraction pilot | Systems + Comms + Finance | Verified authorized upload source and custody | One original stored/hash/readback; duplicate replay creates no extra business event; corrupt file fails safely |
| D. Saved close draft | TORO Finance | C plus current source checklist | Existing close record, original totals, missing sources and repeatable reopen; no accounting effect |
| E. WhatsApp finance intake | Comms + Identity | Verified existing host/account/group/sender binding | One authorized batch through restart/replay, original custody and same Portal status; denied sender proves isolation |
| F. Native posting and final close | Finance + qualified approver | Existing Alegra writer acceptance and current Kross/bank evidence | Exact approved native action, separate readback, correction path and final-close receipt |
| G. Portfolio and metadata convergence | TORO Core | Actual receipts from A–F | Existing tasks/registry/Plan aligned without duplicate backlog or false DONE |

C/D may start with an authorized Portal upload or export when the existing WhatsApp host is unavailable. This is an explicit alternate input to the same pipeline, not an alternate identity or bypass.

Do not add a scheduler; reuse the existing worker once its policy and credentials are verified. Do not create billable accounts or dependencies without an explicit budget decision. Do not replace DreamTeam or retire historical surfaces before dependency and recovery proof.

## Acceptance scenarios

Catalogue: same provider with different actions; historical link; unknown URL; signed secret URL; foreign scope; repeated ID; malicious redirect; allowed owner versus employee; stale reviewed destination.

Documents: valid PDF/XML/photo; malformed/oversized file; OCR uncertainty; multiple pages; duplicate forwards across chat/email; invoice plus transfer proof; refund/reversal; personal expense; owner-paid business expense; wrong property/date; mixed CRC/USD; late attachment; restart mid-custody; interrupted native response.

Close: missing Kross source, unknown expected cash, card amount versus settlement net, duplicate proof, unmatched expense, manual exception, revised draft and repeat final-close request. Each test checks final canonical readback, not only a successful response.

Identity: unauthorized group/member, revoked/expired session, second real identity, guest versus finance separation and source payload attempting instructions. Document content is data, never executable authority.

## Verification and rollback

Use branch/PR/CI/preview and exact deployed source verification. Preview capability configuration must be known; a public-demo preview is not authenticated runtime acceptance. Retain the last working owner-login deployment.

Additive data changes require a reviewed migration and rollback. Do not delete original files or committed financial records; corrections create versioned or reversal evidence. Feature-disable the new intake/action boundary on partial failure, preserve the last good checkpoint, quarantine ambiguous outcomes and reconcile before resuming.

Restore test uses one scoped synthetic or explicitly authorized original and verifies bytes plus lineage. Account/channel and financial identifiers belong only in restricted evidence storage.

## Metrics and honest completion

Measure permitted catalogue coverage, number of steps to the top tasks, persistent-state survival, original custody/hash coverage, duplicate rate, unresolved-source coverage, end-to-end processing time and actual verified close count. Establish the baseline before claiming savings. Target 100% of permitted entries classified/discoverable; 100% of processed originals with integrity evidence; zero duplicate financial effects in replay tests.

Done means the operator can repeat the workflow with the intended identity, observe the canonical result and recover after failure. A render, connector name, table, passing mocked test, READY build or stored SOP alone is insufficient.

## Approval boundary

This written specification is ready for review. Architectural implementation and its detailed execution plan require the user's review under the invoked Superpowers workflow. The audit and reversible metadata corrections do not activate chat ingestion, posting, new permissions or new automation. Existing approvals remain valid within their original scope.

<a id="herramientas-favoritos-20261013"></a>
## Herramientas y favoritos — propuesta de diseño, 13/10/2026

Intento del propietario: integrar una herramienta similar al HTML TORO-DASHBOARD-LINKS dentro del TORO existente, optimizada por tareas y contexto; Inicio presenta una selección breve que se sugiere automáticamente y puede fijarse. Supuesto de alcance pendiente de corrección: esto aplica a la sección de accesos de Inicio, conservando los demás paneles operativos. No exige otra aplicación o registro.

### Fuente, superficie y estado

- Referencia local: agrupación por proveedor/acción, búsqueda, densidades, favoritos y detalle contextual. Es preview con perfiles de presentación, no autorización. No copiar su modelo completo, account_refs o evidencia cruda al cliente.
- CURRENT verificado en fuente: catálogo compartido de doce destinos ya revisados; selección inicial fija de hasta nueve y cambios solo en memoria del componente. Cuatro destinos Kross adicionales están revisados en un lote propuesto; aún no proyectados.
- TARGET_REQUESTED: catálogo completo permitido y favoritos duraderos personales. Lo publicado, temporal, sugerido y guardado deben distinguirse.
- Portal/Herramientas, guía y Mi espacio consumen la misma política de catálogo/preferencias. Mantener las rutas actuales; sus vistas no crean otro módulo ni catálogo independiente.

### Contrato de sugeridos y fijados

1. Solo entra un destino que entrega el lector autorizado vigente, con la misma pareja exacta ID/URL y revisión. Fijar o usar no concede permisos. No incorporar una candidata, histórico, contraseña, cierre financiero, tarifa o cuenta ambigua por ranking.
2. Fijados manuales preceden a sugeridos. Hasta nueve accesos visibles en total; los fijados nunca se desplazan o desordenan al recalcular. El catálogo conserva el resto de destinos permitidos y una acción clara para volver.
3. Inicio frío: presets por tarea/perfil confirmado, filtrados por autorización. Etiqueta “Sugerido”, sin afirmar aprendizaje. Uso propio/recencia puede mejorar orden cuando exista captura aprobada; sin IA, polling o datos de huéspedes para esta decisión.
4. Se recalcula al entrar/cambiar contexto o al pedir actualizar; no mientras el usuario interactúa. Descartar afecta sugerencias, desfijar afecta preferencias; controles separados y reversibles.
5. Fijar selecciona una acción y revisión del destino estables, no un proveedor con apertura variable según búsqueda. Alias pueden agruparse para presentar, conservando los IDs de origen; detalles y búsqueda aplican el mismo filtro que lista y apertura.
6. Cambiar usuario, organización/propiedad o cuenta autorizada cambia el conjunto visible y su estado temporal. Un rol-preview, correo o cuenta inferida nunca suple la autorización real. Cuenta solo si el contexto seguro vigente la identifica; no proyectar account_refs.
7. Si una autorización/destino deja de ser válido, impedir apertura y explicar el estado sin sustituirlo silenciosamente. No guardar URLs de sesión, credenciales o parámetros sensibles; favoritos no transportan sesiones del proveedor.
8. Pin persistido exige readback después de guardar y recargar. Fallo muestra “Cambios temporales: no guardados”; no toast de éxito falso. En la fase temporal solo se promete memoria del componente, sin “guardado entre dispositivos”.

### Dependencia de preferencias y límites

No se confirmó un lector/almacén durable autorizado. La comprobación focal de catálogo Supabase no encontró tablas con nombres de preferencias/settings/vault en public/operations/private ni columnas correspondientes en los objetos de usuario examinados; esto no demuestra ausencia global de mecanismos. Resolver el contrato existente antes de implementar persistencia.

Contrato propuesto mínimo: actor tomado de sesión, organización/propiedad resueltas, clave de superficie, destino canónico/revisión, rango de fijación y sugerencias descartadas; versión/updated_at para conflictos. Contadores de uso solo si se aprueba su captura y retención. Datos de preferencia no son claims de rol ni grants. Un nuevo almacén o política de escritura requiere necesidad y cambio mínimo revisados; sin esquema/escritor paralelo automático.

### Aceptación y reversión

- Fijar/desfijar, descartar/recuperar y ordenar por teclado; nombre de acción estable, foco visible y estado anunciado. Filtro/categoría no abandona Favoritos ni muestra archivos ocultos.
- Misma autorización en sugerencia, tarjeta, detalle y apertura; revocación, cambio de contexto, ID/URL alterados, alias y duplicados tienen prueba negativa.
- Un pin es control hermano del enlace, nunca botón anidado dentro de un enlace; una tarjeta no combina acciones ambiguas.
- Lectura parcial/fallo de preferencias no borra pins ni sobreescribe preferencias con semillas. Guardado versionado/idempotente maneja cambios de otra pestaña sin perder elecciones.
- Superficies públicas genéricas conservan sesión del proveedor y cuenta no confirmada; no afirmar selección automática de la cuenta del hotel.
- Los mismos doce destinos de baseline siguen disponibles; las cuatro candidatas no aparecen antes de su cambio autorizado. No ID/URL/organización/cuenta inferidos.
- Los pins mantienen orden y destino elegido tras búsqueda y actualización; persistencia solo aceptada con recarga/readback y dos identidades/contextos sin mezcla.
- QA del delta en320/390/1280, teclado y fallback; los límites44px/12px del diseño vigente permanecen. El HTML file:// no tuvo nueva QA visual por bloqueo de política; no usar servidor alternativo para eludirlo.
- Reversión por delta propio/feature control acordado, conservando preferencias y datos; no reset del repositorio compartido, cambio de RLS o borrado de originales.

### Secuencia inicial del lote de favoritos — antecedente sustituido por el diseño integral siguiente

Una unidad activa: preferencias/política y UX compartidas con los doce destinos. Después, por dependencia y autorización: ampliación de las cuatro parejas ya revisadas; grupos y cobertura por ámbitos elegibles; un flujo operacional completo con tarea/responsable/evidencia/cierre; mantenimiento editorial de índice/aliases y historial. Cada resultado conserva SoT, dueño, prueba, bloqueo, gate y reversión en sus registros existentes. No calendario, otro backlog ni trabajo paralelo activado.

La investigación del13/10/2026 queda en REVISION_PRODUCTO_Y_ALINEAMIENTO_TORO.md y su evidencia local de la tarea toro-accesos-operacion, subordinadas a esta especificación y al Plan General.

<a id="experiencia-integral-20261013"></a>
## Experiencia integral TORO — diseño y plan de implementación propuestos, 13/10/2026

> Para ejecutores: usar superpowers:subagent-driven-development o superpowers:executing-plans por unidades. Un escritor aislado, condiciones y pruebas del delta; sin asumir que este diseño está implementado.

**Goal:** contexto autorizado→siguiente trabajo→fuente/evidencia→acción permitida→responsable/relevo/cierre leído del registro original.
**Architecture:** shell único, registro00–11/capacidades conservados, política común de presentación y fuentes nativas. La vista no crea permisos, escrituras o otra identidad/verdad.
**Tech Stack:** Next.js16.3.8/React19.2.4/TypeScript/Vitest4.1.11 observados; componentes/tokens y lectores existentes. Consultar guías del Next instalado antes de código; no actualizar dependencias por este plan.
**Spec/authority:** esta especificación existente bajo el Plan General; reporte/evidencia locales de toro-accesos-operacion del13/10/2026 son entregables de la revisión. No otro master plan, app, DB, backlog o scheduler.

### Decisiones de producto

Cinco entradas: Hoy, Trabajo, Información, Herramientas y Dirección autorizada. Cerebro00 y búsqueda/pedido son transversales; mapa/lista dentro de Información. Un contexto visible y una acción principal por pantalla. PC lista+detalle, móvil Hoy/Trabajo/Buscar/Más; compatibilidad de rutas. Idioma/tema/cuenta, cabecera, evidencia y retorno se resuelven una vez.

Hoy contiene siguiente caso, decisiones/bloqueos y favoritos, no todas las tarjetas de todas las áreas. Trabajo presenta caso/tarea/turno por proceso. Información sirve consultas/documentos/reportes con corte/cobertura. Herramientas reúne catálogo permitido y utilidades. Dirección muestra prioridades/portafolio/riesgos/Plan/capacidad por permiso; cuenta propia no equivale a configuración del sistema.

Los ocho tabs actuales se redistribuyen: Operación/Personas/Dinero/Clientes/Crecimiento a Trabajo y sus consultas; Reportes a Información; Más a mapa de capacidades. Respuestas de huéspedes son Comunicación/Clientes, no un módulo Mercadeo terminado. Plantillas con una referencia de borrador; no instancias efímeras competidoras.

En público/demostración se indica modo sintético. Un fallo operacional conserva estado indisponible; ver demo es elección explícita. No hero o franja de agentes que simule actividad, score/progreso o integración.

### Cobertura de las13páginas y layout

Auditoría de fuente sobrebe48e66, sin sesiones de todas las páginas. Estado de modalidad derivado del proxy, no de pruebas nuevas de runtime. Se localizaron16APIroutes; sus handlers no tuvieron auditoría exhaustiva.

| Ruta actual | Portal actual | Decisión TARGET |
|---|---|---|
| / | redirect | authenticated Hoy / explicit demo |
| /login | allowed | single accepted entry and safe available return |
| /onboarding | blocked | optional contextual help, no blocking tour |
| /portal | allowed | single workspace shell and Hoy |
| /my-toro | allowed | account/consultation compatibility view within single experience |
| /my-toro/herramientas | allowed | canonical tools/guide subview with aliases preserved |
| /brain | allowed | transversal Cerebro and Information view within shell |
| /booking-assist | allowed | reusable Cotizar action and compatibility route |
| /dreamcatcher | blocked | hide from operational product; source/lab only |
| /modules | blocked | technical history; no second operating catalogue |
| /modules/[id] | blocked | technical reference with no false fallback |
| /modules/event-ops | blocked | private project context after isolation proof |
| /experience-lab | blocked | design/QA only, outside daily menu |

Layout conserva base y se combina con shell autorizado; acceso/demo siguen ligeros. Login/transporte aceptado se conserva; safe-next debe ser seguro y disponible. No reabrir DreamTeam ni introducir SSO. Onboarding se vuelve ayuda opcional; no exposición de rutas por apariencia. Landing hotel/legacy/lab conservan historia fuera de navegación diaria. Event Ops mantiene su proyecto privado y debe acreditar aislamiento antes de cualquier exposición hotelera.

### Registro canónico de dominios

Ordinales de presentación, no IDs de base. Todos siguen localizables como áreas/capacidades; no renumerar o duplicar proyectos.

| Dominio preservado | Hogar TARGET |
|---|---|
| 00 Cerebro | Information/transversal command |
| 01 Hoy y Atención | Hoy / Trabajo |
| 02 Dinero | Trabajo / Información / Dirección |
| 03 Studio | Trabajo / Información |
| 04 Clientes | Trabajo |
| 05 Operaciones | Trabajo |
| 06 Personas | Trabajo / own account |
| 07 Crecimiento | Trabajo / Dirección |
| 08 Legal y Riesgo | Dirección / Información |
| 09 Activos y Espacios | Trabajo / Información |
| 10 Proyectos | Trabajo / Dirección |
| 11 Sistemas | Dirección / authorized technical tools |

DiecinueveIDslegacy conservados: command,brain,tools,agents,revenue,campaigns,channel,market,kross,comm,ops,event-ops,assets,data,gov,approvals,browser,codex,settings. Se corresponden como capacidades/referencias de las áreas o del contexto privado, no otro19módulos. CODEX queda como herramienta de SOBRESITO/Sistemas, no director.

### Contrato común de presentación y verdad

Vigencia documental no certifica implementación. Separar consulta disponible, dato revisado, preparación, guardado/readback, enviado/entregado, cierre y desconocido. Campos/estados de fuente gobiernan la vista; no manufacturar actividad.

- needsRevalidation=false sin evidencia individual no produce verified/riesgo certificado.
- Null/error/parcial no es0/ready; conservar diferencia con cero confirmado y cobertura de consulta.
- Sin match explícito no usar primeras acciones/conectores ajenos.
- Relaciones generadas desde raíz/fixtures no acreditan conexión, y activityidle no es trabajo activo.
- Misma autorización en sugerencia/lista/detalle/apertura; cambio de contexto limpia estado. No rol-preview, teléfono, nombre o correo como grant.
- Proyecto familiar, privado personal, empresa y portafolio mantienen aislamiento; un org_id o role label no lo sustituye.
- Datos presentes/límites de una consulta no son denominador global de cobertura.
- Recibido/documento/conteo/cotización preparada no son pago, contabilización, reserva o cierre.

### Cinco clases de fallo que gobiernan pruebas

Fuente ausente/stale; identidad/ámbito cambiado; ruta segura pero no disponible; guardado/envío ambiguo o repetido; grupo con objetos de distinto permiso. Cada unidad incluye el caso que le corresponde, sin interpretar silencio del spec como permiso.

### Secuencia de implementación E1–E7

Una unidad pesada activa; cada una produce comportamiento verificable, archivo/fuente exactos, prueba, gate y reversión. La secuencia previa del lote de favoritos es antecedente; esta secuencia integral es rectora para el frente ahora solicitado.

**E1 — Veracidad/límites (NEXT único).**
Archivos: features/brain/canonical-projection.ts; lib/server/brain-projection.ts; app/modules/[id]/page.tsx; features/event-ops/los50s-server.ts y vista si corresponde. Tests existentes canonical-projection.test.ts, brain-projection.test.ts, los50s-server.test.ts; agregar prueba focal legacy si falta.
- [ ] Aislar escritor y reconfirmar delta/contrato.
- [ ] Regresiones: flagfalse sin evidencia, summarynull/error, relación sin match, fallo operacional/no demo automático y ámbito privado no permitido.
- [ ] Confirmar fallo; implementar mínimo y pasar tests/typecheck/lint/diff-check proporcionales.
- [ ] Recibo/PR/checkpoint; no exposición privada ni SQL/grants/env. No cerrarUX-01sin aislamiento probado.
Comando dirigido: node node_modules/vitest/vitest.mjs run src/features/brain/canonical-projection.test.ts src/lib/server/brain-projection.test.ts src/features/event-ops/los50s-server.test.ts. Compilación del mismo SHA cuando corresponda, sin repetir build agotado o borrar caché.

**E2 — Shell/contexto/navegación.**
Archivos: portal-workspace.tsx, portal-header.tsx, portal.module.css, app/portal/page.tsx, my-toro/page.tsx, layout.tsx, auth/safe-next.ts, menu/portal-projects.ts; propuestos workspace-navigation.ts/workspace-shell.tsx en features/portal.
- [ ]13rutas/12dominios/19legacyIDs y aliases completos.
- [ ] Navegación por permiso/contexto efectivo, cabecera única y retorno/deep-links.
- [ ] Tests safe-next, portal-session, menu resolver/server, appPortal/proxy; interacción contexto/atrás/recarga/ruta no disponible.
- [ ] QA320/390/1280/teclado, fuentes/monedas/foco y limpieza de estado. Allowlist separado.

**E3 — Un ciclo de trabajo.**
Reusar features/actions/internal-work.ts, internal-work-server.ts/tests, operations.tasks/projects y recibos existentes.
- [ ] Caso hotelero bajo riesgo y actores autorizados; tarea única/owner/evidencia/relevo.
- [ ] Idempotencia, actor/org incorrectos, revocación, interrupción/readback ambiguo y responsable ausente.
- [ ] Si el writer no está autorizado, preparación/handoff honesto; guardado/cierre solo con prueba en origen.
- [ ] Gate específico de escritura; no mensaje/reserva/pago/contabilización implícitos.

**E4 — Herramientas/preferencias.**
Reusar directory/server/catalogue/links y vistasPortal/Miespacio; resolver contrato de preferencias actor/ámbito/revisión/rank/version.
- [ ] Semillas permitidas y pin/descarte/orden compartidos;12destinosbaseline.
- [ ] URL estable, aliases, dos identidades/contextos, revocación, lectura parcial, guardadofallido, dos pestañas/recarga/readback.
- [ ] No creds/account_refs/claims como grant. Pin/link hermanos; cuenta externa no seleccionada porTORO.
- [ ] Lote4ya revisado: deltaRPC6→10+navegación6=16, id/url/presentación fija, con gate separado. No nuevo censo243.

**E5 — Información/evidencia/reportes.**
Reusar brain-explorer/canonical-projection/brain-projection, menu/source-aware/server/portal-projects y lectores autorizados.
- [ ] Fuente/corte/cobertura/ref→objeto/acción→retorno con foco.
- [ ] Ref no permitida/stale/partial/empty/retirada; sin resolvedor no botón falso.
- [ ] Reporte por reader aceptado, período/moneda originales, exportación solo probada.
- [ ] Mapa/lista contenido, no navegaciónglobal duplicada; fuentes/privacidad intactas.

**E6 — Capacidad útil por rol/dominio.**
Reusar menu/types/server/resolver, context/resolver y cada feature nativo. No diez writers paralelos.
- [ ] Matriz identidad/rol/ámbito/acción/fuente/capacidad, sin ampliar por perfil de diseño.
- [ ] Un proceso por dependencia/utilidad, campos/adapter mínimos.
- [ ] Negativas/frescura/cobertura/repetición y recepción≠pago/documento≠contabilización.
- [ ] Readback/actores reales tras gate específico; mantener Kross/People/Alegra/bancos/canales.

**E7 — Consolidación/rendimiento/limpieza.**
Plan/spec, portal/model, toro-data y compatibilidad/nav.
- [ ] Índice/aliases/criteriosP-M-V hacia resultado/tarea/prueba; historia/IDs intactos.
- [ ] Retirar duplicación y ejemplos del flujooperativo; probar referencias/rutas/perímetro.
- [ ] Medir carga/uso/cierre/fallas con corte y denominador; no porcentajes porrequisitos.
- [ ] Retiros destructivos solo con autorización/consumidores/retención/recuperación. Reversión del delta, nunca reset compartido.

### Aceptación global, notas y reversión

Cada página tiene usuario/contexto/acción/estado final y decisión visible/redirect/oculta. Todos los dominios están localizables; ninguna ruta permitida lleva a superficie prohibida. Un caso se acepta al cerrar en fuente con actor/evidencia/readback, no al compilar o publicar una maqueta.

RegistrarUX-01–18 en el Plan/registro/tarea existentes: observado/preparado/implementado/publicado/runtimeaceptado/medido, fuente/SHA/fecha, prueba, gate y una brecha/siguiente acción. No auditorías repetidas de fuentes ajenas, historial completo en workers o nuevo programa paralelo. Datos privados no van al repo.

Reversión de diseño: delta documental propio con historia conservada. En implementación, rollback focal/aliases/featurecontrol acordado; preferencias y originales no se borran. Producción, permisos, SQL, costos y acciones sensibles conservan autorización específica. E1–E7 no quedan programados o activados por este registro.


<a id="alineamiento-producto-datos-20261015"></a>
## Alineamiento del producto con datos — 15/10/2026

**Alcance y evidencia.** Inventario funcional completo solicitado por Mauricio, relacionado con el Plan único; esta matriz es subordinada. Lectura integral del Plan en `2320fb66300857b1c350e75fe8feac245ed7ca12`, delta relevante revisado hasta `4068ef3936ce86f3014c3b021566630af0e87c19`; no repetición de auditoría general. Estructura Supabase/Airtable y agregado saneado del directorio leídos15/10; no aceptación de todos los procesos ni extracción de datos privados. Auditoría de páginas fuente en `be48e66` complementada por catálogo actual; Kross interno no fue auditado en la comparación visual general. El HTML compacto fue un prototipo independiente, nunca producto implementado.

**Cómo leer la matriz.** D=dominio00–11 existente; H=hogar principal propuesto del menú. Resumen en Inicio siempre abre ese hogar con filtro y regreso conservados. “Estructura” acredita metadatos; “lector” requiere contrato permitido y readback; “código” acredita repositorio; “flujo aceptado” exige actor real/corte/acción/resultado; “publicado” exige SHA/despliegue. Ninguna fila es un permiso o nueva tarea. Prefijos de esquema indican familias existentes, no tablas específicas inferidas; cuando no se identificó contrato, se marca pendiente.

### Inventario funcional único y destino

| # | Función / D | Fuente existente o autoridad | H / formato propio | Estado al corte / prueba que falta |
|---|---|---|---|---|
| 01 | Acceso y contexto /06,11 | DreamTeam/Auth, app_users, user_roles, identity.organization_memberships | Cabecera / cuenta | Acceso observado con una cuenta; probar revocación/segundo actor/recuperación por separado. |
| 02 | Inicio /01 | Proyecciones autorizadas Brain/Owner Attention | Inicio / resumen y filas | Pantalla observada; cada resumen debe abrir lista filtrada y conservar regreso. |
| 03 | Cerebro, mapa y búsqueda /00 | RPC Brain vigente; projections y reglas de autoridad | Información→Cerebro / mapa-lista | Lectura parcial; no búsqueda global acreditada ni relación gráfica como integración. |
| 04 | Tareas, responsables y relevo /01,05,10 | operations.tasks/projects; internal-work existente | Trabajo→Tareas / tabla-tablero | Soporte fuente/código; persistencia/cierre completo del Portal pendiente de flujo aceptado. |
| 05 | Recepción y turno /05 | Tareas + Kross como PMS; guía existente | Trabajo→Recepción / tablero | Guía/handoff disponibles; relevo persistido con responsable/evidencia pendiente. |
| 06 | Habitaciones y reservas /05,04 | Kross; catálogo espacial existente | Trabajo→Reservas / planning-tabla | Enlaces/motor existentes; disponibilidad/estado vivo solo mediante autoridad Kross comprobada. |
| 07 | Limpieza y lavandería /05,09 | Tarea ops_ws_housekeeping_laundry_stock; operaciones/activos | Trabajo→Limpieza / lista por área | Estructura/contrato; captura/estado por habitación y consumo con readback no acreditados aquí. |
| 08 | Mantenimiento e inspecciones /05,09 | facilities.maintenance_events, inspection_rounds/checks; vistas de prioridad | Trabajo→Mantenimiento / cola-detalle | Estructura observada; cierre activo/evidencia/reincidencia por actor pendientes. |
| 09 | Inventarios y bodegas /09 | assets.stock_items/stock_levels/inventory_movements; vistas de conteo/reposición | Trabajo→Inventarios / tabla compacta | Estructura observada; lector/página operativa pendientes. No inventar total ni valoración. |
| 10 | Compras y recepción /09,02 | assets.purchase_runs/purchase_run_items; contrato de compras/inventario | Trabajo→Compras / cola-recibo | Estructura; distinguir requerido/comprado/recibido/facturado/pagado con prueba. |
| 11 | Proveedores /09,02 | assets.suppliers; original/evidencia en Dropbox | Trabajo→Compras→Proveedores / directorio | Estructura; no alta duplicada ni saldo inferido de una ficha. |
| 12 | Activos y espacios /09 | assets.physical_assets; Airtable physical_spaces y correspondencias | Información→Activos y espacios / ficha-mapa | Estructura; reconciliar ubicación física/lógica/vendible antes de cambiar modelos. |
| 13 | Huéspedes y CRM /04 | Kross autoridad; revenue/operations según contrato permitido | Trabajo→Clientes / lista-ficha | Contrato de lector y campos mínimos por rol pendientes; sin copiar huéspedes al cliente por defecto. |
| 14 | Comunicaciones /04,05 | TORO Comms, canales/conexiones existentes | Trabajo→Comunicaciones / bandeja permitida | Capacidad por canal/usuario por probar; no bandeja universal ni envío automático acreditado. |
| 15 | Respuestas y traducción /04,03 | Plantillas existentes; conectores bajo sus gates | Comunicaciones→Respuestas / editor | Borrador/copia efímeros observados; un solo editor, envío humano; traducción nativa no probada. |
| 16 | Cotizaciones /04,02 | booking-assist/Kross; TERE y contratos existentes | Trabajo→Cotizaciones / formulario-resumen | Código/handoff; preparado≠enviado≠reserva confirmada. |
| 17 | Precios e ingresos /02 | Kross/Alegra según hecho; SP04 y TERE | Dirección→Ingresos / tabla-escenarios | TARGET de control; precio/piso aprobado y evidencia antes de recomendar o escribir. |
| 18 | Canales y distribución /07,04 | Kross/OTA/motor; directorio único | Dirección→Canales / estado-links | Enlaces/código parcial; feed recibido, mapping y sincronización requieren prueba por canal. |
| 19 | Finanzas y conciliación /02 | Alegra fiscal; bancos dinero real; finance como control | Información→Finanzas / tabla-reporte | Estructura y reportes previos; panel vivo aceptado pendiente; monedas/corte explícitos. |
| 20 | Caja y cierre /02,05 | Conteo local existente; comprobantes y fuentes originales | Trabajo→Caja / conteo-cierre | Calculadora/copia efímeras; contado≠cobrado≠conciliado≠cierre persistido. |
| 21 | Costos y rentabilidad /02 | FIN-01 y contratos de costos; finance/reporting | Dirección→Costos / reporte-simulador | TARGET; break-even provisional no es tarifa mínima autorizada. |
| 22 | Personas /06 | DreamTeam; public.employees y estructura de empleo | Trabajo→Personas / directorio por rol | Estructura/rutas previas; verificar paridad y alcance, sin sustituir DreamTeam. |
| 23 | Asistencia, horarios, RRHH y nómina /06 | DreamTeam attendance/shift/leave/payroll según permiso | Personas / submenús privados | Estructura; actor/cálculo/aprobación/recuperación/cierre aceptados por separado. Oculto a roles sin acceso. |
| 24 | Capacitación y SOP /06,00 | DreamTeam Knowledge OS; conocimiento aprobado | Información→Aprender / guía-búsqueda | SOP existente no prueba habilidad certificada ni entrenamiento ejecutado. |
| 25 | Mercadeo y crecimiento /07 | TORO Growth/SKY, content/revenue y plataformas fuente | Trabajo→Mercadeo / tablero-calendario | Catálogo/sourcecode parcial; cuentas, métricas, publicación y gasto con evidencia independiente. |
| 26 | Studio y marca /03 | content; originales de marca en Dropbox | Trabajo→Studio / biblioteca-editor | TARGET/capacidad condicionada; logo maestro original, no variantes redibujadas. |
| 27 | Documentos y evidencia /00,08 | Dropbox original; knowledge/references de TORO | Información→Documentos / índice-detalle | Abrir original permitido; upload≠extracción≠contabilización; dedupe/custodia antes de cierre. |
| 28 | Agenda y notas /01,06 | Calendar enlazado; contrato Tasks/Keep pendiente de aceptación | Trabajo→Agenda / agenda-lista | Enlace no es sincronización; no nuevo almacén de notas ni scheduler. |
| 29 | Directorio útil /00,11 | Directorio canónico knowledge_items | Información→Directorio / personas-recursos | Proyección mínima por ámbito pendiente; una fuente, con accesos desde su contexto. |
| 30 | Proyectos y decisiones /10,01 | operations.projects/tasks; atención existente | Dirección→Proyectos / tablero-decisiones | Lectura/proyección limitada; progreso, propietario y cierre deben provenir del objeto. |
| 31 | Legal, riesgo y obligaciones /08 | risk; documentos originales/registro autorizado | Dirección→Legal y riesgo / calendario-tabla | Estructura/contratos; fecha o enlace no confirma obligación vigente/cumplida. |
| 32 | Herramientas, enlaces y logos /11 | dreamcatcher_system_database_directory_v1; RPC catálogo/v1 | Herramientas / proveedor→acciones | 244 fichas y código integrado; destinos/roles según proyección; verificación destino y aceptación UI separadas. |
| 33 | Sistemas y dispositivos /11 | integrations; herramientas autorizadas existentes | Dirección→Sistemas / estado-inventario | Conexión/instalación no prueba control Android/Home/TTLock/PC; piloto bajo gate existente. |
| 34 | Agentes y ejecución /00,11 | PUMBA/TORO Brain; runtime/ledger existentes | Dirección→Ejecución / cola-recibos | No crear agentes/schedulers; preparado/delegado/programado/ejecutado/entregado distintos. |
| 35 | Auditoría y mejora /00,08,11 | Evidencias, control-plane y contratos de aceptación | Dirección→Control / excepciones | Cobertura con denominador y origen; no % global por tarjetas/tablas/requisitos. |
| 36 | Personal y portafolio /contexto propio | User Vault/fuentes privadas; Plan único | Cambio de contexto autorizado | Fuera del menú/datos hotel; búsqueda y lecturas también deben probar aislamiento. |
| 37 | Utilidades /05,11 | Caja/calculadora/plantillas/enlaces existentes | Barra PC→Utilidades / panel breve | Capacidad local visible como local; sin guardado/envío/AI implícitos. |
| 38 | Cuenta, ayuda y administración /06,11 | Identidad y contratos TORO vigentes | Pie del menú→Cuenta/Ayuda; administración por rol | Recuperación y ajustes solo mediante flujos comprobados; legacy/lab separados del trabajo diario. |

### Navegación y composición de cada página

- Inicio contiene señales vigentes, siguiente trabajo, decisiones y accesos permitidos. Cada bloque tiene un destino concreto; sin resumen decorativo o botón inerte. Un dato ausente muestra cobertura/estado, nunca cero o actividad ficticia.
- Trabajo despliega áreas, con Inventarios, Compras y Mantenimiento visibles por separado cuando el rol los permite. Información reúne consultas/evidencia; Dirección reúne decisiones/control. Herramientas conserva el directorio único. Cerebro puede abrirse desde búsqueda/Información sin otro menú principal.
- PC: rail contraíble e identificación del contexto, barra transversal breve de accesos, contenido con ancho útil; filas/columnas alineadas y detalle lateral para conservar lista. Expandir el menú no debe empujar la tarea fuera de la pantalla. No geometría fija aprobada por el prototipo.
- Móvil: tareas del rol primero; menú completo accesible; detalle de una acción por vez. Tablas con columnas prioritarias y resto en detalle. No ocho pestañas que exijan desplazamiento horizontal para descubrir áreas.
- Tablero para recepción/turno; tabla para stock/movimientos/compras; planning en reservas si el lector lo soporta; período/filtros/fuentes en reportes; proveedor/logo/subacciones en herramientas; formulario y confirmación en captura. No forzar tarjetas iguales en todas las páginas.
- Logos oficiales cuando haya asset identificado y permiso de uso; fallback de nombre legible. El directorio no aporta assets de logo comprobados todavía. Iconos sin párrafos repetidos, con nombre accesible/tooltip y estado distinguible sin depender del color.
- Menú con máximo dos niveles propuestos; tarea frecuente→detalle en≤2 acciones desde su área. Atrás, recarga y enlaces conservan contexto/filtro/selección; búsquedas temporales privadas no se filtran en URLs compartibles.

### Inventarios: contrato previo a la primera página

Reusar las siete tablas `assets` relacionadas en el Plan y vistas `inventory_count_checklist`, `inventory_count_priority`, `procurement_reorder_candidates`, `replenishment_candidates`; mantenimiento conserva `facilities.maintenance_events` y sus relaciones. Fuente de trabajo: `ops_ws_housekeeping_laundry_stock`; contrato de conocimiento existente `procurement_inventory_operating_contract_2026_09_v1`. Airtable Inventario & Activos es referencia/migración; no otra captura maestra simultánea. No volcar cuentas o filas privadas en este documento.

| Subvista | Mostrar solo con lector permitido | Criterio de aceptación |
|---|---|---|
| Resumen | Faltantes y conteos pendientes con corte/ubicación | Cada cifra abre su lista filtrada; parcial no es totalhotel. |
| Artículos | SKU, nombre, unidad, mínimo/máximo, proveedor | ID estable; unidades compatibles antes de sumar o reponer. |
| Existencias | Artículo×ubicación, cantidad, último conteo confirmado | Separar confirmado/estimado/ausente; sin saldos fabricados. |
| Movimientos | Tipo, origen/destino, cantidad, motivo, responsable | Traslado conserva total; ajuste trazable; rechazo/idempotencia en futura captura. |
| Compras/recepción | Necesario/comprado/recibido por línea y evidencia | Factura no suma stock; recepción parcial suma solo cantidad confirmada bajo writer autorizado. |
| Conteos | Diferencia y prioridad de revisión | Conteo no modifica saldo sin aprobación/registro según contrato. |
| Activos/historia | Ficha de activo, condición, mantenimiento/evidencia | Activo individual distinto de consumible; enlace de evidencia accesible por rol. |
| Costos | Precio/moneda/fecha y origen cuando exista | Valoración pendiente si no hay libro/método/lector aceptado; no total mezclando CRC/USD. |

**Brechas concretas:** ubicación está como texto en stock/movimientos; `physical_spaces` existe en AirtableCentral pero no se probó correspondencia duradera con cada ubicación. No se identificó tabla dedicada de bodegas ni libro de valoración; esto no prueba ausencia global. Resolver equivalencias y autoridad con datos mínimos antes de crear tablas o calcular total. RPC Brain/Owner Attention no acredita un lector de stock: el inventario no se conecta al navegador con service_role ni SELECT amplio para completar el diseño.

### Criterios verificables y control de aplicación

| Pri / unidad | Comprobación | Evidencia para avanzar |
|---|---|---|
| P0 / E1, E6 | Identidad/ámbito reales, negativas por rol y otro contexto | Lectura servidor/campos mínimos; EventOps privado y datos personales fuera hotel. Ocultar menú no basta. |
| P1 / E1a | needsRevalidation=false sin prueba individual no produce verified | Regresión falla antes y pasa después; solo proyección/estado, sin cambiar fuente/permiso. No cierra E1. |
| P1 / E1 restante | Ausente/error/parcial≠0/ready; sin match≠acciones ajenas; fallo≠demo silenciosa | Pruebas del caso original; actor/cobertura/límite visibles. |
| P1 / E2 | Las38 funciones tienen hogar y destino/estado por rol; Inicio→detalle→regreso | Matriz sin huérfanos/duplicados; navegación≤2 acciones y recarga/atrás conservados en320/390/1280. |
| P1 / E6 Inventarios | Lectura mínima de stock/conteo en contrato existente | Fuente/corte/ubicación/unidad; negativas/empty/error; no escrituras antes de gate propio. |
| P2 / E2, E7 | Meta3× información útil PC | Mismo contenido y datos sintéticos, viewport1280×720 y1536×864, escala100%; comparar entidades/celdas útiles y acciones visibles antes/después. Sin contar iconos, duplicados o datos ocultos. |
| P2 / E2, E7 | Densidad legible y móvil útil | Texto principal≥14px, secundario≥12px como objetivos de diseño; controles táctiles≥44px, foco/teclado, contraste medido, sin overflow en320/390; si la meta3× perjudica tarea, no se aprueba por cumplir cantidad. |
| P2 / E4 | Directorio por proveedor y acción, acceso rápido revisado | Mantener244IDs/5sinURL y roles actuales; agrupación no elimina referencias ni convierte históricos/candidatos en favoritos. |

El directorio agregado tenía244 fichas/20categorías,61home_eligible y183no; una fecha destination_verified_at y ningún campo de logo entre las fichas leídas. No confundir `checked_at`/etiqueta verified del registro con destino, sesión o conector comprobados. `home_eligible` es metadato, no aprobación de favorito. La RPC completa sigue limitada aADMIN/GERENCIA; otros perfiles conservan su proyección existente. Agrupar por proveedor es presentaciónTARGET; no nueva tabla/catálogo ni acceso transversal a otros proyectos.

**Recibo obligatorio por unidad:** bloque funcional/D; fuente y contrato; archivos/SHA; estado estructura/lectura/código/publicación/flujo/operación; pruebas exactas y alcance; pendiente y una siguiente acción. Usar tarea/checkpoint existentes; nada se marca aplicado solo por estar en el Plan. E1a cambia únicamente la inferencia de verificación de proyectos; riesgo, estado de proyecto, métricas, otras fuentes y resto de brechas no se certifican por esa corrección. PR280 queda actualizado sobre main actual preservando sus aportes. No merge/deploy/SQL/grants/escritores por esta unidad.

**NEXT único:** completar el resto acotado de E1 sobre ausencia/error/parcial después de verificar y registrar E1a. E2 consume esta matriz; Inventarios se prepara como primer dominio de lectura después de los límites comunes. No lanzar los38 bloques ni crear procesos paralelos. Reversión: revert selectivo de archivos propios después de comparar concurrencia; mantener historia/fuentes/datos originales y DreamTeam.
