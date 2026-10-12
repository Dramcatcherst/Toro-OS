# TORO User Portal v1 — Personal + Work Experience

**Status:** CURRENT PRODUCT SPEC
**Date:** 2026-09-23
**Depends on:** TORO Identity, TORO User Vault, TORO People, TORO Comms, TORO Tools

## 1. Product rule

The user should feel they have **one TORO**.

TORO adapts to context:
- Personal;
- Dreamcatcher;
- another organization;
- future workspaces.

The user does not log into separate TORO products for HR, communication, tools or personal assistance.

## 2. Context switcher

Persistent top-level control:

`TORO · Personal ▾`

or

`TORO · Dreamcatcher ▾`

Possible choices:
- Personal;
- organizations where membership is active;
- no hidden organization based only on role rows or email.

Context switch changes:
- visible data;
- tools;
- memory scopes;
- actions;
- navigation;
- approval ceilings;
- notifications.

It does not change the human identity.

## 3. Privacy indicator

Every surface must make context clear without visual noise.

### Personal
Indicator: **Privado para ti**

Organization cannot read TORO Personal content by default.

### Work
Indicator: organization name + role context.

Personal User Vault is not silently injected into work reasoning.

Cross-context actions require an explicit transition.

## 4. Personal Home

**Visible classification, 2026-10-10:** the shared entry is Cerebro / Brain, Module 0, alongside eleven unchanged domain modules. It introduces no extra personal or work memory, authority or identity. Existing context-change clearing, privacy and role-focused views still apply; the declaration is TARGET until its implementation is verified.

TARGET entry direction (2026-09-30): this and the work/owner Home blocks below describe the initial **focus inside the same permission-filtered Brain**, not separate landing products. Personal remains private; a context switch must clear prior-scope nodes, counts, actions and cached detail before showing the new projection. Map and list expose the same authorized objects. Today/Attention is available without leaving the shared shell. Current runtime is unchanged pending reviewed implementation.

Primary question:
**What matters to me now?**

Blocks:
1. Today
2. My tasks/reminders
3. Calendar
4. Important messages
5. Personal projects/goals
6. Travel/plans where connected
7. My tools
8. Ask TORO

Do not expose employer data except optional organization summary cards chosen by the user.

## 5. Employee Work Home

Primary question:
**What do I need to do today at work?**

Blocks:
1. Shift / schedule
2. My work
3. Handoffs
4. Messages that need me
5. Requests/status
6. Relevant SOP/knowledge
7. Recognition/points
8. Ask TORO

Bottom navigation target:
`Hoy · Mi trabajo · Mensajes · Herramientas · Yo`

Secondary:
- Horario;
- Solicitudes;
- Knowledge;
- Profile.

## 6. Department Lead Home

Adds:
- team coverage;
- unresolved handoffs;
- exceptions;
- approvals;
- workload;
- room/area readiness where relevant;
- recognition proposals.

No raw HR-private data merely because the user manages a department.

## 7. Owner / Executive Home

Blocks:
1. Needs my decision
2. What is wrong today
3. What advances without me
4. Projects
5. Team exceptions
6. Money exceptions
7. Systems health
8. Growth opportunities
9. Quick actions
10. Ask TORO

The executive home is exception-oriented, not a full dashboard of every metric.

## 8. Universal TORO assistant

Available from every screen.

Input:
- text;
- voice;
- image/photo;
- document where supported.

TORO already receives:
- resolved identity;
- active context;
- permitted data scopes;
- permitted tools;
- relevant screen/entity context.

The user should not need to explain:
- who they are;
- which company they are in;
- which specialist agent to use.


## 8A. Conversational menu system

Canonical specification:
- docs/product/TORO_CONVERSATIONAL_MENUS_V1.md
- data/toro_conversational_menu_profiles_v1.json

TORO must support the same intent through:
- numbered choices in chat;
- keywords/aliases;
- free text;
- buttons/chips where the surface supports them.

Universal navigation:
- 0 / menú / inicio;
- 9 / atrás;
- + / más;
- ayuda.

The visible menu is dynamically filtered and ranked by identity, context, role, position, permissions, enabled capabilities and current relevance.

Most screens/chats should expose 4–6 primary actions and no more than 1–3 suggested next actions after a result.

Role defaults exist for owner/executive, gerencia, recepción, aseo, mantenimiento, department leads, finance, RRHH, growth, systems, auditor, general employee and guest/customer lifecycle stages.

A learned/favorite menu order changes presentation only. It never changes authority.

## 9. Navigation by capability

TORO subsystems stay behind role-oriented navigation.

Examples:

**Mi trabajo** may use:
- TORO People;
- TORO Operations;
- TORO Projects.

