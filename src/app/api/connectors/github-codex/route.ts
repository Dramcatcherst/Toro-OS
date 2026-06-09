import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    connector: "github-codex",
    mode: "prepare_only",
    externalWrite: false,
    configured: Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_REPOSITORY),
    issuePayload: {
      repository: body.repository ?? process.env.GITHUB_REPOSITORY ?? "owner/repo-required",
      title: body.title ?? "TORO OS approved builder task",
      labels: ["toro-os", "approval-required", "prepared-only"],
      body: body.body ?? "Prepared by TORO OS. Create only after human approval.",
    },
    nextAction: "Provide owner/repo and approval, then create issue through GitHub connector.",
  });
}
