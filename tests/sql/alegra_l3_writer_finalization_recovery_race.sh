#!/usr/bin/env bash
set -Eeuo pipefail

# PostgreSQL 17-only serialization proof. All identifiers and receipts are
# synthetic; this script has no network path to Supabase or Alegra.
: "${DATABASE_URL:?DATABASE_URL is required}"

readonly FINALIZER_APP="alegra_l3_finalizer_lock_holder"
readonly HEARTBEAT_HOLDER_APP="alegra_l3_heartbeat_lock_holder"
readonly RECOVERY_APP="alegra_l3_recovery_lock_holder"
readonly APPROVAL_HOLDER_APP="alegra_l3_approval_lock_holder"
readonly STALE_ADMISSION_APP="alegra_l3_stale_admission_waiter"
readonly APPROVAL_RENEWAL_HOLDER_APP="alegra_l3_approval_renewal_lock_holder"
readonly APPROVAL_RENEWAL_APP="alegra_l3_approval_renewal_waiter"

declare -a temporary_files=()

cleanup() {
  local pid
  local path

  while read -r pid; do
    if [[ -n "${pid}" ]]; then
      kill "${pid}" 2>/dev/null || true
    fi
  done < <(jobs -pr)

  for path in "${temporary_files[@]:-}"; do
    if [[ -n "${path}" ]]; then
      rm -f -- "${path}"
    fi
  done
}

trap cleanup EXIT

psql_test() {
  psql "${DATABASE_URL}" -X -qAt -v ON_ERROR_STOP=1 "$@"
}

wait_until_session_sleeps() {
  local application_name="$1"
  local pid="$2"
  local sleeping

  for _ in $(seq 1 150); do
    if ! kill -0 "${pid}" 2>/dev/null; then
      wait "${pid}" || true
      echo "${application_name} exited before its lock-hold barrier" >&2
      return 1
    fi

    sleeping="$(
      psql_test -c "
        select exists (
          select 1
          from pg_catalog.pg_stat_activity
          where application_name = '${application_name}'
            and state = 'active'
            and wait_event_type = 'Timeout'
            and query like '%pg_sleep%'
        );
      " 2>/dev/null || true
    )"

    if [[ "${sleeping}" == "t" ]]; then
      return 0
    fi

    sleep 0.1
  done

  echo "Timed out waiting for ${application_name} to hold its run lock" >&2
  return 1
}

wait_until_session_waits_on_lock() {
  local application_name="$1"
  local pid="$2"
  local waiting

  for _ in $(seq 1 150); do
    if ! kill -0 "${pid}" 2>/dev/null; then
      wait "${pid}" || true
      echo "${application_name} exited before reaching its row-lock wait" >&2
      return 1
    fi

    waiting="$(
      psql_test -c "
        select exists (
          select 1
          from pg_catalog.pg_stat_activity
          where application_name = '${application_name}'
            and state = 'active'
            and wait_event_type = 'Lock'
        );
      " 2>/dev/null || true
    )"

    if [[ "${waiting}" == "t" ]]; then
      return 0
    fi

    sleep 0.1
  done

  echo "Timed out waiting for ${application_name} to block on the run lock" >&2
  return 1
}

run_approval_lock_holder() {
  PGAPPNAME="${APPROVAL_HOLDER_APP}" psql_test <<'SQL'
set statement_timeout = '30s';
do $$
declare
  v_context public.alegra_l3_test_context%rowtype;
begin
  select *
    into strict v_context
  from public.alegra_l3_test_context
  where label = 'approval_expiry_stale';

  perform 1
  from public.toro_execution_runs run
  where run.id = v_context.run_id
  for update;

  -- Keep the serialization boundary locked until after the immutable approval
  -- expires. Admission and renewal start on opposite sides of that deadline.
  perform pg_sleep(
    greatest(
      0,
      extract(epoch from v_context.expires_at - clock_timestamp()) + 2
    )
  );
end;
$$;
SQL
}

