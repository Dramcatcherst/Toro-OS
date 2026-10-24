import { describe, expect, it } from "vitest";
import { createCanonicalAlegraReader, ALEGRA_CANONICAL_CONTEXT_VERSION, type CanonicalAlegraReaderQuery } from "./alegra-canonical-reader";
import { prepareAlegraWriteIntent } from "./alegra-writer-contract";
import { prepareNativeAlegraPurchaseBody } from "./alegra-native-purchase-transport";

// Entirely synthetic NEWCONTRACT fixture. No production row or approved document.
const org = "595801ce-2895-4d91-81ae-e8d1d5cc8593";
const runId = "11111111-1111-4111-8111-111111111111";
const decisionId = "22222222-2222-4222-8222-222222222222";
const approvalReceiptId = "33333333-3333-4333-8333-333333333333";
const signedId = "44444444-4444-4444-8444-444444444444";
const human = "55555555-5555-4555-8555-555555555555";
const now = "2026-10-24T06:20:00.000Z";
const revision = "2026-10-24T06:00:00.000Z";
function fixture() {
  const input = { scope: { tenantId: "fixture-tenant", orgId: org, legalEntityKey: "fixture-entity" },
    evidence: { sourceRefs: ["fixture:original"], evidenceHash: "fixture-source-hash" },
    payload: { targetType: "purchase_bill" as const, documentNumber: "fixture-bill", supplierNativeId: "42", issuerTaxId: "fixture-issuer", receiverTaxId: "3101354441",
      issueDate: "2026-10-24", dueDate: "2026-10-30", period: "2026-10", currency: "CRC", subtotal: "100.00", tax: "13.00", total: "113.00",
      accountNativeId: "51", costCenterNativeId: "7", purchaseTax: { nativeId: "3", percentage: "13" } } };
  const intent = prepareAlegraWriteIntent(input);
  const binding = { scope: input.scope, receiverTaxId: "3101354441", mainCurrency: "CRC", applicationVersion: "costaRica" };
  const approval = { approvalId: "fixture-approval", approvalReceiptId, actorId: human, approvedAt: "2026-10-24T06:15:00.000Z", expiresAt: "2026-10-24T06:30:00.000Z", decisionId,
    decisionRevision: "2026-10-24T06:15:00.000Z", payloadHash: intent.payloadHash, state: "approved" as const };
  const envelope = { version: ALEGRA_CANONICAL_CONTEXT_VERSION, intentInput: input, binding,
    dedupe: { candidates: [], sourceStates: ["toro", "alegra", "receipt"].map(source => ({ source, coverage: "complete", checkedAt: "2026-10-24T06:19:59.000Z" })) },
    policy: { openPeriod: { knowledgeKey: "fixture-open-period", revision, period: "2026-10" }, correctionPolicy: { knowledgeKey: "fixture-correction-policy", revision } } };
  const metadata: Record<string, unknown> = { payloadHash: intent.payloadHash, approvalBindingState: "approved", approvalReceiptId, canonicalApprovalId: signedId,
    approvalId: approval.approvalId, approvalActorId: human, approvalApprovedAt: approval.approvedAt, approvalExpiresAt: approval.expiresAt, decisionRevision: approval.decisionRevision,
    alegraWriterContextV1: envelope };
  const run = { id: runId, org_id: org, task_id: "66666666-6666-4666-8666-666666666666", decision_id: decisionId,
    run_key: "fixture-key", idempotency_key: intent.idempotencyKey, correlation_id: "fixture-correlation", trace_id: null, actor_kind: "human", actor_ref: human,
    dot_ref: null, agent_ref: null, action_key: "alegra_create_purchase_bill", target_system: "alegra", execution_authority_level: "L3", business_risk: "High", status: "queued",
    verification_status: "pending", attempt_count: 0, max_attempts: 1, lease_owner: null, fencing_token: 0, lease_expires_at: null as string | null, safe_metadata: metadata };
  const decision = { id: decisionId, org_id: org, status: "Respondida", decision_value: "approved", processed_at: approval.approvedAt, updated_at: approval.decisionRevision,
    decision_key: approval.approvalId, program_key: "toro_alegra_writer_v3", instruction: "alegra_create_purchase_bill", source_system: "toro_control_plane", source_record_id: runId,
    source_ref: intent.payloadHash, superseded_by: null };
  const desired = { approvalId: approval.approvalId, actorId: human, payloadHash: intent.payloadHash, approvedAt: approval.approvedAt, expiresAt: approval.expiresAt,
    decisionRevision: approval.decisionRevision, canonicalApprovalId: signedId };
  const approvalReceipt = { id: approvalReceiptId, org_id: org, run_id: runId, task_id: run.task_id, decision_id: decisionId, receipt_type: "approval", status: "verified",
    verification_status: "passed", action_key: run.action_key, target_system: "alegra", execution_authority_level: "L3", actor_kind: "human", actor_ref: human,
    integrity_hash: intent.payloadHash, desired_state: desired, source_receipt_system: "toro_signed_owner_approval", source_receipt_kind: "owner_approval_v1", source_receipt_ref: signedId };
  const flags = { org_id: org, knowledge_key: "toro_alegra_connector_v2", updated_at: revision, active: true,
    structured_content: { runtime_write_enabled: true, native_mutation_enabled: true, recovery_enabled: false } };
  const openPolicy = { org_id: org, knowledge_key: "fixture-open-period", updated_at: revision, active: true,
    structured_content: { version: "TORO-ALEGRA-OPEN-PERIOD-v1", orgId: org, period: "2026-10", status: "open", validFrom: "2026-10-01T00:00:00Z", validUntil: "2026-11-01T00:00:00Z" } };
  const correctionPolicy = { org_id: org, knowledge_key: "fixture-correction-policy", updated_at: revision, active: true,
    structured_content: { version: "TORO-ALEGRA-CORRECTION-POLICY-v1", orgId: org, status: "approved", mode: "manual_reconciliation_no_repost", validFrom: "2026-10-01T00:00:00Z", validUntil: "2026-11-01T00:00:00Z" } };
  const row: Record<string, unknown> = { run, decision, approval_receipt: approvalReceipt, prepared_receipt: null, final_receipt: null,
    connector: flags, open_period_policy: openPolicy, correction_policy: correctionPolicy, approval_revoked: false };
  const calls: Array<{ sql: string; values: unknown[] }> = [];
  let principal = "toro_alegra_writer_reader_v1", login = principal, database = "postgres";
  const query: CanonicalAlegraReaderQuery = async (sql, values) => {
    calls.push({ sql, values });
    if (sql.includes("current_user")) return { rows: [{ principal, login_principal: login, database }] };
    if (sql.includes("alegra-canonical-flags-v1")) return { rows: [structuredClone(flags)] };
    return { rows: [structuredClone(row)] };
  };
  const options = { target: { orgId: org, runId, payloadHash: intent.payloadHash }, query, now: () => now };
  return { intent, approval, binding, envelope, metadata, run, decision, approvalReceipt, flags, openPolicy, correctionPolicy, row, calls, query, options,
    identity(user: string, session = user, db = "postgres") { principal = user; login = session; database = db; } };
}

