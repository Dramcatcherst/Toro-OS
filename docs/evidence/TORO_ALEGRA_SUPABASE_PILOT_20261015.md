# TORO — Alegra / Supabase: primer piloto de implementación

Fecha de corte: 2026-10-15, Costa Rica.
Estado: PILOTO MANUAL DE OBSERVACIONES VERIFICADO; SIN SINCRONIZACIÓN CONTINUA NI ESCRITURA EN ALEGRA.

## Gobierno y continuidad

Subordinado al [Plan General único](../product/TORO_BRAIN_GENERAL_PLAN.md) y al [contrato transversal](../product/TORO_DATA_ALIGNMENT_ALEGRA_SUPABASE_2026-10-15.md). Extiende la ruta existente de PR #228, no crea otro conector, ledger, base, backlog ni scheduler. La tarea canónica sigue siendo `finance_accounting_reset_2026_09_15` y continúa `in_progress`.

La vinculación principal de Alegra YA existía en `operations.knowledge_items/toro_alegra_connector_v2/account_binding_20260929`, confirmada por el propietario. Se reutilizó; no se infirió la cuenta a partir de recuentos ni se mezcló el acceso duplicado o el legado. La observación no amplía permisos para escribir facturas o pagos.

## Cambios reales y verificación

1. Se capturó una proyección mínima de diez documentos reales mediante `Alegra.invoice_getInvoices(detail=true)`, sin contactos personales ni adjuntos, y se validó con el preflight local.
2. Se insertaron diez filas en la tabla YA existente `finance.evidence_documents`, con `document_type=alegra_invoice_source_observation`, `status=staging`, clave única por organización/sistema/cuenta/tipo/ID nativo y hash SHA-256 de la proyección. No se creó ninguna tabla.
3. Relectura independiente: diez filas verificadas por clave, hash, importe, moneda, estado y límites de aceptación. La repetición contra la restricción única insertó cero filas adicionales.
4. `finance.invoices` permaneció en 153 registros. No se escribió en Alegra, bancos, Kross, permisos ni RLS. No se crearon asientos, cobros, ventas o documentos fiscales.
5. Comprobante de integración: `390f7b36-f610-4f7f-be21-6c8f8417db03`, lote `TORO-ALEGRA-ALIGN-20261015-P1`; evidencia detallada privada en Supabase, no en este repositorio.
6. Se añadieron avances acotados a los dos conocimientos existentes `toro_alegra_connector_v2` y `finance_accounting_rebuild_scope_2026_09_v1`, y a la tarea existente. Sus otros contratos y estados se conservaron.

### Límites expresos

- Ocho documentos incluyen USD explícitamente; dos omiten moneda y conservan NULL, sin mezclar sumas ni asumir USD/CRC.
- Los diez pasan la suma de cabecera subtotal + impuesto = total; esto NO acredita coincidencia comercial, conciliación bancaria ni aceptación fiscal.
- La muestra usa un cliente genérico y no proporciona referencias de reserva. No se inventaron enlaces a huéspedes o estancias.
- El espejo `finance.pms_payments` consultado termina el 2026-09-20 y no tiene pagos entre 2026-10-10 y 2026-10-15. Falta fuente vigente para cruzar octubre.
- El hash corresponde SOLO a la proyección seleccionada, no al PDF/XML original. Respaldo documental y restauración NO verificados.
- `eligible_for_ledger_posting=false`, `bank_match_status=unmatched`, `fiscal_acceptance=unverified`, `write_to_alegra=false` se conservaron en todas las filas.

## Preparación de Alegra, NO aplicada aún en el proveedor

La matriz quedó guardada dentro de `accounting_format_alignment.alegra_readiness_20261015`, reutilizando el contrato existente:

| Frente | Observación y preparación |
| --- | --- |
| Monedas | El catálogo `currencies_getCurrencies(main=yes)` identifica CRC con `main=true`, aunque `getDefaultCurrency` había devuelto USD. Se registró la contradicción; no usar ese segundo resultado como regla para importes sin moneda. La tasa de catálogo tampoco sustituye un tipo de cambio fechado por documento. |
| Servicios | La lectura actual identifica Alegra item 2 como Desayuno e item 3 como Almuerzo. La equivalencia histórica Kross desayuno 3 NO permite unir por el mismo entero. El mapeo requiere sistema, cuenta, ID, versión y aprobación. |
| Cuentas de ingreso | Desayuno y almuerzo siguen vinculados a `Ingresos x hospedaje`. Preparar reclasificación con la cuenta de alimentos correcta, sin inventar ni duplicar cuentas. |
| Clasificación fiscal | Los dos productos leídos tienen `productKey=null`; verificar clasificación y configuración con fuentes fiscales y de la entidad antes de cambios. No implica por sí solo un incumplimiento. |
| Referencias operativas | Solo se encontró un campo adicional, código de barras inactivo. Preparar referencia Kross, confirmación OTA, unidad, cierre y referencia TORO, sujeto a soporte real del tipo de documento. Hashes, permisos y secretos no se imprimen en facturas. |

## Código y pruebas

Archivos de implementación:
- `scripts/finance/alegra-evidence-preflight.mjs`
- `tests/alegra-evidence-preflight.test.mjs`
- `package.json`: agrega `test:alegra-evidence` antes de la suite existente, sin cambiar dependencias.

El módulo es puro: no abre conexiones ni realiza DML/POST. Produce proyecciones de revisión y un plan de insertar/omitir/conflicto. La persistencia de este piloto se ejecutó por SQL acotado tras comprobar cuenta, estructura, RLS existente y claves. El contexto de cuenta aprobado debe provenir del host/control plane, nunca de una entrada pública. No es un sustituto de autorización.

Verificación local Node v22.16.0:
- Primer ciclo: 35 pruebas rojas, después 35 verdes.
- Nueva exigencia de staging: 1 prueba adicional roja, después 36/36 verdes.
- `node --check scripts/finance/alegra-evidence-preflight.mjs`: sin error.
- `npm test`: ejecutó las 36 pruebas nuevas y después quedó bloqueado con `vitest: not found`, salida 127. No se dispone aquí del checkout completo y sus dependencias instaladas. NO se acredita suite completa, build, CI ni despliegue.

Huellas Git de los archivos probados:
- módulo: `4ae432b24d95d38a4f451e9e2d738bf1a80d90c0`
- pruebas: `93079d49c642a922513f8568fb173e3c11faa872`
- package.json: `b0d23531e0ddf4a2ddacb85610f2b5dfb98aaa5f`

El estado previo de PR #228 presentaba conflictos con main. Conservar esta ruta, reconciliar contra main sin retroceder dependencias y exigir la suite completa antes de integrar. No marcar el writer operativo por estas pruebas de evidencia.

## Siguiente unidad y reversión

Priorizar las dos monedas omitidas y los pagos de octubre en Kross/banco; después relacionar comprobantes fuente y referencias de reserva. Separar el piloto de observación del piloto nativo de compra no fiscal del writer. Todo ajuste de proveedor requiere el gate del documento correspondiente.

Reversión no destructiva: identificar exclusivamente las filas del lote anterior y, si se decide retirarlas de revisión, marcarlas inactivas conservando importación y audit trail. No borrar fuentes, modificar históricos ajenos, reiniciar checkpoints ni desactivar RLS. Una futura promoción de staging exige nueva evidencia y recibo; no ocurre por este informe.

Alarma solicitada cada 30 minutos: NO creada. La frecuencia nativa máxima soportada es una vez por hora. No se crearon tareas alternadas ni cron paralelo para eludir el límite. El desarrollo realizado en esta pasada no acredita ejecución autónoma posterior.
