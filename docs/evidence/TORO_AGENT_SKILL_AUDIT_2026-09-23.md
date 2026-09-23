# TORO Brain — Agent & Skill Audit — 2026-09-23

**Scope:** canonical TORO agent registry, business profiles, policies, contexts, historical hospitality skills, current capability catalog and current ChatGPT-visible skill surface.  
**Plan:** `docs/product/TORO_BRAIN_GENERAL_PLAN.md`  
**Canonical agent/skill contract:** `docs/product/TORO_AGENT_AND_SKILL_SYSTEM_V1.md`

## Executive result

### HECHO
- Airtable canonical registry contains 7 agent records: 6 ACTIVE (TORO, TERE, RICO, FIONA, SKY, SOBRESITO) + CODEX ARCHIVED.
- Before this pass TORO and TERE had deep behavior profiles while RICO/FIONA/SKY/SOBRESITO had only 66–82 characters of instruction text.
- This pass applied differentiated V2 profile contracts to all six active agents.
- TERE profile was cleaned so mutable staffing/pricing/policy facts are no longer embedded as persona truth; dynamic facts must resolve from current authority.
- GitHub now contains `TORO_AGENT_AND_SKILL_SYSTEM_V1.md`.
- `toro-context.yaml` now indexes the agent/skill contract and canonical skill aliases.
- Airtable now contains policy `POLICY-TORO-AGENT-SKILL-SYSTEM-V1`.
- Four durable learning rules were added for profile truth, entity separation, skill maturity/triggers and accountable handoffs.
- Existing Agent Steward issue #30 remains the work item; no parallel issue/project was created.

### SKILL/CAPABILITY INVENTORY
Historical 2026-08-09 hospitality skill design defined six skill packages:
1. `toro-os-hospitality`
2. `tere-guest-sales`
3. `rico-hotel-operations`
4. `fiona-hotel-finance`
5. `sky-experiences-growth`
6. `sobresito-hotel-systems`

Current canonical contract names:
1. `toro-brain`
2. `tere-revenue`
3. `rico-operations`
4. `fiona-finance`
5. `sky-growth`
6. `sobresito-systems`

Historical names remain aliases/reference. Alias does not create another skill.

The repository capability catalog currently contains **54 capabilities**:
- 19 `implemented_foundation`
- 19 `partial`
- 15 `specified`
- 1 `planned`

No catalog entry is currently classified as `runtime_verified` or `measured`; therefore status must not be interpreted as end-to-end proof.

Current ChatGPT `skills` surface returned **no TORO/TERE/RICO/FIONA/SKY/SOBRESITO custom skill URIs**. This proves only that custom TORO skills are not exposed through this current ChatGPT skill surface; it does not prove absence from Mauricio's local Codex/OpenClaw environment.

Notion saved Skills search returned 0 active Skills (the workspace can create Skills). Notion Custom Agent search is unavailable on the connected plan (Business-plan gate), so Notion agent inventory is not a verified runtime source in this audit.

## Profile audit after changes

| Agent | Distinctive lens | Canonical skill | Profile state |
|---|---|---|---|
| TORO | second-order whole-business reasoning | `toro-brain` | APPLIED_CONFIG |
| TERE | guest fit sensing / low-friction conversion | `tere-revenue` | APPLIED_CONFIG |
| RICO | pre-failure operational detection | `rico-operations` | APPLIED_CONFIG |
| FIONA | reconciliation without self-deception | `fiona-finance` | APPLIED_CONFIG |
| SKY | commercial productization of context | `sky-growth` | APPLIED_CONFIG |
| SOBRESITO | reversible/observable systems engineering | `sobresito-systems` | APPLIED_CONFIG |
| CODEX | governed technical implementation tool | n/a as durable persona | ARCHIVED_AGENT_RECORD / TOOL_ROLE |

`APPLIED_CONFIG` does not mean runtime parity.

## 20 improvements applied

