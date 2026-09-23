-- TORO Brain maintenance no-delta rollover guard
-- Proposed/applied via Supabase governed migration path.
-- Rollback source: docs/evidence/maintenance_daily_round_prechange_20260923.sql
-- Pre-change MD5: 080aca2d53cc87f637ac2ddb9a5e75c9

CREATE OR REPLACE FUNCTION facilities.create_daily_maintenance_round(p_round_date date)
RETURNS TABLE(inspection_round_id uuid, round_key text, check_count integer, generic_new_task_checks integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
declare
  v_new_key text := 'MNT-DAILY-P0-P1-' || to_char(p_round_date,'YYYYMMDD');
  v_prev_round_id uuid;
  v_prev_round_key text;
  v_prev_round_status text;
  v_prev_required_count integer := 0;
  v_prev_pending_count integer := 0;
  v_uncovered_task_count integer := 0;
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
           (select count(*)::integer from facilities.inspection_checks c where c.inspection_round_id=v_new_round_id),
           0;
    return;
  end if;

  select r.id,r.round_key,r.status
    into v_prev_round_id,v_prev_round_key,v_prev_round_status
  from facilities.inspection_rounds r
  where r.round_key like 'MNT-DAILY-P0-P1-%'
    and r.round_key < v_new_key
  order by r.round_key desc
  limit 1;

  if v_prev_round_id is null then
    raise exception 'No prior daily maintenance round exists before %',p_round_date;
  end if;

  select
    count(*) filter (where c.required_for_round)::integer,
    count(*) filter (where c.required_for_round and c.result_status='pending')::integer
  into v_prev_required_count,v_prev_pending_count
  from facilities.inspection_checks c
  where c.inspection_round_id=v_prev_round_id;

  select count(*)::integer
    into v_uncovered_task_count
  from operations.tasks t
  where t.active
    and t.status not in ('done','archived')
    and t.priority in ('p0','p1')
    and lower(coalesce(t.area,'')) in ('maintenance','laundry / maintenance')
    and t.task_key <> 'maintenance_daily_p0_p1_round'
    and not exists (
      select 1
      from facilities.inspection_checks c
      where c.inspection_round_id=v_prev_round_id
        and (c.target_task_id=t.id or c.parent_task_id=t.id)
    );

  -- Cognitive proof guard:
  -- A scheduled artifact is not an outcome. If the previous logical round is still
  -- completely unexecuted and no new P0/P1 task is uncovered, reuse it instead of
  -- cloning another equivalent daily packet.
  if v_prev_round_status='ready'
     and v_prev_required_count > 0
     and v_prev_pending_count = v_prev_required_count
     and v_uncovered_task_count = 0 then
    return query
    select v_prev_round_id,v_prev_round_key,
           (select count(*)::integer from facilities.inspection_checks c where c.inspection_round_id=v_prev_round_id),
           0;
    return;
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
         (select count(*)::integer from facilities.inspection_checks c where c.inspection_round_id=v_new_round_id),
         v_generic_count;
end;
$function$;
