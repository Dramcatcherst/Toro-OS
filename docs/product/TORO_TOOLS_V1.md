# TORO Tools v1 — Tool Catalog, Connections & Permissions

**Status:** CURRENT PRODUCT SPEC
**Date:** 2026-09-22
**Subsystem:** TORO Tools

## 1. Purpose

TORO Tools is the governed catalog of capabilities TORO can use for a person or an organization.

TORO Tools must make it simple to answer:
- what tools exist;
- which tools are connected;
- who owns each connection;
- what TORO can do with it;
- what the current user may do with it;
- whether the connection is healthy/current;
- what actions require approval;
- what data TORO may retain from it;
- what it costs;
- how to disconnect it.

## 2. Five different states — never conflate them

A tool may be:

1. **Discoverable** — TORO knows an adapter/integration could exist.
2. **Available** — connector/provider support is available in the current environment.
3. **Connected** — credentials/OAuth/account binding exists.
4. **Authorized** — the active user/context has permission for specific capabilities.
5. **Operational** — health check/freshness proves the capability works now.

A tool card must never show "Connected" merely because code for a connector exists.

## 3. Ownership classes

### Personal connection

Owned by the human:
- personal Gmail;
- personal Calendar;
- contacts;
- private Dropbox/Drive;
- personal travel/budget tools.

Rules:
- stored under TORO Personal/User Vault metadata;
- employer has no content access by default;
- organization roles cannot grant themselves access;
- offboarding from a company does not revoke/delete personal tools.

### Organization connection

Owned by the organization:
- Kross;
- Alegra;
- official hotel email;
- official WeSpeak/WhatsApp;
- company Dropbox/Drive;
- GitHub/Vercel;
- company social channels.

Rules:
- governed by TORO Tools;
- access derives from active organization membership + role + explicit connector permission;
- offboarding immediately removes access;
- connection remains with the organization.

### Delegated/hybrid connection

A personal account may explicitly grant a narrow business use.

Example:
- user allows TORO to read only a work calendar;
- personal mailbox remains private.

No hybrid access is inferred automatically.

## 4. Capability model

Each connector exposes granular capabilities.

Canonical actions:
- `search`
- `read`
- `draft`
- `create`
- `update`
- `execute`
- `approve`
- `monitor`
- `notify`
- `export`
- `admin`

Do not grant "full access" when one capability is enough.

## 5. Legacy action/risk levels

> **Compatibility note — 2026-09-23:** L0–L5 below are historical tool action/risk classes, not the current workflow-autonomy ladder. Canonical autonomy is A0–A6 in `docs/product/TORO_AUTONOMY_AND_ACTION_MODEL_V1.md` and `TORO_BRAIN_COGNITIVE_OPERATING_MODEL_V1.md`. Do not map L-number to A-number directly.

### L0 — observe
Search/read public or authorized non-sensitive information.

### L1 — prepare
Draft email/message/task/content without sending.

### L2 — low-risk internal write
Create internal task, acknowledgement or note.

### L3 — external/reversible action
Send email, publish approved internal update, schedule meeting, update CRM.

Requires role/confirmation according to policy.

### L4 — high-risk
Money, legal, reservation mutation, payroll, permissions/security, destructive deletion, public commitment with material impact.

Requires explicit approval and evidence.

### L5 — prohibited/unsupported
Action TORO is not allowed to perform in the current product state.

### Canonical interpretation

- L0 may correspond to A0 or A1 depending whether TORO only reads or also explains.
- L1 is normally A3 preparation; a recommendation alone is A2.
- L2/L3 actions require A4 approval or a specifically earned A5 bounded workflow.
- L4 stays approval-gated unless policy explicitly permits a narrower bounded action; many L4 classes may remain A4 indefinitely.
- L5 is unavailable regardless of autonomy level.

Effective authority is always the intersection of identity/scope, role permissions, workflow policy, connector permissions, A-level, action-risk gate, source freshness and runtime support.

## 6. Catalog categories

