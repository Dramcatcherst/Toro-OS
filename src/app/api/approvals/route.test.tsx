import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { getApprovalLedgerMock } = vi.hoisted(() => ({
  getApprovalLedgerMock: vi.fn(),
}));

vi.mock("@/lib/server/approval-ledger", () => ({
  getApprovalLedger: getApprovalLedgerMock,
}));

import { OperationalConsole } from "@/components/operational-console";
import { approvalSeed } from "@/lib/approval-store";
import { GET, POST } from "./route";

describe("legacy example approvals", () => {
  it("labels the read as synthetic and not actionable", async () => {
    getApprovalLedgerMock.mockResolvedValue({
      mode: "file_persisted",
      backend: "local_file",
      durable: true,
      approvals: [],
      summary: { Pending: 0, Approved: 0, Rejected: 0, "Needs changes": 0 },
      updatedAt: "2026-09-28T00:00:00.000Z",
    });

    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      synthetic: true,
      actionable: false,
      externalWrite: false,
    });
  });

  it("fails closed on an attempted decision without reading or writing the ledger", async () => {
    getApprovalLedgerMock.mockClear();
    const response = await POST();

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      synthetic: true,
      actionable: false,
      externalWrite: false,
    });
    expect(getApprovalLedgerMock).not.toHaveBeenCalled();
  });

  it("shows example status without approval action buttons", () => {
    const html = renderToStaticMarkup(<OperationalConsole initialApprovals={approvalSeed.slice(0, 1)} />);

    expect(html).toContain("Illustrative Approval Console");
    expect(html).toContain("synthetic · read only");
    expect(html).toContain("Example only. This card cannot approve or reject real work.");
    expect(html).not.toContain("Approve</button>");
    expect(html).not.toContain("Reject</button>");
  });
});
