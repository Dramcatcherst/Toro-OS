# TORO Consolidation R1 — Architecture & Canonicalization Design

**Status:** PROPOSED FOR OWNER REVIEW  
**Date:** 2026-09-28  
**Product:** TORO  
**Reference implementation:** Dreamcatcher Hotel  
**Canonical repository:** `Dramcatcherst/Toro-OS`  
**Base commit inspected:** `3af9316eb250b57af6f57ff36907b734a9346693`

---

## 1. Purpose

TORO already has substantial architecture, data, governance, code, operational workflows and connected systems. The next material step is consolidation, not feature expansion.

R1 is designed to make TORO easier to understand, safer to operate and cheaper to evolve by enforcing:

> one concept -> one authority -> one canonical object -> explicit consumers.

The goal is not to delete historical work or rebuild TORO. The goal is to make the existing work converge.

### R1 outcomes

R1 should produce:

1. one visible product and brand: **TORO**;
2. one canonical Plan General;
3. one canonical runtime data platform;
4. one project/task/decision/approval universe;
5. one explicit source-authority model;
6. one normalized action/execution loop;
7. one controlled path from evidence to learning;
8. a disposition for every material repository, deployment, base and planning surface;
9. a smaller and more reliable active backlog;
10. objective gates before expanding TORO to external businesses.

---

## 2. Current evidence baseline

This design is grounded in live connected-system inspection performed on 2026-09-28.

### GitHub

Current canonical product repository:

- `Dramcatcherst/Toro-OS`

Current repository rules already establish:

- TORO as the only visible product/brand;
- Dreamcatcher as the internal proving ground;
- engine-first build order;
- GitHub as product/code/architecture authority;
- Supabase as TORO-owned runtime authority;
- Airtable as transitional human control/reference;
- Notion as narrative planning/research/working memory;
- Dropbox as original files/media/evidence/archive;
- Vercel as deployment/runtime evidence;
- external systems retaining specialized transactional authority.

The repo currently still contains technical and filename aliases such as `TORO_OS_*`, `TORO_BRAIN_*`, and `toro_os_*`. R1 does not rename these blindly.

### Supabase

Primary active runtime project inspected:

- project ref: `abtyrbqlqbsastmridzp`

Observed portfolio/task state:

- 11 active projects;
- 6 active MODULE-level projects;
- 205 open active tasks;
- 65 open tasks with `needs_revalidation=true`.

Revalidation concentration:

| Canonical module | Open | Needs revalidation |
| --- | ---: | ---: |
| critical_hotel_operations | 38 | 17 |
| revenue_booking_stack | 27 | 15 |
| toro_executive_control | 23 | 15 |
| dreamcatcher_website | 12 | 7 |
| business_truth_bible | 28 | 6 |
| finance_controls | 44 | 5 |

Status of the 65 revalidation items:

- planned: 45;
- blocked: 18;
- in_progress: 2.

Largest migration-origin group:

- `p2_next_migrated_2026_09_19`: 20 items.

This means the main backlog problem is not missing work. It is unresolved historical/current classification.

### Airtable

Observed bases relevant to TORO include:

- `TORO OS — Sistema Operativo Central`: 139 tables;
- `TORO OS — Master Brain`: 31 tables;
- `TORO OS — Command Center`: 2 tables;
- `DreamTeam Knowledge OS`: 29 tables.

The Central base itself says that TORO OS V2 / Sistema Operativo Central was the migration target during the Airtable era. Current GitHub/Supabase contracts now supersede Airtable as runtime/product authority.

The Command Center pattern is directionally correct because it stays small, but its decision/portfolio data must become projection/UI over canonical Supabase records rather than an independent ledger.

### Notion

Current Notion has a stable entry point and a large execution/portfolio page.

Finding:

- strategic documentation is aligned in principle;
- the main TORO execution page has accumulated architecture, daily cycle logs, Kross state, Vercel state, People, F&B and operational audit history in one long document.

R1 must separate:

- durable strategy;
- current state;
- evidence/history;
- executable work.

Notion must not become an event log or runtime database.

### Dropbox

Connected business Dropbox was verified.

Observed root includes Dreamcatcher and other business/family scopes. Dreamcatcher contains at least:

- `/Dreamcatcher Hotel/Administracion`
- `/Dreamcatcher Hotel/Operaciones`

