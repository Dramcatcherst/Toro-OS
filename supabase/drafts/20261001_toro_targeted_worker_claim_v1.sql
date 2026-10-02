-- DRAFT ONLY — NOT AUTHORIZED FOR PRODUCTION APPLY
-- TORO targeted worker claim + atomic verified completion v1
-- Date: 2026-10-01
--
-- Adds no new business authority. These RPCs are service-role-only,
-- SECURITY INVOKER, and operate only on the existing Control Plane tables.

create or replace function public.toro_claim_execution_run_by_id_v1(
  p_org_id uuid,
  p_run_id uuid,
  p_worker_id text,
  p_lease_seconds integer default 120
)
returns setof public.toro_execution_runs
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if p_worker_id is null or btrim(p_worker_id) = '' then
    raise exception 'worker_id_required';
  end if;

  if p_lease_seconds < 30 or p_lease_seconds > 900 then
    raise exception 'lease_seconds_out_of_range';
  end if;

  return query
  update public.toro_execution_runs r
     set status = 'claimed',
         lease_owner = p_worker_id,
         fencing_token = r.fencing_token + 1,
         lease_expires_at = now() + make_interval(secs => p_lease_seconds),
         attempt_count = r.attempt_count + 1,
         started_at = coalesce(r.started_at, now()),
         updated_at = now()
   where r.org_id = p_org_id
     and r.id = p_run_id
     and r.status in ('queued','retry_wait')
     and r.execution_authority_level in ('L0','L1','L2')
     and r.available_at <= now()
     and (r.lease_expires_at is null or r.lease_expires_at <= now())
     and r.attempt_count < r.max_attempts
   returning r.*;
end;
$$;

revoke all on function public.toro_claim_execution_run_by_id_v1(uuid,uuid,text,integer)
  from public;
revoke all on function public.toro_claim_execution_run_by_id_v1(uuid,uuid,text,integer)
  from anon;
revoke all on function public.toro_claim_execution_run_by_id_v1(uuid,uuid,text,integer)
  from authenticated;
revoke all on function public.toro_claim_execution_run_by_id_v1(uuid,uuid,text,integer)
  from service_role;
grant execute on function public.toro_claim_execution_run_by_id_v1(uuid,uuid,text,integer)
  to service_role;

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

revoke all on function public.toro_complete_execution_run_v1(uuid,text,bigint,jsonb)
  from public;
revoke all on function public.toro_complete_execution_run_v1(uuid,text,bigint,jsonb)
  from anon;
revoke all on function public.toro_complete_execution_run_v1(uuid,text,bigint,jsonb)
  from authenticated;
revoke all on function public.toro_complete_execution_run_v1(uuid,text,bigint,jsonb)
  from service_role;
grant execute on function public.toro_complete_execution_run_v1(uuid,text,bigint,jsonb)
  to service_role;
