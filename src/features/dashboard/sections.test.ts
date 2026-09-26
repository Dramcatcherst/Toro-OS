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

  test("reception and maintenance do not receive Money or Studio in the MVP", () => {
    for (const profile of ["reception", "maintenance"]) {
      const sections = resolveDashboardSections(profile);
      const keys = sections.map((section) => section.key);
      const implemented = sections
        .filter((section) => section.implemented)
        .map((section) => section.key);

      expect(keys).not.toContain("money");
      expect(keys).not.toContain("studio");
      expect(keys).not.toContain("systems");
      expect(implemented).toEqual(["today"]);
    }
  });

  test("systems profile gets Studio and technical Systems without finance leakage", () => {
    const sections = resolveDashboardSections("systems");
    const implemented = sections
      .filter((section) => section.implemented)
      .map((section) => section.key);

    expect(implemented).toEqual(["today", "studio", "systems"]);
    expect(sections.some((section) => section.key === "money")).toBe(false);
  });
});
