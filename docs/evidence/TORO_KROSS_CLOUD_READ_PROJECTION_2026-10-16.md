# TORO — Kross cloud read projection — 2026-10-16

**Scope:** Dreamcatcher Hotel / TORO Same-Brain  
**Original cutoff:** 2026-10-16 01:07 America/Costa_Rica
**Latest material cutoff:** 2026-10-17 06:53 America/Costa_Rica
**Current branch:** `codex/toro-supermenu-20261016`
**Result:** LOCAL DATED FALLBACK ACTIVE / OPENCLAW ROUTE CORRECTED AND WHATSAPP LISTENING / POST-RESTART E2E, HOSTED INGESTION AND LIVE KROSS NOT VERIFIED

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

## Historical live readback at original cutoff

The observations in this section belong to the original 2026-10-16 01:07 CR cutoff. Later material addenda supersede the OpenClaw/WhatsApp runtime observations; the Supabase/Kross transport observations remain current unless a later addendum explicitly changes them.

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

## Historical blockers at original cutoff

This list is retained as audit history. Later material addenda supersede the OpenClaw host/session items; hosted Kross transport, Supabase ingestion and production activation remain blocked.

1. No official/authorized Kross API, webhook, scheduled export or other server-to-server transport is currently available to TORO.
2. No hosted writer is deployed to ingest Kross into Supabase with cursor, idempotency, lease/fencing, verification, quarantine and receipt.
3. No current direct Kross snapshot satisfies the safe-view gate.
4. OpenClaw/WhatsApp has no observed live session, event or receipt proving it can invoke this tool on the authorized host.
5. `hotel.current_state.read` is declared in the tool contract, while runtime authorization is currently enforced by verified organization membership, canonical role and RLS. Binding that capability to the actual OpenClaw tool policy/scopes and proving denial remains a deployment gate.
6. This branch is local: there is no push, pull request, deployment or production activation.

The public booking engine remains a confirmation handoff. `/book/step1` is disallowed to automated crawlers by the site's current `robots.txt`; it is not adopted as a hidden scraper/API or live TORO source.

## Historical unknowns at original cutoff

This list is retained as audit history. Later material addenda establish the inspected OpenClaw host/version/configuration; the Kross transport, commercial terms and feed coverage remain unknown.

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

## SUPERSEDED NEXT — recorded at the dated-snapshot addendum

`KROSS-WHATSAPP-INBOUND-ACCEPTANCE-01`: Mauricio sends one owner-channel test asking for the reservation count on 2026-10-16 without guest names. Observe `toro_kross_snapshot_read`, verify the reply says 14 dated matches with cutoff 2026-10-15, `sourceIsLive=false` and numbered continuation options, then capture the provider delivery receipt without exposing the phone number or guest data. Do not alter Kross, send guest messages or claim live availability. After this gate, resume the official server-to-server Kross → existing Supabase mirror activation.

## Material addendum — strict SHA-256 intake gate prepared at 2026-10-17 03:29 CR

This addendum records one local P1 unit while the authentic KROSS1 acceptance remains pending. It does not prove a WhatsApp round trip, a Supabase import, live Kross data or production activation.

### HECHO

- `normalizeKrossReservation` now accepts a source checksum only when it is exactly a canonical lowercase SHA-256 value: 64 hexadecimal characters.
- A missing or malformed checksum adds `invalid_source_hash` and rejects the record before mirror admission; the invalid value is not preserved as trusted provenance.
- Existing Kross dry-run fixtures were updated to use distinct valid SHA-256 values for the base and changed-source cases.
- No network request, Supabase/Kross write, message, credential, DDL, permission change, deployment, push or pull request occurred.

### Verification

- RED proved the prior gap: the new malformed-hash test failed because `not-a-sha256` was admitted.
- GREEN focal normalizer suite: 7/7 PASS.
- Related Kross unit: 20/20 PASS.
- Exact package-equivalent test graph: 930/930 PASS, including the canonical application suite, workstation, agent evaluation/steward, menu/profile, OpenClaw diagnostics, Kross current-state/MCP, hotel tools and Portal authentication.
- ESLint on the three changed source/test files: PASS.
- `git diff --check`: PASS.

### PREPARADO

- The strict checksum boundary is ready locally for the later dated-export intake and prevents an arbitrary source label from being treated as content-addressed evidence.

### BLOQUEADO / DESCONOCIDO

- This unit does not load the XLSX into Supabase and does not change the installed OpenClaw snapshot.
- No OpenClaw log files were available under the expected runtime log directory during the single aggregate P0 check, so this pass cannot prove or disprove a new authentic KROSS1 inbound or receipt.
- Monotonic source-time admission is not yet enforced: an older `source_as_of`, a future source time or a same-time/different-hash conflict still requires an explicit quarantine gate before any hosted import.

### Reversal

- Revert only the local changes in `src/features/kross/normalize-reservation.ts`, `src/features/kross/normalize-reservation.test.ts` and `src/features/kross/dry-run-executor.test.ts`. There is no external state to reverse.

## SUPERSEDED NEXT — recorded at the strict-hash addendum

`KROSS-MIRROR-SOURCE-TIME-GATE-01`: with P0 still checked first on the next pass, add RED→GREEN tests and the smallest local implementation that quarantines an older `source_as_of`, rejects `source_as_of > observed_at`, treats equal timestamp plus different source hash as a conflict, leaves the mirror unchanged on every rejection/conflict and advances no checkpoint until a successful admission. Use fixtures without PII; do not connect to Supabase, Kross or production.

## Material addendum — OpenClaw route correction and local source-time gate at 2026-10-17 04:28 CR

This addendum supersedes the prior OpenClaw routing diagnosis and completes the local source-time unit. It does not prove a post-restart WhatsApp E2E, a Supabase import, live Kross data, prices, availability, payments or guest delivery.

### HECHO

