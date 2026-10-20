import "server-only";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicConfig } from "./env";

export async function refreshPortalSession(request: NextRequest, response: NextResponse) {
  try {
    const { url, publishableKey } = getSupabasePublicConfig();
    const client = createServerClient(url, publishableKey, { cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: cookies => {
        const previous = response.cookies.getAll();
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request: { headers: request.headers } });
        previous.forEach(cookie => response.cookies.set(cookie));
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, {
          ...options, path: "/", domain: undefined, sameSite: "lax",
          secure: request.nextUrl.protocol === "https:", maxAge: value ? 12 * 60 * 60 : 0,
        }));
      },
    } });
    // getUser validates with Auth. The page/API resolver independently checks
    // roles, organization, force-password-change and the registered session.
    await client.auth.getUser();
  } catch {
    // Guarded pages/API still fail closed if refresh/configuration is unavailable.
  }
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}
