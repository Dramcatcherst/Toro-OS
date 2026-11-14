-- Run only in the disposable fixture database, never in Supabase.
CREATE TEMP TABLE inspection_test_results(name text, pass boolean);
CREATE FUNCTION pg_temp.seed_inspection(p_review boolean DEFAULT true) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  TRUNCATE facilities.inspection_checks, facilities.inspection_rounds, facilities.maintenance_events, operations.tasks;
  INSERT INTO operations.tasks(id,task_key,status) VALUES
    ('00000000-0000-0000-0000-000000000004','fixture-execution','done'),
    ('00000000-0000-0000-0000-000000000005','fixture-target','planned');
  INSERT INTO facilities.inspection_rounds(id,org_id,property_id,round_key,status,execution_task_key) VALUES
    ('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000020','fixture-round','completed','fixture-execution');
  INSERT INTO facilities.inspection_checks(
    id,org_id,property_id,inspection_round_id,room_id,result_status,check_text,pass_criteria,
    evidence_ref,evidence_note,responsible_name,captured_at,captured_by,
    required_for_round,required_for_target_close,requires_supervisor_review,
    supervisor_confirmed,supervisor_name,supervisor_confirmed_by,supervisor_confirmed_at,
    auto_close_event,auto_close_task,auto_close_parent_task,target_task_id)
  VALUES(
    '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000020','00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000030','pass','functional check','working',
    'fixture/evidence-1','observed before','fixture technician','2026-01-01T00:00:00Z',
    '00000000-0000-0000-0000-000000000040',true,true,p_review,
    p_review,CASE WHEN p_review THEN 'fixture reviewer' END,
    CASE WHEN p_review THEN '00000000-0000-0000-0000-000000000041'::uuid END,
    CASE WHEN p_review THEN '2026-01-01T00:01:00Z'::timestamptz END,
    false,false,false,'00000000-0000-0000-0000-000000000005');
