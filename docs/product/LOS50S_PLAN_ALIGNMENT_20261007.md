# Los 50s de Caro — alineación al Plan General de TORO

Fecha de revisión: 2026-10-07, America/Costa_Rica. Cortes: Supabase 21:18; preview candidato 21:32.
Horizonte: CURRENT evidencia / NEXT ejecución acotada. Liberación: NOT RELEASED — piloto privado.
Ficha subordinada a `docs/product/TORO_BRAIN_GENERAL_PLAN.md`; no crea otro plan, proyecto, base, agente ni scheduler. El historial previo permanece en Git.

## Alcance y autoridad

- Proyecto familiar privado, separado de la operación comercial del hotel. Subsistemas existentes: TORO Systems, Identity, Comms y Event Ops; seguimiento #246 y PR documental #252.
- GitHub: código y contratos. Supabase: datos operativos, identidad, permisos y receipts. Airtable: control humano transicional. Vercel: despliegue. Kross: inventario y reservas reales.
- Reutilizar las cinco tareas Airtable `LOS50K-PORTAL-V2`, `LOS50K-DATA-COMPLETE`, `LOS50K-ROOMING`, `LOS50K-TRANSPORT`, `LOS50K-OPENCLAW`; responsables, prioridades y estados existentes. Sus notas no demuestran registro en la cola canónica.
- Web base: `Dramcatcherst/dreamcatcher-website-vnext`, rama `codex/website-progress-20260924`, SHA observado `c23a674ee1e9140f5bd9d9c82ce236411d966562`. No usar la rama default histórica como destino por inercia.

## CURRENT — corrección del diagnóstico anterior

### DATE-01 / P0: la base de datos instalada ya tiene las fechas 29/30

Lectura directa, solo SELECT, de `public.los50s_materialize_registration(uuid)` y del manifiesto del evento el 2026-10-08T03:18:47Z:
- La función instalada genera salidas de SJO el 29 nov, MA→Santa Teresa el 30 nov, regreso a SJO el 5 dic y salida al aeropuerto el 6 dic.
- Los tramos existentes observados tienen esas fechas; cero discrepancias contra esta línea. Su estado planned NO prueba proveedor, cupo, reserva o traslado confirmado.
- La función instalada incluye `org_id` en sus conflictos únicos. Fingerprint técnico MD5 de `pg_get_functiondef`: `51796012fddd59641b9690fbdbaf1542`.
- El archivo `supabase/drafts/20261002_los50s_event_ops_applied.sql` de TORO main conserva fechas 28/29 y una implementación anterior. NO reaplicarlo sobre producción; el nombre applied no acredita paridad.

**Sustituye la instrucción anterior de corregir/backfill por defecto:** no se requiere backfill de fechas para las filas observadas. Cualquier reparación futura exige una discrepancia nueva comprobada, snapshot, prueba y rollback. Conservar la función instalada; recuperar después su procedencia versionada sin perder aislamiento por organización.

La Library devolvió `Los50K_Presupuesto_Itinerario_v2_2026-09-30.xlsx`: salida el 29, parque/traslado el 30 y noche inicial SJO eliminada, con referencia a decisión del usuario del 30-sep. PR web #92 coincide. No se recuperó el chat original más reciente: esta evidencia permite preparar un candidato reversible, no autorizar una publicación ni compromisos de viaje.

### REL-01 / P0: candidato nuevo, no publicación

- Producción observada previamente a 20:24 CR: dominio `dreamcatcherhotel.com` → `dpl_9Z1BJTAhkLpWddN2U9uP84GStdgn`, SHA `5f54e720`; `/los50sdecaro` devolvió 404. No se reasignó el dominio ni se promovió un despliegue.
- NUEVO PR web #96, borrador: rama `los50s/align-installed-itinerary-20261007`, commit `cd0cf359ab06bb870429c99f4ece2b5bb29e9931`, sobre c23a674. Solo modifica tres entradas de itinerario y añade un archivo de pruebas.
- Candidato: 29 nov llegada + salida el mismo día a MA o directo ST; 30 nov parque MA + ST; 1 dic hotel. Las tarifas por edad/ruta, reglas cama/asiento, fondo incluido, solidaridad y fechas de fiesta/salida no cambiaron.
- Vercel `dpl_79EcDvATqvcgBnvfLrxtfKyrf4qw` READY, target null, SHA exacto del candidato. GET autenticado `/los50sdecaro` a 2026-10-08T03:32:39Z devolvió 200 y HTML con las fechas corregidas.
- Se ejecutaron seis pruebas sobre el módulo real: original 4 PASS/2 FAIL por las fechas; candidato 6 PASS/0 FAIL. Typecheck del archivo PASS. Copia local verificada por hash Git; no fue checkout completo.
- GitHub Actions consultado para ese SHA devolvió cero runs. `npm run verify` completo, QA móvil y flujo extremo a extremo siguen SIN CERTIFICAR. READY y HTML 200 no sustituyen esos gates.
- Rutas correctas: `/los50sdecaro`, `/los50sdecaro/inscripcion`, `/los50sdecaro/comunidad`, `/los50sdecaro/invitacion`.

### DATA-01 / P0: registros, identidades y tareas son métricas distintas