run_approval_renewal_lock_holder() {
  PGAPPNAME="${APPROVAL_RENEWAL_HOLDER_APP}" psql_test <<'SQL'
set statement_timeout = '15s';
do $$
declare
  v_context public.alegra_l3_test_context%rowtype;
begin
  select *
    into strict v_context
  from public.alegra_l3_test_context
  where label = 'approval_expiry_stale';

  perform 1
  from public.toro_execution_runs run
  where run.id = v_context.run_id
  for update;

  perform pg_sleep(3);
end;
$$;
SQL
}

run_finalizer_lock_holder() {
  PGAPPNAME="${FINALIZER_APP}" psql_test <<'SQL'
set statement_timeout = '50s';
do $$
declare
  v_context public.alegra_l3_test_context%rowtype;
  v_run public.toro_execution_runs%rowtype;
  v_result jsonb;
  v_original_lease_expires_at timestamptz;
begin
  select *
    into strict v_context
  from public.alegra_l3_test_context
  where label = 'finalization_wins';

  select *
    into strict v_run
  from public.toro_execution_runs
  where id = v_context.run_id;

  v_original_lease_expires_at := v_run.lease_expires_at;

  v_result := public.toro_finalize_alegra_execution_v1(
    v_run.org_id,
    v_run.id,
    'writer-finalization-wins',
    v_context.fencing_token,
    v_context.prepared_receipt_id,
    'verified',
    jsonb_build_object(
      'external_reference', 'SYNTHETIC-NATIVE-FINALIZATION-WINS',
      'integrity_hash', v_context.payload_hash,
      'observed_after', jsonb_build_object(
        'version', 'TORO-ALEGRA-WRITER-RECEIPT-v1',
        'idempotencyKey', 'alegra-l3-finalization_wins',
        'payloadHash', v_context.payload_hash,
        'approvalId', v_context.approval_id,
        'actorId', v_context.actor_id,
        'nativeId', 'SYNTHETIC-NATIVE-FINALIZATION-WINS',
        'executionState', 'provider_created',
        'verificationState', 'VERIFIED',
        'verified', true,
        'reasons', '[]'::jsonb
      ),
      'evidence_refs', jsonb_build_array(
        'postgres17:synthetic:race:finalization-wins'
      )
    )
  );

  if v_result is null
     or v_result->>'runStatus' is distinct from 'succeeded'
     or v_result->>'verificationStatus' is distinct from 'passed'
     or (v_result->>'replayed')::boolean is distinct from false then
    raise exception 'finalization_winner_failed:%', v_result;
  end if;

  -- Keep the run lock beyond the original lease deadline. A recovery that
  -- started concurrently must re-evaluate the committed terminal row.
  perform pg_sleep(
    greatest(
      0,
      extract(epoch from v_original_lease_expires_at - clock_timestamp()) + 1
    )
  );
end;
$$;
SQL
}

run_heartbeat_lock_holder() {
  PGAPPNAME="${HEARTBEAT_HOLDER_APP}" psql_test <<'SQL'
set statement_timeout = '50s';
do $$
declare
  v_context public.alegra_l3_test_context%rowtype;
  v_lease_expires_at timestamptz;
begin
  select test_case.*
    into strict v_context
  from public.alegra_l3_test_context test_case
  where test_case.label = 'heartbeat_waits_expiry';

  select run.lease_expires_at
    into strict v_lease_expires_at
  from public.toro_execution_runs run
  where run.id = v_context.run_id
  for update;

  -- Do not mutate the row. This transaction only creates a real wait so the
  -- heartbeat must sample wall time again after acquiring the lock.
  perform pg_sleep(
    greatest(
      0,
      extract(epoch from v_lease_expires_at - clock_timestamp()) + 1
    )
  );
end;
$$;
SQL
}

