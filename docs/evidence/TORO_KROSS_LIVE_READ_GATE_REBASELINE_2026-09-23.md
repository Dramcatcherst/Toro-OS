# TORO — Kross Live Read Gate Rebaseline — 2026-09-23

**Scope:** Dreamcatcher Hotel  
**Mode:** read-only evidence / no PMS writes  
**Canonical task:** `kross_readonly_reservation_mirror_2026_09`  
**Result:** BLOCKED remains correct, but the blocker changed.

## Executive finding

The old blocker partially described missing import infrastructure. That is no longer accurate.

Observed on 2026-09-23:
- `integrations.import_runs`: 6 rows;
- `integrations.import_staging_batches`: 14 rows;
- `integrations.kross_snapshot_registry`: 11 rows;
- `operations.reservations`: 33 rows;
- reservation rows with `source_is_live=true`: 0;
- `operations.current_reservations_safe`: 0 rows;
- latest reservation snapshot: `2026-09-21 09:28:30.675+00`;
- Kross live-required sources in `integrations.kross_snapshot_health` remain stale/unknown and unsafe for current state;
- `integrations.import_runs` contains no real Kross import run.

Therefore:

> Import schema exists, but no verified live Kross transport/run currently satisfies the current-state gate.

## Existing safe view

`operations.current_reservations_safe` already fails closed.

It requires:
- `source_is_live = true`;
- `last_synced_at` not null;
- sync age <= 6 hours;
- checkout >= yesterday.

Current row count: **0**.

## Governed Kross health

`integrations.kross_snapshot_health` evaluates freshness using:
- `source_as_of`;
- `max_expected_age`;
- `live_required`.

Current live-required Kross sources remain unsafe for current-state claims.

## Product rule

Reception / TERE may not call historical reservation snapshots:
- current arrivals;
- current departures;
- current in-house state;
- current availability;
- current booking truth.

The authenticated My TORO gate is updated so:

`guest.arrivals_departures -> READ_ONLY`

only when:
1. `operations.current_reservations_safe` has rows; and
2. at least one live-required governed Kross health source is `safe_for_current_state=true`.

This removes dependence on a weaker heuristic based on snapshot age + stay-table population.

## Quote / availability

`hospitality.quote` remains BLOCKED.

Reason:
- current reservation truth is not equivalent to live rate/availability authority;
- a separate verified live price/availability source from Kross remains required.

## Canonical blocker after rebaseline

Remaining blocker:
- authorized real Kross transport;
- first verified Kross run;
- deduplication/identity;
- freshness;
- live-source evidence;
- approved read scope.

Not blockers anymore:
- existence of `import_runs`;
- existence of `import_staging_batches`;
- existence of `kross_snapshot_registry`.

## Safety

This rebaseline:
- does not create a second mirror;
- does not write to Kross;
- does not change reservations;
- does not change price or availability;
- does not activate promotions;
- does not authorize billable services.


## Safe-view hardening applied

Production migration applied on 2026-09-23:
- `harden_current_reservations_safe_kross_gate_20260923`.

The safe view now additionally requires:
- `transactional_authority='Kross'`;
- `read_only_mirror=true`;
- `source_is_live=true`;
- `data_quality_status='verified'`;
- non-null external reservation identity;
- non-null check-in/check-out;
- non-null source snapshot timestamp;
- source snapshot not in the future;
- source snapshot age <= 6 hours;
- non-null sync timestamp;
- sync timestamp not in the future;
- sync age <= 6 hours;
- checkout >= yesterday.

Verification after migration:
- `operations.current_reservations_safe`: **0 rows**;
- `security_invoker=true`;
- `security_barrier=true`;
- current 33 reservation snapshots remain excluded;
- current quality distribution observed before migration: 31 `review`, 2 `conflict`, 0 `verified`;
- current `source_is_live=true`: 0.

Rollback source:
- `supabase/drafts/rollback_current_reservations_safe_pre_20260923.sql`.

This migration is a read-safety hardening only. It changes no reservation rows and creates no PMS write path.


## Idempotency hardening after rebaseline

Applied production migration:
- `kross_reservation_scope_identity_guard_20260923`.

Result:
- unique partial index:
  - `operations.reservations_kross_scope_external_uq`;
- key:
  - `(org_id, property_id, external_reservation_id)`;
- applies when:
  - `source_system='Kross'`;
  - `external_reservation_id is not null`.

Pre-application verification:
- existing reservation rows with external identity: 33;
- distinct scoped Kross identities: 33;
- duplicate groups under the new key: 0.

Post-application verification:
- index present;
- duplicate groups: 0.

Rollback:
- `supabase/drafts/rollback_kross_reservation_scope_identity_20260923.sql`.

No reservation row was changed by this migration.


## Email/ticket evidence update — 2026-09-23

Observed from the Dreamcatcher/Kross support correspondence for ticket **KB-305650/26**:

### Confirmed
On 2026-09-18, Kross support stated that they had been in contact with Dreamcatcher's local provider and were waiting for that provider to respond.

This confirms:
- the API/read-access request reached Kross;
- Kross involved the local provider;
- no actual API credential, documentation package or approved live read transport was delivered in that message.

### Current owner-side action state
A detailed follow-up reply was prepared on 2026-09-23 asking Kross to confirm:
1. activation status and whether anything is pending from Dreamcatcher or the local provider;
2. read-only methods for reservations/current stays and arrivals/departures;
3. read-only methods for live rates and availability;
4. whether Kross offers API, webhook, scheduled export or another official read-only transport;
5. documentation and required scopes/credentials;
6. updated legal terms;
7. setup, recurring and other charges before activation.

That follow-up is currently **DRAFT / NOT SENT**.

Therefore the blocker must not be summarized only as "provider response pending."

The accurate state is:

> **Kross/provider side remains unresolved, and Dreamcatcher still has one explicit human action pending: send/reopen the prepared follow-up.**

### Safety
The prepared follow-up explicitly states:
- first phase is read-only;
- no write capability is requested;
- no billable API/module/service may be activated without written approval;
- Kross remains transactional authority.

No email was sent as part of this TORO update.


## Adapter-preparation update — 2026-09-23

Internal preparation now also includes:
- configurable transport adapter contract:
  - `src/features/kross/transport-adapter.ts`;
- CI tests with synthetic payloads;
- required/optional field-map validation;
- nested field-path resolution;
- explicit invalid number/boolean handling.

This reduces the remaining implementation step after Kross/local-provider delivery to:
1. verify the transport is authorized/read-only;
2. configure the official field map from real documentation/payload;
3. run one governed read;
4. pass the existing normalizer/acceptance gate.

No Kross vendor field names were guessed or hard-coded.
