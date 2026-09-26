-- APPLIED 2026-09-26 UTC after Mauricio authorized the permission change.
-- Supabase migration: 20260926034539_harden_dreamteam_employee_views_20260925.
-- Retained as reviewed SQL evidence outside the repository migration chain.
-- Observed 2026-09-25 CR: anon SELECT on employee_reward_balances returns 13 rows.
-- Source: Supabase project abtyrbqlqbsastmridzp, PostgreSQL 17.
-- Restore tests must use a disposable branch, then a staged production cutover.
begin;

do $preflight$
declare
  view_name text;
begin
  foreach view_name in array array['employee_reward_balances', 'employee_experience_kpis']
  loop
    if not exists (
      select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = view_name and c.relkind = 'v'
    ) then
      raise exception 'Missing expected public view: %', view_name;
    end if;
    if not has_table_privilege('service_role', format('public.%I', view_name), 'SELECT') then
      raise exception 'Service-role consumer would be blocked for: %', view_name;
    end if;
  end loop;
end
$preflight$;

alter view public.employee_reward_balances set (security_invoker = true);
alter view public.employee_experience_kpis set (security_invoker = true);

-- Remove all direct access for both client roles. Existing server-only consumers
-- must continue through a verified authorization boundary, not these public views.
revoke all privileges on public.employee_reward_balances from PUBLIC, anon, authenticated;
revoke all privileges on public.employee_experience_kpis from PUBLIC, anon, authenticated;

do $verify$
declare
  view_name text;
begin
  foreach view_name in array array['employee_reward_balances', 'employee_experience_kpis']
  loop
    if has_table_privilege('anon', format('public.%I', view_name), 'SELECT')
       or has_table_privilege('authenticated', format('public.%I', view_name), 'SELECT')
       or not has_table_privilege('service_role', format('public.%I', view_name), 'SELECT')
       or not exists (
         select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
         where n.nspname='public' and c.relname=view_name
           and c.reloptions @> array['security_invoker=true']
       )
    then
      raise exception 'View access verification failed: %', view_name;
    end if;
  end loop;
end
$verify$;

commit;
