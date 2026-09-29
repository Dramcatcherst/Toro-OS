import { afterEach, describe, expect, it, vi } from "vitest";

import {
  hashOpenClawChannelSubject,
  normalizeOpenClawChannelIdentity,
  resolveOpenClawChannelContext,
} from "./channel-context";

const ORG_ID = "00000000-0000-4000-8000-0000000000aa";
const EMPLOYEE_ID = "00000000-0000-4000-8000-0000000000ee";
const USER_ID = "00000000-0000-4000-8000-0000000000ff";
const MEMBERSHIP_ID = "00000000-0000-4000-8000-0000000000ab";

type Fixture = {
  identityRows?: unknown[];
  identityError?: object | null;
  employeeRows?: unknown[];
  employeeError?: object | null;
  membershipRows?: unknown[];
  membershipError?: object | null;
  roleRows?: unknown[];
  roleError?: object | null;
};

function buildClient({
  identityRows = [{
    id: "identity-1",
    org_id: ORG_ID,
    employee_id: EMPLOYEE_ID,
    status: "active",
  }],
  identityError = null,
  employeeRows = [{
    id: EMPLOYEE_ID,
    user_id: USER_ID,
    preferred_name: "Synthetic Owner",
    position_id: "position-1",
    work_area: "Gerencia",
    employment_status: "active",
    status: "active",
    deleted_at: null,
    positions: { code: "GM", name: "Gerencia General" },
  }],
  employeeError = null,
  membershipRows = [{
    id: MEMBERSHIP_ID,
    membership_type: "employee",
    status: "active",
    primary_employee_id: EMPLOYEE_ID,
  }],
  membershipError = null,
  roleRows = [{ roles: { code: "GERENCIA" } }],
  roleError = null,
}: Fixture = {}) {
  const eqCalls: Array<[string, unknown]> = [];

  function identityQuery() {
    const q = {
      select: vi.fn(),
      eq: vi.fn(),
      limit: vi.fn(),
    };
    q.select.mockReturnValue(q);
    q.eq.mockImplementation((field: string, value: unknown) => {
      eqCalls.push([field, value]);
      return q;
    });
    q.limit.mockResolvedValue({ data: identityRows, error: identityError });
    return q;
  }

  function employeeQuery() {
    const q = {
      select: vi.fn(),
      eq: vi.fn(),
      is: vi.fn(),
      limit: vi.fn(),
    };
    q.select.mockReturnValue(q);
    q.eq.mockReturnValue(q);
    q.is.mockReturnValue(q);
    q.limit.mockResolvedValue({ data: employeeRows, error: employeeError });
    return q;
  }

  function membershipQuery() {
    const q = {
      select: vi.fn(),
      eq: vi.fn(),
      limit: vi.fn(),
    };
    q.select.mockReturnValue(q);
    q.eq.mockReturnValue(q);
    q.limit.mockResolvedValue({ data: membershipRows, error: membershipError });
    return q;
  }

  function roleQuery() {
    const q = {
      select: vi.fn(),
      eq: vi.fn(),
      is: vi.fn(),
    };
    q.select.mockReturnValue(q);
    q.eq.mockReturnValue(q);
    q.is.mockResolvedValue({ data: roleRows, error: roleError });
    return q;
  }

  const from = vi.fn((table: string) => {
    if (table === "employee_channel_identities") return identityQuery();
    if (table === "employees") return employeeQuery();
    if (table === "user_roles") return roleQuery();
    throw new Error(`Unexpected public table: ${table}`);
  });

  const schema = vi.fn((name: string) => {
    if (name !== "identity") throw new Error(`Unexpected schema: ${name}`);
    return {
      from: vi.fn((table: string) => {
        if (table !== "organization_memberships") {
          throw new Error(`Unexpected identity table: ${table}`);
        }
        return membershipQuery();
      }),
    };
  });

  return { client: { from, schema }, eqCalls };
}

