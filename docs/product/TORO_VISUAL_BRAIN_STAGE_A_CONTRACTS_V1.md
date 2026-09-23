# TORO Visual Brain — Stage A Contracts v1

**Status:** CURRENT TARGET CONTRACT — subordinate to the TORO Brain General Plan  
**Date:** 2026-09-22  
**Owner:** TORO Brain  
**Implementation owners:** TORO Data + TORO Governance + TORO Core + TORO Builder  
**Depends on:** TORO Scope Graph v1, TORO Identity/User Vault, TORO Visual Brain Architecture v1  
**Reference implementation:** Dreamcatcher Hotel  
**Production DDL authorized:** No

---

## 1. Purpose

This contract closes Stage A for the first Visual Brain implementation.

It defines four things:

1. **Brain Projection Contract** — how canonical TORO state may be projected into visible nodes, edges and summaries.
2. **Event Spine Contract** — how existing audit, integration, approval, agent and workflow activity is normalized for timeline/realtime use.
3. **Permission & Redaction Contract** — how visibility is resolved before data reaches the client.
4. **Visual Semantic Contract** — the meaning of visible status, risk, verification, freshness, approval and activity states.

This document does not authorize:
- a new database;
- generic graph DDL;
- production writes;
- external-business onboarding;
- a new permission engine;
- a separate event truth store;
- public use of private Dreamcatcher data.

---

# 2. Global invariants

The following are non-negotiable.

1. **One TORO Brain.**
2. **One General Plan.**
3. Canonical domain truth remains in canonical domain models.
4. The Brain visual layer is a projection, never a second source of truth.
5. Authorization happens server-side before projection.
6. Hidden data is not sent to the browser and hidden with CSS.
7. A graph relationship does not grant access.
8. Realtime delivery does not become evidence authority.
9. Existing risk, approval and action-level vocabularies should be reused.
10. Existing logs should be adapted before creating replacement logs.
11. Dreamcatcher-specific assumptions remain in the Dreamcatcher reference implementation.
12. Public demos use synthetic or explicitly approved public/anonymized data.
13. Hidden model chain-of-thought is never exposed.
14. Every production action must preserve evidence, verification and rollback behavior defined by its owning subsystem.

---

# 3. Existing sources to reuse

## 3.1 Canonical Identity / People foundation

Current approved target database for Identity + User Vault + TORO People foundation:

`Supabase abtyrbqlqbsastmridzp`

Existing reusable public-domain structures include:
- `organizations`
- `properties`
- `app_users`
- `user_roles`
- `employees`
- `approval_requests`
- `audit_logs`
- `access_events`
- `integration_logs`
- `sync_outbox`
- `user_sessions`

Identity plan already defines:
- `identity.organization_memberships`
- `resolveToroContext(actor, requestedContext?)`

The Visual Brain consumes this context contract. It does not create another context resolver.

## 3.2 Useful provenance patterns from current operational pilot

Supabase `fpihshyoobzctnlerfjp` contains useful patterns to generalize:
- source class;
- authority level;
- source confidence;
- authoritative flag;
- source reference;
- last verification;
- blockers;
- next action;
- import idempotency;
- source hashes/as-of timestamps.

These are design inputs for TORO Data. The F&B project itself is not the master Brain database.

## 3.3 Existing code contracts

Reuse and extend:
- `RiskLevel`
- `ApprovalRequirement`
- `OperationalStatus`
- `ActionLevel`
- `SourceMeta`
- `ApprovalRecord`
- `AuditEvent`
- `ConnectorHealthRecord`

Existing APIs that can feed an early read-only Brain:
- `/api/connector-health`
- `/api/approvals`
- `/api/policy/evaluate`
- `/api/agent/prepare`
- `/api/modules`

---

# 4. Brain Projection Contract

## 4.1 Purpose

A Brain Projection is a safe, context-resolved, permission-filtered read model for one user in one active context.

It answers:
- what the user is allowed to see;
- what is related;
- what is important now;
- what state each visible object is in;
- what safe actions are available.

It does **not** reproduce the full database.

## 4.2 Required projection envelope

Every projection response includes:

- contract version;
- generated timestamp;
- active resolved context;
- projection purpose/mode;
- nodes;
- edges;
- optional recent normalized events;
- source summary;
- degraded/partial state when applicable.

## 4.3 Projection modes

Initial allowed modes:
- `focus` — one entity plus high-value neighbors;
- `workspace` — active organization/business/workspace;
- `timeline` — activity-centered;
- `systems` — connector/runtime health;
- `demo` — synthetic/public-safe only.

Future:
- portfolio;
- shared-project;
- presentation.

## 4.4 Node rule

