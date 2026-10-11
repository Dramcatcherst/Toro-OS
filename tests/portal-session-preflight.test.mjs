import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { classifyPortalEnvironment, collectPortalPreflight } from "../scripts/portal-session-preflight.mjs";

// Minimal configuration sentinels only; no operational rows, sessions or fixture database.
const config = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test_sentinel",
  TORO_DEPLOYMENT_MODE: "internal",
  TORO_BRAIN_CANONICAL_READ_ENABLED: "true",
  TORO_OWNER_ATTENTION_READ_ENABLED: "true",
};

test("transport selection accepts only the existing direct path and reviewed rpc_v1", () => {
  for (const mode of [undefined, "direct", "rpc_v1"]) assert.equal(classifyPortalEnvironment({ ...config, TORO_PORTAL_READ_TRANSPORT: mode }).checks.readTransportKnown, true);
  for (const mode of ["true", "RPC_V1", "rpc_v1 ", ""]) assert.equal(classifyPortalEnvironment({ ...config, TORO_PORTAL_READ_TRANSPORT: mode }).checks.readTransportKnown, false);
});

test("accepts least-privilege configuration without implying authentication", () => {
  assert.equal(classifyPortalEnvironment(config).prepared, true);
});

test("server-only publishable key cannot satisfy browser configuration", () => {
  const env = { ...config, SUPABASE_PUBLISHABLE_KEY: config.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY };
  delete env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  assert.equal(classifyPortalEnvironment(env).checks.browserPublicKey, false);
});

test("rejects different browser/server public keys", () => {
  assert.equal(classifyPortalEnvironment({ ...config, SUPABASE_PUBLISHABLE_KEY: "sb_publishable_other" }).prepared, false);
});

test("each exact read gate is required; false, typo and omission remain blocked", () => {
  for (const name of ["TORO_DEPLOYMENT_MODE", "TORO_BRAIN_CANONICAL_READ_ENABLED", "TORO_OWNER_ATTENTION_READ_ENABLED"]) {
    for (const value of [undefined, "false", "TRUE", " internal "]) {
      assert.equal(classifyPortalEnvironment({ ...config, [name]: value }).prepared, false);
    }
  }
});

test("legacy and write flags cannot be activated by session preparation", () => {
  for (const name of ["TORO_LEGACY_OPERATIONS_ENABLED", "TORO_INTERNAL_WORK_WRITE_ENABLED"]) {
    assert.equal(classifyPortalEnvironment({ ...config, [name]: "true" }).prepared, false);
    assert.equal(classifyPortalEnvironment({ ...config, [name]: "false" }).prepared, true);
  }
});

test("rejects every supported privileged Supabase credential source", () => {
  for (const name of ["SUPABASE_SECRET_KEY", "SUPABASE_SECRET_KEYS", "SUPABASE_SERVICE_ROLE_KEY"]) {
    assert.equal(classifyPortalEnvironment({ ...config, [name]: "private_sentinel" }).checks.privilegedKeysAbsent, false);
  }
});

test("rejects secret and service-role credentials in the browser key", () => {
  const jwt = role => ["eyJhbGciOiJIUzI1NiJ9", Buffer.from(JSON.stringify({ role })).toString("base64url"), "signature"].join(".");
  for (const value of ["sb_secret_sentinel", jwt("service_role"), "bad.jwt", " sb_publishable_test "]) {
    assert.equal(classifyPortalEnvironment({ ...config, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: value }).prepared, false);
  }
  assert.equal(classifyPortalEnvironment({ ...config, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: jwt("anon") }).prepared, true);
});

test("accepts secure URLs and local development, rejects credentials and nonlocal HTTP", () => {
  for (const value of ["http://localhost:54321", "http://127.0.0.1:54321", "http://[::1]:54321", "https://example.supabase.co/"]) {
    assert.equal(classifyPortalEnvironment({ ...config, NEXT_PUBLIC_SUPABASE_URL: value }).prepared, true);
  }
  for (const value of [undefined, "http://example.supabase.co", "https://user:password@example.supabase.co", "https://example.supabase.co?token=private_sentinel"]) {
    assert.equal(classifyPortalEnvironment({ ...config, NEXT_PUBLIC_SUPABASE_URL: value }).prepared, false);
  }
});

test("classifier emits statuses only, never configuration values", () => {
  const text = JSON.stringify(classifyPortalEnvironment({ ...config, SUPABASE_SECRET_KEY: "private_sentinel" }));
  for (const value of ["private_sentinel", "test_sentinel", "example.supabase.co"]) assert.equal(text.includes(value), false);
});

test("a well-formed but different candidate fails even with prepared configuration", () => {
  const receipt = collectPortalPreflight({ expectedHead: "0".repeat(40), env: config });
  assert.equal(receipt.checks.expectedHeadProvided, true);
  assert.equal(receipt.checks.candidateMatches, false);
  assert.equal(receipt.authenticatedQaVerified, false);
  assert.equal(receipt.publicationAuthorized, false);
});

test("binds the source URL to the explicitly selected canonical Supabase project", () => {
  const ref = "a".repeat(20);
  const env = { ...config, NEXT_PUBLIC_SUPABASE_URL: `https://${ref}.supabase.co` };
  assert.equal(collectPortalPreflight({ env, expectedProjectRef: ref }).checks.sourceProjectMatches, true);
  assert.equal(collectPortalPreflight({ env, expectedProjectRef: "b".repeat(20) }).checks.sourceProjectMatches, false);
  assert.equal(collectPortalPreflight({ env }).checks.sourceProjectMatches, false);
});

test("CLI fails closed without candidate/config and does not expose supplied secrets", () => {
  const result = spawnSync(process.execPath, ["scripts/portal-session-preflight.mjs"], {
    encoding: "utf8", env: { PATH: process.env.PATH, SUPABASE_SECRET_KEY: "private_sentinel" },
  });
  assert.equal(result.status, 2);
  assert.equal(result.stdout.includes("private_sentinel"), false);
  assert.equal(result.stderr, "");
  const receipt = JSON.parse(result.stdout);
  assert.equal(receipt.authenticatedQaVerified, false);
  assert.equal(receipt.browserBuildConfigVerified, false);
  assert.equal(receipt.publicationAuthorized, false);
  assert.deepEqual(receipt.actionsPerformed, { network: false, envFilesRead: false, envWrites: false, serverStarted: false });
});

test("CLI rejects malformed candidate input without echoing it", () => {
  const result = spawnSync(process.execPath, ["scripts/portal-session-preflight.mjs", "--expected-head", "private_sentinel", "--expected-project", "a".repeat(20)], {
    encoding: "utf8", env: { PATH: process.env.PATH },
  });
  assert.equal(result.status, 2);
  assert.equal(result.stdout.includes("private_sentinel"), false);
  assert.equal(JSON.parse(result.stdout).checks.expectedHeadProvided, false);
});
