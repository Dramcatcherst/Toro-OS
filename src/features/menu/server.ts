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

const LIVE_OR_ACTION_GATED = new Set([
  "pms.live_availability_price",
  "hospitality.quote",
  "finance.payment_status",
  "finance.collections",
  "finance.reconcile",
  "finance.prepare_approval",
  "people.payroll_operations",
  "operations.approvals",
  "operations.assign",
  "maintenance.close_with_evidence",
  "housekeeping.complete",
]);

function buildConservativeCapabilityStates() {
  const states: Record<string, ToroMenuAvailabilityState> = {};

  for (const profile of Object.values(manifest.profiles ?? {})) {
    for (const capability of profile.capabilities ?? []) {
      states[capability] = LIVE_OR_ACTION_GATED.has(capability)
        ? "BLOCKED"
        : "READ_ONLY";
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
    hasSecondaryOptions: true,
  });

  return {
    context,
    preferredDisplayName:
      membership.employeePreferredName ?? context.displayName,
    menu,
    state: menu ? "resolved" : "no_menu",
  };
}
