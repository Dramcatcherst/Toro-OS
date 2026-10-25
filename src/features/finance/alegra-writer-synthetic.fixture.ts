import { readFileSync } from "node:fs";
import { prepareAlegraWriteIntent } from "./alegra-writer-contract";
import { ALEGRA_CANONICAL_CONTEXT_VERSION } from "./alegra-canonical-reader";

// Entirely synthetic, reusable by local source and packaged-artifact tests.
// No database, provider, credential store or production document is consulted.
export function createSyntheticAlegraHostFixture(options: { writerEnabled?: boolean } = {}) {
  const orgId = "595801ce-2895-4d91-81ae-e8d1d5cc8593";
  const runId = "11111111-1111-4111-8111-111111111111";
  const decisionId = "22222222-2222-4222-8222-222222222222";
  const approvalReceiptId = "33333333-3333-4333-8333-333333333333";
  const canonicalApprovalId = "44444444-4444-4444-8444-444444444444";
  const actorId = "55555555-5555-4555-8555-555555555555";
  const preparedReceiptId = "77777777-7777-4777-8777-777777777777";
  const finalReceiptId = "88888888-8888-4888-8888-888888888888";
  const recoveryReceiptId = "99999999-9999-4999-8999-999999999999";
  const workerId = "writer:synthetic-host:purchase-bill:v1";
  const recoveryWorkerId = "writer:synthetic-host:purchase-bill:recovery:v1";
  let currentTime = "2026-10-24T06:20:00.000Z";
  const revision = "2026-10-24T06:00:00.000Z";
  const input = {
    scope: { tenantId: "synthetic-tenant", orgId, legalEntityKey: "synthetic-entity" },
    evidence: { sourceRefs: ["synthetic:original"], evidenceHash: "synthetic-source-hash" },
    payload: { targetType: "purchase_bill" as const, documentNumber: "synthetic-invoice", supplierNativeId: "42", issuerTaxId: "synthetic-issuer", receiverTaxId: "3101354441",
      issueDate: "2026-10-24", dueDate: "2026-10-30", period: "2026-10", currency: "CRC", subtotal: "100.00", tax: "13.00", total: "113.00",
      accountNativeId: "51", costCenterNativeId: "7", purchaseTax: { nativeId: "3", percentage: "13" } },
  };
  const intent = prepareAlegraWriteIntent(input);
  const binding = { scope: input.scope, receiverTaxId: "3101354441", mainCurrency: "CRC", applicationVersion: "costaRica" };
  const approval = { approvalId: "synthetic-approval", approvalReceiptId, actorId, approvedAt: "2026-10-24T06:15:00.000Z", expiresAt: "2026-10-24T06:30:00.000Z",
    decisionId, decisionRevision: "2026-10-24T06:15:00.000Z", payloadHash: intent.payloadHash, state: "approved" as const };
  const envelope = { version: ALEGRA_CANONICAL_CONTEXT_VERSION, intentInput: input, binding,
    dedupe: { candidates: [], sourceStates: ["toro", "alegra", "receipt"].map(source => ({ source, coverage: "complete", checkedAt: "2026-10-24T06:19:59.000Z" })) },
    policy: { openPeriod: { knowledgeKey: "synthetic-open-period", revision, period: "2026-10" }, correctionPolicy: { knowledgeKey: "synthetic-correction-policy", revision } } };
  const metadata: Record<string, unknown> = { payloadHash: intent.payloadHash, approvalBindingState: "approved", approvalReceiptId, canonicalApprovalId,
    approvalId: approval.approvalId, approvalActorId: actorId, approvalApprovedAt: approval.approvedAt, approvalExpiresAt: approval.expiresAt,
    decisionRevision: approval.decisionRevision, alegraWriterContextV1: envelope };
  const run = { id: runId, org_id: orgId, task_id: "66666666-6666-4666-8666-666666666666", decision_id: decisionId,
    run_key: "synthetic-key", idempotency_key: intent.idempotencyKey, correlation_id: "synthetic-correlation", trace_id: null, actor_kind: "human", actor_ref: actorId,
    dot_ref: null, agent_ref: null, action_key: intent.action, target_system: "alegra", execution_authority_level: "L3", business_risk: "High", status: "queued",
    verification_status: "pending", attempt_count: 0, max_attempts: 1, lease_owner: null as string | null, fencing_token: 0, lease_expires_at: null as string | null, safe_metadata: metadata };
  const decision = { id: decisionId, org_id: orgId, status: "Respondida", decision_value: "approved", processed_at: approval.approvedAt, updated_at: approval.decisionRevision,
    decision_key: approval.approvalId, program_key: "toro_alegra_writer_v3", instruction: intent.action, source_system: "toro_control_plane", source_record_id: runId,
    source_ref: intent.payloadHash, superseded_by: null };
  const desired = { approvalId: approval.approvalId, actorId, payloadHash: intent.payloadHash, approvedAt: approval.approvedAt, expiresAt: approval.expiresAt,
    decisionRevision: approval.decisionRevision, canonicalApprovalId };
  const approvalReceipt = { id: approvalReceiptId, org_id: orgId, run_id: runId, task_id: run.task_id, decision_id: decisionId, receipt_type: "approval", status: "verified",
    verification_status: "passed", action_key: intent.action, target_system: "alegra", execution_authority_level: "L3", actor_kind: "human", actor_ref: actorId,
    integrity_hash: intent.payloadHash, desired_state: desired, source_receipt_system: "toro_signed_owner_approval", source_receipt_kind: "owner_approval_v1", source_receipt_ref: canonicalApprovalId };
  const flags = { org_id: orgId, knowledge_key: "toro_alegra_connector_v2", updated_at: revision, active: true,
    structured_content: { runtime_write_enabled: options.writerEnabled ?? true, native_mutation_enabled: options.writerEnabled ?? true, recovery_enabled: false } };
  const openPolicy = { org_id: orgId, knowledge_key: "synthetic-open-period", updated_at: revision, active: true,
    structured_content: { version: "TORO-ALEGRA-OPEN-PERIOD-v1", orgId, period: "2026-10", status: "open", validFrom: "2026-10-01T00:00:00Z", validUntil: "2026-11-01T00:00:00Z" } };
  const correctionPolicy = { org_id: orgId, knowledge_key: "synthetic-correction-policy", updated_at: revision, active: true,
    structured_content: { version: "TORO-ALEGRA-CORRECTION-POLICY-v1", orgId, status: "approved", mode: "manual_reconciliation_no_repost", validFrom: "2026-10-01T00:00:00Z", validUntil: "2026-11-01T00:00:00Z" } };
  const row: Record<string, unknown> = { run, decision, approval_receipt: approvalReceipt, prepared_receipt: null, final_receipt: null,
    connector: flags, open_period_policy: openPolicy, correction_policy: correctionPolicy, approval_revoked: false };
  const sessions: Array<{ principal: string; connects: number; closes: number; destroys: number }> = [];
  const configs: Record<string, unknown>[] = [];
  const queries: Array<{ principal: string; sql: string; values: unknown[] }> = [];
  const rpcNames: string[] = [], secretNames: string[] = [];
  const requests: Array<{ method: string; path: string; authenticated: boolean; body: unknown }> = [];
  let contextReads = 0, beforeContextRead: ((count: number) => void) | undefined;

  function markPrepared(admittedAt: string, leaseExpiresAt: string) {
    Object.assign(run, { status: "running", attempt_count: 1, fencing_token: 1, lease_owner: workerId, lease_expires_at: leaseExpiresAt });
    Object.assign(metadata, { approvalBindingState: "admitted", preparedReceiptId });
    row.prepared_receipt = { ...approvalReceipt, id: preparedReceiptId, receipt_type: "execution", status: "prepared", verification_status: "pending",
      desired_state: { ...desired, approvalReceiptId }, executed_state: { phase: "before_provider_dispatch", providerEffect: false, fencingToken: 1, admittedAt },
      source_receipt_system: "toro_control_plane", source_receipt_kind: "alegra_l3_dispatch_admission", source_receipt_ref: canonicalApprovalId };
  }
  class Client {
    session: typeof sessions[number];
    connection = { stream: { encrypted: true, authorized: true,
      getPeerCertificate: () => ({ subjectaltname: "DNS:db.abtyrbqlqbsastmridzp.supabase.co" }),
      destroy: () => { this.session.destroys++; } } };
    constructor(config: Record<string, unknown>) { configs.push(config); this.session = { principal: String(config.user), connects: 0, closes: 0, destroys: 0 }; sessions.push(this.session); }
    on() { return this; }
    async connect() { this.session.connects++; }
    async end() { this.session.closes++; }
    async query(sql: string, values: unknown[]) {
      const principal = this.session.principal;
      queries.push({ principal, sql, values: structuredClone(values) });
      if (sql.includes("current_user")) return { rows: [{ principal, login_principal: principal, database: "postgres" }] };
      if (principal === "toro_alegra_writer_reader_v1") {
        if (sql.includes("alegra-canonical-flags-v1") && values[0] === orgId) return { rows: [structuredClone(flags)] };
        if (sql.includes("alegra-canonical-context-v1") && values[0] === orgId && values[1] === runId && values[2] === intent.payloadHash) {
          beforeContextRead?.(++contextReads);
          return { rows: [structuredClone(row)] };
        }
        throw new Error("SYNTHETIC_READER_QUERY_OUTSIDE_CONTRACT");
      }
      if (principal !== "toro_alegra_writer_v1" || values[0] !== orgId || values[1] !== runId) throw new Error("SYNTHETIC_WRITER_BINDING_INVALID");
      const name = /select public\.(toro_[a-z0-9_]+)\(/.exec(sql)?.[1];
      if (!name) throw new Error("SYNTHETIC_WRITER_QUERY_OUTSIDE_CONTRACT");
      rpcNames.push(name);
      if (name === "toro_admit_approved_alegra_execution_v1") {
        if (run.status !== "queued" || values[2] !== workerId || values[3] !== 0 || values[4] !== approvalReceiptId || values[5] !== approval.approvalId ||
            values[6] !== actorId || values[7] !== approval.approvedAt || values[8] !== approval.expiresAt || values[9] !== intent.payloadHash || values[10] !== approval.decisionRevision) throw new Error("SYNTHETIC_ADMISSION_INVALID");
        markPrepared(currentTime, "2026-10-24T06:21:00.000Z");
        return { rows: [{ result: { runId, fencingToken: 1, preparedReceiptId, leaseExpiresAt: run.lease_expires_at } }] };
      }
      if (name === "toro_heartbeat_alegra_execution_v1") {
        if (values[2] !== workerId || values[3] !== 1 || values[4] !== preparedReceiptId) throw new Error("SYNTHETIC_HEARTBEAT_INVALID");
        return { rows: [{ result: { runId, fencingToken: 1, preparedReceiptId, leaseExpiresAt: run.lease_expires_at } }] };
      }
      if (name === "toro_finalize_alegra_execution_v1") {
        if (values[2] !== workerId || values[3] !== 1 || values[4] !== preparedReceiptId) throw new Error("SYNTHETIC_FINALIZE_INVALID");
        const receipt = values[6] as Record<string, unknown>, verified = values[5] === "verified";
        Object.assign(run, { status: verified ? "succeeded" : "blocked", verification_status: verified ? "passed" : "partial" });
        Object.assign(metadata, { finalReceiptId, approvalBindingState: "finalized" });
        row.final_receipt = { ...approvalReceipt, id: finalReceiptId, receipt_type: "execution", status: verified ? "verified" : "blocked", verification_status: run.verification_status,
          source_receipt_system: "alegra", source_receipt_kind: "writer_v3", supersedes_receipt_id: preparedReceiptId, observed_after: receipt.observed_after };
        return { rows: [{ result: { runId, finalReceiptId, runStatus: run.status, verificationStatus: run.verification_status, replayed: false } }] };
      }
      if (name === "toro_recover_expired_alegra_execution_v1") {
        if (values[2] !== recoveryWorkerId || values[3] !== 1 || values[4] !== preparedReceiptId) throw new Error("SYNTHETIC_RECOVERY_INVALID");
        Object.assign(run, { status: "blocked", verification_status: "partial", fencing_token: 2 });
        Object.assign(metadata, { finalReceiptId: recoveryReceiptId, approvalBindingState: "recovery_blocked" });
        return { rows: [{ result: { runId, finalReceiptId: recoveryReceiptId, fencingToken: 2, runStatus: "blocked", verificationStatus: "partial", providerState: "PROVIDER_STATE_UNKNOWN", replayed: false } }] };
      }
      throw new Error("SYNTHETIC_RPC_NOT_ALLOWED");
    }
  }
  async function fetchImpl(url: string, init: RequestInit) {
    const path = new URL(url).pathname.replace("/api/v1", "");
    requests.push({ method: init.method!, path, authenticated: new Headers(init.headers).has("authorization"), body: init.body ? JSON.parse(String(init.body)) : null });
    let data: unknown;
    if (path === "/company") data = { identification: "3101354441", currency: { code: "CRC" }, applicationVersion: "costaRica", decimalPrecision: "2" };
    else if (path === "/contacts/42") data = { id: "42", identification: { number: "synthetic-issuer" }, type: ["provider"], status: "active" };
    else if (path === "/categories/51") data = { id: "51", type: "expense", status: "active" };
    else if (path === "/cost-centers/7") data = { id: "7", status: "active" };
    else if (path === "/taxes/3") data = { id: "3", percentage: "13", status: "active" };
    else if (path === "/bills" && init.method === "GET") data = { metadata: { total: 0 }, data: [] };
    else if (path === "/bills" && init.method === "POST") data = { id: "99" };
    else if (path === "/bills/99") data = { id: "99", date: "2026-10-24", dueDate: "2026-10-30", provider: { id: "42" }, numberTemplate: { number: "synthetic-invoice" }, observations: intent.idempotencyKey,
      status: "open", total: 113, totalPaid: 0, balance: 113, retentions: [], payments: [], currency: { code: "CRC" }, costCenter: { id: "7" },
      purchases: { items: [], categories: [{ id: "51", price: 100, quantity: 1, discount: 0, tax: [{ id: "3", percentage: "13" }] }] } };
    else throw new Error("SYNTHETIC_HTTP_OUTSIDE_CONTRACT");
    return new Response(JSON.stringify(data), { status: init.method === "POST" ? 201 : 200 });
  }
  async function readSecret(name: string) {
    secretNames.push(name);
    if (name === "alegra-api.secret") return JSON.stringify({ email: "synthetic@example.invalid", token: "SYNTHETIC_TOKEN_NEVER_REAL" });
    if (name === "alegra-writer-postgres.secret" || name === "alegra-writer-reader-postgres.secret") return "SYNTHETIC_DATABASE_PASSWORD_NEVER_REAL";
    throw new Error("SYNTHETIC_SECRET_OUTSIDE_CONTRACT");
  }
  const hostOptions = { target: { orgId, runId, payloadHash: intent.payloadHash }, workerId, recoveryWorkerId, Client,
    ca: readFileSync("src/lib/supabase/fixtures/supabase-prod-ca-2021.crt", "utf8"), readSecret, now: () => currentTime, fetchImpl };
  return { hostOptions, intent, approval, binding, row, run, decision, approvalReceipt, metadata, flags, openPolicy, correctionPolicy, envelope,
    sessions, configs, queries, rpcNames, secretNames, requests, preparedReceiptId, finalReceiptId, recoveryReceiptId,
    beforeContextRead(callback: (count: number) => void) { beforeContextRead = callback; },
    prepareExpiredRecovery() {
      markPrepared("2026-10-24T06:16:00.000Z", "2026-10-24T06:19:00.000Z");
      currentTime = "2026-10-24T07:00:00.000Z";
      Object.assign(flags.structured_content, { runtime_write_enabled: false, native_mutation_enabled: false, recovery_enabled: true });
    },
  };
}
