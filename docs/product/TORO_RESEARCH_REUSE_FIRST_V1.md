# TORO Research · Investigación incremental y memoria de análisis V1

**Estado:** contrato y función determinista preparados en rama; **NO conectado todavía a todos los buscadores, agentes ni a OpenClaw live**. Se subordina al único [Plan General](TORO_BRAIN_GENERAL_PLAN.md) y al [Modelo Cognitivo](TORO_BRAIN_COGNITIVE_OPERATING_MODEL_V1.md); no crea otro plan, base, cola, agenda, scheduler ni sistema de permisos.

## 1. La regla de producto

**Antes de buscar en Internet, Gmail, Drive, Dropbox, Airtable, GitHub, Vercel, Supabase o el host:**

1. Resolver identidad efectiva, organización, ámbito, rol y capacidad autorizada. Personal, otros negocios y clientes externos jamás comparten resultados sin una autorización cruzada explícita.
2. Normalizar intención a `subject_key` estable y fuente de autoridad; **consultar primero** `operations.knowledge_items`, las fuentes ya indexadas, `integrations.import_runs`, `integrations.source_asset_registry`, checkpoints de correo, `operations.projects/tasks` y los receipts del Control Plane **solo dentro del ámbito autorizado**.
3. Comprobar último `source_as_of`, versión/huella de la fuente, cobertura realmente leída, `last_checked_at`, vencimiento por dominio, conflictos, confianza, restricciones y próximos disparadores. La modificación del *registro* no rejuvenece la fecha de la *fuente*. Un reporte histórico no es LIVE.
4. Elegir exactamente una acción: `REUSE`, `REFRESH_DELTA`, `REVALIDATE`, `DISCOVER` o `BLOCK`. Un bloqueo conocido sin nueva dependencia se reutiliza como bloqueo, **no como éxito**.
5. Abrir solo el subconjunto faltante o cambiado, aplicar máximo dos reintentos transitorios, no repetir páginas idénticas ni extraer cuerpos completos si un hash/ID ya demuestra no haber cambios.
6. Guardar o actualizar el mismo checkpoint con procedencia, fuente, ámbito, huella, versión, resultado, límites, cambios, último cotejo, disparador de revisión y enlaces al proyecto/issue/recibo existentes. Preservar historia y contradicciones, sin sobrescribir originales.
7. No declarar finalización de una tarea, respuesta, publicación, reparación, pago o despliegue sin un comprobante del **destino operativo**; separar `documented`, `tested`, `deployed`, `runtime_verified`, `measured`.

**Sin acceso seguro:** no investigar fuentes privadas por un acceso más amplio ni mezclar ámbitos. Registrar `BLOCK` con causa concreta y continuar otras acciones independientes.

## 2. Dónde vive cada cosa

| Tipo | Autoridad/reutilización |
| --- | --- |
| Plan, política y código | `Dramcatcherst/Toro-OS` · Plan General, este contrato y cambios con PR/CI |
| Conocimiento, investigaciones y vigencia | **Supabase** `operations.knowledge_items`, en la Matriz Maestra existente, clave `toro_master_knowledge_acquisition_matrix_2026_09_v1`, JSON `research_reuse_control_v1` |
| Proveniencia técnica y cortes de importación | `integrations.source_asset_registry`, `integrations.import_runs` y checkpoint nativo del proveedor |
| Estado de proyectos y responsables | `operations.projects`, `operations.tasks`, asuntos/PR existentes |
| Actuación, lease, verificación de ejecución | Control Plane `toro_execution_runs` y `toro_execution_receipts`; no crear otra cola |
| Originales privados | Repositorio documental autorizado (p. ej. Dropbox); la memoria de análisis guarda puntero y resumen sanitizado, no copia indiscriminada |
| Vista del usuario | TORO Portal y conversación autorizada; no abrir historial privado en un portal público |

La Matriz Maestra ya contiene **tres checkpoints iniciales**: nube/OpenClaw, dos ejecuciones vencidas de Control Plane y TERE/WeSpeak. No hay medición todavía de búsquedas evitadas, dólares, GB ni horas ahorradas.

## 3. Registro mínimo por asunto

Campos de cada checkpoint: `scope_key`, `subject_key`, `authority`, `source_fingerprint`, `checked_at`, `source_as_of`, `valid_until`, `evidence_refs`, `evidence_state`, `unresolved_dependency`, `coverage` (completa/parcial/desconocida), `gaps`, `next_trigger` y `verification_tier`.

**Huella/identidad:** usar referencias canónicas y hashes no reversibles cuando corresponde, nunca tokens, códigos de acceso, conversaciones privadas o datos sensibles en repositorios. Un checkpoint de tipo `blocked` debe conservar el paso seguro siguiente y el origen del bloqueo.

**Frescura adaptativa:** no hay TTL universal. Reservas/ocupación pueden necesitar lectura actual y límites expresos; norma/regulación cambia ante publicación; incidentes se revisan tras nuevo evento o acuse; auditoría de código se compara por SHA; documentos por versión/hash. La política de lectura Kross de hasta 60 minutos solo aplica a consultas **informativas autorizadas**, no a escritura, cobros, promesas comerciales ni confirmación física.

## 4. API interna inicial y prueba

`src/features/brain/research-reuse-gate.ts` exporta `decideResearchReuse()`, **función pura y sin herramientas**. El caller es responsable de leer por scope y permiso server-side, registrar el checkpoint y aplicar la decisión. La prueba `research-reuse-gate.test.ts` cubre aislamiento, repetición de bloqueos, fuente cambiada, nuevos huecos, expiración y datos LIVE. **No se ha instalado como middleware obligatorio de las integraciones actuales.**

## 5. Aceptación de producto

- Dos consultas equivalentes con idéntica fuente autorizada producen un análisis y luego `REUSE`, sin la segunda búsqueda. Un cambio de SHA de GitHub o cursor/fecha de fuente produce **solo delta**, con antes/después.
- Cambio de organización, revocación o ausencia de capacidad produce `BLOCK`, aun si existe un análisis anterior en caché.
- Fuente vencida o dato requerido LIVE produce `REVALIDATE`, y el resultado informa hora y cobertura exactas; el usuario puede forzar nueva investigación sin elevar permisos.
- Dos trabajadores concurrentes sobre mismo asunto evitan escritura duplicada mediante clave estable, CAS/lease y revisión de versión; la función pura no sustituye ese control del servidor.
- Historial de fuentes y hallazgos es reversible/versionado, sin secretos ni pérdida de correcciones.
- Ahorro solo se reporta con baseline de llamadas, duración, costo y medición posterior; **no se extrapola el ahorro a partir de tres registros iniciales**.
- Piloto inicial: OpenClaw cloud, reconciliación de runs vencidos y TERE. Demostrar en host real `consulta → preflight → reuse/delta → acción interna autorizada → evidencia → consulta de seguimiento` antes de prometer autonomía completa.

## 6. Despliegue y continuidad

En **rama de GitHub**: contrato + guard + pruebas. En **Supabase**: primer índice de control persistido dentro del conocimiento canónico. En **nube**: falta integrar el preflight en el endpoint/broker de investigación real, probar aislamiento y race conditions, CI, preview, permisos, rollback y recibo operativo. Reutilizar el trabajador/host existente. No crear un cron para forzar investigación permanente: la búsqueda será disparada por petición, evento permitido o programadores **ya existentes**.

La meta comercial es una **capacidad multiempresa reutilizable**: misma lógica, datos segregados y reglas de vigencia por industria/negocio, sin exponer conocimiento de Dreamcatcher a futuros clientes.
