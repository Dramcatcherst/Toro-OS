# Dreamcatcher · Incidente P0 Kross #27: tipologías, enlaces, WeSpeak y distribución
**Fecha de evidencia:** 2026-10-17, America/Costa_Rica  
**Ámbito:** Dreamcatcher Hotel, módulo TORO Revenue/Distribution + TORO Comms/Tools + Data & Integrations  
**Estado:** INTERNO CORREGIDO / PMS Y OTA SIN VERIFICACIÓN FINAL  
**Autoridad:** Kross para inventario, reservas, planes y precios activos; Supabase para identificadores TORO y tareas; Airtable como superficie de control; WeSpeak/OTA para recepción efectiva.

## Decisión ejecutiva y por qué no renombrar

Una única habitación física **#27** aparece en el Planner de Kross dos veces (captura del propietario del 17/10): **`#27 [KING]`** y **`#27 KING INTIMA CON ...`**. La evidencia de proveedor Kross del mismo día (receipt de TORO ya integrado en main en PR #325) separó las dos fichas:

| Identidad | Kross | Registro/comportamiento |
|---|---|---|
| Habitación física | `27` / `DC-ROOM-27` | Una sola habitación, Villa Toro, segundo piso, máximo 2 |
| Tipología vigente | `idrt=43` | `#27 Superior King Room`, 30 m² y 7 fotos publicados; descripción aún menciona proyector |
| Tipología anterior | `idrt=28` | `#27 Intimate King Room with Projector`, 20 m² y 14 fotos; **deshabilitada pero recuperable** |
| URL pública canónica verificada | `https://dreamcatcherhotel.kross.travel/27?r=1&lang=es` | Responde página #27 (precios solo al indicar fechas) |
| URL antigua | `/es/habitaciones?idrt=28` | Redirige a inicio en comprobación pública |
| Otro alias antiguo | `/27-king-room-superior` | HTTP 404 en comprobación pública |
| Mapeo TORO actual | `Kross type id 43` | Corregido en Supabase + Airtable el 17/10, sin PMS write |

**La captura NO prueba sobreventa**: puede tratarse de una fila histórica visible en Planner o una segunda unidad física/sellable aún activa. Corregir esa incertidumbre dentro de Kross requiere acceso administrativo y lectura de tipo, unidad, estado, dependencias, reservas y canales.

**Regla de propietario:** el nombre del campo técnico **Type** de Kross determina correspondencias con WeSpeak y destinos ya publicados. Normalmente el Type nominal se mantiene en un número de habitación. No renombrar, deshabilitar/rehabilitar, borrar, reutilizar, fusionar ni recodificar Type, slug, idrt ni unidad simplemente para homogeneizar texto/estética. Usar campos de título comercial separados de la clave técnica; una migración de Type exige tabla de alias, validación de consumidores, redirecciones y rollback.

## Hecho / no hecho

**HECHO (persistencia de datos TORO, no Kross):**
1. `integrations.kross_entity_mappings`: fila `860c9c59-3268-4494-aa1d-6b99b89a823d` `room:27` actualizada de `28` a `43`, marca de comprobación 17/10 y nota de procedencia y rollback. Se conserva URL `/27`. La operación devolvió la fila corregida.
2. Airtable Central `kross_references` registro `recOEBS8T5iveOhPq`: `kross_room_type_id=43`; nota advierte que `reference_key` legado no se renombra por compatibilidad.
3. Airtable Master Brain `External Mappings` `recenLSIwNVuZ5Dpk`: `external_id=43`, cuatro campos de enlaces públicos reemplazados con URL `/27`, `needs_review=true`, `do_not_rename_external=true`; `mapping_key` histórico `room:27:kross_booking_engine:28` queda alias de compatibilidad, NO identidad vigente.
4. Airtable Master Brain `12 Governance Rules` `recabekDMBiBMlg8E`: regla activa de protección del Type/slug/WeSpeak.
5. Airtable Central `validations` `recFkvi6hRTZBpHr8`: incidencia crítica abierta `KROSS-ROOM27-TYPE-DUPLICATE-20261017`.
6. Supabase `operations.tasks`: `6061be04-555b-4518-86bf-132f19d14d91`, `kross_room27_duplicate_type_and_channel_validation_20261017`, estado `blocked`, prioridad `critical`, subsistema existente `revenue_booking_stack` y habitación física enlazada.

**NO HECHO / no demostrado:** ocultar/eliminar segunda fila en Planner, probar Kross administrador desde esta sesión, reconfigurar Type, WeSpeak, Booking/Expedia/Airbnb/Agoda, garantizar cierres de inventario, verificar restricciones y precio en vivo, ni cambiar precios/promociones/políticas. El navegador conectado respondió `Browser access requires the originating browser context`; un cliente externo no autenticado no demuestra configuración administrativa. Queda expresamente prohibido declararlos terminados sin readback del proveedor.

## Diferencia de contenido y configuración comercial

