-- PREPARED ONLY. Requires a separately authorized dedicated reader LOGIN/TLS
-- session. Never execute as postgres/SET ROLE and call it runtime acceptance.
begin read only;
-- Stop before domain queries if either the physical or effective user differs.
select 1 / case when current_user='toro_alegra_writer_reader_v1'
  and session_user='toro_alegra_writer_reader_v1' and current_database()='postgres'
  then 1 else 0 end as exact_dedicated_identity;
select jsonb_build_object('principal',current_user,'login_principal',session_user,
  'connector_allowed',(select count(*)=1 from operations.knowledge_items where org_id='595801ce-2895-4d91-81ae-e8d1d5cc8593'::uuid and knowledge_key='toro_alegra_connector_v2'),
  'other_org_run_rows',(select count(*) from public.toro_execution_runs where org_id<>'595801ce-2895-4d91-81ae-e8d1d5cc8593'::uuid),
  'other_action_run_rows',(select count(*) from public.toro_execution_runs where action_key<>'alegra_create_purchase_bill' or target_system<>'alegra' or execution_authority_level<>'L3'),
  'other_org_decision_rows',(select count(*) from operations.executive_decisions where org_id<>'595801ce-2895-4d91-81ae-e8d1d5cc8593'::uuid),
  'other_org_receipt_rows',(select count(*) from public.toro_execution_receipts where org_id<>'595801ce-2895-4d91-81ae-e8d1d5cc8593'::uuid),
  'other_org_knowledge_rows',(select count(*) from operations.knowledge_items where org_id<>'595801ce-2895-4d91-81ae-e8d1d5cc8593'::uuid)) as reader_rls_allow_deny;
rollback;
-- Expect identity=1, connector_allowed=true, every deny count=0.
-- Capture results without sensitive row values. Live schema/policy drift or
-- broader PUBLIC privileges must fail commissioning, never trigger a retry
-- with postgres/service_role or automatic permission expansion.
