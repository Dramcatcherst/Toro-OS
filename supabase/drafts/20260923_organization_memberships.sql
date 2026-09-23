-- DRAFT / AUTO-ROLLBACK
-- TORO Brain organization membership foundation
-- Date: 2026-09-23
--
-- This file intentionally ends in ROLLBACK.
-- It is not a production migration.

begin;

create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  user_id uuid not null references auth.users(id) on delete cascade,
  membership_type text not null default 'other'
    check (membership_type in ('employee','owner','contractor','advisor','provider','other')),
  status text not null default 'active'
    check (status in ('invited','active','suspended','offboarded')),
  source text not null default 'migration',
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
revoke all on table public.organization_memberships from anon;

create policy organization_memberships_self_read
on public.organization_memberships
for select
to authenticated
using (user_id = (select auth.uid()));

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

grant select on table public.organization_memberships to authenticated;

-- No authenticated write policy in v1.
-- Membership writes will require a reviewed server action/RPC.

with candidate_memberships as (
  select
    ur.org_id,
    ur.user_id,
    case
      when exists (
        select 1
        from public.employees e
        where e.org_id = ur.org_id
          and e.user_id = ur.user_id
          and e.deleted_at is null
      ) then 'employee'
      else 'other'
    end as membership_type,
    min(ur.created_at) as first_role_at
  from public.user_roles ur
  where ur.status = 'active'
    and ur.revoked_at is null
  group by ur.org_id, ur.user_id
)
select
  membership_type,
  count(*)::bigint as membership_candidates
from candidate_memberships
group by membership_type
order by membership_type;

-- Do not infer owner/contractor/advisor from role names alone.
-- Do not link unlinked employee rows by name.
-- Do not delete or rewrite user_roles in this migration.

rollback;
