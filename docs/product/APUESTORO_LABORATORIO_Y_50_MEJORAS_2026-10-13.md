# APUESTORO — Laboratorio de decisiones y 50 mejoras verificables

Fecha: 13 de octubre de 2026. Estado: TARGET / DISEÑO PROPUESTO. Documento subordinado al Plan General único de TORO; no es una aplicación desplegada ni un resultado de rentabilidad. Especificación técnica sin datos de carteras personales.

## 1. Decisión, alcance y relación con TORO

La solicitud del propietario renombra POLYBET como APUESTORO e incorpora el proyecto al portafolio TORO. Sustituye la decisión anterior de mantenerlo arquitectónicamente fuera de TORO, pero NO permite mezclar fondos, datos o permisos con Dreamcatcher. POLYBET queda como alias histórico para conservar referencias; no se reinician registros ni se convierten estimaciones anteriores en resultados validados.

APUESTORO es una experiencia especializada bajo TORO, con scope privado del proyecto y el mismo gobierno, identidad y Control Plane. La marca propuesta es «APUESTORO · por TORO»; no cambia la marca global ni autoriza redibujar el logo maestro. La disponibilidad del dominio y la marca comercial todavía no está verificada.

Mapeo: portafolio TORO → proyecto personal aislado → investigación, conectores, simulación, evaluación y presentación. Antes de crear registros runtime, resolver la identidad de proyecto existente y posibles relaciones con TORO Exchange: una similitud de nombre no prueba que sean el mismo proyecto. Esta ronda NO crea tablas, permisos, cuentas, cobros, despliegues ni un scheduler nuevo.

CURRENT: investigación y documentos; existe un radar periódico configurado. TARGET: laboratorio cloud privado con datos públicos y simulación autónoma. NEXT: validar esquema, libro contable y primer circuito completo. FUTURE: producto analítico comercial tras pruebas, licencias y revisión legal. La gestión de dinero de terceros, custodia y ejecución automática de apuestas reales NO forman parte del alcance implementable aquí. La cartera real futura es de solo lectura o importación consentida.

Objetivo: encontrar y comprobar decisiones que mejoren resultados netos ajustados a riesgo, incertidumbre y costos. No maximizar operaciones, multiplicadores o tiempo de uso. Ninguna idea de este documento acredita por sí sola una ventaja económica.

## 2. Tres controles independientes, no un único botón de agresividad

1. Método de razonamiento: cómo se construye la previsión.
2. Perfil de riesgo: cuánto puede comprometer el simulador y qué pérdidas admite.
3. Horizonte: cuándo se desea revisar el resultado y cuándo puede liquidarse realmente.

Métodos diseñados:
- Estadístico: frecuencias históricas pertinentes, referencias comparables y calibración.
- Causal: requisitos, obstáculos y acontecimientos que podrían cambiar el resultado.
- Contrario: objeción fuerte al consenso; debe poder concluir que el consenso tiene razón.
- Señales: cambios de proceso, evidencia pública indirecta y relaciones entre acontecimientos.
- Intuición: hipótesis rápida y breve, fechada antes del desenlace, sin inventar probabilidades calibradas.
- Combinado: reúne información complementaria y limita el peso de métodos no validados.

La mini versión empieza con Estadístico, Causal e Intuición, más referencias de mercado y efectivo. Los otros tres se añaden después. «Intuición» es una política de hipótesis, no acceso al pensamiento privado de un modelo. Guardar una explicación breve, factores, objeciones y fuentes, no cadenas internas de pensamiento.

Ejemplo de asignación FICTICIA de US$100: Prudente US$60, Catalizadores US$20 y Laboratorio US$20. Son sobres de presupuesto, no dinero necesariamente utilizado. No se denominan «seguros»: una posición puede perder todo su costo incluso en el perfil prudente. Mantener inicialmente el tope agregado propuesto de US$30 expuestos a costo y US$5 en tesis sin probabilidad calibrada, mientras se evalúa el diseño. Los sublímites deben sumar al límite global; no basta cumplirlos por separado.

