# TORO daily environment — preview evidence, 2026-10-12

Master authority: docs/product/TORO_BRAIN_GENERAL_PLAN.md.
Scope: Dreamcatcher authorized organization context. PR: https://github.com/Dramcatcherst/Toro-OS/pull/265

## Verified code and build

Code SHA: c98947314cab40149aba36bd306bafb5021d8bc9.
Deployment: dpl_42rN4WitchnEF9cDM2enUroo9UJq.
Preview: https://toro-pr11-preview-368883d1z-dreamcatcher-s-projects.vercel.app/my-toro
Vercel dashboard: https://vercel.com/dreamcatcher-s-projects/toro-pr11-preview/42rN4WitchnEF9cDM2enUroo9UJq

Observed build logs:
- 7 test files, 38 Vitest tests passed.
- scoped environment/page ESLint completed successfully.
- Next.js 16.3.6 compilation and TypeScript completed.
- deployment READY.

These replace earlier NOT_RUN evidence for the changed environment slice. Full repository test/lint suites and authenticated visual acceptance are not certified by this result. The anonymous /my-toro route was checked on the preceding verified read-adapter deployment: HTTP 200 with login and no hotel environment block.

## Real public-source probes

Probe timestamp: 2026-10-12T11:32:59.097Z (05:32:59 Costa Rica).
The diagnostics imported the actual repository parsers after TypeScript transpilation, fetched fixed official URLs without redirects, capped bytes/time and printed only status/normalized public metadata.

- IMN www and non-www regional URLs: HTTP 200, parser READY, validDate 2026-10-12.
- USNO primary moon phase API: HTTP 200, parser READY; next phase Cuarto creciente, 2026-10-18T16:12:00Z = 18 October 10:12 Costa Rica.
- This verifies provider transport + normalization in the preview build environment, not an authenticated Portal view or continuous scheduled delivery.

USNO authority documentation: https://aa.usno.navy.mil/data/api.html
Phase service: https://aa.usno.navy.mil/data/MoonPhases
IMN: https://www.imn.ac.cr/es/web/imn/reporte-pronostico-regional
Earlier ChatGPT web fetch returned 410/unavailable; those failures did not establish an actual provider outage. The Vercel probes demonstrate usable server transport.

## Canonical dates and scope

Read-only loader uses the current user's Supabase client/RLS, existing org/property IDs, and existing catalog.local_events/public.holidays. Filters exclude foreign scope, employee-private rows, expired/unpublished/unverified/overdue-review events and ambiguous duplicates. Only date/title/type leave the projection; no payroll data or personal calendar fallback.

Live read-only SQL inventory found two historical holidays, no holiday_calendars rows, two expired catalog events. This is incomplete source coverage, not proof that no current holidays/events exist. No DB records or permission changes were written.

## Remaining limits / next

- Tide source inventory: UNA lists Nacascolo, Tambor, Puntarenas, Quepos, Rincón de Osa, Isla del Coco, Moín, Limón. No Santa Teresa-specific reference validated. No nearest-station substitution.
- UI reads public climate/lunar data and canonical dates on authorized page load, with short shared public-source caches.
- Lunar output is last principal phase + next four instants; no local moonrise/set, illumination or marine safety inference.
- Daily scheduled worker, alerts, Portal/chat shared persisted snapshot and authenticated UI/source-RLS readback remain pending.
- No production merge/release, schema migration, private-data promotion, automatic invitations or booking effects.

Rollback: revert environment files/page import and loader render; restore previous package build command. No persistent operational data changed.