- **Información física pendiente de fuente aprobada:** 20 vs 30 m²; 14 vs 7 imágenes; título `Superior King` vs `Intimate King with Projector`; fotografía/posición/disposición. Ambas fichas declaran una cama King y hasta 2 huéspedes. Registros internos anteriores atribuyen proyector (no TV) a la habitación física #27; confirmar funcionamiento y fotos para la ficha vigente. No copiar metraje o fotos sin respaldo físico.
- **Términos públicos de motor Kross observados 17/10:** depósito del 50%, saldo 7 días antes, cancelación con referencia a 7 días y cargo total en ciertas cancelaciones tardías. **Política interna activa** en Airtable Central `sops` `policy_cancellation`: gratis hasta 5 días; cobro total 5 días antes/no reembolso. La diferencia es material. Resolver según el contrato/plan de tarifas realmente aplicable al huésped y canal; no modificar retrospectivamente reservas aceptadas.
- **Tarifas:** revisar DREAM RATE y DREAM+BREAKFAST, importes diarios USD/CRC, impuestos/comisiones/cargos por limpieza, ocupación base de dos, huéspedes adicionales, mascotas y desayuno opcional USD 15 cuando corresponda. Comparar **precio final que ve huésped** versus base Kross, no copiar total Booking CSV de comisión como tarifa final.
- **Promociones:** comprobar vigencia de promociones 2026/27, acumulación, restricciones y redondeos. Hay antecedente de promoción rotulada MARCH 2026 aplicada en una búsqueda para marzo 2027; requiere verificación actual, no se afirma que hoy esté activa. Verificar también TICOS y descuentos directos sin forzar cambios.
- **Venta múltiple bajo una propiedad:** habitaciones individuales y villas del hotel son modalidades del mismo inventario físico, no habitaciones adicionales; los productos combinados deben bloquear reciprocamente sus unidades.

## Ruta de resolución dentro de los sistemas

1. **Preflight Kross (solo lectura):** abrir Planner 17–20/10, buscar ambas filas por unidad física, id de unidad, Kross type 43/28, estado comercial/operativo, reservas previas y futuras; capturar configuración y exportar antes de cambios. Contrastar #26, #27, #28 para encontrar patrón de Type nominal. Si la fila vieja es solo histórica, ajustar la vista sin tocar reservas; si es unidad todavía vendible, retirar solo su distribución futura tras confirmar reservas/enlaces.
2. **Inventario y canales:** comprobar mapa físico único `DC-ROOM-27 -> idrt=43` y `28 -> legacy`; revisar Kross Channel Manager para Booking.com, Expedia, Agoda, Airbnb, motor directo, y si aplica iCal. Una OTA independiente con anuncio en borrador no equivale a publicada/activa. Validar fechas de prueba (días entre semana, fin de semana, temporada alta y promoción marzo 2027) sin confirmar reserva real; comprobar disponibilidad idéntica y ausencia de doble venta cuando la unidad esté ocupada y cuando la Villa Toro tenga bloqueo compuesto.
3. **Planes de precio:** inspeccionar tarifas, promociones, suplementos e impuestos de 43 comparando #26/#28 y fechas idénticas, sin asumir paridad de precio final entre canales por comisiones/impuestos/cargos distintos. Determinar si promociones se apilan por error. Ningún ajuste hasta evidencia de tarifa/condiciones acordadas.
4. **WeSpeak y links:** inventariar todas las referencias al número físico 27, Type exacto, idrt 43 y slug antiguo 28 en enlaces públicos, WApp, QR, templates de WeSpeak y cotizaciones. Test ES/EN con datos sintéticos, sin mensajes a huéspedes reales, y verificar redirecciones/alías antes de retirar cualquier campo. No renombrar Type técnico para publicar un título comercial. Mantener control reversible.
5. **Contenido:** descripción ES/EN/FR de 43 bajo el mismo patrón de las otras habitaciones (dato rápido, detalle físico verificable, servicios, condiciones, galería, CTA). Separar título comercial de Type, conservar display internacional coherente y no afirmar 30 m², mascotas o proyector sin autorizar su evidencia física/canal.
6. **Readback:** recargar Planner y Kross Type; probar link con fechas y 2 adultos; ver inventario y precio final en cada OTA/WeSpeak; revisar 1 reserva futura, 1 pasada y la política contractual sin alterar datos del huésped; adjuntar evidencia segura al ledger TORO; validar reversión en sandbox si aplica.

## Criterios para cerrar P0

- Una sola habitación física 27 y **máximo una unidad comercial vendible** por fecha/propiedad/villa; tipo 43 como vigente y 28 solo histórico no vendible; no se pierden reservas del tipo antiguo.
- Todas las OTA que realmente estén activas para #27, motor directo y WeSpeak muestran la identidad/fecha/tarifa correctas y cierre recíproco; no inferir activación para anuncios en borrador.
- Sin enlaces viejos rotos bajo control del hotel, o redirecciones verificadas; 100% de destinos testeados y registrado Type técnico intacto.
- Política cobro/cancelación idéntica dentro de cada plan, canal y contrato vigente, con regla de 5/7 días resuelta explícitamente.
- Tarifa y promo verificadas por temporada/canal; galería y descripción corresponden a una habitación física inspeccionada.
- Evidencia `before/after`, aprobaciones, rollback y QA Kross + channel readback asociados a la tarea canónica anterior.

**Fuente antecedente:** [Auditoría nativa con corrección 28→43](../evidence/TRIPADVISOR_NATIVE_AUDIT_2026-10-17.md); [Plan General TORO](../product/TORO_BRAIN_GENERAL_PLAN.md); [PR #325](https://github.com/Dramcatcherst/Toro-OS/pull/325). No crear otro Plan General ni activar nuevas automatizaciones.