- A genuine owner-channel `KROSS1` inbound at 03:55:51 CR proved WhatsApp inbound and one provider outbound, but failed acceptance: it made no fresh `toro_kross_snapshot_read`, emitted no deterministic route receipt, reused prior context, omitted required freshness/unknown-field/options gates and mislabeled the local XLSX fallback as `Kross/Supabase`.
- The root cause was verified in the OpenClaw journal: the non-bundled plugin registered `before_agent_reply`, which OpenClaw blocked unless the plugin received broad conversation access. That permission was not granted or expanded.
- The deterministic KROSS1 route now uses the normal-channel `before_dispatch` hook. It accepts only the exact raw `event.content` after CRLF normalization and outer trimming; prefixed, quoted, enveloped or different content does not activate it.
- The route requires both hook views to agree on WhatsApp, account `toro-interno`, canonical direct session, sender and owner role. Groups, quotes, missing/conflicting identity, wrong session scope and non-owner actors fail closed without reservation data or prior context.
- A valid request performs a fresh `toro_kross_snapshot_read` and returns `{ handled: true, text }` before the model. Reader/format failure returns `LECTURA NO DISPONIBLE`; invalid identity within the governed target returns `ACCESO NO CONFIRMADO`. Both include numbered continuation and no dated reservation payload.
- Independent review rejected an intermediate `inbound_claim` proposal before installation because that hook runs only for plugin-owned conversation bindings. The installed route is `before_dispatch`, which the normal WhatsApp binding executes and which does not require `allowConversationAccess`.
- OpenClaw gateway restart began at 04:17:39 CR. The old process exhausted its graceful active-work drain and systemd killed the remaining old workers at 04:23:08; the new gateway then started, reached `ready` at 04:25:09 and reported WhatsApp listening at 04:25:11.
- Post-restart readback: gateway reachable; plugin `toro-native-capabilities` loaded; WhatsApp listener active; zero new `before_agent_reply`/`allowConversationAccess` warnings; no agent bootstrap remains pending. The stale-lease integrity gate for the main agent database reported `healthy`.
- The local Kross dry-run now enforces `source_as_of <= observed_at <= now`, canonical SHA-256 evidence and monotonic checkpoint admission per reservation identity. Older cuts quarantine, same-cut/different-hash conflicts, exact repetitions replay, newer cuts admit, and checkpoint CAS failure returns `checkpoint_changed` without overwriting an accepted receipt.
- Rejected, quarantined and conflicting local runs do not mutate the mirror or advance the checkpoint. This remains an in-memory/local contract; it is not a hosted Supabase transaction or feed-level checkpoint.
- No external message was sent by this work, and no Kross/Supabase data, reservation, price, availability, payment, permission, DDL, production deployment, push or pull request was changed.

### Verification

- OpenClaw staged RED proved the previous hook could not handle the raw normal-channel event. Final native KROSS1 smoke: PASS with two fresh reads, fail-closed identity and reader paths, exact matcher, numbered options, zero PII in output, zero external messages and zero writes.
- All four installed OpenClaw native smoke suites: PASS (`synthetic-cli-metadata`, `synthetic-kross1-hook`, `synthetic-phase5`, `synthetic-smoke`).
- Installed runtime files match their staged SHA-256 values; both are owner `personal`, mode 0600.
- Independent final review: INSTALL approved; no remaining P0/P1 in the route patch. The real post-restart inbound remains the required acceptance gate.
- Kross feature suite: 61/61 PASS across 10 files.
- TypeScript: PASS. ESLint on the four changed Kross source/test files: PASS. `git diff --check`: PASS.

### PREPARADO

- OpenClaw and WhatsApp are ready to receive one new authentic KROSS1 after the 04:25:11 listener start. The deterministic path should bypass the model, read the dated private snapshot once and produce one response with the exact freshness contract.
- The local source-time/CAS contract is ready for a later hosted adapter. It does not yet solve artifact-vs-record hash scoping, feed/batch checkpointing, durable quarantine or transactional Supabase fencing.

### BLOQUEADO / DESCONOCIDO

- No authentic KROSS1 inbound has occurred after the corrected gateway reached ready/listening state. Exactly-one outbound and the provider reference therefore remain unverified for the corrected route; delivered/read receipt may not be available from the provider.
- The snapshot is still the dated local XLSX fallback with `sourceIsLive=false`. Supabase still has no verified import from this artifact, and live prices/availability/payments/breakfast/presence remain unknown.
- The gateway's old process did not complete a graceful drain before the configured shutdown deadline. The replacement is healthy and listening, but active-work shutdown behavior remains a separate P2 operational concern.
- The local checkpoint is per reservation, not a whole-feed cursor; `runKey`/artifact hash/record hash scope and a real atomic Supabase adapter remain unresolved.

### Reversal

- OpenClaw rollback files: `/home/personal/.openclaw/backups/kross1-inbound-claim-20261017/index.before.mjs` and `synthetic-kross1-hook-smoke.before.mjs`, verified byte-for-byte against the pre-install runtime before copying. Restore only after validating the currently installed hash, set mode 0600 and restart the same gateway service.
- Local importer reversal is limited to the uncommitted changes in `src/features/kross/normalize-reservation.ts`, `normalize-reservation.test.ts`, `dry-run-executor.ts` and `dry-run-executor.test.ts`. No external data rollback is required.

## SUPERSEDED NEXT — recorded at the OpenClaw/source-time addendum

`KROSS-WHATSAPP-POST-RESTART-E2E-01`: Mauricio sends one new direct WhatsApp message to `toro-interno`, after 2026-10-17 04:25:11 CR, with the exact two-line KROSS1 text. Verify one fresh `route=toro_kross_snapshot_read`, total 14 with distribution 6/2/2/2/1/1, cutoff `2026-10-15T10:11:14-06:00`, `sourceIsLive=false`, the exact dated-warning label, all unknown fields, numbered options, no guest identity, exactly one provider outbound and any available receipt. Do not simulate, resend on ambiguity, contact Kross, write external data or call the fallback live.

## Material addendum — scoped run identity at 2026-10-17 04:41 CR

This addendum completes one local P1 unit while the authentic post-restart KROSS1 acceptance remains pending. It does not load Supabase, create a hosted importer, contact Kross, prove live data or change any external system.

### HECHO

- Dry-run identity now separates the whole-artifact SHA-256, per-record SHA-256, per-call attempt identifier and canonical run key.
- The canonical versioned run key is scoped by organization, property, source `Kross`, snapshot kind `reservation_mirror`, feed, artifact hash and record hash. It deliberately excludes the attempt identifier so retries preserve idempotency.
- Import-run evidence carries the complete non-PII scope plus `artifactHash`, `recordHash` and the current `attemptId` as distinct fields.
- Normalized reservation `source_hash` and the monotonic reservation checkpoint now use the record hash, not the whole-file hash.
- A second record from the same artifact no longer collides with the first. The same material in another property receives a distinct run key and mirror identity.
- A new attempt over the same scoped artifact/record replays the canonical run without creating another mirror or canonical import run, while the returned attempt evidence reflects the current attempt identifier.
- A malformed artifact hash fails closed before adaptation and leaves mirror, import-run and checkpoint stores unchanged.
- No network request, credential, message, Kross/Supabase write, DDL, permission, deployment, push or pull request occurred.

