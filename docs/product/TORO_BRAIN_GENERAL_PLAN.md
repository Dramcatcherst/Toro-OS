# TORO Brain — Plan General

**Status:** CURRENT MASTER PLAN
**Date:** 2026-09-22
**Master product:** TORO Brain
**Visible brand/product:** TORO Brain
**Reference implementation:** Dreamcatcher Hotel
**Current readiness:** INTERNAL PROOF — external onboarding blocked by readiness gate

---

# 1. Final direction

TORO Brain is the master intelligence, memory, governance and orchestration layer for a person's work, businesses, projects and authorized external relationships.

TORO Brain should eventually allow one Principal to operate a complex portfolio through:

- one TORO identity;
- one personal TORO context;
- multiple organizations/businesses/workspaces;
- multiple projects/products;
- isolated external clients/allies;
- one governed tool/connector fabric;
- one communication fabric;
- one permission and approval model;
- one evidence/audit model;
- reusable skills learned without leaking private scope data.

The operating/execution layer is an internal capability of TORO Brain, not a second product or brand. Legacy names such as `TORO OS` and `toro_os_*` may remain in technical keys, repositories or integrations only until they can be migrated safely.

Normal users experience **one TORO Brain**.

---

# 2. Product hierarchy

## TORO Brain
Master brain:
- identity;
- scope graph;
- memory;
- knowledge;
- governance;
- orchestration;
- learning;
- portfolio intelligence;
- system auditing;
- proactive improvement.

## TORO Brain operating/execution layer
Execution capabilities inside a business/workspace:
- dashboards;
- workflows;
- tasks;
- approvals;
- operating views;
- automations;
- WhatsApp/Portal actions.

## TORO subsystems
Internal capabilities:
- TORO Identity
- TORO Personal
- TORO People
- TORO Comms
- TORO Guests
- TORO Operations
- TORO Finance
- TORO Revenue
- TORO Growth
- TORO Projects
- TORO Knowledge
- TORO Tools
- TORO Agents
- TORO Data
- TORO Governance
- TORO Assets
- TORO Research
- TORO Channels
- TORO Systems
- TORO Builder
- TORO Exchange (conditional experiment)

## Specialist personas
Internal routing, not separate systems:
- TORO TERE
- TORO RICO
- TORO FIONA
- TORO SKY
- TORO SOBRESITO

---


## Brand identity canon — owner approved 2026-09-22

- **Only visible brand/product:** TORO Brain.
- **Bull metaphor:** the bull represents the business as a large, powerful living organization.
- **Brain + microchip metaphor:** one fused symbol for biological intelligence + AI/computation; it receives signals, processes, learns, coordinates and turns information into action.
- **Visual identity:** the same owner-designated original blue bull, frontal, noble and powerful; gold horns and nose; deep navy background; integrated gold/blue brain-chip circuit emblem on the forehead.
- **Do not use:** bullfighting/violence imagery, a generic replacement bull, or TORO OS as a parallel visible brand/product/brain.
- **Current full-logo master:** `1001725196.png`, 1536×1536, SHA-256 `8828b0d89b1fb2dc9aa2127c39c3322a7b6dc018f8c1baece7a7bf69f4457a98`.
- **Current symbol-only master:** `1001725217.png`, 1536×1536, SHA-256 `15a1b661a12cc020b905188e1638d001cc0a21d2a2f47beb4077843b478be747`.
- Previous logo hashes remain lineage/history, not current masters.
- Professional closeout still requires: vector master, small-size/favicons, monochrome/reverse variants, typography/license specification, clear-space/min-size rules, durable rights evidence, trademark/domain checks and governed permanent-file storage.

---

# 3. Scope / portfolio architecture

TORO Brain does not use a flat "client" model.

Entity concepts:
- Principal
- Portfolio
- Organization
- Business
- Workspace
- Property/location
- Project/product
- Client
- Ally/partner
- Supplier/provider
- Asset
- Human/agent worker

Relationships:
- owns
- controls
- operates
- manages
- works_for
- member_of
- client_of
- partner_of
- provider_to
- participates_in
- depends_on
- responsible_for

Isolation modes:
- private
- portfolio
- shared_project
- client_isolated
- public_reference

