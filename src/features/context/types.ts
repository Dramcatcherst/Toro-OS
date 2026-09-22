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
  status: ToroMembershipStatus | null;
  roles: ToroCanonicalRole[];
  employeeId: string | null;
};

export type ToroContextRequest = {
  mode?: ToroContextMode;
  orgId?: string | null;
};

export type ToroResolvedContext = {
  userId: string;
  mode: ToroContextMode;
  orgId: string | null;
  membership: ToroResolvedMembership | null;
  allowedDataScopes: ToroDataScope[];
  allowedTools: ToroToolPermission[];
  canUsePersonalVault: boolean;
  canUseOrganizationData: boolean;
  requiresContextChoice: boolean;
};

/**
 * Canonical contract for every TORO human-facing surface.
 *
 * Implementations must:
 * - derive actor identity from the authenticated session;
 * - never infer organization membership from an email domain, display name, or employee name;
 * - require an active organization membership before granting organization context;
 * - keep personal User Vault scope unavailable to organization administrators by default;
 * - fail closed when requested organization or scope cannot be resolved;
 * - resolve tool ownership independently for personal and organization connections.
 *
 * WhatsApp/OpenClaw, Portal, email, automations and specialist agents should all
 * consume the same resolved context contract rather than defining channel-specific
 * identity or privacy rules.
 */
export type ResolveToroContext = (
  request?: ToroContextRequest,
) => Promise<ToroResolvedContext | null>;
