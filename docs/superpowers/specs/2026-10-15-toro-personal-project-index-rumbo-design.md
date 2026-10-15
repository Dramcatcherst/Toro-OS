# TORO Personal — índice privado de proyectos y enlace con Rumbo

**Estado:** PROPUESTA PREPARADA; no implementada ni activada  
**Fecha:** 2026-10-15  
**Plan General:** `docs/product/TORO_BRAIN_GENERAL_PLAN.md`  
**Ámbito:** Principal Mauricio → privado  
**Subsistemas:** TORO Personal + TORO Projects + TORO Tools  
**Clasificación:** TARGET / NEXT condicionado  
**Autoridades:** ChatGPT Work como superficie primaria; Rumbo como autoridad del viaje; Supabase como base estructurada canónica; GitHub como contrato y código

## Decisión

Reutilizar el proyecto canónico `operations.projects.project_key = toro_personal_mauricio` únicamente como índice organizacional de alto nivel. Los proyectos personales, sus enlaces y sus estados privados vivirán en `user_vault.projects` y `user_vault.project_links`, aislados por `auth.uid()`.

Rumbo conserva la autoridad del itinerario, documentos, reservas, gastos y preparación del viaje. TORO guarda solo un puntero al registro de Rumbo y un resumen minimizado de estado; no copia pasaportes, visas, saldos bancarios, correos, localizadores ni archivos de viaje al portafolio empresarial.

No se guarda el inventario personal en Airtable `executive_portfolio`, `operations.projects`, un repositorio público ni `private.founder_profiles`.

**Un solo lugar** significa una experiencia unificada y una única base Supabase, no una sola tabla sin fronteras. El catálogo organizacional existente continúa en `operations.knowledge_items`; el inventario privado vive en `user_vault`. Un resolver con permisos puede proyectar ambos sin duplicarlos ni ampliar acceso.

## Evidencia actual

- Existe `operations.projects:toro_personal_mauricio`, pero sus políticas permiten lectura a roles empresariales privilegiados.
- `private.founder_profiles` también es contexto gobernado por la organización; el contrato de User Vault prohíbe usarlo como memoria personal genérica.
- En producción existe `identity.organization_memberships` con RLS y políticas de lectura propia/privilegiada; la verificación del 15-oct-2026 no observó políticas de escritura.
- En producción todavía no existe el esquema `user_vault`.
- Rumbo tiene un viaje propiedad del usuario y funciona como sistema especialista; su conector actual permite añadir y registrar, pero no reemplazar, archivar ni eliminar itinerario/tareas/reservas.
- Airtable contiene el portafolio ejecutivo de TORO/Dreamcatcher, no un almacén privado por propietario.
- Supabase ya contiene el directorio organizacional `dreamcatcher_system_database_directory_v1` en `operations.knowledge_items`: 244 entradas distintas al 15-oct-2026, con una proyección existente mediante `public.dreamcatcher_tool_catalog_v1()`. No se crea un segundo catálogo organizacional.
- El conector de Rumbo está disponible como superficie de ChatGPT Work; no se encontró en la integración actual una URL pública/deep link verificada ni acceso a su repositorio fuente.

## Modelo propuesto

### `user_vault.projects`

Una fila por proyecto privado del usuario. Guarda nombre, estado, prioridad, resumen, próxima acción, procedencia y referencias externas mínimas. No contiene documentos ni secretos.

### `user_vault.project_links`

Enlaces tipados asociados al proyecto: `live_app`, `preview`, `repository`, `trip`, `document`, `dashboard`, `connector`, `admin` u `other`. Cada proyecto puede marcar un único enlace activo como `is_primary_view`: se prioriza la experiencia que permite **ver o usar** el proyecto; GitHub permanece como enlace técnico separado. Cada fila registra proveedor, modo de apertura, verificación y hereda el mismo propietario que su proyecto.

### Fuente y copia permitida

| Dato | Autoridad | En TORO Personal |
| --- | --- | --- |
| Itinerario, reservas, documentos, gastos | Rumbo | Puntero + estado minimizado |
| Código y contratos | GitHub | Enlace al repositorio/PR |
| Archivo original | Dropbox/Library autorizada | Puntero; no duplicar bytes |
| Correo | Proveedor de correo | Evidencia resumida; no copiar hilo completo |
| Proyecto personal | User Vault | Registro canónico privado |
| Portafolio empresarial | `operations.projects` | Solo referencia agregada sin contenido privado |

