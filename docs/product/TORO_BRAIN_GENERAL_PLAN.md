# TORO Brain — Plan General

**Status:** CURRENT MASTER PLAN
**Date:** 2026-09-23
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
**Priority: P0 · IN PROGRESS**

CURRENT verified 23/09/2026:
- coherent Supabase SSR/Auth + `resolveToroContext()` foundation is integrated in `main`;
- Personal vs Organization policy is implemented and fixture-tested;
- Visual Brain Stage C canonical read/projection is permission-scoped, read-only and fail-closed;
- lower canonical-read tests verify invalid context rejection before Supabase access and explicit active-`org_id` scoping;
- canonical membership home is `identity.organization_memberships`;
- membership schema/backfill/RLS/rollback draft passed disposable PostgreSQL 16 validation plus production read-only preflight;
- production `identity` schema/membership table remain intentionally **unapplied**;
- resolver still uses active/non-revoked `user_roles` as transitional relationship evidence;
- employees remain HOLD for onboarding/contact.

Remaining:
- protected hosted Founder/restricted/revocation/logout/session/mobile-desktop QA;
- explicit reviewed decision before any membership production DDL;
- after membership cutover, persistent membership/context parity;
- User Vault RLS foundation, still empty until privacy gates pass;
- employee/user reconciliation may continue read-only, but no employee onboarding before launch decision.

Exit:
one user securely moves between Personal and business context with hosted evidence, persistent governed membership and no cross-scope leakage.

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

# 16A. Product Proof and commercialization focus — effective 2026-09-23

Canonical strategy:
- `docs/product/TORO_PRODUCT_PROOF_AND_COMMERCIALIZATION_V1.md`

TORO remains in **INTERNAL PROOF**. External onboarding is still blocked by the New Business Readiness Gate.

The immediate product strategy is now **proof, compression and repeatability** rather than horizontal feature expansion.

## Current product thesis

TORO Brain is the governed intelligence and control layer that learns how a business works, connects existing systems, resolves authority/context, detects problems and opportunities, coordinates execution, verifies outcomes and progressively reduces owner cognitive load.

TORO does **not** depend on generic LLM access, agent count, connector count, WhatsApp, MCP or dashboards as its primary differentiation. Those are interchangeable infrastructure layers.

TORO-owned value must concentrate in:
- business context and operating model;
- source authority;
- identity/scope/permissions;
- workflow definitions;
- evidence and verified outcomes;
- reusable domain skills without private-data leakage;
- continuous improvement;
- measurable reduction in owner/manual coordination.

## Initial commercial wedge

Do not commercialize initially as "TORO for every business."

First wedge:
**owner-operated independent hotels and small hotel groups**, with Dreamcatcher as proving ground.

Remain PMS-agnostic and integrate existing specialist systems before attempting to replace them.

## Product Proof milestone

The existing requirement for 12 representative end-to-end workflows becomes a central product milestone.

Each must prove:

`trigger -> scope -> authority -> context -> decision -> permission -> action -> evidence -> verification -> outcome -> metric -> learning`

Priority outcome metrics:
- owner administrative hours;
- workflows completed without owner intervention;
- handoff/error reduction;
- SLA/resolution time;
- measurable revenue/recovery where attributable;
- human override/error/rollback rates;
- onboarding hours;
- percent of setup reusable without customer-specific engineering.

## Productization rule

During Product Proof, new features receive current priority only when they materially help:
1. close a proof workflow;
2. improve security/privacy/source authority;
3. improve portability/second-tenant readiness;
4. reduce onboarding/custom engineering;
5. prove measurable ROI;
6. improve the single governed WhatsApp/Portal/Visual Brain experience.

Otherwise record them as FUTURE.

Do not prioritize robotics, broad multi-industry expansion, marketplace, proprietary PMS/accounting replacement, new databases, additional agent proliferation or parallel workflow/dashboard engines during this phase unless a proven blocker requires them.

## Commercial test

The critical scalability test is not feature count.

It is whether TORO can:
- operate Dreamcatcher with measurable reductions in owner intervention;
- reproduce the same core in a clean second isolated business;
- do so without founder-dependent reconstruction.

