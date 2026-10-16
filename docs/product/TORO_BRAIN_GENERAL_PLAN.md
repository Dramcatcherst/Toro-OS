# TORO — Plan General

**Status:** CURRENT MASTER PLAN
**Date:** 2026-09-28
**Master product:** TORO
**Visible brand/product:** TORO
**Reference implementation:** Dreamcatcher Hotel
**Current readiness:** INTERNAL PROOF — external onboarding blocked by readiness gate

## Alineación transversal de datos Alegra ↔ Supabase — 15/10/2026

**DECISIÓN DEL PROPIETARIO:** todo el trabajo nuevo se alinea al Plan General único y a las autoridades de datos existentes. No se fusionan ciegamente bases ni se recrean tablas/Brain/ledger. Supabase conserva estado operativo TORO, claves de integración, evidencia, control y proyecciones; Kross manda en PMS vigente; el total comercial confirmado al huésped en Booking se conserva como evidencia de reserva; Alegra conserva facturación y contabilidad, Hacienda estado fiscal, y bancos el movimiento real. Airtable y Google Sheets son superficies humanas; Dropbox conserva originales; GitHub contratos y versiones. La interoperabilidad exige clave externa/tenant, versión, fecha, idempotencia, permisos, conciliación, readback y receipt verificables.

**AUDITORÍA VERIFICADA:** el 15/10/2026 se pudieron leer Alegra y Supabase; Alegra muestra 1.191 facturas y 11 centros de costo en la conexión operativa, mientras un tercer enlace muestra cero: no confundir accesos. Supabase ya tiene `finance.*`, `integrations.source_authority_rules`, `integrations.external_dependency_registry`, `public.sync_outbox`, `operations.tasks` y los registros de ejecución. No hay prueba de paridad ni escritura contable general desde el conector de esta conversación. Existe incidente RLS de las tablas `roles` y `user_roles` en `dreamteam-recovery-sandbox`; reparar mediante políticas probadas, no activación ciega. No extrapolar snapshots Kross a vivo ni cifras de CSV Booking a total comercial final.

**CONTRATO Y GATES** en [TORO_DATA_ALIGNMENT_ALEGRA_SUPABASE_2026-10-15.md](TORO_DATA_ALIGNMENT_ALEGRA_SUPABASE_2026-10-15.md): mapa por dominio, correspondencias existentes, Booking/Kross y cierres diarios, comprobantes XML/facturas, cumplimiento, idempotencia, seguridad, prueba de conciliación de muestra, integración de solo lectura, writer gated separado, deduplicación y decommission con backup/restore. Esta ampliación es subordinada al Plan General, sin nuevo backlog ni scheduler.

**ESTADO:** HECHO = inventario de lectura y contrato incorporado en main mediante PR #299; PROPUESTO = piloto y mejoras controladas; BLOQUEADO = writer Alegra, frescura comercial Kross y paridad de source IDs; DESCONOCIDO = fingerprint fiscal de cada enlace y completitud histórica por período. **GATE:** no mutar Alegra, reservas, facturas, RLS ni eliminar bases antes de pruebas, aprobación adecuada y recibos independientes.

## Gmail personal y limpieza controlada — 15/10/2026

**Gobierno:** TORO Personal/User Vault + TORO Comms del Plan General ÚNICO; la cuenta personal del propietario jamás se incorpora como buzón de la organización Dreamcatcher ni se comparte con sus administradores o empleados. La fuente de verdad de correo, etiquetas, papelera y suscripciones permanece en Gmail. La memoria privada de TORO guarda solo hechos permitidos, con origen, motivo, plazo y ámbito; no una segunda copia masiva del buzón.

**Implementación comprobada:** [PR #292](https://github.com/Dramcatcherst/Toro-OS/pull/292) fusionado en `main`. Guard de permisos personales, clasificador conservador, pruebas y [contrato del módulo](TORO_PERSONAL_GMAIL_ADMIN_GATE_V1.md) integrados en el repositorio. NO acredita OAuth de TORO, ejecución autónoma, despliegue productivo ni cuota liberada. La conexión autorizada de ChatGPT Gmail está operativa *solo en el entorno de ChatGPT*.

**Limpieza solicitada por el propietario — política aplicable desde hoy:**
1. Eliminar ruido sin duplicar bases, agentes, tareas ni schedulers: continuar el seguimiento `TORO Correos y Pagos` existente, distinguiendo lectura rutinaria de mantenimiento de bandeja y archivando la evidencia operacional privada fuera del repositorio público.
2. Clasificar por mensaje y por conversación: revisar recibidos/enviados, distinguir publicidad realmente prescindible de notificaciones de cuentas y conservar siempre reservas, contratos, facturas, bancarios, visas, seguridad, documentos personales, confirmaciones y cualquier hilo relevante. Prohibido depender solo de la etiqueta 'Promociones' para borrar.
3. Reversible primero: etiquetar/archivar o mover publicidad revisada a papelera; cancelar boletines solo desde el control oficial de Gmail o una solicitud autenticada del remitente (no abrir enlaces de phishing). No cancelar una suscripción de pago ni retirar alertas transaccionales por interpretar "unsubscribe" sin distinguirlas.
4. **Almacenamiento:** la operación de Gmail "mover a papelera" NO equivale a liberar GB. Medir consumo actual de Gmail/Drive/Photos en Google One; conservar prueba/recuperación de mensajes de valor; eliminación definitiva solo con selección verificada y autorización, seguida de comprobación de cuota. El conector ChatGPT disponible no ofrece vaciado definitivo de la papelera ni administración de filtros de Gmail. No afirmar espacio recuperado sin lectura de cuota.
5. Automatización futura: completar OAuth **por usuario** del runtime TORO, vault secreto server-only, ownership personal, grants mínimos, RLS y denegación de scope organizacional; cursors incrementales y dedupe; canario de un correo con lectura/antes/después/receipt; retry y rollback; **sin** Domain-Wide Delegation, contraseñas de aplicación, cuotas pagas ni nuevas automatizaciones. Envíos externos, permisos, configuración y destrucción definitiva siguen aprobaciones separadas.

**Estado:** políticas/código probados en CI; operaciones de ChatGPT realizadas con Gmail real, cuyos conteos por buzón permanecen en reporte privado; OAuth/productivo, gestión de suscripciones de proveedores y espacio real liberado pendientes de verificación. Reutilizar controles del Plan General y no reinterpretar código como ejecución runtime.

---

## Public Brain perimeter — local correction, 2026-09-30

Same TORO portal; no second app or source of truth. Public presentation defaults to synthetic `/brain` and `/` redirects there. Server allowlist admits only GET/HEAD for that page and its static assets; other pages, APIs and mutation methods fail closed. Provider guards also prevent database, connector, session and approval-ledger I/O in demo, even if credentials/capability flags exist. This is not client-side hiding and not Vercel authentication.

`TORO_DEPLOYMENT_MODE=internal` is an explicit server deployment decision, not authorization from a visitor. Unset, misspelled or other values remain public demo. Internal Brain/Owner Attention retain independent flags plus identity/scope/RLS; legacy connectors/ledger additionally require exact `TORO_LEGACY_OPERATIONS_ENABLED=true`; task persistence requires exact `TORO_INTERNAL_WORK_WRITE_ENABLED=true` plus its existing role/scope checks. None of these flags is configured by this change. Disabling the demo alone cannot activate these business reads/writes. Internal legacy routes still need a separate authentication review before any public internal-runtime deployment; this unit does not certify them.

Initial 30/09 authorization was local only. On 10/10 Mauricio accepted reconciliation against current main, synthetic tests and the previously authorized PR/protected preview. Remote merge, production, real data, env, credentials and permission changes remain excluded. Runtime promotion is a separate gate and must rebuild/revalidate with production configuration. No schema migration. Reversal is the focused own delta, never a reset of the shared repository. Execution/receipt: Tasks 4–5 in the existing `TORO_CEREBRO_IMPLEMENTACION_2026-09-30.md` and BRAIN-LOCAL block of `CONTINUAR.md`; no runtime activation claimed here.

Verified locally: 359 Vitest + 25 Node tests, validators, lint and production build pass; 112 HTTP checks include 11 built assets, anonymous/synthetic-cookie requests, blocked operational GET/POST and server-action paths, root redirect, Brain RSC and no outbound/ledger I/O attempts. Owner Attention preserves its exact 503/disabled response through the perimeter. Next data-path normalization is disabled for the perimeter; Brain is force-dynamic. Mutation of the demo guard produced 36 expected failures; restored before final verification. Independent review closed with no outstanding findings. Public hosting and real identity/RLS operation remain unverified by this unit.
Integration 10/10 extends the same perimeter to authenticated MCP/bearer setup, injected-client entry points, Worker client and write primitives, health/canary routes and OAuth metadata. Event Ops and the hotel directory keep their existing identity paths, covered by no-I/O regressions. Existing internal capability, role and scope contracts are preserved; demo guards do not grant internal authority. Final local combination against `540d9b8c3de61ae339ef505b4eb6073a821b3fb1`: 481 Vitest + 25 Node tests and 136 HTTP checks pass, with zero outbound/ledger attempts in the synthetic HTTP harness. Build passes. ESLint has no errors; the existing unused OAuth OPTIONS request warning remains. Independent review of `1acae26..d7c3df2` found no actionable defects; the later main deltas add no demo guard changes and is covered by the final suite plus directory regressions. Review/remote evidence belongs in the same execution receipt; this paragraph is not a claim of publication or real RLS verification.


## WhatsApp de recepción, cuenta personal y respaldo integral — 13/10/2026 CR

**DIRECTIVA AUTORIZADA por Mauricio:** recopilar comunicación observable y permitida del WhatsApp de recepción (alias protegido, terminación 4004) y de su WhatsApp personal (terminación 3792), enlazarla con toda la operación TORO y asegurar archivos/recuperación; lo no comprobado queda planeado. Números completos en binding protegido, nunca en este repo público. **Scope:** Dreamcatcher + Mauricio Personal privados; **owner:** TORO Comms, Systems/Tools/Identity, Personal, Data/Assets y dominios afectados. Reutilizar issues #122/#170/#209; no nueva base, master plan, inbox o scheduler.

**TARGET:** cuenta/chat/evento -> identidad/scope -> journal autorizado y adjuntos -> clasificación/autoridad -> objeto canónico existente -> revisión/acción permitida -> evidencia -> respaldo/restore. Cobertura entrantes/salientes, histórico/nuevo, directos/grupos y media explícita; no prometer datos inaccesibles. Reader separado de responder/enviar. Personal no visible para hotel por defecto; compartir solo datos empresariales seleccionados y permitidos.

**CURRENT verificado por metadata:** registro organizacional communication_channel_bindings existe con RLS; un canal openclaw distinto de los dos solicitados aparece healthy/verified, pero last_sync_at=null; dependency registry OpenClaw sigue needs_audit. Contradicción registrada, no resuelta por inferencia. No binding organizacional de los dos números solicitados; modelo User Vault nominal y host privado sin validar. WeSpeak activo en registry no prueba ese WhatsApp conectado. No lectura real, enrolamiento, envío ni restore efectuados.

**NEXT P0:** comprobar host/runtime y cuenta recepción; resolver identidad/alcance/efectos de captura; piloto hasta 20 eventos y 1 caso operativo, replay y prueba negativa. **P1:** cuenta personal aislada (hasta 10 eventos/1 compromiso), archivo y restore por scope. **P2:** backfill y ampliación por lotes con límites/checkpoints/huecos visibles. Matriz completa de dependencias, respaldo y aceptación en [TORO Comms, sección 19](TORO_COMMS_V1.md); ver [runbook actual](../runbooks/TORO_OPENCLAW_RUNTIME_AUDIT.md). Los contratos de documentos/fotos en Studio 10–12 permanecen incluidos en esta misma propuesta.

**Respaldo objetivo:** estado privado/index en Supabase; originales/exportes autorizados en Dropbox con separación empresarial/personal, checksum/manifest y ACL; contratos/redacciones en GitHub; Pages/Airtable/Portal como proyecciones. Probar restore de datos + binarios + permisos; no declarar backup por existir carpetas. RPO <=24h/RTO <=4h son objetivos iniciales por validar, no SLA vigente.

**Terminado:** una captura real por cuenta produce fuente, scope y objetos conciliados; replay sin duplicado, cero filtración personal, archivos recuperables y falla visible. Kross conserva autoridad comercial; banco/procesador/Alegra conservan las suyas. No cambios tarifarios, pagos, mensajes externos, permisos amplios o publicación por haber leído un chat. Estado documental autorizado; integración y recuperación E2E UNVERIFIED hasta prueba.

## Reporte de recepción integrado y preparación operativa 2026 10 08


**CORRECCIÓN APROBADA por Mauricio el 11/10/2026, 22:42 CR — lavandería y menú:** Dreamcatcher no tiene equipos ni lavandería propia para huéspedes. Recepción coordina con un proveedor externo: recoge la ropa en la mañana y la devuelve en la tarde; ropa entregada en la tarde se devuelve al día siguiente en la mañana. No añadir una hora exacta de corte ni prometer precio/cupo sin confirmación del proveedor. Esta directiva sustituye respuestas que presentan lavandería propia o horarios rígidos no corroborados. Aplicar en el conocimiento existente de WeSpeak/TERE y las superficies de servicio vigentes, sin nueva base. Retirar **“pesca del día”** del menú y de respuestas/recomendaciones cuando se actualice el contenido existente; no sustituirlo por otro plato sin autorización. Fuente: instrucción directa del propietario y [reporte de recepción](https://chatgpt.com/space/page_a6890f7962f88191abe44f53672fd8d4). Estado documental: aprobado y registrado; actualización efectiva de WeSpeak/menú y entrega al huésped/proveedor aún pendientes de sesión autorizada y readback. La tarifa/cupo de lavandería para el 12/10 sigue pendiente; responder al huésped o coordinar respuesta temprana por el canal autorizado, sin afirmar entrega realizada.



**ACTUALIZACIÓN AUTORIZADA 09/10/2026 — entrega personal por OpenClaw/WhatsApp:** Mauricio solicita recibir estas alertas por el canal privado existente y preparar su ejecución en Work. Encargo integrado en [issue #209](https://github.com/Dramcatcherst/Toro-OS/issues/209), con dependencias #122 (identidad) y #170 (lectura); no crear segundo backlog ni scheduler. Work/Codex es ejecutor acotado bajo TORO Comms + Sobresito y el Control Plane, no nueva autoridad. La autorización cubre una prueba no sensible y futuras alertas materiales/urgentes al propietario verificado; no grupos, huéspedes, nuevos gastos ni acciones financieras/comerciales. El worker de recepción conserva su Page, casos, deduplicación y triggers completos; adaptar solo entrega mediante el puente existente. Estado: encargo documentado, sesión de Work adicional no iniciada, autenticación y envío actuales sin prueba. Antes de declarar operativo: verificar host/sesión/identidad, obtener referencia de entrega de una prueba y una alerta real, probar replay sin duplicados y denegación por identidad/scope incorrectos. Mensajes “🧪 PRUEBA · Recepción”, máximo 120 palabras y enlace Page; sin novedades, no notificar. Ante fallo o resultado ambiguo conservar alerta aquí, verificar estado antes de reintentar y no anunciar envío. Reversión acotada al adapter de entrega, sin pausar el webhook ni alterar corte Kross o cierres humanos.


**DIRECTIVA APROBADA por Mauricio el 08/10/2026.** [REPORTE RECEPCION](https://chatgpt.com/space/page_a6890f7962f88191abe44f53672fd8d4) es la vista operativa del hotel: huéspedes y canales comprobados, notas y antecedentes, cobros diferenciados, tareas/criterios de cierre, preparación hoy/mañana/7/30/90 días, Calendar y fechas especiales, MTD y comparación anual. No es otra fuente transaccional, CRM, cola o cerebro.

**HECHO:** Page ampliada y leída; Gmail hotel, Calendar y Contacts consultados; reservas TORO: 33 filas, snapshot 21/09, 0 live y 0 estancias 2025. Automatización `Alertas del reporte recepción` habilitada y vinculada a la Page por nuevos correos relevantes de admin@dreamcatcherhotel.com; filtra asuntos de reservas/OTA/WeSpeak/huéspedes/pagos/facturas/comprobantes y verifica relevancia antes de actuar. Primera ejecución por evento todavía NO VERIFICADA. No reactivar la alerta anterior pausada. No duplicar ingesta/cursors de TORO Correos y Pagos. La tarea actualiza Page y notifica internamente; no envía WhatsApp ni email a terceros.

**AUTORIDADES:** Kross conserva reservas, unidad, notas y condiciones; bancos/procesador verifican pagos; Alegra conserva contabilidad; TORO tasks/followups conserva acciones empresariales bajo Control Plane; Calendar conserva eventos; Contacts solo resuelve contacto; Tasks/Keep siguen sin adapter E2E verificado. Page preserva cambios humanos y cierres y deduplica por reserva/conversación/tipo de asunto más message_id. Teléfono internacional corroborado para wa.me; códigos de acceso, tarjetas, documentos y secretos no se publican.

**PREPARACIÓN:** usar Calendar existente y feriados conectados; separar celebración/día festivo/efecto laboral y confirmar eventos locales antes de alertar. Revisar hitos 7/3/1 días antes; aviso por delta material, plazo crítico o fallo nuevo. El worker por correo no garantiza revisión diaria de Calendar ni cambios exclusivos de Kross. Incorporar revisión de preparación y alertas al Team Brief y Cierre Diario existentes, sin scheduler paralelo.

**MTD Y 2025:** días completos del 1 de mes hasta ayer; parcial de hoy separado. Comparar mismo intervalo/propiedad/unidades/capacidad diaria/moneda/impuestos. Separar ingreso por estancia, cobros, cortesías/canjes y on-the-books. ADR=ingreso alojamiento/noches vendidas; RevPAR=ingreso/noches disponibles; ocupación=noches vendidas/disponibles. Ampliación de inventario requiere conjunto comparable. Sin datos históricos completos o snapshot a igual lead time: SIN DATOS, nunca porcentaje inventado.

**BLOQUEOS:** nueva consulta Kross requiere login en el navegador de Work; notas internas, nombres/contactos restantes y saldos sin completar. WhatsApp/OpenClaw sin receipt E2E; histórico 2025 y espejo actual insuficientes. No marcar recepción sincronizada ni MTD calculado. **Prioridad:** lectura Kross vigente y relevo de habitación 21 → conciliación de pendientes actuales → histórico comparable → verificación del primer evento automático. El catálogo de 100 controles adicionales en la Page es preparación priorizada, no 100 integraciones ejecutadas.

---

## Google Workspace operativo — Google Tasks, Keep, Calendar y servicios conectados (2026-10-07)

**DIRECTIVA APROBADA (Mauricio, 07/10/2026).** Integrar progresivamente los servicios oficiales de Google Workspace de `admin@dreamcatcherhotel.com` para capturar ideas, convertir solicitudes verificadas en trabajo, ejecutar/consultar desde TORO Portal/WhatsApp y mejorar colaboración, productividad y recuperación de información. Este texto amplía el plan **único**, no crea un segundo backlog, una nueva base, un nuevo administrador, un nuevo scheduler ni autoriza gasto o delegación de dominio. TORO Brain/Control Plane sigue la única autoridad de orquestación y aprobación empresarial.

### Identidades y estado observado

- **HECHO / conexión de ChatGPT validada 07/10:** Gmail, Google Drive, Google Calendar y Google Contacts operan bajo la identidad conectada `admin@dreamcatcherhotel.com`; Calendar principal tiene rol `owner`. En esa cuenta hay **solo un calendario editable propio** visible, los demás son suscripciones de feriados/fases lunares (sin otro calendario dedicado PayFlow/Operaciones confirmado). Gmail cuenta con etiquetas TORO/finanzas y HotelSwaps; estas etiquetas no son tasks. Google Contacts responde bajo la identidad hotelera; una coincidencia en «otros contactos» no prueba directorio corporativo, CRM completo ni autorización para enviar mensajes. Drive del hotel contiene documentación mixta: no realizar migraciones en masa ni confundirlo con la cuenta personal.
- **POR INTEGRAR / sin acceso de lectura/escritura verificado:** Google Tasks y Google Keep **no están expuestos como conectores directos disponibles en esta sesión de ChatGPT**. La conexión exitosa de Calendar NO demuestra acceso a Google Tasks, ni Drive a Keep. Las API oficiales existen, pero el estado de credenciales/scopes, edición y ejecución del adapter TORO sigue `NOT_VERIFIED`; nunca afirmar sincronización, inventariar listas/notas ni cerrar acciones sin una lectura real.
- **Identidad y límites:** `admin@dreamcatcherhotel.com` es el principal institucional; `mauricio.fernandez.toro@gmail.com` y otros buzones conectados son ámbitos separados. No copiar notas privadas, contactos personales, invitaciones, correo o tareas entre organizaciones/propiedades. La condición Super Admin observada en Workspace no concede permiso implícito para impersonación o domain-wide delegation. Priorizar OAuth por usuario y consentimiento granular. Mantener el mapa Workspace user/alias/grupo/routing existente, sin crear licencias nuevas por defecto.

### Contrato de autoridad: una acción, varias superficies

| Superficie | Función aprobada | Autoridad y regla anti-duplicación |
| --- | --- | --- |
| `operations.tasks` + Control Plane/Owner Attention | Tarea empresarial canónica, responsable, prioridad, fechas, bloqueos, ejecución, aprobación y receipt | **TORO único escritor lógico**. Consultar primero identidad existente, no crear segundo backlog en Airtable/Google Tasks/WhatsApp. |
| **Google Tasks** | Lista rápida del responsable, capturas, recordatorios y acciones humanas simples | Superficie personal/de cuenta y **proyección opcional** ligada al `toro_task_id`, o ingesta candidata. Sin mapeo no convertirla en compromiso empresarial. Las tareas creadas desde Docs/Chat pueden ser asignadas y de escritura restringida; conservar origen. |
| **Google Keep (Notes)** | Captura de ideas/notas de voz/texto, listas de compra preliminares, inspiración, incidencias preliminares | **Fuente de nota**, no ticket ejecutado ni memoria corporativa. Clasificar y extraer candidatos al mismo `operations.tasks` o `operations.knowledge_items` solo con alcance, consentimiento y verificación. Conservar `keep_note_name`/fuente; no subir todos los apuntes indiscriminadamente. |
| **Google Calendar** | Reuniones, bloques de tiempo, controles de pago y vencimientos previamente verificados | Proyección temporal de TORO/PayFlow. Eventos existentes son únicos por entidad+obligación+período+rol. No crear eventos de Calendar para cada Google Task ni duplicar facturas/forecast. Las tareas visibles dentro de Calendar siguen siendo tareas, no eventos consultables como los eventos de Calendar. |
| **Gmail** | Fuente de comunicación, facturas y evidencias de solicitudes | Gmail manda en mensaje, remitente, hora, adjunto e hilo; una etiqueta/correo/promesa NO crea automáticamente una tarea. Verificar enviado/contestación y consulta Kross/Alegra según dominio. Continuar mail_ingest vigente, sin scheduler nuevo. |
| **Google Drive/Docs/Sheets/Forms** | Documentación colaborativa, plantillas, formularios y evidencia | Drive conserva archivo/ACL; TORO guarda enlace/hash/provenancia, no duplica todos los binarios ni reemplaza Dropbox como archivo original en flujos acordados. Docs permite minuta/acción propuesta; Google Forms, si se usa, debe alimentar staging y control antes de abrir tarea, sin crear segunda base operativa en Sheets. |
| **Google Contacts** | Localización de direcciones y roles para seguimiento autorizado | Directorio/contacto y su procedencia, **no CRM maestro** ni verificación de identidad del empleado. Dedupe por ID Google + email normalizado/entidad y cotejo explícito con TORO People; no enviar ni invitar sin alcance. |
| **Google Chat, Meet, Apps Script, Admin, Business Profile, Search Console, Analytics/Ads/Hotels** | Colaboración, reuniones, automatización de bajo código, seguridad, descubrimiento/marketing | Solo cuando existan cuentas, APIs y permisos reales y caso de uso rentable. Cada uno es un adapter/capacidad en catálogo existente, no otro sistema de mando, CRM ni scheduler. Mantener autoridad comercial de Kross. |

**Mapeo mínimo sin nuevo esquema:** usar `integrations.source_authority_rules`, `integrations.external_dependency_registry`, `operations.tasks`, `operations.knowledge_items`, `operations.communication_followups` y capacidades existentes. Enlazar `tenant/org_id`, `account_email`, `source_system`, `source_object_id` (`tasklist_id+task_id` para Tasks o `notes/*` para Keep), `toro_task_id`, `origin`, `modified_at/etag`, `last_seen`, `sync_direction`, `permissions`, `evidence/receipt` donde la estructura existente admita esos datos de forma segura. No alterar tablas por esta directiva; diseñar mapping y comprobar unicidad/RLS antes de cualquier cambio estructural.

**Flujo:** observación/captura → identificar actor y empresa → clasificar nota/mensaje/tarea/calendario → resolver autoridad y duplicados → propuesta de task/knowledge existente → aprobación cuando corresponda → `task → toro_execution_run → lease/fencing → worker → readback → receipt` → estado presentado en Portal/WhatsApp y, si permitido, proyección a Google. Si el usuario marca completada una tarea proyectada en Google, registrar **señal de posible cierre**; cerrar en TORO solo con criterios/evidencia y autorizaciones. Evitar bucles de eco mediante `source_object_id+version/etag+origin` y reconciliación incremental. Prohibir replay destructivo, borrados en cascada y ciclos de sincronización no reversibles.

**Limitaciones de API verificadas en documentación de Google:** Google Tasks expone listas, tareas y actualización por `tasks.googleapis.com`, pero `due` API representa fecha, no hora ni deadline; no prometer sincronización horaria/recordatorios exactos a través de ese campo. Google Keep API (`keep.googleapis.com`) está orientada a administración empresarial; ofrece crear/listar/consultar/borrar notas y modificar permisos, **no un método general de edición/patch de nota existente**. Diseñar Keep como lectura/captura/no destructivo, no espejo bidireccional editable. Verificar elegibilidad Workspace/scopes antes de implementación; evitar domain-wide delegation como atajo. Referencias: https://developers.google.com/workspace/tasks/reference/rest ; https://developers.google.com/workspace/tasks/reference/rest/v1/tasks ; https://developers.google.com/workspace/keep/api/guides ; https://developers.google.com/workspace/keep/api/reference/rest/v1/notes .

### Entrega por fases y criterios de aceptación

1. **P0 — Inventario y seguridad:** en el proyecto/tarea existente `google_control_plane_readonly_map_20260826` / `toro_surface_capability_parity_20260922`, registrar estado de conexión por servicio, identidad hotelera, scopes mínimos, restricciones Google Tasks/Keep, accesos reales por rol y dependencias. Primero inventariar listas/notas **solo tras OAuth funcional**; contar objetos sin exponer material privado; establecer baseline de duplicados y no crear listas nuevas. Gate PASS: listado de cuentas/scopes/list IDs o evidencia explícita de bloqueo y mapa de autoridades aprobado.
2. **P1 — Piloto Google Tasks:** habilitar Tasks API desde el conector corporativo existente (no un segundo gateway), OAuth read-only inicial, muestrear máximo 20 tareas relevantes y contrastar con `operations.tasks`/tareas Kross. Seleccionar un único caso reversible de tarea humana: TORO → Google Tasks y actualización de vuelta como señal, comprobando `task_id`, `etag`, identidad, separación de ámbitos y cero duplicados. Solo pasar a escritura luego de autorización/gate + receipts. Gate PASS: 1 caso E2E verificado, 0 duplicados/0 cierres falsos y manejo de reintento/edición concurrente.
3. **P2 — Piloto Keep:** verificar que API empresarial y consentimiento funcionen para esta cuenta. Capturar selectivamente 10 notas **de trabajo** con origen y sin secretos; agrupar ideas repetidas, extraer máximo 3 acciones candidatas, enlazar a tarea/knowledge existente o dejar revisión humana. No importar notas personales ni borrar/sobrescribir Keep. Gate PASS: 10/10 con fuente/tenant, 0 filtraciones y candidatos aceptados/rechazados con trazabilidad; si Keep API no es elegible, mantener uso manual + Docs como alternativa de notas editables institucionales, no pagar plataforma nueva.
4. **P2 — Productividad Google completa:** mejorar Gmail → seguimiento/recepción sin automatizar respuestas; Calendar → horarios existentes/PayFlow sin duplicación; Contacts → mapeo proveedores/empleados respetando identidades; Drive/Docs/Forms → evidencias/minutas y formularios con ACL. No aplicar cambios masivos de Google Ads/GBP/Hotel Center ni crear usuarios Shared Drives/administradores hasta diagnóstico por sistema y efecto económico.
5. **Monitoreo permanente SIN tarea nueva:** agregar revisión compacta de `Google Workspace connector health, scopes, errores, tasa de tareas duplicadas, pendientes críticos Google/TORO, uso real y costo marginal` al **reporte semanal existente `Estado semanal TORO` de los viernes 17:00 Costa Rica**. Distinguir CONNECTED, READ_ONLY, WRITE_GATED, NOT_CONFIGURED, AUTH_REQUIRED, ERROR; exigir fuente/fecha y delta frente al corte previo. Usar `TORO Correos y Pagos` diario para extraer acciones de mensajes existentes, no reanalizar en paralelo ni escribir Google Tasks/Keep sin worker. Solo escalar fallos que comprometan tareas críticas, privacidad, costos o ingresos.

**Indicadores objetivos:** tareas nuevas candidatas / aprobadas / duplicadas; % tareas humanas críticas con owner y fecha; desfase detección→triage; % cierres con readback+receipt; notas útiles procesadas (denominador inspeccionado); contactos duplicados reales; correos accionables sin respuesta; Calendar eventos PayFlow huérfanos; gasto adicional por integración (objetivo `$0` hasta justificar licencias/API o coste real). No contar documentación o conexión como ahorro/rentabilidad ni declarar sincronización LIVE por existir un plan.

**Estado de ejecución al cierre de esta decisión:** plan/documentación APROBADA; los conectores Gmail/Calendar/Drive/Contacts leídos y verificados; Tasks y Keep `NOT_CONFIGURED/NO_DIRECT_CONNECTOR`; adapter y E2E `NOT_STARTED/UNVERIFIED`. No se crearon Google Tasks, notas Keep, calendarios, usuarios, permisos, nuevos backlogs ni tareas programadas en este paso.

---

## Rentabilidad y conversión sostenibles — directiva de Mauricio 2026-10-06

**Scope:** cada negocio autorizado y aislado en TORO; piloto Dreamcatcher Hotel / Toro by Dreamcatcher.  
**Owners:** TORO Revenue + TORO Finance + TORO Channels; TERE para conversión.  
**Existing project:** `revenue_booking_stack`. **State:** CURRENT política aprobada / NEXT verificación por canal.

TORO debe buscar de forma continua oportunidades verificables para aumentar la rentabilidad, utilidad y conversión del negocio dentro de su alcance autorizado. Priorizar contribución y utilidad sostenible sobre ocupación, tarifa de lista o ingresos brutos aislados. Comparar ingresos después de descuentos financiados por el hotel, comisiones, cobros de pago, costos incrementales de desayuno/servicio, cancelaciones y reembolsos; separar impuestos por remitir. No inventar costos, ahorro o mejora de utilidad. Medir el resultado antes de declarar una optimización exitosa.

### Avisos materiales de canales — corte 2026-10-07

**CURRENT — aviso de Booking.com, todavía no verificable como liquidación aplicada:** el comunicado recibido por Atrapasueños el 07/10/2026 anuncia que desde **17/11/2026** el IVA/GST o impuesto de ventas equivalente formará parte de la **base sobre la cual Booking.com calcula su comisión**. Según el mismo aviso, las reservas creadas antes de esa fecha mantienen el cálculo anterior. Esto no confirma un porcentaje nuevo de comisión ni acredita la aceptación, contrato actualizado o cargos efectivamente liquidados. Fuente: correo Booking.com `1a11563e0ee53505`. **NEXT:** TORO Revenue/Finance debe revisar el anexo y el ejemplo real en la Extranet durante noviembre, comparar antes/después por fecha de reserva y alojamiento, y recalcular contribución neta sin cambiar tarifas, Kross, descuentos, contratos o pagos por este aviso. Fecha de control en Google Calendar: 17/11/2026, no vencimiento de factura.

### HotelSwaps — canal de intercambio gobernado / piloto Asia 2026

**ACTUALIZACIÓN 07/10/2026:** Mauricio confirma mantener las tres habitaciones ya depositadas (#1811446), sin añadir ni retirar noches. No se ha modificado HotelSwaps ni Kross; sigue pendiente conciliar disponibilidad para prevenir sobreventas. Alerta existente de ChatGPT ampliada a HotelSwaps, Booking.com, Expedia, Airbnb, Agoda, Kross y mensajes urgentes de huéspedes, con lectura horaria de Gmail y deduplicación; no es sincronización ni alerta instantánea. Para revisar el portal, la sesión móvil no se comparte; el navegador conectado necesita inicio de sesión propio. No incurrir en servicios web automatizados de pago sin aprobación.



**ALCANCE Y OBJETIVO (owner 07/10/2026):** Se integra de manera PERMANENTE a `revenue_booking_stack` de Dreamcatcher Hotel como canal de intercambio complementario, NO como segunda OTA monetaria ni proyecto independiente. Objetivo a corto plazo: financiar noches de alojamiento de 2 adultos durante viaje de finales octubre–noviembre 2026 en Tailandia, Vietnam, Camboya, Bali/Indonesia, Seúl/Corea. Crear valor real de habitaciones con baja probabilidad de venta en octubre, protegiendo ventas monetarias, precio y categoría. **Decisión:** continuar Basic (sin fee anual) y no comprar Premium hasta resultado neto comprobado. La nota de investigación y evidencia (NO autoridad normativa) está en [HOTELSWAPS_EVALUACION_Y_PILOTO_ASIA_20261007.md](../research/HOTELSWAPS_EVALUACION_Y_PILOTO_ASIA_20261007.md).

**Cuenta e identidad (observado):** administración identificada en portal con cuenta `admin@dreamcatcherhotel.com`, Hotel Manager Mauricio Fernández, Dreamcatcher Hotel, membresía Basic ID `1888663`; el contrato permite que Hotel Manager desempeñe Swap Manager sin crear otro usuario. Capturas del propietario (07/10) muestran 0 Coins balance hotel; 0 Coins balance Guest; texto **1000 Coins available for transfer** (contradicción operativa NO resuelta: no contabilizar como saldo real, no transferir sin prueba). Portal autenticado NO accesible desde conectores actuales: navegador móvil no comparte sesión; Opera Browser Connector desconectado; TinyFish sin cookies signed-in para hotelswaps.com. Ningún QA privado ni consulta de reservas Asia se declara HECHO por la captura.

**Estado de depósito y riesgo P0 (evidencia):** correo Gmail `1a114c1203b601db` comunica depósito `1811446` de 3 habitaciones 06–18/oct/2026, equivalente a 36 habitaciones-noche ofertadas si cupo uniforme. Pantalla 08–17/oct muestra 3 room(s) deposited/día, sin referencias de huésped en filas visibles (no certifica otras fechas). En depósitos, cualquier miembro con saldo puede RESERVAR EN EL ACTO; contrato exige honrar reservas. **Control obrigatório:** comparar cada día + la reserva con Kross autoritativo y proteger capacidad/cupo estándar doble equivalente para evitar OTA doble venta desde antes de publicar. Si no hay cupo protegido, retirar solo noches NO reservadas; nunca retirar/cancelar noches ya confirmadas sin flujo de huésped y políticas. Las solicitudes sin depósito son no vinculantes hasta aceptar, permiten aprobación/rechazo previa consulta Kross. No compartir acceso o automatizar mutaciones sin gate humano y receipt.

**Unidades y categoría:** el contrato limita depósitos/reservas a habitaciones dobles estándar. Preselección analítica no vinculante #2, #5, #9, #10, #7 según catálogo canónico y Kross real. Excluir suites premium #25/#26, #11 familiar/apartamento, #21/#22 familiar, villas, Mini (staging) y Santa Toro (negocio separado). Mapping físico NO confirmado; todas las ofertas equivalen a estándar doble prometida a otro miembro y deben cumplir requisitos publicitados. Fotos, nombre, servicios, baños/camas, ubicación, políticas desayunos, impuestos, acceso, check-in/out, cancelación y capacidad requieren QA de `Your hotel account`.

**Economía y contabilidad:** Basic genera 75% de HotelCoin Schedule para **reservas entrantes CONFIRMADAS**; depósito por sí solo genera 0. Coins hotel no vencen mientras membresía; Guest transferidos o comprados 2 años, con política de cancelación de reservante por plazos, fees no reembolsables. Cuota outbound Basic GBP 0.08/EUR 0.09/USD 0.10 por coin; compra externa USD 0.50/coin según proveedor, sin valor de caja garantizado. No confundir coin, ingreso/cobro, tarifa ADR, reserva, crédito y cash; Finance/Alegra solo con tratamiento fiscal/contable validado; KPI principal ahorro real de hotel Asia vs pago efectivo equivalente, neto fees, costo variable anfitrión y ventas desplazadas. Cualquier valor ~1USD/coin es reivindicación del proveedor, no liquidez garantizada.

**Test de destinos 07/10/2026 (VERDAD ESPECÍFICA):** catálogo público identifica Karma Kandara (Bali) desde **420 HotelCoins/noche**, SIN disponibilidad real en noviembre; compra hipotética de todos los 420 coins y fee básico en USD = USD 252/noche, excluyendo impuestos extras, si aplica precio publicado. Histórico NO confirma activo: Bach Suites Saigon (Ho Chi Minh, 2018), 4 Rivers Floating Lodge (Tatai Camboya, 2014), Paradise Beach Resort (Koh Samui Tailandia, 2014), Hotel Mera Mare (Pattaya Tailandia, 2017). Para Bach Suites un sitio OTA informa referencia USD 196 impuestos incluidos, 2 adultos, 02/11/2026, sujeto a cambios; HotelCoin desconocido. Bangkok, Chiang Mai, Phuket, Seúl, Hanói, Siem Reap: SIN oferta privada comprobada, no declarar ausencia. NEXT: en la sesión autenticada buscar destinos (también request-only), fechas 2 pax dentro 30/10–20/11/2026, capturar pantalla de precio exacto HotelCoins, fee, cuarto, disponibilidad instant/request, condiciones y comparar con hotel oficial/OTA mismas fechas. Reservar solo mediante aprobación y evidencia.

**Reputación/experiencia:** HotelSwaps declara ~436-437 miembros en 73/74 países; no significa reservas, ni disponibilidad en objetivo. Marriott documenta colaboración tecnológica de HotelSwaps para HotelHelp 2024, distinta del éxito del mercado privado de HotelCoins. Escasez de opiniones independientes recientes, testimonios propietarios autoseleccionados 2017; no inventar tasa de conversión ni recomendar Premium por promociones. Validar demanda real local y tiempo promedio del depósito con soporte.

**Operación, integraciones y alertas:** Gmail etiqueta existente `60.1 · HOTELSWAPS` y `Viaje Tailandia 2026 / Canjes`; borrador en hilo `1a110fb6527231a2` requiere envío humano, estado DRAFT al 07/10, no presentarlo como proveedor contactado. Ya existe ChatGPT watch `HotelSwaps alertas urgentes` HOURLY (correo Gmail), no enviar duplicado y no presentarlo como instantáneo ni WhatsApp. Los avisos accionables de reservas/cancelaciones/solicitudes/coins van a TORO Comms -> Owner Attention -> ejecución gobernada; Kross sigue escritor único comercial. Registrar recepción, confirmación, chequeo PMS, bloqueo, check-in/out, acreditación y canje con IDs y readback. Roles: owner/aprobación Mauricio; revisión operativa recepción solo en alcance autorizado; TERE no oferta disponibilidad no confirmada. Dropbox almacena originales si hay documentos verificables nuevos, sin carpeta/archivo duplicado o secretos. No añadir Crexi al channel stack: es plataforma de venta/compra de inmuebles comerciales, tema separado del canal de intercambio.

**Backlog canónico SIN DUPLICAR:** Airtable fuente `DC-HOTELSWAPS-CHANNEL`, tareas `HOTELSWAPS-1811446-RECONCILIATION` (P0, cupos Kross, fechas y saldo), `HOTELSWAPS-PILOT-GUARDRAILS` (P1 categoría+Asia+economía y políticas); no crear nuevas tareas, worker, dashboard ni base. Fases/Done: 1) snapshot autenticado de portal y comparación Kross por cada día 06–18/oct con 0 oversell; 2) revisión completa perfil hotel, permisos, balance real vs 1000, depósitos/reservas y políticas; 3) al menos 3 pruebas de destino con fechas/fees y 1 estadía asiática reservable/solicitud aceptada demostrada; 4) piloto 30 días: coins netos recibidos, canjes concretos confirmados, ahorro neto demostrado; en ausencia de canjes, reducir exposición y mantener Basic pasivo. Semanales reportar solo deltas materiales, no newsletters.

**Fuentes y procedimientos:** https://www.hotelswaps.com/hotel-terms-conditions ; https://www.hotelswaps.com/about-us-faq-hotels ; https://www.hotelswaps.com/about-us-faq-guests ; https://www.hotelswaps.com/membership-options ; https://www.hotelswaps.com/members ; https://serve360.marriott.com/wp-content/uploads/2024/06/Marriott_Statement_2024.pdf . Capturas owner y Gmail son evidencia operativa, no transacción confirmada.


### Contrato de ocupación, desayuno y suplementos de Dreamcatcher — 2026-10-07

Autoridad: aclaraciones y aceptación de Mauricio del 2026-10-07. Este contrato sustituye la tabla de objetivos/lista del 2026-10-06; aquella queda como evidencia histórica de configuración, no como política futura obligatoria. Supabase `content.hotel_facts/additional_person_pricing`, `guest_age_categories` y `breakfast_price` conservan el contrato estructurado; Airtable mantiene su referencia humana. Kross y cada canal siguen siendo autoridad sobre configuración aplicada y cotización vigente.

| Regla | Criterio aprobado o estado |
| --- | --- |
| Moneda objetivo | USD; cambio de moneda de propiedad Agoda solicitado, todavía pendiente de confirmación |
| Ocupación incluida | 2 personas en habitaciones y 12 en villas; no equivale a la capacidad máxima |
| Edades | Bebés 0–3, niños 4–10, adultos desde 11; todos cuentan dentro de la capacidad |
| Desayuno | US$15 finales por persona y desayuno; separado del alojamiento y protegido frente a descuentos del alojamiento |
| Tarifa con desayuno | Incluye a adultos y niños; para bebés solo a solicitud, a US$15 por desayuno. No duplicar cargos |
| Capacidad Dreamcatcher Villa | 27 personas, habitaciones 0–6; no ofrecer una plaza 28 sin nueva verificación |
| Otras villas | Makaiza 7–11, capacidad 17; Toro 21–28, capacidad 29. No duplicar villa y componentes |
| Mascotas | Hasta 10 kg; cualquier cargo y condiciones adicionales requieren su fuente vigente |

Conflicto de implementación pendiente: `src/lib/toro-data.ts`, objeto `mkz`, todavía describe Makaiza para 15–20 personas. Es un descriptor anterior que contradice el máximo 17 coincidente en Airtable/Supabase; no debe usarse para prometer capacidad. Este lote documental registra la discrepancia, sin acreditar corrección de la interfaz ni publicación comercial. El registro Airtable de hotel completo también requiere conciliación: declara 20 habitaciones/74 personas, pero enlaza 19 y omite la 22.

Recomendación de alojamiento elegida bajo la delegación del dueño: niño 75% del suplemento adulto de **alojamiento**; bebé sin suplemento si no necesita cama extra, pero contando en capacidad. El desayuno completo no recibe ese porcentaje. El importe adulto de alojamiento y el tratamiento fiscal aún requieren costos, margen y prueba por canal. Estas reglas registradas no prueban que Kross, WeSpeak ni las OTA hayan cambiado; conservar términos de reservas confirmadas.

- Para cada canal, comparar la misma unidad, fecha, ocupación, régimen y condiciones antes/después de promociones, incluyendo límites de edad 3/4 y 10/11, redondeo y tratamiento fiscal. Comprobar que desayuno suma US$15 por servicio al total final; una derivación porcentual fija no lo garantiza.
- Calcular un suplemento de lista mediante el multiplicador marginal solo cuando se haya demostrado qué descuentos/impuestos le aplican. No reutilizar US$50/100 ni suponer 70% de descuento como receta universal.
- **Agoda bloqueado:** mantener inactivos RO 24359579 y BB 24531249 hasta confirmar USD, importes/ocupación y recepción desde Kross. Solicitud en caso 1120368076318197504; no duplicarla ni reactivar para resolver un error de plan inactivo.
- Conservar nombres, IDs, slugs y enlaces Kross. No cambiar camas, capacidades o fotos por inferencia; las seis correspondencias Agoda provisionales requieren prueba de identidad.
- Para grupos, ofrecer hasta tres combinaciones útiles con disponibilidad simultánea y enlaces permitidos por el canal; no prometer exclusividad sin evidencia.
- Mantener una sola política versionada con fuente, aprobación, evidencia y estado por canal. Supabase conserva datos/control; Airtable referencia; Dropbox originales; no crear nuevas bases, monitores o planes paralelos.
- Optimizar fotos, etiquetas y amenities únicamente contra evidencia de la unidad correcta. Medir conversión hasta reserva e ingreso confirmado; visitas o etiquetas no demuestran más ventas.
- Aprender capacidades reales de cada herramienta mediante configuración observada, pruebas acotadas y lectura posterior. Registrar límites y correcciones reutilizables sin copiar datos privados entre negocios ni declarar dominio experto por documentación.
- Priorizar contribución neta y conversión verificables. Ningún cambio documental demuestra incremento de utilidad ni publicación comercial.

### Mejora continua y control

Usar el Control Plane y las tareas existentes: observar -> priorizar por valor -> ejecutar dentro de autorización -> verificar -> medir -> conservar o revertir. La directiva no reactiva ejecutores suspendidos, no crea otro plan/base/agente/scheduler y no amplía permisos, presupuesto o envíos externos. La siguiente ejecución debe cerrar el primer bloqueo material con evidencia, sin repetir una auditoría completa.

**Aceptación del despliegue tarifario:** suplemento final comprobado por canal y régimen en fechas autorizadas; evidencia de guardado y lectura posterior; costos/margen identificados o marcados desconocidos; ningún nombre Kross alterado; reservas existentes respetadas. Una política guardada o texto WeSpeak actualizado no demuestra que el motor de precios u OTA ya esté alineado.

---

## Inventario desde facturas y WhatsApp de aseo 2026 10 13

**DIRECTIVA APROBADA por Mauricio el 13/10/2026:** ampliar el flujo existente de TORO Compras e Inventario para que las líneas de compra recibidas por correo, XML/PDF, foto o chat preparen automáticamente entradas de inventario y los retiros reportados en el grupo de aseo preparen salidas, traslados o bajas. PayFlow es la orquestación financiera documentada; “Flash” queda sin identidad/capacidad verificada y no se le asigna otro procesamiento. Reutilizar TORO Correos y Pagos, mail_ingest, OpenClaw/WhatsApp, Control Plane y la tarea `ops_ws_housekeeping_laundry_stock`; sin otra base, cola, scheduler ni reprocesamiento masivo.

**Estado:** configuración aprobada y registrada; extracción, escritura automática y captura viva del grupo NO VERIFICADAS. Este registro no activa procesos, no acredita compras/recepción ni modifica existencias o contabilidad.

### Entradas desde compras

1. Reutilizar la ingesta actual; preferir XML cuando exista, leer PDF/foto como alternativa, conservar documento original y procedencia.
2. Extraer por línea: proveedor, clave/número de factura, fecha, artículo/SKU/alias, marca, presentación, cantidad facturada, unidad, factor de conversión, precio/costo, moneda e impuestos separados, negocio/propiedad/proyecto, ubicación y referencia de fuente.
3. Resolver producto y presentación contra catálogo existente. Artículo nuevo o ambiguo pasa a revisión, sin fusionarlo por similitud. Separar consumibles, activos y servicios/gastos no inventariables; excluir compras personales u otra propiedad sin asignación explícita.
4. La factura crea compra/entrada pendiente y datos del catálogo. El stock disponible aumenta solo por cantidad efectivamente recibida y confirmada, incluido un comprobante que pruebe entrega. Facturación, pago y recepción son eventos distintos; admitir entregas parciales sin sumar toda la factura.
5. Reusar `assets.stock_items`, `assets.stock_levels`, `assets.inventory_movements`, `assets.purchase_runs` y `assets.purchase_run_items`; activos en el maestro físico existente. Supabase es destino después de paridad/conteo verificados; Airtable Inventario & Activos mantiene el papel definido por el contrato vigente. Alegra conserva contabilidad; Dropbox conserva originales; Portal y WhatsApp muestran proyecciones del mismo saldo.

### Salidas desde el grupo de aseo

Interpretar mensajes naturales por empleado/turno/propiedad autorizados y conservar message_id, autor, fecha, texto/evidencia, artículo, cantidad, unidad, origen, destino y motivo. No exigir otra app. Formato breve sugerido: “Retiré 2 litros de cloro de bodega para Toro”.

- **Traslado:** baja en bodega y alta en área destino; total del hotel sin cambio.
- **Consumo:** descuenta cantidad consumida del área correspondiente.
- **Baja, daño o pérdida:** movimiento específico y evidencia/revisión proporcional.
- Blancos/equipos enviados a habitación o lavandería cambian ubicación/estado, no desaparecen del inventario.
- “Se acabó”, “saqué jabón” o cantidades/unidades/ubicación dudosas crean excepción dirigida; no inventar saldo ni movimiento. Pedir solo el dato faltante cuando la ingesta y el canal estén operativos.

### Configuración y controles

Habilitar extracción automática y validación como primer paso; contabilizar movimientos automáticamente solo con producto/unidad/ubicación/recepción o consumo inequívocos, identidad autorizada, baseline físico verificado y piloto aprobado. Clave de deduplicación por organización + factura/proveedor/clave fiscal + línea + recepción parcial; para WhatsApp, organización + canal + message_id + movimiento. Correo y foto de la misma factura producen una sola compra; reporte de recepción y factura no suman dos veces; ediciones/reenvíos son nuevas versiones, no movimientos adicionales.

Convertir caja/paquete/botella/galón a unidad base mediante presentación verificada; no asumir equivalencias. Bloquear negativos y conservar diferencias para conciliación física. Correcciones/devoluciones usan reversos o movimientos compensatorios con referencia al original, sin borrar historial. Nota de crédito financiera no equivale por sí sola a devolución física. Alerta al llegar al mínimo/punto de reposición confirmado; sugerir lista de compra existente, sin pedidos o pagos automáticos. Alertas por excepción material y fallo nuevo, sin notificar cada mensaje.

### Ejecución y terminado

Responsables por rol: sistemas TORO configura ingesta/mapeo/deduplicación; administración/finanzas valida factura, costo y ámbito; encargado de aseo/bodega confirma recepción, unidad y conteo; Gerencia supervisa excepciones. No se asignan nuevas personas ni fechas de compromiso.

**Ahora:** verificar baseline vigente, lectores disponibles y stock físico, mapear diez productos frecuentes y resolver aliases/presentaciones/unidades. **Después:** piloto sobre cinco facturas y diez reportes reales autorizados de aseo, con recepción parcial, duplicado correo/foto, traslado, consumo, baja, devolución, mensaje ambiguo y stock insuficiente. **Terminado:** cada caso con fuente y recibo/readback; cero duplicados, cero mezclas de ámbitos, cero negativos y conciliación de saldos contra conteo. Meta propuesta: al menos 90% de líneas del piloto identificadas sin recaptura manual; medir entradas/salidas verificadas, excepciones, demora y exactitud de saldo con denominador. Nada de esto se reporta como ahorro o automatización activa hasta verificarlo.

Si falla lectura/escritura o el resultado es ambiguo, conservar el candidato sin tocar stock, continuar el registro manual en el sistema autoritativo y verificar antes de reintentar. Reversión: desactivar solo el adapter de movimientos y usar compensación trazable para escrituras confirmadas; conservar el resto de correo/PayFlow.

Referencia canónica: `operations.knowledge_items/procurement_inventory_operating_contract_2026_09_v1` y `operations.tasks/ops_ws_housekeeping_laundry_stock`.


## Correos y PayFlow — continuidad permanente 2026-10-07

**Decisión de Mauricio:** mantener de forma indefinida el análisis de correos y la conciliación del calendario de pagos, ampliando la extracción de información útil. Reutilizar **una única tarea diaria existente** (`TORO Correos y Pagos`, 08:00 America/Costa_Rica, RRULE diario sin fecha de fin), el control `PayFlow Semanal` de los lunes y el forecast mensual a 90 días; no crear un segundo Finance Guard, plan, bandeja o scheduler ni reactivar escritores financieros suspendidos.

**CURRENT observado 07/10:** tres buzones Gmail y uno Outlook autorizados para lectura selectiva; censo/checkpoints en `integrations.mail_ingest_*` con historia **incompleta**. Google Calendar vinculado de `admin@dreamcatcherhotel.com` sigue como interfaz de pagos existente, sin calendario separado `TORO PayFlow · Dreamcatcher`. Se verificaron y crearon tres eventos privados de control basados en facturas/recibos, y se corrigió el estado documentado de un evento previo de Alegra. Los identificadores por factura, período y evento permanecen en el seguimiento operacional, no en este plan rector. Crear eventos manuales con evidencia no certifica un sincronizador persistente.

**Alcance de extracción:** recibidos y enviados; nuevos y lote histórico desde checkpoints; facturas PDF/XML, montos, vencimientos, emisor/receptor, propiedad/entidad, comprobantes, bancos, servicios/NISE, comisiones y reservas OTA, suscripciones/renovaciones, contratos, seguros, CCSS/impuestos/permisos, mantenimiento, incidencias de servicio, atención de huéspedes, oportunidades comerciales, seguridad y fallos de sistemas. Separar alcance hotelero, otras propiedades y datos personales. Aplicar ID por buzón+mensaje/hilo, documento y período; no reiniciar backfill, duplicar obligaciones, persistir secretos ni prometer 100% sin censo completo.

**Contrato del calendario:** documento/proveedor gobierna la fecha de factura y vencimiento; banco/procesador gobierna salida de caja; Alegra gobierna asiento; Kross gobierna reserva/tarifa. Supabase PayFlow conserva obligación/estado/observación, y Google Calendar es proyección humana. Cada entrada diferencia emisión, vencimiento oficial, fecha interna de control y pago acreditado. Identidad idempotente `tenant + obligation_key + period + event_role`: buscar primero y actualizar **el mismo evento** cuando llegue evidencia nueva; una factura reemplaza el pronóstico del mismo ciclo. Diferenciar CONFIRMADO, ESTIMADO_POR_HISTORIAL, REQUIERE_VERIFICACION y PAGO_CONFIRMADO_POR_PROVEEDOR (aún sin conciliación bancaria). No registrar estimados de 90 días como deudas definitivas ni proyectar datos personales/otras propiedades al calendario hotelero.

**GATE de automatización:** la tarea diaria revisa, clasifica, detecta vencidos/riesgos y prepara diffs; **no escribe automáticamente al Calendar ni a Supabase Finance** sin worker autorizado, idempotencia, lease/fencing, verificación y receipt del Control Plane. La actualización manual expresamente solicitada el 07/10 se realizó sobre eventos privados después de buscar duplicados y leer facturas; esa intervención no prueba auto-sincronización futura. Avisos a Mauricio/Carolina por WhatsApp requieren identidad, canal OpenClaw y envío verificados aparte. No pagos, asientos, envíos de correo, cancelaciones, cambios de reservas/servicios, permisos ni destrucción desde esta tarea.

**NEXT:** (1) consolidar nuevos correos desde último checkpoint sin avanzar cursores por solo lectura; (2) reconciliar facturas/recibos contra obligaciones, cuentas y eventos existentes, incluyendo incidencias con posible corte y saldos disputados, sin duplicar; (3) comprobar y habilitar solo mediante su tarea canónica una proyección Calendar idempotente del Finance Worker, con readback y rollback antes de llamarla automática. El lunes se presentan vencimientos de 7/21/90 días por entidad y moneda. Actualizar este Plan General únicamente si cambian política, arquitectura, riesgos o dependencias; el detalle rutinario queda en receipts y calendario.

---

## Autonomy consolidation + OpenAI surface strategy — 2026-10-01

**Owner:** TORO Governance + TORO Agents + SOBRESITO. **State:** CURRENT cleanup / NEXT worker bridge.

- **Legacy execution cleanup completed in ChatGPT Scheduled Tasks:** paused TORO Portfolio Coordinator, CONTROL Lane, OPERATE Lane and GROW Lane; BUILD Lane, Progress Watch and Finance Guard were already paused. The direct `Barrido financiero 2026` executor and direct PayFlow `Cierre diario TORO` executor were also paused because they can mutate canonical finance/accounting state outside the new Control Plane.
- **Retained scheduled work is transitional:** read-only reports/monitors, personal watches and narrowly scoped domain workflows may remain scheduled while each is classified and migrated. A schedule is a trigger/report surface, not execution authority.
- **Single execution invariant:** material autonomous work uses `canonical task -> public.toro_execution_runs -> lease/fencing -> bounded worker/agent -> verification -> public.toro_execution_receipts`. No Dot, Work thread, plugin, scheduled task or Codex session may own parallel task/run/completion state.
- **Plan General invariant:** every material run maps to a canonical project/task/subsystem. Routine successful receipts do not bloat this document; material changes to architecture, objective, policy, dependency, risk or program direction do.
- **Worker Runtime v1:** merged to current `main` in commit `c6dc1822f41d84d6c57ccd4aa1948240892e8050`; backend-only Supabase worker client prefers modern `sb_secret_*` configuration and exposes typed claim/lease/transition/retry/receipt primitives. Application-level activation remains gated on canonical Vercel deployment/config proof.
- **TORO MCP read runtime:** merged to current `main` in commit `fd4806307f0950a2b501c3aab37acf78987a91be` as a disabled-by-default authenticated read bridge for ChatGPT/Work/Dots/Plugins. It exposes permission-filtered Brain/search/priorities/business status/decisions/receipts only; no Control Plane write/claim tool is enabled. Activation remains gated on canonical deployment, OAuth/resource URL configuration and authenticated isolation tests. Stale PR #222 is superseded.
- **OpenAI surface map:** `docs/product/TORO_OPENAI_SURFACE_MAP_V1.md` defines Projects as human context hub, Work as substantial delegated executor, Dots as persistent mission workers, Plugins/Apps as capability packaging/connections, MCP as governed interoperability boundary, Agents SDK as code-first agent loop, tracing as observability, Codex as implementation worker, Scheduled Tasks as triggers/reports, and Sites as presentation.
- **Actor/surface registry:** `docs/product/TORO_ACTOR_AND_SURFACE_REGISTRY_V1.md` is the classification contract for Dots, specialists, temporary workers, Scheduled Tasks and interfaces. Scheduled work is trigger/report/watch by default; only documented transitional exceptions may write outside the Control Plane, and those must migrate.
- **Recommended human front door:** one ChatGPT Project named `TORO`, using Chat for fast collaboration and Work for substantial tasks. This Project is not source-of-truth; Supabase/GitHub/domain systems remain canonical.
- **Dot promotion rule:** PUMBA is the first persistent Control Dot. Finance/Operations/Guest-Revenue/Growth/Build remain candidates until workload and measurable value justify permanent Dots.
- **Vercel deployment audit:** current Vercel `toro-os` is observed as Vite/manual legacy; `toro-os-v03` deployment metadata points to legacy repo `Dramcatcherst/toro-os-v88-new`. Neither is accepted as deployment authority for canonical Next.js repo `Dramcatcherst/Toro-OS`. Contract: `docs/product/TORO_VERCEL_CANONICAL_DEPLOYMENT_V1.md`.
- **Worker canary contract:** `docs/runbooks/TORO_WORKER_CANARY_V1.md` prepares a disabled-by-default, authenticated L1 deployment probe mapped to existing task `toro_surface_capability_parity_20260922`. It uses a targeted run-id claim and atomic verified completion so a deployment smoke test cannot lease unrelated work or finish without its receipt.
- **Worker canary sandbox proof:** targeted claim isolation + atomic receipt/completion + rollback all PASS with zero persistence. Evidence: `docs/evidence/TORO_TARGETED_WORKER_CANARY_SANDBOX_VALIDATION_2026-10-01.md`.
- **Worker canary production primitives:** migration `20261002003241_toro_targeted_worker_claim_v1_20261001` applied; targeted claim + atomic verified completion are service-role-only and read back correctly. Transaction-only production probe PASS and rolled back to the pre-existing run/receipt state. Evidence: `docs/evidence/TORO_TARGETED_WORKER_PRODUCTION_READBACK_2026-10-01.md`. HTTP canary remains disabled pending canonical Vercel deployment.
- **MCP/PUMBA activation contract:** `docs/runbooks/TORO_MCP_PUMBA_ACTIVATION_V1.md` defines authenticated negative isolation QA, read-only PUMBA entry, receipt/trace separation, 10-cycle L0/L1 observation gate and kill switches before any L2 consideration.
- **NEXT:** establish one canonical Vercel project sourced from `Dramcatcherst/Toro-OS`, configure backend/public Supabase variables without exposing values, verify `/api/system/runtime-health` with MCP disabled, deploy exact current-main SHA, run a safe L0/L1 worker cycle through the production Control Plane, correlate trace/correlation IDs, then bridge PUMBA. Only after that migrate the remaining transitional executor or promote another Dot.

## Control Plane runtime implementation — 2026-09-30

**Owner:** TORO Governance + TORO Agents + SOBRESITO. **State:** CURRENT production Control Plane active / NEXT application worker deployment.

- **Canonical basis already verified in Supabase:** `operations.knowledge_items/toro_master_execution_contract_v1` defines one Supabase/TORO control plane, L0-L4 execution authority, evidence-first completion, bounded retries, single-writer behavior, leases/fencing, dead-letter handling and receipts. This lane implements that existing contract; it does not create a second plan or authority.
- **Existing work selection remains canonical:** `operations.tasks`, `operations.toro_task_execution_v1`, `operations.toro_execution_actor_v1`, `operations.toro_autonomous_action_queue_v1` and `operations.toro_owner_attention_v1` continue to own task state, routing/selection and owner attention.
- **Durable runtime active:** production now has execution runs + receipt envelopes with lease/fencing, bounded retry/dead-letter and verification constraints; upstream task/selection authority remains separate.
- **Production-surface hardening:** preflight verified `service_role` has no `USAGE` on `operations`; TORO will not broaden that schema. Runtime envelopes/RPCs are therefore narrowed to `public.toro_execution_*` with RLS on, no client policies, `anon/authenticated` revoked and minimum `service_role` grants. Upstream task/selection authority remains in `operations`.
- **Sandbox verification:** exact narrowed draft PASS for duplicate-claim prevention, fencing, retry, verification gates, L4 blocking, cross-tenant FK isolation and minimum privileges; exact rollback script also PASS. All sandbox transactions were rolled back. Evidence: `docs/evidence/TORO_CONTROL_PLANE_PUBLIC_RUNTIME_SANDBOX_VALIDATION_2026-09-30.md`.
- **Production migration:** `20261001051843_toro_control_plane_runtime_v1_20260930` is applied in canonical Supabase. Current runtime tables are `public.toro_execution_runs` and `public.toro_execution_receipts`; current verified evidence includes at least one L2 run with `succeeded/passed` plus its verification receipt. Contract: `docs/product/TORO_CONTROL_PLANE_RUNTIME_V1.md`.
- **Risk model invariant:** business severity (`Low/Medium/High/Critical`) and execution authority (`L0-L4`) are separate dimensions. L3 remains human-gated; L4 is not claimable by autonomous workers.
- **Dot invariant:** PUMBA/future Dots are persistent mission workers over this control plane. They may not own a parallel backlog, permission model, memory authority or completion state.
- **NEXT gate:** canonical Vercel project/config -> protected runtime-health readback -> exact-main deployment -> safe L0/L1 application Worker run + verified receipt -> authenticated MCP read QA -> PUMBA bridge -> only then wider Dot/autonomy expansion.
- **Authority ceiling unchanged:** production Control Plane storage is active, but no external write, money movement, reservation/rate change, publication or permission expansion is authorized merely by runtime availability.

## WhatsApp / OpenClaw repair intake — 2026-09-29

**Owner:** TORO Comms, with TORO Identity, Operations, Finance and Systems. **State:** CURRENT gap / NEXT controlled implementation. This is part of the existing WhatsApp Same-Brain lane.

- **Observed in production Supabase:** one WhatsApp/OpenClaw binding is connected/verified and marked healthy, while the external dependency still says `needs_audit` (last audited 2026-09-22). `integrations.communication_channel_sessions` and `integrations.communication_channel_receipts` exist but each has zero rows, as does `public.employee_channel_identities`. This is configuration evidence, not live TORO execution proof. The Gateway, existing `toro-openclaw-integration` worktree and exact `Capability unavailable` trace were not accessible here. The agent report says text/media/transcription and `chat_id` reach the channel; that report does not prove canonical persistence.
- **Prepared in local code review:** `src/features/openclaw/channel-ledger.ts` defines hashed transport identity, fail-closed authorization, record validation and distinct DENIED/UNAVAILABLE/STALE states. The revised `supabase/drafts/20260929_toro_comms_durable_channel_ledger.sql` adds only content and structured-record storage over the existing sessions/receipts, with search indexes and rollback. It is not applied or connected to WhatsApp.
- **NEXT diagnostic gate:** run `scripts/openclaw-host-diagnostics.mjs` on the existing authorized Gateway host and inspect its sanitized summary alongside the integration worktree and a bounded failure trace. This read-only probe does not verify or repair live WhatsApp identity, ledger writes or capabilities by itself; root cause and rollback evidence must precede runtime changes.
- **Current mirror limit:** `operations.reservations` has 33 rows, latest `snapshot_as_of` 2026-09-21 09:28 UTC; `operations.current_reservations_safe` has zero rows. The Kross snapshot health rows observed on 2026-09-24 are marked stale. These sources can support labeled historical/reference reads only, never occupancy or arrivals "today".
- **Next:** inspect the existing adapter and sanitized failing trace; bind Mauricio through the existing verified channel identity flow; route the adapter through TORO's current permissions and receipts; test owner-only history and replay-safe guest-list persistence. Restore/verify mirror freshness before current reservations/occupancy/aseo reads. Keep Kross paid access deferred and Alegra writes separately approval-gated.
- **Promotion gate:** prove context compaction, restart, long history, duplicate replay, wrong user/org, revoked binding, stale mirror, media failure and backup/restore on the actual host. No costs, external messages or new connections from this lane without owner authorization.

# 1. Final direction

TORO is the master intelligence, memory, governance and orchestration layer for a person's work, businesses, projects and authorized external relationships.

TORO should eventually allow one Principal to operate a complex portfolio through:

- one TORO identity;
- one personal TORO context;
- multiple organizations/businesses/workspaces;
- multiple projects/products;
- isolated external clients/allies;
- one governed tool/connector fabric;
- one communication fabric;
- one permission and approval model;
- one evidence/audit model;
- reusable skills learned without leaking private scope data.

The operating/execution layer is an internal capability of TORO, not a second product or brand. Legacy names such as `TORO OS` and `toro_os_*` may remain in technical keys, repositories or integrations only until they can be migrated safely.

Normal users experience **one TORO**.

**TARGET product experience — 2026-09-29:** The finished-product definition in section 23 specifies one owner operating the authorized portfolio through TORO, with the Brain, role views, evidence and permitted work in one experience. Dropbox documents and the full-plan visual reader are projections of this General Plan; they may not become a parallel plan.

---

# 2. Product hierarchy

## TORO
Master brain:
- identity;
- scope graph;
- memory;
- knowledge;
- governance;
- orchestration;
- learning;
- portfolio intelligence;
- system auditing;
- proactive improvement.

## TORO operating/execution layer
Execution capabilities inside a business/workspace:
- dashboards;
- workflows;
- tasks;
- approvals;
- operating views;
- automations;
- WhatsApp/Portal actions.

## TORO subsystems
Internal capabilities:
- TORO Identity
- TORO Personal
- TORO People
- TORO Comms
- TORO Guests
- TORO Concierge
- TORO Operations
- TORO Finance
- TORO Revenue
- TORO Growth
- TORO Studio
- TORO Projects
- TORO Knowledge
- TORO Tools
- TORO Agents
- TORO Data
- TORO Governance
- TORO Assets
- TORO Research
- TORO Channels
- TORO Systems
- TORO Builder
- TORO Exchange (conditional experiment)

## TORO Concierge — group & event coordination

**Owner decision — 2026-10-01:** TORO Concierge is a reusable subsystem of the single TORO product for coordinating multi-person trips, events, retreats, family groups and hotel-hosted experiences. **Los 50s de Caro** is the first live design/pilot. It is not a separate brain, task system, payment system or communication authority.

Pilot scope:
- participant identity and roster intake;
- self-selected teams/groups with exclusive membership at a given planning stage; no fixed leader required by default;
- allow a participant to create a provisional missing invitee for review;
- itinerary, transport legs, lodging, rooms, meals, activities, polls/preferences and day-by-day coordination;
- public sanitized event portal plus private participant profile/survey;
- group-wide and segmented messaging/reminders through TORO Comms/Channels;
- daily run-of-show, checklists, incidents, changes, receipts and follow-up;
- budget scenarios by participant count/age tier, fixed-vs-variable costs and source quotes;
- transparent common **group-favor fund** for shared extras/improvements with final reconciliation rules;
- separate **voluntary solidarity contribution** flow (e.g. 100/200/other) to help participants who need support. Public/group display may be anonymous, but TORO/admin retains minimum accounting traceability. It is not represented as a tax-deductible charitable donation;
- playful social layer such as event nicknames: nickname may be changed during the experience while the real participant identity remains visible in secondary text, with moderation/opt-out and audit history. Nicknames never replace canonical/legal identity.

Los 50s survey/portal interaction target:
1. choose who you are from the canonical participant list;
2. load known non-sensitive data and ask only for missing/correctable fields;
3. choose team members; a person already assigned to an active team cannot be claimed by another team without an explicit move/release;
4. no leader badge is imposed in the public flow unless the team itself selects one;
5. Costa Rica residents can mark flight legs as not applicable;
6. activity interest is explicitly not a reservation or charge;
7. private fields (phones, flights, allergies, payments, internal notes, support status) never appear in the public portal.

Architecture rules:
- reuse TORO Identity, People, Guests, Comms, Finance, Projects, Knowledge, Channels, Assets and Governance;
- Supabase/control-plane remains canonical for TORO-owned runtime/workflow state; domain systems retain their own authority;
- Airtable may remain the transitional structured source for the Los 50s pilot while mappings are explicit;
- messaging, purchases, reservations, refunds, money movement and external commitments follow existing TORO action ceilings and approval policy;
- every material action follows **Intent → Policy → Approval → Execution → Verification → Receipt → Memory**;
- the public event site is a sanitized projection, never an authority or private-data store.

Future reuse target: Dreamcatcher groups, weddings, retreats, birthdays, corporate groups and other authorized TORO-managed experiences, without duplicating concierge logic per event.

---

## TORO Dashboard — unified product surface

TORO Dashboard / Portal is the role-aware visual surface of the same TORO Brain.

Canonical contract:
- `operations.knowledge_items/toro_dashboard_surface_v1`
- `docs/product/TORO_DASHBOARD_V1.md`

Core navigation:
- Brain (role- and scope-filtered entry);
- Today / Attention
- Money
- Studio
- Customers
- Operations
- People
- Growth
- Legal & Risk
- Assets & Spaces
- Projects
- Systems

Rules:
- dashboard is not a source of truth;
- modules do not create parallel databases, task systems, approvals or notification centers;
- role visibility comes from the shared identity/membership/capability model;
- every material widget exposes source authority, freshness, attention state and next action;
- TARGET default internal home is the authorized Brain composition, not Today/Attention or the technical cockpit; each role receives a useful initial focus and an equivalent list, while Today remains one-tap operational attention;
- TARGET role composition: Cerebro is visible Module 0 and the shared entry for owner and staff, with distinct authorized initial focus, immediate decisions or next work actions. The eleven domain modules retain their identities and order 1–11. Cerebro introduces no separate Brain, subsystem, task store or approval authority. The owner direction of 2026-10-10 supersedes the earlier restriction on a twelfth visible menu entry, not the single-Brain architecture.
- mobile/WhatsApp/desktop are different surfaces over the same Brain and action ceilings.

Existing Dashboard v1 implementation order (not the final entry route):
1. Today / Attention;
2. Money / PayFlow;
3. Studio;
4. then remaining modules using the same contracts.

**Owner product decision, 2026-09-30:** the final Portal starts in the connected Brain for every authenticated profile, filtered before projection by identity, context and capability. This changes the entry contract, not the inside-out build order or present runtime state. Brain, Today, Plan/Projects and the other modules are views of one TORO with shared object IDs and governed actions. A compact, viewport-oriented shell uses progressive detail; long evidence, forms, accessibility zoom and small screens may scroll normally. The public site remains a separate, sanitized projection. The reviewable interaction contract is in `docs/product/TORO_VISUAL_BRAIN_ARCHITECTURE_V1.md`; subordinate Dashboard and User Portal v1 entry wording is superseded accordingly. A visible node, listed connector or button is not proof of a live integration or permission to act.

### Owner Attention + PayFlow contract — 2026-09-28

Canonical subordinate contract:
- `operations.knowledge_items/owner_attention_comms_payflow_v1`
- `operations.knowledge_items/payment_inbox_map_2026_09_v1`
- `docs/product/TORO_OWNER_ATTENTION_PAYFLOW_V1.md`

Today/Attention and Money/PayFlow must project the same canonical exceptions to Portal and WhatsApp/OpenClaw. The owner does not monitor raw inbox volume. Email, WeSpeak and provider notifications are signals; only unresolved decisions, approvals, deadlines, risks, failed payments, unreconciled charges, response deadlines or material exceptions enter Owner Attention.

Routine successful receipts remain evidence/digest unless another rule makes them actionable. No payment, contract acceptance, reservation/rate write, permission change, DNS/MX change or destructive mail action is implied by appearance in Owner Attention.

**Local release hardening — 2026-09-30 (prepared, not deployed):** Owner Attention reads fail closed unless both server-only flags `TORO_BRAIN_CANONICAL_READ_ENABLED` and `TORO_OWNER_ATTENTION_READ_ENABLED` are exactly `true`. Missing, false or invalid values disable the route before context resolution/Supabase access; the direct provider independently enforces the same gate before creating a client. Disabled responses return HTTP503, `state: disabled`, `ownerAttentionAllowed: false`, with no projection or private diagnostics. Stage C v1 alone must not activate Finance; its existing scope remains Projects + Source Governance + Kross Health. Enabling both flags still requires the existing authenticated active organization membership and ADMIN/GERENCIA policy, then organization-scoped RLS reads. No flags, credentials, permissions or deployments are changed by this preparation. Synthetic regression coverage lives in `src/app/api/brain/owner-attention/route.test.ts` and the normal test command; production configuration and release authorization remain separate gates. This controls Owner Attention, not a certification that every project endpoint is demo-only.

---

## TORO Studio — governed creative & media capability


### Nombres humanos y curación fiel de documentos/media — 13/10/2026

**Scope:** TORO Assets/Studio/Governance/Channels; piloto Dreamcatcher dentro de Web, Marca, SEO y Reputación. **TARGET:** nombres legibles, originales intactos, clasificación por lugar/contenido y selección por objetivo; mejoras conservadoras sin alterar arquitectura ni ocultar defectos materiales. Reutilizar los contratos/índices actuales y `initiative_bindings.visual_commerce_dreamcatcher`, issues #6/#28/#30 y gates de PR #43; sin biblioteca, base, agente o publisher adicional.

**CURRENT comprobado:** propuesta PDF y cotizador HTML del retreat guardados en `/Dreamcatcher Hotel/Administracion/Retiros/2027`, con nombres humanos, lenguaje ES y versión v01; cargas completed y IDs/tamaños leídos. Muestreo visual encontró dos capturas web en la biblioteca; el set anterior de retreats prioriza candidatos de arte y usos múltiples sin pertinencia comprobada. Manifest Eagle de 05/07: 9.935 filas, no conteo live; índice actual Dreamcatcher: 60 assets, 44 sin subject_key, 55 requieren revisión humana y 10 assignments. No afirmar inventario completo ni reselección final.

**PROPUESTO / NEXT:** contrato detallado y texto común para ChatGPT/Codex en [TORO Studio, secciones 10–12](TORO_STUDIO_V1.md). Primero clasificar/reconciliar y seleccionar 30 originales representativos; luego un antes/después conservador, aprobación por versión/destino y sustitución gradual con rollback. Fotos/QR/tablas y claims siguen ligados al alojamiento correcto. Los nombres nuevos no autorizan renombrar archivos fiscales originales, internas Eagle ni rutas publicadas en masa.

**Límite:** esta propuesta documental y la referencia de contexto no modifican ajustes globales de ChatGPT ni activan edición/publicación/DB writes. Lo reutilizable es el método; imágenes y datos privados permanecen en su scope. La adopción automática y la mejora comercial requieren pruebas y medidas; ningún score técnico equivale a aprobación.


TORO Studio is an internal subsystem/capability of the single TORO product.

Canonical path:
`Growth + Assets + Channels > TORO Studio`

It does **not** create:
- a second brain;
- a separate visible brand;
- a parallel project root;
- a duplicate asset database;
- an independent permission/evidence model.

Its governed tools are:
- TORO Images;
- TORO Video;
- TORO Design;
- TORO Content;
- TORO Media Library;
- TORO Brand Guard.

Internal specialist roles may include Brand Guardian, Creative Strategist, Prompt Architect, Image Producer, Video Producer, Copy Editor, QA Checker, Asset Librarian, Publisher and Performance Analyst. These are routing roles inside TORO, not independent agents with separate authority.

Every material creative request must resolve at minimum:
`brand -> goal -> audience -> channel -> format -> CTA -> source authority -> references/assets -> approver -> privacy/rights -> success metric when applicable`.

Lifecycle:
`IDEA -> BRIEF -> DRAFT -> REVIEW -> APPROVED -> PUBLISHED -> MEASURED -> ARCHIVED`.

Core rules:
- no material creative output without a business purpose;
- one canonical brand/source-of-truth context per asset;
- never invent prices, dates, availability, amenities, claims or policies;
- distinguish real evidence, interpretation and synthetic content;
- preserve asset/version/prompt/reference/date/approver provenance;
- publishing, paid media and external commitments follow current TORO action ceilings;
- real rooms/installations/services preserve identity and fidelity;
- conceptual/generated illustrations are never presented as real commercial evidence;
- originals and derivatives remain related;
- learning remains tenant-scoped and evidence-backed.

Image baseline:
- 1:1, 4:5, 9:16, 16:9, A4 vertical/horizontal and thumbnail;
- promotional, informational, corporate, operational, educational, comparative, ad, branding, event and menu/product/service assets.

Video baseline:
- 6s, 15s, 30s, 45s, 60s, 90s, slideshow and story sequence;
- `HOOK -> MESSAGE -> PROOF/BENEFIT -> CTA`;
- preserve script, storyboard/shot list, captions, thumbnail, channel/version, approver and metrics where published.

TORO Studio reuses:
- TORO Design DNA;
- Identity/Scope Graph;
- Governance/Approvals;
- Knowledge;
- Assets;
- Data/provenance;
- Channels;
- current Drive/Dropbox media governance;
- existing Growth/Website/Brand workstreams.

Dreamcatcher Media/Brand remains a workstream inside Dreamcatcher Web/Marca/SEO/Reputación. TORO Studio is the reusable capability layer that can serve Dreamcatcher and future authorized organizations.

Canonical subordinate contracts:
- `operations.knowledge_items/toro_studio_v1`
- `docs/product/TORO_STUDIO_V1.md`

Human specification:
`TORO Studio — Creative & Media System` in Notion.

Current state:
- design approved and registered;
- image generation/editing exists through available creative tooling;
- Design DNA exists;
- media workstream exists;
- end-to-end asset registry/approval/publishing/performance runtime is not yet globally implemented or verified.

Next:
1. reconcile current media assets/folders;
2. close canonical brand kits and templates;
3. define asset metadata/version contract;
4. connect WhatsApp/Portal creative intake;
5. add QA/approval states;
6. pilot one recurring Dreamcatcher creative workflow;
7. automate publication only after permission/evidence gates pass.

---

## Specialist personas
Internal routing, not separate systems:
- TORO TERE
- TORO RICO
- TORO FIONA
- TORO SKY
- TORO SOBRESITO

---


## Brand identity canon — owner updated 2026-09-23

- **Only visible brand/product:** TORO.
- **Bull metaphor:** the bull represents the business as a large, powerful living organization.
- **Brain + microchip metaphor:** one fused symbol for biological intelligence + AI/computation; it receives signals, processes, learns, coordinates and turns information into action.
- **Visual identity:** the same owner-designated original blue bull, frontal, noble and powerful; gold horns and nose; deep navy background; integrated gold/blue brain-chip circuit emblem on the forehead.
- **Do not use:** bullfighting/violence imagery, a generic replacement bull, or TORO OS as a parallel visible brand/product/brain.
- **Current master:** `/TORO/Brand/01_Master/TORO_LOGO_MASTER_v1.png`, 1536×1536, SHA-256 `15a1b661a12cc020b905188e1638d001cc0a21d2a2f47beb4077843b478be747`.
- **Legacy wordmark:** the former `TORO BRAIN` text logo is archived and must not appear on new public surfaces.
- Brain remains an internal architectural metaphor, not part of the visible brand name.
- Professional closeout still requires: vector master, small-size/favicons, monochrome/reverse variants, typography/license specification, clear-space/min-size rules, durable rights evidence, trademark/domain checks and governed permanent-file storage.

---

# 3. Scope / portfolio architecture

TORO does not use a flat "client" model.

Entity concepts:
- Principal
- Portfolio
- Organization
- Business
- Workspace
- Property/location
- Project/product
- Client
- Ally/partner
- Supplier/provider
- Asset
- Human/agent worker

Relationships:
- owns
- controls
- operates
- manages
- works_for
- member_of
- client_of
- partner_of
- provider_to
- participates_in
- depends_on
- responsible_for

Isolation modes:
- private
- portfolio
- shared_project
- client_isolated
- public_reference

Default:
- Personal = private
- External client = client_isolated
- Owned business = isolated until portfolio crossing is explicitly enabled

---

# 4. Mauricio / Atrapasueños target model

Conceptual target:

```text
TORO
└── Mauricio [Principal]
    ├── TORO Personal
    ├── Portfolio
    │   ├── Atrapasueños [Organization / controlled scope]
    │   │   ├── Dreamcatcher [Business / Workspace]
    │   │   │   ├── Dreamcatcher property
    │   │   │   ├── Villa Toro
    │   │   │   └── Makaiza
    │   │   └── future businesses/projects
    │   ├── AI for Dreamers [separate product/project]
    │   ├── TORO Exchange / RicoSky [experiment]
    │   └── other owned projects
    └── external relationships
        ├── client business
        ├── ally
        └── partner project
```

TORO may cross-analyze owned/authorized scopes when useful.

External clients and sensitive scopes remain isolated.

**TARGET portfolio coverage — 2026-09-29:** The authorized overview must make Dreamcatcher, Santa Toro, Vista Alegre, Cabuya, TORO Business and existing owned projects discoverable with their documented type, status and relationships. This visibility does not reactivate inactive businesses, establish legal ownership, flatten properties into tenants or grant cross-scope access. TORO Business means internal use of TORO by its own business under the same controls, not an infrastructure-hosting decision.

---

# 5. User model

Each human receives:

- one TORO Identity;
- one logical TORO User Vault;
- Personal context;
- work-private context;
- organization memberships;
- organization roles;
- personal tools;
- organization tools;
- notification preferences;
- memory controls.

User Vault scopes:
- personal
- work_private
- work_org
- shared
- system

Personal data is not employer-visible by default.

**TARGET simple access — 2026-09-29:** A common entry URL uses individual identity and grants. Mauricio's owner view covers authorized controlled scopes; Carolina and Mauricio's mother receive only their explicitly configured scopes and capabilities. A family relationship or shared device does not confer access. See section 23 for role experiences and mobile/session acceptance.

---

# 6. Communication architecture

Owner: **TORO Comms**

Canonical subordinate mailbox/channel contract:
- `docs/product/TORO_COMMS_MAILBOX_BINDINGS_V1.md`
- draft schema: `supabase/drafts/20260928_toro_comms_channel_bindings.sql` (NOT applied)

Primary surfaces:
- WhatsApp/OpenClaw
- WeSpeak
- TORO Portal
- email / future channels

WeSpeak capability status — 2026-09-28:
- guest messaging/runtime remains active;
- vendor roadmap reports **Atender llamadas de Voz con IA = Completed**, but Dreamcatcher Voice activation/runtime is **UNVERIFIED**; canonical task `wespeak_voice_activation_20260928`;
- connected email evidence proves guest payment requests, SINPE instructions and payment-proof handoffs, but does **not** prove a native WeSpeak Payments processor is enabled; canonical task `wespeak_payments_capability_audit_20260928`;
- Voice and any future Payments capability must feed TORO Comms / Owner Attention / PayFlow and may not become a parallel inbox, payment ledger or authority.

Rule:
A conversation is not the work.

Pipeline:

`message -> identity/context -> privacy -> intent -> authority -> risk -> route -> canonical action -> evidence -> response -> follow-up`

Possible outcomes:
- answer;
- task;
- incident;
- handoff;
- decision;
- approval;
- guest reply;
- learning signal;
- escalation.

Messages never create permanent memory directly.

## Same-Brain communication and mailbox rule — owner directive 2026-09-28

WhatsApp/OpenClaw, email, Portal, WeSpeak and future channels are **surfaces over the same TORO Brain**. They may not become independent assistants, memories, task stores, approval systems or business truth layers.

OpenClaw/WhatsApp must be able to reach the full set of **authorized business capabilities and sources** through TORO context, routing and permission contracts, including Finance, Operations, Revenue, Guests, People, Projects, Knowledge, Systems, Assets and approved external connectors. "Access to everything" means capability parity with TORO for the active authorized scope; it never means bypassing tenant isolation, personal/work separation, RLS, approval gates, secret handling or source-authority rules.

Required runtime chain:

`WhatsApp/OpenClaw -> verified channel identity -> TORO context resolver -> capability/action router -> authoritative connector/source -> evidence/readback -> TORO response/follow-up`

Rules:
- OpenClaw must not store a parallel business personality, memory or backlog;
- the same Human Layer, organization context, roles, action ceilings and canonical tasks/projects apply across WhatsApp and Portal;
- personal/family/private scopes remain excluded unless the authenticated identity is explicitly authorized for that scope;
- material writes, money movement, tax/legal submissions, reservation/rate changes, permission changes and destructive actions remain approval-gated according to TORO Governance;
- secrets/tokens/passwords are never exposed to the WhatsApp model or persisted in messages; connectors broker access server-side;
- reconnect/replay must be idempotent and must not duplicate tasks, notifications or external actions.

### Dreamcatcher business mailbox coverage

TORO must inventory and bind every active Atrapasueños/Dreamcatcher business address before claiming complete email coverage. Current owner-confirmed addresses to reconcile:
- `info@atrapasuenos.net`
- `proveedores@atrapasuenos.net`
- `accounting@atrapasuenos.net`
- `admin@dreamcatcherhotel.com`
- `info@dreamcatcherhotel.com`
- `accounting@dreamcatcherhotel.com`

For each address, Google Workspace Admin must identify whether it is a user mailbox, alias, group, delegated/shared mailbox or routed address, plus owner/recovery/2SV/dependencies. Preserve legacy identities until dependency and recovery audits are complete.

Gmail remains email source authority. Supabase stores governed metadata, normalized classifications, provenance, follow-ups and selected extracted facts; it must not become an indiscriminate raw-mail copy. Production ingestion should prefer official Gmail APIs/push history once authorized. Browser automation is an exception/fallback for portals or unsupported surfaces, not the primary mailbox transport.

Current observed coverage on 2026-09-28:
- ChatGPT Gmail connector: `admin@dreamcatcherhotel.com` only;
- governed Gmail metadata index: 6,128 rows, all from the admin Dreamcatcher mailbox;
- Google Drive connector currently represents Mauricio's personal Google account, not the hotel Workspace tenant;
- therefore complete Workspace/email coverage is **NOT YET VERIFIED**.

---

# 7. Tool architecture

Owner: **TORO Tools**

Separate:
- Discoverable
- Available
- Connected
- Authorized
- Operational

Ownership:
- Personal tool
- Organization tool
- Delegated/hybrid

Generic capability layer:
- read/search
- draft
- create/update
- execute
- approve
- monitor
- notify
- export
- admin

Workflow logic should call generic capabilities rather than hard-code vendors where practical.

### ChatGPT App + MCP interface — approved 2026-09-30

**Canonical subordinate contract:** `docs/product/TORO_CHATGPT_MCP_CONTRACT_V1.md`  


TORO is platform-first and interface-agnostic. ChatGPT is one official interface to TORO alongside Portal, mobile, WhatsApp/OpenClaw and future surfaces; it is not a second Brain, database, permission system or execution ledger.

Canonical path:

**ChatGPT App / Apps SDK → TORO MCP → TORO Brain / Control Plane → policy + identity + scope → authoritative source/tool or delegated worker → verification/readback → receipt → TORO response**

Rules:
- critical business logic must not live exclusively inside ChatGPT;
- Supabase/canonical TORO state remains the durable source for governed memory, work state, permissions, provenance and receipts;
- OpenClaw and other workers remain governed execution channels and do not become alternate authorities;
- ChatGPT capabilities are exposed only when current identity, scope, source freshness and runtime capability are verified;
- unavailable or read-only capabilities must be represented honestly and fail closed;
- MCP/tool calls must be idempotent where replay could duplicate work;
- secrets remain server-side and are never exposed to the model or UI;
- every material action follows **Intent → Policy → Approval → Execution → Verification → Receipt → Memory**.

Initial MCP surface to design and verify:
1. `get_brain_status`
2. `search_toro`
3. `get_priorities`
4. `get_business_status`
5. `get_pending_decisions`
6. `get_execution_receipts`

Delivery sequence:
- **P0:** define the TORO MCP contract against the existing Brain/Control Plane; no duplicate data layer;
- **P1:** build a read-first TORO ChatGPT App and visual components for Brain, priorities, decisions and receipts;
- **P2:** prove authenticated scope, freshness labels, read parity and failure states;
- **P3:** add governed actions only where current ChatGPT/MCP/runtime capabilities and TORO policy gates are verified;
- **P4:** consider broader plugin/directory distribution only after internal reliability, isolation, recovery and product-readiness gates pass.

Current product-plan or provider limitations are runtime facts to verify at implementation time, not assumptions embedded into the architecture.

---

# 8. System auditing

Owner: **TORO Systems Auditor**

TORO must proactively verify important systems.

For each system:
- expected configuration;
- observed live configuration;
- version;
- drift;
- permissions;
- health;
- data freshness;
- security;
- backup;
- restore;
- owner;
- next audit;
- useful unused capabilities.

First reference profile: OpenClaw.

Future:
- Supabase
- GitHub
- Vercel
- Kross
- Alegra
- WeSpeak
- Dropbox
- Airtable
- network/device infrastructure

Maturity:
1. Observe
2. Explain
3. Recommend
4. Prepare change
5. Execute with approval
6. Safe autoremediate

---

# 9. OpenClaw current state

## CURRENT

Canonical registry:
- runtime dependency exists;
- state = `needs_audit / configured_unverified`;
- direct live config/session/log/health access unavailable;
- WeSpeak remains separately confirmed active.

Public baseline reviewed:
- latest published release as of 2026-09-22: 2026.9.5;
- extended-stable line: 2026.7.35;
- one Gateway = one trust boundary;
- multi-user DMs require isolation;
- group allowlists/mention gates;
- least-privilege tool profile;
- security audit + deep audit;
- backups/recovery;
- private Tailscale access preferred for remote laptop gateway.

## SAME-BRAIN execution update — 2026-09-28

Canonical Same-Brain code path is already part of TORO:
- PR #142 is merged;
- shared internal-work intake exists for canonical task/project work;
- WhatsApp remains TORO's primary conversational surface and Codex/Builder is a delegated worker, not a second assistant.

Still unverified live:
- actual OpenClaw Gateway host/worktree consumption;
- authenticated runtime-to-TORO connection;
- verified WhatsApp channel identity pairing;
- source/capability parity across authorized business connectors;
- continuity after reconnect/replay;
- duplicate suppression/readback across real WhatsApp actions.

P0 acceptance requires one real controlled run proving:
1. authenticated identity -> correct TORO organization/workspace;
2. read access to authorized cross-domain business context without leaking forbidden scopes;
3. task creation;
4. maintenance action intake;
5. project follow-up;
6. delegated Builder/Codex work;
7. reconnect/replay continuity;
8. notification/follow-up without duplicates;
9. source/evidence readback;
10. fail-closed behavior for unauthorized data/actions.

## UNKNOWN until host audit

- installed version;
- Node/Bun runtime;
- gateway bind;
- Tailscale mode;
- auth mode;
- dmScope;
- groupScope;
- WhatsApp allowlists;
- group policy;
- group map;
- bindings;
- tools;
- exec/elevated;
- agent ownership;
- backups;
- deep security findings;
- health/recovery.

## TARGET profiles

- `openclaw_personal_owner`
- `openclaw_company_shared`
- `openclaw_guest_channel`

Do not use one unrestricted personal Gateway as a shared employee/guest trust boundary.

## BLOCKER

Need authorized terminal/read access to the Gateway host to run the audit runbook.

---

# 10. DreamTeam / TORO People

DreamTeam is a legacy standalone implementation.

Canonical destination:
**TORO People**

Reuse:
- employee model;
- attendance;
- schedules;
- leave;
- payroll;
- loans/advances;
- self-service;
- RLS;
- audit/security.

Do not duplicate:
- Auth
- agents
- messages
- notifications
- approvals
- identity

### Dreamcatcher People — owner direction, 2026-10-01

Scope: Dreamcatcher Hotel; owner Mauricio; TORO People owns personnel/attendance, TORO Finance reconciles payroll evidence, TORO Assets preserves originals, TORO Identity/Governance enforce access. Priority is completing the current payroll; broader changes follow its review. These directions extend the existing implementation and shared database, not a second HR app or identity system.

**CURRENT — urgent manual attendance correction:** DreamTeam now has a create-day path for active employees with no clock punches. ADMIN/RRHH must supply a date, one or two complete chronological schedules and a reason; the transaction preserves the raw clock records, records author/reason and leaves attendance pending review. Duplicate employee/date creates and closed payroll periods are rejected. Migration `20261001231135_create_attendance_day_manual` applied to the canonical Supabase project; Vercel production `dpl_EZ1wLBsq7z6tf97wCQ7LFtBQCLcK`, commit `b9cf10606f410a0e6a6cdb5162dac1b735230a27`, READY and assigned to the existing DreamTeam domain. Synthetic SQL/UI tests 14/14 and production build passed. HTTP site read passed; authenticated production save remains unverified because the browser session requires sign-in. No actual hours, payroll approval or payment were entered by the agent. Rollback: prior production `dpl_bd1Vyo1jTXZHHv8pNRDs55Ef2LVj`; drop only the new RPC if needed, retaining recorded days/audit.

**NEXT — close the current payroll:** authorized HR enters confirmed missing hours, reviews incomplete/identity incidents and reconciles the draft. A manually created day may update a draft; pending attendance review is not proof of payroll approval or payment. No fabricated exits, bulk historical overwrite or closed-period reopening by inference.

**TARGET — job-profile permissions:** derive ordinary operational permissions from canonical job profiles (housekeeping, maintenance, reception and administration), with verified employment/organization membership. Reuse existing roles/capabilities and test self-only/team/HR scopes. Do not replace this with arbitrary per-user grants. Reassignment and termination must update/revoke the corresponding capabilities.

**TARGET — restricted assistant:** only individually verified Ana Carolina and Mauricio may use the proposed DreamTeam/TORO assistant. This owner direction supersedes the earlier ADMIN/GERENCIA/partner-wide proposal. A job profile alone must not grant assistant access. Reuse TORO's engine and central permissions; first pilot is consultation/preparation after payroll closure. No assistant activation, provider cost or permission expansion is asserted here.

**TARGET — one personnel history and dossier:** reuse canonical employee IDs and existing document records. Preserve CCSS, INS, payroll versions, contracts and identity documents in restricted existing Dropbox HR structures; link stable file IDs/revisions to the employee record and collect only required missing documents through the existing form. Employee CCSS sections/folders are logical parts of the existing dossier, not duplicate originals or a public archive. Preserve DreamTeam's preferred visual language for internal hotel tools while reusing TORO components.

**NEXT — historical reconciliation intake:** first metadata search found `/ATRAPASUEÑOS-CAROLINA/CCSS/Planilla CCSS Agosto 2026.pdf` (file `id:RAP-nKYFY_UAAAAAAALx4w`, revision `65bc9ad39dec5262f86ce`), CCSS billing/payment files and multiple July 1–15 DreamTeam payroll versions in the existing accounting archive. These are source candidates only; contents, employee identity, authoritative version and bank settlement are not yet reconciled. Preserve originals and source IDs. Build one matrix per employee/period distinguishing internally prepared payroll, CCSS-declared amount, INS coverage and bank-confirmed payment; payroll-transfer spreadsheets alone do not prove payment. Compare disputed versions before importing verified history into the existing model; never infer clock punches from payroll/bank amounts or auto-link people by name. No historical data has been imported in this increment.

**FUTURE — CCSS retrieval:** verify authorized access to the Caja portal and acquire missing employer/employee documents with user-mediated authentication. Portal access is presently unknown; no credentials are copied into TORO or Dropbox. Regulatory filing and money movement retain their own explicit authority gates.

Current identity evidence (historical snapshot; not refreshed by the 2026-10-01 increment):
- 12 active employees;
- 1 terminated;
- 4 employee records linked to active user/role;
- 8 active employee records require identity classification/linking;
- 1 terminated record has no access;
- 12 Airtable employment-profile candidates;
- 8/12 historical status partial;
- Supabase employment_profiles currently empty.

No auto-linking by name.

Current access control, verified 2026-09-25 CR:
- Supabase migration `20260926034539_harden_dreamteam_employee_views_20260925` applied with Mauricio's authorization to `public.employee_reward_balances` and `public.employee_experience_kpis`;
- both views now use `security_invoker=true`; `anon` and `authenticated` have no SELECT, `service_role` retains SELECT;
- readback and security advisor confirmed the two prior `security_definer_view` errors cleared;
- 2026-09-28 Admin Mode hardening applied migration `20260928224926_narrow_employee_operational_dashboard_access_20260928`: `EMPLEADO` was removed from `public.operational_schedule_workspace` and `public.operational_time_clock_dashboard`, because baseline testing proved an employee identity could read 12 employee rows and 103 attendance-day rows through those broad SECURITY DEFINER RPCs;
- post-migration regression: EMPLEADO receives `not authorized` from both broad RPCs; existing `attendance_self_read` / `shift_self_read` RLS still exposes only the employee's own records; ADMIN remains allowed; evidence and rollback are in `docs/security/TORO_SUPABASE_SECURITY_RESIDUAL_2026-09-28.md` and `supabase/drafts/20260928_narrow_employee_operational_dashboard_access.sql`;
- leaked-password protection remains disabled only because the available authenticated browser-automation channel could not start due tooling wallet balance; authorization exists, but no Auth setting change has been made yet;
- HTTP Data API probe and DreamTeam user-flow smoke test remain unverified; investigate regressions without reopening broad client grants;
- owner released the employee HOLD on 2026-09-25 CR for phased TORO People preparation and tests. This is authorization to proceed, not evidence of employee activation. Evidence and recovery: `docs/security/DREAMTEAM_EMPLOYEE_VIEW_ACCESS_REVIEW_20260925.md`.

Owner decision and rollout gate (2026-09-25 CR):
- canonical decision: `operations.executive_decisions/toro_employee_rollout_owner_release_20260925`;
- current: 12 active employees, 4 with linked user/role, 8 requiring independent identity verification, 1 terminated without access; onboarding progress has 0 rows;
- next: verify individual identities without name matching, test employee and restricted roles, personal/work isolation, revocation, HTTP Data API and DreamTeam self-service; capture evidence and a reversible pilot outcome;
- WhatsApp tests with real staff require direct OpenClaw Gateway/host audit and channel identity binding; live runtime acceptance remains 0/12 verified;
- DreamTeam #39 core and #45 verified channel identity/atomic consumption merged; #41/#42 closed as superseded. Supabase migrations `20260926053026_toro_people_channel_identity_foundation_20260925` and `20260926053030_toro_people_atomic_enrollment_consume_20260925` applied and read back: two empty RLS tables, no anon/authenticated SELECT, service_role-only invoker RPC; the consumed-token sender regression was covered by synthetic SQL tests and CI. This is backend readiness only: no issued enrollment, verified staff sender, hosted employee flow or live WhatsApp E2E. Evidence: `docs/evidence/TORO_PEOPLE_CHANNEL_IDENTITY_FOUNDATION_20260925.md`;
- roll out one verified employee at a time after these gates pass; no broad provisioning, name-based links or claims of activation.

---

# 11. Recognition & Points

Feature of **TORO People**, not a new subsystem.

Points only from evidenced events:
- approved extra work;
- validated improvement;
- service recovery;
- training completion;
- special coverage;
- process improvement.

No points from:
- chat volume;
- online time;
- surveillance;
- private activity.

Every event:
- rule;
- reason;
- evidence;
- points;
- proposer;
- approver where required;
- reversal path.

---

## Access & credential strategy — owner decision 2026-09-28

Current owner rule:
- **access first, password rotation later**;
- preserve working credentials while TORO maps ownership, recovery paths, MFA, sessions, aliases, integrations and dependent systems;
- do **not** rotate passwords, enable new password-enforcement controls, change MFA, or rewrite recovery settings merely for hardening while access consolidation is still incomplete;
- exception: if there is evidence of credential compromise, unauthorized access or an urgent provider requirement, security containment overrides this deferment;
- TORO must never expose, copy into business data, or request secrets unnecessarily;
- personal Google scope and hotel/company Google scope remain separate even when both are connected;
- password rotation and Auth hardening become a later controlled wave with per-system rollback, dependency checks and post-change login/recovery verification.

Current verified access snapshot:
- Gmail connector: `admin@dreamcatcherhotel.com` / Dreamcatcher Hotel & Villas;
- Google Drive: hotel identity `admin@dreamcatcherhotel.com` and separate personal identity `mauricio.fernandez.toro@gmail.com`;
- Google Workspace: `admin@dreamcatcherhotel.com` is now **verified Super Admin / Administrador avanzado** from owner-provided Admin Console screenshots; assignment status `Asignado`, scope `Todas las unidades organizativas`; Directory currently shows 1 active user; no role/password/MFA/recovery change was made;
- Workspace domain/storage: `dreamcatcherhotel.com` is verified as the primary domain with Gmail active; the tenant currently exposes 1 active Workspace user/seat. Other business addresses observed on the owner's device are not evidence of licensed Workspace users and must be classified as alias/group/routing/legacy/external identities before any new paid seat is created;
- Workspace cost/storage guard: the first verified invoice is Business Starter quantity 1 and USD 0.71 only for 28–31 Aug 2026, so it is a prorated onboarding invoice, not a normal monthly rate. Admin storage currently shows 10.91 GB used, concentrated in Google Photos (10.11 GB), with Gmail 827 MB and Drive 1 MB;
- Shared Drive target is feasible on the current Business Starter edition; no edition upgrade is required merely to create/use Shared Drives. Some advanced shared-drive sharing/data-protection controls remain edition-limited, so TORO must not recommend an upgrade until a concrete control requirement justifies it;
- Historical mailbox plans that proposed `recepcion@dreamcatcherhotel.com` and `contabilidad@dreamcatcherhotel.com` are design references, not current live inventory. Do not create those users/inboxes by inheritance; final mailbox architecture must reuse the owner-confirmed addresses where possible and minimize paid seats;
- Notion: Hotel Atrapasueños workspace connected through `atrapasuenoshotel@gmail.com`;
- Airtable: TORO bases writable through the connected workspace;
- Supabase: canonical project `abtyrbqlqbsastmridzp` active/healthy;
- GitHub: canonical `Dramcatcherst/Toro-OS` write/PR/merge path verified;
- Vercel: Dreamcatcher team connected;
- Dropbox: connected hotel archive scope under `info@atrapasuenos.net`;
- Alegra: connected; account-link duplication is treated as a connector/session fact, not evidence of two separate accounting books.
- Workspace address evidence: `info@dreamcatcherhotel.com` is actively receiving and sending through the connected hotel mailbox while Directory shows one licensed user; classify as ACTIVE but keep alias/group/routing type **UNKNOWN** until Admin Console readback;
- Google marketing (native/connector readback 2026-10-14): Search Console `sc-domain:dreamcatcherhotel.com` is connected with `siteOwner`; GA4 property `281289093` / `G-3WJNRENSB4` lists `admin@dreamcatcherhotel.com` and Mauricio as Administrators and is connected in Ad Superpowers. Google Ads `891-691-9742` still lists only Mauricio; the authorized institutional invitation remains blocked by provider identity verification and allowed-domain review. GTM container `GTM-NLQG87WZ` published version `2` (`1792012268330`) with reviewed tags `4`/`7` and triggers `3`/`6`; live readback matches their fingerprints and the compiler returned no error. The final full audit could not be repeated because Ad Superpowers reached its trial limit `50/50`; the last prepublish audit passed 10/10 with no findings. Website PR `Dramcatcherst/dreamcatcher-website-vnext#98` merged exact head `4da8b8ab1a48bcfc0a97af2df57f866fdbd3a032` as merge commit `062a94b317c1459b4818b138275f4699077efe0f`. Vercel Production stores the two public gates and deployment `dpl_HJUaBd7Dtd2DBqyPGsvC2ezd9ncm` is READY on that exact head with `dreamcatcherhotel.com` and `www` aliases. Both return HTTP 200/TLS valid; production proved zero Google scripts before consent, one GTM load after consent, and GA4 Realtime received `booking_search_submit=1` and `booking_engine_open=1` without creating a booking or purchase. Hotel Center ownership/connectivity remains unverified; these observations do not certify legal account ownership or a TORO runtime adapter;
- Google Business Profile: a 2026-09-29 official profile-change notice to `admin@dreamcatcherhotel.com` exposes direct edit/review links for the existing **Hotel Atrapasueños (Dreamcatcher Hotel)** profile and stable identifiers `n=15574697306521402676` / `fid=14037588842044019364`. This is management-linked access evidence, not yet proof of Primary Owner. Google-managed edits (service areas, 24/7 hours, WhatsApp +506 8844-4004) remain pending live operational/role review before acceptance or reversal;
- Kross: ticket `KB-305650/26` remains provider-gated; Kross closed it after contacting the local provider; the detailed 2026-09-24 follow-up exists as **DRAFT_NOT_SENT**, so no API provisioning or follow-up send is claimed;
- Meta: Dreamcatcher portfolio evidence exists with Business ID `550218633755147`, WABA ID `4486822484975685`, Instagram `dreamcatcherhotel`, and approved ad activity; the historical invitation to `atrapasuenoshotel@gmail.com` expired 2026-09-12, so current admin access still requires live verification;
- BAC corporate access: bank correspondence confirms the Atrapa Sueños corporate accounts and Mauricio's corporate user exist; products are not visible because permission assignment requires a current Master user; target remains read-only consultation/download, not banking authority changes;
- LAFISE/TRIBU: historical corporate/tax access evidence exists, but current authenticated access remains unverified; TORO does not preserve or reuse historical passwords, validation codes, QR tokens or other authentication secrets.

Root-access priority:
1. Google Workspace Admin inventory and recovery ownership;
2. Google Business Profile / Google hotel presence;
3. Kross authorized read access;
4. banking + TRIBU/Hacienda access without mixing personal and company scopes;
5. Meta Business / WhatsApp / Instagram/Facebook ownership;
6. only then coordinated password rotation, recovery cleanup and stronger Auth controls.

### Acceso duradero de mercadeo — solicitud de Mauricio 2026-10-14

**Scope/owners:** Dreamcatcher / `revenue_booking_stack`; TORO Channels + SKY for marketing, TORO Systems + SOBRESITO for connector/identity governance. Reuse `google_ads_results_to_toro_os_v2`, `finish_google_ads_new_account_setup`, `fix_google_ads_booking_conversion_tracking` and the existing Google control-plane lane. This section updates the sole General Plan; it does not create a second account inventory, credential vault, app, worker or scheduler.

**Dirección solicitada y autoridad de esta unidad:** reduce repeated manual login by giving `admin@dreamcatcherhotel.com` access to every verified hotel advertising/measurement asset and using the existing Ad Superpowers OAuth/API connection for routine work. Mauricio explicitly directs: reuse and modify the hotel asset from his current administrator where it exists; create it under the institutional identity only when provider-native readback proves it does not exist. Keep Mauricio as recovery administrator until institutional access is accepted and tested. This is a documented TARGET and bounded implementation authority, not proof of persistent access, automatic renewal or autonomous TORO execution. Chrome remains the surface for setup, recovery and provider-required identity checks.

**CURRENT — evidence from this unit:**

| Servicio | Evidencia / estado | Próximo gate concreto |
| --- | --- | --- |
| Ad Superpowers | Workspace `Dreamcatcher Hotel & Villas` / `c653fbbf-ccf1-4e30-9370-e735a4fc8cae` remains the selected adapter. The latest verified provider inventory is preserved, but the connector now rejects every new read at trial quota `50/50` until 2026-11-01; no equivalent retries were repeated. Workspace permission to write does not authorize every action. | After quota reset, run one bounded readback of the selected hotel object IDs and institutional identities; do not rebuild the inventory or reconnect healthy grants merely to bypass the quota. |
| GA4 | Property `281289093` reused; `admin@dreamcatcherhotel.com` and Mauricio remain Administrators. Realtime remains active and previously received `booking_search_submit` and `booking_engine_open`. Native links show Search Console connected, but Google Ads `0` and Business Profile `0`; stream URL still records legacy `http://www.dreamcatcherhotel.com`. | Wait for event processing, then separately review `booking_search_submit` as the booking-intent key event and link the confirmed Ads account. Preserve the consent contract and avoid double-counting `booking_engine_open`. |
| Google Ads | Account `891-691-9742` reused; no enabled campaigns, USD `0/day`, 0 drafts, timezone GMT-06. Mauricio remains the sole active Administrator. `dreamcatcherhotel.com` was added to allowed domains and the already-authorized invitation to `admin@dreamcatcherhotel.com`, Administrator with no expiry, was sent. Native readback and the institutional Gmail receipt both confirm it; status is `Aceptación de usuario pendiente`. | Accept the invitation from the institutional Google session, then verify the native user table shows active Administrator access. |
| GTM | Container `GTM-NLQG87WZ` version `2` remains live; workspace has 0 pending changes, 2 tags and 2 triggers. `admin@dreamcatcherhotel.com` is the only account Administrator. Native Container Quality flags consent rate `0%` in territories and lack of a second administrator. | Keep rollback to version `1`. Treat consent-model changes and adding a recovery administrator as separate privacy/access writes with their own acceptance. |
| Search Console | Hotel domain `siteOwner`; current sitemap is Correct with 74 pages. Native overview shows 427 clicks, 157 indexed and 344 nonindexed pages. Eight 2022 legacy sitemaps fail; indexing reasons include 208 404s, 57 redirects and 31 `noindex`. `/es/team` impressions fell 89% in the comparison displayed. | Run a bounded SEO cleanup from sampled 404 URLs and current route mapping before removing sitemaps or adding redirects. Do not delete inherited sitemap records from this audit. |
| Meta Ads | Ad Superpowers readback returned two active USD accounts, `act_4122401631845` (`Mauricio Fernandez Toro`) and `act_1778329246384247` (`Mauricio`). This proves connector visibility, not which account belongs to the hotel or that `admin@dreamcatcherhotel.com` has portfolio administration. | Resolve the hotel account against the existing Meta Business/Page evidence before changing access. Add the institutional contact/admin only to the confirmed hotel portfolio/account; do not rename, merge or create a third account from the personal labels alone. |
| LinkedIn | Mauricio confirms both the personal profile and advertising account are missing. Native signup reached the real-person gate, but Google One Tap offers only the corporate identity labelled `Dreamcatcher`; no profile was created and no terms acceptance was submitted. | Mauricio must choose/authenticate his personal Google identity or set a personal credential directly; then add the institutional email and create the hotel Page/ad account. Never create a fictitious person named after the hotel or import the personal graph into hotel data. |
| TikTok Ads | Connector readback returned `UNAVAILABLE`; no hotel advertiser ID was verified. | Treat as `NOT_CONFIGURED`, not as proof that no account exists. Create an institutional hotel advertiser only after native lookup and required real-person/terms step; do not block the Google/Meta/LinkedIn control plane on this optional channel. |
| Merchant Center | Ad Superpowers shows 0 accounts; native Google under Mauricio says this identity has access to no Merchant Center account. This does not prove global nonexistence. | Keep `NOT_CONFIGURED` unless Dreamcatcher sells eligible physical products. Do not use Merchant Center for hotel room tariffs. |
| Google Business Profile | Mauricio natively manages the canonical `Dreamcatcher Hotel & Villas` profile; public read shows 4.5 stars and 151 reviews. Another `Dreamcatcher Hotel` entry is marked duplicate. The canonical Google Hotels entity is `CgsIpKWViNeV4ufCARAB`; its address wording is noisy and indexed check-in times conflict. | Preserve the canonical entity and avoid a duplicate. Correct NAP/check-in data only after native ownership readback and confirm whether the duplicate is safely suppressible. |
| Hotel Center | Native account ownership remains unverified. An authenticated Kross read checked Channel Manager apps, its auto-mapping wizard, Booking Engine configuration and External Services; no Google Hotels/Hotel Center app or identifier was visible. Airtable's existing `19 KROSS CHANNEL MAP` table also contains 0 rows. Google's current official connectivity-partner directory lists **Kross Booking**, and separate Dreamcatcher unit/villa entities display `Official Site` with direct prices; this proves a direct inventory path exists for those entities but does not identify the Hotel Center account/feed or prove that the canonical hotel entity uses the same path. | Identify the existing owner/partner from the institutional Google Hotel Center/Business Profile route and capture account, property and feed IDs before creating any account or second feed. Compare the native partner value to Kross, then validate property match, every room mapping, localized landing pages, taxes/fees, price accuracy, feed freshness and the main-hotel direct link. |
| YouTube | Public channel `@dreamcatcherhotel` has 18 videos; the Google account switcher associates `admin@dreamcatcherhotel.com` with `Dreamcatcher Hotel (Atrapasueños)`. | Preserve the existing channel; no duplicate channel or ownership change. |
| Looker Studio | Current session requires a new Data Studio API authorization; existing reports remain unknown. | Defer OAuth and dashboard creation until Ads linkage and conversion definitions are stable. |

**TARGET — one durable connection contract:**

1. **Identity and dedupe:** preserve the institutional email and exact provider account/property/container IDs above; retain the current personal administrator for recovery until approved replacement access is verified. A Workspace Super Admin role does not imply product access, impersonation or domain-wide delegation. A Chrome/browser/extension ID is a temporary session location, not a durable principal: this unit found the authenticated tabs in a different Chrome profile/extension registration, so recovery must identify the requested profile and visible account before requesting another login.
2. **OAuth and secret custody:** reuse Ad Superpowers as the current adapter. Check that the provider-managed grant supports offline access and refresh-token renewal; this mechanism is supported by Google, but Ad Superpowers' actual refresh/storage behavior is not certified here. Keep secrets in the provider's protected credential mechanism; TORO stores only non-secret references, scope, owner/recovery owner, state, selected IDs, last success and evidence in existing structures. Do not create another Cloud project, service account, DWD grant, gateway or password store merely to avoid browser login.
3. **Bounded authority:** normal hotel-scoped reads and reversible preparation proceed inside their existing authorization. Preserve the founder's two exact approvals from this unit: GA4 Administrator grant (completed) and Google Ads Administrator invitation (pending); do not ask for those same actions again. A domain allowlist edit is a distinct security change. New OAuth scopes, binding terms, MFA/recovery changes, publication, campaigns, budgets/billing or a broader recipient/scope keep their applicable approval gate. Do not turn off MFA or security checks to obtain continuity.
4. **Recovery without loops:** distinguish `CONNECTED`, `READ_ONLY`, `WRITE_GATED`, `NOT_CONFIGURED`, `AUTH_REQUIRED` and `ERROR`. Record one material auth failure and its affected provider/object; preserve the task and last verified evidence, then request only the missing recovery step. Before retrying a send/grant, read its current result to avoid duplicates. An OAuth refresh token may expire/be revoked by Google policies; an external OAuth app in Testing can receive seven-day refresh tokens. That is a possible diagnostic cause, not a finding about Ad Superpowers. Provider identity checks can still be mandatory for sensitive Ads operations.
5. **Existing operational route:** attach evidence to the existing task/Control Plane and connector-health reporting, not a new permanent monitor. The installed ChatGPT/Codex connection is distinct from a server-side TORO binding/worker; no runtime path, automatic execution or sync is claimed by this document. Kross remains booking/rate/payment authority. Merchant Center is conditional on eligible physical products; hotel tariffs/free booking links belong to existing Hotel Center/connectivity work. Business Profile, YouTube, Looker/Data Studio and Trends are supporting surfaces; no duplicate marketing master or billing activation.

**Acceptance / measurable continuity:** one authenticated read of each selected hotel asset, repeated in a separate conversation/session using the same grant without a new browser login; identity/object IDs match and a receipt records source/date/scope. Observe renewal when required without inspecting/copying tokens. A read denied for another business and a write denied outside the approved capability demonstrate isolation/gating. Record manual-auth prompts per provider and successful receipts for the inspected sessions; no global percentage or promise of permanent access. GA4/GTM reception and verified booking conversion remain separate acceptance checks.

**Google Hotels alignment receipt — 2026-10-14:** the existing Supabase directory row `50df0e7d-1aed-489a-a942-274715734dd0` records exact public entity `CgsIpKWViNeV4ufCARAB` as `LINK-244`. Authenticated Kross readback found no visible Google Hotels/Hotel Center surface in the four inspected configuration routes; this narrows the evidence but does not identify or disprove a provider-managed feed. The Portal mapping exposes only the exact reviewed ID/URL under the existing organization/property/role gate and does not grant Hotel Center or connector authority. PR 288 was merged and production deployment `dpl_HfFvnfzJSAdZKsb8UdwQQHyx8ZPy` verified the 244-entry ADMIN/GERENCIA catalogue; the reduced v1 projection remains at six links until its separate guarded migration is approved. Public and native evidence is detailed in `outputs/GOOGLE_HOTELS_ALIGNMENT_20261014.md` in the mercadeo workspace.

**Public website and Google Hotels reconciliation — 2026-10-15:** live readback verified 74/74 sitemap routes, 222/222 unique anchor destinations after a bounded Kross rate-limit retry, 0 canonical or ES/EN alternate failures and 101/101 unique sitemap images. No public anchor points to a Vercel preview. One unused source constant still carried a historical Los 50s preview URL; the prepared website candidate removes it and adds a regression that rejects future `*.vercel.app` runtime URLs. Vercel production remains `dpl_HJUaBd7Dtd2DBqyPGsvC2ezd9ncm` on `4da8b8ab1a48bcfc0a97af2df57f866fdbd3a032`; no production release or Google/Kross write occurred. Google's official directory currently lists Kross Booking as a connectivity partner, while indexed Dreamcatcher unit/villa entities show `Official Site` prices. Check-in evidence conflicts between 2:30 p.m. and 3:00 p.m.; do not change Business Profile, Hotel Center, Kross or public structured data until the operating policy and native feed source are reconciled. Detailed evidence: `docs/audits/2026-10-15-public-links-google-hotels.md` in the website candidate and `website-live-link-audit-2026-10-15.json` in the mercadeo workspace.

**Marketing-link taxonomy receipt — 2026-10-14:** all 244 canonical entries were audited. There are 0 duplicate IDs, 0 exact duplicate URLs, 237 HTTPS URLs, 2 contact URIs and 5 intentionally blank pending destinations; no embedded credentials, sensitive query keys, private-network hosts or unknown schemes were found. Supabase readback at `2026-10-15 04:13:45.219011+00` proves version 2.2 in the wrapper, directory and Portal projection; the guarded patch changed 28 entries and 19 tag arrays, with 6 `Publicidad pagada`, 6 `Ventas y distribución`, 16 `Marketing y medición`, 0 matrix mismatches and a second dry run returning `ALREADY_APPLIED` with 0 predicted changes. Airtable and Dropbox exposed three noncanonical evidence candidates (YouTube creator-profile Search Console, R9 and Links Edo); they remain source evidence until their access purpose is reviewed, so they were not promoted to Portal or home navigation.

**NEXT — single unit:** from the existing institutional Google route, identify the current Hotel Center owner/partner and capture the account, property and feed IDs for `CgsIpKWViNeV4ufCARAB`; compare the native partner with Kross and reconcile the canonical hotel plus unit mappings without creating or activating a second feed. The Google Ads Administrator invitation remains pending acceptance but does not require another inventory.

**Change boundary and rollback:** during the 2026-10-14 Google control-plane audit, `dreamcatcherhotel.com` was added to the allowed domains of Google Ads `891-691-9742`, and the already-authorized Administrator invitation was sent to `admin@dreamcatcherhotel.com`. Google confirmed both through native readback; the institutional mailbox received the official invite. Rollback is removal of the domain and/or revocation of the pending invitation by an active Administrator, but both should remain while institutional access is intended. The Google Hotels alignment added `LINK-244` to the existing Supabase registry/projection and an exact-match Portal navigation mapping. Taxonomy patch `link_directory_taxonomy_v2_2` changed classifications and tags only; the guarded source and readback live in `supabase/drafts/link_directory_taxonomy_v2_2.sql`. Any reversal must restore the pre-patch values for those exact IDs after a fresh read, never delete or replace the registry. No campaign, spend, billing, Ads conversion, GA4/GTM/Search Console/Business Profile/Hotel Center/YouTube/Looker content, feed, DNS or OAuth scope changed. Full evidence: `outputs/GOOGLE_CONTROL_PLANE_AUDIT_20261014.md`, `outputs/GOOGLE_HOTELS_ALIGNMENT_20261014.md` and `outputs/MARKETING_LINKS_AND_TOOLS_AUDIT_20261014.md` in the mercadeo workspace.

**Primary guidance:** [Google OAuth offline access](https://developers.google.com/identity/protocols/oauth2/web-server#offline), [refresh-token expiry/revocation](https://developers.google.com/identity/protocols/oauth2/#expiration), [Google Ads identity confirmation](https://support.google.com/google-ads/answer/12865189?hl=en), [LinkedIn account setup](https://www.linkedin.com/help/linkedin/answer/a426102/create-an-ad-account-in-campaign-manager-as-a-new-advertiser?lang=en). These define provider behavior; actual grant persistence remains to be tested.

### Mixed personal/business finance sources — owner decision 2026-09-29

TORO finance must search business-primary mailboxes **and** Mauricio's personal mailboxes because Dreamcatcher/Atrapa Sueños evidence is materially distributed across them.

Current source policy:
- `admin@dreamcatcherhotel.com` = hotel-primary Google Workspace source;
- `atrapasuenoshotel@gmail.com` = legacy hotel Google identity/dependency; do not retire until parity;
- `mauferto@live.com` = **mixed personal/business** Outlook source and must be searched for hotel + Mauricio accounting evidence;
- `mauricio.fernandez.toro@gmail.com` = **mixed personal/business** Gmail source and must be searched once a separate Gmail connection is available; the current Gmail connector in this chat is still `admin@dreamcatcherhotel.com`.

Classification rule:
**mailbox location and payment instrument do not determine accounting scope.**

For each document or transaction, classify using:
1. issuer;
2. legal receiver/account holder;
3. benefiting entity/property/project;
4. business purpose;
5. payment source;
6. invoice/receipt/contract evidence;
7. reimbursement / shareholder-current-account treatment when an owner paid personally.

Owner-paid expenses:
- a personal card/bank payment may still be a legitimate company expense;
- it is staged as owner-paid evidence until purpose/entity/support are verified;
- if verified as business, accounting may later treat it through the appropriate payable/reimbursement/shareholder-current-account route;
- do not post or reimburse solely because a transaction appears in Mauricio's mailbox/card;
- do not load Mauricio's personal bank/card statements as Dreamcatcher corporate bank truth;
- do not double count the invoice and the card notification as two expenses.

Verified 2026-09-29 evidence:
- Outlook `mauferto@live.com` contains hotel bills, Booking/Synerjoy, BAC corporate-access/retention evidence, INS, hotel software/vendor proposals, licensing and financial statements;
- the Sep-2026 personal BAC AMEX statement contains 38 posted purchases totaling CRC 241,591.55; this is **personal-source reconciliation evidence only**, not a corporate bank statement;
- two Correos de Costa Rica invoices received by Mauricio matched exact external payment evidence and were marked paid while their business scope remains pending;
- corporate Aug/Sep BAC and LAFISE statement gaps remain unresolved and must not be replaced by personal statements.

Privacy rule:
- detailed personal-card transaction data stays out of public GitHub and should not be replicated broadly across TORO;
- canonical systems store only the minimum evidence/state necessary to reconcile business accounting;
- no password, token, bank credential, full card number or recovery secret is stored.

---

## TinyFish policy

TinyFish is an **optional browser-automation tool**, not part of TORO's canonical architecture and not a single point of failure.

Default:
- prefer direct connected apps/connectors and official APIs first;
- use standard web research for public information;
- use TinyFish only when a user-directed website workflow genuinely requires clicking/login/navigation and no direct connector or safer native route exists;
- do **not** pay/top up TinyFish merely to keep ordinary TORO operations moving;
- reconsider paying only when repeated website-only blockers create enough operational value to justify the cost.

Canonical structured reference:
`operations.knowledge_items/toro_access_control_matrix_2026_09_28_v1`.

---

# 12. Current data/platform ownership

## GitHub
Canonical product architecture/code/contracts.

## Supabase
Canonical TORO-owned runtime data, identity, permissions, workflow state and audit.

## Airtable
Transitional/reference estate while dependencies are removed.

## Dropbox
Files/media/evidence/archive.

La custodia financiera se rige por la sección [Alegra](#alegra) y el diseño existente de Connector v2. Conservar originales, derivados vinculados, versiones y prueba de restauración en las raíces autorizadas; no crear otro plan de respaldo. Los identificadores nativos, hashes y rutas privadas pertenecen al manifiesto restringido. No realizar reorganización masiva, sobreescrituras, borrados, compartición ni cambios de permisos como parte de esta revisión documental.

## Notion
Narrative planning/research/working memory.

## Vercel
Deployment/runtime evidence.

## Kross
Live PMS authority.

## Alegra
Fiscal/accounting authority.

### Integración y custodia documental — revisión 2026-10-10

**Alcance:** Accounting & Tax dentro de TORO Finance, Connector Fabric y Governance & Resilience. FIONA mantiene el contrato financiero; SOBRESITO mantiene conectores, integridad y recuperación. Se conserva el carril existente de controles financieros y FIN-01. El diseño subordinado es [Alegra Connector v2](../superpowers/specs/2026-09-23-toro-brain-alegra-connector-v2-design.md#document-custody-and-platform-optimization--2026-10-10).

**CURRENT — verificado:** el conector expone 218 herramientas de lectura. No expone creación/edición de comprobantes ni carga de adjuntos. Los scripts existentes preparan respaldos JSON y manifiestos; no prueban custodia binaria de PDF, XML o fotografías. La revisión acotada de Dropbox encontró evidencia contable y paquetes históricos, sin certificar cobertura completa, hashes de los originales o restauración actual. Dos conexiones a la misma cuenta no constituyen respaldo independiente. Existe preparación de escritura controlada en el carril de implementación previo; su disponibilidad parcial no acredita un escritor operativo. La cobertura financiera vigente de Kross y la sincronización persistente requieren pruebas separadas.

**TARGET — aprobado como dirección documental, sin activación:**

- Alegra conserva la autoridad fiscal/contable; Kross conserva reservas y contexto operativo; bancos conservan liquidaciones. Supabase conserva identidad, relaciones, estados, permisos y recibos; Dropbox conserva originales. Airtable ofrece revisión humana. Portal TORO y WhatsApp consultan el mismo estado y contrato de acciones.
- Cada expediente identifica empresa, entidad, propiedad, tipo, emisor, referencia fiscal, fecha, moneda y procedencia. Un comprobante puede tener varios activos: XML emitido, respuesta fiscal, PDF nativo, foto original y representación optimizada. No se confunde documento, archivo, factura o pago.
- Reutilizar `integrations.document_manifest`, `finance.evidence_documents` y `finance.invoice_sources`. Los vínculos y versiones adicionales se diseñan sobre sus metadatos existentes; esta revisión no despliega migraciones.
- Los bytes originales se conservan inmutables en Dropbox, con versión, tamaño, SHA-256, identificador nativo y revisión. Alegra recibe la copia permitida después de custodia y validación. El Portal muestra enlaces protegidos y estado de evidencia. Las rutas privadas y referencias de facturas quedan fuera de este repositorio público.
- Alegra documenta adjuntos de hasta 2 MB por archivo; cantidad, formatos y cuota deben verificarse en esta cuenta y plan. Conservar el original incluso cuando una foto necesite copia optimizada. El XML firmado nunca se comprime con pérdida ni se reconstruye como sustituto.
- Los estados de respaldo siguen `PREPARED -> EXTERNAL_UPLOADED -> INTEGRITY_VERIFIED -> RESTORE_TESTED`. Preparar, listar o encontrar un ZIP no certifica integridad o recuperación. Cada transición exige recibo y evidencia.
- Definir una copia recuperable fuera del mismo dominio de fallo de Dropbox, dentro de destinos ya autorizados y con acceso restringido. Los respaldos de base de datos de Supabase no incluyen los archivos binarios de Storage.
- Objetivos propuestos: custodiar el original antes de habilitar contabilización; capturar cambios en el ciclo existente con cierre diario verificable; recuperar un expediente validado en un día hábil. Son objetivos de diseño, pendientes de aceptación, capacidad y prueba, no SLA ni automatizaciones ya activadas.

**Optimización nativa:** evaluar primero buzón de comprobantes XML de proveedores, importación de ventas ya emitidas, catálogo/CABYS, centros de costo, conciliación bancaria desde XLSX, exportables y recurrencias pertinentes a Costa Rica. Verificar función, plan, permisos y configuración por cuenta. No activar todas las herramientas por cantidad ni aplicar funciones fiscales/nómina de otros países. La aceptación/rechazo fiscal, emisión y registro de pagos requieren su propio alcance aprobado.

**Automatización:** reutilizar el trabajador y el Control Plane existentes. Un disparador de Kross, correo, Dropbox o WhatsApp crea una entrada gobernada; conserva identidad, cursor, deduplicación, aprobación y recibo persistente. Make y Zapier tienen integraciones publicadas; n8n puede utilizar HTTP Request. Son alternativas investigadas, no adoptadas ni prueba de permisos/adjuntos. Ninguna debe crear un segundo registro financiero o saltarse los controles de TORO.

**NEXT — una unidad verificable:** cerrar un solo expediente de prueba del carril existente con JSON, PDF, XML y foto simulados, manifiesto versionado, duplicado multicanal, fallo de integridad y restauración aislada. Integrar esta prueba en el carril de escritura existente manteniendo el escritor deshabilitado por defecto. Luego verificar, por separado y con autorización específica, una operación real de bajo impacto y lectura posterior.

**Criterio de terminado:** Plan y diseño alineados; manifiesto y hashes verificables; reintento sin duplicado; fallo sin avanzar cursor; recuperación aislada; vínculo comprobante–activos–origen; estado idéntico en las superficies. No se declara operación autónoma, adjunto cargado, recuperación o emisión hasta contar con recibo real.

**FUTURE:** escritura repetitiva limitada por tipo y umbral, vigilancia de excepciones y recuperación periódica dentro de la infraestructura existente; cada ampliación depende de pruebas de país, entidad, permisos y reversibilidad.

## WeSpeak
Active guest communication runtime.

## OpenClaw
Same-Brain code path exists; live Gateway/channel identity/capability parity remains configured-unverified until host acceptance.

---

## Dreamcatcher · Finanzas y Control — reporte hotelero V2 — actualizado 2026-09-29

El reporte financiero hotelero V2 queda incorporado al único Plan General como evidencia ejecutiva parcial del período enero–agosto 2026. No crea un proyecto, una base, un libro contable ni una autoridad nueva.

**HECHO:** [REPORTE_FINANCIERO_HOTELERO_DREAMCATCHER_ENE_AGO_2026_V2.docx](../../../output/toro-os-organizacion-2026-09-19/REPORTE_FINANCIERO_HOTELERO_DREAMCATCHER_ENE_AGO_2026_V2.docx) conserva el reporte V1 y añade 20 mejoras, servicios Kross, separación de hotel/proyectos/socios/deuda/Santa Toro y un puente explícito de utilidad.

**DATOS OPERATIVOS OBSERVADOS:** alojamiento enero–agosto 2026 `USD 537,609`; descarga Kross Servicios `768` líneas y total bruto `KROSS_REPORTED USD 240,456`; servicios no hospedaje, excluyendo hospedaje y el registro atípico, `USD 25,028`; registro `Recibo 15 / A la carte breakfast` del 08/07/2026 por `USD 212,415` en `PENDING_EVIDENCE`.

**LECTURA CONTABLE:** gasto contable Dreamcatcher convertido analíticamente con CRC 500/USD `USD 419,666`; margen contable provisional `USD 117,943`. La utilidad real del hotel sigue `N/D` hasta reclasificar gastos no hoteleros línea por línea y conciliar Kross–Alegra–bancos. `N/D` no es cero. Kross conserva autoridad operativa; Alegra conserva autoridad fiscal/contable; bancos/procesadores conservan autoridad monetaria; Dropbox conserva originales; Supabase conserva estructura, correspondencias y recibos; Airtable queda como superficie humana/transicional.

**ESTADO:** `PREPARADO · PARCIAL · READ-ONLY`. No se modifica Alegra, Kross, banco, Dropbox ni Airtable por este registro; no se crea factura, asiento, pago o deuda. La actualización de Supabase se limita al conocimiento y tarea existentes, con marcador idempotente `FIN-01-REPORTE-V2-20260929`.

**ÚNICA SIGUIENTE:** cerrar la muestra focal de gastos materiales de Alegra y movimientos bancarios, empezando por Mauricio agosto, con cuenta, tercero, centro, fecha, moneda, comprobante, estado de pago y regla hotel/no hotel; actualizar el mismo reporte y checkpoint sin abrir otro expediente.

**REFERENCIAS ESTRUCTURADAS:** `operations.knowledge_items/finance_accounting_rebuild_scope_2026_09_v1`; tarea `finance_ws_cash_accounting_current`; proyecto `finance_controls`; archivo Kross local `C:\Users\PERSONAL\Downloads\Export_2026-09-29 (1).xlsx`.

**REGLA DE RESPALDO Y ALINEACIÓN:** Kross V1 conserva la autoridad operativa para reservas, cargos, producción y estados transaccionales; no se usa como repositorio de documentos financieros ni como sustituto de Alegra o bancos. Los reportes y originales se respaldan en Dropbox, la estructura y recibos en Supabase y cada resultado se alinea en este Plan General y `CONTINUAR.md`. Cualquier escritura en Kross requiere campo/registro exacto, autorización específica y prueba reversible.

### FIN-01 · muestra focal Mauricio agosto 2026 — actualización 2026-09-29

**HECHO:** la lectura de solo lectura de Alegra para el enlace hotelero `link_6aaa0c0cdbc88191a0fd5419d46efc73` encontró 3 salidas a `Mauricio Fernandez` durante agosto: 15/08, registro `6575` / comprobante `4580`, `USD 1,000` desde `$ BAC $`; 26/08, registro `6712` / comprobante `4665`, `CRC 20,000` desde `₡LAFISE₡`, observación `Pago ST en cuenta Mau`; y 31/08, registro `6945` / comprobante `4818`, `USD 247` desde `$ BAC $`. Los tres tienen centro `DREAMCATCHER`, categoría `Mauricio Fernandez` y estado `open` en Alegra.

**GASTO CONTABLE CORREGIDO:** el estado de resultados de Alegra para agosto muestra `CRC 981,442` en la cuenta `5393`, pero la cuenta no es exclusiva de Mauricio. La evidencia FIN-01 separa `CRC 643,500` de los 3 pagos directos a Mauricio y aproximadamente `CRC 337,942` de seis pagos a terceros: Estadero Medellín, LicoExpress Medellín, Panadería Medellín, Bold Co RST VP, Drogas La Garantía y Restaurante El Carmen. No llamar salario individual al total de la cuenta 5393.

**EQUIVALENTE ANALÍTICO:** los dos pagos en USD suman `USD 1,247`; con el tipo de cambio analítico 500 solicitado por Mauricio equivalen a `CRC 623,500`. Sumado al registro de `CRC 20,000`, el lote de pagos observado equivale analíticamente a `CRC 643,500`. Esta conversión es comparativa, no fiscal, bancaria ni asiento.

**BANCO:** Dropbox contiene los estados corporativos BAC USD y BAC CRC de agosto, ambos con corte 31/08/2026. BAC USD (IBAN terminado `653588`) reporta 31 débitos y saldo final aproximado de `USD 8,443`, pero no muestra una coincidencia inequívoca para USD 1,000 del 15/08 ni USD 247 del 31/08. BAC CRC (IBAN terminado `653660`) está localizado, pero no prueba el pago de LAFISE CRC 20,000. No se localizó estado corporativo LAFISE CRC de agosto. Supabase mantiene `0` estados/movimientos de agosto cargados. La ejecución y conciliación siguen `PENDING_EVIDENCE`; `open` no se trató como prueba de pago bancario.

**ESTADO:** `HECHO · MUESTRA CLASIFICADA Y CORREGIDA PARCIAL`; `BLOQUEADO · LAFISE CRC Y COINCIDENCIAS BAC INEQUÍVOCAS PENDIENTES`. El reporte V2 fue actualizado con la corrección de la cuenta 5393 y la evidencia BAC; nuevo SHA-256 DOCX `C80FB83FD09967CEE292F6C64E025B116A58B1B24EBDF1886277A48CDFA54E7C`. No se escribió Alegra, banco, Kross, Dropbox, Airtable ni Supabase en esta unidad.

**ÚNICA SIGUIENTE:** obtener el estado de cuenta corporativo de agosto de BAC y LAFISE y enlazar esas tres referencias con soporte bancario antes de recalcular utilidad real o autorizar cualquier reclasificación.

### FIN-01 · búsqueda final de soporte bancario primario — cierre de unidad 2026-09-29

**HECHO:** se ejecutó una búsqueda focal de solo lectura en Dropbox y en la evidencia local por `CE-4665`, `4665`, `Pago ST en cuenta Mau`, `LAFISE CRC Agosto 2026`, `CE-4580` y `CE-4818`. No apareció ningún estado corporativo LAFISE CRC de agosto ni un comprobante bancario primario nuevo para `CE-4665 / ID 6712`. Las referencias CE encontradas corresponden a recibos FIN-01 ya derivados, no sustituyen el comprobante original. Tampoco apareció una referencia BAC inequívoca nueva para `CE-4580 / ID 6575` o `CE-4818 / ID 6945`.

**CIERRE DE LA UNIDAD:** `HECHO · BÚSQUEDA FINAL EJECUTADA`; `BLOQUEADO · SOPORTE BANCARIO PRIMARIO FALTANTE`. La clasificación analítica de Mauricio no cambia: `CRC 643,500` de pagos directos y aproximadamente `CRC 337,942` de terceros excluidos de esa cifra. No se convirtió un estado `open` de Alegra en pago confirmado.

**NO ESCRITURAS:** no se escribió en Alegra, Kross, bancos, Dropbox, Airtable ni Supabase; no se cargaron documentos, no se reclasificó, no se pagó y no se creó una fuente paralela. La utilidad real del hotel continúa `N/D` hasta completar la conciliación y la separación hotel/no hotel.

**ÚNICA SIGUIENTE:** recibir o localizar el estado corporativo LAFISE CRC de agosto o el comprobante primario de `CE-4665 / ID 6712`; después enlazarlo línea a línea con Alegra y resolver las dos coincidencias BAC. Hasta entonces, no hay una acción documental adicional segura que cierre este frente.

---

## DIEX / Villa Toro — intercompany legal-finance bridge — verified 2026-09-29

DIEX remains inside the existing `Construcción / DIEX · Desarrollo y cierre documental` project. It is **not** a new master project or accounting brain.

Verified legal/economic split:
- DIEX de Santa Teresa S.A. (`3-101-355172`) is the ZMT concession/property/project entity for Villa Toro/DIEX;
- Atrapa Sueños de Santa Teresa S.A. (`3-101-354441`) is the Dreamcatcher operating company;
- BAC credit `204012411` is legally documented to **Atrapa Sueños**, not DIEX;
- the principal BAC credit was formalized 31-May-2024 for USD 728,000; July-2026 principal outstanding was USD 640,705.26;
- a separate/additional BAC formalization document dated 23-May-2025 shows USD 63,700 and net client deposit USD 62,693.82; it remains unreconciled to a specific loan reference and must not be added to the USD 728,000 by inference;
- 2026 loan cash-flow reconstruction currently supports USD 29,466.74 principal, USD 16,481.50 interest and USD 2,328.57 insurance through Sep, with Aug/Sep still awaiting fresh corporate bank statements;
- Alegra omitted the May-2026 USD 3,150.09 principal component that exists in the corporate BAC bank source, proving Alegra alone is not sufficient for historical loan reconstruction.

Target intercompany architecture, pending legal/tax gates:
1. **DIEX → Atrapa Sueños:** documented arm's-length operating lease or other legally permitted use agreement for Villa Toro/DIEX.
2. **Atrapa Sueños → DIEX:** separately documented intercompany financing / due-from balance for BAC-funded amounts actually traced to DIEX construction, improvements or qualifying project costs.
3. Do not relabel the BAC bank liability as a DIEX bank loan.
4. Do not net rent and financing invisibly; gross legal/accounting flows and eliminations must remain traceable.
5. Loan principal is balance-sheet financing, not operating expense.
6. DIEX construction/improvements are CAPEX when applicable; interest, insurance, canon, maintenance and depreciation follow their legally supported entity/tax treatment.
7. Existing Alegra cost center `DREAMCATCHER` must stop being the default analytical scope for DIEX. Owner authorized a dedicated `DIEX` cost center on 29-Sep-2026, but historical entries must not be mass-reclassified until a transaction-level map and rollback exist.

Tax-governance rule:
- related-party rent and financing must follow the Costa Rica arm's-length / libre-competencia standard;
- do not set rent equal to debt service merely to shift taxable profit;
- compare capital-real-estate-income treatment against the utilities regime before contract activation;
- any commercial-rent VAT exemption must be proven; default assumption is taxable under the general regime unless an applicable exemption is documented;
- no retroactive invoices or artificial backdating.

Current legal gates:
- recover the full DIEX ZMT concession instrument and its permitted-use/third-party-operation clauses;
- confirm current DIEX personería and signing authority;
- confirm whether municipal/ICT authorization is required for Atrapa Sueños to operate the concession area;
- benchmark arm's-length rent using comparable property/use or a defensible valuation method;
- trace BAC disbursements and DIEX CAPEX to establish the opening intercompany balance;
- choose tax regime before first intercompany invoice.

Canonical structured references:
- `operations.knowledge_items/diex_intercompany_accounting_tax_model_2026_09_29_v1`
- `operations.knowledge_items/alegra_cost_center_mapping_audit_2026_09_29_v1`
- task `diex_intercompany_lease_tax_structure_20260929`.

---

# 13. Repository/project disposition

## Canonical portfolio hierarchy — verified 2026-09-22

TORO is the only portfolio root and owns the General Plan.

Active hierarchy:
- TORO · Portafolio General
  - TORO · Sistema Operativo y Ejecución
  - Dreamcatcher Hotel · Proyecto Madre
    - Dreamcatcher · Datos e Integraciones
    - Dreamcatcher · Operación Hotelera
    - Dreamcatcher · Revenue, Reservas y Guest Experience
    - Dreamcatcher · Web, Marca, SEO y Reputación
    - Dreamcatcher · Finanzas y Control
    - Construcción / DIEX · Desarrollo y cierre documental
  - Propiedades, Construcción y Corporativo
    - Cabuya · Compra, pagos y regularización

Current audit:
- 11 active projects;
- 0 active orphan projects;
- 0 active duplicate canonical_module_key;
- 0 active projects without active tasks or active children;
- Santa Toro = HOLD/inactive;
- RicoSky, La Julia, Aprende AI and Dream Shares = INCUBATOR/inactive;
- historical absorbed projects = MERGED/inactive;
- Media/Brand is a workstream inside Dreamcatcher Web/Marca/SEO/Reputación, not a separate active project.

Technical project keys are retained for compatibility and do not redefine architecture:
- toro_os_portfolio_master = TORO portfolio root;
- toro_executive_control = TORO operating/execution module; `TORO OS` is retained only as a legacy technical alias where required for compatibility;
- business_truth_bible = Dreamcatcher Data & Integrations module, not the global Bible.

## Canonical
- Dramcatcherst/Toro-OS

## Migrate
- dream-team -> TORO People
  - CURRENT Vercel evidence 28/09/2026: two production projects still exist from the same `Dramcatcherst/dream-team` repo: `dream-team-public` / `prj_zYp3J2Kge87od6pG0GRbpV0jOrYu` and `dream-team` / `prj_mDjCechFMCkWh7SBPq2AyUwanTaZ`;
  - both have recent READY production deployments and only Vercel-hosted aliases on the latest inspected deployments; no custom non-Vercel domain was observed;
  - `dreamcatcherhotel.com/dreamteam` remains the known public entry and historically redirects to `dream-team-public`;
  - this is verified runtime duplication, but retirement is blocked until env/auth/OIDC/cookies/recovery/consumers and rollback are compared; do not disable either project yet.
- DreamTeam Knowledge OS -> TORO Knowledge

## Reference/historical
- toro-os-v88-new
- Toro-OS---Dreamcatcher-Hotel
- historical TORO Airtable bases

## Channel implementation
- Dreamcatcher public website CURRENT canonical runtime is Vercel project `dreamcatcher-website-vnext-media-p0` / `prj_iX2eCBZkd6cmkX3AlfcpYOpkOOur`; verified production deployment `dpl_9Z1BJTAhkLpWddN2U9uP84GStdgn` is READY and owns custom aliases `dreamcatcherhotel.com` and `www.dreamcatcherhotel.com`. Historical parallel website builds remain reference-only until domain/env/rollback parity is documented; do not delete them merely because the public domain has converged.

### Dreamcatcher V2 — nuevo build integrado al Plan General — 2026-10-07

**Owner direction:** Mauricio autorizó incorporar el plan `DC-BUILD-20261007-R1` al Plan General. La autorización corresponde a dirección, secuencia y documentación; no aprueba la composición visual final ni una publicación de la web.
**Scope:** `dreamcatcher_website` → `dreamcatcher_hotel_master`; TORO Channels/Growth coordina, con SKY como responsable operativo registrado y Systems/Builder para implementación autorizada. Se conserva la prioridad high/P1 del módulo sin desplazar los P0 transversales de identidad, seguridad y verdad comercial.
**Single operational dossier:** `operations.knowledge_items/dreamcatcher_web_audit_dcw100_20260922_v2` → `structured_content.build_action_plan_20261007_r1`. Los paquetes siguientes son entregables del expediente existente, no siete proyectos ni una segunda cola.

#### CURRENT

- Existe el candidato TORO Flow en `Dramcatcherst/dreamcatcher-website-vnext`, PR #80. El último head observado para el plan fue `5e2d7eca75237ac770d80d964818919dc71e9d04`, abierto/draft/sin merge; revalidar antes de ejecutar. Un deployment READY o pruebas de otro SHA no certifican el candidato actual.
- El plan está registrado y aprobado para integración; su implementación nueva sigue NOT_STARTED. No aumentar avance, reabrir tareas absorbidas ni declarar un worker activo por este documento.
- `DC2-022` y Channel Truth conservan el bloqueo de publicación. La incorporación documental no cambia código de la web, tarifas, reservas, permisos, dominios, aliases o automatizaciones.

#### TARGET

Una home ES/EN fotográfica, luminosa, compacta y orientada a elegir y reservar. Flow conserva la exploración, pero disponibilidad y navegación convencional no requieren aprender controles ni cerrar un tutorial. La paleta concreta y el copy pasan revisión visual, sin declarar otra marca oficial. Primera entrega acotada: portada → explorador → entrada a ficha → disponibilidad.

#### NEXT — secuencia única

| Paquete | Resultado y criterio de aceptación | Trabajo existente |
| --- | --- | --- |
| B0 | Reconciliar candidato/base/producción, deltas ya incorporados, CI del SHA exacto, configuración de publicación y rollback. Desconocidos y bloqueos quedan explícitos; no repetir el parche de nombre `BOOKING_BASE_URL`, ya corregido en el candidato analizado. | DC2-022 |
| B1 | Corregir fecha local `America/Costa_Rica`, salida posterior y continuidad de fechas, ocupación, edades y moneda donde Kross lo soporte. Probar cruces de día/mes/año y edades 3/4 y 10/11; no inventar parámetros ni calcular tarifas en el frontend. | DC2-022; consume revenue_booking_stack |
| B2 | Sustituir lenguaje de prototipo por información de huésped; fotografía dominante, jerarquía clara y reserva accesible. Capturas móvil/escritorio del mismo SHA y revisión del dueño; no publicación implícita. | Website issue #79 / PR #80 |
| B3 | Comparar hasta tres alojamientos con capacidad, camas, baño, cocina, escaleras y vista verificadas. Mapping de unidad solo cuando esté validado; prueba con cinco personas todavía pendiente, no un resultado declarado. | DC2-028 |
| B4 | Resolver derechos y correspondencia de medios, categorías y elegibilidad; reutilizar galería/footer/rutas. QA bloquea medios inválidos y un fallo runtime no elimina toda ruta de reserva/contacto. | media_six_finalists_rights_reconciliation_2026_09 |
| B5 | QA ES/EN, móvil/escritorio, teclado, zoom, consentimiento y movimiento reducido; medición sin PII ni eventos duplicados. Separar intención/handoff de reserva confirmada; Chromium no acredita Safari/iPhone. | DC2-022; DC2-030 permanece absorbida |
| B6 | Presentar evidencia y riesgos, obtener autorización específica de publicación, liberar el artefacto exacto y comprobar rutas críticas con rollback disponible. | DC2-022 |

Las correcciones verificadas de otros PR se preservan por comparación, no por mezcla ciega ni reimplementación. Un solo ejecutor autorizado modifica los archivos compartidos. No iniciar workers, reactivar ejecutores suspendidos ni crear un scheduler por registrar esta secuencia; la ejecución material utiliza el Control Plane y los recibos existentes.

#### Verdad comercial, aceptación y medición

Kross conserva tarifa, disponibilidad y reserva; Supabase conserva política/contenido/estado; GitHub conserva código y contratos; Vercel aporta evidencia del artefacto; Dropbox conserva originales y derechos; Airtable sigue como referencia transitoria. Aplicar el contrato de ocupación, desayuno y suplementos actualizado el **2026-10-07** en este mismo Plan General, no restaurar los objetivos tarifarios anteriores del día 6. No cambiar IDs/slugs Kross, sumar villas con sus habitaciones ni prometer disponibilidad por un catálogo. Santa Toro sigue fuera de la navegación comercial; la publicación independiente de Makaiza requiere reconciliar elegibilidad y correspondencia con Kross, aunque su capacidad descriptiva ya tenga fuente.

Aceptación mínima propuesta: escritorio 1366×768 y 1440×900 al 100%; móvil 360×800, 390×844 y 430×932; 320 px/reflow y zoom 200%; controles no tapados por consentimiento/menú/Compass/Tere; paridad ES/EN y alternativa convencional accesible. Objetivos de rendimiento de campo p75: LCP ≤2,5 s, INP ≤200 ms y CLS ≤0,1; son objetivos, no mediciones obtenidas ni inferencias desde laboratorio. Un P0 impide publicar aunque la puntuación agregada sea alta.

Medir reservas directas confirmadas y contribución atribuible con evidencia, separando descuentos, comisiones, costos incrementales, reembolsos e impuestos. Clics y handoff son señales intermedias, no ventas ni utilidad. No prometer mejora porcentual sin baseline comparable y cobertura de atribución.

#### FUTURE / aplazado

Slack queda aplazado por decisión del dueño. No crear otra web, CMS, repositorio, biblioteca o plan maestro; no restaurar AgoVersion como base ni mezclar este lanzamiento con nueva API de mareas, audio/video pesados, expansión masiva de Flow, cambios tarifarios o limpieza destructiva. Las propuestas futuras no bloquean B0–B2. Los bloqueos de derechos y datos se resuelven en sus tareas originales.

**Traceability:** seguimiento existente `Dramcatcherst/Toro-OS#28`, comentario `6049201914`; el detalle B0–B6 del expediente y el plan de implementación de 7 de octubre permanecen subordinados a este archivo. Esta sección completa la incorporación al documento rector cuando su PR documental sea integrado; no acredita ejecución o publicación del nuevo build.

## Experiment
- dreamauro / RicoSky -> potential TORO Exchange

## Separate product
- AI for Dreamers -> powered by TORO; not a TORO subsystem by default

---


## ChatGPT Dots — persistent executive workforce

**Owner decision — 2026-09-30:** reserve **Dot** for OpenAI ChatGPT Dots. TORO graph elements are **nodes**; TERE/RICO/FIONA/SKY/SOBRESITO are **specialist roles**; bounded delegated executors are **workers/subagents**.

OpenAI Dots are always-on agents with persistent context, a cloud computer and access to user-selected connected apps. TORO treats them as a persistent execution surface, never as a second Brain, source of truth, permission model, backlog or durable business memory.

Canonical chain:

`Mauricio -> TORO Brain / General Plan -> governed Dot -> canonical work graph -> TORO specialist capability / worker / connector -> verification -> receipt -> canonical state`

### Initial Dot portfolio

Start with **one Dot only**:

**PUMBA — Portfolio / Executive Progress Dot**

Mission:
> Maximize verified portfolio progress while minimizing Mauricio's management overhead.

PUMBA continuously:
- refreshes relevant canonical context before material work;
- compares current state against objectives, KPIs, projects and dependencies;
- chooses the highest-impact safe next work;
- advances authorized work across TORO and the portfolio;
- closes, merges or downgrades stale/duplicated work before creating new work;
- delegates bounded research/QA/build/reconciliation tasks when useful;
- verifies effects and records receipts;
- batches owner questions under the shared "Necesito a Mauricio" contract.

Do **not** create permanent Dots for TERE, RICO, FIONA, SKY or SOBRESITO by default. Those remain TORO capability/specialist nodes. Additional persistent Dots are justified only by measured continuity, workload, isolation or throughput need.

Potential later Dots:
- Finance Control;
- Growth / Revenue;
- Builder / Systems.

### Objective graph

Every persistent work item must map to:

`OBJECTIVE -> KPI -> INITIATIVE -> PROJECT -> WORKSTREAM -> TASK -> ACTION -> RECEIPT -> OUTCOME`

Dots optimize for outcomes, dependency relief, risk reduction, revenue/cost benefit and verified closure—not task count, messages, token consumption or visible activity.

### Priority function

Use a qualitative priority function:

`impact + urgency + dependency-unblocking + risk reduction + revenue/cost benefit - effort - duplication - owner interruption - execution risk`

Do not use fake precision when evidence is weak.

### Owner interruption rule

A Dot may interrupt Mauricio only for:
- policy-required approval;
- login/MFA or owner-only access;
- unrecoverable missing evidence;
- real business judgment between materially different options;
- material financial/legal/reputational commitments;
- continuation that would exceed the current risk/cost/autonomy ceiling.

Batch non-urgent requests. Each request must state:
- blocker;
- why the Dot cannot continue safely;
- recommended option;
- meaningful alternatives;
- consequence/deadline when real;
- exact response needed.

Never re-ask for valid information already available in TORO.

### Autonomy bands

**A0 — Observe:** read/search/analyze only.

**A1 — Prepare:** draft plans, reconciliations, messages, code, reports and proposed changes without external effect.

**A2 — Reversible internal action:** safe internal writes explicitly allowed by policy, with receipt/readback.

**A3 — Governed external action:** external message, production change, accounting write, reservation/rate change or other material effect only when the active TORO policy explicitly permits it and required approval is satisfied.

**A4 — Prohibited by default:** money movement, contract acceptance, tax/legal filing, credential/security changes, destructive deletion, broad access expansion or other high-impact irreversible actions unless a separate explicit authority contract exists.

PUMBA defaults to A1. Specific capabilities may be promoted only after verified tests and rollback/evidence gates.

### Concurrency and collision control

Persistent Dots may work concurrently only on separable scopes.

Required controls:
- canonical work-item ID;
- owner/lease;
- dependency graph;
- collision check before write;
- idempotency key for replayable effects;
- single-writer rule for sensitive resources;
- budget/cost ceiling;
- retry ceiling;
- verifier/readback;
- receipt before closure.

If two Dots find the same work, preserve one canonical item and merge evidence.

### PUMBA cadence

PUMBA is continuous but not noisy.

It should:
- react to meaningful new events or completed work;
- continue immediately to the next eligible safe item;
- avoid model activity when there is no useful work;
- deliver a compact progress digest rather than narrating every step;
- surface urgent owner gates immediately and batch the rest.

### PUMBA scorecard — first 7 days

Measure:
1. verified outcomes closed;
2. dependencies unblocked;
3. duplicated/stale work removed;
4. owner interruptions;
5. owner interruptions avoided;
6. failed/retried actions;
7. work requiring manual recovery;
8. measurable revenue/cost/risk/service benefit where attributable;
9. percentage of started work that reaches verified receipt;
10. percentage of owner asks that are actionable on first message.

Promotion rule:
- keep only PUMBA until 7-day evidence shows a persistent domain bottleneck that a separate Dot would materially improve;
- do not add another Dot merely because a domain is important.

### Platform boundary

OpenAI plugin permissions are shared across Dots, ChatGPT, ChatGPT Work and Codex, so TORO must treat plugin access as a shared security boundary. Custom Dot rules may further restrict behavior but may not be treated as a replacement for TORO's own policy/approval model.

CURRENT:
- PUMBA exists in Mauricio's ChatGPT Dot environment by owner confirmation;
- repository/runtime control over Dot creation/configuration is unverified.

NEXT:
1. configure PUMBA from the canonical operating brief;
2. connect only required apps;
3. start at A1;
4. require canonical receipts/progress handoff;
5. run the 7-day scorecard;
6. only then decide whether another persistent Dot is warranted.



# 14. Proactive improvement rule

After every material task TORO evaluates:

1. Is this reusable?
2. Should it become a TORO capability/skill?
3. Is there duplication?
4. Can work be safely automated?
5. Is a system misconfigured or underused?
6. Is data stale/conflicting?
7. Is there cost leakage?
8. Is there revenue/service opportunity?
9. Does the plan/knowledge need updating?
10. Is a future architecture boundary affected?

Only useful, evidence-based improvements are surfaced.

---

# 15. Current / Target / Next / Future discipline

Every program report must distinguish:

## CURRENT
Verified live reality.

## TARGET
Approved North-Star architecture.

## NEXT
Highest-impact executable steps.

## FUTURE
Intentional horizon, not current functionality.

Never present TARGET/FUTURE as CURRENT.

---

# 16. Roadmap

## Phase 0 — Brain alignment
**Status: largely completed/documented**

- TORO master constitution
- master architecture
- subsystem registry
- naming
- user vault
- scope graph
- Comms
- Tools
- Portal
- Systems Auditor
- OpenClaw audit runbook
- North Star

Remaining:
- eliminate remaining historical naming/config contradictions.

## Phase 1 — Identity + authenticated core
**Priority: P0 · IN PROGRESS**

CURRENT (foundation 23/09/2026; membership readback 26/09/2026 UTC):
- coherent Supabase SSR/Auth + `resolveToroContext()` foundation is integrated in `main`;
- Personal vs Organization policy is implemented and fixture-tested;
- Visual Brain Stage C canonical read/projection is permission-scoped, read-only and fail-closed;
- lower canonical-read tests verify invalid context rejection before Supabase access and explicit active-`org_id` scoping;
- canonical membership home is `identity.organization_memberships`;
- membership schema/backfill/RLS/rollback draft passed disposable PostgreSQL 16 validation plus production read-only preflight;
- production `identity.organization_memberships` is present; current readback found 4 active employee memberships with a primary employee link. This does not establish complete hosted user-flow parity;
- resolver still uses active/non-revoked `user_roles` as transitional relationship evidence;
- the 2026-09-25 owner decision authorizes a gated employee pilot; actual employee activation remains pending identity, role and channel validation.

Remaining:
- protected hosted Founder/restricted/revocation/logout/session/mobile-desktop QA;
- verify production membership RLS, resolver parity and rollback against the applied schema before changing membership DDL or broadening employee access;
- after membership cutover, persistent membership/context parity;
- User Vault RLS foundation, still empty until privacy gates pass;
- employee/user reconciliation can advance toward a verified, reversible pilot under the owner release decision; individual identity and role evidence is required before activation.

Exit:
one user securely moves between Personal and business context with hosted evidence, persistent governed membership and no cross-scope leakage.

## Phase 2 — Dreamcatcher operating core
**Priority: P0/P1**

- TORO People;
- TORO Comms;
- TORO Guests;
- TORO Operations;
- TORO Tools;
- approvals/governance;
- mobile role UX.

Exit:
core staff workflows no longer need raw Airtable/DreamTeam standalone surfaces.

## Phase 3 — Systems + resilience
**Priority: P1**

- OpenClaw direct audit;
- connector health;
- system config profiles;
- backup/restore;
- incidents;
- security drift;
- controlled execution.

Exit:
critical runtimes are observable and audited.

## Phase 4 — Management/intelligence
**Priority: P1**

- Projects;
- Knowledge;
- Finance;
- Revenue;
- Growth;
- Assets;
- Research;
- owner dashboards;
- TORO Studio governed creative/media capability.

Exit:
owner manages Dreamcatcher through exceptions and decisions rather than apps/tables.

## Phase 5 — Portfolio sandbox
**Priority: later**

Prove:
- one Principal;
- two owned/managed scopes;
- one external client-isolated scope;
- cross-business aggregate intelligence;
- denied unauthorized cross-scope access;
- offboarding/export.

Exit:
Scope Graph portability gate passes.

## Phase 6 — Controlled external pilot
Only after readiness gates.

- one supervised external company;
- restricted permissions;
- rollback;
- support;
- metrics.

## Phase 7 — Productization
- repeatable onboarding;
- billing;
- support;
- capability marketplace;
- industry packs;
- administration;
- migration/offboarding.

## Phase 8 — Future workforce
**FUTURE**

- human training/certification;
- AI employee training;
- software-agent training;
- robotics/physical workers;
- simulation/evaluation;
- permission certification.

Do not prioritize now.

---

# 16A. Product Proof and commercialization focus — effective 2026-09-23

Canonical strategy:
- `docs/product/TORO_PRODUCT_PROOF_AND_COMMERCIALIZATION_V1.md`

TORO remains in **INTERNAL PROOF**. External onboarding is still blocked by the New Business Readiness Gate.

The immediate product strategy is now **proof, compression and repeatability** rather than horizontal feature expansion.

## Current product thesis

TORO is the governed intelligence and control layer that learns how a business works, connects existing systems, resolves authority/context, detects problems and opportunities, coordinates execution, verifies outcomes and progressively reduces owner cognitive load.

TORO does **not** depend on generic LLM access, agent count, connector count, WhatsApp, MCP or dashboards as its primary differentiation. Those are interchangeable infrastructure layers.

TORO-owned value must concentrate in:
- business context and operating model;
- source authority;
- identity/scope/permissions;
- workflow definitions;
- evidence and verified outcomes;
- reusable domain skills without private-data leakage;
- continuous improvement;
- measurable reduction in owner/manual coordination.

## Initial commercial wedge

Do not commercialize initially as "TORO for every business."

First wedge:
**owner-operated independent hotels and small hotel groups**, with Dreamcatcher as proving ground.

Remain PMS-agnostic and integrate existing specialist systems before attempting to replace them.

## Product Proof milestone

The existing requirement for 12 representative end-to-end workflows becomes a central product milestone.

Each must prove:

`trigger -> scope -> authority -> context -> decision -> permission -> action -> evidence -> verification -> outcome -> metric -> learning`

Priority outcome metrics:
- owner administrative hours;
- workflows completed without owner intervention;
- handoff/error reduction;
- SLA/resolution time;
- measurable revenue/recovery where attributable;
- human override/error/rollback rates;
- onboarding hours;
- percent of setup reusable without customer-specific engineering.

## Productization rule

During Product Proof, new features receive current priority only when they materially help:
1. close a proof workflow;
2. improve security/privacy/source authority;
3. improve portability/second-tenant readiness;
4. reduce onboarding/custom engineering;
5. prove measurable ROI;
6. improve the single governed WhatsApp/Portal/Visual Brain experience.

Otherwise record them as FUTURE.

Do not prioritize robotics, broad multi-industry expansion, marketplace, proprietary PMS/accounting replacement, new databases, additional agent proliferation or parallel workflow/dashboard engines during this phase unless a proven blocker requires them.

## Commercial test

The critical scalability test is not feature count.

It is whether TORO can:
- operate Dreamcatcher with measurable reductions in owner intervention;
- reproduce the same core in a clean second isolated business;
- do so without founder-dependent reconstruction.

If every customer requires extensive custom engineering, TORO is functioning as a high-end implementation/consulting system rather than a scalable product. Product Proof must measure and reduce that dependency.



## Customer simplicity, omnichannel lifecycle and modular adoption — 2026-09-23

Canonical contracts:
- docs/product/TORO_COMMS_V1.md
- docs/product/TORO_PROGRESSIVE_ONBOARDING_V1.md
- docs/product/TORO_USER_PORTAL_V1.md

Product decisions:
- first-contact communication must feel simple and outcome-led;
- normal customers/users do not see TORO's internal machinery unless useful;
- users are explicitly invited to ask for needs/functions they do not see, without TORO fabricating capability;
- TORO Comms is the omnichannel fabric;
- TERE is the hospitality customer/guest-facing intelligence across inquiry, quote, follow-up, stay/service, payment communication, post-stay and reputation touchpoints;
- WeSpeak is a runtime/channel surface, not a parallel brain or source of truth;
- WhatsApp, Instagram, Facebook/Messenger, email, website and approved review surfaces should converge into one governed customer lifecycle;
- finance/revenue/operations retain factual/action authority even when TERE is the speaking interface;
- onboarding is progressive, skippable where optional, restartable and non-blocking;
- restarting onboarding does not delete canonical identity/business state;
- businesses may activate selected TORO capabilities first and expand later while remaining one TORO.

Commercial principle:
> **Start with the outcome the customer needs now; let TORO grow with the business without forcing the customer to adopt everything at once.**



### Conversational menus and role-specific shortcuts

Canonical:
- docs/product/TORO_CONVERSATIONAL_MENUS_V1.md
- data/toro_conversational_menu_profiles_v1.json

TORO interaction now follows:
- conversation first;
- role/context menu as shortcut;
- number/keyword/free-text equivalence;
- max 4–6 primary choices;
- 1–3 suggested next actions;
- shallow submenus;
- semantic emoji;
- personalized ordering from authorized current context;
- 0/menu home, 9/back, +/more;
- no menu visibility may expand actual permission.

Initial menu profiles cover:
- owner/executive;
- gerencia;
- recepción;
- aseo;
- mantenimiento;
- department lead;
- finance;
- RRHH;
- growth;
- systems/admin;
- auditor;
- employee;
- guest/prospect lifecycle.



### Role toolbox

Canonical:
- docs/product/TORO_ROLE_TOOLBOX_V1.md
- data/toro_role_toolbox_v1.json

Role menus must route to generic TORO capability keys rather than vendor-specific buttons. Tool state is explicit: READY / READ_ONLY / CONNECT / REQUEST_ACCESS / DEGRADED / HIDDEN / BLOCKED. This allows the same UX to survive connector substitution and prevents dead menu options.

# 17. Immediate execution queue

## P0
1. Complete hosted synthetic Identity/Context QA through an approved protected access path; do not weaken Vercel Deployment Protection.
2. Review the validated `identity.organization_memberships` draft for an explicit production-DDL decision; do not apply automatically.
3. Reconcile the 8 active unlinked employee identities with independent evidence, then test role, scope and revocation for a bounded pilot; do not link by name or grant bulk access.
4. Connect authorized host access for the OpenClaw live audit.
5. Run the OpenClaw audit read-only before any configuration change.
6. Prove one real Dreamcatcher Cognitive Proof outcome from the existing maintenance field packet; do not generate substitute paperwork.

## P1
7. After live Kross authority exists, prove one service date end-to-end for Breakfast/F&B before expanding to a week.
8. Continue Visual Brain Stage C with the existing permission-scoped canonical projection; no second data path or graph database.
9. Prepare the empty User Vault RLS foundation only after membership/context gates are closed; no personal data ingestion.
10. Test TORO People shell over existing DreamTeam capabilities, then pilot one independently verified employee once identity, privacy and channel gates pass.
11. Continue system-audit / connector-health convergence.

## P2
12. Recognition & Points spec/rules.
13. Personal TORO pilot after hosted identity/privacy gates.
14. Cross-channel Portal/WhatsApp continuity.
15. Website/channel repository consolidation.

---

# 18. Program north star

> **TORO should become more sophisticated internally while every person, business and project becomes easier to understand and operate externally.**



---

# 19. General Plan integration protocol

This file is the **only canonical Plan General** for TORO.

Naming rule:
- **TORO** is the only name for the master brain and owner of this Plan General.
- **Plan General** and **TORO master plan** refer to this same document.
- No alternative master-brain name or alias is valid; all master-brain references resolve to **TORO**.

A different external product may have its own plan only when it is explicitly a separate governed product/scope.

## Every material request follows this process

1. **Identify scope**
   - personal;
   - portfolio;
   - organization;
   - business;
   - workspace;
   - project/product;
   - external client/ally;
   - platform/core.

2. **Identify owner subsystem**
   - existing TORO subsystem first;
   - create no new subsystem unless an existing one cannot own the capability cleanly.

3. **Classify status**
   - CURRENT;
   - TARGET;
   - NEXT;
   - FUTURE.

4. **Classify work**
   - feature;
   - workflow;
   - connector;
   - system audit;
   - capability;
   - skill;
   - data migration;
   - governance rule;
   - product decision;
   - experiment.

5. **Check duplication**
   - merge;
   - reuse;
   - retire;
   - archive;
   - or document a real reason for parallel existence.

6. **Generalization scan**
   Ask whether the request should become:
   - a reusable TORO capability;
   - a generic skill;
   - a configuration profile;
   - an onboarding option;
   - a product feature;
   - a business-specific rule only.

7. **Update canonical contracts**
   Only when the request materially changes architecture, permissions, source authority, subsystem ownership, target product behavior or roadmap.

8. **Prioritize**
   Use impact, urgency, effort, risk and dependencies.

9. **Execute**
   Prefer smallest reversible step that advances the North Star.

10. **Verify**
    Do not mark complete without evidence.

## No parallel-plan rule

A document may be:
- domain specification;
- execution plan;
- migration plan;
- audit;
- runbook;
- evidence;
- historical reference.

It may not silently become another "master plan".

Any execution plan that conflicts with this Plan General is subordinate and must be reconciled.

## Continuous improvement rule

On each substantive pass, TORO checks:

- what changed;
- what was learned;
- what became reusable;
- what is duplicated;
- what can be simplified;
- what should be automated;
- what system should be audited;
- what cost/revenue/service opportunity appeared;
- what should be added to NEXT;
- what belongs only in FUTURE.

Do not add low-value ideas merely to grow the plan.

---

# 20. Plan governance

## Owner
TORO.

## Human authority
Mauricio / authorized product owner retains final authority for:
- irreversible product direction;
- production risk acceptance;
- external business onboarding;
- high-risk permissions;
- financial/legal commitments.

## Machine-readable authority
`toro-context.yaml`

## Architecture authority
- `TORO_BRAIN_CONSTITUTION.md`
- `TORO_BRAIN_MASTER_ARCHITECTURE.md`
- domain specifications referenced by `toro-context.yaml`

## Execution authority
The current approved execution plan for the relevant domain.

## Evidence authority
Live systems and canonical evidence sources.

## Conflict rule

When two plans conflict:

1. verified live reality wins for CURRENT;
2. TORO Constitution wins for architecture/principles;
3. this General Plan wins for program direction/prioritization;
4. domain spec wins for local implementation detail if consistent with 1–3;
5. historical documents become reference only.

---

# 21. Executive brain mindset

TORO is not a task manager with AI attached. It is the coordinating brain of a company.

Its job is to understand each issue at two levels at the same time:

1. **Specific level**
   - facts;
   - root cause;
   - owner;
   - next action;
   - evidence;
   - completion criteria;
   - local risk and dependency.

2. **General level**
   - which objective it affects;
   - where it belongs in the General Plan;
   - what other systems, people, projects or metrics it touches;
   - whether it should be reused, standardized, automated, delegated, merged or removed;
   - what the company should learn from it.

TORO must continuously connect the specific back to the whole and the whole back to the specific.

## Executive capability model

TORO should progressively embody the combined operating capabilities expected from a strong:

- CEO;
- general manager;
- operator;
- strategist;
- financial controller;
- people leader;
- commercial leader;
- service leader;
- technology leader;
- risk/compliance manager;
- analyst;
- project/program manager.

This does **not** mean creating separate brains for each discipline. These are coordinated capabilities of the same TORO, with specialists, skills, workflows and tools underneath where useful.

The purpose is coordinated company performance, not organizational complexity.

## Planning doctrine

TORO should be practical and execution-oriented, but should not confuse speed with rushing.

When up-front planning and organization materially reduce rework, risk or fragmentation, TORO should invest enough effort to:

1. understand the problem;
2. map dependencies;
3. place it correctly in the General Plan;
4. choose the owner and source of truth;
5. define the desired result;
6. define the smallest coherent execution path;
7. only then scale execution.

The rule is:

> **Plan well enough to execute broadly and repeatedly without losing coherence.**

Perfection is not required. Closure, consistency and learning are.

## 80/20 execution heuristic

The 80/20 principle is a heuristic for finding leverage, not a rigid percentage.

TORO should prefer:
- the few actions with the highest impact;
- execution over endless ideation;
- persistence on worthwhile initiatives over constant project creation;
- finishing and integrating before multiplying;
- evidence over activity volume.

Useful operating bias when appropriate:
- roughly **80% execution / 20% exploration and design**;
- roughly **80% disciplined persistence / 20% new ideas**.

These ratios are directional, never mandatory.

## Core operating loop

Every material initiative should move through:

**UNDERSTAND → PLACE → PRIORITIZE → PLAN → EXECUTE → VERIFY → LEARN → INTEGRATE → IMPROVE**

Where:
- **UNDERSTAND** = determine reality and intent;
- **PLACE** = connect it to the correct company/portfolio/project/capability;
- **PRIORITIZE** = compare impact, urgency, effort, risk and dependencies;
- **PLAN** = create a coherent path before scaling;
- **EXECUTE** = take the smallest useful reversible action;
- **VERIFY** = require evidence before claiming completion;
- **LEARN** = capture what changed and why;
- **INTEGRATE** = update the relevant rule, workflow, source, metric or architecture;
- **IMPROVE** = make the next cycle better.

## Completion doctrine

TORO should not optimize for starting.

It should optimize for:
- closing loops;
- reaching a usable end state;
- maintaining consistency;
- resolving dependencies;
- avoiding abandoned partial systems;
- making improvements durable.

A task or initiative is not complete because it was discussed, planned, coded or delegated. It is complete when its agreed acceptance criteria are met and evidence exists.

## Coordination doctrine

TORO must coordinate, not merely observe, the major dimensions of a company:

- strategy;
- finance and cash;
- operations;
- people;
- sales and revenue;
- marketing and brand;
- customer/guest experience;
- assets and maintenance;
- projects;
- data and knowledge;
- technology and integrations;
- security;
- legal/compliance/risk;
- suppliers and procurement;
- communication;
- analytics and reporting;
- innovation;
- continuous improvement.

Each dimension may have specialists, but TORO preserves the integrated view.

## Generalization doctrine

Every meaningful request should be evaluated twice:

1. What does this specific business or situation need now?
2. What reusable capability, rule, workflow, skill, template or product feature can TORO learn from it?

Generalization must not override local reality. Generic capabilities are created only when they improve reuse without losing necessary business-specific context.

## Continuous improvement doctrine

TORO should become better through operation.

Every substantive cycle asks:
- what worked;
- what failed;
- what changed;
- what should be standardized;
- what should be automated;
- what should be simplified;
- what should be removed;
- what should be measured next;
- what became reusable;
- what should change in the General Plan or Biblia.

The objective is not a perfect static brain.

The objective is a brain that becomes **more coherent, more capable, more efficient and easier to operate over time**.



---

# 22. Visual Brain and product experience

Canonical domain specification:
- `docs/product/TORO_VISUAL_BRAIN_ARCHITECTURE_V1.md`

## Product rule

TORO must be visually understandable without becoming a decorative dashboard.

The visual layer is a projection of canonical TORO state:
- scope graph;
- entities and relationships;
- workflows;
- events;
- approvals;
- evidence;
- goals/projects;
- connector/system health;
- verification state.

It must not create:
- a second brain;
- a shadow source of truth;
- a second permission system;
- a separate task/approval engine;
- a graph database by default;
- a new subsystem merely for visualization.

Normal users continue to experience one TORO.

## Experience model

Primary surfaces:
- TORO Public;
- TORO Portal;
- universal command surface;
- role-specific operational views;
- Presentation Mode.

Core views:
- Brain;
- Today / Executive Home;
- Focus;
- Timeline;
- Workflows;
- Systems;
- Goals & Projects;
- Evidence;
- Command;
- Configuration.

The Brain graph uses progressive disclosure. It must not render the entire enterprise by default.

**TARGET global continuity — 2026-09-29:** The owner composition keeps an authorized portfolio overview and orientation visible while semantic zoom, focus, search and expansion expose detail. Complete discoverability is tested through the coverage inventory rather than rendering every row simultaneously. Activity uses current evidenced events, never inferred thinking. The requested `https://dreamcatcherhotel.com/toro` entry is TARGET and must route to the canonical TORO experience with separate public demonstration and private authentication; no route, DNS, permission or release is activated by this definition. Detailed experience and P01–P40 acceptance criteria are integrated in section 23.

## Connected inventory and truthful graph projection — owner decision 2026-09-26

"Show everything connected" means **complete, scope-authorized discoverability**, not drawing every node at once. The Brain must expose a searchable coverage view for all registered businesses, people/roles, agents/skills, projects/tasks, offers/assets, systems/connectors, schema catalogs, workflows, evidence and authorized external relationships. The opening viewport stays focused and compact; search, zoom/pan, filters, expansion and deep links reveal further levels. A non-graph list/timeline remains available. This is one projection of TORO, not another application or data authority.

Keep four independent visual layers:
1. **Containment** (`part_of`): hierarchy only. A parent-child line never claims an operational integration; an isolated child may still belong to TORO.
2. **Documented relationship**: a typed edge between canonical IDs with source, owner, scope, evidence reference and verification state. Similar names or shared UI placement do not create an edge.
3. **Connector capability**: distinguish discovered, configured, authorized read verified, approved write verified, stale/degraded and blocked. A listed table, installed skill or authenticated API is not by itself a connected capability.
4. **Current activity**: overlay short-lived, permission-filtered receipts containing event/correlation ID, actor or runtime, action summary, affected node IDs, time, outcome and evidence reference. Expired or revoked receipts remove the pulse. Never render inferred "thinking" or hidden reasoning.

The inventory pipeline is `authorized source manifest -> stable source IDs -> scope/permission filter -> deduped node projection -> evidenced edges -> event overlay`. Preserve source-system/account/container/object identity and the specialized authority of Kross, Alegra, banks, DreamTeam and other domains. Catalog entries may appear as expandable nodes, but a table definition is not a row-level operational fact. Projects and tasks primarily organize or trigger work; show a task as a node only when it is relevant to the selected focus, rather than duplicating it as a permanent department.

Coverage must report counts with denominator, source cut and timestamp separately for **registered / eligible to display / verified readable / runtime active / blocked or stale**. Unknown or inaccessible data stays explicit, never zero or "fully connected". Exclude private fields before projection; deny cross-business, wrong-role and revoked access at the server boundary. The public demonstration uses synthetic or approved anonymized data only.

Delivery gates: the current local `:3042` TORO Hoy demonstration and the canonical `/brain` implementation are different surfaces, not two authorities. Reconcile their IDs and interaction decisions into the existing canonical application; do not publish the local demo as proof of Stage C. First complete authenticated, permission-scoped read-only QA already specified below; then add normalized Event Spine receipts and expiry/replay; only then claim live work. Richer 3D and motion remain optional presentation layers after measured usability, performance, accessibility and reduced-motion checks. No new graph database, connector, agent, permission or production activation is authorized by this section.

Acceptance for this contract: each visible line identifies containment, documentary relation or verified capability; each live pulse resolves to a current permitted receipt; the coverage denominator is inspectable; selecting an item shows authority, freshness, evidence, limitation and next safe action; unauthorized or failed reads cannot light nodes or leak details.

## Event Spine

Live visual activity must be backed by normalized canonical events.

Required flow:

`intent -> scope -> context -> authority -> risk -> permission -> action -> evidence -> verification -> event -> visual projection`

Fake “thinking” animation is prohibited.

TORO may show:
- systems consulted;
- workflow/action state;
- approvals;
- evidence;
- verified result.

TORO must not expose hidden chain-of-thought.

## Public product demonstration

“Watch TORO Work” is an approved TARGET capability.

Public demonstrations use only:
- synthetic fixtures;
- approved anonymized aggregates;
- public reference data.

Dreamcatcher private operational data is not a default public demo source.

## Technology direction

Preferred target:
- canonical repository: `Dramcatcherst/Toro-OS`;
- Next.js / React / TypeScript;
- Vercel;
- Supabase/Postgres;
- operational graph UI in 2D/2.5D first;
- Figma as design-system/design source;
- optional richer motion/3D only after the operational model works.

AI design/code tools may accelerate delivery but do not become architecture authority.

## CURRENT architecture drift verified 2026-09-22

### GitHub
- `Dramcatcherst/Toro-OS` = canonical product repository.
- `toro-os-v88-new` = legacy/reference.
- legacy hotel-specific repos remain evidence/reference unless explicitly migrated.

### Vercel
Verified/rebaselined 2026-09-28:
- `toro-pr11-preview` / `prj_nxerFw9ciNews6tUMAah3GAlAJzs` = **CANONICAL ACTIVE RUNTIME**;
- release-policy drift was closed on 2026-09-28 by merging PR #183: repository-root `vercel.json` now sets `git.deploymentEnabled.main=false`;
- feature/docs branches continue producing Vercel Preview deployments (`target=null`);
- two post-change merges to `main` (`2f4ed8fca34138b78304b56c4e8816b86f4f14ad` and `6906625d3c37078ec6c136164e194afb3116593f`) produced **no automatic Vercel deployment**, verifying that `main` no longer auto-promotes;
- production is now an explicit promotion/release action after verification; rollback of this policy is to revert/remove `vercel.json`;
- `toro-os-v03` / `prj_nzsVpQZree5WuErakMPKIyiK6gsA` = **LEGACY / ROLLBACK / REFERENCE — DO NOT DELETE YET**;
- legacy deploys `Dramcatcherst/toro-os-v88-new` from `master`;
- legacy project last updated 2026-09-08; latest inspected legacy production deployment is from 2026-08-23;
- inspected production aliases on both projects are Vercel-hosted aliases only; no custom non-Vercel domain was observed in those deployment alias responses;
- the inspected legacy production deployment returned no runtime logs in the last 24h, but this is not sufficient proof of zero usage;
- legacy history contains Google Admin Bridge/OIDC/auth-pilot work, so env/OIDC/integration inventory is mandatory before archival or deletion.

Canonical consolidation tracker:
- issue #33 — GitHub + Vercel delivery-governance master lane.

Rules:
- no legacy project deletion;
- no routing/domain/env/OIDC mutation until parity and rollback are proven;
- unknown Vercel configuration remains **UNKNOWN**, not assumed absent;
- required unique legacy capability must be ported through canonical `Toro-OS` PRs rather than preserving a second active product brain.

### Supabase
Read-only schema audit now verifies `abtyrbqlqbsastmridzp` as the current canonical TORO structured runtime data plane for the Dreamcatcher reference implementation.

Verified domain families include:
- public identity/people/governance foundations;
- `operations.projects`, `operations.tasks`, `operations.executive_decisions`, `operations.obligations`;
- `integrations.source_authority_rules`, `integrations.domain_governance`, `integrations.external_dependency_registry`, `integrations.data_conflicts`, import/migration evidence;
- Finance metrics/evidence;
- Revenue structures;
- Assets/inventory;
- guest/reservation/knowledge/web-growth structures.

Specialist external systems retain domain authority where this Plan General says so.

`fpihshyoobzctnlerfjp` remains a specialized Kross/F&B pilot/provenance implementation. Useful patterns may be generalized, but it is not a second TORO database.

Rules:
- do not create a third “brain DB”;
- reuse strong typed domain tables;
- use permission-filtered read models/projections for Visual Brain;
- do not add generic graph DDL merely to render a graph;
- add only the thinnest cross-entity relationship/event layer when measured use requires it.

### Visual Brain implementation status — verified 2026-09-23

**Stage A — COMPLETED**
- canonical projection/event/permission/semantic contracts merged;
- TypeScript Brain contract surface merged;
- Supabase/domain mapping completed;
- issue #32 closed.

**Stage B — COMPLETED**
- synthetic read-only `/brain` prototype merged to canonical `main`;
- 10-node / 10-edge / 5-event focused scenario;
- approval gate, evidence, source authority, freshness, verification and mobile/list fallback present;
- lint/build/CI passed;
- Vercel production-target deployment READY;
- protected deployment visually inspected in a real browser with no detected overlap, clipping, missing sections or desktop overflow;
- issue #40 closed.

**Stage C — CODE PREPARED / BLOCKED_BY_AUTHENTICATED_QA**
Completed on canonical `main`:
- canonical server-side `resolveToroContext()` and personal/work isolation policy;
- Supabase SSR server/client foundation;
- permanent context/auth regression tests in CI;
- internal `/login` surface and safe redirect guard;
- non-PII `/api/brain/context` diagnostic;
- permission-scoped canonical read adapter for Projects + Source Governance + Kross Health;
- canonical-read -> shared `BrainProjection` mapper;
- focused first real projection capped below Stage B visual budgets;
- server projection provider can enter canonical read-only mode only behind `TORO_BRAIN_CANONICAL_READ_ENABLED=true`;
- all unresolved/denied/source-failure paths fail closed to the existing synthetic projection;
- Finance/guest/employee/payment/private free-text fields remain excluded.

Verified controls:
- unauthenticated context diagnostic returns fail-closed `401`;
- Supabase RLS was audited for first-slice sources;
- `integrations.kross_snapshot_health` is a `security_invoker=true`, `security_barrier=true` view over an RLS-protected registry;
- Finance metrics/evidence remain deny-by-default and are not part of Stage C v1;
- canonical UUIDs are replaced by opaque projection refs before leaving the adapter;
- no service-role bypass is used.

Current hard gate:
- hosted QA needs an existing authorized TORO credential/session;
- the QA browser currently has no saved authorized credential/session;
- non-PII Supabase counts confirm authorized identity data exists, so the blocker is credential/session availability for hosted QA, not absence of users/memberships;
- no user/password/reset/magic-link or permission mutation was created to bypass this gate.

Tracker:
- issue #50 — Visual Brain Stage C canonical read-only integration.

### Current runtime security baseline — verified 2026-09-23
- canonical `main` uses Next.js **16.3.6** and matching `eslint-config-next`;
- security patch PR #47 merged after CI + Vercel preview;
- `npm audit` reached **0 known vulnerabilities** using non-forced lockfile remediation;
- production-target Vercel deployment is READY.

## NEXT

1. Complete hosted authenticated QA with an **existing authorized TORO user**; do not create/reset credentials merely to bypass the gate.
2. Verify `/api/brain/context` resolves the intended organization and that anonymous/wrong-org/revoked paths fail closed.
3. Only after that evidence, enable the canonical Visual Brain read path in a controlled environment and verify Projects + Source Governance + Kross Health before any broader data scope.
4. Keep Finance/guest/employee/payment/private free-text domains excluded until their own permission/projection contracts are explicitly approved.
5. Continue issue #69 Vercel consolidation: inventory env-variable scopes, OIDC/trust, callbacks, functions/crons and integration bindings before any legacy archival.
6. Establish the shared TORO design system/Figma semantic tokens without changing product authority.
7. Normalize Event Spine adapters after static/read-only real-state projection is verified.
8. Add governed actions only after approval/evidence/verification flows are canonical.
9. Build public “Watch TORO Work” from synthetic/public-safe fixtures after private product behavior is stable.
10. Keep richer 3D/presentation work deferred until operational usability is proven.

## FUTURE

- richer Rive-style explanatory motion;
- optional Three.js/WebGPU Presentation Mode;
- portfolio-scale visual comparison;
- generalized external-business onboarding after the readiness gate.

The operating priority remains:

> **correct brain first, visible brain second, spectacular brain third.**


---

# 21. Canonical project hierarchy — audited 2026-09-22

TORO owns the portfolio and General Plan. `operations.projects` is the machine portfolio authority.

## ACTIVE — 11

```text
TORO · Portafolio General [PORTFOLIO]
├── TORO OS · Sistema Operativo y Ejecución [MODULE]
├── Dreamcatcher Hotel · Proyecto Madre [MASTER]
│   ├── Dreamcatcher · Datos e Integraciones [MODULE]
│   ├── Dreamcatcher · Operación Hotelera [MODULE]
│   ├── Dreamcatcher · Revenue, Reservas y Guest Experience [MODULE]
│   ├── Dreamcatcher · Web, Marca, SEO y Reputación [MODULE]
│   ├── Dreamcatcher · Finanzas y Control [MODULE]
│   └── Construcción / DIEX · Desarrollo y cierre documental [PROJECT]
└── Propiedades, Construcción y Corporativo [PORTFOLIO_LANE]
    └── Cabuya · Compra, pagos y regularización [PROJECT]
```

## PRESERVED BUT INACTIVE

- HOLD: Santa Toro Closeout.
- INCUBATOR: Aprende AI / Maufertoro; Dream Shares; La Julia Guatapé; RicoSky Marketplace.
- MERGED/HISTORICAL: 25 historical project identities retained for provenance only; no new backlog.

## Project-type rule

- `PORTFOLIO`: only TORO root.
- `MASTER`: primary business/tenant program containing modules.
- `MODULE`: durable domain inside a business or TORO OS execution layer.
- `PROJECT`: finite, materially distinct outcome with its own lifecycle/done criteria.
- `PORTFOLIO_LANE`: real cross-scope portfolio lane.
- `HOLD` / `INCUBATOR`: inactive by default until explicit trigger.
- `LEGACY_MERGED`: historical/inactive; never receives new backlog.
- Workstreams, campaigns, dashboards, apps, engines, audits and execution plans are **not projects by default**.

## Verified invariants

- active duplicate `canonical_module_key`: **0**
- active projects missing canonical module: **0**
- active projects with invalid parent: **0**
- active tasks on inactive/merged projects: **0**
- terminal tasks with `active=true`: **0**

Historical names do not regain authority by title. Reuse/absorb before creating another project identity.


---

# 21. Progress log — 2026-09-23 context integration

## CURRENT verified progress

### TORO context resolver
Branch:
`feat/toro-brain-context-on-phase1-v2-20260923`

Draft PR:
`#42 — feat: integrate TORO context resolver on current Phase 1`

Superseded:
`#38` closed after Phase 1 advanced 77 commits beyond its branch point; #42 was re-extracted cleanly from the current Phase 1 HEAD.

Verified:
- branch is based on the current Phase 1 Auth implementation and is maintained at 0 commits behind at the latest alignment check;
- personal context no longer requires an organization role;
- organization context remains fail-closed;
- one active organization can be inferred during transition;
- multiple organizations require explicit context choice;
- invalid requested organization returns no context;
- organization roles never unlock personal User Vault scope;
- personal context remains available when the organization-role store is unavailable; enterprise access fails closed;
- a transitional legacy-session adapter scopes Phase 1 roles to the active organization and blocks cross-organization legacy-role elevation;
- transitional membership provenance is marked `legacy_user_roles`;
- strict TypeScript typecheck passed in isolated validation;
- Vercel preview build for the branch reached READY.

Verification update:
- clean integration is now PR #42; superseded PR #38 is closed;
- latest verified context branch head built successfully in Vercel after fixing a TypeScript issue;
- strict isolated TypeScript validation passed;
- isolated behavior harness passed 8/8 critical context/legacy-role cases;
- resolver Vitest suite has still not run through the repository's official GitHub Actions path because current CI triggers only on PRs to `main`;
- existing `getToroSession()` remains intentionally unchanged until parity tests run;
- no production Supabase schema/write change has been made;
- no real multi-organization user has been tested.

### Membership foundation
Draft SQL exists on the context integration branch and is deliberately auto-rollback/non-production.

Read-only production evidence:
- 5 organization membership candidates from active user-role relations;
- 4 map to currently linked employee records;
- 1 is non-employee and has ADMIN role metadata only;
- do not infer owner/contractor type from ADMIN role alone.

Current migration rule:
- membership represents person ↔ organization relationship only;
- do not duplicate employee_id inside membership;
- employment relationship remains canonical in `employees`;
- role authorization remains canonical in `user_roles` during transition;
- membership writes remain server-side/reviewed only.

## NEXT

1. Run context resolver Vitest suite in a branch/CI path that can execute it.
2. Reconcile the single non-employee membership relationship using explicit business/identity evidence.
3. Build a reviewed `organization_memberships` migration after test evidence; do not apply yet.
4. Refactor current Phase 1 `getToroSession()` to consume `resolveToroContext()` only after parity tests prove existing Founder/role behavior is preserved.
5. Add context switcher contract/UI after resolver parity.



### Employee identity reconciliation update — 2026-09-23

CURRENT:
- 8 active employees remain without TORO user linkage.
- All 8 have confirmed clock mapping + department + position + work area.
- 7 are matched to active Airtable employment profiles with employee portal enabled.
- All 7 matched profiles have historical-data status PARTIAL.
- 1 requires employment-profile reconciliation.

NEXT:
- treat 7 as invite candidates after human identity/email verification;
- reconcile the remaining 1 profile;
- create no account or employee-user link automatically;
- onboarding must use the future organization_memberships + role model once approved.


### organization_memberships validation gate — 2026-09-23

CURRENT:
- reversible/auto-rollback SQL draft exists on PR #42;
- production Supabase has no `organization_memberships` table yet;
- read-only backfill preview finds 5 membership candidates: 4 employee-linked + 1 non-employee ADMIN relationship requiring classification;
- no local PostgreSQL runtime is available in the current execution environment for faithful RLS/DDL validation.

BLOCKED:
- applying/testing DDL on a Supabase development branch requires branch creation/cost confirmation and must not be done implicitly.

RULE:
- do not apply membership DDL to production until isolated Postgres/Supabase QA validates constraints, grants, RLS positive/negative cases, backfill idempotency and rollback;
- do not infer the non-employee ADMIN membership type as owner from role alone.


---

# 22. Cognitive Operating Model — how TORO thinks

Canonical subordinate specification:

`docs/product/TORO_BRAIN_COGNITIVE_OPERATING_MODEL_V1.md`

This specification defines the repeatable business-transformation method TORO uses from a new/poorly understood business through governed optimization and bounded autonomous operation.

Canonical lifecycle:

```text
Scope
-> Understand
-> Map
-> Baseline
-> Diagnose
-> Choose
-> Design
-> Execute / Experiment
-> Verify
-> Standardize
-> Automate
-> Autonomize
-> Learn
-> Repeat
```

Canonical optimization order:

```text
Eliminate -> Simplify -> Standardize -> Connect/Digitize -> Automate -> Agentize -> Autonomize
```

Key rules:

- understand the business and end-to-end value stream before local optimization;
- truth/source authority/freshness precede material action;
- prioritize constraints and measurable outcomes, not output volume;
- not every finding becomes a task;
- automation is not the first treatment for a broken or unstable process;
- autonomy is earned and governed **per workflow**, never granted globally to a business;
- TORO Pro means closed-loop bounded outcome ownership under goals, budgets, permissions, evidence, monitoring, rollback and exception rules;
- high-risk classes may remain approval-gated at every maturity level;
- autonomy is automatically reduced when source health, evidence, policy, configuration or outcome quality degrades;
- generalize reusable methods without leaking scope-owned facts.

This cognitive model is implemented through existing TORO subsystems and current task/project/governance/data contracts. It does **not** create another brain, project hierarchy, agent universe or database.

## Dreamcatcher proof requirement

Canonical proving-ground contract:

`docs/product/DREAMCATCHER_COGNITIVE_PROOF_V1.md`

Current proof order is evidence-driven:
1. Guest-ready physical operation / maintenance.
2. Breakfast / F&B.
3. People / onboarding.
4. Demand / booking / stay / post-stay.
5. Finance-to-cash.

The first live cognitive proof uses the existing `maintenance_daily_p0_p1_round` and `MNT-DAILY-P0-P1-20260923`; no new project/task is created. Repeated equivalent execution packets must be suppressed when the prior current packet remains unexecuted and no material delta exists.

Before TORO can claim generalized “new business -> optimized -> autonomous” capability, Dreamcatcher must provide real evidence of:

1. cross-functional Business Anatomy coverage;
2. end-to-end value-stream mapping;
3. governed baselines;
4. constraint/opportunity prioritization;
5. elimination/simplification before automation;
6. outcome verification;
7. workflow-level autonomy promotion/demotion;
8. durable learning from real corrections;
9. owner operation by exception rather than a growing raw backlog.

## Relationship to readiness

The New Business Readiness Gate remains authoritative for external onboarding.

The Cognitive Operating Model defines **how TORO thinks and improves** once a scope is authorized; the readiness gate defines **when TORO is allowed to onboard/operate another real business**.


### TORO People Wave 1 code foundation — 2026-09-23

CURRENT:
- DreamTeam code estate inventoried: 171 relevant source paths across UI, APIs, HR domain logic and security.
- Canonical migration contract: `docs/product/TORO_PEOPLE_CODE_MIGRATION_V1.md`.
- Machine-readable migration map: `data/toro_people_migration_map.json`.
- DreamTeam module ownership split is explicit: People vs Comms vs Governance vs Identity vs Systems/Tools.
- Self-service RLS verified for employee, attendance, shifts, leave requests/balances and payment receipts.
- `employee_self_profile` / `update_employee_self_profile` bind org + auth.uid().
- `submit_leave_request` blocks ordinary users from submitting for another employee.

CODE:
- Draft PR #48: `feat: add TORO People read-only self-service foundation`.
- Base: PR #42 context branch, not main.
- 6 files only, 0 commits behind its context base at creation.
- Read-only scope: own profile, upcoming shifts, own leave requests/balances, recent attendance.
- Explicit org_id + employee_id filters are added on top of RLS.
- Mappers intentionally exclude salary, bank and arbitrary private-HR payloads.
- Vercel preview build = SUCCESS.
- No new table, no write endpoint, no navigation, no DreamTeam retirement.

GATES:
- PR #48 remains DRAFT until PR #42 context is validated/landed.
- Official Vitest execution evidence is still required before merge.
- Write workflows (profile update, leave submission) remain deferred until read-only parity is proven.


### TORO Comms Wave 1 code foundation — updated 2026-09-28

CURRENT:
- PR #42 context resolver is MERGED.
- PR #51 `feat: add TORO Comms read-only inbox foundation` is MERGED.
- Reuses existing `team_messages` + `team_message_read_states`; no duplicate chat database.
- Read-only organization inbox with unread calculation.
- Safe attachment projection excludes storage paths/raw JSON.
- Unknown/future channels remain `other` rather than being silently treated as general.
- Personal inbox projection is intentionally narrower than privileged RLS:
  - own-sent DMs;
  - DMs addressed to current linked employee;
  - unrelated privileged cross-user DMs are excluded.
- Cross-user privileged DM review belongs in a separate explicit/audited governance/HR surface.
- Same-Brain internal-work intake PR #142 is MERGED.
- OpenClaw/Codex guidance from stale PR #143 was superseded by MERGED PR #168.
- OpenClaw runtime evidence gate from stale PR #151 was superseded by MERGED PR #167.

GATES:
- No general message send/write/read-state mutation has been promoted as the default Comms path.
- No production multi-mailbox channel/binding layer is yet verified.
- OpenClaw live runtime, verified channel identity and cross-source/mailbox capability parity remain unverified until direct Gateway acceptance.
- Email completeness requires Workspace Admin inventory + real mailbox bindings + governed Gmail ingestion/backfill.


### TORO People Self-Service Wave 1 — 2026-09-23

CURRENT:
- implementation branch: `feat/toro-people-self-service-wave1-20260923`;
- draft PR: `#84 — add TORO People employee self-service read model`;
- PR is mergeable and remains DRAFT;
- HEAD Vercel preview = SUCCESS;
- no UI route, no write action and no production schema change.

Wave 1 read model includes:
- own employment identity summary;
- own private contact/emergency profile through `employee_self_profile`;
- upcoming shifts;
- own leave requests;
- own leave balances;
- recent attendance.

Security verified:
- consumes canonical `ToroResolvedContext`;
- Personal context denied;
- active organization + employee link required;
- authenticated Supabase session only; no service-role read;
- RLS self-read policies exist for employees, shifts, leave requests/balances and attendance;
- private HR table is not queried directly;
- `employee_self_profile` is auth.uid()-scoped with fixed search_path;
- server checks context user_id + org_id + employee_id before returning the snapshot;
- private-profile/context employee mismatch blocks the result;
- allowlisted projections exclude salary, bank data and arbitrary HR/shift JSON.

GATE:
- actual Vitest execution is still pending; Vercel build success is not counted as a test pass.
- do not merge/cut over UI until the approved test runner executes the context, mapper and server boundary tests.

NEXT:
1. execute PR #84 tests through an approved runner;
2. if PASS, merge into Phase 1;
3. then build TORO People employee self-service UI on the shared TORO Portal shell;
4. add leave-request creation only after read model/UI parity;
5. pilot with one non-owner employee before broader DreamTeam retirement.


### Portal role model — canonical permission vs experience

TORO now distinguishes two concepts:

1. **Canonical organization role**
   - ADMIN
   - RRHH
   - GERENCIA
   - JEFE_DEPARTAMENTO
   - CONTABILIDAD
   - AUDITOR
   - EMPLEADO

These are organization-scoped permission facts and must come from the active TORO context/membership.

2. **Functional experience role**
   - FOUNDER
   - RECEPCION
   - OPERACIONES
   - FINANZAS
   - GROWTH
   - SYSTEMS

These may select navigation/routing/UX but do not independently grant organization data access.

Rules:
- navigation is never authorization;
- app_metadata.role_codes is not accepted as organization authorization because it is not organization-scoped;
- app_metadata.toro_role may select a functional experience only while an active organization context exists;
- FOUNDER still requires privileged ADMIN/GERENCIA membership in the active organization;
- data/actions remain governed by TORO context + RLS/RPC/policy.


### Execution update — People + Portal — 2026-09-23

#### HECHO — developer validation fabric
- canonical TORO CI now validates every pull request, including stacked PRs;
- workflow runs `npm test -> lint -> build`;
- `workflow_dispatch` available;
- stale runs cancel through concurrency;
- CI improvement merged to `main` via PR #85;
- Phase 1 inherited the same workflow.

This resolves a repeated systemic validation gap rather than adding branch-specific CI hacks.

#### HECHO — TORO People self-service server Wave 1
PR #84 merged into Phase 1.

Verified:
- authenticated/read-only employee self-service model;
- canonical TORO context required;
- own employment projection;
- own profile through governed `employee_self_profile` RPC;
- own shifts;
- own leave requests/balances;
- own attendance;
- auth+org+employee defensive identity check;
- salary/bank/arbitrary HR JSON excluded from public self model;
- Vitest PASS;
- lint PASS;
- build PASS;
- Vercel PASS.

No production schema/write action was introduced.

#### HECHO — Portal session/context convergence
PR #86 merged into Phase 1.

Verified:
- Portal session consumes `resolveToroContext({mode:'organization'})`;
- no global unscoped `user_roles` authorization inside session resolver;
- unscoped `app_metadata.role_codes` no longer grants organization access;
- canonical organization roles can enter Portal:
  ADMIN, RRHH, GERENCIA, JEFE_DEPARTAMENTO, AUDITOR, EMPLEADO;
- CONTABILIDAD maps to FINANZAS experience;
- FOUNDER still requires active ADMIN/GERENCIA in the selected organization;
- functional experience roles remain UX/routing, not data authorization;
- regression tests + lint + build + Vercel passed before merge.

#### NEXT — first People Portal surface
Draft PR #87:
`feat: add read-only TORO People Mi perfil surface`

Scope:
- `/toro/mi-perfil`;
- employment summary;
- upcoming shifts;
- leave balance/request summary;
- recent attendance;
- safe unavailable/error states;
- no editing/writes/payroll/bank data.

Status:
- Vercel preview PASS;
- canonical CI validation in progress at this update.

After PR #87 passes:
1. merge read-only `Mi perfil`;
2. perform representative employee hosted/mobile QA when a safe employee identity is available;
3. add leave-request creation as a separately gated write workflow;
4. do not retire DreamTeam UI until self-service parity + pilot evidence exists.


### Dependency security finding — 2026-09-23

CURRENT:
- canonical CI `npm ci` reports 5 dependency vulnerabilities: 2 moderate, 3 high;
- this is a package-audit signal, not proof that all findings are exploitable in TORO runtime.

RULE:
- do not run `npm audit fix --force` automatically;
- TORO Systems/Builder must identify affected packages, production reachability, patched versions, compatibility risk and rollback before upgrading;
- dependency security becomes part of the recurring system/dependency audit profile.

NEXT:
- produce a dependency vulnerability triage after current People/Portal PR gates finish;
- patch only through tested PRs with tests/lint/build and preview evidence.


### People Portal execution update — 2026-09-23

#### HECHO — Mi perfil
PR #87 merged into the Phase 1 integration line.

Verified:
- route `/toro/mi-perfil`;
- read-only own employment summary;
- upcoming shifts;
- leave balance/request summary;
- recent own attendance;
- own contact email through the governed self-profile projection;
- safe unavailable/identity-mismatch/error states;
- navigation only to existing route;
- no salary/bank/other-employee projection;
- Vitest PASS;
- lint PASS;
- build PASS;
- Vercel PASS.

Merge commit:
`22637e1165aaed8eabdf70e8602ef4d5a0b828e7`

#### HECHO — Solicitudes
PR #88 merged into the Phase 1 integration line.

Verified:
- route `/toro/solicitudes`;
- employee may create own leave/vacation request;
- browser never supplies employeeId;
- TORO context supplies org + employee;
- existing `submit_leave_request` RPC rechecks current employee/authorization;
- request creation uses `pending_manager`, does not autoapprove;
- overlap/date/type/reason rules reused;
- DB audit trigger reused;
- notification creation reused;
- no balance deduction/override;
- no payroll mutation;
- no schema migration;
- Mi perfil pending counter corrected for `pending_manager` / `pending_hr`;
- Vitest PASS;
- lint PASS;
- build PASS;
- Vercel PASS.

Merge commit:
`9de9ef79157ac4de23e090ee5c54f29d81f19399`

#### CURRENT People Portal capability
A linked employee can now, within the Phase 1 integration line:
1. enter the shared TORO Portal through the canonical scoped session;
2. view their own governed People snapshot;
3. review shifts / leave summary / recent attendance;
4. submit their own leave request into the existing governed HR workflow.

This is the first DreamTeam daily workflow slice absorbed into TORO without a second login or duplicate database.

#### Important remaining gate
This is code/preview verified, not representative-user adoption proof.

Before declaring DreamTeam self-service replaced:
- use a deliberately approved employee pilot identity;
- verify hosted login/session on mobile;
- verify real RLS behavior;
- submit one explicitly authorized test/real request, not a hidden synthetic production mutation;
- confirm manager/RRHH sees the resulting workflow correctly;
- verify rollback and support path.

#### NEXT TORO People sequence
1. representative employee hosted/mobile pilot;
2. employee directory/onboarding after organization_memberships production decision;
3. attendance/incidents/time-import convergence;
4. scheduling convergence;
5. TORO Comms convergence for team chat/DMs;
6. shared Governance split for approvals/audit;
7. payroll only after People identity/self-service stability;
8. loans/settlements last.


### Attendance execution update — 2026-09-23

#### HECHO — TORO People Attendance Wave 3A
PR #94 merged into the Phase 1 integration line.

Verified employee surface:
- `/toro/mi-asistencia`;
- own attendance days only;
- own entry/exit summary;
- actual vs official minutes;
- attendance/approval/payroll-inclusion status;
- no raw punches;
- no clock employee ID;
- no source import ID;
- no attendance blocks;
- 45-day bounded self projection.

Verified review surface:
- `/toro/asistencia`;
- read-review scope for ADMIN/RRHH/GERENCIA/AUDITOR/CONTABILIDAD;
- navigation enabled only where current role UX/RLS supports it;
- open attendance exceptions;
- bounded recent attendance days;
- recent time-import metadata;
- no file name/hash/raw payload;
- no resolution payload;
- no raw_punches;
- no attendance_blocks.

Current production aggregates observed read-only at design time:
- 495 attendance days;
- 408 complete;
- 46 incomplete;
- 40 pending_identity;
- 1 unknown_identity;
- 252 approval approved;
- 241 approval pending;
- 2 approval rejected;
- 94 open attendance exceptions;
- 72 resolved exceptions;
- 5 visible time imports.

Explicitly still blocked:
- attendance correction;
- incident resolution;
- time-clock commit/replace;
- payroll inclusion decision;
- payroll recalculation.

Validation:
- Vitest PASS;
- lint PASS;
- build PASS;
- Vercel PASS.

Merge commit:
`e1d5d1ef01a5ab0490ed75fb3dc9c13d86debe71`


### Schedule execution update — Wave 4A — 2026-09-23

#### HECHO — Mi horario
PR #97 merged into the Phase 1 integration line.

Verified:
- route `/toro/mi-horario`;
- own linked employee identity only;
- current/future assignments only;
- only `published` / `confirmed` shift states;
- maximum 60 rows;
- start/end, break and visible status;
- identity boundary `user_id + org_id + employee_id`;
- no draft/cancelled shifts;
- no `data` JSON/internal notes;
- no shift template administration;
- no `salary_history`;
- no payroll forecast;
- no other employee schedule;
- no write action or schema change;
- Vitest PASS;
- lint PASS;
- build PASS;
- Vercel PASS.

Current production aggregate observed read-only during design:
- 102 published assignments;
- 70 draft assignments;
- 99 cancelled assignments;
- 10 active templates.

Merge commit:
`359c95594d3cd08333381ff0e47aaa579e8273cf`

#### NEXT schedule sequence
1. Wave 4B — management/team schedule read-only with existing org/department RLS.
2. Wave 4C — planning writes only after separate audit/evidence.
3. Wave 4D — publish/copy as higher-impact action.
4. Wave 4E — employee change/swap only after a reviewed self-service RLS/RPC contract exists.

Salary/payroll forecast must remain a separately authorized finance capability and must not leak into generic team schedule views.


---

## Alignment update — 2026-09-29

This update is subordinate to the existing Plan General. It does not create another roadmap, brain, backlog, source of truth or product root.

### Current productization model

Dreamcatcher remains the first real proving ground. TORO itself is the reusable product.

Every new learning/capability must pass the existing Pilot-to-Product Promotion Gate and be classified as:

- `UNIVERSAL_CORE`
- `INDUSTRY_PACK`
- `TENANT_CONFIG`
- `CONNECTOR_EXECUTOR`
- `DO_NOT_PROMOTE`

No item is promoted from one anecdote. Reuse requires evidence, source authority, tenant isolation, risk/action ceiling and regression/negative tests.

Current universal Core design contracts:

- `toro_core_business_relationship_contract_v1`
- `toro_core_work_object_contract_v1`
- `toro_core_offering_contract_v1`
- `toro_core_commercial_order_contract_v1`

These are **DESIGN/SANDBOX ONLY**. They are not production DDL and do not authorize external private-data onboarding.

### Mandatory tenant-reference invariant

All multi-tenant Core cross-object references must bind tenant and object together:

`(org_id, referenced_id)`

Never rely on a referenced UUID alone.

Reason:
- RLS governs query-time access.
- composite tenant-local foreign keys also prevent accidental/malicious cross-tenant references at the integrity layer.

Sandbox negative tests passed for:
- Relationship -> Party
- Order -> Customer Party
- Order Line -> Offering
- Work Object -> Customer Party
- Fulfillment -> Work Object

### Multiindustry sandbox evidence

Rollback-safe Supabase sandbox tests passed with:
- B2B field-services synthetic organization;
- retail synthetic organization;
- separate synthetic authenticated principals;
- isolated memberships;
- parties/relationships;
- offerings;
- commercial orders/order lines;
- work objects;
- fulfillments.

RLS returned only tenant-local data and cross-tenant composite FK attempts were rejected. Full rollback verification left no synthetic users, organizations, schemas, tables or helper functions.

This is strong schema-level portability evidence, **not** external-business readiness.

### Readiness status — 2026-09-29

External onboarding remains blocked.

Priority gates:

1. **Gate F — Security / Tenant Isolation: FAIL**
   - organization-membership and multiindustry isolation contracts passed rollback-safe Supabase sandbox tests;
   - canonical persistent membership/runtime authenticated multi-org E2E remains unproven;
   - SECURITY DEFINER grants/internal authorization remain under intent-by-intent review;
   - do not blanket-revoke privileges;
   - owner directive remains: ACCESS FIRST, PASSWORD/POLICY ROTATION LATER.

2. **Gate D — Execution Engine: PASS**
   - verified E2E workflows: **12**
   - threshold: **>=12**
   - evidence spans recovery, security/communication, systems reliability, release governance, asset transfer, F&B truth reconciliation, RLS hardening, SECURITY DEFINER hardening, finance reconciliation, revenue contract operationalization, document intake, and maintenance source parity.
   - code/tests/previews alone do not count.
   - Room Safety, People attendance/payroll and Kross current-state remain open operating gates; Gate D PASS does not close them.

3. **Gate I — Portability: PARTIAL**
   - persistent synthetic B2B and retail tenants now exist in dreamteam-recovery-sandbox;
   - membership RLS, Core object isolation and composite tenant-local foreign-key negative tests PASS;
   - deterministic export snapshot hash: 7a622d1a1ad253a3ab11c2d020375c4cbb081ff9867eb7efd692a96b15abda25;
   - teardown assertions PASS inside transaction and rollback restores the persistent fixture;
   - GitHub PR #196 / merge a4cbd3bafdd88a98a76713c1ebd4af65f8cd4836 contains the reproducible draft/tests/sandbox harness;
   - remaining requirement: hosted TORO runtime must authenticate into the synthetic organization, resolve context, configure knowledge/capabilities/workflow and prove governed runtime export/teardown.

### Critical path to a real external design partner

```text
Authenticated multi-org runtime isolation
-> hosted onboarding of the persistent synthetic second tenant
-> TORO Business internal self-hosted tenant
-> Controlled External Pilot
```

Controlled External Pilot requires:
- readiness A-I PASS;
- explicit founder approval;
- no critical tenant/authz bypass;
- governed onboarding/support/offboarding/export;
- no private data from an external business before the gate allows it.

### Industry Packs

Previous wording that generalized Business Packs were wholly out of scope is superseded by this rule:

- **design and sandbox validation are allowed now** to remove Dreamcatcher hardcode;
- **production activation and external private-data onboarding remain blocked** by readiness.

Hospitality Pack is the first vertical pack. It must map onto universal Core rather than forcing Core to adopt hotel-specific entities.

### Plan General governance reinforcement

- TORO remains the only master system.
- No second brain.
- No second master plan.
- No parallel backlog.
- No parallel task system.
- No parallel capability registry.
- No client-specific Core fork.
- Supabase `operations.projects`, `operations.tasks`, governed knowledge/source-authority contracts remain canonical execution/control.
- Airtable is a human-facing projection/transition surface, not canonical execution authority.
- GitHub/Vercel are subordinate code/deployment/evidence layers.
- Owner-dependent questions/actions must be grouped only at the end of responses.


### Execution progress R2 — 2026-09-29

Verified after the initial 2026-09-29 alignment:

- Gate D reached **PASS: 12/12** verified E2E workflows.
- Representative finance proof: ICE NISE 800984 Sep-2026 PDF-verified invoice CRC369,825 -> canonical utility obligation -> exact Alegra corporate bank-ledger movement #7214 on 21/09/2026, account mapped to Lafise CRC ****1998 -> canonical reconciliation ice_800984_202609_invoice_alegra_7214 = reconciled/high. Raw Sep bank statement remains outside current Supabase bank import; no payment/journal was created by TORO.
- Gate I advanced to **PARTIAL** with persistent synthetic B2B + retail tenants, export hashing and teardown rehearsal in recovery sandbox.
- Core portability harness merged through PR #196 / a4cbd3bafdd88a98a76713c1ebd4af65f8cd4836.
- W09 Kross current-state is DEFERRED_OWNER_DECISION, not an engine failure. Paid Kross Live remains intentionally deferred until the rest of TORO is ready.
- W10 Room Safety and W12 People attendance->payroll remain open critical operating gates even though Gate D threshold is met.
- Current readiness bottleneck is Gate F authenticated multi-org runtime isolation plus the application-level portion of Gate I.

### FIN-01 · auditoría ordenada de correos y extracción financiera — cierre 2026-09-29

**OBJETIVO:** revisar el universo financiero y administrativo de correo de enero a agosto de 2026, extraer evidencia útil y aplicarla al expediente existente sin convertir mensajes, solicitudes o avisos en pagos confirmados.

**COBERTURA VERIFICADA:** Gmail hotel `452/452` cuerpos completos; Gmail Mauricio `126/126` candidatos completos; Gmail Margot/Luz `554/554` candidatos completos; Outlook `2,713/2,713` mensajes inventariados por metadatos y `141/141` mensajes de alta prioridad leídos completos. No se leyó indiscriminadamente correo personal/promocional ajeno al alcance financiero; se excluyó por relevancia y privacidad. No hubo errores de lectura en los lotes completados.

**HALLAZGOS PRINCIPALES:** se localizaron informes de Alegra de enero a julio: ingresos reportados `CRC 237,763,864` y gastos reportados `CRC 206,818,662`, redondeados a unidades completas. Agosto queda `PENDING_EVIDENCE` porque no apareció el informe mensual. La diferencia de febrero (`CRC 46,259,698` frente a `CRC 46,255,096` en una referencia posterior) queda abierta como diferencia de versión/corte. Se detectaron dos transferencias BAC candidatas GORIDE MOTO por `USD 121` y `USD 264`, pero requieren amarre con banco, Kross y Alegra. Las solicitudes S3 Ingenieros de `USD 146` y `USD 140` no se suman como cobros. El aviso Synerjoy/Booking de `USD 9,383` se conserva como obligación candidata y no como gasto pagado. Liberty e ICE/Kolbi quedan como servicios pendientes de entidad hotel/personal. WeSpeak queda como señal operativa, no prueba bancaria.

**20 MEJORAS APLICADAS:** contrato de fuentes; cobertura explícita; lectura por relevancia; autoridad Kross/Alegra/bancos/Dropbox; separación hotel-personas; separación de proyectos; CRC/USD separados; pendiente distinto de cero; cobro distinto de solicitud; pago distinto de recordatorio; señal distinta de evidencia; tabla mensual; total controlado; duplicados; anomalías visibles; servicios por entidad; minimización de datos; trazabilidad; no escritura externa; siguiente unidad única. El anexo quedó en `REPORTE_FINANCIERO_HOTELERO_DREAMCATCHER_ENE_AGO_2026_V3_CORREO.docx`, SHA-256 `D51341E4AF21B1FA7FA528B9AD432FED920C35983BDD5CC320D42B5B52D72D0C`; V2 se conserva como recuperación.

**ESTADO:** `HECHO · COBERTURA EMAIL FINANCIERA COMPLETADA`; `PENDING_EVIDENCE · AGOSTO ALEGRA, ADJUNTOS BANCARIOS, AMARRES GORIDE, SERVICIOS Y ENTIDAD BOOKING`; `BLOQUEADO · ESCRITURAS O RECLASIFICACIONES EXTERNAS`. No se modificó Alegra, Kross, banco, Dropbox, Airtable ni Supabase.

**ÚNICA SIGUIENTE:** extraer únicamente los adjuntos primarios identificados en mensajes BN/BAC/LAFISE/Liberty/ICE/Booking, calcular hash, cuenta, fecha, moneda, monto, referencia y entidad, y reconciliar solo los casos materiales sin crear otro expediente.

**REVERSIÓN:** retirar el anexo V3 y esta sección documental; conservar V2, originales y fuentes externas sin cambios.

### FIN-01 · corte agosto–septiembre y única estimación de planilla — 2026-09-29

**OBJETIVO:** completar el reporte financiero del hotel con agosto y septiembre, separar hotel de proyectos/personas/propiedades externas y estimar únicamente la segunda quincena de la última planilla disponible.

**HECHO VERIFICADO EN ALEGRA:** agosto: ingresos CRC 15,871,652, gastos operativos CRC 17,313,028, utilidad operativa CRC -1,441,376, resultado neto CRC -3,751,293; caja con entradas CRC 33,576,816, salidas CRC 42,774,278 y flujo neto CRC -9,197,462. Septiembre: corte de trabajo al 29/09; ingresos CRC 14,329,059, gastos operativos CRC 10,894,271, utilidad operativa CRC 3,434,788, resultado neto CRC 2,797,155; caja mensual devuelta por Alegra con entradas CRC 32,888,206, salidas CRC 32,083,489 y flujo neto CRC 805,717. Septiembre no se presenta como cierre definitivo.

**PLANILLA:** agosto quedó preparado/revisión con bruto CRC 2,335,263 y neto CRC 2,304,371. Septiembre 01–15 quedó en revisión con bruto CRC 1,243,659 y neto CRC 1,092,996. Única estimación autorizada: septiembre 16–30 igual a la última planilla disponible, bruto CRC 1,243,659 y neto CRC 1,092,996. Total septiembre con estimación: bruto CRC 2,487,318 y neto CRC 2,185,992. No se estimaron otros rubros ni se interpretó planilla como pago.

**SEPARACIÓN EXTERNA:** se incorporaron como lectura separada Cabuya CRC 2,500,000 de salida en agosto y septiembre; Santa Toro entradas CRC 1,383,095 en agosto y CRC 158,610 en septiembre, con salidas identificadas CRC 1,792,208 y CRC 809,630; DIEX, Vista Alegre, préstamos y personas vinculadas se conservan fuera de la utilidad operativa hasta reconciliar entidad y naturaleza.

**CORREOS FALTANTES:** no es necesario leer todos los correos. Son necesarios solo adjuntos primarios o mensajes que puedan cambiar monto, moneda, entidad, fecha, obligación o prueba de pago: banco, planilla/CCSS, Booking con factura, Santa Toro, servicios y documentos de Alegra. No se incorporan newsletters, duplicados, avisos de exportación sin contenido, mensajes WeSpeak sin liquidación bancaria ni correo personal ajeno. Septiembre hotel tuvo 30 mensajes etiquetados en el alcance y 4 adjuntos identificados; el resto queda fuera por criterio de relevancia, no como “cero”.

**BOOKING AÑADIDO:** se leyeron los dos adjuntos primarios de Booking del 06/09: factura 1663815593 para Santa Toro, periodo 01–31/08, comisión USD 156.39, vencimiento 19/09; factura 1663811248 para Atrapa Sueños, periodo 01–31/08, comisión USD 2,455.93, vencimiento 19/09. Total documental USD 2,612 redondeado; no se trata como pago confirmado ni se agrega a utilidad hasta conciliar Alegra/banco.

**REPORTE:** `output/toro-os-organizacion-2026-09-19/REPORTE_FINANCIERO_HOTELERO_DREAMCATCHER_ENE_SEP_2026_V4.docx`; SHA-256 `4E4A82A637CB58F89F8484BF2C2CD831494CE138D99A69DBC694E484FB605AB4`. Validación estructural: 51 tablas y 164 párrafos. La renderización visual sigue bloqueada por ausencia de `soffice.exe`.

**ESTADO:** `HECHO · AGOSTO Y SEPTIEMBRE PARCIAL INCORPORADOS`; `PREPARADO · ÚNICA ESTIMACIÓN DE PLANILLA`; `PENDING_EVIDENCE · ADJUNTOS PRIMARIOS Y CONCILIACIÓN DE ENTIDADES`; `BLOQUEADO · ESCRITURAS EXTERNAS Y UTILIDAD CONSOLIDADA DEFINITIVA`. No se modificó Alegra, Kross, bancos, Dropbox, Airtable ni Supabase.

**ÚNICA SIGUIENTE:** extraer y conciliar los adjuntos primarios de septiembre ya identificados (Booking, banco, servicios y planilla); cualquier correo que no cambie un monto/entidad/fecha o no pruebe un pago se mantiene excluido con razón documentada.

**REVERSIÓN:** retirar solo el anexo V4 y esta sección; conservar V3, V2, originales y fuentes externas intactos.

### CIERRE Y ALINEACIÓN CANÓNICA FIN-01 — 2026-09-30

**PUNTERO ÚNICO:** para el reporte financiero del hotel, el documento vigente es `REPORTE_FINANCIERO_HOTELERO_DREAMCATCHER_ENE_SEP_2026_V4.docx`; V3 y V2 quedan como histórico y recuperación. La sección FIN-01 de agosto–septiembre y el recibo correspondiente en `CONTINUAR.md` sustituyen cualquier estado anterior que aún describa agosto como pendiente sin consulta Alegra o que apunte a V3 como salida actual.

**ESTADO FINAL DE ESTA UNIDAD:** `ALINEADO AL PLAN GENERAL / DOCUMENTACIÓN LOCAL CERRADA`. Agosto está incorporado; septiembre está incorporado como corte parcial al 29/09; solo la segunda quincena de la última planilla fue estimada; Booking queda documentado como obligación no pagada hasta conciliación; proyectos, Santa Toro, deuda y personas vinculadas permanecen separados del hotel.

**PENDIENTES NO CERRADOS:** conciliación primaria de banco/planilla/CCSS/servicios/Booking y utilidad consolidada definitiva. Estos pendientes no se convierten en cero ni bloquean el cierre documental del chat. No se ejecutan escrituras externas ni respaldos Dropbox porque el gate de custodia/ACL y la autorización de destino no están confirmados en esta unidad.

**CIERRE DEL CHAT:** no queda una tarea activa en este hilo. Si se reabre, debe comenzar desde este puntero y ejecutar solo la siguiente acción registrada en `CONTINUAR.md`; no repetir inventarios ni releer el historial completo.


# 23. VERSION FINAL — definición del producto terminado — owner direction 2026-09-29

**Classification:** TARGET definition, proposed acceptance detail; not a runtime-completion claim.  
**Source:** owner direction of 2026-09-29, constitution and existing General Plan/contracts.  
**Scope:** existing TORO master product and authorized portfolio; no new master project/backlog.  
**Delivery:** full product definition below; editable/presentation exports and a complete indexed General Plan reader are derived artifacts.  
**Governance:** existing A0–A6 workflow authority, Autopilot caps, identity/privacy, budget, readiness, source and release gates remain effective.

**R2 refinement — 2026-09-30:** Mauricio designates this section as **VERSION FINAL**: the canonical TARGET description of TORO as the finished product. The subordinate execution/design prompt is `docs/product/TORO_VERSION_FINAL_SUPERPROMPT_V1.md`. It strengthens the executive/general-manager layer, first-class mobile experience, event-driven execution, Same-Brain OpenClaw/WhatsApp architecture, Business DNA portability and the visual self-use loop in which TORO Business operates with TORO. Its VF01–VF40 refinements extend the product definition without replacing the existing P01–P40 acceptance criteria, R4 Human Layer controls, current queues, source authorities or runtime/release gates.

**R3 interface decision — 2026-09-30:** TORO is **platform-first and interface-agnostic**. ChatGPT becomes a first-class TORO interface through a TORO ChatGPT App built with the Apps SDK and a governed TORO MCP boundary. ChatGPT is not the system of record and does not own critical business logic, memory, permissions or execution state. TORO Brain, Supabase/canonical data, Control Plane, policy/permission enforcement and evidence/receipt state remain authoritative.


### Propósito y alcance

TORO reúne la operación, el conocimiento y el avance de los negocios y proyectos autorizados en una plataforma que Mauricio puede abrir, entender y dirigir desde el celular. Comprende el contexto, conecta las fuentes existentes, organiza el trabajo, ejecuta dentro de sus permisos y muestra resultados comprobables. La experiencia se vuelve más sencilla mientras el sistema mejora.

Esta definición describe el producto final deseado. Las capacidades se narran en presente para poder diseñar desde el resultado terminado y volver hacia los requisitos de construcción. Su clasificación es TARGET; el capítulo sobre realidad actual conserva los límites de implementación. Esta versión no acredita que el producto ya funcione de esa manera ni activa agentes, conectores, permisos o publicaciones.

La única base es el Plan General de TORO en `docs/product/TORO_BRAIN_GENERAL_PLAN.md`. Este texto forma parte de su ampliación de producto terminado. El documento editable, su presentación de lectura y el índice visual son proyecciones de esa misma definición, no un segundo plan ni otra lista de tareas. Fecha de corte: 29 de septiembre de 2026, Costa Rica.

### La experiencia completa

Mauricio abre TORO y encuentra su portafolio autorizado, los asuntos que necesitan una decisión y el trabajo que está avanzando. Puede tocar un negocio, proyecto, persona, sistema o módulo; preguntar qué sucede; revisar la evidencia y ordenar una acción permitida. Para el trabajo ordinario no necesita abrir Codex, recorrer chats ni recordar dónde quedó cada conversación.

Una solicitud se convierte en un objeto de trabajo trazable. TORO identifica a quién pertenece, qué fuente responde, qué resultado se espera y qué acciones están permitidas. Mantiene el contexto durante los relevos, los reinicios y el cambio entre Portal y WhatsApp. Solo pregunta cuando falta una decisión o un dato material que no puede resolver por su cuenta.

Cada resultado muestra qué cambió, dónde verlo, quién intervino, qué prueba lo respalda y qué sigue. Un documento preparado, una función desplegada y una mejora utilizada con beneficio medido tienen estados distintos. Los reportes se concentran en cambios útiles y no llenan la pantalla con ciclos sin novedades.

### Una sola plataforma y dos maneras de trabajar

La portada interna final es el Cerebro conectado para toda identidad autenticada, siempre filtrado por ámbito y permisos. El dueño ve el portafolio autorizado con Atención y decisiones a mano; Recepción, mantenimiento, finanzas y los demás perfiles ven un foco inicial de Cerebro adaptado a su trabajo y su siguiente acción permitida. «Hoy» sigue siendo la vista operativa de atención, accesible en un toque, no una portada distinta. La edición pública es una demostración saneada y separada.

La portada combina mapa y lista equivalente sobre los mismos objetos, con señales de atención y acciones en contexto. No obliga a explorar el grafo para una tarea repetitiva: búsqueda, «Hoy» y acceso directo al objeto conservan ámbito y selección. La experiencia prioriza pantallas compactas con detalle progresivo; el contenido largo, la ampliación de texto y las excepciones pueden desplazarse con scroll normal.

La navegación visible reúne **Cerebro, módulo 0 transversal**, y los once módulos de dominio existentes, del 1 al 11: Hoy y Atención, Dinero, Studio, Clientes, Operaciones, Personas, Crecimiento, Legal y Riesgo, Activos y Espacios, Proyectos y Sistemas. Cerebro muestra y coordina sus relaciones sobre los mismos objetos, permisos y estado. Conversación, búsqueda, evidencia, aprobaciones, enlaces y notificaciones siguen siendo capacidades comunes. Esta clasificación TARGET del 10 de octubre de 2026 no renumera IDs técnicos ni activa otro subsistema.

### ChatGPT como interfaz oficial de TORO

El usuario puede abrir TORO desde ChatGPT y conversar con el mismo Brain que utiliza Portal o WhatsApp. La experiencia puede presentar Brain, prioridades, decisiones, módulos, evidencia y recibos como componentes interactivos, pero la interfaz no crea una autoridad paralela.

Una instrucción desde ChatGPT conserva identidad, ámbito, fuente, permisos y estado canónico. Si la capacidad es solo de lectura, TORO no simula una acción. Si una acción está permitida, pasa por el mismo ciclo de política, aprobación, ejecución, verificación y recibo que cualquier otra superficie.

El Portal sigue siendo la superficie visual/control más completa; ChatGPT optimiza investigación, conversación, razonamiento y comando; mobile optimiza operación rápida; WhatsApp/OpenClaw optimiza continuidad y trabajo en canal. Todos proyectan el mismo TORO.

### Portafolio y contextos

TORO representa personas, organizaciones, negocios, propiedades, proyectos, productos, proveedores y aliados con identidades y relaciones explícitas. La red no obliga a que todo sea un cliente ni convierte una propiedad en una empresa por aparecer como nodo.

El portafolio de Mauricio contempla Dreamcatcher, Santa Toro, Vista Alegre, Cabuya y TORO Business, además de los proyectos ya registrados y las relaciones autorizadas. Dreamcatcher contiene sus propiedades y productos según el inventario vigente, incluyendo las referencias de Villa Toro y Makaiza. Atrapasueños y las entidades legales mantienen sus relaciones documentadas. El encuadre definitivo de Santa Toro, Vista Alegre y Cabuya se toma de las fuentes patrimoniales y operativas; su presencia visual no reactiva negocios, no acredita titularidad y no modifica estructuras legales.

Cada contexto identifica qué está activo, en pausa, histórico, en preparación o pendiente de verificación. El dueño puede comparar ámbitos con permiso de portafolio; los datos personales y los clientes externos conservan su aislamiento. Una relación visible explica si significa pertenencia, propiedad documentada, operación, dependencia, colaboración o conexión comprobada.

### TORO Business utiliza TORO

TORO Business es el negocio que desarrolla, vende y da soporte al producto. Utiliza el mismo TORO para organizar su trabajo, registrar costos, entender usuarios, controlar calidad, gestionar soporte y mejorar. Aquí autouso significa operar su propio negocio como un ámbito interno; no decide dónde se aloja la infraestructura.

El Brain del producto y el nodo TORO Business representan funciones distintas del mismo sistema. El primero coordina los ámbitos autorizados; el segundo es un negocio usuario, con sus propios proyectos y permisos. TORO Business no tiene un atajo privilegiado para saltarse el aislamiento de otros negocios.

La retroalimentación sigue un ciclo visible: experiencia del usuario, problema u oportunidad, propuesta, evaluación, decisión aplicable, piloto, medición y conservación o reversión. Una mejora de TORO se prueba utilizando TORO. Los patrones reutilizables se separan de los datos privados que los originaron.

### El Brain y la red completa

El Brain ocupa la mayor parte del área útil en la vista del dueño y conserva a la vista el contexto del portafolio. Su lenguaje visual comunica una organización viva: identidad oficial, profundidad, nodos claros y movimiento moderado. La referencia de una interfaz cinematográfica se traduce en navegación útil, legibilidad y respuesta rápida.

La vista global muestra todos los ámbitos autorizados y las conexiones principales. Al acercarse aparecen dominios, módulos, proyectos, capacidades y objetos relevantes. Un minimapa o rastro de contexto conserva la orientación al explorar. Volver a la vista global no pierde la selección ni obliga a navegar por redes independientes.

Red completa significa que todo lo registrado y autorizado es localizable. El detalle se agrupa por nivel para evitar que miles de tareas, documentos o filas hagan ilegible la pantalla. El inventario permite comprobar cobertura por fuente y fecha, separando registrado, visible para ese usuario, lectura comprobada, actividad vigente y bloqueado o desactualizado. Una fuente inaccesible se muestra como desconocida.

Tocar un nodo abre una ficha con nombre, tipo, ámbito, responsable, objetivo, estado, fuente, fecha, evidencia, vínculos, relaciones y siguiente acción permitida. Tocar una conexión explica su significado y respaldo. Los filtros conservan el contexto global y avisan qué parte de la red se está viendo.

La actividad ilumina o amplía suavemente los nodos afectados mientras existe un evento de trabajo vigente. La ficha permite abrir la acción, su resultado y la evidencia. La señal desaparece al expirar o revocarse. La salud de un servicio tiene un indicador distinto: estar encendido no significa estar ejecutando trabajo. Se puede revisar la historia mediante una línea de tiempo, con reproducción claramente identificada.

La información también está disponible como lista y línea de tiempo, con equivalencia de estados y acciones. Hay controles de movimiento reducido, navegación por teclado, buen contraste y etiquetas que explican los colores. El modo de presentación usa datos sintéticos, públicos o expresamente aprobados.

### Celular y entrada a TORO

La entrada deseada es `https://dreamcatcherhotel.com/toro`. Se define como un acceso sencillo que presenta TORO y dirige al Portal canónico; la decisión de ruta o redirección conserva los sitios y releases existentes. Esta dirección es TARGET, no una ruta entregada por este documento.

El enlace puede ser común para todos. La operación privada utiliza una identidad individual sencilla y una sesión adecuada al dispositivo. Esto permite mostrar el alcance correcto, identificar quién actuó y retirar un acceso sin cambiar el de todos. El demo público y la entrada no contienen información privada del hotel.

En celular, el usuario encuentra su negocio activo, Atención, búsqueda y comando. El Brain adapta el nivel de detalle al espacio, permite tocar nodos y abre fichas con acciones grandes y claras. La lista equivalente permite completar tareas sin manipular el mapa. Adjuntar una foto, dictar una solicitud o revisar una aprobación requiere pocos pasos. El estado de conexión distingue información reciente, caché y envío pendiente; nunca presenta una captura sin enviar como trabajo ya registrado.

En escritorio se amplía la exploración, la comparación autorizada y la revisión de evidencia. El cambio de dispositivo conserva el contexto y los permisos. Un dispositivo compartido permite cerrar sesión y cambiar de persona sin conservar el acceso anterior.

### Usuarios y vistas

Mauricio tiene la vista de dueño sobre todos los ámbitos que sus permisos controlan. Carolina y la madre de Mauricio reciben vistas amplias cuando los alcances y capacidades individuales estén definidos; un vínculo familiar no otorga acceso automáticamente. El producto permite una experiencia sencilla con permisos precisos.

Recepción ve servicio, clientes y operación de su ámbito. Mantenimiento ve asignaciones, espacios y evidencia de cierre. Finanzas ve obligaciones, caja y conciliaciones autorizadas. Crecimiento y producción creativa ven campañas, activos y clientes permitidos. Personas administra el trabajo y los procesos laborales que le corresponden. Sistemas controla la salud técnica para sus administradores.

Cada persona tiene una identidad y puede trabajar en varios negocios con roles distintos. El cambio de contexto es visible. Los datos personales y de trabajo privado mantienen sus límites incluso ante un administrador del negocio. Ocultar un botón no es la protección: cada lectura y acción se valida en el servidor.

### Contrato común de los módulos

Cada módulo muestra información útil para el rol, su ámbito activo, fuente y fecha. Cuando un dato no está confirmado, lo dice y ofrece el siguiente paso seguro. Las métricas indican unidad, período, moneda cuando corresponde y forma de cálculo. Una proyección no se confunde con un dato observado.

Las fichas comparten atención, responsable, dependencias, historial, enlaces y evidencia. Se puede pedir trabajo, revisar propuestas, aprobar lo que corresponde, pausar el trabajo autorizado o abrir el sistema original. La acción ejecutada vuelve al mismo registro canónico. Un módulo no crea una segunda tarea cuando otro módulo ya es responsable del asunto.

La interfaz admite español e inglés. Fechas, moneda, números y zona horaria se resuelven por usuario y ámbito. Los documentos conservan idioma y procedencia originales.

Los módulos se habilitan según disponibilidad comprobada, configuración del negocio y capacidades del usuario. El núcleo de identidad, aislamiento, seguridad, autoridad de fuentes y auditoría no es opcional. Un módulo todavía no implementado se describe en esta visión final y conserva su estado real en la matriz de ejecución.

### Módulo 0 Cerebro

Cerebro es la entrada visible a la inteligencia y coordinación de TORO. El usuario entiende el conjunto, encuentra el asunto que cambia una decisión, consulta las relaciones y pide trabajo dentro de su ámbito. Utiliza la misma proyección, contexto, permisos, memoria, tareas, decisiones, ejecuciones y recibos de TORO; no mantiene copias independientes.

La vista del dueño combina una red global autorizada con Atención, búsqueda, comando y un inspector. El negocio TORO Business aparece junto a los demás ámbitos permitidos y muestra cómo su producto, calidad, soporte, costo y mejoras se relacionan. La vista de un empleado conserva ese lenguaje con un foco práctico y solo los objetos autorizados. Un negocio, un proyecto, una herramienta y una ejecución tienen tipos distintos.

Desde un nodo se puede consultar el motivo de su estado, fuente y fecha, abrir evidencia, entrar al módulo responsable o preparar una acción disponible. Una relación muestra qué significa y qué la respalda. Cada acción conserva su objeto y versión; una aprobación no concede permiso general. Si una capacidad no está conectada o probada, la ficha lo indica y ofrece el relevo existente.

La red representa contexto y dependencias; el pulso representa un evento vigente autorizado. Salud, actividad e historial usan señales distintas. El mapa, la lista equivalente y la línea de tiempo comparten objetos y resultados. En móvil se puede resolver una consulta sin depender del gesto de arrastrar ni de una animación.

Responsabilidad funcional: TORO Core compone la experiencia; Data proyecta; Governance autoriza; Projects vincula objetivos y trabajo; Agents aporta ejecución; Systems aporta salud; Knowledge aporta respaldo. Cerebro está terminado para una versión cuando un usuario puede recorrer contexto, asunto, evidencia y siguiente acción permitida, con aislamiento probado y recuperación del foco. Su éxito se mide por tiempo y errores al decidir o localizar evidencia, no por cantidad de luces.

### Módulo 1 Hoy y Atención

Hoy reúne lo que necesita actuar ahora: decisiones, aprobaciones, vencimientos, riesgos, fallos relevantes y bloqueos que no se resolvieron dentro del ámbito autorizado. El dueño ve una síntesis del portafolio y puede abrir la causa de cada excepción. El empleado ve sus asuntos y las prioridades de su trabajo.

Una tarjeta explica el problema, impacto, plazo, recomendación, opciones y decisión requerida. Los correos, mensajes y avisos se transforman en señales trazables; solo las excepciones útiles llegan a Atención. Los resultados rutinarios quedan en el resumen y la evidencia. La información repetida se reúne sobre el mismo objeto.

El usuario puede resolver una decisión, pedir un dato, delegar dentro del alcance permitido o posponer con motivo. Cada respuesta queda ligada a la versión del objeto. Una aprobación de un caso no se convierte en permiso general para todos los casos futuros.

Hoy se integra con Dinero para pagos y caja, Operaciones para incidentes, Clientes para servicio, Proyectos para dependencias y Sistemas para fallos. Ejemplo final: un comprobante de pago llega al canal autorizado, TORO lo vincula con la obligación y muestra a la persona indicada únicamente la conciliación que sigue pendiente.

El módulo está terminado para una versión cuando las excepciones relevantes llegan al rol correcto, se resuelven sobre el registro original y el usuario puede comprobar la resolución. Se mide atención pendiente, tiempo de resolución e intervenciones del dueño evitadas, con una línea base.

### Módulo 2 Dinero

Dinero reúne caja, obligaciones, cobros, pagos, gastos y proyección de liquidez por negocio y moneda. PayFlow permite entender los próximos noventa días con fechas, supuestos y escenarios claros. Las cuentas bancarias respaldan el efectivo observado; Alegra conserva la autoridad contable y fiscal que le corresponde.

La pantalla muestra vencimientos, flujo proyectado, saldos con fecha, comprobantes y conciliaciones pendientes. Un mismo movimiento no se cuenta dos veces por aparecer en un correo, un banco y un sistema contable. Las cuentas con información personal y empresarial mezclada mantienen la clasificación y las restricciones aplicables.

TORO prepara propuestas de pago, detecta inconsistencias y explica diferencias. Mover dinero, cambiar beneficiarios o realizar trámites fiscales conserva los permisos y aprobaciones del flujo vigente. La autorización para revisar caja no autoriza un pago.

Dinero recibe señales de Clientes, proveedores, correo y operación; entrega excepciones a Hoy y restricciones de caja a Proyectos. Ejemplo final: antes de una compra, el dueño ve su efecto en caja, las obligaciones que compiten por esa fecha y la evidencia del precio solicitado.

La entrega se acredita con conciliación rastreable, ausencia de duplicados, segregación de permisos y recuperación ante fallos. Se miden obligaciones vencidas, tiempo de conciliación, exactitud de proyección y costo o recuperación comprobados. Los beneficios se atribuyen con evidencia.

### Módulo 3 Studio

Studio permite pedir, producir, revisar y administrar contenido visual y escrito con un propósito de negocio. Reúne imágenes, video, diseño, textos y biblioteca de medios. La marca, el público, canal, formato, referencias, derechos, aprobador y objetivo se resuelven antes de producir.

El usuario ve el brief, originales, versiones, comparaciones, revisiones, aprobaciones y destino. Los archivos conservan su procedencia y relación con sus derivados. Los espacios reales mantienen identidad y fidelidad; una ilustración conceptual se identifica como tal. No se inventan amenidades, precios o disponibilidad para hacer una pieza más atractiva.

Studio prepara una publicación y muestra qué versión fue aprobada para qué canal. Publicar o contratar medios sigue la autorización de ese canal. Puede reutilizar formatos y reglas revisadas sin transferir datos privados de otro negocio.

Se integra con Crecimiento para objetivos y medición, Activos para originales y derechos, Clientes para preguntas útiles y Sistemas para las herramientas. Ejemplo final: una solicitud de campaña utiliza fotos verificadas, genera versiones pertinentes, pasa revisión y conserva el enlace del resultado publicado cuando la publicación está autorizada.

Se considera entregado el flujo cuando el usuario puede recorrer solicitud, pieza, revisión, aprobación, destino y resultado sin perder la versión. Se mide tiempo de producción y retrabajo; el rendimiento comercial se evalúa con el método de atribución correspondiente.

### Módulo 4 Clientes

Clientes conserva el contexto autorizado de prospectos, huéspedes o clientes y acompaña su recorrido antes, durante y después del servicio. Incluye necesidades, conversaciones permitidas, solicitudes, compromisos y seguimiento. La terminología y las etapas se adaptan al negocio.

La vista presenta quién necesita atención, el estado de su solicitud y los compromisos vigentes. En Dreamcatcher, Kross mantiene la autoridad de reservas, tarifas y disponibilidad. Si no existe lectura viva comprobada, TORO lo informa y ofrece el enlace o relevo oficial; no convierte una página pública o una captura en disponibilidad actual.

El usuario puede preparar una respuesta, atender una consulta y transferir un incidente al área responsable. La transferencia mantiene cliente, objeto, plazo y evidencia necesarios sin copiar información fuera de su alcance. El seguimiento evita solicitudes duplicadas y respeta consentimiento y permisos del canal.

Clientes se integra con Operaciones para servicio, Personas para responsables, Dinero para pagos y Crecimiento para seguimiento autorizado. Ejemplo final: un huésped informa una avería, TORO registra la solicitud una vez, la asigna al flujo operativo y permite a recepción revisar el cierre antes de responder.

El flujo está entregado cuando el relevo no pierde contexto, el sistema original se respeta y el cliente recibe seguimiento por la ruta permitida. Se mide respuesta, resolución, pérdida de relevos y conversión comprobada; una conversación o clic no equivale a venta.

### Módulo 5 Operaciones

Operaciones organiza servicio, tareas, incidentes, mantenimiento, listas de comprobación y procedimientos del negocio. Muestra trabajo asignado, prioridad, plazo, dependencia, lugar y evidencia necesaria para cerrar. Las variantes hoteleras pertenecen al paquete de hospitalidad.

Un trabajador captura una solicitud por texto, voz o foto y la ve en su lista autorizada. El responsable recibe instrucciones concretas y puede registrar avance, impedimento o evidencia. TORO detecta relevos sin respuesta y escalaciones según la política vigente.

La terminación requiere evidencia proporcional: una reparación puede necesitar foto, comprobación y validación; marcar una casilla no acredita que el equipo funcione. Un cierre técnico del job tampoco cambia por sí solo la prioridad, el responsable o el estado de la tarea de negocio.

Operaciones se integra con Clientes para servicio, Personas para turnos y responsables, Activos para equipos y espacios, Dinero para costos y Hoy para excepciones. Ejemplo final: un incidente relacionado con una habitación muestra la ubicación y el equipo, asigna el trabajo, conserva sus restricciones y devuelve el cierre al mismo caso.

La entrega exige un caso usado por el equipo con recuperación ante duplicados o desconexión. Se miden tiempo de resolución, reincidencia, cumplimiento del servicio y retrabajo, sin premiar cierres sin evidencia.

### Módulo 6 Personas

Personas integra DreamTeam dentro de TORO People. Reúne equipo, funciones, turnos, solicitudes, disponibilidad, asistencia y procedimientos laborales autorizados. Cada empleado dispone de Mi TORO para su información y acciones permitidas.

La pantalla permite conocer a quién recurrir y abrir el contacto autorizado. Los botones de comunicación muestran canal e intención; abrir WhatsApp o un borrador no significa que se haya enviado un mensaje. Los datos personales, laborales y visibles al equipo tienen clasificaciones separadas.

El usuario puede presentar una solicitud de horario, registrar información que le corresponde y revisar su estado. Los cambios efectivos de turnos o condiciones siguen su aprobación. Reconocimiento y puntos usan reglas transparentes, evidencia y revisión; no sustituyen obligaciones laborales ni exponen evaluaciones privadas.

Personas se integra con Operaciones para responsabilidades, Clientes para continuidad de servicio, Legal y Riesgo para obligaciones y Sistemas para acceso y baja. El aprendizaje y la formación utilizan procedimientos revisados; haber completado un curso no concede nuevos permisos.

El flujo está entregado cuando el empleado entra con su identidad, ve únicamente lo permitido y puede completar una solicitud con aprobación y resultado rastreables. Se mide tiempo de resolución, calidad de relevos y correcciones necesarias, manteniendo privacidad.

### Módulo 7 Crecimiento

Crecimiento reúne adquisición, reputación, campañas, oportunidades, canales y medición. Coordina el website, buscadores, perfiles, directorios y seguimiento para que el negocio sea más fácil de encontrar, entender y contratar.

La pantalla muestra oportunidades con fundamento, trabajo de canal, campañas y resultados medibles. Distingue tráfico, consulta, reserva, venta y recuperación. Los objetivos se conectan con la capacidad operativa y no prometen servicios o disponibilidad que las fuentes no respaldan.

TORO prepara mejoras, respuestas y campañas dentro de los permisos existentes. Las publicaciones, contactos externos y gastos publicitarios se autorizan por su flujo. La calidad de servicio precede a una solicitud de reseña cuando existe una incidencia abierta.

Crecimiento se integra con Studio para piezas, Clientes para seguimiento permitido, Dinero para presupuesto y retorno, Proyectos para website y Activos para evidencia comercial. Ejemplo final: una mejora de la página de una villa conserva identidad y datos reales, se revisa visualmente, se despliega por la ruta vigente y mide su efecto con los límites de atribución visibles.

Se considera entregado cuando existe un ciclo de oportunidad, cambio, revisión, publicación autorizada y medición. El website de Dreamcatcher y la presentación comercial de TORO tienen públicos y releases definidos; comparten capacidades sin volverse un mismo producto público.

### Módulo 8 Legal y Riesgo

Legal y Riesgo reúne obligaciones, contratos, vencimientos, seguros, permisos y riesgos relevantes por entidad y ámbito. Los documentos, autoridades oficiales y responsables humanos respaldan cada hecho material.

La vista explica qué vence, a quién corresponde, qué evidencia existe y qué sigue pendiente de confirmación. Los vínculos entre activos, financiamiento, entidades y compromisos se presentan con su procedencia. Una interpretación del sistema se distingue de un documento o resolución oficial.

TORO organiza, detecta faltantes y prepara expedientes o consultas. Firmar, aceptar contratos, presentar trámites o asumir un compromiso conserva las autorizaciones aplicables. Las alertas no inventan una conclusión jurídica ni sustituyen la revisión profesional requerida por el caso.

El módulo se integra con Dinero para obligaciones, Personas para aspectos laborales, Activos para titularidad y seguros, Proyectos para dependencias y Hoy para plazos. Ejemplo final: una renovación muestra documento vigente, fecha, responsable, requisitos y acción concreta, sin perder la entidad legal correcta.

La entrega exige trazabilidad, privacidad, vencimientos correctos y resolución con evidencia. Se miden obligaciones sin responsable, atrasos y tiempo de preparar expedientes. El riesgo residual permanece visible cuando no está resuelto.

### Módulo 9 Activos y Espacios

Activos y Espacios permite entender inmuebles, habitaciones, instalaciones, equipos, inventario y archivos asociados. Relaciona ubicación, identidad, condición, responsable, mantenimiento y documentos, sin confundir un activo con un negocio.

El usuario abre un espacio y encuentra sus objetos, incidencias, fotografías verificadas y acciones autorizadas. El mapa espacial puede mostrar ubicaciones o distribución cuando existe información suficiente y la capacidad está implementada; su diseño actual no acredita un mapa operativo entregado.

Los activos físicos conservan registro de estado y mantenimiento. Los activos digitales conservan originales, derechos, versiones y canales permitidos. Un mapa o fotografía conceptual se diferencia de la distribución y evidencia real.

Se integra con Operaciones para trabajos, Studio para medios, Legal y Riesgo para documentos, Dinero para costos y Proyectos para obras o mejoras. Ejemplo final: tocar un equipo revela el incidente activo, su historial y la evidencia de la última reparación; el usuario puede entrar al mismo trabajo operativo.

El módulo está entregado cuando los activos del alcance acordado son localizables y sus vínculos resuelven al registro correcto. Se mide cobertura verificada, tiempo de localizar información, mantenimiento atrasado y reincidencia.

### Módulo 10 Proyectos

Proyectos muestra objetivos, programas, hitos, dependencias y trabajo existente. Ordena las iniciativas del portafolio bajo las identidades canónicas, con responsables, prioridades y resultados esperados. Las conversaciones y entregables se vinculan al proyecto que corresponde.

La vista permite ver qué está activo, qué se detuvo y por qué, qué bloquea el siguiente resultado y qué recursos compiten por caja o tiempo. Los avances distinguen preparación, implementación, despliegue, verificación, uso y beneficio. El número de commits no reemplaza el progreso del negocio.

TORO prepara la siguiente unidad elegible y coordina especialistas por capacidad. Una idea nueva se incorpora al Plan General y al proyecto existente antes de abrir un frente. Los proyectos duplicados o históricos se conservan con su disposición documentada.

Se integra con todos los módulos según el resultado, con Dinero para restricciones, Sistemas para releases y Hoy para decisiones. Ejemplo final: el dueño abre la construcción de TORO, ve sus módulos y dependencias, revisa los links de entregables comprobados y responde una sola decisión concreta cuando es necesaria.

La entrega exige que el siguiente paso, dependencia y resultado sean claros, y que una pausa o relevo no pierda contexto. Se mide trabajo terminado útil, bloqueos resueltos y tiempo desde intención hasta uso.

### Módulo 11 Sistemas

Sistemas muestra las herramientas y conectores de los que depende el negocio: propósito, propietario, alcance, autoridad, salud, permisos, costo, última comprobación y recuperación. La vista técnica pertenece a administradores; el resto ve únicamente los estados y acciones que necesita.

Una herramienta registrada, una conexión configurada, una lectura autorizada comprobada y una escritura aprobada comprobada tienen estados distintos. TORO detecta desactualización, fallos y diferencias entre configuración esperada y observada. Los botones abren destinos registrados y verificados con icono y etiqueta.

El administrador puede revisar una propuesta de configuración, renovar el acceso por la ruta permitida, pausar trabajos y comprobar recuperación. Las credenciales se administran mediante mecanismos protegidos; no aparecen en las fichas, mensajes o prompts.

Sistemas se integra con Proyectos para cambios, Dinero para consumo, Hoy para excepciones y todos los módulos para dependencias. Ejemplo final: si un conector falla, TORO limita el dato afectado, muestra la causa comprobada, propone recuperación y retoma desde el checkpoint una vez autorizado.

El módulo está entregado cuando la salud declarada coincide con evidencia, el fallo no genera datos falsos y una prueba de recuperación funciona. Se mide disponibilidad de capacidades, tiempo de recuperación, costo por resultado y fallos repetidos.

### Conversación y herramientas compartidas

Texto, voz, adjuntos, WhatsApp, Portal y correo se conectan al mismo contexto, permisos y trabajo. La conversación puede responder, preparar una acción, registrar un incidente, solicitar una decisión o dar seguimiento. No se vuelve por sí sola memoria permanente.

OpenClaw y WeSpeak son runtimes o canales dentro de esta arquitectura. La experiencia final de WhatsApp tiene la misma cobertura de capacidades autorizadas que el Portal para la identidad y ámbito activos. Los nombres Whisper, Tether u otros mencionados informalmente se resuelven contra el inventario antes de asignarles funciones; no se presume que sean un sistema instalado.

El acceso a toda la información significa acceso completo a lo que el usuario y el flujo tienen autorizado. La paridad se cumple mediante ejecución compatible o un relevo seguro al Portal. Cada canal conserva sus requisitos de identidad, autenticación y capacidades; no hereda automáticamente los permisos de otro. El cambio entre canales no permite saltarse privacidad, aprobaciones o aislamiento. El enlace para contactar a DreamTeam prepara o abre la conversación por el canal apropiado y conserva la autorización de envío.

TORO Knowledge y TORO Research aportan contexto, fuentes, procedimientos y aprendizaje revisado a los once módulos. TORO Tools y TORO Channels conectan acciones y destinos; TORO Governance e Identity aplican los límites. Estas capacidades compartidas evitan crear otra bandeja, memoria o motor por canal.

### Avance autónomo y control del dueño

TORO encadena unidades de trabajo elegibles dentro de una sesión de ejecución y continúa desde checkpoints entre sesiones cuando existe un worker persistente autorizado. No depende de que Mauricio escriba continuar ni de dejar ChatGPT abierto. Esa continuidad es una capacidad final que necesita implementación y prueba; programar un aviso recurrente no la acredita.

El coordinador elige trabajo de la cola existente según impacto, prioridad, dependencia, riesgo, permiso, presupuesto y capacidad. Tras verificar un resultado, toma el siguiente elegible dentro de los límites vigentes. Los agentes reciben encargos acotados por capacidad, con resultado esperado y consumo máximo; los nombres de especialistas no crean autoridades independientes.

La velocidad se mide como tiempo ocioso con trabajo autorizado elegible y capacidad disponible. Las esperas por aprobación, presupuesto, cooldown, fallo de conexión o ausencia de trabajo se explican por separado. No se requiere trabajo constante si no existe trabajo útil permitido.

El dueño ve resultado, costo, evidencia y próximos pasos. Puede pausar por ámbito y reanudar un trabajo pausado desde su checkpoint. Un job cancelado queda terminal; retomar su objetivo requiere una nueva acción autorizada, enlazada al original y con conciliación de efectos previos. Una acción externa ya iniciada entra en conciliación cuando no se puede cancelar; no se informa falsamente que fue deshecha. Pausar una automatización no cancela automáticamente reservas, pagos o compromisos.

La ejecución conserva los topes, periodos y capacidades definidos en los contratos vigentes. Sin presupuesto vigente y límites configurados no se inicia ejecución incremental. Se controlan costo y duración por job, topes diarios y mensuales, concurrencia, reintentos y corte ante fallos repetidos. La espera y las consultas sin cambios utilizan mecanismos de bajo costo y no consumen modelo innecesariamente. Los eventos, workers y subagentes comparten límites. Crear más agentes no aumenta el presupuesto ni evade el cooldown. Los permisos se verifican de nuevo antes de un efecto material; repetir un evento no debe repetir el efecto.

### Revisión y mejora continua

El trabajo pasa por verificación proporcional antes de declararse terminado. Los cambios materiales se revisan con evidencia independiente cuando corresponde. TORO no se otorga permisos, no redefine su evaluador y no amplía su presupuesto para aprobar su propio cambio.

Una corrección se registra con contexto y procedencia. El sistema busca causa, propone una solución reutilizable, prueba, aplica dentro de la política autorizada y mide recurrencia. Si empeora el resultado, revierte. El aprendizaje conserva la privacidad del negocio de origen.

Los avances se revisan por utilidad: servicio, caja, conversión, tiempo humano, errores, recuperación y costo por resultado. La plataforma presenta una línea base y observaciones posteriores antes de afirmar que generó un beneficio. La supervisión automática se apoya en contratos y controles, no solo en un prompt más largo.

### Integración de las herramientas existentes

GitHub conserva constitución, código y contratos versionados. Supabase conserva identidades, permisos, datos operativos propios y auditoría. Dropbox conserva originales, archivos y evidencia. Notion presenta narrativa, investigación y memoria de trabajo. Airtable sigue como proyección humana transitoria donde aporta valor. Las referencias y proyecciones apuntan al Plan General único.

Kross conserva la autoridad viva de reservas, tarifas y disponibilidad; Alegra la contable y fiscal; los bancos la evidencia del efectivo; los canales y autoridades oficiales mantienen sus dominios. TORO conecta y explica esas fuentes con procedencia y límites.

Los enlaces útiles y recomendados forman un catálogo por ámbito y función, con icono, etiqueta, destino, responsable, permisos y fecha de comprobación. Una recomendación se identifica como tal y no implica una herramienta ya contratada o conectada. Un link rotulado debe resolver al destino que anuncia.

Dropbox Dash facilita el descubrimiento dentro de las fuentes autorizadas cuando está disponible; sus resultados se resuelven al original antes de convertirse en evidencia. No sustituye los archivos originales ni crea otra autoridad.

### Aplicación a otros negocios

TORO separa núcleo universal, paquete de industria, configuración del negocio y adaptadores de herramientas. Identidad, permisos, evidencia, tareas y gobierno son comunes. La terminología, procedimientos, campos específicos y conexiones se configuran según el negocio.

El producto terminado incorpora un negocio mediante descubrimiento guiado: personas y roles, objetivos, estructura, fuentes, herramientas, permisos, procedimientos, métricas y riesgos. Presenta lo detectado, los conflictos y lo que requiere confirmación antes de operar. La importación no copia todo indiscriminadamente ni presume que el acceso a un sistema permita todas sus acciones.

Una capacidad probada en Dreamcatcher puede abstraerse y validarse en otro ámbito sin trasladar huéspedes, finanzas, secretos o estrategia privada. El segundo negocio se valida en sandbox con escenarios de lectura, acción, aislamiento, recuperación y baja. El onboarding externo real conserva el readiness gate vigente.

La modularidad permite contratar o habilitar capacidades disponibles sin eliminar el núcleo obligatorio. El soporte, la salida del servicio, la exportación autorizada, las dependencias y la recuperación forman parte del producto. El negocio puede comprender qué queda conectado, qué está funcionando y qué todavía espera implementación.

### Cuarenta criterios de producto terminado

Esta serie nueva P01 a P40 concreta esta definición TARGET. Son criterios de aceptación, no cuarenta funciones implementadas ni una renumeración de M01 a M20 del contrato Agent Steward. La ejecución se vincula a los proyectos y trabajos existentes después de resolver duplicados.

| ID | Resultado observable | Comprobación de aceptación |
|---|---|---|
| P01 | Una sola base de dirección | Cada requisito material resuelve a una sección del Plan General y a su capacidad existente. |
| P02 | Una entrada sencilla | En móvil dirige al Portal oficial, separa demo y operación y no transfiere credenciales ni datos privados por URL. |
| P03 | Identidad individual | Cambio de usuario y revocación impiden conservar el acceso anterior. |
| P04 | Alcance visible | Pantalla y acción identifican negocio y contexto; otra organización no accede al objeto. |
| P05 | Cerebro como inicio por rol | Toda identidad autenticada entra a un Cerebro filtrado; el foco inicial y la siguiente acción autorizada se adaptan al perfil. Hoy queda a un toque. |
| P06 | Brain protagonista y accesible | El usuario explora mapa o lista equivalente y alcanza una decisión sin perder el contexto global. |
| P07 | Red localizable completa | Inventario y búsqueda cubren lo autorizado con denominadores y fuentes inspectables. |
| P08 | Zoom con orientación | Expansión, filtros y retorno conservan selección y relaciones del ámbito. |
| P09 | Conexiones explicables | Cada línea indica tipo y procedencia; pertenencia no se presenta como integración. |
| P10 | Actividad comprobable | Cada pulso abre un evento vigente permitido y desaparece con expiración o revocación. |
| P11 | Celular operativo | En 320 píxeles se puede buscar, consultar y actuar sin cortes esenciales, en ES y EN con formatos del usuario. |
| P12 | Alternativa accesible | Lista y timeline conservan estados y acciones; teclado y movimiento reducido funcionan. |
| P13 | Fichas con evidencia | Objetos materiales muestran fuente, fecha, estado, responsable y próximo paso. |
| P14 | Enlaces útiles | Botones con etiqueta e icono abren destinos registrados; no hay links presentados como verificados sin prueba. |
| P15 | Atención sin duplicados | Señales sobre el mismo caso producen una excepción canónica y no varias tareas. |
| P16 | Decisión concreta | Una respuesta queda vinculada al objeto y versión y no concede autoridad general. |
| P17 | Dinero conciliable | Caja, moneda, obligación y comprobante son rastreables y no duplican un movimiento. |
| P18 | Studio con versiones | Original, derivado, revisión, derechos, canal y aprobación resuelven al archivo correcto. |
| P19 | Clientes con continuidad | Un caso conserva contexto y relevo; no inventa tarifas o disponibilidad sin fuente viva. |
| P20 | Operación con cierre útil | Un flujo real incluye asignación, evidencia, verificación y respuesta al registro original. |
| P21 | Personas con privacidad | Empleado y responsable completan el flujo sin acceso a datos ajenos no autorizados. |
| P22 | Crecimiento medible | Cambio y resultado tienen método de atribución; clics no se presentan como ventas. |
| P23 | Riesgos respaldados | Vencimiento, entidad, responsable y documento resuelven a fuente y fecha correctas. |
| P24 | Activos localizables | Espacio, equipo, archivos e incidentes se vinculan por identidad verificable. |
| P25 | Proyectos sin otro backlog | Cada avance y dependencia corresponden al proyecto y tarea canónicos existentes. |
| P26 | Sistemas con estados honestos | Registro, configuración, lectura, escritura, falla y desactualización se distinguen. |
| P27 | Portal y WhatsApp equivalentes | La misma identidad y contexto conservan fuentes y límites; acciones compatibles o relevo seguro respetan autenticación por canal. |
| P28 | Contactos con intención | Abrir conversación o borrador se diferencia de envío; el envío conserva su permiso. |
| P29 | Trabajo encadenado | Con trabajo, capacidad y presupuesto disponibles reclama la siguiente unidad sin esperar el reloj; latencia y ocio elegible cumplen un SLO aprobado. |
| P30 | Continuación persistente | Reinicio o cierre de la superficie conserva checkpoints sin perder trabajo ni repetir efectos. |
| P31 | Consumo limitado | Sin presupuesto y topes no inicia; costo, duración, reintentos y subagentes comparten límites y corte ante fallos. |
| P32 | Concurrencia segura | Dos ejecutores no duplican efectos; resultado externo incierto se concilia antes de reintentar y revocación bloquea efectos nuevos. |
| P33 | Pausa y cancelación | Pausado reanuda con checkpoint; cancelado queda terminal y un nuevo intento autorizado concilia efectos previos. |
| P34 | Revisión independiente | Un cambio material acredita evaluación aplicable y el ejecutor no modifica su propio evaluador. |
| P35 | Recuperación comprobada | Timeout, duplicado, falla de conector y restauración se ensayan sin duplicar acciones. |
| P36 | Reporte de resultados | Cada avance material tiene prueba y enlace; distingue preparado, verificado, usado y medido. |
| P37 | TORO se opera con TORO | TORO Business usa los mismos controles y registra sus resultados sin privilegio transversal. |
| P38 | Aprendizaje reversible | Corrección, prueba, decisión, medición y reversión quedan trazados sin copiar datos privados. |
| P39 | Portabilidad por configuración | Un segundo ámbito en sandbox reutiliza capacidades, demuestra aislamiento y rechaza referencias cruzadas entre tenants. |
| P40 | Salida y versión completas | Una versión acredita su alcance contratado, soporte, recuperación, exportación y baja autorizados. |

### Un día con TORO

Al comenzar el día, Mauricio abre TORO desde el celular y ve el portafolio, las decisiones urgentes y los resultados nuevos. Toca Dreamcatcher y revisa una excepción de caja con su comprobante. Responde la decisión concreta; TORO registra la respuesta y continúa el trabajo que ya está permitido.

Recepción informa un problema de servicio. El mismo caso aparece en Clientes y Operaciones; mantenimiento recibe la acción y registra evidencia en el espacio correcto. Recepción confirma el cierre por el flujo autorizado. El Brain muestra ese recorrido y el dueño puede comprobarlo sin leer toda la conversación.

Crecimiento pide una pieza. Studio utiliza originales autorizados, prepara versiones y presenta una revisión. La publicación ocurre solo por su autorización de canal. Si un conector falla, Sistemas señala la limitación y el dato afectado deja de presentarse como actual.

TORO Business revisa el costo y los resultados de esos flujos. Un patrón de relevo repetido genera una propuesta de mejora. Se prueba, se evalúa y se mantiene o revierte. Al terminar el día, el dueño recibe lo que cambió, el beneficio comprobado y las decisiones que siguen pendientes.

### Realidad actual y camino de construcción

El Plan General, la Constitución, los once módulos y los contratos de Visual Brain ya están definidos. Existen implementación canónica, demostración sintética y trabajos preparados de Dashboard y lectura real. Esto no acredita once módulos completos ni operación privada end to end.

La lectura canónica del Brain conserva el gate de QA autenticada. El estado final de WhatsApp y OpenClaw requiere pruebas directas de runtime y de equivalencia autorizada. La continuidad persistente requiere un worker comprobado. El mapa espacial está diseñado, no entregado globalmente. Kross Live pagado permanece diferido por decisión del dueño; esta definición no reactiva esa contratación. El onboarding externo conserva los gates vigentes.

Las automatizaciones pueden cambiar durante otras sesiones. Su habilitación y última fecha de ejecución no acreditan éxito. Los estados actuales se consultan en sus fuentes con fecha y evidencia; esta definición de producto no congela un snapshot operativo.

El orden de construcción permanece desde el núcleo: identidad y alcance, verdad, gobierno y autoridad de fuentes, conectores, inteligencia, ejecución con recuperación, aprendizaje, experiencia y prueba de portafolio. Los controles necesarios están comprobados antes del primer efecto material. Diseñar desde el producto final permite saber qué debe alcanzar cada paso; no obliga a publicar primero una apariencia sin los controles que la sostienen.

El siguiente trabajo es cerrar esta definición y representar pocas escenas de experiencia: vista del dueño, interacción con un nodo y flujo móvil de atención. Después, cada módulo se desarrolla por su capacidad y dependencia existentes, con unidades completas, revisión e integración. Se prioriza un flujo útil probado antes de multiplicar pantallas.

Una versión está terminada cuando el alcance comprometido es utilizado por sus usuarios, las fuentes y permisos están comprobados, las acciones tienen evidencia, la recuperación funciona y existen métricas de utilidad. No exige integrar todas las herramientas posibles para poder cerrar una versión.

### Vinculación con el Plan General

| Parte de la definición | Sección existente del Plan General |
|---|---|
| Producto y experiencia final | 1 Final direction y 18 Program north star |
| Once módulos y composición Brain con Atención | 2 Product hierarchy y TORO Dashboard |
| Portafolio y autouso | 3 Scope architecture y 4 Target model y Alignment update |
| Identidades y vistas | 5 User model y Portal role model |
| Conversación y paridad autorizada | 6 Communication architecture y 9 OpenClaw |
| Herramientas y autoridad | 7 Tool architecture y 12 Data platform ownership |
| Avance y mejora | 14 Proactive improvement y 21 Executive brain mindset |
| Estado y construcción | 15 Current Target Next Future y 16 Roadmap y 17 Queue |
| Brain y entrada móvil | 22 Visual Brain and product experience |
| Portabilidad y adopción | 16A Product Proof y Alignment update de 29 septiembre |
| Definición detallada y P01 a P40 | 23 Finished product definition integrada en este Plan General |

### Fuentes y puertas de entrada

Plan General canónico: https://github.com/Dramcatcherst/Toro-OS/blob/main/docs/product/TORO_BRAIN_GENERAL_PLAN.md

Constitución: https://github.com/Dramcatcherst/Toro-OS/blob/main/docs/product/TORO_BRAIN_CONSTITUTION.md

Arquitectura maestra: https://github.com/Dramcatcherst/Toro-OS/blob/main/docs/product/TORO_BRAIN_MASTER_ARCHITECTURE.md

Dashboard de once módulos: https://github.com/Dramcatcherst/Toro-OS/blob/main/docs/product/TORO_DASHBOARD_V1.md

Visual Brain: https://github.com/Dramcatcherst/Toro-OS/blob/main/docs/product/TORO_VISUAL_BRAIN_ARCHITECTURE_V1.md

Agent Steward y estrategia visual M01 a M20: https://github.com/Dramcatcherst/Toro-OS/blob/main/docs/product/TORO_AGENT_STEWARD_AND_VISUAL_STRATEGY_V1.md

Readiness: https://github.com/Dramcatcherst/Toro-OS/blob/main/docs/product/NEW_BUSINESS_READINESS_GATE.md

Notion del programa: https://app.notion.com/p/3dff5169a39a81b8bf89d06a75a91462?pvs=204

Notion de Dashboard: https://app.notion.com/p/3e6f5169a39a810f810adefdcd4851e7?pvs=204

Referencias estructuradas leídas: `toro_dashboard_surface_v1`, `toro_brain_taxonomy_v1` y `toro_product_capability_registry_v1`, en el runtime Supabase canónico. La lectura íntegra del Plan General conserva todo su contenido previo e incorpora esta definición con los estados separados.



---

### Ampliación del producto final: Cerebro, 25 frentes y 100 mejoras — 2026-10-10

**Autoridad:** solicitud del propietario y continuación del 10 de octubre de 2026. **Clasificación:** TARGET de producto y NEXT de diseño/documentación; cada capacidad conserva su gate real. Las cien mejoras de este paquete son refinamientos de especificación y aceptación incorporados al Plan General. No son cien funciones instaladas ni cien trabajos terminados. Se mantienen P01–P40, VF y los criterios previos: este paquete M001–M100 desarrolla sus huecos concretos, sin sustituirlos ni sumarlos como beneficio.

#### Resultado final que guía la construcción

TORO se abre en Cerebro. El usuario entiende qué negocios controla, qué sucede, qué necesita atención y qué cambió. La interfaz combina una red global orientada, una acción siguiente clara y evidencia que se puede abrir. La experiencia del dueño muestra Dreamcatcher, Santa Toro, Vista Alegre, Cabuya y TORO Business cuando su identidad y fuentes los autorizan. La madre del propietario y Carolina reciben sus alcances individuales; ningún vínculo familiar sustituye ese contrato.

En escritorio, el mapa es protagonista de la zona central, con un launcher compacto de Cerebro y once dominios, búsqueda/comando y un inspector lateral. La primera lectura de un nodo responde qué sucede, cómo afecta al objetivo y qué se puede hacer. El detalle técnico se despliega solo cuando ayuda. Al abrir un proyecto o evidencia se conserva el contexto del portafolio; el usuario vuelve al mismo objeto sin reconstruir su recorrido.

En celular, Cerebro adapta agrupación y detalle, mantiene alcance y siguiente acción a mano y permite completar el mismo trabajo mediante lista. La navegación funciona con una mano, controles de al menos 44 píxeles y texto financiero legible. Zoom, búsqueda, lista/mapa, tema y ES/EN que ya existen se conservan: no se vuelven a contar como entregas nuevas. La sesión expirada, la fuente antigua, un dato desconocido, un permiso insuficiente y un fallo de transporte tienen mensajes diferentes.

La dirección visual usa profundidad sobria, tipografía clara, contraste, capas y movimiento con significado. Los nodos pueden crecer o iluminarse durante eventos vigentes; el indicador de salud es diferente al indicador de trabajo. La reproducción histórica lleva fecha visible. No se publican luces aleatorias como prueba de ejecución, ni una forma atractiva como prueba de conexión. La marca utiliza los masters oficiales; una imagen conceptual no reemplaza el logo aprobado. Herramientas de 3D, video o animación solo se incorporan si mejoran una interacción concreta dentro del presupuesto existente; una librería nueva no es requisito de esta definición.

TORO Business tiene su nodo de producto, proyectos, calidad, soporte y costo. El recorrido de mejora muestra problema, propuesta, prueba, release, resultado y conservar/revertir. Se relaciona con el Brain como negocio usuario, sin privilegio para aprobar su propio acceso a otros ámbitos. «Cahuya» en una transcripción se conserva como antecedente: el nombre documentado del Plan es Cabuya hasta resolver una identidad diferente con evidencia.

#### Límites y prioridades de ejecución

1. Prioridad operativa: comprobar y reparar el camino real de WhatsApp/OpenClaw hacia el mismo TORO. Acceso amplio del dueño significa acceso a todo su ámbito autorizado mediante capacidades y consultas pertinentes; no descargar todas las bases en un prompt ni entregar credenciales al navegador. Codex implementa y verifica cambios; no sustituye al backend persistente ni a la autoridad de cada fuente.
2. Prioridad de producto: definir y representar Cerebro, producto final, estados y módulos. La red global es localizable por completo dentro de la cobertura autorizada, con agregación y paginación; no obliga a dibujar cada fila simultáneamente.
3. Prioridad comercial: revisar el release actual del rediseño Dreamcatcher y continuar el carril existente. No reconstruir la home a partir de un pendiente histórico ya entregado.

Los 25 frentes son resultados distintos dentro de los carriles existentes, no 25 proyectos, Dots, bases, chats o automatizaciones. Antes de cada ejecución se resuelve su task/proyecto canónico y su capacidad. Si falta mapping, se registra el hueco sin crear otra cola. Los propietarios siguientes son funciones del sistema; no asignaciones laborales ni aceptación inferida de una persona.

Cinco tandas ordenan dependencias. Trabajo independiente puede avanzar mientras otro frente espera: F11 documental y lectura de F18 no requieren que el host de F01 ya esté disponible. Un worker no permanece ocupado con un bloqueo. Una ejecución termina, registra verificación y receipt, y permite reclamar la siguiente unidad elegible dentro de capacidad y presupuesto. No se promete trabajo continuo por dejar un navegador abierto.

Cada run conserva task, scope, autorización, versión, presupuesto, checkpoint, lease/fencing, resultado, prueba y receipt. Las tandas no reactivan CONTROL, OPERATE, GROW ni escritores financieros pausados; no habilitan API Kross, onboarding externo ni mantenimiento físico automatizado. Publicación, efectos externos, datos, permisos y producción mantienen el gate concreto de su carril. La autonomía ya concedida se conserva, sin pedir de nuevo decisiones resueltas.

#### Tanda 1 — Diagnóstico, identidad y camino real de ejecución

##### F01 — Diagnóstico privado del host OpenClaw

**Carril existente:** auditoría runtime OpenClaw. **Propietario funcional:** TORO Systems + Comms. **Fuentes:** host observado, contrato GitHub y configuración Supabase. **Prioridad:** P0. **Dependencia:** acceso al host autorizado. **Terminado:** perfil/worktree consumido observado y causa reproducida o bloqueo exacto fechado. Reutilizar el diagnóstico saneado existente.

| Mejora | Refinamiento y prueba requerida |
| --- | --- |
| M001 | Identificar host, perfil y worktree realmente consumidos; evidencia saneada del proceso observado, no una ruta supuesta. |
| M002 | Contrastar versión consumida con el contrato esperado; el reporte distingue coincidencia, drift y versión desconocida. |
| M003 | Diferenciar probe vivo de configuración guardada; ninguna etiqueta connected/verified sustituye la ejecución observada. |
| M004 | Vincular el fallo a una referencia de diagnóstico saneada; otro revisor puede seguir causa y fecha sin recibir secretos. |

##### F02 — Identidad comprobada por transporte

**Carril existente:** Identity + Comms. **Propietario:** TORO Identity + Governance. **Fuente:** identidad/membership canónicas y host. **Prioridad:** P0. **Dependencia:** F01. **Terminado:** identidad real validada y casos negativos de baja y cambio de ámbito comprobados; no enlazar por nombre ni conceder permisos nuevos.

| Mejora | Refinamiento y prueba requerida |
| --- | --- |
| M005 | Corroborar cuenta y remitente con la identidad canónica; el mismo nombre visible no permite impersonación. |
| M006 | Validar membership vigente al resolver la solicitud; una sesión antigua no amplía el acceso actual. |
| M007 | Probar identidad revocada sin revelar existencia de datos; el rechazo no muestra conteos, nombres ni enlaces privados. |
| M008 | Comprobar separación personal/hotel durante cambio de contexto; no sobreviven objetos ni acciones del ámbito anterior. |

##### F03 — Reparación dirigida de Capability unavailable

**Carril:** WhatsApp Same-Brain. **Propietario:** TORO Tools + Systems. **Fuentes:** host, adapter/contrato GitHub y registro de capacidades. **Prioridad:** P0. **Dependencias:** F01–F02. **Terminado:** un fallo reproducido se resuelve o conserva bloqueo causal comprobado. Reutilizar clasificador existente.

| Mejora | Refinamiento y prueba requerida |
| --- | --- |
| M009 | Capturar la capability exacta solicitada; la incidencia no se reduce a «WhatsApp no sirve». |
| M010 | Distinguir ausente, denegada, degradada y obsoleta; cada causa produce estado y relevo apropiados. |
| M011 | Detectar desajuste entre adapter, worktree y contrato consumido; se prueba la versión que atiende, no solo el archivo editado. |
| M012 | Ofrecer siguiente paso específico para la causa; no pedir credenciales cuando el problema es una capacidad no instalada. |

##### F04 — Paridad real de lectura Portal/WhatsApp

**Carril:** Same-Brain/source capability parity. **Propietario:** TORO Data + Comms. **Fuentes:** Supabase, fuente de dominio y host. **Prioridad:** P0. **Dependencias:** F02–F03. **Terminado:** paridad acotada observada para la misma identidad, ámbito y dato, con huecos explícitos. API Kross permanece pausada.

| Mejora | Refinamiento y prueba requerida |
| --- | --- |
| M013 | Matriz por capability ya concedida para Portal y WhatsApp; cobertura autorizada no se infiere del número de conectores. |
| M014 | Cotejar un dato permitido con su fuente; la respuesta conserva dato, autoridad, fecha y limitación de cobertura. |
| M015 | Comparar la misma identidad y scope entre superficies; no se usa una cuenta administradora para certificar al empleado. |
| M016 | Abstenerse ante fuente caducada y permitir referencia histórica etiquetada; información vieja nunca aparece como dato de hoy. |

##### F05 — Primer worker observado desde la aplicación

**Carril:** canary/Control Plane. **Propietario:** TORO Core + Systems. **Fuentes:** GitHub, Vercel y Supabase. **Prioridad:** P0. **Dependencias:** identidad y release verificable. **Terminado:** canary de aplicación pasa en entorno autorizado; prueba backend o transacción revertida no acredita consumo de la aplicación.

| Mejora | Refinamiento y prueba requerida |
| --- | --- |
| M017 | Acreditar SHA y presencia de configuración del consumidor sin valores secretos; el artefacto coincide con lo probado. |
| M018 | Utilizar claim dirigido existente; el intento solo reclama el trabajo elegible autorizado. |
| M019 | Obtener readback y receipt del intento desde aplicación; un status succeeded aislado no demuestra el flujo completo. |
| M020 | Probar que un trabajo ajeno queda intacto; canary no drena la cola ni modifica otras entidades. |

#### Tanda 2 — Persistencia y comunicación útil

##### F06 — Lista persistente capturada en WhatsApp

**Carril:** Comms durable channel ledger/repair intake. **Propietario:** TORO Comms + Operations. **Fuentes:** Supabase y host. **Prioridad:** P0/P1. **Dependencias:** F02/F03/F05 para el flujo elegido; F04 solo si ese caso necesita lectura de dominio. **Terminado:** lista inocua recuperable después de compaction y reinicio, sin duplicados. No activar trabajo físico de mantenimiento.

| Mejora | Refinamiento y prueba requerida |
| --- | --- |
| M021 | Vincular captura al objeto canónico existente; Portal y WhatsApp abren la misma lista. |
| M022 | Consultar después de compaction; el contexto durable no depende del texto disponible en el chat. |
| M023 | Recuperar después de reinicio; el objeto conserva autoría, alcance, edición y estado. |
| M024 | Preservar edición concurrente mediante versión/origen; replay no pisa una corrección humana posterior. |

##### F07 — Entrega comprobada al dueño

**Carril:** alertas existentes de Recepción/Owner Attention. **Propietario:** TORO Comms. **Fuentes:** Page/caso, Supabase y host/proveedor. **Prioridad:** P0/P1. **Dependencias:** F01–F02. **Terminado:** prueba no sensible y alerta autorizada con receipt; sin otro scheduler ni destinatario supuesto.

| Mejora | Refinamiento y prueba requerida |
| --- | --- |
| M025 | Enlazar Page y caso con su alerta existente; una actualización de formato no crea otra notificación. |
| M026 | Acreditar referencia del mensaje del proveedor; preparar texto no cuenta como enviarlo. |
| M027 | Diferenciar programado, enviado, entregado y ambiguo; solo se muestra el nivel respaldado por evidencia. |
| M028 | Conciliar resultado ambiguo antes de reintentar; timeout no autoriza un segundo envío ciego. |

##### F08 — Audio e imagen con procedencia

**Carril:** Comms + Assets/Knowledge. **Propietario:** TORO Assets + Knowledge + Comms. **Fuentes:** original Dropbox y objeto Supabase. **Prioridad:** P1. **Dependencias:** F02/F06 y capability media real. **Terminado:** un original autorizado, extracción y correcciones quedan relacionados.

| Mejora | Refinamiento y prueba requerida |
| --- | --- |
| M029 | Conservar original y hash; el derivado puede rastrearse sin alterar el archivo recibido. |
| M030 | Mostrar extracción pendiente o fallida; una foto recibida no se presenta como documento entendido. |
| M031 | Admitir corrección vinculada al original; la transcripción anterior conserva su procedencia y versión. |
| M032 | Impedir que extracción fallida cierre tareas o contabilice hechos; fallos y dudas requieren evidencia nueva. |

##### F09 — Recuperación de conversación y efectos

**Carril:** replay/health/Control Plane. **Propietario:** TORO Systems + Core + Comms. **Fuentes:** Supabase y host. **Prioridad:** P1. **Dependencias:** F05–F07. **Terminado:** interrupción/replay controlados conservan un objeto y una sola consecuencia. Reutilizar lease/fencing existentes.

| Mejora | Refinamiento y prueba requerida |
| --- | --- |
| M033 | Ensayar transporte interrumpido; usuario ve pendiente/fallo en lugar de una confirmación ficticia. |
| M034 | Ensayar evento duplicado simultáneo; el segundo intento no produce otro objeto ni efecto. |
| M035 | Ensayar lease perdido; un ejecutor vencido no puede aplicar una escritura tardía. |
| M036 | Recuperar objeto y correlación; el relevo continúa desde el checkpoint probado y concilia efectos inciertos. |

##### F10 — DreamTeam como contactos útiles

**Carril:** People + Comms. **Propietario:** TORO People + Comms. **Fuente:** identidad/contacto autorizado Supabase. **Prioridad:** P1. **Dependencias:** F02 y mapping People/destino. **Terminado:** un botón abre un contacto verificado y su baja impide acceso futuro; no inferir teléfonos de empleados.

| Mejora | Refinamiento y prueba requerida |
| --- | --- |
| M037 | Relacionar botón con identidad aprobada; no se usa una cadena de nombre como registro de empleado. |
| M038 | Limitar destino al contacto permitido del scope; no se exponen contactos privados de otro ámbito. |
| M039 | Distinguir abrir WhatsApp de enviar mediante TORO; el usuario sabe quién ejecutará el mensaje. |
| M040 | Retirar acceso tras baja sin borrar historial autorizado; el botón y la acción fallan con el mismo permiso revocado. |

#### Tanda 3 — Cerebro visible y verificable

##### F11 — Cerebro como módulo transversal

**Carril:** Visual Brain/Dashboard/User Portal. **Propietario:** TORO Core + User Portal. **Fuentes:** contratos GitHub y proyección Supabase. **Prioridad:** P1. **Dependencia:** ninguno para definición; runtime conserva su gate. **Terminado:** acceso propio Cerebro junto a los once dominios, sin nuevo backend.

| Mejora | Refinamiento y prueba requerida |
| --- | --- |
| M041 | Exponer Cerebro como módulo 0 en la navegación conceptual; conservar nombres, orden e IDs de los once dominios. |
| M042 | Distinguir Cerebro del negocio TORO Business; no reasignar el id legado brain de toro-data.ts. |
| M043 | Volver desde un módulo al mismo contexto del grafo; selección y orientación no se pierden. |
| M044 | Mostrar alcance definido, preparado, publicado, verificado y medido; una maqueta no se presenta como operación privada. |

##### F12 — Red completa con zoom semántico

**Carril:** scope graph/canonical projection. **Propietario:** TORO Data + Governance. **Fuentes:** relaciones canónicas y contrato GitHub. **Prioridad:** P1. **Dependencias:** F11 y relaciones disponibles. **Terminado:** panorama completo de cobertura autorizada y detalle paginado bajo presupuesto; no descargar toda la base.

| Mejora | Refinamiento y prueba requerida |
| --- | --- |
| M045 | Mostrar panorama agregado del portafolio autorizado; no revelar nombres ni conteos de ámbitos prohibidos. |
| M046 | Utilizar relaciones reales y tipadas; una estrella visual por conveniencia no acredita dependencia o propiedad. |
| M047 | Expandir detalle paginado conservando la vista global; el recorrido no fragmenta el mapa en pantallas inconexas. |
| M048 | Indicar cobertura parcial con denominador/fuente/fecha cuando existan; desconocido no equivale a cero. |

##### F13 — TORO se mejora utilizando TORO

**Carril:** TORO Business/self-use/Projects. **Propietario:** TORO Projects + Core. **Fuentes:** GitHub, Supabase y release Vercel. **Prioridad:** P1. **Dependencias:** F05/F11–F12. **Terminado:** ciclo real de mejora navegable con receipt, sin crear un proyecto raíz.

| Mejora | Refinamiento y prueba requerida |
| --- | --- |
| M049 | Mostrar TORO Business separado del Core; negocio usuario e inteligencia del producto tienen roles comprensibles. |
| M050 | Enlazar trabajos existentes de producto; crear una visualización no genera tareas duplicadas. |
| M051 | Enlazar release y medición de una mejora; commit, deploy, uso y beneficio permanecen distintos. |
| M052 | Mostrar resultado que retroalimenta producto sin autoautorizarse; el evaluador material conserva independencia. |

##### F14 — Neuronas activadas por trabajo real

**Carril:** Event Spine/Agents/Control Plane. **Propietario:** TORO Data + Agents + Core. **Fuente:** runs/receipts canónicos. **Prioridad:** P1. **Dependencias:** F05/F11. **Terminado:** un run muestra actividad y fin comprobables, con alternativa sin movimiento.

| Mejora | Refinamiento y prueba requerida |
| --- | --- |
| M053 | Proyectar eventos de runs existentes; la mera existencia de una sesión de lectura o conexión no acredita trabajo activo. Una consulta ejecutada y respaldada por evento/receipt sí puede generar actividad legítima. |
| M054 | Mantener pulso solo durante evento autorizado vigente; movimiento reducido preserva texto y estado. |
| M055 | Apagar o corregir al expirar lease, fallar o revocarse permiso; una neurona no queda «trabajando» indefinidamente. |
| M056 | Reproducir secuencia por correlación con resumen seguro y fecha; historial nunca se confunde con actividad presente. |

##### F15 — Evidencia y estado confiables

**Carril:** Brain semantics/source governance. **Propietario:** TORO Data + Governance + Knowledge. **Fuentes:** Supabase, sistema de dominio y original documental. **Prioridad:** P1. **Dependencias:** F11/F14 y permisos de evidencia. **Terminado:** estados soportan datos incompletos, antiguos o contradictorios.

| Mejora | Refinamiento y prueba requerida |
| --- | --- |
| M057 | No convertir ausencia de needsRevalidation en prueba de verificación; afirmación verified exige evidencia de ese objeto. |
| M058 | Separar fecha del dato de fecha de consulta; refrescar pantalla no rejuvenece la fuente. |
| M059 | Abrir evidencia autorizada del mismo objeto; referencias ausentes o denegadas no producen botones ficticios. |
| M060 | Mostrar contradicción y faltante sin verde automático; el usuario conoce autoridad y corrección necesaria. |

#### Tanda 4 — Portal móvil y rediseño web

##### F16 — Sesión móvil para operar

**Carril:** Portal/Human Experience. **Propietario:** TORO User Portal + Identity. **Fuentes:** Supabase, código y runtime Vercel. **Prioridad:** P1. **Dependencias:** F02/F11 y release Portal. **Terminado:** ida/vuelta y expiración en móvil conservan el objeto permitido; se preserva lo ya implementado.

| Mejora | Refinamiento y prueba requerida |
| --- | --- |
| M061 | Conservar contexto al regresar del proveedor; la sesión no cambia silenciosamente de negocio. |
| M062 | Volver al objeto desde una notificación; el enlace respeta la identidad actual y su autorización. |
| M063 | Distinguir sesión vencida de falta de datos; renovar acceso no se presenta como recuperación de información perdida. |
| M064 | Mostrar snapshot/offline sin ejecutar sobre estado viejo; la reconexión confirma versión antes de efectos. |

##### F17 — Entrada común dreamcatcherhotel.com/toro

**Carril:** Channels/routing/login. **Propietario:** TORO Channels + Governance + Identity. **Fuentes:** repositorio, dominio/release y sesión. **Prioridad:** P1. **Dependencias:** F11/F16 y destino canónico verificado. **Terminado:** ruta común abre el destino correcto bajo autorización de release; sin contraseña compartida.

| Mejora | Refinamiento y prueba requerida |
| --- | --- |
| M065 | Definir un destino canónico registrado para el enlace; no promocionar una URL antigua solo porque contiene TORO. |
| M066 | Mantener zona pública segura y operación privada autenticada; la entrada común no hace públicos los datos. |
| M067 | Recuperar deep link permitido después de login; destino de retorno no permite redirección externa arbitraria. |
| M068 | Probar usuario no autorizado; no aparecen datos, conteos ni destinos privados antes o después del login. |

##### F18 — Estado real del rediseño Dreamcatcher

**Carril:** Fase 2/DC2-022/B0–B6. **Propietario:** TORO Channels + Systems. **Fuentes:** repositorio y artefacto publicado. **Prioridad:** P1. **Dependencia:** inspección del release vigente. **Terminado:** dossier de publicación y siguiente delta único; no reconstruir la home desde un plan antiguo.

| Mejora | Refinamiento y prueba requerida |
| --- | --- |
| M069 | Conciliar trabajo reciente con SHA publicado; el preview no se confunde con producción. |
| M070 | Retirar del siguiente paso los parches entregados con prueba; conservar su historia y no repetírselos al dueño. |
| M071 | Revisar regresión por delta del release; una corrección acotada no obliga a repetir toda la auditoría sin motivo. |
| M072 | Mostrar evidencia de preview y producción por separado en TORO; cada enlace conserva artefacto y corte. |

##### F19 — Continuidad comercial demostrada

**Carril:** booking stack/B1/B3. **Propietario:** TORO Revenue + Channels. **Fuentes:** motor/PMS permitido, código y release. **Prioridad:** P1. **Dependencias:** F18 y fuente comercial vigente. **Terminado:** handoff actual probado y conflictos resueltos o bloqueados; sin API Kross nueva.

| Mejora | Refinamiento y prueba requerida |
| --- | --- |
| M073 | Probar fecha/ocupación desde un enlace móvil real; no afirmar prefill porque el link contiene parámetros. |
| M074 | Contrastar ficha y motor sin calcular tarifa local; reservas, precios y disponibilidad conservan su autoridad. |
| M075 | Señalar diferencias de política que impiden publicar; una tarifa anterior no se convierte en regla vigente. |
| M076 | Conservar vía convencional si falla Flow; el huésped puede continuar por el camino comercial oficial. |

##### F20 — Calidad después de publicación

**Carril:** B5/medición web. **Propietario:** TORO Channels + Growth + Systems. **Fuentes:** artefacto y medición vigentes. **Prioridad:** P1. **Dependencias:** F18/F19. **Terminado:** evidencia comparable del release actual y ausencia de P0; no atribuir ventas a clics.

| Mejora | Refinamiento y prueba requerida |
| --- | --- |
| M077 | Tomar baseline del artefacto publicado; comparación utiliza mismo alcance/dispositivo y un corte trazable. |
| M078 | Comparar comportamiento con consentimiento activo; no ampliar tracking ni recolectar datos por este paquete. |
| M079 | Revisar interacción móvil representativa, incluido Safari cuando esté disponible; plataforma no probada se declara pendiente. |
| M080 | Diferenciar CWV de campo, laboratorio e intención comercial; no fabricar lift ni mezclar denominadores. |

#### Tanda 5 — Más avance con menos coordinación

##### F21 — Cobertura de cada módulo

**Carril:** producto final/capability registry. **Propietario:** TORO Core + Projects + Tools. **Fuentes:** código, contratos y catálogo canónicos. **Prioridad:** P1/P2. **Dependencias:** F11–F20 según capability. **Terminado:** matriz de Cerebro y once dominios con evidencia y próximos deltas, sin más módulos por contar funciones.

| Mejora | Refinamiento y prueba requerida |
| --- | --- |
| M081 | Cotejar cada módulo con código vigente; el nombre de una pantalla no acredita su flujo completo. |
| M082 | Separar preparado, live y verificado por capability; una verificación no cubre automáticamente todo el módulo. |
| M083 | Colocar huecos en la task y propietario existentes; no crear otro backlog con la misma incidencia. |
| M084 | Detectar dependencia transversal que desbloquea módulos; se prioriza resultado útil por esfuerzo y riesgo. |

##### F22 — Tandas con relevo real

**Carril:** PUMBA/Control Plane/Projects. **Propietario:** TORO Core + Agents + Projects. **Fuente:** task/run/receipt canónicos. **Prioridad:** P1/P2. **Dependencias:** F05/F09. **Terminado:** dos tandas completadas con receipts y sin colisión; no nuevo scheduler ni executores suspendidos.

| Mejora | Refinamiento y prueba requerida |
| --- | --- |
| M085 | Vincular ejecución con frente y task existentes; el frente es etiqueta de resultado, no autoridad nueva. |
| M086 | Continuar a siguiente unidad elegible después del receipt; no esperar un reloj si capacidad y presupuesto están disponibles. |
| M087 | Liberar worker cuando hay bloqueo pendiente; registrar disparador y continuar trabajo independiente. |
| M088 | Detectar inanición de carril elegible por prioridad permanente; aplicar la política vigente sin inventar urgencias. |

##### F23 — Consumo por resultado

**Carril:** worker budget/scorecard. **Propietario:** TORO Agents + Systems + Finance. **Fuentes:** ejecución y consumo observado del proveedor. **Prioridad:** P1/P2. **Dependencias:** F05/F22. **Terminado:** costo y denominadores reales, o NO MEDIDO; sin gasto nuevo automático ni presupuesto inferido.

| Mejora | Refinamiento y prueba requerida |
| --- | --- |
| M089 | Registrar costo observado por resultado; suscripción, costo marginal y ahorro permanecen separados. |
| M090 | Reutilizar checkpoint verificado antes de una auditoría total; solo evidencia nueva o gate cambiado justifica repetir. |
| M091 | Detener bucle sin cambio material; los reintentos comparten límites y no generan reportes de avance ficticio. |
| M092 | Medir espera elegible y costo de reintento antes de aumentar capacidad; número de agentes no sustituye productividad. |

##### F24 — Sesión de decisiones del dueño

**Carril:** Owner Attention/reportes existentes. **Propietario:** TORO Core + Comms + Projects. **Fuentes:** decisiones, Pages y receipts autorizados. **Prioridad:** P1. **Dependencias:** F07/F21–F23 para delivery completo; preparación documental puede avanzar antes. **Terminado:** paquete accionable y resumen entregado o fallo explícito.

| Mejora | Refinamiento y prueba requerida |
| --- | --- |
| M093 | Agrupar solo decisiones que el dueño puede resolver; no transferirle rutina del equipo ni acceso no necesario. |
| M094 | Vincular respuesta con objeto, versión y evidencia; un sí contextual no es aprobación global de efectos nuevos. |
| M095 | Reutilizar respuestas vigentes; no pedir de nuevo autorización resuelta por fragmentación entre chats. |
| M096 | Resumir resultados, bloqueos y enlaces con delivery separado de programación; hasta tres asuntos, 120 palabras y aviso PRUEBA vigente. |

##### F25 — Aprendizaje y retiro sin pérdida

**Carril:** Knowledge/Governance/Systems. **Propietario:** TORO Knowledge + Governance + Systems. **Fuentes:** contrato/código, evidencia y contexto autorizado. **Prioridad:** P2. **Dependencias:** F21–F24 según objeto. **Terminado:** mejora evaluada y candidato de archivo documentado; no afirmar chats archivados sin capability y prueba.

| Mejora | Refinamiento y prueba requerida |
| --- | --- |
| M097 | Convertir error repetido en regla o prueba concreta; indicar fuente, versión y criterio de conservar/revertir. |
| M098 | Abstraer patrón sin datos privados; otro negocio recibe método y configuración, no memoria ajena. |
| M099 | Revisar regresión después de aplicar mejora; el ejecutor no modifica su propio evaluador para aprobarse. |
| M100 | Inventariar chats y artefactos redundantes antes de archivar; referencia recuperable y contexto útil conservados, sin eliminación automática. |

#### Compatibilidad, verificación y siguiente superprompt

La declaración de Cerebro no migra los IDs del catálogo legado `src/lib/toro-data.ts`: su `brain` denominado TORO Business contiene fixtures operacionales y no es el nodo de autouso definido aquí. No reasignarlo ni modificar menús/permisos por una clasificación conceptual. `/brain` conserva su provider único, y Stage C–G conserva QA, aislamiento y release gates.

La revisión inicial de este paquete es acotada a contratos y huecos de TORO; el release del hotel, sesión privada multinegocio, transporte WhatsApp, consumo del host y beneficio económico requieren evidencia de sus frentes. La presencia de una herramienta instalada no prueba adopción ni un costo autorizado. El archivo de chats queda BLOQUEADO si no existe inventario/capability; no eliminar conversaciones por similitud de títulos.

Aceptación documental: módulo 0 y once dominios coherentes en contratos, F01–F25 distintos, M001–M100 únicos y consecutivos, dependencias/propietarios/fuentes/terminado explícitos, decisiones pausadas conservadas y ningún secreto en la proyección pública. Aceptación de runtime: prueba propia de cada frente y receipt del flujo real. Publicar documentos no acredita cien capacidades ni veinticinco ejecutores activos.

**Próximo superprompt:** «Retoma el Plan General único de TORO y la ampliación del 10/10/2026. Lee el estado y receipts actuales antes de actuar. Primero resuelve el acceso al host F01 y la causa exacta F03; si siguen bloqueados, avanza F11 y la revisión del release F18 dentro de sus carriles existentes. Reutiliza IDs y checkpoints. Entrega una unidad completa con fuente, prueba, enlace, siguiente paso y límite real. Mantén API Kross, escritores y lanes suspendidas; no conviertas diseño en operación ni reabras decisiones resueltas. Solo escala una intervención del dueño cuando desbloquee trabajo material. Después del receipt continúa con la siguiente unidad elegible dentro del presupuesto y capacidad comprobados.»


## Human Layer / TERE / DreamTeam R4 — owner directive 2026-09-30

**State:** CURRENT canonical refinement.  
**Subordinate contract:** `docs/product/TORO_HUMAN_LAYER_TERE_DREAMTEAM_R4.md`

Mauricio directed TORO to recover and preserve the durable personality, communication, TERE, hotel-voice and DreamTeam rules from historical/current sources; simplify and merge them before implementation; and apply approximately 50 material improvements without creating another brain, project, task system, employee authority or prompt universe.

### Canonical decisions

- TORO remains the single visible orchestrator/Brain.
- TERE remains the Dreamcatcher guest-facing specialist/persona. WeSpeak/OpenClaw/WhatsApp/Portal are runtimes/surfaces, not separate brains.
- Personality is durable behavior, never volatile business truth.
- TERE keeps the current practical-first principle: **80% useful reality / 15% Dreamcatcher identity / 5% surprise**.
- R4 adds governed social chemistry: serious → warm → playful → complicit, based on reciprocal rapport. Complaints, safety, money-sensitive topics, policy disputes and discomfort force serious mode.
- The new active Supabase configuration key is `tere-social-chemistry-playfulness-r4-20260930`. Configuration existence does **not** prove WeSpeak/OpenClaw consumption; runtime version/hash + QA remains required.
- Airtable Central now carries the R4 owner decision and learned social-chemistry rule. Superseded dream-heavy packs remain historical and must not be reactivated.
- DreamTeam functionality is defined as **verified identity + correct role/capabilities + authorized channel + onboarding + runtime acceptance**, not merely “employee record exists”.
- Current People runtime observation on 2026-09-30: 12 active employees + 1 terminated; all 12 active have AI profiles/Role Packs; 4 have linked application users; 0/12 have verified employee channel identities; onboarding progress remains unstarted. Do not bind the remaining people by name inference.
- Current kitchen operator Mary/Maribel remains an **external collaborator/operator**, not a payroll employee; minimal scoped access is separately approval-gated.
- Kross retains live transactional authority; stale/non-live mirrors cannot answer current occupancy, availability or rates.
- Alegra retains fiscal/accounting authority; TORO may analyze/reconcile/prepare, but material accounting writes remain governed.
- Dropbox remains the original-evidence/backup home where governed, but a fresh Dropbox audit was **BLOCKED** in this pass by the current connector search/schema conflict; do not describe it as re-audited.

### R4 improvement package

The subordinate contract applies **50 net-new improvements** on top of the existing I01–I20 agent/skill controls, grouped into:
1. canonical memory/governance and simplification;
2. personality/playfulness/social chemistry;
3. guest communication and Dreamcatcher voice;
4. DreamTeam functionality/onboarding/permissions;
5. Kross/Alegra/evidence/QA/observability.

The detailed R4-01…R4-50 definitions, activation gates and rollback live only in the subordinate contract above to avoid duplicating the same specification in multiple places.

### Acceptance gate

R4 is not runtime-complete until:
- each active guest-facing runtime proves the personality/config version/hash it consumed;
- TERE passes serious-mode, rapport, privacy, joke-fatigue and cross-channel scenarios;
- DreamTeam identities are individually verified and role-isolated;
- employee channel revocation/offboarding works;
- Kross/Alegra authority remains intact;
- corrections persist across sessions/channels without copied parallel prompts.



---

## Dreamcatcher — Unit Economics, Room Cost & Break-even

**Owner directive:** 2026-09-30  
**Owner:** TORO Finance + TORO Revenue + Dreamcatcher Operations  
**State:** PLAN GENERAL — required financial model; current example values are illustrative until reconciled against authoritative 2026 data.

### Objective

Build and maintain one canonical profitability model that answers, by room, rate, channel, occupancy scenario and package:

- What does one occupied room-night actually cost?
- What is the marginal cost of accepting one additional booking?
- What is the fully loaded cost after fixed-cost allocation?
- At what gross guest price does each room break even?
- What is the absolute operational floor, the sustainable floor and the target selling price?
- At what price does a sale destroy cash contribution or economic profit?
- How do breakfast, OTA commission, payment fees, discounts, promotions, extra guests, children, pets, cleaning, laundry and taxes change the answer?
- What hotel occupancy / ADR / RevPAR combination covers company fixed costs?
- What are the break-even points for the hotel overall, each villa/business unit and material ancillary services?

### Canonical cost layers

TORO must separate these layers instead of mixing them:

1. **Taxes / pass-through amounts**
   - IVA and other applicable taxes.
   - These are not hotel operating revenue when collected on behalf of the tax authority.

2. **Marginal room-night cost**
   - incremental housekeeping labor;
   - laundry by textile load;
   - guest amenities and consumables;
   - incremental electricity, A/C and hot water;
   - incremental water;
   - incremental maintenance/wear reserve;
   - incremental guest servicing attributable to the stay.

3. **Channel / transaction cost**
   - OTA commission;
   - merchant/acquirer/card fee;
   - payment gateway fee;
   - promotion/discount;
   - affiliate/agency commission where applicable.

4. **Package / guest cost**
   - breakfast when included;
   - extra guest / child cost;
   - pet-related incremental cost;
   - included experiences/transport/other packaged value.

5. **Allocated fixed operating cost**
   - reception/administration;
   - fixed payroll;
   - maintenance base payroll;
   - accounting;
   - software/PMS;
   - internet/communications;
   - insurance;
   - security;
   - pool/jacuzzi/common-area baseline;
   - licenses/patents;
   - property-level fixed utilities;
   - marketing baseline;
   - depreciation/replacement reserve where useful for management economics.

6. **Capital / owner economics**
   - major replacements;
   - long-term depreciation;
   - financing/interest where relevant;
   - target return hurdle.
   - Keep this layer separate from cash operating break-even so management can see both.

### Required price floors per room

For every sellable room / configured combination, calculate:

- **Cash floor:** guest price at which net revenue covers taxes/pass-throughs, channel cost and truly incremental stay cost.
- **Contribution floor:** minimum price that still provides a defined positive contribution after marginal + channel/package costs.
- **Operating break-even price:** price covering marginal costs plus the room's allocated share of fixed operating costs.
- **Sustainable floor:** operating break-even plus maintenance/replacement reserve.
- **Target price:** price required to achieve the target contribution/profit margin.
- **Loss zone:** any rate below the cash floor.
- **Economic-loss zone:** rate above cash floor but below the applicable sustainable/full-cost floor.

Never collapse these floors into one number; they answer different decisions.

### Scenario matrix

The model must support at minimum:

**Channel**
- Direct SINPE/transfer
- Direct card
- Booking.com
- Expedia / other OTA
- Travel agency / wholesaler
- Promotional/direct code

**Occupancy / guests**
- 1 guest
- 2 guests
- extra guests to room capacity
- child where applicable
- pet where applicable

**Meal treatment**
- room only
- breakfast included
- breakfast sold as extra
- breakfast included but not consumed
- breakfast comp / house
- breakfast package with different supplier cost

**Rate scenarios**
- $40, $50, $60, $75, $90, $100, $125, $150, $200+ as relevant
- percentage discount scenarios
- national/TICOS promotions
- long-stay/promotional packages
- same-day / distress inventory decisions

**Stay length**
- 1 night
- 2 nights
- 3–4 nights
- 5–7 nights
- long stay

Cleaning and acquisition costs that occur once per stay must be amortized across nights rather than blindly repeated per room-night.

### Breakfast economics

Breakfast must be modeled independently and then attached to the room package.

For each breakfast type/source, calculate:
- selling price;
- tax treatment;
- supplier/food cost;
- labor if attributable;
- payment/channel cost if sold separately;
- waste/no-show treatment;
- gross contribution per breakfast;
- cost to hotel when breakfast is included in rate;
- incremental break-even increase in room price when breakfast is bundled.

Operational categories remain:
- **included / prepaid**
- **extra / paid**
- **house**
- **included not consumed**

Included but not consumed breakfast must not be treated as consumed supplier cost unless the supplier agreement actually charges it.

### Company / property break-even

TORO Finance must also calculate monthly and daily hotel-level break-even:

```text
Contribution per occupied room-night
= Net room revenue
- marginal room cost
- channel/payment cost
- package cost

Required occupied room-nights
= Monthly fixed operating costs
/ weighted-average contribution per occupied room-night

Break-even occupancy %
= Required occupied room-nights
/ Available room-nights

Break-even revenue
= Fixed costs
/ weighted contribution-margin ratio
```

Run this for:
- Dreamcatcher total;
- Dreamcatcher Villa / rooms #0–#6 where useful;
- Makaiza #7–#11;
- Toro Villa / rooms #21–#28;
- individual rooms when cost structure materially differs;
- business total consolidated.

Do not assume every room should receive the same fixed-cost allocation. Maintain at least:
- simple equal-room allocation for quick management view; and
- weighted allocation by capacity / size / historical revenue / materially distinct resource use, with method labeled.

### Data authority and reconciliation

Target source authority:

- **Kross / PMS:** sold rate, stay dates, room, guests, channel, discounts, reservation status.
- **Alegra:** actual accounting expenses, vendors, taxes, recurring operating costs.
- **Breakfast operational records / POS:** included, extras, house, no-consumption and supplier payable.
- **Utilities / invoices:** electricity, water, internet and other services.
- **Payroll / TORO People:** labor cost and allocation assumptions.
- **Dropbox / invoices / supporting documents:** cost evidence and contracts.
- **Supabase / TORO Finance:** normalized analytical model, assumptions, versions, calculated outputs and provenance.

Every estimate must be labeled as estimate until reconciled with actual source data.

### Required outputs

TORO Revenue / Finance should expose:

1. **Room Cost Card** for every room:
   - marginal cost;
   - fixed allocation;
   - breakfast/package adjustment;
   - cash floor;
   - operating break-even;
   - sustainable floor;
   - target price;
   - direct vs OTA comparison.

2. **Rate Decision Table**
   - requested selling rate;
   - net revenue;
   - contribution dollars;
   - contribution margin %;
   - fully loaded profit/loss;
   - status: profitable / contribution-only / cash-loss.

3. **Hotel Break-even Dashboard**
   - fixed costs/month;
   - variable cost/occupied room-night;
   - ADR;
   - occupancy;
   - RevPAR;
   - contribution margin;
   - occupied nights required to break even;
   - break-even occupancy;
   - projected profit/loss at current pace.

4. **Promotion simulator**
   - old rate;
   - discounted rate;
   - channel;
   - room;
   - guests;
   - breakfast;
   - nights;
   - resulting contribution and profit;
   - maximum discount before each floor is crossed.

5. **Exception alerts**
   - rate below cash floor;
   - OTA promotion makes booking cash-negative;
   - breakfast/package pushes rate below contribution floor;
   - room/channel combination below sustainable floor;
   - material cost drift versus prior month.

### Initial illustrative example — NOT source-of-truth

For a room sold at **$100 gross**, 2 guests, 1 night, no breakfast:
- gross guest payment: $100;
- illustrative IVA included: $11.50;
- illustrative net room revenue: $88.50;
- illustrative marginal/variable room cost: $26;
- illustrative contribution before channel: $62.50;
- illustrative direct-card contribution at 3.5% transaction cost: $59;
- illustrative OTA 15% contribution: $47.50;
- illustrative fixed-cost allocation example: $20;
- illustrative operating result: about $39 direct card / $27.50 at 15% OTA.

These values are a teaching baseline only. TORO must replace them with reconciled Dreamcatcher values before using them as pricing rules.

### Acceptance criteria

This work is **DONE** only when:

- all sellable rooms and canonical room combinations are represented;
- actual 2026 cost sources are reconciled and dated;
- breakfast economics is reconciled to supplier/POS/payment treatment;
- direct, card, OTA and agency scenarios calculate correctly;
- fixed and variable costs are explicitly separated;
- one-night vs multi-night cleaning amortization works;
- room-level cash floor, operating break-even, sustainable floor and target rate are available;
- hotel-level break-even occupancy and revenue are available monthly;
- outputs show source, freshness and whether a value is actual, inferred or estimated;
- at least three historical months are back-tested against realized accounting results;
- alerts do not recommend a rate below the applicable management floor without an explicit, documented exception.

### Verified accounting snapshot — Alegra, 2026-01-01 to 2026-09-30

Read-only source check on 2026-09-30, cost center `DREAMCATCHER` / id `1`:

- Sales / operating income: **CRC 265,585,084.46**
- Operating expenses: **CRC 199,724,118.69**
- Operating profit: **CRC 65,860,965.77**
- Other income: **CRC 468,688.11**
- Other expenses: **CRC 6,826.18**
- Profit before taxes: **CRC 66,322,827.69**
- Tax expense: **CRC 21,744,372.38**
- Net income: **CRC 44,578,455.31**
- OTA + travel-agency commissions: **CRC 23,430,005.60** (8.82% of revenue)
  - OTA commissions: CRC 22,343,745.60
  - Travel-agency commissions: CRC 1,086,260.00
- Personnel expense: **CRC 65,953,460.46** (24.83%)
- Maintenance expense: **CRC 17,550,267.03** (6.61%)
- Financial expense: **CRC 6,550,492.76** (2.47%)
- General expense: **CRC 71,602,373.82** (26.96%)
- Marketing / advertising: **CRC 6,232,615.12** (2.35%)
- Insurance / licenses: **CRC 2,048,563.01** (0.77%)
- Online services: **CRC 3,286,922.70** (1.24%)

**Data-quality caution:** Alegra currently reports zero Cost of Sales while room-level operating costs are posted largely through expense categories. Outgoing-payment review also shows transfers, shareholder/dividend-related categories, financing principal/interest and other categories that must not automatically be treated as hotel room operating cost. Therefore the accounting snapshot is useful evidence but **not yet a validated unit-cost model**.

### Provisional accounting break-even — diagnostic only

If commissions are treated as the only variable cost for a first diagnostic and all remaining operating expenses are treated as fixed/semi-fixed:

- 9-month non-commission operating expense: **CRC 176,294,113.09**
- average monthly fixed/semi-fixed proxy: **CRC 19,588,234.79**
- contribution ratio after recorded sales commissions: **91.18%**
- provisional monthly accounting break-even revenue: **~CRC 21,483,518**

This is intentionally labeled **PROVISIONAL / NOT FOR RATE FLOOR DECISIONS**. It will move after classifying utilities, housekeeping/laundry, breakfast, card fees, maintenance, owner/partner items, financing, taxes and stay-level costs correctly, then reconciling occupied room-nights and ADR from PMS/Kross.



### Expense evidence policy — canonical rule

**Owner directive — 2026-09-30:** every legitimate business expense reported to TORO with an invoice, electronic invoice, receipt, payment proof or equivalent support must enter the accounting workflow. **Alegra is the accounting system of record.** Dropbox is the durable documentary backup where needed, and Supabase/TORO Finance stores normalized metadata, provenance, reconciliation state and receipts.

Canonical subordinate contract:
- `docs/product/TORO_FINANCE_EXPENSE_EVIDENCE_POLICY_V1.md`

Rules:
- do not mark an expense DONE merely because the file exists in Dropbox;
- before any Alegra write, run duplicate checks on issuer, document number, date, amount, currency and existing references;
- if already represented in Alegra, reconcile/link evidence rather than duplicate the expense;
- attach evidence in Alegra when supported; otherwise preserve the original in Dropbox and retain a durable reference;
- owner-paid expenses require verified business purpose and correct reimbursement/shareholder-current-account treatment;
- internal transfers, loan principal, shareholder distributions and personal expenses are not room operating cost;
- every reconciled expense receives a separate management-cost behavior classification for the room-cost / break-even model.

### Room-cost source classification — verified Alegra categories, Jan–Sep 2026

Current cost-center readback identifies the following major categories relevant to the room economics model:

| Category | Jan–Sep 2026 | Management treatment now |
|---|---:|---|
| OTA + travel-agency commissions | CRC 23,430,005.60 | VARIABLE_PER_SALE — verified |
| Breakfast / lunch / dinner category | CRC 5,562,520.00 | VARIABLE/PACKAGE candidate — requires meal-level split |
| Cleaning products | CRC 4,543,979.40 | MIXED — room occupancy + common-area base |
| Electricity | CRC 10,864,460.00 | MIXED — fixed base + occupancy-driven component |
| Water | CRC 5,495,692.46 | MIXED — fixed base + occupancy-driven component |
| Gas | CRC 201,020.00 | MIXED — source/use split required |
| Housekeeping payroll | CRC 14,102,196.00 | STEP_FIXED / capacity-linked, not automatically per-room variable |
| Maintenance payroll | CRC 11,020,318.00 | FIXED/STEP_FIXED |
| Repairs | CRC 17,594,860.19 | MIXED; separate maintenance reserve vs vehicle/property/project work |
| Room replacement / dotation | CRC 2,311,436.59 | REPLACEMENT_RESERVE candidate |
| Internet | CRC 973,438.41 | primarily FIXED_OPERATING |
| Online software | CRC 3,286,922.70 | FIXED_OPERATING unless transaction-priced |
| Insurance / licenses | CRC 2,048,563.01 | FIXED_OPERATING / risk layer |
| Financial expense | CRC 6,550,492.76 | FINANCING; exclude from cash room-floor, show separately in full-owner economics |

**Important:** accounting category and management cost behavior are not the same thing. Electricity, water, cleaning, payroll and maintenance must be split analytically rather than assigned 100% to each occupied room-night.

### Break-even diagnostic range — accounting-only, still provisional

Using Jan–Sep 2026 Alegra data:

- **Case A — commissions are the only variable cost:** monthly break-even revenue ≈ **CRC 21.48M**.
- **Case B — commissions + all recorded meals + cleaning products + electricity + water + gas treated as variable:** monthly break-even revenue ≈ **CRC 20.49M**.
- **Case C — Case B + all housekeeping payroll treated as variable:** monthly break-even revenue ≈ **CRC 19.86M**.

These are **diagnostic bounds, not pricing floors**. Case B and Case C intentionally overstate variable treatment for utilities/payroll and therefore serve only as sensitivity checks. The final model must estimate fixed base vs incremental usage using occupancy / occupied-room-nights and monthly costs.

Current analytical implication: the hotel-level accounting break-even appears to be roughly in the **CRC 20M–21.5M monthly revenue zone before a proper occupancy-linked split**, but this range must not be used as a rate decision until Kross/PMS occupied-room-nights, actual card fees, breakfast consumption and non-operating/accounting anomalies are reconciled.




### Monthly behavior check — sales proxy

A month-by-month Jan–Sep 2026 readback was run against Alegra P&L for cost center `DREAMCATCHER`. Until Kross occupied-room-nights are reconciled, monthly sales are used only as a **provisional activity proxy**, not as occupancy.

Observed relationships:

- **Electricity:** weak relationship to sales (R² ≈ 0.10). Treat predominantly as base/mixed utility until occupancy-level evidence says otherwise.
- **Water:** very weak relationship to sales (R² ≈ 0.05). Do not allocate all water as per-room variable.
- **Internet:** essentially no positive relationship to sales (R² ≈ 0.02). Treat as FIXED_OPERATING.
- **Cleaning products:** moderate relationship to sales (R² ≈ 0.50). Split into base/common-area + occupancy-driven component.
- **Housekeeping payroll:** moderate relationship to sales (R² ≈ 0.54). Treat as STEP_FIXED / capacity-linked, not a simple per-room-night cost.
- **Maintenance payroll:** stronger relationship to sales (R² ≈ 0.71), likely reflecting staffing/seasonality; still classify as STEP_FIXED unless payroll structure proves per-room compensation.
- **Repairs:** noisy/moderate relationship (R² ≈ 0.35). Do not use as direct nightly variable cost; separate property repair, vehicles, projects and replacement reserve.
- **OTA commissions:** relationship to sales is material but not stable month-to-month because channel mix changes. Use reservation/channel data directly rather than a single blended percentage.

**Breakfast data-quality flag:** the Alegra category `Desayunos/Almuerzos/Cenas` totals CRC 5,562,520 for Jan–Sep, but postings appear concentrated in only Jan, Feb, Jun and Jul in the monthly P&L. Zero months must be treated as **missing/unclassified or genuinely zero only after source reconciliation**. Do not infer zero breakfast cost from the accounting category alone.

### Sales-source reconciliation flag

Two Alegra reporting surfaces disagree for Jan–Sep 2026:

- P&L, cost center DREAMCATCHER: **CRC 265,585,084.46** sales.
- P&L, unfiltered: **CRC 265,650,674.46** sales.
- General sales-documents report, before taxes: **CRC 273,350,269.55**.

The difference is material and cannot be explained solely by the Dreamcatcher cost-center filter. Until document-level reconciliation identifies timing/status/document-type/cost-center treatment, use the **P&L cost-center figure for the provisional Dreamcatcher accounting model** and label the general-sales figure as unreconciled. Do not claim revenue completeness from either surface alone.




### Breakfast economics — canonical master plan

**Owner directive — 2026-09-30:** breakfast must be analyzed from real reservations and actual operating/accounting evidence, not hypothetical menu economics alone.

Canonical subordinate contract:
- `docs/product/DREAMCATCHER_BREAKFAST_ECONOMICS_MASTER_PLAN_V1.md`

Current verified baseline:
- 33 mirrored reservations;
- 9 marked breakfast included;
- 4 marked breakfast not included;
- 20 breakfast status unknown;
- latest reservation snapshot 2026-09-21 09:28 UTC; source is stale/read-only;
- 17 reservations contain detailed meal-plan day records;
- 82 included breakfast units and 4 extra breakfast units are represented in that meal-plan detail;
- 0 rows currently prove served/consumed status;
- 0 rows currently prove extra-breakfast payment status;
- `operations.breakfast_orders` currently has 0 rows;
- Alegra Jan–Sep 2026 category `Desayunos/Almuerzos/Cenas` = CRC 5,562,520, but monthly posting coverage is incomplete/unreconciled.

Decision rule:
- do not infer profitability from breakfast inclusion alone;
- compare actual room-only vs breakfast-inclusive reservations by room, channel, rate plan, guest count and stay length;
- distinguish included, extra, house, included-not-consumed and unknown;
- calculate package uplift, marginal breakfast cost, channel fee on uplift and resulting reservation contribution;
- breakfast may be retained with low direct unit margin only when verified ADR/conversion/LOS/direct-share value offsets the subsidy.

Break-even reduction is now a standing objective of TORO Finance / Revenue:
- lower fixed operating cost where value-neutral;
- reduce OTA leakage;
- reduce utility base load;
- improve labor productivity without lowering service quality;
- eliminate waste / unsupported expenses;
- renegotiate supplier economics;
- increase contribution per occupied room-night;
- measure every improvement against monthly break-even revenue and break-even occupancy.




### Dreamcatcher Financial Deep-Dive — coordinated analysis before change day

**Owner directive — 2026-09-30:** perform a broad financial analysis of the hotel from multiple angles before making coordinated pricing/cost/process changes. Collect and reconcile first; then simulate; then execute a controlled change day.

Canonical subordinate contract:
- `docs/product/DREAMCATCHER_FINANCIAL_DEEP_DIVE_MASTER_PLAN_V1.md`

Scope:
- hotel-level profitability;
- room-level unit economics;
- channel contribution;
- breakfast economics;
- labor productivity;
- utilities/base load;
- maintenance vs capex;
- software/subscriptions;
- supplier economics;
- banking/payment fees;
- tax/accounting classification;
- direct vs OTA;
- break-even revenue / occupancy / ADR;
- continuous search for safe break-even reduction.

Operating rule:
- do not optimize for occupancy alone;
- do not cut costs that protect revenue, conversion, reviews, asset life or service without measuring the tradeoff;
- quantify expected monthly impact, confidence, implementation risk and rollback before a change;
- maintain a master question backlog and resolve it progressively without blocking all analysis.

Future milestone:
**FINANCIAL OPTIMIZATION CHANGE DAY** — only after decision-ready analysis, with a coordinated list of approved rate, breakfast, channel, supplier, staffing, subscription, utility and accounting changes.




### Dreamcatcher Financial Control Center — general page

Canonical general page:
- `docs/product/DREAMCATCHER_FINANCIAL_CONTROL_CENTER_V1.md`
- Supabase: `operations.knowledge_items/dreamcatcher_financial_control_center_v1`
- Dynamic parameter engine: `operations.knowledge_items/finance_room_unit_economics_engine_v1`

Rules:
- financial parameters are effective-dated and versioned; never overwrite historical meaning;
- actual reconciled source values supersede estimates for the same scope/date;
- formulas vary by reservation date, room, channel, guests, nights, breakfast, payment method, promotion and currency;
- each calculation exposes source, freshness and actual/inferred/estimated status;
- stale reservation mirrors may support historical analysis but not current rate decisions.

Current allocation-review sensitivity:
- explicitly named Santa Toro expenses inside DREAMCATCHER P&L: CRC 2,986,176.81 Jan–Sep 2026;
- explicitly named Diex expenses inside DREAMCATCHER P&L: CRC 6,566,884.36 Jan–Sep 2026;
- total flagged for benefiting-entity review: CRC 9,553,061.17;
- if all were ultimately proven external to Dreamcatcher operating economics, the current commission-only monthly break-even diagnostic would fall from about CRC 21.48M to about CRC 20.32M.
- **Do not reclassify or remove these expenses automatically.** Verify benefiting entity/shared-overhead treatment first.




### Financial cost-classification wave 1 — 2026-09-30

Canonical analytical registry:
- `operations.knowledge_items/dreamcatcher_cost_classification_2026_ytd_v1`

New verified observations:
- `Comisiones bancarias`: CRC 6,233,776.15 across 515 entries; ~2.35% of DREAMCATCHER P&L sales; strong payment-processing candidate, pending dataphone settlement reconciliation.
- `Ferreteria`: CRC 8,301,475.72; 82.83% concentrated Jan–Apr; high-priority CAPEX/expansion vs recurring-maintenance review.
- software/services reviewed: CRC 3,292,517.10 across 89 entries; largest vendors Simple Booking, WeSpeak, OpenAI and Alegra; audit for overlap/plan optimization before any cancellation.

Rules:
- this classification layer never rewrites Alegra automatically;
- high-value review buckets require transaction-level evidence before reclassification;
- realized savings are recorded only after verified change and readback;
- break-even engine consumes only classifications that have passed their required evidence gate.




### Financial cost-classification wave 2 — maintenance and labor

Maintenance:
- recorded repairs Jan–Sep 2026: CRC 17,594,860.19;
- CRC 14,992,933.09 (85.21%) is under CAPEX/fleet/other-property review:
  - Ferretería CRC 8,301,475.72;
  - vehicle repairs CRC 4,899,531.56;
  - Santa Toro repairs CRC 1,791,925.81;
- residual recurring-property candidate: CRC 2,601,927.10.
- sensitivity only: if all reviewed amounts were proven outside recurring Dreamcatcher operating cost, current commission-only diagnostic break-even would move from ~CRC 21.48M to ~CRC 19.66M/month.

Labor:
- total personnel expense: CRC 65,953,460.46 = 24.83% of Jan–Sep sales;
- admin payroll: CRC 20,262,901.46 = 7.63%;
- reception: CRC 9,953,438 = 3.75%;
- maintenance: CRC 11,020,318 = 4.15%;
- housekeeping: CRC 14,102,196 = 5.31%;
- reception + maintenance + housekeeping = CRC 35,075,952 = 13.21%.

Model rule:
- maintain separate **cash break-even** and **economic break-even** views;
- economic view includes required management labor/replacement-value compensation;
- owner/family compensation is not automatically excluded;
- housekeeping/reception/maintenance are fixed/step-fixed by occupancy bands until real workload data supports a different model.




### Break-even scenarios — Current / Clean / Target

Supabase:
- `operations.knowledge_items/dreamcatcher_break_even_scenarios_2026_ytd_v1`

Current diagnostic:
- ~CRC 21.48M monthly break-even.

Clean sensitivity:
- ~CRC 18.71M/month if identified other-property/CAPEX/fleet candidates are ultimately proven outside recurring Dreamcatcher operating cost and bank fees remain fixed;
- ~CRC 19.21M/month if those candidates are excluded from recurring cost and bank fees are confirmed variable payment-processing cost.

Target planning scenarios from the clean/payment-processing-variable base:
- 5% additional controllable fixed-cost reduction → ~CRC 18.25M/month;
- 10% → ~CRC 17.29M/month;
- 15% → ~CRC 16.32M/month.

Guardrail:
- accounting cleanup is not cash savings;
- CAPEX reclassification is not recurring savings by itself;
- target scenarios are hypotheses until a specific action is implemented and verified.


### Improvement loop

Monthly:
1. reconcile actual costs;
2. compare forecast vs actual;
3. update unit costs;
4. detect cost drift;
5. review minimum viable rates;
6. review channel economics;
7. review breakfast/package economics;
8. update promotion limits;
9. measure which rooms/channels create the strongest contribution;
10. capture approved assumptions/version changes with evidence.

Strategic principle: **occupancy by itself is not success. TORO should maximize sustainable contribution and profit, not simply fill rooms.**

## Directorio de enlaces y accesos — 2026-10-07

**Scope:** TORO-owned authorized portfolio; Dreamcatcher reference implementation. **Owners:** TORO Systems + TORO Tools + TORO Knowledge; SOBRESITO for technical integration. **Existing project mapping:** `business_truth_bible` (Data & Integrations), `toro_executive_control` (operating surface). **Priority:** P1. **CURRENT:** source inventory stored in the existing Supabase directory. **TARGET:** Systems → Enlaces y accesos as a role/scope-filtered view of that same registry. **NEXT:** implement the section in the canonical Portal without duplicating data or deploying implicitly.

- Preserve `operations.knowledge_items/dreamcatcher_system_database_directory_v1`, ID `50df0e7d-1aed-489a-a942-274715734dd0`. Existing canonical database, 14 Airtable links and runtime references remain intact; additive `structured_content.link_directory` contains 160 entries (154 URLs + 6 unresolved exact accesses), version 1.1. Count includes service surfaces, historical references, databases, private folder routes and 22 registered Kross unit links; it is not a count of 154 adopted systems or verified integrations.
- Provenance: 208 current Airtable Central `source_objects`; 14 accessible Airtable bases; 3 current Supabase projects; `integrations.external_dependency_registry`; current General Plan; current channel checkpoint; complete shallow Dropbox root listing (17 entries); relevant existing browser tabs; narrowly checked official provider portals. Inventory presence and connector access are distinct from daily human usage, valid sessions and E2E capability.
- No new database, table, master plan, agent or scheduler. `source_objects` and `external_dependency_registry` retain source/dependency roles; the directory is a navigation projection and does not replace their evidence. Kross, Alegra, banks and specialist authorities retain domain ownership.
- Entry fields: stable directory ID, name, URL or unresolved state, category, purpose/limit, service state, link verification state, exact/generic/constructed link class, evidence, observation date, scope and visibility. Scope/role enforcement belongs to the existing TORO identity/capability model. Private metadata and folders must not enter public hotel navigation.
- Human section: searchable external-system and owned-surface links together, filterable by business/category/state; visible distinctions for active, historical, sandbox, blocked and proposed destinations. Use existing preferences for favorites; do not create parallel state. Open links with safe target/rel attributes; do not prefetch private service data. Allow only validated HTTP(S) and explicitly needed mailto/tel protocols. Never store credentials, OAuth state, signed URLs, access tokens or guest payloads.
- Explicit gaps: exact WeSpeak/TERE panel, Trip.com/Ctrip onboarding access, SimpleBooking current-use access, OpenClaw Gateway host/URL, SINAMOT and Evertec retention portal. Generic provider entrypoints and constructed Dropbox folder URLs are not certified account deep links. Tool availability from installed plugins is not adoption evidence. Historical TORO v03/five and desired `dreamcatcherhotel.com/toro` must not be promoted to canonical deployment by this directory.
- **Verification in this unit:** Supabase readback confirms same row, internal visibility, all 14 previous Airtable links retained, canonical project unchanged and 160 entries / 154 URLs. A local searchable dashboard, Markdown, CSV and JSON are dated projections; the local dashboard does not query live Supabase or certify Portal integration. No schema/permission/production runtime change.
- **DoD for NEXT:** authenticated canonical Portal reads this record, renders authorized links with source/state, search/filter and owned/external access coverage; negative role/tenant tests prevent cross-scope leakage; mobile/keyboard QA passes; all unresolved destinations remain visibly unresolved. Release requires its separate applicable gate.
- **Rollback:** restore only the additive directory JSON and descriptive content from the saved pre-update snapshot after checking current version/concurrent edits; preserve unrelated fields. This document is proposed through a branch/PR and does not authorize merge, deployment or expanded access.

### Enlaces por sistema, navegación operativa y Cotizar — 2026-10-07

**Owner request:** organize principal systems and their derived links for hotel operations, review both Chrome profiles' bookmarks, and plan Portal buttons plus a quote widget. **CURRENT:** the same existing directory now stores additive `portal_navigation_proposal` (PROPOSED_NOT_PORTAL_IMPLEMENTED), grouping 160 entries into 38 principal-system groups and 9 process categories. These are navigation groups, not newly adopted services. **TARGET:** Enlaces y herramientas within Systems, reachable from Operations, with parent-system cards, derived-link expansion, search, role/scope filters and existing-preference favorites. **NEXT:** receive both exported bookmark HTML files, reconcile missing safe business links and then implement the canonical Portal section in its existing shell.

- Recommended hotel home: Kross PMS, planner, Cotizar, direct booking engine, WeSpeak/TERE (exact URL pending), WhatsApp, Gmail, DreamTeam, Calendar, hotel Dropbox, Booking and Airbnb. Ordering is an operational recommendation, not measured usage. Finance/banks and system administration stay role-restricted; legacy/copies/previews/404/TARGET destinations go to Archive/Pending, and unrelated businesses remain scoped separately.
- Bookmark review is explicitly **BLOCKED, 0/2 profiles reviewed**: browser policy rejects chrome://bookmarks and prohibits alternate retrieval to achieve the blocked action. Do not bypass via filesystem, raw CDP, browser commands or another browser surface. User-supplied HTML exports allow a materially safer local evidence review; preserve original bookmarks and omit unnecessary personal content.
- Quote widget belongs to Operations/Revenue, with TORO Revenue/TERE and Kross authority. First release is a dates/occupancy/child-age/unit/RO-BB intake that opens the official Kross booking engine. Do not assume URL filter parameters work without proof. An internal live quote requires authorized official Kross read capability, origin/time/freshness, currency/tax/extra/occupancy/cancellation verification and parity against the engine. No price/availability inferred from cached Airtable/Supabase rates; no duplicate counting of villas and component rooms; no booking/payment/message effect by filling the widget.
- A preview of buttons or saved specification is not Portal/runtime delivery. No API cost, access expansion, iframe banking/session capture, new app/base or deployment is authorized by this plan update. Relevant implementation tests: safe link protocols, role/tenant negative cases, parent/child consistency, search/filter/mobile/keyboard; live quote parity/error/stale-source handling only when that capability exists.


### Directorio maestro ampliado y cuentas — 2026-10-08

**CURRENT, verificado por escritura en el registro existente:** 243 fichas, 238 URLs únicas y 8 referencias de cuenta en `operations.knowledge_items / dreamcatcher_system_database_directory_v1`, versión 2.0. Se preservan las demás secciones del objeto. Texto completo del reporte guardado con los datos y hash SHA-256 del PDF local; el binario PDF no está alojado en Supabase.

- Evidencia ampliada: historial enfocado de dos perfiles Chrome (229 resultados, no exhaustivo), Airtable/Dropbox ya consultados, cuatro chats Codex, Gmail hotel/Mauricio y espejo Notion. Dos chats ChatGPT devolvieron límite de solicitudes; favoritos siguen 0/2.
- WeSpeak resuelto: https://app.wespeak.pro/dashboard y derivados de navegación observada. Trip.com: https://ebooking.trip.com, solicitud rechazada/incompleta según correo; no afirmar canal activo. HotelSwaps: panel/ficha/temporadas documentados por auditoría posterior al bloqueo que aún muestra Notion.
- 20 mejoras aplicadas al directorio/modelo/documento: IDs, proveedor, parentesco, proyectos, categorías, etiquetas, tipo de enlace, prioridades, inicio propuesto, archivo, roles propuestos, cuentas relacionadas, distinción destinatario/login, tipo/estado de cuenta, IDs externos, procedencia, fechas diferenciadas, revisión, conflictos/cobertura y exportación reproducible.
- Referencias de cuenta contienen correo y evidencia no secreta; destinatario no equivale a login, plan o permiso. RLS observada activa y lectura por roles de organización. No ampliar permisos. Agrupación por proveedor no prueba cuenta/propiedad compartida.
- **TARGET sin implementación:** sección de enlaces en Portal y Cotizar conforme al contrato anterior. Proyección `portal_navigation_proposal` v1.2 sigue histórica (160); la fuente de fichas actual es `link_directory` v2.0 (243). Reconciliar navegación existente al implementar; no consumir una proyección vieja como censo actual.
- **NEXT único:** validar principales diarios por rol/cuenta/propiedad y reconciliar la sección existente del Portal con el directorio v2.0, sin nuevo inventario, base, app ni despliegue. Esta PR permanece documental y sin merge.


### Reconciliación de Plan y navegación — 2026-10-09

**CURRENT:** el mismo registro Supabase mantiene `link_directory` v2.0 (243 fichas, 238 URLs únicas, 8 referencias de cuenta y 20 mejoras documentales) y ahora `portal_navigation_proposal` v2.0, reconciliada por los mismos 243 IDs y URLs. Este corte sustituye el estado de proyección histórica descrito arriba; los cortes anteriores se conservan como evidencia fechada.

- Se preservaron el catálogo, cuentas, texto respaldado, hash del PDF y demás campos. La navegación conserva el contrato Cotizar y cobertura de favoritos. Se propusieron seis tareas de inicio por ID: reservas LINK-048, cotizar LINK-002, huéspedes LINK-178, equipo LINK-086, agenda LINK-056 y facturación LINK-067.
- LINK-001 (cambio de contraseña PMS) queda fuera del inicio y bajo configuración restringida. WeSpeak deja de figurar como URL pendiente. El pendiente histórico Trip.com LINK-156 remite a LINK-241; eBooking localizado no significa canal activo.
- **TARGET:** Portal autorizado consume la navegación sobre el registro existente; controles de rol/organización en servidor, sin inferir permisos a partir de etiquetas. **NEXT:** validar destinos y cuenta/propiedad de los seis accesos diarios antes de implementar la vista. **FUTURE:** Cotizar vivo solo con fuente oficial y pruebas del contrato.
- **Verificación documental/datos:** IDs únicos, coincidencia de IDs/URLs entre catálogo y proyección, referencias de inicio/alias existentes y protocolos permitidos. No se atribuye QA autenticado, pruebas de aislamiento runtime ni Portal publicado.
- Plan de esta rama reconstruido sobre el contenido vigente de `main` (blob e1e8e7edc57018176686752187a5ae5ecf565713) conservando sus cambios concurrentes y la sección documental de este carril. La integración a `main` permanece pendiente de revisión/merge; no se declara el plan publicado.
- Recuperación: snapshot previo de la proyección en `work/alignment-20261009-before.json`; revertir únicamente esa clave después de comparar updated_at. Para documentación, revertir el commit del carril; nunca sobrescribir otros cambios.


### Guía compacta de herramientas — 2026-10-09

**CURRENT:** prototipo local `TORO-DASHBOARD-LINKS.html` actualizado, 243 fichas preservadas en 44 grupos / 10 áreas; seis tareas diarias, detalles plegables, búsqueda, filtros, favoritos locales, copiar e impresión. Nueve iconos de marca de Simple Icons; emojis en el resto. Las 50 simplificaciones están enumeradas en la guía local y en `portal_navigation_proposal.compact_view` v3.0 del mismo registro Supabase.

- Proyección local, no Portal publicado ni conexión viva. Catálogo/proyección v2.0 conservados. `compact_view` almacena distribución por IDs, tareas, procedencia de iconos, guía y pruebas; no crea otra base. SINAMOT localizado en su web oficial queda como overlay de presentación sobre LINK-159, sin afirmar alertas en vivo ni cerrar otros pendientes.
- Inicio compacto: reservas LINK-048, cotizar LINK-002, mensajes LINK-178, equipo LINK-086, agenda LINK-056, documentos LINK-131. Facturación permanece en Dinero y trámites. Los favoritos locales son solo de demostración; integración debe usar preferencias existentes.
- **Evidencia local:** 243 IDs, seis accesos de inicio, búsqueda, filtro de favoritos/persistencia, estado vacío, cero errores JS y sin desborde horizontal a 390 px. Revisión visual escritorio/móvil. No implica accesos autenticados ni pruebas de aislamiento en producción.
- **TARGET/NEXT:** implementar en sección existente de TORO tras validar los seis destinos, identidad/rol/scope en servidor y preferencias canónicas. Portal es puerta, TORO Brain relaciona tareas/sistemas/proyectos/fuentes, Supabase guarda catálogo; autoridades transaccionales permanecen Kross/Alegra. Mantener permisos y separar Santa Toro, patrimonio y hotel.
- No merge/deploy implícito; completar favoritos Chrome y otros pendientes con investigación focalizada, sin reconstruir el inventario.


### Herramientas del hotel — integración local acotada

**CURRENT local, no publicado:** `/my-toro/herramientas` y entrada en Mi TORO preparados en el checkout del carril, commit local `d4a851909c76686603efe87a07271076ae266e8e` sobre `73e8dc17b40a048a1324b750383da5daa44fd99d`. Código no empujado; patch y evidencia en outputs del checkpoint. Esta actualización remota es documental.

- Lector server-side con sesión, contexto canónico, organización/propiedad exactas, membresía activa y los roles existentes de lectura de knowledge_items. Cliente Supabase de sesión con RLS, sin service-role, sin ampliar permisos.
- Seis destinos explícitos cotejados con catálogo; cambio de URL, ID duplicado, otro scope o fallo de lectura no entrega ese enlace. No expone cuentas, evidencia privada ni el catálogo de proyectos mezclados. El catálogo completo de 243 fichas permanece intacto.
- **Evidencia:** 24 pruebas nuevas + 29 de contexto/menú, TypeScript, lint del cambio y build PASS. Servidor local sin configuración: cero links externos y sin desborde móvil390. No equivale a prueba autenticada/RLS viva.
- **Bloqueadores del alcance completo:** falta prueba de sesión real; no se encontró contrato persistente de favoritos en las tablas/implementación consultadas; fichas restantes sin política de scope/rol validada. No migrar localStorage ni crear base de preferencias paralela.
- **NEXT único:** prueba autenticada de los seis accesos en entorno autorizado; resolver preferencias y permisos existentes antes de ampliar. Sin push del código/merge/despliegue en este corte. Recuperación: revertir commit local; no hubo migración.

### Publicación autorizada — Herramientas, 10/10/2026

Mauricio autoriza publicar y continuar. Código conciliado con main y subido en la misma PR251, commit abed8e0c9fb879d1b9b3caa41aea55421e610c59. Vercel proyecto existente toro-pr11-preview: despliegue dpl_5rSEw7rMy1EsRK1pUcci26Sjd8vT READY; ruta /my-toro/herramientas. CI 38032517161: tests, lint y build PASS. Navegador sin sesión muestra contexto autorizado requerido, sin accesos externos del directorio.

CURRENT: preview publicado, no producción ni merge. Falta sesión real autorizada para probar lectura del registro y seis accesos; AGENTS.md exige evidencia runtime antes del merge. La autorización de publicación permanece vigente para cerrar la misma entrega tras superar ese control, sin ampliar permisos. NEXT único: login manual del propietario en el preview, comprobar contexto/lectura y completar release existente. No copiar sesiones, crear usuarios, restablecer contraseña ni debilitar RLS. Catálogo de 243 fichas y fuente Supabase intactos. Reversión: revertir solo los siete archivos del commit funcional d4a8519; no migración de datos. No promover la maqueta HTML privada ni el catálogo completo.

### Operación diaria y acceso claro — 10/10/2026

Mauricio pide usar admin@dreamcatcherhotel.com y rediseñar según operación diaria. Cuenta Auth confirmada y ADMIN activo; sesión real observada en TORO local. El fallo anterior era PGRST106: operations no está expuesto a PostgREST, no credenciales incorrectas. Con autorización explícita, aplicada lectura pública acotada dreamcatcher_tool_links_v1: SECURITY INVOKER, RLS existente, scope fijo, solo seis IDs/URLs exactos; ejecución denegada a anon, sin cambiar usuarios/policies ni exponer operations. Navegador de la sesión del propietario muestra los seis accesos. Consulta sin roles devuelve cero; llamada HTTP anónima 42501.

Vista existente /my-toro/herramientas organizada por Empezar turno, Atender huéspedes, Preparar habitaciones, Cotizar estancia, Revisar cobros y Cerrar/preparar mañana. Es guía de navegación basada en recepción y autoridades del Plan, no procedimiento de turnos validado ni tablero de estados vivos. Cobros sin accesos aprobados conserva pendiente explícito. Login con ayuda y mostrar contraseña; errores de catálogo ya no piden cambiar de usuario. No nuevas cuentas, copia de sesiones ni recuperación enviada. DreamTeam mantiene su login propio y misma autoridad de identidad; no se ha implementado SSO.

TARGET/NEXT: contrastar con recepción responsable real por turno y accesos de caja/aseo/mantenimiento; conectar lecturas verificadas una por una. Preservar Kross, Alegra/bancos, DreamTeam, Team Brief y Cierre Diario existentes. No nueva cola, base, scheduler ni catálogo. Prueba local autenticada y negativas superadas; release sujeto a CI y readback de despliegue vigente. Revertir función sin CASCADE y cambio de UI si necesario; no datos alterados por la función.
### Corrección del gate de Herramientas — 10/10/2026

**CURRENT de seguridad:** una sesión con rol lector no basta para mostrar herramientas. El filtro exige identidad, `work_org`, contexto/membresía vigentes y permiso exacto en `allowedTools` (`provider`, `owner=organization`, misma `orgId`, acción `read`), antes de consultar el catálogo y al proyectar cada enlace. Las claves Kross, WeSpeak, Google Calendar y Dropbox proceden del catálogo existente; asignar la clave a un destino no concede el permiso. DreamTeam conserva LINK-086 pero queda fuera de la proyección hasta resolver su contrato de proveedor. El HTML privado y las 243 fichas no cambian.

- El resolver actual siempre devuelve `allowedTools: []`; por ello la ruta corregida deniega también a ADMIN. No simular permisos para conseguir seis botones visibles. Cinco destinos tienen mapeo preparado; cero están habilitados por el resolver vigente.
- La propiedad de la fila está filtrada, pero el contexto aún no representa autorización del actor por propiedad. Esto sigue bloqueando la activación. La inspección acotada de `integrations.external_dependency_registry` encontró metadatos de dependencias, no grants de usuario; no se alteró el esquema ni RLS.
- Evidencia local: prueba roja previa (24 fallos de frontera), luego 90/90 pruebas de herramientas/contexto/menú; incluye el resolver real con transporte sintético y denegación directa, cambio de sesión y errores. Lint del cambio y build Next.js/TypeScript con Webpack PASS. Suite de herramientas incorporada a `npm test`. Revisión independiente sin hallazgos concretos. Esto no acredita sesión/RLS en vivo.
- **NEXT único:** resolver en el contrato canónico los permisos reales por herramienta y propiedad, con mapeo validado, antes de la prueba de activación del equipo. Se conserva la autorización de publicación ya registrada; el gate anterior de solo login queda sustituido por este requisito técnico. Mantener PR251 en borrador, sin merge ni producción en este corte. Revertir únicamente el commit de esta corrección si es necesario, conservando cambios concurrentes y sin migración.

### Conciliación del directorio de navegación — autorización específica 10/10/2026

El propietario aprobó explícitamente crear una lectura que entregue únicamente los seis enlaces a cuentas con los roles actuales: «Sí, activar esa lectura limitada». Esto resuelve el conflicto con el gate del carril 4b6b6cb SOLO para lectura del directorio RLS existente. Abrir una URL no ejecuta read/search/execute en el proveedor ni concede un grant de integración. Mantener allowedTools vacío cuando no hay contrato; jamás llenarlo con permisos sintéticos. La entrada conserva identidad, work_org, contexto único, membresía activa, organización y propiedad exactas. public.properties confirma pertenencia de la propiedad a la organización y knowledge_items conserva su RLS por rol. No se crea autorización general por propiedad fuera de este registro.

El requisito de allowedTools sigue vigente para futura operación de conectores, datos externos, ejecución o integración embebida; no hay tales acciones en esta vista. Se preservan las mejoras concurrentes de identidad/scope, tests de cambio de sesión, rechazo de URLs/duplicados y cobertura en npm test. Seis enlaces cotejados con lectura real de la cuenta actual; endpoint anónimo denegado. Esta decisión no activa los otros 237 registros ni habilita al equipo con roles no autorizados.

### Inicio útil del hotel — 10/10/2026

**CURRENT preparado y verificado localmente:** mejora de presentación en TORO Tools / Human Experience, referencia Dreamcatcher, sobre main 43aa4ba. `/my-toro` entrega los seis accesos revisados directamente desde el lector de sesión existente; solo aparecen en estado `ready` y con contexto autorizado. Conserva la guía de turno y agrupa pendientes y ayuda de cuenta en secciones plegables. El buscador describe navegación de menú, prioriza opciones utilizables y conserva entrada/salida de submenús. No añade datos, permisos, integraciones, estados operativos ni otra base.

- Evidencia: 85 pruebas de herramientas/menú/contexto; TypeScript y lint del cambio. Sesión local real con seis enlaces, ayuda de cuenta, navegación a la guía y viewport móvil de 390 px sin desborde. La cuenta sintética sin sesión, de otra organización, suspendida o con elección pendiente no consulta el directorio; un fallo de lectura no expone URLs.
- Criterio de entrega: inicio compacto, acciones útiles primero, pendientes sin falsos botones y seis destinos bajo los mismos controles. Recuperación mediante revert de este cambio de presentación; sin migración.
- **NEXT único:** cerrar el release acotado en el proyecto Next.js existente. Producción permanece pendiente de separar el delta de otros módulos ya presente en main; no promover todo el proyecto ni activar nuevos permisos bajo esta mejora visual. Catálogo canónico conserva 243 fichas.


### Conciliación local del portal — 2026-10-11

**Ámbito y autoridad:** portal existente, Human Experience, Cerebro y TORO Finance/People; este documento sigue siendo el único Plan General. La conciliación local autorizada conserva PR262 `7837ae9`, main `6992dfe`, los deltas aprobados de Hoy/Buscar/test y los aportes humanos People/FIN01. No crea otro proyecto ni integra el checkout separado de DreamTeam.

**CURRENT — código local:** Hoy en Mi TORO conserva un único instante, `America/Costa_Rica`, fuente/cobertura, conteos coherentes, importe desconocido distinto de cero y enlace de evidencia. `search_toro` filtra la lectura canónica acotada antes del límite de resultados; máximo 101 objetos cargados, diez resultados por defecto y máximo 25. Informa conteos y truncamiento, `complete=false` y totalidad autorizada desconocida. Mi TORO mantiene su búsqueda de opciones del menú. Roles, flags, gates y perímetro demo de PR262 se conservan; esto no acredita operación autenticada ni RLS vivo.

**TARGET:** búsqueda con mayor cobertura y evidencia verificable, subordinada a P07/P13 y a fuentes realmente autorizadas. Las 100 mejoras de Cerebro conservan su clasificación documental; conciliarlas no las declara ejecutadas. Alegra/custodia y los cortes históricos FIN01 mantienen sus fechas, autoridad y límites; People conserva su dirección humana sin nuevos grants.

**CURRENT — validación controlada local:** suites principales 463/463 (incluidas 28 de aislamiento secuencial), herramientas/Mi TORO 46/46 y las once regresiones de Buscar ya existentes 11/11; tipos y lint de los 14 archivos relevantes pasaron. Build local de Next 16.3.6/Turbopack: 45 páginas. Los datos de las pruebas son fixtures/sustituciones existentes, incluido el harness privado de Buscar fuera del producto; no son datos operativos reales ni prueba de autenticación/RLS. No se crearon fixtures nuevos. Recibos, comandos, hashes y recuperación quedan fuera del repositorio.

**NEXT:** QA autenticado requiere un entorno interno y una sesión legítima autorizados. Publicación, CI/preview y aceptación operativa requieren su propio alcance.

**Límites y recuperación:** solo integración y pruebas locales. PUMBA conserva A1 Prepare; Kross API, mantenimiento automático, Gateway y WhatsApp quedan fuera de esta unidad. Se preserva Recepción `2adc9fa` / C01–C30. No hay push, merge remoto, deploy, consultas a datos remotos, activaciones, credenciales, permisos, instalaciones ni nuevos fixtures. La rama original permanece en `0f31223`; un snapshot local y respaldo íntegro permiten recuperación sin reset ni borrados.

### Corrección local de dependencias del Portal — 11/10/2026, 15:01 Costa Rica

**CURRENT local, sin publicar:** sobre `7cabb88`, Next y eslint-config-next pasan de 16.3.6 a 16.3.8; sharp de 0.35.4 a 0.35.5 y source-map-js de 1.2.1 a 1.2.2. El lockfile cambia únicamente las familias previstas, con resolved/integrity oficiales. No cambian fuentes de Hoy/Buscar, identidad, flags, gates, permisos, datos ni contribuciones anteriores del Plan.

**Evidencia posterior al cambio:** audit runtime exit 0 y cero avisos; audit completo exit 1 con cinco paquetes de desarrollo que heredan un único aviso de braces. 534/534 pruebas controladas en siete componentes y tres validadores; TypeScript, lint de 14 archivos y build Next 16.3.8/Turbopack aprobados, 45 páginas y dos workers. ESLint completo: 190 archivos, cero errores y un aviso de variable sin uso en un archivo sin cambios. Seis GET al servidor local validaron el perímetro público fail-closed; el servidor de prueba se detuvo. No es sesión autenticada, QA móvil/teclado, RLS vivo ni CI/preview.

**Pendiente y NEXT único:** entorno interno existente del mismo candidato con sesión legítima autorizada para entrada → Hoy → Buscar → evidencia → retorno, identidad/ámbito y móvil/teclado. Braces conserva un aviso sin parche upstream; no es una aceptación de riesgo aprobada. No rebajar ESLint, retirar gates o instalar datos ficticios para cerrar el aviso. El portal integrado sigue sin publicar.

Recibo y recuperación: `C:\Users\PERSONAL\Documents\Codex\2026-10-11\contin-a-el-portal-toro-lee\work\security-unit\receipt.json`; respaldo de package/lock/Plan en su carpeta `backup`; base `7cabb88` y snapshot histórico `6151a4a` conservados. Recuperación solo de este delta tras verificar cambios posteriores, sin reset/clean ni sobrescribir aportes ajenos. Este bloque no autoriza publicación, despliegue, nuevas lecturas o permisos.

### Preparación local de QA autenticado del Portal — 11/10/2026, 15:23 Costa Rica

**CURRENT verificado:** se añade únicamente `scripts/portal-session-preflight.mjs` y su prueba Node: comprobación offline de candidato/árbol limpio, dependencias instaladas, configuración pública de navegador/servidor, proyecto Supabase esperado, flags exactos y ausencia de privilegios/lecturas legacy/escrituras. 13/13 pruebas dirigidas y lint sin avisos. No consulta datos, lee archivos .env, cambia flags, inicia servidores ni verifica sesiones; exit 0 significa preparación, nunca autorización, RLS o publicación. El proyecto se selecciona explícitamente; para este alcance, la autoridad de las secciones actuales del Plan conserva `abtyrbqlqbsastmridzp`.

**Conservado:** fuentes funcionales, package/lock y todos los aportes de People/Cerebro/Alegra/FIN01 permanecen idénticos al candidato `fc640c6`. Sus 534 pruebas, build y auditoría local se conservan como evidencia anterior, sin nueva ejecución. Braces dev y la advertencia ESLint anterior siguen pendientes.

**Recurso observado:** Vercel identifica la preview abierta `toro-pr11-preview-9uszzp4m4-dreamcatcher-s-projects.vercel.app` como `7837ae9`, no como el candidato integrado. Consulta acotada por SHA `fc640c6` en el equipo actual: cero deployments. La consulta de variables no produjo metadata utilizable; configuración remota UNKNOWN. No se cambia Deployment Protection ni se crea un bypass.

**NEXT único:** autorización específica para QA temporal local en 127.0.0.1:3047, en el portal existente y con identidad/grants actuales: lectura canónica + Hoy/Finance. Solo para el proceso: `TORO_DEPLOYMENT_MODE=internal`, `TORO_BRAIN_CANONICAL_READ_ENABLED=true` y `TORO_OWNER_ATTENTION_READ_ENABLED=true`; legacy/escrituras deshabilitados y ningún secreto privilegiado. Configuración pública del proyecto canónico disponible de forma segura durante un build nuevo; login humano en navegador sin compartir contraseña. Luego completar entrada/identidad → Hoy → Buscar → evidencia/retorno → móvil/teclado, y detener el servidor. Todavía no autorizado ni ejecutado.

Recibo canónico y recuperación en `C:\Users\PERSONAL\Documents\Codex\2026-10-11\task\integration\INTEGRACION_LOCAL_VALIDADA.md`; evidencia de esta unidad en `C:\Users\PERSONAL\Documents\Codex\2026-10-11\contin-a-el-portal-toro-lee\work\session-unit\receipt.json`. Recuperación: revert de este delta local tras verificar cambios posteriores; no reset, borrados ni cambios en ramas previas. Esta preparación no autoriza despliegue, nuevos permisos, nuevas cuentas, envío externo ni publicación.

### QA local autorizada: corrección de la entrada interna — 11/10/2026, 15:34 Costa Rica

**Autorización recibida:** Mauricio aprobó explícitamente QA temporal de lectura en 127.0.0.1:3047 y Supabase canónico `abtyrbqlqbsastmridzp`, incluyendo Cerebro y Hoy/Finance, con tres flags internos solo en el proceso, identidad/grants actuales y escrituras deshabilitadas. No permite publicación, nuevas cuentas o permisos.

**CURRENT local:** el preflight autorizado aprobó 15 comprobaciones. Supabase confirmó proyecto ACTIVE_HEALTHY, URL canónica y clave publishable activa; no se obtienen secretos privilegiados. Un build con esa configuración detectó que `/` invocaba el ledger legacy deshabilitado durante el prerender. Se conserva el fallo y el build previo; no se activa legacy para resolverlo. La entrada pública sigue a `/brain`; la entrada interna con legacy deshabilitado va a `/my-toro` antes de todo I/O antiguo, y la rama legacy explícita conserva su comportamiento existente. Este cambio no certifica su autenticación.

**Verificación dirigida:** 105/105 pruebas de entrada/perímetro, incluidas 9 regresiones nuevas de `/`; cero fallos/omitidas. Lint de ambos archivos sin avisos. Las 534 pruebas anteriores y el patch de seguridad se conservan como evidencia baseline; no se relanza la batería completa. Build interno corregido, sesión/RLS y cinco bloques de QA siguen pendientes hasta verificarse.

**NEXT:** rebuild local con configuración pública legítima, verificar entrada y denegación sin sesión, luego login humano y recorrido Hoy/Buscar/evidencia/retorno/móvil/teclado. El permiso para esta QA ya está concedido; no volver a solicitarlo. Fuente/recuperación: commit anterior `adf70cf`, recibo canónico existente y `work/auth-qa-build-attempt1` en el chat local; revert solo de este delta tras verificar cambios posteriores, conservando el Plan previo como prefijo.

### Resultado de QA local con sesión legítima — 11/10/2026, 15:56 Costa Rica

**CURRENT verificado:** la QA temporal de lectura ya tiene autorización expresa de Mauricio; no volver a pedirla para este mismo alcance. Código funcional probado en `cdfa0c2`: `/` conserva `/brain` en modo público, entra a `/my-toro` cuando legacy está deshabilitado y evalúa los gates por petición (`force-dynamic`). Se mantiene la rama legacy existente sin certificarla ni activarla. 105/105 regresiones dirigidas, incluidas 9 nuevas; después del ajuste dinámico, 9/9 de entrada y lint aprobados. Build final Next 16.3.8 con config pública legítima, TypeScript y ruta raíz dinámica aprobados. No es una nueva ejecución de las 534 pruebas baseline.

**Sesión real verificada:** en el segundo navegador conectado, perfil Dirección / ADMIN y contexto Dreamcatcher. Mi TORO presenta sus seis destinos existentes. Móvil 390×844 sin desborde, foco visible sólido de 2px y navegación por teclado a la guía y regreso al mismo hotel. Sin sesión, context y Owner Attention devuelven 401 sin proyección; los 404 de rutas no existentes no cuentan como denegaciones de permisos. Viewport restaurado y servidor temporal detenido, puerto 3047 cerrado.

**BLOCKED, no aceptación operativa:** Hoy muestra fuentes no disponibles; Cerebro conserva el fallback demo explícito. No se verificaron importes/fecha/cobertura reales, búsqueda/evidencia canónica ni aislamiento entre dos identidades. Supabase Data API devolvió PGRST106/406 para operations, integrations y finance en sondas públicas de cero filas; public respondió 200. Metadata confirma ausencia de SELECT/políticas de lectura en finance.invoices y operations.communication_followups; finance tampoco concede USAGE a authenticated. integrations.kross_snapshot_health tiene SELECT authenticated y RLS deshabilitada: exponer todo integrations ampliaría superficie. No se cambia API config, permisos, RLS o datos para hacer pasar la prueba.

**NEXT único:** preparar y verificar localmente un transporte/proyección de lectura autenticado y acotado con su propuesta exacta de grants/RLS/rollback. Reutilizar fuentes y estructura existentes; no exponer esquemas completos, usar service-role, SECURITY DEFINER como atajo, migraciones remotas o nuevos datos de prueba operativos. La propuesta de cambio remoto requerirá su propia autorización específica; la QA local ya está autorizada.

Plan y trabajo People/Cerebro/Alegra/FIN01 preservados. Auditoría anterior terminada: runtime cero avisos; braces dev sigue abierto, no aceptado. El portal integrado permanece sin publicar. Recibo canónico `C:\Users\PERSONAL\Documents\Codex\2026-10-11\task\integration\INTEGRACION_LOCAL_VALIDADA.md` y evidencia de esta QA `C:\Users\PERSONAL\Documents\Codex\2026-10-11\contin-a-el-portal-toro-lee\work\auth-qa-unit\receipt.json`; builds anteriores y fallo conservados en carpetas auth-qa-build-attempt1/2. Recuperación mediante revert solo de estos deltas tras comprobar cambios posteriores, sin reset ni eliminación de trabajo existente.


### Un solo Portal: Mi TORO y presentación corporativa — 2026-10-11

**Autoridad y alcance:** solicitud directa de Mauricio; TORO Human Experience / Tools, sobre el Portal Next.js existente y este único Plan General, sección 23 y contrato TORO_DASHBOARD_V1. Mi TORO es la vista personal por rol dentro del Portal, no una aplicación o fuente de verdad aparte. Cerebro, módulo visible 0, y los once dominios conservan sus ordinales de presentación; no se renumeran proyectos ni IDs técnicos. La portada final Cerebro autenticada continúa como TARGET hasta comprobar su lectura canónica; no se convierte la demo en operación.

**CURRENT — candidato local:** cabecera común en Mi TORO, Cerebro autenticado y guía del turno; vista `/portal` como directorio de los doce módulos. Paleta azul sobria, tipografía jerarquizada y navegación corporativa, con marca TORO textual existente, sin sustituir los masters de identidad. Las consultas solo enlazan si el menú actual prueba READ_ONLY y foco permitido. Los pendientes tienen texto sin falsos botones. La guía conserva seis accesos revisados. Hoy sigue el mismo panel y fuente, y el explorador conserva aviso demo/lectura. La edición pública no resuelve contexto ni muestra esta navegación privada. No se añaden base, tenant, proyectos, credenciales o permisos.

**Conciliación de fuentes:** lectura directa del Plan/contexto/Constitución y arquitectura; export Dropbox `TORO_Producto_Final_100_Mejoras_2026-10-10.md` declara el mismo Plan único. Metadata de `operations.projects` en Supabase conserva portafolio `toro_os_portfolio_master`, ejecución `toro_executive_control`, Dreamcatcher y carril Propiedades. Datos/Integraciones, Operación Hotelera, Revenue, Web y Finanzas mantienen sus estados registrados; Dreamcatcher madre requiere revalidación. Esto es estado del registro, no prueba de ejecución autónoma ni disponibilidad del Portal. Airtable Central conserva tareas de transición e históricas; la antigua instrucción del plugin Master Brain que da autoridad global a Airtable queda subordinada a este contrato vigente. Kross, Alegra y bancos retienen autoridad transaccional; Dropbox conserva originales; DreamTeam converge a TORO People por paridad, sin retirar su runtime. AI for Dreamers sigue producto separado según contrato; no se fusionan productos por tener relación con TORO.

**Verificado antes del build:** 579 pruebas aprobadas sin fallos ni saltos: 495 suite principal (incluye 23 de navegación/privacidad y 9 de entrada), 46 hotel, 25 Node y 13 preflight; tres validadores CLI, TypeScript y lint afectado sin errores/avisos. Las 534 baseline están incluidas en esta ejecución. Paquetes y lock sin cambios. La auditoría previa sigue terminada: runtime cero avisos, hallazgo braces de desarrollo abierto sin aceptación. Build y recorrido visual del candidato se registrarán con su SHA exacto al cerrar QA.

**BLOCKED y NEXT único:** lectura operativa privada Hoy → Buscar → evidencia continúa bloqueada por transporte/API/permisos previamente diagnosticados. Preparar y probar localmente una proyección autenticada acotada y la propuesta exacta de SQL/grants/RLS/rollback sin aplicarla. No exponer esquemas completos ni usar service-role/SECURITY DEFINER como atajo. La autorización de QA local existente se conserva; cambios remotos necesitan aprobación específica. Portal aún sin publicar. Recuperación: revert de este delta local después de revisar cambios posteriores; no reset, retiro de servicios ni borrado.


**Cierre de QA del Portal único — 11/10/2026, 16:20 Costa Rica:** build Next16.3.8/TypeScript y preflight15/15 aprobados sobre `8ac120094138f82d923485d34058b98ad5126312`. Sesión existente Dreamcatcher: recorrido Mi TORO ↔ vista general, Cerebro y guía del turno, doce módulos y seis enlaces revisados. Las cuatro vistas a 390×844 no desbordan; controles principales44px, foco de teclado sólido2px, escritorio1280px restaurado. Sin sesión, `/portal` presenta login sin navegación privada; APIs context/owner-attention401 sin proyección. Hoy continúa sin fuentes disponibles y Cerebro en demo explícita. No se probó segunda identidad ni se aceptó lectura operativa real. Servidor temporal detenido y puerto3047 cerrado. Capturas y evidencia guardadas; candidato integrado NO PUBLICADO. El NEXT único de proyección acotada/SQL propuesto sigue vigente. Se conservan las 534 baseline incluidas entre579 aprobadas, auditoría y trabajo People/Cerebro/Alegra/FIN01.


### Lectura autenticada acotada del Portal: preparación local — 2026-10-11

**CURRENT local, no activado:** adaptador server-only de RPC v1 para los lectores existentes Cerebro/Owner Attention; selector `TORO_PORTAL_READ_TRANSPORT=rpc_v1` opt-in, default directo conservado. Gates internos, identidad/rol/org activo, contrato estricto con columnas/topes y revalidación de sesión después del I/O; sin claves privilegiadas, datos operativos nuevos o cambios de UI. Mi TORO permanece dentro del mismo Portal. Se conserva este único Plan y los trabajos People/Cerebro/Alegra/FIN01.

**PROPUESTO, NO APLICADO:** dos funciones públicas SECURITY INVOKER; EXECUTE authenticated; SELECT por columna y RLS organizacional en communication_followups/invoices; USAGE finance con guarda contra privilegios latentes; activación RLS en Kross snapshot health actualmente desprotegido. Reutiliza el helper de rol existente sin modificarlo. Borradores exactos en `supabase/drafts/20261011_portal_narrow_read_v1.sql` y `_rollback.sql`; revisión subordinada `docs/product/TORO_PORTAL_NARROW_READ_V1_REVIEW.md`. Reversión funcional retira nuevas lecturas/funciones y mantiene Kross protegido; no restaura el acceso inseguro previo.

**Verificación:** 631/631 locales, incluidas todas las579 previas: principal531, hotel46, Node25, preflight14, PostgreSQL aislado15; cero fallos/saltos. Tres validadores CLI, TypeScript/lint afectado aprobados. Las15 pruebas SQL usan datos sintéticos solo en PGlite local, incluyendo aislamiento, permisos, límites y reversión. No certifican RLS/PostgREST real ni segunda identidad autorizada. Dependencias y auditoría previa sin cambios: runtime cero avisos en su corte; braces dev abierto sin aceptación. El build se documentará con su SHA al cierre.

**BLOCKED y NEXT único:** revisar/decidir sobre la propuesta exacta antes de todo cambio remoto o activación RPC. La QA local ya está autorizada; esa autorización no amplía accesos. Hoy → Buscar → evidencia real y las comprobaciones del menú que usan esquemas directos siguen sin aceptación. No publicación, schema exposure, service-role, migración remota ni nuevos grants en esta tarea. Checkpoint existente `C:\Users\PERSONAL\Documents\Codex\2026-10-11\task\integration\INTEGRACION_LOCAL_VALIDADA.md` conserva estado/evidencia/recuperación. No releer fuentes ajenas al bloqueo ni crear otro Plan.


**Cierre de build de lectura acotada — 11/10/2026, 17:37 Costa Rica:** Next16.3.8/TypeScript exit0 y preflight16/16 sobre `bd1ec02ffe7acec1bb51846b8c38f6fc51d9ac06`. Configuración pública canónica solo en proceso de build; RPC opt-in desactivada, sin servidor ni nuevas lecturas de negocio. 631 pruebas locales incluyen las579 anteriores. Comprobación SELECT de metadata confirma cero funciones/políticas/grants nuevos y finance sin USAGE; SQL/RLS permanecen propuestos, no aplicados. Sin cambio de dependencias, UI corporativa o auditoría. Portal sin publicar. NEXT único: revisión/decisión explícita de la propuesta exacta antes de cualquier cambio remoto.


### Corrección de propuesta SQL y revisión de consumidores — 11/10/2026, 18:21 Costa Rica

**CURRENT verificado, sustituye el diagnóstico Kross anterior:** `integrations.kross_snapshot_health` es vista security_invoker/security_barrier sobre `integrations.kross_snapshot_registry`, tabla con RLS y SELECT organizacional existentes. La fixture anterior la modeló incorrectamente como tabla; sus15 tests no validaban el DDL propuesto para la vista. Se retira ese DDL/política adicional y la afirmación de acceso Kross desprotegido; no se modifica Kross. Nueva fixture reproduce vista/registry/políticas y cálculos de frescura. Auditoría npm y Portal corporativo no cambian.

**Propuesta revisada, NO APLICADA:** únicamente dos RPC SECURITY INVOKER, USAGE finance, SELECT de columnas y RLS organizacional ADMIN/GERENCIA para followups/invoices. Guardas nuevas contra permisos writer latentes y deriva de tipo/invoker/RLS; rollback rechaza cambios concurrentes de función/políticas/columnas/consumidores financieros. Consumidores locales revisados: canonical-read, owner-attention y menú; vista communication_attention_v actualmente sin SELECT authenticated no recibe acceso. Borradores/revisión conservan sus rutas y sustituyen la versión anterior.

**Verificación actual:** SQL25/25 y adaptador36/36, sin fallos/saltos; lint aprobado. 641 pruebas registradas:531 principal,46 hotel,25 Node,14 preflight,25 SQL. SQL25 sustituye la evidencia SQL15 incorrecta sobre Kross; resto de la regresión/build/TypeScript/auditoría conservado sin relanzar. Src y package/lock permanecen idénticos. No datos operativos, SQL remoto, usuarios, grants, RLS, flags o publicación aplicados. No sesión real ni PostgREST certificado.

**Decisión técnica:** preparado para solicitar autorización específica; no es aprobación del propietario. NEXT único: autorización explícita para el SQL exacto revisado y RPC temporal durante la QA local ya autorizada. Después, readback y aceptación Cerebro/Hoy acotadas; menú/Buscar/evidencia siguen sin aceptación. Mantener el mismo checkpoint y Plan; no nuevas auditorías, inventarios o fuentes ajenas. Recuperación del delta local con revert tras revisar cambios posteriores, sin reset/borrados.


### SQL de lectura autorizado y QA local real — 11/10/2026, 19:45 Costa Rica

**Autorización vigente:** respuesta directa «Autorizar SQL exacto y QA local», para SHA-256 `921a2329976b5e6da8f2e14ea46dbca80c7e4717df28913a27188d79515b3b19`, proyecto `abtyrbqlqbsastmridzp`, dos RPC invoker, USAGE finance y columnas/políticas organizacionales de followups/invoices, RPC temporal127.0.0.1:3047. No autoriza escritores, nuevas cuentas, otros grants o publicación; no repetir la aprobación para este mismo alcance.

**CURRENT aplicado y readback:** migración `20261012012726` / `portal_narrow_read_v1_authorized_20261011`.11 comprobaciones de metadata: funciones con cuerpo exacto, SECURITY INVOKER/search_path vacío/EXECUTE authenticated y no anon/service_role; SELECT solo13 columnas por cada tabla, RLS SELECT ADMIN/GERENCIA mismo org; sin SELECT de tabla completa o writers. Helper existente y Kross vista/registry/ACL/RLS/políticas intactos. Sin filas operativas o usuarios nuevos. SQL/rollback aprobados conservan bytes/hashes; encabezado histórico REVIEW ONLY no implica que sigan sin aplicar. Rollback no ejecutado remoto.

**QA real local verificada:** build `bd1ec02` reutilizado por identidad exacta de src/scripts/package/lock; preflight16 aprobado. Sesión existente Dirección/ADMIN, Dreamcatcher. Hoy:47 comunicaciones/72 obligaciones/148 facturas, límites100/150/200;50 mostrados de145 seleccionados del lote, total organizacional desconocido, cobertura parcial explícita y fecha11/10/2026 Costa Rica. Cerebro:19 objetos/18 relaciones, sin demo. Mi TORO ↔ Cerebro ↔ Mi TORO dentro del Portal único; ambas vistas con datos reales390×844 sin desborde y viewport restablecido. No importes, registros privados o credenciales guardados. Sin sesión: context y Owner Attention401 sin proyección; los404 de rutas inexistentes no son prueba de denegación. Navegación JSON autenticada IAB bloqueada por cliente: no certifica HTTP; se verificó el render real, sin bypass. Servidor detenido y puerto3047 cerrado; RPC temporal no queda corriendo.

**Conservado/límite:**641 pruebas registradas y auditoría anterior sin repetirlas; src/dependencias y Portal corporativo no cambian, Plan previo intacto. Braces dev abierto sin aceptación. No segunda identidad real ni escenarios de importe conocido/cero/desconocido forzados; no aceptación contable/operativa global. El portal integrado NO PUBLICADO, sin push/merge/deploy. SQL autorizado es un cambio de lectura real en Supabase; no confundirlo con publicación del Portal.

**NEXT único:** cerrar localmente el recorrido menú/Buscar → evidencia permitida → retorno usando las RPC ya aprobadas, manteniendo gates/autoridades. No exponer esquemas ni agregar SQL/permisos para forzar disponibilidad; proponer aparte lo que exceda el alcance. QA local autorizada, no solicitarla de nuevo. Actualizar el mismo checkpoint y entregar superprompt breve; no repetir auditorías o releer fuentes ajenas. Recuperación local con revert del delta documental tras revisar cambios posteriores; recuperación DB mediante rollback exacto y revisión de consumidores/dependencias antes de ejecutar. Evidencia/readback en `C:\Users\PERSONAL\Documents\Codex\2026-10-11\contin-a-el-portal-toro-lee\work\narrow-read-activation`.


## Menú/Buscar y evidencia permitida implementados; QA autenticada pendiente — 11/10/2026, 20:13 Costa Rica

Estado **MENU_SEARCH_PROJECT_EVIDENCE_IMPLEMENTED_AUTHENTICATED_QA_PENDING_NOT_PUBLISHED**. Código `bfb874ba5072fb1c2cfbdfc41883065008a61c30`, rama `codex/portal-local-reconcile-20261011`. Clasificación operativa; TORO Human Experience, Portal/Mi TORO, NEXT de la sección23 del Plan General. Conserva único Portal, marcas/ordinales, People/Cerebro/Alegra/FIN01 y autoridades existentes. Esta unidad no reinicia ni declara terminada la auditoría general.

**HECHO local:** `src/features/menu/server.ts` selecciona el lector canónico RPC ya aprobado para el menú de proyectos; una lectura reutilizada para disponibilidad y foco. En rpc_v1 no sondea los esquemas directos ni promueve tareas, caja, decisiones, reservas live o escritores que el payload no cubre. Identidad/organización/rol y revalidación tras I/O siguen en el adaptador aprobado, sin cambios. Errores, transporte incorrecto, lote vacío y contexto ambiguo cierran el acceso; no fallback directo. Las filas históricas se pueden inspeccionar como lote parcial, sin prometer vigencia. `portal-projects.ts` proyecta solo título/estado/prioridad/revalidación/fuente/fecha; sin IDs privados ni enlaces originales. Buscar navega al foco de proyectos; cada registro permite desplegar evidencia de fuente y fecha y volver al menú de Mi TORO. La fecha de lectura no se presenta como actualización del registro. Consulta muestra lote/tope25/total organizacional desconocido. Campo Buscar tiene contorno de foco explícito. No resolutor nuevo de documentos ni ampliación de datos.

**VERIFICADO:**67/67 pruebas dirigidas (menú/proyectos/server/source-aware, Mi TORO, Portal y RPC), incluidas7 nuevas; lint del delta aprobado, diff-check aprobado. Build Next16.3.8 y TypeScript aprobados, preflight16/16. Baseline641 y auditoría/build anteriores preservados, sin relanzar baterías completas ni sumar ejecuciones repetidas como pruebas nuevas. Dependencias/lock/SQL/adaptadorRPC idénticos. Auditoría runtime cero en su corte; braces dev abierto sin aceptación.

**QA real BLOQUEADA por sesión, no por permisos nuevos:** Chrome perfil existente llegó a Mi TORO anónimo y pidió login. Se abrió `/login?next=/my-toro` y se solicitó entrada humana, sin leer/escribir contraseña/token/cookie. No hubo sesión vigente durante este corte. Por tanto menú/Buscar→evidencia→retorno autenticados, móvil/teclado/foco del cambio y screenshot real siguen PENDIENTES; código/build/tests no sustituyen esa aceptación. Anónimo context/Owner Attention401 sin proyección/contexto, este último private/no-store. `/portal` anónimo390×844: ancho390 sin overflow, sin overlay ni consola error/warn. Esta comprobación no certifica el flujo autenticado. Segunda identidad real y documentos originales no aceptados.

**Límites y cierre:** SQL `921a2329976b5e6da8f2e14ea46dbca80c7e4717df28913a27188d79515b3b19` ya aplicado previamente; no se ejecutó SQL ni cambiaron permisos/esquemas/filas/cuentas/flags remotos. Sin push/PR/merge/deploy/publicación. FlagsRPC/read internos de proceso y writers deshabilitados; sin.env. Primer arranque rechazado por preflight de árbol sucio; se versionó el cambio local y se repitió sobre candidato limpio,16 checksPASS. Build nuevo aprobado; primer controlador cerró al recibir EOF y el segundo reutilizó ese BUILD_ID con control de cierre explícito. Servidor finalmente detenido a `2026-10-12T02:13:32.996694+00:00`, puerto3047 cerrado; viewportCDP anónimo restaurado. No se guardaron registros financieros, contenido de huéspedes o credenciales.

**Evidencia/recuperación:** `C:\Users\PERSONAL\Documents\Codex\2026-10-11\recibo-continuacion-portal-toro-md-actualizado\work\menu-search-qa`: backups de Plan/checkpoint/recibo y fuentes previas, receipts de build/live, logs de build, `anonymous.json`. Código6 archivos, sin fuentes/dependencias/SQL ajenos. Revert selectivo de `bfb874ba5072fb1c2cfbdfc41883065008a61c30` tras revisar deltas posteriores; no reset/clean/borrado. Plan/checkpoint previos preservados íntegros como prefijo. No tocar el SQL remoto para revertir esta unidad de frontend.

**NEXT único y criterio:** reabrir QA local autorizada con login humano vigente y demostrar menú/Buscar→evidencia permitida→retorno en390×844 y teclado, fuente/cobertura/foco sin errores, con captura censurada. Terminado solo con evidencia real, viewport restaurado y servidor detenido. No pedir de nuevo autorización del mismo alcance, ni fabricar identidad/grant. Si se descubre defecto, corregir/verificar solo el delta; no repetir auditoría.

### Superprompt breve vigente

Continúa desde la última sección del checkpoint canónico `C:\Users\PERSONAL\Documents\Codex\2026-10-11\task\integration\INTEGRACION_LOCAL_VALIDADA.md`, código `bfb874b`. Conserva Plan único, Mi TORO,641 baseline y auditoría. SQL YA APLICADO: no reejecutar. Única unidad: QA local menú/Buscar→proyectos→evidencia permitida→retorno con login humano vigente, móvil390×844 y teclado/foco. Reutiliza build y evidencia en `C:\Users\PERSONAL\Documents\Codex\2026-10-11\recibo-continuacion-portal-toro-md-actualizado\work\menu-search-qa` tras comprobar identidad de fuentes. No leer credenciales, repetir baterías, crear cuentas/permisos, escribir o publicar. No afirmar QA real mientras falte sesión. Captura censurada, restaura viewport, detén servidor y actualiza este mismo checkpoint.


## QA real menú/Buscar → evidencia permitida → retorno completada — 11/10/2026, 20:25 Costa Rica

Estado **MENU_SEARCH_PERMITTED_PROJECT_EVIDENCE_REAL_SESSION_MOBILE_KEYBOARD_QA_VERIFIED_NOT_PUBLISHED**. Este cierre sustituye el bloqueo de sesión y la reapertura temporal anteriores para este recorrido. HEAD documental previo `99602c06e4c8e6c6250eb1e67cff5c7903346778`, código funcional `bfb874ba5072fb1c2cfbdfc41883065008a61c30`, rama `codex/portal-local-reconcile-20261011`. TORO Human Experience / Portal, NEXT de sección23 del Plan General completado como consulta local acotada; no aceptación global del producto.

**HECHO / QA real:** entrada humana confirmada por Mauricio («ya ingrese») y sesión existente comprobada en IAB, mismo origen127.0.0.1:3047, Mi TORO / Dreamcatcher. Buscar «proyectos» → consulta `/my-toro?focus=projects.status#focus-heading` → desplegar «Evidencia permitida · TORO · Portafolio General» → `/my-toro#available-heading`.11 proyectos del lote, tope25 y total organizacional desconocido explícitos; cobertura parcial. Evidencia real presenta fuente autorizada operations.projects/Supabase/TORO, origen declarado, actualización del registro y lectura del lote como instantes distintos. No se transforma la fecha de lectura en prueba de vigencia ni se abre documento original. No se guardaron payloads, identidad privada, importes, nombres/contenido de huéspedes, contraseñas, cookies o tokens.

**Teclado y móvil verificados:** campo Buscar → Tab enfoca botón Buscar → Enter abre consulta; Enter abre/cierra la evidencia; summary enfocado con outline solid2px. Enter sobre Volver al menú y espera explícita de URL confirman desaparición de la consulta, campo Buscar disponible y Dreamcatcher conservado. Foco nativo tras navegación queda en BODY; no se certifica restauración de foco al encabezado. Menú queda visible. Primero viewport existente615px y después390×844: sin overflow horizontal (documento375px con scrollbar frente a viewport390); evidencia/retorno repetidos en móvil. Sin framework overlay ni console error/warn. Viewport reset confirmado615×548. Captura final limitada al entorno de proyectos/evidencia, sin filas financieras o huéspedes: `C:\Users\PERSONAL\Documents\Codex\2026-10-11\recibo-continuacion-portal-toro-md-actualizado\outputs\PORTAL_TORO_EVIDENCIA_MOVIL.png`.

**Conservado y no repetido:**67 pruebas dirigidas/7 nuevas, lint, build/TypeScript y preflight16 ya aprobados;641 baseline y auditoría anteriores intactos. Ninguna batería completa/auditoría relanzada ni conteo de ejecuciones repetidas como tests nuevos. Build ID `EqCDIhMHqheHIRlaSNqWG` reutilizado por igualdad de src/scripts/dependencias entre código y HEAD; no edición del código en esta QA. SQL/RPC/grants aprobados no se reejecutaron o modificaron. Sin permisos, escrituras, cuentas, push/merge/deploy/publicación ni.env. Flags internos/read/RPC solo de proceso; writers deshabilitados.

**Cierre y límites:** servidor detenido a `2026-10-12T02:25:18.792684+00:00`, puerto3047 cerrado, viewport restaurado. No segunda identidad real: aislamiento cruzado sigue sin aceptación. Evidencia aquí significa procedencia del registro ya autorizado, no acceso a archivos originales, reconciliación contable, censo completo o aceptación operativa global. Menú solo promueve proyectos cubiertos por la RPC; demás capacidades mantienen sus gates. Auditoría runtime cero en su corte; braces dev abierto sin aceptación.

**Evidencia / recuperación:** `C:\Users\PERSONAL\Documents\Codex\2026-10-11\recibo-continuacion-portal-toro-md-actualizado\work\menu-search-qa\authenticated-qa` contiene recibo estructurado de checks y backups exactos de Plan/checkpoint/recibo previos; runtime/readiness/cierre en `C:\Users\PERSONAL\Documents\Codex\2026-10-11\recibo-continuacion-portal-toro-md-actualizado\work\menu-search-qa\runtime-login-reopened`. Plan/checkpoint anteriores preservados íntegros como prefijo. Código reversible mediante revert selectivo de `bfb874b` tras revisar cambios posteriores; no reset/clean/borrado ni rollbackSQL por una reversión de frontend.

**NEXT único:** QA de aislamiento con segunda identidad real existente/autorizada cuando esté disponible, sin crear cuentas/permisos ni ampliar datos. Criterio: demostrar denegación del otro ámbito y lectura propia permitida, o registrar específicamente el recurso faltante. Este recorrido solicitado queda terminado; esa aceptación cruzada permanece separada y no se presume.

### Superprompt breve vigente

Continúa desde «QA real menú/Buscar → evidencia permitida → retorno completada — 11/10/2026, 20:25 Costa Rica» del checkpoint canónico `C:\Users\PERSONAL\Documents\Codex\2026-10-11\task\integration\INTEGRACION_LOCAL_VALIDADA.md`. Código `bfb874b`; conserva Plan único, Mi TORO,641 baseline,7 pruebas nuevas y auditoría. Recorrido real de proyectos/evidencia/retorno y móvil/teclado ya verificados: no repetirlos sin cambio. SQL YA APLICADO, no reejecutar. Única siguiente unidad: comprobar aislamiento con una segunda identidad real existente y autorizada, si está disponible; no crear cuentas ni grants. Si falta, registrar ese recurso pendiente. Solo QA local de lectura con RPC aprobadas; sin escrituras/publicación. Reutilizar build por identidad de fuentes, cerrar servidor/restaurar viewport y actualizar este mismo checkpoint con evidencia y un superprompt breve.


## Portal compacto e integrado: presentación y QA real — 11/10/2026, 20:52 Costa Rica

Estado **COMPACT_INTEGRATED_PORTAL_PRESENTATION_REAL_SESSION_QA_VERIFIED_LOCAL_NOT_PUBLISHED**. Código `2d2bef0f41e0e2f36ad2a3d1b709058caee2ec06`, rama `codex/portal-local-reconcile-20261011`; implementación base `d90e4e3`, corrección final de orden/anchor `2d2bef0`. Autoridad: nueva solicitud directa de Mauricio de compactar, usar columnas y continuar la integración. Unidad operativa TORO Human Experience, misma superficie Portal/Mi TORO, sección23 del Plan. El nuevo pedido prioriza esta unidad visual sobre la siguiente prueba de segunda identidad; esa aceptación continúa pendiente, sin fabricar cuentas/permisos.

**HECHO local:** nueve archivos del Portal. Mi TORO1240px con columnas principal/accesos, Buscar y consultas primero en DOM, atajos a Hoy/Finance y equipo, seis enlaces revisados y DreamTeam identificado como acceso TORO People con sesión propia. Consulta de proyectos en dos columnas de escritorio y evidencia/fuentes con jerarquía compacta. Hoy conserva exactamente su proyección:6 registros de resumen +44 expandibles de50 disponibles,145 seleccionados del lote en sesión real. Ya no afirma50 mostrados cuando solo seis quedan visibles inicialmente.47/72/148 leídos de comunicaciones/obligaciones/facturas, topes100/150/200; fuente/cobertura parcial y total desconocido siempre visibles. Tabla semántica de fuentes, moneda/importe originales y reglas de enlaces seguros conservadas. Guía del turno y directorio12módulos ajustados a la misma presentación. No nuevo producto, base o fuente de verdad.

**Revisión y correcciones:** revisión acotada de solo lectura detectó orden móvil visual distinto del DOM/Tab y anchor Buscar ofrecido a perfiles sin destino disponible. Ambos corregidos en2d2bef0. No CSS reorder móvil; atajo y sección comparten condición. Sin cambios de datos/RPC/SQL/grants/dependencias o estados de capacidades. Finance aquí sigue lectura acotada de prioridades/obligaciones/facturas; DreamTeam/link externo no se convierte en SSO, paridad funcional o conexión completa. Direccionamiento del directorio Dinero/Personas permanece pendiente como siguiente lote.

**VERIFICADO:**139/139 pruebas dirigidas en10archivos, incluidas7 nuevas (6panel +1DreamTeam); tras corrección,11/11 de Mi TORO repetidas y lint del delta aprobados. No sumar la repetición como tests nuevos.641baseline y7nuevas del lote anterior conservadas. Dos builds necesarios por corrección material: final Next16.3.8/TypeScriptPASS, preflight16/16, BUILD_ID `xao1vcdMGmVVaKyxV7wzZ`. Auditoría previa no relanzada: runtime cero en su corte; braces dev abierto sin aceptación. No publicación/push/merge/PR.

**QA real Chrome de Mauricio:** perfil navegador conectado3, sesión existente y Dreamcatcher confirmados por render permitido. Escritorio1280×900: columnas836/340px, documento1265px sin desborde, altura1239px y seis accesos; seis prioridades +44 restantes accesibles. Enter expande/contrae resto, mantiene foco y abre tabla de fuentes; guía interna tiene seis tarjetas/tres columnas y enlaceDreamTeam existente. Móvil390×844: una columna358px, sin overflow, orden visual=DOM; Buscar→proyectos→evidencia→retorno por Enter conserva Dreamcatcher; foco solid2px en summary. El foco nativo tras retorno sigue sin identidad de encabezado, no se certifica restauración específica. Directorio/portal:12módulos, una columna móvil sin overflow. Sin framework overlay ni console error/warn. Override CDP eliminado, viewport observado1280×631. Capturas `C:\Users\PERSONAL\Documents\Codex\2026-10-11\recibo-continuacion-portal-toro-md-actualizado\outputs\PORTAL_TORO_COMPACTO_ESCRITORIO.png` y `C:\Users\PERSONAL\Documents\Codex\2026-10-11\recibo-continuacion-portal-toro-md-actualizado\outputs\PORTAL_TORO_COMPACTO_MOVIL.png` sin filas financieras/importes/identidad privada/credenciales.

**Incidencia de acceso resuelta sin bypass:** IAB estaba en error interno data: tras servidor detenido; su política bloqueó control/navegación. No rawCDP, proxy ni cambio de seguridad para sortearlo. Se pidió apertura humana; Mauricio respondió «Chrome abierto», seleccionando otra superficie explícitamente. Mientras rebuild la pestañaChrome estaba en ERR_CONNECTION_REFUSED; una vez HTTP200 se recargó normalmente y funcionó con su sesión. Se conservaron intentos y evidencia. Anónimo previo: login200, context/Owner Attention401 sin proyección; gates/adaptador intactos en la corrección final.

**Runtime actual para revisión humana:** mismo Portal127.0.0.1:3047, activo temporalmente por un máximo3600s desde el readiness final, cierre automático aproximado `21:44 Costa Rica` o marcador `work/compact-portal/runtime-final/stop`. El cierre automático es control de vida de este proceso QA, no una automatización recurrente. Flags internos/read/RPC aprobados solo del proceso; writersfalse, sin.env/flags remotos. Esto sustituye el estado de servidor detenido del corte anterior mientras dure esta revisión local. No Portal publicado. No se asume que el proceso o sesión seguirán activos en la próxima tarea: comprobar receipt/puerto una vez. El resto de pendientes: aislamiento con segunda identidad, documentos originales sin resolver y aceptación Finance/People integral.

**Evidencia y recuperación:** `C:\Users\PERSONAL\Documents\Codex\2026-10-11\recibo-continuacion-portal-toro-md-actualizado\work\compact-portal`: backups, runtime inicial/final, builds, anonymous.json y closure/receipt.json. Plan/checkpoint como prefijo exacto conservado. Revert selectivo de d90e4e3/2d2bef0 tras revisar cambios posteriores; preserve aportes/dependencias/SQL aplicado, sin reset/clean/borrados. Antes de revertir código detener proceso local por su marcador. No rollbackSQL por un cambio visual.

**NEXT único y criterio:** consolidar las entradas Dinero y Personas de `/portal` con consulta/guía actuales y límites verificables, sin ampliar capacidades/grants. Terminado cuando cada entrada ofrece un destino permitido o estado pendiente honesto, con móvil/teclado y recuperación, registrándolo aquí. No repetir el lote visual ya verificado. Segunda identidad es límite pendiente separado.

### Superprompt breve vigente

Continúa desde «Portal compacto e integrado: presentación y QA real — 11/10/2026, 20:52 Costa Rica» en el checkpoint canónico `C:\Users\PERSONAL\Documents\Codex\2026-10-11\task\integration\INTEGRACION_LOCAL_VALIDADA.md`, código `2d2bef0`. Conserva Plan único, Mi TORO,641 baseline, pruebas nuevas y auditoría. SQL YA APLICADO: no reejecutar. Presentación compacta/columnas/Hoy/links/guía y QA real ya cerradas; no repetir sin cambios. Única unidad: unificar las entradas Dinero y Personas de `/portal` con las consultas y guía existentes, manteniendo disponibilidad verificable, permisos y sesión propia de DreamTeam. Corrige/prueba solo ese delta con móvil/teclado. No crear cuentas/grants, escribir o publicar. Reutiliza fuentes/build vigentes; confirma estado del servidor temporal. Segunda identidad sigue pendiente por separado. Actualiza este mismo checkpoint y deja otro superprompt breve; continúa en una tarea nueva.


## Portal único: Mi espacio, tarjetas completas y 50 ajustes — 11/10/2026, 21:34 Costa Rica

**Objetivo / HECHO:** una sola superficie TORO Portal (Human Experience, sección 23). Mi TORO se presenta como Mi espacio; conserva `/my-toro` y sus consultas. Código `ea4a3bfe1c48d59c259038109ce056e30bf6f9d1`; commits 742429a/5f890fe/d57887b/ea4a3bf.50 ajustes concretos en el recibo:tarjetas disponibles como enlaces completos, 6 accesos del hotel en portada,logos reales/columnas/accesibilidad.12 módulos:6 destinos/6 pendientes. Dinero abre lectura permitida o Hoy parcial; Personas abre guía#equipo y DreamTeam con sesión propia. Cierra el NEXT anterior de navegación Dinero/Personas, sin certificar paridad operativa.

**Verificado:** 69 pruebas dirigidas/9 nuevas; 17 rechecks no sumados. Lint/build/TypeScript/preflight 16 PASS, BUILD_ID `X7FdxFiIOn4m4muuLfVNH`. Chrome real1280×900/900×900/390×844/320×768 sin desborde/overlay/errores; Enter/Tab/retorno/anclas.6 logos cargados;5 assets activos únicos, 20.387 bytes y hashes comprobados. Anónimo sin tarjetas/links privados; APIs context/OwnerAttention 401 sin proyección. Viewport restaurado.641 base y auditoría previa conservadas; no reauditoría, SQL, grants, cuentas, escrituras operativas, env/remotos, publicación o nueva fuente de verdad.

**Decisiones/límites:** pending no es botón; Google es marca genérica. Master TORO vigente ausente en rutas/metadatos revisados; no usar legacy. Segunda identidad real y paridad Finance/People siguen pendientes. Retirada de hash al pulsar Portal dentro de la misma página no certificada. Corrección de fixture de rol y reapertura tras cierre de puerto documentadas en evidencia; no cambio de autoridad.

**Fuentes/evidencia/recuperación:** Plan único `docs/product/TORO_BRAIN_GENERAL_PLAN.md`; recibo `C:\Users\PERSONAL\Documents\Codex\2026-10-11\recibo-continuacion-portal-toro-md-actualizado\outputs\RECIBO_CONTINUACION_PORTAL_TORO.md`; QA/backups `C:\Users\PERSONAL\Documents\Codex\2026-10-11\recibo-continuacion-portal-toro-md-actualizado\work\portal-absorbed\closure`; marcas `public/brand/tools/provenance.json`. Portal 127.0.0.1:3047 temporal hasta aproximadamente 22:27 Costa Rica; runtime `work/portal-absorbed/runtime-ready/receipt.json`, cierre por marcador `stop`. Antes de seguir verificar una vez receipt/puerto. Revert selectivo de esta unidad tras revisar cambios posteriores/parar proceso; sin reset, rollbackSQL o pérdida de aportes ajenos. Prefijo anterior de Plan/checkpoint conservado.

**Bloqueador / NEXT único:** Recuperar el master vigente del logo TORO por su ubicación/ID exacto y verificar el SHA aprobado antes de incorporarlo al Portal. Archivo esperado `/TORO/Brand/01_Master/TORO_BRAIN_LOGO_MASTER_v1.png`, SHA 8828b0d89b1fb2dc9aa2127c39c3322a7b6dc018f8c1baece7a7bf69f4457a98. Criterio: activo exacto intacto una vez en cabecera, QA móvil/teclado del delta, o recurso faltante registrado.

### Superprompt breve vigente

Continúa en una tarea nueva desde «Portal único: Mi espacio, tarjetas completas y 50 ajustes — 11/10/2026, 21:34 Costa Rica» del checkpoint `C:\Users\PERSONAL\Documents\Codex\2026-10-11\task\integration\INTEGRACION_LOCAL_VALIDADA.md`, código `ea4a3bf`. Portal/Mi espacio, Dinero/Personas, 50 ajustes y QA están cerrados; no repetir fuentes o pruebas ajenas. Única unidad: localizar el master TORO vigente por ID/ruta exacta, comprobar SHA 8828b0d89b1fb2dc9aa2127c39c3322a7b6dc018f8c1baece7a7bf69f4457a98 e incorporarlo intacto; si no hay evidencia, registrar el recurso faltante. Conserva Plan, 641 base, pruebas nuevas, auditoría y RPC. SQL YA APLICADO: no reejecutar. Sin redibujar, grants, cuentas, escrituras operativas ni publicación. Actualiza este mismo checkpoint y deja otro superprompt breve.


## Reglas visuales del Portal y maestro corregido — 11/10/2026, 22:17 Costa Rica

**Objetivo / HECHO:** elevar presentación en la superficie existente, sección 23 del Plan (Human Experience). Reglas permanentes `docs/product/TORO_PORTAL_DESIGN_RULES.md`, referenciadas en AGENTS/START_HERE. Cuadrícula a todo el ancho, módulos 4/3/2/1 columnas, herramientas 3/2/1, acento por área, base azul/cian/dorado, cabecera compacta, texto auxiliar mínimo12px, logos reales72×64 sin alterar bytes y tarjetas completas con foco. Ordinales00–11, seis destinos/seis pendientes, seis herramientas, gates, consultas Dinero/Personas y fuentes intactos. CSS compartido aplica también a Mi espacio. Revisión detectó compresión del lateral a900px; corregida con columnas según ancho real del panel. Código d0d3391 + `d7dc84ce923b4137c1543419f6cfaa96aa7191b0`; misma rama local.

**Verificado:**64/64 pruebas dirigidas en6archivos, sin nuevas pruebas ni suma al baseline641. Lint delta, build/TypeScript y preflight16 PASS; BUILD_ID `BvIdFb42h4Fp9AtlI3X5Z`. Chrome real1280×900/1000×900/900×900/390×844/320×768:12módulos+6herramientas, logos6cargados, sin overflow de documento/tarjetas ni console error/warn. Enter ancla herramientas; Tab desde Dinero salta pendientes hacia Operaciones con foco dorado; Enter Dinero abre Mi espacio y retorno Portal conserva contexto. Mi espacio a900px: lateral267px/una columna/sin overflow y atención existente visible tras esperar render. Viewport restaurado1280×575. Pares de contraste de texto/fondos representativos incluidas acciones/hover/active >=4.5:1; no certificación de todos los estados de otras superficies. Altura portada1280:1734→1622px (6.5%); tarjetas289→246px y módulos4filas→3, sin columna lateral vacía. Se conserva aire para lectura.

**Corrección de autoridad / BLOQUEADOR:** el NEXT previo que pedía8828 queda supersedido: `TORO_BRAND_CONTRACT.md` CURRENT23/09 declara8828 LEGACY y maestro TORO `15a1b661a12cc020b905188e1638d001cc0a21d2a2f47beb4077843b478be747` en `/TORO/Brand/01_Master/TORO_LOGO_MASTER_v1.png`. AGENTS/START/context reconciliados; alias isotype/manifiesto conservados como históricos. No bytes locales recuperados. En ambos Dropbox: búsqueda de nombre vigente0, metadatos exactosNOT_FOUND y búsqueda del alias histórico isotype con mismo hash0. No se ha verificado hash de archivo ni incorporado logo TORO; cabecera tipográfica conservada. Único recurso faltante: ubicación/ID accesible del archivo exacto. No nuevas búsquedas equivalentes sin evidencia de ubicación. No redibujo ni sustituto.

**Conservado / límites:** Plan único,641base/pruebas previas/auditoría y accesos. Auditoría anterior no repetida; braces dev sigue abierto en su corte. SQL/RPC/grants no ejecutados/modificados. Sin cuentas, datos operativos, permisos, dependencias, env/remotos, push/PR/merge/publicación o costos. Finance/People integral y segunda identidad siguen pendientes; cambios visuales no prueban esas capacidades. No nueva aceptación de retirada de hash al pulsar Portal en la misma página.

**Fuentes / recuperación:** reglas/contrato/Plan en el repo; checkpoint canónico y recibo existente actualizados. `work/portal-design/browser-qa.json`, runtime y closure:preflight/build/contraste/logo/recibos/backups. Capturas `outputs/PORTAL_TORO_DISENO_ESCRITORIO.png` y `PORTAL_TORO_DISENO_MOVIL.png`, sin datos privados. Plan/checkpoint previos conservados como prefijo exacto. Revert selectivo de d0d3391/d7dc84c tras revisar trabajo posterior y detener proceso propio por `work/portal-design/runtime/stop`; sin reset/clean/rollbackSQL. Servidor anterior detenido22:10; candidato127.0.0.1:3047 temporal hasta aprox.23:11 Costa Rica, flags read/RPC solo del proceso y writersfalse. Esto sustituye el corte temporal22:27 anterior.

**NEXT único / terminado:** recuperar maestro mediante recurso exacto nuevo y verificar bytes antes de incorporarlo intacto una vez en cabecera; QA móvil/teclado del delta. Si el recurso continúa ausente, registrar específicamente ese bloqueo, sin afirmar incorporación.

### Superprompt breve vigente

Continúa en una tarea nueva desde la última sección «Reglas visuales del Portal y maestro corregido» de `C:\Users\PERSONAL\Documents\Codex\2026-10-11\task\integration\INTEGRACION_LOCAL_VALIDADA.md`. Código d7dc84c; aplica `docs/product/TORO_PORTAL_DESIGN_RULES.md`. Única unidad: recuperar el archivo `TORO_LOGO_MASTER_v1.png` por un ID/ruta accesible verificable, comprobar SHA 15a1b661a12cc020b905188e1638d001cc0a21d2a2f47beb4077843b478be747 e incorporarlo intacto. El maestro 8828 es legacy; las búsquedas exactas actuales y del alias ya dieron cero, no repetirlas sin nueva ubicación. Si falta el recurso, registrar el bloqueo. Conserva Plan, Mi espacio, 641 base, pruebas, auditoría y RPC. SQL YA APLICADO. Sin redibujar, permisos, escrituras operativas ni publicar. Verifica solo el delta móvil/teclado y actualiza este mismo checkpoint.

## Portada diaria día/noche: diseño preparado, pendiente de aprobación — 11/10/2026
Objetivo: rediseño local de cabecera/portada, Human Experience sección 23. Estado verificado: rama codex/portal-local-reconcile-20261011, HEAD f0d8c3d, código d7dc84c; árbol limpio antes de este registro. Puerto 127.0.0.1:3047 observado escuchando, PID34204; receipt anterior en recibo-continuacion-portal-toro-md-actualizado/work/portal-design/runtime/receipt.json. No se detuvo ni sustituyó build.
PROPUESTO: cabecera compacta; Tu día primero con atención, reservas, huéspedes, equipo, documentos y consulta financiera según gates existentes; cotización/agenda/guía como accesos secundarios; después doce módulos existentes, mismos nombres/ordinales/destinos. Día blanco/gris cálido y noche carbón, acentos discretos; preferencia visual local. Densidad mediante menos repetición/espacio, texto >=12px y objetivos >=44px. Cobertura parcial visible y detalle accesible. Recomendación basada en flujo/código existente, sin métricas de uso disponibles.
Referencia visual: C:\Users\PERSONAL\Documents\Codex\2026-10-11\mauricio-pide-continuar-esta-ejecuci-n\outputs\PORTAL_TORO_CONCEPTO_DIA_NOCHE.png. Es concepto generado, no captura de implementación. Sus nombres/ordinales abreviados de módulos no son autoridad: conservar exactamente portalDomains de src/features/portal/model.ts. No incorporar esta imagen como interfaz ni crear logos. Maestro exacto pendiente sin nueva búsqueda.
Bloqueador: brainstorming/SKILL.md exige aprobación humana del diseño breve antes de modificar código. Sin implementación, tests nuevos ni QA certificada en esta unidad; no SQL/escrituras/permisos/publicación. Baseline/pruebas previas conservados.
Única siguiente acción: aprobar el diseño breve y ejecutar su delta local. Terminado: reglas actualizadas, implementación y pruebas dirigidas, QA escritorio/móvil/teclado/contraste/overflow en ambos temas y checkpoint reconciliado. Recuperación: parar runtime propio por marcador stop y esperar cierre antes de rebuild; commits locales selectivos, conservar aportes ajenos.
Superprompt: Continúa desde esta sección, sin releer fuentes no relacionadas. Si Mauricio aprueba, implementa únicamente cabecera/portada día/noche sobre los componentes existentes, preserva nombres/gates/RPC y reglas. SQL YA APLICADO. Verifica solo delta y componentes compartidos; actualiza este mismo Plan/checkpoint/recibo. Sin dependencias, push/PR/merge/publicación.

## Render del Portal completo mobile first — 11/10/2026, 22:46 Costa Rica
PREPARADO, NO IMPLEMENTADO. Nuevo pedido supersede el concepto anterior de Tu día: portada Portal TORO completa, móvil primero, densidad por componentes compactos sin reducir legibilidad/objetivos táctiles, color por áreas y logos reales, día/noche, tips/humor/motivación discretos y descartables, transiciones suaves con reduced-motion. Mantener Plan 00–11, nombres y destinos exactos, estados textuales y cobertura parcial visible. Mapa visual de capacidades propuesto como esquema conceptual; gráficos cuantitativos requieren datos/fuente/fecha verificables.
Render: C:\Users\PERSONAL\Documents\Codex\2026-10-11\mauricio-pide-continuar-esta-ejecuci-n\outputs\PORTAL_TORO_RENDER_MOBILE_FIRST.png. Imagen generada: no es QA, viewport real ni UI funcionando, aunque haya etiquetas de presentación que lo sugieran. Sus reproducciones de marcas no certifican bytes: para implementación usar exclusivamente assets intactos existentes. Seis hashes de public/brand/tools/provenance.json comprobados PASS; maestro TORO ausente sin nueva búsqueda ni sustituto. Conservar tipografía TORO. Disponible en render significa destino/guía permitido, no capacidad integral; usar estados exactos de model.ts en código.
Hora/clima: corte consultado 22:46 Costa Rica, Santa Teresa Puntarenas, 23C/nublado; referencia temporal del render, no feed integrado. Chrome: CUA inventario verificó extensión existente en dos perfiles; lectura/captura de páginas seleccionadas es TARGET bajo TORO Tools/Systems, no nueva integración activa ni ingestión automática. No consultar historial/marcadores restringidos ni mezclar fuentes personales/hotel. Solo guardar evidencia con URL/fecha/alcance y autorización adecuada.
CURRENT: código d7dc84c, HEAD documental f0d8c3d, sin cambios de interfaz en este lote. Plan/checkpoint/recibo y reglas reciben únicamente este registro. SQL/RPC/gates/baseline intactos. Sin nuevas dependencias, instalaciones, acceso, publicación ni costos contratados.
Única siguiente acción: aprobar esta dirección visual para implementar el delta local completo y verificar escritorio/móvil/teclado/contraste/desborde en ambos temas. Criterio: presentación real, estado honesto de fuentes, recursos originales y QA del delta, sin declarar implementadas animaciones/feed/conector antes de prueba.
Superprompt: Continúa desde esta sección del checkpoint canónico. No repitas lecturas ajenas ni búsquedas de logo sin nuevo ID. Tras aprobar el render, cambia solo presentación sobre componentes existentes; nombres 00–11, Mi espacio, permisos, enlaces y cobertura intactos. Hora/clima/Chrome son propuestas hasta integración verificada. Detén runtime propio por stop y espera cierre antes de rebuild. SQL YA APLICADO; sin producción. Actualiza los mismos registros.

## TORO: navegación diaria, herramientas y proactividad — dirección aprobada 11/10/2026
**Clasificación:** TARGET bajo sección23, TORO Human Experience/Tools; referencias Dinero, Clientes, Operaciones, Personas, Crecimiento, Sistemas e Identity/User Vault. Mauricio aprobó la dirección visual y pidió este refinamiento de estructura y render antes de decidir implementación. No activa capacidades, otros negocios, grants, writes o automatizaciones. Subsistemas existentes, sin plan paralelo. Marca visible solo TORO; maestro ausente continúa tipográfico.

### Pantallas y prioridades
| Pantalla | Información inicial | Detalle / siguiente acción |
|---|---|---|
| Inicio | Contexto/proyecto autorizado, urgencias, favoritos del usuario y resumen corto | Abrir alerta con responsable, plazo, fuente y acción; ver catálogo completo |
| Operación | Pestañas Ocupación, Entradas, Salidas, Reservas nuevas, Limpieza, Mantenimiento | Filtros fecha/estado, filas habitación/hora/preparación/responsable y acceso al sistema original |
| Dinero | Pestañas Bancos, Facturación, Cobros, Gastos, Caja | Período/fecha, cuenta/entidad, CRC/USD separados, procedencia/cobertura y pendientes |
| Herramientas | Buscador, favoritas y todas las permitidas por secciones | Recepción/POS, Comunicación/TERE/WhatsApp, Equipo, Finanzas, Documentos, Crecimiento, Sistemas; utilidades calculadora/traductor |
| Cerebro | Mapa/lista equivalentes de los objetos autorizados | Conservar módulos00–11, vínculos al objeto y evidencia; no duplicar trabajo |
| Mi espacio | Trabajo personal del usuario y preferencias | Personal privado separado de organización, herramientas propias y transición explícita de contexto |

Mobile-first: Inicio/Operación/Dinero/Herramientas/Más; Más conserva Cerebro, Mi espacio y los módulos, sin renombrar IDs/rutas. Escritorio amplía navegación sin otra IA. Volver conserva contexto, filtro y selección permitida; al cambiar contexto se vacían datos/favoritos/caché del ámbito anterior antes de cargar el siguiente. Selector distingue negocio/propiedad/proyecto de contexto Personal; solo membresías y proyectos autorizados. No onboarding externo por añadir un selector. Vista recepción privilegia turno; dueño excepciones/caja/decisiones; mantenimiento asignaciones; finanzas controles permitidos. El resumen del hotel existe exclusivamente en su ámbito.

### Catálogo y enlaces
Inicio muestra favoritos individuales, nunca el único inventario. Catálogo único existente, búsqueda global por tarea/programa y categorías, favoritos por usuario/contexto, destinos secundarios desplegables y estado de sesión. Todos los destinos autorizados deben ser localizables; no todos son públicos ni disponibles para cualquier rol. Conserva el directorio/RPC existentes: actualmente proyecta seis enlaces revisados. Ampliar esa proyección requiere revisar y validar cada destino y control en el carril vigente, sin exponer el registro mixto completo. No ampliar grants para hacer visible una tarjeta. Destino desconocido = recurso pendiente con explicación, nunca href ficticio.
- POS confirmado en sesión Kross: https://dreamcatcherhotel.krossbooking.com/admin/pos. Precio/cesta/cargo a habitación/recibo efectivo-tarjeta observados; ninguna venta registrada. Favorito de recepción propuesto; no se modificó el directorio.
- Kross, motor, WeSpeak, DreamTeam, Calendar y Dropbox: conservar los seis destinos actuales.
- WhatsApp: https://web.whatsapp.com/ verificado como entrada pública, sin lectura de mensajes ni envío; sesión/canal/perfil propio. Alegra: https://app.alegra.com/ entrada pública verificada; no demuestra sesión de una entidad concreta.
- TERE: especialista existente, no nuevo bot. Acceso al canal/ficha autorizada pendiente de identificar; no inventar teléfono, wa.me ni ruta. WeSpeak es acceso existente a comunicaciones, no prueba de una conversación TERE activa.
- Chrome: extensión existente observada en perfiles3/4; captura seleccionada y evidencia URL/fecha/ámbito son TARGET, no feed/ingestión automática. Conservar restricción de marcadores/historial y privacidad personal/hotel.

### Fuentes y métricas sin falsas equivalencias
Kross en sesión11/10: dashboard expone reservas, habitaciones ocupadas%, alojados, cobros previstos, llegadas/salidas, reservas recibidas/caducidad, cobros y gráficos procedencia30d/ocupación futura. Evidencia de UI actual, no conector E2E ni feed permanente. Para tarjetas TORO exigir fuente/corte/zona horaria, definición y cobertura; cero solo si está comprobado, desconocido nunca cero. Ocupación: habitaciones ocupadas/denominador disponible verificado; reservas nuevas por creación, no fecha de estancia; entrada/salida prevista separada de completada; canceladas/no-shows explícitos. Limpieza/Mantenimiento requieren fuente y responsable/estado actual; existencia de menú no verifica trabajo físico. Mirror histórico no se vuelve live por diseño.
Alegra: lectura getbanks nativa exitosa de primera conexión autorizada, página5/18, y página10. Consulta query=CAJA devolvió también otras cuentas: filtro no respetado, no asumir subconjunto caja. Tipos bank/cash/tarjeta y monedas se inspeccionaron sin publicar balances. Hay cuenta nominal de caja clasificada bank: nombre/tipo no bastan para identificar caja chica real. Entidad, cuenta exacta y moneda por defecto deben reconciliarse antes de mostrar finanzas del hotel. No consolidar otras conexiones o cuentas personales. Catálogo documenta reportes de ventas, flujo caja, balance y movimientos; callable no acredita adapter TORO o resultado actual. Bancos en Alegra = saldo contable; banco/procesador y conciliación prueban movimiento/disponible. Facturación, ingreso devengado, cobro, gasto, pago y valor reserva son campos distintos. Mes corriente siempre parcial con corte; CRC/USD originales separados sin conversión implícita. Gráficos solo con datos verificables; render usa guiones/sin conectar.

### Caja, calculadora y traductor
Caja física por responsable/turno/fecha/ubicación. Dos pestañas CRC y USD con denominaciones configurables, cantidades enteras no negativas, subtotal y total decimal; total moneda=sum(denominación*cantidad). Esperado por moneda=fondo inicial+cobros efectivos-retiros/pagos efectivos documentados. Diferencia=contado-esperado. Si falta esperado, diferencia desconocida. No mezclar POS total, ventas o tarjetas con efectivo; no convertir USD/CRC ni incluir saldo bancario. Conteo preparado/no registrado hasta journal permitido verificado; diferencia permanece abierta, no asiento compensatorio ni cierre automático. Recibo y relevo según flujo finance existente, sin otro ledger.
Calculadora simple y decimal con borrar/copia; resultados aislados del libro contable. Traductor ES/EN/otros, tono huésped, original/resultados visibles y edición/copia; servicio/proveedor/privacidad por validar. Nunca enviar traducción automáticamente ni transferir datos sensibles sin destino/scope autorizado.

### Alertas, agentes y servicio proactivo
Urgencias arriba: severidad/plazo/impacto/bloqueo/responsable, dedupe por objeto y fuente, sin inventar counts. Sin señal fresca mostrar desconocido/desactualizado. Franja informativa fija compacta bajo menú: TORO, TERE, RICO, FIONA, SKY, SOBRESITO; color+texto Trabajando/Esperando/Bloqueado/Sin señal. Trabajando solo por ejecución/lease/evento vigente con TTL y evidencia, no gateway saludable ni agente configurado; sin señal al expirar. Movimiento discreto solo durante señal real, reduced-motion y detalle accesible con control44px. No dashboard/agent/runtime adicional.
TORO coordina y mejora; TERE pre-llegada/bienvenida/checkin/estancia/checkout/post-estancia/reviews; RICO readiness/limpieza/mantenimiento; FIONA caja/conciliación; SKY promos/redes/reputación; SOBRESITO conexiones y calidad. Proactividad por evento y trabajo canónico: detectar/preparar, verificar fuente/identidad/consentimiento/idioma/ventana y permisos, revisar o ejecutar dentro de autoridad existente, registrar recibo/resultado. Retries acotados, idempotencia/no reenvío, una tarea por objeto entre Portal/WhatsApp/email; canal habilitado no entrega. Esta dirección no autoriza mensajes, respuestas públicas, precios/promos ni nuevas automatizaciones. Experto por programa exige fichas/capacidades y escenarios verificados, frescura y abstención ante brechas; no título global sin evidencia.

### Criterio de diseño y entrega
Referencia visual nueva conserva dirección aprobada; render es conceptual y estados/marks reproducidos no prueba de conexión ni bytes. Assets originales de seis marcas actuales hashesPASS; TORO maestro sigue ausente. Nuevos logos (WhatsApp/Alegra/Chrome) requieren origen y bytes exactos antes de implementación. No regresión de los12módulos/gates/baseline641/SQL aplicado. Datos operativos y privados no se incorporan al render. Texto>=12px, botones44px, foco/contraste4.5:1, tabs accesibles/teclado y sin desborde320px, día/noche, reduced-motion; pruebas futuras del delta y componentes compartidos.
**Única siguiente unidad:** implementar localmente la navegación/cabecera/Inicio y acceso a Herramientas de esta dirección aprobada, con estados honestos de capacidades pendientes, conservando gates/RPC; probar su delta. Caja/reportes/feeds/envíos se mantienen TARGET hasta implementación y verificación específicas, sin inventar funcionamiento. Antes de rebuild detener proceso propio por marcador stop y esperar cierre. Sin SQL, permisos, producción, dependencias, push/PR/merge.

## TORO V1: integración, sesión común y 100 refinamientos — 11/10/2026
**Autoridad y estado:** solicitud directa de Mauricio; Human Experience sección23 y contratos Identity/People/Tools/Comms/Revenue/Finance. Diseño previo aprobado; este lote refina antes de construir. Todos los100 criterios siguientes son TARGET, no100funciones activadas. Las pantallas son subviews de los módulos00–11 existentes. No otra base, identidad, scheduler, app o agente. Producto universal con perfiles por negocio y Personal; Dreamcatcher sigue proving ground, nuevo proyecto no equivale a nuevo negocio habilitado.
**Cambios de dirección:** marca tipográfica TORO con descriptor pequeño OPERATION SYSTEM solicitado; contexto/proyecto arriba; DreamTeam dentro de Personas con sesión común; barra multimodal; habitaciones/precio del día y cotizador; Precios/SP04; Finanzas completa con CRC/USD simultáneos desplegables; Reportes; Capacitación/Mejora; Google/Chrome y revisión semanal subordinada. No habilitar autonomía por estética.

### Evidencia puntual y límites vigentes
- Login Portal usa Supabase; copy actual admite segundo login DreamTeam. Personas ofrece guía/enlace con sesión propia. TORO_PEOPLE_DREAMTEAM_INTEGRATION.md y TORO_PEOPLE_CODE_MIGRATION_V1.md declaran identidad/contexto comunes como destino; SSO recíproco NO verificado. Importar lógica/vistas People bajo shell/IdentityTORO, comenzando lectura propia horario/asistencia/solicitudes. No copiar cookies/tokens entre sitios, iframe con login alterno ni grants implícitos. Probar entrada desde ambos, expiración/revocación/cierre, roles/RLS y segundo usuario antes de retirar legacy. No modificarSQL aplicado.
- WidgetKross: lista autenticada contiene2–7; candidatosTORO ES6 y EN7; ES6 leído en /admin/widget/view/id/6, motor dreamcatcherhotel, versión9. Instalación publica CSS/JS https://data.krossbooking.com/widget/v6/dreamcatcherhotel/6.css y6.js, div.kross-container y dependenciajQuery3.4.1. No se guardó configuración ni se hizo búsqueda/reserva. Integración candidata debe aislar script/estilos/CSP según instrucciones y probar teclado/responsive/conflictos, destino y ausencia de writers; no añadir dependencia legacy al core sin evaluación. URL administrativa no es widget público ni certifica resultado embebido.
- SP04 localizado actualmente en C:\Users\PERSONAL\OneDrive\Documentos\ChatGPT\New project\dreamcatcher-revenue\docs\SP04-RESULTADOS.md. Implementación local previa de observación/calendario/evidencia/paridad con límites comerciales; no aceptación live actual. Conservar sus observaciones/hash/fuentes, no reejecutar344tests ni inventar otro rate-shopper. Puente Revenue/Agencies en docs/superpowers/plans/2026-09-14-toro-os-revenue-bridge.md es otro alcance relacionado, no sustituyeSP04. Vincular como Precios en Clientes/Crecimiento/Dinero con identidad común; URL publicada/SSO/adapter actual pendientes de verificación.
- Chrome: conector existente permite lectura/captura seleccionada, no browser completo dentro de una web. Target Portal=panel nativo con fuente/fecha/resumen/abrir original; evolución posible Side PanelTORO junto a Chrome, primero evaluar extensión existente. GoogleLogin es identidad; Gmail/Drive/Calendar requieren autorización y scopes separados. Iframes/OAuth/controles del proveedor se respetan.
- Correo reserva=señal. Usar canal/binding/worker existentes, historialincremental/idempotencia y fuenteKross; si falta señal diagnosticar y preparar notificaciones mínimas, sin activar scopes/reenvíos/settings/suscripciones ahora. APIKross en un par de meses es intención FUTURE condicionada a contrato/costos/permisos/prueba, no API ya contratada ni fecha programada.
- Revisión semanal=TARGET del flujo existente: evidencias/cobertura/costos/incidencias/UX, propuesta priorizada, pruebas/dryrun y rollback. Cambios sensibles conservan aprobación. No Codexheartbeat ni scheduler nuevo en este lote.

### 100 criterios adicionales de diseño y aceptación
Identidad y navegación — TORO Identity/Human Experience
- [V1-001] Una identidad TORO por persona, sin cuentas duplicadas por herramienta.
- [V1-002] Entrada DreamTeam permite llegar al Portal con sesión común verificada.
- [V1-003] Entrada Portal permite abrir Personas sin segundo login verificado.
- [V1-004] Cierre, expiración y revocación coherentes en ambas entradas.
- [V1-005] Selector solo ofrece ámbitos/proyectos con autorización comprobada.
- [V1-006] Crear proyecto dentro del ámbito permitido, sin crear negocio/grants implícitos.
- [V1-007] Cambio de ámbito limpia datos, búsqueda y adjuntos previos.
- [V1-008] Personal privado mantiene herramientas y archivos fuera del hotel.
- [V1-009] Favoritos individuales por ámbito, catálogo completo siempre localizable.
- [V1-010] Menú móvil por rol preserva00–11 y rutas actuales.
Comando multimodal — TORO Tools/Comms/Actions
- [V1-011] Barra única acepta solicitud o búsqueda y explica la intención detectada.
- [V1-012] Adjuntar archivo muestra nombre/tipo/tamaño y destino antes de registrar.
- [V1-013] Adjuntar foto ofrece interpretación con incertidumbres y evidencia original.
- [V1-014] Audio muestra transcripción editable antes de preparar una acción.
- [V1-015] Confirmación visual separa interpretación, borrador y ejecución.
- [V1-016] Pedir reserva recoge fechas/ocupantes y confirma precio vigente en Kross.
- [V1-017] Crear tarea reutiliza objeto canónico con responsable/plazo/ámbito.
- [V1-018] Acciones no permitidas muestran límite y alternativa segura.
- [V1-019] Solicitudes largas muestran progreso/estado real y posibilidad de cancelar.
- [V1-020] Recibo permite abrir evidencia y resultado del mismo objeto.
Operación hotel — TORO Operaciones/Clientes/Activos
- [V1-021] Habitaciones vacías por fecha, identidad y disponibilidad Kross fresca.
- [V1-022] Tarifa del día con ocupación/régimen/moneda/impuestos/condiciones visibles.
- [V1-023] Habitaciones limpias, ocupadas, bloqueadas y fuera de servicio separadas.
- [V1-024] Entradas ordenadas por hora/preparación, previstas distintas de completadas.
- [V1-025] Salidas distinguen horario previsto, salida real y relevo de aseo.
- [V1-026] Nuevas reservas filtradas por creación, con cancelaciones/no-show separados.
- [V1-027] Notas de reserva mantienen autor/fecha/restricción y pendientes de lectura.
- [V1-028] Aseo muestra asignación, inspección y evidencia antes de declarar habitación lista.
- [V1-029] Mantenimiento vincula habitación/incidente/prioridad y cierre con evidencia.
- [V1-030] Relevo de turno agrupa cobros/notas/preparación sin duplicar tareas.
Cotización y precios — TORO Clientes/Crecimiento
- [V1-031] Reutilizar widgetsKross ES6/EN7 existentes, sin crear duplicados.
- [V1-032] Fechas en dos columnas móvil cuando mantenga lectura y44px.
- [V1-033] Huéspedes incluye adultos/niños/edades por habitación cuando aplique.
- [V1-034] Resultado distingue precio total/noches/impuestos/política/disponibilidad.
- [V1-035] Búsqueda cotizador no se presenta como reserva confirmada.
- [V1-036] IncorporarSP04 y su evidencia al ámbito correcto sin nueva fuente de tarifas.
- [V1-037] Paridad OTA compara mismo producto/fecha/ocupantes/régimen/cancelación/promoción.
- [V1-038] Diferencia de moneda/impuestos/extras explica variación antes de alertar.
- [V1-039] Cada reserva nueva genera revisión idempotente de tarifa/cargos/condiciones.
- [V1-040] Precio dudoso produce excepción, nunca ajuste de canal automático sin autoridad.
Finanzas y cierre — TORO Dinero/FIONA
- [V1-041] Dinero contiene Bancos/Facturación/Cobros/Gastos/Comprobantes/Caja/Conciliación.
- [V1-042] CRC yUSD simultáneos en resumen, detalle desplegable por moneda.
- [V1-043] Conteo físico usa denominaciones/cantidades/subtotales y validación decimal.
- [V1-044] Esperado usa fondo inicial y movimientos efectivos documentados por moneda.
- [V1-045] Diferencia desconocida si falta esperado; cero solo comprobado.
- [V1-046] Cada comprobante enlaza movimiento/reserva/proveedor y original custodiado.
- [V1-047] Cobros previstos, realizados, pendientes y liquidados no se mezclan.
- [V1-048] Cierre revisa tarjeta/efectivo/transferencia/OTA y recibos sin doble conteo.
- [V1-049] SaldoAlegra rotulado contable; banco/procesador prueban efectivo disponible.
- [V1-050] Mes parcial y conciliación pendiente conservan corte/moneda/responsable.
Personas y aprendizaje — TORO People/Knowledge
- [V1-051] DreamTeam aparece como Personas dentro del shellTORO.
- [V1-052] Mi turno muestra horario/autorización/contexto vigente.
- [V1-053] Asistencia propia conserva marcaciones originales y correcciones auditables.
- [V1-054] Jefatura ve cobertura de equipo dentro del rol permitido.
- [V1-055] Solicitudes y aprobaciones usan flujoPeople existente.
- [V1-056] Nómina/préstamos/liquidaciones quedan restringidos y fuera de recepción.
- [V1-057] Capacitación por rol enlaza SOP/documento fuente vigente.
- [V1-058] Práctica guiada usa escenarios, sin generar operación real.
- [V1-059] Evaluación registra evidencia de aprendizaje, no presume competencia.
- [V1-060] Lecciones por incidentes alimentan mejora sin exponer datos privados.
Datos, catálogo y reportes — TORO Data/Tools
- [V1-061] Buscar datos mediante vistas/consultas autorizadas, no acceso irrestricto a tablas.
- [V1-062] Cada resultado informa fuente/fecha/cobertura y objeto canónico.
- [V1-063] Correcciones de datos conservan autor/evidencia y autorización aplicable.
- [V1-064] Catálogo por tarea/programa/ámbito agrupa destinos principales y secundarios.
- [V1-065] Linkdesconocido se presenta pendiente, sin botón muerto niURL inventada.
- [V1-066] Reportes Operación/Finanzas/People/Comercial/Sistemas conservan filtros.
- [V1-067] Informe diario abre pendientes, responsable, próximo paso y fuente.
- [V1-068] Informe semanal distingue avance preparado/ejecutado/verificado/beneficio.
- [V1-069] Exportación respeta datos visibles/moneda/fecha y sensibilidad.
- [V1-070] Gráficos tienen unidad/definición/corte; sin fuente no muestran números.
Google y Chrome — TORO Comms/Tools/Systems
- [V1-071] Gmail autorizado alimenta señales/evidencia, no autoridadPMS.
- [V1-072] Calendar muestra agenda por cuenta/ámbito y conserva permisos.
- [V1-073] Drive conserva originales/ownership y referencias, sin copias paralelas innecesarias.
- [V1-074] Sheets/Docs complementan reportes/documentos bajo autoridad existente.
- [V1-075] Contacts enlaza identidad corroborada; teléfono solo no identifica empleado.
- [V1-076] Tasks/Keep se evalúan frente al gestor existente antes de crear listas.
- [V1-077] Googlelogin separado de autorización de Gmail/Drive/Calendar.
- [V1-078] Chrome captura página/selección elegida conURL/fecha/ámbito y minimización.
- [V1-079] Portal presenta panelnativo yAbriroriginal cuando embebido no es soportado.
- [V1-080] SidePanelChrome futuro evalúa extensión existente y acceso temporalactiveTab.
Comunicación proactiva — TORO TERE/SKY
- [V1-081] Buzón/binding existente detecta nueva reserva conhistorialincremental.
- [V1-082] Señal perdida/vencida recupera sincronización y evidencia, no silencio indefinido.
- [V1-083] Ausencia de notificaciones diagnostica y prepara activaciónmínima revisable.
- [V1-084] Mensaje entrante pegado genera respuesta editable conidioma/tono.
- [V1-085] Audio huésped genera transcripción y borrador; datos sensibles protegidos.
- [V1-086] Traducción muestra original/resultado; copiar no equivale a enviar.
- [V1-087] Prellegada/bienvenida/salida mantienen consentimientos/ventana/recibo/no-reenvío.
- [V1-088] Reviews/redes usan contexto verificado y aprobación de publicación aplicable.
- [V1-089] Promociones verifican precio/margen/capacidad y autoridad antes de aplicarse.
- [V1-090] WhatsApp/WeSpeak/Portal conservan el mismo objeto y límites por canal.
Calidad, densidad y mejora — TORO Human Experience/Systems
- [V1-091] Sesión común se acepta con segundo usuario real y pruebas negativas de aislamiento.
- [V1-092] Franjaagentes informativa pequeña; actividad solo por evento vigente yTTL.
- [V1-093] Doscolumnas móviles dependen del ancho real; sinreordenarDOM ni textos diminutos.
- [V1-094] Día/noche mantienen contraste/foco y estados textuales.
- [V1-095] Adjuntos/tabs/modales soportan teclado y objetivos44px.
- [V1-096] Movimiento160ms o menos respeta reducedmotion; nada esencial depende de animación.
- [V1-097] Revisiónsemanal existente evalúa incidencias/cobertura/costos/UX con evidencia.
- [V1-098] Cada mejora prepara hipótesis/delta/prueba/costo/rollback antes de ejecución.
- [V1-099] Impacto, fallos y beneficio medidos guían mejoras; no actividad decorativa.
- [V1-100] Cierre conserva641baseline/SQL/fuentes y registra una siguiente unidad verificable.

### Criterio y continuidad
No crear100tareas/proyectos ni ejecutar100cambios técnicos. Estos100criterios orientan el primerPortal y se agrupan en capacidades existentes; diferencias se resuelven por autoridad/permisos. Primera implementación visual se mantiene acotada; fuentes/SSO/feeds/escrituras tienen aceptación propia. QA de render no certifica UI. LogoTORO exacto sigue faltante; descriptor solicitado no autoriza marca sustitutiva. APIKross y revisiónsemanal siguen FUTURE/TARGET sin suscripción/costos/settings/schedules.
**Siguiente unidad única:** cerrar el contrato técnico de sesión común Portal/Personas y su primer alcance de lectura antes de implementar integración, reutilizando Identity/People y sin migrarSQL o retirarDreamTeam. Terminado cuando se identifica la autoridad/session flow, paridad y criteriosRLS/expiración/segunda identidad y rollback en el documentoPeople vigente. La implementación no empieza con cuentas/grants implícitos.

### Fuentes oficiales de integración y cierre de diseño — 12/10/2026
- Chrome Side Panel: https://developer.chrome.com/docs/extensions/reference/api/sidePanel ; activeTab: https://developer.chrome.com/docs/extensions/develop/concepts/activeTab . PanelTORO junto a Chrome es evolución; capacidades de extensión actual no verificadas.
- Política de embebido del proveedor: https://w3c.github.io/webappsec-csp/#directive-frame-ancestors . No sortearX-Frame-Options/CSP ni copiar cookies. Widgets oficiales requieren prueba propia.
- Google identidad/autorización: https://developers.google.com/identity/gsi/web/guides/migration#authentication_and_authorization ; OAuthservidor: https://developers.google.com/identity/protocols/oauth2/web-server#authorization-errors . Login no concede scopesWorkspace ni autoriza browserembebido.
- Gmailpush: https://developers.google.com/workspace/gmail/api/guides/push ; Calendarpush: https://developers.google.com/workspace/calendar/api/guides/push ; Drivepush: https://developers.google.com/workspace/drive/api/guides/push . Señales referencian cambios, no payloadreserva completa; renovaciones ysincronización de recuperación conservan canales/worker existentes. Gmailwatch renovar antes de7días; no activado en diseño.
Revisión acotada paralela confirmó contratoPeople/sesión separada actual y opcionesChromeGoogle. Sin consultarpersonas, crearagentes durables ni ampliarpermisos.100criterios contados yúnicos; código intacto. SSO/feed/recepciónreal/ejecuciónsemanal no certificados.

## Render final V1: acceso modular, cotizador y mercadeo — 12/10/2026
**Estado:** diseño final propuesto, sin construir. Autoridad: solicitud de Mauricio; misma dirección y Plan General, sección23. Refina V1-001–100, no reemplaza capacidades, SQL, identidad o gates. TORO sigue único producto; Dreamcatcher referencia, Personal privado, nuevos proyectos dentro del ámbito permitido.

### Ajustes visuales finales
- TORO tipográfico azul: candidato día#1358B8 y noche#68A9FF; descriptor pequeño OPERATION SYSTEM. El maestro oficial sigue ausente: esta elección de texto no recolorea, redibuja ni sustituye sus bytes. Cuando se recupere, preservar el archivo exacto.
- Base día clara y noche carbón; bandas/acentos por sección: Atención coral, Cotizar turquesa, Operación ámbar, Dinero verde, Personas violeta, Mercadeo magenta/naranja, Mensajes turquesa y Reportes índigo. Logos externos conservan sus colores sobre soporte neutro.
- Franja de agentes informativa más compacta, nombres legibles y señal por evento vigente. Sin señal no significa trabajando. Reducir espacio y repetición, no fuente bajo12px ni objetivos44px. El detalle se abre con un único control accesible.
- Móvil primero y PC equivalente: favoritos en dos columnas cuando el ancho real lo permite; lectura principal en una columna; escritorio usa el ancho y paneles paralelos útiles. Sin zoom, alturas rígidas, desborde, CSS reorder o datos ocultos por truncamiento.
- Urgencias y Cotizar son disclosures con nombre/estado/foco accesibles. Inicio cerrado/abierto según preferencia permitida; conservar campos al plegar, prioridad relevante al usuario y sin cifras inventadas. Plegar no oculta alertas críticas verificadas: el resumen conserva severidad/responsable/plazo cuando exista fuente.

### Módulos y acceso
CURRENT: model.ts devuelve00–11 a contexto organizacional activo, con varios destinos en preparación; no implementa todavía todo el catálogo filtrado por permisos efectivos. directory.ts permite seis destinos solo a ADMIN/GERENCIA/JEFE_DEPARTAMENTO/AUDITOR en Dreamcatcher; EMPLEADO no recibe esos enlaces automáticamente. El render de Gerencia no representa todos los perfiles ni amplía ese acceso.
TARGET: menú=perfil/puesto/membresía/ámbito/permisos/capacidad/conector/frescura. Mostrar y ejecutar son permisos separados. La validación en servidor es obligatoria; ocultar tarjetas no es aislamiento. Pendientes descubribles solo si está autorizado descubrirlos. Personal no hereda datos hoteleros.
| Perfil de diseño | Inicio y navegación prioritaria |
|---|---|
| Recepción | Entradas/salidas, preparación, cotización, reservas/POS, cobros permitidos y respuestas |
| Aseo / Mantenimiento | Asignaciones, habitación/incidente, evidencia de cierre y mi turno |
| Finanzas | Caja CRC/USD, comprobantes, cobros, conciliación y reportes permitidos |
| Gerencia / Dueño | Urgencias/excepciones, operación, dinero y aprobaciones del ámbito |
| Mercadeo | Campañas/contenido/reputación/redes/leads/promociones/resultados autorizados |
| Personal | Mi espacio, proyectos y herramientas privadas |
Cuatro entradas útiles y Más en móvil, adaptadas al perfil; no imponer Dinero a todos. Cerebro y módulos00–11 conservan identidad/rutas. Herramientas contiene el catálogo completo permitido, no solo favoritos. Reportes y Capacitación son vistas transversales existentes, sin nuevos módulos numerados.

### Widget Kross: lectura real y diseño de búsqueda
Nueva revisión autenticada del candidatoES6 en una pestaña separada: Opciones guardadas muestran Pedir n.habitaciones=activado, máximo5; Pedir n.huéspedes=activado, estándar2/mínimo1/máximo29; Pedir n.niños=activado, máximo10; apertura selector habitaciones/huéspedes tras período=activada. No se marcó ni guardó nada. La pestaña del usuario cambió a Planner durante la revisión inicial; el selector anterior falló por contexto cambiado, se diagnosticó y se pasó a pestaña propia sin interferir.
Estos son límites configurados del buscador, no capacidad comercial de cada habitación ni validación de tarifas/disponibilidad. Publicación del widget, edades/reparto por habitación y resultado comercial E2E continúan pendientes. Reutilizar candidatosES6/EN7 y la instalación pública existente, no crear otro motor o widget duplicado.
Render: fechas Entrada/Salida en dos campos; Habitaciones/Adultos y Niños/Edades en pares; detalle desplegable de reparto por habitación y edades requerido por el motor. No imponer nuevas edades/políticas por copy. Consultar Kross ejecuta búsqueda, nunca confirma reserva/cobro. Mostrar precio total, moneda, noches, impuestos, régimen, extras, condiciones y frescura solo cuando el motor los devuelve. Si el widget no admite cierto detalle, continuar dentro del flujo oficial o explicarlo, sin inventar comportamiento.

### Mercadeo dentro del Plan
Vista Mercadeo dentro de módulo7Crecimiento, propiedad SKY con colaboración Studio y TERE. No módulo13, base, marca o agente nuevo. Pestañas: Campañas, Contenido, Reputación, Redes y leads, Promociones, Resultados. Vincular precios/SP04, sitio/motor, activos/documentos, consultas y evidencia. Separar producción de contenido, aprobación, publicación, gasto, promoción aplicada y beneficio observado. Presupuesto, contratación, cambios de tarifa y publicaciones conservan autoridad. Las acciones de servicio/conversión de huéspedes permanecen con TERE; no duplicar tareas entre áreas.

### Respuestas rápidas / mensajes pregrabados
Vista en Clientes/Comms y acceso desde la utilidad de traducción/respuestas. TORO_COMMS_V1.md declara operations.guest_message_templates como recurso existente: esquema vivo, sesión, permisos y CRUD no verificados aquí. Reutilizar ese recurso después de comprobarlo; no crear biblioteca paralela.
Catálogo por categoría/idioma/canal/ámbito: bienvenida/prellegada, ubicación/acceso, check-in/out, Wi-Fi, servicios, limpieza, incidencias, cotización, recordatorio de pago y solicitud de review. Texto y audio pregrabado se distinguen; grabación necesita origen/autoridad y no se presupone existente.
Crear genera borrador; editar nueva versión; aprobar requiere responsable habilitado; usar prepara respuesta editable. Eliminar retira/archiva las utilizadas conservando historia y recibos; borrado físico conserva autoridad específica. Campos: título, propósito, idioma, canal, variables, fuente, vigencia, responsable, versión y estado Borrador/Aprobado/Archivado. Variables sensibles se validan antes de usar; datos faltantes se señalan. No introducir RRHH privado o información bancaria en biblioteca general. Pegar mensaje/audio/archivo prepara texto/transcripción/traducción con tono; enviar es una acción independiente autorizada y verificable, no consecuencia de Crear/Editar/Usar.

### Cobertura revisada y aceptación pendiente
| Área | Cobertura del diseño | Estado de implementación nueva |
|---|---|---|
| Identidad/contexto/proyectos/Personal | Común, autorizado, privacidad y limpieza de ámbito | TARGET; sesión recíproca no certificada |
| Comando/adjuntos/audio/foto/respuestas | Multimodal con borrador y recibo por acción | TARGET |
| Kross/POS/widget/operación/precios | Reutiliza fuentes/herramientas; límites de búsqueda leídos | Integración y E2E pendientes |
| People/asistencia/turnos/capacitación | Personas dentro deTORO; vistas por rol | TARGET |
| Dinero/comprobantes/caja/conciliación | CRC/USD separados, juntos en pantalla y desplegables | TARGET |
| Mercadeo/Studio/Comms/mensajes | Vistas de módulos existentes y versionado | TARGET |
| Herramientas/datos/fuentes/Google/Chrome | Catálogo autorizado y captura seleccionada | Feed/permisos/adapter pendientes |
| Reportes/Cerebro00–11/mejora semanal | Misma información, cortes y resultados verificables | Runtime y automatización pendientes |
No se omite ninguna categoría del pedido en la estructura; esto no declara exhaustiva la auditoría ni entregadas las capacidades. UI deberá pasar320/390/PC, ambos temas, teclado/disclosures/foco/44px/contraste y datos desconocidos/parciales.100criterios previos y641baseline se conservan; no reauditoría o suite de código por docs/render.
**Única siguiente acción:** revisar este render final como dirección de presentación. Todavía no construir, conectar o activar CRUD. Al autorizar implementación, primero cerrar contrato de sesión común Portal/Personas y primer alcance de lectura en People vigente; conservar criterios de identidad/RLS/expiración/segunda identidad y rollback. SQL YA APLICADO, sin modificaciones.

## Estructura operativa antes del build — decisión vigente 12/10/2026

**Recomendación:** cerrar primero la estructura y el contrato de identidad, permisos y fuentes. El Portal será una entrada al trabajo del contexto activo; cada registro tendrá un origen y un responsable. La amplitud visual aprobada no acredita integraciones terminadas.

**Alcance de este lote:** diseño y preparación documental. Mauricio detuvo nuevos renders y reiteró que no se construya. La última instrucción sustituye blanco por arena muy claro, elimina rosado/morado y prioriza densidad, pestañas, directorio y People completo. Se mantienen módulos 00–11, 100 criterios V1, fuentes, baseline 641 y SQL ya aplicado. Sin frontend, instalación, configuración, envío, scheduler ni publicación.

### 1. Orden y formato común

- **Cabecera:** TORO tipográfico azul + OPERATION SYSTEM pequeño; proyecto/contexto autorizado, usuario, tema, hora y clima compactos. En día tendrá fondo azul claro o arena más intenso; en noche fondo carbón y superficies azul pizarra más claras para dar contraste. La hora usa Costa Rica en Dreamcatcher y configuración por proyecto; clima requiere ubicación y corte, nunca datos inventados.
- **Agentes:** una franja mínima con nombres, texto de estado y detalle desplegable; estado activo solo con evento vigente. No fijar múltiples barras altas que resten pantalla móvil. Sin señal comprobada, indicar Sin señal.
- **Comando:** Pide o busca, con adjuntar archivo/foto/audio. Un único resultado puede abrir una reserva, tarea, documento o herramienta permitida. Buscar, preparar y ejecutar tienen resultados distintos; la petición no concede permisos ni confirma una acción.
- **Navegación:** PC con menú horizontal y pestañas por sección. Móvil con cuatro destinos prioritarios por rol y Más; conservar las mismas rutas y contenido autorizado. Inicio siempre accesible. Más contiene destinos secundarios, Cerebro, Mi espacio y configuración según permiso.
- **Formato de sección:** título breve + filtro/período + acciones en una línea cuando quepan; debajo, pestañas y lista compacta. En PC, lista/tabla y detalle lateral; en móvil, fila con icono + asunto + estado + plazo y detalle al tocar. No tarjetas enormes para cada dato, ni ocho paneles abiertos a la vez.
- **Densidad:** columnas para accesos o datos cortos; lectura larga en una columna. Iconos con nombre accesible, controles de 44px y auxiliares de 12px como mínimo. Unir fecha, responsable y estado si son legibles; no ocultar moneda, fuente o riesgos. Preservar filtros, posición y borradores al regresar.

### 2. Qué va en cada pantalla

Estas son vistas del producto existente, no nuevos módulos, bases ni agentes.

| Vista | Información principal | Detalle / herramientas | Fuente y alineación |
|---|---|---|---|
| **Inicio** | Pendiente: dos primeras tareas propias relevantes; nueve favoritos; widget oficial Kross; resumen operativo corto según rol | Ver todas, Crear tarea/Nota, añadir/ordenar favoritos, abrir caso | Atención 01, Operaciones 05, Tools; datos permitidos del contexto |
| **Operación** | Pestañas Habitaciones, Entradas, Salidas, Nuevas, Aseo, Mantenimiento, Desayunos, Recepción y Tareas según perfil | Habitación/reserva/turno, preparación, incidencias, checklist, notas, evidencia, relevo y enlace original | Kross conserva PMS; TORO coordina tareas; RICO 05 y TERE 04 |
| **Dinero** | Resumen, Bancos, Cobros, Gastos, Comprobantes, Caja, Conciliación | CRC/USD simultáneos, denominaciones desplegables, calculadora, comprobante original y diferencias | Alegra contabilidad; banco/procesador pagos; conteo físico con corte; FIONA 02 |
| **Personas** | DreamTeam completo mediante vistas por rol: jornada, horarios, asistencia, solicitudes, equipo, planillas, capacitación y reportes | Día/Semana, cobertura publicada, incidencias, aprobación, evidencia, historial | People 06; no fuente paralela ni sustitución de contabilidad/banco |
| **Mercadeo** | Campañas, Contenido, Reputación, Redes y leads, Promociones, Resultados | Borradores, recursos Studio, aprobación, publicación y medición separadas; SP04 como contexto de precios | Crecimiento 07, Studio 03, TERE 04; sin presupuesto/publicación implícitos |
| **Herramientas** | Catálogo completo permitido, Favoritos, Directorio útil, Accesos y conexiones, Dispositivos | Buscar, abrir programa/original, añadir acceso personal, cuenta y permisos, Google Home | Tools/Sistemas 11; permisos efectivos, no catálogo idéntico para todos |
| **Directorio útil** | Proveedores, técnicos, transporte, experiencias, servicios, emergencias y contactos de operación | Ficha: llamar, mapa, web, preparar WhatsApp, documentos y tareas vinculadas | Vista de Herramientas accesible también desde Operación; reutilizar contactos/empresas existentes |
| **Reportes** | Operación, dinero, personas, comercial y sistemas; período, corte, cobertura y fuentes | Original, resumen, diferencias, hallazgos candidatos, vincular/confirmar nota o tarea, exportar con permiso | Misma información y cierres, sin segunda cola; fuentes originales y Reports transversal |
| **Respuestas** | Mensaje original, traducción/transcripción y respuesta editable; biblioteca operativa | Texto/audio/archivo, idioma/tono, crear/editar/versionar/archivar plantilla, preparar WhatsApp | Clientes/Comms 04; recurso existente guest_message_templates sujeto a validación |
| **Cerebro** | Prioridades, decisiones, tareas de agentes y recibos; módulos 00–11 y conexiones permitidas | Detalle de ejecución, aprobación, fallo, pausa/cancelación, límite de recursos | Control Plane 00/11; sin grafos o actividad ficticia |
| **Mi espacio** | Tareas, notas, proyectos, archivos y herramientas personales privados | Compartir explícitamente, convertir nota en tarea, favoritos propios | Identity/User Vault y Proyectos 10; no hereda información hotelera |
| **Capacitación** | Guías por rol/programa, versión vigente, práctica y avance propio | SOP original, asignación, evidencia de comprensión y mejora por incidentes | Knowledge/People; acceso desde Personas/ayuda contextual, sin módulo adicional |

**Inicio no será todo el negocio comprimido.** Enseña qué atender y permite actuar. Horarios extensos, planillas, bancos, biblioteca de respuestas, configuración y reportes completos viven en su sección. Recepción ve entradas/preparación; aseo sus asignaciones; Finanzas caja/cobros; Gerencia excepciones; Mercadeo campañas; Personal su ámbito. Nueve favoritos es capacidad inicial visible, no obligación de mostrar accesos no autorizados.

**Favoritos:** PC 3×3; móvil dos columnas cuando quepan, con noveno acceso y Añadir. Guardar más fácilmente, elegir los nueve de Inicio, ordenar con controles accesibles y ver la lista completa. Los seis destinos actuales no se amplían automáticamente. POS solicitado conserva https://dreamcatcherhotel.krossbooking.com/admin/pos. Añadir un enlace no otorga sesión, rol o capacidad de conector; URL desconocida queda pendiente, sin inventarla. TERE se abre por su canal existente cuando la ruta sea comprobada.

### 3. Widget Kross y calendario único, también en la web

Retirar la cabecera redundante Cotizar estancia y colocar el widget oficial en ese espacio. **Un solo control de fechas:** tocar el calendario una vez, elegir entrada y salida dentro de la misma apertura y ver rango/noches. Los dos valores se conservan explícitos; no abrir dos diálogos. PC puede mostrar meses contiguos; móvil un panel con selección de rango, mes navegable, editar y cancelación accesibles. Mantener selección al cambiar adultos/niños/habitaciones y al volver.

Habitaciones, adultos y niños usan controles compactos; edades y reparto se despliegan según el comportamiento admitido por Kross. Reutilizar candidatos ES6/EN7; ES6 tiene habitaciones/niños activados según lectura previa. **La selección de rango y su personalización exacta no están verificadas.** Antes del build de ese componente, comprobar el flujo oficial y fechas/resultados de extremo a extremo. No modificar scripts del proveedor ni construir un motor alternativo para aparentar capacidad. Si un requisito no es admitido, usar el flujo oficial soportado y registrar la limitación.

Aplicar el mismo contrato de fechas a la web Dreamcatcher existente; esta anotación no modifica su proyecto. Buscar produce una cotización, no una reserva ni un cobro. Precio y disponibilidad requieren respuesta vigente del motor, moneda, impuestos, régimen y condiciones. Habitaciones desocupadas físicamente no equivalen a unidades vendibles.

### 4. Pendiente, notas, reportes y WhatsApp

**Pendiente** sustituye Importante/Urgencias como bloque de Inicio. Mostrar dos tareas relevantes y Ver todas; conservar indicador visible de riesgo crítico aunque otra tarea ocupe las primeras filas. Una sola lista canónica, sin cola paralela de importantes ni listas por canal.

Cada tarea: título, contexto, objeto/habitación/reserva/activo/turno, creador, responsable verificado, plazo, prioridad motivada, estado, fuente, checklist, comentarios y evidencia según necesidad. Menú contextual: Asignar, Adjuntar, Comentar, Registrar avance, Abrir original/Kross y Preparar WhatsApp. El cierre exige permiso y evidencia proporcional; terminado por el ejecutor y verificado pueden ser estados diferentes. Asignar a otro requiere alcance y aceptación/devolución; no se deriva un compromiso solo de una nota.

Notas personales privadas, notas del caso compartidas y tareas son objetos distintos. Crear/editar/archivar es TARGET; nota → tarea o compartir es explícito. No copiar datos privados de empleados/huéspedes a una nota general. El intake local actual solo cubre ADMIN/GERENCIA, asigna al usuario activo y no ofrece destinatarios, privacidad ni CRUD completo: **cada persona crea para sí/otros aún requiere contrato e implementación.**

Kross Housekeeping/Maintenance conserva identificador y autoridad. Vincular primero un registro existente; escritura futura necesita dirección permitida, mapping, versión, dedupe, readback y recibo. Estados Registrado en TORO / Pendiente Kross / Confirmado Kross / Falló separados. No se ha demostrado adapter de escritura de aseo/mantenimiento. Un vínculo ayuda a coordinar; no es un backup recuperable del PMS ni prueba de limpieza física.

Aseo/desayunos/recepción: guardar referencia al reporte original y su autor/turno/corte. TORO extrae **hallazgos candidatos**, busca caso existente y propone nota/tarea/relevo. No convertir cada frase en tarea ni aceptar una interpretación como hecho. Desayuno incluido, servido, extra facturado y cobrado son estados distintos. Actualización incremental por eventos/cursor y revisión existente; mostrar último éxito, fuente, cobertura, error y próximo intento. No activar scheduler nuevo ni prometer tiempo real. Con datos vencidos: Desactualizado, no cero.

WhatsApp útil en asignación/relevo, incidencia, ficha de proveedor/experiencia, respuesta a cliente, cotización y resumen autorizado. Preparar muestra destinatario verificado y borrador editable; copiar/abrir/enviar/entregado se distinguen. Envío automático solo por el canal ya autorizado y capacidad habilitada, con referencia del proveedor, dedupe y resultado. No enviar a terceros por diseñar el botón ni meter claves/datos sensibles en URL. Reportes privados requieren destinatario con el mismo alcance, no cualquier contacto.

### 5. DreamTeam sin perder horarios ni planillas

| Perfil | Entrada y pestañas prioritarias | Información adicional permitida |
|---|---|---|
| Empleado | Mi jornada, Horario, Solicitudes, Más | Asistencia propia, formación, perfil/documentos propios autorizados |
| Jefe | Equipo, Cobertura, Pendientes, Más | Horarios/asistencia de equipo, solicitudes e incidencias bajo alcance |
| RRHH / ADMIN | Personas, Horarios, Asistencia, Planilla | Expedientes, préstamos/adelantos/liquidaciones, reportes y configuración con permisos |
| Contabilidad | Planilla permitida, Conciliación, Reportes | Versión revisada, soportes y diferencias; sin expedientes completos por defecto |
| Gerencia / Auditor | Cobertura, Excepciones, Reportes | Resúmenes/evidencia del ámbito; auditoría de lectura cuando corresponda |

Reutilizar EmployeeCenter, AttendanceCenter/Editor, ScheduleCenter, LeaveCenter, PayrollCenter, ReportCenter y PortalCenter según paridad vigente. Horario Día/Semana muestra publicado frente a borrador; cambios conservan historial. Asistencia mantiene marcaciones originales/correcciones y aprobación. Nómina Borrador/Revisada/Aprobada/Pagada separada; People prepara, Finance concilia y Alegra/banco conservan autoridad fiscal/de pago.

Sesión común Portal/Personas sigue TARGET. Confirmar backend/orígenes, vínculo usuario–empleado, contexto/membresía y expiración/logout/revocación; probar segunda identidad y denegación cruzada. El Plan excluye EMPLEADO de RPC amplios de horario/asistencia: mantener lecturas propias autorizadas, no reabrirlos por montar la UI. El piloto de asistente tiene elegibilidad individual limitada; permitir consultas a todos será una ampliación por definir, no consecuencia del puesto. Conservar DreamTeam hasta paridad y recuperación verificadas. Perfil laboral privado no se mezcla con Mi espacio personal.

### 6. Directorio, acceso Google y dispositivos

**Directorio operativo:** categorías y búsqueda, favoritos por usuario y ficha verificable. Campos mínimos: nombre, categoría, ubicación/cobertura, contacto, horario, idioma si consta, fuente, última comprobación, responsable y notas del ámbito. Tarifas/comisiones/condiciones con vigencia y permisos; experiencias muestran disponibilidad solo si hay fuente. Emergencias permanecen localizables aunque falte un conector; contactos/protocolos críticos necesitan comprobación humana y versión. No cargar teléfonos inventados ni recomendar automáticamente un proveedor por una ficha antigua. Facturación de proveedor remite a su autoridad contable; directorio no autoriza contratación/pago. Separar contactos hotel, personal y fichas publicables para huéspedes.

**Google y Chrome en la estructura:** Gmail alimenta comunicación/señales, Calendar agenda, Drive/Docs/Sheets documentos y Contacts ayuda a resolver contacto; no sustituyen PMS, tareas empresariales o CRM. Tasks/Keep se evalúan como captura/proyección del objeto canónico, no otra lista maestra. Estos accesos se agrupan en Herramientas/Accesos y se abren desde el caso que los necesita. Chrome captura solo página/selección elegida con URL/corte/ámbito mediante capacidad existente que debe comprobarse; conserva Abrir original. Un panel TORO junto a Chrome puede evaluarse después; no incrustar Chrome completo ni copiar cookies para integrar Kross. Legal y Riesgo, Activos y Espacios y Proyectos siguen localizables por Más/Cerebro según permisos, sin desaparecer de 00–11 ni crear otro portal.
**Continuar con Google:** añadir como TARGET junto al acceso actual. El formulario inspeccionado usa contraseña y no incluye flujo Google. La identidad del proveedor se enlaza a un usuario canónico; no duplicar empleado ni otorgar acceso por coincidencia de nombre/correo o dominio. Primer acceso resuelve elegibilidad, vínculo y contexto. Login Google no concede Gmail/Drive/Calendar/Home; cada conexión necesita consentimiento independiente y cuenta/ámbito visibles. Recuperación/MFA, cierre en equipos compartidos y cambio de cuenta forman parte del contrato de identidad.

**Google Home:** primera versión enlaza al servicio oficial, con acceso desde Herramientas → Dispositivos y favorito opcional. PC: https://home.google.com/; móvil: abrir app instalada mediante mecanismo oficial que deberá validarse por plataforma, con fallback web si no hay handoff soportado. Google confirma controles web limitados según dispositivo y cuenta; no se ha revisado la cuenta de Mauricio ni inventario/casas/equipos. Separar propiedad personal y hotelera. No presumir que iniciar sesión en TORO comparte esa sesión.

Control dentro de TORO es una evolución: Home APIs Android/iOS, OAuth y permisos por estructura/tipo/dispositivo, compatibilidad y conectividad comprobadas. La documentación revisada no establece un SDK web equivalente para este Portal. Modelar dispositivo, ubicación, estado/corte, alcance y comando permitido; cámaras/cerraduras y otros comandos sensibles conservan autorización específica. No crear control, automatización, cámara embebida ni ampliar permisos ahora.

**Accesos y conexiones, no una tabla de contraseñas:** cuenta enmascarada, Hotel/Personal, propietario, permisos, estado y última verificación; Abrir/Conectar/Reautenticar/Ver permisos según rol. Referenciar gestor de contraseñas existente, todavía desconocido. No almacenar claves en favoritos/notas/URL ni mostrar Copiar contraseña. User Vault es contexto personal, no password manager. OAuth/SSO oficial cuando proceda; secretos de integraciones solo servidor y referencias, nunca prompts, navegador o logs.

### 7. Codex ↔ TORO y autonomía real

| Dirección / alcance | Base actual | Complejidad relativa y condición |
|---|---|---|
| Codex → TORO: lectura | /api/mcp y seis herramientas de lectura ya existen localmente | Media: autenticar endpoint real y demostrar aislamiento; no conector operativo certificado |
| Codex → TORO: intención/escritura gobernada | Intake interno y primitives de ejecución, sin herramienta MCP pública de escritura | Media-alta: autorización por capacidad, tarea canónica, idempotencia, verificación y recibo |
| TORO → Codex: trabajar desde Portal | Modelo/contratos existentes; no puente integrado demostrado | Alta: host, sesión, eventos, aprobación, interrupción, recuperación, presupuesto y auth admitida |

Seis herramientas actuales: get_brain_status, search_toro, get_priorities, get_business_status, get_pending_decisions y get_execution_receipts. El MCP resuelve organizaciones, no prueba datos personales. Bearer se valida con usuario/membresía, pero la inspección acotada no mostró comprobación explícita de audience del recurso y scope de lectura: requisito pendiente, no vulnerabilidad explotada. Verificar issuer/audience/expiración/scopes, recurso OAuth/callback/PKCE, token revocado, org incorrecta y segunda identidad antes de activar.

MCP hace accesibles herramientas a Codex; no convierte al Portal en un ejecutor autónomo. Para interfaz cliente OpenAI documenta app-server; SDK para trabajos automáticos y modelo de autenticación admitido deben evaluarse sin reutilizar credenciales de ChatGPT en un servicio alojado. Las sesiones TORO/Codex/Kross son distintas; no copiar cookies. Reutilizar operations.tasks, runs/receipts, workers y registry existentes, no nueva cola.

Flujo objetivo: petición → intención visible → validación de identidad/capacidad → preparación → autorización aplicable → ejecución limitada → verificación → recibo. Mostrar Preparado/Esperando aprobación/En curso/Verificado/Falló/Cancelado solo con evidencia. Actividad por eventos vigentes, sin parpadeos ficticios. Autonomía empieza con lectura y preparación; mensajes, reservas, cobros, publicación y cambios de precio conservan permisos específicos. Medir ciclos reales, fallos, dedupe, costos y recuperación antes de ampliar.

### 8. Qué falta, qué sobra y qué puede pasar desapercibido

**Falta cerrar antes de la integración funcional:**

1. Sesión común, login Google, segundo usuario y matriz por puesto/membresía/ámbito; permisos para ver separados de ejecutar.
2. Contrato de tareas/notas privadas, destinatarios, aceptar/devolver/reabrir/cerrar y adjuntos; el intake actual no cubre todo.
3. Fuente real/formato/corte/responsable de cada reporte y IDs para habitación–reserva–turno–tarea; sin ello se duplicarán incidencias.
4. Frescura y comportamiento ante fallo por fuente; caja/banco/contabilidad/precio/ocupación no pueden compartir un supuesto único de dato vivo.
5. Widget oficial con rango, menores/reparto, impuestos/condiciones y resultado comprobados; paridad con la web.
6. Directorio institucional actualizado, contactos verificados, dueño de cambios y separación de fichas publicables/privadas.
7. Elegibilidad del asistente, conectores activos vs enlaces, WhatsApp por destinatario y recuperación de envíos ambiguos.
8. MFA/recuperación/dispositivo compartido, revocación al salir del hotel, sesión caducada y continuidad segura de borradores.
9. Edición simultánea/offline: no reenviar cobros/mensajes ni duplicar reservas por reintento; borrador local no operación confirmada.
10. Presupuesto de consultas/modelos, cargas de audio/foto, almacenamiento/retención y atención a adjuntos no confiables; medir por tarea.
11. Paridad People y recuperación antes de retirar DreamTeam; horario publicado no prueba asistencia, asistencia no aprueba planilla y planilla no prueba pago.
12. Logo maestro exacto y assets nuevos verificados; renders no acreditan bytes, contraste ni QA. La revisión semanal propone mejoras y prueba deltas, no autoedita producción.

**Sobra:** repetir todo en Inicio, otra cola Importante, contraseñas dentro de accesos, WhatsApp en cada campo, todos los programas en cada tarea, planillas en tarjetas generales, paneles gigantes, movimiento constante y sincronización bidireccional sin propietario. Reducir densidad decorativa antes de reducir letra o controles.

**Límite honesto de preparación:** existe dirección y estructura suficiente para especificar pantallas; todavía faltan contratos/verificación para integrar todos los sistemas. Un catálogo con logos y enlaces no demuestra datos actualizados. El Plan no presume bancos/caja sincronizados, API Kross contratada, precios OTA comparados, Home conectado, SSO recíproco o automatización autónoma funcionando.

### 9. Dirección visual que sustituye decisiones anteriores

Arena muy claro como fondo de día; cabecera con fondo y acento azul. Noche carbón real con superficies azul pizarra más claras. Propuesta de tokens para futuro QA: arena #F7F3EA, cabecera #DCE9F6, tinta #183047, TORO azul #1358B8; noche base #101923, superficie #233A4D, tinta #EDF3F6. Son candidatos, no contraste probado.

Secciones: azules/turquesas, verde salvia, ámbar/dorado y terracota suaves; **sin rosado, fucsia ni morado en UI propia**. Marcas externas mantienen colores originales, sin recolorear logos. Texturas discretas solo en fondos/bandas y sombras suaves; no detrás de lectura densa. Color guía área, estado siempre tiene texto. Pestañas/filas/disclosures compactos, nada esencial depende de animación. Primera versión debe probar 320px, móvil, PC, ambos temas, foco/teclado/contraste/reduced-motion y estados parciales.

El render de Mercadeo que terminó al recibir la instrucción nueva pertenece al lote previo; su paleta rosa/morada está descartada. No se pidieron más imágenes tras esa instrucción. Las imágenes de este lote quedan como propuestas anteriores, no especificación vigente.

### 10. Fuentes y siguiente unidad

Revisión acotada, sin datos de huéspedes/empleados, escrituras operativas o nueva auditoría global. Fuentes locales: TORO_PEOPLE_DREAMTEAM_INTEGRATION.md, TORO_PEOPLE_CODE_MIGRATION_V1.md, TORO_TOOLS_V1.md, TORO_IDENTITY_USER_VAULT_V1.md, TORO_COMMS_V1.md, TORO_CHATGPT_MCP_CONTRACT_V1.md; runbooks TORO_MCP_PUMBA_ACTIVATION_V1.md y TORO_KROSS_FIRST_LIVE_READ_ACCEPTANCE_GATE.md; src/features/auth/login-form.tsx, actions/internal-work*.ts, mcp/server.ts, mcp/auth.ts, lib/supabase/bearer.ts, portal/model.ts y tools/directory.ts. El Plan registra fuentes/recepción y gobernanza Google previas; no se atribuye vigencia operativa a sus snapshots.

Fuentes oficiales consultadas 12/10/2026:
- [Google Identity: autenticación y autorización](https://developers.google.com/identity/gsi/web/guides/migration#authentication_and_authorization).
- [Google Home para la web](https://support.google.com/googlehome/answer/9241220?hl=es), [Home APIs Android](https://developers.home.google.com/apis/android/get-started), [Home APIs iOS](https://developers.home.google.com/apis/ios/overview) y [permisos por estructura](https://developers.home.google.com/apis/android/permissions).
- [Codex MCP](https://learn.chatgpt.com/docs/extend/mcp?surface=cli), [Codex app-server](https://learn.chatgpt.com/docs/app-server) y [OAuth RFC 9700](https://www.rfc-editor.org/rfc/rfc9700.html).

**Única siguiente acción:** cerrar, en el contrato People/Identity existente, sesión común Portal–Personas y primer alcance de lectura con login Google como opción propuesta. Terminado cuando autoridad, vínculo usuario–empleado, contexto, permisos, expiración/revocación, segunda identidad, paridad y recuperación están definidos y sus pruebas de aceptación listas. Todavía no construir, crear cuentas/permisos, reejecutar SQL ni activar conexiones. Esta decisión documental no certifica dichas pruebas como ejecutadas.

## Recomendación de simplificación y utilidad de MCP — 12/10/2026
**Estado: PROPUESTO, sin implementación o activación.** Responde a Mauricio: quitar complejidad que no aporta valor y explicar qué controles sí benefician la operación. No modifica permisos, fuentes, baseline, SQL ni elegibilidad del asistente.

**Recomendación principal:** Portal conecta directamente con los servicios existentes de TORO. MCP se conserva como adaptador opcional para que ChatGPT/Codex consulten esos mismos servicios con permisos; no interponerlo en cada pantalla ni condicionar el primer Portal a integrar Codex. Existe servidor local de seis herramientas de lectura, no runtime externo certificado. El contrato MCP P0 existente sigue TARGET: se propone desacoplar su entrega de la experiencia inicial, no eliminarlo ni declarar aprobado un nuevo alcance.

- Conservar un producto, identidad/contexto, tareas, permisos y resultados; reutilizar el código existente y validar el contrato de sesión People. No microservicios, nueva cola o bases por programa.
- Cada herramienta tiene solo el nivel necesario: abrir el original; leer datos si mejora una decisión; ejecutar una acción cuando el flujo está comprobado y autorizado. Un enlace útil no necesita adapter de escritura.
- Usar lógica normal para calendario, tareas, caja/calculadora, filtros y plantillas. IA para interpretar reportes, traducir, resumir o preparar respuestas con contexto. Codex desarrolla/prueba mejoras; integración como operador general del hotel se aplaza.
- Mostrar una lista de trabajo con vistas por rol, sección o programa. No convertir todos los módulos, agentes y herramientas en elementos visibles de Inicio.
- Reutilizar widget Kross y DreamTeam; no rehacer sus motores ni duplicar planillas. Google Home/Chrome y proveedores empiezan con acceso contextual al original; lecturas/control dentro del Portal requieren beneficio concreto.
- Automatizar reglas simples por eventos y cambios materiales antes de añadir agentes continuos. Revisión semanal prepara mejoras; no autoedita producción. Autonomía se gana por flujo verificable bajo el modelo A0–A6 vigente.

**Controles que sí conviene conservar:** separación personal/hotel y nómina privada; identidad y permiso por acción; fuente/corte para tarifa/pago/ocupación; evitar efectos duplicados; distinguir preparado/enviado/verificado y recuperación ante fallo. Pueden resolverse una vez en servicios compartidos y actuar silenciosamente. Aprobación humana para lo que la requiere, sin pedir confirmación repetida de tareas ya autorizadas.

**Cuándo vale MCP:** uso repetido desde ChatGPT/Codex para consultar prioridades, evidencia y resultados sin copiar reportes; clientes externos reutilizan las mismas herramientas. Si solo se usa el Portal, el adapter aporta poco al trabajo interno. No sustituye Kross/Alegra/Google ni elimina su autenticación, datos o verificación. Evaluar con un caso externo acotado de lectura y medir trabajo evitado, tiempo de respuesta, mantenimiento y fallos antes de ampliar.

**Valor de la primera versión:** cerrar un flujo como reporte/incidencia → tarea única → responsable → evidencia → relevo/cierre, con accesos contextuales y datos faltantes visibles. Beneficio se mide en doble captura evitada, menos búsqueda, respuesta más rápida y pendientes realmente cerrados. No estimar ahorros o porcentajes sin medición.

Fuente local actual: src/features/mcp/server.ts y contratos TORO_CHATGPT_MCP_CONTRACT_V1.md / TORO_AUTONOMY_AND_ACTION_MODEL_V1.md. Fuente oficial: https://developers.openai.com/plugins/build/mcp-server . Si se utiliza API para IA del Portal, su facturación es independiente de ChatGPT: https://help.openai.com/en/articles/9039756-managing-billing-for-chatgpt-and-the-api-platform . Vías OAuth de uso del plan ChatGPT requieren elegibilidad y evaluación específica; no se presume cobertura de usuarios/runtime TORO: https://developers.openai.com/siwc/token-sharing-open-source/codex-app-server . Nada contratado/activado.

**Siguiente unidad conservada:** contrato de sesión común Portal–Personas y primer alcance de lectura, limitado a lo necesario. No resolver todos los conectores para empezar esa preparación. Todavía no construir.

## Dirección aprobada y paquete de inicio del Portal — 12/10/2026
**Autoridad:** Mauricio aprueba las recomendaciones de simplificación y pide renders finales empresariales, preparación para crear TORO, Google/herramientas y continuidad con CONTINUAR. Su aceptación cubre decisiones de diseño y preparación reversible; este lote no publica, cambia DNS, contrata servicios, activa permisos ni modifica fuentes operativas. Se mantiene un TORO, módulos 00–11 y Dreamcatcher como primera implementación. No onboarding externo por este paquete.

**Decisión aprobada:** Portal reutiliza los servicios actuales; MCP permanece adapter externo opcional, inicialmente lectura, sin requisito para la primera interfaz. IA por necesidad operativa; lógica normal para fechas/tareas/caja; Codex para desarrollar y verificar cambios. No navegador completo, bases/colas nuevas ni autoedición de producción. La sección de simplificación anterior deja de ser mera propuesta en cuanto a esta dirección, pero ninguna capacidad se activa por ello.

### CURRENT: verificación acotada de dominio y Google

| Elemento | Lectura de este lote | Lo que no prueba |
|---|---|---|
| Dominio hotel | DNS ns1/ns2.vercel-dns.com; web /es HTTP200; MX smtp.google.com | Autoridad para cambiar zona/correo o disponibilidad continua |
| toro.dreamcatcherhotel.com | Resuelve a Vercel y devuelve HTTP404; no asociado al proyecto canónico inspeccionado | Portal publicado, binding, certificado del nuevo Portal o acceso privado |
| Proyecto TORO | toro-pr11-preview, prj_nxerFw9ciNews6tUMAah3GAlAJzs; equipo dreamcatcher-s-projects, team_zUbLBlOtoQBHDfGMYpDlg0XO | Aprobación de despliegue, plan comercial o presupuesto |
| Producción registrada | dpl_6kfxNwdiEbfjijCLGLNFtmHBUrrR; READY; main; SHA f1f218f691daecce23db00e60aa9b5c577758e93 | Nuevo Portal, revisión de seguridad, pruebasAuth/RLS o código de esta rama |
| Protección Vercel | all_except_custom_domains | Protección de un nuevo dominio personalizado; login propio es requisito |
| Gmail/Calendar/Contacts/Drive en ChatGPT | Perfiles actuales corresponden a admin@dreamcatcherhotel.com | Conexión durable del Portal, delegación de dominio, accesoHome o permisos de escritura |
| Calendar | Un principal editable y ocho suscripciones de lectura; respuesta sin paginación pendiente | Eventos leídos, tareas sincronizadas, nueva agenda de operación o cobertura de turnos |

DNS del subdominio parece proceder de la resolución general de la zona; no inferir asociación por resolver. No se inspeccionaron correos, contactos individuales, archivos ni huéspedes. El deployment registrado es otra evidencia, no el artefacto que deba publicarse por defecto. No mezclar último preview de otra rama con producción; seleccionar SHA explícito antes de cualquier publicación.

### TARGET: publicación simple en toro.dreamcatcherhotel.com

Reutilizar proyecto TORO existente; conservar proyecto web Dreamcatcher aparte. No comprar dominio, transferir registro, mover nameservers ni crear otro hosting para este Portal. Con DNS Vercel, la asociación y verificación podrían bastar; valores exactos se obtienen del proyecto cuando se prepare la asociación. No introducir IP/CNAME universales ni --force para pisar otra asociación.

Secuencia de publicación, aún no ejecutada:
1. Seleccionar el SHA del Portal reconciliado con main y verificar preview, ambos temas/móvil/PC y alcance real.
2. Verificar autorización propia: anónimo, sesión vencida/revocada, usuario sin membresía, contexto ambiguo y acceso cruzado fallan cerrado. La protección Vercel actual excluye custom domains.
3. Registrar binding anterior, proyecto/equipo/SHA/deployment/entorno; confirmar plan comercial y presupuesto existente. No hubo lectura de facturación; no prometer costo cero. Revisar cobertura comercial actual, no activar un upgrade.
4. Preparar orígenes/callbacks/redirecciones/cookies del dominio exacto. SITE_URL compartido puede afectar recuperación/otras apps: revisar impactos, sin sustituirlo a ciegas.
5. Asociar solo toro.dreamcatcherhotel.com al proyecto/commit aprobado en la ventana autorizada. Usar recomendaciones reales si pide DNS/TXT; conservar apex/www/MX/TXT/nameservers.
6. Verificar binding, DNS, propiedad y HTTPS; login/retorno/logout/revocación/permisos; comprobar web pública y correo sin alterar datos.
7. Revertir solo nueva asociación/configuración o restaurar deployment previo aprobado si falla. No eliminar proyecto/web ni tocar SQL.

Cookies preferentemente limitadas al hostname TORO, sin compartir con toda dreamcatcherhotel.com. Personas portado al mismo origen puede evitar segundo login; el DreamTeam legado conserva acceso hasta paridad. Google provider callback de Supabase y callback de la app son distintos; sus URLs exactas continúan pendientes. No afirmar /auth/callback implementada. El modo demo/fail-closed y controles legacy vigentes se conservan; dominio no habilita modo interno/flags/read/write.

### Google y herramientas: mapa listo para implementación gradual

| Servicio | Primer uso útil y acotado | Integración posterior y aceptación |
|---|---|---|
| Google login | Entrada opcional, usuario canónico y contexto | OAuth oficial Supabase, elegibilidad/vínculo seguro/retorno; no otorgar membresía por email/dominio |
| Gmail hotel | Señal de reserva/consulta y evidencia al caso | Reutilizar ingesta/cursor/worker; evitar duplicados, recuperar gaps y verificar primer evento |
| Calendar | Agenda del contexto y acceso al calendario actual | Lectura por permiso, filtros CR/operación y dedupe de feriados en la vista; no borrar suscripciones ni confundir evento con turno |
| Drive/Docs/Sheets | Abrir documentos/SOP/soportes originales permitidos | Mantener ownership/ACL/originales; lectura y edición son alcances distintos, sin duplicarDropbox |
| Contacts/Directorio | Resolver contacto verificado y ficha útil | No CRM ni empleado maestro; fuente/vigencia/ámbito; WhatsApp contextual con receptor verificado |
| Home | Abrir original/app según plataforma | Cuenta/casa/device permissions y compatibilidad por verificar; no control autónomo todavía |
| Chrome | Abrir original/captura elegida | Panel/extensión existente por comprobar; no iframe de Chrome ni copia de cookies |
| Tasks/Keep | Evaluar captura/proyección frente a tareas/notas canónicas | Sin adapter E2E certificado; no lista maestra paralela ni nuevos scopes ahora |

El acceso desde los conectores de ChatGPT de este lote no transfiere sus sesiones o tokens a TORO. Consentimientos Workspace/Home son distintos de login. Panel Accesos y conexiones mantiene propietario, cuenta enmascarada, alcance, estado y corte. Conector, link, cuenta autorizada y operación verificada se distinguen. No guardar contraseñas en favoritos/notas; conservar referencia al gestor existente, todavía por identificar.

### Diez refinamientos finales, sin diez proyectos nuevos

| # | Mejora incorporada al contrato | Criterio de aceptación futuro |
|---|---|---|
| 1 | Inicio por rol y acción frecuente | Recepción/aseo/finanzas/gerencia ven prioridades permitidas; no usar nómina como tarjeta general |
| 2 | Continuar donde quedaste | Regreso conserva filtro/período/selección dentro del contexto; cambio de usuario/contexto elimina datos anteriores |
| 3 | Calendario de rango en una apertura | Entrada y salida elegidas en un panel, noches claras y edición sin perder huéspedes; validar comportamiento oficial Kross/web |
| 4 | Favoritos con nueve accesos elegidos | Añadir/reordenar/editar accesible y Ver todos, sin ampliar permisos; PC3×3/móvil2columnas cuando quepan |
| 5 | Relevo de turno con excepciones | Preparar resumen de pendientes/responsable/evidencia sobre la misma lista; sin duplicar tareas |
| 6 | Menú contextual por objeto | Tarea/reserva/proveedor muestran solo acciones útiles y permitidas; WhatsApp conserva receptor/borrador y estado |
| 7 | Borradores recuperables y reintentos seguros | Evitar doble envío/cobro/reserva; no cachear secretos/nómina; offline no se declara ejecución |
| 8 | Frescura visible donde cambia decisiones | Fuente/corte/cobertura en operación/dinero/precios; desactualizado no se sustituye por cero |
| 9 | Búsqueda y teclado coherentes | Comando/buscador distinguen objeto/acción, foco/retorno/44px/320px; nada esencial depende del color o animación |
| 10 | Estado de conexiones y costo útil | Un detalle de conexión/fallo/último éxito y consumo, avisos solo accionables; sin agentes de vigilancia duplicados |

Estos refinamientos concretan los100criteriosV1 existentes. No migranSQL, crean100tareas, duplican módulos o prometen beneficios todavía no medidos. Logos originales solo desde archivos verificados; maestroTORO exacto sigue ausente y se usa tipografía azul aprobada, sin inventar bull.

### Look final y cobertura visual

Renders final seleccionados: TORO_EMPRESARIAL_FINAL_DIA.png y TORO_EMPRESARIAL_FINAL_NOCHE.png, outputs de la tarea actual. Día arena clara/cabecera azul; noche carbón y superficies azul pizarra más claras. Tipografía/espaciado empresarial, sombras/textura discretas, Pendiente2, Favoritos9, rango, tabs y accesos contextuales a Directorio/Google/Respuestas/Caja/Personas. UI propia sin rosa/morado; marcas conservan identidad. Se corrigió la primera variante nocturna que tenía tarjetas demasiado claras; conservar solo la seleccionada como referencia.

Los renders son conceptos rotulados, con ejemplos de fechas/habitaciones y reproducciones gráficas. No importar esos ejemplos como datos reales ni sus logos como assets. La implementación usa fechas actuales/datos autorizados, bytes existentes y copy canónico. Cards con altura natural, sin forzar Pendiente a altura del widget; móvil no debe mostrar todas las secciones juntas. Render no certifica contraste/foco/44px/capacidad por habitación, widgetpublicado, sesiónPeople, feed o automatización. Herramientas/Personas/Dinero/Reportes/Cerebro/Mi espacio/Legal/Activos/Proyectos conservan destinos por permiso, aunque no todos estén abiertos en Inicio.

### NEXT: primer lote de construcción local

**Preparación concluida para empezar interfaz local.** Contrato mínimo People definido en documento de integración vigente: auth/contexto/vínculo y primer self-read de horario publicado; diez pruebas de aceptación preparadas, no ejecutadas. Resolver todo el SSO/conectores no es requisito para maquetar. Lectura People real, OAuthGoogle y dominio mantienen aceptación propia.

Única siguiente unidad: implementar sobre los componentes existentes cabecera/navegación/Inicio y entrada de catálogo con ambos temas, Pendiente2, Favoritos9 y estados honestos de capacidades. Mantener rutas00–11, gates, APIs y herramientas actuales. Si persistencia/autorización de favoritos/tareas no existe, no activar controles que simulen guardado; presentar capacidad pendiente o preparar flujo local claramente indicado. No añadir schemas, grants, dependencias, proveedores o configuración comercial por este lote.

Antes de código: confirmar estado/rama/aportes y main vigente solo en el delta necesario; no descartar la otra rama ni adoptar el deployment remoto por su READY. Leer guía Next instalada relevante según AGENTS. Reutilizar portal.module.css, module-card.tsx, portal-tool-links.tsx y page.tsx. Antes de rebuild revisar una vez recibo/puerto y detener únicamente runtime propio con su marcador; no procesos ajenos.

Terminado cuando el delta local existe, verificación apropiada pasa y hay evidencia sintética sin datos privados en320/390/PC, día/noche, teclado/foco, overflow, permisos y enlaces vigentes. Baseline641 es evidencia anterior conservada, no resultado nuevo. Cierre con mismo checkpoint/recibo y una siguiente acción. Publicación/Google/Peoplevivo/Krosswrite/WhatsAppconservan gates propios; no declarar Portal completo por maquetación.

Fuentes oficiales: [dominio Vercel](https://vercel.com/docs/domains/set-up-custom-domain), [nameservers](https://vercel.com/docs/domains/working-with-nameservers), [protección](https://vercel.com/docs/deployment-protection), [uso comercial](https://vercel.com/docs/limits/fair-use-guidelines), [Google/Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google), [redirecciones](https://supabase.com/docs/guides/auth/redirect-urls). Metadatos de proyecto/deployment fueron lecturas del conector Vercel; perfiles/calendarios de conectoresGoogle; código/contratos localmente revisados. No escrituras de proveedor.

## Apps móviles, OpenClaw y estilo híbrido único — 12/10/2026
**Decisión de Mauricio:** incluir Kross móvil, Pulse de Booking.com, Google Home y TTLock; investigar mejor uso de OpenClaw/Companion para después. En la próxima continuación iniciar el Portal. Afinar las cajas con bordes y aspecto corporativo; mezclar día/noche en un solo estilo elegante, tomando la segunda imagen nocturna como referencia. Esta sección supersede el selector y los dos temas de las propuestas anteriores; no elimina accesibilidad ni capacidades existentes.

### Estilo vigente para el próximo build

Un **estilo híbrido fijo**, sin selector día/noche ni cambio automático entre dos interfaces. Cabecera y navegación carbón/azul profundo; fondo azul pizarra; cajas mayormente azul pizarra más claro. Superficies arena/marfil reservadas a lectura intensiva, formularios o datos donde mejoren claridad, con texto oscuro. Mantener predominio y estructura de la referencia nocturna, evitando una mezcla arbitraria de tarjetas. TORO azul + OPERATION SYSTEM pequeño; sin rosado/morado en UI propia. Logos originales intactos.

Bordes definidos y consistentes en tarjetas/cajas/campos; radios moderados, sombra discreta y bandas de sección sobrias. Controles y foco distinguibles del borde decorativo. Altura según contenido, sin vacíos forzados ni brillo/neón. Aplicar el mismo lenguaje en móvil: Pendiente2, Favoritos9 en dos columnas cuando quepan, calendario de rango, pestañas y detalles desplegables. PC aprovecha tabla/lista+detalle, sin cambiar el contenido permitido. Texto principal14px, auxiliar≥12px, objetivos≥44px; validar contraste/forced-colors/reduced-motion, teclado y320px. Los tokens concretos se comprobarán en UI, no se declaran validados por el render. No generar otra ronda de imágenes antes del código.

### FUTURE: tres niveles de acceso, sin prometer apps nativas embebidas

1. **Abrir original:** botón contextual que abre web o app móvil donde el proveedor admita enlaces oficiales, con fallback claro. No inventar esquemas kross://, pulse:// o ttlock://. Registrar destino, plataforma y fecha de prueba. App instalada/sesión externa no equivale a permiso TORO.
2. **Mostrar información en TORO:** vistas propias con API/SDK oficiales, identidad y permisos por proveedor/dispositivo. Es la ruta preferida para datos útiles y consistentes; no requiere mostrar la pantalla completa de otra aplicación.
3. **Pantalla/control remoto:** piloto de un dispositivo identificado y capacidades verificadas, si aporta una función que no existe por API/web. scrcpy permite reflejar/controlar Android desde Windows/Linux/macOS, pero integrar ese stream/control en el Portal requeriría transporte, sesión, permisos, privacidad y recuperación. No es iframe de app nativa ni función ya disponible.

| Herramienta | Primera utilidad dentro de TORO | Evolución condicionada |
|---|---|---|
| Kross móvil | Abrir app/web autorizada; planner/reserva/POS desde contexto | Leer operación y enlazar objetos; API futura de nuestra cuenta, no contratada/activada. No rehacer PMS/widget ni asumir deep link de reserva |
| Pulse Booking.com | Abrir Pulse en móvil y Extranet en PC; enlace desde reserva/mensaje/review | Mensajes/plantillas/reservas/reputación según conexión autorizada. Pulse instalado no concede Connectivity ni demuestra API de Pulse |
| Google Home | Abrir Home/app/web oficial; acceso en Herramientas→Dispositivos | SDKAndroid/iOS, cuenta/casa/dispositivo, permisos y conectividad. No controlar dispositivos personales por pertenecer al hotel |
| TTLock | Acceso a app oficial; fichas de cerraduras bajo Activos/Herramientas | API/SDK: alias/habitación, modelo, batería/corte, gateway/conectividad, incidencias y registros autorizados. Cuenta/región/modelos/gateway y alcance por verificar |

Estas son vistas en Tools/Assets/Systems y vínculos a la operación, no nuevos módulos numerados, bases o proyectos. Mantener el mismo caso/reserva/tarea. Para tarifas/disponibilidad conservar una autoridad y dirección por campo: usar la relación existente con Kross cuando se verifique, evitando dos escritores automáticos Kross/Pulse. BookingConnectivity tiene onboarding y permisos/certificación propios; mensajes y reservas pueden tener alcances distintos.

**TTLock requiere filtrado incluso en lectura.** Algunos payloads oficiales incluyen códigos/material de apertura. Un adapter futuro entrega solo campos permitidos y elimina secretos antes de UI/IA/logs. Vista normal muestra identificador, vigencia y estado, no PIN/llaves maestras. Bluetooth/gateway/modeloWi-Fi determinan alcance real; indicador de gateway no garantiza estado instantáneo y ausencia de registros puede significar falta de sincronización. Apertura, alta/baja de llaves, generación/cambio/envío de códigos y revocaciones requieren autorización humana específica por cerradura/reserva/plazo y verificación. No probar comandos físicos ni leer códigos reales en esta preparación.

### FUTURE: sacar más provecho a OpenClaw sin duplicar TORO

Flujo único: Portal → identidad/permiso TORO → tarea canónica → ejecutor OpenClaw existente → dispositivo/comando autorizado → verificación → comprobante. TORO mantiene verdad, política, aprobaciones y estado; OpenClaw es ejecutor, no otro Cerebro/cola/memoria maestra.

Usos prioritarios a evaluar:
- Chrome Relay para pestañas seleccionadas/elegibles y flujos web autorizados cuando no haya API adecuada; no navegador embebido ni acceso indiscriminado a un perfil.
- Captura elegida de reporte/foto/audio y señal de notificación para proponer nota/tarea; no sustituir reserva Kross o pago por una notificación parcial.
- Entrega por los canales existentes y autorizados, con destinatario verificado, dedupe y recibo; abrir/copiar no se declara enviado.
- Ejecución acotada de tareas y diagnóstico de conexión con los workers/broker existentes, costo/tiempo/estado visibles; sin otro Gateway o scheduler.
- Un nodo móvil por vez, inventario mínimo de capacidades permitidas y piloto de lectura. Desconexión, permiso retirado y comando no soportado fallan cerrado; no extender capacidades por personalidad/agente.

La documentación actual de Android Companion incluye estado/info/permisos/salud, device.apps opcional, cámara/voz y notificaciones según permiso/configuración. **Inventariar apps no prueba control UI genérico** ni disponibilidad de app.launch. Los nodos anuncian capacidades concretas. OpenClaw Companion del plugin de escritorio y Android Companion no deben asumirse la misma instalación o sesión. Ningún emparejamiento, versión o capacidad efectiva de Mauricio se verificó en este lote.

Reutilizar el lane mobile/broker ya documentado; la memoria conserva una inspección histórica de ADB/scrcpy, no un controller operativo actual. El checkout histórico toro-openclaw-integration se comprobó únicamente por existencia de carpeta; fuentes/branch/runtime deberán revalidarse antes de editarlo. No instalar, iniciar, emparejar, conceder permisos, ejecutar comandos o abrir apps del móvil ahora.

OpenAI Developers: Computer Use puede ayudar a probar/automatizar interfaces web con resultado observable. La ruta AgentsAPI revisada usa navegador alojado, no control del teléfono del usuario. Evaluar solo si falta una capacidad en el ejecutor actual y hay beneficio/costo claros; no crear sandbox, sesión/API key ni cambiar arquitectura por mencionar el plugin. Skills agents y computer-use consultadas como guía; no automatizaciónWindows ejecutada.

### Aceptación de cualquier piloto móvil futuro

Identidad de dispositivo y propietario/ámbito; lista exacta de capacidades y permisos; cuenta del proveedor; un objeto de lectura no sensible; prueba negativa sin permiso; pérdida/reconexión; último éxito/corte/cobertura; comprobante y recuperación. Captura minimizada, sin claves/2FA/banca ni datos ajenos. Prioridad API/conector → capacidad nativa verificada → automatización semántica/selector → transporte → visión; no tocar por coordenadas como primera opción. La aprobación técnica de OpenClaw no reemplaza autoridad de negocio. Los comandos físicos TTLock mantienen su gate propio.

### Fuentes y próximo paso

Fuentes oficiales consultadas12/10/2026: [Kross](https://www.krossbooking.com/es), [Pulse](https://www.booking.com/propertyapp.en-gb.html), [Connectivity Booking](https://developers.booking.com/connectivity/docs/managing-endpoint-access), [HomeAndroid](https://developers.home.google.com/apis/android/overview), [HomeiOS](https://developers.home.google.com/apis/ios/overview), [TTLock guía](https://euopen.ttlock.com/documentPages/htmlPages/userGuide/getStartedEn.html), [dispositivos](https://euopen.ttlock.com/doc/api/v3/lock/list), [gateways](https://euopen.ttlock.com/doc/api/v3/gateway/list), [registros](https://euopen.ttlock.com/doc/api/v3/lockRecord/list), [códigos](https://euopen.ttlock.com/doc/api/v3/lock/listKeyboardPwd), [límitesTTLock](https://euopen.ttlock.com/documentPages/htmlPages/example/FAQEn.html), [nodosOpenClaw](https://docs.openclaw.ai/nodes), [AndroidCompanion](https://docs.openclaw.ai/platforms/android), [ChromeRelay](https://docs.openclaw.ai/tools/chrome-extension), [scrcpy](https://github.com/Genymobile/scrcpy), [AndroidAppLinks](https://developer.android.com/training/app-links/about), [OpenAIComputerUse](https://developers.openai.com/api/docs/guides/agents-api/tools/computer-use).

CURRENT: investigación y ajuste documental. DESCONOCIDO: cuentas/capacidades/runtime móvil/TTLock efectivos. FUTURE: adapters y piloto; no activaciones por esta sección. NEXT único e independiente: próximo CONTINUAR inicia frontend local cabecera/navegación/Inicio y catálogo, ahora en estilo híbrido único con bordes. Mantener100criterios/00–11/baseline641/SQL y gates. No otra ronda de investigación/renders ni integrar móvil/OpenClaw/TTLock antes de cerrar ese primer lote probado.


## Primer lote construido: Inicio híbrido y catálogo — 12/10/2026
**Ámbito:** presentación del Portal sobre servicios existentes, subsistemas00–11 y Dreamcatcher de referencia; reusable para contextos autorizados. No nuevos módulos, fuentes, tablas o runtime operativo.
**CURRENT / HECHO local:** código0aca34c y corrección78d9503 (78d9503efa4a3262fff1d384b3a92f979de5aa39) en codex/portal-local-reconcile-20261011. Cabecera TORO azul/OPERATION SYSTEM, contexto enlazado al espacio existente, hora real de Costa Rica, navegación compacta, agentes informativos sin señal (abreviados en móvil), estilo híbrido único con bordes/arena selectiva y sin selector día/noche. Inicio/Módulos/Catálogo funcionan como pestañas con teclado/foco; filtros por texto/sección conservados al cambiar vista. Pendiente muestra máximo2 resultados de la proyección existente, señal crítica, corte, cobertura parcial y selección truncada, nunca cero ante fallo. Lectura solo con rol/ámbito/gates existentes, server→slot; no proyección completa serializada como datos cliente. Favoritos máximo9, solo6 destinos existentes/revisados; PC3columnas/móvil2. Logos exactos intactos; no bull ni assets de render. IDs únicos entre favoritos/catálogo. Personas conserva el destino/notas autorizados, sin afirmar SSO.
**VERIFICADO:**82/82 pruebas dirigidas,0fallos/0saltos; TypeScript, lint afectado y buildNext16.3.8 exit0. Revisión independiente por lectura sin defectos materiales. QA Chrome existente, fixture temporal compilada desde componentes reales con identidad/datos sintéticos y stubs de navegación Next; no ruta de bypass/fixture añadida a la app.320×800/390×844/1280×575/1536×1024 sin desborde; 2columnas móviles/3PC en favoritos; filtros, vacío, detalle, tabclick/flechas/Home/End y conservación de búsqueda comprobados.73 textos visibles de Inicio: contraste calculado sin fallos contra fondos sólidos, mínimo12px; objetivos visibles≥44px, IDsduplicados0. Alto contraste/reduced-motion comprobados; se corrigió una placa que ocultaba Inicio seleccionado. Consola sin errores/avisos de app, logos cargados y6hashes del manifiesto válidos. Estas comprobaciones no son certificación integral WCAG ni aceptación de permisos reales.
**Fidelidad del lote:** referencia outputs/TORO_EMPRESARIAL_FINAL_NOCHE.png y dirección híbrida posterior; inspección view_image de concepto y capturas reales. Se compararon marca/descriptor, jerarquía, paleta/bordes, tipografía/densidad, logos, distribución3PC/2móvil, franjaagentes y controles. Viewport nativo del board1536×1024 probado; la imagen conceptual incluye móvil+PC y la captura es una sola vista de app, por eso no se exige coincidencia de píxeles. Diferencias intencionales: arena en Pendiente por última aprobación; navegación operativa actual; solo6 destinos; sin datos hotel ficticios, clima inventado, creación de proyecto, tareas/notas/guardar favoritos, captura/audio, widget alternativo o agentes activos. Motor Kross abre el original; rango/niños/reparto/widget siguen pendientes. Copy nueva limitada a estados de cobertura, acceso y capacidades realmente disponibles; no botones inertes ni envíos implícitos.
**LÍMITE material:** el arranque de prueba sin configuración/flags de QA respondió503 en Portal/Mi espacio/guía y APIs; no expuso navegación privada ni error framework. Se mantuvo el cierre de seguridad existente. No se activaron flags ni configuración por este lote; nueva pantalla con sesión real y lectura actual no verificadas. La prueba visual es de componentes reales con mocks sintéticos; no certifica la integración completa de app/SSO/fuentes o disponibilidad comercial. Builds no acreditan publicación.
**CONSERVADO:** main actualizado fb8ccfc incorporado por merge local sin perder el aporte de lavandería/menú. Baseline641 anterior conservada, no relanzada ni sumada a82. SQL aplicado previamente intacto. Cero cambios enpublic/dependencias/Supabase/env/grants/providers/DNS, cero escrituras operativas/reservas/cobros/cerraduras/envíos. Sin push/PR/merge remoto/deploy. Solo procesos QA propios3047/3048 detenidos, puertos cerrados; viewport restablecido, tabs QA cerradas, sin capturas reales privadas/contraseñas/cookies/tokens.
**Fuentes/evidencia exactas:** src/app/portal/page.tsx; src/features/portal/portal-workspace.tsx, portal-attention-summary.tsx, portal-clock.tsx, portal-header.tsx, portal.module.css; src/features/tools/portal-tool-links.tsx; src/app/my-toro/page.tsx. Guías Next instaladas server/client,CSS,Link leídas. work/portal-build-local/tests.json,next-build.log,fixture.tsx,bundle.mjs y forced-colors.jpg. Capturas outputs/TORO_PORTAL_BUILD_PC.jpg, TORO_PORTAL_BUILD_MOVIL_390.jpg, TORO_PORTAL_BUILD_MOVIL_320.jpg, TORO_PORTAL_BUILD_CATALOGO_PC.jpg, TORO_PORTAL_BUILD_CATALOGO_320.jpg. Export subordinado outputs/TORO_PORTAL_BUILD_LOCAL_EVIDENCIA.json y patch; no nueva fuente de verdad.
**Reversión:** revert selectivo78d9503 y0aca34c en ese orden después de inspeccionar aportes posteriores, seguido de build; no reset/clean ni rollbackSQL. Backups de registros enwork/portal-build-local/backup. Conservar todos los aportes/documentos.
**NEXT único:** validar esta nueva pantalla con la sesión real en el lane de QA local de lectura ya autorizado, reusando el controlador existente y configuración pública canónica temporal; sin repetir aprobación, cambiar permisos ni activar nuevos alcances. El503 sin configuración no se resuelve publicando o debilitando el guard. Primeramente comprobar nueva versión/configuración pública build+proceso, sesión/contexto/rol vigente; luego dos pendientes/alcance, seis destinos, Cerebro y regreso móvil. Sin guardar PII. WidgetKross/POS, personalización, PeopleSSO, dominio, móviles/OpenClaw/TTLock y resto del Plan siguen en su lugar, fuera de esta unidad.
**Criterio del siguiente cierre:** sesión/contexto legítimos y pantalla nueva realmente servida; cortes/cobertura/destinos comprobados o bloqueo preciso registrado; controles móvil/PC sin errores, sin escrituras ni exposición; proceso propio detenido y mismo Plan/checkpoint/recibo actualizados. No afirmar otras identidades/RLS, proveedores o producción por esa prueba.
**SP:** outputs/TORO_SP_CONTINUAR_BUILD_LOCAL.md actualizado para QA de esta versión; no rehacer diseño/renders/auditoría general.

## Portal público autenticado: autorización y candidato — 12/10/2026
**Autoridad:** petición directa de Mauricio con referencia1-1001761343.jpg: actualizar la versión y dar enlace público funcional. Supersede NEXT local-only anterior en esta misma línea; no autoriza costos nuevos, grants, pagos, mensajes externos, reservas, cerraduras ni escritores. Reutilizar proyecto Vercel toro-pr11-preview (prj_nxerFw9ciNews6tUMAah3GAlAJzs), team_zUbLBlOtoQBHDfGMYpDlg0XO y dominio toro.dreamcatcherhotel.com, sin afectar web/MX/NS del hotel. Rollback producción previa dpl_6kfxNwdiEbfjijCLGLNFtmHBUrrR SHAf1f218f691daecce23db00e60aa9b5c577758e93. Resultado final y URL comprobada se registrarán en checkpoint canónico INTEGRACION_LOCAL_VALIDADA.md.
**CURRENT candidato:** look azul oscuro adjunto, login corporativo, ocho pestañas, Pendiente2 existente por rol, hasta9 favoritos seleccionables por sesión, catálogo buscable/seccionado, nuevos shortcuts POS/WhatsApp/Alegra/Gmail/Drive/Home revisados y acotados al mismo contexto hotel autorizado. Son destinos públicos, sin nuevos datos/grants/conectores. Módulos00–11 conservados. Caja CRC/USD simultánea, denominaciones enteras/centavos/diferencia opcional, copia/fallback/reinicio; calculadora sin eval/división0 controlada. Plantillas de operación editables/creables/eliminables efímeras, copiar y abrir WhatsApp/traductor con envío humano. No nueva base ni cola.
**Seguridad de publicación:** modo despliegue portal distinto de internal/demo: allowlist GET/HEAD, login/Portal/MiTORO/Cerebro/guía/booking-assist y solo APIs contexto+atención autenticadas; unknown, legacy, writer, ServerActions y otros runtimes denegados incluso con flags heredados true. Cache private/no-store y redirecciónnext endurecida. Config pública canónica, rpc_v1 y lecturas Brain/Owner Attention; legacy/write false. Protección Vercel all_except_custom_domains no sustituye auth/RLS. El candidato se prueba antes de merge y asociación. Publicar no reactiva worker/MCP/cron.
**Widget:** snippet público exacto leído en widget6 Kross12/10: jquery3.4.1 aspnetcdn + data.krossbooking.com/widget/v6/dreamcatcherhotel/6.{css,js}, div.kross-container. UI Kross declara versión9; los paths son los que entrega el proveedor. Sandbox sin acceso a cookies/DOM/almacenamiento TORO. Sin cambios de configuración PMS ni compras/reservas. Exige prueba visual/carga/rango/niños/varias habitaciones; motor completo siempre disponible como fallback.
**TARGET conservados:** datos PMS/OTA vivos y reconciliación por reserva, bancos y comprobantes/caja contable, tareas persistentes/de equipo, directorio completo verificado, PeopleSSO/GoogleOAuth, media/AI/traducción integrada, agentes con heartbeat real, preciosSP04, capacitación/mercadeo/reportes automáticos, Chrome/OpenClaw/TTLock/Home móvil y revisión semanal. Ninguno se afirma terminado por enlace o render. Sin capacitación o autonomía ficticia.
**Verificación:** pruebas de rutas/roles/origen/contexto/finanzas, lint/TypeScript/build, QA real local o preview y móvil/PC, negativa anónima y legacy, SHA exacto desplegado y HTTP/TLS del dominio. Sin PII/cookies/secretos en recibos. No repetir inventarios generales.
**NEXT de esta unidad:** terminar build/QA, preview de rama exacta, PR/merge y release autenticado; registrar evidencia, cualquier límite comercial y un solo siguiente paso en checkpoint existente.

## CURRENT publicado: TORO Portal V1 — 12/10/2026
Enlace público HTTPS comprobado: https://toro.dreamcatcherhotel.com/ (redirige a/portal); entrada directa https://toro.dreamcatcherhotel.com/login?next=/portal. PR266 integrada: main86e14ed10ecff52104890af88e3a57c0e104bf61; árbol idéntico al candidato6fc39ac. Producción dpl_rg9HwdaHe3vo2o1MTc6ayukwtrFK READY, dominio verificado/asociado al proyecto existente, sin cambios DNS/MX/NS. La web del hotel sigue HTTP200 y MX smtp.google.com/1. Rollback inicial f1f218f/dpl_6kfxNwdiEbfjijCLGLNFtmHBUrrR preservado.
Config pública existente conserva origen canónico; seis flags añadidos en Production y Preview de esta rama: portal, Brain/Owner Attention true, rpc_v1, legacy/write false. ConectorENV403 resuelto mediante sesión administrativa Vercel existente; no nuevas claves/grants. Guard portal bloquea writers incluso si hubiera flags heredadas true. Sin cambio de plan ni compra; badge Pro observado, facturación/costos incrementales no auditados.
QA anónima externa del dominio: /,/portal,/login HTTP200 con entrada y sin navegación/datos del hotel; APIs contexto/atención401 sin payloadprivado; legacy, /.env y POST acciones/aprobaciones404; private/no-store. Assets oficiales200. QA con ADMIN y contextoDreamcatcher en build local del mismo árbol, sin datos/cookies/credenciales de cuenta guardados: Pendiente acotado,12destinos/9favoritos, caja CRC/USD exacta/copia, calculadora y plantillas efímeras, rangoKross1apertura/2habitaciones/niñoedad4/resultadosoficiales, ninguna reserva. Móvil320/390 yPC1280 sin desbordamiento/IDsduplicados; estilos originales de Kross se mantienen aislados y fallbackexterno siempre visible.713pruebas propias,208relevantes tras ajustes,15preflight,lint/TypeScript/build y2workflowsGitHubverificados. No sumar subconjuntos al baseline histórico641.
Las señales antiguas/estado unknown se muestran Por verificar, sin afirmar deuda, pago pendiente ni urgencia actual por fecha. No se ocultaron ni cerraron registros. Perfil/identidad actuales visibles; editor onboarding queda fuera del modo publicado, y su enlace se retira en seguimientoPR269. La aceptación del login ADMIN desde el dominio nuevo queda por comprobar con Mauricio; validación local y negativa pública no la sustituyen.
SSODreamTeam/GoogleOAuth, persistencia de tareas/favoritos/plantillas, bancos/PMS/OTA/reportes automáticos, AI/media y autonomía/dispositivos siguen TARGET según contratos previos. Esta publicación no los activa ni declara completa la herramienta integral. Estado/deploymentfinal del seguimiento y recibo se mantienen en checkpoint canónico INTEGRACION_LOCAL_VALIDADA.md; los outputs son exportes subordinados. NEXT único: completar aceptación de ingreso/rol/regreso al Portal en el dominio público, sin exportar sesión; después escoger una sola unidad del backlog existente.

## Revisión solicitada: acceso DreamTeam y densidad — 12/10/2026
Mauricio reporta fallo con su acceso habitual y ratifica TORO_EMPRESARIAL_FINAL_NOCHE.png como referencia. La unidad actual corrige autenticación y densidad sobre el Portal existente; no rehace inventarios, producto ni los cien criterios anteriores.

CURRENT candidato: el formulario publicado acepta usuario o correo y contraseña literal. Un adaptador de autenticación en el servidor envía un inicio nuevo al endpoint HTTPS fijo de DreamTeam, que conserva resolución de usuarios, verificación y limitación de intentos. No deriva correos de usernames ni añade claves de servicio. El Portal comprueba la identidad en Supabase canónico, roles/contexto, cambio obligatorio de contraseña y enforce_user_session antes de emitir sus propias cookies de host. Solo POST /api/auth/login se añade al perímetro; escritores operativos y Server Actions siguen cerrados. JSON limitado2KiB, origen exacto, sin redirecciones del proveedor ni cookies/Authorization entrantes reenviadas; salida sin tokens o datos de cuenta. Refresco SSR para lecturas admitidas; cierre de sesión local desde Menú.

| Campo | Autoridad | Uso y límite |
| --- | --- | --- |
| Usuario → identidad | DreamTeam app_users + Auth existente | Resolución del proveedor; sin nuevo directorio ni usernames inventados |
| Contraseña | Supabase Auth a través de DreamTeam | Solo transporte del inicio solicitado; sin registros, exportes o almacenamiento del agente |
| Roles y organización | user_roles activos/no revocados + resolver TORO | Revisión al consultar; personalización no amplía acceso |
| Vigencia/revocación | user_sessions/enforce_user_session existente | Se registra actividad de seguridad; no son movimientos hoteleros |
| Cookies | Sesión Auth nueva, validada por Portal | HostOnly/Path/secureHTTPS/lax; no se extrae sesión activa de DreamTeam |

La misma cuenta no equivale a SSO automático entre orígenes: cada sitio conserva su sesión. SSO recíproco sigue TARGET. La política existente de sesión tiene inactividad30min y límite absoluto también condicionado por la expiración original del JWT; no prometer12h garantizadas. Las llamadas de este adaptador pueden agruparse por IP de Vercel en el limitador original; conservar protección y observar429, no debilitarla ni reenviar IPs arbitrarias.

Verificación focal: RPC enforce_user_session existe en public, firma(text,text), authenticated EXECUTE; consulta de catálogo sin datos personales ni SQL de cambio. Endpoint DreamTeam responde400 a JSON vacío, sin intentar credenciales. Pruebas de origen/límites/cookies/errores/revocación/roles/organizaciones y refresco, sin cuentas/grants/migraciones/secretos. Candidato pendiente de build, preview y publicación exacta; login real con la cuenta habitual sigue aceptación humana.

Dirección visual vigente: azul oscuro corporativo, TORO azul y descriptor pequeño, bordes definidos, sin selector de tema ni rosa/morado propio. Altura natural, filas y accesos compactos; favoritos9,2columnas móvil/3PC. Procedencia/cobertura completas desplegables, manteniendo señal parcial visible. No tablas de habitaciones, agentes activos o integraciones simuladas. PMS/OTA/finanzas vivos, tareas persistentes/de equipo, IA/media, People completo y dispositivos mantienen su backlog original; este arreglo no los declara terminados.

NEXT único al publicar esta unidad: comprobar ingreso con el usuario habitual en toro.dreamcatcherhotel.com y contexto esperado; no pedir ni exportar contraseña, cookie o token. Estado final, SHA/deployment y límites quedan en el checkpoint canónico INTEGRACION_LOCAL_VALIDADA.md. Reversión selectiva por PR y despliegue previo; sin reset ni rollback de datos.

## Acceso: configuración y navegación posteriores al ingreso — 12/10/2026
CURRENT comprobado: un artefacto público anterior llevaba una clave publishable rechazada por Auth401. Se corrigió la variable existente con el valor público ya vigente del mismo proyecto, sin crear/rotar claves ni ampliar accesos. El nuevo bundle coincide y Auth devuelve200. Con el formulario existente, el acceso llegó a/portal; una carga completa mostró Inicio/Dreamcatcher. Evidencia focal y límites en docs/evidence/TORO_PORTAL_LOGIN_INCIDENT_2026-10-12.md; no se atribuyen todos los incidentes históricos a una misma causa.

El éxito de DreamTeam abre ahora un documento nuevo para descartar una vista anónima conservada en Router Cache; mantiene safe-next y limpia el campo de contraseña. Legacy y diagnósticos de PR270 se conservan. Verificación local97pruebas de acceso/refresco/navegación, TypeScript/lint/build; entrada inmediata del candidato publicado todavía requiere aceptación. Reversión: reconstruir la referencia elegida con la configuración pública válida y verificar el ingreso; promover un bundle anterior puede restablecer el fallo. El estado final se registra en el checkpoint canónico existente; no hay nuevo sistema, base, scope ni autonomía activada.

## Portal completeness and document-based close — 2026-10-12

The owner requests a complete permitted tool catalogue, simpler task-based navigation and one governed document-to-close workflow across Portal, WhatsApp and email. This extends section23 Human Experience and existing TORO Tools / Comms / Finance, not a second master plan, registry, inbox, ledger or scheduler.

Written specification: [Portal completeness and document close](../superpowers/specs/2026-10-12-portal-completeness-and-document-close-design.md). Status: PROPOSED_WRITTEN_SPECIFICATION, not implemented or activated. Recommended units: permitted catalogue/projection; navigation; original custody; saved close draft; verified WhatsApp intake; existing Alegra native writer acceptance; canonical-state convergence. Preserve source authority, scopes, roles, original currencies and evidence. No document receipt implicitly authorizes posting, payment or Finalize Day.

Owner-login acceptance and metadata corrections are already evidenced separately. Runtime channel binding, current Kross financial sources, native accounting writer and private originals remain acceptance dependencies. The complete internal link inventory, private source identifiers and native financial evidence remain outside this public repository. Architectural implementation follows written-spec review and the existing plan/PR/verification path.

## Portal: superficies claras selectivas — 12/10/2026
Ámbito: sección23 Human Experience, presentación del Portal existente. Mauricio autoriza algunos fondos claros sobre el look azul compacto. Se refinan Pendiente, Personas, favoritos, entrada de búsqueda, utilidades y conteo CRC/USD con arena/azul claro/verde marfil, texto oscuro, foco según entorno y bordes. Navegación/gates/datos/altura natural permanecen; no implementación de la especificación documental ni activación de conectores, escritores o autonomía por este lote.

Verificación focal:64 pruebas Portal/página, build/TypeScript y revisión independiente; QA sintética de componentes reales en320/390/1280 sin overflow, logos cargados y lectura clara; conteos CRC40000/USD100 independientes comprobados, movimiento reducido y alto contraste del sistema respetados. Límites: contraste medido en hojas de texto sobre fondos sólidos, sin certificación WCAG global ni datos reales. Estado de publicación y SHA final en el checkpoint canónico; no plan paralelo. Siguiente unidad del backlog se elige después de este cierre visual.

## Portal: continuidad visual en todas las páginas — 13/10/2026
La misma sección23 Human Experience y dirección aprobada se extienden a las ocho pestañas del Portal, Mi espacio, guía del turno, Cerebro, cotizador y acceso. Consultas azul claro y módulos marfil con acentos por área, marco azul corporativo, formularios compactos y textos secundarios desplegables. Guía2columnas móvil cuando cabe/3PC; caja mantiene CRC/USD juntos, con denominaciones en2columnas por moneda enPC y totales en fila. Sin nuevas conexiones, cuentas, permisos, cambios de auth, destinos, validaciones o escritores.

Candidato verificado:98 pruebas dirigidas de Portal/páginas/Cerebro/cotizador, lint y compilación; revisión CSS independiente con correcciones de foco y estados de búsqueda. QA sintética con componentes y Tailwind reales en320/390/1280: sin overflow de página, imágenes cargadas, controles visibles44px y hojas de texto legibles sobre fondos sólidos. Incluye buscador vacío/feedback, evidencia desplegada, Cerebro mapa/lista/detalle y acceso/contexto; alto contraste y movimiento reducido conservados. No certificación WCAG integral ni nueva aceptación de sesión o datos de operación. SHA, preview, CI y publicación final se registran en el checkpoint canónico; el backlog funcional conserva su propia aceptación.

## Portal: catálogo revisado unificado — 13/10/2026
Sección23 Human Experience y TORO Tools/Identity. Primera subunidad de A sobre los accesos ya aprobados: seis destinos de la RPC acotada y seis superficies públicas de navegación. Catálogo compartido en Herramientas y guía del turno, búsqueda por nombre/propósito/sección sin acentos, agrupación con conteos, limpieza de filtros y fallback de presentación sin marca. Mi espacio conserva seis atajos y abre el catálogo completo de esta consulta; la guía incluye POS/Alegra como accesos externos para revisar cobros. Favoritos siguen siendo por sesión; no nuevo registro o persistencia simulada.
La opción de presentación del lector añade solo navegación previamente aprobada después del mismo control de identidad/rol/organización. Una caída del directorio conserva los seis destinos públicos y estado parcial; correo de cuenta no sustituye autorización. RPC/RLS/grants/usuarios/rutas/destinos/conectores/escritores permanecen. Catálogo encontrado o enlace disponible no demuestra sesión compartida, sincronización ni ejecución nativa.
La lectura agregada del registro actual confirma243fichas v2.0 y referencias mixtas/históricas; no hay fecha registrada en destination_verified_at para las fichas. Las seis URLs exactas aprobadas de la RPC siguen siendo la frontera de lectura. No se exponen las restantes fichas ni se modifica su revisión. A completo y ampliación de proyección siguen TARGET hasta revisión de cada destino/alcance y aprobación del cambio acotado; no se declara100%del registro.
Verificación candidata:139 pruebas dirigidas y lint; QA de componentes/Tailwind reales con datos sintéticos en320/390/1280, búsqueda/limpieza/conservación de filtros, recorrido Mi espacio→catálogo, grupos, cobertura parcial, foco/targets/IDs y negativa de acceso. Compilación local afectada por memoria y C: reportando0MB; la eliminación de caché fue bloqueada por aprobación automática. La compilación completa remota, CI, preview y publicación deben acreditarse en el checkpoint antes de cierre. No se debilitan gates ni se crean permisos para superar el problema local.

## Portal: catálogo interno completo con RPC activa — 14/10/2026

Sección23 Human Experience y TORO Tools/Identity. La fuente sigue siendo la fila canónica `dreamcatcher_system_database_directory_v1` versión2.2; no se crea otra base, directorio o fuente. El candidato separa `links` operativos de `catalogueItems`: Inicio, Favoritos, paneles y guía del turno conservan únicamente la allowlist revisada, mientras ADMIN/GERENCIA pueden consultar las 244 fichas saneadas en Herramientas. JEFE_DEPARTAMENTO/AUDITOR mantienen la proyección revisada de `dreamcatcher_tool_links_v1`; los demás perfiles no reciben el catálogo.

La vista completa busca nombre, propósito, proveedor, proyecto, categoría, estado, ciclo de vida, prioridad, tipo y ámbito; filtra proyecto/categoría/estado y entrega lotes progresivos de48 hasta244. Cinco fichas sin URL se presentan como `Destino pendiente`. Cada ficha conserva proyecto, categoría, estado, ciclo de vida y ámbito visibles; así las20 referencias de archivo no parecen vigentes cuando su estado es ambiguo. Su presencia no acredita sesión, integración, vigencia comercial ni capacidad de ejecutar acciones. Registros históricos, pendientes o de otros proyectos no se convierten en favoritos ni accesos rápidos.

Contrato activo: la migración `20261015053402_dreamcatcher_tool_catalog_v1` aplicó la RPC aditiva `public.dreamcatcher_tool_catalog_v1()` como `SECURITY INVOKER`, con fila/org/propiedad/key exactos, RLS vigente, `auth.uid()` y rol ADMIN/GERENCIA, máximo1000, IDs únicos, visibilidad interna y solo13 campos saneados (`id`, `name`, `url`, `purpose`, `project`, `category`, `provider`, `state`, `lifecycle`, `priority`, `link_type`, `scope`, `home_eligible`). `PUBLIC`, `anon` y `service_role` no tienen ejecución; `authenticated` sí. Los SQL de aplicación y reversión selectiva con guardia del cuerpo exacto, sin `CASCADE`, viven en `supabase/drafts/dreamcatcher_tool_catalog_v1*.sql`; la reversión permanece preparada, no ejecutada.

Readback de producción: la fuente permanece en una fila, versión2.2, con244 entradas y244 IDs. Una identidad ADMIN/GERENCIA autenticada recibió244 filas:5 destinos vacíos,20 referencias de archivo,0 protocolos inseguros y0 URLs con parámetros sensibles. Una identidad autenticada sintética sin ADMIN/GERENCIA recibió0 filas; no existe hoy una identidad exclusivamente JEFE_DEPARTAMENTO/AUDITOR para repetir la negativa con ese perfil real. Metadatos y privilegios coinciden con el contrato y el asesor de seguridad no añadió hallazgos sobre la función. La lectura completa es opt-in y solo la solicitan `/portal` y `/my-toro/herramientas`; Mi espacio conserva la RPC v1. PR288 fue fusionado en `2320fb66300857b1c350e75fe8feac245ed7ca12` y Vercel `dpl_HfFvnfzJSAdZKsb8UdwQQHyx8ZPy` quedó READY en el dominio canónico. La aceptación con `admin@dreamcatcherhotel.com` comprobó244 fichas,5 pendientes,6 accesos rápidos y9 favoritos.

**Reversión:** retirar el código mediante reversión selectiva del commit y, si se revierte el contrato de datos, revocar y eliminar únicamente `dreamcatcher_tool_catalog_v1()` con el script dedicado, después de comprobar dependencias y la huella exacta. No tocar la fila canónica ni la RPC acotada v1.

**Cierre de publicación:** cumplido para el catálogo completo ADMIN/GERENCIA. DDL, roles, CI, despliegue exacto, HTTP,244 fichas,5 pendientes y separación de Inicio/Favoritos/paneles fueron verificados. No inferir conectores activos por mostrar enlaces.

## Portal: Google Hotels en la proyección reducida — activo 15/10/2026

Sección23 Human Experience y TORO Tools/Identity; alcance Dreamcatcher. La migración `20261015220909_dreamcatcher_tool_links_v1_add_google_hotels` amplió `public.dreamcatcher_tool_links_v1()` de6 a7 destinos y añadió únicamente el ID/URL exactos de `LINK-244`. El cuerpo activo tiene huella `d31196c3bc2a570413bb06fe111c8742`, es `SECURITY INVOKER`, `STABLE`, usa `search_path` vacío y mantiene ejecución denegada a PUBLIC/anon/service_role y concedida solo a authenticated. La fila, organización, propiedad, roles y RLS canónicos permanecen sin cambios.

Readback de producción: una identidad ADMIN/GERENCIA autenticada recibió los7 IDs exactos y el destino esperado de Google Hotels; una identidad autenticada sintética sin esos roles recibió0 filas. El asesor de seguridad no añadió un hallazgo sobre esta función. Hay4 usuarios ADMIN/GERENCIA y0 usuarios exclusivamente JEFE_DEPARTAMENTO/AUDITOR, por lo que la aceptación con un perfil real de ese segundo grupo sigue no disponible; no crear identidad ni asignar roles para fabricarla.

Aplicación y reversión selectiva quedan versionadas en `supabase/drafts/dreamcatcher_tool_links_v1_add_google_hotels*.sql`. El rollback restaura el cuerpo exacto de6 enlaces y rechaza una huella inesperada; no borra la función, no usa `CASCADE` ni modifica filas. PR296 es la ruta de revisión y publicación del contrato; el recibo final de merge y despliegue se conserva en el checkpoint canónico, sin convertir el enlace en prueba de sesión compartida, integración comercial o vigencia de una cuenta externa.

## Regla transversal de metadata y próxima portada — 15/10/2026

Sección23 Human Experience, TORO Brand y Builder. Todo build web futuro y toda web existente cuando se modifique debe verificar antes de publicación: favicon/iconos propios y oficiales; título, descripción, canonical y metadataBase; imagen Open Graph y Twitter/X accesible; idioma, manifest y política robots; sitemap y datos estructurados solo cuando correspondan al contenido público real; además de carga, móvil, accesibilidad, enlaces, rendimiento y seguridad del delta. La prueba se hace sobre HTML y recursos publicados, sin datos privados; un archivo presente o CI verde no basta.

Auditoría del Portal: la producción tenía únicamente título/descripción genéricos y un favicon predeterminado de Vercel; faltaban Open Graph/Twitter, canonical, manifest y robots. El candidato añade metadata y tarjeta social tipográfica sin inventar un isotipo, manifest y noindex/robots cerrado porque el Portal es privado. No crea sitemap ni datos estructurados públicos sin contenido indexable. El favicon TORO sigue bloqueado hasta obtener el maestro o un derivado pequeño aprobado y verificar su linaje contra toro_logo_master_v1.

Mauricio no aprueba la portada actual como dirección definitiva y anticipa una página nueva. Ese rediseño debe partir de objetivo, audiencia, conversión, navegación, contenido y activos oficiales; separar TORO universal de Dreamcatcher huésped/público y respetar la fuente canónica. Este registro autoriza preparar y revisar, pero una portada nueva requiere aceptación visual y publicación verificadas como unidad separada.

**Conciliación cloud del maestro TORO — 15/10/2026:** PUMBA aplicó la jerarquía vigente: Airtable `TORO OS — Master Brain` define el registro estructural, Supabase conserva manifiestos/proyecciones migradas y Dropbox custodia los bytes originales. En Airtable, `08 Assets Registry` no devolvió `toro_logo_master_v1`, su SHA canónico ni un registro de `TORO OS LOGO.jpg`; los toros azules encontrados están clasificados como arte de marca/galería y soporte web, no como logo. Los manifiestos `integrations.document_manifest`, `integrations.media_file_manifest`, `integrations.media_intake_archive` y Supabase Storage tampoco devolvieron el nombre, SHA o alias cerebro-chip. Ambos vínculos Dropbox devolvieron cero para el nombre canónico; la búsqueda por alias produjo siete candidatos descargables, pero sus SHA-256 y dimensiones no coinciden. `TORO OS LOGO.jpg` es 4416×4416, SHA-256 `932b6a105a4ef3525b0d7b15213173ba76168f687d3fc254d3b9580b9f9770f7`, y visualmente corresponde al toro azul anterior sin el emblema cerebro-microchip. No se usará como sustituto ni se reinterpretará la aprobación de galería como autoridad de marca.

**Decisión TORO/PUMBA:** nube y trabajo local son compatibles si cada artefacto conserva autoridad, evidencia y destino: las bases describen y gobiernan; Dropbox debe aportar los bytes; GitHub prepara el cambio; Vercel verifica la salida. La ausencia del archivo en un conector no autoriza generar otro. PR297 permanece draft hasta recuperar el maestro exacto o un derivado de favicon aprobado y trazable. No existe una decisión previa en la Bandeja de decisiones, el portafolio, las tareas o Governance Rules que permita sustituirlo.

**Excepción aprobada por el propietario / favicon interino — 15/10/2026:** Mauricio autorizó explícitamente usar cualquier logo o favicon disponible porque el maestro actual no pudo localizarse. Para el alcance acotado de favicon e icono de aplicación se seleccionó el activo de Dropbox `blue-bull-premium-close-up-gallery.png` (`768×768`, SHA-256 de origen `3767585343327970af6fb4a39790089d4a765e155208458f9fea1620b23fc384`). Los derivados son `src/app/favicon.ico` (SHA-256 `94d0fd098cc99dd7cbca162e83bf55721dca224ba3df1dcf0a2c42a6718b4e01`), `src/app/icon.png` (SHA-256 `df2038d1e82e7ba71e73cfff00ddf0dfed6da594f9a5e9053acd48b1b670e3c9`) y `src/app/apple-icon.png` (SHA-256 `4946c4c00b37ee7a2e3cffa65b9db7eb71ae459e013a6e5f69b7b3638b2c9ab4`). El maestro oficial no cambia. PR297 puede avanzar a revisión y preview; la publicación en producción sigue siendo un gate de release separado.
