#!/usr/bin/env bash
set -Eeuo pipefail

# PostgreSQL-only concurrency proof for the draft Alegra L3 boundary.
# Every identifier and receipt below is synthetic. This script never contacts
# Supabase, Alegra, or any other external system.

: "${DATABASE_URL:?DATABASE_URL is required}"

readonly ADMIT_APP="alegra_l3_test_admit_winner"
readonly REVOKE_APP="alegra_l3_test_revoke_winner"

cleanup_background_sessions() {
  local pid
  while read -r pid; do
    if [[ -n "${pid}" ]]; then
      kill "${pid}" 2>/dev/null || true
    fi
  done < <(jobs -pr)
}

trap cleanup_background_sessions EXIT

psql_test() {
  psql "${DATABASE_URL}" -X -qAt -v ON_ERROR_STOP=1 "$@"
}

wait_until_session_sleeps() {
  local application_name="$1"
  local pid="$2"
  local sleeping

  for _ in $(seq 1 100); do
    if ! kill -0 "${pid}" 2>/dev/null; then
      if wait "${pid}"; then
        echo "${application_name} exited before reaching its lock-hold barrier" >&2
      else
        echo "${application_name} failed before reaching its lock-hold barrier" >&2
      fi
      return 1
    fi

    sleeping="$({
      psql_test -c "
        select exists (
          select 1
          from pg_catalog.pg_stat_activity
          where application_name = '${application_name}'
            and state = 'active'
            and wait_event_type = 'Timeout'
            and query like '%pg_sleep%'
        );
      "
    } 2>/dev/null || true)"

    if [[ "${sleeping}" == "t" ]]; then
      return 0
    fi

    sleep 0.1
  done

  echo "Timed out waiting for ${application_name} to hold the run lock" >&2
  return 1
}

run_admit_winner() {
  PGAPPNAME="${ADMIT_APP}" psql_test <<'SQL'
set statement_timeout = '20s';
begin;
select public.toro_admit_approved_alegra_execution_v1(
  '10000000-0000-4000-8000-000000000001',
  test_case.run_id,
  'writer-admit-wins',
  0,
  test_case.approval_receipt_id,
  test_case.approval_id,
  test_case.actor_id,
  test_case.approved_at,
  test_case.expires_at,
  test_case.payload_hash,
  test_case.decision_revision::text,
  120
)
from public.alegra_l3_test_context test_case
where test_case.label = 'admit_wins';
select pg_sleep(3);
commit;
SQL
}

run_revoke_winner() {
  PGAPPNAME="${REVOKE_APP}" psql_test <<'SQL'
set statement_timeout = '20s';
set request.jwt.claim.sub = '20000000-0000-4000-8000-000000000001';
set request.jwt.claim.role = 'authenticated';
set request.jwt.claims = '{"app_metadata":{"toro_role":"FOUNDER"}}';
begin;
select public.toro_revoke_alegra_execution_authority_v1(
  '10000000-0000-4000-8000-000000000001',
  test_case.run_id,
  test_case.approval_receipt_id
)
from public.alegra_l3_test_context test_case
where test_case.label = 'revoke_wins';
select pg_sleep(3);
commit;
SQL
}

echo "Testing admit-wins serialization in two PostgreSQL sessions"
run_admit_winner >/dev/null &
admit_pid=$!
wait_until_session_sleeps "${ADMIT_APP}" "${admit_pid}"

admit_wins_revocation="$({
  psql_test <<'SQL'
set statement_timeout = '20s';
set request.jwt.claim.sub = '20000000-0000-4000-8000-000000000001';
set request.jwt.claim.role = 'authenticated';
set request.jwt.claims = '{"app_metadata":{"toro_role":"FOUNDER"}}';
select public.toro_revoke_alegra_execution_authority_v1(
  '10000000-0000-4000-8000-000000000001',
  test_case.run_id,
  test_case.approval_receipt_id
)
from public.alegra_l3_test_context test_case
where test_case.label = 'admit_wins';
SQL
})"

wait "${admit_pid}"

if [[ "${admit_wins_revocation}" != "dispatch_already_admitted" ]]; then
  echo "Expected dispatch_already_admitted, got: ${admit_wins_revocation}" >&2
  exit 1
fi

psql_test <<'SQL'
do $$
declare
  v_context public.alegra_l3_test_context%rowtype;
  v_run public.toro_execution_runs%rowtype;
  v_result jsonb;
  v_prepared_count integer;
  v_denied_count integer;
  v_final_count integer;
