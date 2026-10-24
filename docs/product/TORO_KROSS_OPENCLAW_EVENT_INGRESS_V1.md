# TORO — Ingreso por eventos de Kross, correo y OpenClaw

**Fecha:** 2026-10-24, America/Costa_Rica.  
**Estado:** TARGET / diseño investigado; no configurado ni activado en runtime.  
**Autoridad:** único Plan General `TORO_BRAIN_GENERAL_PLAN.md`, `TORO_WHATSAPP_OPENCLAW_SAME_BRAIN_V1.md`, `TORO_COMMS_V1.md`, `TORO_KROSS_FIRST_LIVE_READ_ACCEPTANCE_GATE.md` y `TORO_OPENCLAW_RUNTIME_AUDIT.md`.  
**Continuidad:** PR #381 y el expediente privado EXISTENTE `operations.knowledge_items/kross_toro_housekeeping_integration_plan_2026_09_v1`. Reutilizar `Kross y WeSpeak · Continuidad`, `Dreamcatcher · Auditorías operativas`, `openclaw_whatsapp_runtime_audit_2026_09_19`, `toro_surface_capability_parity_20260922` y el carril existente de Alegra. **No crear scheduler, agente, base, cola, espejo o escritor adicionales.**

## 1. Evidencia pública contrastada

- Kross Booking anuncia app móvil, notificaciones push para reserva nueva, cambio y cancelación, planner y check-in/out. El representante de Costa Rica describe el módulo de limpieza accesible para el equipo desde la app: https://www.krossbooking.com/es ; https://www.mejoratuhotel.com/en/index.php/2023/05/02/reservations-system/ . Identidad Play Store verificada por ficha `com.krossbookingx`: https://play.google.com/store/apps/details?id=com.krossbookingx . **NO probado:** que el plan, sesión, permisos y versión de Dreamcatcher den cada función; duración del login; contenido o emisión de push cuando alguien marca limpieza.
- OpenClaw permite Gmail Pub/Sub -> webhook, IMAP trigger con lector aislado, HTTP mapped hooks, y Android companion-node con reenvío de notificaciones **desactivado por defecto**, filtrable por paquete. Fuentes: https://docs.openclaw.ai/automation/cron-jobs/gmail ; https://docs.openclaw.ai/automation/imap ; https://docs.openclaw.ai/automation/cron-jobs/webhooks ; https://docs.openclaw.ai/android . La capacidad depende de la versión instalada y del Gateway que REALMENTE esté activo.
- OpenClaw MCP Events es una vía futura para fuentes que soporten explícitamente `events/list` + suscripción y callbacks firmados: https://docs.openclaw.ai/automation/mcp-events . No atribuir ese protocolo a Kross, Gmail o WeSpeak sin evidencia de servidor compatible.
- Un proveedor tercero describe webhooks para Kross, pero no acredita contrato, precio, endpoint o permiso vigente de Dreamcatcher. **Kross API pagada sigue PAUSADA**; no consultar/activar una factura histórica ni interpretar notificaciones como API autorizada.

## 2. Lectura real limitada al 24/10

- Gmail hotel permitió una muestra mínima de avisos de Kross sobre bloqueo de propietario y portal/checklist y de WeSpeak sobre incidencia/solicitud. IDs de correos, huéspedes, reservas, direcciones y cuerpos permanecen únicamente en buzón/expediente PRIVADO. No se observó en esa muestra un evento nativo de limpieza; ausencia de muestra no demuestra ausencia del evento.
- `operations.knowledge_items/kross_toro_housekeeping_integration_plan_2026_09_v1` ya tiene `notification_bridge_proposal`, `housekeeping_work_packages_preserved` y `native_action_routing`. Reutilizarlos, no duplicar diseño. `src/features/kross/transport-intake.ts` y `normalize-reservation.ts` son preparación sin lectura viva; no rellenar campos con supuestos de push/email.
- El único binding OpenClaw/WhatsApp activo consultado en `integrations.communication_channel_bindings` era phone/sistema con `last_sync_at = NULL` y `last_event_at = NULL`; `integrations.communication_channel_receipts` tenía 0 filas. Estado de Gateway, recepción, identidad, permiso, entrega y continuidad **NO VERIFICADOS**. Esto no prueba que no haya operación de WhatsApp en otra infraestructura.
- No hubo sesión de navegador Kross/OpenClaw accesible durante esta revisión. Kross app, usuario/roles, tokens push y Gateway host no se inspeccionaron. No activar control de navegador ni pedir cookies, OTP o contraseñas.

