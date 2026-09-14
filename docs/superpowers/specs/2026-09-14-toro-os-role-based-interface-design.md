# TORO OS Role-Based Interface — Design Specification

Date: 2026-09-14
Status: Approved architecture, specification pending final user review
Repository: `Dramcatcherst/Toro-OS`
Canonical data platform: Supabase project `abtyrbqlqbsastmridzp`

## 1. Objective

TORO OS becomes Dreamcatcher's single operational application. Supabase is the canonical structured system; specialized transactional systems such as Kross and Alegra retain authority for the domains they own. Airtable remains only as controlled backup/reference, ideally consolidated into one residual backup base and never used as a hidden operational database.

The product must reduce Mauricio's cognitive load, let staff work from role-specific interfaces, preserve source-of-truth boundaries, and keep every sensitive action auditable, reversible when possible, and permission-gated.

## 2. Product principles

1. One operational app, multiple role experiences.
2. Mobile-first; desktop enhances rather than changes the model.
3. Users see business concepts, not database tables.
4. Supabase is canonical for Dreamcatcher master data and operational state owned by TORO OS.
5. Kross remains live authority for reservation, room assignment, price, availability, payment and other live PMS transaction facts.
6. Alegra remains fiscal/accounting authority where applicable.
7. Airtable is backup/reference only after cutover.
8. Least privilege everywhere: RLS, server-side RPC, scoped actions.
9. Every important write produces audit evidence.
10. Any action with financial, legal, guest-impacting or destructive consequences has an approval gate.
11. No feature exists only because data exists; every screen must answer a real job-to-be-done.
12. Frequent safe actions should take no more than three taps on mobile.

## 3. Architecture

### User flow

User -> TORO Web App -> role/action layer -> Supabase canonical services -> specialized systems / agents.

### Specialized agents

- TORO: executive orchestration and decision routing.
- TERE: guest sales, reservations support, concierge, lifecycle.
- RICO: hotel operations, housekeeping, maintenance, laundry and service quality.
- FIONA: finance, accounting administration, compliance and people operations.
- SKY: marketing, growth, brand and ancillary revenue.
- SOBRESITO: systems, product, data, integrations, reliability and security.

### External authorities

- Kross: reservation and live PMS truth.
- Alegra: accounting/fiscal truth where applicable.
- WeSpeak/WhatsApp: guest communication channel.
- Dropbox/media stores: file/media source where governed.
- GitHub/Vercel: software source/deployment truth.
- Airtable: archive/backup reference only after cutover.

## 4. Roles and primary experiences

### Mauricio — Executive Home

Purpose: make decisions, see exceptions, monitor progress, and delegate without navigating operational detail.

Primary blocks:

1. **Necesita mi decisión** — maximum five items. Each item must show recommendation, impact, deadline, evidence and one-tap approval/delegation options.
2. **Qué está mal hoy** — guest, operations, money and systems exceptions only.
3. **Qué avanza sin mí** — 3–7 delegated actions with owner, next step and evidence.
4. **Mis proyectos** — milestone, blocker, next action, owner and confidence/status.
5. **Acciones rápidas** — approve, delegate, create issue, ask TORO, open reception, finance or maintenance.

Primary navigation:

`Inicio · Decisiones · Hotel · Huéspedes · Dinero · Proyectos · Equipo · Conocimiento · Sistemas`

### Gerencia — Manager Home

Purpose: daily hotel control, staffing, guest issues, approvals and execution monitoring.

Key views: today, unresolved incidents, room readiness, staff handoffs, approvals, purchases, financial exceptions, projects.

### Recepción — TERE / Reception Hub

Purpose: guest-facing execution with governed knowledge.

Must provide room/villa knowledge, FAQs, guest messages, experiences, direct-sales guidance and escalation. Kross remains live transactional authority for reservation facts and writes.

### Operations — RICO

Purpose: convert hotel issues into actionable work.

Role variants:
- Housekeeping
- Laundry
- Maintenance

Each gets focused checklists/tickets, not the full operational database.

### Finance/Admin — FIONA

Purpose: reconciliations, invoices, payments, recurring obligations, exceptions, reports and administrative evidence. Private financial data must never surface to unrelated roles.

### Growth — SKY

