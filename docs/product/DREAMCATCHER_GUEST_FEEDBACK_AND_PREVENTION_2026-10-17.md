# Dreamcatcher — calidad, comentarios privados y prevención

**Estado:** PROPUESTA DOCUMENTAL, sin implementación ni despliegue.  
**Directivas:** propietario 17/10/2026; delegación rutinaria verificada 22/10/2026.  
**Autoridad:** [Plan General único](TORO_BRAIN_GENERAL_PLAN.md), Constitución y contratos de ejecución vigentes.  
**Vinculación:** `dreamcatcher_hotel_reinvestment_2026` dentro de `dreamcatcher_hotel_master`; reseñas bajo `hotel_reviews_kross_google_routing_20260929`. Complementa el [documento de desayuno existente](DREAMCATCHER_BREAKFAST_ECONOMICS_MASTER_PLAN_V1.md). No crea otro plan maestro, base, agente, backlog, calendario ni scheduler. La delegación del 22/10 cubre respuestas ordinarias verificadas y contenido factual sustentado; no activa encuestas ni elimina los gates de identidad, idioma, estado nativo, consentimiento y recibo.

## 1. CURRENT / TARGET / NEXT / FUTURE

- **CURRENT:** el propietario prioriza elevar la calidad del hotel actual. La reconversión a bar queda aplazada. Las villas son modalidades de venta de las mismas unidades físicas, no inventario adicional. El desayuno depende de la tarifa contratada. Existen registros de reseñas, tareas, activos y una matriz preventiva por habitación; su existencia no demuestra un circuito de atención desplegado.
- **TARGET:** detectar problemas durante la estancia, resolverlos con responsable y evidencia, convertir recurrencias en prevención y decidir inversiones usando capacidad física e ingresos no duplicados.
- **NEXT:** validar el formulario y su receptor con casos sintéticos; probar asociación con estancia/unidad y casos existentes; conciliar disponibilidad, aperturas y composición de villas por vigencia; completar manuales, último servicio y responsable por activo antes de programar mantenimiento.
- **FUTURE:** recordatorios por el transporte existente, calendario preventivo por equipo, recomendaciones de inversión y cambios de paquetes tarifarios. Ninguno se activa por este documento. La tokenización sigue siendo factibilidad jurídica y financiera, no emisión.

Los datos patrimoniales, reservas identificables, uso interno por habitación, incidentes de seguridad y comprobantes permanecen en las fuentes privadas autorizadas. Este anexo contiene contratos y diseño, no un inventario privado.

## 2. Verdad física, comercial y financiera

1. Una habitación física conserva un identificador estable. Los nombres comerciales y códigos requieren vigencia temporal.
2. Una villa o venta total del establecimiento enlaza componentes físicos y fechas. No agrega capacidad, metros construidos o activos.
3. Un ingreso se cuenta una vez por documento/reserva/partida de origen. No sumar un total con su desglose ni excluir ventas genuinas de villas por ser agrupaciones. El reparto por habitación es una asignación analítica trazable, no otro ingreso.
4. Separar estancia comercial, uso interno, canje, avería, mantenimiento, bloqueo técnico por venta de una agrupación y preapertura. Un bloqueo no prueba automáticamente avería o demanda insatisfecha.
5. Registrar fecha operativa, primera estancia comprobada y primer movimiento observado como campos diferentes. Un código en un export mensual no demuestra la fecha de inauguración física.
6. Mostrar ocupación comercial sobre noches realmente vendibles y utilización física total como métricas distintas. Mostrar por separado noches de uso interno; no imputarles ingreso ficticio.
7. Comparar cohortes con meses operativos y temporadas equivalentes. Si faltan aperturas, bloqueos o distribución de villas, mantener el indicador como NO CERTIFICADO.
8. Desayuno incluido por tarifa/reserva; no usar gratuidad universal. Un posible paquete de desayuno para todos los anuncios de una marca requiere IDs de anuncios y planes, costos, precio, comisión, elegibilidad y revisión antes/después. No modifica reservas históricas.

