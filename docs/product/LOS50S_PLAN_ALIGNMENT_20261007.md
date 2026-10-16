# Los 50s de Caro — alineación al Plan General de TORO

Revisión de ejecución V6: 7 octubre 2026, America/Costa_Rica. Diagnóstico completo terminado a23:37CR / 2026-10-08T05:37Z.
Horizonte: CURRENT evidencia / NEXT reparación acotada. Liberación: NOT RELEASED — piloto privado.
Ficha subordinada a `docs/product/TORO_BRAIN_GENERAL_PLAN.md`; no crea otro plan, proyecto, base, agente ni scheduler. Versiones anteriores permanecen en Git.

## Alcance y autoridad

Proyecto familiar privado, separado de la operación comercial del hotel. Subsistemas existentes: TORO Systems, Identity, Comms y Event Ops. Seguimiento: issue246, PR documental252 y PR web96.
GitHub conserva código/contratos; Supabase, datos operativos/identidad/permisos/receipts; Airtable, control humano transicional; Vercel, evidencia de despliegue; Kross, inventario y reservas reales.
Reutilizar las cinco tareas `LOS50K-PORTAL-V2`, `LOS50K-DATA-COMPLETE`, `LOS50K-TRANSPORT`, `LOS50K-ROOMING`, `LOS50K-OPENCLAW`. No inventar responsables, estados ni fechas. Su presencia en Airtable no acredita dispatch canónico.
Web base: `codex/website-progress-20260924`, SHA observado `c23a674ee1e9140f5bd9d9c82ce236411d966562`. Candidato: `los50s/align-installed-itinerary-20261007`, PR96 borrador. No merge ni publicación autorizados por esta ejecución.

## Estado operativo vigente — V7, 15 octubre 2026

Esta actualización es aditiva y prevalece sobre el snapshot V6 únicamente cuando describe el estado actual de PR96 y su preview. No convierte los diagnósticos históricos en hechos vigentes ni autoriza producción.

- **CURRENT / superficie:** commit web `c5a2e2ae090933e524e608711f16e6c9c8d8a0c2`, deployment Vercel `dpl_D2U7yJy8fSDdfiYAG1qyoKXyGE36`, alias corto protegido `los50s-toro.vercel.app`, ruta `/los50sdecaro`; respuesta HTTP 200 y `noindex, nofollow` observados. Producción no cambió.
- **CURRENT / experiencia TORO:** la familia Toro aparece como primer grupo familiar del piloto. TORO actúa como gerente, administrador y concierge digital; el contacto `+506 8844 4004` puede abrirse por WhatsApp, llamada o vCard. El álbum se explica como memoria familiar opcional y excluye pasaportes, comprobantes y documentos personales. Solo WhatsApp conserva logotipo de aplicación.
- **CURRENT / límites:** TORO ordena, conserva, prepara y orienta. Mauricio, Dreamcatcher y responsables humanos confirman habitaciones, proveedores, pagos y decisiones sensibles. El preview no acredita identidad, consentimiento, receipt de WhatsApp, reserva, cobro ni autonomía.
- **Verificación:** suite unitaria, TypeScript, lint, build, rutas, secretos, gobierno, medios, rendimiento, terminología y render estático aprobaron; navegador revisado a 390 px y escritorio sin desborde ni errores de consola. Vercel vinculó el deployment al SHA exacto.

### Propiedad y mapeo canónico

| Estado / tarea existente | Propietario funcional | Dependencias y criterio |
| --- | --- | --- |
| CURRENT / `LOS50K-PORTAL-V2` | Event Ops + TORO Brain | Superficie en PR96 y preview protegido; no equivale a liberación pública. |
| NEXT P0 / `LOS50K-DATA-COMPLETE` | TORO Identity + Event Ops | Identidad individual, consentimiento, scope familiar privado, persistencia mínima y rechazo entre actores antes de compartir el directorio. |
| NEXT P0 / `LOS50K-OPENCLAW` | TORO Comms + TORO Brain | Un actor autorizado, intención explícita, ACK/receipt y límites de acción; abrir WhatsApp no acredita envío. |
| DEPENDENCY / `LOS50K-TRANSPORT` | RICO + Mauricio | Autoridad humana sobre modalidad, equipaje, cupo y proveedor; el concierge no confirma contratación. |
| DEPENDENCY / `LOS50K-ROOMING` | RICO + Mauricio | Autoridad Kross/humana sobre capacidad y asignación; el concierge no convierte una preferencia en reserva. |

