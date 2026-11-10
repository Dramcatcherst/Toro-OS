import assert from "node:assert/strict";

// Normal login only. No business endpoint, grant, account creation or session export.
export async function openAuthorizedSession(context, target, env) {
  const origin = new URL(target.url).origin;
  if (env.VERCEL_AUTOMATION_BYPASS_SECRET) {
    const response = await context.request.get(origin, {
      headers: { "x-vercel-protection-bypass": env.VERCEL_AUTOMATION_BYPASS_SECRET, "x-vercel-set-bypass-cookie": "true" },
      maxRedirects: 0,
    });
    const location = response.headers().location;
    assert(!location || new URL(location, origin).origin === origin, "QA_BLOCKED_VERCEL_REDIRECT");
    const cookies = await context.cookies(origin);
    assert(response.status() < 400 && cookies.some(c => c.name === "_vercel_jwt" && c.secure &&
      c.domain.replace(/^\./, "") === new URL(origin).hostname), "QA_BLOCKED_VERCEL_AUTH");
  }
  if (!target.sessionFile) {
    const response = await context.request.post(new URL("/api/auth/login", origin).href, {
      data: { identifier: env.PORTAL_QA_IDENTIFIER, password: env.PORTAL_QA_PASSWORD, nextPath: "/portal" },
      maxRedirects: 0,
    });
    assert.equal(response.status(), 200, "QA_BLOCKED_LOGIN");
    assert.equal((await response.json()).ok, true, "QA_BLOCKED_LOGIN");
  }
}
