import { describe, expect, it } from "vitest";

import { buildOfficialKrossSearchUrl } from "./public-search-link";

describe("buildOfficialKrossSearchUrl", () => {
  it("builds the observed one-room Kross search pattern", () => {
    const result = buildOfficialKrossSearchUrl({
      from: "2026-10-10",
      to: "2026-10-12",
      adults: 2,
      children: 0,
      currency: "USD",
      lang: "en",
    });

    expect(result.issues).toEqual([]);
    expect(result.url).toContain("https://dreamcatcherhotel.kross.travel/book/step1?");
    expect(result.url).toContain("adults=2");
    expect(result.url).toContain("children=0");
    expect(result.url).toContain("rooms=1");
    expect(result.url).toContain("guests=2");
    expect(result.url).toContain("n_guests=2");
    expect(result.url).toContain("guests_rooms=2%2C0%3B");
    expect(result.url).toContain("from=2026-10-10");
    expect(result.url).toContain("to=2026-10-12");
    expect(result.url).toContain("currency=USD");
  });

  it("rejects invalid or reversed dates", () => {
    const result = buildOfficialKrossSearchUrl({
      from: "2026-10-12",
      to: "2026-10-10",
      adults: 2,
      children: 0,
    });

    expect(result.url).toBeNull();
    expect(result.issues).toContain("La salida debe ser posterior a la llegada.");
  });

  it("rejects invalid occupancy instead of coercing it", () => {
    const result = buildOfficialKrossSearchUrl({
      from: "2026-10-10",
      to: "2026-10-12",
      adults: 0,
      children: 9,
    });

    expect(result.url).toBeNull();
    expect(result.issues).toEqual(
      expect.arrayContaining([
        "Adultos debe estar entre 1 y 12.",
        "Niños debe estar entre 0 y 6.",
      ]),
    );
  });
});
