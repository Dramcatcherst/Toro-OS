# Kross read-only connection strategy — TORO OS

Date: 2026-09-17
Status: DRAFT / no production cutover
Owner agent: SOBRESITO with TORO governance
Transactional authority: Kross

## Goal

Give TORO Web and TORO WhatsApp a trustworthy, read-only hotel operational status without copying Kross transactional authority or exposing guest PII.

## Evidence verified on 2026-09-17

- Public booking engine `https://dreamcatcherhotel.kross.travel/` is reachable.
- Authenticated panel `https://dreamcatcherhotel.krossbooking.com/v2/panel` redirects to `https://dreamcatcherhotel.krossbooking.com/rct/login` when no session exists.
- Mauricio explicitly authorized read-only use of the `ricoking` login.
- The current browser/vault does not contain an active Kross session or saved ricoking password/TOTP; no secret was guessed or stored.
- Canonical Supabase `operations.reservations` and `operations.stays` currently contain 0 rows.
- Airtable historical `operations_snapshot` contains 19 rows, with latest snapshot date 2026-06-03 and `sync_status=stale`; it is not acceptable as current hotel status.
- Kross support memory says API access exists but is not open/self-service. Prior support guidance says request/form/NDA/API documentation credentials/API key are required. April 2026 commercial guidance referenced a 500 EUR one-time activation fee and minimum 75 EUR/month; verify current pricing and terms before any purchase.

## Connection ladder

### Level 0 — Public reachability

Purpose: prove Kross public infrastructure is reachable.

Allowed output:
- booking engine reachable/unreachable
- check timestamp

Never use this level to claim:
- occupancy
- arrivals/departures
- in-house guests
- room availability
- reservation state
- payment state

Implemented in PR #16 via a read-only public probe.

### Level 1 — Authenticated read-only browser session

Preferred near-term pilot because it reuses the existing hotel account and avoids API cost while scope is being proven.

Requirements:
- authorized `ricoking` credential stored in an approved browser/vault, not in code/Airtable/Supabase/chat
- 2FA/TOTP handled by the approved credential mechanism if Kross requires it
- no write actions
- no individual guest/reservation opening unless explicitly necessary and authorized
- aggregate extraction only

Target aggregates:
- occupancy percentage
- arrivals count
- departures count
- in-house count
- available/occupied/blocked room counts
- reservation count
- `source_as_of`
- authenticated source health

### Level 2 — Governed snapshot/mirror

Every operational payload must include:
- `source_as_of`
- `source_is_live`
- source system
- data quality status
- aggregate metrics only for executive surfaces

TORO classification contract:
- live authenticated source + age <=30 min => `current`
- non-live or older source <=2 h => `recent_snapshot`
- older than 2 h => `stale_snapshot`
- no verified payload => `unavailable`

A snapshot is never silently presented as live.

### Level 3 — Official Kross API

Use only if browser/session based read access is not stable enough or the value of automation justifies recurring cost.

Before approval:
1. Request an updated written Kross API offer.
2. Confirm read scopes for reservations, stays, availability and webhooks/polling.
3. Confirm authentication method, rate limits, support SLA and data retention requirements.
4. Confirm whether the quoted 500 EUR activation + 75 EUR/month minimum still applies.
5. Confirm whether read-only scope can be priced differently.
6. Obtain API documentation before committing to implementation.
7. Complete security/privacy review.

Do not use unofficial reverse-engineered Kross APIs for production hotel operations.

## TORO truth model

Kross remains authority for price, availability, reservation and transactional state.

TORO may store:
- sanitized read-only mirrors
- timestamps
- hashes/idempotency keys
- aggregate operational state
- anomaly flags
- source-health evidence

TORO must not turn stale mirrors into transactional truth.

## Current blocked gate

Authenticated Kross runtime cannot be verified until the authorized ricoking credential/session is available to the approved browser/vault.

No password, TOTP seed or secret should be committed to GitHub, Airtable, Supabase application tables or chat logs.

## Definition of done for Kross Read V1

- authenticated health check succeeds repeatedly
- no writes occur during test runs
- aggregate payload contains no PII
- payload includes `source_as_of` and `source_is_live`
- operational snapshot classifier is covered by tests
- TORO Hotel and WhatsApp use the same classified payload
- stale/unavailable paths are tested
- disconnect/retry path is replay-safe
- source visit/evidence is logged
- current data can be reconciled against a manual Kross dashboard check before rollout