## 3. Tabla de activación priorizada, sin cambiar horarios actuales

| Señal externa | Transporte candidato | Puede disparar ahora (una vez instalado/probado) | Qué NO prueba |
| --- | --- | --- | --- |
| Nueva/modificada/cancelada reserva Kross | Correo oficial Gmail/IMAP, app push filtrada; webhook solo con contrato | **SEÑAL**: revisar reserva/folio nativo, deduplicar, preparar prioridad Recepción | Reserva vigente, precio, disponibilidad o cargo bancario |
| Housekeeping marcado limpio por la camarera | **Estado nativo Kross** leído con identidad de cuarto, cambio y fecha; app es superficie humana | Confirmar `CLEANED_BY_HK` cuando exista lectura directa y autorizada; no volver a preguntar el mismo hecho | Inspección QA separada, mantenimiento resuelto o acceso aceptado |
| Push Android de limpieza, si realmente existe | OpenClaw Android node, SOLO paquete de Kross allowlisted y dispositivo autorizado | **SEÑAL** para releer Kross y actualizar caso existente | Marca nativa demostrada: el texto de una notificación nunca certifica READY |
| Mensaje/solicitud/incidencia WeSpeak | Correo de notificación o evento fuente verificado | Candidato a incidente o handoff; vincular conversación nativa e identidad | Conversación completa, respuesta, entrega o resolución |
| Aviso de pago Kross/procesador | Correo/nodo como señal; banco/procesador/Alegra mantienen autoridad | Preparar contraste de reserva/folio/metodo/moneda y excepción | Ingreso liquidado, contabilizado, factura fiscal aceptada |
| Canal WhatsApp/OpenClaw | Mensaje admitido por identidad/ámbito y recibo de proveedor | Consultar misma tarea/caso que Portal; autorizar acciones según capability | Que dueño/empleado/huésped compartan permisos o memoria |

**Regla unificadora:** `source event -> verifica autenticidad/transporte -> identidad+scope -> dedupe fuente/id y correlación semántica -> evento observado -> lectura de verdad vigente necesaria -> tarea/caso canónico -> Control Plane / policy -> ejecución autorizada -> readback+receipt -> vistas Portal/WhatsApp`. Un evento nunca es instrucción del modelo y la bandera `connected` no sustituye heartbeat+evento+recibo.

## 4. Alternativas de notificación y decisión

1. **Primero, correo Kross/WeSpeak que YA recibe el hotel.** Inventariar remitentes realmente autenticados y asuntos nativos sin capturar OTP; Gmail Pub/Sub si se aprueban Cloud/billing y HTTPS, o IMAP en Gateway existente si encaja con el transporte/costos. Ambos requieren reader restringido y pruebas de su versión, no autoenvío.
2. **Piloto alternativo Android** (dispositivo empresarial dedicado preferido): comprobar app Kross, permisos mínimos, login persistente real y ejemplos de push. Si vale, OpenClaw Android app -> Gateway node emparejado seguro `wss`, Notification Listener limitado exclusivamente a `com.krossbookingx`; filtrado/redacción previo a conocimiento del agente, límites y prohibición de mover dinero/reservas. No conceder al dueño un listener universal que capture mensajes personales, financieros u OTP. El móvil requiere conexión, batería y permisos; no es canal SLA ni sustituye verificación de Kross.
3. **Webhook oficial/proveedor autorizado** solo si Kross confirma soporte, precio y alcance compatibles **sin reactivar la API pagada por esta orden**. No configurar endpoint público ni webhook de terceros sin revisar firma, autenticación, costos, exposición de Gateway y rollback.
4. **MCP Events** únicamente donde un MCP server autorizado y la versión instalada anuncien el perfil compatible. No envolver fuentes en un servidor nuevo para aparentar disponibilidad.

## 5. Portal, WhatsApp y control real de OpenClaw

