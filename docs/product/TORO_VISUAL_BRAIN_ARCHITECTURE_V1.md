# TORO Visual Brain Architecture v1

**Status:** TARGET ARCHITECTURE — subordinate to the TORO Brain General Plan  
**Date:** 2026-09-22  
**Master product:** TORO Brain  
**Operating layer:** TORO OS  
**Canonical repository:** `Dramcatcherst/Toro-OS`  
**Reference implementation:** Dreamcatcher Hotel  
**Current readiness:** INTERNAL PROOF

---

## 1. Purpose

TORO Brain must not become a conventional dashboard with AI attached.

The product experience should make a governed business model understandable at a glance and make real activity visible without exposing hidden model reasoning.

The visual system must answer five questions:

1. What exists?
2. What is connected to what?
3. What is happening now?
4. What needs attention or approval?
5. What changed because TORO acted?

The experience is a representation of the canonical TORO Brain state. It is not a second source of truth.

Core principle:

> **TORO Brain is visual by architecture, not by decoration.**

Every visual state must be backed by a canonical entity, relationship, event, workflow, metric, approval, evidence item or health state.

---

## 2. Alignment with the General Plan

This specification does not create:
- a second TORO product;
- a second master plan;
- a new identity system;
- a new permission engine;
- a shadow task or approval engine;
- a separate graph database by default;
- a separate source of business truth.

It implements the existing General Plan layers:
- Scope Graph;
- Truth Model;
- Connector Fabric;
- Intelligence and Orchestration;
- Workflow and Execution;
- Governance, Security and Resilience;
- Human Experience;
- Commercial Presentation.

Existing subsystem ownership remains authoritative.

### Ownership split

- **TORO Core** — composition, routing and shared shell.
- **TORO Data** — canonical graph projections, provenance, freshness and event contracts.
- **TORO Governance** — visibility, permissions, approvals, audit and redaction.
- **TORO Agents** — agent state, delegation and execution metadata.
- **TORO Systems** — connector/system health and runtime status.
- **TORO Builder** — implementation, component system, previews and delivery.
- **TORO Channels** — public website and distribution surfaces.
- **TORO Projects** — goals, projects, dependencies and execution progress.
- **TORO Knowledge** — governed knowledge/evidence references.
- **TORO User Portal** — role-specific human experience.

No new `TORO Visual` subsystem is required unless future evidence shows these owners cannot govern the capability cleanly.

---

## 3. Product surfaces

TORO Brain should present one coherent product through several surfaces.

### 3.1 TORO Public

Purpose:
- explain TORO;
- demonstrate the product;
- convert qualified prospects;
- show a safe, synthetic/approved example of TORO working.

Required experience:
- concise product story;
- interactive visual brain;
- “Watch TORO Work” guided scenarios;
- evidence of capability without exposing private client data;
- clear distinction between CURRENT, TARGET and demo/simulated states.

Public demos must use:
- synthetic data;
- anonymized approved aggregates;
- explicitly public reference data.

Private Dreamcatcher operational data is never a marketing default.

### 3.2 TORO Portal

Purpose:
- operational interface;
- context switching;
- decisions/approvals;
- evidence;
- graph exploration;
- workflows;
- system health;
- goals/projects;
- user/private context;
- advanced configuration when authorized.

Normal users experience one TORO. Specialist topology stays hidden by default.

### 3.3 TORO Command Surface

Available throughout the Portal:
- text;
- voice;
- image/document input where supported;
- active scope context;
- active entity/screen context;
- allowed tools/actions.

A command should be traceable to:
`intent -> scope -> context -> authority -> risk -> permission -> action -> evidence -> verification -> result`.

### 3.4 Presentation Mode

Purpose:
- owner overview;
- investor/product demo;
- onboarding visualization;
- portfolio understanding.

May use richer motion/3D than daily operations.

It must never become the canonical operational surface.

---

## 4. Brain interaction model

The main visual model is a governed relationship graph.

### 4.1 Node classes

Examples:
- principal/person;
- portfolio;
- organization;
- business;
- workspace;
- property/location;
- project/product;
- goal;
- team/role;
- agent;
- connector/system;
- workflow;
- task;
- approval;
- decision;
- KPI;
- risk;
- incident;
- asset;
- knowledge/evidence;
- customer/guest;
- supplier/provider.

Not every database row becomes a visible node.

Visibility is role-, scope- and relevance-dependent.

### 4.2 Edge classes

