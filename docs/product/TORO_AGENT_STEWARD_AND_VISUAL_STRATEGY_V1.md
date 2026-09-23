# TORO Agent Steward y estrategia visual comercial — V1

Fecha: 2026-09-23 (America/Costa_Rica).
Estado: especificación incorporable al contrato canónico; perfil definido, NO desplegado ni activo.
Plan rector único: `docs/product/TORO_BRAIN_GENERAL_PLAN.md`.
Método: `docs/product/TORO_BRAIN_COGNITIVE_OPERATING_MODEL_V1.md`.
Registro de subsistemas: `docs/product/TORO_SUBSYSTEMS_AND_USER_VAULT.md`.
Expediente existente: `Dramcatcherst/Toro-OS#30`; aplicación visual: `#28`; dependencias: `#3`, `#6`, PR `#43` y website PR `#74`.

## 1. Decisión y alcance

TORO debe comprender el negocio, investigar prácticas pertinentes, evaluar su aplicabilidad y mejorar resultados verificables. Las fotografías son el primer caso de prueba, no el límite del producto.

Se define **TORO Agent Steward — Supervisor de Agentes**, identificador `toro-agent-steward`, como especialista hijo de **TORO Agents** dentro de TORO Brain. No es un nuevo subsistema, cerebro, aplicación, proyecto, catálogo de agentes ni motor de permisos. Reutiliza registros, tareas, aprobaciones, evidencia y despliegues existentes.

La capacidad visual permanece en **TORO Assets**. Su responsable utiliza habilidades de estrategia comercial, selección, edición conservadora, accesibilidad, metadatos, SEO y preparación por canal. Governance revisa fidelidad/derechos; Channels publica por la ruta existente; Growth evalúa resultados. El supervisor comprueba y desarrolla estas habilidades, no reemplaza a sus dueños.

Jerarquía de coordinación:

```text
TORO Brain / Plan General
├── TORO Agents → TORO Agent Steward
│   └── supervisa capacidades y ciclo de vida, sin otro registro de autoridad
└── Dreamcatcher Hotel · Proyecto Madre
    └── Dreamcatcher · Web, Marca, SEO y Reputación
        └── capacidad visual de Assets + entrega de Channels (#28)
```

Claves técnicas existentes: `toro_os_portfolio_master` y `toro_executive_control`. El vínculo vivo a la fila de proyecto Dreamcatcher sigue pendiente de verificación; no se inventa un ID ni se crea un reemplazo por nombre. Los trabajos y prioridades globales de identidad/seguridad se conservan. Los perfiles externos/generalizados siguen sujetos al gate vigente.

## 2. Función del supervisor

Objetivo: mantener la menor organización de agentes capaz de entregar el trabajo autorizado con calidad, control, costo proporcionado y evidencia; detectar habilidades faltantes, redundancias y degradación.

Entradas: perfil vigente del negocio, objetivos y restricciones; inventario autorizado de agentes/skills/workflows; herramientas y permisos; versiones; trazas mínimas; resultados reales; evaluaciones; presupuesto; dependencias; incidencias y correcciones.

Salidas: diagnóstico trazable y recomendación de `reuse`, `add_skill`, `configure_workflow`, `create_candidate`, `scale_existing_workers`, `improve_candidate`, `pause`, `merge_candidate`, `retire_candidate` o `no_change`. Cada salida contiene motivo, fuente, alcance, responsable, costo estimado, riesgo, alternativa, evaluación requerida, aprobación y reversión. No ejecuta una acción por el mero hecho de recomendarla.

Preferencia de diseño: eliminar/simplificar → reutilizar → añadir skill → workflow → especialista nuevo solo si existe una necesidad diferenciada. Más volumen del mismo trabajo puede necesitar más capacidad temporal, NO otra personalidad de agente.

## 3. Veinte mejoras requeridas

Son requisitos de diseño con criterios de aceptación, no veinte funciones ya activadas.

