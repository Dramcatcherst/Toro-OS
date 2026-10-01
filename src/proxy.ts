import { NextResponse, type NextRequest } from "next/server";
import { isPublicDemo } from "@/lib/server/public-demo";

/** Public surface allowlist, not a replacement for internal auth/RLS. */
export function proxy(request: NextRequest) {
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
