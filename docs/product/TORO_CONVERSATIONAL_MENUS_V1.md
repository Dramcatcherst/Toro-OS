# TORO Brain — Conversational Menus & Suggested Actions V1

**Status:** CURRENT PRODUCT SPEC  
**Date:** 2026-09-23  
**Master product:** TORO Brain  
**Owners:** TORO User Portal + TORO Comms + TORO Identity + TORO People  
**Machine-readable profiles:** data/toro_conversational_menu_profiles_v1.json  
**Structured submenus/continuations:** data/toro_conversational_submenus_v2.json  
**Role message experience:** docs/product/TORO_ROLE_MESSAGE_EXPERIENCE_V1.md  
**Message pack:** data/toro_role_message_pack_v1.json  
**Role toolbox:** docs/product/TORO_ROLE_TOOLBOX_V1.md  
**Toolbox manifest:** data/toro_role_toolbox_v1.json  
**Runtime state:** SYNTHETIC EXPERIENCE LAB CONNECTED / NOT PRODUCTION-VERIFIED

---

## 1. Product decision

TORO should feel like a conversation with someone who already understands the user, with menus acting as **fast shortcuts**, not rigid navigation trees.

A user can always:
- reply with a number;
- reply with the option word;
- use a natural-language sentence;
- tap a button/chip when the channel supports it;
- say "menú" to return home;
- say "atrás" to go one level back;
- say "más" to reveal secondary options.

Core principle:

> **Conversation first. Suggested next actions always. Menus when they save effort.**

---

## 2. Interaction grammar

### Universal shortcuts
- `0` or **menú / inicio** -> role/context home.
- `9` or **atrás** -> previous menu/context.
- `+` or **más** -> secondary options.
- **ayuda** -> explain what can be done here in plain language.
- **buscar <texto>** -> governed search where authorized.

### Option resolution

For each visible option TORO accepts:
- numeric index;
- canonical keyword;
- common aliases/synonyms;
- ordinary sentence expressing the same intent.

Example:

`1`, `hoy`, `qué pasa hoy`, `dame el resumen`

should all resolve to the same current-context intent when unambiguous.

Numbers are session/menu scoped. A stale menu number must not silently execute a consequential action after context has materially changed.

---

## 3. Suggested actions contract

Every useful answer should end, when appropriate, with **1–3 high-value next actions**.

Good:
- **1. Ver detalle**
- **2. Asignar a alguien**
- **3. Marcar resuelto**

Bad:
- 12 generic choices;
- unrelated promotions;
- repeating the full main menu after every answer.

For channels with buttons, render as quick actions/chips.

For plain chat:
> **¿Qué hacemos?**  
> 1️⃣ Ver detalle  
> 2️⃣ Asignar  
> 3️⃣ Resolver

The user may still type anything else.

---

## 3A. Next-best-action contract

TORO should not merely end with “¿algo más?”.

When useful, it should offer **1–3 contextual continuations** selected from:
- the most likely next step in the current workflow;
- the next unresolved related item;
- a safe complementary action;
- home/back only when genuinely useful.

Examples:
- after a quote: **Ver mensaje · Cambiar opción · Preparar envío**;
- after room completion: **Siguiente habitación · Reportar algo · Inicio**;
- after a blocked action: **Ver qué falta · Hacer lo que sí se puede · Pedir ayuda**.

Rules:
- never suggest an action hidden or unauthorized for the user;
- if one next action is clearly best, show one rather than three;
- “continuar” resumes the most recent active workflow only when identity/context/session match is safe;
- short confirmations never bypass approvals;
- ambiguity fails closed and TORO asks or shows choices.

Structured defaults live in:
- data/toro_conversational_submenus_v2.json

## 3B. Conversational continuation words

Besides numeric choices, TORO should understand workflow-local words such as:
- **continuar**;
- **sí / dale / listo** when one explicit next action is pending;
- **cambiar**;
- **ver**;
- **enviar** when the intended action is unambiguous and permitted;
- **después / ahora no** to pause optional setup;
- **saltar** for optional onboarding steps.

## 4. Menu depth

