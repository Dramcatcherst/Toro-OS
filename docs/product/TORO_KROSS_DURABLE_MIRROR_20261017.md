# Kross: precarga durable y actualizaciones incrementales
Fecha de decisión: 16/10/2026 CR. Evidencia técnica: 17/10/2026 UTC.
Scope: Dreamcatcher; Data & Integrations, Comms/OpenClaw; lane kross_readonly_reservation_mirror_2026_09.
Documento subordinado al Plan General único. No nuevo Brain, base, cola o scheduler.

## CURRENT observado
Supabase canónico contiene 33 reservas Kross, entradas desde 15/09/2026 y salidas hasta 22/11/2026, último snapshot 21/09/2026 09:28:30.675 UTC, último sync 21/09/2026 09:33:59.645087 UTC. Nueve filas tienen amount_paid informado; no prueba de conciliación bancaria ni historial completo de pagos.
Export_2026-10-15.xlsx recuperado de Library: 252 filas con cabecera, 12 columnas; reporte de pagos, no baseline completo de reservas. No importado ni convertido a pagos confirmados.
Host OpenClaw no disponible aquí; CLI ausente. No cambio ni prueba del Gateway.
Escritura de contrato JSON en knowledge_items devuelve Invalid or expired requestState. Readback tras primer intento: clave ausente; segundo intento devolvió mismo error. No atribuir cambio Supabase sin readback.
35 pruebas sintéticas del nuevo preflight PASS; no prueba RLS/importador/runtime.

## TARGET aprobado por solicitud
Consultar primero el espejo Supabase existente desde Codex/OpenClaw, con historial, presentes y futuras, detalles comerciales/operativos necesarios y movimientos de pago minimizados. Kross conserva autoridad PMS; banco/procesador acredita pago real y Alegra contabilidad.
Lectura histórica funciona sin llamada Kross y muestra fecha de corte/cobertura. No confundir acceso offline a Kross con acceso sin Internet a Supabase.
Datos viejos permanecen consultables; no se convierten en disponibilidad/cobro vigente. No alterar current_reservations_safe ni source_is_live para mostrar más filas.
Carga inicial de todos los periodos disponibles, con denominador por estado/propiedad/periodo. Fechas extremas no prueban completitud.
Actualizaciones incluyen reservas viejas modificadas, pagos posteriores, cancelaciones, devoluciones y correcciones; no solo nuevas.
Correo complementa evidencia incremental. Verificar remitente/identidad, ID externo y versión; ausencia de correo no prueba ausencia de cambio. No convertir correo parcial en saldo liquidado, PMS live o cobertura total.
Pagos: conservar moneda, importe decimal, fecha, método, referencia, asignación a reserva y reversos; separar cargo comercial, pago registrado y conciliación. No PAN/CVV, claves o capturas con tarjetas completas.

## Secuencia de ejecución y recuperación
1. Recuperar exportaciones autorizadas completas de reservas, estancias/asignaciones, cargos, servicios, pagos y cambios por periodos sin huecos. Preservar originales gobernados, hashes y manifiesto privado.
2. Mapear formatos reales al adapter/normalizer existentes y tablas existentes; revisar columnas financieras/staging antes de carga. No adivinar nombres vendor.
3. Staging/import_runs/import_staging_batches; validar los controles siguientes y evidencia real; muestras y totales por moneda. Piloto acotado con comparación antes/después.
4. Commit idempotente por org+property+external ID y source version/hash. Conservar cancelaciones y conflictos; campos omitidos no se vuelven nulos. Guardar before/version en auditoría existente; replay no duplica pagos.
5. Cursor/overlap solo después de commit y readback; reintentos acotados y cuarentena; reconciliación periódica detecta eventos no notificados. Usar worker/control plane existente.
6. Mismo lector servidor autorizado por identidad/rol/propiedad para Codex/OpenClaw, paginado, respuestas con source_as_of/cobertura. Sin service_role al modelo/Gateway.
7. Prueba real de usuario autorizado/otro org/revocado, consulta histórica, reserva modificada, pago parcial, cancelación, correo duplicado/fuera de orden, caída Kross y restauración.
Rollback: retirar solo este código/clave documental; para importación futura exigir manifest de IDs/versiones previas y rollback ensayado antes de promoción. No borrar histórico ni deshacer correcciones concurrentes.

