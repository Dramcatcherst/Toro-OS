import test from "node:test";
import assert from "node:assert/strict";
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
