# TORO — Ejecución de las 30 mejoras aprobadas

**Fecha:** 20/10/2026 · America/Costa_Rica  
**Estado:** alcance de ejecución aprobado; matriz registrada y verificada; funcionalidades NO declaradas operativas por este documento.  
**Autoridad:** [Plan General único](../../product/TORO_BRAIN_GENERAL_PLAN.md), sección `OWNER_AI_WEALTH_STRATEGY_20261020`, controles E01–E40.  
**Subordinación:** este documento es una guía de ejecución y una proyección saneada; NO es otro Plan General, backlog, producto, scheduler ni fuente de estado operativo.

## Resultado buscado y arquitectura

Transformar las treinta propuestas aprobadas por el propietario en cierres demostrables sobre módulos existentes. Dreamcatcher primero por seguridad, calidad del servicio, contribución neta y horas realmente liberadas. La comercialización externa de TORO permanece FUTURE detrás del readiness gate.

Usar `operations.tasks` para trabajo, los contratos existentes en `operations.knowledge_items` para reglas, `public.toro_execution_runs` para intentos y `public.toro_execution_receipts` para evidencia. No duplicar identidad, colas, herramientas o planificaciones. Kross y Alegra conservan sus autoridades transaccionales; Airtable es proyección transitoria.

**Registro de ejecución existente:** `operations.knowledge_items`, `knowledge_key=toro_master_execution_contract_v1`, ruta JSON `improvement_execution_20261020`. Contiene las 30 entradas con tarea y módulo reales, responsable funcional, prioridad orientativa, dependencia, siguiente paso, aceptación y métrica. Las tareas vigentes mantienen sus estados, prioridades, propietarios y aprobaciones.

**Tarea coordinadora reutilizada:** `toro_module_gap_closure_plan_2026_09`. No se crearon treinta tareas.

## Lo aplicado y lo no aplicado

Aplicado en esta intervención:
- Matriz de 30 IDs únicos con referencias a tareas existentes; 0 rutas inválidas, 0 aceptaciones incompletas, 0 dependencias inexistentes y 0 ciclos.
- Reconfiguración de la automatización existente **Dreamcatcher · Ejecución del Plan**; conserva ejecución cada seis horas, zona America/Costa_Rica, sin scheduler nuevo.
- Uso real del Control Plane para el cambio documental: intento, claim, fencing, transición, escritura, readback y receipt.
- Pruebas negativas sobre ese intento propio: claim competidor rechazado y fencing obsoleto rechazado. Esta prueba acotada NO certifica todos los flujos, proveedores o permisos de TORO.

No aplicado por esta intervención: treinta funcionalidades de producción, cambios a reservas/tarifas, movimientos de dinero, Writer Alegra, API pagada Kross, migraciones/RLS, altas de clientes externos, publicaciones o entrega WhatsApp. La ejecución futura del timer depende de acceso real y pruebas en cada corrida; configurarlo no garantiza resultados posteriores.

## Cinco etapas y mapa completo

Las etapas ordenan dependencias; no obligan a detener trabajo independiente seguro. La seguridad y los huéspedes prevalecen sobre el orden editorial. Los responsables son roles existentes, no confirmación de aceptación por una persona concreta.