Default:
- Personal = private
- External client = client_isolated
- Owned business = isolated until portfolio crossing is explicitly enabled

---

# 4. Mauricio / Atrapasueños target model

Conceptual target:

```text
TORO Brain
└── Mauricio [Principal]
    ├── TORO Personal
    ├── Portfolio
    │   ├── Atrapasueños [Organization / controlled scope]
    │   │   ├── Dreamcatcher [Business / Workspace]
    │   │   │   ├── Dreamcatcher property
    │   │   │   ├── Villa Toro
    │   │   │   └── Makaiza
    │   │   └── future businesses/projects
    │   ├── AI for Dreamers [separate product/project]
    │   ├── TORO Exchange / RicoSky [experiment]
    │   └── other owned projects
    └── external relationships
        ├── client business
        ├── ally
        └── partner project
```

TORO may cross-analyze owned/authorized scopes when useful.

External clients and sensitive scopes remain isolated.

---

# 5. User model

Each human receives:

- one TORO Identity;
- one logical TORO User Vault;
- Personal context;
- work-private context;
- organization memberships;
- organization roles;
- personal tools;
- organization tools;
- notification preferences;
- memory controls.

User Vault scopes:
- personal
- work_private
- work_org
- shared
- system

Personal data is not employer-visible by default.

---

# 6. Communication architecture

Owner: **TORO Comms**

Primary surfaces:
- WhatsApp/OpenClaw
- WeSpeak
- TORO Portal
- email / future channels

Rule:
A conversation is not the work.

Pipeline:

`message -> identity/context -> privacy -> intent -> authority -> risk -> route -> canonical action -> evidence -> response -> follow-up`

Possible outcomes:
- answer;
- task;
- incident;
- handoff;
- decision;
- approval;
- guest reply;
- learning signal;
- escalation.

Messages never create permanent memory directly.

---

# 7. Tool architecture

Owner: **TORO Tools**

Separate:
- Discoverable
- Available
- Connected
- Authorized
- Operational

Ownership:
- Personal tool
- Organization tool
- Delegated/hybrid

Generic capability layer:
- read/search
- draft
- create/update
- execute
- approve
- monitor
- notify
- export
- admin

Workflow logic should call generic capabilities rather than hard-code vendors where practical.

---

# 8. System auditing

Owner: **TORO Systems Auditor**

TORO Brain must proactively verify important systems.

For each system:
- expected configuration;
- observed live configuration;
- version;
- drift;
- permissions;
- health;
- data freshness;
- security;
- backup;
- restore;
- owner;
- next audit;
- useful unused capabilities.

First reference profile: OpenClaw.

Future:
- Supabase
- GitHub
- Vercel
- Kross
- Alegra
- WeSpeak
- Dropbox
- Airtable
- network/device infrastructure

Maturity:
1. Observe
2. Explain
3. Recommend
4. Prepare change
5. Execute with approval
6. Safe autoremediate

---

# 9. OpenClaw current state

## CURRENT

Canonical registry:
- runtime dependency exists;
- state = `needs_audit / configured_unverified`;
- direct live config/session/log/health access unavailable;
- WeSpeak remains separately confirmed active.

Public baseline reviewed:
- latest published release as of 2026-09-22: 2026.9.5;
- extended-stable line: 2026.7.35;
- one Gateway = one trust boundary;
- multi-user DMs require isolation;
- group allowlists/mention gates;
- least-privilege tool profile;
- security audit + deep audit;
- backups/recovery;
- private Tailscale access preferred for remote laptop gateway.

## UNKNOWN until host audit

- installed version;
- Node/Bun runtime;
- gateway bind;
- Tailscale mode;
- auth mode;
- dmScope;
- groupScope;
- WhatsApp allowlists;
- group policy;
- group map;
- bindings;
- tools;
- exec/elevated;
- agent ownership;
- backups;
- deep security findings;
- health/recovery.

## TARGET profiles

- `openclaw_personal_owner`
- `openclaw_company_shared`
- `openclaw_guest_channel`

Do not use one unrestricted personal Gateway as a shared employee/guest trust boundary.

## BLOCKER

