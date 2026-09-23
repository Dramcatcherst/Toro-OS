-- Disposable PostgreSQL fixture for TORO Identity membership tests.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_roles where rolname='anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname='service_role') then
    create role service_role nologin bypassrls;
  end if;
end
$$;

create schema if not exists auth;
create schema if not exists private;

create table auth.users (
  id uuid primary key
);

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid;
$$;

grant usage on schema auth to authenticated, service_role;
grant execute on function auth.uid() to authenticated, service_role;

create table public.organizations (
  id uuid primary key,
  name text not null
);

create table public.roles (
  id uuid primary key,
  code text not null unique
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  user_id uuid not null references auth.users(id),
  role_id uuid not null references public.roles(id),
  status text not null default 'active',
  revoked_at timestamptz null,
  created_at timestamptz not null default now()
);

create table public.employees (
  id uuid primary key,
  org_id uuid not null references public.organizations(id),
  user_id uuid null references auth.users(id),
  deleted_at timestamptz null
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

grant usage on schema private to authenticated, service_role;
grant execute on function private.has_org_role(uuid,text[])
  to authenticated, service_role;

insert into public.organizations (id,name) values
  ('10000000-0000-4000-8000-000000000001','Org A'),
  ('10000000-0000-4000-8000-000000000002','Org B');

insert into auth.users (id) values
  ('20000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000002'),
  ('20000000-0000-4000-8000-000000000003'),
  ('20000000-0000-4000-8000-000000000004'),
  ('20000000-0000-4000-8000-000000000005'),
  ('20000000-0000-4000-8000-000000000006');

insert into public.roles (id,code) values
  ('30000000-0000-4000-8000-000000000001','ADMIN'),
  ('30000000-0000-4000-8000-000000000002','GERENCIA'),
  ('30000000-0000-4000-8000-000000000003','EMPLEADO'),
  ('30000000-0000-4000-8000-000000000004','CONTABILIDAD'),
  ('30000000-0000-4000-8000-000000000005','RRHH'),
  ('30000000-0000-4000-8000-000000000006','AUDITOR');

-- user 1: two roles in Org A, but must become one membership.
insert into public.user_roles (org_id,user_id,role_id) values
  ('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001'),
  ('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002'),
  ('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000003'),
  ('10000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000001'),
  ('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000004','30000000-0000-4000-8000-000000000004'),
  ('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000005','30000000-0000-4000-8000-000000000003');

insert into public.employees (id,org_id,user_id) values
  ('40000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001'),
  ('40000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002'),
  ('40000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000003'),
  ('40000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000005');
