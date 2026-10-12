import { NextResponse, type NextRequest } from "next/server";
import { isPortalDeployment, isPublicDemo } from "@/lib/server/public-demo";

const portalPages = new Set([
  "/login", "/portal", "/my-toro", "/my-toro/herramientas", "/brain",
  // This page only prepares a public Kross search; it has no private reader or PMS writer.
  "/booking-assist",
]);
const portalReadApis = new Set(["/api/brain/context", "/api/brain/owner-attention"]);
const portalAssets = new Set([
  "/favicon.ico", "/brand/tools/kross.png", "/brand/tools/wespeak.ico",
  "/brand/tools/dreamteam.svg", "/brand/tools/google.svg", "/brand/tools/dropbox.svg",
]);

function privateResponse(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

function portalResponse(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const readOnly = !request.nextUrl.buildId && !request.headers.has("Next-Action") &&
    (request.method === "GET" || request.method === "HEAD");
  // Admit exact canonical paths only. Reject encoded separators/traversal instead
  // of letting a later router normalization change an allowlisted destination.
  const canonical = !/[\\%\u0000-\u0020\u007f]/.test(path) &&
    !path.split("/").some(segment => segment.startsWith("."));
  if (readOnly && canonical && path === "/") {
    return privateResponse(NextResponse.redirect(new URL("/portal", request.url)));
  }
  const asset = portalAssets.has(path) || path.startsWith("/_next/static/");
  if (readOnly && canonical && (portalPages.has(path) || portalReadApis.has(path) || asset)) {
    // SSR pages and the two read APIs retain their own verified identity, role,
    // organization and RLS checks. A session-looking cookie is never a grant.
    return privateResponse(NextResponse.next());
  }
  return privateResponse(NextResponse.json(
    { state: "portal_route_unavailable", operationalAccess: false }, { status: 404 },
  ));
}

/** Public surface allowlist, not a replacement for internal auth/RLS. */
export function proxy(request: NextRequest) {
  if (isPortalDeployment()) return portalResponse(request);
  if (!isPublicDemo()) return NextResponse.next();

  const path = request.nextUrl.pathname;
  // Next normalizes /_next/data/<build>/... to a page path; do not admit it as that page.
  const readOnly = !request.nextUrl.buildId && (request.method === "GET" || request.method === "HEAD");
  if (readOnly && path === "/") {
    const response = NextResponse.redirect(new URL("/brain", request.url));
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
  if (readOnly && (path === "/brain" || path === "/favicon.ico" || path.startsWith("/_next/static/"))) {
    const response = NextResponse.next();
    if (path === "/brain") response.headers.set("Cache-Control", "no-store");
    return response;
  }
  return NextResponse.json(
    path === "/api/brain/owner-attention" && readOnly
      ? { state: "disabled", ownerAttentionAllowed: false }
      : { state: "public_demo", operationalAccess: false },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

// No exclusions: POST actions, API routes, unknown assets and data routes must be covered.
export const config = { matcher: "/:path*" };
