-- DRAFT / AUTO-ROLLBACK
-- TORO Brain organization membership foundation
-- Base branch: Phase 1 executive shell
-- Date: 2026-09-23
--
-- This file is intentionally non-destructive and ends in ROLLBACK.
-- It is a reviewed design artifact, NOT a production migration.

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

-- Self-service read only.
create policy organization_memberships_self_read
on public.organization_memberships
for select
to authenticated
using (user_id = (select auth.uid()));

-- Privileged organizational metadata read.
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
-- Creation/suspension/offboarding will require a reviewed server action/RPC.

-- Proposed backfill preview only. Review the result before any INSERT:
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

-- Important:
-- Do NOT infer owner/contractor/advisor from role names alone.
-- Do NOT link unlinked employee rows by display name.
-- Do NOT delete or rewrite public.user_roles during this migration.

rollback;