If every customer requires extensive custom engineering, TORO is functioning as a high-end implementation/consulting system rather than a scalable product. Product Proof must measure and reduce that dependency.



## Customer simplicity, omnichannel lifecycle and modular adoption — 2026-09-23

Canonical contracts:
- docs/product/TORO_COMMS_V1.md
- docs/product/TORO_PROGRESSIVE_ONBOARDING_V1.md
- docs/product/TORO_USER_PORTAL_V1.md

Product decisions:
- first-contact communication must feel simple and outcome-led;
- normal customers/users do not see TORO's internal machinery unless useful;
- users are explicitly invited to ask for needs/functions they do not see, without TORO fabricating capability;
- TORO Comms is the omnichannel fabric;
- TERE is the hospitality customer/guest-facing intelligence across inquiry, quote, follow-up, stay/service, payment communication, post-stay and reputation touchpoints;
- WeSpeak is a runtime/channel surface, not a parallel brain or source of truth;
- WhatsApp, Instagram, Facebook/Messenger, email, website and approved review surfaces should converge into one governed customer lifecycle;
- finance/revenue/operations retain factual/action authority even when TERE is the speaking interface;
- onboarding is progressive, skippable where optional, restartable and non-blocking;
- restarting onboarding does not delete canonical identity/business state;
- businesses may activate selected TORO capabilities first and expand later while remaining one TORO.

Commercial principle:
> **Start with the outcome the customer needs now; let TORO grow with the business without forcing the customer to adopt everything at once.**


# 17. Immediate execution queue

## P0
1. Complete hosted synthetic Identity/Context QA through an approved protected access path; do not weaken Vercel Deployment Protection.
2. Review the validated `identity.organization_memberships` draft for an explicit production-DDL decision; do not apply automatically.
3. Continue read-only identity reconciliation for the 8 active unlinked employees and the single non-employee membership candidate; no name-based linking, invites or employee contact.
4. Connect authorized host access for the OpenClaw live audit.
5. Run the OpenClaw audit read-only before any configuration change.
6. Prove one real Dreamcatcher Cognitive Proof outcome from the existing maintenance field packet; do not generate substitute paperwork.

## P1
7. After live Kross authority exists, prove one service date end-to-end for Breakfast/F&B before expanding to a week.
8. Continue Visual Brain Stage C with the existing permission-scoped canonical projection; no second data path or graph database.
9. Prepare the empty User Vault RLS foundation only after membership/context gates are closed; no personal data ingestion.
10. Design TORO People shell over existing DreamTeam capabilities without employee rollout.
11. Continue system-audit / connector-health convergence.

## P2
12. Recognition & Points spec/rules.
13. Personal TORO pilot after hosted identity/privacy gates.
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
Verified/rebaselined 2026-09-23:
- `toro-pr11-preview` / `prj_nxerFw9ciNews6tUMAah3GAlAJzs` = **CANONICAL ACTIVE RUNTIME**;
- it deploys `Dramcatcherst/Toro-OS` from `main` and continues receiving current production-target deployments;
- `toro-os-v03` / `prj_nzsVpQZree5WuErakMPKIyiK6gsA` = **LEGACY / ROLLBACK / REFERENCE — DO NOT DELETE YET**;
- legacy deploys `Dramcatcherst/toro-os-v88-new` from `master`;
- legacy project last updated 2026-09-08; latest inspected legacy production deployment is from 2026-08-23;
- inspected production aliases on both projects are Vercel-hosted aliases only; no custom non-Vercel domain was observed in those deployment alias responses;
- the inspected legacy production deployment returned no runtime logs in the last 24h, but this is not sufficient proof of zero usage;
- legacy history contains Google Admin Bridge/OIDC/auth-pilot work, so env/OIDC/integration inventory is mandatory before archival or deletion.

Canonical consolidation tracker:
- issue #33 — GitHub + Vercel delivery-governance master lane.

Rules:
- no legacy project deletion;
- no routing/domain/env/OIDC mutation until parity and rollback are proven;
- unknown Vercel configuration remains **UNKNOWN**, not assumed absent;
- required unique legacy capability must be ported through canonical `Toro-OS` PRs rather than preserving a second active product brain.

