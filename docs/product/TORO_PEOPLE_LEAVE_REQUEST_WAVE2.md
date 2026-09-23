# TORO People — Leave Request Wave 2

**Status:** IMPLEMENTATION CANDIDATE  
**Date:** 2026-09-23  
**Branch:** `feat/toro-people-leave-request-wave2-20260923`  
**Master:** TORO Brain General Plan

## Goal

Let an authenticated employee create their own vacation/leave request from the TORO Portal without recreating DreamTeam identity, approval or payroll logic.

## Canonical flow

`TORO context -> validation -> submit_leave_request RPC -> leave_requests audit trigger -> notification -> manager/HR review`

Creating a request is not approval.

## Identity rule

The browser does not submit `employeeId`.

TORO derives:
- user;
- organization;
- employee link

from the active `ToroResolvedContext`.

The RPC independently checks:
- active/leave employee belongs to org;
- target employee equals `private.current_employee_id(org)` unless caller is ADMIN/RRHH.

## Existing RPC reused

`public.submit_leave_request`

Verified behavior:
- SECURITY DEFINER;
- fixed empty search_path;
- authenticated EXECUTE;
- allowed leave types;
- valid date ordering;
- maximum date range;
- reason minimum;
- overlap prevention against active/pending/approved workflow;
- inserts `pending_manager`;
- computes requested minutes;
- creates notification;
- returns request UUID.

## Existing evidence reused

`leave_requests` has:
- `leave_requests_audit` AFTER INSERT/UPDATE/DELETE -> `private.audit_change()`;
- `leave_requests_touch` for update timestamps.

No duplicate application audit log is added in this wave.

## Status model

TORO UI recognizes:
- pending;
- pending_manager;
- pending_hr;
- approved;
- rejected;
- cancelled.

Current production aggregate observed during design:
- 4 `pending_manager`;
- 1 `approved`.

The previous profile counter that recognized only `pending` is corrected in this wave.

## Included

- request validation;
- governed server submission;
- API endpoint;
- employee form;
- own request history;
- balance summary;
- safe workflow labels;
- navigation to `/toro/solicitudes`;
- tests proving client never supplies employee identity.

## Excluded

- manager approval/rejection;
- HR approval;
- balance override;
- payroll mutation;
- automatic vacation-balance deduction;
- cancellation/edit workflow;
- documents/medical evidence upload;
- production schema change.

## Security

- organization context required;
- employee link required;
- no service-role client;
- no direct INSERT from browser;
- no caller-supplied employee identity;
- RPC is the governed write boundary;
- raw SQL errors are mapped to safe user messages;
- DB audit trigger remains evidence authority.

## Exit gate

Before merge:
- Vitest PASS;
- lint PASS;
- build PASS;
- Vercel preview PASS;
- branch aligned with Phase 1;
- no production mutation performed by CI/test.

After merge:
- hosted real-user write remains a separate pilot action;
- do not use an employee's real leave record as an automated test fixture;
- broader rollout only after representative employee QA.
