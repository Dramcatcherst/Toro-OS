# TORO × Google — 200 mejoras transversales

**Fecha:** 20/10/2026. **Estado:** DISEÑADO / NO ACTIVADO. Anexo subordinado al único Plan General `docs/product/TORO_BRAIN_GENERAL_PLAN.md`, no otro plan, backlog, agente, base, calendario ni scheduler. Reutiliza el carril documental PR #259; no implica merge, despliegue o configuración de Google. Los 200 IDs son requisitos de mejora, no 200 tareas creadas ni 200 novedades inéditas. Algunos refuerzan controles existentes. La solicitud del propietario amplía el diseño a toda la operación, no solo finanzas.

## CURRENT comprobado

Lectura del 20/10/2026, aproximadamente 22:31 America/Costa_Rica:
- Calendar hotel devolvió nueve calendarios: uno primario administrado por el hotel y ocho suscripciones públicas de lectura. Dos son festivos Costa Rica. No se observaron calendarios operativos secundarios ni recursos en esa lista; no se afirma ausencia fuera del alcance.
- Hay una suscripción a festivos del país Mauricio. Verificar relevancia; no confundirla con la agenda del propietario ni borrarla automáticamente.
- El contrato `toro_google_calendar_business_architecture_v1`, actualizado en septiembre, conserva reglas de crear un calendario dedicado y limitar el primario. Contradice instrucciones posteriores del propietario: reutilizar `admin@dreamcatcherhotel.com` y no crear otro. Este anexo propone reconciliar ese contrato; NO lo modifica por SQL.
- El receipt de `google_tasks.connector_preflight` del 10/10 informa cero lecturas y cero escrituras externas, adaptador no encontrado y scopes no verificados. Su estado passed acredita el preflight, NO una integración Google Tasks.
- Drive hotel devuelve cero unidades compartidas visibles. No demuestra falta de licencia ni inexistencia global. Business Starter es antecedente histórico, no edición de facturación actual verificada.
- OpenClaw conserva bloqueo de acceso real al host/gateway/destinatario; no se obtuvo prueba de entrega ni respuesta de Carolina. La disponibilidad de Calendar/Gmail en ChatGPT no demuestra capacidad del runtime TORO.
- PR #259 permanece abierta en borrador. El último readback anterior a esta adición marcaba mergeable=true; no se fusiona y no se sustituye el Plan General por una copia de su rama antigua.

## TARGET y autoridades

Google funciona como superficie de tiempo, comunicación y colaboración de TORO. Supabase conserva identidad, tareas, autorización y evidencia estructurada; Kross reserva/inventario/precio; Alegra contabilidad; banco liquidación; Dropbox custodia de originales; GitHub contratos/código. Drive no sustituye automáticamente a Dropbox, Sheets no crea un libro paralelo y Tasks no se convierte en la base maestra. Google Chat es opcional: no desplaza WhatsApp ni duplica avisos. Keep/IA son captura o asistencia consentidas, nunca otro cerebro.

Reutilizar `google_control_plane_readonly_map_20260826`, `google_calendar_architecture_20260918` y `owner_attention_comms_payflow_portal_openclaw_20260928`; las especializaciones consumen tareas sectoriales existentes. Responsable general propuesto SOBRESITO y responsables operativos por área; FIONA conserva finanzas/fiscal/legal, RRHH conserva People. Responsable propuesto no equivale a aceptación humana.

## Reglas de aplicación