describe("prepared exact-target canonical Alegra reader", () => {
  it("reconstructs the NEWCONTRACT context from one read snapshot; receipt is only an approval envelope", async () => {
    const f = fixture(); const context = await createCanonicalAlegraReader(f.options).load();
    expect(context?.intent).toEqual(f.intent); expect(context?.approval).toEqual(f.approval);
    expect(context?.binding).toEqual(f.binding); expect(context?.run.id).toBe(runId);
    expect(context?.duplicateDecision).toMatchObject({ clear: true, state: "CLEAR" });
    expect(context?.preparedReceipt).toBeNull(); expect(context?.priorReceipt).toBeNull();
    expect(f.calls).toHaveLength(2);
    const read = f.calls[1]; expect(read.values).toEqual([org, runId, f.intent.payloadHash]);
    expect(read.sql).not.toContain("toro_alegra_l3_owner_approvals");
    for (const call of f.calls) { expect(call.sql.trimStart().toLowerCase()).toMatch(/^select\b/); expect(call.sql).not.toMatch(/\b(insert|update|delete|grant|set|begin|commit)\b/i); }
  });
  it("reads only flags without needing an intent envelope or a writer credential", async () => {
    const f = fixture(); delete f.metadata.alegraWriterContextV1;
    expect(await createCanonicalAlegraReader(f.options).readFlags()).toEqual({ writerEnabled: true, nativeMutationEnabled: true, recoveryEnabled: false });
    expect(f.calls).toHaveLength(2); expect(f.calls[1].values).toEqual([org]);
  });
  it.each([{}, { runtime_write_enabled: false }, { runtime_write_enabled: "true", native_mutation_enabled: true }])("treats unknown or nonboolean flags as OFF: %j", async content => {
    const f = fixture(); Object.assign(f.flags, { structured_content: content });
    expect((await createCanonicalAlegraReader(f.options).readFlags()).writerEnabled).toBe(false);
  });
  it("returns a valid OFF context and denies both authorizers", async () => {
    const f = fixture(); f.flags.structured_content.runtime_write_enabled = false;
    const reader = createCanonicalAlegraReader(f.options);
    expect((await reader.load())?.flags?.writerEnabled).toBe(false);
    expect(await reader.authorizeAdmission({ intent: f.intent, approval: f.approval })).toBe(false);
    expect(await reader.authorizeNativeCreate({ intent: f.intent, body: prepareNativeAlegraPurchaseBody(f.intent, f.binding), company: {} })).toBe(false);
  });
  it.each([false, undefined])("denies inactive or unknown-active connector/policy records: %s", async active => {
    for (const key of ["flags", "openPolicy", "correctionPolicy"] as const) {
      const f = fixture(); Object.assign(f[key], { active });
      const reader = createCanonicalAlegraReader(f.options);
      expect(await reader.load()).toBeNull();
      if (key === "flags") expect(await reader.readFlags()).toEqual({ writerEnabled: false, nativeMutationEnabled: false, recoveryEnabled: false });
    }
  });
  it.each(["missing-envelope", "old-version", "hash", "scope", "receiver", "idempotency", "run", "org", "decision-revoked", "decision-revision", "decision-superseded", "expired", "future", "receipt-hash", "receipt-actor", "revocation-receipt"])('denies incoherent canonical material: %s', async problem => {
    const f = fixture();
    if (problem === "missing-envelope") delete f.metadata.alegraWriterContextV1;
    if (problem === "old-version") f.envelope.version = "unknown";
    if (problem === "hash") f.envelope.intentInput.payload.total = "999.00";
    if (problem === "scope") f.envelope.binding.scope.orgId = "other-org";
    if (problem === "receiver") f.envelope.binding.receiverTaxId = "wrong-entity";
    if (problem === "idempotency") f.run.idempotency_key = "other";
    if (problem === "run") f.run.id = "other-run";
    if (problem === "org") f.run.org_id = "other-org";
    if (problem === "decision-revoked") f.decision.decision_value = "rejected";
    if (problem === "decision-revision") f.decision.updated_at = "2026-10-24T06:16:00Z";
    if (problem === "decision-superseded") Object.assign(f.decision, { superseded_by: "other" });
    if (problem === "expired") f.options.now = () => "2026-10-24T06:31:00Z";
    if (problem === "future") f.options.now = () => "2026-10-24T06:14:00Z";
    if (problem === "receipt-hash") f.approvalReceipt.integrity_hash = "b".repeat(64);
    if (problem === "receipt-actor") f.approvalReceipt.actor_ref = "other-human";
    if (problem === "revocation-receipt") f.row.approval_revoked = true;
    expect(await createCanonicalAlegraReader(f.options).load()).toBeNull();
  });
  it.each(["absent", "partial", "stale", "future", "duplicate-source"])('never trusts a stored clear=true when dedupe coverage is %s', async problem => {
    const f = fixture(); Object.assign(f.envelope.dedupe, { clear: true, state: "CLEAR" });
    if (problem === "absent") f.envelope.dedupe.sourceStates = [];
    if (problem === "partial") f.envelope.dedupe.sourceStates[1].coverage = "partial";
    if (problem === "stale") f.envelope.dedupe.sourceStates[1].checkedAt = "2026-10-24T06:00:00Z";
    if (problem === "future") f.envelope.dedupe.sourceStates[1].checkedAt = "2026-10-24T06:21:00Z";
    if (problem === "duplicate-source") f.envelope.dedupe.sourceStates[1].source = "toro";
    const reader = createCanonicalAlegraReader(f.options);
    const context = await reader.load(); expect(context?.duplicateDecision.clear).toBe(false);
    expect(await reader.authorizeAdmission({ intent: f.intent, approval: f.approval })).toBe(false);
  });
  it("recomputes exact duplicate matches rather than accepting a stored decision", async () => {
    const f = fixture(); Object.assign(f.envelope.dedupe, { clear: true, candidates: [{ source: "receipt", sourceRef: "fixture:existing", confidence: "exact", idempotencyKey: f.intent.idempotencyKey }] });
    expect((await createCanonicalAlegraReader(f.options).load())?.duplicateDecision.state).toBe("DUPLICATE_EXACT");
  });
  it.each(["missing", "revision", "closed", "expired", "wrong-period", "unapproved-correction", "wrong-mode"])('denies missing or inconsistent live policy references: %s', async problem => {
    const f = fixture();
    if (problem === "missing") f.row.open_period_policy = null;
    if (problem === "revision") f.openPolicy.updated_at = "2026-10-24T06:01:00Z";
    if (problem === "closed") f.openPolicy.structured_content.status = "closed";
    if (problem === "expired") f.correctionPolicy.structured_content.validUntil = "2026-10-24T06:19:00Z";
    if (problem === "wrong-period") f.openPolicy.structured_content.period = "2026-09";
    if (problem === "unapproved-correction") f.correctionPolicy.structured_content.status = "draft";
    if (problem === "wrong-mode") f.correctionPolicy.structured_content.mode = "automatic_repost";
    expect(await createCanonicalAlegraReader(f.options).load()).toBeNull();
  });
  it.each([["service_role", "service_role"], ["postgres", "postgres"], ["toro_alegra_writer_reader_v1", "postgres"], ["toro_alegra_writer_v1", "toro_alegra_writer_v1"]])("rejects principal/session %s/%s before a domain query", async (principal, session) => {
    const f = fixture(); f.identity(principal, session);
    const reader = createCanonicalAlegraReader(f.options);
    expect(await reader.load()).toBeNull(); expect(f.calls).toHaveLength(1);
    expect(await reader.readFlags()).toEqual({writerEnabled:false,nativeMutationEnabled:false,recoveryEnabled:false}); expect(f.calls).toHaveLength(2);
  });
  it("does not retry a failed identity/domain read or reveal raw failures", async () => {
    for (const failedRead of [1, 2]) {
      const f = fixture(); let calls = 0;
      f.options.query = async (sql, values) => { if (++calls === failedRead) throw new Error("fixture-private-connection-error"); return f.query(sql, values); };
      expect(await createCanonicalAlegraReader(f.options).load()).toBeNull(); expect(calls).toBe(failedRead);
    }
  });
  it("denies duplicate canonical rows rather than choosing one", async () => {
    const f = fixture(); f.options.query = async (sql, values) => sql.includes("current_user") ? f.query(sql, values) : { rows: [f.row, f.row] };
    expect(await createCanonicalAlegraReader(f.options).load()).toBeNull();
  });
  it("authorizers execute fresh reads, reject revocation and compare the actual request", async () => {
    const f = fixture(); const reader = createCanonicalAlegraReader(f.options);
    expect(await reader.authorizeAdmission({ intent: f.intent, approval: f.approval })).toBe(true);
    const company = { identification: "3-101-354441", currency: { code: "CRC" }, applicationVersion: "costaRica", decimalPrecision: "2" };
    const body = prepareNativeAlegraPurchaseBody(f.intent, f.binding);
    expect(await reader.authorizeNativeCreate({ intent: f.intent, body, company })).toBe(true);
    expect(await reader.authorizeNativeCreate({ intent: f.intent, body: { ...body, provider: 999 }, company })).toBe(false);
    expect(await reader.authorizeAdmission({ intent: f.intent, approval: { ...f.approval, actorId: "other" } })).toBe(false);
    f.decision.decision_value = "rejected";
    expect(await reader.authorizeAdmission({ intent: f.intent, approval: f.approval })).toBe(false);
    expect(await reader.authorizeNativeCreate({ intent: f.intent, body, company })).toBe(false);
    expect(f.calls).toHaveLength(12);
  });
  it("captures the host query/target at construction and rejects invalid target binding", async () => {
    const f = fixture(); const reader = createCanonicalAlegraReader(f.options);
    f.options.target.payloadHash = "b".repeat(64); f.options.query = async () => { throw new Error("replacement"); };
    expect((await reader.load())?.intent.payloadHash).toBe(f.intent.payloadHash);
    expect(() => createCanonicalAlegraReader({ ...f.options, target: { ...f.options.target, runId: "';select secret" } })).toThrow("ALEGRA_CANONICAL_READER_BINDING_REQUIRED");
  });
  function preparedFixture() {
    const f = fixture(), id = "77777777-7777-4777-8777-777777777777";
    Object.assign(f.run, { status: "running", attempt_count: 1, fencing_token: 1, lease_owner: "fixture-worker", lease_expires_at: "2026-10-24T06:21:00Z" });
    Object.assign(f.metadata, { approvalBindingState: "admitted", preparedReceiptId: id });
    const prepared = { ...f.approvalReceipt, id, receipt_type: "execution", status: "prepared", verification_status: "pending",
      desired_state: { ...f.approvalReceipt.desired_state, approvalReceiptId }, executed_state: { fencingToken: 1, phase: "before_provider_dispatch", providerEffect: false, admittedAt: "2026-10-24T06:16:00Z" },
      source_receipt_system: "toro_control_plane", source_receipt_kind: "alegra_l3_dispatch_admission" };
    f.row.prepared_receipt = prepared;
    return { ...f, prepared };
  }
  it("loads only the exact prepared marker and a chained durable final receipt", async () => {
    const f = preparedFixture(), id = "88888888-8888-4888-8888-888888888888";
    const reader = createCanonicalAlegraReader(f.options);
    expect((await reader.load())?.preparedReceipt).toEqual({ id: f.prepared.id, orgId: org, runId, payloadHash: f.intent.payloadHash });
    const observed = { version: "TORO-ALEGRA-WRITER-RECEIPT-v1", idempotencyKey: f.intent.idempotencyKey, payloadHash: f.intent.payloadHash,
      approvalId: f.approval.approvalId, actorId: human, nativeId: "99", executionState: "provider_created", verificationState: "VERIFIED", verified: true, reasons: [], createdAt: now };
    Object.assign(f.metadata, { finalReceiptId: id, approvalBindingState: "finalized" });
    f.row.final_receipt = { ...f.approvalReceipt, id, receipt_type: "execution", source_receipt_system: "alegra", source_receipt_kind: "writer_v3", supersedes_receipt_id: f.prepared.id, observed_after: observed };
    expect((await reader.load())?.priorReceipt).toEqual({ ...observed, durableReceiptId: id });
  });
  it.each(["missing", "org", "hash", "fence", "source"])('rejects an incoherent prepared marker: %s', async problem => {
    const f = preparedFixture();
    if (problem === "missing") f.row.prepared_receipt = null;
    if (problem === "org") f.prepared.org_id = "other-org";
    if (problem === "hash") f.prepared.integrity_hash = "b".repeat(64);
    if (problem === "fence") f.prepared.executed_state.fencingToken = 2;
    if (problem === "source") f.prepared.source_receipt_kind = "other";
    expect(await createCanonicalAlegraReader(f.options).load()).toBeNull();
  });
  it.each(["expired", "revoked", "closed-period", "missing-policies", "stale-dedupe"])('loads only the admitted historical snapshot for late recovery despite %s', async problem => {
    const f = preparedFixture(); f.flags.structured_content.recovery_enabled = true;
    f.run.lease_expires_at = "2026-10-24T06:19:00Z";
    if (problem === "expired") f.options.now = () => "2026-10-24T07:00:00Z";
    if (problem === "revoked") { f.decision.decision_value = "rejected"; f.row.approval_revoked = true; }
    if (problem === "closed-period") f.openPolicy.structured_content.status = "closed";
    if (problem === "missing-policies") { f.row.open_period_policy = null; f.row.correction_policy = null; }
    if (problem === "stale-dedupe") f.envelope.dedupe.sourceStates = [];
    const reader = createCanonicalAlegraReader(f.options), recovery = await reader.loadForRecovery();
    expect(recovery?.preparedReceipt?.id).toBe(f.prepared.id);
    expect(recovery?.flags).toEqual({ writerEnabled: false, nativeMutationEnabled: false, recoveryEnabled: true });
    expect(recovery?.duplicateDecision).toMatchObject({ clear: false, state: "COVERAGE_INSUFFICIENT" });
    if (problem !== "stale-dedupe") expect(await reader.load()).toBeNull();
    else expect((await reader.load())?.duplicateDecision.clear).toBe(false);
    expect(await reader.authorizeAdmission({ intent: f.intent, approval: f.approval })).toBe(false);
    expect(await reader.authorizeNativeCreate({ intent: f.intent, body: prepareNativeAlegraPurchaseBody(f.intent, f.binding), company: {} })).toBe(false);
  });
  it.each(["queued", "unexpired", "attempt", "fence", "lease-owner", "decision-org", "decision-id", "marker-time", "marker-actor", "marker-original-revision", "marker-effect", "marker-source", "marker-approved-ttl"])('denies unsafe recovery material: %s', async problem => {
    const f = preparedFixture(); f.flags.structured_content.recovery_enabled = true; f.run.lease_expires_at = "2026-10-24T06:19:00Z";
    if (problem === "queued") f.run.status = "queued";
    if (problem === "unexpired") f.run.lease_expires_at = "2026-10-24T06:21:00Z";
    if (problem === "attempt") f.run.attempt_count = 0;
    if (problem === "fence") f.run.fencing_token = 0;
    if (problem === "lease-owner") Object.assign(f.run, { lease_owner: null });
    if (problem === "decision-org") f.decision.org_id = "other";
    if (problem === "decision-id") f.decision.id = "other";
    if (problem === "marker-time") f.prepared.executed_state.admittedAt = "2026-10-24T06:21:00Z";
    if (problem === "marker-actor") f.prepared.desired_state.actorId = "other";
    if (problem === "marker-original-revision") f.prepared.desired_state.decisionRevision = "2026-10-24T06:15:00.000001Z";
    if (problem === "marker-effect") f.prepared.executed_state.providerEffect = true;
    if (problem === "marker-source") f.prepared.source_receipt_ref = "other";
    if (problem === "marker-approved-ttl") {
      f.approvalReceipt.desired_state.expiresAt = "2026-10-24T06:31:00Z";
      f.metadata.approvalExpiresAt = f.approvalReceipt.desired_state.expiresAt;
      f.prepared.desired_state.expiresAt = f.approvalReceipt.desired_state.expiresAt;
    }
    expect(await createCanonicalAlegraReader(f.options).loadForRecovery()).toBeNull();
  });
  it.each(["decision", "policy", "metadata"])('rejects changed revision microseconds within one millisecond: %s', async problem => {
    const f = fixture();
    if (problem === "decision") f.decision.updated_at = "2026-10-24T06:15:00.000001Z";
    if (problem === "policy") { f.envelope.policy.openPeriod.revision = "2026-10-24T06:00:00.000001Z"; f.openPolicy.updated_at = "2026-10-24T06:00:00.000002Z"; }
    if (problem === "metadata") f.metadata.decisionRevision = "2026-10-24T06:15:00.000001Z";
    expect(await createCanonicalAlegraReader(f.options).load()).toBeNull();
  });
  it("preserves six fractional digits when comparing the same instant with a UTC offset", async () => {
    const f = fixture();
    Object.assign(f.approvalReceipt.desired_state, { approvedAt: "2026-10-24T06:15:00.000001Z", decisionRevision: "2026-10-24T06:15:00.000001Z", expiresAt: "2026-10-24T06:30:00.000001Z" });
    Object.assign(f.metadata, { approvalApprovedAt: "2026-10-24T08:15:00.000001+02:00", decisionRevision: "2026-10-24T06:15:00.000001Z", approvalExpiresAt: "2026-10-24T06:30:00.000001Z" });
    f.decision.processed_at = "2026-10-24T08:15:00.000001+02:00"; f.decision.updated_at = f.decision.processed_at;
    expect((await createCanonicalAlegraReader(f.options).load())?.approval.decisionRevision).toBe("2026-10-24T06:15:00.000001Z");
  });
  it.each(["before-approval", "before-expiry"])('uses exact microsecond bounds at %s', async boundary => {
    const f = fixture(), approvedAt = "2026-10-24T06:15:00.000002Z", expiresAt = "2026-10-24T06:30:00.000002Z";
    Object.assign(f.approvalReceipt.desired_state, { approvedAt, expiresAt, decisionRevision: approvedAt });
    Object.assign(f.metadata, { approvalApprovedAt: approvedAt, approvalExpiresAt: expiresAt, decisionRevision: approvedAt });
    f.decision.processed_at = approvedAt; f.decision.updated_at = approvedAt;
    f.options.now = () => boundary === "before-approval" ? "2026-10-24T06:15:00.000001Z" : "2026-10-24T06:30:00.000001Z";
    const context = await createCanonicalAlegraReader(f.options).load();
    if (boundary === "before-approval") expect(context).toBeNull();
    else expect(context?.approval.expiresAt).toBe(expiresAt);
  });
});
