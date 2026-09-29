import { afterEach, describe, expect, it, vi } from "vitest";

import {
  consumeOpenClawPairing,
  hashOpenClawPairingToken,
  issueOpenClawPairing,
  revokeOpenClawChannelIdentity,
} from "./pairing";

describe("OpenClaw pairing primitives", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("hashes the one-time token before persistence/consumption", () => {
    expect(hashOpenClawPairingToken("synthetic-one-time-token")).toMatch(
      /^[a-f0-9]{64}$/,
    );
    expect(hashOpenClawPairingToken("token-a")).not.toBe(
      hashOpenClawPairingToken("token-b"),
    );
  });

  it("requires a canonical employee id and valid channel before issuing", async () => {
    await expect(
      issueOpenClawPairing({
        employeeId: "Mauricio",
        channel: "whatsapp",
        connectionKey: "hotel-main",
      }),
    ).resolves.toMatchObject({
      state: "invalid",
    });

    await expect(
      issueOpenClawPairing({
        employeeId: "00000000-0000-4000-8000-000000000001",
        channel: "bad channel",
        connectionKey: "hotel-main",
      }),
    ).resolves.toMatchObject({
      state: "invalid",
    });
  });

  it("requires a canonical identity id before revocation", async () => {
    await expect(
      revokeOpenClawChannelIdentity({ identityId: "phone-number" }),
    ).resolves.toMatchObject({
      state: "invalid",
    });
  });

  it("consumes a one-time token only through the server RPC using hashed values", async () => {
    vi.stubEnv("TORO_CHANNEL_IDENTITY_HMAC_SECRET", "h".repeat(48));
    const rpc = vi.fn().mockResolvedValue({
      data: { status: "bound", identity_id: "private-id" },
      error: null,
    });

    const result = await consumeOpenClawPairing(
      {
        token: "t".repeat(48),
        identity: {
          channel: "WhatsApp",
          connectionKey: "hotel-main",
          subject: "provider-sender-id",
        },
      },
      { rpc } as never,
    );

    expect(result).toEqual({ state: "bound" });
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith(
      "consume_employee_channel_enrollment_v1",
      expect.objectContaining({
        p_token_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
        p_subject_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
        p_channel: "whatsapp",
        p_connection_key: "hotel-main",
      }),
    );

    const params = rpc.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(JSON.stringify(params)).not.toContain("provider-sender-id");
    expect(JSON.stringify(params)).not.toContain("t".repeat(48));
  });

  it("does not expose actor identifiers returned by the enrollment RPC", async () => {
    vi.stubEnv("TORO_CHANNEL_IDENTITY_HMAC_SECRET", "h".repeat(48));
    const rpc = vi.fn().mockResolvedValue({
      data: {
        status: "already_used",
        identity_id: "identity-private",
        employee_id: "employee-private",
        org_id: "org-private",
      },
      error: null,
    });

    await expect(
      consumeOpenClawPairing(
        {
          token: "t".repeat(48),
          identity: {
            channel: "whatsapp",
            connectionKey: "hotel-main",
            subject: "sender-private",
          },
        },
        { rpc } as never,
      ),
    ).resolves.toEqual({ state: "already_used" });
  });

  it("fails closed when channel hashing is not configured", async () => {
    vi.stubEnv("TORO_CHANNEL_IDENTITY_HMAC_SECRET", "");
    const rpc = vi.fn();

    await expect(
      consumeOpenClawPairing(
        {
          token: "t".repeat(48),
          identity: {
            channel: "whatsapp",
            connectionKey: "hotel-main",
            subject: "sender",
          },
        },
        { rpc } as never,
      ),
    ).resolves.toMatchObject({
      state: "unavailable",
    });

    expect(rpc).not.toHaveBeenCalled();
  });
});
