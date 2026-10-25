# TORO · expediente integrado y presentación compacta

Estado: APROBADO por Mauricio el24/10/2026. Primer lote sintético autorizado; lectura real y publicación sujetas a sus verificaciones.
Diseño aprobado. La implementación del primer lote se documenta en ../plans/2026-10-24-portal-expediente-first-lot.md. Esta especificación por sí sola no acredita despliegue ni lectura de expedientes reales.

## Objetivo y criterio de terminado

Consultar el expediente financiero, fiscal, operativo y patrimonial desde el Portal TORO existente. Las personas físicas y jurídicas, bienes, cuentas, obligaciones, documentos y pendientes forman vistas de los mismos objetos y relaciones. El hotel y el patrimonio personal conservan ámbitos separados, con cruces solo para la identidad expresamente autorizada.

Terminado productivo significa que el usuario autorizado entra por el dominio habitual, elige contexto, encuentra un registro, abre su detalle y evidencia permitida, y obtiene el mismo corte y estado que el informe/Excel. Una sesión anónima, un empleado o una segunda organización no obtiene datos restringidos. Se verifica el SHA desplegado, la reversión y una sesión real. Hasta entonces el estado es DISEÑADO o PREPARADO.

## Lo comprobado y las alternativas

- La URL pública redirige a `/portal` y solicita iniciar sesión. En esta revisión no hubo sesión autenticada del Portal. La página pública no demuestra el contenido privado ni sus permisos.
- `src/app/portal/page.tsx` ya usa `PrivateViewGuard`, contexto de organización y menú autorizado. `src/features/portal/portal-workspace.tsx` contiene Inicio, Operación, Dinero, Personas, Mercadeo, Herramientas, Reportes y Más.
- `/my-toro` ya admite selección de contexto y foco por capacidad. Dirección, Gerencia y Finanzas son perfiles diferentes. La capacidad de ver atención del propietario no se interpreta como permiso para leer todo su patrimonio.
- El informe y el Excel existentes son proyecciones privadas; la evidencia y los originales conservan su custodia. Haber guardado el expediente en la base no prueba que exista un lector web autorizado para él.
- La dirección visual vigente usa marco oscuro azul/pizarra, paneles claros selectivos, alturas naturales, etiquetas legibles y controles accesibles. Se conserva marca y activos aprobados.

Alternativas consideradas:
1. Vista nativa dentro de las áreas actuales. Permite filtros, relaciones y detalle contextual; requiere contrato de lectura acotado y pruebas de aislamiento. Es la propuesta que responde al pedido de un solo sistema.
2. Abrir el informe protegido desde Documentos. Es un paso de transición útil mientras se completa el lector; conserva menor integración entre registros. Nunca se convierte el archivo en un asset público ni se sirve HTML crudo dentro del origen de TORO.

No se crea micrositio, segundo dashboard, base, agenda ni scheduler. El visor de transición y la vista nativa remiten al mismo expediente; no son dos fuentes de verdad.

## Diseño de pantalla

Se preservan la navegación, marca y lenguaje visual del Portal. El cambio se concentra en cómo se explora el expediente, sin rehacer los flujos operativos ajenos.

En escritorio:

```text
TORO    Contexto autorizado                         Buscar / pedir
Inicio · Operación · Dinero · Personas · Herramientas · Reportes · Más
Expediente   [Entidad] [Período] [Estado] [Buscar]       [Exportar]
Resumen · Personas y sociedades · Bienes · Bancos · Fiscal · Evidencia
┌─────────────────────────────────────┬────────────────────────────┐
│ Lista / tabla filtrable             │ Registro seleccionado      │
│ Registro · Estado · Corte · Acción  │ Hecho / límite / relación  │
│ Filas compactas y ordenables        │ Documentos / próximos pasos│
│ Conteo de resultados y paginación    │ Detalles desplegables      │
└─────────────────────────────────────┴────────────────────────────┘
```

En móvil: misma selección y filtros, lista de ancho disponible, registro desplegable o pantalla de detalle con Volver. La selección, búsqueda y filtros sobreviven al cambio de pestaña dentro de la sesión. No se simula persistencia remota. Las tablas financieras permiten desplazamiento dentro de su contenedor, sin desbordar toda la página.

Contrato de densidad:
- Cabecera, filtros y acciones en una fila cuando quepan; se apilan con orden lógico en móvil.
- Un único nivel fijo de cabecera. Altura natural, sin bloques altos vacíos ni grandes tarjetas repetidas.
- Cuerpo de tabla legible; texto auxiliar de al menos12px y objetivos interactivos de al menos44px. Ganar espacio reduciendo repetición, márgenes y columnas secundarias.
- Filas por defecto: nombre o referencia, estado, período/corte y siguiente acción. Importes siempre con moneda y naturaleza. Campos secundarios en detalle, sin borrarlos.
- Mostrar PARCIAL, PENDIENTE, BLOQUEADO o DESCONOCIDO junto al dato afectado. El color acompaña texto y foco; no es el único indicador.
- Resumen inicial: excepciones útiles y próximas acciones verificadas. No fabricar métricas, saldos actuales o porcentajes de completitud.

Contenido y operación:

