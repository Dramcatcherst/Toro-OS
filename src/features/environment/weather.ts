export const IMN_URLS = [
  "https://www.imn.ac.cr/es/web/imn/reporte-pronostico-regional",
  "https://imn.ac.cr/es/web/imn/reporte-pronostico-regional",
] as const;
export type WeatherView = {
  state: "ready" | "unavailable" | "stale";
  validDate: string | null;
  sourceUrl: string | null;
  region: string;
  periods: { label: string; summary: string }[];
};
export const emptyWeather = (state: WeatherView["state"] = "unavailable"): WeatherView =>
  ({ state, validDate: null, sourceUrl: null, region: "Pacífico Norte · referencia regional", periods: [] });
export function localDay(now: number): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Costa_Rica",
    year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(now));
}
function plain(html: string): string {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ").replace(/&amp;/g, "&")
    .replace(/&aacute;/g, "á").replace(/&eacute;/g, "é")
    .replace(/&iacute;/g, "í").replace(/&oacute;/g, "ó").replace(/&uacute;/g, "ú")
    .replace(/\s+/g, " ").trim();
}
// Exact daily validity + exact region row; a national headline or cached search
// snippet cannot be promoted into a local/hourly forecast.
export function parseImnRegional(html: string, sourceUrl: string, now: number): WeatherView {
  if (!Number.isFinite(now) || !IMN_URLS.some(url => url === sourceUrl) || html.length > 1_000_000)
    return emptyWeather();
  const text = plain(html);
  const matches = [...text.matchAll(/Válido para:\s*(?:[A-Za-záéíóúñ]+\s+)?(\d{1,2}) de ([a-z]+) de (\d{4})/gi)];
  if (matches.length !== 1) return emptyWeather();
  const month = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"]
    .indexOf(matches[0][2].toLowerCase()) + 1;
  const validDate = matches[0][3] + "-" + String(month).padStart(2, "0") + "-" + matches[0][1].padStart(2, "0");
  if (!month || !Number.isFinite(Date.parse(validDate + "T00:00:00-06:00")) ||
    new Date(validDate + "T00:00:00Z").toISOString().slice(0, 10) !== validDate) return emptyWeather();
  if (validDate !== localDay(now)) return emptyWeather("stale");
  const rows = [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)];
  const candidates = rows.map(row => [...row[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(cell => plain(cell[1])))
    .filter(cells => cells[0] === "Pacífico Norte");
  if (candidates.length !== 1 || candidates[0].length < 5 ||
    candidates[0].slice(1, 5).some(cell => !cell || cell.length > 300)) return emptyWeather();
  return { state: "ready", validDate, sourceUrl, region: "Pacífico Norte · referencia regional",
    periods: ["Madrugada", "Mañana", "Tarde", "Noche"].map((label, index) => ({ label, summary: candidates[0][index + 1] })) };
}
