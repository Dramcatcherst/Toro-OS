#!/usr/bin/env node
// Read-only host probe. Deliberately emits no raw CLI output, identifiers,
// configuration, message bodies, paths, credentials or provider payloads.
import { spawn } from "node:child_process";
import { delimiter, dirname, isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const COMMANDS = [
  ["version", ["--version"]],
  ["gateway", ["gateway", "status"]],
  ["whatsapp_probe", ["channels", "status", "--channel", "whatsapp", "--probe", "--json"]],
  ["whatsapp_health", ["health", "--verbose", "--json", "--timeout", "10000"]],
  ["whatsapp_capabilities", ["channels", "capabilities", "--channel", "whatsapp", "--json"]],
  ["deep_status", ["status", "--deep"]],
  ["security_audit", ["security", "audit", "--json"]],
  ["backup_inventory", ["backup", "list", "--json"]],
  ["whatsapp_logs", ["channels", "logs", "--channel", "whatsapp", "--lines", "200", "--json"]],
];

const HEALTH_SNAPSHOT_MAX_AGE_MS = 30_000;
const HEALTH_SNAPSHOT_FUTURE_TOLERANCE_MS = 5_000;
const UNHEALTHY_ACCOUNT_STATES = new Set([
  "blocked",
  "disconnected",
  "error",
  "failed",
  "degraded",
  "ingress-unavailable",
  "logged-out",
  "not-running",
  "stale-socket",
  "stopped",
  "stuck",
  "terminal-disconnect",
]);

function errorCategory(value) {
  if (/unknown (command|option)|unrecognized (command|option)/i.test(value)) return "unsupported_command";
  if (/unauthorized|forbidden|authentication|permission denied/i.test(value)) return "authorization";
  if (/timeout|timed out/i.test(value)) return "timeout";
  if (/connection|connect|ECONNREFUSED|unreachable/i.test(value)) return "connectivity";
  if (/not found|ENOENT/i.test(value)) return "not_installed";
  return "command_failed";
}

function accountProbeState(account) {
  if (!account || typeof account !== "object" || Array.isArray(account) ||
      (account.enabled !== undefined && typeof account.enabled !== "boolean")) return "unknown";
  const probe = account.probe && typeof account.probe === "object" ? account.probe : null;
  const audit = account.audit && typeof account.audit === "object" ? account.audit : null;

  // Transport/lifecycle fields are runtime snapshots and can be stale. Only an
  // explicit per-account probe or audit result is fresh enough for this gate.
  if (probe?.ok === false || audit?.ok === false) return "disconnected";
  if (probe?.ok === true || audit?.ok === true) return "connected";
  return "unknown";
}

function accountInventory(entries, expectedAccounts = []) {
  const active = entries.filter(([, account]) => account?.enabled !== false);
  const disabledAccountCount = entries.length - active.length;
  const byId = new Map();
  for (const [id, account] of entries) {
    if (typeof id === "string") byId.set(id, [...(byId.get(id) ?? []), account]);
  }
  const coverage = expectedAccounts.length ? {
    expected: expectedAccounts.length,
    matched: expectedAccounts.filter((id) => byId.get(id)?.length === 1 && byId.get(id)[0]?.enabled !== false).length,
    missing: expectedAccounts.filter((id) => !byId.has(id)).length,
    disabled: expectedAccounts.filter((id) => byId.get(id)?.every((account) => account?.enabled === false)).length,
    duplicates: [...byId.values()].filter((accounts) => accounts.length > 1).length,
  } : null;
  return {
    active: active.map(([, account]) => account),
    details: {
      ...(disabledAccountCount ? { disabledAccountCount } : {}),
      ...(coverage ? { coverage } : {}),
    },
    incomplete: Boolean(coverage && (coverage.missing || coverage.disabled || coverage.duplicates)),
  };
}

function summarizeWhatsAppProbe(value, observedAt, expectedAccounts) {
  const base = {
    scope: "channelAccounts.whatsapp",
    accountCount: 0,
    liveProbe: false,
    state: "unknown",
  };
  if (!value || typeof value !== "object") return base;
  if (String(value.status ?? "").toLowerCase() === "starting") {
    return { ...base, category: "gateway_starting" };
  }
  if (value.configOnly === true || value.gatewayReachable === false) {
    return { ...base, category: "config_only" };
  }
  if (!Number.isFinite(observedAt)) return { ...base, category: "observation_clock_invalid" };
  if (value.ts !== undefined && (
    !Number.isFinite(value.ts) || observedAt - value.ts > HEALTH_SNAPSHOT_MAX_AGE_MS ||
    value.ts - observedAt > HEALTH_SNAPSHOT_FUTURE_TOLERANCE_MS
  )) return { ...base, category: "probe_snapshot_unverified" };

  const accounts = value.channelAccounts?.whatsapp;
  if (!Array.isArray(accounts) || accounts.length === 0) {
    return { ...base, category: "whatsapp_accounts_missing" };
  }

  const inventory = accountInventory(accounts.map((account) => [account?.accountId, account]), expectedAccounts);
  if (!inventory.active.length) return { ...base, accountCount: accounts.length, ...inventory.details, category: "no_enabled_accounts" };
  const states = inventory.active.map(accountProbeState);
  const connected = states.filter((state) => state === "connected").length;
  const disconnected = states.filter((state) => state === "disconnected").length;
  const liveProbe = states.some((state) => state !== "unknown");
  let state = "unknown";
  if (connected === states.length) state = "connected";
  else if (disconnected === states.length) state = "disconnected";
  else if (connected > 0 || disconnected > 0) state = "degraded";
  if (inventory.incomplete && state === "connected") state = "degraded";

  return {
    scope: base.scope,
    accountCount: accounts.length,
    ...inventory.details,
    liveProbe,
    state,
    ...(inventory.incomplete ? { category: "account_coverage_incomplete" } : liveProbe ? {} : { category: "whatsapp_probe_unverified" }),
  };
}


function accountHealthState(account) {
  if (!account || typeof account !== "object" || Array.isArray(account) ||
      (account.enabled !== undefined && typeof account.enabled !== "boolean")) return "unknown";
  const healthState = String(account.healthState ?? "").toLowerCase();
  if (
    account.ingressUnavailable === true ||
    account.terminalDisconnect === true ||
    UNHEALTHY_ACCOUNT_STATES.has(healthState) ||
    account.lifecycle === "blocked" ||
    account.lifecycle === "stopped" ||
    account.running === false ||
    account.connected === false ||
    account.linked === false
  ) {
    return "unhealthy";
  }
  if (
    account.enabled !== false &&
    account.configured === true &&
    account.linked === true &&
    account.running === true &&
    account.connected === true &&
    account.lifecycle === "ready"
  ) {
    return "healthy";
  }
  return "unknown";
}

function summarizeWhatsAppHealth(value, observedAt, expectedAccounts) {
  const base = {
    scope: "channels.whatsapp.accounts",
    accountCount: 0,
    liveHealth: false,
    state: "unknown",
    evidence: "gateway_health_verbose",
  };
  if (!value || typeof value !== "object") return base;
  if (String(value.status ?? "").toLowerCase() === "starting") {
    return { ...base, category: "gateway_starting" };
  }
  if (!Number.isFinite(observedAt)) return { ...base, category: "observation_clock_invalid" };
  if (value.ok === false) return { ...base, category: "gateway_health_failed" };

  const snapshotAt = typeof value.ts === "number" && Number.isFinite(value.ts) ? value.ts : null;
  const ageMs = snapshotAt === null ? null : observedAt - snapshotAt;
  if (
    value.ok !== true ||
    ageMs === null ||
    ageMs > HEALTH_SNAPSHOT_MAX_AGE_MS ||
    ageMs < -HEALTH_SNAPSHOT_FUTURE_TOLERANCE_MS
  ) {
    return { ...base, category: snapshotAt === null ? "health_snapshot_unverified" : "health_snapshot_stale" };
  }

  const accountMap = value.channels?.whatsapp?.accounts;
  const accounts =
    accountMap && typeof accountMap === "object" && !Array.isArray(accountMap)
      ? Object.values(accountMap)
      : [];
  if (accounts.length === 0) {
    return { ...base, category: "whatsapp_health_accounts_missing" };
  }

  const inventory = accountInventory(Object.entries(accountMap), expectedAccounts);
  if (!inventory.active.length) return { ...base, accountCount: accounts.length, ...inventory.details, category: "no_enabled_accounts" };
  const states = inventory.active.map(accountHealthState);
  const healthy = states.filter((state) => state === "healthy").length;
  const unhealthy = states.filter((state) => state === "unhealthy").length;
  let state = "unknown";
  if (healthy === states.length) state = "connected";
  else if (unhealthy === states.length) state = "disconnected";
  else if (healthy > 0 || unhealthy > 0) state = "degraded";
  if (inventory.incomplete && state === "connected") state = "degraded";

  return {
    ...base,
    accountCount: accounts.length,
    ...inventory.details,
    liveHealth: true,
    state,
    ...(inventory.incomplete ? { category: "account_coverage_incomplete" } : state === "unknown" ? { category: "whatsapp_health_unverified" } : {}),
  };
}

function summarizeSecurityAudit(value) {
  const severities = ["critical", "warn", "info"];
  const counts = value?.summary;
  const unverified = { result: "inconclusive", json: "valid", category: "audit_summary_unverified" };
  if (!counts || severities.some((key) => !Number.isSafeInteger(counts[key]) || counts[key] < 0) ||
      !Number.isSafeInteger(severities.reduce((sum, key) => sum + counts[key], 0))) return unverified;
  if (value.findings !== undefined) {
    if (!Array.isArray(value.findings) || value.findings.some((finding) => !severities.includes(finding?.severity))) return unverified;
    if (severities.some((severity) => value.findings.filter((finding) => finding.severity === severity).length !== counts[severity])) return unverified;
  }
  return {
    result: "executed", json: "valid", summary: { critical: counts.critical, warn: counts.warn, info: counts.info },
    effectivePermissions: "not_verified",
  };
}

export function summarizeHostCommand(name, result, observedAt = Date.now(), { expectedAccounts = [] } = {}) {
  const raw = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  if (result.error || result.status !== 0) {
    return { name, result: "fail", category: result.error?.code === "ENOENT" ? "not_installed" : result.error?.code === "EACCES" ? "launcher_permission_denied" : result.error?.code === "ETIMEDOUT" ? "timeout" : result.error?.code === "OUTPUT_LIMIT" ? "output_limit" : errorCategory(raw) };
  }
  if (name === "version") {
    const token = String(result.stdout ?? "").match(/^\s*(?:OpenClaw\s+)?(20\d{2}\.\d{1,2}\.\d{1,3}(?:-[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)*)?(?:\+[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)*)?)\s*$/i)?.[1];
    const version = token && token.length <= 80 ? token : null;
    return { name, result: "executed", version };
  }
  if (name === "gateway") {
    // Human-readable output varies by OpenClaw version; do not infer health
    // from an isolated word that could occur in "not running" or a warning.
    return { name, result: "executed", state: "requires_host_review" };
  }
  if (name === "whatsapp_logs") {
    return {
      name,
      result: "executed",
      capabilityUnavailableCount: (raw.match(/Capability unavailable/gi) ?? []).length,
      privacy: "count_only",
    };
  }
  if (["whatsapp_probe", "whatsapp_health", "whatsapp_capabilities", "security_audit", "backup_inventory"].includes(name)) {
    try {
      const value = JSON.parse(String(result.stdout ?? ""));
      if (name === "security_audit") return { name, ...summarizeSecurityAudit(value) };
      if (name === "whatsapp_probe") {
        const summary = summarizeWhatsAppProbe(value, observedAt, expectedAccounts);
        return {
          name,
          result: summary.liveProbe ? "executed" : "inconclusive",
          json: "valid",
          ...summary,
        };
      }
      if (name === "whatsapp_health") {
        const summary = summarizeWhatsAppHealth(value, observedAt, expectedAccounts);
        return {
          name,
          result: summary.liveHealth ? "executed" : "inconclusive",
          json: "valid",
          ...summary,
        };
      }
      return { name, result: "executed", json: "valid", state: "unclassified" };
    } catch {
      return { name, result: "inconclusive", category: "invalid_json" };
    }
  }
  return { name, result: "executed" };
}

/** Owns only the CLI child created here. It never kills a Gateway or a process group. */
export function runHostCommand(command, args, { timeout = 15000, killGraceMs = 250, maxBuffer = 1024 * 1024, env } = {}) {
  if (!Number.isSafeInteger(timeout) || timeout <= 0 || !Number.isSafeInteger(killGraceMs) || killGraceMs < 0 ||
      !Number.isSafeInteger(maxBuffer) || maxBuffer <= 0) throw new TypeError("Invalid diagnostic process limits.");
  return new Promise((resolveResult) => {
    const child = spawn(command, args, { windowsHide: true, shell: false, env, stdio: ["ignore", "pipe", "pipe"] });
    const chunks = { stdout: [], stderr: [] };
    let bytes = 0;
    let settled = false;
    let failure = null;
    let forceTimer;
    const finish = (status, error = failure) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      clearTimeout(forceTimer);
      resolveResult({ status, error, stdout: Buffer.concat(chunks.stdout).toString("utf8"), stderr: Buffer.concat(chunks.stderr).toString("utf8") });
    };
    const stop = (code) => {
      if (failure || settled) return;
      failure = { code };
      child.kill("SIGTERM");
      forceTimer = setTimeout(() => {
        child.kill("SIGKILL");
        child.stdout.destroy();
        child.stderr.destroy();
        child.unref();
        // Do not await a cooperative exit from an unresponsive CLI.
        finish(null);
      }, killGraceMs);
    };
    const deadline = setTimeout(() => stop("ETIMEDOUT"), timeout);
    for (const stream of ["stdout", "stderr"]) {
      child[stream].on("data", (chunk) => {
        if (settled || failure) return;
        const remaining = maxBuffer - bytes;
        const accepted = chunk.subarray(0, remaining);
        chunks[stream].push(accepted);
        bytes += accepted.length;
        if (chunk.length > remaining) stop("OUTPUT_LIMIT");
      });
    }
    child.once("error", (error) => finish(null, { code: error.code }));
    child.once("close", (status) => finish(status));
  });
}

