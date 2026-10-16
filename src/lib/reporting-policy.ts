/** Owner-approved policy for the current TORO installation. Not browser locale. */
export const TORO_TIME_ZONE = "America/Costa_Rica" as const;

export type ToroReportingContext = {
  asOf: string;
  timeZone: typeof TORO_TIME_ZONE;
  reportingDate: string;
  dateBasis: "toro_time_zone" | "legacy_explicit_date";
};

const reportingDayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TORO_TIME_ZONE,
  calendar: "gregory",
  numberingSystem: "latn",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Preserve an existing internal date-only override without moving that date. */
function validateDateOnly(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Invalid explicit reporting date.");
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new Error("Invalid explicit reporting date.");
  }
  return value;
}

/**
 * Call with the single instant captured by the request's server entry point.
 * The legacy date parameter is internal compatibility, never a new HTTP/MCP input.
 * UTC event timestamps, document dates and night-audit closing rules are unchanged.
 */
export function createToroReportingContext(
  asOf: Date,
  legacyReportingDate?: string,
): ToroReportingContext {
  const instant = asOf.toISOString();
  const parts = reportingDayFormatter.formatToParts(asOf);
  const part = (type: "year" | "month" | "day") => {
    const value = parts.find((item) => item.type === type)?.value;
    if (!value) throw new Error("Reporting date could not be resolved.");
    return value;
  };
  const derivedDate = `${part("year")}-${part("month")}-${part("day")}`;
  const reportingDate = legacyReportingDate === undefined
    ? derivedDate
    : validateDateOnly(legacyReportingDate);

  return {
    asOf: instant,
    timeZone: TORO_TIME_ZONE,
    reportingDate,
    dateBasis: legacyReportingDate === undefined
      ? "toro_time_zone"
      : "legacy_explicit_date",
  };
}