| ID | Mejora | Responsable y criterio verificable |
|---|---|---|
| M01 | Perfil vivo del negocio y sus objetivos | Knowledge/Research: cada propuesta identifica línea de negocio, cliente, promesa, restricción y resultado; fuentes y vigencia; no inferir rentabilidad de terceros por su apariencia. |
| M02 | Matriz de habilidades con brechas | Agents/Assets: distinguir habilidad requerida, disponible, probada y faltante; prueba representativa y dueño por habilidad; no afirmar competencia por un nombre o prompt. |
| M03 | Estrategia por producto, intención y canal | Assets/Growth: explicar qué necesita demostrar una habitación, villa, experiencia o anuncio; adaptar a intención declarada, no a datos personales inferidos. |
| M04 | Orden de álbum con propósito y cobertura | Assets: primero atractivo y comprensión, después distribución, baño, cocina/exterior y restricciones; cada posición tiene razón y los faltantes se registran; no existe un orden ganador universal sin evidencia. |
| M05 | Portadas y encuadres por dispositivo | Assets/Channels: elegir portada representativa, punto focal y recortes honestos para móvil/escritorio; acceso al encuadre completo; comparar variantes sin ocultar información necesaria. |
| M06 | Identidad y taxonomía semántica | Data/Assets: activo vinculado a unidad real, ambiente, uso privado/compartido, vigencia y origen; carpeta, nombre, hash o clasificación automática no certifican identidad visual. |
| M07 | Nombres estables y orden desacoplado | Assets/Channels: ID de activo inmutable; originales intactos; nombre descriptivo de derivados; posición en datos de galería; cambiar orden no renombra archivos ni rompe URLs. |
| M08 | Metadatos útiles, multilingües y verificables | Channels/Growth: alt y pies ES/EN según contexto, metadatos de página, imagen social, dimensiones, sitemap y derechos pertinentes; sin keyword stuffing, licencias inventadas ni meta keywords como trabajo SEO. |
| M09 | Rendimiento y distribución eficientes | Channels/Systems: variantes responsivas, tamaño/formato/calidad apropiados, carga prioritaria de portada y diferida del resto, caché/versionado; medir transferencia y rendimiento, no codificar sin necesidad. |
| M10 | Estética fiel y cadena de evidencia | Assets/Governance/Operations: receta de color versionada, original/derivado y antes/después; no inventar atributos ni ocultar defectos; problemas físicos generan reparación/re-toma; aprobación por destino. |
| M11 | Criterio para crear o no crear agentes | Agents: demostrar brecha, demanda, alternativa más simple, herramientas y valor esperado antes de crear un candidato; reutilizar trabajador existente para el mismo rol. |
| M12 | Ciclo de vida y registro únicos | Agents/Data: identidad/versiones y dueño único; estados documentado, candidato, probado, piloto, operativo observado, pausado, retirado; relacionar especialistas y subespecialistas sin registros paralelos. |
| M13 | Monitoreo basado en resultados reales | Systems/Agents: medir tarea terminada en destino, errores/retrabajo, costo por resultado aceptado, latencia y carga humana; no considerar actividad, autocalificación o mensajes como éxito. |
| M14 | Evaluación independiente y representativa | Governance/Builder: pruebas de éxito, denegación, fallo, contradicción y aislamiento; conjunto reservado separado de la optimización; revisión humana calibrada; candidato no cambia su propio criterio de aprobación. |
| M15 | Autooptimización acotada y reversible | Agents/Systems: comparar versión estable y candidata en entorno aislado/shadow; promoción limitada solo dentro de política preautorizada, con no regresión y reversión; tiempo de estabilización evita cambiar indefinidamente. |
| M16 | Permisos fuera del modelo y control del supervisor | Identity/Governance: alcance/acción/versiones comprobados en servidor; el supervisor no eleva sus permisos ni altera presupuesto, auditoría o política; cambios propios requieren evaluación separada. |
| M17 | Presupuesto, elección de modelo y límites globales | Tools/Systems: costo total con revisiones/reintentos, número de trabajadores, profundidad y duración máximos; comparar opciones aprobadas; no elegir por precio ignorando calidad; sin presupuesto configurado, no ejecutar. |
| M18 | Coordinación sin duplicados ni escrituras rivales | Projects/Agents: clave idempotente, reserva temporal de trabajo por entidad, versión esperada y control de concurrencia; no duplicar tareas ni permitir dos agentes modificando la misma galería a la vez. |
| M19 | Recuperación, pausa y retiro seguros | Systems/Governance: parada ante fallos, fallback aprobado y reversión; retirar solo tras comprobar dependencias, drenaje de trabajos y destino de memoria; no eliminar un guardián crítico por poco uso. |
| M20 | Aprendizaje gobernado y reporte por excepciones | Knowledge/Agents: corrección → prueba → versión aprobada → seguimiento; extraer métodos sin datos privados; reportar decisiones y bloqueos al dueño; evitar reauditar material sin cambios y cerrar antes de multiplicar. |