Default maximum:
- Level 0: role home;
- Level 1: domain submenu;
- Level 2: action/detail only when necessary.

Avoid deeper trees.

If a workflow needs more depth:
- TORO should resolve intent conversationally;
- use search/filter;
- hand off to Portal detail if visual depth is better.

---

## 5. Personalization — “TORO knows me”

TORO may make the experience feel personal using **authorized, relevant and fresh** context.

Useful personalization:
- first/preferred name;
- active role and position;
- active business/property;
- today's shift or work window;
- assigned/open tasks;
- unresolved handoffs;
- recent workflow context;
- permitted preferences;
- frequently used actions;
- explicitly saved favorites;
- language/formality preference.

Examples:
- “Buenos días, Camila. Hoy estás en Recepción. Tienes 3 llegadas pendientes de revisar.”
- “Mauricio, quedaron 2 decisiones tuyas abiertas desde ayer.”
- “Oliver, primero tienes una tarea de alta prioridad en Toro Villa.”

Do not personalize with:
- stale data presented as current;
- private personal context inside work/group chat;
- medical, financial-private or HR-sensitive facts outside the authorized context;
- inferred personality labels;
- information from another user's conversation.

### Personalization priority

1. Current safety/urgent exception.
2. Current work context.
3. User's likely next task.
4. Frequent/favorite shortcut.
5. General menu.

TORO should not force a personalized greeting on every message.

---

## 6. Emotion and visual language

Menus may be warmer and more expressive than operational tables.

Use one semantic emoji per menu option where helpful.

Recommended semantic vocabulary:
- ☀️ Hoy
- 🛎️ Huéspedes
- 🛏️ Habitaciones
- 🧹 Aseo
- 🔧 Mantenimiento
- 👥 Equipo
- 🗓️ Horario
- 💬 Mensajes
- 💰 Dinero
- 🧾 Facturas
- ✅ Aprobar / Listo
- ⚠️ Atención
- 📈 Crecimiento
- ⭐ Reviews / reputación
- 📚 Conocimiento
- ⚙️ Sistemas
- 🔎 Buscar
- 🎯 Prioridades
- ✨ Experiencias / special moments where appropriate

Rules:
- emojis support scanning; they do not replace words;
- serious complaints, safety, legal, sensitive HR and money disputes reduce decorative emotion;
- TERE's existing guest-facing emoji limits still apply to normal message prose; menu option icons may remain semantic;
- do not make every message celebratory.

---

## 7. Dynamic menu assembly

The menu shown to a person is a projection of:

`identity ∩ active context ∩ membership ∩ role ∩ position ∩ permission ∩ enabled capabilities ∩ current state ∩ relevance`

Personalization never grants authority.

Menu visibility is not permission.

Before an action executes, effective authority is resolved again through the normal TORO policy/action model.

### Ranking

Rank visible actions by:
1. urgent/current exceptions;
2. tasks due now;
3. role frequency;
4. user frequency/favorites;
5. likely next step;
6. general capabilities.

Keep the first screen to approximately 4–6 primary options.

---


## 7A. Menu option contract

Each machine-readable menu option contains:
- `key`;
- `emoji`;
- `label`;
- `aliases`;
- `capability`.

Example:

```json
{
  "key": "quote_sell",
  "emoji": "💵",
  "label": "Cotizar / vender",
  "aliases": ["cotizar", "vender", "precio"],
  "capability": "hospitality.quote"
}
```

UI-only controls use the `ui.` capability prefix (for example `ui.more`).

Every non-UI capability must exist in the corresponding role toolbox profile. CI audits this alignment.

## 8. Role menu profiles

These are default starting points. Runtime rendering must filter them by current permission and enabled capability.


### 8.0 Personal

Opening:
> **Hola, {first_name} 👋 Esto es lo que puede ayudarte a ordenar tu día.**

Primary:
1. ☀️ **Hoy**
2. 🗓️ **Calendario**
3. ✅ **Mis tareas**
4. 💬 **Mensajes**
5. 🎯 **Proyectos / metas**
6. ➕ **Más**

Personal mode never silently injects employer data. Organization summaries appear only through an explicit allowed transition/overlay.

