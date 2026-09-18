import { NextResponse } from "next/server";

import { authorizeToroApi } from "@/lib/server/api-auth";
import { modules } from "@/lib/toro-data";

export async function GET() {
  const auth = await authorizeToroApi();
  if (!auth.ok) return auth.response;

  return NextResponse.json({
    mode: "read_only",
    externalWrite: false,
    modules,
  });
}
