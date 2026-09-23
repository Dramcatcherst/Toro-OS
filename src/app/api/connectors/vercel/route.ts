import { NextResponse } from "next/server";

import { authorizeToroApi } from "@/lib/server/api-auth";
import {
  readVercelDeployments,
  readVercelProject,
  readVercelProjectDomains,
} from "@/lib/server/read-only-connectors";
import { getToroVercelRuntimeConfig } from "@/lib/server/vercel-runtime";

const vercelRoles = ["FOUNDER", "SYSTEMS"] as const;

export async function GET() {
  const auth = await authorizeToroApi(vercelRoles);
  if (!auth.ok) return auth.response;

  const runtime = getToroVercelRuntimeConfig();
  const [deploymentRead, projectRead, domainRead] = await Promise.all([
    readVercelDeployments({
      projectId: runtime.projectId,
      teamId: runtime.teamId,
    }),
    readVercelProject({
      projectId: runtime.projectId,
      teamId: runtime.teamId,
    }),
    readVercelProjectDomains({
      projectId: runtime.projectId,
      teamId: runtime.teamId,
    }),
  ]);

  const domains = domainRead.data ?? [];
  const customDomains = domains
    .filter((domain) => !domain.isVercelAlias)
    .map((domain) => domain.name);

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
    productionAliases: customDomains,
    projectRead,
    domainRead,
    deploymentRead,
    nextAction:
      "Use governed Vercel reads for the Toro-OS preview project; no production promotion is authorized.",
  });
}
