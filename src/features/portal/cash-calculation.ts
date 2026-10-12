export type CashCurrency = "CRC" | "USD";
export type CashDenomination = { id: string; minor: number; kind: "bill" | "coin" };

function denominations(currency: CashCurrency, bills: number[], coins: number[]): CashDenomination[] {
  return [
    ...bills.map(minor => ({ id: `${currency}-bill-${minor}`, minor, kind: "bill" as const })),
    ...coins.map(minor => ({ id: `${currency}-coin-${minor}`, minor, kind: "coin" as const })),
  ];
}

// Values are integer hundredths of the currency, including CRC denominations.
// CRC excludes the withdrawn 5-colon coin; count only current designs.
export const CASH_DENOMINATIONS: Record<CashCurrency, CashDenomination[]> = {
  CRC: denominations("CRC", [2_000_000, 1_000_000, 500_000, 200_000, 100_000], [50_000, 10_000, 5_000, 2_500, 1_000]),
  USD: denominations("USD", [10_000, 5_000, 2_000, 1_000, 500, 200, 100], [100, 50, 25, 10, 5, 1]),
};

export type CashDraft = {
  quantities: Record<string, string>;
  expected: Record<CashCurrency, string>;
};
export type CashDraftAction =
  | { type: "quantity"; id: string; value: string }
  | { type: "expected"; currency: CashCurrency; value: string }
  | { type: "reset" };

const knownDenominations = new Set(Object.values(CASH_DENOMINATIONS).flat().map(item => item.id));
export function createCashDraft(): CashDraft {
  return { quantities: {}, expected: { CRC: "", USD: "" } };
}

export function cashDraftReducer(draft: CashDraft, action: CashDraftAction): CashDraft {
  if (action.type === "reset") return createCashDraft();
  if (action.type === "expected") return { ...draft, expected: { ...draft.expected, [action.currency]: action.value } };
  if (!knownDenominations.has(action.id)) return draft;
  return { ...draft, quantities: { ...draft.quantities, [action.id]: action.value } };
}

export function parseQuantity(raw: string): number | null {
  if (raw === "") return 0;
  return /^\d{1,4}$/.test(raw) ? Number(raw) : null;
}

export function parseExpectedMinor(raw: string): { value: number | null; error: string | null } {
  const value = raw.trim();
  if (!value) return { value: null, error: null };
  if (!/^\d{1,9}(?:[.,]\d{1,2})?$/.test(value)) {
    return { value: null, error: "Usa un monto no negativo de hasta 9 dígitos y 2 decimales, sin separadores de miles." };
  }
  const [whole, fraction = ""] = value.split(/[.,]/);
  return { value: Number(whole) * 100 + Number(fraction.padEnd(2, "0")), error: null };
}

export function getCashCount(currency: CashCurrency, draft: CashDraft) {
  let totalMinor = 0;
  for (const item of CASH_DENOMINATIONS[currency]) {
    const quantity = parseQuantity(draft.quantities[item.id] ?? "");
    if (quantity === null) {
      return { totalMinor: null, expectedMinor: null, differenceMinor: null, error: "Usa cantidades enteras entre 0 y 9999." };
    }
    totalMinor += item.minor * quantity;
  }
  const expected = parseExpectedMinor(draft.expected[currency]);
  return {
    totalMinor,
    expectedMinor: expected.value,
    differenceMinor: expected.error || expected.value === null ? null : totalMinor - expected.value,
    error: expected.error,
  };
}

const moneyFormats = {
  CRC: new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", currencyDisplay: "narrowSymbol", minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  USD: new Intl.NumberFormat("es-CR", { style: "currency", currency: "USD", currencyDisplay: "narrowSymbol", minimumFractionDigits: 2, maximumFractionDigits: 2 }),
};
export function formatCashMoney(minor: number, currency: CashCurrency): string {
  return moneyFormats[currency].format(minor / 100);
}

export function buildCashSummary(draft: CashDraft): string | null {
  const lines = ["Conteo de efectivo · borrador local"];
  for (const currency of ["CRC", "USD"] as const) {
    const count = getCashCount(currency, draft);
    if (count.totalMinor === null || count.error) return null;
    lines.push(`${currency}: contado ${formatCashMoney(count.totalMinor, currency)} · esperado ${count.expectedMinor === null ? "sin indicar" : formatCashMoney(count.expectedMinor, currency)} · diferencia ${count.differenceMinor === null ? "sin calcular" : formatCashMoney(count.differenceMinor, currency)}`);
    const breakdown = CASH_DENOMINATIONS[currency].flatMap(item => {
      const quantity = parseQuantity(draft.quantities[item.id] ?? "");
      return quantity ? [`${item.kind === "bill" ? "billete" : "moneda"} ${formatCashMoney(item.minor, currency)} × ${quantity}`] : [];
    });
    if (breakdown.length) lines.push(breakdown.join(" · "));
  }
  lines.push("CRC y USD sin conversión. No se guardó ni se registró un cierre, pago o movimiento contable.");
  return lines.join("\n");
}

export async function copyCashSummary(summary: string, writeText?: (text: string) => Promise<void>): Promise<"copied" | "manual"> {
  if (!writeText) return "manual";
  try {
    await writeText(summary);
    return "copied";
  } catch {
    return "manual";
  }
}

export type CalculatorOperation = "+" | "-" | "*" | "/";
export function calculateCashExpression(left: string, operation: CalculatorOperation, right: string): { value: number | null; error: string | null } {
  const pattern = /^-?\d{1,9}(?:[.,]\d{1,6})?$/;
  if (!pattern.test(left.trim()) || !pattern.test(right.trim())) {
    return { value: null, error: "Usa números de hasta 9 dígitos y 6 decimales, sin separadores de miles." };
  }
  const a = Number(left.trim().replace(",", "."));
  const b = Number(right.trim().replace(",", "."));
  if (operation === "/" && b === 0) return { value: null, error: "No se puede dividir entre cero." };
  let value: number;
  switch (operation) {
    case "+": value = a + b; break;
    case "-": value = a - b; break;
    case "*": value = a * b; break;
    case "/": value = a / b; break;
    default: return { value: null, error: "Operación no disponible." };
  }
  if (!Number.isFinite(value) || Math.abs(value) > 1_000_000_000_000) {
    return { value: null, error: "El resultado excede el límite de esta calculadora." };
  }
  // Display calculator results to 8 decimals; cash totals above remain exact integers.
  return { value: Number(value.toFixed(8)), error: null };
}
