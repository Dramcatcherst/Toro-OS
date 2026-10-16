# TORO — Kross cloud read projection — 2026-10-16

**Scope:** Dreamcatcher Hotel / TORO Same-Brain  
**Cutoff:** 2026-10-16 01:07 America/Costa_Rica  
**Branch:** `codex/kross-cloud-read-20261016` from `75ebb7e`  
**Result:** LOCAL IMPLEMENTATION VERIFIED / HOSTED INGESTION AND WHATSAPP E2E NOT ACTIVE

## Decision

Use the existing Supabase reservation mirror as the only TORO-owned cloud projection. Kross remains the reservation and commercial authority. WhatsApp/OpenClaw must call the same governed TORO read tool as Portal; neither channel may scrape Kross, hold a second copy, infer identity from a phone number, or present stale rows as current.

Reservation/current-stay truth and public price/availability truth remain separate gates.

## HECHO

- Added read-only auxiliary MCP tool `get_hotel_current_state`.
- Added a server-only reader over `integrations.kross_snapshot_health` and `operations.current_reservations_safe`.
- The reader accepts one authorized organization/property, one date and `arrivals`, `departures` or `daily_movements`.
- It requires the internal health contract `snapshot_kind=reservation_mirror` and fails closed when the direct Kross source is missing, the snapshot belongs to rates/availability or another domain, or the reservation mirror is not promoted, stale, future-dated, ambiguous across properties, unverified, not live, not read-only, or inconsistent with the requested date.
- Freshness ceiling is six hours; results are bounded to 25 rows.
- Output excludes guest identity/contact, payment data, external reservation identity and the internal deduplication key.
- Allowed roles are `ADMIN`, `GERENCIA`, `JEFE_DEPARTAMENTO` and `AUDITOR`; a `CONTABILIDAD` test proves denial before any database read.
- A current zero-result says only that no matching movements appear in the current cutoff. It never claims that the hotel is empty.
- Every response labels Kross as authority and Supabase as a non-authoritative read-only mirror.
- Every response explicitly says reservation rows are not live rate/availability authority.
- A successful MCP call exposes the operational message in ordinary text as well as structured content, so a client is not required to understand `structuredContent` merely to display the answer.

## Live readback at cutoff

- Supabase project: active/healthy.
- `operations.reservations`: 33 Kross-labelled historical/reference rows.
- `source_is_live=true`: 0 rows.
- `operations.current_reservations_safe`: 0 rows.
- Real Kross `integrations.import_runs`: 0.
- Direct, promoted and current `source_system=Kross` health rows: 0.
- Existing health rows are indirect `Airtable/Kross` or `Kross v1/Airtable staging`; they are not promoted as direct Kross authority.
- WhatsApp/OpenClaw binding `toro-interno`: configured connected/verified, but `last_sync_at` and `last_event_at` are null.
- Channel sessions: 0. Channel receipts: 0.
- OpenClaw dependency remains `needs_audit`.
- The inspected computer does not have the OpenClaw CLI/runtime installed, and the Companion surface exposed no active instance to inspect.
- Read-only search of the institutional Gmail account found no Kross/provider API reply newer than 2026-09-18, and no API/webhook/export credential or activation notice after the 2026-09-24 checkpoint. The correct detailed follow-up remains a draft; the older duplicate remains marked superseded.
- Kross continues sending operational notification emails, with messages observed through 2026-10-15. Those messages are partial signals and may contain guest data; they do not prove complete reservation coverage, cancellations, rates, availability or current mirror state and were not ingested or copied into TORO.

Therefore the truthful current reply is `UNAVAILABLE`, not a fabricated guest list, occupancy, price or availability result.

## PREPARADO

Once one authorized hosted Kross transport produces a verified direct snapshot and passes the existing acceptance gate, the same tool can serve Portal and OpenClaw/WhatsApp without depending on Mauricio's computer. No new database or second mirror is required.

Example request:

```text
TORO, muéstrame las llegadas de hoy en Dreamcatcher.
```

Current safe response:

```text
No puedo confirmar Kross ahora; no voy a inventar reservas, ocupación, disponibilidad ni precios. Falta restaurar y verificar la sincronización alojada Kross → Supabase.
```

Expected response after the source gate passes:

```text
Kross muestra 2 llegadas para 2026-10-16.
• Unidad 21 · entrada · 2 huéspedes · confirmed
• Unidad 22 · entrada · 3 huéspedes · confirmed
Fuente: Kross · corte [fecha y hora Costa Rica] · espejo de lectura: Supabase.
```

The example is synthetic and does not describe real guests or current hotel activity.

## BLOQUEADO

1. No official/authorized Kross API, webhook, scheduled export or other server-to-server transport is currently available to TORO.
2. No hosted writer is deployed to ingest Kross into Supabase with cursor, idempotency, lease/fencing, verification, quarantine and receipt.
3. No current direct Kross snapshot satisfies the safe-view gate.
4. OpenClaw/WhatsApp has no observed live session, event or receipt proving it can invoke this tool on the authorized host.
5. `hotel.current_state.read` is declared in the tool contract, while runtime authorization is currently enforced by verified organization membership, canonical role and RLS. Binding that capability to the actual OpenClaw tool policy/scopes and proving denial remains a deployment gate.
6. This branch is local: there is no push, pull request, deployment or production activation.

The public booking engine remains a confirmation handoff. `/book/step1` is disallowed to automated crawlers by the site's current `robots.txt`; it is not adopted as a hidden scraper/API or live TORO source.

## DESCONOCIDO

- Exact supported Kross transport and credentials/scopes.
- Setup or recurring cost, if any.
- Authorized OpenClaw Gateway host and deployed version/configuration.
- Whether the existing provider path can supply reservation events and price/availability as two separately attestable feeds.

## Separate security finding

Direct Supabase metadata readback confirms RLS disabled on `integrations.mail_ingest_census` and `integrations.mail_ingest_checkpoints`. This is not caused by the Kross reader and was not changed here. It requires a separate policy-and-consumer review before enabling RLS, because enabling it without matching policies can break existing ingestion.

The current Supabase security advisor also reports three anonymous-callable and 41 authenticated-callable `SECURITY DEFINER` function warnings, plus leaked-password protection disabled. These are review warnings, not proof that every function is exploitable; they pre-exist this branch and were not changed. Remediation references: [anonymous SECURITY DEFINER lint](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), [authenticated SECURITY DEFINER lint](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable), and [password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Verification

- RED → GREEN for the new module and contract.
- Kross current-state/contract/adapter: 22/22 tests pass.
- Related Kross/MCP/OpenClaw: 76/76 tests pass.
- MCP/public-runtime regression subset: 88/88 tests pass.
- Canonical Vitest selection: 567/567 tests pass.
- Hotel tools/UI: 170/170 tests pass.
- Portal authentication/context: 97/97 tests pass.
- User-profile channel tests: 25/25 tests pass.
- Static menu/message/toolbox audit: PASS, 15 profiles and 89 bound options.
- TypeScript: PASS.
- ESLint on changed source/tests: PASS with zero errors.
- Production build with Next.js webpack: PASS, including `/api/mcp`.
- Default Turbopack build cannot run in this checkout because `node_modules` is a symlink outside Turbopack's filesystem root; the alternate supported webpack build passed.
- Independent read-only review found one P1 cross-domain risk: a non-reservation health snapshot could have unlocked reservation reads. The implementation now requires exact `snapshot_kind=reservation_mirror` in both the query and evaluator; the negative regression passes. The final independent review found no remaining P0/P1. One P2 activation gate remains: bind and enforce `hotel.current_state.read` in the real OpenClaw runtime/tool policy, then prove denial for a valid identity without that capability.

## Reversal

Before deployment, reversal is one local Git revert/removal of this branch's commit. The implementation creates no migration, does not change Supabase data, does not write to Kross, does not send WhatsApp messages and does not alter reservations, prices, availability, permissions or billing.

## NEXT — one unit only

`KROSS-CLOUD-MIRROR-ACTIVATION-01`: obtain and verify one official authorized read-only Kross transport, then deploy one server-side writer into the existing Supabase mirror with secret isolation, one-property scope, cursor, idempotency, lease/fencing, quarantine, six-hour health gate, receipts and rollback. Completion requires one fresh direct Kross snapshot, safe-view readback, one owner-only WhatsApp round trip through `get_hotel_current_state`, duplicate replay denial, stale-source denial and zero Kross writes. Price/availability remains a separate acceptance gate.