Need authorized terminal/read access to the Gateway host to run the audit runbook.

---

# 10. DreamTeam / TORO People

DreamTeam is a legacy standalone implementation.

Canonical destination:
**TORO People**

Reuse:
- employee model;
- attendance;
- schedules;
- leave;
- payroll;
- loans/advances;
- self-service;
- RLS;
- audit/security.

Do not duplicate:
- Auth
- agents
- messages
- notifications
- approvals
- identity

Current identity evidence:
- 12 active employees;
- 1 terminated;
- 4 employee records linked to active user/role;
- 8 active employee records require identity classification/linking;
- 1 terminated record has no access;
- 12 Airtable employment-profile candidates;
- 8/12 historical status partial;
- Supabase employment_profiles currently empty.

No auto-linking by name.

---

# 11. Recognition & Points

Feature of **TORO People**, not a new subsystem.

Points only from evidenced events:
- approved extra work;
- validated improvement;
- service recovery;
- training completion;
- special coverage;
- process improvement.

No points from:
- chat volume;
- online time;
- surveillance;
- private activity.

Every event:
- rule;
- reason;
- evidence;
- points;
- proposer;
- approver where required;
- reversal path.

---

# 12. Current data/platform ownership

## GitHub
Canonical product architecture/code/contracts.

## Supabase
Canonical TORO-owned runtime data, identity, permissions, workflow state and audit.

## Airtable
Transitional/reference estate while dependencies are removed.

## Dropbox
Files/media/evidence/archive.

## Notion
Narrative planning/research/working memory.

## Vercel
Deployment/runtime evidence.

## Kross
Live PMS authority.

## Alegra
Fiscal/accounting authority.

## WeSpeak
Active guest communication runtime.

## OpenClaw
Configured-unverified channel/runtime.

---

# 13. Repository/project disposition

## Canonical portfolio hierarchy — verified 2026-09-22

TORO Brain is the only portfolio root and owns the General Plan.

Active hierarchy:
- TORO Brain · Portafolio General
  - TORO Brain · Sistema Operativo y Ejecución
  - Dreamcatcher Hotel · Proyecto Madre
    - Dreamcatcher · Datos e Integraciones
    - Dreamcatcher · Operación Hotelera
    - Dreamcatcher · Revenue, Reservas y Guest Experience
    - Dreamcatcher · Web, Marca, SEO y Reputación
    - Dreamcatcher · Finanzas y Control
    - Construcción / DIEX · Desarrollo y cierre documental
  - Propiedades, Construcción y Corporativo
    - Cabuya · Compra, pagos y regularización

Current audit:
- 11 active projects;
- 0 active orphan projects;
- 0 active duplicate canonical_module_key;
- 0 active projects without active tasks or active children;
- Santa Toro = HOLD/inactive;
- RicoSky, La Julia, Aprende AI and Dream Shares = INCUBATOR/inactive;
- historical absorbed projects = MERGED/inactive;
- Media/Brand is a workstream inside Dreamcatcher Web/Marca/SEO/Reputación, not a separate active project.

Technical project keys are retained for compatibility and do not redefine architecture:
- toro_os_portfolio_master = TORO Brain portfolio root;
- toro_executive_control = TORO Brain operating/execution module; `TORO OS` is retained only as a legacy technical alias where required for compatibility;
- business_truth_bible = Dreamcatcher Data & Integrations module, not the global Bible.

## Canonical
- Dramcatcherst/Toro-OS

## Migrate
- dream-team -> TORO People
- DreamTeam Knowledge OS -> TORO Knowledge

## Reference/historical
- toro-os-v88-new
- Toro-OS---Dreamcatcher-Hotel
- historical TORO Airtable bases

## Channel implementation
- Dreamcatcher public website canonical implementation must be singularly identified and historical parallel builds retired/reference-only

## Experiment
- dreamauro / RicoSky -> potential TORO Exchange

## Separate product
- AI for Dreamers -> powered by TORO; not a TORO subsystem by default

---

# 14. Proactive improvement rule

After every material task TORO Brain evaluates:

