import { NextRequest, NextResponse } from "next/server";
import { isPublicDemo } from "@/lib/server/public-demo";
import { TORO_ACTIVE_ORGANIZATION_COOKIE } from "@/features/context/organization-selection";
import { isPortalAuthCookieName, PORTAL_AUTH_COOKIE_BASE } from "@/features/auth/portal-cookie-names";

function privateResponse(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

export function POST(request: NextRequest) {
  if (isPublicDemo()) return privateResponse(NextResponse.json({ state: "logout_unavailable" }, { status: 404 }));
  const fetchSite = request.headers.get("sec-fetch-site")?.trim().toLowerCase();
  if (request.method !== "POST" || request.headers.has("Next-Action") ||
      request.headers.get("origin") !== request.nextUrl.origin ||
      (fetchSite !== undefined && fetchSite !== "same-origin")) {
    return privateResponse(NextResponse.json({ state: "logout_unavailable" }, { status: 403 }));
  }

  // Local deletion requires no Auth configuration or provider request. This
  // makes no claim that an upstream session was revoked on another device.
  const response = privateResponse(NextResponse.redirect(new URL("/login?next=/portal", request.url), 303));
  const names = new Set([PORTAL_AUTH_COOKIE_BASE, TORO_ACTIVE_ORGANIZATION_COOKIE,
    ...request.cookies.getAll().map(cookie => cookie.name).filter(isPortalAuthCookieName)]);
  for (const name of names) response.cookies.set(name, "", {
    path: "/", secure: request.nextUrl.protocol === "https:", sameSite: "lax", maxAge: 0,
    expires: new Date(0), httpOnly: name === TORO_ACTIVE_ORGANIZATION_COOKIE,
  });
  return response;
}
