-- REVIEWED SANDBOX CANDIDATE. NOT APPLIED. Never run on production.
-- Target observed in prior audit: dreamteam-recovery-sandbox (fhsophdcitnspwaxtkto).
-- Protects the transitional role resolver without changing grants or adding writes.
begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';
set local search_path = '';

do $preconditions$
declare missing_columns integer;
begin
  if to_regclass('public.roles') is null or to_regclass('public.user_roles') is null then
    raise exception 'Role tables missing: review target before applying';
  end if;

  select count(*) into missing_columns
  from (values
    ('roles','id'),('roles','code'),
    ('user_roles','id'),('user_roles','org_id'),('user_roles','user_id'),
    ('user_roles','role_id'),('user_roles','status'),('user_roles','revoked_at')
  ) required(table_name,column_name)
  where not exists (
    select 1 from information_schema.columns c
    where c.table_schema='public'
      and c.table_name=required.table_name
      and c.column_name=required.column_name
  );
  if missing_columns <> 0 then
    raise exception 'Role table shape drift: % required columns missing', missing_columns;
  end if;

  if exists (
    select 1 from pg_catalog.pg_class c
    where c.oid in ('public.roles'::regclass,'public.user_roles'::regclass)
      and (c.relrowsecurity or c.relforcerowsecurity)
  ) then
    raise exception 'Role RLS baseline changed: review instead of stacking policies';
  end if;
  if exists (
    select 1 from pg_catalog.pg_policies
    where schemaname='public' and tablename in ('roles','user_roles')
  ) then
    raise exception 'Role policy baseline changed: review instead of stacking policies';
  end if;

  if not has_table_privilege('authenticated','public.roles','SELECT')
      or not has_table_privilege('authenticated','public.user_roles','SELECT') then
    raise exception 'Authenticated read grant baseline changed';
  end if;
  if has_table_privilege('authenticated','public.roles','INSERT,UPDATE,DELETE,TRUNCATE')
      or has_table_privilege('authenticated','public.user_roles','INSERT,UPDATE,DELETE,TRUNCATE') then
    raise exception 'Authenticated role-table write privilege detected';
  end if;
  if has_table_privilege('anon','public.roles','SELECT,INSERT,UPDATE,DELETE,TRUNCATE')
      or has_table_privilege('anon','public.user_roles','SELECT,INSERT,UPDATE,DELETE,TRUNCATE') then
    raise exception 'Anonymous role-table privilege detected';
  end if;
end;
$preconditions$;

alter table public.roles enable row level security;
alter table public.user_roles enable row level security;

create policy toro_user_roles_active_self_read_v1
on public.user_roles
for select
to authenticated
using (
  auth.uid() is not null
  and user_id = (select auth.uid())
  and status = 'active'
  and revoked_at is null
);

create policy toro_roles_active_self_read_v1
on public.roles
for select
to authenticated
using (
  exists (
    select 1
    from public.user_roles ur
    where ur.role_id = roles.id
      and ur.user_id = (select auth.uid())
      and ur.status = 'active'
      and ur.revoked_at is null
  )
);

commit;
