import "server-only";

import toolboxManifest from "../../../data/toro_role_toolbox_v1.json";

import { resolveToroContext } from "@/features/context/resolver";
import type { ToroResolvedContext } from "@/features/context/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { prioritizeToroMenuByAvailability, resolveToroMenu } from "./resolver";
import { resolveAvailableToroSubmenus } from "./submenu-resolver";
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
  countColumn = "id",
): Promise<ToroSourceProbe> {
  const { count, error } = await supabase
    .schema(schema)
    .from(table)
    .select(countColumn, { count: "exact", head: true })
    .eq("org_id", orgId);

  return {
    readable: !error,
    rows: error ? 0 : count ?? 0,
  };
}

async function probeFilteredCount(
  supabase: SupabaseServerClient,
  schema: string,
  table: string,
  orgId: string,
  filters: Array<{ column: string; value: string | boolean }>,
): Promise<ToroSourceProbe> {
  let query = supabase
    .schema(schema)
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId);

  for (const filter of filters) {
    query = query.eq(filter.column, filter.value);
  }

  const { count, error } = await query;
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
  countColumn = "id",
): Promise<ToroSourceProbe> {
  const base = await probeCount(supabase, schema, table, orgId, countColumn);
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
    inspectionFieldCapture,
    reservations,
    currentReservationsSafe,
    krossCurrentHealth,
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
    probeLatest(
      supabase,
      "facilities",
      "inspection_field_capture_v",
      orgId,
      "updated_at",
      24,
      "check_id",
    ),
    probeLatest(supabase, "operations", "reservations", orgId, "snapshot_as_of", 6),
    probeCount(supabase, "operations", "current_reservations_safe", orgId),
    probeFilteredCount(supabase, "integrations", "kross_snapshot_health", orgId, [
      { column: "live_required", value: true },
      { column: "safe_for_current_state", value: true },
    ]),
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
    inspectionFieldCapture,
    reservations,
    currentReservationsSafe,
    krossCurrentHealth,
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
  "executive.brief",
  "projects.status",
  "executive.decisions",
  "catalog.rooms_villas",
  "catalog.experiences",
  "maintenance.priorities",
]);

function cleanText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function cleanNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function briefDetail(value: unknown, maxLength = 220) {
  const text = cleanText(value);
  if (!text) return undefined;

  const firstLine = text.split(/\n+/)[0]?.trim() ?? text;
  const firstSentenceMatch = firstLine.match(/^(.+?[.!?])(?:\s|$)/);
  const candidate = (firstSentenceMatch?.[1] ?? firstLine).trim();

  return candidate.length <= maxLength
    ? candidate
    : `${candidate.slice(0, maxLength - 1).trimEnd()}…`;
}

