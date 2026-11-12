import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { collectHostDiagnostics, summarizeHostCommand, runHostCommand } from "../scripts/openclaw-host-diagnostics.mjs";

test("diagnostic packet never copies raw phone, token, chat or host path and scopes WhatsApp", async () => {
  const secret = "token=very-private-123";
  const calls = [];
  const packet = await collectHostDiagnostics((command, args) => {
    calls.push([command, args]);
    return {
      status: 1,
      stdout: `+506 1234-5678 chat_id=owner C:\\Users\\Owner\\${secret}`,
      stderr: `Forbidden ${secret}`,
    };
  });
  const serialized = JSON.stringify(packet);
  assert.equal(packet.commandResults.length, 9);
  for (const fragment of [secret, "+506", "chat_id", "C:\\Users"]) {
    assert.equal(serialized.includes(fragment), false);
  }
  assert.equal(packet.commandResults[0].category, "authorization");
  assert.deepEqual(calls.find(([, args]) => args[0] === "channels" && args[1] === "status")?.[1], [
    "channels", "status", "--channel", "whatsapp", "--probe", "--json",
  ]);
  assert.deepEqual(calls.find(([, args]) => args[0] === "health")?.[1], [
    "health", "--verbose", "--json", "--timeout", "10000",
  ]);
});

test("top-level ready status cannot prove WhatsApp", () => {
  assert.deepEqual(
    summarizeHostCommand("whatsapp_probe", {
      status: 0,
      stdout: JSON.stringify({ status: "ready", phone: "+50612345678", auth: "secret" }),
    }),
    {
      name: "whatsapp_probe",
      result: "inconclusive",
      json: "valid",
      scope: "channelAccounts.whatsapp",
      accountCount: 0,
      liveProbe: false,
      state: "unknown",
      category: "whatsapp_accounts_missing",
    },
  );
});

test("config-only fallback cannot prove WhatsApp even with stale account flags", () => {
  assert.deepEqual(
    summarizeHostCommand("whatsapp_probe", {
      status: 0,
      stdout: JSON.stringify({
        gatewayReachable: false,
        configOnly: true,
        channelAccounts: { whatsapp: [{ connected: true, running: true }] },
      }),
    }),
    {
      name: "whatsapp_probe",
      result: "inconclusive",
      json: "valid",
      scope: "channelAccounts.whatsapp",
      accountCount: 0,
      liveProbe: false,
      state: "unknown",
      category: "config_only",
    },
  );
});

test("Gateway starting response stays inconclusive", () => {
  assert.deepEqual(
    summarizeHostCommand("whatsapp_probe", {
      status: 0,
      stdout: JSON.stringify({ status: "starting", startupPhase: "plugins" }),
    }),
    {
      name: "whatsapp_probe",
      result: "inconclusive",
      json: "valid",
      scope: "channelAccounts.whatsapp",
      accountCount: 0,
      liveProbe: false,
      state: "unknown",
      category: "gateway_starting",
    },
  );
});

test("another channel cannot satisfy the WhatsApp probe", () => {
  assert.equal(
    summarizeHostCommand("whatsapp_probe", {
      status: 0,
      stdout: JSON.stringify({
        channelAccounts: { telegram: [{ probe: { ok: true }, connected: true, running: true }] },
      }),
    }).category,
    "whatsapp_accounts_missing",
  );
});

test("WhatsApp account with successful live evidence is connected", () => {
  assert.deepEqual(
    summarizeHostCommand("whatsapp_probe", {
      status: 0,
      stdout: JSON.stringify({
        channelAccounts: { whatsapp: [{ probe: { ok: true }, connected: true, running: true }] },
      }),
    }),
    {
      name: "whatsapp_probe",
      result: "executed",
      json: "valid",
      scope: "channelAccounts.whatsapp",
      accountCount: 1,
      liveProbe: true,
      state: "connected",
    },
  );
});

test("failed WhatsApp account probe is disconnected", () => {
  assert.equal(
    summarizeHostCommand("whatsapp_probe", {
      status: 0,
      stdout: JSON.stringify({
        channelAccounts: { whatsapp: [{ probe: { ok: false }, connected: true, running: true }] },
      }),
    }).state,
    "disconnected",
  );
});

