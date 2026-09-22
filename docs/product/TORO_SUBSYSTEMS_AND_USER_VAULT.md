# TORO OS — Subsystem Registry & User Vault Architecture

**Status:** CURRENT PRODUCT RULE  
**Date:** 2026-09-22  
**Applies to:** TORO OS core, Dreamcatcher reference implementation, future tenants, agents, portals, WhatsApp/OpenClaw surfaces and connected products.

## 1. Naming rule

Every internal subsystem that is part of TORO OS must use the `TORO` name.

Allowed pattern:

`TORO <Subsystem>`

Specialist personas may retain distinctive names, but are represented as TORO specialists:

- TORO TERE
- TORO RICO
- TORO FIONA
- TORO SKY
- TORO SOBRESITO

A specialist persona is not a separate source of truth, product, database or permission universe. It is a role/personality routed through the same TORO identity, policy, data and execution engine.

External systems and independent products do not need the TORO prefix merely because TORO connects to them.

## 2. Canonical subsystem map

| Canonical name | Responsibility | Existing/legacy sources to absorb or govern |
| --- | --- | --- |
| TORO Core | orchestration, shared shell, global search, decision routing | current TORO OS core |
| TORO Identity | users, organizations, memberships, roles, sessions, authentication | Supabase Auth, app_users, roles, user_roles, employees |
| TORO People | HR, attendance, schedules, leave, payroll workflows, employee portal | DreamTeam app and HR tables |
| TORO Personal | private user assistant, personal goals, reminders, preferences, private memory and personal connectors | future Mau/user-personal mode |
| TORO Comms | direct/team communication, channels, notifications, handoffs and message-to-action | team_messages, notifications, WhatsApp/OpenClaw, WeSpeak |
| TORO Guests | guest context, concierge, lifecycle, governed messaging, CRM-light | TERE flows, guest_message_templates, guests/stays |
| TORO Operations | maintenance, housekeeping, laundry, inspections, incidents, inventory handoffs | RICO flows, facilities.*, operations.tasks |
| TORO Finance | finance analysis, invoices, obligations, reconciliation and accounting support | FIONA flows, finance.*, Alegra connector |
| TORO Revenue | pricing, agencies, rate plans, channel/revenue analysis | revenue.*, Kross authority bridges |
| TORO Growth | campaigns, marketing, SEO, reputation, partnerships and ancillary revenue | SKY flows, content/market intelligence |
| TORO Projects | projects, milestones, blockers, portfolio and execution plans | operations.projects/tasks, executive_portfolio |
| TORO Knowledge | governed knowledge, SOPs, business facts, learning rules and provenance | DreamTeam Knowledge OS, Notion, Airtable residual knowledge |
| TORO Tools | connector catalog, tool activation, OAuth, scopes, health and cost | Tool Hub / Connector Center |
| TORO Agents | agent registry, skills, routing, memory scope, tool access and autonomy ceilings | agents, agent_* tables, OpenClaw bindings |
| TORO Data | canonical model, imports, quality, conflicts, provenance and freshness | integrations.*, source registries |
| TORO Governance | rules, approvals, audit, security, privacy, retention and recovery | governance rules, approval_requests, audit_logs |
| TORO Assets | files, media, physical assets, rights, inventory and evidence | Dropbox, media_assets, assets.*, inventory |
| TORO Research | market/destination research, external signals, providers and recommendations | local_*, market intelligence, web research |
| TORO Channels | website, OTA, booking-engine and content distribution control | Dreamcatcher websites, Kross content, channel content |
| TORO Systems | reliability, integrations, deployment, backup, incidents and technical health | SOBRESITO flows, GitHub/Vercel/Supabase health |
| TORO Builder | software/build queue, Codex tasks, preview verification and technical delivery | GitHub/Codex/Vercel build workflows |
| TORO Exchange | optional marketplace/exchange layer when validated as part of TORO | RicoSky / dreamauro experimental marketplace |

