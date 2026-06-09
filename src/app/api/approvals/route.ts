import { NextResponse } from "next/server";
import { approvalSeed, auditSeed } from "@/lib/approval-store";

export async function GET() {
  return NextResponse.json({
    mode: "read_only",
    externalWrite: false,
    approvals: approvalSeed,
    audit: auditSeed,
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    mode: "prepare_only",
    externalWrite: false,
    requestedState: body.state ?? "Pending",
    approvalId: body.id ?? null,
    auditMessage: "Approval changes are prepared for local persistence. No external system was modified.",
    updatedAt: new Date().toISOString(),
  });
}