test("transport flags without fresh evidence remain inconclusive", () => {
  const summary = summarizeHostCommand("whatsapp_probe", {
    status: 0,
    stdout: JSON.stringify({
      channelAccounts: { whatsapp: [{ connected: true, running: true, lifecycle: "ready" }] },
    }),
  });
  assert.equal(summary.result, "inconclusive");
  assert.equal(summary.liveProbe, false);
  assert.equal(summary.state, "unknown");
  assert.equal(summary.category, "whatsapp_probe_unverified");
});

test("negative transport and lifecycle flags without fresh evidence remain inconclusive", () => {
  const summary = summarizeHostCommand("whatsapp_probe", {
    status: 0,
    stdout: JSON.stringify({
      channelAccounts: { whatsapp: [{ connected: false, running: false, lifecycle: "blocked" }] },
    }),
  });
  assert.equal(summary.result, "inconclusive");
  assert.equal(summary.liveProbe, false);
  assert.equal(summary.state, "unknown");
  assert.equal(summary.category, "whatsapp_probe_unverified");
});

test("mixed WhatsApp account evidence is degraded", () => {
  assert.deepEqual(
    summarizeHostCommand("whatsapp_probe", {
      status: 0,
      stdout: JSON.stringify({
        channelAccounts: {
          whatsapp: [
            { probe: { ok: true }, connected: true, running: true },
            { probe: { ok: false }, connected: false, running: false },
          ],
        },
      }),
    }).state,
    "degraded",
  );
});

test("account inventory without live fields remains inconclusive", () => {
  const summary = summarizeHostCommand("whatsapp_probe", {
    status: 0,
    stdout: JSON.stringify({
      channelAccounts: { whatsapp: [{ enabled: true, configured: true, linked: true }] },
    }),
  });
  assert.equal(summary.result, "inconclusive");
  assert.equal(summary.category, "whatsapp_probe_unverified");
  assert.equal(summary.accountCount, 1);
});


test("fresh verbose Gateway health can prove a ready WhatsApp runtime", () => {
  const now = 1_800_000_000_000;
  assert.deepEqual(
    summarizeHostCommand(
      "whatsapp_health",
      {
        status: 0,
        stdout: JSON.stringify({
          ok: true,
          ts: now - 250,
          channels: {
            whatsapp: {
              accounts: {
                default: {
                  enabled: true,
                  configured: true,
                  linked: true,
                  running: true,
                  connected: true,
                  lifecycle: "ready",
                  healthState: "healthy",
                },
              },
            },
          },
        }),
      },
      now,
    ),
    {
      name: "whatsapp_health",
      result: "executed",
      json: "valid",
      scope: "channels.whatsapp.accounts",
      accountCount: 1,
      liveHealth: true,
      state: "connected",
      evidence: "gateway_health_verbose",
    },
  );
});

test("stale verbose health cannot promote connected runtime flags", () => {
  const now = 1_800_000_000_000;
  const summary = summarizeHostCommand(
    "whatsapp_health",
    {
      status: 0,
      stdout: JSON.stringify({
        ok: true,
        ts: now - 30_001,
        channels: {
          whatsapp: {
            accounts: {
              default: {
                configured: true,
                linked: true,
                running: true,
                connected: true,
                lifecycle: "ready",
              },
            },
          },
        },
      }),
    },
    now,
  );
  assert.equal(summary.result, "inconclusive");
  assert.equal(summary.liveHealth, false);
  assert.equal(summary.category, "health_snapshot_stale");
});

test("fresh health without ready lifecycle remains unverified", () => {
  const now = 1_800_000_000_000;
  const summary = summarizeHostCommand(
    "whatsapp_health",
    {
      status: 0,
      stdout: JSON.stringify({
        ok: true,
        ts: now,
        channels: {
          whatsapp: {
            accounts: {
              default: {
                configured: true,
                linked: true,
                running: true,
                connected: true,
                lifecycle: "recovering",
              },
            },
          },
        },
      }),
    },
    now,
  );
  assert.equal(summary.result, "executed");
  assert.equal(summary.liveHealth, true);
  assert.equal(summary.state, "unknown");
  assert.equal(summary.category, "whatsapp_health_unverified");
});