El slider selecciona horizonte de revisión, por ejemplo 1/7/30/90/365 días. Debe mostrar aparte la fecha contractual, liquidez estimada y posible demora de resolución. Acortar el slider no aumenta probabilidades ni garantiza recuperar efectivo. Cuando una meta no sea compatible con los contratos disponibles, mostrar «sin combinación compatible», no forzar una apuesta.

## 3. Experimentación simultánea sin engañarnos

Seis métodos × tres perfiles × tres horizontes permiten hasta 54 configuraciones conceptuales. NO lanzar 54 agentes con búsquedas duplicadas ni tratar 54 copias de US$100 como una cartera de US$5.400.

Mini: comparar tres métodos bajo el mismo perfil, universo, instantánea, fecha de decisión y presupuesto de investigación. Después variar un factor a la vez. Una prueba factorial completa pertenece al laboratorio posterior, no al camino crítico de la app.

Cada experimento conserva: ID, versión de modelo/prompt/datos, hipótesis, fecha de inicio, universo elegible, presupuesto, límites, criterio de evaluación y motivo de cierre. Registrar todos los intentos, incluidos los fallidos o descartados. El historial no se reinicia después de perder.

Dos pistas separadas:
- Pronóstico: Brier/log score, calibración por rango y cobertura; abstenciones y tamaños de muestra visibles.
- Cartera virtual: resultado neto, drawdown, costos, exposición, liquidez, capital inmovilizado y concentración de ganancias.

Mejorar pronóstico no demuestra mejorar ganancias después de costos. Evaluar con ventanas futuras reservadas, agrupar por acontecimiento y factor común, controlar comparaciones múltiples y no declarar un ganador por observar continuamente hasta encontrar un resultado favorable. Reportar incertidumbre y mantener una estrategia candidata frente a otra retadora. Promociones acotadas y reversibles; no automodificar producción.

Los replay históricos sirven para probar contabilidad y software. Un LLM actual puede conocer desenlaces pasados incluso sin navegar: no usar ese replay como prueba limpia de anticipación. La validación principal es prospectiva. Para simulaciones Monte Carlo, los trayectos son escenarios del modelo, no observaciones. Preservar dependencias y mostrar sensibilidad cuando no puedan estimarse.

En comparaciones hipotéticas cada cartera se evalúa por separado. En la cartera agregada, posiciones que compiten por la misma profundidad consumen un presupuesto común de liquidez: no reutilizar una contraparte varias veces para inflar capacidad.

## 4. Qué reutilizar de otros, sin copiar sus errores

- Polymarket: ontología evento/mercado/resultado, libros, reglas, tarifas y feeds. Su documentación actual distingue SDK unificado, Data API v2 y generaciones de protocolo; no adoptar una librería por un tutorial antiguo [S01–S04].
- Kalshi: series/eventos/mercados y datos públicos. El libro documentado presenta bids YES y NO; la oferta complementaria se deriva dentro del mismo mercado binario, no mezclando bolsas. Usa cantidades y precios decimales en strings [S05–S06].
- PaperPoly: diario, práctica y acceso MCP como referencias de experiencia. Publica refrescos de 30 segundos; no asumir precisión del simulador o calidad estadística de certificados por esas afirmaciones. Una guía suya de tarifas afirma un 2% sobre ganancias, incompatible con la tarifa por operación descrita por Polymarket: las reglas de costos deben venir de la plataforma oficial [S04, S07–S08].
- ForecastBench: evaluación dinámica de preguntas futuras y comparación entre métodos; no confundir puntuación predictiva con rentabilidad [S09].
- Metaculus MiniBench/FutureEval: ciclos de evaluación y posible participación en premios tras revisar reglas y elegibilidad. Los premios no son ingresos recurrentes presupuestados [S10–S11].
- AIA Forecaster: su informe encuentra utilidad en búsqueda, combinación y calibración; en su prueba de mercados líquidos, el modelo aislado quedó por debajo del consenso y su combinación mejoró precisión. Es evidencia para probar complementariedad, no para prometer dinero [S12].
- Manifold: hipótesis amplias y datos comunitarios bajo licencia; no equiparar sus precios con los de un mercado monetario [S13].
- Betfair: posible expansión de datos deportivos. Licencias, permisos y modelo comercial requieren revisión propia; no se integra en la mini versión [S14].