function summarizePacket(commandResults) {
  const evidence = commandResults.filter((row) => row.liveHealth === true || row.liveProbe === true);
  const states = evidence.map((row) => row.state);
  let state = "unknown";
  let category;
  if (states.length && states.every((value) => value === "connected")) state = "connected";
  else if (states.length && states.every((value) => value === "disconnected")) state = "disconnected";
  else if (states.some((value) => value === "degraded" || value === "disconnected")) state = "degraded";
  if (states.includes("connected") && states.includes("disconnected")) category = "live_evidence_conflict";
  // An adapter may lack probe support while still exposing inventory drift.
  // That explicit coverage failure remains relevant even without live fields.
  if (commandResults.some((row) => row.category === "no_enabled_accounts" ||
      row.coverage?.missing > 0 || row.coverage?.disabled > 0 || row.coverage?.duplicates > 0)) {
    if (state === "connected") state = "degraded";
    category = "account_coverage_incomplete";
  }
  if (commandResults.some((row) => row.category === "gateway_health_failed")) {
    if (state === "connected") state = "degraded";
    category = "gateway_health_failed";
  }
  return {
    whatsapp: { state, ...(category ? { category } : {}) },
    commandSummary: {
      executed: commandResults.filter((row) => row.result === "executed").length,
      inconclusive: commandResults.filter((row) => row.result === "inconclusive").length,
      failed: commandResults.filter((row) => row.result === "fail").length,
      skipped: commandResults.filter((row) => row.result === "skipped").length,
      unsupported: commandResults.filter((row) => row.category === "unsupported_command").length,
    },
    verification: {
      delivery: "not_verified", canonicalIdentity: "not_verified", isolation: "not_verified", backupRestore: "not_verified",
    },
  };
}

