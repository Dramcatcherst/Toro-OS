# TORO People — Schedule Change Prepare-Only Proof — 2026-09-24

**Workflow:** Product Proof #3 — Shift / schedule request or change  
**State after this change:** PREPARED / PREPARE-ONLY  
**Runtime writes enabled:** NO  
**Employee rollout enabled:** NO  
**Schedule mutation enabled:** NO

## Existing canonical data

Observed in canonical Supabase:
- `public.shift_assignments`: 271 rows;
- `public.schedule_change_requests`: 0 rows;
- `public.shift_swap_requests`: 0 rows;
- `public.employee_availability`: 0 rows;
- `public.approval_requests`: 1 row.

The existing request tables already use the common envelope:
- `org_id`;
- `employee_id`;
- `data jsonb`;
- `status`;
- `version`;
- audit timestamps / actor ids.

No new schedule/request table is required.

## Implemented preparation contract

Code:
- `src/features/people/schedule-change.ts`

Tests:
- `src/features/people/schedule-change.test.ts`

The pure adapter converts a bounded user intent into a prepared candidate for:
- `public.schedule_change_requests`.

It records:
- current `shift_assignment` id + version;
- current shift snapshot;
- requested shift change;
- reason;
- requesting user;
- request timestamp;
- deterministic request key;
- `approval_required=true`;
- `execution_mode=prepare_only`;
- `workflow_state=prepared`.

## Safety properties

The helper:
- performs no database write;
- performs no shift mutation;
- performs no approval;
- does not contact an employee;
- does not create a second schedule system;
- rejects no-op changes;
- rejects malformed date/time/reason inputs;
- includes the source assignment version in the request key so a later write path can detect stale assignment changes.

## Next proof

Before any write is enabled:
1. verify employee identity/user link;
2. load the current assignment through authenticated RLS;
3. prepare request;
4. human review/confirmation;
5. insert one request through a governed server action;
6. verify the request is visible only to the correct employee/authorized manager;
7. route approval without mutating `shift_assignments`;
8. separately prove the approved mutation path and rollback.

The first controlled proof must use a synthetic/disposable or explicitly authorized employee context. Broad employee rollout remains blocked.
