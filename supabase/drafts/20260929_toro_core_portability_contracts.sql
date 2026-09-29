-- DRAFT ONLY — NOT AUTHORIZED FOR PRODUCTION APPLY
-- TORO Core multiindustry portability foundation
-- Canonical design contracts:
--   toro_core_business_relationship_contract_v1
--   toro_core_work_object_contract_v1
--   toro_core_offering_contract_v1
--   toro_core_commercial_order_contract_v1
-- Date: 2026-09-29
--
-- Requires:
--   public.organizations
--   identity.organization_memberships
--   private.has_active_membership(uuid)
--
-- Tenant invariant:
--   every cross-object reference is constrained by (org_id, referenced_id).

create schema if not exists core;

revoke all on schema core from public;
revoke all on schema core from anon;
grant usage on schema core to authenticated, service_role;

create table if not exists core.parties (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  party_type text not null check (party_type in ('person','organization')),
  display_name text not null,
  lifecycle_status text not null default 'active',
  privacy_class text not null default 'internal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id,id)
);

create table if not exists core.relationships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  party_id uuid not null,
  relationship_type text not null,
  status text not null default 'active',
  effective_from date null,
  effective_to date null,
  source_authority text null,
  confidence text null,
  owner_label text null,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id,id),
  foreign key (org_id,party_id)
    references core.parties(org_id,id)
);

create table if not exists core.external_references (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  party_id uuid null,
  system text not null,
  external_entity_type text not null,
  external_id text not null,
  source_authority text null,
  last_synced_at timestamptz null,
  created_at timestamptz not null default now(),
  unique (org_id,id),
  unique (org_id,system,external_entity_type,external_id),
  foreign key (org_id,party_id)
    references core.parties(org_id,id)
);

create table if not exists core.offerings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  offering_type text not null,
  name text not null,
  status text not null default 'active',
  public_visibility boolean not null default false,
  pricing_model text null,
  currency text null,
  source_authority text null,
  external_reference text null,
  effective_from date null,
  effective_to date null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id,id)
);

create table if not exists core.orders (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  customer_party_id uuid null,
  order_type text not null,
  status text not null,
  currency text not null,
  subtotal numeric(14,2) not null default 0,
  tax numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  payment_status text null,
  fulfillment_status text null,
  source_authority text null,
  external_reference text null,
  placed_at timestamptz null,
  due_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id,id),
  foreign key (org_id,customer_party_id)
    references core.parties(org_id,id)
);

create table if not exists core.order_lines (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  order_id uuid not null,
  offering_id uuid not null,
  description_snapshot text null,
  quantity numeric(14,3) not null default 1 check (quantity > 0),
  unit_price numeric(14,2) not null,
  line_total numeric(14,2) not null,
  source_authority text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id,id),
  foreign key (org_id,order_id)
    references core.orders(org_id,id),
  foreign key (org_id,offering_id)
    references core.offerings(org_id,id)
);

create table if not exists core.work_objects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  customer_party_id uuid null,
  work_type text not null,
  title text not null,
  status text not null,
  priority text null,
  location_ref text null,
  source_authority text null,
  external_reference text null,
  risk_class text null,
  owner_label text null,
  opened_at timestamptz not null default now(),
  due_at timestamptz null,
  completed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id,id),
  foreign key (org_id,customer_party_id)
    references core.parties(org_id,id)
);

create table if not exists core.fulfillments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  order_id uuid not null,
  work_object_id uuid null,
  fulfillment_type text not null,
  status text not null,
  location_ref text null,
  scheduled_at timestamptz null,
  completed_at timestamptz null,
  evidence_ref text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id,id),
  foreign key (org_id,order_id)
    references core.orders(org_id,id),
  foreign key (org_id,work_object_id)
    references core.work_objects(org_id,id)
);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'parties',
    'relationships',
    'external_references',
    'offerings',
    'orders',
    'order_lines',
    'work_objects',
    'fulfillments'
  ]
  loop
    execute format('alter table core.%I enable row level security', table_name);
    execute format('revoke all on table core.%I from public', table_name);
    execute format('revoke all on table core.%I from anon', table_name);
    execute format('revoke all on table core.%I from authenticated', table_name);
    execute format('grant select on table core.%I to authenticated', table_name);
    execute format('grant select,insert,update,delete on table core.%I to service_role', table_name);

    execute format('drop policy if exists %I on core.%I',
      'core_' || table_name || '_org_read', table_name);

    execute format(
      'create policy %I on core.%I for select to authenticated using ((select private.has_active_membership(org_id)))',
      'core_' || table_name || '_org_read',
      table_name
    );
  end loop;
end
$$;

-- v1 intentionally exposes no authenticated INSERT/UPDATE/DELETE policy.
-- Server-side governed actions may be added only after separate review.