The list below is a capability catalog, not a claim that every connector is currently live in TORO.

### Communication
- WhatsApp / OpenClaw
- WeSpeak
- Gmail
- Outlook Email
- Slack
- Microsoft Teams
- SMS / phone providers
- transactional email providers such as Resend

### Calendar and meetings
- Google Calendar
- Outlook Calendar
- Calendly
- Zoom

### Contacts
- Google Contacts
- CRM contact books

### Files and knowledge
- Google Drive
- Dropbox
- Box
- Notion
- local/approved document stores

### Projects and teamwork
- TORO Projects
- Linear
- ClickUp
- Asana
- monday.com
- Slack/Teams collaboration

### CRM and sales
- TORO Guests / CRM-light
- HubSpot
- Close
- Salesforce where available
- prospecting/research systems

### Hospitality
- Kross PMS / booking engine
- WeSpeak
- Booking.com research/handoff
- OTA/channel sources
- experience/provider systems
- Tripadvisor/review research

Kross remains live PMS authority until an explicit authority change is approved.

### Finance and accounting
- Alegra
- banks/read models where securely supported
- invoice sources
- personal budgeting tools
- payment/reconciliation evidence

### Marketing and design
- Canva
- Figma
- Meta/social channels
- Google Business Profile
- website/CMS
- PostHog/analytics
- email marketing providers

### Development and systems
- GitHub
- Vercel
- Supabase
- OpenAI Platform
- Codex
- Replit
- Lovable
- Railway
- browser/computer-use adapters

### Travel and personal assistance
- Booking.com
- Tripadvisor
- calendar
- contacts
- email
- maps/location tools
- reminders and automations

## 7. Dreamcatcher current tool classes

### Confirmed/known business authorities or runtimes
- Kross — live PMS authority;
- WeSpeak — confirmed-active communication runtime;
- Vercel — active deployment/runtime evidence;
- Supabase — canonical TORO-owned runtime data;
- GitHub — code/architecture authority;
- Dropbox — files/media/evidence;
- Airtable — transitional operational/reference estate;
- Alegra — fiscal/accounting authority when connected/verified.

### Configured/unverified
- OpenClaw runtime — registered, direct runtime audit required.

### Potential personal/user tools
Current connector ecosystem supports examples including:
- Gmail;
- Outlook Email;
- Google Calendar;
- Outlook Calendar;
- Google Contacts;
- Dropbox;
- Box;
- Notion;
- Slack;
- Teams;
- Calendly;
- Zoom.

Availability does not mean TORO has permission to connect them for a user.

## 8. Existing canonical registry — reuse first

Current Supabase already has:
- `integrations.external_dependency_registry`;
- source authority/governance structures;
- integration logs/import structures;
- connector/system evidence.

Do not create a second registry immediately.

First evolve the existing dependency registry to cover:
- provider/tool key;
- ownership class;
- connection status;
- capability set;
- risk ceiling;
- health/freshness;
- privacy class;
- secret reference;
- cost;
- human owner;
- system owner;
- failure mode.

Only split into dedicated normalized tables after implementation proves the current registry cannot support the workflow cleanly.

## 9. Personal tool metadata

TORO User Vault may store metadata for **personal** tool connections only:
- provider;
- masked external account reference;
- granted scopes;
- status;
- secret reference;
- health timestamp.

It must never store raw OAuth/access tokens.

Organization-owned connector metadata belongs to TORO Tools/integration governance, not to an employee User Vault.

## 10. Tool permission equation

Every action evaluates:

`User + Context + Membership + Role + Tool Connection + Capability + Data Scope + Risk + Approval = Decision`

Possible decisions:
- ALLOW;
- ALLOW_READ_ONLY;
- PREPARE_ONLY;
- REQUIRE_CONFIRMATION;
- REQUIRE_APPROVAL;
- DENY;
- UNAVAILABLE;
- DEGRADED.

## 10.1 Semantic action taxonomy

