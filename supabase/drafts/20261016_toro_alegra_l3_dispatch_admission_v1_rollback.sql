-- DRAFT ONLY — rollback for TORO Alegra L3 dispatch admission v1

begin;

-- Run only after the Writer and every L3 producer have been stopped. The
-- exclusive locks close the check/drop race: no new run or approval receipt
-- can appear between the zero-active check and removal of the guards.
lock table public.toro_execution_runs in access exclusive mode;
lock table public.toro_execution_receipts in access exclusive mode;
lock table public.toro_alegra_l3_owner_approvals in access exclusive mode;

-- The forward stores each exact post-forward pg_get_functiondef hash in the
-- function comment. CREATE OR REPLACE preserves comments, so any subsequent
-- migration changes the live hash while leaving the expected hash untouched.
-- Abort before removing any object rather than overwrite that newer state.
do $$
declare
  v_function regprocedure;
  v_comment text;
  v_expected_md5 text;
begin
  foreach v_function in array array[
    to_regprocedure('public.toro_transition_execution_run_v1(uuid,text,bigint,text,text,text,text,text)'),
    to_regprocedure('public.toro_complete_execution_run_v1(uuid,text,bigint,jsonb)')
  ] loop
    if v_function is null or not exists (
      select 1
      from pg_catalog.pg_proc function_row
      where function_row.oid = v_function
        and not function_row.prosecdef
        and pg_catalog.pg_get_userbyid(function_row.proowner) = 'postgres'
        and coalesce(function_row.proconfig, '{}'::text[])
              @> array['search_path=""']::text[]
        and pg_catalog.has_function_privilege('service_role', function_row.oid, 'EXECUTE')
        and not pg_catalog.has_function_privilege('public', function_row.oid, 'EXECUTE')
        and not pg_catalog.has_function_privilege('anon', function_row.oid, 'EXECUTE')
        and not pg_catalog.has_function_privilege('authenticated', function_row.oid, 'EXECUTE')
        and (
          select count(*) = 2
            and count(*) filter (
              where privilege.grantee = function_row.proowner
            ) = 1
            and count(*) filter (
              where privilege.grantee = (
                select role.oid
                from pg_catalog.pg_roles role
                where role.rolname = 'service_role'
              )
            ) = 1
            and pg_catalog.bool_and(
              privilege.privilege_type = 'EXECUTE'
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
      raise exception 'alegra_l3_rollback_generic_rpc_security_drifted';
    end if;

    v_comment := pg_catalog.obj_description(v_function, 'pg_proc');
    v_expected_md5 := substring(
      coalesce(v_comment, '')
      from 'TORO_ALEGRA_L3_V1_ROLLBACK_MD5=([0-9a-f]{32})$'
    );

    if v_expected_md5 is null
       or md5(pg_catalog.pg_get_functiondef(v_function)) <> v_expected_md5 then
      raise exception 'alegra_l3_rollback_generic_rpc_body_drifted';
    end if;
  end loop;
end;
$$;

-- Fail closed: removing the admission/revocation boundary while an approval is
-- live or a provider execution is in flight would strand or later revive L3
-- authority. Revoke/cancel it explicitly and verify zero rows before rollback.
do $$
begin
  if exists (
    select 1
    from public.toro_execution_runs r
    where r.target_system = 'alegra'
      and r.action_key = 'alegra_create_purchase_bill'
      and r.execution_authority_level = 'L3'
      and (
        r.status in ('running', 'verifying')
        or r.safe_metadata->>'approvalBindingState' in ('approved', 'admitted')
      )
  ) then
    raise exception 'alegra_l3_rollback_blocked_active_authority_or_execution';
  end if;
end;
$$;

drop trigger if exists toro_capture_alegra_l3_owner_approval
  on operations.executive_decisions;

drop trigger if exists toro_guard_alegra_l3_run_admission
  on public.toro_execution_runs;

drop trigger if exists toro_guard_alegra_l3_approval_receipt
  on public.toro_execution_receipts;

drop function if exists public.toro_recover_expired_alegra_execution_v1(
  uuid,uuid,text,bigint,uuid
);

drop function if exists public.toro_heartbeat_alegra_execution_v1(
  uuid,uuid,text,bigint,uuid,integer
);

drop function if exists public.toro_finalize_alegra_execution_v1(
  uuid,uuid,text,bigint,uuid,text,jsonb
);

drop function if exists public.toro_admit_approved_alegra_execution_v1(
  uuid,uuid,text,bigint,uuid,text,text,timestamptz,timestamptz,text,text,integer
);

drop function if exists public.toro_revoke_alegra_execution_authority_v1(
  uuid,uuid,uuid
);

drop function if exists public.toro_revoke_alegra_execution_authority_v1(
  uuid,uuid,uuid,text
);

drop function if exists public.toro_guard_alegra_l3_run_admission_v1();
drop function if exists public.toro_guard_alegra_l3_approval_receipt_v1();
drop function if exists public.toro_capture_alegra_l3_owner_approval_v1();

-- Restore the exact generic worker behavior that this draft narrowed. Function
-- privileges are preserved by CREATE OR REPLACE; this rollback grants nothing.
create or replace function public.toro_transition_execution_run_v1(
  p_run_id uuid,
  p_worker_id text,
  p_fencing_token bigint,
  p_expected_status text,
  p_next_status text,
  p_verification_status text default null,
  p_error_class text default null,
  p_error_redacted text default null
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_updated integer;
  v_transition_allowed boolean := false;
begin
  v_transition_allowed :=
    (p_expected_status = 'claimed' and p_next_status in ('running','blocked','failed','cancelled'))
    or (p_expected_status = 'running' and p_next_status in ('verifying','blocked','failed','cancelled'))
    or (p_expected_status = 'verifying' and p_next_status in ('succeeded','blocked','failed','cancelled'));

  if not v_transition_allowed then
    raise exception 'invalid_execution_transition';
  end if;

  update public.toro_execution_runs r
     set status = p_next_status,
         verification_status = coalesce(p_verification_status, r.verification_status),
         verifying_at = case
           when p_next_status = 'verifying' then coalesce(r.verifying_at, now())
           else r.verifying_at
         end,
         finished_at = case
           when p_next_status in ('succeeded','blocked','cancelled')
             then coalesce(r.finished_at, now())
           else r.finished_at
         end,
         error_class = p_error_class,
         error_redacted = p_error_redacted,
         lease_owner = case
           when p_next_status in ('succeeded','blocked','failed','cancelled')
             then null
           else r.lease_owner
         end,
         lease_expires_at = case
           when p_next_status in ('succeeded','blocked','failed','cancelled')
             then null
           else r.lease_expires_at
         end,
         updated_at = now()
   where r.id = p_run_id
     and r.lease_owner = p_worker_id
     and r.fencing_token = p_fencing_token
     and r.status = p_expected_status
     and r.lease_expires_at > now();

  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

create or replace function public.toro_complete_execution_run_v1(
  p_run_id uuid,
  p_worker_id text,
  p_fencing_token bigint,
  p_receipt jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_run public.toro_execution_runs%rowtype;
  v_receipt_id uuid;
  v_evidence_refs jsonb;
begin
  select *
    into v_run
  from public.toro_execution_runs r
  where r.id = p_run_id
    and r.status = 'verifying'
    and r.lease_owner = p_worker_id
    and r.fencing_token = p_fencing_token
    and r.lease_expires_at > now()
  for update;

  if not found then
    return null;
  end if;

  if v_run.execution_authority_level = 'L4' then
    raise exception 'prohibited_execution_authority';
  end if;

  if jsonb_typeof(coalesce(p_receipt->'evidence_refs','[]'::jsonb)) <> 'array' then
    raise exception 'evidence_refs_must_be_array';
  end if;

  v_evidence_refs := coalesce(p_receipt->'evidence_refs','[]'::jsonb);

  insert into public.toro_execution_receipts (
    org_id,
    run_id,
    task_id,
    decision_id,
    receipt_type,
    status,
    action_key,
    target_system,
    external_reference,
    actor_kind,
    actor_ref,
    dot_ref,
    agent_ref,
    execution_authority_level,
    business_risk,
    correlation_id,
    trace_id,
    idempotency_key,
    desired_state,
    observed_before,
    executed_state,
    observed_after,
    verification_method,
    verification_status,
    evidence_refs,
    source_receipt_system,
    source_receipt_kind,
    source_receipt_ref,
    integrity_hash,
    error_class,
    error_redacted
  ) values (
    v_run.org_id,
    v_run.id,
    v_run.task_id,
    v_run.decision_id,
    'verification',
    'verified',
    v_run.action_key,
    v_run.target_system,
    nullif(p_receipt->>'external_reference',''),
    v_run.actor_kind,
    v_run.actor_ref,
    v_run.dot_ref,
    v_run.agent_ref,
    v_run.execution_authority_level,
    v_run.business_risk,
    v_run.correlation_id,
    v_run.trace_id,
    v_run.idempotency_key || ':verification',
    p_receipt->'desired_state',
    p_receipt->'observed_before',
    p_receipt->'executed_state',
    p_receipt->'observed_after',
    nullif(p_receipt->>'verification_method',''),
    'passed',
    v_evidence_refs,
    nullif(p_receipt->>'source_receipt_system',''),
    nullif(p_receipt->>'source_receipt_kind',''),
    nullif(p_receipt->>'source_receipt_ref',''),
    nullif(p_receipt->>'integrity_hash',''),
    null,
    null
  )
  returning id into v_receipt_id;

  update public.toro_execution_runs r
     set status = 'succeeded',
         verification_status = 'passed',
         finished_at = coalesce(r.finished_at, now()),
         lease_owner = null,
         lease_expires_at = null,
         error_class = null,
         error_redacted = null,
         updated_at = now()
   where r.id = v_run.id
     and r.status = 'verifying'
     and r.lease_owner = p_worker_id
     and r.fencing_token = p_fencing_token;

  if not found then
    raise exception 'completion_state_changed';
  end if;

  return v_receipt_id;
end;
$$;

comment on function public.toro_transition_execution_run_v1(uuid,text,bigint,text,text,text,text,text) is null;
comment on function public.toro_complete_execution_run_v1(uuid,text,bigint,jsonb) is null;

-- Intentionally retain the immutable owner-approval ledger, its RLS/ACL,
-- index, trigger, and trigger function as historical accounting evidence.
-- The forward migration validates the full retained contract before reapply.

commit;
