import { test } from "node:test";
import assert from "node:assert/strict";
import { config } from "./portal-cloud-qa.mjs";
import * as qa from "./portal-cloud-qa.mjs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

test("CLI identifies configuration failure without printing exception details", () => {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL("./portal-cloud-qa.mjs", import.meta.url))], {
    env: {}, encoding: "utf8",
  });
  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.equal(result.stderr.trim(), "QA_BLOCKED_OR_FAILED stage=configuration code=QA_CONFIGURATION_FAILED");
});

test("CLI identifies private session-input failure without leaking its path or target", () => {
  const canary = "PRIVATE_IDENTITY_TOKEN_DO_NOT_LOG";
  const result = spawnSync(process.execPath, [fileURLToPath(new URL("./portal-cloud-qa.mjs", import.meta.url))], {
    env: { PORTAL_QA_URL: "https://private-test.example/portal", PORTAL_QA_APPROVED_ORIGIN: "https://private-test.example",
      PORTAL_QA_SHA: "a".repeat(40), PORTAL_QA_SESSION_FILE: `/nonexistent-${canary}/session.json` },
    encoding: "utf8",
  });
  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.equal(result.stderr.trim(), "QA_BLOCKED_OR_FAILED stage=session_input code=QA_SESSION_INPUT_FAILED");
  assert(!result.stderr.includes(canary));
  assert(!result.stderr.includes("private-test.example"));
});

test("unknown diagnostic stages and hostile error objects produce only fixed fallback constants", () => {
  const sensitive = "PRIVATE_SECRET https://private.example/?token=canary";
  const hostile = { get message() { throw new Error(sensitive); }, get stack() { throw new Error(sensitive); } };
  for (const stage of [sensitive, "constructor", undefined, hostile, new Error(sensitive)]) {
    const output = qa.failureDiagnostic?.(stage) ?? "";
    assert.equal(output, "QA_BLOCKED_OR_FAILED stage=unknown code=QA_UNEXPECTED_FAILURE");
    assert(!output.includes(sensitive));
  }
});
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

test("accepts existing-account authentication without returning credentials", () => {
  const input = { ...valid, PORTAL_QA_SESSION_FILE: undefined, PORTAL_QA_IDENTIFIER: "example", PORTAL_QA_PASSWORD: "test-only" };
  const out = config(input); assert.equal(out.sessionFile, null);
  assert(!JSON.stringify(out).includes("test-only"));
  assert.throws(() => config({ ...input, PORTAL_QA_PASSWORD: undefined }), /QA_BLOCKED_CONFIGURATION/);
  assert.throws(() => config({ ...input, PORTAL_QA_SESSION_FILE: valid.PORTAL_QA_SESSION_FILE }), /QA_BLOCKED_AMBIGUOUS_AUTH/);
});
