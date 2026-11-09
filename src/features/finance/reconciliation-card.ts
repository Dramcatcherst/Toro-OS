export const FINANCIAL_RECONCILIATION_CARD_VERSION = "TORO-FINANCIAL-RECONCILIATION-CARD-v1";

export type FinancialEvidenceKind =
  | "reservation" | "service"
  | "collection" | "advance" | "refund" | "chargeback"
  | "document" | "credit_note"
  | "settlement" | "commission" | "withholding" | "fx_adjustment"
  | "bank_entry";
export type FinancialEvidenceState = "reported" | "verified" | "unknown" | "reopened";
export type FinancialStageKey = "service" | "collection" | "document" | "settlement" | "bank";
export type FinancialStageState = "verified" | "reported" | "missing" | "unknown" | "conflict";

export type FinancialEvidenceRecord = {
  recordId: string;
  kind: FinancialEvidenceKind;
  state: FinancialEvidenceState;
  companyId: string;
  currency: string;
  amountMinor: number | null;
  occurredAt: string;
  sourceUpdatedAt: string;
  sourceSystem: string;
  sourceRef: string;
  /** Stable record IDs only. Matching amounts never create a link. */
  links: string[];
};

export type FinancialReconciliationInput = {
  caseId: string;
  companyId: string;
  currency: string;
  observedAt: string;
  records: FinancialEvidenceRecord[];
};

export type FinancialReconciliationIssue = {
  code: "INVALID_RECORD" | "SCOPE_CONFLICT" | "DUPLICATE_SOURCE" | "MISSING_LINK" | "STALE_SOURCE" | "UNKNOWN_AMOUNT" | "REOPENED";
  recordId: string | null;
};

export type FinancialReconciliationCard = {
  version: typeof FINANCIAL_RECONCILIATION_CARD_VERSION;
  caseId: string;
  companyId: string;
  currency: string;
  observedAt: string;
  stages: Array<{ key: FinancialStageKey; state: FinancialStageState; recordIds: string[] }>;
  issues: FinancialReconciliationIssue[];
  closeState: "open" | "reconciled" | "reopened";
  /** No aggregate is exposed: total, balance, cash and profit are distinct facts. */
  records: FinancialEvidenceRecord[];
};

const stageOrder: FinancialStageKey[] = ["service", "collection", "document", "settlement", "bank"];
const kindsByStage: Record<FinancialStageKey, FinancialEvidenceKind[]> = {
  service: ["reservation", "service"],
  collection: ["collection", "advance", "refund", "chargeback"],
  document: ["document", "credit_note"],
  settlement: ["settlement", "commission", "withholding", "fx_adjustment"],
  bank: ["bank_entry"],
};
const stageOf = (kind: FinancialEvidenceKind) => stageOrder.find(key => kindsByStage[key].includes(kind))!;
const validText = (value: string) => value.trim().length > 0;
const validDate = (value: string) => Number.isFinite(Date.parse(value));
const validCurrency = (value: string) => /^[A-Z]{3}$/.test(value);

function pushIssue(issues: FinancialReconciliationIssue[], issue: FinancialReconciliationIssue) {
  if (!issues.some(current => current.code === issue.code && current.recordId === issue.recordId)) issues.push(issue);
}

export function buildFinancialReconciliationCard(
  input: FinancialReconciliationInput,
  options: { staleAfterMs?: number } = {},
): FinancialReconciliationCard {
  const staleAfterMs = options.staleAfterMs ?? 60 * 60 * 1000;
  const observedMs = Date.parse(input.observedAt);
  const records = structuredClone(input.records);
  const issues: FinancialReconciliationIssue[] = [];
  const ids = new Map(records.map(record => [record.recordId, record]));
  const recordIds = new Set<string>();
  const sourceKeys = new Set<string>();

  for (const record of records) {
    const invalid = !validText(record.recordId) || !validText(record.companyId) || !validCurrency(record.currency) ||
      !validText(record.sourceSystem) || !validText(record.sourceRef) || !validDate(record.occurredAt) ||
      !validDate(record.sourceUpdatedAt) || (record.amountMinor !== null && (!Number.isSafeInteger(record.amountMinor) || record.amountMinor < 0));
    if (invalid || recordIds.has(record.recordId)) pushIssue(issues, { code: "INVALID_RECORD", recordId: record.recordId || null });
    recordIds.add(record.recordId);
    if (record.companyId !== input.companyId || record.currency !== input.currency) pushIssue(issues, { code: "SCOPE_CONFLICT", recordId: record.recordId || null });
    const sourceKey = `${record.sourceSystem}\u0000${record.sourceRef}`;
    if (sourceKeys.has(sourceKey)) pushIssue(issues, { code: "DUPLICATE_SOURCE", recordId: record.recordId || null });
    sourceKeys.add(sourceKey);
    if (record.amountMinor === null) pushIssue(issues, { code: "UNKNOWN_AMOUNT", recordId: record.recordId || null });
    if (!Number.isFinite(observedMs) || !validDate(record.sourceUpdatedAt) || observedMs - Date.parse(record.sourceUpdatedAt) > staleAfterMs || Date.parse(record.sourceUpdatedAt) > observedMs) {
      pushIssue(issues, { code: "STALE_SOURCE", recordId: record.recordId || null });
    }
    if (record.state === "reopened") pushIssue(issues, { code: "REOPENED", recordId: record.recordId || null });
  }

  for (const record of records) {
    const index = stageOrder.indexOf(stageOf(record.kind));
    if (index === 0) continue;
    const requiredPriorStage = stageOrder[index - 1];
    const linked = record.links.some(id => {
      const prior = ids.get(id);
      return prior && stageOf(prior.kind) === requiredPriorStage && prior.companyId === record.companyId && prior.currency === record.currency;
    });
    if (!linked) pushIssue(issues, { code: "MISSING_LINK", recordId: record.recordId || null });
  }

  const stages = stageOrder.map(key => {
    const stageRecords = records.filter(record => stageOf(record.kind) === key);
    let state: FinancialStageState = "missing";
    if (stageRecords.length) {
      const recordIds = new Set(stageRecords.map(record => record.recordId));
      const has = (code: FinancialReconciliationIssue["code"]) => issues.some(issue => issue.code === code && issue.recordId !== null && recordIds.has(issue.recordId));
      if (has("INVALID_RECORD") || has("SCOPE_CONFLICT") || has("DUPLICATE_SOURCE") || has("MISSING_LINK")) state = "conflict";
      else if (has("STALE_SOURCE") || stageRecords.some(record => record.state === "unknown")) state = "unknown";
      else if (stageRecords.every(record => record.state === "verified")) state = "verified";
      else state = "reported";
    }
    return { key, state, recordIds: stageRecords.map(record => record.recordId) };
  });
  const reopened = issues.some(issue => issue.code === "REOPENED");
  const reconciled = stages.every(stage => stage.state === "verified") && issues.length === 0;
  return {
    version: FINANCIAL_RECONCILIATION_CARD_VERSION,
    caseId: input.caseId,
    companyId: input.companyId,
    currency: input.currency,
    observedAt: input.observedAt,
    stages,
    issues,
    closeState: reopened ? "reopened" : reconciled ? "reconciled" : "open",
    records,
  };
}