No se han auditado cuentas privadas, rentabilidad real o código propietario de estos servicios. Ingeniería inversa limitada a interfaces públicas, documentación y código con licencia comprobada. No crear cuentas si la lectura pública cubre la necesidad; cuentas opcionales posteriores sin pagos o términos comerciales aceptados automáticamente.

## 5. Constitución de integración

APUESTORO tendrá un modelo interno neutral con adaptadores nativos. Parecerse a una API no significa copiar todas sus limitaciones ni depender de un solo proveedor.

Contrato conceptual de lectura: descubrir contratos; leer regla; obtener libro; recibir cambios; obtener tarifas; leer estado de resolución. Capacidades no soportadas se declaran explícitamente. Ningún adaptador de la mini versión expone crear/cancelar órdenes reales, firmar o transferir.

Identidad mínima: venue, environment, protocol_version, source_event_id, source_market_id, outcome_id/asset_id y tipo de activo. Preservar el payload original. No inferir equivalencia de dos contratos por su título. Comparar acontecimiento, inclusiones, umbrales, fecha, zona horaria, fuente, cancelación, revisión y pago excepcional.

Datos temporales: fecha del hecho, primera publicación, recepción y procesamiento. La cotización tiene timestamp del proveedor, captura y salud del canal. Un mercado sin operaciones nuevas no está necesariamente desconectado: distinguir inactividad de falta de heartbeat.

Importes en decimal exacto y moneda/activo explícitos. Tarifas versionadas por contrato y ejecución simulada, con activo de cobro, redondeo y cantidad neta. El tratamiento anterior del piloto POLYBET se conserva como pendiente de conciliación; ni comisión en efectivo ni comisión en participaciones se universalizan a todos los protocolos sin prueba.

Resoluciones modelan resultado final, pendiente, disputa, anulación y pago fraccionado cuando proceda. Un anuncio o una fecha alcanzada no equivalen a saldo disponible [S15].

Fuentes externas: documentos oficiales de procesos, publicaciones económicas con versiones históricas, emisores, datos científicos/meteorológicos pertinentes y pronósticos externos permitidos. Redes y prensa descubren señales; su repetición no sustituye evidencia primaria. Registrar licencia, origen, independencia y caducidad. La cobertura amplia se consigue con plantillas de acontecimientos, no con búsquedas profundas sobre todo el catálogo.

## 6. Arquitectura cloud rápida y mínima

Web móvil/desktop → API de lectura y cache → registro/valoración. En paralelo: un colector cloud → instantáneas y eventos → cola priorizada → modelos e hipótesis → controles → simulador → libro. La IA no está en el camino crítico de precios, saldos ni límites.

Reutilizar identidad, gobierno, conectores y registro de ejecuciones de TORO cuando estén comprobados. Separar namespace/datos del proyecto; no una segunda identidad ni un libro hotelero mezclado. La topología exacta depende de inspeccionar runtime, cuotas, planes y permisos existentes antes de desplegar.

Objetivo técnico propuesto, NO medido: en la watchlist inicial de hasta 20 mercados, actualización visible p95 inferior a 2 segundos DESDE recepción del evento; cálculo determinista p95 inferior a 250 ms con cache caliente. Esto excluye demoras del proveedor y no promete latencia total ni ventaja de alta frecuencia. Ingesta de catálogo más lenta y paginada; investigación costosa solo por novedades materiales. La comparación cada tres horas del radar no es un feed en vivo.

Una sola suscripción por fuente/mercado alimenta muchas variantes. Reutilizar evidencia pública cacheada; no compartir información privada entre usuarios. Priorizar posiciones abiertas, errores y resoluciones sobre exploración. Límites por ejecución, presupuesto y concurrencia; backpressure y cola de fallos; no bucles sin límite.

