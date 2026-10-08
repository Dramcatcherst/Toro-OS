# Los 50s de Caro — alineación al Plan General de TORO

Fecha de revisión: 2026-10-07, America/Costa_Rica. Corte HTTP: 20:24.
Horizonte de esta ficha: CURRENT diagnóstico / NEXT ejecución acotada.
Estado de liberación: NOT RELEASED — piloto privado, sin autorización de invitaciones.
Esta ficha es subordinada a `docs/product/TORO_BRAIN_GENERAL_PLAN.md`; no crea otro plan, proyecto, base, agente ni scheduler.

## Alcance, autoridad y tareas existentes

- Scope: proyecto familiar privado Los 50s de Caro; separado de la operación comercial del hotel.
- Subsistemas existentes: TORO Systems, Identity, Comms y Event Ops. Issue de ejecución: TORO #246. OpenClaw/SOBRESITO son ejecutores solo donde haya capacidad y permisos verificados.
- GitHub conserva código y contratos; Supabase, datos operativos, identidad, permisos y receipts; Airtable, referencia y control humano transicional; Vercel, evidencia de despliegue. Kross conserva autoridad sobre inventario y reservas reales.
- Se verificaron CINCO tareas Airtable con `linked_entity_key=LOS50K`: `LOS50K-PORTAL-V2`, `LOS50K-DATA-COMPLETE`, `LOS50K-ROOMING`, `LOS50K-TRANSPORT` y `LOS50K-OPENCLAW`. Reutilizar sus responsables y claves; no inventar fechas de compromiso ni duplicar backlog.
- La web continúa en `Dramcatcherst/dreamcatcher-website-vnext`, rama `codex/website-progress-20260924`. La aprobación de un PR no implica publicación ni autorización para contactar familiares.

## CURRENT — evidencia y límites

### P0 / REL-01 — producción y preview son versiones distintas

- Alias `dreamcatcherhotel.com` observado en Vercel: `dpl_9Z1BJTAhkLpWddN2U9uP84GStdgn`, target production, SHA `5f54e720f89c641e0b1d54c7446430a7fa5d3695`.
- GET mediante el conector Vercel a `https://dreamcatcherhotel.com/los50sdecaro`: HTTP 404; HTML identifica ese mismo deployment. Corte 2026-10-08T02:24:06Z.
- Preview reciente: `dpl_3wVE317TiR8Ra5DGQDs4gmveSrEy`, SHA `c23a674ee1e9140f5bd9d9c82ce236411d966562`, READY, target null. GET autenticado a su ruta `/los50sdecaro`: HTTP 200 a 2026-10-08T02:23:09Z.
- Este 200 acredita entrega HTML del preview protegido; NO acredita inscripción, persistencia, identidad, permisos, móvil ni E2E.
- Las rutas de navegación observadas son `/los50sdecaro/inscripcion`, `/los50sdecaro/comunidad` y `/los50sdecaro/invitacion`; no confundirlas con `/inscripcion` o `/comunidad` en la raíz.
- El preview histórico `dreamcatcher-los50s-preview-p0` no es la línea de liberación. No promover, reasignar alias ni borrar proyectos desde esta ficha.

### P0 / DATE-01 — tres representaciones incompatibles

1. Plan de referencia / PR web #92 / supuestos de Airtable: llegada oficial y salida de SJO el 29 nov; Manuel Antonio → Santa Teresa el 30 nov.
2. Código web actual `src/data/los50s-public.ts` en SHA `c23a674`: noche en San José el 29 nov; salida a Manuel Antonio el 30 nov; parque y llegada a Santa Teresa el 1 dic. El HTML del preview reproduce esta variante.
3. Fuente SQL en `main`, `supabase/drafts/20261002_los50s_event_ops_applied.sql`, líneas 348–395, blob `a4a2c7cdd788783831f66dae7a1246635ac84555`: genera `sjo_to_direct` y `sjo_to_manuel_antonio` el 28 nov y `manuel_antonio_to_st` el 29 nov.

El estado de la función realmente instalada y de sus filas en Supabase NO se verificó en esta ronda. El sufijo `applied` del archivo no demuestra paridad con producción. Tampoco se asume que el código web más reciente sustituya una decisión de negocio por su fecha de commit.

Dependencia: recuperar la última decisión explícita del propietario y resolver la discrepancia con evidencia. No cambiar silenciosamente el itinerario, fusionar #92 a ciegas ni corregir solo la pantalla. La fiesta del 4 dic y el cierre del 6 dic no resuelven el conflicto de noches, comidas y traslados intermedios.

### P0 / DATA-01 — inscripción no equivale a identidad

- El documento V4 de TORO #249 registra PR #247 y #248 integrados: invitaciones criptográficas y autorización de miembros reutilizando `auth.users/public.app_users`.
- Los SQL de invitaciones y membresías siguen REVIEW-ONLY según ese documento. No repetir esas implementaciones ni aplicarlas por inferencia.
- Los conteos históricos de invitados, formularios, perfiles, usuarios generales y pagos son métricas distintas. No presentarlos como conteos actuales de miembros verificados sin nueva lectura de Supabase.
- OpenClaw permanece sin prueba de host/canal/ACK/receipt en la evidencia revisada. Ningún comentario GitHub es un receipt de ejecución del Gateway.

### P0 / PRICE-01 — presupuesto y alcance deben conciliarse juntos

- Referencias públicas observadas: adulto Directo USD 800 / Manuel Antonio USD 1,000; fondo común USD 100 ya incluido una sola vez; solidario voluntario separado.
- Los 12 escenarios de Airtable consultados siguen marcados `Requiere recotización`. Costos internos y gaps quedan en la superficie privada, no en este repositorio público.
- No tratar precio público como costo validado, sumar otra vez el fondo ni ajustar precios automáticamente. Conciliar noches, comidas, transporte, edades y cuotas con el itinerario que resulte autorizado.

