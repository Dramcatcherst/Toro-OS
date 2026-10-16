# TORO — Kross cloud read projection — 2026-10-16

**Scope:** Dreamcatcher Hotel / TORO Same-Brain  
**Original cutoff:** 2026-10-16 01:07 America/Costa_Rica
**Latest material cutoff:** 2026-10-16 03:15 America/Costa_Rica
**Current branch:** `codex/toro-supermenu-20261016`
**Result:** LOCAL DATED FALLBACK ACTIVE / HOSTED INGESTION, LIVE KROSS AND POST-CHANGE WHATSAPP E2E NOT VERIFIED

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

## Material addendum — dated XLSX fallback activated at 03:15 CR

This addendum supersedes only the earlier statements that no inspectable OpenClaw runtime or usable dated owner projection existed. It does not promote the data to live Kross, availability, pricing, payments, breakfast fulfillment or the Supabase current-state mirror.

### HECHO

- The existing owner-only OpenClaw snapshot was updated atomically at `/home/personal/.config/toro-whatsapp/kross-private-snapshot.json`.
- Source artifact: `C:\Users\PERSONAL\Downloads\kross reservas 2026.xlsx`, SHA-256 `6ba860832dbe6642fe5b9e32cb1d2e6db2e597ea7d6c67fe5e734a8dc7736da3`, 1,195 source rows and attributed cutoff `2026-10-15T10:11:14-06:00`.
- The bounded operational projection contains 88 unique, non-cancelled reservations whose departure is on or after 2026-10-16 and whose PMS status is one of: pending payment, new/review, confirmed/ready for check-in, pay at check-in, check-in or pending extras.
- The projection preserves ongoing stays: nine selected reservations started before the cutoff date. It excludes cancelled and checked-out rows.
- Snapshot hash is `3fdd89b97438c60ff7e8b0a738ad5c0f3e9f55719f98675dc5f7c346494636db`; size 145,360 bytes; file mode 0600; parent directory mode 0700; owner `personal`; `sourceIsLive=false`.
- The current reader's numeric identifier constraint is handled without losing provenance: the operational ID uses the unique numeric prefix and the exact Kross source number remains in the private details/provenance.
- The XLSX does not contain guest phone/email, currency, breakfast inclusion, amount paid or payment status. These remain unknown/null. Collected or retained commissions were not converted into guest payments.
- The previous operations block remains semantically identical and keeps its September timestamps. It was not relabelled as October housekeeping, breakfast, maintenance or reception evidence.
- The WhatsApp agent instruction now requires `toro_kross_snapshot_read` for owner reservation/guest/movement/room/total questions. When a requested live read fails, it must consult the dated snapshot and answer `RESPALDO FECHADO / ESTADO ACTUAL NO CONFIRMADO` instead of returning a generic denial when dated data exists.
- No Kross write, reservation change, price/availability claim, guest message, push, PR, deployment or Supabase mutation occurred.

### Verification

- Converter unit tests: 4/4 PASS, including active/future selection, exact source-ID retention, unknown-field preservation and source-hash rejection.
- Candidate pre-publication check: PASS; 88/88 paginated; seven configured non-owner senders denied; zero external messages.
- Atomic refresh: `UPDATED`, 88 reservations, dated cutoff and non-live flag preserved.
- Installed snapshot readback: PASS; hash equals the validated candidate; `.previous.json` equals the prior active hash.
- Owner-only local read for 2026-10-16: 14 matching dated records, complete first page, `freshness=red`, `sourceIsLive=false`; exact numeric-ID lookup also passed.
- An isolated CLI agent run was intentionally non-delivering and did not inherit a verified WhatsApp-channel identity, so the tool correctly returned `Capability unavailable`. This is not a post-change WhatsApp E2E acceptance result.

### Reversal

- Prior snapshot is retained both as `kross-private-snapshot.previous.json` and as the immutable rollback copy `kross-private-snapshot.rollback-b6dac7847e1d98387c2687c6cc5143d2dd5765f541ac4c4196093dbd0c34b3b9.json`; both hash to `b6dac7847e1d98387c2687c6cc5143d2dd5765f541ac4c4196093dbd0c34b3b9` and pass the snapshot checker.
- The prior WhatsApp agent instruction is retained at `/home/personal/.openclaw/backups/kross-xlsx-snapshot-20261016/AGENTS.before.md`, hash `6b96b3ad0f1641ebd6ead0f3b408b9a094d287d0a194e211e4aa856ddee529a9`.
- Snapshot rollback must use an atomic staged rename after verifying the expected active hash; the refresh command must not be used because it correctly rejects an older cutoff.

### BLOQUEADO / DESCONOCIDO

- This is still a dated local fallback and depends on a newly supplied export for later updates. It does not meet the requirement to run independently of Mauricio's computer.
- Supabase still has no verified Kross import run or current safe reservation rows from this artifact.
- No post-change inbound WhatsApp message, generated reply and delivery receipt have yet demonstrated the full owner-channel round trip.
- Payments, breakfast execution, current physical presence, live prices and live availability remain unavailable from this XLSX.

## NEXT — one unit only

`KROSS-WHATSAPP-INBOUND-ACCEPTANCE-01`: Mauricio sends one owner-channel test asking for the reservation count on 2026-10-16 without guest names. Observe `toro_kross_snapshot_read`, verify the reply says 14 dated matches with cutoff 2026-10-15, `sourceIsLive=false` and numbered continuation options, then capture the provider delivery receipt without exposing the phone number or guest data. Do not alter Kross, send guest messages or claim live availability. After this gate, resume the official server-to-server Kross → existing Supabase mirror activation.