**Mensajes** uses:
- TORO Comms.

**Herramientas** uses:
- TORO Tools.

**Dinero** uses:
- TORO Finance/Revenue.

**Huéspedes** uses:
- TORO Guests / TORO TERE.

The interface does not need to expose subsystem architecture unless an advanced/admin user asks.

## 10. My Tools

Two tabs:

### Personal
User-owned connectors:
- Gmail/Outlook;
- calendar;
- contacts;
- Drive/Dropbox;
- travel;
- personal productivity.

### Company
Organization-owned connectors the current role can access:
- Kross;
- WeSpeak;
- official email;
- Alegra;
- Dropbox/Drive;
- GitHub/Vercel/Supabase where appropriate.

Each card shows:
- connection state;
- owner;
- permitted actions;
- privacy;
- health;
- manage/request access.


## 10A. Role toolbox

Canonical:
- docs/product/TORO_ROLE_TOOLBOX_V1.md
- data/toro_role_toolbox_v1.json

The user sees jobs/capabilities rather than connector brands.

Capability state may be READY, READ_ONLY, CONNECT, REQUEST_ACCESS, DEGRADED, HIDDEN or BLOCKED.

There are no dead tool buttons:
- CONNECT -> offer connection flow;
- REQUEST_ACCESS -> offer governed access request;
- DEGRADED -> show safe fallback/stale-state behavior;
- HIDDEN -> do not clutter the interface.

Position-specific toolboxes (Reception, Aseo, Mantenimiento) override the generic employee experience where relevant.

## 11. What TORO knows about me

User-facing memory control.

Sections:
- confirmed preferences;
- work preferences;
- saved goals;
- connected tools;
- candidate memories;
- shared information;
- data/consent controls.

Actions:
- correct;
- confirm;
- make temporary;
- change scope;
- stop using;
- delete/request deletion;
- export.

TORO should be able to explain why a memory exists and its source category without exposing secrets.

## 12. TORO People — Recognition & Points

This is a feature of TORO People, not a new subsystem.

Purpose:
- recognize verified extra contribution;
- encourage useful work;
- make optional extra tasks visible;
- provide transparent criteria.

### Sources of points
Only structured/evidenced events:
- approved extra task;
- verified improvement;
- documented guest/service recovery;
- approved training completion;
- validated process improvement;
- special coverage/help.

### Never automatic from
- message volume;
- number of chats;
- being online;
- surveillance/keystrokes;
- manager favoritism without reason;
- private/personal activity.

### Required fields
- event;
- employee;
- reason;
- points;
- evidence;
- rule/version;
- proposed_by;
- approved_by if required;
- timestamp;
- reversal/correction path.

### User experience
Employee sees:
- balance;
- recent earned points;
- why;
- available voluntary extra tasks;
- redemption/use rules when defined.

Manager sees:
- pending recognition;
- rule consistency;
- anomalies;
- no arbitrary leaderboard by default.

## 13. Notifications

One notification system, context-aware.

Personal notifications never appear in organization dashboards unless the user chooses a private overlay.

Work categories:
- assignment;
- mention;
- handoff;
- approval;
- SLA;
- schedule/request;
- system outage.

Personal:
- reminder;
- calendar;
- travel;
- tool alert.

User controls:
- channel;
- quiet hours;
- digest;
- urgency threshold.

## 14. Cross-channel continuity

A task can start:
- WhatsApp;
- Portal;
- email;
- mobile notification.

It remains the same canonical object.

Example:

`WhatsApp message -> maintenance_event -> Portal detail -> WhatsApp completion notification`

Never create one task per channel.

## 15. Personal/work handoff examples

### Personal -> Work
User: "I have an appointment Friday; request the afternoon off."

TORO:
1. personal appointment details remain private;
2. creates a TORO People leave request with only required work facts;
3. user reviews what will be shared;
4. submits.

### Work -> Personal
User: "Remind me privately tonight to bring the replacement remote tomorrow."

TORO:
1. work task remains organization-owned;
2. personal reminder stores minimal reference;
3. employer does not get access to personal reminder context beyond the work task already owned by the company.

## 16. Progressive onboarding

Canonical specification:
- docs/product/TORO_PROGRESSIVE_ONBOARDING_V1.md

The first-run experience is **progressive, restartable and non-blocking**.

Default flow:
1. minimum identity/context;
2. ask what the user wants to accomplish;
3. create one useful outcome as early as safely possible;
4. optional personalization;
5. suggest only the tools/capabilities required for the chosen goal;
6. let the user skip/resume optional setup;
7. expand TORO later without repeating the whole onboarding.

