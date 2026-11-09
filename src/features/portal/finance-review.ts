import type { ToroResolvedContext } from "@/features/context/types";
import { DIRECTORY_SCOPE } from "@/features/tools/directory";

export const FINANCE_REVIEW_LIMIT = 100;
export const FINANCE_REVIEW_FIELDS = "id,org_id,property_id,reconciliation_key,period_month,status,confidence,currency,updated_at";

export type FinanceReviewItem = {
  id: string;
  periodMonth: string | null;
  status: string;
  confidence: string;
  currency: string;
  updatedAt: string;
};
export type FinanceReviewView = {
  state: "ready" | "unavailable" | "denied" | "disabled";
  readAt: string | null;
  rowsRead: number | null;
  limitReached: boolean;
  total: null;
  latestUpdatedAt: string | null;
  currencies: string[];
  reviewCount: number | null;
  items: FinanceReviewItem[];
};

export function canReadPortalFinance(context: ToroResolvedContext | null) {
  return Boolean(context && context.userId?.trim() && context.mode === "organization" &&
    !context.requiresContextChoice && context.allowedDataScopes.includes("work_org") &&
    context.canUseOrganizationData && context.orgId === DIRECTORY_SCOPE.orgId &&
    context.membership?.orgId === context.orgId && context.membership.status === "active" &&
    context.membership.roles.some(role => ["ADMIN", "GERENCIA", "CONTABILIDAD", "AUDITOR"].includes(role)));
}

export function emptyFinanceReview(state: FinanceReviewView["state"]): FinanceReviewView {
  return { state, readAt: null, rowsRead: null, limitReached: false, total: null,
    latestUpdatedAt: null, currencies: [], reviewCount: null, items: [] };
}

const text = (value: unknown, max = 200) => typeof value === "string" && value.trim() && value.length <= max ? value.trim() : null;
const date = (value: unknown) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value + "T00:00:00Z")) ? value : null;
const timestamp = (value: unknown) => typeof value === "string" && Number.isFinite(Date.parse(value)) && /(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? value : null;
const closed = new Set(["matched", "reconciled", "resolved_nonmatch", "closed"]);

/** Property-scoped projection. It never exposes amounts, account details or source references. */
export function projectFinanceReview(input: unknown, readAt: string): FinanceReviewView {
  if (!Array.isArray(input) || input.length > FINANCE_REVIEW_LIMIT + 1 || !timestamp(readAt)) return emptyFinanceReview("unavailable");
  const parsed: FinanceReviewItem[] = [];
  const ids = new Set<string>();
  for (const raw of input) {
    if (!raw || typeof raw !== "object") return emptyFinanceReview("unavailable");
    const row = raw as Record<string, unknown>;
    const id = text(row.reconciliation_key);
    const uuid = text(row.id);
    const status = text(row.status);
    const confidence = text(row.confidence);
    const currency = text(row.currency, 3);
    const updatedAt = timestamp(row.updated_at);
    if (!id || !uuid || !status || !confidence || !currency || !/^[A-Z]{3}$/.test(currency) || !updatedAt ||
      row.org_id !== DIRECTORY_SCOPE.orgId || row.property_id !== DIRECTORY_SCOPE.propertyId || ids.has(uuid) ||
      (row.period_month !== null && date(row.period_month) === null)) return emptyFinanceReview("unavailable");
    ids.add(uuid);
    parsed.push({ id, periodMonth: row.period_month === null ? null : date(row.period_month), status, confidence, currency, updatedAt });
  }
  const batch = parsed.slice(0, FINANCE_REVIEW_LIMIT);
  const items = batch.filter(item => !closed.has(item.status.toLowerCase()))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id)).slice(0, 5);
  return { state: "ready", readAt, rowsRead: batch.length, limitReached: parsed.length > FINANCE_REVIEW_LIMIT,
    total: null, latestUpdatedAt: batch.reduce<string | null>((latest, item) => !latest || item.updatedAt > latest ? item.updatedAt : latest, null),
    currencies: [...new Set(batch.map(item => item.currency))].sort(),
    reviewCount: batch.filter(item => !closed.has(item.status.toLowerCase())).length, items };
}