Web y worker pueden compartir despliegue si cumple pruebas, pero son responsabilidades separadas. Vercel anunció soporte WebSocket en junio de 2026: no repetir la afirmación antigua de imposibilidad. Las conexiones siguen límites de ejecución; el servicio de ingesta debe probar reconexión y estado durable [S16]. Cloudflare documenta que hibernación WebSocket no aplica a conexiones salientes: no presupuestar un colector externo 24/7 como si siempre durmiera gratis [S17].

Pruebas de cloud: cerrar navegador/apagar PC no detiene el worker; reiniciarlo no duplica saldo; snapshot después de reconexión corrige gaps; fallos de datos impiden fills; backups restauran el mismo libro. Sin esa evidencia, estado CONFIGURADO_NO_PROBADO.

No se compra dominio ni se publica la app en esta ronda. Una ruta privada dentro del portal TORO puede ser la primera superficie; dominio propio posterior sin crear un backend paralelo ni eludir restricciones geográficas [S18].

## 7. Las 50 mejoras — hipótesis, no promesas de ganancias

P0: requisito del primer circuito correcto. P1: experimento posterior de alto valor. P2: expansión condicionada. Roles son responsabilidades propuestas de módulos, no personas asignadas. Cada prueba compara contra una referencia y registra su costo.

### A. Alcance e información

| ID | Mejora y beneficio que se busca | Prueba / riesgo principal | Prioridad |
|---|---|---|---|
| 01 | Mapear acontecimientos por mecanismos reutilizables: aprobación, lanzamiento, umbral y decisión | Cobertura útil por plantilla; excluir reglas incompatibles | P0 |
| 02 | Mapa de cobertura por tema, horizonte y liquidez para descubrir zonas desatendidas | Oportunidades verificables por consulta; volumen bajo no significa ventaja | P1 |
| 03 | Leer fuentes originales multilingües antes de sus resúmenes | Medir información adicional y errores de traducción; respetar licencias | P1 |
| 04 | Grafo de requisitos públicos previos a un acontecimiento | Señal adelantada frente a fecha de noticia; correlación no prueba causalidad | P1 |
| 05 | Medir ausencia de una señal que tenía fecha y fuente esperadas | Comparar con casos históricos; no confundir fuente caída con evidencia negativa | P1 |
| 06 | Separar sorpresa informativa de cantidad de titulares | Mejora incremental de previsión; referencia previa debe quedar fijada | P1 |
| 07 | Rastrear noticia originaria y sus copias | Menos doble conteo y menos consultas; no atribuir independencia a republicaciones | P0 |
| 08 | Medir desacuerdo temporal entre evidencia y precio | Validar anticipación neta; descartar cotizaciones viejas antes de inferir oportunidad | P1 |
| 09 | Detectar baja atención con liquidez de salida suficiente | Valor realizable y tamaño máximo; no coleccionar contratos imposibles de vender | P1 |
| 10 | Evaluar cohortes públicas de pronosticadores, no solo ganadores visibles | Fijar universo y medir a futuro; controlar supervivencia y cuentas relacionadas | P2 |

### B. Formas de razonar

