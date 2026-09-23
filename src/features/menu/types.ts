import type { ToroCanonicalRole, ToroContextMode } from "../context/types";

export type ToroMenuAvailabilityState =
  | "READY"
  | "READ_ONLY"
  | "CONNECT"
  | "REQUEST_ACCESS"
  | "DEGRADED"
  | "HIDDEN"
  | "BLOCKED";

export type ToroGuestLifecycle =
  | "unknown"
  | "inquiry"
  | "consideration"
  | "booked"
  | "pre_arrival"
  | "in_stay"
  | "post_stay";

export type ToroMenuResolutionInput = {
  mode: ToroContextMode;
  roles?: ToroCanonicalRole[];
  positionName?: string | null;
  externalAudience?: "guest" | "guest_or_prospect" | null;
  guestLifecycle?: ToroGuestLifecycle | null;
  capabilityStates?: Record<string, ToroMenuAvailabilityState>;
  hasSecondaryOptions?: boolean;
};

export type ToroResolvedMenuItem = {
  index: number;
  key: string;
  emoji: string;
  label: string;
  aliases: string[];
  capability: string;
  state: ToroMenuAvailabilityState | "UI";
};

export type ToroResolvedMenu = {
  profileId: string;
  selectionReason: string;
  items: ToroResolvedMenuItem[];
  hiddenCapabilityCount: number;
};

export type ToroMenuIntentResolution =
  | { kind: "home" }
  | { kind: "back" }
  | { kind: "more" }
  | { kind: "help" }
  | { kind: "item"; item: ToroResolvedMenuItem; matchedBy?: "number" | "exact" | "phrase" }
  | { kind: "unknown" };