describe("OpenClaw channel context", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("validates channel identity input before any lookup", () => {
    expect(
      normalizeOpenClawChannelIdentity({
        channel: "WhatsApp",
        connectionKey: "hotel-main",
        subject: "sender-123",
      }),
    ).toEqual({
      ok: true,
      value: {
        channel: "whatsapp",
        connectionKey: "hotel-main",
        subject: "sender-123",
      },
    });

    expect(
      normalizeOpenClawChannelIdentity({
        channel: "bad channel",
        connectionKey: "x",
        subject: "",
      }),
    ).toMatchObject({ ok: false });
  });

  it("uses a scoped HMAC so the same sender differs across channel bindings", () => {
    const secret = "s".repeat(48);
    const first = hashOpenClawChannelSubject(
      {
        channel: "whatsapp",
        connectionKey: "hotel-main",
        subject: "sender-123",
      },
      secret,
    );
    const second = hashOpenClawChannelSubject(
      {
        channel: "whatsapp",
        connectionKey: "hotel-secondary",
        subject: "sender-123",
      },
      secret,
    );

    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(second).toMatch(/^[a-f0-9]{64}$/);
    expect(first).not.toBe(second);
  });

  it("fails closed when the HMAC secret is absent", async () => {
    vi.stubEnv("TORO_CHANNEL_IDENTITY_HMAC_SECRET", "");
    const { client } = buildClient();

    await expect(
      resolveOpenClawChannelContext(
        {
          channel: "whatsapp",
          connectionKey: "hotel-main",
          subject: "sender-123",
        },
        client as never,
      ),
    ).resolves.toMatchObject({
      state: "unavailable",
    });
  });

  it("returns unlinked for an unknown sender", async () => {
    vi.stubEnv("TORO_CHANNEL_IDENTITY_HMAC_SECRET", "h".repeat(48));
    const { client, eqCalls } = buildClient({ identityRows: [] });

    const result = await resolveOpenClawChannelContext(
      {
        channel: "whatsapp",
        connectionKey: "hotel-main",
        subject: "sender-123",
      },
      client as never,
    );

    expect(result).toEqual({ state: "unlinked" });
    const subjectHash = eqCalls.find(([field]) => field === "subject_hash")?.[1];
    expect(subjectHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("denies a sender whose employee identity is not active", async () => {
    vi.stubEnv("TORO_CHANNEL_IDENTITY_HMAC_SECRET", "h".repeat(48));
    const { client } = buildClient({ employeeRows: [] });

    await expect(
      resolveOpenClawChannelContext(
        {
          channel: "whatsapp",
          connectionKey: "hotel-main",
          subject: "sender-123",
        },
        client as never,
      ),
    ).resolves.toMatchObject({
      state: "forbidden",
    });
  });

  it("denies a membership that is not bound to the verified employee", async () => {
    vi.stubEnv("TORO_CHANNEL_IDENTITY_HMAC_SECRET", "h".repeat(48));
    const { client } = buildClient({
      membershipRows: [{
        id: MEMBERSHIP_ID,
        membership_type: "employee",
        status: "active",
        primary_employee_id: "another-employee",
      }],
    });

    await expect(
      resolveOpenClawChannelContext(
        {
          channel: "whatsapp",
          connectionKey: "hotel-main",
          subject: "sender-123",
        },
        client as never,
      ),
    ).resolves.toMatchObject({
      state: "forbidden",
    });
  });

  it("denies actors without an active canonical role", async () => {
    vi.stubEnv("TORO_CHANNEL_IDENTITY_HMAC_SECRET", "h".repeat(48));
    const { client } = buildClient({ roleRows: [] });

    await expect(
      resolveOpenClawChannelContext(
        {
          channel: "whatsapp",
          connectionKey: "hotel-main",
          subject: "sender-123",
        },
        client as never,
      ),
    ).resolves.toMatchObject({
      state: "forbidden",
    });
  });

  it("resolves a verified sender into the same organization context contract", async () => {
    vi.stubEnv("TORO_CHANNEL_IDENTITY_HMAC_SECRET", "h".repeat(48));
    const { client } = buildClient();

    const result = await resolveOpenClawChannelContext(
      {
        channel: "whatsapp",
        connectionKey: "hotel-main",
        subject: "sender-123",
      },
      client as never,
    );

    expect(result).toMatchObject({
      state: "resolved",
      context: {
        userId: USER_ID,
        displayName: "Synthetic Owner",
        mode: "organization",
        orgId: ORG_ID,
        availableOrgIds: [ORG_ID],
        canUsePersonalVault: false,
        canUseOrganizationData: true,
        requiresContextChoice: false,
        membership: {
          membershipId: MEMBERSHIP_ID,
          membershipType: "employee",
          status: "active",
          roles: ["GERENCIA"],
          employeeId: EMPLOYEE_ID,
          employeePreferredName: "Synthetic Owner",
          source: "organization_memberships",
        },
      },
    });

    if (result.state === "resolved") {
      expect(result.context.allowedDataScopes).not.toContain("personal");
    }
  });
});
