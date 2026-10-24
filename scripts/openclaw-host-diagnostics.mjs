#!/usr/bin/env node
// Read-only host probe. Deliberately emits no raw CLI output, identifiers,
// configuration, message bodies, paths, credentials or provider payloads.
import { spawn } from "node:child_process";
import { resolve } from "node:path";
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
  if (!account || typeof account !== "object") return "unknown";
  const probe = account.probe && typeof account.probe === "object" ? account.probe : null;
  const audit = account.audit && typeof account.audit === "object" ? account.audit : null;

  // Transport/lifecycle fields are runtime snapshots and can be stale. Only an
  // explicit per-account probe or audit result is fresh enough for this gate.
  if (probe?.ok === false || audit?.ok === false) return "disconnected";
  if (probe?.ok === true || audit?.ok === true) return "connected";
  return "unknown";
}

function summarizeWhatsAppProbe(value) {
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

  const accounts = value.channelAccounts?.whatsapp;
  if (!Array.isArray(accounts) || accounts.length === 0) {
    return { ...base, category: "whatsapp_accounts_missing" };
  }

  const states = accounts.map(accountProbeState);
  const connected = states.filter((state) => state === "connected").length;
  const disconnected = states.filter((state) => state === "disconnected").length;
  const liveProbe = states.some((state) => state !== "unknown");
  let state = "unknown";
  if (connected === states.length) state = "connected";
  else if (disconnected === states.length) state = "disconnected";
  else if (connected > 0 || disconnected > 0) state = "degraded";

  return {
    scope: base.scope,
    accountCount: accounts.length,
    liveProbe,
    state,
    ...(liveProbe ? {} : { category: "whatsapp_probe_unverified" }),
  };
}


function accountHealthState(account) {
  if (!account || typeof account !== "object") return "unknown";
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

function summarizeWhatsAppHealth(value, observedAt) {
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

  const states = accounts.map(accountHealthState);
  const healthy = states.filter((state) => state === "healthy").length;
  const unhealthy = states.filter((state) => state === "unhealthy").length;
  let state = "unknown";
  if (healthy === states.length) state = "connected";
  else if (unhealthy === states.length) state = "disconnected";
  else if (healthy > 0 || unhealthy > 0) state = "degraded";

  return {
    ...base,
    accountCount: accounts.length,
    liveHealth: true,
    state,
    ...(state === "unknown" ? { category: "whatsapp_health_unverified" } : {}),
  };
}

export function summarizeHostCommand(name, result, observedAt = Date.now()) {
  const raw = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  if (result.error || result.status !== 0) {
    return { name, result: "fail", category: result.error?.code === "ENOENT" ? "not_installed" : result.error?.code === "ETIMEDOUT" ? "timeout" : result.error?.code === "OUTPUT_LIMIT" ? "output_limit" : errorCategory(raw) };
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
      if (name === "whatsapp_probe") {
        const summary = summarizeWhatsAppProbe(value);
        return {
          name,
          result: summary.liveProbe ? "executed" : "inconclusive",
          json: "valid",
          ...summary,
        };
      }
      if (name === "whatsapp_health") {
        const summary = summarizeWhatsAppHealth(value, observedAt);
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
export function runHostCommand(command, args, { timeout = 15000, killGraceMs = 250, maxBuffer = 1024 * 1024 } = {}) {
  if (!Number.isSafeInteger(timeout) || timeout <= 0 || !Number.isSafeInteger(killGraceMs) || killGraceMs < 0 ||
      !Number.isSafeInteger(maxBuffer) || maxBuffer <= 0) throw new TypeError("Invalid diagnostic process limits.");
  return new Promise((resolveResult) => {
    const child = spawn(command, args, { windowsHide: true, shell: false, stdio: ["ignore", "pipe", "pipe"] });
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

export async function collectHostDiagnostics(run = runHostCommand, {
  commandTimeoutMs = 15000, totalTimeoutMs = 60000, killGraceMs = 250,
} = {}) {
  if (![commandTimeoutMs, totalTimeoutMs].every((limit) => Number.isSafeInteger(limit) && limit > 0) ||
      !Number.isSafeInteger(killGraceMs) || killGraceMs < 0) throw new TypeError("Invalid diagnostic budget.");
  const stopAt = performance.now() + totalTimeoutMs;
  const commandResults = [];
  for (const [name, args] of COMMANDS) {
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
        Promise.resolve().then(() => run("openclaw", args, { timeout, killGraceMs, maxBuffer: 1024 * 1024 })),
        new Promise((resolveTimeout) => {
          guard = setTimeout(() => resolveTimeout({ status: null, error: { code: "ETIMEDOUT" } }), timeout + killGraceMs);
        }),
      ]);
    } catch {
      result = { status: null, error: { code: "RUNNER_FAILED" } };
    } finally {
      clearTimeout(guard);
    }
    commandResults.push(summarizeHostCommand(name, result));
  }
  return {
    contract: "toro-openclaw-host-probe-v1",
    observedAt: new Date().toISOString(),
    privacy: "summary_only_no_raw_output",
    commandResults,
    capabilityUnavailableTrace: "bounded_log_count_only",
    integrationWorktree: "not_inspected",
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.stdout.write(`${JSON.stringify(await collectHostDiagnostics(), null, 2)}\n`);
}
