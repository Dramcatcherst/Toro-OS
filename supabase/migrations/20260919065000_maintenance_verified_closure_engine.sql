-- TORO OS: verified maintenance closure engine.
-- Schema-only migration. Daily rounds/check rows are operational data and are not seeded here.
-- Ruling 2026-09-19: Supabase CLI was unavailable in the execution environment,
-- so the migration timestamp follows the repository's existing YYYYMMDDHHMMSS convention
-- and the verified production definition as of 2026-09-19 06:50 UTC.

alter table facilities.inspection_rounds
  add column if not exists execution_task_key text;

comment on column facilities.inspection_rounds.execution_task_key is
  'Optional operations.tasks.task_key representing execution of the inspection round itself. Kept separate from provenance and incident tasks.';

create table if not exists facilities.inspection_checks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid references public.properties(id) on delete cascade,
  inspection_round_id uuid not null references facilities.inspection_rounds(id) on delete cascade,
  check_key text not null,
  block_label text not null,
  check_order integer not null default 0 check (check_order >= 0),
  area_label text,
  room_id uuid references core.rooms(id) on delete set null,
  check_text text not null,
  pass_criteria text not null,
  required_for_round boolean not null default true,
  required_for_target_close boolean not null default true,
  result_status text not null default 'pending'
    check (result_status in ('pending','pass','fail','not_reviewed')),
  evidence_ref text,
  evidence_note text,
  responsible_name text,
  captured_by uuid references auth.users(id) on delete set null,
  captured_at timestamptz,
  target_event_id uuid references facilities.maintenance_events(id) on delete set null,
  target_task_id uuid references operations.tasks(id) on delete set null,
  parent_task_id uuid references operations.tasks(id) on delete set null,
  auto_close_event boolean not null default false,
  auto_close_task boolean not null default false,
  auto_close_parent_task boolean not null default false,
  requires_supervisor_review boolean not null default false,
  supervisor_confirmed boolean not null default false,
  supervisor_name text,
  supervisor_confirmed_by uuid references auth.users(id) on delete set null,
  supervisor_confirmed_at timestamptz,
  failure_action text not null default 'triage_existing_first',
  source_ref text,
  carry_forward_mode text not null default 'while_open'
    check (carry_forward_mode in ('while_open','until_pass','daily','never')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, inspection_round_id, check_key),
  check (
    result_status = 'pending'
    or nullif(btrim(responsible_name),'') is not null
  ),
  check (
    result_status not in ('pass','fail')
    or nullif(btrim(evidence_ref),'') is not null
  ),
  check (
    supervisor_confirmed = false
    or (
      result_status = 'pass'
      and nullif(btrim(supervisor_name),'') is not null
      and supervisor_confirmed_at is not null
    )
  )
);

comment on table facilities.inspection_checks is
  'Line-item field capture for inspection rounds. PASS/FAIL requires evidence + responsible. P0-style checks may require supervisor confirmation before linked closure.';

comment on column facilities.inspection_checks.carry_forward_mode is
  'Controls cloning into the next daily round: while_open follows linked open targets; until_pass repeats until this check passes; daily always repeats; never does not carry.';

create index if not exists inspection_checks_round_order_idx
  on facilities.inspection_checks (inspection_round_id, check_order);

create index if not exists inspection_checks_result_idx
  on facilities.inspection_checks (inspection_round_id, result_status);

create index if not exists inspection_checks_target_event_idx
  on facilities.inspection_checks (target_event_id)
  where target_event_id is not null;

create index if not exists inspection_checks_target_task_idx
  on facilities.inspection_checks (target_task_id)
  where target_task_id is not null;

create index if not exists inspection_checks_parent_task_idx
  on facilities.inspection_checks (parent_task_id)
  where parent_task_id is not null;

alter table facilities.inspection_checks enable row level security;
alter table facilities.inspection_rounds enable row level security;

drop policy if exists inspection_checks_read on facilities.inspection_checks;
create policy inspection_checks_read
on facilities.inspection_checks for select
to authenticated
using (
  private.has_org_role(
    org_id,
    array['ADMIN','GERENCIA','JEFE_DEPARTAMENTO','AUDITOR']::text[]
  )
);

drop policy if exists inspection_rounds_read on facilities.inspection_rounds;
create policy inspection_rounds_read
on facilities.inspection_rounds for select
to authenticated
using (
  private.has_org_role(
    org_id,
    array['ADMIN','GERENCIA','JEFE_DEPARTAMENTO','AUDITOR']::text[]
  )
);

grant usage on schema facilities to authenticated;
grant usage on schema private to authenticated;

