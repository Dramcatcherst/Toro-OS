import { NextResponse } from "next/server";

import { authorizeToroApi } from "@/lib/server/api-auth";
import { readVercelDeployments } from "@/lib/server/read-only-connectors";
import { getToroVercelRuntimeConfig } from "@/lib/server/vercel-runtime";

const vercelRoles = ["FOUNDER", "SYSTEMS"] as const;

export async function GET() {
  const auth = await authorizeToroApi(vercelRoles);
  if (!auth.ok) return auth.response;

  const runtime = getToroVercelRuntimeConfig();
  const liveRead = await readVercelDeployments({
    projectId: runtime.projectId,
    teamId: runtime.teamId,
  });

  return NextResponse.json({
    connector: "vercel",
    mode: "read_only",
    externalWrite: false,
    configured: Boolean(process.env.VERCEL_TOKEN),
    projectId: runtime.projectId,
    teamId: runtime.teamId,
    projectName: runtime.projectName,
    repository: runtime.repository,
    projectUrl: runtime.projectUrl,
    productionAlias: null,
    liveRead,
    nextAction:
      "Use governed Vercel reads for the Toro-OS preview project; no production promotion is authorized.",
  });
}