### Verification

- RED: 18 expected focal failures exposed the old `sourceHash` contract and unscoped run key.
- GREEN: focal normalizer/dry-run suites 22/22 PASS.
- Full Kross feature graph: 65/65 PASS across 10 files.
- TypeScript: PASS. ESLint on the four changed Kross source/test files: PASS. `git diff --check`: PASS.
- Independent read-only review: APPROVED with 0 P0/P1; scoped-key isolation, attempt exclusion, record-hash checkpointing and zero-state invalid-artifact rejection were all reproduced.
- P0 aggregate check at this pass found zero post-restart KROSS1 mentions, route successes, denials or reader failures; no inbound was simulated or sent.

### PREPARADO

- The local contract can distinguish file evidence, row evidence and execution attempts without cross-property or same-artifact row collisions.
- This is the safe prerequisite for a whole-feed checkpoint and later durable attempt/quarantine receipts.

### BLOQUEADO / DESCONOCIDO

- The post-restart authentic WhatsApp E2E remains unverified because no new KROSS1 inbound exists after 04:25:11 CR.
- The store still checkpoints each reservation independently; it cannot yet prove that an entire feed was validated and reconciled before advancing a feed cursor.
- Attempt evidence is returned per call but is not yet a durable append-only attempt receipt. Durable quarantine/reconciliation and a hosted transactional Supabase adapter remain future gates.
- Supabase still has no verified import from this artifact, and the dated XLSX remains `sourceIsLive=false`.

### Reversal

- Revert only the uncommitted local changes in `src/features/kross/normalize-reservation.ts`, `normalize-reservation.test.ts`, `dry-run-executor.ts` and `dry-run-executor.test.ts`. No external state rollback is required.

## SUPERSEDED NEXT — recorded at the scoped-run addendum

`KROSS-FEED-CHECKPOINT-01`: keep the authentic KROSS1 inbound as the preemptive acceptance gate if it arrives; otherwise add RED→GREEN tests and the smallest local contract for a feed/batch checkpoint that advances only after every row has been validated and reconciled, records read/accepted/rejected/unchanged/changed/conflict counts, and leaves both the feed checkpoint and mirror unchanged on any incomplete or failed batch. Use fixtures without PII; do not connect Supabase/Kross, create DDL, send messages or touch production.

## Material addendum — atomic feed checkpoint at 2026-10-17 05:41 CR

This addendum completes one local P1 unit while the authentic post-restart KROSS1 acceptance remains pending. It does not connect Supabase or Kross, promote production data, prove live hotel state or send any message.

### HECHO

- The local dry-run now stages every row of one feed in an isolated overlay and performs exactly one final atomic admission. No staged mirror, canonical import run, per-reservation checkpoint or feed checkpoint is written before the whole batch passes.
- The batch contract validates canonical import context, timestamp order, expected row count and unique reservation identities before promotion. A truncated batch, invalid row, conflicting row or duplicate identity fails closed and discards every staged row.
- The stable feed key is scoped by organization, property, source `Kross`, snapshot kind `reservation_mirror` and feed. Artifact hash and attempt identifier remain evidence on the checkpoint rather than changing the feed identity.
- The feed checkpoint records the full `read/accepted/rejected/unchanged/changed/conflict` reconciliation. It advances only after all rows have been validated and reconciled successfully.
- Final admission uses compare-and-swap over the prior feed checkpoint plus every mirror, canonical run and per-reservation checkpoint read during staging. A concurrent change rejects the complete batch; it cannot partially promote unaffected rows.
- Exact same-cut/same-artifact replay is idempotent and writes nothing. An older feed cut or same-cut/different-artifact input is rejected without moving the accepted checkpoint.
- Artifact and record hashes are canonicalized before keys, comparisons and checkpoints. Commit-time CAS failure returns coherent terminal counts: zero accepted/unchanged/changed and all read rows rejected/conflicting.
- No network request, credential, external message, Kross/Supabase write, DDL, permission, deployment, push or pull request occurred.

### Verification

- RED: six new feed tests initially failed because the batch executor and feed checkpoint did not exist.
- GREEN focal feed/dry-run suite: 24/24 PASS, including complete mixed reconciliation, invalid-final-row rollback, row conflict, incomplete batch, duplicate identity, real concurrent import-run race, exact replay, hash canonicalization, stale cut and same-cut conflict.
- Full Kross feature graph: 75/75 PASS across 10 files.
- TypeScript: PASS. ESLint on the four changed Kross source/test files: PASS. `git diff --check`: PASS.
- Independent read-only review: APPROVED with 0 P0/P1 after correcting count invariants, canonical hash handling and replacing the artificial CAS rejection with a real concurrent-write test.
- The single post-04:25:11 journal mention containing `KROSS1` during this pass was an internal runtime/deployment report, not a new authentic WhatsApp inbound. No inbound was simulated, sent or resent.

### PREPARADO

- The local store contract now provides the all-or-nothing feed boundary required before implementing durable attempt receipts/quarantine and a hosted transactional adapter.
- Fixtures contain no guest PII, and the contract remains read-only with `pmsWriteCount=0` and `canEnterSafeView=false`.

### BLOQUEADO / DESCONOCIDO

- The atomic store is still local and in memory. It does not prove a Supabase transaction, hosted execution, persistence across process restarts or a Kross transport.
- Attempt receipts and quarantine are not yet durable or append-only; a canonical run remains distinct from per-attempt evidence, but that evidence is not yet persisted independently.
- The authentic corrected-route WhatsApp E2E remains unverified because no new KROSS1 inbound exists after 04:25:11 CR.
- Supabase still has no verified import from this artifact, and the dated XLSX remains `sourceIsLive=false`; live prices, availability, payments, breakfast and physical presence remain unknown.

### Reversal

- Revert only the uncommitted local changes in `src/features/kross/normalize-reservation.ts`, `normalize-reservation.test.ts`, `dry-run-executor.ts` and `dry-run-executor.test.ts`, plus this checkpoint addendum. No external state rollback is required.

## SUPERSEDED NEXT — recorded at the atomic-feed addendum

`KROSS-DURABLE-RECEIPTS-01`: keep an authentic post-04:25:11 KROSS1 inbound as the preemptive acceptance gate if it arrives; otherwise add RED→GREEN tests and the smallest local contract for append-only receipts and durable quarantine keyed by `attemptId`, without overwriting the canonical run, with reconciliation links to feed/run/record evidence and replay-safe readback. Use fixtures without PII; do not connect Supabase/Kross, create DDL, send messages or touch production.