### 8.1 Owner / Executive

Opening:
> **Buen día, {name}. Esto es lo que más importa ahora.**

Primary:
1. 🎯 **Hoy** — executive brief / exceptions.
2. ✅ **Decisiones** — approvals and decisions.
3. 💰 **Dinero** — cash/obligations/exceptions.
4. 🏨 **Hotel / Operación** — readiness and incidents.
5. 📂 **Proyectos** — blockers and progress.
6. ➕ **Más**

More:
- 👥 Equipo
- 📈 Crecimiento
- ⚙️ Sistemas
- 📚 Conocimiento
- 🔎 Buscar
- 🧠 Preguntar a TORO

### 8.2 Gerencia

Primary:
1. ☀️ **Hotel hoy**
2. 🛎️ **Huéspedes**
3. 🛏️ **Habitaciones**
4. 👥 **Equipo**
5. ⚠️ **Pendientes**
6. ➕ **Más**

More:
- ✅ Aprobaciones
- 🛒 Compras / solicitudes
- 💰 Excepciones de dinero
- 🗓️ Turnos
- 📊 Reportes
- 🔎 Buscar

### 8.3 Recepción

Primary:
1. 🛎️ **Llegadas y salidas**
2. 💬 **Huéspedes / mensajes**
3. 💵 **Cotizar / vender**
4. 🛏️ **Habitaciones y villas**
5. ✨ **Experiencias**
6. ➕ **Más**

More:
- 📋 Reservas / datos live when authorized
- 💳 Pagos / estado when authorized
- ⚠️ Problemas del huésped
- ⭐ Seguimiento / reviews
- 📚 Cómo responder / conocimiento
- 🔎 Buscar huésped / reserva

Suggested natural commands:
- “Cotiza para 4 personas”
- “¿Qué le recomiendo a esta pareja?”
- “Tengo un problema en la 26”
- “Mándame el mensaje de check-in”

### 8.4 Aseo / Housekeeping

Primary:
1. 🧹 **Mis habitaciones**
2. 🎯 **Qué hago ahora**
3. ✅ **Marcar listo**
4. ⚠️ **Reportar problema**
5. 📚 **Cómo se hace**
6. ➕ **Más**

More:
- 🧺 Lavandería
- 🧴 Insumos
- ✨ Tareas extra / puntos where enabled
- 🗓️ Mi horario
- 💬 Avisar / pedir ayuda

### 8.5 Mantenimiento

Primary:
1. 🔧 **Prioridades**
2. 🧰 **Mis tareas**
3. ⚠️ **Reportar falla**
4. 📦 **Materiales / repuestos**
5. ✅ **Cerrar con evidencia**
6. ➕ **Más**

More:
- 🔁 Preventivo
- ⚡ Energía / utilities where enabled
- 🏨 Áreas / habitaciones
- 📚 SOP / instrucciones
- 🗓️ Mi horario

### 8.6 Jefe de departamento / líder operativo

Primary:
1. 🎯 **Equipo hoy**
2. 🗓️ **Cobertura y turnos**
3. ⚠️ **Incidentes**
4. ✅ **Aprobar / revisar**
5. 🔄 **Handoffs**
6. ➕ **Más**

More:
- 📊 Carga de trabajo
- 👤 Persona / colaborador
- 📚 SOP
- ✨ Reconocimiento
- 🔎 Buscar

### 8.7 Contabilidad / Finanzas

Primary:
1. 💰 **Pagos y obligaciones**
2. 💳 **Cobros pendientes**
3. 🔄 **Conciliar**
4. 🧾 **Facturas / comprobantes**
5. 📊 **Reportes**
6. ➕ **Más**

More:
- 👥 Planilla / interfaz autorizada
- ⚠️ Diferencias
- 📁 Evidencia
- ✅ Aprobaciones
- 🔎 Buscar movimiento/documento

### 8.8 RRHH / People

Primary:
1. ⏱️ **Asistencia**
2. 🗓️ **Horarios**
3. 🙋 **Solicitudes**
4. 👥 **Colaboradores**
5. 💵 **Planilla**
6. ➕ **Más**