## 3. Encuesta durante la estancia

**Título propuesto ES:** ¿Todo como lo soñabas?  
**Título EN:** Is everything just as you dreamed?

Flujo breve, voluntario y adaptado al idioma:

1. ¿Cómo va tu estancia? / How is your stay going? Opciones: todo bien; hay algo que mejorar; necesito ayuda hoy.
2. ¿Qué deberíamos revisar? / What should we check? Descanso/cama, limpieza, aire acondicionado, ducha/agua, ruido, desayuno, llegada/atención u otro.
3. Cuéntanos qué ocurre y qué lo mejoraría. / Tell us what happened and what would make it better. Texto libre y foto opcional.
4. ¿Quieres que te contactemos? / Would you like us to contact you? Canal y franja opcionales. El permiso de contacto NO es permiso para entrar en la habitación.

Invitación propuesta: «Hola, ¿cómo va todo en Dreamcatcher? Queremos saber si estás descansando bien y si hay algo que podamos mejorar durante tu estancia. También puedes responder a este mensaje». Añadir únicamente un enlace real probado cuando exista; no enviar plantillas con campos vacíos.

Preferir la mañana después de la primera noche dentro de una franja con cobertura humana. Para estancias de una noche, adaptar al momento de llegada sin molestar de madrugada. La frecuencia exacta y el canal se prueban antes de activarlos. Mantener vía humana para urgencias; el formulario no promete vigilancia permanente.

### Checkpoint de receptor privado — 2026-10-23

- PR #331 está fusionada y el preparador `src/features/guest/service-recovery.ts` existe en `main`, pero conserva `externalSend=false` e `internalWriteExecuted=false`.
- Las apariciones versionadas de `PRIVATE_FEEDBACK_LINK` son marcadores de prueba negativa o su evidencia; el contrato los rechaza, incluso codificados. Ninguna aporta un URL utilizable.
- La búsqueda versionada no localizó formulario publicado, endpoint/receptor externo, configuración de destino, recibo de creación de caso ni matriz de roles que demuestre el circuito de encuesta.
- Estado preciso: `BLOQUEADO_RECEPTOR_PRIVADO_NO_VERIFICADO`. Esto no invalida el preparador ni autoriza crear otro formulario. Impide invitar huéspedes o ejecutar el piloto.
- Siguiente prueba segura: aportar un enlace HTTPS del receptor existente y usar datos sintéticos para comprobar recepción, una sola tarea canónica por asunto, replay sin duplicación, acuse, aislamiento por rol y cierre/reapertura. Solo después se evalúan consentimiento y canal de huéspedes reales.

## 4. Encuesta posterior y reseñas públicas

Después de la salida, una invitación voluntaria y como máximo un recordatorio autorizado. Preguntar por descanso, limpieza, ducha, atención, qué conservar y qué cambiar primero; escalas con opción no usado/no aplica. Si hubo un problema, preguntar si se comunicó y si quedó resuelto. No inferir reparación a partir de una buena puntuación.

Desayuno: preguntar calidad, espera y disponibilidad solo si se consumió. La percepción de incluido/extra/no sabe se guarda separada del derecho comercial verificado en la reserva.

**Sin filtrado de reseñas:** la invitación a opinar públicamente, si se usa, será neutral y se ofrecerá con las mismas condiciones a huéspedes satisfechos e insatisfechos. No condicionar el enlace a la puntuación, no desalentar críticas, no pedir retirar opiniones a cambio de atención ni ofrecer incentivos. La encuesta privada busca corregir el servicio, no manipular la reputación.

Referencia oficial: https://support.google.com/contributionpolicy/answer/7400114

## 5. Atención y evidencia

Circuito propuesto: comentario permitido → validación de estancia/unidad → clasificación → búsqueda de caso existente → responsable con acuse → acción → verificación → confirmación al huésped cuando proceda → cierre o reapertura.