GitHub references TORO brand masters under a `/TORO/Brand/01_Master/` path. That exact root was not observed in the connected root listing. This is **UNKNOWN**, not proof that the assets are absent.

### Vercel

At least 20 project surfaces are visible in the connected team, including:

- canonical TORO preview/runtime candidate;
- legacy `toro-os-v03`;
- two DreamTeam project surfaces;
- multiple Dreamcatcher website generations/previews;
- experiments/incubator surfaces.

R1 must classify deployment surfaces without deleting them merely because they look redundant.

### Linear

Workspace exists, but no active projects were found.

R1 disposition:

- **PARKED**;
- do not create a second/third task/project authority.

### PostHog

The available PostHog connection could not be proven to target TORO/Dreamcatcher.

R1 disposition:

- **PARKED / WRONG-OR-UNVERIFIED PROJECT CONNECTION**;
- no behavioral conclusions from that project;
- reconnect later to an explicitly identified TORO project before product analytics becomes authoritative.

### Superpowers, Data Analytics and TinyFish

These are capabilities/methodologies, not business authorities.

- Superpowers = execution methodology;
- Data Analytics = analysis/reporting capability;
- TinyFish = research/browser capability.

They must never become separate project roots or sources of business truth.

---

## 3. Product definition

### Canonical product definition

**TORO is an intelligent operating system for running people, businesses and portfolios. It connects context, business truth, people, tools, data and rules; understands what is happening, determines what needs attention, coordinates humans and AI specialists, executes actions within permissions, verifies results and learns from evidence. Internally it may manage substantial complexity; externally it should feel simple enough to use through a conversation or a focused visual surface.**

### Product test

A TORO capability should materially improve at least one of:

- owner cognitive load;
- manual work;
- decision quality;
- execution speed;
- error rate;
- control/evidence;
- cost;
- revenue;
- customer experience;
- employee experience;
- safe autonomy.

If it adds more complexity than value, it should not become active product scope.

---

## 4. One-product naming model

### Visible product

**TORO**

### Compatibility aliases

The following may remain in code, keys, migrations, filenames or historic source references when renaming would create unnecessary risk:

- TORO OS;
- TORO Brain;
- `toro_os_*`;
- `TORO_BRAIN_*`;
- existing project keys such as `toro_os_portfolio_master`.

### Rule

Compatibility aliases do not represent separate products, plans, brains or permission universes.

No new user-facing surface should introduce TORO OS or TORO Brain as a parallel brand.

---

## 5. Architecture simplification: seven platform primitives

R1 does **not** delete or flatten current business subsystems. It introduces seven platform primitives underneath them.

### 5.1 Identity & Scope

Answers:

- who is acting?
- on behalf of whom?
- in which organization/business/workspace/property/project?
- what relationships and memberships exist?
- what private/work/shared scope applies?
- what may this actor see, draft, execute or approve?

Canonical concepts:

- principal;
- person;
- organization;
- business/workspace;
- property/location;
- project/product;
- membership;
- role;
- user vault;
- consent;
- capability grant.

### 5.2 Truth & Memory

Answers:

- what does TORO know?
- where did it come from?
- how fresh is it?
- which source is authoritative?
- how confident is TORO?
- may it be persisted and reused?

Canonical concepts:

- source object;
- evidence;
- knowledge item;
- decision;
- memory item;
- provenance;
- freshness;
- confidence;
- verification;
- conflict;
- retention.

### 5.3 Tools & Data

Answers:

- what systems are available?
- which are connected?
- who owns the connection?
- what capabilities are authorized?
- what data can be read or written?
- is the connector healthy and current?

Canonical concepts:

- connector;
- tool;
- capability;
- source snapshot;
- sync/import run;
- mapping;
- health state;
- cost;
- scope;
- authority level.

### 5.4 Intelligence

Answers:

- what does the situation mean?
- which specialist capability should handle it?
- what should happen next?
- what options and trade-offs exist?
- what can be generalized?

Canonical concepts:

- planner;
- specialist persona;
- skill;
- context pack;
- research;
- recommendation;
- model route;
- evaluation.

Specialists such as TORO TERE, TORO RICO, TORO FIONA, TORO SKY and TORO SOBRESITO are routing/specialization patterns over the same identity, truth, tool and governance layers.

### 5.5 Work & Execution

Answers:

- what outcome are we pursuing?
- what is the next executable unit?
- what is blocked?
- which workflow/action will run?
- did execution actually happen?

Canonical concepts:

- portfolio;
- project;
- task;
- workflow;
- action;
- approval;
- run;
- action receipt;
- result;
- KPI;
- blocker.

### 5.6 Governance & Reliability

Answers:

- is this allowed?
- what risk level applies?
- is approval required?
- how is the action audited?
- can it be reversed or recovered?
- is the system healthy?

Canonical concepts:

- policy;
- action ceiling;
- RLS/authorization;
- risk;
- approval;
- audit;
- security;
- privacy;
- rollback;
- backup/restore;
- incident;
- observability.

### 5.7 Experience

Answers:

- what does the human need to see now?
- what is the simplest safe interaction?
- what requires attention?
- how does context continue across channels?

Canonical surfaces:

- WhatsApp;
- TORO Portal/Dashboard;
- mobile;
- email;
- reports;
- notifications;
- future voice or other channels.

Interfaces consume canonical objects. They do not own shadow truth.

---

## 6. Business domains remain, but do not become separate brains

Existing TORO domains can continue as governed business capabilities, for example:

- People;
- Guests;
- Operations;
- Finance;
- Revenue;
- Growth;
- Studio;
- Projects;
- Knowledge;
- Assets;
- Research;
- Channels;
- Systems;
- Builder.

Each domain must reuse the seven platform primitives.

A domain must not create its own duplicate:

- identity universe;
- task engine;
- approval engine;
- notification center;
- permanent memory model;
- connector registry;
- audit ledger.

---

## 7. Canonical object rule

A business object exists once conceptually even when rendered in many systems.

Example:

`payment:123`

may be represented in:

- Supabase;
- TORO Dashboard;
- WhatsApp;
- a Notion specification;
- Airtable transitional view;
- a report.

These are representations of the same canonical object, not five independent payments.

This rule applies to:

- people;
- organizations;
- rooms/units;
- reservations;
- guests;
- invoices;
- payments;
- assets;
- campaigns;
- projects;
- tasks;
- decisions;
- approvals;
- workflows;
- conversations;
- evidence.

---

## 8. Action loop

The canonical TORO action loop is:

`OBSERVE -> UNDERSTAND -> DECIDE -> PREPARE -> APPROVE -> EXECUTE -> VERIFY -> LEARN`

Not every request uses every stage.

Examples:

- factual question can stop at UNDERSTAND;
- recommendation can stop at DECIDE;
- draft can stop at PREPARE;
- safe reversible action may proceed to EXECUTE under policy;
- payments, legal commitments, permission changes, reservation-impacting actions and destructive changes require approval according to current action ceilings;
- material execution must reach VERIFY before it is considered complete;
- LEARN only promotes evidence-backed, scoped, governed lessons.

---

## 9. State contract

Keep the existing evidence-state distinction:

- REGISTERED;
- DESIGNED;
- CONFIGURED;
- IMPLEMENTED;
- DEPLOYED;
- EXECUTED;
- VERIFIED.

A later state must never be inferred from an earlier one.

Examples:

- a Vercel READY deployment is not adoption;
- schema existence is not employee rollout;
- an Airtable row is not executed work;
- a message draft is not a sent message;
- a payment instruction is not payment;
- a test fixture is not live business evidence.

---

## 10. Source authority contract

### Product and architecture

**GitHub**

Owns:

- constitution;
- Plan General source;
- architecture;
- technical contracts;
- code;
- migrations;
- version history.

### TORO-owned runtime

**Supabase**

Owns canonical TORO structured runtime for domains migrated to it, including:

- identities;
- memberships;
- permissions;
- projects/tasks;
- decisions;
- governed knowledge;
- audit;
- operational state;
- runtime workflow state.

### Human transitional control

**Airtable**

Use for:

- transitional control;
- curated configuration;
- human review surfaces;
- legacy evidence still awaiting migration.

Airtable must not win a conflict merely because a table is labeled “master”.

### Narrative knowledge

**Notion**

Use for:

- strategy;
- specifications;
- research synthesis;
- human-readable documentation;
- meeting/working memory.

Do not use Notion as an event log or operational database.

### Files/evidence

**Dropbox**

Use for:

- originals;
- media;
- source documents;
- evidence;
- backups/archives.

### Deployment evidence