1. Calendar solo muestra compromisos humanos, ventanas aprobadas y controles útiles. Los cron/heartbeats/reintentos de agentes quedan fuera del calendario humano.
2. Identidad única por entidad + objeto + período + event_role; conservar fuente, versión, fecha y enlace nativo. Colores/etiquetas ayudan a leer, no conceden permisos.
3. Separar cita, vencimiento oficial, control y estimación. RSVP, checkbox, formulario y fin del evento NO acreditan trabajo hecho, pago ni conciliación.
4. No compartir el calendario mixto íntegro con empleados. Audiencia mínima por caso, sin salarios, salud, secretos, documentos personales ni datos de otras empresas.
5. Toda escritura futura: tarea existente → run → lease/fencing → worker autorizado → readback → receipt; CAS/ETag, idempotencia, conservación de cambios humanos y reversión.
6. Sin permiso/licencia/ruta real: PREPARADO o BLOQUEADO, no ceros inventados. Sin nuevos calendarios, usuarios, grupos, permisos, compras, proveedores, campañas, pagos, nóminas, API Kross paga o Alegra Writer por esta especificación.
7. Menús 1–4 opciones por caso y versión; enlaces reales con acción explícita. Abrir no equivale a pagar/aprobar. Un número ambiguo o antiguo no cambia estado.
8. Aplicar por resultados completos, no por número de tareas: máximo un piloto principal y dos independientes. Documentación, prueba aislada, aplicación y beneficio medido son estados distintos.

## Límites oficiales relevantes

- Recordatorios Calendar son privados por usuario; configurar al organizador no prueba entrega al invitado [REM].
- `due` de Tasks API es fecha programada, no plazo contractual, y descarta hora; conservar hora límite en TORO/Calendar [TASK].
- Forms API no crea preguntas de carga de archivos; reutilizar una captura existente autorizada y verificar acceso/receptor [FORMS].
- Keep API tiene contexto empresarial administrativo; no presumir lectura/escritura de notas personales ni activar delegación amplia [KEEP].
- Citas premium y tipos foco/fuera-de-oficina/ubicación dependen de cuenta, edición y calendario [APPT,TYPES].
- Notificaciones push expiran y requieren renovación; un aviso no contiene por sí solo el evento actualizado [PUSH].
- Calendar410 invalida la sincronización de la proyección; nunca usarlo para borrar la verdad canónica de TORO [SYNC].
- Credenciales del dueño de un tablero Data Studio/Looker Studio pueden permitir ver datos sin acceso directo del lector; comprobar audiencia antes de compartir [BI].

## Catálogo G001–G200

Cada requisito se prueba contra su autoridad existente y se mide solo después de contar con una línea base. Estado inicial de TODOS: DISEÑADO / NO ACTIVADO. Los títulos siguientes son el índice durable; los criterios por área y pruebas transversales inferiores delimitan aceptación. El catálogo detallado entregado al propietario incluye responsable, prioridad, condición, criterio individual, métrica y fuente por cada ID.

### 01 · Calendar: identidad y alcance
Responsable: SOBRESITO + área; autoridad: TORO y fuente sectorial. Aceptación: identificar origen/ámbito y rechazar cruces antes de proyectar.
- G001 Inventario paginado de calendarios, cuentas y roles realmente accesibles.
- G002 Reconciliar la regla obsoleta de calendario dedicado con la decisión de reutilizar el existente.
- G003 Referencia canónica por entidad, objeto, período y función del evento.
- G004 Estado de negocio separado del status confirmed nativo.
- G005 Títulos breves con área/acción/referencia no sensible.
- G006 Aislamiento de ámbitos personales, salarios y otros negocios.
- G007 Color como ayuda visual, nunca permiso ni única señal.
- G008 Fuente y última verificación visibles en cada proyección.
- G009 Busy/free coherente con cita frente a hito informativo.
- G010 Deduplicar festivos en proyección y revisar relevancia sin borrar fuentes.

### 02 · Calendar: tiempo y recurrencia
Responsable: Operaciones + SOBRESITO; autoridad: compromiso verificado. Aceptación: conservar instante, alcance de serie y fecha oficial.
- G011 Zona Costa Rica y zona original preservadas.
- G012 Fin exclusivo correcto en eventos de todo el día.
- G013 Fecha de vencimiento separada de fecha interna de revisión.
- G014 Excepciones de recurrencia conservadas al mover una instancia.
- G015 Series con final o revisión para evitar compromisos perpetuos.
- G016 Versionado y conflicto de cambios humanos antes de actualizar.
- G017 Consulta de disponibilidad antes de proponer citas.
- G018 Preparación y cierre de actividad con márgenes sustentados.
- G019 Horizonte móvil 90 días con cobertura explícita.
- G020 Comparación de duración prevista y ejecución real medida.

