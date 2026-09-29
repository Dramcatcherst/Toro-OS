import { NextResponse } from "next/server";

import {
  cancelOpenClawPairing,
  issueOpenClawPairing,
  revokeOpenClawChannelIdentity,
} from "@/features/openclaw/pairing";

export const runtime = "nodejs";

const NO_STORE = {
  "Cache-Control": "private, no-store, max-age=0",
};

function response(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return response({ state: "invalid", error: "Request body must be an object." }, 400);
  }

  const record = body as Record<string, unknown>;
  const action =
    typeof record.action === "string" ? record.action.trim() : "";

  let result;
  if (action === "issue") {
    result = await issueOpenClawPairing(record);
  } else if (action === "revoke") {
    result = await revokeOpenClawChannelIdentity(record);
  } else if (action === "cancel") {
    result = await cancelOpenClawPairing(record);
  } else {
    return response({ state: "invalid", error: "Unsupported pairing action." }, 400);
  }

  switch (result.state) {
    case "issued":
      // token is intentionally returned exactly once to the authorized manager.
      return response(result, 201);
    case "revoked":
    case "cancelled":
      return response(result);
    case "invalid":
      return response(result, 400);
    case "unauthenticated":
      return response(result, 401);
    case "forbidden":
      return response(result, 403);
    case "unavailable":
    default:
      return response(result, 503);
  }
}
