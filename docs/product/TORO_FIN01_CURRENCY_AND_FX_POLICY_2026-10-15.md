# FIN-01 — Política de moneda y tipo de cambio 2026

**Estado:** `MATRIX_READY_FOR_ACCOUNTANT_REVIEW / PREPARED_NOT_APPLIED`  
**Corte:** 2026-10-15, `America/Costa_Rica`  
**Unidad:** `FIN01-P0-CUR-01`  
**Límite:** solo lectura y contrato; cero cambios en Alegra, Supabase, bancos, Kross, históricos, permisos, períodos o automatizaciones.

## Decisión ejecutiva

**CRC queda documentada como moneda base observada y corroborada; USD como moneda adicional.** La configuración visual de empresa del 19/09 mostró CRC y el catálogo vivo del 15/10 marca CRC `main=true`. El endpoint llamado `getDefaultCurrency` devuelve USD/500, pero no muestra compañía, fecha del evento ni semántica suficiente; se clasifica como endpoint ambiguo, no como autoridad para cambiar la base.

La decisión está lista para revisión del contador, no para contabilizar. La tasa 500 es una configuración/histórico observado, con actualización automática apagada; no es una tasa fiscal, bancaria, comercial ni gerencial universal. Se conservan los documentos que ya la contienen, pero queda prohibido aplicarla de forma implícita o reescribir históricos.

## Evidencia cruzada

| Capa | Resultado verificado | Límite |
| --- | --- | --- |
| Configuración Alegra, 19/09 | CRC visible como moneda de empresa; USD adicional con tasa manual 500 | corte histórico, no readback simultáneo de identidad legal |
| Catálogo Alegra, 15/10, dos enlaces actuales | CRC id 32 `main=true`; USD id 140 activo, tasa 500, `autoUpdate=no`; catálogos idénticos | la igualdad observacional no demuestra por sí sola identidad jurídica |
| Endpoint Alegra `getDefaultCurrency` | USD activo, tasa 500 | conflicto semántico; no usar como tasa de evento ni autoridad de base |
| Cuentas Alegra | 18/18 activas; 9 USD explícitas y 9 con moneda omitida | nombre/símbolo no completa evidencia nativa ausente |
| TORO/Supabase | proyección 9 CRC/9 USD; cero diferencias cuenta↔extracto↔movimiento observadas | consistencia del espejo, no sustituto del campo nativo omitido |
| Modelo TORO | cadena `bank_accounts → bank_statements → bank_transactions → reconciliations` reutilizable | no existe contrato transversal completo de procedencia FX; no hacer DDL/backfill todavía |

## Matriz 18/18 de cuentas

`CRC candidata` significa que Alegra omitió `currency`; el catálogo principal, el símbolo y la proyección TORO apuntan a CRC, pero el estado continúa `PENDING_EVIDENCE`. No se utiliza esa inferencia para publicar, sumar monedas ni cerrar un período.

| ID | Nombre | Tipo Alegra | Moneda nativa devuelta | Estado |
| ---: | --- | --- | --- | --- |
| 1 | DEFAULT | cash | omitida; CRC candidata | `PENDING_EVIDENCE` |
| 2 | ₡CAJA C₡ | cash | omitida; CRC candidata | `PENDING_EVIDENCE` |
| 3 | ₡ BN ₡ | bank | omitida; CRC candidata | `PENDING_EVIDENCE` |
| 4 | ₡TC BAC₡ | credit-card | omitida; CRC candidata | `PENDING_EVIDENCE` |
| 7 | ₡ BAC ₡ | bank | omitida; CRC candidata | `PENDING_EVIDENCE` |
| 9 | ₡LAFISE₡ | bank | omitida; CRC candidata | `PENDING_EVIDENCE` |
| 11 | ₡ BCR ₡ | bank | omitida; CRC candidata | `PENDING_EVIDENCE` |
| 13 | ₡ WINK ₡ | bank | omitida; CRC candidata | `PENDING_EVIDENCE` |
| 16 | $PAYPAL$ | bank | USD | `OBSERVED` |
| 17 | $ BCR $ | bank | USD | `OBSERVED` |
| 18 | $ LAFISE $ | bank | USD | `OBSERVED` |
| 19 | $ BAC $ | bank | USD | `OBSERVED` |
| 20 | $ BN $ | bank | USD | `OBSERVED` |
| 21 | $CAJA C$ | bank | USD | `OBSERVED_WITH_TYPE_ANOMALY` |
| 23 | $TC BAC$ | credit-card | USD | `OBSERVED` |
| 24 | $TC LAF$ | credit-card | USD | `OBSERVED` |
| 25 | ₡TC LAF₡ | credit-card | omitida; CRC candidata | `PENDING_EVIDENCE` |
| 26 | $BITCOINS$ | bank | USD | `OBSERVED_WITH_TYPE_ANOMALY` |