**Vercel**

Use for:

- deployment state;
- runtime/build evidence;
- domains;
- environment/deployment configuration where accessible.

### Specialist authorities

Examples:

- Kross = live PMS truth where actually connected/verified;
- Alegra = accounting/fiscal system authority in its domain;
- banks/official portals = primary transactional/legal evidence where applicable.

Connecting a system never makes it authoritative outside its domain.

---

## 11. Backlog consolidation design

The current 205 open tasks are not a valid signal of 205 equally current commitments.

### First cohort

Revalidate the 65 items already marked `needs_revalidation=true`.

Every item must receive one disposition:

- **KEEP** — current, correctly scoped and still worth doing;
- **MERGE** — duplicate/overlapping work absorbed into a canonical task;
- **CLOSE** — obsolete, already satisfied or no longer desired;
- **HOLD** — valid future work without current priority/trigger;
- **REWRITE** — valid objective but incorrect scope, authority, acceptance criteria or next action.

### Revalidation order

1. P0/P1 migrated review items;
2. `in_progress` items;
3. critical/high planned items;
4. current canonical/additive work;
5. P2 migrated work;
6. incubator/low-priority migrated work.

### Completion rule

`needs_revalidation=false` only when:

- canonical project/module is known;
- current objective is still valid;
- authority/source is correct;
- owner is correct or explicitly unknown;
- next action is executable;
- blocker is current;
- done criteria are explicit;
- duplicate status was checked.

No bulk “mark reviewed” operation.

---

## 12. Security consolidation design

Security advisors observed:

- 50 RLS-enabled tables without policies;
- 10 of those have client-role grants to `anon/authenticated`;
- 3 public `SECURITY DEFINER` functions callable by `anon`;
- 40 public `SECURITY DEFINER` functions callable by authenticated users.

### Important interpretation

RLS with no policy is deny-by-default for client roles. Therefore “RLS enabled, no policy” is not automatically an exposure.

Observed grouping:

- finance/assets/facilities/risk tables are primarily service-role only;
- several reporting/core/operations tables expose no client grants;
- 10 Employee Experience-style public tables retain broad object grants but RLS currently blocks client access.

### Function review

A static guard scan classified all authenticated-callable `SECURITY DEFINER` functions into one of:

- explicit org-role guard;
- department/manage guard;
- self/current-employee guard;
- `auth.uid()` scope;
- delegated guarded function;
- intentionally pre-auth rate-limit/telemetry path.

No function was left unclassified by that scan.

This is **not proof of authorization correctness**. R1 requires negative behavioral tests.

### R1 security gates

1. Classify the 10 public no-policy/client-grant tables:
   - server-only -> revoke unnecessary client grants;
   - client-needed -> add least-privilege RLS policies and remove unnecessary privileges.
2. Verify cross-tenant and revoked-user denial on sensitive RPCs.
3. Verify department and employee-self boundaries.
4. Review pre-auth rate-limit RPC abuse characteristics and whether they should remain public.
5. Review overlapping permissive RLS policies for accidental union-of-access and performance.
6. Run fresh security advisors after any change.
7. Do not expand employee rollout/autonomy based only on schema existence.

---

## 13. Repository disposition

Canonical product:

- `Dramcatcherst/Toro-OS` -> **CANONICAL**

Known legacy/reference:

- `Dramcatcherst/toro-os-v88-new` -> **REFERENCE**
- `Dramcatcherst/Toro-OS---Dreamcatcher-Hotel` -> **REFERENCE / LEGACY**
- `Dramcatcherst/agoversion-v100` -> **REFERENCE / STATIC QA SNAPSHOT**
- `Dramcatcherst/dc-king` -> **REFERENCE / PRIOR WEBSITE IMPLEMENTATION**
- `Dramcatcherst/dreamcatcher-hotel-santa-teresa-v100` -> **REFERENCE / PRIOR WEBSITE IMPLEMENTATION**
- `Dramcatcherst/dreamcatcher-santa-teresa-next` -> **REFERENCE / ABANDONED BOOTSTRAP CANDIDATE** unless a current consumer is discovered
- `Dramcatcherst/dreamcatcher-el-sueno-de-mama` -> **ARCHIVE** (repository is already archived)

Active/migrate:

