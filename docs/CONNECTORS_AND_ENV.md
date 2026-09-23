# TORO OS Connector Environment Plan

All connectors in v0.3 are `read_only` or `prepare_only`. External writes remain disabled until role, permission and approval persistence are live.

## TORO Phase 1 — Supabase Auth

Browser/server SSR clients use only the Supabase project URL and a **publishable** key.

Required for TORO Preview/runtime:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (browser-compatible public key)
- `SUPABASE_PUBLISHABLE_KEY` may be used by server-side code as a compatible public alias, but browser code must not depend on a non-`NEXT_PUBLIC_` variable.

Forbidden in browser/public environment variables:

- Supabase service-role keys
- Supabase secret keys
- database passwords
- user passwords or session tokens

Founder authorization is not inferred from `ADMIN`. It requires explicit Auth App Metadata `toro_role=FOUNDER` plus an active, non-revoked `ADMIN` or `GERENCIA` organization membership.

## TORO Phase 1 — Protected E2E

`tests/e2e/toro-phase-1.spec.ts` and `.github/workflows/phase1-preview-e2e.yml` use these names:

- `TORO_E2E_BASE_URL`
- `TORO_E2E_FOUNDER_EMAIL`
- `TORO_E2E_FOUNDER_PASSWORD`
- `TORO_E2E_RESTRICTED_EMAIL`
- `TORO_E2E_RESTRICTED_PASSWORD`
- `VERCEL_AUTOMATION_BYPASS_SECRET` (Vercel Deployment Protection automation bypass)
- `TORO_E2E_DECISION_TITLE` (only for the disposable mutation fixture)
- `TORO_E2E_MUTATION_ENABLED` (`true` only while the disposable fixture is present)

The protected Vercel Preview requires the automation bypass secret for CI. Playwright sends it only as the `x-vercel-protection-bypass` request header and requests the bypass cookie. Never place the bypass secret in public/client environment variables.

Passwords and the Vercel automation bypass secret must be supplied only through protected CI/local environment secrets. Never commit them, paste them into chat, store them in Airtable, or expose them to Vercel public runtime variables.

The restricted E2E identity must be a dedicated non-Founder identity; do not silently repurpose a real staff account. Mutation E2E may act only on a clearly disposable test decision, never on a live business decision.

The Phase 1 E2E workflow may complete with a clear `credential gate pending` notice when protected secrets are not configured. That state is **not** an E2E pass; Stage A remains blocked until Playwright actually executes the Founder and restricted paths.

## Internal Approval Ledger

Route: `/api/approvals`

Persistence backends:

- `BLOB_READ_WRITE_TOKEN` present: durable internal persistence in Vercel Blob at `toro-os/system/approval-ledger.json`
- local non-Vercel runtime: durable local file at `.toro-data/approval-ledger.json`
- Vercel without Blob token: cookie fallback only, not durable across browsers/users

Allowed now: persist internal approval decisions for TORO OS UI state.

Blocked now: write approval outcomes into external business tools automatically.

## Airtable

Route: `/api/connectors/airtable`

Optional live-read query:

`/api/connectors/airtable?tableId=<allowlisted-table-id>&pageSize=10`

Security contract:
- requires a valid TORO session with FOUNDER or SYSTEMS role
- `tableId` must exist in the declared `airtableTables` allowlist
- only the field IDs declared for that table are projected to Airtable
- `pageSize` is bounded to 1–25
- arbitrary table IDs never reach the server Airtable token

Required later:

- `AIRTABLE_TOKEN`
- `AIRTABLE_BASE_ID`

Allowed now: read allowlisted schemas/projections, read only declared safe fields, inspect source authority.

Blocked now: arbitrary table reads, undeclared fields, create/update/delete records.

## Vercel

Route: `/api/connectors/vercel`

Required later:

- `VERCEL_TOKEN`
- `VERCEL_PROJECT_ID`
- `VERCEL_TEAM_ID`

Allowed now: show preview URL, deployment status plan.

Blocked now: promote production automatically.

## Connector Health

Route: `/api/connector-health`

Purpose:

- aggregate safe server-side connector status
- show whether each connector is `live_read`, `read_only`, `prepare_only` or `blocked`
- separate configured-but-not-live from truly live data access

## GitHub / Codex

Route: `/api/connectors/github-codex`

Required later:

- `GITHUB_TOKEN`
- `GITHUB_REPOSITORY`

Allowed now: prepare issue payloads and Codex task scope.

Blocked now: create issues/tasks unless the approval state is `Approved`.

## Dropbox

Route: `/api/connectors/dropbox`

Required later:

- `DROPBOX_ACCESS_TOKEN`

Allowed now: prepare asset resolver plan.

Blocked now: delete, move or mutate media.

## OpenAI

Route: `/api/agent/prepare`

Required later:

- `OPENAI_API_KEY`

Allowed now: policy-gated draft response shape.

Blocked now: agent-triggered external execution.

## Policy Rule

Any action with external impact, critical risk or execution intent must route through:

1. Policy engine
2. Approval record
3. Audit log
4. Connector-specific adapter
5. Human approval before execution


## API Surface Authorization

All internal `/api/*` routes now require an explicit authorization gate.

Role policy:
- Airtable and Vercel connector metadata: FOUNDER / SYSTEMS
- GitHub-Codex prepare: FOUNDER / SYSTEMS
- Dropbox prepare: FOUNDER / GROWTH / SYSTEMS
- approval ledger GET/POST: FOUNDER / GERENCIA
- connector health: FOUNDER / SYSTEMS
- operational status (human): FOUNDER / GERENCIA / SYSTEMS
- agent prepare, policy evaluate and module registry: any authenticated TORO role

Unauthenticated requests fail with 401. Authenticated roles outside a route allowlist fail with 403.

## OpenClaw service-to-service status reader

Route: `/api/service/operational-status`

Environment:
- `TORO_OPENCLAW_STATUS_TOKEN`

Security contract:
- disabled by default when the secret is absent or shorter than 32 characters
- uses a dedicated Bearer credential; never reuses a Founder cookie or user password
- constant-time credential comparison
- GET/read-only only
- response is a reduced PII-free projection: hotel aggregate state, source summary, warnings and governed `chatSummary`
- connector-level internal detail is not returned
- response uses `Cache-Control: private, no-store`

The same secret must be configured independently in the approved OpenClaw runtime and the TORO server environment. Do not store it in GitHub source, Airtable, Supabase application tables, chat messages, or browser-visible variables. Rotate it if runtime access changes.

Until both sides are configured, this endpoint intentionally returns `503 service_auth_unconfigured`.