Required product behavior:
- **Restart onboarding** is always available to the authorized user;
- restart resets onboarding presentation/progress, not canonical account/business data;
- completion never permanently hides onboarding;
- optional incomplete setup does not block normal use;
- a newly activated capability may show a short module introduction without restarting global onboarding;
- normal users never configure agents, prompts, models, databases or schemas.

Current production note:
public.employee_onboarding_progress is for employee learning/training and currently has 0 rows. It must not be used as the general TORO user-onboarding state.

## 17. Admin onboarding

Company admin configures:
- organization;
- people/memberships;
- role templates;
- tool connections;
- permissions;
- default TORO behavior;
- channels/groups;
- approval ceilings;
- data sources;
- notification defaults;
- recognition/points rules if enabled.

Advanced complexity stays progressive.

## 18. Feature flags

Every major capability can be enabled independently:
- TORO Personal;
- TORO People;
- TORO Comms;
- TORO Tools;
- Recognition & Points;
- Finance;
- Growth;
- OpenClaw channel;
- WeSpeak integration.

Disabled capability must disappear cleanly rather than leaving dead navigation.

## 19. Metrics

Measure value:
- tasks completed through TORO;
- handoffs resolved;
- time saved;
- unanswered important messages;
- decisions resolved;
- employee self-service completion;
- tool connection success;
- context/privacy errors;
- memory corrections/deletions;
- recognition events approved/reversed;
- workflows completed without owner intervention.

## 20. Definition of done

Portal v1 is ready when:
- one identity can move between Personal and at least one organization;
- context switch changes permissions correctly;
- personal data does not leak into work;
- employee common actions are <=3 taps where practical;
- TORO is available everywhere;
- tool ownership is understandable;
- communication objects are continuous across channels;
- user can inspect/correct TORO memory;
- role-specific navigation hides irrelevant complexity;
- no critical function requires a second TORO-branded app.


## Reporte diario de entorno y fechas especiales — Portal TORO (2026-10-12)

**DIRECTIVA DEL OWNER / TARGET:** incorporar clima diario, horas de pleamar/bajamar, luna y fechas especiales a recepción, Team Brief/Cierre Diario y Portal TORO, junto a visitas/agenda/actividades. Este módulo de información depende del mismo TORO Comms/Data/Research/Operations/Guests; no nuevo cerebro, calendario maestro, scheduler o backlog. La autorización cubre diseño e integración gobernada, no servicios pagos ni publicación de datos inciertos.

**CURRENT auditado:** Portal User v1 ya contiene Today/Calendar/contextos/privacidad; búsqueda de código encontró señales weather/tides en evidencia histórica de conocimiento, sin demostrar adapter UI/datos vivo. Supabase tiene `public.holidays`, `public.holiday_calendars`, `catalog.local_events`, sus gates y vistas públicas; la búsqueda de nombres no encontró tablas dedicadas weather/tide/moon, sin concluir ausencia de cualquier dato JSON. Calendar ya ofrece feriados/fases lunares: reutilizar sus IDs, no duplicar suscripciones. No se modificó código, despliegue ni esquema por esta directiva.

**Fuentes y ubicación:** IMN para pronóstico/avisos meteorológicos Costa Rica; MIO-CIMAR/UCR para predicciones marinas/mareas/fase lunar; contrastes de mareas universitarias con estación identificada. Fuentes consultadas: https://www.imn.ac.cr/es/web/imn/reporte-pronostico-regional ; https://miocimar.ucr.ac.cr/mareas ; https://miocimar.ucr.ac.cr/sobre-el-mio ; https://unacostasegura.una.ac.cr/webServices/mareas_detalle.php?cod=374&estacion=Puntarenas&id=16 . En esta sesión IMN devolvió 410 al acceso directo, MIO requiere JavaScript y UNA devolvió tabla fechada de Puntarenas. Resultados indexados son descubrimiento, no lectura vigente del reporte. No publicar condiciones de hoy del IMN por snippets ni mareas Puntarenas como Santa Teresa. Resolver coordenadas de propiedad/playa, estación/modelo, cobertura, zona horaria y datum antes de activar.

**Contrato normalizado de lectura, sin DDL por defecto:** scope/ubicación, source/source_url/station/model, issued_at/retrieved_at, valid_from/valid_until, local_date, timezone, provenance, verification_state, freshness, units, uncertainty. Las horas se muestran en America/Costa_Rica, preservando zona original. Guardar solo el snapshot útil con retención acotada mediante almacenamiento canónico existente que soporte permisos/provenance; validar adapter/config y esquema antes de proponer tablas. Una predicción se identifica como tal; nunca como observación.

