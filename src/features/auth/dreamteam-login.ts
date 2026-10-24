import "server-only";

import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { resolveToroContextWithSupabase, type ToroContextFailure } from "@/features/context/resolver";
import { isPortalDeployment } from "@/lib/server/public-demo";
import { getSupabasePublicConfig } from "@/lib/supabase/env";
import { safeNextPath } from "./safe-next";
import { authFetch, withAuthBudget } from "./request-budget";

// A fresh sign-in through the existing identity authority. Never forward an
// existing browser session or accept a caller-supplied provider/destination.
export const DREAMTEAM_LOGIN_ENDPOINT = "https://dream-team-public.vercel.app/dreamteam/api/auth/login";
const CANONICAL_ORIGIN = "https://abtyrbqlqbsastmridzp.supabase.co";
const COOKIE_NAME = /^sb-abtyrbqlqbsastmridzp-auth-token(?:\.[0-5])?$/;
const verificationCodes: Record<ToroContextFailure, string> = {
  auth_identity: "PV01", password_change: "PV02", session_transport: "PV03", session_policy: "PV04",
  role_transport: "PV05", role_shape: "PV06", organization_membership: "PV07", employee_context: "PV08",
};
const input = z.object({
  identifier: z.string().trim().min(3).max(254).refine(value =>
    /^[a-zA-Z0-9._-]{3,64}$/.test(value) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)),
  password: z.string().min(1).max(128),
  nextPath: z.unknown().optional().transform(value => safeNextPath(typeof value === "string" ? value : null, { portalOnly: true })),
}).strict();

function reply(error: string, status: number, retryAfter?: string) {
  return NextResponse.json({ error }, { status, headers: {
    "Cache-Control": "private, no-store, max-age=0",
    ...(retryAfter ? { "Retry-After": retryAfter } : {}),
  } });
}

async function limitedText(body: ReadableStream<Uint8Array> | null, maximum: number, signal: AbortSignal) {
  if (!body) throw new Error("missing_body");
  const reader = body.getReader();
  const parts: Uint8Array[] = [];
  let size = 0;
  const cancel = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener("abort", cancel, { once: true });
  try {
    signal.throwIfAborted();
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > maximum) throw new Error("oversized_body");
      parts.push(chunk.value);
    }
    signal.throwIfAborted();
    return Buffer.concat(parts).toString("utf8");
  } finally { signal.removeEventListener("abort", cancel); cancel(); }
}

export async function dreamTeamLogin(request: Request) {
  if (!isPortalDeployment()) return reply("Acceso no disponible.", 404);
  if (request.method !== "POST" || request.headers.has("Next-Action") ||
      request.headers.get("origin") !== new URL(request.url).origin ||
      request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") {
    return reply("Solicitud de acceso no válida.", 403);
  }
  try {
    return await withAuthBudget(10_000, async signal => {
      let credentials: z.infer<typeof input>;
      try { credentials = input.parse(JSON.parse(await limitedText(request.body, 2048, signal))); }
      catch { signal.throwIfAborted(); return reply("Revisa el usuario y la contraseña.", 400); }
      const { url, publishableKey } = getSupabasePublicConfig();
      // The cookie and identity contracts below belong to this existing project.
      if (url.replace(/\/$/, "") !== CANONICAL_ORIGIN) throw new Error("identity_origin_mismatch");
      const upstream = await authFetch(signal)(DREAMTEAM_LOGIN_ENDPOINT, {
        method: "POST", redirect: "error", cache: "no-store",
        headers: { "Content-Type": "application/json", "User-Agent": "TORO-Portal-Identity/1" },
        body: JSON.stringify({ identifier: credentials.identifier, password: credentials.password, nextPath: "/" }),
      });
      if (upstream.status === 429) {
        const seconds = upstream.headers.get("retry-after");
        return reply("Demasiados intentos. Espera unos minutos.", 429,
          seconds && /^\d{1,4}$/.test(seconds) ? seconds : "900");
      }
      if (upstream.status === 400 || upstream.status === 401 || upstream.status === 403) {
        return reply("Usuario o contraseña incorrectos, o acceso no habilitado.", 401);
      }
      if (!upstream.ok) throw new Error("identity_unavailable");
      const result = JSON.parse(await limitedText(upstream.body, 2048, signal));
      if (result?.ok !== true || result.nextPath !== "/") {
        return reply("Completa la actualización de tu acceso en DreamTeam y vuelve aquí.", 403);
      }
      const setCookies = upstream.headers.getSetCookie();
      if (setCookies.length > 8 || setCookies.join("").length > 24_000) throw new Error("cookie_limit");
      const cookieHeaders = new Headers();
      setCookies.forEach(value => cookieHeaders.append("set-cookie", value));
      const jar = new Map(new NextResponse(null, { headers: cookieHeaders }).cookies.getAll()
        .filter(cookie => COOKIE_NAME.test(cookie.name) && cookie.value).map(cookie => [cookie.name, cookie.value]));
      if (!jar.size) throw new Error("missing_identity_cookie");
      const supabase = createServerClient(url, publishableKey, { global: { fetch: authFetch(signal) }, cookies: {
        getAll: () => [...jar].map(([name, value]) => ({ name, value })),
        setAll: cookies => cookies.forEach(({ name, value }) => {
          signal.throwIfAborted();
          if (COOKIE_NAME.test(name)) { if (value) jar.set(name, value); else jar.delete(name); }
        }),
      } });
      // Validate against Auth, active roles and the existing DreamTeam session RPC
      // before making any provider cookie usable on this host.
      let verificationCode = "PV00";
      const context = await resolveToroContextWithSupabase(supabase, {}, undefined, code => {
        verificationCode = verificationCodes[code];
      });
      signal.throwIfAborted();
      if (!context || (!context.orgId && !context.requiresContextChoice)) {
        // Only a fixed diagnostic code; never log identity, provider errors or cookies.
        console.warn("[TORO portal login] verification failed", { code: verificationCode });
        return reply(`La contraseña fue aceptada, pero TORO no pudo validar la sesión. Referencia: ${verificationCode}.`, 403);
      }
      const response = NextResponse.json({ ok: true, nextPath: credentials.nextPath },
        { headers: { "Cache-Control": "private, no-store, max-age=0" } });
      const existingNames = new NextRequest(request.url, { headers: request.headers }).cookies.getAll().map(cookie => cookie.name);
      const options = { path: "/", secure: new URL(request.url).protocol === "https:", sameSite: "lax" as const,
        httpOnly: false, maxAge: 12 * 60 * 60 };
      for (const name of existingNames) if (COOKIE_NAME.test(name) && !jar.has(name)) {
        response.cookies.set(name, "", { ...options, maxAge: 0 });
      }
      for (const [name, value] of jar) response.cookies.set(name, value, options);
      return response;
    }, request.signal);
  } catch {
    // No provider payload, identifier, password, cookie or exception in logs/UI.
    return reply("DreamTeam no respondió. Inténtalo de nuevo en unos minutos.", 503);
  }
}