run_recovery_lock_holder() {
  PGAPPNAME="${RECOVERY_APP}" psql_test <<'SQL'
set statement_timeout = '20s';
do $$
declare
  v_context public.alegra_l3_test_context%rowtype;
  v_result jsonb;
begin
  select *
    into strict v_context
  from public.alegra_l3_test_context
  where label = 'recovery_wins';

  v_result := public.toro_recover_expired_alegra_execution_v1(
    '10000000-0000-4000-8000-000000000001',
    v_context.run_id,
    'recovery-controller-race',
    v_context.fencing_token,
    v_context.prepared_receipt_id
  );

  if v_result is null
     or v_result->>'runStatus' is distinct from 'blocked'
     or v_result->>'verificationStatus' is distinct from 'partial'
     or v_result->>'providerState' is distinct from 'PROVIDER_STATE_UNKNOWN'
     or (v_result->>'fencingToken')::bigint
          is distinct from v_context.fencing_token + 1
     or (v_result->>'replayed')::boolean is distinct from false then
    raise exception 'recovery_winner_failed:%', v_result;
  end if;

  -- Hold the updated row uncommitted so the stale finalizer demonstrably
  -- waits, then re-evaluates against the incremented fence after commit.
  perform pg_sleep(3);
end;
$$;
SQL
}

echo "Testing finalization-wins and heartbeat-through-expiry serialization"
finalizer_output="$(mktemp)"
finalizer_error="$(mktemp)"
holder_output="$(mktemp)"
holder_error="$(mktemp)"
recovery_loser_output="$(mktemp)"
recovery_loser_error="$(mktemp)"
heartbeat_output="$(mktemp)"
heartbeat_error="$(mktemp)"
approval_holder_output="$(mktemp)"
approval_holder_error="$(mktemp)"
stale_admission_output="$(mktemp)"
stale_admission_error="$(mktemp)"
approval_renewal_holder_output="$(mktemp)"
approval_renewal_holder_error="$(mktemp)"
approval_renewal_output="$(mktemp)"
approval_renewal_error="$(mktemp)"
temporary_files+=(
  "${finalizer_output}" "${finalizer_error}"
  "${holder_output}" "${holder_error}"
  "${recovery_loser_output}" "${recovery_loser_error}"
  "${heartbeat_output}" "${heartbeat_error}"
  "${approval_holder_output}" "${approval_holder_error}"
  "${stale_admission_output}" "${stale_admission_error}"
  "${approval_renewal_holder_output}" "${approval_renewal_holder_error}"
  "${approval_renewal_output}" "${approval_renewal_error}"
)

run_finalizer_lock_holder >"${finalizer_output}" 2>"${finalizer_error}" &
finalizer_pid=$!

run_heartbeat_lock_holder >"${holder_output}" 2>"${holder_error}" &
heartbeat_holder_pid=$!

run_approval_lock_holder >"${approval_holder_output}" 2>"${approval_holder_error}" &
approval_holder_pid=$!

wait_until_session_sleeps "${FINALIZER_APP}" "${finalizer_pid}"
wait_until_session_sleeps "${HEARTBEAT_HOLDER_APP}" "${heartbeat_holder_pid}"
wait_until_session_sleeps "${APPROVAL_HOLDER_APP}" "${approval_holder_pid}"

# Start admission while the first approval is still valid. It must block on
# the run row and re-sample time after the lock, not retain its start time.
PGAPPNAME="${STALE_ADMISSION_APP}" \
  psql_test >"${stale_admission_output}" 2>"${stale_admission_error}" <<'SQL' &
set statement_timeout = '30s';
select coalesce(
  public.toro_admit_approved_alegra_execution_v1(
    '10000000-0000-4000-8000-000000000001',
    test_case.run_id,
    'writer-stale-approval',
    0,
    test_case.approval_receipt_id,
    test_case.approval_id,
    test_case.actor_id,
    test_case.approved_at,
    test_case.expires_at,
    test_case.payload_hash,
    test_case.decision_revision::text,
    30
  )::text,
  '__NULL__'
)
from public.alegra_l3_test_context test_case
where test_case.label = 'approval_expiry_stale';
SQL
stale_admission_pid=$!
wait_until_session_waits_on_lock "${STALE_ADMISSION_APP}" "${stale_admission_pid}"

