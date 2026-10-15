import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const RAW_IDENTIFIER_PATTERN = /(\+\d[\d\s().-]{6,}\d)|(\b\d{8,15}\b)|([\w.+-]+@[\w.-]+\.[A-Za-z]{2,})/;
const REQUIRED_PEOPLE_ASSISTANT_USERS = Object.freeze([
  "ana_carolina_admin",
  "mauricio_owner",
]);

function unique(values) {
  return [...new Set(values)];
}

export function auditVerifiedUserProfiles({ registry, messagePack }) {
  const errors = [];
  const warnings = [];
  const people = registry.people ?? [];
  const sharedAccounts = registry.shared_accounts ?? [];
  const knownProfiles = new Set(Object.keys(messagePack.profiles ?? {}));
  const userKeys = people.map((person) => person.user_key);
  const accountKeys = sharedAccounts.map((account) => account.account_key);

  if (registry.status !== "specified_not_runtime_verified") {
    errors.push("registry must not claim runtime deployment without evidence");
  }
  if (registry.rules?.personalization_never_expands_authority !== true) {
    errors.push("personalization authority safety rule missing");
  }
  if (registry.rules?.role_and_membership_remain_authoritative !== true) {
    errors.push("role/membership authority rule missing");
  }
  if (registry.rules?.raw_phone_email_and_secret_identifiers_forbidden !== true) {
    errors.push("raw identifier safety rule missing");
  }

  const serialized = JSON.stringify(registry);
  if (RAW_IDENTIFIER_PATTERN.test(serialized)) {
    errors.push("registry contains a raw phone number or email address");
  }
  if (unique(userKeys).length !== userKeys.length) errors.push("duplicate user_key");
  if (unique(accountKeys).length !== accountKeys.length) errors.push("duplicate account_key");

  for (const person of people) {
    if (!person.user_key || !person.presentation_name) {
      errors.push("person missing user_key or presentation_name");
    }
    if (!person.identity_verification || !person.privacy_scope) {
      errors.push(`person ${person.user_key ?? "unknown"} missing verification or privacy scope`);
    }
    if (!Array.isArray(person.sources) || person.sources.length === 0) {
      errors.push(`person ${person.user_key ?? "unknown"} missing provenance`);
    }
    for (const role of person.role_contexts ?? []) {
      if (!knownProfiles.has(role)) {
        errors.push(`unknown role message profile ${person.user_key}: ${role}`);
      }
    }
    if (person.preferred_address == null && person.communication?.name_confirmation_required !== true) {
      warnings.push(`person ${person.user_key} has no preferred address and no confirmation gate`);
    }
  }

  for (const account of sharedAccounts) {
    if (!knownProfiles.has(account.role_context)) {
      errors.push(`unknown shared-account role profile ${account.account_key}: ${account.role_context}`);
    }
    if (!account.team_label || account.must_not_impersonate_individual !== true) {
      errors.push(`shared account ${account.account_key} lacks team identity protection`);
    }
    if (account.people_assistant_eligible !== false) {
      errors.push(`shared account ${account.account_key} may not receive People assistant access`);
    }
  }

  const allowed = [...(registry.people_assistant_gate?.allowed_user_keys ?? [])].sort();
  if (JSON.stringify(allowed) !== JSON.stringify(REQUIRED_PEOPLE_ASSISTANT_USERS)) {
    errors.push("People assistant allowlist does not match canonical owner direction");
  }
  if (registry.people_assistant_gate?.job_profile_alone_grants_access !== false) {
    errors.push("People assistant must not be granted by job profile alone");
  }
  if (registry.people_assistant_gate?.runtime_activation_verified !== false) {
    errors.push("People assistant activation is not runtime verified");
  }
  for (const key of allowed) {
    const person = people.find((candidate) => candidate.user_key === key);
    if (!person || person.people_assistant_eligible !== true) {
      errors.push(`People assistant allowlisted user is missing or ineligible: ${key}`);
    }
  }
  for (const person of people.filter((candidate) => candidate.people_assistant_eligible === true)) {
    if (!allowed.includes(person.user_key)) {
      errors.push(`People assistant eligible user is not explicitly allowlisted: ${person.user_key}`);
    }
  }

  return {
    status: errors.length ? "FAIL" : "PASS",
    errors,
    warnings,
    summary: {
      people: people.length,
      sharedAccounts: sharedAccounts.length,
      peopleAssistantUsers: allowed.length,
    },
  };
}

async function loadJson(url) {
  return JSON.parse(await readFile(url, "utf8"));
}

async function main() {
  const root = new URL("../", import.meta.url);
  const [registry, messagePack] = await Promise.all([
    loadJson(new URL("data/toro_verified_user_profiles_v1.json", root)),
    loadJson(new URL("data/toro_role_message_pack_v1.json", root)),
  ]);
  const result = auditVerifiedUserProfiles({ registry, messagePack });
  console.log(JSON.stringify(result, null, 2));
  if (result.errors.length) process.exitCode = 1;
}

const invokedAsScript = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedAsScript) await main();
