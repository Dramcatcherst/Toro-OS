import type { ToroResolvedContext } from "@/features/context/types";

export const OWNER_ATTENTION_CONTRACT_VERSION = "owner-attention-v1" as const;

export type OwnerAttentionPriority = "critical" | "high" | "normal";
export type OwnerAttentionKind = "communication" | "obligation" | "invoice";

export type OwnerAttentionItem = {
  key: string;
  dedupeRef: string;
  kind: OwnerAttentionKind;
  title: string;
  priority: OwnerAttentionPriority;
  state: string;
  dueDate: string | null;
  amount: number | null;
  currency: string | null;
  ownerAgent: string | null;
  humanOwner: string | null;
  sourceSystem: string;
  sourceUrl: string | null;
  mailbox: string | null;
};

export type OwnerAttentionProjection = {
  contractVersion: typeof OWNER_ATTENTION_CONTRACT_VERSION;
  generatedAt: string;
  total: number;
  critical: number;
  high: number;
  normal: number;
  items: OwnerAttentionItem[];
};

export type CommunicationFollowupRow = {
  followup_key: string;
  subject: string;
  followup_state: string;
  priority: string;
  owner_agent: string | null;
  human_owner: string | null;
  due_date: string | null;
  source_url: string | null;
  mailbox: string | null;
  related_obligation_key: string | null;
};

export type ObligationRow = {
  obligation_key: string;
  obligation_name: string;
  counterparty: string;
  status: string;
  verification_status: string | null;
  next_due_date: string | null;
  next_review_date: string | null;
  current_amount: number | string | null;
  current_amount_currency: string | null;
  owner_agent: string | null;
  human_owner: string | null;
  source_system: string | null;
  source_path: string | null;
};

export type InvoiceRow = {
  invoice_key: string;
  issuer_name: string;
  document_number: string | null;
  due_date: string | null;
  currency: string | null;
  total: number | string | null;
  payment_status: string | null;
  obligation_key: string | null;
  mailbox: string | null;
  source_url: string | null;
};

const PRIORITY_RANK: Record<OwnerAttentionPriority, number> = {
  critical: 3,
  high: 2,
  normal: 1,
};

