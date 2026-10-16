import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const genericClaimSql = readFileSync(
  new URL("../../../supabase/drafts/20261001_toro_targeted_worker_claim_v1.sql", import.meta.url),
  "utf8",
);
const admissionSql = readFileSync(
  new URL("../../../supabase/drafts/20261016_toro_alegra_l3_dispatch_admission_v1.sql", import.meta.url),
  "utf8",
);
const rollbackSql = readFileSync(
  new URL("../../../supabase/drafts/20261016_toro_alegra_l3_dispatch_admission_v1_rollback.sql", import.meta.url),
  "utf8",
);

function sqlFunction(name: string, nextName?: string) {
  const start = admissionSql.indexOf(`create or replace function ${name}`);
  const end = nextName
    ? admissionSql.indexOf(`create or replace function ${nextName}`, start + 1)
    : admissionSql.length;
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  return admissionSql.slice(start, end);
}

describe("Alegra L3 SQL dispatch contract", () => {
  it("keeps the generic targeted claim restricted to L0-L2", () => {
    const claimBody = genericClaimSql.slice(
      genericClaimSql.indexOf("create or replace function public.toro_claim_execution_run_by_id_v1"),
      genericClaimSql.indexOf("create or replace function public.toro_complete_execution_run_v1"),
    );
    expect(claimBody).toContain("execution_authority_level in ('L0','L1','L2')");
    expect(claimBody).not.toContain("'L3'");
  });

  it("separates the canonical human signer from the untrusted writer", () => {
    expect(admissionSql).toContain("DRAFT ONLY — NOT AUTHORIZED FOR PRODUCTION APPLY");
    expect(admissionSql).toContain("current_user <> 'postgres'");
    expect(admissionSql).toContain("raise exception 'alegra_l3_deployer_must_be_postgres'");
    expect(admissionSql).toContain("public.resolve_toro_decision(uuid,text,text,text)");
    expect(admissionSql).toContain("8d06580e9ae843c42b2620908fdbea1a");
    expect(admissionSql).toContain("pg_get_userbyid(p.proowner) = 'postgres'");
    expect(admissionSql).toContain("has_function_privilege('authenticated', p.oid, 'EXECUTE')");
    expect(admissionSql).toContain("not pg_catalog.has_function_privilege('anon', p.oid, 'EXECUTE')");
    expect(admissionSql).toContain("auth.uid()");
    expect(admissionSql).toContain("auth.jwt()->'app_metadata'->>'toro_role'");
    expect(admissionSql).toContain("'FOUNDER'");
    expect(admissionSql).toContain("private.has_org_role(new.org_id, array['ADMIN','GERENCIA']::text[])");
    expect(admissionSql).toContain("has_schema_privilege('service_role', 'operations', 'USAGE')");
    expect(admissionSql).toContain("authenticated_direct_decision_write_forbidden");
    expect(admissionSql).not.toContain("membership.membership_type = 'owner'");
    expect(admissionSql).toContain("create table if not exists public.toro_alegra_l3_owner_approvals");
    expect(admissionSql).toContain("actor_membership_type text not null");
    expect(admissionSql).toContain("actor_role_code text not null");
    expect(admissionSql).toContain("actor_toro_role text not null");
    expect(admissionSql).toContain("before update or delete on public.toro_alegra_l3_owner_approvals");
    expect(admissionSql).toContain("revoke all on table public.toro_alegra_l3_owner_approvals from service_role");
    expect(admissionSql).toContain("after update of status, decision_value, processed_at");
    expect(admissionSql).toContain("'toro_signed_owner_approval', 'owner_approval_v1'");
  });

  it("does not treat writer metadata or a self-issued receipt as authority", () => {
    const guard = sqlFunction(
      "public.toro_guard_alegra_l3_approval_receipt_v1",
      "public.toro_guard_alegra_l3_run_admission_v1",
    );
    const admission = sqlFunction(
      "public.toro_admit_approved_alegra_execution_v1",
      "public.toro_finalize_alegra_execution_v1",
    );

    expect(guard).toContain("from public.toro_alegra_l3_owner_approvals signed");
    expect(guard).toContain("raise exception 'canonical_signed_owner_approval_required'");
    expect(guard).toContain("from operations.executive_decisions decision");
    expect(guard).toContain("decision.processed_at = v_signed.approved_at");
    expect(guard).toContain("decision.updated_at = v_signed.decision_revision");
    expect(guard).toContain("decision.source_ref = v_signed.payload_hash");
    expect(admission).toContain("join operations.executive_decisions decision");
    expect(admission).toContain("join identity.organization_memberships membership");
    expect(admission).toContain("join public.user_roles role_assignment");
    expect(admission).toContain("join public.roles role_definition");
    expect(admission).toContain("join auth.users actor");
    expect(admission).toContain("signed.id::text = v_approval.source_receipt_ref");
    expect(admission).toContain("for share of signed, membership, role_assignment, role_definition, actor");
    expect(admission).toContain("decision row is deliberately not locked here");
  });

  it("binds canonical approvedAt, expiry, payload hash, and revision exactly", () => {
    const admission = sqlFunction(
      "public.toro_admit_approved_alegra_execution_v1",
      "public.toro_finalize_alegra_execution_v1",
    );

    expect(admission).toContain("p_approval_approved_at timestamptz");
    expect(admission).toContain("(approval.desired_state->>'approvedAt')::timestamptz = p_approval_approved_at");
    expect(admission).toContain("(approval.desired_state->>'expiresAt')::timestamptz = p_approval_expires_at");
    expect(admission).toContain("signed.payload_hash = p_payload_hash");
    expect(admission).toContain("signed.decision_revision = p_decision_revision::timestamptz");
    expect(admission).toContain("p_decision_revision::timestamptz is distinct from p_approval_approved_at");
    expect(admission).toContain("'approvedAt', p_approval_approved_at");
    expect(admission).toContain("'canonicalApprovalId', v_signed.id");
  });

  it("rejects future, expired, and arbitrary-TTL approvals", () => {
    const admission = sqlFunction(
      "public.toro_admit_approved_alegra_execution_v1",
      "public.toro_finalize_alegra_execution_v1",
    );

    expect(admissionSql).toContain("check (expires_at = approved_at + interval '15 minutes')");
    expect(admissionSql).toContain("check (approved_at <= created_at)");
    expect(admission).toContain("p_approval_approved_at > v_locked_at");
    expect(admission).toContain("p_approval_expires_at <= v_locked_at");
    expect(admission).toContain("p_approval_expires_at <> p_approval_approved_at + interval '15 minutes'");
    expect(admission).toContain("p_approval_approved_at > v_dispatch_at");
    expect(admission).toContain("p_approval_expires_at <= v_dispatch_at");
    expect(admission).not.toMatch(/\bnow\s*\(/);
  });

  it("enforces fresh-run invariants in signing, transition, admission, and UPDATE", () => {
    const capture = sqlFunction(
      "public.toro_capture_alegra_l3_owner_approval_v1",
      "public.toro_guard_alegra_l3_approval_receipt_v1",
    );
    const runGuard = sqlFunction(
      "public.toro_guard_alegra_l3_run_admission_v1",
      "public.toro_revoke_alegra_execution_authority_v1",
    );
    const admission = sqlFunction(
      "public.toro_admit_approved_alegra_execution_v1",
      "public.toro_finalize_alegra_execution_v1",
    );
    const invariants = [
      "verification_status is distinct from 'pending'",
      "started_at is not null",
      "verifying_at is not null",
      "finished_at is not null",
      "error_class is not null",
      "error_redacted is not null",
    ];

    for (const invariant of invariants) {
      expect(capture).toContain(invariant);
      expect(runGuard).toContain(invariant);
      expect(admission).toContain(invariant);
    }
    expect(admission).toContain("run.verification_status = 'pending'");
    expect(admission).toContain("run.started_at is null");
    expect(admission).toContain("run.finished_at is null");
    expect(admission).toContain("run.error_class is null");
    expect(admission).toContain("run.error_redacted is null");
    expect(admission).toContain("started_at = v_dispatch_at");
    expect(admission).not.toContain("started_at = coalesce");
    expect(runGuard).toContain("nullif(new.safe_metadata->>'preparedReceiptId','') is null");
  });

  it("serializes expired -> renewed approval without cancelling the queued run", () => {
    const capture = sqlFunction(
      "public.toro_capture_alegra_l3_owner_approval_v1",
      "public.toro_guard_alegra_l3_approval_receipt_v1",
    );

    expect(capture).toContain("from public.toro_execution_runs run");
    expect(capture).toContain("for update;");
    expect(capture).toContain("v_prior.expires_at > v_locked_at");
    expect(capture).toContain("new.processed_at <= v_prior.approved_at");
    expect(capture).toContain("v_prior.payload_hash is distinct from new.source_ref");
    expect(capture).toContain("v_prior.actor_id is distinct from v_actor_id");
    expect(capture).toContain("v_prior.decision_id is distinct from v_run.decision_id");
    expect(capture).toContain("supersedes_approval_id");
    expect(capture).toContain("v_prior_receipt_id");
    expect(capture).not.toContain("set status = 'cancelled'");
    expect(admissionSql).toContain("set decision_id = v_signed.decision_id");
  });

  it("uses post-lock wall time and revalidates wait-through-expiry immediately before UPDATE", () => {
    const admission = sqlFunction(
      "public.toro_admit_approved_alegra_execution_v1",
      "public.toro_finalize_alegra_execution_v1",
    );
    const runLock = admission.indexOf("for update;");
    const lockedAt = admission.indexOf("v_locked_at := clock_timestamp()");
    const dispatchAt = admission.indexOf("v_dispatch_at := clock_timestamp()");
    const finalExpiry = admission.indexOf("p_approval_expires_at <= v_dispatch_at", dispatchAt);
    const update = admission.indexOf("update public.toro_execution_runs run", dispatchAt);

    expect(runLock).toBeGreaterThanOrEqual(0);
    expect(lockedAt).toBeGreaterThan(runLock);
    expect(dispatchAt).toBeGreaterThan(lockedAt);
    expect(finalExpiry).toBeGreaterThan(dispatchAt);
    expect(update).toBeGreaterThan(finalExpiry);
    expect(admission.slice(dispatchAt, update)).toContain("not exists (");
    expect(admission.slice(dispatchAt, update)).toContain("membership.status = 'active'");
  });

  it("binds the prepared marker id in the first admitted run state", () => {
    const admission = sqlFunction(
      "public.toro_admit_approved_alegra_execution_v1",
      "public.toro_finalize_alegra_execution_v1",
    );
    const finalization = sqlFunction(
      "public.toro_finalize_alegra_execution_v1",
      "public.toro_heartbeat_alegra_execution_v1",
    );
    const allocate = admission.indexOf("v_prepared_receipt_id := gen_random_uuid()");
    const update = admission.indexOf("update public.toro_execution_runs run", allocate);
    const insert = admission.indexOf("insert into public.toro_execution_receipts", update);

    expect(allocate).toBeGreaterThanOrEqual(0);
    expect(update).toBeGreaterThan(allocate);
    expect(insert).toBeGreaterThan(update);
    expect(admission.slice(update, insert)).toContain("'preparedReceiptId', v_prepared_receipt_id::text");
    expect(admission.slice(insert)).toContain("id, org_id, run_id, task_id, decision_id");
    expect(admission.slice(insert)).toContain("v_prepared_receipt_id, v_run.org_id");
    expect(admission.slice(insert)).toContain("'decisionRevision', p_decision_revision::timestamptz");
    expect(finalization).toContain("v_run.safe_metadata->>'preparedReceiptId' is distinct from p_prepared_receipt_id::text");
    expect(finalization).toContain("(prepared.desired_state->>'approvedAt')::timestamptz =");
    expect(finalization).toContain("(prepared.desired_state->>'expiresAt')::timestamptz =");
    expect(finalization).toContain("(prepared.desired_state->>'decisionRevision')::timestamptz =");
    expect(finalization).toContain("prepared.desired_state->>'canonicalApprovalId' = v_run.safe_metadata->>'canonicalApprovalId'");
    expect(finalization).toContain("prepared.source_receipt_ref = v_run.safe_metadata->>'canonicalApprovalId'");
    expect(finalization).not.toContain("prepared.source_receipt_ref = v_run.safe_metadata->>'approvalReceiptId'");
  });

  it("rechecks signer authority at the row transition as defense in depth", () => {
    const runGuard = sqlFunction(
      "public.toro_guard_alegra_l3_run_admission_v1",
      "public.toro_revoke_alegra_execution_authority_v1",
    );
    expect(runGuard).toContain("before insert or update on public.toro_execution_runs");
    expect(runGuard).toContain("raise exception 'alegra_l3_running_insert_forbidden'");
    expect(runGuard).toContain("raise exception 'alegra_l3_fresh_run_invariant_failed'");
    expect(runGuard).toContain("raise exception 'canonical_signed_owner_approval_not_current'");
    expect(runGuard).toContain("signed.expires_at > v_checked_at");
    expect(runGuard).toContain("activation still requires a dedicated writer role without direct");
  });

  it("keeps direct DML and signer execution outside the future writer role", () => {
    expect(admissionSql).toContain("service_role is not");
    expect(admissionSql).toContain("dedicated runtime role with no direct DML on runs, receipts");
    expect(admissionSql).toContain("no EXECUTE on the canonical signer RPC");
    expect(admissionSql).toContain("a row trigger is defense in depth, not a substitute for that ACL boundary");
  });

  it("records the mandatory live concurrency acceptance cases", () => {
    expect(admissionSql).toContain("LIVE DATABASE ACCEPTANCE REQUIRED BEFORE ACTIVATION");
    expect(admissionSql).toContain("expired -> renewed on the same queued run must serialize and supersede");
    expect(admissionSql).toContain("wait-through-expiry");
  });

  it("keeps every new Writer entrypoint ungranted while Writer remains OFF", () => {
    expect(admissionSql).not.toMatch(/^\s*grant\s+/gim);
    expect(admissionSql).toContain(
      "revoke all on function public.toro_admit_approved_alegra_execution_v1(uuid,uuid,text,bigint,uuid,text,text,timestamptz,timestamptz,text,text,integer)\n  from service_role",
    );
    expect(admissionSql).toContain(
      "revoke all on function public.toro_capture_alegra_l3_owner_approval_v1()\n  from service_role",
    );
    expect(admissionSql).toContain(
      "revoke all on function public.toro_finalize_alegra_execution_v1(uuid,uuid,text,bigint,uuid,text,jsonb)\n  from service_role",
    );
    expect(admissionSql).toContain(
      "revoke all on function public.toro_heartbeat_alegra_execution_v1(uuid,uuid,text,bigint,uuid,integer)\n  from service_role",
    );
    expect(admissionSql).toContain(
      "revoke all on function public.toro_recover_expired_alegra_execution_v1(uuid,uuid,text,bigint,uuid)\n  from service_role",
    );
    expect(admissionSql).toContain(
      "alegra_l3_callable_function_security_drifted",
    );
    expect(admissionSql).toContain("No runtime role has EXECUTE in this draft");
  });

  it("serializes approval revocation on the same run lock", () => {
    expect(admissionSql).toContain("create trigger toro_guard_alegra_l3_approval_receipt");
    expect(admissionSql).toContain("create or replace function public.toro_revoke_alegra_execution_authority_v1");
    expect(admissionSql).toContain("new.status <> 'denied'");
    expect(admissionSql).toContain("raise exception 'dispatch_already_admitted'");
    expect(admissionSql).toContain("set status = 'cancelled'");
    expect(admissionSql).toContain("fencing_token = r.fencing_token + 1");
    expect(admissionSql).toContain("later.approved_at, later.id");
    expect(admissionSql).toContain("revoked.supersedes_receipt_id = v_approval.id");
    expect(admissionSql).toContain("security definer");
    expect(admissionSql).toContain("auth.role() is distinct from 'authenticated'");
    expect(admissionSql).toContain("v_actor_id uuid := auth.uid()");
    expect(admissionSql).toContain("signed.actor_id = v_actor_id");
    expect(admissionSql).toContain("private.has_org_role(v_run.org_id, array['ADMIN','GERENCIA']::text[])");
    expect(admissionSql).not.toContain("p_revoked_by_actor_id text");
  });

  it("finalizes success or reconciliation with one fenced atomic RPC", () => {
    const finalizationBody = sqlFunction(
      "public.toro_finalize_alegra_execution_v1",
      "public.toro_heartbeat_alegra_execution_v1",
    );

    expect(finalizationBody).toContain("security definer");
    expect(finalizationBody).toContain("set search_path = ''");
    expect(finalizationBody).toContain("p_outcome not in ('verified','reconciliation_required')");
    expect(finalizationBody).toMatch(/where r\.org_id = p_org_id\s+and r\.id = p_run_id\s+and r\.fencing_token = p_fencing_token\s+for update;/);
    expect(finalizationBody).toContain("v_run.status in ('running','verifying')");
    expect(finalizationBody).toContain("prepared.id = p_prepared_receipt_id");
    expect(finalizationBody).toContain("prepared.executed_state->'fencingToken' = to_jsonb(p_fencing_token)");
    expect(finalizationBody).toContain("supersedes_receipt_id");
    expect(finalizationBody).toContain("'toro-execution-receipt:' || p_prepared_receipt_id::text");
    expect(finalizationBody).toContain("set status = v_run_status");
    expect(finalizationBody).toContain("verification_status = v_verification_status");
  });

  it("recovers the unique final receipt before changing the run and validates replay", () => {
    const finalizationBody = sqlFunction(
      "public.toro_finalize_alegra_execution_v1",
      "public.toro_heartbeat_alegra_execution_v1",
    );
    const recoverReceipt = "and receipt.idempotency_key = v_receipt_key";
    const insertReceipt = "insert into public.toro_execution_receipts";
    const updateRun = "update public.toro_execution_runs r";

    expect(finalizationBody).toContain("v_run.idempotency_key || ':verification'");
    expect(finalizationBody).toContain("v_run.idempotency_key || ':reconciliation'");
    expect(finalizationBody).toContain(recoverReceipt);
    expect(finalizationBody).toContain("v_replayed := true");
    expect(finalizationBody.indexOf(recoverReceipt)).toBeLessThan(finalizationBody.indexOf(insertReceipt));
    expect(finalizationBody.indexOf(insertReceipt)).toBeLessThan(finalizationBody.lastIndexOf(updateRun));
    expect(finalizationBody).toContain("v_run.safe_metadata->>'finalReceiptId' is distinct from v_receipt_id::text");
  });

  it("canonicalizes replay evidence and uses database finalization time", () => {
    const finalizationBody = sqlFunction(
      "public.toro_finalize_alegra_execution_v1",
      "public.toro_heartbeat_alegra_execution_v1",
    );
    const canonicalObserved = finalizationBody.slice(
      finalizationBody.indexOf("v_observed_after := jsonb_build_object("),
      finalizationBody.indexOf("select *\n    into v_prepared"),
    );

    expect(finalizationBody).toContain("select distinct evidence.value #>> '{}' as canonical_ref");
    expect(admissionSql).toContain("v_approval.evidence_refs || jsonb_build_array(");
    expect(admissionSql).toContain("v_prepared_evidence_refs,");
    expect(finalizationBody).toContain("v_prepared.evidence_refs || v_evidence_refs || jsonb_build_array(");
    expect(finalizationBody).toContain("select distinct reason.value #>> '{}' as canonical_reason");
    expect(finalizationBody).toContain("jsonb_array_length(v_reasons) = 0");
    expect(finalizationBody).toContain("'READBACK_MISMATCH'");
    expect(finalizationBody).toContain("'PROVIDER_STATE_UNKNOWN'");
    expect(finalizationBody).toContain(
      "v_external_reference := nullif(btrim(p_receipt->>'external_reference'),'')",
    );
    expect(finalizationBody).toMatch(
      /verificationState' = 'PROVIDER_STATE_UNKNOWN'[\s\S]*executionState' in \([\s\S]*'provider_created','provider_ambiguous_recovered'[\s\S]*v_external_reference is not null/,
    );
    expect(finalizationBody).toContain("'NOT_ATTEMPTED'");
    expect(canonicalObserved).not.toContain("'createdAt'");
    expect(canonicalObserved).not.toContain("'durableReceiptId'");
    expect(finalizationBody).toContain("v_locked_at := clock_timestamp()");
    expect(finalizationBody).toContain("v_finalized_at := clock_timestamp()");
    expect(finalizationBody).toContain("'finalizedAt', v_finalized_at");
    expect(finalizationBody).not.toContain("'finalizedAt', now()");
  });

  it("heartbeats only the same non-expired L3 worker/fence with a narrow TTL", () => {
    const heartbeat = sqlFunction(
      "public.toro_heartbeat_alegra_execution_v1",
      "public.toro_recover_expired_alegra_execution_v1",
    );
    const lock = heartbeat.indexOf("for update;");
    const checkedAt = heartbeat.indexOf("v_checked_at := clock_timestamp()");
    const markerLock = heartbeat.indexOf("for share;", checkedAt);
    const extendedAt = heartbeat.indexOf("v_extended_at := clock_timestamp()", markerLock);
    const update = heartbeat.indexOf("update public.toro_execution_runs r", extendedAt);

    expect(heartbeat).toContain("security definer");
    expect(heartbeat).toContain("set search_path = ''");
    expect(heartbeat).toContain("p_org_id is null or p_run_id is null");
    expect(heartbeat).toContain("p_worker_id is null or btrim(p_worker_id) = ''");
    expect(heartbeat).toContain("p_fencing_token is null or p_fencing_token < 1");
    expect(heartbeat).toContain("p_prepared_receipt_id is null");
    expect(heartbeat).toContain("p_lease_seconds < 30");
    expect(heartbeat).toContain("p_lease_seconds > 120");
    expect(lock).toBeGreaterThanOrEqual(0);
    expect(checkedAt).toBeGreaterThan(lock);
    expect(heartbeat).toContain("v_run.fencing_token <> p_fencing_token");
    expect(heartbeat).toContain("v_run.lease_owner is distinct from p_worker_id");
    expect(heartbeat).toContain("v_run.lease_expires_at <= v_checked_at");
    expect(heartbeat).toContain("prepared.id = p_prepared_receipt_id");
    expect(heartbeat).toContain("prepared.executed_state->'fencingToken' = to_jsonb(p_fencing_token)");
    expect(markerLock).toBeGreaterThan(checkedAt);
    expect(extendedAt).toBeGreaterThan(markerLock);
    expect(update).toBeGreaterThan(extendedAt);
    expect(heartbeat.slice(update)).toContain("r.lease_expires_at > v_extended_at");
    expect(heartbeat).toContain("interval '5 minutes'");
    expect(heartbeat).toContain("least(");
    expect(heartbeat).toContain("greatest(");
    expect(heartbeat).not.toContain("toro_renew_execution_lease_v1");
  });

  it("allows only a heartbeat-shaped active L3 row update in the guard", () => {
    const runGuard = sqlFunction(
      "public.toro_guard_alegra_l3_run_admission_v1",
      "public.toro_revoke_alegra_execution_authority_v1",
    );

    expect(runGuard).toContain("old.execution_authority_level = 'L3'");
    expect(runGuard).toContain("old.action_key = 'alegra_create_purchase_bill'");
    expect(runGuard).toContain("old.target_system = 'alegra'");
    expect(runGuard).toContain("new.status is distinct from 'queued'");
    expect(runGuard).toContain("raise exception 'alegra_l3_fresh_queued_insert_required'");
    expect(runGuard).toContain("old.execution_authority_level is distinct from 'L3'");
    expect(runGuard).toContain("old.action_key is distinct from 'alegra_create_purchase_bill'");
    expect(runGuard).toContain("old.target_system is distinct from 'alegra'");
    expect(runGuard).toContain("raise exception 'alegra_l3_scope_entry_by_update_forbidden'");
    expect(runGuard).toContain("old.status = 'queued' and new.status = 'queued'");
    expect(runGuard).toContain("pg_trigger_depth() <= 1");
    expect(runGuard).toContain("raise exception 'alegra_l3_approval_binding_update_invalid'");
    expect(runGuard).toContain("old.status = 'queued' and new.status = 'cancelled'");
    expect(runGuard).toContain("raise exception 'alegra_l3_revocation_update_invalid'");
    expect(runGuard).toContain("raise exception 'alegra_l3_queued_transition_forbidden'");
    expect(runGuard).toContain("raise exception 'alegra_l3_terminal_row_immutable'");
    expect(runGuard).toContain("old.status in ('running','verifying')");
    expect(runGuard).toContain("new.execution_authority_level is distinct from old.execution_authority_level");
    expect(runGuard).toContain("new.fencing_token is distinct from old.fencing_token");
    expect(runGuard).toContain("new.lease_expires_at < old.lease_expires_at");
    expect(runGuard).toContain("to_jsonb(new) - 'lease_expires_at' - 'updated_at'");
    expect(runGuard).toContain("raise exception 'alegra_l3_heartbeat_invariant_failed'");
    expect(runGuard).toContain("new.status not in ('succeeded','blocked')");
    expect(runGuard).toContain("receipt.id::text = new.safe_metadata->>'finalReceiptId'");
    expect(runGuard).toContain("new.fencing_token <> old.fencing_token + 1");
    expect(runGuard).toContain("raise exception 'alegra_l3_recovery_receipt_required'");
  });

  it("recovers only an expired exact fence/marker and persists one unknown-provider receipt", () => {
    const recovery = sqlFunction(
      "public.toro_recover_expired_alegra_execution_v1",
      "public.toro_transition_execution_run_v1",
    );
    const lock = recovery.indexOf("for update;");
    const recoveredAt = recovery.indexOf("v_recovered_at := clock_timestamp()");
    const marker = recovery.indexOf("prepared.id = p_prepared_receipt_id");
    const insert = recovery.indexOf("insert into public.toro_execution_receipts");
    const update = recovery.indexOf("update public.toro_execution_runs r", insert);

    expect(recovery).toContain("security definer");
    expect(recovery).toContain("set search_path = ''");
    expect(recovery).toContain("p_org_id is null or p_run_id is null");
    expect(recovery).toContain("p_recovery_worker_id is null or btrim(p_recovery_worker_id) = ''");
    expect(recovery).toContain("p_expected_fencing_token is null or p_expected_fencing_token < 1");
    expect(recovery).toContain("p_prepared_receipt_id is null");
    expect(lock).toBeGreaterThanOrEqual(0);
    expect(recoveredAt).toBeGreaterThan(lock);
    expect(recovery).toContain("v_run.fencing_token <> p_expected_fencing_token");
    expect(recovery).toContain("v_run.lease_expires_at > v_recovered_at");
    expect(recovery).toContain("v_run.fencing_token = v_new_fencing_token");
    expect(marker).toBeGreaterThan(recoveredAt);
    expect(recovery).toContain("prepared.executed_state->'fencingToken' = to_jsonb(p_expected_fencing_token)");
    expect(recovery).toContain("v_run.idempotency_key || ':expired_lease_recovery'");
    expect(recovery).toContain("'verificationState', 'PROVIDER_STATE_UNKNOWN'");
    expect(recovery).toContain("'LEASE_EXPIRED_AFTER_DISPATCH_PROVIDER_STATE_UNKNOWN'");
    expect(insert).toBeGreaterThan(marker);
    expect(update).toBeGreaterThan(insert);
    expect(recovery.slice(update)).toContain("set status = 'blocked'");
    expect(recovery.slice(update)).toContain("verification_status = 'partial'");
    expect(recovery.slice(update)).toContain("fencing_token = v_new_fencing_token");
    expect(recovery).toContain("'replayed', true");
    expect(recovery).toContain("'replayed', false");
  });

  it("has no provider-create or generic execution path in expired-lease recovery", () => {
    const recoveryStart = admissionSql.indexOf(
      "create or replace function public.toro_recover_expired_alegra_execution_v1",
    );
    const recoveryEnd = admissionSql.indexOf(
      "revoke all on function public.toro_recover_expired_alegra_execution_v1",
      recoveryStart,
    );
    expect(recoveryStart).toBeGreaterThanOrEqual(0);
    expect(recoveryEnd).toBeGreaterThan(recoveryStart);
    const recovery = admissionSql.slice(recoveryStart, recoveryEnd);

    expect(recovery).toContain("This RPC never calls Alegra");
    expect(recovery).not.toMatch(/\b(http_post|http_put|net\.http|pg_net|alegra\.com)\b/i);
    expect(recovery).not.toContain("toro_admit_approved_alegra_execution_v1");
    expect(recovery).not.toContain("toro_finalize_alegra_execution_v1");
    expect(recovery).not.toContain("toro_complete_execution_run_v1");
    expect(recovery).not.toContain("toro_transition_execution_run_v1");
  });

  it("rejects admitted L3 runs from every legacy transition/completion path", () => {
    const transition = sqlFunction(
      "public.toro_transition_execution_run_v1",
      "public.toro_complete_execution_run_v1",
    );
    const completion = sqlFunction("public.toro_complete_execution_run_v1");

    expect(transition).toContain("r.execution_authority_level in ('L0','L1','L2')");
    expect(transition).not.toContain("'L3'");
    expect(completion).toContain("v_run.execution_authority_level not in ('L0','L1','L2')");
    expect(completion).toContain("raise exception 'prohibited_execution_authority'");
    expect(admissionSql.indexOf("create or replace function public.toro_finalize_alegra_execution_v1"))
      .toBeLessThan(admissionSql.indexOf("create or replace function public.toro_transition_execution_run_v1"));
  });

  it("has a paired rollback for every signer/admission object", () => {
    expect(rollbackSql).toContain("lock table public.toro_alegra_l3_owner_approvals in access exclusive mode");
    expect(rollbackSql).toContain("drop trigger if exists toro_capture_alegra_l3_owner_approval");
    expect(rollbackSql).toContain("drop trigger if exists toro_guard_alegra_l3_run_admission");
    expect(rollbackSql).toContain("drop trigger if exists toro_guard_alegra_l3_approval_receipt");
    expect(rollbackSql).not.toContain("drop trigger if exists toro_prevent_alegra_l3_owner_approval_mutation");
    expect(rollbackSql).toContain("drop function if exists public.toro_capture_alegra_l3_owner_approval_v1");
    expect(rollbackSql).toContain("drop function if exists public.toro_guard_alegra_l3_run_admission_v1");
    expect(rollbackSql).toContain("drop function if exists public.toro_admit_approved_alegra_execution_v1");
    expect(rollbackSql).toContain("drop function if exists public.toro_heartbeat_alegra_execution_v1");
    expect(rollbackSql).toContain("drop function if exists public.toro_recover_expired_alegra_execution_v1");
    expect(rollbackSql).toContain("uuid,uuid,text,bigint,uuid,text,text,timestamptz,timestamptz,text,text,integer");
    expect(rollbackSql).not.toContain("drop function if exists public.toro_prevent_alegra_l3_owner_approval_mutation_v1");
    expect(rollbackSql).not.toContain("drop table if exists public.toro_alegra_l3_owner_approvals");
    expect(rollbackSql).toContain("Intentionally retain the immutable owner-approval ledger");
  });

  it("restores both legacy worker RPC definitions without granting privileges", () => {
    const transitionStart = rollbackSql.indexOf("create or replace function public.toro_transition_execution_run_v1");
    const completionStart = rollbackSql.indexOf("create or replace function public.toro_complete_execution_run_v1");
    const transition = rollbackSql.slice(transitionStart, completionStart);
    const completion = rollbackSql.slice(completionStart);

    expect(transitionStart).toBeGreaterThanOrEqual(0);
    expect(completionStart).toBeGreaterThan(transitionStart);
    expect(transition).not.toContain("execution_authority_level in ('L0','L1','L2')");
    expect(completion).toContain("v_run.execution_authority_level = 'L4'");
    expect(completion).not.toContain("v_run.execution_authority_level not in ('L0','L1','L2')");
    expect(rollbackSql).not.toMatch(/^\s*grant\s+/gim);
  });

  it("wraps forward deployment atomically and pins the live generic boundary", () => {
    expect(admissionSql.trimStart().indexOf("begin;")).toBeGreaterThan(0);
    expect(admissionSql.trimEnd().endsWith("commit;")).toBe(true);
    expect(admissionSql).toContain("d4a3fa3f97e521af83bf64161f2db473");
    expect(admissionSql).toContain("7ae24e38863cc14f7efecfe6ebef65cf");
    expect(admissionSql).toContain("generic_worker_rpc_live_preflight_drifted");
    expect(admissionSql).toContain("has_function_privilege('service_role', p.oid, 'EXECUTE')");
    expect(admissionSql).toContain("not pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE')");
    expect(admissionSql).toContain("select count(*) = 2");
    expect(admissionSql).toContain("privilege.grantor = p.proowner");
    expect(admissionSql).toContain("not privilege.is_grantable");

    const firstCreate = admissionSql.indexOf("create table if not exists public.toro_alegra_l3_owner_approvals");
    expect(admissionSql.indexOf("generic_worker_rpc_live_preflight_drifted")).toBeLessThan(firstCreate);
  });

  it("retains and fail-closed validates approval evidence across rollback and reapply", () => {
    expect(admissionSql).toContain("alegra_l3_retained_ledger_security_drifted");
    expect(admissionSql).toContain("alegra_l3_retained_ledger_column_drifted");
    expect(admissionSql).toContain("alegra_l3_retained_ledger_constraint_definition_drifted");
    expect(admissionSql).toContain("alegra_l3_retained_ledger_immutability_drifted");
    expect(admissionSql).toContain("alegra_l3_retained_ledger_immutability_body_drifted");
    expect(admissionSql).toContain("TORO_ALEGRA_L3_IMMUTABILITY_MD5=([0-9a-f]{32})$");
    expect(admissionSql).toContain("trigger_row.tgenabled = 'O'");
    expect(admissionSql).toContain("create index if not exists toro_alegra_l3_owner_approvals_run_idx");
    expect(rollbackSql).toContain("TORO_ALEGRA_L3_V1_ROLLBACK_MD5=([0-9a-f]{32})$");
    expect(rollbackSql).toContain("alegra_l3_rollback_generic_rpc_body_drifted");
    expect(rollbackSql).toContain("pg_catalog.aclexplode(");
    expect(rollbackSql).toContain("privilege.grantor = function_row.proowner");
    expect(rollbackSql).toContain("not privilege.is_grantable");
    expect(rollbackSql).not.toContain("drop table if exists public.toro_alegra_l3_owner_approvals");
  });

  it("blocks rollback while L3 authority or execution remains active", () => {
    const rollbackGuard = "alegra_l3_rollback_blocked_active_authority_or_execution";
    const firstDrop = "drop trigger if exists toro_guard_alegra_l3_approval_receipt";

    expect(rollbackSql).toContain("begin;");
    expect(rollbackSql).toContain("lock table public.toro_execution_runs in access exclusive mode;");
    expect(rollbackSql).toContain("lock table public.toro_execution_receipts in access exclusive mode;");
    expect(rollbackSql).toContain("r.status in ('running', 'verifying')");
    expect(rollbackSql).toContain("r.safe_metadata->>'approvalBindingState' in ('approved', 'admitted')");
    expect(rollbackSql).toContain(rollbackGuard);
    expect(rollbackSql.indexOf(rollbackGuard)).toBeLessThan(rollbackSql.indexOf(firstDrop));
    expect(rollbackSql.trimEnd().endsWith("commit;")).toBe(true);
  });
});
