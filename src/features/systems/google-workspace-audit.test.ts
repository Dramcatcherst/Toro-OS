import { describe, expect, it, vi } from "vitest";

import {
  GOOGLE_WORKSPACE_READ_ONLY_SCOPES,
  getGoogleWorkspaceAuditSnapshot,
  validateGoogleWorkspaceReadOnlyConfig,
} from "./google-workspace-audit";

const serviceAccountEmail = "toro-workspace-audit@dreamcatcher-toro.iam.gserviceaccount.com";

describe("validateGoogleWorkspaceReadOnlyConfig", () => {
  it("accepts only the exact four-scope read-only bundle", () => {
    expect(
      validateGoogleWorkspaceReadOnlyConfig({
        customerId: "my_customer",
        serviceAccountEmail,
        mode: "read_only",
        scopes: [...GOOGLE_WORKSPACE_READ_ONLY_SCOPES],
      }),
    ).toMatchObject({
      customerId: "my_customer",
      serviceAccountEmail,
      mode: "read_only",
    });
  });

  it("fails closed on missing or extra scopes", () => {
    expect(() =>
      validateGoogleWorkspaceReadOnlyConfig({
        customerId: "my_customer",
        serviceAccountEmail,
        mode: "read_only",
        scopes: GOOGLE_WORKSPACE_READ_ONLY_SCOPES.slice(0, 3),
      }),
    ).toThrow(/MISSING_REQUIRED_GOOGLE_WORKSPACE_SCOPE/);

    expect(() =>
      validateGoogleWorkspaceReadOnlyConfig({
        customerId: "my_customer",
        serviceAccountEmail,
        mode: "read_only",
        scopes: [...GOOGLE_WORKSPACE_READ_ONLY_SCOPES, "https://www.googleapis.com/auth/drive.readonly"],
      }),
    ).toThrow(/PROHIBITED_GOOGLE_WORKSPACE_SCOPE/);
  });

  it("rejects write mode and non-service-account identities", () => {
    expect(() =>
      validateGoogleWorkspaceReadOnlyConfig({
        customerId: "my_customer",
        serviceAccountEmail: "admin@dreamcatcherhotel.com",
        mode: "read_only",
        scopes: [...GOOGLE_WORKSPACE_READ_ONLY_SCOPES],
      }),
    ).toThrow("INVALID_GOOGLE_WORKSPACE_SERVICE_ACCOUNT_EMAIL");

    expect(() =>
      validateGoogleWorkspaceReadOnlyConfig({
        customerId: "my_customer",
        serviceAccountEmail,
        mode: "write",
        scopes: [...GOOGLE_WORKSPACE_READ_ONLY_SCOPES],
      }),
    ).toThrow("GOOGLE_WORKSPACE_MODE_MUST_BE_READ_ONLY");
  });
});

describe("getGoogleWorkspaceAuditSnapshot", () => {
  it("builds a complete read-only snapshot and keeps Drive deferred", async () => {
    const directory = {
      listWorkspaceUsers: vi.fn(async () => [
        { primaryEmail: "admin@dreamcatcherhotel.com", isAdmin: true, isEnrolledIn2Sv: true },
      ]),
      listWorkspaceGroups: vi.fn(async () => [{ email: "team@dreamcatcherhotel.com" }]),
      listGroupMembers: vi.fn(async () => [{ email: "admin@dreamcatcherhotel.com" }]),
      getDomainInventory: vi.fn(async () => [
        { domainName: "dreamcatcherhotel.com", isPrimary: true, verified: true },
      ]),
    };
    const reports = {
      listLoginAuditEvents: vi.fn(async () => []),
      listAdminAuditEvents: vi.fn(async () => []),
    };

    const snapshot = await getGoogleWorkspaceAuditSnapshot({
      directory,
      reports,
      clock: () => new Date("2026-09-18T15:00:00Z"),
    });

    expect(snapshot.status).toBe("COMPLETE");
    expect(snapshot.sharedDrives.status).toBe("DEFERRED_SCOPE");
    expect(snapshot.evidence.auth).toBe("NOT_WIRED");
    expect(snapshot.findings).toEqual([]);
  });

  it("returns PARTIAL instead of pretending unavailable data is empty", async () => {
    const directory = {
      listWorkspaceUsers: vi.fn(async () => {
        throw new Error("GOOGLE_DIRECTORY_USERS_LIST_FAILED");
      }),
      listWorkspaceGroups: vi.fn(async () => []),
      listGroupMembers: vi.fn(async () => []),
      getDomainInventory: vi.fn(async () => [
        { domainName: "dreamcatcherhotel.com", isPrimary: true, verified: true },
      ]),
    };
    const reports = {
      listLoginAuditEvents: vi.fn(async () => {
        throw new Error("GOOGLE_REPORTS_LOGIN_AUDIT_FAILED");
      }),
      listAdminAuditEvents: vi.fn(async () => []),
    };

    const snapshot = await getGoogleWorkspaceAuditSnapshot({ directory, reports });

    expect(snapshot.status).toBe("PARTIAL");
    expect(snapshot.users.status).toBe("UNAVAILABLE");
    expect(snapshot.audit.login.status).toBe("UNAVAILABLE");
    expect(snapshot.findings.map((finding) => finding.code)).toEqual(
      expect.arrayContaining(["WORKSPACE_USERS_UNAVAILABLE", "LOGIN_AUDIT_UNAVAILABLE"]),
    );
  });

  it("flags an admin without 2SV and preserves legacy identities as evidence only", async () => {
    const directory = {
      listWorkspaceUsers: vi.fn(async () => [
        { primaryEmail: "admin@dreamcatcherhotel.com", isAdmin: true, isEnrolledIn2Sv: false },
      ]),
      listWorkspaceGroups: vi.fn(async () => []),
      listGroupMembers: vi.fn(async () => []),
      getDomainInventory: vi.fn(async () => [
        { domainName: "dreamcatcherhotel.com", isPrimary: true, verified: true },
      ]),
    };
    const reports = {
      listLoginAuditEvents: vi.fn(async () => []),
      listAdminAuditEvents: vi.fn(async () => []),
    };

    const snapshot = await getGoogleWorkspaceAuditSnapshot({
      directory,
      reports,
      knownLegacyIdentities: ["legacy@example.invalid"],
    });

    expect(snapshot.findings.map((finding) => finding.code)).toEqual(
      expect.arrayContaining([
        "ADMIN_NOT_ENROLLED_IN_2SV",
        "LEGACY_IDENTITY_DEPENDENCY_AUDIT_PENDING",
      ]),
    );
  });
});
