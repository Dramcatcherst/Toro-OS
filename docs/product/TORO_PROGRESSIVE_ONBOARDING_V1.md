# TORO Brain — Progressive Onboarding V1

**Status:** CURRENT PRODUCT SPEC  
**Date:** 2026-09-23  
**Master product:** TORO Brain  
**Owners:** TORO Identity + TORO People + TORO Tools + TORO Comms + TORO User Portal  
**Role journey manifest:** data/toro_onboarding_journeys_v2.json  
**Commercial rule:** one TORO, modular activation, progressive setup  
**Implementation status:** ROLE-AWARE RESTARTABLE SURFACE INTEGRATED + CI-VERIFIED / PERSISTENT CROSS-CHANNEL PROGRESS NOT YET IMPLEMENTED

---

## 1. Decision

TORO onboarding is redesigned as a **progressive, restartable and non-blocking experience**.

The goal is not to make a new user finish a long wizard before TORO becomes useful.

The goal is:

> **Give the user useful value immediately, learn only what is needed, and expand TORO as the relationship grows.**

TORO should feel easy before the user understands how complex the system is.

---

## 2. Onboarding principles

1. **Value before setup.** Let the user ask or do something useful as early as safely possible.
2. **Ask only what is needed now.** Do not collect optional information merely because a field exists.
3. **Progressive disclosure.** Reveal tools/modules only when relevant.
4. **Skip what is optional.** Optional steps may be skipped and resumed later.
5. **Restartable.** A user can restart the onboarding experience without deleting identity, business data, permissions or tool connections.
6. **Resume anywhere.** Onboarding may continue through Portal, WhatsApp or another approved channel.
7. **No technical configuration language.** Normal users do not configure agents, prompts, models, databases or schemas.
8. **One identity.** Onboarding never creates a second identity universe.
9. **Modular activation.** A business may start with only a subset of TORO capabilities and expand later without re-platforming.
10. **No false capability.** TORO may invite creative requests but must not pretend unsupported actions exist.

---

## 3. First-contact experience

The first interaction should not be a feature tour.

Default pattern:

1. identify the user/context only as needed;
2. ask what they want to accomplish;
3. solve or prepare one useful thing;
4. show one easy next step;
5. optionally suggest 1–3 relevant capabilities.

Example positioning:

> **Dime qué quieres resolver. TORO se encarga de encontrar la mejor manera de hacerlo con lo que tu negocio ya usa.**

Alternative:

> **Puedes empezar por algo simple. Pregúntame, mándame un archivo o dime qué quieres que pase.**

Do not open with:
- architecture;
- subsystem names;
- agent topology;
- connector inventory;
- permission matrices;
- long feature menus.

---

## 4. Ask for what you do not see

TORO should encourage exploration:

> **Si no ves una función, pídemela igual.**

Behavior:
- if supported: execute/prepare according to permission;
- if partially supported: explain the closest useful path and offer it;
- if unsupported but plausible: record a governed capability request and offer a workaround where safe;
- if unsafe/unavailable: state the limitation clearly.

Never:
- fabricate an integration;
- claim an action happened when it did not;
- promise a future feature date without evidence;
- bypass source authority or permission because the request is attractive commercially.

Capability requests are product signals for TORO Product Proof and future prioritization.

---

## 5. User onboarding path

### Step 0 — Instant value
User can ask a public-safe/general question or view a simple demo before completing optional setup.

### Step 1 — Identity
Minimum required identity/authentication.

### Step 2 — Context
Choose or resolve:
- Personal;
- invited organization;
- current business/workspace.

### Step 3 — Goal
Ask:
**“¿Qué te gustaría que TORO te ayude a resolver primero?”**

Offer no more than 3 contextual choices plus free text.

### Step 4 — Immediate action
Complete or prepare one useful task where allowed.

### Step 5 — Optional personalization
Language, communication preference, role-specific preferences.

### Step 6 — Optional connections
Suggest only the tools needed for the chosen goal.

### Step 7 — Expand later
Recommend additional capability activation based on observed need and explicit authorization.

The user enters the real product before completing every optional step.

---


## 5A. Teach by doing, then reveal shortcuts

Do not teach a full menu at the start.

After the first useful outcome, show only 2–3 likely shortcuts based on role/context:

> **Esto es lo que probablemente vas a usar más:**
> 1️⃣ {shortcut}
> 2️⃣ {shortcut}
> 3️⃣ {shortcut}
>
> Puedes responder con el número, escribir la palabra o simplemente decirme qué necesitas.

Rules:
- menu is optional;
- free text always works;
- introduce secondary options later;
- offer "personalizar mi menú" only after enough usage evidence exists;
- onboarding can be continued with one-word/number answers whenever possible;
- each onboarding turn should make it obvious what the user can answer next.

## 5A. Onboarding as guided conversation

Onboarding should be usable almost entirely by replying with a **number, one word or a normal sentence**.

Every onboarding turn should normally have:
- one short explanation;
- one question;
- up to 3 suggested responses;
- free text always available;
- **saltar** when optional;
- **atrás** when reversible;
- **continuar** to resume a paused step;
- **inicio** to leave onboarding and use TORO normally.

Example:

> **¿Qué quieres que TORO te ayude a mejorar primero?**
> 1️⃣ Clientes y ventas
> 2️⃣ Operación y equipo
> 3️⃣ Control y dinero
>
> O dime con tus palabras qué te quita más tiempo.

After selection, TORO shapes the next step around that goal instead of continuing a generic questionnaire.

### Personal familiarity

Where authorized, onboarding may acknowledge:
- preferred name;
- business;
- role;
- invited organization;
- already-connected tools;
- previously confirmed preferences.

It should never re-ask a fact already verified merely to complete a wizard.

Desired feeling:
**“TORO ya entiende bastante; solo me pregunta lo que de verdad falta.”**

## 5B. Role-specific micro-onboarding

Do not give every person the same onboarding script.

The canonical journey manifest is:
- data/toro_onboarding_journeys_v2.json

Current archetypes:
- owner/admin;
- manager/lead;
- reception;
- housekeeping;
- maintenance;
- office specialist;
- general employee;
- guest/prospect first contact.

Position-specific journeys override generic employee onboarding.

Each journey should:
- acknowledge verified role/context without making the user repeat it;
- take the person to a useful role-specific action in 1–2 turns where practical;
- expose at most 3 first choices;
- allow free text;
- teach navigation through use rather than a product tour;
- reveal secondary tools only after first value;
- finish by showing the user's most useful shortcuts.

Guest/prospect first contact is not an account-setup wizard. TERE starts by helping the person with the trip/request.

## 6. Business/admin onboarding path

Business onboarding must be outcome-led rather than form-led.

### Phase A — Understand
- business identity;
- primary goals/problems;
- key people/roles;
- current systems;
- critical sources of truth;
- communication channels.

### Phase B — Connect minimum viable scope
Connect only what is needed for the first proof workflow.

### Phase C — Prove value
Run one real, bounded workflow with evidence.

### Phase D — Expand
Activate additional TORO capabilities only when value/need is clear.

### Phase E — Measure
Track onboarding effort, custom engineering, user adoption and business outcome.

A business does not need every TORO module to begin using TORO.

---

## 7. Modular adoption — one brain, selected capabilities

TORO remains one product/brain.

Customers may activate only what they need.

Example adoption sequence for hospitality:

### Communicate
- omnichannel guest/customer communication;
- TERE;
- WhatsApp/social/email/web;
- quotations/follow-up;
- review/reputation response;
- automated lifecycle messages.

### Operate
- tasks;
- handoffs;
- housekeeping/readiness;
- maintenance;
- employee self-service.

### Control
- owner exceptions;
- approvals;
- finance/obligations;
- system health;
- evidence/audit.

### Grow
- revenue;
- direct sales;
- upsell;
- marketing/growth opportunities;
- retention/referral.

These are **activation bundles**, not separate brains, identity systems or data silos.

A later capability reuses the same identity, context, source authority, permissions, evidence and event history.

---

## 8. Restart / reset behavior

The onboarding experience must never become irreversibly hidden just because a user previously completed or partially completed it.

Required user action:
**Settings -> Onboarding -> Restart onboarding**

Optional developer/test action:
- reset onboarding presentation/progress for the authorized test user;
- preserve account and canonical business state unless an explicit separate deletion request is made.