| ID | Mejora y beneficio que se busca | Prueba / riesgo principal | Prioridad |
|---|---|---|---|
| 11 | Base estadística por familias, con estimaciones más prudentes en muestras pequeñas | Calibración fuera de muestra; no trasladar tasas entre procesos diferentes | P0 |
| 12 | Pronóstico ciego a la cuota seguido de revisión explícita | Medir efecto de anclaje con entradas comparables | P0 |
| 13 | Pregunta inversa: qué evidencia justifica que el mercado nos contradiga | Errores evitados; no premiar oposición por sí misma | P0 |
| 14 | Modelo de cuello de botella y tiempo restante | Calidad por horizonte; evitar probabilidades constantes hasta el vencimiento | P1 |
| 15 | Actualización por escenarios al llegar evidencia nueva | Mejorar calibración; no sumar dos veces señales dependientes | P1 |
| 16 | Recuperación de analogías históricas con fecha de disponibilidad | Comparar analogía frente a baseline; no usar desenlaces futuros ocultos | P1 |
| 17 | Modo Intuición con hipótesis breve, falsable y presupuesto virtual reducido | Resultados propios visibles; posibilidad no equivale a probabilidad medible | P0 |
| 18 | Separar incertidumbre por falta de datos de incertidumbre del acontecimiento | Decidir investigar o abstenerse; no mostrar confianza narrativa como certeza | P1 |
| 19 | Combinación de métodos por información complementaria, no por mayoría de clones | Beneficio incremental prospectivo; pesos acotados y reversibles [S12] | P1 |
| 20 | Presupuesto de investigación según valor de información | Mejora por costo/consulta; no gastar más en explicar que en aprender | P0 |

### C. Experimentos y aprendizaje

| ID | Mejora y beneficio que se busca | Prueba / riesgo principal | Prioridad |
|---|---|---|---|
| 21 | Registro completo de variantes, parámetros e intentos | Reproducibilidad; impedir ocultar cientos de pruebas perdedoras | P0 |
| 22 | Ensayos emparejados con misma instantánea y presupuesto | Aislar efecto del razonamiento de diferencias de datos o cómputo | P0 |
| 23 | Compromiso temporal de tesis, abstenciones y criterios | Verificar ausencia de ediciones retrospectivas [S09] | P0 |
| 24 | Validación futura agrupada por acontecimiento y factor | Evitar train/test contaminados por contratos equivalentes | P0 |
| 25 | Control de comparaciones múltiples y revisión secuencial | No promover un ganador por azar después de muchos intentos | P1 |
| 26 | Evaluación de probabilidades por rango y horizonte | Brier/log score, calibración y tamaño; accuracy aislada engaña en sucesos raros | P0 |
| 27 | Separar acierto al vencimiento de revalorización previa | Dos objetivos y reglas anteriores; jamás inventar salida en máximo intradía | P0 |
| 28 | Prueba sin mayor ganador y con costos/latencia adversos | Medir fragilidad; retirar un ganador es diagnóstico, no nuevo resultado oficial | P1 |
| 29 | Exploración limitada a carteras sombra antes de cambiar la candidata | Mejoras prospectivas; no explorar con dinero real | P1 |
| 30 | Detección de degradación y cambios de régimen | Pausa/revisión ante deterioro; no reentrenamiento automático sin evaluación | P1 |

### D. Capital virtual y economía

| ID | Mejora y beneficio que se busca | Prueba / riesgo principal | Prioridad |
|---|---|---|---|
| 31 | Sobres de presupuesto y reserva bajo límite global | Suma de saldos y exposición concilia; no duplicar el mismo capital | P0 |
| 32 | Límite por factor causal compartido entre perfiles | Escenarios conjuntos; distintas etiquetas no garantizan diversificación | P0 |
| 33 | Compatibilidad entre horizonte deseado, resolución y salida | Mostrar iliquidez y demoras; no prometer retornos por un slider | P0 |
| 34 | Filtro de tamaños mínimos, ticks y costo relativo de apuestas pequeñas | Evitar simulaciones imposibles o consumidas por fricción | P0 |
| 35 | Comparar costos efectivos entre plataformas solo tras equivalencia contractual | Tasa de falsos matches; discrepancia no es arbitraje garantizado [S05–S06] | P1 |
| 36 | Motor de tarifas versionado por contrato/protocolo/activo | Conciliar cantidades netas y efectivo; no asumir comisión universal [S04] | P0 |
| 37 | Fills parciales y colas conservadoras para órdenes virtuales | No llenar por tocar precio; cuantificar sensibilidad del modelo | P0 |
| 38 | Políticas virtuales de mantener, reducir o salir por cambios de tesis | Registrar regla y hora antes; no confundir pérdida con oportunidad automática | P1 |
| 39 | Estimar capacidad útil y saturación de una estrategia | Simular tamaños y liquidez compartida; rentabilidad pequeña no prueba escalabilidad | P1 |
| 40 | Mostrar beneficio después de datos, IA, infraestructura y rotación | Contabilidad económica completa; separar costos conocidos, asignados y no medidos | P0 |

