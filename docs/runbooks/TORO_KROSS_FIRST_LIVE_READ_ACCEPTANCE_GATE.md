# TORO — Kross First Live Read Acceptance Gate

**Status:** CURRENT EXECUTION GATE  
**Date:** 2026-09-23  
**Canonical task:** `kross_readonly_reservation_mirror_2026_09`  
**Authority:** Kross remains transactional truth  
**TORO mode:** read-only mirror only

## Objective

Prove exactly one authorized Kross read cycle into TORO without writing back to the PMS.

This gate is intentionally smaller than "integrate all Kross."

The first pass proves:

`authorized Kross read -> minimal normalized reservation -> idempotent mirror -> safe current view -> Reception read -> evidence`

## Preconditions

All must be true before running:

- authorized Kross transport or official export/browser-derived artifact explicitly approved for this read use;
- no billable module/API activation unless separately authorized;
- organization/property scope resolved;
- source timestamp available;
- reservation external identity available;
- no full payment instrument data;
- no unnecessary notes/messages/documents/PII;
- rollback/failure path known;
- no PMS write endpoint/action in the run.

## Minimum fields

Required for a candidate reservation:
- external_reservation_id;
- property_id;
- reservation_key where available;
- room_id or room_code_raw where available;
- check_in;
- check_out;
- status;
- guest counts where available;
- channel where available;
- transactional_authority = Kross;
- read_only_mirror = true;
- source_is_live = true only when directly evidenced;
- snapshot_as_of;
- last_synced_at;
- source_hash;
- data_quality_status.

Optional and separately governed:
- breakfast entitlement;
- payment status / amount paid only when authorized.

## Identity / dedupe gate

PASS requires:
- no duplicate active mirror row for the same Kross external reservation + property;
- repeat of the same source payload is a no-op or updates the same canonical reservation;
- changed reservation updates the same canonical row;
- cancellation remains explicit status, not deletion;
- missing external identity is quarantined / rejected, not guessed;
- room/property mapping ambiguity does not auto-resolve silently.

## Time gate

PASS requires:
- snapshot_as_of is present;
- snapshot_as_of <= current time;
- last_synced_at is present;
- last_synced_at <= current time;
- both are within the accepted freshness window for current-state use;
- arrival/departure current-state target is <= 2 hours where practical;
- absolute general safe-view ceiling remains 6 hours.

A newly imported old snapshot is still old.

## Quality gate

A reservation may enter `operations.current_reservations_safe` only when:
- transactional_authority = Kross;
- read_only_mirror = true;
- source_is_live = true;
- data_quality_status = verified;
- required identity and dates exist;
- source and sync timestamps are not future;
- source and sync age <= 6 hours;
- checkout is operationally relevant.

`review`, `conflict` and `legacy` must not become current operational truth.

## Kross health gate

At least one relevant live-required source in:
- `integrations.kross_snapshot_health`

must evaluate:
- freshness_status = fresh;
- safe_for_current_state = true.

## Import-run evidence

The first real Kross cycle must create/identify a governed import run with:
- source_system = Kross;
- import_kind;
- source_as_of;
- source_reference;
- row_count;
- checksum where applicable;
- freshness SLA;
- status;
- validation summary;
- error count.

Staging batches must preserve:
- batch number;
- row count;
- validation state;
- errors/details.

## Single-run acceptance

PASS only if all are true:

1. a real authorized Kross import/run is evidenced;
2. run is read-only;
3. dedupe/idempotency passes;
4. no future timestamps pass;
5. unsafe quality states remain outside safe view;
6. `source_is_live` is based on evidence, not assumed;
7. at least one expected current reservation appears in `current_reservations_safe` when the hotel actually has an eligible current reservation;
8. absent eligible reservations is proven from Kross authority, not inferred from zero rows;
9. Reception can read the safe current projection under RLS;
10. no unauthorized user/role can read private reservation data;
11. no PMS write occurred;
12. rollback/recovery evidence exists.

## Product unlock after PASS

May promote:
- `guest.arrivals_departures` -> READ_ONLY.

Does **not** automatically promote:
- live price;
- live availability search;
- quote;
- booking creation/update/cancel;
- payment actions;
- WhatsApp sends;
- housekeeping execution;
- breakfast settlement.

Those remain separate workflow/source gates.

## Current status — 2026-09-23

- import infrastructure: PRESENT;
- Kross import runs: 0;
- reservation mirror rows: 33;
- source_is_live rows: 0;
- current_reservations_safe rows: 0;
- current snapshot quality: 31 review / 2 conflict;
- latest reservation snapshot: 2026-09-21 09:28:30.675+00;
- live-required Kross health: not current-safe;
- acceptance: **NOT PASSED**.

## Prohibitions

