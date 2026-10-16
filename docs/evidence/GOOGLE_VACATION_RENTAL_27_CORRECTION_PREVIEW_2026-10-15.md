# Corrección revisable — duplicado #27 en Google Vacation Rental

**Fecha de corte:** 15 de octubre de 2026, America/Costa_Rica

**Estado:** PREPARADA, NO EJECUTADA

**Alcance TORO:** Dreamcatcher reference implementation → integraciones/canales → Kross como autoridad comercial → NEXT P0. No crea un proyecto, cuenta, propiedad ni feed nuevo.

## Conclusión

La custodia técnica del feed `dreamcatcherhotel` es de **Kross Booking** mediante su integración **Google Vacation Rental**, no `Google Hotel Travel`. El duplicado `#27` proviene de dos tipos de habitación Kross distintos que se exportan con el mismo título:

| Estado | Kross `idrt` | Título público | Área | Cama pública | Fotos | Evidencia de catálogo |
| --- | ---: | --- | ---: | --- | ---: | --- |
| Histórico/sombra | `28` | `#27 Intimate King Room with Projector` | 20 m² | 1 king | 14 | El detalle directo todavía responde, pero no aparece en el directorio vigente de 22 habitaciones. |
| Vigente | `43` | `#27 Superior King Room` | 30 m² | 1 king | 7 | Es el único `#27` incluido en el directorio vigente. |

La correspondencia con las dos filas del feed es concluyente por el número exacto de imágenes: la fila A de 14 fotos corresponde a `idrt=28`; la fila B de 7 fotos corresponde a `idrt=43`.

## Una sola corrección propuesta

**Excluir `Kross room_type_id = 28` del envío Google Vacation Rental de `dreamcatcherhotel`, sin borrar el registro, y conservar `room_type_id = 43` como único `#27` exportado.**

Esta propuesta no cambia en el mismo lote camas, horario, texto, coordenadas, fotos, inventario, tarifas ni capacidad. En particular, la discrepancia de la fila vigente —el feed dice `beds=2`, mientras el contenido público de Kross dice `1 king bed`— queda registrada para revisión separada; no debe mezclarse con la eliminación del duplicado.

## Autoridad y evidencia

- Kross autenticado, `Channel Manager > Properties > Google status`: 23 filas Google Vacation Rental, 22 títulos únicos, `ID BE = dreamcatcherhotel`, `BE Version = 6`; Google Hotel Travel muestra 0 filas.
- Directorio público vigente de Kross: `https://dreamcatcherhotel.kross.travel/en/rooms`, 22 soluciones, un solo `#27`, `listing-idrt-43`.
- Detalle Kross histórico: `https://dreamcatcherhotel.kross.travel/book/modal-rt?idrt=28&display=htRoomDetails`, 14 imágenes.
- Detalle Kross vigente: `https://dreamcatcherhotel.kross.travel/book/modal-rt?idrt=43&display=htRoomDetails`, 7 imágenes.
- Google incluye a Kross Booking en su lista oficial de partners de Vacation Rentals: `https://support.google.com/hotelprices/answer/11946834?hl=en`.
- Evidencia estructurada: `google-hotels-kross-readback-2026-10-15.json`.

Los identificadores de cuenta, propiedad y feed del lado de Google, así como el titular nativo de Hotel Center, siguen **DESCONOCIDOS**. Esto no impide identificar al publicador técnico ni el origen Kross del duplicado.

## Ejecución posterior, solo con autorización

1. Capturar el estado previo de la regla de exportación de `idrt=28`.
2. Desactivar únicamente su inclusión en Google Vacation Rental; no borrar el tipo de habitación ni modificar `idrt=43`.
3. Recargar Kross y verificar que Google Vacation Rental muestre 22 filas, 22 títulos únicos y exactamente un `#27`.
4. Tras la propagación normal del partner, comprobar recepción aguas abajo en Google sin crear activos nuevos.

## Criterio de terminado

- Kross: `22` filas / `22` títulos únicos / un solo `#27` correspondiente a `idrt=43`.
- Cero cambios en Google Hotel Center, cuentas, propiedades o feeds.
- El registro `idrt=28` permanece recuperable en Kross.
- Existe readback fechado de Kross y, cuando Google procese el feed, evidencia separada de recepción aguas abajo.

## Reversión

Restaurar exactamente la inclusión previa de `idrt=28` en Google Vacation Rental. No recrear el registro, la cuenta, la propiedad ni el feed.
