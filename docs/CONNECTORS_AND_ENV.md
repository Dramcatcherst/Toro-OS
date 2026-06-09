# TORO OS Connector Environment Plan

All connectors in v0.3 are `read_only` or `prepare_only`. External writes remain disabled until role, permission and approval persistence are live.

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