## Directorio unificado sin duplicación

La experiencia de `/my-toro/projects` consulta un resolver sensible a permisos:

1. enlaces organizacionales permitidos desde el directorio existente en `operations.knowledge_items`;
2. enlaces privados del propietario desde `user_vault.project_links`;
3. estado vivo del viaje desde Rumbo cuando el vínculo está disponible.

El resolver devuelve un formato común, pero conserva fuente, ámbito, sensibilidad y autoridad. Nunca materializa las 244 entradas organizacionales dentro de `user_vault`. Para cada proyecto ordena enlaces así: `is_primary_view` verificado, aplicación en producción, preview autorizado, dashboard/viaje y finalmente repositorio/documentación. Los enlaces rotos o pendientes no son primarios.

## Candidatos de enlace de vista verificados

Lectura de Vercel del 15-oct-2026; esto es inventario para reconciliar con el directorio canónico, no una siembra de producción:

| Proyecto | Vista preferida candidata | Estado observado | Tratamiento |
| --- | --- | --- | --- |
| TORO | `https://toro-os-five.vercel.app/` | deployment de producción READY | `live_app`, primaria tras health check |
| DreamTeam | `https://dream-team-public.vercel.app/dreamteam/ingresar` | deployment de producción READY | `live_app`, separar de repositorio |
| RicoSky | `https://ricosky.vercel.app/stays/property-dreamcatcher-alpha` | deployment READY; target no marcado producción | `preview` hasta validar ruta pública |
| AI for Dreamers | `https://ai-for-dreamers.vercel.app/` | deployment READY; target no marcado producción | `preview` hasta validar producto vigente |
| Dreamcatcher Hotel | `https://dreamcatcherhotel.com/` | deployment de producción READY y dominio canónico | `live_app`, primaria |

Rumbo no aparece como proyecto Vercel ni tiene deep link público verificado. Su acceso primario sigue siendo `@Rumbo` en ChatGPT Work hasta que el creador publique un destino estable.

## Inventario inicial

El inventario real debe sembrarse después de verificar RLS y una sesión del propietario. No se versionan nombres, URLs privadas ni IDs de conectores en este repositorio público.

Categorías previstas:

1. viaje y experiencias, con Rumbo como autoridad;
2. productos y experimentos personales;
3. repositorios propios;
4. proyectos relacionados con TORO, preservando su clasificación canónica;
5. aliases históricos que apuntan al proyecto vigente, sin crear duplicados.

## Proyección en Portal

Ruta objetivo: `/my-toro/projects`.

Cada tarjeta muestra:

- nombre;
- estado: NOW / NEXT / HOLD / ARCHIVED;
- prioridad;
- próxima acción;
- fuente y frescura;
- enlaces permitidos;
- etiqueta visible `Privado`.

Reglas:

- `operations.projects` puede mostrar que existe TORO Personal, pero no sus filas;
- la respuesta de servidor filtra por usuario antes de renderizar;
- no hay agregación a la organización por defecto;
- abrir un enlace no otorga permisos ni confirma salud del destino;
- el viaje muestra bloqueos y fechas desde Rumbo, no desde una copia manual;
- pasaportes, visas, saldos y localizadores no aparecen en el índice general.

## Integración Rumbo

El adaptador debe resolver:

`usuario autenticado → proyecto privado → vínculo Rumbo → lectura acotada → estado minimizado`

Estado minimizado permitido:

- nombre y fechas del viaje;
- países;
- presupuesto objetivo y variación agregada;
- número de bloqueos;
- próxima fecha límite;
- última sincronización;
- enlace/acción para abrir Rumbo si existe un destino privado verificable. Si solo existe la integración de ChatGPT Work, usar una acción del conector y no inventar una URL.

No persistir en el índice:

- números de pasaporte/visa;
- saldos de cuenta;
- correos completos;
- localizadores de vuelos/hoteles;
- URLs con tokens;
- archivos de identidad.

## ChatGPT Work como entrada estándar