| Etapa | Mejora | Encaje en el Plan General | Prueba de cierre exigida | Responsable funcional |
|---|---|---|---|---|
| A | M01 · Plan ejecutable | E01/E04/E06 | 30 referencias válidas con aceptación, dependencia y métrica | TORO |
| E | M02 · Tablero ejecutivo único | E06/E35/E39 | Owner Attention sin duplicados, período/fuente/frescura visibles y acceso autorizado | TORO + SOBRESITO |
| A | M03 · Consolidación | E05 | Consumidores identificados y restore probado antes de cualquier retiro | SOBRESITO |
| A | M04 · Priorización | E01/E04/E06 | Hasta 3 resultados activos con impacto, riesgo, esfuerzo y DO/DELEGATE/DELAY/STOP | TORO |
| A | M05 · Verificación del cierre | E35/E36 | Readback y recibo; tareas/PRs/despliegues no sustituyen prueba operativa | TORO + SOBRESITO |
| D | M06 · Retorno de TORO | E02/E32/E37/E39 | Costos completos y tiempos comparables antes/después; no ahorros inferidos | FIONA + TORO |
| A | M07 · Memoria contextual | E36 | Procedencia, vigencia, sensibilidad, scope y correcciones trazables | TORO + SOBRESITO |
| B | M08 · Coordinación | E35/E36 | Un solo ejecutor válido y replay sin doble efecto | TORO + SOBRESITO |
| E | M09 · Decisiones accionables | E04/E06/E39 | Opciones, evidencia, costo/riesgo/reversión y aprobación acotada en bandeja existente | TORO |
| A | M10 · Conflictos de datos | E07/E26/E27 | Conflicto material registrado y fail-closed; ninguna resolución silenciosa | SOBRESITO + TERE |
| B | M11 · Evaluación de agentes | E35/E36 | Casos positivos/negativos, dato viejo, timeout y duplicado; runtime separado de estático | SOBRESITO |
| B | M12 · Autonomía progresiva | E04/E35/E36 | Shadow, piloto y operación medida por flujo; promoción autorizada y reversible | TORO + SOBRESITO |
| C | M13 · Revenue | E07/E08/E09/E10/E12 | Inventario único; ADR/RevPAR y contribución reproducibles sin cambiar tarifas automáticamente | TERE + FIONA |
| A | M14 · Espejo Kross | E26/E27 | Cobertura histórica/presente/futura, deltas/cancelaciones y frescura conciliados | SOBRESITO + TERE |
| C | M15 · Recepción | E16/E23/E27/E28 | Llegadas, solicitudes, cobros y habitación inspeccionada en un caso autorizado verificable | RICO + TERE |
| C | M16 · Feedback y recuperación | E19/E20/E21 | Consentimiento, idioma, responsable y cierre; sin filtrar reseñas públicas por nota | TERE + RICO + SKY |
| C | M17 · Ventas adicionales | E15/E16/E17 | Oferta pertinente aprobada, disponibilidad/margen y no doble cargo | TERE + SKY + FIONA |
| C | M18 · Bodas y eventos | E11/E13/E14 | Embudo y margen neto del alojamiento desplazado; cotización externa autorizada | SKY + TERE + FIONA |
| C | M19 · Mantenimiento | E20/E24 | Prueba física fechada y QA antes de liberar; prioridad por seguridad y recurrencia | RICO |
| C | M20 · Housekeeping/inventario | E23/E25 | Conteo físico compartido antes de min/max; limpio no equivale a disponible | RICO |
| D | M21 · Centro financiero | E02/E03/E29/E31 | Reserva/cargo/voucher/banco/Alegra conciliados, diferencias con responsable | FIONA |
| D | M22 · Multimoneda | E03/E29/E34 | USD/CRC originales, conversión fechada y fuente; empresa/personal separados | FIONA |
| D | M23 · Caja 90 días | E30/E34 | Confirmado/estimado/desconocido por moneda y escenario, sin pagos automáticos | FIONA |
| D | M24 · TORO Mail | E29/E32/E39 | Message/thread ID no duplica obligaciones; borrador no equivale a envío/pago | TORO + FIONA |
| B | M25 · Comunicaciones | E28/E36/E39 | Remitente/rol/scope verificados, estado común y ACK/receipt real por entrega | TORO + SOBRESITO |
| A | M26 · Salud de integraciones | E27/E35/E36 | Estado esperado/observado, lag, consumidor y recuperación; alerta deduplicada probada | SOBRESITO |
| B | M27 · Continuidad | E05/E28/E36 | Restauración acotada y reintentos seguros; RPO/RTO medidos sin retirar fuentes prematuramente | SOBRESITO |
| B | M28 · Identidad/aislamiento | E36 | Permitido/denegado, revocación/sesión y scope ajeno probados; sin nuevos permisos implícitos | SOBRESITO |
| E | M29 · Portal compacto | E35/E39 | QA móvil 360/390/412 y desktop, acciones claras sin cambiar permisos o autoridad | SOBRESITO + TORO |
| E | M30 · Producto multiempresa | E35/E36/E37/E38 | FUTURE: readiness, aislamiento, recuperación y ROI antes de clientes reales | TORO + SKY + SOBRESITO |

**Totales:** A=8, B=6, C=7, D=5, E=4. M30 sigue FUTURE; los otros IDs son NEXT sujetos a prioridad y estado vigentes, no treinta frentes simultáneos.

## Tareas existentes a consumir

| Capacidad | Tarea canónica existente |
|---|---|
| Coordinación/mapeo y cierre de brechas | `toro_module_gap_closure_plan_2026_09` |
| Datos Kross | `kross_readonly_reservation_mirror_2026_09`, `kross_supabase_mirror_freshness_20260928` |
| Identidad | `toro_phase1_founder_identity_e2e` |
| Integraciones y evaluaciones | `toro_connector_learning_runtime_20260929` |
| Backup/consolidación | `decommission_airtable_final_backup_restore_sequence` |
| Memoria/documentos | `info_gov_07_new_document_intake` |
| Operación | `ops_ws_housekeeping_laundry_stock`, `maintenance_preventive_schedule_2026_09` |
| Finanzas | `payment_reconciliation_matrix_20260928`, `finance_ws_cash_accounting_current` |
| Revenue | `occ_sep_oct_daily_revenue_dashboard_20260825` |
| Reputación | `hotel_reviews_kross_google_routing_20260929` |
| Atención/correo/decisiones | `owner_attention_comms_payflow_portal_openclaw_20260928` |
| Canales | `toro_surface_capability_parity_20260922` |
| Portal | `toro_company_user_portal_contract_20260922` |
| Baseline/autonomía | `dreamcatcher_autonomy_baseline_2026_09`, `dreamcatcher_autonomy_acceptance_2027_01` |
| Producto futuro | `toro_design_partner_monetization_20260922` |

