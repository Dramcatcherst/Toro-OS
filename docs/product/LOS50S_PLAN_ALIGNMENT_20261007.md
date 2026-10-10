# Los 50s de Caro — alineación al Plan General de TORO

Revisión de ejecución V6: 7 octubre 2026, America/Costa_Rica. Diagnóstico completo terminado a23:37CR / 2026-10-08T05:37Z.
Horizonte: CURRENT evidencia / NEXT reparación acotada. Liberación: NOT RELEASED — piloto privado.
Ficha subordinada a `docs/product/TORO_BRAIN_GENERAL_PLAN.md`; no crea otro plan, proyecto, base, agente ni scheduler. Versiones anteriores permanecen en Git.

## Alcance y autoridad

Proyecto familiar privado, separado de la operación comercial del hotel. Subsistemas existentes: TORO Systems, Identity, Comms y Event Ops. Seguimiento: issue246, PR documental252 y PR web96.
GitHub conserva código/contratos; Supabase, datos operativos/identidad/permisos/receipts; Airtable, control humano transicional; Vercel, evidencia de despliegue; Kross, inventario y reservas reales.
Reutilizar las cinco tareas `LOS50K-PORTAL-V2`, `LOS50K-DATA-COMPLETE`, `LOS50K-TRANSPORT`, `LOS50K-ROOMING`, `LOS50K-OPENCLAW`. No inventar responsables, estados ni fechas. Su presencia en Airtable no acredita dispatch canónico.
Web base: `codex/website-progress-20260924`, SHA observado `c23a674ee1e9140f5bd9d9c82ce236411d966562`. Candidato: `los50s/align-installed-itinerary-20261007`, PR96 borrador. No merge ni publicación autorizados por esta ejecución.

## CURRENT — CI-01 cobertura corregida; CI-02 reparación probada fuera del commit

PR96 conserva el arreglo de dos filtros en `.github/workflows/ci.yml` y seis pruebas de cobertura. El run original37728619852 dejó de ser omitido y falló en `npm ci` por entradas @emnapi inconsistentes. Los gates oficiales no se debilitaron.

Esta ejecución usó un workflow temporal de diagnóstico, acotado a la misma rama y a su propio archivo, con permisos `contents: read`, checkout exacto, sin credenciales persistentes, sin auto-push y sin secrets nuevos. La primera definición tuvo un error de contexto en job.env; se corrigió antes de ejecutar los diagnósticos. No fue un fallo de aplicación.

Dos ejecuciones completas,37732401701 y37733083219, reprodujeron el fallo original y generaron con npm el mismo archivo reparado. Runtime verificado: Node24.21.0 / npm11.19.0. Comando de generación: `npm install --package-lock-only --ignore-scripts`; `package.json` y contratos directos sin cambios.

- Blob original: `91463e385f896b98dd6e820fc97f53cd73d900d3`.
- Blob reparado: `e6793b4c5b6e3e4960d5e17aa64d3ac59db86c79`.
- SHA256 reparado, leído de los bytes y del artifact: `5f24612bdfc46e310b1664f0aa0921053575b62c98831c36ddbd91cfec2a95f2`, 228964bytes.
- Cinco cambios del grafo @emnapi, más flags dev/peer recalculados por npm. No son cambios de las dependencias directas.
- `npm ci` limpio contra la copia reparada: PASS en ambos runs.
- Aplicación local del patch sobre el original: PASS, resultado byte-a-byte idéntico al archivo generado por npm; manifest sin cambios.
- **La copia reparada NO se había incorporado al package-lock.json del PR al cerrar este diagnóstico.** El archivo y patch están conservados como evidencia. No llamar a esto CI aprobado sobre el commit publicado.

El workflow temporal se retiró en `90c893bc9514e5144118d0b687629a6ddd46e4e7`; sus runs/artifacts permanecen como evidencia histórica. El CI normal conserva instalación, audit, verify y E2E. No sustituir npm ci por npm install ni aplicar parches ocultos dentro del gate para simular un lockfile válido.

## CURRENT — QUALITY-01: resultados reales después de instalar

