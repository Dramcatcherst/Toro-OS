import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import { generateRevalidationSql } from "../scripts/generate-task-revalidation-sql.mjs";

function entry(overrides = {}) {
  return {
    task_id: "00000000-0000-4000-8000-000000000001",
    task_key: "task-a",
    observed_updated_at: "2026-09-28 00:00:00+00",
    canonical_module_key: "toro_executive_control",
    current_status: "planned",
    current_priority: "medium",
    migration_classification: "review",
    needs_revalidation: true,
    disposition: "KEEP",
    merge_target_task_key: null,
    close_status: null,
    proposed_status: null,
    proposed_priority: null,
    proposed_task_name: null,
    proposed_description: null,
    proposed_blocking_reason: null,
    reason: "Still current",
    evidence_ref: "evidence:test",
    ...overrides,
  };
}

test("KEEP clears only needs_revalidation with stale-write guards and audit receipt", () => {
  const sql = generateRevalidationSql([entry()]);
  assert.match(sql.apply, /task_keys*=s*'task-a'/i);
  assert.match(sql.apply, /updated_ats*=s*'2026-09-28 00:00:00+00'/i);
  assert.match(sql.apply, /needs_revalidations*=s*true/i);
  assert.match(sql.apply, /sets+needs_revalidations*=s*false/i);
  assert.match(sql.apply, /TORO-R1-A-20260928/);
  assert.doesNotMatch(sql.apply, /deletes+froms+operations.tasks/i);
});

test("HOLD archives and deactivates without deleting history", () => {
  const sql = generateRevalidationSql([entry({
    task_key: "hold-me",
    disposition: "HOLD",
    close_status: "archived",
    reason: "No current trigger",
  })]);
  assert.match(sql.apply, /statuss*=s*'archived'/i);
  assert.match(sql.apply, /actives*=s*false/i);
});

test("MERGE archives source and records exact merge target", () => {
  const sql = generateRevalidationSql([entry({
    task_key: "old-task",
    disposition: "MERGE",
    merge_target_task_key: "canonical-task",
    reason: "Duplicate release gate",
  })]);
  assert.match(sql.apply, /canonical-task/);
  assert.match(sql.apply, /statuss*=s*'archived'/i);
  assert.match(sql.apply, /actives*=s*false/i);
});

test("REWRITE changes only explicitly proposed fields", () => {
  const sql = generateRevalidationSql([entry({
    task_key: "rewrite-me",
    disposition: "REWRITE",
    proposed_status: "blocked",
    proposed_priority: null,
    reason: "Dependency gate is current",
  })]);
  assert.match(sql.apply, /statuss*=s*'blocked'/i);
  assert.doesNotMatch(sql.apply, /prioritys*=/i);
});

test("concurrently resolved rows become no-op review evidence", () => {
  const sql = generateRevalidationSql([entry({
    task_key: "already-reviewed",
    needs_revalidation: false,
    disposition: "KEEP",
    evidence_ref: "supabase:operations.tasks/already-reviewed@2026-09-28T00:00:00+00:concurrent-resolved",
  })]);
  assert.doesNotMatch(sql.apply, /updates+operations.tasks/i);
  assert.match(sql.summary, /already-reviewed/);
  assert.match(sql.summary, /NO_OP_CONCURRENT/);
});

test("recovery restores captured state only from the R1-applied state", () => {
  const sql = generateRevalidationSql([entry({
    task_key: "hold-me",
    disposition: "HOLD",
    close_status: "archived",
    reason: "No current trigger",
  })]);
  assert.match(sql.recovery, /task_keys*=s*'hold-me'/i);
  assert.match(sql.recovery, /statuss*=s*'archived'/i);
  assert.match(sql.recovery, /needs_revalidations*=s*false/i);
  assert.match(sql.recovery, /TORO-R1-A-20260928-RECOVERY/);
});


test("committed generated SQL matches the ready manifest", () => {
  const root = process.cwd();
  const manifest = JSON.parse(readFileSync(
    join(root, "data/governance/toro-r1-task-revalidation-20260928.json"),
    "utf8",
  ));
  const generated = generateRevalidationSql(manifest);
  assert.equal(
    readFileSync(join(root, "supabase/drafts/20260928_toro_r1_task_revalidation_apply.sql"), "utf8"),
    generated.apply,
  );
  assert.equal(
    readFileSync(join(root, "supabase/drafts/20260928_toro_r1_task_revalidation_recovery.sql"), "utf8"),
    generated.recovery,
  );
});