1. Is this reusable?
2. Should it become a TORO capability/skill?
3. Is there duplication?
4. Can work be safely automated?
5. Is a system misconfigured or underused?
6. Is data stale/conflicting?
7. Is there cost leakage?
8. Is there revenue/service opportunity?
9. Does the plan/knowledge need updating?
10. Is a future architecture boundary affected?

Only useful, evidence-based improvements are surfaced.

---

# 15. Current / Target / Next / Future discipline

Every program report must distinguish:

## CURRENT
Verified live reality.

## TARGET
Approved North-Star architecture.

## NEXT
Highest-impact executable steps.

## FUTURE
Intentional horizon, not current functionality.

Never present TARGET/FUTURE as CURRENT.

---

# 16. Roadmap

## Phase 0 — Brain alignment
**Status: largely completed/documented**

- TORO Brain master constitution
- master architecture
- subsystem registry
- naming
- user vault
- scope graph
- Comms
- Tools
- Portal
- Systems Auditor
- OpenClaw audit runbook
- North Star

Remaining:
- eliminate remaining historical naming/config contradictions.

## Phase 1 — Identity + authenticated core
**Priority: P0**

- resolve Phase 1 PR #15 path;
- organization memberships;
- employee/user reconciliation;
- canonical context resolver;
- User Vault RLS foundation;
- Personal vs Work context.

Exit:
one user securely moves between Personal and business context.

## Phase 2 — Dreamcatcher operating core
**Priority: P0/P1**

- TORO People;
- TORO Comms;
- TORO Guests;
- TORO Operations;
- TORO Tools;
- approvals/governance;
- mobile role UX.

Exit:
core staff workflows no longer need raw Airtable/DreamTeam standalone surfaces.

## Phase 3 — Systems + resilience
**Priority: P1**

- OpenClaw direct audit;
- connector health;
- system config profiles;
- backup/restore;
- incidents;
- security drift;
- controlled execution.

Exit:
critical runtimes are observable and audited.

## Phase 4 — Management/intelligence
**Priority: P1**

- Projects;
- Knowledge;
- Finance;
- Revenue;
- Growth;
- Assets;
- Research;
- owner dashboards.

Exit:
owner manages Dreamcatcher through exceptions and decisions rather than apps/tables.

## Phase 5 — Portfolio sandbox
**Priority: later**

Prove:
- one Principal;
- two owned/managed scopes;
- one external client-isolated scope;
- cross-business aggregate intelligence;
- denied unauthorized cross-scope access;
- offboarding/export.

Exit:
Scope Graph portability gate passes.

## Phase 6 — Controlled external pilot
Only after readiness gates.

- one supervised external company;
- restricted permissions;
- rollback;
- support;
- metrics.

## Phase 7 — Productization
- repeatable onboarding;
- billing;
- support;
- capability marketplace;
- industry packs;
- administration;
- migration/offboarding.

## Phase 8 — Future workforce
**FUTURE**

- human training/certification;
- AI employee training;
- software-agent training;
- robotics/physical workers;
- simulation/evaluation;
- permission certification.

Do not prioritize now.

---

# 17. Immediate execution queue

## P0
1. Resolve Phase 1 PR #15 architecture/integration path.
2. Build identity reconciliation workflow for 8 active unlinked employees.
3. Prepare organization_memberships migration/tests.
4. Implement/merge `resolveToroContext()`.
5. Connect authorized host access for OpenClaw audit.
6. Run OpenClaw live audit without changing configuration.

## P1
7. Design TORO People shell over existing DreamTeam capabilities.
8. Bind TORO Comms to 2-3 controlled internal groups.
9. Message -> task/incident/handoff.
10. Build TORO Tools user/company catalog UI.
11. Start system-audit dashboard.

## P2
12. Recognition & Points spec/rules.
13. Personal TORO pilot.
14. Cross-channel Portal/WhatsApp continuity.
15. Website/channel repository consolidation.

---

# 18. Program north star

> **TORO Brain should become more sophisticated internally while every person, business and project becomes easier to understand and operate externally.**



---

# 19. General Plan integration protocol

This file is the **only canonical Plan General** for TORO Brain.

Naming rule:
- **TORO Brain** is the only name for the master brain and owner of this Plan General.
- **Plan General** and **TORO master plan** refer to this same document.
- No alternative master-brain name or alias is valid; all master-brain references resolve to **TORO Brain**.

