import "server-only";

import toolboxManifest from "../../../data/toro_role_toolbox_v1.json";

import { resolveToroContext } from "@/features/context/resolver";
import type { ToroResolvedContext } from "@/features/context/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { prioritizeToroMenuByAvailability, resolveToroMenu } from "./resolver";
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
  supabase: SupabaseServerClient,
): Promise<ToroMenuSourceSnapshot> {
  if (!context.orgId) {
    throw new Error("Organization context required for source-aware menu");
  }

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



type ToroProfileSummaryItem = {
  label: string;
  value: string;
  detail?: string;
};

async function countFiltered(
  supabase: SupabaseServerClient,
  schema: string,
  table: string,
  orgId: string,
  filters: Array<{ column: string; value: string | boolean }>,
): Promise<number | null> {
  let query = supabase
    .schema(schema)
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId);

  for (const filter of filters) {
    query = query.eq(filter.column, filter.value);
  }

  const { count, error } = await query;
  return error ? null : count ?? 0;
}

async function loadProfileSummary(
  context: ToroResolvedContext,
  profileId: string | null | undefined,
  supabase: SupabaseServerClient,
): Promise<ToroProfileSummaryItem[]> {
  if (!context.orgId || !profileId) return [];
  const orgId = context.orgId;

  if (profileId === "owner_executive") {
    const [nowProjects, blockedProjects, executingDecisions] = await Promise.all([
      countFiltered(supabase, "operations", "projects", orgId, [
        { column: "active", value: true },
        { column: "status", value: "NOW" },
      ]),
      countFiltered(supabase, "operations", "projects", orgId, [
        { column: "active", value: true },
        { column: "status", value: "BLOCKED" },
      ]),
      countFiltered(supabase, "operations", "executive_decisions", orgId, [
        { column: "status", value: "En ejecución" },
      ]),
    ]);

    const items: ToroProfileSummaryItem[] = [];
    if (nowProjects !== null) {
      items.push({
        label: "Proyectos NOW",
        value: String(nowProjects),
        detail: "activos ahora",
      });
    }
    if (blockedProjects !== null) {
      items.push({
        label: "Proyectos bloqueados",
        value: String(blockedProjects),
        detail: "necesitan desbloqueo",
      });
    }
    if (executingDecisions !== null) {
      items.push({
        label: "Decisiones en ejecución",
        value: String(executingDecisions),
        detail: "seguimiento abierto",
      });
    }
    return items;
  }

  if (profileId === "reception") {
    const [rooms, villas, experiences] = await Promise.all([
      countFiltered(supabase, "core", "rooms", orgId, [
        { column: "active", value: true },
      ]),
      countFiltered(supabase, "core", "villas", orgId, [
        { column: "active", value: true },
      ]),
      countFiltered(supabase, "catalog", "experiences", orgId, [
        { column: "status", value: "active" },
      ]),
    ]);

    const items: ToroProfileSummaryItem[] = [];
    if (rooms !== null) {
      items.push({
        label: "Habitaciones",
        value: String(rooms),
        detail: "catálogo activo",
      });
    }
    if (villas !== null) {
      items.push({
        label: "Villas",
        value: String(villas),
        detail: "catálogo activo",
      });
    }
    if (experiences !== null) {
      items.push({
        label: "Experiencias",
        value: String(experiences),
        detail: "opciones activas",
      });
    }
    return items;
  }

  return [];
}


export type ToroCapabilityFocusItem = {
  title: string;
  meta?: string;
  detail?: string;
};

export type ToroCapabilityFocus = {
  capability: string;
  label: string;
  items: ToroCapabilityFocusItem[];
};

const FOCUSABLE_CAPABILITIES = new Set([
  "projects.status",
  "executive.decisions",
  "catalog.rooms_villas",
  "catalog.experiences",
]);

function cleanText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function cleanNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