admission_started_before_expiry="$(
  psql_test -c "
    select activity.query_start < test_case.expires_at
    from pg_catalog.pg_stat_activity activity
    cross join public.alegra_l3_test_context test_case
    where activity.application_name = '${STALE_ADMISSION_APP}'
      and activity.wait_event_type = 'Lock'
      and test_case.label = 'approval_expiry_stale';
  "
)"

if [[ "${admission_started_before_expiry}" != "t" ]]; then
  echo "Stale admission did not demonstrably start before approval expiry" >&2
  exit 1
fi

if ! wait "${approval_holder_pid}"; then
  cat "${approval_holder_error}" >&2
  exit 1
fi
if ! wait "${stale_admission_pid}"; then
  cat "${stale_admission_error}" >&2
  exit 1
fi

if [[ "$(tr -d '\r\n' <"${stale_admission_output}")" != "__NULL__" ]]; then
  echo "Admission that waited through approval expiry was accepted" >&2
  cat "${stale_admission_output}" >&2
  exit 1
fi

# Observe the exact post-admission/pre-renewal state. This separates the stale
# admission proof from the legitimate metadata mutation made by renewal.
psql_test <<'SQL'
do $$
declare
  v_context public.alegra_l3_test_context%rowtype;
  v_run public.toro_execution_runs%rowtype;
  v_ledger_count integer;
  v_prepared_count integer;
begin
  select *
    into strict v_context
  from public.alegra_l3_test_context
  where label = 'approval_expiry_stale';

  select *
    into strict v_run
  from public.toro_execution_runs
  where id = v_context.run_id;

  select count(*)
    into v_ledger_count
  from public.toro_alegra_l3_owner_approvals signed
  where signed.run_id = v_context.run_id;

  select count(*)
    into v_prepared_count
  from public.toro_execution_receipts receipt
  where receipt.run_id = v_context.run_id
    and receipt.receipt_type = 'execution'
    and receipt.status = 'prepared';

  if v_context.expires_at > clock_timestamp()
     or v_ledger_count <> 1
     or v_prepared_count <> 0
     or v_run.status is distinct from 'queued'
     or v_run.decision_id is distinct from v_context.decision_id
     or v_run.fencing_token <> 0
     or v_run.attempt_count <> 0
     or v_run.started_at is not null
     or v_run.verifying_at is not null
     or v_run.finished_at is not null
     or v_run.lease_owner is not null
     or v_run.lease_expires_at is not null
     or v_run.safe_metadata ?| array[
          'preparedReceiptId','dispatchAdmittedAt','dispatchWorkerId'
        ]
     or v_run.safe_metadata->>'approvalBindingState' is distinct from 'approved'
     or v_run.safe_metadata->>'approvalReceiptId'
          is distinct from v_context.approval_receipt_id::text
     or v_run.safe_metadata->>'approvalId' is distinct from v_context.approval_id
     or (v_run.safe_metadata->>'approvalExpiresAt')::timestamptz
          is distinct from v_context.expires_at then
    raise exception 'expired_waiting_admission_mutated_run_or_marker';
  end if;
end;
$$;
SQL

# Renewal begins after expiry and is independently forced to wait on the same
# serialization boundary. The canonical resolver and draft triggers perform
# the renewal; no direct renewal row is fabricated.
run_approval_renewal_lock_holder \
  >"${approval_renewal_holder_output}" \
  2>"${approval_renewal_holder_error}" &
approval_renewal_holder_pid=$!
wait_until_session_sleeps \
  "${APPROVAL_RENEWAL_HOLDER_APP}" \
  "${approval_renewal_holder_pid}"

PGAPPNAME="${APPROVAL_RENEWAL_APP}" \
  psql_test >"${approval_renewal_output}" 2>"${approval_renewal_error}" <<'SQL' &
set statement_timeout = '30s';
set request.jwt.claim.sub = '20000000-0000-4000-8000-000000000001';
set request.jwt.claim.role = 'authenticated';
set request.jwt.claims = '{"app_metadata":{"toro_role":"FOUNDER"}}';
select public.resolve_toro_decision(
  '70000000-0000-4000-8000-000000000010',
  'approve',
  'Synthetic expired approval renewal',
  null
);
SQL
approval_renewal_pid=$!
wait_until_session_waits_on_lock "${APPROVAL_RENEWAL_APP}" "${approval_renewal_pid}"