- **Un solo TORO canónico.** Portal y WhatsApp consumen los mismos `operations.tasks`, incidencias `facilities.maintenance_events`, datos verificados y receipts. En el Portal mostrar origen y frescura, **Señal detectada / Pendiente de Kross / Limpieza marcada / Inspección exigida / Bloqueo / Lista verificada**, no un único booleano ambiguo; ofrecer botón funcional solo si la capability/rol/destino están probados. WhatsApp envía resumen mínimo contextual, acuse y enlaces reales cuando rol/identidad/transportes hayan sido probados; no mensajes repetidos.
- **TORO puede gobernar OpenClaw mediante el puente original** `toro-openclaw-integration`: leer status/version/capabilities/hook health/canal/último evento/receipt; solicitar acciones a través de tool policy, approvals, lease/fencing y registrar antes/después. No darle al Portal shell, service-role o admin Gateway, ni asumir que una llamada desde ChatGPT controla el host.
- **Límite de confianza:** la documentación actual de OpenClaw establece una frontera confiable por Gateway. No admitir a empleados/huéspedes no confiables en el Gateway de herramientas privilegiadas del propietario; separar mediante aislamiento real, no alias/sesión/prompt. Referencia: https://docs.openclaw.ai/gateway/security/trust-model . Ninguna alta de nuevo Gateway, rol, MFA, DNS, token o túnel autorizada por esta nota.
- Verificar primero en el host ORIGINAL y autorizado el runbook `docs/runbooks/TORO_OPENCLAW_RUNTIME_AUDIT.md` y `scripts/openclaw-host-diagnostics.mjs`, sin autofix ni logs crudos. Resultado esperado: versión instalada, conectividad, bindings reales, control del ámbito, salud/cursors, piloto de evento/acuse y recuperación con PC apagado; sin host, **BLOQUEADO**.

## 6. Qué hacer en el siguiente lote de ejecución

**A. Producto Kross · RICO/SOBRESITO rol propuesto.** Sobre `kross_toro_housekeeping_integration_plan_2026_09_v1` y tareas existentes, validar en la app web y móvil Kross los campos de cambio de limpieza, identidad física, usuario autor, timestamps, push y duración de sesión, con muestras actuales autorizadas. No pedir al equipo repetir una marca ya presente; no hacer login ni capturar credenciales ajenas.

**B. TORO Comms/OpenClaw · SOBRESITO rol propuesto.** Recuperar Gateway original, versión, sesión y autorización. Elegir UNA señal sintética de Gmail/IMAP o Android (no ambas en producción), derivar `signal_only`, reconciliar con fuente vigente y registrar receipt privado mediante rutas existentes y aislamiento probado. Probar duplicado, evento tardío, fuente caída, mensaje adversarial, ámbito incorrecto, reinicio y rollback. Nunca usar OTP como trigger.

**C. UX Portal/WhatsApp · TORO Portal/RICO/TERE roles propuestos.** Diseñar/ensayar en rama la misma tarjeta de incidente con campo `source freshness`, estado y acción disponible. Probar con identidad autenticada de Recepción, Aseo, propietario y rechazo de rol ajeno, sin datos de huésped fuera de su ámbito. No desplegar sin QA y seguridad.

**D. Contabilidad / Kross · FIONA rol propuesto.** Leer un caso ya existente de pago Kross<->procesador<->Alegra y preparar el Writer separado. Sin un permiso de escritura nativo específico, un documento piloto autorizado y readback real, **NO REGISTRAR PAGOS**.

**Parada y transición:** conservar los cortes existentes a las 06:00/13:00, precierre y 20:00; no crear timer nuevo. Considerar sustituir polling redundante únicamente tras tráfico real observado, reconciliación de huecos, comparación de fallos/latencia/costos, recuperación y consentimiento del responsable. La primera meta es detectar eventos para trabajo **en modo lectura**; automatizar escrituras sensibles requiere gates distintos.

**Criterio de terminado del primer piloto:** fuente y permisos nativos; 1 evento verdadero autorizado más pruebas negativas sintéticas, dedupe e idempotencia; reconciliación de Kross; recepción de TORO con identity/role/lease comprobados; misma tarea/caso visible en Portal y consulta WhatsApp autorizada con receipt; conservación de cortes, no pérdida de eventos y rollback. Si falla cualquiera, registrar bloqueador/cursor en expediente EXISTENTE, sin afirmar OPERATIVO ni migrar cron.