- `Dramcatcherst/dream-team` -> **MIGRATE INTO TORO PEOPLE**
- `Dramcatcherst/dreamcatcher-website-vnext` -> **ACTIVE CHANNEL IMPLEMENTATION**, subject to production/cutover evidence

Experiment/separate:

- `Dramcatcherst/dreamauro` -> **EXPERIMENT / TORO EXCHANGE CANDIDATE**
- `Dramcatcherst/ai-for-dreamers` -> **SEPARATE PRODUCT POWERED BY TORO**

Needs final consumer/cutover reconciliation:

- `Dramcatcherst/SITE0926` -> **REFERENCE/UNKNOWN CONSUMER**
  - repository contains a non-trivial Dreamcatcher web implementation and tests;
  - therefore it should not remain “unknown because README is missing”;
  - current status stays non-canonical until its deployment/domain/consumer relationship is reconciled.

No repository is deleted in R1.

---

## 14. Deployment disposition

Every Vercel project must receive one state:

- CANONICAL_RUNTIME;
- ACTIVE_CHANNEL;
- PREVIEW;
- MIGRATION_TRANSITION;
- REFERENCE;
- EXPERIMENT;
- ARCHIVE_CANDIDATE;
- UNKNOWN_CONSUMER.

Required fields:

- Vercel project ID;
- project name;
- source repository if any;
- source branch;
- current/last deployment SHA;
- target (preview/production);
- domain(s);
- owner scope;
- current consumer;
- rollback path;
- disposition;
- retirement gate.

A READY deployment alone never proves canonicality.

---

## 15. Airtable disposition

Airtable consolidation proceeds non-destructively.

### Central

`TORO OS — Sistema Operativo Central`

Treat as:

- transitional human control/reference;
- legacy migration estate;
- source of unique evidence not yet absorbed.

### Master Brain

Treat as:

- historical design/evidence;
- source for provenance;
- not current product authority.

### Command Center

Treat as:

- UI/projection pattern;
- must converge onto Supabase canonical decisions/projects rather than own a parallel ledger.

### DreamTeam Knowledge OS

Treat as:

- knowledge migration source;
- destination is TORO Knowledge / governed runtime knowledge structures.

### Retirement gate

No table/base is archived or deleted until:

- authority mapped;
- consumers mapped;
- unique content migrated or intentionally retained;
- backup captured;
- restore tested where material;
- automation/external dependencies audited;
- owner-approved destructive step exists.

---

## 16. Notion disposition

### Keep

- stable entry point;
- concise Plan General mirror/navigation;
- product specs;
- research synthesis;
- human-readable operating docs.

### Reduce

The current large execution page should stop accumulating:

- repetitive cycle logs;
- raw deployment snapshots;
- raw Kross freshness snapshots;
- operational event logs that already belong in Supabase/evidence systems.

### Rule

Durable decision -> canonical decision ledger + concise Notion summary.  
Operational event -> runtime/evidence system.  
Strategy/spec -> Notion/GitHub as appropriate.  
Task -> canonical task universe.

---

## 17. Experience contract

The default human experience should answer:

1. what matters?
2. why?
3. what does TORO recommend?
4. what can TORO do?
5. what needs me?
6. what evidence supports this?
7. what happens next?

The UI should expose complexity progressively.

### Default surfaces

- **Today / Attention** for operational orientation;
- **WhatsApp** for asking, delegating, approvals and concise exceptions;
- **Portal/Dashboard** for visual depth, configuration, evidence and complex decisions.

The same canonical task/decision/workflow must continue across channels.

---

## 18. Learning contract

Learning is not “save everything”.

Candidate learning must include:

- source;
- scope;
- purpose;
- sensitivity;
- confidence;
- evidence;
- retention;
- verification state;
- affected rule/capability;
- rollback/supersession path.

Flow:

`observed -> candidate -> reviewed/verified -> durable -> superseded/expired/deleted`

Do not silently promote:

- personal observations into employer truth;
- one-off events into durable preferences;
- model guesses into business rules;
- external research into canonical facts.

---

## 19. R1 workstreams

R1 is one consolidation program with separate implementation plans.

### R1-A — Backlog revalidation

Scope:

- classify the 65 `needs_revalidation` open tasks;
- merge/hold/close/rewrite safely;
- preserve evidence.

### R1-B — Security/access review

Scope:

- 10 client-granted/no-policy public tables;
- pre-auth security-definer RPCs;
- authenticated RPC negative tests;
- RLS policy overlap;
- employee rollout security gates.

