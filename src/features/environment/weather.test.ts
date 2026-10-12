import { describe, expect, it } from "vitest";
import { IMN_URLS, parseImnRegional } from "./weather";
const now = Date.parse("2026-10-12T06:30:00Z");
const html = (date = "Lunes 12 de octubre de 2026") =>
  '<h2>Válido para: ' + date + '</h2><table><tr><td>Pacífico Norte</td>' +
  '<td>Nublado</td><td>Parcialmente nublado</td><td>Aguaceros y posible tormenta</td><td>Lluvias aisladas</td></tr></table>';
describe("IMN regional parser", () => {
  it("returns only the dated regional row, not a national or hourly forecast", () => {
    const result = parseImnRegional(html(), IMN_URLS[0], now);
    expect(result.state).toBe("ready");
    expect(result.validDate).toBe("2026-10-12");
    expect(result.periods).toHaveLength(4);
    expect(result.periods[2].summary).toBe("Aguaceros y posible tormenta");
  });
  it("rejects undated text, invalid dates and competing regional rows", () => {
    expect(parseImnRegional("<p>Hay lluvia</p>", IMN_URLS[0], now).state).toBe("unavailable");
    expect(parseImnRegional(html("31 de febrero de 2026"), IMN_URLS[0], now).state).toBe("unavailable");
    expect(parseImnRegional(html() + html(), IMN_URLS[0], now).state).toBe("unavailable");
  });
  it("does not show yesterday or tomorrow as current", () => {
    for (const date of ["11 de octubre de 2026", "13 de octubre de 2026"])
      expect(parseImnRegional(html(date), IMN_URLS[0], now)).toMatchObject({ state: "stale", periods: [] });
  });
  it("fails closed for nonofficial source, malformed region, oversized response", () => {
    expect(parseImnRegional(html(), "https://example.invalid", now).state).toBe("unavailable");
    expect(parseImnRegional(html().replace("Pacífico Norte", "Pacífico Sur"), IMN_URLS[0], now).state).toBe("unavailable");
    expect(parseImnRegional("x".repeat(1_000_001), IMN_URLS[0], now).state).toBe("unavailable");
  });
});
