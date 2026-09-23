import { NextResponse } from "next/server";

import { authorizeToroApi } from "@/lib/server/api-auth";

const dropboxRoles = ["FOUNDER", "GROWTH", "SYSTEMS"] as const;

export async function POST(request: Request) {
  const auth = await authorizeToroApi(dropboxRoles);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    connector: "dropbox",
    mode: "prepare_only",
    externalWrite: false,
    configured: Boolean(process.env.DROPBOX_ACCESS_TOKEN),
    requestedAsset:
      typeof body.assetName === "string" && body.assetName.trim()
        ? body.assetName.trim()
        : "asset-name-required",
    resolverPlan: [
      "Match Airtable asset registry row",
      "Check rights/commercial grade",
      "Prepare signed preview request",
      "Queue channel usage approval",
    ],
    nextAction:
      "Resolve only approved media assets through governed read scopes.",
  });
}
