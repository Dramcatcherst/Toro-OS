-- PREPARED rollback only. Separate exact ADMIN MODE approval required.
-- Keep role NOLOGIN and evidence/receipts; do not DROP a role with dependencies.
begin;
alter role toro_alegra_writer_reader_v1 nologin;
drop policy if exists alegra_reader_knowledge_scope_v1 on operations.knowledge_items;
drop policy if exists alegra_reader_knowledge_allow_v1 on operations.knowledge_items;
drop policy if exists alegra_reader_receipts_scope_v1 on public.toro_execution_receipts;
drop policy if exists alegra_reader_receipts_allow_v1 on public.toro_execution_receipts;
drop policy if exists alegra_reader_decisions_scope_v1 on operations.executive_decisions;
drop policy if exists alegra_reader_decisions_allow_v1 on operations.executive_decisions;
drop policy if exists alegra_reader_runs_scope_v1 on public.toro_execution_runs;
drop policy if exists alegra_reader_runs_allow_v1 on public.toro_execution_runs;
revoke all privileges on public.toro_execution_runs,public.toro_execution_receipts,operations.executive_decisions,operations.knowledge_items from toro_alegra_writer_reader_v1;
-- Table-level REVOKE does not remove column ACLs. Revoke the exact staged
-- column grants as well; do not leave read access behind during rollback.
revoke select(id,org_id,task_id,decision_id,run_key,idempotency_key,correlation_id,trace_id,actor_kind,actor_ref,dot_ref,agent_ref,action_key,target_system,execution_authority_level,business_risk,status,verification_status,attempt_count,max_attempts,lease_owner,fencing_token,lease_expires_at,safe_metadata) on public.toro_execution_runs from toro_alegra_writer_reader_v1;
revoke select(id,org_id,status,decision_value,processed_at,updated_at,decision_key,program_key,instruction,source_system,source_record_id,source_ref,superseded_by) on operations.executive_decisions from toro_alegra_writer_reader_v1;
revoke select(id,org_id,run_id,task_id,decision_id,receipt_type,status,verification_status,action_key,target_system,execution_authority_level,actor_kind,actor_ref,integrity_hash,desired_state,executed_state,observed_after,source_receipt_system,source_receipt_kind,source_receipt_ref,supersedes_receipt_id) on public.toro_execution_receipts from toro_alegra_writer_reader_v1;
revoke select(org_id,knowledge_key,structured_content,updated_at,active) on operations.knowledge_items from toro_alegra_writer_reader_v1;
revoke usage on schema public,operations from toro_alegra_writer_reader_v1;
commit;
-- Do not kill sessions blindly. Disable/close the exact approved caller first;
-- reconcile outstanding effects by identity. Existing Writer/ledger untouched.