### 03 · Calendar: coordinación y alertas
Responsable: persona del caso + SOBRESITO. Aceptación: destinatario correcto, entrega demostrada y cero duplicados.
- G021 Resolver identidad antes de invitar, sin confundir homónimos.
- G022 Separar invitación, RSVP y aceptación del trabajo.
- G023 Verificar avisos en la cuenta del destinatario, no solo organizador.
- G024 Consolidar avisos 3d/1d/vencimiento sin repetir por corrida.
- G025 Escalar con riesgo y acuse, no atribuir silencio sin entrega.
- G026 Enlaces nativos al evento, documento y caso autorizados.
- G027 Respuestas numeradas ligadas a mensaje, caso y versión.
- G028 Página de citas solo para entrevistas/visitas, nunca reservas Kross.
- G029 Foco/fuera-de-oficina/ubicación solo con edición y cuenta aptas.
- G030 Reservas de recursos solo con recurso y permiso realmente probados.

### 04 · Recepción y estadías
Responsable: Recepción + TERE; autoridad: Kross y huésped verificado. Aceptación: agenda no cambia inventario ni reserva.
- G031 Llegadas desde fuente PMS reciente y referencia verificable.
- G032 Separar llegada prevista, comunicada y huésped recibido.
- G033 Llegada tardía con relevo aceptado y sin secreto en evento.
- G034 Traslado confirmado con punto Maps comprobado.
- G035 Salida y llaves con referencia mínima y cierre operativo.
- G036 Cambio de habitación como solicitud, no mutación automática.
- G037 Relevo de recepción con pendientes vigentes del mismo caso.
- G038 Llamadas prometidas con resultado, no alarmas indefinidas.
- G039 Quejas privadas con gravedad y cierre comprobado.
- G040 Vista72h sin doble conteo habitación/villa de la misma unidad.

### 05 · Aseo, lavandería e inspección
Responsable: Aseo + supervisor; autoridad: ocupación vigente y QA físico. Aceptación: limpia no equivale a lista.
- G041 Ventana de limpieza entre salida y llegada verificadas.
- G042 Limpieza terminada separada de inspección aprobada.
- G043 Rutas por área para reducir traslados medidos.
- G044 Limpieza profunda en hueco aprobado sin bloqueo comercial implícito.
- G045 Recogida/entrega de lavandería con lote y conteo recibido.
- G046 Separar lavandería tercerizada de huésped y lavandería operativa.
- G047 Necesidad de ropa desde movimientos y stock utilizable comprobados.
- G048 Foto de daño ligada al activo, con privacidad del huésped.
- G049 Alerta de habitación atrasada por llegada, no por cada cron.
- G050 Medir salida–limpieza–inspección con tres evidencias temporales.

### 06 · Mantenimiento y activos
Responsable: Mantenimiento/RICO; autoridad: activo y prueba física. Aceptación: técnico reporta; supervisor verifica.
- G051 Activo y habitación inequívocos en cada intervención.
- G052 Preventivo según manual/uso aprobado, no frecuencia inventada.
- G053 Afectación de ruido/agua/electricidad coordinada con huéspedes.
- G054 Manual, garantía y reparación previa mediante enlace protegido.
- G055 Diagnóstico y repuesto antes de prometer solución.
- G056 Visita de proveedor solo tras aceptación de alcance y horario.
- G057 Revisar garantía antes de comprometer reparación pagada.
- G058 Lista de seguridad y prueba funcional final diferenciadas.
- G059 Reincidencia por activo para propuesta de reemplazo sustentada.
- G060 Medir indisponibilidad por avería separada del uso interno.

### 07 · DreamTeam: turnos y disponibilidad
Responsable: RRHH + responsables de área; autoridad: TORO People. Aceptación: solo turno publicado se presenta como asignación.
- G061 Proyección de turno publicado con versión vigente.
- G062 Disponibilidad declarada separada de turno asignado.
- G063 Detectar solapes entre turnos, formación y licencia aprobada.
- G064 Cambio de turno con aceptación e historia preservada.
- G065 Ausencia visible sin motivo médico o documento privado.
- G066 Separar asistencia, revisión de horas y elegibilidad de nómina.
- G067 Detectar hueco de cobertura por rol sin inventar sustituto.
- G068 Entrevista con disponibilidad y expediente restringido.
- G069 Revisión de documentos laborales por responsable autorizado.
- G070 Mi turno móvil con registro original y opciones numeradas.

