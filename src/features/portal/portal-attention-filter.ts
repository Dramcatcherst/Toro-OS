export type AttentionFilterMeta = { currency: string | null; month: string | null };
export const ALL_ATTENTION = "all";
export const UNKNOWN_ATTENTION = "unknown";

export function attentionCurrency(value: string | null) {
  const currency = value?.trim().toUpperCase() ?? "";
  return /^[A-Z]{3}$/.test(currency) ? currency : null;
}
export function attentionMonth(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(value + "T00:00:00Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? value.slice(0, 7) : null;
}
export function filterAttentionEntries<T extends AttentionFilterMeta>(entries: readonly T[], currency: string, month: string): T[] {
  return entries.filter(entry =>
    (currency === ALL_ATTENTION || (entry.currency ?? UNKNOWN_ATTENTION) === currency) &&
    (month === ALL_ATTENTION || (entry.month ?? UNKNOWN_ATTENTION) === month));
}