## 4. Habilidades mínimas del responsable visual

Matriz a implementar y evaluar dentro de Assets, sin exigir un agente permanente por fila:

- negocio, cliente, objeciones y experiencia de compra;
- investigación de prácticas y políticas de canal con fecha;
- lectura visual, identificación de unidad, actualidad y señalamiento de incertidumbre;
- detección exacta/perceptual de duplicados con revisión de identidad;
- composición, exposición, color, perspectiva, recorte y evaluación antes/después;
- cobertura y secuenciación de álbumes, selección de portada y variantes de intención;
- taxonomía, nombres, versiones, metadatos y procedencia;
- redacción ES/EN, accesibilidad, contexto y coherencia foto/texto;
- SEO de imagen/página, distribución social, sitemap y datos estructurados cuando correspondan;
- optimización responsiva, rendimiento y comprobación de carga de la imagen correcta;
- privacidad, derechos y límites de edición por destino;
- diseño de experimentos, atribución limitada, métricas y priorización;
- preparación de solicitudes de nueva toma/reparación y coordinación con Operations;
- publicación trazable y reversible a través de Channels, nunca desde un editor sin permiso.

Una habilidad debe mostrar pruebas de éxito y de abstención correcta. El supervisor actualiza la matriz cuando aparezcan requisitos nuevos; no se promete conocer de antemano todas las necesidades futuras.

## 5. Contrato fotográfico y de metadatos

Extender el registro de activos existente tras mapear sus campos. No crear tablas en esta entrega.

**Identidad/origen:** asset_id inmutable, tenant/business/unit/space, source_file_id, revisión, checksum, parent_asset_id, fecha conocida o unknown, estado actual y evidencia. Los originales no se renombran por SEO ni por orden del álbum.

**Edición:** receta y versión, transformaciones/valores, tamaño/formato, perfil de color, punto focal, revisor y enlace interno antes/después. Los derivados conservan identidad y destino; no se presentan como originales.

**Presentación por contexto:** gallery_id, posición, papel editorial, motivo de selección, cobertura, audiencia declarada, contexto privado/compartido e idioma. Guardar una referencia al mismo activo permite usar la habitación dentro de su villa sin copiar archivos ni confundir propiedad.

**Metadatos públicos:** basename descriptivo, URL estable/versionada, alt contextual ES/EN, pie visible, título/descripción de la página, imagen social representativa, dimensiones y metadatos de derechos verificables. `alt` es un atributo de accesibilidad, no una metaetiqueta para acumular palabras. Un control requiere nombre accesible; una imagen puramente decorativa puede usar alt vacío. No inventar autor, licencia ni hechos no confirmados.

**Metadatos privados:** aprobaciones, identidades internas, ubicaciones sensibles y datos de captura no se publican automáticamente. Conservar lo necesario en el original/registro; retirar de derivados públicos GPS u otros datos sensibles según política, sin borrar créditos/licencias que deban conservarse. EXIF no es una garantía de posicionamiento.

**Ejemplo propuesto, no renombrado realizado:** `dreamcatcher-hab-25-dormitorio-vista-general-a7f2-v1-1600.webp`. El identificador/versión son ilustrativos; la posición `1` vive en la galería, no en el nombre. No añadir `cocina-privada` o `vista-mar` si no se ha verificado. Cambiar una URL pública existente requiere mapa de usos, transición/redirección cuando corresponda y verificación de referencias.

