# TORO Brain — Master Architecture

**Status:** CURRENT MASTER PRODUCT MODEL
**Date:** 2026-09-22
**Master product name:** TORO Brain
**Repository:** `Dramcatcherst/Toro-OS`
**Current proving ground:** Dreamcatcher Hotel

## 1. Product hierarchy

### TORO Brain

TORO Brain is the master intelligence, memory, governance and orchestration layer.

It understands:
- people;
- organizations;
- businesses;
- properties/locations;
- projects/products;
- clients/allies/partners;
- tools;
- knowledge;
- workflows;
- decisions;
- tasks;
- assets;
- finances;
- permissions;
- agents;
- channels;
- evidence.

It coordinates the whole portfolio while respecting isolation boundaries.

### TORO OS

TORO OS is the operating/execution layer used inside a specific business/workspace.

It exposes the work of TORO Brain through:
- TORO Portal;
- WhatsApp/OpenClaw;
- role-specific workspaces;
- workflows;
- approvals;
- dashboards;
- automations.

TORO OS is not a second brain. It is an execution surface/runtime of TORO Brain.

### TORO subsystems

Subsystems such as TORO People, TORO Comms, TORO Finance and TORO Tools are internal capabilities of TORO Brain/TORO OS, not standalone products.

## 2. Final target

The final product must support one human or owner controlling a complex portfolio without forcing everything into one flat company.

Example:

```text
TORO Brain
└── Principal: Mauricio
    ├── Personal
    │   └── TORO User Vault
    │
    ├── Portfolio / controlled scopes
    │   ├── Atrapasueños
    │   │   ├── Dreamcatcher Hotel
    │   │   │   ├── Dreamcatcher property
    │   │   │   ├── Villa Toro
    │   │   │   └── Makaiza
    │   │   ├── other business/operation
    │   │   └── projects
    │   │
    │   ├── AI for Dreamers
    │   ├── TORO Exchange experiment
    │   └── future owned projects
    │
    └── External relationships
        ├── client business A
        ├── allied business B
        └── partner/project C
```

A scope may be:
- owned;
- managed;
- operated;
- advised;
- partnered;
- external client;
- shared project;
- personal.

The database must not assume every scope is a "client".

## 3. TORO Scope Graph

TORO Brain needs a graph of entities and relationships rather than a flat client list.

### Entity types

- person;
- portfolio;
- organization/legal entity;
- business/operation;
- property/location;
- project;
- product;
- brand;
- client;
- partner/ally;
- supplier/provider;
- asset;
- agent/worker.

### Relationship types

Examples:
- owns;
- controls;
- manages;
- operates;
- works_for;
- member_of;
- part_of;
- provides_service_to;
- client_of;
- partner_of;
- shares_project_with;
- located_at;
- responsible_for.

The relationship determines permissions and cross-scope visibility.

## 4. Cross-scope intelligence

TORO Brain may reason across scopes only when policy allows it.

### Safe examples

An owner may ask:
- "Which of my businesses has the highest operating cost?"
- "Which supplier appears in two businesses?"
- "Which projects compete for the same cash/time?"
- "Which automation built for Dreamcatcher could help another owned business?"

### Restricted examples

TORO must not:
- leak Client A data to Client B;
- expose employee personal data across employers;
- reuse one company's private strategy in another company without permission;
- move personal memory into a business context automatically;
- train a third-party client model from another client's private data.

## 5. Isolation modes

Every scope declares an isolation mode.

### `private`
No cross-scope use without explicit permission.

### `portfolio`
May participate in owner-level aggregate/cross-business analysis.

### `shared_project`
Only explicitly shared project data can cross.

### `client_isolated`
Strong external-client isolation. No cross-client payload sharing.

### `public_reference`
Public/approved information may be reused broadly.

Default for new external clients: **client_isolated**.

Default for personal data: **private**.

Owned businesses may use **portfolio** only after owner policy enables it.

## 6. Cross-scope learning

TORO should learn reusable methods without leaking private facts.

Example:
- Dreamcatcher teaches TORO a generic hotel handoff workflow.
- TORO abstracts the pattern:
  `incoming issue -> classify -> assign -> SLA -> evidence -> close`
- Future business may reuse that generic pattern.
- Guest names, prices, internal messages and Dreamcatcher-specific secrets do not transfer.

This requires two layers:

1. **Scope knowledge** — private facts/rules for the specific business.
2. **Reusable TORO skill** — abstracted workflow/capability stripped of protected business data.

Promotion from scope knowledge to reusable skill must be governed and testable.

## 7. TORO Brain proactive loop

TORO Brain continuously evaluates each authorized scope.

`Observe -> understand -> detect -> propose -> prioritize -> execute when allowed -> verify -> learn -> improve`

It should proactively detect:
- repeated work;
- missing data;
- expired integrations;
- stale policies;
- duplicated systems;
- unanswered handoffs;
- cost leakage;
- revenue opportunity;
- unresolved risk;
- broken workflows;
- manual processes suitable for automation;
- tool capabilities not being used;
- project conflicts/dependencies;
- configuration drift.

