-- DRAFT ROLLBACK — pairs with 20260930_toro_control_plane_runtime_v1.sql
-- NOT AUTHORIZED FOR PRODUCTION APPLY

drop trigger if exists execution_receipts_append_only
  on operations.execution_receipts;

drop function if exists operations.prevent_execution_receipt_mutation_v1();
drop function if exists operations.resolve_failed_execution_run_v1(uuid,bigint,timestamptz);
drop function if exists operations.transition_execution_run_v1(uuid,text,bigint,text,text,text,text,text);
drop function if exists operations.renew_execution_lease_v1(uuid,text,bigint,integer);
drop function if exists operations.claim_execution_run_v1(uuid,text,integer);

drop view if exists operations.execution_run_queue_v1;

drop table if exists operations.execution_receipts;
drop table if exists operations.execution_runs;

drop index if exists operations.toro_executive_decisions_org_id_id_runtime_uq;
drop index if exists operations.toro_tasks_org_id_id_runtime_uq;
