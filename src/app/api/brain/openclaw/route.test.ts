import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  authorizeOpenClawService,
  resolveOpenClawChannelContext,
  createPrivilegedSupabaseClient,
  canViewOwnerAttention,
  loadOwnerAttentionProjectionWithClient,
  createToroInternalWorkWithContext,
  loadCanonicalBrainReadSliceWithClient,
  resolveToroReadOnlyMenuForContext,
  loadKrossOperationalSnapshotWithClient,
} = vi.hoisted(() => ({
  authorizeOpenClawService: vi.fn(),
  resolveOpenClawChannelContext: vi.fn(),
  createPrivilegedSupabaseClient: vi.fn(),
  canViewOwnerAttention: vi.fn(),
  loadOwnerAttentionProjectionWithClient: vi.fn(),
  createToroInternalWorkWithContext: vi.fn(),
  loadCanonicalBrainReadSliceWithClient: vi.fn(),
  resolveToroReadOnlyMenuForContext: vi.fn(),
  loadKrossOperationalSnapshotWithClient: vi.fn(),
}));

vi.mock("@/features/openclaw/service-auth", () => ({
  authorizeOpenClawService,
}));
vi.mock("@/features/openclaw/channel-context", () => ({
  resolveOpenClawChannelContext,
}));
vi.mock("@/lib/supabase/privileged", () => ({
  createPrivilegedSupabaseClient,
}));
vi.mock("@/features/attention/owner-attention", () => ({
  canViewOwnerAttention,
}));
vi.mock("@/features/attention/owner-attention-server", () => ({
  loadOwnerAttentionProjectionWithClient,
}));
vi.mock("@/features/actions/internal-work-server", () => ({
  createToroInternalWorkWithContext,
}));
vi.mock("@/features/brain/canonical-read", () => ({
  loadCanonicalBrainReadSliceWithClient,
}));
vi.mock("@/features/menu/server", () => ({
  resolveToroReadOnlyMenuForContext,
}));
vi.mock("@/features/kross/operational-read", () => ({ loadKrossOperationalSnapshotWithClient }));

import { POST } from "./route";

const context = {
  userId: "user-1",
  email: null,
  displayName: "Synthetic Owner",
  mode: "organization",
  orgId: "org-1",
  membership: {
    orgId: "org-1",
    membershipId: "membership-1",
    membershipType: "employee",
    status: "active",
    roles: ["GERENCIA"],
    employeeId: "employee-1",
    employeePreferredName: "Synthetic Owner",
    positionId: null,
    positionCode: null,
    positionName: null,
    workArea: "Gerencia",
    source: "organization_memberships",
  },
  availableOrgIds: ["org-1"],
  allowedDataScopes: ["work_private", "work_org", "shared", "system"],
  allowedTools: [],
  canUsePersonalVault: false,
  canUseOrganizationData: true,
  requiresContextChoice: false,
};

