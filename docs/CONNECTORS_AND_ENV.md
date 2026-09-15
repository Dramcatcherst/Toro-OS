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

`tests/e2e/toro-phase-1.spec.ts` consumes these names:

- `TORO_E2E_BASE_URL`
- `TORO_E2E_FOUNDER_EMAIL`
- `TORO_E2E_FOUNDER_PASSWORD`
- `TORO_E2E_RESTRICTED_EMAIL`
- `TORO_E2E_RESTRICTED_PASSWORD`
- `TORO_E2E_DECISION_TITLE` (only for the disposable mutation fixture)
- `TORO_E2E_MUTATION_ENABLED` (`true` only while the disposable fixture is present)

Passwords must be supplied only through protected CI/local environment secrets. Never commit them, paste them into chat, store them in Airtable, or expose them to Vercel public runtime variables.

The restricted E2E identity must be a dedicated non-Founder identity; do not silently repurpose a real staff account. Mutation E2E may act only on a clearly disposable test decision, never on a live business decision.

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

`/api/connectors/airtable?tableId=tblHVdeHMb02gPxFP&pageSize=10`

Required later:

- `AIRTABLE_TOKEN`
- `AIRTABLE_BASE_ID`

Allowed now: read schemas, read records, inspect source authority.

Blocked now: create/update/delete records.

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
