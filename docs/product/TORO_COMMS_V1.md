# TORO Comms v1 — Communication & Coordination Contract

**Status:** CURRENT PRODUCT SPEC
**Date:** 2026-09-23
**Subsystem:** TORO Comms
**Primary surfaces:** WhatsApp/OpenClaw, WeSpeak, Instagram, Facebook/Messenger, email, website, review surfaces, TORO Portal
**Canonical runtime truth:** Supabase
**External channel rule:** channels transport conversation; they do not own business truth.

## 1. Purpose

TORO Comms turns conversations into governed coordination.

It must:
- receive or ingest communication from supported channels;
- resolve the human, organization and privacy context;
- classify intent and risk;
- route reasoning to TORO specialists;
- convert actionable communication into canonical tasks/incidents/handoffs/decisions/approvals;
- return concise responses through the right channel;
- preserve evidence and delivery state;
- prevent important work from disappearing inside chat.

TORO Comms is not a replacement for WhatsApp, email or Slack. It is the governed communication layer behind them.

## 2. One visible TORO

Normal users interact with **TORO**.

Specialist routing stays internal:
- TORO TERE — guests, sales, concierge, lifecycle;
- TORO RICO — maintenance, housekeeping, laundry, operations;
- TORO FIONA — finance/admin/HR-sensitive workflows;
- TORO SKY — growth, experiences, providers and commercial opportunities;
- TORO SOBRESITO — systems, integrations and technical incidents.

A user should not need to choose an agent before asking for help.


## 2A. First-contact simplicity

When TORO or TERE speaks with a customer/prospect for the first time, the experience must feel simpler than the machinery behind it.

Default:
- answer the immediate need first;
- use plain language;
- do not explain agents, modules, APIs, data models or orchestration;
- ask only one material question at a time when possible;
- offer one easy next step;
- show no more than 1–3 choices when choices help.

Preferred feeling:
**“Dime qué necesitas; yo te ayudo a resolverlo.”**

TORO/TERE may invite creative requests:
**“Si no ves lo que necesitas, pídemelo igual.”**

If the capability does not exist, TORO must say so simply, offer the nearest safe path and register the request as product signal. It must never fake a capability or completed action.

## 3. Current verified foundation

Reuse existing canonical data:
- `public.team_messages`;
- `public.team_message_read_states`;
- `public.notifications`;
- `operations.tasks`;
- `facilities.maintenance_events`;
- `operations.executive_decisions`;
- `public.approval_requests`;
- `operations.guest_message_templates`;
- `operations.guests` / stays/reservations context;
- `public.audit_logs`.

Current message channels already represented in RLS include:
- `general`;
- `operacion`;
- `rrhh`;
- `dm`.

These are a usable seed, not the final channel model.

## 4. Current runtime status

### WeSpeak

Canonical registry status: **confirmed active**.

Role:
- guest communication/runtime surface;
- TERE configuration and governed hotel truth remain in TORO/Supabase;
- no separate TERE backend should be created.

### OpenClaw

Canonical registry status: **needs audit / configured-unverified**.

Role:
- potential WhatsApp gateway/orchestration runtime;
- may transport guest/internal communication;
- must never become a second TORO brain or source of business truth.

Direct runtime verification is still required before TORO marks it healthy/live.

Required gate:
1. channel/account identity;
2. session isolation;
3. group/direct allow-deny policy;
4. heartbeat and reconnect behavior;
5. replay/idempotency behavior;
6. redacted logs;
7. governed read path into TORO data;
8. Kross live-authority handoff;
9. human escalation;
10. tool/action ceilings.

Historical evidence from older TORO repositories does not prove the current OpenClaw runtime.

## 5. Communication lanes