## Material addendum — append-only attempt receipts and quarantine contract at 2026-10-17 06:53 CR

This addendum completes one local P1 unit while the authentic post-restart KROSS1 acceptance remains pending. It proves an append-only storage contract in the in-memory reference store; it does not prove persistence across process restarts, hosted Supabase ingestion, live Kross data or WhatsApp delivery.

### HECHO

- Every valid feed attempt now has a canonical receipt key scoped by the existing organization/property/Kross/reservation-mirror/feed key plus `attemptId`. The request fingerprint covers only canonical scope, cuts, expected count and row links; it excludes payload, source reference and guest identity.
- An accepted promotion stores its receipt in the same atomic admission as the feed checkpoint, mirrors, canonical import runs and per-reservation checkpoints. A rejected attempt stores its receipt and quarantine evidence together or stores neither.
- Receipts and quarantine evidence are append-only. An exact retry returns the existing receipt without another write; reuse of an `attemptId` for different material fails closed as `attempt_conflict` and cannot overwrite the original evidence.
- Each row link contains only ordinal, canonical record hash and canonical run key. Invalid/non-canonical row hashes become null links instead of preserving arbitrary source text.
- Same-cut replay now proves that every non-null row link resolves to an accepted canonical run with the same artifact and record hash. A missing or substituted run rejects the attempt as `same_cut_conflict`, records quarantine and leaves the accepted feed unchanged.
- Feed admission rejects duplicate staged run keys and every staged run not linked exactly once by the accepted receipt. Canonical runs use defensive readback, save-if-absent semantics and cannot be overwritten by direct or feed admission.
- A lost feed CAS records one rejected `checkpoint_changed` attempt and quarantine; it cannot leave an accepted orphan receipt or partially promoted feed.
- Receipt and quarantine readback is defensive. Their privacy contract fixes `payloadStored=false`, `piiStored=false` where applicable, `readOnly=true` and `pmsWriteCount=0`.
- No network request, credential, external message, Kross/Supabase write, DDL, permission, deployment, push or pull request occurred.

### Verification

- RED: nine expected focal failures demonstrated the missing receipt/quarantine APIs, missing append-only behavior and absent attempt conflict handling.
- GREEN focal dry-run suite: 37/37 PASS, including atomic accepted/rejected evidence, exact retry, divergent attempt conflict, same-cut row-link substitution, unlinked staged run, canonical-run overwrite denial, CAS loss, property isolation and PII-negative checks.
- Full Kross feature graph: 88/88 PASS across 10 files.
- TypeScript: PASS. ESLint on the four changed Kross source/test files: PASS. `git diff --check`: PASS.
- Independent final read-only review: 0 P0/P1. The reviewer reproduced the two final negative gates for unresolved replay links and extra staged runs.
- The single KROSS1 fingerprint observed in the one aggregate post-04:25:11 runtime check was an internal report (`inbound=false`, `route=false`, `internal=true`), not a new authentic WhatsApp inbound. No inbound was simulated, sent or resent.

### PREPARADO

- The local interfaces now express the atomic, append-only and replay-safe evidence requirements that a future hosted Supabase adapter must preserve.
- Feed, run, record and attempt evidence can be reconciled without retaining reservation payloads or guest identity in receipts/quarantine.

### BLOQUEADO / DESCONOCIDO

- The reference store is still local and in memory. “Append-only” is a tested contract, not proof of disk durability, process-restart recovery or a Supabase transaction.
- Invalid pre-admission context with no canonical attempt/feed/hash identity intentionally creates no durable receipt; inventing an evidence identity would be less safe.
- No authentic KROSS1 inbound has exercised the corrected route after 04:25:11 CR, so corrected-route WhatsApp E2E and exactly-one provider outbound remain unverified.
- Supabase still has no verified import from this artifact. The XLSX fallback remains dated and `sourceIsLive=false`; prices, availability, payments, breakfast and physical presence remain unknown.

### Reversal

- Revert only the uncommitted local changes in `src/features/kross/normalize-reservation.ts`, `normalize-reservation.test.ts`, `dry-run-executor.ts`, `dry-run-executor.test.ts` and this checkpoint addendum. No external state rollback is required.

## SUPERSEDED NEXT — recorded at the append-only-receipts addendum

`KROSS-SUPABASE-FENCING-CONTRACT-01`: keep an authentic post-04:25:11 KROSS1 inbound as the preemptive acceptance gate if it arrives; otherwise add RED→GREEN tests and the smallest local transaction/CAS fencing contract for the future existing-Supabase adapter, proving that a stale or superseded writer cannot promote mirrors, runs, receipts, quarantine or checkpoints. Use fixtures without PII and no remote connection, credentials, DDL, message, deployment or production write.

## Material addendum — Supabase fencing reference contract at 2026-10-17 07:56 CR

This addendum completes one local P1 unit while the authentic post-restart KROSS1 acceptance remains pending. It defines and tests the concurrency contract a future adapter for the existing Supabase mirror must preserve; it does not connect Supabase, create SQL/DDL, prove hosted durability or load Kross data.

### HECHO

- Feed writes now require a lease scoped to the canonical organization/property/Kross/reservation-mirror/feed key. Each successful acquisition advances one compare-and-swap fencing token atomically; the token is monotonic per feed.
- The store, not the request, supplies the authoritative clock. Its clock cannot move backwards inside one process, and an expired lease fails closed at the atomic write boundary.
- Durable attempt identity and execution ownership are separate: `attemptId` identifies append-only attempt evidence, while `writerLeaseId` identifies one execution lease. A timed-out execution can therefore retry the same durable attempt with a new lease and the next token without changing its request fingerprint.
- Lease-grant replay is idempotent only for the exact original `feedKey`, `leaseId`, `writerId`, expected token and TTL. Reusing a grant identifier with altered material is invalid and cannot replace the active lease.
- The feed executor receives only the fenced store surface. Unfenced row mutators remain internal to the local staging overlay and are not available to a future hosted feed adapter.
- Both atomic boundaries validate the complete active lease immediately before writing: whole-feed promotion and rejected receipt/quarantine append. Wrong token, writer, lease, feed, expired writer or superseded writer returns `fenced` before any mirror, canonical run, receipt, quarantine or checkpoint mutation.
- A lost acquisition CAS returns `lease_unavailable` before staging. Losing the lease after staging returns `writer_fenced` and does not fall back to writing a rejection receipt with the stale writer. Ordinary non-lease data CAS conflicts still retain their governed `checkpoint_changed` evidence under a valid fence.
- Exact receipt retries remain idempotent. Recovery after lease expiry was proven with the same `attemptId`, a new `writerLeaseId`, token 2, the same request fingerprint and one final atomic promotion, with no residue from the interrupted execution.
- Test fixtures contain no guest PII. No network request, credential, external message, Kross/Supabase write, DDL, permission change, deployment, push or pull request occurred.

