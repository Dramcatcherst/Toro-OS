-- DRAFT ONLY — NOT AUTHORIZED FOR PRODUCTION APPLY
-- TORO Demand Context: external/internal demand event foundation
-- Canonical target: operations.demand_events
-- Date: 2026-09-23
--
-- This draft intentionally does NOT modify public.holidays or public.holiday_calendars.
-- Those tables belong to People/HR holiday handling and include employee-specific scope.
-- This draft is also intentionally outside supabase/migrations until isolated validation,
-- RLS review, source-authority review and rollback rehearsal are complete.
--
-- Core rule:
-- demand context may explain/flag/recommend; it is NEVER rate, inventory, restriction,
-- ad-spend or reservation authority.

create table if not exists operations.demand_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  property_id uuid null references public.properties(id),

  event_key text not null,
  title text not null,
  event_type text not null
    check (event_type in (
      'official_holiday',
      'school_break',
      'feeder_market_holiday',
      'local_event',
      'regional_event',
      'surf_event',
      'music_festival',
      'wellness_event',
      'sports_event',
      'group_demand',
      'airlift_change',
      'access_change',
      'search_signal',
      'booking_signal',
      'environmental_context',
      'other'
    )),

  source_class text not null
    check (source_class in (
      'OFFICIAL',
      'VERIFIED_PROVIDER',
      'OBSERVED_PLATFORM',
      'COMMUNITY_SIGNAL',
      'UNVERIFIED'
    )),
  source_system text not null,
  source_event_id text null,
  source_url text null,
  evidence_ref text null,

  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'America/Costa_Rica',
  location_label text null,

  market_scope jsonb not null default '{}'::jsonb,
  feeder_markets text[] not null default '{}'::text[],
  expected_direction text not null default 'uncertain'
    check (expected_direction in ('up','down','neutral','uncertain')),
  confidence text not null default 'low'
    check (confidence in ('high','medium','low')),
  estimated_lead_window_days integer null
    check (estimated_lead_window_days is null or estimated_lead_window_days >= 0),

  -- Current observed signal snapshots only. Long history belongs in an analytical
  -- history layer (for example BigQuery) when scale justifies it.
  search_signal jsonb not null default '{}'::jsonb,
  booking_signal jsonb not null default '{}'::jsonb,
  rate_signal jsonb not null default '{}'::jsonb,
  marketing_opportunity jsonb not null default '{}'::jsonb,
  operational_impact jsonb not null default '{}'::jsonb,

  verification_status text not null default 'candidate'
    check (verification_status in (
      'candidate','verified','rejected','expired'
    )),
  status text not null default 'active'
    check (status in ('active','ended','superseded','archived')),

  -- Hard guard: this table cannot declare itself transactional pricing authority.
  pricing_authority text not null default 'none'
    check (pricing_authority = 'none'),
  marketing_action_ceiling text not null default 'recommend'
    check (marketing_action_ceiling in ('observe','recommend')),

  last_observed_at timestamptz null,
  last_verified_at timestamptz null,
  expires_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (org_id, event_key),
  check (ends_at >= starts_at),
  check (
    verification_status <> 'verified'
    or source_class in ('OFFICIAL','VERIFIED_PROVIDER','OBSERVED_PLATFORM')
  )
);

comment on table operations.demand_events is
  'Canonical TORO Demand Context events. Context/recommendation only; never rate, inventory, restriction, ad-spend or reservation authority.';

comment on column operations.demand_events.market_scope is
  'Geographic/audience scope such as local radius, destination, country or feeder-market metadata. No guest PII.';

comment on column operations.demand_events.search_signal is
  'Current aggregated search-demand observation only; no query-level personal data.';

comment on column operations.demand_events.booking_signal is
  'Current aggregated Kross/booking demand observation such as OTB/pickup/lead-time; never reservation authority.';

comment on column operations.demand_events.rate_signal is
  'Observed/analytical rate context only. This field cannot authorize rate changes.';

alter table operations.demand_events enable row level security;

revoke all on table operations.demand_events from public;
revoke all on table operations.demand_events from anon;
revoke all on table operations.demand_events from authenticated;

grant select on table operations.demand_events to authenticated;
grant select,insert,update,delete on table operations.demand_events to service_role;

drop policy if exists demand_events_management_read
  on operations.demand_events;
create policy demand_events_management_read
on operations.demand_events
for select
to authenticated
using (
  private.has_org_role(
    org_id,
    array['ADMIN','GERENCIA','JEFE_DEPARTAMENTO','AUDITOR']::text[]
  )
);

drop policy if exists demand_events_management_insert
  on operations.demand_events;
create policy demand_events_management_insert
on operations.demand_events
for insert
to authenticated
with check (
  private.has_org_role(org_id, array['ADMIN','GERENCIA']::text[])
);

drop policy if exists demand_events_management_update
  on operations.demand_events;
create policy demand_events_management_update
on operations.demand_events
for update
to authenticated
using (
  private.has_org_role(org_id, array['ADMIN','GERENCIA']::text[])
)
with check (
  private.has_org_role(org_id, array['ADMIN','GERENCIA']::text[])
);

drop policy if exists demand_events_management_delete
  on operations.demand_events;
create policy demand_events_management_delete
on operations.demand_events
for delete
to authenticated
using (
  private.has_org_role(org_id, array['ADMIN','GERENCIA']::text[])
);

create index if not exists demand_events_org_window_idx
  on operations.demand_events (org_id, starts_at, ends_at);

create index if not exists demand_events_property_window_idx
  on operations.demand_events (property_id, starts_at, ends_at)
  where property_id is not null;

create index if not exists demand_events_status_type_idx
  on operations.demand_events (org_id, status, event_type);

create index if not exists demand_events_verification_idx
  on operations.demand_events (org_id, verification_status, last_verified_at);

-- Rollback for the eventual reviewed migration:
--   drop table if exists operations.demand_events;
-- This draft creates no data and changes no existing table.
