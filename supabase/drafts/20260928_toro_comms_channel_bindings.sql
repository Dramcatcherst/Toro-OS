-- DRAFT ONLY — NOT AUTHORIZED FOR PRODUCTION APPLY
-- TORO Comms: organization communication endpoint/binding registry
-- Date: 2026-09-28
-- Parent: docs/product/TORO_COMMS_MAILBOX_BINDINGS_V1.md
--
-- This draft stores connection metadata only. It MUST NOT store OAuth tokens,
-- passwords, API keys, recovery codes, cookies, or other secret material.

create table if not exists integrations.communication_channel_bindings (
  id uuid primary key default gen_random_uuid(),

  org_id uuid not null references public.organizations(id),
  property_id uuid null references public.properties(id) on delete set null,

  channel text not null
    check (channel in (
      'email','whatsapp','sms','messenger','instagram','portal','other'
    )),

  provider text not null,

  endpoint_kind text not null default 'unknown'
    check (endpoint_kind in (
      'user_mailbox',
      'alias',
      'group',
      'delegated_mailbox',
      'shared_mailbox',
      'routed_address',
      'phone',
      'portal_identity',
      'other',
      'unknown'
    )),

  normalized_endpoint text not null,
  display_name text null,

  business_role text not null default 'other'
    check (business_role in (
      'info',
      'reception',
      'accounting',
      'providers',
      'admin',
      'guest',
      'system',
      'other'
    )),

  provider_account_ref text null,
  source_base_id text null,

  auth_mode text not null default 'unknown'
    check (auth_mode in (
      'oauth_user',
      'oauth_delegated',
      'service_account',
      'workspace_delegation',
      'managed_runtime',
      'api_token',
      'unknown'
    )),

  auth_status text not null default 'unverified'
    check (auth_status in (
      'unverified',
      'pending',
      'connected',
      'degraded',
      'revoked',
      'disconnected'
    )),

  read_enabled boolean not null default false,
  draft_enabled boolean not null default false,
  send_enabled boolean not null default false,
  delete_enabled boolean not null default false,
  admin_enabled boolean not null default false,

  ingestion_mode text not null default 'none'
    check (ingestion_mode in (
      'none',
      'manual',
      'poll',
      'history_push',
      'webhook'
    )),

  ingestion_status text not null default 'not_configured'
    check (ingestion_status in (
      'not_configured',
      'backfill_pending',
      'backfilling',
      'syncing',
      'healthy',
      'degraded',
      'paused'
    )),

  -- Reference to a server-side vault/secret object only. Never put secret value here.
  credential_ref text null,

  -- Non-secret provider checkpoint/history identifier when appropriate.
  provider_checkpoint_ref text null,

  last_backfill_at timestamptz null,
  last_sync_at timestamptz null,
  last_event_at timestamptz null,
  last_error_code text null,

  verification_status text not null default 'unverified'
    check (verification_status in (
      'unverified',
      'partial',
      'verified',
      'conflict'
    )),
  verified_at timestamptz null,
  verified_by text null,

  source_system text not null default 'TORO Comms',
  source_ref text null,
  notes text null,

  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (org_id, channel, provider, normalized_endpoint),

  check (not admin_enabled or auth_status = 'connected'),
  check (not delete_enabled or send_enabled),
  check (not send_enabled or draft_enabled),
  check (
    verification_status <> 'verified'
    or (verified_at is not null and verified_by is not null)
  )
);

comment on table integrations.communication_channel_bindings is
  'Server-only TORO Comms registry for organization channel endpoints and provider binding health. Contains no raw credentials or OAuth tokens.';

alter table integrations.communication_channel_bindings enable row level security;

revoke all on table integrations.communication_channel_bindings from public;
revoke all on table integrations.communication_channel_bindings from anon;
revoke all on table integrations.communication_channel_bindings from authenticated;

grant select, insert, update, delete
on table integrations.communication_channel_bindings
to service_role;

create index if not exists communication_channel_bindings_org_active_idx
  on integrations.communication_channel_bindings (org_id, active);

create index if not exists communication_channel_bindings_health_idx
  on integrations.communication_channel_bindings
  (auth_status, ingestion_status, verification_status);

create index if not exists communication_channel_bindings_source_base_idx
  on integrations.communication_channel_bindings (source_base_id)
  where source_base_id is not null;

-- V1 intentionally defines no anon/authenticated policies.
-- All binding access is through trusted server-side TORO routes.
-- Portal/WhatsApp status projections require a separately reviewed API/view/RPC.
-- No triggers call external providers from Postgres.
-- No secret value may be stored in credential_ref.