renewal_started_after_expiry="$(
  psql_test -c "
    select activity.query_start > test_case.expires_at
    from pg_catalog.pg_stat_activity activity
    cross join public.alegra_l3_test_context test_case
    where activity.application_name = '${APPROVAL_RENEWAL_APP}'
      and activity.wait_event_type = 'Lock'
      and test_case.label = 'approval_expiry_stale';
  "
)"

if [[ "${renewal_started_after_expiry}" != "t" ]]; then
  echo "Approval renewal did not demonstrably start after prior expiry" >&2
  exit 1
fi

if ! wait "${approval_renewal_holder_pid}"; then
  cat "${approval_renewal_holder_error}" >&2
  exit 1
fi
if ! wait "${approval_renewal_pid}"; then
  cat "${approval_renewal_error}" >&2
  exit 1
fi

# Prove the failed admission left no execution marker or run mutation, and the
# serialized renewal formed an exact immutable supersedes chain. Then admit and
# finalize only the renewed authority so this run is terminal before rollback.
psql_test <<'SQL'
do $$
declare
  v_stale public.alegra_l3_test_context%rowtype;
  v_run public.toro_execution_runs%rowtype;
  v_prior_signed public.toro_alegra_l3_owner_approvals%rowtype;
  v_renewed_signed public.toro_alegra_l3_owner_approvals%rowtype;
  v_prior_receipt public.toro_execution_receipts%rowtype;
  v_renewed_receipt public.toro_execution_receipts%rowtype;
  v_admission jsonb;
  v_finalization jsonb;
  v_prepared_receipt_id uuid;
  v_fencing_token bigint;
  v_ledger_count integer;
  v_prepared_count integer;