This registry is conceptual. It does not require one application, repository or database per subsystem.

## 3. Existing product classification

### Integrate into TORO

**DreamTeam**
- Product disposition: legacy standalone implementation.
- Canonical destination: **TORO People**.
- Preserve: HR domain model, RLS, auth patterns, attendance/payroll work, employee portal.
- Do not duplicate: identity, messaging, agents, notifications or approvals if TORO already owns them.
- Migration must be parity-tested before retiring standalone routes.

**DreamTeam Knowledge OS**
- Product disposition: legacy knowledge source.
- Canonical destination: **TORO Knowledge**.
- Migrate only unique useful content with provenance.

**TERE / RICO / FIONA / SKY / SOBRESITO**
- Product disposition: specialist personas/capability routers, not independent subsystems.
- Canonical names: **TORO TERE**, **TORO RICO**, **TORO FIONA**, **TORO SKY**, **TORO SOBRESITO**.
- All use shared TORO identity, permissions, evidence, memory policy and tools.

**Mau**
- Product disposition: personal profile/mode for Mauricio, not a separate product.
- Canonical destination: **TORO Personal** with a Mauricio-specific private profile and connected tools.

### Conditional integration

**RicoSky / repository `dreamauro`**
- Current role: experimental marketplace.
- If retained inside TORO, canonical subsystem is **TORO Exchange**.
- Do not merge marketplace transactional logic into core until authority, payment, privacy and commercial rules are validated.

### Separate product powered by TORO

**AI for Dreamers**
- Current role: independent learning/building product.
- Relationship: may consume TORO Identity/Tools/Knowledge contracts later.
- It remains a separate product unless an explicit product decision merges it into TORO.
- "Powered by TORO" does not make it a TORO subsystem.

### Connected channels, not TORO subsystems

Dreamcatcher public websites, Kross, Alegra, Dropbox, WhatsApp, WeSpeak, GitHub, Vercel, Gmail and similar systems remain channels/authorities/connectors. They are governed by TORO but keep their real product names.

## 4. TORO User Vault

Every human user receives a logical **TORO User Vault**.

A User Vault is not a separate Supabase project/database per person. It is an isolated user-owned data domain inside the canonical TORO data platform, enforced by identity, RLS, encryption where required, purpose limitation and audit.

The user experience may describe it as "your TORO data" or "your private TORO memory".

### Required scopes

1. `personal`
   - private to the user by default;
   - personal preferences, goals, reminders, personal tools, private assistant memory;
   - employer/organization has no content access by default.

2. `work_private`
   - user-specific work context;
   - own schedule, own requests, own tasks, personal work preferences;
   - organization access only when required by a documented role/policy.

3. `work_org`
   - organizational operational data;
   - tasks, handoffs, role context, approved knowledge, work messages;
   - governed by organization and role.

4. `shared`
   - explicitly shared by the user with another person/team/workspace.

5. `system`
   - security, consent, audit, usage and technical state;
   - visible only according to governance policy.

Cross-scope reads must be explicit. Personal information must never be silently promoted into employer-visible work data.

## 5. User Vault data model

Prefer one canonical platform with user-scoped records over one physical database per user.

Minimum model:

- `user_profiles` — display preferences, language, timezone, communication style.
- `user_workspace_memberships` — organization/workspace membership and role context.
- `user_memory_items` — structured durable memory with scope, provenance, confidence and retention.
- `user_preferences` — stable user choices by domain.
- `user_goals` — personal or work goals with scope and owner.
- `user_relationship_context` — optional, privacy-controlled relationship references.
- `user_tool_connections` — connector ownership/status/scopes; never raw secrets.
- `user_tool_permissions` — what each user may read, draft, execute or approve.
- `user_notification_preferences` — channel, quiet hours, escalation and digest preferences.
- `user_consents` — consent/purpose/retention records.
- `user_learning_signals` — corrections, repeated needs and confirmed preferences; no silent production-rule changes.
- `user_context_events` — normalized event references for future usefulness; payload minimized.
- `user_data_exports` — portability/export requests and evidence.
- `user_data_deletion_requests` — lifecycle and deletion workflow where applicable.

