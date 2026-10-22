import test from "node:test";
import assert from "node:assert/strict";
import * as diagnostics from "../scripts/openclaw-host-diagnostics.mjs";
const { collectHostDiagnostics, summarizeHostCommand, runHostCommand } = diagnostics;

test("diagnostic packet never copies raw phone, token, chat or host path", async () => {
  const secret = "token=very-private-123";
  const packet = await collectHostDiagnostics(() => ({
    status: 1,
    stdout: `+506 1234-5678 chat_id=owner C:\\Users\\Owner\\${secret}`,
    stderr: `Forbidden ${secret}`,
  }));
  const serialized = JSON.stringify(packet);
  assert.equal(packet.commandResults.length, 8);
  for (const fragment of [secret, "+506", "chat_id", "C:\\Users"]) {
    assert.equal(serialized.includes(fragment), false);
  }
  assert.equal(packet.commandResults[0].category, "authorization");
});

test("unfamiliar provider fields are not emitted as evidence", () => {
  const summary = summarizeHostCommand("whatsapp_probe", {
    status: 0,
    stdout: JSON.stringify({ status: "ready", phone: "+50612345678", auth: "secret" }),
  });
  assert.deepEqual(summary, { name: "whatsapp_probe", result: "executed", json: "valid", state: "ready" });
});

test("bounded logs reveal only error count, never message content", () => {
  const summary = summarizeHostCommand("whatsapp_logs", {
    status: 0,
    stdout: 'Private guest text +506 1234-5678 token=secret Capability unavailable\nCapability unavailable',
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

test("an explicit disconnect takes precedence over a running process", () => {
  const summary = summarizeHostCommand("whatsapp_probe", {
    status: 0, stdout: JSON.stringify({ status: "running", connected: false }),
  });
  assert.equal(summary.state, "disconnected");
  assert.equal(summarizeHostCommand("whatsapp_probe", {
    status: 0, stdout: JSON.stringify({ status: "healthy", state: "error", connected: true }),
  }).state, "error");
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
  assert.equal(packet.commandResults.length, 8);
  assert.ok(packet.commandResults.slice(1).every((item) => item.category === "budget_exhausted"));
});
