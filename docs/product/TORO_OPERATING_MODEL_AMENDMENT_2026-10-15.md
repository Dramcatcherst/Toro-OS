# TORO — Ampliación operativa, accesos y producto vendible

**Fecha de decisión:** 15/10/2026, America/Costa_Rica.  
**Estado:** TARGET / requisitos y contratos preparados; no acredita implementación, despliegue ni ejecución de Work.  
**Autoridad superior:** [Plan General único](TORO_BRAIN_GENERAL_PLAN.md), Constitución, sección 23 y contratos vigentes.  
**Ámbito:** núcleo reutilizable TORO; Dreamcatcher como prueba operativa; contexto personal y clientes externos aislados.  
**Carácter:** ampliación subordinada, no otro Plan General, cerebro, base o backlog.  
**Distribución:** contrato sanitizado para repositorio público. Nunca adjuntar correos, conversaciones, datos de empleados/huéspedes, credenciales, facturas privadas ni manifiestos operativos aquí.

## 1. Decisiones del propietario que deben conservarse

TORO tiene dos funciones complementarias: operar los negocios autorizados y convertirse en un producto implantable en otros negocios. La segunda no justifica interrumpir el hotel ni declarar capacidades que todavía no funcionan.

TERE atiende el ciclo del huésped. TORO coordina negocio, equipo, proveedores y ámbitos personales autorizados. PUMBA es el asistente coordinador de TORO; no una autoridad nueva ni un segundo registro de tareas. RICO, FIONA, SKY y SOBRESITO mantienen sus responsabilidades especializadas actuales.

La autorización para continuar incluye preparación y ejecución reversible dentro de permisos disponibles. No equivale a acceso técnico, entrega a otro agente, ampliación de privilegios, contratación, publicación comercial, movimiento de dinero, cancelaciones o cambios de credenciales. Un encargo preparado no está enviado; uno enviado no está aceptado; uno aceptado no está terminado.

El trabajo se integra en los proyectos existentes. Antes de crear un objeto, buscar su equivalente por ámbito, proceso y fuente. Las 100 mejoras de la investigación anterior son candidatos que deben reconciliarse con tareas existentes y probarse individualmente; no son 100 mejoras implementadas ni 100 proyectos nuevos.

## 2. Dónde vive cada cosa

| Información | Lugar y autoridad | Regla |
|---|---|---|
| Visión, arquitectura, contratos y código | GitHub, subordinados al Plan General | Versionados mediante rama y PR; solo contenido publicable en repositorios públicos |
| Identidades, permisos, tareas, ejecuciones y verificación TORO | Supabase y Control Plane existentes | Escritura por ruta autorizada, con lectura posterior y recibo |
| Archivos originales, fotografías, comprobantes y manuales privados | Repositorio documental autorizado, según mapa actual | Referencia estable, permisos, versión, conservación y prueba de recuperación |
| Correo y etiquetas | Buzón de origen | TORO indexa lo necesario; no fabrica un segundo buzón completo |
| Reservas, disponibilidad, precio y servicios contratados | Kross | Un correo, conversación o copia histórica no reemplaza la autoridad comercial |
| Contabilidad y movimiento bancario | Sistema contable y banco/procesador, respectivamente | Registrar, pagar y conciliar son estados diferentes |
| Contraseñas, tokens y claves | Gestor especializado de contraseñas/secretos | Nunca texto libre en la memoria, documentos operativos, chat, GitHub o registro de actividad |
| Preferencias y memoria personal permitida | TORO User Vault | No es la bóveda de credenciales; no accesible al empleador por defecto |

Cambiar un documento en una rama no modifica automáticamente main, Supabase, el portal ni los procesos del hotel. Cada promoción debe tener su evidencia propia. La memoria conversacional ayuda a recuperar contexto, pero no sustituye este registro.

## 3. Accesos y seguridad: delegar acciones, no repartir contraseñas

### 3.1 Diseño recomendado

Reutilizar un proveedor de secretos ya aprobado y administrado, si existe. Si no existe, comparar soluciones mantenidas antes de seleccionar una; no desarrollar criptografía propia ni contratar un plan en nombre del propietario sin decisión de coste.

Separar tres categorías:

1. **Identidad humana:** cuentas nominativas, autenticación multifactor y roles mínimos. Preferir delegación oficial u OAuth a credenciales compartidas.
2. **Identidad de servicio:** un ejecutor por ámbito y función, con permisos acotados y credencial de máquina. Evitar una llave maestra para todos los negocios.
3. **Recuperación:** acceso de emergencia controlado por personas autorizadas, fuera de la dependencia exclusiva del agente; procedimiento y recuperación probados.

