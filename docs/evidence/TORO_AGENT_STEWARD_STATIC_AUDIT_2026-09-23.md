# TORO Agent Steward — Static Architecture Audit Evidence — 2026-09-23

**Plan:** `docs/product/TORO_BRAIN_GENERAL_PLAN.md`  
**Contract:** `docs/product/TORO_AGENT_AND_SKILL_SYSTEM_V1.md`  
**Playbook manifest:** `data/toro_canonical_skill_playbooks_v1.json`  
**Audit script:** `scripts/agent-steward-static-audit.mjs`  
**Tests:** `tests/agent-steward-static-audit.test.mjs`  
**PR:** #79

## Intended state

`OBSERVE_STATIC_CI`

This is the first implemented Agent Steward layer. It is repository-contract observation only.

## Expected static invariants

- 6 canonical agents / parent skills.
- 17 internal playbooks.
- 54 catalog capabilities.
- 54 capabilities covered exactly once by a primary playbook.
- 0 orphan capabilities.
- 0 duplicate playbook assignments.
- 0 new agents requested by the current ownership map.
- 0 external platform skills imported into the canonical TORO registry.
- all 6 canonical agents remain present in the 60-case evaluation suite.
- canonical skill names and aliases do not collide.

## Failure dispositions

The Steward does not auto-fix or auto-create agents. It emits bounded dispositions:

- `MAP_EXISTING_CAPABILITY_OWNER_BEFORE_NEW_AGENT`
- `MERGE_OR_SELECT_SINGLE_PRIMARY_PLAYBOOK`
- `RESOLVE_ALIAS_COLLISION_PRESERVE_CANONICAL_IDENTITY`
- `REVIEW_AGENT_CANDIDATE_AGAINST_SKILL_WORKFLOW_REUSE_GATE`
- `REMOVE_PROVIDER_SKILL_FROM_CANONICAL_REGISTRY_USE_ADAPTER_POLICY`
- `RESTORE_EVAL_COVERAGE_BEFORE_PROMOTION`
- `NO_CHANGE`

## Boundaries

Not granted:
- runtime inventory access;
- OpenClaw/WeSpeak mutation;
- agent creation/retirement;
- skill promotion;
- permission/budget expansion;
- production data writes;
- self-approval;
- evaluator redefinition.

## Verification status

**VERIFIED / MERGED**

PR #79 was merged to canonical `main`.

- merge commit: `936794ee0f0b903078c7d9b8213aab2de649c926`
- TORO OS CI: PASS
- repository tests: PASS
- static Steward tests: PASS
- lint: PASS
- build: PASS
- workstation health: PASS
- Vercel preview: Ready
- mergeability before merge: true

Observed canonical static result:
- 6 canonical parent skills;
- 17 internal playbooks;
- 54/54 capabilities covered;
- 0 orphan capabilities;
- 0 duplicate playbook assignments;
- 0 new agents required by the current map;
- 0 platform skills imported into the canonical TORO registry.

This validates only `OBSERVE_STATIC_CI`. It does not grant runtime inventory, runtime mutation, skill promotion or autonomous agent lifecycle control.
