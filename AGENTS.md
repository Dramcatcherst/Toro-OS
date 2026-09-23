<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — TORO Brain Product Contract

## Mandatory preflight

Before substantive work:

1. Read `START_HERE.md`.
2. Read `toro-context.yaml`.
3. Read `docs/product/TORO_BRAIN_GENERAL_PLAN.md`.
4. Read `docs/product/TORO_BRAIN_CONSTITUTION.md`.
5. Read `docs/product/TORO_BRAIN_MASTER_ARCHITECTURE.md` when scope/portfolio/product boundaries matter.
6. Identify whether the task changes product core, Dreamcatcher reference implementation, infrastructure, data, integrations or presentation.
7. Identify the source of authority for every material fact or write.
8. Map the request into the TORO Brain General Plan: scope, subsystem, CURRENT/TARGET/NEXT/FUTURE, priority and dependencies.
9. Inspect existing implementation before creating a second system.
10. Define verification and rollback before risky changes.
11. Run a generalization scan: could this become a reusable TORO capability/skill/profile without leaking scope-specific data?
12. Run a system-audit scan when the task touches a connected system: expected config, observed config, drift, health, permissions and recovery.

If a historical document conflicts with the current constitution or context contract, the current constitution wins unless the user explicitly supersedes it.

## Product architecture

TORO Brain is the master intelligence/memory/governance/orchestration layer. TORO OS is its business execution layer.

TORO Brain is built inside-out:

`identity/scope graph -> truth -> connectors -> intelligence -> execution -> governance/resilience -> continuous learning -> experience -> portfolio intelligence -> commercial presentation`

WhatsApp and TORO Portal are surfaces over the same governed TORO Brain. They are not independent databases or architectural foundations.

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

Official TORO identity uses the approved blue bull.

Verified current source artwork:
- `Dramcatcherst/toro-os-v88-new/public/assets/toro-azul-logo.jpg`
- registry entry `BRAND-005`
- approved V2 derived pack `public/assets/toro-blue-pack/`
- V1 pack is deprecated.

Do not generate, redraw, recolor or substitute another bull for official product identity.

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

All new material work must:
- map to a scope;
- map to an existing TORO subsystem or justify why one cannot own it;
- classify itself as CURRENT, TARGET, NEXT or FUTURE;
- check for duplicate projects/plans/implementations;
- update the Plan General when the program direction materially changes.

Domain plans and implementation plans are subordinate. They may not become parallel master plans.

If a new request is reusable, preserve the immediate business solution and separately extract the reusable TORO capability/skill/profile without leaking private scope data.
