# TORO Portal — native hotel operations — 2026-11-07

Status: candidate code and bounded source validation. Deployment and authenticated browser acceptance are separate gates.

Bounded production backport: parent `349d15fb93061cba6a285fa3977f03e4d6b6b449`, the observed active production artifact. This branch contains only the operational read delta and minimal page wiring; later main authentication, directory, financial/runtime and broader Portal draft changes are not included. The main-facing integration and Plan alignment are reviewed in PR395 (`c9f77fad0e5a167c642c52716695512ff5f3694f`). The release owner still verifies the exact source tree and production hostname before promotion. This backport passed 214 hotel-tools tests, 45 shared-RPC tests, directed ESLint and a production build including TypeScript. These are code checks, not authenticated runtime acceptance.

The owner's instruction places hotel control in the existing TORO Portal's Operation view. The auxiliary Sites capture remains a private manual contingency. It does not become a second task authority or authenticate users on behalf of TORO.

## Resulting behavior

- `/portal?tab=operations` opens the existing Operation tab only for an authorized hotel context; other values retain Home.
- A server-only adapter reads the existing canonical task records and Kross source-health records for the exact Dreamcatcher organization/property, with the existing authenticated RLS client. Management scope is rechecked after awaited reads; no service-role client or public API is added.
- The view shows up to twelve prioritized tasks from a bounded batch, their recorded states, assignment, dates, original modification times and canonical references. Raw notes, guest, financial and operational evidence payloads are excluded.
- Failed, unavailable, empty and partial reads remain distinct. A recent consultation does not refresh the source's modification time. Historical Kross copies never produce current occupancy, room availability or prices.
- Manual capture opens the existing private Site with its own access checks. It does not write canonical tasks or specialist systems.

## Optional existing-RPC extension

The existing `toro_portal_brain_read_v1(uuid,uuid)` can add an optional `hotelOperations` envelope for ADMIN/GERENCIA in the exact hotel scope. Existing sources and roles retain their contract; ordinary Brain projections ignore the new envelope. Older envelopes remain valid and show operations transport unavailable. The parser validates bounded rows, property and role before and after the RPC await.

The prepared SQL retains SECURITY INVOKER, STABLE, empty search path and existing RLS. It creates no table, grant, policy, role, writer or scheduler. Its precondition checks the exact prior function definition. The rollback draft preserves the prior definition. Deploy the compatible reader first; never apply this extension to an old strict reader.

The shared reader fails closed if a present optional envelope is malformed. This can make the full Brain read unavailable rather than only the operational section; current real-data validation passed, but this availability tradeoff remains explicit.

## Evidence and limits

- Native schema inspection established the selected fields. A bounded read on 2026-11-07 was passed through the actual TypeScript projection in memory: 141 task rows, twelve displayed items and 21 source-health rows accepted. Source states were stale/unknown and occupancy remained null. No source rows were saved in the repository or test fixtures.
- Directed tests cover old RPC compatibility, strict property/role boundaries, management-role demotion during an awaited call, errors and partial coverage, unknown states, read/source time separation, empty assignments, deep-link scope and the exact 60-minute source boundary.
- Local TypeScript, hotel-tools/RPC tests and production build validate code. They do not prove the production hostname's deployed SHA, authenticated source transport, current PMS data, delivery over WhatsApp or physical task completion.
- Production was observed by the owning release task on a different, older commit. A bounded backport onto that exact production base must be verified separately; do not promote unrelated main changes or the broader Portal draft by implication.

Rollback: revert this bounded code delta or return traffic to the previously verified deployment. If the optional RPC was applied, restore its exact prior definition only after verifying no concurrent function change; no business data needs reversal.