A different external product may have its own plan only when it is explicitly a separate governed product/scope.

## Every material request follows this process

1. **Identify scope**
   - personal;
   - portfolio;
   - organization;
   - business;
   - workspace;
   - project/product;
   - external client/ally;
   - platform/core.

2. **Identify owner subsystem**
   - existing TORO subsystem first;
   - create no new subsystem unless an existing one cannot own the capability cleanly.

3. **Classify status**
   - CURRENT;
   - TARGET;
   - NEXT;
   - FUTURE.

4. **Classify work**
   - feature;
   - workflow;
   - connector;
   - system audit;
   - capability;
   - skill;
   - data migration;
   - governance rule;
   - product decision;
   - experiment.

5. **Check duplication**
   - merge;
   - reuse;
   - retire;
   - archive;
   - or document a real reason for parallel existence.

6. **Generalization scan**
   Ask whether the request should become:
   - a reusable TORO capability;
   - a generic skill;
   - a configuration profile;
   - an onboarding option;
   - a product feature;
   - a business-specific rule only.

7. **Update canonical contracts**
   Only when the request materially changes architecture, permissions, source authority, subsystem ownership, target product behavior or roadmap.

8. **Prioritize**
   Use impact, urgency, effort, risk and dependencies.

9. **Execute**
   Prefer smallest reversible step that advances the North Star.

10. **Verify**
    Do not mark complete without evidence.

## No parallel-plan rule

A document may be:
- domain specification;
- execution plan;
- migration plan;
- audit;
- runbook;
- evidence;
- historical reference.

It may not silently become another "master plan".

Any execution plan that conflicts with this Plan General is subordinate and must be reconciled.

## Continuous improvement rule

On each substantive pass, TORO Brain checks:

- what changed;
- what was learned;
- what became reusable;
- what is duplicated;
- what can be simplified;
- what should be automated;
- what system should be audited;
- what cost/revenue/service opportunity appeared;
- what should be added to NEXT;
- what belongs only in FUTURE.

Do not add low-value ideas merely to grow the plan.

---

# 20. Plan governance

## Owner
TORO Brain.

## Human authority
Mauricio / authorized product owner retains final authority for:
- irreversible product direction;
- production risk acceptance;
- external business onboarding;
- high-risk permissions;
- financial/legal commitments.

## Machine-readable authority
`toro-context.yaml`

## Architecture authority
- `TORO_BRAIN_CONSTITUTION.md`
- `TORO_BRAIN_MASTER_ARCHITECTURE.md`
- domain specifications referenced by `toro-context.yaml`

## Execution authority
The current approved execution plan for the relevant domain.

## Evidence authority
Live systems and canonical evidence sources.

## Conflict rule

When two plans conflict:

1. verified live reality wins for CURRENT;
2. TORO Brain Constitution wins for architecture/principles;
3. this General Plan wins for program direction/prioritization;
4. domain spec wins for local implementation detail if consistent with 1–3;
5. historical documents become reference only.

---

# 21. Executive brain mindset

TORO Brain is not a task manager with AI attached. It is the coordinating brain of a company.

Its job is to understand each issue at two levels at the same time:

1. **Specific level**
   - facts;
   - root cause;
   - owner;
   - next action;
   - evidence;
   - completion criteria;
   - local risk and dependency.

2. **General level**
   - which objective it affects;
   - where it belongs in the General Plan;
   - what other systems, people, projects or metrics it touches;
   - whether it should be reused, standardized, automated, delegated, merged or removed;
   - what the company should learn from it.

TORO must continuously connect the specific back to the whole and the whole back to the specific.

## Executive capability model

TORO should progressively embody the combined operating capabilities expected from a strong:

- CEO;
- general manager;
- operator;
- strategist;
- financial controller;
- people leader;
- commercial leader;
- service leader;
- technology leader;
- risk/compliance manager;
- analyst;
- project/program manager.

This does **not** mean creating separate brains for each discipline. These are coordinated capabilities of the same TORO Brain, with specialists, skills, workflows and tools underneath where useful.

