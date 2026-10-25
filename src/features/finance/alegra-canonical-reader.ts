import "server-only";
import { isDeepStrictEqual } from "node:util";
import type { AlegraCallerContext } from "./alegra-writer-control-plane";
import { prepareAlegraWriteIntent, validateAlegraWriteApproval, type AlegraWriteApproval, type AlegraWriteIntent, type AlegraWriteIntentInput } from "./alegra-writer-contract";
import { prepareNativeAlegraPurchaseBody, type AlegraNativeBinding, type NativePurchaseBody } from "./alegra-native-purchase-transport";
import { evaluateAlegraDuplicatePreflight, type AlegraDuplicateCandidate, type AlegraDuplicateSourceState } from "./alegra-writer-dedupe";
import { normalizeToroWorkerRun } from "../control-plane/worker-runtime";
import type { AlegraWriterReceipt } from "./alegra-writer-executor";

export const ALEGRA_CANONICAL_CONTEXT_VERSION = "TORO-ALEGRA-WRITER-CONTEXT-v1";
export type CanonicalAlegraReaderTarget = { orgId: string; runId: string; payloadHash: string };
export type CanonicalAlegraReaderQuery = (sql: string, values: unknown[]) => Promise<{ rows: Array<Record<string, unknown>> }>;
export type CanonicalAlegraReaderFlags = { writerEnabled: boolean; nativeMutationEnabled: boolean; recoveryEnabled: boolean };
export type CanonicalAlegraReaderInput = { target: CanonicalAlegraReaderTarget; query: CanonicalAlegraReaderQuery; now: () => string };
export type CanonicalAlegraAdmissionRequest = { intent: AlegraWriteIntent; approval: AlegraWriteApproval };
export type CanonicalAlegraNativeRequest = { intent: AlegraWriteIntent; body: NativePurchaseBody; company: Record<string, unknown> };

export const ALEGRA_CANONICAL_READER_COLUMNS = Object.freeze({
  runs: ["id", "org_id", "task_id", "decision_id", "run_key", "idempotency_key", "correlation_id", "trace_id", "actor_kind", "actor_ref", "dot_ref", "agent_ref", "action_key", "target_system", "execution_authority_level", "business_risk", "status", "verification_status", "attempt_count", "max_attempts", "lease_owner", "fencing_token", "lease_expires_at", "safe_metadata"],
  decisions: ["id", "org_id", "status", "decision_value", "processed_at", "updated_at", "decision_key", "program_key", "instruction", "source_system", "source_record_id", "source_ref", "superseded_by"],
  receipts: ["id", "org_id", "run_id", "task_id", "decision_id", "receipt_type", "status", "verification_status", "action_key", "target_system", "execution_authority_level", "actor_kind", "actor_ref", "integrity_hash", "desired_state", "executed_state", "observed_after", "source_receipt_system", "source_receipt_kind", "source_receipt_ref", "supersedes_receipt_id"],
  knowledge: ["org_id", "knowledge_key", "structured_content", "updated_at", "active"],
} as const);

