export type ToroContextMode = "personal" | "organization";

export type ToroDataScope =
  | "personal"
  | "work_private"
  | "work_org"
  | "shared"
  | "system";

export type ToroCanonicalRole =
  | "ADMIN"
  | "RRHH"
  | "GERENCIA"
  | "JEFE_DEPARTAMENTO"
  | "CONTABILIDAD"
  | "AUDITOR"
  | "EMPLEADO";

export type ToroMembershipType =
  | "employee"
  | "owner"
  | "contractor"
  | "advisor"
  | "provider"
  | "other";

export type ToroMembershipStatus =
  | "invited"
  | "active"
  | "suspended"
  | "offboarded";

export type ToroToolAction =
  | "read"
  | "search"
  | "draft"
  | "execute"
  | "approve";

export type ToroToolPermission = {
  provider: string;
  actions: ToroToolAction[];
  owner: "personal" | "organization";
  orgId: string | null;
};

export type ToroResolvedMembership = {
  orgId: string;
  membershipId: string | null;
  membershipType: ToroMembershipType | null;
  status: ToroMembershipStatus;
  roles: ToroCanonicalRole[];
  employeeId: string | null;
  source: "organization_memberships" | "legacy_user_roles";
};

export type ToroContextRequest = {
  mode?: ToroContextMode;
  orgId?: string | null;
};

export type ToroResolvedContext = {
  userId: string;
  email: string | null;
  displayName: string;
  mode: ToroContextMode;
  orgId: string | null;
  membership: ToroResolvedMembership | null;
  availableOrgIds: string[];
  allowedDataScopes: ToroDataScope[];
  allowedTools: ToroToolPermission[];
  canUsePersonalVault: boolean;
  canUseOrganizationData: boolean;
  requiresContextChoice: boolean;
};

/**
 * Canonical contract for every TORO Brain human-facing surface.
 *
 * WhatsApp/OpenClaw, Portal, email, automations and specialist agents must
 * consume the same resolved context contract instead of inventing their own
 * identity/privacy rules.
 */
export type ResolveToroContext = (
  request?: ToroContextRequest,
) => Promise<ToroResolvedContext | null>;
