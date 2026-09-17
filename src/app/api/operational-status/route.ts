import { NextResponse } from "next/server";

import { getToroSession } from "@/features/auth/session";
import { getOperationalStatus } from "@/lib/server/operational-status";

const allowedRoles = new Set(["FOUNDER", "GERENCIA", "SYSTEMS"]);

export async function GET() {
  const session = await getToroSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!allowedRoles.has(session.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  return NextResponse.json(await getOperationalStatus());
}
