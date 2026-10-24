import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PortalCashTools } from "./portal-cash-tools";
import {
  CASH_DENOMINATIONS, buildCashSummary, calculateCashExpression, cashDraftReducer,
  copyCashSummary, createCashDraft, getCashCount, parseExpectedMinor, parseQuantity,
} from "./cash-calculation";

describe("cash count", () => {
  it("counts notes and coins exactly and keeps currencies independent", () => {
    const draft = createCashDraft();
    draft.quantities = { "CRC-bill-2000000": "2", "CRC-coin-2500": "3", "USD-bill-100": "2", "USD-coin-100": "1", "USD-coin-10": "3", "USD-coin-1": "2" };
    expect(getCashCount("CRC", draft).totalMinor).toBe(4_007_500);
    expect(getCashCount("USD", draft).totalMinor).toBe(332);
    expect(CASH_DENOMINATIONS.CRC.some(item => item.minor === 500)).toBe(false);
  });

  it("distinguishes missing expected amount, exact zero and negative difference", () => {
    const draft = createCashDraft();
    draft.quantities["USD-coin-25"] = "2";
    expect(getCashCount("USD", draft).differenceMinor).toBeNull();
    draft.expected.USD = "0,50";
    expect(getCashCount("USD", draft).differenceMinor).toBe(0);
    draft.expected.USD = "1.00";
    expect(getCashCount("USD", draft).differenceMinor).toBe(-50);
    expect(parseExpectedMinor("0.29").value).toBe(29);
    expect(parseExpectedMinor("999999999.99").value).toBe(99_999_999_999);
  });

  it("keeps the maximum supported quantities exact without overflow or currency conversion", () => {
    const draft = createCashDraft();
    for (const item of Object.values(CASH_DENOMINATIONS).flat()) draft.quantities[item.id] = "9999";
    expect(getCashCount("CRC", draft).totalMinor).toBe(38_681_131_500);
    expect(getCashCount("USD", draft).totalMinor).toBe(189_891_009);
  });

  it("preserves the count but withholds difference/export when the expected amount is invalid", () => {
    const draft = createCashDraft(); draft.quantities["USD-bill-100"] = "1"; draft.expected.USD = "1.000";
    expect(getCashCount("USD", draft).totalMinor).toBe(100);
    expect(getCashCount("USD", draft).differenceMinor).toBeNull();
    expect(buildCashSummary(draft)).toBeNull();
  });

  it.each(["-1", "1.5", "1e3", "10000", "NaN", "Infinity"])("rejects quantity %s without reporting a false total", raw => {
    const draft = createCashDraft(); draft.quantities["USD-coin-1"] = raw;
    expect(parseQuantity(raw)).toBeNull();
    expect(getCashCount("USD", draft).totalMinor).toBeNull();
    expect(buildCashSummary(draft)).toBeNull();
  });

  it.each(["-1", "1.000", "1,000.25", "1e5", "1000000000", "0.001"])("rejects ambiguous or excessive expected amount %s", raw => {
    expect(parseExpectedMinor(raw).error).toBeTruthy();
  });

  it("accepts quantity bounds and resets both currencies without changing the previous draft", () => {
    expect(parseQuantity("")).toBe(0); expect(parseQuantity("0")).toBe(0); expect(parseQuantity("9999")).toBe(9999);
    let draft = cashDraftReducer(createCashDraft(), { type: "quantity", id: "CRC-bill-100000", value: "3" });
    draft = cashDraftReducer(draft, { type: "expected", currency: "USD", value: "2.00" });
    const reset = cashDraftReducer(draft, { type: "reset" });
    expect(getCashCount("CRC", reset).totalMinor).toBe(0);
    expect(getCashCount("USD", reset).expectedMinor).toBeNull();
    expect(draft.quantities["CRC-bill-100000"]).toBe("3");
    expect(buildCashSummary(reset)).toContain("No se guardó");
  });

  it("only reports clipboard success after the browser writer succeeds", async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    expect(await copyCashSummary("conteo", write)).toBe("copied");
    expect(write).toHaveBeenCalledWith("conteo");
    expect(await copyCashSummary("conteo", vi.fn().mockRejectedValue(new Error("denied")))).toBe("manual");
    expect(await copyCashSummary("conteo")).toBe("manual");
  });
});

describe("calculator", () => {
  it.each([["0.1", "+", "0,2", 0.3], ["4", "-", "5", -1], ["2.5", "*", "4", 10], ["7", "/", "2", 3.5]] as const)("calculates %s %s %s", (a, operation, b, expected) => {
    expect(calculateCashExpression(a, operation, b)).toEqual({ value: expected, error: null });
  });
  it.each([["1", "/", "0"], ["1", "/", "-0"], ["NaN", "+", "2"], ["Infinity", "*", "1"], ["1e9", "+", "1"], ["999999999", "*", "999999999"], ["1000000000", "+", "1"]] as const)("rejects unsafe input/result %s %s %s", (a, operation, b) => {
    expect(calculateCashExpression(a, operation, b).value).toBeNull();
    expect(calculateCashExpression(a, operation, b).error).toBeTruthy();
  });
});

it("renders both currencies, optional expectations and an honest local/manual workflow", () => {
  const html = renderToStaticMarkup(<PortalCashTools />);
  expect(html).toContain("CRC · Colones"); expect(html).toContain("USD · Dólares");
  expect(html).toContain("Monto esperado CRC"); expect(html).toContain("Monto esperado USD");
  expect(html).toContain('max="9999"'); expect(html).toContain('step="1"');
  expect(html).toContain("Copiar resumen"); expect(html).toContain("copiar manualmente");
  expect(html).toContain("No guarda datos"); expect(html).toContain("Reiniciar");
  expect(html).not.toContain("Resumen copiado al portapapeles.");
});
