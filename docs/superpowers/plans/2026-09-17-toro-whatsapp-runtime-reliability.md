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


## Target runtime update — 2026-09-18

**Target WhatsApp identity:** `+506 8370-9777`.

Keep the layers separate:

- **WhatsApp** is the guest communication transport.
- **WeSpeak** is a currently evidenced production conversation/runtime layer.
- **OpenClaw** is a separate agent/runtime dependency reported as linked to the target number; its actual config, logs and live session health are still unverified from TORO.
- **TERE** is the governed guest-facing behavior/context, not the transport.
- **TORO/Supabase** remains the governed hotel knowledge/policy layer.
- **Kross** remains authority for live price, availability, reservations, restrictions and payment-related booking truth.

Current evidence:
- WeSpeak alerts on 2026-09-18 confirm active production guest-message traffic.
- The OpenClaw scoped TORO status route exists and has passed tests/lint/build in PR #16.
- The OpenClaw runtime itself is not yet directly observable by TORO; therefore it must remain `configured_unverified`, never `reachable`, until a real probe succeeds.
- The service credential remains intentionally outside source control and must be configured only in approved secret stores on both runtimes.

### Guest-agent QA failures to block mechanically

Current runtime evidence shows recurring failure classes that should become pre-send checks:

1. **Date/weekday drift** — resolve dates to ISO values in the hotel timezone before producing weekday language.
2. **Numbered-room duplication** — a physical room number is a unique room identity; never quote two units of the same numbered room.
3. **Capacity reasoning drift** — do not explain unavailability with capacity unless the canonical room capacity actually fails the requested occupancy.
4. **Unverified promotions** — do not quote a precise discount when current promotion terms conflict or have not been checked against the authoritative booking source.
5. **Booking-link context loss** — prefer a direct official Kross link that preserves known dates, occupancy, language and currency.
6. **Menu hallucination** — do not invent provenance, ingredients, allergens, catch details, service windows or preparation rules.
7. **Room-feature drift** — canonical room facts override stale public copy; do not invent private pool, balcony or terrace.
8. **Cancellation/payment-policy conflict** — when current Kross terms and governed policy disagree, escalate/qualify instead of promising a refund, charge date or payment rule.
9. **Intent targeting** — promotions must not be injected into supplier, agency, already-booked or unrelated operational conversations.
10. **High-risk handoff** — payment verification, reservation mutation, refunds, identity-sensitive requests and unresolved in-stay incidents remain human-gated until explicit tools and idempotency controls exist.

### Required pre-send pipeline

For the OpenClaw/WhatsApp agent on the target number:

1. classify sender/context: guest, lead, existing booking, supplier, agency, staff or unknown;
2. isolate the DM session per channel + sender;
3. load only the minimum guest-safe governed context;
4. normalize dates/times before reasoning;
5. gate live commercial claims on Kross freshness/authority;
6. validate numbered-room identity, capacity and canonical amenity facts;
7. validate promotions/policies or explicitly abstain when conflicting;
8. generate deterministic official booking links with preserved context;
9. run a final policy/consistency check before sending;
10. emit structured telemetry for outcome, source freshness, escalation and runtime health without logging guest message bodies by default.

### OpenClaw runtime verification checklist

When runtime access is available, capture these results without exposing secrets:

- `openclaw status --deep`
- `openclaw channels status --probe`
- `openclaw doctor`
- `GET /health`
- active WhatsApp account/session identity confirms the target number
- `session.dmScope` isolates guest DMs
- guest-facing tool policy denies filesystem/runtime/exec/write capabilities unless explicitly required
- WhatsApp access policy and group policy are explicit rather than accidental defaults
- reconnect/watchdog activity is visible in logs
- a disconnect/retry test proves no duplicate outbound message or external side effect
- the scoped TORO status endpoint returns 401 for a bad credential, 503 when unconfigured, and the PII-free projection only when correctly configured.


## Demo/test disclosure state — 2026-09-21

Owner-approved behavior for TERE/OpenClaw demo sessions:

- Canonical config: `private.tere_configuration / tere-openclaw-demo-disclosure-once-20260921`.
- When a conversation is intentionally in demo/test mode, disclose it **once only** at the first appropriate assistant response.
- Do not prepend or repeat “modo de prueba”, “modo demo”, “test mode” or equivalent boilerplate on later turns in the same conversation.
- After the first disclosure, use the normal TERE/Dreamcatcher voice: human, clear, playful when natural, lightly surprising and useful; do not force a joke every turn.
- Persist the disclosure flag by isolated channel + sender + conversation/session.
- Reconnects, replay-safe retries, app-server restarts and handoffs must preserve the flag and must not produce a second generic disclosure.
- A specifically simulated action may still be labeled simulated when necessary to avoid confusion; that is separate from the generic demo disclosure.
- Reset only for a genuinely new demo session/conversation or an explicit tester reset.
- Real/production mode must not show a demo/test disclaimer.
- Acceptance test: in one demo conversation, the generic demo disclosure count is exactly 1 across normal turns, one replay-safe retry and one reconnect; in a new demo session it becomes 1 again; in real mode it is 0.

This rule is live in canonical TORO/Supabase configuration. It does **not** prove that the external OpenClaw host is consuming the configuration. Runtime application remains `configured_unverified` until direct host/session access confirms the target WhatsApp runtime loaded it.