Una respuesta puede contener varios problemas. Enlazar cada problema a su caso y evitar duplicar el mismo episodio reportado por encuesta, recepción y reseña. Un problema que reaparece puede ser un episodio nuevo ligado al historial del mismo activo.

- Seguridad, acceso, agua o electricidad peligrosos: canal humano inmediato; no esperar al procesamiento de IA.
- Problema que impide descansar o usar la habitación: atención prioritaria dentro de cobertura comprobada.
- Limpieza y confort: coordinación con Aseo/Recepción, acceso autorizado y verificación posterior.
- Preferencias o ideas: registrar como mejora, no como avería ni compra aprobada.

Separar recibido por sistema, aceptado por persona, en atención, reparación informada, verificación aprobada y cerrado. Un mensaje enviado o una respuesta pública no equivale a un problema resuelto. Los objetivos de tiempo de respuesta deben ser aprobados y compatibles con la dotación; no prometer un tiempo sin medición.

## 6. Privacidad y prueba antes de publicar

No pedir identificación oficial, tarjetas, códigos de acceso ni datos innecesarios. No llamar anónima a una respuesta ligada a una reserva. El QR genérico puede permitir omitir habitación/contacto, explicando que eso limita el seguimiento individual. El enlace de estancia debe ser opaco, de alcance mínimo, con vencimiento y sin datos sensibles en la URL.

Consentimiento de atención separado del marketing y del acceso físico a la habitación. Acceso por rol: el técnico recibe el fallo y ubicación necesarios, no el expediente personal o financiero. Aislamiento de organización, lectura mínima, retención definida y medidas contra spam. No exponer filas completas por un formulario público.

Pruebas obligatorias antes del piloto: envío válido y recepción real; duplicado/reintento; múltiples asuntos; estancia incorrecta; acceso no autorizado entre huéspedes; formulario genérico sin identificación; recepción fuera de horario; adjunto no permitido; fallo de escritura; ausencia de contacto; comprobación de invitación pública idéntica para puntuaciones altas y bajas.

Piloto propuesto de 14 días o 20 estancias, sin activación automática. Medir invitaciones entregadas, respuestas, problemas nuevos, acuse humano, resolución verificada antes de salida, reaperturas, carga de recepción y satisfacción con la solución. No usar número de opiniones positivas como criterio de éxito.

## 7. Mantenimiento preventivo en las estructuras existentes

Reutilizar el inventario, las tareas vigentes documentadas en [DREAMCATCHER_MAINTENANCE_DELIVERY_V1.md](DREAMCATCHER_MAINTENANCE_DELIVERY_V1.md) y las estructuras canónicas verificadas `facilities.inspection_rounds`, `facilities.inspection_checks` y `facilities.maintenance_events`. Antes de implementar, comprobar esquema, organización/propiedad, lectura posterior y vigencia de la fuente. `facilities.preventive_room_plan` queda solo como etiqueta antecedente no verificada: no crearla ni usarla como autoridad sin evidencia gobernada posterior. La matriz por habitación no sustituye un calendario por activo.

Cada equipo necesita: identificador físico, ubicación, marca/modelo/serie cuando exista, manual o recomendación técnica, criticidad, última intervención comprobada, intervalo por fecha/horas/ciclos, próximo vencimiento derivado, responsable y evidencia. Si falta el último servicio, marcar por verificar; no inventar una fecha pasada o un vencimiento.

Propuesta inicial, subordinada al manual y a una evaluación técnica:

