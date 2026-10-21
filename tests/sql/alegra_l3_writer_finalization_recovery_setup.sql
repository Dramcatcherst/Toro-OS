\set ON_ERROR_STOP on

-- Synthetic-only cases for the real PostgreSQL lock/fence races exercised by
-- alegra_l3_writer_finalization_recovery_race.sh. Nothing in this fixture
-- contacts Supabase or Alegra.
select set_config(
  'request.jwt.claim.sub',
  '20000000-0000-4000-8000-000000000001',
  false
);
select set_config('request.jwt.claim.role', 'authenticated', false);
select set_config(
  'request.jwt.claims',
  '{"app_metadata":{"toro_role":"FOUNDER"}}',
  false
);

select public.test_sign_alegra_l3_case(
  'finalization_wins',
  '60000000-0000-4000-8000-000000000006',
  '70000000-0000-4000-8000-000000000006',
  repeat('f', 64)
);

select public.test_sign_alegra_l3_case(
  'recovery_wins',
  '60000000-0000-4000-8000-000000000007',
  '70000000-0000-4000-8000-000000000007',
  repeat('0', 64)
);

select public.test_sign_alegra_l3_case(
  'heartbeat_waits_expiry',
  '60000000-0000-4000-8000-000000000008',
  '70000000-0000-4000-8000-000000000008',
  repeat('1', 64)
);

-- A deliberately short-lived but structurally valid first approval. The
-- immutable ledger requires a 15-minute validity interval, so its approved_at
-- is placed in the past and its expires_at remains briefly in the future.
-- This is fixture-only data; the canonical renewal below still goes through
-- resolve_toro_decision and the production draft triggers.
do $$
declare
  v_org_id constant uuid := '10000000-0000-4000-8000-000000000001';
  v_actor_id constant uuid := '20000000-0000-4000-8000-000000000001';
  v_task_id constant uuid := '50000000-0000-4000-8000-000000000001';
  v_run_id constant uuid := '60000000-0000-4000-8000-000000000009';
  v_decision_id constant uuid := '70000000-0000-4000-8000-000000000009';
  v_renewal_decision_id constant uuid := '70000000-0000-4000-8000-000000000010';
  v_signed_id constant uuid := '80000000-0000-4000-8000-000000000009';
  v_receipt_id constant uuid := '90000000-0000-4000-8000-000000000009';
  v_payload_hash constant text := repeat('2', 64);
  v_approval_id constant text := 'APR-APPROVAL-EXPIRY-STALE';
  v_approved_at timestamptz := clock_timestamp() - interval '14 minutes 45 seconds';
  v_expires_at timestamptz;
  v_membership identity.organization_memberships%rowtype;
  v_role_assignment public.user_roles%rowtype;
  v_probe jsonb;
