import { publicDemoResponse } from "@/lib/server/public-demo";
import { NextResponse } from "next/server";

// This unscoped legacy ledger cannot attest an actor's approval. The governed
// Control Plane / Alegra admission path is independent and remains gated.
function retiredResponse() {
  return publicDemoResponse() ?? NextResponse.json(
    { state: "legacy_approvals_retired", externalWrite: false },
    { status: 410, headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}

export const GET = retiredResponse;
export const POST: (request: Request) => NextResponse = retiredResponse;
