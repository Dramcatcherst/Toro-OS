# TORO Brain — Plan General

**Status:** CURRENT MASTER PLAN
**Date:** 2026-09-22
**Master product:** TORO Brain
**Operating layer:** TORO OS
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

TORO OS is the business operating/execution layer powered by TORO Brain.

Normal users experience **one TORO**.

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

## TORO OS
Execution layer inside a business/workspace:
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
- **Total Brain is deprecated and must not be used as an alias, project, subsystem, plan, app, database, agent, or control plane.**

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