Flujo objetivo:

`persona autenticada → acción permitida → comprobación de rol/ámbito → aprobación cuando corresponda → ejecutor autorizado → resolución temporal del secreto → operación → verificación → recibo sin secreto`.

El modelo recibe el resultado de una herramienta, no el valor de la contraseña. El proveedor o intermediario de secretos entrega al ejecutor solamente lo imprescindible y durante el tiempo necesario. Los tokens y secretos no se devuelven al cliente web, a una extensión, a una respuesta del modelo ni a los registros de depuración.

### 3.2 Sección del portal

**Accesos y seguridad** mostrará servicio, finalidad, responsable, ámbito, estado de conexión, rol permitido, última revisión y acciones disponibles. Los usuarios normales verán botones como «Consultar reserva» o «Registrar incidencia», no «Copiar contraseña».

El propietario tendrá revisión de accesos, solicitudes de conexión, recuperación y revocación según permisos. La introducción de contraseñas ocurre en la interfaz segura del proveedor o mediante OAuth; no se solicita pegarlas en un chat.

Metadatos mínimos propuestos, reutilizando los registros de integración existentes: `scope_id`, `service_key`, `account_ref`, `credential_ref`, `principal_ref`, `allowed_actions`, `environment`, `approval_policy`, `credential_status`, `last_verified_at`, `review_due_at` y `recovery_owner_ref`. `credential_ref` es una referencia opaca, nunca el secreto. No crear una tabla adicional si el registro actual ya expresa estos datos.

**Límite importante:** ocultar una contraseña autocompletada no garantiza que una persona con control del navegador no pueda recuperarla. El control real debe estar en cuentas limitadas o en operaciones ejecutadas en servidor. Una sesión de administrador compartida no se vuelve segura por esconder el campo de contraseña.

### 3.3 Controles de aceptación

- Una persona de cocina no puede leer correo privado, reservas ajenas a su cometido ni secretos.
- Un ejecutor de un negocio no puede usar credenciales de otro.
- Se prueban revocación, credencial vencida, permiso denegado y desconexión sin perder el registro del trabajo.
- La baja de un empleado retira permisos y sesiones empresariales, conservando su ámbito personal separado.
- No aparece ningún secreto en pruebas, capturas, registros, prompts, historial de comandos, errores o respaldos no cifrados.
- La recuperación funciona sin depender del mismo teléfono, empleado, ordenador o agente perdido.
- No se desactiva multifactor ni se evade una comprobación para acelerar una tarea.
- La rotación responde al proveedor, riesgo, exposición y política aprobada; no se cambian todas las contraseñas a ciegas.

## 4. Work, Codex y PUMBA: contrato de entrega

Orden preferido: conector oficial disponible → API autorizada → Work con navegador cloud autorizado → excepción local temporal. Codex Cloud es el destino preferente de desarrollo y pruebas cuando exista un entorno configurado. Una extensión de Chrome es ayuda contextual, no el motor que mantiene vivo el hotel.

La disponibilidad comercial de Work/Codex no demuestra que esta conversación pueda crear una tarea allí. Antes de afirmar «enviado», exigir una llamada de despacho exitosa, identificador de ejecución y destino comprobado. Si falta esa capacidad, guardar el encargo como **PREPARADO_NO_DESPACHADO** y mostrar exactamente qué sesión o entorno falta. La autorización del propietario ya existe para el alcance seguro descrito; no volver a pedirla de forma genérica.

Cada entrega reutiliza una tarea canónica e incluye: resultado, ámbito, responsable funcional, fuentes y fecha, operaciones permitidas y prohibidas, identificadores de objetos, dependencia, criterio de terminado, presupuesto, reversión y evidencia requerida. El ejecutor lee las fuentes actuales, no toma este documento como un estado vivo.

Estados: `PREPARADO → DESPACHADO → ACEPTADO → EN_EJECUCIÓN → POR_VERIFICAR → VERIFICADO`; alternativas `BLOQUEADO`, `FALLIDO` o `REVERTIDO`. No cambiar estados sin el hecho correspondiente.

### Paralelismo inicial propuesto

Máximo tres frentes independientes a la vez; es una política inicial de control de coste, no un límite del proveedor ni una afirmación de tareas lanzadas.