END;
$$;
DO $$
DECLARE item record; check_row facilities.inspection_checks%rowtype; review boolean; rejected boolean;
BEGIN
  -- Removing any material field from invalidation must fail its literal case.
  FOR item IN SELECT * FROM (VALUES
    ('evidence_ref',quote_literal('fixture/evidence-2')),
    ('area_label',quote_literal('new physical area')),
    ('check_key',quote_literal('new-logical-check')),
    ('evidence_note',quote_literal('new observation')),
    ('check_text',quote_literal('new functional check')),
    ('pass_criteria',quote_literal('new criterion')),
    ('responsible_name',quote_literal('new technician')),
    ('required_for_round','false'),
    ('required_for_target_close','false'),
    ('requires_supervisor_review','false'),
    ('auto_close_event','true'),('auto_close_task','true'),('auto_close_parent_task','true')
  ) v(field,value) LOOP
    PERFORM pg_temp.seed_inspection();
    EXECUTE format('UPDATE facilities.inspection_checks SET %I=%s WHERE id=%L',item.field,item.value,'00000000-0000-0000-0000-000000000001');
    SELECT * INTO check_row FROM facilities.inspection_checks;
    INSERT INTO inspection_test_results VALUES ('material:'||item.field,
      check_row.result_status='pending' AND check_row.captured_at IS NULL AND check_row.captured_by IS NULL
      AND NOT check_row.supervisor_confirmed AND check_row.supervisor_name IS NULL
      AND check_row.supervisor_confirmed_by IS NULL AND check_row.supervisor_confirmed_at IS NULL);
  END LOOP;
  FOREACH review IN ARRAY ARRAY[true,false] LOOP
    PERFORM pg_temp.seed_inspection(review);
    UPDATE facilities.inspection_checks SET pass_criteria='changed criterion';
    INSERT INTO inspection_test_results SELECT 'criterion aggregates:review='||review,
      NOT v.closure_ready AND r.status='ready' AND t.status='in_progress'
    FROM facilities.inspection_field_capture_v v JOIN facilities.inspection_rounds r ON r.id=(SELECT inspection_round_id FROM facilities.inspection_checks)
    JOIN operations.tasks t ON t.task_key='fixture-execution';

    PERFORM pg_temp.seed_inspection(review);
    UPDATE facilities.inspection_checks SET evidence_ref='fixture/new-evidence';
    INSERT INTO inspection_test_results SELECT 'evidence aggregates:review='||review,
      NOT v.closure_ready AND r.status='ready' AND t.status='in_progress'
    FROM facilities.inspection_field_capture_v v JOIN facilities.inspection_rounds r ON r.id=(SELECT inspection_round_id FROM facilities.inspection_checks)
    JOIN operations.tasks t ON t.task_key='fixture-execution';
  END LOOP;

  -- Old scope is immutable after capture, even when the same UPDATE clears it.
  FOR item IN SELECT * FROM (VALUES
    ('org_id'),('property_id'),('inspection_round_id'),('room_id'),
    ('target_event_id'),('target_task_id'),('parent_task_id')
  ) v(field) LOOP
    PERFORM pg_temp.seed_inspection();
    rejected:=false;
    BEGIN
      EXECUTE format('UPDATE facilities.inspection_checks SET %I=%L::uuid,result_status=%L,captured_at=NULL,captured_by=NULL,supervisor_confirmed=false,supervisor_name=NULL,supervisor_confirmed_by=NULL,supervisor_confirmed_at=NULL',
       item.field,'00000000-0000-0000-0000-000000000099','pending');
    EXCEPTION WHEN check_violation THEN rejected:=SQLERRM='INSPECTION_CAPTURE_SCOPE_IMMUTABLE';
    END;
    INSERT INTO inspection_test_results SELECT 'captured scope immutable:'||item.field,
      rejected AND result_status='pass' AND captured_at='2026-01-01T00:00:00Z' FROM facilities.inspection_checks;
  END LOOP;

  PERFORM pg_temp.seed_inspection();
  UPDATE facilities.inspection_checks SET check_order=9,block_label='display label';
  INSERT INTO inspection_test_results SELECT 'display edit preserves capture and approval',
    result_status='pass' AND supervisor_confirmed AND captured_at='2026-01-01T00:00:00Z'
    AND check_order=9 AND block_label='display label' FROM facilities.inspection_checks;

  PERFORM pg_temp.seed_inspection();
  -- Updating material evidence cannot self-approve, even under local postgres.
  UPDATE facilities.inspection_checks SET evidence_ref='fixture/new-evidence',result_status='pass',
    supervisor_confirmed=true,supervisor_name='new approver',
    supervisor_confirmed_by='00000000-0000-0000-0000-000000000099',
    supervisor_confirmed_at=now(),captured_at=now();
  INSERT INTO inspection_test_results SELECT 'same update cannot reapprove changed evidence',
    result_status='pending' AND NOT supervisor_confirmed AND captured_at IS NULL
    AND supervisor_name IS NULL AND supervisor_confirmed_by IS NULL AND supervisor_confirmed_at IS NULL FROM facilities.inspection_checks;

  PERFORM pg_temp.seed_inspection();
  UPDATE facilities.inspection_checks SET evidence_ref='fixture/new-evidence';
  UPDATE facilities.inspection_checks SET result_status='pass',supervisor_confirmed=true,supervisor_name='fixture reviewer',supervisor_confirmed_at=now();
  INSERT INTO inspection_test_results SELECT 'separate fresh capture and approval still work',
    result_status='pass' AND captured_at IS NOT NULL AND supervisor_confirmed
    AND (SELECT status='completed' FROM facilities.inspection_rounds)
    AND (SELECT status='done' FROM operations.tasks WHERE task_key='fixture-execution') FROM facilities.inspection_checks;

  PERFORM pg_temp.seed_inspection();
  UPDATE facilities.inspection_checks SET result_status='pending';
  UPDATE facilities.inspection_checks SET result_status='pass',evidence_ref='fixture/first-capture',evidence_note='new observation';
  INSERT INTO inspection_test_results SELECT 'first capture may supply evidence in the same update',
    result_status='pass' AND captured_at IS NOT NULL AND NOT supervisor_confirmed
    AND NOT (SELECT closure_ready FROM facilities.inspection_field_capture_v)
    FROM facilities.inspection_checks;

  -- No-op assignments to newly watched material fields must not activate auto-close.
  PERFORM pg_temp.seed_inspection();
  UPDATE facilities.inspection_checks SET auto_close_task=true; -- candidate invalidates first
  UPDATE facilities.inspection_checks SET result_status='pass',supervisor_confirmed=true;
  UPDATE operations.tasks SET status='planned' WHERE task_key='fixture-target';
  UPDATE facilities.inspection_checks SET check_text=check_text,pass_criteria=pass_criteria;
  INSERT INTO inspection_test_results SELECT 'no-op criterion does not trigger target close',
    status='planned' FROM operations.tasks WHERE task_key='fixture-target';

  UPDATE operations.tasks SET status='planned' WHERE task_key='fixture-target';
  UPDATE facilities.inspection_checks SET result_status=result_status;
  INSERT INTO inspection_test_results SELECT 'no-op original status does not trigger target close',
    status='planned' FROM operations.tasks WHERE task_key='fixture-target';

  -- A pending record with cleared capture can change scope; history/RLS are separate.
  PERFORM pg_temp.seed_inspection();
  UPDATE facilities.inspection_checks SET result_status='pending';
  UPDATE facilities.inspection_checks SET room_id='00000000-0000-0000-0000-000000000098';
  INSERT INTO inspection_test_results SELECT 'uncaptured draft scope remains editable',
    result_status='pending' AND room_id='00000000-0000-0000-0000-000000000098' FROM facilities.inspection_checks;
END;
$$;
SELECT CASE WHEN pass THEN 'PASS ' ELSE 'FAIL ' END||name FROM inspection_test_results ORDER BY name;
DO $$
DECLARE failures integer; total integer;
BEGIN
 SELECT count(*) FILTER(WHERE NOT coalesce(pass,false)),count(*) INTO failures,total FROM inspection_test_results;
 IF total<>31 THEN RAISE EXCEPTION 'INSPECTION_TEST_CASE_COUNT: %',total; END IF;
 IF failures>0 THEN RAISE EXCEPTION 'INSPECTION_TEST_FAILURES: %/%',failures,total; END IF;
 RAISE NOTICE 'INSPECTION_APPROVAL_CHECKS_PASSED: %',total;
END;
$$;
