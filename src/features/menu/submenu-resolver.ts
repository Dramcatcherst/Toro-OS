import submenusData from "../../../data/toro_conversational_submenus_v2.json";

import type {
  ToroMenuAvailabilityState,
  ToroResolvedMenu,
  ToroResolvedMenuItem,
} from "./types";

type SubmenuManifestItem = {
  key: string;
  emoji: string;
  label: string;
  aliases: string[];
  capability: string;
};

type SubmenuManifest = {
  submenus?: Record<string, SubmenuManifestItem[]>;
};

const manifest = submenusData as SubmenuManifest;

const SUBMENU_BINDINGS: Record<string, Record<string, string>> = {
  owner_executive: {
    money: "owner_money",
  },
  reception: {
    quote_sell: "reception_quote",
    guest_messages: "reception_guest_messages",
  },
  housekeeping: {
    report_issue: "housekeeping_issue",
  },
  maintenance: {
    close_evidence: "maintenance_close",
  },
  employee_general: {
    requests: "employee_requests",
  },
  guest_prospect: {
    quote: "guest_prospect_quote",
  },
  guest_reserved: {
    help: "guest_reserved_help",
  },
};

const SAFE_VISIBLE_STATES = new Set<ToroMenuAvailabilityState>([
  "READY",
  "READ_ONLY",
  "DEGRADED",
]);

export function submenuIdForParent(
  profileId: string,
  parentKey: string,
): string | null {
  return SUBMENU_BINDINGS[profileId]?.[parentKey] ?? null;
}

export function resolveToroSubmenu({
  profileId,
  parentKey,
  capabilityStates,
}: {
  profileId: string;
  parentKey: string;
  capabilityStates: Record<string, ToroMenuAvailabilityState>;
}): ToroResolvedMenu | null {
  const submenuId = submenuIdForParent(profileId, parentKey);
  if (!submenuId) return null;

  const sourceItems = manifest.submenus?.[submenuId] ?? [];
  const items: ToroResolvedMenuItem[] = [];

  for (const item of sourceItems) {
    const state = capabilityStates[item.capability] ?? "HIDDEN";
    if (!SAFE_VISIBLE_STATES.has(state)) continue;

    items.push({
      index: items.length + 1,
      ...item,
      state,
    });
  }

  if (!items.length) return null;

  return {
    profileId: `submenu:${submenuId}`,
    selectionReason: `parent:${profileId}:${parentKey}`,
    items,
    hiddenCapabilityCount: sourceItems.length - items.length,
  };
}

export function resolveAvailableToroSubmenus({
  menu,
  capabilityStates,
}: {
  menu: ToroResolvedMenu | null;
  capabilityStates: Record<string, ToroMenuAvailabilityState>;
}): Record<string, ToroResolvedMenu> {
  if (!menu) return {};

  const result: Record<string, ToroResolvedMenu> = {};
  for (const item of menu.items) {
    const submenu = resolveToroSubmenu({
      profileId: menu.profileId,
      parentKey: item.key,
      capabilityStates,
    });
    if (submenu) result[item.key] = submenu;
  }
  return result;
}