begin
  v_expires_at := v_approved_at + interval '15 minutes';

  select *
    into strict v_membership
  from identity.organization_memberships membership
  where membership.org_id = v_org_id
    and membership.user_id = v_actor_id
    and membership.status = 'active'
    and membership.offboarded_at is null
  order by membership.joined_at desc, membership.id
  limit 1;

  select role_assignment.*
    into strict v_role_assignment
  from public.user_roles role_assignment
  join public.roles role_definition
    on role_definition.id = role_assignment.role_id
  where role_assignment.org_id = v_org_id
    and role_assignment.user_id = v_actor_id
    and role_assignment.status = 'active'
    and role_assignment.revoked_at is null
    and role_definition.code = 'ADMIN'
  order by role_assignment.id
  limit 1;

  -- The shared fixture was created moments ago. Backdate only this synthetic
  -- membership's joined_at so the near-expiry approval is genuinely valid for
  -- the actor during its whole 15-minute immutable interval.
  update identity.organization_memberships membership
     set joined_at = least(
           coalesce(membership.joined_at, v_approved_at - interval '1 minute'),
           v_approved_at - interval '1 minute'
         ),
         updated_at = clock_timestamp()
   where membership.id = v_membership.id;

  insert into operations.executive_decisions (
    id, org_id, decision_key, decision_value, instruction, status,
    program_key, source_ref, processed_at, response_text, source_system,
    source_record_id, updated_at
  ) values (
    v_decision_id, v_org_id, v_approval_id, 'approved',
    'alegra_create_purchase_bill', 'Respondida', 'toro_alegra_writer_v3',
    v_payload_hash, v_approved_at, 'Synthetic near-expiry approval',
    'toro_control_plane', v_run_id::text, v_approved_at
  );

  insert into public.toro_execution_runs (
    id, org_id, task_id, decision_id, run_key, idempotency_key,
    correlation_id, actor_kind, actor_ref, action_key, target_system,
    execution_authority_level, business_risk, status, verification_status,
    attempt_count, max_attempts, fencing_token, safe_metadata
  ) values (
    v_run_id, v_org_id, v_task_id, v_decision_id,
    'alegra-l3-approval-expiry-renewal',
    'alegra-l3-approval-expiry-renewal',
    'alegra-l3-approval-expiry-renewal',
    'human', v_actor_id::text, 'alegra_create_purchase_bill', 'alegra',
    'L3', 'High', 'queued', 'pending', 0, 1, 0,
    jsonb_build_object('payloadHash', v_payload_hash)
  );

  insert into public.toro_alegra_l3_owner_approvals (
    id, org_id, run_id, task_id, decision_id, supersedes_approval_id,
    approval_id, actor_id, actor_membership_id, actor_membership_type,
    actor_role_assignment_id, actor_role_id, actor_role_code, actor_toro_role,
    action_key, target_system, payload_hash, approved_at, expires_at,
    decision_revision
  ) values (
    v_signed_id, v_org_id, v_run_id, v_task_id, v_decision_id, null,
    v_approval_id, v_actor_id, v_membership.id, v_membership.membership_type,
    v_role_assignment.id, v_role_assignment.role_id, 'ADMIN', 'FOUNDER',
    'alegra_create_purchase_bill', 'alegra', v_payload_hash, v_approved_at,
    v_expires_at, v_approved_at
  );

  -- The normal receipt guard validates the canonical decision/ledger binding
  -- and performs the only run metadata update used by the test.
  insert into public.toro_execution_receipts (
    id, org_id, run_id, task_id, decision_id, supersedes_receipt_id,
    receipt_type, status, action_key, target_system, actor_kind, actor_ref,
    execution_authority_level, business_risk, correlation_id,
    idempotency_key, desired_state, executed_state, verification_method,
    verification_status, evidence_refs, source_receipt_system,
    source_receipt_kind, source_receipt_ref, integrity_hash
  ) values (
    v_receipt_id, v_org_id, v_run_id, v_task_id, v_decision_id, null,
    'approval', 'verified', 'alegra_create_purchase_bill', 'alegra',
    'human', v_actor_id::text, 'L3', 'High',
    'alegra-l3-approval-expiry-renewal',
    'alegra-l3-approval-expiry-renewal:approval:' || v_decision_id::text,
    jsonb_build_object(
      'approvalId', v_approval_id,
      'actorId', v_actor_id::text,
      'payloadHash', v_payload_hash,
      'approvedAt', v_approved_at,
      'expiresAt', v_expires_at,
      'decisionRevision', v_approved_at,
      'canonicalApprovalId', v_signed_id::text
    ),
    jsonb_build_object('phase', 'owner_signed', 'providerEffect', false),
    'canonical_owner_decision_trigger', 'passed',
    jsonb_build_array(
      'toro-owner-approval:' || v_signed_id::text,
      'operations.executive_decisions:' || v_decision_id::text
    ),
    'toro_signed_owner_approval', 'owner_approval_v1', v_signed_id::text,
    v_payload_hash
  );

  -- Prove the synthetic chain is genuinely admissible before expiration. The
  -- deliberate exception rolls the probe's run transition and marker insert
  -- back as one PostgreSQL subtransaction, leaving the fixture pristine for
  -- the two-session wait-through-expiry test.
  begin
    v_probe := public.toro_admit_approved_alegra_execution_v1(
      v_org_id,
      v_run_id,
      'writer-near-expiry-validity-probe',
      0,
      v_receipt_id,
      v_approval_id,
      v_actor_id::text,
      v_approved_at,
      v_expires_at,
      v_payload_hash,
      v_approved_at::text,
      30
    );

    if v_probe is null then
      raise exception 'near_expiry_approval_not_admissible';
    end if;

    raise exception 'expected_near_expiry_probe_rollback';
  exception
    when others then
      if sqlerrm <> 'expected_near_expiry_probe_rollback' then
        raise;
      end if;
  end;

  insert into operations.executive_decisions (
    id, org_id, decision_key, instruction, status, program_key, source_ref,
    source_system, source_record_id
  ) values (
    v_renewal_decision_id, v_org_id, 'APR-APPROVAL-RENEWAL',
    'alegra_create_purchase_bill', 'pending', 'toro_alegra_writer_v3',
    v_payload_hash, 'toro_control_plane', v_run_id::text
  );

  insert into public.alegra_l3_test_context (
    label, run_id, decision_id, approval_receipt_id, approval_id, actor_id,
    approved_at, expires_at, decision_revision, payload_hash
  ) values (
    'approval_expiry_stale', v_run_id, v_decision_id, v_receipt_id,
    v_approval_id, v_actor_id::text, v_approved_at, v_expires_at,
    v_approved_at, v_payload_hash
  );

  if v_expires_at <= clock_timestamp() + interval '5 seconds' then
    raise exception 'near_expiry_fixture_setup_too_slow';
  end if;