| Vista | Primera lectura | Detalle desplegable |
|---|---|---|
| Personas y sociedades | Nombre, tipo, vínculo probado, corte, pendiente | Variantes documentadas, cargo/participación/representación separados, documentos y contradicciones |
| Bienes | Tipo, referencia segura, titular registral observado, posesión/venta declarada, estado | Finca/vehículo, gravámenes, traspaso, tributos, inspección y fuentes por fecha |
| Bancos y financiación | Cuenta enmascarada, moneda, titular, período, cobertura | Apertura/movimientos/cierre, deuda/garantía, conciliación y evidencia |
| Fiscal y seguridad social | Entidad, tributo/período, estado observado, corte | Origen/arrastre/aplicación, discrepancias, requisitos y revisión profesional pendiente |
| Evidencia | Documento, fuente, fecha, alcance y verificación | Identificador nativo, versión/hash, vínculo al original autorizado y relaciones |
| Pendientes y agenda | Acción, responsable, revisión/vencimiento, estado | Importe confirmado/estimado/desconocido, soporte, tarea y evento existentes |

El dato sensible completo no aparece en la lista general ni en parámetros URL. La lista usa claves internas no sensibles; el servidor verifica ámbito y permiso en cada lectura. Cambiar de persona no equivale a iniciar sesión como ella.

## Lectura, autoridad y privacidad

1. Reutilizar identidad, contexto, menú, lector y registros actuales. No ampliar roles, grants o RLS para mostrar un enlace. No inferir autorización por correo, nombre o por ser administrador del hotel.
2. Clasificar cada registro como personal privado, hotel/entidad u otro ámbito. La condición de familiar, socio o vínculo documental no concede acceso. Si no existe regla explícita para una clase de documento, no devolverla.
3. Preparar un contrato servidor de lectura por campos: ID seguro, tipo, etiqueta, ámbito autorizado, fuente/corte, estado y referencias permitidas. Revisar el lector y las políticas existentes antes de elegir RPC o endpoint. Su nombre y concesiones quedan pendientes de revisión técnica; no se inventa una integración ya habilitada.
4. No entregar `source_payload`, HTML/Markdown completos ni archivos de custodia mediante una consulta genérica al cliente. El reporte contiene identificadores y vínculos privados. No ponerlos en `public/`, código cliente, repositorio, metadata social, logs ni respuestas anónimas.
5. Las descargas usan el control servidor existente, validación de ámbito/documento y respuesta de adjunto. Sin URL de Dropbox pública nueva ni acceso compartido implícito. HTML heredado no se inyecta con `dangerouslySetInnerHTML` ni como iframe del mismo origen.
6. Las respuestas restringidas conservan política privada/no-store, sin caché compartida entre personas u organizaciones; cerrar sesión y cambiar de contexto elimina el detalle local anterior. Las denegaciones no filtran nombres, conteos o existencia de otros registros.
7. No crear tablas, políticas, usuarios o permisos en esta unidad. Un contrato nuevo de lectura puede necesitar aprobación específica de acceso después de revisar sus campos y negativas. La pantalla puede prepararse con datos sintéticos mientras ese límite permanezca cerrado.
8. Banco prueba dinero, Alegra contabilidad, PMS operación y cada portal oficial su documento. Portal, informe y Excel muestran la misma evidencia; no hacen nuevos asientos ni convierten una observación en un derecho fiscal o pago.

## Entrega y aceptación

Primero: aprobar este diseño y preparar el plan de ejecución sobre la revisión vigente del repositorio. No se trabajará sobre las copias locales como si fueran checkouts Git válidos; las tres rutas examinadas no acreditaron metadata Git utilizable.

Lote de implementación propuesto: componentes de lista/detalle y navegación del expediente en las pantallas existentes, inicialmente con fixtures sintéticos y lector cerrado cuando no haya permiso probado. Preservar los flujos actuales. Luego revisar y conectar solo el mínimo lector autorizado, con paginación y límites; finalmente aceptación real y promoción del candidato exacto al mismo dominio.

Pruebas necesarias:
- Mismo registro/corte/estado entre Portal, informe y Excel, sin duplicar activos, cobros, saldos o documentos.
- Lista, búsqueda, filtros, selección, retorno y exportación permitida. Desconocido distinto de cero; parcial distinto de conciliado.
- Anónimo, sesión expirada, segunda identidad, otra organización, empleado y cambio de contexto. Prueba por API además de ocultación visual.
- Originales inaccesibles fuera de ámbito; payload malicioso tratado como texto; ningún detalle privado en bundles, HTML público o logs.
-320/390px y escritorio, teclado, foco, contraste, objetivos44px, números y encabezados sin recorte. Medir filas útiles por pantalla y pasos para abrir evidencia antes/después, sin prometer mejoras arbitrarias.
- Pruebas dirigidas, lint/typecheck/build y CI del SHA exacto; aceptación autenticada, respuesta anónima y rollback antes de producción.

Reversión: conservar el despliegue vigente y apagar la nueva vista/lector mediante el mecanismo actual si falla. No borrar fuentes ni revertir evidencias contables. Un fallo de lectura muestra pendiente y mantiene el último corte identificado, nunca saldo cero ni conexión fingida.

## Mejora continua y alineación

El mismo heartbeat lee el checkpoint y mejora una unidad coherente por ejecución cuando haya evidencia, autorización y cupo. Evalúa formato en cada pasada útil; aplica un cambio aprobado solo si mejora densidad, búsqueda, legibilidad o acceso a evidencia sin perder información. Guarda antes/después y alcance. No rediseña todo ni crea cuotas ficticias de mejoras.

Mantener el horario y el destino existentes, silencio sin cambio útil, guardas de consumo y pausas. La aprobación del diseño no activa mensajes, contabilización, pagos ni permisos nuevos. El método general puede ir al Plan público; identificaciones, importes, expedientes y vínculos restringidos permanecen privados.

La evidencia de esta unidad y el siguiente paso vuelven al checkpoint existente. El informe/Excel vigentes mantienen su papel de respaldo y proyección hasta que exista una lectura del Portal realmente aceptada.
