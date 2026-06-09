import { NextResponse } from "next/server";
import { getConnectorHealth } from "@/lib/server/connector-health";

export async function GET() {
  const connectorHealth = await getConnectorHealth();

  return NextResponse.json({
    mode: "read_only",
    externalWrite: false,
    ...connectorHealth,
  });
}
