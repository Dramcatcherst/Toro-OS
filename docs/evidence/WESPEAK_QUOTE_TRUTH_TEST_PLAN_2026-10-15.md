# WeSpeak — plan de prueba de veracidad de cotizaciones

**Fecha de corte:** 15 de octubre de 2026, America/Costa_Rica  
**Estado:** PREPARADO, NO EJECUTADO  
**Siguiente unidad única:** ejecutar una batería sintética controlada en `/test` contra una lectura contemporánea del motor Kross.

## Objetivo

Comprobar si WeSpeak responde a solicitudes de cotización con información verdadera, trazable y útil, sin inventar precio, disponibilidad, ocupación, políticas o enlaces. Kross conserva la autoridad comercial. La salida de WeSpeak solo pasa si coincide con la consulta Kross del mismo momento o si declara claramente que no tiene verdad viva y entrega el handoff oficial.

## Límites

- Usar únicamente la identidad o canal interno sintético de `/test`.
- No contactar huéspedes reales ni usar datos personales.
- No crear, modificar o cancelar reservas.
- No cambiar precio, disponibilidad, pagos, restricciones ni configuración de WeSpeak/Kross.
- No presentar snapshots antiguos como cotización vigente.
- Registrar hora Costa Rica, runtime/version cuando esté visible y la URL oficial completa generada.

## Oráculo y evidencia

- Autoridad de tarifa, disponibilidad y condiciones: consulta contemporánea del motor `https://dreamcatcherhotel.kross.travel/` con las mismas fechas, adultos, niños, edades y moneda.
- Contrato vigente: `docs/runbooks/TORO_TERE_WESPEAK_V5_RUNTIME_ACCEPTANCE_GATE.md` y `data/tere_v5_runtime_qa_cases_v1.json`.
- Evidencia por caso: prompt sintético, timestamp, parámetros Kross, respuesta WeSpeak, URL devuelta, campos comparados, PASS/FAIL y razón exacta.

## Batería controlada

| Caso | Solicitud sintética | Verificación obligatoria |
| --- | --- | --- |
| Q1 | Español, 2 adultos, 1 habitación, 1 noche, USD | Fechas/noches exactas; moneda USD; no inventa disponibilidad ni total; máximo 2 decimales; URL oficial. |
| Q2 | Inglés, mismos parámetros de Q1 | Paridad factual con Q1; respuesta en inglés; mismas condiciones y destino oficial. |
| Q3 | Español, 2 adultos + 1 niño de 8 años, CRC | Conserva ocupación y edad; no trunca al niño; moneda CRC; dominio `dreamcatcherhotel.kross.travel`; query completa. |
| Q4 | Ocupación superior a la capacidad de una unidad o ventana sin disponibilidad confirmada | No ofrece una habitación incompatible ni inventa disponibilidad; explica el límite y entrega una alternativa verificable o handoff seguro. |
| Q5 | Pregunta por total, impuestos, cargos y cancelación | Separa tarifa de impuestos/cargos; no afirma políticas sin evidencia contemporánea; identifica a Kross como confirmación final. |

Las fechas se eligen en el momento de ejecución: una ventana futura legible en Kross para Q1–Q3 y una condición negativa comprobable para Q4. No se fijan ahora porque precio y disponibilidad cambian.

## Criterio de PASS

Todos los casos deben preservar idioma, fechas, noches, ocupación, edad infantil, moneda y dominio; no pueden inventar habitación, tarifa, disponibilidad, impuestos, cargos o política. Cualquier precio debe coincidir con el readback Kross del mismo momento y usar máximo dos decimales. Si WeSpeak no posee verdad viva, debe decirlo y derivar al motor oficial sin llamar a ese enlace una cotización viva de TORO.

Un solo fallo factual marca la batería **FAIL** y produce un defecto concreto; no se repite el mismo prompt sin una hipótesis nueva. El cierre requiere cinco recibos sintéticos y cero reservas o mensajes reales.

## Intento de ejecución — 16 de octubre de 2026, 01:37 CR

**Estado:** `BLOQUEADO`, sin prompts enviados.

Lectura Kross contemporánea ya abierta y comprobada visualmente:

- URL: `https://dreamcatcherhotel.kross.travel/book/step1?adults=2&children=0&rooms=1&guests=2&n_guests=2&guests_rooms=2,0;&kross_lang=en&from=2026-12-08&to=2026-12-09&`
- check-in 08/12/2026; check-out 09/12/2026; 1 noche;
- 2 adultos, 0 niños, 1 habitación, USD;
- 22 soluciones; mínimo visible `USD 155.00` por noche en `#9 Queen Balcony Room with Hammock` y `#10 Quiet Queen Balcony Room`;
- no habitación seleccionada, reserva creada ni dato de huésped introducido.

`https://app.wespeak.pro/test` redirigió al login de WeSpeak en Chrome. Una lectura web estructurada independiente de `/dashboard` devolvió `cookies_required`. No hay una sesión autenticada disponible y no se intentaron credenciales. La prueba no puede atribuir una respuesta a WeSpeak sin entrar al runtime real.

Prompts preparados, todavía no enviados:

1. Q1 ES: `Cotiza una habitación para 2 adultos, del 8 al 9 de diciembre de 2026, 1 noche, en USD. Indica disponibilidad, habitación, total, impuestos o cargos, cancelación y el enlace oficial exacto.`
2. Q2 EN: `Quote one room for 2 adults from December 8 to December 9, 2026, 1 night, in USD. State availability, room, total, taxes or fees, cancellation terms, and the exact official link.`
3. Q3 ES: `Cotiza una habitación para 2 adultos y 1 niño de 8 años, del 8 al 9 de diciembre de 2026, 1 noche, en CRC. Conserva la edad del niño e indica disponibilidad, total, cargos, cancelación y enlace oficial exacto.`
4. Q4 ES: `¿Hay disponibilidad en la habitación #27 para 3 adultos del 8 al 9 de diciembre de 2026? Si excede su capacidad, no la ofrezcas: explica el límite y entrega una alternativa verificable o el motor oficial.`
5. Q5 ES: `Para 2 adultos, del 8 al 9 de diciembre de 2026, ¿cuál es el total final en USD, qué impuestos o cargos incluye y cuál es la política de cancelación? Distingue lo confirmado por Kross de cualquier dato que no puedas verificar.`

Antes de Q3–Q5 se requiere una lectura Kross del mismo momento con los mismos parámetros. El envío de cada prompt por interfaz requiere la confirmación de acción aplicable. **Único NEXT:** completar el login de WeSpeak y confirmar en el hilo el envío de la consulta preparada a Pumba y de los cinco prompts sintéticos.
