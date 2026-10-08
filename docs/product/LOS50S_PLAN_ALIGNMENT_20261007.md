# Los 50s de Caro — alineación al Plan General de TORO

Revisión V6: 7 octubre 2026, America/Costa_Rica. Corte CI: 22:40; mapping: 22:41.
Horizonte: CURRENT evidencia / NEXT ejecución acotada. Liberación: NOT RELEASED — piloto privado.
Ficha subordinada a `docs/product/TORO_BRAIN_GENERAL_PLAN.md`; no crea otro plan, proyecto, base, agente ni scheduler. Versiones anteriores permanecen en Git.

## Alcance y autoridad

Proyecto familiar privado separado de la operación comercial del hotel. Subsistemas existentes: TORO Systems, Identity, Comms y Event Ops. Seguimiento: issue #246, PR documental #252 y PR web #96.
GitHub conserva código/contratos; Supabase, datos operativos/identidad/permisos/receipts; Airtable, control humano transicional; Vercel, evidencia de despliegue; Kross, inventario y reservas reales.
Reutilizar las cinco tareas humanas `LOS50K-PORTAL-V2`, `LOS50K-DATA-COMPLETE`, `LOS50K-TRANSPORT`, `LOS50K-ROOMING`, `LOS50K-OPENCLAW`, sin inventar responsables, estados ni fechas. Su presencia en Airtable no acredita dispatch canónico.
Web base: `Dramcatcherst/dreamcatcher-website-vnext`, rama `codex/website-progress-20260924`, SHA observado `c23a674ee1e9140f5bd9d9c82ce236411d966562`.

## CURRENT — CI-01 resuelto en candidato; CI-02 bloquea la validación

El workflow anterior solo seleccionaba `ToroOS/phase-0b-foundation` en push y pull_request; no cubría la rama activa. PR96 conserva la corrección del itinerario y agrega:
- `2d0df26e65f1ca89e5962b61e7252548318a0f53`: dos líneas para incluir exactamente la rama activa en ambos filtros.
- `030d97067dc90e976814fd3af0bd0cbd63cc97c7`: seis pruebas sin dependencias, `tests/ci-active-branch.test.mjs`.
- Comparación desde `cd0cf359`: solo workflow y nuevo test. Jobs, permisos de lectura, acciones fijadas, concurrencia, auditoría, verify, E2E y controles de cambios sin modificaciones. Sin publicación ni secretos nuevos.
- Pruebas locales de configuración: original4PASS/2FAIL por cobertura; corregido6PASS/0FAIL, repetido al cierre. Parseo YAML y hash Git del workflow verificados. Esto NO es verify completo.

**Run real 37728619852, job113152415351, 2026-10-08T04:40:36Z:** evento pull_request sobre head030d970; checkout de merge de prueba `b691203b8002e6299163c702fcd4af2e7ae798a2`. Checkout, Node y verificación SHA pasaron. `npm ci` falló con EUSAGE bajo Node24.21.0/npm11.19.0 por lockfile desalineado: faltan entradas @emnapi/runtime1.11.3 y @emnapi/core1.11.3; wasi-threads1.2.1 no satisface1.2.3; también faltan entradas anidadas core1.10.0/wasi-threads1.2.1.

Auditoría, verify completo y E2E fueron omitidos por el fallo de instalación, NO aprobados. Este hallazgo sustituye el estado anterior de cero runs. No cambiar npm ci por npm install, fabricar integridades o eliminar gates para obtener verde.
La señal del commit Vercel030d970 es success; no equivale al resultado de Actions. No se certificó nuevo renderizado/móvil ni acceso público en V6. PR96 sigue borrador; no merge.

## CURRENT — DATE-01 e itinerario: conservar la función instalada

