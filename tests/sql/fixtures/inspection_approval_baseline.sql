-- Synthetic local-only PostgreSQL fixture. No provider or production rows.
-- Source functions/views read 2026-11-14; never run this fixture against Supabase.
CREATE SCHEMA auth;
CREATE SCHEMA facilities;
CREATE SCHEMA operations;
CREATE SCHEMA core;
CREATE TABLE core.rooms(id uuid,org_id uuid,property_id uuid,room_key text,room_number integer,name_es text,name_en text,active boolean);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS 'SELECT NULL::uuid';
CREATE TABLE facilities.inspection_checks (
  id uuid,
  org_id uuid,
  property_id uuid,
  inspection_round_id uuid,
  check_key text,
  block_label text,
  check_order integer,
  area_label text,
  room_id uuid,
  check_text text,
  pass_criteria text,
  required_for_round boolean,
  required_for_target_close boolean,
  result_status text,
  evidence_ref text,
  evidence_note text,
  responsible_name text,
  captured_by uuid,
  captured_at timestamp with time zone,
  target_event_id uuid,
  target_task_id uuid,
  parent_task_id uuid,
  auto_close_event boolean,
  auto_close_task boolean,
  auto_close_parent_task boolean,
  requires_supervisor_review boolean,
  supervisor_confirmed boolean,
  supervisor_name text,
  supervisor_confirmed_by uuid,
  supervisor_confirmed_at timestamp with time zone,
  failure_action text,
  source_ref text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  carry_forward_mode text,
  PRIMARY KEY (id)
);

CREATE TABLE facilities.inspection_rounds (
  id uuid,
  org_id uuid,
  property_id uuid,
  round_key text,
  zone_label text,
  sort_order integer,
  status text,
  priority text,
  objective text,
  evidence_checklist text,
  estimated_minutes integer,
  responsible_name text,
  result_notes text,
  source_system text,
  source_base_id text,
  source_table text,
  source_record_id text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  execution_task_key text,
  PRIMARY KEY (id)
);

CREATE TABLE facilities.maintenance_events (
  id uuid,
  org_id uuid,
  property_id uuid,
  event_key text,
  occurred_at timestamp with time zone,
  event_date date,
  event_time text,
  title text,
  category text,
  event_type text,
  property_area text,
  room_unit text,
  details text,
  status text,
  priority text,
  reported_by text,
  assigned_to text,
  supplier_or_technician text,
  amount numeric(14,2),
  currency text,
  items_or_parts text,
  brand_model text,
  serial_number text,
  warranty_until date,
  service_identifier text,
  needs_follow_up boolean,
  recommended_action text,
  evidence text,
  notes text,
  source_system text,
  source_base_id text,
  source_table text,
  source_record_id text,
  verified_status text,
  active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  physical_asset_id uuid,
  closure_status text,
  verified_closed_at timestamp with time zone,
  closure_evidence_ref text,
  recurrence_group_key text,
  root_cause_summary text,
  resolution_summary text,
  amount_kind text,
  amount_basis text,
  amount_verification text,
  PRIMARY KEY (id)
);

CREATE TABLE operations.tasks (
  id uuid,
  org_id uuid,
  property_id uuid,
  task_key text,
  task_name text,
  project_id uuid,
  category text,
  status text,
  priority text,
  area text,
  owner_name text,
  assignee_name text,
  created_date timestamp with time zone,
  due_date date,
  start_date date,
  description text,
  source_label text,
  blocking_reason text,
  completion_notes text,
  estimated_cost numeric,
  urgency_score numeric,
  related_room_id uuid,
  related_reservation_id uuid,
  related_guest_id uuid,
  active boolean,
  source_system text,
  source_table text,
  source_record_id text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  source_status_raw text,
  migration_classification text,
  needs_revalidation boolean,
  canonical_module_key text,
  module_lead text,
  PRIMARY KEY (id)
);
CREATE OR REPLACE FUNCTION facilities.apply_inspection_check_result()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_round_key text;
  v_round_status text;
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
  select r.round_key, r.status, r.execution_task_key
    into v_round_key, v_round_status, v_execution_task_key
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
                     select 1 from facilities.inspection_checks c
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
$function$;

CREATE OR REPLACE FUNCTION facilities.prepare_inspection_check()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
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
$function$;

CREATE TRIGGER trg_prepare_inspection_check BEFORE UPDATE ON facilities.inspection_checks FOR EACH ROW EXECUTE FUNCTION facilities.prepare_inspection_check();
CREATE TRIGGER trg_apply_inspection_check_result AFTER UPDATE OF result_status,evidence_ref,evidence_note,responsible_name,supervisor_confirmed,supervisor_name,supervisor_confirmed_at ON facilities.inspection_checks FOR EACH ROW EXECUTE FUNCTION facilities.apply_inspection_check_result();
CREATE VIEW facilities.inspection_field_capture_v AS  SELECT c.id AS check_id,
    c.org_id,
    c.property_id,
    r.round_key,
    r.zone_label AS round_name,
    r.status AS round_status,
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
        CASE
            WHEN c.result_status = 'pass'::text AND (NOT c.requires_supervisor_review OR c.supervisor_confirmed) THEN true
            ELSE false
        END AS closure_ready,
    c.updated_at
   FROM facilities.inspection_checks c
     JOIN facilities.inspection_rounds r ON r.id = c.inspection_round_id;

