import { describe, expect, it } from "vitest";

import { evaluatePolicy } from "./policy-engine";

describe("TORO policy engine execution authority", () => {
  it("projects blocked actions to L4 without changing blocked behavior", () => {
    const decision = evaluatePolicy({
      action: "refund_payment",
      actionLevel: "execute_with_approval",
      risk: "Critical",
      externalImpact: true,
    });

    expect(decision.allowed).toBe(false);
    expect(decision.approval).toBe("Blocked");
    expect(decision.executionAuthorityLevel).toBe("L4");
  });

  it("projects external actions and high risk to L3", () => {
    expect(
      evaluatePolicy({
        action: "draft_external_change",
        actionLevel: "draft",
        risk: "Low",
        externalImpact: true,
      }).executionAuthorityLevel,
    ).toBe("L3");

    expect(
      evaluatePolicy({
        action: "review_high_risk",
        actionLevel: "analyze",
        risk: "High",
        externalImpact: false,
      }).executionAuthorityLevel,
    ).toBe("L3");
  });

  it("keeps read-only analysis at L1 and reversible preparation at L2", () => {
    expect(
      evaluatePolicy({
        action: "reconcile_records",
        actionLevel: "analyze",
        risk: "Medium",
        externalImpact: false,
      }).executionAuthorityLevel,
    ).toBe("L1");

    expect(
      evaluatePolicy({
        action: "prepare_internal_fields",
        actionLevel: "prepare_fields",
        risk: "Medium",
        externalImpact: false,
      }).executionAuthorityLevel,
    ).toBe("L2");
  });
});
