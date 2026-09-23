# TORO Systems Recovery Proof — Preview Build Incident

**Date:** 2026-09-23  
**Product Proof workflow:** #11 — System/connector incident -> recovery evidence  
**Scope:** canonical TORO Brain repository / Vercel preview  
**Classification:** PREVIEW / DEVELOPMENT RECOVERY PROOF — not a production outage

## Incident

During PR #113, the initial head commit:

`b7057a0380fc0dd15750e616c7d27a409caf73c4`

produced:
- Vercel deployment state: **FAILURE**;
- canonical GitHub CI run #452 did not complete successfully for that head.

The failure occurred while adding readiness ordering to the conversational menu state model.

## Diagnosis / correction

The menu availability priority map needed to cover every state represented by the resolved menu type.

The follow-up fix added the missing `HIDDEN` state to the priority mapping and preserved `UI` as a separate lowest-priority navigation state.

Fixed head:

`8edd570421881405f79e600a4dcfef2bc09065bc`

## Recovery evidence

For the corrected head:
- GitHub TORO Brain CI run #453: **SUCCESS**;
- Vercel: **SUCCESS**;
- tests: PASS;
- lint: PASS;
- build: PASS;
- PR #113 subsequently merged;
- merge commit: `0ffc183c4c4a56c56d97bc70807a125fcd8a46cd`.

## What this proves

TORO's development delivery loop can:
1. observe a deployment failure;
2. keep the failing change outside main;
3. diagnose the incompatible state model;
4. apply a bounded correction;
5. rerun validation;
6. require green CI/deployment before merge;
7. preserve the stable production branch during the failed preview.

This is real recovery evidence for the software delivery path.

## What this does NOT prove

It does not prove:
- recovery from a production outage;
- OpenClaw runtime recovery;
- connector reconnection/retry behavior;
- external provider outage handling;
- automated rollback;
- MTTR under production SLA;
- customer-visible incident communication.

Therefore Product Proof workflow #11 remains RUNNING, not VERIFIED.

## Next production-grade proof

Capture one real degraded-runtime or connector incident with:
- detection timestamp;
- affected subsystem;
- user/business impact;
- health evidence;
- attempted recovery;
- rollback/fallback if needed;
- restoration timestamp;
- post-recovery verification;
- whether owner intervention was required.

Prefer an incident that is safe to observe naturally. Do not create a production outage merely to obtain proof.
