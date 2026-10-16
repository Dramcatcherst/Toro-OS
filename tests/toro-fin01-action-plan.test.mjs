import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const plan = JSON.parse(
  readFileSync(new URL("../data/toro_fin01_action_plan_2026_v1.json", import.meta.url), "utf8"),
);

test("FIN-01 action plan is bounded, unique and write-gated", () => {
  assert.equal(plan.programId, "FIN-01-ALEGRA-TORO-2026");
  assert.equal(plan.externalWritesEnabled, false);
  assert.equal(plan.automationState, "PAUSED");

  const ids = plan.tasks.map((task) => task.id);
  assert.equal(new Set(ids).size, ids.length, "task IDs must be unique");

  const next = plan.tasks.filter((task) => task.state === "NEXT");
  assert.equal(next.length, 1, "exactly one task must be NEXT");
  assert.equal(next[0].id, plan.singleNextTaskId);

  const allowedStates = new Set(["NEXT", "QUEUED", "BLOCKED", "DONE"]);
  const allowedPriorities = new Set(["P0", "P1", "P2"]);
  for (const task of plan.tasks) {
    assert.ok(allowedStates.has(task.state), `${task.id} has an invalid state`);
    assert.ok(allowedPriorities.has(task.priority), `${task.id} has an invalid priority`);
    assert.ok(task.gate.length > 0, `${task.id} must have an explicit gate`);
    assert.ok(task.doneWhen.length > 0, `${task.id} must define completion evidence`);
  }

  const prohibited = new Set(plan.prohibitedWithoutExactApproval);
  for (const capability of [
    "post_accounting_entry",
    "move_money_or_pay",
    "file_tax_return",
    "change_permissions_or_rls",
    "enable_external_writer",
    "reactivate_automation",
  ]) {
    assert.ok(prohibited.has(capability), `${capability} must remain gated`);
  }
});
