import { describe, expect, it } from "vitest";

import { evaluateTereRuntimeAcceptance } from "./runtime-acceptance";

const passing = {
  runtimeIdentified: true,
  runtimeName: "WeSpeak",
  runtimeVersion: "qa-runtime-v1",
  testedAt: "2026-09-24T00:30:00.000Z",
  configAppliedAt: "2026-09-23T23:03:36.614864Z",
  observedConfigHash: "0cab1a8be477f9bc6f25ceaeb5df56c7",
  expectedConfigHash: "0cab1a8be477f9bc6f25ceaeb5df56c7",
  isolatedTestContext: true,
  realGuestContacted: false,
  sensitiveExternalSendOccurred: false,
  unauthorizedActionOccurred: false,
  channelContinuityVerified: true,
  scenarios: [
    { key: "first_contact" as const, passed: true },
    { key: "quote_without_live_truth" as const, passed: true },
    { key: "in_stay_problem" as const, passed: true },
    { key: "payment_sensitive" as const, passed: true },
    { key: "navigation_shortcuts" as const, passed: true },
  ],
};

describe("evaluateTereRuntimeAcceptance", () => {
  it("verifies the current config only when runtime identity, hash, timing and scenario suite pass", () => {
    const result = evaluateTereRuntimeAcceptance(passing);

    expect(result.passed).toBe(true);
    expect(result.blockers).toEqual([]);
    expect(result.runtimeConsumptionState).toBe("VERIFIED_CURRENT_CONFIG");
  });

  it("keeps an active runtime unverified when observed activity predates the current config", () => {
    const result = evaluateTereRuntimeAcceptance({
      ...passing,
      testedAt: "2026-09-20T21:07:49.000Z",
    });

    expect(result.passed).toBe(false);
    expect(result.blockers).toContain("post_config_test");
    expect(result.runtimeConsumptionState).toBe(
      "ACTIVE_RUNTIME_CURRENT_CONFIG_UNVERIFIED",
    );
  });

  it("does not accept behavior-only evidence without runtime config hash", () => {
    const result = evaluateTereRuntimeAcceptance({
      ...passing,
      observedConfigHash: null,
    });

    expect(result.passed).toBe(false);
    expect(result.blockers).toContain("config_hash");
  });

  it("requires all five representative scenarios", () => {
    const result = evaluateTereRuntimeAcceptance({
      ...passing,
      scenarios: passing.scenarios.filter(
        (scenario) => scenario.key !== "payment_sensitive",
      ),
    });

    expect(result.passed).toBe(false);
    expect(result.blockers).toContain("scenario_suite");
  });

  it("fails if real guests or unauthorized actions are touched during QA", () => {
    const result = evaluateTereRuntimeAcceptance({
      ...passing,
      isolatedTestContext: false,
      realGuestContacted: true,
      unauthorizedActionOccurred: true,
    });

    expect(result.passed).toBe(false);
    expect(result.blockers).toEqual(
      expect.arrayContaining(["isolated_context", "no_unauthorized_action"]),
    );
  });
});
