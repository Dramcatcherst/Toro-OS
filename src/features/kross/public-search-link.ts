export type KrossSearchInput = {
  from: string;
  to: string;
  adults: number;
  children: number;
  currency?: "USD" | "CRC";
  lang?: "en" | "es";
};

export type KrossSearchBuildResult = {
  url: string | null;
  issues: string[];
};

const BASE_URL = "https://dreamcatcherhotel.kross.travel/book/step1";

export function isKrossDateOnly(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function isKrossAdultCount(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 12;
}

export function isKrossChildCount(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 6;
}

export function buildOfficialKrossSearchUrl(
  input: KrossSearchInput,
): KrossSearchBuildResult {
  const issues: string[] = [];

  if (!isKrossDateOnly(input.from)) issues.push("La fecha de llegada no es válida.");
  if (!isKrossDateOnly(input.to)) issues.push("La fecha de salida no es válida.");
  if (
    isKrossDateOnly(input.from) &&
    isKrossDateOnly(input.to) &&
    input.to <= input.from
  ) {
    issues.push("La salida debe ser posterior a la llegada.");
  }

  if (!isKrossAdultCount(input.adults)) {
    issues.push("Adultos debe estar entre 1 y 12.");
  }
  if (!isKrossChildCount(input.children)) {
    issues.push("Niños debe estar entre 0 y 6.");
  }

  if (issues.length) return { url: null, issues };

  const guests = input.adults + input.children;
  const params = new URLSearchParams({
    adults: String(input.adults),
    children: String(input.children),
    rooms: "1",
    guests: String(guests),
    n_guests: String(guests),
    guests_rooms: `${input.adults},${input.children};`,
    kross_lang: input.lang ?? "es",
    from: input.from,
    to: input.to,
  });

  if (input.currency) params.set("currency", input.currency);

  return {
    url: `${BASE_URL}?${params.toString()}`,
    issues: [],
  };
}