export async function collectHostDiagnostics(run = runHostCommand, {
  commandTimeoutMs = 15000, totalTimeoutMs = 60000, killGraceMs = 250,
  cliPath = "openclaw", nodePath, expectedAccounts = [],
} = {}) {
  if (![commandTimeoutMs, totalTimeoutMs].every((limit) => Number.isSafeInteger(limit) && limit > 0) ||
      !Number.isSafeInteger(killGraceMs) || killGraceMs < 0) throw new TypeError("Invalid diagnostic budget.");
  validateOptions({ cliPath, nodePath, expectedAccounts });
  const executable = nodePath ?? cliPath;
  const env = nodePath ? { ...process.env, PATH: `${dirname(nodePath)}${delimiter}${process.env.PATH ?? ""}` } : undefined;
  const stopAt = performance.now() + totalTimeoutMs;
  const commandResults = [];
  const sampleTimes = new Map();
  let launcherUnavailable = false;
  for (const [name, args] of COMMANDS) {
    if (launcherUnavailable) {
      commandResults.push({ name, result: "skipped", category: "launcher_unavailable" });
      continue;
    }
    const remaining = Math.floor(stopAt - performance.now());
    if (remaining <= killGraceMs) {
      commandResults.push({ name, result: "skipped", category: "budget_exhausted" });
      continue;
    }
    const timeout = Math.min(commandTimeoutMs, remaining - killGraceMs);
    let guard;
    let result;
    try {
      result = await Promise.race([
        Promise.resolve().then(() => run(executable, nodePath ? [cliPath, ...args] : args, { timeout, killGraceMs, maxBuffer: 1024 * 1024, env })),
        new Promise((resolveTimeout) => {
          guard = setTimeout(() => resolveTimeout({ status: null, error: { code: "ETIMEDOUT" } }), timeout + killGraceMs);
        }),
      ]);
    } catch {
      result = { status: null, error: { code: "RUNNER_FAILED" } };
    } finally {
      clearTimeout(guard);
    }
    launcherUnavailable = ["ENOENT", "EACCES"].includes(result?.error?.code);
    const collectedAt = Date.now();
    const summary = summarizeHostCommand(name, result, collectedAt, { expectedAccounts });
    if (summary.liveHealth || summary.liveProbe) {
      // The validated source timestamp stays private and is retained only until
      // emission. A later slow audit must not turn an old sample into "now".
      const source = JSON.parse(String(result.stdout));
      sampleTimes.set(summary, source.ts ?? collectedAt);
    }
    commandResults.push(summary);
  }
  const observedAt = Date.now();
  for (const [summary, sampleAt] of sampleTimes) {
    const ageMs = observedAt - sampleAt;
    if (ageMs <= HEALTH_SNAPSHOT_MAX_AGE_MS && ageMs >= -HEALTH_SNAPSHOT_FUTURE_TOLERANCE_MS) continue;
    summary.result = "inconclusive";
    summary.state = "unknown";
    if (summary.liveHealth !== undefined) summary.liveHealth = false;
    if (summary.liveProbe !== undefined) summary.liveProbe = false;
    summary.category = "snapshot_expired_during_collection";
  }
  return {
    contract: "toro-openclaw-host-probe-v1",
    observedAt: new Date(observedAt).toISOString(),
    privacy: "summary_only_no_raw_output",
    commandResults,
    ...summarizePacket(commandResults),
    capabilityUnavailableTrace: "bounded_log_count_only",
    integrationWorktree: "not_inspected",
  };
}