| TORO lane | Primary use | Specialist route | Canonical output |
| --- | --- | --- | --- |
| Guest Booking | inquiry, direct-sale support | TORO TERE | reply draft, lead/handoff |
| Guest Arrival | arrival/check-in questions | TORO TERE + TORO RICO | reply + operational handoff |
| In-Stay Support | room/cleaning/maintenance request | TORO RICO + TORO TERE | incident/task + acknowledgement |
| Complaint | complaint/reputation escalation | TORO TERE + TORO Core | escalation/decision + reply |
| Team Handoff | shift/department handover | TORO Operations | task/handoff/brief |
| Maintenance | equipment/room/property issue | TORO RICO | maintenance_event |
| HR/Admin | employee/HR/private admin | TORO FIONA / TORO People | private request/task |
| Finance | invoice/payment/admin evidence | TORO FIONA | finance workflow/validation |
| Provider | tours/wellness/service provider | TORO SKY | provider task/validation |
| Social Lead | social inbox/lead | TORO TERE + TORO Growth | lead/handoff |
| Emergency | urgent safety/operational escalation | TORO Core + human | immediate escalation + minimal log |
| Systems | connector/access/deployment issue | TORO SOBRESITO | systems incident/task |


## 5A. Customer communication = one lifecycle, many channels

For the hospitality proving ground, TORO Comms owns the governed omnichannel communication fabric while **TORO TERE** owns guest/customer-facing judgment, sales fit and relationship continuity.

WeSpeak is a runtime/channel surface. It does not become the owner of customer truth, lifecycle state, pricing, permissions or TERE identity.

Target customer-facing channels:
- WhatsApp;
- Instagram Direct;
- Facebook/Messenger;
- email;
- website chat/forms;
- approved review/reputation surfaces;
- future channels only when a real workflow justifies them.

The customer should experience one continuous relationship even when the transport changes.

Canonical flow:

message/contact -> identity/customer context -> lifecycle stage -> intent -> authority -> action/workflow -> response -> follow-up -> evidence -> next stage

Do not create one lead, task or customer history per channel.

### Customer lifecycle coverage

TORO Comms + TERE should be able to coordinate, according to permissions and authoritative sources:
- first inquiry;
- qualification;
- recommendation;
- quotation;
- reservation/purchase assistance;
- unanswered-lead follow-up;
- pre-arrival/pre-service messages;
- in-stay/in-service assistance;
- complaints/service recovery;
- upsell/cross-sell;
- payment reminders and collections communication;
- post-stay/post-purchase follow-up;
- review request;
- review-response preparation/publication where authorized;
- retention/return/referral;
- reactivation campaigns where consent/policy allows.

### Ownership boundaries

- **TERE:** customer-facing reasoning, tone, fit, conversation and next-step conversion in hospitality.
- **TORO Comms:** channel normalization, routing, continuity, delivery, follow-up state and deduplication.
- **TORO Revenue / live PMS authority:** price, availability, booking truth.
- **TORO FIONA / finance authority:** amount due, payment status, invoices and collection truth.
- **TORO Growth/SKY:** campaigns, reputation strategy, retention and growth experiments.
- **TORO Operations/RICO:** physical/service fulfillment and operational proof.

The speaking agent may be TERE while the underlying fact/action authority belongs to another subsystem.

### Follow-up and automation rule

Automated messages must be triggered from canonical lifecycle/workflow state, not from isolated channel timers when that would create duplicate or contradictory communication.

Before sending a follow-up:
- resolve whether the customer already replied elsewhere;
- resolve whether the underlying need is already closed;
- resolve whether payment/reservation state changed;
- avoid duplicate cross-channel pressure;
- respect consent, quiet periods and escalation rules.

## 6. Internal rooms

Dreamcatcher pilot should begin with a small set of governed rooms:

- **TORO DreamTeam** — general team information;
- **TORO Operación** — live hotel operation and handoffs;
- **TORO Recepción** — guest-facing coordination;
- **TORO Mantenimiento** — maintenance/housekeeping operational work;
- **TORO Gerencia** — decisions/exceptions;
- **TORO RRHH** — restricted private work.