More:
- 🏖️ Vacaciones/licencias
- 📄 Documentos
- 🎓 Onboarding/capacitación
- ✨ Reconocimiento/puntos
- ⚠️ Excepciones
- 🔎 Buscar colaborador

### 8.9 Growth / Marketing

Primary:
1. ⭐ **Reviews**
2. 💬 **Inbox / leads**
3. 📣 **Campañas**
4. 📈 **Oportunidades**
5. 🎨 **Contenido**
6. ➕ **Más**

More:
- 🔎 SEO
- 🤝 Partners
- ✨ Experiencias/ofertas
- 📊 Resultados
- 🧪 Experimentos

### 8.10 Systems / Admin

Primary:
1. ⚙️ **Salud de sistemas**
2. 🚨 **Incidentes**
3. 🔌 **Integraciones**
4. 🚀 **Deployments**
5. 🛡️ **Seguridad / backups**
6. ➕ **Más**

More:
- 🗄️ Datos / freshness
- 👤 Accesos
- 📋 Auditoría
- 🔧 Configuración
- 🔎 Buscar sistema

### 8.11 Auditor

Primary:
1. 🧾 **Cambios**
2. 📁 **Evidencia**
3. ✅ **Aprobaciones**
4. 🔗 **Fuentes**
5. 📤 **Exportar**
6. 🔎 **Buscar**

Auditor menus stay evidence-first and largely read-only.

### 8.12 Empleado general

Primary:
1. ☀️ **Mi día**
2. ✅ **Mis tareas**
3. 🗓️ **Mi horario**
4. 🙋 **Solicitudes**
5. 💬 **Mensajes**
6. ➕ **Más**

More:
- 📚 Cómo hacer algo
- ✨ Puntos / reconocimiento
- 👤 Mi perfil
- 🧰 Herramientas permitidas
- 🆘 Pedir ayuda

---

## 9. Guest/customer menus

Menus for customers are optional shortcuts. TERE should continue to understand normal language.

### Prospect / no reservation known

> **¡Hola! Soy Tere 😊 Cuéntame qué estás buscando o elige una opción:**

1. 🏡 **Buscar alojamiento**
2. 💵 **Cotizar**
3. ✨ **Qué hacer en Santa Teresa**
4. 📍 **Conocer Dreamcatcher**
5. 💬 **Preguntar otra cosa**

### Guest with confirmed reservation

> **Hola, {name} 👋 Ya tengo tu estadía en contexto. ¿Qué necesitas?**

1. 🧳 **Mi llegada**
2. 🏡 **Mi habitación / villa**
3. ✨ **Experiencias**
4. 🍳 **Desayuno / extras**
5. 🆘 **Necesito ayuda**
6. ➕ **Más**

More:
- transporte;
- late checkout / extensión where authority permits;
- servicios;
- recomendaciones;
- salida;
- review/post-stay when appropriate.

### In-stay issue mode

Do not show sales-first menus.

Prioritize:
1. 🆘 Resolver ahora
2. 🔧 Mantenimiento
3. 🧹 Limpieza
4. 💬 Hablar con recepción
5. 📍 Otra necesidad

---

## 10. Contextual submenu examples

### Owner -> Dinero

> **💰 Dinero**
> 1️⃣ Pagos de hoy  
> 2️⃣ Cobros pendientes  
> 3️⃣ Flujo / cuánto necesitamos  
> 4️⃣ Diferencias por revisar  
> 5️⃣ Reporte del mes  
> 9️⃣ Atrás · 0️⃣ Inicio

### Reception -> Cotizar / vender

> **💵 ¿Qué quieres hacer?**
> 1️⃣ Nueva cotización  
> 2️⃣ Seguir una cotización  
> 3️⃣ Recomendar habitación  
> 4️⃣ Revisar disponibilidad live  
> 5️⃣ Enviar opciones al huésped  
> 9️⃣ Atrás

### Housekeeping -> Reportar problema

> **⚠️ ¿Qué pasó?**
> 1️⃣ Mantenimiento  
> 2️⃣ Falta un insumo  
> 3️⃣ Daño / objeto roto  
> 4️⃣ Habitación no puede quedar lista  
> 5️⃣ Otro — escríbemelo o mándame foto

