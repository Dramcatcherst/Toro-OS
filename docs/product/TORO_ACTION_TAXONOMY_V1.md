# TORO Action Taxonomy v1

**Status:** CURRENT SEMANTIC SEED  
**Date:** 2026-09-23  
**Owner:** TORO Governance + TORO Tools  
**Source:** mined/revalidated from legacy Dreamcatcher action-router evidence  
**Not a router:** yes

## 1. Purpose

Define a stable semantic vocabulary for common business requests without creating a second execution engine.

The taxonomy answers only:

> What kind of business action is being requested?

It does **not** answer:
- which system should execute it;
- which source is authoritative now;
- which connector is live;
- which agent owns it;
- whether the current user may perform it;
- whether it may execute automatically.

Those decisions remain runtime governance.

## 2. Runtime decision boundary

An action request must still evaluate:

`User + Context + Membership + Role + Tool Connection + Capability + Data Scope + Risk + Approval = Decision`

The taxonomy is input to that equation, not a substitute for it.

Canonical runtime owners:
- TORO Context / Identity — who and which organization;
- TORO Tools — what capability/connection exists;
- TORO Governance — risk, permission, approval and evidence;
- domain authority contracts — which source is authoritative;
- specialist workflow/agent — how the permitted work is prepared/executed.

## 3. Semantic action IDs

Current v1 seed:
- `guest_inquiry`
- `availability_quote`
- `reservation_change`
- `guest_payment`
- `guest_invoice`
- `supplier_invoice`
- `refund_or_chargeback`
- `social_publication`
- `website_change`
- `seo_content`
- `paid_campaign`
- `maintenance_incident`
- `purchase_request`
- `employee_onboarding`
- `attendance_or_payroll_exception`
- `legal_or_insurance`
- `access_or_secret_change`
- `new_app_or_connector`

Machine-readable contract:
`src/lib/action-taxonomy.ts`

## 4. Risk field

`defaultRisk` is a semantic baseline only.

It is not the final action risk.

Runtime policy may raise risk based on:
- external impact;
- money amount;
- legal effect;
- production/public impact;
- data sensitivity;
- destructive behavior;
- permission/security scope;
- irreversible state;
- current connector/tool posture.

Runtime policy must never reduce a high-impact action merely because its semantic default is lower.

## 5. Intent examples

Bilingual ES/EN examples are classification fixtures.

Rules:
- examples are not exact-command allowlists;
- wording match does not grant permission;
- ambiguous or unknown requests must fail closed or ask for clarification;
- explicit structured action type may be trusted only from an already-governed upstream process;
- no action may inherit authority from a phrase.

## 5.1 Deterministic semantic classifier

Canonical helper:
`classifyToroActionIntentText(request)`

Possible results:
- `matched`
- `ambiguous`
- `unclassified`

Rules:
- it only maps text to a semantic action ID;
- it never returns an execution system or source of truth;
- ambiguous requests fail closed;
- vague requests fail closed;
- returned evidence uses static taxonomy phrases, not the arbitrary input text;
- the result still passes through Context + Tools + Governance before any preparation or execution.

It is safe to use as a routing hint, never as permission.

---

## 6. What was intentionally NOT copied from legacy

Not imported as canonical truth:
- `execution_system`;
- `source_of_truth`;
- `owner_agent`;
- connection-status claims;
- personal account identities;
- credentials/secrets;
- historical autonomy mappings;
- stale connector registry state.

Those legacy fields were implementation evidence, not durable authority.

## 7. Legacy router disposition

Legacy `system-action-router` enforcement is **superseded** by canonical TORO architecture.

Reusable legacy value absorbed by this contract:
- action IDs;
- bilingual intent examples;
- fail-closed design principles;
- business-domain grouping ideas.

Any remaining legacy routing test may be ported only if it tests a canonical Governance/Tools rule rather than recreating the old engine.

## 8. Definition of done

The legacy action router is no longer required when:
1. semantic taxonomy is canonical;
2. required fail-closed cases are covered by canonical tests;
3. current domain/source authorities are resolved by TORO Data/Tools;
4. permissions/approvals are resolved by Context + Governance;
5. no production/runtime dependency points at the old router.

