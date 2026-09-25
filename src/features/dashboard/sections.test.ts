import { describe, expect, test } from "vitest";

import { resolveDashboardSections } from "./sections";

describe("TORO Dashboard section rollout", () => {
  test("owner sees the full contract but only MVP surfaces are marked implemented", () => {
    const sections = resolveDashboardSections("owner_executive");
    const state = Object.fromEntries(
      sections.map((section) => [section.key, section.implemented]),
    );

    expect(state.today).toBe(true);
    expect(state.money).toBe(true);
    expect(state.studio).toBe(true);
    expect(state.systems).toBe(true);

    expect(state.customers).toBe(false);
    expect(state.operations).toBe(false);
    expect(state.people).toBe(false);
    expect(state.growth).toBe(false);
    expect(state.legal_risk).toBe(false);
    expect(state.assets_spaces).toBe(false);
    expect(state.projects).toBe(false);
  });

  test("finance profile cannot see Studio and only implemented visible surfaces are actionable", () => {
    const sections = resolveDashboardSections("finance");

    expect(sections.some((section) => section.key === "studio")).toBe(false);
    expect(
      sections.filter((section) => section.implemented).map((section) => section.key),
    ).toEqual(["today", "money"]);
  });
});