async function loadCapabilityFocus(
  context: ToroResolvedContext,
  capability: string,
  label: string,
  supabase: SupabaseServerClient,
): Promise<ToroCapabilityFocus | null> {
  if (!context.orgId || !FOCUSABLE_CAPABILITIES.has(capability)) return null;
  const orgId = context.orgId;

  if (capability === "executive.brief") {
    const [
      decisionsResult,
      projectsResult,
      tasksResult,
      blockedCriticalResult,
      inProgressCriticalResult,
    ] = await Promise.all([
      supabase
        .schema("operations")
        .from("executive_decisions")
        .select("decision_title, status, priority, next_action, updated_at")
        .eq("org_id", orgId)
        .eq("status", "En ejecución")
        .order("updated_at", { ascending: false })
        .limit(3),
      supabase
        .schema("operations")
        .from("projects")
        .select("project_name, status, priority, next_action, completion_pct, updated_at")
        .eq("org_id", orgId)
        .eq("active", true)
        .in("status", ["NOW", "BLOCKED"])
        .order("updated_at", { ascending: false })
        .limit(4),
      supabase
        .schema("operations")
        .from("tasks")
        .select("task_name, status, priority, blocking_reason, area, updated_at")
        .eq("org_id", orgId)
        .eq("active", true)
        .in("status", ["in_progress", "blocked"])
        .in("priority", ["critical", "P0", "p0"])
        .order("updated_at", { ascending: false })
        .limit(4),
      supabase
        .schema("operations")
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .eq("org_id", orgId)
        .eq("active", true)
        .eq("status", "blocked")
        .in("priority", ["critical", "P0", "p0"]),
      supabase
        .schema("operations")
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .eq("org_id", orgId)
        .eq("active", true)
        .eq("status", "in_progress")
        .in("priority", ["critical", "P0", "p0"]),
    ]);

    if (
      decisionsResult.error ||
      projectsResult.error ||
      tasksResult.error ||
      blockedCriticalResult.error ||
      inProgressCriticalResult.error
    ) {
      return null;
    }

    const items: ToroCapabilityFocusItem[] = [];

    const blockedCritical = blockedCriticalResult.count ?? 0;
    const inProgressCritical = inProgressCriticalResult.count ?? 0;

    items.push({
      title: "Pulso ejecutivo",
      meta: [
        `${inProgressCritical} críticas en curso`,
        `${blockedCritical} críticas bloqueadas`,
      ].join(" · "),
      detail:
        blockedCritical > 0
          ? "TORO muestra solo una muestra reciente; el resto permanece en la fuente para evitar ruido."
          : "No hay tareas críticas bloqueadas visibles en este contexto.",
    });

    for (const raw of decisionsResult.data ?? []) {
      const row = raw as unknown as Record<string, unknown>;
      items.push({
        title: cleanText(row.decision_title) ?? "Decisión en ejecución",
        meta: ["Decisión", cleanText(row.priority), cleanText(row.status)]
          .filter(Boolean)
          .join(" · "),
        detail: briefDetail(row.next_action),
      });
    }

    for (const raw of projectsResult.data ?? []) {
      const row = raw as unknown as Record<string, unknown>;
      const completion = cleanNumber(row.completion_pct);
      items.push({
        title: cleanText(row.project_name) ?? "Proyecto",
        meta: [
          cleanText(row.status),
          cleanText(row.priority),
          completion === null ? null : `${completion}%`,
        ]
          .filter(Boolean)
          .join(" · "),
        detail: briefDetail(row.next_action),
      });
    }

    for (const raw of tasksResult.data ?? []) {
      const row = raw as unknown as Record<string, unknown>;
      items.push({
        title: cleanText(row.task_name) ?? "Tarea crítica",
        meta: [
          cleanText(row.status),
          cleanText(row.priority),
          cleanText(row.area),
        ]
          .filter(Boolean)
          .join(" · "),
        detail: briefDetail(row.blocking_reason),
      });
    }

    return {
      capability,
      label,
      items: items.slice(0, 10),
    };
  }

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
          detail: briefDetail(row.next_action),
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
          detail: briefDetail(row.next_action),
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

  if (capability === "maintenance.priorities") {
    const { data: roundData, error: roundError } = await supabase
      .schema("facilities")
      .from("inspection_rounds")
      .select("round_key, zone_label, status, created_at")
      .eq("org_id", orgId)
      .like("round_key", "MNT-DAILY-P0-P1-%")
      .order("created_at", { ascending: false })
      .limit(1);

    if (roundError || !Array.isArray(roundData) || !roundData.length) {
      return null;
    }

    const round = roundData[0] as unknown as Record<string, unknown>;
    const roundKey = cleanText(round.round_key);
    if (!roundKey) return null;

    const { data, error } = await supabase
      .schema("facilities")
      .from("inspection_field_capture_v")
      .select("check_order, area_label, check_text, result_status, requires_supervisor_review, closure_ready")
      .eq("org_id", orgId)
      .eq("round_key", roundKey)
      .order("check_order", { ascending: true })
      .limit(12);

    if (error || !Array.isArray(data)) return null;

    const pending = data.filter((raw) => {
      const row = raw as unknown as Record<string, unknown>;
      return cleanText(row.result_status) === "pending";
    });

    const displayRows = pending.length ? pending : data;

    return {
      capability,
      label,
      items: displayRows.map((raw) => {
        const row = raw as unknown as Record<string, unknown>;
        const area = cleanText(row.area_label);
        const status = cleanText(row.result_status) ?? "pending";
        const supervisor = row.requires_supervisor_review === true;
        return {
          title: cleanText(row.check_text) ?? "Check de mantenimiento",
          meta: [
            area,
            status === "pending" ? "Pendiente" : status,
            supervisor ? "Revisión supervisor" : null,
          ]
            .filter(Boolean)
            .join(" · "),
          detail:
            row.closure_ready === true
              ? "Listo para cierre según evidencia registrada."
              : undefined,
        };
      }),
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


function capabilityNote(
  capability: string,
  state: ToroMenuAvailabilityState | "UI",
): string {
  const readNotes: Record<string, string> = {
    "executive.brief": "Resumen interno actualizado disponible.",
    "executive.decisions": "Decisiones internas recientes disponibles.",
    "projects.status": "Proyectos internos actualizados disponibles.",
    "operations.exceptions": "Excepciones operativas recientes disponibles.",
    "catalog.rooms_villas": "Catálogo interno de habitaciones y villas disponible.",
    "catalog.experiences": "Catálogo de experiencias disponible.",
    "maintenance.priorities": "Ronda diaria y checks de mantenimiento disponibles.",
    "maintenance.my_tasks": "Tareas recientes de mantenimiento disponibles.",
    "operations.hotel_today": "Lectura operativa actual disponible.",
  };

  const blockedNotes: Record<string, string> = {
    "finance.exceptions": "Falta evidencia bancaria suficientemente actual.",
    "guest.arrivals_departures": "Falta verdad live de reservas/estancias del PMS.",
    "comms.guest_messages": "La bandeja omnicanal live todavía no está verificada.",
    "hospitality.quote": "Cotizar exige precio y disponibilidad live del PMS.",
    "finance.payment_status": "Falta estado financiero actual y autorizado.",
    "finance.collections": "Falta estado de cobro actual y autorizado.",
  };

  if (state === "READ_ONLY" || state === "READY") {
    return readNotes[capability] ?? "Lectura disponible con fuente autorizada.";
  }

  if (state === "BLOCKED") {
    return blockedNotes[capability] ?? "Todavía falta una fuente o permiso verificable.";
  }

  if (state === "CONNECT") return "Falta conectar la herramienta necesaria.";
  if (state === "REQUEST_ACCESS") return "Falta permiso para usar esta función.";
  if (state === "DEGRADED") return "La fuente existe, pero su estado requiere revisión.";
  if (state === "UI") return "Navegación disponible.";

  return "Todavía no disponible en este contexto.";
}

export type ToroCapabilitySafeAlternative = {
  label: string;
  href: string;
  note: string;
  external: true;
};

const OFFICIAL_KROSS_BOOKING_URL = "https://dreamcatcherhotel.kross.travel/";

function buildSafeAlternatives(
  menu: ToroResolvedMenu | null,
): Record<string, ToroCapabilitySafeAlternative> {
  const alternatives: Record<string, ToroCapabilitySafeAlternative> = {};

  const quote = menu?.items.find(
    (item) =>
      item.capability === "hospitality.quote" &&
      item.state === "BLOCKED",
  );

  if (quote) {
    alternatives["hospitality.quote"] = {
      label: "Abrir Kross oficial",
      href: OFFICIAL_KROSS_BOOKING_URL,
      note:
        "Kross confirma las tarifas y disponibilidad vigentes. TORO no importa ni interpreta ese resultado automáticamente.",
      external: true,
    };
  }

  return alternatives;
}

export type ToroRealMenuView = {
  context: ToroResolvedContext;
  preferredDisplayName: string;
  menu: ToroResolvedMenu | null;
  sourceReadiness: ToroSourceReadiness | null;
  profileSummary: ToroProfileSummaryItem[];
  capabilityNotes: Record<string, string>;
  capabilityAlternatives: Record<string, ToroCapabilitySafeAlternative>;
  focusableCapabilities: string[];
  availableSubmenus: Record<string, ToroResolvedMenu>;
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
      capabilityNotes: {},
      capabilityAlternatives: {},
      focusableCapabilities: [],
      availableSubmenus: {},
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

  const availableSubmenus = resolveAvailableToroSubmenus({
    menu,
    capabilityStates,
  });

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

  const capabilityNotes = Object.fromEntries(
    (menu?.items ?? []).map((item) => [
      item.capability,
      capabilityNote(item.capability, item.state),
    ]),
  );
  const capabilityAlternatives = buildSafeAlternatives(menu);

  return {
    context,
    preferredDisplayName:
      membership.employeePreferredName ?? context.displayName,
    menu,
    sourceReadiness,
    profileSummary,
    capabilityNotes,
    capabilityAlternatives,
    focusableCapabilities,
    availableSubmenus,
    focus,
    state: menu ? "resolved" : "no_menu",
  };
}
