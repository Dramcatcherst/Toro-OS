export const GOOGLE_WORKSPACE_READ_ONLY_SCOPES = Object.freeze([
  "https://www.googleapis.com/auth/admin.directory.user.readonly",
  "https://www.googleapis.com/auth/admin.directory.group.readonly",
  "https://www.googleapis.com/auth/admin.directory.domain.readonly",
  "https://www.googleapis.com/auth/admin.reports.audit.readonly",
] as const);

const DREAMCATCHER_WORKSPACE_DOMAIN = "dreamcatcherhotel.com";
const GROUP_MEMBER_CONCURRENCY = 4;
const AUDIT_WINDOW_DAYS = 7;

export type GoogleWorkspaceReadOnlyConfig = Readonly<{
  customerId: string;
  serviceAccountEmail: string;
  mode: "read_only";
  scopes: readonly string[];
}>;

export type WorkspaceUser = Readonly<{
  primaryEmail: string;
  isAdmin: boolean;
  isEnrolledIn2Sv: boolean;
}>;

export type WorkspaceGroup = Readonly<{
  email: string;
  [key: string]: unknown;
}>;

export type WorkspaceDomain = Readonly<{
  domainName: string;
  isPrimary: boolean;
  verified: boolean;
}>;

export type WorkspaceAuditEvent = Readonly<Record<string, unknown>>;

export type WorkspaceCollection<T> =
  | Readonly<{ status: "AVAILABLE"; items: readonly T[] }>
  | Readonly<{ status: "UNAVAILABLE"; items: readonly T[]; reason: string }>;

export type GoogleDirectoryReadAdapter = Readonly<{
  listWorkspaceUsers(): Promise<readonly WorkspaceUser[]>;
  listWorkspaceGroups(): Promise<readonly WorkspaceGroup[]>;
  listGroupMembers(groupKey: string): Promise<readonly Record<string, unknown>[]>;
  getDomainInventory(): Promise<readonly WorkspaceDomain[]>;
}>;

export type GoogleReportsReadAdapter = Readonly<{
  listLoginAuditEvents(window: Readonly<{ start: string; end: string }>): Promise<readonly WorkspaceAuditEvent[]>;
  listAdminAuditEvents(window: Readonly<{ start: string; end: string }>): Promise<readonly WorkspaceAuditEvent[]>;
}>;

export type WorkspaceFinding = Readonly<{
  code: string;
  severity: "INFO" | "MEDIUM" | "HIGH" | "CRITICAL";
  summary: string;
  targetEmail?: string;
  identities?: readonly string[];
}>;

function requiredString(value: unknown, errorCode: string) {
  if (typeof value !== "string" || value.trim() === "") throw new Error(errorCode);
  return value.trim();
}

export function validateGoogleWorkspaceReadOnlyConfig(input: {
  customerId?: unknown;
  serviceAccountEmail?: unknown;
  mode?: unknown;
  scopes?: unknown;
}): GoogleWorkspaceReadOnlyConfig {
  const customerId = requiredString(input.customerId, "MISSING_GOOGLE_WORKSPACE_CUSTOMER_ID");
  const serviceAccountEmail = requiredString(
    input.serviceAccountEmail,
    "MISSING_GOOGLE_WORKSPACE_SERVICE_ACCOUNT_EMAIL",
  ).toLowerCase();

  if (!/^[^@\s]+@[^@\s]+\.iam\.gserviceaccount\.com$/.test(serviceAccountEmail)) {
    throw new Error("INVALID_GOOGLE_WORKSPACE_SERVICE_ACCOUNT_EMAIL");
  }

  if (input.mode !== "read_only") {
    throw new Error("GOOGLE_WORKSPACE_MODE_MUST_BE_READ_ONLY");
  }

  if (!Array.isArray(input.scopes) || input.scopes.length === 0) {
    throw new Error("MISSING_GOOGLE_WORKSPACE_SCOPES");
  }

  const scopes = [...new Set(input.scopes.filter((scope): scope is string => typeof scope === "string"))];
  const required = new Set<string>(GOOGLE_WORKSPACE_READ_ONLY_SCOPES);

  for (const scope of scopes) {
    if (!required.has(scope)) throw new Error(`PROHIBITED_GOOGLE_WORKSPACE_SCOPE:${scope}`);
  }
  for (const scope of GOOGLE_WORKSPACE_READ_ONLY_SCOPES) {
    if (!scopes.includes(scope)) throw new Error(`MISSING_REQUIRED_GOOGLE_WORKSPACE_SCOPE:${scope}`);
  }
  if (scopes.length !== GOOGLE_WORKSPACE_READ_ONLY_SCOPES.length) {
    throw new Error("GOOGLE_WORKSPACE_SCOPE_SET_MUST_BE_EXACT");
  }

  return Object.freeze({
    customerId,
    serviceAccountEmail,
    mode: "read_only" as const,
    scopes: Object.freeze(scopes),
  });
}

function safeReason(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : "";
  return /^[A-Z0-9_:.-]+$/.test(message) ? message : fallback;
}

async function safeCollection<T>(
  read: () => Promise<readonly T[]>,
  fallbackReason: string,
): Promise<WorkspaceCollection<T>> {
  try {
    const items = await read();
    return { status: "AVAILABLE", items: Array.isArray(items) ? items : [] };
  } catch (error) {
    return {
      status: "UNAVAILABLE",
      items: [],
      reason: safeReason(error, fallbackReason),
    };
  }
}

