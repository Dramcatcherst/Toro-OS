# TORO Brain — Role Toolbox V1

**Status:** CURRENT PRODUCT SPEC  
**Date:** 2026-09-23  
**Parent:** TORO User Portal + TORO Conversational Menus  
**Machine-readable map:** data/toro_role_toolbox_v1.json  
**Rule:** tools are presented as user jobs/capabilities, not vendor integrations.

## 1. Principle

Users should not need to know which connector or subsystem performs an action.

The visible experience should say:
- **Cotizar**
- **Ver mis tareas**
- **Reportar un problema**
- **Conciliar**
- **Responder reviews**
- **Ver salud de sistemas**

not:
- Kross API;
- Supabase table;
- OpenClaw runtime;
- Meta connector;
- Vercel deployment endpoint.

TORO resolves the underlying authorized tool path.

## 2. Tool availability states

Every visible capability resolves one of:

- **READY** — connected + authorized + operational for this user/context.
- **READ_ONLY** — useful read is available but writes/actions are not.
- **CONNECT** — authorized user may connect the required tool.
- **REQUEST_ACCESS** — user can ask the correct owner for access.
- **DEGRADED** — normally available but currently unhealthy/stale; show safe fallback.
- **HIDDEN** — irrelevant or unauthorized; do not clutter the menu.
- **BLOCKED** — action exists but policy/source/approval prevents execution now.

Never show a dead button.

## 3. Capability resolution

Visible toolbox =

`role profile ∩ position ∩ enabled bundle ∩ membership ∩ current permissions ∩ connector state ∩ source freshness ∩ context`

A user may discover a capability without receiving execution authority.

Example:
- reception sees **Cotizar**;
- if live PMS read is unavailable, TORO may prepare only safe non-live guidance and explicitly block live price/availability;
- it must not fabricate a live quote.

## 4. Shared tools for most users

Where permitted:
- 🧠 Ask TORO
- 🔎 Search
- 💬 Messages
- 📷 Send photo/evidence
- 📎 Send document
- ✅ My actions/tasks
- 🔔 Notifications
- 📚 Knowledge / how-to
- 👤 Profile / preferences
- 0️⃣ Menu / home


## 4A. Personal toolbox

Primary jobs:
- today;
- personal calendar;
- personal tasks/reminders;
- important personal messages;
- projects/goals;
- personal connected tools;
- travel/plans where connected;
- profile/preferences.

Personal mode does not expose organization capabilities unless the user explicitly transitions to an authorized organization context.

## 5. Owner / Executive toolbox

Primary jobs:
- executive brief;
- decisions/approvals;
- delegation;
- project progress/blockers;
- cash/obligation exceptions;
- guest/service exceptions;
- team exceptions;
- systems health;
- growth opportunities;
- search across authorized portfolio/business scope.

Underlying authorities may include TORO canonical state, Kross, Alegra, Google Workspace, GitHub/Vercel/Supabase and others. Vendor names stay secondary.

## 6. Gerencia toolbox

Primary jobs:
- hotel today;
- arrivals/departures summary;
- room readiness;
- unresolved guest issues;
- team coverage/handoffs;
- purchase/request approvals;
- operational exceptions;
- reports;
- task assignment;
- escalation to owner only when necessary.

## 7. Reception toolbox

Primary jobs:
- guest/reservation search;
- current arrivals/departures;
- guest messaging;
- TERE recommendations;
- quote preparation;
- room/villa product knowledge;
- current availability/price when live authority is available;
- experiences;
- check-in/out messages;
- issue creation/handoff;
- payment-status read only where role permits;
- follow-up/review workflow.

Likely underlying tools:
- TERE;
- Kross/PMS authority;
- WeSpeak / approved channels;
- guest knowledge/catalog;
- TORO Comms;
- TORO Operations.

## 8. Housekeeping toolbox

Primary jobs:
- assigned rooms/areas;
- priority order;
- cleaning/checklist guidance;
- mark work complete;
- photo/evidence;
- report maintenance;
- report missing supplies;
- laundry handoff where relevant;
- extra voluntary task/recognition where enabled;
- own schedule;
- request help.

Housekeeping should not need raw PMS/finance access.

## 9. Maintenance toolbox

