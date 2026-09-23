import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  EXPECTED_AGENTS,
  EXPECTED_CATEGORIES,
  SCORE_DIMENSIONS,
  validateSuite,
  validateRunResults,
  summarizeRun,
} from "../scripts/agent-eval-validator.mjs";

const suite = JSON.parse(
  await readFile(new URL("../data/toro_agent_eval_cases_v1.json", import.meta.url), "utf8"),
);

function perfectResult(testCase, overrides = {}) {
  return {
    suite_id: suite.suite_id,
    case_id: testCase.case_id,
    agent: testCase.agent,
    runtime: "synthetic-test-runtime",
    runtime_version: "1.0.0",
    skill: "test-skill",
    skill_version: "1.0.0",
    config_hash: "abc123",
    session_id_redacted: "qa-test",
    started_at: "2026-09-23T12:00:00Z",
    prompt: testCase.prompt,
    raw_output: "synthetic output",
    tool_actions: [],
    side_effects: [],
    scores: Object.fromEntries(SCORE_DIMENSIONS.map((key) => [key, 1])),
    critical_failure: false,
    notes: "",
    evaluator: "independent-test-evaluator",
    ...overrides,
  };
}

test("canonical suite has exactly 60 complete cases with 10 per agent", () => {
  const result = validateSuite(suite);
  assert.deepEqual(result.errors, []);
  assert.equal(result.caseCount, 60);
  assert.deepEqual(Object.keys(result.agentCounts).sort(), [...EXPECTED_AGENTS].sort());
  for (const agent of EXPECTED_AGENTS) assert.equal(result.agentCounts[agent], 10);
  for (const agent of EXPECTED_AGENTS) {
    assert.deepEqual(
      [...result.categoriesByAgent[agent]].sort(),
      [...EXPECTED_CATEGORIES].sort(),
    );
  }
});

test("perfect 60-case run is runtime-verifiable by contract", () => {
  const results = suite.cases.map((testCase) => perfectResult(testCase));
  const validation = validateRunResults(suite, results);
  assert.deepEqual(validation.errors, []);

  const summary = summarizeRun(suite, results);
  assert.equal(summary.complete, true);
  assert.equal(summary.runtimeVerified, true);
  assert.equal(summary.criticalFailures, 0);
  assert.equal(summary.averageScore, 5);
  for (const agent of EXPECTED_AGENTS) {
    assert.equal(summary.byAgent[agent].runtimeVerified, true);
  }
});

test("unknown runtime identity blocks runtime verification", () => {
  const results = suite.cases.map((testCase) =>
    perfectResult(testCase, { runtime_version: "UNKNOWN", config_hash: "UNKNOWN" }),
  );
  const summary = summarizeRun(suite, results);
  assert.equal(summary.complete, true);
  assert.equal(summary.runtimeVerified, false);
  for (const agent of EXPECTED_AGENTS) {
    assert.equal(summary.byAgent[agent].runtimeVerified, false);
    assert.ok(summary.byAgent[agent].identityUnresolved > 0);
  }
});

test("critical failure caps effective score and blocks promotion", () => {
  const first = suite.cases[0];
  const results = suite.cases.map((testCase) =>
    perfectResult(
      testCase,
      testCase.case_id === first.case_id
        ? {
            critical_failure: true,
            scores: {
              correct_owner_or_abstention: 1,
              truth_and_freshness: 1,
              permission_and_privacy: 1,
              useful_output: 1,
              handoff_or_next_action: 1,
            },
          }
        : {},
    ),
  );
  const summary = summarizeRun(suite, results);
  assert.equal(summary.criticalFailures, 1);
  assert.equal(summary.runtimeVerified, false);
  assert.equal(summary.byAgent[first.agent].runtimeVerified, false);
  assert.equal(summary.byAgent[first.agent].minimumEffectiveScore, 2);
});

test("wrong prompt or duplicate case is rejected", () => {
  const results = suite.cases.map((testCase) => perfectResult(testCase));
  results[0] = { ...results[0], prompt: "changed prompt" };
  results[1] = { ...results[1], case_id: results[0].case_id };
  const validation = validateRunResults(suite, results);
  assert.ok(validation.errors.some((e) => e.includes("duplicate case_id")));
  assert.ok(validation.errors.some((e) => e.includes("prompt mismatch")));
});
