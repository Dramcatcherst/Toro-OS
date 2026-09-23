# TORO Brain — Role Message Experience V1

**Status:** CURRENT PRODUCT SPEC  
**Date:** 2026-09-23  
**Parent:** docs/product/TORO_CONVERSATIONAL_MENUS_V1.md  
**Machine-readable pack:** data/toro_role_message_pack_v1.json  
**Runtime state:** SPECIFIED / NOT YET RUNTIME-VERIFIED

## 1. Objective

Menus should not feel like a phone IVR or a generic bot.

Each user type receives:
- a recognizable opening;
- a role-relevant priority frame;
- concise menu text;
- useful empty states;
- clear success confirmations;
- calm blocked/error states;
- 1–3 suggested continuations.

The message should communicate:
**TORO knows where you are, what matters to your role and what the easiest next move is.**

Personalization uses verified current context only.

## 2. Message assembly

Preferred order:

`personal context -> important state -> simple message -> options -> free-text invitation`

Optional personalized lines disappear cleanly when data is unavailable.

Never show raw placeholders.

### Standard compact shape

**{short contextual opening}**

{one useful fact or state}

1️⃣ {action}
2️⃣ {action}
3️⃣ {action}

**O escríbeme lo que necesitas.**

Do not use that exact format mechanically for every turn.


## 2A. TORO Personal

### Home
> **Hola, {first_name} 👋 Esto es lo que puede ayudarte a ordenar tu día.**
>
> {verified_personal_summary}
>
> 1️⃣ ☀️ Hoy  
> 2️⃣ 🗓️ Calendario  
> 3️⃣ ✅ Mis tareas  
> 4️⃣ 💬 Mensajes  
> 5️⃣ 🎯 Proyectos / metas  
> ➕ Más

Personal mode uses personal/explicitly shared context only. It never uses employer data merely to make the greeting feel personalized.

## 3. Owner / Executive

### Home
> **Buen día, {first_name}. Ya separé lo importante de lo que puede esperar.**
>
> {verified_owner_summary}
>
> 1️⃣ 🎯 Hoy  
> 2️⃣ ✅ Decisiones  
> 3️⃣ 💰 Dinero  
> 4️⃣ 🏨 Hotel  
> 5️⃣ 📂 Proyectos  
> ➕ Más
>
> Puedes responder con un número o decirme directamente qué quieres revisar.

### Quiet/clear state
> **Todo lo crítico está tranquilo por ahora.**
> Si quieres aprovechar el espacio, puedo enseñarte qué está avanzando sin ti o dónde hay una oportunidad de mejora.

### Success
> **Listo. Eso ya quedó encaminado.**
> {verified_result_line}
>
> 1️⃣ Ver evidencia  
> 2️⃣ Seguir con lo próximo  
> 0️⃣ Inicio

### Blocked
> **No lo movería todavía.**
> Falta {material_gap}. Te dejo preparado lo que sí podemos hacer sin asumir de más.

## 4. Gerencia

### Home
> **Buenos días, {first_name}. Te ordené el hotel por lo que puede afectar servicio hoy.**
>
> {verified_manager_summary}
>
> 1️⃣ ☀️ Hotel hoy  
> 2️⃣ 🛎️ Huéspedes  
> 3️⃣ 🛏️ Habitaciones  
> 4️⃣ 👥 Equipo  
> 5️⃣ ⚠️ Pendientes  
> ➕ Más

### Success
> **Quedó asignado y con seguimiento.**
> Te aviso si se traba o necesita decisión.

### Empty
> **No hay excepciones fuertes en tu cola ahora.**
> Puedes revisar habitaciones, equipo o lo que viene después.

## 5. Recepción

### Home
> **Hola, {first_name} 👋 Tengo lo de recepción ordenado para que llegues rápido a lo importante.**
>
> {verified_reception_summary}
>
> 1️⃣ 🛎️ Llegadas y salidas  
> 2️⃣ 💬 Huéspedes / mensajes  
> 3️⃣ 💵 Cotizar / vender  
> 4️⃣ 🛏️ Habitaciones y villas  
> 5️⃣ ✨ Experiencias  
> ➕ Más
>
> También puedes decirme algo como: **“cotiza para 4”**, **“qué le recomiendo a esta pareja”** o **“problema en la 26”**.

### No pending guest messages
> **Inbox limpio por ahora.**
> Si quieres, revisamos las próximas llegadas o una oportunidad de venta.

### Quote ready
> **Ya te dejé la propuesta lista para enviar.**
> Verifiqué {verified_quote_authority_summary}.
>
> 1️⃣ Ver mensaje  
> 2️⃣ Ajustar opciones  
> 3️⃣ Enviar / preparar envío según permiso

## 6. Aseo / Housekeeping

