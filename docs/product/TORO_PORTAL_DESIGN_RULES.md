# Reglas de diseño del Portal TORO

**Dirección vigente del propietario:** 20/10/2026, America/Costa_Rica.  
**Ámbito:** presentación del Portal existente y componentes compartidos; sección 23 Human Experience del Plan General único.  
**Estado de entrega:** directiva de diseño documentada en candidato de PR; concepto, código implementado, QA y publicación son estados independientes.

## 1. Decisión que sustituye las restricciones anteriores

Mauricio rechazó la dirección visual anterior y pidió una interfaz futurista, mucho más color desde la primera pantalla, el logo original toro con cerebro-chip, títulos e iconos mejor trabajados, menos texto de instrucciones y mayor aprovechamiento del tamaño de pantalla.

Quedan retiradas como reglas activas las prohibiciones de rosa, fucsia, magenta, violeta o morado; la obligación de usar una base casi monocromática azul; las asignaciones obligatorias de arena/marfil a paneles; y el máximo universal de 1440px. No hay colores vetados por gusto histórico. Las paletas y referencias visuales anteriores permanecen como historia en Git, no como restricciones acumulativas del nuevo diseño.

La libertad cromática NO elimina contraste, foco, legibilidad, accesibilidad, autoridad de datos ni preservación de los logos oficiales. No se recolorea el maestro de marca para adaptar la interfaz.

La petición de hacerlo diez veces mejor es una exigencia cualitativa, no un resultado medido. No afirmar 10x ni autoasignar 10/10 sin comparación y aceptación del propietario.

## 2. Un solo TORO y una sola publicación coordinada

Se conserva el Portal actual, los módulos 00–11 y las rutas compatibles. No crear otro producto, Brain, base, agente, sistema de tareas, plan o scheduler para este rediseño. Mi espacio sigue dentro de TORO y DreamTeam dentro de TORO People con sus permisos y sesión actuales.

Destino existente: `toro.dreamcatcherhotel.com`, proyecto Vercel `toro-pr11-preview` / `prj_nxerFw9ciNews6tUMAah3GAlAJzs`. No cambiar DNS, alias, proyecto o ramas de otros ejecutores por una decisión estética.

Antes de modificar frontend, identificar el candidato y responsable del build concurrente, leer su checkpoint y el delta de main; integrar solo el cambio revisado. No sobrescribir una rama ajena, promover un preview por estar READY ni sustituir producción por el concepto. La autorización de publicación conserva su gate independiente y el rollback verificado.

## 3. Logo original recuperado y verificado

- Maestro: `toro_logo_master_v1`.
- Ruta histórica declarada: `/TORO/Brand/01_Master/TORO_LOGO_MASTER_v1.png`.
- Bytes verificados: JPEG, 1536×1536; la extensión histórica `.png` no define el formato real.
- SHA-256 verificado sobre los bytes recuperados: `15a1b661a12cc020b905188e1638d001cc0a21d2a2f47beb4077843b478be747`.
- El archivo sí fue localizado y materializado desde Library en esta unidad. No repetir el bloqueo histórico de archivo no encontrado sin comprobar este antecedente.
- El candidato #347 ya incorpora los bytes exactos, sin recomprimir, como `public/brand/toro/toro-logo-master-v1.jpg`; esto no afirma aceptación visual, fusión ni publicación en producción.

Usar el toro azul con cuernos dorados y emblema cerebro-chip como marca reconocible en el inicio y la cabecera, con proporción original y `object-fit: contain`. No redibujarlo, sustituirlo por un toro genérico, recortarlo ni recolorearlo. A tamaño pequeño, comprobar que el chip se distingue; una simplificación nueva requiere derivado aprobado y trazable. Marca visible: TORO. No ocupar medio primer viewport con una ilustración decorativa.

## 4. Dirección visual

Interfaz de producto avanzada y distintiva, no landing page, tablero genérico ni estética de videojuego. Más color visible de inmediato en navegación, áreas, iconos y superficies, con jerarquía deliberada.

Se permiten cian, azul eléctrico, violeta, magenta, coral, ámbar, lima y esmeralda. Son recursos disponibles, no una obligación de aplicarlos todos a cada pantalla. Los gradientes, profundidad, bordes luminosos contenidos y translucidez pueden dar carácter sin degradar lectura. No usar luces, partículas, anillos, insignias o números como relleno ni fingir actividad del sistema.

Las áreas tienen una identidad cromática consistente; los estados operativos conservan texto y símbolo explícitos. Un color de sección nunca acredita un pago, conexión, permiso, ocupación o reparación.

La apariencia y densidad definitivas se aceptan sobre la superficie completa, no sobre una cabecera aislada. El concepto visual no cambia funciones ni aporta datos de producción.

## 5. Más información útil por pantalla

Usar el ancho y alto disponibles; no centrar una columna estrecha en un monitor grande. Mantener anchos de línea legibles mediante columnas y regiones, no un límite rígido de toda la aplicación.

Escritorio: navegación compacta, cabecera de una fila cuando quepa, resumen operativo, filas/tablas y panel contextual. En pantallas anchas, más columnas y más filas útiles, sin agrandar artificialmente tarjetas. El logo y títulos no se convierten en un hero gigante.

Móvil: reordenación deliberada con prioridad a acciones y pendientes; favoritos en dos columnas cuando sea legible, navegación compacta y detalle desplegable. No encoger la versión de escritorio con zoom, transformaciones o texto minúsculo. No ocultar funciones autorizadas solo por cambiar de dispositivo.

