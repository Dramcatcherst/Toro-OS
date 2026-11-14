# Inspection approval invalidation — draft, 14 November 2026

Status: code and isolated PostgreSQL proof; not applied to Supabase, not physical QA.

## Problem and result

A captured PASS could retain supervisor approval after its evidence or acceptance criterion changed. The existing AFTER trigger did not watch criteria, so a BEFORE reset alone would leave round/execution aggregates stale.

The draft resets captured results and approval to pending when material evidence, criteria, area/check identity or eligibility change. It clears capture and supervisor fields even if the same UPDATE tries to set PASS and approved again. A record bound by its OLD capture/result/approval cannot change organization, property, round, room or target references in that UPDATE; it receives SQLSTATE23514 and the fixed message INSPECTION_CAPTURE_SCOPE_IMMUTABLE.

An explicit reset to pending clears the current binding before a later scope edit. This is not permanent historical immutability. Existing authorization and row-level security remain responsible for who can edit or approve.

A first capture from pending can still submit evidence with PASS. Supervisor approval remains a separate existing gate. Display-only block_label/check_order edits preserve capture. source_ref, failure_action and carry_forward_mode are outside this correction; they are not certified harmless for every workflow.

The single AFTER trigger watches the necessary material columns and invokes the unchanged apply_inspection_check_result() only when its watched tuple changes. This deliberately hardens no-op writes, including the seven previously watched columns: SET result_status=result_status no longer triggers aggregation or closure. A consumer that relied on such a replay must be reviewed before deployment. The repository search in src/scripts found only inspection_field_capture_v reads in src/features/menu/server.ts, not an inspection writer; this is not an inventory of external SQL/clients.

## Source guards and rollback

The apply and rollback scripts take a short exclusive table lock inside one transaction. They reject unexpected function/view definitions, either disabled/non-origin trigger, missing/internal/misbound triggers or a changed BEFORE trigger definition. They never re-enable a disabled live trigger.

| Object | Original MD5 | Candidate MD5 |
| --- | --- | --- |
| facilities.prepare_inspection_check() | 7eb6c9ef5af1aa432dba15cae71be4a1 | fc43eac7bb405df5abe872cfb80efa01 |
| AFTER trigger | 051e84e1b05f6b0912d4cf4bd97f6931 | c8963800798e558112f4b654b5eae63e |
| BEFORE trigger | 27825c57c42b15f7047380fbf1b88542 | unchanged |
| facilities.apply_inspection_check_result() | 39ac301caeb60da33da322e735e59673 | unchanged |
| facilities.inspection_field_capture_v | 3ac5ecf445854fb1e3880d6a9b860bda | unchanged |
| operations.room_operational_gate | a93f507a531d04ac0ed9e3c9352cdc0e | unchanged |

View hashes use pg_get_viewdef(regclass,false); function hashes use pg_get_functiondef; trigger hashes use pg_get_triggerdef(oid,true). Fresh read-only source metadata showed both triggers origin-enabled and correctly bound on 14 November.

Rollback restores the exact original function and AFTER trigger only when the reviewed candidate is still present. It restores the known old behavior and does not reconstruct prior rows or approvals; any pending records need normal authorized recapture. No CASCADE, new table/column/role/grant or auto-close flag/policy is introduced.

## Reproduce the real PostgreSQL proof

The existing SQL/psql style is used with a disposable PostgreSQL17 container. No external DATABASE_URL is accepted. The container has network=none, no published port and tmpfs data; the wrapper removes it on exit.

```sh
docker pull postgres@sha256:d3244e8ce3f165ee3c93d9c4a4b1d0fe48b3a89e2287b717fdcbbde92d405065
bash tests/sql/inspection_approval_invalidation.sh
```

The fixture uses synthetic rows and the original functions and views. The original engine fails26/31 regression cases; the candidate passes31/31. The wrapper also proves disabled BEFORE/AFTER rejection without re-enablement, misbinding rejection, repeat-apply rejection, disabled-trigger rollback rejection and exact rollback/source preservation. Additional area_label/check_key cases first failed2/31 against the earlier candidate, then passed after the minimum correction.

These are real PostgreSQL BEFORE/AFTER trigger and view executions, not predicate-only models. They do not test production RLS, real user roles, concurrent external consumers, maintenance chronology, current physical state or hotel release.

## Existing ownership and remaining gates

This continues the existing housekeeping handoff/preflight and Systems remediation, under the single General Plan. It does not activate the inactive turnover SOP, alter Kross, release a room or close a maintenance incident.

Before application: review exact diff/version and external writer assumptions, verify production RLS/privileges and the scoped real-identity path, preserve exact source/trigger preimages and rollback, then approve the guarded application separately. Afterwards perform one authorized physical handoff using fresh Kross cleaning evidence without requesting a duplicate cleaning confirmation.

The separate critical-priority visibility issue and QA-after-repair chronology defect remain open. Portal acceptance and production publication are independent.