### E. Producto, infraestructura e ingresos por herramientas

| ID | Mejora y beneficio que se busca | Prueba / riesgo principal | Prioridad |
|---|---|---|---|
| 41 | Adaptadores con contrato de capacidades y fixtures de cada proveedor | Detectar cambios de esquema y protocolos sin romper el núcleo [S01–S06] | P0 |
| 42 | Una ingesta y cache compartida por fuente para múltiples simuladores | Costo por variante; aislamiento privado y licencias antes de redistribuir | P0 |
| 43 | Prioridad de eventos, caducidad y señales de salud visibles | p95 medido; detener simulaciones sobre datos obsoletos | P0 |
| 44 | Libro decimal, lotes y eventos idempotentes con enmiendas | Reconstruir saldo y cantidades exactamente después de replay | P0 |
| 45 | Worker cloud y restauración probada con PC apagada | Evidencia de continuidad/reconexión sin duplicados [S16–S17] | P0 |
| 46 | Visualizar pérdida, costos y ganancia neta con igual claridad | Comprensión del usuario; cero tarifas ocultas o proyecciones maquilladas [S19] | P0 |
| 47 | Comparador interactivo de escenarios y perfiles, con explicación corta | Entender riesgo/horizonte en pruebas de uso; no confundir simulación con pronóstico | P1 |
| 48 | Suscripción analítica o API empresarial con tarifa transparente y datos licenciados | Margen después de soporte y datos; no custodiar fondos ni cobrar por estimular rotación | P2 |
| 49 | Participar en evaluación/premios de pronóstico cuando sea elegible | Resultado externo verificable; premio eventual separado de ingresos recurrentes [S10–S11] | P2 |
| 50 | Extraer de TORO capacidades reutilizables de evidencia y auditoría | Reutilización sin fugas entre ámbitos; marca/dominio y onboarding tras sus gates | P0 |

Ninguna fila es un algoritmo instalado. P0 no significa implementar todo a la vez: primero los mínimos que hacen correcto el circuito. Roles: datos/integración (01–10, 41–43); investigación/modelos (11–20); evaluación (21–30); riesgo/libro (31–40, 44); plataforma/producto/compliance (45–50). Impacto, esfuerzo y rentabilidad deberán medirse, no inventarse como puntuaciones de certeza.

## 8. Interfaz propia, simple y honesta

Tres pantallas mini: Mi cartera, Radar y Laboratorio. Configuración por importes, perfil y horizonte; detalle avanzado plegado. Tarjetas con valor liquidable, efectivo reservado, variación neta, pérdida posible y hora del dato. Un botón «¿Por qué?» muestra hipótesis, objeción y fuente.

Gráficos propuestos: evolución frente a efectivo, distribución de escenarios con probabilidad de pérdida separada, y matriz método/riesgo/horizonte. No usar una banda continua engañosa para resultados binarios; si se muestran percentiles, explicar el modelo y la masa de probabilidad en pérdida total. Sin muestra suficiente: «no estimable», no un rango favorable inventado.

El usuario puede comparar dos perfiles con el mismo presupuesto sin mover capital. Las tarjetas son familiares por claridad y estructura de mercados, no por copiar identidad o logos de Polymarket. Sin confeti, urgencia ficticia, rachas o incentivos para recuperar pérdidas. Una experiencia entretenida puede premiar aprendizaje y calidad de previsión, no frecuencia de apuestas.

No se ocultan comisiones entre ganancias. Ejemplo hipotético de presentación: resultado bruto +US$4; costos de mercado -US$0,50; costo del servicio -US$0,25; neto +US$3,25. Mostrar también qué ocurre si la posición pierde, no solo el escenario favorable. Este ejemplo no fija precios comerciales.