La interacción primaria será `@Rumbo` dentro de ChatGPT Work. El plugin combina el procedimiento de trabajo con las herramientas MCP de datos vivos; TORO Personal mantiene el índice y los permisos. Una UI MCP opcional puede renderizar el panel de viaje sin crear otra autoridad.

Flujo objetivo:

`ChatGPT Work → @Rumbo → herramientas MCP → estado del viaje en Rumbo → resumen minimizado en TORO Personal`

Para completar la integración futura, el propietario del plugin debe exponer el repositorio o editor del servidor Rumbo. El conector actual permite operar el viaje, pero no permite desde esta superficie añadir herramientas nuevas ni modificar su UI.

## Mejoras prioritarias de Rumbo

### P0

1. Modelo de ruta canónica con versiones y capacidad de reemplazar/archivar una versión anterior.
2. CRUD, upsert y archivo de itinerario, tareas y reservas; el modelo append-only crea contradicciones.
3. Estados tipados para reservas: idea / hold / confirmada / pagada / cancelada / vencida.
4. `entryCases` por viajero y país con fuente, fecha de consulta, vigencia y faltantes.
5. Estados documentales separados: cargado / revisado / enviado / pagado / aprobado / rechazado / vencido.
6. Presupuesto conectado a reservas y gastos para evitar doble conteo.
7. Todos los huéspedes en cada reserva, no solo el titular.
8. Resumen de preparación derivado de estados reales, no del número total de fichas.

### P1

- adjuntar evidencia de correo sin secretos;
- alertas de visa/cancelación;
- modo standby con escenarios;
- detección de duplicados y archivo de viajes alternativos;
- auditoría de cambios y frescura;
- panel: Hoy / Bloqueos / Próximos vencimientos / Variación de presupuesto / Documentos;
- herramientas MCP de lectura y escritura con recibo/readback, y UI opcional embebida para el panel;
- identificadores estables y enlaces privados verificables para abrir el viaje desde el índice.

## Dependencias antes de producción

1. Revisión del contrato `TORO_IDENTITY_USER_VAULT_V1.md`.
2. Verificar la cobertura, escritura autorizada y uso real de `identity.organization_memberships`, más el resolver de contexto personal.
3. Validación aislada de las tablas y políticas propuestas.
4. Pruebas negativas con dos usuarios sintéticos.
5. Decisión explícita de exponer o no `user_vault` por PostgREST.
6. Adaptador de servidor que no use claves privilegiadas en el navegador.
7. Revisión de privacidad del índice inicial.
8. Aplicación mediante migración revisada; no ejecutar directamente los borradores.
9. Acceso al repositorio/editor de Rumbo para implementar CRUD/upsert/archive, `entryCases`, readiness derivado y la UI MCP.
10. Resolver de enlaces unificado con pruebas de ámbito: organización vs. propietario.

## Pruebas de aceptación

- usuario A no puede seleccionar, insertar, actualizar ni borrar filas de B;
- ADMIN/GERENCIA de una organización no puede leer proyectos personales;
- `anon` no tiene acceso;
- un enlace no puede cambiar de propietario;
- un enlace no puede apuntar a un proyecto de otro usuario;
- solo existe un `is_primary_view` activo por proyecto y propietario;
- GitHub no desplaza una URL de vista verificada cuando ambas existen;
- el resolver no duplica el catálogo organizacional dentro de `user_vault`;
- URI inseguras `javascript:`, `data:` o credenciales embebidas son rechazadas;
- una lectura de TORO Personal no amplía permisos del destino;
- la desconexión de Rumbo conserva el proyecto y muestra estado `DEGRADED`;
- el índice no contiene datos migratorios o bancarios;
- la baja organizacional no borra el contenido personal.

## Verificación y reversión

Los SQL de esta rama viven únicamente en `supabase/drafts`. No se aplicaron a Supabase.

Verificar:

- tablas y restricciones;
- RLS habilitado y forzado;
- cuatro políticas por tabla;
- privilegios sin acceso `anon`;
- índices por `user_id`;
- pruebas cruzadas A/B;
- asesores de seguridad sin nuevos hallazgos.

Reversión preparada en un archivo separado y bloqueada si existen filas. Nunca usar `CASCADE`.