begin
  select *
    into v_context
  from public.alegra_l3_test_context
  where label = 'admit_wins';

  select *
    into v_run
  from public.toro_execution_runs
  where org_id = '10000000-0000-4000-8000-000000000001'
    and id = v_context.run_id;

  if v_run.status is distinct from 'running'
     or v_run.verification_status is distinct from 'pending'
     or v_run.lease_owner is distinct from 'writer-admit-wins'
     or v_run.fencing_token <> 1
     or v_run.safe_metadata->>'approvalBindingState' is distinct from 'admitted'
     or nullif(v_run.safe_metadata->>'preparedReceiptId', '') is null then
    raise exception 'admit_wins_run_state_invalid';
  end if;

  select count(*)
    into v_prepared_count
  from public.toro_execution_receipts receipt
  where receipt.org_id = v_run.org_id
    and receipt.run_id = v_run.id
    and receipt.receipt_type = 'execution'
    and receipt.status = 'prepared';

  select count(*)
    into v_denied_count
  from public.toro_execution_receipts receipt
  where receipt.org_id = v_run.org_id
    and receipt.run_id = v_run.id
    and receipt.receipt_type = 'approval'
    and receipt.status = 'denied';

  if v_prepared_count <> 1 or v_denied_count <> 0 then
    raise exception 'admit_wins_receipt_cardinality_invalid:%:%',
      v_prepared_count,
      v_denied_count;
  end if;

  update public.alegra_l3_test_context
     set prepared_receipt_id = (v_run.safe_metadata->>'preparedReceiptId')::uuid,
         fencing_token = v_run.fencing_token
   where label = 'admit_wins';

  v_result := public.toro_finalize_alegra_execution_v1(
    v_run.org_id,
    v_run.id,
    'writer-admit-wins',
    v_run.fencing_token,
    (v_run.safe_metadata->>'preparedReceiptId')::uuid,
    'verified',
    jsonb_build_object(
      'external_reference', 'SYNTHETIC-NATIVE-ADMIT-WINS',
      'integrity_hash', v_context.payload_hash,
      'observed_after', jsonb_build_object(
        'version', 'TORO-ALEGRA-WRITER-RECEIPT-v1',
        'idempotencyKey', 'alegra-l3-admit_wins',
        'payloadHash', v_context.payload_hash,
        'approvalId', v_context.approval_id,
        'actorId', v_context.actor_id,
        'nativeId', 'SYNTHETIC-NATIVE-ADMIT-WINS',
        'executionState', 'provider_created',
        'verificationState', 'VERIFIED',
        'verified', true,
        'reasons', '[]'::jsonb
      ),
      'evidence_refs', jsonb_build_array(
        'postgres17:synthetic:concurrency:admit-wins'
      )
    )
  );

  if v_result is null
     or v_result->>'runStatus' is distinct from 'succeeded'
     or v_result->>'verificationStatus' is distinct from 'passed'
     or (v_result->>'replayed')::boolean then
    raise exception 'admit_wins_finalization_failed';
  end if;

  select count(*)
    into v_final_count
  from public.toro_execution_receipts receipt
  where receipt.org_id = v_run.org_id
    and receipt.run_id = v_run.id
    and receipt.receipt_type = 'verification'
    and receipt.status = 'verified';

  if v_final_count <> 1 then
    raise exception 'admit_wins_final_receipt_cardinality_invalid:%', v_final_count;
  end if;
end;
$$;
SQL

echo "Testing revoke-wins serialization in two PostgreSQL sessions"
run_revoke_winner >/dev/null &
revoke_pid=$!
wait_until_session_sleeps "${REVOKE_APP}" "${revoke_pid}"

revoke_wins_admission="$({
  psql_test <<'SQL'
set statement_timeout = '20s';
select coalesce(
  public.toro_admit_approved_alegra_execution_v1(
    '10000000-0000-4000-8000-000000000001',
    test_case.run_id,
    'writer-revoke-lost',
    0,
    test_case.approval_receipt_id,
    test_case.approval_id,
    test_case.actor_id,
    test_case.approved_at,
    test_case.expires_at,
    test_case.payload_hash,
    test_case.decision_revision::text,
    120
  )::text,
  '__NULL__'
)
from public.alegra_l3_test_context test_case
where test_case.label = 'revoke_wins';
SQL
})"

wait "${revoke_pid}"

if [[ "${revoke_wins_admission}" != "__NULL__" ]]; then
  echo "Expected admission to fail closed after revocation, got: ${revoke_wins_admission}" >&2
  exit 1
fi

psql_test <<'SQL'
do $$
declare
  v_context public.alegra_l3_test_context%rowtype;
  v_run public.toro_execution_runs%rowtype;
  v_prepared_count integer;
  v_denied_count integer;
begin
  select *
    into v_context
  from public.alegra_l3_test_context
  where label = 'revoke_wins';

  select *
    into v_run
  from public.toro_execution_runs
  where org_id = '10000000-0000-4000-8000-000000000001'
    and id = v_context.run_id;

  if v_run.status is distinct from 'cancelled'
     or v_run.verification_status is distinct from 'pending'
     or v_run.lease_owner is not null
     or v_run.lease_expires_at is not null
     or v_run.fencing_token <> 1
     or v_run.error_class is distinct from 'ALEGRA_APPROVAL_REVOKED'
     or v_run.safe_metadata->>'approvalBindingState' is distinct from 'revoked'
     or nullif(v_run.safe_metadata->>'revocationReceiptId', '') is null then
    raise exception 'revoke_wins_run_state_invalid';
  end if;

  select count(*)
    into v_prepared_count
  from public.toro_execution_receipts receipt
  where receipt.org_id = v_run.org_id
    and receipt.run_id = v_run.id
    and receipt.receipt_type = 'execution'
    and receipt.status = 'prepared';

  select count(*)
    into v_denied_count
  from public.toro_execution_receipts receipt
  where receipt.org_id = v_run.org_id
    and receipt.run_id = v_run.id
    and receipt.receipt_type = 'approval'
    and receipt.status = 'denied';

  if v_prepared_count <> 0 or v_denied_count <> 1 then
    raise exception 'revoke_wins_receipt_cardinality_invalid:%:%',
      v_prepared_count,
      v_denied_count;
  end if;
end;
$$;
SQL

echo "Alegra L3 admission/revocation concurrency assertions passed"