**TARGET:** piloto familiar consentido y trazable sobre el mismo TORO, sin base, agente, memoria, plan ni scheduler paralelo. Los aprendizajes reutilizables se sanean antes de generalizarse y nunca incluyen datos familiares.

**NEXT único:** cerrar y probar `LOS50K-DATA-COMPLETE`. No enviar invitaciones, quitar protección, abrir el directorio nominal, automatizar mensajes ni tratar el preview como producción antes de identidad, consentimiento y aislamiento verificados.

**FUTURE:** probar `LOS50K-OPENCLAW` con un único actor autorizado y receipt; después medir preguntas resueltas, correcciones, tiempos y fallos. Por instrucción del propietario del16/10/2026, la continuidad horaria queda PAUSADA. El trabajo es a demanda y los candidatos de eventos no reactivan el scheduler. Un modo viaje futuro requiere periodo y autorización expresos; no acredita autonomía ni permiso para contactar participantes.

## Estado operativo V8 — pausa y candidatos de eventos, 16 octubre 2026

**DIRECTIVA DEL PROPIETARIO:** Los50deCaro no necesita revisión cada hora durante la preparación; considerar automatización cuando esté el viaje. Se pausó la automatización existente y se nombró «Los 50 de Caro · pausado · a demanda». Lectura posterior verificó PAUSED, mismo destino y regla histórica inactiva; no se creó otro scheduler ni sondeo. La pausa no borra el proyecto, sus cinco tareas ni la evidencia. Esta directiva prevalece sobre la posibilidad horaria del snapshot V7.

**CURRENT:** pausa y perfil de operación verificados. **PREPARADO:** treinta reglas explícitas para candidatos de eventos. **NO ACREDITADO:** transporte de eventos, recepción externa, reactivación automática o autoapagado al terminar el viaje. Un heartbeat pausado conserva su antigua regla sin ejecutar revisiones; guardar estas reglas no conecta webhooks.

Los candidatos son una petición expresa del dueño, nueva evidencia vinculada, RSVP revisado, cambio de itinerario, vencimiento sustentado y cambio técnico con SHA. Cada candidato requiere identidad, ámbito y revisión antes de trabajo; no es una autorización de acción externa. Hoy se trabaja únicamente a demanda. La futura ventana de viaje se decide con fechas y alcance comprobados, sin inferir una activación desde el calendario.

### Treinta reglas del perfil operativo

