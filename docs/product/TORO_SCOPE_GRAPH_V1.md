# TORO Brain — Scope Graph v1

**Status:** CURRENT TARGET DATA CONTRACT
**Date:** 2026-09-22
**Implementation:** design first; do not add graph tables until required by the portability/second-scope pilot.

## 1. Problem

A flat tenant/client model is insufficient.

A single human may:
- own multiple legal entities;
- operate multiple businesses;
- manage multiple properties;
- have personal projects;
- advise external clients;
- share projects with partners;
- use some tools across scopes and other tools privately.

TORO Brain must represent this without merging all data or cloning the product.

## 2. Core nodes

### Principal
A human who may govern a portfolio.

Example: Mauricio.

### Portfolio
A governed collection of scopes the principal may analyze together.

Portfolio is not necessarily a legal entity.

### Organization
Legal/administrative tenant boundary.

Examples:
- Atrapasueños;
- future client company.

### Business
Operating business.

One organization may operate multiple businesses.

### Workspace
The TORO operational context used by people/tools/workflows.

A business may have one or several workspaces when isolation/operations require it.

### Property/Location
Physical operating location.

### Project/Product
Initiative or product with its own goals, work and evidence.

May belong to one business or span several allowed scopes.

### Client
External customer relationship.

"Client" is a relationship/business role, not the universal top-level entity.

### Ally/Partner
External collaborative relationship that may share a project or limited data.

## 3. Relationship graph

Required relationship families:

### Ownership/control
- owns
- controls
- beneficial_interest_in

### Operational
- operates
- manages
- responsible_for
- part_of

### Human
- member_of
- employed_by
- contractor_for
- advises
- administers

### Commercial
- client_of
- provider_to
- partner_of

### Project
- participates_in
- sponsors
- delivers
- depends_on

### Physical
- located_at
- contains

Relationships carry:
- source scope;
- target scope;
- relationship type;
- effective dates;
- status;
- permission implications;
- evidence;
- verification state.

## 4. Isolation is independent from relationship

Being related does not automatically grant data access.

Each scope has an isolation policy:
- private;
- portfolio;
- shared_project;
- client_isolated;
- public_reference.

Each relationship may add a narrow sharing policy.

Example:
- Mauricio owns Company A and Company B.
- Both may be portfolio-enabled.
- Company A client records still do not automatically flow into Company B.
- Owner-level aggregate finance may be allowed while raw payroll remains isolated.

## 5. Cross-scope policy

Every cross-scope request evaluates:

`actor + source scope + target scope + relationship + data class + purpose + permission + isolation mode`

Possible result:
- allow raw;
- allow aggregate only;
- allow anonymized;
- allow explicit shared fields;
- require approval;
- deny.

## 6. Portfolio intelligence

Portfolio mode may produce:
- consolidated obligations;
- project capacity;
- cash need forecasts;
- duplicated subscriptions;
- supplier overlap;
- system health across businesses;
- reusable workflow opportunities;
- owner decision queue.

It should prefer aggregate/derived information when raw cross-business data is unnecessary.

## 7. Client isolation

External client business default:
`client_isolated`.

TORO product operators may access only what support/operations policy allows.

Client A data may not improve Client B answers through direct content reuse.

Reusable improvements must be abstracted:
- generic skill;
- generic template;
- generic system profile;
- generic workflow.

## 8. Personal relationship

The Principal's TORO Personal scope is not just another business.

Rules:
- personal defaults private;
- business admins cannot access it;
- personal can intentionally create a work action with a reviewed disclosure boundary;
- organization information may be summarized into personal owner views only if the actor already has authorization.

## 9. Current Dreamcatcher mapping

Current model can be interpreted without immediate schema changes:

- Mauricio -> Principal.
- Dreamcatcher Hotel & Villas -> current organization/workspace in Supabase.
- Atrapasueños -> organization/legal/portfolio relationship to be normalized when canonical legal/business mapping is promoted.
- Dreamcatcher -> operating business/workspace.
- Dreamcatcher / Villa Toro / Makaiza -> property/product/location scopes according to canonical business catalog.
- operations.projects -> project nodes within current workspace.
- future external pilots -> separate organization/workspace scopes.

Do not force all of these into `public.organizations` just to match the target vocabulary.

## 10. Current data-source mapping

### Supabase
Canonical runtime identity/organization/workflow state.

### Airtable
Contains transitional business/property/legal/family/project mappings useful for migration and evidence.

### GitHub
Defines target contract and code.

No source should be bulk-copied merely to create a graph.

## 11. Future implementation options

Preferred evolution when required:

### Option A — typed scope registry
A `brain.scopes` table + `brain.scope_relationships`.

Pros:
- generic;
- flexible;
- good for portfolio graph.

Risks:
- can become an over-generic EAV layer;
- must not replace strong domain tables.

### Option B — keep typed domain tables + relationship registry
Continue:
- organizations;
- properties;
- projects;
- people;
- businesses where needed;
and add a thin cross-entity relationship/index layer.

Preferred unless a real portability pilot proves Option A materially simpler.

## 12. Rule against over-generalization

TORO Brain needs a universal relationship model, not a universal table for all business facts.

Keep domain truth in strong domain models:
- rooms stay rooms;
- employees stay employees;
- invoices stay invoices;
- projects stay projects.

The scope graph links contexts; it does not flatten them.

## 13. Onboarding model

For a new approved scope:

1. identify Principal/organization/business relationship;
2. choose isolation mode;
3. create membership/roles;
4. connect tools;
5. map sources of truth;
6. ingest governed knowledge;
7. discover workflows;
8. configure approvals;
9. run isolation/security tests;
10. enable surfaces.

## 14. Example

```text
Mauricio [Principal]
│
├─ controls -> Atrapasueños [Organization]
│  ├─ operates -> Dreamcatcher [Business]
│  │  ├─ contains -> Dreamcatcher Property
│  │  ├─ contains -> Villa Toro
│  │  └─ contains -> Makaiza
│  └─ sponsors -> Project X
│
├─ owns -> AI for Dreamers [Product/Project]
├─ sponsors -> TORO Exchange [Experiment]
└─ advises -> Client Company A [External Organization, client_isolated]
```

TORO Brain can understand all relationships without merging Client Company A into Atrapasueños.

## 15. Definition of done

Scope Graph v1 is proven when a sandbox can demonstrate:
- one Principal;
- two owned/managed scopes;
- one external client-isolated scope;
- one shared project relationship;
- aggregate owner query;
- denied raw client-to-client query;
- personal-vs-business isolation;
- clear offboarding/export behavior.

