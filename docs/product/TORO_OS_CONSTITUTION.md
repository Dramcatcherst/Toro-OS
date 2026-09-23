# TORO OS — Product Constitution

**Status:** SUPERSEDED AS MASTER CONSTITUTION — retained as historical execution-layer architecture
**Superseded by:** `docs/product/TORO_BRAIN_CONSTITUTION.md`
**TORO OS role now:** operating/execution layer of TORO Brain

**Historical status:** formerly CURRENT  
**Approved:** 2026-09-22  
**Scope:** Product architecture and operating principles

## 1. Product definition

TORO OS is a continuously improving AI Business Operating System.

It learns how a company actually works, builds a governed model of that company, connects the systems and evidence that already exist, coordinates specialized intelligence, executes permitted work, verifies outcomes, learns from corrections, and reduces complexity for humans.

Dreamcatcher Hotel is the first real reference implementation and proving ground. It is not the boundary of the product.

## 2. Core doctrine

> **Deep inside. Simple outside.**

TORO earns simplicity at the interface by absorbing complexity internally.

The product must never reverse this order by building a polished portal first and then trying to make the underlying business model fit the interface.

A working TORO must first know:

- what the business is;
- what is true;
- where that truth lives;
- who is allowed to see or change it;
- which systems are authoritative;
- which actions are safe;
- which actions require approval;
- how success is verified;
- how failures recover;
- what the system learned.

Only after those foundations work should TORO compress them into WhatsApp, a portal or another human interface.

## 3. Build order — engine first

### Layer 0 — Identity, Constitution and Context

Defines:
- TORO product identity;
- product principles;
- business scope;
- current version and current plan;
- terminology;
- source authority;
- brand rules;
- agent operating rules;
- what is explicitly out of scope.

This layer prevents each new ChatGPT, Codex or human session from reinventing TORO.

### Layer 1 — Business Truth Model

TORO creates a governed representation of the real business:

- organizations;
- people and roles;
- customers;
- suppliers;
- assets;
- locations;
- products/services;
- processes;
- projects;
- tasks;
- financial concepts;
- rules;
- risks;
- decisions;
- knowledge;
- evidence;
- provenance and freshness.

The model must distinguish:
- canonical truth;
- external transactional authority;
- derived information;
- historical information;
- unverified information;
- conflicting information.

### Layer 2 — Connector Fabric

TORO connects to the systems the business already uses.

Every connector must declare:
- authority;
- read/write scope;
- authentication method;
- freshness;
- health;
- fallback;
- privacy classification;
- cost;
- owner;
- failure behavior;
- evidence of successful connection.

A connector is not complete because credentials exist. It is complete when its data and actions are governed, observable and testable.

### Layer 3 — Intelligence and Orchestration Engine

TORO interprets goals and determines:

- what context is required;
- what specialist reasoning is required;
- which source is authoritative;
- what can be inferred;
- what must be verified;
- what should become a task;
- what can be executed;
- what needs approval;
- how the result will be checked.

Specialists may work behind TORO, but the normal user should not need to coordinate them.

### Layer 4 — Workflow and Execution Engine

TORO moves from knowing to doing.

Every executable workflow follows:

`Intent -> context -> authority -> risk -> permission -> action -> evidence -> verification -> log -> next action`

Actions must support:
- idempotency where practical;
- clear ownership;
- explicit state;
- retries;
- escalation;
- rollback or recovery;
- audit evidence;
- completion criteria.

### Layer 5 — Governance, Security and Resilience

TORO must be trustworthy before it becomes autonomous.

This layer includes:
- identity;
- least privilege;
- RLS;
- action ceilings;
- approvals;
- secret management;
- privacy boundaries;
- audit trails;
- data quality;
- backup;
- restore drills;
- incident handling;
- degradation behavior;
- rollback.

High-risk actions never become autonomous merely because the technology can perform them.

### Layer 6 — Continuous Learning and Improvement

All layers remain alive.

