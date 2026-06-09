import { NextRequest, NextResponse } from "next/server";
import { auditSeed } from "@/lib/approval-store";
import { applyApprovalUpdate, getApprovalLedger, persistApprovalLedger } from "@/lib/server/approval-ledger";
import type { ApprovalState } from "@/lib/toro-types";

export async function GET() {
  const ledger = await getApprovalLedger();

  return NextResponse.json({
    mode: ledger.mode,
    backend: ledger.backend,
    durable: ledger.durable,
    externalWrite: false,
    approvals: ledger.approvals,
    summary: ledger.summary,
    updatedAt: ledger.updatedAt,
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
  const summary = approvals.reduce(
    (acc, approval) => {
      acc[approval.state] += 1;
      return acc;
    },
    { Pending: 0, Approved: 0, Rejected: 0, "Needs changes": 0 } as Record<ApprovalState, number>,
  );

  if (ledger.backend !== "cookie_fallback") {
    const persisted = await persistApprovalLedger(approvals);
    return NextResponse.json({
      mode: persisted.mode,
      backend: persisted.backend,
      durable: persisted.durable,
      externalWrite: false,
      approvalId,
      requestedState,
      approvals,
      summary,
      auditMessage: "Approval decision persisted in the TORO OS internal ledger store. No external business system was modified.",
      updatedAt: persisted.updatedAt,
    });
  }

  const response = NextResponse.json({
    mode: "cookie_fallback",
    backend: "cookie_fallback",
    durable: false,
    externalWrite: false,
    approvalId,
    requestedState,
    approvals,
    summary,
    auditMessage: "Approval decision fell back to cookie persistence because no durable store is configured.",
    updatedAt: new Date().toISOString(),
  });

  const persisted = await persistApprovalLedger(approvals, response.cookies);
  return NextResponse.json({
    mode: persisted.mode,
    backend: persisted.backend,
    durable: persisted.durable,
    externalWrite: false,
    approvalId,
    requestedState,
    approvals,
    summary,
    auditMessage: "Approval decision fell back to cookie persistence because no durable store is configured.",
    updatedAt: persisted.updatedAt,
  }, { headers: response.headers });
}
