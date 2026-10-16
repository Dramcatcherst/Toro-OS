# TORO — Contrato transversal de alineación de datos y fuentes (Alegra / Supabase / Kross / Booking / Airtable / Drive / Dropbox)

**Estado:** CONTRATO PUBLICADO en Plan General (PR #299 fusionado), ampliado con piloto de observaciones y preparación de catálogo; SIN sincronización continua ni escritura en Alegra acreditada. **Fecha:** 2026-10-15 (Costa Rica).  
**Autoridad superior:** [Plan General único](TORO_BRAIN_GENERAL_PLAN.md), `TORO_BRAIN_CONSTITUTION.md`, `START_HERE.md` y `toro-context.yaml`. Este documento es una extensión subordinada, NO otro plan ni una segunda plataforma.  
**Ruta existente de Alegra:** `docs/superpowers/specs/2026-09-23-toro-brain-alegra-connector-v2-design.md`; reutilizar el conector y las colas existentes. La implementación del escritor continúa en PR #228, sin activarla mediante este documento.

## 1. Decisión y alcance

**No fusionar físicamente todas las bases ni imponer un esquema idéntico a proveedores diferentes.** Compartir contratos de identidad, propietario del dato, eventos, equivalencias, evidencia, controles y proyecciones; cada sistema conserva su autoridad. Una acción pasa por **Intent → Policy → Approval → Execution → Verification → Receipt → Memory**. El propietario solicita que **toda nueva integración, investigación, conciliación y decisión de negocio se incorpore al Plan General canónico** con fecha, estado, vínculo, responsable y prueba. No abrir backlog, espejo, Brain, módulo o base paralela.

| Dominio | Autoridad | Supabase/TORO | Proyección/archivo |
| --- | --- | --- | --- |
| Reserva, estado, inventario vivo, tarifa y cobro reflejado en PMS | **Kross** | espejo operacional con `source_is_live`, `snapshot_as_of`, source ID; jamás promo de snapshot a vivo | Booking/OTA son evidencia externa del contrato comercial |
| Precio acordado específicamente en una reserva Booking | **Confirmación completa Booking al huésped** (impuestos y cargos obligatorios, modificaciones) | conciliación junto a precio/desglose Kross; discrepancia conservada | Google Sheet de auditoría, NO verdad comercial corriente |
| Facturas emitidas/recibidas, pagos contabilizados, saldos y cuentas | **Alegra** (estado nativo contable); **Hacienda** para aceptación fiscal | enlaces a IDs nativos, seguimiento, clasificación, verificación y alertas, NO segundo libro mayor | Originales adjuntos al documento correcto de Alegra y respaldo independiente gobernado |
| Movimiento real de dinero | **Banco/procesador/comprobante contrastado** | conciliación con PMS/Alegra, moneda, fecha y referencia, sin declarar cobrado por mera factura | soportes originales bajo ACL |
| Tareas, aprobaciones, personas, conocimiento, registro de conectores y ejecución | **Supabase de TORO**, tras confirmación de entorno y scopes | estado canónico controlado por `org_id`, `property_id`, actor, RLS | Airtable, Sheets, Pages y Portal solo vistas/herramientas humanas |
| Documentos fuente, originales, arte y archivo | **Archivo gobernado Dropbox y proveedor original** | referencia, hash, clasificación, retención, custodia y restore | Google Drive para colaboración y entregables editables |
| Contratos, arquitectura, políticas, código, cambios | **GitHub** | enlaces a documento/commit/PR y ejecución correspondiente | Notion para narrativa de trabajo, subordinada |
| Mensajería/agenda | **Gmail/WhatsApp/Calendar** sobre existencia, entrega y fecha de sus objetos | acciones derivadas con scope y receipt; no copia indiscriminada de buzones | vistas para personas autorizadas |

Para servicios de terceros: la misma palabra «total» NO significa el mismo hecho. Campos distintos obligatorios: `guest_total_gross`, `booking_financial_final`, `pms_lodging`, `pms_extras`, `commission`, `net_settlement`, `tax_amount`, `charged_paid`, `currency`, `fx_rate_observed`, `tax_included`, `source_document`, `verified_at`. Nunca comparar bruto con neto ni multiplicar 1,13 como norma automática sin evidencia fiscal y comercial.

## 2. Auditoría real — corte inicial 2026-10-15

- Conector Alegra: el endpoint `getDefaultCurrency` devolvió USD y se leyeron 11 centros de costo, entre ellos DREAMCATCHER, SANTA TORO, VISTA ALEGRE, CASA TORO y RESTAURANTE. **CORRECCIÓN del mismo día:** el catálogo de monedas identifica **CRC con `main=true`**; USD activo no prueba que sea la moneda principal. La vinculación principal, el acceso duplicado y el legado YA estaban identificados por el propietario en `toro_alegra_connector_v2.account_binding_20260929`; reutilizarla, no repetir la pregunta ni inferir identidad por recuentos. La identidad legal y permisos de cada operación siguen sujetos a validación. Los dos accesos operativos devolvieron 1.191 facturas y el tercero cero: no son tres libros equivalentes.
- Herramientas Alegra expuestas: lectura verificada; escritura contable general, adjuntos y cambios de catálogo NO expuestos como acciones ejecutables del conector actual. No declarar operativa una escritura ni usar un endpoint distinto como sustituto.
- Supabase: 3 proyectos visibles, dos activos. El proyecto de trabajo que contiene `finance`, `integrations`, `operations` y control TORO albergaba al corte inicial 153 `finance.invoices`, 120 `finance.invoice_sources`, 303 `finance.evidence_documents`, 2.121 `finance.pms_payments`, 50 `finance.reconciliations`, 33 `operations.reservations`, 50 reglas `integrations.source_authority_rules`, 58 dependencias `integrations.external_dependency_registry` y 2 registros en `public.sync_outbox`. Son recuentos de tablas, NO paridad ni sincronización de producción. El piloto posterior dejó 313 evidencias y conservó 153 facturas; ver sección 8.
- Otro proyecto, **dreamteam-recovery-sandbox**, tiene `public.roles` y `public.user_roles` **sin RLS** según inspección; incidencia de seguridad a evaluar antes de cualquier piloto de identidad, sin activar RLS a ciegas (podría romper acceso; crear y probar políticas de mínimo privilegio).
- Autoridad de `integrations.source_authority_rules` ya contempla finanzas, Alegra, Kross, reservas y fuentes externas. **Reutilizar**; no duplicar dichas políticas.
- La auditoría 2026-10-15 Kross/Booking está en un Google Sheets nativo de la cuenta del hotel (referencia privada conservada en el registro autorizado). Cruza 222 reservas de extractos Booking con Kross, de las cuales 32 necesitan revisión prioritaria, y detecta 413 reservas del canal Booking en Kross sin cobertura de extractos. **No equivale a validar el total pagadero por huésped** ni a autorizar ediciones Kross. No volcar los extractos como precios contractuales ni facturas Alegra.
- `finance.invoices` (153 registros) y las 1.191 facturas Alegra **NO son conteos homogéneos** sin scope, período, sentido, origen y clave. La diferencia numérica no demuestra faltantes.
- En `integrations.external_dependency_registry` hay dependencias Airtable activas y tareas de export/restore sin cerrar. **No eliminar ni desactivar bases heredadas** antes de las pruebas de consumidores, paridad, exportación y recuperación.

## 3. Contrato lógico de interoperabilidad (SIN DDL en esta fase)

Normalizar cada relación fuente↔TORO usando estas propiedades lógicas (reutilizar columnas existentes y `metadata` solo donde corresponda):
- `org_id`, `property_id`, `business_scope`, `legal_entity_id` validado; ámbitos `personal`, `hotel`, `tercero` no se confunden.
- `source_system`, `source_account_fingerprint` **no secreto**, `resource_type`, `external_id`, `external_version/hash`, `source_updated_at`, `observed_at`, `last_verified_at`.
- `canonical_id`, `mapping_version`, `transform_version`, `currency`, `gross/net` explícitos, estado semántico y datos faltantes `unknown` (nunca convertir un error en cero).
- `idempotency_key` calculada a partir de ámbito, sistema, tipo y clave externa; `correlation_id`, `trace_id`, `receipt_id`; provenance y referencia de archivo (sin tokens).
- `read_status`/ `write_status` y alcance real, `sync_cursor`, `checkpoint`, `retry`, `dead_letter`; no éxito hasta relectura y receipt.
- Clasificación de privacidad, propietario, control de retención, hash, `document_custody_status`, último restore probado.

**Reutilización inmediata:** `integrations.source_authority_rules`, `integrations.external_dependency_registry`, `finance.invoices`, `finance.invoice_sources`, `finance.evidence_documents`, `finance.reconciliations`, `finance.pms_payments`, `operations.reservations`, `operations.tasks`, `operations.knowledge_items`, `public.sync_outbox`, `public.integration_logs`, `public.toro_execution_runs` y `public.toro_execution_receipts`. Cambios de esquema se evalúan únicamente tras catalogar claves únicas, índices, RLS, política de permisos y contratos existentes.

## 4. Flujos de negocio, cada uno con gate

**A. Reservas y precio:** Booking contrato final huésped + Kross reserva actual + folio de pago procesador → extracción separada de impuestos, comisión, limpieza y extras → `finance.reconciliations`/evidencia → responsable comercial revisa diferencia → autorización de ajuste Kross (solo cuando corresponda) → relectura y receipt. Alojamiento/noches y documentos fiscales no se reescriben desde CSV.

**B. Cierre diario:** recepcionista cierra caja con efectivo, transferencias, datáfono (lote/últimos 4 cuando aplicable), Kross y comprobantes → TORO comprueba suma, fechas, habitaciones, medio de pago, partidas personales y soportes → estado APTO/PENDIENTE → Alegra factura/gasto/pago **solo con escritura legítima aprobada y prueba piloto** → consulta del documento emitido, identificación bancaria y auditoría. Pagos personales se excluyen de OPEX del hotel.

**C. Facturas proveedor/plataformas:** Gmail/Drive/Dropbox y Alegra → leer adjunto original, XML de Hacienda y hash → reconocer proveedor, centro de costo, período, moneda, impuesto local/servicio transfronterizo, sujeción y pago → cotejar recibo con cuenta financiera → proponer corrección y contabilización → evidencia conservada y comprobante de emisión/revisión. No inferir acreditación fiscal solo por PDF o correo.

**D. Clientes, proveedores y servicios:** contacto TORO canónico ≠ contacto universal expuesto; enlazar ID de Alegra y huésped Kross solamente tras prueba de identidad y ámbito. No mezclar viajeros huéspedes con proveedores ni datos personales del propietario. Catálogos CABYS/IVA/actividades de Alegra se verifican contra configuración legal real.

**E. Operación y personal:** TORO People mantiene su identidad laboral, turnos y aprobaciones; Alegra recibe únicamente los asientos de nómina aplicables y autorizados cuando exista flujo verificado. Airtable es vista transitoria, no nuevo sistema maestro. Dropbox y Drive contienen documentos con retención/ACL, no passwords en hojas.

## 5. Etapas y criterios de aceptación

| Fase | Acción / propietario funcional | Prueba para declarar terminado |
| --- | --- | --- |
| **P0 — autorizar catálogo real** | TORO Systems: reutilizar vinculación Alegra confirmada; comparar company/tenant y conectar cada centro de costo a entidad **sin suponer** empresa jurídica | matriz con fingerprints no secretos, rol/alcance, fecha, fuente, cero cruces entre cuentas ambiguas |
| **P0 — seguridad del sandbox** | TORO Security: reproducir advisory RLS sobre `roles` y `user_roles`, diseñar políticas, pruebas de denegación y recuperación | advisory resuelto + consultas por rol positivas/negativas sin exposición |
| **P0 — reconciliar muestra contable** | TORO Money/FIONA: 10 documentos Alegra del hotel, incluidos factura, gasto, pago y centro de costo, contra Kross, banco y fuentes de `finance.*` cuando existan | 10/10 con fuente e ID; diferencias abiertas explícitas; 0 duplicados; sin crear facturas |
| **P1 — sincronización SOLO LECTURA** | TORO Systems: agregar al conector v2 existente un checkpoint durable y monitorizado para facturas/gastos/pagos, account fingerprint, paginación e idempotencia | 2 ejecuciones repetidas sin duplicados, lote con entradas y salidas, cursor conservado ante error, receipt, privacidad |
| **P1 — writer Alegra de mínimo alcance** | TORO Money + Seguridad: reutilizar el write-adapter histórico solo tras validación, credenciales en vault, esquema fiscal y aprobación diferenciada | una prueba de borrador/no fiscal si el API la admite; validación `readback`, idempotencia, rechazo de duplicados y plan de reversión; después aprobación separada para documentos reales |
| **P1 — control diario y Booking/Kross** | TORO Revenue/Recepción: revisar primero 32 alertas y documentar totales finales de Booking; cotejar con cierre humano | alertas con decisión/evidencia y estado, ninguna reducción automática por 13% |
| **P2 — consolidación de Airtable/Drive/Dropbox** | TORO Systems: catálogo de dependencia, propietaria de fuente, duplicado lógico/físico, tamaño, consumidores, retención y ensayo restore | decommission SOLO tras consumidores=0 o migrados, equivalencia comprobada, archivo íntegro/recuperable y autorización |
| **P2 — SaaS listo para varios negocios** | TORO Product: configuración por `tenant` + `legal_entity`, adaptadores genéricos, permisos/secretos/fees limitados | tenants aislados en pruebas, sin mezcla de caja ni clientes, despliegue reproducible; New Business Readiness Gate aún bloquea ventas externas |

**Indicadores semanales agregados al reporte existente (sin scheduler paralelo de reportes):** % registros con `external_id` y cuenta conciliada, cobertura sobre denominador conocido, desfase de sync, cero transacciones duplicadas, incidencias abiertas por fuente, cierres diarios con evidencia, documentos sin respaldo verificable, fallos de acceso, pruebas restore y costo incremental. Objetivo costo nuevo = US$0 hasta justificar retorno. La continuación de implementación horaria expresamente aprobada se describe en sección 8; no reemplaza ni modifica los observadores existentes.

## 6. Cambios permitidos y prohibidos con este alcance

**Alcance inicial:** análisis en vivo de solo lectura, contrato/documentación y PR, desalineaciones y tareas subordinadas. **Autorización posterior del propietario:** avanzar implementación y preparación de catálogo, adjuntar originales al documento correcto cuando permisos/identidad/transporte estén verificados y continuar cada hora. Guardar una regla no despliega su ejecución.

**No autorizado como consecuencia de esta ampliación:** emitir/anular facturas, asientos, pagos, ajustes fiscales, cambiar reservas/tarifas Kross, borrar bases, activar sincronización bidireccional ciega, habilitar credenciales elevadas, replicar datos personales, alterar RLS en producción, publicar nuevos tenants, comprar herramientas. Los cambios de catálogo solicitados requieren fuentes actuales, correspondencia exacta, campos fiscales/precio/entidad verificados, readback y ruta canónica autorizada; no crear productos especulativos.

**Siguiente implementación:** completar prueba de paridad Alegra↔TORO con `org_id`, centros de costo, rangos, ID nativo y documento fuente; resolver carga original y catálogo con pruebas; corregir el sandbox RLS en cambio revisado; entonces habilitar read-only incremental con evidencia.

## 7. Receipts y vínculos

- Evidencia del corte inicial: 2026-10-15, conector Alegra consultó moneda, conteo de facturas y centros de costos; Supabase devolvió metadatos, estructura y conteos de solo lectura. Las etapas posteriores tienen recibos distintos y no convierten aquel corte en sincronización viva.
- Documentación histórica de Alegra: `docs/superpowers/specs/2026-09-23-toro-brain-alegra-connector-v2-design.md`.
- Supervisión: `START_HERE.md`, Plan General, `TORO_VERSION_FINAL_SUPERPROMPT_V1.md` y `NEW_BUSINESS_READINESS_GATE.md`.
- Las comprobaciones de entorno se deben renovar antes de cada implementación; cifras de este documento son corte histórico, nunca verdad operativa en vivo.

## 8. Ampliación ejecutada: adjuntos, USD/CRC, servicios y continuación horaria

### 8.1 Evidencia y continuidad

El primer piloto ya guardó diez observaciones de facturas en `finance.evidence_documents`, todas en revisión, y verificó replay sin duplicados; NO demostró conciliación comercial/bancaria/fiscal ni adjuntos originales. Continúa PR #228. Los resultados privados se conservan en `toro_alegra_connector_v2.implementation_pilot_20261015`.

La pasada siguiente actualizó únicamente los dos conocimientos existentes `toro_alegra_connector_v2` y `finance_accounting_rebuild_scope_2026_09_v1`, preservó sus otros contratos y añadió un recibo en `public.integration_logs`, correlación `TORO-ALEGRA-CATALOG-20261015-P2`. Se comprobó concurrencia por versión y relectura posterior. No creó tablas, facturas, servicios nativos ni adjuntos en Alegra.

### 8.2 Originales dentro de Alegra, además del respaldo

Mandato: las facturas y sus soportes relevantes, vengan de correo, Drive, Dropbox, carga del propietario o un canal autorizado, deben quedar adjuntos al **documento correcto en Alegra**. El índice de TORO no sustituye esa carga. Se conserva un respaldo independiente gobernado, sin crear copias indiscriminadas.

Separar original PDF, XML firmado, respuesta fiscal, foto original y comprobante de pago. Vincular por organización, entidad, cuenta, tipo de documento e ID nativo; comprobar el hash de los bytes originales. No crear una factura solo para guardar un archivo, ni reemitir una venta ya facturada por Quovis/AdministraWeb u otro emisor.

Rutas oficiales confirmadas: `POST /api/v1/invoices/{id}/attachment`, `POST /api/v1/bills/{id}/attachment`, `POST /api/v1/payments/{id}/attachment`. Son capacidades del API del proveedor, NO herramientas disponibles automáticamente en esta conversación. El transporte de factura de venta requiere `multipart/form-data`, campo `file`, un archivo por petición y máximo 2 MB. La cuota de adjuntos depende del plan y debe comprobarse. No alterar el XML firmado para reducir tamaño; conservar el original y, cuando proceda, una copia PDF/foto comprimida etiquetada como derivada, dejando visible cualquier excepción.

Estados diferenciados: `SOURCE_CAPTURED → TARGET_MATCHED → READY_TO_ATTACH → UPLOADED_UNVERIFIED → ATTACHMENT_VERIFIED`; respaldo se verifica por separado. La URL temporal que devuelve el API no es prueba de custodia duradera: conservar identificadores estables, volver a consultar el documento y contrastar descarga/bytes cuando sea posible. Un reintento ambiguo primero consulta, no vuelve a subir ciegamente.

**Estado de esta pasada:** cero adjuntos cargados. El conector no expone carga multipart y el navegador devolvió que necesita contexto del navegador de origen. No se eludieron permisos ni se fingió una carga.

### 8.3 Estrategia de monedas

**Recomendación:** conservar CRC como base observada de Alegra y operar con USD/CRC por documento y por cuenta, sin cambiar todas las ventas a colones ni convertir todas las entradas de dólares. Las ventas pactadas en USD conservan USD; los gastos y cobros conservan moneda original; las cuentas bancarias/cajas se concilian por su moneda. El informe gerencial puede comparar en una moneda de presentación documentada, sin reemplazar los originales.

Mantener tres tasas distintas cuando existan: comercial acordada, fiscal del hecho generador y efectiva de liquidación bancaria. Guardar par/dirección, valor, fuente y fecha; separar comisiones, neto recibido, diferencias cambiarias y pagos parciales. Nunca usar 500 por defecto ni adivinar la moneda por el importe o el nombre del banco. Las dos omisiones del piloto permanecen pendientes hasta evidencia documental o semántica del endpoint corroborada.

Para la base de IVA en operaciones pactadas en moneda extranjera, el artículo 21 del Reglamento de la Ley del IVA establece el tipo de cambio de **venta de referencia BCCR vigente al hecho generador**. No sustituirlo por el spread comercial o la tasa bancaria. El contador valida el hecho generador y tratamiento de cada operación. Alegra documenta actualización diaria nativa BCCR: preferir esa capacidad tras confirmar configuración, lado de tasa y tratamiento de documentos fechados; no fue activada aquí. La tasa nueva no justifica reescribir históricos.

Tesorería propuesta: cubrir obligaciones confirmadas en su moneda y convertir únicamente la necesidad neta planificada de CRC, evitando conversiones de ida y vuelta. Esta recomendación no autoriza movimientos de dinero.

### 8.4 Catálogo completo con clasificación antes de publicar

Lecturas reales: cinco ítems Alegra (Hospedaje DC, Desayuno, Almuerzo, Cena, Hospedaje ST); 53 fichas de menú, 85 experiencias y tres canales de servicio en Supabase. Se prepararon **141 referencias únicas a registros existentes**, no 141 servicios nuevos ni copias de las definiciones. Ruta privada: `accounting_format_alignment.alegra_readiness_20261015.service_catalog_review_20261015`.

| Clasificación de las referencias | Cantidad | Regla |
| --- | ---: | --- |
| Menú inactivo | 42 | No reactivar ni importar como venta vigente. |
| Variantes activas de desayuno | 7 | Candidato: ítem Alegra 2 con variante operacional; no cobrar desayuno y plato dos veces. |
| Platos activos de temporada baja | 4 | Resolver moneda, precio final/impuestos y uso almuerzo/cena antes de mapear. |
| Experiencias incluidas o gratuitas | 11 | No cargo incremental al huésped; no implica declaración automática de exención fiscal. |
| Experiencias con bandera verified y ready | 7 | Reconﬁrmar proveedor, disponibilidad, precio, entidad y venta propia/comisión; el flag no prueba vigencia. |
| Otras experiencias | 67 | Cuarentena de publicación/cobro hasta verificación. |
| Canales de servicio de comida | 3 | Menú, habitación y takeaway son canales; no otra venta por sí mismos. |

Las siete opciones de desayuno tienen USD15 con impuestos/servicio incluidos en el catálogo; el SOP del propietario conserva USD15 final y USD8 de liquidación a cocina por desayuno consumido, por separado. Cuatro platos de temporada baja figuran USD15 con `taxes_service_included=false`: se registró la discrepancia, sin subir precio ni copiarla al destino.

Kross servicio 3 Desayuno → Alegra ítem 2 es un candidato histórico; Alegra 3 significa Almuerzo. Persona adicional (Kross 4) y late checkout (Kross 6) requieren nueva lectura. La cobertura del catálogo Kross vigente está **BLOQUEADA por contexto de navegador**, no completada con datos históricos. No reactivar la API de pago pausada.

Completar familias: alojamiento habitación/villa/full buyout; huésped adicional y horarios especiales aprobados; limpieza y mascota según contrato; comidas/bebidas; cocina privada, eventos y paquetes; yoga/bienestar/surf/tours; transporte/alquiler/lavandería externa y comisiones de intermediación. Son familias a conciliar, no productos que se declaren disponibles sin fuente. Distinguir venta propia, intermediación, anticipo/depósito, costo interno y cortesía; no imponer 13% ni reconocimiento bruto a todos. La lavandería de huéspedes tercerizada permanece separada de lavandería operativa de ropa del hotel.

### 8.5 Seguimiento horario aprobado

El propietario aceptó expresamente una pasada cada hora. Se creó **Implementación Alegra y TORO**, habilitada, primera ejecución programada 15/10/2026 a las 19:09:58 Costa Rica. El identificador se guarda solo en el registro privado existente. No se modificaron las vigilancias, cierres o reportes anteriores.

Cada pasada retoma evidencia y bloqueos del punto anterior, busca una unidad material verificable y reutiliza la información de los observadores. Comprueba concurrencia, no duplica hechos, conserva estado ante fallo y cambia a una dependencia independiente cuando otra está bloqueada. No se mantienen bucles para ocupar una hora ni se promete ejecución ininterrumpida. Las reglas de actualización y alertas quedaron registradas; los adaptadores de carga, catálogo y sincronización todavía deben superar sus pruebas.

### 8.6 Fuentes oficiales verificadas para esta ampliación

- Adjuntos y límites: https://ayuda.alegra.com/int/adjunta-archivos-en-alegra
- API adjunto venta: https://developer.alegra.com/reference/post_invoices-id-attachment
- API adjunto proveedor: https://developer.alegra.com/reference/post_bills-id-attachment
- API adjunto pago: https://developer.alegra.com/reference/post_payments-id-attachment
- Tasa automática en Costa Rica: https://ayuda.alegra.com/cri/automatica-de-monedas-ac
- Monedas y documentos históricos: https://ayuda.alegra.com/cri/crear-diferentes-monedas-en-alegra
- Reglamento IVA, artículo 21, fuente oficial SINALEVI: https://sinalevi.go.cr/ResultadosNormativa/Informacion?param1=88953&param2=117169&param3=3&param4=22

**Cierre de esta etapa:** reglas y referencias guardadas/verificadas, continuación horaria programada, cero cambios en documentos fiscales, reservas, importes, permisos o catálogo del proveedor. Siguiente unidad: habilitar la ruta nativa autorizada de adjuntos y validar una carga con original/target/readback; en paralelo, completar catálogo Kross y equivalencias de servicios sin publicar los no verificados.

## 9. Comparador de tarifas entre plataformas y competidores — recuperación e incorporación al Plan General

**Mandato recuperado y ampliado por Mauricio:** localizar lo ya trabajado para comparar precios de plataformas y competidores e incorporarlo al Plan General único, sin crear otro proyecto. Esta sección incorpora documentalmente esa capacidad al contrato que el Plan General ya referencia; no acredita aplicación operativa ni cambia prioridades, estados o permisos de ejecución.

### 9.1 Fuentes recuperadas y alcance comprobado

- `MASTER-PROGRAM-GLOBAL-REFERENCE.md`, conservado en la Library: fase 6, TORO OS comercial y reputación, y prompt de Revenue. Define expresamente un comparador interno de Kross/directo, Booking, Airbnb, Expedia, Google Hotels/Travel y otros canales activos. Exige fechas, composición del grupo, impuestos, comisiones, desayuno, cancelación, estancia mínima, moneda, precio total y precio por persona; recomendaciones sin publicar ni cambiar precios automáticamente. Es evidencia del diseño previo, no de un servicio desplegado.
- `2026-08-20-ricosky-v3-1-audit-and-visual-directions.md`, conservado en la Library: referencia al comparador normalizado y Price Match verificable. Preservar la distinción de su prototipo/simulación frente al comparador automático a escala; recuperar y revisar sus artefactos antes de cualquier reutilización de código.
- Airtable Master Brain conserva estructuras `Public Rate Snapshot`, `External Availability Snapshot` y `Booking Engine Audit`. La existencia de tablas acredita estructura previa, no ingesta actual, cotizaciones vigentes ni comparación terminada. Auditar sus consumidores y mapeo antes de reutilizar; no reactivar el esquema legacy como autoridad principal.
- `Competitor Signals` en TORO OS Central contiene cinco registros de posicionamiento, estacionalidad, validación OTA, logística y trabajo remoto. En el alcance leído NO son cotizaciones hoteleras por noche ni un conjunto competitivo cuantificado.
- En las búsquedas realizadas en GitHub, Supabase, Airtable y Library no se comprobó una aplicación operativa independiente de comparación de tarifas. La ruta documental histórica `docs/master-program/14-REVENUE-DISTRIBUTION-REVIEWS-ADS.md` aparece prevista en el documento maestro recuperado, pero su archivo no fue localizado en el repositorio web inspeccionado; no inventar un enlace de implementación.

**No confundir** con DC2-028 (comparación de características de tres habitaciones propias), el tarifario para agencias, el informe de conciliación de reservas ya vendidas Booking/Kross, los comparables inmobiliarios de compraventa ni BETORO. Pueden aportar contexto, pero no sustituyen este comparador comercial.

### 9.2 Ubicación y responsabilidades, sin otro proyecto

Ruta existente comprobada en `operations.projects`: `toro_os_portfolio_master` → `dreamcatcher_hotel_master` → `revenue_booking_stack`, módulo **4. Dreamcatcher · Revenue, Reservas y Guest Experience**. El comparador es una capacidad interna de este módulo, no un nuevo proyecto, base, ledger, agente o scheduler. Conservar su estado y dependencias actuales; esta recuperación documental no lo promueve a operativo.

Revenue/TERE conserva la responsabilidad funcional existente; TORO Research aporta fuentes comparables y contexto, Finance/FIONA valida comisiones/costos y diferencias bruto-neto, Systems/SOBRESITO revisa adaptadores, unicidad y evidencia. Estos son roles funcionales, no nuevas asignaciones aceptadas por personas. Las escrituras, tareas y recibos continúan por el Control Plane vigente. La PR #228 sigue siendo exclusivamente la ruta de Alegra: no añadirle código de comparación de competidores.

### 9.3 Dos funciones dentro de la misma capacidad

**A. Consistencia entre canales propios:** comparar el mismo alojamiento y estancia de Dreamcatcher entre venta directa/Kross y los canales activos. Mostrar el total final obligatorio que pagaría el huésped, no únicamente la tarifa nocturna de entrada. Conservar promociones, elegibilidad y condiciones distintas; una diferencia justificada no es automáticamente un error de paridad.

**B. Posicionamiento frente a competidores:** comparar alojamientos equivalentes y fuentes públicas/autorizadas para las mismas fechas y composición del grupo. Separar habitaciones, apartamentos con cocina, suites, villas privadas y full buyout; documentar ubicación, capacidad, privacidad y diferencias relevantes. Seleccionar y validar el conjunto competitivo antes del piloto; no inventar hoteles integrantes ni inferir sus costos, ocupación o márgenes a partir de su precio anunciado. El conjunto es interno y no modifica la guía pública del hotel.

### 9.4 Contrato mínimo de una comparación válida

Conservar fecha/hora y enlace de observación; hotel, canal e ID de anuncio/unidad; entrada y salida; número de habitaciones y distribución de adultos/niños con edades/bebés/cunas; categoría comparable; moneda original y conversión documentada; precio final de toda la estancia; impuestos y cargos obligatorios; limpieza y suplementos; desayuno y otros incluidos; cancelación y su plazo; prepago; estancia mínima; descuentos y elegibilidad móvil/miembro/residente/mercado cuando estén observados.

Prioridad de presentación: total de estancia al huésped → precio equivalente por noche/unidad → precio por persona como dato secundario con denominador explícito. No enfrentar una villa privada completa contra el precio de una habitación, comparar una tarifa no reembolsable con flexible como si fueran iguales, aplicar 13% automáticamente ni sumar nuevamente cargos ya incluidos.

Estados propuestos: `COMPARABLE`, `CONDITIONAL`, `NOT_COMPARABLE`, `STALE`, `NO_OFFER_OBSERVED` y `SOURCE_BLOCKED`. Falta de oferta no demuestra ocupación total; fallo técnico no es agotado; un precio antiguo no es vigente. Google Hotels/Travel y la OTA a la que remite pueden mostrar la misma oferta: guardar procedencia y no contarlos como competidores independientes. Un cambio de fechas, personas o condiciones invalida la comparación anterior.

El total comercial al huésped, la base financiera/comisionable Booking, el alojamiento/extras del PMS y el neto recibido del canal siguen siendo campos distintos de las secciones 1 y 3. Para Dreamcatcher, calcular contribución estimada solo con comisiones, cargos de procesamiento, impuestos y costos efectivamente sustentados; partidas desconocidas permanecen desconocidas. No usar ofertas o estimaciones para crear asientos/facturas en Alegra ni como pagos conciliados.

### 9.5 Siguiente unidad y criterio de aceptación

**Piloto propuesto, todavía no ejecutado:** reutilizar una categoría/unidad de Dreamcatcher y una estancia concreta; obtener hasta tres ofertas de canales propios y hasta tres alojamientos competitivos comparables, con evidencia y una ventana temporal definida. Capturar también los intentos bloqueados; el denominador son las fuentes previstas, no solo las que respondan. Cada resultado debe quedar comparable o explicar exactamente por qué no lo es. Si no se puede completar cobertura, mostrar parcial sin afirmar que el precio más bajo es el mejor del mercado.

Cierre del piloto: enlaces y cortes recuperables, desglose del total final, condiciones contrastables, FX explícito si se usa, ausencia de ofertas duplicadas, clasificación de discrepancias y una recomendación humana con su evidencia. Aceptación del sistema requiere después una nueva captura con cambio controlado, prueba de datos vencidos/errores y persistencia por la ruta canónica. No marcar terminado por existir esta sección o una tabla.

Orden: recuperar el material previo → identificar fuentes y equivalencias → completar el piloto comparable → reutilizar el resultado en Revenue y evaluación de margen → evaluar actualización incremental solo con adaptador, límites y permisos verificados. No abrir otra automatización ni alterar los observadores financieros. No reactivar la API Kross pausada, contratar rate shoppers, esquivar restricciones de acceso, publicar promociones, igualar ofertas ni modificar reservas/precios sin aprobación independiente.

**Estado de la incorporación:** requisito recuperado y especificado dentro del contrato subordinado al Plan General. Cotizaciones actuales, código de comparador integrado, despliegue y actualización automática permanecen NO VERIFICADOS. No se escribieron registros operativos ni se sustituyeron los datos de la conciliación Alegra/Booking/Kross por esta ampliación documental.
