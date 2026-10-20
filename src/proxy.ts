import { NextResponse, type NextRequest } from "next/server";
import { isPortalDeployment, isPublicDemo } from "@/lib/server/public-demo";
import { refreshPortalSession } from "@/lib/supabase/portal-refresh";

const portalPages = new Set([
  "/login", "/portal", "/my-toro", "/my-toro/herramientas", "/brain",
  // This page only prepares a public Kross search; it has no private reader or PMS writer.
  "/booking-assist",
]);
const portalReadApis = new Set(["/api/brain/context", "/api/brain/owner-attention"]);
const portalContextSelectionApi = "/api/brain/context/selection";
const portalAssets = new Set([
  "/brand/tools/whatsapp-official.svg", "/brand/tools/alegra-official.svg", "/brand/tools/google-calendar-official.svg",
  "/apple-icon.png", "/favicon.ico", "/icon.png", "/brand/tools/kross.png", "/brand/tools/wespeak.ico",
  "/brand/tools/dreamteam.svg", "/brand/tools/google.svg", "/brand/tools/dropbox.svg",
  "/manifest.webmanifest", "/opengraph-image", "/robots.txt", "/twitter-image",
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
  if (canonical && (path === "/api/auth/login" || path === portalContextSelectionApi) &&
      request.method === "POST" && !request.headers.has("Next-Action")) {
    // Only bounded authentication and context-preference handlers may accept a
    // POST. Neither admits operational writers or Server Actions.
    return privateResponse(NextResponse.next());
  }
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
export function publicSurfaceDecision(request: NextRequest) {
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
  if (readOnly && (
    path === "/brain" || path === "/apple-icon.png" || path === "/favicon.ico" || path === "/icon.png" || path === "/manifest.webmanifest" ||
    path === "/opengraph-image" || path === "/robots.txt" || path === "/twitter-image" ||
    path.startsWith("/_next/static/")
  )) {
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

export async function proxy(request: NextRequest) {
  const response = publicSurfaceDecision(request);
  const path = request.nextUrl.pathname;
  const fetchSite = request.headers.get("sec-fetch-site")?.trim().toLowerCase();
  const contextSelectionPost = path === portalContextSelectionApi && request.method === "POST" &&
    request.headers.get("origin") === request.nextUrl.origin &&
    !request.headers.has("Next-Action") &&
    (fetchSite === undefined || fetchSite === "same-origin");
  if (isPortalDeployment() && response.headers.get("x-middleware-next") === "1" &&
      (((request.method === "GET" || request.method === "HEAD") &&
        ((portalPages.has(path) && path !== "/login" && path !== "/booking-assist") || portalReadApis.has(path))) ||
        contextSelectionPost) &&
      request.cookies.getAll().some(cookie => /^sb-[a-z0-9]+-auth-token(?:\.\d+)?$/.test(cookie.name))) {
    return refreshPortalSession(request, response);
  }
  return response;
}

// No exclusions: POST actions, API routes, unknown assets and data routes must be covered.
export const config = { matcher: "/:path*" };
