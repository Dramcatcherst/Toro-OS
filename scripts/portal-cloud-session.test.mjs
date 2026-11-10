import { test } from "node:test";
import assert from "node:assert/strict";
import { openAuthorizedSession } from "./portal-cloud-session.mjs";
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
  let count=0;
  const context={request:{post:async()=>{count++;return {status:()=>401};}}};
  await assert.rejects(openAuthorizedSession(context,{url:"https://approved.vercel.app/portal"},{PORTAL_QA_IDENTIFIER:"example",PORTAL_QA_PASSWORD:"test-only"}),/QA_BLOCKED_LOGIN/);
  assert.equal(count,1);
});
