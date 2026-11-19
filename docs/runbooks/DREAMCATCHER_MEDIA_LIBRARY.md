# Fototeca Dreamcatcher — contrato operativo

Anexo subordinado al [único Plan General TORO](../product/TORO_BRAIN_GENERAL_PLAN.md). Mandato de gestión del propietario del 12 de noviembre de 2026. Este documento define el trabajo; el estado y los recibos reales se consultan en el control privado existente. Una regla o una tarea programada no prueba que todas las fotos hayan sido procesadas.

## Una sola cadena de autoridad

| Capa | Responsabilidad |
|---|---|
| Dropbox | Custodia de originales, entregas, campañas y evidencias. Conservar IDs, alias y permisos. |
| Supabase | Manifiesto de archivos, intake, activos curados, disposiciones y recibos en tablas existentes. |
| Airtable | Proyección de revisión humana; preservar los registros y no abrir otra base maestra. |
| GitHub | Contratos, recetas y cambios revisables. Excluir fotos privadas, originales y secretos. |
| Vercel | Entrega de derivados públicos aprobados mediante proyectos existentes. |

El registro rector es `toro_media_master_operating_contract_v1`; la ampliación se conserva en `full_library_processing_20261112`. El proyecto sigue siendo `dreamcatcher_website`, con la tarea de conciliación de media existente. La programación autorizada para procesar archivos no convierte a ese flujo en escritor de la web o de Kross.

## Estructura compatible

Conservar la biblioteca oficial existente: `00_system`, `01_library`, `02_manifests`, `03_airtable`, `04_exports` y los componentes ya instalados. Los nuevos lotes usan destinos verificables dentro de esa estructura; no reorganizar masivamente antes de conciliar referencias.

- Original recibido: inmutable; su condición de original de cámara debe demostrarse aparte.
- Selección: lista de IDs y orden editorial, sin duplicar originales para cada canal.
- Derivado: ID propio, original padre, receta, dimensiones, hash, versión y canal.
- Pendiente: identidad, derechos, calidad o ámbito aún no resueltos.
- Histórico: campañas y fotografías anteriores con fecha y motivo; no confundirse con oferta vigente.
- Eagle: sus paquetes y metadatos se manipulan con su contrato compatible, nunca con renombrados sueltos desde otro sistema.

Nombre nuevo recomendado: `dc-{entidad}-{escena}__{id-corto}__{rol}-v01.ext`. El ID canónico no depende del nombre. Conservar el filename original y no fabricar fecha de captura a partir de una entrega o descarga. No renombrar archivos ya consumidos sin mapa de alias y comprobación de consumidores.

## Treinta mejoras y criterio de aceptación

1. **Una sola fototeca y autoridades por sistema.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.
2. **Inventario completo de la carpeta fuente.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.
3. **Fuentes y enlaces repetidos consolidados.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.
4. **Identidad por ID nativo, no por nombre.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.
5. **Verificación SHA-256 y hash de Dropbox.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.
6. **Ingesta idempotente y preservación del trabajo previo.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.
7. **Linaje de archivo, alias y fuente original.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.
8. **Clasificación original, copia, miniatura y derivado.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.
9. **Protección de bibliotecas Eagle.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.
10. **Identidad de habitación independiente del filename.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.
11. **Separación de hotel, otras propiedades y fotos privadas.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.
12. **Integridad, resolución y formato reales.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.
13. **Fechas de captura separadas de fecha de entrega.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.
14. **Puntuación editorial explicable de 0 a 100.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.
15. **Selección A/B/C específica por canal y uso.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.
16. **Diccionario de etiquetas y sinónimos ES/EN.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.
17. **Duplicados exactos por hash de contenido.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.
18. **Similitud visual para agrupar series.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.
19. **Preferencia por la mejor versión fuente.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.
20. **Derivados sin alterar el original.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.
21. **Recortes y punto focal para móvil y escritorio.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.
22. **Versiones para OTA, web, redes, correo y WhatsApp.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.
23. **Open Graph, imagen de enlace y favicon de marca.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.
24. **Búsqueda semántica y colecciones por intención.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.
25. **Derechos y permiso público como filtros independientes.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.
26. **Privacidad de personas y revisión de imagen exacta.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.
27. **Cuarentena de descartes con motivo.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.
28. **Retirada con revisión de consumidores y recuperación.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.
29. **Versiones, recibos y reversión del lote.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.
30. **Continuidad por lotes, cobertura y cierre del 100%.** Conservar su estado y evidencia por lote en el registro privado; una propuesta no se cuenta como mejora operativa ejecutada.

## Calidad y selección

Puntuación editorial preliminar de 0 a 100: técnica 35, claridad comercial 25, identidad de marca 15, encaje de canal 15 y singularidad 10. Conservar desglose, fecha, método, observaciones y confianza. No representa conversión medida. Seleccionar por objetivo: la mejor imagen de una hamaca puede no ser la mejor portada de una habitación. Mantener A/B/C y orden de galería por superficie sin duplicar el archivo fuente.

Identidad exacta, derechos, privacidad y veracidad son filtros independientes. Un puntaje alto no los compensa. No inferir habitación por un filename heredado ni convertir una piscina común en privada. Una imagen sin EXIF no prueba generación artificial ni fecha de captura. No inventar elementos físicos al mejorar fotografías.

## Duplicados y retiradas

SHA-256 de bytes y hash del proveedor tienen funciones distintas. Agrupar duplicados exactos por contenido; similitud perceptual solo propone series o variantes. Una copia de respaldo, un crop publicado, una miniatura Eagle o una versión de distinta calidad puede ser necesaria. Antes de retirar una copia: identificar master íntegro y accesible, comprobar referencias y consumidores, preservar metadata y restauración, registrar motivo y aplicar la autorización existente. No vaciar papelera ni eliminar permanentemente. Mala calidad no significa falta de valor histórico u operativo.

## Continuidad y cobertura

Procesar lotes acotados desde el checkpoint, usando ID y versión para evitar repeticiones. Actualizar por comparación de versión y verificar el resultado. No publicar automáticamente ni conceder aplicaciones o permisos nuevos. Si una fuente exige autorización o falla, conservar el bloqueo preciso y continuar las independientes.

Separar inventariado, bytes verificados, revisión visual, identidad, derechos, selección y publicación. El 100% requiere universo autorizado completo y conciliado, disposición verificable de cada original/versión, fuentes recuperables y ausencia de pendientes ocultos. Miniaturas y derivados no aumentan el número de fotografías únicas. Mantener fotos personales y otras propiedades en sus ámbitos y accesos existentes. Un campo de custodia no acredita el lugar fotografiado. Solo cerrar la programación específica cuando ese cierre tenga evidencia.
