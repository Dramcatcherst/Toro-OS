# TORO Autonomy Model Audit — 2026-09-23

**Canonical target:** `docs/product/TORO_AUTONOMY_AND_ACTION_MODEL_V1.md`  
**Current cognitive model:** `docs/product/TORO_BRAIN_COGNITIVE_OPERATING_MODEL_V1.md`  
**Legacy tool model:** `docs/product/TORO_TOOLS_V1.md`

## Finding

TORO currently contains two historical numbering systems that can be confused:

### Historical L model
Legacy TORO Tools action/risk shorthand:
- L0 observe/read
- L1 prepare/draft
- L2 low-risk internal write
- L3 external/reversible action
- L4 high-risk
- L5 prohibited/unsupported

Airtable `agents.autonomy_ceiling` currently retains:
- TORO: L3
- TERE: L2
- RICO: L2
- FIONA: L1
- SKY: L1
- SOBRESITO: L2
- CODEX archived: L3

Several active `agent_action_policies.write_ceiling` rows also still contain L1/L2/L3 strings.

### Current A model
Canonical workflow autonomy:
- A0 observe
- A1 explain
- A2 recommend
- A3 prepare
- A4 execute with approval
- A5 bounded autonomy
- A6 closed-loop Pro

## Risk

A direct numeric interpretation such as `L2 = A2` is wrong.

Examples:
- historical L1 = draft/prepare, which is usually A3, not A1;
- historical L2 = low-risk internal write, which needs A4 explicit approval or a specifically earned A5 bounded workflow;
- historical L3 = external/reversible action, which also requires A4/A5 depending the workflow;
- historical L4 is a risk class, not “more autonomy”.

If a runtime reads `agents.autonomy_ceiling` as a current A-level, it can either over-authorize or under-authorize actions.

## Decision

1. A0–A6 is the only canonical autonomy ladder.
2. L0–L5 is preserved only as legacy action/risk metadata.
3. Existing Airtable L values are not deleted; they are compatibility/history.
4. No numeric L-to-A translation is allowed.
5. Effective authority is calculated per workflow/action:
   identity/scope
   ∩ role permissions
   ∩ agent/workflow policy
   ∩ connector permission
   ∩ A-level
   ∩ action-risk gate
   ∩ source freshness
   ∩ runtime capability/health.
6. The most restrictive gate wins.
7. No agent receives global A5/A6.
8. High-risk workflows may remain A4 approval-gated permanently.

## Current default behavior

- TORO: A0–A3 normal; A4 only through explicit approved workflow; A5/A6 workflow-specific only.
- TERE: A0–A3 normal; routine sends stay A4 until a specific low-risk workflow earns A5.
- RICO: A0–A3 reasoning/preparation; physical execution remains human unless separately automated.
- FIONA: A0–A3 analysis/preparation; money/tax/payroll/legal execution remains gated.
- SKY: A0–A3 research/content/campaign preparation; publish/spend remains gated.
- SOBRESITO: A0–A3 inspect/design/build preparation; approved reversible system writes may use A4; A5 only after bounded verification.

These are envelopes, not new permission grants.

## Migration plan

### CURRENT
- document canonical A0–A6 semantics;
- mark L-levels as legacy action classes;
- add a P0 policy preventing numeric translation;
- update six primary permission-profile `write_ceiling` texts to A semantics;
- preserve historical rows.

### NEXT
- runtime adapters must expose effective A-level per workflow;
- evaluation records should capture A-level used;
- Agent Steward should flag new L-level writes or ambiguous permission strings;
- migrate legacy policy strings when touched.

### FUTURE
- once no runtime depends on `agents.autonomy_ceiling`, rename/deprecate the field through a reviewed schema migration rather than destructive cleanup.

## Status truth

This audit does not itself change production runtime authority.

It changes the canonical interpretation and prepares safe configuration cleanup.