Purpose: campaigns, content, SEO/SEM, reviews, partnerships, ancillary products and verified media/content workflows.

### Systems — SOBRESITO

Purpose: integration health, deploy status, data quality, sync/import runs, security issues, backups, system ownership and incident response.

## 5. Shared navigation and interaction model

### Mobile

- bottom navigation for the 4–5 most frequent role-specific sections;
- global `+` quick action;
- notification/inbox badge;
- contextual TORO assistant entry;
- search accessible from every major screen;
- cards first, tables only for drill-down.

### Desktop

- persistent left navigation;
- larger dashboard layouts;
- side-by-side detail panel where useful;
- no desktop-only critical functions.

### Global search

Search should route users to governed entities rather than raw rows: rooms, villas, guests where authorized, tasks, projects, SOPs, providers, experiences, knowledge, integrations and reports.

## 6. Decision system

A decision item contains:

- title;
- domain;
- urgency/impact;
- recommendation;
- rationale;
- options;
- evidence;
- owner/requester;
- deadline;
- approval requirement;
- downstream action on approval;
- audit trail.

Supported actions:

`Aprobar · Modificar · Delegar · Posponer · Rechazar · Explícame mejor`

The historical Airtable Command Center is archive input only. It must not be reactivated as the live decision system.

## 7. Data and source-of-truth rules

Each displayed datum should have, where relevant:

- canonical source;
- freshness timestamp;
- provenance/source reference;
- verified/needs-review state;
- public/private sensitivity;
- last material change.

TORO OS must never silently copy a transactional system into a second operational ledger if a live authoritative source can be queried or freshly imported.

## 8. Actions, approvals and rollback

### Low-risk actions

Examples: acknowledge, assign, comment, add internal note, create draft task. These can execute directly if role permits.

### Medium-risk actions

Examples: modify operational configuration, publish governed content, approve provider data. Require confirmation and audit.

### High-risk actions

Examples: money, legal/compliance, guest reservation changes, destructive deletion, permissions/security, public commitments with material risk. Require explicit approval, source validation and evidence.

Every reversible action should record rollback metadata or a prior-state snapshot where practical.

## 9. Notifications

Notifications must be exception-driven, not a second task list.

Categories:
- approval required;
- guest-impacting issue;
- operational SLA breach;
- money/compliance exception;
- integration failure;
- data quality/freshness issue;
- project blocker.

Users should be able to acknowledge, snooze, delegate or open the source item.

## 10. Permissions and security

- Supabase Auth for identities.
- RLS on private tables.
- server-side actions/RPC for sensitive operations.
- no service-role credentials in browser code.
- role + organization/property scoping.
- explicit access boundaries for Revenue, Finance and guest/private data.
- least privilege defaults.
- audit log for sensitive reads/writes where practical.
- no secret values in logs or evidence tables.

## 11. Reliability and observability

System status must expose:

- connector health;
- last successful sync/import;
- stale-data warnings;
- deployment status;
- failed background jobs;
- backup/restore state;
- security warnings;
- ownership/recovery owner.

A failure in an external system should degrade gracefully to read-only/stale-state messaging rather than silently presenting stale data as current.

## 12. Loading, empty and error states

Every major screen requires explicit:

- loading state;
- empty state that explains what to do next;
- permission-denied state;
- stale-data state;
- partial-system-outage state;
- retry/escalation path.

No raw stack traces or database errors are user-visible.

## 13. Accessibility and usability

- touch targets suitable for one-handed mobile use;
- semantic labels;
- keyboard operation on desktop;
- readable contrast;
- status not conveyed by color alone;
- Spanish operational naming by default;
- concise language and progressive disclosure.

## 14. Airtable target state

Preferred end-state:

`DREAMCATCHER VAULT — BACKUP`

Purpose:
- controlled archival snapshot/reference;
- restore support;
- no primary operational workflows;
- no hidden automation dependency;
- no live decision/task system;
- documented owner and retention policy.

More than one Airtable base is allowed only if restore, permission/ownership or technical limitations provide a concrete documented reason.

Residual Airtable bases must be classified as:

`OPERATIONAL UNTIL REPLACED · MIGRATE · ARCHIVE TO VAULT · SAFE TO RETIRE`

