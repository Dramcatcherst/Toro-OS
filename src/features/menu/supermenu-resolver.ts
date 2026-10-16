import menuData from "../../../data/toro_conversational_submenus_v2.json";
import toolboxData from "../../../data/toro_role_toolbox_v1.json";

import type { ToroContextMode } from "../context/types";
import type { ToroMenuAvailabilityState } from "./types";

type SuperMenuNavigation = {
  code: string;
  label: string;
  intent: string;
};

type SuperMenuItem = {
  code: string;
  short_code: string;
  label: string;
  capability: string;
  modes: ToroContextMode[];
  approval?: string;
};

type SuperMenuCategory = {
  code: string;
  short_code: string;
  label: string;
  modes: ToroContextMode[];
  items: SuperMenuItem[];
};

type SuperMenuManifest = {
  version: string;
  navigation: SuperMenuNavigation[];
  categories: SuperMenuCategory[];
  capability_contract: {
    target_capabilities: string[];
  };
};

type MenuData = {
  supermenu: SuperMenuManifest;
};

const manifest = (menuData as MenuData).supermenu;
const registeredCapabilities = new Set(
  Object.values(
    (toolboxData as { profiles: Record<string, { capabilities: string[] }> })
      .profiles,
  ).flatMap((profile) => profile.capabilities),
);
const targetBlockedCapabilities = new Set(
  manifest.capability_contract.target_capabilities,
);

const MAX_MENU_RECEIPT_AGE_MS = 30 * 60 * 1_000;

export const TORO_SUPERMENU_VERSION = manifest.version;

export type ToroSuperMenuReceipt = {
  id: string;
  menuVersion: string;
  subjectId: string;
  contextFingerprint: string;
  issuedAt: string;
  expiresAt: string;
};

export type ToroSuperMenuCategorySummary = {
  canonicalCode: string;
  shortCode: string;
  label: string;
  itemCount: number;
};

export type ToroSuperMenuResolution =
  | { kind: "navigation"; code: string; intent: string; label: string }
  | {
      kind: "category";
      canonicalCode: string;
      shortCode: string;
      label: string;
    }
  | {
      kind: "action";
      canonicalCode: string;
      shortCode: string;
      label: string;
      capability: string;
      state: ToroMenuAvailabilityState | "UI";
      approval?: string;
    }
  | {
      kind: "ambiguous";
      canonicalCode: string;
      reason:
        | "menu_receipt_required"
        | "menu_receipt_mismatch"
        | "menu_receipt_expired";
    }
  | {
      kind: "unavailable";
      canonicalCode: string;
      reason: "scope_mismatch" | "capability_unavailable";
    }
  | { kind: "unknown" };

function compactCode(rawInput: string) {
  return rawInput
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/^M:/, "M")
    .replace(/[-.]/g, "");
}

function modeAllowed(modes: ToroContextMode[], mode: ToroContextMode) {
  return modes.includes(mode);
}

function getItemState(
  item: SuperMenuItem,
  capabilityStates: Record<string, ToroMenuAvailabilityState>,
) {
  if (item.capability.startsWith("ui.")) return "UI";
  if (
    targetBlockedCapabilities.has(item.capability) ||
    !registeredCapabilities.has(item.capability)
  ) {
    return undefined;
  }
  return capabilityStates[item.capability];
}

function itemIsVisible(
  item: SuperMenuItem,
  capabilityStates: Record<string, ToroMenuAvailabilityState>,
) {
  const state = getItemState(item, capabilityStates);
  return (
    state === "UI" ||
    state === "READY" ||
    state === "READ_ONLY" ||
    state === "DEGRADED"
  );
}

function validateShortCodeReceipt({
  receipt,
  subjectId,
  contextFingerprint,
  nowIso,
}: {
  receipt?: ToroSuperMenuReceipt | null;
  subjectId?: string | null;
  contextFingerprint?: string | null;
  nowIso?: string;
}): "valid" | "required" | "mismatch" | "expired" {
  if (!receipt || !subjectId || !contextFingerprint) return "required";
  if (
    receipt.menuVersion !== manifest.version ||
    receipt.subjectId !== subjectId ||
    receipt.contextFingerprint !== contextFingerprint
  ) {
    return "mismatch";
  }

  const issuedAt = Date.parse(receipt.issuedAt);
  const expiresAt = Date.parse(receipt.expiresAt);
  const now = Date.parse(nowIso ?? new Date().toISOString());
  if (
    !Number.isFinite(issuedAt) ||
    !Number.isFinite(expiresAt) ||
    !Number.isFinite(now) ||
    issuedAt > now ||
    expiresAt <= issuedAt ||
    expiresAt - issuedAt > MAX_MENU_RECEIPT_AGE_MS
  ) {
    return "mismatch";
  }
  if (expiresAt <= now) return "expired";
  return "valid";
}

