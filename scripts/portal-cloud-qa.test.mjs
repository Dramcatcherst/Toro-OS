import { test } from "node:test";
import assert from "node:assert/strict";
import { config } from "./portal-cloud-qa.mjs";
const valid = { PORTAL_QA_URL: "https://approved.vercel.app/portal",
  PORTAL_QA_APPROVED_ORIGIN: "https://approved.vercel.app", PORTAL_QA_SHA: "a".repeat(40),
  PORTAL_QA_SESSION_FILE: "/private/session.json" };
test("requires all private and target configuration before any browser work", () => {
  for (const key of Object.keys(valid)) {
    const input = { ...valid }; delete input[key]; assert.throws(() => config(input), /QA_BLOCKED_CONFIGURATION/);
  }
});
test("rejects target substitution, credentials, query credentials, and non-Portal routes", () => {
  for (const url of ["http://approved.vercel.app/portal", "https://other.vercel.app/portal",
    "https://user:password@approved.vercel.app/portal", "https://approved.vercel.app/portal?token=secret",
    "https://approved.vercel.app/portal#secret", "https://approved.vercel.app/login"]) {
    assert.throws(() => config({ ...valid, PORTAL_QA_URL: url }), /QA_BLOCKED_TARGET/);
  }
});
test("requires exact commit identity, never branch labels", () => {
  for (const sha of ["main", "a".repeat(39), "a".repeat(41)]) assert.throws(() => config({ ...valid, PORTAL_QA_SHA: sha }), /QA_BLOCKED_SHA/);
});
test("retains exact approved target without returning session bytes", () => {
  const output = config(valid); assert.equal(output.url, valid.PORTAL_QA_URL);
  assert.equal(output.sha, valid.PORTAL_QA_SHA); assert.equal(output.sessionFile, valid.PORTAL_QA_SESSION_FILE);
});
