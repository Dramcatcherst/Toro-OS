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

## OpenClaw bridge reconciliation — 2026-10-24

This is the existing machine-identity bridge (PR206), reconciled with current main. It is not a new gateway, a live deployment or permission to grant a role automatically.

- Deploy the reviewed bridge only in an `internal` TORO environment. The public/Portal deployment intentionally rejects this route; possession of a machine bearer or a server key does not change that perimeter. No new environment flag was added.
- The dedicated `TORO_OPENCLAW_SERVICE_TOKEN` authenticates the runtime. `TORO_CHANNEL_IDENTITY_HMAC_SECRET` hashes its verified channel subject. Supabase privileged credentials stay in TORO's server; never send them to WhatsApp, OpenClaw prompts or clients. Neither credential confers a human business role.
- The host must derive channel/connection/subject from the authenticated transport event. Never populate actor identity, organization, role or capability from conversation text or model tool arguments. One authorized manager enrollment establishes the channel binding; subsequent messages use that binding and current canonical roles without repeated login. This employee bridge does not invent a guest/prospect membership.
- Canonical phone recognition and onboarding completion never assign or upgrade a role. The owner/admin authorizes the role explicitly; the resolver only reads active identity, employee, organization membership and role records, and respects revocation.
- Current main already exposes the canonical Brain and Owner Attention client-injected providers. Reuse them unchanged, including read enablement, scope checks, reporting timezone/coverage and source-availability behavior.
- `TORO_PORTAL_READ_TRANSPORT=rpc_v1` is a user-session transport. It revalidates the actual Supabase session and cannot be treated as a machine bearer transport. Bridge reads return a configuration failure before privileged allocation under that setting; they never silently downgrade. The reviewed internal direct-read path remains separate from the Portal session adapter while using the same canonical projections.
- Internal task creation keeps the existing `TORO_INTERNAL_WORK_WRITE_ENABLED` gate, manager role and same-organization scope. An exact retry replays one task; changed content under the same key produces HTTP409, including a concurrent unique-key collision. Recognition alone never enables task writes.
- Reconciliation tests cover the deployment boundary and dedicated credentials, existing role denial, canonical task replay/conflict, and the Portal transport mismatch. Local deployment-boundary regression: 11/11; full dependency-backed CI is recorded on the exact PR head after it completes.

No production environment variable, secret, enrollment, role, grant, database row, deployment or external message was changed by this reconciliation. Current AWS host/caller wiring, live source freshness, channel binding and end-to-end WhatsApp evidence remain required. Code passing CI does not establish those facts.

