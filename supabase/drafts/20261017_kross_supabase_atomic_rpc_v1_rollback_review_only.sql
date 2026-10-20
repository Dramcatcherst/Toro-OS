-- REVIEW ONLY / NOT APPLIED / DO NOT DB PUSH.
-- Exact rollback for 20261017_kross_supabase_atomic_rpc_v1_review_only.sql.
-- STATUS: BLOCKED BY ADVERSARIAL REVIEW (0 P0 / 7 P1). DO NOT EXECUTE.
--
-- This rollback is intentionally fail-closed. It refuses to remove the
-- append-only evidence contract after any lease, run, checkpoint, receipt,
-- quarantine or commit exists. It never deletes or rewrites reservation rows,
-- health/registry state or any pre-existing Kross object.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';
set local search_path = '';

do $review_only_execution_block$
begin
  raise exception 'REVIEW_ONLY_BLOCKED: repair rollback quiescence/locking and pass isolated PostgreSQL validation before execution';
end;
$review_only_execution_block$;

do $preflight$
declare
  v_name text;
  v_count bigint;
begin
  if not exists (
    select 1 from pg_catalog.pg_roles
    where rolname = 'toro_kross_ingest_executor_v1'
      and not rolcanlogin and not rolsuper and not rolcreatedb
      and not rolcreaterole and not rolreplication and not rolbypassrls
  ) then
    raise exception 'expected narrow executor role is absent or drifted';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_auth_members m
    join pg_catalog.pg_roles r on r.oid = m.roleid
    where r.rolname = 'toro_kross_ingest_executor_v1'
  ) then
    raise exception 'executor role has members; revoke through a separately reviewed activation rollback first';
  end if;

  foreach v_name in array array[
    'integrations.kross_feed_state_v1',
    'integrations.kross_feed_lease_grants_v1',
    'integrations.kross_import_runs_v1',
    'integrations.kross_row_checkpoints_v1',
    'integrations.kross_attempt_receipts_v1',
    'integrations.kross_quarantine_v1',
    'integrations.kross_commit_journal_v1'
  ] loop
    if to_regclass(v_name) is null then
      raise exception '% is absent; refusing a partial rollback', v_name;
    end if;
    execute format('select count(*) from %s', v_name) into v_count;
    if v_count <> 0 then
      raise exception '% contains % row(s); archival/recovery approval is required', v_name, v_count;
    end if;
  end loop;

  foreach v_name in array array[
    'private.kross_canonical_json_v1(jsonb)',
    'private.kross_sha256_json_v1(jsonb)',
    'private.kross_jsonb_has_exact_keys_v1(jsonb,text[])',
    'private.kross_has_forbidden_key_v1(jsonb)',
    'private.kross_feed_key_v1(uuid,uuid,text)',
    'private.kross_current_reservation_json_v1(uuid,uuid,text)',
    'private.kross_validate_atomic_request_v1(jsonb,text)',
    'private.kross_prevent_mutation_v1()',
    'private.kross_prevent_delete_v1()',
    'private.kross_guard_reservation_mutation_v1()',
    'private.kross_acquire_feed_lease_v1(jsonb,text,text,bigint,integer)',
    'private.kross_commit_feed_v1(jsonb)',
    'private.kross_append_attempt_evidence_v1(jsonb)',
    'private.kross_atomic_readback_v1(jsonb)'
  ] loop
    if to_regprocedure(v_name) is null then
      raise exception '% is absent; refusing a partial rollback', v_name;
    end if;
  end loop;

  if not exists (
    select 1 from pg_catalog.pg_trigger
    where tgrelid = 'operations.reservations'::regclass
      and tgname = 'kross_reservations_atomic_guard_v1'
      and not tgisinternal
  ) then
    raise exception 'Kross reservation mutation guard is absent';
  end if;
end;
$preflight$;

revoke execute on function private.kross_acquire_feed_lease_v1(jsonb,text,text,bigint,integer) from toro_kross_ingest_executor_v1;
revoke execute on function private.kross_commit_feed_v1(jsonb) from toro_kross_ingest_executor_v1;
revoke execute on function private.kross_append_attempt_evidence_v1(jsonb) from toro_kross_ingest_executor_v1;
revoke execute on function private.kross_atomic_readback_v1(jsonb) from toro_kross_ingest_executor_v1;
revoke usage on schema private from toro_kross_ingest_executor_v1;

drop trigger kross_reservations_atomic_guard_v1 on operations.reservations;
drop trigger kross_row_checkpoints_no_delete_v1 on integrations.kross_row_checkpoints_v1;
drop trigger kross_feed_state_no_delete_v1 on integrations.kross_feed_state_v1;
drop trigger kross_commit_journal_append_only_v1 on integrations.kross_commit_journal_v1;
drop trigger kross_quarantine_append_only_v1 on integrations.kross_quarantine_v1;
drop trigger kross_attempt_receipts_append_only_v1 on integrations.kross_attempt_receipts_v1;
drop trigger kross_import_runs_append_only_v1 on integrations.kross_import_runs_v1;
drop trigger kross_feed_lease_grants_append_only_v1 on integrations.kross_feed_lease_grants_v1;

drop function private.kross_atomic_readback_v1(jsonb);
drop function private.kross_append_attempt_evidence_v1(jsonb);
drop function private.kross_commit_feed_v1(jsonb);
drop function private.kross_acquire_feed_lease_v1(jsonb,text,text,bigint,integer);
drop function private.kross_guard_reservation_mutation_v1();
drop function private.kross_prevent_delete_v1();
drop function private.kross_prevent_mutation_v1();
drop function private.kross_validate_atomic_request_v1(jsonb,text);
drop function private.kross_current_reservation_json_v1(uuid,uuid,text);

drop table integrations.kross_quarantine_v1;
drop table integrations.kross_commit_journal_v1;
drop table integrations.kross_row_checkpoints_v1;
drop table integrations.kross_import_runs_v1;
drop table integrations.kross_attempt_receipts_v1;
drop table integrations.kross_feed_lease_grants_v1;
drop table integrations.kross_feed_state_v1;

drop function private.kross_feed_key_v1(uuid,uuid,text);
drop function private.kross_has_forbidden_key_v1(jsonb);
drop function private.kross_sha256_json_v1(jsonb);
drop function private.kross_canonical_json_v1(jsonb);
drop function private.kross_jsonb_has_exact_keys_v1(jsonb,text[]);

drop role toro_kross_ingest_executor_v1;

do $readback$
declare
  v_name text;
begin
  foreach v_name in array array[
    'integrations.kross_feed_state_v1',
    'integrations.kross_feed_lease_grants_v1',
    'integrations.kross_import_runs_v1',
    'integrations.kross_row_checkpoints_v1',
    'integrations.kross_attempt_receipts_v1',
    'integrations.kross_quarantine_v1',
    'integrations.kross_commit_journal_v1'
  ] loop
    if to_regclass(v_name) is not null then
      raise exception '% survived rollback', v_name;
    end if;
  end loop;

  if exists (select 1 from pg_catalog.pg_roles where rolname = 'toro_kross_ingest_executor_v1') then
    raise exception 'executor role survived rollback';
  end if;

  if to_regclass('operations.reservations') is null
     or to_regclass('operations.current_reservations_safe') is null
     or to_regclass('integrations.kross_snapshot_registry') is null
     or to_regclass('integrations.kross_snapshot_health') is null then
    raise exception 'rollback touched or lost a pre-existing Kross read object';
  end if;
end;
$readback$;

commit;
