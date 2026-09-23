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

export function roleCanUnlockPersonalScope(
  roles: ToroCanonicalRole[] | null | undefined,
): false {
  void roles;
  return false;
}