A visible node must map to:
- a canonical entity;
- a canonical workflow/action state;
- a governed projection of one;
- or an explicitly synthetic demo fixture.

A node is not created because it looks useful visually.

### Initial node kinds

- principal
- portfolio
- organization
- business
- workspace
- property
- project
- goal
- person
- team
- role
- agent
- connector
- workflow
- task
- approval
- decision
- kpi
- risk
- incident
- asset
- knowledge
- evidence
- customer
- supplier

Additional domain kinds require an existing canonical owner.

## 4.5 Node minimum fields

- opaque projection id;
- kind;
- display label;
- active scope reference;
- operational status;
- risk;
- verification state;
- freshness state;
- source system;
- authority system where different;
- safe capability summary;
- optional current activity summary;
- optional safe metric summary.

Do not include arbitrary raw row payloads.

## 4.6 Edge rule

An edge represents a governed relationship, dependency or execution connection.

Initial relationship families:
- owns
- controls
- part_of
- operates
- manages
- member_of
- works_for
- responsible_for
- connected_to
- depends_on
- blocked_by
- triggered_by
- reads_from
- writes_to
- produces
- requires_approval_from
- evidenced_by

A visible edge requires:
1. both endpoints are visible;
2. the relationship itself is visible;
3. the relationship does not reveal a hidden entity or private fact.

## 4.7 Progressive disclosure

Default projection must be intentionally small.

Rules:
- load one focused neighborhood;
- cap initial nodes/edges;
- expand explicitly;
- do not render the whole enterprise by default;
- large collections move to list/search views;
- sensitive hidden neighbors do not leak through edge counts unless policy allows aggregate counts.

## 4.8 Projection IDs

Projection IDs must be:
- opaque enough not to expose secrets;
- stable during a session where useful;
- not treated as authorization tokens;
- non-authoritative.

The server resolves projection IDs back to canonical entities.

---

# 5. Event Spine Contract

## 5.1 Purpose

The Event Spine normalizes existing activity so TORO can show:
- what happened;
- who/what acted;
- what scope it affected;
- whether approval was required;
- whether execution completed;
- whether the result was verified;
- what evidence exists.

It is an observability/audit projection contract, not chain-of-thought.

## 5.2 Existing event sources to adapt first

- `audit_logs`
- `access_events`
- `integration_logs`
- approval ledger / `approval_requests`
- existing `AuditEvent` fixtures/contracts
- connector health changes
- agent prepare results
- future workflow/action execution records

Do not replace these first. Normalize them.

## 5.3 Canonical normalized event fields

Minimum event:
- `event_id`
- `occurred_at`
- `scope_ref`
- `actor_kind`
- `actor_ref`
- `event_type`
- `entity_kind`
- `entity_ref`
- `summary`
- `source_system`
- `authority_system`
- `risk`
- `approval_state`
- `execution_state`
- `verification_state`
- `evidence_refs`
- `redaction_class`
- `correlation_id`
- optional `parent_event_id`
- optional `workflow_run_ref`
- optional `action_ref`

Raw secret payloads are not copied into normalized events.

## 5.4 Actor kinds

- human
- agent
- workflow
- system
- connector

## 5.5 Initial event taxonomy

### Source/data
- `source.read`
- `source.synced`
- `source.failed`
- `source.freshness_changed`

### Policy/permission
- `policy.evaluated`
- `permission.denied`

### Agent/work
- `action.prepared`
- `action.started`
- `action.completed`
- `action.failed`
- `action.cancelled`
- `action.rolled_back`

### Approval
- `approval.requested`
- `approval.approved`
- `approval.rejected`
- `approval.needs_changes`

### Verification/evidence
- `verification.started`
- `verification.passed`
- `verification.failed`
- `evidence.attached`

### System/connector
- `connector.health_changed`
- `system.drift_detected`
- `system.incident_detected`

### Business/work
- `task.created`
- `task.completed`
- `decision.recorded`
- `risk.detected`
- `goal.progress_changed`

Domain owners may extend with namespaced event types.

## 5.6 Execution states

- queued
- reading
- analyzing
- waiting
- approval_required
- approved
- executing
- verifying
- completed
- failed
- rolled_back
- cancelled

## 5.7 Approval states

Normalized:
- not_required
- required
- pending
- approved
- rejected
- needs_changes
- expired

Adapters map existing approval enums into this normalization.

## 5.8 Verification states

- verified
- partially_verified
- unverified
- conflicted
- not_applicable

Verification state is separate from execution state.

Example:
- action completed + verification failed is valid and must display as incomplete/untrusted outcome.

## 5.9 Correlation

Every multi-step flow should carry a correlation id when available.