begin
  select *
    into strict v_stale
  from public.alegra_l3_test_context
  where label = 'approval_expiry_stale';

  select *
    into strict v_run
  from public.toro_execution_runs
  where id = v_stale.run_id;

  select *
    into strict v_prior_signed
  from public.toro_alegra_l3_owner_approvals
  where id = '80000000-0000-4000-8000-000000000009';

  select *
    into strict v_prior_receipt
  from public.toro_execution_receipts
  where id = v_stale.approval_receipt_id;

  select *
    into strict v_renewed_signed
  from public.toro_alegra_l3_owner_approvals signed
  where signed.run_id = v_stale.run_id
    and signed.decision_id = '70000000-0000-4000-8000-000000000010';

  select *
    into strict v_renewed_receipt
  from public.toro_execution_receipts receipt
  where receipt.run_id = v_stale.run_id
    and receipt.decision_id = v_renewed_signed.decision_id
    and receipt.receipt_type = 'approval'
    and receipt.status = 'verified';

  select count(*)
    into v_ledger_count
  from public.toro_alegra_l3_owner_approvals signed
  where signed.run_id = v_stale.run_id;

  select count(*)
    into v_prepared_count
  from public.toro_execution_receipts receipt
  where receipt.run_id = v_stale.run_id
    and receipt.receipt_type = 'execution'
    and receipt.status = 'prepared';

  if v_stale.expires_at >= v_renewed_signed.created_at
     or v_renewed_signed.approved_at <= v_prior_signed.expires_at
     or v_renewed_signed.expires_at
          is distinct from v_renewed_signed.approved_at + interval '15 minutes'
     or v_renewed_signed.supersedes_approval_id is distinct from v_prior_signed.id
     or v_renewed_signed.actor_id is distinct from v_prior_signed.actor_id
     or v_renewed_signed.payload_hash is distinct from v_prior_signed.payload_hash
     or v_renewed_receipt.supersedes_receipt_id is distinct from v_prior_receipt.id
     or v_renewed_receipt.source_receipt_ref is distinct from v_renewed_signed.id::text
     or v_ledger_count <> 2
     or v_prepared_count <> 0
     or v_run.status is distinct from 'queued'
     or v_run.fencing_token <> 0
     or v_run.attempt_count <> 0
     or v_run.started_at is not null
     or v_run.lease_owner is not null
     or v_run.lease_expires_at is not null
     or v_run.decision_id is distinct from v_renewed_signed.decision_id
     or v_run.safe_metadata->>'approvalBindingState' is distinct from 'approved'
     or v_run.safe_metadata->>'canonicalApprovalId'
          is distinct from v_renewed_signed.id::text
     or v_run.safe_metadata->>'approvalReceiptId'
          is distinct from v_renewed_receipt.id::text then
    raise exception 'expired_approval_renewal_chain_or_stale_admission_invalid';
  end if;

  insert into public.alegra_l3_test_context (
    label, run_id, decision_id, approval_receipt_id, approval_id, actor_id,
    approved_at, expires_at, decision_revision, payload_hash
  ) values (
    'approval_renewal', v_run.id, v_renewed_signed.decision_id,
    v_renewed_receipt.id, v_renewed_signed.approval_id,
    v_renewed_signed.actor_id::text, v_renewed_signed.approved_at,
    v_renewed_signed.expires_at, v_renewed_signed.decision_revision,
    v_renewed_signed.payload_hash
  );

  v_admission := public.toro_admit_approved_alegra_execution_v1(
    v_run.org_id,
    v_run.id,
    'writer-approval-renewal',
    0,
    v_renewed_receipt.id,
    v_renewed_signed.approval_id,
    v_renewed_signed.actor_id::text,
    v_renewed_signed.approved_at,
    v_renewed_signed.expires_at,
    v_renewed_signed.payload_hash,
    v_renewed_signed.decision_revision::text,
    30
  );

  if v_admission is null
     or (v_admission->>'fencingToken')::bigint is distinct from 1
     or nullif(v_admission->>'preparedReceiptId', '') is null then
    raise exception 'renewed_approval_admission_failed:%', v_admission;
  end if;

  v_prepared_receipt_id := (v_admission->>'preparedReceiptId')::uuid;
  v_fencing_token := (v_admission->>'fencingToken')::bigint;

  update public.alegra_l3_test_context
     set prepared_receipt_id = v_prepared_receipt_id,
         fencing_token = v_fencing_token
   where label = 'approval_renewal';

  v_finalization := public.toro_finalize_alegra_execution_v1(
    v_run.org_id,
    v_run.id,
    'writer-approval-renewal',
    v_fencing_token,
    v_prepared_receipt_id,
    'verified',
    jsonb_build_object(
      'external_reference', 'SYNTHETIC-NATIVE-APPROVAL-RENEWAL',
      'integrity_hash', v_renewed_signed.payload_hash,
      'observed_after', jsonb_build_object(
        'version', 'TORO-ALEGRA-WRITER-RECEIPT-v1',
        'idempotencyKey', 'alegra-l3-approval-expiry-renewal',
        'payloadHash', v_renewed_signed.payload_hash,
        'approvalId', v_renewed_signed.approval_id,
        'actorId', v_renewed_signed.actor_id::text,
        'nativeId', 'SYNTHETIC-NATIVE-APPROVAL-RENEWAL',
        'executionState', 'provider_created',
        'verificationState', 'VERIFIED',
        'verified', true,
        'reasons', '[]'::jsonb
      ),
      'evidence_refs', jsonb_build_array(
        'postgres17:synthetic:approval-renewal'
      )
    )
  );

  if v_finalization is null
     or v_finalization->>'runStatus' is distinct from 'succeeded'
     or v_finalization->>'verificationStatus' is distinct from 'passed'
     or (v_finalization->>'replayed')::boolean is distinct from false then
    raise exception 'renewed_approval_finalization_failed:%', v_finalization;
  end if;
end;
$$;
SQL

