# TORO — Estructura del portafolio y mapa de conexiones

Estado: contrato de organización y proyección subordinado al Plan General, sección 23.
Alcance: metadatos de portafolio, proyectos, alias, recursos digitales y evidencias.
No activa negocios, integraciones, automatizaciones, permisos ni publicaciones.

## 1. Resultado

Cada iniciativa tiene una casa administrativa y puede tener varias conexiones funcionales. El Portal muestra una sola ficha reconocible con sus versiones, documentos, tareas, builds y relaciones. Las fuentes conservan sus propias identidades y autoridad.

Se reutilizan operations.projects, operations.knowledge_items, la taxonomía toro_brain_taxonomy_v1 y los directorios existentes. El mapa es un índice derivado y versionado; no reemplaza el registro de proyectos ni crea otra cola de trabajo, grafo de permisos o Plan General.

## 2. Cinco vistas del mismo portafolio

| Vista | Incluye | Regla |
| --- | --- | --- |
| TORO | Producto, capacidades comunes, conectores y ejecución | Las superficies y herramientas no se convierten en productos independientes |
| Dreamcatcher | Negocio y módulos operativos/comerciales existentes | Conserva PMS, banco y contabilidad como autoridades de dominio |
| Patrimonio | Inmuebles, administración y asuntos corporativos | No confundir sociedad, inmueble, proyecto, deuda y operación |
| Productos | Productos separados, prototipos e incubaciones | Un sitio publicado no activa su negocio |
| Personal | Iniciativas y referencias privadas del propietario | Sin herencia de permisos de una organización empresarial |

Son vistas de navegación; no cinco filas raíz nuevas. Por clasificar es un filtro transversal. Tipo, ámbito, situación, prioridad y evidencia son dimensiones distintas.

## 3. Identidad y jerarquía existentes

operations.projects conserva project_key, project_level, parent_project_key, canonical_module_key y merged_into_project_key. Los IDs y estados existentes se mantienen. La categoría visual no modifica active, status, prioridad, dueño o pertenencia organizacional.

Cada ficha del inventario se registra como anotación referenciada a un proyecto existente o como referencia pendiente de clasificación. No se insertan proyectos por cada ficha, repositorio, base, app, rama o build.

Las identidades absorbidas conservan nombre, clave, origen, fecha y receptor. El buscador encuentra el nombre antiguo y abre el destino con su historia. Absorbido no equivale a implementado ni a una autorización de borrado.

El conocimiento personal no se almacena dentro de un ámbito empresarial por marcarlo privado. El índice completo del propietario reside en su organización personal existente; cualquier resumen empresarial contiene únicamente los metadatos pertinentes y permitidos.

## 4. Recursos y builds

| Objeto | Identidad | Qué acredita |
| --- | --- | --- |
| Repositorio | Proveedor + owner/repo | Código, documentación e historia |
| Configuración de hosting | Proveedor + project ID | Contenedor de despliegues y configuración |
| Build/despliegue | Proveedor + deployment ID | Artefacto, estado, entorno, fecha y SHA cuando esté disponible |
| Versión de Site | Site ID + número/ID de versión | Fuente guardada vinculable al deployment |
| Dominio | Hostname exacto | Ruta pública; requiere resolución específica actual |
| Documento/evidencia | ID/version/ref de origen | Respaldo del hecho o decisión concreta |

Cada recurso declara count_as_business_project=false. No sumar configuraciones, deployments y proyectos de negocio. No tratar el campo latest como versión servida: conservar por separado latest_observed, served_production y rollback_candidate. Un deployment READY acredita su compilación/despliegue según el proveedor, no adopción, cobertura funcional ni verdad comercial.

La asociación por metadatos Git o resolución de hostname es observada. La asociación por nombre se marca inferida. Sin fuente: por clasificar. get_project.domains puede conservar aliases históricos; la autoridad del dominio requiere listado específico y resolución del hostname al mismo corte.

La cobertura declara qué se recorrió y sus límites: último deployment por configuración, producción servida adicional cuando se consultó y última versión/despliegue de Site. Nunca llamarlo todo el historial de builds.

## 5. Relaciones y procedencia

Reusar el vocabulario de toro_brain_taxonomy_v1:
belongs_to, uses, depends_on, affects, managed_by, executed_by, approved_by, connected_via, sourced_from, evidenced_by, measured_by y governed_by.

| Relación | Aplicación |
| --- | --- |
| belongs_to | Jerarquía administrativa o referencia de inventario a su módulo, con certeza explícita |
| uses | Proyecto utiliza un sistema, recurso o capacidad |
| depends_on | Prerrequisito comprobado; no generar bloqueos por proximidad temática |
| affects | Relación funcional sin propiedad ni fusión |
| sourced_from | Procedencia del recurso o dato |
| evidenced_by | Resultado o configuración respaldados por artefacto/recibo |
| governed_by | Regla o contrato vigente aplicable |

No introducir same_as por semejanza de nombre. Las fusiones usan merged_into_project_key; cualquier vocabulario adicional necesita extensión expresa del contrato.

Cada arista contiene ID estable, origen, destino, tipo, fuente, fecha, validation_state y grants_access=false. Si un extremo no está autorizado, el lector elimina la relación y no revela título, conteos o identificadores del extremo oculto.

El contrato de nodo conserva canonical_id, tenant_scope, brain_path, relations, source_authority, provenance, confidence, privacy, owner_agent, human_owner, capabilities, workflows, metrics, freshness, risk, action_ceiling, evidence y feedback. Campos desconocidos permanecen null/lista vacía con su explicación; no se inventan responsables, métricas o pruebas.

## 6. Consolidación sin pérdida