Primary jobs:
- priority incidents;
- assigned tasks;
- property/room issue reporting;
- photo/video evidence;
- preventive rounds;
- materials/reparts request;
- stock read where authorized;
- utilities/device status where enabled;
- SOP/how-to;
- close with proof;
- recurring-failure history.

## 10. Department lead toolbox

Primary jobs:
- team workload;
- coverage;
- shifts;
- exceptions;
- approvals;
- handoffs;
- assign/reassign work;
- SOP;
- recognition proposal;
- department metrics;
- escalations.

## 11. Finance / Accounting toolbox

Primary jobs:
- obligations and due dates;
- accounts/payment status;
- collections queue;
- invoices/receipts;
- reconciliation;
- bank evidence where authorized;
- accounting evidence;
- payroll interface where authorized;
- financial exceptions;
- exports/reports;
- approval preparation.

Alegra/bank/PMS remain specialist authorities where applicable.

## 12. RRHH / People toolbox

Primary jobs:
- attendance;
- schedules;
- leave/requests;
- employee records;
- employment context;
- payroll operations;
- advances/loans where governed;
- employee documents;
- onboarding/training;
- recognition/points;
- exceptions;
- reporting.

Personal TORO User Vault remains private and outside employer toolbox by default.

## 13. Growth toolbox

Primary jobs:
- review queue;
- social/lead inbox;
- content preparation;
- campaign planning;
- website/SEO;
- performance;
- offers;
- partnerships;
- experiences/ancillary revenue;
- retention/referral;
- experiment tracking.

Publishing/spend remain policy-gated.

## 14. Systems toolbox

Primary jobs:
- connector health;
- outages;
- data freshness;
- GitHub;
- Vercel;
- Supabase;
- OpenClaw/WeSpeak runtime health;
- backup/recovery;
- deployment status;
- access requests;
- audit/security findings;
- configuration drift;
- incident recovery evidence.

Normal business users should not see this depth unless authorized.

## 15. Auditor toolbox

Primary jobs:
- audit log;
- evidence;
- approvals;
- source authority;
- versions/changes;
- exports;
- read-only search;
- provenance/freshness.

Default posture is read-only.

## 16. General employee toolbox

Primary jobs:
- today;
- my tasks;
- my schedule;
- my requests;
- messages;
- knowledge;
- own profile;
- recognition/points;
- ask for help.

Position-specific profiles override the generic employee toolbox when more relevant.

## 17. Guest/customer toolbox

### Prospect
- search accommodation;
- quote;
- compare options;
- experiences;
- location/hotel info;
- questions;
- follow-up.

### Booked guest
- arrival;
- stay details;
- room/villa;
- experiences;
- breakfast/extras;
- transport/recommendations;
- request help;
- departure/extension where allowed.

### Issue mode
- help;
- maintenance;
- cleaning;
- reception;
- status follow-up.

Sales tools are deprioritized until the issue is stabilized.

## 18. Menu integration

Every menu option should route to a **capability key**, not directly to a vendor.

Example:

`quote_stay -> capability: hospitality.quote -> authority: live_pms -> speaking_agent: TERE`

`reconcile_finance -> capability: finance.reconcile -> authority: finance source map -> agent: FIONA`

`close_maintenance -> capability: operations.maintenance.close_with_evidence -> agent: RICO`

This makes connector substitution possible without redesigning the user menu.

## 19. Connection/access UX

If capability state = CONNECT:
> **Para hacer eso en vivo necesito conectar {tool_category}.**
> 1️⃣ Conectar ahora
> 2️⃣ Ver qué acceso necesito
> 9️⃣ Atrás

If state = REQUEST_ACCESS:
> **Esa función existe, pero tu perfil no tiene acceso todavía.**
> 1️⃣ Solicitar acceso
> 2️⃣ Ver quién lo aprueba
> 9️⃣ Atrás

If state = DEGRADED:
> **La conexión está degradada.**
> Puedo mostrar la última información verificada o dejar la acción preparada sin ejecutarla.

## 20. Definition of done

Role Toolbox V1 is implemented when:
- menu items resolve to capability keys;
- capability availability reflects real connector/permission state;
- dead buttons do not appear;
- user can connect/request access where appropriate;
- tool/vendor names are secondary to jobs;
- position-specific overrides work;
- serious actions re-check permission at execution;
- connector substitution does not require redesigning the whole UX.
