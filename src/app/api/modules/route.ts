import { NextResponse } from "next/server";
import { modules } from "@/lib/toro-data";

export async function GET() {
  return NextResponse.json({
    mode: "read_only",
    externalWrite: false,
    modules,
  });
}
