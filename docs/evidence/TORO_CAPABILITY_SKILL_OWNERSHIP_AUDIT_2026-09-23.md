# TORO Brain — Capability & External Skill Ownership Audit — 2026-09-23

**Canonical agent contract:** `docs/product/TORO_AGENT_AND_SKILL_SYSTEM_V1.md`  
**Capability mapping:** `data/toro_agent_capability_ownership_v1.json`  
**External skill policy:** `data/toro_external_skill_adapter_policy_v1.json`

## Executive result

- Catalog capabilities audited: **54**
- Capability families: **21**
- Orphan capabilities: **0**
- New agents required by current catalog: **0**
- Current ChatGPT platform skills observed: **254**
- Platform skills imported into TORO canonical registry by this audit: **0**

## Primary-agent distribution

| Agent | Primary capabilities |
|---|---:|
| TORO | 27 |
| FIONA | 9 |
| SOBRESITO | 6 |
| RICO | 5 |
| SKY | 4 |
| TERE | 3 |

This distribution does **not** mean TORO executes 27 specialist jobs. It means many personal, portfolio, Comms, Projects, Governance and Knowledge capabilities remain under the one visible TORO interface/orchestrator. Domain work still routes to specialist owners.

## No-new-agent decision

The current 54-capability catalog does not justify:
- a Revenue agent;
- a Research agent;
- a Knowledge agent;
- an Assets agent;
- a Channels agent;
- a People agent;
- a Governance agent;
- a separate Builder/Codex business agent.

These remain subsystems/capabilities/workflows. Create a durable specialist only if a persistent context, permission, evaluation or specialized-judgment boundary cannot fit the six current agents.

## Important ownership resolutions

### Revenue
`revenue_dashboard` -> TORO owns cross-domain revenue interpretation.
- FIONA: economics/accounting implications.
- TERE: conversion/direct-booking funnel.
- SKY: demand/market/campaign signals.
No separate Revenue persona required.

### People
Private HR/payroll/self-service -> FIONA.
Operational coverage/readiness -> RICO.
Leadership, recognition, learning priorities -> TORO.
No People persona required.

### Knowledge / Research
Business search and knowledge answers -> TORO as visible reasoning/router.
Market research -> SKY for commercial demand.
Technical research -> SOBRESITO when systems-specific.
No Knowledge/Research persona required.

### Assets
`asset_search` -> SOBRESITO owns governed retrieval/identity/source mechanics.
SKY owns commercial selection/creative use.
RICO owns physical-reality correction/re-take trigger.
No Assets persona required.

### Guest
TERE owns:
- guest assistant;
- guest reply drafting;
- guest handoff.
SKY owns experiences as a commercial product; TERE sells/curates to the guest; RICO fulfills; FIONA checks economics.

### Systems
SOBRESITO owns:
- tool connections;
- system health;
- connector health;
- backup/recovery;
- builder queue;
- asset retrieval mechanics.
CODEX stays an implementation tool.

## Consolidation families

The 54 user-visible capabilities collapse into 21 families rather than 54 independent skills/products.

Examples:
- `toro_entry`: ask_toro + direct_toro.
- `comms_coordination`: team_messages + handoffs + message_to_task + notifications.
- `people_self_service`: shifts + attendance + leave + payroll + employee profile.
- `operations_readiness`: issue reporting + maintenance + housekeeping + inspections.
- `guest_lifecycle`: guest assistant + reply drafting + handoff.
- `finance_control`: exceptions + invoices + payment calendar + reconciliation.
- `systems_reliability`: system health + connector health + backup/recovery.
- `personal_productivity`: tasks + calendar + email + contacts + travel + personal projects.

This prevents capability names from becoming duplicate agent identities.

## External skill audit

Current ChatGPT skill surface exposed **254** platform skills. These are treated as a **dynamic adapter ecosystem**, not as TORO-owned skills.

### High-value reuse families

- Data Analytics -> TORO/FIONA, with SKY/RICO support.
- Creative/Canva/Figma/Fal/Higgsfield-like tools -> SKY; SOBRESITO supports technical delivery.
- Ads Manager -> SKY; spend/activation gated.
- Sales -> SKY/TORO for B2B partnerships/business cases; **not** the default TERE guest-sales brain.
- Supabase/Vercel/Superpowers/Fallow/Airtable/Notion/build tools -> SOBRESITO.
- Convex/Wix -> conditional only if the actual project uses/requests that stack.
- Documents/Sheets/PDF/Presentations/Google Drive -> artifact adapters under the domain owner.
- PostHog -> SOBRESITO with SKY/TORO for interpretation.

## Anti-skill-explosion rules

1. A platform skill is not a TORO skill merely because it is available.
2. Availability does not create architecture.
3. TORO discovers external skills on demand.
4. External skills inherit the current agent's scope/authority.
5. External skill prompts never override canonical source truth.
6. Mutation-capable skills use approval/idempotency/evidence/rollback gates.
7. Vendor-specific skills require the vendor/project to be relevant.
8. Generic Sales does not override TERE hospitality behavior.
9. Creative skills cannot fabricate property truth or rights.
10. Repeated dependency requires evaluation + fallback + exit path.

## Delivery-shape decision

Capabilities should not all become SKILL.md files.

Use:
- **surface** for entrypoints such as ask/direct TORO;
- **capability** for broad user-facing access like guest assistant or portfolio;
- **skill** for reusable judgment/reasoning like guest reply, market research or finance exceptions;
- **workflow** for repeatable state transitions/actions like leave requests, maintenance, invoices, backups;
- **composite** when a capability intentionally combines judgment + workflow + multiple systems.

This classification is stored per capability in the mapping JSON.

## Remaining work

### NEXT
1. Use the ownership map in TORO routing tests.
2. Test wrong-agent prompts from the 60-case suite against runtime once accessible.
3. Build/verify only the subskills that repeated evaluation proves valuable; do not pre-create 21 skill files.
4. Add capability-level KPIs only where a real workflow exists.
5. Keep the platform skill catalog dynamic instead of mirroring 254 records into TORO.

### BLOCKED / UNVERIFIED
- actual local Codex/OpenClaw skill inventory;
- exact skill versions/checksums;
- runtime use of the capability ownership map;
- runtime outputs for 60-case suite.

No new agent, database, project or runtime was created by this mapping.
