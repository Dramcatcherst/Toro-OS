import assert from "node:assert/strict";
import test from "node:test";

import { validateManifest } from "../scripts/task-revalidation-validator.mjs";

function entry(overrides = {}) {
  return {
    task_id: "00000000-0000-4000-8000-000000000001",
    task_key: "task-a",
    observed_updated_at: "2026-09-28T00:00:00.000Z",
    canonical_module_key: "toro_executive_control",
    current_status: "planned",
    current_priority: "high",
    migration_classification: "review",
    disposition: "KEEP",
    merge_target_task_key: null,
    close_status: null,
    proposed_status: null,
    proposed_priority: null,
    proposed_task_name: null,
    proposed_description: null,
    proposed_blocking_reason: null,
    reason: "Still current.",
    evidence_ref: "evidence:test",
    ...overrides,
  };
}

test("rejects duplicate task keys", () => {
  assert.throws(() => validateManifest([entry(), entry({ task_id: "00000000-0000-4000-8000-000000000002" })], "ready"), /duplicate task_key/i);
});

test("snapshot mode allows null disposition but ready mode rejects it", () => {
  const manifest = [entry({ disposition: null, reason: null, evidence_ref: null })];
  assert.doesNotThrow(() => validateManifest(manifest, "snapshot"));
  assert.throws(() => validateManifest(manifest, "ready"), /disposition/i);
});

test("rejects MERGE without a valid different target", () => {
  assert.throws(() => validateManifest([entry({ disposition: "MERGE", merge_target_task_key: null })], "ready"), /merge_target_task_key/i);
  assert.throws(() => validateManifest([entry({ disposition: "MERGE", merge_target_task_key: "task-a" })], "ready"), /self-merge/i);
});

test("rejects CLOSE without close status and review evidence", () => {
  assert.throws(() => validateManifest([entry({ disposition: "CLOSE", close_status: null })], "ready"), /close_status/i);
  assert.throws(() => validateManifest([entry({ disposition: "CLOSE", close_status: "done", reason: null, evidence_ref: null })], "ready"), /evidence/i);
});

test("requires HOLD to archive the task", () => {
  assert.throws(() => validateManifest([entry({ disposition: "HOLD", close_status: "done" })], "ready"), /archived/i);
  assert.doesNotThrow(() => validateManifest([entry({ disposition: "HOLD", close_status: "archived" })], "ready"));
});

test("requires REWRITE to contain a material proposed field", () => {
  assert.throws(() => validateManifest([entry({ disposition: "REWRITE" })], "ready"), /proposed/i);
  assert.doesNotThrow(() => validateManifest([entry({ disposition: "REWRITE", proposed_status: "blocked" })], "ready"));
});

test("KEEP cannot silently alter task fields", () => {
  assert.throws(() => validateManifest([entry({ proposed_priority: "critical" })], "ready"), /KEEP/i);
});

test("requires task identity and observed timestamp", () => {
  assert.throws(() => validateManifest([entry({ task_id: "" })], "ready"), /task_id/i);
  assert.throws(() => validateManifest([entry({ task_key: "" })], "ready"), /task_key/i);
  assert.throws(() => validateManifest([entry({ observed_updated_at: "" })], "ready"), /observed_updated_at/i);
});