function request(body: unknown) {
  return new Request("http://localhost/api/brain/openclaw", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/brain/openclaw", () => {
  beforeEach(() => {
    vi.stubEnv("TORO_PORTAL_READ_TRANSPORT", "direct");
    authorizeOpenClawService.mockReset();
    resolveOpenClawChannelContext.mockReset();
    createPrivilegedSupabaseClient.mockReset();
    canViewOwnerAttention.mockReset();
    loadOwnerAttentionProjectionWithClient.mockReset();
    createToroInternalWorkWithContext.mockReset();
    loadCanonicalBrainReadSliceWithClient.mockReset();
    resolveToroReadOnlyMenuForContext.mockReset();
    loadKrossOperationalSnapshotWithClient.mockReset();

    authorizeOpenClawService.mockReturnValue({
      ok: true,
      principal: "openclaw-runtime",
    });
    createPrivilegedSupabaseClient.mockReturnValue({ client: "synthetic" });
    resolveOpenClawChannelContext.mockResolvedValue({
      state: "resolved",
      context,
    });
    canViewOwnerAttention.mockReturnValue(true);
  });
  afterEach(() => vi.unstubAllEnvs());

  it("exposes the one-hour informational read without accepting model-supplied authority/time", async () => {
    loadKrossOperationalSnapshotWithClient.mockResolvedValue({
      state: "snapshot", mode: "informational_snapshot", maxAgeMinutes: 60, externalWrite: false,
      sourceAsOf: "2026-10-24T22:30:00Z", counts: { observedScheduledArrivals: 2 },
    });
    const result = await POST(request({ identity: {}, operation: "hospitality.arrivals.read", input: {
      propertyId: "synthetic-property", asOf: "2026-10-20T00:00:00Z", role: "ADMIN", maxAgeMinutes: 9999,
    } }));
    expect(result.status).toBe(200);
    expect(loadKrossOperationalSnapshotWithClient).toHaveBeenCalledWith(context, { client: "synthetic" }, { propertyId: "synthetic-property" });
    await expect(result.json()).resolves.toMatchObject({ state: "snapshot", maxAgeMinutes: 60, externalWrite: false });
  });
  it("preserves a stale source result and a denied role from the shared reader", async () => {
    loadKrossOperationalSnapshotWithClient.mockResolvedValueOnce({ state: "stale", counts: null });
    const stale = await POST(request({ identity: {}, operation: "hospitality.arrivals.read", input: { propertyId: "synthetic" } }));
    expect(stale.status).toBe(200);
    await expect(stale.json()).resolves.toEqual({ state: "stale", counts: null });
    loadKrossOperationalSnapshotWithClient.mockResolvedValueOnce({ state: "forbidden", counts: null });
    expect((await POST(request({ identity: {}, operation: "hospitality.arrivals.read", input: { propertyId: "synthetic" } }))).status).toBe(403);
  });
  it("does not open the Portal session transport for the new arrivals read", async () => {
    vi.stubEnv("TORO_PORTAL_READ_TRANSPORT", "rpc_v1");
    const result = await POST(request({ identity: {}, operation: "hospitality.arrivals.read", input: { propertyId: "synthetic" } }));
    expect(result.status).toBe(503);
    expect(createPrivilegedSupabaseClient).not.toHaveBeenCalled();
    expect(loadKrossOperationalSnapshotWithClient).not.toHaveBeenCalled();
  });

  it("identifies the session-only Portal transport before allocating a machine client", async () => {
    vi.stubEnv("TORO_PORTAL_READ_TRANSPORT", "rpc_v1");
    const result = await POST(request({ identity: {}, operation: "brain.read" }));
    expect(result.status).toBe(503);
    expect(createPrivilegedSupabaseClient).not.toHaveBeenCalled();
    await expect(result.json()).resolves.toMatchObject({ state: "runtime_unavailable" });
  });

  it("returns an actionable conflict when a retry changes the original task", async () => {
    createToroInternalWorkWithContext.mockResolvedValue({ state: "conflict", error: "Key content changed." });
    const result = await POST(request({ identity: {}, operation: "internal_work.create", input: {} }));
    expect(result.status).toBe(409);
    await expect(result.json()).resolves.toMatchObject({ state: "conflict" });
  });

  it("authenticates the runtime before reading channel identity", async () => {
    authorizeOpenClawService.mockReturnValue({
      ok: false,
      response: new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
      }),
    });

    const response = await POST(
      request({
        identity: {},
        operation: "context.resolve",
      }),
    );

    expect(response.status).toBe(401);
    expect(resolveOpenClawChannelContext).not.toHaveBeenCalled();
  });

  it("rejects unknown operations before any privileged channel lookup", async () => {
    const response = await POST(
      request({
        identity: {},
        operation: "shell.exec",
      }),
    );

    expect(response.status).toBe(400);
    expect(createPrivilegedSupabaseClient).not.toHaveBeenCalled();
    expect(resolveOpenClawChannelContext).not.toHaveBeenCalled();
  });

  it("fails closed for an unlinked channel sender", async () => {
    resolveOpenClawChannelContext.mockResolvedValue({ state: "unlinked" });

    const response = await POST(
      request({
        identity: {
          channel: "whatsapp",
          connectionKey: "hotel-main",
          subject: "sender",
        },
        operation: "context.resolve",
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      state: "unlinked",
    });
  });

  it("returns only a safe TORO context projection", async () => {
    const response = await POST(
      request({
        identity: {
          channel: "whatsapp",
          connectionKey: "hotel-main",
          subject: "sender",
        },
        operation: "context.resolve",
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toMatch(/no-store/i);

    const body = await response.json();
    expect(body).toMatchObject({
      state: "ready",
      principal: "openclaw-runtime",
      context: {
        mode: "organization",
        orgId: "org-1",
        roles: ["GERENCIA"],
        employeePreferredName: "Synthetic Owner",
        canUsePersonalVault: false,
        canUseOrganizationData: true,
      },
    });
    expect(JSON.stringify(body)).not.toContain("user-1");
    expect(JSON.stringify(body)).not.toContain("employee-1");
  });

  it("resolves numeric, alias and natural menu intent through the canonical resolver", async () => {
    resolveToroReadOnlyMenuForContext.mockResolvedValue({
      context,
      preferredDisplayName: "Synthetic Owner",
      menu: {
        profileId: "owner_executive",
        selectionReason: "role:GERENCIA",
        hiddenCapabilityCount: 0,
        items: [
          {
            index: 1,
            key: "projects",
            emoji: "P",
            label: "Proyectos",
            aliases: ["proyectos", "estado de proyectos"],
            capability: "projects.status",
            state: "READ_ONLY",
          },
        ],
      },
      sourceReadiness: {
        readyReads: ["projects"],
        blockedReads: [],
      },
      profileSummary: [],
      capabilityNotes: {},
      capabilityAlternatives: {},
      focusableCapabilities: ["projects.status"],
      availableSubmenus: {},
      focus: null,
      state: "resolved",
    });

    for (const text of ["1", "proyectos", "quiero ver estado de proyectos"]) {
      const response = await POST(
        request({
          identity: {
            channel: "whatsapp",
            connectionKey: "hotel-main",
            subject: "sender",
          },
          operation: "menu.resolve",
          input: { text },
        }),
      );

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({
        state: "ready",
        menuProfileId: "owner_executive",
        intent: {
          kind: "item",
          item: { capability: "projects.status" },
        },
      });
    }
  });

  it("reads the same role/source-aware menu used by TORO surfaces", async () => {
    resolveToroReadOnlyMenuForContext.mockResolvedValue({
      context,
      preferredDisplayName: "Synthetic Owner",
      menu: {
        profileId: "owner_executive",
        title: "TORO",
        items: [],
      },
      sourceReadiness: {
        readyReads: [],
        blockedReads: [],
      },
      profileSummary: [],
      capabilityNotes: {},
      capabilityAlternatives: {},
      focusableCapabilities: [],
      availableSubmenus: {},
      focus: null,
      state: "resolved",
    });

    const response = await POST(
      request({
        identity: {
          channel: "whatsapp",
          connectionKey: "hotel-main",
          subject: "sender",
        },
        operation: "menu.read",
        input: { focusCapability: "executive.brief" },
      }),
    );

    expect(response.status).toBe(200);
    expect(resolveToroReadOnlyMenuForContext).toHaveBeenCalledWith(
      context,
      { client: "synthetic" },
      "executive.brief",
      undefined,
    );
    await expect(response.json()).resolves.toMatchObject({
      state: "ready",
      principal: "openclaw-runtime",
      menu: { state: "resolved" },
    });
  });

  it("reads the same canonical Brain projection used by TORO surfaces", async () => {
    loadCanonicalBrainReadSliceWithClient.mockResolvedValue({
      contractVersion: "stage-c-read-v1",
      generatedAt: "2026-09-29T10:00:00.000Z",
      scopeRef: "scope:synthetic",
      organization: {
        ref: "organization:synthetic",
        label: "Synthetic Hotel",
        status: "active",
      },
      projects: [],
      sourceAuthority: [],
      domainGovernance: [],
      krossHealth: [],
    });

    const response = await POST(
      request({
        identity: {
          channel: "whatsapp",
          connectionKey: "hotel-main",
          subject: "sender",
        },
        operation: "brain.read",
      }),
    );

    expect(response.status).toBe(200);
    expect(loadCanonicalBrainReadSliceWithClient).toHaveBeenCalledWith(
      context,
      { client: "synthetic" },
    );

    const body = await response.json();
    expect(body).toMatchObject({
      state: "ready",
      principal: "openclaw-runtime",
      brain: { contractVersion: "stage-c-read-v1" },
    });
  });

  it("reads the same Owner Attention projection only for an allowed actor", async () => {
    loadOwnerAttentionProjectionWithClient.mockResolvedValue({
      contractVersion: "owner-attention-v1",
      generatedAt: "2026-09-29T10:00:00.000Z",
      items: [],
      summary: { critical: 0, high: 0, normal: 0, total: 0 },
    });

    const response = await POST(
      request({
        identity: {
          channel: "whatsapp",
          connectionKey: "hotel-main",
          subject: "sender",
        },
        operation: "owner_attention.read",
      }),
    );

    expect(response.status).toBe(200);
    expect(loadOwnerAttentionProjectionWithClient).toHaveBeenCalledWith(
      context,
      { client: "synthetic" },
    );
  });

  it("denies Owner Attention when the resolved TORO role is not allowed", async () => {
    canViewOwnerAttention.mockReturnValue(false);

    const response = await POST(
      request({
        identity: {
          channel: "whatsapp",
          connectionKey: "hotel-main",
          subject: "sender",
        },
        operation: "owner_attention.read",
      }),
    );

    expect(response.status).toBe(403);
    expect(loadOwnerAttentionProjectionWithClient).not.toHaveBeenCalled();
  });

  it("uses the canonical idempotent internal-work contract for WhatsApp tasks", async () => {
    createToroInternalWorkWithContext.mockResolvedValue({
      state: "created",
      task: {
        id: "task-1",
        taskKey: "toro_intake:provider-msg-123",
        title: "Revisar mantenimiento",
        status: "planned",
        priority: "high",
        area: "Maintenance",
        projectId: null,
      },
    });

    const input = {
      action: "maintenance.task",
      title: "Revisar mantenimiento",
      description: "Synthetic QA",
      priority: "high",
      projectKey: null,
      dueDate: null,
      idempotencyKey: "provider-msg-123",
    };

    const response = await POST(
      request({
        identity: {
          channel: "whatsapp",
          connectionKey: "hotel-main",
          subject: "sender",
        },
        operation: "internal_work.create",
        input,
      }),
    );

    expect(response.status).toBe(201);
    expect(createToroInternalWorkWithContext).toHaveBeenCalledWith(
      input,
      context,
      { client: "synthetic" },
    );
    await expect(response.json()).resolves.toMatchObject({
      state: "created",
      externalWrite: false,
      canonicalWrite: "operations.tasks",
    });
  });
});

describe("informational menu selector and post-read channel authority", () => {
  const propertyId = "00000000-0000-4000-8000-000000000002";
  const identity = { channel: "whatsapp", connectionKey: "synthetic-hotel", subject: "synthetic-sender" };
  const client = { client: "synthetic" };
  let current: typeof context;
  function menu() {
    return {
      context: current,
      menu: { profileId: "manager", hiddenCapabilityCount: 0, items: [{
        index: 1, key: "hotel_today", emoji: "", label: "Hotel hoy", aliases: ["hotel hoy", "operación"],
        capability: "operations.hotel_today", state: "READ_ONLY",
      }] },
      focus: { items: [{ title: "SYNTHETIC_RESERVATION_RESULT" }] },
    };
  }
  const input = { propertyId, focusCapability: "operations.hotel_today", text: "hotel hoy" };
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("TORO_PORTAL_READ_TRANSPORT", "direct");
    current = structuredClone(context);
    authorizeOpenClawService.mockReturnValue({ ok: true, principal: "openclaw-runtime" });
    createPrivilegedSupabaseClient.mockReturnValue(client);
    resolveOpenClawChannelContext.mockResolvedValue({ state: "resolved", context: current });
    resolveToroReadOnlyMenuForContext.mockImplementation(async () => menu());
    loadKrossOperationalSnapshotWithClient.mockResolvedValue({ state: "snapshot", notice: "SYNTHETIC_RESERVATION_RESULT" });
  });
  afterEach(() => vi.unstubAllEnvs());

  for (const operation of ["menu.read", "menu.resolve"]) {
    it(`${operation} forwards only the explicit property and rechecks the same canonical binding`, async () => {
      const result = await POST(request({ identity, operation, input: {
        ...input, orgId: "other", role: "ADMIN", asOf: "2099-01-01", maxAgeMinutes: 99999,
      } }));
      expect(result.status).toBe(200);
      expect(resolveToroReadOnlyMenuForContext).toHaveBeenCalledExactlyOnceWith(
        current, client, operation === "menu.read" ? input.focusCapability : null, { propertyId },
      );
      expect(resolveOpenClawChannelContext).toHaveBeenCalledTimes(2);
      expect(resolveOpenClawChannelContext).toHaveBeenNthCalledWith(1, identity, client);
      expect(resolveOpenClawChannelContext).toHaveBeenNthCalledWith(2, identity, client);
      expect(resolveOpenClawChannelContext.mock.invocationCallOrder[1]).toBeGreaterThan(resolveToroReadOnlyMenuForContext.mock.invocationCallOrder[0]);
      expect(loadKrossOperationalSnapshotWithClient).not.toHaveBeenCalled();
      expect(result.headers.get("cache-control")).toContain("no-store");
    });

    it(`${operation} does not invent a property when the selector is absent`, async () => {
      const result = await POST(request({ identity, operation, input: { text: input.text, focusCapability: input.focusCapability } }));
      expect(result.status).toBe(200);
      expect(resolveToroReadOnlyMenuForContext.mock.calls[0][3]).toBeUndefined();
    });

    for (const propertyId of [null, "invalid", 123, "00000000-0000-4000-8000-000000000002/.eq"]) {
      it(`${operation} rejects malformed property ${String(propertyId)} before any privileged lookup`, async () => {
        const result = await POST(request({ identity, operation, input: { ...input, propertyId } }));
        expect(result.status).toBe(400);
        expect(createPrivilegedSupabaseClient).not.toHaveBeenCalled();
        expect(resolveOpenClawChannelContext).not.toHaveBeenCalled();
        expect(resolveToroReadOnlyMenuForContext).not.toHaveBeenCalled();
      });
    }

    it(`${operation} keeps Portal rpc_v1 closed before allocating a machine client`, async () => {
      vi.stubEnv("TORO_PORTAL_READ_TRANSPORT", "rpc_v1");
      const result = await POST(request({ identity, operation, input }));
      expect(result.status).toBe(503);
      expect(createPrivilegedSupabaseClient).not.toHaveBeenCalled();
      expect(resolveToroReadOnlyMenuForContext).not.toHaveBeenCalled();
    });
  }

  for (const operation of ["menu.read", "menu.resolve", "hospitality.arrivals.read"]) {
    for (const change of ["revoked", "unlinked", "actor", "organization", "membership", "employee", "role", "profile", "scope"]) {
      it(`${operation} discards its result after canonical ${change} changes`, async () => {
        const fresh = structuredClone(current);
        if (change === "actor") fresh.userId = "other-user";
        if (change === "organization") { fresh.orgId = "other-org"; fresh.membership.orgId = "other-org"; }
        if (change === "membership") fresh.membership.membershipId = "other-membership";
        if (change === "employee") fresh.membership.employeeId = "other-employee";
        if (change === "role") fresh.membership.roles = ["EMPLEADO"];
        if (change === "profile") fresh.membership.positionCode = "RECEPTION" as never;
        if (change === "scope") fresh.allowedDataScopes = ["system"];
        const rechecked = change === "revoked" ? { state: "forbidden", error: "SYNTHETIC_PRIVATE_LOOKUP_DETAIL" }
          : change === "unlinked" ? { state: "unlinked" } : { state: "resolved", context: fresh };
        resolveOpenClawChannelContext.mockReset()
          .mockResolvedValueOnce({ state: "resolved", context: current })
          .mockResolvedValueOnce(rechecked);
        const result = await POST(request({ identity, operation, input }));
        expect(result.status).toBe(403);
        expect(resolveOpenClawChannelContext).toHaveBeenCalledTimes(2);
        const body = await result.text();
        expect(body).not.toContain("SYNTHETIC_RESERVATION_RESULT");
        expect(body).not.toContain("SYNTHETIC_PRIVATE_LOOKUP_DETAIL");
        expect(body).not.toContain('"intent"');
        expect(body).not.toContain('"menu"');
      });
    }

    it(`${operation} fails closed when the fresh binding lookup cannot complete`, async () => {
      resolveOpenClawChannelContext.mockReset()
        .mockResolvedValueOnce({ state: "resolved", context: current })
        .mockRejectedValueOnce(new Error("SYNTHETIC_PRIVATE_LOOKUP_DETAIL"));
      const result = await POST(request({ identity, operation, input }));
      expect(result.status).toBe(503);
      const body = await result.text();
      expect(body).not.toContain("SYNTHETIC_PRIVATE_LOOKUP_DETAIL");
      expect(body).not.toContain("SYNTHETIC_RESERVATION_RESULT");
    });
  }

  it("also rejects in-memory context mutation without mistaking it for canonical revalidation", async () => {
    const unchangedCanonicalContext = structuredClone(current);
    resolveOpenClawChannelContext.mockReset()
      .mockResolvedValueOnce({ state: "resolved", context: current })
      .mockResolvedValueOnce({ state: "resolved", context: unchangedCanonicalContext });
    resolveToroReadOnlyMenuForContext.mockImplementation(async () => {
      current.membership.roles = ["EMPLEADO"];
      return menu();
    });
    const result = await POST(request({ identity, operation: "menu.read", input }));
    expect(result.status).toBe(403);
    expect(resolveOpenClawChannelContext).toHaveBeenCalledTimes(2);
    expect(await result.text()).not.toContain("SYNTHETIC_RESERVATION_RESULT");
  });

  it("treats unchanged canonical scope sets independently of their order", async () => {
    const fresh = structuredClone(current);
    fresh.allowedDataScopes.reverse();
    resolveOpenClawChannelContext.mockReset()
      .mockResolvedValueOnce({ state: "resolved", context: current })
      .mockResolvedValueOnce({ state: "resolved", context: fresh });
    expect((await POST(request({ identity, operation: "menu.read", input }))).status).toBe(200);
  });
});


