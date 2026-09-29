-- SANDBOX ONLY — DO NOT APPLY TO PRODUCTION
-- Persistent second-tenant portability fixture for dreamteam-recovery-sandbox.
-- Version: SECOND-TENANT-R1-20260929
--
-- Prerequisites:
--   public.organizations
--   public.employees
--   auth.users
-- Then apply:
--   1) this bootstrap prelude
--   2) supabase/drafts/20260923_identity_organization_memberships.sql
--   3) supabase/drafts/20260929_toro_core_portability_contracts.sql
--   4) this file's seed section (or equivalent inserts below after schemas exist)
--
-- This file is intentionally placed under supabase/sandbox, never migrations.

create schema if not exists private;

alter table public.employees
  add column if not exists deleted_at timestamptz null;

create table if not exists public.roles (
  id uuid primary key,
  code text not null unique
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id),
  status text not null default 'active',
  revoked_at timestamptz null,
  created_at timestamptz not null default now()
);

create or replace function private.has_org_role(
  target_org uuid,
  allowed_roles text[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.org_id = target_org
      and ur.user_id = auth.uid()
      and ur.status = 'active'
      and ur.revoked_at is null
      and r.code = any(allowed_roles)
  );
$$;

revoke all on function private.has_org_role(uuid,text[]) from public,anon;
grant execute on function private.has_org_role(uuid,text[]) to authenticated,service_role;

create table if not exists private.toro_portability_sandbox_manifest (
  fixture_key text primary key,
  bootstrap_version text not null,
  synthetic boolean not null default true,
  org_ids uuid[] not null,
  user_ids uuid[] not null,
  last_export_hash text null,
  last_export_at timestamptz null,
  created_at timestamptz not null default now(),
  notes text null
);

insert into public.roles(id,code) values
  ('30000000-0000-4000-8000-000000000001','ADMIN'),
  ('30000000-0000-4000-8000-000000000002','GERENCIA'),
  ('30000000-0000-4000-8000-000000000003','EMPLEADO')
on conflict (code) do nothing;

insert into public.organizations(id,name,slug,status) values
  ('10000000-0000-4000-8000-000000000101','Synthetic B2B Services','toro-sandbox-b2b','active'),
  ('10000000-0000-4000-8000-000000000102','Synthetic Retail','toro-sandbox-retail','active')
on conflict (id) do nothing;

insert into auth.users(id,email,raw_app_meta_data,raw_user_meta_data) values
  ('20000000-0000-4000-8000-000000000101','owner-b2b@example.invalid','{}'::jsonb,'{}'::jsonb),
  ('20000000-0000-4000-8000-000000000102','staff-b2b@example.invalid','{}'::jsonb,'{}'::jsonb),
  ('20000000-0000-4000-8000-000000000103','owner-retail@example.invalid','{}'::jsonb,'{}'::jsonb)
on conflict (id) do nothing;

insert into public.employees(id,org_id,user_id,preferred_name,employment_status) values
  ('40000000-0000-4000-8000-000000000101','10000000-0000-4000-8000-000000000101','20000000-0000-4000-8000-000000000101','Synthetic Owner B2B','active'),
  ('40000000-0000-4000-8000-000000000102','10000000-0000-4000-8000-000000000101','20000000-0000-4000-8000-000000000102','Synthetic Staff B2B','active'),
  ('40000000-0000-4000-8000-000000000103','10000000-0000-4000-8000-000000000102','20000000-0000-4000-8000-000000000103','Synthetic Owner Retail','active')
on conflict (id) do nothing;

insert into public.user_roles(org_id,user_id,role_id)
select * from (values
  ('10000000-0000-4000-8000-000000000101'::uuid,'20000000-0000-4000-8000-000000000101'::uuid,'30000000-0000-4000-8000-000000000001'::uuid),
  ('10000000-0000-4000-8000-000000000101'::uuid,'20000000-0000-4000-8000-000000000102'::uuid,'30000000-0000-4000-8000-000000000003'::uuid),
  ('10000000-0000-4000-8000-000000000102'::uuid,'20000000-0000-4000-8000-000000000103'::uuid,'30000000-0000-4000-8000-000000000001'::uuid)
) seed(org_id,user_id,role_id)
where not exists (
  select 1 from public.user_roles ur
  where ur.org_id=seed.org_id and ur.user_id=seed.user_id and ur.role_id=seed.role_id
);

insert into private.toro_portability_sandbox_manifest(
  fixture_key,bootstrap_version,org_ids,user_ids,notes
)
values (
  'SECOND-TENANT-R1',
  '2026-09-29',
  array[
    '10000000-0000-4000-8000-000000000101'::uuid,
    '10000000-0000-4000-8000-000000000102'::uuid
  ],
  array[
    '20000000-0000-4000-8000-000000000101'::uuid,
    '20000000-0000-4000-8000-000000000102'::uuid,
    '20000000-0000-4000-8000-000000000103'::uuid
  ],
  'Synthetic only. No Dreamcatcher/customer private data.'
)
on conflict (fixture_key) do update set
  bootstrap_version=excluded.bootstrap_version,
  org_ids=excluded.org_ids,
  user_ids=excluded.user_ids,
  notes=excluded.notes;

-- Membership rows and Core business rows are seeded after the identity/core drafts are applied.
