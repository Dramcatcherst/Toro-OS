-- DRAFT ONLY. DO NOT APPLY TO PRODUCTION WITHOUT REVIEWED USER VAULT GATES.
-- Target project: abtyrbqlqbsastmridzp
-- Contract: docs/product/TORO_IDENTITY_USER_VAULT_V1.md
-- Design: docs/superpowers/specs/2026-10-15-toro-personal-project-index-rumbo-design.md

begin;

create schema if not exists user_vault;

create table user_vault.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_key text not null,
  project_name text not null,
  scope text not null default 'personal'
    check (scope in ('personal', 'work_private')),
  status text not null default 'NEXT'
    check (status in ('NOW', 'NEXT', 'HOLD', 'ARCHIVED')),
  priority text
    check (priority is null or priority in ('P0', 'P1', 'P2', 'P3')),
  summary text,
  next_action text,
  source_type text not null default 'owner',
  source_ref text,
  external_system text,
  external_record_ref text,
  sensitivity text not null default 'private'
    check (sensitivity in ('private', 'restricted')),
  visibility text not null default 'owner_only'
    check (visibility = 'owner_only'),
  verification_state text not null default 'candidate'
    check (verification_state in ('candidate', 'confirmed', 'verified', 'disputed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, project_key),
  unique (id, user_id)
);

create table user_vault.project_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null,
  link_key text not null,
  label text not null,
  link_type text not null
    check (link_type in ('live_app', 'preview', 'repository', 'trip', 'document', 'dashboard', 'connector', 'admin', 'other')),
  target_uri text,
  provider text,
  open_mode text not null default 'direct'
    check (open_mode in ('direct', 'chatgpt', 'internal')),
  is_primary_view boolean not null default false,
  status text not null default 'active'
    check (status in ('active', 'pending', 'broken', 'archived')),
  visibility text not null default 'owner_only'
    check (visibility = 'owner_only'),
  source_ref text,
  last_checked_at timestamptz,
  last_verified_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_links_owner_fk
    foreign key (project_id, user_id)
    references user_vault.projects(id, user_id)
    on delete cascade,
  constraint project_links_primary_view_type_check
    check (
      not is_primary_view
      or link_type in ('live_app', 'preview', 'trip', 'dashboard', 'connector')
    ),
  constraint project_links_safe_uri_check
    check (
      target_uri is null
      or (
        (
          target_uri ~ '^https://'
          or target_uri ~ '^app://'
          or target_uri ~ '^plugin://'
          or target_uri ~ '^rumbo://'
        )
        and target_uri !~* '^https://[^/?#]*@'
      )
    ),
  unique (user_id, project_id, link_key)
);

create index user_vault_projects_user_status_idx
  on user_vault.projects (user_id, status, updated_at desc);

create index user_vault_project_links_user_project_idx
  on user_vault.project_links (user_id, project_id, status);

create unique index user_vault_project_links_one_active_primary_view_idx
  on user_vault.project_links (user_id, project_id)
  where is_primary_view and status = 'active';

alter table user_vault.projects enable row level security;
alter table user_vault.projects force row level security;
alter table user_vault.project_links enable row level security;
alter table user_vault.project_links force row level security;

revoke all on schema user_vault from public;
revoke all on user_vault.projects from public, anon;
revoke all on user_vault.project_links from public, anon;

grant usage on schema user_vault to authenticated;
grant select, insert, update, delete on user_vault.projects to authenticated;
grant select, insert, update, delete on user_vault.project_links to authenticated;

create policy user_vault_projects_select_own
  on user_vault.projects
  for select
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy user_vault_projects_insert_own
  on user_vault.projects
  for insert
  to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy user_vault_projects_update_own
  on user_vault.projects
  for update
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy user_vault_projects_delete_own
  on user_vault.projects
  for delete
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy user_vault_project_links_select_own
  on user_vault.project_links
  for select
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy user_vault_project_links_insert_own
  on user_vault.project_links
  for insert
  to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy user_vault_project_links_update_own
  on user_vault.project_links
  for update
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy user_vault_project_links_delete_own
  on user_vault.project_links
  for delete
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

commit;

-- Production acceptance must additionally prove:
-- 1. anon has no privileges;
-- 2. user A cannot access user B rows;
-- 3. organization roles cannot access personal rows;
-- 4. PostgREST exposure is an explicit separate decision;
-- 5. Supabase security advisors have no new findings.
-- 6. the permission-aware resolver reads the existing organization directory and
--    user_vault rows without copying either source into the other.
-- 7. no seed data or private URL is committed to this public repository.
