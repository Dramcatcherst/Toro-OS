import test from "node:test";
import assert from "node:assert/strict";
import { collectHostDiagnostics, summarizeHostCommand } from "../scripts/openclaw-host-diagnostics.mjs";

test("diagnostic packet never copies raw phone, token, chat or host path", () => {
  const secret = "token=very-private-123";
  const packet = collectHostDiagnostics(() => ({
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
