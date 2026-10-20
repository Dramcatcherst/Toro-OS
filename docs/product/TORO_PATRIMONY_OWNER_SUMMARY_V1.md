# TORO Patrimony Owner Summary V1

**Estado:** RPC APLICADA Y VERIFICADA / CONSUMIDOR OPENCLAW CANDIDATO NO DESPLEGADO

**Plan superior:** [TORO — Plan General](TORO_BRAIN_GENERAL_PLAN.md), bloque `PATRIMONY_REGISTRY_ALIGNMENT_20261020`

**Proyecto existente:** `property_corporate_portfolio`

**Matriz:** `PATRIMONY_OWNER_SUMMARY_V1_20261020`

## Resultado y límites

El primer consumidor es un resumen interno y de solo lectura para Mauricio. No crea otra base, proyecto, autoridad, API genérica ni copia de los hechos patrimoniales. La función vive en `public` únicamente como RPC estrecha; el esquema `patrimony` continúa fuera de la Data API.

La llamada exige simultáneamente:

- sesión `authenticated` con actor igual a `auth.uid()`;
- `app_metadata.toro_role=FOUNDER`;
- membresía activa `ADMIN` en la organización solicitada;
- organización activa y no eliminada;
- consumidor interno desactivado por defecto hasta que exista una sesión privada real con JWT de usuario.

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

## Evidencia de activación de la RPC

- Supabase vivo, lectura 20/10/2026: 11 tablas `patrimony` con RLS y una política SELECT por tabla; `anon` sin USAGE; `authenticated` con USAGE/SELECT sometido a RLS.
- Migración de la RPC observada exactamente una vez; función SECURITY INVOKER, estable, `search_path` vacío y EXECUTE solo para `authenticated`.
- Prueba positiva FOUNDER + ADMIN y negativas para `anon`, sin FOUNDER, sin ADMIN, actor forjado y otra organización.
- Conteos de las 11 tablas, RLS, políticas y ACL de escritura sin cambios; sonda externa `PGRST106` confirma `patrimony` fuera de Data API.
- Airtable Central: una ficha `source_objects` para el snapshot y el proyecto existente actualizado; no se copiaron filas patrimoniales.
- Alegra no fue consultado ni modificado.

## Criterio de terminado de la RPC

1. PR no sensible con CI verde.
2. SQL exacto aprobado y aplicado una sola vez en el proyecto canónico.
3. Readback de función SECURITY INVOKER, ACL solo `authenticated`, `search_path` vacío y esquema `patrimony` aún no expuesto.
4. FOUNDER + ADMIN correcto recibe solo el payload agregado de su organización.
5. `anon`, ADMIN sin FOUNDER, FOUNDER sin ADMIN, actor forjado y otra organización reciben denegación.
6. Reintento no altera datos; rollback de la RPC funciona solo si no existe deriva concurrente.

La activación no contabiliza, no publica una UI, no expone filas de detalle y no autoriza una segunda migración patrimonial.

## Consumidor OpenClaw/Lightsail — 30 mejoras implementadas como controles

**Matriz:** `OPENCLAW_PATRIMONY_OWNER_SUMMARY_CONTROLS_V1_20261020`

**Asignación:** TORO Systems + TORO Comms + TORO Identity/Governance; OpenClaw es runtime, no autoridad. Se reutiliza el gateway cloud único. El binding patrimonial debe vivir en el ámbito privado; un binding hotelero o de otra organización no se reutiliza por inferencia.

| # | Control implementado | Verificación / fallo seguro |
|---:|---|---|
| 1 | Host cloud canónico | Host observado coincide con configuración protegida y modo cloud |
| 2 | Escritor primario único | Respaldo frío/local no ejecuta |
| 3 | Canal WhatsApp gobernado | Otro canal se deniega |
| 4 | Cuenta protegida | Alias observado coincide con configuración privada, sin hard-codear identificadores |
| 5 | Scope privado | Organization/shared se deniega |
| 6 | Conversación directa | Grupos se deniegan |
| 7 | Binding verificado | Unverified/revoked se deniega |
| 8 | Binding activo | Binding inactivo se deniega |
| 9 | Organización del binding | Debe coincidir con la organización patrimonial |
| 10 | Sesión activa | Sesión inactive se deniega |
| 11 | Sesión no revocada | `revoked_at` bloquea |
| 12 | Sesión no expirada | Expiración inválida o vencida bloquea |
| 13 | Organización de sesión | Debe coincidir con el target patrimonial |
| 14 | Actor enlazado | La sesión requiere usuario canónico |
| 15 | Actor exacto | Sesión, actor y parámetro RPC deben coincidir |
| 16 | Membresía activa | Inactive bloquea |
| 17 | Rol ADMIN | Falta de ADMIN bloquea |
| 18 | Claim FOUNDER | Falta de FOUNDER bloquea |
| 19 | Capability exacta | Requiere `patrimony.owner_summary.read` |
| 20 | JWT de usuario | Solo `authenticated` + token de usuario; `anon`/`service_role` bloqueados |
| 21 | RPC allowlist | Solo `public.toro_patrimony_owner_summary_v1` |
| 22 | Solicitud fresca | Antigüedad máxima 60 segundos |
| 23 | Timeout acotado | Entre 250 y 3000 ms |
| 24 | Intento único | Sin retry ciego ante resultado ambiguo |
| 25 | Idempotencia y correlación | Ambos IDs válidos, distintos y saneables |
| 26 | Logs saneados | Sin identificadores, tokens o payloads crudos |
| 27 | Envelope agregado | Solo siete claves superiores y snapshot mínimo |
| 28 | Contrato y scope de respuesta | Contrato, actor, organización y fecha coinciden |
| 29 | Agregados numéricos | Claves exactas, enteros no negativos y conflictos coherentes |
| 30 | Campos sensibles ausentes | Bloquea nombres, cédulas, folios, placas, montos, documentos, hashes, rutas y `details` |

### Estado de integración

- **HECHO:** treinta controles y seis pruebas sintéticas añadidos al candidato versionado.
- **HECHO:** readback privado encontró 0 bindings, 0 sesiones y 0 receipts OpenClaw en el ámbito patrimonial; el binding existente pertenece a otra organización.
- **BLOQUEADO:** no existe aún sesión privada verificada con JWT de usuario en Lightsail; no se desplegó el adaptador ni se modificó el host.
- **Rollback:** revertir el cambio de código/documentación; la RPC y los datos no se alteran.
- **Terminado cuando:** el mismo gateway cloud presenta binding privado, sesión/actor/scope exactos, lectura agregada positiva, negativas reales, receipt durable y relectura sin cruces de organización.
