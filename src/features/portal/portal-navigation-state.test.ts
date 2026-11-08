import { expect, it } from "vitest";
import { focusPortalContent, mainPortalTab, portalTabUrl, readPortalTab, writePortalTab } from "./portal-navigation-state";

it("parses all eight prior URLs plus More while refusing repeated, unknown and denied hotel tabs", () => {
  for (const tab of ["home", "operations", "money", "people", "growth", "tools", "reports", "modules", "more"] as const) {
    expect(readPortalTab(`?tab=${tab}`, true)).toBe(tab);
  }
  expect(readPortalTab("?tab=operations", false)).toBe("home");
  expect(readPortalTab("?tab=operations&tab=home", true)).toBe("home");
  expect(readPortalTab("?tab=evil", true)).toBe("home");
  expect(mainPortalTab("reports")).toBe("more"); expect(mainPortalTab("operations")).toBe("operations");
});

it("keeps unrelated query parameters and changes the URL when returning from Operación to Hoy", () => {
  expect(portalTabUrl("home", "?tab=operations&view=compact")).toBe("/portal?tab=home&view=compact");
  expect(portalTabUrl("tools")).toBe("/portal?tab=tools");
});

it("writes distinct browser history entries and resolves prior entries consistently for back/forward", () => {
  const entries = ["/portal?tab=operations"]; let cursor = 0;
  const history = { pushState(_state: unknown, _unused: string, url?: string | URL | null) { entries.splice(cursor + 1); entries.push(String(url)); cursor++; } };
  writePortalTab(history, "home", "?tab=operations");
  writePortalTab(history, "money", "?tab=home");
  expect(entries).toEqual(["/portal?tab=operations", "/portal?tab=home", "/portal?tab=money"]);
  expect(readPortalTab(entries[--cursor].split("?")[1], true)).toBe("home");
  expect(readPortalTab(entries[--cursor].split("?")[1], true)).toBe("operations");
  expect(readPortalTab(entries[++cursor].split("?")[1], true)).toBe("home");
});
it("retains focus for primary-tab activation but focuses content for a shortcut", () => {
  const effects: string[] = [];
  const target = { focus() { effects.push("content focused"); } };
  focusPortalContent("primary", target, callback => callback());
  expect(effects).toEqual([]);
  focusPortalContent("shortcut", target, callback => callback());
  expect(effects).toEqual(["content focused"]);
});
