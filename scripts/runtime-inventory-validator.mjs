import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export const RUNTIME_INVENTORY_CONTRACT_VERSION = "TORO-RUNTIME-INVENTORY-v1";

const A_LEVELS = new Set(["A0", "A1", "A2", "A3", "A4", "A5", "A6"]);
const VERIFY_STATES = new Set(["UNVERIFIED", "OBSERVED", "VERIFIED"]);
const ENVIRONMENTS = new Set(["local", "qa", "preview", "production", "other"]);
const SECRET_FIELD_PATTERN =
  /(^|_)(password|passwd|secret|token|api[_-]?key|private[_-]?key|cookie|session[_-]?cookie|mfa|pin|recovery[_-]?code|access[_-]?key|client[_-]?secret)($|_)/i;

function isKnown(value) {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().toUpperCase() !== "UNKNOWN"
  );
}

function validHash(value) {
  return (
    typeof value === "string" &&
    /^sha256:[a-f0-9]{64}$/i.test(value.trim())
  );
}

function findSecretLikeFields(value, path = "$", found = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      findSecretLikeFields(item, `${path}[${index}]`, found),
    );
    return found;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      const next = `${path}.${key}`;
      if (SECRET_FIELD_PATTERN.test(key)) found.push(next);
      findSecretLikeFields(child, next, found);
    }
  }
  return found;
}

function expectedSkillMap(playbookManifest) {
  return Object.fromEntries(
    Object.entries(playbookManifest.agents ?? {}).map(([agent, contract]) => [
      agent,
      contract.canonical_skill,
    ]),
  );
}

function playbookOwnerMap(playbookManifest) {
  const out = new Map();
  for (const [agent, contract] of Object.entries(playbookManifest.agents ?? {})) {
    for (const playbook of contract.playbooks ?? []) {
      out.set(playbook.id, agent);
    }
  }
  return out;
}