revoke all on facilities.inspection_checks from anon;
revoke all on facilities.inspection_checks from authenticated;
grant select on facilities.inspection_checks to authenticated;

revoke all on facilities.inspection_rounds from anon;
grant select on facilities.inspection_rounds to authenticated;

create or replace function facilities.prepare_inspection_check()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();

  if new.result_status is distinct from old.result_status then
    if new.result_status in ('pass','fail','not_reviewed') then
      new.captured_at := coalesce(new.captured_at, now());
      if auth.uid() is not null then
        new.captured_by := auth.uid();
      end if;
    elsif new.result_status = 'pending' then
      new.captured_at := null;
      new.captured_by := null;
      new.supervisor_confirmed := false;
      new.supervisor_name := null;
      new.supervisor_confirmed_by := null;
      new.supervisor_confirmed_at := null;
    end if;
  end if;

  return new;
end;
$$;

create or replace function facilities.apply_inspection_check_result()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_round_key text;
  v_execution_task_key text;
  v_event_ready boolean;
  v_task_ready boolean;
  v_parent_ready boolean;
  v_round_ready boolean;
  v_pass_count integer;
  v_fail_count integer;
  v_pending_count integer;
  v_evidence text;
begin
  select r.round_key, r.execution_task_key
    into v_round_key, v_execution_task_key
  from facilities.inspection_rounds r
  where r.id = new.inspection_round_id;

  if new.result_status = 'pass' then
    if new.auto_close_event and new.target_event_id is not null then
      select not exists (
        select 1
        from facilities.inspection_checks c
        where c.inspection_round_id = new.inspection_round_id
          and c.target_event_id = new.target_event_id
          and c.required_for_target_close
          and (
            c.result_status <> 'pass'
            or (c.requires_supervisor_review and not c.supervisor_confirmed)
          )
      ) into v_event_ready;

      if v_event_ready then
        select string_agg(distinct c.evidence_ref, ' | ' order by c.evidence_ref)
          into v_evidence
        from facilities.inspection_checks c
        where c.inspection_round_id = new.inspection_round_id
          and c.target_event_id = new.target_event_id
          and c.required_for_target_close;

        update facilities.maintenance_events m
        set closure_status = 'verified_closed',
            verified_closed_at = now(),
            closure_evidence_ref = v_evidence,
            needs_follow_up = false,
            resolution_summary = concat_ws(
              E'\n',
              nullif(m.resolution_summary,''),
              '[AUTO-CLOSE ' || coalesce(v_round_key,'inspection') || '] cierre verificado por chequeos PASS con evidencia.'
            ),
            updated_at = now()
        where m.id = new.target_event_id
          and m.closure_status <> 'verified_closed';
      end if;
    end if;

    if new.auto_close_task and new.target_task_id is not null then
      select not exists (
        select 1
        from facilities.inspection_checks c
        where c.inspection_round_id = new.inspection_round_id
          and c.target_task_id = new.target_task_id
          and c.required_for_target_close
          and (
            c.result_status <> 'pass'
            or (c.requires_supervisor_review and not c.supervisor_confirmed)
          )
      ) into v_task_ready;

      if v_task_ready then
        select string_agg(distinct c.evidence_ref, ' | ' order by c.evidence_ref)
          into v_evidence
        from facilities.inspection_checks c
        where c.inspection_round_id = new.inspection_round_id
          and c.target_task_id = new.target_task_id
          and c.required_for_target_close;

        update operations.tasks t
        set status = 'done',
            completion_notes = concat_ws(
              E'\n',
              nullif(t.completion_notes,''),
              '[AUTO-CLOSE ' || coalesce(v_round_key,'inspection') || '] Todos los chequeos requeridos PASS. Evidencia: ' || coalesce(v_evidence,'')
            ),
            needs_revalidation = false,
            updated_at = now()
        where t.id = new.target_task_id
          and t.status not in ('done','archived');
      end if;
    end if;

    if new.auto_close_parent_task and new.parent_task_id is not null then
      select not exists (
        select 1
        from facilities.inspection_checks c
        where c.inspection_round_id = new.inspection_round_id
          and c.parent_task_id = new.parent_task_id
          and c.required_for_target_close
          and (
            c.result_status <> 'pass'
            or (c.requires_supervisor_review and not c.supervisor_confirmed)
          )
      ) into v_parent_ready;

      if v_parent_ready then
        select string_agg(distinct c.evidence_ref, ' | ' order by c.evidence_ref)
          into v_evidence
        from facilities.inspection_checks c
        where c.inspection_round_id = new.inspection_round_id
          and c.parent_task_id = new.parent_task_id
          and c.required_for_target_close;

        update operations.tasks t
        set status = 'done',
            completion_notes = concat_ws(
              E'\n',
              nullif(t.completion_notes,''),
              '[AUTO-CLOSE ' || coalesce(v_round_key,'inspection') || '] Grupo completo PASS. Evidencia: ' || coalesce(v_evidence,'')
            ),
            needs_revalidation = false,
            updated_at = now()
        where t.id = new.parent_task_id
          and t.status not in ('done','archived');
      end if;
    end if;
  elsif new.result_status = 'fail' then
    if new.target_event_id is not null then
      update facilities.maintenance_events m
      set needs_follow_up = true,
          closure_status = case
            when m.closure_status = 'verified_closed' then m.closure_status
            else 'open_or_unknown'
          end,
          updated_at = now()
      where m.id = new.target_event_id;
    end if;

    if new.target_task_id is not null then
      update operations.tasks t
      set status = case
            when t.status in ('planned','in_progress') then 'in_progress'
            else t.status
          end,
          updated_at = now()
      where t.id = new.target_task_id;
    end if;

    if new.parent_task_id is not null then
      update operations.tasks t
      set status = case
            when t.status in ('planned','in_progress') then 'in_progress'
            else t.status
          end,
          updated_at = now()
      where t.id = new.parent_task_id;
    end if;
  end if;

  select
    count(*) filter (where c.result_status='pass'),
    count(*) filter (where c.result_status='fail'),
    count(*) filter (
      where c.required_for_round
        and c.result_status in ('pending','not_reviewed')
    )
  into v_pass_count, v_fail_count, v_pending_count
  from facilities.inspection_checks c
  where c.inspection_round_id = new.inspection_round_id;

  v_round_ready := (v_pending_count = 0)
                   and exists (
                     select 1
                     from facilities.inspection_checks c
                     where c.inspection_round_id = new.inspection_round_id
                       and c.required_for_round
                   );

  if v_round_ready then
    update facilities.inspection_rounds r
    set status = 'completed',
        result_notes = concat_ws(
          E'\n',
          nullif(r.result_notes,''),
          '[AUTO ' || to_char(now(),'YYYY-MM-DD HH24:MI') ||
          '] Ronda ejecutada: PASS=' || v_pass_count ||
          ', FAIL=' || v_fail_count ||
          '. Completar triage de FAIL por separado.'
        ),
        updated_at = now()
    where r.id = new.inspection_round_id
      and r.status <> 'completed';

    if nullif(v_execution_task_key,'') is not null then
      update operations.tasks t
      set status = 'done',
          completion_notes = concat_ws(
            E'\n',
            nullif(t.completion_notes,''),
            '[AUTO ' || coalesce(v_round_key,'inspection') ||
            '] Ronda ejecutada. PASS=' || v_pass_count ||
            ', FAIL=' || v_fail_count ||
            '. FAIL no equivale a cierre del incidente.'
          ),
          updated_at = now()
      where t.task_key = v_execution_task_key
        and t.status not in ('done','archived');
    end if;
  else
    update facilities.inspection_rounds r
    set status = case when r.status='completed' then 'ready' else r.status end,
        updated_at = now()
    where r.id = new.inspection_round_id;

    if nullif(v_execution_task_key,'') is not null then
      update operations.tasks t
      set status = case when t.status='done' then 'in_progress' else t.status end,
          updated_at = now()
      where t.task_key = v_execution_task_key
        and t.status <> 'archived';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_prepare_inspection_check on facilities.inspection_checks;
