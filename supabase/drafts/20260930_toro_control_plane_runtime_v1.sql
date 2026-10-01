-- DRAFT ONLY — NOT AUTHORIZED FOR PRODUCTION APPLY
-- TORO Control Plane Runtime v1
-- Date: 2026-09-30
--
-- Purpose:
--   Add the missing durable execution-attempt + receipt-envelope layer under
--   existing operations.tasks and TORO execution-selection views.
--
-- Does NOT:
--   replace operations.tasks;
--   replace operations.executive_decisions / toro_owner_attention_v1;
--   replace domain-specific receipts;
--   enable external autonomous writes;
--   grant anon/authenticated runtime access.
--
-- Requires existing:
--   public.organizations
--   operations.tasks
--   operations.executive_decisions
--
-- Initial posture:
--   server mediated; service_role only.

create table if not exists operations.execution_runs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  task_id uuid not null references operations.tasks(id),
  decision_id uuid null references operations.executive_decisions(id),
  parent_run_id uuid null references operations.execution_runs(id),

  run_key text not null,
  idempotency_key text not null,
  correlation_id text not null,
  trace_id text null,

  actor_kind text not null
    check (actor_kind in ('human','dot','agent','workflow','system','connector')),
  actor_ref text not null,
  dot_ref text null,
  agent_ref text null,

  action_key text not null,
  target_system text null,

  execution_authority_level text not null
    check (execution_authority_level in ('L0','L1','L2','L3','L4')),
  business_risk text not null
    check (business_risk in ('Low','Medium','High','Critical')),

  status text not null default 'queued'
    check (status in (
      'queued','claimed','running','verifying','succeeded','blocked',
      'failed','retry_wait','dead_letter','cancelled','superseded'
    )),
  verification_status text not null default 'pending'
    check (verification_status in (
      'not_required','pending','passed','failed','partial'
    )),

  priority_rank smallint not null default 100
    check (priority_rank between 0 and 1000),

  attempt_count integer not null default 0 check (attempt_count >= 0),
  max_attempts integer not null default 3 check (max_attempts between 1 and 10),

  lease_owner text null,
  fencing_token bigint not null default 0 check (fencing_token >= 0),
  lease_expires_at timestamptz null,
  available_at timestamptz not null default now(),

  started_at timestamptz null,
  verifying_at timestamptz null,
  finished_at timestamptz null,

  error_class text null,
  error_redacted text null,
  safe_metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (org_id, id),
  unique (org_id, run_key),
  unique (org_id, idempotency_key),

  check (
    execution_authority_level <> 'L4'
    or status in ('blocked','dead_letter','cancelled','superseded')
  ),
  check (
    status <> 'succeeded'
    or execution_authority_level = 'L0'
    or verification_status = 'passed'
  )
);

create index if not exists execution_runs_claim_idx
  on operations.execution_runs
  (org_id, status, available_at, lease_expires_at, priority_rank, created_at);

create index if not exists execution_runs_task_idx
  on operations.execution_runs (org_id, task_id, created_at desc);

create index if not exists execution_runs_correlation_idx
  on operations.execution_runs (org_id, correlation_id);

alter table operations.execution_runs enable row level security;

revoke all on operations.execution_runs from public;
revoke all on operations.execution_runs from anon;
revoke all on operations.execution_runs from authenticated;
grant select, insert, update on operations.execution_runs to service_role;

create table if not exists operations.execution_receipts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  run_id uuid not null references operations.execution_runs(id),
  task_id uuid not null references operations.tasks(id),
  decision_id uuid null references operations.executive_decisions(id),
  supersedes_receipt_id uuid null references operations.execution_receipts(id),

  receipt_type text not null
    check (receipt_type in (
      'observation','analysis','execution','verification','failure','approval'
    )),
  status text not null
    check (status in (
      'prepared','executed','verified','failed','denied','replayed','blocked'
    )),

  action_key text not null,
  target_system text null,
  external_reference text null,

  actor_kind text not null
    check (actor_kind in ('human','dot','agent','workflow','system','connector')),
  actor_ref text not null,
  dot_ref text null,
  agent_ref text null,

  execution_authority_level text not null
    check (execution_authority_level in ('L0','L1','L2','L3','L4')),
  business_risk text not null
    check (business_risk in ('Low','Medium','High','Critical')),

  correlation_id text not null,
  trace_id text null,
  idempotency_key text not null,

  desired_state jsonb null,
  observed_before jsonb null,
  executed_state jsonb null,
  observed_after jsonb null,

  verification_method text null,
  verification_status text not null default 'pending'
    check (verification_status in (
      'not_required','pending','passed','failed','partial'
    )),

  evidence_refs jsonb not null default '[]'::jsonb,

  source_receipt_system text null,
  source_receipt_kind text null,
  source_receipt_ref text null,

  integrity_hash text null,
  error_class text null,
  error_redacted text null,

  created_at timestamptz not null default now(),

  unique (org_id, id),
  unique (org_id, idempotency_key),
  check (
    status <> 'verified'
    or verification_status = 'passed'
  )
);