psql_test >"${recovery_loser_output}" 2>"${recovery_loser_error}" <<'SQL' &
set statement_timeout = '50s';
select coalesce(
  public.toro_recover_expired_alegra_execution_v1(
    '10000000-0000-4000-8000-000000000001',
    test_case.run_id,
    'recovery-controller-loser',
    test_case.fencing_token,
    test_case.prepared_receipt_id
  )::text,
  '__NULL__'
)
from public.alegra_l3_test_context test_case
where test_case.label = 'finalization_wins';
SQL
recovery_loser_pid=$!

psql_test >"${heartbeat_output}" 2>"${heartbeat_error}" <<'SQL' &
set statement_timeout = '50s';
select coalesce(
  public.toro_heartbeat_alegra_execution_v1(
    '10000000-0000-4000-8000-000000000001',
    test_case.run_id,
    'writer-heartbeat-waits-expiry',
    test_case.fencing_token,
    test_case.prepared_receipt_id,
    60
  )::text,
  '__NULL__'
)
from public.alegra_l3_test_context test_case
where test_case.label = 'heartbeat_waits_expiry';
SQL
heartbeat_pid=$!

if ! wait "${finalizer_pid}"; then
  cat "${finalizer_error}" >&2
  exit 1
fi
if ! wait "${heartbeat_holder_pid}"; then
  cat "${holder_error}" >&2
  exit 1
fi
if ! wait "${recovery_loser_pid}"; then
  cat "${recovery_loser_error}" >&2
  exit 1
fi
if ! wait "${heartbeat_pid}"; then
  cat "${heartbeat_error}" >&2
  exit 1
fi

if [[ "$(tr -d '\r\n' <"${recovery_loser_output}")" != "__NULL__" ]]; then
  echo "Recovery defeated committed finalization unexpectedly" >&2
  cat "${recovery_loser_output}" >&2
  exit 1
fi

if [[ "$(tr -d '\r\n' <"${heartbeat_output}")" != "__NULL__" ]]; then
  echo "Heartbeat revived a lease after waiting through expiry" >&2
  cat "${heartbeat_output}" >&2
  exit 1
fi

# Terminalize the still-running, now-expired heartbeat case using the recovery
# contract itself. This guarantees rollback quiescence without direct mutation.
psql_test <<'SQL'
do $$
declare
  v_context public.alegra_l3_test_context%rowtype;
  v_result jsonb;
begin
  select *
    into strict v_context
  from public.alegra_l3_test_context
  where label = 'heartbeat_waits_expiry';

  v_result := public.toro_recover_expired_alegra_execution_v1(
    '10000000-0000-4000-8000-000000000001',
    v_context.run_id,
    'recovery-controller-heartbeat-expiry',
    v_context.fencing_token,
    v_context.prepared_receipt_id
  );

  if v_result is null
     or v_result->>'runStatus' is distinct from 'blocked'
     or v_result->>'verificationStatus' is distinct from 'partial'
     or (v_result->>'fencingToken')::bigint
          is distinct from v_context.fencing_token + 1
     or (v_result->>'replayed')::boolean is distinct from false then
    raise exception 'heartbeat_expiry_terminal_recovery_failed:%', v_result;
  end if;
end;
$$;
SQL

echo "Testing recovery-wins versus stale finalization serialization"
recovery_output="$(mktemp)"
recovery_error="$(mktemp)"
temporary_files+=("${recovery_output}" "${recovery_error}")

run_recovery_lock_holder >"${recovery_output}" 2>"${recovery_error}" &
recovery_pid=$!
wait_until_session_sleeps "${RECOVERY_APP}" "${recovery_pid}"

stale_finalization="$(
  psql_test <<'SQL'