| Frente | Responsable funcional propuesto | Primer resultado verificable |
|---|---|---|
| Operación: mantenimiento y desayunos | RICO + TERE + responsable humano de turno | Una incidencia real llega al responsable y se verifica; una lista de desayuno vigente es aceptada por cocina |
| Correo, documentos y atención humana | FIONA + TORO Comms | Un lote acotado conserva documentación, identifica pendientes y permite revertir las etiquetas |
| Accesos, cloud y producto | SOBRESITO, coordinación PUMBA | Inventario sin secretos, entorno cloud probado y criterios de portabilidad documentados |

Los nombres de agentes son responsabilidades funcionales, no prueba de agentes activos ni asignación aceptada por empleados. No crear clones para simular capacidad.

Un objeto tiene un solo escritor activo. Usar task/run, idempotencia, lease/fencing y verificación existentes; ramas separadas para código, sin dos ejecutores cambiando el mismo fichero, reserva, correo o asiento a la vez. No relanzar una escritura cuyo resultado sea incierto antes de leer su estado.

Presupuesto por lote: hasta 12 minutos observados o 40 llamadas, salvo límite menor del flujo; máximo dos reintentos transitorios seguros. Al bloquearse un frente, avanzar los independientes y dejar la dependencia exacta. Estos límites de instrucciones no prueban un timeout técnico del motor.

## 5. Correo: el pendiente visible debe representar una acción

Reutilizar TORO Comms, el contrato de Gmail personal y la revisión «TORO Correos y Pagos». No crear otro lector masivo o un segundo monitor financiero.

Clasificación funcional:

- **Pendiente humano:** falta una decisión, aprobación o dato que TORO no puede resolver. Visible, con motivo y siguiente acción.
- **En gestión del equipo/TORO:** existe tarea con dueño, plazo y referencia comprobados. No trasladarla al propietario por rutina.
- **Esperando a tercero:** mantener responsable y próxima revisión; una respuesta enviada no cierra el compromiso.
- **Documentación conservada:** original recuperable e indexación cuando corresponde. Recibido no significa contabilizado ni conciliado.
- **Informativo/promoción revisada:** puede archivarse y marcarse leído, de forma reversible, tras comprobar su contenido y contexto.

«No leído» es una señal de presentación, no el estado canónico de una obligación. Usar la etiqueta ya existente de pendiente humano cuando corresponda. No marcar todo leído para bajar un contador ni ocultar un pendiente antes de tener su seguimiento comprobado.

Leer recibidos y enviados, incluyendo mensajes ya leídos. Conservar alertas de seguridad, reclamaciones, reservas, facturas, contratos, trámites y documentos personales. Separar titular/entidad aunque un documento empresarial llegue a un buzón personal. No reenviar buzones privados completos al hotel.

Toda modificación registra cuenta, message_id, etiquetas anteriores, motivo, acción y lectura posterior en un registro privado. Clasificar por remitente o categoría únicamente no basta para eliminación masiva. Archivar no libera almacenamiento; limpiar bandeja, conservar originales y recuperar espacio son objetivos distintos. Las bajas de newsletters no cancelan contratos y no deben eliminar avisos transaccionales.

## 6. Dos revisiones operativas y reportes de trabajo

Reutilizar los programadores existentes, sin sumar auditorías iguales. Diseño objetivo: revisión matinal antes del desayuno y revisión de preparación de llegadas por la tarde; el precierre financiero existente conserva su corte separado. Horarios efectivos dependen de la configuración verificada del scheduler, no de esta propuesta.

El reporte completo queda en la superficie privada existente de cada área; al equipo se entrega solo la información de su función. El propietario recibe decisiones, riesgos y cambios materiales, no una copia de todos los pendientes. Mantener modo PRUEBA hasta instrucción expresa y no afirmar entrega por WhatsApp sin comprobante del canal y destino.

### 6.1 Desayuno: reporte de despacho

Fuentes: servicio contratado en Kross, confirmaciones vigentes, modificaciones autorizadas y consumos del área. No confundir ocupación, plazas de cama o número de reservas con desayunos.

Campos: fecha y hora de corte; habitación o referencia mínima; cantidad incluida confirmada; extras confirmados; niños si cambia la prestación; franja solicitada; restricción alimentaria estrictamente necesaria; estado pendiente/preparado/entregado/no consumido; observación operativa; cambio desde el corte anterior; responsable y acuse de cocina.

