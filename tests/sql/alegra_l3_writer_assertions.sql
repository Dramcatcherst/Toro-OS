\set ON_ERROR_STOP on

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

do $$
declare
  v_signature regprocedure;
  v_security_definer boolean;
begin
  for v_signature, v_security_definer in
    select expected.function_oid, expected.security_definer
    from (values
      ('public.toro_prevent_alegra_l3_owner_approval_mutation_v1()'::regprocedure, false),
      ('public.toro_capture_alegra_l3_owner_approval_v1()'::regprocedure, true),
      ('public.toro_guard_alegra_l3_approval_receipt_v1()'::regprocedure, true),
      ('public.toro_guard_alegra_l3_run_admission_v1()'::regprocedure, true),
      ('public.toro_revoke_alegra_execution_authority_v1(uuid,uuid,uuid)'::regprocedure, true),
      ('public.toro_admit_approved_alegra_execution_v1(uuid,uuid,text,bigint,uuid,text,text,timestamptz,timestamptz,text,text,integer)'::regprocedure, true),
      ('public.toro_finalize_alegra_execution_v1(uuid,uuid,text,bigint,uuid,text,jsonb)'::regprocedure, true),
      ('public.toro_heartbeat_alegra_execution_v1(uuid,uuid,text,bigint,uuid,integer)'::regprocedure, true),
      ('public.toro_recover_expired_alegra_execution_v1(uuid,uuid,text,bigint,uuid)'::regprocedure, true)
    ) expected(function_oid, security_definer)
  loop
    if has_function_privilege('public', v_signature, 'EXECUTE')
       or has_function_privilege('anon', v_signature, 'EXECUTE')
       or has_function_privilege('authenticated', v_signature, 'EXECUTE')
       or has_function_privilege('service_role', v_signature, 'EXECUTE')
       or not exists (
         select 1
         from pg_catalog.pg_proc function_row
         where function_row.oid = v_signature
           and function_row.prosecdef = v_security_definer
           and pg_catalog.pg_get_userbyid(function_row.proowner) = 'postgres'
           and coalesce(function_row.proconfig, '{}'::text[])
                 @> array['search_path=""']::text[]
           and (
             select count(*) = 1
               and pg_catalog.bool_and(
                 privilege.grantee = function_row.proowner
                 and privilege.privilege_type = 'EXECUTE'
                 and privilege.grantor = function_row.proowner
                 and not privilege.is_grantable
               )
             from pg_catalog.aclexplode(
               coalesce(
                 function_row.proacl,
                 pg_catalog.acldefault('f', function_row.proowner)
               )
             ) privilege
           )
       ) then
      raise exception 'alegra_l3_runtime_acl_broadened:%', v_signature;
    end if;
  end loop;

  if has_table_privilege(
       'service_role',
       'public.toro_alegra_l3_owner_approvals',
       'SELECT,INSERT,UPDATE,DELETE'
     ) then
    raise exception 'alegra_l3_ledger_service_role_accessible';
  end if;
end;
$$;

insert into operations.tasks (id, org_id, status, source_system, source_record_id)
values (
  '50000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  'in_progress',
  'postgres17_fixture',
  'alegra-l3-writer'
);

create table public.alegra_l3_test_context (
  label text primary key,
  run_id uuid not null,
  decision_id uuid not null,
  approval_receipt_id uuid not null,
  approval_id text not null,
  actor_id text not null,
  approved_at timestamptz not null,
  expires_at timestamptz not null,
  decision_revision timestamptz not null,
  payload_hash text not null,
  prepared_receipt_id uuid null,
  fencing_token bigint null
);

