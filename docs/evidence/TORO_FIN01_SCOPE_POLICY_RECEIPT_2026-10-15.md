# Recibo · FIN01-P0-SCOPE-01

**Fecha:** 2026-10-15 · `America/Costa_Rica`  
**Estado:** `DONE_DOCUMENTED_CATALOG_SCOPE_ONLY / TRANSACTION_MAPPING_PENDING`  
**Mutaciones financieras externas:** `0`

## Resultado verificable

- Los dos enlaces Alegra actuales devolvieron el mismo catálogo: 11 centros activos, 0 inactivos y los mismos IDs, etiquetas, descripciones, códigos y estados.
- Los 11 códigos nativos están vacíos. La clave adoptada es `alegra_company_id + cost_center_id`; nunca etiqueta o similitud.
- Los enlaces actuales se deduplican bajo la compañía operativa `2087288`.
- La compañía `1254496` se mantiene histórica/aislada; su catálogo activo observado es 0 y no se suma a 2026.
- La matriz cubre 11/11 centros: uno es candidato de ruteo hotelero con evidencia por transacción, cinco quedan fuera/alcance desconocido, cuatro quedan como persona/parte relacionada privada y uno queda departamento/negocio compartido por decidir.
- La entidad jurídica documentada no se promueve desde el endpoint de centros porque este no expone razón social o identificación fiscal.
- Ningún centro se incluye automáticamente en el reporte del hotel. El centro 1 conserva gate por contaminación de alcance observada.
- El paquete contiene exactamente 50 controles únicos `SCP-01..SCP-50`, aplicados al contrato local y con `externalMutation=false`.

## Artefactos

- `data/toro_fin01_scope_matrix_2026_v1.json`
- `data/toro_fin01_scope_control_pack_50_v1.json`
- `docs/product/TORO_FIN01_SCOPE_AND_ENTITY_POLICY_2026-10-15.md`
- `tests/toro-fin01-scope-policy.test.mjs`
- `data/toro_fin01_action_plan_2026_v1.json`

## Verificación local

Suite focal FIN-01: `12/12 PASS` (`action-plan`, RLS preparado, moneda/FX y alcance/50 controles). `git diff --check`: `PASS`. Las pruebas exigen 11/11 centros, cero inclusión automática, cuatro centros privados minimizados, legado aislado, 50 IDs únicos, cero mutaciones externas y un único `NEXT` en bancos/caja.

## Límites

No se clasificaron transacciones históricas, no se alteraron centros y no se escribió en Alegra, Kross, bancos, Dropbox, Airtable o Supabase. No hubo asiento, factura, pago, declaración, cierre, DDL, RLS, backfill, permiso, carga o reclasificación. El contador conserva decisiones fiscales/contables; Mauricio conserva decisiones materiales de alcance.

## Reversión y siguiente acción

Revertir solo el delta documental, la matriz, el paquete y las pruebas; no existe estado financiero externo que restaurar.

Única siguiente acción: `FIN01-P0-BANK-01`, conciliación bancaria y de caja por cuenta, mes y moneda, comenzando por identidad/titularidad de las 18 cuentas, saldos inicial/final y partidas sin correspondencia, con CRC y USD separados.
