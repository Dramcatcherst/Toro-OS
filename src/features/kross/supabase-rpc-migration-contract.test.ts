import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL(
    "../../../supabase/drafts/20261017_kross_supabase_atomic_rpc_v1_review_only.sql",
    import.meta.url,
  ),
  "utf8",
).replace(/\r\n/g, "\n");

const rollback = readFileSync(
  new URL(
    "../../../supabase/drafts/20261017_kross_supabase_atomic_rpc_v1_rollback_review_only.sql",
    import.meta.url,
  ),
  "utf8",
).replace(/\r\n/g, "\n");

const supportTables = [
  "kross_feed_state_v1",
  "kross_feed_lease_grants_v1",
  "kross_import_runs_v1",
  "kross_row_checkpoints_v1",
  "kross_attempt_receipts_v1",
  "kross_quarantine_v1",
  "kross_commit_journal_v1",
] as const;

describe("Kross Supabase atomic RPC review-only draft", () => {
  it("is visibly non-applied and stays outside the migration apply directory", () => {
    expect(migration.startsWith("-- REVIEW ONLY / NOT APPLIED / DO NOT DB PUSH.")).toBe(true);
    expect(rollback.startsWith("-- REVIEW ONLY / NOT APPLIED / DO NOT DB PUSH.")).toBe(true);
    expect(migration).toContain("STATUS: BLOCKED BY ADVERSARIAL REVIEW (0 P0 / 7 P1). DO NOT EXECUTE.");
    expect(rollback).toContain("STATUS: BLOCKED BY ADVERSARIAL REVIEW (0 P0 / 7 P1). DO NOT EXECUTE.");
    expect(migration).toContain("REVIEW_ONLY_BLOCKED: resolve the seven recorded P1 findings");
    expect(rollback).toContain("REVIEW_ONLY_BLOCKED: repair rollback quiescence/locking");
    expect(migration).toContain("begin;\nset local lock_timeout = '3s';");
    expect(migration.trimEnd().endsWith("commit;")).toBe(true);
    expect(rollback.trimEnd().endsWith("commit;")).toBe(true);
  });

  it("creates only support state for the existing reservation mirror", () => {
    for (const table of supportTables) {
      expect(migration).toContain(`create table integrations.${table}`);
      expect(migration).toContain(`alter table integrations.${table} enable row level security;`);
      expect(migration).toContain(`revoke all on integrations.${table} from public, anon, authenticated, service_role, toro_kross_ingest_executor_v1;`);
    }
    expect(migration).toContain("insert into operations.reservations");
    expect(migration).not.toMatch(/create\s+table\s+\S*reservations/i);
    expect(migration).not.toMatch(/(?:insert\s+into|update|delete\s+from)\s+integrations\.kross_snapshot_(?:registry|health)/i);
  });

  it("keeps all mutations behind one narrow NOLOGIN executor capability", () => {
    expect(migration).toMatch(/create role toro_kross_ingest_executor_v1[\s\S]*nologin noinherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls;/);
    expect(migration).toContain("grant usage on schema private to toro_kross_ingest_executor_v1;");
    expect(migration).not.toMatch(/grant\s+(?:select|insert|update|delete|truncate|all)[\s\S]{0,120}toro_kross_ingest_executor_v1/i);
    expect(migration).toContain("from public,anon,authenticated,service_role,toro_kross_ingest_executor_v1;");
    expect(migration).not.toMatch(/grant\s+execute[\s\S]{0,150}\b(?:anon|authenticated|service_role)\b/i);
    expect(migration).toContain("kross_reservations_atomic_guard_v1");
    expect(migration).toContain("toro.kross_atomic_write_v1");
  });

  it("uses database-issued monotonic fencing and authoritative time", () => {
    expect(migration).toContain("create function private.kross_acquire_feed_lease_v1(");
    expect(migration).toContain("v_now timestamptz := statement_timestamp();");
    expect(migration).toContain("fencing_token = fencing_token + 1");
    expect(migration).toContain("and fencing_token = p_expected_token;");
    expect(migration).toContain("lease_expires_at > v_now");
    expect(migration).toContain("pg_advisory_xact_lock(hashtextextended(v_feed_key, 0))");
    expect(migration).toContain("kross_feed_lease_grants_append_only_v1");
  });

  it("implements one private transaction boundary for both write operations", () => {
    for (const rpc of ["kross_commit_feed_v1", "kross_append_attempt_evidence_v1"]) {
      expect(migration).toContain(`create function private.${rpc}(p_request jsonb)`);
    }
    expect(migration).toContain("create function private.kross_atomic_readback_v1(p_request jsonb)");
    expect(migration).toContain("kross.supabase.atomic-write.v1");
    expect(migration).toContain("kross.supabase.atomic-readback.v1");
    expect(migration).toContain("request_or_attempt_conflict");
    expect(migration).toContain("feed_checkpoint_changed");
    expect(migration).toContain("mirror_changed");
    expect(migration).toContain("row_checkpoint_changed");
    expect(migration).not.toMatch(/https?:\/\/|fetch\(|webhook|http_request|net\.http/i);
    expect(migration).toContain("OpenClaw and WhatsApp must never receive this database role or credentials");
  });

  it("recomputes request and proof hashes and rejects sensitive keys", () => {
    expect(migration).toContain("private.kross_sha256_json_v1(p_request - 'requestId' - 'requestHash')");
    expect(migration).toContain("private.kross_sha256_json_v1(v_write_set -> 'attemptReceipt')");
    expect(migration).toContain("private.kross_has_forbidden_key_v1(p_request)");
    for (const key of [
      "sourcereference",
      "guest_id",
      "guest_key_raw",
      "phone",
      "email",
      "service_role",
      "access_token",
      "cookie",
      "total_amount",
      "payment_status",
      "amount_paid",
    ]) {
      expect(migration).toContain(`'${key}'`);
    }
  });

  it("fails closed on live promotion until health is versioned into the proof", () => {
    expect(migration).toContain("v1 is intentionally historical/read-only");
    expect(migration).toContain("source_is_live = false");
    expect(migration).toContain("coalesce(m #>> '{reservation,source_is_live}','true') <> 'false'");
    expect(migration).not.toMatch(/set\s+use_as_current_state|safe_for_current_state\s*=/i);
  });

  it("makes evidence append-only and requires correlated readback", () => {
    for (const trigger of [
      "kross_feed_lease_grants_append_only_v1",
      "kross_import_runs_append_only_v1",
      "kross_attempt_receipts_append_only_v1",
      "kross_quarantine_append_only_v1",
      "kross_commit_journal_append_only_v1",
    ]) {
      expect(migration).toContain(`create trigger ${trigger}`);
    }
    expect(migration).toContain("j.request_id = p_request ->> 'requestId'");
    expect(migration).toContain("j.request_hash = p_request ->> 'requestHash'");
    expect(migration).toContain("j.fencing_token = (p_request ->> 'fencingToken')::bigint");
  });
});

describe("exact guarded rollback", () => {
  it("fails closed when durable evidence or role memberships exist", () => {
    expect(rollback).toContain("pg_catalog.pg_auth_members");
    expect(rollback).toContain("archival/recovery approval is required");
    expect(rollback).toContain("refusing a partial rollback");
    expect(rollback).not.toMatch(/\bcascade\b/i);
    expect(rollback).not.toMatch(/\b(?:delete\s+from|truncate|update\s+)\b/i);
  });

  it("removes only the additive contract in dependency-safe order", () => {
    for (const table of supportTables) {
      expect(rollback).toContain(`drop table integrations.${table};`);
    }
    expect(rollback).toContain("drop trigger kross_reservations_atomic_guard_v1 on operations.reservations;");
    expect(rollback).toContain("drop role toro_kross_ingest_executor_v1;");
    expect(rollback).not.toMatch(/drop\s+(?:table|view)\s+operations\.(?:reservations|current_reservations_safe)/i);
    expect(rollback).not.toMatch(/drop\s+(?:table|view)\s+integrations\.kross_snapshot_(?:registry|health)/i);
    expect(rollback).toContain("rollback touched or lost a pre-existing Kross read object");
  });
});