// Every identifier below is a module constant; no caller value becomes SQL text.
const jsonRow = (alias: string, columns: readonly string[], nullable?: string) => {
  const value = `jsonb_build_object(${columns.map(column => `'${column}',${alias}.${column}`).join(",")})`;
  return nullable ? `case when ${alias}.${nullable} is null then null else ${value} end` : value;
};
const knowledgeRow = (alias: string) => jsonRow(alias, ALEGRA_CANONICAL_READER_COLUMNS.knowledge, "knowledge_key");
export const ALEGRA_CANONICAL_READER_SELECTS = Object.freeze({
  identity: "select current_user as principal, session_user as login_principal, current_database() as database",
  flags: `select /* alegra-canonical-flags-v1 */ org_id,knowledge_key,structured_content,updated_at,active
from operations.knowledge_items where org_id=$1::uuid and knowledge_key='toro_alegra_connector_v2' limit 2`,
  context: `select /* alegra-canonical-context-v1 */
${jsonRow("r", ALEGRA_CANONICAL_READER_COLUMNS.runs)} as run,
${jsonRow("d", ALEGRA_CANONICAL_READER_COLUMNS.decisions, "id")} as decision,
${jsonRow("a", ALEGRA_CANONICAL_READER_COLUMNS.receipts, "id")} as approval_receipt,
${jsonRow("p", ALEGRA_CANONICAL_READER_COLUMNS.receipts, "id")} as prepared_receipt,
${jsonRow("f", ALEGRA_CANONICAL_READER_COLUMNS.receipts, "id")} as final_receipt,
${knowledgeRow("k")} as connector,${knowledgeRow("op")} as open_period_policy,${knowledgeRow("cp")} as correction_policy,
exists(select 1 from public.toro_execution_receipts revoked where revoked.org_id=r.org_id and revoked.run_id=r.id
  and revoked.receipt_type='approval' and revoked.status='denied' and revoked.supersedes_receipt_id=a.id) as approval_revoked
from public.toro_execution_runs r
left join operations.executive_decisions d on d.org_id=r.org_id and d.id=r.decision_id
left join public.toro_execution_receipts a on a.org_id=r.org_id and a.run_id=r.id and a.id::text=r.safe_metadata->>'approvalReceiptId'
left join public.toro_execution_receipts p on p.org_id=r.org_id and p.run_id=r.id and p.id::text=r.safe_metadata->>'preparedReceiptId'
left join public.toro_execution_receipts f on f.org_id=r.org_id and f.run_id=r.id and f.id::text=r.safe_metadata->>'finalReceiptId'
left join operations.knowledge_items k on k.org_id=r.org_id and k.knowledge_key='toro_alegra_connector_v2'
left join operations.knowledge_items op on op.org_id=r.org_id and op.knowledge_key=r.safe_metadata#>>'{alegraWriterContextV1,policy,openPeriod,knowledgeKey}'
left join operations.knowledge_items cp on cp.org_id=r.org_id and cp.knowledge_key=r.safe_metadata#>>'{alegraWriterContextV1,policy,correctionPolicy,knowledgeKey}'
where r.org_id=$1::uuid and r.id=$2::uuid and r.safe_metadata->>'payloadHash'=$3::text limit 2`,
});

const readerPrincipal = "toro_alegra_writer_reader_v1";
const organization = "595801ce-2895-4d91-81ae-e8d1d5cc8593";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const disabled = (): CanonicalAlegraReaderFlags => ({ writerEnabled: false, nativeMutationEnabled: false, recoveryEnabled: false });
type Row = Record<string, unknown>;
function object(value: unknown): Row {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("ALEGRA_CANONICAL_MATERIAL_INVALID");
  return value as Row;
}
function text(value: unknown): string { return typeof value === "string" ? value : ""; }
// PostgreSQL timestamps retain microseconds. Date.parse truncates fractional
// digits after milliseconds and cannot compare decision/policy revisions.
function timestampMicros(value: unknown): bigint | null {
  if (typeof value !== "string") return null;
  const match = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d{1,6}))?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match) return null;
  const local = Date.parse(match[1] + "Z");
  if (!Number.isFinite(local) || new Date(local).toISOString().slice(0, 19) !== match[1]) return null;
  const zone = match[3];
  const hours = zone === "Z" ? 0 : Number(zone.slice(1, 3));
  const minutes = zone === "Z" ? 0 : Number(zone.slice(4, 6));
  if (hours > 23 || minutes > 59) return null;
  const offset = (hours * 60 + minutes) * (zone[0] === "-" ? -1 : 1);
  return BigInt(local) * BigInt(1000) + BigInt((match[2] ?? "").padEnd(6, "0")) - BigInt(offset) * BigInt(60_000_000);
}
function date(value: unknown): number {
  const parsed = timestampMicros(value);
  return parsed === null ? Number.NaN : Number(parsed) / 1000;
}
function sameTime(a: unknown, b: unknown): boolean { const parsed = timestampMicros(a); return parsed !== null && parsed === timestampMicros(b); }
function tax(value: unknown): string { return (typeof value === "number" ? String(value) : text(value)).replace(/[\s-]/g, "").toLowerCase(); }
function assert(condition: unknown): asserts condition { if (!condition) throw new Error("ALEGRA_CANONICAL_MATERIAL_INVALID"); }
function flagsFrom(raw: unknown, orgId: string): CanonicalAlegraReaderFlags {
  const row = object(raw);
  assert(row.org_id === orgId && row.knowledge_key === "toro_alegra_connector_v2" && row.active === true);
  const content = object(row.structured_content);
  // Only runtime_write_enabled already exists. The other two keys are an
  // explicit proposed contract; absent/unknown/string values remain OFF.
  return { writerEnabled: content.runtime_write_enabled === true, nativeMutationEnabled: content.native_mutation_enabled === true, recoveryEnabled: content.recovery_enabled === true };
}

