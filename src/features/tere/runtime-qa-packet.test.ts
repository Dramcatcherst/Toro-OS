import { describe, expect, it } from "vitest";

import packet from "../../../data/tere_v5_runtime_qa_cases_v1.json";
import template from "../../../data/tere_v5_runtime_evidence_template_v1.json";
import { nextQuoteHandoffQuestion, prepareQuoteHandoff } from "../kross/quote-handoff";
import { evaluateTereRuntimeAcceptance } from "./runtime-acceptance";
import { validateTereRuntimeEvidencePacket } from "./runtime-evidence";

describe("TERE V5 runtime QA packet", () => {
  it("keeps the canonical five scenario keys", () => {
    expect(packet.cases.map((item) => item.key)).toEqual([
      "first_contact",
      "quote_without_live_truth",
      "in_stay_problem",
      "payment_sensitive",
      "navigation_shortcuts",
    ]);
  });

  it("keeps every case bounded with expected and forbidden behavior", () => {
    for (const item of packet.cases) {
      expect(item.expected.length).toBeGreaterThan(0);
      expect(item.forbidden.length).toBeGreaterThan(0);
    }
  });

  it("forbids real guest contact and sensitive writes at packet level", () => {
    expect(packet.rules.real_guest_contact).toBe(false);
    expect(packet.rules.external_sensitive_send).toBe(false);
    expect(packet.rules.reservation_write).toBe(false);
    expect(packet.rules.payment_write).toBe(false);
    expect(packet.rules.price_or_availability_write).toBe(false);
    expect(packet.rules.synthetic_identity_required).toBe(true);
  });

  it("binds the packet to the canonical V5 hash", () => {
    expect(packet.target_config.expected_hash).toBe(
      "0cab1a8be477f9bc6f25ceaeb5df56c7",
    );
  });

  it("adds the two P0 families without replacing the five required runtime scenarios", () => {
    expect(packet.offline_regressions).toHaveLength(5);
    expect(new Set(packet.offline_regressions.map((item) => item.intent))).toEqual(
      new Set(["room_terrace", "quote_without_live_truth"]),
    );
    expect(packet.cases).toHaveLength(5);
  });

  it("preserves known dates and occupancy in the existing quote handoff", () => {
    const quotes = packet.offline_regressions.filter(
      (item) => item.intent === "quote_without_live_truth",
    );
    for (const item of quotes) {
      const preparation = prepareQuoteHandoff(item.facts);
      if (item.facts.adults === null) {
        expect(preparation).toEqual({ state: "needs_input", path: null, missing: ["adults"] });
        expect(nextQuoteHandoffQuestion(preparation)).toBe("¿Cuántos adultos serían?");
      } else {
        expect(preparation.state).toBe("ready");
        expect(nextQuoteHandoffQuestion(preparation)).toBeNull();
        if (preparation.state === "ready") {
          const url = new URL(preparation.path, "https://qa.example.invalid");
          expect(url.pathname).toBe("/booking-assist");
          expect(url.searchParams.get("from")).toBe(item.facts.from);
          expect(url.searchParams.get("to")).toBe(item.facts.to);
        }
      }
    }
  });

  it("does not accept offline answers as native runtime evidence", () => {
    const target = {
      configAppliedAt: packet.target_config.applied_at,
      expectedConfigHash: packet.target_config.expected_hash,
    };
    const offline = validateTereRuntimeEvidencePacket(packet, target);
    expect(offline.valid).toBe(false);
    expect(offline.acceptanceInput).toBeNull();

    const substituted = validateTereRuntimeEvidencePacket({
      ...template,
      scenarios: packet.offline_regressions.map((item) => ({ key: item.id, passed: true })),
    }, target);
    expect(substituted.valid).toBe(false);

    const unchanged = validateTereRuntimeEvidencePacket(template, target);
    expect(unchanged.valid).toBe(true);
    const result = evaluateTereRuntimeAcceptance(unchanged.acceptanceInput!);
    expect(result.passed).toBe(false);
    expect(result.runtimeConsumptionState).toBe("RUNTIME_UNVERIFIED");
  });
});