## TARGET — resultado de aceptación, todavía no acreditado

Una persona verifica su identidad, reclama una invitación una sola vez y queda vinculada a su registro existente; consulta solo su grupo, habitación y saldo. Dos miembros autorizados comparten comentario/foto/like persistentes y un tercero no autorizado es rechazado. La operación usa fechas y totales coherentes. El propietario completa una prueba WhatsApp con ACK y receipt. Todo funciona sin regresión de hotel ni datos privados expuestos.

## NEXT — ejecución por dependencia sobre las cinco tareas

| Orden / prioridad | Tarea y responsable existente | Acción siguiente | Dependencia y criterio de terminado |
| --- | --- | --- | --- |
| 1 / P0 | PORTAL-V2 — TORO Brain | Resolver DATE-01 mediante fuente del propietario; comparar #92 con el código activo y preparar una corrección mínima, no un merge de versiones antiguas completo. | Itinerario, noches, comidas y precios conciliados con DATA/TRANSPORT; pruebas negativas de datos privados, rutas anidadas, móvil 390/412/1440 y hotel `/es`, `/es/stays`. HTTP 200 solo no cierra. |
| 2 / P0 | DATA-COMPLETE — TERE / encargados de familia; implementación técnica por TORO | Leer función instalada y manifiestos actuales; comparar con SQL versionado; preparar corrección del materializador y backfill acotado de filas existentes. Reconciliar personas/grupos sin contacto externo. | DATE-01 resuelto; snapshot previo; fixture sintético nuevo y repetido produce legs correctos sin duplicados; backfill idempotente, auditoría before/after y rollback. Aplicación real requiere revisión y autorización aplicables. |
| 3 / P0 | TRANSPORT — RICO / Mauricio | Reconciliar fechas por ruta, vuelos, equipaje y proveedor; cruzar escenarios privados de costos y alcance. | DATA-01/DATE-01; manifiesto por persona sin tramos obsoletos; precio, cupos y proveedor aprobados. Ninguna compra, reserva de bote o cambio de precio automático. |
| 4 / P0 | ROOMING — RICO / Mauricio | Revisar noches, capacidad, cama, grupo y posibles conflictos con reservas comerciales. | Fechas conciliadas y personas identificadas; asignación sin duplicación, evidencia de capacidad y aprobación antes de cambios Kross. Preferencia no es reserva. |
| 5 / P0 de habilitación | OPENCLAW — TORO Brain / Mauricio | Reanudar V4 sin recrear #247/#248: claim atómico, Auth/OTP y membresía; en paralelo, diagnóstico del host autorizado y canal aislado. | Pruebas de doble submit/un ganador, expiración/replay/revocación, usuario/org/evento ajeno y tutor; migraciones aún no aplicadas; host real, remitente verificado y prueba owner-only con ACK + receipt antes de uso externo. |

Las filas son paquetes dependientes, no fechas prometidas. El trabajo técnico aislado de identidad puede avanzar en paralelo a la conciliación de negocio, pero ninguna liberación omite ambos gates.

## FUTURE — posterior a gates P0

- P1: comunidad persistente, fotos privadas, comentarios, likes, moderación y admin con roles; depende de identidad, permisos y prueba de aislamiento.
- P1: piloto con propietario y segundo usuario controlado/consentido; acceso de tercero denegado, rollback y regresión del hotel; después, autorización específica de comunicación familiar.
- No añadir Slack, otra base, otro motor de identidad ni nuevos agentes para este piloto. No ampliar funciones sociales mientras sigan abiertos los bloqueos de datos y publicación.

## Verificación, recuperación y cierre

- Toda acción material automatizada conserva el ciclo del Control Plane: tarea canónica → lease/fencing → ejecución acotada → verificación → receipt → estado. Esta ficha y las notas de auditoría NO son receipts de ese runtime.
- No marcar tareas DONE por documentos, tests estáticos o READY. No declarar registros, pagos, comunidad ni WhatsApp operativos sin prueba correspondiente.
- Cambio de esta ronda limitado a documentación y seguimiento. No SQL aplicado, permisos ampliados, datos familiares modificados, alias cambiado ni mensaje externo enviado.
- El PR #252 permanece sujeto a revisión, CI y reconciliación con main; no forzar merge. Los hallazgos de revisión se incorporan al plan, no se declaran reparaciones de runtime.
- Recuperación del cambio documental: restaurar la versión previa del archivo mediante commit/PR, sin reescribir historia. Antes de corregir datos reales: snapshot acotado, transacción/prueba reversible y rollback revisado.
- Regla reutilizable: acreditar por separado código, build, alias efectivo, ruta HTTP, comportamiento, persistencia y autorización. Una marca READY no propaga aprobación al siguiente nivel.

## Referencias

- https://github.com/Dramcatcherst/Toro-OS/issues/246
- https://github.com/Dramcatcherst/Toro-OS/pull/249
- https://github.com/Dramcatcherst/Toro-OS/pull/252
- https://github.com/Dramcatcherst/dreamcatcher-website-vnext/pull/92
- https://github.com/Dramcatcherst/dreamcatcher-website-vnext/pull/95
- https://github.com/Dramcatcherst/dreamcatcher-website-vnext/blob/c23a674ee1e9140f5bd9d9c82ce236411d966562/src/data/los50s-public.ts
- https://github.com/Dramcatcherst/Toro-OS/blob/main/supabase/drafts/20261002_los50s_event_ops_applied.sql
- https://vercel.com/dreamcatcher-s-projects/dreamcatcher-website-vnext-media-p0/3wVE317TiR8Ra5DGQDs4gmveSrEy