create trigger trg_prepare_inspection_check
before update on facilities.inspection_checks
for each row
execute function facilities.prepare_inspection_check();

drop trigger if exists trg_apply_inspection_check_result on facilities.inspection_checks;
create trigger trg_apply_inspection_check_result
after update of result_status, evidence_ref, evidence_note, responsible_name,
                supervisor_confirmed, supervisor_name, supervisor_confirmed_at
on facilities.inspection_checks
for each row
execute function facilities.apply_inspection_check_result();

create or replace view facilities.inspection_round_progress_v
with (security_invoker=true) as
select
  r.id as inspection_round_id,
  r.org_id,
  r.property_id,
  r.round_key,
  r.zone_label,
  r.status as round_status,
  count(c.id) as total_checks,
  count(c.id) filter (where c.required_for_round) as required_checks,
  count(c.id) filter (where c.result_status='pass') as pass_checks,
  count(c.id) filter (where c.result_status='fail') as fail_checks,
  count(c.id) filter (where c.result_status='not_reviewed') as not_reviewed_checks,
  count(c.id) filter (where c.result_status='pending') as pending_checks,
  count(c.id) filter (
    where c.result_status='pass'
      and (not c.requires_supervisor_review or c.supervisor_confirmed)
  ) as closure_ready_passes,
  min(c.updated_at) as first_check_updated_at,
  max(c.updated_at) as last_check_updated_at
