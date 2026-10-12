#!/usr/bin/env node
// Offline preparation only: no env files, network, server, credentials or flags are written.
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SHA = /^[a-f0-9]{40}$/;
const PROJECT_REF = /^[a-z]{20}$/;
const VERSION = /^\d+\.\d+\.\d+$/;

function validPublicUrl(value) {
  try {
    const url = new URL(value);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    return (url.protocol === "https:" || (local && url.protocol === "http:")) &&
      !url.username && !url.password && !url.search && !url.hash && url.pathname === "/";
  } catch { return false; }
}

function publicKeyKind(value) {
  if (typeof value !== "string" || !value || value !== value.trim()) return "invalid";
  if (/^sb_publishable_[A-Za-z0-9_-]+$/.test(value)) return "publishable";
  try {
    const parts = value.split(".");
    if (parts.length !== 3 || parts.some(part => !/^[A-Za-z0-9_-]+$/.test(part))) return "invalid";
    const claims = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    return claims.role === "anon" ? "legacy_anon" : "invalid";
  } catch { return "invalid"; }
}

// Classification does not authenticate a key, prove RLS, or authorize activation.
export function classifyPortalEnvironment(env) {
  const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serverKey = env.SUPABASE_PUBLISHABLE_KEY;
  const checks = {
    publicUrl: validPublicUrl(env.NEXT_PUBLIC_SUPABASE_URL),
    browserPublicKey: publicKeyKind(key) !== "invalid",
    serverBrowserKeyConsistent: serverKey === undefined || serverKey === key,
    internalMode: ["internal", "portal"].includes(env.TORO_DEPLOYMENT_MODE),
    canonicalReadGate: env.TORO_BRAIN_CANONICAL_READ_ENABLED === "true",
    ownerReadGate: env.TORO_OWNER_ATTENTION_READ_ENABLED === "true",
    readTransportKnown: env.TORO_PORTAL_READ_TRANSPORT === undefined || ["direct", "rpc_v1"].includes(env.TORO_PORTAL_READ_TRANSPORT),
    legacyOperationsDisabled: env.TORO_LEGACY_OPERATIONS_ENABLED === undefined || env.TORO_LEGACY_OPERATIONS_ENABLED === "false",
    internalWritesDisabled: env.TORO_INTERNAL_WORK_WRITE_ENABLED === undefined || env.TORO_INTERNAL_WORK_WRITE_ENABLED === "false",
    privilegedKeysAbsent: ["SUPABASE_SECRET_KEY", "SUPABASE_SECRET_KEYS", "SUPABASE_SERVICE_ROLE_KEY"]
      .every(name => !env[name]),
  };
  return { prepared: Object.values(checks).every(Boolean), checks };
}

function readJson(path) {
  try { return JSON.parse(readFileSync(path, "utf8")); } catch { return null; }
}

function safeVersion(value) {
  return typeof value === "string" && VERSION.test(value) ? value : null;
}

export function collectPortalPreflight({ root = ROOT, expectedHead, expectedProjectRef, env = process.env } = {}) {
  const validExpectedHead = typeof expectedHead === "string" && SHA.test(expectedHead);
  const git = args => spawnSync("git", ["-C", root, ...args], {
    encoding: "utf8", timeout: 5000, windowsHide: true, maxBuffer: 65536,
  });
  const headResult = git(["rev-parse", "HEAD"]);
  const head = headResult.status === 0 && SHA.test(headResult.stdout.trim()) ? headResult.stdout.trim() : null;
  const tree = git(["status", "--porcelain"]);
  const pkg = readJson(resolve(root, "package.json"));
  const lock = readJson(resolve(root, "package-lock.json"));
  const versions = Object.fromEntries(["next", "sharp", "source-map-js"].map(name => [name, {
    locked: safeVersion(lock?.packages?.[`node_modules/${name}`]?.version),
    installed: safeVersion(readJson(resolve(root, "node_modules", name, "package.json"))?.version),
  }]));
  const environment = classifyPortalEnvironment(env);
  let sourceProjectMatches = false;
  if (typeof expectedProjectRef === "string" && PROJECT_REF.test(expectedProjectRef) && environment.checks.publicUrl) {
    sourceProjectMatches = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname === `${expectedProjectRef}.supabase.co`;
  }
  const checks = {
    expectedHeadProvided: validExpectedHead,
    candidateMatches: validExpectedHead && head !== null && expectedHead === head,
    workingTreeClean: tree.status === 0 && tree.stdout.trim() === "",
    expectedProject: pkg?.name === "toro-os-v03" && pkg?.private === true,
    sourceProjectMatches,
    dependenciesMatchLock: Object.values(versions).every(v => v.locked !== null && v.locked === v.installed) &&
      pkg?.dependencies?.next === versions.next.locked,
    ...environment.checks,
  };
  const prepared = Object.values(checks).every(Boolean);
  return {
    state: prepared ? "prepared_requires_authorization_build_and_session" : "blocked_before_real_session",
    head, checks, versions,
    blockers: Object.entries(checks).filter(([, pass]) => !pass).map(([name]) => name),
    authenticatedQaVerified: false, browserBuildConfigVerified: false,
    identityScopeRlsVerified: false, publicationAuthorized: false,
    actionsPerformed: { network: false, envFilesRead: false, envWrites: false, serverStarted: false },
  };
}

export function runPortalPreflight(args = process.argv.slice(2)) {
  const validArgs = args.length === 4 && args[0] === "--expected-head" && args[2] === "--expected-project";
  const result = collectPortalPreflight({
    expectedHead: validArgs ? args[1] : undefined,
    expectedProjectRef: validArgs ? args[3] : undefined,
  });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  return result.blockers.length ? 2 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exitCode = runPortalPreflight();
}
