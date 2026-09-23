import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  EXPECTED_CANONICAL_AGENTS,
  auditAgentSkillArchitecture,
} from "../scripts/agent-steward-static-audit.mjs";

async function load(path) {
  return JSON.parse(await readFile(new URL("../" + path, import.meta.url), "utf8"));
}

const [catalogRaw, ownership, playbooks, externalPolicy, evalSuite] = await Promise.all([
  load("data/toro_capability_catalog_seed.json"),
  load("data/toro_agent_capability_ownership_v1.json"),
  load("data/toro_canonical_skill_playbooks_v1.json"),
  load("data/toro_external_skill_adapter_policy_v1.json"),
  load("data/toro_agent_eval_cases_v1.json"),
]);

const catalog = Array.isArray(catalogRaw)
  ? catalogRaw
  : catalogRaw.capabilities ?? catalogRaw.items ?? [];

test("static steward audit passes current canonical architecture", () => {
  const result = auditAgentSkillArchitecture({
    catalog,
    ownership,
    playbooks,
    externalPolicy,
    evalSuite,
  });

  assert.deepEqual(result.errors, []);
  assert.equal(result.status, "PASS");
  assert.equal(result.disposition, "NO_CHANGE");
  assert.deepEqual(result.recommendations, ["NO_CHANGE"]);
  assert.equal(result.summary.capabilities, 54);
  assert.equal(result.summary.playbooks, 17);
  assert.equal(result.summary.canonicalAgents, 6);
  assert.equal(result.summary.orphanCapabilities, 0);
  assert.equal(result.summary.duplicatePlaybookAssignments, 0);
  assert.equal(result.summary.newAgentsRequired, 0);
  assert.deepEqual(
    Object.keys(result.summary.canonicalSkillsByAgent).sort(),
    [...EXPECTED_CANONICAL_AGENTS].sort(),
  );
});

test("orphan capability fails closed", () => {
  const brokenOwnership = structuredClone(ownership);
  brokenOwnership.capabilities = brokenOwnership.capabilities.filter(
    (item) => item.key !== "maintenance_tasks",
  );

  const result = auditAgentSkillArchitecture({
    catalog,
    ownership: brokenOwnership,
    playbooks,
    externalPolicy,
    evalSuite,
  });

  assert.equal(result.status, "FAIL");
  assert.ok(result.errors.some((e) => e.includes("ownership missing capability maintenance_tasks")));
  assert.ok(result.recommendations.includes("MAP_EXISTING_CAPABILITY_OWNER_BEFORE_NEW_AGENT"));
});

test("duplicate capability across playbooks fails", () => {
  const brokenPlaybooks = structuredClone(playbooks);
  brokenPlaybooks.agents.TORO.playbooks[0].capabilities.push("maintenance_tasks");

  const result = auditAgentSkillArchitecture({
    catalog,
    ownership,
    playbooks: brokenPlaybooks,
    externalPolicy,
    evalSuite,
  });

  assert.equal(result.status, "FAIL");
  assert.ok(result.errors.some((e) => e.includes("capability assigned to multiple playbooks: maintenance_tasks")));
  assert.ok(result.recommendations.includes("MERGE_OR_SELECT_SINGLE_PRIMARY_PLAYBOOK"));
});

test("alias collision fails", () => {
  const brokenPlaybooks = structuredClone(playbooks);
  brokenPlaybooks.agents.SKY.aliases.push("tere-revenue");

  const result = auditAgentSkillArchitecture({
    catalog,
    ownership,
    playbooks: brokenPlaybooks,
    externalPolicy,
    evalSuite,
  });

  assert.equal(result.status, "FAIL");
  assert.ok(result.errors.some((e) => e.includes("skill/alias collision: tere-revenue")));
  assert.ok(result.recommendations.includes("RESOLVE_ALIAS_COLLISION_PRESERVE_CANONICAL_IDENTITY"));
});

test("importing platform skills into canonical registry fails policy", () => {
  const brokenPolicy = structuredClone(externalPolicy);
  brokenPolicy.canonical_toro_skills_imported = 1;

  const result = auditAgentSkillArchitecture({
    catalog,
    ownership,
    playbooks,
    externalPolicy: brokenPolicy,
    evalSuite,
  });

  assert.equal(result.status, "FAIL");
  assert.ok(result.errors.some((e) => e.includes("external platform skills imported into canonical TORO registry")));
  assert.ok(result.recommendations.includes("REMOVE_PROVIDER_SKILL_FROM_CANONICAL_REGISTRY_USE_ADAPTER_POLICY"));
});

test("evaluation suite must still cover the six canonical agents", () => {
  const brokenSuite = structuredClone(evalSuite);
  brokenSuite.cases = brokenSuite.cases.filter((c) => c.agent !== "SKY");

  const result = auditAgentSkillArchitecture({
    catalog,
    ownership,
    playbooks,
    externalPolicy,
    evalSuite: brokenSuite,
  });

  assert.equal(result.status, "FAIL");
  assert.ok(result.errors.some((e) => e.includes("eval suite missing canonical agent SKY")));
  assert.ok(result.recommendations.includes("RESTORE_EVAL_COVERAGE_BEFORE_PROMOTION"));
});


test("legacy L-level in playbook fails", () => {
  const brokenPlaybooks = structuredClone(playbooks);
  brokenPlaybooks.agents.TERE.playbooks[0].default_action_ceiling = "L2";

  const result = auditAgentSkillArchitecture({
    catalog,
    ownership,
    playbooks: brokenPlaybooks,
    externalPolicy,
    evalSuite,
  });

  assert.equal(result.status, "FAIL");
  assert.ok(
    result.errors.some((e) =>
      e.includes("legacy autonomy label in canonical playbook tere-guest-lifecycle"),
    ),
  );
  assert.ok(
    result.recommendations.includes("MIGRATE_PLAYBOOK_TO_CANONICAL_A0_A6_AUTONOMY"),
  );
});