export function validateRuntimeInventory(manifest, playbookManifest) {
  const errors = [];
  const warnings = [];
  const expectedSkills = expectedSkillMap(playbookManifest);
  const playbookOwners = playbookOwnerMap(playbookManifest);

  if (manifest?.contract_version !== RUNTIME_INVENTORY_CONTRACT_VERSION) {
    errors.push("invalid contract_version");
  }

  if (!isKnown(manifest?.runtime_id)) errors.push("runtime_id is required");
  if (!isKnown(manifest?.runtime_type)) errors.push("runtime_type is required");
  if (!ENVIRONMENTS.has(manifest?.environment)) {
    errors.push(`invalid environment ${manifest?.environment}`);
  }
  if (!VERIFY_STATES.has(manifest?.verification_state)) {
    errors.push(`invalid verification_state ${manifest?.verification_state}`);
  }

  if (!isKnown(manifest?.observed_at) || Number.isNaN(Date.parse(manifest.observed_at))) {
    errors.push("observed_at must be a valid timestamp");
  }

  const agent = manifest?.agent;
  if (!Object.hasOwn(expectedSkills, agent)) {
    errors.push(`unknown canonical agent ${agent}`);
  } else if (manifest?.canonical_skill !== expectedSkills[agent]) {
    errors.push(
      `canonical skill mismatch for ${agent}: expected ${expectedSkills[agent]}, found ${manifest?.canonical_skill}`,
    );
  }

  if (!Array.isArray(manifest?.loaded_playbooks)) {
    errors.push("loaded_playbooks must be an array");
  } else {
    const seen = new Set();
    for (const playbook of manifest.loaded_playbooks) {
      if (seen.has(playbook)) errors.push(`duplicate loaded playbook ${playbook}`);
      seen.add(playbook);
      const owner = playbookOwners.get(playbook);
      if (!owner) {
        errors.push(`unknown loaded playbook ${playbook}`);
      } else if (owner !== agent) {
        errors.push(`playbook not owned by ${agent}: ${playbook} belongs to ${owner}`);
      }
    }
  }

  if (!Array.isArray(manifest?.tool_permissions)) {
    errors.push("tool_permissions must be an array");
  } else {
    for (const permission of manifest.tool_permissions) {
      if (!isKnown(permission?.tool_key)) errors.push("tool permission missing tool_key");
      if (!["read", "draft", "write", "execute", "admin"].includes(permission?.mode)) {
        errors.push(`invalid tool permission mode ${permission?.mode}`);
      }
      if (typeof permission?.verified !== "boolean") {
        errors.push(`tool permission ${permission?.tool_key ?? "UNKNOWN"} missing verified boolean`);
      }
    }
  }

  if (!Array.isArray(manifest?.workflow_authority)) {
    errors.push("workflow_authority must be an array");
  } else {
    for (const workflow of manifest.workflow_authority) {
      if (!isKnown(workflow?.workflow_key)) {
        errors.push("workflow authority missing workflow_key");
      }
      if (!A_LEVELS.has(workflow?.a_level)) {
        errors.push(
          `invalid A-level ${workflow?.a_level} for workflow ${workflow?.workflow_key ?? "UNKNOWN"}`,
        );
      }
      if (!isKnown(workflow?.policy_ref)) {
        errors.push(`workflow ${workflow?.workflow_key ?? "UNKNOWN"} missing policy_ref`);
      }
      if (typeof workflow?.verified !== "boolean") {
        errors.push(`workflow ${workflow?.workflow_key ?? "UNKNOWN"} missing verified boolean`);
      }
    }
  }

  if (!Array.isArray(manifest?.source_authorities)) {
    errors.push("source_authorities must be an array");
  } else {
    for (const source of manifest.source_authorities) {
      if (!isKnown(source?.domain) || !isKnown(source?.system)) {
        errors.push("source authority requires domain and system");
      }
      if (!["fresh", "stale", "unknown", "not_applicable"].includes(source?.freshness_state)) {
        errors.push(
          `invalid freshness_state ${source?.freshness_state} for ${source?.domain ?? "UNKNOWN"}`,
        );
      }
      if (typeof source?.verified !== "boolean") {
        errors.push(`source authority ${source?.domain ?? "UNKNOWN"} missing verified boolean`);
      }
    }
  }

  const secretFields = findSecretLikeFields(manifest);
  for (const field of secretFields) errors.push(`secret-like field prohibited in inventory: ${field}`);
  if (manifest?.secrets_present !== false) {
    errors.push("secrets_present must be false");
  }

  const claimed = manifest?.verification_state;
  if (claimed === "VERIFIED") {
    if (!isKnown(manifest?.runtime_version)) {
      errors.push("VERIFIED requires known runtime_version");
    }
    if (!isKnown(manifest?.runtime_build_ref)) {
      errors.push("VERIFIED requires known runtime_build_ref");
    }
    if (!isKnown(manifest?.skill_version)) {
      errors.push("VERIFIED requires known skill_version");
    }
    if (!isKnown(manifest?.config_version)) {
      errors.push("VERIFIED requires known config_version");
    }
    if (!validHash(manifest?.config_hash)) {
      errors.push("VERIFIED requires a valid config_hash sha256");
    }

    const evaluation = manifest?.evaluation ?? {};
    if (evaluation.suite_id !== "TORO-AGENT-EVAL-V1-20260923") {
      errors.push("VERIFIED requires canonical eval suite id");
    }
    if (evaluation.cases_run !== 10 || evaluation.cases_passed !== 10) {
      errors.push("VERIFIED requires 10/10 agent cases");
    }
    if (evaluation.critical_failures !== 0) {
      errors.push("VERIFIED requires zero critical failures");
    }
    if (evaluation.runtime_verified !== true) {
      errors.push("VERIFIED requires evaluation.runtime_verified=true");
    }
    if (!isKnown(evaluation.last_run_at) || Number.isNaN(Date.parse(evaluation.last_run_at))) {
      errors.push("VERIFIED requires valid evaluation.last_run_at");
    }
    if (!Array.isArray(manifest?.evidence_refs) || manifest.evidence_refs.length === 0) {
      errors.push("VERIFIED requires evidence_refs");
    }
    if ((manifest.workflow_authority ?? []).some((w) => w.verified !== true)) {
      errors.push("VERIFIED requires all declared workflow authorities to be verified");
    }
  }

  let effectiveVerificationState = claimed;
  if (errors.length) {
    effectiveVerificationState = "UNVERIFIED";
  } else if (claimed === "VERIFIED") {
    effectiveVerificationState = "VERIFIED";
  } else if (claimed === "OBSERVED") {
    effectiveVerificationState = "OBSERVED";
  } else {
    effectiveVerificationState = "UNVERIFIED";
  }

  if (
    claimed !== "VERIFIED" &&
    (manifest?.evaluation?.runtime_verified === true ||
      manifest?.evaluation?.cases_passed === 10)
  ) {
    warnings.push(
      "evaluation suggests stronger evidence than verification_state; do not auto-promote without identity/hash gates",
    );
  }

  return {
    status: errors.length ? "FAIL" : "PASS",
    claimedVerificationState: claimed ?? null,
    effectiveVerificationState,
    errors,
    warnings,
    summary: {
      runtimeId: manifest?.runtime_id ?? null,
      runtimeType: manifest?.runtime_type ?? null,
      environment: manifest?.environment ?? null,
      agent: agent ?? null,
      canonicalSkill: manifest?.canonical_skill ?? null,
      loadedPlaybooks: manifest?.loaded_playbooks?.length ?? 0,
      workflowAuthorities: manifest?.workflow_authority?.length ?? 0,
      toolPermissions: manifest?.tool_permissions?.length ?? 0,
      sourceAuthorities: manifest?.source_authorities?.length ?? 0,
    },
  };
}

async function main() {
  const manifestPath = process.argv[2];
  if (!manifestPath) {
    console.error("Usage: node scripts/runtime-inventory-validator.mjs <manifest.json>");
    process.exitCode = 2;
    return;
  }

  const [manifest, playbooks] = await Promise.all([
    readFile(manifestPath, "utf8").then(JSON.parse),
    readFile(new URL("../data/toro_canonical_skill_playbooks_v1.json", import.meta.url), "utf8").then(JSON.parse),
  ]);

  const result = validateRuntimeInventory(manifest, playbooks);
  console.log(JSON.stringify(result, null, 2));
  if (result.errors.length) process.exitCode = 1;
}

const invokedAsScript =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedAsScript) await main();
