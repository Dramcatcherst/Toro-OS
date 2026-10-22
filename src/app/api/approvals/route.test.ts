import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const ledger = vi.hoisted(() => ({ read: vi.fn(), write: vi.fn() }));
vi.mock("@/lib/server/approval-ledger", () => ({
  getApprovalLedger: ledger.read,
  persistApprovalLedger: ledger.write,
  applyApprovalUpdate: vi.fn(() => []),
}));
import { GET, POST } from "./route";

afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

describe("retired legacy approval endpoint", () => {
  it.each([["internal", "GET"], ["internal", "POST"], ["portal", "GET"], ["portal", "POST"]])("rejects %s %s without ledger I/O", async (mode, method) => {
    vi.stubEnv("TORO_DEPLOYMENT_MODE", mode);
    vi.stubEnv("TORO_LEGACY_OPERATIONS_ENABLED", "true");
    ledger.read.mockResolvedValue({ approvals: [], summary: {}, backend: "cookie_fallback" });
    ledger.write.mockResolvedValue({ backend: "cookie_fallback", durable: false });
    const response = method === "GET" ? await GET() : await POST(new NextRequest("https://toro.invalid/api/approvals", {
      method: "POST", headers: { cookie: "toro_os_approvals_v03=synthetic-forged-decision" },
      body: JSON.stringify({ id: "synthetic-id", state: "Approved" }),
    }));
    expect(response.status).toBe(410);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(await response.json()).toEqual({ state: "legacy_approvals_retired", externalWrite: false });
    expect(ledger.read).not.toHaveBeenCalled();
    expect(ledger.write).not.toHaveBeenCalled();
  });
});