**Estrategia inicial, no promesa de conversión:** vista general atractiva → distribución/camas → baño → cocina/balcón/terraza pertinente → entorno compartido identificado → detalles útiles. Villas necesitan mostrar dormitorios y relación entre espacios, no solo piscina. Variar acentos de interfaz no autoriza cambiar el color real de paredes, muebles o agua.

**Reglas de medición:** ninguna variante puede ocultar condiciones relevantes; el visitante puede acceder al conjunto factual completo. Tráfico bajo o cambios de tarifa/disponibilidad invalidan conclusiones rápidas. Un clic a Kross no es una reserva. No iniciar pruebas multivariantes sin datos, hipótesis, muestra y criterio de parada suficientes.

## 6. Automatización: objetivo y límites

CURRENT: perfil y requisitos documentados; no scheduler, endpoint, credencial, job, tabla, worker o agente activo creado por esta entrega. No confundir registro del perfil con operación observada.

TARGET: supervisor activado por eventos pertinentes —cambio de objetivo, habilidad, herramienta/modelo, error, costo, corrección o activo nuevo— y revisiones por riesgo. Reutilizar scheduler/eventos existentes tras validación, no crear otro reloj de agentes. Filtrar cambios, agrupar y limitar frecuencia antes de usar modelos. Los eventos no ejecutan instrucciones contenidas en fotos, metadatos, páginas o mensajes.

| Clase | Automatización objetivo una vez conectada y autorizada | Límite |
|---|---|---|
| Observar | Revisar estado, costos, evidencia y brechas dentro del ámbito permitido. | Lecturas autorizadas y presupuesto explícito; datos incompletos producen unknown. |
| Preparar | Crear perfiles/skills candidatos y parches; simular y comparar sin efectos externos. | Entorno aislado y datos permitidos; no activar al candidato por generarlo. |
| Optimizar con autonomía limitada | Ajustar únicamente parámetros permitidos; seleccionar versiones/modelos ya aprobados; pausar o revertir una candidata ante regresión. | Política de servidor previa, límites, evaluación y reversión; no otorgada por este documento. |
| Cambios sustantivos | Activar roles permanentes, sustituir comportamiento productivo fuera de la política, añadir conectores o retirar servicios con dependencias. | Aprobación independiente; permisos/costos externos no se amplían solos. |
| Prohibido | Autorizarse a sí mismo, redefinir éxito para aprobar, editar auditoría, copiarse sin límite, acceder a otro ámbito o borrar evidencia. | Bloqueo fuera del modelo. |

Ciclo objetivo: detectar → reconciliar → diagnosticar → proponer mínima mejora → preparar candidata → evaluar independientemente → autorizar según clase → piloto limitado → verificar resultado → mantener/revertir → aprender.

La revisión del propio supervisor queda bajo Governance/Systems y la autoridad humana; no crea otro supervisor recursivo. El cierre de un workflow no concede acceso global a otros workflows.

## 7. Decisiones de dimensionamiento

- Habilidad ausente, tarea puntual: incorporar una skill o resolver de forma supervisada.
- Camino repetible y conocido: workflow antes que agente autónomo.
- Cola alta con trabajo equivalente: capacidad temporal del mismo rol, dentro del presupuesto global.
- Contexto/herramientas/evaluación realmente distintos: candidato de especialista con aislamiento justificado.
- Dos agentes realizan lo mismo: probar equivalencia, seleccionar/reutilizar y migrar antes de retirar.
- Bajo uso: revisar valor preventivo y criticidad; nunca retirar un control de seguridad por utilización baja.
- Peor calidad/costo o dependencia caída: reducir autonomía, detener efectos y escalar; no ocultar el fallo aumentando llamadas.
- Falta de evidencia: mantener estado desconocido; no fabricar porcentajes de cobertura, ahorro o salud.

