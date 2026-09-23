import { describe, expect, it } from "vitest";

import { evaluateToroCapabilityGate } from "./capability-gate";

const safePolicy = {
  allowed: true,
  approval: "None" as const,
  reason: "fixture",
};

describe("evaluateToroCapabilityGate", () => {
  it("blocks organization capabilities from personal context", () => {
    expect(evaluateToroCapabilityGate({
      contextMode: "personal",
      capabilityOwner: "organization",
      membershipActive: true,
      capabilityMode: "write",
      requestedMode: "write",
      sourceFresh: true,
      connectorHealthy: true,
      policy: safePolicy,
    })).toMatchObject({
      state: "blocked",
      reasonCode: "cross_scope",
      executable: false,
    });
  });

  it("requires active organization membership", () => {
    expect(evaluateToroCapabilityGate({
      contextMode: "organization",
      capabilityOwner: "organization",
      membershipActive: false,
      capabilityMode: "read",
      requestedMode: "read",
      sourceFresh: true,
      connectorHealthy: true,
      policy: safePolicy,
    })).toMatchObject({
      state: "blocked",
      reasonCode: "inactive_membership",
    });
  });

  it("turns a requested write into explicit simulation when that is the ceiling", () => {
    expect(evaluateToroCapabilityGate({
      contextMode: "organization",
      capabilityOwner: "organization",
      membershipActive: true,
      capabilityMode: "simulate",
      requestedMode: "write",
      sourceFresh: true,
      connectorHealthy: true,
      policy: safePolicy,
    })).toEqual({
      state: "simulate",
      reasonCode: "simulation_only",
      effectiveMode: "simulate",
      allowed: true,
      executable: false,
    });
  });

  it("blocks writes when authority is stale", () => {
    expect(evaluateToroCapabilityGate({
      contextMode: "organization",
      capabilityOwner: "organization",
      membershipActive: true,
      capabilityMode: "write",
      requestedMode: "write",
      sourceFresh: false,
      connectorHealthy: true,
      policy: safePolicy,
    })).toMatchObject({
      state: "blocked",
      reasonCode: "stale_authority",
    });
  });

  it("blocks writes when the connector is unhealthy", () => {
    expect(evaluateToroCapabilityGate({
      contextMode: "organization",
      capabilityOwner: "organization",
      membershipActive: true,
      capabilityMode: "write",
      requestedMode: "write",
      sourceFresh: true,
      connectorHealthy: false,
      policy: safePolicy,
    })).toMatchObject({
      state: "blocked",
      reasonCode: "connector_unhealthy",
    });
  });

  it("pauses a permitted write when policy requires human approval", () => {
    expect(evaluateToroCapabilityGate({
      contextMode: "organization",
      capabilityOwner: "organization",
      membershipActive: true,
      capabilityMode: "write",
      requestedMode: "write",
      sourceFresh: true,
      connectorHealthy: true,
      policy: {
        allowed: true,
        approval: "Owner approval",
        reason: "fixture",
      },
    })).toEqual({
      state: "approval_required",
      reasonCode: "approval_required",
      effectiveMode: "write",
      allowed: true,
      executable: false,
    });
  });

  it("allows a fresh healthy write only when every gate permits it", () => {
    expect(evaluateToroCapabilityGate({
      contextMode: "organization",
      capabilityOwner: "organization",
      membershipActive: true,
      capabilityMode: "write",
      requestedMode: "write",
      sourceFresh: true,
      connectorHealthy: true,
      policy: safePolicy,
    })).toEqual({
      state: "ready",
      reasonCode: "ok",
      effectiveMode: "write",
      allowed: true,
      executable: true,
    });
  });

  it("allows a read from fresh cached authority even when the live connector is unhealthy", () => {
    expect(evaluateToroCapabilityGate({
      contextMode: "organization",
      capabilityOwner: "organization",
      membershipActive: true,
      capabilityMode: "read",
      requestedMode: "read",
      sourceFresh: true,
      connectorHealthy: false,
      policy: safePolicy,
    })).toMatchObject({
      state: "ready",
      executable: false,
    });
  });
});