M17/M18 se registran bajo la tarea coordinadora existente como alcance a enrutar al frente vigente de revenue/grupos antes de ejecutar. No se crea un segundo CRM ni una cotización paralela; resolver el objeto comercial y su propietario primero.

## Contrato por corrida del timer existente

1. Leer delta, checkpoint, receipts y cambios materiales del Plan General. No repetir auditoría completa.
2. Verificar autoridad, fuente fresca, permiso, propietario de frente y concurrencia.
3. Seleccionar hasta tres resultados activos. Buscar hasta cinco pasos materiales verificados dentro de esos resultados, no cinco informes. Es objetivo, no garantía ni cuota.
4. Ejecutar L0/L1/L2 seguro autorizado; un escritor por recurso, lease/fencing, versionado e idempotencia. Resultado incierto de escritura exige readback antes de retry.
5. Verificar criterio específico, registrar antes/después y receipt. Prueba física cuando corresponda. Revisión independiente solo se declara si existió otro revisor.
6. Ante bloqueo, conservar motivo y seguir un resultado independiente elegible. No reactivar frentes pausados ni tomar trabajo de otro ejecutor.
7. Cerrar con HECHO/BLOQUEADO/SIGUIENTE, fuentes, fecha, moneda y denominador. No notificar otra vez el mismo bloqueo sin novedad.

**Cadencia conservada:** cada seis horas, 02:00/08:00/14:00/20:00 Costa Rica como horarios programados, no garantía de inicio/terminación exactos. **Presupuesto por corrida:** máximo 12 minutos observados o 40 llamadas útiles; hasta dos reintentos de lectura transitoria; cooldown de fuente de 10 minutos salvo nueva evidencia/P0. Respetar límites más estrictos del ejecutor vigente. No autoelevar frecuencia, gasto o permisos.

## Ejecución inicial y siguiente lote

- [x] Leer Plan General/constitución/contexto y tareas reales.
- [x] Reutilizar tarea coordinadora, contratos y scheduler existentes.
- [x] Persistir matriz M01–M30 y validar 30/30 referencias y aceptación.
- [x] Verificar grafo: cero dependencias inexistentes y cero ciclos.
- [x] Actualizar scheduler existente y verificar respuesta de configuración.
- [x] Probar rechazo de claim competidor y fencing obsoleto en el intento propio.
- [x] Crear receipt acotado: `fb2151e0-3e4c-45a7-9282-6c9cfb1e6dcb`.
- [ ] Verificar frescura/cobertura actual del mirror Kross sin reactivar API pagada; guardar cobertura real, no promesa de carga completa.
- [ ] Consumir evidencia vigente de identidad/recepción y seleccionar un flujo E2E elegible; no repetir provisión de cuentas.
- [ ] Obtener baseline de tiempos y conciliación multimoneda con fuentes reales; no inferir resultados económicos.

Las marcas corresponden al alcance indicado; las seis iniciales son gobernanza/configuración y la prueba acotada no convierte las treinta mejoras en software operativo.

## Seguridad, reversión y validación de entrega

Dinero, reservas, tarifas, envíos/publicaciones, permisos, producción, migraciones y acciones destructivas conservan aprobación específica. Kross API pagada y Alegra Writer no se activan. No incluir datos personales, secretos, vouchers o saldos privados en este repositorio.

Reversión del registro: retirar únicamente el subobjeto `improvement_execution_20261020` con comparación de versión y receipt correctivo; nunca borrar la auditoría o sustituir otros campos del contrato. Revertir el cambio documental mediante PR. Reconfigurar el timer existente solo por instrucción explícita, sin crear reemplazo.

Verificación de esta entrega: lectura independiente de estado en otra consulta SQL; 30 IDs distintos, 0 rutas inválidas, 0 aceptaciones incompletas, 0 dependencias inválidas, 0 ciclos; claim competidor=0, fencing obsoleto=false. La verificación la realizó el mismo actor ChatGPT, no un auditor independiente. CI/revisión de este PR son un gate separado; no se afirma merge o despliegue por la existencia de este archivo.