async function loadCapabilityFocus(
  context: ToroResolvedContext,
  capability: string,
  label: string,
  supabase: SupabaseServerClient,
): Promise<ToroCapabilityFocus | null> {
  if (!context.orgId || !FOCUSABLE_CAPABILITIES.has(capability)) return null;
  const orgId = context.orgId;

  if (capability === "projects.status") {
    const { data, error } = await supabase
      .schema("operations")
      .from("projects")
      .select("project_name, status, priority, next_action, completion_pct")
      .eq("org_id", orgId)
      .eq("active", true)
      .order("updated_at", { ascending: false })
      .limit(8);

    if (error || !Array.isArray(data)) return null;

    return {
      capability,
      label,
      items: data.map((raw) => {
        const row = raw as unknown as Record<string, unknown>;
        const completion = cleanNumber(row.completion_pct);
        const status = cleanText(row.status);
        const priority = cleanText(row.priority);
        return {
          title: cleanText(row.project_name) ?? "Proyecto",
          meta: [status, priority, completion === null ? null : `${completion}%`]
            .filter(Boolean)
            .join(" · "),
          detail: cleanText(row.next_action) ?? undefined,
        };
      }),
    };
  }

  if (capability === "executive.decisions") {
    const { data, error } = await supabase
      .schema("operations")
      .from("executive_decisions")
      .select("decision_title, status, priority, next_action")
      .eq("org_id", orgId)
      .order("updated_at", { ascending: false })
      .limit(8);

    if (error || !Array.isArray(data)) return null;

    return {
      capability,
      label,
      items: data.map((raw) => {
        const row = raw as unknown as Record<string, unknown>;
        return {
          title: cleanText(row.decision_title) ?? "Decisión",
          meta: [cleanText(row.status), cleanText(row.priority)]
            .filter(Boolean)
            .join(" · "),
          detail: cleanText(row.next_action) ?? undefined,
        };
      }),
    };
  }

  if (capability === "catalog.rooms_villas") {
    const [roomsResult, villasResult] = await Promise.all([
      supabase
        .schema("core")
        .from("rooms")
        .select("room_number, name_es, name_en, max_capacity")
        .eq("org_id", orgId)
        .eq("active", true)
        .order("room_number", { ascending: true })
        .limit(8),
      supabase
        .schema("core")
        .from("villas")
        .select("name_es, name_en, room_count, max_capacity")
        .eq("org_id", orgId)
        .eq("active", true)
        .order("name_es", { ascending: true })
        .limit(4),
    ]);

    if (roomsResult.error || villasResult.error) return null;

    const roomItems = (roomsResult.data ?? []).map((raw) => {
      const row = raw as unknown as Record<string, unknown>;
      const number = cleanNumber(row.room_number);
      const capacity = cleanNumber(row.max_capacity);
      return {
        title:
          cleanText(row.name_es) ??
          cleanText(row.name_en) ??
          (number === null ? "Habitación" : `Habitación ${number}`),
        meta: [
          number === null ? null : `#${number}`,
          capacity === null ? null : `hasta ${capacity} personas`,
        ]
          .filter(Boolean)
          .join(" · "),
      };
    });

    const villaItems = (villasResult.data ?? []).map((raw) => {
      const row = raw as unknown as Record<string, unknown>;
      const rooms = cleanNumber(row.room_count);
      const capacity = cleanNumber(row.max_capacity);
      return {
        title: cleanText(row.name_es) ?? cleanText(row.name_en) ?? "Villa",
        meta: [
          rooms === null ? null : `${rooms} habitaciones`,
          capacity === null ? null : `hasta ${capacity} personas`,
        ]
          .filter(Boolean)
          .join(" · "),
      };
    });

    return {
      capability,
      label,
      items: [...roomItems, ...villaItems].slice(0, 10),
    };
  }

  if (capability === "catalog.experiences") {
    const { data, error } = await supabase
      .schema("catalog")
      .from("experiences")
      .select("name_es, name_en, category, public_price_label_es, verified_status")
      .eq("org_id", orgId)
      .eq("status", "active")
      .order("merchandising_priority", { ascending: false })
      .limit(8);

    if (error || !Array.isArray(data)) return null;

    return {
      capability,
      label,
      items: data.map((raw) => {
        const row = raw as unknown as Record<string, unknown>;
        return {
          title: cleanText(row.name_es) ?? cleanText(row.name_en) ?? "Experiencia",
          meta: [cleanText(row.category), cleanText(row.public_price_label_es)]
            .filter(Boolean)
            .join(" · "),
          detail: cleanText(row.verified_status)
            ? `Verificación: ${cleanText(row.verified_status)}`
            : undefined,
        };
      }),
    };
  }

  return null;
}

export type ToroRealMenuView = {
  context: ToroResolvedContext;
  preferredDisplayName: string;
  menu: ToroResolvedMenu | null;
  sourceReadiness: ToroSourceReadiness | null;
  profileSummary: ToroProfileSummaryItem[];
  focusableCapabilities: string[];
  focus: ToroCapabilityFocus | null;
  state: "resolved" | "context_choice_required" | "no_menu";
};

export async function resolveCurrentToroReadOnlyMenu(
  focusCapability?: string | null,
): Promise<ToroRealMenuView | null> {
  const context = await resolveToroContext({ mode: "organization" });

  if (!context) return null;

  if (context.requiresContextChoice || !context.orgId || !context.membership) {
    return {
      context,
      preferredDisplayName: context.displayName,
      menu: null,
      sourceReadiness: null,
      profileSummary: [],
      focusableCapabilities: [],
      focus: null,
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
  let profileSummary: ToroProfileSummaryItem[] = [];
  let sourceReadiness: ToroSourceReadiness = {
    readyReads: [],
    blockedReads: ["Fuentes de esta vista"],
  };

  let supabase: SupabaseServerClient | null = null;
  try {
    supabase = await createServerSupabaseClient();
    const [snapshot, summary] = await Promise.all([
      loadMenuSourceSnapshot(context, supabase),
      loadProfileSummary(context, discoveryMenu?.profileId, supabase),
    ]);
    const evaluated = evaluateSourceAwareCapabilityStates(baseline, snapshot);
    capabilityStates = evaluated.states;
    sourceReadiness = evaluated.readiness;
    profileSummary = summary;
  } catch {
    // Fail closed: identity can still resolve, but no capability becomes
    // readable when source probing itself is unavailable.
  }

  const resolvedMenu = resolveToroMenu({
    mode: "organization",
    roles: membership.roles,
    positionCode: membership.positionCode,
    positionName: membership.positionName,
    capabilityStates,
    hasSecondaryOptions: false,
  });
  const menu = resolvedMenu
    ? prioritizeToroMenuByAvailability(resolvedMenu)
    : null;

  const focusableCapabilities =
    menu?.items
      .filter(
        (item) =>
          item.state === "READ_ONLY" &&
          FOCUSABLE_CAPABILITIES.has(item.capability),
      )
      .map((item) => item.capability) ?? [];

  let focus: ToroCapabilityFocus | null = null;
  if (
    focusCapability &&
    supabase &&
    focusableCapabilities.includes(focusCapability)
  ) {
    const item = menu?.items.find(
      (candidate) => candidate.capability === focusCapability,
    );
    if (item) {
      focus = await loadCapabilityFocus(
        context,
        focusCapability,
        item.label,
        supabase,
      );
    }
  }

  return {
    context,
    preferredDisplayName:
      membership.employeePreferredName ?? context.displayName,
    menu,
    sourceReadiness,
    profileSummary,
    focusableCapabilities,
    focus,
    state: menu ? "resolved" : "no_menu",
  };
}
