-- LOCAL ONLY. RPC definitions are exact; actor/scope helpers are test doubles.
-- This is not a production RLS, real-login or physical-closure test.
CREATE TEMP TABLE inspection_rpc_results(name text PRIMARY KEY, pass boolean);
CREATE FUNCTION pg_temp.rpc_assert(p_name text,p_pass boolean) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO inspection_rpc_results VALUES(p_name,coalesce(p_pass,false));
END;
$$;
CREATE FUNCTION pg_temp.rpc_actor(p_role text DEFAULT 'EMPLEADO',p_org text DEFAULT '00000000-0000-0000-0000-000000000010') RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('inspection_test.actor',CASE WHEN p_role='' THEN '' WHEN p_role='ADMIN' THEN '00000000-0000-0000-0000-000000000042' ELSE '00000000-0000-0000-0000-000000000041' END,false);
  PERFORM set_config('inspection_test.org',p_org,false);
  PERFORM set_config('inspection_test.role',p_role,false);
END;
$$;
CREATE FUNCTION pg_temp.rpc_seed() RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  TRUNCATE facilities.inspection_checks,facilities.inspection_rounds,facilities.maintenance_events,operations.tasks;
  INSERT INTO operations.tasks(id,task_key,status) VALUES
    ('00000000-0000-0000-0000-000000000004','rpc-execution','in_progress'),
    ('00000000-0000-0000-0000-000000000005','rpc-target','planned');
  INSERT INTO facilities.inspection_rounds(id,org_id,property_id,round_key,status,execution_task_key) VALUES
    ('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000020','rpc-round','ready','rpc-execution');
  INSERT INTO facilities.inspection_checks(id,org_id,property_id,inspection_round_id,room_id,result_status,check_text,pass_criteria,
    required_for_round,required_for_target_close,requires_supervisor_review,supervisor_confirmed,
    auto_close_event,auto_close_task,auto_close_parent_task,target_task_id)
  VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000020','00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000030','pending','synthetic physical check','synthetic criterion',
    true,true,true,false,false,true,false,'00000000-0000-0000-0000-000000000005');
  PERFORM pg_temp.rpc_actor();
