\set ON_ERROR_STOP on

create extension if not exists pgcrypto;
create schema if not exists auth;
create schema if not exists private;
create schema if not exists operations;
create schema if not exists core;

create role anon nologin;
create role authenticated nologin;

create or replace function auth.uid()
returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

create or replace function auth.jwt()
returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb)
$$;

create table public.user_roles (
  user_id uuid not null,
  org_id uuid not null,
  role text not null,
  status text not null default 'active',
  revoked_at timestamptz
);

create or replace function private.has_org_role(p_org_id uuid, p_roles text[])
returns boolean language sql stable security definer set search_path=public as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.org_id = p_org_id
      and ur.status = 'active'
      and ur.revoked_at is null
      and ur.role = any(p_roles)
  )
$$;

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  table_name text not null,
  record_id uuid,
  operation text not null,
  actor_user_id uuid,
  changed_keys text[],
  reason text,
  occurred_at timestamptz not null default now(),
  status text,
  created_by uuid,
  updated_by uuid
);

create table operations.executive_decisions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  decision_title text not null,
  program_key text,
  priority text,
  recommendation text,
  why_it_matters text,
  evidence text,
  owner_name text,
  status text,
  superseded_by uuid,
  decision_value text,
  response_text text,
  processed_at timestamptz,
  delegated_to text,
  updated_at timestamptz not null default now()
);

create table core.rooms (
  id uuid primary key default gen_random_uuid(), org_id uuid not null, active boolean not null default true,
  name_es text, name_en text, room_number integer, room_type text, slug text, updated_at timestamptz not null default now()
);
create table operations.projects (
  id uuid primary key default gen_random_uuid(), org_id uuid not null, active boolean not null default true,
  project_name text not null, project_key text, category text, status text, business_area text, updated_at timestamptz not null default now()
);
create table operations.knowledge_items (
  id uuid primary key default gen_random_uuid(), org_id uuid not null, active boolean not null default true,
  title text not null, knowledge_key text, knowledge_class text, verified_status text, visibility text, updated_at timestamptz not null default now()
);

grant usage on schema public, auth, private, operations, core to authenticated, anon;
grant select on public.user_roles to authenticated;
grant execute on function auth.uid() to authenticated, anon;
grant execute on function auth.jwt() to authenticated, anon;
grant execute on function private.has_org_role(uuid,text[]) to authenticated;
