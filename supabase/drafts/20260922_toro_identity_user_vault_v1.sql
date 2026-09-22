-- DRAFT ONLY — TORO Identity + User Vault v1
-- Branch: feat/toro-identity-user-vault-v1-20260922
-- Date: 2026-09-22
--
-- DO NOT APPLY TO PRODUCTION DIRECTLY.
-- This draft intentionally contains no destructive statements and no data backfill.
-- It must pass isolated Postgres/RLS tests before any reviewed migration is produced.

begin;

-- ---------------------------------------------------------------------------
-- TORO Identity: membership is distinct from role.
-- Existing public.user_roles continues to represent authorization roles.
-- Existing public.employees continues to represent the employment relationship.
-- ---------------------------------------------------------------------------

create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  user_id uuid not null references auth.users(id) on delete cascade,
  membership_type text not null
    check (membership_type in ('employee','owner','contractor','advisor','provider','other')),
  status text not null default 'invited'
    check (status in ('invited','active','suspended','offboarded')),
  joined_at timestamptz,
  offboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, user_id),
  check (
    (status = 'offboarded' and offboarded_at is not null)
    or status <> 'offboarded'
  )
);

alter table public.organization_memberships enable row level security;

-- User can always inspect their own memberships.
create policy organization_memberships_self_read
on public.organization_memberships
for select
to authenticated
using (user_id = (select auth.uid()));

-- Privileged organization roles may inspect membership metadata.
-- This does NOT expose TORO Personal/User Vault content.
create policy organization_memberships_privileged_read
on public.organization_memberships
for select
to authenticated
using (
  (select private.has_org_role(
    organization_memberships.org_id,
    array['ADMIN','RRHH','GERENCIA','AUDITOR']
  ))
);

-- No INSERT/UPDATE/DELETE policy is granted to authenticated in v1.
-- Membership writes must later go through a reviewed server-side action/RPC.

-- ---------------------------------------------------------------------------
-- TORO User Vault
-- Initial implementation uses public tables + strict RLS because the current
-- Data API exposure for custom schemas has not yet been verified.
-- Conceptually these tables belong to TORO User Vault.
-- ---------------------------------------------------------------------------

create table if not exists public.user_memory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  org_id uuid references public.organizations(id),
  scope text not null
    check (scope in ('personal','work_private','work_org','shared','system')),
  domain text not null,
  memory_type text not null,
  title text not null,
  summary text,
  normalized_value jsonb not null default '{}'::jsonb,
  source_type text,
  source_ref text,
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric(4,3)
    check (confidence is null or (confidence >= 0 and confidence <= 1)),
  verification_state text not null default 'observed'
    check (verification_state in ('observed','candidate','confirmed','verified','disputed')),
  sensitivity text not null default 'private'
    check (sensitivity in ('public','internal','private','restricted')),
  retention_class text not null default 'standard',
  expires_at timestamptz,
  supersedes_id uuid references public.user_memory_items(id),
  status text not null default 'active'
    check (status in ('active','superseded','expired','deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_memory_items enable row level security;

create policy user_memory_items_self_all
on public.user_memory_items
for all
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  org_id uuid references public.organizations(id),
  scope text not null
    check (scope in ('personal','work_private','shared')),
  preference_key text not null,
  value jsonb not null,
  source_ref text,
  confidence numeric(4,3)
    check (confidence is null or (confidence >= 0 and confidence <= 1)),
  confirmed_at timestamptz,
  status text not null default 'active'
    check (status in ('active','superseded','deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy user_preferences_self_all
on public.user_preferences
for all
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create unique index if not exists user_preferences_personal_key_uq
on public.user_preferences (user_id, preference_key)
where org_id is null and status = 'active';

create unique index if not exists user_preferences_org_key_uq
on public.user_preferences (user_id, org_id, preference_key)
where org_id is not null and status = 'active';

create table if not exists public.user_learning_signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  org_id uuid references public.organizations(id),
  scope text not null
    check (scope in ('personal','work_private','shared')),
  signal_type text not null,
  domain text not null,
  normalized_signal jsonb not null,
  occurrence_count integer not null default 1 check (occurrence_count > 0),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  proposed_memory_key text,
  review_state text not null default 'observed'
    check (review_state in ('observed','candidate','accepted','rejected','expired'))
);

alter table public.user_learning_signals enable row level security;

create policy user_learning_signals_self_all
on public.user_learning_signals
for all
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create table if not exists public.user_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null,
  purpose text not null,
  scope text not null
    check (scope in ('personal','work_private','shared','system')),
  granted boolean not null,
  policy_version text not null,
  source_channel text,
  granted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_consents enable row level security;

create policy user_consents_self_all
on public.user_consents
for all
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create table if not exists public.user_notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  org_id uuid references public.organizations(id),
  channel text not null,
  category text not null,
  enabled boolean not null default true,
  digest_mode text not null default 'immediate'
    check (digest_mode in ('immediate','digest','silent')),
  quiet_hours_start time,
  quiet_hours_end time,
  escalation_allowed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, org_id, channel, category)
);

alter table public.user_notification_preferences enable row level security;

create policy user_notification_preferences_self_all
on public.user_notification_preferences
for all
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- Personal tool metadata only.
-- Organization-owned connector state belongs to TORO Tools, not User Vault.
create table if not exists public.user_personal_tool_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  external_account_ref_masked text,
  status text not null
    check (status in ('pending','connected','degraded','revoked','expired')),
  granted_scopes text[] not null default '{}'::text[],
  secret_ref text,
  last_health_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider, external_account_ref_masked)
);

alter table public.user_personal_tool_connections enable row level security;

create policy user_personal_tool_connections_self_all
on public.user_personal_tool_connections
for all
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- No credentials/tokens belong in this table. secret_ref must point to an
-- approved secret store and must never itself contain a token/key.

-- ---------------------------------------------------------------------------
-- Grants
-- RLS remains the row-level authority for authenticated users.
-- No anon access is introduced.
-- ---------------------------------------------------------------------------

revoke all on table public.organization_memberships from anon;
revoke all on table public.user_memory_items from anon;
revoke all on table public.user_preferences from anon;
revoke all on table public.user_learning_signals from anon;
revoke all on table public.user_consents from anon;
revoke all on table public.user_notification_preferences from anon;
revoke all on table public.user_personal_tool_connections from anon;

grant select on table public.organization_memberships to authenticated;
grant select, insert, update, delete on table public.user_memory_items to authenticated;
grant select, insert, update, delete on table public.user_preferences to authenticated;
grant select, insert, update, delete on table public.user_learning_signals to authenticated;
grant select, insert, update, delete on table public.user_consents to authenticated;
grant select, insert, update, delete on table public.user_notification_preferences to authenticated;
grant select, insert, update, delete on table public.user_personal_tool_connections to authenticated;

rollback;
-- Draft deliberately rolls back if executed verbatim.
-- A reviewed production migration must remove this rollback only after tests.