set statement_timeout = '20s';
select coalesce(
  public.toro_finalize_alegra_execution_v1(
    '10000000-0000-4000-8000-000000000001',
    test_case.run_id,
    'writer-recovery-wins',
    test_case.fencing_token,
    test_case.prepared_receipt_id,
    'verified',
    jsonb_build_object(
      'external_reference', 'SYNTHETIC-NATIVE-RECOVERY-WINS-LOSER',
      'integrity_hash', test_case.payload_hash,
      'observed_after', jsonb_build_object(
        'version', 'TORO-ALEGRA-WRITER-RECEIPT-v1',
        'idempotencyKey', 'alegra-l3-recovery_wins',
        'payloadHash', test_case.payload_hash,
        'approvalId', test_case.approval_id,
        'actorId', test_case.actor_id,
        'nativeId', 'SYNTHETIC-NATIVE-RECOVERY-WINS-LOSER',
        'executionState', 'provider_created',
        'verificationState', 'VERIFIED',
        'verified', true,
        'reasons', '[]'::jsonb
      ),
      'evidence_refs', jsonb_build_array(
        'postgres17:synthetic:race:recovery-wins'
      )
    )
  )::text,
  '__NULL__'
)
from public.alegra_l3_test_context test_case
where test_case.label = 'recovery_wins';
SQL
)"

if ! wait "${recovery_pid}"; then
  cat "${recovery_error}" >&2
  exit 1
fi

if [[ "$(printf '%s' "${stale_finalization}" | tr -d '\r\n')" != "__NULL__" ]]; then
  echo "Stale finalization defeated committed recovery/fence unexpectedly" >&2
  printf '%s\n' "${stale_finalization}" >&2
  exit 1
fi

psql_test <<'SQL'
do $$
declare
  v_context public.alegra_l3_test_context%rowtype;
  v_run public.toro_execution_runs%rowtype;
  v_final_receipts integer;
  v_recovery_receipts integer;
begin
  select *
    into strict v_context
  from public.alegra_l3_test_context
  where label = 'finalization_wins';

  select *
    into strict v_run
  from public.toro_execution_runs
  where id = v_context.run_id;

  select count(*) filter (
           where receipt.receipt_type = 'verification'
             and receipt.status = 'verified'
         ),
         count(*) filter (
           where receipt.source_receipt_kind = 'alegra_l3_expired_lease_recovery'
         )
    into v_final_receipts, v_recovery_receipts
  from public.toro_execution_receipts receipt
  where receipt.run_id = v_context.run_id;

  if v_run.status is distinct from 'succeeded'
     or v_run.verification_status is distinct from 'passed'
     or v_run.fencing_token is distinct from v_context.fencing_token
     or v_run.safe_metadata->>'approvalBindingState' is distinct from 'finalized'
     or v_final_receipts <> 1
     or v_recovery_receipts <> 0 then
    raise exception 'finalization_wins_terminal_contract_invalid';
  end if;

  select *
    into strict v_context
  from public.alegra_l3_test_context
  where label = 'recovery_wins';

  select *
    into strict v_run
  from public.toro_execution_runs
  where id = v_context.run_id;

  select count(*) filter (
           where receipt.receipt_type = 'verification'
             and receipt.status = 'verified'
         ),
         count(*) filter (
           where receipt.source_receipt_kind = 'alegra_l3_expired_lease_recovery'
         )
    into v_final_receipts, v_recovery_receipts
  from public.toro_execution_receipts receipt
  where receipt.run_id = v_context.run_id;

  if v_run.status is distinct from 'blocked'
     or v_run.verification_status is distinct from 'partial'
     or v_run.fencing_token is distinct from v_context.fencing_token + 1
     or v_run.safe_metadata->>'approvalBindingState' is distinct from 'recovery_blocked'
     or v_final_receipts <> 0
     or v_recovery_receipts <> 1 then
    raise exception 'recovery_wins_terminal_contract_invalid';
  end if;

  select *
    into strict v_context
  from public.alegra_l3_test_context
  where label = 'heartbeat_waits_expiry';

  select *
    into strict v_run
  from public.toro_execution_runs
  where id = v_context.run_id;

  if v_run.status is distinct from 'blocked'
     or v_run.verification_status is distinct from 'partial'
     or v_run.fencing_token is distinct from v_context.fencing_token + 1
     or v_run.safe_metadata->>'approvalBindingState' is distinct from 'recovery_blocked' then
    raise exception 'heartbeat_expiry_terminal_contract_invalid';
  end if;
end;
$$;
SQL

echo "Alegra L3 finalization/recovery/heartbeat race assertions passed"