/**
 * NEWCONTRACT, not an assertion that any producer/row/policy/role exists.
 * safe_metadata.alegraWriterContextV1 must be saved on a future fresh run
 * BEFORE approval. The L3 trigger preserves its extra metadata thereafter.
 * policy refs are {knowledgeKey,revision}; openPeriod also names YYYY-MM.
 * Both refs resolve live knowledge_items in this same SELECT snapshot.
 * Open-period structured_content: version TORO-ALEGRA-OPEN-PERIOD-v1,
 * orgId,period,status=open,validFrom,validUntil. Correction policy:
 * version TORO-ALEGRA-CORRECTION-POLICY-v1,orgId,status=approved,
 * mode=manual_reconciliation_no_repost,validFrom,validUntil.
 * No policy boolean or stored clear=true conveys authority.
 */
function validatePolicy(raw: unknown, reference: unknown, orgId: string, clock: number, period?: string) {
  const row = object(raw), ref = object(reference), content = object(row.structured_content);
  assert(text(ref.knowledgeKey).trim() && row.knowledge_key === ref.knowledgeKey && row.org_id === orgId && row.active === true && content.orgId === orgId &&
    sameTime(row.updated_at, ref.revision) && date(ref.revision) <= clock && date(content.validFrom) <= clock && date(content.validUntil) > clock);
  if (period !== undefined) assert(content.version === "TORO-ALEGRA-OPEN-PERIOD-v1" && content.status === "open" && content.period === period && ref.period === period);
  else assert(content.version === "TORO-ALEGRA-CORRECTION-POLICY-v1" && content.status === "approved" && content.mode === "manual_reconciliation_no_repost");
}

function dedupeFrom(raw: unknown, intent: AlegraWriteIntent, clock: number) {
  const input = object(raw);
  assert(Array.isArray(input.candidates) && input.candidates.length <= 100 && Array.isArray(input.sourceStates) && input.sourceStates.length <= 3);
  const sources = ["toro", "alegra", "receipt"];
  const candidates = input.candidates.map(rawCandidate => {
    const candidate = object(rawCandidate);
    assert(sources.includes(text(candidate.source)) && text(candidate.sourceRef).trim() && ["exact", "probable"].includes(text(candidate.confidence)));
    for (const [key, value] of Object.entries(candidate)) assert(value === null || value === undefined || typeof value === "string" && value.length <= 4096 || key === "source");
    return candidate as unknown as AlegraDuplicateCandidate;
  });
  const rawStates = input.sourceStates.map(object);
  const sourceStates: AlegraDuplicateSourceState[] = sources.map(source => {
    const matching = rawStates.filter(state => state.source === source);
    const state = matching[0], checked = date(state?.checkedAt);
    const fresh = matching.length === 1 && state.coverage === "complete" && Number.isFinite(checked) && checked <= clock && clock - checked <= 60_000;
    return { source: source as AlegraDuplicateSourceState["source"], coverage: fresh ? "complete" : "unavailable", checkedAt: fresh ? text(state.checkedAt) : null };
  });
  return evaluateAlegraDuplicatePreflight({ intent, candidates, sourceStates, now: new Date(clock).toISOString(), maxAgeMs: 60_000 });
}