### R1-C — Naming/documentation convergence

Scope:

- TORO visible naming;
- compatibility alias registry;
- current-vs-historical documentation;
- compact Plan General;
- Notion log separation.

### R1-D — Source/surface registry

Scope:

- GitHub repositories;
- Vercel projects;
- Airtable bases/tables;
- Notion canonical pages;
- Dropbox governed roots;
- connector ownership/status.

### R1-E — Canonical-object and action contracts

Scope:

- seven platform primitives;
- canonical object identity;
- action loop;
- receipt/evidence requirements;
- cross-channel continuity.

### R1-F — Airtable dependency retirement

Scope:

- determine which runtime/human workflows still require Airtable;
- move true runtime state to Supabase where not already migrated;
- preserve Airtable only where it adds human value or unique evidence.

Each workstream gets its own implementation plan after this design is approved.

---

## 20. R1 non-goals

R1 does not:

- onboard a second external business;
- build generalized industry templates;
- migrate to Linear;
- enable PostHog until the correct project is identified;
- replace Kross or Alegra;
- delete Airtable bases;
- delete repositories;
- delete Vercel projects;
- rename technical keys destructively;
- activate broad employee WhatsApp access;
- automate payments/legal/reservation changes;
- build another dashboard backend;
- create a second task/project/decision system.

---

## 21. Verification requirements

No R1 workstream is complete without direct evidence.

### Architecture

- current docs agree on one visible TORO;
- aliases are explicitly marked compatibility/historical;
- no parallel master plan introduced.

### Backlog

- every revalidated task has a disposition;
- duplicate/merge destination is explicit;
- counts reconcile before/after;
- no history lost.

### Security

- fresh Supabase advisors captured;
- negative tenant/role/revocation tests pass for changed surfaces;
- no broad grants added as a shortcut;
- rollback SQL/migration path exists.

### Repositories/deployments

- dispositions recorded;
- no retirement without domain/consumer/source/rollback evidence.

### Knowledge

- Plan General becomes navigation/direction, not a raw activity log;
- operational history remains queryable elsewhere.

### Runtime

- no TARGET/FUTURE capability presented as CURRENT;
- material actions generate receipts/evidence.

---

## 22. Success metrics

R1 should be measured by reduction in ambiguity and operating cost, not number of new features.

Primary metrics:

- open tasks requiring revalidation: **65 -> target 0**;
- active duplicate canonical projects: target 0;
- unknown-consumer deployment/repository surfaces: target 0 for material surfaces;
- current docs presenting TORO Brain/TORO OS as separate visible products: target 0;
- unclassified source-authority conflicts: target 0 for active domains;
- security advisor warnings without explicit disposition: target 0 for R1-scoped warnings;
- owner decisions that require searching multiple task/decision ledgers: target 0;
- Airtable runtime dependencies without documented replacement/retention reason: target 0.

Secondary:

- owner intervention minutes;
- time to identify source authority;
- time to resolve an approval;
- recurring manual work converted into governed workflows;
- verified error/rework reduction.

---

## 23. Execution order

1. approve this R1 design;
2. write one implementation plan per R1 workstream;
3. begin with R1-B security and R1-A backlog revalidation in parallel only where they do not mutate shared state;
4. perform naming/documentation convergence without breaking compatibility;
5. finish source/surface registry;
6. codify canonical-object/action contracts;
7. retire Airtable dependencies only after parity/backup/restore/consumer gates;
8. rerun architecture/data/security verification;
9. update the canonical Plan General with the verified R1 outcome;
10. reassess New Business Readiness Gate.

---

## 24. Decision gates

Owner review is required before:

- destructive retirement;
- broad permission changes;
- production migration/cutover;
- external business onboarding;
- payment/money movement;
- legal/compliance commitment;
- reservation-impacting mutation;
- employee rollout that changes real access;
- public brand/domain cutover.

Low-risk research, reconciliation, documentation, testing and reversible preparation remain suitable for governed agent execution.

---

## 25. Final design principle

TORO should become more capable while presenting fewer competing concepts to the human.

The architectural target is:

> **One TORO. One identity model. One truth model. One work universe. One governance model. Many specialized capabilities and tools.**

Complexity belongs inside the governed engine. The user should receive clarity, evidence and the next useful action.