Examples:
- owns;
- controls;
- part_of;
- operates;
- manages;
- works_for;
- member_of;
- depends_on;
- responsible_for;
- connected_to;
- reads_from;
- writes_to;
- triggered_by;
- produces;
- supports;
- blocks;
- requires_approval_from;
- evidenced_by.

Edges carry:
- scope;
- visibility;
- source/provenance;
- freshness;
- confidence/verification state where relevant.

### 4.3 Progressive disclosure

The graph must not show the entire company at once.

Default:
- show the active context;
- show only high-value adjacent relationships;
- expand on demand;
- allow focus mode;
- allow filter by domain/status/risk;
- allow timeline/replay;
- preserve a simple path back to the active business.

Complexity increases only when the user asks for it.

---

## 5. TORO Event Spine

A canonical event stream is required so the interface can show what TORO is doing without inventing animation.

### 5.1 Event contract

Minimum conceptual fields:

- `event_id`
- `occurred_at`
- `scope_id`
- `actor_type`
- `actor_id`
- `event_type`
- `entity_type`
- `entity_id`
- `workflow_run_id`
- `action_id`
- `source_system`
- `authority_system`
- `risk_level`
- `approval_state`
- `execution_state`
- `verification_state`
- `evidence_refs`
- `redaction_class`
- `correlation_id`
- `parent_event_id` where relevant

Sensitive payloads should not be duplicated into the event stream merely for visualization.

### 5.2 State model

Minimum execution states:
- queued;
- reading;
- analyzing;
- waiting;
- approval_required;
- approved;
- executing;
- verifying;
- completed;
- failed;
- rolled_back;
- cancelled.

The UI may animate only when backed by an actual state/event.

### 5.3 Replay

Authorized users should eventually be able to replay a workflow as:
- what started it;
- which systems were consulted;
- what actions were prepared/executed;
- where approval occurred;
- evidence produced;
- final verified outcome.

Replay is an audit/presentation projection, not hidden chain-of-thought.

---

## 6. Visual semantics

Visual language must be semantic, consistent and accessible.

Each visible object can communicate:
- entity type;
- scope;
- status;
- risk;
- freshness;
- permission boundary;
- verification state;
- ownership;
- current activity.

Example behavior:
- normal = stable;
- reading = subtle flow;
- active execution = pulse/activity;
- approval required = gated state;
- risk = explicit warning;
- stale data = freshness indicator;
- disconnected connector = degraded state;
- failed action = visible failure with next safe action;
- verified completion = completed state linked to evidence.

Do not rely on color alone.

Motion must respect reduced-motion preferences.

---

## 7. Operational views

The graph is one view, not the whole product.

Required complementary views:

### Brain
Relationship graph and active context.

### Today / Executive Home
Exceptions, decisions, blocked work and high-value progress.

### Focus
One entity/workflow with dependencies, evidence and next actions.

### Timeline
Events and changes over time.

### Workflows
Execution graph, approvals, retries and verification.

### Systems
Connectors, expected vs observed configuration, drift and health.

### Goals & Projects
Goal -> initiative -> project -> task -> evidence -> KPI.

### Evidence
Documents, logs, source references, approvals and outputs.

### Command
Ask TORO with resolved context.

### Configuration
Advanced/admin-only settings for scopes, tools, permissions and profiles.

---

## 8. Public “Watch TORO Work” experience

The public site should sell by showing governed behavior.

Example scenario:

“Reservations are up but cash feels tighter.”

Visual flow may show:
`Business -> Revenue -> PMS -> Accounting -> Cash -> Expenses -> Projects -> Decision`

The demo should reveal:
- systems consulted;
- facts found;
- discrepancies;
- actions proposed;
- approval gates;
- measurable outcome.

It must not reveal:
- private prompts;
- hidden reasoning;
- client secrets;
- fake production activity.

Public scenarios should be stored as versioned demo fixtures, not hard-coded animations.

---

## 9. Technology direction

### 9.1 Canonical application stack

Target:
- Next.js;
- React;
- TypeScript;
- Vercel;
- Supabase/Postgres;
- shared design-system package;
- GitHub as code/architecture authority.

### 9.2 Graph rendering

Preferred starting point:
- React Flow / XYFlow-style node/edge UI for operational graph navigation.

Reason:
- React-native component nodes;
- zoom/pan/focus;
- handles/edges;
- custom interaction;
- suitable for operational 2D/2.5D graph interfaces.

The exact package version must be selected during implementation and pinned/tested.

### 9.3 Motion

Use normal CSS/motion primitives first.

