import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();

vi.mock("@/features/auth/session", () => ({
  getToroSession: async () => ({
    userId: "00000000-0000-4000-8000-000000000001",
    email: "synthetic@example.invalid",
    displayName: "Synthetic QA",
    role: "GERENCIA",
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: async () => ({ rpc }),
}));

import { listMyDecisions } from "./server";

const rows = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    title: "Decisión P0",
    domain: "hotel",
    urgency: "P0",
    recommendation: "Aprobar",
    rationale: "Impacto inmediato",
    evidence: "evidence://1",
    owner: "Mauricio",
    deadline: null,
    approval_level: "founder_approval",
    status: "Pendiente",
  },
];

describe("listMyDecisions", () => {
  beforeEach(() => {
    rpc.mockReset();
  });

  it("requests at most five decisions by default", async () => {
    rpc.mockResolvedValue({ data: rows, error: null });
    await listMyDecisions({});
    expect(rpc).toHaveBeenCalledWith("list_my_decisions", { p_limit: 5 });
  });

  it("caps caller limits at twenty", async () => {
    rpc.mockResolvedValue({ data: rows, error: null });
    await listMyDecisions({ limit: 99 });
    expect(rpc).toHaveBeenCalledWith("list_my_decisions", { p_limit: 20 });
  });

  it("preserves governed evidence fields", async () => {
    rpc.mockResolvedValue({ data: rows, error: null });
    await expect(listMyDecisions({ limit: 5 })).resolves.toEqual([
      {
        id: rows[0].id,
        title: "Decisión P0",
        domain: "hotel",
        urgency: "P0",
        recommendation: "Aprobar",
        rationale: "Impacto inmediato",
        evidence: "evidence://1",
        owner: "Mauricio",
        deadline: null,
        approvalLevel: "founder_approval",
        status: "Pendiente",
      },
    ]);
  });

  it("omits decisions whose status is not explicitly pending", async () => {
    rpc.mockResolvedValue({
      data: [
        rows[0],
        { ...rows[0], id: "00000000-0000-0000-0000-000000000002", status: "En ejecución" },
        { ...rows[0], id: "00000000-0000-0000-0000-000000000003", status: "Desconocido" },
      ],
      error: null,
    });

    await expect(listMyDecisions({ limit: 5 })).resolves.toEqual([
      {
        id: rows[0].id,
        title: "Decisión P0",
        domain: "hotel",
        urgency: "P0",
        recommendation: "Aprobar",
        rationale: "Impacto inmediato",
        evidence: "evidence://1",
        owner: "Mauricio",
        deadline: null,
        approvalLevel: "founder_approval",
        status: "Pendiente",
      },
    ]);
  });

  it("fails closed on malformed privileged payload", async () => {
    rpc.mockResolvedValue({ data: [{ id: "bad" }], error: null });
    await expect(listMyDecisions({})).rejects.toThrow(/decision payload/i);
  });

  it("does not convert authorization/RPC failures into partial data", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "permission denied" } });
    await expect(listMyDecisions({})).rejects.toThrow(/permission denied/i);
  });
});
