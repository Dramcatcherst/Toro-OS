# TORO Personal — índice privado de proyectos y enlace con Rumbo

**Estado:** PROPUESTA PREPARADA; no implementada ni activada  
**Fecha:** 2026-10-15  
**Plan General:** `docs/product/TORO_BRAIN_GENERAL_PLAN.md`  
**Ámbito:** Principal Mauricio → privado  
**Subsistemas:** TORO Personal + TORO Projects + TORO Tools  
**Clasificación:** TARGET / NEXT condicionado  
**Autoridades:** GitHub para contrato; Supabase para estado estructurado; Rumbo para el viaje

## Decisión

Reutilizar el proyecto canónico `operations.projects.project_key = toro_personal_mauricio` únicamente como índice organizacional de alto nivel. Los proyectos personales, sus enlaces y sus estados privados vivirán en `user_vault.projects` y `user_vault.project_links`, aislados por `auth.uid()`.

Rumbo conserva la autoridad del itinerario, documentos, reservas, gastos y preparación del viaje. TORO guarda solo un puntero al registro de Rumbo y un resumen minimizado de estado; no copia pasaportes, visas, saldos bancarios, correos, localizadores ni archivos de viaje al portafolio empresarial.

No se guarda el inventario personal en Airtable `executive_portfolio`, `operations.projects`, un repositorio público ni `private.founder_profiles`.

## Evidencia actual

- Existe `operations.projects:toro_personal_mauricio`, pero sus políticas permiten lectura a roles empresariales privilegiados.
- `private.founder_profiles` también es contexto gobernado por la organización; el contrato de User Vault prohíbe usarlo como memoria personal genérica.
- En producción no existen todavía los esquemas `identity` ni `user_vault`.
- `identity.organization_memberships` sigue validado de forma aislada pero no aplicado.
- Rumbo tiene un viaje propiedad del usuario y funciona como sistema especialista; su conector actual permite añadir y registrar, pero no reemplazar, archivar ni eliminar itinerario/tareas/reservas.
- Airtable contiene el portafolio ejecutivo de TORO/Dreamcatcher, no un almacén privado por propietario.

## Modelo propuesto

### `user_vault.projects`

Una fila por proyecto privado del usuario. Guarda nombre, estado, prioridad, resumen, próxima acción, procedencia y referencias externas mínimas. No contiene documentos ni secretos.

### `user_vault.project_links`

Enlaces asociados al proyecto: aplicación, repositorio, viaje, documento, tablero o sitio. Los enlaces pueden ser HTTPS o URI interna aprobada. Cada fila hereda el mismo propietario que su proyecto.

### Fuente y copia permitida

| Dato | Autoridad | En TORO Personal |
| --- | --- | --- |
| Itinerario, reservas, documentos, gastos | Rumbo | Puntero + estado minimizado |
| Código y contratos | GitHub | Enlace al repositorio/PR |
| Archivo original | Dropbox/Library autorizada | Puntero; no duplicar bytes |
| Correo | Proveedor de correo | Evidencia resumida; no copiar hilo completo |
| Proyecto personal | User Vault | Registro canónico privado |
| Portafolio empresarial | `operations.projects` | Solo referencia agregada sin contenido privado |

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
- enlace/acción para abrir Rumbo si existe un destino privado verificable.

No persistir en el índice:

- números de pasaporte/visa;
- saldos de cuenta;
- correos completos;
- localizadores de vuelos/hoteles;
- URLs con tokens;
- archivos de identidad.

## Mejoras prioritarias de Rumbo

### P0

1. Modelo de ruta canónica con versiones y capacidad de reemplazar/archivar una versión anterior.
2. CRUD o upsert de itinerario, tareas y reservas; el modelo append-only crea contradicciones.
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
- panel: Hoy / Bloqueos / Próximos vencimientos / Variación de presupuesto / Documentos.

## Dependencias antes de producción

1. Revisión del contrato `TORO_IDENTITY_USER_VAULT_V1.md`.
2. Ruta aprobada para `identity.organization_memberships` y contexto personal.
3. Validación aislada de las tablas y políticas propuestas.
4. Pruebas negativas con dos usuarios sintéticos.
5. Decisión explícita de exponer o no `user_vault` por PostgREST.
6. Adaptador de servidor que no use claves privilegiadas en el navegador.
7. Revisión de privacidad del índice inicial.
8. Aplicación mediante migración revisada; no ejecutar directamente los borradores.

## Pruebas de aceptación

- usuario A no puede seleccionar, insertar, actualizar ni borrar filas de B;
- ADMIN/GERENCIA de una organización no puede leer proyectos personales;
- `anon` no tiene acceso;
- un enlace no puede cambiar de propietario;
- un enlace no puede apuntar a un proyecto de otro usuario;
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
