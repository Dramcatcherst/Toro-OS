import { publicDemoResponse } from "@/lib/server/public-demo";
import { NextResponse } from "next/server";
import { readVercelDeployments } from "@/lib/server/read-only-connectors";
import { resolveVercelRuntimeConfig } from "@/lib/vercel-runtime";

export async function GET() {
  const demo = publicDemoResponse();
  if (demo) return demo;
  const runtime = resolveVercelRuntimeConfig();
  const { projectId, teamId } = runtime;
  const liveRead = await readVercelDeployments({ projectId, teamId });

  return NextResponse.json({
    connector: "vercel",
    mode: "read_only",
    externalWrite: false,
    configured: liveRead.configured,
    projectId,
    teamId,
    previewUrl: runtime.branchAlias,
    productionAlias: runtime.productionAlias,
    liveRead,
    nextAction: "Use Vercel connector or REST token to read deployment status and runtime logs.",
  }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}
