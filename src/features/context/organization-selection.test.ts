import { beforeEach, describe, expect, it, vi } from "vitest";

const { cookiesMock, createServerSupabaseClientMock } = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
  createServerSupabaseClientMock: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: cookiesMock }));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

import {
  loadToroOrganizationChoices,
  parseToroOrganizationId,
  parseToroOrganizationPreference,
  readSelectedToroOrganizationPreference,
  serializeToroOrganizationPreference,
  toroOrganizationCookieOptions,
} from "./organization-selection";
import type { ToroResolvedContext } from "./types";

const ORG_A = "00000000-0000-4000-8000-0000000000aa";
const ORG_B = "00000000-0000-4000-8000-0000000000bb";
const USER_ID = "00000000-0000-4000-8000-000000000001";

function choiceContext(): ToroResolvedContext {
  return {
    userId: "user-1",
    email: "qa@example.invalid",
    displayName: "QA",
    mode: "organization",
    orgId: null,
    membership: null,
    availableOrgIds: [ORG_A, ORG_B],
    allowedDataScopes: ["system"],
    allowedTools: [],
    canUsePersonalVault: false,
    canUseOrganizationData: false,
    requiresContextChoice: true,
  };
}

function organizationClient(rows: unknown[]) {
  const query = {
    select: vi.fn(),
    in: vi.fn(),
    is: vi.fn(),
  };
  query.select.mockReturnValue(query);
  query.in.mockReturnValue(query);
  query.is.mockResolvedValue({ data: rows, error: null });
  return { from: vi.fn(() => query) };
}

describe("organization selection", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("accepts UUID organization IDs and rejects arbitrary cookie input", () => {
    expect(parseToroOrganizationId(ORG_A.toUpperCase())).toBe(ORG_A);
    expect(parseToroOrganizationId("org-1")).toBeNull();
    expect(parseToroOrganizationId("../../another-scope")).toBeNull();
  });

  it("reads only a valid organization preference from the request cookie", async () => {
    cookiesMock.mockResolvedValue({
      get: vi.fn(() => ({ value: `${USER_ID}:${ORG_A}` })),
    });

    await expect(readSelectedToroOrganizationPreference()).resolves.toEqual({
      userId: USER_ID,
      organizationId: ORG_A,
    });
    expect(serializeToroOrganizationPreference(USER_ID, ORG_A)).toBe(`${USER_ID}:${ORG_A}`);
    expect(parseToroOrganizationPreference(ORG_A)).toBeNull();
    expect(parseToroOrganizationPreference(`not-a-user:${ORG_A}`)).toBeNull();
  });

  it("uses host-only, HttpOnly, same-site session cookie options", () => {
    expect(toroOrganizationCookieOptions("https://toro.invalid/my-toro")).toEqual({
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      priority: "high",
    });
    expect(toroOrganizationCookieOptions("http://localhost:3000/my-toro").secure).toBe(false);
  });

  it("loads names only for the complete authorized organization set", async () => {
    createServerSupabaseClientMock.mockResolvedValue(
      organizationClient([
        { id: ORG_B, name: "Mauricio Fernández Toro — Personal" },
        { id: ORG_A, name: "Dreamcatcher Hotel & Villas" },
      ]),
    );

    await expect(loadToroOrganizationChoices(choiceContext())).resolves.toEqual({
      state: "ready",
      choices: [
        { id: ORG_A, name: "Dreamcatcher Hotel & Villas" },
        { id: ORG_B, name: "Mauricio Fernández Toro — Personal" },
      ],
    });
  });

  it("fails closed when any authorized organization label is unavailable", async () => {
    createServerSupabaseClientMock.mockResolvedValue(
      organizationClient([{ id: ORG_A, name: "Dreamcatcher Hotel & Villas" }]),
    );

    await expect(loadToroOrganizationChoices(choiceContext())).resolves.toEqual({
      state: "unavailable",
      choices: [],
    });
  });
});
