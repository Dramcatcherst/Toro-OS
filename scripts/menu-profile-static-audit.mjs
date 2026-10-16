import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export const REQUIRED_MENU_PROFILES = Object.freeze([
  "personal",
  "owner_executive",
  "manager",
  "reception",
  "housekeeping",
  "maintenance",
  "department_lead",
  "finance",
  "hr_people",
  "growth",
  "systems",
  "auditor",
  "employee_general",
  "guest_prospect",
  "guest_reserved",
]);

export const REQUIRED_SUPERMENU_CATEGORIES = Object.freeze([
  "MA",
  "MB",
  "MC",
  "MD",
  "ME",
  "MF",
  "MG",
  "MH",
  "MI",
  "MJ",
]);

function unique(values) {
  return [...new Set(values)];
}

export function auditMenuArchitecture({ menus, messages, toolbox, submenus }) {
  const errors = [];
  const warnings = [];

  const menuProfiles = new Map((menus.profiles ?? []).map((p) => [p.id, p]));
  const messageIds = new Set(Object.keys(messages.profiles ?? {}));
  const toolboxIds = new Set(Object.keys(toolbox.profiles ?? {}));

  for (const id of REQUIRED_MENU_PROFILES) {
    if (!menuProfiles.has(id)) errors.push(`missing menu profile ${id}`);
    if (!messageIds.has(id)) errors.push(`missing message profile ${id}`);
    if (!toolboxIds.has(id)) errors.push(`missing toolbox profile ${id}`);
  }

  for (const id of menuProfiles.keys()) {
    if (!REQUIRED_MENU_PROFILES.includes(id)) warnings.push(`unexpected menu profile ${id}`);
  }

  for (const [id, profile] of menuProfiles) {
    const items = profile.primary ?? [];
    if (items.length < 4 || items.length > 6) {
      errors.push(`menu profile ${id} has ${items.length} primary items; expected 4-6`);
    }

    const keys = [];
    const toolboxCapabilities = new Set(toolbox.profiles?.[id]?.capabilities ?? []);

    for (const item of items) {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        errors.push(`menu profile ${id} contains non-object item`);
        continue;
      }

      for (const field of ["key", "emoji", "label", "aliases", "capability"]) {
        if (!(field in item)) errors.push(`menu profile ${id} item missing ${field}`);
      }

      if (!item.key || typeof item.key !== "string") continue;
      keys.push(item.key);

      if (!Array.isArray(item.aliases) || item.aliases.length === 0) {
        errors.push(`menu profile ${id} item ${item.key} has no aliases`);
      }

      if (!item.capability || typeof item.capability !== "string") {
        errors.push(`menu profile ${id} item ${item.key} has no capability`);
      } else if (!item.capability.startsWith("ui.") && !toolboxCapabilities.has(item.capability)) {
        errors.push(
          `menu capability missing from toolbox ${id}: ${item.key} -> ${item.capability}`,
        );
      }
    }

    if (unique(keys).length !== keys.length) {
      errors.push(`menu profile ${id} contains duplicate option keys`);
    }

    const capabilities = toolbox.profiles?.[id]?.capabilities ?? [];
    if (unique(capabilities).length !== capabilities.length) {
      errors.push(`toolbox profile ${id} contains duplicate capabilities`);
    }
    if (capabilities.length === 0) {
      errors.push(`toolbox profile ${id} has no capabilities`);
    }
  }

  const shortcutGroups = menus.rules?.shortcuts ?? {};
  const shortcutOwner = new Map();
  for (const [group, values] of Object.entries(shortcutGroups)) {
    for (const value of values ?? []) {
      const normalized = String(value).trim().toLowerCase();
      if (!normalized) continue;
      const previous = shortcutOwner.get(normalized);
      if (previous && previous !== group) {
        errors.push(`shortcut collision ${normalized}: ${previous} vs ${group}`);
      }
      shortcutOwner.set(normalized, group);
    }
  }

  if (menus.rules?.visible_menu_never_grants_permission !== true) {
    errors.push("menu permission safety rule missing");
  }
  if (menus.rules?.personalization_never_expands_authority !== true) {
    errors.push("personalization authority safety rule missing");
  }
  if (toolbox.rules?.execution_rechecks_authority !== true) {
    errors.push("toolbox execution recheck rule missing");
  }
  if (toolbox.rules?.dead_buttons_forbidden !== true) {
    errors.push("dead-button rule missing");
  }

  const supermenu = submenus?.supermenu;
  const categories = supermenu?.categories ?? [];
  const categoryCodes = categories.map((category) => category.code);
  const stableCodes = [];
  const shortCodes = [];

  if (!supermenu?.version) errors.push("supermenu version missing");
  if (submenus?.rules?.stable_codes_never_grant_authority !== true) {
    errors.push("stable-code authority safety rule missing");
  }
  if (submenus?.rules?.short_codes_require_matching_active_menu_version !== true) {
    errors.push("short-code active-menu safety rule missing");
  }
  if (submenus?.rules?.target_capabilities_default_hidden !== true) {
    errors.push("target-capability default-hidden rule missing");
  }

  const registeredCapabilities = new Set(
    Object.values(toolbox.profiles ?? {}).flatMap(
      (profile) => profile.capabilities ?? [],
    ),
  );
  const targetCapabilitiesList =
    supermenu?.capability_contract?.target_capabilities ?? [];
  const targetCapabilities = new Set(targetCapabilitiesList);
  const usedSupermenuCapabilities = new Set(
    categories.flatMap((category) =>
      (category.items ?? [])
        .map((item) => item.capability)
        .filter((capability) => typeof capability === "string"),
    ),
  );
  if (supermenu?.capability_contract?.target_status !== "TARGET_BLOCKED") {
    errors.push("supermenu target status must be TARGET_BLOCKED");
  }
  if (
    supermenu?.capability_contract?.target_reason !==
    "not_registered_in_role_toolbox"
  ) {
    errors.push(
      "supermenu target reason must be not_registered_in_role_toolbox",
    );
  }
  if (targetCapabilities.size !== targetCapabilitiesList.length) {
    errors.push("supermenu target capability list contains duplicates");
  }
  for (const capability of targetCapabilities) {
    if (registeredCapabilities.has(capability)) {
      errors.push(`target capability already registered: ${capability}`);
    }
    if (!usedSupermenuCapabilities.has(capability)) {
      errors.push(`unused target capability: ${capability}`);
    }
  }

  for (const requiredCode of REQUIRED_SUPERMENU_CATEGORIES) {
    if (!categoryCodes.includes(requiredCode)) {
      errors.push(`missing supermenu category ${requiredCode}`);
    }
  }
  if (unique(categoryCodes).length !== categoryCodes.length) {
    errors.push("supermenu contains duplicate category codes");
  }

  for (const category of categories) {
    if (!/^M[A-J]$/.test(category.code ?? "")) {
      errors.push(`invalid supermenu category code ${category.code}`);
    }
    if (`M${category.short_code}` !== category.code) {
      errors.push(`supermenu category alias mismatch ${category.code}`);
    }
    if (!Array.isArray(category.items) || category.items.length < 1 || category.items.length > 10) {
      errors.push(`supermenu category ${category.code} must contain 1-10 items`);
      continue;
    }

    for (const item of category.items) {
      stableCodes.push(item.code);
      shortCodes.push(item.short_code);
      if (!/^M[A-J][0-9]$/.test(item.code ?? "")) {
        errors.push(`invalid stable menu code ${item.code}`);
      }
      if (`M${item.short_code}` !== item.code) {
        errors.push(`stable menu alias mismatch ${item.code}`);
      }
      if (!item.code?.startsWith(category.code)) {
        errors.push(`stable menu code outside category ${item.code} -> ${category.code}`);
      }
      if (!item.capability || typeof item.capability !== "string") {
        errors.push(`stable menu code ${item.code} has no capability`);
      } else if (
        !item.capability.startsWith("ui.") &&
        !registeredCapabilities.has(item.capability) &&
        !targetCapabilities.has(item.capability)
      ) {
        errors.push(
          `stable menu capability is neither registered nor TARGET_BLOCKED: ${item.code} -> ${item.capability}`,
        );
      }
      if (!Array.isArray(item.modes) || item.modes.length === 0) {
        errors.push(`stable menu code ${item.code} has no modes`);
      }
    }
  }

  if (unique(stableCodes).length !== stableCodes.length) {
    errors.push("supermenu contains duplicate stable codes");
  }
  if (unique(shortCodes).length !== shortCodes.length) {
    errors.push("supermenu contains duplicate short codes");
  }

  const browserExecute = categories
    .flatMap((category) => category.items ?? [])
    .find((item) => item.code === "MJ9");
  if (browserExecute?.approval !== "explicit_action_time_confirmation") {
    errors.push("MJ9 explicit action-time confirmation gate missing");
  }

  const navigationCodes = (supermenu?.navigation ?? []).map((item) => item.code);
  if (navigationCodes.length !== 10 || !navigationCodes.every((code) => /^M[0-9]$/.test(code))) {
    errors.push("supermenu navigation must define M0-M9");
  }
  if (unique(navigationCodes).length !== navigationCodes.length) {
    errors.push("supermenu contains duplicate navigation codes");
  }

  return {
    status: errors.length ? "FAIL" : "PASS",
    errors,
    warnings,
    summary: {
      requiredProfiles: REQUIRED_MENU_PROFILES.length,
      menuProfiles: menuProfiles.size,
      messageProfiles: messageIds.size,
      toolboxProfiles: toolboxIds.size,
      boundMenuOptions: [...menuProfiles.values()].reduce(
        (sum, p) => sum + (p.primary?.length ?? 0),
        0,
      ),
      supermenuCategories: categories.length,
      stableRoutes: stableCodes.length,
      targetBlockedCapabilities: targetCapabilities.size,
    },
  };
}

async function loadJson(url) {
  return JSON.parse(await readFile(url, "utf8"));
}

async function main() {
  const root = new URL("../", import.meta.url);
  const [menus, messages, toolbox, submenus] = await Promise.all([
    loadJson(new URL("data/toro_conversational_menu_profiles_v1.json", root)),
    loadJson(new URL("data/toro_role_message_pack_v1.json", root)),
    loadJson(new URL("data/toro_role_toolbox_v1.json", root)),
    loadJson(new URL("data/toro_conversational_submenus_v2.json", root)),
  ]);

  const result = auditMenuArchitecture({ menus, messages, toolbox, submenus });
  console.log(JSON.stringify(result, null, 2));
  if (result.errors.length) process.exitCode = 1;
}

const invokedAsScript =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedAsScript) {
  await main();
}