## 9. Mini funcional y criterios de terminado

Primer circuito: contratos públicos de Polymarket → lectura de reglas/libro/tarifa → tres políticas de hipótesis → filtros → compra/venta FICTICIA → libro reproducible → valoración → tablero privado. Kalshi comienza como comparación de datos y contrato; no bloquear la primera mini por conectar todas las plataformas.

Para llamarlo funcional deben pasar: datos con fuente/hora; costos conciliados por generación de contrato; cero duplicados por replay; compra y venta parciales; libro sin precio produce estado explícito; límite global entre sobres; escenarios y cobros claros; worker continúa sin PC; exportación/restauración; ninguna ruta de órdenes/fondos reales; identidad y aislamiento privados comprobados.

Orden: P0 integridad de datos/libro → mini prospectiva → evaluación comparativa → expansión de señales → monetización de herramientas. No comprar datos premium, abrir cuentas de apuestas, invitar clientes o contratar infraestructura por entusiasmo. Sin presupuesto de nube conocido, coste incremental SIN MEDIR. El alojamiento existente no implica capacidad gratuita o autorización para publicar.

La investigación de 50 ideas está hecha como diseño; la prueba de las 50 sigue pendiente. Rentabilidad: NO DEMOSTRADA. Dominio: NO REGISTRADO. Modo cloud: NO DESPLEGADO. Cuenta/plataforma real: NO CONECTADA.

## 10. Integración propuesta en el Plan General

Esta especificación está subordinada a `docs/product/TORO_BRAIN_GENERAL_PLAN.md`. Su publicación en una rama no modifica automáticamente el master ni concede permisos runtime. Mantener rama/PR y revisión, sin escritura directa a main ni merge no verificado.

Resumen propuesto para insertar en el Plan General mediante parche acotado, preservando íntegro el resto:

> APUESTORO — evolución de POLYBET (13/10/2026). Proyecto privado del portafolio TORO para investigación de mercados de predicción, simulación prospectiva y comparación de métodos. CURRENT: diseño documentado; TARGET: laboratorio cloud independiente de la PC; NEXT: mini de datos públicos + libro contable probado + tres modos de hipótesis + tablero privado; FUTURE: producto analítico comercial sujeto a licencias/readiness/revisión legal. Nombre APUESTORO aprobado por el propietario; no reemplaza la identidad global TORO. Mismo gobierno y scope privado; sin mezcla con Dreamcatcher. Sin custodia, órdenes reales, cobros ocultos ni promesas de rentabilidad. Reutilizar el radar existente; no nuevo scheduler. La matriz de 50 mejoras y criterios vive en `docs/product/APUESTORO_LABORATORIO_Y_50_MEJORAS_2026-10-13.md`; no son 50 tareas completadas ni 50 estrategias rentables. Incorporación runtime y dominio pendientes de verificación.

Si la integración textual no se aplicó en esta rama, informar PENDIENTE_INTEGRAR_MASTER. No afirmar que el Plan General quedó actualizado por el solo hecho de enlazarlo.

## 11. Próximo superprompt

Continúa APUESTORO dentro de TORO. Lee AGENTS.md, START_HERE.md, toro-context.yaml, Plan General, constitución y esta especificación en su versión más reciente. Conserva POLYBET como alias y el piloto previo con sus enmiendas pendientes; no reinicies saldo ni copies una cartera personal al repo público.

