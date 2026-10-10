# TORO — Plan General

**Status:** CURRENT MASTER PLAN
**Date:** 2026-09-28
**Master product:** TORO
**Visible brand/product:** TORO
**Reference implementation:** Dreamcatcher Hotel
**Current readiness:** INTERNAL PROOF — external onboarding blocked by readiness gate

---

## Reporte de recepción integrado y preparación operativa 2026 10 08


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

Current identity evidence:
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
- Google marketing: Search Console for `dreamcatcherhotel.com` is active; `DREAMCATCHER HOTEL - GA4` is associated; Google Ads and Hotel Center account ownership remain unverified;
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

## Notion
Narrative planning/research/working memory.

## Vercel
Deployment/runtime evidence.

## Kross
Live PMS authority.

## Alegra
Fiscal/accounting authority.

## WeSpeak
Active guest communication runtime.

## OpenClaw
Same-Brain code path exists; live Gateway/channel identity/capability parity remains configured-unverified until host acceptance.

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

#### Quality proof — salto de nivel medible (solicitud 2026-10-07)

**Dirección del dueño:** mejorar drásticamente la calidad y resultados de TORO y Dreamcatcher (aspiración «20 veces»). Es una exigencia de calidad y mejora continua, **no** una multiplicación demostrada, una nueva prioridad que desplaza bloqueos P0 ni una autorización global para ejecutar, gastar o publicar. El criterio es demostrar mejoras frente a un baseline verificable.

- **Q0 — Evidencia antes que estado:** para cada paquete B0–B6 conservar SHA exacto, origen, fecha/hora, entorno, prueba y resultado, riesgo, responsable, dependencias y rollback. `READY`, porcentaje de avance y capturas aisladas no sustituyen verificación; registrar `NOT_TESTED` donde falte evidencia.
- **Q1 — Conversión sin fricción:** una persona puede abrir la portada, identificar una estancia apta y consultar fechas por la ruta oficial, en ES/EN y en móvil de 390 px, sin tutorial, cuenta ni una vista oculta obligatoria. Medir completitud de tarea en pruebas humanas; el objetivo de éxito se define tras baseline, nunca se declara logrado por diseño.
- **Q2 — Verdad y continuidad comercial:** comprobar fecha del hotel, salida posterior, adultos/menores con edades reales si procede, habitaciones compuestas, moneda, mapping y handoff oficial. Ante foto o mapeo ausente mantener contacto/búsqueda general accesibles y señalizar la incertidumbre; no mostrar cotización final inventada.
- **Q3 — Experiencia accesible:** ninguna interacción crítica bloqueada por consentimiento, overlays, foco, idioma, teclado, movimiento o zoom 200%; contrastes AA según el componente; pruebas de reflow en 320/360/390/430 px y de escritorio a zoom 100%. Safari/iPhone y Android requieren evidencia propia.
- **Q4 — Rendimiento verificable:** objetivos de Core Web Vitals de campo p75 por dispositivo: LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1. Usar medición laboratorio como señal previa, no atribuirla a producción o tráfico real. No sacrificar identidad fotográfica auténtica ni accesibilidad por mejorar un score.
- **Q5 — Atribución a utilidad, no clics:** distinguir visita → consulta de estancia → búsqueda → intento de handoff → reserva confirmada en Kross → contribución atribuible cuando los costos sean observables. Rechazar analítica con PII, edades, contenido de mensajes o eventos duplicados; respetar consentimiento. Definir baseline de tasa de conversión, incidencias y tiempo de gestión antes de anunciar mejoras porcentuales.
- **Q6 — Evitar complejidad adicional:** la mejora solo puede reutilizar `dreamcatcher_website`, PR/issue existentes, componentes de web, `operations.*`, Control Plane, Kross, Dropbox y conectores autorizados. No nuevo CMS, runner, cola, identidad de proyecto o esquema de eventos por default. Eliminar o absorber duplicados solo tras comparar dependencias, con recuperación y autoridad explícitas.
- **Q7 — Verificación humana y cierre:** fotografía correcta y derechos acreditados por unidad, políticas públicas vigentes y prueba real de elección de alojamiento; no extrapolar de perfiles sintéticos. Liberación B6 exige gate Channel Truth cerrado, revisión comercial, accesibilidad, QA de la versión exacta y autorización separada del propietario.

**Indicadores de mejora:** reservas directas confirmadas y contribución; porcentaje de tareas críticas completadas sin asistencia; errores de reserva y solicitudes repetidas a recepción; tiempo humano invertido en cerrar el flujo; defectos P0/P1 abiertos; cobertura de pruebas por dispositivo y cumplimiento del presupuesto de rendimiento. Comparar periodos y segmentos equivalentes, con fecha de baseline, volumen de muestra y atribución conocida/desconocida. Si un indicador empeora, no promover la mejora sin investigar. Un «20x» solo sería afirmable para una métrica explícita con denominador, periodo, datos y verificación suficientes.

**Próximo cambio seguro:** añadir pruebas de regresión y corregir el defecto de fecha local B1 solo sobre el candidato reconciliado B0; después implementar una única sección visual B2 y comparar contra el baseline. Mantener `DC2-022` bloqueado para publicación; ningún documento, PR o despliegue preview satisface por sí solo el release gate.

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
