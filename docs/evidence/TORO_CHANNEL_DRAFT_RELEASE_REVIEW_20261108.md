# TORO channel draft CAS — revisión de release

**Corte:** 08/11/2026 15:56 America/Costa_Rica  
**Carril:** Portal integrado / PR #398 / Task 2  
**Candidato revisado:** `0b0d89eedcb4c45dc5f8207765a3c78b2fe9a085`  
**Estado:** `PREPARADO_Y_REVISADO`; no aplicado, no enlazado y no autorizado para producción.

## Resultado de la revisión

El paquete SQL es apto para pasar al gate separado de release de base. No activa por sí mismo un writer, transporte, mensaje o capacidad de usuario. El runtime consultado no contiene `integrations.communication_channel_drafts` ni `public.toro_channel_draft_cas_v1(...)`; por tanto, CI y preview prueban el candidato, no su instalación.

La revisión conserva el recibo canónico `TORO-PORTFOLIO-ALIGNMENT-20261108-R1` y no escribe el checkpoint privado, Plan General, permisos ni datos operativos. Los hallazgos del asesor de seguridad existentes antes del release quedan fuera de esta unidad; el criterio posterior es no introducir un nuevo hallazgo `WARN`. El aviso informativo de RLS sin política puede aparecer por diseño porque la tabla es server-only, sin acceso de `anon` o `authenticated`.

## Bytes y objetos exactos

| Artefacto | SHA-256 | Efecto preparado |
| --- | --- | --- |
| `supabase/drafts/20261108_toro_channel_draft_cas_v1.sql` | `94705f2b427609187d6af69cbf7dd145164e0227c72fcd60787360e1d610893a` | Tabla append-only, índice y tres RPC invoker |
| `supabase/drafts/20261108_toro_channel_draft_cas_v1_rollback.sql` | `306388b58f7224157bf16da5769b80e2517db45146b2bb6325bd1cb7e74bb49c` | Retiro selectivo únicamente sin filas ni drift |
| `tests/channel-draft-cas-sql.test.mjs` | `b00e7e1c98be351929642336df2783317393db5d697ad6dad8b5f19b69641d98` | Contrato sintético PostgreSQL 7/7 |

Objetos nuevos previstos:

- `integrations.communication_channel_drafts`;
- `communication_channel_drafts_scope_latest_idx`;
- `public.toro_channel_draft_find_v1(...)`;
- `public.toro_channel_draft_read_v1(...)`;
- `public.toro_channel_draft_cas_v1(...)`.

El preflight exige owner `postgres`, `integrations.communication_channel_bindings` y `public.user_roles`, y se niega a reemplazar un objeto ya existente.

## Seguridad, privacidad y consistencia

- RLS activa; sin políticas para clientes; tabla con `SELECT, INSERT` solo para `service_role`.
- RPC `SECURITY INVOKER`, `search_path=''`, `EXECUTE` revocado a `PUBLIC`, `anon` y `authenticated`; concedido únicamente a `service_role`.
- El servidor conserva la autorización de capacidad. La base exige además membresía activa/no revocada del actor.
- CAS exige binding activo, `draft_enabled`, conectado, verificado y con `provider_account_ref` igual a la cuenta canónica.
- Lectura y replay dejan de devolver contenido si se revoca la membresía o el binding deja de ser elegible.
- `operation_key` y versión son únicos en el ámbito completo; versión obsoleta o reutilización conflictiva no crean un segundo efecto.
- Solo se admite `source_kind='live_transport'`; la fuente histórica no puede convertirse en acción viva.
- Adjuntos: máximo 20 referencias saneadas, sin duplicados, con estado `ready`, `pending` o `failed`.
- No se guardan credenciales, tokens, cookies ni bytes de adjuntos. El cuerpo del borrador sigue siendo dato sensible y permanece server-only.

La tabla es deliberadamente append-only: no concede `UPDATE` ni `DELETE` al rol operativo. La reversión se niega si existe una fila o si cambió la definición/ACL de una función. Después de la primera fila durable, la recuperación correcta es una corrección forward revisada; no borrar evidencia para forzar rollback.

## Evidencia ya obtenida

- PostgreSQL sintético: 7/7, incluido CAS único, stale write, cuenta sombra, actor revocado, binding revocado, ACL/RLS y rollback con drift.
- `src/features/openclaw/channel-ledger.test.ts`: 23/23.
- TORO Brain CI `42523123640`: success, incluidos ambos contratos SQL, lint y build.
- Workstation `42523123574`: success.
- Vercel: success del mismo SHA.
- PR #398: abierta, draft y mergeable al corte.

## Gate de release separado

### Antes de aplicar

1. Releer HEAD de PR #398 y confirmar que los tres SHA-256 anteriores no cambiaron.
2. Confirmar que tabla/RPC siguen ausentes y que no existe otro writer/lease para el mismo objeto.
3. Ejecutar el release únicamente por el propietario autorizado de base; no desde cliente, navegador, SQL genérico o este coordinador.
4. Conservar el snapshot del asesor de seguridad y una referencia de reversión.

### Verificación inmediata

1. Readback de tabla, índice, RLS, owner, grants y firmas exactas.
2. Verificar `prosecdef=false`, `provolatile` esperado, `search_path=''` y comentarios con huella de definición.
3. Confirmar que `anon` y `authenticated` no tienen acceso a tabla ni ejecución; `service_role` conserva solo el alcance declarado.
4. Repetir asesor de seguridad y comparar el delta; detener ante cualquier `WARN` nuevo atribuible al release.
5. No crear una fila real hasta que el adaptador server-side, actor, capability, caso y prueba de recuperación estén autorizados.

### Criterio posterior de aceptación

El siguiente lote termina con un adaptador solo servidor que use una capability canónica autorizada y demuestre, en un caso permitido, `CAS -> readback -> replay` con una sola fila, recuperación de resultado ambiguo sin duplicado y ocultamiento tras revocación. Esa prueba debe registrar entorno, actor/rol, caso, hora, resultado y receipt mínimo; no autoriza envío de WhatsApp ni escritura en Kross/Alegra.

## Decisión de salida

**GO para revisión/aprobación del release de base; NO-GO para aplicación, writer, transporte o producción desde este carril.** La próxima acción única es obtener y ejecutar el gate de base por su vía autorizada; si no existe, continuar una unidad independiente del Portal sin simular runtime.