Room names are logical TORO rooms. They may map to WhatsApp groups, Portal rooms or other transports.

Do not create a separate database or workflow engine per room.

## 7. Message-to-action pipeline

Every message follows:

`message -> identity/context -> privacy -> intent -> authority -> risk -> route -> action -> evidence -> response -> follow-up`

Possible outcomes:
- answer only;
- no action needed;
- task;
- maintenance incident;
- handoff;
- approval request;
- executive decision;
- guest reply draft;
- provider validation;
- system incident;
- learning signal;
- human escalation.

### Memory rule

A communication never writes durable memory directly.

Allowed:
`message -> learning signal -> candidate memory -> confirmation/verification -> durable User Vault or governed knowledge`

Blocked:
`message -> permanent memory`


## 7A. Conversational navigation protocol

TORO Comms resolves quick navigation without forcing users into a chatbot tree.

Supported in each active menu context:
- number;
- canonical option word;
- common alias;
- natural-language equivalent.

Universal:
- 0 / menú / inicio -> home;
- 9 / atrás -> previous context;
- + / más -> secondary options;
- ayuda -> contextual help.

Menu numbers are valid only inside the current menu/session state. Consequential actions must never execute from a stale numeric shortcut after material context changes.

After a useful response, suggest 1–3 likely next actions. Do not repeat the entire menu unnecessarily.

Where buttons/quick replies exist, use them. Where they do not, render compact numbered choices.

Canonical role/lifecycle profiles:
- data/toro_conversational_menu_profiles_v1.json

## 8. Personal/work firewall

TORO Comms must consume the canonical `ToroResolvedContext`.

### Personal mode
May use:
- personal User Vault;
- personal tool connections;
- explicitly shared data;
- system metadata needed for safety.

Must not silently inject employer data unless user explicitly switches/requests organization context.

### Organization mode
May use:
- work-private;
- organization data allowed by role;
- shared work context;
- organization tools.

Must **not** automatically include personal User Vault data.

ADMIN/RRHH/GERENCIA roles never unlock personal scope.

## 9. Group behavior

Recommended default for internal WhatsApp/OpenClaw pilot:
- explicit allowlist of approved groups;
- mention/activation required by default;
- group-specific session/context;
- no shared DM session across users;
- only governed tools available;
- no high-risk action from group chat without approval;
- conversation history is context, not authoritative truth.

TORO may observe permitted group context for continuity, but should only persist structured business outcomes and minimal evidence needed for audit.

## 10. DM behavior

Every direct conversation is isolated by human identity and channel/account.

### Personal inbox is narrower than privileged RLS

The current DreamTeam/Supabase policies intentionally allow ADMIN/RRHH/GERENCIA to inspect some DMs for governed HR/management workflows.

That broader authorization must **not** automatically populate a person's normal TORO inbox.

Normal `Mi inbox` projection shows only:
- DMs sent by the current user;
- DMs addressed to the current user's linked employee identity.

Cross-user privileged message review, if retained, belongs in a separate explicit/audited HR or governance surface with purpose, authorization and evidence.

Database permission is a ceiling, not a reason to expose every permitted record in every UI.

DM must resolve:
- authenticated/linked user when possible;
- personal vs organization context;
- active membership for organization requests;
- role/tool permissions;
- data scope.

Unknown/unlinked sender:
- may receive public-safe assistance;
- cannot inherit employee permissions;
- cannot be linked automatically by name or phone alone;
- must use an approved identity-linking flow.

## 11. Data model evolution

### Reuse now
- `team_messages`;
- `team_message_read_states`;
- `notifications`.

### Add only when implementation requires it

#### `communication_channels`
Logical TORO rooms/direct spaces.

#### `channel_memberships`
Who may see/participate in a logical room.

