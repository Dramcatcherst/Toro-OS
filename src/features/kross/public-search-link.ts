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

function isDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function buildOfficialKrossSearchUrl(
  input: KrossSearchInput,
): KrossSearchBuildResult {
  const issues: string[] = [];

  if (!isDateOnly(input.from)) issues.push("La fecha de llegada no es válida.");
  if (!isDateOnly(input.to)) issues.push("La fecha de salida no es válida.");
  if (
    isDateOnly(input.from) &&
    isDateOnly(input.to) &&
    input.to <= input.from
  ) {
    issues.push("La salida debe ser posterior a la llegada.");
  }

  if (!Number.isInteger(input.adults) || input.adults < 1 || input.adults > 12) {
    issues.push("Adultos debe estar entre 1 y 12.");
  }
  if (
    !Number.isInteger(input.children) ||
    input.children < 0 ||
    input.children > 6
  ) {
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
