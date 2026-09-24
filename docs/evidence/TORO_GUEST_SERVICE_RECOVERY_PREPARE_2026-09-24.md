# TORO — Guest Service Recovery Prepare-Only Proof — 2026-09-24

**Workflow:** Product Proof #8 — In-stay request / complaint -> service recovery  
**Owners:** TERE + RICO + TORO Comms  
**State after this change:** PREPARED / PREPARE-ONLY  
**Guest sends enabled:** NO  
**Internal task write executed by this contract:** NO

## Reused canonical building blocks

This preparation reuses:
- TORO Comms lifecycle/identity routing;
- existing `guest.issue_handoff` capability;
- canonical `POST /api/brain/internal-work` contract;
- canonical `operations.tasks` as eventual task authority;
- RICO for maintenance routing;
- TORO Operations for operational fulfillment.

No second guest CRM, message store, task engine or service-recovery table is introduced.

## Implemented preparation contract

Code:
- `src/features/guest/service-recovery.ts`

Tests:
- `src/features/guest/service-recovery.test.ts`

Input includes:
- stable source event key;
- service category;
- summary;
- optional location;
- optional detail;
- urgency;
- guest language;
- optional due date.

Output includes two bounded artifacts:

### Internal work
A validated canonical TORO internal-work request:
- maintenance -> `maintenance.task` -> RICO;
- other service issues -> `task.create`;
- deterministic `guest:<sourceEventKey>` idempotency key;
- evidence required;
- operational proof required before completion.

### Guest reply
A brief reply draft in ES/EN/PT:
- acknowledges the issue;
- avoids claiming resolution;
- promises an update only after verified progress;
- remains `draft_only`.

## Safety properties

The contract explicitly reports:
- `externalSend=false`;
- `internalWriteExecuted=false`;
- `workflowState=prepared`.

It does not:
- contact a real guest;
- create a task by itself;
- mark an incident resolved;
- infer room readiness;
- expose payment/reservation data;
- bypass source authority;
- bypass internal-work role/RLS gates.

## Next proof

Before RUNNING:
1. resolve a synthetic/disposable or explicitly authorized guest-service event;
2. verify channel identity/context;
3. call this preparation contract;
4. pass the resulting internal-work request through the existing governed intake;
5. prove one canonical task is created once despite replay;
6. capture operational evidence;
7. verify closure;
8. prepare/send guest follow-up only through an authorized channel path;
9. verify no duplicate shadow task/message exists.

A real guest should not be used merely to prove orchestration plumbing.
