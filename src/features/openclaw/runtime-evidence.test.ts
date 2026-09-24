import { describe, expect, it } from "vitest";

import {
  evaluateOpenClawRuntimeEvidence,
  openClawRequiredAuditGateKeys,
  type OpenClawRuntimeEvidencePacket,
} from "./runtime-evidence";

function passingPacket(): OpenClawRuntimeEvidencePacket {
  return {
    auditAt: "2026-09-24T07:30:00.000Z",
    profileKey: "openclaw_company_shared",
    runtimeVersion: "2026.9.x",
    channelAliases: ["hotel-whatsapp"],
    rawSecretsIncluded: false,
    realGuestContactedForAudit: false,
    productionMutationOccurred: false,
    gates: openClawRequiredAuditGateKeys.map((key) => ({
      key,
      passed: true,
      evidenceReference: `audit:openclaw:${key}`,
    })),
  };
}

describe("evaluateOpenClawRuntimeEvidence", () => {
  it("confirms active only when every required gate has explicit evidence", () => {
    const result = evaluateOpenClawRuntimeEvidence(passingPacket());
    expect(result.passed).toBe(true);
    expect(result.state).toBe("CONFIRMED_ACTIVE");
    expect(result.blockers).toEqual([]);
    expect(result.evidenceCoverage).toBe(1);
  });

  it("fails closed when live probe evidence is missing", () => {
    const packet = passingPacket();
    packet.gates = packet.gates.map((gate) =>
      gate.key === "live_channel_probe"
        ? { ...gate, evidenceReference: null }
        : gate,
    );

    const result = evaluateOpenClawRuntimeEvidence(packet);
    expect(result.passed).toBe(false);
    expect(result.state).toBe("CONFIGURED_UNVERIFIED");
    expect(result.blockers).toContain("live_channel_probe");
  });

  it("fails if a gate is duplicated rather than silently accepting the last value", () => {
    const packet = passingPacket();
    packet.gates.push({
      key: "session_isolation",
      passed: true,
      evidenceReference: "audit:duplicate",
    });

    const result = evaluateOpenClawRuntimeEvidence(packet);
    expect(result.passed).toBe(false);
    expect(result.blockers).toContain("session_isolation");
  });

  it("requires runtime version and sanitized channel aliases", () => {
    const packet = passingPacket();
    packet.runtimeVersion = null;
    packet.channelAliases = [];

    const result = evaluateOpenClawRuntimeEvidence(packet);
    expect(result.blockers).toContain("runtime_identity");
  });

  it("rejects audit packets that retained secrets or mutated production", () => {
    const packet = passingPacket();
    packet.rawSecretsIncluded = true;
    packet.productionMutationOccurred = true;

    const result = evaluateOpenClawRuntimeEvidence(packet);
    expect(result.blockers).toEqual(
      expect.arrayContaining(["secret_hygiene", "safe_audit_mode"]),
    );
  });
});