function material(raw: Row, target: Readonly<CanonicalAlegraReaderTarget>, checkedAt: string, recovery = false): AlegraCallerContext {
  const clock = date(checkedAt), clockMicros = timestampMicros(checkedAt); assert(Number.isFinite(clock) && clockMicros !== null);
  const rawRun = object(raw.run), metadata = object(rawRun.safe_metadata), envelope = object(metadata.alegraWriterContextV1);
  assert(JSON.stringify(envelope).length <= 65_536 && envelope.version === ALEGRA_CANONICAL_CONTEXT_VERSION);
  const input = object(envelope.intentInput);
  object(input.scope); object(input.evidence); object(input.payload);
  const intent = prepareAlegraWriteIntent(structuredClone(input) as unknown as AlegraWriteIntentInput);
  const binding = structuredClone(object(envelope.binding)) as AlegraNativeBinding;
  const run = normalizeToroWorkerRun(rawRun);
  assert(run && run.orgId === target.orgId && run.id === target.runId && run.idempotencyKey === intent.idempotencyKey && intent.scope.orgId === target.orgId &&
    intent.payloadHash === target.payloadHash && metadata.payloadHash === target.payloadHash && intent.validation.ready && intent.action === "alegra_create_purchase_bill" &&
    run.actionKey === intent.action && run.targetSystem === "alegra" && run.executionAuthorityLevel === "L3" && run.actorKind === "human" && run.maxAttempts === 1);
  prepareNativeAlegraPurchaseBody(intent, binding);
  assert(binding.applicationVersion === "costaRica" && tax(binding.receiverTaxId) === "3101354441");
  const decision = object(raw.decision), receipt = object(raw.approval_receipt), desired = object(receipt.desired_state);
  const approval: AlegraWriteApproval = { approvalId: text(desired.approvalId), approvalReceiptId: text(receipt.id), actorId: text(desired.actorId),
    approvedAt: text(desired.approvedAt), expiresAt: text(desired.expiresAt), decisionId: text(decision.id), decisionRevision: text(desired.decisionRevision), payloadHash: text(desired.payloadHash), state: "approved" };
  const originalApproved = timestampMicros(approval.approvedAt), originalExpires = timestampMicros(approval.expiresAt);
  // Validate the original envelope/TTL, then apply current-time authority with
  // exact microseconds here rather than the older millisecond contract helper.
  assert(validateAlegraWriteApproval(intent, approval, approval.approvedAt).ok &&
    originalApproved !== null && originalExpires !== null && originalExpires - originalApproved === BigInt(900_000_000) &&
    (recovery || originalApproved <= clockMicros && originalExpires > clockMicros) &&
    sameTime(approval.approvedAt, approval.decisionRevision) && decision.org_id === target.orgId && decision.id === run.decisionId);
  if (!recovery) assert(decision.status === "Respondida" && decision.decision_value === "approved" && decision.superseded_by === null &&
    decision.decision_key === approval.approvalId && decision.program_key === "toro_alegra_writer_v3" && decision.instruction === intent.action &&
    decision.source_system === "toro_control_plane" && decision.source_record_id === target.runId && decision.source_ref === target.payloadHash &&
    sameTime(decision.processed_at, approval.approvedAt) && sameTime(decision.updated_at, approval.decisionRevision));
  assert(receipt.org_id === target.orgId && receipt.run_id === target.runId && receipt.task_id === run.taskId && receipt.decision_id === run.decisionId &&
    receipt.id === metadata.approvalReceiptId && receipt.receipt_type === "approval" && receipt.status === "verified" && receipt.verification_status === "passed" &&
    receipt.action_key === intent.action && receipt.target_system === "alegra" && receipt.execution_authority_level === "L3" && receipt.actor_kind === "human" &&
    receipt.actor_ref === approval.actorId && run.actorRef === approval.actorId && receipt.integrity_hash === target.payloadHash &&
    receipt.source_receipt_system === "toro_signed_owner_approval" && receipt.source_receipt_kind === "owner_approval_v1" &&
    uuid.test(text(desired.canonicalApprovalId)) && receipt.source_receipt_ref === desired.canonicalApprovalId && metadata.canonicalApprovalId === desired.canonicalApprovalId && (recovery || raw.approval_revoked === false));
  assert(metadata.approvalId === approval.approvalId && metadata.approvalActorId === approval.actorId && sameTime(metadata.approvalApprovedAt, approval.approvedAt) &&
    sameTime(metadata.approvalExpiresAt, approval.expiresAt) && sameTime(metadata.decisionRevision, approval.decisionRevision) &&
    ["approved", "admitted", "finalized", "recovery_blocked"].includes(text(metadata.approvalBindingState)));
  const flags = flagsFrom(raw.connector, target.orgId);
  if (!recovery) {
    const policy = object(envelope.policy), period = text(intent.payload.period) || text(intent.payload.issueDate).slice(0, 7);
    assert(/^\d{4}-\d{2}$/.test(period));
    validatePolicy(raw.open_period_policy, policy.openPeriod, target.orgId, clock, period);
    validatePolicy(raw.correction_policy, policy.correctionPolicy, target.orgId, clock);
  }
  let preparedReceipt: AlegraCallerContext["preparedReceipt"] = null;
  if (metadata.preparedReceiptId !== undefined && metadata.preparedReceiptId !== null) {
    const prepared = object(raw.prepared_receipt), preparedDesired = object(prepared.desired_state), executed = object(prepared.executed_state);
    assert(prepared.id === metadata.preparedReceiptId && prepared.org_id === target.orgId && prepared.run_id === target.runId && prepared.task_id === run.taskId &&
      prepared.decision_id === run.decisionId && prepared.receipt_type === "execution" && prepared.status === "prepared" && prepared.verification_status === "pending" &&
      prepared.action_key === intent.action && prepared.target_system === "alegra" && prepared.execution_authority_level === "L3" &&
      prepared.integrity_hash === target.payloadHash && preparedDesired.payloadHash === target.payloadHash && preparedDesired.approvalReceiptId === approval.approvalReceiptId &&
      preparedDesired.canonicalApprovalId === desired.canonicalApprovalId && preparedDesired.approvalId === approval.approvalId && preparedDesired.actorId === approval.actorId &&
      sameTime(preparedDesired.approvedAt, approval.approvedAt) && sameTime(preparedDesired.expiresAt, approval.expiresAt) && sameTime(preparedDesired.decisionRevision, approval.decisionRevision) &&
      prepared.actor_kind === "human" && prepared.actor_ref === approval.actorId && prepared.source_receipt_system === "toro_control_plane" &&
      prepared.source_receipt_kind === "alegra_l3_dispatch_admission" && prepared.source_receipt_ref === desired.canonicalApprovalId &&
      executed.phase === "before_provider_dispatch" && executed.providerEffect === false && date(executed.admittedAt) <= clock &&
      date(executed.admittedAt) >= date(approval.approvedAt) && date(executed.admittedAt) < date(approval.expiresAt) && executed.fencingToken === run.fencingToken);
    preparedReceipt = { id: text(prepared.id), orgId: target.orgId, runId: target.runId, payloadHash: target.payloadHash };
  } else assert(raw.prepared_receipt === null);
  if (recovery) {
    assert(preparedReceipt && (run.status === "running" || run.status === "verifying") && run.verificationStatus === "pending" && run.attemptCount === 1 &&
      Number.isSafeInteger(run.fencingToken) && run.fencingToken >= 1 && run.fencingToken < Number.MAX_SAFE_INTEGER && run.leaseOwner?.trim() &&
      Number.isFinite(date(run.leaseExpiresAt)) && date(run.leaseExpiresAt) <= clock && metadata.approvalBindingState === "admitted" &&
      (metadata.finalReceiptId === undefined || metadata.finalReceiptId === null) && raw.final_receipt === null);
    // Recovery freezes an already admitted UNKNOWN effect. It carries only the
    // original approval snapshot; no current signing/create authority is implied.
    const duplicateDecision = evaluateAlegraDuplicatePreflight({ intent, candidates: [], sourceStates: [], now: checkedAt, maxAgeMs: 60_000 });
    return { flags: { writerEnabled: false, nativeMutationEnabled: false, recoveryEnabled: flags.recoveryEnabled }, run, intent, approval, binding,
      duplicateDecision, preparedReceipt, priorReceipt: null };
  }
  let priorReceipt: AlegraWriterReceipt | null = null;
  if (metadata.finalReceiptId !== undefined && metadata.finalReceiptId !== null) {
    const final = object(raw.final_receipt), observed = object(final.observed_after);
    assert(preparedReceipt && final.id === metadata.finalReceiptId && final.org_id === target.orgId && final.run_id === target.runId && final.task_id === run.taskId &&
      final.decision_id === run.decisionId && final.supersedes_receipt_id === preparedReceipt.id && final.receipt_type === "execution" &&
      final.action_key === intent.action && final.target_system === "alegra" && final.execution_authority_level === "L3" && final.integrity_hash === target.payloadHash &&
      final.source_receipt_system === "alegra" && final.source_receipt_kind === "writer_v3" &&
      observed.version === "TORO-ALEGRA-WRITER-RECEIPT-v1" && observed.idempotencyKey === intent.idempotencyKey && observed.payloadHash === target.payloadHash &&
      observed.approvalId === approval.approvalId && observed.actorId === approval.actorId && typeof observed.verified === "boolean" &&
      ["replayed_verified", "provider_created", "provider_ambiguous_recovered", "blocked", "failed"].includes(text(observed.executionState)) &&
      ["VERIFIED", "READBACK_MISMATCH", "NOT_ATTEMPTED", "PROVIDER_STATE_UNKNOWN"].includes(text(observed.verificationState)) &&
      Array.isArray(observed.reasons) && observed.reasons.every(reason => typeof reason === "string") && Number.isFinite(date(observed.createdAt)) &&
      (observed.nativeId === null || typeof observed.nativeId === "string") &&
      (observed.verified ? final.status === "verified" && final.verification_status === "passed" && observed.verificationState === "VERIFIED" : final.status === "blocked" && final.verification_status === "partial"));
    priorReceipt = { ...observed, durableReceiptId: text(final.id) } as AlegraWriterReceipt;
  } else assert(raw.final_receipt === null);
  return { flags, run, intent, approval, binding, duplicateDecision: dedupeFrom(envelope.dedupe, intent, clock), preparedReceipt, priorReceipt };
}