Canonical semantic action IDs and bilingual classification fixtures live in:
- `docs/product/TORO_ACTION_TAXONOMY_V1.md`
- `src/lib/action-taxonomy.ts`

The taxonomy classifies **what kind of business action is being requested**.

It does not define:
- execution system;
- source authority;
- connector status;
- agent ownership;
- permission;
- approval;
- autonomy.

Those remain runtime decisions under the permission equation above.

This explicitly supersedes the old legacy `system-action-router` as an authority engine while preserving useful semantic intent evidence.

---

## 11. Tool activation flow

### Personal
1. User opens **TORO Tools → Personal**.
2. Selects tool.
3. TORO explains exact capabilities and data access.
4. User connects explicitly.
5. TORO validates connection health.
6. User chooses optional features.
7. Connection appears in User Vault metadata.
8. User can revoke/disconnect.

### Organization
1. Admin/authorized owner selects tool.
2. Define source authority.
3. Connect organization account.
4. Define role access.
5. Define read/write ceiling.
6. Test with non-destructive action.
7. Record health/evidence.
8. Enable feature flag.
9. Monitor failures/cost.

## 12. User-facing Tool Card

Every card should show:

- tool name/logo;
- Personal or Company;
- connection state;
- account/workspace label;
- what TORO can do;
- what **you** may do;
- last successful check;
- privacy level;
- approval requirement;
- optional cost;
- disconnect/manage action.

Example states:

`Available · Connect`
`Connected · Read only`
`Connected · Draft only`
`Connected · Can execute with approval`
`Needs attention`
`Permission requested`
`Unavailable`

## 13. TORO Tools dashboard

Sections:

### My Tools
Personal user-owned connections.

### Company Tools
Connections available through current organization/role.

### Recommended
Tools that solve a demonstrated workflow gap.

### Needs Attention
Expired auth, stale sync, failed health checks, missing permission.

### Permissions
Requested/approved capability changes.

### Automations
Workflows built on connected tools.

### Cost & Usage
Where material:
- provider cost;
- API/AI usage;
- current limits;
- anomalous usage.

## 14. Recommendation rule

TORO should not recommend connectors merely because they exist.

Recommend only when:
- repeated manual work is evidenced;
- a connector removes meaningful friction;
- existing tools cannot already solve it;
- privacy/security boundary is clear;
- expected value exceeds complexity/cost.

## 15. Tool learning rule

TORO may learn:
- which tools a user prefers;
- which workflows they repeatedly execute;
- successful/failed connector actions;
- preferred notification/result format.

TORO may not infer broader access permission from repeated use.

Usage never expands authorization automatically.

## 16. No vendor lock-in in the core

TORO capabilities should be expressed generically.

Examples:
- `send_email`, not `gmail_send` in business workflow logic;
- `calendar_create_event`, not `google_calendar_create`;
- `file_search`, not `dropbox_search`;
- `crm_update_contact`, not `hubspot_update_contact`.

Provider adapters implement the generic capability.

This allows TORO to switch or support multiple vendors without rewriting workflows.

## 17. Initial Dreamcatcher priorities

P0:
1. OpenClaw direct runtime audit.
2. WeSpeak parity/health visibility.
3. Kross read-through/public-engine bridge.
4. Alegra governed read connector.
5. Dropbox/media access.
6. GitHub/Vercel/Supabase system health.

P1:
7. Gmail/company email.
8. Google Calendar/company schedules where useful.
9. Google Drive if actual operating documents require it.
10. social/review sources.

Personal tools should pilot with one user only after TORO User Vault RLS is verified.

## 18. Definition of done

TORO Tools v1 is complete when:
- every live connector has owner, authority, scope, health and failure behavior;
- personal and organization connections are technically separated;
- permissions are capability-level;
- no secret appears in browser/log/business tables;
- a user can understand what TORO can/cannot do with each tool;
- connection state is proven rather than assumed;
- tool failures degrade visibly;
- no workflow requires users to understand connector internals.
