import { beforeEach, describe, expect, it, vi } from "vitest";

const { getToroSession, createServerSupabaseClient, redirect } = vi.hoisted(() => ({
  getToroSession: vi.fn(),
  createServerSupabaseClient: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));

vi.mock("@/features/auth/session", () => ({ getToroSession }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient }));
vi.mock("next/navigation", () => ({ redirect }));

import { loadKnowledgeDirectory } from "./server";

function query(result: { data: unknown[] | null; error: { message?: string } | null }) {
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    neq: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(async () => result),
  };
  return chain;
}

const session = {
  userId: "00000000-0000-0000-0000-000000000001",
  role: "FOUNDER",
  navRole: "FOUNDER",
  displayName: "Founder",
  memberships: [],
};

describe("loadKnowledgeDirectory", () => {
  beforeEach(() => {
    getToroSession.mockReset();
    createServerSupabaseClient.mockReset();
    redirect.mockClear();
    getToroSession.mockResolvedValue(session);
  });

  it("requires management access before reading knowledge", async () => {
    getToroSession.mockResolvedValue(null);
    await expect(loadKnowledgeDirectory()).rejects.toThrow("redirect:/login?next=/toro/conocimiento");
    expect(createServerSupabaseClient).not.toHaveBeenCalled();

    getToroSession.mockResolvedValue({ ...session, role: "RECEPCION", navRole: "RECEPCION" });
    await expect(loadKnowledgeDirectory()).rejects.toThrow("redirect:/toro");
    expect(createServerSupabaseClient).not.toHaveBeenCalled();
  });

  it("returns only safe metadata from active non-private knowledge", async () => {
    const knowledgeQuery = query({
      data: [
        {
          id: "00000000-0000-0000-0000-000000000031",
          title: "Regla de autoridad Kross",
          knowledge_class: "source_of_truth_rule",
          visibility: "internal",
          verified_status: "verified",
          risk_level: "critical",
          requires_human_verification: false,
          last_verified: "2026-09-15",
          next_review: "2026-10-15",
          source_system: "Airtable",
          updated_at: "2026-09-15T22:09:18.725Z",
          content_es: "must-not-leak",
          structured_content: { secret: true },
        },
      ],
      error: null,
    });
    const from = vi.fn((table: string) => {
      if (table !== "knowledge_items") throw new Error(`unexpected table:${table}`);
      return knowledgeQuery;
    });
    const schema = vi.fn((name: string) => {
      if (name !== "operations") throw new Error(`unexpected schema:${name}`);
      return { from };
    });
    createServerSupabaseClient.mockResolvedValue({ schema });

    const data = await loadKnowledgeDirectory();

    expect(data).toEqual([
      {
        id: "00000000-0000-0000-0000-000000000031",
        title: "Regla de autoridad Kross",
        knowledgeClass: "source_of_truth_rule",
        visibility: "internal",
        verifiedStatus: "verified",
        riskLevel: "critical",
        requiresHumanVerification: false,
        lastVerified: "2026-09-15",
        nextReview: "2026-10-15",
        sourceSystem: "Airtable",
        freshness: "2026-09-15T22:09:18.725Z",
      },
    ]);
    expect(JSON.stringify(data)).not.toContain("must-not-leak");
    expect(JSON.stringify(data)).not.toContain("secret");
    expect(knowledgeQuery.select).toHaveBeenCalledWith(
      "id,title,knowledge_class,visibility,verified_status,risk_level,requires_human_verification,last_verified,next_review,source_system,updated_at",
    );
    expect(knowledgeQuery.eq).toHaveBeenCalledWith("active", true);
    expect(knowledgeQuery.neq).toHaveBeenCalledWith("visibility", "private");
    expect(knowledgeQuery.limit).toHaveBeenCalledWith(100);
  });

  it("fails closed on source errors and malformed metadata", async () => {
    const failedQuery = query({ data: null, error: { message: "permission denied" } });
    createServerSupabaseClient.mockResolvedValue({ schema: () => ({ from: () => failedQuery }) });
    await expect(loadKnowledgeDirectory()).rejects.toThrow(/permission denied/i);

    const malformedQuery = query({
      data: [{ id: "bad", title: "Bad", knowledge_class: "sop", visibility: "internal", verified_status: "verified", risk_level: "low", requires_human_verification: false, last_verified: null, next_review: null, source_system: null, updated_at: "bad-date" }],
      error: null,
    });
    createServerSupabaseClient.mockResolvedValue({ schema: () => ({ from: () => malformedQuery }) });
    await expect(loadKnowledgeDirectory()).rejects.toThrow(/knowledge directory payload/i);
  });
});