Preferred chain:

`message/request -> policy -> preparation -> approval -> execution -> verification -> evidence`

The Event Spine should make this chain replayable without exposing hidden reasoning.

## 5.10 Realtime

Realtime delivery:
- uses normalized safe event projections;
- is scoped/authorized;
- supports reconnect/replay;
- may batch/coalesce low-value events;
- does not bypass persisted evidence.

A visual pulse must correspond to real normalized state/event data.

---

# 6. Permission & Redaction Contract

## 6.1 Core rule

**Filter before projection.**

Server sequence:

`actor -> resolveToroContext() -> requested scope -> isolation policy -> role/tool permission -> data-class policy -> projection -> redaction -> response`

The client never receives a forbidden object for convenience.

## 6.2 Context sources

Visual Brain must use the same identity/context rules as:
- Portal;
- WhatsApp/OpenClaw;
- email;
- agents;
- automations.

No channel-specific visual authorization model.

## 6.3 Data visibility classes

Normalized projection classes:

- `public_reference`
- `work_org`
- `work_restricted`
- `work_private`
- `personal_private`
- `system_sensitive`
- `never_client`

`never_client` includes:
- secrets;
- raw credentials;
- service keys;
- hidden security material;
- sensitive internal policy details that could weaken controls.

These are never projected to the browser.

## 6.4 Capability summary

A visible node may include a safe summary:
- can open;
- can inspect evidence;
- can prepare an action;
- can execute an allowed action;
- can approve;
- action ceiling;
- approval requirement.

This is for UX only.

The server still re-authorizes every action.

## 6.5 Cross-scope rules

Cross-scope projection evaluates:
- actor;
- source scope;
- target scope;
- relationship;
- isolation mode;
- data class;
- purpose;
- explicit permission.

Possible outcomes:
- raw allowed;
- aggregate only;
- anonymized only;
- explicit fields only;
- approval required;
- denied.

A graph edge never overrides this evaluation.

## 6.6 Personal / employer boundary

Defaults:
- TORO Personal = private;
- employer cannot read personal vault content;
- personal context is not silently injected into organization projections;
- explicit user action is required to move information across the boundary.

## 6.7 External client boundary

Default:
- `client_isolated`

No raw client-to-client visual relationship or event leakage.

Reusable skill abstractions may cross only after protected content is removed.

## 6.8 Public demo boundary

Public site:
- synthetic fixtures by default;
- approved public reference data allowed;
- approved anonymized aggregate only where documented;
- no live private Dreamcatcher data by default;
- no private event replay.

## 6.9 Error behavior

When access is denied:
- do not confirm a hidden entity exists unless policy permits;
- return generic unavailable/forbidden state where appropriate;
- log the authorization decision through existing governance/audit mechanisms.

---

# 7. Visual Semantic Contract

## 7.1 Principle

Visual semantics encode business/system meaning.

They are not decorative animation rules.

The same semantic state must mean the same thing across:
- Brain graph;
- cards;
- timeline;
- workflow view;
- systems view;
- mobile;
- presentation mode.

## 7.2 Independent semantic dimensions

Do not collapse these into one generic status:

1. **Operational status**
2. **Risk**
3. **Verification**
4. **Freshness**
5. **Approval**
6. **Execution/activity**
7. **Health/degradation**

A node can be:
- operationally active;
- medium risk;
- stale;
- unverified;
- waiting for approval

at the same time.

## 7.3 Operational status

Reuse existing `OperationalStatus` where appropriate:
- Active
- Review
- Queued
- Draft
- Blocked
- Ready
- Not connected

Domain adapters may map stronger domain statuses into these visual summaries without replacing domain status.

## 7.4 Risk

Reuse:
- Low
- Medium
- High
- Critical

Risk must not be inferred from color alone.

High/Critical states require explicit label/icon/text treatment.

## 7.5 Freshness

Normalized:
- current
- aging
- stale
- unknown

Freshness threshold is domain/source-specific.

Do not define one global “stale after X hours” rule.

A source profile provides its freshness expectation.

## 7.6 Verification

- verified
- partially_verified
- unverified
- conflicted
- not_applicable

Verified means evidence/checks satisfy the owning domain contract.

It does not mean “TORO feels confident.”

## 7.7 Activity

- idle
- reading
- analyzing
- waiting
- approval_required
- executing
- verifying
- completed
- failed
- degraded

Motion is allowed only for active states backed by current events.

Reduced-motion users receive equivalent static state changes.

## 7.8 Health

- healthy
- degraded
- unavailable
- unknown
- misconfigured
- unverified

Health is not the same as connected/configured.

Connected does not mean healthy.
Configured does not mean verified.