### Supabase
Read-only schema audit now verifies `abtyrbqlqbsastmridzp` as the current canonical TORO structured runtime data plane for the Dreamcatcher reference implementation.

Verified domain families include:
- public identity/people/governance foundations;
- `operations.projects`, `operations.tasks`, `operations.executive_decisions`, `operations.obligations`;
- `integrations.source_authority_rules`, `integrations.domain_governance`, `integrations.external_dependency_registry`, `integrations.data_conflicts`, import/migration evidence;
- Finance metrics/evidence;
- Revenue structures;
- Assets/inventory;
- guest/reservation/knowledge/web-growth structures.

Specialist external systems retain domain authority where this Plan General says so.

`fpihshyoobzctnlerfjp` remains a specialized Kross/F&B pilot/provenance implementation. Useful patterns may be generalized, but it is not a second TORO Brain database.

Rules:
- do not create a third “brain DB”;
- reuse strong typed domain tables;
- use permission-filtered read models/projections for Visual Brain;
- do not add generic graph DDL merely to render a graph;
- add only the thinnest cross-entity relationship/event layer when measured use requires it.

### Visual Brain implementation status — verified 2026-09-23

**Stage A — COMPLETED**
- canonical projection/event/permission/semantic contracts merged;
- TypeScript Brain contract surface merged;
- Supabase/domain mapping completed;
- issue #32 closed.

**Stage B — COMPLETED**
- synthetic read-only `/brain` prototype merged to canonical `main`;
- 10-node / 10-edge / 5-event focused scenario;
- approval gate, evidence, source authority, freshness, verification and mobile/list fallback present;
- lint/build/CI passed;
- Vercel production-target deployment READY;
- protected deployment visually inspected in a real browser with no detected overlap, clipping, missing sections or desktop overflow;
- issue #40 closed.

**Stage C — CODE PREPARED / BLOCKED_BY_AUTHENTICATED_QA**
Completed on canonical `main`:
- canonical server-side `resolveToroContext()` and personal/work isolation policy;
- Supabase SSR server/client foundation;
- permanent context/auth regression tests in CI;
- internal `/login` surface and safe redirect guard;
- non-PII `/api/brain/context` diagnostic;
- permission-scoped canonical read adapter for Projects + Source Governance + Kross Health;
- canonical-read -> shared `BrainProjection` mapper;
- focused first real projection capped below Stage B visual budgets;
- server projection provider can enter canonical read-only mode only behind `TORO_BRAIN_CANONICAL_READ_ENABLED=true`;
- all unresolved/denied/source-failure paths fail closed to the existing synthetic projection;
- Finance/guest/employee/payment/private free-text fields remain excluded.

Verified controls:
- unauthenticated context diagnostic returns fail-closed `401`;
- Supabase RLS was audited for first-slice sources;
- `integrations.kross_snapshot_health` is a `security_invoker=true`, `security_barrier=true` view over an RLS-protected registry;
- Finance metrics/evidence remain deny-by-default and are not part of Stage C v1;
- canonical UUIDs are replaced by opaque projection refs before leaving the adapter;
- no service-role bypass is used.

Current hard gate:
- hosted QA needs an existing authorized TORO credential/session;
- the QA browser currently has no saved authorized credential/session;
- non-PII Supabase counts confirm authorized identity data exists, so the blocker is credential/session availability for hosted QA, not absence of users/memberships;
- no user/password/reset/magic-link or permission mutation was created to bypass this gate.

Tracker:
- issue #50 — Visual Brain Stage C canonical read-only integration.

### Current runtime security baseline — verified 2026-09-23
- canonical `main` uses Next.js **16.3.6** and matching `eslint-config-next`;
- security patch PR #47 merged after CI + Vercel preview;
- `npm audit` reached **0 known vulnerabilities** using non-forced lockfile remediation;
- production-target Vercel deployment is READY.

## NEXT