from facilities.inspection_rounds r
left join facilities.inspection_checks c
  on c.inspection_round_id=r.id
group by r.id,r.org_id,r.property_id,r.round_key,r.zone_label,r.status;

create or replace view facilities.inspection_failure_triage_v
with (security_invoker=true) as
select
  c.id as check_id,
  c.org_id,
  c.property_id,
  r.round_key,
  c.check_key,
  c.block_label,
  c.area_label,
  c.check_text,
  c.evidence_ref,
  c.evidence_note,
  c.responsible_name,
  c.captured_at,
  c.target_event_id,
  me.event_key as target_event_key,
  me.title as target_event_title,
  c.target_task_id,
  t.task_key as target_task_key,
  t.task_name as target_task_name,
  c.parent_task_id,
  pt.task_key as parent_task_key,
  c.failure_action
from facilities.inspection_checks c
join facilities.inspection_rounds r on r.id=c.inspection_round_id
left join facilities.maintenance_events me on me.id=c.target_event_id
left join operations.tasks t on t.id=c.target_task_id
left join operations.tasks pt on pt.id=c.parent_task_id
where c.result_status='fail';

create or replace view facilities.inspection_field_capture_v
with (security_invoker=true) as
select
  c.id as check_id,
  c.org_id,
  c.property_id,
  r.round_key,
  r.zone_label as round_name,
  r.status as round_status,
  c.check_order,
  c.block_label,
  c.area_label,
  c.check_text,
  c.pass_criteria,
  c.result_status,
  c.evidence_ref,
  c.evidence_note,
  c.responsible_name,
  c.captured_at,
  c.requires_supervisor_review,
  c.supervisor_confirmed,
  case
    when c.result_status='pass'
      and (not c.requires_supervisor_review or c.supervisor_confirmed)
    then true else false
  end as closure_ready,
  c.updated_at
from facilities.inspection_checks c
join facilities.inspection_rounds r on r.id=c.inspection_round_id;

grant select on facilities.inspection_round_progress_v to authenticated;
grant select on facilities.inspection_failure_triage_v to authenticated;
grant select on facilities.inspection_field_capture_v to authenticated;

