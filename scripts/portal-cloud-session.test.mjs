import { test } from "node:test";
import assert from "node:assert/strict";
import { openAuthorizedSession } from "./portal-cloud-session.mjs";
import { createServer } from "node:http";
import { request } from "playwright";

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