TORO continuously processes:
- user corrections;
- failed actions;
- business changes;
- new evidence;
- repeated manual work;
- duplicated systems;
- cost changes;
- revenue opportunities;
- changes in policy;
- new tool capabilities.

Learning does not mean silently changing production behavior.

The improvement loop is:

`Observe -> detect -> propose -> validate -> approve when required -> update -> test -> measure -> retain or revert`

### Layer 7 — Human Experience

Only after the engine works does TORO compress the system into simple interfaces.

Primary eventual surfaces:
- TORO on WhatsApp;
- TORO Portal.

These are views into the same engine, not independent products.

The portal and WhatsApp should hide internal topology. Users should experience:
- one TORO;
- relevant context;
- next best actions;
- clear approvals;
- useful results;
- minimal configuration.

Advanced complexity is progressively disclosed only when a role needs it.

### Layer 8 — Commercial Presentation

The sales/marketing layer is separate from product architecture.

It may use:
- premium visual design;
- product storytelling;
- demonstrations;
- persuasion principles;
- social proof;
- quantified outcomes;
- before/after narratives;
- interactive product moments;
- cinematic brand assets.

Marketing may simplify the explanation. It may never fabricate capabilities, deployments, outcomes or customer evidence.

## 4. Continuous-growth rule

TORO is never considered static.

Each layer owns:
- current state;
- health;
- unresolved gaps;
- measurable quality;
- next improvement;
- regression protection.

The system should become easier to use as the internal system becomes more capable.

Increasing capability must not automatically increase visible complexity.

## 5. User experience principle

A normal user should not have to understand:
- databases;
- agent graphs;
- connector topology;
- schemas;
- prompt engineering;
- model routing;
- orchestration internals.

The ideal experience is:

**Ask TORO. TORO understands the company. TORO works within permission. TORO shows what matters. TORO proves what happened.**

## 6. Dreamcatcher rule

Dreamcatcher is the first full proof environment.

It is allowed to have:
- hotel-specific workflows;
- hotel-specific agent personalities;
- room/reservation/guest models;
- experimental integrations.

These must not leak into the universal core as hard-coded assumptions.

The product is not ready for a new external business until the portability gate passes.

## 7. Brand rule

The approved TORO identity is the blue bull.

Production surfaces must use the verified source asset or approved derivatives. Generated substitutes, alternate animals, color-swapped bulls or unofficial marks are prohibited for official TORO identity.

Visual quality should feel:
- premium;
- intelligent;
- calm;
- distinctive;
- confident;
- alive without becoming childish;
- functional rather than decorative.

## 8. Design doctrine

World-class design for TORO means more than visual polish.

The system should optimize:

### Clarity
The user immediately understands what matters and what TORO is doing.

### Compression
Complex business state becomes a small number of meaningful choices.

### Trust
Source, freshness, risk, permission and evidence are available when relevant.

### Momentum
Every screen or conversation creates an obvious next action.

### Calm
Critical issues stand out because the default interface is restrained.

### Personality
TORO feels recognizable without compromising precision or professionalism.

### Continuity
WhatsApp, portal, reports and agent interactions feel like the same intelligence.

### Accessibility
Mobile-first, readable, keyboard-capable, touch-safe and not dependent on color alone.

### Evidence
A successful animation or green state is never the proof. The underlying evidence is.

## 9. Anti-patterns

Do not:
- build screens because data exists;
- create duplicate sources of truth;
- hide uncertainty;
- treat connection as integration;
- treat integration as automation;
- treat automation as verified execution;
- treat deployment as adoption;
- expose internal complexity to impress users;
- add agents when a workflow is enough;
- add systems when an existing authority is sufficient;
- copy entire external ledgers into TORO without a business need;
- expand to new customers before portability and reliability are proven.

## 10. Product north-star

TORO wins when the business becomes:

- more understandable;
- more measurable;
- more resilient;
- easier to operate;
- less dependent on one person's memory;
- faster at making good decisions;
- safer at executing;
- more profitable;
- simpler for humans despite greater internal intelligence.

The user should feel that TORO knows the company, protects it, advances it and removes work — without forcing the user to learn the machinery underneath.