Run37733083219, diagnóstico sobre head `e7c57783cc4e5c449db426c17d03270e52963353` **más el lockfile regenerado sin commit**. Job113166429821 termina FAILURE; los resultados independientes no convierten el conjunto en verde.

| Control | Resultado observado |
| --- | --- |
| Reproducción del fallo original | PASS: fallo EUSAGE esperado registrado |
| Instalación limpia de la copia reparada | PASS |
| `npm run test` | PASS:283 pruebas,0 fallos;71 procesos de prueba |
| Guardas de rama e itinerario | PASS:12 pruebas; subconjunto/repetición, no sumar a283 como cobertura nueva |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run lint` | FAIL:3 errores y1 advertencia |
| `npm run verify` | FAIL al llegar a lint; sus etapas posteriores no quedaron aprobadas por ese comando |
| `npm audit --audit-level=high` | FAIL; análisis técnico detallado permanece en la evidencia privada del PR96 |
| E2E, móvil390/412/1440 e inscripción real | NO EJECUTADOS en esta ronda |

Los errores de lint están en la inicialización desde localStorage de Community y Survey (setState síncrono en efectos) y en una variable de cálculo que debe ser const. La advertencia es aria-selected sobre botones sin el rol correspondiente. No suprimir reglas ni introducir hidratación inconsistente para obtener verde. Las pruebas unitarias no prueban esos recorridos de navegador.
La inspección también mantiene pendiente reconciliar textos de noches/traslados todavía escritos directamente en Community y las inclusiones/promesa de bote. No modificar condiciones comerciales por inferencia.
La reparación de dependencias de seguridad requiere cambios revisados y pruebas propias; no ejecutar audit fix --force, downgrades o excepciones silenciosas. No hay prueba de explotación ni auditoría del dominio productivo en esta ronda.

## CURRENT — MAP-01 y MAP-02: correspondencia ausente y scope pendiente

Las cinco claves/source_record_id estaban ausentes de migration_map/tasks/vista de ejecución en el corte previo. La nueva búsqueda en tasks y projects por claves, referencias y nombres relacionados tampoco encontró un destino familiar. No se concluye que todo el conector esté roto ni que no exista un registro bajo otro nombre.
El marcador migrated de la tabla, auditado21sep, no acredita cinco filas creadas1oct.
La nueva revisión de columnas y RLS confirma que el acceso de la cola inspeccionada está resuelto a nivel de organización; **no se acreditó un alcance familiar privado aplicable a estas tareas**. No forzar su asociación a un proyecto/organización hotelera para completar el mapping. El detalle de políticas permanece en el seguimiento privado.
No se encontró un importador SQL de tareas por las búsquedas realizadas; esto no descarta un importador del lado de aplicación. Resolver mecanismo y scope existentes antes de importar. No crear otra cola, cambiar RLS o ampliar permisos en esta ronda.
**Importación, mapping escrito y dispatch: NO EJECUTADOS.** Aceptación: origen único base/tabla/registro, scope autorizado, estados/responsables preservados, repetición idempotente y usuario hotelero no autorizado rechazado.

## CURRENT — conservar la evidencia anterior de datos e itinerario

La función INSTALADA inspeccionada a21:18CR generaba SJO29nov, MA→ST30nov, regreso5dic y aeropuerto6dic; los doce tramos observados coincidían. NO reaplicar el SQL histórico28/29 ni hacer backfill sin una discrepancia actual comprobada.
El workbook recuperado del30sep respalda la eliminación de la noche inicialSJ. El chat original más reciente no se recuperó; la concordancia no autoriza publicación o contratación.
PR96 conserva la corrección de tres entradas de itinerario y sus pruebas; precios, edades, reglas de cama/asiento, fondo común y solidaridad no se cambiaron en esta ejecución.
Producción se observó por última vez con404 en `/los50sdecaro` a20:24CR. No se revalidó ni cambió ese alias en esta ronda.
Formularios, personas, perfiles y pagos son métricas distintas. No borrar revisiones ni asumir pago por upload de comprobante. Los conteos y costos detallados permanecen privados. Doce escenarios requieren recotización según el corte anterior.
PR247/248 y V4/249 son fundamentos existentes: reutilizar Auth/app_users. Ninguna prueba actual acredita OTP/claim completo, comunidad compartida o Gateway/WhatsApp con ACK/receipt.

## TARGET — aceptación no alcanzada

Instalación reproducible y controles completos sobre el mismo commit; itinerario e inclusiones coherentes; identidad vinculada una sola vez; privacidad entre familias y hotel; comunidad persistente; tareas en Control Plane con alcance correcto; propietario prueba WhatsApp con ACK/receipt. Ninguna regresión hotelera o exposición privada.

## NEXT — ejecución mínima suficiente

| Prioridad / tarea | Responsable existente | Próxima acción y criterio de cierre |
| --- | --- | --- |
| P0 / PORTAL-V2 | TORO Brain | Incorporar el lock exacto probado al candidato, sin tocar otros contratos. Resolver hallazgos de seguridad en cambios revisados; corregir los errores de lint sin desactivar controles. Ejecutar npm ci/audit/verify/E2E sobre el mismo commit y probar rutas/evento/hotel a390/412/1440. No publicar por buildPASS. |
| P0 / DATA-COMPLETE | TERE / encargados; técnicaTORO | Resolver MAP-02 de privacidad y mecanismo de import existente antes de MAP-01. Ensayar import idempotente y preservación de estado en aislamiento; no asociar al hotel por defecto. Mantener intake/revisiones como pendiente independiente. |
| P0 / TRANSPORT | RICO / Mauricio | Conservar baseline29/30/5/6; confirmar modalidad, equipaje, cupos y proveedor. Planned no es contratado. |
| P0 / ROOMING | RICO / Mauricio | Validar noches/grupos/capacidad y Kross antes de asignar/bloquear. Placeholder no es reserva. |
| P0 de habilitación / OPENCLAW | TORO Brain / Mauricio | Resolver mapping privado, claim/OTP/permisos existentes y auditoría de host. Sin dispatch/invitaciones antes de QA, actor verificado y receipt. |

## FUTURE / P1, recuperación y aprendizaje

Comunidad persistente, fotos privadas, moderación y piloto consentido quedan después de los gatesP0. Comunicación familiar exige autorización específica. No añadir otro agente, scheduler, base ni Slack para saltar un bloqueo.
El comentario de implementación acotada en PR96 solicita a la integración Codex existente incorporar únicamente el lockfile probado. Al momento de emitirlo no había ACK ni commit de reparación observado; una solicitud no acredita ejecución. No ampliar permisos si el worker no puede hacerlo.
Ciclo autónomo canónico: tarea→lease/fencing→acción acotada→verificación→receipt. Los logs de CI y notas de esta ronda no son receipts del Gateway/Control Plane.
Sin merge, cambios de producción, permisos, datos Supabase, pagos, reservas o invitaciones. Estados de tareas no se cierran por esta auditoría.
Rollback: revert normal de commits candidatos; archivo previo conservado y patch revisado. El workflow diagnóstico no permanece activo. No force-push ni sobrescritura de trabajo concurrente.
Aprendizaje: distinguir reparación en copia, archivo incorporado a Git, instalación/seguridad/calidad/E2E y autorización. Verificar hashes desde bytes, no desde resúmenes. El mapping de una tarea privada exige probar privacidad, no solo claves únicas.

## Referencias

- https://github.com/Dramcatcherst/Toro-OS/issues/246
- https://github.com/Dramcatcherst/Toro-OS/pull/252
- https://github.com/Dramcatcherst/dreamcatcher-website-vnext/pull/96
- https://github.com/Dramcatcherst/dreamcatcher-website-vnext/actions/runs/37728619852
- https://github.com/Dramcatcherst/dreamcatcher-website-vnext/actions/runs/37732401701
- https://github.com/Dramcatcherst/dreamcatcher-website-vnext/actions/runs/37733083219
- https://github.com/Dramcatcherst/dreamcatcher-website-vnext/pull/96#issuecomment-6053230057
