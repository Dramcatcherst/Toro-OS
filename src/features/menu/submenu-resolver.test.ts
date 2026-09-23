import { describe, expect, it } from "vitest";

import { resolveToroSubmenu, submenuIdForParent } from "./submenu-resolver";

describe("resolveToroSubmenu", () => {
  it("maps canonical parent keys to submenu ids", () => {
    expect(submenuIdForParent("reception", "quote_sell")).toBe("reception_quote");
    expect(submenuIdForParent("maintenance", "close_evidence")).toBe("maintenance_close");
    expect(submenuIdForParent("reception", "rooms_villas")).toBeNull();
  });

  it("returns only currently usable submenu items", () => {
    const menu = resolveToroSubmenu({
      profileId: "reception",
      parentKey: "quote_sell",
      capabilityStates: {
        "hospitality.quote": "BLOCKED",
        "guest.followup": "HIDDEN",
        "hospitality.recommend": "READ_ONLY",
        "pms.live_availability_price": "BLOCKED",
        "comms.guest_messages": "BLOCKED",
      },
    });

    expect(menu?.items).toHaveLength(1);
    expect(menu?.items[0]).toMatchObject({
      index: 1,
      key: "recommend_room",
      capability: "hospitality.recommend",
      state: "READ_ONLY",
    });
  });

  it("returns null when every child is blocked or hidden", () => {
    expect(
      resolveToroSubmenu({
        profileId: "owner_executive",
        parentKey: "money",
        capabilityStates: {
          "finance.obligations": "BLOCKED",
          "finance.collections": "BLOCKED",
          "finance.exceptions": "BLOCKED",
          "finance.export_reports": "HIDDEN",
        },
      }),
    ).toBeNull();
  });
});
