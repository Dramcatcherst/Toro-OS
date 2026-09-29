import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  authorizeOpenClawService,
  resolveOpenClawChannelContext,
  createPrivilegedSupabaseClient,
  canViewOwnerAttention,
  loadOwnerAttentionProjectionWithClient,
  createToroInternalWorkWithContext,
  loadCanonicalBrainReadSliceWithClient,
  resolveToroReadOnlyMenuForContext,
} = vi.hoisted(() => ({
  authorizeOpenClawService: vi.fn(),
  resolveOpenClawChannelContext: vi.fn(),
  createPrivilegedSupabaseClient: vi.fn(),
  canViewOwnerAttention: vi.fn(),
  loadOwnerAttentionProjectionWithClient: vi.fn(),
  createToroInternalWorkWithContext: vi.fn(),
  loadCanonicalBrainReadSliceWithClient: vi.fn(),
  resolveToroReadOnlyMenuForContext: vi.fn(),
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
    authorizeOpenClawService.mockReset();
    resolveOpenClawChannelContext.mockReset();
    createPrivilegedSupabaseClient.mockReset();
    canViewOwnerAttention.mockReset();
    loadOwnerAttentionProjectionWithClient.mockReset();
    createToroInternalWorkWithContext.mockReset();
    loadCanonicalBrainReadSliceWithClient.mockReset();
    resolveToroReadOnlyMenuForContext.mockReset();

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
