import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { authorizeToroApi, getApprovalLedger, applyApprovalUpdate, persistApprovalLedger } = vi.hoisted(() => ({
  authorizeToroApi: vi.fn(),
  getApprovalLedger: vi.fn(),
  applyApprovalUpdate: vi.fn(),
  persistApprovalLedger: vi.fn(),
}));

vi.mock("@/lib/server/api-auth", () => ({ authorizeToroApi }));
vi.mock("@/lib/approval-store", () => ({ auditSeed: [] }));
vi.mock("@/lib/server/approval-ledger", () => ({
  getApprovalLedger,
  applyApprovalUpdate,
  persistApprovalLedger,
}));

import { GET, POST } from "./route";

const ledger = {
  mode: "server_persisted",
  backend: "supabase",
  durable: true,
  approvals: [{ id: "a1", state: "Pending" }],
  summary: { Pending: 1, Approved: 0, Rejected: 0, "Needs changes": 0 },
  updatedAt: "2026-09-17T22:00:00.000Z",
};

describe("/api/approvals authorization", () => {
  beforeEach(() => {
    authorizeToroApi.mockReset();
    getApprovalLedger.mockReset();
    applyApprovalUpdate.mockReset();
    persistApprovalLedger.mockReset();
    authorizeToroApi.mockResolvedValue({
      ok: true,
      session: { userId: "u1", email: null, displayName: "Founder", role: "FOUNDER" },
    });
    getApprovalLedger.mockResolvedValue(ledger);
  });

  it("blocks unauthenticated reads before loading the ledger", async () => {
    authorizeToroApi.mockResolvedValue({
      ok: false,
      response: new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 }),
    });
    const response = await GET();
    expect(response.status).toBe(401);
    expect(getApprovalLedger).not.toHaveBeenCalled();
  });

  it("blocks unauthorized writes before reading or persisting the ledger", async () => {
    authorizeToroApi.mockResolvedValue({
      ok: false,
      response: new Response(JSON.stringify({ error: "forbidden" }), { status: 403 }),
    });
    const request = new NextRequest("http://localhost/api/approvals", {
      method: "POST",
      body: JSON.stringify({ id: "a1", state: "Approved" }),
      headers: { "content-type": "application/json" },
    });
    const response = await POST(request);
    expect(response.status).toBe(403);
    expect(getApprovalLedger).not.toHaveBeenCalled();
    expect(persistApprovalLedger).not.toHaveBeenCalled();
  });

  it("uses the Founder/Gerencia gate for both reads and writes", async () => {
    await GET();
    expect(authorizeToroApi).toHaveBeenCalledWith(["FOUNDER", "GERENCIA"]);

    applyApprovalUpdate.mockReturnValue([{ id: "a1", state: "Approved" }]);
    persistApprovalLedger.mockResolvedValue({
      mode: "server_persisted",
      backend: "supabase",
      durable: true,
      updatedAt: "2026-09-17T22:05:00.000Z",
    });

    const request = new NextRequest("http://localhost/api/approvals", {
      method: "POST",
      body: JSON.stringify({ id: "a1", state: "Approved" }),
      headers: { "content-type": "application/json" },
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(authorizeToroApi).toHaveBeenLastCalledWith(["FOUNDER", "GERENCIA"]);
  });
});