Rive or equivalent is optional for:
- onboarding;
- brand moments;
- presentation;
- high-value explanatory animation.

Motion is not a data layer.

### 9.4 3D

Three.js/WebGPU-capable rendering is optional for Presentation Mode.

Rules:
- never required for daily operations;
- never the only way to understand the product;
- progressive enhancement only;
- must degrade gracefully;
- performance budget required.

### 9.5 Design

Figma is the preferred design source for:
- information architecture;
- visual language;
- component states;
- flows;
- prototypes;
- design tokens;
- system diagrams.

Code remains canonical for production behavior.

### 9.6 AI-assisted building

Tools such as v0, Figma-to-code, Lovable or similar may accelerate prototypes/components.

They do not become architectural authority.

Generated code must enter:
`design/brief -> code review -> tests -> preview -> evidence -> merge`.

---

## 10. Repository architecture

Do not create a second TORO Brain repository merely for the visual product.

Target inside the canonical estate:

```text
Toro-OS/
├── src/
│   ├── app/
│   ├── components/
│   └── lib/
├── packages/                 # when monorepo conversion becomes justified
│   ├── ui/
│   ├── brain-graph/
│   ├── design-tokens/
│   ├── events/
│   ├── policy/
│   └── domain/
├── docs/
│   ├── product/
│   ├── architecture/
│   └── evidence/
└── supabase/
    ├── migrations/
    └── tests/
```

Monorepo conversion is allowed only when shared packages or multiple deployable apps materially justify it.

Do not restructure merely to match an aspirational folder diagram.

---

## 11. Data architecture

The visual layer consumes projections of canonical data.

### 11.1 Initial graph model

Physical graph storage must follow the existing `TORO_SCOPE_GRAPH_V1.md` contract.

Current rule:
- reuse strong typed domain tables first;
- do not create generic Scope Graph tables merely to render the Brain;
- prefer read models/views/projections over duplicated operational truth;
- defer a generic `brain.scopes` / relationship registry until the portability or second-scope pilot proves it necessary;
- if a cross-entity relationship registry becomes necessary, prefer a thin relationship/index layer over flattening all domain entities into one universal table.

The first Visual Brain prototype should therefore compose permission-filtered projections from existing canonical sources such as:
- organizations;
- properties;
- users/memberships;
- employees/people;
- projects/goals when canonical;
- systems/connectors;
- approvals/audit/evidence;
- domain facts.

Event/workflow contracts may be introduced when required, but exact physical tables for:
- normalized activity events;
- workflow/action runs;
- evidence references;
- graph node/edge projections

must be reconciled with existing domain schemas and execution contracts before any DDL.

Do not create duplicates if equivalent canonical tables, logs or projections already exist.

### 11.2 Graph database decision

Do **not** add Neo4j or another graph database now.

Revisit only if measured production needs show Postgres cannot satisfy:
- traversal depth/latency;
- relationship analytics;
- path queries;
- graph algorithms;
- operational scale.

A visualization library does not justify a second database.

### 11.3 Semantic memory

Use the canonical governed memory/knowledge model.

Vector search may use pgvector inside the canonical Supabase/Postgres estate when justified.

Vectors never become an authoritative fact store.

---

## 12. Realtime architecture

The UI should receive normalized events, not raw database noise.

Preferred pattern:
- transaction changes canonical state;
- server/domain layer emits normalized event;
- realtime channel broadcasts safe projection;
- UI updates graph/timeline/status.

Realtime must enforce:
- tenant/scope isolation;
- redaction;
- role visibility;
- bounded payloads;
- reconnect/replay behavior;
- idempotency/correlation.

Realtime is not evidence by itself; canonical persisted state/evidence remains authoritative.

---

## 13. Permissions and trust visualization

TORO should make authority understandable.

Every action can expose:
- what TORO may read;
- what TORO may prepare;
- what TORO may execute;
- what requires approval;
- what is forbidden;
- what evidence will be produced.

High-risk action pattern:
`prepare -> policy evaluation -> approval gate -> execute -> verify -> evidence -> notify`.

The visualization may show the gate and state transitions.

It must not bypass the existing TORO Governance model.

---

## 14. Privacy and isolation

The visual graph is permission-filtered.

Rules:
- hidden data must not be sent to the browser and merely hidden by CSS;
- cross-scope graph edges require explicit policy;
- personal/user-vault data remains private by default;
- external client scopes are isolated;
- public demo data is synthetic/approved;
- sensitive attributes should be minimized;
- event payloads must respect redaction class;
- screenshots/exports must apply the same policy model.

