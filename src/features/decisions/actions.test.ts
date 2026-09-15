import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: async () => ({ rpc }),
}));

import { resolveDecision } from "./actions";

const decisionId = "00000000-0000-0000-0000-000000000001";

describe("resolveDecision", () => {
  beforeEach(() => {
    rpc.mockReset();
  });

  it("delegation requires a target before calling the RPC", async () => {
    await expect(
      resolveDecision({ decisionId, action: "delegate" }),
    ).rejects.toThrow(/delegate/i);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("high-risk rejection requires an explanatory note", async () => {
    await expect(
      resolveDecision({ decisionId, action: "reject" }),
    ).rejects.toThrow(/note/i);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("calls the governed RPC with normalized input", async () => {
    rpc.mockResolvedValue({
      data: {
        decision_id: decisionId,
        action: "delegate",
        status: "delegated",
        audited_at: "2026-09-14T21:50:00Z",
      },
      error: null,
    });

    await expect(
      resolveDecision({
        decisionId,
        action: "delegate",
        note: "Seguimiento operativo",
        delegateTo: "Gerencia",
      }),
    ).resolves.toEqual({
      decisionId,
      action: "delegate",
      status: "delegated",
      auditedAt: "2026-09-14T21:50:00Z",
    });

    expect(rpc).toHaveBeenCalledWith("resolve_toro_decision", {
      p_decision_id: decisionId,
      p_action: "delegate",
      p_note: "Seguimiento operativo",
      p_delegate_to: "Gerencia",
    });
  });

  it("fails closed when the RPC denies authorization", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "permission denied" } });

    await expect(
      resolveDecision({ decisionId, action: "approve" }),
    ).rejects.toThrow(/permission denied/i);
  });

  it("rejects malformed audit results instead of assuming success", async () => {
    rpc.mockResolvedValue({ data: { status: "ok" }, error: null });

    await expect(
      resolveDecision({ decisionId, action: "postpone", note: "Mañana" }),
    ).rejects.toThrow(/action result/i);
  });
});
