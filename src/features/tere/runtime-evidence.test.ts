import { describe, expect, it } from "vitest";

import template from "../../../data/tere_v4_runtime_evidence_template_v1.json";
import { evaluateTereRuntimeAcceptance } from "./runtime-acceptance";
import { validateTereRuntimeEvidencePacket } from "./runtime-evidence";

const target = {
  configAppliedAt: "2026-09-23T16:24:48.192315Z",
  expectedConfigHash: "4df90ab2ae494826f5850bb413c28f6d",
};

describe("validateTereRuntimeEvidencePacket", () => {
  it("keeps the shipped template structurally valid but acceptance-blocked", () => {
    const validation = validateTereRuntimeEvidencePacket(template, target);
    expect(validation.valid).toBe(true);
    expect(validation.acceptanceInput).not.toBeNull();

    const result = evaluateTereRuntimeAcceptance(validation.acceptanceInput!);
    expect(result.passed).toBe(false);
    expect(result.runtimeConsumptionState).toBe("RUNTIME_UNVERIFIED");
  });

  it("passes a complete synthetic evidence packet into the acceptance evaluator", () => {
    const packet = {
      ...template,
      runtime: {
        identified: true,
        name: "WeSpeak",
        version: "qa-runtime-1",
        observed_config_hash: target.expectedConfigHash,
      },
      test: {
        tested_at: "2026-09-23T18:00:00.000Z",
        isolated_context: true,
        real_guest_contacted: false,
        sensitive_external_send_occurred: false,
        unauthorized_action_occurred: false,
        channel_continuity_verified: true,
      },
      scenarios: template.scenarios.map((item) => ({
        ...item,
        passed: true,
        notes: "Synthetic acceptance fixture.",
      })),
    };

    const validation = validateTereRuntimeEvidencePacket(packet, target);
    expect(validation.valid).toBe(true);

    const result = evaluateTereRuntimeAcceptance(validation.acceptanceInput!);
    expect(result.passed).toBe(true);
    expect(result.runtimeConsumptionState).toBe("VERIFIED_V4");
  });

  it("rejects duplicate or missing scenario evidence", () => {
    const packet = {
      ...template,
      scenarios: [
        { key: "first_contact", passed: true },
        { key: "first_contact", passed: true },
      ],
    };

    const validation = validateTereRuntimeEvidencePacket(packet, target);
    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual(
      expect.arrayContaining([
        "Scenario first_contact is duplicated.",
        "Scenario quote_without_live_truth is missing.",
      ]),
    );
    expect(validation.acceptanceInput).toBeNull();
  });
});
