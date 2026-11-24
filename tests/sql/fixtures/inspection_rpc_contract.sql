-- LOCAL SYNTHETIC RPC CONTRACT FIXTURE. Never run against Supabase.
-- The four RPC definitions below were read on 2026-11-14 and are unchanged.
-- auth.uid() and both authorization helpers are explicit test doubles.
-- This proves RPC/trigger/return-value behavior, not production auth, grants or RLS.
CREATE SCHEMA IF NOT EXISTS private;
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('inspection_test.actor', true),'')::uuid;
$$;
CREATE OR REPLACE FUNCTION private.has_org_role(target_org uuid, allowed_roles text[])
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT auth.uid() IS NOT NULL
    AND target_org::text = current_setting('inspection_test.org',true)
    AND current_setting('inspection_test.role',true) = ANY(allowed_roles);
$$;
CREATE OR REPLACE FUNCTION private.can_access_maintenance_field(target_org uuid, write_access boolean DEFAULT false)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT auth.uid() IS NOT NULL
    AND target_org::text = current_setting('inspection_test.org',true)
    AND (current_setting('inspection_test.role',true) IN ('ADMIN','GERENCIA','EMPLEADO')
      OR (NOT write_access AND current_setting('inspection_test.role',true)='AUDITOR'));
$$;

-- Source definition MD5: d7761301600922d2e00bd0f1a8f673f9
CREATE OR REPLACE FUNCTION facilities.confirm_inspection_check(p_check_id uuid, p_supervisor_name text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;

-- Source definition MD5: 74f464d389ce4909443ae98b765fbd52
CREATE OR REPLACE FUNCTION private.submit_maintenance_inspection_check_impl(p_check_id uuid, p_result text, p_evidence_ref text, p_evidence_note text, p_responsible_name text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;

-- Source definition MD5: 2a5425d71885d45de44afbc0620208e5
CREATE OR REPLACE FUNCTION public.confirm_maintenance_inspection_check(p_check_id uuid, p_supervisor_name text)
 RETURNS void
 LANGUAGE sql
 SET search_path TO ''
AS $function$
  select facilities.confirm_inspection_check(p_check_id,p_supervisor_name);
$function$;

-- Source definition MD5: 9816ac2cdb7036962e25f7a8f74bcea8
CREATE OR REPLACE FUNCTION public.submit_maintenance_inspection_check(p_check_id uuid, p_result text, p_evidence_ref text, p_evidence_note text, p_responsible_name text)
 RETURNS jsonb
 LANGUAGE sql
 SET search_path TO ''
AS $function$
  select private.submit_maintenance_inspection_check_impl(
    p_check_id,
    p_result,
    p_evidence_ref,
    p_evidence_note,
    p_responsible_name
  );
$function$;