### Verification

- RED: five expected focal failures against 37 passing tests demonstrated the missing lease acquisition/fencing surface and missing stale-writer rejection.
- GREEN focal dry-run suite: 47/47 PASS, including acquisition CAS loss, exact grant replay, altered-grant rejection, token/writer/lease/feed mismatch matrices, supersession, expiry, retry recovery and zero partial state.
- Full Kross feature graph: 98/98 PASS across 10 files.
- TypeScript: PASS. ESLint on the four changed Kross source/test files: PASS. `git diff --check`: PASS.
- Independent adversarial read-only review: 0 P0/P1. It specifically rechecked exact grant replay validation, separation of `attemptId` from `writerLeaseId`, expiry recovery, the narrowed feed-store surface, authoritative clock and both atomic fencing boundaries.
- The one aggregate runtime check for this pass found no KROSS1 mention, no KROSS1 inbound, no route invocation, no reader invocation and no outbound after the prior 06:53 CR cutoff. One unrelated inbound existed; it was not inspected for PII and did not activate this route. No inbound was simulated, sent or resent.

### PREPARADO

- The local reference contract now specifies the lease, fencing, idempotency, atomicity and failure semantics required from the future adapter for the existing Supabase mirror.
- A hosted adapter can be designed against the narrow fenced interface without granting OpenClaw a Supabase service role, a Kross credential or direct table mutation capability.

### BLOQUEADO / DESCONOCIDO

- Lease/token/grant state remains in memory. Process-restart durability, database isolation, transaction boundaries, SQL error mapping and hosted readback are not proven.
- No reviewed Supabase RPC/transaction implementation or DDL exists for this contract, and this unit neither authorizes nor performs one.
- No authentic KROSS1 inbound has exercised the corrected OpenClaw route after 04:25:11 CR; exactly one provider outbound and any available delivery receipt remain unverified.
- Supabase still has no verified Kross import from this artifact. The XLSX fallback remains dated and `sourceIsLive=false`; live prices, availability, payments, breakfast and physical presence remain unknown.

### Reversal

- Revert only the uncommitted local changes in `src/features/kross/normalize-reservation.ts`, `normalize-reservation.test.ts`, `dry-run-executor.ts`, `dry-run-executor.test.ts` and this checkpoint addendum. No external state rollback is required.

## SUPERSEDED NEXT — recorded at the Supabase-fencing addendum

`KROSS-SUPABASE-ADAPTER-BOUNDARY-01`: keep an authentic post-04:25:11 KROSS1 inbound as the preemptive acceptance gate if it arrives; otherwise add RED→GREEN tests and the smallest local adapter boundary that maps the fenced feed contract to one future server-side transaction in the existing Supabase mirror. Use a fake transport only and prove request minimization, no payload/PII/secrets, exact lease/CAS evidence, explicit `committed`/`conflict`/`fenced` outcomes and mandatory readback before success. Do not connect Supabase/Kross, create DDL, use credentials, send messages, deploy or write production.

## Material addendum — local Supabase adapter boundary at 2026-10-17 09:19 CR

This addendum completes the local adapter-boundary unit while the authentic post-restart KROSS1 acceptance remains pending. It uses only a fake transport and does not connect Supabase or Kross, create SQL/DDL, load hotel data, prove hosted durability or send any message.

### HECHO

- Added a versioned, server-only boundary that translates the existing fenced feed admissions into exactly one future transactional request for the existing Supabase mirror. The adapter has no Kross write method and gives OpenClaw no Supabase access.
- The request scope is exact and canonical: lowercase UUID organization/property plus Kross/reservation-mirror/feed identity, attempt, writer lease and monotonic fencing token. The authorized scope and transport are captured when the adapter is created.
- Only the minimum safe evidence can cross the port: hashes, cuts, reconciliation counts, safe mirror fields, CAS expectations, canonical runs, checkpoints and append-only receipts/quarantine. Original payloads, source references, arbitrary fields, PII, cookies, tokens, secrets and `service_role` are excluded.
- Receipt and quarantine fingerprints are regenerated from allowlisted fields before crossing the boundary. Duplicate-key or opaque fingerprint strings cannot smuggle hidden content.
- The relationship validator proves the exact feed graph and complete CAS universe. Row transitions are monotonic and derived from prior state: new row=`insert`; newer cut=`update`; same cut/same hash=`replay` without row rewrites; older cut or same-cut/different-hash fails closed. Feed checkpoints advance only to a strictly newer cut.
- Timestamp order is enforced through `sourceAsOf <= observedAt <= recordedAt`; expected-only replay may retain the prior checkpoint run key while still matching the current row hash and cut.
- Separate append-attempt transactions accept only a genuine replay receipt or a matched rejected/conflict receipt plus quarantine; they cannot claim promotion or checkpoint advancement without the atomic feed transaction. Persistible failure reasons are limited to paths the executor can actually admit, reason/operation/counts must agree, and `incomplete_batch` is valid exactly when the declared row count differs from the linked row count.
- The request is recursively frozen, locally constructed and tracked before execution. Untrusted, cyclic, sparse, over-wide, extra-field or malformed material fails closed.
- Each operation calls `writeOnce` at most once and never automatically resends. A timeout, malformed response, wrong correlation or wrong fencing token is ambiguous and receives exactly one readback; only an exact correlated readback can resolve it as committed. Valid conflict, fenced and known-unsent outcomes remain explicit.
- A nominal committed response is not success until readback matches the same request hash, operation, feed, attempt, lease, fencing token and proof hashes for checkpoint/receipt/quarantine. Missing or different readback fails closed.
- The existing hourly heartbeat was updated in place to continue with `KROSS-SUPABASE-RPC-COMPATIBILITY-01`; readback confirms the same automation ID, active hourly rule and target thread. No second scheduler was created.
- No Kross, Supabase or WhatsApp network request, credential, external message, hotel-data write, DDL, permission change, deployment, push or pull request occurred.

### Verification