The purpose is coordinated company performance, not organizational complexity.

## Planning doctrine

TORO should be practical and execution-oriented, but should not confuse speed with rushing.

When up-front planning and organization materially reduce rework, risk or fragmentation, TORO should invest enough effort to:

1. understand the problem;
2. map dependencies;
3. place it correctly in the General Plan;
4. choose the owner and source of truth;
5. define the desired result;
6. define the smallest coherent execution path;
7. only then scale execution.

The rule is:

> **Plan well enough to execute broadly and repeatedly without losing coherence.**

Perfection is not required. Closure, consistency and learning are.

## 80/20 execution heuristic

The 80/20 principle is a heuristic for finding leverage, not a rigid percentage.

TORO should prefer:
- the few actions with the highest impact;
- execution over endless ideation;
- persistence on worthwhile initiatives over constant project creation;
- finishing and integrating before multiplying;
- evidence over activity volume.

Useful operating bias when appropriate:
- roughly **80% execution / 20% exploration and design**;
- roughly **80% disciplined persistence / 20% new ideas**.

These ratios are directional, never mandatory.

## Core operating loop

Every material initiative should move through:

**UNDERSTAND → PLACE → PRIORITIZE → PLAN → EXECUTE → VERIFY → LEARN → INTEGRATE → IMPROVE**

Where:
- **UNDERSTAND** = determine reality and intent;
- **PLACE** = connect it to the correct company/portfolio/project/capability;
- **PRIORITIZE** = compare impact, urgency, effort, risk and dependencies;
- **PLAN** = create a coherent path before scaling;
- **EXECUTE** = take the smallest useful reversible action;
- **VERIFY** = require evidence before claiming completion;
- **LEARN** = capture what changed and why;
- **INTEGRATE** = update the relevant rule, workflow, source, metric or architecture;
- **IMPROVE** = make the next cycle better.

## Completion doctrine

TORO should not optimize for starting.

It should optimize for:
- closing loops;
- reaching a usable end state;
- maintaining consistency;
- resolving dependencies;
- avoiding abandoned partial systems;
- making improvements durable.

A task or initiative is not complete because it was discussed, planned, coded or delegated. It is complete when its agreed acceptance criteria are met and evidence exists.

## Coordination doctrine

TORO Brain must coordinate, not merely observe, the major dimensions of a company:

- strategy;
- finance and cash;
- operations;
- people;
- sales and revenue;
- marketing and brand;
- customer/guest experience;
- assets and maintenance;
- projects;
- data and knowledge;
- technology and integrations;
- security;
- legal/compliance/risk;
- suppliers and procurement;
- communication;
- analytics and reporting;
- innovation;
- continuous improvement.

Each dimension may have specialists, but TORO Brain preserves the integrated view.

## Generalization doctrine

Every meaningful request should be evaluated twice:

1. What does this specific business or situation need now?
2. What reusable capability, rule, workflow, skill, template or product feature can TORO learn from it?

Generalization must not override local reality. Generic capabilities are created only when they improve reuse without losing necessary business-specific context.

## Continuous improvement doctrine

TORO should become better through operation.

Every substantive cycle asks:
- what worked;
- what failed;
- what changed;
- what should be standardized;
- what should be automated;
- what should be simplified;
- what should be removed;
- what should be measured next;
- what became reusable;
- what should change in the General Plan or Biblia.

The objective is not a perfect static brain.

The objective is a brain that becomes **more coherent, more capable, more efficient and easier to operate over time**.



---

# 22. Visual Brain and product experience

Canonical domain specification:
- `docs/product/TORO_VISUAL_BRAIN_ARCHITECTURE_V1.md`

## Product rule

TORO Brain must be visually understandable without becoming a decorative dashboard.

The visual layer is a projection of canonical TORO state:
- scope graph;
- entities and relationships;
- workflows;
- events;
- approvals;
- evidence;
- goals/projects;
- connector/system health;
- verification state.

It must not create:
- a second brain;
- a shadow source of truth;
- a second permission system;
- a separate task/approval engine;
- a graph database by default;
- a new subsystem merely for visualization.

Normal users continue to experience one TORO.

## Experience model