1. Complete hosted authenticated QA with an **existing authorized TORO user**; do not create/reset credentials merely to bypass the gate.
2. Verify `/api/brain/context` resolves the intended organization and that anonymous/wrong-org/revoked paths fail closed.
3. Only after that evidence, enable the canonical Visual Brain read path in a controlled environment and verify Projects + Source Governance + Kross Health before any broader data scope.
4. Keep Finance/guest/employee/payment/private free-text domains excluded until their own permission/projection contracts are explicitly approved.
5. Continue issue #69 Vercel consolidation: inventory env-variable scopes, OIDC/trust, callbacks, functions/crons and integration bindings before any legacy archival.
6. Establish the shared TORO design system/Figma semantic tokens without changing product authority.
7. Normalize Event Spine adapters after static/read-only real-state projection is verified.
8. Add governed actions only after approval/evidence/verification flows are canonical.
9. Build public “Watch TORO Work” from synthetic/public-safe fixtures after private product behavior is stable.
10. Keep richer 3D/presentation work deferred until operational usability is proven.

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
`feat/toro-brain-context-on-phase1-v2-20260923`

Draft PR:
`#42 — feat: integrate TORO Brain context resolver on current Phase 1`

Superseded:
`#38` closed after Phase 1 advanced 77 commits beyond its branch point; #42 was re-extracted cleanly from the current Phase 1 HEAD.

Verified:
- branch is based on the current Phase 1 Auth implementation and is maintained at 0 commits behind at the latest alignment check;
- personal context no longer requires an organization role;
- organization context remains fail-closed;
- one active organization can be inferred during transition;
- multiple organizations require explicit context choice;
- invalid requested organization returns no context;
- organization roles never unlock personal User Vault scope;
- personal context remains available when the organization-role store is unavailable; enterprise access fails closed;
- a transitional legacy-session adapter scopes Phase 1 roles to the active organization and blocks cross-organization legacy-role elevation;
- transitional membership provenance is marked `legacy_user_roles`;
- strict TypeScript typecheck passed in isolated validation;
- Vercel preview build for the branch reached READY.

Verification update:
- clean integration is now PR #42; superseded PR #38 is closed;
- latest verified context branch head built successfully in Vercel after fixing a TypeScript issue;
- strict isolated TypeScript validation passed;
- isolated behavior harness passed 8/8 critical context/legacy-role cases;
- resolver Vitest suite has still not run through the repository's official GitHub Actions path because current CI triggers only on PRs to `main`;
- existing `getToroSession()` remains intentionally unchanged until parity tests run;
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


### organization_memberships validation gate — 2026-09-23

CURRENT:
- reversible/auto-rollback SQL draft exists on PR #42;
- production Supabase has no `organization_memberships` table yet;
- read-only backfill preview finds 5 membership candidates: 4 employee-linked + 1 non-employee ADMIN relationship requiring classification;
- no local PostgreSQL runtime is available in the current execution environment for faithful RLS/DDL validation.

BLOCKED:
- applying/testing DDL on a Supabase development branch requires branch creation/cost confirmation and must not be done implicitly.

RULE:
- do not apply membership DDL to production until isolated Postgres/Supabase QA validates constraints, grants, RLS positive/negative cases, backfill idempotency and rollback;
- do not infer the non-employee ADMIN membership type as owner from role alone.


---

# 22. Cognitive Operating Model — how TORO thinks

Canonical subordinate specification:

`docs/product/TORO_BRAIN_COGNITIVE_OPERATING_MODEL_V1.md`

This specification defines the repeatable business-transformation method TORO uses from a new/poorly understood business through governed optimization and bounded autonomous operation.

Canonical lifecycle:

```text
Scope
-> Understand
-> Map
-> Baseline
-> Diagnose
-> Choose
-> Design
-> Execute / Experiment
-> Verify
-> Standardize
-> Automate
-> Autonomize
-> Learn
-> Repeat
```

Canonical optimization order:

```text
Eliminate -> Simplify -> Standardize -> Connect/Digitize -> Automate -> Agentize -> Autonomize
```

Key rules:

- understand the business and end-to-end value stream before local optimization;
- truth/source authority/freshness precede material action;
- prioritize constraints and measurable outcomes, not output volume;
- not every finding becomes a task;
- automation is not the first treatment for a broken or unstable process;
- autonomy is earned and governed **per workflow**, never granted globally to a business;
- TORO Pro means closed-loop bounded outcome ownership under goals, budgets, permissions, evidence, monitoring, rollback and exception rules;
- high-risk classes may remain approval-gated at every maturity level;
- autonomy is automatically reduced when source health, evidence, policy, configuration or outcome quality degrades;
- generalize reusable methods without leaking scope-owned facts.

This cognitive model is implemented through existing TORO subsystems and current task/project/governance/data contracts. It does **not** create another brain, project hierarchy, agent universe or database.

## Dreamcatcher proof requirement

Canonical proving-ground contract:

`docs/product/DREAMCATCHER_COGNITIVE_PROOF_V1.md`

Current proof order is evidence-driven:
1. Guest-ready physical operation / maintenance.
2. Breakfast / F&B.
3. People / onboarding.
4. Demand / booking / stay / post-stay.
5. Finance-to-cash.

The first live cognitive proof uses the existing `maintenance_daily_p0_p1_round` and `MNT-DAILY-P0-P1-20260923`; no new project/task is created. Repeated equivalent execution packets must be suppressed when the prior current packet remains unexecuted and no material delta exists.

Before TORO can claim generalized “new business -> optimized -> autonomous” capability, Dreamcatcher must provide real evidence of:

1. cross-functional Business Anatomy coverage;
2. end-to-end value-stream mapping;
3. governed baselines;
4. constraint/opportunity prioritization;
5. elimination/simplification before automation;
6. outcome verification;
7. workflow-level autonomy promotion/demotion;
8. durable learning from real corrections;
9. owner operation by exception rather than a growing raw backlog.

## Relationship to readiness

The New Business Readiness Gate remains authoritative for external onboarding.

The Cognitive Operating Model defines **how TORO thinks and improves** once a scope is authorized; the readiness gate defines **when TORO is allowed to onboard/operate another real business**.


### TORO People Wave 1 code foundation — 2026-09-23

CURRENT:
- DreamTeam code estate inventoried: 171 relevant source paths across UI, APIs, HR domain logic and security.
- Canonical migration contract: `docs/product/TORO_PEOPLE_CODE_MIGRATION_V1.md`.
- Machine-readable migration map: `data/toro_people_migration_map.json`.
- DreamTeam module ownership split is explicit: People vs Comms vs Governance vs Identity vs Systems/Tools.
- Self-service RLS verified for employee, attendance, shifts, leave requests/balances and payment receipts.
- `employee_self_profile` / `update_employee_self_profile` bind org + auth.uid().
- `submit_leave_request` blocks ordinary users from submitting for another employee.

CODE:
- Draft PR #48: `feat: add TORO People read-only self-service foundation`.
- Base: PR #42 context branch, not main.
- 6 files only, 0 commits behind its context base at creation.
- Read-only scope: own profile, upcoming shifts, own leave requests/balances, recent attendance.
- Explicit org_id + employee_id filters are added on top of RLS.
- Mappers intentionally exclude salary, bank and arbitrary private-HR payloads.
- Vercel preview build = SUCCESS.
- No new table, no write endpoint, no navigation, no DreamTeam retirement.

GATES:
- PR #48 remains DRAFT until PR #42 context is validated/landed.
- Official Vitest execution evidence is still required before merge.
- Write workflows (profile update, leave submission) remain deferred until read-only parity is proven.


### TORO Comms Wave 1 code foundation — 2026-09-23

CURRENT:
- Draft PR #51: `feat: add TORO Comms read-only inbox foundation`.
- Base: PR #42 context branch.
- Reuses existing `team_messages` + `team_message_read_states`; no duplicate chat database.
- Read-only organization inbox with unread calculation.
- Safe attachment projection excludes storage paths/raw JSON.
- Unknown/future channels remain `other` rather than being silently treated as general.
- Personal inbox projection is intentionally narrower than privileged RLS:
  - own-sent DMs;
  - DMs addressed to current linked employee;
  - unrelated privileged cross-user DMs are excluded.
- Cross-user privileged DM review belongs in a separate explicit/audited governance/HR surface.
- Vercel preview build = SUCCESS.

