-- Exact rollback for 20261014_sandbox_role_rls_v1.sql.
-- Refuses concurrent policy/RLS drift before restoring the prior disabled-RLS state.
begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';
set local search_path = '';

do $preconditions$
begin
  if (select count(*) from pg_catalog.pg_policies
      where schemaname='public' and tablename in ('roles','user_roles')) <> 2
  then
    raise exception 'Rollback role policy count drift';
  end if;
  if not exists (
      select 1 from pg_catalog.pg_policies
      where schemaname='public' and tablename='roles'
        and policyname='toro_roles_active_self_read_v1'
        and cmd='SELECT' and roles=array['authenticated']::name[])
      or not exists (
      select 1 from pg_catalog.pg_policies
      where schemaname='public' and tablename='user_roles'
        and policyname='toro_user_roles_active_self_read_v1'
        and cmd='SELECT' and roles=array['authenticated']::name[])
  then
    raise exception 'Rollback role policy identity drift';
  end if;
  if (select md5(regexp_replace(qual,'[[:space:]]','','g'))
      from pg_catalog.pg_policies
      where schemaname='public' and tablename='roles'
        and policyname='toro_roles_active_self_read_v1') <> 'afe15e8bb9a7384d387b61ef51c41f5a'
      or (select md5(regexp_replace(qual,'[[:space:]]','','g'))
      from pg_catalog.pg_policies
      where schemaname='public' and tablename='user_roles'
        and policyname='toro_user_roles_active_self_read_v1') <> '1175ea0e8f96fece3413ec584a117131'
  then
    raise exception 'Rollback role policy definition drift';
  end if;
  if exists (
    select 1 from pg_catalog.pg_class c
    where c.oid in ('public.roles'::regclass,'public.user_roles'::regclass)
      and (not c.relrowsecurity or c.relforcerowsecurity)
  ) then
    raise exception 'Rollback role RLS state drift';
  end if;
  if has_table_privilege('authenticated','public.roles','INSERT,UPDATE,DELETE,TRUNCATE')
      or has_table_privilege('authenticated','public.user_roles','INSERT,UPDATE,DELETE,TRUNCATE') then
    raise exception 'Rollback authenticated write privilege drift';
  end if;
end;
$preconditions$;

drop policy toro_roles_active_self_read_v1 on public.roles;
drop policy toro_user_roles_active_self_read_v1 on public.user_roles;
alter table public.roles disable row level security;
alter table public.user_roles disable row level security;
commit;