Lectura Supabase anterior a21:18CR: `public.los50s_materialize_registration(uuid)` ya genera SJO29nov, MA→ST30nov, regreso5dic y aeropuerto6dic. Los doce tramos observados coinciden y son planned, no contratos de proveedores.
La función instalada usa `org_id` en sus conflictos únicos; fingerprintMD5 de pg_get_functiondef: `51796012fddd59641b9690fbdbaf1542`.
El archivo histórico `supabase/drafts/20261002_los50s_event_ops_applied.sql` contiene28/29 y no representa esa función. NO reaplicarlo ni ejecutar backfill innecesario. Reparar datos solo ante discrepancia comprobada, snapshot y rollback.
El workbook recuperado `Los50K_Presupuesto_Itinerario_v2_2026-09-30.xlsx` respalda salida29/parque30 sin noche inicialSJ. El chat original más reciente no se recuperó; esta concordancia no autoriza publicación ni compromisos.

PR96 conserva `cd0cf359ab06bb870429c99f4ece2b5bb29e9931`: tres entradas de itinerario corregidas, seis pruebas y ninguna alteración de tarifas/edades/cama/asiento/fondo/solidaridad. Pruebas anteriores: original4PASS/2FAIL, candidato6PASS/0FAIL y typecheck acotadoPASS. Preview anterior `dpl_79EcDvATqvcgBnvfLrxtfKyrf4qw` READY y HTML200 autenticado con fechas corregidas a21:32CR. No son resultados completos de V6.
Producción observada por última vez a20:24CR devolvió404 en `/los50sdecaro`, sobre `dpl_9Z1BJTAhkLpWddN2U9uP84GStdgn`. No se cambió alias ni se volvió a verificar ese HTTP en V6.
Rutas correctas: `/los50sdecaro`, `/los50sdecaro/inscripcion`, `/los50sdecaro/comunidad`, `/los50sdecaro/invitacion`.

## CURRENT — MAP-01: cinco correspondencias exactas ausentes

Consulta read-only V6 por las cinco claves y sus cinco source_record_id: cero coincidencias para cada una en `integrations.migration_map`, `operations.tasks` y `operations.toro_task_execution_v1`. Por tanto, 0/5 correspondencias acreditadas en las tres capas. No equivale a afirmar que ningún otro registro con claves diferentes exista.
La búsqueda ampliada devolvió una tarea general de autoridad de publicación, no sustituto de las cinco. No se halló proyectoLos50s en la búsqueda acotada. No repurposar un proyecto hotelero por inferencia.
El resumen de convergencia de la tabla tasks dice migrated/RESOLVED_OR_ARCHIVE con última auditoría21sep; las cinco tareas humanas se crearon1oct. Ese resumen antiguo no acredita sincronización de filas nuevas. Hay otras tareas Airtable en Supabase: no se concluye que todo el conector esté roto ni se identifica aún la causa del import faltante.
No se importaron tareas, crearon proyectos, ampliaron permisos ni ejecutaron dispatch. Antes de vincular: resolver scope familiar y destino existentes, procedencia base/tabla/registro, idempotencia, estados y bloqueo de ejecución hasta revisión.

## CURRENT — datos, precio e identidad

Formularios, referencias únicas, perfiles, habitaciones y pagos son métricas distintas. Cuatro formularios con las mismas referencias pueden ser revisiones: no sumarlos como altas ni borrar por inferencia. Los conteos operativos detallados permanecen privados.
La revisión previa RLS/privilegios niega SELECT directo cliente en los objetos inspeccionados y permite el materializador a service_role; NO prueba toda la API, identidad o aislamiento extremo a extremo. Intake→materialización y edición segura siguen pendientes.
Referencias adultoDirecto800/MA1000, fondo100 incluido una vez y solidario aparte sin cambios. Doce escenarios privados requieren recotización: no tratar modelos como costos conciliados. Revisar inclusiones fijas, noches/comidas y promesa de bote con fuente y proveedor.
PR247/248 y V4/249 son fundamentos existentes de identidad y membresías; SQL review-only no acredita activación. Reutilizar Auth/app_users. OpenClaw no tiene prueba de host/canal/ACK/receipt en esta ronda.

## TARGET — aceptación todavía pendiente

