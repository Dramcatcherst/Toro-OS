# TORO · Brain inmersivo y verificable — diseño para revisión

Estado: propuesta del 29/09/2026. La aprobación de la dirección en conversación permite escribir este diseño; no autoriza código, merge, producción, permisos, conectores ni datos reales.

## Propósito, precedencia y alcance

TORO es un solo producto. Brain es su vista de conexiones, evidencia y actividad verificable; no otra aplicación, base, motor de decisiones o marca. Esta especificación detalla la experiencia de /brain bajo la sección 22 del Plan General y TORO_VISUAL_BRAIN_ARCHITECTURE_V1.md. Es subordinada a esos contratos. Aplican las reglas B03, B06, B08, B11, B14, B19 y B24 del programa R3-2026-09-19.

Objetivo de Mauricio: que el usuario perciba cómo su empresa se entiende entre sí, explore neuronas y niveles inferiores dentro del mismo mapa, vea trabajo actual solo si está probado y use casi toda la pantalla con poco scroll. Las dos imágenes “Mapa neuronal ejecutivo de TORO (7)” y “Mapa neural hotelero con toro sutil (1)” inspiran capas, color y detalle contextual; no son logos oficiales, datos ni maquetas literales.

## Evidencia y límites observados

La PR #172 (codex/brain-mode-truth-20260926) estaba abierta como borrador en d3de73899d36cfaab40bbabae328acede3adff5b. Separa escenarios sintéticos de la proyección canónica. En la preview 4uxnynihy observada con viewport aproximado de 713 × 693, un hero, tres cifras y una franja de señales precedían al mapa: éste empezaba fuera del primer pantallazo y ocupaba una columna central estrecha. Esa preview no certifica el último commit. El código de rama usa un icono Brain de Lucide como marca; antes de implementarlo debe localizarse el archivo oficial de TORO y usarse una vez, sin redibujarlo. El mapa móvil actual mide aproximadamente 270–330 px de alto y convive con múltiples bloques inferiores. Su búsqueda, expansión, separación sintético/canónico y alternativa accesible son capacidades que se conservan.

Stage C de lectura autenticada aún requiere QA con sesión autorizada. Ni los eventos sintéticos ni un deployment Ready prueban actividad real. Múltiples previews de la misma app son builds distintos, no automáticamente productos distintos; cada una debe identificarse por proyecto, SHA, fecha y modo de datos.

## Elección de experiencia

Opción A, pulir la página actual: rápida, pero mantiene el mapa subordinado al scroll. Opción B, mapa inmersivo 2D/2.5D con revelado progresivo y ficha contextual: recomendada porque reutiliza la proyección y conserva rendimiento/accesibilidad medibles. Opción C, escena 3D principal: diferida por oclusión, batería y complejidad; podrá evaluarse como modo Presentación tras pruebas de uso.

La vista inicial responde: qué ámbito veo, qué relaciones tienen evidencia y qué exige atención o tiene actividad vigente. No abre con KPI sintéticos que parezcan resultados del hotel. La red muestra una vecindad enfocada, no toda la empresa dibujada de una vez; “mostrar todo” significa descubribilidad completa dentro del ámbito autorizado.

## Composición móvil y escritorio

Móvil, referencia 390 × 844:
- Barra TORO compacta de máximo 64 px más safe area: logo oficial único, negocio/ámbito y búsqueda. “Cerebro” puede nombrar la navegación; “TORO Brain” no es otra marca.
- Lienzo visible sin scroll, objetivo de al menos 60 % de la altura útil inicial después de barras. Incluye centrar, zoom, filtro de capas y un indicador compacto de modo sintético/canónico y frescura.
- Tap selecciona una neurona; una ficha inferior de dos alturas muestra identidad, estado, autoridad, evidencia, limitación, conexiones tipadas y próximo paso seguro. Cerrarla restaura foco y encuadre. Swipe cambia foco entre vecinos; pan y pellizco exploran el lienzo. Gestos no deben desplazar accidentalmente la página.
- Una opción explícita abre lista/timeline accesible de la misma proyección. No es una segunda navegación obligatoria ni una lista larga bajo el mapa.

Escritorio, referencia 1440 × 900:
- El mapa ocupa al menos 70 % del ancho y 70 % de la altura útil inicial. No hay columna lateral permanente vacía. La ficha aparece al seleccionar, sobre el borde o como overlay reversible.
- Rueda/trackpad, pan, zoom a selección, centrar, volver a ámbito y teclado con foco visible. Actividad, evidencia y decisiones se abren desde el contexto, no apiladas debajo.
- Se permite scroll interno en fichas o alternativa textual. La ausencia absoluta de scroll no se impone a textos largos ni accesibilidad.

Móvil y escritorio comparten un solo contrato de selección, nodos, relaciones y fuentes. La presentación cambia; no se crean dos cerebros. El shell utiliza los componentes existentes de TORO siempre que cumplan estas reglas.

## Navegación y niveles

La apertura muestra ámbito y hasta unas 12 neuronas principales o dos saltos útiles, ajustables por prueba de legibilidad. Buscar debe poder descubrir el inventario autorizado más allá de lo renderizado, sin entregar campos privados al cliente. Seleccionar un resultado centra el nodo y explica su ruta desde el ámbito.

