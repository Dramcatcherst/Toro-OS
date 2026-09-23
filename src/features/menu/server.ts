import "server-only";

import toolboxManifest from "../../../data/toro_role_toolbox_v1.json";

import { resolveToroContext } from "@/features/context/resolver";
import type { ToroResolvedContext } from "@/features/context/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { resolveToroMenu } from "./resolver";
import {
  evaluateSourceAwareCapabilityStates,
  type ToroMenuSourceSnapshot,
  type ToroSourceProbe,
  type ToroSourceReadiness,
} from "./source-aware";
import type {
  ToroMenuAvailabilityState,
  ToroResolvedMenu,
} from "./types";

type ToolboxManifest = {
  profiles?: Record<string, { capabilities?: string[] }>;
};

const manifest = toolboxManifest as ToolboxManifest;

function buildConservativeCapabilityStates(profileId?: string | null) {
  const states: Record<string, ToroMenuAvailabilityState> = {};
  const profiles = profileId
    ? [manifest.profiles?.[profileId]].filter(Boolean)
    : Object.values(manifest.profiles ?? {});

  // Visibility is discoverability, not evidence that an underlying read or
  // write path is operational. Everything starts BLOCKED and is promoted only
  // by source-aware proof.
  for (const profile of profiles) {
    for (const capability of profile?.capabilities ?? []) {
      states[capability] = "BLOCKED";
    }
  }

  return states;
}

type SupabaseServerClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;

async function probeCount(
  supabase: SupabaseServerClient,
  schema: string,
  table: string,
  orgId: string,
): Promise<ToroSourceProbe> {
  const { count, error } = await supabase
    .schema(schema)
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId);

  return {
    readable: !error,
    rows: error ? 0 : count ?? 0,
  };
}

async function probeLatest(
  supabase: SupabaseServerClient,
  schema: string,
  table: string,
  orgId: string,
  latestColumn: string,
  freshnessHours?: number,
): Promise<ToroSourceProbe> {
  const base = await probeCount(supabase, schema, table, orgId);
  if (!base.readable || base.rows === 0) return base;

  const { data, error } = await supabase
    .schema(schema)
    .from(table)
    .select(latestColumn)
    .eq("org_id", orgId)
    .order(latestColumn, { ascending: false })
    .limit(1);

  if (error || !Array.isArray(data)) {
    return { readable: false, rows: 0 };
  }

  const row = data[0] as unknown as Record<string, unknown> | undefined;
  const raw = row?.[latestColumn];
  const latestAt = typeof raw === "string" ? raw : null;
  const latestMs = latestAt ? Date.parse(latestAt) : Number.NaN;
  const fresh =
    freshnessHours === undefined
      ? undefined
      : Number.isFinite(latestMs) &&
        Date.now() - latestMs <= freshnessHours * 60 * 60 * 1000;

  return {
    ...base,
    latestAt,
    fresh,
  };
}

async function loadMenuSourceSnapshot(
  context: ToroResolvedContext,
): Promise<ToroMenuSourceSnapshot> {
  if (!context.orgId) {
    throw new Error("Organization context required for source-aware menu");
  }

  const supabase = await createServerSupabaseClient();
  const orgId = context.orgId;

  const [
    executiveDecisions,
    projects,
    tasks,
    maintenanceEvents,
    reservations,
    stays,
    rooms,
    villas,
    experiences,
    bankTransactions,
  ] = await Promise.all([
    probeLatest(supabase, "operations", "executive_decisions", orgId, "updated_at", 24),
    probeLatest(supabase, "operations", "projects", orgId, "updated_at", 24),
    probeLatest(supabase, "operations", "tasks", orgId, "updated_at", 24),
    probeLatest(supabase, "facilities", "maintenance_events", orgId, "updated_at", 168),
    probeLatest(supabase, "operations", "reservations", orgId, "snapshot_as_of", 6),
    probeCount(supabase, "operations", "stays", orgId),
    probeCount(supabase, "core", "rooms", orgId),
    probeCount(supabase, "core", "villas", orgId),
    probeCount(supabase, "catalog", "experiences", orgId),
    probeLatest(supabase, "finance", "bank_transactions", orgId, "transaction_date", 24 * 14),
  ]);

  return {
    executiveDecisions,
    projects,
    tasks,
    maintenanceEvents,
    reservations,
    stays,
    rooms,
    villas,
    experiences,
    bankTransactions,
  };
}


export type ToroRealMenuView = {
  context: ToroResolvedContext;
  preferredDisplayName: string;
  menu: ToroResolvedMenu | null;
  sourceReadiness: ToroSourceReadiness | null;
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
      sourceReadiness: null,
      state: "context_choice_required",
    };
  }

  const membership = context.membership;

  const discoveryMenu = resolveToroMenu({
    mode: "organization",
    roles: membership.roles,
    positionCode: membership.positionCode,
    positionName: membership.positionName,
    capabilityStates: buildConservativeCapabilityStates(),
    hasSecondaryOptions: false,
  });

  const baseline = buildConservativeCapabilityStates(discoveryMenu?.profileId);

  let capabilityStates = baseline;
  let sourceReadiness: ToroSourceReadiness = {
    readyReads: [],
    blockedReads: ["Fuentes de esta vista"],
  };

  try {
    const snapshot = await loadMenuSourceSnapshot(context);
    const evaluated = evaluateSourceAwareCapabilityStates(baseline, snapshot);
    capabilityStates = evaluated.states;
    sourceReadiness = evaluated.readiness;
  } catch {
    // Fail closed: identity can still resolve, but no capability becomes
    // readable when source probing itself is unavailable.
  }

  const menu = resolveToroMenu({
    mode: "organization",
    roles: membership.roles,
    positionCode: membership.positionCode,
    positionName: membership.positionName,
    capabilityStates,
    hasSecondaryOptions: false,
  });

  return {
    context,
    preferredDisplayName:
      membership.employeePreferredName ?? context.displayName,
    menu,
    sourceReadiness,
    state: menu ? "resolved" : "no_menu",
  };
}
