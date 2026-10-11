# Lectura acotada del Portal TORO: propuesta para revisión

**Preparado y verificado localmente; NO APLICADO en Supabase.** Proyecto objetivo `abtyrbqlqbsastmridzp`. Mi TORO, Cerebro y Hoy siguen dentro del Portal existente y del único Plan General. Esta propuesta resuelve el primer transporte de lectura; no certifica aún el recorrido operativo Hoy → Buscar → evidencia ni la segunda identidad real.

## Código local terminado

`src/lib/server/portal-read-rpc.ts` usa el cliente Supabase de la sesión existente, nunca una clave privilegiada. Rechaza modo público, contexto ambiguo/inactivo, identidad u organización inválida, roles insuficientes y respuestas incompletas, sobredimensionadas o con campos extra. Cada respuesta está ligada al actor y organización; al terminar el I/O revalida sesión y membresía con el resolver existente. Los errores externos se sustituyen por mensajes internos sin contenido sensible. Las proyecciones existentes conservan su reducción de campos/identificadores; el bundle sin proyectar permanece en servidor.

Selector server-side `TORO_PORTAL_READ_TRANSPORT`: ausente o `direct` conserva el transporte anterior; **solo** `rpc_v1` selecciona la propuesta. Un valor desconocido falla. Requiere además modo `internal` y los gates de Cerebro y, para finanzas, Owner Attention. No se activó el selector. No hay archivos `.env` ni flags remotos nuevos. La autorización previa para QA local no autoriza los cambios SQL siguientes.

Los lectores existentes `canonical-read.ts` y `owner-attention-server.ts` reutilizan el adaptador. Hoy conserva su constructor, fecha Costa Rica, límites y reglas de cobertura: un total desconocido no se convierte en cero. El corte de la respuesta viene de PostgreSQL. Las comprobaciones del menú que dependen de esquemas directos y la búsqueda/evidencia canónica siguen pendientes; no se presentan como resueltas por estas dos RPC.

## SQL exacto propuesto

Aplicación revisable: `supabase/drafts/20261011_portal_narrow_read_v1.sql`. Reversión funcional: `supabase/drafts/20261011_portal_narrow_read_v1_rollback.sql`. Permanecen fuera de la carpeta de migraciones aplicables; no se ejecutaron contra el proyecto real.

Dos funciones nuevas en `public`: `toro_portal_brain_read_v1(uuid,uuid)` y `toro_portal_owner_attention_read_v1(uuid,uuid)`. Ambas son `SECURITY INVOKER`, con `search_path=''`, objetos cualificados y EXECUTE exclusivo para `authenticated` después de revocar PUBLIC/anon/service_role. Exigen que `auth.uid()` coincida con el actor y que el rol activo pertenezca a la organización solicitada. No exponen operations, integrations o finance en Data API. No crean tablas, usuarios, roles, filas operativas ni permisos de escritura.

Autorización existente: se reutiliza **sin modificar** `private.has_org_role(uuid,text[])`, que actualmente es SECURITY DEFINER y comprueba `user_roles` activos/no revocados. Las funciones nuevas no eluden RLS. La precondición fija el cuerpo observado del helper mediante MD5 `c83c87aa1d6e6d946b7ca7a8511f470c` y rechaza un modelo de membresía distinto. Esto no certifica la auditoría integral del helper ni sustituye la aceptación de permisos reales.

| Cambio propuesto | Alcance |
|---|---|
| `USAGE` de finance a authenticated | Necesario para invoker. Guardas abortan si hubiera privilegios latentes de lectura/escritura/columnas en otros objetos financieros, funciones o secuencias. La consulta acotada actual encontró 27 relaciones sin esos privilegios; no garantiza un estado futuro. |
| SELECT por columna en followups e invoices | Solo las columnas enumeradas abajo. Sin SELECT de tabla completa, notas privadas ni cambios de datos. |
| `portal_narrow_followups_read_v1` y `portal_narrow_invoices_read_v1` | SELECT por organización para ADMIN/GERENCIA activos. |
| RLS en `integrations.kross_snapshot_health` y `portal_narrow_kross_read_v1` | Restringe el SELECT authenticated preexistente, hoy sin RLS. ADMIN/GERENCIA/JEFE_DEPARTAMENTO/AUDITOR activos del mismo org. Cambio material: revisar consumidores antes de aprobar. |
| EXECUTE de las dos RPC | Brain: esos cuatro roles. Owner Attention: ADMIN/GERENCIA. La validación se hace dentro de cada función y en el adaptador. |

Columnas nuevas de SELECT, incluyendo campos de filtro/orden:

- `operations.communication_followups`: `org_id,followup_key,subject,followup_state,priority,owner_agent,human_owner,due_date,source_url,mailbox,related_obligation_key,active,id`.
- `finance.invoices`: `org_id,invoice_key,issuer_name,document_number,due_date,currency,total,payment_status,obligation_key,mailbox,source_url,active,id`.

Contrato de respuesta `portal-read-rpc-v1`; filtros de organización en todas las fuentes, active cuando lo exige el lector actual, orden estable y límite fijo sin parámetros para aumentarlo:

