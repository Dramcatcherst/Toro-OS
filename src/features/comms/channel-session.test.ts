import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  buildChannelReceiptDraft,
  canResumeChannelSession,
  deriveChannelLocatorHash,
  validateChannelSessionDraft,
  type ToroChannelSession,
} from "./channel-session";

const actor = {
  orgId: "595801ce-2895-4d91-81ae-e8d1d5cc8593",
  userId: "6a5c6050-32b3-42f4-ad0e-bf4feefbcef5",
  employeeId: "2dd39f14-2bfb-4850-b433-3a278b6a270b",
  identityId: "5a5c6050-32b3-42f4-ad0e-bf4feefbcef5",
};

describe("TORO Comms durable channel session", () => {
  it("derives a stable non-reversible locator without persisting the raw chat id", () => {
    const first = deriveChannelLocatorHash({
      channel: "whatsapp",
      connectionKey: "toro-interno",
      locator: "50688887777@s.whatsapp.net",
      secret: "unit-test-secret-with-32-characters",
    });
    const second = deriveChannelLocatorHash({
      channel: "whatsapp",
      connectionKey: "toro-interno",
      locator: "50688887777@s.whatsapp.net",
      secret: "unit-test-secret-with-32-characters",
    });

    expect(first).toBe(second);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(first).not.toContain("50688887777");
  });

  it("accepts only an organization-scoped session bound to one canonical actor", () => {
    const result = validateChannelSessionDraft({
      ...actor,
      bindingId: "8a5c6050-32b3-42f4-ad0e-bf4feefbcef5",
      conversationHash: "a".repeat(64),
      activeScope: "work_org",
      humanLayerVersion: "2026.09.29",
      humanLayerHash: "b".repeat(64),
      expiresAt: "2026-09-30T12:00:00.000Z",
    });

    expect(result.ok).toBe(true);
    expect(
      validateChannelSessionDraft({
        ...actor,
        bindingId: "not-a-uuid",
        conversationHash: "raw-chat-id",
        activeScope: "personal",
      }).ok,
    ).toBe(false);
  });

  it("resumes only for the same actor and organization before expiry", () => {
    const session: ToroChannelSession = {
      id: "9a5c6050-32b3-42f4-ad0e-bf4feefbcef5",
      bindingId: "8a5c6050-32b3-42f4-ad0e-bf4feefbcef5",
      ...actor,
      conversationHash: "a".repeat(64),
      status: "active",
      activeScope: "work_org",
      humanLayerVersion: "2026.09.29",
      humanLayerHash: "b".repeat(64),
      expiresAt: "2026-09-30T12:00:00.000Z",
      revokedAt: null,
    };

    expect(
      canResumeChannelSession(session, actor, "2026-09-29T23:00:00.000Z"),
    ).toBe(true);
    expect(
      canResumeChannelSession(
        session,
        { ...actor, userId: "7a5c6050-32b3-42f4-ad0e-bf4feefbcef5" },
        "2026-09-29T23:00:00.000Z",
      ),
    ).toBe(false);
    expect(
      canResumeChannelSession(session, actor, "2026-10-01T00:00:00.000Z"),
    ).toBe(false);
  });

  it("uses a deterministic idempotency hash and canonical-object reference for receipts", () => {
    const receipt = buildChannelReceiptDraft({
      sessionId: "9a5c6050-32b3-42f4-ad0e-bf4feefbcef5",
      bindingId: "8a5c6050-32b3-42f4-ad0e-bf4feefbcef5",
      orgId: actor.orgId,
      direction: "inbound",
      eventKind: "message",
      externalMessageId: "wamid.test-123",
      secret: "unit-test-secret-with-32-characters",
      canonicalObjectType: "operations.task",
      canonicalObjectKey: "task-123",
    });

    expect(receipt.idempotencyHash).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(receipt)).not.toContain("wamid.test-123");
    expect(receipt.canonicalObjectType).toBe("operations.task");
  });

  it("keeps the SQL draft server-only, replay-safe and free of raw identifiers", () => {
    const sql = readFileSync(
      join(
        process.cwd(),
        "supabase/drafts/20260929_toro_comms_durable_channel_session.sql",
      ),
      "utf8",
    ).toLowerCase();

    expect(sql).toContain("communication_channel_sessions");
    expect(sql).toContain("communication_channel_receipts");
    expect(sql).toContain("provider_conversation_hash");
    expect(sql).toContain("idempotency_hash");
    expect(sql).toContain("unique (binding_id, direction, idempotency_hash)");
    expect(sql).toContain("enable row level security");
    expect(sql).toContain("to service_role");
    expect(sql).toContain("from anon");
    expect(sql).toContain("from authenticated");
    expect(sql).not.toMatch(/raw_(phone|chat|message)|phone_number/);
  });
});
