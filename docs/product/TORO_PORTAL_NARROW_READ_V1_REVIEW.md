# Portal TORO: propuesta de lectura revisada

**Decisión técnica: preparada para solicitar autorización acotada; NO APLICAR sin aprobación explícita.** Proyecto `abtyrbqlqbsastmridzp`. Este documento corrige y sustituye la propuesta anterior sobre Kross. Mi TORO conserva el Portal único, su Plan y la presentación corporativa.

## Corrección material del diagnóstico

La metadata actual identifica `integrations.kross_snapshot_health` como **vista**, con `security_invoker=true` y `security_barrier=true`. Lee `integrations.kross_snapshot_registry`, tabla con RLS y política SELECT para ADMIN/GERENCIA/JEFE_DEPARTAMENTO/AUDITOR activos del mismo org; authenticated tiene SELECT y ningún permiso de escritura. Su definición y ACL se consultaron sin filas operativas.

La propuesta anterior confundió la vista con tabla y su fixture creó una tabla. Por eso, las15 pruebas SQL anteriores no demostraban que el DDL de Kross fuera aplicable. Se retiran el ALTER TABLE sobre la vista, la política nueva de Kross y la afirmación de acceso Kross desprotegido. **No se cambia Kross, su vista, grants, tabla ni políticas.** El SQL revisado exige el tipo/opciones/definición de vista observados y RLS activo en el registry, antes de todo grant nuevo. La auditoría npm terminada es independiente y permanece conservada.

## Cambios exactos propuestos

Aplicación: `supabase/drafts/20261011_portal_narrow_read_v1.sql`. Reversión: `supabase/drafts/20261011_portal_narrow_read_v1_rollback.sql`. Ambos son borradores, fuera de migraciones activas. Deben revisarse como una pareja; no usar las copias anteriores.

| Objeto | Cambio propuesto |
|---|---|
| `finance` | USAGE para authenticated, únicamente tras comprobar ausencia de privilegios financieros latentes en otros objetos. |
| `operations.communication_followups`, `finance.invoices` | SELECT exclusivo de las columnas abajo y dos políticas SELECT por organización para ADMIN/GERENCIA activos. Sin notas, evidence, sender u otros campos privados ni permisos de escritura. |
| `public.toro_portal_brain_read_v1(uuid,uuid)` | Nueva RPC SECURITY INVOKER, EXECUTE authenticated; actor=auth.uid(), org/rol activo ADMIN/GERENCIA/JEFE_DEPARTAMENTO/AUDITOR. |
| `public.toro_portal_owner_attention_read_v1(uuid,uuid)` | Nueva RPC SECURITY INVOKER, EXECUTE authenticated; actor=auth.uid(), org/rol activo ADMIN/GERENCIA. |
| Kross y otros objetos | Sin cambios; se comprueban sus precondiciones. No se expone un esquema completo, crea una cuenta, writer, fila o runtime nuevo. |

Columnas nuevas exactas, incluyendo filtro/orden:

- `operations.communication_followups`: `org_id,followup_key,subject,followup_state,priority,owner_agent,human_owner,due_date,source_url,mailbox,related_obligation_key,active,id`.
- `finance.invoices`: `org_id,invoice_key,issuer_name,document_number,due_date,currency,total,payment_status,obligation_key,mailbox,source_url,active,id`.

Las RPC revocan EXECUTE de PUBLIC/anon/service_role antes de concederlo a authenticated, usan search_path vacío y objetos cualificados. Reutilizan sin cambios el helper existente `private.has_org_role`, SECURITY DEFINER, con cuerpo observado fijado por hash; no se añade un helper privilegiado. Los filtros de organización y topes siguen: Brain organización1, proyectos25, autoridad25, gobernanza25, Kross25; Hoy followups100, obligaciones150 e invoices200. Los topes pertenecen a las RPC; los grants por columna/RLS no son paginación ni una contabilidad completa.

Las guardas ahora rechazan también permisos de escritura de tabla/columna latentes en los dos objetos destino, cambios de tipo de relación, invoker/definición/RLS de Kross y cualquier política inesperada en las tablas financieras. Una deriva exige nueva revisión, nunca ampliar permisos para hacer pasar la prueba.

## Consumidores comprobados