- **L50-EVT-01 — Modo actual a demanda:** Permanecer PAUSED; trabajar únicamente tras una solicitud puntual y autorizada en el contexto del proyecto.
- **L50-EVT-02 — Reactivación específica:** Un «continuar», un superprompt o una auditoría global no autoriza reactivar el heartbeat.
- **L50-EVT-03 — Modo viaje optativo:** Habilitar modo viaje solo tras instrucción expresa del propietario que indique alcance y periodo.
- **L50-EVT-04 — Ventana explícita:** La futura activación debe tener inicio y fin, con zona America/Costa_Rica y zona del servicio cuando corresponda.
- **L50-EVT-05 — Fechas sustentadas:** Contrastar fechas del viaje con evidencia vigente; no inferirlas de un chat antiguo o de una propuesta.
- **L50-EVT-06 — Fin de ventana:** Al acabar un periodo expresamente habilitado, solicitar o ejecutar la pausa solo mediante la capacidad autorizada y acreditar el resultado; no afirmar que ya existe autoapagado.
- **L50-EVT-07 — Solicitud del dueño:** Reconocer la orden expresa de Mauricio como candidato de trabajo puntual; resolver alcance y autorización antes de actuar.
- **L50-EVT-08 — Nueva evidencia:** Considerar nueva evidencia solo si está vinculada a una tarea abierta del proyecto; un archivo irrelevante no dispara trabajo.
- **L50-EVT-09 — RSVP revisado:** Un cambio RSVP es candidato pendiente de identidad y revisión; no confirma una reserva ni autoriza contacto.
- **L50-EVT-10 — Cambio de itinerario:** Considerar un cambio de itinerario solo con origen, referencia y revisión identificados.
- **L50-EVT-11 — Vencimiento auténtico:** Considerar un vencimiento solo con fecha, zona y fuente verificadas; no crear un recordatorio periódico sustituto.
- **L50-EVT-12 — Cambio técnico concreto:** Para cambios de PR usar número y SHA exactos, consultando solo el delta pertinente; ningún cambio técnico reactiva el scheduler.
- **L50-EVT-13 — Identificador mínimo:** El candidato conserva origen, identificador nativo y clave de tarea/proyecto; no genera otra tarea por defecto.
- **L50-EVT-14 — Tipo y revisión:** Registrar tipo, revisión y fecha observada; distinguir un candidato de un evento aceptado por un transporte.
- **L50-EVT-15 — Metadatos privados mínimos:** Mantener nombres, documentos y detalles financieros fuera del metadato genérico de disparo y del repositorio público.
- **L50-EVT-16 — Deduplicación del evento:** Comparar origen+tipo+identificador+revisión con el último recibo autorizado antes de procesar.
- **L50-EVT-17 — Orden de revisiones:** Un evento antiguo no puede revertir estado o cursor; contrastar con la revisión canónica actual.
- **L50-EVT-18 — Último recibo:** Conservar la referencia del último evento procesado y su evidencia únicamente en el soporte permitido.
- **L50-EVT-19 — Responsable único:** Reutilizar propietario/escritor y ejecución existentes; no arrancar otro worker para el mismo cambio.
- **L50-EVT-20 — Comparación previa:** Comparar versión/hash inmediatamente antes de guardar cualquier cambio autorizado.
- **L50-EVT-21 — Conflicto sin sobrescritura:** Ante concurrencia, conservar trabajo ajeno y cursor; dejar recibo solo donde esté permitido.
- **L50-EVT-22 — Unidad puntual:** Cada activación manual resuelve una unidad con criterio de terminado; no abre una campaña de mejoras indefinida.
- **L50-EVT-23 — Sin delta, espera:** Si no hay evidencia nueva ni una estrategia distinta justificable, detenerse sin trabajo artificial ni aviso repetido.
- **L50-EVT-24 — Sin sondeo sustituto:** No crear otra tarea, monitor, recordatorio o consulta periódica que sustituya la revisión horaria pausada.
- **L50-EVT-25 — Familia y hotel aislados:** Conservar Los50 como proyecto familiar; no llevar sus eventos, datos o compromisos a contabilidad u operación hotelera.
- **L50-EVT-26 — Hechos distintos:** RSVP, reserva, comprobante, pago y compromiso son hechos distintos y requieren sus propias pruebas.
- **L50-EVT-27 — Sin efectos implícitos:** Un candidato de evento no autoriza mensajes, invitaciones, pagos, contratación, reservas, permisos ni publicación.
- **L50-EVT-28 — Recibo y prueba:** Un avance real conserva candidato/origen, cambio verificado, prueba, limitación y reversión.
- **L50-EVT-29 — Superprompt puntual:** Dejar como máximo120palabras con un único NEXT y el evento o autorización que permitiría retomarlo; nunca ordenar reactivación automática.
- **L50-EVT-30 — Estado honesto de disparadores:** Distinguir PAUSED, perfil preparado, evento conectado y recepción probada. Aquí no hay un trigger externo conectado por guardar este perfil.

Son reglas documentadas y guardadas en un perfil pausado: no se cuentan como treinta funciones nuevas, resultados de negocio o disparadores operativos. El [contrato transversal de continuidad propuesto](https://github.com/Dramcatcherst/Toro-OS/pull/311) conserva el mismo Plan General y las autoridades existentes; su ampliación sigue en PR311.

**Siguiente instrucción:** mantener PAUSED. Cuando Mauricio pida un trabajo concreto, continuar solo el NEXT propio de Los50 con el checkpoint y evidencia pertinentes; conservar identidad, consentimiento y aislamiento de LOS50K-DATA-COMPLETE como aceptación funcional pendiente. Activar modo viaje o conectar eventos es una decisión posterior, con periodo, transporte, permisos y recibo real. Ningún perfil genérico puede reactivar este caso.

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
