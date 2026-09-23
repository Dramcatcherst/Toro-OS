-- DRAFT ONLY — idempotent membership backfill candidate
-- Requires 20260923_identity_organization_memberships.sql
--
-- Source authority for this first backfill is active/non-revoked public.user_roles.
-- Multiple roles for the same user/org produce one membership.
-- A primary_employee_id is populated only when exactly one non-deleted employee
-- already has the exact same org_id + user_id. No name matching is allowed.

with role_memberships as (
  select
    ur.org_id,
    ur.user_id,
    min(ur.created_at) as first_role_at
  from public.user_roles ur
  where ur.status = 'active'
    and ur.revoked_at is null
  group by ur.org_id, ur.user_id
),
classified as (
  select
    rm.org_id,
    rm.user_id,
    rm.first_role_at,
    em.employee_count,
    em.primary_employee_id
  from role_memberships rm
  left join lateral (
    select
      count(*)::integer as employee_count,
      case
        when count(*) = 1 then max(e.id::text)::uuid
        else null::uuid
      end as primary_employee_id
    from public.employees e
    where e.org_id = rm.org_id
      and e.user_id = rm.user_id
      and e.deleted_at is null
  ) em on true
)
insert into identity.organization_memberships (
  org_id,
  user_id,
  membership_type,
  status,
  primary_employee_id,
  source,
  joined_at
)
select
  c.org_id,
  c.user_id,
  case when c.employee_count > 0 then 'employee' else 'other' end,
  'active',
  c.primary_employee_id,
  'user_roles_backfill_v1',
  c.first_role_at
from classified c
on conflict (org_id,user_id) do nothing;