## 7.9 Semantic UI tokens

Design system should expose semantic token names rather than domain-specific colors.

Initial token families:
- `state.operational.*`
- `state.risk.*`
- `state.verification.*`
- `state.freshness.*`
- `state.approval.*`
- `state.activity.*`
- `state.health.*`

Actual visual values belong to the TORO design system/Figma and accessibility review.

## 7.10 Motion rules

Allowed:
- subtle activity pulse;
- directed flow along a real active edge;
- transition into approval gate;
- verification completion;
- failure/degraded transition.

Avoid:
- constant decorative motion;
- fake “thinking”;
- animating every background read;
- motion that masks a stale or failed state.

## 7.11 Accessibility

Every semantic state must also be available through:
- text;
- label/icon;
- screen-reader description where actionable;
- non-graph list/timeline alternative.

No critical meaning relies only on:
- color;
- animation;
- spatial position.

---

# 8. Minimal read-only Brain API contract

Initial endpoint shape may be:

`GET /api/brain?mode=focus&ref=<opaque-ref>`

The exact route may change during implementation.

Server responsibilities:
1. authenticate;
2. resolve TORO context;
3. validate requested scope;
4. load canonical domain state;
5. adapt to Brain Projection;
6. filter/redact;
7. attach safe capability summary;
8. return contract version and source/freshness summary.

Initial response must be read-only.

No write endpoint is required for Stage B.

---

# 9. Adapter strategy

## 9.1 Identity adapter

Consumes:
- organizations;
- properties;
- users;
- memberships when implemented;
- employees;
- roles.

Produces safe person/org/property/workspace nodes and relationships.

## 9.2 Governance adapter

Consumes:
- policy decisions;
- approval ledger/requests;
- audit/access logs.

Produces:
- approval nodes/states;
- policy events;
- safe audit timeline entries.

## 9.3 Systems adapter

Consumes:
- connector health;
- integration logs;
- Systems Auditor state.

Produces:
- connector/system nodes;
- health/freshness;
- drift/incident events.

## 9.4 Projects adapter

Consumes canonical project/goal/task sources when verified.

Produces project/goal/task nodes and dependencies.

Do not hard-code transitional Airtable fields into universal Brain types.

## 9.5 Domain adapters

Dreamcatcher-specific adapters may expose:
- hotel/property facts;
- reservations;
- rooms;
- guest operations;
- revenue;
- maintenance;
- people.

They remain behind generic Brain projection contracts.

---

# 10. Synthetic fixture contract

Stage B synthetic data must:
- conform to the same Brain Projection contract;
- carry `demo` projection mode;
- be explicitly marked synthetic;
- use no real private guest/employee/payment data;
- include enough complexity to test approvals, stale data, connector degradation, evidence and activity.

Fixture scenarios should be versioned.

Example scenarios:
1. reservations up / cash tight;
2. connector degraded;
3. maintenance incident;
4. approval-required rate change;
5. stale accounting evidence;
6. owner portfolio conflict — FUTURE once portfolio mode is ready.

---

# 11. Performance contract for Stage B

Initial prototype targets:
- focused projection only;
- initial node count intentionally bounded;
- no entire-enterprise graph;
- heavy visualization lazy-loaded;
- mobile fallback available;
- no 3D dependency;
- no realtime dependency for first prototype.

Measure before setting hard production budgets.

---

# 12. Stage A acceptance criteria

Stage A is complete when:

1. this document is canonical and linked from `toro-context.yaml`;
2. TypeScript contracts exist in the canonical repository;
3. Brain types reuse existing risk/approval/action vocabularies;
4. projection rules explicitly forbid shadow truth;
5. server-side filtering/redaction is explicit;
6. Event Spine adapters reuse current audit/integration/approval sources first;
7. normalized execution/verification/approval states are defined;
8. visual semantic dimensions are independent;
9. mobile/accessibility alternative is required;
10. no generic graph DDL has been added;
11. no production Supabase/Vercel behavior has been changed;
12. Stage B can build a synthetic read-only `/brain` prototype without inventing new architecture.

---

# 13. Stage B handoff

Once Stage A passes:

1. add isolated read-only `/brain` route;
2. create versioned synthetic fixtures;
3. render focus graph + detail panel;
4. add list/timeline alternative;
5. visualize connector health;
6. visualize approval gates;
7. visualize verification/freshness;
8. connect only current safe read APIs;
9. run lint/build/preview/accessibility checks;
10. keep external writes disabled.

Only after that prototype is understandable should real permission-filtered Dreamcatcher state be connected.

---

# 14. Final rule

> **The Visual Brain may simplify truth, but it may never invent truth, authority or permission.**
