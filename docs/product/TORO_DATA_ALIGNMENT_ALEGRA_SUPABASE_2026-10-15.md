# TORO — Contrato transversal de alineación de datos y fuentes (Alegra / Supabase / Kross / Booking / Airtable / Drive / Dropbox)

**Estado:** CONTRATO PUBLICADO en Plan General (PR #299 fusionado); AUDITORÍA DE SOLO LECTURA. Sin sincronización de producción acreditada. **Fecha:** 2026-10-15 (Costa Rica).  
**Autoridad superior:** [Plan General único](TORO_BRAIN_GENERAL_PLAN.md), `TORO_BRAIN_CONSTITUTION.md`, `START_HERE.md` y `toro-context.yaml`. Este documento es una extensión subordinada, NO otro plan ni una segunda plataforma.  
**Ruta existente de Alegra:** `docs/superpowers/specs/2026-09-23-toro-brain-alegra-connector-v2-design.md`; reutilizar el conector y las colas existentes.

## 1. Decisión y alcance

**No fusionar físicamente todas las bases ni imponer un esquema idéntico a proveedores diferentes.** Compartir contratos de identidad, propietario del dato, eventos, equivalencias, evidencia, controles y proyecciones; cada sistema conserva su autoridad. Una acción pasa por **Intent → Policy → Approval → Execution → Verification → Receipt → Memory**. El propietario solicita que **toda nueva integración, investigación, conciliación y decisión de negocio se incorpore al Plan General canónico** con fecha, estado, vínculo, responsable y prueba. No abrir backlog, espejo, Brain, módulo o base paralela.

| Dominio | Autoridad | Supabase/TORO | Proyección/archivo |
| --- | --- | --- | --- |
| Reserva, estado, inventario vivo, tarifa y cobro reflejado en PMS | **Kross** | espejo operacional con `source_is_live`, `snapshot_as_of`, source ID; jamás promo de snapshot a vivo | Booking/OTA son evidencia externa del contrato comercial |
| Precio acordado específicamente en una reserva Booking | **Confirmación completa Booking al huésped** (impuestos y cargos obligatorios, modificaciones) | conciliación junto a precio/desglose Kross; discrepancia conservada | Google Sheet de auditoría, NO verdad comercial corriente |
| Facturas emitidas/recibidas, pagos contabilizados, saldos y cuentas | **Alegra** (estado nativo contable); **Hacienda** para aceptación fiscal | enlaces a IDs nativos, seguimiento, clasificación, verificación y alertas, NO segundo libro mayor | PDF/XML/evidencia en Dropbox con control de versiones |
| Movimiento real de dinero | **Banco/procesador/comprobante contrastado** | conciliación con PMS/Alegra, moneda, fecha y referencia, sin declarar cobrado por mera factura | soportes originales bajo ACL |
| Tareas, aprobaciones, personas, conocimiento, registro de conectores y ejecución | **Supabase de TORO**, tras confirmación de entorno y scopes | estado canónico controlado por `org_id`, `property_id`, actor, RLS | Airtable, Sheets, Pages y Portal solo vistas/herramientas humanas |
| Documentos fuente, originales, arte y archivo | **Archivo gobernado Dropbox y proveedor original** | referencia, hash, clasificación, retención, custodia y restore | Google Drive para colaboración y entregables editables |
| Contratos, arquitectura, políticas, código, cambios | **GitHub** | enlaces a documento/commit/PR y ejecución correspondiente | Notion para narrativa de trabajo, subordinada |
| Mensajería/agenda | **Gmail/WhatsApp/Calendar** sobre existencia, entrega y fecha de sus objetos | acciones derivadas con scope y receipt; no copia indiscriminada de buzones | vistas para personas autorizadas |

Para servicios de terceros: la misma palabra «total» NO significa el mismo hecho. Campos distintos obligatorios: `guest_total_gross`, `booking_financial_final`, `pms_lodging`, `pms_extras`, `commission`, `net_settlement`, `tax_amount`, `charged_paid`, `currency`, `fx_rate_observed`, `tax_included`, `source_document`, `verified_at`. Nunca comparar bruto con neto ni multiplicar 1,13 como norma automática sin evidencia fiscal y comercial.

## 2. Auditoría real — corte 2026-10-15

- Conector Alegra: lectura exitosa de moneda principal **USD** y de 11 centros de costo, entre ellos **DREAMCATCHER**, **SANTA TORO**, **VISTA ALEGRE**, **CASA TORO** y **RESTAURANTE**. El primer acceso y el segundo devolvieron los mismos 1.191 documentos de facturas y lista de centros; un tercer acceso devolvió 0 facturas y 0 centros. Identidad legal de las tres conexiones **no confirmada**: bloquear cruces entre accesos hasta `company/tenant fingerprint` y permisos verificados. No confundir 3 enlaces con 3 empresas.
- Herramientas Alegra expuestas en esta conversación: **mayoritariamente solo lectura**. Escritura contable general **NO verificada / NO habilitada mediante este conector**. No declarar operativa una prueba de escritura ni usar un endpoint de nómina como sustituto.
- Supabase: 3 proyectos visibles, dos activos. El proyecto de trabajo que contiene `finance`, `integrations`, `operations` y control TORO alberga 153 `finance.invoices`, 120 `finance.invoice_sources`, 303 `finance.evidence_documents`, 2.121 `finance.pms_payments`, 50 `finance.reconciliations`, 33 `operations.reservations`, 50 reglas `integrations.source_authority_rules`, 58 dependencias `integrations.external_dependency_registry` y 2 registros en `public.sync_outbox`. Son recuentos de tablas, NO paridad ni sincronización de producción.
- Otro proyecto, **dreamteam-recovery-sandbox**, tiene `public.roles` y `public.user_roles` **sin RLS** según inspección; incidencia de seguridad a evaluar antes de cualquier piloto de identidad, sin activar RLS a ciegas (podría romper acceso; crear y probar políticas de mínimo privilegio).
- Autoridad de `integrations.source_authority_rules` ya contempla finanzas, Alegra, Kross, reservas y fuentes externas. **Reutilizar**; no duplicar dichas políticas.
- La auditoría 2026-10-15 Kross/Booking está en un Google Sheets nativo de la cuenta del hotel (vínculo: https://docs.google.com/spreadsheets/d/1HTavEIicQj99vjq1AYBeKhudHznD0wSMLNiPWIZu4k8/edit). Cruza 222 reservas de extractos Booking con Kross, de las cuales 32 necesitan revisión prioritaria, y detecta 413 reservas del canal Booking en Kross sin cobertura de extractos. **No equivale a validar el total pagadero por huésped** ni a autorizar ediciones Kross. No volcar los extractos como precios contractuales ni facturas Alegra.
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
| **P0 — autorizar catálogo real** | TORO Systems: inventariar enlaces Alegra y proyectos Supabase, comparar company/tenant y conectar cada centro de costo a entidad **sin suponer** empresa jurídica | matriz con fingerprints no secretos, rol/alcance, fecha, fuente, cero cruces entre cuentas ambiguas |
| **P0 — seguridad del sandbox** | TORO Security: reproducir advisory RLS sobre `roles` y `user_roles`, diseñar políticas, pruebas de denegación y recuperación | advisory resuelto + consultas por rol positivas/negativas sin exposición |
| **P0 — reconciliar muestra contable** | TORO Money/FIONA: 10 documentos Alegra del hotel, incluidos factura, gasto, pago y centro de costo, contra Kross, banco y fuentes de `finance.*` cuando existan | 10/10 con fuente e ID; diferencias abiertas explícitas; 0 duplicados; sin crear facturas |
| **P1 — sincronización SOLO LECTURA** | TORO Systems: agregar al conector v2 existente un checkpoint durable y monitorizado para facturas/gastos/pagos, account fingerprint, paginación e idempotencia | 2 ejecuciones repetidas sin duplicados, lote con entradas y salidas, cursor conservado ante error, receipt, privacidad |
| **P1 — writer Alegra de mínimo alcance** | TORO Money + Seguridad: reutilizar el write-adapter histórico solo tras validación, credenciales en vault, esquema fiscal y aprobación diferenciada | una prueba de borrador/no fiscal si el API la admite; validación `readback`, idempotencia, rechazo de duplicados y plan de reversión; después aprobación separada para documentos reales |
| **P1 — control diario y Booking/Kross** | TORO Revenue/Recepción: revisar primero 32 alertas y documentar totales finales de Booking; cotejar con cierre humano | alertas con decisión/evidencia y estado, ninguna reducción automática por 13% |
| **P2 — consolidación de Airtable/Drive/Dropbox** | TORO Systems: catálogo de dependencia, propietaria de fuente, duplicado lógico/físico, tamaño, consumidores, retención y ensayo restore | decommission SOLO tras consumidores=0 o migrados, equivalencia comprobada, archivo íntegro/recuperable y autorización |
| **P2 — SaaS listo para varios negocios** | TORO Product: configuración por `tenant` + `legal_entity`, adaptadores genéricos, permisos/secretos/fees limitados | tenants aislados en pruebas, sin mezcla de caja ni clientes, despliegue reproducible; New Business Readiness Gate aún bloquea ventas externas |

**Indicadores semanales agregados al reporte existente (sin scheduler paralelo):** % registros con `external_id` y cuenta conciliada, cobertura sobre denominador conocido, desfase de sync, cero transacciones duplicadas, incidencias abiertas por fuente, cierres diarios con evidencia, documentos sin respaldo verificable, fallos de acceso, pruebas restore y costo incremental. Objetivo costo nuevo = US$0 hasta justificar retorno.

## 6. Cambios permitidos y prohibidos con este alcance

**Permitido ahora:** análisis en vivo de solo lectura; mejorar el contrato/documentación y crear PR; catalogar desalineaciones; recomendaciones y tareas subordinadas a las existentes.  
**No ejecutado ni autorizado como consecuencia de esta auditoría:** emitir/anular facturas, asientos, pagos, ajustes fiscales, cambiar reservas/tarifas Kross, borrar bases, activar sincronización bidireccional ciega, habilitar credenciales elevadas, replicar datos personales, alterar RLS en producción, publicar nuevos tenants, comprar herramientas.

**Siguiente implementación:** completar prueba de paridad Alegra↔TORO con `org_id`, centros de costo, rangos, ID nativo y documento fuente; corregir el sandbox RLS en cambio revisado; entonces habilitar read-only incremental con evidencia.

## 7. Receipts y vínculos

- Evidencia de consulta: 2026-10-15, conector Alegra consultó moneda principal, conteo de facturas y centros de costos; Supabase devolvió metadatos, estructura y conteos mediante SQL de solo lectura. No se transfirieron ni mutaron datos entre proveedores.
- Documentación histórica de Alegra: `docs/superpowers/specs/2026-09-23-toro-brain-alegra-connector-v2-design.md`.
- Supervisión: `START_HERE.md`, Plan General, `TORO_VERSION_FINAL_SUPERPROMPT_V1.md` y `NEW_BUSINESS_READINESS_GATE.md`.
- Las comprobaciones de entorno se deben renovar antes de cada implementación; cifras de este documento son corte histórico, nunca verdad operativa en vivo.
