import { describe, expect, it } from "vitest";

import packet from "../../../data/tere_v5_runtime_qa_cases_v1.json";

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
});