create or replace function facilities.confirm_inspection_check(
  p_check_id uuid,
  p_supervisor_name text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org_id uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  select c.org_id into v_org_id
  from facilities.inspection_checks c
  where c.id = p_check_id;

  if v_org_id is null then
    raise exception 'inspection check not found';
  end if;

  if not private.has_org_role(
    v_org_id,
    array['ADMIN','GERENCIA']::text[]
  ) then
    raise exception 'not authorized to confirm inspection check';
  end if;

  update facilities.inspection_checks c
  set supervisor_confirmed = true,
      supervisor_name = nullif(btrim(p_supervisor_name),''),
      supervisor_confirmed_by = auth.uid(),
      supervisor_confirmed_at = now(),
      updated_at = now()
  where c.id = p_check_id
    and c.requires_supervisor_review
    and c.result_status = 'pass'
    and nullif(btrim(c.evidence_ref),'') is not null
    and nullif(btrim(c.responsible_name),'') is not null;

  if not found then
    raise exception 'check is not eligible for supervisor confirmation';
  end if;
end;
$$;

revoke all on function facilities.confirm_inspection_check(uuid,text) from public;
revoke all on function facilities.confirm_inspection_check(uuid,text) from anon;
revoke all on function facilities.confirm_inspection_check(uuid,text) from authenticated;
grant execute on function facilities.confirm_inspection_check(uuid,text) to authenticated;

create or replace function facilities.create_daily_maintenance_round(p_round_date date)
returns table (
  inspection_round_id uuid,
  round_key text,
  check_count integer,
  generic_new_task_checks integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_new_key text := 'MNT-DAILY-P0-P1-' || to_char(p_round_date,'YYYYMMDD');
  v_prev_round_id uuid;
  v_prev_round_key text;
  v_new_round_id uuid;
  v_generic_count integer := 0;
begin
  select r.id,r.round_key
    into v_new_round_id,v_prev_round_key
  from facilities.inspection_rounds r
  where r.round_key=v_new_key
  limit 1;

  if v_new_round_id is not null then
    return query
    select v_new_round_id,v_new_key,
           (select count(*)::integer
            from facilities.inspection_checks c
            where c.inspection_round_id=v_new_round_id),
           0;
    return;
  end if;

  select r.id,r.round_key
    into v_prev_round_id,v_prev_round_key
  from facilities.inspection_rounds r
  where r.round_key like 'MNT-DAILY-P0-P1-%'
    and r.round_key < v_new_key
  order by r.round_key desc
  limit 1;

  if v_prev_round_id is null then
    raise exception 'No prior daily maintenance round exists before %',p_round_date;
  end if;

  insert into facilities.inspection_rounds (
    org_id,property_id,round_key,zone_label,sort_order,status,priority,
    objective,evidence_checklist,estimated_minutes,responsible_name,result_notes,
    source_system,source_table,source_record_id,execution_task_key
  )
  select
    r.org_id,r.property_id,v_new_key,
    'Ronda diaria mantenimiento · P0/P1 · ' || to_char(p_round_date,'DD/MM/YYYY'),
    0,'ready','p0',
    r.objective,
    'Generada desde ' || v_prev_round_key ||
      '. Ejecutar P0 primero, luego P1 físicos. PASS/FAIL requiere evidencia + responsable. P0 necesita confirmación Gerencia/Admin para autocierre. FAIL va a triage y nunca crea ticket automáticamente.',
    r.estimated_minutes,
    r.responsible_name,
    'Auto-generada desde ' || v_prev_round_key || '. Resultados reiniciados.',
    'TORO_OS','facilities.inspection_checks',
    'generated_from:' || v_prev_round_key,
    'maintenance_daily_p0_p1_round'
  from facilities.inspection_rounds r
  where r.id=v_prev_round_id
  returning id into v_new_round_id;

  insert into facilities.inspection_checks (
    org_id,property_id,inspection_round_id,check_key,block_label,check_order,area_label,
    room_id,check_text,pass_criteria,required_for_round,required_for_target_close,
    target_event_id,target_task_id,parent_task_id,
    auto_close_event,auto_close_task,auto_close_parent_task,
    requires_supervisor_review,failure_action,source_ref,carry_forward_mode
  )
  select
    c.org_id,c.property_id,v_new_round_id,c.check_key,c.block_label,c.check_order,c.area_label,
    c.room_id,c.check_text,c.pass_criteria,c.required_for_round,c.required_for_target_close,
    c.target_event_id,c.target_task_id,c.parent_task_id,
    c.auto_close_event,c.auto_close_task,c.auto_close_parent_task,
    c.requires_supervisor_review,c.failure_action,
    concat_ws(' | ',nullif(c.source_ref,''),'carried_from:' || v_prev_round_key),
    c.carry_forward_mode
  from facilities.inspection_checks c
  left join facilities.maintenance_events e on e.id=c.target_event_id
  left join operations.tasks t on t.id=c.target_task_id
  left join operations.tasks pt on pt.id=c.parent_task_id
  where c.inspection_round_id=v_prev_round_id
    and c.carry_forward_mode <> 'never'
    and (
      c.carry_forward_mode='daily'
      or (c.carry_forward_mode='until_pass' and c.result_status <> 'pass')
      or (
        c.carry_forward_mode='while_open'
        and (
          (c.target_event_id is not null and coalesce(e.closure_status,'open_or_unknown') <> 'verified_closed')
          or (c.target_task_id is not null and coalesce(t.status,'planned') not in ('done','archived'))
          or (c.parent_task_id is not null and coalesce(pt.status,'planned') not in ('done','archived'))
          or (
            c.target_event_id is null
            and c.target_task_id is null
            and c.parent_task_id is null
            and c.result_status <> 'pass'
          )
        )
      )
    );

  with candidates as (
    select
      t.*,
      row_number() over (
        order by case t.priority when 'p0' then 0 else 1 end,
                 coalesce(t.due_date,'9999-12-31'::date),
                 t.task_key
      ) as rn
    from operations.tasks t
    where t.active
      and t.status not in ('done','archived')
      and t.priority in ('p0','p1')
      and lower(coalesce(t.area,'')) in ('maintenance','laundry / maintenance')
      and t.task_key <> 'maintenance_daily_p0_p1_round'
      and not exists (
        select 1
        from facilities.inspection_checks c
        where c.inspection_round_id=v_new_round_id
          and (c.target_task_id=t.id or c.parent_task_id=t.id)
      )
  )
  insert into facilities.inspection_checks (
    org_id,property_id,inspection_round_id,check_key,block_label,check_order,area_label,
    room_id,check_text,pass_criteria,required_for_round,required_for_target_close,
    target_task_id,auto_close_task,requires_supervisor_review,
    failure_action,source_ref,carry_forward_mode
  )
  select
    c.org_id,c.property_id,v_new_round_id,
    'generic-' || c.task_key,
    upper(c.priority) || ' · Nuevo pendiente',
    900 + c.rn,
    coalesce(cr.room_number::text,c.area,'Mantenimiento'),
    c.related_room_id,
    c.task_name,
    'Chequeo genérico: revisar en campo y adjuntar evidencia. NO autocierra la tarea hasta mapear criterio de cierre específico.',
    true,false,
    c.id,false,(c.priority='p0'),
    'triage_existing_first',
    'operations.tasks/' || c.task_key,
    'while_open'
  from candidates c
  left join core.rooms cr on cr.id=c.related_room_id;

  get diagnostics v_generic_count = row_count;

  update operations.tasks t
  set status='in_progress',
      start_date=p_round_date,
      due_date=p_round_date,
      assignee_name=coalesce(t.assignee_name,'Mantenimiento + Housekeeping QA'),
      updated_at=now()
  where t.task_key='maintenance_daily_p0_p1_round'
    and t.active;

  return query
  select v_new_round_id,v_new_key,
         (select count(*)::integer
          from facilities.inspection_checks c
          where c.inspection_round_id=v_new_round_id),
         v_generic_count;
end;
$$;

revoke all on function facilities.create_daily_maintenance_round(date) from public;
revoke all on function facilities.create_daily_maintenance_round(date) from anon;
revoke all on function facilities.create_daily_maintenance_round(date) from authenticated;
grant execute on function facilities.create_daily_maintenance_round(date) to service_role;

create or replace function private.can_access_maintenance_field(
  target_org uuid,
  write_access boolean default false
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    private.has_org_role(target_org,array['ADMIN','GERENCIA']::text[])
    or (
      not write_access
      and private.has_org_role(target_org,array['AUDITOR']::text[])
    )
    or (
      private.has_org_role(
        target_org,
        array['JEFE_DEPARTAMENTO','EMPLEADO']::text[]
      )
      and exists (
        select 1
        from public.employees e
        join public.departments d
          on d.id=e.department_id
         and d.org_id=e.org_id
         and d.deleted_at is null
         and d.status='active'
        where e.org_id=target_org
          and e.user_id=auth.uid()
          and e.deleted_at is null
          and d.code in ('MANTENIMIENTO','HOUSEKEEPING')
      )
    );
$$;

revoke all on function private.can_access_maintenance_field(uuid,boolean) from public;
revoke all on function private.can_access_maintenance_field(uuid,boolean) from anon;
revoke all on function private.can_access_maintenance_field(uuid,boolean) from authenticated;

create or replace function private.get_current_maintenance_field_round_impl(p_org_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_payload jsonb;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  if not private.can_access_maintenance_field(p_org_id,false) then
    raise exception 'not authorized for maintenance field round';
  end if;

  with latest as (
    select r.id,r.round_key,r.zone_label,r.status,r.priority,r.objective,
           r.estimated_minutes,r.responsible_name,r.updated_at
    from facilities.inspection_rounds r
    where r.org_id=p_org_id
      and r.round_key like 'MNT-DAILY-P0-P1-%'
    order by r.round_key desc
    limit 1
  ),
  progress as (
    select
      count(c.id)::integer as total_checks,
      count(c.id) filter (where c.required_for_round)::integer as required_checks,
      count(c.id) filter (where c.result_status='pass')::integer as pass_checks,
      count(c.id) filter (where c.result_status='fail')::integer as fail_checks,
      count(c.id) filter (where c.result_status='not_reviewed')::integer as not_reviewed_checks,
      count(c.id) filter (where c.result_status='pending')::integer as pending_checks,
      count(c.id) filter (
        where c.result_status='pass'
          and (not c.requires_supervisor_review or c.supervisor_confirmed)
      )::integer as closure_ready_passes,
      max(c.updated_at) as last_check_updated_at
    from facilities.inspection_checks c
    join latest l on l.id=c.inspection_round_id
  ),
  checks as (
    select
      c.id as check_id,
      c.check_order,
      c.block_label,
      c.area_label,
      cr.room_number,
      c.check_text,
      c.pass_criteria,
      c.result_status,
      c.evidence_ref,
      c.evidence_note,
      c.responsible_name,
      c.captured_at,
      c.requires_supervisor_review,
      c.supervisor_confirmed,
      case
        when c.result_status='pass'
          and (not c.requires_supervisor_review or c.supervisor_confirmed)
        then true else false
      end as closure_ready,
      me.supplier_or_technician as supplier_or_technician,
      me.amount as cost_signal_amount,
      me.currency as cost_signal_currency,
      me.amount_kind as cost_signal_kind,
      me.amount_verification as cost_signal_verification,
      null::numeric as approved_cost_amount,
      null::text as approved_cost_currency
    from facilities.inspection_checks c
    join latest l on l.id=c.inspection_round_id
    left join core.rooms cr on cr.id=c.room_id
    left join facilities.maintenance_events me on me.id=c.target_event_id
    order by c.check_order
  )
  select jsonb_build_object(
    'round',
    case when exists(select 1 from latest) then (
      select jsonb_build_object(
        'round_key',l.round_key,
        'round_name',l.zone_label,
        'round_status',l.status,
        'priority',l.priority,
        'objective',l.objective,
        'estimated_minutes',l.estimated_minutes,
        'responsible_name',l.responsible_name,
        'total_checks',p.total_checks,
        'required_checks',p.required_checks,
        'pass_checks',p.pass_checks,
        'fail_checks',p.fail_checks,
        'not_reviewed_checks',p.not_reviewed_checks,
        'pending_checks',p.pending_checks,
        'closure_ready_passes',p.closure_ready_passes,
        'last_check_updated_at',p.last_check_updated_at
      )
      from latest l cross join progress p
    ) else null end,
    'checks',coalesce(
      (select jsonb_agg(to_jsonb(c) order by c.check_order) from checks c),
      '[]'::jsonb
    )
  ) into v_payload;

  return v_payload;
end;
$$;

create or replace function private.submit_maintenance_inspection_check_impl(
  p_check_id uuid,
  p_result text,
  p_evidence_ref text,
  p_evidence_note text,
  p_responsible_name text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org_id uuid;
  v_round_id uuid;
  v_row facilities.inspection_checks%rowtype;
  v_progress jsonb;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  if p_result not in ('pass','fail','not_reviewed') then
    raise exception 'invalid result status';
  end if;

  if nullif(btrim(p_responsible_name),'') is null then
    raise exception 'responsible name required';
  end if;

  if p_result in ('pass','fail')
     and nullif(btrim(p_evidence_ref),'') is null then
    raise exception 'evidence required for pass/fail';
  end if;

  select c.org_id,c.inspection_round_id
    into v_org_id,v_round_id
  from facilities.inspection_checks c
  where c.id=p_check_id;

  if v_org_id is null then
    raise exception 'inspection check not found';
  end if;

  if not private.can_access_maintenance_field(v_org_id,true) then
    raise exception 'not authorized to submit maintenance field result';
  end if;

  update facilities.inspection_checks c
  set result_status=p_result,
      evidence_ref=nullif(btrim(p_evidence_ref),''),
      evidence_note=nullif(btrim(p_evidence_note),''),
      responsible_name=btrim(p_responsible_name),
      updated_at=now()
  where c.id=p_check_id
  returning c.* into v_row;

  select jsonb_build_object(
    'check',jsonb_build_object(
      'check_id',v_row.id,
      'result_status',v_row.result_status,
      'evidence_ref',v_row.evidence_ref,
      'responsible_name',v_row.responsible_name,
      'captured_at',v_row.captured_at,
      'requires_supervisor_review',v_row.requires_supervisor_review,
      'supervisor_confirmed',v_row.supervisor_confirmed
    ),
    'progress',jsonb_build_object(
      'total_checks',count(*)::integer,
      'pass_checks',count(*) filter (where result_status='pass')::integer,
      'fail_checks',count(*) filter (where result_status='fail')::integer,
      'not_reviewed_checks',count(*) filter (where result_status='not_reviewed')::integer,
      'pending_checks',count(*) filter (where result_status='pending')::integer
    )
  )
  into v_progress
  from facilities.inspection_checks
  where inspection_round_id=v_round_id;

  return v_progress;
end;
$$;

revoke all on function private.get_current_maintenance_field_round_impl(uuid) from public;
revoke all on function private.get_current_maintenance_field_round_impl(uuid) from anon;
revoke all on function private.get_current_maintenance_field_round_impl(uuid) from authenticated;
grant execute on function private.get_current_maintenance_field_round_impl(uuid) to authenticated;

revoke all on function private.submit_maintenance_inspection_check_impl(uuid,text,text,text,text) from public;
revoke all on function private.submit_maintenance_inspection_check_impl(uuid,text,text,text,text) from anon;
revoke all on function private.submit_maintenance_inspection_check_impl(uuid,text,text,text,text) from authenticated;
grant execute on function private.submit_maintenance_inspection_check_impl(uuid,text,text,text,text) to authenticated;

create or replace function public.get_current_maintenance_field_round(p_org_id uuid)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select private.get_current_maintenance_field_round_impl(p_org_id);
$$;

create or replace function public.submit_maintenance_inspection_check(
  p_check_id uuid,
  p_result text,
  p_evidence_ref text,
  p_evidence_note text,
  p_responsible_name text
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.submit_maintenance_inspection_check_impl(
    p_check_id,
    p_result,
    p_evidence_ref,
    p_evidence_note,
    p_responsible_name
  );
$$;

create or replace function public.confirm_maintenance_inspection_check(
  p_check_id uuid,
  p_supervisor_name text
)
returns void
language sql
volatile
security invoker
set search_path = ''
as $$
  select facilities.confirm_inspection_check(p_check_id,p_supervisor_name);
$$;

revoke all on function public.get_current_maintenance_field_round(uuid) from public;
revoke all on function public.get_current_maintenance_field_round(uuid) from anon;
revoke all on function public.get_current_maintenance_field_round(uuid) from authenticated;
grant execute on function public.get_current_maintenance_field_round(uuid) to authenticated;

revoke all on function public.submit_maintenance_inspection_check(uuid,text,text,text,text) from public;
revoke all on function public.submit_maintenance_inspection_check(uuid,text,text,text,text) from anon;
revoke all on function public.submit_maintenance_inspection_check(uuid,text,text,text,text) from authenticated;
grant execute on function public.submit_maintenance_inspection_check(uuid,text,text,text,text) to authenticated;

revoke all on function public.confirm_maintenance_inspection_check(uuid,text) from public;
revoke all on function public.confirm_maintenance_inspection_check(uuid,text) from anon;
revoke all on function public.confirm_maintenance_inspection_check(uuid,text) from authenticated;
grant execute on function public.confirm_maintenance_inspection_check(uuid,text) to authenticated;

create or replace function public.get_current_maintenance_round()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with latest as (
    select r.id,r.round_key,r.zone_label,r.status,r.updated_at
    from facilities.inspection_rounds r
    where r.round_key like 'MNT-DAILY-P0-P1-%'
    order by r.round_key desc
    limit 1
  ),
  progress as (
    select p.*
    from facilities.inspection_round_progress_v p
    join latest l on l.id=p.inspection_round_id
  ),
  checks as (
    select
      c.id as check_id,
      c.check_order,
      c.block_label,
      c.area_label,
      c.result_status,
      c.requires_supervisor_review,
      c.supervisor_confirmed,
      c.captured_at,
      c.updated_at
    from facilities.inspection_checks c
    join latest l on l.id=c.inspection_round_id
    order by c.check_order
  )
  select jsonb_build_object(
    'round',
    case when exists (select 1 from latest)
      then (
        select jsonb_build_object(
          'round_key',p.round_key,
          'round_name',p.zone_label,
          'round_status',p.round_status,
          'total_checks',p.total_checks,
          'required_checks',p.required_checks,
          'pass_checks',p.pass_checks,
          'fail_checks',p.fail_checks,
          'not_reviewed_checks',p.not_reviewed_checks,
          'pending_checks',p.pending_checks,
          'closure_ready_passes',p.closure_ready_passes,
          'last_check_updated_at',p.last_check_updated_at
        )
        from progress p
      )
      else null
    end,
    'checks',
    coalesce(
      (select jsonb_agg(to_jsonb(c) order by c.check_order) from checks c),
      '[]'::jsonb
    )
  );
$$;

revoke all on function public.get_current_maintenance_round() from public;
revoke all on function public.get_current_maintenance_round() from anon;
revoke all on function public.get_current_maintenance_round() from authenticated;
grant execute on function public.get_current_maintenance_round() to authenticated;

comment on view facilities.inspection_failure_triage_v is
  'FAIL never creates a new task automatically. Triage existing event/task first; create a new task only when the failure is materially distinct.';

comment on view facilities.inspection_field_capture_v is
  'Field-facing inspection capture. Field writes must use the governed RPC; target IDs and closure automation remain internal.';

comment on function public.get_current_maintenance_round() is
  'Authenticated RLS-governed read model for TORO Executive Home. Returns field-safe daily maintenance progress and statuses.';

comment on function public.get_current_maintenance_field_round(uuid) is
  'Field-safe daily maintenance round. Read allowed to privileged roles/auditor and active employees in MANTENIMIENTO/HOUSEKEEPING.';

comment on function public.submit_maintenance_inspection_check(uuid,text,text,text,text) is
  'Field-safe result capture. ADMIN/GERENCIA or active JEFE_DEPARTAMENTO/EMPLEADO in MANTENIMIENTO/HOUSEKEEPING. PASS/FAIL require evidence.';

comment on function public.confirm_maintenance_inspection_check(uuid,text) is
  'P0 supervisor confirmation. Public wrapper is SECURITY INVOKER; privileged helper requires ADMIN/GERENCIA.';

-- Field writes must go through the governed RPC.
revoke update on facilities.inspection_checks from authenticated;
