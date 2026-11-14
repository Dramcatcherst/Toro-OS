-- DRAFT rollback; exact candidate-only, no CASCADE, no row restoration.
-- Reverting restores the known stale-approval/no-op behavior; requires review.
BEGIN;
SET LOCAL lock_timeout='3s';
LOCK TABLE facilities.inspection_checks IN ACCESS EXCLUSIVE MODE;
DO $guard$
BEGIN
  if md5(pg_get_functiondef('facilities.prepare_inspection_check()'::regprocedure)) <> 'fc43eac7bb405df5abe872cfb80efa01'
    or (select md5(pg_get_triggerdef(oid,true)) from pg_trigger where tgrelid='facilities.inspection_checks'::regclass and tgname='trg_apply_inspection_check_result') is distinct from 'c8963800798e558112f4b654b5eae63e'
    or md5(pg_get_functiondef('facilities.apply_inspection_check_result()'::regprocedure)) <> '39ac301caeb60da33da322e735e59673'
    or md5(pg_get_viewdef('facilities.inspection_field_capture_v'::regclass,false)) <> '3ac5ecf445854fb1e3880d6a9b860bda'
    or md5(pg_get_viewdef('operations.room_operational_gate'::regclass,false)) <> 'a93f507a531d04ac0ed9e3c9352cdc0e'
    or (select count(*) from pg_trigger
        where tgrelid='facilities.inspection_checks'::regclass and not tgisinternal and tgenabled='O'
          and ((tgname='trg_prepare_inspection_check' and tgfoid='facilities.prepare_inspection_check()'::regprocedure)
            or (tgname='trg_apply_inspection_check_result' and tgfoid='facilities.apply_inspection_check_result()'::regprocedure))) <> 2
    or (select md5(pg_get_triggerdef(oid,true)) from pg_trigger where tgrelid='facilities.inspection_checks'::regclass and tgname='trg_prepare_inspection_check') is distinct from '27825c57c42b15f7047380fbf1b88542'
  then raise exception 'INSPECTION_APPROVAL_ROLLBACK_SOURCE_DRIFT'; end if;
END;
$guard$;

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
$function$
;
DROP TRIGGER trg_apply_inspection_check_result ON facilities.inspection_checks;
CREATE TRIGGER trg_apply_inspection_check_result AFTER UPDATE OF result_status,evidence_ref,evidence_note,responsible_name,supervisor_confirmed,supervisor_name,supervisor_confirmed_at ON facilities.inspection_checks FOR EACH ROW EXECUTE FUNCTION facilities.apply_inspection_check_result();
COMMIT;
