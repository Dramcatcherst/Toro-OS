-- DRAFT ONLY. Exact-source guarded correction; not applied remotely.
-- Run only after reviewed deployment authorization, role/consumer checks and backup.
-- No new tables, columns, roles, grants, flags or auto-close policy.
BEGIN;
SET LOCAL lock_timeout='3s';
LOCK TABLE facilities.inspection_checks IN ACCESS EXCLUSIVE MODE;
DO $guard$
BEGIN
  if md5(pg_get_functiondef('facilities.prepare_inspection_check()'::regprocedure)) <> '7eb6c9ef5af1aa432dba15cae71be4a1'
    or (select md5(pg_get_triggerdef(oid,true)) from pg_trigger where tgrelid='facilities.inspection_checks'::regclass and tgname='trg_apply_inspection_check_result') is distinct from '051e84e1b05f6b0912d4cf4bd97f6931'
    or md5(pg_get_functiondef('facilities.apply_inspection_check_result()'::regprocedure)) <> '39ac301caeb60da33da322e735e59673'
    or md5(pg_get_viewdef('facilities.inspection_field_capture_v'::regclass,false)) <> '3ac5ecf445854fb1e3880d6a9b860bda'
    or md5(pg_get_viewdef('operations.room_operational_gate'::regclass,false)) <> 'a93f507a531d04ac0ed9e3c9352cdc0e'
    or (select count(*) from pg_trigger
        where tgrelid='facilities.inspection_checks'::regclass and not tgisinternal and tgenabled='O'
          and ((tgname='trg_prepare_inspection_check' and tgfoid='facilities.prepare_inspection_check()'::regprocedure)
            or (tgname='trg_apply_inspection_check_result' and tgfoid='facilities.apply_inspection_check_result()'::regprocedure))) <> 2
    or (select md5(pg_get_triggerdef(oid,true)) from pg_trigger where tgrelid='facilities.inspection_checks'::regclass and tgname='trg_prepare_inspection_check') is distinct from '27825c57c42b15f7047380fbf1b88542'
  then raise exception 'INSPECTION_APPROVAL_SOURCE_DRIFT'; end if;
END;
$guard$;

CREATE OR REPLACE FUNCTION facilities.prepare_inspection_check()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  v_capture_bound boolean;
begin
  new.updated_at := now();

  -- OLD is inspected before accepting caller-supplied resets or a new scope.
  v_capture_bound := old.result_status is distinct from 'pending'
    or old.captured_at is not null or old.captured_by is not null
    or coalesce(old.supervisor_confirmed, false)
    or old.supervisor_name is not null or old.supervisor_confirmed_by is not null
    or old.supervisor_confirmed_at is not null;

  if v_capture_bound and
     (new.org_id, new.property_id, new.inspection_round_id, new.room_id, new.target_event_id, new.target_task_id, new.parent_task_id)
       is distinct from (old.org_id, old.property_id, old.inspection_round_id, old.room_id, old.target_event_id, old.target_task_id, old.parent_task_id) then
    raise exception using errcode = '23514', message = 'INSPECTION_CAPTURE_SCOPE_IMMUTABLE';
  end if;

  if v_capture_bound and
     (new.evidence_ref, new.evidence_note, new.check_text, new.pass_criteria, new.responsible_name, new.area_label, new.check_key, new.required_for_round, new.required_for_target_close, new.requires_supervisor_review, new.auto_close_event, new.auto_close_task, new.auto_close_parent_task)
       is distinct from (old.evidence_ref, old.evidence_note, old.check_text, old.pass_criteria, old.responsible_name, old.area_label, old.check_key, old.required_for_round, old.required_for_target_close, old.requires_supervisor_review, old.auto_close_event, old.auto_close_task, old.auto_close_parent_task) then
    new.result_status := 'pending';
    new.captured_at := null;
    new.captured_by := null;
    new.supervisor_confirmed := false;
    new.supervisor_name := null;
    new.supervisor_confirmed_by := null;
    new.supervisor_confirmed_at := null;
    return new;
  end if;

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
$function$
;
DROP TRIGGER trg_apply_inspection_check_result ON facilities.inspection_checks;
CREATE TRIGGER trg_apply_inspection_check_result
AFTER UPDATE OF result_status, evidence_ref, evidence_note, responsible_name, supervisor_confirmed, supervisor_name, supervisor_confirmed_at, org_id, property_id, inspection_round_id, room_id, target_event_id, target_task_id, parent_task_id, check_text, pass_criteria, required_for_round, required_for_target_close, requires_supervisor_review, auto_close_event, auto_close_task, auto_close_parent_task, area_label, check_key
ON facilities.inspection_checks
FOR EACH ROW
WHEN ((old.result_status, old.evidence_ref, old.evidence_note, old.responsible_name, old.supervisor_confirmed, old.supervisor_name, old.supervisor_confirmed_at, old.org_id, old.property_id, old.inspection_round_id, old.room_id, old.target_event_id, old.target_task_id, old.parent_task_id, old.check_text, old.pass_criteria, old.required_for_round, old.required_for_target_close, old.requires_supervisor_review, old.auto_close_event, old.auto_close_task, old.auto_close_parent_task, old.area_label, old.check_key) IS DISTINCT FROM (new.result_status, new.evidence_ref, new.evidence_note, new.responsible_name, new.supervisor_confirmed, new.supervisor_name, new.supervisor_confirmed_at, new.org_id, new.property_id, new.inspection_round_id, new.room_id, new.target_event_id, new.target_task_id, new.parent_task_id, new.check_text, new.pass_criteria, new.required_for_round, new.required_for_target_close, new.requires_supervisor_review, new.auto_close_event, new.auto_close_task, new.auto_close_parent_task, new.area_label, new.check_key))
EXECUTE FUNCTION facilities.apply_inspection_check_result();
COMMIT;