| Familia | Control operativo | Programación técnica |
| --- | --- | --- |
| Aire acondicionado | Enfriamiento, ruido, olor, goteo y revisión visual de filtros | Limpieza y servicio por uso, ambiente y fabricante; técnico autorizado |
| Camas, colchones y ventiladores | Estado, estabilidad, ruido y limpieza entre huéspedes | Ajuste/rotación solo si corresponde al diseño; revisión periódica por activo |
| Duchas, drenajes y agua caliente | Fugas, presión, drenaje y desempeño antes de entregar | Inspección preventiva y diagnóstico de causas compartidas |
| Bombas, filtros, timers y controles | Lecturas, ruidos, fugas y coherencia de programación | Por manual y horas/ciclos; sin cambios improvisados de presión, electricidad o químicos |
| Lavadoras y secadoras | Fugas, sellos, vibración y filtros de pelusa según uso/manual | Revisión de ductos, transmisión, conexiones y gas por técnico |
| Cerraduras, portón y alarmas | Funcionamiento y síntomas de batería/seguridad | Ensayos y reemplazos documentados; no sustituir seguridad por automatismo |

Los controles diarios, semanales o mensuales son propuestas de organización, no intervalos universales del fabricante. Trabajos eléctricos, refrigerante, gas, presión o altura requieren personal competente y aislamiento seguro. Coordinar ventanas reales del PMS; no entrar sin autorización ni cerrar/disponibilizar habitaciones automáticamente.

## 8. Portal y coordinación con Kross

Mostrar vistas del mismo caso, no un segundo registro: huésped necesita atención; habitación pendiente de inspección; preventivo próximo/vencido; mejora recurrente pendiente de decisión. Cada tarjeta lleva fuente, corte, unidad/activo, responsable aceptante, siguiente acción y prueba de cierre.

Kross conserva autoridad comercial y estado nativo; TORO mantiene coordinación/evidencia; Airtable es proyección humana. Relacionar IDs y versiones antes de escribir. Sin conector/identidad/permisos/receipt probados, mostrar sincronización pendiente y no afirmar funcionamiento en vivo. El portal no puede liberar una habitación solo porque no vea bloqueos en una copia histórica.

## 9. Auditoría de Kross y valoración

Investigar con acceso autorizado: inventario y mapeos vigentes/históricos, composición de villas, reservas y cambios, bloqueos por motivo/intervalo, aperturas, tarifas y meal plans, ocupación y producción, cobros/saldos/devoluciones, extras, canales y comisiones, reseñas/respuestas, limpieza, mantenimiento y trazabilidad de exportaciones. Declarar cobertura por área; leer una exportación no equivale a auditar todo el PMS. No reactivar la API pausada ni extraer credenciales.

Para valorar: separar costo/reposición, inmueble/derecho, negocio operativo y patrimonio neto de los socios. No sumar padres y componentes, activos compartidos repetidos, villa y habitaciones, valor capitalizado del negocio y sus activos incluidos, o títulos con equivalencias de suelo concesionado. Sin moneda, NOI normalizado, deuda, derechos y evidencias vigentes, no presentar una referencia histórica como precio de venta o garantía bancaria.

Recuperación documental: localizar evento, ruta y revisión exactos, conservar versión vigente y alcance; probar recuperación selectiva. No usar un rewind global que pueda deshacer trabajo correcto posterior. Un listado de eventos no acredita restauración de archivos.

Tokenización: estudiar derechos exigibles, sociedad/vehículo, autoridad sobre activos, deuda, transferencia de concesiones, divulgación y regulación antes de captar fondos. Un token no duplica habitaciones ni convierte una concesión en propiedad plena. No emitir ni garantizar rentabilidad mediante este anexo.

## 10. Verificación y continuidad

Esta entrega es diseño y alineación documental dentro de una PR existente, no un formulario publicado, calendario activado, cambio comercial, migración Supabase, restauración, envío a huéspedes o encargo recibido por Pumba. No contiene cifras privadas de valoración ni datos de huéspedes.

El cambio solo será incorporado a la versión principal después de revisar el diff, resolver conflictos, pasar controles proporcionales y cumplir el proceso branch/PR del repositorio. El Plan General rector requiere su propio enlace/delta revisado; este anexo no declara que ese archivo ya fue modificado. Reversión: retirar exclusivamente el commit de este anexo, preservando cambios ajenos.
