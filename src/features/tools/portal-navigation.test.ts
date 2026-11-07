import { describe, expect, it } from "vitest";
import { authorizedContext } from "./fixtures.test-utils";
import { portalNavigation } from "./portal-navigation";
describe("owner-approved navigation", () => {
  it("does not grant hotel shortcuts to anonymous, inactive, ambiguous or other-company contexts", () => {
    const context = authorizedContext();
    expect(portalNavigation(null)).toEqual([]);
    expect(portalNavigation({ ...context, requiresContextChoice: true })).toEqual([]);
    expect(portalNavigation({ ...context, orgId: "other" })).toEqual([]);
    expect(portalNavigation({ ...context, membership: { ...context.membership!, status: "offboarded" } })).toEqual([]);
  });
  it("only supplies fixed public navigation and preserves connector grants", () => {
    const context = authorizedContext();
    const before = JSON.stringify(context);
    const links = portalNavigation(context);
    expect(links.find(link => link.id === "PORTAL-KROSS-DASHBOARD")?.url).toBe("https://dreamcatcherhotel.krossbooking.com/rct/v3/dashboard");
    expect(links.find(link => link.id === "PORTAL-POS")?.url).toBe("https://dreamcatcherhotel.krossbooking.com/admin/pos");
    expect(links.every(link => Object.keys(link).sort().join() === "id,label,url" && new URL(link.url).protocol === "https:")).toBe(true);
    expect(JSON.stringify(context)).toBe(before);
  });
});
