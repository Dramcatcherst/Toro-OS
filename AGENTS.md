<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — TORO Product Contract

## Mandatory preflight

Before substantive work:

1. Read `START_HERE.md`.
2. Read `toro-context.yaml`.
3. Read `docs/product/TORO_BRAIN_GENERAL_PLAN.md`.
4. Read `docs/product/TORO_BRAIN_CONSTITUTION.md`.
5. Read `docs/product/TORO_BRAIN_MASTER_ARCHITECTURE.md` when scope/portfolio/product boundaries matter.
6. Identify whether the task changes product core, Dreamcatcher reference implementation, infrastructure, data, integrations or presentation.
7. Identify the source of authority for every material fact or write.
8. Map the request into the TORO General Plan: scope, subsystem, CURRENT/TARGET/NEXT/FUTURE, priority and dependencies.
9. Inspect existing implementation before creating a second system.
10. Define verification and rollback before risky changes.
11. Run a generalization scan: could this become a reusable TORO capability/skill/profile without leaking scope-specific data?
12. Run a system-audit scan when the task touches a connected system: expected config, observed config, drift, health, permissions and recovery.

If a historical document conflicts with the current constitution or context contract, the current constitution wins unless the user explicitly supersedes it.


## Delivery governance

Normal TORO work is **branch-first and PR-first**.

Required default path:

`current main -> task branch -> smallest coherent change -> tests/lint/build -> Vercel preview when applicable -> evidence -> pull request -> merge -> production verification`

Rules:
- do not commit normal feature, documentation, configuration or governance work directly to canonical `main`;
- do not force-push `main`;
- do not delete or rewrite canonical branch history;
- do not bypass CI or preview verification merely because a change appears low risk;
- do not merge a stale/diverged branch by overwriting concurrent work; reconcile against current `main` first;
- if another TORO lane advances `main`, inspect the delta and rebase/re-extract without discarding the other lane;
- one issue/PR lane should own one coherent responsibility; if an issue duplicates an existing master lane, consolidate and close the duplicate;
- a failed gate is evidence to fix the change, not a reason to weaken the gate;
- direct-to-`main` writes are reserved for an explicitly authorized emergency/break-glass path and must record reason, evidence, verification and rollback immediately afterward.

Merge readiness requires:
- branch is current enough to merge without losing concurrent canonical work;
- relevant tests pass;
- lint/build pass where applicable;
- required runtime/preview evidence passes where applicable;
- source authority and privacy/security boundaries remain valid;
- rollback or revert path is known for material changes.

This behavioral rule is the prerequisite for repository-enforced branch protection/rulesets. Once GitHub enforcement is available, the technical rule should match this contract rather than replacing it.

## Product architecture

TORO is the sole master intelligence/memory/governance/orchestration product and visible brand. Operating/execution capabilities live inside TORO. `TORO OS` is a technical legacy alias only where old keys or components still depend on it.

TORO is built inside-out:

`identity/scope graph -> truth -> connectors -> intelligence -> execution -> governance/resilience -> continuous learning -> experience -> portfolio intelligence -> commercial presentation`

WhatsApp and TORO Portal are surfaces over the same governed TORO. They are not independent databases or architectural foundations.

Dreamcatcher is the first proving ground. Do not hard-code hotel assumptions into universal core modules unless they are explicitly scoped to the Dreamcatcher implementation.

Do not onboard external businesses until the readiness gate in `docs/product/NEW_BUSINESS_READINESS_GATE.md` permits it.

## Source authority

- GitHub: product constitution, code, architecture and versioned technical contracts.
- Supabase: TORO-owned structured runtime data, identities, permissions, operational state and audit.
- Airtable: transitional human control/reference while dependencies are removed.
- Notion: narrative planning, research and working memory.
- Dropbox: original files, media, evidence and archives.
- Vercel: deployment/runtime evidence.
- Specialist transactional systems retain domain authority.

Never silently resolve a source conflict. Record the conflict, authority, freshness and required correction.

## Brand

Official identity is **TORO** only.

Canonical visual metaphor:
- blue bull = the business / living organization;
- integrated brain + microchip/circuit = biological intelligence + AI/computation coordinating the whole.

Current masters:
- `/TORO/Brand/01_Master/TORO_BRAIN_LOGO_MASTER_v1.png`
  - SHA-256 `8828b0d89b1fb2dc9aa2127c39c3322a7b6dc018f8c1baece7a7bf69f4457a98`
- `/TORO/Brand/01_Master/TORO_BRAIN_ISOTYPE_MASTER_v1.png`
  - SHA-256 `15a1b661a12cc020b905188e1638d001cc0a21d2a2f47beb4077843b478be747`

Legacy blue-bull artwork remains provenance/reference only. Do not generate, redraw, recolor or substitute another bull for official product identity. Do not use bullfighting/violent imagery. Do not present TORO OS as a parallel public-facing product; preserve old TORO OS names only when technically required for compatibility.

## Work quality

Prefer:
- smallest coherent change;
- existing schemas before new tables;
- existing authority before duplicated data;
- reversible changes;
- least privilege;
- explicit evidence;
- tests proportional to risk;
- mobile and accessibility constraints where UI is involved;
- progressive disclosure rather than exposing backend complexity.

A task is not done because code compiles or a deployment exists.

Done requires:
- requested behavior/artifact exists;
- relevant verification ran;
- source authority is preserved;
- security/privacy impact is acceptable;
- evidence exists;
- rollback/recovery is known when material;
- docs/contracts are updated;
- no claim exceeds observed evidence.

## Risk boundaries

No unapproved:
- destructive data deletion;
- payment or money movement;
- legal/compliance commitment;
- reservation cancellation or material guest-impacting change;
- permission expansion;
- secret exposure;
- production migration without reviewed validation and recovery path.

## Continuous improvement

After every material task, consider whether there is a high-value improvement in:
- reusable capability/skill;
- system configuration;
- automation;
- cost;
- revenue/service;
- privacy/security;
- simplification;
- duplicate-system removal;
- future portability.

Only surface/apply improvements that materially help; do not create noise or speculative complexity.

When the same error or confusion occurs twice:
1. identify root cause;
2. prefer a durable contract, test, schema rule or automation;
3. update the appropriate canonical source;
4. add regression protection;
5. measure whether the recurrence stops.

Do not solve repeated systemic problems by making prompts longer forever.


## General Plan rule

`docs/product/TORO_BRAIN_GENERAL_PLAN.md` is the sole canonical Plan General.

Historical documents whose titles contain words such as `Master Brain`, `Master Plan`, `Control Board`, `Engine`, `System`, or `Dashboard` do **not** become current authority by name. Resolve them through `toro-context.yaml`, the canonical General Plan, `operations.projects`, and current contracts before acting. A historical/merged document is evidence only unless explicitly reactivated through the canonical project/module.

All new material work must:
- map to a scope;
- map to an existing TORO subsystem or justify why one cannot own it;
- classify itself as CURRENT, TARGET, NEXT or FUTURE;
- check for duplicate projects/plans/implementations;
- update the Plan General when the program direction materially changes.

Domain plans and implementation plans are subordinate. They may not become parallel master plans.

If a new request is reusable, preserve the immediate business solution and separately extract the reusable TORO capability/skill/profile without leaking private scope data.
