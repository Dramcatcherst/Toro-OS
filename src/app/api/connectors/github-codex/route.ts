import { NextResponse } from "next/server";

import { authorizeToroApi } from "@/lib/server/api-auth";

const builderRoles = ["FOUNDER", "SYSTEMS"] as const;

export async function POST(request: Request) {
  const auth = await authorizeToroApi(builderRoles);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    connector: "github-codex",
    mode: "prepare_only",
    externalWrite: false,
    configured: Boolean(
      process.env.GITHUB_TOKEN && process.env.GITHUB_REPOSITORY,
    ),
    issuePayload: {
      repository:
        typeof body.repository === "string" && body.repository.trim()
          ? body.repository.trim()
          : process.env.GITHUB_REPOSITORY ?? "owner/repo-required",
      title:
        typeof body.title === "string" && body.title.trim()
          ? body.title.trim()
          : "TORO OS approved builder task",
      labels: ["toro-os", "approval-required", "prepared-only"],
      body:
        typeof body.body === "string" && body.body.trim()
          ? body.body.trim()
          : "Prepared by TORO OS. Create only after human approval.",
    },
    nextAction:
      "Human approval is still required before any external GitHub write.",
  });
}