create index if not exists execution_receipts_run_idx
  on operations.execution_receipts (org_id, run_id, created_at desc);

create index if not exists execution_receipts_task_idx
  on operations.execution_receipts (org_id, task_id, created_at desc);

create index if not exists execution_receipts_correlation_idx
  on operations.execution_receipts (org_id, correlation_id, created_at desc);

alter table operations.execution_receipts enable row level security;

revoke all on operations.execution_receipts from public;
revoke all on operations.execution_receipts from anon;
revoke all on operations.execution_receipts from authenticated;
grant select, insert on operations.execution_receipts to service_role;

create or replace view operations.execution_run_queue_v1
with (security_invoker = true)
as
select
  r.id,
  r.org_id,
  r.task_id,
  r.run_key,
  r.idempotency_key,
  r.correlation_id,
  r.actor_kind,
  r.actor_ref,
  r.dot_ref,
  r.agent_ref,
  r.action_key,
  r.target_system,
  r.execution_authority_level,
  r.business_risk,
  r.status,
  r.priority_rank,
  r.attempt_count,
  r.max_attempts,
  r.available_at,
  r.lease_owner,
  r.fencing_token,
  r.lease_expires_at,
  r.created_at
from operations.execution_runs r
where r.status in ('queued','retry_wait')
  and r.execution_authority_level in ('L0','L1','L2')
  and r.available_at <= now()
  and (r.lease_expires_at is null or r.lease_expires_at <= now())
  and r.attempt_count < r.max_attempts
order by r.priority_rank asc, r.available_at asc, r.created_at asc;

revoke all on operations.execution_run_queue_v1 from public;
revoke all on operations.execution_run_queue_v1 from anon;
revoke all on operations.execution_run_queue_v1 from authenticated;
grant select on operations.execution_run_queue_v1 to service_role;

create or replace function operations.claim_execution_run_v1(
  p_org_id uuid,
  p_worker_id text,
  p_lease_seconds integer default 120
)
returns setof operations.execution_runs
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_run_id uuid;
begin
  if p_worker_id is null or btrim(p_worker_id) = '' then
    raise exception 'worker_id_required';
  end if;

  if p_lease_seconds < 30 or p_lease_seconds > 900 then
    raise exception 'lease_seconds_out_of_range';
  end if;

  select r.id
    into v_run_id
  from operations.execution_runs r
  where r.org_id = p_org_id
    and r.status in ('queued','retry_wait')
    and r.execution_authority_level in ('L0','L1','L2')
    and r.available_at <= now()
    and (r.lease_expires_at is null or r.lease_expires_at <= now())
    and r.attempt_count < r.max_attempts
  order by r.priority_rank asc, r.available_at asc, r.created_at asc
  for update skip locked
  limit 1;

  if v_run_id is null then
    return;
  end if;

  return query
  update operations.execution_runs r
     set status = 'claimed',
         lease_owner = p_worker_id,
         fencing_token = r.fencing_token + 1,
         lease_expires_at = now() + make_interval(secs => p_lease_seconds),
         attempt_count = r.attempt_count + 1,
         started_at = coalesce(r.started_at, now()),
         updated_at = now()
   where r.id = v_run_id
   returning r.*;
end;
$$;

revoke all on function operations.claim_execution_run_v1(uuid,text,integer)
  from public;
revoke all on function operations.claim_execution_run_v1(uuid,text,integer)
  from anon;