- RED was demonstrated in successive adversarial batches: 7 failures with 35 passes for the initial graph/parser gaps; 7 failures with 56 passes for row/feed monotonicity and expected-only replay; 2 failures with 62 passes for duplicate-key fingerprint smuggling; 4 failures with 65 passes for false append-attempt promotion; 1 failure with 72 passes for an observation recorded in the future; 5 failures with 73 passes for reason, cut and expected-row relations; 1 failure with 78 passes for a non-empty rejected batch claiming zero rejected rows; 2 failures with 80 passes for an inadmissible `invalid_batch` receipt and a partial-row reason with an incomplete count; and 1 failure with 82 passes for a complete row set mislabeled `incomplete_batch`.
- GREEN focal adapter boundary: 83/83 PASS.
- Proportional Kross/MCP graph: 188/188 PASS across 13 files.
- Exact package-equivalent graph: application 56 files/631 tests PASS, plus workstation 4, agent evaluation 5, steward 7, menu 8, user profile 5+25, diagnostics 5, Kross current-state 17, Kross/hotel graph 170 and Portal authentication 97; all PASS.
- TypeScript: PASS. ESLint on the two boundary files: PASS. `git diff --check`: PASS.
- Independent final adversarial review: 0 P0/P1 for the declared local, server-only scope. Review covered feed/run/mirror/checkpoint relations, scope/run identity, monotonic cuts, reason/operation/count semantics, safe fingerprints, fencing and ambiguous-result handling. Mandatory hosting condition: admissions must come directly from the internal executor after authorized Kross intake; never expose `commitFeed`/`appendAttemptEvidence` through JSON/HTTP or accept deserialized admissions.
- The single aggregate P0 check for this pass found no new authentic KROSS1 inbound, route, reader or outbound after the prior cutoff. No inbound was simulated, sent or resent.
- Automation readback: `toro-control-operativo-cada-30-minutos`, `ACTIVE`, `FREQ=HOURLY;INTERVAL=1`, same target thread, new NEXT and executor-only gate present.

### PREPARADO

- The local contract is ready to be compared, read-only, against the existing Supabase schema/RPC surface before any hosted implementation is proposed.
- It defines the exact transactional, privacy, fencing, idempotency, ambiguity and readback semantics the future server-side RPC must preserve.

### BLOQUEADO / DESCONOCIDO

- There is no reviewed Supabase RPC/transaction or DDL implementing this boundary, no remote connection, no hosted persistence/readback and no import run from the XLSX artifact.
- The adapter is intentionally not an authentication boundary for deserialized admissions. Exposing it to HTTP/JSON or bypassing the internal executor would invalidate this approval and become a P1 integrity risk.
- No authentic KROSS1 inbound has exercised the corrected OpenClaw route after 04:25:11 CR, so exactly one provider outbound and any delivery receipt remain unverified.
- The dated XLSX still has `sourceIsLive=false`; prices, availability, payments, breakfast and physical presence remain unknown.

### Reversal

- Remove only `src/features/kross/supabase-adapter-boundary.ts`, `src/features/kross/supabase-adapter-boundary.test.ts` and this addendum to reverse the code unit. Do not revert the earlier normalized-hash, atomic-feed, durable-receipt or fencing work. To reverse only the scheduling change, restore the prior prompt in the same automation ID; do not create a second scheduler. No hotel, Kross, Supabase or WhatsApp state rollback is required.

## SUPERSEDED NEXT — completed by the RPC compatibility addendum

`KROSS-SUPABASE-RPC-COMPATIBILITY-01`: keep an authentic post-04:25:11 KROSS1 inbound as the preemptive acceptance gate if it arrives; otherwise inspect only the existing local Supabase migrations/schema/RPC contracts named by this checkpoint and map the boundary to the existing tables and transaction surface. Produce a read-only compatibility matrix and the smallest reviewed gap contract, preserving the internal executor-only admission gate. Do not create or run DDL, connect remotely, use credentials, expose HTTP/JSON admissions, send messages, deploy or write production.

## Material addendum — local Supabase RPC compatibility at 2026-10-17 09:47 CR

This addendum completes `KROSS-SUPABASE-RPC-COMPATIBILITY-01` through a strictly local, read-only inspection. It does not assert that any review-only or rollback SQL is applied, and it does not connect to Supabase, Kross or WhatsApp.

### HECHO

- The existing local surface is compatible with the Kross boundary only on the read side and as a security-pattern reference. The Kross hosted write surface is a **GAP**: no inspected SQL implements the atomic feed transaction, feed-scoped CAS/fencing, durable domain receipts/quarantine or correlated readback required by `kross.supabase.atomic-write.v1`.
- The single P0 check found one post-cutoff log mention of `KROSS1`, but it was a 751-character non-exact message with no inbound, direct-session, owner, `before_dispatch`, reader, outbound or receipt marker. It is not an authentic KROSS1 acceptance event. Only hashes, lengths, timestamps and booleans were inspected; no phone, guest or message body was printed.
- One bounded file inventory and targeted content searches were used. No broad schema inventory was rebuilt.
- The existing hourly heartbeat was updated in place to preserve P0 and wait for the specific review-only DDL authorization gate; it will not repeat this matrix or design SQL before authorization. No second scheduler was created.

### Compatibility matrix