Un invitado verifica identidad, reclama una invitación una sola vez y queda ligado al registro existente; solo ve su alcance. Dos miembros comparten contenido persistente y un tercero es rechazado. Datos, itinerario y costos coherentes; propietario prueba WhatsApp con ACK/receipt; ninguna regresión hotelera o exposición privada. Build o nota de seguimiento no acredita este resultado.

## NEXT — prioridad y dependencia, sin fechas prometidas

| Prioridad / tarea | Responsable existente | Siguiente acción / aceptación |
| --- | --- | --- |
| P0 / PORTAL-V2 | TORO Brain | Reparar lockfile en checkout completo autorizado, con runtime comparable al fallo; revisar diff/versiones/integridades sin cambiar dependencias por inercia. Exigir npm ci, audit, verify y E2E aprobados. Después noches/comidas/bote, cuatro rutas y regresión `/es`, `/es/stays`, móvil390/412/1440. No fusionar92 completo. |
| P0 / DATA-COMPLETE | TERE / encargados; técnicaTORO | Resolver MAP-01 por fuente/clave y scope, usando import/control plane existentes, sin nuevo backlog. Probar repeticiónsin duplicados, conflicto/scope inválido denegado y cambios de estado preservados. Revisar intake y revisiones de formularios. NO backfill innecesario. |
| P0 / TRANSPORT | RICO / Mauricio | Mantener baseline29/30/5/6; validar vuelos, equipaje, cupos, modalidad y cotización. Planned no es contratado; sin compra automática. |
| P0 / ROOMING | RICO / Mauricio | Validar grupos/noches/capacidad y Kross antes de asignar/bloquear. Placeholder/preferencia no es habitación confirmada. |
| P0 de habilitación / OPENCLAW | TORO Brain / Mauricio | Mapping canónico, claim atómico, OTP/permisos reutilizando247/248; host autorizado en paralelo. Prueba doble submit/un ganador, expiry/replay/revoke, usuario/org/evento ajeno y tutor; owner-onlyACK/receipt antes de externos. |

## FUTURE / P1 y controles de cierre

Comunidad persistente, fotos privadas, moderación, admin auditado y piloto consentido siguen a los gatesP0. Comunicación familiar requiere autorización específica. No añadir Slack ni otras bases/agentes/schedulers.
Ciclo autónomo: tarea canónica→lease/fencing→acción acotada→verificación→receipt. Esta auditoría y sus pruebas no son receipts de OpenClaw.
V6 solo modifica dos archivos de CI/tests en el draft96 y seguimiento. Sin lockfile reparado, datos Supabase modificados, permisos, pagos, reservas, producción o invitaciones. No declarar DONE. El entorno local fue snapshot acotado: el clone completo falló por DNS; GitHub Actions sí hizo checkout completo antes de fallar en npm ci.
Recuperación: revert ordinario de commits candidatos; no force-push ni pérdida de trabajo concurrente. PR252 conserva su revisión/conflictos pendientes; no forzar merge.
Aprendizaje: distinguir triggerCI, instalación, pruebas, build, HTTP, persistencia y aprobación. Un estado migrated a nivel tabla no acredita filas posteriores; un SQL archivado no sustituye una función instalada más reciente.

## Referencias

- https://github.com/Dramcatcherst/Toro-OS/issues/246
- https://github.com/Dramcatcherst/Toro-OS/pull/252
- https://github.com/Dramcatcherst/Toro-OS/pull/249
- https://github.com/Dramcatcherst/dreamcatcher-website-vnext/pull/96
- https://github.com/Dramcatcherst/dreamcatcher-website-vnext/actions/runs/37728619852
- https://github.com/Dramcatcherst/dreamcatcher-website-vnext/compare/cd0cf359ab06bb870429c99f4ece2b5bb29e9931...030d97067dc90e976814fd3af0bd0cbd63cc97c7
- https://vercel.com/dreamcatcher-s-projects/dreamcatcher-website-vnext-media-p0/94FCKXMaSCmqvuHLWEF4iKYpngUL