test("fresh unhealthy account is reported without identifiers", () => {
  const now = 1_800_000_000_000;
  const summary = summarizeHostCommand(
    "whatsapp_health",
    {
      status: 0,
      stdout: JSON.stringify({
        ok: true,
        ts: now,
        channels: {
          whatsapp: {
            accounts: {
              "private-account-id": {
                configured: true,
                linked: true,
                running: false,
                connected: false,
                lifecycle: "stopped",
                identity: "+50612345678",
              },
            },
          },
        },
      }),
    },
    now,
  );
  assert.equal(summary.state, "disconnected");
  assert.equal(JSON.stringify(summary).includes("private-account-id"), false);
  assert.equal(JSON.stringify(summary).includes("+506"), false);
});

test("bounded logs reveal only error count, never message content", () => {
  const summary = summarizeHostCommand("whatsapp_logs", {
    status: 0,
    stdout: "Private guest text +506 1234-5678 token=secret Capability unavailable\nCapability unavailable",
  });
  assert.deepEqual(summary, {
    name: "whatsapp_logs", result: "executed", capabilityUnavailableCount: 2, privacy: "count_only",
  });
});

test("successful command with malformed JSON remains inconclusive", () => {
  assert.deepEqual(
    summarizeHostCommand("security_audit", { status: 0, stdout: "not json" }),
    { name: "security_audit", result: "inconclusive", category: "invalid_json" },
  );
});

test("negative Gateway wording cannot be promoted to running", () => {
  assert.deepEqual(
    summarizeHostCommand("gateway", { status: 0, stdout: "Gateway not running" }),
    { name: "gateway", result: "executed", state: "requires_host_review" },
  );
});


test("the exact allowlisted version token retains revisions and prereleases", () => {
  for (const version of ["2026.10.21", "2026.10.21-2", "2026.10.21-beta.1"]) {
    assert.equal(summarizeHostCommand("version", { status: 0, stdout: `OpenClaw ${version}\n` }).version, version);
  }
  assert.equal(summarizeHostCommand("version", {
    status: 0, stdout: "OpenClaw 2026.10.21-2 token=private-fixture",
  }).version, null);
});

test("a local CLI child ignoring SIGTERM is forcibly bounded without exposing its output", async () => {
  assert.equal(typeof runHostCommand, "function");
  // This is a synthetic local Node process, never an OpenClaw invocation or Gateway.
  const started = Date.now();
  const result = await runHostCommand(process.execPath, ["-e", `
    process.on('SIGTERM', () => {});
    process.stdout.write('private-fixture');
    setInterval(() => {}, 1000);
  `], { timeout: 100, killGraceMs: 50, maxBuffer: 1024 });
  assert.equal(result.error?.code, "ETIMEDOUT");
  assert.ok(Date.now() - started < 2000);
  assert.deepEqual(summarizeHostCommand("gateway", result), { name: "gateway", result: "fail", category: "timeout" });
});

test("local CLI output is bounded and cannot leak through its failure summary", async () => {
  assert.equal(typeof runHostCommand, "function");
  const result = await runHostCommand(process.execPath, ["-e", "process.stdout.write('x'.repeat(5000));"], {
    timeout: 1000, killGraceMs: 50, maxBuffer: 128,
  });
  assert.equal(result.error?.code, "OUTPUT_LIMIT");
  assert.ok(Buffer.byteLength(result.stdout) + Buffer.byteLength(result.stderr) <= 128);
  assert.equal(summarizeHostCommand("gateway", result).category, "output_limit");
});

test("the diagnostic packet stops dispatching after its overall budget", async () => {
  let calls = 0;
  const packet = await collectHostDiagnostics(async () => {
    calls++;
    await new Promise((resolve) => setTimeout(resolve, 40));
    return { status: 0, stdout: "{}" };
  }, { commandTimeoutMs: 50, totalTimeoutMs: 30, killGraceMs: 5 });
  assert.equal(calls, 1);
  assert.equal(packet.commandResults.length, 9);
  assert.ok(packet.commandResults.slice(1).every((item) => item.category === "budget_exhausted"));
});

test("negative per-account evidence wins over positive evidence", () => {
  const result = summarizeHostCommand("whatsapp_probe", {
    status: 0,
    stdout: JSON.stringify({ channelAccounts: { whatsapp: [{ probe: { ok: true }, audit: { ok: false } }] } }),
  });
  assert.equal(result.state, "disconnected");
});

