# TORO OS Phase 1 — Rollout and Rollback Runbook

## Goal

Validate the Phase 1 Executive Shell in a non-production path before any legacy Airtable decision interface is reclassified or retired.

Phase 1 includes:
- authenticated TORO shell
- explicit role resolution
- Mauricio Executive Home
- governed executive decisions
- audited decision actions
- governed global search
- explicit loading / empty / stale / forbidden / error states
- mobile-first critical-flow E2E

## Hard gates

Do not classify Airtable Command Center as replacement-ready until ALL gates below pass.

### Gate A — Database branch validation

Apply the Phase 1 migrations to a Supabase development branch first:

1. `20260914080000_toro_decision_read_model.sql`
2. `20260914082000_toro_decision_actions.sql`
3. `20260914084000_toro_global_search.sql`

Require:
- migration success
- unauthenticated decision read/action denied
- authenticated non-authorized decision action denied
- explicit FOUNDER test account can execute development-only fixture action
- `ADMIN` without explicit `app_metadata.toro_role=FOUNDER` cannot execute founder-only action
- search returns only org-scoped rooms/projects/non-private knowledge
- finance, guest-private and private-knowledge payloads are absent
- audit evidence exists for the fixture action

Never use production executive decisions as mutation fixtures.

### Gate B — Preview deployment

Preview must be `READY` and configured with environment variable names documented in `docs/CONNECTORS_AND_ENV.md`.

Required application behavior:
- unauthenticated `/toro` redirects to `/login`
- dedicated Founder E2E identity reaches Executive Home
- restricted E2E identity does not receive Founder authorization
- no browser bundle contains a service-role secret

### Gate C — Automated verification

Run:

```text
npm test
npm run lint
npm run build
npm run test:e2e -- tests/e2e/toro-phase-1.spec.ts
```

Unit/lint/build must pass with no skipped critical assertions.

Playwright requires environment-only test inputs:
- `TORO_E2E_BASE_URL`
- `TORO_E2E_FOUNDER_EMAIL`
- `TORO_E2E_FOUNDER_PASSWORD`
- `TORO_E2E_RESTRICTED_EMAIL`
- `TORO_E2E_RESTRICTED_PASSWORD`

Development-only mutation test additionally requires:
- `TORO_E2E_MUTATION_ENABLED=true`
- `TORO_E2E_DECISION_TITLE` pointing to an intentionally seeded development fixture

A skipped Playwright suite is NOT Phase 1 completion evidence.

### Gate D — Mauricio parity review

Mauricio validates on mobile:
1. Executive Home has the five intended attention blocks.
2. Maximum five immediate decisions are shown.
3. Decision wording/recommendation/evidence matches the canonical business process.
4. Search results are useful and do not expose irrelevant/private domains.
5. Common safe actions take no more than three taps where practical.
6. Error/stale states are clear and do not silently present stale data as current.
7. Logout works.

Record every mismatch before cutover.

### Gate E — Cutover evidence

Store in Supabase evidence records:
- deployed commit SHA
- preview deployment ID / URL reference
- migration branch/project reference
- tested roles
- automated verification timestamp
- Mauricio parity timestamp
- parity result
- residual blockers
- rollback trigger owner

Only after Gate A–E pass may Command Center dependency be marked replacement-ready/inactive.
Historical Command Center records remain archived.

## Rollback

Rollback is intentionally simpler than forward cutover.

If Phase 1 preview produces authorization, data-quality or workflow mismatches:
1. do not merge/promote the feature branch;
2. do not change Airtable dependency status;
3. disable preview access if necessary;
4. preserve audit/test evidence;
5. revert the failing app commit or database migration in the development branch;
6. rerun unit/lint/build/RLS/E2E before another parity review.

If a production migration is eventually approved and fails after promotion:
- stop writes through the affected TORO action;
- use the reviewed rollback migration/process prepared from the development branch test;
- keep Airtable backup/reference untouched until restoration is verified;
- reconcile any successful audited actions before re-enabling writes.

## Exit criteria

Phase 1 is complete only when:
- all app tests/lint/build pass;
- development-branch database authorization tests pass;
- real preview E2E passes without skipped critical suites;
- Mauricio parity is accepted;
- cutover evidence exists;
- no validated Phase 1 decision flow requires raw Airtable.

Until then, status is `IMPLEMENTED / NOT CUT OVER` rather than `DONE`.