### 08 · Formación y procedimientos
Responsable: RRHH/supervisor; autoridad: SOP aprobado. Aceptación: acceso al material no demuestra competencia.
- G071 Ruta de inducción por rol sobre SOP vigentes.
- G072 Procedimiento largo convertido en checklist sin perder pasos críticos.
- G073 Práctica supervisada además de lectura del manual.
- G074 Material Slides/Docs breve y legible en móvil.
- G075 Cuestionarios con revisión de errores, sin certificación legal automática.
- G076 Asistencia a curso separada de prueba de habilidad.
- G077 Refrescos por brecha o cambio real de procedimiento.
- G078 Versiones ES/EN con contenido y fecha coherentes.
- G079 Dudas incorporadas al mismo SOP, no manual paralelo.
- G080 Consulta offline de documento crítico solo en dispositivo autorizado y probada.

### 09 · Restaurante y experiencias
Responsable: restaurante/recepción/proveedor; autoridad: servicio y operación reales. Aceptación: catálogo no prueba cupo o prestación.
- G081 Desayunos incluidos, extras y consumidos separados.
- G082 Servicio de grupo por cantidad confirmada sin duplicar orden.
- G083 Restricción alimentaria mínima validada por cocina.
- G084 Cupo de experiencia confirmado por operador.
- G085 Separar reserva, realización y cobro de actividad.
- G086 Punto de encuentro y hora verificados.
- G087 Preparación/entrega de evento sin lista privada de huéspedes.
- G088 Cancelación de servicio sin cancelar hospedaje.
- G089 Medir demanda/merma por plato con unidades verificadas.
- G090 Revisar menú/costo/disponibilidad sin publicar automáticamente.

### 10 · Compras, inventario y proveedores
Responsable: Compras/almacén; autoridad: orden aprobada y conteo físico. Aceptación: forecast no genera compra.
- G091 Entrega con orden aprobada, franja y receptor.
- G092 Conteo con unidad, ubicación y fecha obligatorias.
- G093 Reposición desde mínimos/consumo/plazo sustentados.
- G094 Comparar precio total con impuestos, flete y garantía.
- G095 Separar orden, recepción física y factura.
- G096 Devolución dentro de plazo documentado.
- G097 Cuenta y contacto del proveedor con verificación independiente.
- G098 Conteo cíclico por criticidad sin barrido total diario.
- G099 Serial/garantía enlazados al activo efectivamente recibido.
- G100 Puntualidad/calidad del proveedor desde entregas comparables.

### 11 · PayFlow y caja
Responsable: FIONA/Caro; autoridad: Alegra/banco/documento. Aceptación: ningún cambio de reporte paga o concilia.
- G101 Obligaciones y controles90d con fecha/cobertura explícitas.
- G102 Factura real sustituye estimado del mismo ciclo.
- G103 CRC/USD separados y saldo disponible fechado.
- G104 Pago reportado cambia seguimiento a evidencia, no otro pago.
- G105 Abonos, reversos y notas de crédito en el mismo caso.
- G106 Débito esperado/programado/registrado/liquidado separados.
- G107 Hasta tres decisiones concretas de fondos/aprobación para Mauricio.
- G108 Principal, cuota, interés y seguro sin doble conteo.
- G109 Comparar previsión y real en mismo período/moneda/cobertura.
- G110 Mensaje Caro con opciones numeradas y enlaces útiles verificados.