| Fuente | Tope de filas | Columnas devueltas |
|---|---:|---|
| `organization` / `public.organizations` | 1 | `id,name,status` |
| `projects` / `operations.projects` | 25 | `org_id,id,project_name,priority,status,business_area,canonical_module_key,completion_pct,needs_revalidation,source_system,updated_at` |
| `sourceAuthority` / `integrations.source_authority_rules` | 25 | `org_id,id,domain,official_source,human_approval_required,authority_level,rule_status,last_reviewed` |
| `domainGovernance` / `integrations.domain_governance` | 25 | `org_id,id,domain,criticality,quality_target,current_quality_score,last_reviewed_at,next_review_at` |
| `krossHealth` / `integrations.kross_snapshot_health` | 25 | `org_id,id,source_name,snapshot_kind,source_as_of,observed_at,live_required,freshness_status,safe_for_current_state` |
| `followups` / `operations.communication_followups` | 100 | `org_id,followup_key,subject,followup_state,priority,owner_agent,human_owner,due_date,source_url,mailbox,related_obligation_key` |
| `obligations` / `operations.obligations` | 150 | `org_id,obligation_key,obligation_name,counterparty,status,verification_status,next_due_date,next_review_date,current_amount,current_amount_currency,owner_agent,human_owner,source_system,source_path` |
| `invoices` / `finance.invoices` | 200 | `org_id,invoice_key,issuer_name,document_number,due_date,currency,total,payment_status,obligation_key,mailbox,source_url` |

Los topes acotan cada respuesta; no son paginación ni una contabilidad completa. El contrato exige organización exactamente presente. RLS o permisos ausentes producen error o rechazo; no se certifica una fuente inaccesible como lectura completa. En las fuentes financieras, alcanzar el tope mantiene la cobertura parcial de la proyección existente.

## Verificación y límites

**631/631 pruebas locales aprobadas**, cero fallos/saltos: 531 principal, 46 hotel, 25 Node existentes, 14 preflight y 15 PostgreSQL local. Incluyen todas las 579 anteriores. Tres validadores CLI, TypeScript y lint afectado aprobados. La auditoría ya terminada se conserva sin repetirla: runtime cero avisos en su corte; braces dev sigue abierto y sin aceptación. package.json y lockfile no cambian.

Los 36 tests nuevos del adaptador comprueban gates, roles, actor/org, contrato estricto, revocación/cambio de sesión tras I/O, sanitización y proyección de los payloads generados por SQL local. PostgreSQL se ejecutó con PGlite 0.5.8 instalado solo en el directorio intermedio de QA. Sus 15 tests prueban invoker/permisos, dos organizaciones sintéticas, actor falsificado, empleado/anon, revocación, ausencia de SELECT, bloqueo de notas/escritura, Kross RLS, topes 25/100/150/200, reaplicación rechazada, rollback y privilegios financieros latentes.

Las fixtures se basan en columnas, tipos, grants y políticas observadas, con identidades/datos artificiales **solo en el PostgreSQL local aislado**; no reproducen todas las restricciones, extensiones o el runtime PostgREST real. No se insertó ninguna fixture en Supabase. Esta evidencia no equivale a dos identidades reales autorizadas, RLS vivo, contrato HTTP real o aceptación del Portal en producción. El build del candidato se registra en el checkpoint de cierre, con SHA exacto.

Para reproducir la prueba SQL, instalar PGlite 0.5.8 fuera de la app y proporcionar `TORO_PGLITE_MODULE` como URL file al módulo `dist/index.js`; ejecutar `node --test tests/portal-narrow-read-sql.test.mjs`. Los fixtures no se despliegan. Logs y recibos están en `work/narrow-read-unit` del chat indicado en el checkpoint.

## Reversión exacta y decisión pendiente

Antes de una aplicación futura se necesita aprobación explícita para estos grants, funciones y RLS, comprobación fresca de metadata/políticas y consumidores, y copia de su estado anterior. La transacción usa lock_timeout 3s/statement_timeout 30s y falla ante deriva; no reemplaza funciones existentes. No se aplica en esta tarea.

Rollback: desactivar primero el selector RPC en el proceso autorizado; revisar dependencias y cambios concurrentes; ejecutar solo el archivo de rollback revisado. Retira las dos funciones, las dos políticas financieras, las dos listas exactas de SELECT y el USAGE financiero nuevo, en una transacción sin CASCADE. **Mantiene Kross RLS y su política restrictiva**: es reversión funcional de la capacidad nueva, no restauración byte por byte del acceso inseguro previo. Retirar esa protección requeriría una decisión de seguridad independiente. Si existen otros consumidores nuevos de esos grants/funciones/schema, no ejecutar este rollback hasta reconciliarlos.

Rollback del código: revertir solo el commit local de este lote tras revisar cambios posteriores, conservando el Plan anterior y los otros trabajos; sin reset/clean ni borrados. Dependencias y auditoría permanecen iguales.

Única siguiente acción: revisión y decisión explícita sobre esta propuesta exacta. Tras aprobarla, una tarea distinta podrá aplicar/verificar dentro del alcance autorizado y retomar QA local de sesión real; la publicación sigue sin autorizar.

Método contrastado con documentación oficial: [Database Functions](https://supabase.com/docs/guides/database/functions), [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) y [PGlite](https://pglite.dev/docs/).
