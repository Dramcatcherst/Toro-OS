# TORO y Dreamcatcher: densidad responsive y vídeo

Estado aprobado por Mauricio el 21 de noviembre de 2026.

## Objetivo autorizado

Mejorar ambas webs en móvil y PC, mostrar más información por pantalla y usar más vídeos en los hero. Mantener marcas, contenido y funciones existentes.

## Enfoques

1. Ajustar el diseño existente, recomendado: menor espacio vertical, columnas fluidas y vídeo progresivo. Conserva identidad y reduce el alcance de regresiones.
2. Rediseñar ambas webs por completo: permite otra composición, pero requiere nuevas referencias y una revisión visual más extensa.

Mauricio aprobó ajustar el diseño existente y pidió automatizar la tarea.

## TORO

- Conservar azul corporativo y paneles claros existentes.
- Contenedores fluidos con márgenes de 10–24 px; ampliar el área útil en monitores grandes sin alargar excesivamente las líneas.
- Mantener favoritos en dos columnas en móvil y tres en PC; adaptar módulos y herramientas al ancho disponible.
- Compactar separaciones, cabecera y contenido secundario; mantener texto auxiliar de al menos 12 px y controles táctiles de 44 px.
- No introducir un hero de vídeo delante de las tareas operativas. Usar vídeo en superficies de presentación solo cuando haya material autorizado y pertinente; actualmente no se ha localizado material de vídeo de TORO.
- Conservar autenticación, permisos, datos y destinos.

## Dreamcatcher

- Reducir la altura y el relleno del hero para acercar búsqueda y alojamientos al primer pantallazo; usar altura natural cuando el contenido necesite más espacio.
- Reducir separación entre secciones y altura de tarjetas. Ajustar carriles para mostrar más opciones sin volver ilegibles títulos ni acciones.
- Recuperar el vídeo del hero con los derivados móvil y PC existentes, previa comprobación de hashes y vigencia del manifiesto de derechos.
- Reproducción sin sonido, inline, con póster, pausa manual, pausa fuera de pantalla y al ocultar la pestaña.
- Respetar ahorro de datos y movimiento reducido; conservar imagen cuando el vídeo falle.
- Para ampliar a distintos vídeos en distintos hero, inventariar y revisar material adicional por entidad, derechos y privacidad. Dos derivados del mismo vídeo no equivalen a dos escenas distintas.
- No reutilizar el vídeo general como representación específica de otra habitación o villa.

## Fuentes y límites comprobados

- TORO: `src/features/portal/portal.module.css`, `src/app/my-toro/my-toro.module.css` y contrato de diseño del Portal.
- Dreamcatcher: repositorio `Dramcatcherst/dreamcatcher-website-vnext`, HEAD observado `cfab085d165f0eb52f54bf45a97fd1de1becd036`.
- `DreamworldHero.tsx` usa actualmente imagen; existe `HeroVideo.tsx` separado.
- `data/media/dreamworld-hero-video.json` declara dos derivados `APPROVED_FOR_WEB` con privacidad `CLEARED`. Los hashes locales coinciden con el manifiesto.
- La ampliación audiovisual no permite inventar contenido ni publicar archivos sin procedencia.

## Verificación y entrega

Comprobar 320, 390, 768, 1440 y 1920 px: sin desbordamiento horizontal ni controles cortados, foco visible, navegación por teclado, zoom y texto legible. Comparar contenido visible antes/después al mismo tamaño. Probar reproducción real, pausa, errores, movimiento reducido y ahorro de datos. Ejecutar checks de cada repositorio, incluido `npm run verify` de Dreamcatcher antes de commit o release. Preparar cambios en ramas y evidencia visual; producción requiere el gate explícito del repositorio.

## Ubicación en el plan y reversión

Presentación / TORO experience, TARGET; verificación automática por cambio en los flujos de revisión existentes. Dependencias: revisión visual y disponibilidad de material autorizado adicional. No cambiar infraestructura, datos ni integraciones. Reversión mediante revert del lote de presentación en cada repositorio. Reutilizar los componentes actuales y la política multimedia; no crear otra web, base ni sistema de publicación.
