import type {
  ToroCanonicalRole,
  ToroContextMode,
  ToroDataScope,
  ToroMembershipStatus,
} from "./types";

export type ToroContextPolicyInput = {
  mode: ToroContextMode;
  membershipStatus?: ToroMembershipStatus | null;
  roles?: ToroCanonicalRole[] | null;
};

export type ToroContextPolicyDecision = {
  allowedDataScopes: ToroDataScope[];
  canUsePersonalVault: boolean;
  canUseOrganizationData: boolean;
  reason:
    | "personal_context"
    | "active_membership"
    | "organization_membership_required";
};

/**
 * Pure policy layer for TORO context isolation.
 *
 * This intentionally does not inspect connector state, database rows or channel
 * metadata. Server adapters resolve identity/membership first and then call this
 * function.
 *
 * Critical invariant:
 * organization mode never includes "personal" scope automatically.
 */
export function deriveToroContextPolicy(
  input: ToroContextPolicyInput,
): ToroContextPolicyDecision {
  if (input.mode === "personal") {
    return {
      allowedDataScopes: ["personal", "shared", "system"],
      canUsePersonalVault: true,
      canUseOrganizationData: false,
      reason: "personal_context",
    };
  }

  if (input.membershipStatus !== "active") {
    return {
      allowedDataScopes: ["system"],
      canUsePersonalVault: false,
      canUseOrganizationData: false,
      reason: "organization_membership_required",
    };
  }

  return {
    allowedDataScopes: ["work_private", "work_org", "shared", "system"],
    canUsePersonalVault: false,
    canUseOrganizationData: true,
    reason: "active_membership",
  };
}

/**
 * Organization roles affect authorization within work_org but never grant
 * personal User Vault access. ADMIN and RRHH are intentionally not special here.
 */
export function roleCanUnlockPersonalScope(
  _roles: ToroCanonicalRole[] | null | undefined,
): false {
  return false;
}
