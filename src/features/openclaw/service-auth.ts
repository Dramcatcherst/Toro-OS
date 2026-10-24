import "server-only";

import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

const MIN_SECRET_LENGTH = 32;
const NO_STORE = { "Cache-Control": "private, no-store, max-age=0" };

export type OpenClawServiceAuthorization =
  | { ok: true; principal: "openclaw-runtime" }
  | { ok: false; response: Response };

function constantTimeMatch(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  if (actualBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(actualBuffer, expectedBuffer);
}

export function authorizeOpenClawService(
  request: Request,
): OpenClawServiceAuthorization {
  if (process.env.TORO_DEPLOYMENT_MODE !== "internal") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "service_runtime_unavailable" },
        { status: 503, headers: NO_STORE },
      ),
    };
  }
  const expected = process.env.TORO_OPENCLAW_SERVICE_TOKEN?.trim();

  if (!expected || expected.length < MIN_SECRET_LENGTH) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "service_auth_unconfigured" },
        { status: 503, headers: NO_STORE },
      ),
    };
  }

  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  const supplied = match?.[1]?.trim() ?? "";

  if (!supplied || !constantTimeMatch(supplied, expected)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "unauthorized" },
        { status: 401, headers: NO_STORE },
      ),
    };
  }

  return { ok: true, principal: "openclaw-runtime" };
}