test("fresh health never drops malformed account coverage", () => {
  const now = 1_800_000_000_000;
  const result = summarizeHostCommand("whatsapp_health", {
    status: 0,
    stdout: JSON.stringify({
      ok: true, ts: now,
      channels: { whatsapp: { accounts: {
        valid: { configured: true, linked: true, running: true, connected: true, lifecycle: "ready" },
        missing: null,
      } } },
    }),
  }, now);
  assert.equal(result.accountCount, 2);
  assert.equal(result.state, "degraded");
});

test("fresh health gives explicit unhealthy state priority over ready flags", () => {
  const now = 1_800_000_000_000;
  for (const healthState of ["error", "failed", "degraded"]) {
    const result = summarizeHostCommand("whatsapp_health", {
      status: 0,
      stdout: JSON.stringify({
        ok: true, ts: now,
        channels: { whatsapp: { accounts: { default: {
          configured: true, linked: true, running: true, connected: true, lifecycle: "ready", healthState,
        } } } },
      }),
    }, now);
    assert.equal(result.state, "disconnected", healthState);
  }
});

test("asynchronous collection keeps the fresh WhatsApp health evidence", async () => {
  const packet = await collectHostDiagnostics(async (_command, args) => {
    if (args[0] === "health") return {
      status: 0,
      stdout: JSON.stringify({
        ok: true, ts: Date.now(),
        channels: { whatsapp: { accounts: { default: {
          configured: true, linked: true, running: true, connected: true, lifecycle: "ready",
        } } } },
      }),
    };
    return { status: 0, stdout: args[0] === "--version" ? "OpenClaw 2026.10.21-2" : "{}" };
  });
  assert.equal(packet.commandResults.length, 9);
  assert.equal(packet.commandResults.find((item) => item.name === "whatsapp_health")?.state, "connected");
});

const readyAccount = { enabled: true, configured: true, linked: true, running: true, connected: true, lifecycle: "ready" };
const healthResult = (accounts, now, extra = {}) => ({ status: 0, stdout: JSON.stringify({ ok: true, ts: now, channels: { whatsapp: { accounts } }, ...extra }) });
const probeResult = (accounts, extra = {}) => ({ status: 0, stdout: JSON.stringify({ channelAccounts: { whatsapp: accounts }, ...extra }) });

test("disabled default cannot make two active healthy accounts look degraded", () => {
  const now = 1_800_000_000_000;
  const summary = summarizeHostCommand("whatsapp_health", healthResult({
    default: { enabled: false, running: false, connected: false, lifecycle: "stopped" },
    personal: readyAccount, hotel: readyAccount,
  }, now), now);
  assert.equal(summary.state, "connected");
  assert.equal(summary.accountCount, 3);
  assert.equal(summary.disabledAccountCount, 1);
});

test("disabled stale probe failure does not invalidate active accounts", () => {
  const summary = summarizeHostCommand("whatsapp_probe", probeResult([
    { accountId: "default", enabled: false, probe: { ok: false } },
    { accountId: "hotel", enabled: true, probe: { ok: true } },
  ]));
  assert.equal(summary.state, "connected");
  assert.equal(summary.disabledAccountCount, 1);
});

test("an inventory containing only disabled accounts never proves availability", () => {
  const now = 1_800_000_000_000;
  for (const [name, result] of [
    ["whatsapp_health", healthResult({ default: { ...readyAccount, enabled: false } }, now)],
    ["whatsapp_probe", probeResult([{ enabled: false, probe: { ok: true } }])],
  ]) {
    const summary = summarizeHostCommand(name, result, now);
    assert.equal(summary.state, "unknown");
    assert.equal(summary.result, "inconclusive");
    assert.equal(summary.category, "no_enabled_accounts");
  }
});

test("expected account missing cannot be hidden by another connected account", () => {
  const now = 1_800_000_000_000;
  for (const [name, result] of [
    ["whatsapp_health", healthResult({ hotel: readyAccount }, now)],
    ["whatsapp_probe", probeResult([{ accountId: "hotel", probe: { ok: true } }])],
  ]) {
    const summary = summarizeHostCommand(name, result, now, { expectedAccounts: ["hotel", "personal"] });
    assert.equal(summary.state, "degraded");
    assert.equal(summary.coverage.missing, 1);
    assert.equal(summary.coverage.matched, 1);
    assert.equal(summary.category, "account_coverage_incomplete");
    assert.equal(JSON.stringify(summary).includes("personal"), false);
  }
});