Expandir revela vecinos en el mismo lienzo, conserva origen y deja regresar un nivel. Jerarquía part_of, relaciones documentadas, capacidades de conectores y actividad son capas independientes. Proximidad visual o nombres semejantes no crean aristas. Cada línea ofrece tipo, dirección, origen, verificación y frescura. Proyectos y tareas aparecen como focos o disparadores cuando explican el trabajo, no como departamentos permanentes.

Ejemplo de hotel: habitaciones, amenidades, desayunos, experiencias y villas pueden mostrarse conectados solo mediante IDs y relaciones comprobables; una visita del sitio a Isla Tortuga no es una preferencia hotelera demostrada por sí sola. La analítica web sería señal con origen y consentimiento aplicables, separada de reserva o decisión comercial.

## Semántica visual, identidad y accesibilidad

Base azul noche TORO. Cian indica foco/navegación; oro, evidencia validada o resultado destacado; verde, capacidad operativa verificada; violeta, agentes; naranja, atención; coral, fallo o gate. Cada estado incluye texto/icono/patrón: nunca depender del color solo. Reservar brillo y movimiento para selección y actividad vigente. Reducir animación con prefers-reduced-motion.

Tamaño inicial: texto general al menos 14 px en móvil, metadatos visibles al menos 12 px, controles táctiles al menos 44 × 44 px. Etiquetas densas se revelan al enfocar. Verificar contraste, zoom de navegador al 200 %, lectores de pantalla, orden de teclado, Escape, restauración de foco, español/inglés y formatos por ámbito. El logo oficial aprobado aparece una sola vez y su procedencia se verifica antes de integrarlo; las imágenes de referencia no lo sustituyen.

## Contrato de datos y actividad

Pipeline: manifiesto autorizado → IDs estables → filtro server-side por ámbito/rol → proyección deduplicada → aristas evidenciadas → overlay de eventos vigentes. Conservar identidad de sistema, cuenta, contenedor, objeto y registro. Cobertura separada con denominador y fecha para registrados, elegibles, lectura verificada, runtime activo y bloqueados/obsoletos. Desconocido no equivale a cero.

Una neurona pulsa solo con recibo autorizado y vigente del Event Spine: ID de evento/correlación, actor o runtime, acción segura, IDs afectados, hora, resultado, evidencia y TTL. La expiración, revocación o falla apaga el pulso. Tap muestra qué hace, qué se comprobó y qué espera; nunca “pensamientos” inferidos. Demo y realidad usan estados visuales claramente diferentes. Si no hay eventos verificables, el mapa puede estar conectado pero no “trabajando”.

Kross conserva reservas/precios vivos; Alegra, fiscalidad; bancos, movimiento; Dropbox, originales; Supabase, estructura/recibos autorizados; Airtable, superficie humana gobernada. La vista no sustituye esas autoridades ni el motor de aprobaciones. Una decisión sin respuesta humana inequívoca permanece pendiente de conciliación.

## Estados, privacidad y fallos

Especificar cargando, sin registros autorizados, sin relaciones verificadas, obsoleto, bloqueo de conector, error parcial, acceso denegado, sesión vencida y demo. En fallo parcial se ve solo el subconjunto permitido con cobertura incompleta. Sin canal de eventos, se apagan pulsos y se indica actividad no verificable; no se congela un pulso viejo. La alternativa lista/timeline expone idéntica evidencia autorizada. Ninguna interacción puede cruzar negocios, huéspedes, empleados o Finanzas privadas por un control solo visual; se prueba la denegación server-side.

## Criterios de aceptación y gates

UX: capturas y prueba en 390 × 844, 768 × 1024 y 1440 × 900; mapa visible en primera vista, porcentaje real del viewport útil registrado, sin overflow horizontal ni solapamiento. Abrir/expandir en el mismo lienzo, buscar fuera del foco, seguir relación, volver y cambiar de ámbito. Medir con usuarios el tiempo/error para localizar fuente y siguiente paso frente a la vista actual; no prometer porcentajes antes de medir. Probar touch, teclado, lector, 200 % de zoom, reduced-motion y dos idiomas.

Verdad: toda línea tiene tipo y prueba; todo pulso real tiene recibo vigente. Anónimo, otro negocio, rol insuficiente, permiso revocado y fuente fallida no exponen dato ni encienden nodo. Demo/canónico son distinguibles en pantalla y tests. Stage C autenticada se acepta antes de ampliar lectura; Event Spine y actividad real requieren un gate posterior. Finanzas, huéspedes, empleados y pagos siguen excluidos sin contrato explícito.

Rendimiento: medir primer shell útil, mapa interactivo, búsqueda/expansión, memoria y fluidez en móvil real/equipo normal. Fijar presupuestos numéricos desde baseline antes del release, no inventar cumplimiento ahora. 3D no bloquea esta fase.

## Exclusiones y siguiente gate

No crear nueva app, base grafo, agente, conector, permiso, canal ni aprobación operativa. No borrar la demo local o infraestructura legacy ni editar Plan General/CONTINUAR desde este diseño. No cambiar producción. Después de revisar y aprobar este documento, redactar un plan por cortes sobre la misma ruta /brain, comenzando por shell, mapa y ficha con QA visual; lectura autenticada y eventos live permanecen gates independientes. Revisar este diseño no aprueba todavía el plan ni el código.
