import { describe, expect, it } from "vitest";

import { recommendRoomFit } from "./room-fit";

const candidates = [
  {
    key: "room-25",
    kind: "room" as const,
    label: "#25 Suite premium cinema con cocina",
    capacity: 5,
    bestFor: ["Couples", "Honeymoon", "Families", "Premium"],
    kitchenType: "Private",
    premiumTier: "Signature",
    verified: true,
  },
  {
    key: "room-27",
    kind: "room" as const,
    label: "#27 Habitación King íntima con proyector",
    capacity: 2,
    bestFor: ["Couples", "Romance", "Privacy"],
    kitchenType: "No",
    premiumTier: "Premium",
    verified: true,
  },
  {
    key: "room-11",
    kind: "room" as const,
    label: "#11 Apartamento premium",
    capacity: 7,
    bestFor: ["Families", "Groups", "Long Stay", "Remote Work"],
    kitchenType: "Private",
    premiumTier: "Signature",
    verified: false,
  },
  {
    key: "villa-toro",
    kind: "villa" as const,
    label: "Villa Toro",
    capacity: 29,
    bestFor: ["Premium", "Groups", "Couples", "Retreats", "Families"],
    verified: true,
  },
];

describe("recommendRoomFit", () => {
  it("prefers a verified honeymoon fit without over-recommending a villa", () => {
    const result = recommendRoomFit(candidates, {
      guests: 2,
      purpose: "honeymoon",
      kitchen: false,
      tier: "premium",
    });

    expect(result[0]?.candidate.key).toBe("room-25");
    expect(result.some((item) => item.candidate.key === "room-11")).toBe(false);
  });

  it("prefers a villa for a large group", () => {
    const result = recommendRoomFit(candidates, {
      guests: 12,
      purpose: "group",
      kitchen: false,
      tier: "any",
    });

    expect(result[0]?.candidate.key).toBe("villa-toro");
  });

  it("returns no result for invalid guest count", () => {
    expect(
      recommendRoomFit(candidates, {
        guests: 0,
        purpose: "couple",
        kitchen: false,
        tier: "any",
      }),
    ).toEqual([]);
  });
});
