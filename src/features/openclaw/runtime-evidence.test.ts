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
    expect(result.packetComplete).toBe(true);
    expect(result.state).toBe("EVIDENCE_PACKET_COMPLETE_UNVERIFIED");
    expect(result.blockers).toEqual([]);
    expect(result.evidenceCoverage).toBe(1);
  });

  it("does not confirm a runtime from arbitrary evidence reference strings", () => {
    const packet = passingPacket();
    packet.gates = packet.gates.map((gate) => ({ ...gate, evidenceReference: `invented:${gate.key}` }));
    const result = evaluateOpenClawRuntimeEvidence(packet);
    expect(result.packetComplete).toBe(true);
    expect(result.state).toBe("EVIDENCE_PACKET_COMPLETE_UNVERIFIED");
  });

  it("fails closed when live probe evidence is missing", () => {
    const packet = passingPacket();
    packet.gates = packet.gates.map((gate) =>
      gate.key === "live_channel_probe"
        ? { ...gate, evidenceReference: null }
        : gate,
    );

    const result = evaluateOpenClawRuntimeEvidence(packet);
    expect(result.packetComplete).toBe(false);
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
    expect(result.packetComplete).toBe(false);
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


describe("C50-10 strict bounded runtime packet", () => {
  it.each(["false", "true", 1, null])("requires literal true for gate passed=%j", (passed) => {
    const packet = passingPacket();
    packet.gates = packet.gates.map((gate) => ({ ...gate, passed })) as never;
    expect(evaluateOpenClawRuntimeEvidence(packet).packetComplete).toBe(false);
  });

  it.each([
    { profileKey: "not-a-profile" }, { channelAliases: [""] }, { channelAliases: [" "] },
    { channelAliases: null }, { runtimeVersion: "x".repeat(129) }, { gates: null },
    { gates: [null] }, { channelAliases: Array(129).fill("fixture") },
  ])("blocks malformed packet identity or collections %j", (patch) => {
    expect(evaluateOpenClawRuntimeEvidence({ ...passingPacket(), ...patch } as never)).toMatchObject({
      packetComplete: false, state: "CONFIGURED_UNVERIFIED",
    });
  });

  it("blocks unknown gate keys and oversized references instead of ignoring malformed evidence", () => {
    const packet = passingPacket();
    packet.gates.push({ key: "not-a-gate", passed: true, evidenceReference: "audit:fixture" } as never);
    expect(evaluateOpenClawRuntimeEvidence(packet).packetComplete).toBe(false);
    const oversize = passingPacket();
    oversize.gates[0].evidenceReference = "x".repeat(2049);
    expect(evaluateOpenClawRuntimeEvidence(oversize).packetComplete).toBe(false);
  });

  it("bounds optional evidence fields and rejects unknown or sparse schema members", () => {
    for (const patch of [
      { notes: "x".repeat(4097) }, { findingIds: Array(129).fill("fixture") },
      { findingIds: new Array(2) }, { extraPrivatePayload: "fixture" },
    ]) {
      const packet = passingPacket();
      packet.gates[0] = { ...packet.gates[0], ...patch };
      expect(evaluateOpenClawRuntimeEvidence(packet).packetComplete).toBe(false);
    }
    expect(evaluateOpenClawRuntimeEvidence({ ...passingPacket(), extraPayload: "fixture" }).packetComplete).toBe(false);
    expect(evaluateOpenClawRuntimeEvidence({ ...passingPacket(), gates: new Array(14) }).packetComplete).toBe(false);
    expect(evaluateOpenClawRuntimeEvidence({ ...passingPacket(), gates: Array(129).fill(passingPacket().gates[0]) }).packetComplete).toBe(false);
  });

  it("returns a safe blocker for nonobject packet input", () => {
    for (const input of [null, undefined, [], "packet"]) {
      expect(evaluateOpenClawRuntimeEvidence(input as never)).toMatchObject({ packetComplete: false, state: "CONFIGURED_UNVERIFIED", evidenceCoverage: 0 });
    }
  });
});