Graph exploration must never become an authorization bypass.

---

## 15. Performance requirements

The visual product must remain fast on normal hotel/business hardware and mobile devices.

Initial targets to validate:
- useful shell visible quickly on ordinary mobile networks;
- graph loads a focused neighborhood, not the entire enterprise;
- heavy visualizations lazy-load;
- large lists virtualize;
- 3D is optional;
- route-level code splitting;
- image/media optimization;
- realtime updates batched/coalesced;
- browser memory monitored for long sessions.

Define measured budgets before public launch.

---

## 16. Accessibility and device strategy

Required:
- keyboard navigation for primary workflows;
- readable contrast;
- non-color state indicators;
- reduced-motion support;
- screen-reader labels for actionable nodes;
- responsive mobile mode;
- touch targets sized for phones;
- graph alternatives in list/timeline form.

A graph-only product is not acceptable.

Mobile should prioritize:
- Today;
- decisions/approvals;
- messages/work;
- quick command;
- incidents;
- evidence capture;
- high-value alerts.

Desktop can expose deeper graph exploration and configuration.

---

## 17. Internationalization

Architecture should support:
- Spanish;
- English;
- future languages.

Avoid embedding operational copy in graph code.

Business data keeps original language/provenance where needed.

Dates, currency, number formats and timezone are scope/user-aware.

---

## 18. Observability

TORO Builder + TORO Systems must instrument the visual product.

Track:
- route performance;
- graph load/render cost;
- realtime failures;
- connector failures surfaced in UI;
- action latency;
- approval latency;
- workflow completion/failure;
- user task completion;
- frontend errors;
- deployment/version correlation.

Use product analytics for behavior and observability for reliability. Do not mix them into one truth.

---

## 19. Product analytics

Measure whether the visual brain reduces complexity.

Candidate metrics:
- time to understand current situation;
- time to decision;
- approval turnaround;
- repeated navigation/search;
- number of raw systems a user must open;
- owner interruptions;
- successful self-service;
- workflow completion;
- error/rework;
- user trust/verification usage;
- demo-to-qualified-lead conversion for public site.

Avoid vanity metrics such as animation engagement unless they connect to a real product outcome.

---

## 20. Design system requirements

Create one TORO design system shared by public and authenticated surfaces where practical.

Component families:
- scope switcher;
- entity node;
- system node;
- agent/activity node;
- status badge;
- risk state;
- freshness state;
- evidence link;
- approval gate;
- action card;
- KPI card;
- timeline event;
- workflow step;
- decision card;
- empty/loading/degraded/error states.

Every component needs:
- semantic states;
- accessibility behavior;
- responsive rules;
- loading/error states;
- design token mapping;
- test coverage appropriate to risk.

The approved blue-bull brand identity remains canonical.

---

## 21. Development workflow

Preferred:
1. requirement maps to General Plan;
2. inspect current contracts/code;
3. design/prototype;
4. implement behind safe boundary/feature flag where appropriate;
5. unit/component tests;
6. preview deployment;
7. visual/functional verification;
8. accessibility/performance checks;
9. evidence;
10. merge;
11. monitored release;
12. rollback path.

Public marketing changes may move faster than high-risk operational execution, but both use the same canonical design/brand contracts.

---

## 22. CURRENT estate findings — 2026-09-22

### GitHub

Verified:
- `Dramcatcherst/Toro-OS` declares itself the current canonical TORO Brain/TORO OS product repository.
- `Dramcatcherst/toro-os-v88-new` is legacy/reference.
- `Dramcatcherst/Toro-OS---Dreamcatcher-Hotel` is legacy hotel-specific reference.
- `Dramcatcherst/dream-team` is a standalone legacy implementation whose destination is TORO People.

Decision:
- visual-brain work belongs in `Dramcatcherst/Toro-OS`;
- do not create another master TORO repository.

### Vercel

Verified:
- Vercel project `toro-pr11-preview` deploys the canonical `Dramcatcherst/Toro-OS` repository.
- Vercel project `toro-os-v03` still deploys `Dramcatcherst/toro-os-v88-new`.

Interpretation:
- Vercel estate currently contains canonical-preview activity plus a legacy production/runtime lineage.
- This is architectural drift, not permission to delete or repoint production.

