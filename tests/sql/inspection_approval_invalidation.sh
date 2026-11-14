#!/usr/bin/env bash
set -Eeuo pipefail
# PostgreSQL-only, synthetic, disposable proof. No DATABASE_URL is accepted.
repo_root="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
image="postgres@sha256:d3244e8ce3f165ee3c93d9c4a4b1d0fe48b3a89e2287b717fdcbbde92d405065"
docker image inspect "$image" >/dev/null
test_dir="$(mktemp -d)"
container=""
cleanup() {
  if [[ -n "$container" ]]; then docker rm -f "$container" >/dev/null 2>&1 || true; fi
  rm -rf "$test_dir"
}
trap cleanup EXIT
container="$(docker run --rm -d --network none --tmpfs /var/lib/postgresql/data -e POSTGRES_HOST_AUTH_METHOD=trust "$image")"
ready=false
for _ in $(seq 1 60); do
  if [[ "$(docker logs "$container" 2>&1)" == *"PostgreSQL init process complete; ready for start up."* ]] &&
     docker exec "$container" pg_isready -U postgres >/dev/null 2>&1; then ready=true; break; fi
  sleep 0.2
done
[[ "$ready" == true ]]
[[ "$(docker inspect --format '{{.HostConfig.NetworkMode}}' "$container")" == none ]]
sql() { docker exec -i "$container" psql -U postgres -X -qAt -v ON_ERROR_STOP=1 "$@"; }
apply="$repo_root/supabase/drafts/20261114_inspection_approval_invalidation_v1.sql"
rollback="$repo_root/supabase/drafts/20261114_inspection_approval_invalidation_v1_rollback.sql"
suite="$repo_root/tests/sql/inspection_approval_invalidation.sql"
expect_rejected() {
  local path="$1" expected="$2"
  if sql < "$path" > "$test_dir/rejected.log" 2>&1; then
    echo "Expected source guard rejection" >&2; exit 1
  fi
  [[ "$(cat "$test_dir/rejected.log")" == *"$expected"* ]]
}
sql < "$repo_root/tests/sql/fixtures/inspection_approval_baseline.sql"
if sql < "$suite" > "$test_dir/red.log" 2>&1; then
  echo "Original trigger unexpectedly passes the regression suite" >&2; exit 1
fi
[[ "$(cat "$test_dir/red.log")" == *"INSPECTION_TEST_FAILURES: 26/31"* ]]
echo "PASS original PostgreSQL trigger reproduces 26/31 regression failures"

for trigger in trg_prepare_inspection_check trg_apply_inspection_check_result; do
  sql -c "ALTER TABLE facilities.inspection_checks DISABLE TRIGGER $trigger;"
  expect_rejected "$apply" INSPECTION_APPROVAL_SOURCE_DRIFT
  [[ "$(sql -c "SELECT tgenabled FROM pg_trigger WHERE tgname='$trigger';")" == D ]]
  sql -c "ALTER TABLE facilities.inspection_checks ENABLE TRIGGER $trigger;"
done
echo "PASS disabled BEFORE/AFTER reject apply without re-enabling"

sql -c "DROP TRIGGER trg_apply_inspection_check_result ON facilities.inspection_checks; CREATE TRIGGER trg_apply_inspection_check_result AFTER UPDATE OF result_status ON facilities.inspection_checks FOR EACH ROW EXECUTE FUNCTION facilities.prepare_inspection_check();"
expect_rejected "$apply" INSPECTION_APPROVAL_SOURCE_DRIFT
sql -c "DROP TRIGGER trg_apply_inspection_check_result ON facilities.inspection_checks; CREATE TRIGGER trg_apply_inspection_check_result AFTER UPDATE OF result_status,evidence_ref,evidence_note,responsible_name,supervisor_confirmed,supervisor_name,supervisor_confirmed_at ON facilities.inspection_checks FOR EACH ROW EXECUTE FUNCTION facilities.apply_inspection_check_result();"
echo "PASS misbound trigger rejects apply"

sql < "$apply"
sql < "$suite"
sql < "$repo_root/tests/sql/fixtures/inspection_rpc_contract.sql"
sql < "$repo_root/tests/sql/inspection_rpc_contract.sql"
expect_rejected "$apply" INSPECTION_APPROVAL_SOURCE_DRIFT
echo "PASS apply cannot overwrite an already changed source"

sql -c "ALTER TABLE facilities.inspection_checks DISABLE TRIGGER trg_prepare_inspection_check;"
expect_rejected "$rollback" INSPECTION_APPROVAL_ROLLBACK_SOURCE_DRIFT
[[ "$(sql -c "SELECT tgenabled FROM pg_trigger WHERE tgname='trg_prepare_inspection_check';")" == D ]]
sql -c "ALTER TABLE facilities.inspection_checks ENABLE TRIGGER trg_prepare_inspection_check;"
echo "PASS disabled trigger rejects rollback without re-enabling"

sql < "$rollback"
[[ "$(sql -c "SELECT md5(pg_get_functiondef('facilities.prepare_inspection_check()'::regprocedure))||'|'||(SELECT md5(pg_get_triggerdef(oid,true)) FROM pg_trigger WHERE tgname='trg_apply_inspection_check_result');")" == "7eb6c9ef5af1aa432dba15cae71be4a1|051e84e1b05f6b0912d4cf4bd97f6931" ]]
[[ "$(sql -c "SELECT md5(pg_get_functiondef('facilities.apply_inspection_check_result()'::regprocedure))||'|'||md5(pg_get_viewdef('facilities.inspection_field_capture_v'::regclass,false))||'|'||md5(pg_get_viewdef('operations.room_operational_gate'::regclass,false));")" == "39ac301caeb60da33da322e735e59673|3ac5ecf445854fb1e3880d6a9b860bda|a93f507a531d04ac0ed9e3c9352cdc0e" ]]
echo "PASS rollback restores exact originals and preserves other three objects"