Denominador: 18 cuentas = 12 `bank`, 2 `cash`, 4 `credit-card`; 18 activas. La cuenta 21 se llama caja pero está tipificada `bank`; PayPal y Bitcoins también aparecen como `bank`. Estos nombres son etiquetas operativas, no prueba de naturaleza bancaria.

## Regla única de datos

Cada evento conserva, como mínimo:

`original_amount`, `original_currency`, `event_date`, `source_system`, `source_record_id`, `account_id`, `account_currency`, `fx_purpose`, `fx_from_currency`, `fx_to_currency`, `fx_rate`, `fx_quote_convention`, `fx_date`, `fx_source`, `converted_amount`, `rounding_rule` y `evidence_status`.

La convención obligatoria es `to_currency_units_per_1_from_currency_unit`. Si falta moneda original, fuente, fecha, propósito o dirección de la tasa, el evento queda `PENDING_EVIDENCE`: no se convierte, no se suma con otra moneda, no se publica y no cierra período. Misma moneda puede usar tasa 1 identificada como identidad, no como observación externa.

## FX por tipo de evento

| Evento | Tasa/propósito | Regla |
| --- | --- | --- |
| Factura de venta o compra | documento y fiscal, separadas | preservar moneda/tasa nativa. Para base de IVA en moneda extranjera, usar venta de referencia BCCR vigente al hecho generador, sujeto a validación del contador |
| Cobro o pago | liquidación | conservar importe pagado, moneda, tasa real de banco/procesador y comisiones; no sobrescribir la tasa de factura |
| Conversión/transferencia bancaria | tesorería | usar ejecución y cargos confirmados por proveedor; no sustituye tasa fiscal |
| Reserva/cotización PMS u OTA | comercial | conservar contrato y total al huésped; no prueba banco ni asiento fiscal |
| Presentación gerencial | analítica | fuente, fecha y propósito explícitos; nunca reemplaza libro ni autoriza asiento |
| Histórico nativo | como registrado | conservar incluso tasa 500 y marcar procedencia faltante; no backfill automático |
| Moneda o tasa desconocida | ninguna | `PENDING_EVIDENCE`, sin conversión ni posting |

La autoridad primaria adoptada para IVA es el [artículo 15 de la Ley 6826 en SINALEVI/PGR](https://pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_articulo.aspx?nValor1=1&nValor2=32526&nValor3=121985&nValor5=147811&param1=NRA): contraprestaciones en moneda distinta al colón usan el tipo de cambio de venta de referencia BCCR vigente al hecho generador. El [BCCR publica por separado sus series de compra y venta](https://gee.bccr.fi.cr/indicadoreseconomicos/IndicadoresEconomicos/frmEstructuraInformacion.aspx?DesTitulo=Tipos+de+Cambio&codMenu=+71&idioma=1). El contador determina el hecho generador y tratamiento de cada operación.

Alegra documenta la [tasa automática diaria desde BCCR](https://ayuda.alegra.com/cri/automatica-de-monedas-ac) y la [tasa editable por documento sin afectar documentos ya registrados](https://ayuda.alegra.com/cri/crear-diferentes-monedas-en-alegra). Esta unidad no activó la actualización automática ni cambió una tasa.

## Gaps del modelo y decisión técnica

- `finance.bank_accounts`, `bank_statements`, `bank_transactions` y `reconciliations` ya soportan moneda nativa por fila y son la cadena a reutilizar.
- 44/153 `finance.invoices` carecen de moneda al corte.
- `finance.pms_payments` conserva `amount_converted_usd` en 2.121/2.121 filas, pero no expone importe/moneda original ni procedencia/dirección/fecha de la tasa.
- Las 33 reservas observadas están en USD, pero ninguna está marcada como fuente viva; no promueven un snapshot a verdad vigente.
- No existe contrato transversal de `original_currency`, propósito, fuente, fecha y dirección FX.

**Decisión:** `NO_DDL_NO_BACKFILL`. No recalcular ni sobrescribir `amount_converted_usd`; primero aprobar semántica, probar cobertura y diseñar migración/RLS por separado.

## Estados y gates

- **HECHO:** base CRC observada/corroborada; USD adicional; 18/18 cuentas inventariadas; 9 USD nativas y 9 omisiones nativas; reglas por evento y fuentes oficiales documentadas.
- **PREPARADO:** contrato estructurado en `data/toro_fin01_currency_policy_2026_v1.json` y pruebas locales.
- **PENDIENTE:** readback primario que muestre a la vez compañía/razón social/moneda principal; moneda nativa de nueve cuentas; revisión fiscal del contador.
- **BLOQUEADO:** asientos, correcciones, diferencia cambiaria, cierre, DDL/backfill, writer o automatización.
- **REVERSIÓN:** revertir solo este delta documental; no hubo mutación externa.

## Única siguiente acción

Ejecutar `FIN01-P0-SCOPE-01`: separar compañía, negocio, propiedad, centro de costo, persona y parte relacionada usando la identidad ya observada, sin reabrir el inventario de monedas ni modificar sistemas externos.
