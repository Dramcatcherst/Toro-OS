import { describe, expect, it } from "vitest";

import {
  resolveCanonicalChannelBinding,
  type ChannelBindingRecord,
} from "./channel-binding";

const OWNER_DIGEST = "1".repeat(64);
const OTHER_DIGEST = "2".repeat(64);
const NOW = "2026-10-14T12:00:00.000Z";

function record(overrides: Partial<ChannelBindingRecord> = {}): ChannelBindingRecord {
  return {
    bindingKey: "binding-owner-whatsapp",
    subject: { kind: "person", key: "mauricio_owner" },
    transport: "whatsapp",
    runtime: "openclaw",
    channelAccountKey: "toro-interno",
    senderKeyDigest: OWNER_DIGEST,
    status: "verified",
    organizationId: "dreamcatcher",
    propertyIds: ["main-property", "main-property"],
    verifiedAt: "2026-10-14T10:00:00.000Z",
    expiresAt: "2026-11-14T10:00:00.000Z",
    ...overrides,
  };
}

const request = {
  transport: "whatsapp" as const,
  runtime: "openclaw" as const,
  channelAccountKey: "toro-interno",
  senderKeyDigest: OWNER_DIGEST,
  now: NOW,
};

describe("resolveCanonicalChannelBinding", () => {
  it("resolves one verified binding without returning its sender digest", () => {
    const result = resolveCanonicalChannelBinding([record()], request);
    expect(result).toEqual({
      ok: true,
      binding: {
        bindingKey: "binding-owner-whatsapp",
        subject: { kind: "person", key: "mauricio_owner" },
        transport: "whatsapp",
        runtime: "openclaw",
        channelAccountKey: "toro-interno",
        status: "verified",
        organizationId: "dreamcatcher",
        propertyIds: ["main-property"],
        verifiedAt: "2026-10-14T10:00:00.000Z",
        expiresAt: "2026-11-14T10:00:00.000Z",
      },
    });
  });

  it.each([
    ["unknown sender", [record()], { ...request, senderKeyDigest: OTHER_DIGEST }, "binding_not_found"],
    ["wrong account", [record()], { ...request, channelAccountKey: "other" }, "binding_not_found"],
    ["raw identifier", [record()], { ...request, senderKeyDigest: "+15550102030" }, "invalid_request"],
    ["duplicate binding", [record(), record({ bindingKey: "duplicate" })], request, "binding_ambiguous"],
    ["revoked binding", [record({ status: "revoked" })], request, "binding_not_verified"],
    ["future verification", [record({ verifiedAt: "2026-10-15T10:00:00.000Z" })], request, "binding_expired"],
    ["expired binding", [record({ expiresAt: NOW })], request, "binding_expired"],
  ])("fails closed for %s", (_label, records, candidate, reason) => {
    expect(resolveCanonicalChannelBinding(records as ChannelBindingRecord[], candidate)).toEqual({ ok: false, reason });
  });
});