Antes de introducir nuevos paneles, reutilizar los componentes, fuentes, filtros y navegación existentes. Conservar selección, búsqueda y borradores al cambiar de vista. Orden visual coherente con DOM y teclado; ningún bloque vacío para simular contenido.

## 6. Títulos, iconos y contenido

Títulos breves, jerarquía tipográfica marcada y pesos/espaciado consistentes. Iconos reconocibles, con familia, tamaño y trazo coherentes; color y contenedor diferenciados por función. No reemplazarlos por una mezcla de emojis, iconos genéricos o adornos sin acción.

Eliminar de la vista principal párrafos de instrucciones internas, jerga del backend, copy robótico, disclaimers repetidos y rótulos de agentes sin utilidad real. Trasladar explicación secundaria a ayuda contextual o detalle accesible. No ocultar avisos materiales de seguridad, errores, permisos, fuentes caducadas ni acciones que necesitan aprobación.

Cada control debe hacer lo que dice. Si solo abre Mi espacio, no presentarlo como una búsqueda funcional. No simular grabación, envío, guardado, sincronización o ejecución. Los agentes solo muestran actividad si existe evidencia vigente; nombres o animaciones no demuestran trabajo.

## 7. Datos, privacidad y límites conservados

Supabase conserva el estado canónico TORO; Kross la autoridad PMS; Alegra su dominio contable; Dropbox los originales; GitHub contratos/código y Vercel evidencia de despliegue. No añadir permisos, tablas, RPC, librerías, servicios pagados o escritores por apariencia.

No inventar métricas, reservas, huéspedes, saldos, conversiones CRC/USD ni tareas para llenar espacio. Las demostraciones usan datos sintéticos inequívocamente identificados fuera de la operación real; un concepto no es evidencia de rendimiento o conectividad.

Preservar fuente, corte, cobertura parcial y estado desconocido, expresados de forma compacta. Desayuno depende de tarifa/reserva. Villas y full buyout son modalidades de las mismas unidades, no inventario adicional. La política de reseñas sigue siendo preparar sin publicar; el rediseño no autoriza envíos ni correcciones públicas.

Logos externos: reutilizar activos verificados de `public/brand/tools/provenance.json`, conservar sus bytes y proporciones. Un logo o enlace no prueba conexión, sesión compartida o acceso. Mantener la distinción entre navegación y operación integrada.

## 8. Accesibilidad y respuesta

Texto auxiliar al menos 12px, contenido principal legible, objetivos táctiles de al menos 44px y acción principal de 48px. Contraste mínimo 4.5:1 para texto normal; foco visible, nombres accesibles, encabezados y landmarks correctos, skip link y navegación por teclado. Respetar reduced-motion y forced-colors. Nada depende exclusivamente del color.

No sacrificar monedas, fuentes, estados críticos o acciones para ganar densidad. No desbordes, solapamientos, encabezados cortados ni barras fijas que oculten contenido.

## 9. Verificación y aceptación

Comparar versión anterior y candidato con el mismo contenido, viewport, estado de sesión y permisos. Medir elementos útiles visibles, desplazamiento para la tarea principal, pasos, tiempos observados y errores. No convertir cantidad de colores o tarjetas en mejora operativa.

Comprobar al menos 320px, 390px, 1440px y una pantalla amplia, con logo, tipografía, iconos, foco, interacciones y orden responsive. Revisar el delta con tests, lint, TypeScript y build cuando haya código; comprobar visualmente la pantalla completa. Datos sintéticos y pruebas de componentes no acreditan integración autenticada.

Cada entrega distingue: dirección documentada, concepto visual, código probado, preview, despliegue y resultado operativo. Un render no cuenta como frontend implementado ni una PR como producción.

## 10. Metadata, despliegue y reversión

Antes de publicar: favicon/iconos trazables al maestro, título/descripcion/canonical/metadataBase, imagen social accesible, idioma y manifest cuando proceda. El Portal privado conserva noindex/robots cerrado; sitemap y datos estructurados solo para contenido público aprobado y real.

La comprobación ocurre sobre HTML, recursos y rutas realmente servidos, no solo archivos o CI. Mantener el dominio y proyecto actuales, promoción única coordinada, recibo con SHA exacto y rollback conocido. No activar flags, escritores ni cambiar configuración desde un temporizador de este programa.

## 11. Siguiente unidad del mismo carril

Cerrar una única aceptación autenticada de la pantalla principal y su adaptación móvil usando el maestro recuperado y el candidato ya implementado. Comprobar el SHA servido, Caja y Mensajes/Utilidades por click/teclado/foco/scroll, borradores dentro del mismo ámbito, limpieza al cambiar usuario/organización, contexto restringido, logo y legibilidad en 320/390/1440/pantalla amplia. No ampliar funciones, desarrollar un Portal paralelo ni iniciar otra publicación.

El Plan General sigue siendo `docs/product/TORO_BRAIN_GENERAL_PLAN.md` y el candidato #347 ya contiene su delta mínimo de rediseño y recuperación del maestro. La rama también preserva la cobertura financiera vigente de main en el Plan, el contrato subordinado y `TORO_USER_PORTAL_V1.md`. Mantener la PR en draft hasta que CI/build del HEAD reconciliado y la aceptación autenticada permitan una decisión humana separada de integración y promoción.
