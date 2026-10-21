# TORO Portal — programa de consolidación Hoy · Agenda · Gestión

> **Para el ejecutor:** implementar por lotes con `superpowers:executing-plans`, inspección del head vigente y pruebas antes del código. Este documento es un programa subordinado, no otro Plan General ni un backlog nuevo. La continuación del propietario permite preparar esta secuencia; no acredita aprobación del código futuro, publicación ni migración de datos.

**Objetivo:** reducir decisiones, pantallas y saltos entre herramientas sin perder capacidades, acceso autorizado ni evidencia.
**Arquitectura:** tres entradas al mismo contexto y a los mismos objetos. Se conservan doce ordinales internos, seis familias visibles en Gestión y servicios compartidos; no se crea un repositorio de datos por vista.
**Tecnología observada:** Next.js 16.3.8, React 19.2.4, TypeScript, CSS Modules y Vitest 4.1.11 del repositorio existente. Sin dependencias nuevas por este programa.
**Especificación de origen:** `docs/product/TORO_USER_PORTAL_V1.md`, `docs/product/TORO_PORTAL_DESIGN_RULES.md` y la propuesta entregada `TORO_Estructura_Consolidada_Propuesta.md` (20/10/2026).
**Autoridad:** `docs/product/TORO_BRAIN_GENERAL_PLAN.md`, sección Human Experience; constitución y contextos vigentes.
**Carril:** PR #347, `design/toro-future-color-20261020`; lote B ejecutado sobre la base `708881d1d7337282b5c8dc3b3508f70c858b41fc`. No fusionar la PR documental #259 ni sustituir el build actual por inferencia. Revalidar propietario y head antes de publicar.
**Corte:** 21/10/2026, Costa Rica. Estado: LOTES A/B IMPLEMENTADOS Y PROBADOS EN CANDIDATO. Lote C, aceptación, merge y despliegue NO EJECUTADOS.

## 1. Hallazgos que cambian la implementación

1. `portal-workspace.tsx` utiliza hasta ocho pestañas en estado local; no son ocho aplicaciones o rutas independientes. Las entradas repetidas no prueban registros duplicados.
2. `model.ts` conserva los ordinales 0–11 y asigna destinos según contexto, permisos y capacidades. Para Personas documenta acceso a una guía y sesión propia de DreamTeam; no identidad unificada demostrada.
3. La página `src/app/portal/page.tsx` conserva la resolución de organización y un montaje identificado por usuario+organización. No eliminar ese reinicio al cambiar ámbito.
4. La PR #347 ya trabaja identidad visual, logo, color, densidad y retirada de controles engañosos. La nueva estructura debe extender ese candidato, no restaurar el diseño anterior. Las pruebas citadas por su descripción pertenecen a ese cambio; no verifican este programa.
5. En los componentes de Portal inspeccionados no se encontró una lectura de eventos de Calendar. Esto no acredita que no exista en otro módulo. Antes de presentar una agenda integrada, localizar su adaptador autorizado; un enlace no equivale a integración.
6. `toro-context.yaml` mantiene Cerebro como entrada transversal y el contrato de Portal conserva cinco accesos para empleados. Deben reconciliarse documentalmente con la presentación de tres entradas sin cambiar ordinales, políticas o capacidades. Esa reconciliación no está aplicada en main.

Fuentes observadas: `model.ts` blob `42c14c1f9fa7299eb56cf85add9c9800f68dec50`; `portal-workspace.tsx` de main `19f4acb9059909a496e9e16bc4474e65d9b4fcc0`; `portal/page.tsx` en candidato `e6d34f8f8354170f43dbf8e9ee4fad22a746ba4e`; contrato Portal `bd058e222d19de5855632785d60fe6a4166033a2`. Son lecturas de código/documentos, no una sesión de producción auditada.

## 2. Restricciones globales

