import { NextResponse } from "next/server";

import { authorizeToroApi } from "@/lib/server/api-auth";
import { readVercelDeployments } from "@/lib/server/read-only-connectors";

const vercelRoles = ["FOUNDER", "SYSTEMS"] as const;

export async function GET() {
  const auth = await authorizeToroApi(vercelRoles);
  if (!auth.ok) return auth.response;

  const projectId =
    process.env.VERCEL_PROJECT_ID ?? "prj_nzsVpQZree5WuErakMPKIyiK6gsA";
  const teamId =
    process.env.VERCEL_TEAM_ID ?? "team_zUbLBlOtoQBHDfGMYpDlg0XO";
  const liveRead = await readVercelDeployments({ projectId, teamId });

  return NextResponse.json({
    connector: "vercel",
    mode: "read_only",
    externalWrite: false,
    configured: Boolean(process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID),
    projectId,
    teamId,
    previewUrl:
      "https://toro-os-v03-gklbiqzri-dreamcatcher-s-projects.vercel.app",
    productionAlias: "https://toro-os-v03.vercel.app",
    liveRead,
    nextAction:
      "Use governed Vercel reads for deployment status and runtime logs.",
  });
}
