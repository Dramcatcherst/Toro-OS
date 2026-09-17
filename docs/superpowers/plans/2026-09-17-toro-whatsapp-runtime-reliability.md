# TORO WhatsApp Runtime Reliability Plan

**Date:** 2026-09-17
**Owner:** SOBRESITO with TORO oversight
**Canonical task:** `toro-runtime-health-whatsapp-reliability-2026-09`
**Scope:** Reliability and truthfulness of TORO when used through WhatsApp/OpenClaw and connected business sources.

## Evidence that triggered this plan

Mauricio supplied WhatsApp runtime evidence on 2026-09-17 showing:

- Kross unavailable, making occupancy, guests, arrivals, departures, room availability and reservation changes unavailable.
- Airtable reported reachable in one turn and temporarily unavailable later.
- Chrome profile `dreamcatcher-work` stopped; the expected business account is `admin@dreamcatcherhotel.com`. No password is stored in this plan.
- Alegra was not connected to the TORO runtime even though Alegra may be available through other ChatGPT/plugin contexts.
- A user-visible runtime error occurred: `Codex app-server connection closed before this turn finished. OpenClaw retried once when the stdio turn was still replay-safe`.
- Mauricio reports that these disconnects happen frequently.

The accessible TORO GitHub organization does not currently contain an OpenClaw repository, so OpenClaw process-level fixes are an external dependency until its code/configuration/logs are available.

## Reliability principles

1. **Never equate configured with connected.** A source is `reachable` only after a current probe succeeds.
2. **Every live claim carries freshness.** Runtime probes record `checkedAt`.
3. **Fail degraded, not fabricated.** If Kross is unavailable, TORO may report catalog facts but must not invent occupancy, arrivals, departures, availability, reservation changes or balances.
4. **Authority is domain-specific.** Kross remains transactional authority for live booking truth; Supabase/Airtable mirrors cannot silently replace it.
5. **Retries must be replay-safe.** A failed turn may be automatically retried only before any non-idempotent external side effect has occurred.
6. **Recovery should be observable.** Every disconnect/restart/retry should emit a structured event with source, timestamp, attempt and outcome.
7. **No credential leakage.** Health endpoints expose state and timestamps, never tokens, cookies or passwords.

## Runtime Source Health V1

States:

- `reachable`: active probe succeeded.
- `configured_unverified`: configuration exists but no runtime probe is implemented.
- `degraded`: configuration exists and the active probe failed.
- `unconfigured`: required runtime configuration is absent or unconfirmed.
- `blocked`: connector intentionally has no runtime connection or is administratively blocked.

Each source health record should include:

- connector id and display name
- configured boolean
- live boolean
- health state
- mode
- checkedAt or explicit `null` when there is no runtime probe
- safe human-readable detail
- no secrets

Supabase, Airtable and Vercel are the first active probes. Kross, Alegra, Codex and WhatsApp/OpenClaw must not be called live until an actual probe exists for that runtime.

## OpenClaw/app-server reliability requirements

When the OpenClaw runtime becomes accessible, implement in this order:

### R1 — Structured disconnect telemetry
Record one event per app-server lifecycle transition:

- `connected`
- `heartbeat_missed`
- `stdio_closed`
- `retry_started`
- `retry_succeeded`
- `retry_failed`
- `watchdog_restart`
- `session_recovered`
- `session_lost`

Minimum fields: timestamp, runtime/session id, turn id, event, retry count, replay-safe boolean, duration, outcome. Do not log message bodies, credentials or guest-private payloads by default.

### R2 — Heartbeat and watchdog
- periodic health heartbeat between OpenClaw and app-server
- missed-heartbeat threshold before declaring degraded
- watchdog restart after bounded failure threshold
- restart cooldown to avoid restart loops
- health state surfaced to TORO Systems

### R3 — Bounded exponential backoff
Suggested policy to validate against the actual runtime:

- attempt 1: immediate only when replay-safe
- attempt 2: short randomized delay
- subsequent retries: exponential backoff with jitter
- hard maximum attempts per turn
- circuit breaker after repeated failures
- manual/automatic reset only after heartbeat succeeds

No retry after a non-idempotent side effect unless an idempotency key proves the action was not duplicated.

### R4 — Turn checkpointing
Persist a minimal checkpoint before external actions:

- turn id
- current intent/operation class
- completed read-only steps
- pending side effects
- idempotency keys
- latest safe resume point

This allows recovery without replaying the entire conversation or duplicating writes.

### R5 — Degraded WhatsApp response policy
When a source is down, answer with three sections only when useful:

1. **Disponible ahora** — facts confirmed by healthy sources.
2. **No disponible / desactualizado** — facts that depend on an unhealthy source.
3. **Última comprobación** — source and timestamp.

Examples:

- If Kross is down: say room catalog is available but occupancy/availability/reservations are unavailable.
- If Airtable is down but Supabase is healthy: use only domains where Supabase is explicitly authoritative and label catalog freshness.
- If both are unhealthy: give no operational hotel status beyond runtime health itself.

## Chrome business runtime

Expected business account: `admin@dreamcatcherhotel.com`.

Recovery requirements when the browser runtime becomes accessible:

- bind `dreamcatcher-work` to the intended business profile
- verify session existence without exposing cookies/passwords
- perform a read-only smoke test
- define restart/reconnect procedure
- add browser health to TORO Systems only after a real probe exists

## Kross resilience

Kross remains the live booking authority. To reduce single-source downtime impact without replacing Kross authority:

1. create a timestamped read-only daily/near-real-time operational snapshot when integration access permits;
2. store `source_as_of` and clearly label snapshot age;
3. never call the snapshot current availability when Kross is offline;
4. use it only as last-known operational context;
5. surface `Kross unavailable · snapshot as of <timestamp>` in WhatsApp/TORO.

## Acceptance criteria

Runtime reliability is not considered complete until:

- [x] TORO has explicit connector health states.
- [x] Supabase has a real read-only runtime probe in PR #16.
- [x] Static `Ready`/`Active` status is no longer sufficient to claim a connector is live.
- [ ] TORO Systems screen exposes the governed health snapshot.
- [ ] OpenClaw/app-server logs or source/configuration become accessible.
- [ ] Disconnect frequency baseline is measured for at least one representative operating period.
- [ ] Heartbeat/watchdog/backoff behavior is implemented and verified in the actual WhatsApp runtime.
- [ ] Replay-safe behavior is tested around interrupted turns.
- [ ] Chrome `dreamcatcher-work` recovery is verified with the authorized business profile.
- [ ] Kross has either a reliable live read path or an explicitly stale fallback snapshot with `source_as_of`.
- [ ] A WhatsApp “estado del hotel” response is tested while Kross healthy and while Kross unavailable.

## Non-goals / safety gates

- Do not apply live Supabase schema or RLS changes as part of this plan without a separate reviewed migration/cutover.
- Do not store passwords, cookies or connector secrets in GitHub/Airtable notes.
- Do not make financial writes, Kross reservation writes or guest communications as part of a health check.
- Do not merge PR #16 or promote it to production until inherited hosted/security QA gates are satisfied.
