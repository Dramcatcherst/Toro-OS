-- TORO OS project/task alignment gate
-- 2026-09-22
--
-- P0 governance contract:
-- 1) one organization + one canonical_module_key = at most one active project;
-- 2) one active root PORTFOLIO per organization;
-- 3) every active project has a canonical module;
-- 4) every active non-root project belongs to an active parent in the same org;
-- 5) active project trees cannot self-reference or introduce a parent cycle;
-- 6) active tasks require a canonical module and an active project home in the same org;
-- 7) archived/cancelled/closed tasks cannot remain active;
-- 8) a project cannot be retired while active tasks still point to it.
--
-- Historical MERGED/inactive project rows and inactive task history remain preserved.

create unique index if not exists projects_one_active_per_canonical_module_idx
  on operations.projects (org_id, canonical_module_key)
  where active = true
    and canonical_module_key is not null;

comment on index operations.projects_one_active_per_canonical_module_idx is
  'TORO P0 NO_PARALLEL_PROJECTS gate: at most one active project per organization and canonical module. Historical inactive/MERGED projects remain preserved.';

create unique index if not exists projects_one_active_root_portfolio_idx
  on operations.projects (org_id)
  where active = true
    and project_level = 'PORTFOLIO';

comment on index operations.projects_one_active_root_portfolio_idx is
  'TORO P0 alignment gate: one active root PORTFOLIO per organization.';

alter table operations.projects
  drop constraint if exists projects_active_requires_canonical_module_chk;

alter table operations.projects
  add constraint projects_active_requires_canonical_module_chk
  check (
    active = false
    or (canonical_module_key is not null and btrim(canonical_module_key) <> '')
  );

comment on constraint projects_active_requires_canonical_module_chk
  on operations.projects is
  'TORO P0 alignment gate: active projects must declare canonical_module_key.';

alter table operations.projects
  drop constraint if exists projects_active_requires_parent_chk;

alter table operations.projects
  add constraint projects_active_requires_parent_chk
  check (
    active = false
    or (
      project_level = 'PORTFOLIO'
      and parent_project_key is null
    )
    or (
      project_level is distinct from 'PORTFOLIO'
      and parent_project_key is not null
      and btrim(parent_project_key) <> ''
    )
  );

comment on constraint projects_active_requires_parent_chk
  on operations.projects is
  'TORO P0 alignment gate: active root PORTFOLIO has no parent; every other active project must declare a parent key.';

alter table operations.projects
  drop constraint if exists projects_merged_must_be_inactive_chk;

alter table operations.projects
  add constraint projects_merged_must_be_inactive_chk
  check (
    not (
      active = true
      and upper(coalesce(status, '')) = 'MERGED'
    )
  );

comment on constraint projects_merged_must_be_inactive_chk
  on operations.projects is
  'TORO P0 status-truth gate: a MERGED project cannot remain active.';

alter table operations.tasks
  drop constraint if exists tasks_active_requires_project_home_chk;

alter table operations.tasks
  add constraint tasks_active_requires_project_home_chk
  check (
    active = false
    or project_id is not null
  );

comment on constraint tasks_active_requires_project_home_chk
  on operations.tasks is
  'TORO P0 task-routing gate: active tasks require a project home.';

alter table operations.tasks
  drop constraint if exists tasks_active_requires_canonical_module_chk;

alter table operations.tasks
  add constraint tasks_active_requires_canonical_module_chk
  check (
    active = false
    or (canonical_module_key is not null and btrim(canonical_module_key) <> '')
  );

comment on constraint tasks_active_requires_canonical_module_chk
  on operations.tasks is
  'TORO P0 task-routing gate: active tasks require canonical_module_key; submodules do not create projects.';

alter table operations.tasks
  drop constraint if exists tasks_terminal_status_must_be_inactive_chk;

alter table operations.tasks
  add constraint tasks_terminal_status_must_be_inactive_chk
  check (
    not (
      active = true
      and lower(coalesce(status, '')) in ('archived','cancelled','closed')
    )
  );

comment on constraint tasks_terminal_status_must_be_inactive_chk
  on operations.tasks is
  'TORO P0 status-truth gate: archived/cancelled/closed tasks cannot remain active.';

create or replace function operations.enforce_project_tree_alignment()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.active then
    if new.project_level = 'PORTFOLIO' then
      if new.parent_project_key is not null then
        raise exception using
          errcode = 'P0001',
          message = 'active root PORTFOLIO cannot have parent_project_key';
      end if;
    else
      if new.parent_project_key is null or btrim(new.parent_project_key) = '' then
        raise exception using
          errcode = 'P0001',
          message = 'active non-root project requires parent_project_key';
      end if;

      if new.parent_project_key = new.project_key then
        raise exception using
          errcode = 'P0001',
          message = 'project cannot be its own parent';
      end if;

      if not exists (
        select 1
        from operations.projects p
        where p.org_id = new.org_id
          and p.project_key = new.parent_project_key
          and p.active = true
      ) then
        raise exception using
          errcode = 'P0001',
          message = 'active project parent must exist and be active in the same organization';
      end if;

      if exists (
        with recursive ancestors as (
          select
            p.project_key,
            p.parent_project_key,
            array[p.project_key]::text[] as path
          from operations.projects p
          where p.org_id = new.org_id
            and p.project_key = new.parent_project_key
            and p.active = true

          union all

          select
            p.project_key,
            p.parent_project_key,
            a.path || p.project_key
          from operations.projects p
          join ancestors a
            on p.project_key = a.parent_project_key
          where p.org_id = new.org_id
            and p.active = true
            and not (p.project_key = any(a.path))
        )
        select 1
        from ancestors
        where project_key = new.project_key
      ) then
        raise exception using
          errcode = 'P0001',
          message = 'project parent change would create a cycle';
      end if;
    end if;
  end if;

  if tg_op = 'UPDATE'
     and old.active = true
     and new.active = false
     and exists (
       select 1
       from operations.tasks t
       where t.project_id = old.id
         and t.active = true
     ) then
    raise exception using
      errcode = 'P0001',
      message = 'cannot retire project while active tasks still reference it';
  end if;

  return new;
