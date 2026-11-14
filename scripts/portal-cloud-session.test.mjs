import { test } from "node:test";
import assert from "node:assert/strict";
import { openAuthorizedSession } from "./portal-cloud-session.mjs";
import { createServer } from "node:http";
import { request } from "playwright";
import { failureDiagnostic } from "./portal-cloud-qa.mjs";

async function failedLoginDiagnostic(post) {
  let stage;
  let attempts = 0;
  const context = { request: { post: async (_url, options) => {
    attempts += 1;
    assert.equal(options.maxRedirects, 0);
    assert.equal(options.headers.Origin, "https://approved.vercel.app");
    return post();
  } } };
  await assert.rejects(openAuthorizedSession(context, { url: "https://approved.vercel.app/portal" }, {
    PORTAL_QA_IDENTIFIER: "example", PORTAL_QA_PASSWORD: "test-only",
  }, value => { stage = value; }));
  assert.equal(attempts, 1);
  return failureDiagnostic(stage);
}

test("rejected login reports only a finite HTTP classification without retry", async () => {
  for (const [status, expected] of [
    [400, "QA_BLOCKED_OR_FAILED stage=login_http_400 code=QA_LOGIN_HTTP_400"],
    [401, "QA_BLOCKED_OR_FAILED stage=login_http_401_unattributed code=QA_LOGIN_HTTP_401_UNATTRIBUTED"],
    [403, "QA_BLOCKED_OR_FAILED stage=login_http_403 code=QA_LOGIN_HTTP_403"],
    [404, "QA_BLOCKED_OR_FAILED stage=login_http_404 code=QA_LOGIN_HTTP_404"],
    [429, "QA_BLOCKED_OR_FAILED stage=login_http_429 code=QA_LOGIN_HTTP_429"],
    [503, "QA_BLOCKED_OR_FAILED stage=login_http_503 code=QA_LOGIN_HTTP_503"],
    [418, "QA_BLOCKED_OR_FAILED stage=login_http_other code=QA_LOGIN_HTTP_OTHER"],
  ]) {
    const output = await failedLoginDiagnostic(async () => ({ status: () => status, json: async () => ({ error: "Public denial" }) }));
    assert.equal(output, expected);
  }
});

test("only the exact current public 401 denial is TORO-compatible without exposing its body", async () => {
  const output = await failedLoginDiagnostic(async () => ({ status: () => 401,
    json: async () => ({ error: "Usuario o contraseña incorrectos, o acceso no habilitado." }),
    get headers() { throw new Error("PRIVATE_HEADER_MUST_NOT_BE_READ"); },
  }));
  assert.equal(output, "QA_BLOCKED_OR_FAILED stage=login_toro_denial_compatible code=QA_LOGIN_TORO_DENIAL_COMPATIBLE");
});

test("unknown, malformed and hostile 401 bodies remain unattributed without disclosure", async () => {
  const fixed = "Usuario o contraseña incorrectos, o acceso no habilitado.";
  const hostile = { get error() { throw new Error("PRIVATE_BODY_ACCESS_CANARY"); } };
  const cases = [async () => null, async () => [], async () => fixed, async () => ({}),
    async () => ({ error: fixed, identifier: "PRIVATE_IDENTITY" }),
    async () => ({ error: `PRIVATE_SECRET ${fixed}` }), async () => ({ error: `${fixed}\n` }),
    async () => ({ error: fixed.slice(0, -1) }), async () => Object.create({ error: fixed }),
    async () => hostile, async () => { throw new SyntaxError("PRIVATE_INVALID_JSON_CANARY"); }];
  for (const json of cases) {
    const output = await failedLoginDiagnostic(async () => ({ status: () => 401, json }));
    assert.equal(output, "QA_BLOCKED_OR_FAILED stage=login_http_401_unattributed code=QA_LOGIN_HTTP_401_UNATTRIBUTED");
    assert(!output.includes("PRIVATE"));
  }
  const missingJson = await failedLoginDiagnostic(async () => ({ status: () => 401 }));
  assert.equal(missingJson, "QA_BLOCKED_OR_FAILED stage=login_http_401_unattributed code=QA_LOGIN_HTTP_401_UNATTRIBUTED");
});

test("the public denial text cannot attribute another HTTP status to TORO's 401 branch", async () => {
  for (const [status, expected] of [
    [200, "QA_BLOCKED_OR_FAILED stage=login_response code=QA_LOGIN_RESPONSE_FAILED"],
    [403, "QA_BLOCKED_OR_FAILED stage=login_http_403 code=QA_LOGIN_HTTP_403"],
    [503, "QA_BLOCKED_OR_FAILED stage=login_http_503 code=QA_LOGIN_HTTP_503"],
  ]) {
    const output = await failedLoginDiagnostic(async () => ({ status: () => status,
      json: async () => ({ error: "Usuario o contraseña incorrectos, o acceso no habilitado." }),
    }));
    assert.equal(output, expected);
  }
});

test("login transport failures never expose thrown details", async () => {
  const output = await failedLoginDiagnostic(async () => { throw new Error("PRIVATE_SECRET https://private.example/?token=canary"); });
  assert.equal(output, "QA_BLOCKED_OR_FAILED stage=login_transport code=QA_LOGIN_TRANSPORT_FAILED");
});

test("unexpected successful HTTP responses and invalid JSON fail closed without payload output", async () => {
  for (const json of [async () => ({ ok: false, identifier: "PRIVATE_IDENTITY" }),
    async () => { throw new SyntaxError("PRIVATE_TOKEN invalid response"); }]) {
    const output = await failedLoginDiagnostic(async () => ({ status: () => 200, json }));
    assert.equal(output, "QA_BLOCKED_OR_FAILED stage=login_response code=QA_LOGIN_RESPONSE_FAILED");
  }
});

