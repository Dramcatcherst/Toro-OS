import "server-only";

import { NextResponse } from "next/server";

import { getToroSession, type ToroSession } from "@/features/auth/session";
import type { ToroRole } from "@/features/auth/roles";

export type ToroApiAuthorization =
  | { ok: true; session: ToroSession }
  | { ok: false; response: Response };

export async function authorizeToroApi(
  allowedRoles?: readonly ToroRole[],
): Promise<ToroApiAuthorization> {
  const session = await getToroSession();

  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
    };
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, session };
}