test("an expected account being disabled is drift even while the hotel stays connected", () => {
  const now = 1_800_000_000_000;
  const summary = summarizeHostCommand("whatsapp_health", healthResult({ hotel: readyAccount, personal: { enabled: false } }, now), now, { expectedAccounts: ["hotel", "personal"] });
  assert.equal(summary.state, "degraded");
  assert.equal(summary.coverage.disabled, 1);
  assert.equal(summary.coverage.missing, 0);
});

test("duplicate probe identifiers cannot satisfy expected account coverage", () => {
  const summary = summarizeHostCommand("whatsapp_probe", probeResult([
    { accountId: "hotel", probe: { ok: true } }, { accountId: "hotel", probe: { ok: true } },
  ]), Date.now(), { expectedAccounts: ["hotel"] });
  assert.equal(summary.state, "degraded");
  assert.equal(summary.coverage.duplicates, 1);
});

test("explicit Gateway health failure is distinct from a stale snapshot", () => {
  const now = 1_800_000_000_000;
  assert.equal(summarizeHostCommand("whatsapp_health", healthResult({ hotel: readyAccount }, now, { ok: false }), now).category, "gateway_health_failed");
});

test("invalid observation clock cannot promote a live health snapshot", () => {
  const summary = summarizeHostCommand("whatsapp_health", healthResult({ hotel: readyAccount }, 1_800_000_000_000), NaN);
  assert.equal(summary.state, "unknown");
  assert.equal(summary.category, "observation_clock_invalid");
});

test("timestamped probe rejects stale and implausibly future snapshots", () => {
  const now = 1_800_000_000_000;
  for (const ts of [now - 30_001, now + 5_001, "not-a-time"]) {
    const summary = summarizeHostCommand("whatsapp_probe", probeResult([{ probe: { ok: true } }], { ts }), now);
    assert.equal(summary.state, "unknown");
    assert.equal(summary.result, "inconclusive");
    assert.equal(summary.category, "probe_snapshot_unverified");
  }
});

test("explicit CLI path is used with the unchanged read-only argument allowlist", async () => {
  const calls = [];
  await collectHostDiagnostics((command, args) => {
    calls.push([command, args]);
    return { status: 0, stdout: "{}" };
  }, { cliPath: "/private bin/openclaw" });
  assert.equal(calls.length, 9);
  assert.ok(calls.every(([command]) => command === "/private bin/openclaw"));
  assert.deepEqual(calls[0][1], ["--version"]);
  assert.ok(calls.every(([, args]) => !args.some((arg) => ["login", "logout", "restart", "set", "patch", "--fix", "send"].includes(arg))));
});