| Boundary need | Existing local evidence | Classification | Smallest gap / risk |
|---|---|---|---|
| Reservation mirror | The rollback reconstructs `operations.current_reservations_safe` as a `security_invoker`/`security_barrier` view over `operations.reservations`, with org/property, operational fields, source flags, cuts and hashes (`supabase/drafts/rollback_current_reservations_safe_pre_20260923.sql:4-46`). The reader selects a narrower subset and scopes by org/property (`src/features/kross/current-state-read.ts:111-144`, `509-528`). | **PARTIAL / READ ONLY** | A rollback is not proof of the current base-table schema, constraints, RLS or writer grants. The old view also lists guest keys and payment fields; it must never become the OpenClaw projection. |
| Current-state health | Review-only SQL checks an invoker `integrations.kross_snapshot_health` view and an RLS-protected registry (`supabase/drafts/20261011_portal_narrow_read_v1.sql:1-4`, `56-68`). The reader requires promoted, fresh and safe health before reading rows (`src/features/kross/current-state-read.ts:348-440`). | **PARTIAL / READ GATE** | No inspected writer or promotion transaction proves that health advances only after a complete feed commit. Publishing health early would be a P1 false-current-state risk. |
| Scoped reservation identity | A rollback proves only the name `operations.reservations_kross_scope_external_uq`, not its indexed columns (`supabase/drafts/rollback_kross_reservation_scope_identity_20260923.sql:1-3`). The boundary requires exact org/property/feed identity (`src/features/kross/supabase-adapter-boundary.ts:99-140`). | **UNKNOWN** | The local SQL cannot prove uniqueness across organization, property, Kross, snapshot kind, feed and external reservation ID. |
| Import runs + row/feed checkpoints | The boundary commits mirrors, canonical runs, row checkpoints and one feed checkpoint as one graph (`src/features/kross/supabase-adapter-boundary.ts:56-88`). | **GAP** | Targeted SQL search found no `integrations.import_runs`, Kross row/feed checkpoint or equivalent CAS persistence. Direct multi-call writes could partially promote or advance a checkpoint early. |
| Feed lease + fencing | A separate **draft-only** TORO control-plane design has run-level lease owner, monotonic fencing and fenced transitions (`supabase/drafts/20260930_toro_control_plane_runtime_v1.sql:1-31`, `82-88`, `282-455`). | **PATTERN ONLY** | It is scoped to execution runs/tasks, not org/property/Kross/reservation-mirror/feed. Its broad server role also retains direct table update (`139-145`), so those functions are not a mandatory Kross write barrier. |
| Attempt receipts + quarantine | The control-plane draft has a generic server-only receipt envelope and append-only trigger, while explicitly preserving domain-specific receipts as authoritative (`supabase/drafts/20260930_toro_control_plane_runtime_v1.sql:147-239`, `517-539`). The boundary requires a Kross receipt and matched quarantine (`src/features/kross/supabase-adapter-boundary.ts:90-123`). | **PARTIAL PATTERN / DOMAIN GAP** | No inspected SQL persists the Kross receipt/quarantine pair or its proof hashes atomically. |
| Atomic mutation RPC | The only inspected Kross-related RPC is a review-only Portal **read** function with actor/org checks and a finite health projection (`supabase/drafts/20261011_portal_narrow_read_v1.sql:87-109`). The boundary requires exactly one private write per operation (`src/features/kross/supabase-adapter-boundary.ts:127-203`). | **GAP** | No Kross `commit_feed` or `append_attempt_evidence` transaction exists locally. Replacing it with direct table writes or several RPC calls is a P1 integrity failure. |
| Correlated readback | The boundary requires readback correlated to request hash, operation, scope, attempt, lease, fencing and proof, with no automatic resend (`src/features/kross/supabase-adapter-boundary.ts:142-223`). | **GAP** | Targeted SQL search found no Kross commit journal/readback RPC. Timeout cannot safely be classified as committed or retried. |
| Authorization / privacy | The read drafts demonstrate `SECURITY INVOKER`, role checks and narrow grants (`supabase/drafts/20261011_portal_narrow_read_v1.sql:87-130`); the generic runtime draft demonstrates revoking client access (`supabase/drafts/20260930_toro_control_plane_runtime_v1.sql:21-31`, `139-145`, `233-239`). The adapter is `server-only` and strips source references (`src/features/kross/supabase-adapter-boundary.ts:1-54`). | **COMPATIBLE PRINCIPLE, NOT IMPLEMENTATION** | Admissions must remain executor-internal. No OpenClaw/WhatsApp direct Supabase access, `service_role`, deserialized HTTP/JSON admission or sensitive view grant is acceptable. The adapter's internal provenance gate is architectural, not cryptographic. |
| WhatsApp current-state reader | The reader fails closed unless source health and each row are live, fresh, verified and Kross-authoritative (`src/features/kross/current-state-read.ts:236-265`, `333-499`). Rates/availability remain a separate live authority (`src/features/kross/current-state-read.ts:474-497`). | **READY FOR A VALID HOSTED MIRROR** | It cannot make the dated XLSX live and does not supply prices, availability, payments or physical presence. Its org/property filters are not authorization; the caller and hosted RLS must independently verify identity, membership and role. |

### Minimum reviewed gap contract

1. One private server-side transaction per `commit_feed` or `append_attempt_evidence`; no client/table fan-out.
2. Validate canonical scope, expected state, lease expiry and fencing token before the first mutation.
3. Atomically commit mirrors, canonical import runs, row checkpoints, feed checkpoint, receipt and any quarantine; zero partial promotion.
4. Exact idempotency/CAS by request, attempt and prior state; receipts and quarantine append-only.
5. A minimal commit journal/readback keyed and verified by request hash, feed, attempt, lease, fencing token and proof hashes.
6. Internal executor-to-adapter-to-RPC path only, with client grants revoked, no broad direct-table mutation path and no OpenClaw/WhatsApp credential or admission surface.
7. Continue exposing conversational reads only through the health gate plus the narrow current-reservation projection.

### PREPARADO

- The existing TypeScript boundary is the canonical request/outcome contract for a future hosted implementation; no second application contract is needed.
- The compatibility matrix identifies exactly which local read surfaces and security patterns may be reused and which Kross-specific persistence guarantees are absent.

### BLOQUEADO / DESCONOCIDO

- No authorized forward schema or Kross transaction/readback RPC exists in the inspected local SQL. Creating even a review-only migration is outside this pass's no-DDL boundary and needs specific authorization.
- The adapter does not cryptographically authenticate admission provenance; exposing its methods beyond the executor-internal call path would invalidate this review.
- The current hosted schema, policies, grants and drift were deliberately not queried; review-only and rollback files are evidence, not proof of production state.
- Supabase still has no verified Kross import run from this artifact, and the dated XLSX remains `sourceIsLive=false`.
- Authentic post-restart KROSS1 acceptance remains unverified.

### Verification

- Targeted local SQL searches returned zero matches for `integrations.import_runs`, any Kross write function, the atomic-write contract, feed checkpoint, attempt receipt, quarantine, writer lease or lease ID. Fencing-token matches belonged only to generic TORO execution drafts.
- Two independent read-only reviews found 0 current P0/P1 in this compatibility conclusion because it explicitly classifies the writer as GAP. Claiming writer compatibility, treating org/property filters as authorization or bypassing the atomic/RLS/readback gates would introduce P1 risks.
- No source code, SQL, runtime configuration, credentials or external state changed in this unit. `git diff --check` is the only required repository check after this documentary addendum.
- Automation readback: same `toro-control-operativo-cada-30-minutos` ID and target thread, `ACTIVE`, `FREQ=HOURLY;INTERVAL=1`, compatibility closed, authorization gate and no-repeat rule present.

### Reversal

