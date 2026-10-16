# Corrección revisable — duplicado #27 en Google Vacation Rental

**Fecha de corte:** 15 de octubre de 2026, America/Costa_Rica

**Estado:** HECHA Y VERIFICADA EN KROSS; RECEPCION AGUAS ABAJO EN GOOGLE PENDIENTE

**Alcance TORO:** Dreamcatcher reference implementation → integraciones/canales → Kross como autoridad comercial → NEXT P0. No crea un proyecto, cuenta, propiedad ni feed nuevo.

## Conclusión

La custodia técnica del feed `dreamcatcherhotel` es de **Kross Booking** mediante su integración **Google Vacation Rental**, no `Google Hotel Travel`. El duplicado `#27` proviene de dos tipos de habitación Kross distintos que se exportan con el mismo título:

| Estado | Kross `idrt` | Título público | Área | Cama pública | Fotos | Evidencia de catálogo |
| --- | ---: | --- | ---: | --- | ---: | --- |
| Histórico/sombra | `28` | `#27 Intimate King Room with Projector` | 20 m² | 1 king | 14 | El detalle directo todavía responde, pero no aparece en el directorio vigente de 22 habitaciones. |
| Vigente | `43` | `#27 Superior King Room` | 30 m² | 1 king | 7 | Es el único `#27` incluido en el directorio vigente. |

La correspondencia con las dos filas del feed es concluyente por el número exacto de imágenes: la fila A de 14 fotos corresponde a `idrt=28`; la fila B de 7 fotos corresponde a `idrt=43`.

## Una sola corrección ejecutada

Se deshabilitó `dreamcatcherhotel` en **Enabled booking engines** para `Kross room_type_id = 28`, sin borrar el registro, y se conservó `room_type_id = 43` como único `#27` exportado.

Esta propuesta no cambia en el mismo lote camas, horario, texto, coordenadas, fotos, inventario, tarifas ni capacidad. En particular, la discrepancia de la fila vigente —el feed dice `beds=2`, mientras el contenido público de Kross dice `1 king bed`— queda registrada para revisión separada; no debe mezclarse con la eliminación del duplicado.

## Autoridad y evidencia

- Kross autenticado, `Channel Manager > Properties > Google status`: 23 filas Google Vacation Rental, 22 títulos únicos, `ID BE = dreamcatcherhotel`, `BE Version = 6`; Google Hotel Travel muestra 0 filas.
- Directorio público vigente de Kross: `https://dreamcatcherhotel.kross.travel/en/rooms`, 22 soluciones, un solo `#27`, `listing-idrt-43`.
- Detalle Kross histórico: `https://dreamcatcherhotel.kross.travel/book/modal-rt?idrt=28&display=htRoomDetails`, 14 imágenes.
- Detalle Kross vigente: `https://dreamcatcherhotel.kross.travel/book/modal-rt?idrt=43&display=htRoomDetails`, 7 imágenes.
- Google incluye a Kross Booking en su lista oficial de partners de Vacation Rentals: `https://support.google.com/hotelprices/answer/11946834?hl=en`.
- Evidencia estructurada: `google-hotels-kross-readback-2026-10-15.json`.

Los identificadores de cuenta, propiedad y feed del lado de Google, así como el titular nativo de Hotel Center, siguen **DESCONOCIDOS**. Esto no impide identificar al publicador técnico ni el origen Kross del duplicado.

## Recibo de ejecución autorizado

1. Estado previo: `idrt=28 > Booking Engine > Enabled booking engines > dreamcatcherhotel` estaba marcado; `hide_be`, `hide_be_listing` y `noindex` estaban desmarcados.
2. Acción única: se desmarcó solamente `dreamcatcherhotel` y se guardó la ficha antigua. No se cambió `idrt=43`, el inventario, las tarifas, la capacidad, los horarios, las coordenadas, las imágenes ni el contenido.
3. Readback tras recargar: el checkbox `idca-0` permaneció desmarcado y `Status > Booking Engine` cambió a `fa-times text-red`.
4. Readback del feed Kross: `Google Vacation Rental` pasó de 23 a 22 filas; página 2 muestra `Rows from 21 to 22 of 22`, con `Villa Toro` y una sola `#27`. La fila `#27` conserva ocupación máxima 2, check-in 15:00 y 7 imágenes, lo que corresponde a `idrt=43`.
5. Google Hotel Travel permaneció en 0 filas. No se creó ni modificó ninguna cuenta, propiedad o feed de Google.

La recepción posterior en una superficie nativa de Google sigue **DESCONOCIDA** porque Hotel Center no expone la entidad a los perfiles disponibles. El readback Kross sí demuestra que el payload del partner quedó corregido en su fuente técnica.

## Criterio de terminado

- Kross: `22` filas / `22` títulos únicos / un solo `#27` correspondiente a `idrt=43`: **PASS**.
- Cero cambios en Google Hotel Center, cuentas, propiedades o feeds.
- El registro `idrt=28` permanece recuperable en Kross: **PASS**.
- Existe readback fechado de Kross y, cuando Google procese el feed, evidencia separada de recepción aguas abajo.

## Reversión

Volver a marcar `dreamcatcherhotel` en `idrt=28 > Booking Engine > Enabled booking engines`, guardar y comprobar que Kross vuelve a publicar 23 filas con dos títulos `#27`. No recrear el registro, la cuenta, la propiedad ni el feed.
