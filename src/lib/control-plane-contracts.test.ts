import { describe, expect, it } from "vitest";

import {
  canTransitionExecutionRun,
  executionAuthorityRequiresHumanGate,
  isExecutionAuthorityProhibited,
  isTerminalExecutionRunStatus,
  resolveToroExecutionAuthorityLevel,
} from "./control-plane-contracts";

describe("TORO control-plane contracts", () => {
  it("keeps domain risk separate from execution authority", () => {
    expect(
      resolveToroExecutionAuthorityLevel({
        actionLevel: "observe",
        risk: "Low",
        externalImpact: false,
      }),
    ).toBe("L0");

    expect(
      resolveToroExecutionAuthorityLevel({
        actionLevel: "analyze",
        risk: "Medium",
        externalImpact: false,
      }),
    ).toBe("L1");

    expect(
      resolveToroExecutionAuthorityLevel({
        actionLevel: "prepare_fields",
        risk: "Medium",
        externalImpact: false,
      }),
    ).toBe("L2");

    expect(
      resolveToroExecutionAuthorityLevel({
        actionLevel: "execute_low_risk",
        risk: "High",
        externalImpact: false,
      }),
    ).toBe("L3");

    expect(
      resolveToroExecutionAuthorityLevel({
        actionLevel: "draft",
        risk: "Low",
        externalImpact: true,
      }),
    ).toBe("L3");

    expect(
      resolveToroExecutionAuthorityLevel({
        actionLevel: "blocked",
        risk: "Low",
        externalImpact: false,
      }),
    ).toBe("L4");
  });

  it("allows only forward governed run transitions", () => {
    expect(canTransitionExecutionRun("queued", "claimed")).toBe(true);
    expect(canTransitionExecutionRun("claimed", "running")).toBe(true);
    expect(canTransitionExecutionRun("running", "verifying")).toBe(true);
    expect(canTransitionExecutionRun("verifying", "succeeded")).toBe(true);
    expect(canTransitionExecutionRun("failed", "retry_wait")).toBe(true);
    expect(canTransitionExecutionRun("retry_wait", "claimed")).toBe(true);

    expect(canTransitionExecutionRun("succeeded", "running")).toBe(false);
    expect(canTransitionExecutionRun("cancelled", "claimed")).toBe(false);
    expect(canTransitionExecutionRun("dead_letter", "queued")).toBe(false);
  });

  it("treats final outcomes as terminal", () => {
    expect(isTerminalExecutionRunStatus("succeeded")).toBe(true);
    expect(isTerminalExecutionRunStatus("blocked")).toBe(true);
    expect(isTerminalExecutionRunStatus("dead_letter")).toBe(true);
    expect(isTerminalExecutionRunStatus("cancelled")).toBe(true);
    expect(isTerminalExecutionRunStatus("superseded")).toBe(true);
    expect(isTerminalExecutionRunStatus("failed")).toBe(false);
    expect(isTerminalExecutionRunStatus("verifying")).toBe(false);
  });

  it("distinguishes human-gated L3 from prohibited L4", () => {
    expect(executionAuthorityRequiresHumanGate("L0")).toBe(false);
    expect(executionAuthorityRequiresHumanGate("L1")).toBe(false);
    expect(executionAuthorityRequiresHumanGate("L2")).toBe(false);
    expect(executionAuthorityRequiresHumanGate("L3")).toBe(true);
    expect(executionAuthorityRequiresHumanGate("L4")).toBe(false);

    expect(isExecutionAuthorityProhibited("L3")).toBe(false);
    expect(isExecutionAuthorityProhibited("L4")).toBe(true);
  });
});
