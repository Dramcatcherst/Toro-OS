-- TORO Identity reconciliation — READ ONLY
-- Date: 2026-09-22
--
-- Purpose:
--   Measure identity readiness without exposing names, emails, phone numbers,
--   government IDs, payroll data or other private employee payloads.
--
-- This file must remain SELECT-only. It does not authorize linking users,
-- creating accounts, changing roles or writing membership state.

with employee_identity as (
  select
    e.id as employee_id,
    e.org_id,
    e.user_id,
    e.employment_status,
    (e.deleted_at is null) as is_current_record,
    exists (
      select 1
      from public.user_roles ur
      where ur.org_id = e.org_id
        and ur.user_id = e.user_id
        and ur.status = 'active'
        and ur.revoked_at is null
    ) as has_active_role,
    exists (
      select 1
      from public.employee_private_profiles ep
      where ep.employee_id = e.id
        and ep.deleted_at is null
    ) as has_private_hr_profile,
    exists (
      select 1
      from public.employment_profiles emp
      where emp.employee_id = e.id
        and emp.deleted_at is null
    ) as has_employment_profile
  from public.employees e
  where e.deleted_at is null
),
classified as (
  select
    case
      when employment_status = 'terminated' and user_id is null
        then 'terminated_no_access'
      when employment_status = 'terminated' and user_id is not null
        then 'terminated_link_review'
      when user_id is null
        then 'unlinked_requires_classification'
      when user_id is not null and not has_active_role
        then 'linked_without_active_role'
      when user_id is not null and has_active_role
        then 'linked_valid_candidate'
      else 'data_conflict'
    end as classification,
    has_private_hr_profile,
    has_employment_profile
  from employee_identity
)
select
  classification,
  count(*)::bigint as employee_count,
  count(*) filter (where has_private_hr_profile)::bigint as with_private_hr_profile,
  count(*) filter (where has_employment_profile)::bigint as with_employment_profile
from classified
group by classification
order by classification;

-- Membership cardinality readiness.
select
  count(*)::bigint as app_users,
  count(distinct user_id)::bigint as users_with_active_org_role,
  count(*) filter (where role_count > 1)::bigint as user_org_pairs_with_multiple_roles
from (
  select
    au.id as user_id,
    count(ur.id) filter (
      where ur.status = 'active' and ur.revoked_at is null
    ) as role_count
  from public.app_users au
  left join public.user_roles ur on ur.user_id = au.id
  group by au.id
) x;

-- Important:
-- A detailed reconciliation workflow may surface internal record identifiers only
-- to authorized administrators in a protected server-side view. Do not commit or
-- log employee names, emails or private identifiers to GitHub/CI evidence.
