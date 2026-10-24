# START HERE — TORO

**Status:** CURRENT product orientation  
**Date:** 2026-10-22  
**Master product / visible brand:** TORO
**Legacy technical alias:** TORO OS

## Read this first

TORO is not a dashboard, chatbot, hotel app, or collection of agents.

TORO is the continuously improving **master intelligence and orchestration layer** for people, businesses and portfolios. Its operating/execution capabilities live inside the same TORO product; `TORO OS` remains only as a technical legacy alias where renaming old keys or components could break compatibility. Dreamcatcher Hotel is the first real proving ground.

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

- Prove TORO deeply inside Dreamcatcher through its governed operating/execution capabilities.
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
3. `docs/product/TORO_BRAIN_GENERAL_PLAN.md`
4. `docs/product/TORO_BRAIN_CONSTITUTION.md`
5. `docs/product/TORO_BRAIN_MASTER_ARCHITECTURE.md`
6. `docs/product/TORO_SUBSYSTEMS_AND_USER_VAULT.md`
7. `docs/product/NEW_BUSINESS_READINESS_GATE.md`
8. For integral reviews or strategic alignment, the relevant sections of the [integrated evolution guide](docs/product/TORO_INTEGRATED_EVOLUTION_GUIDE_V1.md) and its [dated audit](docs/evidence/TORO_INTEGRAL_AUDIT_2026-10-22.md); subordinate synthesis with new targets explicitly marked as proposals
9. The current execution plan relevant to the task
10. Domain-specific technical contracts and tests

Historical TORO/TORO OS documents are evidence and context. They do not override the current TORO constitution.

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

## Product hierarchy

- **TORO:** master intelligence, memory, governance and orchestration.
- **TORO operating/execution layer:** workflows, tasks, approvals, automations and actions for a business/workspace.
- **TORO subsystems:** internal capabilities such as TORO People, TORO Comms and TORO Tools.
- **OpenClaw/WeSpeak/WhatsApp/Portal:** runtimes or surfaces, never competing brains.

A principal may govern multiple organizations, businesses, projects and client/ally scopes. Cross-scope reasoning is policy-controlled; external clients and personal data remain isolated by default.

## Brand rule

The only visible product/brand is **TORO**.

The business is represented by the **blue bull**; TORO is represented by the fused **brain + microchip/circuit** intelligence at its center. The two are one metaphor: biological intelligence + AI/computation coordinating a much larger living system.

Current master, per `docs/product/TORO_BRAND_CONTRACT.md` (CURRENT, 2026-09-23):
- `/TORO/Brand/01_Master/TORO_LOGO_MASTER_v1.png`
  - 1536×1536
  - SHA-256 `15a1b661a12cc020b905188e1638d001cc0a21d2a2f47beb4077843b478be747`
- The TORO BRAIN wordmark (`8828b0d...`), isotype filename and old manifest are historical references. File availability and exact bytes still require verification.
- Portal design rules: `docs/product/TORO_PORTAL_DESIGN_RULES.md`; subordinate to the General Plan and brand contract.

Legacy source artwork remains historical provenance only:
- `Dramcatcherst/toro-os-v88-new/public/assets/toro-azul-logo.jpg`
- registry entry `BRAND-005`

Rules:
- do not generate, redraw or substitute a different bull for official production identity;
- do not use bullfighting, violent or aggressive imagery as the brand language;
- do not present TORO OS as a second brand or product;
- old `TORO OS` / `toro_os_*` names may remain only as technical compatibility aliases until safely migrated.

## Strategic operating lens — 2026-10-20

Use the **single General Plan** section `OWNER_AI_WEALTH_STRATEGY_20261020` to prioritize verified Dreamcatcher net contribution, owner time recovered through governed TORO, productive assets and resilience. It contains 40 mapped controls, not 40 completed features. Do not invent financial results, create duplicate schedulers, or advance external client onboarding before the existing readiness gate.

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
