import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerSupabaseClientMock } = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

import type { ToroResolvedContext } from "@/features/context/types";

import { loadToroCommsInbox } from "./server";

const USER = "00000000-0000-4000-8000-000000000001";
const ORG = "00000000-0000-4000-8000-0000000000aa";
const EMPLOYEE = "00000000-0000-4000-8000-000000000011";

function context(
  overrides: Partial<ToroResolvedContext> = {},
): ToroResolvedContext {
  return {
    userId: USER,
    email: "synthetic@example.invalid",
    displayName: "Synthetic",
    mode: "organization",
    orgId: ORG,
    membership: {
      orgId: ORG,
      membershipId: null,
      membershipType: "employee",
      status: "active",
      roles: ["EMPLEADO"],
      employeeId: EMPLOYEE,
      source: "legacy_user_roles",
    },
    availableOrgIds: [ORG],
    allowedDataScopes: ["work_private", "work_org", "shared", "system"],
    allowedTools: [],
    canUsePersonalVault: false,
    canUseOrganizationData: true,
    requiresContextChoice: false,
    ...overrides,
  };
}

function query(data: unknown, error: unknown = null) {
  const calls: Array<[string, unknown]> = [];
  const q = {
    select: vi.fn(),
    eq: vi.fn(),
    is: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    maybeSingle: vi.fn(),
  };
  q.select.mockReturnValue(q);
  q.eq.mockImplementation((field: string, value: unknown) => {
    calls.push([field, value]);
    return q;
  });
  q.is.mockReturnValue(q);
  q.order.mockReturnValue(q);
  q.limit.mockResolvedValue({ data, error });
  q.maybeSingle.mockResolvedValue({ data, error });
  return { q, calls };
}

function client({
  messages = [],
  readState = {
    last_read_at: "2026-09-23T05:00:00Z",
    notifications_enabled: true,
  },
  messageError = null,
  readStateError = null,
}: {
  messages?: unknown;
  readState?: unknown;
  messageError?: unknown;
  readStateError?: unknown;
} = {}) {
  const messageQuery = query(messages, messageError);
  const readStateQuery = query(readState, readStateError);

  const from = vi.fn((table: string) => {
    if (table === "team_messages") return messageQuery.q;
    if (table === "team_message_read_states") return readStateQuery.q;
    throw new Error(`Unexpected table: ${table}`);
  });

  return { client: { from }, from, messageQuery, readStateQuery };
}

describe("loadToroCommsInbox", () => {
  beforeEach(() => {
    createServerSupabaseClientMock.mockReset();
  });

  it("does not open organization messaging from Personal context", async () => {
    await expect(
      loadToroCommsInbox(
        context({
          mode: "personal",
          orgId: null,
          membership: null,
          canUsePersonalVault: true,
          canUseOrganizationData: false,
          allowedDataScopes: ["personal", "shared", "system"],
        }),
      ),
    ).resolves.toEqual({
      status: "not_available",
      reason: "organization_context_required",
    });

    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
  });

  it("scopes reads to the active organization and own read state", async () => {
    const mock = client();
    createServerSupabaseClientMock.mockResolvedValue(mock.client);

    await expect(loadToroCommsInbox(context())).resolves.toMatchObject({
      status: "ready",
      data: {
        lastReadAt: "2026-09-23T05:00:00Z",
        notificationsEnabled: true,
      },
    });

    expect(mock.messageQuery.calls).toContainEqual(["org_id", ORG]);
    expect(mock.readStateQuery.calls).toContainEqual(["org_id", ORG]);
    expect(mock.readStateQuery.calls).toContainEqual(["user_id", USER]);
  });

  it("narrows privileged DM visibility and computes unread only for personal inbox messages", async () => {
    const mock = client({
      messages: [
        {
          id: "general-new",
          channel: "general",
          body: "General",
          created_at: "2026-09-23T06:00:00Z",
          sender_user_id: "user-2",
          sender_employee_id: "employee-2",
          attachment_data: {},
        },
        {
          id: "mine-new",
          channel: "general",
          body: "Mine",
          created_at: "2026-09-23T06:10:00Z",
          sender_user_id: USER,
          sender_employee_id: EMPLOYEE,
          attachment_data: {},
        },
        {
          id: "dm-to-me",
          channel: "dm",
          body: "Private to me",
          created_at: "2026-09-23T05:30:00Z",
          sender_user_id: "user-3",
          sender_employee_id: "employee-3",
          attachment_data: {
            direct_to_employee_id: EMPLOYEE,
            direct_to_name: "Synthetic",
          },
        },
        {
          id: "dm-other",
          channel: "dm",
          body: "Privileged RLS may expose this, but inbox must not",
          created_at: "2026-09-23T05:45:00Z",
          sender_user_id: "user-3",
          sender_employee_id: "employee-3",
          attachment_data: {
            direct_to_employee_id: "employee-99",
          },
        },
      ],
    });
    createServerSupabaseClientMock.mockResolvedValue(mock.client);

    const result = await loadToroCommsInbox(context());

    expect(result).toMatchObject({
      status: "ready",
      data: {
        unreadCount: 2,
      },
    });

    if (result.status !== "ready") throw new Error("Expected ready inbox");

    expect(result.data.messages.map((message) => message.id)).toEqual([
      "general-new",
      "mine-new",
      "dm-to-me",
    ]);
    expect(result.data.messages.some((message) => message.id === "dm-other")).toBe(
      false,
    );
  });

  it("does not expose received DMs to a non-employee organization member", async () => {
    const mock = client({
      messages: [
        {
          id: "dm-other",
          channel: "dm",
          body: "Private",
          created_at: "2026-09-23T06:00:00Z",
          sender_user_id: "user-2",
          attachment_data: {
            direct_to_employee_id: "employee-2",
          },
        },
      ],
      readState: null,
    });
    createServerSupabaseClientMock.mockResolvedValue(mock.client);

    const nonEmployee = context();
    nonEmployee.membership = {
      ...nonEmployee.membership!,
      employeeId: null,
      membershipType: null,
    };

    await expect(loadToroCommsInbox(nonEmployee)).resolves.toMatchObject({
      status: "ready",
      data: {
        messages: [],
        lastReadAt: null,
        notificationsEnabled: true,
        unreadCount: 0,
      },
    });
  });

  it("fails closed when either canonical source errors", async () => {
    const mock = client({
      messageError: { message: "synthetic message failure" },
    });
    createServerSupabaseClientMock.mockResolvedValue(mock.client);

    await expect(loadToroCommsInbox(context())).resolves.toEqual({
      status: "error",
      reason: "data_unavailable",
      failedSources: ["messages"],
    });
  });
});
