# TORO People — base de identidad por canal, evidencia 25/09/2026 CR

**Alcance:** DreamTeam como implementación heredada de TORO People. El Plan General de TORO conserva la decisión de piloto por fases; este documento registra evidencia técnica y puertas pendientes.

## Integración

- PR [#39](https://github.com/Dramcatcherst/dream-team/pull/39): núcleo de perfiles, Role Packs, onboarding y horarios; incluye protección explícita de las dos vistas derivadas, incorporada mediante [#44](https://github.com/Dramcatcherst/dream-team/pull/44).
- PR [#45](https://github.com/Dramcatcherst/dream-team/pull/45): consolidación de #41 y #42 sobre el núcleo integrado. Incluye la corrección del token consumido de [#43](https://github.com/Dramcatcherst/dream-team/pull/43). #41 y #42 se cerraron por sustitución.
- CI de la combinación: DREAM TEAM checks #116 pasó migraciones, política RPC, lint, tipos, pruebas y compilación. El SQL de creación y consumo se ensayó en Supabase con transacción revertida antes de aplicarlo.

## Supabase productivo: readback

Proyecto `abtyrbqlqbsastmridzp`. Migraciones registradas:

- `20260926053026`: `toro_people_channel_identity_foundation_20260925`.
- `20260926053030`: `toro_people_atomic_enrollment_consume_20260925`.

Estado comprobado tras aplicación:

| Control | Resultado |
| --- | --- |
| `public.employee_channel_enrollments` y `public.employee_channel_identities` | Existen; RLS activo; 0 filas en ambas |
| Lectura de tablas por `anon` / `authenticated` | Denegada en ambas |
| Lectura de tablas por `service_role` | Permitida |
| `consume_employee_channel_enrollment_v1` | `SECURITY INVOKER`; `search_path` vacío |
| Ejecución RPC por `anon` / `authenticated` | Denegada |
| Ejecución RPC por `service_role` | Permitida |
| Desafío sintético desconocido llamado como `service_role` | `{"status":"invalid"}` |
| Vistas `employee_reward_balances` / `employee_experience_kpis` | El guard de acceso se ensayó en transacción revertida; ambas conservan `security_invoker=true`, sin SELECT cliente |

La prueba sintética de #43 ejecutó la función SQL contra una base desechable con remitente original, remitente distinto, identidad revocada y empleo terminado. El código rechaza el reintento de un remitente distinto sin devolver identificadores.

## Puertas pendientes y reversión

- No se generaron tokens, no se enlazaron empleados y no se enviaron mensajes.
- Ocho empleados activos requieren verificación individual de identidad sin asociación por nombre. El registro terminado permanece sin acceso.
- Faltan prueba protegida por rol, aislamiento Personal/Organización, revocación, autoservicio DreamTeam, emisión gobernada del token, auditoría de host/Gateway y los 12 casos E2E de OpenClaw/WhatsApp.
- Los rollback SQL de canal rehúsan eliminar tablas con enrolamientos o identidades existentes. Con tablas vacías, revisar dependencias antes de revertir; mantener las restricciones de las vistas derivadas aun si se revierte otra migración.
- CI, DDL y respuesta a desafío inexistente no certifican un empleado real ni el canal WhatsApp.

**Criterio de siguiente piloto:** una persona elegida por identidad demostrada, rol mínimo, canal verificado, prueba de aislamiento/revocación y ruta de reversión; registrar la evidencia antes de ampliar.
