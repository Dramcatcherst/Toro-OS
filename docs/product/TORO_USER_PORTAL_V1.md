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
