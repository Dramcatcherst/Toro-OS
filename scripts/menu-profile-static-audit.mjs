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

function unique(values) {
  return [...new Set(values)];
}

export function auditMenuArchitecture({ menus, messages, toolbox }) {
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
    },
  };
}

async function loadJson(url) {
  return JSON.parse(await readFile(url, "utf8"));
}

async function main() {
  const root = new URL("../", import.meta.url);
  const [menus, messages, toolbox] = await Promise.all([
    loadJson(new URL("data/toro_conversational_menu_profiles_v1.json", root)),
    loadJson(new URL("data/toro_role_message_pack_v1.json", root)),
    loadJson(new URL("data/toro_role_toolbox_v1.json", root)),
  ]);

  const result = auditMenuArchitecture({ menus, messages, toolbox });
  console.log(JSON.stringify(result, null, 2));
  if (result.errors.length) process.exitCode = 1;
}

const invokedAsScript =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedAsScript) {
  await main();
}