function validPath(value) {
  return typeof value === "string" && isAbsolute(value) && !/[\x00-\x1f\x7f]/.test(value);
}

function validateOptions({ cliPath, nodePath, expectedAccounts }) {
  if ((cliPath !== "openclaw" && !validPath(cliPath)) ||
      (nodePath !== undefined && (!validPath(nodePath) || cliPath === "openclaw")) ||
      !Array.isArray(expectedAccounts) || expectedAccounts.length > 16 ||
      expectedAccounts.some((id) => typeof id !== "string" || !/^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/.test(id)) ||
      new Set(expectedAccounts).size !== expectedAccounts.length) throw new TypeError("Invalid diagnostic options.");
}

function parseOptions(args) {
  const options = { cliPath: "openclaw", expectedAccounts: [] };
  const seen = new Set();
  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];
    if (!["--cli", "--node", "--expect-account"].includes(flag) || !value ||
        (flag !== "--expect-account" && seen.has(flag))) throw new TypeError("Invalid diagnostic options.");
    seen.add(flag);
    if (flag === "--expect-account") options.expectedAccounts.push(value);
    else if (flag === "--cli") {
      if (!validPath(value)) throw new TypeError("Invalid diagnostic options.");
      options.cliPath = value;
    } else options.nodePath = value;
  }
  validateOptions(options);
  return options;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  let options;
  try { options = parseOptions(process.argv.slice(2)); }
  catch {
    process.stdout.write(`${JSON.stringify({ contract: "toro-openclaw-host-probe-v1", result: "fail", category: "invalid_options", privacy: "summary_only_no_raw_output" })}\n`);
    process.exitCode = 2;
  }
  if (options) process.stdout.write(`${JSON.stringify(await collectHostDiagnostics(undefined, options), null, 2)}\n`);
}

