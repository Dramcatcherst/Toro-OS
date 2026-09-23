# TORO Autonomy & Action Model V1

**Date:** 2026-09-23  
**Status:** canonical subordinate specification  
**Plan:** `docs/product/TORO_BRAIN_GENERAL_PLAN.md`  
**Cognitive model:** `docs/product/TORO_BRAIN_COGNITIVE_OPERATING_MODEL_V1.md`

## 1. Decision

TORO uses one canonical **workflow autonomy ladder: A0–A6**.

Historical `L0–L5` labels from TORO Tools are retained only as a **legacy action/risk shorthand** for compatibility with existing Airtable records and older documents. They are not the current autonomy model and must not be compared numerically with A-levels.

An agent never receives a global permission merely because its row says L1/L2/L3.

## 2. Canonical workflow autonomy

| Level | Meaning | External/state-changing effect |
|---|---|---|
| A0 | OBSERVE — read/monitor | none |
| A1 | EXPLAIN — summarize/diagnose with evidence | none |
| A2 | RECOMMEND — propose options/priorities | none |
| A3 | PREPARE — draft/configure/prepare without external impact | no unapproved external impact |
| A4 | EXECUTE_WITH_APPROVAL — execute after the defined explicit approval gate | yes, only approved action |
| A5 | BOUNDED_AUTONOMY — automatic execution inside hard pre-approved limits | yes, bounded/reversible/observable |
| A6 | CLOSED_LOOP_PRO — monitor, choose among approved strategies, execute, verify, learn and adjust within policy | yes, closed loop inside policy |

A5/A6 are earned **per workflow**, never per personality or agent globally.

High-risk classes may remain A4 human/professional-gated indefinitely.

## 3. Legacy action classes

Historical TORO Tools labels remain interpretable only as action classes:

| Legacy | Historical meaning | Canonical interpretation |
|---|---|---|
| L0 | observe/search/read | action class compatible with A0/A1 depending whether TORO only reads or also explains |
| L1 | prepare/draft | action class generally handled at A3; recommendation alone may be A2 |
| L2 | low-risk internal write | requires A4 explicit approval or A5 bounded policy depending the workflow |
| L3 | external/reversible action | requires A4 approval or a specifically earned A5 bounded workflow |
| L4 | high-risk | normally A4 with explicit human/professional approval; may be prohibited from A5/A6 by policy |
| L5 | prohibited/unsupported | not an autonomy level; action is unavailable regardless of A-level |

**There is intentionally no 1:1 numeric translation.**

## 4. Effective authority

For every attempted action:

```
effective_authority =
  authenticated_identity_scope
  ∩ role_and_tenant_permissions
  ∩ canonical_agent/workflow_policy
  ∩ connector/tool_permission
  ∩ workflow_autonomy_A_level
  ∩ action_risk_gate
  ∩ source_authority_and_freshness
  ∩ runtime_capability_and_health
```

The most restrictive applicable gate wins.

A prompt, persona, model or old `autonomy_ceiling` value cannot expand this result.

## 5. Airtable compatibility

Existing `agents.autonomy_ceiling` values such as L1/L2/L3 are **legacy compatibility metadata**.

Rules:
- do not delete historical values merely to make the table look current;
- do not use the value as executable permission;
- do not infer A-level by matching the number;
- effective autonomy is resolved from the workflow and current policy;
- new policy/configuration should use A0–A6 terminology;
- legacy `write_ceiling` strings should be migrated opportunistically when the related policy is touched.

## 6. Current default envelopes

These are not permission grants. They describe the current intended default behavior before workflow-specific promotion.

### TORO
- normal reasoning: A0–A3;
- approved action: A4 when an explicit connector/workflow gate exists;
- A5/A6 only for individually proven workflows;
- founder, legal, money, destructive, privilege and material public commitments remain gated as policy requires.

### TERE
- normal guest reasoning/draft: A0–A3;
- routine sends/actions: A4 until a specific low-risk workflow earns A5;
- refunds, cancellations, reservation mutations, unusual discounts, payment commitments and sensitive complaints remain gated.

### RICO
- analysis, task preparation and readiness planning: A0–A3;
- verified low-risk digital workflow writes may reach A4/A5 per workflow;
- physical execution is human unless a separate machine/automation workflow exists;
- reservation, safety-critical, disciplinary, contractual and material spend actions remain gated.

### FIONA
- analysis/reconciliation/preparation: A0–A3;
- governed low-risk metadata writes may execute at A4 and later A5 if proven;
- money movement, tax filing, payroll approval/payment, binding accounting/legal actions remain human/professional-gated.

### SKY
- research, offer/campaign/content preparation: A0–A3;
- publication/campaign changes: A4 unless a bounded reversible workflow earns A5;
- spend/billing, contractual provider commitments and unverified public claims remain gated.

### SOBRESITO
- inspect/design/prepare/build on isolated branch: A0–A3;
- approved reversible system changes: A4;
- A5 only for tested low-risk automation with rollback/observability;
- destructive migration, production-risk deployment, permissions, secrets/security and domain/account ownership remain gated.

## 7. Promotion evidence

A workflow cannot move upward because an agent “seems reliable.”

Promotion requires the cognitive-model gate, including:
- exact owner/purpose;
- source/authority map;
- stable process;
- baseline;
- measurable success/failure;
- least privilege;
- exception path;
- normal/edge/conflict/denial evals;
- evidence from lower autonomy;
- reliability/error threshold;
- monitoring/audit;
- tested recovery/rollback;
- owner/policy authorization.

## 8. Demotion

Autonomy automatically reduces or suspends when:
- source freshness/health breaks;
- configuration drift appears;
- error/anomaly rate exceeds threshold;
- repeated human overrides occur;
- business rule changes materially;
- permissions are ambiguous;
- new legal/security risk appears;
- outcome degrades without explanation;
- observability/evidence breaks;
- an incident reveals an unmodeled failure class.

## 9. Status truth

`configured` ≠ `implemented` ≠ `deployed` ≠ `runtime verified` ≠ `autonomy earned`.

The current agent/skill program remains:
- contract-supported;
- static Steward observed in CI;
- runtime evaluation pending for the six canonical skills;
- no global A5/A6 granted by this specification.