**Estado de este archivo:** diseño aplicable y evidencia pública/lecturas fechadas, NO piloto instalado, NO Gateway controlado, NO sincronización live, NO Kross API reactivada, NO cambios comerciales ni mensajes externos.


## 7. Corrección del propietario: la app ya se usa plenamente (24/10/2026)

**HECHO POR CONFIRMACIÓN HUMANA:** todo el equipo pertinente de Dreamcatcher/Atrapasueños utiliza ya la app móvil de Kross con regularidad; aseo marca la habitación terminada allí y otras funciones de mantenimiento, cobros, reservas y operación también se trabajan desde Kross. No abrir tareas de incorporación, capacitación inicial, adopción o sustitución de esta app. **La brecha es del AGENTE TORO**, no del equipo humano. El propietario permite explorar acceso lector usando el perfil de Kross al que se refiere como "Rico", únicamente bajo su identidad, permisos reales y sesión nativa autorizada. No equiparar automáticamente ese usuario Kross con la persona/agente interno TORO RICO, ni asumir que existe una credencial delegada funcional para esta sesión. No extraer passwords/OTP/cookies ni pedir reautenticaciones rutinarias. El sistema debe respetar expiración/MFA y reautenticación humana cuando el proveedor la exija.

**Eje CURRENT vs TARGET:**
- **CURRENT, humano y confirmado por propietario:** app Kross en uso, marcas de limpieza realizadas por staff. Se respeta la operación real y las decisiones del equipo.
- **CURRENT, TORO, lectura verificada:** solo espejo/historia fragmentarios; el último `finance.pms_payments` importado observado en el corte privado está atrasado y la evidencia de mantenimiento requiere conciliar con fuentes físicas posteriores. Una tabla TORO con cero cierres `verified_closed_at` no niega trabajos realmente resueltos fuera de ella.
- **TARGET, TORO:** inspeccionar de forma autenticada el historial actual, notas y pestañas nativas de reserva, housekeeping, pagos/cargos, caja/primanota, cierre, inspecciones y mantenimiento; contrastar roles y alcance; usar la app como superficie *lectora* sin pedirle al equipo que capture otra vez.

**Ruta de acceso propuesta, sin nuevo conector:** (1) usar primero la interfaz WEB autenticada de Kross con una sesión del perfil autorizado, o una exportación nativa permitida, dentro del lector/navegador ya existente y con permisos restringidos; recuperar también el Gateway y puente `toro-openclaw-integration` original para procesar eventos y servir Portal/WhatsApp; (2) correo y notificaciones como disparadores de relectura; (3) **no priorizar automatización Android por accesibilidad:** según OpenClaw v2026.8.1, `mobile_ui` es experimental, solo propietario, desactivado por defecto, disponible exclusivamente en compilaciones de terceros, **NO en la app normal de Google Play ni por Gateway HTTP**, y exige habilitar comandos peligrosos explícitos: https://docs.openclaw.ai/releases/2026.8.1/quality-of-life-improvements . Aunque `mobile.ui.observe` / `mobile.ui.act` estén en la lista de capacidades potenciales Android, no están disponibles por defecto; comprobar binario/versión/runtime/permiso y compatibilidad con Kross antes de considerarlos. Por tanto, no afirmar que OpenClaw puede leer o pulsar hoy en la app de Kross. Un eventual piloto aislado usaría un móvil empresarial, censura de datos y lectura como primer gate; `mobile.ui.act` queda DESHABILITADO salvo aprobación distinta para operación exacta. Una notificación Android es una señal, no la verdad de limpieza de Kross.

**Mapa de lectura y aprendizaje en Kross (etiquetas exactas por verificar en sesión):**

