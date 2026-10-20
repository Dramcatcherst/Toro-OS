#!/usr/bin/env node
// Read-only host probe. Deliberately emits no raw CLI output, identifiers,
// configuration, message bodies, paths, credentials or provider payloads.
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const COMMANDS = [
  ["version", ["--version"]],
  ["gateway", ["gateway", "status"]],
  ["whatsapp_probe", ["channels", "status", "--probe", "--json"]],
  ["whatsapp_capabilities", ["channels", "capabilities", "--channel", "whatsapp", "--json"]],
  ["deep_status", ["status", "--deep"]],
  ["security_audit", ["security", "audit", "--json"]],
  ["backup_inventory", ["backup", "list", "--json"]],
  ["whatsapp_logs", ["channels", "logs", "--channel", "whatsapp", "--lines", "200", "--json"]],
];

function errorCategory(value) {
  if (/unknown (command|option)|unrecognized (command|option)/i.test(value)) return "unsupported_command";
  if (/unauthorized|forbidden|authentication|permission denied/i.test(value)) return "authorization";
  if (/timeout|timed out/i.test(value)) return "timeout";
  if (/connection|connect|ECONNREFUSED|unreachable/i.test(value)) return "connectivity";
  if (/not found|ENOENT/i.test(value)) return "not_installed";
  return "command_failed";
}

function statusFromJson(value) {
  if (!value || typeof value !== "object") return "unknown";
  const candidates = [value.status, value.state, value.health, value.connected];
  for (const item of candidates) {
    if (item === true) return "connected";
    if (item === false) return "disconnected";
    if (typeof item === "string") {
      const normalized = item.toLowerCase();
      if (["ready", "connected", "healthy", "running", "degraded", "disconnected", "stopped", "error"].includes(normalized)) {
        return normalized;
      }
    }
  }
  return "unknown";
}

export function summarizeHostCommand(name, result) {
  const raw = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  if (result.error || result.status !== 0) {
    return { name, result: "fail", category: result.error?.code === "ENOENT" ? "not_installed" : result.error?.code === "ETIMEDOUT" ? "timeout" : errorCategory(raw) };
  }
  if (name === "version") {
    const version = String(result.stdout ?? "").match(/\b20\d{2}\.\d{1,2}\.\d{1,3}\b/)?.[0] ?? null;
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
  if (["whatsapp_probe", "whatsapp_capabilities", "security_audit", "backup_inventory"].includes(name)) {
    try {
      const value = JSON.parse(String(result.stdout ?? ""));
      return { name, result: "executed", json: "valid", state: name === "whatsapp_probe" ? statusFromJson(value) : "unclassified" };
    } catch {
      return { name, result: "inconclusive", category: "invalid_json" };
    }
  }
  return { name, result: "executed" };
}

export function collectHostDiagnostics(run = spawnSync) {
  return {
    contract: "toro-openclaw-host-probe-v1",
    observedAt: new Date().toISOString(),
    privacy: "summary_only_no_raw_output",
    commandResults: COMMANDS.map(([name, args]) => {
      const result = run("openclaw", args, {
        encoding: "utf8",
        timeout: 15000,
        maxBuffer: 1024 * 1024,
        windowsHide: true,
      });
      return summarizeHostCommand(name, result);
    }),
    capabilityUnavailableTrace: "bounded_log_count_only",
    integrationWorktree: "not_inspected",
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.stdout.write(`${JSON.stringify(collectHostDiagnostics(), null, 2)}\n`);
}
