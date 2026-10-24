import { publicDemoResponse } from "@/lib/server/public-demo";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const demo = publicDemoResponse();
  if (demo) return demo;
  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    connector: "github-codex",
    mode: "prepare_only",
    externalWrite: false,
    configured: Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_REPOSITORY),
    issuePayload: {
      repository: body.repository ?? process.env.GITHUB_REPOSITORY ?? "owner/repo-required",
      title: body.title ?? "TORO approved builder task",
      labels: ["toro-os", "approval-required", "prepared-only"],
      body: body.body ?? "Prepared by TORO. Create only after human approval.",
    },
    nextAction: "Provide owner/repo and approval, then create issue through GitHub connector.",
  });
}