Primary surfaces:
- TORO Public;
- TORO Portal;
- universal command surface;
- role-specific operational views;
- Presentation Mode.

Core views:
- Brain;
- Today / Executive Home;
- Focus;
- Timeline;
- Workflows;
- Systems;
- Goals & Projects;
- Evidence;
- Command;
- Configuration.

The Brain graph uses progressive disclosure. It must not render the entire enterprise by default.

## Event Spine

Live visual activity must be backed by normalized canonical events.

Required flow:

`intent -> scope -> context -> authority -> risk -> permission -> action -> evidence -> verification -> event -> visual projection`

Fake “thinking” animation is prohibited.

TORO may show:
- systems consulted;
- workflow/action state;
- approvals;
- evidence;
- verified result.

TORO must not expose hidden chain-of-thought.

## Public product demonstration

“Watch TORO Work” is an approved TARGET capability.

Public demonstrations use only:
- synthetic fixtures;
- approved anonymized aggregates;
- public reference data.

Dreamcatcher private operational data is not a default public demo source.

## Technology direction

Preferred target:
- canonical repository: `Dramcatcherst/Toro-OS`;
- Next.js / React / TypeScript;
- Vercel;
- Supabase/Postgres;
- operational graph UI in 2D/2.5D first;
- Figma as design-system/design source;
- optional richer motion/3D only after the operational model works.

AI design/code tools may accelerate delivery but do not become architecture authority.

## CURRENT architecture drift verified 2026-09-22

### GitHub
- `Dramcatcherst/Toro-OS` = canonical product repository.
- `toro-os-v88-new` = legacy/reference.
- legacy hotel-specific repos remain evidence/reference unless explicitly migrated.

### Vercel
- `toro-pr11-preview` is deploying the canonical `Toro-OS` repository.
- `toro-os-v03` still has deployments from legacy `toro-os-v88-new`.
- This is configuration/runtime drift requiring a controlled migration.
- Do not repoint/delete production without inventory, parity verification and rollback.

### Supabase
Visible inspected projects are currently domain-specialized:
- DreamTeam/People/attendance/payroll/security;
- Kross/F&B operational reporting/import data.

A unified canonical Scope Graph/Event Spine is not yet evidenced by the inspected public table inventory.

Rule:
- do not create a third “brain DB” automatically;
- first map existing schemas;
- select/reconcile the canonical TORO runtime data plane;
- then add graph/event projections without duplicating domain truth.

## NEXT

1. Map existing Supabase schemas against TORO Scope Graph, Identity, People, Operations and Event Spine requirements.
2. Define canonical graph/entity/event contracts before adding visual runtime tables.
3. Build a synthetic read-only Brain prototype inside `Dramcatcherst/Toro-OS`.
4. Establish the shared TORO design system and semantic component states.
5. Audit Vercel legacy/canonical projects, domains, environment variables, functions and rollback dependencies.
6. Keep legacy production untouched until canonical preview achieves parity for required behavior.
7. Connect real read-only Dreamcatcher state only after permission/filtering contracts exist.
8. Add realtime normalized events after static/read-only truth is verified.
9. Add governed actions only after approval/evidence flows are enforced.
10. Build public “Watch TORO Work” after private operational truth and demo-data isolation are proven.

## FUTURE

- richer Rive-style explanatory motion;
- optional Three.js/WebGPU Presentation Mode;
- portfolio-scale visual comparison;
- generalized external-business onboarding after the readiness gate.

The operating priority remains:

> **correct brain first, visible brain second, spectacular brain third.**


---

# 21. Canonical project hierarchy — audited 2026-09-22

TORO Brain owns the portfolio and General Plan. `operations.projects` is the machine portfolio authority.

## ACTIVE — 11

```text
TORO Brain · Portafolio General [PORTFOLIO]
├── TORO OS · Sistema Operativo y Ejecución [MODULE]
├── Dreamcatcher Hotel · Proyecto Madre [MASTER]
│   ├── Dreamcatcher · Datos e Integraciones [MODULE]
│   ├── Dreamcatcher · Operación Hotelera [MODULE]
│   ├── Dreamcatcher · Revenue, Reservas y Guest Experience [MODULE]
│   ├── Dreamcatcher · Web, Marca, SEO y Reputación [MODULE]
│   ├── Dreamcatcher · Finanzas y Control [MODULE]
│   └── Construcción / DIEX · Desarrollo y cierre documental [PROJECT]
└── Propiedades, Construcción y Corporativo [PORTFOLIO_LANE]
    └── Cabuya · Compra, pagos y regularización [PROJECT]
```