test("only the endpoint's complete fixed public verification message yields PV00 through PV08", async () => {
  for (const [publicCode, expected] of [
    ["PV00", "QA_BLOCKED_OR_FAILED stage=login_pv00 code=QA_LOGIN_PV00"],
    ["PV01", "QA_BLOCKED_OR_FAILED stage=login_pv01 code=QA_LOGIN_PV01"],
    ["PV02", "QA_BLOCKED_OR_FAILED stage=login_pv02 code=QA_LOGIN_PV02"],
    ["PV03", "QA_BLOCKED_OR_FAILED stage=login_pv03 code=QA_LOGIN_PV03"],
    ["PV04", "QA_BLOCKED_OR_FAILED stage=login_pv04 code=QA_LOGIN_PV04"],
    ["PV05", "QA_BLOCKED_OR_FAILED stage=login_pv05 code=QA_LOGIN_PV05"],
    ["PV06", "QA_BLOCKED_OR_FAILED stage=login_pv06 code=QA_LOGIN_PV06"],
    ["PV07", "QA_BLOCKED_OR_FAILED stage=login_pv07 code=QA_LOGIN_PV07"],
    ["PV08", "QA_BLOCKED_OR_FAILED stage=login_pv08 code=QA_LOGIN_PV08"],
  ]) {
    const output = await failedLoginDiagnostic(async () => ({ status: () => 403, json: async () => ({
      error: `La contraseña fue aceptada, pero TORO no pudo validar la sesión. Referencia: ${publicCode}.`,
    }) }));
    assert.equal(output, expected);
  }
});

test("unrecognized verification payloads remain a fixed HTTP denial without disclosure", async () => {
  const fixed = "La contraseña fue aceptada, pero TORO no pudo validar la sesión. Referencia: PV07.";
  for (const body of [{ error: `PRIVATE_SECRET ${fixed}` }, { error: fixed, identifier: "PRIVATE_IDENTITY" },
    { error: fixed.replace("PV07", "PV09") }, { error: fixed.slice(0, -1) }, { error: { message: "PRIVATE_TOKEN" } }]) {
    const output = await failedLoginDiagnostic(async () => ({ status: () => 403, json: async () => body }));
    assert.equal(output, "QA_BLOCKED_OR_FAILED stage=login_http_403 code=QA_LOGIN_HTTP_403");
    assert(!output.includes("PRIVATE"));
  }
  const invalidJson = await failedLoginDiagnostic(async () => ({ status: () => 403, json: async () => {
    throw new SyntaxError("PRIVATE_TOKEN invalid rejection response");
  } }));
  assert.equal(invalidJson, "QA_BLOCKED_OR_FAILED stage=login_http_403 code=QA_LOGIN_HTTP_403");
});

test("normal login satisfies the endpoint's same-origin guard without changing the server", async t => {
  let calls = 0;
  const server = createServer((req, res) => {
    calls += 1;
    const expectedOrigin = `http://127.0.0.1:${server.address().port}`;
    const allowed = req.url === "/api/auth/login" && req.method === "POST" &&
      req.headers.origin === expectedOrigin && req.headers["content-type"] === "application/json";
    res.writeHead(allowed ? 200 : 403, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: allowed }));
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const api = await request.newContext();
  t.after(() => api.dispose());
  const origin = `http://127.0.0.1:${server.address().port}`;
  await openAuthorizedSession({ request: api }, { url: `${origin}/portal`, sessionFile: null }, {
    PORTAL_QA_IDENTIFIER: "example", PORTAL_QA_PASSWORD: "test-only", Origin: "https://unapproved.example",
  });
  assert.equal(calls, 1);
});
test("normal login uses only the existing endpoint and never follows redirects", async () => {
  const calls = [];
  const context = { request: { post: async (url, options) => { calls.push({url,options}); return { status:()=>200, json:async()=>({ok:true}) }; } } };
  await openAuthorizedSession(context, { url:"https://approved.vercel.app/portal",sessionFile:null }, {PORTAL_QA_IDENTIFIER:"example",PORTAL_QA_PASSWORD:"test-only"});
  assert.equal(calls.length,1); assert.equal(calls[0].url,"https://approved.vercel.app/api/auth/login");
  assert.equal(calls[0].options.maxRedirects,0);
});
test("Vercel authentication refuses outside redirects before account credentials are used", async () => {
  let posted=false;
  const context = { request: { get:async()=>({headers:()=>({location:"https://elsewhere.example"}),status:()=>302}),post:async()=>{posted=true;} },cookies:async()=>[] };
  await assert.rejects(openAuthorizedSession(context,{url:"https://approved.vercel.app/portal"},{VERCEL_AUTOMATION_BYPASS_SECRET:"test-only"}),/QA_BLOCKED_VERCEL_REDIRECT/);
  assert.equal(posted,false);
});
test("invalid normal login fails once without replay", async () => {
  for (const status of [401, 403, 429]) {
    let count=0;
    const context={request:{post:async()=>{count++;return {status:()=>status};}}};
    await assert.rejects(openAuthorizedSession(context,{url:"https://approved.vercel.app/portal"},{PORTAL_QA_IDENTIFIER:"example",PORTAL_QA_PASSWORD:"test-only"}),/QA_BLOCKED_LOGIN/);
    assert.equal(count,1);
  }
});