end;
$$;

drop trigger if exists projects_tree_alignment_guard on operations.projects;

create trigger projects_tree_alignment_guard
before insert or update of org_id, project_key, parent_project_key, project_level, active
on operations.projects
for each row
execute function operations.enforce_project_tree_alignment();

create or replace function operations.enforce_active_task_project_home()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.active then
    if new.project_id is null then
      raise exception using
        errcode = 'P0001',
        message = 'active task requires project_id';
    end if;

    if new.canonical_module_key is null or btrim(new.canonical_module_key) = '' then
      raise exception using
        errcode = 'P0001',
        message = 'active task requires canonical_module_key';
    end if;

    if not exists (
      select 1
      from operations.projects p
      where p.id = new.project_id
        and p.org_id = new.org_id
        and p.active = true
        and upper(coalesce(p.status, '')) <> 'MERGED'
    ) then
      raise exception using
        errcode = 'P0001',
        message = 'active task project home must be active, non-MERGED and in the same organization';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists tasks_active_project_home_guard on operations.tasks;

create trigger tasks_active_project_home_guard
before insert or update of org_id, project_id, canonical_module_key, active
on operations.tasks
for each row
execute function operations.enforce_active_task_project_home();


-- Extend the existing canonical portfolio health view instead of creating a
-- parallel project-alignment dashboard/view. New columns are appended to
-- preserve the existing view contract for current consumers.
create or replace view operations.toro_portfolio_health_v1 as
select
  now() as observed_at,
  (select count(*)::integer from operations.toro_unified_portfolio_v1) as open_work_count,
  (select count(*)::integer from operations.toro_unified_portfolio_v1 where execution_bucket='EXECUTE_NOW') as execute_now_count,
  (select count(*)::integer from operations.toro_unified_portfolio_v1 where execution_bucket='CONSTRAINED') as constrained_count,
  (select count(*)::integer from operations.toro_unified_portfolio_v1 where execution_bucket='BACKLOG') as backlog_count,
  (select count(*)::integer from operations.toro_unified_portfolio_v1 where execution_bucket='REVIEW') as review_count,
  (select count(*)::integer from operations.toro_unified_portfolio_v1 where strategic_outcome='UNMAPPED' or workstream='UNMAPPED') as unmapped_work_count,
  (select count(*)::integer from operations.projects where active) as active_project_count,
  (select count(*)::integer
     from operations.projects
    where active
      and project_key <> 'toro_os_portfolio_master'
      and parent_project_key is null) as active_orphan_project_count,
  (select max(length(coalesce(next_action,''))) from operations.projects where active) as max_active_next_action_chars,
  (select count(*)::integer
     from operations.tasks t
     join operations.projects pc on pc.id=t.project_id
     join operations.projects pt on pt.project_key=t.canonical_module_key and pt.active
    where t.active
      and t.status = any(array['planned','todo','in_progress','blocked'])
      and t.canonical_module_key is not null
      and pc.project_key <> pt.project_key) as project_module_mismatch_count,
  (select count(*)::integer from operations.toro_system_surfaces_v1 where surface_class='CANONICAL') as canonical_surface_count,
  (select count(*)::integer from operations.toro_system_surfaces_v1 where surface_class='TRANSITION') as transition_surface_count,
  (select count(*)::integer from operations.toro_system_surfaces_v1 where surface_class='ARCHIVE') as archive_surface_count,
  (select count(*)::integer from operations.toro_system_surfaces_v1 where surface_class='PARKED') as parked_surface_count,
  (select count(*)::integer from operations.toro_system_surfaces_v1 where review_state='NEEDS_AUDIT') as surface_needs_audit_count,
  (select count(*)::integer from operations.toro_constraints_v1) as constraint_group_count,
  (select count(*)::integer from operations.toro_owner_attention_v1) as owner_attention_count,
  (select count(*)::integer
     from (
       select org_id, canonical_module_key
       from operations.projects
       where active
       group by org_id, canonical_module_key
       having count(*) > 1
     ) d) as duplicate_active_module_count,
  (select count(*)::integer
     from operations.projects
    where active
      and (canonical_module_key is null or btrim(canonical_module_key)='')) as active_missing_module_count,
  (select count(*)::integer
     from operations.tasks t
     join operations.projects p on p.id=t.project_id
    where t.active
      and (not p.active or p.status='MERGED')) as active_task_on_merged_project_count;

comment on view operations.toro_portfolio_health_v1 is
  'Canonical TORO portfolio health. Includes project uniqueness/alignment checks; do not create a parallel project-health view.';