GATES:
- PR #51 remains DRAFT until PR #42 lands and official tests execute.
- No message send/write/read-state mutation yet.
- No communication channel/binding tables yet.
- OpenClaw bindings remain blocked by live runtime audit.


### TORO People Self-Service Wave 1 — 2026-09-23

CURRENT:
- implementation branch: `feat/toro-people-self-service-wave1-20260923`;
- draft PR: `#84 — add TORO People employee self-service read model`;
- PR is mergeable and remains DRAFT;
- HEAD Vercel preview = SUCCESS;
- no UI route, no write action and no production schema change.

Wave 1 read model includes:
- own employment identity summary;
- own private contact/emergency profile through `employee_self_profile`;
- upcoming shifts;
- own leave requests;
- own leave balances;
- recent attendance.

Security verified:
- consumes canonical `ToroResolvedContext`;
- Personal context denied;
- active organization + employee link required;
- authenticated Supabase session only; no service-role read;
- RLS self-read policies exist for employees, shifts, leave requests/balances and attendance;
- private HR table is not queried directly;
- `employee_self_profile` is auth.uid()-scoped with fixed search_path;
- server checks context user_id + org_id + employee_id before returning the snapshot;
- private-profile/context employee mismatch blocks the result;
- allowlisted projections exclude salary, bank data and arbitrary HR/shift JSON.

GATE:
- actual Vitest execution is still pending; Vercel build success is not counted as a test pass.
- do not merge/cut over UI until the approved test runner executes the context, mapper and server boundary tests.

NEXT:
1. execute PR #84 tests through an approved runner;
2. if PASS, merge into Phase 1;
3. then build TORO People employee self-service UI on the shared TORO Portal shell;
4. add leave-request creation only after read model/UI parity;
5. pilot with one non-owner employee before broader DreamTeam retirement.


### Portal role model — canonical permission vs experience

TORO Brain now distinguishes two concepts:

1. **Canonical organization role**
   - ADMIN
   - RRHH
   - GERENCIA
   - JEFE_DEPARTAMENTO
   - CONTABILIDAD
   - AUDITOR
   - EMPLEADO

These are organization-scoped permission facts and must come from the active TORO context/membership.

2. **Functional experience role**
   - FOUNDER
   - RECEPCION
   - OPERACIONES
   - FINANZAS
   - GROWTH
   - SYSTEMS

These may select navigation/routing/UX but do not independently grant organization data access.

Rules:
- navigation is never authorization;
- app_metadata.role_codes is not accepted as organization authorization because it is not organization-scoped;
- app_metadata.toro_role may select a functional experience only while an active organization context exists;
- FOUNDER still requires privileged ADMIN/GERENCIA membership in the active organization;
- data/actions remain governed by TORO context + RLS/RPC/policy.


### Execution update — People + Portal — 2026-09-23

#### HECHO — developer validation fabric
- canonical TORO Brain CI now validates every pull request, including stacked PRs;
- workflow runs `npm test -> lint -> build`;
- `workflow_dispatch` available;
- stale runs cancel through concurrency;
- CI improvement merged to `main` via PR #85;
- Phase 1 inherited the same workflow.

This resolves a repeated systemic validation gap rather than adding branch-specific CI hacks.

#### HECHO — TORO People self-service server Wave 1
PR #84 merged into Phase 1.

Verified:
- authenticated/read-only employee self-service model;
- canonical TORO context required;
- own employment projection;
- own profile through governed `employee_self_profile` RPC;
- own shifts;
- own leave requests/balances;
- own attendance;
- auth+org+employee defensive identity check;
- salary/bank/arbitrary HR JSON excluded from public self model;
- Vitest PASS;
- lint PASS;
- build PASS;
- Vercel PASS.

No production schema/write action was introduced.

#### HECHO — Portal session/context convergence
PR #86 merged into Phase 1.

Verified:
- Portal session consumes `resolveToroContext({mode:'organization'})`;
- no global unscoped `user_roles` authorization inside session resolver;
- unscoped `app_metadata.role_codes` no longer grants organization access;
- canonical organization roles can enter Portal:
  ADMIN, RRHH, GERENCIA, JEFE_DEPARTAMENTO, AUDITOR, EMPLEADO;