revoke all on function operations.claim_execution_run_v1(uuid,text,integer)
  from authenticated;
grant execute on function operations.claim_execution_run_v1(uuid,text,integer)
  to service_role;

create or replace function operations.renew_execution_lease_v1(
  p_run_id uuid,
  p_worker_id text,
  p_fencing_token bigint,
  p_lease_seconds integer default 120
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_updated integer;
begin
  if p_lease_seconds < 30 or p_lease_seconds > 900 then
    raise exception 'lease_seconds_out_of_range';
  end if;

  update operations.execution_runs r
     set lease_expires_at = now() + make_interval(secs => p_lease_seconds),
         updated_at = now()
   where r.id = p_run_id
     and r.lease_owner = p_worker_id
     and r.fencing_token = p_fencing_token
     and r.status in ('claimed','running','verifying')
     and r.lease_expires_at > now();

  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

revoke all on function operations.renew_execution_lease_v1(uuid,text,bigint,integer)
  from public;
revoke all on function operations.renew_execution_lease_v1(uuid,text,bigint,integer)
  from anon;
revoke all on function operations.renew_execution_lease_v1(uuid,text,bigint,integer)
  from authenticated;
grant execute on function operations.renew_execution_lease_v1(uuid,text,bigint,integer)
  to service_role;

create or replace function operations.transition_execution_run_v1(
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

  update operations.execution_runs r
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

revoke all on function operations.transition_execution_run_v1(uuid,text,bigint,text,text,text,text,text)
  from public;
revoke all on function operations.transition_execution_run_v1(uuid,text,bigint,text,text,text,text,text)
  from anon;
revoke all on function operations.transition_execution_run_v1(uuid,text,bigint,text,text,text,text,text)
  from authenticated;
grant execute on function operations.transition_execution_run_v1(uuid,text,bigint,text,text,text,text,text)
  to service_role;

create or replace function operations.resolve_failed_execution_run_v1(
  p_run_id uuid,
  p_fencing_token bigint,
  p_retry_at timestamptz default null
)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_attempt_count integer;
  v_max_attempts integer;
  v_next_status text;
begin
  select r.attempt_count, r.max_attempts
    into v_attempt_count, v_max_attempts
  from operations.execution_runs r
  where r.id = p_run_id
    and r.status = 'failed'
    and r.fencing_token = p_fencing_token
  for update;

  if not found then
    return null;
  end if;

  if v_attempt_count < v_max_attempts then
    v_next_status := 'retry_wait';
    update operations.execution_runs r
       set status = v_next_status,
           available_at = coalesce(p_retry_at, now()),
           updated_at = now()
     where r.id = p_run_id
       and r.status = 'failed'
       and r.fencing_token = p_fencing_token;
  else
    v_next_status := 'dead_letter';
    update operations.execution_runs r
       set status = v_next_status,
           finished_at = coalesce(r.finished_at, now()),
           updated_at = now()
     where r.id = p_run_id
       and r.status = 'failed'
       and r.fencing_token = p_fencing_token;
  end if;

  return v_next_status;
end;
$$;

revoke all on function operations.resolve_failed_execution_run_v1(uuid,bigint,timestamptz)
  from public;
revoke all on function operations.resolve_failed_execution_run_v1(uuid,bigint,timestamptz)
  from anon;
revoke all on function operations.resolve_failed_execution_run_v1(uuid,bigint,timestamptz)
  from authenticated;
grant execute on function operations.resolve_failed_execution_run_v1(uuid,bigint,timestamptz)
  to service_role;

create or replace function operations.prevent_execution_receipt_mutation_v1()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception 'execution_receipts_are_append_only';
end;
$$;

drop trigger if exists execution_receipts_append_only
  on operations.execution_receipts;

create trigger execution_receipts_append_only
before update or delete on operations.execution_receipts
for each row execute function operations.prevent_execution_receipt_mutation_v1();

comment on table operations.execution_runs is
  'TORO durable execution-attempt envelope below operations.tasks. Server-mediated; leases coordinate workers but do not grant business authority.';

comment on table operations.execution_receipts is
  'Append-only TORO canonical receipt envelope. Domain-specific receipts remain authoritative detail and may be referenced here.';
