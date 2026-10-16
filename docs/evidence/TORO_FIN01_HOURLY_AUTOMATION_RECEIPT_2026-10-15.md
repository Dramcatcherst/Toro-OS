# Recibo · automatización horaria FIN-01

**Fecha:** 2026-10-15 · `America/Costa_Rica`  
**Automatización reutilizada:** `toro-alegra-cada-30-minutos`  
**Nombre guardado:** `TORO · FIONA · FIN-01 cada hora`  
**Estado leído de retorno:** `ACTIVE`

## Cambio autorizado y verificado

La automatización financiera existente pasó de pausada/cada 30 minutos a activa/cada hora, en el minuto 00. Se conservó su identidad y destino; no se creó un segundo scheduler. La configuración guardada fue releída desde la aplicación y desde su archivo nativo; nombre, estado, cadencia y prompt coinciden.

## Contrato operativo

- lee el corte financiero vigente y la única tarea `NEXT`;
- ejecuta una sola unidad acotada y verificable;
- permite lotes hasta 20 veces mayores solo con la misma fuente, autoridad, contrato y pruebas;
- aplica los 50 controles como checklist material, sin inflar conteos;
- permanece silenciosa cuando no existe cambio material;
- notifica únicamente avance verificable, terminación, fallo o decisión requerida;
- evita concurrencia sobre archivos canónicos y, si detecta otro escritor, deja solo recibo/delta;
- conserva exactamente una siguiente acción.

## Prohibiciones guardadas

Writer Alegra permanece apagado. La tarea no puede escribir en Alegra, Kross, bancos, Dropbox, Airtable o Supabase; aplicar DDL, RLS, grants, backfill o permisos; asentar, facturar, pagar, declarar, cerrar períodos, reclasificar historia, cargar documentos, enviar mensajes, desplegar ni crear otro plan, base, agente, scheduler o ledger.

## Alcance de la evidencia

El readback prueba la configuración y el estado activo de la tarea; no prueba una futura ejecución, entrega de notificación, recepción de nuevas fuentes ni resultado contable. La primera corrida material deberá dejar su propio recibo.

## Reversión

Pausar la misma automatización y restaurar su configuración previa si Mauricio lo solicita o si una ejecución viola el contrato. No existe cambio en sistemas financieros que revertir por esta actualización.