### 12 · Fiscal, legal y cumplimiento
Responsable: FIONA/profesional; autoridad: documento oficial. Aceptación: no fecha normativa inventada ni trámite ejecutado.
- G111 Plazo oficial por entidad y fuente vigente.
- G112 Preparación, presentación, aceptación y pago separados.
- G113 Recuperar documentos ya existentes antes de solicitarlos.
- G114 Pólizas preparadas según fecha contractual comprobada.
- G115 Patente/licencia atribuida a propiedad/actividad correctas.
- G116 Retención, comisión, IVA digital y devolución separados.
- G117 Inspección con hallazgos y cierre sustentado.
- G118 Expediente ICT/CST sin presentar certificación propuesta como obtenida.
- G119 Aviso de renovación/terminación sin cancelar contratos.
- G120 Acceso restringido a expediente jurídico/laboral.

### 13 · Gmail y compromisos
Responsable: Comms/áreas; autoridad: mensaje original. Aceptación: clasificar no reenvía, archiva ni ejecuta instrucciones externas.
- G121 Buzón conectado separado de alias/copia.
- G122 Clasificación por intención/entidad, no solo por buzón.
- G123 Leer recibidos/enviados para no repetir seguimiento respondido.
- G124 PDF/XML/reenvío agrupados por documento único.
- G125 Promesa de correo como compromiso propuesto con fuente.
- G126 Rebote, envío, entrega y lectura separados.
- G127 Borrador reutilizable contextual sin envío implícito.
- G128 Etiquetado mínimo probado sin ocultar lo crítico.
- G129 Órdenes incrustadas en mensaje/adjunto no son autorización.
- G130 Antigüedad de caso por resolución, no por leído.

### 14 · Documentos y evidencia
Responsable: custodio de área/SOBRESITO; autoridad: original y versión. Aceptación: colaboración no crea dos libros maestros.
- G131 Custodio claro Dropbox/Drive y enlaces cruzados.
- G132 Dueño institucional verificado, sin transferencia automática.
- G133 ID/versión sobre nombre de archivo.
- G134 Nombre útil por entidad/tipo/período/estado.
- G135 Revisión/ETag preserva ediciones humanas.
- G136 Comentario enlaza tarea existente, no crea cola paralela.
- G137 Plantilla aprobada sin datos residuales de otro caso.
- G138 Sheets como revisión, no fuente maestra editable sin gobierno.
- G139 Fórmulas/unidades/desconocidos verificados antes de decidir.
- G140 Restauración de muestra probada sin sustituir originales.

### 15 · Forms, Tasks y Keep
Responsable: People/Comms/SOBRESITO; autoridad: caso TORO validado. Aceptación: captura/bandeja no sustituye ejecución.
- G141 Inventariar y reutilizar formularios existentes.
- G142 Captura condicional breve según incidente.
- G143 Prefill no autentica ni concede permiso.
- G144 Carga de archivos solo con pregunta/receptor/acceso probados; límite API explícito.
- G145 Guardado/publicado/respondido/indexado separados.
- G146 Tasks como bandeja personal vinculada, no maestro.
- G147 Hora límite en TORO/Calendar, no en due de Tasks API.
- G148 Completar checkbox no cierra trabajo no verificado.
- G149 Paginación e inclusión consciente de tareas asignadas/completadas.
- G150 Keep consentido, privado por defecto y alcance/migración por comprobar.

### 16 · Personas y colaboración
Responsable: áreas/SOBRESITO; autoridad: identidad y acuerdo humanos. Aceptación: contacto no otorga rol.
- G151 Homónimos no fusionados automáticamente.
- G152 Contacto personal/comercial/proveedor con ámbito separado.
- G153 Preferencia de canal y consentimiento comprobados.
- G154 Agenda de reunión con decisiones y casos existentes.
- G155 Meet solo si necesario y enlace final comprobado.
- G156 Acuerdo resumido como propuesta hasta validación.
- G157 Grabación/transcripción con edición, necesidad y consentimiento.
- G158 Chat opcional sin segundo emisor o cola.
- G159 Grupos/delegación auditados antes de direcciones funcionales.
- G160 Relevo temporal con alcance mínimo y fecha de fin.