Restarting onboarding must **not** automatically:
- delete the user;
- remove organization membership;
- revoke permissions;
- disconnect tools;
- erase User Vault memory;
- delete business data;
- reset employee training records;
- alter billing;
- remove audit history.

A reset should normally affect only onboarding presentation/progress.

---

## 8A. Current restartable UI implementation — 2026-09-23

Implemented surface:
- `/onboarding`;
- authenticated identity and organization context;
- role/position-specific journey selection;
- preferred-name personalization;
- organization-name read when permitted;
- number, button and free-text replies;
- `atrás`, `saltar`, `continuar`, `inicio`;
- visible **Rehacer onboarding** entry from `/my-toro`;
- in-session restart that does not mutate canonical account/business state.

Current intentional limitation:
- general onboarding progress/completion is **not persisted yet**;
- reopening `/onboarding` starts a fresh presentation session;
- this avoids reusing `employee_onboarding_progress`, which belongs to employee learning/training;
- no identity, role, membership, connector, billing, memory or business data is changed by restart.

This means the previously identified testing problem is removed: completing or partially testing onboarding cannot permanently hide the experience from the user.

Persistent cross-channel progress remains TARGET and must land only in the canonical identity/user-experience model.

---

## 8B. First-value handoff — 2026-09-23

The onboarding UI now reorders its first choices using the authenticated **source-aware menu**.

Rules:
- readable/verified menu capabilities are offered before blocked ones;
- only capabilities already promoted to `READ_ONLY` may become direct first-value destinations;
- focusable reads are preferred in onboarding choices because they can produce immediate visible value;
- if the user's choice matches an available first-value target, that target is shown first at completion;
- if no safe target matches, TORO returns to `/my-toro` without pretending the requested workflow is ready;
- onboarding does not promote a capability; it only consumes the same readiness decision as Mi TORO.

Current effect for Dreamcatcher:
- Reception can start with current room/villa or experience catalog reads while live arrivals, guest inbox and quoting remain blocked until their authority is current;
- Owner onboarding is compressed because identity/business context is already known and is not re-asked.

---

## 9. State model

Conceptual states:
- not_started;
- quick_started;
- in_progress;
- paused;
- completed;
- restarted.

Completion is not a permanent lock.

The onboarding UI may reappear:
- when the user explicitly restarts it;
- when a new major capability is activated;
- when context changes materially;
- when a new organization invite requires a scoped introduction.

A module-specific introduction must not force the full global onboarding again.

---

## 10. Required vs optional gates

Only truly necessary controls can block progress:
- authentication;
- required privacy/consent;
- organization membership;
- explicit permission/approval;
- legal/security requirements;
- required connector authorization for the requested action.

Do not block the whole product because:
- profile enrichment is incomplete;
- optional tools are not connected;
- optional preferences were skipped;
- a product tour was not viewed;
- a user has not activated every module.

---

## 11. Data-model rule

Current public.employee_onboarding_progress is employee learning/training progress and must **not** be reused as the general TORO user onboarding state.

Current observed production state on 2026-09-23:
- public.employee_onboarding_progress rows: 0.

General user onboarding state should live with canonical identity/user experience only when implementation begins and after the existing identity-schema decision is resolved.

Do not create a parallel auth or employee identity model merely to store onboarding progress.

---

## 12. Commercial onboarding metrics

Measure:
- time to first useful outcome;
- steps before first value;
- skip rate by step;
- completion rate;
- restart rate;
- abandonment point;
- tool-connection success;
- first workflow success;
- onboarding hours per business;
- founder intervention hours;
- customer-specific engineering hours;
- percentage of configuration reusable;
- number of capabilities activated after first value.

Primary objective:

> **Reduce time-to-value and setup burden while preserving trust, permission and source authority.**

---

## 13. Definition of done

Progressive Onboarding V1 is ready when:
- a new user can reach useful value before completing optional setup;
- optional steps can be skipped/resumed;
- onboarding can be restarted without deleting canonical state;
- one user can onboard into Personal and an organization without duplicate identity;
- a business can activate only selected TORO capabilities;
- adding a capability does not create a second onboarding universe;
- unsupported requests become governed capability signals rather than fake capabilities;
- onboarding metrics are observable;
- mobile/WhatsApp/Portal experiences remain consistent.