- Remove only this compatibility addendum and restore its superseded NEXT heading. To reverse only the scheduler change, restore the prior prompt on the same automation ID; do not create another scheduler. No database, runtime, WhatsApp or Kross rollback is required.

## SUPERSEDED NEXT — authorization received 2026-10-17

`KROSS-SUPABASE-RPC-MIGRATION-DRAFT-01`: wait for Mauricio to explicitly authorize drafting **review-only, unapplied DDL plus exact rollback** for the minimum gap contract. After that authorization, create one local migration/rollback pair with static and adversarial checks; do not connect remotely, apply SQL, use credentials, grant OpenClaw/WhatsApp access, deploy or write production. Until authorized, the heartbeat may check the authentic KROSS1 P0 once per pass and otherwise must remain silent.

## Material addendum — review-only Kross RPC/rollback draft at 2026-10-17 13:35 CR

Mauricio explicitly authorized `KROSS-SUPABASE-RPC-MIGRATION-DRAFT-01` and explicitly prohibited applying it or connecting it to production. This addendum records one local review unit. No SQL was executed against any database.

### HECHO

- Added one forward design and one rollback design outside the applyable migration directory:
  - `supabase/drafts/20261017_kross_supabase_atomic_rpc_v1_review_only.sql`
  - `supabase/drafts/20261017_kross_supabase_atomic_rpc_v1_rollback_review_only.sql`
- Added `src/features/kross/supabase-rpc-migration-contract.test.ts` for static safety checks. The drafts remain in `supabase/drafts/`, not `supabase/migrations/`.
- The forward design preserves the existing `operations.reservations` mirror, rejects `source_is_live=true`, does not promote `kross_snapshot_registry`/`kross_snapshot_health`, keeps OpenClaw/WhatsApp away from database credentials, and sketches the private lease/fencing, atomic feed, append-only evidence and correlated-readback surfaces required by the existing server-only boundary.
- Both SQL files now contain an unconditional `REVIEW_ONLY_BLOCKED` execution gate before any DDL. Even a mistaken manual execution fails before creating, altering or dropping objects.
- Updated the existing hourly automation in place—same ID and target thread—to continue with `KROSS-SUPABASE-RPC-DRAFT-HARDENING-01`, preserve the execution block and check a new authentic KROSS1 only once per pass. No second scheduler was created.
- No Supabase/Kross connection, credential, DDL application, production write, grant, RLS change, deployment, push, PR or external message occurred.
- The attached WhatsApp evidence confirms that Mauricio used the correct private chat `TORO 0..` from his own WhatsApp account. The earlier 03:55 message reached TORO and received a 03:56 reply. The latest 13:16 message shows a clock, not a delivery check. Sanitized runtime aggregates from 13:16 through 13:21:43 found zero ingress, exact KROSS1 route, reader, outbound or receipt. The WhatsApp transport timed out at 13:20:13, reconnected at 13:20:17, and was healthy/listening at the diagnostic cutoff. Therefore the latest message never reached OpenClaw; it is not evidence of a failed KROSS1 agent route.

### Verification

- Static migration/rollback contract: 10/10 PASS after installing the explicit execution block.
- Proportional Kross graph: 12 files / 191 tests PASS.
- TypeScript `--noEmit`: PASS. ESLint on the new contract test and existing adapter boundary files: PASS. `git diff --check`: PASS.
- Two independent read-only adversarial reviews agreed on 0 P0 and 7 P1. A third focused design review supplied the required remediation contracts for graph parity, privileges and rollback quiescence.
- Local execution prerequisites are absent: no `psql`, Docker, Podman or installed Supabase CLI. The official Supabase CLI was used only to generate candidate names; its generated apply-directory files and temporary metadata were removed, leaving only the explicitly blocked review drafts.
- Automation readback: `toro-control-operativo-cada-30-minutos`, `ACTIVE`, `FREQ=HOURLY;INTERVAL=1`, current NEXT and `REVIEW_ONLY_BLOCKED` present.

### PREPARADO

- The draft captures the intended object surface and gives the next unit exact file/line targets. It is useful as a design artifact and threat-model input, not as executable migration authority.
- The repair design is bounded: normalize JSON-null semantics; enforce a bijective domain graph; build readback from persisted state; canonicalize timestamps; unify the PII/secret denylist; replace the spoofable GUC with a non-login database owner boundary; and make rollback quiescent before rechecking and dropping empty support state.

### BLOQUEADO / DESCONOCIDO

- **P1:** JSON `null` and SQL `NULL` are compared incorrectly, so a first commit would conflict.
- **P1:** SQL does not yet enforce the complete mirror/run/checkpoint/receipt graph or bijective CAS required by the TypeScript boundary.
- **P1:** Readback currently echoes request proof instead of rebuilding proof from persisted rows.
- **P1:** `timestamptz` round-trip formatting is not canonicalized across TypeScript/PostgreSQL.
- **P1:** the reservation trigger relies on a caller-settable custom GUC.
- **P1:** the SQL denylist misses normalized variants including `guestName` and `token` unless exact nested shapes catch them.
- **P1:** rollback does not yet quiesce concurrent RPCs and lock tables before its final empty-state check.
- The static suite cannot prove PostgreSQL syntax, RLS behavior, role ownership, transaction semantics or forward/RPC/rollback behavior. An isolated real-PostgreSQL test remains mandatory after the seven P1 repairs.
- Supabase still has no import run from this artifact. The XLSX remains dated and `sourceIsLive=false`; live price, availability, payments, breakfast and physical presence remain unknown.
- The corrected OpenClaw route still lacks a post-restart authentic KROSS1 acceptance event. A WhatsApp clock icon is not an inbound, outbound or receipt.

### Reversal

- Remove only the two review SQL files, `src/features/kross/supabase-rpc-migration-contract.test.ts`, and this addendum. Do not revert the earlier hash, feed, receipts, fencing or adapter-boundary work. No external-system rollback is required because nothing was applied or sent.

## NEXT

`KROSS-SUPABASE-RPC-DRAFT-HARDENING-01`: keep both SQL files fail-fast and review-only; repair the seven recorded P1 findings as one coherent local contract update, add RED→GREEN adversarial checks for null handling, graph bijection, persisted-state readback, canonical timestamps, normalized sensitive-key rejection, unspoofable effective-role enforcement and quiescent rollback, then request another independent P0/P1 review. Do not remove the execution block, connect a database, apply SQL, change live grants/RLS, deploy or touch production. If a new authentic KROSS1 inbound arrives first, validate it once without resending.