1. Distinct voice fingerprint.
2. One signature framing question per agent.
3. One unique superpower per agent.
4. One signature value-add move per agent.
5. Explicit anti-pattern / never behavior.
6. Single primary owner + support/route discipline.
7. Canonical skill names with migration aliases.
8. Positive and negative skill triggers.
9. Skill evidence maturity states.
10. Output/done/failure contract.
11. Minimum context budget; no volatile truth in profiles.
12. Freshness gate for dynamic facts.
13. Explicit contradiction protocol.
14. Correct abstention counts as successful behavior.
15. Standard accountable handoff envelope.
16. Consequential-action preflight (authority, permission, freshness, idempotency, rollback, evidence).
17. Outcome-based KPIs instead of activity metrics.
18. Governed learning promotion from correction to measured rule.
19. Merge/retire discipline with dependency and rollback proof.
20. Agent Steward optimization loop with self-permission/self-approval recursion blocked.

## Important ownership corrections

- SKY owns demand/brand/content/growth/product opportunity; TERE owns guest conversion/service.
- SOBRESITO owns systems architecture/reliability; CODEX is an implementation tool under TORO/SOBRESITO, not business authority.
- RICO owns physical/operational readiness; TERE communicates guest impact.
- FIONA owns finance/admin evidence/reconciliation; TERE communicates guest-facing payment/refund matters only within policy.
- TORO owns cross-domain trade-offs, portfolio orchestration and final routing, not every specialist task.

## Remaining gaps

### BLOCKED / UNVERIFIED
1. Direct runtime installation/version/hash for the six canonical skill contracts.
2. Runtime consumption of updated Airtable profiles.
3. FIONA and SOBRESITO local skill installation evidence in the current accessible sources.
4. End-to-end evaluation matrix with positive + negative triggers for all six.
5. Outcome telemetry for skill quality, cost, rework and correct abstention.
6. Agent Steward runtime remains `documented_not_deployed`.
7. OpenClaw runtime agent/skill inventory still requires direct host audit.
8. Dropbox connector remained unavailable in this ChatGPT session during related source audits.
9. Notion Custom Agent inventory is unavailable on the connected Notion plan.

## Next verification order

1. Read local/runtime skill inventory from the actual Codex/OpenClaw host.
2. Resolve exact canonical skill name, version and checksum for each specialist.
3. Run 10-case evaluation per agent/skill:
   happy path, missing data, conflict, unauthorized action, handoff, wrong-agent trigger, urgent case, privacy/isolation, runtime/tool failure, correction/learning.
4. Record results without expanding autonomy.
5. Reconcile aliases and retire duplicated local skills only after dependency proof.
6. Enable Agent Steward observation only after server-enforced scope/budget and independent evaluation exist.
7. Promote from config to runtime-verified only with direct evidence.

## Evidence created in this pass

- GitHub commit adding canonical spec: `6987f2a25443189237285978ff127e78c4f05f8f`
- GitHub commit registering spec/context: `e75e3a255deffedc340c2a3a787b579d28b8940a`
- Airtable policy: `POLICY-TORO-AGENT-SKILL-SYSTEM-V1`
- Airtable learning rules:
  - `agent_profiles_durable_behavior_only_v1`
  - `agent_skill_workflow_tool_runtime_separation_v1`
  - `skill_trigger_negative_trigger_maturity_v1`
  - `agent_distinctiveness_and_handoff_envelope_v1`

No production runtime activation, permission expansion, external publication, payment/reservation mutation or new agent/project was performed by this audit.


## Continuation — context, policy and runtime-knowledge hygiene

### 60-case evaluation contract
- Added `data/toro_agent_eval_cases_v1.json`: 60 synthetic cases, 10 per active agent.
- Added `docs/evidence/TORO_AGENT_EVAL_CONTRACT_COVERAGE_2026-09-23.md`.
- Contract/static result after profile hardening: 60/60 cases have explicit expected behavior; runtime-tested = 0/60; runtime-verified = 0/60.
- Added edge modes to all six profiles for urgency, missing data, tool/runtime failure, privacy and negative routing where applicable.