#### `external_channel_bindings`
Maps TORO logical channel to:
- transport;
- external account;
- external group/thread identifier;
- status;
- health/freshness;
- routing policy.

Never store credentials here.

#### `message_object_links`
Links a source message to canonical output:
- task;
- incident;
- decision;
- approval;
- guest interaction;
- validation;
- learning signal.

#### `message_delivery_events`
Minimal delivery/attempt/acknowledgement evidence.

Do not create these tables until current `team_messages` limitations are proven by implementation needs.

## 12. TORO Comms dashboard

Owner/manager view should prioritize exceptions, not chat volume.

Primary cards:
1. **Necesita respuesta**
2. **Handoffs sin confirmar**
3. **Tareas nacidas de conversación**
4. **Incidentes de huésped**
5. **Pendientes de aprobación**
6. **Mensajes fallidos / canal degradado**
7. **SLA vencido**
8. **Grupos con ruido/repetición automatizable**
9. **Canales y runtimes**
10. **Qué resolvió TORO sin intervención**

Employee view:
- unread/relevant messages;
- mentions;
- own handoffs;
- tasks created from conversations;
- direct TORO entry;
- notification preferences.

## 13. Notification rules

Notifications are exceptions, not a duplicate task list.

Notify when:
- human response required;
- handoff unacknowledged;
- SLA breach;
- guest impact;
- approval needed;
- emergency;
- channel/runtime failure;
- important task state changed.

Do not notify because data merely exists.

## 14. OpenClaw integration boundary

OpenClaw is a **channel gateway**.

It may:
- receive supported channel events;
- maintain channel/session transport context;
- forward normalized events to TORO;
- send TORO-approved/allowed outputs;
- perform low-risk allowed actions when the shared TORO policy engine permits them.

It may not independently:
- define employee identity;
- own long-term business memory;
- redefine source authority;
- grant permissions;
- bypass TORO Governance;
- treat conversation as completed work without canonical evidence.

## 15. WeSpeak integration boundary

WeSpeak remains an active specialist guest-communication runtime.

TORO owns:
- governed hotel facts;
- TERE behavior/configuration;
- source authority;
- templates;
- permissions;
- evidence;
- escalation.

Avoid parallel TERE backends.

## 16. Legacy communication plan disposition

Useful legacy concepts retained:
- communication lanes;
- privacy-first routing;
- guest draft/review;
- message-to-task conversion;
- emergency escalation;
- redaction;
- channel owner/purpose mapping.

Legacy concepts superseded:
- automatic "save as memory";
- localStorage as operational persistence;
- agent-specific communication silos;
- Airtable as primary communication state;
- channel-specific permission models;
- treating historical OpenClaw/WhatsApp evidence as current health proof.

## 17. TORO Comms v1 rollout

### P0
1. Audit real OpenClaw runtime.
2. Confirm WeSpeak current runtime/admin parity.
3. Resolve TORO Identity for pilot staff.
4. Define approved internal WhatsApp groups and owners.
5. Freeze privacy/session policy.

### P1
6. Bind 2–3 internal groups to logical TORO rooms.
7. Implement message -> task/incident/handoff.
8. Add acknowledgement and follow-up.
9. Route employee DMs through TORO context resolver.

### P2
10. Portal inbox/rooms.
11. Channel-health dashboard.
12. Guest/runtime handoff integration.
13. notification preferences/digests.

### P3
14. Add optional Slack/Teams/email transports only when a real customer workflow needs them.

## 18. Definition of done

TORO Comms v1 is complete when:
- internal WhatsApp/group communication can create governed work without losing identity/permissions;
- employee DMs are isolated;
- personal and work scopes never bleed automatically;
- important handoffs have owner/status/acknowledgement;
- actionable messages become canonical objects;
- no durable memory is created directly from chat;
- OpenClaw and WeSpeak health/status are visible;
- channel outage degrades safely;
- users experience one TORO across WhatsApp and Portal.