- CONTABILIDAD maps to FINANZAS experience;
- FOUNDER still requires active ADMIN/GERENCIA in the selected organization;
- functional experience roles remain UX/routing, not data authorization;
- regression tests + lint + build + Vercel passed before merge.

#### NEXT — first People Portal surface
Draft PR #87:
`feat: add read-only TORO People Mi perfil surface`

Scope:
- `/toro/mi-perfil`;
- employment summary;
- upcoming shifts;
- leave balance/request summary;
- recent attendance;
- safe unavailable/error states;
- no editing/writes/payroll/bank data.

Status:
- Vercel preview PASS;
- canonical CI validation in progress at this update.

After PR #87 passes:
1. merge read-only `Mi perfil`;
2. perform representative employee hosted/mobile QA when a safe employee identity is available;
3. add leave-request creation as a separately gated write workflow;
4. do not retire DreamTeam UI until self-service parity + pilot evidence exists.


### Dependency security finding — 2026-09-23

CURRENT:
- canonical CI `npm ci` reports 5 dependency vulnerabilities: 2 moderate, 3 high;
- this is a package-audit signal, not proof that all findings are exploitable in TORO runtime.

RULE:
- do not run `npm audit fix --force` automatically;
- TORO Systems/Builder must identify affected packages, production reachability, patched versions, compatibility risk and rollback before upgrading;
- dependency security becomes part of the recurring system/dependency audit profile.

NEXT:
- produce a dependency vulnerability triage after current People/Portal PR gates finish;
- patch only through tested PRs with tests/lint/build and preview evidence.


### People Portal execution update — 2026-09-23

#### HECHO — Mi perfil
PR #87 merged into the Phase 1 integration line.

Verified:
- route `/toro/mi-perfil`;
- read-only own employment summary;
- upcoming shifts;
- leave balance/request summary;
- recent own attendance;
- own contact email through the governed self-profile projection;
- safe unavailable/identity-mismatch/error states;
- navigation only to existing route;
- no salary/bank/other-employee projection;
- Vitest PASS;
- lint PASS;
- build PASS;
- Vercel PASS.

Merge commit:
`22637e1165aaed8eabdf70e8602ef4d5a0b828e7`

#### HECHO — Solicitudes
PR #88 merged into the Phase 1 integration line.

Verified:
- route `/toro/solicitudes`;
- employee may create own leave/vacation request;
- browser never supplies employeeId;
- TORO context supplies org + employee;
- existing `submit_leave_request` RPC rechecks current employee/authorization;
- request creation uses `pending_manager`, does not autoapprove;
- overlap/date/type/reason rules reused;
- DB audit trigger reused;
- notification creation reused;
- no balance deduction/override;
- no payroll mutation;
- no schema migration;
- Mi perfil pending counter corrected for `pending_manager` / `pending_hr`;
- Vitest PASS;
- lint PASS;
- build PASS;
- Vercel PASS.

Merge commit:
`9de9ef79157ac4de23e090ee5c54f29d81f19399`

#### CURRENT People Portal capability
A linked employee can now, within the Phase 1 integration line:
1. enter the shared TORO Portal through the canonical scoped session;
2. view their own governed People snapshot;
3. review shifts / leave summary / recent attendance;
4. submit their own leave request into the existing governed HR workflow.

This is the first DreamTeam daily workflow slice absorbed into TORO without a second login or duplicate database.

#### Important remaining gate
This is code/preview verified, not representative-user adoption proof.

Before declaring DreamTeam self-service replaced:
- use a deliberately approved employee pilot identity;
- verify hosted login/session on mobile;
- verify real RLS behavior;
- submit one explicitly authorized test/real request, not a hidden synthetic production mutation;
- confirm manager/RRHH sees the resulting workflow correctly;
- verify rollback and support path.

#### NEXT TORO People sequence
1. representative employee hosted/mobile pilot;
2. employee directory/onboarding after organization_memberships production decision;
3. attendance/incidents/time-import convergence;
4. scheduling convergence;
5. TORO Comms convergence for team chat/DMs;
6. shared Governance split for approvals/audit;
7. payroll only after People identity/self-service stability;
8. loans/settlements last.