### Airtable context-pack cleanup
Before cleanup:
- 43 context packs total;
- 36 ACTIVE;
- 6 ARCHIVED;
- 1 DRAFT;
- at least one ACTIVE non-canonical agent key (`tere`);
- active packets contained stale mutable roster/commercial facts and old technical branch/PR/SHA routing.

After cleanup:
- 33 ACTIVE;
- 9 ARCHIVED;
- 1 DRAFT;
- **0 invalid ACTIVE agent keys**;
- **0 detected material stale-routing patterns** under the audit pattern set.

Reversible actions:
- normalized `TERE-ROOMS-TOURS-ROUTING-2026-07-18` to `AGENT-TERE`;
- cleaned mutable roster/rate/policy facts from `CTX-TERE-WESPEAK-KNOWLEDGE-LOAD-2026-06-11`;
- archived duplicate/stale `CTX-SOBRESITO-CODEX-EXECUTION-V1-20260825`;
- consolidated CODEX builder context into `ctx_codex_governed_builder` under `AGENT-SOBRESITO`;
- archived generic `CTX-PROMPT-CODEX-001`;
- archived obsolete `CTX-TORO-MANAGER-V1-ARCH-C-20260825`;
- refreshed FIONA, RICO, SKY and SOBRESITO generic prompt packs to current role contracts;
- removed stale August branch/PR/HEAD snapshot from active WeSpeak/Kross link-health context.

Learning rule added:
- `active_agent_context_routing_freshness_hygiene_v1`.

### Airtable policy-key normalization
Seven ACTIVE policy records used non-agent values in `agent_key` (`all_agents`, `all_tables`, `report_runs`, `website_generation`, `staff_directory`, `media_assets`).

They were normalized to real owners while preserving `scope` / `applies_to`:
- global governance/privacy/autonomy/report/media rules -> `AGENT-TORO-OS`;
- website generation gate -> `AGENT-SOBRESITO`;
- staff-directory privacy -> `AGENT-FIONA`.

Post-check:
- 37 ACTIVE policies;
- **0 invalid ACTIVE policy agent keys**.

### Supabase runtime-knowledge reconciliation
Read-only schema audit found no dedicated agent/skill/capability table in the main Supabase project. Existing `operations.knowledge_items` already supports `ai_behavior_rule`, so **no new table or agent registry was created**.

Existing records reconciled:
1. `toro_agent_architecture_v1`
   - version -> `TORO-AGENT-SKILL-SYSTEM-v1.1`;
   - six differentiated directors + canonical skill aliases;
   - 60-case contract coverage stored as 60 supported / 0 runtime tested / 0 runtime verified;
   - state explicitly `CONFIG_APPLIED_RUNTIME_UNVERIFIED`.

2. `wespeak_tere_compact_context_packet_2026_09_v1`
   - upgraded to compact-context v2;
   - always-loaded layer now contains behavior/authority/privacy only;
   - staff rosters, remembered prices/payment schedules, hardcoded hours/access/Wi-Fi/promotions and other variable facts moved to fetch-on-demand authority;
   - state `CONFIG_RECONCILED_RUNTIME_UNVERIFIED`.

3. `tere_guest_journey_contract_2026_09_v1`
   - journey stages remain durable;
   - check-in/out, promotions, menu/wellness and other changing facts now resolve from current authority;
   - TICOS is no longer hardcoded active; state is fetched from current promotion authority;
   - runtime consumption remains `UNVERIFIED`.

Rollback snapshot created before Supabase writes:
- `docs/evidence/TORO_AGENT_RUNTIME_KNOWLEDGE_PRECHANGE_2026-09-23.json`
- Git commit: `5fabd5f438a6ac4177bb131fce4fa5afbae72ab6`.

### Current verified boundary
Configuration/alignment is now materially cleaner across GitHub + Airtable + Supabase.

Still **not proven**:
- actual OpenClaw/Codex/WeSpeak skill loading;
- exact runtime profile version/hash;
- 60 synthetic outputs;
- runtime evaluator scores;
- Agent Steward runtime deployment;
- outcome telemetry.

Do not promote any agent or skill to `scenario_tested` / `runtime_verified` until the target runtime produces direct evidence.