- Una identidad, contexto explícito y autorización de servidor antes de obtener datos. Ocultar elementos no es seguridad.
- Ninguna vista posee tareas, pagos o calendario propios. Reutilizar objetos y referencias actuales, preservando naturaleza y procedencia.
- Mantener todas las rutas y enlaces autorizados existentes: `/portal`, `/my-toro`, `/brain`, `/my-toro/herramientas`, focos y anclas vigentes. No inventar rutas de pago, calendario ni subida de documentos.
- Mantener logo toro-chip, libertad cromática, contraste, legibilidad y densidad del candidato #347. Tres entradas no implican tres tarjetas altas.
- No nuevo login, tablas, RPC, permisos, proveedores, paquetes, flags productivos, calendarios, agentes ni automatizaciones por esta reorganización.
- Kross y Alegra mantienen sus autoridades. API pagada de Kross pausada. Nada de pagos, asientos, publicación de turnos o cambios de disponibilidad.
- Fuente desconocida o caducada no se representa como cero. Un estado En preparación nunca se transforma en Operativo al reagruparlo.
- Cambio de contexto limpia selección, detalles, conteos y borradores del ámbito anterior. No conservar datos privados en favoritos globales.
- Objetivos móviles: controles táctiles de 44px como mínimo, acción principal 48px, texto auxiliar mínimo 12px, sin recortar importes/estados. Medir 320/360/390/412px, escritorio1440px y pantalla amplia, zoom200%, teclado y movimiento reducido.
- Respuestas múltiples numeradas y enlaces reales con destino descrito. Elegir un número o abrir un enlace no autoriza una transacción.

## 3. Arquitectura visible y conservación funcional

| Superficie / familia | Ordinales primarios preservados | Presentación |
| --- | --- | --- |
| Hoy | 1 | Prioridades y bloqueos autorizados; accesos al trabajo real, no otra lista editable. |
| Agenda | Ninguno nuevo | Una vista temporal; filtros/lista/día/semana/mes son controles, no cuatro menús o calendarios. |
| Clientes y ventas | 4 | Reservas, clientes, cotizaciones y grupos. |
| Operación y recursos | 5, 9 | Operación física, espacios, activos, compras e inventario. |
| Equipo | 6 | Turnos, asistencia, solicitudes y planillas con sus permisos. |
| Dinero y cumplimiento | 2, 8 | Finanzas y expedientes relacionados; riesgos no financieros siguen accesibles desde la ficha afectada. |
| Contenido y crecimiento | 3, 7 | Producción, versiones, canales y resultados. |
| Proyectos | 10 | Objetivos y dependencias; no otra cola de tareas. |
| Mapa / Cerebro compartido | 0 | Acceso permanente a `/brain`; mismos objetos y contexto. |
| Configuración y salud autorizadas | 11 | Herramientas técnicas; una incidencia material puede aparecer en Hoy sin otorgar privilegios. |

Los seis grupos son de navegación, no nuevas entidades de negocio. Todos los módulos de entrada se conservan una vez en su destino primario. Cualquier ordinal desconocido recibido en el futuro conserva su ficha autorizada en un bloque de compatibilidad dentro de Gestión: no se elimina silenciosamente.

### Accesos transitorios que no deben desaparecer

- Conteo manual CRC/USD: Dinero, claramente no contable, preservando componentes y borrador dentro del mismo contexto.
- Plantillas/respuestas: Contenido y crecimiento, también accesibles desde el caso pertinente; sin escritor nuevo.
- Catálogo de enlaces y favoritos: sección compacta Accesos en Gestión y favoritos contextuales en Hoy mientras sean caminos necesarios. No tratar todos los enlaces operativos como herramientas administrativas.
- Reportes: acceso desde el área y búsqueda cuando la búsqueda exista; mantener destino antiguo durante transición. No hacer depender un informe de una búsqueda todavía no implementada.
- Google Home, motor de reservas y guías actuales: preservar solo para el rol/ámbito que ya los recibe. No reinterpretarlos como control conectado.

## 4. Qué no se hará todavía

No reconstruir el PMS, correo, calendario ni contabilidad. No migrar Dropbox a Drive, retirar Airtable o cerrar DreamTeam. No desarrollar todas las 200 mejoras de Google ni convertirlas en nuevos módulos. El catálogo G001–G200 se conserva como requisitos; su correspondencia primaria en la propuesta cubre los200IDs, no prueba que estén implementados.

La primera consolidación es presentación y conservación funcional. La agenda nativa de datos, ficha transversal, búsqueda real y sesión compartida de DreamTeam requieren evidencia y contratos propios antes de activarse. No disimular una dependencia con datos inventados o botones sin efecto.

## 5. Foco de revisión

1. Cambiar de organización mientras una respuesta antigua llega: no mostrar datos, favoritos o formularios del ámbito anterior.
2. Familias con capacidades distintas por usuario: no convertir enlaces deshabilitados en acciones ni eliminar la explicación indispensable de un bloqueo.
3. Selección, filtros y borradores al cambiar vista: preservar dentro del ámbito; limpiar al cambiar identidad/contexto.
4. Nombres largos, monedas, cifras, zoom y errores: no recortar información para cumplir densidad ni esconder alertas materiales.
5. Agenda sin fuente, fuente parcial o vencimiento reprogramado: no mostrar cero eventos, asistencia efectiva o pago conciliado por inferencia; separar cita/turno/vencimiento/control.