function findCategory(canonicalCode: string) {
  return (
    manifest.categories.find((category) => category.code === canonicalCode) ??
    null
  );
}

function findItem(canonicalCode: string) {
  for (const category of manifest.categories) {
    const item = category.items.find(
      (candidate) => candidate.code === canonicalCode,
    );
    if (item) return { category, item };
  }
  return null;
}

export function listToroSuperMenuCategories({
  mode,
  capabilityStates,
}: {
  mode: ToroContextMode;
  capabilityStates: Record<string, ToroMenuAvailabilityState>;
}): ToroSuperMenuCategorySummary[] {
  return manifest.categories
    .filter((category) => modeAllowed(category.modes, mode))
    .map((category) => {
      const itemCount = category.items.filter(
        (item) =>
          modeAllowed(item.modes, mode) &&
          itemIsVisible(item, capabilityStates),
      ).length;
      return {
        canonicalCode: category.code,
        shortCode: category.short_code,
        label: category.label,
        itemCount,
      };
    })
    .filter((category) => category.itemCount > 0);
}

export function resolveToroSuperMenuIntent({
  rawInput,
  mode,
  capabilityStates,
  activeMenuReceipt,
  currentSubjectId,
  currentContextFingerprint,
  nowIso,
}: {
  rawInput: string;
  mode: ToroContextMode;
  capabilityStates: Record<string, ToroMenuAvailabilityState>;
  activeMenuReceipt?: ToroSuperMenuReceipt | null;
  currentSubjectId?: string | null;
  currentContextFingerprint?: string | null;
  nowIso?: string;
}): ToroSuperMenuResolution {
  const rawCode = compactCode(rawInput);

  const navigation = manifest.navigation.find(
    (candidate) => candidate.code === rawCode,
  );
  if (navigation) {
    return {
      kind: "navigation",
      code: navigation.code,
      intent: navigation.intent,
      label: navigation.label,
    };
  }

  const isCanonicalCategory = /^M[A-J]$/.test(rawCode);
  const isShortCategory = /^[A-J]$/.test(rawCode);
  const isCanonicalItem = /^M[A-J][0-9]$/.test(rawCode);
  const isShortItem = /^[A-J][0-9]$/.test(rawCode);

  if (
    !isCanonicalCategory &&
    !isShortCategory &&
    !isCanonicalItem &&
    !isShortItem
  ) {
    return { kind: "unknown" };
  }

  const usedShortCode = isShortCategory || isShortItem;
  const canonicalCode = usedShortCode ? `M${rawCode}` : rawCode;

  // A0-A6 are already canonical TORO autonomy levels. More broadly, every
  // short menu code needs a live menu receipt so a stale chat cannot turn a
  // convenient alias into an unintended instruction. Canonical M-prefixed
  // codes are unambiguous but still recheck scope and capability below.
  if (usedShortCode) {
    const receiptState = validateShortCodeReceipt({
      receipt: activeMenuReceipt,
      subjectId: currentSubjectId,
      contextFingerprint: currentContextFingerprint,
      nowIso,
    });
    if (receiptState !== "valid") {
      return {
        kind: "ambiguous",
        canonicalCode,
        reason:
          receiptState === "required"
            ? "menu_receipt_required"
            : receiptState === "expired"
              ? "menu_receipt_expired"
              : "menu_receipt_mismatch",
      };
    }
  }

  if (isCanonicalCategory || isShortCategory) {
    const category = findCategory(canonicalCode);
    if (!category) return { kind: "unknown" };
    if (!modeAllowed(category.modes, mode)) {
      return { kind: "unavailable", canonicalCode, reason: "scope_mismatch" };
    }
    if (
      !category.items.some(
        (item) =>
          modeAllowed(item.modes, mode) &&
          itemIsVisible(item, capabilityStates),
      )
    ) {
      return {
        kind: "unavailable",
        canonicalCode,
        reason: "capability_unavailable",
      };
    }
    return {
      kind: "category",
      canonicalCode: category.code,
      shortCode: category.short_code,
      label: category.label,
    };
  }

  const found = findItem(canonicalCode);
  if (!found) return { kind: "unknown" };
  if (
    !modeAllowed(found.category.modes, mode) ||
    !modeAllowed(found.item.modes, mode)
  ) {
    return { kind: "unavailable", canonicalCode, reason: "scope_mismatch" };
  }

  const state = getItemState(found.item, capabilityStates);

  if (
    !state ||
    state === "HIDDEN" ||
    state === "BLOCKED" ||
    state === "CONNECT" ||
    state === "REQUEST_ACCESS"
  ) {
    return {
      kind: "unavailable",
      canonicalCode,
      reason: "capability_unavailable",
    };
  }

  return {
    kind: "action",
    canonicalCode: found.item.code,
    shortCode: found.item.short_code,
    label: found.item.label,
    capability: found.item.capability,
    state,
    ...(found.item.approval ? { approval: found.item.approval } : {}),
  };
}
