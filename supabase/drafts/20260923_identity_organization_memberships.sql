-- DRAFT ONLY — NOT AUTHORIZED FOR PRODUCTION APPLY
-- TORO Identity: organization memberships foundation
-- Canonical target: identity.organization_memberships
-- Date: 2026-09-23
--
-- This file is intentionally outside supabase/migrations.
-- It must pass isolated PostgreSQL/Supabase-compatible validation before a reviewed
-- production migration is prepared.

create schema if not exists identity;

revoke all on schema identity from public;
revoke all on schema identity from anon;
grant usage on schema identity to authenticated, service_role;

create table if not exists identity.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  user_id uuid not null references auth.users(id) on delete cascade,
  membership_type text not null default 'other'
    check (membership_type in (
      'employee','owner','contractor','advisor','provider','other'
    )),
  status text not null default 'active'
    check (status in ('invited','active','suspended','offboarded')),
  primary_employee_id uuid null references public.employees(id) on delete set null,
  source text not null default 'manual_review',
  joined_at timestamptz null,
  offboarded_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id,user_id),
  check (
    (status = 'offboarded' and offboarded_at is not null)
    or
    (status <> 'offboarded' and offboarded_at is null)
  )
);

alter table identity.organization_memberships enable row level security;

revoke all on table identity.organization_memberships from public;
revoke all on table identity.organization_memberships from anon;
revoke all on table identity.organization_memberships from authenticated;

grant select on table identity.organization_memberships to authenticated;
grant select,insert,update,delete on table identity.organization_memberships to service_role;

create or replace function private.validate_membership_employee_link()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.primary_employee_id is null then
    return new;
  end if;

  if not exists (
    select 1
    from public.employees e
    where e.id = new.primary_employee_id
      and e.org_id = new.org_id
      and e.user_id = new.user_id
      and e.deleted_at is null
  ) then
    raise exception
      'primary_employee_id must be a non-deleted employee linked to the same org/user'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function private.validate_membership_employee_link() from public;
revoke all on function private.validate_membership_employee_link() from anon;
revoke all on function private.validate_membership_employee_link() from authenticated;
grant execute on function private.validate_membership_employee_link() to service_role;

drop trigger if exists trg_validate_membership_employee_link
  on identity.organization_memberships;

create trigger trg_validate_membership_employee_link
before insert or update of org_id,user_id,primary_employee_id
on identity.organization_memberships
for each row
execute function private.validate_membership_employee_link();

create or replace function private.has_active_membership(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from identity.organization_memberships m
    where m.org_id = target_org
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

revoke all on function private.has_active_membership(uuid) from public;
revoke all on function private.has_active_membership(uuid) from anon;
grant execute on function private.has_active_membership(uuid)
  to authenticated, service_role;

drop policy if exists organization_memberships_self_read
  on identity.organization_memberships;

create policy organization_memberships_self_read
on identity.organization_memberships
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists organization_memberships_privileged_read
  on identity.organization_memberships;

create policy organization_memberships_privileged_read
on identity.organization_memberships
for select
to authenticated
using (
  private.has_active_membership(org_id)
  and private.has_org_role(
    org_id,
    array['ADMIN','RRHH','GERENCIA','AUDITOR']::text[]
  )
);

-- v1 intentionally has no authenticated INSERT/UPDATE/DELETE policy.
-- Membership writes require a separately reviewed server action/RPC.
