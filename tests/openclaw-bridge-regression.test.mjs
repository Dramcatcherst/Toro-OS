import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, test } from "node:test";
import ts from "typescript";

function loadSource(path, replacements) {
  let source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
    .replace('import "server-only";', "");
  for (const [from, to] of replacements) {
    assert.ok(source.includes(from), `Expected dependency seam in ${path}`);
    source = source.replace(from, to);
  }
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

const { authorizeOpenClawService } = await loadSource("src/features/openclaw/service-auth.ts", [
  ['import { NextResponse } from "next/server";',
    'const NextResponse = { json: (body, init) => Response.json(body, init) };'],
]);
const { createPrivilegedSupabaseClient } = await loadSource("src/lib/supabase/privileged.ts", [
  ['import { createClient } from "@supabase/supabase-js";',
    'const createClient = (...args) => ({ args });'],
]);

const keys = ["TORO_DEPLOYMENT_MODE", "TORO_OPENCLAW_SERVICE_TOKEN", "SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY"];
const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
const token = "synthetic-dedicated-runtime-token-".repeat(2);
function request(value = token) {
  return new Request("https://internal.example.invalid/api/brain/openclaw", {
    headers: { authorization: `Bearer ${value}` },
  });
}
beforeEach(() => {
  for (const key of keys) delete process.env[key];
  process.env.TORO_DEPLOYMENT_MODE = "internal";
  process.env.TORO_OPENCLAW_SERVICE_TOKEN = token;
  process.env.SUPABASE_URL = "https://synthetic.example.invalid";
  process.env.SUPABASE_SECRET_KEY = "synthetic-server-only-key";
});
afterEach(() => {
  for (const key of keys) {
    if (previous[key] === undefined) delete process.env[key];
    else process.env[key] = previous[key];
  }
});

for (const mode of [undefined, "public", "portal", "interanl"]) {
  test(`machine credential cannot open privileged operations in deployment ${mode ?? "unset"}`, async () => {
    if (mode === undefined) delete process.env.TORO_DEPLOYMENT_MODE;
    else process.env.TORO_DEPLOYMENT_MODE = mode;
    const result = authorizeOpenClawService(request());
    assert.equal(result.ok, false);
    assert.equal(result.response.status, 503);
    assert.equal(result.response.headers.get("cache-control"), "private, no-store, max-age=0");
    assert.deepEqual(await result.response.json(), { error: "service_runtime_unavailable" });
  });
  test(`server key cannot allocate privileged client in deployment ${mode ?? "unset"}`, () => {
    if (mode === undefined) delete process.env.TORO_DEPLOYMENT_MODE;
    else process.env.TORO_DEPLOYMENT_MODE = mode;
    assert.throws(() => createPrivilegedSupabaseClient(), /internal deployment/i);
  });
}
test("dedicated bearer is accepted in the internal deployment", () => {
  assert.deepEqual(authorizeOpenClawService(request()), { ok: true, principal: "openclaw-runtime" });
  const client = createPrivilegedSupabaseClient();
  assert.equal(client.args[2].auth.persistSession, false);
  assert.equal(client.args[2].auth.autoRefreshToken, false);
});
test("wrong bearer cannot borrow the privileged server key", async () => {
  const result = authorizeOpenClawService(request("synthetic-server-only-key"));
  assert.equal(result.ok, false);
  assert.equal(result.response.status, 401);
  assert.equal(result.response.headers.get("cache-control"), "private, no-store, max-age=0");
  assert.deepEqual(await result.response.json(), { error: "unauthorized" });
});
test("missing dedicated token is an actionable configuration failure", async () => {
  delete process.env.TORO_OPENCLAW_SERVICE_TOKEN;
  const result = authorizeOpenClawService(request());
  assert.equal(result.ok, false);
  assert.equal(result.response.status, 503);
  assert.deepEqual(await result.response.json(), { error: "service_auth_unconfigured" });
});
