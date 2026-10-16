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
