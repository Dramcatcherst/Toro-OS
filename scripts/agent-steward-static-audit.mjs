import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export const EXPECTED_CANONICAL_AGENTS = Object.freeze([
  "TORO",
  "TERE",
  "RICO",
  "FIONA",
  "SKY",
  "SOBRESITO",
]);

const EXPECTED_AGENT_SKILLS = Object.freeze({
  TORO: "toro-brain",
  TERE: "tere-revenue",
  RICO: "rico-operations",
  FIONA: "fiona-finance",
  SKY: "sky-growth",
  SOBRESITO: "sobresito-systems",
});

function unique(values) {
  return [...new Set(values)];
}

export function auditAgentSkillArchitecture({
  catalog,
  ownership,
  playbooks,
  externalPolicy,
  evalSuite,
}) {
  const errors = [];
  const warnings = [];
  const catalogKeys = new Set(catalog.map((item) => item.key));
  const ownershipByKey = new Map(
    (ownership.capabilities ?? []).map((item) => [item.key, item]),
  );

  for (const key of catalogKeys) {
    if (!ownershipByKey.has(key)) {
      errors.push(`ownership missing capability ${key}`);
    }
  }

  for (const key of ownershipByKey.keys()) {
    if (!catalogKeys.has(key)) {
      errors.push(`ownership references unknown capability ${key}`);
    }
  }

  const playbookAssignments = new Map();
  const canonicalNames = [];
  const aliases = [];
  const canonicalSkillsByAgent = {};

  for (const agent of EXPECTED_CANONICAL_AGENTS) {
    const contract = playbooks.agents?.[agent];
    if (!contract) {
      errors.push(`missing canonical playbook agent ${agent}`);
      continue;
    }

    const expectedSkill = EXPECTED_AGENT_SKILLS[agent];
    if (contract.canonical_skill !== expectedSkill) {
      errors.push(
        `canonical skill mismatch for ${agent}: expected ${expectedSkill}, found ${contract.canonical_skill}`,
      );
    }

    canonicalSkillsByAgent[agent] = contract.canonical_skill;
    canonicalNames.push(contract.canonical_skill);

    for (const alias of contract.aliases ?? []) {
      aliases.push(alias);
    }

    for (const playbook of contract.playbooks ?? []) {
      if (/\bL[0-5]\b/i.test(String(playbook.default_action_ceiling ?? ""))) {
        errors.push(
          `legacy autonomy label in canonical playbook ${playbook.id}: ${playbook.default_action_ceiling}`,
        );
      }
      for (const capability of playbook.capabilities ?? []) {
        const list = playbookAssignments.get(capability) ?? [];
        list.push({ agent, playbook: playbook.id });
        playbookAssignments.set(capability, list);

        const owned = ownershipByKey.get(capability);
        if (!owned) continue;
        if (owned.primary_agent !== agent) {
          errors.push(
            `playbook owner mismatch for ${capability}: map=${owned.primary_agent}, playbook=${agent}`,
          );
        }
        if (owned.canonical_skill !== contract.canonical_skill) {
          errors.push(
            `skill mismatch for ${capability}: map=${owned.canonical_skill}, playbook=${contract.canonical_skill}`,
          );
        }
      }
    }
  }

  for (const key of catalogKeys) {
    const assigned = playbookAssignments.get(key) ?? [];
    if (assigned.length === 0) {
      errors.push(`capability missing from playbooks: ${key}`);
    }
    if (assigned.length > 1) {
      errors.push(`capability assigned to multiple playbooks: ${key}`);
    }
  }

  for (const [key] of playbookAssignments) {
    if (!catalogKeys.has(key)) {
      errors.push(`playbook references unknown capability ${key}`);
    }
  }

  const nameCounts = new Map();
  for (const name of [...canonicalNames, ...aliases]) {
    const count = (nameCounts.get(name) ?? 0) + 1;
    nameCounts.set(name, count);
  }
  for (const [name, count] of nameCounts) {
    if (count > 1) errors.push(`skill/alias collision: ${name}`);
  }

  if ((externalPolicy.canonical_toro_skills_imported ?? 0) !== 0) {
    errors.push("external platform skills imported into canonical TORO registry");
  }

  if ((ownership.summary?.capabilities ?? catalog.length) !== catalog.length) {
    errors.push(
      `capability count mismatch: catalog=${catalog.length}, map=${ownership.summary?.capabilities}`,
    );
  }

  const mappedNewAgentRequirements = ownership.capabilities?.filter(
    (item) => item.new_agent_required === true,
  ) ?? [];
  if (mappedNewAgentRequirements.length > 0) {
    errors.push(
      `current map requests new agents: ${mappedNewAgentRequirements.map((x) => x.key).join(", ")}`,
    );
  }

  const evalAgents = new Set((evalSuite.cases ?? []).map((testCase) => testCase.agent));
  for (const agent of EXPECTED_CANONICAL_AGENTS) {
    if (!evalAgents.has(agent)) {
      errors.push(`eval suite missing canonical agent ${agent}`);
    }
  }
  for (const agent of evalAgents) {
    if (!EXPECTED_CANONICAL_AGENTS.includes(agent)) {
      errors.push(`eval suite contains non-canonical agent ${agent}`);
    }
  }

  const playbookCount = Object.values(playbooks.agents ?? {}).reduce(
    (sum, contract) => sum + (contract.playbooks?.length ?? 0),
    0,
  );
  const duplicates = [...playbookAssignments.entries()].filter(
    ([, entries]) => entries.length > 1,
  );

  if (playbookCount > 24) {
    warnings.push(
      `playbook count ${playbookCount} is high; consider consolidation before creating more skills`,
    );
  }

  const families = unique(
    (ownership.capabilities ?? []).map((item) => item.capability_family),
  );

  const recommendations = [];
  if (errors.some((e) => e.startsWith("ownership missing capability"))) {
    recommendations.push("MAP_EXISTING_CAPABILITY_OWNER_BEFORE_NEW_AGENT");
  }
  if (errors.some((e) => e.includes("assigned to multiple playbooks"))) {
    recommendations.push("MERGE_OR_SELECT_SINGLE_PRIMARY_PLAYBOOK");
  }
  if (errors.some((e) => e.includes("skill/alias collision"))) {
    recommendations.push("RESOLVE_ALIAS_COLLISION_PRESERVE_CANONICAL_IDENTITY");
  }
  if (errors.some((e) => e.includes("current map requests new agents"))) {
    recommendations.push("REVIEW_AGENT_CANDIDATE_AGAINST_SKILL_WORKFLOW_REUSE_GATE");
  }
  if (errors.some((e) => e.includes("external platform skills imported"))) {
    recommendations.push("REMOVE_PROVIDER_SKILL_FROM_CANONICAL_REGISTRY_USE_ADAPTER_POLICY");
  }
  if (errors.some((e) => e.includes("eval suite missing canonical agent"))) {
    recommendations.push("RESTORE_EVAL_COVERAGE_BEFORE_PROMOTION");
  }
  if (errors.some((e) => e.includes("legacy autonomy label in canonical playbook"))) {
    recommendations.push("MIGRATE_PLAYBOOK_TO_CANONICAL_A0_A6_AUTONOMY");
  }
  if (!errors.length) recommendations.push("NO_CHANGE");

  return {
    status: errors.length ? "FAIL" : "PASS",
    disposition: errors.length ? "REVIEW_REQUIRED" : "NO_CHANGE",
    errors,
    warnings,
    recommendations: unique(recommendations),
    summary: {
      capabilities: catalog.length,
      capabilityFamilies: families.length,
      playbooks: playbookCount,
      canonicalAgents: EXPECTED_CANONICAL_AGENTS.length,
      canonicalSkillsByAgent,
      orphanCapabilities: [...catalogKeys].filter((key) => !ownershipByKey.has(key)).length,
      duplicatePlaybookAssignments: duplicates.length,
      newAgentsRequired: mappedNewAgentRequirements.length,
      externalPlatformSkillsObserved: externalPolicy.observed_platform_skill_count ?? null,
      externalPlatformSkillsImported:
        externalPolicy.canonical_toro_skills_imported ?? null,
      evalAgents: [...evalAgents].sort(),
    },
  };
}

async function loadJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function main() {
  const root = new URL("../", import.meta.url);
  const [catalogRaw, ownership, playbooks, externalPolicy, evalSuite] =
    await Promise.all([
      loadJson(new URL("data/toro_capability_catalog_seed.json", root)),
      loadJson(new URL("data/toro_agent_capability_ownership_v1.json", root)),
      loadJson(new URL("data/toro_canonical_skill_playbooks_v1.json", root)),
      loadJson(new URL("data/toro_external_skill_adapter_policy_v1.json", root)),
      loadJson(new URL("data/toro_agent_eval_cases_v1.json", root)),
    ]);

  const catalog = Array.isArray(catalogRaw)
    ? catalogRaw
    : catalogRaw.capabilities ?? catalogRaw.items ?? [];

  const result = auditAgentSkillArchitecture({
    catalog,
    ownership,
    playbooks,
    externalPolicy,
    evalSuite,
  });

  console.log(JSON.stringify(result, null, 2));
  if (result.errors.length) process.exitCode = 1;
}

const invokedAsScript =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedAsScript) {
  await main();
}