Totales separados: incluidos, extras, autorizados sin cargo, por confirmar y entregados. Si falta la fuente, indicar **cantidad por confirmar**, nunca cero. Si un derecho de desayuno no está verificado, separarlo del total confirmado. Un mismo desayuno no se suma otra vez por aparecer en Kross, correo y WhatsApp.

Flujo: lista preliminar → recepción valida excepciones → cocina acusa → se registran entregas/cambios → cierre de consumos → conciliación correspondiente. La salida matinal debe llegar antes de comenzar el servicio; una programación flexible por sí sola no garantiza esa entrega. El responsable de apertura confirma el reporte o utiliza el reporte nativo de Kross como contingencia.

### 6.2 Mantenimiento: empezar con un circuito pequeño

Captura: habitación/área, problema, impacto en huésped, foto cuando sea útil y segura, fecha y origen. Comprobar si ya existe el incidente.

Estados comprensibles: **Reportado / Asignado / En proceso / Esperando repuesto / Por revisar / Resuelto**. Asignado exige aceptación; Resuelto exige evidencia y verificación. RICO coordina, pero una persona realiza y confirma el trabajo físico.

La prioridad se basa en seguridad, acceso, servicios esenciales y próxima llegada. No emitir instrucciones técnicas peligrosas por chat. Registrar proveedor, material y coste solo con evidencia. Un fallo de aseo crea o enlaza una incidencia, y una reparación debe pasar inspección antes de declarar la habitación disponible.

Mientras el transporte automatizado no esté probado, utilizar el proceso manual autorizado y el registro existente. No esperar a la futura API para empezar la disciplina de reporte, dueño, seguimiento y comprobación. Kross API sigue su estado de pausa vigente; este contrato no autoriza gasto ni activación.

## 7. Manuales, capacitación y portal por persona

Reutilizar TORO People y la biblioteca SOP existente. Crear primero una ruta para recepción, aseo, mantenimiento, cocina/desayuno y administración, sin rehacer manuales ya disponibles.

Cada procedimiento lleva versión, autor/fuente, puesto, propósito, prerrequisitos, pasos breves, límites de autorización, situación de excepción, evidencia de finalización y revisión. Publicar una capacitación exige comprobar que coincide con el proceso vigente, no solo generar texto.

Una unidad de aprendizaje tiene: explicación corta, ejemplo del hotel sin datos privados innecesarios, práctica, comprobación y supervisor. Completar un vídeo no demuestra competencia. Los temas de seguridad física requieren validación humana competente. Actualizar un procedimiento puede generar una recapacitación específica, no repetir toda la formación.

**Menú inicial del empleado propuesto:** Hoy / Mis tareas / Reportar / Aprender / Ayuda. Mostrar solo lo aplicable a su rol y turno. El propietario ve pendientes de decisión y resultados; cocina ve pedidos; mantenimiento incidencias; recepción llegadas y solicitudes. La personalización no crea cuentas duplicadas ni cambia permisos por decoración.

Prueba de usabilidad: un integrante nuevo, en móvil, puede encontrar su siguiente tarea, reportar un problema y completar una lección sin interpretar nombres de tablas o agentes. Registrar errores y ayuda requerida; no afirmar facilidad por opinión del diseñador.

## 8. Cocina, menú, experiencias y experiencia del huésped

El módulo de cocina debe permitir proponer cambios de plato, disponibilidad, precio, foto y descripción con roles diferenciados y publicación aprobada. «Agotado» no borra el historial de ventas. Alergias e ingredientes se verifican con cocina; el modelo no los inventa.

El huésped podrá consultar y solicitar alimentos, servicios, tours y experiencias desde un portal móvil ligado a su estancia. Un QR público de habitación no basta para autorizar cargos ni mostrar datos personales. Validar sesión, propiedad, estancia, permiso de cargo y precio antes de confirmar.

Pedido: solicitud → disponibilidad confirmada → importe y condiciones visibles → aceptación → preparación/operador → entrega → cargo/pago verificado → comprobante. Separar solicitud, reserva del operador, servicio prestado y liquidación de comisión. Los pagos usan una página alojada por el procesador; TORO no debe recibir números completos de tarjeta ni códigos de seguridad.

Mantener la corrección del menú sobre «pesca del día» y la distinción entre lavandería operativa del establecimiento y servicio externo de ropa para huéspedes. Ninguna corrección se declara aplicada a todas las superficies sin lectura posterior de cada superficie afectada.

Las fotografías se gestionan por habitación/área, derechos, versión y aprobación, reutilizando el catálogo existente. Las fotos prioritarias y el mercadeo entran en SKY; no abrir otro banco de imágenes ni publicar contenido por la sola existencia de un borrador. Atribuir ingresos y ahorro solamente con línea base y evidencia.