1. Revisa el PR de APUESTORO existente y diferencias respecto de main. Reutiliza esa rama y documento. Aplica el resumen de la sección 10 al Plan General con una inserción mínima, después de recuperar el archivo completo y comprobar que no existe otra sección equivalente. No reemplaces main con una lectura parcial; no hagas merge automático.
2. Haz ingeniería inversa pública de los contratos actuales Polymarket/Kalshi y de experiencias de simulación. Valida esquema/protocolo, precision, tarifas, licencias, cuotas y timestamp; distingue documentación de conexión realmente probada. No copies código sin comprobar su licencia.
3. Inspecciona runtime TORO y capacidad cloud existente en solo lectura. Elige la arquitectura mínima sin PC y sin nueva base/identidad/scheduler paralelo. Entrega contratos de módulos, datos, amenazas, estimación de costos y pruebas de aceptación; no contrates servicios ni publiques.
4. Define el primer experimento prospectivo con tres modos y el mismo presupuesto, más baselines de mercado/efectivo. Congela hipótesis, universos, límites y criterios; muestra abstención, costos, incertidumbre y correlaciones. No simules ganancia con conocimiento del futuro.
5. Entrega el plan de implementación de la mini por bloques verificables y pruebas. Mantén únicamente datos/hipótesis/simulación y cartera real de lectura. No implementes custodia, apuestas reales, transferencia, firma, ocultación de tarifas o elusión geográfica. No declares rentabilidad, producción, conexión o prueba sin evidencia.

No vuelvas a preguntar nombre, capital ficticio inicial, preferencia cloud ni necesidad de perfiles: ya están definidos. Resume HECHO, PROPUESTO, BLOQUEADO, siguiente acción y enlace. Es una ronda de especificación y validación; código de producto y despliegue requieren su etapa de aprobación. Lote finito: hasta 30 llamadas adicionales, sin bucles de espera; si hay bloqueo, completa trabajo independiente y deja checkpoint preciso.

## 12. Fuentes primarias consultadas

Consultadas el 13/10/2026. Son evidencia de documentación/investigación, no pruebas del runtime de APUESTORO.

- S01 Polymarket, Overview: https://docs.polymarket.com/api-reference/predictions/overview
- S02 Polymarket, Real-Time Data: https://docs.polymarket.com/market-data/realtime-data
- S03 Polymarket, Unified SDK migration: https://docs.polymarket.com/migrate/clob-sdk-to-unified-sdk
- S04 Polymarket, Fees: https://docs.polymarket.com/trading/fees
- S05 Kalshi, Public Market Data: https://docs.kalshi.com/getting_started/quick_start_market_data
- S06 Kalshi, Orderbook Responses: https://docs.kalshi.com/getting_started/orderbook_responses
- S07 PaperPoly, producto publicado: https://paperpoly.io/
- S08 PaperPoly, guía de tarifas con discrepancia detectada: https://paperpoly.io/polymarket-fees
- S09 ForecastBench, metodología: https://www.forecastbench.org/about/
- S10 Metaculus, MiniBench: https://www.metaculus.com/aib/minibench/
- S11 Metaculus, Fall 2026 FutureEval: https://www.metaculus.com/tournament/fall-futureeval-2026/
- S12 Alur et al., AIA Forecaster Technical Report, 10/11/2025: https://arxiv.org/abs/2511.07678
- S13 Manifold, API y límites de uso: https://docs.manifold.markets/api
- S14 Betfair, Software Vendor Program: https://developer.betfair.com/vendor-program/the-process/
- S15 Polymarket, Resolution: https://docs.polymarket.com/concepts/resolution
- S16 Vercel, WebSocket public beta, 22/06/2026: https://vercel.com/changelog/websocket-support-is-now-in-public-beta ; límites de duración: https://vercel.com/kb/guide/do-vercel-serverless-functions-support-websocket-connections
- S17 Cloudflare, WebSocket hibernation (excluye conexiones salientes): https://developers.cloudflare.com/durable-objects/examples/websocket-hibernation-server/
- S18 Polymarket, Geographic Restrictions: https://docs.polymarket.com/api-reference/geoblock
- S19 FTC, informe sobre dark patterns, 15/09/2022: https://www.ftc.gov/news-events/news/press-releases/2022/09/ftc-report-shows-rise-sophisticated-dark-patterns-designed-trick-trap-consumers

S19 es una referencia de protección del consumidor de EE. UU.; no certifica qué ley aplica a este proyecto en Costa Rica u otro país. Comercialización y gestión financiera requieren análisis profesional de la jurisdicción y actividad concretas. No se crea una garantía regulatoria por llamar «software» al producto.
