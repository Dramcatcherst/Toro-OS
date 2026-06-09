import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    connector: "vercel",
    mode: "read_only",
    externalWrite: false,
    configured: Boolean(process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID),
    previewUrl: "https://toro-os-v03-evncak9ai-dreamcatcher-s-projects.vercel.app",
    productionAlias: "https://toro-os-v03.vercel.app",
    nextAction: "Use Vercel connector or REST token to read deployment status and runtime logs.",
  });
}