| Área y objeto nativo | Datos mínimos que TORO necesita aprender | Decisión válida | Acción de futuro separada |
| --- | --- | --- | --- |
| Aseo, asignación y registro de habitación | unidad física, estado, autor funcional, marca de limpieza, hora, cambios posterior a salida; mantenimiento asociado | aceptar marca fresca en Kross como hecho de limpieza; NO volver a pedir segunda confirmación | vincular limpieza/QA/bloqueo/ready sin afectar inventario |
| Mantenimiento | unidad/activo, reporte/nota, foto o prueba, quién lo reporta, estados e historia | incidencia activa vs reparado reportado vs verificado/cerrado | mismo caso de TORO `facilities.maintenance_events`; no duplicar reparación |
| Reserva y notas internas | ID nativo, propiedad, estancia actual, versión, nota interna visible, privacidad y efecto de notificar | proponer nota contextual mínima, revisar si ya existe antes de agregarla | edición de nota interna con capability y lectura posterior |
| Pagos cobrados / folio | ID reserva y folio, cargos, importe y moneda originales, pagador, medio, ref del procesador y pago en Kross | pago reportado/recibido/registrado/liquidado/contabilizado separados | candidato de registro Kross solo con fuente bancaria/procesador/caja suficiente |
| Caja / primanota / cierre | importe, moneda, medio/cuenta, lote/corte, registro, cierre y diferencias | precierre y conciliación con evidencia; no cuadrar por suposición | conciliar con banco y Alegra en carril contable; no finalizar jornada automáticamente |
| Servicios/desayunos | derecho según tarifa, pedido, servicio prestado, cargo, pago y no consumo separados | cocina recibe solo los datos que necesita; un pedido no prueba consumo | integrarse a desayuno/Restaurante y facturación sin doble cargo |

**Operación observada no significa integración:** aprender "dónde" y "cómo" mediante la cuenta permitida y una lectura no obliga a nadie a modificar sus rutinas; una futura orden para escribir notas/pagos requiere que el ejecutor pueda demostrar nombre de campo y resultado real, consentimiento/rol efectivo, versiones para evitar pisar cambios, recibo nativo, idempotencia y rollback cuando proceda.

### 7.1 Reglas de siguiente acción (código listo para prueba, no desplegado)

`src/features/kross/native-operations-preflight.ts` es un evaluador **puro y sin efectos externos**, con regresiones en `native-operations-preflight.test.ts`. Acepta solo evidencia autenticada de app/web, con procedencia, tiempo, identidad nativa y permisos. 
- Marca limpia actual y atribuible al trabajador: `cleaning_confirmed`; eliminar pregunta humana redundante, pero `canDeclareReady=false` hasta resolver gates independientes (QA cuando aplique, mantenimiento, reserva y acceso).
- Nota interna: `pilot_prepared` únicamente con versión nativa, revisión de privacidad y garantía de no notificación al huésped. Sin confirmación de audiencia/no-efectos, BLOQUEADO.
- Pago: `pilot_prepared` únicamente con folio/importe/moneda nativos, fuente verificable según efectivo/tarjeta/transferencia/Wink, consulta de duplicados e identidad/permisos. Nunca `bankReconciled` o `alegraPosted` por estar en Kross.
- Una evaluación favorable **no autoriza escribir**: `pmsWriteAuthorizedByThisPreflight=false` en todo caso; cualquier `mobile.ui.act`, registro de cobro, emisión fiscal, mensaje o modificación de notas requiere piloto distinto, autenticado, minimizado, aprobado con acción exacta, lectura posterior y recibo de Control Plane. No usar un usuario de caja/recepción como llave maestra del Portal.

### 7.2 Primera prueba útil

Sobre las tareas existentes, verificar **una habitación concreta ya marcada limpia en Kross**, obtener estado/fecha/identidad desde el PMS (no desde memoria ni correo) y mostrar que TORO no pide confirmación adicional a Aseo. Después **una reserva sintética o registro histórico de solo lectura** para aprender campo de nota interna y la sección de pagos/folio, sin pulsar Guardar o Cobrar. Documentar objetos nativos, versión de app, alcance de login, capturas redactadas/no PII y discrepancias de campo. Probar luego rechazo a rol ajeno, fuente caducada, duplicados, desconexión y cierre de sesión, y conservar contingencia manual.

**Continuidad del programa:** los schedules actuales de auditoría, PayFlow, Kross/WeSpeak y 20:00 no se modifican; nuevas señales reducen relecturas solo tras prueba de cobertura real. Estado: corrección del propietario y preparación incorporadas en PR #381, **no main, no runtime, no sesión Kross ni escritor**.