async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
) {
  if (items.length === 0) return [] as R[];

  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= items.length) return;
      results[index] = await mapper(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

function finding(
  code: string,
  severity: WorkspaceFinding["severity"],
  summary: string,
  extra: Omit<WorkspaceFinding, "code" | "severity" | "summary"> = {},
): WorkspaceFinding {
  return { code, severity, summary, ...extra };
}

export async function getGoogleWorkspaceAuditSnapshot({
  directory,
  reports,
  clock = () => new Date(),
  knownLegacyIdentities = [],
}: {
  directory: GoogleDirectoryReadAdapter;
  reports: GoogleReportsReadAdapter;
  clock?: () => Date;
  knownLegacyIdentities?: readonly string[];
}) {
  const now = clock();
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new Error("INVALID_AUDIT_CLOCK");
  }

  const end = now.toISOString();
  const start = new Date(now.getTime() - AUDIT_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const window = { start, end };

  const [users, groupsBase, domains, login, admin] = await Promise.all([
    safeCollection(() => directory.listWorkspaceUsers(), "GOOGLE_DIRECTORY_USERS_LIST_FAILED"),
    safeCollection(() => directory.listWorkspaceGroups(), "GOOGLE_DIRECTORY_GROUPS_LIST_FAILED"),
    safeCollection(() => directory.getDomainInventory(), "GOOGLE_DIRECTORY_DOMAINS_LIST_FAILED"),
    safeCollection(() => reports.listLoginAuditEvents(window), "GOOGLE_REPORTS_LOGIN_AUDIT_FAILED"),
    safeCollection(() => reports.listAdminAuditEvents(window), "GOOGLE_REPORTS_ADMIN_AUDIT_FAILED"),
  ]);

  let memberFailure = false;
  let groups:
    | WorkspaceCollection<WorkspaceGroup & { members: WorkspaceCollection<Record<string, unknown>> }>
    | WorkspaceCollection<WorkspaceGroup>;

  if (groupsBase.status === "AVAILABLE") {
    const items = await mapWithConcurrency(
      groupsBase.items,
      GROUP_MEMBER_CONCURRENCY,
      async (group) => {
        const members = await safeCollection(
          () => directory.listGroupMembers(group.email),
          "GOOGLE_DIRECTORY_MEMBERS_LIST_FAILED",
        );
        if (members.status !== "AVAILABLE") memberFailure = true;
        return { ...group, members };
      },
    );
    groups = { status: "AVAILABLE", items };
  } else {
    groups = groupsBase;
  }

  const findings: WorkspaceFinding[] = [];

  if (users.status !== "AVAILABLE") {
    findings.push(finding("WORKSPACE_USERS_UNAVAILABLE", "HIGH", "Workspace user inventory could not be verified."));
  } else {
    for (const user of users.items) {
      if (user.isAdmin && !user.isEnrolledIn2Sv) {
        findings.push(
          finding("ADMIN_NOT_ENROLLED_IN_2SV", "CRITICAL", "A Workspace admin is not enrolled in 2-Step Verification.", {
            targetEmail: user.primaryEmail,
          }),
        );
      }
    }
  }

  if (groups.status !== "AVAILABLE") {
    findings.push(finding("WORKSPACE_GROUPS_UNAVAILABLE", "MEDIUM", "Workspace group inventory could not be verified."));
  }

  if (domains.status !== "AVAILABLE") {
    findings.push(finding("WORKSPACE_DOMAINS_UNAVAILABLE", "HIGH", "Workspace domain inventory could not be verified."));
  } else {
    const primary = domains.items.find(
      (domain) => domain.domainName === DREAMCATCHER_WORKSPACE_DOMAIN && domain.isPrimary,
    );
    if (!primary?.verified) {
      findings.push(
        finding("PRIMARY_DOMAIN_NOT_VERIFIED", "CRITICAL", "The approved primary Workspace domain is missing or unverified."),
      );
    }
  }

  if (login.status !== "AVAILABLE") {
    findings.push(finding("LOGIN_AUDIT_UNAVAILABLE", "MEDIUM", "Login audit events could not be verified."));
  }
  if (admin.status !== "AVAILABLE") {
    findings.push(finding("ADMIN_AUDIT_UNAVAILABLE", "MEDIUM", "Admin audit events could not be verified."));
  }

  const legacy = [...new Set(knownLegacyIdentities.filter(Boolean).map(String))];
  if (legacy.length > 0) {
    findings.push(
      finding(
        "LEGACY_IDENTITY_DEPENDENCY_AUDIT_PENDING",
        "INFO",
        "Legacy identities remain intentionally preserved pending dependency audits.",
        { identities: legacy },
      ),
    );
  }

  const partial =
    memberFailure ||
    [users, groups, domains, login, admin].some((section) => section.status !== "AVAILABLE");

  return Object.freeze({
    generatedAt: now.toISOString(),
    domainScope: DREAMCATCHER_WORKSPACE_DOMAIN,
    status: partial ? ("PARTIAL" as const) : ("COMPLETE" as const),
    users,
    groups,
    domains,
    audit: { login, admin },
    sharedDrives: {
      status: "DEFERRED_SCOPE" as const,
      items: [] as const,
      reason: "DRIVE_READONLY_NOT_AUTHORIZED_IN_V1",
    },
    findings,
    evidence: {
      mode: "read_only" as const,
      auditWindow: window,
      sources: ["Admin SDK Directory", "Admin SDK Reports"] as const,
      auth: "NOT_WIRED" as const,
    },
  });
}