---

## 11. Response continuation

After every action TORO should preserve the conversational state.

Example:

User: `1`

TORO:
> **☀️ Hotel hoy**
> 2 habitaciones necesitan atención antes de llegada y hay 1 handoff sin confirmar.
>
> **¿Qué quieres revisar primero?**
> 1️⃣ Habitaciones
> 2️⃣ Handoff
> 3️⃣ Ver todo

User: `1`

TORO resolves `1` against the active submenu, not the global home.

After completion:
> **Listo. Quedó asignado y te aviso cuando haya evidencia de cierre.**
>
> 1️⃣ Ver la otra habitación  
> 2️⃣ Volver a Hotel hoy  
> 0️⃣ Inicio

---

## 12. Proactive suggestions

TORO may reorder or suggest actions when there is real evidence.

Examples:
- “Antes de abrir el menú: tienes una llegada en 35 min y la habitación sigue NOT READY.”
- “Normalmente revisas pagos a esta hora. Hay 2 obligaciones para hoy. ¿Las vemos?”
- “Ayer dejaste esta conciliación incompleta. ¿Continuamos?”

Rules:
- never invent urgency;
- do not expose private data in group channels;
- do not use personalization to manipulate;
- user can disable/reduce proactive suggestions;
- frequently used actions may become favorites only with transparent control.

---

## 13. Onboarding integration

During onboarding, do not teach the whole menu.

After the first useful task:
> **Esto es lo que más probablemente vas a usar:**
> 1️⃣ {role shortcut 1}
> 2️⃣ {role shortcut 2}
> 3️⃣ {role shortcut 3}
>
> Puedes responder con el número, escribir la palabra o simplemente decirme qué necesitas.

Later:
- introduce secondary menu only when useful;
- allow `menú` at any time;
- show "más" instead of long lists;
- remember permitted favorites;
- offer "personalizar mi menú" once the user has enough usage evidence.

---

## 14. Menu configuration and learning

The static profile is only a default.

Runtime menu can learn:
- most-used allowed actions;
- repeated workflows;
- ignored options;
- preferred wording;
- channel preference;
- favorite shortcuts.

Learning must not change:
- permission;
- source authority;
- risk gate;
- approval requirement.

User controls:
- pin/unpin favorite;
- reset menu order;
- reduce suggestions;
- restore default role menu.

---

## 15. Menu telemetry

Measure:
- time to first action;
- number vs keyword vs free-text usage;
- menu abandonment;
- submenu depth;
- wrong-intent corrections;
- suggested-action acceptance;
- search fallback rate;
- favorite usage;
- time-to-completion;
- user-specific top actions;
- accessibility/mobile completion.

Do not optimize solely for clicks. Optimize for successful outcomes with low cognitive effort.

---

## 16. Definition of done

Conversational Menus V1 is ready when:
- number/keyword/free-text resolve consistently;
- menu state survives normal conversational continuation;
- role/position/context filters are permission-safe;
- user sees only relevant enabled capabilities;
- main menus fit approximately 4–6 primary actions;
- most common task can begin in <=3 interactions where practical;
- every completed action offers sensible next steps;
- customer/guest menus adapt to lifecycle stage;
- serious contexts suppress decorative emotion;
- user can return with menú/atrás/más predictably;
- menu usage can personalize ordering without changing authority.


---

## 16A. Synthetic Experience Lab

Current safe integration:
- route: `/experience-lab`;
- personas: Owner, Reception, TERE Prospect, TERE In-Stay;
- uses the real menu resolver and structured submenu definitions;
- supports number, keyword and conservative natural-language phrase resolution;
- local/synthetic responses only;
- no private business data;
- no external sends, reservation changes, money movement or other production writes.

This proves the interaction contract can be exercised in a real UI surface.

It does **not** prove:
- WhatsApp/WeSpeak runtime consumption;
- production identity/session continuity;
- live capability availability;
- live source authority;
- production action execution;
- real-user adoption.

Promotion to a production surface requires role/identity context, permission filtering, session/menu-state persistence, channel rendering and real-user QA.