Required migration:
1. inventory domains/environment variables/functions/cron/OIDC/redirects;
2. compare canonical vs legacy runtime capabilities;
3. reproduce needed capability on a canonical preview;
4. verify security and workflows;
5. plan reversible cutover;
6. retain rollback evidence;
7. only then retire or reclassify legacy Vercel projects.

### Supabase

Verified visible projects:
- `supabase-bisque-kettle` — primarily DreamTeam/People/attendance/payroll/security structures;
- `toro-auth-pilot` — currently contains Kross/F&B operational import/report structures.

Interpretation:
- the visible Supabase estate is currently domain-specialized;
- a unified canonical Scope Graph/Event Spine is not yet evidenced by the inspected table lists.

Rule:
- do not create a third “brain database” automatically;
- first map existing schemas and migration boundaries;
- choose/reconcile the canonical TORO runtime data plane through an explicit migration contract.

---

## 22.1 Stage A contract authority

The canonical Stage A implementation contract is:

- `docs/product/TORO_VISUAL_BRAIN_STAGE_A_CONTRACTS_V1.md`
- TypeScript contract surface: `src/lib/brain-contracts.ts`

It defines:
- Brain Projection Contract;
- Event Spine normalization;
- server-side permission/redaction requirements;
- visual semantic states;
- minimal read-only Brain API boundary;
- synthetic fixture rules.

Stage B must consume these contracts rather than inventing a second vocabulary.

---

## 23. Implementation stages

### Stage A — Contracts first
**NEXT**

- approve this spec;
- register it in `toro-context.yaml`;
- define graph/event contracts;
- map existing tables/entities to the graph;
- define public-safe fixture schema;
- define design tokens/component states.

Exit:
a developer can build the same conceptual Brain without inventing new truth or permissions.

### Stage B — Static Brain prototype
**NEXT**

- build focused graph using synthetic Dreamcatcher-shaped data;
- entity focus panel;
- timeline;
- approval state;
- connector health state;
- responsive/mobile fallback.

Exit:
visual model is understandable before realtime complexity.

### Stage C — Canonical read-only integration
**NEXT / dependent on data mapping**

- read canonical entities;
- read system health;
- read projects/goals;
- read evidence;
- permission-filtered graph.

No external writes.

Exit:
Brain represents verified real state for an authorized internal user.

### Stage D — Event Spine + realtime
**TARGET**

- normalized persisted events;
- correlation/workflow IDs;
- safe realtime projection;
- activity/timeline updates.

Exit:
TORO activity is visible without fake animation.

### Stage E — Governed actions
**TARGET**

- prepare;
- approval;
- execute;
- verify;
- evidence;
- rollback/error representation.

Exit:
visual Brain becomes an operational control surface.

### Stage F — Public Watch TORO Work
**TARGET**

- synthetic scenarios;
- interactive product story;
- conversion tracking;
- mobile/performance/accessibility validation.

Exit:
the product can sell by demonstrating real architecture safely.

### Stage G — Presentation/3D
**FUTURE**

Only after the 2D/2.5D operational model is validated.

---

## 24. Acceptance criteria

The Visual Brain architecture is successful when:

1. no visual state requires a shadow database;
2. the same scope/permission rules govern API and UI;
3. a user can understand what matters without opening every subsystem;
4. graph nodes map to canonical entities or safe projections;
5. live activity maps to real events;
6. approvals are visible and enforceable;
7. evidence is reachable from important outcomes;
8. public demo data cannot leak private operational data;
9. mobile has a usable non-graph path;
10. visual richness does not materially degrade core operations;
11. one design system supports public and product surfaces;
12. Dreamcatcher-specific assumptions do not leak into the universal core;
13. canonical GitHub/Vercel/Supabase ownership is documented;
14. every production change has verification and rollback evidence.

---

## 25. Anti-patterns

Do not:
- build a decorative “brain animation” disconnected from state;
- expose hidden model reasoning;
- create a second master website/application architecture;
- create a graph database merely because the UI is a graph;
- animate every agent/tool call as noise;
- force 3D on operational users;
- send unauthorized graph data to the client;
- hard-code Dreamcatcher as the universal schema;
- create per-client code forks;
- let Figma/v0/AI-generated code override architecture;
- equate a deployed preview with a production-ready capability;
- repoint legacy production infrastructure without migration evidence.

---

## 26. North-star experience

A new user should eventually see their business form visually as TORO is configured:

`identity -> business -> people -> systems -> knowledge -> workflows -> goals -> live activity`

The experience should make the system feel increasingly intelligent while the interface becomes increasingly simple.

> **Deep inside. Simple outside. Visible when it matters.**
