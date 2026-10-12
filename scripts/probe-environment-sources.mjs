import { readFile } from "node:fs/promises";
import ts from "typescript";

// Diagnostic only: public, fixed scientific sources. Outage is logged, not hidden,
// and does not convert a code build into an assertion of live provider readiness.
async function moduleUrl(file, substitutions = {}) {
  let source = await readFile(new URL("../src/features/environment/" + file, import.meta.url), "utf8");
  for (const [key, value] of Object.entries(substitutions)) source = source.replaceAll(key, value);
  const output = ts.transpileModule(source, { compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
  } }).outputText;
  return "data:text/javascript;base64," + Buffer.from(output).toString("base64");
}
const weatherUrl = await moduleUrl("weather.ts");
const weather = await import(weatherUrl);
const moon = await import(await moduleUrl("moon.ts", { 'from "./weather"': 'from "' + weatherUrl + '"' }));
const { readBoundedText } = await import(await moduleUrl("transport.ts"));
const now = Date.now();
async function probe(source, url, parse) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(url, { signal: controller.signal, redirect: "error" });
    const text = await readBoundedText(response, 1_000_000);
    const view = text === null ? null : parse(text);
    console.log(JSON.stringify({ environmentSource: source, checkedAt: new Date(now).toISOString(),
      http: response.status, state: view?.state ?? "unavailable",
      validDate: view?.validDate ?? null,
      nextPhase: view?.next?.[0] ?? null }));
  } catch {
    console.log(JSON.stringify({ environmentSource: source, checkedAt: new Date(now).toISOString(),
      state: "unavailable", reason: "request_or_parse_failed" }));
  } finally { clearTimeout(timer); }
}
const requestedDate = moon.moonRequestDate(now);
await Promise.all([
  ...weather.IMN_URLS.map(url => probe("IMN", url, text => weather.parseImnRegional(text, url, now))),
  probe("USNO", "https://aa.usno.navy.mil/api/moon/phases/date?date=" + requestedDate + "&nump=12",
    text => moon.projectMoon(JSON.parse(text), requestedDate, now)),
]);
