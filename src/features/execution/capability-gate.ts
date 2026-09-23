import type { PolicyDecision } from "@/lib/policy-engine";

export const TORO_CAPABILITY_MODES = [
  "none",
  "read",
  "simulate",
  "write",
  "approve",
  "admin",
] as const;

export type ToroCapabilityMode = (typeof TORO_CAPABILITY_MODES)[number];

type ToroContextMode = "personal" | "organization";
type ToroCapabilityOwner = "personal" | "organization";

export type ToroCapabilityGateState =
  | "blocked"
  | "simulate"
  | "approval_required"
  | "ready";

export type ToroCapabilityGateDecision = {
  state: ToroCapabilityGateState;
  allowed: boolean;
  executable: boolean;
  effectiveMode: ToroCapabilityMode;
  reasonCode:
    | "ok"
    | "cross_scope"
    | "inactive_membership"
    | "policy_blocked"
    | "insufficient_capability"
    | "simulation_only"
    | "stale_authority"
    | "connector_unhealthy"
    | "approval_required";
};

const MODE_RANK: Record<ToroCapabilityMode, number> = {
  none: 0,
  read: 1,
  simulate: 2,
  write: 3,
  approve: 4,
  admin: 5,
};

function requiresExternalMutation(mode: ToroCapabilityMode) {
  return MODE_RANK[mode] >= MODE_RANK.write;
}

function decision(
  state: ToroCapabilityGateState,
  reasonCode: ToroCapabilityGateDecision["reasonCode"],
  effectiveMode: ToroCapabilityMode,
  options: { allowed?: boolean; executable?: boolean } = {},
): ToroCapabilityGateDecision {
  return {
    state,
    reasonCode,
    effectiveMode,
    allowed: options.allowed ?? state !== "blocked",
    executable: options.executable ?? state === "ready",
  };
}

export function evaluateToroCapabilityGate(input: {
  contextMode: ToroContextMode;
  capabilityOwner: ToroCapabilityOwner;
  membershipActive?: boolean;
  capabilityMode: ToroCapabilityMode;
  requestedMode: ToroCapabilityMode;
  sourceFresh: boolean;
  connectorHealthy: boolean;
  policy: PolicyDecision;
}): ToroCapabilityGateDecision {
  const {
    capabilityMode,
    requestedMode,
    contextMode,
    capabilityOwner,
    sourceFresh,
    connectorHealthy,
    policy,
  } = input;

  if (contextMode !== capabilityOwner) {
    return decision("blocked", "cross_scope", capabilityMode);
  }

  if (capabilityOwner === "organization" && input.membershipActive !== true) {
    return decision("blocked", "inactive_membership", capabilityMode);
  }

  if (!policy.allowed || policy.approval === "Blocked") {
    return decision("blocked", "policy_blocked", capabilityMode);
  }

  if (requestedMode === "none") {
    return decision("blocked", "insufficient_capability", capabilityMode);
  }

  if (MODE_RANK[capabilityMode] < MODE_RANK[requestedMode]) {
    if (
      capabilityMode === "simulate"
      && requiresExternalMutation(requestedMode)
    ) {
      return decision("simulate", "simulation_only", capabilityMode, {
        allowed: true,
        executable: false,
      });
    }

    return decision("blocked", "insufficient_capability", capabilityMode);
  }

  if (requiresExternalMutation(requestedMode) && !sourceFresh) {
    return decision("blocked", "stale_authority", capabilityMode);
  }

  if (requiresExternalMutation(requestedMode) && !connectorHealthy) {
    return decision("blocked", "connector_unhealthy", capabilityMode);
  }

  if (requestedMode === "simulate") {
    return decision("simulate", "simulation_only", capabilityMode, {
      allowed: true,
      executable: false,
    });
  }

  if (
    requiresExternalMutation(requestedMode)
    && policy.approval !== "None"
  ) {
    return decision("approval_required", "approval_required", capabilityMode, {
      allowed: true,
      executable: false,
    });
  }

  return decision("ready", "ok", capabilityMode, {
    allowed: true,
    executable: requiresExternalMutation(requestedMode),
  });
}
