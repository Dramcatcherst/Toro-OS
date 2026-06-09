import { NextRequest, NextResponse } from "next/server";
import { auditSeed } from "@/lib/approval-store";
import { applyApprovalUpdate, getApprovalLedger, writeApprovalLedger } from "@/lib/server/approval-ledger";
import type { ApprovalState } from "@/lib/toro-types";

export async function GET() {
  const ledger = await getApprovalLedger();

  return NextResponse.json({
    mode: "server_persisted",
    externalWrite: false,
    approvals: ledger.approvals,
    summary: ledger.summary,
    audit: auditSeed,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const approvalId = typeof body.id === "string" ? body.id : null;
  const requestedState = body.state as ApprovalState | undefined;
  const isValidState = requestedState === "Pending" || requestedState === "Approved" || requestedState === "Rejected" || requestedState === "Needs changes";

  if (!approvalId || !isValidState) {
    return NextResponse.json(
      {
        mode: "server_persisted",
        externalWrite: false,
        error: "Approval id and valid state are required.",
      },
      { status: 400 },
    );
  }

  const ledger = await getApprovalLedger();
  const approvals = applyApprovalUpdate(ledger.approvals, approvalId, requestedState);
  const response = NextResponse.json({
    mode: "server_persisted",
    externalWrite: false,
    approvalId,
    requestedState,
    approvals,
    summary: approvals.reduce(
      (acc, approval) => {
        acc[approval.state] += 1;
        return acc;
      },
      { Pending: 0, Approved: 0, Rejected: 0, "Needs changes": 0 } as Record<ApprovalState, number>,
    ),
    auditMessage: "Approval decision persisted in the TORO OS server ledger cookie. No external system was modified.",
    updatedAt: new Date().toISOString(),
  });

  writeApprovalLedger(response.cookies, approvals);
  return response;
}
