# TORO — Kross Dry-Run Executor Validation — 2026-09-23

**State:** INTERNAL PROOF / prepared-only
**Base:** `a00dc6eeff85c8db73c39c23c034e0283edd9bae` (`origin/main`)
**Scope:** server-only dry-run path for an official-shaped payload
**External Kross connection:** none
**PMS writes:** 0
**Public endpoint:** none

## Reused canonical chain

`src/features/kross/dry-run-executor.ts` reuses:

1. `src/features/kross/transport-adapter.ts` for configuration-only field mapping;
2. `src/features/kross/normalize-reservation.ts` for scope, dates, source evidence and identity normalization;
3. the existing scoped identity contract; it does not create a second mirror or schema.

The store used by the tests is in-memory and injected. No Supabase client, credentials, Kross request, PMS call or public route is present.

## Verified test cases

- official-shaped payload maps and normalizes successfully in dry-run mode;
- `source_is_live=false`, `data_quality_status=review` and `canEnterSafeView=false`;
- replay of the same source is idempotent with one mirror and one import-run evidence record;
- a new source hash updates the same scoped identity with one mirror row;
- explicit `cancelled` status is preserved and is not converted to deletion;
- missing external reservation ID is rejected before mirror creation;
- all accepted and rejected results report `pmsWriteCount=0`.

This evidence is internal proof only. It does not increment the real Kross import-run count and does not unlock Reception, quote, live availability or `source_is_live`.

## External blocker retained

Kross ticket **KB-305650/26** remains the latest confirmed provider evidence. The detailed Gmail follow-up remains **draft/not sent**, and no newer Kross/provider response was observed. Sending it requires Mauricio's explicit authorization.