Do not:
- create a second Kross mirror;
- call snapshots "live" because they were recently imported;
- promote review/conflict data into current state;
- turn on billable Kross services implicitly;
- change prices, promotions, reservations or restrictions;
- copy unnecessary guest/private/payment data;
- use email notifications as reservation authority.


## Internal implementation readiness — 2026-09-23

Prepared in the canonical repo:
- transport-neutral reservation normalizer:
  - `src/features/kross/normalize-reservation.ts`;
- executable 12-check acceptance evaluator:
  - `src/features/kross/acceptance.ts`;
- CI coverage for both;
- Kross-specific scoped reservation identity guard in Supabase:
  - unique on `(org_id, property_id, external_reservation_id)` when `source_system='Kross'`;
- rollback source:
  - `supabase/drafts/rollback_kross_reservation_scope_identity_20260923.sql`.

Identity rule:
- Kross dedupe identity is `org_id + property_id + external_reservation_id`;
- `source_record_id` is secondary source evidence and new normalized rows namespace it by property;
- the current 33 legacy snapshots were checked and contain 33 distinct scoped external reservation identities.

Normalizer live-evidence rule:
`source_is_live=true` and `data_quality_status='verified'` only when the caller provides explicit evidence that:
- the transport was authorized;
- the read came directly from Kross authority;
- the transport is read-only;
- source/observed timestamps are valid and not future;
- source reference and checksum/hash exist.

This code does not know or invent vendor field names. A transport adapter must map the authorized Kross response/export into the transport-neutral candidate contract.

### Remaining blocker after internal preparation

Still required:
1. authorized real Kross transport/export/browser artifact;
2. exact transport-to-candidate mapping;
3. first real governed import run;
4. repeat/idempotency proof against that real payload;
5. Reception RLS proof on the resulting safe projection;
6. evidence that no PMS write occurred.

No credential, API entitlement or live browser/session is fabricated by this implementation.


## Provider-request status — 2026-09-23

Confirmed from Kross ticket **KB-305650/26**:
- Kross reported on 2026-09-18 that they had contacted Dreamcatcher's local provider and were waiting for that provider's response.
- No live read credential/transport, API documentation or pricing package has yet been evidenced in TORO.
- A detailed Dreamcatcher follow-up asking for read-only methods, documentation, scopes, legal terms and costs exists as a Gmail draft but has **not been sent**.

Operational next step before TORO can claim "waiting on provider only":
- authorized human sends/reopens the prepared Kross follow-up;
- then TORO monitors for provider/Kross response and validates the returned transport against this acceptance gate.

Do not:
- send the draft automatically;
- assume the local provider has approved access;
- infer API entitlement from the existence of the ticket;
- activate any billable Kross service without written approval.


## Transport adapter contract

Prepared in the canonical repo:
- `src/features/kross/transport-adapter.ts`.

Purpose:
- accept one authorized vendor payload/export row;
- apply a configuration-only field map;
- produce the transport-neutral `KrossReservationCandidate`;
- then pass that candidate into the existing reservation normalizer.

The adapter deliberately does **not** embed guessed Kross vendor field names.

Required mapping keys:
- external reservation identity;
- check-in;
- check-out;
- status.

Optional mappings:
- reservation key;
- room id / room code;
- total guests;
- adults;
- children;
- channel;
- breakfast included.

Rules:
- nested values may be addressed by dot-path configuration;
- missing required mapped values fail closed;
- invalid guest counts are not silently coerced;
- invalid booleans are surfaced as adapter issues;
- organization/property scope comes from TORO context/config, not from an untrusted vendor row;
- adapter output alone does not make a row live/verified;
- `source_is_live=true` remains controlled only by transport evidence in the normalizer.

First real transport acceptance sequence:

`official payload/export -> field-map config -> adapter -> normalizer -> mirror/import run -> safe view -> acceptance evaluator -> Reception read`

No separate reservation schema, mirror or ingestion universe should be created for a specific Kross transport.


## Transport intake gate — 2026-09-23

Before a provider/Kross response is converted into a first-read execution plan, TORO must complete:
- `data/kross_transport_intake_template_v1.json`;
- validate it with `src/features/kross/transport-intake.ts`.

The intake separates:
1. reservation/current-stay/arrival-departure read preparation;
2. live rate/availability read preparation.

These are not interchangeable.

Required before first authorized reservation read:
- named provider/transport;
- ticket/reference;
- written provider authorization;
- explicit read-only confirmation;
- source timestamp/freshness evidence;
- stable external reservation identity;
- official/documented field map;
- known billing status;
- documented fees when billable;
- explicit human approval for first read.

If any of those are missing, the first read remains blocked.

The template itself is not provider evidence and must never be used to set `source_is_live=true`.
