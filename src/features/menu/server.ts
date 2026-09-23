import "server-only";

import toolboxManifest from "../../../data/toro_role_toolbox_v1.json";

import { resolveToroContext } from "@/features/context/resolver";
import type { ToroResolvedContext } from "@/features/context/types";

import { resolveToroMenu } from "./resolver";
import type {
  ToroMenuAvailabilityState,
  ToroResolvedMenu,
} from "./types";

type ToolboxManifest = {
  profiles?: Record<string, { capabilities?: string[] }>;
};

const manifest = toolboxManifest as ToolboxManifest;

function buildConservativeCapabilityStates() {
  const states: Record<string, ToroMenuAvailabilityState> = {};

  // This surface proves identity/role/position routing only. Visibility is
  // discoverability, not evidence that an underlying read or write path is
  // operational. Capabilities stay BLOCKED until a source-aware capability
  // resolver proves freshness, permission and runtime availability.
  for (const profile of Object.values(manifest.profiles ?? {})) {
    for (const capability of profile.capabilities ?? []) {
      states[capability] = "BLOCKED";
    }
  }

  return states;
}

export type ToroRealMenuView = {
  context: ToroResolvedContext;
  preferredDisplayName: string;
  menu: ToroResolvedMenu | null;
  state: "resolved" | "context_choice_required" | "no_menu";
};

export async function resolveCurrentToroReadOnlyMenu(): Promise<ToroRealMenuView | null> {
  const context = await resolveToroContext({ mode: "organization" });

  if (!context) return null;

  if (context.requiresContextChoice || !context.orgId || !context.membership) {
    return {
      context,
      preferredDisplayName: context.displayName,
      menu: null,
      state: "context_choice_required",
    };
  }

  const membership = context.membership;
  const menu = resolveToroMenu({
    mode: "organization",
    roles: membership.roles,
    positionCode: membership.positionCode,
    positionName: membership.positionName,
    capabilityStates: buildConservativeCapabilityStates(),
    hasSecondaryOptions: false,
  });

  return {
    context,
    preferredDisplayName:
      membership.employeePreferredName ?? context.displayName,
    menu,
    state: menu ? "resolved" : "no_menu",
  };
}