CREATE VIEW operations.room_operational_gate AS  WITH room_task_rollup AS (
         SELECT t_1.org_id,
            t_1.property_id,
            t_1.related_room_id AS room_id,
            count(*) FILTER (WHERE t_1.active AND (t_1.status = ANY (ARRAY['blocked'::text, 'in_progress'::text, 'planned'::text])) AND lower(COALESCE(t_1.priority, ''::text)) = 'p0'::text)::integer AS p0_blocker_count,
            count(*) FILTER (WHERE t_1.active AND (t_1.status = ANY (ARRAY['blocked'::text, 'in_progress'::text, 'planned'::text])) AND (lower(COALESCE(t_1.priority, ''::text)) = ANY (ARRAY['p1'::text, 'high'::text])))::integer AS p1_attention_count,
            string_agg((t_1.task_key || ' · '::text) || t_1.task_name, '
'::text ORDER BY (
                CASE lower(COALESCE(t_1.priority, ''::text))
                    WHEN 'p0'::text THEN 0
                    WHEN 'p1'::text THEN 1
                    WHEN 'high'::text THEN 1
                    ELSE 2
                END), t_1.updated_at DESC) FILTER (WHERE t_1.active AND (t_1.status = ANY (ARRAY['blocked'::text, 'in_progress'::text, 'planned'::text])) AND (lower(COALESCE(t_1.priority, ''::text)) = ANY (ARRAY['p0'::text, 'p1'::text, 'high'::text]))) AS open_task_summary
           FROM operations.tasks t_1
          WHERE t_1.related_room_id IS NOT NULL
          GROUP BY t_1.org_id, t_1.property_id, t_1.related_room_id
        ), recent_event_rollup AS (
         SELECT r_1.id AS room_id,
            count(e_1.*) FILTER (WHERE e_1.active AND e_1.event_date >= ((now() AT TIME ZONE 'America/Costa_Rica'::text)::date - 2) AND (lower(COALESCE(e_1.status, ''::text)) <> ALL (ARRAY['resuelto'::text, 'resolved'::text, 'reported_resolved'::text, 'historical'::text, 'superseded / owner hold'::text, 'cancelled'::text, 'done'::text])) AND COALESCE(e_1.room_unit, ''::text) ~ (('(^|[^0-9])'::text || r_1.room_number::text) || '([^0-9]|$)'::text))::integer AS recent_unresolved_evidence_count,
            max(e_1.occurred_at) FILTER (WHERE e_1.active AND e_1.event_date >= ((now() AT TIME ZONE 'America/Costa_Rica'::text)::date - 2) AND COALESCE(e_1.room_unit, ''::text) ~ (('(^|[^0-9])'::text || r_1.room_number::text) || '([^0-9]|$)'::text)) AS latest_recent_event_at
           FROM core.rooms r_1
             LEFT JOIN facilities.maintenance_events e_1 ON e_1.org_id = r_1.org_id AND e_1.property_id = r_1.property_id
          WHERE r_1.active
          GROUP BY r_1.id
        )
 SELECT r.org_id,
    r.property_id,
    r.id AS room_id,
    r.room_key,
    r.room_number,
    r.name_es,
    r.name_en,
    COALESCE(t.p0_blocker_count, 0) AS p0_blocker_count,
    COALESCE(t.p1_attention_count, 0) AS p1_attention_count,
    COALESCE(e.recent_unresolved_evidence_count, 0) AS recent_unresolved_evidence_count,
    e.latest_recent_event_at,
    t.open_task_summary,
        CASE
            WHEN COALESCE(t.p0_blocker_count, 0) > 0 THEN 'BLOCKED'::text
            WHEN COALESCE(e.recent_unresolved_evidence_count, 0) > 0 THEN 'REVIEW_REQUIRED'::text
            WHEN COALESCE(t.p1_attention_count, 0) > 0 THEN 'REVIEW_REQUIRED'::text
            ELSE 'HUMAN_QA_REQUIRED'::text
        END AS gate_status,
        CASE
            WHEN COALESCE(t.p0_blocker_count, 0) > 0 THEN 'Open P0 operational task blocks room release.'::text
            WHEN COALESCE(e.recent_unresolved_evidence_count, 0) > 0 THEN 'Recent unresolved room evidence exists; verify and create/update task if material.'::text
            WHEN COALESCE(t.p1_attention_count, 0) > 0 THEN 'Open P1/high operational task requires explicit review before release.'::text
            ELSE 'No current system blocker found; fresh housekeeping QA and human reception release are still required.'::text
        END AS gate_reason,
    false AS auto_release_allowed,
    (now() AT TIME ZONE 'America/Costa_Rica'::text) AS calculated_at_cr
   FROM core.rooms r
     LEFT JOIN room_task_rollup t ON t.org_id = r.org_id AND t.property_id = r.property_id AND t.room_id = r.id
     LEFT JOIN recent_event_rollup e ON e.room_id = r.id
  WHERE r.active;
