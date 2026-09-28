import { NextResponse } from "next/server";
import { auditSeed } from "@/lib/approval-store";
import { getApprovalLedger } from "@/lib/server/approval-ledger";

export async function GET() {
  const ledger = await getApprovalLedger();

  return NextResponse.json({
    mode: ledger.mode,
    backend: ledger.backend,
    durable: ledger.durable,
    externalWrite: false,
    synthetic: true,
    actionable: false,
    approvals: ledger.approvals,
    summary: ledger.summary,
    updatedAt: ledger.updatedAt,
    audit: auditSeed,
  });
}

export async function POST() {
  return NextResponse.json({
    mode: "synthetic_read_only",
    externalWrite: false,
    synthetic: true,
    actionable: false,
    error: "Example approvals cannot record a decision. Use a verified canonical decision and authorization flow.",
  }, { status: 403 });
}