| Consumidor | Resultado de esta revisión |
|---|---|
| `src/features/brain/canonical-read.ts` | RPC server-only opt-in reutiliza la proyección existente; Kross se lee por su vista invoker actual. |
| `src/features/attention/owner-attention-server.ts` | Dos fuentes ahora inaccesibles reciben solo SELECT por columnas y RLS propuestos; obligaciones y su política existente no cambian. |
| `src/features/menu/server.ts` | Mantiene sondas directas; el problema de esquemas no expuestos continúa. No se habilitan enlaces operativos sin prueba. |
| `operations.communication_attention_v` | Vista invoker dependiente de followups, actualmente sin SELECT/write authenticated. No se le concede acceso. Prueba de estrés local incluso con SELECT ficticio de vista demuestra que las columnas privadas permanecen denegadas. |
| Dependencias de base | No se encontraron funciones cuyo cuerpo mencione los tres objetos revisados; vista Kross depende del registry protegido. Es una búsqueda acotada, no prueba de ausencia de todos los consumidores externos. |

El código de producción del adaptador/Portal no cambia en esta revisión. Conserva flags internos, sesión/actor/org/rol, validación estricta, revalidación tras I/O, errores sanitizados y proyecciones existentes. `TORO_PORTAL_READ_TRANSPORT` continúa ausente/default directo. No se inicia servidor ni obtiene sesión/clave privilegiada. La QA local de lectura ya autorizada sigue vigente; la aplicación de grants/RLS y activación RPC temporal requieren la decisión siguiente.

## Pruebas y evidencia

**25/25 PostgreSQL locales y36/36 del adaptador ejecutadas en esta revisión**, sin fallos/saltos; lint del delta aprobado. La fixture Kross reproduce la vista y registry con definición/políticas observadas, incluyendo frescura calculada; los payloads del contrato se regeneraron con ese SQL. No hay filas sintéticas en Supabase.

Los tests cubren dos org sintéticas, actor/anon/empleado, revocación, columnas/escritura, topes, aislamiento a través de la vista, permisos latentes, tipo/invoker/RLS incorrectos y rollback ante funciones/políticas/columnas/consumidores concurrentes. La prueba no replica PostgREST, todas las restricciones ni una segunda identidad real. Hay **641 pruebas aprobadas registradas**: principal531, hotel46, Node25, preflight14 y SQL25; SQL25 sustituye la evidencia SQL15 incorrecta sobre Kross. Se conservan las579 originales y la regresión completa anterior, sin relanzarla. Build/TypeScript/preflight16 del código anterior conservados: src, package/lock y presentación permanecen idénticos. Auditoría runtime cero avisos en su corte; braces dev abierto, sin aceptación.

Reproducción SQL: PGlite0.5.8 instalado fuera de la app; `TORO_SQL_TEST_PGLITE_MODULE` debe apuntar mediante URL file al módulo `dist/index.js`; ejecutar `node --test tests/portal-narrow-read-sql.test.mjs`. Evidencia nueva en `work/narrow-read-review` del chat: metadata de vistas/consumidores, SQL25, RPC36 y decisión. No usar las antiguas fixtures/tablas como evidencia de runtime real.

## Aplicación futura y reversión

No se ejecuta SQL remoto en esta tarea. Antes de una aplicación futura: aprobación explícita de estos archivos exactos, lectura fresca de precondiciones, consumidores y estado anterior, ejecución transaccional autorizada y readback. lock_timeout3s/statement_timeout30s. Si el SQL cambia después de aprobarse, revalidar el alcance y hash.

Rollback: primero volver el selector a directo/detener el proceso RPC autorizado; comprobar consumidores concurrentes; aplicar el archivo emparejado. Sus guardas rechazan cambios en funciones, políticas, columnas/write-grants o nuevos consumidores financieros antes de borrar algo. Retira únicamente las dos RPC, las dos políticas SELECT, las dos listas de SELECT y el USAGE financiero nuevo, sin CASCADE. **No toca Kross**, que ya estaba protegido. Los clientes nuevos que dependan de los mismos grants exactos pueden no quedar registrados en catálogo: sigue siendo necesaria la revisión de consumidores antes de revocar. El rollback se verificó en PostgreSQL local.

Recuperación local: revertir solo este delta tras revisar cambios posteriores, conservando Plan/checkpoint como prefijo y backups; sin reset/clean/borrados. La propuesta anterior queda histórica y corregida, no aprobada para aplicación.

**Única siguiente acción:** autorización explícita para aplicar este SQL exacto y activar RPC solo durante QA local de lectura con la sesión existente. No se autoriza publicación, nuevos usuarios o escritura operativa. Tras autorización: aplicar/readback acotado y QA Cerebro/Hoy; búsqueda/evidencia y menú todavía requieren su aceptación propia. Portal aún sin publicar.

Referencia del comportamiento de vistas invoker y RLS: [documentación oficial de Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security#expose-a-view-safely). La autoridad de tipos/grants/políticas es la metadata actual del proyecto canónico.
