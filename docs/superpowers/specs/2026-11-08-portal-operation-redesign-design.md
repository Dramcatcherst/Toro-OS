# Portal TORO: operación legible y útil

Status: APPROVED scope for implementation; acceptance and deployment remain pending.
Authority: owner request to apply the functional redesign, reconciled 2026-11-07 UTC. Subordinate to the sole General Plan, AGENTS, constitution, current brand and source-authority contracts.

## Purpose and approach

Make the existing authenticated Portal useful for reviewing hotel work without turning historical records into current operational truth. Reuse the current Next/React components, reader, exact organization/property scope and ADMIN/GERENCIA gate. A clean branch replaces the responsibility of stale draft PR347; do not transplant PR347, PR384 or auth PR396.

Alternatives considered: recoloring the existing eight-tab catalogue would retain the usability problem; importing the old three-tab candidate would lose native Operación and its deep-link; the chosen approach reorganizes the current implementation with four primary destinations and a real bounded work explorer.

## Phase I: authorized implementation

- One Portal, existing host/project; navy shell, white/light-blue working surfaces, compact flat rows, blue dividers, typography at least12px and touch targets44px. Mobile320–412px; desktop wide work list. TORO text and existing assets only, no generated/replacement logo.
- Primary navigation: Hoy, Operación, Dinero, Más. Preserve eight historical tab URLs and expose Personas, Mercadeo, Herramientas, Reportes and Módulos under Más. URL and browser back/forward reflect visible destination. Keep utility forms and filters mounted within the same user/organization; context change resets them.
- Hoy: registered operational work and source coverage first, actual latest modification and Kross unknown, with links to Operación/planner. Financial/historical attention is secondary and collapsed, with maximum3 real Owner Attention records, neutral “Registros por verificar”, source dates and partial coverage. Owner Attention's calculated review priority is identified separately from task-source priority, never a current red alarm. Remove unproven agent activity and preparation-only modules from the first plane. Search means finding tools/options, never a simulated operational assistant.
- Operación: preserve native `hotelOperations`, strict deep-link, RLS reader and source/manual-continuity panel. Project at most200 eligible records already authorized by the existing201-row envelope, retaining the sentinel and terminal-state exclusion. No SQL/API/grants change. Pagination displays12 after filtering and sorting.
- Search safe fields: title, area, owner, source and canonical UUID reference. Filters: area, no assignee, revalidation required. Sort: recorded priority, due date, latest modification; stable UUID tie-break and absent dates last. Any filter/sort change resets page; Reset restores defaults. Searching outside the first12 must work.
- Coverage states exact read rows, eligible records and matches, explicit bounded coverage and limit reached; never claim an organization census. Empty, unavailable, disabled and denied remain distinct; no unknown-to-zero.
- Detail shows source, original modification, due date, recorded status/priority, owner and revalidation. No new completion, assignment, reservation, housekeeping, payment or messaging writes.
- Copy summary is an explicit draft, not delivery. Include filter/sort/page scope, filtered-set area/state/revalidation/missing-owner counts, actual latest modification and read cut, up to3 short references from the visible12 and a link to details; omit names, free-text titles and raw search text. Only recognized department/state labels enter the clipboard. Clipboard success follows successful write; failure exposes selectable manual text and honest feedback that nothing was sent.
- Kross occupancy remains null/unknown. Source age comes from source time, never refreshed by read time. Allegra writer remains closed. No flags, migrations, integrations, cron or scheduler.

## Phase II: proposed only

| Existing operational lane | Next useful workflow | Done criterion before action controls |
| --- | --- | --- |
| Reception / hotel today | Arrivals, departures and handover | Current authorized Kross cut, declared coverage, responsible person, permitted action and destination evidence |
| Housekeeping / inspection | Read native cleaning evidence and distinguish inspection/readiness | Physical room identity, native actor/time, responsible inspector and verified evidence; cleaning does not imply total readiness |
| Maintenance | Incident, assigned work and inspected resolution | Current canonical case, authorized responsible person, permitted transition and completion evidence |
| Finance / reconciliation | Reservation–collection–document–bank review | Domain sources reconciled by identity/currency, responsible finance actor, explicit allowed action and independent receipts |
| TORO Comms / WhatsApp | Message–case–follow-up | Verified sender/scope/consent, owner, authorized send action, dedupe and delivery/acknowledgment evidence |

These are proposed refinements of existing lanes, not active integrations or buttons. Missing source, authority or destination evidence remains an explicit limitation.

## Acceptance and recovery

Synthetic regression tests cover200+sentinel, malformed/cross-scope failure, search beyond12, filters/sort/reset/page bounds, copy success/failure/minimization, all historical URLs and history transitions, denied contexts and form mounting. Run hotel-tools/auth/RPC regressions, lint, types and build. Root owns independent visual/authenticated QA and any deployment; local tests do not certify current Kross or physical work. Revert this branch's focused commits to recover the previous surface without data/schema changes.