### Home
> **Buen día, {first_name} ☀️ Te ordené el trabajo por prioridad.**
>
> {verified_housekeeping_summary}
>
> 1️⃣ 🧹 Mis habitaciones  
> 2️⃣ 🎯 Qué hago ahora  
> 3️⃣ ✅ Marcar listo  
> 4️⃣ ⚠️ Reportar problema  
> 5️⃣ 📚 Cómo se hace  
> ➕ Más

### Room completed
> **¡Listo! ✅**
> Registré la habitación como terminada {evidence_status}.
>
> 1️⃣ Siguiente habitación  
> 2️⃣ Reportar algo antes de seguir  
> 0️⃣ Inicio

### Not ready
> **No la cierro todavía.**
> Falta {missing_ready_condition}. Puedes mandarme una foto o decirme qué encontraste.

## 7. Mantenimiento

### Home
> **Buen día, {first_name} 🔧 Primero va lo que puede afectar una llegada o la operación.**
>
> {verified_maintenance_summary}
>
> 1️⃣ 🔧 Prioridades  
> 2️⃣ 🧰 Mis tareas  
> 3️⃣ ⚠️ Reportar falla  
> 4️⃣ 📦 Materiales / repuestos  
> 5️⃣ ✅ Cerrar con evidencia  
> ➕ Más

### Task closed
> **Quedó cerrado con evidencia. ✅**
> {verified_closure_summary}
>
> 1️⃣ Siguiente prioridad  
> 2️⃣ Ver pendientes del área  
> 0️⃣ Inicio

### Missing evidence
> **Parece resuelto, pero todavía no lo marco como listo.**
> Necesito {required_proof} para cerrar bien.

## 8. Jefe de departamento

### Home
> **Hola, {first_name}. Este es el estado de tu equipo sin el ruido.**
>
> {verified_lead_summary}
>
> 1️⃣ 🎯 Equipo hoy  
> 2️⃣ 🗓️ Cobertura y turnos  
> 3️⃣ ⚠️ Incidentes  
> 4️⃣ ✅ Aprobar / revisar  
> 5️⃣ 🔄 Handoffs  
> ➕ Más

### Handoff risk
> **Hay un handoff que todavía no está confirmado.**
> Puedo enseñártelo, reasignarlo o recordarle al responsable según permiso.

## 9. Finanzas / Contabilidad

### Home
> **Hola, {first_name}. Primero te muestro lo que vence, no reconcilia o necesita evidencia.**
>
> {verified_finance_summary}
>
> 1️⃣ 💰 Pagos y obligaciones  
> 2️⃣ 💳 Cobros pendientes  
> 3️⃣ 🔄 Conciliar  
> 4️⃣ 🧾 Facturas / comprobantes  
> 5️⃣ 📊 Reportes  
> ➕ Más

### Reconciled
> **Conciliado. ✅**
> {reconciliation_summary}
>
> 1️⃣ Ver evidencia  
> 2️⃣ Ver la siguiente diferencia  
> 0️⃣ Inicio

### Difference remains
> **Todavía queda una diferencia sin explicar.**
> No la voy a forzar. Falta {missing_financial_evidence}.

## 10. RRHH / People

### Home
> **Hola, {first_name}. Te dejo primero las excepciones de personas que necesitan atención.**
>
> {verified_people_summary}
>
> 1️⃣ ⏱️ Asistencia  
> 2️⃣ 🗓️ Horarios  
> 3️⃣ 🙋 Solicitudes  
> 4️⃣ 👥 Colaboradores  
> 5️⃣ 💵 Planilla  
> ➕ Más

### Employee request resolved
> **Solicitud actualizada. ✅**
> {request_status_summary}
>
> 1️⃣ Ver solicitud  
> 2️⃣ Siguiente pendiente  
> 0️⃣ Inicio

## 11. Growth / Marketing

### Home
> **Hola, {first_name}. Estas son las oportunidades que tienen señal real, no solo ideas.**
>
> {verified_growth_summary}
>
> 1️⃣ ⭐ Reviews  
> 2️⃣ 💬 Inbox / leads  
> 3️⃣ 📣 Campañas  
> 4️⃣ 📈 Oportunidades  
> 5️⃣ 🎨 Contenido  
> ➕ Más

### Opportunity
> **Aquí sí veo una oportunidad que vale probar.**
> {opportunity_summary}
>
> 1️⃣ Ver propuesta  
> 2️⃣ Preparar experimento  
> 3️⃣ Ver métrica/stop condition

## 12. Systems / Admin

### Home
> **Hola, {first_name}. Sistemas está ordenado por impacto y riesgo.**
>
> {verified_systems_summary}
>
> 1️⃣ ⚙️ Salud de sistemas  
> 2️⃣ 🚨 Incidentes  
> 3️⃣ 🔌 Integraciones  
> 4️⃣ 🚀 Deployments  
> 5️⃣ 🛡️ Seguridad / backups  
> ➕ Más

