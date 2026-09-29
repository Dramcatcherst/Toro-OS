import { describe, expect, it } from "vitest";

import { executiveDecisionDisplay } from "./executive-decision-display";

describe("executiveDecisionDisplay", () => {
  it("does not present processed as a human approval", () => {
    expect(executiveDecisionDisplay("processed")).toEqual({
      statusLabel: "Requiere conciliación",
      requiresReconciliation: true,
    });
    expect(executiveDecisionDisplay(" Processed ").requiresReconciliation).toBe(true);
  });

  it("preserves other source statuses without inferring a decision", () => {
    expect(executiveDecisionDisplay("Pendiente")).toEqual({
      statusLabel: "Pendiente",
      requiresReconciliation: false,
    });
  });
});