- La lectura directa distingue formularios repetidos, referencias únicas de participantes, perfiles materializados y habitaciones sin asignar. No sumar las menciones de personas entre formularios para contar invitados.
- Conteos detallados y evidencia operativa permanecen en el seguimiento privado; no publicar payloads, teléfonos, vuelos, alergias, pagos ni identificadores de invitación.
- RLS y privilegios revisados no conceden SELECT directo a anon/authenticated sobre los objetos Los50s consultados; la función materializadora es ejecutable por service_role, no por clientes. Esta revisión de metadatos NO certifica toda la API ni la autorización de extremo a extremo.
- No se encontraron las cinco tareas Airtable por sus source_record_id o claves LOS50K en `operations.tasks`, ni un proyecto Los50s en la búsqueda acotada de `operations.projects`. Una coincidencia de tarea de publicación de la web no acredita ese mapping. Estado: MAPPING_NOT_VERIFIED; no dispatch ni cierre canónico acreditado.

### PRICE-01 / P0 e identidad/comunicaciones

- Adulto Directo USD 800 / MA USD 1,000 siguen como referencias; fondo USD 100 incluido una sola vez, solidaridad voluntaria aparte. Los doce escenarios Airtable requieren recotización. No cambiar precios ni tratar modelos como costos conciliados.
- PRs #247/#248 y V4/#249 son fundamentos existentes; los borradores de invitaciones/membresía no prueban activación en base de datos. Reutilizar Auth/app_users; no identidad paralela.
- OpenClaw sigue sin prueba en host real, canal, ACK y receipt durante esta ronda. No inferir ejecución por un comentario, PR o nota Airtable.

## TARGET — aceptación pendiente

Un invitado verifica identidad, reclama una invitación una sola vez y queda vinculado a su registro existente; solo ve el alcance permitido. Dos miembros comparten texto/foto/like persistentes; un tercero es rechazado. Datos, itinerario y costos quedan coherentes; el propietario prueba WhatsApp con ACK y receipt. Ninguna regresión de hotel ni publicación de datos privados.

## NEXT — trabajo acotado sobre las tareas existentes

| Prioridad / tarea | Responsable existente | Siguiente acción y criterio de terminado |
| --- | --- | --- |
| P0 / PORTAL-V2 | TORO Brain | Revisar PR96, ejecutar verify completo y QA móvil/renderizado. Corregir inclusiones hardcodeadas, noches/comidas y promesa de bote aún pendientes en Los50sPortal.tsx; no fusionar #92 completo. Terminado con CI/QA, alcance aprobado y publicación verificada tras aprobación específica. |
| P0 / DATA-COMPLETE | TERE / encargados, implementación TORO | Reconciliar revisiones de formularios y registro de identidad sin duplicar. Verificar la ruta de intake a materialización y mapear las cinco tareas humanas a la cola existente con scope/procedencia correctos, sin activar trabajo no autorizado. NO ejecutar backfill de fechas innecesario. |
| P0 / TRANSPORT | RICO / Mauricio | Mantener baseline instalado 29/30/5/6; validar vuelos, equipaje, cupos, modalidad, horarios y cotización de proveedor. Planned no equivale a contratado. Sin compra ni cambio automático. |
| P0 / ROOMING | RICO / Mauricio | Alinear noches y grupos; validar capacidad/disponibilidad real Kross antes de asignar o bloquear. Preferencia o placeholder no es habitación confirmada. |
| P0 de habilitación / OPENCLAW | TORO Brain / Mauricio | Completar claim atómico, OTP y permisos reutilizando #247/#248; en paralelo auditoría host autorizada. Probar un ganador ante doble submit, expiración/replay/revocación, terceros y tutor; owner-only con ACK/receipt antes de invitados. |

El mapping a Control Plane es dependencia del dispatch autónomo, no motivo para otro tablero/base. Las tareas no se marcan DONE por esta auditoría.

## FUTURE / P1 — después de los gates

Comunidad persistente, fotos privadas y moderación; admin auditado; piloto con owner y segundo usuario controlado/consentido; aprobación de comunicación familiar. No añadir Slack, agentes, bases o schedulers paralelos ni ampliar funciones sociales mientras sigan abiertos P0.

## Verificación, recuperación y límites

Ciclo de ejecución autónoma: tarea canónica → lease/fencing → acción acotada → verificación → receipt. Las notas y pruebas de esta ronda no son receipts de OpenClaw/Control Plane.

Esta ronda creó un candidato de código privado y actualizó seguimiento; NO cambió datos del evento, función instalada, permisos, reservas, pagos ni dominio de producción. No envió invitaciones. Revertir el candidato o cerrar PR96 recupera el estado previo del código sin rollback de datos. El PR documental #252 sigue separado de la integración de código y sujeto a revisión; no forzar merge.

Aprendizaje: distinguir archivo SQL histórico de función instalada; distinguir cuatro formularios de cuatro altas únicas; distinguir Airtable de tarea canónica; y distinguir build, HTTP, comportamiento, persistencia y autorización. No volver a aplicar migraciones para corregir una diferencia que solo está en el código archivado.

## Referencias

- https://github.com/Dramcatcherst/Toro-OS/issues/246
- https://github.com/Dramcatcherst/Toro-OS/pull/249
- https://github.com/Dramcatcherst/Toro-OS/pull/252
- https://github.com/Dramcatcherst/dreamcatcher-website-vnext/pull/96
- https://github.com/Dramcatcherst/dreamcatcher-website-vnext/pull/92
- https://github.com/Dramcatcherst/dreamcatcher-website-vnext/blob/cd0cf359ab06bb870429c99f4ece2b5bb29e9931/src/data/los50s-public.ts
- https://vercel.com/dreamcatcher-s-projects/dreamcatcher-website-vnext-media-p0/79EcDvATqvcgBnvfLrxtfKyrf4qw
