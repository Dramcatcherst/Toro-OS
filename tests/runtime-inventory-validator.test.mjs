import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  RUNTIME_INVENTORY_CONTRACT_VERSION,
  validateRuntimeInventory,
} from "../scripts/runtime-inventory-validator.mjs";

const playbooks = JSON.parse(
  await readFile(
    new URL("../data/toro_canonical_skill_playbooks_v1.json", import.meta.url),
    "utf8",
  ),
);

function validManifest(overrides = {}) {
  return {
    contract_version: RUNTIME_INVENTORY_CONTRACT_VERSION,
    runtime_id: "qa-tere-wespeak",
    runtime_type: "wespeak",
    environment: "qa",
    verification_state: "VERIFIED",
    observed_at: "2026-09-23T15:00:00Z",
    runtime_version: "wespeak-runtime-2026.09.23",
    runtime_build_ref: "qa-build-42",
    agent: "TERE",
    canonical_skill: "tere-revenue",
    skill_version: "TERE-REVENUE-v1",
    config_version: "TERE-OPERATING-VOICE-v2",
    config_hash: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    loaded_playbooks: ["tere-guest-lifecycle"],
    model: {
      provider: "runtime-managed",
      model_id: "observable-runtime-model",
      version: "2026-09-23",
    },
    tool_permissions: [
      {
        tool_key: "kross-read",
        mode: "read",
        scope: "Dreamcatcher live booking truth",
        verified: true,
      },
    ],
    workflow_authority: [
      {
        workflow_key: "guest-reply",
        a_level: "A3",
        policy_ref: "POLICY-AGENT-TERE-PERMISSION",
        verified: true,
      },
    ],
    source_authorities: [
      {
        domain: "live_booking",
        system: "Kross",
        freshness_state: "fresh",
        verified: true,
      },
    ],
    evaluation: {
      suite_id: "TORO-AGENT-EVAL-V1-20260923",
      last_run_at: "2026-09-23T15:05:00Z",
      cases_run: 10,
      cases_passed: 10,
      critical_failures: 0,
      runtime_verified: true,
    },
    evidence_refs: [
      "docs/evidence/example-runtime-eval.json",
      "runtime:qa-tere-wespeak:config-ack",
    ],
    fallback: {
      mode: "human_handoff",
      reference: "reception",
    },
    rollback: {
      reference: "previous-config-version",
    },
    secrets_present: false,
    ...overrides,
  };
}

test("verified canonical TERE runtime manifest passes", () => {
  const result = validateRuntimeInventory(validManifest(), playbooks);
  assert.deepEqual(result.errors, []);
  assert.equal(result.status, "PASS");
  assert.equal(result.claimedVerificationState, "VERIFIED");
  assert.equal(result.effectiveVerificationState, "VERIFIED");
});

test("verified state fails when runtime/config identity is unknown", () => {
  const manifest = validManifest({
    runtime_version: "UNKNOWN",
    config_hash: "UNKNOWN",
  });
  const result = validateRuntimeInventory(manifest, playbooks);
  assert.equal(result.status, "FAIL");
  assert.ok(result.errors.some((e) => e.includes("VERIFIED requires known runtime_version")));
  assert.ok(result.errors.some((e) => e.includes("VERIFIED requires a valid config_hash")));
});

test("wrong canonical skill for agent fails", () => {
  const manifest = validManifest({ canonical_skill: "sky-growth" });
  const result = validateRuntimeInventory(manifest, playbooks);
  assert.equal(result.status, "FAIL");
  assert.ok(result.errors.some((e) => e.includes("canonical skill mismatch for TERE")));
});

test("unknown or cross-agent playbook fails", () => {
  const manifest = validManifest({ loaded_playbooks: ["rico-operations-readiness"] });
  const result = validateRuntimeInventory(manifest, playbooks);
  assert.equal(result.status, "FAIL");
  assert.ok(result.errors.some((e) => e.includes("playbook not owned by TERE")));
});

test("legacy L autonomy labels fail", () => {
  const manifest = validManifest({
    workflow_authority: [
      {
        workflow_key: "guest-reply",
        a_level: "L2",
        policy_ref: "POLICY-AGENT-TERE-PERMISSION",
        verified: true,
      },
    ],
  });
  const result = validateRuntimeInventory(manifest, playbooks);
  assert.equal(result.status, "FAIL");
  assert.ok(result.errors.some((e) => e.includes("invalid A-level L2")));
});

test("manifest containing secret-like fields fails closed", () => {
  const manifest = validManifest();
  manifest.runtime = { api_key: "should-never-be-here" };
  const result = validateRuntimeInventory(manifest, playbooks);
  assert.equal(result.status, "FAIL");
  assert.ok(result.errors.some((e) => e.includes("secret-like field")));
});

test("observed manifest may contain unknown versions but cannot become verified", () => {
  const manifest = validManifest({
    verification_state: "OBSERVED",
    runtime_version: "UNKNOWN",
    runtime_build_ref: "UNKNOWN",
    skill_version: "UNKNOWN",
    config_version: "UNKNOWN",
    config_hash: "UNKNOWN",
    evaluation: {
      suite_id: "TORO-AGENT-EVAL-V1-20260923",
      last_run_at: null,
      cases_run: 0,
      cases_passed: 0,
      critical_failures: 0,
      runtime_verified: false,
    },
    evidence_refs: ["read-only inventory observation"],
  });
  const result = validateRuntimeInventory(manifest, playbooks);
  assert.equal(result.status, "PASS");
  assert.equal(result.effectiveVerificationState, "OBSERVED");
});

test("verified claim is downgraded/fails when eval is incomplete or critical", () => {
  const manifest = validManifest({
    evaluation: {
      suite_id: "TORO-AGENT-EVAL-V1-20260923",
      last_run_at: "2026-09-23T15:05:00Z",
      cases_run: 10,
      cases_passed: 9,
      critical_failures: 1,
      runtime_verified: false,
    },
  });
  const result = validateRuntimeInventory(manifest, playbooks);
  assert.equal(result.status, "FAIL");
  assert.ok(result.errors.some((e) => e.includes("VERIFIED requires 10/10 agent cases")));
  assert.ok(result.errors.some((e) => e.includes("VERIFIED requires zero critical failures")));
});
