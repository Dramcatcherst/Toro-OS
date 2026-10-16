\set ON_ERROR_STOP on

-- Run only after the 30-second lease created by
-- alegra_l3_writer_assertions.sql has expired. This test never contacts Alegra;
-- it exercises the local PostgreSQL recovery contract only.
do $$
declare
  v_context public.alegra_l3_test_context%rowtype;
  v_run_before public.toro_execution_runs%rowtype;
  v_run_after public.toro_execution_runs%rowtype;
  v_result jsonb;
  v_replay jsonb;
  v_final_receipt_id uuid;
  v_recovery_receipts_before integer;
  v_recovery_receipts_after integer;
  v_total_receipts_before integer;
  v_total_receipts_after integer;
begin
  select *
    into strict v_context
  from public.alegra_l3_test_context
  where label = 'recovery';

  if v_context.prepared_receipt_id is null
     or v_context.fencing_token is null then
    raise exception 'recovery_context_incomplete';
  end if;

  select *
    into strict v_run_before
  from public.toro_execution_runs
  where id = v_context.run_id;

  if v_run_before.status is distinct from 'running'
     or v_run_before.verification_status is distinct from 'pending'
     or v_run_before.lease_owner is distinct from 'writer-recovery'
     or v_run_before.lease_expires_at is null
     or v_run_before.lease_expires_at > clock_timestamp()
     or v_run_before.fencing_token <> v_context.fencing_token
     or v_run_before.safe_metadata->>'approvalBindingState' is distinct from 'admitted'
     or v_run_before.safe_metadata->>'preparedReceiptId'
          is distinct from v_context.prepared_receipt_id::text then
    raise exception 'recovery_precondition_not_expired_admitted_run';
  end if;

  select count(*)
    into v_recovery_receipts_before
  from public.toro_execution_receipts receipt
  where receipt.run_id = v_context.run_id
    and receipt.source_receipt_kind = 'alegra_l3_expired_lease_recovery';

  select count(*)
    into v_total_receipts_before
  from public.toro_execution_receipts receipt
  where receipt.run_id = v_context.run_id;

  if v_recovery_receipts_before <> 0 then
    raise exception 'recovery_receipt_preexisted';
  end if;

  -- An expired lease cannot be revived by the stale worker.
  if public.toro_heartbeat_alegra_execution_v1(
       '10000000-0000-4000-8000-000000000001',
       v_context.run_id,
       'writer-recovery',
       v_context.fencing_token,
       v_context.prepared_receipt_id,
       60
     ) is not null then
    raise exception 'expired_lease_was_revived_by_heartbeat';
  end if;

  select *
    into strict v_run_after
  from public.toro_execution_runs
  where id = v_context.run_id;

  if v_run_after is distinct from v_run_before then
    raise exception 'expired_heartbeat_mutated_run';
  end if;

  v_result := public.toro_recover_expired_alegra_execution_v1(
    '10000000-0000-4000-8000-000000000001',
    v_context.run_id,
    'recovery-controller',
    v_context.fencing_token,
    v_context.prepared_receipt_id
  );

  if v_result is null
     or (v_result->>'replayed')::boolean is distinct from false
     or (v_result->>'runId')::uuid is distinct from v_context.run_id
     or v_result->>'runStatus' is distinct from 'blocked'
     or v_result->>'verificationStatus' is distinct from 'partial'
     or v_result->>'providerState' is distinct from 'PROVIDER_STATE_UNKNOWN'
     or (v_result->>'fencingToken')::bigint
          is distinct from v_context.fencing_token + 1
     or nullif(v_result->>'finalReceiptId', '') is null then
    raise exception 'expired_lease_recovery_failed:%', v_result;
  end if;

  v_final_receipt_id := (v_result->>'finalReceiptId')::uuid;

  select *
    into strict v_run_after
  from public.toro_execution_runs
  where id = v_context.run_id;

  if v_run_after.status is distinct from 'blocked'
     or v_run_after.verification_status is distinct from 'partial'
     or v_run_after.fencing_token <> v_context.fencing_token + 1
     or v_run_after.lease_owner is not null
     or v_run_after.lease_expires_at is not null
     or v_run_after.verifying_at is null
     or v_run_after.finished_at is null
     or v_run_after.error_class is distinct from 'ALEGRA_PROVIDER_STATE_UNKNOWN'
     or v_run_after.error_redacted is not null
     or v_run_after.safe_metadata->>'approvalBindingState' is distinct from 'recovery_blocked'
     or v_run_after.safe_metadata->>'preparedReceiptId'
          is distinct from v_context.prepared_receipt_id::text
     or v_run_after.safe_metadata->>'recoveryReceiptId'
          is distinct from v_final_receipt_id::text
     or v_run_after.safe_metadata->>'finalReceiptId'
          is distinct from v_final_receipt_id::text
     or v_run_after.safe_metadata->>'recoveryState'
          is distinct from 'PROVIDER_STATE_UNKNOWN'
     or v_run_after.safe_metadata->>'recoveredFromFencingToken'
          is distinct from v_context.fencing_token::text
     or v_run_after.safe_metadata->>'recoveryFencingToken'
          is distinct from (v_context.fencing_token + 1)::text then
    raise exception 'recovery_run_state_invalid';
  end if;

  if not exists (
    select 1
    from public.toro_execution_receipts receipt
    where receipt.id = v_final_receipt_id
      and receipt.run_id = v_context.run_id
      and receipt.supersedes_receipt_id = v_context.prepared_receipt_id
      and receipt.receipt_type = 'execution'
      and receipt.status = 'blocked'
      and receipt.external_reference is null
      and receipt.execution_authority_level = 'L3'
      and receipt.idempotency_key = 'alegra-l3-recovery:expired_lease_recovery'
      and receipt.executed_state->>'phase' = 'lease_expired_after_dispatch'
      and receipt.executed_state->>'providerEffect' = 'unknown'
      and (receipt.executed_state->>'expiredFencingToken')::bigint = v_context.fencing_token
      and receipt.observed_after->>'verificationState' = 'PROVIDER_STATE_UNKNOWN'
      and receipt.observed_after->>'verified' = 'false'
      and receipt.verification_method is null
      and receipt.verification_status = 'partial'
      and receipt.source_receipt_system = 'toro_control_plane'
      and receipt.source_receipt_kind = 'alegra_l3_expired_lease_recovery'
      and receipt.source_receipt_ref = v_context.prepared_receipt_id::text
      and receipt.integrity_hash = v_context.payload_hash
      and receipt.error_class = 'ALEGRA_PROVIDER_STATE_UNKNOWN'
      and receipt.error_redacted is null
      and receipt.evidence_refs @> jsonb_build_array(
        'toro-execution-receipt:' || v_context.prepared_receipt_id::text
      )
  ) then
    raise exception 'recovery_receipt_contract_invalid';
  end if;

  v_replay := public.toro_recover_expired_alegra_execution_v1(
    '10000000-0000-4000-8000-000000000001',
    v_context.run_id,
    'recovery-controller',
    v_context.fencing_token,
    v_context.prepared_receipt_id
  );

  if v_replay is null
     or (v_replay->>'replayed')::boolean is distinct from true
     or (v_replay->>'runId')::uuid is distinct from v_context.run_id
     or (v_replay->>'finalReceiptId')::uuid is distinct from v_final_receipt_id
     or (v_replay->>'fencingToken')::bigint
          is distinct from v_context.fencing_token + 1
     or v_replay->>'runStatus' is distinct from 'blocked'
     or v_replay->>'verificationStatus' is distinct from 'partial'
     or v_replay->>'providerState' is distinct from 'PROVIDER_STATE_UNKNOWN' then
    raise exception 'recovery_replay_failed:%', v_replay;
  end if;

  select count(*)
    into v_recovery_receipts_after
  from public.toro_execution_receipts receipt
  where receipt.run_id = v_context.run_id
    and receipt.source_receipt_kind = 'alegra_l3_expired_lease_recovery';

  select count(*)
    into v_total_receipts_after
  from public.toro_execution_receipts receipt
  where receipt.run_id = v_context.run_id;

  if v_recovery_receipts_after <> 1
     or v_total_receipts_after <> v_total_receipts_before + 1 then
    raise exception
      'recovery_replay_created_duplicate_receipt:before=%,after=%,recovery=%',
      v_total_receipts_before,
      v_total_receipts_after,
      v_recovery_receipts_after;
  end if;
end;
$$;
