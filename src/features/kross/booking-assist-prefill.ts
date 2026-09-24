export type BookingAssistPrefill = {
  from: string;
  to: string;
  adults: number;
  children: number;
  currency: "USD" | "CRC";
};

function cleanDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return "";
  }
  return value;
}

function boundedInt(
  value: string | null,
  fallback: number,
  min: number,
  max: number,
) {
  if (!value || !/^\d+$/.test(value)) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max
    ? parsed
    : fallback;
}

export function parseBookingAssistPrefill(
  params: Pick<URLSearchParams, "get">,
): BookingAssistPrefill {
  const currency = params.get("currency");

  return {
    from: cleanDate(params.get("from")),
    to: cleanDate(params.get("to")),
    adults: boundedInt(params.get("adults"), 2, 1, 12),
    children: boundedInt(params.get("children"), 0, 0, 6),
    currency: currency === "CRC" ? "CRC" : "USD",
  };
}

export function buildBookingAssistPath(
  input: Partial<BookingAssistPrefill>,
) {
  const params = new URLSearchParams();

  if (input.from) params.set("from", input.from);
  if (input.to) params.set("to", input.to);
  if (input.adults !== undefined) params.set("adults", String(input.adults));
  if (input.children !== undefined) {
    params.set("children", String(input.children));
  }
  if (input.currency) params.set("currency", input.currency);

  const query = params.toString();
  return query ? `/booking-assist?${query}` : "/booking-assist";
}
