# TORO Growth — Post-Stay Opportunity Prepare-Only Proof — 2026-09-24

**Workflow:** Product Proof #12 — Post-stay review / retention / revenue opportunity  
**Owners:** SKY + TERE + TORO Growth  
**State after this change:** PREPARED / PREPARE-ONLY  
**External sends enabled:** NO  
**Campaign activation enabled:** NO  
**Revenue attribution claimed:** NO

## Implemented contract

Code:
- `src/features/growth/post-stay.ts`

Tests:
- `src/features/growth/post-stay.test.ts`

The preparation contract requires:
- stable source event key;
- completed-stay timestamp;
- channel consent state;
- whether service recovery is still open;
- whether a review request was already made;
- whether a return invitation is eligible;
- guest language.

## Fail-closed rules

TORO prepares no growth action when:
- the stay has not completed;
- service recovery remains open;
- channel consent is unknown/denied;
- a review was already requested and there is no other eligible action.

This prevents:
- asking for a review while a guest issue is unresolved;
- duplicate review requests;
- sending without allowed consent;
- treating a draft or click as attributable revenue.

## Prepared outputs

When eligible, the contract may prepare:
- honest review request draft;
- return invitation draft.

Every action is:
- `sendState=draft_only`;
- `externalSend=false`;
- `attributionState=unattributed_until_observed_outcome`.

Measurement contract requires:
- baseline;
- observed outcome;
- no direct revenue claim until attribution evidence exists.

## Next proof

Before RUNNING:
1. resolve one isolated/authorized completed-stay lifecycle event from current authority;
2. resolve consent and unresolved-service state;
3. run this contract;
4. pass one draft through an authorized communication runtime only if policy allows;
5. prove no duplicate follow-up across channels;
6. observe review/return outcome;
7. measure result without false attribution.

A real guest should not be contacted merely to prove orchestration plumbing.
