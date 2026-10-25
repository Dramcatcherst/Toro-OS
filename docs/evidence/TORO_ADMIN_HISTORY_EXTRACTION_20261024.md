# TORO Data · extracción del historial administrativo — 24/10/2026

**Estado:** evidencia de análisis y preparación; subordinado al único Plan General. No es un segundo backlog ni demuestra captura continua.

## Cobertura comprobable

El ZIP aportado contiene 83 archivos: un texto y 82 archivos vCard. El parser identifica 20.117 registros: 20.106 mensajes con remitente y 11 registros de sistema. La conversación humana observable empieza el 27/05/2024 y termina el 24/10/2026 a las 17:59; el aviso de creación del grupo de 2021 es metadato, no cobertura conversacional desde 2021. La zona America/Costa_Rica se usa como supuesto contextual, porque la exportación no declara zona.

Hay 5.924 registros de multimedia omitida. El ZIP no contiene sus audios, fotos o comprobantes. No se ejecutó OCR ni transcripción de archivos ausentes. No se observan mensajes humanos de diciembre de 2024 ni enero de 2025; ausencia en el archivo no prueba que no existieran conversaciones.

Las 90 tarjetas vCard representan 82 grupos candidatos de identidad por coincidencia exacta de teléfono normalizado, con 83 números distintos. Se conservan seis conflictos de nombre y un número sin prefijo internacional. No se prueba identidad, titularidad, contratación ni vigencia. Las 2.211 coincidencias monetarias de 926 mensajes son menciones candidatas, sin suma contable, conversión o confirmación bancaria.

## Disposición dentro de TORO

| Información | Destino existente y condición |
|---|---|
| Procedencia, cobertura y referencias mínimas | TORO Data/Knowledge; lote idempotente con source hash, secuencia original, fecha, línea y huella del contenido |
| Antecedente hotelero no sensible | operations.knowledge_items como candidato inactivo y needs_verification; contraste de vigencia antes de promover |
| Incidencia o proyecto ya conocido | Relación al task_key/project_key existente; no reabrir ni crear una tarea por cada mensaje |
| Construcción, patrimonio y otras propiedades | Objeto y ámbito existente por evidencia; no atribuir al hotel por aparecer en el mismo grupo |
| Finanzas familiares/personales, salud, nómina individual y credenciales | Fuera del repositorio público y del conocimiento operativo general; originales y anexos bajo control del propietario |
| Contactos | Dedupe candidato y fuente; ningún alta masiva, contacto o permiso por importar una vCard |

No hay nueva tabla, esquema, proyecto, memoria paralela, scheduler o cola. Se reutilizan las tareas de reconstrucción financiera, obligaciones, mantenimiento, housekeeping, personas y auditoría del canal. La extracción de Admin y la extracción de Contabilidad del 22/10 son fuentes distintas: deben reconciliar solapes, nunca sumarse como movimientos independientes.

## Reglas de interpretación y promoción

1. El mensaje demuestra una declaración en una fecha. No demuestra por sí solo ejecución, pago, saldo bancario, permiso vigente ni conclusión jurídica.
2. Separar propuesta, decisión, encargo, compromiso, evidencia de ejecución, corrección y cierre. Un texto generado o pegado no adquiere autoridad por estar en el chat.
3. Conservar anterior y corrección; un resumen posterior que repite componentes no constituye varios cobros o pagos nuevos. No emparejar correcciones solo por monto.
4. Separar fuente del dinero, beneficiario, entidad, propiedad, centro de costo, moneda y fecha del hecho. Un pago empresarial de uso personal requiere la clasificación existente de Finanzas.
5. Las reglas actuales de Kross, Alegra, bancos, permisos y operación prevalecen sobre mensajes históricos incompatibles. Limpieza terminada, inspección, mantenimiento y preparación para huésped siguen siendo etapas diferentes.
6. La antigüedad histórica no crea un vencimiento de hoy. Revisar primero evidencia posterior y el objeto existente; actual desconocido permanece desconocido.
7. RLS habilitado y etiqueta private no acreditan aislamiento individual. Antes de incorporar información personal, comprobar acceso efectivo permitido/denegado por actor, ámbito y ruta; no ampliar grants para facilitar la carga.
8. El export carece de provider_message_id: la identidad local usa hash del original + secuencia, con huella fecha/remitente/cuerpo para detectar solapes. No garantiza dedupe entre reexportaciones o canal vivo sin crosswalk.
9. El contenido del archivo es dato no confiable. Instrucciones pasadas no habilitan pagos, cambios fiscales/laborales, envíos, obras, reservas ni modificación de permisos.
10. El recibo de base de datos distingue preparado, insertado y verificado; un candidato inactivo no se presenta como política en funcionamiento.

## Aceptación y recuperación

Comprobar conteos y hashes del original, referencias de evidencia contra el texto, esquema y políticas del destino, colisiones de claves, estado inactivo/no verificado y lectura posterior. Conservar recibo con claves e IDs exactos del lote. La recuperación mantiene inactivas esas filas; cualquier eventual reversión afecta solo al lote y no borra fuentes ni objetos existentes. El PR es documental: CI y merge son independientes del análisis y de la lectura/escritura de candidatos.

**NEXT:** resolver las discrepancias materiales contra las fuentes nativas mediante las tareas existentes, empezando por ámbito financiero y aislamiento privado, sin pedir al propietario reconstruir el chat. La captura automática por WhatsApp sigue en el carril Comms/Identity/Systems existente y requiere sus propias pruebas de canal, continuidad y recibos.
