# TORO WhatsApp repair intake — 2026-09-29

## Diagnosis and evidence

The WhatsApp binding reports `connected` / `verified` / ingestion `healthy`, but the OpenClaw external dependency is still `needs_audit` and the canonical session, receipt and employee identity tables each have zero rows. Keep these states separate; a connected transport is not an integrated TORO capability.

| Request | Verified state | Safe next action |
| --- | --- | --- |
| `Capability unavailable` | Exact failing tool, response trace and Gateway configuration unknown. TORO Exchange is a separate marketplace experiment; do not assign this error to it by name alone. | Inspect sanitized host trace and routing; distinguish denied, absent, unhealthy and stale source. |
| Lists, maintenance, receipts, closings, news | Canonical tasks and maintenance exist. `integrations.communication_channel_sessions` and `_receipts` are live tables but contain zero rows. No verified durable chat/list bridge. | Reuse canonical objects and those session/receipt tables; add only governed message and structured-record content. |
| History by chat/date/text | No verified governed WhatsApp history endpoint. | HMAC account/chat IDs; enforce verified identity and current membership on every read; bounded time/text query and audit receipt. |
| Images and audio | Gateway media capabilities and extraction pipeline unverified. | Retain original in approved evidence storage, record hash/reference and pending/review/verified/failed state; never treat unreviewed extraction as fact. |
| Reservations, occupancy, housekeeping | 33 reservation snapshots, newest 2026-09-21 09:28 UTC; `current_reservations_safe` has 0 rows. Kross mirror health shows stale rows. No proven WhatsApp resolver. | Historical reads only with source time; block "today" occupancy, arrivals, availability and rates until fresh verified mirror/current authority exists. |
| Alegra | Connected read-only app exists; channel use unverified. | Reconcile reads only through TORO Finance. Explicit owner approval required for writes. |
| Kross | Paid live access intentionally deferred in Plan General. | Do not enable/contract; use labeled Supabase mirror within freshness limits. |

## Changes in this branch

- Pure server contract: HMAC transport subject, thread authorization, bounded structured record validation and capability failure classification.
- Database **draft only**: one content table linked to existing identity-bound sessions and idempotent receipts; versioned records; scoped date and text indexes; no anon/authenticated access; no raw phone/chat identifiers or credentials.
- Explicit rollback draft. No production schema, live routing or permissions were changed.

## Acceptance sequence on the authorized host

1. Read-only Gateway status, channel probe, bindings, capability response and redacted failure trace. Confirm the exact account and Mauricio's sender pairing without posting raw phone or tokens.
2. Locate the existing `toro-openclaw-integration` worktree; inspect its current branch and route. Reuse it. Never issue a service-role key to the WhatsApp model or shared Gateway.
3. Review migration against current schema, backup and retention. Apply only through a reviewed migration after recovery and access checks. Verify RLS/grants and cross-tenant denial.
4. Wire the adapter to the TORO server resolver. One identity-bound owner-only test for history, guest-list persistence and a Supabase mirror read. Require source timestamp and refuse stale current-state claims.
5. Test duplicate provider event and concurrent replay (one event/record), context compaction, restart, long timeline pagination, revoked/cross-org access, image/audio extraction failure, and restored backup. Record sanitized IDs and outcomes.
6. Promote runtime status only after the real host demonstrates all gates. Alegra writes, external sends and Kross activation remain separate blocked actions.

## Recovery / reversal

Revert the code branch to restore previous behavior. If the draft migration is later applied, stop writers, export the new content rows, verify the export, then run the rollback SQL only with explicit destructive-change authorization. Keep the pre-existing bindings, sessions and receipts. If delivery outcome is uncertain, reconcile the provider receipt before retry to avoid duplicates.
