# START HERE — TORO OS

**Status:** CURRENT product orientation  
**Date:** 2026-09-22  
**Product:** TORO OS

## Read this first

TORO OS is not a dashboard, chatbot, hotel app, or collection of agents.

TORO OS is a continuously improving **AI Business Operating System** whose first real proving ground is Dreamcatcher Hotel.

The product is built **inside-out**:

1. Understand the business.
2. Establish truth, identity, permissions and context.
3. Connect the systems and evidence that already run the business.
4. Build the internal intelligence and execution engine.
5. Add governance, observability, recovery and continuous learning.
6. Prove end-to-end workflows with real evidence.
7. Only then expose the complexity through simple user experiences such as WhatsApp and the TORO Portal.
8. Only after the New Business Readiness Gate passes may TORO accept external businesses.

**Surface is a consequence of a working engine, not the foundation of the product.**

## Current scope

- Prove TORO OS deeply inside Dreamcatcher.
- Remove fragmented or contradictory sources of truth.
- Strengthen the internal engine, connector fabric, agent orchestration, governance, evidence and learning loops.
- Keep WhatsApp and Portal work as late-stage product surfaces and validation tools, not as architectural foundations.
- Do not expand to new industries or external businesses yet.
- Do not create generalized industry templates yet.

## Current status

**New external businesses: NOT READY.**

Dreamcatcher remains the reference implementation and test environment until the readiness gate in `docs/product/NEW_BUSINESS_READINESS_GATE.md` passes.

## Mandatory reading order for agents

1. `START_HERE.md`
2. `toro-context.yaml`
3. `docs/product/TORO_OS_CONSTITUTION.md`
4. `docs/product/NEW_BUSINESS_READINESS_GATE.md`
5. The current execution plan relevant to the task
6. Domain-specific technical contracts and tests

Historical TORO documents are evidence and context. They do not override the current product constitution.

## Canonical authority model

- **GitHub:** product constitution, code, architecture, technical contracts and version history.
- **Supabase:** TORO-owned structured runtime data, identities, permissions, operational state and audit.
- **Airtable:** transitional human control/reference surface while operational dependencies are removed.
- **Notion:** narrative planning, research, working memory and human-readable strategy.
- **Dropbox:** source files, media, evidence and archives.
- **Vercel:** deployment/runtime evidence.
- **Specialist systems:** retain authority in their domains (for example Kross for live PMS truth and Alegra for fiscal/accounting truth).

No tool becomes authoritative merely because TORO can connect to it.

## Subsystem and user-data rule

- Every internal TORO subsystem uses the naming pattern `TORO <Subsystem>`.
- Specialist personas use TORO-prefixed identities (for example TORO TERE or TORO RICO) but do not create separate truth, identity or permission universes.
- DreamTeam is a legacy standalone implementation whose canonical destination is `TORO People`.
- Each human has one canonical TORO identity and a logically isolated `TORO User Vault`, not a separate physical database by default.
- Personal, work-private, organization, shared and system scopes must remain explicit; personal content is not employer-visible by default.
- Durable memory requires purpose, provenance, sensitivity, confidence, retention and verification state.
- See `docs/product/TORO_SUBSYSTEMS_AND_USER_VAULT.md` before creating or naming a subsystem, user-memory model or personal/work context.

## Brand rule

TORO OS uses the approved **blue bull** identity.

Current verified source artwork:
- Repository: `Dramcatcherst/toro-os-v88-new`
- `public/assets/toro-azul-logo.jpg`
- Brand registry entry: `BRAND-005 — TORO OS blue bull logo`
- V2 derived asset pack: `public/assets/toro-blue-pack/`
- V1 pack is deprecated.

Do not generate, redraw or substitute a different bull for production identity. The canonical source asset must be migrated into this repository before a new public-facing TORO surface is released.

## Product test

Every feature should improve at least one of these outcomes:

- less owner cognitive load;
- less manual work;
- better decisions;
- fewer errors;
- faster execution;
- stronger control and evidence;
- lower cost;
- higher revenue;
- better customer or employee experience;
- greater safe autonomy.

If a feature adds complexity without materially improving one of these outcomes, it should not ship.