end;
$$;

do $$
declare
  v_context public.alegra_l3_test_context%rowtype;
  v_result jsonb;
  v_label text;
  v_worker_id text;
  v_run public.toro_execution_runs%rowtype;
begin
  foreach v_label in array array[
    'finalization_wins',
    'recovery_wins',
    'heartbeat_waits_expiry'
  ] loop
    select *
      into strict v_context
    from public.alegra_l3_test_context
    where label = v_label;

    v_worker_id := 'writer-' || replace(v_label, '_', '-');

    v_result := public.toro_admit_approved_alegra_execution_v1(
      '10000000-0000-4000-8000-000000000001',
      v_context.run_id,
      v_worker_id,
      0,
      v_context.approval_receipt_id,
      v_context.approval_id,
      v_context.actor_id,
      v_context.approved_at,
      v_context.expires_at,
      v_context.payload_hash,
      v_context.decision_revision::text,
      30
    );

    if v_result is null
       or (v_result->>'runId')::uuid is distinct from v_context.run_id
       or (v_result->>'fencingToken')::bigint is distinct from 1
       or nullif(v_result->>'preparedReceiptId', '') is null then
      raise exception 'race_case_admission_failed:%:%', v_label, v_result;
    end if;

    update public.alegra_l3_test_context
       set prepared_receipt_id = (v_result->>'preparedReceiptId')::uuid,
           fencing_token = (v_result->>'fencingToken')::bigint
     where label = v_label;

    select *
      into strict v_run
    from public.toro_execution_runs
    where org_id = '10000000-0000-4000-8000-000000000001'
      and id = v_context.run_id;

    if v_run.status is distinct from 'running'
       or v_run.verification_status is distinct from 'pending'
       or v_run.fencing_token is distinct from 1
       or v_run.lease_owner is distinct from v_worker_id
       or v_run.lease_expires_at is null
       or v_run.lease_expires_at <= clock_timestamp()
       or v_run.safe_metadata->>'approvalBindingState' is distinct from 'admitted'
       or v_run.safe_metadata->>'preparedReceiptId'
            is distinct from v_result->>'preparedReceiptId' then
      raise exception 'race_case_admitted_state_invalid:%', v_label;
    end if;
  end loop;
end;
$$;
