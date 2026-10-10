import { publicDemoResponse } from "@/lib/server/public-demo";
import { NextResponse } from "next/server";
import { modules } from "@/lib/toro-data";

export async function GET() {
  const demo = publicDemoResponse();
  if (demo) return demo;
  return NextResponse.json({
    mode: "read_only",
    externalWrite: false,
    modules,
  });
}