Cada punto debe tener prueba en el lote propietario; sin prueba queda pendiente, no cubierto por CI histórico.

## 6. Programa de implementación de la primera etapa

### Lote A — correspondencia y contrato, sin mover datos

**Archivos:** crear `src/features/portal/structure.ts` y `structure.test.ts`; consumir `model.ts` sin cambiar `resolvePortalModules` ni su autorización. Reconciliar secciones pertinentes del Plan General, `toro-context.yaml`, `TORO_USER_PORTAL_V1.md` y contrato de Cerebro en el mismo carril antes de publicar.

**Interfaz propuesta:** `resolvePortalStructure(modules: readonly PortalModule[]): PortalStructure`; resultado con `today`, `families`, `map`, `system` y `unmapped`. Cada familia contiene clave, etiqueta y referencias a módulos recibidos. No lee bases, no fabrica módulos, no altera href/action/status/note.

Contrato de tipo a implementar, no código productivo de esta entrega:
```ts
type FamilyKey = "clients" | "operations" | "team" | "money" | "growth" | "projects";
type PortalStructure = {
  today: readonly PortalModule[];
  families: readonly { key: FamilyKey; label: string; modules: readonly PortalModule[] }[];
  map: readonly PortalModule[];
  system: readonly PortalModule[];
  unmapped: readonly PortalModule[];
};
```
Orden de familias: clients, operations, team, money, growth, projects. Omitir familias sin módulos recibidos. En la prueba de conservación, aplanar todos los destinos y comprobar `expect(sortedOrdinals).toEqual([0,1,2,3,4,5,6,7,8,9,10,11])`; para cada objeto comprobar `expect(mappedModule).toBe(inputModule)`. La entrada vacía devuelve todos los arreglos vacíos. El ordinal99 de una fixture permanece una vez en unmapped, sin inventar capacidades.

- [x] Escribir primero `preserves_all_ordinals_once`, `preserves_module_identity_and_status`, `empty_input_is_empty`, `preserves_unknown_ordinal` y `does_not_mutate_input`.
- [x] Ejecutar `npx vitest run src/features/portal/structure.test.ts`; se observó el fallo esperado por implementación ausente, no por infraestructura.
- [x] Implementar únicamente la correspondencia de la sección3. La fixture exige el conjunto0–11 completo y conserva módulos futuros en `unmapped`.
- [x] Reejecutar pruebas focales y `npm run test:hotel-tools`; 5 pruebas focales y 184 pruebas del carril Portal aprobadas. `test:portal-auth` aprobó 128 pruebas.
- [x] Revisar el diff documental: dirección de presentación continúa TARGET y runtime visible continúa CURRENT sin cambios; un solo Plan General. Cambio pequeño y reversible en el carril #347.

**Terminado:** mapa puro probado y contrato coherente. No significa navegación desplegada, permisos ampliados ni herramientas retiradas.

### Lote B — tres entradas y acceso a todas las funciones existentes

**Archivos:** modificar `src/features/portal/portal-workspace.tsx` y `portal.module.css`; añadir `portal-workspace.test.tsx` (no se localizó ese archivo en el candidato consultado). Reutilizar `module-card.tsx`, `portal-cash-tools.tsx`, `portal-response-tools.tsx`, `portal-kross-widget.tsx`, `PortalToolCatalogue` y `PortalToolLinks`.

**Interfaz:** mantener los props actuales `modules`, `links`, `catalogueItems`, `catalogueMode`, `hotelAllowed`, `attention`. Consumir `resolvePortalStructure` del loteA. No añadir una consulta desde el cliente ni retirar la clave usuario+organización de la página.