1. Identificar ambos registros y su relación real.
2. Distinguir mismo objeto, versión, capacidad compartida y simple colaboración.
3. Elegir receptor existente con autoridad y permisos compatibles.
4. Comparar información única, tareas, documentos, enlaces, usuarios y consumidores.
5. Conservar claves y alias anteriores, procedencia y decisiones.
6. Vincular primero; migrar solo el alcance probado y aprobado.
7. Verificar recuperación y consultas por nombre antiguo/nuevo.
8. Retirar un recurso solo tras revisar dependencias y autorización específica.

La organización de este lote es aditiva: ninguna nueva clasificación ejecuta migración, baja, cambio de acceso, reactivación o cierre. Compartir una capacidad no mezcla contabilidades, clientes, documentos privados o estados de negocio.

## 7. Almacenamiento y autoridades

El registro completo de metadatos usa operations.knowledge_items, clave toro_portfolio_relationship_map_v1, dentro del ámbito personal existente del propietario. No se publica en este repositorio el payload privado.

El índice empresarial se incorpora al registro existente portfolio_scope_alignment_2026_09_v1, en una propiedad JSON subordinada y sin datos personales. No es una réplica del mapa completo.

El directorio de enlaces conserva su identidad. No se crea una segunda lista manual; una proyección obtiene los enlaces revisados del directorio o de referencias autorizadas del recurso. Fuente encontrada no significa destino operativo aprobado.

Las tablas de source_asset_registry siguen describiendo fuentes/tablas. Los builds no se fuerzan dentro de ese esquema ni de assets.physical_assets.

Fuentes: proyectos y estado en Supabase; código/contratos en GitHub; despliegues en proveedor; originales en custodia documental; transacciones en sus sistemas de dominio.

## 8. Portal existente

| Superficie | Presentación |
| --- | --- |
| 10 Proyectos | Lista compacta, paginación y filtros por vista/tipo/situación; detalle al seleccionar |
| 00 Cerebro | Padre, hijos y vecinos autorizados de la selección; mismo índice |
| 11 Sistemas | Repos, hosting, builds, dominios y dependencias del proyecto seleccionado |
| Herramientas | Enlaces revisados existentes, sin directorio paralelo |
| Hoy/Atención | Solo excepciones o decisiones materiales del mismo trabajo |

Primero lista completa autorizada y detalle. El grafo no intenta mostrar todo a la vez. Mantener filtros/selección al pasar lista–mapa. Móvil: filas compactas y detalle expandible. Desktop: lista y detalle. No rediseño total ni nuevo portal.

Ficha mínima: nombre, tipo, situación, objetivo, siguiente acción y responsable si se conoce. Desplegables: conexiones, builds, evidencias y antecedentes. Separar Abrir aplicación, Ver código y Ver build.

La visualización no vuelve activas las incubadoras ni presenta enlaces como integraciones. Un estado parcial o desconocido permanece visible.

## 9. Gate de lectura y privacidad

visibility/audience son metadata; no sustituyen RLS o autorización por objeto. Una relación nunca concede acceso.

El scope personal inactivo y sin membresía no se abre por ser administrador del hotel. Este lote no activa organizaciones ni modifica membresías, roles, RPC, grants o políticas.

Un lector posterior debe verificar actor autenticado, contexto vigente, membresía exacta activa, permiso de objeto y ambos extremos de cada relación. Revalidar contexto tras await. Sin autorización: unavailable/denegado, sin fallback a otro ámbito.

El contenido completo no se envía al navegador para filtrarlo allí. Tampoco se muestra cuántos objetos privados se ocultaron.

## 10. CURRENT / TARGET / NEXT / FUTURE

CURRENT:
- existen registros de proyectos, taxonomía y superficies Portal;
- mapa de metadatos e índice empresarial tienen recibos separados de guardado;
- el lector Brain actual es parcial y los contratos RPC existentes son estrictos;
- un mapa guardado no acredita una pantalla implementada.

TARGET:
- lista completa permitida, alias recuperables, conexiones verificadas y builds subordinados en las superficies existentes.

NEXT:
1. Proyector puro de filas ya autorizadas, DTO estricto y pruebas de conservación, ciclos, alias y endpoints ocultos.
2. Reader server-only/RPC aditiva con pruebas positivas y negativas, sin romper portal-read-v1.
3. Proyección en 10/00/11 usando componentes actuales y aceptación móvil/escritorio.
4. Verificación del mismo índice desde cada canal autorizado.

FUTURE:
- actualización incremental por eventos del proveedor, reutilizando scheduler/recibos existentes si se justifica;
- retiro gradual tras paridad/recuperación y gates específicos.

No se añade automatización por documentar este contrato. No se duplica el trabajo de los escritores existentes de Portal, Personal o consolidación de infraestructura.

## 11. Validación y reversión

scripts/validate-portfolio-map.mjs valida el contrato estructural antes de guardar: IDs únicos, referencias preservadas, extremos existentes, vocabulario, fuentes/fecha, ciclos administrativos, recursos que no cuentan como proyectos y enlaces seguros.

No autentica usuarios, no evalúa RLS y no sustituye la aceptación del lector. Las pruebas usan datos sintéticos. El payload privado se valida localmente y permanece fuera de Git.

Reversión del mapa: restaurar únicamente la propiedad JSON modificada o retirar la ficha nueva con guardia de huella/versión y referencia de procedencia; conservar fuentes y proyectos. Nunca restaurar un registro completo encima de cambios concurrentes.

Reversión del código/documentación: revert selectivo del PR. La incorporación documental no requiere despliegue de interfaz; cualquier release futuro tiene su propia evidencia.
