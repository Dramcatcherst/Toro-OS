-- PREPARED ONLY. Requires exact ADMIN MODE approval before execution.
-- Separate read principal; do not alter the existing four-RPC Writer role.
-- No LOGIN/password, ledger access, writes, runtime flag or provider mutation.
begin;
do $preflight$
declare target regclass;
begin
  if current_database() <> 'postgres' then raise exception 'reader_stage_database_mismatch'; end if;
  if exists(select 1 from pg_roles where rolname='toro_alegra_writer_reader_v1') then
    raise exception 'reader_stage_role_exists_reconcile_no_reapply';
  end if;
  if (select count(*) from operations.knowledge_items where org_id='595801ce-2895-4d91-81ae-e8d1d5cc8593'::uuid
      and knowledge_key='toro_alegra_connector_v2' and active and structured_content->'runtime_write_enabled'='false'::jsonb) <> 1 then
    raise exception 'reader_stage_requires_exact_writer_off';
  end if;
  foreach target in array array['public.toro_execution_runs'::regclass,'public.toro_execution_receipts'::regclass,
      'operations.executive_decisions'::regclass,'operations.knowledge_items'::regclass] loop
    if not (select relrowsecurity from pg_class where oid=target) then raise exception 'reader_stage_rls_required'; end if;
  end loop;
end $preflight$;
create role toro_alegra_writer_reader_v1 nologin noinherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls connection limit 2;
grant usage on schema public,operations to toro_alegra_writer_reader_v1;
grant select(id,org_id,task_id,decision_id,run_key,idempotency_key,correlation_id,trace_id,actor_kind,actor_ref,dot_ref,agent_ref,
  action_key,target_system,execution_authority_level,business_risk,status,verification_status,attempt_count,max_attempts,
  lease_owner,fencing_token,lease_expires_at,safe_metadata) on public.toro_execution_runs to toro_alegra_writer_reader_v1;
grant select(id,org_id,status,decision_value,processed_at,updated_at,decision_key,program_key,instruction,source_system,
  source_record_id,source_ref,superseded_by) on operations.executive_decisions to toro_alegra_writer_reader_v1;
grant select(id,org_id,run_id,task_id,decision_id,receipt_type,status,verification_status,action_key,target_system,
  execution_authority_level,actor_kind,actor_ref,integrity_hash,desired_state,executed_state,observed_after,
  source_receipt_system,source_receipt_kind,source_receipt_ref,supersedes_receipt_id) on public.toro_execution_receipts to toro_alegra_writer_reader_v1;
grant select(org_id,knowledge_key,structured_content,updated_at,active) on operations.knowledge_items to toro_alegra_writer_reader_v1;

-- A restrictive scope accompanies each allow policy: PUBLIC permissive
-- policies cannot widen this principal to another org/action/knowledge item.
create policy alegra_reader_runs_allow_v1 on public.toro_execution_runs for select to toro_alegra_writer_reader_v1
using(org_id='595801ce-2895-4d91-81ae-e8d1d5cc8593'::uuid and action_key='alegra_create_purchase_bill' and target_system='alegra' and execution_authority_level='L3');
create policy alegra_reader_runs_scope_v1 on public.toro_execution_runs as restrictive for select to toro_alegra_writer_reader_v1
using(org_id='595801ce-2895-4d91-81ae-e8d1d5cc8593'::uuid and action_key='alegra_create_purchase_bill' and target_system='alegra' and execution_authority_level='L3');
create policy alegra_reader_decisions_allow_v1 on operations.executive_decisions for select to toro_alegra_writer_reader_v1
using(org_id='595801ce-2895-4d91-81ae-e8d1d5cc8593'::uuid and id in(select r.decision_id from public.toro_execution_runs r where r.org_id=executive_decisions.org_id));
create policy alegra_reader_decisions_scope_v1 on operations.executive_decisions as restrictive for select to toro_alegra_writer_reader_v1
using(org_id='595801ce-2895-4d91-81ae-e8d1d5cc8593'::uuid and id in(select r.decision_id from public.toro_execution_runs r where r.org_id=executive_decisions.org_id));
create policy alegra_reader_receipts_allow_v1 on public.toro_execution_receipts for select to toro_alegra_writer_reader_v1
using(org_id='595801ce-2895-4d91-81ae-e8d1d5cc8593'::uuid and run_id in(select r.id from public.toro_execution_runs r where r.org_id=toro_execution_receipts.org_id));
create policy alegra_reader_receipts_scope_v1 on public.toro_execution_receipts as restrictive for select to toro_alegra_writer_reader_v1
using(org_id='595801ce-2895-4d91-81ae-e8d1d5cc8593'::uuid and run_id in(select r.id from public.toro_execution_runs r where r.org_id=toro_execution_receipts.org_id));
create policy alegra_reader_knowledge_allow_v1 on operations.knowledge_items for select to toro_alegra_writer_reader_v1
using(org_id='595801ce-2895-4d91-81ae-e8d1d5cc8593'::uuid and (knowledge_key='toro_alegra_connector_v2' or knowledge_key in(
  select r.safe_metadata#>>'{alegraWriterContextV1,policy,openPeriod,knowledgeKey}' from public.toro_execution_runs r where r.org_id=knowledge_items.org_id
  union select r.safe_metadata#>>'{alegraWriterContextV1,policy,correctionPolicy,knowledgeKey}' from public.toro_execution_runs r where r.org_id=knowledge_items.org_id)));
create policy alegra_reader_knowledge_scope_v1 on operations.knowledge_items as restrictive for select to toro_alegra_writer_reader_v1
using(org_id='595801ce-2895-4d91-81ae-e8d1d5cc8593'::uuid and (knowledge_key='toro_alegra_connector_v2' or knowledge_key in(
  select r.safe_metadata#>>'{alegraWriterContextV1,policy,openPeriod,knowledgeKey}' from public.toro_execution_runs r where r.org_id=knowledge_items.org_id
  union select r.safe_metadata#>>'{alegraWriterContextV1,policy,correctionPolicy,knowledgeKey}' from public.toro_execution_runs r where r.org_id=knowledge_items.org_id)));
commit;
-- Required after authorized apply: exact ACL/role/membership readback, SET ROLE
-- column privilege allow/deny and advisories. Native row allow/deny requires
-- a separately approved dedicated LOGIN/TLS session; no SET-role grant here.
-- LOGIN and secure delivery are a separate explicit approval, never in this SQL.