test("explicit Node plus CLI handles spaces and shell metacharacters with a child-only PATH", async () => {
  const dir = await mkdtemp(join(tmpdir(), "openclaw probe ; "));
  try {
    const cliPath = join(dir, "fixture cli.mjs");
    await writeFile(cliPath, `import { dirname, delimiter } from 'node:path';
      if (process.env.PATH.split(delimiter)[0] !== dirname(process.execPath)) process.exit(19);
      if (process.argv[2] === '--version') process.stdout.write('OpenClaw 2026.10.1');
      else if (process.argv[2] === 'health') process.stdout.write(JSON.stringify({ok:true,ts:Date.now(),channels:{whatsapp:{accounts:{hotel:${JSON.stringify(readyAccount)},personal:${JSON.stringify(readyAccount)}}}}}));
      else process.stdout.write('{}');`);
    const pathBefore = process.env.PATH;
    const packet = await collectHostDiagnostics(runHostCommand, { cliPath, nodePath: process.execPath, expectedAccounts: ["hotel", "personal"] });
    assert.equal(packet.commandResults[0].version, "2026.10.1");
    assert.equal(packet.commandResults.find((item) => item.name === "whatsapp_health").state, "connected");
    assert.equal(packet.commandResults.find((item) => item.name === "whatsapp_health").coverage.matched, 2);
    assert.equal(process.env.PATH, pathBefore);
    assert.equal(JSON.stringify(packet).includes(dir), false);
    const result = await runHostCommand(process.execPath, [resolve("scripts/openclaw-host-diagnostics.mjs"), "--cli", cliPath, "--node", process.execPath, "--expect-account", "hotel", "--expect-account", "personal"]);
    const fromCli = JSON.parse(result.stdout);
    assert.equal(result.status, 0);
    assert.equal(fromCli.commandResults[0].version, "2026.10.1");
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("unknown, relative, repeated and incomplete launch options fail before dispatch without echo", async () => {
  for (const args of [
    ["--unknown", "token=private-fixture"], ["--cli", "relative/path"], ["--cli"],
    ["--node", process.execPath], ["--cli", "/a", "--cli", "/b"],
    ["--expect-account", "hotel", "--expect-account", "hotel"], ["--expect-account", "+50612345678"],
  ]) {
    const result = await runHostCommand(process.execPath, [resolve("scripts/openclaw-host-diagnostics.mjs"), ...args]);
    assert.equal(result.status, 2, JSON.stringify(args));
    assert.equal(JSON.parse(result.stdout).category, "invalid_options");
    assert.equal(result.stdout.includes("private-fixture"), false);
    assert.equal(result.stderr, "");
  }
});

test("unavailable launcher stops redundant commands while an unsupported command does not", async () => {
  let missingCalls = 0;
  const missing = await collectHostDiagnostics(() => {
    missingCalls++;
    return { status: null, error: { code: "ENOENT" } };
  });
  assert.equal(missingCalls, 1);
  assert.equal(missing.commandResults[0].category, "not_installed");
  assert.ok(missing.commandResults.slice(1).every((row) => row.result === "skipped" && row.category === "launcher_unavailable"));
  let unsupportedCalls = 0;
  await collectHostDiagnostics(() => {
    unsupportedCalls++;
    return { status: 1, stderr: "unknown option --json" };
  });
  assert.equal(unsupportedCalls, 9);
});

test("launcher EACCES is reported as permission denied without private path content", () => {
  assert.deepEqual(summarizeHostCommand("version", { status: null, error: { code: "EACCES" }, stderr: "/private/path" }), {
    name: "version", result: "fail", category: "launcher_permission_denied",
  });
});

test("programmatic account expectations reject duplicate, private, and unbounded input", async () => {
  for (const expectedAccounts of [["hotel", "hotel"], ["+50612345678"], ["hotel\nsecret"], [null], "hotel", Array.from({ length: 17 }, (_, i) => `account${i}`)]) {
    let calls = 0;
    await assert.rejects(collectHostDiagnostics(() => { calls++; return { status: 0, stdout: "{}" }; }, { expectedAccounts }), /Invalid diagnostic options/);
    assert.equal(calls, 0);
  }
});

test("security audit exposes severity totals without private finding details or permission claims", () => {
  const summary = summarizeHostCommand("security_audit", { status: 0, stdout: JSON.stringify({
    summary: { critical: 0, warn: 2, info: 1 }, findings: [
      { severity: "warn", checkId: "private-check", detail: "token=private-fixture" },
      { severity: "warn", detail: "+50612345678" }, { severity: "info", detail: "/private/path" },
    ],
  }) });
  assert.deepEqual(summary.summary, { critical: 0, warn: 2, info: 1 });
  assert.equal(summary.effectivePermissions, "not_verified");
  for (const fragment of ["private-check", "private-fixture", "+506", "/private"]) assert.equal(JSON.stringify(summary).includes(fragment), false);
});

test("security counts cannot conceal contradictory or malformed severities", () => {
  for (const value of [
    {}, null, { summary: { critical: -1, warn: 0, info: 0 } },
    { summary: { critical: 0, warn: "0", info: 0 } },
    { summary: { critical: 0, warn: 0, info: 0 }, findings: [{ severity: "critical" }] },
    { summary: { critical: 0, warn: 0, info: 0 }, findings: [{ severity: "unknown-private-severity" }] },
  ]) {
    const summary = summarizeHostCommand("security_audit", { status: 0, stdout: JSON.stringify(value) });
    assert.equal(summary.result, "inconclusive");
    assert.equal(summary.category, "audit_summary_unverified");
    assert.equal(JSON.stringify(summary).includes("unknown-private-severity"), false);
  }
});

test("positive live health never overrides a failing account probe in packet summary", async () => {
  const packet = await collectHostDiagnostics((_command, args) => {
    if (args[0] === "health") return healthResult({ hotel: readyAccount }, Date.now());
    if (args[0] === "channels" && args[1] === "status") return probeResult([{ accountId: "hotel", probe: { ok: false } }]);
    return { status: 0, stdout: "{}" };
  }, { expectedAccounts: ["hotel"] });
  assert.equal(packet.whatsapp.state, "degraded");
  assert.equal(packet.whatsapp.category, "live_evidence_conflict");
});

test("unsupported adapter probe is supplemental while proof gates stay explicit", async () => {
  const packet = await collectHostDiagnostics((_command, args) => {
    if (args[0] === "health") return healthResult({ hotel: readyAccount, personal: readyAccount }, Date.now());
    if (args[0] === "channels" && args[1] === "status") return probeResult([{ accountId: "hotel" }, { accountId: "personal" }]);
    if (args[0] === "backup") return { status: 1, stderr: "unknown command list" };
    if (args[0] === "--version") return { status: 0, stdout: "OpenClaw 2026.10.1" };
    return { status: 0, stdout: "{}" };
  }, { expectedAccounts: ["hotel", "personal"] });
  assert.equal(packet.whatsapp.state, "connected");
  assert.equal(packet.commandSummary.unsupported, 1);
  assert.equal(packet.commandSummary.failed, 1);
  assert.equal(packet.commandSummary.inconclusive, 2);
  assert.equal(packet.commandSummary.executed, 6);
  assert.equal(packet.verification.delivery, "not_verified");
  assert.equal(packet.verification.canonicalIdentity, "not_verified");
  assert.equal(packet.verification.isolation, "not_verified");
  assert.equal(packet.verification.backupRestore, "not_verified");
});

test("an explicit failed Gateway health check cannot be masked by a positive probe", async () => {
  const packet = await collectHostDiagnostics((_command, args) => {
    if (args[0] === "health") return healthResult({ hotel: readyAccount }, Date.now(), { ok: false });
    if (args[0] === "channels" && args[1] === "status") return probeResult([{ accountId: "hotel", probe: { ok: true } }]);
    return { status: 0, stdout: "{}" };
  });
  assert.equal(packet.whatsapp.state, "degraded");
});

test("malformed enabled flags cannot prove an active account", () => {
  const now = 1_800_000_000_000;
  for (const enabled of ["true", 1, null]) {
    const health = summarizeHostCommand("whatsapp_health", healthResult({ hotel: { ...readyAccount, enabled } }, now), now);
    const probe = summarizeHostCommand("whatsapp_probe", probeResult([{ enabled, probe: { ok: true } }]), now);
    assert.equal(health.state, "unknown");
    assert.equal(probe.state, "unknown");
  }
});

test("coverage drift from a non-probing account inventory cannot be masked by live evidence", async () => {
  for (const scenario of ["disabled-health", "missing-probe-account", "duplicate-probe-account"]) {
    const packet = await collectHostDiagnostics((_command, args) => {
      if (args[0] === "health") return healthResult(scenario === "disabled-health"
        ? { hotel: { enabled: false }, personal: { enabled: false } }
        : { hotel: readyAccount, personal: readyAccount }, Date.now());
      if (args[0] === "channels" && args[1] === "status") return probeResult(scenario === "disabled-health"
        ? [{ accountId: "hotel", probe: { ok: true } }, { accountId: "personal", probe: { ok: true } }]
        : scenario === "missing-probe-account" ? [{ accountId: "hotel" }]
        : [{ accountId: "hotel" }, { accountId: "hotel" }, { accountId: "personal" }]);
      return { status: 0, stdout: "{}" };
    }, { expectedAccounts: ["hotel", "personal"] });
    assert.equal(packet.whatsapp.state, "degraded", scenario);
    assert.equal(packet.whatsapp.category, "account_coverage_incomplete", scenario);
  }
});

test("health evidence must still be fresh at packet emission after later commands", async () => {
  const originalNow = Date.now;
  let clock = originalNow();
  Date.now = () => clock;
  try {
    const packet = await collectHostDiagnostics((_command, args) => {
      if (args[0] === "health") return healthResult({ hotel: readyAccount }, clock - 29_000);
      if (args[0] === "channels" && args[1] === "capabilities") clock += 2_000;
      return { status: 0, stdout: "{}" };
    });
    assert.equal(packet.whatsapp.state, "unknown");
    const health = packet.commandResults.find((row) => row.name === "whatsapp_health");
    assert.equal(health.liveHealth, false);
    assert.equal(health.category, "snapshot_expired_during_collection");
  } finally { Date.now = originalNow; }
});

