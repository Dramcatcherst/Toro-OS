# Los 50s de Caro — Team Claim Contract v1

**Status:** DRAFT FOR PILOT
**Date:** 2026-10-01
**Scope:** Los 50s participant/team assignment only. This is not a new TORO subsystem.

## Purpose

Prevent one participant from being simultaneously assigned to multiple active teams while allowing self-service team creation, release, movement, and provisional invitees.

## Canonical objects

### Participant
- participant_id
- canonical_name
- event_id
- status
- provisional
- current_team_id nullable
- updated_at
- version

### Team
- team_id
- event_id
- display_name
- created_by_participant_id
- status: active | dissolved
- created_at
- updated_at
- version

### Team membership
- membership_id
- event_id
- team_id
- participant_id
- state: active | released | moved
- claimed_by_participant_id
- claimed_at
- released_at nullable
- previous_team_id nullable
- version

### Receipt
Every claim/release/move must record:
- event_id
- action
- actor_participant_id
- subject_participant_id
- previous_team_id
- new_team_id
- outcome
- reason/conflict when applicable
- occurred_at
- correlation_id

## Invariants

1. A participant may have at most one ACTIVE membership for an event.
2. A claim succeeds only when the participant has no active team.
3. Claiming yourself is always allowed when unassigned.
4. Claiming another participant is allowed only when unassigned.
5. If already assigned elsewhere, fail closed with a conflict response. Never silently move.
6. Release removes the active assignment but preserves history.
7. Move is explicit: release old assignment + claim new assignment atomically.
8. Provisional invitees can be created by a participant but remain provisional until reviewed.
9. Provisional records may not overwrite a canonical participant with a similar name.
10. Name matching is never used for assignment authority; use participant IDs.
11. Public clients never receive private notes, payments, allergies, flights, solidarity data, or internal support status.
12. Every mutation is idempotent by correlation/request key where replay could duplicate work.

## Operations

### claim_participant(team_id, participant_id, actor_id, request_id)

Preconditions:
- event active
- actor allowed to edit target team
- participant exists in event
- no active membership exists for participant

Success:
- create ACTIVE membership
- set participant.current_team_id
- create receipt

Conflict:
- return 409 TEAM_MEMBERSHIP_CONFLICT
- include only safe display data needed to resolve conflict
- do not expose private team data

### release_participant(participant_id, actor_id, request_id)

Preconditions:
- active membership exists
- actor is the participant, team creator/editor, or authorized event admin

Success:
- mark membership released
- clear participant.current_team_id
- receipt

### move_participant(participant_id, new_team_id, actor_id, request_id)

Must be atomic.
- verify current team
- verify actor authority
- release current membership
- claim new membership
- one correlated receipt chain

### create_provisional_invitee(name, creator_id, request_id)

- create provisional participant with unique generated ID
- never auto-merge by name
- may be claimed to creator's team in same transaction
- requires later review/deduplication

## Optimistic concurrency

Use participant/team version or updated_at condition on write.
If stale:
- reject with 409 STALE_TEAM_STATE
- client refreshes roster before retry

## UI behavior

1. User selects own identity from alphabetical participant dropdown.
2. UI loads currently available participants.
3. Assigned participants are disabled with a compact "Ya está en otro equipo" state.
4. User selects available team members.
5. Each click requests a backend claim; UI never assumes success.
6. On conflict, refresh roster and explain the participant was already assigned.
7. User can release themselves or authorized members.
8. Moves require explicit confirmation.
9. "No aparezco" creates provisional participant.
10. Team leader is not mandatory in the public flow.

## Privacy

Public projection may expose:
- participant display name
- team availability state
- optional public nickname

Private only:
- phone/email
- flights
- DOB if not intentionally exposed
- allergies/food notes
- payments
- solidarity contribution or recipient status
- internal notes
- coordination/internal pricing lines

## Acceptance tests

- simultaneous double claim -> one success, one 409
- replay same request -> idempotent same result
- stale client -> 409 + refresh
- release then claim -> succeeds
- move -> atomic, no moment with two active teams
- provisional invitee -> created without name merge
- unauthorized actor -> denied
- public roster -> no private fields
- rollback/retry -> membership invariant preserved