- [x] Escribir pruebas de tres pestañas llamadas exactamente Hoy/Agenda/Gestión, navegación ArrowLeft/ArrowRight/Home/End, foco y panel activo.
- [x] Añadir pruebas para las seis familias, acceso al Mapa, conservación del conteo manual/plantillas/catálogo/favoritos y todos los destinos de la fixture; denegados no se habilitan.
- [x] Ejecutar pruebas focales y comprobar el fallo esperado antes del cambio: cinco casos fallaron por la interfaz anterior y pasaron tras la implementación.
- [x] Reorganizar la presentación, no los cálculos ni los registros. Hoy no repite todos los paneles; Gestión abre grupos bajos con detalle progresivo. Mantener estado de formularios dentro del contexto y reinicio al cambiarlo.
- [x] Agenda: inspeccionar primero catálogo/adapter existente. Sin fuente autorizada, mostrar estado compacto "Agenda integrada no disponible en este contexto" y SOLO un enlace de origen si ya está autorizado/verificado. No crear un calendario ni eventos ficticios ni prometer búsqueda de eventos. El acceso de contingencia no cuenta como agenda integrada.
- [x] Probar `source_unavailable_is_not_zero`, `context_change_clears_state`, `same_scope_preserves_draft`, `restricted_context_hides_hotel_data` y `future_module_is_not_dropped` con montaje del consumidor real y fixtures sintéticas.
- [x] Ejecutar `npm run test:hotel-tools`, `npm run test:portal-auth`, `npm run lint`, `npm run build`, `git diff --check`; 203 pruebas Portal, 128 de autorización, lint sin errores y build de 52 páginas aprobaron. Persisten dos advertencias lint preexistentes fuera del lote.

**Terminado:** navegación funcional y conservación de accesos en candidato probado. Agenda integrada, WhatsApp y privacidad E2E no se consideran aprobados por tests de componentes.

### Lote C — aceptación de los recorridos y publicación controlada

**Archivos:** extender pruebas existentes `src/app/portal/page.test.tsx` y `src/features/portal/model.test.ts` según los cambios de A/B. Evidencia sanitizada en esta PR; no datos personales ni un libro de resultados paralelo.

- [ ] Definir baseline con mismo rol, ámbito, dataset y viewport; registrar pasos, saltos externos, desplazamiento y errores antes/después. Metas no son resultados.
- [ ] Probar tres recorridos: Caro abre documento y reporta evidencia sin pago; Recepción consulta llegada/preparación sin alterar reserva; empleado consulta turno publicado/solicitud sin ver salarios ajenos. Si falta conexión o identidad, marcar ese recorrido bloqueado, no sustituirlo por una demo y declararlo completo.
- [ ] Comprobar anchos/zoom/teclado indicados en restricciones y enlaces antiguos. Las áreas se leen compactas; las acciones autorizadas y advertencias siguen accesibles.
- [ ] Leer preview del SHA exacto, contrastar permisos con sesión autorizada y revisión independiente cuando esté disponible. Auto-QA no se llama revisión independiente.
- [ ] Solicitar aceptación del recorrido y autorización específica de publicación; solo entonces integrar conforme a AGENTS, verificar producción y preservar despliegue de reversión. No fusionar ramas antiguas sobre trabajo concurrente.

**Terminado:** cambio aceptado y publicado con comprobación real. Retiro de herramientas requiere una etapa posterior; este lote no cancela servicios.

## 7. Después de la primera etapa: absorción, no más menús

El orden propuesto es: ficha contextual con fuentes existentes → agenda leída y filtrada de verdad → continuidad de identidad DreamTeam → absorción gradual de sus vistas y lógica → retiro individual de duplicaciones demostradas. Cada paso necesita su aceptación y pruebas; no se abren simultáneamente nuevos frentes ni se usa esta lista como cola automática.

Una herramienta solo es candidata a retirarse tras: función única inventariada, consumidores identificados, reemplazo aceptado, permisos/historial/exportación preservados, restauración y reversión probadas y autorización de retiro. Sin esa evidencia, se conserva como contingencia con su origen visible.

## 8. Verificación de esta entrega y siguiente unidad

**Hecho hasta este corte:** la interfaz consume `resolvePortalStructure` y presenta exactamente Hoy/Agenda/Gestión. Los doce ordinales aparecen una vez en su destino primario; seis familias, Mapa, Sistemas y módulos futuros permanecen accesibles. Conteo CRC/USD, plantillas, catálogo, favoritos, Kross, Google Home y rutas vigentes se conservan bajo el mismo permiso de entrada. Agenda declara la fuente no conectada y no fabrica eventos. Nueve pruebas focales, 203 del carril Portal, 128 de autorización, lint sin errores y build de 52 páginas aprobaron.

**Siguiente unidad preparada:** lote C: recorridos autenticados y QA visual del SHA exacto en preview, con baseline comparable. Aceptación, merge y publicación siguen sujetos a autorización separada.

**Reversión de esta entrega documental:** revertir solo el commit de este documento; no tocar commits visuales previos. Las posibles reversiones de A/B/C se definirán con sus SHAs reales al ejecutarlos.