### 17 · Comercial, eventos y reputación
Responsable: Revenue/SKY/TERE; autoridad: CRM/Kross/plataforma. Aceptación: sin publicación, gasto o compromiso comercial implícito.
- G161 Seguimiento de cotización por compromiso real del cliente.
- G162 Visita de bodas sin comprometer disponibilidad/precio.
- G163 Montaje/proveedores/actividad/salida bajo un evento real.
- G164 Sesión de fotos con habitación y derechos autorizados.
- G165 Calendario editorial aprobado separado de publicación.
- G166 Correcciones propuestas de Business Profile desde dato real.
- G167 Reseñas originales y respuestas preparadas sin publicar.
- G168 Maps con entrada física y destino comprobados.
- G169 Campaña estacional basada en capacidad/demanda sin repricing automático.
- G170 Google Hotels contrastado con total equivalente Kross, sin segundo escritor de precios.

### 18 · Analítica y decisiones
Responsable: Revenue/SKY/FIONA; autoridad: cada fuente. Aceptación: indicadores con cobertura no son liquidación bancaria.
- G171 Clic, consulta, reserva, anticipo y cobro separados.
- G172 Compra/devolución analítica deduplicada por transacción.
- G173 Campaña medida por contribución neta con costos completos.
- G174 Tráfico/pruebas del equipo separados de conversiones reales.
- G175 Consentimiento y ausencia de PII en payloads analíticos.
- G176 Búsquedas comerciales medidas sin convertir clic en ingreso.
- G177 Indexación/sitemap verificados antes de diagnóstico SEO.
- G178 Tableros por rol con credenciales mínimas y prueba negativa.
- G179 Frescura, denominador y período comparable visibles.
- G180 Experimentos antes/después con límites y sin ahorro inventado.

### 19 · Integración y recuperación
Responsable: SOBRESITO; autoridad: Control Plane. Aceptación: señal/adapter/preflight no se anuncian como operación E2E.
- G181 Separar función nativa, conector y operación realmente probada.
- G182 Escritor único por objeto/versión con lease/fencing.
- G183 Guardar checkpoint solo tras paginación e indexación completas.
- G184 Token inválido reconstruye proyección, no borra canónicos.
- G185 Renovar push existente y deduplicar solapes.
- G186 Webhook dispara relectura, no acción desde datos ausentes.
- G187 Cambios humanos Google conciliados por campo/rol.
- G188 Apps Script acotado con cuota/log/rollback, sin otro scheduler.
- G189 Reintentos por tipo de fallo; no eludir denegaciones.
- G190 Caída/replay/restauración probados antes de declarar autonomía.

### 20 · Seguridad, móvil y adopción
Responsable: SOBRESITO/propietario/áreas; autoridad: permisos y política. Aceptación: utilidad medible sin mayor exposición o gasto implícito.
- G191 Edición/licencia/billing verificados antes de dependencia premium.
- G192 OAuth mínimo sin delegación amplia por conveniencia.
- G193 Identidad institucional/personal/compartida separadas.
- G194 Sin secretos o PII en títulos, avisos ni parámetros URL.
- G195 Móvil360/390/412 y texto ampliado sin pérdida de información.
- G196 Aviso real probado en teléfono y configuración de notificaciones.
- G197 Retención/retiro de acceso revisados sin borrar evidencia obligatoria.
- G198 Gemini/NotebookLM opcionales con fuentes permitidas y revisión, sin licencia supuesta.
- G199 Adopción por casos resueltos/tiempo del dueño con baseline.
- G200 Aplazar/retirar bajo valor solo tras dependencia y reversión comprobadas.

## NEXT: primeras doce, sin abrir doce tareas

Lote A (condiciones mínimas): G002 contrato vigente; G006 aislamiento; G023 aviso real a destinatario; G181 capacidad probada. Responsable funcional SOBRESITO, con FIONA/Caro para la prueba de alertas. Cierre: no contradicción de arquitectura, ámbito correcto y un recorrido real autorizado con lectura posterior; no asumir aceptación de Caro.

Lote B (operación): G031 llegadas; G042 inspección; G051 activo; G061 turno publicado. Cada piloto conserva fuente real y se prueba sin cambiar reservas, disponibilidad o planillas. No ejecutarlos en huéspedes reales para ensayar.