Proactivity does not override permissions.

## 8. System/configuration auditor

Every important connected system must have a governed configuration profile.

TORO Brain must be able to answer:
- Is it connected?
- Is it configured correctly?
- Is it secure?
- Are sessions/users isolated correctly?
- Are permissions too broad?
- Is it using current recommended capabilities?
- Is it healthy?
- Is data fresh?
- Are backups/recovery configured?
- Are there unused features that would materially help?
- Is another system duplicating it?
- What should change next?

Required state for each system:
- expected configuration;
- observed configuration;
- drift;
- risk;
- recommendation;
- owner;
- last audit;
- next audit;
- evidence.

This applies to:
- OpenClaw;
- Supabase;
- Vercel;
- GitHub;
- Kross;
- Alegra;
- Dropbox;
- Airtable;
- WeSpeak;
- networks/devices;
- future tools.

## 9. Configuration profiles

TORO Systems + TORO Tools should define reusable configuration profiles.

Examples:
- `openclaw_personal_gateway`;
- `openclaw_company_gateway`;
- `supabase_multitenant_runtime`;
- `github_production_repository`;
- `vercel_production_project`;
- `company_whatsapp_channel`.

A profile contains:
- required settings;
- recommended settings;
- forbidden settings;
- required tests;
- audit command/check;
- recovery procedure;
- upgrade/review cadence.

TORO compares observed state against the profile and produces a drift report.

## 10. Future-aware capability lifecycle

Every capability has:

- current implementation state;
- known limitations;
- expected future direction;
- abstraction boundary;
- migration path;
- deprecation triggers.

TORO should avoid architectures that make future changes unnecessarily expensive.

But "future-aware" does not mean building speculative complexity now.

Rule:
> Design the boundary now; build the implementation only when the next real workflow needs it.

## 11. Generalization pipeline

When Mauricio requests a useful new capability:

1. solve the immediate real problem;
2. identify whether it is specific or reusable;
3. if reusable, extract the generic rule/workflow;
4. assign it to an existing TORO subsystem;
5. add configuration/permission contract;
6. add evidence/tests;
7. register it in TORO capability catalog;
8. suggest relevant improvements on later passes.

This prevents useful ideas from remaining trapped in one conversation/business.

## 12. Version target

TORO Brain should always maintain three views:

### Current reality
What is actually live and verified.

### Target architecture
What the approved final system is meant to become.

### Next implementation
The smallest high-impact work that moves current reality toward target architecture.

Never confuse these three.

## 13. Portfolio terminology

Preferred terminology:

- **Principal** — primary human/account owner.
- **Portfolio** — scopes the principal can govern together.
- **Organization** — legal/administrative entity or tenant.
- **Business** — operational business.
- **Workspace** — TORO operating context.
- **Project/Product** — initiative/product that may exist inside or across businesses.
- **Client** — an external customer relationship.
- **Ally/Partner** — a collaborative relationship that is not necessarily a client.

The architecture uses relationships, not one rigid hierarchy.

## 14. Example — Mauricio / Atrapasueños

Mauricio is a Principal.

Atrapasueños may be:
- an organization/legal/business scope;
- owner/operator of multiple businesses/properties/projects.

Dreamcatcher is an operating business/workspace.

Villa Toro/Makaiza are property/product scopes within the Dreamcatcher operating context.

Other Mauricio projects may:
- sit in the same portfolio;
- share selected TORO capabilities;
- remain data-isolated when appropriate.

External companies testing TORO become isolated organizations/workspaces, even if Mauricio can see their pilot health as TORO product owner.

## 15. Future workforce horizon

**Not a current implementation priority.**

Long-term TORO Brain may train and coordinate:
- human employees;
- AI agents;
- software agents;
- robotic/physical workers.

Canonical future capability owner:
- TORO People — workforce identity, role, training and performance boundaries;
- TORO Knowledge — SOPs/skills/learning material;
- TORO Agents — AI agent configuration and capabilities;
- TORO Governance — permissions, safety and certification.

Future workflow:

`Role definition -> knowledge/SOP -> training -> simulation -> evaluation -> permission certification -> supervised work -> evidence -> continuous improvement`

A robot/AI worker must never receive permissions merely because it completed training. Authorization remains explicit.

## 16. Near-term priorities

Do now:
1. prove TORO Brain deeply with Dreamcatcher;
2. finish identity/context;
3. integrate DreamTeam into TORO People;
4. audit OpenClaw;
5. build TORO Comms/Tools;
6. clean repository/system fragmentation;
7. prove safe portfolio scope model in sandbox.

Do later:
- multi-business portfolio analysis;
- external pilot tenants;
- reusable industry skills;
- AI employee training;
- robotics/physical workforce.

## 17. Non-negotiable rule

There is one master brain:

**TORO Brain.**

OpenClaw, agents, portals, WhatsApp, Supabase and connected systems are runtimes, tools or surfaces. None of them becomes a competing brain.