function parseNumber(value: number | string | null): number | null {
  if (value === null) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isoDay(value: string) {
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function daysFromToday(date: string | null, today: string) {
  if (!date) return null;
  const target = isoDay(date);
  const base = isoDay(today);
  if (!target || !base) return null;
  return Math.round((target.getTime() - base.getTime()) / 86_400_000);
}

export function canViewOwnerAttention(context: ToroResolvedContext) {
  return Boolean(
    context.mode === "organization" &&
      context.orgId &&
      context.membership?.status === "active" &&
      context.membership.orgId === context.orgId &&
      context.canUseOrganizationData &&
      !context.requiresContextChoice &&
      context.membership.roles.some(
        (role) => role === "ADMIN" || role === "GERENCIA",
      ),
  );
}

export function projectFollowupAttention(
  row: CommunicationFollowupRow,
  today: string,
): OwnerAttentionItem | null {
  if (["resolved", "no_reply_needed", "responded"].includes(row.followup_state)) {
    return null;
  }

  const days = daysFromToday(row.due_date, today);
  let priority: OwnerAttentionPriority =
    row.priority === "critical"
      ? "critical"
      : row.priority === "high"
        ? "high"
        : "normal";

  if (row.followup_state === "needs_reply" && days !== null && days <= 0) {
    priority = "critical";
  } else if (days !== null && days <= 1 && priority === "normal") {
    priority = "high";
  }

  return {
    key: row.followup_key,
    dedupeRef: row.related_obligation_key ?? `followup:${row.followup_key}`,
    kind: "communication",
    title: row.subject,
    priority,
    state: row.followup_state,
    dueDate: row.due_date,
    amount: null,
    currency: null,
    ownerAgent: row.owner_agent,
    humanOwner: row.human_owner,
    sourceSystem: "TORO Comms",
    sourceUrl: row.source_url,
    mailbox: row.mailbox,
  };
}

export function projectObligationAttention(
  row: ObligationRow,
  today: string,
): OwnerAttentionItem | null {
  if (["paid_current", "completed_current_period", "historical"].includes(row.status)) {
    return null;
  }

  const dueDays = daysFromToday(row.next_due_date, today);
  const reviewDays = daysFromToday(row.next_review_date, today);
  const verification = (row.verification_status ?? "").toLowerCase();

  const criticalSignal =
    /declined|suspend|suspension|restriction|urgent|critical/.test(verification);
  const dueSoon = dueDays !== null && dueDays <= 3;
  const reviewDue = reviewDays !== null && reviewDays <= 0;

  if (
    row.status === "active" &&
    !criticalSignal &&
    !dueSoon &&
    !reviewDue
  ) {
    return null;
  }

  let priority: OwnerAttentionPriority = "normal";
  if (criticalSignal || (dueDays !== null && dueDays < 0)) {
    priority = "critical";
  } else if (row.status === "needs_verification" || dueSoon || reviewDue) {
    priority = "high";
  }

  return {
    key: row.obligation_key,
    dedupeRef: row.obligation_key,
    kind: "obligation",
    title: row.obligation_name,
    priority,
    state: row.status,
    dueDate: row.next_due_date ?? row.next_review_date,
    amount: parseNumber(row.current_amount),
    currency: row.current_amount_currency,
    ownerAgent: row.owner_agent,
    humanOwner: row.human_owner,
    sourceSystem: row.source_system ?? "TORO Finance",
    sourceUrl: row.source_path,
    mailbox: null,
  };
}

export function projectInvoiceAttention(
  row: InvoiceRow,
  today: string,
): OwnerAttentionItem | null {
  const status = row.payment_status ?? "unknown";
  if (status === "paid") return null;

  const dueDays = daysFromToday(row.due_date, today);
  const isDispute = status.includes("duplicate_billing_dispute");
  const isProcessing = status.startsWith("payment_in_progress");

  if (!isDispute && !isProcessing && (dueDays === null || dueDays > 3)) {
    return null;
  }

  let priority: OwnerAttentionPriority = "normal";
  if (dueDays !== null && dueDays < 0) {
    priority = "critical";
  } else if (isDispute || (dueDays !== null && dueDays <= 3)) {
    priority = "high";
  }

  return {
    key: row.invoice_key,
    dedupeRef: row.obligation_key ?? row.invoice_key,
    kind: "invoice",
    title: row.document_number
      ? `${row.issuer_name} — ${row.document_number}`
      : row.issuer_name,
    priority,
    state: status,
    dueDate: row.due_date,
    amount: parseNumber(row.total),
    currency: row.currency,
    ownerAgent: "FIONA",
    humanOwner: null,
    sourceSystem: "TORO Finance",
    sourceUrl: row.source_url,
    mailbox: row.mailbox,
  };
}

function dueSortValue(value: string | null) {
  if (!value) return Number.POSITIVE_INFINITY;
  const parsed = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
}

export function buildOwnerAttentionProjection(input: {
  followups: CommunicationFollowupRow[];
  obligations: ObligationRow[];
  invoices: InvoiceRow[];
  today: string;
  generatedAt?: string;
  limit?: number;
}): OwnerAttentionProjection {
  const candidates = [
    ...input.followups
      .map((row) => projectFollowupAttention(row, input.today))
      .filter((item): item is OwnerAttentionItem => Boolean(item)),
    ...input.obligations
      .map((row) => projectObligationAttention(row, input.today))
      .filter((item): item is OwnerAttentionItem => Boolean(item)),
    ...input.invoices
      .map((row) => projectInvoiceAttention(row, input.today))
      .filter((item): item is OwnerAttentionItem => Boolean(item)),
  ];

  const deduped = new Map<string, OwnerAttentionItem>();

  for (const candidate of candidates) {
    const existing = deduped.get(candidate.dedupeRef);
    if (!existing) {
      deduped.set(candidate.dedupeRef, candidate);
      continue;
    }

    const candidateRank = PRIORITY_RANK[candidate.priority];
    const existingRank = PRIORITY_RANK[existing.priority];

    if (
      candidateRank > existingRank ||
      (candidateRank === existingRank &&
        dueSortValue(candidate.dueDate) < dueSortValue(existing.dueDate))
    ) {
      deduped.set(candidate.dedupeRef, candidate);
    }
  }

  const items = [...deduped.values()]
    .sort((a, b) => {
      const priorityDelta =
        PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
      if (priorityDelta !== 0) return priorityDelta;
      return dueSortValue(a.dueDate) - dueSortValue(b.dueDate);
    })
    .slice(0, input.limit ?? 50);

  return {
    contractVersion: OWNER_ATTENTION_CONTRACT_VERSION,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    total: items.length,
    critical: items.filter((item) => item.priority === "critical").length,
    high: items.filter((item) => item.priority === "high").length,
    normal: items.filter((item) => item.priority === "normal").length,
    items,
  };
}