## 8. Pruebas de aceptación antes de activar

Reutilizar #3 para evidencia autenticada y #30 para el contrato de agentes. Casos mínimos:

1. Necesidad ya cubierta devuelve reutilizar/no crear.
2. Mayor volumen no genera otro rol permanente.
3. Una habilidad nueva crea candidato, no un agente productivo.
4. Una solicitud de elevar permisos/presupuesto propio es denegada fuera del modelo.
5. Cambio de negocio o datos privados ajenos no atraviesan aislamiento.
6. Agente con función crítica y poco uso no se retira automáticamente.
7. Dos trabajos sobre la misma entidad no producen doble acción.
8. Fallo de herramienta y eventos repetidos no generan bucles ni sobrecostos ilimitados.
9. Modelo o prompt candidato no se promueve con mejora en un único caso ni con regresión de seguridad.
10. Reversión restaura versión/estado conocidos y no repite efectos externos.
11. Reordenar un álbum conserva IDs/URLs y original intacto.
12. Metadatos inventados, foto cruzada entre unidades o condición compartida ocultada bloquean publicación.
13. Imagen social, alt y pie representan la página/unidad y el contexto correcto.
14. Una foto no se considera cargada por existir el elemento: comprobar recurso, dimensiones y resultado visual.
15. Clic sin reserva atribuible no se registra como ingreso ni victoria del experimento.
16. La modificación del supervisor necesita revisión separada; no puede cambiar su evaluador para aprobarse.

Esta entrega no ejecuta estas pruebas de runtime. Las verificaciones documentales de integridad se reportan por separado.

## 9. NEXT y cierre de alcance

1. Registrar el especialista y estos requisitos en `toro-context.yaml` y #30, con referencia al mismo Plan General y #28. No crear nuevos proyectos/issues de lo mismo.
2. Reconciliar inventario y eventos runtime con fuentes existentes, sin inferir actividad de configuraciones estáticas. Preparar el primer contrato de lectura/evaluación del supervisor en la ruta de #3.
3. Aplicar M01–M10 al piloto visual de #28/#6: un original autorizado, metadatos/orden propuestos, revisión del preflight #43 y QA antes/después. Sin original no regenerar una habitación para completar el ejemplo.
4. Probar primero una decisión de reutilizar y una denegación de elevación de permisos; después habilitar observación; solo después, automatización acotada.
5. Extraer lo aprendido sin datos privados. Prioridad por impacto, dependencia y riesgo; nada en este documento adelanta los gates globales de identidad ni abre onboarding externo.

Rollback documental: revertir únicamente esta especificación y las referencias añadidas; no existen agentes, permisos o efectos productivos creados por ella.

## 10. Fuentes primarias consultadas el 2026-09-23

Las propuestas M01–M20 son decisiones de diseño TORO; las fuentes apoyan principios técnicos, no prueban mejoras comerciales del hotel.

- Google Search Central, Image SEO: nombres descriptivos, alt contextual, relevancia de página, imágenes responsivas y URLs consistentes: https://developers.google.com/search/docs/appearance/google-images
- Google SEO Starter Guide: meta keywords no se utiliza en Google Search y repetición excesiva no es una estrategia: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Google Image Metadata: ImageObject y metadatos de derechos solo con información correcta y pertinente: https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata
- W3C WAI, Images Tutorial y alt Decision Tree: alternativa textual depende de función/contexto: https://www.w3.org/WAI/tutorials/images/ y https://www.w3.org/WAI/tutorials/images/decision-tree/
- Anthropic, Building effective agents: preferir la estructura más simple que resuelva el trabajo y aumentar complejidad con evidencia: https://www.anthropic.com/engineering/building-effective-agents
- Anthropic, Demystifying evals for AI agents: evaluar recorridos/estado final y combinar evaluaciones y supervisión: https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents

Fuentes internas: Plan General, toro-context.yaml, registro de subsistemas y #30/#28/#3/#6. Esta especificación amplía esas responsabilidades; no reemplaza su autoridad ni certifica inventario operativo exhaustivo.