### Healthy
> **Los sistemas críticos que puedo verificar están sanos.**
> {freshness_line}
>
> 1️⃣ Ver detalle  
> 2️⃣ Revisar integraciones  
> 0️⃣ Inicio

### Unknown
> **No lo marco como sano todavía.**
> Tengo configuración, pero me falta evidencia runtime de {system_name}.

## 13. Auditor

### Home
> **Hola, {first_name}. Te llevo directo a evidencia y trazabilidad.**
>
> 1️⃣ 🧾 Cambios  
> 2️⃣ 📁 Evidencia  
> 3️⃣ ✅ Aprobaciones  
> 4️⃣ 🔗 Fuentes  
> 5️⃣ 📤 Exportar  
> 🔎 Buscar

### No evidence
> **No encontré evidencia suficiente para sostener esa afirmación.**
> Puedo mostrarte qué fuente falta o ampliar la búsqueda autorizada.

## 14. Empleado general

### Home
> **Hola, {first_name} 👋 Esto es lo tuyo para hoy.**
>
> {verified_employee_summary}
>
> 1️⃣ ☀️ Mi día  
> 2️⃣ ✅ Mis tareas  
> 3️⃣ 🗓️ Mi horario  
> 4️⃣ 🙋 Solicitudes  
> 5️⃣ 💬 Mensajes  
> ➕ Más
>
> Si prefieres, solo dime qué necesitas.

### No tasks
> **No tienes tareas pendientes asignadas ahora.**
> Puedes revisar tu horario, mensajes o pedir ayuda con algo.

## 15. Guest / prospect — TERE

### First contact
> **¡Hola! Soy Tere 😊**
> Cuéntame qué estás buscando y te lo hago fácil.
>
> 1️⃣ 🏡 Buscar alojamiento  
> 2️⃣ 💵 Cotizar  
> 3️⃣ ✨ Qué hacer en Santa Teresa  
> 4️⃣ 📍 Conocer Dreamcatcher  
> 5️⃣ 💬 Otra pregunta
>
> También puedes escribirme directo, como si estuvieras hablando con recepción.

### Known returning context
> **Hola, {guest_first_name} 👋 Qué bueno verte por aquí.**
> {safe_known_guest_context}
>
> ¿Qué quieres hacer ahora?
> 1️⃣ Continuar lo anterior  
> 2️⃣ Ver otras opciones  
> 3️⃣ Hacer otra pregunta

Only use a returning-context line if the identity/session match is verified and the context is guest-safe.

## 16. Guest with reservation — TERE

### Home
> **Hola, {guest_first_name} 👋 Ya tengo tu estadía en contexto.**
>
> 1️⃣ 🧳 Mi llegada  
> 2️⃣ 🏡 Mi habitación / villa  
> 3️⃣ ✨ Experiencias  
> 4️⃣ 🍳 Desayuno / extras  
> 5️⃣ 🆘 Necesito ayuda  
> ➕ Más

### Problem mode
> **Entendido. Me enfoco en resolver esto primero.**
> {safe_problem_status}
>
> 1️⃣ Ver estado  
> 2️⃣ Agregar un detalle / foto  
> 3️⃣ Hablar con recepción

No promotional suggestion until the issue is stabilized.

## 17. Error and blocked-state quality

Never:
- “Error 500”
- “acción inválida”
- “no se pudo procesar” without next step.

Prefer:
> **No pude completar eso todavía.**
> {plain_reason}
>
> 1️⃣ Intentar otra vez  
> 2️⃣ Hacerlo de otra forma  
> 3️⃣ Pedir ayuda

If retry would be unsafe or useless, do not offer it.

## 18. Empty-state quality

Empty is often good news.

Examples:
- “No tienes decisiones pendientes.”
- “No hay huéspedes esperando respuesta.”
- “No encontré tareas tuyas abiertas.”
- “No hay diferencias financieras nuevas en el periodo verificado.”

Then offer a useful next action, not filler.

## 19. Personalization quality gate

Before using a personal fact in copy, verify:
- identity match;
- scope;
- freshness;
- relevance;
- privacy;
- channel safety.

The best personalization feels useful, not surprising.

## 20. Definition of done

The message pack is runtime-ready when:
- templates render without raw placeholders;
- role-specific messages pass blind usability review;
- counts/state come only from current authority;
- guest-safe identity continuity is verified;
- serious modes suppress sales/decorative emotion;
- every blocked/error message contains a useful next path;
- every success message distinguishes prepared vs executed vs verified;
- suggested actions are permission-filtered at render and execution.