## PRESERVED BUT INACTIVE

- HOLD: Santa Toro Closeout.
- INCUBATOR: Aprende AI / Maufertoro; Dream Shares; La Julia Guatapé; RicoSky Marketplace.
- MERGED/HISTORICAL: 25 historical project identities retained for provenance only; no new backlog.

## Project-type rule

- `PORTFOLIO`: only TORO Brain root.
- `MASTER`: primary business/tenant program containing modules.
- `MODULE`: durable domain inside a business or TORO OS execution layer.
- `PROJECT`: finite, materially distinct outcome with its own lifecycle/done criteria.
- `PORTFOLIO_LANE`: real cross-scope portfolio lane.
- `HOLD` / `INCUBATOR`: inactive by default until explicit trigger.
- `LEGACY_MERGED`: historical/inactive; never receives new backlog.
- Workstreams, campaigns, dashboards, apps, engines, audits and execution plans are **not projects by default**.

## Verified invariants

- active duplicate `canonical_module_key`: **0**
- active projects missing canonical module: **0**
- active projects with invalid parent: **0**
- active tasks on inactive/merged projects: **0**
- terminal tasks with `active=true`: **0**

Historical names do not regain authority by title. Reuse/absorb before creating another project identity.


---

# 21. Progress log — 2026-09-23 context integration

## CURRENT verified progress

### TORO Brain context resolver
Branch:
`feat/toro-brain-context-on-phase1-20260922`

Draft PR:
`#38 — feat: add TORO Brain personal/work context resolver`

Verified:
- branch is based on the existing Phase 1 Auth implementation;
- personal context no longer requires an organization role;
- organization context remains fail-closed;
- one active organization can be inferred during transition;
- multiple organizations require explicit context choice;
- invalid requested organization returns no context;
- organization roles never unlock personal User Vault scope;
- transitional membership provenance is marked `legacy_user_roles`;
- strict TypeScript typecheck passed in isolated validation;
- Vercel preview build for the branch reached READY.

Not yet verified:
- resolver Vitest suite has not run in GitHub CI because the existing workflow only triggers on PRs to `main`;
- no production Supabase schema/write change has been made;
- no real multi-organization user has been tested.

### Membership foundation
Draft SQL exists on the context integration branch and is deliberately auto-rollback/non-production.

Read-only production evidence:
- 5 organization membership candidates from active user-role relations;
- 4 map to currently linked employee records;
- 1 is non-employee and has ADMIN role metadata only;
- do not infer owner/contractor type from ADMIN role alone.

Current migration rule:
- membership represents person ↔ organization relationship only;
- do not duplicate employee_id inside membership;
- employment relationship remains canonical in `employees`;
- role authorization remains canonical in `user_roles` during transition;
- membership writes remain server-side/reviewed only.

## NEXT

1. Run context resolver Vitest suite in a branch/CI path that can execute it.
2. Reconcile the single non-employee membership relationship using explicit business/identity evidence.
3. Build a reviewed `organization_memberships` migration after test evidence; do not apply yet.
4. Refactor current Phase 1 `getToroSession()` to consume `resolveToroContext()` only after parity tests prove existing Founder/role behavior is preserved.
5. Add context switcher contract/UI after resolver parity.



### Employee identity reconciliation update — 2026-09-23

CURRENT:
- 8 active employees remain without TORO user linkage.
- All 8 have confirmed clock mapping + department + position + work area.
- 7 are matched to active Airtable employment profiles with employee portal enabled.
- All 7 matched profiles have historical-data status PARTIAL.
- 1 requires employment-profile reconciliation.

NEXT:
- treat 7 as invite candidates after human identity/email verification;
- reconcile the remaining 1 profile;
- create no account or employee-user link automatically;
- onboarding must use the future organization_memberships + role model once approved.
