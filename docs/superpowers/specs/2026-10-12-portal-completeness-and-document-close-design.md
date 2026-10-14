# TORO Portal: completeness, simple navigation and document-based close

Status: PROPOSED WRITTEN SPECIFICATION — architecture review required before new product implementation.
Date: 2026-10-12. Parent: `docs/product/TORO_BRAIN_GENERAL_PLAN.md`, section 23 Human Experience; TORO Finance / Comms / Tools contracts remain authoritative.

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

### Secuencia de mejora en el Plan único

Una unidad activa: preferencias/política y UX compartidas con los doce destinos. Después, por dependencia y autorización: ampliación de las cuatro parejas ya revisadas; grupos y cobertura por ámbitos elegibles; un flujo operacional completo con tarea/responsable/evidencia/cierre; mantenimiento editorial de índice/aliases y historial. Cada resultado conserva SoT, dueño, prueba, bloqueo, gate y reversión en sus registros existentes. No calendario, otro backlog ni trabajo paralelo activado.

La investigación del13/10/2026 queda en REVISION_PRODUCTO_Y_ALINEAMIENTO_TORO.md y su evidencia local de la tarea toro-accesos-operacion, subordinadas a esta especificación y al Plan General.