## 9. Cloud primero y salida de WeSpeak/OpenClaw

Ningún proceso crítico nuevo debe depender de que el ordenador personal esté encendido, una carpeta local sincronice o una sesión de escritorio siga abierta. Registrar cada dependencia local existente y su sustitución cloud, propietario, coste y prueba de continuidad.

Work Local puede ser una excepción de migración o acceso supervisado, no la solución permanente. TORO Companion/Chrome captura contexto autorizado y facilita tareas, pero no debe alojar el único scheduler, secreto, historial o canal de mensajería.

La arquitectura objetivo de comunicación es proveedor oficial → gateway TORO Comms → identidad/estado/política → flujo especializado → ejecutor → evidencia → respuesta. Evaluar WhatsApp Business Platform directo como sustituto del transporte actual, no como sustituto del resto del sistema. Verificar antes número, propiedad, elegibilidad, coexistencia/migración, historial, grupos, plantillas, consentimiento, límites, coste y recuperación con documentación vigente. No asumir paridad de grupos o historial personal.

OpenAI se usa cuando aporta razonamiento, traducción o extracción; hechos autorizados, consultas y reglas simples no necesitan siempre un modelo. No confundir capacidad de ChatGPT/Codex para desarrollar software con un backend operativo permanente de WhatsApp.

Migración: observar → copilot humano → autonomía de bajo riesgo → prueba de paridad → cambio reversible → retirada autorizada. No apagar WeSpeak/OpenClaw ni portar números mientras falten pruebas de recepción, envío, duplicados, caída, recuperación y entrega a humano.

**Prueba PC apagado:** el flujo crítico recibe un evento, registra estado, coordina la acción permitida, conserva evidencia, recupera un fallo y permite intervención humana sin el PC del propietario. Documentar resultado; disponibilidad declarada del proveedor no acredita esta prueba.

## 10. TORO vendible: extensión de los gates existentes

Reutilizar [la estrategia comercial](TORO_PRODUCT_PROOF_AND_COMMERCIALIZATION_V1.md) y [New Business Readiness Gate](NEW_BUSINESS_READINESS_GATE.md). No crear otra marca, app independiente o calendario de ventas para aparentar producto.

Antes de ofrecer implantación repetible, exigir:

1. Prueba real de los flujos representativos existentes en Dreamcatcher, con resultado operativo y no solo código.
2. Segundo negocio sintético aislado: alta, roles, configuración, importación, trabajo, exportación y baja sin copiar datos privados del primero.
3. Onboarding guiado de organización, ubicación, equipo, permisos, fuentes, políticas, catálogo, flujos y capacitación, sin reconstrucción manual del fundador.
4. Paquetes de capacidades activables en el mismo producto; precios e impuestos configurables por ámbito, no incrustados en el núcleo hotelero.
5. Matriz comercial honesta: disponible, asistido, en prueba y no disponible; soporte y condiciones de servicio ajustados a lo probado.
6. Medición por cliente de IA, mensajes, nube, almacenamiento, soporte y puesta en marcha. Separar coste fijo, variable, margen y horas humanas; ningún «gratis» o ahorro sin base.
7. Contratos, privacidad, consentimiento, conservación, subencargados, incidentes y derechos del cliente revisados para los mercados aplicables; no presentar este documento como asesoría jurídica concluyente.
8. Propiedad y portabilidad de datos, exportación comprensible, cierre de accesos y retirada ordenada de integraciones.
9. Actualizaciones versionadas, migraciones reversibles y pruebas contra aislamiento, privilegios, regresiones y caída del proveedor.
10. Controles de soporte: acceso temporal acotado, motivo, aprobación, evidencia y revocación; sin una contraseña de soporte universal.
11. Responsables de servicio y recuperación que no dependan exclusivamente del propietario ni de PUMBA.
12. Métricas de horas ahorradas, errores, interrupciones al dueño y coste por resultado verificado; número de agentes, reportes o archivos no es valor comercial por sí mismo.

El estado continúa INTERNAL PROOF hasta superar los gates y obtener la aprobación de piloto requerida. No iniciar campañas de venta ni prometer atención autónoma total por esta ampliación.

## 11. Orden de ejecución y criterios de terminado

