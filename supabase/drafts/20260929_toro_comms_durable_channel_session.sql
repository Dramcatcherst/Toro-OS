-- DRAFT ONLY — NOT AUTHORIZED FOR PRODUCTION APPLY
-- TORO Comms: durable channel continuation + replay receipts
-- Date: 2026-09-29
-- Parent: docs/product/TORO_WHATSAPP_OPENCLAW_SAME_BRAIN_V1.md
--
-- Requires the separately reviewed communication_channel_bindings draft.
-- Stores no raw phone, chat id, provider message id, message body or credential.
-- Business truth continues to live in canonical TORO objects.

create table if not exists integrations.communication_channel_sessions (
  id uuid primary key default gen_random_uuid(),
  binding_id uuid not null
    references integrations.communication_channel_bindings(id) on delete restrict,
  org_id uuid not null references public.organizations(id) on delete restrict,
  channel_identity_id uuid not null
    references public.employee_channel_identities(id) on delete restrict,
  actor_user_id uuid not null references public.app_users(id) on delete restrict,
  actor_employee_id uuid null references public.employees(id) on delete restrict,

  provider_conversation_hash text not null
    check (provider_conversation_hash ~ '^[a-f0-9]{64}$'),

  status text not null default 'active'
    check (status in ('active','closed','revoked')),
  active_scope text not null default 'work_org'
    check (active_scope = 'work_org'),

  current_menu_key text null,
  current_workflow_key text null,
  active_project_key text null,
  active_task_key text null,
  pending_approval_key text null,

  continuation_state jsonb not null default '{}'::jsonb,
  human_layer_version text not null,
  human_layer_hash text not null
    check (human_layer_hash ~ '^[a-f0-9]{64}$'),

  last_message_at timestamptz null,
  expires_at timestamptz not null,
  revoked_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (binding_id, provider_conversation_hash),

  check (
    (status = 'revoked' and revoked_at is not null)
    or (status <> 'revoked' and revoked_at is null)
  ),
  check (jsonb_typeof(continuation_state) = 'object')
);

comment on table integrations.communication_channel_sessions is
  'Server-only TORO Comms continuation state bound to one verified actor and organization. Contains only HMAC-derived provider conversation locators; it is not business memory.';

create table if not exists integrations.communication_channel_receipts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null
    references integrations.communication_channel_sessions(id) on delete cascade,
  binding_id uuid not null
    references integrations.communication_channel_bindings(id) on delete restrict,
  org_id uuid not null references public.organizations(id) on delete restrict,

  direction text not null check (direction in ('inbound','outbound')),
  event_kind text not null
    check (event_kind in ('message','ack','action','result','error','reminder')),
  receipt_status text not null default 'accepted'
    check (receipt_status in (
      'received','accepted','processed','delivered','failed','denied'
    )),

  idempotency_hash text not null
    check (idempotency_hash ~ '^[a-f0-9]{64}$'),
  provider_message_hash text null
    check (
      provider_message_hash is null
      or provider_message_hash ~ '^[a-f0-9]{64}$'
    ),
  payload_digest text null
    check (payload_digest is null or payload_digest ~ '^[a-f0-9]{64}$'),

  source_archive_id uuid null
    references integrations.source_row_archive(id) on delete set null,
  canonical_object_type text null,
  canonical_object_key text null,
  correlation_id uuid not null default gen_random_uuid(),

  occurred_at timestamptz not null default now(),
  processed_at timestamptz null,
  error_code text null,
  created_at timestamptz not null default now(),

  unique (binding_id, direction, idempotency_hash),

  check (
    (canonical_object_type is null and canonical_object_key is null)
    or (canonical_object_type is not null and canonical_object_key is not null)
  )
);

comment on table integrations.communication_channel_receipts is
  'Minimal replay/delivery/action evidence. It links hashed channel events to canonical TORO objects without copying message bodies or secrets.';

alter table integrations.communication_channel_sessions enable row level security;
alter table integrations.communication_channel_receipts enable row level security;

revoke all on table integrations.communication_channel_sessions from public;
revoke all on table integrations.communication_channel_sessions from anon;
revoke all on table integrations.communication_channel_sessions from authenticated;
revoke all on table integrations.communication_channel_receipts from public;
revoke all on table integrations.communication_channel_receipts from anon;
revoke all on table integrations.communication_channel_receipts from authenticated;

grant select, insert, update, delete
on table integrations.communication_channel_sessions
to service_role;
grant select, insert, update, delete
on table integrations.communication_channel_receipts
to service_role;

create index if not exists communication_channel_sessions_actor_active_idx
  on integrations.communication_channel_sessions
  (org_id, actor_user_id, status, expires_at);

create index if not exists communication_channel_sessions_identity_idx
  on integrations.communication_channel_sessions
  (channel_identity_id, status);

create index if not exists communication_channel_receipts_session_time_idx
  on integrations.communication_channel_receipts
  (session_id, occurred_at desc);

create index if not exists communication_channel_receipts_canonical_idx
  on integrations.communication_channel_receipts
  (org_id, canonical_object_type, canonical_object_key)
  where canonical_object_type is not null;

-- V1 intentionally defines no anon/authenticated policies.
-- Reads/writes occur only through reviewed server-side TORO routes.
-- Cross-table actor/org consistency must be re-resolved at the server boundary.
-- Source payload retention/redaction remains governed by source_row_archive policy.
-- No trigger sends an external message or performs a business action.