Lote C (trabajo cotidiano): G110 respuestas/links Caro; G131 custodio documental; G146 bandeja Tasks; G171 embudo. Dependencias de identidad/adapter/edición se resuelven antes de activar. No fechas de entrega inventadas ni compra de herramientas para cumplir el catálogo.

El resto se selecciona tras resultados; riesgo alto de un control no vuelve urgentes simultáneamente todas las 200 mejoras. Se preservan tareas sectoriales y el Plan General como guía única.

## Veinte pruebas mínimas diseñadas, NO ejecutadas

T01 homónimos no reciben envío; T02 Recepción no abre finanzas privadas; T03 replay no duplica evento; T04 instante y zona correctos; T05 all-day con fin exclusivo; T06 mover una instancia conserva serie; T07 cambio humano concurrente no se pierde; T08 aviso del organizador no se presenta como recibido por invitado; T09 cita no crea reserva Kross; T10 ya pagué suspende nueva solicitud de pago y mantiene evidencia pendiente; T11 limpieza no libera sin QA; T12 turno no acredita asistencia; T13 Tasks sin hora preserva deadline externo; T14 prefill manipulado no eleva permisos; T15 checkbox no verifica trabajo; T16 nombre repetido no reemplaza otro ID de archivo; T17 Calendar410 no borra canónicos; T18 webhook repetido se concilia una vez; T19 número de menú viejo no ejecuta decisión nueva; T20 móvil/texto ampliado conserva datos, acciones y privacidad.

Aceptación por área añade muestra comparable y métrica propia: puntualidad, tiempo preparación, faltantes, reincidencia, cobertura, error, entrega o minutos reales de intervención. Sin baseline: NO_MEDIDO. No usar número de requisitos o documentos como beneficio económico.

## Fuentes oficiales consultadas

Estos enlaces acreditan funciones y límites; los usos hoteleros y controles son propuestas TORO, no afirmaciones del proveedor sobre nuestra cuenta.

- CAL https://developers.google.com/workspace/calendar/api/guides/create-events
- REM https://developers.google.com/workspace/calendar/api/concepts/reminders
- SYNC https://developers.google.com/workspace/calendar/api/guides/sync
- PUSH https://developers.google.com/workspace/calendar/api/guides/push
- TYPES https://developers.google.com/workspace/calendar/api/guides/event-types
- APPT https://workspace.google.com/intl/en_ph/resources/appointment-scheduling/
- TASK https://developers.google.com/workspace/tasks/reference/rest/v1/tasks
- TASKLIST https://developers.google.com/workspace/tasks/reference/rest/v1/tasks/list
- KEEP https://developers.google.com/workspace/keep/api/guides
- DRIVE https://developers.google.com/workspace/drive/api/guides/about-shareddrives
- GMAIL https://developers.google.com/workspace/gmail/api/guides/filter_settings
- FORMS https://developers.google.com/workspace/forms/api/reference/rest/v1/forms
- SHEETS https://developers.google.com/workspace/sheets/api/guides/filters
- PEOPLE https://developers.google.com/people
- MEET https://developers.google.com/workspace/meet/api/guides/overview
- MAPS https://developers.google.com/maps/documentation/urls/get-started
- GBP https://developers.google.com/my-business/content/overview
- GA4 https://developers.google.com/analytics/devguides/collection/ga4/ecommerce
- GSC https://developers.google.com/webmaster-tools/about
- BI https://docs.cloud.google.com/data-studio/data-credentials
- SCRIPT https://developers.google.com/apps-script/guides/services/quotas
- ADMIN https://developers.google.com/workspace/admin/directory/reference/rest

## Verificación y reversión de este cambio documental

Solo se añade este archivo en una rama existente. No modifica el Plan General de main, Supabase, Google, automatizaciones o runtime. Revisar los 200 IDs consecutivos y únicos, los veinte ámbitos y la correspondencia de las doce prioridades. Releer el blob remoto antes de afirmar guardado. Reversión: revertir únicamente el commit que añade este anexo; no revertir trabajo previo de PR #259. No aprobar el merge por la presencia de documentación o por un estado verde antiguo de CI.