create or replace function public.test_sign_alegra_l3_case(
  p_label text,
  p_run_id uuid,
  p_decision_id uuid,
  p_payload_hash text
)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_run public.toro_execution_runs%rowtype;
begin
  insert into operations.executive_decisions (
    id, org_id, decision_key, instruction, status, program_key, source_ref,
    source_system, source_record_id
  ) values (
    p_decision_id,
    '10000000-0000-4000-8000-000000000001',
    'APR-' || upper(p_label),
    'alegra_create_purchase_bill',
    'pending',
    'toro_alegra_writer_v3',
    p_payload_hash,
    'toro_control_plane',
    p_run_id::text
  );

  insert into public.toro_execution_runs (
    id, org_id, task_id, decision_id, run_key, idempotency_key,
    correlation_id, actor_kind, actor_ref, action_key, target_system,
    execution_authority_level, business_risk, status, verification_status,
    attempt_count, max_attempts, fencing_token, safe_metadata
  ) values (
    p_run_id,
    '10000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000001',
    p_decision_id,
    'alegra-l3-' || p_label,
    'alegra-l3-' || p_label,
    'alegra-l3-' || p_label,
    'human',
    '20000000-0000-4000-8000-000000000001',
    'alegra_create_purchase_bill',
    'alegra',
    'L3',
    'High',
    'queued',
    'pending',
    0,
    1,
    0,
    jsonb_build_object('payloadHash', p_payload_hash)
  );

  perform public.resolve_toro_decision(
    p_decision_id,
    'approve',
    'PostgreSQL 17 disposable validation',
    null
  );

  select *
    into v_run
  from public.toro_execution_runs
  where id = p_run_id;

  if v_run.status is distinct from 'queued'
     or v_run.safe_metadata->>'approvalBindingState' is distinct from 'approved'
     or nullif(v_run.safe_metadata->>'approvalReceiptId', '') is null
     or nullif(v_run.safe_metadata->>'canonicalApprovalId', '') is null then
    raise exception 'alegra_l3_signing_binding_failed:%', p_label;
  end if;

  insert into public.alegra_l3_test_context (
    label, run_id, decision_id, approval_receipt_id, approval_id, actor_id,
    approved_at, expires_at, decision_revision, payload_hash
  ) values (
    p_label,
    p_run_id,
    p_decision_id,
    (v_run.safe_metadata->>'approvalReceiptId')::uuid,
    v_run.safe_metadata->>'approvalId',
    v_run.safe_metadata->>'approvalActorId',
    (v_run.safe_metadata->>'approvalApprovedAt')::timestamptz,
    (v_run.safe_metadata->>'approvalExpiresAt')::timestamptz,
    (v_run.safe_metadata->>'decisionRevision')::timestamptz,
    p_payload_hash
  );
end;
$$;

select public.test_sign_alegra_l3_case(
  'happy',
  '60000000-0000-4000-8000-000000000001',
  '70000000-0000-4000-8000-000000000001',
  repeat('a', 64)
);

select public.test_sign_alegra_l3_case(
  'revoked',
  '60000000-0000-4000-8000-000000000002',
  '70000000-0000-4000-8000-000000000002',
  repeat('b', 64)
);

select public.test_sign_alegra_l3_case(
  'recovery',
  '60000000-0000-4000-8000-000000000003',
  '70000000-0000-4000-8000-000000000003',
  repeat('c', 64)
);

select public.test_sign_alegra_l3_case(
  'admit_wins',
  '60000000-0000-4000-8000-000000000004',
  '70000000-0000-4000-8000-000000000004',
  repeat('d', 64)
);

select public.test_sign_alegra_l3_case(
  'revoke_wins',
  '60000000-0000-4000-8000-000000000005',
  '70000000-0000-4000-8000-000000000005',
  repeat('e', 64)
);

do $$
declare
  v_context public.alegra_l3_test_context%rowtype;
  v_result jsonb;
  v_replay jsonb;
  v_prepared_receipt_id uuid;
  v_fencing_token bigint;
  v_claim_count integer;
  v_revocation text;
