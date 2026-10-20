# TORO Patrimony Owner Summary V1

**Estado:** PREPARADO / NO APLICADO

**Plan superior:** [TORO — Plan General](TORO_BRAIN_GENERAL_PLAN.md), bloque `PATRIMONY_REGISTRY_ALIGNMENT_20261020`

**Proyecto existente:** `property_corporate_portfolio`

**Matriz:** `PATRIMONY_OWNER_SUMMARY_V1_20261020`

## Resultado y límites

El primer consumidor es un resumen interno y de solo lectura para Mauricio. No crea otra base, proyecto, autoridad, API genérica ni copia de los hechos patrimoniales. La función propuesta vive en `public` únicamente como RPC estrecha; el esquema `patrimony` continúa fuera de la Data API.

La llamada exige simultáneamente:

- sesión `authenticated` con actor igual a `auth.uid()`;
- `app_metadata.toro_role=FOUNDER`;
- membresía activa `ADMIN` en la organización solicitada;
- organización activa y no eliminada;
- gate server-only interno desactivado por defecto cuando se conecte el consumidor de aplicación.

`GERENCIA`, `AUDITOR`, otro `ADMIN` sin FOUNDER, otra organización, actor forjado, `anon`, Portal público y sesión revocada no reciben el resumen.

## Contrato de datos

| Entity | System of Record | Mirror | Write Owner | Privacy | Refresh | Conflict rule | Evidence | Rollback |
|---|---|---|---|---|---|---|---|---|
| Registro patrimonial normalizado | `patrimony.*` en Supabase privado | Una ficha `source_objects` en Airtable Central | Ninguno en V1; PostgreSQL gobernado para cambios futuros | FOUNDER + ADMIN; RLS; RPC agregada | Por snapshot verificado | Registro Nacional gana para título/asiento; conflictos permanecen abiertos | migración, políticas, pruebas positivas/negativas y readback | retirar solo la RPC nueva si su cuerpo y ACL no derivaron |

Salida permitida:

- `contract`, `actorId`, `orgId`, `generatedAt`;
- snapshot: `matrixVersion`, `observedAt`, `verifiedAt`;
- conteos: snapshots, sujetos, sociedades, personas minimizadas, activos, derechos, vehículos, intereses, asientos, relaciones y conflictos;
- conflictos agregados: abiertos y por severidad.

Salida prohibida:

- nombres, cédulas o identificadores legales;
- folios, planos, placas, VIN/chasis o referencias registrales;
- montos, valores, hipotecas, acreedores o contrapartes;
- hashes, rutas, archivos, documentos, payloads o campos `details`;
- permisos de escritura o uso de `service_role` como identidad del usuario.

## Evidencia de preparación

- Supabase vivo, lectura 20/10/2026: 11 tablas `patrimony` con RLS y una política SELECT por tabla; `anon` sin USAGE; `authenticated` con USAGE/SELECT sometido a RLS.
- Migración inicial existente: observada una vez; este paquete no la reejecuta ni la modifica.
- Airtable Central: una ficha `source_objects` para el snapshot y el proyecto existente actualizado; no se copian filas patrimoniales.
- Alegra: `PREPARADO/UNPOSTED`, sin asiento ni efecto en libros.
- Escrituras de esta preparación: `NONE` en Supabase, Airtable y Alegra.

## Criterio de terminado de la futura activación

1. PR no sensible con CI verde.
2. SQL exacto aprobado y aplicado una sola vez en el proyecto canónico.
3. Readback de función SECURITY INVOKER, ACL solo `authenticated`, `search_path` vacío y esquema `patrimony` aún no expuesto.
4. FOUNDER + ADMIN correcto recibe solo el payload agregado de su organización.
5. `anon`, ADMIN sin FOUNDER, FOUNDER sin ADMIN, actor forjado y otra organización reciben denegación.
6. Reintento no altera datos; rollback de la RPC funciona solo si no existe deriva concurrente.

La activación no contabiliza, no publica una UI, no expone filas de detalle y no autoriza una segunda migración patrimonial.