| Orden | Resultado | Dueño funcional propuesto | Terminado cuando |
|---|---|---|---|
| Ahora | Documentación y trazabilidad de la ampliación | TORO / SOBRESITO | Existe versión recuperable, enlace desde contrato vigente y alcance de integración explícito |
| Ahora | Correo sin ocultar trabajo | TORO Comms / FIONA | Lote identificado, acción reversible, lectura posterior y pendientes conservados |
| Ahora | Reporte de desayuno utilizable | TERE / cocina / recepción | Lista del día con fuente vigente, totales correctos, excepciones y acuse humano |
| Ahora | Circuito de mantenimiento | RICO / responsable de turno | Una incidencia real recorre asignación, ejecución, evidencia y verificación |
| Siguiente | Accesos y cloud | SOBRESITO | Inventario sin secretos, proveedor aprobado, prueba negativa de permisos y prueba PC apagado |
| Siguiente | Portal y primera capacitación por rol | TORO People / especialistas | Usuarios reales completan tarea y práctica sin ayuda extraordinaria |
| Después | Pedidos y pagos del huésped | TERE / FIONA / cocina | Pedido autorizado llega a entrega y registro sin cargos duplicados ni datos de tarjeta en TORO |
| Futuro condicionado | Producto implantable | TORO | Gates, sandbox aislado, onboarding, coste, soporte, exportación y recuperación probados |

Limitar trabajo en curso antes de agregar frentes. La urgencia operativa real puede cambiar este orden; registrar la razón. Seguridad crítica no espera a terminar una mejora visual.

## 12. Encargo listo para Work/Codex

> Continúa el mismo TORO en el repositorio canónico. Lee AGENTS.md, START_HERE.md, toro-context.yaml, Plan General y esta ampliación. Revisa el estado de la rama/PR: no supongas que fue integrada. Conserva trabajo concurrente. No crees otro plan, backlog, base ni agentes. Primero confirma entorno, permisos, alcance y tareas existentes; reutiliza los frentes de identidad, lectura y entrega ya registrados. Concreta mantenimiento y reporte de desayuno con fuentes actuales; procesa correo por lotes reversibles conservando evidencia privada; inventaría dependencias de PC y accesos sin extraer secretos. Divide hasta tres frentes independientes, un escritor por objeto. Integra la referencia de esta ampliación en la sección pertinente del Plan General mediante cambio mínimo y revisión. Para producto, acredita aislamiento, onboarding, costes y recuperación antes de proponer venta. Ejecuta solo acciones autorizadas; conserva límites financieros, de identidad y seguridad. Si falta sesión, MFA, conexión, destinatario o ruta de escritura, deja bloqueo exacto y avanza lo independiente. Devuelve qué cambió, ID de ejecución, pruebas, lectura posterior, reversión y siguiente dependencia. No afirmes envío a empleados, tarea de PUMBA, estado listo de habitación, contabilización ni producción sin comprobante.

Estado inicial de este encargo: **PREPARADO_NO_DESPACHADO**. Cambiarlo únicamente con prueba de despacho; las credenciales nunca acompañan el encargo. Para modificaciones del Plan General, aplicar una inserción contextual mínima y comprobar el diff; no reemplazar un documento completo desde un extracto parcial.

## 13. Fuentes y límites de verificación

Revisados en esta sesión: contrato AGENTS, START_HERE, contexto canónico, secciones de Constitución y Arquitectura, encabezado y secciones operativas del Plan General, estrategia comercial, gate de nuevos negocios, inventario real de automatizaciones y un lote acotado de Gmail personal. El Plan General es extenso: no se declara lectura completa del archivo ni de todos los chats o sistemas.

Documentación externa consultada el 15/10/2026:
- OpenAI, Work y Codex: https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex
- OpenAI, capacidades y controles de dots: https://help.openai.com/en/articles/20001530-getting-started-with-your-dot
- OWASP, Secrets Management Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html
- Bitwarden, Machine Accounts: https://bitwarden.com/help/machine-accounts/

Estas fuentes apoyan decisiones de diseño; no prueban que exista una cuenta, bóveda, sesión cloud, permiso de despacho o integración en el tenant del propietario. La documentación de OpenAI consultada presenta la incorporación de más dots como futura: no crear ni prometer un dot por especialista. La especialización interna puede organizarse bajo el mismo coordinador sin esperar esa función.

No se han ejecutado desde este documento cambios de contraseñas, permisos productivos, bases de datos, reservas, contabilidad, pagos, canales WhatsApp ni publicación del portal. Los cambios efectivamente realizados deben informarse con sus recibos separados, y nunca añadirse aquí con datos privados.
