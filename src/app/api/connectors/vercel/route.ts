import { NextResponse } from "next/server";
import { readVercelDeployments } from "@/lib/server/read-only-connectors";
import { resolveVercelRuntimeConfig } from "@/lib/vercel-runtime";

export async function GET() {
  const runtime = resolveVercelRuntimeConfig();
  const { projectId, teamId } = runtime;
  const liveRead = await readVercelDeployments({ projectId, teamId });

  return NextResponse.json({
    connector: "vercel",
    mode: "read_only",
    externalWrite: false,
    configured: Boolean(process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID),
    projectId,
    teamId,
    previewUrl: runtime.branchAlias,
    productionAlias: runtime.productionAlias,
    liveRead,
    nextAction: "Use Vercel connector or REST token to read deployment status and runtime logs.",
  });
}