| Información | Reporte y criterio |
|---|---|
| Tiempo diario | Lluvia/probabilidad e intensidad, temperatura, viento/ráfagas, tormenta eléctrica y avisos; mañana/tarde/noche con vigencia y región. Probabilidad de lluvia no equivale a volumen. No inventar detalle horario a partir de boletín regional. |
| Mareas | Todos los extremos del día, cada hora/altura/unidad/datum, pleamar o bajamar, próxima marea y estación/modelo. Permitir 0–N extremos y eventos cerca de medianoche, no fijar siempre dos de cada tipo. Tendencia subiendo/bajando calculada solo con extremos/modelo válidos, sin afirmar nivel observado. |
| Mar | Oleaje/período/dirección y avisos de corrientes cuando fuente cubra lugar/tiempo. Marea baja no acredita baño, piscinas naturales, surf o navegación seguros; condiciones y decisión del operador importan. |
| Luna | Fase e iluminación, próximo cambio de fase con fecha/hora; salida/puesta y visibilidad solo si fuente o cálculo astronómico validado cubre coordenadas/horizonte. Puede faltar salida/puesta dentro del día. No derivar mareas exactas solo de fase lunar. |
| Fechas especiales | Feriado legal con jurisdicción/año y efectos laborales cotejados; celebración, evento local y fecha personal como clases distintas. Cumpleaños/aniversarios solo con propósito/consentimiento y ACL; Margot/personal nunca en hotel por defecto. |

**Portal TARGET — dentro de Hoy/agenda/recepción existentes:** tarjeta compacta “Hoy en Santa Teresa” con fecha, ubicación, estado de actualización, clima y próximo extremo de marea; detalle desplegable muestra lista completa, luna, fuentes y avisos. Agenda única incluye visitas/citas, actividades y fechas especiales autorizadas; filtros hoy/7/30 días y ámbito. Reporte diario usa datos de la misma proyección que chat/Portal, sin copia por canal. Estado visible “Actualizado…”, “Pronóstico”, “Datos vencidos” o “Sin datos verificados”; no spinner infinito ni datos ficticios. Rol recepción ve preparación/huéspedes; operaciones ve riesgo/trabajo exterior; gerencia ve excepciones y oportunidades. Datos personales se limpian al cambiar contexto.

**Regla Calendar:** no crear cuatro eventos de marea cada día ni eventos de lluvia rutinaria. Horas diarias viven en tarjeta/reporte. Calendar reutiliza suscripciones y solo recibe hito/actividad/ventana elegida/recordatorio relevante con fecha corroborada, dedupe por ámbito+objeto+ocurrencia+rol y ejecución gobernada. Oleaje/alerta no cancela reserva/tour automáticamente. Eventos lunares/fechas existentes se leen antes de proyectar nuevos.

**Ciclo diario autorizado, pendiente de implementación:** resolver location/scope -> obtener fuentes vigentes -> validar fecha/unidades/cobertura -> comparar snapshot -> generar reporte conciso hoy y preparación mañana -> proyección Portal -> alertar solo cambios materiales/riesgo/nuevos plazos -> evidencia/readback. Integrar revisión diaria al Team Brief/Cierre Diario y triggers existentes; el correo solo no asegura clima/mareas cada día. Frecuencia de refresh por validez/boletín y cache compartida, límites/reintentos/backoff; no consultar modelo cada minuto. Alerta urgente se procesa cuando fuente la emite dentro del mecanismo existente. Si fuente falla, conservar referencia al último reporte con fecha y advertir caducidad; no recomendar ventana marina con datos vencidos.

**NEXT P1:** definir mapping Santa Teresa y fuentes accesibles sin costo nuevo; censar workers/refresh/reportes actuales; implementar lectura normalizada y freshness; conectar tarjeta y reporte a la misma respuesta canónica; validar preview, luego entrega diaria y readback reales antes de LIVE. No usar migración de mareas para bloquear el lanzamiento web B0–B2 previamente acotado.

**Aceptación y recuperación:** comprobar fecha local/UTC y cruce medianoche, estación equivocada rechazada, altura sin datum no utilizada para umbrales, predicción caducada/timeout degradados, fase lunar sin evento de salida, aviso actualizado deduplicado, feriado/celebración separados, privacidad negativa hotel->Margot, Portal/chat mismo snapshot y replay sin duplicados Calendar. Rollback de esta etapa: revertir documentación; un release futuro necesita deshabilitar adapter/proyección con bandera vigente, preservar auditoría y recuperar último estado válido sin mostrarlo como actual. Estado al cierre: contrato y Plan ampliados; servicio diario/UI/runtime = NOT_IMPLEMENTED/NOT_VERIFIED.