/**
 * Prepared SELECT-only reader over existing tables, using a separate principal.
 * The host must lease ONE verified TLS session exclusively for identity + read.
 * No principal/grant, credentials, context producer or runtime is created here.
 * A receipt plus live decision constructs an untrusted approval envelope; the
 * existing admission RPC still validates the private immutable signing ledger.
 */
export function createCanonicalAlegraReader(input: CanonicalAlegraReaderInput) {
  if (process.env.TORO_DEPLOYMENT_MODE !== "internal" || input.target?.orgId !== organization || !uuid.test(input.target?.runId ?? "") ||
      !/^[a-f0-9]{64}$/.test(input.target?.payloadHash ?? "") || typeof input.query !== "function" || typeof input.now !== "function") throw new Error("ALEGRA_CANONICAL_READER_BINDING_REQUIRED");
  const target = Object.freeze({ ...input.target });
  const { query, now: currentTime } = input;
  async function read(sql: string, values: unknown[]): Promise<Row | null> {
    try {
      const identity = await query(ALEGRA_CANONICAL_READER_SELECTS.identity, []);
      if (identity.rows.length !== 1 || identity.rows[0].principal !== readerPrincipal || identity.rows[0].login_principal !== readerPrincipal || identity.rows[0].database !== "postgres") return null;
      const result = await query(sql, values);
      return result.rows.length === 1 ? structuredClone(result.rows[0]) : null;
    } catch { return null; }
  }
  async function loadWithMode(recovery: boolean): Promise<AlegraCallerContext | null> {
    try {
      const row = await read(ALEGRA_CANONICAL_READER_SELECTS.context, [target.orgId, target.runId, target.payloadHash]);
      return row ? material(row, target, currentTime(), recovery) : null;
    } catch { return null; }
  }
  const load = () => loadWithMode(false);
  const enabled = (context: AlegraCallerContext) => context.flags?.writerEnabled === true && context.flags?.nativeMutationEnabled === true &&
    context.duplicateDecision.clear && context.duplicateDecision.state === "CLEAR";
  return Object.freeze({
    async readFlags(): Promise<CanonicalAlegraReaderFlags> {
      try {
        const row = await read(ALEGRA_CANONICAL_READER_SELECTS.flags, [target.orgId]);
        return row ? flagsFrom(row, target.orgId) : disabled();
      } catch { return disabled(); }
    },
    load,
    /** Only for the existing exact-target recovery RPC; never native create. */
    loadForRecovery: () => loadWithMode(true),
    async authorizeAdmission(request: CanonicalAlegraAdmissionRequest): Promise<boolean> {
      try {
        const captured = structuredClone(request), context = await load();
        return !!context && enabled(context) && isDeepStrictEqual(captured.intent, context.intent) && isDeepStrictEqual(captured.approval, context.approval);
      } catch { return false; }
    },
    async authorizeNativeCreate(request: CanonicalAlegraNativeRequest): Promise<boolean> {
      try {
        const captured = structuredClone(request), context = await load();
        if (!context || !enabled(context) || !isDeepStrictEqual(captured.intent, context.intent) ||
            !isDeepStrictEqual(captured.body, prepareNativeAlegraPurchaseBody(context.intent, context.binding))) return false;
        const company = object(captured.company), currency = object(company.currency);
        return tax(company.identification) === tax(context.binding.receiverTaxId) && currency.code === context.binding.mainCurrency &&
          company.applicationVersion === context.binding.applicationVersion && (company.decimalPrecision === "2" || company.decimalPrecision === 2);
      } catch { return false; }
    },
  });
}
