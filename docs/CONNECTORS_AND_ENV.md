# TORO OS Connector Environment Plan

All connectors in v0.3 are `read_only` or `prepare_only` unless a route is explicitly documented as an authenticated internal workflow. External business-system writes remain disabled until role, permission and approval persistence are live.

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

Required when using the legacy read connector:

- `AIRTABLE_TOKEN`
- `AIRTABLE_BASE_ID`

Allowed now: read schemas, read records, inspect source authority.

Blocked now: create/update/delete records.

Decommission note: Dreamcatcher production data is moving to canonical Supabase. Do not point `AIRTABLE_BASE_ID` at a base approved for retirement without registering that dependency in the decommission audit.

## Supabase Revenue Admin

Private page: `/revenue`

Private routes:

- `POST /api/auth/revenue/login`
- `GET /api/auth/revenue/me`
- `POST /api/auth/revenue/logout`
- `GET /api/revenue/agency-rates`

Required environment:

- preferred server-only name: `SUPABASE_PUBLISHABLE_KEY`
- accepted compatibility alias: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- configure exactly an enabled Supabase **publishable/anon** key, never a service-role key
- optional `SUPABASE_URL` (defaults to the canonical Dreamcatcher Supabase project URL in server code)

The Revenue routes are server-side, so `SUPABASE_PUBLISHABLE_KEY` is preferred even though Supabase publishable keys are designed for public clients. Never configure a service-role key in browser code or expose any privileged credential through a public environment variable.

Authentication:

- Supabase Auth email/password
- access and refresh tokens stored in HttpOnly cookies
- private Revenue rows are read server-side with the authenticated user's JWT
- database RLS and RPC authorization require one of `ADMIN`, `GERENCIA`, or `REVENUE`
- anonymous users cannot execute the private Revenue lookup RPC

Canonical source:

- `revenue.*`
- `public.get_current_revenue_access()`
- `public.get_agency_rate_lookup(...)`

Current verified scope is room-by-season agency pricing. Occupancy is informational only and does not alter price. Villa pricing must not be invented until a verified canonical source is modeled.

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