## 15. Migration and decommission model

Before retiring an operational Airtable dependency:

1. inventory data/interfaces/forms/automations/consumers;
2. classify canonical vs reloadable vs historical;
3. migrate only unique useful data;
4. preserve provenance;
5. replace operational workflow;
6. verify parity;
7. capture backup and restore evidence;
8. obtain required human approval;
9. only then archive/retire.

Historical Kross/Alegra/OTA data that can be regenerated should not be copied merely to make a migration look complete.

## 16. Screen hierarchy — first implementation wave

1. Authentication / role resolution
2. Mauricio Executive Home
3. Decisions
4. Global search
5. Reception / TERE
6. Operations / RICO
7. Projects
8. Knowledge
9. Finance / FIONA
10. Growth / SKY
11. Systems / SOBRESITO
12. Admin / permissions / audit

Wave 1 must prove the shared shell and permissions before adding department depth.

## 17. Analytics and product telemetry

Measure product usefulness rather than page views:

- decisions resolved;
- time-to-decision;
- actions delegated without Mauricio intervention;
- task/SLA completion;
- guest issue resolution;
- direct-sales/upsell support where attributable;
- system errors and stale-data events;
- search success;
- role adoption;
- number of Airtable operational dependencies remaining.

No sensitive guest or financial payload should be copied into analytics unnecessarily.

## 18. Feature flags and rollout

Roll out by role and module. New modules should be enableable independently. High-risk writes should launch read-only first, then limited internal write access, then broader rollout after validation.

Recommended order:

1. Mauricio read/decision shell
2. Reception / TERE
3. Operations / RICO
4. Projects/Knowledge
5. Finance
6. Growth
7. Systems/Admin depth

## 19. Testing strategy

Required layers:

- unit tests for role/permission and transformation logic;
- integration tests for server actions/RPC;
- RLS positive and negative tests;
- end-to-end mobile and desktop critical flows;
- stale/error state tests;
- high-risk action confirmation tests;
- audit evidence assertions;
- source-of-truth parity tests for external-system reads;
- backup/restore drills for critical canonical data.

No module is considered complete solely because it renders.

## 20. Acceptance criteria — 25 improvements

1. Single source of truth boundaries documented and enforced.
2. Mobile-first critical flows.
3. Spanish operational naming.
4. Role-based navigation.
5. Least privilege.
6. RLS on private canonical data.
7. Safe server-side RPC/actions.
8. Audit history for sensitive actions.
9. Provenance for migrated/imported data.
10. Freshness indicators for external/live data.
11. Import validation gates.
12. Deterministic deduplication where applicable.
13. Data-quality/verification states.
14. Valid backups.
15. Restore drills.
16. Disaster-recovery runbook.
17. Private Revenue access.
18. No unnecessary Kross duplication.
19. Canonical TERE knowledge.
20. Media rights/identity controls.
21. Actionable task hygiene; historical tasks inactive.
22. Integration-health view.
23. Drift detection for legacy/external sources.
24. Embedded operating documentation/runbooks.
25. Controlled legacy retirement with explicit evidence.

These are acceptance criteria, not 25 separate projects.

## 21. Definition of done

TORO OS is complete enough for operational cutover when:

- Mauricio and each active role can perform their critical daily jobs through TORO OS;
- source-of-truth boundaries are enforced;
- critical writes are permissioned and auditable;
- role-specific mobile flows are tested;
- no critical operational workflow depends solely on Airtable;
- Airtable is reduced to backup/reference state with documented restore capability;
- integration health and stale-data states are visible;
- Revenue/Finance/private data remain restricted;
- the system has a tested backup/restore and rollback story;
- remaining legacy systems have owners and explicit disposition.

## 22. Explicit non-goals for initial build

- replacing Kross as PMS;
- replacing Alegra as accounting ledger;
- migrating every historical transactional record;
- building separate apps per department;
- exposing raw Supabase tables as the user interface;
- recreating Airtable UI patterns for their own sake;
- autonomous high-risk financial/legal/reservation changes without approval.

## 23. Implementation boundary

This document approves architecture and product behavior only. Code implementation starts after final review of this specification and a separate implementation plan generated under the Superpowers writing-plans workflow.
