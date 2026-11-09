import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { buildFinancialReconciliationCard, type FinancialEvidenceKind, type FinancialEvidenceRecord } from "@/features/finance/reconciliation-card";
import { PortalFinancialReconciliationCard } from "./portal-financial-reconciliation-card";

const observedAt = "2026-11-08T18:30:00.000Z";
function record(recordId: string, kind: FinancialEvidenceKind, links: string[] = [], overrides: Partial<FinancialEvidenceRecord> = {}): FinancialEvidenceRecord {
  return {
    recordId, kind, links, state: "verified", companyId: "company-dreamcatcher", currency: "USD", amountMinor: 10_000,
    occurredAt: "2026-11-08T18:00:00.000Z", sourceUpdatedAt: "2026-11-08T18:10:00.000Z",
    sourceSystem: kind === "bank_entry" ? "bank" : "kross", sourceRef: `${kind}-${recordId}`, ...overrides,
  };
}
function card(records: FinancialEvidenceRecord[]) {
  return buildFinancialReconciliationCard({ caseId: "case-4438", companyId: "company-dreamcatcher", currency: "USD", observedAt, records });
}

describe("financial reconciliation card", () => {
  it("reconciles only an explicitly linked, fresh, verified chain", () => {
    const result = card([
      record("service", "service"), record("collection", "advance", ["service"]),
      record("document", "document", ["collection"]), record("settlement", "settlement", ["document"]),
      record("bank", "bank_entry", ["settlement"]),
    ]);
    expect(result.closeState).toBe("reconciled");
    expect(result.stages.map(stage => stage.state)).toEqual(["verified", "verified", "verified", "verified", "verified"]);
    expect("totalMinor" in result).toBe(false);
  });

  it.each(["refund", "chargeback"] as const)("keeps a verified %s as evidence without treating it as a positive collection", kind => {
    const result = card([record("service", "service"), record(kind, kind, ["service"])]);
    expect(result.stages[1]).toMatchObject({ key: "collection", state: "verified", recordIds: [kind] });
    expect(result.closeState).toBe("open");
  });

  it("keeps commission, withholding and currency adjustments separate and linked", () => {
    const records = [record("service", "service"), record("collection", "collection", ["service"]), record("document", "document", ["collection"])];
    const result = card(records.concat([
      record("commission", "commission", ["document"], { amountMinor: 1_500 }),
      record("withholding", "withholding", ["document"], { amountMinor: 250 }),
      record("fx", "fx_adjustment", ["document"], { amountMinor: 75 }),
    ]));
    expect(result.stages[3]).toMatchObject({ state: "verified", recordIds: ["commission", "withholding", "fx"] });
    expect(result.records.map(item => item.amountMinor)).toContain(75);
  });

  it("does not link equal amounts without stable identity", () => {
    const result = card([record("service", "service"), record("collection", "collection"), record("document", "document")]);
    expect(result.issues.filter(issue => issue.code === "MISSING_LINK").map(issue => issue.recordId)).toEqual(["collection", "document"]);
    expect(result.stages[1].state).toBe("conflict");
  });

  it("requires every link in the chain instead of allowing a later stage to skip one", () => {
    const result = card([
      record("service", "service"), record("collection", "collection", ["service"]),
      record("document", "document", ["service"]),
    ]);
    expect(result.issues).toContainEqual({ code: "MISSING_LINK", recordId: "document" });
    expect(result.stages[2].state).toBe("conflict");
  });

  it("rejects mixed company or currency scope instead of converting it", () => {
    const result = card([record("service", "service"), record("crc", "collection", ["service"], { currency: "CRC" })]);
    expect(result.issues).toContainEqual({ code: "SCOPE_CONFLICT", recordId: "crc" });
    expect(result.stages[1].state).toBe("conflict");
  });

  it("keeps unknown amounts unknown and accepts an explicitly linked credit note", () => {
    const result = card([
      record("service", "service", [], { amountMinor: null }), record("collection", "collection", ["service"]),
      record("credit", "credit_note", ["collection"]),
    ]);
    expect(result.issues).toContainEqual({ code: "UNKNOWN_AMOUNT", recordId: "service" });
    expect(result.stages[2].state).toBe("verified");
    expect(result.closeState).toBe("open");
  });

  it("does not reconcile a verified chain while an amount is unknown", () => {
    const result = card([
      record("service", "service", [], { amountMinor: null }), record("collection", "collection", ["service"]),
      record("document", "document", ["collection"]), record("settlement", "settlement", ["document"]),
      record("bank", "bank_entry", ["settlement"]),
    ]);
    expect(result.stages.every(stage => stage.state === "verified")).toBe(true);
    expect(result.closeState).toBe("open");
  });

  it("marks old evidence unknown and a reopened close as reopened", () => {
    const stale = card([record("service", "service", [], { sourceUpdatedAt: "2026-11-08T10:00:00.000Z" })]);
    expect(stale.stages[0].state).toBe("unknown");
    const reopened = card([record("service", "service", [], { state: "reopened" })]);
    expect(reopened.closeState).toBe("reopened");
    expect(reopened.issues).toContainEqual({ code: "REOPENED", recordId: "service" });
  });

  it("renders scope and distinct stage states without claiming a bank match", () => {
    const html = renderToStaticMarkup(<PortalFinancialReconciliationCard card={card([record("service", "service")])} />);
    expect(html).toContain("Empresa company-dreamcatcher · USD · solo lectura");
    expect(html).toContain("Reserva / servicio");
    expect(html).toContain("Banco");
    expect(html).toContain("Sin evidencia");
    expect(html).toContain("Un monto reportado no confirma banco ni saldo");
  });
});
