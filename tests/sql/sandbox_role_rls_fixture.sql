do $$
begin
  if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role nologin bypassrls; end if;
end
$$;

create schema auth;
create function auth.uid() returns uuid language sql stable
as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema auth to authenticated,service_role;
grant execute on function auth.uid() to authenticated,service_role;

create table public.roles(id uuid primary key,code text not null unique);
create table public.user_roles(
  id uuid primary key,
  org_id uuid not null,
  user_id uuid not null,
  role_id uuid not null references public.roles(id),
  status text not null default 'active',
  revoked_at timestamptz
);
revoke all on public.roles,public.user_roles from public,anon,authenticated;
grant select on public.roles,public.user_roles to authenticated;
grant all on public.roles,public.user_roles to service_role;

insert into public.roles(id,code) values
  ('30000000-0000-4000-8000-000000000001','ADMIN'),
  ('30000000-0000-4000-8000-000000000002','EMPLEADO'),
  ('30000000-0000-4000-8000-000000000003','RRHH');
insert into public.user_roles(id,org_id,user_id,role_id,status,revoked_at) values
  ('40000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','active',null),
  ('40000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000002','active',null),
  ('40000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000001','active',null),
  ('40000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000004','30000000-0000-4000-8000-000000000003','revoked',now());