END;
$$;
DO $$
DECLARE payload jsonb; rejected boolean; check_id uuid := '00000000-0000-0000-0000-000000000001';
BEGIN
  PERFORM pg_temp.rpc_assert('exact RPC source definitions',
    md5(pg_get_functiondef('private.submit_maintenance_inspection_check_impl(uuid,text,text,text,text)'::regprocedure))='74f464d389ce4909443ae98b765fbd52'
    AND md5(pg_get_functiondef('public.submit_maintenance_inspection_check(uuid,text,text,text,text)'::regprocedure))='9816ac2cdb7036962e25f7a8f74bcea8'
    AND md5(pg_get_functiondef('facilities.confirm_inspection_check(uuid,text)'::regprocedure))='d7761301600922d2e00bd0f1a8f673f9'
    AND md5(pg_get_functiondef('public.confirm_maintenance_inspection_check(uuid,text)'::regprocedure))='2a5425d71885d45de44afbc0620208e5');
  PERFORM pg_temp.rpc_seed();
  PERFORM pg_temp.rpc_actor('');rejected:=false;
  BEGIN
    PERFORM public.submit_maintenance_inspection_check(check_id,'pass','fixture/e1','fixture note','fixture technician');
  EXCEPTION WHEN raise_exception THEN rejected:=SQLERRM='authentication required';END;
  PERFORM pg_temp.rpc_assert('missing synthetic actor rejected before capture',rejected AND (SELECT result_status='pending' FROM facilities.inspection_checks));

  PERFORM pg_temp.rpc_actor('EMPLEADO','00000000-0000-0000-0000-000000000099');rejected:=false;
  BEGIN
    PERFORM public.submit_maintenance_inspection_check(check_id,'pass','fixture/e1','fixture note','fixture technician');
  EXCEPTION WHEN raise_exception THEN rejected:=SQLERRM='not authorized to submit maintenance field result';END;
  PERFORM pg_temp.rpc_assert('derived check org reaches authorization helper',rejected AND (SELECT result_status='pending' FROM facilities.inspection_checks));

  PERFORM pg_temp.rpc_actor('AUDITOR');rejected:=false;
  BEGIN
    PERFORM public.submit_maintenance_inspection_check(check_id,'pass','fixture/e1','fixture note','fixture technician');
  EXCEPTION WHEN raise_exception THEN rejected:=SQLERRM='not authorized to submit maintenance field result';END;
  PERFORM pg_temp.rpc_assert('read-only synthetic helper admission cannot submit',rejected);
  PERFORM pg_temp.rpc_actor();

  rejected:=false;
  BEGIN PERFORM public.submit_maintenance_inspection_check(check_id,'invalid','fixture/e1','fixture note','fixture technician');
  EXCEPTION WHEN raise_exception THEN rejected:=SQLERRM='invalid result status';END;
  PERFORM pg_temp.rpc_assert('invalid result rejected',rejected);
  rejected:=false;
  BEGIN PERFORM public.submit_maintenance_inspection_check(check_id,'pass','fixture/e1','fixture note',' ');
  EXCEPTION WHEN raise_exception THEN rejected:=SQLERRM='responsible name required';END;
  PERFORM pg_temp.rpc_assert('blank responsible name rejected',rejected);
  rejected:=false;
  BEGIN PERFORM public.submit_maintenance_inspection_check(check_id,'pass',' ','fixture note','fixture technician');
  EXCEPTION WHEN raise_exception THEN rejected:=SQLERRM='evidence required for pass/fail';END;
  PERFORM pg_temp.rpc_assert('blank pass evidence rejected',rejected);
  rejected:=false;
  BEGIN PERFORM public.submit_maintenance_inspection_check(check_id,'fail',NULL,'fixture note','fixture technician');
  EXCEPTION WHEN raise_exception THEN rejected:=SQLERRM='evidence required for pass/fail';END;
  PERFORM pg_temp.rpc_assert('missing fail evidence rejected',rejected);

  payload:=public.submit_maintenance_inspection_check(check_id,'pass','fixture/e1','fixture note','fixture technician');
  PERFORM pg_temp.rpc_assert('first RPC capture returns stored pass',payload#>>'{check,result_status}'='pass'
    AND payload#>>'{check,captured_at}' IS NOT NULL AND (payload#>>'{progress,pass_checks}')::integer=1
    AND (SELECT captured_by='00000000-0000-0000-0000-000000000041'::uuid FROM facilities.inspection_checks));
  PERFORM pg_temp.rpc_assert('first capture still requires supervisor',payload#>>'{check,supervisor_confirmed}'='false'
    AND (SELECT NOT closure_ready FROM facilities.inspection_field_capture_v));
  rejected:=false;
  BEGIN PERFORM public.confirm_maintenance_inspection_check(check_id,'fixture reviewer');
  EXCEPTION WHEN raise_exception THEN rejected:=SQLERRM='not authorized to confirm inspection check';END;
  PERFORM pg_temp.rpc_assert('field actor cannot confirm through RPC',rejected AND (SELECT NOT supervisor_confirmed FROM facilities.inspection_checks));
  PERFORM pg_temp.rpc_actor('ADMIN');PERFORM public.confirm_maintenance_inspection_check(check_id,'fixture reviewer');
  PERFORM pg_temp.rpc_assert('synthetic authorized supervisor confirmation works',
    (SELECT closure_ready FROM facilities.inspection_field_capture_v)
    AND (SELECT supervisor_confirmed_by='00000000-0000-0000-0000-000000000042'::uuid FROM facilities.inspection_checks));

  PERFORM pg_temp.rpc_actor();
  payload:=public.submit_maintenance_inspection_check(check_id,'pass','fixture/e2','new fixture note','fixture technician');
  PERFORM pg_temp.rpc_assert('changed evidence RPC returns actual pending not requested pass',payload#>>'{check,result_status}'='pending'
    AND payload#>>'{check,captured_at}' IS NULL AND payload#>>'{check,supervisor_confirmed}'='false'
    AND (payload#>>'{progress,pending_checks}')::integer=1
    AND (SELECT result_status='pending' FROM facilities.inspection_checks));
  PERFORM pg_temp.rpc_assert('changed evidence RPC refreshes round and execution',
    (SELECT NOT closure_ready FROM facilities.inspection_field_capture_v)
    AND (SELECT status='ready' FROM facilities.inspection_rounds)
    AND (SELECT status='in_progress' FROM operations.tasks WHERE task_key='rpc-execution'));
  payload:=public.submit_maintenance_inspection_check(check_id,'pass','fixture/e2','new fixture note','fixture technician');
  PERFORM pg_temp.rpc_assert('second identical RPC permits fresh recapture',payload#>>'{check,result_status}'='pass'
    AND payload#>>'{check,captured_at}' IS NOT NULL AND payload#>>'{check,supervisor_confirmed}'='false');
  PERFORM pg_temp.rpc_actor('ADMIN');PERFORM public.confirm_maintenance_inspection_check(check_id,'fixture reviewer');
  PERFORM pg_temp.rpc_assert('fresh recapture can be confirmed normally',(SELECT closure_ready FROM facilities.inspection_field_capture_v));
  UPDATE operations.tasks SET status='planned' WHERE task_key='rpc-target';
  PERFORM pg_temp.rpc_actor();
  payload:=public.submit_maintenance_inspection_check(check_id,'pass','fixture/e2','new fixture note','fixture technician');
  PERFORM pg_temp.rpc_assert('identical RPC replay does not close reopened target',payload#>>'{check,result_status}'='pass'
    AND (SELECT status='planned' FROM operations.tasks WHERE task_key='rpc-target'));

  PERFORM pg_temp.rpc_seed();
  payload:=public.submit_maintenance_inspection_check(check_id,'not_reviewed',NULL,NULL,'fixture technician');
  PERFORM pg_temp.rpc_assert('not-reviewed existing contract needs no evidence reference',payload#>>'{check,result_status}'='not_reviewed'
    AND (SELECT NOT closure_ready FROM facilities.inspection_field_capture_v));
  PERFORM pg_temp.rpc_seed();
  payload:=public.submit_maintenance_inspection_check(check_id,'fail','fixture/fail',NULL,'fixture technician');
  PERFORM pg_temp.rpc_assert('fail capture returns stored failure',payload#>>'{check,result_status}'='fail'
    AND (payload#>>'{progress,fail_checks}')::integer=1 AND (SELECT NOT closure_ready FROM facilities.inspection_field_capture_v));
END;
$$;
SELECT CASE WHEN pass THEN 'PASS ' ELSE 'FAIL ' END||name FROM inspection_rpc_results ORDER BY name;
DO $$
DECLARE failures integer;total integer;
BEGIN
  SELECT count(*) FILTER(WHERE NOT pass),count(*) INTO failures,total FROM inspection_rpc_results;
  IF total<>19 THEN RAISE EXCEPTION 'INSPECTION_RPC_TEST_COUNT: %',total;END IF;
  IF failures>0 THEN RAISE EXCEPTION 'INSPECTION_RPC_TEST_FAILURES: %/%',failures,total;END IF;
  RAISE NOTICE 'INSPECTION_RPC_CONTRACT_CHECKS_PASSED: %',total;
END;
$$;
