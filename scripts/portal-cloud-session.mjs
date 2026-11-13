import assert from "node:assert/strict";

const loginHttpStages = Object.freeze({
  400: "login_http_400", 401: "login_http_401", 403: "login_http_403",
  404: "login_http_404", 429: "login_http_429", 503: "login_http_503",
});

async function rejectedLoginStage(response, status) {
  const stage = Object.hasOwn(loginHttpStages, status) ? loginHttpStages[status] : "login_http_other";
  if (status !== 403) return stage;
  try {
    const body = await response.json();
    // The endpoint owns this fixed public message. Retain only its finite code.
    if (!body || typeof body !== "object" || Array.isArray(body) ||
        Object.keys(body).length !== 1 || !Object.hasOwn(body, "error") || typeof body.error !== "string") return stage;
    const match = /^La contraseña fue aceptada, pero TORO no pudo validar la sesión\. Referencia: PV(0[0-8])\.$/.exec(body.error);
    return match ? `login_pv${match[1]}` : stage;
  } catch {
    return stage;
  }
}

// Normal login only. No business endpoint, grant, account creation or session export.
export async function openAuthorizedSession(context, target, env, onStage = () => {}) {
  const origin = new URL(target.url).origin;
  if (env.VERCEL_AUTOMATION_BYPASS_SECRET) {
    onStage("vercel_auth");
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
    onStage("login_transport");
    const response = await context.request.post(new URL("/api/auth/login", origin).href, {
      headers: { Origin: origin },
      data: { identifier: env.PORTAL_QA_IDENTIFIER, password: env.PORTAL_QA_PASSWORD, nextPath: "/portal" },
      maxRedirects: 0,
    });
    const status = response.status();
    if (status !== 200) {
      onStage(await rejectedLoginStage(response, status));
      assert.fail("QA_BLOCKED_LOGIN");
    }
    onStage("login_response");
    assert.equal((await response.json()).ok, true, "QA_BLOCKED_LOGIN");
  }
}
