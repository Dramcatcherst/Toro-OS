import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    connector: "dropbox",
    mode: "prepare_only",
    externalWrite: false,
    configured: Boolean(process.env.DROPBOX_ACCESS_TOKEN),
    requestedAsset: body.assetName ?? "asset-name-required",
    resolverPlan: ["Match Airtable asset registry row", "Check rights/commercial grade", "Prepare signed preview request", "Queue channel usage approval"],
    nextAction: "Connect Dropbox read scopes and resolve only approved assets.",
  });
}