begin
  select count(*)
    into v_claim_count
  from public.toro_claim_execution_run_by_id_v1(
    '10000000-0000-4000-8000-000000000001',
    '60000000-0000-4000-8000-000000000001',
    'generic-worker',
    120
  );

  if v_claim_count <> 0 then
    raise exception 'generic_claim_accepted_l3';
  end if;

  select * into v_context
  from public.alegra_l3_test_context
  where label = 'happy';

  v_result := public.toro_admit_approved_alegra_execution_v1(
    '10000000-0000-4000-8000-000000000001',
    v_context.run_id,
    'writer-happy',
    0,
    v_context.approval_receipt_id,
    v_context.approval_id,
    v_context.actor_id,
    v_context.approved_at,
    v_context.expires_at,
    v_context.payload_hash,
    v_context.decision_revision::text,
    120
  );

  if v_result is null or (v_result->>'fencingToken')::bigint <> 1 then
    raise exception 'happy_admission_failed';
  end if;

  v_prepared_receipt_id := (v_result->>'preparedReceiptId')::uuid;
  v_fencing_token := (v_result->>'fencingToken')::bigint;

  update public.alegra_l3_test_context
  set prepared_receipt_id = v_prepared_receipt_id,
      fencing_token = v_fencing_token
  where label = 'happy';

  if public.toro_transition_execution_run_v1(
       v_context.run_id,
       'writer-happy',
       v_fencing_token,
       'running',
       'verifying',
       'pending',
       null,
       null
     ) then
    raise exception 'generic_transition_accepted_l3';
  end if;

  if public.toro_heartbeat_alegra_execution_v1(
       '10000000-0000-4000-8000-000000000001',
       v_context.run_id,
       'writer-happy',
       v_fencing_token,
       v_prepared_receipt_id,
       60
     ) is null then
    raise exception 'happy_heartbeat_failed';
  end if;

  v_result := public.toro_finalize_alegra_execution_v1(
    '10000000-0000-4000-8000-000000000001',
    v_context.run_id,
    'writer-happy',
    v_fencing_token,
    v_prepared_receipt_id,
    'verified',
    jsonb_build_object(
      'external_reference', 'TEST-NATIVE-HAPPY',
      'integrity_hash', v_context.payload_hash,
      'observed_after', jsonb_build_object(
        'version', 'TORO-ALEGRA-WRITER-RECEIPT-v1',
        'idempotencyKey', 'alegra-l3-happy',
        'payloadHash', v_context.payload_hash,
        'approvalId', v_context.approval_id,
        'actorId', v_context.actor_id,
        'nativeId', 'TEST-NATIVE-HAPPY',
        'executionState', 'provider_created',
        'verificationState', 'VERIFIED',
        'verified', true,
        'reasons', '[]'::jsonb
      ),
      'evidence_refs', jsonb_build_array('postgres17:happy')
    )
  );

  if v_result->>'runStatus' is distinct from 'succeeded'
     or (v_result->>'replayed')::boolean then
    raise exception 'happy_finalization_failed';
  end if;

  v_replay := public.toro_finalize_alegra_execution_v1(
    '10000000-0000-4000-8000-000000000001',
    v_context.run_id,
    'writer-happy',
    1,
    (select prepared_receipt_id from public.alegra_l3_test_context where label='happy'),
    'verified',
    jsonb_build_object(
      'external_reference', 'TEST-NATIVE-HAPPY',
      'integrity_hash', v_context.payload_hash,
      'observed_after', jsonb_build_object(
        'version', 'TORO-ALEGRA-WRITER-RECEIPT-v1',
        'idempotencyKey', 'alegra-l3-happy',
        'payloadHash', v_context.payload_hash,
        'approvalId', v_context.approval_id,
        'actorId', v_context.actor_id,
        'nativeId', 'TEST-NATIVE-HAPPY',
        'executionState', 'provider_created',
        'verificationState', 'VERIFIED',
        'verified', true,
        'reasons', '[]'::jsonb
      ),
      'evidence_refs', jsonb_build_array('postgres17:happy')
    )
  );

  if v_replay is null or not (v_replay->>'replayed')::boolean then
    raise exception 'happy_finalization_replay_failed';
  end if;

  select * into v_context
  from public.alegra_l3_test_context
  where label = 'revoked';

  begin
    update public.toro_execution_runs
       set safe_metadata = safe_metadata ||
           jsonb_build_object('unauthorizedTestMutation', true),
           updated_at = clock_timestamp()
     where id = v_context.run_id;
    raise exception 'queued_metadata_mutation_was_allowed';
  exception
    when others then
      if sqlerrm <> 'alegra_l3_approval_binding_update_invalid' then
        raise;
      end if;
  end;

  v_revocation := public.toro_revoke_alegra_execution_authority_v1(
    '10000000-0000-4000-8000-000000000001',
    v_context.run_id,
    v_context.approval_receipt_id
  );

  if v_revocation is distinct from 'revoked' then
    raise exception 'revocation_failed:%', v_revocation;
  end if;

  if public.toro_revoke_alegra_execution_authority_v1(
       '10000000-0000-4000-8000-000000000001',
       v_context.run_id,
       v_context.approval_receipt_id
     ) is distinct from 'already_revoked' then
    raise exception 'revocation_replay_failed';
  end if;

  if public.toro_admit_approved_alegra_execution_v1(
       '10000000-0000-4000-8000-000000000001',
       v_context.run_id,
       'writer-revoked',
       1,
       v_context.approval_receipt_id,
       v_context.approval_id,
       v_context.actor_id,
       v_context.approved_at,
       v_context.expires_at,
       v_context.payload_hash,
       v_context.decision_revision::text,
       60
     ) is not null then
    raise exception 'revoked_run_was_admitted';
  end if;

  select * into v_context
  from public.alegra_l3_test_context
  where label = 'recovery';

  v_result := public.toro_admit_approved_alegra_execution_v1(
    '10000000-0000-4000-8000-000000000001',
    v_context.run_id,
    'writer-recovery',
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

  if v_result is null then
    raise exception 'recovery_case_admission_failed';
  end if;

  update public.alegra_l3_test_context
  set prepared_receipt_id = (v_result->>'preparedReceiptId')::uuid,
      fencing_token = (v_result->>'fencingToken')::bigint
  where label = 'recovery';
end;
$$;
