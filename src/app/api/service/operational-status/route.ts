import { NextResponse } from "next/server";

import { loadHumanLayerRuntimeConfig } from "@/lib/server/human-layer-config";
import { authorizeOpenClawStatus } from "@/lib/server/machine-auth";
import { getOperationalStatus } from "@/lib/server/operational-status";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = authorizeOpenClawStatus(request);
  if (!auth.ok) return auth.response;

  const [status, humanLayer] = await Promise.all([
    getOperationalStatus(),
    loadHumanLayerRuntimeConfig(),
  ]);

  return NextResponse.json(
    {
      version: status.version,
      generatedAt: status.generatedAt,
      currentHotelClaimsAllowed: status.currentHotelClaimsAllowed,
      hotel: status.hotel,
      sourceSummary: status.sources.summary,
      warnings: status.warnings,
      chatSummary: status.chatSummary,
      humanLayer,
    },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    },
  );
}