## 30 mejoras: contrato y preflight preparados; activación pendiente
1. Aislamiento por organización (`scope_org`).
2. Aislamiento por propiedad (`scope_property`).
3. Mapeo al esquema existente (`dataset_mapping`).
4. Autoridad Kross preservada (`authority`).
5. Procedencia del extracto (`source_reference`).
6. Checksum del archivo original (`source_checksum`).
7. Fecha de corte válida (`source_time`).
8. Fecha de recepción válida (`observed_time`).
9. No rejuvenecer datos viejos (`time_order`).
10. Ventana histórica explícita (`period`).
11. Conciliar filas recibidas (`row_count`).
12. Detectar lotes faltantes (`batches`).
13. Detectar duplicados por clave compuesta (`duplicates`).
14. Cuarentena sin identificador (`identity`).
15. No adivinar habitación o villa (`room_mapping`).
16. Validar fechas de estancia (`stay_dates`).
17. Detectar cambios del formato (`field_mapping`).
18. Preservar moneda por movimiento (`currency`).
19. Importes decimales validados (`amounts`).
20. Cobertura por dominio y campo (`details`).
21. Conciliar detalle de pagos (`payment_lines`).
22. Conciliar totales por moneda (`currency_totals`).
23. Conservar cancelaciones y no-shows (`cancellations`).
24. Capturar cambios de reservas antiguas (`modifications`).
25. Avanzar cursor solo tras commit (`watermark`).
26. Rechazar eventos más antiguos (`ordering`).
27. Correo como evidencia no confirmación (`email`).
28. Excluir secretos y tarjetas completas (`privacy`).
29. Prueba de acceso por rol y ámbito (`access`).
30. Rollback y recuperación ensayados (`recovery`).

## Verificación y límites
`node --test tests/kross-durable-preflight.test.mjs`: 35/35 PASS.
El evaluador verifica declaraciones del manifiesto, no autenticidad de referencias. Resultado completo = DECLARATIONS_COMPLETE_REVIEW_REQUIRED, nunca permiso de escribir ni prueba live.
describeMirrorRead separa autorización, origen desconocido y snapshot histórico; nunca autoriza acción.
No importer de producción, endpoint, scheduler, permisos, RLS, API Kross, mensajes o despliegue modificados. Lint/build/CI del repositorio completo pendientes.
NEXT: resolver transporte/exportaciones completas y acceso de escritura funcional; consumir preflight desde worker existente solo tras validación del adapter, RLS y recuperación.


## Continuación verificada — 17/10/2026

- Recuperadas 23 fuentes originales, preservadas con identidad y checksum en almacenamiento privado. Unión analítica: 3.965 números de reserva; no baseline completo certificado. Hay datos desde diciembre2024 hasta agosto2027 y cambios máximos de archivo al15oct2026.
- Consulta UI autenticada Kross: periodo01/01/2020–31/12/2030 por fecha de reserva devuelve4.334 filas; fecha de gestión16oct2026. Incluye todo el alcance visible de la cuenta, no exclusivamente Dreamcatcher. Descarga nueva no completada. No comparar4.334 y3.965 como faltantes exactos sin reconciliar filtros/propiedad/estado.
- Staging minimizado preparado:26.056 filas únicas por archivo/hoja/fila,17.657 con cuarto Dreamcatcher explícito,8.399 review_scope sin propiedad asignada. No son26.056 reservas; los snapshots se superponen. Tipos:15.209 filas reservas,7.570 movimientos,2.725 servicios,495 bloqueos,57 reseñas.
- Payment/Pago es texto libre; Reservation/Reserva en pagos/servicios/reseñas es etiqueta de huésped, no ID. Conservar códigos por columna real; no usar esos textos como llave financiera. Datos sin reserva, negativos y ST quedan para conciliación. No moneda de reserva inventada.
- `scripts/kross-source-staging.py` genera JSONL privado compatible con `integrations.source_row_archive`, sin red/SQL. Hash original, dedupe exacto, encabezados duplicados por posición, literales decimales XML, fechas sin zona supuesta, fórmulas omitidas y campos privados como flags.11 tests Python PASS. No cambio de tablas/RLS.
- Dry-run existente corregido: replay por scope/archivo/reserva; sparse updates conservan campos omitidos; snapshot antiguo no revierte cancelación.9 casos Node sobre módulos TypeScript reales PASS; tsc estricto PASS. Sigue siendo memoria/dry-run, no importador persistente.
- Preflight35 pruebas Node conservadas. CI del head anterior8f0e291:Tests/Lint/Build PASS; CI del nuevo delta pendiente. No merge/deploy.
- Escritura Supabase volvió a devolver Invalid or expired requestState; readback tras intento confirmó clave ausente. La base sigue con33 reservas; no staging ni reservas cargadas en esta continuación. No intentar otra superficie para eludir permisos; fallback web exige autorización según política de navegador.
- Activada continuación horaria específica Kross, separada de auditorías operativas y programa Cloud. Es programación de trabajo, no sync acreditado. Checkpoint privado incluye las fuentes y staging comprimido; no payloads en Git.

NEXT: resolver transporte de escritura, cargar piloto revisable de fuente minimizada, readback de claves/hashes/conteos y permiso por rol; luego normalización, carga por lotes y lector servidor histórico. Antes de certificar automático: dos ciclos incrementales, modificaciones antiguas, fallo/replay y recuperación verificados. Histórico sigue consultable por corte una vez cargado, sin sustituir verdad comercial actual.