Existing `app_users`, `employees`, `employee_private_profiles`, `employment_profiles`, `user_roles`, `user_sessions`, notifications and message read states should be reused rather than duplicated.

## 6. Data collection rule

TORO should collect useful context, but not indiscriminately.

A candidate item may become durable user data only when TORO can record:

- user_id;
- scope;
- purpose;
- source/provenance;
- confidence;
- sensitivity;
- visibility;
- retention class;
- verification state;
- created/updated timestamps;
- whether the user can edit/delete it;
- whether an organization can access it.

Do not persist raw conversation, browsing, email, location, health, financial or relationship data merely because it may someday be useful.

Default rule:

`useful + permitted + purpose-known + scoped + provenance-known = eligible for durable memory`

Otherwise keep it transient or do not retain it.

## 7. Memory promotion model

Useful data moves through:

`Observed -> Candidate -> Confirmed/Verified -> Durable -> Superseded/Expired/Deleted`

Examples:
- one message saying "I like window seats" -> Candidate;
- repeated behavior or explicit confirmation -> Durable personal preference;
- a temporary shift swap -> operational event, not permanent personality memory;
- an employee correction to room procedure -> work knowledge candidate, reviewed before organization-wide promotion.

No agent may silently convert a personal observation into an organizational fact.

## 8. Five applied architecture improvements

### Improvement 1 — Canonical TORO naming registry

All internal subsystems use `TORO <Name>`. Legacy names are aliases during migration only. New subsystems require registry entry before implementation.

### Improvement 2 — One identity, multiple contexts

A human has one TORO identity with multiple memberships and scopes rather than separate disconnected accounts per subsystem. This enables continuity without leaking private context.

### Improvement 3 — User Vault instead of physical database-per-user

Give each user strong logical isolation, exportability and privacy using RLS/scoping. Avoid a separate physical database per user except for exceptional regulatory or enterprise isolation requirements.

### Improvement 4 — Memory with provenance and lifecycle

Every durable memory has scope, provenance, sensitivity, confidence and retention. This makes TORO learn continuously without becoming an ungoverned surveillance archive.

### Improvement 5 — Legacy-to-TORO integration contract

Every existing project must be classified as:
- TORO subsystem to merge;
- specialist persona;
- connector/channel;
- separate product powered by TORO;
- legacy source to retire;
- experiment pending decision.

No project may create its own identity, permissions, message store, approval system, task engine or memory model when the canonical TORO capability already exists.

## 9. Immediate migration priorities

1. Map DreamTeam to TORO People at schema/API/workflow level; do not rebuild HR.
2. Add TORO User Vault schema around existing user/employee structures.
3. Expand TORO Identity to support one person across personal and multiple organization memberships.
4. Move team messaging/notifications under TORO Comms and bind channels through TORO Tools/OpenClaw.
5. Create a subsystem registry in code/config so new modules cannot introduce unprefixed TORO subsystem names.
6. Classify RicoSky as TORO Exchange experiment and AI for Dreamers as separate product powered by TORO unless explicitly changed.
7. Update old TERE/RICO/FIONA/SKY/SOBRESITO wording to TORO-prefixed specialist naming over time without breaking existing routes.

## 10. Non-negotiable invariants

- One visible TORO for normal users.
- One canonical identity per human.
- No hidden cross-user memory.
- No silent personal-to-employer data leakage.
- No subsystem-specific shadow identity system.
- No subsystem-specific duplicate task/approval/message engine without documented necessity.
- No new internal subsystem name without `TORO`.
- External authority remains external authority.
- Learning is governed and reversible.
