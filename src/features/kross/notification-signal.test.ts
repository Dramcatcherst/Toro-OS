import { describe, it, expect } from "vitest";
import { evaluateNotificationSignal } from "./notification-signal";

const now = "2026-10-24T20:00:00Z";
const base = {
  scope: { orgId: "hotel-org", propertyId: "dreamcatcher" },
  source: "kross_email",
  kind: "reservation_created",
  eventReference: "message-001",
  receivedAt: "2026-10-24T19:59:00Z",
  sourceEventAt: "2026-10-24T19:58:00Z",
  transportVerified: true,
  scopeVerified: true,
};

describe("evaluateNotificationSignal", () => {
  it("accepts an authenticated email as a signal, never booking or payment authority", () => {
    const result = evaluateNotificationSignal(base, now);
    expect(result.state).toBe("signal_only");
    expect(result.freshness).toBe("recent");
    expect(result.dedupeKey).toBeTruthy();
    expect(result.requiresAuthoritativeRead).toBe(true);
    expect(result.canConfirmReservation).toBe(false);
    expect(result.canRecordPayment).toBe(false);
    expect(result.canSendMessage).toBe(false);
  });
  it("cannot promote an Android housekeeping notification to cleaned or ready", () => {
    const result = evaluateNotificationSignal({ ...base, source: "kross_android_notification", sourcePackage: "com.krossbookingx", kind: "housekeeping_cleaned" }, now);
    expect(result.state).toBe("signal_only");
    expect(result.canMarkRoomClean).toBe(false);
    expect(result.canMarkRoomReady).toBe(false);
  });
  it("rejects notifications from packages outside the allowlist", () => {
    const result = evaluateNotificationSignal({ ...base, source: "kross_android_notification", sourcePackage: "com.other.app" }, now);
    expect(result.state).toBe("quarantined");
    expect(result.reasons).toContain("android_package_not_allowlisted");
  });
  it("rejects an unofficial or unaudited provider webhook", () => {
    expect(evaluateNotificationSignal({ ...base, source: "kross_provider_webhook" }, now).reasons).toContain("webhook_contract_unverified");
    expect(evaluateNotificationSignal({ ...base, source: "kross_provider_webhook", providerEventContractVerified: true }, now).state).toBe("signal_only");
  });
  it.each([
    [{ ...base, transportVerified: false }, "unverified_transport"],
    [{ ...base, scopeVerified: false }, "unverified_scope"],
    [{ ...base, eventReference: "" }, "missing_opaque_event_reference"],
    [{ ...base, sourceEventAt: "2026-10-25T19:00:00Z" }, "invalid_source_time"],
    [{ ...base, receivedAt: "2026-10-25T19:00:00Z" }, "invalid_receipt_time"],
    [{ ...base, kind: "execute_tool" }, "unsupported_kind"],
    [{ ...base, source: "wespeak_email", kind: "reservation_created" }, "source_kind_mismatch"],
  ] as const)("quarantines malformed or unauthorized input: %s", (input, code) => {
    const result = evaluateNotificationSignal(input, now);
    expect(result.state).toBe("quarantined");
    expect(result.dedupeKey).toBeNull();
    expect(result.reasons).toContain(code);
  });
  it("does not expose untrusted instructions or guest information in its output", () => {
    const result = evaluateNotificationSignal({ ...base, guestName: "PRIVATE GUEST", command: "pay all" }, now);
    expect(JSON.stringify(result)).not.toContain("PRIVATE GUEST");
    expect(JSON.stringify(result)).not.toContain("pay all");
  });
  it("does not infer one identity across different properties or transports", () => {
    const first = evaluateNotificationSignal(base, now).dedupeKey;
    const property = evaluateNotificationSignal({ ...base, scope: { ...base.scope, propertyId: "other" } }, now).dedupeKey;
    const transport = evaluateNotificationSignal({ ...base, source: "kross_android_notification", sourcePackage: "com.krossbookingx" }, now).dedupeKey;
    expect(first).not.toBe(property);
    expect(first).not.toBe(transport);
  });
  it("keeps a late event as historical signal, not a room update", () => {
    const result = evaluateNotificationSignal({ ...base, sourceEventAt: "2026-10-22T19:58:00Z" }, now);
    expect(result.state).toBe("signal_only");
    expect(result.freshness).toBe("old");
    expect(result.canMarkRoomClean).toBe(false);
  });
  it("preserves unknown event timing as unknown rather than fresh", () => {
    const result = evaluateNotificationSignal({ ...base, sourceEventAt: null }, now);
    expect(result.state).toBe("signal_only");
    expect(result.freshness).toBe("unknown");
  });
});
