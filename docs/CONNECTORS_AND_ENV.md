# TORO OS Connector Environment Plan

All connectors in v0.3 are `read_only` or `prepare_only`. External writes remain disabled until role, permission and approval persistence are live.

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


## OpenClaw / WhatsApp Same-Brain machine bridge

Prepared in PR #206. This is **not production activation** and does not prove the live
OpenClaw runtime or WhatsApp account.

Routes:
- machine: `POST /api/brain/openclaw`
- authorized manager pairing/revocation: `POST /api/brain/openclaw/pairing`

Machine operations:
- `context.resolve`
- `menu.read`
- `menu.resolve`
- `brain.read`
- `owner_attention.read`
- `internal_work.create`
- `channel_identity.consume_enrollment`

Required server-only configuration:
- `TORO_OPENCLAW_SERVICE_TOKEN` — dedicated OpenClaw -> TORO Bearer credential, minimum 32 characters.
- `TORO_CHANNEL_IDENTITY_HMAC_SECRET` — independent key used only by TORO to HMAC provider sender identity before database lookup/storage; minimum 32 characters.
- `SUPABASE_SECRET_KEY` — preferred server-side Supabase secret for the privileged identity bridge.
- `SUPABASE_SERVICE_ROLE_KEY` — compatibility fallback only while legacy service-role credentials remain in use.
- `SUPABASE_URL` — optional server-only URL alias; `NEXT_PUBLIC_SUPABASE_URL` is accepted as the non-secret URL fallback.

Security contract:
- never expose any of these secrets through `NEXT_PUBLIC_*`, browser bundles, chat, logs, Airtable or business tables;
- OpenClaw never receives the Supabase secret key;
- TORO receives the provider sender subject only over the authenticated machine request and stores/looks up only a scoped HMAC hash;
- display name, phone-like text, message body or contact name never authorize a user;
- unknown/unpaired/inactive/wrong-membership/role-less senders fail closed;
- personal User Vault remains unavailable in organization channel context;
- pairing requires an authenticated ADMIN/GERENCIA context plus explicit action confirmation;
- pairing token is random, short-lived, returned once, and only its SHA-256 hash is persisted;
- consuming a pairing challenge uses the existing service-only `consume_employee_channel_enrollment_v1` RPC;
- revocation is organization-scoped and explicit;
- canonical reads reuse TORO menu, Brain and Owner Attention projections;
- canonical writes reuse the idempotent `operations.tasks` internal-work contract;
- no WhatsApp outbound send, reservation/rate/payment mutation, raw shell or filesystem capability is added by this bridge.

Live activation remains blocked until direct OpenClaw Gateway evidence proves the intended
WhatsApp account/session, sender mapping, session isolation, replay behavior, recovery and
M01-M12 acceptance gates.
