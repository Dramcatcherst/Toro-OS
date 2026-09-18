import { NextResponse } from "next/server";

import { authorizeOpenClawStatus } from "@/lib/server/machine-auth";
import { getOperationalStatus } from "@/lib/server/operational-status";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = authorizeOpenClawStatus(request);
  if (!auth.ok) return auth.response;

  const status = await getOperationalStatus();

  return NextResponse.json(
    {
      version: status.version,
      generatedAt: status.generatedAt,
      currentHotelClaimsAllowed: status.currentHotelClaimsAllowed,
      hotel: status.hotel,
      sourceSummary: status.sources.summary,
      warnings: status.warnings,
      chatSummary: status.chatSummary,
    },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    },
  );
}
