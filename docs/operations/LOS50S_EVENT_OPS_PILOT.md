# Los 50s de Caro — Event Ops Pilot

Status: **LIVE PILOT / internal-only**  
Date: **2026-10-02**  
Supabase project: `abtyrbqlqbsastmridzp`

## Purpose

Los 50s de Caro is the first operational pilot for a reusable Dreamcatcher/TORO group-event model. The public registration remains lightweight; internal operations are normalized into server-only tables after submission.

## Public package targets

- Direct Santa Teresa: **USD 800 adult**
- Manuel Antonio + Santa Teresa: **USD 1,000 adult**

The public target is intentionally distinct from the internal modeled cost. Airtable remains the current pricing-control surface and stores model cost, public price and price-cost gap.

## Canonical flow

1. Guest completes `/los50sdecaro/inscripcion`.
2. Website proxy translates public participant IDs to internal refs server-side.
3. Supabase `los50s-intake` validates and persists the full registration payload.
4. `los50s_materialize_registration()` upserts:
   - normalized participant operations;
   - room placeholders;
   - transport manifest legs.
5. Internal payment, room and transport operations remain service-role only.
6. Public browser never receives private operations tables.

## Internal tables

### `los50s_participant_ops`
Operational participant projection:
- group leader and role;
- phone;
- age/DOB;
- route;
- seat/bed;
- room preferences;
- food dislikes/allergies;
- guardian;
- luggage.

### `los50s_payment_ledger`
Ledger only. No public checkout yet.
Kinds include charge, payment, refund, solidarity, group fund and adjustment.

### `los50s_room_assignments`
One current room-assignment row per participant.
Registration creates an `unassigned` placeholder only.

### `los50s_transport_manifest`
Route legs, seats, luggage, pickup/vehicle/driver fields and operational status.

## Internal views

- `los50s_participant_balances`
- `los50s_fund_summary`
- `los50s_ops_dashboard`

## Security

All event operations tables:
- RLS enabled;
- grants revoked from public, anon and authenticated;
- service-role only;
- no private ops data projected to the public portal.

## Current live state at time of documentation

The one pre-existing registration was materialized successfully:
- 3 participant profiles;
- 3 room placeholders;
- 12 planned transport legs.

No payment charges were auto-created.

## Deliberately not public yet

- payments;
- final room assignment;
- team-claim/move authority;
- internal transport vehicle/driver assignment;
- solidarity recipient identity.

## Next operational surfaces

1. Internal payments dashboard.
2. Room allocation board.
3. Transport manifest/vehicle board.
4. Group communication + reminders.
5. Day-by-day run of show.
6. Budget-vs-actual and fund closeout.

The pilot should later generalize to weddings, retreats, birthdays, concerts and hotel groups without cloning event-specific logic.


## Organization scope

All live Los 50s operational rows are scoped to:

- organization: **Dreamcatcher Hotel & Villas**
- `org_id`: `595801ce-2895-4d91-81ae-e8d1d5cc8593`
- event key: `los50s-caro-2026`

Unique operational identities are now organization + event + participant, so future TORO businesses cannot collide with Dreamcatcher event data.

## Intake runtime

Current live Supabase Edge Function:
- slug: `los50s-intake`
- live version at documentation update: **v7**
- inserts Dreamcatcher `org_id`;
- persists registration first;
- then invokes `los50s_materialize_registration()`;
- registration success is preserved even if downstream ops materialization needs retry.

The worker/materializer is org-scoped and remains service-role only.
