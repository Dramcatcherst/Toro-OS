import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { auditVerifiedUserProfiles } from "../scripts/user-profile-static-audit.mjs";

const root = new URL("../", import.meta.url);
const [registry, messagePack] = await Promise.all([
  readFile(new URL("data/toro_verified_user_profiles_v1.json", root), "utf8").then(JSON.parse),
  readFile(new URL("data/toro_role_message_pack_v1.json", root), "utf8").then(JSON.parse),
]);

function copy(value) {
  return structuredClone(value);
}

test("verified user profile registry passes the static audit", () => {
  const result = auditVerifiedUserProfiles({ registry, messagePack });
  assert.equal(result.status, "PASS");
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.summary, { people: 3, sharedAccounts: 1, peopleAssistantUsers: 2 });
});

test("a job profile cannot broaden the People assistant allowlist", () => {
  const broken = copy(registry);
  broken.people_assistant_gate.allowed_user_keys.push("alexandra_reception");
  broken.people.find((person) => person.user_key === "alexandra_reception").people_assistant_eligible = true;
  const result = auditVerifiedUserProfiles({ registry: broken, messagePack });
  assert.equal(result.status, "FAIL");
  assert.ok(result.errors.includes("People assistant allowlist does not match canonical owner direction"));
});

test("raw personal contact identifiers are rejected", () => {
  const broken = copy(registry);
  broken.people[0].contact = "+506 8000 0000";
  const result = auditVerifiedUserProfiles({ registry: broken, messagePack });
  assert.equal(result.status, "FAIL");
  assert.ok(result.errors.includes("registry contains a raw phone number or email address"));
});

test("a shared account cannot impersonate a person", () => {
  const broken = copy(registry);
  broken.shared_accounts[0].must_not_impersonate_individual = false;
  const result = auditVerifiedUserProfiles({ registry: broken, messagePack });
  assert.equal(result.status, "FAIL");
  assert.ok(result.errors.some((error) => error.includes("lacks team identity protection")));
});

test("unknown role profiles fail closed", () => {
  const broken = copy(registry);
  broken.people[1].role_contexts.push("admin_superuser");
  const result = auditVerifiedUserProfiles({ registry: broken, messagePack });
  assert.equal(result.status, "FAIL");
  assert.ok(result.errors.includes("unknown role message profile ana_carolina_admin: admin_superuser"));
});
