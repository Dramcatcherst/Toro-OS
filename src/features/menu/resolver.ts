import menuManifest from "../../../data/toro_conversational_menu_profiles_v1.json";

import type { ToroCanonicalRole } from "../context/types";
import type {
  ToroMenuIntentResolution,
  ToroMenuResolutionInput,
  ToroResolvedMenu,
  ToroResolvedMenuItem,
} from "./types";

type ManifestItem = {
  key: string;
  emoji: string;
  label: string;
  aliases: string[];
  capability: string;
};

type ManifestProfile = {
  id: string;
  context_mode?: string;
  role_codes?: string[];
  position_keywords?: string[];
  external_audience?: string;
  lifecycle?: string[];
  fallback?: boolean;
  feature_flag?: string;
  primary?: ManifestItem[];
};

const profiles = (menuManifest.profiles ?? []) as ManifestProfile[];

const ROLE_PRECEDENCE: Array<[ToroCanonicalRole, string]> = [
  ["ADMIN", "owner_executive"],
  ["GERENCIA", "manager"],
  ["CONTABILIDAD", "finance"],
  ["RRHH", "hr_people"],
  ["AUDITOR", "auditor"],
  ["JEFE_DEPARTAMENTO", "department_lead"],
  ["EMPLEADO", "employee_general"],
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getProfile(id: string) {
  return profiles.find((profile) => profile.id === id) ?? null;
}

function selectProfile(input: ToroMenuResolutionInput): {
  profile: ManifestProfile | null;
  reason: string;
} {
  if (input.mode === "personal") {
    return { profile: getProfile("personal"), reason: "personal_context" };
  }

  if (input.externalAudience) {
    const lifecycle = input.guestLifecycle ?? "unknown";
    if (["booked", "pre_arrival", "in_stay"].includes(lifecycle)) {
      return { profile: getProfile("guest_reserved"), reason: `guest_lifecycle:${lifecycle}` };
    }
    return { profile: getProfile("guest_prospect"), reason: `guest_lifecycle:${lifecycle}` };
  }

  const positionCode = normalize(input.positionCode ?? "").replaceAll("-", "_");
  const profileByPositionCode: Record<string, string> = {
    general_manager: "owner_executive",
    admin_manager: "manager",
    reception_ops_lead: "manager",
    maintenance: "maintenance",
    housekeeping: "housekeeping",
    reception: "reception",
  };
  if (positionCode && profileByPositionCode[positionCode]) {
    const profileId = profileByPositionCode[positionCode];
    return { profile: getProfile(profileId), reason: `position_code:${positionCode}` };
  }

  const position = normalize(input.positionName ?? "");
  if (position) {
    if (position.includes("gerente general")) {
      return { profile: getProfile("owner_executive"), reason: "position:gerente_general" };
    }
    if (position.includes("gerente administrativa") || position.includes("lider operativa")) {
      return { profile: getProfile("manager"), reason: "position:manager" };
    }
    if (position.includes("mantenimiento")) {
      return { profile: getProfile("maintenance"), reason: "position:maintenance" };
    }
    if (position.includes("aseo")) {
      return { profile: getProfile("housekeeping"), reason: "position:housekeeping" };
    }
    if (position.includes("recepcion")) {
      return { profile: getProfile("reception"), reason: "position:reception" };
    }
  }

  const roleSet = new Set(input.roles ?? []);
  for (const [role, profileId] of ROLE_PRECEDENCE) {
    if (roleSet.has(role)) {
      return { profile: getProfile(profileId), reason: `role:${role}` };
    }
  }

  return { profile: null, reason: "no_authorized_profile" };
}

export function resolveToroMenu(
  input: ToroMenuResolutionInput,
): ToroResolvedMenu | null {
  const { profile, reason } = selectProfile(input);
  if (!profile) return null;

  const capabilityStates = input.capabilityStates ?? {};
  const visible: ToroResolvedMenuItem[] = [];
  let hiddenCapabilityCount = 0;

  for (const item of profile.primary ?? []) {
    if (item.capability.startsWith("ui.")) {
      if (item.capability === "ui.more" && !input.hasSecondaryOptions) continue;
      visible.push({
        index: visible.length + 1,
        ...item,
        state: "UI",
      });
      continue;
    }

    const state = capabilityStates[item.capability] ?? "HIDDEN";
    if (state === "HIDDEN") {
      hiddenCapabilityCount += 1;
      continue;
    }

    visible.push({
      index: visible.length + 1,
      ...item,
      state,
    });
  }

  return {
    profileId: profile.id,
    selectionReason: reason,
    items: visible,
    hiddenCapabilityCount,
  };
}

const HOME = new Set(["0", "menu", "menú", "inicio"]);
const BACK = new Set(["9", "atras", "atrás"]);
const MORE = new Set(["+", "mas", "más"]);
const HELP = new Set(["ayuda"]);

export function resolveToroMenuIntent(
  menu: ToroResolvedMenu,
  rawInput: string,
): ToroMenuIntentResolution {
  const trimmed = rawInput.trim();
  const value = normalize(trimmed);

  if (HOME.has(value)) return { kind: "home" };
  if (BACK.has(value)) return { kind: "back" };
  if (MORE.has(value)) return { kind: "more" };
  if (HELP.has(value)) return { kind: "help" };

  if (/^\d+$/.test(trimmed)) {
    const index = Number(trimmed);
    const item = menu.items.find((candidate) => candidate.index === index);
    return item ? { kind: "item", item, matchedBy: "number" } : { kind: "unknown" };
  }

  const matches = menu.items.filter((item) => {
    if (normalize(item.key) === value) return true;
    if (normalize(item.label) === value) return true;
    return item.aliases.some((alias) => normalize(alias) === value);
  });

  if (matches.length === 1) {
    return { kind: "item", item: matches[0], matchedBy: "exact" };
  }

  const words = (input: string) =>
    " " +
    normalize(input)
      .replace(/[^a-z0-9ñ]+/g, " ")
      .replace(/\s+/g, " ")
      .trim() +
    " ";

  const inputWords = words(trimmed);
  const phraseMatches = menu.items.filter((item) =>
    [item.key, item.label, ...item.aliases]
      .map((candidate) => words(candidate).trim())
      .filter((candidate) => candidate.length >= 4)
      .some((candidate) => inputWords.includes(" " + candidate + " ")),
  );

  return phraseMatches.length === 1
    ? { kind: "item", item: phraseMatches[0], matchedBy: "phrase" }
    : { kind: "unknown" };
}
