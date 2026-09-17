import { NextResponse } from "next/server";

import { getToroSession } from "@/features/auth/session";
import { getConnectorHealth } from "@/lib/server/connector-health";

const allowedRoles = new Set(["FOUNDER", "SYSTEMS"]);

export async function GET() {
  const session = await getToroSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!allowedRoles.has(session.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const connectorHealth = await getConnectorHealth();

  return NextResponse.json({
    mode: "read_only",
    externalWrite: false,
    ...connectorHealth,
  });
}
