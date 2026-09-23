# TORO — Kross Internal Preparation Verification — 2026-09-23

**Scope:** internal Kross read-path preparation only  
**External Kross connection:** NOT established by this change  
**PMS writes:** none

## Verified internal controls

- transport-neutral reservation normalizer exists;
- direct/live status requires explicit transport evidence;
- missing external reservation identity fails closed;
- future source/observed timestamps fail live eligibility;
- scoped Kross identity guard is applied in production Supabase;
- existing scoped external identities checked before index application;
- duplicate groups after application: 0;
- first-live-read acceptance evaluator implements 12 checks;
- quote remains separately blocked from reservation-read readiness.

## Database guard

Migration:
- `kross_reservation_scope_identity_guard_20260923`

Index:
- `operations.reservations_kross_scope_external_uq`

Scoped key:
- `org_id`
- `property_id`
- `external_reservation_id`

Rollback:
- `supabase/drafts/rollback_kross_reservation_scope_identity_20260923.sql`

The migration changed no reservation rows.

## CI evidence

PR:
- #125

Validated head before this evidence/status update:
- `16167b6af59892f71ce575561789f67094665e2d`

GitHub:
- TORO Brain CI: PASS
- Workstation health: PASS
- tests: PASS
- lint: PASS
- build: PASS

Vercel:
- preview: PASS

## Remaining external blocker

TORO still lacks an authorized, directly evidenced Kross transport/credential/session for the first live read.

Until that exists:
- `source_is_live=true` must not be fabricated;
- `operations.current_reservations_safe` must remain empty unless real eligible rows exist;
- Reception arrivals/departures remain blocked;
- price/availability and quote remain separately blocked.

The first external run must follow:
- `docs/runbooks/TORO_KROSS_FIRST_LIVE_READ_ACCEPTANCE_GATE.md`.
