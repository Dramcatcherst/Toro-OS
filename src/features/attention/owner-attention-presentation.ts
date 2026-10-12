import { TORO_TIME_ZONE } from "@/lib/reporting-policy";

const numberFormatter = new Intl.NumberFormat("es-CR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 20,
});
const timeFormatter = new Intl.DateTimeFormat("es-CR", {
  timeZone: TORO_TIME_ZONE,
  calendar: "gregory",
  numberingSystem: "latn",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Presentation only: never invent a currency or convert missing amounts to zero. */
export function formatAttentionAmount(amount: number | null, currency: string | null): string {
  if (amount === null || !Number.isFinite(amount)) return "Importe no informado";
  const value = numberFormatter.format(amount);
  const code = currency?.trim();
  return code && /^[A-Z]{3}$/.test(code)
    ? `${code} ${value}`
    : `${value} · moneda no informada`;
}

/** Keep the original civil date; never convert a date-only deadline between zones. */
export function formatAttentionDate(value: string | null): string {
  if (!value) return "Sin fecha";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Fecha no verificada";
  const [year, month, day] = value.split("-");
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (y < 1 || m < 1 || m > 12 || d < 1 || d > days[m - 1]) return "Fecha no verificada";
  return `${day}/${month}/${year}`;
}

export function formatAttentionCut(asOf: string | undefined): string {
  if (!asOf) return "Corte no verificado";
  const instant = new Date(asOf);
  return Number.isFinite(instant.getTime())
    ? `${timeFormatter.format(instant)} · Costa Rica`
    : "Corte no verificado";
}

/** User-initiated external navigation only. This does not fetch or certify the source. */
export function safeEvidenceHref(value: string | null): string | null {
  if (!value || value.length > 4096 || /[\u0000-\u0020\u007f]/.test(value)) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    const host = url.hostname.toLowerCase();
    if (!host.includes(".") || host === "localhost" || host.endsWith(".localhost") ||
        host.endsWith(".local") || host.endsWith(".internal") || host.startsWith("[") ||
        /^\d+(?:\.\d+){3}$/.test(host)) return null;
    const riskyKey = /token|secret|password|signature|credential|authorization|authcode|accesskey/i;
    if ([...url.searchParams.keys()].some((key) => riskyKey.test(key) || key === "code")) return null;
    if (/%0[ad]/i.test(value) || /(?:reset-password|reset_password|magic-link|magic_link|\/approve(?:\/|$)|\/delete(?:\/|$)|\/pay(?:\/|$))/i.test(url.pathname)) return null;
    // Return the exact source reference; normalizing it could alter its meaning.
    return value;
  } catch {
    return null;
  }
}
